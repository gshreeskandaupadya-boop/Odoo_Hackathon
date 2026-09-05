import { db } from "./db";
import { processApprovalForQuote } from "./approval-engine";

export async function submitCounterOffer(quoteId: number, customerId: number, proposedDiscountPct: number, message?: string) {
  const quote = (await db.orm.public.Quote.where({ id: quoteId }).all())[0];
  if (!quote) throw new Error("Quote not found");
  if (quote.customerId !== customerId) throw new Error("Unauthorized");

  await db.orm.public.Negotiation.create({ quoteId, createdById: customerId, proposedDiscountPct, proposedTotal: Math.floor(quote.subtotal * (1 - proposedDiscountPct / 100)), message, status: "OPEN" });
  await db.orm.public.Quote.where({ id: quoteId }).update({ discountPct: proposedDiscountPct, status: "NEGOTIATION" });
  const items = await db.orm.public.QuoteItem.where({ quoteId }).all();
  for (const item of items) {
    await db.orm.public.QuoteItem.where({ id: item.id }).update({ discountPct: proposedDiscountPct, lineTotal: Math.floor(item.unitPrice * item.quantity * (1 - proposedDiscountPct / 100)) });
  }
  return processApprovalForQuote(quoteId);
}