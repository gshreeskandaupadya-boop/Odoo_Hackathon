"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
ArrowLeft,
Loader2,
AlertTriangle,
CheckCircle2,
Clock,
Package,
} from "lucide-react";

import StatusBadge from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
Card,
CardContent,
CardHeader,
CardTitle,
} from "@/components/ui/card";

type Quote = {
id: number;
quoteNumber: string;
status: string;
subtotal: number;
discountAmount: number;
discountPct: number;
totalAmount: number;
marginAmount: number;
riskLevel: "LOW" | "MEDIUM" | "HIGH";
riskReason: string | null;
createdAt: string;

customer: {
name: string;
company: string;
email: string;
tier: string;
};

createdBy: {
name: string;
email: string;
role: string;
};

items: {
id: number;
quantity: number;
unitPrice: number;
discountPct: number;
lineTotal: number;


product: {
  name: string;
  sku: string;
  category: string;
};


}[];

approvals: {
id: number;
level: string;
status: string;
requestedDiscountPct: number;
allowedDiscountPct: number;
riskLevel: string;
reason: string;
round: number;


approver: {
  name: string;
  email: string;
} | null;


}[];

negotiations: {
id: number;
proposedDiscountPct: number;
proposedTotal: number;
message: string | null;
status: string;
createdAt: string;
}[];

order: {
id: number;
orderNumber: string;
status: string;
totalAmount: number;
shortageQty: number;
} | null;
};

