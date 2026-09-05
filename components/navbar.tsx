import { Bell, Search } from "lucide-react";

export default function Navbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">

      {/* Search */}
      <div className="flex items-center gap-3">
        <Search size={18} className="text-gray-400" />

        <input
          type="text"
          placeholder="Search..."
          className="w-64 bg-transparent text-sm outline-none placeholder:text-gray-400"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-5">

        {/* Notifications */}
        <button className="relative rounded-full p-2 hover:bg-gray-100">
          <Bell size={20} />

          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* User */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold">
            D
          </div>

          <div>
            <p className="text-sm font-medium">
              Dharithri
            </p>

            <p className="text-xs text-gray-500">
              Sales Representative
            </p>
          </div>
        </div>

      </div>
    </header>
  );
}
