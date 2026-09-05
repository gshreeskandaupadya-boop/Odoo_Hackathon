import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/backend/db";
import { requireSession, sessionUserId } from "@/backend/session";

const decisionSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
});

async function processDecision(approvalId: number, request: Request) {
  const auth = await requireSession();
  if (auth.response) return auth.response;
  const approverId = sessionUserId(auth.session!);
  if (!approverId) {
    return NextResponse.json({ error: "Invalid session." }, { status: 401 });
  }

  if (!(["SALES_MANAGER", "FINANCE", "ADMIN"] as string[]).includes(auth.session!.user.role)) {
    return NextResponse.json({ error: "Only managers or finance users can decide approvals." }, { status: 403 });
  }

  const body = await request.json();
  const input = decisionSchema.parse(body);

  const approvals = await db.orm.public.Approval.where({ id: approvalId }).all();
  const approval = approvals[0];

  if (!approval) {
    return NextResponse.json({ error: "Approval not found" }, { status: 404 });
  }

  if (approval.status !== "PENDING") {
    return NextResponse.json({ error: "Approval has already been decided" }, { status: 400 });
  }

  const users = await db.orm.public.User.where({ id: approverId }).all();
  const approver = users[0];

  if (!approver) {
    return NextResponse.json({ error: "Approver not found" }, { status: 404 });
  }

  const quoteResults = await db.orm.public.Quote.where({ id: approval.quoteId }).all();
  const quote = quoteResults[0];

  if (!quote) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  const quoteStatus = input.status === "APPROVED" ? "APPROVED" : "REJECTED";

  await db.orm.public.Approval.where({ id: approvalId }).update({
    approverId: approver.id,
    status: input.status,
    decidedAt: new Date().toISOString(),
  });

  await db.orm.public.Quote.where({ id: approval.quoteId }).update({
    status: quoteStatus,
  });

  await db.orm.public.AuditLog.create({
    actorId: approver.id,
    action: input.status === "APPROVED" ? "APPROVE_QUOTE" : "REJECT_QUOTE",
    entityType: "QUOTE",
    entityId: approval.quoteId,
    details: `Approval ${input.status.toLowerCase()} by ${approver.name}`,
  });

  return NextResponse.json({
    success: true,
    quoteId: approval.quoteId,
    approvalId,
    quoteStatus,
  });
}

// Support both POST (original) and PATCH (used by ApprovalList)
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  return processDecision(Number(id), request);
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  return processDecision(Number(id), request);
}