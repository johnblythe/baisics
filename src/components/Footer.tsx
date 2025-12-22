'use client';

import Link from 'next/link'

const TOOLS = [
  { name: 'TDEE Calculator', href: '/tools/tdee' },
  { name: '1RM Calculator', href: '/tools/one-rep-max' },
  { name: 'Macro Calculator', href: '/tools/macros' },
  { name: 'Body Fat Estimator', href: '/tools/body-fat' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="py-16 px-6 bg-[#F8FAFC] border-t border-[#E2E8F0]">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#FF6B6B] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="font-bold text-xl text-[#0F172A]">baisics</span>
            </div>
            <p className="text-sm text-[#64748B]">
              Workout programs that work.<br />
              Made with <span className="text-[#FF6B6B]">&hearts;</span> in Indy.
            </p>
          </div>

          {/* Free Tools */}
          <div>
            <h4 className="font-bold text-[#0F172A] mb-4">Free Tools</h4>
            <ul className="space-y-2">
              {TOOLS.map((tool) => (
                <li key={tool.href}>
                  <Link href={tool.href} className="text-sm text-[#64748B] hover:text-[#0F172A] transition-colors">
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-bold text-[#0F172A] mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><Link href="/blog" className="text-sm text-[#64748B] hover:text-[#0F172A] transition-colors">Blog</Link></li>
              <li><Link href="/templates" className="text-sm text-[#64748B] hover:text-[#0F172A] transition-colors">Program Templates</Link></li>
              <li><Link href="/library" className="text-sm text-[#64748B] hover:text-[#0F172A] transition-colors">Exercise Library</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-[#0F172A] mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-sm text-[#64748B] hover:text-[#0F172A] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-[#64748B] hover:text-[#0F172A] transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#E2E8F0] text-center">
          <p className="text-sm text-[#94A3B8]">&copy; {currentYear} baisics. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
