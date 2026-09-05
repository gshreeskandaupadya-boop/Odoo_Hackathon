import { NextResponse } from "next/server";
import { db } from "@/backend/db";
import { requireSession, sessionUserId } from "@/backend/session";

export async function POST(request: Request) {
  try {
    const auth = await requireSession();
    if (auth.response) return auth.response;
    const actorId = sessionUserId(auth.session!);
    if (!actorId) {
      return NextResponse.json({ error: "Invalid session." }, { status: 401 });
    }

    const body = await request.json();
    const { quoteId, proposedDiscountPct, message } = body;

    if (!quoteId || proposedDiscountPct === undefined) {
      return NextResponse.json(
        { error: "quoteId and proposedDiscountPct are required." },
        { status: 400 }
      );
    }

    const quotes = await db.orm.public.Quote.where({ id: Number(quoteId) }).all();
    const quote = quotes[0];

    if (!quote) {
      return NextResponse.json({ error: "Quote not found." }, { status: 404 });
    }

    const proposedTotal = Math.floor(quote.subtotal * (1 - Number(proposedDiscountPct) / 100));

    // Create the negotiation record
    const negotiation = await db.orm.public.Negotiation.create({
      quoteId: quote.id,
      createdById: actorId,
      proposedDiscountPct: Number(proposedDiscountPct),
      proposedTotal,
      message: message ?? null,
      status: "OPEN",
    });

    // Update quote items with the new discount
    const items = await db.orm.public.QuoteItem.where({ quoteId: quote.id }).all();
    for (const item of items) {
      await db.orm.public.QuoteItem.where({ id: item.id }).update({
        discountPct: Number(proposedDiscountPct),
        lineTotal: Math.floor(item.unitPrice * item.quantity * (1 - Number(proposedDiscountPct) / 100)),
      });
    }

    // Re-run the discount engine
    const { calculateDiscountRisk } = await import("@/backend/discount-engine");
    const customers = await db.orm.public.Customer.where({ id: quote.customerId }).all();
    const customer = customers[0];

    const products = await Promise.all(
      items.map(async (item) => {
        const p = await db.orm.public.Product.where({ id: item.productId }).all();
        return p[0];
      })
    );

    const allowedDiscountPct = Math.max(...products.filter(Boolean).map((p) => p!.allowedDiscountPct));

    const totalCost = items.reduce((sum, item, i) => {
      const product = products[i];
      return sum + (product ? item.quantity * product.costPrice : 0);
    }, 0);

    const marginPct = proposedTotal > 0 ? ((proposedTotal - totalCost) / proposedTotal) * 100 : 0;

    const risk = calculateDiscountRisk({
      customerTier: customer?.tier ?? "STANDARD",
      requestedDiscountPct: Number(proposedDiscountPct),
      allowedDiscountPct,
      marginPct,
    });

    const discountAmount = Math.floor(quote.subtotal * Number(proposedDiscountPct) / 100);
    const marginAmount = proposedTotal - totalCost;

    // Update quote
    await db.orm.public.Quote.where({ id: quote.id }).update({
      discountPct: Number(proposedDiscountPct),
      discountAmount,
      totalAmount: proposedTotal,
      marginAmount,
      riskLevel: risk.riskLevel,
      riskReason: risk.reason,
      status: risk.approvalRequired ? "PENDING_APPROVAL" : "APPROVED",
    });

    // Create a new approval round if needed
    if (risk.approvalRequired) {
      // Find latest approval round
      const existingApprovals = await db.orm.public.Approval.where({ quoteId: quote.id }).all();
      const latestRound = existingApprovals.length > 0
        ? Math.max(...existingApprovals.map((a) => a.round))
        : 0;

      await db.orm.public.Approval.create({
        quoteId: quote.id,
        approverId: null,
        level: risk.approvalLevel!,
        status: "PENDING",
        requestedDiscountPct: Number(proposedDiscountPct),
        allowedDiscountPct,
        riskLevel: risk.riskLevel,
        reason: risk.reason,
        round: latestRound + 1,
      });
    }

    return NextResponse.json({
      success: true,
      negotiation,
      risk: {
        riskLevel: risk.riskLevel,
        approvalRequired: risk.approvalRequired,
        approvalLevel: risk.approvalLevel,
      },
    });
  } catch (error) {
    console.error("Negotiation error:", error);
    return NextResponse.json(
      { error: "Failed to submit counter-offer" },
      { status: 500 }
    );
  }
}