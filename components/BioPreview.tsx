'use client';

import { Facebook, Instagram, Linkedin, Twitter, Youtube, User } from 'lucide-react';

interface BioPreviewProps {
  avatarUrl: string;
  displayName: string;
  username: string;
  bio: string;
  facebookUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  twitterUrl: string;
  youtubeUrl: string;
}

export function BioPreview({
  avatarUrl,
  displayName,
  username,
  bio,
  facebookUrl,
  instagramUrl,
  linkedinUrl,
  twitterUrl,
  youtubeUrl,
}: BioPreviewProps) {
  const socialLinks = [
    { name: 'Facebook', url: facebookUrl, icon: Facebook, color: 'bg-blue-600' },
    { name: 'Instagram', url: instagramUrl, icon: Instagram, color: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500' },
    { name: 'LinkedIn', url: linkedinUrl, icon: Linkedin, color: 'bg-blue-700' },
    { name: 'Twitter', url: twitterUrl, icon: Twitter, color: 'bg-black' },
    { name: 'YouTube', url: youtubeUrl, icon: Youtube, color: 'bg-red-600' },
  ].filter(link => link.url && link.url.trim() !== '');

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-lg">
      {/* Preview Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-[10px] font-medium text-gray-500">Live Preview</span>
      </div>

      {/* Realistic iPhone Mockup */}
      <div className="flex justify-center">
        <div className="relative bg-black rounded-[2rem] p-1.5 shadow-xl" style={{ width: '200px' }}>
          {/* Screen */}
          <div className="bg-white rounded-[1.6rem] overflow-hidden relative">
            {/* Dynamic Island */}
            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-14 h-4 bg-black rounded-full z-10"></div>

            {/* Content Area */}
            <div className="pt-8 px-3 pb-2" style={{ minHeight: '400px' }}>
              {/* Profile Image */}
              <div className="flex justify-center mb-2">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName || username}
                    className="w-14 h-14 rounded-full object-cover border-2 border-gray-100 shadow-md"
                  />
                ) : (
                  <div className="w-14 h-14 bg-gradient-to-br from-[#2EE6A6] to-[#1FD695] rounded-full flex items-center justify-center">
                    <User size={22} className="text-white" />
                  </div>
                )}
              </div>

              {/* Name */}
              <h2 className="text-gray-900 font-bold text-[11px] text-center leading-tight">
                {displayName || username || 'Your Name'}
              </h2>

              {/* Username */}
              <p className="text-gray-400 text-[9px] text-center mt-0.5">
                @{username || 'username'}
              </p>

              {/* Bio */}
              {bio && (
                <p className="text-gray-500 text-[9px] text-center max-w-[150px] mx-auto mt-1.5 line-clamp-2 leading-tight">
                  {bio}
                </p>
              )}

              {/* Social Links */}
              {socialLinks.length > 0 ? (
                <div className="mt-2.5 space-y-1.5">
                  {socialLinks.map((link, index) => {
                    const Icon = link.icon;
                    return (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-full flex items-center gap-1.5 ${link.color} rounded-lg py-1.5 px-2`}
                      >
                        <Icon size={10} className="text-white flex-shrink-0" />
                        <span className="text-white text-[9px] font-medium flex-1 truncate">
                          {link.name}
                        </span>
                      </a>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-3 py-3">
                  <div className="border border-dashed border-gray-200 rounded-lg py-2 text-center">
                    <p className="text-gray-300 text-[8px]">Add links</p>
                  </div>
                </div>
              )}
            </div>

            {/* Home Bar */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-16 h-1 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}