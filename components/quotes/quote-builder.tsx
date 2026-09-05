"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

type Customer = {
  id: number;
  name: string;
  company: string;
  email: string;
  tier: string;
};

type Product = {
  id: number;
  sku: string;
  name: string;
  category: string;
  sellingPrice: number;
  costPrice: number;
  allowedDiscountPct: number;
};

type QuoteProduct = {
  id: number;
  productId: number;
  quantity: number;
  price: number;
};

type RiskResult = {
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  riskReason: string;
  approvalRequired: boolean;
  approvalLevel: "MANAGER" | "FINANCE" | null;
};

export default function QuoteBuilder() {
  const router = useRouter();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);

  const [customerId, setCustomerId] = useState("");
  const [products, setProducts] = useState<QuoteProduct[]>([]);

  const [discountPct, setDiscountPct] = useState(5);

  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [risk, setRisk] = useState<RiskResult | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [customersResponse, productsResponse] = await Promise.all([
          fetch("/api/customers"),
          fetch("/api/products"),
        ]);

        if (!customersResponse.ok || !productsResponse.ok) {
          throw new Error("Failed to load quote data.");
        }

        const customersData = await customersResponse.json();
        const productsData = await productsResponse.json();

        setCustomers(customersData.customers ?? []);
        setAvailableProducts(productsData.products ?? []);
      } catch (err) {
        console.error(err);
        setError("Unable to load customers and products.");
      } finally {
        setLoadingData(false);
      }
    }

    loadData();
  }, []);

  const subtotal = useMemo(() => {
    return products.reduce(
      (total, product) => total + product.quantity * product.price,
      0
    );
  }, [products]);

  const discountAmount = useMemo(() => {
    return Math.round((subtotal * discountPct) / 100);
  }, [subtotal, discountPct]);

  const total = subtotal - discountAmount;

  function addProduct() {
    const unusedProduct = availableProducts.find(
      (product) =>
        !products.some((selected) => selected.productId === product.id)
    );

    if (!unusedProduct) return;

    setProducts([
      ...products,
      {
        id: Date.now(),
        productId: unusedProduct.id,
        quantity: 1,
        price: unusedProduct.sellingPrice,
      },
    ]);
  }

  function updateProduct(productRowId: number, productId: number) {
    const selectedProduct = availableProducts.find(
      (product) => product.id === productId
    );

    if (!selectedProduct) return;

    setProducts(
      products.map((product) =>
        product.id === productRowId
          ? {
              ...product,
              productId: selectedProduct.id,
              price: selectedProduct.sellingPrice,
            }
          : product
      )
    );
  }

  function updateQuantity(productRowId: number, quantity: number) {
    setProducts(
      products.map((product) =>
        product.id === productRowId
          ? {
              ...product,
              quantity: Math.max(1, quantity),
            }
          : product
      )
    );
  }

  function removeProduct(productRowId: number) {
    setProducts(
      products.filter((product) => product.id !== productRowId)
    );
  }

  async function submitQuote() {
    setError("");
    setSuccess("");
    setRisk(null);

    if (!customerId) {
      setError("Please select a customer.");
      return;
    }

    if (products.length === 0) {
      setError("Please add at least one product.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId: Number(customerId),
          createdById: 1,
          discountPct,
          items: products.map((product) => ({
            productId: product.productId,
            quantity: product.quantity,
            unitPrice: product.price,
            discountPct,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create quote.");
      }

      setRisk({
        riskLevel: data.quote.riskLevel,
        riskReason: data.quote.riskReason,
        approvalRequired: data.quote.status === "PENDING_APPROVAL",
        approvalLevel: data.quote.approvals?.[0]?.level ?? null,
      });

      setSuccess(
        data.quote.status === "PENDING_APPROVAL"
          ? "Quote created and sent for approval."
          : "Quote created and approved automatically."
      );

      setTimeout(() => {
        router.push("/quotes");
        router.refresh();
      }, 1200);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Failed to create quote."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const selectedCustomer = customers.find(
    (customer) => customer.id === Number(customerId)
  );

  const riskIcon =
    risk?.riskLevel === "HIGH" ? (
      <AlertTriangle size={20} className="mt-0.5 text-red-600" />
    ) : risk?.riskLevel === "MEDIUM" ? (
      <AlertTriangle size={20} className="mt-0.5 text-yellow-600" />
    ) : (
      <CheckCircle2 size={20} className="mt-0.5 text-green-600" />
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Create Quote
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Create a quotation for your customer.
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Customer */}
      <Card>
        <CardHeader>
          <CardTitle>Customer</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="max-w-xl space-y-2">
            <Label>Customer</Label>

            <Select
              value={customerId}
              onValueChange={setCustomerId}
              disabled={loadingData}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    loadingData
                      ? "Loading customers..."
                      : "Select customer"
                  }
                />
              </SelectTrigger>

              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem
                    key={customer.id}
                    value={String(customer.id)}
                  >
                    {customer.company} — {customer.tier}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedCustomer && (
              <p className="text-xs text-gray-500">
                {selectedCustomer.name} · {selectedCustomer.email}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Products */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Products</CardTitle>

            <p className="mt-1 text-sm text-gray-500">
              Add products and quantities to this quote.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={addProduct}
            disabled={
              loadingData ||
              products.length >= availableProducts.length
            }
          >
            <Plus size={16} />
            Add Product
          </Button>
        </CardHeader>

        <CardContent>
          {products.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-sm text-gray-500">
                No products added yet.
              </p>

              <Button
                variant="outline"
                className="mt-3"
                onClick={addProduct}
                disabled={loadingData}
              >
                <Plus size={16} />
                Add Product
              </Button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                      Product
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                      Quantity
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                      Unit Price
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                      Total
                    </th>

                    <th className="w-10" />
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="border-t"
                    >
                      <td className="px-4 py-3">
                        <Select
                          value={String(product.productId)}
                          onValueChange={(value) =>
                            updateProduct(
                              product.id,
                              Number(value)
                            )
                          }
                        >
                          <SelectTrigger className="min-w-[220px]">
                            <SelectValue />
                          </SelectTrigger>

                          <SelectContent>
                            {availableProducts.map(
                              (availableProduct) => (
                                <SelectItem
                                  key={availableProduct.id}
                                  value={String(
                                    availableProduct.id
                                  )}
                                >
                                  {availableProduct.name}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </td>

                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          min="1"
                          value={product.quantity}
                          onChange={(event) =>
                            updateQuantity(
                              product.id,
                              Number(event.target.value)
                            )
                          }
                          className="w-24"
                        />
                      </td>

                      <td className="px-4 py-3">
                        ₹
                        {product.price.toLocaleString("en-IN")}
                      </td>

                      <td className="px-4 py-3 font-medium">
                        ₹
                        {(
                          product.quantity * product.price
                        ).toLocaleString("en-IN")}
                      </td>

                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            removeProduct(product.id)
                          }
                        >
                          <Trash2 size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pricing + Risk */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">
                Subtotal
              </span>

              <span className="font-medium">
                ₹{subtotal.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="space-y-2">
              <Label>Discount</Label>

              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={discountPct}
                  onChange={(event) =>
                    setDiscountPct(
                      Math.max(
                        0,
                        Math.min(
                          100,
                          Number(event.target.value)
                        )
                      )
                    )
                  }
                  className="w-24"
                />

                <span className="text-sm text-gray-500">
                  %
                </span>
              </div>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">
                Discount Amount
              </span>

              <span>
                ₹{discountAmount.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between">
                <span className="font-semibold">
                  Total
                </span>

                <span className="text-xl font-bold">
                  ₹{total.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Assessment</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {!risk ? (
              <>
                <div className="flex items-start gap-3 rounded-lg border p-4">
                  <CheckCircle2
                    size={20}
                    className="mt-0.5 text-green-600"
                  />

                  <div>
                    <p className="text-sm font-medium">
                      Quote ready for assessment
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Submit the quote to run the backend
                      discount and risk engine.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border p-4">
                  <CheckCircle2
                    size={20}
                    className="mt-0.5 text-green-600"
                  />

                  <div>
                    <p className="text-sm font-medium">
                      Customer verification
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {selectedCustomer
                        ? `${selectedCustomer.tier} customer selected.`
                        : "Select a customer to continue."}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-start gap-3 rounded-lg border p-4">
                {riskIcon}

                <div>
                  <p className="text-sm font-medium">
                    {risk.riskLevel} Risk
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {risk.riskReason}
                  </p>

                  {risk.approvalRequired && (
                    <p className="mt-2 text-xs font-semibold text-orange-600">
                      Approval required
                      {risk.approvalLevel
                        ? ` · ${risk.approvalLevel}`
                        : ""}
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t pt-6">
        <Button
          variant="outline"
          onClick={() => router.push("/quotes")}
          disabled={submitting}
        >
          Cancel
        </Button>

        <Button
          onClick={submitQuote}
          disabled={
            submitting ||
            loadingData ||
            !customerId ||
            products.length === 0
          }
        >
          {submitting ? (
            <>
              <Loader2
                size={16}
                className="mr-2 animate-spin"
              />
              Creating Quote...
            </>
          ) : (
            "Submit Quote"
          )}
        </Button>
      </div>
    </div>
  );
}