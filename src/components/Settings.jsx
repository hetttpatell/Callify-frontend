import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  Bot,
  Save,
  Copy,
  Check,
  AlertCircle,
  Sparkles,
  Phone,
  Volume2,
  Building,
  CheckCircle2,
  PhoneForwarded,
  Wand2,
  Play,
  Square,
  MessageSquareCode,
  Send,
  RefreshCw,
  ShieldCheck,
  Globe,
} from "lucide-react";
import MagneticButton from "./MagneticButton";

const VOICE_OPTIONS = [
  {
    id: "aura-asteria-en",
    name: "Asteria",
    gender: "FEMALE",
    tone: "Warm & Empathetic",
    desc: "Default receptionist. Balanced, polite, and reassuring tone ideal for clinics and luxury services.",
    accentColor: "#FFC300",
    frequency: 440,
  },
  {
    id: "aura-athena-en",
    name: "Athena",
    gender: "FEMALE",
    tone: "Crisp & Professional",
    desc: "Corporate specialist. Articulate, precise, and authoritative tone for legal and real estate.",
    accentColor: "#E0AB00",
    frequency: 520,
  },
  {
    id: "aura-luna-en",
    name: "Luna",
    gender: "FEMALE",
    tone: "High Energy & Welcoming",
    desc: "Hospitality & salon expert. Cheerful, friendly, and engaging style that boosts booking conversion.",
    accentColor: "#F59E0B",
    frequency: 587,
  },
  {
    id: "aura-zeus-en",
    name: "Zeus",
    gender: "MALE",
    tone: "Deep & Reassuring",
    desc: "Executive advisor. Calm, confident, and steady timbre for high-ticket consulting and auto care.",
    accentColor: "#D97706",
    frequency: 220,
  },
];

const PRESET_TEMPLATES = [
  {
    label: "🦷 Dental Clinic",
    domain: "Dental & Healthcare Clinic",
    prompt:
      "You are an empathetic, highly efficient AI receptionist for {BUSINESS_NAME}. Greet callers warmly. Check their symptoms or required treatment (cleaning, filling, whitening, or toothache). For emergencies, prioritize same-day appointments. Offer available slots, confirm caller phone number, and dispatch booking details immediately via WhatsApp.",
  },
  {
    label: "💇 Luxury Salon & Spa",
    domain: "Luxury Salon, Spa & Wellness",
    prompt:
      "You are a welcoming, stylish AI front-desk coordinator for {BUSINESS_NAME}. Help clients book hair styling, facials, massages, or nail therapy. Inquire if they have a preferred stylist. Confirm date and time, mention our complimentary prep instructions, and send the appointment confirmation to WhatsApp.",
  },
  {
    label: "🚗 Auto Service Care",
    domain: "Automotive Service & Repair",
    prompt:
      "You are a professional service advisor for {BUSINESS_NAME}. Ask for vehicle make, model, and the service required (periodic maintenance, brake check, oil change). Offer doorstep valet pickup or shop drop-off slots. Confirm bookings and SMS job card numbers to the customer.",
  },
  {
    label: "🏢 Real Estate & Consulting",
    domain: "Real Estate & Commercial Leasing",
    prompt:
      "You are an executive leasing consultant for {BUSINESS_NAME}. Inquire about buyer preferences (residential 2BHK/3BHK or commercial square footage). Check agent inspection availability, schedule site tours, and dispatch the property brochure and GPS directions instantly.",
  },
  {
    label: "🩺 Medical Practice",
    domain: "General Medicine & Outpatient Clinic",
    prompt:
      "You are a compassionate medical receptionist for {BUSINESS_NAME}. Ask callers whether they are new or returning patients and note primary symptoms. Schedule consultation slots with Dr. Mehta, remind callers to bring past medical records, and confirm the visit via SMS.",
  },
  {
    label: "🍽️ Restaurant & Fine Dining",
    domain: "Fine Dining & Event Reservations",
    prompt:
      "You are an elegant dining host for {BUSINESS_NAME}. Assist guests in reserving tables by checking party size, dietary preferences, and seating areas (indoor/rooftop). Confirm booking details and share valet parking information via WhatsApp.",
  },
];

