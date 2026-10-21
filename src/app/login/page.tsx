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
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { switchUser, users, verifySecurityPassword } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [hintMessage, setHintMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSelectPersona = (targetEmail: string, personaName: string, defaultCode: string) => {
    setEmail(targetEmail);
    setPassword('');
    setErrorMessage('');
    setHintMessage(`Selected: ${personaName}. Please enter password (default: ${defaultCode} or your custom password) below:`);
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both your institutional email and account password.');
      return;
    }

    const matched = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!matched) {
      setErrorMessage('No registered user found with this email address.');
      return;
    }

    const isPasswordValid = verifySecurityPassword(matched.id, password.trim());
    if (!isPasswordValid) {
      setErrorMessage('Access Denied: Incorrect password. Please try again.');
      return;
    }

    // Authenticated! Switch user and navigate to respective portal
    switchUser(matched.id);
    if (matched.role === 'admin') {
      router.push('/admin/dashboard');
    } else if (matched.role === 'organizer') {
      router.push('/organizer/dashboard');
    } else {
      router.push('/student/dashboard');
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
              Department faculty coordinators, college deans, and student participants sign in here.
            </p>
          </div>

          {/* Quick Select Persona Presets */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Select College Role &amp; Enter Password</span>
            </div>

            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() =>
                  handleSelectPersona('ananya.roy@college.edu', 'Prof. Ananya Roy (IT Faculty Coordinator)', 'it2026')
                }
                className="w-full p-2.5 rounded-xl border border-stone-200 bg-white hover:border-amber-500 hover:bg-amber-50/50 flex items-center justify-between text-xs transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2 text-left">
                  <UserCheck className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <p className="font-bold text-stone-900">IT Faculty: Prof. Ananya Roy</p>
                    <p className="text-[10px] text-stone-400">IT Branch Counselor • Password: it2026</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSelectPersona('rs.iyer@college.edu', 'Prof. R. S. Iyer (Data Science Lead)', 'ds2026')
                }
                className="w-full p-2.5 rounded-xl border border-stone-200 bg-white hover:border-blue-500 hover:bg-blue-50/50 flex items-center justify-between text-xs transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2 text-left">
                  <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <p className="font-bold text-stone-900">DS Faculty: Prof. R. S. Iyer</p>
                    <p className="text-[10px] text-stone-400">Data Science Datathon Lead • Password: ds2026</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSelectPersona('riya.sharma@college.edu', 'Riya Sharma (Student)', 'student2026')
                }
                className="w-full p-2.5 rounded-xl border border-stone-200 bg-white hover:border-emerald-500 hover:bg-emerald-50/50 flex items-center justify-between text-xs transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2 text-left">
                  <GraduationCap className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-bold text-stone-900">Student: Riya Sharma</p>
                    <p className="text-[10px] text-stone-400">CS 2nd Year • Password: student2026</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSelectPersona('admin@eventease.college.edu', 'Dr. Rajesh Verma (Super Admin / Dean)', 'admin2026')
                }
                className="w-full p-2.5 rounded-xl border border-stone-200 bg-white hover:border-purple-500 hover:bg-purple-50/50 flex items-center justify-between text-xs transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2 text-left">
                  <Shield className="w-4 h-4 text-purple-600 shrink-0" />
                  <div>
                    <p className="font-bold text-stone-900">Dean / Admin: Dr. Rajesh Verma</p>
                    <p className="text-[10px] text-stone-400">Dean of Student Affairs • Password: admin2026</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
              </button>
            </div>
          </div>

          {hintMessage && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
              {hintMessage}
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleCustomLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700">College Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMessage('');
                  }}
                  placeholder="name@college.edu"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 text-xs outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-stone-700">Password</label>
                <span className="text-[10px] text-stone-400">
                  Secured Authentication
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage('');
                  }}
                  placeholder="Enter your security password..."
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-stone-200 text-xs outline-none focus:border-emerald-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Sign In to Portal
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
