import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";
import DashboardOverview from "@/components/dashboard/overview";

export default function Home() {
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