'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Certificate } from '@/lib/types';
import { Award, Download, ShieldCheck, AlertTriangle, Sparkles, CheckCircle2, Code2, Image as ImageIcon } from 'lucide-react';
import { downloadCertificatePDF } from './CertificatePDFGenerator';
import { compileCertificateTemplate } from '@/lib/certificates/chatGptTemplates';

interface CertificateRendererProps {
  certificate: Certificate;
  onClose?: () => void;
  showDownloadButton?: boolean;
}

export function CertificateRenderer({
  certificate,
  onClose,
  showDownloadButton = true,
}: CertificateRendererProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);

  const theme = certificate.theme;
  const isWinner = certificate.type === 'winner';
  const themeImg = theme.bannerUrl || theme.posterUrl;
  const photoSettings = certificate.photoSettings || {};
  const isPhotoTemplate = !!certificate.photoTemplateUrl;

  useEffect(() => {
    const verifyUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/verify-certificate/${certificate.certificateNumber}`;
    QRCode.toDataURL(verifyUrl, {
      margin: 1,
      width: 180,
      color: { dark: '#0A0D17', light: '#FFFFFF' },
    })
      .then(setQrCodeUrl)
      .catch(console.error);
  }, [certificate.certificateNumber]);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadCertificatePDF(certificate);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDownloading(false);
    }
  };

  const badgeConfig =
    certificate.placement === 1
      ? {
          label: '1st Place Winner',
          gradient: 'from-amber-300 via-yellow-500 to-amber-700',
          ribbon: 'from-amber-600 to-yellow-700',
          ring: 'ring-amber-300/60',
          num: '1st',
        }
      : certificate.placement === 2
      ? {
          label: '2nd Place Winner',
          gradient: 'from-slate-200 via-slate-300 to-slate-500',
          ribbon: 'from-slate-600 to-slate-800',
          ring: 'ring-slate-300/60',
          num: '2nd',
        }
      : certificate.placement === 3
      ? {
          label: '3rd Place Winner',
          gradient: 'from-amber-600 via-amber-700 to-amber-900',
          ribbon: 'from-amber-800 to-stone-900',
          ring: 'ring-amber-500/60',
          num: '3rd',
        }
      : {
          label: 'Official Participant',
          gradient: 'from-emerald-400 via-teal-500 to-emerald-700',
          ribbon: 'from-emerald-700 to-teal-900',
          ring: 'ring-emerald-400/60',
          num: '★',
        };

  const compiledCustomHtml = certificate.customTemplateHtml
    ? compileCertificateTemplate(certificate.customTemplateHtml, {
        recipientName: certificate.recipientName,
        eventTitle: certificate.eventTitle,
        branchName: certificate.branchName,
        awardCategory: certificate.awardCategory,
        placementText: certificate.placement
          ? `${certificate.placement}${certificate.placement === 1 ? 'st' : certificate.placement === 2 ? 'nd' : 'rd'} Place Winner`
          : 'Official Participant',
        placement: certificate.placement,
        teamName: certificate.teamName,
        issueDate: new Date(certificate.issueDate).toLocaleDateString(),
        eventDate: certificate.eventDate,
        certificateNumber: certificate.certificateNumber,
        collegeName: certificate.collegeName || 'College of Engineering & Technology',
        signatory1Name: certificate.signatories[0]?.name || 'Prof. Ananya Roy',
        signatory1Title: certificate.signatories[0]?.title || 'Faculty Coordinator',
        signatory2Name: certificate.signatories[1]?.name || 'Dr. H. N. Suresh',
        signatory2Title: certificate.signatories[1]?.title || 'Head of Department',
        qrCodeUrl: qrCodeUrl,
        themePrimaryColor: theme.primaryColor,
        themeBgColor: theme.backgroundColor,
      })
    : null;

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-4xl mx-auto">
      {/* Format Badge Indicator */}
      <div className="w-full flex items-center justify-between px-1">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white border border-stone-200 text-stone-700 shadow-xs">
          {isPhotoTemplate ? (
            <>
              <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>Format: Uploaded ChatGPT Photo Template</span>
            </>
          ) : compiledCustomHtml ? (
            <>
              <Code2 className="w-3.5 h-3.5 text-purple-600" />
              <span>Format: Custom ChatGPT Template</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Format: Automatic Dynamic Theme Engine</span>
            </>
          )}
        </span>
      </div>

      {/* 1. PHOTO-BASED CERTIFICATE TEMPLATE (Uploaded from ChatGPT / Canva / Computer) */}
      {isPhotoTemplate ? (
        <div
          className="relative w-full aspect-[1.414/1] rounded-2xl shadow-2xl overflow-hidden select-none border-2 border-stone-300 dark:border-stone-700 bg-stone-900 bg-cover bg-center"
          style={{
            backgroundImage: `url(${certificate.photoTemplateUrl})`,
            fontFamily:
              photoSettings.fontFamily === 'serif'
                ? 'Times New Roman, Georgia, serif'
                : photoSettings.fontFamily === 'orbitron'
                ? 'Orbitron, monospace'
                : photoSettings.fontFamily === 'rustic'
                ? 'Impact, fantasy'
                : 'system-ui, -apple-system, sans-serif',
          }}
        >
          {/* Recipient Name Layer */}
          <div
            className="absolute left-0 right-0 text-center px-10 z-10 pointer-events-none"
            style={{
              top: `${photoSettings.namePositionY || 48}%`,
              transform: 'translateY(-50%)',
            }}
          >
            <h2
              className="font-extrabold tracking-wide uppercase drop-shadow-md select-text"
              style={{
                color: photoSettings.textColor || '#0A0D17',
                fontSize: `${photoSettings.nameFontSize || 34}px`,
                textShadow: '0 2px 4px rgba(0,0,0,0.15)',
              }}
            >
              {certificate.recipientName}
            </h2>

            {photoSettings.showEventTitle !== false && (
              <p
                className="text-xs sm:text-sm font-semibold max-w-xl mx-auto mt-1 opacity-90 drop-shadow"
                style={{ color: photoSettings.textColor || '#0A0D17' }}
              >
                {isWinner
                  ? `For securing ${badgeConfig.label} in ${certificate.eventTitle}`
                  : `For successful participation and technical contribution in ${certificate.eventTitle}`}
              </p>
            )}
          </div>

          {/* Verification QR Code */}
          {photoSettings.showQrCode !== false && qrCodeUrl && (
            <div
              className={`absolute z-10 flex flex-col items-center pointer-events-auto ${
                photoSettings.qrPosition === 'bottom_left'
                  ? 'bottom-6 left-8'
                  : photoSettings.qrPosition === 'bottom_center'
                  ? 'bottom-6 left-1/2 -translate-x-1/2'
                  : 'bottom-6 right-8'
              }`}
            >
              <div className="p-1 bg-white rounded shadow-md border border-stone-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrCodeUrl} alt="Verify QR" className="w-10 h-10 sm:w-12 sm:h-12" />
              </div>
              <span
                className="text-[8px] font-mono mt-0.5 opacity-80"
                style={{ color: photoSettings.textColor || '#0A0D17' }}
              >
                ID: {certificate.certificateNumber}
              </span>
            </div>
          )}

          {/* Signatures */}
          {photoSettings.showSignatures !== false && (
            <div className="absolute bottom-6 left-8 right-8 z-10 flex justify-between items-end pointer-events-none">
              <div className="text-center w-36">
                <div
                  className="font-serif italic text-xs sm:text-sm font-bold"
                  style={{ color: photoSettings.textColor || '#0A0D17' }}
                >
                  {certificate.signatories[0]?.name || 'Prof. Ananya Roy'}
                </div>
                <div className="h-px bg-current opacity-40 mx-auto my-0.5" />
                <div
                  className="text-[9px] opacity-75"
                  style={{ color: photoSettings.textColor || '#0A0D17' }}
                >
                  {certificate.signatories[0]?.title || 'Faculty Coordinator'}
                </div>
              </div>

              {photoSettings.qrPosition !== 'bottom_right' && (
                <div className="text-center w-36">
                  <div
                    className="font-serif italic text-xs sm:text-sm font-bold"
                    style={{ color: photoSettings.textColor || '#0A0D17' }}
                  >
                    {certificate.signatories[1]?.name || 'Dr. H. N. Suresh'}
                  </div>
                  <div className="h-px bg-current opacity-40 mx-auto my-0.5" />
                  <div
                    className="text-[9px] opacity-75"
                    style={{ color: photoSettings.textColor || '#0A0D17' }}
                  >
                    {certificate.signatories[1]?.title || 'Head of Department'}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Revocation Stamp Banner */}
          {certificate.isRevoked && (
            <div className="absolute inset-0 bg-red-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-red-100 z-30">
              <AlertTriangle className="w-16 h-16 text-red-400 mb-2 animate-bounce" />
              <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-widest text-red-400">
                Certificate Revoked
              </h2>
              <p className="text-xs sm:text-sm mt-2 max-w-md bg-red-900/40 p-3 rounded-xl border border-red-700 text-center">
                Reason: {certificate.revocationReason || 'Revoked by institution authority.'}
              </p>
            </div>
          )}
        </div>
      ) : compiledCustomHtml ? (
        <div className="relative w-full rounded-2xl shadow-2xl overflow-hidden border-2 border-stone-300 dark:border-stone-700 select-none">
          <div dangerouslySetInnerHTML={{ __html: compiledCustomHtml }} />

          {/* Revocation Banner */}
          {certificate.isRevoked && (
            <div className="absolute inset-0 bg-red-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-red-100 z-30">
              <AlertTriangle className="w-16 h-16 text-red-400 mb-2 animate-bounce" />
              <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-widest text-red-400">
                Certificate Revoked
              </h2>
              <p className="text-xs sm:text-sm mt-2 max-w-md bg-red-900/40 p-3 rounded-xl border border-red-700 text-center">
                Reason: {certificate.revocationReason || 'Revoked by institution authority.'}
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Otherwise render Built-in Thematic Certificate */
        <div
          className="relative w-full aspect-[1.414/1] rounded-2xl p-6 sm:p-10 shadow-2xl overflow-hidden select-none border-4 transition-all"
          style={{
            backgroundColor: theme.certificateBgColor || theme.backgroundColor || '#0A0D17',
            borderColor: theme.certificateBorderColor || theme.primaryColor || '#D4AF37',
            color: theme.textColor || '#F8FAFC',
          }}
        >
        {/* Themed Photo Watermark Texture in Certificate Body */}
        {themeImg && (
          <div
            className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center opacity-10 filter blur-[0.5px] scale-105"
            style={{ backgroundImage: `url(${themeImg})` }}
            aria-hidden="true"
          />
        )}

        {/* Ambient Radial Gradient Glow */}
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-25"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 25%, ${theme.primaryColor} 0%, transparent 70%)`,
          }}
          aria-hidden="true"
        />

        {/* Outer Guilloche-style Double Border */}
        <div
          className="absolute inset-3 sm:inset-5 border-2 rounded-xl pointer-events-none opacity-80"
          style={{ borderColor: theme.certificateBorderColor || theme.primaryColor }}
        />
        <div
          className="absolute inset-4 sm:inset-6 border border-dashed rounded-lg pointer-events-none opacity-40"
          style={{ borderColor: theme.accentColor || theme.primaryColor }}
        />

        {/* Corner Flourish Ornaments */}
        <div
          className="absolute top-4 left-4 sm:top-6 sm:left-6 w-5 h-5 border-t-2 border-l-2 pointer-events-none"
          style={{ borderColor: theme.primaryColor }}
        />
        <div
          className="absolute top-4 right-4 sm:top-6 sm:right-6 w-5 h-5 border-t-2 border-r-2 pointer-events-none"
          style={{ borderColor: theme.primaryColor }}
        />
        <div
          className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 w-5 h-5 border-b-2 border-l-2 pointer-events-none"
          style={{ borderColor: theme.primaryColor }}
        />
        <div
          className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 w-5 h-5 border-b-2 border-r-2 pointer-events-none"
          style={{ borderColor: theme.primaryColor }}
        />

        {/* Certificate Content Container */}
        <div className="relative z-10 h-full flex flex-col justify-between text-center">
          {/* Header */}
          <div>
            {/* Prominent College / University Name */}
            <div className="flex items-center justify-center gap-2 mb-1">
              <Award className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 text-amber-300" />
              <h2 className="text-sm sm:text-xl md:text-2xl font-black tracking-widest uppercase font-serif text-amber-200 drop-shadow">
                {certificate.collegeName || 'College of Engineering & Technology'}
              </h2>
            </div>
            <p className="text-[10px] sm:text-xs opacity-75 tracking-wider uppercase font-medium">
              Department of {certificate.branchName} • Annual Capstone Engineering Series 2026
            </p>

            <div className="mt-2 sm:mt-3">
              <h1
                className="text-xl sm:text-3xl md:text-4xl font-black uppercase tracking-wider font-serif"
                style={{ color: theme.primaryColor }}
              >
                {isWinner ? 'Certificate of Achievement' : 'Certificate of Participation'}
              </h1>
              <div
                className="w-48 sm:w-72 h-0.5 mx-auto mt-1 rounded-full opacity-80"
                style={{ backgroundColor: theme.primaryColor }}
              />
            </div>
          </div>

          {/* Presentation to Recipient */}
          <div className="my-auto py-2">
            <p className="text-[10px] sm:text-xs uppercase tracking-widest font-serif opacity-80 mb-1">
              This certificate is proudly presented to
            </p>
            <h3 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-2 font-serif drop-shadow-md">
              {certificate.recipientName}
            </h3>

            {/* Decorative Gold Divider */}
            <div className="flex items-center justify-center gap-2 max-w-xs mx-auto mb-2">
              <div
                className="h-0.5 flex-1 rounded-full opacity-70"
                style={{ backgroundColor: theme.primaryColor }}
              />
              <span className="text-xs" style={{ color: theme.primaryColor }}>✦</span>
              <div
                className="h-0.5 flex-1 rounded-full opacity-70"
                style={{ backgroundColor: theme.primaryColor }}
              />
            </div>

            {/* Official Certification Body Text Matching Collegiate Sample */}
            <p className="text-xs sm:text-sm max-w-xl mx-auto opacity-95 leading-relaxed font-serif px-2">
              {isWinner ? (
                <>
                  for securing <strong className="text-amber-400 font-bold">{badgeConfig.label}</strong> in the{' '}
                  <strong className="text-white font-semibold">&ldquo;{certificate.eventTitle}&rdquo;</strong> during{' '}
                  {certificate.eventDate} at{' '}
                  <strong className="text-amber-200 font-bold underline decoration-amber-400/50 underline-offset-2">
                    {certificate.collegeName || 'College of Engineering & Technology'}
                  </strong>.
                </>
              ) : (
                <>
                  for participating in the{' '}
                  <strong className="text-white font-semibold">&ldquo;{certificate.eventTitle}&rdquo;</strong> during{' '}
                  {certificate.eventDate} at{' '}
                  <strong className="text-amber-200 font-bold underline decoration-amber-400/50 underline-offset-2">
                    {certificate.collegeName || 'College of Engineering & Technology'}
                  </strong>.
                </>
              )}
            </p>

            {/* Team ID & Theme Metadata Chips */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-3 text-[10px] sm:text-xs">
              <div className="px-3 py-0.5 rounded-md bg-white/10 backdrop-blur-md border border-white/15">
                <span className="opacity-70 font-mono">TEAM: </span>
                <span className="font-bold text-white">{certificate.teamName || 'Solo Participant'}</span>
              </div>
              <div className="px-3 py-0.5 rounded-md bg-white/10 backdrop-blur-md border border-white/15">
                <span className="opacity-70 font-mono">THEME: </span>
                <span className="font-bold" style={{ color: theme.primaryColor }}>
                  {theme.themeName}
                </span>
              </div>
            </div>
          </div>

          {/* Revocation Stamp Banner */}
          {certificate.isRevoked && (
            <div className="absolute inset-0 bg-red-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-red-100 z-30">
              <AlertTriangle className="w-16 h-16 text-red-400 mb-2 animate-bounce" />
              <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-widest text-red-400">
                Certificate Revoked
              </h2>
              <p className="text-xs sm:text-sm mt-2 max-w-md bg-red-900/40 p-3 rounded-xl border border-red-700">
                Reason: {certificate.revocationReason || 'Revoked by institution authority.'}
              </p>
            </div>
          )}

          {/* Footer Details: Signatures & QR Code */}
          <div className="pt-2 border-t border-white/10 flex items-end justify-between text-left">
            {/* Left Signatory (Faculty Coordinator) */}
            <div className="w-28 sm:w-48 text-center">
              <div className="font-serif italic text-xs sm:text-base text-amber-100 font-medium pb-0.5 select-none tracking-wide">
                {certificate.signatories[0]?.name || 'Prof. Ananya Roy'}
              </div>
              <div className="w-full h-px bg-white/25 mb-1" />
              <p className="text-[9px] sm:text-[10px] text-white/70 font-medium">
                {certificate.signatories[0]?.title || 'Faculty Coordinator'}
              </p>
            </div>

            {/* QR Code Verification in Center */}
            <div className="flex flex-col items-center text-center px-2">
              {qrCodeUrl && (
                <div className="p-1.5 bg-white rounded-lg shadow-md border border-stone-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrCodeUrl} alt="Certificate QR" className="w-12 h-12 sm:w-16 sm:h-16" />
                </div>
              )}
              <div className="flex items-center gap-1 mt-1 text-[8px] sm:text-[9px] text-white/80 font-mono">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>{certificate.certificateNumber}</span>
              </div>
            </div>

            {/* Right Signatory (Head of Department) */}
            <div className="w-28 sm:w-48 text-center">
              <div className="font-serif italic text-xs sm:text-base text-amber-100 font-medium pb-0.5 select-none tracking-wide">
                {certificate.signatories[1]?.name || 'Dr. H. N. Suresh'}
              </div>
              <div className="w-full h-px bg-white/25 mb-1" />
              <p className="text-[9px] sm:text-[10px] text-white/70 font-medium">
                {certificate.signatories[1]?.title || 'Head of Department'}
              </p>
            </div>
          </div>
        </div>
      </div>
    )}

      {/* Action Bar */}
      {showDownloadButton && (
        <div className="flex flex-wrap items-center gap-3 w-full justify-between px-2">
          <p className="text-xs text-stone-500">
            Conducted: {certificate.eventDate} • Issued: {new Date(certificate.issueDate).toLocaleDateString()}
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={isDownloading || certificate.isRevoked}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md disabled:opacity-50 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? 'Generating High-Res PDF...' : 'Download Official PDF Certificate'}</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all cursor-pointer"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
