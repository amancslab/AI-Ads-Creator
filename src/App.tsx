import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Wand2,
  Sparkles,
  Download,
  Eye,
  Sliders,
  Layers,
  Globe,
  Palette,
  ExternalLink,
  RefreshCw,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Monitor,
  Smartphone,
  ChevronRight,
  Maximize2,
  ArrowRightLeft,
  MapPin,
  FolderOpen,
  Cloud,
  User as UserIcon,
  LogIn,
} from 'lucide-react';
import {
  AdFormat,
  BannerAdData,
  STANDARD_AD_FORMATS,
  SupportedAspectRatio,
  SupportedImageSize,
  SupportedModel,
  AdVariant,
} from './types/banner';
import { PRESET_PRODUCTS } from './data/presets';
import { BannerDisplay } from './components/BannerDisplay';
import { BannerEditorModal } from './components/BannerEditorModal';
import { SimulatedPreviewModal } from './components/SimulatedPreviewModal';
import { ABComparisonView } from './components/ABComparisonView';
import { LocalAdTargetingMap } from './components/LocalAdTargetingMap.tsx';
import { WorkspaceHubModal } from './components/WorkspaceHubModal.tsx';
import { exportBannerAsImage } from './utils/exportBanner';
import { auth, db, signInWithGoogle, logOut } from './lib/firebase.ts';
import { collection, addDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';

export default function App() {
  // Main Ad Data state
  const [adData, setAdData] = useState<BannerAdData>({
    brandName: 'Aether Pods Pro',
    url: 'https://aetheraudio.io/pods-pro',
    headline: 'Silence The World. Hear Pure Euphoria.',
    subheadline: 'Engineered with aerospace-grade acoustic drivers and 48-hour continuous battery life.',
    callToAction: 'Shop Now • 25% Off',
    badge: '★ 4.9 RATED • NEW RELEASE',
    primaryColor: '#0EA5E9',
    secondaryColor: '#38BDF8',
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1600&q=80',
    layoutStyle: 'hero-gradient',
    activeAspectRatio: '1:1',
    activeImageSize: '2K',
    activeModel: 'gemini-3-pro-image-preview',
    imagePrompt: 'Minimalist sleek wireless matte-black earbuds floating in studio lighting with soft cyan rim light, luxury product photography, dramatic clean dark background, 8k resolution, commercial advertising shot',
  });

  // UI state
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'all-sizes' | 'ab-compare' | 'geo-maps'>('all-sizes');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [previewScale, setPreviewScale] = useState<number>(0.75);
  const [analyzingProduct, setAnalyzingProduct] = useState<boolean>(false);
  const [generatingImage, setGeneratingImage] = useState<boolean>(false);
  const [generatingVariations, setGeneratingVariations] = useState<boolean>(false);
  const [batchDownloading, setBatchDownloading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Google Maps Quota state (Section 8 Case A)
  const [mapsQuotaExceeded, setMapsQuotaExceeded] = useState<boolean>(false);

  // Firebase Auth & Cloud state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [savingToCloud, setSavingToCloud] = useState<boolean>(false);

  // Modals state
  const [editingFormat, setEditingFormat] = useState<AdFormat | null>(null);
  const [showSimulator, setShowSimulator] = useState<boolean>(false);
  const [showWorkspaceHub, setShowWorkspaceHub] = useState<boolean>(false);

  // Listen to Google Maps quota exceeded event & Firebase Auth changes
  React.useEffect(() => {
    const onQuotaExceeded = () => setMapsQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', onQuotaExceeded);

    const unsub = auth.onAuthStateChanged((u) => {
      setCurrentUser(u);
    });

    return () => {
      window.removeEventListener('gmp-quota-exceeded', onQuotaExceeded);
      unsub();
    };
  }, []);

  // Save campaign to Firestore
  const handleSaveToFirestore = async () => {
    if (!currentUser) {
      try {
        const res = await signInWithGoogle();
        setCurrentUser(res.user);
      } catch (err: any) {
        setStatusMessage({ type: 'error', text: 'Sign in to save campaigns to Firebase Firestore.' });
        return;
      }
    }

    setSavingToCloud(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');
      await addDoc(collection(db, 'campaigns'), {
        userId: user.uid,
        brandName: adData.brandName,
        url: adData.url,
        headline: adData.headline,
        subheadline: adData.subheadline,
        callToAction: adData.callToAction,
        badge: adData.badge,
        primaryColor: adData.primaryColor,
        imageUrl: adData.imageUrl,
        createdAt: new Date().toISOString(),
      });
      setStatusMessage({ type: 'success', text: `Saved campaign "${adData.brandName}" to Firebase Firestore!` });
      confetti({ particleCount: 30, spread: 50 });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Failed saving to Firestore: ${err.message}` });
    } finally {
      setSavingToCloud(false);
    }
  };

  // Generate A/B Variations handler
  const handleGenerateVariations = async () => {
    setGeneratingVariations(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/generate-variations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: adData.brandName,
          url: adData.url,
          description: adData.subheadline,
          primaryColor: adData.primaryColor,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to generate A/B variations');
      }

      const data = await res.json();
      setAdData((prev) => ({
        ...prev,
        variantA: data.variantA,
        variantB: data.variantB,
        comparisonAdvice: data.comparisonAdvice,
      }));

      setActiveWorkspaceTab('ab-compare');

      setStatusMessage({
        type: 'success',
        text: 'Generated two contrasting high-performance variations (Variant A vs Variant B)!',
      });
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      console.error('Failed to generate variations:', err);
      // Fallback local variation generation if network/API limits occur
      const fallbackA: AdVariant = {
        id: 'variant-a',
        label: 'Variant A (Feature & Spec Clarity)',
        headline: adData.headline || 'Silence The World. Hear Pure Euphoria.',
        subheadline: adData.subheadline || 'Acoustic drivers with 48h battery. Certified high-fidelity sound.',
        callToAction: 'Shop Now • 25% Off',
        badge: '★ 4.9 RATED • NEW RELEASE',
        primaryColor: adData.primaryColor || '#0EA5E9',
        strategyHook: 'Direct Value & Product Trust',
        predictedCtr: 3.4,
        rationale: 'Builds purchase intent through verified specs and transparent pricing cues.',
      };
      const fallbackB: AdVariant = {
        id: 'variant-b',
        label: 'Variant B (Urgency & Warm Action Contrast)',
        headline: 'Only 150 Left In Stock. Claim 30% Off Today.',
        subheadline: 'Studio-grade spatial drivers with 48h battery. Free express delivery ends midnight.',
        callToAction: 'Claim Discount Now',
        badge: 'FLASH SALE • LIMITED QUANTITY',
        primaryColor: '#F59E0B',
        strategyHook: 'Urgency, Scarcity & High-Contrast CTA',
        predictedCtr: 4.2,
        rationale: 'Combines loss aversion with a high-contrast amber CTA button for maximum visual pop.',
      };
      setAdData((prev) => ({
        ...prev,
        variantA: fallbackA,
        variantB: fallbackB,
        comparisonAdvice: 'Run a 50/50 programmatic split test for 72 hours to measure CTR and conversion rate.',
      }));
      setActiveWorkspaceTab('ab-compare');
      setStatusMessage({
        type: 'info',
        text: 'A/B variations loaded in side-by-side comparison mode!',
      });
    } finally {
      setGeneratingVariations(false);
    }
  };

  // Quick preset loader
  const handleLoadPreset = (presetId: string) => {
    const preset = PRESET_PRODUCTS.find((p) => p.id === presetId);
    if (!preset) return;

    setAdData((prev) => ({
      ...prev,
      brandName: preset.name,
      url: preset.url,
      headline: preset.tagline,
      subheadline: preset.description,
      callToAction: preset.cta,
      badge: preset.badge,
      primaryColor: preset.primaryColor,
      imageUrl: preset.sampleImage,
      imagePrompt: `Commercial studio photograph of ${preset.name}, ${preset.description}. Premium advertising lighting, sharp focal depth, sleek dark background with subtle rim lighting.`,
    }));

    setStatusMessage({
      type: 'info',
      text: `Loaded preset: "${preset.name}". Click "Analyze & Enrich with AI" or "Generate Image" to customize!`,
    });
  };

  // Step 1: AI Marketing Intelligence Analysis using Gemini 3.8 Flash
  const handleAnalyzeProduct = async () => {
    setAnalyzingProduct(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/analyze-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: adData.brandName,
          url: adData.url,
          description: adData.subheadline,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with ${res.status}`);
      }

      const intelligence = await res.json();

      setAdData((prev) => ({
        ...prev,
        brandName: intelligence.brandName || prev.brandName,
        headline: intelligence.headlines?.[0] || prev.headline,
        subheadline: intelligence.subheadlines?.[0] || intelligence.coreBenefit || prev.subheadline,
        callToAction: intelligence.callToActions?.[0] || prev.callToAction,
        badge: intelligence.badges?.[0] || prev.badge,
        primaryColor: intelligence.colorPalette?.primary || prev.primaryColor,
        secondaryColor: intelligence.colorPalette?.secondary || prev.secondaryColor,
        imagePrompt: intelligence.imagePrompt || prev.imagePrompt,
      }));

      setStatusMessage({
        type: 'success',
        text: 'AI successfully analyzed product and optimized headlines, badges, and studio prompt!',
      });
    } catch (err: any) {
      console.error('Failed to analyze product:', err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to analyze product. You can customize the fields manually below.',
      });
    } finally {
      setAnalyzingProduct(false);
    }
  };

  // Step 2: High-Quality Image Generation with gemini-3-pro-image-preview or gemini-nano-banana-2.1
  const handleGenerateImage = async (overrideRatio?: SupportedAspectRatio) => {
    setGeneratingImage(true);
    setStatusMessage(null);
    const targetRatio = overrideRatio || adData.activeAspectRatio;

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: adData.imagePrompt,
          model: adData.activeModel,
          aspectRatio: targetRatio,
          imageSize: adData.activeImageSize,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.details || `Image generation failed with HTTP ${res.status}`);
      }

      const data = await res.json();
      if (!data.imageUrl) {
        throw new Error('No image URL was returned.');
      }

      setAdData((prev) => ({
        ...prev,
        imageUrl: data.imageUrl,
        activeAspectRatio: targetRatio,
      }));

      setStatusMessage({
        type: 'success',
        text: `High-quality ${data.imageSize} image generated with ${data.model} (${data.aspectRatio})!`,
      });

      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      console.error('Image generation error:', err);
      setStatusMessage({
        type: 'error',
        text: `Image generation notice: ${err.message}. (Check Settings > Secrets if API key quota is needed)`,
      });
    } finally {
      setGeneratingImage(false);
    }
  };

  // Batch download all banners
  const handleDownloadAll = async () => {
    setBatchDownloading(true);
    try {
      const filtered = getFilteredFormats();
      for (let i = 0; i < filtered.length; i++) {
        await exportBannerAsImage(filtered[i], adData, 2);
        // Small interval between downloads to prevent browser throttling
        await new Promise((r) => setTimeout(r, 250));
      }
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.5 },
      });
      setStatusMessage({
        type: 'success',
        text: `Exported ${filtered.length} banners in high-resolution retina PNG!`,
      });
    } catch (err: any) {
      console.error('Batch export failed:', err);
    } finally {
      setBatchDownloading(false);
    }
  };

  const getFilteredFormats = () => {
    if (selectedCategory === 'All') return STANDARD_AD_FORMATS;
    return STANDARD_AD_FORMATS.filter((f) => f.category === selectedCategory);
  };

  const filteredFormats = getFilteredFormats();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Google Maps Platform Quota Notice (Section 8 Case A) */}
      {mapsQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-amber-400 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">AdCraft Studio</h1>
              <span className="bg-sky-500/10 text-sky-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-sky-500/20 uppercase tracking-wider">
                Gemini 3 Pro Image
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Generate High-Converting Banner Ads in All Standard IAB & Social Sizes
            </p>
          </div>
        </div>

        {/* Global Action Affordances */}
        <div className="flex items-center gap-2.5">
          {/* View Mode Toggle: All Sizes vs A/B Comparison vs Geo-Targeting Map */}
          <div className="hidden md:flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveWorkspaceTab('all-sizes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeWorkspaceTab === 'all-sizes'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All 12 Sizes</span>
            </button>
            <button
              onClick={() => setActiveWorkspaceTab('ab-compare')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeWorkspaceTab === 'ab-compare'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-amber-300" />
              <span>A/B Variations</span>
            </button>
            <button
              onClick={() => setActiveWorkspaceTab('geo-maps')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeWorkspaceTab === 'geo-maps'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-300" />
              <span>Geo-Targeting Map</span>
            </button>
          </div>

          {/* Google Workspace Hub Button */}
          <button
            onClick={() => setShowWorkspaceHub(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-semibold rounded-lg border border-indigo-500/30 transition-colors shadow-sm"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Workspace Hub</span>
          </button>

          {/* Save to Firestore Cloud */}
          <button
            onClick={handleSaveToFirestore}
            disabled={savingToCloud}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors shadow-sm"
          >
            <Cloud className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">{savingToCloud ? 'Saving...' : 'Save to Cloud'}</span>
          </button>

          {/* In-Market Simulator */}
          <button
            onClick={() => setShowSimulator(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors shadow-sm"
          >
            <Eye className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Simulator</span>
          </button>

          {/* User Sign In / Profile */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-xl">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || ''}
                  className="w-5 h-5 rounded-full"
                />
              ) : (
                <UserIcon className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span className="text-[11px] font-semibold text-slate-300 hidden md:inline max-w-[90px] truncate">
                {currentUser.displayName || currentUser.email}
              </span>
            </div>
          ) : (
            <button
              onClick={() => signInWithGoogle().then((r) => setCurrentUser(r.user)).catch(() => {})}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white text-slate-900 font-bold text-xs rounded-lg hover:bg-slate-100 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}

          {/* Export All PNGs */}
          <button
            onClick={handleDownloadAll}
            disabled={batchDownloading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-md shadow-sky-500/25 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{batchDownloading ? 'Exporting...' : 'Export (PNG)'}</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="flex-1 flex flex-col lg:flex-row">
        {/* Left Side: Creative Director & AI Controls (Sticky on Desktop) */}
        <aside className="w-full lg:w-[460px] xl:w-[500px] border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-900/40 p-4 lg:p-6 space-y-6 overflow-y-auto lg:max-h-[calc(100vh-61px)]">
          {/* Quick Presets Carousel */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Quick Test Samples
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_PRODUCTS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleLoadPreset(preset.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    adData.brandName === preset.name
                      ? 'bg-sky-500/10 border-sky-500/50 text-white'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-xs font-bold truncate">{preset.name}</span>
                  <span className="text-[10px] text-slate-400 truncate mt-0.5">{preset.tone}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 1: Product Context & URL Input */}
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-sky-400" />
                1. Product & Campaign Brief
              </h2>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Product / Brand Name
              </label>
              <input
                type="text"
                value={adData.brandName}
                onChange={(e) => setAdData((prev) => ({ ...prev, brandName: e.target.value }))}
                placeholder="e.g. Lumina Smart Lumbar Chair"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Target Product Landing Page URL
              </label>
              <input
                type="url"
                value={adData.url}
                onChange={(e) => setAdData((prev) => ({ ...prev, url: e.target.value }))}
                placeholder="https://yourstore.com/product"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-sky-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Product Description & Value Proposition
              </label>
              <textarea
                rows={3}
                value={adData.subheadline}
                onChange={(e) => setAdData((prev) => ({ ...prev, subheadline: e.target.value }))}
                placeholder="Describe key benefits, materials, discount offers, or unique features..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-sky-500"
              />
            </div>

            <button
              onClick={handleAnalyzeProduct}
              disabled={analyzingProduct}
              className="w-full py-2 px-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Wand2 className={`w-3.5 h-3.5 ${analyzingProduct ? 'animate-spin' : ''}`} />
              <span>{analyzingProduct ? 'Analyzing Product Context...' : 'Analyze & Enrich Ad Copy'}</span>
            </button>
          </div>

          {/* Section 2: AI Image Studio Controls */}
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                2. AI Image Generation Studio
              </h2>
            </div>

            {/* Model Selector Affordance */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-semibold text-slate-300">Image Generation Model</label>
                <span className="text-[10px] text-sky-400 font-medium">Studio-Grade</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdData((prev) => ({ ...prev, activeModel: 'gemini-3-pro-image-preview' }))}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    adData.activeModel === 'gemini-3-pro-image-preview'
                      ? 'bg-sky-500/15 border-sky-500 text-white shadow-xs'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">Gemini 3 Pro</span>
                    {adData.activeModel === 'gemini-3-pro-image-preview' && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Studio Quality Preview
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdData((prev) => ({ ...prev, activeModel: 'gemini-nano-banana-2.1' }))}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    adData.activeModel === 'gemini-nano-banana-2.1'
                      ? 'bg-sky-500/15 border-sky-500 text-white shadow-xs'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">Nano Banana 2.1</span>
                    {adData.activeModel === 'gemini-nano-banana-2.1' && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">High Definition</span>
                </button>
              </div>
            </div>

            {/* Image Size Affordance (1K, 2K, 4K) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-semibold text-slate-300">
                  Image Resolution Affordance
                </label>
                <span className="text-[10px] text-slate-400">
                  {adData.activeImageSize === '1K'
                    ? '1024px Standard'
                    : adData.activeImageSize === '2K'
                    ? '2048px Retina HD'
                    : '4096px Ultra Studio 4K'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['1K', '2K', '4K'] as SupportedImageSize[]).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setAdData((prev) => ({ ...prev, activeImageSize: size }))}
                    className={`py-1.5 px-3 rounded-lg border text-xs font-bold transition-all text-center ${
                      adData.activeImageSize === size
                        ? 'bg-sky-500 text-white border-sky-400 shadow-md shadow-sky-500/20'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio Affordance (1:1, 2:3, 3:2, 3:4, 4:3, 9:16, 16:9, and 21:9) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-semibold text-slate-300">
                  Aspect Ratio Affordance
                </label>
                <span className="text-[10px] font-mono text-sky-400">
                  Active: {adData.activeAspectRatio}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {(
                  [
                    '1:1',
                    '2:3',
                    '3:2',
                    '3:4',
                    '4:3',
                    '9:16',
                    '16:9',
                    '21:9',
                  ] as SupportedAspectRatio[]
                ).map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setAdData((prev) => ({ ...prev, activeAspectRatio: ratio }))}
                    className={`py-1.5 px-1.5 rounded-lg border text-[11px] font-mono font-bold transition-all text-center ${
                      adData.activeAspectRatio === ratio
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500 shadow-xs'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5">
                Choose an aspect ratio matching your primary banner format (e.g. 1:1 for social feeds, 16:9 for landscape, 9:16 for stories, 21:9 for leaderboards).
              </p>
            </div>

            {/* Visual Prompt Input */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Visual Studio Prompt
              </label>
              <textarea
                rows={3}
                value={adData.imagePrompt}
                onChange={(e) => setAdData((prev) => ({ ...prev, imagePrompt: e.target.value }))}
                placeholder="Describe lighting, product staging, background, studio backdrop..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-sky-500"
              />
            </div>

            {/* Generate Image Button */}
            <button
              onClick={() => handleGenerateImage()}
              disabled={generatingImage}
              className="w-full py-2.5 px-4 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${generatingImage ? 'animate-spin' : ''}`} />
              <span>
                {generatingImage
                  ? `Rendering in ${adData.activeImageSize}...`
                  : `Generate ${adData.activeImageSize} Image (${adData.activeAspectRatio})`}
              </span>
            </button>
          </div>

          {/* Section 3: Headline & Copy Overrides */}
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3 shadow-sm">
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-sky-400" />
              3. Headline & CTA Controls
            </h2>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Ad Headline
              </label>
              <input
                type="text"
                value={adData.headline}
                onChange={(e) => setAdData((prev) => ({ ...prev, headline: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-hidden focus:border-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  CTA Button Text
                </label>
                <input
                  type="text"
                  value={adData.callToAction}
                  onChange={(e) => setAdData((prev) => ({ ...prev, callToAction: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Promo Badge
                </label>
                <input
                  type="text"
                  value={adData.badge}
                  onChange={(e) => setAdData((prev) => ({ ...prev, badge: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-hidden focus:border-sky-500"
                />
              </div>
            </div>

            {/* Accent Color Affordance */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                <Palette className="w-3 h-3 text-sky-400" />
                Theme Accent Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={adData.primaryColor}
                  onChange={(e) => setAdData((prev) => ({ ...prev, primaryColor: e.target.value }))}
                  className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={adData.primaryColor}
                  onChange={(e) => setAdData((prev) => ({ ...prev, primaryColor: e.target.value }))}
                  className="w-24 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono focus:outline-hidden focus:border-sky-500"
                />
              </div>
            </div>

            {/* A/B Split-Testing Creative Lab Generator */}
            <div className="pt-2 border-t border-slate-800">
              <div className="p-3 bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/30 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    A/B Split-Test Variations
                  </span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.5 rounded">
                    Side-by-Side
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Generate 2 variations with contrasting headlines and CTA button colors to compare performance side-by-side.
                </p>
                <button
                  type="button"
                  onClick={handleGenerateVariations}
                  disabled={generatingVariations}
                  className="w-full py-2 px-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${generatingVariations ? 'animate-spin' : ''}`} />
                  <span>
                    {generatingVariations ? 'Generating Variations...' : 'Generate 2 Variations (Side-by-Side)'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Side: Standard Banner Grid & Real-Time Canvas Suite */}
        <section className="flex-1 p-4 lg:p-8 space-y-6 overflow-y-auto">
          {/* Status Message Notice */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs animate-in fade-in duration-200 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  : 'bg-sky-500/10 border-sky-500/30 text-sky-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : statusMessage.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                ) : (
                  <Sparkles className="w-4 h-4 shrink-0 text-sky-400" />
                )}
                <span>{statusMessage.text}</span>
              </div>
              <button
                onClick={() => setStatusMessage(null)}
                className="text-xs opacity-70 hover:opacity-100"
              >
                ✕
              </button>
            </div>
          )}

          {/* Conditional Workspace Rendering: Side-by-Side A/B Testing vs 12 Standard Sizes vs Geo-Targeting Map */}
          {activeWorkspaceTab === 'geo-maps' ? (
            <LocalAdTargetingMap
              onApplyLocationBadge={(badge) => {
                setAdData((prev) => ({ ...prev, badge }));
                setStatusMessage({
                  type: 'success',
                  text: `Applied geo-location badge "${badge}" across all banner formats!`,
                });
                confetti({ particleCount: 30, spread: 50 });
              }}
              activeBadge={adData.badge}
            />
          ) : activeWorkspaceTab === 'ab-compare' ? (
            <ABComparisonView
              adData={adData}
              onUpdateAdData={(upd) => setAdData((prev) => ({ ...prev, ...upd }))}
              onGenerateVariations={handleGenerateVariations}
              generatingVariations={generatingVariations}
              scale={previewScale}
            />
          ) : (
            <>
              {/* Banner Suite Controls Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-2xl shadow-sm">
                {/* Category Tabs */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {['All', 'IAB Standard', 'Social & Video', 'Hero & Masthead', 'Mobile'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        selectedCategory === cat
                          ? 'bg-sky-500 text-white shadow-sm'
                          : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Display Zoom / Scale Affordance */}
                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                    <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
                    Scale: {Math.round(previewScale * 100)}%
                  </span>
                  <input
                    type="range"
                    min="0.35"
                    max="1"
                    step="0.05"
                    value={previewScale}
                    onChange={(e) => setPreviewScale(parseFloat(e.target.value))}
                    className="w-24 sm:w-32 accent-sky-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Active Product & Image Details Info Banner */}
              <div className="px-5 py-3 bg-slate-900/40 border border-slate-800/80 rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-semibold text-slate-300">Live Creative Suite:</span>
                    <span className="text-white font-bold">{adData.brandName}</span>
                  </div>
                  <span className="text-slate-600 hidden md:inline">•</span>
                  <span className="text-slate-400 hidden md:inline">
                    Model:{' '}
                    <strong className="text-sky-400">{adData.activeModel}</strong>
                  </span>
                  <span className="text-slate-600 hidden md:inline">•</span>
                  <span className="text-slate-400 hidden md:inline">
                    Size: <strong className="text-amber-400">{adData.activeImageSize}</strong>
                  </span>
                </div>
                <div className="text-slate-400 text-[11px]">
                  Showing <strong className="text-white">{filteredFormats.length}</strong> standard formats • Click any ad to edit copy
                </div>
              </div>

              {/* Banners Grid / Showcase */}
              <div className="space-y-6">
                {filteredFormats.map((format) => (
                  <div key={format.id} className="w-full flex justify-center">
                    <BannerDisplay
                      format={format}
                      adData={adData}
                      scale={previewScale}
                      onEdit={(fmt) => setEditingFormat(fmt)}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </main>

      {/* Editor Modal for Individual Banners */}
      {editingFormat && (
        <BannerEditorModal
          format={editingFormat}
          adData={adData}
          onUpdate={(updated) => setAdData((prev) => ({ ...prev, ...updated }))}
          onClose={() => setEditingFormat(null)}
          onRegenerateImage={(ratio) => handleGenerateImage(ratio)}
          generatingImage={generatingImage}
        />
      )}

      {/* Real-Market Simulator Modal */}
      {showSimulator && (
        <SimulatedPreviewModal
          adData={adData}
          onClose={() => setShowSimulator(false)}
        />
      )}

      {/* Google Workspace Integration Hub Modal */}
      {showWorkspaceHub && (
        <WorkspaceHubModal
          adData={adData}
          onClose={() => setShowWorkspaceHub(false)}
          onApplyDriveImage={(imageUrl) => {
            setAdData((prev) => ({ ...prev, imageUrl }));
            setStatusMessage({ type: 'success', text: 'Imported product image from Google Drive!' });
          }}
        />
      )}
    </div>
  );
}
