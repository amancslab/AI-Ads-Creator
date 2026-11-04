import { AdFormat, BannerAdData } from '../types/banner';

/**
 * Renders a high-resolution banner ad onto an HTML5 Canvas and triggers download.
 * Multiplies by scaleFactor for ultra-sharp retina rendering.
 */
export async function exportBannerAsImage(
  format: AdFormat,
  adData: BannerAdData,
  scale: number = 2
): Promise<void> {
  const canvas = document.createElement('canvas');
  const targetWidth = format.width * scale;
  const targetHeight = format.height * scale;
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background base
  ctx.fillStyle = '#090D16';
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  // Load image if available
  if (adData.imageUrl) {
    try {
      const img = await loadImage(adData.imageUrl);
      // Draw image covering or filling based on format aspect ratio
      drawImageCover(ctx, img, 0, 0, targetWidth, targetHeight);
    } catch (err) {
      console.warn('Could not load banner image for canvas export:', err);
      // Fallback gradient
      drawFallbackGradient(ctx, targetWidth, targetHeight, adData.primaryColor);
    }
  } else {
    drawFallbackGradient(ctx, targetWidth, targetHeight, adData.primaryColor);
  }

  // Draw overlay styling and text based on format size
  drawBannerOverlay(ctx, format, adData, targetWidth, targetHeight, scale);

  // Trigger download
  const dataUrl = canvas.toDataURL('image/png', 0.95);
  const link = document.createElement('a');
  link.download = `${adData.brandName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${format.id}-${format.width}x${format.height}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

function drawFallbackGradient(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  primaryColor: string
) {
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#0F172A');
  grad.addColorStop(0.5, '#1E293B');
  grad.addColorStop(1, primaryColor);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const imgRatio = img.width / img.height;
  const targetRatio = w / h;
  let sWidth = img.width;
  let sHeight = img.height;
  let sx = 0;
  let sy = 0;

  if (imgRatio > targetRatio) {
    sWidth = img.height * targetRatio;
    sx = (img.width - sWidth) / 2;
  } else {
    sHeight = img.width / targetRatio;
    sy = (img.height - sHeight) / 2;
  }

  ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h);
}

function drawBannerOverlay(
  ctx: CanvasRenderingContext2D,
  format: AdFormat,
  adData: BannerAdData,
  w: number,
  h: number,
  scale: number
) {
  // Semi-transparent scrim to ensure text legibility
  const scrim = ctx.createLinearGradient(0, 0, 0, h);
  scrim.addColorStop(0, 'rgba(10, 15, 29, 0.45)');
  scrim.addColorStop(0.5, 'rgba(10, 15, 29, 0.7)');
  scrim.addColorStop(1, 'rgba(10, 15, 29, 0.92)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, 0, w, h);

  // Border glow
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 2 * scale;
  ctx.strokeRect(1 * scale, 1 * scale, w - 2 * scale, h - 2 * scale);

  ctx.fillStyle = '#FFFFFF';
  ctx.textBaseline = 'top';

  const isWide = format.width >= 700 && format.height <= 120; // e.g. Leaderboard 728x90
  const isNarrowVertical = format.width <= 180; // e.g. Wide Skyscraper 160x600
  const isCompactMobile = format.height <= 60; // e.g. Mobile Leaderboard 320x50

  if (isCompactMobile) {
    // 320x50 layout
    const pad = 8 * scale;
    // Brand
    ctx.font = `bold ${10 * scale}px system-ui, sans-serif`;
    ctx.fillStyle = adData.primaryColor;
    ctx.fillText(adData.brandName.toUpperCase(), pad, pad);

    // Headline
    ctx.font = `600 ${11 * scale}px system-ui, sans-serif`;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(truncateText(ctx, adData.headline, w - 110 * scale), pad, pad + 15 * scale);

    // CTA Button on right
    drawButton(
      ctx,
      w - 90 * scale,
      pad,
      82 * scale,
      h - 2 * pad,
      adData.callToAction,
      adData.primaryColor,
      9 * scale
    );
  } else if (isWide) {
    // 728x90 Leaderboard layout
    const pad = 16 * scale;

    // Brand tag
    ctx.font = `bold ${11 * scale}px system-ui, sans-serif`;
    ctx.fillStyle = adData.primaryColor;
    ctx.fillText(adData.brandName.toUpperCase(), pad, pad);

    // Badge
    ctx.font = `600 ${10 * scale}px system-ui, sans-serif`;
    ctx.fillStyle = '#94A3B8';
    ctx.fillText(adData.badge, pad, pad + 16 * scale);

    // Main headline centered / mid
    ctx.font = `bold ${17 * scale}px system-ui, sans-serif`;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(truncateText(ctx, adData.headline, w - 340 * scale), 160 * scale, pad);

    // Subheadline
    ctx.font = `400 ${12 * scale}px system-ui, sans-serif`;
    ctx.fillStyle = '#CBD5E1';
    ctx.fillText(truncateText(ctx, adData.subheadline, w - 340 * scale), 160 * scale, pad + 24 * scale);

    // CTA button on right
    drawButton(
      ctx,
      w - 150 * scale,
      h / 2 - 18 * scale,
      134 * scale,
      36 * scale,
      adData.callToAction,
      adData.primaryColor,
      12 * scale
    );
  } else if (isNarrowVertical) {
    // 160x600 Wide Skyscraper layout
    const pad = 12 * scale;
    let currY = pad;

    // Brand
    ctx.font = `bold ${11 * scale}px system-ui, sans-serif`;
    ctx.fillStyle = adData.primaryColor;
    ctx.fillText(adData.brandName.toUpperCase(), pad, currY);
    currY += 18 * scale;

    // Badge
    drawPillBadge(ctx, pad, currY, adData.badge, scale);
    currY += 28 * scale;

    // Headline
    ctx.font = `bold ${15 * scale}px system-ui, sans-serif`;
    ctx.fillStyle = '#FFFFFF';
    currY = wrapText(ctx, adData.headline, pad, currY, w - 2 * pad, 20 * scale);
    currY += 12 * scale;

    // Subhead
    ctx.font = `400 ${11 * scale}px system-ui, sans-serif`;
    ctx.fillStyle = '#94A3B8';
    wrapText(ctx, adData.subheadline, pad, currY, w - 2 * pad, 15 * scale);

    // Button fixed near bottom
    drawButton(
      ctx,
      pad,
      h - 52 * scale,
      w - 2 * pad,
      38 * scale,
      adData.callToAction,
      adData.primaryColor,
      12 * scale
    );
  } else {
    // Standard rectangles, squares, half page, billboards, stories
    const pad = Math.max(16 * scale, Math.min(w, h) * 0.06);
    let currY = pad;

    // Brand & Badge
    ctx.font = `bold ${Math.max(12 * scale, Math.min(22 * scale, w * 0.035))}px system-ui, sans-serif`;
    ctx.fillStyle = adData.primaryColor;
    ctx.fillText(adData.brandName.toUpperCase(), pad, currY);
    currY += Math.max(18 * scale, w * 0.045);

    if (adData.badge && h > 200) {
      drawPillBadge(ctx, pad, currY, adData.badge, scale);
      currY += 26 * scale;
    }

    // Headline
    const headlineSize = Math.max(16 * scale, Math.min(38 * scale, w * 0.055));
    ctx.font = `800 ${headlineSize}px system-ui, sans-serif`;
    ctx.fillStyle = '#FFFFFF';
    currY = wrapText(ctx, adData.headline, pad, currY, w - 2 * pad, headlineSize * 1.25);
    currY += 8 * scale;

    // Subhead
    if (h >= 240) {
      const subheadSize = Math.max(11 * scale, Math.min(18 * scale, w * 0.03));
      ctx.font = `400 ${subheadSize}px system-ui, sans-serif`;
      ctx.fillStyle = '#E2E8F0';
      wrapText(ctx, adData.subheadline, pad, currY, w - 2 * pad, subheadSize * 1.35);
    }

    // CTA Button
    const btnW = Math.min(w - 2 * pad, Math.max(130 * scale, w * 0.45));
    const btnH = Math.max(34 * scale, Math.min(52 * scale, h * 0.1));
    const btnY = h - pad - btnH;
    drawButton(
      ctx,
      pad,
      btnY,
      btnW,
      btnH,
      adData.callToAction,
      adData.primaryColor,
      Math.max(11 * scale, btnH * 0.35)
    );

    // URL tag
    if (w >= 300 && h >= 250) {
      const domain = adData.url.replace(/^https?:\/\//, '').split('/')[0];
      ctx.font = `500 ${10 * scale}px system-ui, sans-serif`;
      ctx.fillStyle = '#94A3B8';
      ctx.textAlign = 'right';
      ctx.fillText(domain, w - pad, h - pad - 12 * scale);
      ctx.textAlign = 'left';
    }
  }
}

function drawButton(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  text: string,
  bgColor: string,
  fontSize: number
) {
  // Rounded rect
  const r = Math.min(8, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();

  ctx.fillStyle = bgColor;
  ctx.fill();

  // Button text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(truncateText(ctx, text, w - 16), x + w / 2, y + h / 2);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
}

function drawPillBadge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  badgeText: string,
  scale: number
) {
  const padX = 8 * scale;
  const padY = 3 * scale;
  const fontSize = 9 * scale;
  ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
  const metrics = ctx.measureText(badgeText);
  const pillW = metrics.width + padX * 2;
  const pillH = fontSize + padY * 2;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.fillRect(x, y, pillW, pillH);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 1 * scale;
  ctx.strokeRect(x, y, pillW, pillH);

  ctx.fillStyle = '#F8FAFC';
  ctx.textBaseline = 'middle';
  ctx.fillText(badgeText, x + padX, y + pillH / 2);
  ctx.textBaseline = 'top';
}

function truncateText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let truncated = text;
  while (truncated.length > 3 && ctx.measureText(truncated + '…').width > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return truncated + '…';
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(' ');
  let line = '';
  let currY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, currY);
      line = words[n] + ' ';
      currY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, currY);
  return currY + lineHeight;
}
