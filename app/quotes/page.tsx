import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";
import QuoteList from "@/components/quotes/quote-list";

export default function QuotesPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">

      <Sidebar />

      <div className="flex flex-1 flex-col">

        <Navbar />

        <main className="flex-1 p-8">
          <QuoteList />
        </main>

      </div>

    </div>
  );
}