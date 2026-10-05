import React, { useState, useContext } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Crest from '../components/ui/Crest';
import Icon from '../components/ui/Icon';
import BrandLogo from '../components/ui/BrandLogo';

const DEMO_ACCOUNTS = [
  { label: 'Admin', role: 'ADMIN', user: 'admin', pass: 'admin123', icon: 'shield_person' },
  { label: 'Head of Staff', role: 'HEAD_OF_ACADEMIC', user: 'head_academic', pass: 'academic123', icon: 'military_tech' },
  { label: 'Teacher', role: 'TEACHER', user: 'teacher1', pass: 'teacher123', icon: 'school' },
  { label: 'Student', role: 'STUDENT', user: 'student1', pass: 'student123', icon: 'face' },
  { label: 'Parent', role: 'PARENT', user: 'parent1', pass: 'parent123', icon: 'family_restroom' },
];

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const success = await login(username.trim(), password);
    setSubmitting(false);
    if (success) {
      navigate('/');
    } else {
      setError('Invalid username or password');
    }
  };

  const fillCredentials = (acc) => {
    setUsername(acc.user);
    setPassword(acc.pass);
    setError('');
  };

  return (
    <div className="relative h-dvh w-full flex overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* ───────────────────────────────────────────────────────────
          LEFT COLUMN: Sri Lankan Students Photo with Fade Effect
          ─────────────────────────────────────────────────────────── */}
      <div className="relative hidden lg:flex lg:w-1/2 xl:w-7/12 flex-col justify-between p-10 xl:p-14 overflow-hidden select-none">
        {/* Full-bleed Authentic Photo of Sri Lankan Students */}
        <img
          src="/images/schoolstudents.jpg"
          alt="Sri Lankan Students at Wycherley International School"
          className="absolute inset-0 h-full w-full object-cover object-[center_30%] scale-[1.02] transition-transform duration-1000 ease-out hover:scale-100"
        />

        {/* 1. Base dark tint overlay */}
        <div className="absolute inset-0 bg-slate-950/40 mix-blend-multiply pointer-events-none" />

        {/* 2. Vertical top & bottom vignette for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-slate-950/80 pointer-events-none" />

        {/* 3. Primary brand color wash */}
        <div className="absolute inset-0 bg-indigo-950/30 mix-blend-color-burn pointer-events-none" />

        {/* 4. THE HORIZONTAL FADE: Smoothly dissolves the image into the login column on the right */}
        <div className="absolute inset-y-0 right-0 w-2/3 bg-gradient-to-r from-transparent via-slate-950/75 to-slate-950 pointer-events-none" />

        {/* Top Header on Left Panel */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3.5 rounded-2xl bg-slate-900/60 p-3 pr-5 backdrop-blur-md border border-white/10 shadow-lg">
            <BrandLogo compact subtitle="Wycherley Gampaha" />
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3.5 py-1 text-label-sm font-semibold tracking-wide text-emerald-300 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Academic Portal
          </span>
        </div>

        {/* Bottom Hero Narrative on Left Panel */}
        <div className="relative z-10 max-w-xl space-y-5 animate-fade-up">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-lg bg-indigo-500/20 px-3 py-1 text-label-sm font-medium text-indigo-300 border border-indigo-400/20">
              <Icon name="verified" size={15} className="text-indigo-400" />
              Wycherley International School · Gampaha
            </div>
            <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight drop-shadow-md">
              Nurturing Global Minds, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-sky-300 to-emerald-300">
                Grounded in Heritage.
              </span>
            </h1>
            <p className="text-body-md text-slate-300/90 leading-relaxed font-normal drop-shadow">
              Enterprise digital management for students, academic faculty, and parents — featuring conflict-free timetabling, digital attendance, transparent fee tracking, and an AI Study Buddy.
            </p>
          </div>

          {/* Quick Pillar Badges */}
          <div className="flex flex-wrap gap-2.5 pt-1">
            <div className="flex items-center gap-2 rounded-xl bg-slate-900/70 border border-white/10 px-3.5 py-2 backdrop-blur-md text-slate-200 text-body-sm shadow">
              <Icon name="school" size={18} className="text-amber-400" />
              <span>Student Lifecycle & Grades</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-slate-900/70 border border-white/10 px-3.5 py-2 backdrop-blur-md text-slate-200 text-body-sm shadow">
              <Icon name="calendar_month" size={18} className="text-sky-400" />
              <span>Timetable Matrix</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-slate-900/70 border border-white/10 px-3.5 py-2 backdrop-blur-md text-slate-200 text-body-sm shadow">
              <Icon name="smart_toy" size={18} className="text-emerald-400" />
              <span>AI Study Buddy</span>
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────
          RIGHT COLUMN: Login Box in Split View
          ─────────────────────────────────────────────────────────── */}
      <div className="no-scrollbar relative flex flex-1 flex-col justify-between h-full overflow-y-auto overflow-x-hidden px-6 py-6 sm:px-10 lg:px-12 lg:py-8 xl:px-16 bg-slate-950 z-10">
        {/* Subtle Ambient Glow Effects behind Login Box (clipped so they never cause scrolling) */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-primary-container/20 blur-3xl animate-float" />
          <div className="absolute -left-20 bottom-10 h-72 w-72 rounded-full bg-secondary-container/15 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>

        {/* Mobile Header (Shown on small screens where left photo is hidden) */}
        <div className="relative lg:hidden flex items-center justify-between pb-6 border-b border-white/10">
          <BrandLogo compact subtitle="Wycherley Gampaha" />
          <span className="text-label-sm font-medium text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            SIMS Portal
          </span>
        </div>

        {/* Main Login Card Centered Vertically */}
        <div className="relative my-auto w-full max-w-md mx-auto py-4">
          <div className="relative animate-scale-in rounded-2xl border border-white/10 bg-slate-900/85 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
            {/* Header / Crest */}
            <div className="mb-5 text-center">
              <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-600/15 border border-indigo-400/20 shadow-inner mb-3">
                <Crest className="h-12 w-12 transition-transform duration-500 hover:rotate-6 hover:scale-110" />
              </div>
              <h2 className="text-headline-md sm:text-headline-lg font-bold tracking-tight text-white">
                Sign in to SIMS
              </h2>
              <p className="mt-1 text-body-sm text-slate-400">
                Wycherley International School · Gampaha
              </p>
            </div>

            {/* Error Notification */}
            {error && (
              <div
                role="alert"
                className="mb-5 flex items-center gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-body-sm text-rose-300 animate-fade-in"
              >
                <Icon name="error" size={18} className="text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="username"
                  className="block text-label-md font-medium text-slate-300 mb-1.5"
                >
                  Username or Student Number
                </label>
                <div className="relative">
                  <Icon
                    name="person"
                    size={18}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="username"
                    type="text"
                    required
                    autoComplete="username"
                    placeholder="e.g. admin, student1, parent1"
                    className="block w-full rounded-xl border border-slate-700/80 bg-slate-950/60 py-2.5 pl-10 pr-3 text-body-md text-white placeholder:text-slate-500 transition-all focus:border-indigo-400 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="password"
                    className="block text-label-md font-medium text-slate-300"
                  >
                    Password
                  </label>
                  <span className="text-[11px] text-slate-500">Default demo: role123</span>
                </div>
                <div className="relative">
                  <Icon
                    name="lock"
                    size={18}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="block w-full rounded-xl border border-slate-700/80 bg-slate-950/60 py-2.5 pl-10 pr-10 text-body-md text-white placeholder:text-slate-500 transition-all focus:border-indigo-400 focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition-colors hover:text-white"
                  >
                    <Icon name={showPassword ? 'visibility_off' : 'visibility'} size={18} />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 py-3 px-4 text-label-lg font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all hover:-translate-y-0.5 hover:from-indigo-500 hover:to-indigo-600 hover:shadow-indigo-600/40 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-950 active:translate-y-0 disabled:cursor-wait disabled:opacity-70"
              >
                {submitting ? 'Authenticating…' : 'Sign In'}
                <Icon
                  name={submitting ? 'progress_activity' : 'arrow_forward'}
                  size={18}
                  className={submitting ? 'animate-spin' : 'transition-transform group-hover:translate-x-1'}
                />
              </button>
            </form>

            {/* Quick Demo Credentials Autofill */}
            <div className="mt-6 border-t border-slate-800 pt-5">
              <div className="mb-2.5 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Quick Demo Accounts
                </span>
                <span className="text-[11px] text-slate-500">Click to autofill</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => fillCredentials(acc)}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950/50 px-2.5 py-1.5 text-left text-label-sm text-slate-300 transition-all hover:border-indigo-500/50 hover:bg-indigo-600/15 hover:text-white"
                    title={`Login as ${acc.user} (${acc.role})`}
                  >
                    <Icon name={acc.icon} size={15} className="text-indigo-400 shrink-0" />
                    <span className="truncate">{acc.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative pt-4 text-center text-label-sm text-slate-500">
          <p>© 2026 Wycherley International School, Gampaha · SIMS v2.0</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
