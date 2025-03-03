import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Question from "@/lib/model/Question";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { matchId } = await request.json();
    // Fetch all matches
    const questions = await Question.find({ matchId: matchId });

    return NextResponse.json({ questions }, { status: 200 });
  } catch (error) {
    console.error("Error fetching matches and questions:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
