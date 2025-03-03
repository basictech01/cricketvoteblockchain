/* eslint-disable @typescript-eslint/no-unused-vars */
import { type NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Question from "@/lib/model/Question";
import Match from "@/lib/model/Match";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params;
    console.log("id is ", id);
    await connectDB();

    if (!id) {
      return NextResponse.json(
        { message: "Match ID is required" },
        { status: 400 }
      );
    }

    const match = await Match.findById(id.toString());
    if (!match) {
      return NextResponse.json({ message: "Match not found" }, { status: 404 });
    }

    const questions = await Question.find({ matchId: id });

    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
