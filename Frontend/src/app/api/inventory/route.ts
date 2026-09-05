import { NextResponse } from "next/server";
import { db } from "@/backend/db";

export async function GET() {
  try {
    const inventory = await db.orm.public.Inventory.all();
    const products = await db.orm.public.Product.all();
    const warehouses = await db.orm.public.Warehouse.all();

    const enriched = inventory.map((inv) => ({
      ...inv,
      product: products.find((p) => p.id === inv.productId) ?? null,
      warehouse: warehouses.find((w) => w.id === inv.warehouseId) ?? null,
      available: inv.quantity - inv.reserved,
    }));

    // Group by product for summary
    const productSummary = products.map((product) => {
      const stockEntries = enriched.filter((e) => e.productId === product.id);
      const totalQty = stockEntries.reduce((s, e) => s + e.quantity, 0);
      const totalReserved = stockEntries.reduce((s, e) => s + e.reserved, 0);
      const totalAvailable = totalQty - totalReserved;
      return {
        ...product,
        totalQty,
        totalReserved,
        totalAvailable,
        warehouses: stockEntries.map((e) => ({
          warehouseId: e.warehouseId,
          warehouseName: e.warehouse?.name ?? "Unknown",
          location: e.warehouse?.location ?? "",
          quantity: e.quantity,
          reserved: e.reserved,
          available: e.quantity - e.reserved,
        })),
      };
    });

    return NextResponse.json({ success: true, inventory: productSummary });
  } catch (error) {
    console.error("Inventory error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch inventory" }, { status: 500 });
  }
}