"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/frontend/ui-card";
import { Button } from "@/frontend/ui-button";
import { Input } from "@/frontend/ui-input";
import { Label } from "@/frontend/ui-label";
import Sidebar from "@/frontend/sidebar";
import Navbar from "@/frontend/navbar";
import StatusBadge from "@/frontend/status-badge";
import {
  MessageSquare, ArrowRight, CheckCircle2, AlertTriangle, Clock, Loader2, UserRound,
} from "lucide-react";

type Quote = {
  id: number;
  quoteNumber: string;
  status: string;
  totalAmount: number;
  discountPct: number;
  riskLevel: string;
  riskReason: string | null;
  customer: { name: string; company: string; tier: string } | null;
  negotiations: { id: number; proposedDiscountPct: number; status: string; createdAt: string }[];
};

function formatCurrency(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function badgeStatus(status: string): "pending" | "approved" | "rejected" | "draft" | "high-risk" {
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

type CounterOfferFormProps = {
  quoteId: number;
  currentDiscount: number;
  onSuccess: () => void;
};

function CounterOfferForm({ quoteId, currentDiscount, onSuccess }: CounterOfferFormProps) {
  const [discount, setDiscount] = useState(currentDiscount + 5);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/negotiations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quoteId, proposedDiscountPct: discount, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit counter-offer");
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
      <h3 className="font-semibold text-sm text-gray-700">Submit Counter-Offer</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <Label>Proposed Discount (%)</Label>
          <Input
            type="number"
            min={currentDiscount + 1}
            max={50}
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
            className="w-32"
          />
          <p className="text-xs text-gray-500">Current: {currentDiscount}%</p>
        </div>
        <div className="space-y-1">
          <Label>Message (optional)</Label>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. We can proceed at this price..."
          />
        </div>
      </div>
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? <Loader2 size={14} className="mr-2 animate-spin" /> : <MessageSquare size={14} className="mr-2" />}
        Submit Counter-Offer
      </Button>
    </form>
  );
}

export default function CustomerPortalPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCounterOffer, setActiveCounterOffer] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  async function loadQuotes() {
    setLoading(true);
    try {
      const res = await fetch("/api/quotes");
      const data = await res.json();
      if (data.success) {
        // Enrich with negotiations
        const enriched = await Promise.all(
          (data.quotes as Quote[]).map(async (q) => {
            const negRes = await fetch(`/api/quotes/${q.id}`);
            const negData = await negRes.json();
            return { ...q, negotiations: negData.quote?.negotiations ?? [] };
          })
        );
        setQuotes(enriched);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadQuotes();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  function handleCounterSuccess() {
    setActiveCounterOffer(null);
    setSuccessMsg(`Counter-offer submitted for quote. Awaiting manager review.`);
    loadQuotes();
    setTimeout(() => setSuccessMsg(""), 5000);
  }

  const approvedCount = quotes.filter((q) => q.status === "APPROVED" || q.status === "ORDERED").length;
  const pendingCount = quotes.filter((q) => q.status === "PENDING_APPROVAL" || q.status === "NEGOTIATION").length;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar />
        <main className="flex-1 p-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <UserRound size={20} className="text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Customer Portal</h1>
                <p className="text-sm text-gray-500">View and negotiate your quotations</p>
              </div>
            </div>

            {successMsg && (
              <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                ✅ {successMsg}
              </div>
            )}

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "Total Quotes", value: quotes.length, icon: MessageSquare, color: "text-blue-600", bg: "bg-blue-50" },
                { label: "Approved", value: approvedCount, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
                { label: "Pending Review", value: pendingCount, icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <Card key={s.label}>
                    <CardContent className="flex items-center gap-4 pt-6">
                      <div className={`rounded-full p-3 ${s.bg}`}>
                        <Icon size={20} className={s.color} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{loading ? "—" : s.value}</p>
                        <p className="text-sm text-gray-500">{s.label}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Quotes */}
            <Card>
              <CardHeader>
                <CardTitle>Quotations</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 size={24} className="animate-spin text-gray-400" />
                  </div>
                ) : quotes.length === 0 ? (
                  <div className="py-12 text-center text-gray-400">
                    No quotations have been created yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {quotes.map((quote) => {
                      const canNegotiate = quote.status === "APPROVED" || quote.status === "DRAFT";
                      const hasCounterOffers = quote.negotiations?.length > 0;

                      return (
                        <div key={quote.id} className="rounded-xl border bg-white p-5 shadow-sm">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-lg">{quote.quoteNumber}</p>
                                <StatusBadge status={badgeStatus(quote.status)} />
                              </div>
                              <p className="mt-1 text-sm text-gray-500">
                                {quote.customer?.company} · {quote.customer?.tier} tier
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold">{formatCurrency(quote.totalAmount)}</p>
                              <p className="text-sm text-gray-500">Discount: {quote.discountPct}%</p>
                            </div>
                          </div>

                          {/* Risk */}
                          {quote.riskLevel !== "LOW" && (
                            <div className={`mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                              quote.riskLevel === "HIGH" ? "bg-red-50 text-red-700" : "bg-yellow-50 text-yellow-700"
                            }`}>
                              <AlertTriangle size={14} />
                              <span>{quote.riskReason}</span>
                            </div>
                          )}

                          {/* Counter-offer history */}
                          {hasCounterOffers && (
                            <div className="mt-3 rounded-lg border border-orange-100 bg-orange-50 p-3">
                              <p className="text-xs font-semibold text-orange-700 mb-2">Negotiation History</p>
                              {quote.negotiations.map((n) => (
                                <div key={n.id} className="flex items-center justify-between text-sm">
                                  <span className="text-orange-600">Counter-offer: {n.proposedDiscountPct}%</span>
                                  <span className="text-xs text-orange-500">{n.status}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="mt-4 flex items-center gap-3">
                            <Link href={`/quotes/${quote.id}`}>
                              <Button variant="outline" size="sm">
                                View Details <ArrowRight size={14} className="ml-1" />
                              </Button>
                            </Link>
                            {canNegotiate && (
                              <Button
                                size="sm"
                                variant={activeCounterOffer === quote.id ? "secondary" : "default"}
                                onClick={() =>
                                  setActiveCounterOffer(
                                    activeCounterOffer === quote.id ? null : quote.id
                                  )
                                }
                              >
                                <MessageSquare size={14} className="mr-1" />
                                {activeCounterOffer === quote.id ? "Cancel" : "Make Counter-Offer"}
                              </Button>
                            )}
                          </div>

                          {/* Counter-offer form */}
                          {activeCounterOffer === quote.id && (
                            <CounterOfferForm
                              quoteId={quote.id}
                              currentDiscount={quote.discountPct}
                                onSuccess={handleCounterSuccess}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
