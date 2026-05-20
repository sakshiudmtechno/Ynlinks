'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Save, User, Camera, Check } from 'lucide-react';

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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2EE6A6]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="avatar-upload" />
            <label htmlFor="avatar-upload" className="cursor-pointer group">
              {formData.avatarUrl ? (
                <img src={formData.avatarUrl} alt="Profile" className="w-16 h-16 rounded-xl object-cover border-2 border-[#2EE6A6]" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#2EE6A6] to-[#2EE6A6]/80 flex items-center justify-center border-2 border-[#2EE6A6]">
                  <User className="w-7 h-7 text-white" />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#2EE6A6] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-3 h-3 text-white" />
              </div>
            </label>
          </div>
          <div>
            <h2 className="font-semibold text-[#111111]">{profile?.displayName || profile?.username}</h2>
            <p className="text-xs text-[#6B7280]">@{profile?.username}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#111111] mb-1.5">Display Name</label>
            <input
              type="text"
              required
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2EE6A6]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#111111] mb-1.5">Bio (max 80 chars)</label>
            <textarea
              value={formData.bio}
              onChange={(e) => {
                if (e.target.value.length <= 80) {
                  setFormData({ ...formData, bio: e.target.value });
                }
              }}
              rows={2}
              placeholder="Tell people about yourself..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2EE6A6] resize-none"
            />
            <p className="text-xs text-[#6B7280] mt-1 text-right">{80 - formData.bio.length} left</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#111111] mb-1.5">Mobile Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+911234567890"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2EE6A6]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#111111] mb-1.5">Email</label>
            <input
              type="email"
              value={profile?.email || user?.emailAddresses[0]?.emailAddress || ''}
              disabled
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-[#6B7280]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#111111] mb-1.5">Username</label>
            <input
              type="text"
              value={profile?.username || ''}
              disabled
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-[#6B7280]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#111111] mb-1.5">Your Profile URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={bioLink}
                disabled
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-[#6B7280] font-mono truncate"
              />
              <button
                type="button"
                onClick={() => copyToClipboard(bioLink)}
                className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  copied ? 'bg-green-500 text-white' : 'bg-[#2EE6A6] text-white hover:bg-[#1FD695]'
                }`}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          {success && (
            <div className="bg-[#2EE6A6]/10 border border-[#2EE6A6]/30 rounded-lg px-4 py-3">
              <p className="text-sm text-[#111111] font-medium flex items-center gap-2">
                <Check size={14} className="text-[#2EE6A6]" />
                Settings saved successfully!
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2EE6A6] text-white py-3 rounded-xl font-semibold hover:bg-[#1FD695] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save size={16} />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Account Info Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-[#111111] mb-3">Account Information</h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-[#6B7280]">Status</span>
            <span className="font-medium text-[#111111] capitalize">{profile?.status || 'active'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6B7280]">Role</span>
            <span className="font-medium text-[#111111] capitalize">{profile?.role || 'creator'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6B7280]">Member Since</span>
            <span className="font-medium text-[#111111]">
              {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN') : '-'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}