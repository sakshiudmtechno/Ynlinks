'use client';
import { useUser } from '@clerk/nextjs';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Layers, ExternalLink, Copy, Check, Facebook, Instagram, Linkedin, Twitter, Youtube, Save } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Id } from '@/convex/_generated/dataModel';
import { useRouter } from 'next/navigation';

export default function BioPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
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
  const links = useQuery(api.links.getEnabledLinksByUser, { userId: profile?._id || '' });
  const updateProfileMutation = useMutation(api.users.updateUserProfile);
  const createUserMutation = useMutation(api.users.createUser);
  const [creatingUser, setCreatingUser] = useState(false);

  // Build bio link - handle loading and undefined states
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

  // Auto-create user in Convex if they exist in Clerk but not in Convex
  useEffect(() => {
    if (user && !profile && isLoaded && !creatingUser) {
      setCreatingUser(true);

      // Generate a proper username from user's actual name or email
      let generatedUsername = user.username;
      let displayName = user.fullName || user.firstName || 'User';

      // If no Clerk username, generate from full name or email
      if (!generatedUsername) {
        const fullName = user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim();

        if (fullName && fullName !== 'User') {
          // Convert "Piyush Raykhere" → "piyush_raykhere"
          generatedUsername = fullName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        } else if (user.primaryEmailAddress?.emailAddress) {
          // Use email prefix as username - "piyush@gmail.com" → "piyush"
          generatedUsername = user.primaryEmailAddress.emailAddress.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        }
      }

      // Sanitize username - only allow alphanumeric and underscore
      generatedUsername = (generatedUsername || 'user').replace(/[^a-zA-Z0-9_]/g, '');

      // Add random suffix to ensure uniqueness (4 characters)
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-gradient-to-br from-[#2EE6A6] to-[#1FD695] rounded-xl flex items-center justify-center">
          <Layers className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#111111]">My Bio Page</h1>
          <p className="text-sm text-[#6B7280]">Preview and share your public profile</p>
        </div>
      </div>

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
  );
}