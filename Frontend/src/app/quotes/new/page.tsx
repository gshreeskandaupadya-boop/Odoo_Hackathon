import Sidebar from "@/frontend/sidebar";
import Navbar from "@/frontend/navbar";
import QuoteBuilder from "@/frontend/quote-builder";

export default function NewQuotePage() {
  return (
    <div className="flex min-h-screen bg-gray-50">

      <Sidebar />

      <div className="flex flex-1 flex-col">

        <Navbar />

        <main className="flex-1 p-8">
          <QuoteBuilder />
        </main>

      </div>

    </div>
  );
}