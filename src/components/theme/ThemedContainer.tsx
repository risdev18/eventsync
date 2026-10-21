'use client';

import React from 'react';
import { EventTheme } from '@/lib/types';

interface ThemedContainerProps {
  theme?: EventTheme;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function ThemedContainer({ theme, children, className = '', style = {} }: ThemedContainerProps) {
  if (!theme) {
    return <div className={`event-default-theme ${className}`} style={style}>{children}</div>;
  }

  const fontClass =
    theme.fontFamily === 'serif'
      ? 'font-serif'
      : theme.fontFamily === 'mono'
      ? 'font-mono'
      : theme.fontFamily === 'orbitron'
      ? 'tracking-wide font-sans'
      : theme.fontFamily === 'rustic'
      ? 'font-serif tracking-tight'
      : 'font-sans';

  const dynamicStyles = {
    '--evt-primary': theme.primaryColor,
    '--evt-secondary': theme.secondaryColor,
    '--evt-bg': theme.backgroundColor,
    '--evt-surface': theme.surfaceColor,
    '--evt-text': theme.textColor,
    '--evt-accent': theme.accentColor,
    '--evt-border': theme.certificateBorderColor || theme.primaryColor,
    backgroundColor: theme.backgroundColor,
    color: theme.textColor,
    ...style,
  } as React.CSSProperties;

  const bgPhoto = theme.bannerUrl || theme.posterUrl;

  return (
    <div
      className={`themed-event-wrapper relative min-h-screen transition-colors duration-300 ${fontClass} ${className}`}
      style={dynamicStyles}
    >
      {/* Dynamic Background Image Backdrop with Dark Scrim */}
      {bgPhoto && (
        <div
          className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center opacity-15 mix-blend-luminosity filter blur-[1px] scale-105 transition-all"
          style={{ backgroundImage: `url(${bgPhoto})` }}
          aria-hidden="true"
        />
      )}

      {/* Atmospheric Radial Gradient Glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-30"
        style={{
          background: `radial-gradient(circle at 50% 10%, ${theme.primaryColor} 0%, transparent 65%), radial-gradient(circle at 80% 85%, ${theme.secondaryColor} 0%, transparent 60%)`,
        }}
        aria-hidden="true"
      />

      {/* Foreground Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
