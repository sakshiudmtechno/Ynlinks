'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Save, User, Copy, Camera } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    avatarUrl: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const profile = useQuery(api.users.getUserByClerkId, { clerkId: user?.id || '' });
  const updateUserMutation = useMutation(api.users.updateUserProfile);

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || profile.username || '',
        bio: profile.bio || '',
        avatarUrl: profile.avatarUrl || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setLoading(true);
    setSuccess(false);

    try {
      await updateUserMutation({
        userId: profile._id,
        displayName: formData.displayName,
        bio: formData.bio || undefined,
        avatarUrl: formData.avatarUrl || undefined,
        phone: formData.phone || undefined,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const bioLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/u/${profile?.username}`;

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2EE6A6]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 sm:p-8 mb-6">
        <div className="mb-8">
          <h3 className="text-lg font-display font-bold text-[#111111] mb-4">Profile Photo</h3>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageUpload}
              className="hidden"
              id="profile-photo-upload"
            />
            <label htmlFor="profile-photo-upload" className="cursor-pointer group relative">
              {formData.avatarUrl ? (
                <div className="relative">
                  <img
                    src={formData.avatarUrl}
                    alt={profile?.username}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-[#2EE6A6] shadow-lg group-hover:opacity-75 transition-opacity"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black/60 rounded-full p-3">
                      <Camera className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-[#2EE6A6] to-[#2EE6A6]/80 rounded-2xl flex items-center justify-center border-2 border-[#2EE6A6] shadow-lg group-hover:opacity-90 transition-opacity">
                  <User className="h-12 w-12 sm:h-14 sm:w-14 text-white" />
                </div>
              )}
            </label>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-display font-bold text-[#111111] mb-1">{profile?.displayName || profile?.username}</h2>
              <p className="text-[#6B7280] mb-3">@{profile?.username}</p>
              <p className="text-sm text-gray-600 mb-2">Click to change photo</p>
              <p className="text-xs text-gray-500">Max 2MB - This photo will appear on your public profile and in the dashboard header</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-[#111111] mb-2">Display Name</label>
            <input
              type="text"
              required
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2EE6A6] focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#111111] mb-2">
              Bio <span className="text-[#6B7280] font-normal">(Max 80 characters)</span>
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => {
                if (e.target.value.length <= 80) {
                  setFormData({ ...formData, bio: e.target.value });
                }
              }}
              rows={3}
              placeholder="Tell people about yourself..."
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2EE6A6] focus:border-transparent transition-all"
            />
            <p className={`text-xs mt-1 ${formData.bio.length > 70 ? 'text-red-500' : 'text-[#6B7280]'}`}>
              {80 - formData.bio.length} characters remaining
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#111111] mb-2">Mobile Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+911234567890"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2EE6A6] focus:border-transparent transition-all"
            />
            <p className="mt-2 text-xs text-[#6B7280]">Include country code (e.g., +91 for India, +1 for USA)</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#111111] mb-2">Email</label>
            <input
              type="email"
              value={profile?.email || user?.emailAddresses[0]?.emailAddress || ''}
              disabled
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-[#6B7280] cursor-not-allowed"
            />
            <p className="mt-2 text-xs text-[#6B7280]">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#111111] mb-2">Username</label>
            <input
              type="text"
              value={profile?.username || ''}
              disabled
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-[#6B7280] cursor-not-allowed"
            />
            <p className="mt-2 text-xs text-[#6B7280]">Username cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#111111] mb-2">Your Profile URL</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={bioLink}
                disabled
                className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-[#6B7280] cursor-not-allowed font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => copyToClipboard(bioLink)}
                className="px-6 py-3 bg-[#2EE6A6] text-white rounded-xl hover:bg-[#1FD695] transition-all flex items-center gap-2 font-semibold shadow-lg"
              >
                <Copy className="h-4 w-4" />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="mt-2 text-xs text-[#6B7280]">Share this URL with your audience</p>
          </div>

          {success && (
            <div className="bg-[#2EE6A6]/10 border-2 border-[#2EE6A6]/30 rounded-xl p-4">
              <p className="text-[#111111] font-semibold flex items-center gap-2">
                <svg className="h-5 w-5 text-[#2EE6A6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Settings saved successfully!
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2EE6A6] text-white px-6 py-3 rounded-xl hover:bg-[#1FD695] transition-all font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save className="h-5 w-5" />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      <div className="bg-gradient-to-br from-[#FFFDF9] to-gray-50 border-2 border-gray-200 rounded-2xl p-6">
        <h3 className="text-lg font-display font-bold text-[#111111] mb-4">Account Information</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-[#6B7280]">Account Status:</span>
            <span className="font-semibold text-[#111111] capitalize">{profile?.status || 'active'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6B7280]">Role:</span>
            <span className="font-semibold text-[#111111] capitalize">{profile?.role || 'creator'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6B7280]">Member Since:</span>
            <span className="font-semibold text-[#111111]">
              {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN') : '-'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}