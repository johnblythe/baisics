import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="border-t border-gray-100 bg-white/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Link href="/dashboard" className="text-xl font-bold text-indigo-600">
                  baisics
                </Link>
                <span className="text-sm text-gray-500 border-l border-gray-200 pl-3">
                  fitness for the rest of us
                </span>
              </div>
              <p className="text-sm text-gray-500 max-w-sm">
                Making fitness accessible, approachable, and adaptable for everyone.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/dashboard" className="text-gray-600 hover:text-indigo-600 transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/hi" className="text-gray-600 hover:text-indigo-600 transition-colors">
                    New Program
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact/Social */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Connect</h3>
              <ul className="space-y-3">
                <li>
                  <a 
                    href="https://twitter.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-indigo-600 transition-colors"
                  >
                    Twitter
                  </a>
                </li>
                <li>
                  <a 
                    href="mailto:hello@baisics.fit"
                    className="text-gray-600 hover:text-indigo-600 transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-100 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © {currentYear} baisics. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 