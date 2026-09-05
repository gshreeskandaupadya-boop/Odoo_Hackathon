import { NextResponse } from "next/server";

import { db } from "@/src/lib/db";

export async function GET() {
  try {
    const inventory = await db.orm.public.Inventory.all();

    const inventoryWithDetails = await Promise.all(
      inventory.map(async (item) => {
        const [products, warehouses] = await Promise.all([
          db.orm.public.Product
            .where({ id: item.productId })
            .all(),

          db.orm.public.Warehouse
            .where({ id: item.warehouseId })
            .all(),
        ]);

        return {
          ...item,
          availableQuantity: Math.max(
            0,
            item.quantity - item.reserved
          ),
          product: products[0] ?? null,
          warehouse: warehouses[0] ?? null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      inventory: inventoryWithDetails,
    });
  } catch (error) {
    console.error("Get inventory error:", error);

    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}