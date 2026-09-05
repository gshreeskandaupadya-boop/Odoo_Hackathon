import { NextResponse } from "next/server";

import { db } from "@/backend/db";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const quoteId = Number(id);

    if (!Number.isInteger(quoteId) || quoteId <= 0) {
      return NextResponse.json(
        { error: "Invalid quote ID" },
        { status: 400 }
      );
    }

    const quotes = await db.orm.public.Quote
      .where({ id: quoteId })
      .all();

    const quote = quotes[0];

    if (!quote) {
      return NextResponse.json(
        { error: "Quote not found" },
        { status: 404 }
      );
    }

    const [customers, users, items, approvals, negotiations, orders] =
      await Promise.all([
        db.orm.public.Customer
          .where({ id: quote.customerId })
          .all(),

        db.orm.public.User
          .where({ id: quote.createdById })
          .all(),

        db.orm.public.QuoteItem
          .where({ quoteId: quote.id })
          .all(),

        db.orm.public.Approval
          .where({ quoteId: quote.id })
          .all(),

        db.orm.public.Negotiation
          .where({ quoteId: quote.id })
          .all(),

        db.orm.public.Order
          .where({ quoteId: quote.id })
          .all(),
      ]);

    const itemsWithProducts = await Promise.all(
      items.map(async (item) => {
        const products = await db.orm.public.Product
          .where({ id: item.productId })
          .all();

        return {
          ...item,
          product: products[0] ?? null,
        };
      })
    );

    const approvalsWithApprovers = await Promise.all(
      approvals.map(async (approval) => {
        if (!approval.approverId) {
          return {
            ...approval,
            approver: null,
          };
        }

        const approvers = await db.orm.public.User
          .where({ id: approval.approverId })
          .all();

        return {
          ...approval,
          approver: approvers[0] ?? null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      quote: {
        ...quote,
        customer: customers[0] ?? null,
        createdBy: users[0] ?? null,
        items: itemsWithProducts,
        approvals: approvalsWithApprovers,
        negotiations,
        order: orders[0] ?? null,
      },
    });
  } catch (error) {
    console.error("Get quote detail error:", error);

    return NextResponse.json(
      { error: "Failed to fetch quote details" },
      { status: 500 }
    );
  }
}