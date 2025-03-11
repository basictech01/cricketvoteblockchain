import { type NextRequest, NextResponse } from "next/server"
import { MerkleTree, type MerkleLeaf, findLeafIndex } from "@/lib/merkle"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const predictionId = searchParams.get("predictionId")
    const address = searchParams.get("address")

    if (!predictionId || !address) {
      return NextResponse.json({ success: false, error: "Missing predictionId or address" }, { status: 400 })
    }

    // Get all claimable predictions
    const claimableLeaves = await getClaimableLeaves()

    // Build the Merkle tree
    const merkleTree = new MerkleTree(claimableLeaves)

    // Find the leaf index for this prediction
    const leafIndex = findLeafIndex(merkleTree, claimableLeaves, address, predictionId)

    if (leafIndex === -1) {
      return NextResponse.json({ success: false, error: "Prediction not found or not claimable" }, { status: 404 })
    }

    // Generate the proof
    const proof = merkleTree.getProof(leafIndex)

    return NextResponse.json({
      success: true,
      proof,
      root: merkleTree.getRoot(),
      leaf: claimableLeaves[leafIndex],
    })
  } catch (error) {
    console.error("Error generating Merkle proof:", error)
    return NextResponse.json({ success: false, error: "Failed to generate Merkle proof" }, { status: 500 })
  }
}

// Helper function to get all claimable predictions
async function getClaimableLeaves(): Promise<MerkleLeaf[]> {
  // In a real implementation, you would fetch this from your database
  // This is a simplified example

  // Mock data for demonstration
  const mockLeaves: MerkleLeaf[] = [
    { address: "0x123...", predictionId: "pred1", amount: 1 },
    { address: "0x456...", predictionId: "pred2", amount: 1 },
    { address: "0x789...", predictionId: "pred3", amount: 1 },
    // Add more leaves as needed
  ]

  // In a real implementation, you would do something like:
  // const predictions = await db.prediction.findMany({
  //   where: {
  //     status: 'won',
  //     claimed: false
  //   },
  //   include: {
  //     user: true
  //   }
  // });
  //
  // return predictions.map(prediction => ({
  //   address: prediction.user.address,
  //   predictionId: prediction.id,
  //   amount: 1 // Or whatever amount you want to award
  // }));

  return mockLeaves
}

