import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/src/lib/db";
import { calculateDiscountRisk } from "@/src/services/discount-engine";

const negotiationSchema = z.object({
  quoteId: z.number().int().positive(),
  createdById: z.number().int().positive(),
  proposedDiscountPct: z.number().min(0).max(100),
  message: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = negotiationSchema.parse(body);

    const quotes = await db.orm.public.Quote
      .where({ id: input.quoteId })
      .all();

    const quote = quotes[0];

    if (!quote) {
      return NextResponse.json(
        { error: "Quote not found" },
        { status: 404 }
      );
    }

    const customers = await db.orm.public.Customer
      .where({ id: quote.customerId })
      .all();

    const customer = customers[0];

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    const users = await db.orm.public.User
      .where({ id: input.createdById })
      .all();

    if (!users[0]) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const items = await db.orm.public.QuoteItem
      .where({ quoteId: quote.id })
      .all();

    if (items.length === 0) {
      return NextResponse.json(
        { error: "Quote has no items" },
        { status: 400 }
      );
    }

    const products = await Promise.all(
      items.map(async (item) => {
        const result = await db.orm.public.Product
          .where({ id: item.productId })
          .all();

        return {
          item,
          product: result[0],
        };
      })
    );

    const validProducts = products.filter(
      ({ product }) => product !== undefined
    );

    const allowedDiscountPct = Math.max(
      ...validProducts.map(
        ({ product }) => product!.allowedDiscountPct
      )
    );

    const proposedDiscountAmount =
      Math.round(
        quote.subtotal * (input.proposedDiscountPct / 100)
      );

    const proposedTotal =
      quote.subtotal - proposedDiscountAmount;

    const costTotal = validProducts.reduce(
      (sum, { item, product }) =>
        sum + product!.costPrice * item.quantity,
      0
    );

    const marginAmount = proposedTotal - costTotal;

    const marginPct =
      proposedTotal === 0
        ? 0
        : (marginAmount / proposedTotal) * 100;

    const risk = calculateDiscountRisk({
      customerTier: customer.tier,
      requestedDiscountPct: input.proposedDiscountPct,
      allowedDiscountPct,
      marginPct,
    });

    const negotiation =
      await db.orm.public.Negotiation.create({
        quoteId: quote.id,
        createdById: input.createdById,
        proposedDiscountPct: Math.round(
          input.proposedDiscountPct
        ),
        proposedTotal,
        message: input.message,
        status: "OPEN",
      });

    if (risk.approvalRequired) {
      await db.orm.public.Approval.create({
        quoteId: quote.id,
        level: risk.approvalLevel!,
        status: "PENDING",
        requestedDiscountPct: Math.round(
          input.proposedDiscountPct
        ),
        allowedDiscountPct,
        riskLevel: risk.riskLevel,
        reason: `Customer counter-offer: ${risk.reason}`,
        round: 2,
      });
    }

    return NextResponse.json(
      {
        success: true,
        negotiation,
        risk,
        proposedTotal,
        approvalRequired: risk.approvalRequired,
      },
      { status: 201 }
    );
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

    console.error("Negotiation error:", error);

    return NextResponse.json(
      { error: "Failed to create negotiation" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const negotiations = await db.orm.public.Negotiation
      .orderBy((negotiation) => negotiation.createdAt.desc())
      .all();

    const negotiationsWithDetails = await Promise.all(
      negotiations.map(async (negotiation) => {
        const [quotes, users] = await Promise.all([
          db.orm.public.Quote
            .where({ id: negotiation.quoteId })
            .all(),

          db.orm.public.User
            .where({ id: negotiation.createdById })
            .all(),
        ]);

        const quote = quotes[0];

        let customer = null;

        if (quote) {
          const customers = await db.orm.public.Customer
            .where({ id: quote.customerId })
            .all();

          customer = customers[0] ?? null;
        }

        return {
          ...negotiation,
          quote: quote ?? null,
          customer,
          createdBy: users[0] ?? null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      negotiations: negotiationsWithDetails,
    });
  } catch (error) {
    console.error("Get negotiations error:", error);

    return NextResponse.json(
      { error: "Failed to fetch negotiations" },
      { status: 500 }
    );
  }
}