import { db } from "./db";
import { calculateDiscountRisk } from "./discount-engine";

export async function processApprovalForQuote(quoteId: number) {
  const quote = (await db.orm.public.Quote.where({ id: quoteId }).all())[0];
  if (!quote) throw new Error("Quote not found");
  const customer = (await db.orm.public.Customer.where({ id: quote.customerId }).all())[0];
  if (!customer) throw new Error("Customer not found");
  const items = await db.orm.public.QuoteItem.where({ quoteId }).all();
  const products = await Promise.all(items.map(async (item) => (await db.orm.public.Product.where({ id: item.productId }).all())[0]));

  let highestRisk: "LOW" | "MEDIUM" | "HIGH" = "LOW";
  let overallReason = "";
  for (const [index, item] of items.entries()) {
    const product = products[index];
    if (!product) continue;
    const result = calculateDiscountRisk({
      customerTier: customer.tier,
      requestedDiscountPct: item.discountPct,
      allowedDiscountPct: product.allowedDiscountPct,
      marginPct: ((item.unitPrice - product.costPrice) / item.unitPrice) * 100,
    });
    if (result.riskLevel === "HIGH") {
      highestRisk = "HIGH";
      overallReason = result.reason;
      break;
    }
    if (result.riskLevel === "MEDIUM") {
      highestRisk = "MEDIUM";
      overallReason = result.reason;
    }
  }

  const approvalRequired = highestRisk !== "LOW";
  const approvalLevel = highestRisk === "HIGH" ? "FINANCE" : highestRisk === "MEDIUM" ? "MANAGER" : null;
  await db.orm.public.Quote.where({ id: quoteId }).update({ riskLevel: highestRisk, riskReason: overallReason || null, status: approvalRequired ? "PENDING_APPROVAL" : "APPROVED" });
  if (approvalRequired) {
    await db.orm.public.Approval.create({ quoteId: quote.id, level: approvalLevel!, status: "PENDING", requestedDiscountPct: quote.discountPct, allowedDiscountPct: products[0]?.allowedDiscountPct || 0, riskLevel: highestRisk, reason: overallReason });
  }
  return { approvalRequired, highestRisk, approvalLevel };
}