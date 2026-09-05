import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import StatusBadge from "@/components/status-badge";

export default function DashboardOverview() {
  return (
    <div className="space-y-8">

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Good morning, Dharithri 👋
        </h1>

        <p className="mt-2 text-gray-500">
          Here's what's happening with your sales today.
        </p>
      </div>

      {/* KPI Cards */}
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-gray-500">
        Total Quotes
      </CardTitle>
    </CardHeader>

    <CardContent>
      <p className="text-3xl font-bold">
        24
      </p>

      <p className="mt-2 text-xs text-gray-500">
        +12% from last month
      </p>
    </CardContent>
  </Card>


  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-gray-500">
        Pending Approvals
      </CardTitle>
    </CardHeader>

    <CardContent>
      <p className="text-3xl font-bold">
        5
      </p>

      <p className="mt-2 text-xs text-gray-500">
        Requires attention
      </p>
    </CardContent>
  </Card>


  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-gray-500">
        Approved Quotes
      </CardTitle>
    </CardHeader>

    <CardContent>
      <p className="text-3xl font-bold">
        16
      </p>

      <p className="mt-2 text-xs text-gray-500">
        67% approval rate
      </p>
    </CardContent>
  </Card>


  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-gray-500">
        Orders
      </CardTitle>
    </CardHeader>

    <CardContent>
      <p className="text-3xl font-bold">
        8
      </p>

      <p className="mt-2 text-xs text-gray-500">
        This month
      </p>
    </CardContent>
  </Card>

</div>


      {/* Lower Section */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Recent Quotes */}
        <div className="rounded-xl border bg-white p-6 lg:col-span-2">

          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                Recent Quotes
              </h2>

              <p className="text-sm text-gray-500">
                Latest quotation activity
              </p>
            </div>

            <button className="text-sm font-medium hover:underline">
              View all
            </button>
          </div>


          <div className="space-y-4">

            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <p className="font-medium">
                  Q-1024
                </p>

                <p className="text-sm text-gray-500">
                  ABC Corporation
                </p>
              </div>

              <div className="text-right">
                <p className="font-medium">
                  ₹1,20,000
                </p>

                <StatusBadge status="pending" />
              </div>
            </div>


            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <p className="font-medium">
                  Q-1023
                </p>

                <p className="text-sm text-gray-500">
                  XYZ Limited
                </p>
              </div>

              <div className="text-right">
                <p className="font-medium">
                  ₹85,000
                </p>

                <p className="text-sm text-green-600">
                  Approved
                </p>
              </div>
            </div>


            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  Q-1022
                </p>

                <p className="text-sm text-gray-500">
                  PQR Private Ltd
                </p>
              </div>

              <div className="text-right">
                <p className="font-medium">
                  ₹2,40,000
                </p>

                <StatusBadge status="approved" />
              </div>
            </div>

          </div>
        </div>


        {/* Action Required */}
        <div className="rounded-xl border bg-white p-6">

          <h2 className="text-lg font-semibold">
            Action Required
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Items that need your attention
          </p>


          <div className="mt-6 rounded-lg border p-4">

            <p className="font-medium">
              ⚠ Pending Approvals
            </p>

            <p className="mt-2 text-sm text-gray-500">
              5 quotes are waiting for approval.
            </p>

            <button className="mt-4 text-sm font-medium hover:underline">
              View Approvals →
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}