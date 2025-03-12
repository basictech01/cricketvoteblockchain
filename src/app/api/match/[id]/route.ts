/* eslint-disable @typescript-eslint/no-unused-vars */
import Match from "@/lib/model/Match";
import Bet from "@/lib/model/Bet";
import User from "@/lib/model/User";
import Question from "@/lib/model/Question";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const match = await Match.findById(id);
    if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });

    const questions = await Question.find({ matchId: id });
    const bets = await Bet.find({ question: { $in: questions.map(q => q._id.toString()) } });
    const users = await User.find({ _id: { $in: bets.map(b => b.user) } });

    // Aggregate rewards per user
    const rewardsMap = new Map();
    bets.forEach((bet) => {
      const question = questions.find(q => q._id.toString() === bet.question);
      if (question?.answer === bet.option) {
        const userAddress = users.find(u => u._id.toString() === bet.user)?.address;
        if (userAddress) {
          rewardsMap.set(userAddress, (rewardsMap.get(userAddress) || 0) + 2);
        }
      }
    });

    const rewards = Array.from(rewardsMap.entries()).map(([user, reward]) => ({ user, reward }));

    return NextResponse.json({ merkleRoot: match.merkleRoot, rewards });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
