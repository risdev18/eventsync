import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { Suspense } from 'react';


export const metadata: Metadata = {
  title: "EventEase — Smart College Event Management",
  description:
    "Centralized college platform for branch hackathons, technical symposiums, dynamic event theme engine, UPI QR payment verification, and automated certificate generation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window === 'undefined') return;
                var clean = function(el) {
                  if (!el || !el.removeAttribute) return;
                  if (el.hasAttribute('bis_skin_checked')) el.removeAttribute('bis_skin_checked');
                  if (el.hasAttribute('bis_register')) el.removeAttribute('bis_register');
                  var attrs = el.attributes;
                  if (attrs) {
                    for (var i = attrs.length - 1; i >= 0; i--) {
                      var name = attrs[i].name;
                      if (name && (name.indexOf('fdprocessedid') === 0 || name === 'bis_skin_checked')) {
                        el.removeAttribute(name);
                      }
                    }
                  }
                };
                try {
                  var observer = new MutationObserver(function(mutations) {
                    for (var i = 0; i < mutations.length; i++) {
                      var m = mutations[i];
                      if (m.type === 'attributes') {
                        clean(m.target);
                      } else if (m.type === 'childList') {
                        for (var j = 0; j < m.addedNodes.length; j++) {
                          var node = m.addedNodes[j];
                          if (node.nodeType === 1) {
                            clean(node);
                            if (node.querySelectorAll) {
                              var kids = node.querySelectorAll('*');
                              for (var k = 0; k < kids.length; k++) {
                                clean(kids[k]);
                              }
                            }
                          }
                        }
                      }
                    }
                  });
                  observer.observe(document.documentElement, {
                    attributes: true,
                    subtree: true,
                    childList: true,
                    attributeFilter: ['bis_skin_checked', 'bis_register', 'fdprocessedid']
                  });
                  window.addEventListener('load', function() {
                    setTimeout(function() { observer.disconnect(); }, 4000);
                  });
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900" suppressHydrationWarning>
        <Suspense fallback={<div className="min-h-screen bg-stone-50 flex items-center justify-center text-xs text-stone-400">Loading EventEase...</div>}>
          {children}
        </Suspense>
      </body>
    </html>
  );
}
