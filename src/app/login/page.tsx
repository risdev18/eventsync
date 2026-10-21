'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store/useStore';
import { DemoRoleSwitcher } from '@/components/layout/DemoRoleSwitcher';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import {
  Calendar,
  Lock,
  Mail,
  UserCheck,
  GraduationCap,
  Shield,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { switchUser, users } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleDemoLogin = (userId: string, role: string) => {
    switchUser(userId);
    if (role === 'admin') router.push('/admin/dashboard');
    else if (role === 'organizer') router.push('/organizer/dashboard');
    else router.push('/student/dashboard');
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (matched) {
      handleDemoLogin(matched.id, matched.role);
    } else {
      // Default to student
      handleDemoLogin('user-riya', 'student');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans">
      <DemoRoleSwitcher />
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xl max-w-md w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
              <Calendar className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight">Sign In to EventEase</h1>
            <p className="text-xs text-stone-500">
              Access your student dashboard, branch organizer console, or administrative portal.
            </p>
          </div>

          {/* Quick 1-Click Demo Login Personas */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Instant 1-Click Capstone Demo Sign-In</span>
            </div>

            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => handleDemoLogin('user-riya', 'student')}
                className="w-full p-2.5 rounded-xl border border-stone-200 bg-white hover:border-emerald-500 hover:bg-emerald-50/50 flex items-center justify-between text-xs transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2 text-left">
                  <GraduationCap className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-bold text-stone-900">Student: Riya Sharma</p>
                    <p className="text-[10px] text-stone-400">Computer Science • 2nd Year</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('user-organizer-it', 'organizer')}
                className="w-full p-2.5 rounded-xl border border-stone-200 bg-white hover:border-amber-500 hover:bg-amber-50/50 flex items-center justify-between text-xs transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2 text-left">
                  <UserCheck className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <p className="font-bold text-stone-900">Organizer: Prof. Ananya Roy</p>
                    <p className="text-[10px] text-stone-400">IT Branch Council Lead</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('user-admin', 'admin')}
                className="w-full p-2.5 rounded-xl border border-stone-200 bg-white hover:border-purple-500 hover:bg-purple-50/50 flex items-center justify-between text-xs transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2 text-left">
                  <Shield className="w-4 h-4 text-purple-600 shrink-0" />
                  <div>
                    <p className="font-bold text-stone-900">Super Admin: Dr. Rajesh Verma</p>
                    <p className="text-[10px] text-stone-400">Dean of Student Affairs</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-stone-200 w-full" />
            <span className="bg-white px-3 text-[10px] uppercase font-bold text-stone-400">
              Or with credentials
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleCustomLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700">College Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@college.edu"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 text-xs outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-stone-700">Password</label>
                <Link href="/login" className="text-[10px] text-emerald-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 text-xs outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Sign In
            </button>
          </form>

          <p className="text-center text-xs text-stone-500">
            Don&apos;t have an account yet?{' '}
            <Link href="/signup" className="text-emerald-600 font-bold hover:underline">
              Register as Student
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
