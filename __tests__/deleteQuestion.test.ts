import { type NextRequest, NextResponse } from "next/server";
import { DELETE } from "@/app/api/questions/delete/route";
import Question from "@/lib/model/Question";
import Bet from "@/lib/model/Bet";
import { connectDB } from "@/lib/db";
import { describe, beforeEach, it, expect, jest } from "@jest/globals";

jest.mock("@/lib/db", () => ({
  connectDB: jest.fn().mockResolvedValue(true as never),
}));

jest.mock("@/lib/model/Question", () => ({
  findById: jest.fn(),
  findByIdAndDelete: jest.fn(),
}));

jest.mock("@/lib/model/Bet", () => ({
  find: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((data, options) => ({
      data,
      ...options || {},
    })),
  },
}));

describe("DELETE /api/questions/delete", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should delete a question with no bets", async () => {
    const requestData = {
      questionId: "question123",
    };

    const request = {
      json: jest.fn().mockResolvedValue(requestData as never),
    } as unknown as NextRequest;

    const mockQuestion = { _id: "question123" };
    (Question.findById as jest.Mock).mockResolvedValue(mockQuestion as never);
    (Bet.find as jest.Mock).mockResolvedValue([] as never);
    (Question.findByIdAndDelete as jest.Mock).mockResolvedValue(true as never);

    await DELETE(request);

    expect(connectDB).toHaveBeenCalled();
    expect(Question.findById).toHaveBeenCalledWith("question123");
    expect(Bet.find).toHaveBeenCalledWith({ question: "question123" });
    expect(Question.findByIdAndDelete).toHaveBeenCalledWith("question123");
    expect(NextResponse.json).toHaveBeenCalledWith(
      { message: "Question deleted" },
      { status: 200 }
    );
  });

  it("should return 404 if question is not found", async () => {
    const requestData = {
      questionId: "nonexistent123",
    };

    const request = {
      json: jest.fn().mockResolvedValue(requestData as never),
    } as unknown as NextRequest;
    (Question.findById as jest.Mock).mockResolvedValue(null as never);

    await DELETE(request);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { message: "Question not found" },
      { status: 404 }
    );
  });

  it("should return 400 if question has bets", async () => {
    const requestData = {
      questionId: "question123",
    };

    const request = {
      json: jest.fn().mockResolvedValue(requestData as never),
    } as unknown as NextRequest;

    const mockQuestion = { _id: "question123" };
    const mockBets = [{ _id: "bet123" }];
    (Question.findById as jest.Mock).mockResolvedValue(mockQuestion as never);
    (Bet.find as jest.Mock).mockResolvedValue(mockBets as never);

    await DELETE(request);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { message: "Question has bets" },
      { status: 400 }
    );
  });

  it("should return 500 if an error occurs", async () => {
    const requestData = {
      questionId: "question123",
    };

    const request = {
      json: jest.fn().mockResolvedValue(requestData as never),
    } as unknown as NextRequest;

    const error = new Error("Database error");
    (Question.findById as jest.Mock).mockRejectedValue(error as never);

    jest.spyOn(console, "error").mockImplementation(() => {});

    await DELETE(request);

    expect(console.error).toHaveBeenCalledWith(
      "Error deleting question:",
      error
    );
    expect(NextResponse.json).toHaveBeenCalledWith(
      { message: "Error deleting question" },
      { status: 500 }
    );
  });
});
