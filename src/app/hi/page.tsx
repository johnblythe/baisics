import Header from "@/components/Header";
import ConversationalIntakeContainer from "./components/ConversationalIntakeContainer";
import Footer from "@/components/Footer";

export default function HiPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <Header />
      <main className="flex-grow pt-16">
        <ConversationalIntakeContainer />
      </main>
      <Footer />
    </div>
  );
} 