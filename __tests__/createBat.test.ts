import { type NextRequest, NextResponse } from "next/server"
import { POST } from "@/app/api/bet/create/route"
import Bet from "@/lib/model/Bet"
import Question from "@/lib/model/Question"
import User from "@/lib/model/User"
import { connectDB } from "@/lib/db"
import { describe, beforeEach, it, expect, jest } from "@jest/globals"

// Mock the dependencies
jest.mock("@/lib/db", () => ({
  connectDB: jest.fn().mockResolvedValue(true as never),
}))

jest.mock("@/lib/model/Bet", () => ({
  create: jest.fn(),
}))

jest.mock("@/lib/model/Question", () => ({
  findById: jest.fn(),
}))

jest.mock("@/lib/model/User", () => ({
  findOne: jest.fn(),
}))

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((data, options) => ({
      data,
      ...(options || {}),
    })),
  },
}))

describe("POST /api/bets/create", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should create a new bet", async () => {
    const requestData = {
      questionId: "question123",
      option: "Option 1",
      userEmail: "user@example.com",
    }

    const request = {
      json: jest.fn().mockResolvedValue(requestData as never) as jest.MockedFunction<() => Promise<typeof requestData>>,
    } as unknown as NextRequest

    const mockUser = { _id: "user123" }
    const mockQuestion = { _id: "question123" }
    const mockBet = { _id: "bet123", ...requestData }
    ;(User.findOne as jest.Mock).mockResolvedValue(mockUser as never)
    ;(Question.findById as jest.Mock).mockResolvedValue(mockQuestion as never)
    ;(Bet.create as jest.Mock).mockResolvedValue(mockBet as never)

    await POST(request)

    expect(connectDB).toHaveBeenCalled()
    expect(User.findOne).toHaveBeenCalledWith({ email: "user@example.com" })
    expect(Question.findById).toHaveBeenCalledWith("question123")
    expect(Bet.create).toHaveBeenCalledWith({
      question: "question123",
      user: "user123",
      option: "Option 1",
    })
    expect(NextResponse.json).toHaveBeenCalledWith({ bet: mockBet, message: "Bet created" }, { status: 201 })
  })

  it("should return 400 if user email is missing", async () => {
    const requestData = {
      questionId: "question123",
      option: "Option 1",
    }

    const request = {
      json: jest.fn().mockResolvedValue(requestData as never),
    } as unknown as NextRequest;

    await POST(request)

    expect(NextResponse.json).toHaveBeenCalledWith({ message: "User email is required" }, { status: 400 })
  })

  it("should return 404 if user is not found", async () => {
    const requestData = {
      questionId: "question123",
      option: "Option 1",
      userEmail: "nonexistent@example.com",
    }

    const request = {
      json: jest.fn().mockResolvedValue(requestData as never),
    } as unknown as NextRequest
    ;(User.findOne as jest.Mock).mockResolvedValue(null as never)

     await POST(request)

    expect(NextResponse.json).toHaveBeenCalledWith({ message: "User not found" }, { status: 404 })
  })

  it("should return 404 if question is not found", async () => {
    const requestData = {
      questionId: "nonexistent123",
      option: "Option 1",
      userEmail: "user@example.com",
    }

    const request = {
      json: jest.fn().mockResolvedValue(requestData as never),
    } as unknown as NextRequest
    ;(User.findOne as jest.Mock).mockResolvedValue({ _id: "user123" } as never)
    ;(Question.findById as jest.Mock).mockResolvedValue(null as never)

    await POST(request)

    expect(NextResponse.json).toHaveBeenCalledWith({ message: "Question not found" }, { status: 404 })
  })

  it("should return 500 if an error occurs", async () => {
    const requestData = {
      questionId: "question123",
      option: "Option 1",
      userEmail: "user@example.com",
    }

    const request = {
      json: jest.fn().mockResolvedValue(requestData as never),
    } as unknown as NextRequest

    const error = new Error("Database error")
    ;(User.findOne as jest.Mock).mockRejectedValue(error as never)

    jest.spyOn(console, "error").mockImplementation(() => {})

     await POST(request)

    expect(console.error).toHaveBeenCalledWith("Error creating bet:", error)
    expect(NextResponse.json).toHaveBeenCalledWith({ message: "Error creating bet" }, { status: 500 })
  })
})

