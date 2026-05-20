'use client';
import { useUser } from '@clerk/nextjs';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Layers, ExternalLink, Copy, Check, Facebook, Instagram, Linkedin, Twitter, Youtube, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { BioPreview } from '@/components/BioPreview';

export default function BioPage() {
  const { user, isLoaded } = useUser();
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    avatarUrl: '',
    facebookUrl: '',
    instagramUrl: '',
    linkedinUrl: '',
    twitterUrl: '',
    youtubeUrl: '',
  });

  const profile = useQuery(api.users.getUserByClerkId, { clerkId: user?.id || '' });
  const updateProfileMutation = useMutation(api.users.updateUserProfile);
  const createUserMutation = useMutation(api.users.createUser);
  const [creatingUser, setCreatingUser] = useState(false);

  const bioLink = profile?.username
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/u/${profile.username}`
    : '';

  useEffect(() => {
    if (profile) {
      setFormData({
        bio: profile.bio || '',
        avatarUrl: profile.avatarUrl || '',
        facebookUrl: profile.facebookUrl || '',
        instagramUrl: profile.instagramUrl || '',
        linkedinUrl: profile.linkedinUrl || '',
        twitterUrl: profile.twitterUrl || '',
        youtubeUrl: profile.youtubeUrl || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    if (user && !profile && isLoaded && !creatingUser) {
      setCreatingUser(true);

      let generatedUsername = user.username;
      let displayName = user.fullName || user.firstName || 'User';

      if (!generatedUsername) {
        const fullName = user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim();

        if (fullName && fullName !== 'User') {
          generatedUsername = fullName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        } else if (user.primaryEmailAddress?.emailAddress) {
          generatedUsername = user.primaryEmailAddress.emailAddress.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        }
      }

      generatedUsername = (generatedUsername || 'user').replace(/[^a-zA-Z0-9_]/g, '');
      const suffix = Math.random().toString(36).substring(2, 6);
      generatedUsername = `${generatedUsername}_${suffix}`;

      createUserMutation({
        clerkId: user.id,
        username: generatedUsername,
        email: user.primaryEmailAddress?.emailAddress || '',
        displayName: displayName,
        avatarUrl: user.imageUrl || '',
      }).then(() => {
        setTimeout(() => setCreatingUser(false), 2000);
      }).catch((err) => {
        console.error('Failed to create user:', err);
        setCreatingUser(false);
      });
    }
  }, [user, profile, isLoaded, creatingUser, createUserMutation]);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(bioLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size should be less than 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, avatarUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    try {
      await updateProfileMutation({
        userId: profile._id,
        bio: formData.bio,
        avatarUrl: formData.avatarUrl,
        facebookUrl: formData.facebookUrl || undefined,
        instagramUrl: formData.instagramUrl || undefined,
        linkedinUrl: formData.linkedinUrl || undefined,
        twitterUrl: formData.twitterUrl || undefined,
        youtubeUrl: formData.youtubeUrl || undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      alert('Failed to save bio page settings');
    } finally {
      setSaving(false);
    }
  };

  const remainingChars = 80 - formData.bio.length;

  if (!isLoaded || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2EE6A6]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        {/* <div className="w-10 h-10 bg-gradient-to-br from-[#2EE6A6] to-[#1FD695] rounded-xl flex items-center justify-center">
          <Layers className="w-5 h-5 text-white" />
        </div> */}
        {/* <div>
          <h1 className="text-2xl font-bold text-[#111111]">My Bio Page</h1>
          <p className="text-sm text-[#6B7280]">Preview and share your public profile</p>
        </div> */}
      </div>

      {/* 2-Column Layout: Form + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* Left Column - Form Content */}
        <div className="space-y-6">
          {/* Share Your Link */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#111111] mb-4">Your Bio Link</h3>
            <p className="text-[#6B7280] text-sm mb-4">Share your custom bio link on all your social media platforms to start earning!</p>
            <div className="flex gap-3">
              <input
                type="text"
                value={bioLink}
                readOnly
                className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-[#6B7280] font-mono text-sm"
              />
              <button
                onClick={copyToClipboard}
                className={`px-6 py-3 rounded-xl hover:bg-[#1FD695] transition-all flex items-center gap-2 font-semibold shadow-lg ${
                  copied ? 'bg-green-500 text-white' : 'bg-[#2EE6A6] text-white'
                }`}
              >
                {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
            <a
              href={bioLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-3 text-sm font-semibold text-[#2EE6A6] hover:text-[#1FD695] transition-colors"
            >
              <ExternalLink size={16} />
              View your public page
            </a>
          </div>

          {/* Bio Page Settings */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Info */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-[#111111] mb-6">Profile Information</h3>

              <div className="flex items-start gap-6 mb-6">
                <div className="flex-shrink-0">
                  {formData.avatarUrl ? (
                    <div className="relative group">
                      <img src={formData.avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-[#2EE6A6]" />
                      <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        <span className="text-white text-sm font-semibold">Change</span>
                      </label>
                    </div>
                  ) : (
                    <label className="w-24 h-24 rounded-full bg-gradient-to-br from-[#2EE6A6] to-[#1FD695] flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      <span className="text-4xl font-bold text-white">{(profile?.displayName || profile?.username || 'U').charAt(0).toUpperCase()}</span>
                    </label>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-[#111111] mb-1">{profile?.displayName || profile?.username}</h4>
                  <p className="text-[#6B7280]">@{profile?.username}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#111111] mb-2">
                  Bio <span className="text-[#6B7280] font-normal">(max 80 characters)</span>
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  maxLength={80}
                  rows={3}
                  placeholder="Tell visitors about yourself..."
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2EE6A6] focus:border-transparent transition-all resize-none"
                />
                <p className="text-xs text-[#6B7280] mt-1 text-right">{remainingChars} characters remaining</p>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-[#111111] mb-6">Social Media Links</h3>
              <p className="text-[#6B7280] text-sm mb-6">Add your social media profiles to display on your public page</p>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Facebook className="w-5 h-5 text-white" />
                  </div>
                  <input
                    type="url"
                    value={formData.facebookUrl}
                    onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                    placeholder="https://facebook.com/yourprofile"
                    className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2EE6A6] focus:border-transparent transition-all text-sm"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <Instagram className="w-5 h-5 text-white" />
                  </div>
                  <input
                    type="url"
                    value={formData.instagramUrl}
                    onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                    placeholder="https://instagram.com/yourprofile"
                    className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2EE6A6] focus:border-transparent transition-all text-sm"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center">
                    <Linkedin className="w-5 h-5 text-white" />
                  </div>
                  <input
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2EE6A6] focus:border-transparent transition-all text-sm"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                    <Twitter className="w-5 h-5 text-white" />
                  </div>
                  <input
                    type="url"
                    value={formData.twitterUrl}
                    onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
                    placeholder="https://twitter.com/yourprofile"
                    className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2EE6A6] focus:border-transparent transition-all text-sm"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                    <Youtube className="w-5 h-5 text-white" />
                  </div>
                  <input
                    type="url"
                    value={formData.youtubeUrl}
                    onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                    placeholder="https://youtube.com/@yourchannel"
                    className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2EE6A6] focus:border-transparent transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className={`w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 shadow-lg ${
                saved
                  ? 'bg-green-500 text-white'
                  : 'bg-[#2EE6A6] text-white hover:bg-[#1FD695]'
              }`}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Saving...
                </>
              ) : saved ? (
                <>
                  <Check className="h-5 w-5" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Save Changes
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column - Sticky Preview */}
        <div className="hidden lg:block">
          <div className="sticky top-6">
            <BioPreview
              avatarUrl={formData.avatarUrl}
              displayName={profile?.displayName || profile?.username || ''}
              username={profile?.username || ''}
              bio={formData.bio}
              facebookUrl={formData.facebookUrl}
              instagramUrl={formData.instagramUrl}
              linkedinUrl={formData.linkedinUrl}
              twitterUrl={formData.twitterUrl}
              youtubeUrl={formData.youtubeUrl}
            />
          </div>
        </div>
      </div>

      {/* Mobile Preview Toggle */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <button
          onClick={() => {
            const preview = document.getElementById('mobile-preview-panel');
            if (preview) {
              preview.classList.toggle('hidden');
            }
          }}
          className="w-14 h-14 bg-[#2EE6A6] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#1FD695] transition-all hover:scale-105 active:scale-95"
          title="Toggle Preview"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      {/* Mobile Preview Panel */}
      <div id="mobile-preview-panel" className="lg:hidden fixed inset-0 z-40 bg-black/50 hidden">
        <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] bg-gray-50 rounded-t-3xl overflow-y-auto">
          <div className="sticky top-0 bg-gray-50 p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-[#111111]">Live Preview</h3>
            <button
              onClick={() => {
                const preview = document.getElementById('mobile-preview-panel');
                if (preview) {
                  preview.classList.add('hidden');
                }
              }}
              className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-300 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-4">
            <BioPreview
              avatarUrl={formData.avatarUrl}
              displayName={profile?.displayName || profile?.username || ''}
              username={profile?.username || ''}
              bio={formData.bio}
              facebookUrl={formData.facebookUrl}
              instagramUrl={formData.instagramUrl}
              linkedinUrl={formData.linkedinUrl}
              twitterUrl={formData.twitterUrl}
              youtubeUrl={formData.youtubeUrl}
            />
          </div>
        </div>
      </div>
    </div>
  );
}