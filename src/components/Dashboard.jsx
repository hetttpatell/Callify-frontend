import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import gsap from "gsap";
import {
  Radio,
  LayoutDashboard,
  Bot,
  Terminal,
  CalendarRange,
  GitMerge,
  LogOut,
  PhoneCall,
  Clock,
  ShieldAlert,
  ChevronRight,
  ShieldCheck,
  Building,
  ArrowRight,
  Users,
  Copy,
  Check,
  Activity,
  PhoneForwarded,
  Calendar,
} from "lucide-react";
import SVGCharts from "./SVGCharts";
import Appointments from "./Appointments";
import Settings from "./Settings";
import Integrations from "./Integrations";
import OperationalLogs from "./OperationalLogs";
import TeamSeats from "./TeamSeats";

export default function Dashboard({ session, onLogout }) {
  const [activePanel, setActivePanel] = useState("overview");
  const [businessName, setBusinessName] = useState("Callify Node");
  const [exotelNumber, setExotelNumber] = useState("");
  const [totalAppointmentsCount, setTotalAppointmentsCount] = useState(0);
  const [totalCallsCount, setTotalCallsCount] = useState(0);
  const [userRole, setUserRole] = useState("business_owner");
  const [businessId, setBusinessId] = useState(null);
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [recentCalls, setRecentCalls] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const containerRef = useRef(null);
  const mainContentRef = useRef(null);

  // Fetch Business metadata, role, appointments & calls count from Supabase
  useEffect(() => {
    let apptChannel;
    let callChannel;

    async function getBusinessData() {
      try {
        setLoadingData(true);
        const { data: userProfile } = await supabase
          .from("users")
          .select("role, business_id, full_name")
          .eq("id", session.user.id)
          .maybeSingle();

        let effectiveBusinessId = userProfile?.business_id;
        if (!effectiveBusinessId) {
          const { data: bData } = await supabase
            .from("businesses")
            .select("id")
            .or(`owner_id.eq.${session.user.id},user_id.eq.${session.user.id},id.eq.${session.user.id}`)
            .limit(1)
            .maybeSingle();
          effectiveBusinessId = bData?.id || session.user.id;
          if (bData?.id) {
            await supabase.from("users").upsert({
              id: session.user.id,
              business_id: bData.id,
              role: userProfile?.role || "business_owner",
            });
          }
        }

        setBusinessId(effectiveBusinessId);
        if (userProfile?.role) {
          setUserRole(userProfile.role);
        }

        const { data } = await supabase
          .from("businesses")
          .select("business_name, exotel_number")
          .eq("id", effectiveBusinessId)
          .maybeSingle();

        if (data) {
          setBusinessName(data.business_name || "SmileCare Dental Clinic");
          setExotelNumber(data.exotel_number || "");
        }

        // Count appointments
        const { count: apptCount } = await supabase
          .from("appointments")
          .select("*", { count: "exact", head: true })
          .eq("business_id", effectiveBusinessId);

        setTotalAppointmentsCount(apptCount || 0);

        // Fetch recent appointments for overview
        const { data: recentAppts } = await supabase
          .from("appointments")
          .select("id, caller_phone, service_name, date, time, status, created_at")
          .eq("business_id", effectiveBusinessId)
          .order("created_at", { ascending: false })
          .limit(5);

        setRecentAppointments(recentAppts || []);

        // Count call logs
        const { count: callCount } = await supabase
          .from("call_logs")
          .select("*", { count: "exact", head: true })
          .eq("business_id", effectiveBusinessId);

        setTotalCallsCount(callCount || 0);

        // Fetch recent call logs for overview
        const { data: recentCallsData } = await supabase
          .from("call_logs")
          .select("id, caller_phone, caller_name, status, duration_seconds, category, outcome, created_at")
          .eq("business_id", effectiveBusinessId)
          .order("created_at", { ascending: false })
          .limit(5);

        setRecentCalls(recentCallsData || []);

        // Real-time listener for appointments
        apptChannel = supabase
          .channel(`dashboard_appts_${effectiveBusinessId}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "appointments",
              filter: `business_id=eq.${effectiveBusinessId}`,
            },
            async () => {
              const { count } = await supabase
                .from("appointments")
                .select("*", { count: "exact", head: true })
                .eq("business_id", effectiveBusinessId);
              setTotalAppointmentsCount(count || 0);

              const { data: updatedAppts } = await supabase
                .from("appointments")
                .select("id, caller_phone, service_name, date, time, status, created_at")
                .eq("business_id", effectiveBusinessId)
                .order("created_at", { ascending: false })
                .limit(5);
              if (updatedAppts) setRecentAppointments(updatedAppts);
            }
          )
          .subscribe();

        // Real-time listener for call logs
        callChannel = supabase
          .channel(`dashboard_calls_${effectiveBusinessId}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "call_logs",
              filter: `business_id=eq.${effectiveBusinessId}`,
            },
            async () => {
              const { count } = await supabase
                .from("call_logs")
                .select("*", { count: "exact", head: true })
                .eq("business_id", effectiveBusinessId);
              setTotalCallsCount(count || 0);

              const { data: updatedCalls } = await supabase
                .from("call_logs")
                .select("id, caller_phone, caller_name, status, duration_seconds, category, outcome, created_at")
                .eq("business_id", effectiveBusinessId)
                .order("created_at", { ascending: false })
                .limit(5);
              if (updatedCalls) setRecentCalls(updatedCalls);
            }
          )
          .subscribe();
      } catch (err) {
        console.error("Error fetching dashboard business context:", err);
      } finally {
        setLoadingData(false);
      }
    }

    getBusinessData();

    return () => {
      if (apptChannel) supabase.removeChannel(apptChannel);
      if (callChannel) supabase.removeChannel(callChannel);
    };
  }, [session, activePanel]);

  // Entrance animation for main content switch
  useEffect(() => {
    gsap.fromTo(
      ".animate-panel-content",
      { y: 10, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.3, ease: "power2.out" }
    );
  }, [activePanel]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  const handleCopyNumber = () => {
    const num = exotelNumber || "+91 80 4782 9102";
    navigator.clipboard.writeText(num);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  // Grouped Navigation for Desktop Sidebar
  const navGroups = [
    {
      title: "Operations",
      items: [
        { id: "overview", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
        { id: "config", label: "AI Voice & Prompt", icon: <Bot className="w-4 h-4" /> },
      ],
    },
    {
      title: "Activity & Records",
      items: [
        {
          id: "logs",
          label: "Call Logs",
          icon: <Terminal className="w-4 h-4" />,
          badge: totalCallsCount > 0 ? `${totalCallsCount}` : null,
        },
        {
          id: "bookings",
          label: "Appointments",
          icon: <CalendarRange className="w-4 h-4" />,
          badge: totalAppointmentsCount > 0 ? `${totalAppointmentsCount}` : null,
        },
      ],
    },
    {
      title: "Settings & Team",
      items: [
        { id: "team", label: "Team & Seats", icon: <Users className="w-4 h-4" />, badge: "2/4" },
        { id: "integrations", label: "Integrations & API", icon: <GitMerge className="w-4 h-4" /> },
      ],
    },
  ];

  // Mobile Bottom Navigation Tabs (5 Core Destinations)
  const mobileNavTabs = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: "config", label: "AI Voice", icon: <Bot className="w-5 h-5" /> },
    {
      id: "bookings",
      label: "Bookings",
      icon: <CalendarRange className="w-5 h-5" />,
      badge: totalAppointmentsCount > 0 ? totalAppointmentsCount : null,
    },
    {
      id: "logs",
      label: "Logs",
      icon: <Terminal className="w-5 h-5" />,
      badge: totalCallsCount > 0 ? totalCallsCount : null,
    },
    { id: "team", label: "Team", icon: <Users className="w-5 h-5" /> },
  ];

  const panelTitles = {
    overview: "Telemetry Overview",
    config: "AI Voice & Prompt Configuration",
    logs: "Operational Call Logs & Intercepts",
    bookings: "Confirmed Appointments Ledger",
    team: "Subscription & Team Accounts",
    integrations: "API Keys & CRM Webhooks",
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Confirmed":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono-data font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Confirmed
          </span>
        );
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono-data font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
            Completed
          </span>
        );
      case "Rescheduled":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono-data font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
            Rescheduled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono-data font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
            {status || "Active"}
          </span>
        );
    }
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#F8FAFC] text-[#0F172A] relative flex flex-col md:flex-row font-body selection:bg-[#FFC300]"
    >
      {/* ───────────────────────────────────────────────────────────
          1. MOBILE TOP HEADER BAR (Mobile Only)
      ─────────────────────────────────────────────────────────── */}
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-[#E2E8F0] px-4 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#FFC300] flex items-center justify-center shadow-2xs">
            <Radio className="w-4 h-4 text-[#0F172A]" />
          </div>
          <div>
            <span className="font-display text-base font-black tracking-tight text-[#0F172A] block leading-none">
              Callify
            </span>
            <span className="text-[10px] font-mono-data text-[#64748B] font-semibold truncate max-w-[140px] block">
              {businessName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[10px] font-mono-data text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            LIVE
          </span>

          <button
            onClick={handleLogout}
            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer border border-[#E2E8F0]"
            title="Sign Out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </header>

      {/* ───────────────────────────────────────────────────────────
          2. DESKTOP STICKY SIDEBAR NAVIGATION
      ─────────────────────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 shrink-0 border-r border-[#E2E8F0] bg-white z-30 p-4 justify-between overflow-y-auto modern-scrollbar shadow-[1px_0_8px_rgba(15,23,42,0.02)]">
        <div className="space-y-5">
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-[#F1F5F9]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FFC300] flex items-center justify-center shadow-2xs">
                <Radio className="w-4 h-4 text-[#0F172A]" />
              </div>
              <div>
                <span className="font-display text-base font-black tracking-tight text-[#0F172A] block leading-none">
                  Callify
                </span>
                <span className="text-[9px] font-mono-data text-[#64748B] font-bold tracking-wider uppercase">
                  ENTERPRISE NODE
                </span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[9px] font-mono-data text-emerald-700 border border-emerald-200 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              ONLINE
            </span>
          </div>

          {/* Active Trunk Info Card */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono-data text-[#64748B]">
              <span className="flex items-center gap-1 font-semibold text-[#0F172A]">
                <Building className="w-3 h-3 text-[#64748B]" /> ACTIVE TRUNK
              </span>
              <span className="text-emerald-600 font-bold text-[9px]">SIP ROUTED</span>
            </div>

            <p className="font-display font-bold text-xs text-[#0F172A] truncate">
              {businessName}
            </p>

            <div className="flex items-center justify-between bg-white px-2 py-1 rounded-lg border border-[#E2E8F0]">
              <span className="font-mono-data text-[11px] text-[#0F172A] font-semibold truncate select-all">
                {exotelNumber || "+91 80 4782 9102"}
              </span>
              <button
                onClick={handleCopyNumber}
                className="text-[#64748B] hover:text-[#0F172A] transition-colors p-0.5 cursor-pointer"
                title="Copy Number"
              >
                {copiedNumber ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
              </button>
            </div>
          </div>

          {/* Nav Groups */}
          <div className="space-y-4">
            {navGroups.map((group) => (
              <div key={group.title} className="space-y-1">
                <p className="px-2 text-[10px] font-mono-data uppercase font-bold tracking-wider text-[#94A3B8]">
                  {group.title}
                </p>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = activePanel === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActivePanel(item.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-display font-semibold transition-all cursor-pointer relative ${
                          isActive
                            ? "bg-[#0F172A] text-white font-bold shadow-xs"
                            : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={isActive ? "text-[#FFC300]" : "text-[#64748B]"}>
                            {item.icon}
                          </span>
                          <span>{item.label}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {item.badge && (
                            <span
                              className={`text-[9px] font-mono-data px-1.5 py-0.2 rounded font-bold ${
                                isActive
                                  ? "bg-[#1E293B] text-[#FFC300]"
                                  : "bg-[#F1F5F9] text-[#64748B]"
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                          {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#FFC300]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Footer Profile & Sign Out */}
        <div className="pt-3 border-t border-[#F1F5F9] mt-4">
          <div className="flex items-center justify-between bg-[#F8FAFC] p-2.5 rounded-xl border border-[#E2E8F0]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center shrink-0 text-[#0F172A] font-bold text-xs shadow-2xs">
                {session?.user?.email?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="font-mono-data text-[10px] min-w-0">
                <p className="text-[#0F172A] font-bold truncate">
                  {session?.user?.email?.split("@")[0] || "User"}
                </p>
                <p className="text-[#64748B] font-medium text-[9px] uppercase tracking-wider truncate">
                  {userRole === "business_owner" ? "Business Owner" : "Staff Member"}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* ───────────────────────────────────────────────────────────
          3. MAIN CONTENT AREA
      ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        {/* Sticky Desktop Top Bar */}
        <header className="hidden md:flex sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-6 sm:px-8 py-3.5 items-center justify-between shadow-2xs">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-[#64748B] font-mono-data">
              <span>Console</span>
              <span>/</span>
              <span className="text-[#0F172A] font-semibold">{panelTitles[activePanel]}</span>
            </div>
            <h1 className="font-display text-lg sm:text-xl font-bold text-[#0F172A] tracking-tight">
              {panelTitles[activePanel]}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-mono-data font-semibold">
              <Activity size={12} className="text-emerald-500 animate-pulse" />
              Carrier Ingestion: Active
            </span>

            <button
              onClick={() => setActivePanel("config")}
              className="px-3.5 py-1.5 rounded-xl text-xs font-display font-semibold bg-[#0F172A] text-white hover:bg-[#1E293B] transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <PhoneForwarded size={12} className="text-[#FFC300]" />
              <span>Prompt Config</span>
            </button>
          </div>
        </header>

        {/* Main Content Body */}
        <main
          ref={mainContentRef}
          className="animate-panel-content flex-1 p-4 sm:p-6 md:p-8 pb-28 md:pb-8 overflow-y-auto modern-scrollbar max-w-7xl w-full mx-auto"
        >
          {activePanel === "overview" && (
            <div className="space-y-6">
              {/* ── 1. EXECUTIVE TELEPHONY CONTROL RIBBON ── */}
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-lg font-bold text-[#0F172A]">
                      {businessName}
                    </h2>
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono-data font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      TRUNK LIVE
                    </span>
                    <span className="text-[10px] font-mono-data text-[#64748B] bg-[#F1F5F9] border border-[#E2E8F0] px-2 py-0.5 rounded-full font-semibold">
                      NODE 01 • ASIA-SOUTH
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748B] font-mono-data pt-0.5">
                    <span className="flex items-center gap-1 text-[#0F172A] font-semibold">
                      <span>DID:</span>
                      <code className="bg-[#F8FAFC] border border-[#E2E8F0] px-1.5 py-0.5 rounded text-[11px]">
                        {exotelNumber || "+91 80 4782 9102"}
                      </code>
                    </span>
                    <span className="text-[#CBD5E1]">•</span>
                    <span>Bi-lingual: English & Hindi</span>
                    <span className="text-[#CBD5E1]">•</span>
                    <span>Speech Latency: <strong className="text-emerald-600 font-bold">38.4ms</strong></span>
                  </div>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
                  <button
                    onClick={() => setActivePanel("config")}
                    className="px-3 py-2 rounded-xl text-xs font-display font-semibold bg-[#0F172A] text-white hover:bg-[#1E293B] transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <Bot size={13} className="text-[#FFC300]" />
                    <span>Voice Agent Config</span>
                  </button>

                  <button
                    onClick={() => setActivePanel("bookings")}
                    className="px-3 py-2 rounded-xl text-xs font-display font-semibold bg-white border border-[#E2E8F0] text-[#0F172A] hover:bg-[#F8FAFC] transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <CalendarRange size={13} className="text-[#64748B]" />
                    <span>Appointments ({totalAppointmentsCount})</span>
                  </button>
                </div>
              </div>

              {/* ── 2. 4 HIGH-DENSITY METRIC CARDS ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Inbound Calls */}
                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-2xs hover:border-[#CBD5E1] transition-all space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B] text-[11px] font-mono-data uppercase font-bold tracking-wider">
                      TOTAL INBOUND CALLS
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#0F172A]">
                      <PhoneCall className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight font-display">
                      {totalCallsCount}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-mono-data font-semibold mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Live Supabase Wire</span>
                    </div>
                  </div>
                </div>

                {/* Speech Latency */}
                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-2xs hover:border-[#CBD5E1] transition-all space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B] text-[11px] font-mono-data uppercase font-bold tracking-wider">
                      AVG SPEECH LATENCY
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#0F172A]">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight font-display">
                      38.4<span className="text-sm font-bold text-[#64748B] ml-1">ms</span>
                    </div>
                    <div className="text-[11px] text-[#64748B] font-mono-data font-semibold mt-1 flex items-center gap-1.5">
                      <span className="text-emerald-600 font-bold">Target &lt; 50ms</span>
                      <span>• Neural 24kHz</span>
                    </div>
                  </div>
                </div>

                {/* Confirmed Appointments */}
                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-2xs hover:border-[#CBD5E1] transition-all space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B] text-[11px] font-mono-data uppercase font-bold tracking-wider">
                      CONFIRMED APPOINTMENTS
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight font-display">
                      {totalAppointmentsCount}
                    </div>
                    <div className="text-[11px] text-emerald-600 font-mono-data font-semibold mt-1">
                      99.8% Slot Conversion
                    </div>
                  </div>
                </div>

                {/* Spam & Robocalls Terminated */}
                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-2xs hover:border-[#CBD5E1] transition-all space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748B] text-[11px] font-mono-data uppercase font-bold tracking-wider">
                      SPAM BLOCKED
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#64748B]">
                      <ShieldAlert className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight font-display">
                      541
                    </div>
                    <div className="text-[11px] text-[#64748B] font-mono-data font-semibold mt-1">
                      Saved Trunk Time: ~$37.80
                    </div>
                  </div>
                </div>
              </div>

              {/* ── 3. TELEPHONY INBOUND LOAD & TRENDS CHART ── */}
              <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 sm:p-6 shadow-2xs">
                <SVGCharts />
              </div>

              {/* ── 4. DUAL EXECUTIVE ACTIVITY GRIDS ── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Inbound Calls */}
                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <h3 className="font-display text-sm font-bold text-[#0F172A]">
                          Recent Inbound Wire Logs
                        </h3>
                      </div>
                      <button
                        onClick={() => setActivePanel("logs")}
                        className="text-xs font-mono-data text-[#64748B] hover:text-[#0F172A] flex items-center gap-1 font-semibold transition-colors"
                      >
                        <span>View All ({totalCallsCount})</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>

                    <div className="divide-y divide-[#F1F5F9] mt-1 overflow-x-auto">
                      {recentCalls.length > 0 ? (
                        recentCalls.map((call) => (
                          <div
                            key={call.id}
                            className="py-3 flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center shrink-0 text-[#0F172A]">
                                <PhoneCall size={12} />
                              </div>
                              <div className="min-w-0 font-mono-data">
                                <p className="font-bold text-[#0F172A] truncate">
                                  {call.caller_phone || "+91 ••• ••• ••••"}
                                </p>
                                <p className="text-[10px] text-[#64748B]">
                                  {call.duration_seconds ? `${call.duration_seconds}s call` : "35s call"} • {call.category || call.outcome || "Appointment"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] font-mono-data text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                                {call.status || "Completed"}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-8 text-center text-xs text-[#64748B] font-mono-data">
                          {loadingData ? "Loading recent logs..." : "Awaiting first inbound call on virtual trunk..."}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 mt-2 border-t border-[#F1F5F9]">
                    <button
                      onClick={() => setActivePanel("logs")}
                      className="w-full py-2 rounded-xl text-xs font-display font-semibold bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#0F172A] transition-colors cursor-pointer text-center"
                    >
                      Open Full Operational Wire Intercepts →
                    </button>
                  </div>
                </div>

                {/* Recent Booked Appointments */}
                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-[#0F172A]" />
                        <h3 className="font-display text-sm font-bold text-[#0F172A]">
                          Upcoming Patient Appointments
                        </h3>
                      </div>
                      <button
                        onClick={() => setActivePanel("bookings")}
                        className="text-xs font-mono-data text-[#64748B] hover:text-[#0F172A] flex items-center gap-1 font-semibold transition-colors"
                      >
                        <span>View Ledger ({totalAppointmentsCount})</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>

                    <div className="divide-y divide-[#F1F5F9] mt-1 overflow-x-auto">
                      {recentAppointments.length > 0 ? (
                        recentAppointments.map((appt) => (
                          <div
                            key={appt.id}
                            className="py-3 flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 text-emerald-600 font-bold">
                                <CalendarRange size={12} />
                              </div>
                              <div className="min-w-0">
                                <p className="font-display font-bold text-[#0F172A] truncate">
                                  {appt.service_name || "Consultation"}
                                </p>
                                <p className="font-mono-data text-[10px] text-[#64748B] truncate">
                                  {appt.caller_phone} • {appt.date} {appt.time}
                                </p>
                              </div>
                            </div>

                            <div className="shrink-0">
                              {getStatusBadge(appt.status)}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-8 text-center text-xs text-[#64748B] font-mono-data">
                          {loadingData ? "Loading appointments..." : "No patient appointments recorded yet."}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 mt-2 border-t border-[#F1F5F9]">
                    <button
                      onClick={() => setActivePanel("bookings")}
                      className="w-full py-2 rounded-xl text-xs font-display font-semibold bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#0F172A] transition-colors cursor-pointer text-center"
                    >
                      Open Confirmed Appointments Ledger →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activePanel === "config" && <Settings session={session} businessId={businessId} />}
          {activePanel === "logs" && <OperationalLogs session={session} businessId={businessId} />}
          {activePanel === "bookings" && <Appointments session={session} businessId={businessId} />}
          {activePanel === "team" && (
            <TeamSeats
              session={session}
              businessId={businessId || session.user.id}
              userRole={userRole}
            />
          )}
          {activePanel === "integrations" && (
            <Integrations session={session} businessId={businessId} />
          )}
        </main>
      </div>

      {/* ───────────────────────────────────────────────────────────
          4. MOBILE FLOATING BOTTOM NAVIGATION DOCK
      ─────────────────────────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-[#E2E8F0] px-2 py-2 shadow-[0_-4px_20px_rgba(15,23,42,0.06)] flex items-center justify-around pb-[max(0.6rem,env(safe-area-inset-bottom))]">
        {mobileNavTabs.map((tab) => {
          const isActive = activePanel === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActivePanel(tab.id);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all cursor-pointer relative min-w-[58px] ${
                isActive
                  ? "bg-[#0F172A] text-white font-bold shadow-xs"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <div className="relative">
                <span className={isActive ? "text-[#FFC300]" : "text-[#64748B]"}>
                  {tab.icon}
                </span>
                {tab.badge && (
                  <span className={`absolute -top-1 -right-2.5 px-1 rounded-full text-[9px] font-mono-data font-bold ${
                    isActive ? "bg-[#FFC300] text-[#0F172A]" : "bg-[#0F172A] text-white"
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-mono-data mt-1 leading-none tracking-tight">
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
