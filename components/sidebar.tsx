import {
  LayoutDashboard,
  FileText,
  Plus,
  Users,
  CheckCircle,
  Package,
  Warehouse,
  UserRound,
  Settings,
} from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen border-r bg-white p-4">
      {/* Logo */}
      <div className="mb-8 px-3">
        <h1 className="text-xl font-bold">DealFlow360</h1>
        <p className="text-xs text-gray-500">
          Sales Operations
        </p>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">

        {/* Dashboard */}
        <a
          href="#"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100"
        >
          <LayoutDashboard size={18} />
          Dashboard
        </a>

        {/* Sales */}
        <p className="px-3 pt-5 pb-2 text-xs font-semibold text-gray-400">
          SALES
        </p>

        <a
          href="#"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-gray-100"
        >
          <FileText size={18} />
          Quotes
        </a>

        <a
          href="#"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-gray-100"
        >
          <Plus size={18} />
          Create Quote
        </a>

        <a
          href="#"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-gray-100"
        >
          <Users size={18} />
          Customers
        </a>

        {/* Operations */}
        <p className="px-3 pt-5 pb-2 text-xs font-semibold text-gray-400">
          OPERATIONS
        </p>

        <a
          href="#"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-gray-100"
        >
          <CheckCircle size={18} />
          Approvals
        </a>

        <a
          href="#"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-gray-100"
        >
          <Package size={18} />
          Fulfillment
        </a>

        <a
          href="#"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-gray-100"
        >
          <Warehouse size={18} />
          Inventory
        </a>

        {/* Customer */}
        <p className="px-3 pt-5 pb-2 text-xs font-semibold text-gray-400">
          CUSTOMER
        </p>

        <a
          href="#"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-gray-100"
        >
          <UserRound size={18} />
          Customer Portal
        </a>

        {/* Settings */}
        <div className="pt-5">
          <a
            href="#"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-gray-100"
          >
            <Settings size={18} />
            Settings
          </a>
        </div>

      </nav>
    </aside>
  );
}