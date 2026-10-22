'use client';

import React, { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/lib/store/useStore';
import { EventTheme, EventFontFamily } from '@/lib/types';
import { extractPaletteFromImage, THEME_PRESETS } from '@/lib/theme/colorExtractor';
import { ThemedContainer } from '@/components/theme/ThemedContainer';
import {
  Palette,
  Sparkles,
  ArrowLeft,
  Check,
  Eye,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  Award,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react';

export default function ThemeStudioPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  const { events, updateEventTheme, currentUser, collegeName } = useStore();

  const event = events.find((e) => e.id === eventId || e.slug === eventId);

  const [themeName, setThemeName] = useState(event?.theme.themeName || 'Custom Theme');
  const [bannerUrl, setBannerUrl] = useState(event?.theme.bannerUrl || '/images/theme-harry-potter.jpg');
  const [primaryColor, setPrimaryColor] = useState(event?.theme.primaryColor || '#D4AF37');
  const [secondaryColor, setSecondaryColor] = useState(event?.theme.secondaryColor || '#8A2BE2');
  const [backgroundColor, setBackgroundColor] = useState(event?.theme.backgroundColor || '#0A0D17');
  const [surfaceColor, setSurfaceColor] = useState(event?.theme.surfaceColor || '#13182C');
  const [textColor, setTextColor] = useState(event?.theme.textColor || '#F8FAFC');
  const [accentColor, setAccentColor] = useState(event?.theme.accentColor || '#F59E0B');
  const [fontFamily, setFontFamily] = useState<EventFontFamily>(event?.theme.fontFamily || 'serif');
  const [isExtracting, setIsExtracting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageError, setImageError] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Preview tab
  const [previewMode, setPreviewMode] = useState<'landing' | 'register' | 'certificate'>('landing');

  if (!event) {
    return (
      <div className="p-8 text-center text-stone-500">
        <p>Event not found.</p>
        <Link href="/organizer/events" className="text-emerald-600 font-bold mt-2 inline-block">
          Back to Events
        </Link>
      </div>
    );
  }

  // Enforce branch organizer purview isolation
  const isAuthorized =
    currentUser.role === 'admin' ||
    event.organizerId === currentUser.id ||
    (currentUser.branchId && event.branchId === currentUser.branchId);

  if (!isAuthorized) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center space-y-4 max-w-lg mx-auto my-12">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-stone-900">Branch Access Restricted</h2>
        <p className="text-xs text-stone-600">
          This event belongs to another branch ({event.branchId.replace('branch-', '').toUpperCase()}). You are only authorized to manage themes for your branch.
        </p>
        <Link
          href="/organizer/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold"
        >
          Return to My Dashboard
        </Link>
      </div>
    );
  }

  // Handle Palette Extraction from current photo
  const handleExtractColors = async (imageUrlToExtract?: string) => {
    setIsExtracting(true);
    try {
      const targetUrl = imageUrlToExtract || bannerUrl;
      const palette = await extractPaletteFromImage(targetUrl);
      setPrimaryColor(palette.primaryColor);
      setSecondaryColor(palette.secondaryColor);
      setBackgroundColor(palette.backgroundColor);
      setSurfaceColor(palette.surfaceColor);
      setTextColor(palette.textColor);
      setAccentColor(palette.accentColor);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExtracting(false);
    }
  };

  // Handle Local File Upload from Computer
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (.jpg, .png, .webp, .svg)');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      if (dataUrl) {
        setBannerUrl(dataUrl);
        setImageError(false);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 4000);
        handleExtractColors(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  // Apply a Preset (e.g. Pushpa, Harry Potter, Subway, Tech)
  const applyPreset = (key: string) => {
    setImageError(false);
    const p = THEME_PRESETS[key];
    if (!p) return;

    if (key === 'harry_potter') {
      setBannerUrl('/images/theme-harry-potter.jpg');
      setThemeName('Harry Potter');
    } else if (key === 'subway') {
      setBannerUrl('/images/theme-subway.jpg');
      setThemeName('Subway Suppers');
    } else if (key === 'tech_innovation') {
      setBannerUrl('/images/theme-tech.jpg');
      setThemeName('Tech Innovation');
    } else if (key === 'pushpa_wildfire') {
      setBannerUrl('/images/theme-pushpa.jpg');
      setThemeName('Pushpa Wildfire');
    }

    if (p.primaryColor) setPrimaryColor(p.primaryColor);
    if (p.secondaryColor) setSecondaryColor(p.secondaryColor);
    if (p.backgroundColor) setBackgroundColor(p.backgroundColor);
    if (p.surfaceColor) setSurfaceColor(p.surfaceColor);
    if (p.textColor) setTextColor(p.textColor);
    if (p.accentColor) setAccentColor(p.accentColor);
    if (p.font) setFontFamily(p.font as any);
  };

  // Handle Save
  const handleSaveTheme = () => {
    const updatedTheme: EventTheme = {
      ...event.theme,
      themeName,
      bannerUrl,
      posterUrl: bannerUrl,
      primaryColor,
      secondaryColor,
      backgroundColor,
      surfaceColor,
      textColor,
      accentColor,
      fontFamily,
      certificateBorderColor: primaryColor,
      certificateBgColor: backgroundColor,
    };

    updateEventTheme(event.id, updatedTheme);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Construct draft theme object for live preview
  const draftTheme: EventTheme = {
    id: 'draft-theme',
    eventId: event.id,
    themeName,
    bannerUrl,
    posterUrl: bannerUrl,
    primaryColor,
    secondaryColor,
    backgroundColor,
    surfaceColor,
    textColor,
    accentColor,
    fontFamily,
    certificateStyle: 'classic',
    certificateBorderColor: primaryColor,
    certificateBgColor: backgroundColor,
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/organizer/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl font-black text-stone-900 flex items-center gap-2">
            <Palette className="w-6 h-6 text-emerald-600" />
            <span>Dynamic Event Theme Studio</span>
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Event: <strong className="text-stone-800">{event.title}</strong> • Upload any photo or select a theme to extract matching palettes.
          </p>
        </div>

        <button
          onClick={handleSaveTheme}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
        >
          <Check className="w-4 h-4" />
          <span>Save &amp; Publish Theme</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Theme updated successfully! The event page, registration form, and certificates now use this theme.</span>
        </div>
      )}

      {/* Main Studio Grid: Controls on Left, Live Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT CONTROLS (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-6">
          {/* Quick Presets */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              Quick Theme Presets
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => applyPreset('harry_potter')}
                className="p-2.5 rounded-xl border border-stone-200 hover:border-amber-400 bg-stone-50 text-left text-xs font-semibold cursor-pointer"
              >
                🧙‍♂️ Harry Potter
              </button>
              <button
                type="button"
                onClick={() => applyPreset('subway')}
                className="p-2.5 rounded-xl border border-stone-200 hover:border-emerald-400 bg-stone-50 text-left text-xs font-semibold cursor-pointer"
              >
                🥪 Subway Suppers
              </button>
              <button
                type="button"
                onClick={() => applyPreset('tech_innovation')}
                className="p-2.5 rounded-xl border border-stone-200 hover:border-cyan-400 bg-stone-50 text-left text-xs font-semibold cursor-pointer"
              >
                💻 Tech Cyberpunk
              </button>
              <button
                type="button"
                onClick={() => applyPreset('pushpa_wildfire')}
                className="p-2.5 rounded-xl border border-stone-200 hover:border-red-500 bg-stone-50 text-left text-xs font-semibold cursor-pointer"
              >
                🔥 Pushpa Wildfire
              </button>
            </div>
          </div>

          {/* Theme Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700">Theme Name</label>
            <input
              type="text"
              value={themeName}
              onChange={(e) => setThemeName(e.target.value)}
              placeholder="e.g. Pushpa Wildfire, Interstellar, Retro..."
              className="w-full p-2.5 rounded-xl border border-stone-200 text-xs outline-none focus:border-emerald-600"
            />
          </div>

          {/* Photo URL / Upload */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-700">Theme Image Asset</label>
            
            {/* Hidden native file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            <div className="space-y-2">
              <input
                type="text"
                value={bannerUrl.startsWith('data:') ? 'Custom Photo from Computer (Loaded)' : bannerUrl}
                onChange={(e) => {
                  setBannerUrl(e.target.value);
                  setImageError(false);
                }}
                placeholder="Enter direct image link or upload from computer..."
                className="w-full p-2.5 rounded-xl border border-stone-200 text-xs outline-none focus:border-emerald-600"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all"
                  title="Upload image from computer without CORS issues"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload from Device</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleExtractColors()}
                  disabled={isExtracting}
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-stone-900 hover:bg-stone-800 text-white flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isExtracting ? 'animate-spin' : ''}`} />
                  <span>{isExtracting ? 'Sampling...' : 'Auto-Extract'}</span>
                </button>
              </div>

              {uploadSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Photo loaded successfully! Colors extracted.</span>
                </div>
              )}
            </div>
          </div>

          {/* Palette Color Pickers */}
          <div className="space-y-3 pt-2 border-t border-stone-100">
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              Adjust Extracted Colors
            </label>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-[11px] text-stone-500 font-medium">Primary Accent</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-8 h-8 rounded-lg border border-stone-200 cursor-pointer"
                  />
                  <span className="font-mono text-[11px] uppercase">{primaryColor}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-stone-500 font-medium">Secondary Glow</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-8 h-8 rounded-lg border border-stone-200 cursor-pointer"
                  />
                  <span className="font-mono text-[11px] uppercase">{secondaryColor}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-stone-500 font-medium">Background Color</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-8 h-8 rounded-lg border border-stone-200 cursor-pointer"
                  />
                  <span className="font-mono text-[11px] uppercase">{backgroundColor}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-stone-500 font-medium">Surface Card</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={surfaceColor}
                    onChange={(e) => setSurfaceColor(e.target.value)}
                    className="w-8 h-8 rounded-lg border border-stone-200 cursor-pointer"
                  />
                  <span className="font-mono text-[11px] uppercase">{surfaceColor}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Typography Styling */}
          <div className="space-y-1.5 pt-2 border-t border-stone-100">
            <label className="text-xs font-semibold text-stone-700">Typography Font Family</label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value as any)}
              className="w-full p-2.5 rounded-xl border border-stone-200 text-xs outline-none focus:border-emerald-600 bg-white"
            >
              <option value="sans">Clean Modern Sans-Serif</option>
              <option value="serif">Magical Classical Serif</option>
              <option value="orbitron">Futuristic Tech / Cyber</option>
              <option value="rustic">Rugged Cinematic / Rustic</option>
              <option value="mono">Developer Monospace</option>
            </select>
          </div>
        </div>

        {/* RIGHT LIVE PREVIEW CONTAINER (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-3 rounded-2xl border border-stone-200 flex items-center justify-between">
            <span className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-600" />
              Live Theme Preview
            </span>

            <div className="flex gap-1">
              {[
                { id: 'landing', label: 'Landing Page' },
                { id: 'register', label: 'Registration Form' },
                { id: 'certificate', label: 'Certificate' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPreviewMode(m.id as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    previewMode === m.id
                      ? 'bg-stone-900 text-white'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Render the scoped dynamic preview */}
          <div className="rounded-3xl overflow-hidden border border-stone-300 shadow-xl max-h-[600px] overflow-y-auto">
            <ThemedContainer theme={draftTheme} className="p-6">
              {previewMode === 'landing' && (
                <div className="space-y-6">
                  {/* Banner */}
                  <div className="relative aspect-[21/9] rounded-2xl overflow-hidden shadow-lg border border-white/20 bg-stone-950">
                    {!imageError ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={bannerUrl}
                        alt="Preview banner"
                        className="w-full h-full object-cover"
                        onLoad={() => setImageError(false)}
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-stone-900 text-stone-200 space-y-2">
                        <AlertTriangle className="w-6 h-6 text-amber-400" />
                        <p className="text-xs font-bold text-amber-200">
                          ⚠️ Unable to load image from this web link
                        </p>
                        <p className="text-[10px] text-stone-400 max-w-sm">
                          Websites often block external linking, causing black screens. Please click below to select a photo from your computer:
                        </p>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow cursor-pointer flex items-center gap-1.5"
                        >
                          <Upload className="w-3 h-3" />
                          <span>Select Photo from Computer</span>
                        </button>
                      </div>
                    )}

                    {!imageError && (
                      <>
                        <div
                          className="absolute inset-0"
                          style={{
                            background: `linear-gradient(to top, ${backgroundColor} 0%, transparent 100%)`,
                          }}
                        />
                        <div className="absolute bottom-4 left-4 right-4 space-y-1">
                          <span
                            className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase"
                            style={{ backgroundColor: primaryColor, color: backgroundColor }}
                          >
                            Theme: {themeName}
                          </span>
                          <h2 className="text-xl sm:text-2xl font-black uppercase text-white">
                            {event.title}
                          </h2>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Sample Card */}
                  <div
                    className="p-5 rounded-2xl border shadow space-y-3"
                    style={{ backgroundColor: surfaceColor, borderColor: `${primaryColor}44` }}
                  >
                    <h3 className="text-sm font-bold flex items-center gap-1.5" style={{ color: primaryColor }}>
                      <Sparkles className="w-4 h-4" />
                      About This Themed Competition
                    </h3>
                    <p className="text-xs opacity-85 leading-relaxed">
                      This dynamic preview demonstrates how colors and fonts are isolated to this specific event. Notice that the top navigation and global site design remain unpolluted!
                    </p>
                    <button
                      type="button"
                      className="w-full py-2.5 rounded-xl font-bold text-xs shadow-md cursor-pointer"
                      style={{ backgroundColor: primaryColor, color: backgroundColor }}
                    >
                      Sample Themed Button
                    </button>
                  </div>
                </div>
              )}

              {previewMode === 'register' && (
                <div
                  className="p-6 rounded-2xl border shadow space-y-4"
                  style={{ backgroundColor: surfaceColor, borderColor: `${primaryColor}44` }}
                >
                  <div className="border-b border-white/10 pb-3">
                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-70">
                      Registration Form
                    </span>
                    <h3 className="text-lg font-bold" style={{ color: primaryColor }}>
                      Register for {event.title}
                    </h3>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-[11px] opacity-70">Team Name</label>
                      <input
                        type="text"
                        disabled
                        value="Team ByteBites"
                        className="w-full p-2.5 rounded-lg bg-black/40 border border-white/20 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] opacity-70">Team Leader Name</label>
                      <input
                        type="text"
                        disabled
                        value="Riya Sharma"
                        className="w-full p-2.5 rounded-lg bg-black/40 border border-white/20 text-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    className="w-full py-2.5 rounded-xl font-bold text-xs shadow-md cursor-pointer"
                    style={{ backgroundColor: primaryColor, color: backgroundColor }}
                  >
                    Continue to Payment →
                  </button>
                </div>
              )}

              {previewMode === 'certificate' && (
                <div
                  className="aspect-[1.414/1] rounded-2xl p-6 border-2 shadow-2xl flex flex-col justify-between text-center relative"
                  style={{
                    backgroundColor: backgroundColor,
                    borderColor: primaryColor,
                    color: textColor,
                  }}
                >
                  <div>
                    <p className="text-[10px] uppercase tracking-widest opacity-70">
                      {event?.certificateSettings?.collegeName || collegeName || 'College of Engineering & Technology'}
                    </p>
                    <h2
                      className="text-base sm:text-lg font-black uppercase tracking-wide mt-1"
                      style={{ color: primaryColor }}
                    >
                      Certificate of Achievement
                    </h2>
                    <span className="inline-block px-2 py-0.5 rounded text-[9px] font-bold bg-white/10 mt-0.5">
                      Theme: {themeName}
                    </span>
                  </div>

                  <div className="my-auto py-2">
                    <p className="text-xs opacity-75 font-serif italic">Presented to</p>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">Riya Sharma</h3>
                    <p className="text-xs opacity-80 mt-1">for securing 1st Position in {event.title}</p>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex justify-between text-[10px] opacity-60">
                    <span>Faculty Coordinator</span>
                    <span>Certificate ID: CERT-DEMO-2026</span>
                    <span>Head of Department</span>
                  </div>
                </div>
              )}
            </ThemedContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
