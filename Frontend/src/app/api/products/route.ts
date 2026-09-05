import { NextResponse } from "next/server";

import { db } from "@/backend/db";

export async function GET() {
  try {
    const products = await db.orm.public.Product
      .orderBy((product) => product.name.asc())
      .all();

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Get products error:", error);

    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}