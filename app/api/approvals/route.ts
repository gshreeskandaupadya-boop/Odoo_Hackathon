import { NextResponse } from "next/server";

import { db } from "@/src/lib/db";

export async function GET() {
  try {
    const approvals = await db.orm.public.Approval
      .where({ status: "PENDING" })
      .all();

    const approvalsWithDetails = await Promise.all(
      approvals.map(async (approval) => {
        const quotes = await db.orm.public.Quote
          .where({ id: approval.quoteId })
          .all();

        const quote = quotes[0];

        if (!quote) {
          return {
            ...approval,
            quote: null,
            customer: null,
            salesRep: null,
          };
        }

        const [customers, users] = await Promise.all([
          db.orm.public.Customer
            .where({ id: quote.customerId })
            .all(),

          db.orm.public.User
            .where({ id: quote.createdById })
            .all(),
        ]);

        return {
          ...approval,
          quote,
          customer: customers[0] ?? null,
          salesRep: users[0] ?? null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      approvals: approvalsWithDetails,
    });
  } catch (error) {
    console.error("Get approvals error:", error);

    return NextResponse.json(
      { error: "Failed to fetch approvals" },
      { status: 500 }
    );
  }
}