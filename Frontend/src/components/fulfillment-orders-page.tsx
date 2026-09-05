"use client";

import { useEffect, useMemo, useState } from "react";

import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Package,
  Search,
  Truck,
  X,
  XCircle,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/frontend/ui-card";

import { Button } from "@/frontend/ui-button";
import { Input } from "@/frontend/ui-input";
import { Badge } from "@/frontend/ui-badge";

type OrderStatus = "CONFIRMED" | "PROCESSING" | "PARTIALLY_FULFILLED" | "FULFILLED" | "BACKORDERED" | "CANCELLED";

type Product = {
  name: string;
  quantity: number;
  price: number;
};

type FulfillmentOrder = {
  id: number;
  orderNumber: string;
  quoteId: number;
  customer: string;
  email: string;
  warehouse: string;
  products: Product[];
  status: OrderStatus;
  date: string;
  shortageQty: number;
};

type TimelineEvent = {
  id: number;
  title: string;
  description: string;
  date: string;
  completed: boolean;
};

const initialOrders: FulfillmentOrder[] = [];

function calculateTotal(order: FulfillmentOrder) {
  return order.products.reduce(
    (total, product) =>
      total +
      product.quantity * product.price,
    0
  );
}

function getStatusVariant(status: OrderStatus) {
  switch (status) {
    case "FULFILLED":
      return "secondary";

    case "CANCELLED":
      return "destructive";

    case "PROCESSING":
    case "PARTIALLY_FULFILLED":
      return "outline";

    default:
      return "default";
  }
}

function getStatusDescription(status: OrderStatus) {
  switch (status) {
    case "CONFIRMED":
      return "Order is confirmed and waiting for warehouse processing.";
    case "PROCESSING":
      return "Warehouse team is preparing the order.";
    case "PARTIALLY_FULFILLED":
      return "Some inventory is allocated and the remaining quantity is backordered.";
    case "FULFILLED":
      return "All requested inventory has been allocated.";
    case "BACKORDERED":
      return "No inventory was available for allocation.";
    case "CANCELLED":
      return "Order was cancelled and will not be fulfilled.";
    default:
      return "";
  }
}

function getNextStatus(
  status: OrderStatus
): OrderStatus | null {
  switch (status) {
    case "CONFIRMED":
      return "PROCESSING";

    default:
      return null;
  }
}

function createTimeline(
  status: OrderStatus
): TimelineEvent[] {
  const steps: {
    title: string;
    description: string;
  }[] = [
    {
      title: "Order Confirmed",
      description:
        "Fulfillment order created from approved quotation.",
    },
    {
      title: "Processing",
      description:
        "Warehouse team started preparing the order.",
    },
    {
      title: "Inventory Allocated",
      description: "Inventory was allocated across available warehouses.",
    },
  ];

  const statusIndex =
    status === "CONFIRMED"
      ? 0
      : status === "PROCESSING"
        ? 1
        : status === "FULFILLED" || status === "PARTIALLY_FULFILLED"
          ? 2
          : -1;

  return steps.map((step, index) => ({
    id: index + 1,
    title: step.title,
    description: step.description,
    date:
      index <= statusIndex
        ? "Completed"
        : "Waiting",
    completed:
      index <= statusIndex,
  }));
}

