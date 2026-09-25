import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  Mail, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  HardDrive, 
  KeyRound,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { Background3D } from '../common/Background3D';
import { signIn, signUp, quickDemoLogin } from '../../services/storage';

interface AuthScreenProps {
  onSuccess: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Mouse tilt effect state for 3D card
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - card.left - card.width / 2;
    const y = e.clientY - card.top - card.height / 2;
    // Limit rotation to ~10 deg
    setTilt({
      rx: -(y / (card.height / 2)) * 7,
      ry: (x / (card.width / 2)) * 7,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ rx: 0, ry: 0 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        await signIn(email, password, rememberMe);
        setSuccessMsg('Authentication verified. Decrypting environment...');
      } else {
        if (!name.trim()) throw new Error('Please enter your full name');
        if (password.length < 6) throw new Error('Password must be at least 6 characters');
        await signUp(name, email, password);
        setSuccessMsg('Account created successfully! Preparing dashboard...');
      }

      setTimeout(() => {
        setLoading(false);
        onSuccess();
      }, 700);
    } catch (err: unknown) {
      setLoading(false);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Authentication failed. Please verify credentials.');
      }
    }
  };

  const handleDemoLogin = () => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      quickDemoLogin();
      setLoading(false);
      onSuccess();
    }, 500);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSuccess(true);
    setTimeout(() => {
      setShowForgotModal(false);
      setForgotSuccess(false);
      setForgotEmail('');
    }, 2000);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 md:p-8 overflow-hidden bg-[#080b11]">
      {/* 3D Interactive Canvas & Parallax Starfield */}
      <Background3D />

      {/* Floating Decorative Glass Capsules */}
      <div className="absolute top-12 left-10 hidden lg:flex items-center gap-3 px-4 py-2.5 rounded-2xl glass-panel text-slate-300 text-xs font-mono border border-indigo-500/20 shadow-xl shadow-indigo-950/40 animate-float-slow">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>AES-256 GCM Zero-Knowledge Vault</span>
      </div>

      <div className="absolute bottom-12 left-12 hidden lg:flex items-center gap-3 px-4 py-2.5 rounded-2xl glass-panel text-slate-300 text-xs font-mono border border-cyan-500/20 shadow-xl shadow-cyan-950/40 animate-pulse-slow">
        <HardDrive className="w-4 h-4 text-cyan-400" />
        <span>15 GB Cloud Storage Allocation</span>
      </div>

      <div className="absolute top-20 right-14 hidden lg:flex items-center gap-3 px-4 py-2.5 rounded-2xl glass-panel text-slate-300 text-xs font-mono border border-violet-500/20 shadow-xl shadow-violet-950/40 animate-float-slow" style={{ animationDelay: '1.5s' }}>
        <Sparkles className="w-4 h-4 text-violet-400" />
        <span>Row-Level Security Verified</span>
      </div>

      {/* Central 3D Card Container with Mouse Parallax */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          transition: 'transform 0.1s ease-out',
        }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Glowing Border Halo */}
        <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-cyan-500/30 via-indigo-500/30 to-purple-500/30 blur-xl opacity-75 group-hover:opacity-100 transition duration-500" />

        {/* Glass Card Body */}
        <div className="relative rounded-3xl glass-panel bg-[#0d131f]/80 p-6 sm:p-8 border border-white/10 shadow-2xl backdrop-blur-2xl">
          {/* Header & Logo */}
          <div className="flex flex-col items-center text-center mb-6">
            <Logo size="xl" showText={true} className="mb-2" />
            <p className="text-slate-400 text-sm mt-1">
              {mode === 'signin'
                ? 'Sign in to access your secure personal cloud'
                : 'Create your private encrypted storage account'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex p-1 mb-6 rounded-xl bg-slate-900/80 border border-white/5">
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                mode === 'signin'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                mode === 'signup'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Feedback messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Faiz Muhammad"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm text-white placeholder-slate-500"
                  />
                </div>
              </motion.div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="faiz@fmstore.io"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm text-white placeholder-slate-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl glass-input text-sm text-white placeholder-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'signin' && (
              <div className="flex items-center">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
                  />
                  <span>Remember session on this device</span>
                </label>
              </div>
            )}

            {/* Submit Button with Ripple / Glow */}
            <button
              type="submit"
              disabled={loading}
              className="relative w-full group overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 p-px font-semibold text-white shadow-xl shadow-indigo-600/30 hover:shadow-cyan-500/25 active:scale-[0.99] transition-all disabled:opacity-60"
            >
              <div className="relative flex items-center justify-center gap-2 rounded-[11px] bg-slate-950/20 px-6 py-3 transition group-hover:bg-transparent">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Cryptography...</span>
                  </div>
                ) : (
                  <>
                    <span>{mode === 'signin' ? 'Sign In to FM_Store' : 'Create Encrypted Account'}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Quick Demo Login Divider & Button */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#0e1422] px-3 text-slate-400 font-mono text-[11px]">
                Or Instant Preview
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-sm font-medium transition duration-200"
          >
            <KeyRound className="w-4 h-4 text-indigo-400" />
            <span>Launch Quick Demo Account</span>
          </button>

          {/* Security Guarantee Footnote */}
          <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Zero-Knowledge Encryption • End-to-End Isolated</span>
          </div>
        </div>
      </motion.div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-2xl glass-panel bg-[#0d131f] p-6 border border-white/10 shadow-2xl"
            >
              <h3 className="text-lg font-bold text-white mb-2">Reset Password</h3>
              <p className="text-slate-400 text-xs mb-4">
                Enter your registered email address to receive secure cryptographic recovery instructions.
              </p>

              {forgotSuccess ? (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Recovery link generated and sent to email!</span>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-white placeholder-slate-500"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className="flex-1 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500"
                    >
                      Send Reset Link
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
