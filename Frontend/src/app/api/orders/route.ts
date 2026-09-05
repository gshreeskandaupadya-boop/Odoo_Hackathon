import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/backend/db";
import { allocateInventory } from "@/backend/fulfillment-engine";
import { requireSession, sessionUserId } from "@/backend/session";

const orderSchema = z.object({
  quoteId: z.number().int().positive(),
});

const orderUpdateSchema = z.object({
  orderId: z.number().int().positive(),
  status: z.enum(["PROCESSING", "CANCELLED"]),
});

// GET /api/orders
export async function GET() {
  try {
    const auth = await requireSession();
    if (auth.response) return auth.response;

    const orders = await db.orm.public.Order
      .orderBy((order) => order.createdAt.desc())
      .all();

    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const [customers, quotes, allocations] = await Promise.all([
          db.orm.public.Customer.where({ id: order.customerId }).all(),
          db.orm.public.Quote.where({ id: order.quoteId }).all(),
          db.orm.public.OrderAllocation.where({ orderId: order.id }).all(),
        ]);
        const quote = quotes[0];
        const items = quote
          ? await db.orm.public.QuoteItem.where({ quoteId: quote.id }).all()
          : [];
        const products = await Promise.all(
          items.map(async (item) => (await db.orm.public.Product.where({ id: item.productId }).all())[0])
        );

        return {
          ...order,
          customer: customers[0] ?? null,
          quote: quote ?? null,
          items: items.map((item, index) => ({ ...item, product: products[index] ?? null })),
          allocations,
        };
      })
    );

    return NextResponse.json({
      success: true,
      orders: enrichedOrders,
    });
  } catch (error) {
    console.error("Get orders error:", error);

    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST /api/orders
export async function POST(request: Request) {
  try {
    const auth = await requireSession();
    if (auth.response) return auth.response;
    const confirmedById = sessionUserId(auth.session!);
    if (!confirmedById) {
      return NextResponse.json({ error: "Invalid session." }, { status: 401 });
    }

    const body = await request.json();
    const input = orderSchema.parse(body);

    // 1. Get quote
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

    // 2. Quote must be approved before ordering
    if (quote.status !== "APPROVED") {
      return NextResponse.json(
        {
          error: "Quote is not approved",
          currentStatus: quote.status,
        },
        { status: 400 }
      );
    }

    // 3. Verify confirming user
    const users = await db.orm.public.User
      .where({ id: confirmedById })
      .all();

    if (!users[0]) {
      return NextResponse.json(
        { error: "Confirming user not found" },
        { status: 404 }
      );
    }

    // 4. Get quote items
    const quoteItems = await db.orm.public.QuoteItem
      .where({ quoteId: quote.id })
      .all();

    if (quoteItems.length === 0) {
      return NextResponse.json(
        { error: "Quote has no items" },
        { status: 400 }
      );
    }

    const allAllocations: Array<{
      productId: number;
      warehouseId: number;
      warehouseName: string;
      quantity: number;
    }> = [];

    let totalShortage = 0;
    let hasPartialFulfillment = false;

    // 5. Allocate each quote item across warehouses
    for (const item of quoteItems) {
      const inventory = await db.orm.public.Inventory
        .where({ productId: item.productId })
        .all();

      const warehouses = await Promise.all(
        inventory.map(async (stock) => {
          const warehouse = await db.orm.public.Warehouse
            .where({ id: stock.warehouseId })
            .all();

          return {
            warehouseId: stock.warehouseId,
            warehouseName:
              warehouse[0]?.name ?? "Unknown Warehouse",
            availableQuantity: Math.max(
              0,
              stock.quantity - stock.reserved
            ),
          };
        })
      );

      const fulfillment = allocateInventory(
        item.quantity,
        warehouses
      );

      totalShortage += fulfillment.shortageQuantity;

      if (fulfillment.status === "PARTIALLY_FULFILLED") {
        hasPartialFulfillment = true;
      }

      for (const allocation of fulfillment.allocations) {
        allAllocations.push({
          productId: item.productId,
          warehouseId: allocation.warehouseId,
          warehouseName: allocation.warehouseName,
          quantity: allocation.quantity,
        });
      }
    }

    // 6. Determine order status
    let orderStatus:
      | "FULFILLED"
      | "PARTIALLY_FULFILLED"
      | "BACKORDERED";

    if (totalShortage === 0) {
      orderStatus = "FULFILLED";
    } else if (
      hasPartialFulfillment ||
      allAllocations.length > 0
    ) {
      orderStatus = "PARTIALLY_FULFILLED";
    } else {
      orderStatus = "BACKORDERED";
    }

    const orderNumber = `ORD-${Date.now()}`;

    // 7. Create order
    const order = await db.orm.public.Order.create({
      orderNumber,
      quoteId: quote.id,
      customerId: quote.customerId,
      confirmedById,
      status: orderStatus,
      totalAmount: quote.totalAmount,
      shortageQty: totalShortage,
    });

    // 8. Create allocation records + reserve inventory
    for (const allocation of allAllocations) {
      await db.orm.public.OrderAllocation.create({
        orderId: order.id,
        productId: allocation.productId,
        warehouseId: allocation.warehouseId,
        quantity: allocation.quantity,
      });

      const inventoryRows = await db.orm.public.Inventory
        .where({
          productId: allocation.productId,
          warehouseId: allocation.warehouseId,
        })
        .all();

      const inventory = inventoryRows[0];

      if (inventory) {
        await db.orm.public.Inventory
          .where({ id: inventory.id })
          .update({
            reserved:
              inventory.reserved + allocation.quantity,
          });
      }
    }

    // 9. Mark quote as ordered
    await db.orm.public.Quote
      .where({ id: quote.id })
      .update({
        status: "ORDERED",
      });

    // 10. Audit trail
    await db.orm.public.AuditLog.create({
      actorId: confirmedById,
      action: "ORDER_CONFIRMED",
      entityType: "Order",
      entityId: order.id,
      details: JSON.stringify({
        quoteId: quote.id,
        orderNumber,
        totalAmount: quote.totalAmount,
        shortageQty: totalShortage,
      }),
    });

    return NextResponse.json(
      {
        success: true,
        order,
        allocations: allAllocations,
        shortageQuantity: totalShortage,
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

    console.error("Create order error:", error);

    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireSession();
    if (auth.response) return auth.response;
    const actorId = sessionUserId(auth.session!);
    if (!actorId) {
      return NextResponse.json({ error: "Invalid session." }, { status: 401 });
    }

    const input = orderUpdateSchema.parse(await request.json());
    const orders = await db.orm.public.Order.where({ id: input.orderId }).all();
    const order = orders[0];

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    if (input.status === "PROCESSING" && order.status !== "CONFIRMED") {
      return NextResponse.json({ error: "Only confirmed orders can start processing." }, { status: 400 });
    }

    if (input.status === "CANCELLED" && ["FULFILLED", "CANCELLED"].includes(order.status)) {
      return NextResponse.json({ error: "This order can no longer be cancelled." }, { status: 400 });
    }

    const updated = await db.orm.public.Order.where({ id: order.id }).update({ status: input.status });
    await db.orm.public.AuditLog.create({
      actorId,
      action: input.status === "PROCESSING" ? "START_ORDER_PROCESSING" : "CANCEL_ORDER",
      entityType: "Order",
      entityId: order.id,
      details: `Order ${order.orderNumber} changed to ${input.status}`,
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid order update.", details: error.issues }, { status: 400 });
    }

    console.error("Update order error:", error);
    return NextResponse.json({ error: "Failed to update order." }, { status: 500 });
  }
}

