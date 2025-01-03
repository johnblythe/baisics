import Link from 'next/link'

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-3">
            <Link href="/dashboard" className="text-2xl font-bold text-indigo-600">
              baisics
            </Link>
            <span className="hidden sm:block text-sm text-gray-500 border-l border-gray-200 pl-3">
              fitness for the rest of us
            </span>
          </div>

          {/* Right side - can be extended later for user menu, etc */}
          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-6">
              <Link 
                href="/dashboard"
                className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
              >
                Dashboard
              </Link>
              <div
                className="text-gray-600 hover:text-indigo-600 font-medium transition-colors cursor-pointer relative group"
                aria-label="Program Library - Coming Soon"
              >
                <span>Program Library</span>
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-8 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Coming soon!
                </div>
              </div>
              <Link
                href="/account" 
                className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
              >
                Account
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  )
} 