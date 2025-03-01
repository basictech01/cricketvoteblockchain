/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { POST } from "@/app/api/questions/create/route";
import Question from "@/lib/model/Question";
import { connectDB } from "@/lib/db";
// import { describe, beforeEach, it, expect, jest } from "@jest/globals";

// Mock the dependencies
jest.mock("@/lib/db", () => ({
  connectDB: jest.fn().mockResolvedValue(true),
}));

jest.mock("@/lib/model/Question", () => ({
  create: jest.fn(),
  __esModule: true,
  default: {
    create: jest.fn(),
  },
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((data, options) => ({
      data,
      ...options,
    })),
  },
}));

describe("POST /api/questions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a new question", async () => {
    // Mock request data
    const requestData = {
      question: "Test question?",
      options: ["Option 1", "Option 2", "Option 3"],
    };

    // Mock the request
    const request = {
      json: jest.fn().mockResolvedValue(requestData),
      cookies: {},
      nextUrl: {},
      page: {},
      ua: {},
      headers: new Headers(),
      method: 'POST',
      url: 'http://localhost/api/questions',
    } as unknown as NextRequest;

    // Mock the created question
    const createdQuestion = {
      _id: "some-id",
      ...requestData,
      isActive: true,
      answer: null,
      closedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Set up the mock implementation
    (Question.create as jest.Mock).mockResolvedValue(createdQuestion);

    // Call the handler
    const response = await POST(request);

    // Assertions
    expect(connectDB).toHaveBeenCalled();
    expect(Question.create).toHaveBeenCalledWith(requestData);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { question: createdQuestion },
      { status: 201 }
    );
    expect(response).toEqual({
      data: { question: createdQuestion },
      status: 201,
    });
  });

  it("should return 400 if question or options are missing", async () => {
    // Mock invalid request data
    const requestData = {
      question: "Test question?",
      // Missing options
    };

    // Mock the request
    const request = {
      json: jest.fn().mockResolvedValue(requestData),
      cookies: {},
      nextUrl: {},
      page: {},
      ua: {},
      headers: new Headers(),
      method: 'POST',
      url: 'http://localhost/api/questions',
    } as unknown as NextRequest;

    // Call the handler
    const response = await POST(request);

    // Assertions
    expect(connectDB).not.toHaveBeenCalled();
    expect(Question.create).not.toHaveBeenCalled();
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Question and options are required" },
      { status: 400 }
    );
  });

  it("should return 500 if an error occurs", async () => {
    // Mock request data
    const requestData = {
      question: "Test question?",
      options: ["Option 1", "Option 2", "Option 3"],
    };

    // Mock the request
    const request = {
      json: jest.fn().mockResolvedValue(requestData),
      cookies: {},
      nextUrl: {},
      page: {},
      ua: {},
      headers: new Headers(),
      method: 'POST',
      url: 'http://localhost/api/questions',
    } as unknown as NextRequest;

    // Mock an error during creation
    const error = new Error("Database error");
    (Question.create as jest.Mock).mockRejectedValue(error);

    // Spy on console.error
    jest.spyOn(console, "error").mockImplementation(() => {});

    // Call the handler
    const response = await POST(request);

    // Assertions
    expect(connectDB).toHaveBeenCalled();
    expect(Question.create).toHaveBeenCalledWith(requestData);
    expect(console.error).toHaveBeenCalledWith(
      "Error creating question:",
      error
    );
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Failed to create question" },
      { status: 500 }
    );
  });
});
