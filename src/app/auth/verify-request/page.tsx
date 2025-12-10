import MainLayout from "@/app/components/layouts/MainLayout";
import { Mail, Inbox } from "lucide-react";
import Link from "next/link";

export default function VerifyRequest() {
  return (
    <MainLayout>
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="max-w-md w-full">
          {/* Card */}
          <div className="bg-white rounded-2xl border border-[#F1F5F9] shadow-lg p-8 text-center">
            {/* Icon */}
            <div className="w-16 h-16 mx-auto bg-[#FFE5E5] rounded-2xl flex items-center justify-center mb-6">
              <Mail className="w-8 h-8 text-[#FF6B6B]" />
            </div>

            {/* Header */}
            <h1 className="text-2xl font-bold text-[#0F172A] mb-2">
              Check your email
            </h1>
            <p className="text-[#475569] mb-6">
              A sign in link has been sent to your email address.
            </p>

            {/* Instructions */}
            <div className="bg-[#F8FAFC] rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3 text-left">
                <div className="w-8 h-8 bg-[#0F172A] rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Inbox className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#0F172A] mb-1">
                    Click the link in your email to sign in
                  </p>
                  <p className="text-sm text-[#94A3B8]">
                    If you don&apos;t see it, check your spam folder.
                  </p>
                </div>
              </div>
            </div>

            {/* Back link */}
            <Link
              href="/auth/signin"
              className="text-sm text-[#FF6B6B] hover:text-[#EF5350] font-medium transition-colors"
            >
              Use a different email
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
