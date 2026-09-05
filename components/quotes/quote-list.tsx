import StatusBadge from "@/components/status-badge";
import { Search, Plus, MoreHorizontal } from "lucide-react";

const quotes = [
  {
    id: "Q-1024",
    customer: "ABC Corporation",
    amount: "₹1,20,000",
    status: "pending" as const,
    date: "Sep 5, 2026",
  },
  {
    id: "Q-1023",
    customer: "XYZ Limited",
    amount: "₹85,000",
    status: "approved" as const,
    date: "Sep 5, 2026",
  },
  {
    id: "Q-1022",
    customer: "PQR Private Ltd",
    amount: "₹2,40,000",
    status: "approved" as const,
    date: "Sep 4, 2026",
  },
  {
    id: "Q-1021",
    customer: "LMN Corporation",
    amount: "₹1,50,000",
    status: "draft" as const,
    date: "Sep 4, 2026",
  },
];

export default function QuoteList() {
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

        <button className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
          <Plus size={18} />
          Create Quote
        </button>

      </div>


      {/* Search and Filter */}
      <div className="flex items-center justify-between gap-4">

        <div className="flex flex-1 items-center gap-3 rounded-lg border bg-white px-3 py-2">
          <Search size={18} className="text-gray-400" />

          <input
            type="text"
            placeholder="Search quotes or customers..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

        <select className="rounded-lg border bg-white px-4 py-2 text-sm outline-none">
          <option>All Statuses</option>
          <option>Draft</option>
          <option>Pending</option>
          <option>Approved</option>
          <option>Rejected</option>
        </select>

      </div>


      {/* Quote Table */}
      <div className="overflow-hidden rounded-xl border bg-white">

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

            {quotes.map((quote) => (
              <tr
                key={quote.id}
                className="border-b last:border-0 hover:bg-gray-50"
              >

                <td className="px-6 py-4">
                  <p className="font-medium">
                    {quote.id}
                  </p>
                </td>


                <td className="px-6 py-4">
                  <p className="text-sm">
                    {quote.customer}
                  </p>
                </td>


                <td className="px-6 py-4">
                  <p className="text-sm font-medium">
                    {quote.amount}
                  </p>
                </td>


                <td className="px-6 py-4">
                  <StatusBadge status={quote.status} />
                </td>


                <td className="px-6 py-4">
                  <p className="text-sm text-gray-500">
                    {quote.date}
                  </p>
                </td>


                <td className="px-6 py-4 text-right">
                  <button className="rounded-md p-2 hover:bg-gray-100">
                    <MoreHorizontal size={18} />
                  </button>
                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}