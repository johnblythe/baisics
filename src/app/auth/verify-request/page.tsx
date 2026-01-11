import MainLayout from "@/app/components/layouts/MainLayout";
import { Mail, Inbox, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";

export default async function VerifyRequest() {
  const cookieStore = await cookies();
  const magicLink = cookieStore.get("baisics.__dev_magic_link")?.value;
  const email = cookieStore.get("baisics.__dev_magic_email")?.value;

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

            {/* Dev mode: show magic link directly */}
            {magicLink && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-left">
                <div className="flex items-center gap-2 text-amber-800 font-medium text-sm mb-2">
                  <LinkIcon className="h-4 w-4" />
                  Dev Mode
                </div>
                <p className="text-xs text-amber-700 mb-3">
                  {email ? `Magic link for ${email}:` : "Your magic link:"}
                </p>
                <Link
                  href={magicLink}
                  className="block text-sm bg-white p-3 rounded-lg border border-amber-300 text-[#FF6B6B] hover:text-[#EF5350] font-medium break-all"
                >
                  Click here to sign in →
                </Link>
              </div>
            )}

            {/* Instructions - only show in prod */}
            {!magicLink && (
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
            )}

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
