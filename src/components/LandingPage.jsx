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
  Clock,
  Users,
  IndianRupee,
  Headphones,
  Bot,
  Plug,
  Settings2,
  Rocket,
  Quote,
  MapPin,
  Mail,
  PhoneCall,
  PhoneOff,
  Mic,
  Check,
  Volume2,
  VolumeX,
} from "lucide-react";

/* ─────────────────────────── Design Tokens ─────────────────────────── */
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

/* ─────────────────────────── Animation Presets ─────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 60, damping: 18, delay: i * 0.1 },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};

/* ─────────────────────────── Scroll-Triggered Wrapper ─────────────────────────── */
function Reveal({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ type: "spring", stiffness: 60, damping: 18, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────── Highlighted Word Underline ─────────────────────────── */
function HighlightedWord({ children }) {
  return (
    <span className="relative inline-block">
      <span className="relative z-10">{children}</span>
      <svg
        className="absolute -bottom-2 left-0 w-full"
        viewBox="0 0 300 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <motion.path
          d="M2 10 C60 2, 120 14, 180 6 C220 2, 260 12, 298 8"
          stroke={C.accent}
          strokeWidth="5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: "easeInOut", delay: 0.6 }}
        />
      </svg>
    </span>
  );
}

/* ─────────────────────────── Section Badge ─────────────────────────── */
function SectionBadge({ icon: Icon, children }) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold font-display mb-4"
      style={{ backgroundColor: C.accentLight, color: C.accentDark }}
    >
      {Icon && <Icon size={14} />}
      {children}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   NAVIGATION BAR
   ═══════════════════════════════════════════════════════════════════════════════ */
function Navbar({ onNavigateToAuth }) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 80, damping: 20 }}
      className="font-body fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b"
      style={{
        backgroundColor: "rgba(255,255,255,0.88)",
        borderColor: C.border,
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5 group">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl shadow-sm"
            style={{ backgroundColor: C.accent }}
          >
            <Phone size={20} color={C.fg} strokeWidth={2.5} />
          </div>
          <span
            className="font-display text-2xl font-bold tracking-tight"
            style={{ color: C.fg }}
          >
            Callify
          </span>
        </a>

        {/* Links */}
        <div className="hidden md:flex items-center gap-8">
          {["Features", "How It Works", "Pricing", "Testimonials"].map(
            (link) => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-sm font-medium transition-colors duration-200 hover:text-[#E0AB00]"
                style={{ color: C.fgMuted }}
              >
                {link}
              </a>
            )
          )}
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToAuth}
            className="hidden sm:inline-flex text-sm font-semibold transition-colors duration-200 cursor-pointer bg-transparent border-none"
            style={{ color: C.fg }}
          >
            Sign In
          </button>
          <motion.button
            onClick={onNavigateToAuth}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-md transition-shadow duration-300 hover:shadow-lg cursor-pointer border-none"
            style={{ backgroundColor: C.accent, color: C.fg }}
          >
            Get Started Free
            <ArrowRight size={14} />
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   ANIMATED WAVEFORM BARS COMPONENT
   ═══════════════════════════════════════════════════════════════════════════════ */
function AudioWaveform({ isActive, color = C.accent, barCount = 24, maxHeight = 32, minHeight = 3 }) {
  const [heights, setHeights] = useState(() => Array(barCount).fill(minHeight));

  useEffect(() => {
    if (!isActive) {
      setHeights(Array(barCount).fill(minHeight));
      return;
    }
    const interval = setInterval(() => {
      setHeights(prev =>
        prev.map(() =>
          Math.floor(Math.random() * (maxHeight - minHeight)) + minHeight
        )
      );
    }, 120);
    return () => clearInterval(interval);
  }, [isActive, barCount, maxHeight, minHeight]);

  return (
    <div className="flex items-center justify-center gap-[3px]" style={{ height: `${maxHeight}px` }}>
      {heights.map((h, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-150"
          style={{
            width: "3px",
            height: `${h}px`,
            backgroundColor: color,
            opacity: isActive ? 0.6 + Math.random() * 0.4 : 0.15,
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   LIVE CALL TIMER
   ═══════════════════════════════════════════════════════════════════════════════ */
function CallTimer({ isActive }) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isActive]);
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return (
    <span className="font-mono-data text-sm font-bold tabular-nums text-white">
      {m}:{s}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   HERO SECTION — LIVE AI VOICE CALL VISUALIZATION
   ═══════════════════════════════════════════════════════════════════════════════ */
const CALL_SCRIPT = [
  { speaker: "customer", text: "Hi, I'd like to book a haircut for Saturday at 2 PM." },
  { speaker: "ai", text: "Of course! Let me check Saturday's availability for you..." },
  { speaker: "ai", text: "Saturday, 2:00 PM is open with Rahul. I'll book that for you right away." },
  { speaker: "customer", text: "That sounds perfect, thank you!" },
  { speaker: "ai", text: "Done! You'll receive a confirmation on WhatsApp shortly. Have a great day!" },
];

function HeroSection({ onNavigateToAuth }) {
  const [currentLine, setCurrentLine] = useState(-1);
  const [displayedText, setDisplayedText] = useState("");
  const [activeSpeaker, setActiveSpeaker] = useState(null); // 'customer' | 'ai' | null
  const [transcriptLines, setTranscriptLines] = useState([]);
  const [callState, setCallState] = useState("active"); // 'active' | 'completed'

  const lineTimerRef = useRef(null);
  const charTimerRef = useRef(null);

  // Sequentially reveal conversation lines with typewriter effect
  useEffect(() => {
    const startNextLine = (lineIdx) => {
      if (lineIdx >= CALL_SCRIPT.length) {
        setActiveSpeaker(null);
        setCallState("completed");
        return;
      }

      const line = CALL_SCRIPT[lineIdx];
      setCurrentLine(lineIdx);
      setActiveSpeaker(line.speaker);
      setDisplayedText("");

      let charIdx = 0;
      const typeChar = () => {
        if (charIdx <= line.text.length) {
          setDisplayedText(line.text.slice(0, charIdx));
          charIdx++;
          charTimerRef.current = setTimeout(typeChar, 28 + Math.random() * 22);
        } else {
          // Finished typing — add to transcript, pause, then move to next
          setTranscriptLines(prev => [...prev, { speaker: line.speaker, text: line.text }]);
          setActiveSpeaker(null);
          lineTimerRef.current = setTimeout(() => startNextLine(lineIdx + 1), 1200);
        }
      };
      charTimerRef.current = setTimeout(typeChar, 600);
    };

    // Initial delay before starting
    lineTimerRef.current = setTimeout(() => startNextLine(0), 2000);

    return () => {
      clearTimeout(lineTimerRef.current);
      clearTimeout(charTimerRef.current);
    };
  }, []);

  const currentSpeakerLabel = callState === "completed"
    ? "Call Completed"
    : activeSpeaker === "customer"
    ? "Customer Speaking..."
    : activeSpeaker === "ai"
    ? "Callify AI Speaking..."
    : "Listening...";

  return (
    <section
      className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24"
      style={{ backgroundColor: C.bg }}
    >
      {/* Radial glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[700px] w-[1000px] rounded-full blur-3xl opacity-25"
        style={{ background: "radial-gradient(circle, rgba(255,195,0,0.3) 0%, transparent 70%)" }}
      />
      <div className="absolute inset-0 light-dot-grid pointer-events-none opacity-40" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column — Copy */}
          <div>
            <Reveal>
              <SectionBadge icon={Sparkles}>
                🇮🇳 Built for Indian Businesses
              </SectionBadge>
            </Reveal>

            <Reveal delay={0.1}>
              <h1
                className="font-display text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.08] tracking-tight"
                style={{ color: C.fg }}
              >
                India's Smartest{" "}
                <HighlightedWord>AI Receptionist</HighlightedWord>
              </h1>
            </Reveal>

            <Reveal delay={0.2}>
              <p
                className="font-body mt-6 text-lg md:text-xl leading-relaxed max-w-xl"
                style={{ color: C.fgMuted }}
              >
                Never miss a customer call again. Callify answers every call in
                Hindi, English & 12+ Indian languages — books appointments,
                answers FAQs, and routes urgent calls — 24/7, at a fraction of
                the cost.
              </p>
            </Reveal>

            <Reveal delay={0.3}>
              <div className="mt-8 flex flex-col sm:flex-row items-start gap-4">
                <motion.button
                  onClick={onNavigateToAuth}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 8px 30px rgba(255,195,0,0.35)",
                  }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2.5 rounded-full px-8 py-4 text-base font-semibold font-body shadow-lg cursor-pointer border-none"
                  style={{ backgroundColor: C.accent, color: C.fg }}
                >
                  Start Free 14-Day Trial
                  <ArrowRight size={16} />
                </motion.button>

                <motion.a
                  href="#how-it-works"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2.5 rounded-full border-2 px-8 py-4 text-base font-semibold font-body cursor-pointer no-underline"
                  style={{ borderColor: C.borderStrong, color: C.fg }}
                >
                  <Headphones size={18} />
                  See How It Works
                </motion.a>
              </div>
            </Reveal>

            {/* Trust Row */}
            <Reveal delay={0.4}>
              <div
                className="mt-8 flex flex-wrap items-center gap-6 font-body text-sm"
                style={{ color: C.fgMuted }}
              >
                {[
                  "No credit card required",
                  "14-day free trial",
                  "Cancel anytime",
                ].map((item) => (
                  <span key={item} className="flex items-center gap-1.5">
                    <CheckCircle2 size={14} color={C.accent} />
                    {item}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>

          {/* ═══════════ Right Column — Live AI Voice Call Demo ═══════════ */}
          <Reveal delay={0.3} className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[500px]">

              {/* ── Floating "Appointment Booked" badge ── */}
              <motion.div
                animate={{ y: [6, -6, 6] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl border px-4 py-3 flex items-center gap-3 z-20"
                style={{ borderColor: C.border }}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "#DCFCE7" }}>
                  <CheckCircle2 size={20} color="#22C55E" />
                </div>
                <div>
                  <p className="font-display text-sm font-bold" style={{ color: C.fg }}>Appointment Booked</p>
                  <p className="font-body text-xs" style={{ color: C.fgMuted }}>Tomorrow, 3:00 PM</p>
                </div>
              </motion.div>

              {/* ── Floating "AI Active" badge ── */}
              <motion.div
                animate={{ y: [-6, 6, -6] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg border px-3 py-2 flex items-center gap-2 z-20"
                style={{ borderColor: C.border }}
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className="font-body text-xs font-semibold" style={{ color: C.fg }}>AI Active</span>
              </motion.div>

              {/* ════════ Main Call Card ════════ */}
              <div
                className="relative rounded-3xl overflow-hidden"
                style={{
                  backgroundColor: C.bg,
                  border: `1px solid ${C.borderStrong}`,
                  boxShadow: "0 25px 60px rgba(15,23,42,0.10), 0 10px 25px rgba(15,23,42,0.06)",
                }}
              >
                {/* ── Top Bar: Call Status ── */}
                <div
                  className="px-6 py-4 flex items-center justify-between"
                  style={{ backgroundColor: C.fg }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: C.accent }}>
                      <Phone size={14} color={C.fg} strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="font-display text-sm font-bold text-white">
                        {callState === "active" ? "Live Voice Call" : "Call Completed"}
                      </p>
                      <p className="font-body text-[11px] flex items-center gap-1.5" style={{ color: callState === "active" ? "#4ADE80" : "#94A3B8" }}>
                        <span className="relative flex h-1.5 w-1.5">
                          {callState === "active" && (
                            <span className="absolute inline-flex h-full w-full rounded-full bg-[#4ADE80] opacity-75 animate-ping" />
                          )}
                          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${callState === "active" ? "bg-[#4ADE80]" : "bg-gray-400"}`} />
                        </span>
                        {callState === "active" ? "Connected" : "Disconnected"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CallTimer isActive={callState === "active"} />
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-red-500/20">
                      <PhoneOff size={14} color="#EF4444" />
                    </div>
                  </div>
                </div>

                {/* ── Caller Avatars + Waveform ── */}
                <div className="px-6 py-8">
                  <div className="flex items-center justify-between gap-4">
                    {/* Customer Avatar */}
                    <div className="flex flex-col items-center gap-3 flex-1">
                      <div className="relative">
                        <motion.div
                          animate={activeSpeaker === "customer" ? { scale: [1, 1.08, 1] } : {}}
                          transition={{ duration: 0.8, repeat: Infinity }}
                          className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
                          style={{
                            backgroundColor: activeSpeaker === "customer" ? C.accentLight : C.surface,
                            border: `3px solid ${activeSpeaker === "customer" ? C.accent : C.borderStrong}`,
                            transition: "border-color 0.3s, background-color 0.3s",
                          }}
                        >
                          <span className="font-display text-2xl font-bold" style={{ color: activeSpeaker === "customer" ? C.accentDark : C.fgMuted }}>👤</span>
                        </motion.div>
                        {activeSpeaker === "customer" && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-md"
                            style={{ backgroundColor: C.accent }}
                          >
                            <Mic size={12} color={C.fg} />
                          </motion.div>
                        )}
                      </div>
                      <div className="text-center">
                        <p className="font-display text-sm font-bold" style={{ color: C.fg }}>Customer</p>
                        <p className="font-body text-[11px]" style={{ color: C.fgMuted }}>+91 98765 XXXXX</p>
                      </div>
                    </div>

                    {/* Connection Indicator */}
                    <div className="flex flex-col items-center gap-2 px-2">
                      {/* Animated connection dots */}
                      <div className="flex items-center gap-1">
                        {[0, 1, 2, 3, 4].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ opacity: [0.2, 1, 0.2] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: C.accent }}
                          />
                        ))}
                      </div>
                      <div
                        className="px-3 py-1 rounded-full"
                        style={{ backgroundColor: C.accentLight }}
                      >
                        <Phone size={12} color={C.accentDark} />
                      </div>
                      <div className="flex items-center gap-1">
                        {[0, 1, 2, 3, 4].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ opacity: [0.2, 1, 0.2] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.75 + i * 0.2 }}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: C.accent }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* AI Avatar */}
                    <div className="flex flex-col items-center gap-3 flex-1">
                      <div className="relative">
                        <motion.div
                          animate={activeSpeaker === "ai" ? { scale: [1, 1.08, 1] } : {}}
                          transition={{ duration: 0.8, repeat: Infinity }}
                          className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
                          style={{
                            backgroundColor: activeSpeaker === "ai" ? C.accent : C.surface,
                            border: `3px solid ${activeSpeaker === "ai" ? C.accentDark : C.borderStrong}`,
                            transition: "border-color 0.3s, background-color 0.3s",
                          }}
                        >
                          <Bot size={28} color={activeSpeaker === "ai" ? C.fg : C.fgMuted} />
                        </motion.div>
                        {activeSpeaker === "ai" && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-md"
                            style={{ backgroundColor: C.accent }}
                          >
                            <Volume2 size={12} color={C.fg} />
                          </motion.div>
                        )}
                      </div>
                      <div className="text-center">
                        <p className="font-display text-sm font-bold" style={{ color: C.fg }}>Callify AI</p>
                        <p className="font-body text-[11px]" style={{ color: C.fgMuted }}>AI Receptionist</p>
                      </div>
                    </div>
                  </div>

                  {/* ── Audio Waveform Visualization ── */}
                  <div
                    className="mt-6 rounded-2xl px-4 py-4 flex flex-col items-center gap-2"
                    style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}
                  >
                    <div className="flex items-center gap-2 w-full justify-center mb-1">
                      <span className="relative flex h-2 w-2">
                        {activeSpeaker && (
                          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                        )}
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${activeSpeaker ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                      </span>
                      <span className="font-body text-xs font-medium" style={{ color: activeSpeaker ? C.fg : C.fgMuted }}>
                        {currentSpeakerLabel}
                      </span>
                    </div>
                    <AudioWaveform
                      isActive={!!activeSpeaker}
                      color={activeSpeaker === "ai" ? C.accent : activeSpeaker === "customer" ? "#64748B" : C.borderStrong}
                      barCount={28}
                      maxHeight={28}
                      minHeight={3}
                    />
                  </div>
                </div>

                {/* ── Live Transcript Panel ── */}
                <div
                  className="mx-6 mb-6 rounded-2xl overflow-hidden"
                  style={{ border: `1px solid ${C.border}` }}
                >
                  <div
                    className="px-4 py-2.5 flex items-center justify-between"
                    style={{ backgroundColor: C.surface, borderBottom: `1px solid ${C.border}` }}
                  >
                    <span className="font-body text-[11px] font-semibold uppercase tracking-wider" style={{ color: C.fgMuted }}>Live Transcript</span>
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                    </span>
                  </div>
                  <div className="px-4 py-3 space-y-2.5 max-h-[180px] overflow-y-auto modern-scrollbar" style={{ backgroundColor: C.bg }}>
                    {/* Completed transcript lines */}
                    {transcriptLines.map((line, i) => (
                      <div key={i} className="flex gap-2.5">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{
                            backgroundColor: line.speaker === "ai" ? C.accentLight : C.surface,
                            border: `1px solid ${line.speaker === "ai" ? C.accent + "40" : C.borderStrong}`,
                          }}
                        >
                          {line.speaker === "ai"
                            ? <Bot size={11} color={C.accentDark} />
                            : <span className="text-[10px]">👤</span>
                          }
                        </div>
                        <div>
                          <p className="font-body text-[10px] font-semibold mb-0.5" style={{ color: line.speaker === "ai" ? C.accentDark : C.fgMuted }}>
                            {line.speaker === "ai" ? "Callify AI" : "Customer"}
                          </p>
                          <p className="font-body text-xs leading-relaxed" style={{ color: C.fg }}>
                            "{line.text}"
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Currently typing line */}
                    {activeSpeaker && displayedText && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-2.5"
                      >
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{
                            backgroundColor: activeSpeaker === "ai" ? C.accentLight : C.surface,
                            border: `1px solid ${activeSpeaker === "ai" ? C.accent + "40" : C.borderStrong}`,
                          }}
                        >
                          {activeSpeaker === "ai"
                            ? <Bot size={11} color={C.accentDark} />
                            : <span className="text-[10px]">👤</span>
                          }
                        </div>
                        <div>
                          <p className="font-body text-[10px] font-semibold mb-0.5" style={{ color: activeSpeaker === "ai" ? C.accentDark : C.fgMuted }}>
                            {activeSpeaker === "ai" ? "Callify AI" : "Customer"}
                          </p>
                          <p className="font-body text-xs leading-relaxed" style={{ color: C.fg }}>
                            "{displayedText}"
                            <motion.span
                              animate={{ opacity: [1, 0] }}
                              transition={{ duration: 0.5, repeat: Infinity }}
                              className="inline-block w-0.5 h-3.5 ml-0.5 rounded-full align-middle"
                              style={{ backgroundColor: C.accent }}
                            />
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {/* Idle state */}
                    {transcriptLines.length === 0 && !activeSpeaker && (
                      <div className="flex items-center justify-center py-4">
                        <motion.div
                          animate={{ opacity: [0.3, 0.8, 0.3] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="flex items-center gap-2"
                        >
                          <Phone size={14} color={C.fgMuted} />
                          <span className="font-body text-xs" style={{ color: C.fgMuted }}>Connecting call...</span>
                        </motion.div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   TRUSTED BY SECTION
   ═══════════════════════════════════════════════════════════════════════════════ */
function TrustedBySection() {
  const industries = [
    "Dental Clinics",
    "Beauty Salons",
    "Law Firms",
    "Hotels & Resorts",
    "Real Estate",
    "Hospitals",
    "Auto Dealerships",
    "Fitness Studios",
    "CA Firms",
    "Restaurants",
    "Dental Clinics",
    "Beauty Salons",
    "Law Firms",
    "Hotels & Resorts",
    "Real Estate",
    "Hospitals",
    "Auto Dealerships",
    "Fitness Studios",
    "CA Firms",
    "Restaurants",
  ];

  return (
    <section className="py-12 border-y" style={{ backgroundColor: C.surface, borderColor: C.border }}>
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-center font-body text-sm font-medium mb-8" style={{ color: C.fgMuted }}>
          Trusted by <span className="font-bold" style={{ color: C.fg }}>5,000+</span> businesses across India
        </p>
        <div className="overflow-hidden relative">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#FAFAFA] to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#FAFAFA] to-transparent z-10" />
          <div className="flex animate-marquee whitespace-nowrap">
            {industries.map((name, i) => (
              <div
                key={i}
                className="flex items-center gap-2 mx-8 flex-shrink-0"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: C.accentLight }}>
                  <Users size={14} color={C.accentDark} />
                </div>
                <span
                  className="font-display text-sm font-semibold whitespace-nowrap"
                  style={{ color: C.fgMuted }}
                >
                  {name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   STATS BAR
   ═══════════════════════════════════════════════════════════════════════════════ */
function StatsBar() {
  const stats = [
    { value: "5,000+", label: "Indian Businesses" },
    { value: "10L+", label: "Calls Answered" },
    { value: "99.9%", label: "Uptime SLA" },
    { value: "₹2", label: "Avg Cost / Call", icon: null },
  ];

  return (
    <section className="py-16" style={{ backgroundColor: C.bg }}>
      <div className="mx-auto max-w-5xl px-6">
        <Reveal>
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 rounded-3xl px-8 py-10"
            style={{
              backgroundColor: C.surface,
              border: `1px solid ${C.border}`,
              boxShadow: "0 4px 24px rgba(15,23,42,0.04)",
            }}
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <span className="font-display text-3xl md:text-4xl font-bold" style={{ color: C.fg }}>
                    {stat.value}
                  </span>
                </div>
                <span className="font-body text-sm mt-1 block" style={{ color: C.fgMuted }}>
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   FEATURES SECTION
   ═══════════════════════════════════════════════════════════════════════════════ */
const FEATURES = [
  {
    icon: Phone,
    title: "24/7 Call Answering",
    description:
      "Never lose a lead again. Callify picks up every call instantly with a warm, natural greeting — day or night, weekends and public holidays included.",
  },
  {
    icon: CalendarCheck,
    title: "Smart Scheduling",
    description:
      "Syncs with Google Calendar, Calendly, and Practo. Your AI receptionist books, reschedules, and confirms appointments autonomously.",
  },
  {
    icon: Globe,
    title: "Hindi + 12 Languages",
    description:
      "Speak to your customers in Hindi, Tamil, Telugu, Kannada, Bengali, Marathi, and more. Callify auto-detects language and switches seamlessly.",
  },
  {
    icon: MessageSquare,
    title: "WhatsApp Integration",
    description:
      "Send appointment confirmations, follow-ups, and receipts directly to your customer's WhatsApp. Deeply integrated with WhatsApp Business API.",
  },
  {
    icon: ShieldCheck,
    title: "TRAI Compliant",
    description:
      "Fully compliant with TRAI regulations and Indian data protection laws. All calls are encrypted and your data stays in Indian data centres.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description:
      "Track call volume, resolution rates, peak hours, and customer sentiment — all from a beautiful, real-time dashboard built for Indian time zones.",
  },
];

function FeatureCard({ feature, index }) {
  const Icon = feature.icon;
  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      whileHover={{
        y: -6,
        boxShadow: "0 20px 40px rgba(255,195,0,0.08), 0 8px 16px rgba(15,23,42,0.04)",
      }}
      className="group relative rounded-2xl p-8 transition-all duration-300 cursor-default"
      style={{
        backgroundColor: C.bg,
        border: `1px solid ${C.border}`,
        boxShadow: "0 4px 20px rgba(15,23,42,0.04)",
      }}
    >
      <div
        className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl transition-colors duration-300 group-hover:bg-[#FFC300]/20"
        style={{ backgroundColor: C.accentLight }}
      >
        <Icon size={22} color={C.accent} strokeWidth={2} />
      </div>
      <h3 className="font-display text-lg font-bold mb-2" style={{ color: C.fg }}>
        {feature.title}
      </h3>
      <p className="font-body text-sm leading-relaxed" style={{ color: C.fgMuted }}>
        {feature.description}
      </p>
    </motion.div>
  );
}

function FeaturesSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="features" className="relative py-24 md:py-32" style={{ backgroundColor: C.surface }}>
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center mb-16">
            <SectionBadge icon={Zap}>Powerful Features</SectionBadge>
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight" style={{ color: C.fg }}>
              Everything You Need to{" "}
              <span style={{ color: C.accent }}>Automate</span> Your Front Desk
            </h2>
            <p className="font-body mt-4 text-lg" style={{ color: C.fgMuted }}>
              From call handling to appointment booking, Callify covers every
              aspect of your customer communication.
            </p>
          </div>
        </Reveal>

        <motion.div
          ref={ref}
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   HOW IT WORKS
   ═══════════════════════════════════════════════════════════════════════════════ */
function HowItWorksSection() {
  const steps = [
    {
      icon: Plug,
      number: "01",
      title: "Connect Your Number",
      description:
        "Link your existing business phone number or get a new virtual number. Setup takes under 2 minutes — no hardware needed.",
    },
    {
      icon: Settings2,
      number: "02",
      title: "Customize Your AI",
      description:
        "Tell Callify about your business, services, pricing, and operating hours. Train it with your FAQs and preferred greeting style.",
    },
    {
      icon: Rocket,
      number: "03",
      title: "Go Live Instantly",
      description:
        "That's it! Your AI receptionist starts answering calls immediately. Monitor everything from your real-time dashboard.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-24 md:py-32"
      style={{ backgroundColor: C.bg }}
    >
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center mb-16">
            <SectionBadge icon={Clock}>Quick Setup</SectionBadge>
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight" style={{ color: C.fg }}>
              Go Live in{" "}
              <span style={{ color: C.accent }}>3 Simple Steps</span>
            </h2>
            <p className="font-body mt-4 text-lg" style={{ color: C.fgMuted }}>
              No technical expertise required. Get your AI receptionist up and
              running in under 5 minutes.
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <Reveal key={step.number} delay={i * 0.15}>
                <div className="relative text-center group">
                  {/* Connector line */}
                  {i < steps.length - 1 && (
                    <div
                      className="hidden md:block absolute top-16 left-[60%] w-[80%] h-px"
                      style={{ backgroundColor: C.borderStrong }}
                    />
                  )}

                  {/* Icon circle */}
                  <div className="relative inline-flex mb-6">
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                      style={{ backgroundColor: C.accent }}
                    >
                      <Icon size={32} color={C.fg} strokeWidth={1.5} />
                    </div>
                    <span
                      className="absolute -top-2 -right-2 w-7 h-7 rounded-full font-display text-xs font-bold flex items-center justify-center shadow-md"
                      style={{ backgroundColor: C.fg, color: "#fff" }}
                    >
                      {step.number}
                    </span>
                  </div>

                  <h3 className="font-display text-xl font-bold mb-3" style={{ color: C.fg }}>
                    {step.title}
                  </h3>
                  <p className="font-body text-sm leading-relaxed max-w-xs mx-auto" style={{ color: C.fgMuted }}>
                    {step.description}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   PRICING SECTION
   ═══════════════════════════════════════════════════════════════════════════════ */
function PricingSection({ onNavigateToAuth }) {
  const plans = [
    {
      name: "Starter",
      price: "₹1,999",
      period: "/month",
      description: "Perfect for small clinics, salons & solo professionals",
      featured: false,
      features: [
        "Up to 200 calls/month",
        "1 Phone number",
        "Hindi + English support",
        "Google Calendar sync",
        "WhatsApp notifications",
        "Email support",
      ],
    },
    {
      name: "Professional",
      price: "₹4,999",
      period: "/month",
      description: "Ideal for growing businesses & multi-location brands",
      featured: true,
      features: [
        "Up to 1,000 calls/month",
        "3 Phone numbers",
        "12+ Indian languages",
        "All calendar integrations",
        "WhatsApp Business API",
        "CRM integration",
        "Priority support",
        "Custom AI training",
      ],
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large organisations with custom requirements",
      featured: false,
      features: [
        "Unlimited calls",
        "Unlimited numbers",
        "All languages",
        "Custom integrations",
        "Dedicated account manager",
        "SLA guarantee",
        "On-premise option",
        "White-label available",
      ],
    },
  ];

  return (
    <section id="pricing" className="py-24 md:py-32" style={{ backgroundColor: C.surface }}>
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center mb-16">
            <SectionBadge icon={IndianRupee}>Simple Pricing</SectionBadge>
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight" style={{ color: C.fg }}>
              Plans That{" "}
              <span style={{ color: C.accent }}>Scale</span> With You
            </h2>
            <p className="font-body mt-4 text-lg" style={{ color: C.fgMuted }}>
              Start free for 14 days. No credit card required.
              All prices are in INR exclusive of GST.
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-8 items-start">
          {plans.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 0.12}>
              <div
                className={`relative rounded-3xl p-8 transition-all duration-300 ${
                  plan.featured
                    ? "shadow-xl scale-[1.02] md:scale-105"
                    : "shadow-md hover:shadow-lg"
                }`}
                style={{
                  backgroundColor: plan.featured ? C.fg : C.bg,
                  border: plan.featured ? "none" : `1px solid ${C.border}`,
                }}
              >
                {plan.featured && (
                  <span
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full px-4 py-1 text-xs font-bold font-display shadow-md"
                    style={{ backgroundColor: C.accent, color: C.fg }}
                  >
                    <Star size={12} fill={C.fg} /> Most Popular
                  </span>
                )}

                <h3
                  className="font-display text-xl font-bold"
                  style={{ color: plan.featured ? "#fff" : C.fg }}
                >
                  {plan.name}
                </h3>
                <p
                  className="font-body text-sm mt-1"
                  style={{ color: plan.featured ? "rgba(255,255,255,0.6)" : C.fgMuted }}
                >
                  {plan.description}
                </p>

                <div className="mt-6 mb-8">
                  <span
                    className="font-display text-4xl font-bold"
                    style={{ color: plan.featured ? C.accent : C.fg }}
                  >
                    {plan.price}
                  </span>
                  <span
                    className="font-body text-base ml-1"
                    style={{ color: plan.featured ? "rgba(255,255,255,0.5)" : C.fgMuted }}
                  >
                    {plan.period}
                  </span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <Check
                        size={16}
                        color={plan.featured ? C.accent : "#22C55E"}
                        strokeWidth={2.5}
                      />
                      <span
                        className="font-body text-sm"
                        style={{ color: plan.featured ? "rgba(255,255,255,0.8)" : C.fgMuted }}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <motion.button
                  onClick={onNavigateToAuth}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full rounded-full py-3.5 text-sm font-semibold font-body cursor-pointer border-none transition-all"
                  style={{
                    backgroundColor: plan.featured ? C.accent : C.accentLight,
                    color: C.fg,
                    boxShadow: plan.featured
                      ? "0 4px 14px rgba(255,195,0,0.3)"
                      : "none",
                  }}
                >
                  {plan.name === "Enterprise" ? "Contact Sales" : "Start Free Trial"}
                </motion.button>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   TESTIMONIALS
   ═══════════════════════════════════════════════════════════════════════════════ */
function TestimonialsSection() {
  const testimonials = [
    {
      name: "Dr. Priya Sharma",
      role: "Owner, Smile Dental Clinic, Mumbai",
      text: "Callify has been a game-changer for our clinic. We used to miss 30% of patient calls during procedures. Now every call is answered, appointments are booked, and patients love the Hindi + English support!",
      rating: 5,
    },
    {
      name: "Rajesh Mehta",
      role: "Founder, Luxe Salon Chain, Delhi NCR",
      text: "We deployed Callify across our 8 salon locations. The ROI was immediate — our booking rate went up 45% in the first month, and we no longer need a full-time receptionist at each branch.",
      rating: 5,
    },
    {
      name: "Advocate Sneha Iyer",
      role: "Partner, Iyer & Associates, Bangalore",
      text: "As a law firm, we can't afford to miss potential client calls. Callify filters spam, handles initial inquiries, and routes urgent matters to me directly. The WhatsApp integration is brilliant!",
      rating: 5,
    },
  ];

  return (
    <section id="testimonials" className="py-24 md:py-32" style={{ backgroundColor: C.bg }}>
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center mb-16">
            <SectionBadge icon={Quote}>Customer Love</SectionBadge>
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight" style={{ color: C.fg }}>
              Trusted by{" "}
              <span style={{ color: C.accent }}>India's Best</span> Businesses
            </h2>
            <p className="font-body mt-4 text-lg" style={{ color: C.fgMuted }}>
              See what business owners across India are saying about Callify.
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.12}>
              <div
                className="rounded-2xl p-8 h-full flex flex-col justify-between"
                style={{
                  backgroundColor: C.surface,
                  border: `1px solid ${C.border}`,
                  boxShadow: "0 4px 20px rgba(15,23,42,0.04)",
                }}
              >
                {/* Stars */}
                <div>
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} size={16} fill={C.accent} color={C.accent} />
                    ))}
                  </div>
                  <p className="font-body text-sm leading-relaxed" style={{ color: C.fgMuted }}>
                    "{t.text}"
                  </p>
                </div>

                {/* Author */}
                <div className="flex items-center gap-3 mt-6 pt-6 border-t" style={{ borderColor: C.border }}>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-display text-sm font-bold"
                    style={{ backgroundColor: C.accentLight, color: C.accentDark }}
                  >
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-display text-sm font-bold" style={{ color: C.fg }}>
                      {t.name}
                    </p>
                    <p className="font-body text-xs" style={{ color: C.fgMuted }}>
                      {t.role}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   FINAL CTA
   ═══════════════════════════════════════════════════════════════════════════════ */
function FinalCTA({ onNavigateToAuth }) {
  return (
    <section className="relative overflow-hidden py-24 md:py-32" style={{ backgroundColor: C.accent }}>
      {/* Decorative elements */}
      <div className="pointer-events-none absolute -top-20 -left-20 h-60 w-60 rounded-full opacity-20" style={{ backgroundColor: "#fff" }} />
      <div className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full opacity-15" style={{ backgroundColor: "#fff" }} />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)" }}
      />

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <Reveal>
          <h2
            className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight"
            style={{ color: C.fg }}
          >
            Ready to Never Miss
            <br />a Call Again?
          </h2>
        </Reveal>

        <Reveal delay={0.15}>
          <p
            className="font-body mt-6 text-lg md:text-xl max-w-xl mx-auto"
            style={{ color: "rgba(15,23,42,0.7)" }}
          >
            Join 5,000+ Indian businesses already using Callify to delight
            customers and save hours every week.
          </p>
        </Reveal>

        <Reveal delay={0.25}>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              onClick={onNavigateToAuth}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 8px 30px rgba(15,23,42,0.15)",
              }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2.5 rounded-full px-8 py-4 text-base font-semibold font-body shadow-lg cursor-pointer border-none"
              style={{ backgroundColor: C.fg, color: "#FFFFFF" }}
            >
              Get Started for Free
              <ArrowRight size={16} />
            </motion.button>

            <motion.a
              href="mailto:hello@callify.in"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-full border-2 px-8 py-4 text-base font-semibold font-body cursor-pointer no-underline"
              style={{ borderColor: "rgba(15,23,42,0.2)", color: C.fg }}
            >
              Talk to Sales
            </motion.a>
          </div>
        </Reveal>

        <Reveal delay={0.35}>
          <div
            className="mt-8 flex flex-wrap items-center justify-center gap-6 font-body text-sm"
            style={{ color: "rgba(15,23,42,0.6)" }}
          >
            {["Free 14-day trial", "No setup fees", "Cancel anytime"].map(
              (item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} color={C.fg} />
                  {item}
                </span>
              )
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════════════════════════════════ */
function Footer() {
  const footerLinks = {
    Product: ["Features", "Pricing", "Integrations", "Changelog"],
    Company: ["About", "Careers", "Blog", "Press"],
    Resources: ["Documentation", "API Reference", "Community", "Status"],
    Legal: ["Privacy Policy", "Terms of Service", "Security", "DPDP Compliance"],
  };

  return (
    <footer className="py-16 border-t" style={{ backgroundColor: C.bg, borderColor: C.border }}>
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 md:grid-cols-6">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <a href="#" className="flex items-center gap-2 mb-4 no-underline">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ backgroundColor: C.accent }}
              >
                <Phone size={18} color={C.fg} strokeWidth={2.5} />
              </div>
              <span className="font-display text-xl font-bold" style={{ color: C.fg }}>
                Callify
              </span>
            </a>
            <p className="font-body text-sm leading-relaxed mb-4" style={{ color: C.fgMuted }}>
              India's smartest AI voice receptionist platform.
              Trusted by 5,000+ businesses across the country.
            </p>
            <div className="flex items-center gap-2 font-body text-xs" style={{ color: C.fgMuted }}>
              <MapPin size={12} />
              <span>Mumbai, Maharashtra, India</span>
            </div>
            <div className="flex items-center gap-2 font-body text-xs mt-1" style={{ color: C.fgMuted }}>
              <Mail size={12} />
              <span>hello@callify.in</span>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="font-body text-sm font-semibold mb-4" style={{ color: C.fg }}>
                {section}
              </h4>
              <ul className="space-y-3 list-none p-0 m-0">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="font-body text-sm transition-colors duration-200 hover:text-[#FFC300] no-underline"
                      style={{ color: C.fgMuted }}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div
          className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-8"
          style={{ borderColor: C.border }}
        >
          <span className="font-body text-xs" style={{ color: C.fgMuted }}>
            © {new Date().getFullYear()} Callify Technologies Pvt. Ltd. All rights reserved.
          </span>
          <div className="flex items-center gap-4">
            {["Twitter", "LinkedIn", "Instagram", "YouTube"].map((social) => (
              <a
                key={social}
                href="#"
                className="font-body text-xs transition-colors duration-200 hover:text-[#FFC300] no-underline"
                style={{ color: C.fgMuted }}
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN LANDING PAGE EXPORT
   ═══════════════════════════════════════════════════════════════════════════════ */
export default function LandingPage({ onNavigateToAuth }) {
  return (
    <div className="min-h-screen font-body" style={{ backgroundColor: C.bg, color: C.fg }}>
      <Navbar onNavigateToAuth={onNavigateToAuth} />
      <main>
        <HeroSection onNavigateToAuth={onNavigateToAuth} />
        <TrustedBySection />
        <StatsBar />
        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection onNavigateToAuth={onNavigateToAuth} />
        <TestimonialsSection />
        <FinalCTA onNavigateToAuth={onNavigateToAuth} />
      </main>
      <Footer />
    </div>
  );
}
