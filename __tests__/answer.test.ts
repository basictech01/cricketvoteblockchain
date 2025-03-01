import { type NextRequest, NextResponse } from "next/server";
import { POST } from "@/app/api/questions/answer/route";
import Question from "@/lib/model/Question";
import { connectDB } from "@/lib/db";
import { describe, beforeEach, it, expect, jest } from "@jest/globals";

jest.mock("@/lib/db", () => ({
  connectDB: jest.fn().mockResolvedValue(true as never),
}));

jest.mock("@/lib/model/Question", () => ({
  findById: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((data, options) => ({
      data,
      ...options ||{} ,
    })),
  },
}));

describe("POST /api/questions/answer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should save the answer to a question", async () => {
    const requestData = {
      questionId: "question123",
      answer: "Correct Answer",
    };

    const request = {
      json: jest.fn().mockResolvedValue(requestData as never),
    } as unknown as NextRequest;

    const mockQuestion = {
      _id: "question123",
      save: jest.fn().mockResolvedValue(true as never),
    };
    (Question.findById as jest.Mock).mockResolvedValue(mockQuestion as never);

    await POST(request);

    expect(connectDB).toHaveBeenCalled();
    expect(Question.findById).toHaveBeenCalledWith("question123");
    expect(mockQuestion.save).toHaveBeenCalled();
    expect(NextResponse.json).toHaveBeenCalledWith(
      { message: "Answer saved" },
      { status: 200 }
    );
  });

  it("should return 404 if question is not found", async () => {
    const requestData = {
      questionId: "nonexistent123",
      answer: "Correct Answer",
    };

    const request = {
      json: jest.fn().mockResolvedValue(requestData as never),
    } as unknown as NextRequest;
    (Question.findById as jest.Mock).mockResolvedValue(null as never);

    await POST(request);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { message: "Question not found" },
      { status: 404 }
    );
  });

  it("should return 500 if an error occurs", async () => {
    const requestData = {
      questionId: "question123",
      answer: "Correct Answer",
    };

    const request = {
      json: jest.fn().mockResolvedValue(requestData as never),
    } as unknown as NextRequest;

    const error = new Error("Database error");
    (Question.findById as jest.Mock).mockRejectedValue(error as never);

    jest.spyOn(console, "error").mockImplementation(() => {});

    await POST(request);

    expect(console.error).toHaveBeenCalledWith("Error saving answer:", error);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { message: "Error saving answer" },
      { status: 500 }
    );
  });
});
