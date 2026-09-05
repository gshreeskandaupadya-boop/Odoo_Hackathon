import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/status-badge";
import { Eye } from "lucide-react";

const approvals = [
  {
    id: "Q-1025",
    customer: "ABC Corporation",
    amount: 156750,
    discount: 8,
    risk: "pending" as const,
    date: "Sep 5, 2026",
    type: "Approval",
  },
  {
    id: "Q-1024",
    customer: "XYZ Limited",
    amount: 85000,
    discount: 5,
    risk: "draft" as const,
    date: "Sep 5, 2026",
    type: "Approval",
  },
  {
    id: "Q-1023",
    customer: "PQR Private Ltd",
    amount: 204000,
    discount: 15,
    risk: "high-risk" as const,
    date: "Sep 4, 2026",
    type: "Approval",
  },
  {
    id: "Q-1026",
    customer: "ABC Corporation",
    amount: 156750,
    discount: 22,
    previousDiscount: 18,
    risk: "high-risk" as const,
    date: "Sep 5, 2026",
    type: "Re-approval",
  },
];

export default function ApprovalList() {
  const pendingApprovals = approvals.length;

  const highRiskApprovals = approvals.filter(
    (approval) => approval.risk === "high-risk"
  ).length;

  const totalValue = approvals.reduce(
    (total, approval) => total + approval.amount,
    0
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Approvals
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Review quotations waiting for approval.
        </p>
      </div>


      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Pending Approvals
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-3xl font-bold">
              {pendingApprovals}
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
              ₹{totalValue.toLocaleString("en-IN")}
            </p>
          </CardContent>
        </Card>

      </div>


      {/* Approval Table */}
      <Card>

        <CardHeader>
          <CardTitle>
            Quotes Requiring Review
          </CardTitle>
        </CardHeader>

        <CardContent>

          <div className="overflow-hidden rounded-lg border">

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

                {approvals.map((approval) => (

                  <tr
                    key={approval.id}
                    className="border-t hover:bg-gray-50"
                  >

                    {/* Quote */}
                    <td className="px-4 py-4">
                      <div className="font-medium">
                        {approval.id}
                      </div>

                      {approval.type === "Re-approval" && (
                        <span className="text-xs text-orange-600">
                          Re-approval
                        </span>
                      )}
                    </td>


                    {/* Customer */}
                    <td className="px-4 py-4 text-sm">
                      {approval.customer}
                    </td>


                    {/* Amount */}
                    <td className="px-4 py-4 text-sm font-medium">
                      ₹{approval.amount.toLocaleString("en-IN")}
                    </td>


                    {/* Discount */}
                    <td className="px-4 py-4 text-sm">
                      {approval.type === "Re-approval" ? (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 line-through">
                            {approval.previousDiscount}%
                          </span>

                          <span className="font-semibold text-orange-600">
                            {approval.discount}%
                          </span>
                        </div>
                      ) : (
                        `${approval.discount}%`
                      )}
                    </td>


                    {/* Risk */}
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        <StatusBadge status={approval.risk} />

                        {approval.type === "Re-approval" && (
                          <span className="text-xs font-medium text-orange-600">
                            Re-approval Required
                          </span>
                        )}
                      </div>
                    </td>


                    {/* Date */}
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {approval.date}
                    </td>


                    {/* Action */}
                    <td className="px-4 py-4 text-right">

                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <Link href={`/approvals/${approval.id}`}>
                          <Eye size={16} />
                          Review
                        </Link>
                      </Button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </CardContent>

      </Card>

    </div>
  );
}