export default function FulfillmentOrdersPage() {
  const [orders, setOrders] =
    useState<FulfillmentOrder[]>(
      initialOrders
    );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((response) => response.json())
      .then((data) => {
        if (!data.success) return;
        setOrders(data.orders.map((order: {
          id: number;
          orderNumber: string;
          quoteId: number;
          totalAmount: number;
          status: OrderStatus;
          shortageQty: number;
          createdAt: string;
          customer: { company: string; email: string } | null;
          items: Array<{ quantity: number; unitPrice: number; product: { name: string } | null }>;
          allocations: Array<{ warehouseId: number }>;
        }) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          quoteId: order.quoteId,
          customer: order.customer?.company ?? "Unknown customer",
          email: order.customer?.email ?? "",
          warehouse: `${order.allocations.length} warehouse${order.allocations.length === 1 ? "" : "s"}`,
          products: order.items.map((item) => ({
            name: item.product?.name ?? "Unknown product",
            quantity: item.quantity,
            price: item.unitPrice,
          })),
          status: order.status,
          date: new Date(order.createdAt).toLocaleDateString("en-IN"),
          shortageQty: order.shortageQty,
        })));
      })
      .finally(() => setLoading(false));
  }, []);

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState<
    "All" | OrderStatus
  >("All");

  const [selectedOrder, setSelectedOrder] =
    useState<FulfillmentOrder | null>(
      null
    );

  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) => order.status === "CONFIRMED"
  ).length;

  const processingOrders = orders.filter(
    (order) =>
      order.status === "PROCESSING" ||
      order.status === "PARTIALLY_FULFILLED" ||
      order.status === "BACKORDERED"
  ).length;

  const completedOrders = orders.filter(
    (order) => order.status === "FULFILLED"
  ).length;

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const searchText =
        search.toLowerCase();

      const matchesSearch =
        String(order.id)
          .toLowerCase()
          .includes(searchText) ||
        String(order.quoteId)
          .toLowerCase()
          .includes(searchText) ||
        order.customer
          .toLowerCase()
          .includes(searchText) ||
        order.warehouse
          .toLowerCase()
          .includes(searchText);

      const matchesFilter =
        filter === "All" ||
        order.status === filter;

      return (
        matchesSearch &&
        matchesFilter
      );
    });
  }, [orders, search, filter]);

  const updateOrderStatus = async (
    orderId: string,
    newStatus: OrderStatus
  ) => {
    const response = await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: Number(orderId), status: newStatus }),
    });

    if (!response.ok) return;

    setOrders((current) =>
      current.map((order) =>
        String(order.id) === orderId
          ? {
              ...order,
              status: newStatus,
            }
          : order
      )
    );

    setSelectedOrder((current) =>
      current && String(current.id) === orderId
        ? {
            ...current,
            status: newStatus,
          }
        : current
    );
  };

  const handleNextStep = () => {
    if (!selectedOrder) {
      return;
    }

    const nextStatus = getNextStatus(
      selectedOrder.status
    );

    if (!nextStatus) {
      return;
    }

    void updateOrderStatus(
      String(selectedOrder.id),
      nextStatus
    );
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>

        <h1 className="text-3xl font-bold tracking-tight">
          Fulfillment Orders
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage approved orders from warehouse processing to delivery.
        </p>

      </div>


      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <Card>

          <CardHeader className="pb-2">

            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Package size={16} />
              Total Orders
            </CardTitle>

          </CardHeader>

          <CardContent>

            <p className="text-3xl font-bold">
              {totalOrders}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Fulfillment orders
            </p>

          </CardContent>

        </Card>


        <Card>

          <CardHeader className="pb-2">

            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Clock3 size={16} />
              Pending Fulfillment
            </CardTitle>

          </CardHeader>

          <CardContent>

            <p className="text-3xl font-bold">
              {pendingOrders}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Waiting for processing
            </p>

          </CardContent>

        </Card>


        <Card>

          <CardHeader className="pb-2">

            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Package size={16} />
              Processing
            </CardTitle>

          </CardHeader>

          <CardContent>

            <p className="text-3xl font-bold">
              {processingOrders}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Processing or packed
            </p>

          </CardContent>

        </Card>


        <Card>

          <CardHeader className="pb-2">

            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CheckCircle2 size={16} />
              Completed
            </CardTitle>

          </CardHeader>

          <CardContent>

            <p className="text-3xl font-bold">
              {completedOrders}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Successfully delivered
            </p>

          </CardContent>

        </Card>

      </div>


      {/* Orders */}
      <Card>

        <CardHeader>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <CardTitle>
                Fulfillment Orders
              </CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                Track and process customer orders.
              </p>

            </div>


            <div className="relative w-full lg:w-80">

              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />

              <Input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search order, quote or customer..."
                className="pl-9"
              />

            </div>

          </div>

        </CardHeader>


        <CardContent>

          {/* Filters */}
            <div className="mb-5 flex flex-wrap gap-2">

            {[
              "All",
              "CONFIRMED",
              "PROCESSING",
              "PARTIALLY_FULFILLED",
              "FULFILLED",
              "BACKORDERED",
              "CANCELLED",
            ].map((option) => (

              <Button
                key={option}
                size="sm"
                variant={
                  filter === option
                    ? "default"
                    : "outline"
                }
                onClick={() =>
                  setFilter(
                    option as
                      | "All"
                      | OrderStatus
                  )
                }
              >
                {option}
              </Button>

            ))}

          </div>


          {/* Table */}
          <div className="overflow-x-auto rounded-lg border">

            <table className="w-full text-sm">

              <thead className="bg-muted/40">

                <tr>

                  <th className="p-4 text-left">
                    Order
                  </th>

                  <th className="p-4 text-left">
                    Quote
                  </th>

                  <th className="p-4 text-left">
                    Customer
                  </th>

                  <th className="p-4 text-left">
                    Products
                  </th>

                  <th className="p-4 text-left">
                    Quantity
                  </th>

                  <th className="p-4 text-left">
                    Order Value
                  </th>

                  <th className="p-4 text-left">
                    Status
                  </th>

                  <th className="p-4 text-left">
                    Date
                  </th>

                  <th className="p-4 text-right">
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {loading ? (
                  <tr><td colSpan={9} className="p-10 text-center text-muted-foreground">Loading orders...</td></tr>
                ) : filteredOrders.map(
                  (order) => {

                    const quantity =
                      order.products.reduce(
                        (total, product) =>
                          total +
                          product.quantity,
                        0
                      );

                    return (

                      <tr
                        key={order.id}
                        className="border-t hover:bg-muted/20"
                      >

                        <td className="p-4">

                          <p className="font-semibold">
                            {order.orderNumber}
                          </p>

                        </td>


                        <td className="p-4">
                          {order.quoteId}
                        </td>


                        <td className="p-4">

                          <p className="font-medium">
                            {order.customer}
                          </p>

                        </td>


                        <td className="p-4">

                          <p>
                            {order.products[0]
                              ?.name}
                          </p>

                          {order.products.length >
                            1 && (

                            <p className="text-xs text-muted-foreground">
                              +
                              {order.products.length -
                                1}{" "}
                              more
                            </p>

                          )}

                        </td>


                        <td className="p-4">
                          {quantity}
                        </td>


                        <td className="p-4 font-medium">
                          ₹
                          {calculateTotal(
                            order
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </td>


                        <td className="p-4">

                          <Badge
                            variant={getStatusVariant(
                              order.status
                            )}
                          >
                            {order.status}
                          </Badge>

                        </td>


                        <td className="p-4 text-muted-foreground">
                          {order.date}
                        </td>


                        <td className="p-4 text-right">

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setSelectedOrder(
                                order
                              )
                            }
                          >
                            View
                          </Button>

                        </td>

                      </tr>

                    );
                  }
                )}


                {filteredOrders.length ===
                  0 && (

                  <tr>

                    <td
                      colSpan={9}
                      className="p-10 text-center text-muted-foreground"
                    >
                      No fulfillment orders found.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </CardContent>

      </Card>


      {/* Order Details */}
      {selectedOrder && (

        <Card>

          <CardHeader>

            <div className="flex items-start justify-between">

              <div>

                <div className="flex flex-wrap items-center gap-3">

                  <CardTitle>
                    {selectedOrder.id}
                  </CardTitle>

                  <Badge
                    variant={getStatusVariant(
                      selectedOrder.status
                    )}
                  >
                    {selectedOrder.status}
                  </Badge>

                </div>

                <p className="mt-1 text-sm text-muted-foreground">
                  Created from quote{" "}
                  {selectedOrder.quoteId}
                </p>

              </div>


              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setSelectedOrder(null)
                }
              >
                <X size={18} />
              </Button>

            </div>

          </CardHeader>


          <CardContent className="space-y-6">

            {/* Customer */}
            <div>

              <h3 className="mb-3 font-semibold">
                Customer Information
              </h3>

              <div className="grid gap-4 md:grid-cols-3">

                <div className="rounded-lg border p-4">

                  <p className="text-xs text-muted-foreground">
                    Customer
                  </p>

                  <p className="mt-1 font-medium">
                    {selectedOrder.customer}
                  </p>

                </div>


                <div className="rounded-lg border p-4">

                  <p className="text-xs text-muted-foreground">
                    Email
                  </p>

                  <p className="mt-1 font-medium">
                    {selectedOrder.email}
                  </p>

                </div>


                <div className="rounded-lg border p-4">

                  <p className="text-xs text-muted-foreground">
                    Warehouse
                  </p>

                  <p className="mt-1 font-medium">
                    {selectedOrder.warehouse}
                  </p>

                </div>

              </div>

            </div>


            {/* Products */}
            <div>

              <h3 className="mb-3 font-semibold">
                Order Products
              </h3>

              <div className="overflow-hidden rounded-lg border">

                <table className="w-full text-sm">

                  <thead className="bg-muted/40">

                    <tr>

                      <th className="p-4 text-left">
                        Product
                      </th>

                      <th className="p-4 text-left">
                        Quantity
                      </th>

                      <th className="p-4 text-left">
                        Unit Price
                      </th>

                      <th className="p-4 text-right">
                        Total
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {selectedOrder.products.map(
                      (product) => (

                        <tr
                          key={product.name}
                          className="border-t"
                        >

                          <td className="p-4 font-medium">
                            {product.name}
                          </td>

                          <td className="p-4">
                            {product.quantity}
                          </td>

                          <td className="p-4">
                            ₹
                            {product.price.toLocaleString(
                              "en-IN"
                            )}
                          </td>

                          <td className="p-4 text-right font-medium">
                            ₹
                            {(
                              product.quantity *
                              product.price
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>


                  <tfoot>

                    <tr className="border-t">

                      <td
                        colSpan={3}
                        className="p-4 text-right font-semibold"
                      >
                        Total
                      </td>

                      <td className="p-4 text-right text-lg font-bold">
                        ₹
                        {calculateTotal(
                          selectedOrder
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </td>

                    </tr>

                  </tfoot>

                </table>

              </div>

            </div>


            {/* Inventory Check */}
            <div>

              <h3 className="mb-3 font-semibold">
                Inventory Check
              </h3>

              <div className="flex items-start gap-3 rounded-lg border p-4">

                <CheckCircle2
                  size={20}
                  className="mt-0.5"
                />

                <div>

                  <p className="font-medium">
                    Inventory available
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Required products are available at{" "}
                    {selectedOrder.warehouse}.
                  </p>

                </div>

              </div>

            </div>


            {/* Timeline */}
            <div>

              <h3 className="mb-4 font-semibold">
                Fulfillment Timeline
              </h3>


              <div className="space-y-0">

                {createTimeline(
                  selectedOrder.status
                ).map(
                  (event, index) => (

                    <div
                      key={event.id}
                      className="flex gap-4"
                    >

                      <div className="flex flex-col items-center">

                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-full border ${
                            event.completed
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >

                          {event.completed ? (
                            <CheckCircle2
                              size={17}
                            />
                          ) : (
                            <Clock3
                              size={17}
                            />
                          )}

                        </div>


                        {index <
                          createTimeline(
                            selectedOrder.status
                          ).length -
                            1 && (

                          <div
                            className={`h-10 w-px ${
                              event.completed
                                ? "bg-primary"
                                : "bg-border"
                            }`}
                          />

                        )}

                      </div>


                      <div className="pb-7">

                        <p className="font-medium">
                          {event.title}
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {event.description}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {event.date}
                        </p>

                      </div>

                    </div>

                  )
                )}

              </div>

            </div>


            {/* Current Status */}
            <div className="rounded-lg border p-5">

              <div className="flex items-start gap-3">

                {selectedOrder.status ===
                "CANCELLED" ? (
                  <XCircle
                    size={21}
                  />
                ) : selectedOrder.status ===
                  "FULFILLED" ? (
                  <CheckCircle2
                    size={21}
                  />
                ) : (
                  <Truck
                    size={21}
                  />
                )}

                <div>

                  <p className="font-semibold">
                    {selectedOrder.status}
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {getStatusDescription(
                      selectedOrder.status
                    )}
                  </p>

                </div>

              </div>

            </div>


            {/* Actions */}
            {selectedOrder.status !== "FULFILLED" &&
              selectedOrder.status !== "PARTIALLY_FULFILLED" &&
              selectedOrder.status !== "BACKORDERED" &&
              selectedOrder.status !==
                "CANCELLED" && (

              <div>

                <h3 className="mb-3 font-semibold">
                  Fulfillment Actions
                </h3>

                <div className="flex flex-wrap gap-3">

                  <Button
                    onClick={handleNextStep}
                  >
                    {selectedOrder.status ===
                      "CONFIRMED" &&
                      "Start Fulfillment"}

                    {selectedOrder.status ===
                      "PROCESSING" &&
                      "Refresh Status"}

                    <ArrowRight size={16} />

                  </Button>


                  <Button
                    variant="outline"
                    onClick={() =>
                      void updateOrderStatus(
                        String(selectedOrder.id),
                        "CANCELLED"
                      )
                    }
                  >
                    <XCircle size={16} />
                    Cancel Order
                  </Button>

                </div>

              </div>

            )}


            {/* Cancelled warning */}
            {selectedOrder.status ===
              "CANCELLED" && (

              <div className="flex items-start gap-3 rounded-lg border p-4">

                <AlertTriangle
                  size={20}
                  className="mt-0.5"
                />

                <div>

                  <p className="font-medium">
                    Order cancelled
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    This fulfillment order is no longer active.
                  </p>

                </div>

              </div>

            )}


            {/* Close */}
            <div className="flex justify-end">

              <Button
                variant="outline"
                onClick={() =>
                  setSelectedOrder(null)
                }
              >
                Close Details
              </Button>

            </div>

          </CardContent>

        </Card>

      )}

    </div>
  );
}