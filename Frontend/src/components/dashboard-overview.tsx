"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/frontend/ui-card";
import StatusBadge from "@/frontend/status-badge";
import {
  FileText,
  Clock,
  CheckCircle2,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

type DashboardData = {
  stats: {
    totalQuotes: number;
    pendingApprovals: number;
    approvedQuotes: number;
    totalOrders: number;
    totalRevenue: number;
  };
  pipeline: Record<string, number>;
  recentQuotes: {
    id: number;
    quoteNumber: string;
    status: string;
    totalAmount: number;
    riskLevel: string;
    customer: { company: string; tier: string } | null;
  }[];
};

function formatCurrency(amount: number) {
  if (amount >= 100000)
    return `₹${(amount / 100000).toFixed(1)}L`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

function statusVariant(status: string): "pending" | "approved" | "rejected" | "draft" | "high-risk" {
  switch (status) {
    case "PENDING_APPROVAL":
    case "NEGOTIATION":
      return "pending";
    case "APPROVED":
    case "ORDERED":
      return "approved";
    case "REJECTED":
      return "rejected";
    default:
      return "draft";
  }
}

export default function DashboardOverview() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => { if (d.success) setData(d); })
      .finally(() => setLoading(false));
  }, []);

  const userName = session?.user?.name?.split(" ")[0] ?? "there";

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const kpiCards = [
    {
      label: "Total Quotes",
      value: data?.stats.totalQuotes ?? "—",
      sub: "All time",
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Pending Approvals",
      value: data?.stats.pendingApprovals ?? "—",
      sub: "Requires attention",
      icon: Clock,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      label: "Approved Quotes",
      value: data?.stats.approvedQuotes ?? "—",
      sub: "Ready to order",
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Orders",
      value: data?.stats.totalOrders ?? "—",
      sub: data ? formatCurrency(data.stats.totalRevenue) + " revenue" : "This month",
      icon: ShoppingCart,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {greeting}, {userName} 👋
        </h1>
        <p className="mt-2 text-gray-500">
          Here&apos;s what&apos;s happening with your sales today.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  {card.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold">
                      {loading ? (
                        <span className="animate-pulse text-gray-300">—</span>
                      ) : (
                        card.value
                      )}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">{card.sub}</p>
                  </div>
                  <div className={`rounded-full p-3 ${card.bg}`}>
                    <Icon size={20} className={card.color} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Quotes */}
        <div className="rounded-xl border bg-white p-6 lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Recent Quotes</h2>
              <p className="text-sm text-gray-500">Latest quotation activity</p>
            </div>
            <Link
              href="/quotes"
              className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-14 animate-pulse rounded-lg bg-gray-100"
                />
              ))}
            </div>
          ) : data?.recentQuotes.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <FileText size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No quotes yet. Create your first quote!</p>
              <Link
                href="/quotes/new"
                className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline"
              >
                Create Quote →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {data?.recentQuotes.map((quote) => (
                <Link
                  key={quote.id}
                  href={`/quotes/${quote.id}`}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium">{quote.quoteNumber}</p>
                    <p className="text-sm text-gray-500">
                      {quote.customer?.company ?? "Unknown customer"} ·{" "}
                      {quote.customer?.tier}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <p className="font-semibold">
                      {formatCurrency(quote.totalAmount)}
                    </p>
                    <StatusBadge status={statusVariant(quote.status)} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Action Panel */}
        <div className="space-y-4">
          {/* Pipeline */}
          <div className="rounded-xl border bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold">Pipeline</h2>
            <div className="space-y-3">
              {data &&
                Object.entries(data.pipeline)
                  .filter(([, count]) => count > 0)
                  .map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between text-sm">
                      <span className="capitalize text-gray-600">
                        {status.replace(/_/g, " ").toLowerCase()}
                      </span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
              {!data && !loading && (
                <p className="text-sm text-gray-400">No data available.</p>
              )}
            </div>
          </div>

          {/* Action Required */}
          <div className="rounded-xl border bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold">Action Required</h2>
            {data?.stats.pendingApprovals ? (
              <Link
                href="/approvals"
                className="block rounded-lg border border-orange-200 bg-orange-50 p-4 hover:bg-orange-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-orange-600" />
                  <p className="font-medium text-orange-800">Pending Approvals</p>
                </div>
                <p className="mt-1 text-sm text-orange-600">
                  {data.stats.pendingApprovals} quote
                  {data.stats.pendingApprovals !== 1 ? "s" : ""} waiting for review
                </p>
                <p className="mt-2 flex items-center gap-1 text-sm font-medium text-orange-700">
                  Review now <ArrowRight size={12} />
                </p>
              </Link>
            ) : (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-600" />
                  <p className="font-medium text-green-800">All Clear</p>
                </div>
                <p className="mt-1 text-sm text-green-600">
                  No pending items need your attention.
                </p>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="rounded-xl border bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
            <div className="space-y-2">
              <Link
                href="/quotes/new"
                className="flex items-center gap-2 rounded-lg p-3 text-sm font-medium transition-colors hover:bg-blue-50 hover:text-blue-700"
              >
                <TrendingUp size={16} /> Create new quote
              </Link>
              <Link
                href="/approvals"
                className="flex items-center gap-2 rounded-lg p-3 text-sm font-medium transition-colors hover:bg-orange-50 hover:text-orange-700"
              >
                <Clock size={16} /> Review approvals
              </Link>
              <Link
                href="/fulfillment/orders"
                className="flex items-center gap-2 rounded-lg p-3 text-sm font-medium transition-colors hover:bg-purple-50 hover:text-purple-700"
              >
                <ShoppingCart size={16} /> Fulfillment orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}