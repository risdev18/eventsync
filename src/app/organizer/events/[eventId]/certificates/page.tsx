'use client';

import React, { useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/lib/store/useStore';
import { Certificate } from '@/lib/types';
import { CertificateRenderer } from '@/components/certificates/CertificateRenderer';
import { downloadCertificatePDF } from '@/components/certificates/CertificatePDFGenerator';
import { exportCertificatesZip } from '@/components/certificates/ZipExporter';
import {
  Award,
  Download,
  Archive,
  Eye,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Code2,
  FileCode,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Settings2,
  Upload,
  Image as ImageIcon,
  MoveVertical,
  Type,
  ShieldAlert,
} from 'lucide-react';
import {
  CHATGPT_PROMPT_SUGGESTION,
  CHATGPT_TEMPLATE_PRESETS,
  compileCertificateTemplate,
} from '@/lib/certificates/chatGptTemplates';

export default function OrganizerCertificatesHubPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const { events, certificates, generateParticipationCertificates, updateEventCertificateSettings, currentUser } = useStore();

  const event = events.find((e) => e.id === eventId || e.slug === eventId);
  const eventCerts = certificates.filter((c) => c.eventId === eventId);

  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [generateMsg, setGenerateMsg] = useState('');

  // Certificate Template Studio State
  const [showStudio, setShowStudio] = useState(false);
  const [templateMode, setTemplateMode] = useState<'automatic' | 'photo_template' | 'chatgpt_custom'>(
    event?.certificateSettings?.templateMode || 'photo_template'
  );

  // Photo Certificate Template State (Uploaded from ChatGPT / Canva / Computer)
  const [photoTemplateUrl, setPhotoTemplateUrl] = useState<string>(
    event?.certificateSettings?.photoTemplateUrl || '/images/cert-template-royal-gold.jpg'
  );
  const [photoTextColor, setPhotoTextColor] = useState<string>(
    event?.certificateSettings?.photoSettings?.textColor || '#0A0D17'
  );
  const [photoNamePositionY, setPhotoNamePositionY] = useState<number>(
    event?.certificateSettings?.photoSettings?.namePositionY ?? 48
  );
  const [photoNameFontSize, setPhotoNameFontSize] = useState<number>(
    event?.certificateSettings?.photoSettings?.nameFontSize ?? 34
  );
  const [photoFontFamily, setPhotoFontFamily] = useState<'serif' | 'sans' | 'orbitron' | 'rustic' | 'mono'>(
    event?.certificateSettings?.photoSettings?.fontFamily || 'serif'
  );
  const [photoShowQrCode, setPhotoShowQrCode] = useState<boolean>(
    event?.certificateSettings?.photoSettings?.showQrCode ?? true
  );
  const [photoQrPosition, setPhotoQrPosition] = useState<'bottom_right' | 'bottom_center' | 'bottom_left'>(
    event?.certificateSettings?.photoSettings?.qrPosition || 'bottom_right'
  );
  const [photoShowSignatures, setPhotoShowSignatures] = useState<boolean>(
    event?.certificateSettings?.photoSettings?.showSignatures ?? true
  );
  const [photoShowEventTitle, setPhotoShowEventTitle] = useState<boolean>(
    event?.certificateSettings?.photoSettings?.showEventTitle ?? true
  );
  const [certPhotoUploadSuccess, setCertPhotoUploadSuccess] = useState<boolean>(false);
  const certFileInputRef = useRef<HTMLInputElement>(null);

  const [customChatGPTTemplate, setCustomChatGPTTemplate] = useState<string>(
    event?.certificateSettings?.customChatGPTTemplate || CHATGPT_TEMPLATE_PRESETS.royal_gold.template
  );
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>('royal_gold');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  const handleCertPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WebP).');
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

  if (!event) {
    return <div className="p-8 text-center text-xs text-stone-500">Event not found.</div>;
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
          This event belongs to another branch ({event.branchId.replace('branch-', '').toUpperCase()}). As an {currentUser.branchId ? currentUser.branchId.replace('branch-', '').toUpperCase() : 'assigned'} faculty coordinator, you are only authorized to manage certificates for your own department.
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

  const handleBulkGenerate = () => {
    const res = generateParticipationCertificates(event.id);
    if (res.count > 0) {
      setGenerateMsg(`Generated ${res.count} new participation certificates for verified attendees!`);
    } else {
      setGenerateMsg('All eligible attendees already have participation certificates issued.');
    }
    setTimeout(() => setGenerateMsg(''), 4000);
  };

  const handleDownloadZip = async () => {
    if (eventCerts.length === 0) return;
    setIsExportingZip(true);
    try {
      await exportCertificatesZip(eventCerts, event.title);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExportingZip(false);
    }
  };

  const handleSaveCertificateTemplate = () => {
    updateEventCertificateSettings(
      event.id,
      {
        templateMode,
        photoTemplateUrl: templateMode === 'photo_template' ? photoTemplateUrl : undefined,
        photoSettings:
          templateMode === 'photo_template'
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
        customChatGPTTemplate: templateMode === 'chatgpt_custom' ? customChatGPTTemplate : undefined,
      },
      true
    );
    setSaveSuccessMsg(
      `Certificate format updated to ${
        templateMode === 'photo_template'
          ? 'Uploaded ChatGPT Photo Template'
          : templateMode === 'chatgpt_custom'
          ? 'Custom ChatGPT HTML/CSS Template'
          : 'Automatic Dynamic Theme'
      } and applied to all certificates!`
    );
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  const participationCerts = eventCerts.filter((c) => c.type === 'participation');
  const winnerCerts = eventCerts.filter((c) => c.type === 'winner');



  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
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
            <Award className="w-6 h-6 text-purple-600" />
            <span>Event Certificate Hub</span>
          </h1>
          <p className="text-xs text-stone-500">
            Event: <strong className="text-stone-800">{event.title}</strong> • Theme: <span className="font-semibold">{event.theme.themeName}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowStudio(!showStudio)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-purple-200 bg-purple-50 text-purple-900 hover:bg-purple-100 transition-all cursor-pointer"
          >
            <Settings2 className="w-3.5 h-3.5 text-purple-600" />
            <span>Certificate Template Studio</span>
            {showStudio ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleBulkGenerate}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Issue Attendee Certificates</span>
          </button>

          {eventCerts.length > 0 && (
            <button
              onClick={handleDownloadZip}
              disabled={isExportingZip}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-stone-900 hover:bg-stone-800 text-white shadow-sm transition-all cursor-pointer"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>{isExportingZip ? 'Packaging ZIP...' : 'Download All (ZIP)'}</span>
            </button>
          )}
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* CERTIFICATE FORMAT & DESIGN STUDIO DRAWER */}
      {showStudio && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-purple-600" />
                <span>Certificate Template Studio</span>
              </h3>
              <p className="text-xs text-stone-500">
                Choose between Automatic Dynamic Theme generation or a Custom ChatGPT Template.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSaveCertificateTemplate}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save &amp; Apply to All Certificates</span>
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* 1. Photo Template (Recommended - No Code!) */}
            <div
              onClick={() => setTemplateMode('photo_template')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-1.5 relative ${
                templateMode === 'photo_template'
                  ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                  : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-xs text-stone-900">ChatGPT Photo Template</span>
                </div>
                {templateMode === 'photo_template' ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                    Active
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                    No Code!
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-500">
                Upload any certificate template photo generated with ChatGPT or Canva. Student details and QR are stamped on top.
              </p>
            </div>

            {/* 2. Automatic Dynamic Theme */}
            <div
              onClick={() => setTemplateMode('automatic')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-1.5 ${
                templateMode === 'automatic'
                  ? 'border-emerald-600 bg-emerald-50/50 shadow-sm'
                  : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="font-bold text-xs text-stone-900">Automatic Dynamic Theme</span>
                </div>
                {templateMode === 'automatic' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                    Active
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-500">
                Automatically styles certificates matching {event.theme.themeName} theme colors with security QR codes and seals.
              </p>
            </div>

            {/* 3. Advanced HTML */}
            <div
              onClick={() => setTemplateMode('chatgpt_custom')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-1.5 ${
                templateMode === 'chatgpt_custom'
                  ? 'border-purple-600 bg-purple-50/50 shadow-sm'
                  : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-purple-600" />
                  <span className="font-bold text-xs text-stone-900">Advanced: HTML Code</span>
                </div>
                {templateMode === 'chatgpt_custom' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-600 text-white">
                    Active
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-500">
                For developers who want to paste raw HTML/CSS code strings from ChatGPT.
              </p>
            </div>
          </div>

          {/* 1. PHOTO-BASED TEMPLATE STUDIO (NO CODE!) */}
          {templateMode === 'photo_template' && (
            <div className="space-y-6 pt-2 animate-in fade-in">
              {/* Upload Section & Presets */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-blue-950 flex items-center gap-1.5 uppercase tracking-wider">
                      <Upload className="w-4 h-4 text-blue-600" />
                      <span>Upload Your ChatGPT Certificate Template Photo</span>
                    </h4>
                    <p className="text-xs text-blue-800 mt-0.5">
                      Upload an image/photo of a certificate template from ChatGPT (DALL-E) or Canva. No code required!
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
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
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
                          For securing 1st Place Winner in {event.title}
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
                            {event.certificateSettings?.signatories?.[0]?.name || 'Prof. Ananya Roy'}
                          </div>
                          <div className="h-px bg-current opacity-40 mx-auto my-0.5" />
                          <div
                            className="text-[8px] opacity-75"
                            style={{ color: photoTextColor }}
                          >
                            {event.certificateSettings?.signatories?.[0]?.title || 'Faculty Coordinator'}
                          </div>
                        </div>

                        <div className="text-center w-28 sm:w-32">
                          <div
                            className="font-serif italic text-[11px] sm:text-xs font-bold"
                            style={{ color: photoTextColor }}
                          >
                            {event.certificateSettings?.signatories?.[1]?.name || 'Dr. H. N. Suresh'}
                          </div>
                          <div className="h-px bg-current opacity-40 mx-auto my-0.5" />
                          <div
                            className="text-[8px] opacity-75"
                            style={{ color: photoTextColor }}
                          >
                            {event.certificateSettings?.signatories?.[1]?.title || 'Head of Department'}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. ADVANCED CHATGPT HTML/CSS TEMPLATE */}
          {templateMode === 'chatgpt_custom' && (
            <div className="space-y-4 pt-2">
              {/* Presets and Copy Prompt */}
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5 text-purple-600" />
                      ChatGPT Presets &amp; Prompt
                    </span>
                    <p className="text-[11px] text-purple-700">
                      Pick a ready-made ChatGPT template or copy the prompt to generate your own.
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

              {/* Code Textarea */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-stone-700">ChatGPT HTML / CSS Template Code:</label>
                  <span className="text-[10px] text-stone-400">
                    &#123;&#123;student_name&#125;&#125;, &#123;&#123;event_title&#125;&#125;, &#123;&#123;award_category&#125;&#125;, &#123;&#123;placement&#125;&#125;, &#123;&#123;qr_code&#125;&#125;
                  </span>
                </div>
                <textarea
                  rows={8}
                  value={customChatGPTTemplate}
                  onChange={(e) => setCustomChatGPTTemplate(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-200 text-xs font-mono bg-stone-900 text-stone-100 outline-none focus:border-purple-600 leading-relaxed"
                />
              </div>

              {/* Live Preview */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  Live ChatGPT Template Preview
                </span>
                <div className="p-3 bg-stone-100 rounded-2xl border border-stone-200">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: compileCertificateTemplate(customChatGPTTemplate, {
                        recipientName: 'Riya Sharma',
                        eventTitle: event.title,
                        branchName: event.branchId.replace('branch-', '').toUpperCase(),
                        awardCategory: 'Certificate of Achievement',
                        placementText: '1st Place Winner',
                        placement: 1,
                        teamName: 'Team ByteBites',
                        issueDate: new Date().toLocaleDateString(),
                        eventDate: `${new Date(event.startDate).toLocaleDateString()} - ${new Date(event.endDate).toLocaleDateString()}`,
                        certificateNumber: 'CERT-DEMO-2026-001',
                        collegeName: 'EventEase College of Engineering & Technology',
                        signatory1Name: event.certificateSettings.signatories[0]?.name || 'Faculty Coordinator',
                        signatory1Title: event.certificateSettings.signatories[0]?.title || 'Coordinator',
                        signatory2Name: event.certificateSettings.signatories[1]?.name || 'Head of Department',
                        signatory2Title: event.certificateSettings.signatories[1]?.title || 'HOD',
                        qrCodeUrl: '/images/upi-qr.png',
                        themePrimaryColor: event.theme.primaryColor,
                        themeBgColor: event.theme.backgroundColor,
                      }),
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {generateMsg && (
        <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-purple-600" />
          <span>{generateMsg}</span>
        </div>
      )}

      {/* Stats Counter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200">
          <p className="text-xs text-stone-500 uppercase font-semibold">Total Certificates Issued</p>
          <h3 className="text-2xl font-black text-stone-900 mt-1">{eventCerts.length}</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-stone-200">
          <p className="text-xs text-stone-500 uppercase font-semibold">Participation Awards</p>
          <h3 className="text-2xl font-black text-purple-600 mt-1">{participationCerts.length}</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-stone-200">
          <p className="text-xs text-stone-500 uppercase font-semibold">Winner Certificates</p>
          <h3 className="text-2xl font-black text-amber-600 mt-1">{winnerCerts.length}</h3>
        </div>
      </div>

      {/* Certificates Directory */}
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-stone-200">
          <h3 className="text-sm font-bold text-stone-900">
            Active Certificates for this Event ({eventCerts.length})
          </h3>
        </div>

        {eventCerts.length === 0 ? (
          <div className="p-12 text-center text-xs text-stone-400">
            No certificates have been issued yet. Click &ldquo;Issue Attendee Certificates&rdquo; or confirm winners in the Results tab.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Certificate Number</th>
                  <th className="p-3">Recipient Name</th>
                  <th className="p-3">Team</th>
                  <th className="p-3">Award Category</th>
                  <th className="p-3">Issued Date</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {eventCerts.map((cert) => (
                  <tr key={cert.id} className="hover:bg-stone-50">
                    <td className="p-3 font-mono font-bold text-stone-800">{cert.certificateNumber}</td>
                    <td className="p-3 font-semibold text-stone-900">{cert.recipientName}</td>
                    <td className="p-3 text-stone-600">{cert.teamName || 'Solo'}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          cert.type === 'winner'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {cert.awardCategory}
                      </span>
                    </td>
                    <td className="p-3 text-stone-500">{new Date(cert.issueDate).toLocaleDateString()}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedCert(cert)}
                          className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-700 cursor-pointer"
                          title="Preview"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => downloadCertificatePDF(cert)}
                          className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                          title="Download PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <Link
                          href={`/verify-certificate/${cert.certificateNumber}`}
                          className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-emerald-700"
                          title="Verify Certificate"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Preview */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-stone-900 rounded-3xl p-6 max-w-4xl w-full border border-stone-700 shadow-2xl relative">
            <CertificateRenderer
              certificate={selectedCert}
              onClose={() => setSelectedCert(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
