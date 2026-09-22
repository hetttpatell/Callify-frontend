import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import {
  Phone,
  CalendarCheck,
  BrainCircuit,
  Globe,
  ShieldCheck,
  BarChart3,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Zap,
  Star,
  MessageSquare,
  Headphones,
  Rocket,
  PhoneCall,
  Volume2,
  Layers,
  Sparkle,
  Cpu,
  Radio,
} from "lucide-react";

import AcousticVisualizer from "./AcousticVisualizer";
import TiltCard from "./TiltCard";
import MagneticButton from "./MagneticButton";
import RoiCalculator from "./RoiCalculator";

/* ─────────────────────────── Design Tokens (Strict Theme Preservation) ─────────────────────────── */
const C = {
  bg: "#FFFFFF",
  surface: "#FAFAFA",
  surfaceAlt: "#F8FAFC",
  accent: "#FFC300",
  accentLight: "#FFF9E6",
  accentDark: "#E0AB00",
  fg: "#0F172A",
  fgMuted: "#64748B",
  border: "#F1F5F9",
  borderStrong: "#E2E8F0",
};

/* ─────────────────────────── Scroll Reveal Wrapper ─────────────────────────── */
function Reveal({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 35 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ type: "spring", stiffness: 70, damping: 20, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────── Highlight Underline ─────────────────────────── */
function HighlightedWord({ children }) {
  return (
    <span className="relative inline-block">
      <span className="relative z-10 text-[#0F172A]">{children}</span>
      <span className="absolute bottom-1.5 left-0 w-full h-3 bg-[#FFC300]/40 -z-0 rounded-sm pointer-events-none" />
    </span>
  );
}

/* ─────────────────────────── Section Badge ─────────────────────────── */
function SectionBadge({ icon: Icon, children }) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-semibold font-display tracking-tight mb-4 border bg-[#FFFDF5] text-[#9A3412] border-[#FFC300]/35 shadow-2xs"
    >
      {Icon && <Icon size={13} className="text-[#E0AB00]" />}
      {children}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   1. RESPONSIVE FLOATING NAVBAR & MOBILE BOTTOM DOCK
   ═══════════════════════════════════════════════════════════════════════════════ */
function Navbar({ onNavigateToAuth }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* ── DESKTOP FLOATING ISLAND NAVBAR (Visible on md and up) ── */}
      <header className="hidden md:block fixed top-0 left-0 right-0 z-50 px-6 pt-4 transition-transform duration-300">
        <nav
          className={`mx-auto max-w-6xl rounded-2xl transition-all duration-300 px-5 py-3 flex items-center justify-between ${
            scrolled
              ? "glass-card-light shadow-[0_10px_30px_rgba(15,23,42,0.06)] border-[#E2E8F0]"
              : "bg-white/80 backdrop-blur-md border border-slate-100"
          }`}
        >
          {/* Brand */}
          <a href="#" className="flex items-center gap-2.5 group">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl shadow-sm transition-transform group-hover:scale-105"
              style={{ backgroundColor: C.accent }}
            >
              <Phone size={18} color={C.fg} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl font-extrabold tracking-tight" style={{ color: C.fg }}>
                Callify
              </span>
              <span className="text-[10px] font-mono-data font-semibold text-[#E0AB00] -mt-1 tracking-wider">
                VOICE INTELLIGENCE
              </span>
            </div>
          </a>

          {/* Navigation Links */}
          <div className="flex items-center gap-7">
            {[
              { name: "Live Simulator", href: "#live-simulator" },
              { name: "Features", href: "#features" },
              { name: "How It Works", href: "#how-it-works" },
              { name: "ROI Engine", href: "#roi-calculator" },
              { name: "Pricing", href: "#pricing" },
            ].map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-sm font-medium font-body transition-colors duration-150 hover:text-[#E0AB00]"
                style={{ color: C.fgMuted }}
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateToAuth}
              className="text-xs font-bold font-display uppercase tracking-wider px-3 py-2 text-[#0F172A] hover:text-[#E0AB00] transition-colors cursor-pointer"
            >
              Sign In
            </button>

            <MagneticButton
              onClick={onNavigateToAuth}
              className="rounded-xl px-5 py-2.5 text-xs font-bold tracking-wide shadow-sm"
              style={{
                backgroundColor: C.accent,
                color: C.fg,
              }}
            >
              <span className="flex items-center gap-1.5">
                <span>Start Free Trial</span>
                <ArrowRight size={14} strokeWidth={2.5} />
              </span>
            </MagneticButton>
          </div>
        </nav>
      </header>

      {/* ── MOBILE MINIMAL TOP BRAND BAR (Mobile only, zero horizontal overflow) ── */}
      <header className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-4 py-2.5 w-full flex items-center justify-between shadow-2xs">
        <a href="#" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FFC300] shadow-xs">
            <Phone size={15} color="#0F172A" strokeWidth={2.5} />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-display text-base font-extrabold tracking-tight text-[#0F172A]">
              Callify
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </a>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToAuth}
            className="text-xs font-display font-bold px-3 py-1.5 rounded-xl border border-[#E2E8F0] bg-white text-[#0F172A] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
          >
            Console Sign In
          </button>
        </div>
      </header>

      {/* ── MOBILE ORGANIZED FLOATING BOTTOM NAVIGATION DOCK (Mobile only) ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-[#E2E8F0] px-2 py-1.5 shadow-[0_-6px_28px_rgba(15,23,42,0.08)] pb-[max(0.6rem,env(safe-area-inset-bottom))] flex items-center justify-between">
        <div className="flex items-center justify-around flex-1">
          <a
            href="#live-simulator"
            className="flex flex-col items-center py-1 px-2 text-[#64748B] hover:text-[#0F172A] transition-colors"
          >
            <Radio size={16} className="text-[#E0AB00]" />
            <span className="text-[9px] font-mono-data font-bold mt-0.5">Demo</span>
          </a>

          <a
            href="#features"
            className="flex flex-col items-center py-1 px-2 text-[#64748B] hover:text-[#0F172A] transition-colors"
          >
            <Cpu size={16} className="text-[#0F172A]" />
            <span className="text-[9px] font-mono-data font-bold mt-0.5">Features</span>
          </a>

          <a
            href="#roi-calculator"
            className="flex flex-col items-center py-1 px-2 text-[#64748B] hover:text-[#0F172A] transition-colors"
          >
            <BarChart3 size={16} className="text-[#0F172A]" />
            <span className="text-[9px] font-mono-data font-bold mt-0.5">ROI</span>
          </a>

          <a
            href="#pricing"
            className="flex flex-col items-center py-1 px-2 text-[#64748B] hover:text-[#0F172A] transition-colors"
          >
            <CalendarCheck size={16} className="text-[#0F172A]" />
            <span className="text-[9px] font-mono-data font-bold mt-0.5">Pricing</span>
          </a>
        </div>

        {/* High-converting CTA button docked right in thumb's reach */}
        <button
          onClick={onNavigateToAuth}
          className="ml-2 px-3.5 py-2 rounded-xl bg-[#FFC300] hover:bg-[#E0AB00] text-[#0F172A] font-display font-black text-xs tracking-tight shadow-xs flex items-center gap-1 cursor-pointer shrink-0 transition-all"
        >
          <span>Free Trial</span>
          <ArrowRight size={13} strokeWidth={2.5} />
        </button>
      </nav>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   2. HERO SECTION & INTERACTIVE VOICE LAB (SIGNATURE INTERACTION)
   ═══════════════════════════════════════════════════════════════════════════════ */
const SCENARIOS = [
  {
    id: "clinic",
    title: "Dental Clinic",
    callerName: "Aarav Sharma",
    callerPhone: "+91 98201 44102",
    avatar: "👨‍💼",
    script: [
      { speaker: "caller", text: "Hello! I have a sudden toothache. Do you have an open slot today?" },
      { speaker: "ai", text: "I'm sorry to hear that! Dr. Mehta has an emergency opening today at 4:30 PM. Would you like me to reserve that for you?" },
      { speaker: "caller", text: "Yes please, 4:30 PM works perfectly." },
      { speaker: "ai", text: "Confirmed for 4:30 PM! I've sent the Google Calendar invite and clinic GPS pin to your WhatsApp." },
    ],
    bookingResult: {
      type: "Dental Emergency Consultation",
      slot: "Today, 4:30 PM",
      doctor: "Dr. Mehta, BDS",
      channel: "WhatsApp & SMS Dispatched",
    },
  },
  {
    id: "salon",
    title: "Luxury Salon & Spa",
    callerName: "Priya Nair",
    callerPhone: "+91 99341 82190",
    avatar: "👩‍💼",
    script: [
      { speaker: "caller", text: "Hi, I want to book a hair spa and styling for Saturday afternoon." },
      { speaker: "ai", text: "Certainly Priya! Master Stylist Rahul is available this Saturday at 2:00 PM or 4:15 PM." },
      { speaker: "caller", text: "Let's do 2:00 PM please." },
      { speaker: "ai", text: "Reserved for Saturday at 2:00 PM. We have also added complimentary scalp therapy to your profile." },
    ],
    bookingResult: {
      type: "Hair Spa + Styling Session",
      slot: "Saturday, 2:00 PM",
      doctor: "Stylist Rahul",
      channel: "Calendar Confirmed",
    },
  },
  {
    id: "auto",
    title: "Auto Service Center",
    callerName: "Vikram Malhotra",
    callerPhone: "+91 98112 00391",
    avatar: "🧑‍🔧",
    script: [
      { speaker: "caller", text: "My Honda City needs its 40,000km periodic service and brake check." },
      { speaker: "ai", text: "Good morning Vikram! We can pick up your vehicle tomorrow between 9 AM and 10 AM, or you can drop it off at 8:30 AM." },
      { speaker: "caller", text: "Please arrange doorstep pickup at 9 AM." },
      { speaker: "ai", text: "Doorstep valet pickup scheduled for tomorrow at 9:00 AM. Driver details will arrive via SMS 30 minutes prior." },
    ],
    bookingResult: {
      type: "40k Major Service + Valet Pickup",
      slot: "Tomorrow, 9:00 AM",
      doctor: "Bay 4 — Team Express",
      channel: "Job Card #JC-9821 Dispatched",
    },
  },
];

function HeroSection({ onNavigateToAuth }) {
  const [selectedScenarioIdx, setSelectedScenarioIdx] = useState(0);
  const [callState, setCallState] = useState("connected"); // 'ringing' | 'connected' | 'completed'
  const [activeStep, setActiveStep] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [callSeconds, setCallSeconds] = useState(14);
  const [isAudioSpeaking, setIsAudioSpeaking] = useState(true);

  const scenario = SCENARIOS[selectedScenarioIdx];

  // Call timer simulation
  useEffect(() => {
    let interval;
    if (callState === "connected") {
      interval = setInterval(() => setCallSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [callState]);

  // Dialogue progression
  useEffect(() => {
    if (callState !== "connected") return;

    const currentLine = scenario.script[activeStep];
    if (!currentLine) {
      setCallState("completed");
      setIsAudioSpeaking(false);
      return;
    }

    setIsAudioSpeaking(true);
    let charIdx = 0;
    setDisplayedText("");

    const typingInterval = setInterval(() => {
      if (charIdx <= currentLine.text.length) {
        setDisplayedText(currentLine.text.slice(0, charIdx));
        charIdx++;
      } else {
        clearInterval(typingInterval);
        setIsAudioSpeaking(false);
        // Advance to next after reading pause
        const nextTimeout = setTimeout(() => {
          if (activeStep < scenario.script.length - 1) {
            setActiveStep((prev) => prev + 1);
          } else {
            setCallState("completed");
          }
        }, 1600);
        return () => clearTimeout(nextTimeout);
      }
    }, 24);

    return () => clearInterval(typingInterval);
  }, [callState, activeStep, scenario.script]);

  const restartSimulation = (scenarioIdx = selectedScenarioIdx) => {
    setSelectedScenarioIdx(scenarioIdx);
    setActiveStep(0);
    setDisplayedText("");
    setCallSeconds(1);
    setCallState("ringing");
    setTimeout(() => {
      setCallState("connected");
    }, 1400);
  };

  const formatTimer = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <section
      id="live-simulator"
      className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28 bg-white min-h-[95dvh] flex items-center"
    >
      {/* Background Acoustic Ambient Glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[650px] w-[1100px] hero-glow opacity-80" />
      <div className="absolute inset-0 light-dot-grid pointer-events-none opacity-40" />

      <div className="relative mx-auto max-w-7xl px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* ── Left Column: Compelling Copy & Proof ── */}
          <div className="lg:col-span-6 text-left">
            <Reveal>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <SectionBadge icon={Sparkles}>
                  Autonomous Voice Agent for India
                </SectionBadge>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  99.8% Pickup SLA
                </span>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.75rem] font-bold text-[#0F172A] tracking-[-0.03em] leading-[1.14] descender-safe">
                Never Miss A Customer Call Again.{" "}
                <HighlightedWord>Always Answering.</HighlightedWord>
              </h1>
            </Reveal>

            <Reveal delay={0.2}>
              <p className="font-body text-base sm:text-lg text-[#475569] mt-6 leading-relaxed max-w-xl font-normal">
                Callify is India's most intelligent AI phone receptionist. Pick up every inbound ring in <strong>Hindi, English & 10+ regional dialects</strong> — books appointments on your calendar, answers complex business queries, and syncs to WhatsApp instantly.
              </p>
            </Reveal>

            {/* CTAs */}
            <Reveal delay={0.3}>
              <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <MagneticButton
                  onClick={onNavigateToAuth}
                  className="px-7 py-3.5 rounded-xl bg-[#0F172A] text-white hover:bg-[#1E293B] shadow-md text-sm font-semibold tracking-tight gap-2.5"
                >
                  <span>Claim 14-Day Free Pilot</span>
                  <ArrowRight size={16} className="text-[#FFC300]" />
                </MagneticButton>

                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold font-display border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[#0F172A] transition-colors shadow-2xs"
                >
                  <Headphones size={16} className="text-[#E0AB00]" />
                  <span>Architecture</span>
                </a>
              </div>
            </Reveal>

            {/* Trust Badges */}
            <Reveal delay={0.4}>
              <div className="mt-10 pt-6 border-t border-[#F1F5F9] grid grid-cols-3 gap-4">
                <div>
                  <div className="font-mono-data text-2xl sm:text-3xl font-black text-[#0F172A]">
                    &lt; 420ms
                  </div>
                  <p className="text-xs text-[#64748B] font-medium mt-0.5">Voice Latency</p>
                </div>
                <div>
                  <div className="font-mono-data text-2xl sm:text-3xl font-black text-[#0F172A]">
                    12+
                  </div>
                  <p className="text-xs text-[#64748B] font-medium mt-0.5">Indian Dialects</p>
                </div>
                <div>
                  <div className="font-mono-data text-2xl sm:text-3xl font-black text-[#0F172A]">
                    5,000+
                  </div>
                  <p className="text-xs text-[#64748B] font-medium mt-0.5">Businesses Active</p>
                </div>
              </div>
            </Reveal>
          </div>

          {/* ── Right Column: Interactive Voice Simulator (Living Acoustic Metaphor) ── */}
          <div className="lg:col-span-6 flex justify-center">
            <Reveal delay={0.25} className="w-full max-w-[520px]">
              {/* Persona Selector Tabs */}
              <div className="flex items-center justify-between gap-1 p-1.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] mb-4 overflow-x-auto modern-scrollbar">
                {SCENARIOS.map((sc, idx) => (
                  <button
                    key={sc.id}
                    onClick={() => restartSimulation(idx)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold font-display transition-all whitespace-nowrap cursor-pointer ${
                      selectedScenarioIdx === idx
                        ? "bg-white text-[#0F172A] shadow-sm border border-[#FFC300]/40"
                        : "text-[#64748B] hover:text-[#0F172A]"
                    }`}
                  >
                    {sc.title}
                  </button>
                ))}
              </div>

              {/* 3D Tilt Phone Console */}
              <TiltCard className="w-full" tiltMax={6}>
                <div className="relative rounded-[2.5rem] bg-white border border-[#E2E8F0] shadow-[0_25px_80px_-15px_rgba(15,23,42,0.12),0_0_0_1px_rgba(255,255,255,0.8)_inset] overflow-hidden p-6 sm:p-7">
                  
                  {/* Speaker / Dynamic Island notch */}
                  <div className="flex items-center justify-between pb-4 text-[10px] font-mono-data text-[#94A3B8] relative z-10 border-b border-[#F8FAFC]">
                    <span>11:42</span>
                    <div className="w-16 h-3 bg-[#F1F5F9] rounded-full flex items-center justify-center gap-1.5 border border-[#E2E8F0]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#CBD5E1]" />
                      <span className="w-5 h-1 rounded-full bg-[#CBD5E1]" />
                    </div>
                    <span className="flex items-center gap-1">5G <span className="w-2 h-2 rounded-full bg-emerald-500" /></span>
                  </div>

                  {/* Glowing Top Corner Halos */}
                  <div className="absolute top-0 right-0 w-44 h-44 bg-[#FFC300]/15 rounded-full blur-2xl pointer-events-none" />
                  
                  {/* Phone Header Bar */}
                  <div className="flex items-center justify-between py-4 border-b border-[#F1F5F9] relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-[#FFF9E6] border border-[#FFC300]/40 flex items-center justify-center text-xl shadow-sm">
                          {scenario.avatar}
                        </div>
                        {callState === "connected" && (
                          <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white" />
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-display font-bold text-base text-[#0F172A]">
                            {scenario.callerName}
                          </h4>
                          <span className="text-[10px] font-mono-data bg-[#F1F5F9] px-2 py-0.5 rounded text-[#64748B]">
                            INBOUND
                          </span>
                        </div>
                        <p className="font-mono-data text-xs text-[#64748B]">
                          {scenario.callerPhone}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono-data text-sm font-black text-[#0F172A] bg-[#FFF9E6] px-3 py-1 rounded-lg border border-[#FFC300]/30">
                        {callState === "ringing" ? "RINGING..." : formatTimer(callSeconds)}
                      </div>
                      <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider block mt-1">
                        ● HD SPEECH ENCRYPTED
                      </span>
                    </div>
                  </div>

                  {/* Dynamic Audio Visualizer & Wave Canvas */}
                  <div className="py-4 relative z-10">
                    <div className="flex items-center justify-between text-xs font-semibold text-[#64748B] mb-2 px-1">
                      <span className="flex items-center gap-1.5">
                        <Volume2 size={14} className="text-[#FFC300]" />
                        Living Acoustic Thread Spectrum
                      </span>
                      <span className="font-mono-data text-[11px] text-[#E0AB00]">
                        {isAudioSpeaking ? "AI STREAMING (24kHz)" : "STANDBY"}
                      </span>
                    </div>

                    <div className="bg-[#FFFDF5] border border-[#FFC300]/25 rounded-2xl p-2 shadow-inner">
                      <AcousticVisualizer
                        isActive={isAudioSpeaking || callState === "connected"}
                        height={70}
                        lineColor="#FFC300"
                        glowColor="rgba(255, 195, 0, 0.45)"
                      />
                    </div>
                  </div>

                  {/* Live Stream Conversation View */}
                  <div className="space-y-3 min-h-[160px] max-h-[190px] overflow-y-auto modern-scrollbar py-2 relative z-10">
                    {scenario.script.slice(0, activeStep).map((msg, i) => (
                      <div
                        key={i}
                        className={`flex gap-2.5 ${msg.speaker === "ai" ? "justify-start" : "justify-end"}`}
                      >
                        {msg.speaker === "ai" && (
                          <div className="w-7 h-7 rounded-lg bg-[#FFC300] flex items-center justify-center text-xs font-bold text-[#0F172A] shrink-0 mt-0.5">
                            AI
                          </div>
                        )}
                        <div
                          className={`rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-body max-w-[85%] leading-relaxed ${
                            msg.speaker === "ai"
                              ? "bg-[#FFF9E6] border border-[#FFC300]/30 text-[#0F172A]"
                              : "bg-[#F1F5F9] text-[#0F172A] font-medium"
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))}

                    {/* Active Typing / Streaming Bubble */}
                    {displayedText && (
                      <div
                        className={`flex gap-2.5 ${
                          scenario.script[activeStep]?.speaker === "ai" ? "justify-start" : "justify-end"
                        }`}
                      >
                        {scenario.script[activeStep]?.speaker === "ai" && (
                          <div className="w-7 h-7 rounded-lg bg-[#FFC300] flex items-center justify-center text-xs font-bold text-[#0F172A] shrink-0 mt-0.5">
                            AI
                          </div>
                        )}
                        <div
                          className={`rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-body max-w-[85%] leading-relaxed ${
                            scenario.script[activeStep]?.speaker === "ai"
                              ? "bg-[#FFF9E6] border border-[#FFC300]/40 text-[#0F172A] shadow-sm"
                              : "bg-[#F1F5F9] text-[#0F172A]"
                          }`}
                        >
                          {displayedText}
                          <span className="inline-block w-1.5 h-3.5 bg-[#E0AB00] ml-1 animate-pulse" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Instant Telemetry / Booking Popout */}
                  <div className="mt-4 pt-4 border-t border-[#F1F5F9] relative z-10">
                    <div className="flex items-center justify-between bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                          <CheckCircle2 size={20} />
                        </div>
                        <div>
                          <p className="font-display text-xs font-bold text-[#0F172A]">
                            {scenario.bookingResult.type}
                          </p>
                          <p className="text-[11px] text-[#64748B] font-mono-data">
                            {scenario.bookingResult.slot} • {scenario.bookingResult.doctor}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => restartSimulation()}
                        className="p-2 text-xs font-display font-semibold text-[#0F172A] bg-white border border-[#E2E8F0] hover:bg-[#F1F5F9] rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                        title="Replay Call"
                      >
                        <Rocket size={14} className="text-[#FFC300]" />
                        <span>Replay</span>
                      </button>
                    </div>
                  </div>

                  {/* Bottom Console Controls */}
                  <div className="mt-5 flex items-center justify-between text-xs text-[#64748B] relative z-10">
                    <span className="flex items-center gap-1.5 font-mono-data">
                      <ShieldCheck size={14} className="text-emerald-500" />
                      Twilio / Exotel Carrier Link Active
                    </span>
                    <button
                      onClick={onNavigateToAuth}
                      className="font-bold text-[#E0AB00] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      Configure your prompt <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </TiltCard>
            </Reveal>
          </div>

        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   3. LOGO MARQUEE & ENTERPRISE TRUST TICKER
   ═══════════════════════════════════════════════════════════════════════════════ */
function TrustedBySection() {
  const brands = [
    { name: "Apollo Clinics", cat: "Healthcare", badge: "24/7 Triage" },
    { name: "DLF Cybercity", cat: "Real Estate", badge: "Lease Inquiry" },
    { name: "Kaya Skin Clinic", cat: "Wellness", badge: "Appt Booking" },
    { name: "Honda City Auto", cat: "Automotive", badge: "Service Valet" },
    { name: "Lenskart Studio", cat: "Retail", badge: "Store Directions" },
    { name: "Urban Company Pro", cat: "Home Services", badge: "Dispatch" },
    { name: "Fortis Diagnostics", cat: "Labs", badge: "Home Collection" },
  ];

  return (
    <section className="py-12 border-y border-[#F1F5F9] bg-[#FAFAFA] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-6 text-center">
        <p className="text-xs font-mono-data font-bold uppercase tracking-widest text-[#64748B]">
          POWERING INBOUND TELEPHONY FOR 5,000+ FAST-GROWING BUSINESSES
        </p>
      </div>

      <div className="relative w-full overflow-hidden whitespace-nowrap">
        {/* Ambient fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#FAFAFA] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#FAFAFA] to-transparent z-10 pointer-events-none" />

        <div className="inline-flex gap-8 animate-marquee">
          {[...brands, ...brands].map((b, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-3 bg-white border border-[#E2E8F0] rounded-2xl px-5 py-2.5 shadow-sm"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-[#FFC300]" />
              <span className="font-display font-bold text-sm text-[#0F172A]">{b.name}</span>
              <span className="text-xs text-[#94A3B8]">•</span>
              <span className="text-xs text-[#64748B] font-mono-data">{b.cat}</span>
              <span className="text-[10px] bg-[#FFF9E6] text-[#E0AB00] font-bold px-2 py-0.5 rounded border border-[#FFC300]/20">
                {b.badge}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   4. ARCHITECTURE & HOW IT WORKS (3-STEP ACOUSTIC PIPELINE)
   ═══════════════════════════════════════════════════════════════════════════════ */
function HowItWorksSection() {
  const steps = [
    {
      num: "01",
      title: "Telephony Carrier Ingestion",
      desc: "Connect your existing Airtel, Jio, Exotel, or Twilio phone number in 60 seconds with unconditional forward.",
      icon: PhoneCall,
      detail: "Zero hardware or SIM cards needed. Runs on carrier-grade SIP trunks.",
    },
    {
      num: "02",
      title: "Neural Intent & Multilingual Whisper",
      desc: "Instant real-time speech recognition tuned specifically for Indian regional accents, colloquial phrasing, and background noise.",
      icon: BrainCircuit,
      detail: "Processes Hindi, English, Hinglish, Tamil, Marathi, and Kannada concurrently.",
    },
    {
      num: "03",
      title: "Action Execution & WhatsApp Dispatch",
      desc: "Callify directly books slots in Google Calendar, updates your CRM, and dispatches an instant WhatsApp confirmation pin to the caller.",
      icon: CalendarCheck,
      detail: "Instant webhook triggers to Zapier, Zoho, Salesforce, or custom REST APIs.",
    },
  ];

  return (
    <section id="how-it-works" className="py-28 px-6 bg-white relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <SectionBadge icon={Cpu}>Acoustic Pipeline Architecture</SectionBadge>
          <h2 className="font-display text-4xl sm:text-5xl font-black text-[#0F172A] tracking-tight descender-safe">
            How Callify Answers in{" "}
            <HighlightedWord>&lt; 420 Milliseconds</HighlightedWord>
          </h2>
          <p className="font-body text-lg text-[#64748B] mt-4">
            A seamless three-stage voice pipeline engineered for ultra-low latency, human-grade empathy, and automated execution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step) => (
            <TiltCard key={step.num} tiltMax={8}>
              <div className="h-full bg-[#FAFAFA] rounded-3xl border border-[#E2E8F0] p-8 flex flex-col justify-between hover:border-[#FFC300]/50 transition-colors group">
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <span className="font-mono-data text-4xl font-black text-[#E2E8F0] group-hover:text-[#FFC300] transition-colors">
                      {step.num}
                    </span>
                    <div className="w-12 h-12 rounded-2xl bg-white border border-[#E2E8F0] flex items-center justify-center shadow-sm text-[#0F172A] group-hover:bg-[#FFC300] transition-colors">
                      <step.icon size={22} />
                    </div>
                  </div>

                  <h3 className="font-display text-xl font-bold text-[#0F172A] mb-3">
                    {step.title}
                  </h3>
                  <p className="font-body text-sm text-[#64748B] leading-relaxed mb-6">
                    {step.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E2E8F0] text-xs font-mono-data text-[#0F172A] bg-white p-3 rounded-xl border">
                  ⚡ {step.detail}
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   5. BENTO GRID FEATURES SECTION
   ═══════════════════════════════════════════════════════════════════════════════ */
function FeaturesSection() {
  return (
    <section id="features" className="py-28 px-6 bg-[#FAFAFA] relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <SectionBadge icon={Layers}>Enterprise Capabilities</SectionBadge>
          <h2 className="font-display text-4xl sm:text-5xl font-black text-[#0F172A] tracking-tight descender-safe">
            Engineered for Real-World{" "}
            <HighlightedWord>Business Telephony</HighlightedWord>
          </h2>
          <p className="font-body text-lg text-[#64748B] mt-4">
            Everything your business needs to turn missed calls into paying customers, 24 hours a day, 365 days a year.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Card 1: 24/7 Booking Engine (Large) */}
          <div className="md:col-span-8">
            <TiltCard tiltMax={6} className="h-full">
              <div className="h-full bg-white rounded-3xl border border-[#E2E8F0] p-8 md:p-10 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#FFF9E6] border border-[#FFC300]/40 flex items-center justify-center mb-6 text-[#E0AB00]">
                    <CalendarCheck size={24} />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-[#0F172A] mb-3">
                    Autonomous 2-Way Calendar Booking
                  </h3>
                  <p className="font-body text-[#64748B] max-w-xl text-base leading-relaxed">
                    Callify reads real-time busy/free times from Google Calendar, Outlook, or your custom CRM. It negotiates mutually open slots with callers, handles complex reschedulings, and blocks double-bookings.
                  </p>
                </div>

                {/* Visual Preview */}
                <div className="mt-8 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                    <span className="font-mono-data text-xs font-bold text-[#0F172A]">
                      LIVE SYNC: GOOGLE CALENDAR & ZOHO CRM
                    </span>
                  </div>
                  <span className="text-xs bg-white px-3 py-1 rounded-lg border text-[#64748B] font-mono-data">
                    0 Conflict Collision Rate
                  </span>
                </div>
              </div>
            </TiltCard>
          </div>

          {/* Card 2: 12+ Indian Languages (Medium) */}
          <div className="md:col-span-4">
            <TiltCard tiltMax={7} className="h-full">
              <div className="h-full bg-white rounded-3xl border border-[#E2E8F0] p-8 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#FFF9E6] border border-[#FFC300]/40 flex items-center justify-center mb-6 text-[#E0AB00]">
                    <Globe size={24} />
                  </div>
                  <h3 className="font-display text-xl font-bold text-[#0F172A] mb-2">
                    Multilingual Native Fluency
                  </h3>
                  <p className="font-body text-sm text-[#64748B] leading-relaxed">
                    Smoothly understands Hinglish, pure Hindi, Tamil, Telugu, Marathi, and Indian-accented English without getting confused.
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {["Hindi", "English", "Hinglish", "Tamil", "Marathi", "Gujarati"].map((lang) => (
                    <span
                      key={lang}
                      className="text-xs font-medium font-mono-data bg-[#FAFAFA] border border-[#E2E8F0] px-3 py-1 rounded-lg text-[#0F172A]"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            </TiltCard>
          </div>

          {/* Card 3: WhatsApp Automation */}
          <div className="md:col-span-4">
            <TiltCard tiltMax={7} className="h-full">
              <div className="h-full bg-white rounded-3xl border border-[#E2E8F0] p-8 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-6 text-emerald-600">
                    <MessageSquare size={24} />
                  </div>
                  <h3 className="font-display text-xl font-bold text-[#0F172A] mb-2">
                    Instant WhatsApp Dispatch
                  </h3>
                  <p className="font-body text-sm text-[#64748B] leading-relaxed">
                    As soon as a call ends, Callify dispatches a branded WhatsApp template with meeting time, Google Maps location, and prep instructions.
                  </p>
                </div>
                <div className="mt-6 p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl text-xs font-mono-data text-emerald-800">
                  ✓ 98.4% WhatsApp delivery within 3s
                </div>
              </div>
            </TiltCard>
          </div>

          {/* Card 4: Human Escalation & Fallback */}
          <div className="md:col-span-4">
            <TiltCard tiltMax={7} className="h-full">
              <div className="h-full bg-white rounded-3xl border border-[#E2E8F0] p-8 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-6 text-amber-600">
                    <ShieldCheck size={24} />
                  </div>
                  <h3 className="font-display text-xl font-bold text-[#0F172A] mb-2">
                    Warm Human Transfer
                  </h3>
                  <p className="font-body text-sm text-[#64748B] leading-relaxed">
                    For VIP callers or critical emergencies, Callify instantly rings through to your personal phone while whispering context into your ear.
                  </p>
                </div>
                <div className="mt-6 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-mono-data text-[#0F172A]">
                  Transfer latency: &lt; 1.8 seconds
                </div>
              </div>
            </TiltCard>
          </div>

          {/* Card 5: Full Analytics & Call Recordings */}
          <div className="md:col-span-4">
            <TiltCard tiltMax={7} className="h-full">
              <div className="h-full bg-white rounded-3xl border border-[#E2E8F0] p-8 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#FFF9E6] border border-[#FFC300]/40 flex items-center justify-center mb-6 text-[#E0AB00]">
                    <BarChart3 size={24} />
                  </div>
                  <h3 className="font-display text-xl font-bold text-[#0F172A] mb-2">
                    Transcripts & Sentiment
                  </h3>
                  <p className="font-body text-sm text-[#64748B] leading-relaxed">
                    Every call is transcribed with audio recordings, caller intent tags, sentiment scores, and revenue opportunity metrics.
                  </p>
                </div>
                <div className="mt-6 p-3 bg-[#FFF9E6] border border-[#FFC300]/30 rounded-xl text-xs font-mono-data text-[#0F172A]">
                  SOC2 Type II & HIPAA compliant storage
                </div>
              </div>
            </TiltCard>
          </div>

        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   6. PRICING SECTION
   ═══════════════════════════════════════════════════════════════════════════════ */
function PricingSection({ onNavigateToAuth }) {
  const [billingCycle, setBillingCycle] = useState("annual"); // 'monthly' | 'annual'

  const plans = [
    {
      name: "Starter Clinic / Studio",
      desc: "Perfect for single-doctor clinics, boutique salons, and growing local businesses.",
      priceMonthly: 3499,
      priceAnnual: 2799,
      calls: "Up to 300 calls / month",
      popular: false,
      features: [
        "1 Phone Number Ingestion",
        "24/7 Autonomous Booking",
        "Hindi + English Fluency",
        "Google Calendar Integration",
        "WhatsApp Notification Dispatch",
        "Email Support within 4 hours",
      ],
    },
    {
      name: "Business Growth",
      desc: "For high-volume multi-chair clinics, busy auto centers, and real estate brokerages.",
      priceMonthly: 7999,
      priceAnnual: 6399,
      calls: "Up to 1,200 calls / month",
      popular: true,
      features: [
        "Up to 3 Phone Lines",
        "12+ Indian Regional Languages",
        "Warm Human Call Transfer",
        "Custom Voice Persona & Pitch",
        "Full Audio Transcripts & Recording",
        "Zoho / Salesforce / Custom Webhooks",
        "Priority 24/7 WhatsApp VIP Support",
      ],
    },
    {
      name: "Enterprise Multi-Branch",
      desc: "For hospital chains, retail networks, and multi-city service franchises.",
      priceMonthly: 19999,
      priceAnnual: 15999,
      calls: "Unlimited Call Channels",
      popular: false,
      features: [
        "Unlimited Multi-Branch Routing",
        "Custom LLM Fine-Tuned on your SOPs",
        "Dedicated Telephony Account Manager",
        "Custom SLA (99.95% Guaranteed)",
        "On-Premise Data Retention & HIPAA",
        "Custom SIP Trunk Integration",
      ],
    },
  ];

  return (
    <section id="pricing" className="py-28 px-6 bg-white relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <SectionBadge icon={Zap}>Transparent Investment</SectionBadge>
          <h2 className="font-display text-4xl sm:text-5xl font-black text-[#0F172A] tracking-tight descender-safe">
            Less Than 10% the Cost of a{" "}
            <HighlightedWord>Full-Time Receptionist</HighlightedWord>
          </h2>
          <p className="font-body text-lg text-[#64748B] mt-4">
            Zero hiring hassles, zero sick days, zero missed night calls. Cancel or adjust anytime.
          </p>

          {/* Billing Switcher */}
          <div className="mt-8 inline-flex items-center p-1.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-5 py-2 rounded-xl text-xs font-bold font-display cursor-pointer transition-all ${
                billingCycle === "monthly"
                  ? "bg-white text-[#0F172A] shadow-sm border border-[#E2E8F0]"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={`px-5 py-2 rounded-xl text-xs font-bold font-display cursor-pointer transition-all flex items-center gap-1.5 ${
                billingCycle === "annual"
                  ? "bg-[#0F172A] text-white shadow-sm"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] bg-[#FFC300] text-[#0F172A] font-extrabold px-1.5 py-0.5 rounded">
                SAVE 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => {
            const price = billingCycle === "annual" ? plan.priceAnnual : plan.priceMonthly;

            return (
              <TiltCard key={plan.name} tiltMax={6} className="h-full">
                <div
                  className={`h-full rounded-3xl p-8 flex flex-col justify-between transition-all relative ${
                    plan.popular
                      ? "bg-gradient-to-b from-[#FFFDF5] to-white border-2 border-[#FFC300] shadow-[0_12px_40px_rgba(255,195,0,0.18)]"
                      : "bg-[#FAFAFA] border border-[#E2E8F0] shadow-sm"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#0F172A] text-[#FFC300] px-4 py-1 rounded-full text-xs font-bold font-mono-data tracking-wider uppercase border border-[#FFC300]/40">
                      ★ MOST POPULAR CHOICE
                    </div>
                  )}

                  <div>
                    <h3 className="font-display text-xl font-bold text-[#0F172A] mb-1">
                      {plan.name}
                    </h3>
                    <p className="font-body text-xs text-[#64748B] min-h-[36px] mb-6">
                      {plan.desc}
                    </p>

                    {/* Price */}
                    <div className="mb-6 pb-6 border-b border-[#F1F5F9]">
                      <div className="flex items-baseline gap-1">
                        <span className="font-display text-4xl sm:text-5xl font-black text-[#0F172A]">
                          ₹{price.toLocaleString("en-IN")}
                        </span>
                        <span className="text-xs font-semibold text-[#64748B]">/ month</span>
                      </div>
                      <span className="text-xs font-mono-data font-semibold text-[#E0AB00] mt-1 block">
                        {plan.calls}
                      </span>
                    </div>

                    {/* Features List */}
                    <div className="space-y-3 mb-8">
                      {plan.features.map((feat) => (
                        <div key={feat} className="flex items-start gap-2.5 text-xs text-[#0F172A]">
                          <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <MagneticButton
                    onClick={onNavigateToAuth}
                    className={`w-full py-3.5 rounded-xl text-xs font-bold tracking-wide ${
                      plan.popular
                        ? "bg-[#0F172A] text-[#FFC300] hover:bg-[#1E293B]"
                        : "bg-white text-[#0F172A] border border-[#E2E8F0] hover:bg-[#F1F5F9]"
                    }`}
                  >
                    Start 14-Day Free Pilot
                  </MagneticButton>
                </div>
              </TiltCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   7. TESTIMONIALS WALL
   ═══════════════════════════════════════════════════════════════════════════════ */
function TestimonialsSection() {
  const testimonials = [
    {
      name: "Dr. Ananya Iyer",
      role: "Founder, SmileCraft Dental Hospital",
      city: "Bengaluru",
      quote: "Before Callify, our front desk missed at least 6 to 8 calls every evening after our clinic closed. Now Callify answers every single patient, books the slot on our calendar, and sends them clinic directions. It paid for itself on day two.",
      stars: 5,
    },
    {
      name: "Rajesh Singhania",
      role: "Managing Director, Apex Real Estate",
      city: "Gurugram",
      quote: "When we run newspaper ads or digital campaigns, our phones blow up with 200 calls in an hour. No human receptionist can handle that queue. Callify took 14 calls concurrently without a second of wait time.",
      stars: 5,
    },
    {
      name: "Karan Johar",
      role: "Owner, Velvet Glow Luxury Salons",
      city: "Mumbai",
      quote: "The Hinglish pronunciation is unbelievable. Our clients don't even realize they are speaking with an AI. It politely handles rescheduling and sends WhatsApp reminders automatically.",
      stars: 5,
    },
  ];

  return (
    <section className="py-28 px-6 bg-[#FAFAFA] relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <SectionBadge icon={Star}>Verified Impact</SectionBadge>
          <h2 className="font-display text-4xl sm:text-5xl font-black text-[#0F172A] tracking-tight descender-safe">
            Loved by Over{" "}
            <HighlightedWord>5,000+ Indian Owners</HighlightedWord>
          </h2>
          <p className="font-body text-lg text-[#64748B] mt-4">
            Hear how healthcare clinics, service centers, and professional practices eliminated missed calls permanently.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <TiltCard key={idx} tiltMax={6} className="h-full">
              <div className="h-full bg-white rounded-3xl border border-[#E2E8F0] p-8 flex flex-col justify-between shadow-sm hover:border-[#FFC300]/50 transition-colors">
                <div>
                  <div className="flex items-center gap-1 text-[#FFC300] mb-4">
                    {[...Array(t.stars)].map((_, i) => (
                      <Star key={i} size={16} fill="#FFC300" strokeWidth={0} />
                    ))}
                  </div>

                  <p className="font-body text-sm text-[#0F172A] leading-relaxed italic mb-6">
                    "{t.quote}"
                  </p>
                </div>

                <div className="pt-4 border-t border-[#F1F5F9]">
                  <h4 className="font-display font-bold text-sm text-[#0F172A]">{t.name}</h4>
                  <p className="text-xs text-[#64748B]">{t.role}</p>
                  <span className="text-[11px] font-mono-data text-[#E0AB00] font-semibold block mt-0.5">
                    📍 {t.city}, India
                  </span>
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   8. FINAL CALL TO ACTION
   ═══════════════════════════════════════════════════════════════════════════════ */
function FinalCTA({ onNavigateToAuth }) {
  return (
    <section className="py-24 px-6 bg-white relative overflow-hidden">
      <div className="max-w-5xl mx-auto relative rounded-3xl bg-gradient-to-br from-[#FFFDF5] via-[#FFF9E6] to-[#FEF08A]/30 border-2 border-[#FFC300]/40 p-10 sm:p-16 shadow-[0_20px_50px_rgba(255,195,0,0.15)] text-center overflow-hidden">
        
        {/* Background Concentric Rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-[#FFC300]/20 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-[#FFC300]/30 pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto">
          <SectionBadge icon={Sparkle}>Start Today in Under 3 Minutes</SectionBadge>
          
          <h2 className="font-display text-4xl sm:text-5xl font-black text-[#0F172A] tracking-tight descender-safe">
            Ready to Never Miss Another Ring?
          </h2>

          <p className="font-body text-base sm:text-lg text-[#64748B] mt-4 mb-8 leading-relaxed">
            Test Callify risk-free for 14 days. We forward your current number with zero downtime or hardware required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <MagneticButton
              onClick={onNavigateToAuth}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#0F172A] text-white hover:bg-[#1E293B] shadow-lg text-base gap-3"
            >
              <span className="font-bold">Deploy Your AI Receptionist</span>
              <ArrowRight size={18} className="text-[#FFC300]" />
            </MagneticButton>
          </div>

          <p className="font-mono-data text-xs text-[#64748B] mt-5">
            🔒 No credit card required • Instant automated setup • 24/7 Concierge Onboarding
          </p>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   9. FOOTER
   ═══════════════════════════════════════════════════════════════════════════════ */
function Footer() {
  return (
    <footer className="bg-[#0F172A] text-white py-16 px-6 border-t border-slate-800">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-800">
          
          <div className="md:col-span-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ backgroundColor: C.accent }}
              >
                <Phone size={18} color={C.fg} strokeWidth={2.5} />
              </div>
              <span className="font-display text-2xl font-black tracking-tight text-white">
                Callify
              </span>
            </div>
            <p className="font-body text-sm text-slate-400 max-w-sm leading-relaxed mb-6">
              India's premier AI voice telephony automation engine. Eliminating unanswered business calls with empathetic multilingual intelligence.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs font-mono-data text-[#FFC300]">
              <span>🇮🇳 Built with pride for Indian Enterprises</span>
            </div>
          </div>

          <div className="md:col-span-2">
            <h4 className="font-display text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">
              Product
            </h4>
            <ul className="space-y-2 text-sm text-slate-400 font-body">
              <li><a href="#live-simulator" className="hover:text-white transition-colors">Live Voice Lab</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#roi-calculator" className="hover:text-white transition-colors">ROI Calculator</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing Plans</a></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="font-display text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">
              Industries
            </h4>
            <ul className="space-y-2 text-sm text-slate-400 font-body">
              <li>Healthcare & Clinics</li>
              <li>Salons & Spas</li>
              <li>Automotive Care</li>
              <li>Real Estate Brokers</li>
              <li>Legal & Consultancy</li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="font-display text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">
              Security & Compliance
            </h4>
            <div className="space-y-2 text-xs text-slate-400 font-mono-data">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>SOC2 Type II Certified Cloud</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>ISO 27001 Data Encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>HIPAA BAA Eligible Architecture</span>
              </div>
            </div>
          </div>

        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-mono-data gap-4">
          <p>© {new Date().getFullYear()} Callify Technologies India Pvt Ltd. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Security Disclosures</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN EXPORT: LANDING PAGE ORCHESTRATOR
   ═══════════════════════════════════════════════════════════════════════════════ */
export default function LandingPage({ onNavigateToAuth }) {
  return (
    <div className="min-h-screen bg-white text-[#0F172A] font-body selection:bg-[#FFC300] selection:text-[#0F172A] overflow-x-clip w-full relative pb-20 md:pb-0">
      <Navbar onNavigateToAuth={onNavigateToAuth} />
      
      <main>
        <HeroSection onNavigateToAuth={onNavigateToAuth} />
        <TrustedBySection />
        <HowItWorksSection />
        <FeaturesSection />
        
        <div id="roi-calculator">
          <RoiCalculator onNavigateToAuth={onNavigateToAuth} />
        </div>
        
        <PricingSection onNavigateToAuth={onNavigateToAuth} />
        <TestimonialsSection />
        <FinalCTA onNavigateToAuth={onNavigateToAuth} />
      </main>

      <Footer />
    </div>
  );
}
