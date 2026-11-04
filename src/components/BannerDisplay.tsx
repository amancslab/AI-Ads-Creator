import React from 'react';
import { Download, Code2, Sparkles, ExternalLink } from 'lucide-react';
import { AdFormat, BannerAdData } from '../types/banner';
import { exportBannerAsImage } from '../utils/exportBanner';

interface BannerDisplayProps {
  format: AdFormat;
  adData: BannerAdData;
  onEdit?: (format: AdFormat) => void;
  scale?: number;
}

export const BannerDisplay: React.FC<BannerDisplayProps> = ({
  format,
  adData,
  onEdit,
  scale = 1,
}) => {
  const [downloading, setDownloading] = React.useState(false);
  const [copiedCode, setCopiedCode] = React.useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloading(true);
    try {
      await exportBannerAsImage(format, adData, 2);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyEmbed = (e: React.MouseEvent) => {
    e.stopPropagation();
    const cleanUrl = adData.url || 'https://example.com';
    const embedHtml = `<!-- AdCraft Banner Ad: ${format.name} (${format.width}x${format.height}) -->
<div class="adcraft-banner-${format.id}" style="width:${format.width}px;height:${format.height}px;position:relative;overflow:hidden;border-radius:6px;font-family:system-ui,-apple-system,sans-serif;">
  <a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;display:block;width:100%;height:100%;">
    <img src="${adData.imageUrl}" alt="${adData.headline}" style="width:100%;height:100%;object-fit:cover;position:absolute;left:0;top:0;" />
    <div style="position:absolute;inset:0;background:linear-gradient(to top, rgba(0,0,0,0.88), rgba(0,0,0,0.3));padding:16px;display:flex;flex-direction:column;justify-content:space-between;color:#fff;">
      <span style="font-weight:700;color:${adData.primaryColor};text-transform:uppercase;font-size:11px;">${adData.brandName}</span>
      <div>
        <h3 style="margin:0 0 6px 0;font-size:16px;font-weight:bold;line-height:1.2;">${adData.headline}</h3>
        <span style="display:inline-block;background:${adData.primaryColor};color:#fff;padding:6px 14px;border-radius:4px;font-weight:bold;font-size:12px;">${adData.callToAction}</span>
      </div>
    </div>
  </a>
</div>`;
    navigator.clipboard.writeText(embedHtml);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const isWide = format.width >= 700 && format.height <= 120; // 728x90
  const isNarrowVertical = format.width <= 180; // 160x600
  const isCompactMobile = format.height <= 60; // 320x50
  const isMediumMobile = format.width === 320 && format.height === 100;
  const isVerticalStory = format.width === 1080 && format.height === 1920;

  // Domain display
  const domain = adData.url.replace(/^https?:\/\//, '').split('/')[0] || 'shop.now';

  return (
    <div className="group relative flex flex-col items-center bg-slate-900/60 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all shadow-lg">
      {/* Format Header Bar */}
      <div className="w-full flex items-center justify-between gap-2 mb-3 text-xs">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="font-semibold text-slate-200 truncate">{format.name}</span>
          <span className="bg-slate-800 text-sky-400 font-mono text-[10px] px-2 py-0.5 rounded border border-slate-700">
            {format.width} × {format.height}
          </span>
          <span className="hidden sm:inline text-slate-500 font-mono text-[10px]">
            {format.recommendedRatio}
          </span>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleCopyEmbed}
            title="Copy HTML/CSS embed code"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors text-xs flex items-center gap-1"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[11px]">{copiedCode ? 'Copied!' : 'Code'}</span>
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            title="Download PNG (High Res 2x)"
            className="p-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 hover:text-sky-300 rounded transition-colors text-xs flex items-center gap-1 border border-sky-500/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium">{downloading ? '...' : 'PNG'}</span>
          </button>
        </div>
      </div>

      {/* Render Banner Box */}
      <div
        className="relative overflow-hidden rounded-md border border-slate-700/80 shadow-2xl transition-transform cursor-pointer select-none"
        style={{
          width: `${format.width * scale}px`,
          height: `${format.height * scale}px`,
          maxWidth: '100%',
        }}
        onClick={() => onEdit?.(format)}
      >
        {/* Ad Background Visual */}
        {adData.imageUrl ? (
          <img
            src={adData.imageUrl}
            alt={adData.headline}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at top right, ${adData.primaryColor}33, #090D16 75%)`,
            }}
          />
        )}

        {/* Dynamic Vignette & Scrim Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-slate-950/30" />

        {/* Layout: Compact Mobile 320x50 */}
        {isCompactMobile && (
          <div className="relative z-10 w-full h-full px-2.5 py-1.5 flex items-center justify-between gap-2">
            <div className="flex flex-col justify-center min-w-0">
              <span
                className="text-[9px] font-bold tracking-wider uppercase truncate"
                style={{ color: adData.primaryColor }}
              >
                {adData.brandName}
              </span>
              <p className="text-[10px] font-bold text-white leading-tight truncate">
                {adData.headline}
              </p>
            </div>
            <button
              className="shrink-0 px-2.5 py-1 rounded text-[9px] font-bold text-white shadow-md active:scale-95 transition-transform"
              style={{ backgroundColor: adData.primaryColor }}
            >
              {adData.callToAction}
            </button>
          </div>
        )}

        {/* Layout: Leaderboard 728x90 */}
        {isWide && (
          <div className="relative z-10 w-full h-full px-5 py-2.5 flex items-center justify-between gap-4">
            <div className="flex flex-col justify-center shrink-0 max-w-[150px]">
              <span
                className="text-[11px] font-black tracking-wider uppercase"
                style={{ color: adData.primaryColor }}
              >
                {adData.brandName}
              </span>
              {adData.badge && (
                <span className="text-[9px] font-semibold text-slate-400 truncate">
                  {adData.badge}
                </span>
              )}
            </div>

            <div className="flex-1 flex flex-col justify-center min-w-0">
              <h4 className="text-[14px] font-black text-white leading-tight truncate">
                {adData.headline}
              </h4>
              <p className="text-[11px] text-slate-300 leading-snug truncate">
                {adData.subheadline}
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <span className="text-[10px] text-slate-400 font-medium hidden lg:inline">
                {domain}
              </span>
              <button
                className="px-4 py-2 rounded text-[11px] font-bold text-white shadow-lg hover:brightness-110 active:scale-95 transition-all"
                style={{ backgroundColor: adData.primaryColor }}
              >
                {adData.callToAction}
              </button>
            </div>
          </div>
        )}

        {/* Layout: Narrow Skyscraper 160x600 */}
        {isNarrowVertical && (
          <div className="relative z-10 w-full h-full p-3 flex flex-col justify-between">
            <div>
              <span
                className="text-[10px] font-black tracking-wider uppercase block mb-1"
                style={{ color: adData.primaryColor }}
              >
                {adData.brandName}
              </span>
              {adData.badge && (
                <span className="inline-block bg-white/10 backdrop-blur-xs text-[8px] font-bold text-slate-200 px-1.5 py-0.5 rounded border border-white/15 mb-2 leading-none">
                  {adData.badge}
                </span>
              )}
              <h4 className="text-[13px] font-black text-white leading-snug mt-1">
                {adData.headline}
              </h4>
              <p className="text-[10px] text-slate-300 mt-2 leading-normal line-clamp-4">
                {adData.subheadline}
              </p>
            </div>

            <div className="mt-auto">
              <button
                className="w-full py-2 px-2 rounded text-[10px] font-bold text-white shadow-md hover:brightness-110 active:scale-95 transition-all text-center"
                style={{ backgroundColor: adData.primaryColor }}
              >
                {adData.callToAction}
              </button>
              <span className="text-[8px] text-slate-400 block text-center mt-2 truncate">
                {domain}
              </span>
            </div>
          </div>
        )}

        {/* Layout: Medium Mobile Banner 320x100 */}
        {isMediumMobile && (
          <div className="relative z-10 w-full h-full p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span
                className="text-[10px] font-black tracking-wider uppercase"
                style={{ color: adData.primaryColor }}
              >
                {adData.brandName}
              </span>
              {adData.badge && (
                <span className="text-[8px] font-bold text-slate-300 bg-black/40 px-1.5 py-0.5 rounded">
                  {adData.badge}
                </span>
              )}
            </div>

            <div>
              <h4 className="text-[12px] font-bold text-white leading-tight truncate">
                {adData.headline}
              </h4>
              <p className="text-[10px] text-slate-300 truncate">{adData.subheadline}</p>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[9px] text-slate-400">{domain}</span>
              <button
                className="px-3 py-1 rounded text-[10px] font-bold text-white shadow active:scale-95"
                style={{ backgroundColor: adData.primaryColor }}
              >
                {adData.callToAction}
              </button>
            </div>
          </div>
        )}

        {/* Layout: Standard Rectangles, Squares, Half Page, Billboard, Story */}
        {!isWide && !isNarrowVertical && !isCompactMobile && !isMediumMobile && (
          <div
            className={`relative z-10 w-full h-full p-4 sm:p-5 flex flex-col justify-between ${
              isVerticalStory ? 'p-8 sm:p-12' : ''
            }`}
          >
            {/* Top Row: Brand & Badge */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <span
                  className="text-xs sm:text-sm font-black tracking-wider uppercase drop-shadow"
                  style={{ color: adData.primaryColor }}
                >
                  {adData.brandName}
                </span>
                {adData.badge && (
                  <div className="mt-1">
                    <span className="inline-block bg-white/15 backdrop-blur-sm text-[9px] sm:text-[10px] font-bold text-slate-100 px-2 py-0.5 rounded border border-white/20 shadow">
                      {adData.badge}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-300/80 font-mono tracking-tight bg-black/40 px-2 py-0.5 rounded">
                {domain}
              </span>
            </div>

            {/* Bottom Section: Headline, Subhead & Button */}
            <div className="mt-auto space-y-2 sm:space-y-3">
              <h3
                className={`font-black text-white leading-tight drop-shadow-md ${
                  format.width >= 900
                    ? 'text-xl sm:text-2xl lg:text-3xl'
                    : format.width >= 400
                    ? 'text-lg sm:text-xl'
                    : 'text-sm sm:text-base'
                }`}
              >
                {adData.headline}
              </h3>

              {format.height >= 240 && (
                <p className="text-slate-200 text-xs sm:text-sm leading-relaxed drop-shadow line-clamp-3">
                  {adData.subheadline}
                </p>
              )}

              <div className="pt-1 flex items-center justify-between gap-3">
                <button
                  className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold text-white shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
                  style={{ backgroundColor: adData.primaryColor }}
                >
                  <span>{adData.callToAction}</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </button>

                <span className="text-[10px] text-slate-400 font-medium">
                  Official Sponsor
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Hover overlay hint */}
        <div className="absolute inset-0 bg-sky-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center justify-center">
          <span className="bg-slate-900/90 text-sky-400 text-xs font-semibold px-3 py-1 rounded-full border border-sky-500/30 shadow-lg flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            Click to Customize Copy
          </span>
        </div>
      </div>
    </div>
  );
};
