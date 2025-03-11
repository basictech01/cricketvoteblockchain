import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { predictionId, address, transactionHash } = body

    if (!predictionId || !address || !transactionHash) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Verify the transaction on the blockchain
    // This would typically involve checking that the transaction exists and was successful
    // For simplicity, we'll skip this step in this example

    // Update the prediction as claimed in the database
    // In a real implementation, you would do something like:
    // await db.prediction.update({
    //   where: {
    //     id: predictionId,
    //     user: {
    //       address
    //     }
    //   },
    //   data: {
    //     claimed: true,
    //     claimedAt: new Date(),
    //     claimTransactionHash: transactionHash
    //   }
    // });

    return NextResponse.json({
      success: true,
      message: "Token claim recorded successfully",
    })
  } catch (error) {
    console.error("Error recording token claim:", error)
    return NextResponse.json({ success: false, error: "Failed to record token claim" }, { status: 500 })
  }
}

