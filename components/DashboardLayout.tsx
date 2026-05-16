'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Layers, LayoutDashboard, Link2, DollarSign, BarChart3, Wallet, User, HelpCircle, ChevronLeft, Menu, X, FileText } from 'lucide-react';
import { TermsModal } from '@/components/TermsModal';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const profile = useQuery(api.users.getUserByClerkId, { clerkId: user?.id || '' });

  useEffect(() => {
    const handleOpenTerms = () => setShowTerms(true);
    window.addEventListener('open-terms', handleOpenTerms);
    return () => window.removeEventListener('open-terms', handleOpenTerms);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMobileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Bio Page', href: '/bio', icon: Layers },
    { name: 'Links', href: '/links', icon: Link2 },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Withdrawals', href: '/withdrawals', icon: Wallet },
    { name: 'Settings', href: '/settings', icon: User },
  ];

  const isActive = (href: string) => pathname === href;

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2EE6A6]"></div>
      </div>
    );
  }

  if (!user) {
    router.push('/sign-in');
    return null;
  }

  if (profile?.status === 'banned') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Account Suspended</h2>
          <p className="text-gray-600">Your account has been suspended. Please contact support for more information.</p>
        </div>
      </div>
    );
  }

  if (profile?.status === 'paused') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
          <h2 className="text-2xl font-bold text-yellow-600 mb-4">Account Paused</h2>
          <p className="text-gray-600">Your account is currently paused. Please contact support to reactivate it.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />

      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
      >
        <Menu size={24} className="text-[#111111]" />
      </button>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-[#111111]/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-72'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            {!collapsed && (
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#111111] rounded-lg flex items-center justify-center text-white">
                  <Layers size={20} />
                </div>
                <span className="font-display font-bold text-xl text-[#111111] tracking-tight">YNLinks</span>
              </Link>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:block p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft
                size={20}
                className={`text-[#6B7280] transition-transform ${collapsed ? 'rotate-180' : ''}`}
              />
            </button>
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-[#6B7280]" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-[#2EE6A6]/10 text-[#2EE6A6]'
                      : 'text-[#6B7280] hover:bg-gray-100 hover:text-[#111111]'
                  } ${collapsed ? 'justify-center' : ''}`}
                  title={collapsed ? item.name : ''}
                >
                  <Icon size={20} className={active ? 'text-[#2EE6A6]' : ''} />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {!collapsed && (
            <div className="p-4 bg-gradient-to-br from-[#2EE6A6]/10 to-[#2EE6A6]/5 border-t border-[#2EE6A6]/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#2EE6A6]/20 rounded-full flex items-center justify-center">
                  <span className="font-display font-bold text-[#2EE6A6]">
                    {profile?.displayName?.charAt(0)?.toUpperCase() || user.firstName?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#111111] truncate">{profile?.displayName || user.fullName || 'User'}</p>
                  <p className="text-xs text-[#6B7280] truncate">@{profile?.username || user.username || 'user'}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#6B7280]">Balance</span>
                <span className="font-bold text-[#2EE6A6]">₹{(profile?.balance || profile?.earnings || 0).toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b-2 border-[#111111] px-4 sm:px-6 md:px-8 py-4 sm:py-5 flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0 flex items-center ml-12 lg:ml-0" />

          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l-2 border-[#111111] hover:bg-gray-50 rounded-full transition-colors py-1 pr-2"
              >
                <div className="hidden md:block text-right mr-1">
                  <p className="text-sm font-bold text-[#111111] truncate max-w-[140px]">
                    {profile?.displayName || profile?.username}
                  </p>
                  <p className="text-xs text-gray-600 truncate max-w-[140px]">@{profile?.username}</p>
                </div>
                {profile?.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.displayName || profile.username}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-[#2EE6A6]"
                  />
                ) : (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-[#2EE6A6] to-[#2EE6A6]/70 rounded-full flex items-center justify-center">
                    <span className="font-display font-bold text-white text-sm sm:text-base">
                      {profile?.displayName?.charAt(0)?.toUpperCase() || 'A'}
                    </span>
                  </div>
                )}
              </button>

              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-2">
                <button
                  onClick={() => {
                    setShowTerms(true);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FileText size={16} className="text-gray-500" />
                  <span>Terms & Conditions</span>
                </button>
                <button
                  onClick={() => {
                    window.open('https://t.me/ynlinks', '_blank');
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <HelpCircle size={16} className="text-gray-500" />
                  <span>Help & Support</span>
                </button>
                <div className="my-1 border-t border-gray-200" />
                <button
                  onClick={() => signOut({ redirectUrl: '/' })}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    </>
  );
}