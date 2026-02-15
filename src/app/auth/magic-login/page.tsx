"use client";

import { Suspense, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import MainLayout from "@/app/components/layouts/MainLayout";
import { Shield, Copy, Check, ExternalLink } from "lucide-react";
import Link from "next/link";

function MagicLoginContent() {
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState(false);

  const callbackUrl = searchParams.get("callbackUrl");

  const email = useMemo(() => {
    if (!callbackUrl) return null;
    try {
      const url = new URL(callbackUrl);
      return url.searchParams.get("email");
    } catch {
      return null;
    }
  }, [callbackUrl]);

  const handleCopy = async () => {
    if (!callbackUrl) return;
    try {
      await navigator.clipboard.writeText(callbackUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select text in a hidden input
    }
  };

  if (!callbackUrl) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl border border-[#F1F5F9] shadow-lg p-8">
            <h1 className="text-2xl font-bold text-[#0F172A] mb-2">
              Invalid link
            </h1>
            <p className="text-[#475569] mb-6">
              This sign-in link is invalid or has expired.
            </p>
            <Link
              href="/auth/signin"
              className="text-sm text-[#FF6B6B] hover:text-[#EF5350] font-medium"
            >
              Request a new link &rarr;
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl border border-[#F1F5F9] shadow-lg p-8 text-center">
          {/* Icon */}
          <div className="w-16 h-16 mx-auto bg-[#FFE5E5] rounded-2xl flex items-center justify-center mb-6">
            <Shield className="w-8 h-8 text-[#FF6B6B]" />
          </div>

          {/* Header */}
          <h1 className="text-2xl font-bold text-[#0F172A] mb-2">
            Confirm sign in
          </h1>
          <p className="text-[#475569] mb-8">
            {email ? (
              <>
                Tap below to sign in as{" "}
                <strong className="text-[#0F172A]">{email}</strong>
              </>
            ) : (
              "Tap below to complete your sign in"
            )}
          </p>

          {/* Sign In Button */}
          <a
            href={callbackUrl}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-[#FF6B6B] text-white font-semibold hover:bg-[#EF5350] transition-colors shadow-lg shadow-[#FF6B6B]/25 text-lg"
          >
            Sign in to Baisics
            <ExternalLink className="w-5 h-5" />
          </a>

          {/* Copy link fallback */}
          <div className="mt-6 pt-6 border-t border-[#F1F5F9]">
            <p className="text-xs text-[#94A3B8] mb-3">
              Opened in the wrong browser? Copy this link and paste it in your browser.
            </p>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#F1F5F9] text-sm text-[#475569] hover:bg-[#F8FAFC] transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy sign-in link
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl border border-[#F1F5F9] shadow-lg p-8">
          <div className="w-16 h-16 mx-auto bg-[#F1F5F9] rounded-2xl animate-pulse mb-6" />
          <div className="h-7 bg-[#F1F5F9] rounded-lg w-48 mx-auto mb-4 animate-pulse" />
          <div className="h-5 bg-[#F1F5F9] rounded-lg w-64 mx-auto animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function MagicLoginPage() {
  return (
    <MainLayout>
      <Suspense fallback={<LoadingState />}>
        <MagicLoginContent />
      </Suspense>
    </MainLayout>
  );
}
