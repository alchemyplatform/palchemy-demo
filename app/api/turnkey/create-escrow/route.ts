import { NextRequest, NextResponse } from "next/server";
import { createEscrowOrganization } from "@/lib/turnkey";
import { CreateEscrowRequest, CreateEscrowResponse } from "@/lib/types/turnkey";

export async function POST(request: NextRequest) {
  try {
    const body: CreateEscrowRequest = await request.json();

    // Call your Turnkey helper function
    const escrowOrganization: CreateEscrowResponse =
      await createEscrowOrganization(body);

    return NextResponse.json({
      success: true,
      data: escrowOrganization,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create escrow organization" },
      { status: 500 }
    );
  }
}
