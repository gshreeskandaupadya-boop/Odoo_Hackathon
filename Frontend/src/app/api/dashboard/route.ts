import { NextResponse } from "next/server";
import { db } from "@/backend/db";

export async function GET() {
  try {
    const [quotes, approvals, orders] = await Promise.all([
      db.orm.public.Quote.orderBy((q) => q.createdAt.desc()).all(),
      db.orm.public.Approval.where({ status: "PENDING" }).all(),
      db.orm.public.Order.orderBy((o) => o.createdAt.desc()).all(),
    ]);

    const totalQuotes = quotes.length;
    const pendingApprovals = approvals.length;
    const approvedQuotes = quotes.filter((q) => q.status === "APPROVED" || q.status === "ORDERED").length;
    const totalOrders = orders.length;

    // Get recent quotes with customers
    const recentQuotes = await Promise.all(
      quotes.slice(0, 5).map(async (quote) => {
        const customers = await db.orm.public.Customer.where({ id: quote.customerId }).all();
        return { ...quote, customer: customers[0] ?? null };
      })
    );

    // Pipeline breakdown
    const pipeline = {
      DRAFT: quotes.filter((q) => q.status === "DRAFT").length,
      PENDING_APPROVAL: quotes.filter((q) => q.status === "PENDING_APPROVAL").length,
      APPROVED: quotes.filter((q) => q.status === "APPROVED").length,
      NEGOTIATION: quotes.filter((q) => q.status === "NEGOTIATION").length,
      ORDERED: quotes.filter((q) => q.status === "ORDERED").length,
      REJECTED: quotes.filter((q) => q.status === "REJECTED").length,
    };

    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

    return NextResponse.json({
      success: true,
      stats: {
        totalQuotes,
        pendingApprovals,
        approvedQuotes,
        totalOrders,
        totalRevenue,
      },
      pipeline,
      recentQuotes,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ success: false, error: "Failed to load dashboard" }, { status: 500 });
  }
}