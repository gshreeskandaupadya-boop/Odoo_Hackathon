import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/src/lib/db";

const approvalSchema = z.object({
  approverId: z.number().int().positive(),
  action: z.enum(["APPROVED", "REJECTED"]),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const approvalId = Number(id);

    if (!Number.isInteger(approvalId) || approvalId <= 0) {
      return NextResponse.json(
        { error: "Invalid approval ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const input = approvalSchema.parse(body);

    const approvals = await db.orm.public.Approval
      .where({ id: approvalId })
      .all();

    const approval = approvals[0];

    if (!approval) {
      return NextResponse.json(
        { error: "Approval not found" },
        { status: 404 }
      );
    }

    if (approval.status !== "PENDING") {
      return NextResponse.json(
        { error: "Approval has already been decided" },
        { status: 400 }
      );
    }

    const users = await db.orm.public.User
      .where({ id: input.approverId })
      .all();

    const approver = users[0];

    if (!approver) {
      return NextResponse.json(
        { error: "Approver not found" },
        { status: 404 }
      );
    }

    const quoteResults = await db.orm.public.Quote
      .where({ id: approval.quoteId })
      .all();

    const quote = quoteResults[0];

    if (!quote) {
      return NextResponse.json(
        { error: "Quote not found" },
        { status: 404 }
      );
    }

    const quoteStatus =
      input.action === "APPROVED" ? "APPROVED" : "REJECTED";

    await db.orm.public.Approval
      .where({ id: approvalId })
      .update({
        approverId: approver.id,
        status: input.action,
        decidedAt: new Date().toISOString(),
      });

    await db.orm.public.Quote
      .where({ id: approval.quoteId })
      .update({
        status: quoteStatus,
      });

    await db.orm.public.AuditLog.create({
      actorId: approver.id,
      action:
        input.action === "APPROVED"
          ? "APPROVE_QUOTE"
          : "REJECT_QUOTE",
      entityType: "QUOTE",
      entityId: approval.quoteId,
      details: `Approval ${input.action.toLowerCase()} by ${approver.name}`,
    });

    return NextResponse.json({
      success: true,
      quoteId: approval.quoteId,
      approvalId,
      quoteStatus,
    });
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

    console.error("Approval action error:", error);

    return NextResponse.json(
      { error: "Failed to process approval" },
      { status: 500 }
    );
  }
}