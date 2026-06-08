'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import { Check, Copy, ArrowRight, ExternalLink, Loader2, Share2, Link2, User, Palette, MessageCircle, Youtube, Instagram, Send, Facebook, Twitter, Linkedin } from 'lucide-react';
import { BioPreview } from '@/components/BioPreview';

export default function CompletionPage() {
  const router = useRouter();
  const { user, isLoaded: isClerkLoaded } = useUser();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  // Fetch user profile data
  const profile = useQuery(api.users.getUserByClerkId, user?.id ? { clerkId: user.id } : 'skip');
  const userLinks = useQuery(api.links.getEnabledLinksByUser, { userId: profile?._id || '' });

  // Theme settings
  const selectedTheme = (profile?.theme as any) || 'parchment';
  const selectedButtonStyle = (profile?.buttonStyle as any) || 'pill';
  const selectedFontStyle = (profile?.fontStyle as any) || 'dm-sans';
  const selectedAvatarShape = (profile?.avatarShape as any) || 'circle';

  // Redirect if not complete
  useEffect(() => {
    if (isClerkLoaded && profile && !profile.onboardingComplete) {
      router.replace('/onboarding/about');
    }
  }, [isClerkLoaded, profile, router]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{x: number; y: number; size: number; speedY: number; speedX: number; color: string}> = [];
    const colors = ['#2EE6A6', '#10B981', '#1DB954', '#059669'];

    const createParticle = () => ({
      x: Math.random() * canvas.width,
      y: -10,
      size: Math.random() * 8 + 4,
      speedY: Math.random() * 3 + 2,
      speedX: Math.random() * 2 - 1,
      color: colors[Math.floor(Math.random() * colors.length)],
    });

    for (let i = 0; i < 80; i++) {
      setTimeout(() => particles.push(createParticle()), i * 30);
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const filtered = particles.filter((p) => p.y < canvas.height);
      filtered.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      });
      particles.length = 0;
      filtered.forEach((p) => particles.push(p));
      requestAnimationFrame(animate);
    }
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCopyURL = async () => {
    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/u/${profile?.username}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!isClerkLoaded || profile === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-[#2EE6A6]" />
      </div>
    );
  }

  const publicProfileUrl = `${
    typeof window !== 'undefined' ? window.location.origin : ''
  }/u/${profile?.username}`;

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Confetti Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-50"
      />

      {/* Header */}
      <header className="w-full px-6 md:px-10 py-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="text-xl font-bold text-[#111111]">
          <span className="text-[#2EE6A6]">YN</span>Links
        </div>
        <div className="text-3xl text-gray-300 opacity-30">🎉</div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-10 py-8 md:py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Column: Content */}
        <div className="space-y-8">
          <section className="space-y-4">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#2EE6A6]/10 text-[#2EE6A6] rounded-full text-sm font-medium">
              <Check size={16} />
              Onboarding Complete
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-[#1C1917] leading-tight">
              Your YNLink Is Ready
            </h1>

            <p className="text-base text-gray-500 max-w-md">
              Your personalized creator profile is live and ready to grow. Start sharing your work with the world.
            </p>
          </section>

          {/* URL Card */}
          <div className="bg-gray-50 rounded-xl p-5 relative overflow-hidden border border-gray-100 shadow-lg">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Link2 className="w-16 h-16" />
            </div>

            <label className="text-xs text-gray-500 mb-2 block">Your Public Profile URL</label>

            <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200">
              <span className="text-base font-semibold text-[#2EE6A6] truncate pr-4">
                ynlinks.com/{profile?.username}
              </span>
              <button
                onClick={handleCopyURL}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  copied
                    ? 'bg-[#10B981] text-white'
                    : 'bg-[#2EE6A6] text-white hover:opacity-90'
                }`}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Success Checklist */}
          <ul className="space-y-4">
            <li className="flex items-center gap-4 text-[#1C1917]">
              <div className="w-6 h-6 rounded-full bg-[#10B981] flex items-center justify-center">
                <Check size={14} className="text-white" />
              </div>
              <span className="text-sm font-medium">Profile Created</span>
            </li>
            <li className="flex items-center gap-4 text-[#1C1917]">
              <div className="w-6 h-6 rounded-full bg-[#10B981] flex items-center justify-center">
                <Check size={14} className="text-white" />
              </div>
              <span className="text-sm font-medium">URL Reserved</span>
            </li>
            <li className="flex items-center gap-4 text-[#1C1917]">
              <div className="w-6 h-6 rounded-full bg-[#10B981] flex items-center justify-center">
                <Check size={14} className="text-white" />
              </div>
              <span className="text-sm font-medium">Dashboard Ready</span>
            </li>
          </ul>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={() => router.push('/links')}
              className="bg-[#2EE6A6] text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              Go To Dashboard
              <ArrowRight size={20} />
            </button>
            <button
              onClick={() => router.push(`/u/${profile?.username}`)}
              className="bg-white border border-gray-200 text-gray-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <ExternalLink size={18} />
              View Public Profile
            </button>
          </div>
        </div>

        {/* Right Column: Profile Preview Mockup with BioPreview */}
        <div className="hidden lg:flex justify-center items-center py-12">
          <div className="relative w-[320px] h-[640px] bg-white rounded-[48px] shadow-2xl border-[12px] border-[#1C1917] overflow-hidden">
            {/* Phone Header (Dynamic Island) */}
            <div className="absolute top-0 w-full h-8 flex justify-center items-end pb-1">
              <div className="w-20 h-5 bg-[#1C1917] rounded-b-2xl"></div>
            </div>

            {/* BioPreview Content */}
            <div className="w-full h-full overflow-hidden">
              <BioPreview
                avatarUrl={profile?.avatarUrl || ''}
                displayName={profile?.displayName || profile?.username || ''}
                username={profile?.username || ''}
                bio={profile?.bio || ''}
                facebookUrl={profile?.facebookUrl || ''}
                instagramUrl={profile?.instagramUrl || ''}
                linkedinUrl={profile?.linkedinUrl || ''}
                twitterUrl={profile?.twitterUrl || ''}
                youtubeUrl={profile?.youtubeUrl || ''}
                userLinks={userLinks || []}
                theme={selectedTheme}
                buttonStyle={selectedButtonStyle}
                fontStyle={selectedFontStyle}
                avatarShape={selectedAvatarShape}
              />
            </div>
          </div>

          {/* Floating Decorative Elements */}
          <div className="absolute top-20 right-0 w-16 h-16 bg-[#2EE6A6]/10 rounded-full animate-bounce" />
          <div className="absolute bottom-40 left-10 w-24 h-24 bg-[#2EE6A6]/5 rounded-2xl rotate-12 animate-pulse" />
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-100 py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400">
            © 2024 YNLinks. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a
              className="text-xs text-gray-400 hover:text-[#2EE6A6] transition-colors"
              href="#"
            >
              Privacy Policy
            </a>
            <a
              className="text-xs text-gray-400 hover:text-[#2EE6A6] transition-colors"
              href="#"
            >
              Terms of Service
            </a>
            <a
              className="text-xs text-gray-400 hover:text-[#2EE6A6] transition-colors"
              href="#"
            >
              Help Center
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}