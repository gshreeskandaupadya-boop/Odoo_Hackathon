"use client";

import { useState } from "react";

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

import { Plus, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function QuoteBuilder() {
  const [products, setProducts] = useState([
  {
    id: 1,
    name: "Laptop",
    quantity: 2,
    price: 50000,
  },
  {
    id: 2,
    name: "Monitor",
    quantity: 1,
    price: 15000,
  },
]);
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


      {/* Customer */}
      <Card>
        <CardHeader>
          <CardTitle>Customer</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="max-w-xl space-y-2">

            <Label>
              Customer
            </Label>

            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="abc">
                  ABC Corporation
                </SelectItem>

                <SelectItem value="xyz">
                  XYZ Limited
                </SelectItem>

                <SelectItem value="pqr">
                  PQR Private Ltd
                </SelectItem>

                <SelectItem value="lmn">
                  LMN Corporation
                </SelectItem>
              </SelectContent>
            </Select>

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

          <Button variant="outline">
            <Plus size={16} />
            Add Product
          </Button>
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
                    Quantity
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                    Unit Price
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                    Total
                  </th>

                  <th className="w-10"></th>

                </tr>
              </thead>


              <tbody>
  {products.map((product) => (
    <tr key={product.id} className="border-t">

      {/* Product */}
      <td className="px-4 py-3">
        <Input
          value={product.name}
          onChange={(e) => {
            setProducts(
              products.map((item) =>
                item.id === product.id
                  ? { ...item, name: e.target.value }
                  : item
              )
            );
          }}
        />
      </td>

      {/* Quantity */}
      <td className="px-4 py-3">
        <Input
          type="number"
          min="1"
          value={product.quantity}
          onChange={(e) => {
            setProducts(
              products.map((item) =>
                item.id === product.id
                  ? {
                      ...item,
                      quantity: Number(e.target.value),
                    }
                  : item
              )
            );
          }}
          className="w-24"
        />
      </td>

      {/* Unit Price */}
      <td className="px-4 py-3">
        <Input
          type="number"
          min="0"
          value={product.price}
          onChange={(e) => {
            setProducts(
              products.map((item) =>
                item.id === product.id
                  ? {
                      ...item,
                      price: Number(e.target.value),
                    }
                  : item
              )
            );
          }}
          className="w-32"
        />
      </td>

      {/* Total */}
      <td className="px-4 py-3 font-medium">
        ₹{(product.quantity * product.price).toLocaleString("en-IN")}
      </td>

      {/* Delete */}
      <td className="px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setProducts(
              products.filter((item) => item.id !== product.id)
            );
          }}
        >
          <Trash2 size={16} />
        </Button>
      </td>

    </tr>
  ))}
</tbody>

            </table>

          </div>

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
                ₹1,15,000
              </span>
            </div>


            <div className="space-y-2">

              <Label>
                Discount
              </Label>

              <div className="flex items-center gap-2">

                <Input
                  type="number"
                  defaultValue="5"
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
                ₹5,750
              </span>
            </div>


            <div className="border-t pt-4">

              <div className="flex justify-between">

                <span className="font-semibold">
                  Total
                </span>

                <span className="text-xl font-bold">
                  ₹1,09,250
                </span>

              </div>

            </div>

          </CardContent>
        </Card>


        {/* Risk */}
        <Card>

          <CardHeader>
            <CardTitle>
              Risk Assessment
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">

            <div className="flex items-start gap-3 rounded-lg border p-4">

              <CheckCircle2
                size={20}
                className="mt-0.5 text-green-600"
              />

              <div>
                <p className="text-sm font-medium">
                  Discount within allowed range
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Current discount is 5%.
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
                  Customer verification passed
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  No customer risk flags detected.
                </p>
              </div>

            </div>


            <div className="flex items-start gap-3 rounded-lg border p-4">

              <AlertTriangle
                size={20}
                className="mt-0.5 text-yellow-600"
              />

              <div>
                <p className="text-sm font-medium">
                  Approval required
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  This quote must be reviewed before submission.
                </p>
              </div>

            </div>

          </CardContent>

        </Card>

      </div>


      {/* Actions */}
      <div className="flex justify-end gap-3 border-t pt-6">

        <Button variant="outline">
          Save Draft
        </Button>

        <Button>
          Submit for Approval
        </Button>

      </div>

    </div>
  );
}