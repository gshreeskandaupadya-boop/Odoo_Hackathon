import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/src/lib/db";
import { calculateDiscountRisk } from "@/src/services/discount-engine";

const quoteSchema = z.object({
  customerId: z.number().int().positive(),
  createdById: z.number().int().positive(),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().positive(),
        discountPct: z.number().min(0).max(100),
      })
    )
    .min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = quoteSchema.parse(body);

    const customer = await db.orm.public.Customer
      .where({ id: input.customerId })
      .all();

    const user = await db.orm.public.User
      .where({ id: input.createdById })
      .all();

    if (!customer[0]) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    if (!user[0]) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const products = await Promise.all(
      input.items.map(async (item) => {
        const result = await db.orm.public.Product
          .where({ id: item.productId })
          .all();

        return {
          item,
          product: result[0],
        };
      })
    );

    const missingProduct = products.find(({ product }) => !product);

    if (missingProduct) {
      return NextResponse.json(
        { error: `Product ${missingProduct.item.productId} not found` },
        { status: 404 }
      );
    }

    const quoteItems = products.map(({ item, product }) => {
      const unitPrice = product!.sellingPrice;
      const grossTotal = unitPrice * item.quantity;
      const discountAmount = Math.round(
        grossTotal * (item.discountPct / 100)
      );

      return {
        productId: product!.id,
        quantity: item.quantity,
        unitPrice,
        discountPct: item.discountPct,
        lineTotal: grossTotal - discountAmount,
        costTotal: product!.costPrice * item.quantity,
      };
    });

    const subtotal = quoteItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );

    const totalAmount = quoteItems.reduce(
      (sum, item) => sum + item.lineTotal,
      0
    );

    const discountAmount = subtotal - totalAmount;

    const discountPct =
      subtotal === 0 ? 0 : (discountAmount / subtotal) * 100;

    const costTotal = quoteItems.reduce(
      (sum, item) => sum + item.costTotal,
      0
    );

    const marginAmount = totalAmount - costTotal;

    const marginPct =
      totalAmount === 0 ? 0 : (marginAmount / totalAmount) * 100;

    const allowedDiscountPct = Math.max(
      ...products.map(
        ({ product }) => product!.allowedDiscountPct
      )
    );

    const risk = calculateDiscountRisk({
      customerTier: customer[0].tier,
      requestedDiscountPct: discountPct,
      allowedDiscountPct,
      marginPct,
    });

    const quoteNumber = `Q-${Date.now()}`;

    const quote = await db.orm.public.Quote.create({
      quoteNumber,
      customerId: customer[0].id,
      createdById: user[0].id,
      status: risk.approvalRequired ? "PENDING_APPROVAL" : "APPROVED",
      subtotal,
      discountAmount,
      totalAmount,
      discountPct: Math.round(discountPct),
      marginAmount,
      riskLevel: risk.riskLevel,
      riskReason: risk.reason,
    });

    for (const item of quoteItems) {
      await db.orm.public.QuoteItem.create({
        quoteId: quote.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPct: item.discountPct,
        lineTotal: item.lineTotal,
      });
    }

    if (risk.approvalRequired) {
      await db.orm.public.Approval.create({
        quoteId: quote.id,
        level: risk.approvalLevel!,
        status: "PENDING",
        requestedDiscountPct: Math.round(discountPct),
        allowedDiscountPct,
        riskLevel: risk.riskLevel,
        reason: risk.reason,
      });
    }

    return NextResponse.json(
      {
        success: true,
        quote,
        risk,
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

    console.error("Create quote error:", error);

    return NextResponse.json(
      { error: "Failed to create quote" },
      { status: 500 }
    );
  }
}
