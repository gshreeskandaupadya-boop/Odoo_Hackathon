import { NextResponse } from "next/server";

import { db } from "@/src/lib/db";

export async function GET() {
  try {
    const approvals = await db.orm.public.Approval
      .where({ status: "PENDING" })
      .all();

    return NextResponse.json({
      success: true,
      approvals,
    });
  } catch (error) {
    console.error("Get approvals error:", error);

    return NextResponse.json(
      { error: "Failed to fetch approvals" },
      { status: 500 }
    );
  }
}