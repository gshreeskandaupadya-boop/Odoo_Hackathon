"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, TrendingUp } from "lucide-react";

const demoAccounts = [
  { label: "Sales Rep", email: "sales@dealflow360.com", password: "demo-sales-password", color: "bg-blue-500" },
  { label: "Manager", email: "manager@dealflow360.com", password: "demo-manager-password", color: "bg-purple-500" },
  { label: "Finance", email: "finance@dealflow360.com", password: "demo-finance-password", color: "bg-green-500" },
  { label: "Admin", email: "admin@dealflow360.com", password: "demo-admin-password", color: "bg-gray-500" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("sales@dealflow360.com");
  const [password, setPassword] = useState("demo-sales-password");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  function fillAccount(acc: { email: string; password: string }) {
    setEmail(acc.email);
    setPassword(acc.password);
    setError("");
  }

  return (
    <main className="flex min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Left: Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-16 text-white">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
              <TrendingUp size={24} />
            </div>
            <h1 className="text-3xl font-bold">DealFlow360</h1>
          </div>

          <h2 className="text-4xl font-bold leading-tight mb-6">
            Intelligent Sales Operations Platform
          </h2>

          <p className="text-slate-400 text-lg mb-8">
            Dynamic discount risk assessment, manager approvals, upsell recommendations, and warehouse fulfillment — all in one intelligent workflow.
          </p>

          <div className="space-y-4">
            {[
              "🎯 Discount Engine with risk scoring",
              "✅ Approval workflow for high-risk quotes",
              "📦 Automatic warehouse allocation",
              "💬 Customer negotiation portal",
              "🔥 Upsell recommendations",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3 text-slate-300">
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Login */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 lg:px-16">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-8 shadow-2xl">
            <div className="mb-8">
              <div className="flex items-center gap-2 lg:hidden mb-4">
                <TrendingUp size={20} className="text-blue-400" />
                <span className="text-lg font-bold text-white">DealFlow360</span>
              </div>
              <h2 className="text-2xl font-bold text-white">Sign in</h2>
              <p className="mt-1 text-sm text-slate-400">Access your sales operations dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {error && (
                <p className="rounded-lg bg-red-950 px-4 py-3 text-sm text-red-300">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" /> Signing in...
                  </span>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            {/* Demo Accounts */}
            <div className="mt-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Demo Accounts</p>
              <div className="grid grid-cols-2 gap-2">
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.email}
                    onClick={() => fillAccount(acc)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition hover:opacity-80 ${
                      email === acc.email
                        ? "border-2 border-blue-500 bg-slate-800"
                        : "border border-slate-700 bg-slate-800/50"
                    }`}
                  >
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${acc.color} text-[10px] font-bold text-white`}>
                      {acc.label[0]}
                    </span>
                    <span className="text-slate-300">{acc.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
