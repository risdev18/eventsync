'use client';

export interface ExtractedPalette {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  accentColor: string;
  certificateBorderColor: string;
  certificateBgColor: string;
}

// Convert RGB to Hex
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Extract dominant colors from an image URL using HTML Canvas
export async function extractPaletteFromImage(imageUrl: string): Promise<ExtractedPalette> {
  return new Promise((resolve) => {
    let resolved = false;
    const safeResolve = (palette: ExtractedPalette) => {
      if (!resolved) {
        resolved = true;
        resolve(palette);
      }
    };

    // Safety timeout in case remote image fails silently
    const timeout = setTimeout(() => {
      safeResolve(getDefaultPalette());
    }, 4000);

    const img = new Image();
    if (!imageUrl.startsWith('data:')) {
      img.crossOrigin = 'Anonymous';
    }

    img.onload = () => {
      clearTimeout(timeout);
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(getDefaultPalette());
          return;
        }

        const width = (canvas.width = 100);
        const height = (canvas.height = 100);
        ctx.drawImage(img, 0, 0, width, height);

        const imgData = ctx.getImageData(0, 0, width, height).data;
        const colorBuckets: { [key: string]: { count: number; r: number; g: number; b: number } } = {};

        // Sample pixels with quantization (16x16 color binning)
        for (let i = 0; i < imgData.length; i += 16) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          const a = imgData[i + 3];

          if (a < 128) continue; // Skip transparent pixels

          // Skip completely blown-out whites and pitch blacks for primary
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
          if (brightness < 20 || brightness > 240) continue;

          // Quantize
          const qR = Math.floor(r / 32) * 32;
          const qG = Math.floor(g / 32) * 32;
          const qB = Math.floor(b / 32) * 32;
          const key = `${qR},${qG},${qB}`;

          if (!colorBuckets[key]) {
            colorBuckets[key] = { count: 0, r, g, b };
          }
          colorBuckets[key].count++;
        }

        const sorted = Object.values(colorBuckets).sort((a, b) => b.count - a.count);

        if (sorted.length === 0) {
          resolve(getDefaultPalette());
          return;
        }

        // Dominant most frequent color
        const top1 = sorted[0];
        const primaryHex = rgbToHex(top1.r, top1.g, top1.b);

        // Find a distinct secondary color
        let top2 = sorted[1] || sorted[0];
        for (let i = 1; i < sorted.length; i++) {
          const diff = Math.abs(sorted[i].r - top1.r) + Math.abs(sorted[i].g - top1.g) + Math.abs(sorted[i].b - top1.b);
          if (diff > 100) {
            top2 = sorted[i];
            break;
          }
        }
        const secondaryHex = rgbToHex(top2.r, top2.g, top2.b);

        // Compute deep background color derived from top1 hue
        const darkR = Math.max(8, Math.min(25, Math.floor(top1.r * 0.12)));
        const darkG = Math.max(8, Math.min(25, Math.floor(top1.g * 0.12)));
        const darkB = Math.max(12, Math.min(30, Math.floor(top1.b * 0.15)));
        const bgHex = rgbToHex(darkR, darkG, darkB);

        // Compute surface card color
        const surfR = Math.max(16, Math.min(45, Math.floor(top1.r * 0.22)));
        const surfG = Math.max(16, Math.min(45, Math.floor(top1.g * 0.22)));
        const surfB = Math.max(22, Math.min(50, Math.floor(top1.b * 0.25)));
        const surfHex = rgbToHex(surfR, surfG, surfB);

        safeResolve({
          primaryColor: primaryHex,
          secondaryColor: secondaryHex,
          backgroundColor: bgHex,
          surfaceColor: surfHex,
          textColor: '#F8FAFC',
          accentColor: secondaryHex,
          certificateBorderColor: primaryHex,
          certificateBgColor: bgHex,
        });
      } catch (err) {
        console.warn('Canvas color extraction fell back to default:', err);
        safeResolve(getDefaultPalette());
      }
    };

    img.onerror = () => {
      clearTimeout(timeout);
      safeResolve(getDefaultPalette());
    };

    img.src = imageUrl;
  });
}

export function getDefaultPalette(): ExtractedPalette {
  return {
    primaryColor: '#059669', // Emerald
    secondaryColor: '#10B981',
    backgroundColor: '#0F172A',
    surfaceColor: '#1E293B',
    textColor: '#F8FAFC',
    accentColor: '#34D399',
    certificateBorderColor: '#059669',
    certificateBgColor: '#0A121E',
  };
}

// Preset theme themes for instant one-click testing
export const THEME_PRESETS: { [key: string]: Partial<ExtractedPalette> & { name: string; font: 'sans' | 'serif' | 'mono' | 'orbitron' | 'rustic' } } = {
  harry_potter: {
    name: 'Harry Potter (Mystic Wizarding)',
    primaryColor: '#D4AF37',
    secondaryColor: '#8A2BE2',
    backgroundColor: '#0A0D17',
    surfaceColor: '#13182C',
    textColor: '#F8FAFC',
    accentColor: '#F59E0B',
    certificateBorderColor: '#D4AF37',
    certificateBgColor: '#0C0E1A',
    font: 'serif',
  },
  subway: {
    name: 'Subway Suppers (Fresh & Vibrant)',
    primaryColor: '#16A34A',
    secondaryColor: '#EAB308',
    backgroundColor: '#064E3B',
    surfaceColor: '#0F766E',
    textColor: '#FFFFFF',
    accentColor: '#F97316',
    certificateBorderColor: '#16A34A',
    certificateBgColor: '#0A3324',
    font: 'sans',
  },
  tech_innovation: {
    name: 'Tech Innovation (Cyberpunk Grid)',
    primaryColor: '#00F0FF',
    secondaryColor: '#E000FF',
    backgroundColor: '#050814',
    surfaceColor: '#0C1226',
    textColor: '#E2E8F0',
    accentColor: '#38BDF8',
    certificateBorderColor: '#00F0FF',
    certificateBgColor: '#070D1E',
    font: 'orbitron',
  },
  pushpa_wildfire: {
    name: 'Pushpa Wildfire (Fiery Red Sandalwood)',
    primaryColor: '#DC2626',
    secondaryColor: '#D97706',
    backgroundColor: '#180B09',
    surfaceColor: '#261310',
    textColor: '#FEF2F2',
    accentColor: '#F97316',
    certificateBorderColor: '#DC2626',
    certificateBgColor: '#1A0C0A',
    font: 'rustic',
  },
  neural_datathon: {
    name: 'Neural Datathon (Big Data & AI Championship)',
    primaryColor: '#06B6D4',
    secondaryColor: '#8B5CF6',
    backgroundColor: '#070814',
    surfaceColor: '#0E1328',
    textColor: '#F1F5F9',
    accentColor: '#38BDF8',
    certificateBorderColor: '#06B6D4',
    certificateBgColor: '#070A18',
    font: 'orbitron',
  },
};
