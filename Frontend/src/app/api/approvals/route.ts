import { NextResponse } from "next/server";
import { db } from "@/backend/db";

export async function GET() {
  try {
    const approvals = await db.orm.public.Approval
      .orderBy((a) => a.createdAt.desc())
      .all();

    const enriched = await Promise.all(
      approvals.map(async (approval) => {
        const quotes = await db.orm.public.Quote.where({ id: approval.quoteId }).all();
        const quote = quotes[0];

        if (!quote) {
          return { ...approval, quote: null };
        }

        const [customers, users, approvers] = await Promise.all([
          db.orm.public.Customer.where({ id: quote.customerId }).all(),
          db.orm.public.User.where({ id: quote.createdById }).all(),
          approval.approverId
            ? db.orm.public.User.where({ id: approval.approverId }).all()
            : Promise.resolve([]),
        ]);

        return {
          ...approval,
          quote: {
            ...quote,
            customer: customers[0] ?? null,
            createdBy: users[0] ?? null,
          },
          approver: approvers[0] ?? null,
        };
      })
    );

    return NextResponse.json({ success: true, approvals: enriched });
  } catch (error) {
    console.error("Get approvals error:", error);
    return NextResponse.json({ error: "Failed to fetch approvals" }, { status: 500 });
  }
}