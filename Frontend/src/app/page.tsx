import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import Sidebar from "@/frontend/sidebar";
import Navbar from "@/frontend/navbar";
import DashboardOverview from "@/frontend/dashboard-overview";
import { authOptions } from "@/backend/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <Navbar />

        <main className="flex-1 p-8">
          <DashboardOverview />
        </main>
      </div>
    </div>
  );
}