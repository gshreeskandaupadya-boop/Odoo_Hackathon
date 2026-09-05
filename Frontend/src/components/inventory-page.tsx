"use client";

import { Fragment, useEffect, useState } from "react";
import Sidebar from "@/frontend/sidebar";
import Navbar from "@/frontend/navbar";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/frontend/ui-card";
import { Loader2, Package, Warehouse, AlertTriangle } from "lucide-react";

type WarehouseStock = {
  warehouseId: number;
  warehouseName: string;
  location: string;
  quantity: number;
  reserved: number;
  available: number;
};

type ProductInventory = {
  id: number;
  name: string;
  sku: string;
  category: string;
  sellingPrice: number;
  totalQty: number;
  totalReserved: number;
  totalAvailable: number;
  warehouses: WarehouseStock[];
};

function StockBar({ available, total }: { available: number; total: number }) {
  const pct = total > 0 ? Math.round((available / total) * 100) : 0;
  const color = pct > 50 ? "bg-green-500" : pct > 20 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-32 rounded-full bg-gray-200 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-500">{pct}%</span>
    </div>
  );
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<ProductInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedProduct, setExpandedProduct] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/inventory")
      .then((r) => r.json())
      .then((d) => { if (d.success) setInventory(d.inventory); })
      .finally(() => setLoading(false));
  }, []);

  const totalProducts = inventory.length;
  const lowStock = inventory.filter((p) => p.totalAvailable < 5).length;
  const totalValue = inventory.reduce((s, p) => s + p.totalQty * p.sellingPrice, 0);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar />
        <main className="flex-1 p-8">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
              <p className="mt-1 text-sm text-gray-500">Real-time stock levels across all warehouses</p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "Total Products", value: totalProducts, icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
                { label: "Low Stock Alerts", value: lowStock, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
                { label: "Inventory Value", value: `₹${(totalValue / 100000).toFixed(1)}L`, icon: Warehouse, color: "text-purple-600", bg: "bg-purple-50" },
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

            {/* Inventory Table */}
            <Card>
              <CardHeader>
                <CardTitle>Stock by Product</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 size={24} className="animate-spin text-gray-400" />
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-lg border">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Product</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">SKU</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Category</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Total Stock</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Reserved</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Available</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Level</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventory.map((product) => (
                          <Fragment key={product.id}>
                            <tr
                              className={`border-t cursor-pointer hover:bg-gray-50 ${
                                expandedProduct === product.id ? "bg-blue-50/30" : ""
                              }`}
                              onClick={() =>
                                setExpandedProduct(expandedProduct === product.id ? null : product.id)
                              }
                            >
                              <td className="px-4 py-3 font-medium">{product.name}</td>
                              <td className="px-4 py-3 text-gray-500">{product.sku}</td>
                              <td className="px-4 py-3">
                                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">
                                  {product.category}
                                </span>
                              </td>
                              <td className="px-4 py-3">{product.totalQty}</td>
                              <td className="px-4 py-3 text-orange-600">{product.totalReserved}</td>
                              <td className="px-4 py-3">
                                <span className={`font-semibold ${product.totalAvailable < 5 ? "text-red-600" : "text-green-600"}`}>
                                  {product.totalAvailable}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <StockBar available={product.totalAvailable} total={product.totalQty} />
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button className="text-xs font-medium text-blue-600 hover:underline">
                                  {expandedProduct === product.id ? "Hide" : "Warehouses ↓"}
                                </button>
                              </td>
                            </tr>

                            {/* Warehouse breakdown */}
                            {expandedProduct === product.id &&
                              product.warehouses.map((wh) => (
                                <tr key={wh.warehouseId} className="border-t bg-gray-50/60">
                                  <td className="pl-10 pr-4 py-2 text-sm text-gray-600 italic">
                                    └ {wh.warehouseName}
                                  </td>
                                  <td className="px-4 py-2 text-xs text-gray-400">{wh.location}</td>
                                  <td className="px-4 py-2" />
                                  <td className="px-4 py-2 text-sm">{wh.quantity}</td>
                                  <td className="px-4 py-2 text-sm text-orange-500">{wh.reserved}</td>
                                  <td className="px-4 py-2 text-sm font-medium">{wh.available}</td>
                                  <td className="px-4 py-2">
                                    <StockBar available={wh.available} total={wh.quantity} />
                                  </td>
                                  <td />
                                </tr>
                              ))}
                          </Fragment>
                        ))}
                      </tbody>
                    </table>
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
