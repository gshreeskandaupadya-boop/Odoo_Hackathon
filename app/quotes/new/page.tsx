import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";
import QuoteBuilder from "@/components/quotes/quote-builder";

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