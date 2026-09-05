import { NextResponse } from "next/server";
import { db } from "@/src/lib/db";

export async function GET() {
  try {
    const quotes = await db.orm.public.Quote
      .orderBy((quote) => quote.createdAt.desc())
      .all();

    const quotesWithRelations = await Promise.all(
      quotes.map(async (quote) => {
        const customers = await db.orm.public.Customer
          .where({ id: quote.customerId })
          .all();

        const users = await db.orm.public.User
          .where({ id: quote.createdById })
          .all();

        return {
          ...quote,
          customer: customers[0] ?? null,
          createdBy: users[0] ?? null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      quotes: quotesWithRelations,
    });
  } catch (error) {
    console.error("Get quotes error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch quotes",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      customerId,
      createdById,
      items,
      discountPct = 0,
    } = body;

    if (
      !customerId ||
      !createdById ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Customer, creator and at least one item are required.",
        },
        { status: 400 }
      );
    }

    const customers = await db.orm.public.Customer
      .where({ id: Number(customerId) })
      .all();

    const users = await db.orm.public.User
      .where({ id: Number(createdById) })
      .all();

    const customer = customers[0];
    const user = users[0];

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found." },
        { status: 404 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    const productIds = items.map((item: { productId: number }) =>
      Number(item.productId)
    );

    const products = await Promise.all(
      productIds.map(async (productId: number) => {
        const result = await db.orm.public.Product
          .where({ id: productId })
          .all();

        return result[0];
      })
    );

    const missingProduct = products.find((product) => !product);

    if (missingProduct) {
      return NextResponse.json(
        { error: "One or more products were not found." },
        { status: 404 }
      );
    }

    let subtotal = 0;
    let totalCost = 0;

    const quoteItems = items.map(
      (
        item: {
          productId: number;
          quantity: number;
          unitPrice?: number;
          discountPct?: number;
        },
        index: number
      ) => {
        const product = products[index]!;

        const quantity = Number(item.quantity);
        const unitPrice = Number(
          item.unitPrice ?? product.sellingPrice
        );
        const lineDiscountPct = Number(
          item.discountPct ?? discountPct
        );

        const grossAmount = quantity * unitPrice;
        const lineDiscount = Math.round(
          (grossAmount * lineDiscountPct) / 100
        );

        const lineTotal = grossAmount - lineDiscount;

        subtotal += grossAmount;
        totalCost += quantity * product.costPrice;

        return {
          productId: product.id,
          quantity,
          unitPrice,
          discountPct: lineDiscountPct,
          lineTotal,
        };
      }
    );

    const discountAmount = Math.round(
      (subtotal * Number(discountPct)) / 100
    );

    const totalAmount = subtotal - discountAmount;

    const marginAmount = totalAmount - totalCost;

    const marginPct =
      totalAmount > 0
        ? (marginAmount / totalAmount) * 100
        : 0;

    const allowedDiscountPct = Math.max(
      ...products.map(
        (product) => product!.allowedDiscountPct
      )
    );

    const {
      calculateDiscountRisk,
    } = await import("@/src/services/discount-engine");

    const risk = calculateDiscountRisk({
      customerTier: customer.tier,
      requestedDiscountPct: Number(discountPct),
      allowedDiscountPct,
      marginPct,
      previousApprovalCount: 0,
    });

    const quoteNumber = `Q-${Date.now()}`;

    const quote = await db.orm.public.Quote.create({
      quoteNumber,
      customerId: customer.id,
      createdById: user.id,
      status: risk.approvalRequired
        ? "PENDING_APPROVAL"
        : "APPROVED",
      subtotal,
      discountAmount,
      totalAmount,
      discountPct: Number(discountPct),
      marginAmount,
      riskLevel: risk.riskLevel,
      riskReason: risk.reason,
    });

    await db.orm.public.QuoteItem.createAll(
      quoteItems.map((item) => ({
        ...item,
        quoteId: quote.id,
      }))
    );

    if (risk.approvalRequired) {
      await db.orm.public.Approval.create({
        quoteId: quote.id,
        approverId: null,
        level: risk.approvalLevel!,
        status: "PENDING",
        requestedDiscountPct: Number(discountPct),
        allowedDiscountPct,
        riskLevel: risk.riskLevel,
        reason: risk.reason,
        round: 1,
      });
    }

    return NextResponse.json(
      {
        success: true,
        quote: {
          ...quote,
          customer,
          createdBy: user,
          risk: {
            riskLevel: risk.riskLevel,
            reason: risk.reason,
            approvalRequired: risk.approvalRequired,
            approvalLevel: risk.approvalLevel,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create quote error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create quote",
      },
      { status: 500 }
    );
  }
}

