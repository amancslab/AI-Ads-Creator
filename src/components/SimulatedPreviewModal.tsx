import React, { useState } from 'react';
import { X, Globe, Smartphone, Instagram, Monitor } from 'lucide-react';
import { BannerAdData, STANDARD_AD_FORMATS } from '../types/banner';
import { BannerDisplay } from './BannerDisplay';

interface SimulatedPreviewModalProps {
  adData: BannerAdData;
  onClose: () => void;
}

export const SimulatedPreviewModal: React.FC<SimulatedPreviewModalProps> = ({
  adData,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'desktop-site' | 'mobile-phone' | 'social-feed'>('desktop-site');

  const leaderboard = STANDARD_AD_FORMATS.find((f) => f.id === 'leaderboard')!;
  const mediumRectangle = STANDARD_AD_FORMATS.find((f) => f.id === 'medium-rectangle')!;
  const mobileLeaderboard = STANDARD_AD_FORMATS.find((f) => f.id === 'mobile-leaderboard')!;
  const squareSocial = STANDARD_AD_FORMATS.find((f) => f.id === 'square-social')!;
  const storyReel = STANDARD_AD_FORMATS.find((f) => f.id === 'story-reel')!;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-sky-500/10 text-sky-400 rounded-lg">
              <Monitor className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white">Live In-Market Simulator</h3>
              <p className="text-xs text-slate-400">
                Preview how your ads display inside real websites, mobile apps, and social feeds
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => setActiveTab('desktop-site')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'desktop-site'
                    ? 'bg-sky-500 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Web Publication</span>
              </button>
              <button
                onClick={() => setActiveTab('mobile-phone')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'mobile-phone'
                    ? 'bg-sky-500 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile App</span>
              </button>
              <button
                onClick={() => setActiveTab('social-feed')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'social-feed'
                    ? 'bg-sky-500 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>Social Feed</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Simulator Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950/70">
          {activeTab === 'desktop-site' && (
            <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
              {/* Fake Browser Toolbar */}
              <div className="bg-slate-800 px-4 py-2 flex items-center gap-2 border-b border-slate-700">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                </div>
                <div className="flex-1 max-w-sm mx-auto bg-slate-900 px-3 py-1 rounded text-[11px] text-slate-400 font-mono text-center truncate">
                  https://theverge-daily-tech.com/review/innovation-trends
                </div>
              </div>

              {/* Website Content Mockup */}
              <div className="p-6 space-y-6">
                {/* 728x90 Leaderboard Ad at Top */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">
                    Advertisement • Leaderboard 728×90
                  </span>
                  <div className="w-full flex justify-center overflow-x-auto">
                    <BannerDisplay format={leaderboard} adData={adData} scale={1} />
                  </div>
                </div>

                {/* Article Header */}
                <div className="border-t border-slate-800 pt-6">
                  <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                    Special Report • Tech Trends
                  </span>
                  <h1 className="text-2xl font-bold text-white mt-1">
                    The Modern Breakthroughs Reshaping High-Performance Design
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    By Marcus Vance • 4 min read • Updated today
                  </p>
                </div>

                {/* Article Body with 300x250 Medium Rectangle Floated */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                  <div className="md:col-span-2 space-y-4 text-slate-300 text-sm leading-relaxed">
                    <p>
                      In today’s fast-moving market, brand discovery happens in split seconds. High-performing products rely on immediate emotional resonance, sharp visual framing, and crystal-clear value propositions.
                    </p>
                    <p>
                      Industry research proves that multi-format adaptive banner campaigns yield up to 4.2x higher click-through performance than static single-size creatives, maintaining cohesive recall across display networks and social channels.
                    </p>
                    <div className="p-4 bg-slate-800/50 rounded-lg border-l-4 border-sky-400 italic text-slate-300">
                      "Clean creative execution paired with consistent visual pacing is the defining competitive advantage in programmatic media."
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">
                      Sponsored • 300×250
                    </span>
                    <BannerDisplay format={mediumRectangle} adData={adData} scale={1} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'mobile-phone' && (
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-4">
              {/* Phone 1: Mobile App with Sticky 320x50 Banner */}
              <div className="w-[340px] h-[640px] bg-slate-900 border-4 border-slate-700 rounded-[36px] p-3 shadow-2xl relative flex flex-col justify-between overflow-hidden">
                {/* Notch / Speaker */}
                <div className="w-28 h-4 bg-slate-800 rounded-b-xl mx-auto mb-2 flex items-center justify-center">
                  <div className="w-10 h-1 bg-slate-700 rounded-full" />
                </div>

                {/* Mobile App Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 px-2">
                  <span className="text-xs font-bold text-white">Daily Newsfeed</span>
                  <span className="text-[10px] text-slate-400 font-mono">9:41 AM</span>
                </div>

                {/* Mobile Feed Items */}
                <div className="flex-1 overflow-y-auto space-y-3 py-3 px-2 text-xs">
                  <div className="p-3 bg-slate-800/80 rounded-xl space-y-1">
                    <div className="w-20 h-2.5 bg-slate-700 rounded" />
                    <div className="w-full h-3 bg-slate-600 rounded" />
                    <div className="w-4/5 h-3 bg-slate-600 rounded" />
                  </div>

                  <div className="p-3 bg-slate-800/80 rounded-xl space-y-1">
                    <div className="w-28 h-2.5 bg-slate-700 rounded" />
                    <div className="w-full h-3 bg-slate-600 rounded" />
                    <div className="w-3/4 h-3 bg-slate-600 rounded" />
                  </div>
                </div>

                {/* Sticky Mobile Banner 320x50 */}
                <div className="pt-2 border-t border-slate-800 flex flex-col items-center">
                  <span className="text-[9px] font-mono text-slate-500 uppercase mb-1">
                    Sticky App Banner • 320×50
                  </span>
                  <BannerDisplay format={mobileLeaderboard} adData={adData} scale={1} />
                </div>
              </div>

              {/* Phone 2: Full Vertical Story 1080x1920 scaled */}
              <div className="w-[340px] h-[640px] bg-slate-900 border-4 border-slate-700 rounded-[36px] shadow-2xl relative overflow-hidden flex flex-col">
                <div className="absolute top-2 left-0 right-0 z-20 px-4 flex items-center gap-1">
                  <div className="h-1 flex-1 bg-white/70 rounded-full" />
                  <div className="h-1 flex-1 bg-white/30 rounded-full" />
                </div>
                <div className="relative flex-1 w-full h-full">
                  <BannerDisplay format={storyReel} adData={adData} scale={0.315} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'social-feed' && (
            <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              {/* Social Header */}
              <div className="p-3.5 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white"
                    style={{ backgroundColor: adData.primaryColor }}
                  >
                    {adData.brandName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block leading-tight">
                      {adData.brandName}
                    </span>
                    <span className="text-[10px] text-sky-400 font-medium">Sponsored</span>
                  </div>
                </div>
                <span className="text-slate-500 text-xs">• • •</span>
              </div>

              {/* Social Ad (Square 1:1) */}
              <div className="flex justify-center p-3 bg-black/40">
                <BannerDisplay format={squareSocial} adData={adData} scale={0.38} />
              </div>

              {/* Social Interactions */}
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <div className="flex items-center gap-4">
                    <span>❤️ 1,482 likes</span>
                    <span>💬 84 comments</span>
                  </div>
                  <span>↗ Share</span>
                </div>
                <p className="text-xs text-slate-300">
                  <strong className="text-white">{adData.brandName}</strong> {adData.subheadline}
                </p>
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">{adData.url}</span>
                  <button
                    className="px-3 py-1 rounded text-xs font-bold text-white shadow"
                    style={{ backgroundColor: adData.primaryColor }}
                  >
                    {adData.callToAction}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
