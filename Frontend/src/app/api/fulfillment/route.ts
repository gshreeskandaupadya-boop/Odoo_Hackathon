import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/backend/db";
import { allocateInventory } from "@/backend/fulfillment-engine";

const fulfillmentSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = fulfillmentSchema.parse(body);

    const product = await db.orm.public.Product
      .where({ id: input.productId })
      .all();

    if (!product[0]) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const inventory = await db.orm.public.Inventory
      .where({ productId: input.productId })
      .all();

    const warehouses = await Promise.all(
      inventory.map(async (stock) => {
        const warehouse = await db.orm.public.Warehouse
          .where({ id: stock.warehouseId })
          .all();

        return {
          warehouseId: stock.warehouseId,
          warehouseName: warehouse[0]?.name ?? "Unknown Warehouse",
          availableQuantity: Math.max(
            0,
            stock.quantity - stock.reserved
          ),
        };
      })
    );

    const result = allocateInventory(
      input.quantity,
      warehouses
    );

    return NextResponse.json({
      success: true,
      product: {
        id: product[0].id,
        name: product[0].name,
      },
      fulfillment: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    console.error("Fulfillment error:", error);

    return NextResponse.json(
      { error: "Failed to calculate fulfillment" },
      { status: 500 }
    );
  }
}