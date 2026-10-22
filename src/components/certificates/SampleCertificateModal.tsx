'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CollegeEvent, Certificate } from '@/lib/types';
import { CertificateRenderer } from './CertificateRenderer';
import { formatDate } from '@/lib/utils/dateFormat';
import { Award, Sparkles, X, CheckCircle2, Trophy, ArrowRight, ShieldCheck } from 'lucide-react';

interface SampleCertificateModalProps {
  event: CollegeEvent;
  isOpen: boolean;
  onClose: () => void;
}

export function SampleCertificateModal({
  event,
  isOpen,
  onClose,
}: SampleCertificateModalProps) {
  const [certType, setCertType] = useState<'participation' | 'winner'>('participation');

  if (!isOpen) return null;

  const theme = event.theme;

  // Construct a realistic, beautiful sample certificate for this event
  const sampleCertificate: Certificate = {
    id: `sample-${event.id}-${certType}`,
    certificateNumber: `SAMPLE-${event.id.toUpperCase().replace('EVENT-', '')}-${certType === 'winner' ? 'WIN1' : 'PART'}`,
    eventId: event.id,
    eventTitle: event.title,
    branchName: event.branchId ? event.branchId.replace('branch-', '').toUpperCase() : 'CSE',
    recipientName: 'Riya Sharma (Student Sample)',
    recipientEmail: 'riya.sharma@college.edu',
    teamName: 'Team Phoenix',
    type: certType,
    awardCategory:
      certType === 'winner'
        ? 'Certificate of Achievement — 1st Position'
        : 'Certificate of Participation',
    placement: certType === 'winner' ? 1 : undefined,
    eventDate: `${formatDate(event.startDate)} - ${formatDate(event.endDate)}`,
    issueDate: new Date().toISOString(),
    qrVerificationCode: `VERIFY-SAMPLE-${event.id.toUpperCase()}`,
    signatories: event.certificateSettings?.signatories?.length
      ? event.certificateSettings.signatories
      : [
          { name: event.organizerName || 'Prof. Faculty Coordinator', title: 'Faculty Convener' },
          { name: 'Dr. S. K. Murthy', title: 'Principal & Dean' },
        ],
    isRevoked: false,
    theme: event.theme,
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="bg-stone-900 border border-stone-700/80 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Modal Top Header */}
        <div className="px-5 py-4 border-b border-stone-800 flex items-center justify-between bg-stone-950/70">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ backgroundColor: theme.primaryColor, color: theme.backgroundColor }}
            >
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm sm:text-base">
                  Sample Certificate Preview
                </h3>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-black"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  {theme.themeName}
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Official verifiable credential issued to attendees of {event.title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Certificate Type Switcher Banner */}
        <div className="px-5 py-3 bg-stone-900/90 border-b border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-stone-400 font-medium">Preview Style:</span>
            <div className="inline-flex rounded-xl bg-stone-950 p-1 border border-stone-800">
              <button
                type="button"
                onClick={() => setCertType('participation')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  certType === 'participation'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Participation
              </button>
              <button
                type="button"
                onClick={() => setCertType('winner')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  certType === 'winner'
                    ? 'bg-amber-500 text-stone-950 shadow-sm font-bold'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                1st Place Winner
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
            <ShieldCheck className="w-4 h-4" />
            <span>Includes Cryptographic QR Verification & Digital Signatures</span>
          </div>
        </div>

        {/* Certificate Render Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-950/40 flex items-center justify-center">
          <div className="w-full max-w-3xl transform scale-[0.88] sm:scale-100 origin-top sm:origin-center transition-transform">
            <CertificateRenderer certificate={sampleCertificate} showDownloadButton={false} />
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="px-5 py-3.5 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-stone-950/80">
          <p className="text-[11px] text-stone-400 text-center sm:text-left">
            Registered students automatically unlock this certificate once the organizer verifies venue check-in.
          </p>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl border border-stone-700 text-stone-300 hover:bg-stone-800 text-xs font-semibold cursor-pointer"
            >
              Close
            </button>
            <Link
              href={`/events/${event.id}/register`}
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg transition-transform hover:scale-[1.02]"
              style={{ backgroundColor: theme.primaryColor }}
            >
              <span>Register for this Event</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
