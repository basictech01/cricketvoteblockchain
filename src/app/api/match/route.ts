import Match from "@/lib/model/Match"
import Bet from "@/lib/model/Bet"
import User from "@/lib/model/User"
import Question from "@/lib/model/Question"
import { type NextRequest, NextResponse } from "next/server"
import { MerkleTree } from "merkletreejs"
import keccak256 from "keccak256"
import { ethers } from "ethers"

// Helper function to create a leaf node exactly as the contract does
function createLeaf(address: string, amount: number): Buffer {
  // Ensure address is checksummed
  const checksummedAddress = ethers.getAddress(address)

  // Pack exactly as Solidity's abi.encodePacked(address, uint256)
  const packed = ethers.solidityPacked(["address", "uint256"], [checksummedAddress, amount])

  // Hash it with keccak256
  return keccak256(packed)
}

export async function POST(req: NextRequest) {
  try {
    const { id, address } = await req.json()

    if (!id || !address) {
      return NextResponse.json({ error: "Match ID and address are required" }, { status: 400 })
    }

    const match = await Match.findById(id)
    if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 })

    const questions = await Question.find({ matchId: id })
    const bets = await Bet.find({ question: { $in: questions.map((q) => q._id.toString()) } })
    const users = await User.find({ _id: { $in: bets.map((b) => b.user) } })

    // Aggregate rewards per user
    const rewardsMap = new Map<string, number>()

    bets.forEach((bet) => {
      const question = questions.find((q) => q._id.toString() === bet.question)
      if (question?.answer === bet.option) {
        const user = users.find((u) => u._id.toString() === bet.user)
        if (user?.address) {
          const normalizedAddress = user.address.toLowerCase()
          rewardsMap.set(normalizedAddress, (rewardsMap.get(normalizedAddress) || 0) + 2)
        }
      }
    })

    const rewards = Array.from(rewardsMap, ([user, reward]) => ({
      user,
      reward,
    }))

    // If no rewards, return empty data
    if (rewards.length === 0) {
      return NextResponse.json({
        merkleRoot: "0x0000000000000000000000000000000000000000000000000000000000000000",
        rewards: [],
        proof: [],
      })
    }

    // Create leaves using our helper function
    const leaves = rewards.map(({ user, reward }) => createLeaf(user, reward))

    // Create the Merkle tree
    // Important: Use the same sorting and hashing as OpenZeppelin's implementation
    const tree = new MerkleTree(leaves, keccak256, {
      sortPairs: true,
      hashLeaves: false, // Don't hash leaves again, we already did that
    })

    const merkleRoot = tree.getHexRoot()

    // Find user's reward
    const normalizedRequestAddress = address.toLowerCase()
    const userReward = rewards.find((r) => r.user.toLowerCase() === normalizedRequestAddress)

    let proof: string[] = []

    if (userReward) {
      // Create the leaf for this specific user
      const leaf = createLeaf(userReward.user, userReward.reward)

      // Get the proof
      proof = tree.getHexProof(leaf)

      console.log("User address:", ethers.getAddress(userReward.user))
      console.log("User reward:", userReward.reward)
      console.log("Generated leaf:", "0x" + leaf.toString("hex"))
      console.log("Merkle root:", merkleRoot)
      console.log("Proof:", proof)

      // Verify the proof locally to ensure it's correct
      const isValid = tree.verify(proof, leaf, merkleRoot)
      console.log("Proof verification (local):", isValid)

      if (!isValid) {
        console.error("WARNING: Proof verification failed locally!")
      }

      // Special case: If there's only one leaf, the proof will be empty
      if (leaves.length === 1) {
        console.log("Only one reward entry - empty proof is expected and valid")
      }
    } else {
      console.log("No reward found for address:", address)
    }

    return NextResponse.json({
      merkleRoot,
      rewards,
      proof,
    })
  } catch (error) {
    console.error("Error generating Merkle proof:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

