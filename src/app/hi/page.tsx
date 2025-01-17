import Header from "@/components/Header";
import ConversationalIntakeContainer from "./components/ConversationalIntakeContainer";
import Footer from "@/components/Footer";
import MainLayout from "@/app/components/layouts/MainLayout";
import { Suspense } from "react";
import TawkChat from "@/components/TawkChat";
export default function HiPage() {
  return (
    <MainLayout>
      <Suspense fallback={
        <>
          <Header />
          <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
            <div className="w-6 h-6 border-t-2 border-blue-500 border-solid rounded-full animate-spin"></div>
          </div>
          <TawkChat />
          <Footer />
        </>
      }>
        <ConversationalIntakeContainer />
      </Suspense>
    </MainLayout>
  );
}