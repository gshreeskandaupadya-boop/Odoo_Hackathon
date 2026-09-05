import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";
import ApprovalList from "@/components/approvals/approval-list";

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