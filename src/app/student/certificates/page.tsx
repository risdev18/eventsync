'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store/useStore';
import { Certificate } from '@/lib/types';
import { CertificateRenderer } from '@/components/certificates/CertificateRenderer';
import { downloadCertificatePDF } from '@/components/certificates/CertificatePDFGenerator';
import { exportCertificatesZip } from '@/components/certificates/ZipExporter';
import { Award, Download, Eye, ShieldCheck, Archive, Share2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/dateFormat';

export default function StudentCertificatesPage() {
  const { currentUser, certificates } = useStore();
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [isExportingZip, setIsExportingZip] = useState(false);

  // Filter certificates belonging to current student
  const studentCerts = certificates.filter(
    (c) =>
      c.recipientId === currentUser.id ||
      c.recipientEmail.toLowerCase() === currentUser.email.toLowerCase() ||
      c.recipientName.toLowerCase().includes(currentUser.name.toLowerCase()) ||
      c.recipientName.toLowerCase().includes('bytebites') // Demo team matching
  );

  const handleDownloadAllZip = async () => {
    if (studentCerts.length === 0) return;
    setIsExportingZip(true);
    try {
      await exportCertificatesZip(studentCerts, `${currentUser.name}_All`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExportingZip(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-stone-900">My Certificates</h1>
          <p className="text-xs text-stone-500 mt-1">
            Official verifiable certificates generated dynamically using each event&apos;s custom theme.
          </p>
        </div>

        {studentCerts.length > 1 && (
          <button
            onClick={handleDownloadAllZip}
            disabled={isExportingZip}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-stone-900 hover:bg-stone-800 text-white shadow-sm transition-all cursor-pointer"
          >
            <Archive className="w-4 h-4" />
            <span>{isExportingZip ? 'Preparing ZIP...' : 'Download All as ZIP'}</span>
          </button>
        )}
      </div>

      {studentCerts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-3">
          <Award className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-base font-bold text-stone-800">No certificates earned yet</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Attend your registered events and get checked in at the entrance. After the event concludes or winners are confirmed, your official certificates will appear here.
          </p>
          <Link
            href="/events"
            className="inline-block px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs"
          >
            Explore Events
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {studentCerts.map((cert) => {
            const isWinner = cert.type === 'winner';
            const theme = cert.theme;

            return (
              <div
                key={cert.id}
                className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Header Tag with Theme colors */}
                <div
                  className="p-5 text-white flex items-center justify-between"
                  style={{ backgroundColor: theme.backgroundColor }}
                >
                  <div>
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                      style={{ backgroundColor: theme.primaryColor, color: theme.backgroundColor }}
                    >
                      {isWinner ? `Winner (${cert.placement} Place)` : 'Participation'}
                    </span>
                    <h3 className="text-base font-bold mt-1 text-white truncate max-w-xs">
                      {cert.eventTitle}
                    </h3>
                  </div>

                  <span className="text-xs font-semibold opacity-80">
                    Theme: {theme.themeName}
                  </span>
                </div>

                {/* Details */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <p className="text-xs text-stone-500">Issued to</p>
                    <p className="text-lg font-bold text-stone-900">{cert.recipientName}</p>
                    {cert.teamName && (
                      <p className="text-xs text-stone-600">Team: <strong>{cert.teamName}</strong></p>
                    )}
                    <p className="text-xs text-emerald-700 font-semibold">{cert.awardCategory}</p>
                  </div>

                  <div className="pt-2 border-t border-stone-100 space-y-1 text-xs text-stone-500">
                    <div className="flex justify-between">
                      <span>Certificate ID:</span>
                      <span className="font-mono font-bold text-stone-800">{cert.certificateNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Event Dates:</span>
                      <span>{cert.eventDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Issued Date:</span>
                      <span suppressHydrationWarning>{formatDate(cert.issueDate)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 flex items-center gap-2">
                    <button
                      onClick={() => setSelectedCert(cert)}
                      className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Preview
                    </button>

                    <button
                      onClick={() => downloadCertificatePDF(cert)}
                      className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download PDF
                    </button>

                    <Link
                      href={`/verify-certificate/${cert.certificateNumber}`}
                      className="p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100 border border-stone-200"
                      title="Public verification page"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Live Certificate Preview Modal */}
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
