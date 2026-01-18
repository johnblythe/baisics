import type { Metadata } from 'next';
import ConversationalIntakeContainer from "./components/ConversationalIntakeContainer";
import MainLayout from "@/app/components/layouts/MainLayout";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: 'Get Started | baisics',
};

export default function HiPage() {
  return (
    <MainLayout>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-6 h-6 border-2 border-[#F1F5F9] border-t-[#FF6B6B] rounded-full animate-spin"></div>
        </div>
      }>
        <ConversationalIntakeContainer />
      </Suspense>
    </MainLayout>
  );
}