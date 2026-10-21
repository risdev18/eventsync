'use client';

import JSZip from 'jszip';
import { Certificate } from '@/lib/types';
import { generateCertificatePDF } from './CertificatePDFGenerator';

export async function exportCertificatesZip(certificates: Certificate[], eventTitle: string): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder(`${eventTitle.replace(/[^a-zA-Z0-9]/g, '_')}_Certificates`);

  for (const cert of certificates) {
    const doc = await generateCertificatePDF(cert);
    const pdfBlob = doc.output('blob');
    const filename = `${cert.certificateNumber}_${cert.recipientName.replace(/\s+/g, '_')}.pdf`;
    folder?.file(filename, pdfBlob);
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `${eventTitle.replace(/[^a-zA-Z0-9]/g, '_')}_Certificates.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
}
