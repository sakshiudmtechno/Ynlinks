'use client';

import { useUser } from '@clerk/nextjs';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Layers, ExternalLink, Copy, Check, Facebook, Instagram, Linkedin, Twitter, Youtube, Save, Camera } from 'lucide-react';
import { useState, useEffect } from 'react';

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

  const bioLink = typeof window !== 'undefined' ? `${window.location.origin}/u/${profile?.username}` : '';

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

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2EE6A6]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-gradient-to-br from-[#2EE6A6] to-[#1FD695] rounded-lg flex items-center justify-center">
          <Layers className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#111111]">My Bio Page</h1>
          <p className="text-xs text-[#6B7280]">Preview and share your public profile</p>
        </div>
      </div>

      {/* Share Link Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#6B7280] mb-1">Your Bio Link</p>
            <input
              type="text"
              value={bioLink}
              readOnly
              className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-[#6B7280] font-mono text-xs truncate"
            />
          </div>
          <button
            onClick={copyToClipboard}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              copied ? 'bg-green-500 text-white' : 'bg-[#2EE6A6] text-white hover:bg-[#1FD695]'
            }`}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <a
          href={bioLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-3 text-xs font-medium text-[#2EE6A6] hover:text-[#1FD695]"
        >
          <ExternalLink size={12} />
          View public page
        </a>
      </div>

      {/* Profile Info Card */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              {formData.avatarUrl ? (
                <div className="relative group">
                  <img src={formData.avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-[#2EE6A6]" />
                  <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    <Camera size={16} className="text-white" />
                  </label>
                </div>
              ) : (
                <label className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2EE6A6] to-[#1FD695] flex items-center justify-center cursor-pointer hover:opacity-90">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  <span className="text-2xl font-bold text-white">{(profile?.displayName || profile?.username || 'U').charAt(0).toUpperCase()}</span>
                </label>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-[#111111]">{profile?.displayName || profile?.username}</h3>
              <p className="text-xs text-[#6B7280]">@{profile?.username}</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#111111] mb-1.5">
              Bio <span className="text-[#6B7280] font-normal">(max 80 chars)</span>
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              maxLength={80}
              rows={2}
              placeholder="Tell visitors about yourself..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2EE6A6] resize-none"
            />
            <p className="text-xs text-[#6B7280] mt-1 text-right">{remainingChars} left</p>
          </div>
        </div>

        {/* Social Links Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-[#111111] mb-3">Social Media Links</h3>
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Facebook className="w-4 h-4 text-white" />
              </div>
              <input
                type="url"
                value={formData.facebookUrl}
                onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                placeholder="Facebook URL"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2EE6A6]"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Instagram className="w-4 h-4 text-white" />
              </div>
              <input
                type="url"
                value={formData.instagramUrl}
                onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                placeholder="Instagram URL"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2EE6A6]"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <Linkedin className="w-4 h-4 text-white" />
              </div>
              <input
                type="url"
                value={formData.linkedinUrl}
                onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                placeholder="LinkedIn URL"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2EE6A6]"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
                <Twitter className="w-4 h-4 text-white" />
              </div>
              <input
                type="url"
                value={formData.twitterUrl}
                onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
                placeholder="Twitter URL"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2EE6A6]"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Youtube className="w-4 h-4 text-white" />
              </div>
              <input
                type="url"
                value={formData.youtubeUrl}
                onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                placeholder="YouTube URL"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2EE6A6]"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={saving}
          className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
            saved ? 'bg-green-500 text-white' : 'bg-[#2EE6A6] text-white hover:bg-[#1FD695]'
          }`}
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Saving...
            </>
          ) : saved ? (
            <>
              <Check size={16} />
              Saved!
            </>
          ) : (
            <>
              <Save size={16} />
              Save Changes
            </>
          )}
        </button>
      </form>
    </div>
  );
}