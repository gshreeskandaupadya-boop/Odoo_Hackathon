"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Plus,
  CheckCircle,
  Package,
  Warehouse,
  UserRound,
  TrendingUp,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
};

const navSections: { title: string; items: NavItem[] }[] = [
  {
    title: "",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "SALES",
    items: [
      { href: "/quotes", label: "Quotes", icon: FileText },
      { href: "/quotes/new", label: "Create Quote", icon: Plus },
    ],
  },
  {
    title: "OPERATIONS",
    items: [
      { href: "/approvals", label: "Approvals", icon: CheckCircle },
      { href: "/fulfillment/orders", label: "Fulfillment", icon: Package },
      { href: "/inventory", label: "Inventory", icon: Warehouse },
    ],
  },
  {
    title: "CUSTOMER",
    items: [
      { href: "/customer/quotes", label: "Customer Portal", icon: UserRound },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <aside className="w-64 min-h-screen border-r bg-white p-4 flex flex-col">
      {/* Logo */}
      <div className="mb-8 px-3">
        <div className="flex items-center gap-2">
          <TrendingUp size={20} className="text-blue-600" />
          <h1 className="text-xl font-bold">DealFlow360</h1>
        </div>
        <p className="mt-1 text-xs text-gray-500">Sales Operations Platform</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navSections.map((section) => (
          <div key={section.title} className="mb-4">
            {section.title && (
              <p className="px-3 pb-2 pt-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {section.title}
              </p>
            )}
            {section.items.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    active
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Icon size={18} className={active ? "text-blue-600" : ""} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t pt-4">
        <p className="px-3 text-xs text-gray-400">DealFlow360 · Hackathon Demo</p>
      </div>
    </aside>
  );
}