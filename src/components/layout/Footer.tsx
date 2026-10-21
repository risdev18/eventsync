'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Shield, Award, Terminal, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-stone-800">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Event<span className="text-emerald-400">Ease</span>
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Smart Centralized College Event Management Platform with Dynamic Theme Engine, UPI payment verification, and automated certificate generation.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <Shield className="w-4 h-4" />
              <span>Verified Student Capstone 2026</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <Link href="/events" className="hover:text-emerald-400 transition-colors">
                  Explore All Events
                </Link>
              </li>
              <li>
                <Link href="/branches" className="hover:text-emerald-400 transition-colors">
                  Branch Councils
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-emerald-400 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/verify-certificate" className="hover:text-emerald-400 transition-colors">
                  Public Certificate Verification
                </Link>
              </li>
            </ul>
          </div>

          {/* Branch Hackathons */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Themed Events</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <Link href="/events/event-it-hackathon" className="hover:text-amber-400 transition-colors">
                  IT Hackathon (Harry Potter)
                </Link>
              </li>
              <li>
                <Link href="/events/event-aml-hackathon" className="hover:text-green-400 transition-colors">
                  AML Hackathon (Subway Suppers)
                </Link>
              </li>
              <li>
                <Link href="/events/event-cs-hackathon" className="hover:text-cyan-400 transition-colors">
                  CS Hackathon (Tech Innovation)
                </Link>
              </li>
              <li>
                <Link href="/events/event-pushpa-fest" className="hover:text-red-400 transition-colors">
                  Mechanical Fest (Pushpa Wildfire)
                </Link>
              </li>
            </ul>
          </div>

          {/* Access & Verification */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Access Portals</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <Link href="/student/dashboard" className="hover:text-emerald-400 transition-colors">
                  Student Dashboard
                </Link>
              </li>
              <li>
                <Link href="/organizer/dashboard" className="hover:text-emerald-400 transition-colors">
                  Organizer Dashboard
                </Link>
              </li>
              <li>
                <Link href="/admin/dashboard" className="hover:text-emerald-400 transition-colors">
                  Super Admin Console
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-stone-300 transition-colors">
                  Privacy Policy & Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© 2026 EventEase — College Event Management System. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with Next.js, Supabase & Tailwind CSS for Final Engineering Capstone.
          </p>
        </div>
      </div>
    </footer>
  );
}
