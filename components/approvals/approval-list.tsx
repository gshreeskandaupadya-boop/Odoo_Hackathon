"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
Card,
CardContent,
CardHeader,
CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/status-badge";
import {
Eye,
Loader2,
CheckCircle2,
XCircle,
} from "lucide-react";

type Approval = {
id: number;
level: "MANAGER" | "FINANCE";
status: "PENDING" | "APPROVED" | "REJECTED";
requestedDiscountPct: number;
allowedDiscountPct: number;
riskLevel: "LOW" | "MEDIUM" | "HIGH";
reason: string;
round: number;
createdAt: string;
quote: {
id: number;
quoteNumber: string;
totalAmount: number;
discountPct: number;
status: string;
customer: {
id: number;
name: string;
company: string;
tier: string;
};
};
approver?: {
id: number;
name: string;
role: string;
} | null;
};

export default function ApprovalList() {
const [approvals, setApprovals] = useState<Approval[]>([]);
const [loading, setLoading] = useState(true);
const [actionId, setActionId] = useState<number | null>(null);
const [error, setError] = useState("");
const [message, setMessage] = useState("");

async function loadApprovals() {
try {
setLoading(true);
setError("");


  const response = await fetch("/api/approvals");

  if (!response.ok) {
    throw new Error("Failed to fetch approvals.");
  }

  const data = await response.json();

  setApprovals(data.approvals ?? []);
} catch (err) {
  console.error(err);
  setError("Unable to load approvals.");
} finally {
  setLoading(false);
}


}

useEffect(() => {
loadApprovals();
}, []);

async function handleDecision(
approvalId: number,
status: "APPROVED" | "REJECTED"
) {
try {
setActionId(approvalId);
setError("");
setMessage("");


  const response = await fetch(
    `/api/approvals/${approvalId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status,
        approverId: status === "APPROVED" ? 2 : 2,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Failed to update approval."
    );
  }

  setMessage(
    status === "APPROVED"
      ? "Approval granted successfully."
      : "Approval rejected successfully."
  );

  await loadApprovals();
} catch (err) {
  console.error(err);
  setError(
    err instanceof Error
      ? err.message
      : "Failed to update approval."
  );
} finally {
  setActionId(null);
}


}

const pendingApprovals = useMemo(
() =>
approvals.filter(
(approval) => approval.status === "PENDING"
),
[approvals]
);

const highRiskApprovals = useMemo(
() =>
pendingApprovals.filter(
(approval) => approval.riskLevel === "HIGH"
).length,
[pendingApprovals]
);

const totalValue = useMemo(
() =>
pendingApprovals.reduce(
(total, approval) =>
total + approval.quote.totalAmount,
0
),
[pendingApprovals]
);

function formatCurrency(amount: number) {
return `₹${amount.toLocaleString("en-IN")}`;
}

function formatDate(date: string) {
return new Date(date).toLocaleDateString("en-IN", {
day: "2-digit",
month: "short",
year: "numeric",
});
}

function formatRisk(risk: Approval["riskLevel"]) {
if (risk === "HIGH") return "high-risk";
if (risk === "MEDIUM") return "pending";
return "approved";
}

return ( <div className="space-y-6"> <div> <h1 className="text-3xl font-bold tracking-tight">
Approvals </h1>


    <p className="mt-1 text-sm text-gray-500">
      Review quotations waiting for approval.
    </p>
  </div>

  {error && (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {error}
    </div>
  )}

  {message && (
    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
      {message}
    </div>
  )}

  <div className="grid gap-4 md:grid-cols-3">
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">
          Pending Approvals
        </CardTitle>
      </CardHeader>

      <CardContent>
        <p className="text-3xl font-bold">
          {pendingApprovals.length}
        </p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">
          High Risk
        </CardTitle>
      </CardHeader>

      <CardContent>
        <p className="text-3xl font-bold">
          {highRiskApprovals}
        </p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">
          Total Value
        </CardTitle>
      </CardHeader>

      <CardContent>
        <p className="text-3xl font-bold">
          {formatCurrency(totalValue)}
        </p>
      </CardContent>
    </Card>
  </div>

  <Card>
    <CardHeader>
      <CardTitle>
        Quotes Requiring Review
      </CardTitle>
    </CardHeader>

    <CardContent>
      <div className="overflow-hidden rounded-lg border">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2
              size={24}
              className="animate-spin text-gray-500"
            />
          </div>
        ) : pendingApprovals.length === 0 ? (
          <div className="py-16 text-center">
            <CheckCircle2
              size={32}
              className="mx-auto text-green-500"
            />

            <p className="mt-3 font-medium text-gray-700">
              No pending approvals
            </p>

            <p className="mt-1 text-sm text-gray-500">
              All quotations have been reviewed.
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                  Quote
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                  Customer
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                  Amount
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                  Discount
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                  Risk
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                  Date
                </th>

                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {pendingApprovals.map((approval) => (
                <tr
                  key={approval.id}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="px-4 py-4">
                    <div className="font-medium">
                      {approval.quote.quoteNumber}
                    </div>

                    {approval.round > 1 && (
                      <span className="text-xs text-orange-600">
                        Re-approval · Round {approval.round}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-4 text-sm">
                    {approval.quote.customer.company}
                  </td>

                  <td className="px-4 py-4 text-sm font-medium">
                    {formatCurrency(
                      approval.quote.totalAmount
                    )}
                  </td>

                  <td className="px-4 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {approval.requestedDiscountPct}%
                      </span>

                      <span className="text-xs text-gray-400">
                        limit {approval.allowedDiscountPct}%
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <StatusBadge
                      status={formatRisk(
                        approval.riskLevel
                      )}
                    />
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-500">
                    {formatDate(approval.createdAt)}
                  </td>

                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <Link
                          href={`/quotes/${approval.quote.id}`}
                        >
                          <Eye size={16} />
                          Review
                        </Link>
                      </Button>

                      <Button
                        size="sm"
                        onClick={() =>
                          handleDecision(
                            approval.id,
                            "APPROVED"
                          )
                        }
                        disabled={
                          actionId === approval.id
                        }
                      >
                        {actionId === approval.id ? (
                          <Loader2
                            size={16}
                            className="mr-1 animate-spin"
                          />
                        ) : (
                          <CheckCircle2 size={16} />
                        )}
                        Approve
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleDecision(
                            approval.id,
                            "REJECTED"
                          )
                        }
                        disabled={
                          actionId === approval.id
                        }
                      >
                        <XCircle size={16} />
                        Reject
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </CardContent>
  </Card>
</div>


);
}
