"use client";

import { useState } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const quotes = [
  {
    id: "Q-1025",
    product: "Business Laptop",
    quantity: 10,
    amount: 820000,
    discount: 18,
    status: "Approved",
    date: "Sep 5, 2026",
  },
  {
    id: "Q-1024",
    product: "Wireless Mouse",
    quantity: 25,
    amount: 37500,
    discount: 5,
    status: "Pending Approval",
    date: "Sep 4, 2026",
  },
  {
    id: "Q-1023",
    product: "Laptop Bag",
    quantity: 15,
    amount: 45000,
    discount: 8,
    status: "Customer Review",
    date: "Sep 2, 2026",
  },
  {
    id: "Q-1022",
    product: "USB-C Dock",
    quantity: 8,
    amount: 56000,
    discount: 3,
    status: "Accepted",
    date: "Aug 30, 2026",
  },
  {
    id: "Q-1026",
    product: "Business Laptop",
    quantity: 10,
    amount: 785000,
    discount: 22,
    previousDiscount: 18,
    status: "Re-approval Required",
    date: "Sep 5, 2026",
  },
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getStatusVariant(status: string) {
  if (
    status === "Approved" ||
    status === "Accepted"
  ) {
    return "secondary";
  }

  if (
    status === "Pending Approval" ||
    status === "Re-approval Required"
  ) {
    return "outline";
  }

  return "default";
}

export default function CustomerQuotesPage() {
  const [filter, setFilter] = useState("All");

  const filteredQuotes =
    filter === "All"
      ? quotes
      : quotes.filter((quote) => {
          if (filter === "Pending") {
            return (
              quote.status === "Pending Approval" ||
              quote.status === "Re-approval Required"
            );
          }

          if (filter === "Approved") {
            return quote.status === "Approved";
          }

          if (filter === "Accepted") {
            return quote.status === "Accepted";
          }

          if (filter === "Customer Review") {
            return quote.status === "Customer Review";
          }

          return true;
        });

  const totalQuotes = quotes.length;

  const approvedQuotes = quotes.filter(
    (quote) =>
      quote.status === "Approved" ||
      quote.status === "Accepted"
  ).length;

  const pendingQuotes = quotes.filter(
    (quote) =>
      quote.status === "Pending Approval" ||
      quote.status === "Re-approval Required"
  ).length;

  const totalValue = quotes.reduce(
    (total, quote) => total + quote.amount,
    0
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          My Quotes
        </h1>

        <p className="text-muted-foreground">
          View and manage quotes shared with you
        </p>
      </div>


      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Total Quotes
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-2xl font-bold">
              {totalQuotes}
            </p>
          </CardContent>
        </Card>


        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Approved
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-2xl font-bold">
              {approvedQuotes}
            </p>
          </CardContent>
        </Card>


        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Pending
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-2xl font-bold">
              {pendingQuotes}
            </p>
          </CardContent>
        </Card>


        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Total Value
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(totalValue)}
            </p>
          </CardContent>
        </Card>

      </div>


      {/* Quote List */}
      <Card>

        <CardHeader>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <CardTitle>
              Quotes Shared With You
            </CardTitle>

            {/* Filter */}
            <select
              value={filter}
              onChange={(e) =>
                setFilter(e.target.value)
              }
              className="h-10 rounded-md border bg-background px-3 text-sm"
            >
              <option value="All">
                All Quotes
              </option>

              <option value="Pending">
                Pending
              </option>

              <option value="Approved">
                Approved
              </option>

              <option value="Accepted">
                Accepted
              </option>

              <option value="Customer Review">
                Customer Review
              </option>
            </select>

          </div>

        </CardHeader>


        <CardContent>

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead>

                <tr className="border-b text-left">

                  <th className="p-3">
                    Quote
                  </th>

                  <th className="p-3">
                    Product
                  </th>

                  <th className="p-3">
                    Quantity
                  </th>

                  <th className="p-3">
                    Amount
                  </th>

                  <th className="p-3">
                    Discount
                  </th>

                  <th className="p-3">
                    Status
                  </th>

                  <th className="p-3">
                    Date
                  </th>

                  <th className="p-3">
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredQuotes.map((quote) => (

                  <tr
                    key={quote.id}
                    className="border-b last:border-0 hover:bg-muted/40"
                  >

                    {/* Quote */}
                    <td className="p-3 font-medium">
                      {quote.id}
                    </td>


                    {/* Product */}
                    <td className="p-3">
                      {quote.product}
                    </td>


                    {/* Quantity */}
                    <td className="p-3">
                      {quote.quantity}
                    </td>


                    {/* Amount */}
                    <td className="p-3 font-medium">
                      {formatCurrency(quote.amount)}
                    </td>


                    {/* Discount */}
                    <td className="p-3">

                      {quote.previousDiscount ? (

                        <div className="flex items-center gap-2">

                          <span className="text-muted-foreground line-through">
                            {quote.previousDiscount}%
                          </span>

                          <span className="font-semibold">
                            {quote.discount}%
                          </span>

                        </div>

                      ) : (
                        `${quote.discount}%`
                      )}

                    </td>


                    {/* Status */}
                    <td className="p-3">

                      <div className="flex flex-col items-start gap-1">

                        <Badge
                          variant={getStatusVariant(
                            quote.status
                          )}
                        >
                          {quote.status}
                        </Badge>

                        {quote.status ===
                          "Re-approval Required" && (
                          <span className="text-xs text-orange-600">
                            Counter offer submitted
                          </span>
                        )}

                      </div>

                    </td>


                    {/* Date */}
                    <td className="p-3 text-muted-foreground">
                      {quote.date}
                    </td>


                    {/* Action */}
                    <td className="p-3">

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          window.location.href =
                            `/customer/quotes/${quote.id}`;
                        }}
                      >
                        View Quote
                      </Button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>


            {/* Empty State */}
            {filteredQuotes.length === 0 && (
              <div className="py-10 text-center">

                <p className="font-medium">
                  No quotes found
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Try selecting a different status.
                </p>

              </div>
            )}

          </div>

        </CardContent>

      </Card>


      {/* Customer Information */}
      <Card>

        <CardHeader>
          <CardTitle>
            Customer Account
          </CardTitle>
        </CardHeader>


        <CardContent>

          <div className="grid gap-4 md:grid-cols-3">

            <div>

              <p className="text-sm text-muted-foreground">
                Company
              </p>

              <p className="font-medium">
                ABC Corporation
              </p>

            </div>


            <div>

              <p className="text-sm text-muted-foreground">
                Customer Tier
              </p>

              <Badge variant="secondary">
                Gold
              </Badge>

            </div>


            <div>

              <p className="text-sm text-muted-foreground">
                Account Status
              </p>

              <Badge>
                Active
              </Badge>

            </div>

          </div>

        </CardContent>

      </Card>

    </div>
  );
}
