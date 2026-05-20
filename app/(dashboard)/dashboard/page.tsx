'use client';

import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { DollarSign, MousePointerClick, Link2, ArrowUpRight, ArrowRight, Eye, Plus } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isLoaded } = useUser();

  const profile = useQuery(api.users.getUserByClerkId, { clerkId: user?.id || '' });
  const links = useQuery(api.links.getLinksByUser, { userId: profile?._id || '' });
  const totalVisits = useQuery(api.analytics.getTotalVisitCount, { userId: profile?._id || '' });
  const totalClicks = useQuery(api.analytics.getTotalClickCount, { userId: profile?._id || '' });
  const minWithdrawalSetting = useQuery(api.admin.getSettingByKey, { key: 'min_withdrawal' });

  const minWithdrawal = minWithdrawalSetting?.value ? parseFloat(minWithdrawalSetting.value) : 150;
  const earnings = profile?.balance || profile?.earnings || 0;
  const clickRate = 0.10;
  const activeLinks = links?.filter(l => l.enabled).length || 0;
  const totalLinkClicks = totalClicks || 0;
  const visits = totalVisits || 0;

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2EE6A6]"></div></div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-[#111111]">Dashboard</h1>
        <p className="text-xs text-[#6B7280]">Monitor your performance and earnings</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-[#2EE6A6]/20 rounded-lg flex items-center justify-center"><DollarSign className="w-4 h-4 text-[#2EE6A6]" /></div>
            <span className="text-xs text-gray-500">Earnings</span>
          </div>
          <p className="text-xl font-bold text-[#111111]">₹{earnings.toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-0.5">{earnings >= minWithdrawal ? 'Can withdraw' : `₹${(minWithdrawal - earnings).toFixed(2)} to min`}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center"><Eye className="w-4 h-4 text-blue-600" /></div>
            <span className="text-xs text-gray-500">Visits</span>
          </div>
          <p className="text-xl font-bold text-[#111111]">{visits.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-0.5">Bio page views</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-[#111111] rounded-lg flex items-center justify-center"><MousePointerClick className="w-4 h-4 text-white" /></div>
            <span className="text-xs text-gray-500">Clicks</span>
          </div>
          <p className="text-xl font-bold text-[#111111]">{totalLinkClicks.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-0.5">₹{(totalLinkClicks * clickRate).toFixed(2)} earned</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-[#2EE6A6]/20 rounded-lg flex items-center justify-center"><Link2 className="w-4 h-4 text-[#2EE6A6]" /></div>
            <span className="text-xs text-gray-500">Links</span>
          </div>
          <p className="text-xl font-bold text-[#111111]">{activeLinks}</p>
          <p className="text-xs text-gray-400 mt-0.5">Active links</p>
        </div>
      </div>

      {/* Withdrawal CTA */}
      {earnings >= minWithdrawal && (
        <div className="bg-gradient-to-r from-[#2EE6A6]/10 to-[#2EE6A6]/5 border border-[#2EE6A6]/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#2EE6A6] rounded-lg flex items-center justify-center"><DollarSign className="w-4 h-4 text-white" /></div>
              <div>
                <p className="font-semibold text-[#111111]">You can withdraw!</p>
                <p className="text-xs text-gray-500">₹{earnings.toFixed(2)} available</p>
              </div>
            </div>
            <Link href="/withdrawals" className="bg-[#2EE6A6] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#1FD695] flex items-center gap-1">
              Withdraw <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}

      {/* Top Links */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[#111111]">Top Performing Links</h2>
          <Link href="/links" className="text-xs text-[#2EE6A6] font-medium flex items-center gap-1">View <ArrowUpRight size={12} /></Link>
        </div>

        {(!links || links.length === 0) ? (
          <div className="text-center py-6">
            <p className="text-xs text-[#6B7280]">No links yet. <Link href="/links" className="text-[#2EE6A6] font-medium">Add your first link</Link></p>
          </div>
        ) : (
          <div className="space-y-2">
            {links.filter(l => l.enabled).sort((a, b) => b.clicks - a.clicks).slice(0, 5).map((link, index) => (
              <div key={link._id} className="flex items-center justify-between p-2.5 border border-gray-100 rounded-lg hover:border-[#2EE6A6]/30 transition-colors">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-bold text-gray-500">{index + 1}</span>
                  <span className="font-medium text-sm text-[#111111] truncate max-w-[150px]">{link.title}</span>
                </div>
                <span className="text-sm font-bold text-[#111111]">{link.clicks || 0}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-[#111111] mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-2">
          <Link href="/links" className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <Plus className="w-4 h-4 text-[#2EE6A6]" />
            <span className="text-xs font-medium">Add Link</span>
          </Link>
          <Link href="/bio" className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <Link2 className="w-4 h-4 text-[#2EE6A6]" />
            <span className="text-xs font-medium">My Bio Page</span>
          </Link>
        </div>
      </div>
    </div>
  );
}