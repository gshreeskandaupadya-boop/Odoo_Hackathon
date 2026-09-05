import { NextResponse } from "next/server";

import { db } from "@/backend/db";

export async function GET() {
  try {
    const customers = await db.orm.public.Customer
      .orderBy((customer) => customer.createdAt.desc())
      .all();

    return NextResponse.json({
      success: true,
      customers,
    });
  } catch (error) {
    console.error("Get customers error:", error);

    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}
