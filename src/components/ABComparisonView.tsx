import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRightLeft,
  CheckCircle2,
  TrendingUp,
  Download,
  Palette,
  Edit3,
  RefreshCw,
  Lightbulb,
  Award,
} from 'lucide-react';
import { AdFormat, BannerAdData, AdVariant, STANDARD_AD_FORMATS } from '../types/banner';
import { BannerDisplay } from './BannerDisplay';
import { exportBannerAsImage } from '../utils/exportBanner';
import confetti from 'canvas-confetti';

interface ABComparisonViewProps {
  adData: BannerAdData;
  onUpdateAdData: (updated: Partial<BannerAdData>) => void;
  onGenerateVariations: () => void;
  generatingVariations: boolean;
  scale: number;
}

export const ABComparisonView: React.FC<ABComparisonViewProps> = ({
  adData,
  onUpdateAdData,
  onGenerateVariations,
  generatingVariations,
  scale,
}) => {
  // Current format being compared side-by-side
  const [selectedFormatId, setSelectedFormatId] = useState<string>('medium-rectangle');
  const [editingVariant, setEditingVariant] = useState<'a' | 'b' | null>(null);

  const currentFormat =
    STANDARD_AD_FORMATS.find((f) => f.id === selectedFormatId) || STANDARD_AD_FORMATS[0];

  // Derive Variant A and Variant B with fallback defaults
  const variantA: AdVariant = adData.variantA || {
    id: 'variant-a',
    label: 'Variant A (Feature & Value Focus)',
    headline: adData.headline || 'Silence The World. Hear Pure Euphoria.',
    subheadline: adData.subheadline || 'Engineered with aerospace-grade acoustic drivers and 48-hour continuous battery life.',
    callToAction: adData.callToAction || 'Shop Now • 25% Off',
    badge: adData.badge || '★ 4.9 RATED • NEW RELEASE',
    primaryColor: adData.primaryColor || '#0EA5E9',
    strategyHook: 'Value Proposition & Product Trust',
    predictedCtr: 3.4,
    rationale: 'Focuses on direct functional utility and high customer ratings to build trust and lower barrier to purchase.',
  };

  const variantB: AdVariant = adData.variantB || {
    id: 'variant-b',
    label: 'Variant B (Urgency & High Contrast)',
    headline: 'Only 150 Units Left. Claim 30% Off Today.',
    subheadline: 'Studio-grade spatial acoustic drivers with 48h battery. Free express delivery ends midnight.',
    callToAction: 'Claim Discount Now',
    badge: 'FLASH SALE • ENDS TODAY',
    primaryColor: '#F59E0B',
    strategyHook: 'Urgency, Scarcity & High-Contrast CTA',
    predictedCtr: 4.2,
    rationale: 'Combines loss aversion with a high-contrast amber CTA button for maximum visual pop and click velocity.',
  };

  // Create temporary BannerAdData wrappers for rendering each variant through BannerDisplay
  const adDataVariantA: BannerAdData = {
    ...adData,
    headline: variantA.headline,
    subheadline: variantA.subheadline,
    callToAction: variantA.callToAction,
    badge: variantA.badge,
    primaryColor: variantA.primaryColor,
  };

  const adDataVariantB: BannerAdData = {
    ...adData,
    headline: variantB.headline,
    subheadline: variantB.subheadline,
    callToAction: variantB.callToAction,
    badge: variantB.badge,
    primaryColor: variantB.primaryColor,
  };

  // Apply chosen variant to master ad data
  const handleApplyVariant = (variant: AdVariant) => {
    onUpdateAdData({
      headline: variant.headline,
      subheadline: variant.subheadline,
      callToAction: variant.callToAction,
      badge: variant.badge,
      primaryColor: variant.primaryColor,
    });
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  // Swap variants
  const handleSwapVariants = () => {
    onUpdateAdData({
      variantA: { ...variantB, id: 'variant-a', label: 'Variant A' },
      variantB: { ...variantA, id: 'variant-b', label: 'Variant B' },
    });
  };

  // Download both variants side-by-side for the selected format
  const handleDownloadBoth = async () => {
    await exportBannerAsImage(currentFormat, adDataVariantA, 2);
    await new Promise((r) => setTimeout(r, 200));
    await exportBannerAsImage(currentFormat, adDataVariantB, 2);
    confetti({
      particleCount: 40,
      spread: 50,
    });
  };

  // Color options
  const COLOR_OPTIONS = [
    { label: 'Sky Blue', hex: '#0EA5E9' },
    { label: 'Amber Gold', hex: '#F59E0B' },
    { label: 'Emerald', hex: '#10B981' },
    { label: 'Rose Coral', hex: '#F43F5E' },
    { label: 'Violet', hex: '#8B5CF6' },
    { label: 'Crimson', hex: '#EF4444' },
  ];

  const ctrDiff = ((variantB.predictedCtr || 4.2) - (variantA.predictedCtr || 3.4)).toFixed(1);
  const isPositiveLift = Number(ctrDiff) >= 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner Control & Format Picker */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg">
                <ArrowRightLeft className="w-4 h-4" />
              </span>
              <h2 className="text-sm sm:text-base font-bold text-white">
                A/B Performance Split Testing Lab
              </h2>
              <span className="bg-amber-500/15 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                Live Side-by-Side
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Compare two different creative strategies with alternative headlines, CTA button colors, and psychological angles.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleSwapVariants}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
              title="Swap Variant A and Variant B"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Swap A/B</span>
            </button>

            <button
              onClick={handleDownloadBoth}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>Export Both (PNG)</span>
            </button>

            <button
              onClick={onGenerateVariations}
              disabled={generatingVariations}
              className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${generatingVariations ? 'animate-spin' : ''}`} />
              <span>{generatingVariations ? 'Generating Variations...' : 'Re-Generate AI Variations'}</span>
            </button>
          </div>
        </div>

        {/* Format Selector Pills */}
        <div className="pt-2 border-t border-slate-800 flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">
            Select Test Format:
          </span>
          {STANDARD_AD_FORMATS.map((fmt) => (
            <button
              key={fmt.id}
              onClick={() => setSelectedFormatId(fmt.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedFormatId === fmt.id
                  ? 'bg-sky-500 text-white shadow'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {fmt.name} ({fmt.width}×{fmt.height})
            </button>
          ))}
        </div>
      </div>

      {/* Side-by-Side Visual Comparison Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* ================= VARIATION A CARD ================= */}
        <div className="bg-slate-900/90 border-2 border-sky-500/40 rounded-2xl p-5 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-3 mb-4">
            {/* Header Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-sky-500 text-white font-black text-xs flex items-center justify-center">
                  A
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    Variation A
                    <span className="text-[10px] text-slate-400 font-normal">
                      ({variantA.strategyHook})
                    </span>
                  </h3>
                </div>
              </div>

              {/* Performance Indicator */}
              <div className="flex items-center gap-1 bg-sky-500/10 border border-sky-500/30 px-2 py-0.5 rounded-full text-[11px] font-semibold text-sky-300">
                <TrendingUp className="w-3 h-3" />
                <span>Est. CTR: {variantA.predictedCtr || 3.4}%</span>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">CTA Color</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-white/20"
                    style={{ backgroundColor: variantA.primaryColor }}
                  />
                  <span className="font-mono text-[11px] text-slate-300">
                    {variantA.primaryColor}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">CTA Action</span>
                <span className="font-semibold text-slate-200 truncate block mt-0.5">
                  "{variantA.callToAction}"
                </span>
              </div>
            </div>
          </div>

          {/* Banner Visual Display */}
          <div className="w-full flex justify-center py-4 bg-slate-950/40 rounded-xl border border-slate-800/60 overflow-hidden">
            <BannerDisplay
              format={currentFormat}
              adData={adDataVariantA}
              scale={Math.min(scale, 0.75)}
            />
          </div>

          {/* Marketing Angle & Apply Button */}
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
            <p className="text-xs text-slate-300 leading-relaxed italic">
              "{variantA.rationale}"
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditingVariant(editingVariant === 'a' ? null : 'a')}
                className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5 text-sky-400" />
                <span>{editingVariant === 'a' ? 'Close Editor' : 'Customize Variant A'}</span>
              </button>

              <button
                onClick={() => handleApplyVariant(variantA)}
                className="flex-1 py-1.5 px-3 bg-sky-500 hover:bg-sky-400 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Set Variant A as Winner</span>
              </button>
            </div>

            {/* Quick Edit Panel for Variant A */}
            {editingVariant === 'a' && (
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5 animate-in fade-in duration-200">
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-0.5">
                    Headline
                  </label>
                  <input
                    type="text"
                    value={variantA.headline}
                    onChange={(e) =>
                      onUpdateAdData({
                        variantA: { ...variantA, headline: e.target.value },
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-0.5">
                    CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={variantA.callToAction}
                    onChange={(e) =>
                      onUpdateAdData({
                        variantA: { ...variantA, callToAction: e.target.value },
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                    CTA Color Palette
                  </label>
                  <div className="flex items-center gap-2">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c.hex}
                        onClick={() =>
                          onUpdateAdData({
                            variantA: { ...variantA, primaryColor: c.hex },
                          })
                        }
                        className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                        style={{
                          backgroundColor: c.hex,
                          borderColor: variantA.primaryColor === c.hex ? '#FFF' : 'transparent',
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================= VARIATION B CARD ================= */}
        <div className="bg-slate-900/90 border-2 border-amber-500/40 rounded-2xl p-5 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-3 mb-4">
            {/* Header Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center">
                  B
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    Variation B
                    <span className="text-[10px] text-slate-400 font-normal">
                      ({variantB.strategyHook})
                    </span>
                  </h3>
                </div>
              </div>

              {/* Performance Indicator with Lift Badge */}
              <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-amber-300">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Est. CTR: {variantB.predictedCtr || 4.2}%</span>
                {isPositiveLift && (
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.2 rounded font-bold">
                    +{ctrDiff}% Lift
                  </span>
                )}
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">CTA Color</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-white/20"
                    style={{ backgroundColor: variantB.primaryColor }}
                  />
                  <span className="font-mono text-[11px] text-slate-300">
                    {variantB.primaryColor}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">CTA Action</span>
                <span className="font-semibold text-slate-200 truncate block mt-0.5">
                  "{variantB.callToAction}"
                </span>
              </div>
            </div>
          </div>

          {/* Banner Visual Display */}
          <div className="w-full flex justify-center py-4 bg-slate-950/40 rounded-xl border border-slate-800/60 overflow-hidden">
            <BannerDisplay
              format={currentFormat}
              adData={adDataVariantB}
              scale={Math.min(scale, 0.75)}
            />
          </div>

          {/* Marketing Angle & Apply Button */}
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
            <p className="text-xs text-slate-300 leading-relaxed italic">
              "{variantB.rationale}"
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditingVariant(editingVariant === 'b' ? null : 'b')}
                className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                <span>{editingVariant === 'b' ? 'Close Editor' : 'Customize Variant B'}</span>
              </button>

              <button
                onClick={() => handleApplyVariant(variantB)}
                className="flex-1 py-1.5 px-3 bg-amber-500 hover:bg-amber-400 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Set Variant B as Winner</span>
              </button>
            </div>

            {/* Quick Edit Panel for Variant B */}
            {editingVariant === 'b' && (
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5 animate-in fade-in duration-200">
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-0.5">
                    Headline
                  </label>
                  <input
                    type="text"
                    value={variantB.headline}
                    onChange={(e) =>
                      onUpdateAdData({
                        variantB: { ...variantB, headline: e.target.value },
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-0.5">
                    CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={variantB.callToAction}
                    onChange={(e) =>
                      onUpdateAdData({
                        variantB: { ...variantB, callToAction: e.target.value },
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                    CTA Color Palette
                  </label>
                  <div className="flex items-center gap-2">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c.hex}
                        onClick={() =>
                          onUpdateAdData({
                            variantB: { ...variantB, primaryColor: c.hex },
                          })
                        }
                        className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                        style={{
                          backgroundColor: c.hex,
                          borderColor: variantB.primaryColor === c.hex ? '#FFF' : 'transparent',
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Strategic Comparison Matrix & Recommendation */}
      <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Conversion Strategy Matrix & Performance Rationale
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5">
            <span className="font-semibold text-sky-400 block">Variant A Strategy</span>
            <p className="text-slate-300">
              <strong>Angle:</strong> {variantA.strategyHook}
            </p>
            <p className="text-slate-400 leading-relaxed">
              Targeted at consideration-phase prospects who value clear product specs, official certifications, and credibility cues.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5">
            <span className="font-semibold text-amber-400 block">Variant B Strategy</span>
            <p className="text-slate-300">
              <strong>Angle:</strong> {variantB.strategyHook}
            </p>
            <p className="text-slate-400 leading-relaxed">
              Targeted at impulse clicks and retargeting pools. High visual luminance from {variantB.primaryColor} elevates eye fixation by 38%.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5">
            <span className="font-semibold text-emerald-400 block">Split-Test Recommendation</span>
            <p className="text-slate-300">
              {adData.comparisonAdvice ||
                'Run a 50/50 programmatic split test for 72 hours or 10,000 impressions to validate statistical significance before scaling.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
