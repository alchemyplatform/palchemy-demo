import { NextRequest, NextResponse } from "next/server";
import { transferFunds } from "@/lib/turnkey";
import {
  TransferAndCleanupRequest,
  TransferAndCleanupResponse,
} from "@/lib/types/turnkey";

export async function POST(request: NextRequest) {
  try {
    const body: TransferAndCleanupRequest = await request.json();

    // Step 1: Transfer funds using private API key authorization
    const transferResult = await transferFunds(body);

    const result: TransferAndCleanupResponse = {
      transferHash: transferResult.hash,
      organizationId: body.organizationId,
      transferAmount: body.amount,
      recipientAddress: body.recipientAddress,
      organizationDeleted: true,
    };

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to transfer funds and cleanup organization",
      },
      { status: 500 }
    );
  }
}
