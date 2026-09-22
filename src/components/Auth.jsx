import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Mail,
  Building,
  UserPlus,
  LogIn,
  ChevronLeft,
  AlertCircle,
  Phone,
  CheckCircle2,
  LockKeyhole,
} from "lucide-react";
import AcousticVisualizer from "./AcousticVisualizer";
import MagneticButton from "./MagneticButton";

export default function Auth({ onAuthSuccess, onBackToLanding }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      if (isSignUp) {
        if (!businessName.trim()) {
          throw new Error("Business name is required.");
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              business_name: businessName,
            },
          },
        });

        if (error) throw error;

        if (data.session) {
          setSuccessMsg("Account created successfully! Launching console...");
          await createInitialBusinessRecord(data.user.id, businessName);
          setTimeout(() => {
            onAuthSuccess(data.session);
          }, 900);
        } else {
          setSuccessMsg("Registration successful! Please check your inbox for verification.");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.session) {
          setSuccessMsg("Authentication verified. Redirecting to workspace...");
          await verifyOrSeedBusiness(data.user.id);
          setTimeout(() => {
            onAuthSuccess(data.session);
          }, 900);
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const createInitialBusinessRecord = async (userId, name) => {
    try {
      const generatedExotel = `+91 80 47${Math.floor(100000 + Math.random() * 900000)}`;
      const { error } = await supabase.from("businesses").insert({
        id: userId,
        business_name: name,
        domain: "Healthcare, Salons, or Real Estate",
        exotel_number: generatedExotel,
        ai_prompt: `You are a highly capable AI receptionist for ${name}. Greet warmly, capture customer intent, check slot availability, and confirm bookings concisely.`,
        voice_id: "aura-asteria-en",
        subscription_tier: "starter",
        subscription_status: "active",
        max_seats: 4,
        owner_id: userId,
        user_id: userId,
      });
      if (error) console.error("Error seeding business info:", error);

      // Link user profile as business_owner
      await supabase.from("users").upsert({
        id: userId,
        email: email,
        full_name: name,
        role: "business_owner",
        business_id: userId,
      });
    } catch (e) {
      console.error("Exception seeding business:", e);
    }
  };

  const verifyOrSeedBusiness = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("businesses")
        .select("id")
        .eq("id", userId)
        .maybeSingle();

      if (!data && !error) {
        await createInitialBusinessRecord(userId, email.split("@")[0].toUpperCase());
      } else {
        // Ensure users row has business_id and role
        await supabase.from("users").upsert({
          id: userId,
          email: email,
          role: "business_owner",
          business_id: data.id,
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-white text-[#0F172A] relative flex items-center justify-center p-4 sm:p-8">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] hero-glow pointer-events-none opacity-50" />
      <div className="absolute inset-0 light-dot-grid pointer-events-none opacity-30" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-5xl rounded-[2.5rem] bg-white border border-[#E2E8F0] shadow-[0_25px_70px_-15px_rgba(15,23,42,0.08)] overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* ── Left Showcase Panel ── */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#FFFDF5] via-[#FFF9E6] to-[#FEF3C7]/40 border-b lg:border-b-0 lg:border-r border-[#FFC300]/30 p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          
          {/* Subtle Concentric Rings */}
          <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full border border-[#FFC300]/25 pointer-events-none" />

          <div>
            {/* Back Button */}
            <button
              onClick={onBackToLanding}
              className="inline-flex items-center gap-1.5 text-xs font-display font-bold uppercase tracking-wider text-[#64748B] hover:text-[#0F172A] transition-colors mb-8 cursor-pointer"
            >
              <ChevronLeft size={16} />
              <span>Back to Overview</span>
            </button>

            {/* Brand Logo */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl bg-[#FFC300] flex items-center justify-center shadow-sm">
                <Phone size={22} color="#0F172A" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="font-display text-2xl font-black text-[#0F172A] tracking-tight">
                  Callify
                </h1>
                <p className="text-[10px] font-mono-data text-[#E0AB00] font-bold tracking-wider">
                  TELEPHONY INTELLIGENCE
                </p>
              </div>
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight leading-snug mb-3 descender-safe">
              Autonomous Inbound Voice for Modern Businesses.
            </h2>
            <p className="font-body text-xs sm:text-sm text-[#64748B] leading-relaxed mb-6">
              Connect your customer phone lines to fine-tuned neural models that schedule appointments, handle reschedulings, and dispatch instant confirmations.
            </p>

            {/* Live Acoustic Visualizer Mini */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-3 border border-[#FFC300]/30 shadow-sm mb-6">
              <div className="flex items-center justify-between text-[11px] font-mono-data text-[#64748B] mb-1">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Neural Audio Stream
                </span>
                <span className="text-[#E0AB00] font-bold">&lt; 420ms</span>
              </div>
              <AcousticVisualizer height={50} isActive={true} />
            </div>
          </div>

          {/* Bottom Security Card */}
          <div className="pt-6 border-t border-[#FFC300]/30">
            <div className="flex items-center gap-2 text-xs font-mono-data text-[#0F172A] mb-1">
              <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
              <span className="font-bold">SOC2 Type II & HIPAA Ready</span>
            </div>
            <p className="text-[11px] text-[#64748B]">
              Carrier-grade telephony with 256-bit encryption for every inbound call session.
            </p>
          </div>
        </div>

        {/* ── Right Auth Form Panel ── */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between bg-white">
          <div>
            {/* View Switcher Tabs */}
            <div className="flex p-1.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] mb-8 max-w-sm">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-display font-bold transition-all cursor-pointer ${
                  !isSignUp
                    ? "bg-white text-[#0F172A] shadow-sm border border-[#E2E8F0]"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(true);
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-display font-bold transition-all cursor-pointer ${
                  isSignUp
                    ? "bg-white text-[#0F172A] shadow-sm border border-[#E2E8F0]"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                Create Account
              </button>
            </div>

            <div className="mb-6">
              <h3 className="font-display text-2xl font-black text-[#0F172A] tracking-tight">
                {isSignUp ? "Deploy Your AI Receptionist" : "Sign In to Console"}
              </h3>
              <p className="font-body text-xs sm:text-sm text-[#64748B] mt-1">
                {isSignUp
                  ? "Get your dedicated phone number and start taking calls in minutes."
                  : "Access your business appointments, logs, and voice configurations."}
              </p>
            </div>

            {/* Error & Success Feedback Alerts */}
            <AnimatePresence mode="wait">
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-2.5 text-xs font-body"
                >
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </motion.div>
              )}

              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-2.5 text-xs font-body"
                >
                  <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-600" />
                  <span>{successMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleAuth} className="space-y-4">
              {/* Business Name (Sign Up Only) */}
              {isSignUp && (
                <div>
                  <label className="block text-xs font-display font-bold uppercase tracking-wider text-[#0F172A] mb-1.5">
                    Business / Clinic Name
                  </label>
                  <div className="relative">
                    <Building size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Wellness Care"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#FAFAFA] border border-[#E2E8F0] text-sm text-[#0F172A] focus:outline-none focus:border-[#FFC300] focus:ring-2 focus:ring-[#FFC300]/20 transition-all font-body"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-xs font-display font-bold uppercase tracking-wider text-[#0F172A] mb-1.5">
                  Work Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    type="email"
                    required
                    placeholder="doctor@clinic.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#FAFAFA] border border-[#E2E8F0] text-sm text-[#0F172A] focus:outline-none focus:border-[#FFC300] focus:ring-2 focus:ring-[#FFC300]/20 transition-all font-body"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-display font-bold uppercase tracking-wider text-[#0F172A] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <LockKeyhole size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#FAFAFA] border border-[#E2E8F0] text-sm text-[#0F172A] focus:outline-none focus:border-[#FFC300] focus:ring-2 focus:ring-[#FFC300]/20 transition-all font-body"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <MagneticButton
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-[#0F172A] text-white hover:bg-[#1E293B] shadow-md text-sm font-bold gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-[#FFC300] border-t-transparent rounded-full animate-spin" />
                  ) : isSignUp ? (
                    <>
                      <span>Start 14-Day Free Pilot</span>
                      <UserPlus size={16} className="text-[#FFC300]" />
                    </>
                  ) : (
                    <>
                      <span>Enter Console</span>
                      <LogIn size={16} className="text-[#FFC300]" />
                    </>
                  )}
                </MagneticButton>
              </div>
            </form>
          </div>

          {/* Quick Demo Switcher Tip */}
          <div className="mt-8 pt-6 border-t border-[#F1F5F9] flex items-center justify-between text-xs text-[#64748B]">
            <span>Need a test account? Sign up with any valid email format.</span>
            <button
              onClick={() => {
                setEmail("demo@callify.in");
                setPassword("demo123456");
              }}
              className="text-[#E0AB00] font-bold hover:underline cursor-pointer"
            >
              Fill Demo Login
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
