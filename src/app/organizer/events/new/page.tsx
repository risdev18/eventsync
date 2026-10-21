'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/lib/store/useStore';
import { extractPaletteFromImage, THEME_PRESETS } from '@/lib/theme/colorExtractor';
import { EventCategory, EventFontFamily, EventTheme } from '@/lib/types';
import {
  Calendar,
  Layers,
  Palette,
  Users,
  CreditCard,
  Award,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  Upload,
  AlertTriangle,
  Copy,
  Check,
  Code2,
  FileCode,
  Image as ImageIcon,
  MoveVertical,
  Type,
} from 'lucide-react';
import {
  CHATGPT_PROMPT_SUGGESTION,
  CHATGPT_TEMPLATE_PRESETS,
  compileCertificateTemplate,
} from '@/lib/certificates/chatGptTemplates';

export default function CreateEventWizardPage() {
  const router = useRouter();
  const { branches, createEvent, currentUser } = useStore();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);

  // Form State
  const [title, setTitle] = useState('');
  const [branchId, setBranchId] = useState(currentUser.branchId || branches[0]?.id || 'branch-it');
  const [category, setCategory] = useState<EventCategory>('hackathon');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [venue, setVenue] = useState('Auditorium, Main Block');
  const [mode, setMode] = useState<'offline' | 'online' | 'hybrid'>('offline');
  const [capacity, setCapacity] = useState(100);
  const [startDate, setStartDate] = useState('2026-05-10T09:00');
  const [endDate, setEndDate] = useState('2026-05-12T18:00');
  const [registrationDeadline, setRegistrationDeadline] = useState('2026-05-09T23:59');

  // Theme State
  const [themeName, setThemeName] = useState('Harry Potter');
  const [bannerUrl, setBannerUrl] = useState('/images/theme-harry-potter.jpg');
  const [primaryColor, setPrimaryColor] = useState('#D4AF37');
  const [secondaryColor, setSecondaryColor] = useState('#8A2BE2');
  const [backgroundColor, setBackgroundColor] = useState('#0A0D17');
  const [surfaceColor, setSurfaceColor] = useState('#13182C');
  const [textColor, setTextColor] = useState('#F8FAFC');
  const [accentColor, setAccentColor] = useState('#F59E0B');
  const [fontFamily, setFontFamily] = useState<EventFontFamily>('serif');
  const [isExtracting, setIsExtracting] = useState(false);
  const [createdEvent, setCreatedEvent] = useState<any>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Device File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageError, setImageError] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Dynamic Team Settings
  const [minTeamSize, setMinTeamSize] = useState(2);
  const [maxTeamSize, setMaxTeamSize] = useState(4);
  const [allowIndividual, setAllowIndividual] = useState(false);
  const [requireTeam, setRequireTeam] = useState(true);

  // Payment Settings
  const [isPaid, setIsPaid] = useState(true);
  const [feeType, setFeeType] = useState<'per_team' | 'per_person'>('per_team');
  const [feeAmount, setFeeAmount] = useState(200);
  const [upiId, setUpiId] = useState('eventease@upi');
  const [payeeName, setPayeeName] = useState('EventEase College Council');

  // Certificate Settings State
  const [signatory1Name, setSignatory1Name] = useState(currentUser.name || 'Prof. Ananya Roy');
  const [signatory1Title, setSignatory1Title] = useState('Faculty Coordinator');
  const [signatory2Name, setSignatory2Name] = useState('Dr. H. N. Suresh');
  const [signatory2Title, setSignatory2Title] = useState('Head of Department');
  const [certTemplateMode, setCertTemplateMode] = useState<'automatic' | 'photo_template' | 'chatgpt_custom'>('photo_template');

  // Photo Certificate Template State (Uploaded from ChatGPT / Canva / Computer)
  const [photoTemplateUrl, setPhotoTemplateUrl] = useState<string>('/images/cert-template-royal-gold.jpg');
  const [photoTextColor, setPhotoTextColor] = useState<string>('#0A0D17');
  const [photoNamePositionY, setPhotoNamePositionY] = useState<number>(48);
  const [photoNameFontSize, setPhotoNameFontSize] = useState<number>(34);
  const [photoFontFamily, setPhotoFontFamily] = useState<'serif' | 'sans' | 'orbitron' | 'rustic' | 'mono'>('serif');
  const [photoShowQrCode, setPhotoShowQrCode] = useState<boolean>(true);
  const [photoQrPosition, setPhotoQrPosition] = useState<'bottom_right' | 'bottom_center' | 'bottom_left'>('bottom_right');
  const [photoShowSignatures, setPhotoShowSignatures] = useState<boolean>(true);
  const [photoShowEventTitle, setPhotoShowEventTitle] = useState<boolean>(true);
  const [certPhotoUploadSuccess, setCertPhotoUploadSuccess] = useState<boolean>(false);
  const certFileInputRef = useRef<HTMLInputElement>(null);

  // ChatGPT HTML/CSS fallback state
  const [customChatGPTTemplate, setCustomChatGPTTemplate] = useState<string>(
    CHATGPT_TEMPLATE_PRESETS.royal_gold.template
  );
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>('royal_gold');
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const handleCertPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setPhotoTemplateUrl(dataUrl);
        setCertPhotoUploadSuccess(true);
        setTimeout(() => setCertPhotoUploadSuccess(false), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  const applyThemePreset = (key: string) => {
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
    } else if (key === 'neural_datathon') {
      setBannerUrl('/images/theme-datathon.jpg');
      setThemeName('Neural Datathon');
    }

    if (p.primaryColor) setPrimaryColor(p.primaryColor);
    if (p.secondaryColor) setSecondaryColor(p.secondaryColor);
    if (p.backgroundColor) setBackgroundColor(p.backgroundColor);
    if (p.surfaceColor) setSurfaceColor(p.surfaceColor);
    if (p.textColor) setTextColor(p.textColor);
    if (p.accentColor) setAccentColor(p.accentColor);
    if (p.font) setFontFamily(p.font as any);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (.jpg, .png, .webp, .svg)');
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

  const handleCreateSubmit = () => {
    const enforcedBranchId = currentUser.role === 'admin' ? branchId : (currentUser.branchId || branchId);
    const newEvent = createEvent({
      title: title || `${themeName} Challenge`,
      slug: (title || `${themeName} Challenge`).toLowerCase().replace(/\s+/g, '-'),
      branchId: enforcedBranchId,
      category,
      tagline: tagline || `The official ${themeName} themed competition`,
      description:
        description ||
        `Join us for an exhilarating technical event with an immersive ${themeName} theme experience. Form your team, solve challenges, and win certificates!`,
      rules: [
        `Teams must strictly comprise ${minTeamSize} to ${maxTeamSize} registered participants.`,
        'All work must be developed during the hackathon timeline.',
        'Verified physical attendance required for certificate issuance.',
      ],
      schedule: [
        { time: 'Day 1 - 09:00 AM', activity: 'Inauguration & Hacking Kickoff' },
        { time: 'Day 2 - 04:00 PM', activity: 'Jury Evaluation & Winner Ceremony' },
      ],
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      venue,
      mode,
      status: 'published',
      capacity,
      registrationDeadline: new Date(registrationDeadline).toISOString(),
      organizerId: currentUser.id,
      organizerName: currentUser.name,
      organizerContact: `${currentUser.email} | ${currentUser.phone || '+91 98765 43220'}`,
      featured: true,
      theme: {
        id: `theme-${Date.now()}`,
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
      },
      registrationSettings: {
        minTeamSize,
        maxTeamSize,
        allowIndividual,
        requireTeam,
        requireAllMemberAccounts: false,
        requireUniqueTeamName: true,
      },
      paymentSettings: {
        isPaid,
        feeType,
        feeAmount: isPaid ? feeAmount : 0,
        upiId: isPaid ? upiId : '',
        payeeName: isPaid ? payeeName : '',
        qrImageUrl: '/images/upi-qr.png',
        paymentInstructions: 'UPI payment required. Submit UTR for verification.',
      },
      certificateSettings: {
        enableParticipation: true,
        attendanceRequirementPct: 100,
        collegeName: 'EventEase College of Engineering & Technology',
        templateMode: certTemplateMode,
        photoTemplateUrl: certTemplateMode === 'photo_template' ? photoTemplateUrl : undefined,
        photoSettings:
          certTemplateMode === 'photo_template'
            ? {
                textColor: photoTextColor,
                namePositionY: photoNamePositionY,
                nameFontSize: photoNameFontSize,
                fontFamily: photoFontFamily,
                showQrCode: photoShowQrCode,
                qrPosition: photoQrPosition,
                showSignatures: photoShowSignatures,
                showEventTitle: photoShowEventTitle,
                showPlacement: true,
              }
            : undefined,
        customChatGPTTemplate: certTemplateMode === 'chatgpt_custom' ? customChatGPTTemplate : undefined,
        signatories: [
          { name: signatory1Name, title: signatory1Title },
          { name: signatory2Name, title: signatory2Title },
        ],
      },
    });

    setCreatedEvent(newEvent);
    setShowSuccessModal(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6" suppressHydrationWarning>
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/organizer/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </Link>
          <h1 className="text-2xl font-black text-stone-900">Event Creation Wizard</h1>
          <p className="text-xs text-stone-500">
            Configure basic details, dynamic theme, team formation rules, UPI QR payments, and certificate settings.
          </p>
        </div>

        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Step {step} of 7
        </span>
      </div>

      {/* Stepper Tabs */}
      <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
        {[
          { num: 1, label: 'Basics' },
          { num: 2, label: 'Theme Studio' },
          { num: 3, label: 'Schedule' },
          { num: 4, label: 'Team Rules' },
          { num: 5, label: 'Payment' },
          { num: 6, label: 'Certificates' },
          { num: 7, label: 'Review' },
        ].map((s) => (
          <div
            key={s.num}
            onClick={() => setStep(s.num as any)}
            className={`flex items-center gap-2 text-xs font-semibold cursor-pointer ${
              step === s.num ? 'text-emerald-700' : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${
                step === s.num ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-600'
              }`}
            >
              {s.num}
            </span>
            <span className="hidden sm:inline">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Step Form Box */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
        {/* STEP 1: BASICS */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-stone-900">1. Basic Event Information</h3>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700">Event Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. IT Branch Hackathon 2026, Robowars, AI Summit..."
                className="w-full p-2.5 rounded-xl border border-stone-200 text-xs outline-none focus:border-emerald-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">Organizing Department *</label>
                {currentUser.role === 'admin' ? (
                  <select
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 text-xs outline-none focus:border-emerald-600 bg-white"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="w-full p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 text-stone-900 text-xs font-bold flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-600" />
                      <span>
                        {branches.find((b) => b.id === (currentUser.branchId || branchId))?.name || 'Information Technology'} (
                        {branches.find((b) => b.id === (currentUser.branchId || branchId))?.code || 'IT'})
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                      Locked to your department
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">Event Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 text-xs outline-none focus:border-emerald-600 bg-white"
                >
                  <option value="hackathon">Hackathon</option>
                  <option value="workshop">Workshop</option>
                  <option value="competition">Competition</option>
                  <option value="cultural">Cultural</option>
                  <option value="technical">Technical</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700">Event Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Code. Create. Conjure the Future."
                className="w-full p-2.5 rounded-xl border border-stone-200 text-xs outline-none focus:border-emerald-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide event overview, learning outcomes, and expectations..."
                className="w-full p-2.5 rounded-xl border border-stone-200 text-xs outline-none focus:border-emerald-600"
              />
            </div>
          </div>
        )}

        {/* STEP 2: DYNAMIC THEME ENGINE */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-base font-bold text-stone-900">2. Dynamic Event Theme Setup</h3>
              <p className="text-xs text-stone-500">
                Upload any theme photo or select a preset. Colors will automatically be extracted from your image!
              </p>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <button
                type="button"
                onClick={() => applyThemePreset('harry_potter')}
                className="p-3 rounded-xl border border-stone-200 hover:border-amber-400 bg-stone-50 text-xs font-bold text-left cursor-pointer"
              >
                🧙‍♂️ Harry Potter
              </button>
              <button
                type="button"
                onClick={() => applyThemePreset('subway')}
                className="p-3 rounded-xl border border-stone-200 hover:border-emerald-500 bg-stone-50 text-xs font-bold text-left cursor-pointer"
              >
                🥪 Subway Suppers
              </button>
              <button
                type="button"
                onClick={() => applyThemePreset('tech_innovation')}
                className="p-3 rounded-xl border border-stone-200 hover:border-cyan-400 bg-stone-50 text-xs font-bold text-left cursor-pointer"
              >
                💻 Tech Innovation
              </button>
              <button
                type="button"
                onClick={() => applyThemePreset('pushpa_wildfire')}
                className="p-3 rounded-xl border border-stone-200 hover:border-red-500 bg-stone-50 text-xs font-bold text-left cursor-pointer"
              >
                🔥 Pushpa Wildfire
              </button>
              <button
                type="button"
                onClick={() => applyThemePreset('neural_datathon')}
                className="p-3 rounded-xl border border-stone-200 hover:border-violet-500 bg-stone-50 text-xs font-bold text-left cursor-pointer"
              >
                📊 Neural Datathon
              </button>
            </div>

            {/* Hidden native file input for direct computer file upload */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">Theme Name *</label>
                <input
                  type="text"
                  value={themeName}
                  onChange={(e) => setThemeName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 text-xs outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">Theme Image Asset</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={bannerUrl.startsWith('data:') ? 'Custom Photo from Computer (Loaded)' : bannerUrl}
                    onChange={(e) => {
                      setBannerUrl(e.target.value);
                      setImageError(false);
                    }}
                    placeholder="Paste direct image link e.g. .jpg/.png or click Upload"
                    className="w-full p-2.5 rounded-xl border border-stone-200 text-xs outline-none focus:border-emerald-600"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 cursor-pointer flex items-center gap-1.5 shadow-sm transition-all"
                    title="Upload photo directly from computer without CORS issues"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Upload from Device</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExtractColors()}
                    disabled={isExtracting}
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-stone-900 text-white shrink-0 cursor-pointer flex items-center gap-1"
                    title="Extract colors from image"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isExtracting ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Extract</span>
                  </button>
                </div>
              </div>
            </div>

            {uploadSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Photo uploaded successfully from your device! Palette colors extracted automatically.</span>
              </div>
            )}

            {/* Live Theme Image Preview with Black-Screen Guard */}
            {bannerUrl && (
              <div className="relative rounded-2xl overflow-hidden aspect-[21/6] border border-stone-200 shadow-sm bg-stone-950">
                {!imageError ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={bannerUrl}
                    alt={themeName}
                    className="w-full h-full object-cover"
                    onLoad={() => setImageError(false)}
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-stone-900 text-stone-200 space-y-2">
                    <AlertTriangle className="w-7 h-7 text-amber-400" />
                    <p className="text-xs font-bold text-amber-200">
                      ⚠️ Could not display image from this link
                    </p>
                    <p className="text-[11px] text-stone-400 max-w-md">
                      Webpages and search engines block direct external linking, showing a black box. Please upload the photo file directly from your computer instead:
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow cursor-pointer flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Photo Directly from Device</span>
                    </button>
                  </div>
                )}

                {!imageError && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex items-end p-4">
                    <div className="flex items-center justify-between w-full">
                      <span className="text-white text-xs font-bold flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        Active Theme Artwork: <strong className="text-white">{themeName}</strong>
                      </span>
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                        style={{ backgroundColor: primaryColor, color: backgroundColor }}
                      >
                        Theme Preview
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Extracted Colors Grid */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Extracted Palette Preview
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[11px] text-stone-500">Primary Color</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-7 h-7 rounded border border-stone-200"
                    />
                    <span className="font-mono text-[11px] uppercase">{primaryColor}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-stone-500">Secondary Glow</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-7 h-7 rounded border border-stone-200"
                    />
                    <span className="font-mono text-[11px] uppercase">{secondaryColor}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-stone-500">Deep Background</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-7 h-7 rounded border border-stone-200"
                    />
                    <span className="font-mono text-[11px] uppercase">{backgroundColor}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-stone-500">Surface Card</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <input
                      type="color"
                      value={surfaceColor}
                      onChange={(e) => setSurfaceColor(e.target.value)}
                      className="w-7 h-7 rounded border border-stone-200"
                    />
                    <span className="font-mono text-[11px] uppercase">{surfaceColor}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: DATES & VENUE */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-stone-900">3. Date, Time &amp; Venue</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">Start Date &amp; Time *</label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 text-xs outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">End Date &amp; Time *</label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 text-xs outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">Venue *</label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 text-xs outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">Registration Deadline *</label>
                <input
                  type="datetime-local"
                  value={registrationDeadline}
                  onChange={(e) => setRegistrationDeadline(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 text-xs outline-none focus:border-emerald-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: TEAM RULES */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-stone-900">4. Dynamic Team Size Settings</h3>
            <p className="text-xs text-stone-500">
              Configure minimum and maximum participants. The registration form will dynamically generate member input fields based on these limits.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">Minimum Team Size *</label>
                <input
                  type="number"
                  min={1}
                  max={maxTeamSize}
                  value={minTeamSize}
                  onChange={(e) => setMinTeamSize(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-stone-200 text-xs outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">Maximum Team Size *</label>
                <input
                  type="number"
                  min={minTeamSize}
                  max={8}
                  value={maxTeamSize}
                  onChange={(e) => setMaxTeamSize(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-stone-200 text-xs outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-stone-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowIndividual}
                  onChange={(e) => setAllowIndividual(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600"
                />
                <span>Allow individual participation (solo participant)</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-stone-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requireTeam}
                  onChange={(e) => setRequireTeam(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600"
                />
                <span>Require mandatory team registration</span>
              </label>
            </div>
          </div>
        )}

        {/* STEP 5: PAYMENT SETTINGS */}
        {step === 5 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-stone-900">5. UPI Payment Settings</h3>

            <label className="flex items-center gap-2 text-xs font-semibold text-stone-800 cursor-pointer">
              <input
                type="checkbox"
                checked={isPaid}
                onChange={(e) => setIsPaid(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600"
              />
              <span>This is a paid event (Requires UPI QR scan and proof verification)</span>
            </label>

            {isPaid && (
              <div className="space-y-4 pt-2 border-t border-stone-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700">Fee Amount (₹) *</label>
                    <input
                      type="number"
                      min={10}
                      value={feeAmount}
                      onChange={(e) => setFeeAmount(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-stone-200 text-xs outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700">Fee Structure *</label>
                    <select
                      value={feeType}
                      onChange={(e) => setFeeType(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-stone-200 text-xs outline-none focus:border-emerald-600 bg-white"
                    >
                      <option value="per_team">Fixed per Team</option>
                      <option value="per_person">Per Member / Person</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700">Official UPI ID *</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. eventease@upi"
                      className="w-full p-2.5 rounded-xl border border-stone-200 text-xs outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700">Official Payee Name *</label>
                    <input
                      type="text"
                      value={payeeName}
                      onChange={(e) => setPayeeName(e.target.value)}
                      placeholder="e.g. EventEase College Council"
                      className="w-full p-2.5 rounded-xl border border-stone-200 text-xs outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 6: CERTIFICATE DESIGN STUDIO */}
        {step === 6 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                <span>6. Certificate Design Studio</span>
              </h3>
              <p className="text-xs text-stone-500">
                Choose how certificates will be generated. You can upload a certificate photo template created with ChatGPT (DALL-E) or Canva (no code required), or use our dynamic procedural theme engine!
              </p>
            </div>

            {/* Mode Selector Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Card 1: Photo Template (Recommended - No Code!) */}
              <div
                onClick={() => setCertTemplateMode('photo_template')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-2 relative ${
                  certTemplateMode === 'photo_template'
                    ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-blue-600" />
                    <h4 className="font-bold text-xs sm:text-sm text-stone-900">
                      ChatGPT Photo Template
                    </h4>
                  </div>
                  {certTemplateMode === 'photo_template' ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                      Selected
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                      No Code!
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Upload any certificate photo generated with ChatGPT or Canva. Student names, event title, placement, QR codes, and signatures are automatically stamped on top!
                </p>
              </div>

              {/* Card 2: Automatic Dynamic Theme */}
              <div
                onClick={() => setCertTemplateMode('automatic')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-2 ${
                  certTemplateMode === 'automatic'
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-sm'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <h4 className="font-bold text-xs sm:text-sm text-stone-900">
                      Automatic Dynamic Theme
                    </h4>
                  </div>
                  {certTemplateMode === 'automatic' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                      Selected
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Generates procedural collegiate certificates automatically tailored to your {themeName} theme colors, watermark patterns, seals, and guilloche borders.
                </p>
              </div>

              {/* Card 3: Advanced HTML/CSS */}
              <div
                onClick={() => setCertTemplateMode('chatgpt_custom')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-2 ${
                  certTemplateMode === 'chatgpt_custom'
                    ? 'border-purple-600 bg-purple-50/50 shadow-sm'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-purple-600" />
                    <h4 className="font-bold text-xs sm:text-sm text-stone-900">
                      Advanced: HTML Code
                    </h4>
                  </div>
                  {certTemplateMode === 'chatgpt_custom' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-600 text-white">
                      Selected
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-500 leading-relaxed">
                  For developers who want to paste raw HTML/CSS code strings from ChatGPT with template variables.
                </p>
              </div>
            </div>

            {/* 1. PHOTO-BASED TEMPLATE STUDIO (NO CODE!) */}
            {certTemplateMode === 'photo_template' && (
              <div className="space-y-6 pt-2 border-t border-stone-100 animate-in fade-in">
                {/* Upload Section & Presets */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-blue-950 flex items-center gap-1.5 uppercase tracking-wider">
                        <Upload className="w-4 h-4 text-blue-600" />
                        <span>Upload Your ChatGPT Certificate Template Photo</span>
                      </h4>
                      <p className="text-xs text-blue-800 mt-0.5">
                        Ask ChatGPT: <em>“Generate a blank luxury certificate background image without recipient name or text”</em>, then upload that photo here!
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        ref={certFileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleCertPhotoUpload}
                      />
                      <button
                        type="button"
                        onClick={() => certFileInputRef.current?.click()}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0 transition-all"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Photo from Device</span>
                      </button>
                    </div>
                  </div>

                  {certPhotoUploadSuccess && (
                    <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-semibold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Certificate template photo uploaded and loaded into preview successfully!</span>
                    </div>
                  )}

                  {/* Ready-made ChatGPT Photo Presets */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider">
                      Or Choose a Ready-Made ChatGPT Template Photo:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoTemplateUrl('/images/cert-template-royal-gold.jpg');
                          setPhotoTextColor('#0A0D17');
                          setPhotoFontFamily('serif');
                          setPhotoNamePositionY(48);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                          photoTemplateUrl === '/images/cert-template-royal-gold.jpg'
                            ? 'bg-blue-900 text-white border-blue-900 shadow-sm'
                            : 'bg-white text-stone-700 border-blue-200 hover:bg-blue-100/50'
                        }`}
                      >
                        <span>🏆 ChatGPT Royal Gold Template</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPhotoTemplateUrl('/images/cert-template-cyber-tech.jpg');
                          setPhotoTextColor('#F8FAFC');
                          setPhotoFontFamily('orbitron');
                          setPhotoNamePositionY(48);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                          photoTemplateUrl === '/images/cert-template-cyber-tech.jpg'
                            ? 'bg-blue-900 text-white border-blue-900 shadow-sm'
                            : 'bg-white text-stone-700 border-blue-200 hover:bg-blue-100/50'
                        }`}
                      >
                        <span>⚡ ChatGPT Cyber Tech Template</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Visual Position & Style Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  {/* Name Vertical Offset Slider */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                        <MoveVertical className="w-3.5 h-3.5 text-stone-500" />
                        <span>Name Vertical Position:</span>
                      </label>
                      <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {photoNamePositionY}% from Top
                      </span>
                    </div>
                    <input
                      type="range"
                      min={25}
                      max={75}
                      value={photoNamePositionY}
                      onChange={(e) => setPhotoNamePositionY(Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-stone-400">
                      <span>Higher (25%)</span>
                      <span>Default Center (48%)</span>
                      <span>Lower (75%)</span>
                    </div>
                  </div>

                  {/* Name Font Size Slider */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                        <Type className="w-3.5 h-3.5 text-stone-500" />
                        <span>Recipient Font Size:</span>
                      </label>
                      <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {photoNameFontSize}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={20}
                      max={48}
                      value={photoNameFontSize}
                      onChange={(e) => setPhotoNameFontSize(Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-stone-400">
                      <span>20px (Small)</span>
                      <span>34px (Standard)</span>
                      <span>48px (Large)</span>
                    </div>
                  </div>

                  {/* Text Color Picker */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-700">Text &amp; Overlay Color:</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={photoTextColor}
                        onChange={(e) => setPhotoTextColor(e.target.value)}
                        className="w-9 h-9 rounded-lg border border-stone-200 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={photoTextColor}
                        onChange={(e) => setPhotoTextColor(e.target.value)}
                        className="w-24 p-2 rounded-lg border border-stone-200 text-xs font-mono uppercase"
                      />
                      {/* Swatches */}
                      <button
                        type="button"
                        onClick={() => setPhotoTextColor('#0A0D17')}
                        className="px-2 py-1 rounded text-[11px] font-semibold bg-stone-900 text-white cursor-pointer"
                      >
                        Charcoal
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhotoTextColor('#FFFFFF')}
                        className="px-2 py-1 rounded text-[11px] font-semibold bg-white text-stone-800 border border-stone-300 cursor-pointer"
                      >
                        White
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhotoTextColor('#D4AF37')}
                        className="px-2 py-1 rounded text-[11px] font-semibold bg-amber-400 text-stone-900 cursor-pointer"
                      >
                        Gold
                      </button>
                    </div>
                  </div>

                  {/* Font Family Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-700">Name Typography Style:</label>
                    <select
                      value={photoFontFamily}
                      onChange={(e) => setPhotoFontFamily(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-stone-200 text-xs bg-white outline-none focus:border-blue-600"
                    >
                      <option value="serif">Classic Academic Serif (Times / Georgia)</option>
                      <option value="sans">Clean Modern Sans (Inter / Helvetica)</option>
                      <option value="orbitron">Futuristic Tech / Cyber (Orbitron)</option>
                      <option value="rustic">Bold Rustic / Display (Impact)</option>
                    </select>
                  </div>

                  {/* QR & Signatures Toggles */}
                  <div className="md:col-span-2 flex flex-wrap gap-4 pt-2 border-t border-stone-200 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={photoShowQrCode}
                        onChange={(e) => setPhotoShowQrCode(e.target.checked)}
                        className="rounded text-blue-600 accent-blue-600"
                      />
                      <span className="font-semibold text-stone-700">Include Security Verification QR Code</span>
                    </label>

                    {photoShowQrCode && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-stone-500 text-[11px]">QR Position:</span>
                        {(['bottom_right', 'bottom_center', 'bottom_left'] as const).map((pos) => (
                          <button
                            key={pos}
                            type="button"
                            onClick={() => setPhotoQrPosition(pos)}
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold border cursor-pointer ${
                              photoQrPosition === pos
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-stone-600 border-stone-200'
                            }`}
                          >
                            {pos === 'bottom_right' ? 'Right' : pos === 'bottom_center' ? 'Center' : 'Left'}
                          </button>
                        ))}
                      </div>
                    )}

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={photoShowSignatures}
                        onChange={(e) => setPhotoShowSignatures(e.target.checked)}
                        className="rounded text-blue-600 accent-blue-600"
                      />
                      <span className="font-semibold text-stone-700">Include Official Signatures</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={photoShowEventTitle}
                        onChange={(e) => setPhotoShowEventTitle(e.target.checked)}
                        className="rounded text-blue-600 accent-blue-600"
                      />
                      <span className="font-semibold text-stone-700">Include Event Subtitle</span>
                    </label>
                  </div>
                </div>

                {/* Real-time Interactive Live Preview */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>Live Photo Template Certificate Preview</span>
                    </span>
                    <span className="text-[11px] text-stone-500">
                      Sample Recipient: <strong>Riya Sharma</strong>
                    </span>
                  </div>

                  <div className="p-3 sm:p-4 bg-stone-100 rounded-3xl border border-stone-200 flex justify-center">
                    <div
                      className="relative w-full max-w-2xl aspect-[1.414/1] rounded-2xl shadow-xl overflow-hidden select-none border border-stone-300 bg-stone-900 bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${photoTemplateUrl})`,
                        fontFamily:
                          photoFontFamily === 'serif'
                            ? 'Times New Roman, Georgia, serif'
                            : photoFontFamily === 'orbitron'
                            ? 'Orbitron, monospace'
                            : photoFontFamily === 'rustic'
                            ? 'Impact, fantasy'
                            : 'system-ui, -apple-system, sans-serif',
                      }}
                    >
                      {/* Name Layer */}
                      <div
                        className="absolute left-0 right-0 text-center px-8 z-10 pointer-events-none"
                        style={{
                          top: `${photoNamePositionY}%`,
                          transform: 'translateY(-50%)',
                        }}
                      >
                        <h2
                          className="font-extrabold tracking-wide uppercase drop-shadow-md select-text"
                          style={{
                            color: photoTextColor,
                            fontSize: `${photoNameFontSize}px`,
                            textShadow: '0 2px 4px rgba(0,0,0,0.15)',
                          }}
                        >
                          Riya Sharma
                        </h2>
                        {photoShowEventTitle && (
                          <p
                            className="text-xs sm:text-sm font-semibold max-w-lg mx-auto mt-1 opacity-90 drop-shadow"
                            style={{ color: photoTextColor }}
                          >
                            For securing 1st Place Winner in {title || `${themeName} Challenge`}
                          </p>
                        )}
                      </div>

                      {/* Verification QR Code */}
                      {photoShowQrCode && (
                        <div
                          className={`absolute z-10 flex flex-col items-center pointer-events-auto ${
                            photoQrPosition === 'bottom_left'
                              ? 'bottom-4 left-6'
                              : photoQrPosition === 'bottom_center'
                              ? 'bottom-4 left-1/2 -translate-x-1/2'
                              : 'bottom-4 right-6'
                          }`}
                        >
                          <div className="p-1 bg-white rounded shadow-md border border-stone-200">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/images/upi-qr.png" alt="Verify QR" className="w-8 h-8 sm:w-10 sm:h-10" />
                          </div>
                          <span
                            className="text-[7px] font-mono mt-0.5 opacity-80"
                            style={{ color: photoTextColor }}
                          >
                            ID: CERT-DEMO-2026
                          </span>
                        </div>
                      )}

                      {/* Signatures */}
                      {photoShowSignatures && (
                        <div className="absolute bottom-4 left-6 right-6 z-10 flex justify-between items-end pointer-events-none">
                          <div className="text-center w-28 sm:w-32">
                            <div
                              className="font-serif italic text-[11px] sm:text-xs font-bold"
                              style={{ color: photoTextColor }}
                            >
                              {signatory1Name}
                            </div>
                            <div className="h-px bg-current opacity-40 mx-auto my-0.5" />
                            <div
                              className="text-[8px] opacity-75"
                              style={{ color: photoTextColor }}
                            >
                              {signatory1Title}
                            </div>
                          </div>

                          <div className="text-center w-28 sm:w-32">
                            <div
                              className="font-serif italic text-[11px] sm:text-xs font-bold"
                              style={{ color: photoTextColor }}
                            >
                              {signatory2Name}
                            </div>
                            <div className="h-px bg-current opacity-40 mx-auto my-0.5" />
                            <div
                              className="text-[8px] opacity-75"
                              style={{ color: photoTextColor }}
                            >
                              {signatory2Title}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. ADVANCED CUSTOM CHATGPT HTML/CSS TEMPLATE */}
            {certTemplateMode === 'chatgpt_custom' && (
              <div className="space-y-4 pt-2 border-t border-stone-100 animate-in fade-in">
                {/* Presets & Prompt Helper */}
                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                        <FileCode className="w-4 h-4 text-purple-600" />
                        ChatGPT Template Presets &amp; Prompt Generator
                      </span>
                      <p className="text-[11px] text-purple-700">
                        Pick a ready-made ChatGPT certificate or copy the prompt to ask ChatGPT for your own custom style.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(CHATGPT_PROMPT_SUGGESTION);
                        setCopiedPrompt(true);
                        setTimeout(() => setCopiedPrompt(false), 2500);
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      {copiedPrompt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPrompt ? 'Copied Prompt!' : 'Copy ChatGPT Prompt'}</span>
                    </button>
                  </div>

                  {/* Preset Buttons */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {Object.entries(CHATGPT_TEMPLATE_PRESETS).map(([key, preset]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setSelectedPresetKey(key);
                          setCustomChatGPTTemplate(preset.template);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          selectedPresetKey === key
                            ? 'bg-purple-900 text-white border-purple-900 shadow-sm'
                            : 'bg-white text-stone-700 border-purple-200 hover:bg-purple-100/50'
                        }`}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Template Code Textarea */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-stone-700">
                      Paste ChatGPT Certificate HTML / CSS Code:
                    </label>
                    <span className="text-[10px] text-stone-400">
                      Placeholders: &#123;&#123;student_name&#125;&#125;, &#123;&#123;event_title&#125;&#125;, &#123;&#123;placement&#125;&#125;, &#123;&#123;award_category&#125;&#125;, &#123;&#123;qr_code&#125;&#125;
                    </span>
                  </div>
                  <textarea
                    rows={8}
                    value={customChatGPTTemplate}
                    onChange={(e) => setCustomChatGPTTemplate(e.target.value)}
                    placeholder="Paste the HTML/CSS certificate code generated by ChatGPT here..."
                    className="w-full p-3 rounded-xl border border-stone-200 text-xs font-mono bg-stone-900 text-stone-100 outline-none focus:border-purple-600 leading-relaxed"
                  />
                </div>

                {/* Live Preview of ChatGPT Certificate */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    Live ChatGPT Certificate Preview
                  </span>
                  <div className="p-3 bg-stone-100 rounded-2xl border border-stone-200">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: compileCertificateTemplate(customChatGPTTemplate, {
                          recipientName: 'Riya Sharma',
                          eventTitle: title || `${themeName} Challenge`,
                          branchName: 'Computer Science & Engineering',
                          awardCategory: 'Certificate of Achievement',
                          placementText: '1st Place Winner',
                          placement: 1,
                          teamName: 'Team ByteBites',
                          issueDate: new Date().toLocaleDateString(),
                          eventDate: 'May 10 - May 12, 2026',
                          certificateNumber: 'CERT-DEMO-2026-001',
                          collegeName: 'EventEase College of Engineering & Technology',
                          signatory1Name: signatory1Name,
                          signatory1Title: signatory1Title,
                          signatory2Name: signatory2Name,
                          signatory2Title: signatory2Title,
                          qrCodeUrl: '/images/upi-qr.png',
                          themePrimaryColor: primaryColor,
                          themeBgColor: backgroundColor,
                        }),
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Signatories Details */}
            <div className="space-y-3 pt-4 border-t border-stone-100">
              <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Official Certificate Signatories
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-[11px] font-bold text-stone-600">Left Signatory (Faculty Coordinator)</span>
                  <input
                    type="text"
                    value={signatory1Name}
                    onChange={(e) => setSignatory1Name(e.target.value)}
                    placeholder="Signatory 1 Name"
                    className="w-full p-2 rounded-lg border border-stone-200 text-xs bg-white"
                  />
                  <input
                    type="text"
                    value={signatory1Title}
                    onChange={(e) => setSignatory1Title(e.target.value)}
                    placeholder="Signatory 1 Title"
                    className="w-full p-2 rounded-lg border border-stone-200 text-xs bg-white"
                  />
                </div>

                <div className="space-y-2 p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-[11px] font-bold text-stone-600">Right Signatory (HOD / Dean)</span>
                  <input
                    type="text"
                    value={signatory2Name}
                    onChange={(e) => setSignatory2Name(e.target.value)}
                    placeholder="Signatory 2 Name"
                    className="w-full p-2 rounded-lg border border-stone-200 text-xs bg-white"
                  />
                  <input
                    type="text"
                    value={signatory2Title}
                    onChange={(e) => setSignatory2Title(e.target.value)}
                    placeholder="Signatory 2 Title"
                    className="w-full p-2 rounded-lg border border-stone-200 text-xs bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: REVIEW & PUBLISH */}
        {step === 7 && (
          <div className="space-y-5">
            <h3 className="text-base font-bold text-stone-900">7. Review Event Details &amp; Publish</h3>

            <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3 text-xs">
              <div className="flex justify-between border-b border-stone-200 pb-2">
                <span className="font-semibold text-stone-500">Event Title:</span>
                <span className="font-bold text-stone-900">{title || `${themeName} Challenge`}</span>
              </div>
              <div className="flex justify-between border-b border-stone-200 pb-2">
                <span className="font-semibold text-stone-500">Theme:</span>
                <span className="font-bold text-emerald-700">{themeName}</span>
              </div>
              <div className="flex justify-between border-b border-stone-200 pb-2">
                <span className="font-semibold text-stone-500">Team Size:</span>
                <span className="font-bold">{minTeamSize} to {maxTeamSize} Members</span>
              </div>
              <div className="flex justify-between border-b border-stone-200 pb-2">
                <span className="font-semibold text-stone-500">Entry Fee:</span>
                <span className="font-bold">{isPaid ? `₹${feeAmount} (${feeType})` : 'Free Entry'}</span>
              </div>
              <div className="flex justify-between border-b border-stone-200 pb-2">
                <span className="font-semibold text-stone-500">Certificate Format:</span>
                <span className="font-bold text-blue-700">
                  {certTemplateMode === 'photo_template'
                    ? '📸 Uploaded ChatGPT Photo Template'
                    : certTemplateMode === 'chatgpt_custom'
                    ? '💻 Custom ChatGPT HTML/CSS Template'
                    : '✨ Automatic Dynamic Theme Engine'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-stone-500">Signatories:</span>
                <span>{signatory1Name} &amp; {signatory2Name}</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-stone-100">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((step - 1) as any)}
              className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-semibold hover:bg-stone-50 transition-colors cursor-pointer"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 7 ? (
            <button
              type="button"
              onClick={() => setStep((step + 1) as any)}
              className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCreateSubmit}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Publish Themed Event Now</span>
            </button>
          )}
        </div>
      </div>

      {/* SUCCESS CONFIRMATION MODAL */}
      {showSuccessModal && createdEvent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
                <Sparkles className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-stone-900">
                🎉 Event Successfully Published!
              </h2>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Your event <strong className="text-stone-800">“{createdEvent.title}”</strong> has been published with the <strong className="text-emerald-700">{createdEvent.theme.themeName}</strong> theme.
              </p>
            </div>

            {/* Preview Card */}
            <div className="rounded-2xl overflow-hidden border border-stone-200 bg-stone-950 shadow-md">
              <div className="relative aspect-[21/8]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={createdEvent.theme.bannerUrl || '/images/theme-tech.jpg'}
                  alt={createdEvent.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                  <div>
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                      style={{
                        backgroundColor: createdEvent.theme.primaryColor,
                        color: createdEvent.theme.backgroundColor,
                      }}
                    >
                      Theme: {createdEvent.theme.themeName}
                    </span>
                    <p className="text-white text-sm font-bold truncate mt-1">
                      {createdEvent.title}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification & Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => router.push(`/events/${createdEvent.id}`)}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <span>View Live Themed Event Page →</span>
              </button>

              <button
                type="button"
                onClick={() => router.push('/events')}
                className="w-full py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Check on Explore Events Page (Verify Live)</span>
              </button>

              <button
                type="button"
                onClick={() => router.push('/organizer/dashboard')}
                className="w-full py-2 px-4 rounded-xl text-stone-500 hover:text-stone-800 text-xs font-medium transition-all cursor-pointer"
              >
                Go to Organizer Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
