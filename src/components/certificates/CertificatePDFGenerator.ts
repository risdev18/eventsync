'use client';

import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { Certificate } from '@/lib/types';

async function getImageDataUrl(url: string): Promise<string> {
  if (url.startsWith('data:')) return url;
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/jpeg', 0.95));
        } else {
          resolve(url);
        }
      } catch {
        resolve(url);
      }
    };
    img.onerror = () => resolve(url);
    img.src = url;
  });
}

export async function generateCertificatePDF(cert: Certificate): Promise<jsPDF> {
  // A4 Landscape: 297mm x 210mm
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  // If this certificate has an uploaded photo template (from ChatGPT / Canva)
  if (cert.photoTemplateUrl) {
    try {
      const imgData = await getImageDataUrl(cert.photoTemplateUrl);
      doc.addImage(imgData, 'JPEG', 0, 0, width, height);

      const photoSettings = cert.photoSettings || {};
      const nameYPercent = (photoSettings.namePositionY || 48) / 100;
      const nameYMm = height * nameYPercent;
      const textColorHex = photoSettings.textColor || '#0A0D17';

      // Parse hex color
      const r = parseInt(textColorHex.slice(1, 3), 16) || 10;
      const g = parseInt(textColorHex.slice(3, 5), 16) || 13;
      const b = parseInt(textColorHex.slice(5, 7), 16) || 23;

      doc.setTextColor(r, g, b);
      doc.setFontSize(photoSettings.nameFontSize ? Math.round(photoSettings.nameFontSize * 0.72) : 26);
      doc.text(cert.recipientName, width / 2, nameYMm, { align: 'center' });

      if (photoSettings.showEventTitle !== false) {
        doc.setFontSize(10.5);
        const isWinner = cert.type === 'winner';
        const eventText = isWinner
          ? `For securing ${cert.placement ? (cert.placement === 1 ? '1st Place' : cert.placement === 2 ? '2nd Place' : '3rd Place') : 'Winner'} in ${cert.eventTitle}`
          : `For successful participation and contribution in ${cert.eventTitle}`;
        doc.text(eventText, width / 2, nameYMm + 8, { align: 'center' });
      }

      // Verification QR Code
      if (photoSettings.showQrCode !== false) {
        const verifyUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://eventease.college.edu'}/verify-certificate/${cert.certificateNumber}`;
        const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
          margin: 1,
          color: { dark: '#000000', light: '#FFFFFF' },
        });
        const qrX =
          photoSettings.qrPosition === 'bottom_left'
            ? 20
            : photoSettings.qrPosition === 'bottom_center'
            ? width / 2 - 10
            : width - 38;
        doc.addImage(qrDataUrl, 'PNG', qrX, height - 34, 18, 18);
        doc.setFontSize(6);
        doc.text(`ID: ${cert.certificateNumber}`, qrX + 9, height - 12, { align: 'center' });
      }

      // Signatures
      if (photoSettings.showSignatures !== false) {
        const sigY = height - 26;
        const sig1 = cert.signatories[0] || { name: 'Faculty Coordinator', title: 'Faculty Coordinator' };
        const sig2 = cert.signatories[1] || { name: 'Head of Department', title: 'Head of Department' };

        doc.setDrawColor(r, g, b);
        doc.setLineWidth(0.35);
        doc.line(25, sigY, 65, sigY);
        doc.setFontSize(8.5);
        doc.text(sig1.name, 45, sigY + 4.5, { align: 'center' });
        doc.setFontSize(6.5);
        doc.text(sig1.title, 45, sigY + 8, { align: 'center' });

        doc.line(width - 65, sigY, width - 25, sigY);
        doc.setFontSize(8.5);
        doc.text(sig2.name, width - 45, sigY + 4.5, { align: 'center' });
        doc.setFontSize(6.5);
        doc.text(sig2.title, width - 45, sigY + 8, { align: 'center' });
      }

      if (cert.isRevoked) {
        doc.setTextColor(220, 38, 38);
        doc.setFontSize(36);
        doc.text('REVOKED', width / 2, height / 2, { align: 'center', angle: 30 });
      }

      return doc;
    } catch (err) {
      console.warn('Falling back to procedural certificate PDF generation:', err);
    }
  }

  const theme = cert.theme;
  const isDark = true;
  const bgColor = theme.certificateBgColor || theme.backgroundColor || '#0A0D17';
  const borderColor = theme.certificateBorderColor || theme.primaryColor || '#D4AF37';
  const accentColor = theme.accentColor || '#F59E0B';

  // 1. Fill Background
  doc.setFillColor(bgColor);
  doc.rect(0, 0, width, height, 'F');

  // 2. Draw Decorative Outer Borders
  doc.setDrawColor(borderColor);
  doc.setLineWidth(1.8);
  doc.rect(8, 8, width - 16, height - 16);

  doc.setLineWidth(0.6);
  doc.rect(11, 11, width - 22, height - 22);

  // Corner ornamental accents
  const corners = [
    [11, 11],
    [width - 11, 11],
    [11, height - 11],
    [width - 11, height - 11],
  ];
  corners.forEach(([x, y]) => {
    doc.setFillColor(borderColor);
    doc.circle(x, y, 2.5, 'F');
  });

  // 3. College Header
  doc.setTextColor(200, 200, 210);
  doc.setFontSize(10);
  const collegeHeader = (cert.collegeName || 'College of Engineering & Technology').toUpperCase();
  doc.text(collegeHeader, width / 2, 23, { align: 'center' });

  doc.setFontSize(8);
  doc.setTextColor(160, 160, 175);
  doc.text(`Department of ${cert.branchName} • Annual Capstone Series`, width / 2, 28, { align: 'center' });

  // 4. Certificate Award Title
  const isWinner = cert.type === 'winner';
  doc.setTextColor(borderColor);
  doc.setFontSize(24);
  const awardTitle = isWinner ? 'CERTIFICATE OF ACHIEVEMENT' : 'CERTIFICATE OF PARTICIPATION';
  doc.text(awardTitle, width / 2, 44, { align: 'center' });

  // 5. Theme Tag Badge
  doc.setFontSize(9);
  doc.setTextColor(accentColor);
  doc.text(`• THEME: ${theme.themeName.toUpperCase()} •`, width / 2, 51, { align: 'center' });

  // 6. Presentation text
  doc.setFontSize(12);
  doc.setTextColor(190, 195, 205);
  doc.text('This is proudly presented to', width / 2, 63, { align: 'center' });

  // 7. Recipient Name
  doc.setFontSize(26);
  doc.setTextColor(255, 255, 255);
  doc.text(cert.recipientName, width / 2, 78, { align: 'center' });

  // Underline for recipient
  doc.setDrawColor(borderColor);
  doc.setLineWidth(0.5);
  doc.line(width / 2 - 45, 82, width / 2 + 45, 82);

  // 8. Body Text
  doc.setFontSize(11);
  doc.setTextColor(200, 205, 215);

  if (isWinner && cert.placement) {
    const placeWord = cert.placement === 1 ? '1st Position' : cert.placement === 2 ? '2nd Position' : '3rd Position';
    doc.text(`has distinguished themselves and secured the`, width / 2, 93, { align: 'center' });
    doc.setFontSize(14);
    doc.setTextColor(accentColor);
    doc.text(`${placeWord} (Winner)`, width / 2, 101, { align: 'center' });
    doc.setFontSize(11);
    doc.setTextColor(200, 205, 215);
    doc.text(`in the ${cert.eventTitle} organized by ${cert.branchName}`, width / 2, 109, { align: 'center' });
  } else {
    doc.text(
      `for active participation and demonstrating commendable technical innovation in`,
      width / 2,
      93,
      { align: 'center' }
    );
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text(cert.eventTitle, width / 2, 102, { align: 'center' });
  }

  // 9. Event Details / Dates
  doc.setFontSize(9);
  doc.setTextColor(160, 165, 175);
  doc.text(`Conducted: ${cert.eventDate}  |  Issued: ${new Date(cert.issueDate).toLocaleDateString()}`, width / 2, 122, {
    align: 'center',
  });

  // 10. Generate Verification QR Code
  try {
    const verifyUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://eventease.college.edu'}/verify-certificate/${cert.certificateNumber}`;
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
      margin: 1,
      color: { dark: '#000000', light: '#FFFFFF' },
    });

    // Draw white container for QR
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(width / 2 - 13, 132, 26, 26, 2, 2, 'F');
    doc.addImage(qrDataUrl, 'PNG', width / 2 - 12, 133, 24, 24);

    doc.setFontSize(7);
    doc.setTextColor(180, 185, 195);
    doc.text(`Scan to Verify Certificate Authenticity`, width / 2, 162, { align: 'center' });
    doc.text(`ID: ${cert.certificateNumber}`, width / 2, 166, { align: 'center' });
  } catch (err) {
    console.error('Failed to render certificate QR code:', err);
  }

  // 11. Signatures
  const leftSigX = 35;
  const rightSigX = width - 75;
  const sigY = 175;

  // Left Signatory (Faculty Coordinator)
  const sig1 = cert.signatories[0] || { name: 'Faculty Coordinator', title: 'Department Faculty Coordinator' };
  doc.setDrawColor(120, 125, 135);
  doc.setLineWidth(0.4);
  doc.line(leftSigX, sigY, leftSigX + 45, sigY);
  doc.setFontSize(9);
  doc.setTextColor(230, 230, 235);
  doc.text(sig1.name, leftSigX + 22.5, sigY + 5, { align: 'center' });
  doc.setFontSize(7.5);
  doc.setTextColor(150, 155, 165);
  doc.text(sig1.title, leftSigX + 22.5, sigY + 9, { align: 'center' });

  // Right Signatory (HOD / Dean)
  const sig2 = cert.signatories[1] || { name: 'Head of Department', title: 'Department Chair' };
  doc.line(rightSigX, sigY, rightSigX + 45, sigY);
  doc.setFontSize(9);
  doc.setTextColor(230, 230, 235);
  doc.text(sig2.name, rightSigX + 22.5, sigY + 5, { align: 'center' });
  doc.setFontSize(7.5);
  doc.setTextColor(150, 155, 165);
  doc.text(sig2.title, rightSigX + 22.5, sigY + 9, { align: 'center' });

  // 12. Revoked Stamp if revoked
  if (cert.isRevoked) {
    doc.setTextColor(220, 38, 38);
    doc.setFontSize(36);
    doc.text('REVOKED', width / 2, height / 2, { align: 'center', angle: 30 });
  }

  return doc;
}

export async function downloadCertificatePDF(cert: Certificate): Promise<void> {
  const doc = await generateCertificatePDF(cert);
  doc.save(`${cert.certificateNumber}_${cert.recipientName.replace(/\s+/g, '_')}.pdf`);
}
