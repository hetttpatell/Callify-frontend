import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';
import { ShieldCheck, Mail, Lock, Building, UserPlus, LogIn, ChevronLeft, AlertCircle, Phone } from 'lucide-react';

const C = {
  bg: "#FFFFFF",
  surface: "#FAFAFA",
  accent: "#FFC300",
  accentLight: "#FFF9E6",
  accentDark: "#E0AB00",
  fg: "#0F172A",
  fgMuted: "#64748B",
  border: "#F1F5F9",
  borderStrong: "#E2E8F0",
};

export default function Auth({ onAuthSuccess, onBackToLanding }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isSignUp) {
        // Sign Up Flow
        if (!businessName.trim()) {
          throw new Error('Business name is required.');
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              business_name: businessName
            }
          }
        });

        if (error) throw error;

        if (data.session) {
          setSuccessMsg('Account created successfully!');
          await createInitialBusinessRecord(data.user.id, businessName);
          setTimeout(() => {
            onAuthSuccess(data.session);
          }, 1000);
        } else {
          setSuccessMsg('Registration successful. Please check your inbox for the verification link.');
        }
      } else {
        // Login Flow
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        if (data.session) {
          setSuccessMsg('Login successful. Redirecting...');
          await verifyOrSeedBusiness(data.user.id);
          setTimeout(() => {
            onAuthSuccess(data.session);
          }, 1000);
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Helper: Seeds default business values in Supabase `businesses` table
  const createInitialBusinessRecord = async (userId, name) => {
    try {
      const generatedExotel = `+91 80 47${Math.floor(100000 + Math.random() * 900000)}`;
      const { error } = await supabase
        .from('businesses')
        .insert({
          id: userId,
          business_name: name,
          domain: 'room services or spa appointments',
          exotel_number: generatedExotel,
          ai_prompt: `You are a highly efficient, professional voice assistant for ${name}. Speak in 1-2 punchy sentences. Book appointments with tool commands.`,
          voice_id: 'aura-asteria-en'
        });
      if (error) console.error('Error seeding business info:', error);
    } catch (e) {
      console.error('Exception seeding business:', e);
    }
  };

  const verifyOrSeedBusiness = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('id')
        .eq('id', userId)
        .maybeSingle();
      
      if (!data && !error) {
        await createInitialBusinessRecord(userId, email.split('@')[0].toUpperCase());
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div
      className="min-h-screen relative flex flex-col items-center justify-center p-4"
      style={{ backgroundColor: C.bg }}
    >
      {/* Subtle radial glow */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full blur-3xl opacity-20"
        style={{
          background: "radial-gradient(circle, rgba(255,195,0,0.25) 0%, transparent 70%)",
        }}
      />

      {/* Subtle dot pattern */}
      <div className="absolute inset-0 light-dot-grid pointer-events-none opacity-30" />

      {/* Brand Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 80, damping: 20 }}
        className="relative z-10 mb-8 flex flex-col items-center gap-2 cursor-pointer"
        onClick={onBackToLanding}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl shadow-sm"
            style={{ backgroundColor: C.accent }}
          >
            <Phone size={20} color={C.fg} strokeWidth={2.5} />
          </div>
          <span className="font-display text-3xl font-bold tracking-tight" style={{ color: C.fg }}>
            Callify
          </span>
        </div>
        <span className="text-xs font-body" style={{ color: C.fgMuted }}>
          India's #1 AI Receptionist Platform
        </span>
      </motion.div>

      {/* Main Authentication Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 60, damping: 18, delay: 0.1 }}
        key={isSignUp ? 'signup' : 'signin'}
        className="w-full max-w-md rounded-3xl p-8 relative overflow-hidden z-10"
        style={{
          backgroundColor: C.bg,
          border: `1px solid ${C.borderStrong}`,
          boxShadow: "0 20px 60px rgba(15,23,42,0.08), 0 8px 24px rgba(15,23,42,0.04)",
        }}
      >
        {/* Decorative accent corner */}
        <div
          className="absolute top-0 right-0 w-28 h-28 rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: C.accent, transform: "translate(30%, -30%)" }}
        />

        {/* Back Link */}
        <button 
          onClick={onBackToLanding}
          className="flex items-center gap-1 text-sm font-body mb-6 transition-colors cursor-pointer bg-transparent border-none"
          style={{ color: C.fgMuted }}
          onMouseEnter={(e) => e.target.style.color = C.accentDark}
          onMouseLeave={(e) => e.target.style.color = C.fgMuted}
        >
          <ChevronLeft className="w-4 h-4" /> Back to Home
        </button>

        <div className="mb-6 space-y-2">
          <h2 className="text-2xl font-display font-bold" style={{ color: C.fg }}>
            {isSignUp ? 'Create Your Account' : 'Welcome Back'}
          </h2>
          <p className="text-sm font-body leading-relaxed" style={{ color: C.fgMuted }}>
            {isSignUp 
              ? 'Set up your AI receptionist in under 60 seconds.' 
              : 'Sign in to access your dashboard and manage your AI receptionist.'}
          </p>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3.5 rounded-xl flex items-start gap-2 text-sm font-body"
            style={{
              backgroundColor: "#FEF2F2",
              border: "1px solid #FECACA",
              color: "#DC2626",
            }}
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </motion.div>
        )}
        
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3.5 rounded-xl flex items-start gap-2 text-sm font-body"
            style={{
              backgroundColor: "#F0FDF4",
              border: "1px solid #BBF7D0",
              color: "#16A34A",
            }}
          >
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </motion.div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {/* Business Name Field (Sign Up Only) */}
          {isSignUp && (
            <div className="space-y-1.5">
              <label className="text-sm font-body font-medium block" style={{ color: C.fg }}>
                Business Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Building className="h-4 w-4" style={{ color: C.fgMuted }} />
                </span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aura Spa & Salon"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full rounded-xl pl-10 pr-4 py-3 text-sm font-body focus:outline-none transition-all"
                  style={{
                    backgroundColor: C.surface,
                    border: `1px solid ${C.borderStrong}`,
                    color: C.fg,
                  }}
                  onFocus={(e) => e.target.style.borderColor = C.accent}
                  onBlur={(e) => e.target.style.borderColor = C.borderStrong}
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="text-sm font-body font-medium block" style={{ color: C.fg }}>
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="h-4 w-4" style={{ color: C.fgMuted }} />
              </span>
              <input
                type="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl pl-10 pr-4 py-3 text-sm font-body focus:outline-none transition-all"
                style={{
                  backgroundColor: C.surface,
                  border: `1px solid ${C.borderStrong}`,
                  color: C.fg,
                }}
                onFocus={(e) => e.target.style.borderColor = C.accent}
                onBlur={(e) => e.target.style.borderColor = C.borderStrong}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="text-sm font-body font-medium block" style={{ color: C.fg }}>
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-4 w-4" style={{ color: C.fgMuted }} />
              </span>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl pl-10 pr-4 py-3 text-sm font-body focus:outline-none transition-all"
                style={{
                  backgroundColor: C.surface,
                  border: `1px solid ${C.borderStrong}`,
                  color: C.fg,
                }}
                onFocus={(e) => e.target.style.borderColor = C.accent}
                onBlur={(e) => e.target.style.borderColor = C.borderStrong}
              />
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02, boxShadow: "0 6px 20px rgba(255,195,0,0.3)" }}
            whileTap={{ scale: 0.98 }}
            className="w-full font-body text-sm font-semibold py-4 rounded-xl cursor-pointer flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed border-none transition-all"
            style={{
              backgroundColor: C.accent,
              color: C.fg,
              boxShadow: "0 2px 10px rgba(255,195,0,0.15)",
            }}
          >
            {loading ? (
              <span
                className="inline-block w-4 h-4 border-2 rounded-full animate-spin"
                style={{ borderColor: C.fg, borderTopColor: "transparent" }}
              />
            ) : isSignUp ? (
              <>Create Account <UserPlus className="w-4 h-4" /></>
            ) : (
              <>Sign In <LogIn className="w-4 h-4" /></>
            )}
          </motion.button>
        </form>

        {/* View Toggle Footer */}
        <div className="mt-6 pt-6 border-t text-center" style={{ borderColor: C.border }}>
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className="text-sm font-body transition-colors cursor-pointer bg-transparent border-none"
            style={{ color: C.fgMuted }}
            onMouseEnter={(e) => e.target.style.color = C.accentDark}
            onMouseLeave={(e) => e.target.style.color = C.fgMuted}
          >
            {isSignUp 
              ? 'Already have an account? Sign In' 
              : "Don't have an account? Create one"}
          </button>
        </div>
      </motion.div>
      
      {/* Dev tip badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 mt-6 max-w-sm rounded-xl p-4 text-xs font-body text-center leading-relaxed"
        style={{
          backgroundColor: C.accentLight,
          color: C.fgMuted,
          border: `1px solid ${C.border}`,
        }}
      >
        <span className="font-bold" style={{ color: C.accentDark }}>Development Tip:</span>{' '}
        You can sign up with any email, or login with your existing account.
      </motion.div>
    </div>
  );
}
