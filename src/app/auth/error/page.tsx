'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import MainLayout from "@/app/components/layouts/MainLayout";
import { AlertCircle, ArrowLeft } from "lucide-react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = () => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration.';
      case 'AccessDenied':
        return 'You do not have permission to sign in.';
      case 'Verification':
        return 'The verification link was invalid or has expired.';
      default:
        return 'An unknown error occurred.';
    }
  };

  return (
    <MainLayout>
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl border border-[#F1F5F9] shadow-lg p-8 text-center">
            {/* Icon */}
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-2xl flex items-center justify-center mb-6">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>

            {/* Header */}
            <h1 className="text-2xl font-bold text-[#0F172A] mb-2">
              Authentication Error
            </h1>
            <p className="text-[#475569] mb-6">
              {getErrorMessage()}
            </p>

            {/* Action */}
            <Link
              href="/auth/signin"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#FF6B6B] text-white font-semibold hover:bg-[#EF5350] transition-colors shadow-lg shadow-[#FF6B6B]/25"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Try signing in again</span>
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default function AuthError() {
  return (
    <Suspense fallback={
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-[#F1F5F9] border-t-[#FF6B6B] rounded-full animate-spin" />
        </div>
      </MainLayout>
    }>
      <ErrorContent />
    </Suspense>
  );
}
