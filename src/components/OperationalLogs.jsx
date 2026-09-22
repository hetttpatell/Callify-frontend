import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import gsap from "gsap";
import {
  PhoneCall,
  Search,
  CheckCircle,
  AlertTriangle,
  ShieldAlert,
  Play,
  Square,
  Clock,
  RefreshCw,
  Plus,
  Radio,
  FileText,
} from "lucide-react";
import MagneticButton from "./MagneticButton";

export default function OperationalLogs({ businessId, session }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [simulating, setSimulating] = useState(false);
  const [resolvedBusinessId, setResolvedBusinessId] = useState(businessId || null);

  // Audio recording simulation state
  const [playingLogId, setPlayingLogId] = useState(null);
  const audioCtxRef = useRef(null);

  // Resolve Business ID
  const fetchTargetBusinessId = useCallback(async () => {
    if (businessId) {
      setResolvedBusinessId(businessId);
      return businessId;
    }
    try {
      const { data: userProfile } = await supabase
        .from("users")
        .select("business_id")
        .eq("id", session?.user?.id)
        .maybeSingle();

      const effId = userProfile?.business_id || session?.user?.id;
      setResolvedBusinessId(effId);
      return effId;
    } catch {
      return session?.user?.id;
    }
  }, [businessId, session]);

  // Fetch real logs from Supabase
  const fetchLogs = useCallback(async (targetId) => {
    if (!targetId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("call_logs")
        .select("*")
        .eq("business_id", targetId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLogs(data || []);
      if (data && data.length > 0 && !selectedId) {
        setSelectedId(data[0].id);
      }
    } catch (err) {
      console.error("Error fetching call_logs:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {
    let channel;
    const initialize = async () => {
      const effId = await fetchTargetBusinessId();
      if (effId) {
        fetchLogs(effId);

        // Supabase Real-Time Channel for live call wire intercepts
        channel = supabase
          .channel(`realtime_call_logs_${effId}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "call_logs",
              filter: `business_id=eq.${effId}`,
            },
            (payload) => {
              setLogs((prev) => [payload.new, ...prev]);
              setSelectedId(payload.new.id);

              // Flash highlight animation
              gsap.fromTo(
                `#log-card-${payload.new.id}`,
                { backgroundColor: "#FFC300", scale: 1.02 },
                { backgroundColor: "#FFFFFF", scale: 1, duration: 0.8, ease: "power2.out" }
              );
            }
          )
          .subscribe();
      }
    };

    initialize();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [fetchTargetBusinessId, fetchLogs]);

  // Simulated Web Audio wire replay
  const togglePlayAudio = (logId) => {
    if (playingLogId === logId) {
      setPlayingLogId(null);
      return;
    }

    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      setPlayingLogId(logId);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(480, ctx.currentTime + 1.2);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 1.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.5);

      setTimeout(() => setPlayingLogId(null), 1500);
    } catch {
      setPlayingLogId(null);
    }
  };

  // Simulate a live incoming call that saves to Supabase
  const handleSimulateIncomingCall = async () => {
    setSimulating(true);
    const newTxId = `TX-${Math.floor(1000 + Math.random() * 9000)}`;
    const callers = [
      { name: "Pooja Sharma", phone: "+91 98202 33190", category: "APPOINTMENT BOOKING", transcript: "“Hi, do you have any dental cleaning slots open this Friday morning?” -> CALLIFY: “Friday at 10:30 AM is available with Dr. Mehta. I have reserved that slot and sent confirmation to your WhatsApp.”", outcome: "CONFIRMED // APPOINTMENT_CREATED", status: "resolved", cost: 0.05, duration: 42 },
      { name: "Aditya Verma", phone: "+91 97120 44821", category: "EMERGENCY BYPASS", transcript: "“I have severe wisdom tooth swelling and can't sleep, I need emergency help.” -> CALLIFY: “Dental emergency detected. Warm-transferring immediately to clinic emergency cell line. Please stay on the line.”", outcome: "ESCALATED // HUMAN_TRANSFER", status: "escalated", cost: 0.09, duration: 25 },
      { name: "UNKNOWN SPAM", phone: "+91 80099 22100", category: "SPAM / TELEMARKETING", transcript: "“Special low interest loan offer for small business—” -> CALLIFY: “Spam registry pattern matched. Auto-terminating carrier trunk.”", outcome: "BLOCKED // SPAM_SHIELD", status: "blocked", cost: 0.00, duration: 5 },
    ];

    const pick = callers[Math.floor(Math.random() * callers.length)];

    try {
      const { data, error } = await supabase
        .from("call_logs")
        .insert({
          id: newTxId,
          business_id: resolvedBusinessId,
          caller_phone: pick.phone,
          caller_name: pick.name,
          category: pick.category,
          transcript: pick.transcript,
          outcome: pick.outcome,
          status: pick.status,
          duration_seconds: pick.duration,
          cost: pick.cost,
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setLogs((prev) => [data, ...prev]);
        setSelectedId(data.id);
      }
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setSimulating(false);
    }
  };

  // Filter & Search Logic
  const filteredLogs = logs.filter((log) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "resolved" && log.status === "resolved") ||
      (filter === "escalated" && log.status === "escalated") ||
      (filter === "blocked" && log.status === "blocked");

    const matchesSearch =
      (log.caller_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (log.caller_phone || "").includes(search) ||
      (log.category || "").toLowerCase().includes(search.toLowerCase()) ||
      (log.outcome || "").toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const selectedLog = logs.find((l) => l.id === selectedId) || logs[0];

  const getStatusIcon = (status) => {
    switch (status) {
      case "resolved":
        return <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />;
      case "escalated":
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />;
      case "blocked":
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />;
      default:
        return <PhoneCall className="w-3.5 h-3.5 text-[#0F172A]" />;
    }
  };

  const getStatusLabelBadge = (status) => {
    switch (status) {
      case "resolved":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-data uppercase font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
            Resolved
          </span>
        );
      case "escalated":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-data uppercase font-bold text-amber-700 bg-amber-50 border border-amber-200">
            Escalated
          </span>
        );
      case "blocked":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-data uppercase font-bold text-rose-700 bg-rose-50 border border-rose-200">
            Terminated
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-data uppercase font-bold text-slate-700 bg-slate-50 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 font-body">
      {/* ── HEADER BLOCK ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-[#F1F5F9]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#FFC300]/40 text-xs font-mono-data font-bold text-[#0F172A] mb-1.5 shadow-2xs">
            <Radio size={13} className="text-[#E0AB00] animate-pulse" />
            <span>WIRE INTERCEPT MONITOR</span>
          </div>
          <h2 className="font-display text-2xl font-black text-[#0F172A] tracking-tight">
            Operational Telephony Logs
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Real-time conversational wire intercepts recorded from live SIP trunks and stored in Supabase.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <button
            onClick={() => fetchLogs(resolvedBusinessId)}
            className="p-2.5 rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer"
            title="Refresh Wire Logs"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-[#FFC300]" : ""} />
          </button>

          <MagneticButton
            onClick={handleSimulateIncomingCall}
            disabled={simulating}
            className="px-4 py-2.5 rounded-xl bg-[#0F172A] text-white hover:bg-[#1E293B] text-xs font-display font-bold uppercase tracking-wider gap-1.5 shadow-xs disabled:opacity-50"
          >
            <Plus size={14} className="text-[#FFC300]" />
            <span>{simulating ? "Simulating..." : "Simulate Incoming Call"}</span>
          </MagneticButton>
        </div>
      </div>

      {/* ── FILTERS & SEARCH ── */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {["all", "resolved", "escalated", "blocked"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono-data uppercase font-bold tracking-wider transition-all cursor-pointer ${
                filter === tab
                  ? "bg-[#FFC300] text-[#0F172A] shadow-2xs"
                  : "bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative sm:w-64">
          <Search className="h-3.5 w-3.5 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search caller name, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-[#E2E8F0] rounded-xl pl-9 pr-3.5 py-1.5 text-xs font-body text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#FFC300]"
          />
        </div>
      </div>

      {/* ── DUAL PANE WIRE LOGS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Pane: Calls Feed List */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[620px] overflow-y-auto modern-scrollbar pr-1">
          {loading ? (
            <div className="p-12 text-center text-[#64748B] font-mono-data text-xs space-y-2">
              <div className="w-5 h-5 mx-auto border-2 border-[#FFC300] border-t-transparent rounded-full animate-spin" />
              <p>Fetching wire intercepts from Supabase...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12 bg-white rounded-2xl border border-[#E2E8F0] text-center text-[#64748B] font-mono-data text-xs">
              No matching call logs in database.
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isSelected = selectedId === log.id;
              return (
                <div
                  key={log.id}
                  id={`log-card-${log.id}`}
                  onClick={() => setSelectedId(log.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#FFFDF5] border-[#FFC300] shadow-[0_4px_16px_rgba(255,195,0,0.14)]"
                      : "bg-white border-[#E2E8F0] hover:border-slate-300 hover:bg-[#FAFAFA]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(log.status)}
                      <span className="font-mono-data font-bold text-xs text-[#0F172A]">
                        {log.id}
                      </span>
                    </div>
                    {getStatusLabelBadge(log.status)}
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-display font-bold text-[#0F172A] truncate">
                      {log.caller_name || "Caller"}
                    </span>
                    <span className="font-mono-data text-[11px] text-[#64748B]">
                      {log.caller_phone}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#64748B] font-mono-data uppercase tracking-wider mt-1 truncate">
                    {log.category}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-[10px] font-mono-data text-[#94A3B8]">
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {log.duration_seconds || 45}s
                    </span>
                    <span>Cost: ${Number(log.cost || 0.05).toFixed(2)}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Pane: Wire Intercept Details */}
        <div className="lg:col-span-7">
          {selectedLog ? (
            <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F1F5F9]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono-data font-black text-sm text-[#0F172A]">
                      {selectedLog.id}
                    </span>
                    {getStatusLabelBadge(selectedLog.status)}
                  </div>
                  <h3 className="font-display font-bold text-lg text-[#0F172A]">
                    {selectedLog.caller_name || "Inbound Telephone Caller"}
                  </h3>
                  <span className="font-mono-data text-xs text-[#B45309] font-bold">
                    {selectedLog.caller_phone}
                  </span>
                </div>

                <button
                  onClick={() => togglePlayAudio(selectedLog.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono-data font-bold transition-all cursor-pointer ${
                    playingLogId === selectedLog.id
                      ? "bg-[#0F172A] text-[#FFC300]"
                      : "bg-[#FFF9E6] border border-[#FFC300]/40 text-[#B45309] hover:bg-[#FFC300] hover:text-[#0F172A]"
                  }`}
                >
                  {playingLogId === selectedLog.id ? (
                    <>
                      <Square size={12} fill="currentColor" />
                      <span>Playing Audio...</span>
                    </>
                  ) : (
                    <>
                      <Play size={12} fill="currentColor" />
                      <span>Replay Wire Recording</span>
                    </>
                  )}
                </button>
              </div>

              {/* Telemetry Metrics */}
              <div className="grid grid-cols-3 gap-3 font-mono-data text-xs">
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-xl">
                  <span className="text-[10px] text-[#94A3B8] uppercase block">Duration</span>
                  <span className="font-bold text-[#0F172A]">{selectedLog.duration_seconds || 45} seconds</span>
                </div>
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-xl">
                  <span className="text-[10px] text-[#94A3B8] uppercase block">Telephony Cost</span>
                  <span className="font-bold text-emerald-600">${Number(selectedLog.cost || 0.05).toFixed(2)}</span>
                </div>
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-xl">
                  <span className="text-[10px] text-[#94A3B8] uppercase block">System Latency</span>
                  <span className="font-bold text-[#0F172A]">38ms Neural</span>
                </div>
              </div>

              {/* Action Outcome */}
              <div>
                <label className="block text-[10px] font-mono-data uppercase font-bold text-[#64748B] mb-1">
                  Telephony Outcome
                </label>
                <div className="p-3 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl font-mono-data text-xs text-[#0F172A] font-bold">
                  {selectedLog.outcome}
                </div>
              </div>

              {/* Verbatim Transcript */}
              <div>
                <label className="block text-[10px] font-mono-data uppercase font-bold text-[#64748B] mb-1.5 flex items-center gap-1.5">
                  <FileText size={13} className="text-[#E0AB00]" />
                  <span>Verbatim Conversational Transcript</span>
                </label>
                <div className="p-4 rounded-2xl bg-[#FFFDF5] border border-[#FFC300]/30 font-body text-xs text-[#0F172A] leading-relaxed italic">
                  {selectedLog.transcript}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-[#E2E8F0] rounded-3xl p-12 text-center text-[#64748B] font-mono-data text-xs">
              Select a call record to view detailed intercept transcript.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
