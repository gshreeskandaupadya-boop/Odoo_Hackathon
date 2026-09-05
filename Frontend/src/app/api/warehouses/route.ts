import { NextResponse } from "next/server";

import { db } from "@/backend/db";

export async function GET() {
  try {
    const warehouses = await db.orm.public.Warehouse
      .orderBy((warehouse) => warehouse.name.asc())
      .all();

    return NextResponse.json({
      success: true,
      warehouses,
    });
  } catch (error) {
    console.error("Get warehouses error:", error);

    return NextResponse.json(
      { error: "Failed to fetch warehouses" },
      { status: 500 }
    );
  }
}