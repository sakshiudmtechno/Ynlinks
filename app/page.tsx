'use client';

import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Layers, ArrowRight, Link2, DollarSign, BarChart3, Shield, Zap } from 'lucide-react';

export default function LandingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user) {
      router.push('/dashboard');
    }
  }, [isLoaded, user, router]);

  return (
    <div className="min-h-screen bg-[#FFFDF9] font-['Inter',sans-serif]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#111111] rounded-lg flex items-center justify-center">
                <Layers className="h-5 w-5 text-[#2EE6A6]" />
              </div>
              <span className="font-display font-bold text-xl text-[#111111] tracking-tight">YNLinks</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/sign-in" className="text-sm font-medium text-[#111111] hover:text-[#2EE6A6] transition-colors">
                Sign In
              </Link>
              <Link href="/sign-up" className="bg-[#2EE6A6] text-[#111111] px-4 py-2 rounded-lg font-semibold hover:bg-[#1FD695] transition-all">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-[#111111] tracking-tight mb-6">
            Your Links.<br />
            <span className="text-[#2EE6A6]">Your Earnings.</span>
          </h1>
          <p className="text-lg sm:text-xl text-[#6B7280] max-w-2xl mx-auto mb-8">
            Create your link-in-bio page and start earning from every click. Share your links, track your performance, and withdraw your earnings.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up" className="bg-[#2EE6A6] text-[#111111] px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#1FD695] transition-all shadow-lg shadow-[#2EE6A6]/20 flex items-center gap-2">
              Start Earning Now
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="#features" className="text-[#111111] font-semibold hover:text-[#2EE6A6] transition-colors flex items-center gap-2">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-[#111111] text-center mb-12">
            Everything You Need
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#FFFDF9] rounded-2xl p-8 border border-gray-200">
              <div className="w-12 h-12 bg-[#2EE6A6]/20 rounded-xl flex items-center justify-center mb-4">
                <Link2 className="w-6 h-6 text-[#2EE6A6]" />
              </div>
              <h3 className="text-xl font-bold text-[#111111] mb-3">Link Management</h3>
              <p className="text-[#6B7280]">Add up to 5 links to your bio page. Drag and drop to reorder, enable/disable anytime.</p>
            </div>
            <div className="bg-[#FFFDF9] rounded-2xl p-8 border border-gray-200">
              <div className="w-12 h-12 bg-[#2EE6A6]/20 rounded-xl flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-[#2EE6A6]" />
              </div>
              <h3 className="text-xl font-bold text-[#111111] mb-3">Earn Money</h3>
              <p className="text-[#6B7280]">Earn ₹0.10 per click on your links. Minimum withdrawal just ₹150!</p>
            </div>
            <div className="bg-[#FFFDF9] rounded-2xl p-8 border border-gray-200">
              <div className="w-12 h-12 bg-[#2EE6A6]/20 rounded-xl flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-[#2EE6A6]" />
              </div>
              <h3 className="text-xl font-bold text-[#111111] mb-3">Analytics</h3>
              <p className="text-[#6B7280]">Track your page visits and link clicks with detailed analytics.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#2EE6A6]/10 via-[#2EE6A6]/5 to-[#FFFDF9]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-[#111111] mb-6">
            Ready to Start?
          </h2>
          <p className="text-lg text-[#6B7280] mb-8">
            Join thousands of creators earning from their links. Free to start, no hidden fees.
          </p>
          <Link href="/sign-up" className="bg-[#2EE6A6] text-[#111111] px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#1FD695] transition-all shadow-lg inline-flex items-center gap-2">
            Create Your Page
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#111111] rounded-lg flex items-center justify-center">
                <Layers className="h-5 w-5 text-[#2EE6A6]" />
              </div>
              <span className="font-display font-bold text-[#111111]">YNLinks</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-[#6B7280]">
              <Link href="/about" className="hover:text-[#111111] transition-colors">About</Link>
              <Link href="/privacy" className="hover:text-[#111111] transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-[#111111] transition-colors">Terms</Link>
              <Link href="/help" className="hover:text-[#111111] transition-colors">Help</Link>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-[#6B7280]">
            © {new Date().getFullYear()} YNLinks. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}