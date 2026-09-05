"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import StatusBadge from "@/components/status-badge";
import { Search, Plus, MoreHorizontal, Loader2 } from "lucide-react";

type QuoteStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "NEGOTIATION"
  | "ORDERED";

type Quote = {
  id: number;
  quoteNumber: string;
  customer: {
    id: number;
    name: string;
    company: string;
    email: string;
    tier: string;
  };
  totalAmount: number;
  status: QuoteStatus;
  createdAt: string;
};

export default function QuoteList() {
  const router = useRouter();

  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadQuotes() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/quotes");

        if (!response.ok) {
          throw new Error("Failed to fetch quotes.");
        }

        const data = await response.json();

        setQuotes(data.quotes ?? []);
      } catch (err) {
        console.error(err);
        setError("Unable to load quotes.");
      } finally {
        setLoading(false);
      }
    }

    loadQuotes();
  }, []);

  const filteredQuotes = useMemo(() => {
    return quotes.filter((quote) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        quote.quoteNumber.toLowerCase().includes(searchText) ||
        quote.customer.company.toLowerCase().includes(searchText) ||
        quote.customer.name.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "ALL" || quote.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [quotes, search, statusFilter]);

  function formatCurrency(amount: number) {
    return `₹${amount.toLocaleString("en-IN")}`;
  }

  function formatStatus(status: QuoteStatus) {
    switch (status) {
      case "PENDING_APPROVAL":
        return "pending";

      case "APPROVED":
        return "approved";

      case "REJECTED":
        return "rejected";

      case "DRAFT":
        return "draft";

      case "NEGOTIATION":
        return "pending";

      case "ORDERED":
        return "approved";

      default:
        return "draft";
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Quotes
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage and track your customer quotations.
          </p>
        </div>

        <button
          onClick={() => router.push("/quotes/new")}
          className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          <Plus size={18} />
          Create Quote
        </button>

      </div>


      {/* Search and Filter */}
      <div className="flex items-center justify-between gap-4">

        <div className="flex flex-1 items-center gap-3 rounded-lg border bg-white px-3 py-2">

          <Search
            size={18}
            className="text-gray-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search quotes or customers..."
            className="w-full bg-transparent text-sm outline-none"
          />

        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-lg border bg-white px-4 py-2 text-sm outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PENDING_APPROVAL">
            Pending
          </option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="NEGOTIATION">Negotiation</option>
          <option value="ORDERED">Ordered</option>
        </select>

      </div>


      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}


      {/* Quote Table */}
      <div className="overflow-hidden rounded-xl border bg-white">

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2
              size={24}
              className="animate-spin text-gray-500"
            />
          </div>
        ) : filteredQuotes.length === 0 ? (

          <div className="py-16 text-center">

            <p className="font-medium text-gray-700">
              No quotes found
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Try changing your search or filter.
            </p>

          </div>

        ) : (

          <table className="w-full">

            <thead className="border-b bg-gray-50">

              <tr>

                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500">
                  Quote
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500">
                  Customer
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500">
                  Amount
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500">
                  Status
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500">
                  Date
                </th>

                <th className="px-6 py-4"></th>

              </tr>

            </thead>


            <tbody>

              {filteredQuotes.map((quote) => (

                <tr
                  key={quote.id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >

                  <td
                    className="cursor-pointer px-6 py-4"
                    onClick={() =>
                      router.push(`/quotes/${quote.id}`)
                    }
                  >
                    <p className="font-medium">
                      {quote.quoteNumber}
                    </p>
                  </td>


                  <td className="px-6 py-4">

                    <p className="text-sm">
                      {quote.customer.company}
                    </p>

                    <p className="text-xs text-gray-500">
                      {quote.customer.tier}
                    </p>

                  </td>


                  <td className="px-6 py-4">

                    <p className="text-sm font-medium">
                      {formatCurrency(quote.totalAmount)}
                    </p>

                  </td>


                  <td className="px-6 py-4">

                    <StatusBadge
                      status={formatStatus(quote.status)}
                    />

                  </td>


                  <td className="px-6 py-4">

                    <p className="text-sm text-gray-500">
                      {formatDate(quote.createdAt)}
                    </p>

                  </td>


                  <td className="px-6 py-4 text-right">

                    <button
                      onClick={() =>
                        router.push(`/quotes/${quote.id}`)
                      }
                      className="rounded-md p-2 hover:bg-gray-100"
                    >
                      <MoreHorizontal size={18} />
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        )}

      </div>

    </div>
  );
}

