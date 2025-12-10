'use client';

import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-[#F1F5F9] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-10 md:py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Brand Column */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-[#FF6B6B] rounded-md flex items-center justify-center">
                    <span className="text-white font-bold text-xs">B</span>
                  </div>
                  <span className="font-bold text-[#0F172A]">baisics</span>
                  <span className="text-sm text-[#94A3B8] border-l border-[#E2E8F0] pl-2 ml-1">
                    fitness for the rest of us
                  </span>
                </div>
                <p className="text-sm text-[#64748B] max-w-sm leading-relaxed">
                  Making fitness accessible, approachable, and adaptable for everyone.
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="font-semibold text-[#0F172A] mb-4">Quick Links</h3>
                <ul className="space-y-3">
                  <li>
                    <Link
                      href="/dashboard"
                      className="text-sm text-[#64748B] hover:text-[#FF6B6B] transition-colors"
                    >
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/hi"
                      className="text-sm text-[#64748B] hover:text-[#FF6B6B] transition-colors"
                    >
                      New Program
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Contact/Social */}
              <div>
                <h3 className="font-semibold text-[#0F172A] mb-4">Connect</h3>
                <ul className="space-y-3">
                  <li>
                    <a
                      href="https://twitter.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#64748B] hover:text-[#FF6B6B] transition-colors"
                    >
                      Twitter
                    </a>
                  </li>
                  <li>
                    <a
                      href="mailto:john@baisics.app"
                      className="text-sm text-[#64748B] hover:text-[#FF6B6B] transition-colors"
                    >
                      Contact Us
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-[#F1F5F9] mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-[#94A3B8]">
                &copy; {currentYear} baisics. All rights reserved.
              </p>
              <div className="flex items-center gap-6">
                <Link
                  href="/privacy"
                  className="text-sm text-[#94A3B8] hover:text-[#FF6B6B] transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="text-sm text-[#94A3B8] hover:text-[#FF6B6B] transition-colors"
                >
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
  )
}
