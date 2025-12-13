'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import Image from 'next/image';
import { Menu, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleGetStarted = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/hi');
  };

  return (
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md z-50 border-b border-[#F1F5F9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href={session ? "/dashboard" : "/"} className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#FF6B6B] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="font-bold text-xl text-[#0F172A]">baisics</span>
              <span className="hidden sm:block text-sm text-[#94A3B8] border-l border-[#E2E8F0] pl-3 ml-1">
                fitness for the rest of us
              </span>
            </Link>

            <div className="flex items-center gap-4">
              {session ? (
                <>
                  {/* Desktop Navigation - Authenticated */}
                  <nav className="hidden md:flex items-center gap-6">
                    <Link
                      href="/dashboard"
                      className="text-sm font-medium text-[#475569] hover:text-[#0F172A] transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/program"
                      className="text-sm font-medium text-[#475569] hover:text-[#0F172A] transition-colors"
                    >
                      My Program
                    </Link>
                    <Link
                      href="/nutrition"
                      className="text-sm font-medium text-[#475569] hover:text-[#0F172A] transition-colors"
                    >
                      Nutrition
                    </Link>
                    <Link
                      href="/blog"
                      className="text-sm font-medium text-[#475569] hover:text-[#0F172A] transition-colors"
                    >
                      Blog
                    </Link>
                  </nav>

                  {/* User Menu - Authenticated */}
                  <Menu as="div" className="relative ml-3">
                    <Menu.Button className="flex items-center gap-2">
                      {session.user?.image ? (
                        <Image
                          src={session.user.image}
                          alt={session.user.name || 'User'}
                          width={36}
                          height={36}
                          className="rounded-full border-2 border-[#F1F5F9]"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-[#FF6B6B] flex items-center justify-center text-white font-semibold">
                          {session.user?.name?.[0] || session.user?.email?.[0] || 'U'}
                        </div>
                      )}
                    </Menu.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl bg-white py-1 shadow-lg ring-1 ring-[#E2E8F0] focus:outline-none">
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              href="/account"
                              className={`${
                                active ? 'bg-[#F8FAFC]' : ''
                              } block px-4 py-2.5 text-sm text-[#475569] font-medium`}
                            >
                              Account Settings
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => signOut({ callbackUrl: '/' })}
                              className={`${
                                active ? 'bg-[#F8FAFC]' : ''
                              } block w-full text-left px-4 py-2.5 text-sm text-[#475569] font-medium`}
                            >
                              Logout
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>

                  {/* Mobile Menu Button - Authenticated */}
                  <div className="md:hidden">
                    <button
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="p-2 text-[#475569] hover:text-[#0F172A]"
                      aria-label="Toggle menu"
                    >
                      {isMenuOpen ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                      )}
                    </button>

                    {/* Mobile Menu Dropdown - Authenticated */}
                    {isMenuOpen && (
                      <div className="absolute right-4 mt-2 w-48 py-2 bg-white rounded-xl shadow-lg border border-[#F1F5F9]">
                        <Link
                          href="/dashboard"
                          className="block px-4 py-2.5 text-sm font-medium text-[#475569] hover:bg-[#F8FAFC]"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                        <Link
                          href="/program"
                          className="block px-4 py-2.5 text-sm font-medium text-[#475569] hover:bg-[#F8FAFC]"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          My Program
                        </Link>
                        <Link
                          href="/nutrition"
                          className="block px-4 py-2.5 text-sm font-medium text-[#475569] hover:bg-[#F8FAFC]"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Nutrition
                        </Link>
                        <Link
                          href="/blog"
                          className="block px-4 py-2.5 text-sm font-medium text-[#475569] hover:bg-[#F8FAFC]"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Blog
                        </Link>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Desktop Navigation - Public */}
                  <nav className="hidden md:flex items-center gap-6">
                    <Link href="#features" className="text-sm font-medium text-[#475569] hover:text-[#0F172A] transition-colors">
                      Features
                    </Link>
                    <Link href="#pricing" className="text-sm font-medium text-[#475569] hover:text-[#0F172A] transition-colors">
                      Pricing
                    </Link>
                    <Link href="/blog" className="text-sm font-medium text-[#475569] hover:text-[#0F172A] transition-colors">
                      Blog
                    </Link>
                  </nav>

                  {/* Mobile Menu Button - Public */}
                  <div className="md:hidden relative">
                    <button
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="p-2 text-[#475569] hover:text-[#0F172A]"
                      aria-label="Toggle menu"
                    >
                      {isMenuOpen ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                      )}
                    </button>

                    {/* Mobile Menu Dropdown - Public */}
                    {isMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-xl shadow-lg border border-[#F1F5F9]">
                        <Link
                          href="#features"
                          className="block px-4 py-2.5 text-sm font-medium text-[#475569] hover:bg-[#F8FAFC]"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Features
                        </Link>
                        <Link
                          href="#pricing"
                          className="block px-4 py-2.5 text-sm font-medium text-[#475569] hover:bg-[#F8FAFC]"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Pricing
                        </Link>
                        <Link
                          href="/blog"
                          className="block px-4 py-2.5 text-sm font-medium text-[#475569] hover:bg-[#F8FAFC]"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Blog
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* CTA Buttons - Public */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => signIn()}
                      className="hidden sm:block text-sm font-medium text-[#475569] hover:text-[#0F172A] transition-colors"
                    >
                      Log in
                    </button>
                    <button
                      onClick={handleGetStarted}
                      className="px-5 py-2.5 text-sm font-semibold text-white bg-[#0F172A] rounded-lg hover:bg-[#1E293B] transition-colors"
                    >
                      Get Started
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
  );
}
