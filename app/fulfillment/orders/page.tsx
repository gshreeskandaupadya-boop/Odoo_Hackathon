"use client";

import { useMemo, useState } from "react";

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
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type OrderStatus =
  | "Pending"
  | "Processing"
  | "Packed"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

type Product = {
  name: string;
  quantity: number;
  price: number;
};

type FulfillmentOrder = {
  id: string;
  quoteId: string;
  customer: string;
  email: string;
  warehouse: string;
  products: Product[];
  status: OrderStatus;
  date: string;
};

type TimelineEvent = {
  id: number;
  title: string;
  description: string;
  date: string;
  completed: boolean;
};

const initialOrders: FulfillmentOrder[] = [
  {
    id: "FO-1005",
    quoteId: "Q-1025",
    customer: "ABC Corporation",
    email: "procurement@abccorp.com",
    warehouse: "Bangalore Warehouse",
    products: [
      {
        name: "Business Laptop",
        quantity: 10,
        price: 82000,
      },
    ],
    status: "Pending",
    date: "Sep 5, 2026",
  },
  {
    id: "FO-1004",
    quoteId: "Q-1022",
    customer: "XYZ Limited",
    email: "orders@xyzlimited.com",
    warehouse: "Mumbai Warehouse",
    products: [
      {
        name: "USB-C Dock",
        quantity: 8,
        price: 7000,
      },
    ],
    status: "Processing",
    date: "Sep 4, 2026",
  },
  {
    id: "FO-1003",
    quoteId: "Q-1021",
    customer: "PQR Private Ltd",
    email: "purchase@pqr.com",
    warehouse: "Delhi Warehouse",
    products: [
      {
        name: "Laptop Bag",
        quantity: 15,
        price: 3000,
      },
      {
        name: "Wireless Mouse",
        quantity: 15,
        price: 1500,
      },
    ],
    status: "Packed",
    date: "Sep 3, 2026",
  },
  {
    id: "FO-1002",
    quoteId: "Q-1019",
    customer: "Tech Solutions Pvt Ltd",
    email: "admin@techsolutions.com",
    warehouse: "Bangalore Warehouse",
    products: [
      {
        name: "27-inch Monitor",
        quantity: 5,
        price: 28000,
      },
    ],
    status: "Shipped",
    date: "Sep 1, 2026",
  },
  {
    id: "FO-1001",
    quoteId: "Q-1015",
    customer: "Global Systems",
    email: "orders@globalsystems.com",
    warehouse: "Mumbai Warehouse",
    products: [
      {
        name: "Keyboard",
        quantity: 20,
        price: 2500,
      },
    ],
    status: "Delivered",
    date: "Aug 28, 2026",
  },
  {
    id: "FO-0999",
    quoteId: "Q-1012",
    customer: "Metro Industries",
    email: "purchase@metroindustries.com",
    warehouse: "Delhi Warehouse",
    products: [
      {
        name: "Webcam",
        quantity: 10,
        price: 4500,
      },
    ],
    status: "Cancelled",
    date: "Aug 25, 2026",
  },
];

const initialTimeline: Record<
  string,
  TimelineEvent[]
> = {};

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
    case "Delivered":
      return "secondary";

    case "Cancelled":
      return "destructive";

    case "Processing":
    case "Packed":
    case "Shipped":
      return "outline";

    default:
      return "default";
  }
}

function getStatusDescription(status: OrderStatus) {
  switch (status) {
    case "Pending":
      return "Order is waiting to be processed.";

    case "Processing":
      return "Warehouse team is preparing the order.";

    case "Packed":
      return "Products have been packed and are ready for shipment.";

    case "Shipped":
      return "Order has been handed over to the carrier.";

    case "Delivered":
      return "Order has been successfully delivered.";

    case "Cancelled":
      return "Order was cancelled and will not be fulfilled.";

    default:
      return "";
  }
}

function getNextStatus(
  status: OrderStatus
): OrderStatus | null {
  switch (status) {
    case "Pending":
      return "Processing";

    case "Processing":
      return "Packed";

    case "Packed":
      return "Shipped";

    case "Shipped":
      return "Delivered";

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
      title: "Order Created",
      description:
        "Fulfillment order created from approved quotation.",
    },
    {
      title: "Processing",
      description:
        "Warehouse team started preparing the order.",
    },
    {
      title: "Packed",
      description:
        "Products were picked and packed.",
    },
    {
      title: "Shipped",
      description:
        "Package handed over to shipping carrier.",
    },
    {
      title: "Delivered",
      description:
        "Package delivered to customer.",
    },
  ];

  const statusIndex =
    status === "Pending"
      ? 0
      : status === "Processing"
        ? 1
        : status === "Packed"
          ? 2
          : status === "Shipped"
            ? 3
            : status === "Delivered"
              ? 4
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
    (order) => order.status === "Pending"
  ).length;

  const processingOrders = orders.filter(
    (order) =>
      order.status === "Processing" ||
      order.status === "Packed"
  ).length;

  const completedOrders = orders.filter(
    (order) => order.status === "Delivered"
  ).length;

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const searchText =
        search.toLowerCase();

      const matchesSearch =
        order.id
          .toLowerCase()
          .includes(searchText) ||
        order.quoteId
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

  const updateOrderStatus = (
    orderId: string,
    newStatus: OrderStatus
  ) => {
    setOrders((current) =>
      current.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: newStatus,
            }
          : order
      )
    );

    setSelectedOrder((current) =>
      current?.id === orderId
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

    updateOrderStatus(
      selectedOrder.id,
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
              "Pending",
              "Processing",
              "Packed",
              "Shipped",
              "Delivered",
              "Cancelled",
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

                {filteredOrders.map(
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
                            {order.id}
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
                "Cancelled" ? (
                  <XCircle
                    size={21}
                  />
                ) : selectedOrder.status ===
                  "Delivered" ? (
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
            {selectedOrder.status !==
              "Delivered" &&
              selectedOrder.status !==
                "Cancelled" && (

              <div>

                <h3 className="mb-3 font-semibold">
                  Fulfillment Actions
                </h3>

                <div className="flex flex-wrap gap-3">

                  <Button
                    onClick={handleNextStep}
                  >
                    {selectedOrder.status ===
                      "Pending" &&
                      "Start Fulfillment"}

                    {selectedOrder.status ===
                      "Processing" &&
                      "Mark Packed"}

                    {selectedOrder.status ===
                      "Packed" &&
                      "Mark Shipped"}

                    {selectedOrder.status ===
                      "Shipped" &&
                      "Mark Delivered"}

                    <ArrowRight size={16} />

                  </Button>


                  <Button
                    variant="outline"
                    onClick={() =>
                      updateOrderStatus(
                        selectedOrder.id,
                        "Cancelled"
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
              "Cancelled" && (

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