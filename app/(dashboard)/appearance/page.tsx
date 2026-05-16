import { Palette } from 'lucide-react';

export default function AppearancePage() {
  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
        <div className="w-16 h-16 bg-[#2EE6A6]/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Palette className="text-[#2EE6A6]" size={32} />
        </div>
        <h2 className="text-2xl font-display font-bold text-[#111111] mb-3">
          Customization Coming Soon
        </h2>
        <p className="text-[#6B7280] max-w-md mx-auto">
          Soon you'll be able to customize your bio page with themes, colors, fonts, backgrounds, and more!
        </p>
      </div>
    </div>
  );
}