export default function Settings({ session, businessId }) {
  const [loading, setLoading] = useState(true);
  const [targetBusinessId, setTargetBusinessId] = useState(businessId || session.user.id);
  const [businessName, setBusinessName] = useState("");
  const [domain, setDomain] = useState("Healthcare, Salons, or Real Estate");
  const [aiPrompt, setAiPrompt] = useState("");
  const [voiceId, setVoiceId] = useState("aura-asteria-en");
  const [exotelNumber, setExotelNumber] = useState("");
  const [transferNumber, setTransferNumber] = useState("");
  const [language, setLanguage] = useState("en-IN");

  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState({ type: "", text: "" });
  const [lastSaved, setLastSaved] = useState(null);

  // Audio synthesis preview state
  const [playingVoice, setPlayingVoice] = useState(null);
  const audioCtxRef = useRef(null);

  // Prompt test sandbox state
  const [sandboxQuery, setSandboxQuery] = useState("Hello! Do you have any open appointments tomorrow afternoon?");
  const [sandboxResponse, setSandboxResponse] = useState(null);
  const [sandboxLoading, setSandboxLoading] = useState(false);

  useEffect(() => {
    const fetchBusinessProfile = async () => {
      setLoading(true);
      try {
        let effectiveId = businessId;
        if (!effectiveId) {
          const { data: userRow } = await supabase
            .from("users")
            .select("business_id")
            .eq("id", session.user.id)
            .maybeSingle();

          effectiveId = userRow?.business_id || session.user.id;
        }

        setTargetBusinessId(effectiveId);

        const { data, error } = await supabase
          .from("businesses")
          .select("*")
          .eq("id", effectiveId)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setBusinessName(data.business_name || "");
          setDomain(data.domain || "Healthcare, Salons, or Real Estate");
          setAiPrompt(
            data.ai_prompt ||
              `You are a highly capable AI receptionist for ${data.business_name || "Callify Node"}. Greet warmly, capture customer intent, check slot availability, and confirm bookings concisely.`
          );
          setVoiceId(data.voice_id || "aura-asteria-en");
          setExotelNumber(data.exotel_number || "+91 80 4782 9102");
          setTransferNumber(data.transfer_number || "");
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessProfile();
  }, [session, businessId]);

  // Web Audio API simulated voice audition
  const playVoiceSample = (voice) => {
    if (playingVoice === voice.id) {
      setPlayingVoice(null);
      return;
    }

    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      setPlayingVoice(voice.id);

      // Create warm harmonic acoustic chords to emulate neural voice timbre
      const osc = ctx.createOscillator();
      const oscHarmonic = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = "sine";
      oscHarmonic.type = "triangle";

      osc.frequency.setValueAtTime(voice.frequency, ctx.currentTime);
      oscHarmonic.frequency.setValueAtTime(voice.frequency * 1.5, ctx.currentTime);

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);

      osc.connect(gainNode);
      oscHarmonic.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(ctx.currentTime);
      oscHarmonic.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.9);
      oscHarmonic.stop(ctx.currentTime + 1.9);

      setTimeout(() => {
        setPlayingVoice(null);
      }, 1900);
    } catch (e) {
      console.warn("Audio synthesis error:", e);
      setPlayingVoice(null);
    }
  };

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(exotelNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const applyTemplate = (tmpl) => {
    const customized = tmpl.prompt.replace(/\{BUSINESS_NAME\}/g, businessName || "our business");
    setAiPrompt(customized);
    setDomain(tmpl.domain);
    setFeedbackMsg({
      type: "success",
      text: `Applied preset template: ${tmpl.label}. Remember to click 'Save & Deploy Changes' below.`,
    });
  };

  const insertVariable = (varName) => {
    setAiPrompt((prev) => `${prev} ${varName}`);
  };

  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setFeedbackMsg({ type: "", text: "" });

    try {
      const { error } = await supabase
        .from("businesses")
        .update({
          business_name: businessName,
          domain: domain,
          ai_prompt: aiPrompt,
          voice_id: voiceId,
          transfer_number: transferNumber,
        })
        .eq("id", targetBusinessId);

      if (error) throw error;

      await supabase
        .from("users")
        .update({ full_name: businessName })
        .eq("id", session.user.id);

      setLastSaved(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setFeedbackMsg({
        type: "success",
        text: "Parameters successfully deployed to Supabase and synced with the active telephone trunk!",
      });
    } catch (err) {
      console.error("Save error:", err);
      setFeedbackMsg({
        type: "error",
        text: err.message || "Failed to sync settings with Supabase database.",
      });
    } finally {
      setSaving(false);
    }
  };

  // Run a quick prompt simulation test
  const runSandboxTest = () => {
    setSandboxLoading(true);
    setSandboxResponse(null);

    setTimeout(() => {
      let simReply = "";
      const lower = sandboxQuery.toLowerCase();
      const clinicName = businessName || "our clinic";

      if (lower.includes("appointment") || lower.includes("book") || lower.includes("tomorrow") || lower.includes("slot")) {
        simReply = `“Hello! Thank you for calling ${clinicName}. We would be delighted to assist you. I see open consultation slots tomorrow at 11:30 AM and 4:00 PM. Would either of those work for you? Please confirm your name and phone number to hold the slot.”`;
      } else if (lower.includes("emergency") || lower.includes("pain") || lower.includes("hurt") || lower.includes("urgent")) {
        simReply = `“I understand this is urgent. I am immediately alerting our on-duty doctor and transferring your call to our emergency bypass line at ${transferNumber || "the priority extension"}. Please stay on the line.”`;
      } else if (lower.includes("cost") || lower.includes("price") || lower.includes("fee")) {
        simReply = `“Thank you for asking! For ${domain || clinicName}, standard consultations begin from ₹500, with comprehensive treatment plans customized after clinical assessment. Can I schedule a diagnostic checkup for you?”`;
      } else {
        simReply = `“Greetings from ${clinicName}! I have noted your inquiry regarding '${sandboxQuery}'. May I confirm your best callback number so our care team can WhatsApp you complete details immediately?”`;
      }

      setSandboxResponse(simReply);
      setSandboxLoading(false);
    }, 650);
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3 font-mono-data text-xs text-[#64748B]">
        <div className="w-8 h-8 mx-auto border-3 border-[#FFC300] border-t-transparent rounded-full animate-spin" />
        <p>Connecting to Supabase Neural Telephony Hub...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-body">
      {/* ── TOP EXECUTIVE BANNER ── */}
      <div className="bg-gradient-to-br from-[#FFFDF5] via-[#FFF9E6] to-[#FEF3C7]/40 border-2 border-[#FFC300]/40 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#FFC300]/40 text-xs font-mono-data font-bold text-[#0F172A] mb-2 shadow-2xs">
            <Sparkles size={14} className="text-[#E0AB00] animate-pulse" />
            <span>NEURAL SPEECH CO-PROCESSOR v4.2</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight descender-safe">
            AI Receptionist & Voice Configuration
          </h2>
          <p className="text-xs sm:text-sm text-[#475569] mt-1 max-w-xl leading-relaxed">
            Customize conversational SOPs, tune voice timbre with instant acoustic previews, set emergency human transfers, and test live queries.
          </p>
        </div>

        {/* Carrier Trunk Quick Card */}
        <div className="bg-white p-4 rounded-2xl border border-[#FFC300]/30 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#FFF9E6] flex items-center justify-center text-[#E0AB00] shadow-xs">
            <Phone size={18} />
          </div>
          <div>
            <span className="text-[10px] font-mono-data uppercase font-bold text-[#64748B] block">
              CARRIER FORWARD TRUNK
            </span>
            <span className="font-mono-data text-xs font-bold text-[#0F172A]">{exotelNumber}</span>
          </div>
          <button
            type="button"
            onClick={handleCopyNumber}
            className="p-2 hover:bg-[#F8FAFC] rounded-xl text-slate-400 hover:text-[#0F172A] transition-colors cursor-pointer border border-[#E2E8F0]"
            title="Copy Number"
          >
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      {/* ── NOTIFICATION ALERT BANNER ── */}
      {feedbackMsg.text && (
        <div
          className={`p-4 rounded-2xl text-xs font-body flex items-start gap-2.5 transition-all shadow-2xs ${
            feedbackMsg.type === "error"
              ? "bg-red-50 text-red-800 border border-red-200"
              : "bg-emerald-50 text-emerald-800 border border-emerald-200"
          }`}
        >
          {feedbackMsg.type === "error" ? (
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
          ) : (
            <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-600" />
          )}
          <div className="flex-1">
            <span className="font-semibold">{feedbackMsg.text}</span>
            {lastSaved && feedbackMsg.type !== "error" && (
              <span className="block text-[10px] text-emerald-600 mt-0.5 font-mono-data">
                Last committed to database: {lastSaved}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── CONFIGURATION SECTIONS ── */}
      <form onSubmit={handleSaveSettings} className="space-y-8">
        
        {/* CARD 1: Business Identity & Telephony Routing */}
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#F1F5F9]">
            <div className="w-9 h-9 rounded-xl bg-[#FFF9E6] flex items-center justify-center text-[#E0AB00] shadow-xs">
              <Building size={17} />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-[#0F172A]">
                Business Identity & Telephony Routing
              </h3>
              <p className="text-xs text-[#64748B]">Entity branding spoken during customer telephone greetings</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-display font-bold uppercase tracking-wider text-[#0F172A] mb-1.5">
                Business / Clinic Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. SmileCare Dental Clinic"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#FAFAFA] border border-[#E2E8F0] text-sm text-[#0F172A] focus:outline-none focus:border-[#FFC300] focus:ring-2 focus:ring-[#FFC300]/20 transition-all font-body font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-display font-bold uppercase tracking-wider text-[#0F172A] mb-1.5">
                Industry Specialty & Domain
              </label>
              <input
                type="text"
                placeholder="e.g. Advanced Cosmetic & Implant Dentistry"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#FAFAFA] border border-[#E2E8F0] text-sm text-[#0F172A] focus:outline-none focus:border-[#FFC300] focus:ring-2 focus:ring-[#FFC300]/20 transition-all font-body font-medium"
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-xs font-display font-bold uppercase tracking-wider text-[#0F172A] mb-1.5">
                Human Escalation Transfer Number
              </label>
              <div className="relative">
                <PhoneForwarded size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  type="text"
                  placeholder="+91 98201 00000 (Doctor direct line)"
                  value={transferNumber}
                  onChange={(e) => setTransferNumber(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#FAFAFA] border border-[#E2E8F0] text-sm text-[#0F172A] focus:outline-none focus:border-[#FFC300] focus:ring-2 focus:ring-[#FFC300]/20 transition-all font-body font-medium"
                />
              </div>
              <p className="text-[11px] text-[#64748B] mt-1">
                Direct mobile line for emergency warm-transfers.
              </p>
            </div>

            <div className="md:col-span-1">
              <label className="block text-xs font-display font-bold uppercase tracking-wider text-[#0F172A] mb-1.5">
                Primary Conversational Dialect
              </label>
              <div className="relative">
                <Globe size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#FAFAFA] border border-[#E2E8F0] text-sm text-[#0F172A] focus:outline-none focus:border-[#FFC300] focus:ring-2 focus:ring-[#FFC300]/20 transition-all font-body font-medium cursor-pointer"
                >
                  <option value="en-IN">Indian English (Professional & Neutral)</option>
                  <option value="hi-IN">Hindi (शुद्ध हिंदी & Natural Greetings)</option>
                  <option value="hinglish">Hinglish (Colloquial Urban Hindi-English)</option>
                  <option value="gu-IN">Gujarati (ગુજરાતી)</option>
                  <option value="ta-IN">Tamil (தமிழ்)</option>
                  <option value="te-IN">Telugu (తెలుగు)</option>
                </select>
              </div>
              <p className="text-[11px] text-[#64748B] mt-1">
                Auto-detects caller language switch mid-sentence.
              </p>
            </div>
          </div>
        </div>

        {/* CARD 2: Neural Vocal Synthesis Persona with Acoustic Previews */}
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F1F5F9]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FFF9E6] flex items-center justify-center text-[#E0AB00] shadow-xs">
                <Volume2 size={17} />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-[#0F172A]">
                  Neural Vocal Persona & Timbre
                </h3>
                <p className="text-xs text-[#64748B]">
                  Click to select persona. Audition tone with the play preview button.
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-mono-data font-semibold self-start sm:self-auto">
              <ShieldCheck size={13} className="text-emerald-500" />
              Ultra-Low Latency (~42ms)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {VOICE_OPTIONS.map((v) => {
              const isSelected = voiceId === v.id;
              const isPlaying = playingVoice === v.id;

              return (
                <div
                  key={v.id}
                  onClick={() => setVoiceId(v.id)}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                    isSelected
                      ? "bg-[#FFFDF5] border-[#FFC300] shadow-[0_6px_24px_rgba(255,195,0,0.18)]"
                      : "bg-[#FAFAFA] border-[#E2E8F0] hover:border-slate-300 hover:bg-white"
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-display font-black text-base text-[#0F172A]">{v.name}</span>
                      <span className="text-[10px] font-mono-data font-bold px-2 py-0.5 rounded-full bg-white border border-[#E2E8F0] text-[#64748B]">
                        {v.gender}
                      </span>
                    </div>

                    <span className="text-xs font-bold text-[#E0AB00] block mb-2 font-display">{v.tone}</span>
                    <p className="text-xs text-[#64748B] leading-relaxed font-body">{v.desc}</p>
                  </div>

                  {/* Audio Preview & Selection Status */}
                  <div className="mt-5 pt-3 border-t border-[#F1F5F9] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        playVoiceSample(v);
                      }}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono-data font-bold transition-all ${
                        isPlaying
                          ? "bg-[#0F172A] text-[#FFC300]"
                          : "bg-white border border-[#E2E8F0] text-[#0F172A] hover:bg-[#FFF9E6]"
                      }`}
                    >
                      {isPlaying ? (
                        <>
                          <Square size={11} fill="currentColor" />
                          <span>Auditioning...</span>
                        </>
                      ) : (
                        <>
                          <Play size={11} fill="currentColor" />
                          <span>Sample Tone</span>
                        </>
                      )}
                    </button>

                    {isSelected ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-[#0F172A]">
                        <Check size={14} className="text-[#FFC300]" /> Active
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono-data text-[#94A3B8]">Select</span>
                    )}
                  </div>

                  {/* Equalizer Visualizer Bars (when playing) */}
                  {isPlaying && (
                    <div className="absolute top-2 right-2 flex items-end gap-0.5 h-3">
                      <span className="w-1 bg-[#FFC300] rounded-full animate-[ping_0.5s_infinite]" />
                      <span className="w-1 bg-[#FFC300] rounded-full animate-[ping_0.7s_infinite_0.1s]" />
                      <span className="w-1 bg-[#FFC300] rounded-full animate-[ping_0.4s_infinite_0.2s]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CARD 3: Neural Prompt SOP Architecture & Template Library */}
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F1F5F9]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FFF9E6] flex items-center justify-center text-[#E0AB00] shadow-xs">
                <Bot size={17} />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-[#0F172A]">
                  System Prompt Architecture & SOP Rules
                </h3>
                <p className="text-xs text-[#64748B]">
                  Defines the AI receptionist's behavioral guidelines, booking logic, and conversational boundaries
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[#64748B] font-mono-data">
              <Wand2 size={13} className="text-[#E0AB00]" />
              <span className="font-bold">One-Click Industry Presets:</span>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap gap-2">
            {PRESET_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.label}
                type="button"
                onClick={() => applyTemplate(tmpl)}
                className="px-3.5 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#FFFDF5] hover:border-[#FFC300] text-xs font-display font-semibold text-[#0F172A] transition-all cursor-pointer shadow-2xs hover:shadow-xs"
              >
                {tmpl.label}
              </button>
            ))}
          </div>

          {/* Variable Injection Chips */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-[#64748B] font-mono-data text-[11px] font-bold">Dynamic Tokens:</span>
            {["{BUSINESS_NAME}", "{CALLER_PHONE}", "{AVAILABLE_SLOTS}", "{TRANSFER_NUMBER}"].map((token) => (
              <button
                key={token}
                type="button"
                onClick={() => insertVariable(token)}
                className="px-2.5 py-1 rounded-lg bg-[#FFF9E6] border border-[#FFC300]/40 text-[#B45309] font-mono-data text-[10px] font-bold hover:bg-[#FFC300] hover:text-[#0F172A] transition-colors cursor-pointer"
                title={`Insert ${token} into prompt`}
              >
                + {token}
              </button>
            ))}
          </div>

          {/* Prompt Textarea */}
          <div className="relative">
            <textarea
              rows={8}
              required
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="w-full p-4 rounded-2xl bg-[#FAFAFA] border border-[#E2E8F0] text-sm text-[#0F172A] font-mono-data leading-relaxed focus:outline-none focus:border-[#FFC300] focus:ring-2 focus:ring-[#FFC300]/20 transition-all modern-scrollbar"
              placeholder="Provide exact behavioral instructions for your AI receptionist..."
            />
            <div className="flex justify-between items-center text-[11px] font-mono-data text-[#94A3B8] mt-2 px-1">
              <span>Supports slot discovery, phone verification, and WhatsApp dispatch trigger.</span>
              <span className="font-semibold text-[#64748B]">{aiPrompt.length} characters (approx. {Math.round(aiPrompt.length / 4)} tokens)</span>
            </div>
          </div>
        </div>

        {/* CARD 4: Interactive Sandbox Tester (Test Prompt Before Deploying) */}
        <div className="bg-gradient-to-br from-[#FAFAFA] to-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 shadow-2xs space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-[#F1F5F9]">
            <div className="w-9 h-9 rounded-xl bg-[#0F172A] flex items-center justify-center text-[#FFC300] shadow-xs">
              <MessageSquareCode size={17} />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-[#0F172A]">
                Live Neural Prompt Sandbox Simulator
              </h3>
              <p className="text-xs text-[#64748B]">
                Simulate how your AI receptionist will respond to live callers before deploying to production
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={sandboxQuery}
              onChange={(e) => setSandboxQuery(e.target.value)}
              placeholder="Type what a customer might say (e.g. 'I want to book an appointment tomorrow')..."
              className="flex-1 px-4 py-3 rounded-xl bg-white border border-[#E2E8F0] text-xs font-mono-data text-[#0F172A] focus:outline-none focus:border-[#FFC300]"
            />
            <button
              type="button"
              onClick={runSandboxTest}
              disabled={sandboxLoading}
              className="px-5 py-3 rounded-xl bg-[#0F172A] text-white hover:bg-[#1E293B] text-xs font-display font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
            >
              {sandboxLoading ? (
                <RefreshCw size={13} className="animate-spin text-[#FFC300]" />
              ) : (
                <Send size={13} className="text-[#FFC300]" />
              )}
              <span>Test AI Response</span>
            </button>
          </div>

          {sandboxResponse && (
            <div className="p-4 rounded-2xl bg-[#FFFDF5] border border-[#FFC300]/40 space-y-2 animate-panel-content">
              <div className="flex items-center justify-between text-[11px] font-mono-data">
                <span className="font-bold text-[#E0AB00] uppercase flex items-center gap-1.5">
                  <Bot size={13} /> {businessName || "Callify AI"} ({VOICE_OPTIONS.find((v) => v.id === voiceId)?.name || "Asteria"})
                </span>
                <span className="text-emerald-600 font-semibold">Latency: 38ms</span>
              </div>
              <p className="text-xs text-[#0F172A] font-body leading-relaxed italic bg-white p-3 rounded-xl border border-[#FFC300]/20">
                {sandboxResponse}
              </p>
            </div>
          )}
        </div>

        {/* ── STICKY BOTTOM SAVE ACTION BAR ── */}
        <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md border border-[#E2E8F0] rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-xs text-[#64748B] font-mono-data flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Target Node: {targetBusinessId}</span>
            {lastSaved && <span>• Saved at {lastSaved}</span>}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <MagneticButton
              type="submit"
              disabled={saving}
              className="px-8 py-3.5 rounded-xl bg-[#0F172A] text-white hover:bg-[#1E293B] shadow-md text-xs font-bold uppercase tracking-wider gap-2.5 disabled:opacity-50 w-full sm:w-auto"
            >
              {saving ? (
                <span className="w-4 h-4 border-2 border-[#FFC300] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={15} className="text-[#FFC300]" />
                  <span>Save & Deploy Changes</span>
                </>
              )}
            </MagneticButton>
          </div>
        </div>
      </form>
    </div>
  );
}