export default function QuoteDetailPage() {
const params = useParams();
const router = useRouter();

const [quote, setQuote] = useState<Quote | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

const quoteId = String(params.id);

useEffect(() => {
async function loadQuote() {
try {
setLoading(true);
setError("");


    const response = await fetch(`/api/quotes/${quoteId}`);

    if (!response.ok) {
      throw new Error("Failed to load quote.");
    }

    const data = await response.json();

    setQuote(data.quote);
  } catch (err) {
    console.error(err);
    setError("Unable to load quote details.");
  } finally {
    setLoading(false);
  }
}

loadQuote();


}, [quoteId]);

function formatCurrency(amount: number) {
return `₹${amount.toLocaleString("en-IN")}`;
}

function formatDate(date: string) {
return new Date(date).toLocaleDateString("en-IN", {
day: "2-digit",
month: "short",
year: "numeric",
hour: "2-digit",
minute: "2-digit",
});
}

function statusForBadge(status: string) {
switch (status) {
case "PENDING_APPROVAL":
case "NEGOTIATION":
return "pending";


  case "APPROVED":
  case "ORDERED":
    return "approved";

  case "REJECTED":
    return "rejected";

  case "DRAFT":
  default:
    return "draft";
}


}

if (loading) {
return ( <div className="flex min-h-[400px] items-center justify-center"> <Loader2 size={28} className="animate-spin text-gray-500" /> </div>
);
}

if (error || !quote) {
return ( <div className="space-y-4">
<Button
variant="outline"
onClick={() => router.push("/quotes")}
> <ArrowLeft size={16} />
Back to Quotes </Button>


    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
      {error || "Quote not found."}
    </div>
  </div>
);


}

const riskIcon =
quote.riskLevel === "HIGH" ? ( <AlertTriangle
     className="text-red-600"
     size={20}
   />
) : quote.riskLevel === "MEDIUM" ? ( <AlertTriangle
     className="text-yellow-600"
     size={20}
   />
) : ( <CheckCircle2
     className="text-green-600"
     size={20}
   />
);

return ( <div className="space-y-6">


  {/* Header */}
  <div>
    <Button
      variant="ghost"
      className="mb-3 -ml-3"
      onClick={() => router.push("/quotes")}
    >
      <ArrowLeft size={16} />
      Back to Quotes
    </Button>

    <div className="flex items-center gap-3">
      <h1 className="text-3xl font-bold tracking-tight">
        {quote.quoteNumber}
      </h1>

      <StatusBadge
        status={statusForBadge(quote.status)}
      />
    </div>

    <p className="mt-1 text-sm text-gray-500">
      Created {formatDate(quote.createdAt)}
    </p>
  </div>

  {/* Customer + Summary */}
  <div className="grid gap-6 lg:grid-cols-2">

    <Card>
      <CardHeader>
        <CardTitle>Customer</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <div>
          <p className="font-semibold">
            {quote.customer.company}
          </p>

          <p className="text-sm text-gray-500">
            {quote.customer.name}
          </p>
        </div>

        <div className="text-sm text-gray-600">
          {quote.customer.email}
        </div>

        <div className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">
          {quote.customer.tier} Customer
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Quote Summary</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">

        <div className="flex justify-between text-sm">
          <span className="text-gray-500">
            Subtotal
          </span>

          <span>
            {formatCurrency(quote.subtotal)}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-500">
            Discount ({quote.discountPct}%)
          </span>

          <span>
            {formatCurrency(quote.discountAmount)}
          </span>
        </div>

        <div className="flex justify-between border-t pt-3">
          <span className="font-semibold">
            Total
          </span>

          <span className="text-xl font-bold">
            {formatCurrency(quote.totalAmount)}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-500">
            Margin
          </span>

          <span>
            {formatCurrency(quote.marginAmount)}
          </span>
        </div>

      </CardContent>
    </Card>

  </div>

  {/* Products */}
  <Card>
    <CardHeader>
      <CardTitle>Products</CardTitle>
    </CardHeader>

    <CardContent>
      <div className="overflow-hidden rounded-lg border">
        <table className="w-full">

          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                Product
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                SKU
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                Qty
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                Unit Price
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                Discount
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                Total
              </th>
            </tr>
          </thead>

          <tbody>
            {quote.items.map((item) => (
              <tr
                key={item.id}
                className="border-t"
              >
                <td className="px-4 py-3">
                  <p className="text-sm font-medium">
                    {item.product.name}
                  </p>

                  <p className="text-xs text-gray-500">
                    {item.product.category}
                  </p>
                </td>

                <td className="px-4 py-3 text-sm text-gray-600">
                  {item.product.sku}
                </td>

                <td className="px-4 py-3 text-sm">
                  {item.quantity}
                </td>

                <td className="px-4 py-3 text-sm">
                  {formatCurrency(item.unitPrice)}
                </td>

                <td className="px-4 py-3 text-sm">
                  {item.discountPct}%
                </td>

                <td className="px-4 py-3 text-sm font-medium">
                  {formatCurrency(item.lineTotal)}
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </CardContent>
  </Card>

  {/* Risk Assessment */}
  <Card>
    <CardHeader>
      <CardTitle>Risk Assessment</CardTitle>
    </CardHeader>

    <CardContent>
      <div className="flex items-start gap-3 rounded-lg border p-4">

        {riskIcon}

        <div>
          <p className="font-semibold">
            {quote.riskLevel} Risk
          </p>

          <p className="mt-1 text-sm text-gray-500">
            {quote.riskReason ||
              "No risk reason provided."}
          </p>
        </div>

      </div>
    </CardContent>
  </Card>

  {/* Approval Workflow */}
  {quote.approvals.length > 0 && (
    <Card>
      <CardHeader>
        <CardTitle>
          Approval Workflow
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">

        {quote.approvals.map((approval) => (
          <div
            key={approval.id}
            className="flex items-start justify-between rounded-lg border p-4"
          >

            <div className="flex items-start gap-3">

              {approval.status === "APPROVED" ? (
                <CheckCircle2
                  size={20}
                  className="mt-0.5 text-green-600"
                />
              ) : approval.status === "REJECTED" ? (
                <AlertTriangle
                  size={20}
                  className="mt-0.5 text-red-600"
                />
              ) : (
                <Clock
                  size={20}
                  className="mt-0.5 text-orange-600"
                />
              )}

              <div>
                <p className="font-medium">
                  {approval.level} Approval
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Requested discount:{" "}
                  {approval.requestedDiscountPct}%
                </p>

                <p className="text-sm text-gray-500">
                  Allowed discount:{" "}
                  {approval.allowedDiscountPct}%
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {approval.reason}
                </p>
              </div>

            </div>

            <span className="text-xs font-semibold">
              {approval.status}
            </span>

          </div>
        ))}

      </CardContent>
    </Card>
  )}

  {/* Negotiations */}
  {quote.negotiations.length > 0 && (
    <Card>
      <CardHeader>
        <CardTitle>
          Customer Negotiation
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">

        {quote.negotiations.map((negotiation) => (
          <div
            key={negotiation.id}
            className="rounded-lg border p-4"
          >

            <div className="flex items-center justify-between">

              <p className="font-medium">
                Counter Offer:{" "}
                {negotiation.proposedDiscountPct}%
              </p>

              <span className="text-xs font-semibold">
                {negotiation.status}
              </span>

            </div>

            <p className="mt-2 text-sm text-gray-500">
              Proposed total:{" "}
              {formatCurrency(
                negotiation.proposedTotal
              )}
            </p>

            {negotiation.message && (
              <p className="mt-2 text-sm">
                “{negotiation.message}”
              </p>
            )}

          </div>
        ))}

      </CardContent>
    </Card>
  )}

  {/* Order */}
  {quote.order && (
    <Card>
      <CardHeader>
        <CardTitle>Order</CardTitle>
      </CardHeader>

      <CardContent>

        <div className="flex items-center justify-between rounded-lg border p-4">

          <div className="flex items-center gap-3">

            <Package
              size={22}
              className="text-blue-600"
            />

            <div>
              <p className="font-semibold">
                {quote.order.orderNumber}
              </p>

              <p className="text-sm text-gray-500">
                {quote.order.status}
              </p>
            </div>

          </div>

          <div className="text-right">

            <p className="font-semibold">
              {formatCurrency(
                quote.order.totalAmount
              )}
            </p>

            {quote.order.shortageQty > 0 && (
              <p className="text-xs text-orange-600">
                Shortage: {quote.order.shortageQty}
              </p>
            )}

          </div>

        </div>

      </CardContent>
    </Card>
  )}

  {/* Created By */}
  <div className="text-xs text-gray-500">
    Created by {quote.createdBy.name} (
    {quote.createdBy.role})
  </div>

</div>


);
}
