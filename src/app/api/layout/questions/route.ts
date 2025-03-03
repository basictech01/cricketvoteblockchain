import { type NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Question from "@/lib/model/Question";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { matchId } = await request.json();

    if (!matchId) {
      return NextResponse.json(
        { message: "Match ID is required" },
        { status: 400 }
      );
    }

    // Fetch questions for the specific match
    const questions = await Question.find({ matchId: matchId });

    return NextResponse.json({ questions }, { status: 200 });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
