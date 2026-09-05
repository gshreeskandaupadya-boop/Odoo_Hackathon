import Sidebar from "@/frontend/sidebar";
import Navbar from "@/frontend/navbar";
import ApprovalList from "@/frontend/approval-list";

export default function ApprovalsPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">

      <Sidebar />

      <div className="flex flex-1 flex-col">

        <Navbar />

        <main className="flex-1 p-8">
          <ApprovalList />
        </main>

      </div>

    </div>
  );
}