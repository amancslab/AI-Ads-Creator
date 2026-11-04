import React from 'react';
import { X, Check, RefreshCw, Palette, Type, Sparkles, Image as ImageIcon } from 'lucide-react';
import { AdFormat, BannerAdData, SupportedAspectRatio, SupportedImageSize, SupportedModel } from '../types/banner';

interface BannerEditorModalProps {
  format: AdFormat | null;
  adData: BannerAdData;
  onUpdate: (updated: Partial<BannerAdData>) => void;
  onClose: () => void;
  onRegenerateImage: (aspectRatio: SupportedAspectRatio) => void;
  generatingImage: boolean;
}

const COLOR_PRESETS = [
  { name: 'Sky Blue', hex: '#0EA5E9' },
  { name: 'Emerald', hex: '#10B981' },
  { name: 'Amber Gold', hex: '#F59E0B' },
  { name: 'Rose Coral', hex: '#F43F5E' },
  { name: 'Neon Purple', hex: '#8B5CF6' },
  { name: 'Crimson', hex: '#EF4444' },
  { name: 'Dark Slate', hex: '#334155' },
];

export const BannerEditorModal: React.FC<BannerEditorModalProps> = ({
  format,
  adData,
  onUpdate,
  onClose,
  onRegenerateImage,
  generatingImage,
}) => {
  if (!format) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-sky-400" />
              Customize Banner: {format.name}
            </h3>
            <p className="text-xs text-slate-400">
              {format.width} × {format.height}px • Recommended Aspect Ratio: {format.recommendedRatio}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <div className="py-4 space-y-4 overflow-y-auto pr-1">
          {/* Brand Name & Headline */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Brand / Product Name
            </label>
            <input
              type="text"
              value={adData.brandName}
              onChange={(e) => onUpdate({ brandName: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-hidden focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Main Headline
            </label>
            <input
              type="text"
              value={adData.headline}
              onChange={(e) => onUpdate({ headline: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-hidden focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Subheadline / Key Benefit
            </label>
            <textarea
              rows={2}
              value={adData.subheadline}
              onChange={(e) => onUpdate({ subheadline: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-hidden focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Call to Action (CTA)
              </label>
              <input
                type="text"
                value={adData.callToAction}
                onChange={(e) => onUpdate({ callToAction: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-hidden focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Badge / Tagline
              </label>
              <input
                type="text"
                value={adData.badge}
                onChange={(e) => onUpdate({ badge: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-hidden focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Destination URL
            </label>
            <input
              type="text"
              value={adData.url}
              onChange={(e) => onUpdate({ url: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-hidden focus:border-sky-500"
            />
          </div>

          {/* Accent Color Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-sky-400" />
              Brand Accent Color
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_PRESETS.map((col) => (
                <button
                  key={col.hex}
                  onClick={() => onUpdate({ primaryColor: col.hex })}
                  className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center"
                  style={{
                    backgroundColor: col.hex,
                    borderColor: adData.primaryColor === col.hex ? '#FFFFFF' : 'transparent',
                  }}
                  title={col.name}
                >
                  {adData.primaryColor === col.hex && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              ))}
              <div className="flex items-center gap-1.5 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700">
                <input
                  type="color"
                  value={adData.primaryColor}
                  onChange={(e) => onUpdate({ primaryColor: e.target.value })}
                  className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                />
                <span className="text-xs font-mono text-slate-300">{adData.primaryColor}</span>
              </div>
            </div>
          </div>

          {/* Re-generate specific aspect ratio visual button */}
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-white flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-sky-400" />
                Regenerate Image for this Format
              </p>
              <p className="text-[11px] text-slate-400">
                Generate tailored {format.recommendedRatio} imagery using {adData.activeModel}
              </p>
            </div>
            <button
              onClick={() => onRegenerateImage(format.recommendedRatio)}
              disabled={generatingImage}
              className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${generatingImage ? 'animate-spin' : ''}`} />
              <span>{generatingImage ? 'Generating...' : `Gen ${format.recommendedRatio}`}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-lg text-sm transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
