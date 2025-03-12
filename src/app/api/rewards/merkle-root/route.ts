import Match from "@/lib/model/Match";
import Bet from "@/lib/model/Bet";
import User from "@/lib/model/User";
import { NextResponse } from "next/server";
import { ethers } from "ethers";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";
import Question from "@/lib/model/Question";
const CONTRACT_ADDRESS = "0xaB56f0D19e3Df8f7940F29DE488ADdEeE898b478";
import TOKEN_ABI from "@/abis/BettingReward.json";
const RPC_URL = "https://rpc.ankr.com/eth_sepolia";
const PRIVATE_KEY = "8c5dfe5b62fbb3f96636b85ac7bba21bc821fd99d05c39d51a4f074d73cb75b2";

import mongoose from "mongoose";

function convertObjectIdToUint256(objectId: string): string {
    if (!mongoose.Types.ObjectId.isValid(objectId)) {
        throw new Error("Invalid MongoDB ObjectId");
    }
    const objectIdHex = new mongoose.Types.ObjectId(objectId).toHexString();
    const hash = ethers.keccak256("0x" + objectIdHex);
    return BigInt(hash).toString();
}

export async function POST(req: Request) {
    try {
        const { matchId } = await req.json();
        const match = await Match.findById(matchId);
        if (!match) {
            return NextResponse.json({ error: "Match not found" }, { status: 404 });
        }

        const questions = await Question.find({ matchId });

        // Fetch bets & users
        const bets = await Bet.find({ question: { $in: questions.map(question => question._id.toString()) } });
        const users = await User.find({ _id: { $in: bets.map(bet => bet.user) } });

        // Compute rewards (e.g., 2 tokens per correct bet)
        const rewards = bets.map((bet) => {

            const question = questions.find(q => q._id.toString() === bet.question);
            const correct = question?.answer === bet.option;


            return { user: users.find(u => u._id.toString() === bet.user)?.address, reward: correct ? 2 : 0 };
        }).filter(b => b.reward > 0);

        if (rewards.length === 0) {
            return NextResponse.json({ error: "No winners found" }, { status: 400 });
        }

        // Generate Merkle Tree
        const leaves = rewards.map(({ user, reward }) =>
            keccak256(ethers.solidityPacked(["address", "uint256"], [user, reward]))
        );
        const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
        const root = tree.getHexRoot();

        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, TOKEN_ABI, wallet);

        const tx = await contract.updateMerkleRoot(convertObjectIdToUint256(matchId), root);
        await tx.wait();

        match.merkleRoot = root;
        match.rewardsCount = rewards.length;
        await match.save();

        return NextResponse.json({ success: true, merkleRoot: root, rewardsCount: rewards.length });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
