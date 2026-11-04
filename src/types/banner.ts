export interface AdFormat {
  id: string;
  name: string;
  category: 'IAB Standard' | 'Social & Video' | 'Mobile' | 'Hero & Masthead';
  width: number;
  height: number;
  aspectRatioLabel: string;
  recommendedRatio: '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '9:16' | '16:9' | '21:9';
  description: string;
  platformBadge: string;
}

export const STANDARD_AD_FORMATS: AdFormat[] = [
  // IAB Display Standards
  {
    id: 'medium-rectangle',
    name: 'Medium Rectangle (MPU)',
    category: 'IAB Standard',
    width: 300,
    height: 250,
    aspectRatioLabel: '6:5 (approx 4:3)',
    recommendedRatio: '4:3',
    description: 'The most popular display ad format in the world; embedded inside article text and sidebars.',
    platformBadge: 'Google Display / IAB',
  },
  {
    id: 'leaderboard',
    name: 'Leaderboard',
    category: 'IAB Standard',
    width: 728,
    height: 90,
    aspectRatioLabel: '8:1',
    recommendedRatio: '21:9',
    description: 'Top-of-page anchor header across websites, news portals, and blogs.',
    platformBadge: 'IAB Header',
  },
  {
    id: 'half-page',
    name: 'Half Page (Large Skyscraper)',
    category: 'IAB Standard',
    width: 300,
    height: 600,
    aspectRatioLabel: '1:2',
    recommendedRatio: '9:16',
    description: 'High-impact premium vertical canvas offering maximum visual engagement.',
    platformBadge: 'IAB High-Impact',
  },
  {
    id: 'wide-skyscraper',
    name: 'Wide Skyscraper',
    category: 'IAB Standard',
    width: 160,
    height: 600,
    aspectRatioLabel: '4:15',
    recommendedRatio: '9:16',
    description: 'Narrow vertical banner placed along webpage sidebars.',
    platformBadge: 'IAB Sidebar',
  },
  {
    id: 'large-rectangle',
    name: 'Large Rectangle',
    category: 'IAB Standard',
    width: 336,
    height: 280,
    aspectRatioLabel: '6:5',
    recommendedRatio: '4:3',
    description: 'Generous content rectangle standard yielding high click-through rates.',
    platformBadge: 'Google Display',
  },
  {
    id: 'billboard',
    name: 'Billboard',
    category: 'Hero & Masthead',
    width: 970,
    height: 250,
    aspectRatioLabel: '3.88:1',
    recommendedRatio: '21:9',
    description: 'Expansive premium masthead banner across major publication headers.',
    platformBadge: 'Masthead',
  },

  // Social & Modern Feed Standards
  {
    id: 'square-social',
    name: 'Square Feed Ad (1:1)',
    category: 'Social & Video',
    width: 1080,
    height: 1080,
    aspectRatioLabel: '1:1',
    recommendedRatio: '1:1',
    description: 'Instagram, Facebook, LinkedIn and X feed sponsored post standard.',
    platformBadge: 'Meta / Instagram',
  },
  {
    id: 'story-reel',
    name: 'Story & Reel (9:16)',
    category: 'Social & Video',
    width: 1080,
    height: 1920,
    aspectRatioLabel: '9:16',
    recommendedRatio: '9:16',
    description: 'Full-screen immersive vertical mobile video and story ads for TikTok & Reels.',
    platformBadge: 'TikTok / Stories',
  },
  {
    id: 'landscape-feed',
    name: 'Landscape Link Ad (1.91:1)',
    category: 'Social & Video',
    width: 1200,
    height: 628,
    aspectRatioLabel: '16:9 / 1.91:1',
    recommendedRatio: '16:9',
    description: 'Standard link preview ad for Meta feeds, LinkedIn sponsor posts, and GDN.',
    platformBadge: 'Meta / GDN',
  },
  {
    id: 'ultra-wide-header',
    name: 'Ultra-Wide Hero (21:9)',
    category: 'Hero & Masthead',
    width: 1920,
    height: 540,
    aspectRatioLabel: '21:9 / 32:9',
    recommendedRatio: '21:9',
    description: 'Cinematic ultra-wide web banner and e-commerce homepage hero showcase.',
    platformBadge: 'Cinematic Web',
  },

  // Mobile Specific Standards
  {
    id: 'mobile-leaderboard',
    name: 'Mobile Leaderboard',
    category: 'Mobile',
    width: 320,
    height: 50,
    aspectRatioLabel: '32:5',
    recommendedRatio: '16:9',
    description: 'Standard sticky bottom or top banner in iOS and Android apps.',
    platformBadge: 'AdMob Standard',
  },
  {
    id: 'large-mobile-banner',
    name: 'Large Mobile Banner',
    category: 'Mobile',
    width: 320,
    height: 100,
    aspectRatioLabel: '16:5',
    recommendedRatio: '16:9',
    description: 'Double-height mobile ad standard delivering increased visibility on smartphones.',
    platformBadge: 'AdMob Large',
  },
];

export type SupportedAspectRatio = '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '9:16' | '16:9' | '21:9';
export type SupportedImageSize = '1K' | '2K' | '4K';
export type SupportedModel = 'gemini-3-pro-image-preview' | 'gemini-nano-banana-2.1';

export type AdLayoutStyle = 'editorial-split' | 'hero-gradient' | 'minimalist-dark' | 'glass-card' | 'bold-retail';

export interface AdVariant {
  id: 'variant-a' | 'variant-b';
  label: string;
  headline: string;
  subheadline: string;
  callToAction: string;
  badge: string;
  primaryColor: string;
  strategyHook: string;
  predictedCtr?: number;
  rationale?: string;
}

export interface BannerAdData {
  brandName: string;
  url: string;
  headline: string;
  subheadline: string;
  callToAction: string;
  badge: string;
  primaryColor: string;
  secondaryColor: string;
  imageUrl: string;
  layoutStyle: AdLayoutStyle;
  activeAspectRatio: SupportedAspectRatio;
  activeImageSize: SupportedImageSize;
  activeModel: SupportedModel;
  imagePrompt: string;
  variantA?: AdVariant;
  variantB?: AdVariant;
  comparisonAdvice?: string;
}

export interface PresetProduct {
  id: string;
  name: string;
  tagline: string;
  url: string;
  description: string;
  primaryColor: string;
  badge: string;
  cta: string;
  sampleImage: string;
  tone: string;
}
