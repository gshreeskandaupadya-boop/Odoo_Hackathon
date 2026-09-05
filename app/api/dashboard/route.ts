import { NextResponse } from "next/server";

import { db } from "@/src/lib/db";

export async function GET() {
  try {
    const [
      quotes,
      approvals,
      orders,
      products,
      inventory,
    ] = await Promise.all([
      db.orm.public.Quote.all(),
      db.orm.public.Approval.all(),
      db.orm.public.Order.all(),
      db.orm.public.Product.all(),
      db.orm.public.Inventory.all(),
    ]);

    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    const pendingApprovals = approvals.filter(
      (approval) => approval.status === "PENDING"
    ).length;

    const highRiskQuotes = quotes.filter(
      (quote) => quote.riskLevel === "HIGH"
    ).length;

    const approvedQuotes = quotes.filter(
      (quote) => quote.status === "APPROVED"
    ).length;

    const orderedQuotes = quotes.filter(
      (quote) => quote.status === "ORDERED"
    ).length;

    const totalInventory = inventory.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    const reservedInventory = inventory.reduce(
      (sum, item) => sum + item.reserved,
      0
    );

    return NextResponse.json({
      success: true,
      metrics: {
        totalQuotes: quotes.length,
        pendingApprovals,
        approvedQuotes,
        orderedQuotes,
        totalOrders: orders.length,
        totalRevenue,
        highRiskQuotes,
        totalInventory,
        reservedInventory,
        activeProducts: products.filter(
          (product) => product.active
        ).length,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    return NextResponse.json(
      { error: "Failed to load dashboard metrics" },
      { status: 500 }
    );
  }
}