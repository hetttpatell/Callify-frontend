import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import gsap from 'gsap';
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
  User,
  ShieldCheck,
  Building
} from 'lucide-react';
import SVGCharts from './SVGCharts';
import Appointments from './Appointments';
import Settings from './Settings';
import Integrations from './Integrations';
import OperationalLogs from './OperationalLogs';

export default function Dashboard({ session, onLogout }) {
  const [activePanel, setActivePanel] = useState('overview');
  const [businessName, setBusinessName] = useState('Callify Node');
  const [exotelNumber, setExotelNumber] = useState('');
  const [totalAppointmentsCount, setTotalAppointmentsCount] = useState(0);

  const containerRef = useRef(null);
  const mainContentRef = useRef(null);

  // Fetch Business metadata
  useEffect(() => {
    async function getBusinessData() {
      try {
        const { data } = await supabase
          .from('businesses')
          .select('business_name, exotel_number')
          .eq('id', session.user.id)
          .maybeSingle();
        
        if (data) {
          setBusinessName(data.business_name || 'Callify Node');
          setExotelNumber(data.exotel_number || '');
        }

        // Count appointments
        const { count } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('business_id', session.user.id);
        
        setTotalAppointmentsCount(count || 0);
      } catch (err) {
        console.error('Error fetching dashboard business context:', err);
      }
    }
    getBusinessData();
  }, [session, activePanel]);

  // Entrance animations for Dashboard layout
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    gsap.set('.animate-sidebar', { x: -50, opacity: 0 });
    gsap.set('.animate-panel-content', { y: 20, opacity: 0 });

    tl.to('.animate-sidebar', { x: 0, opacity: 1, duration: 0.6 })
      .to('.animate-panel-content', { y: 0, opacity: 1, duration: 0.6 }, '-=0.4');
  }, [activePanel]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  const navItems = [
    { id: 'overview', label: 'Telemetry Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'config', label: 'Receptionist Config', icon: <Bot className="w-4 h-4" /> },
    { id: 'logs', label: 'Operational Logs', icon: <Terminal className="w-4 h-4" /> },
    { id: 'bookings', label: 'Booked Ledger', icon: <CalendarRange className="w-4 h-4" /> },
    { id: 'integrations', label: 'API & Webhooks', icon: <GitMerge className="w-4 h-4" /> }
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-base-bg text-text-primary dark-dot-grid relative flex flex-col md:flex-row">
      {/* Background Mesh Overlay for Depth */}
      <div className="absolute inset-0 dark-mesh-gradient pointer-events-none z-0"></div>

      {/* SIDEBAR NAVIGATION */}
      <aside className="animate-sidebar w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 bg-base-bg bg-opacity-70 backdrop-blur-md z-10 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-8">
          {/* Logo & Node Registry Status */}
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-accent-yellow dot-pulse" />
              <span className="font-serif-display text-xl tracking-wide select-none">
                Callify
              </span>
            </div>
            <span className="text-[8px] font-mono-data text-emerald-400 border border-emerald-500/30 bg-emerald-500/5 px-2 py-0.5 rounded-full font-bold">
              SYS: ONLINE
            </span>
          </div>

          {/* Tenant Context Summary Card */}
          <div className="bg-surface-card border border-white/5 rounded-xl p-3.5 font-mono-data text-xs space-y-1 relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-16 h-16 bg-accent-yellow/5 rounded-full blur-xl"></div>
            <div className="flex items-center gap-1.5 text-accent-yellow font-bold uppercase text-[9px] mb-1">
              <Building className="w-3 h-3" /> ACTIVE NODE TRUNK
            </div>
            <p className="font-bold text-text-primary truncate uppercase">{businessName}</p>
            <p className="text-[10px] text-text-muted select-all truncate">{exotelNumber || 'NO VIRTUAL NUMBER'}</p>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = activePanel === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePanel(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-mono-data uppercase tracking-wider transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-accent-yellow text-base-bg font-bold shadow-[0_2px_10px_rgba(255,211,0,0.15)]' 
                      : 'text-text-muted hover:text-text-primary hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-base-bg" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Area with user and logout */}
        <div className="pt-6 border-t border-white/5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-text-muted" />
            </div>
            <div className="font-mono-data text-[10px] truncate max-w-[140px]">
              <p className="text-text-primary font-bold truncate">{session.user.email.split('@')[0].toUpperCase()}</p>
              <p className="text-text-muted truncate select-all">{session.user.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-3 border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 rounded-xl text-xs font-mono-data uppercase tracking-wider transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> DISCONNECT NODE
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main ref={mainContentRef} className="animate-panel-content flex-1 p-6 md:p-10 relative z-10 overflow-y-auto max-w-7xl mx-auto w-full">
        
        {/* Render panels */}
        {activePanel === 'overview' && (
          <div className="space-y-8">
            {/* Overview Banner Card */}
            <div className="bg-surface-card border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden group hover:border-accent-yellow/20 card-glow-transition flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent-yellow/5 rounded-full blur-3xl"></div>
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/30 border border-white/5">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent-yellow dot-pulse"></span>
                  <span className="text-[9px] font-mono-data uppercase tracking-widest text-accent-yellow font-bold">
                    SYSTEM OVERVIEW OPERATIONAL
                  </span>
                </div>
                <h1 className="text-3xl font-serif-display leading-tight text-text-primary">
                  Welcome to the <span className="text-accent-yellow">Control Hub</span>
                </h1>
                <p className="text-text-muted text-xs font-sans-ui max-w-xl">
                  Analyze system logs, update AI co-processor prompt architectures, reschedule appointments, and view real-time wire intercepts.
                </p>
              </div>

              {/* Action shortcuts */}
              <div className="flex gap-3">
                <button
                  onClick={() => setActivePanel('config')}
                  className="bg-accent-yellow text-base-bg px-4 py-3 rounded-xl font-mono-data text-[10px] font-bold uppercase tracking-wider hover:shadow-[0_4px_14px_rgba(255,211,0,0.15)] transition-all cursor-pointer"
                >
                  Configure AI Prompt
                </button>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono-data">
              {/* Metric 1 */}
              <div className="bg-surface-card border border-white/10 rounded-2xl p-5 hover:border-accent-yellow/30 card-glow-transition shadow-lg space-y-3 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <span className="text-text-muted text-[9px] uppercase tracking-wider">TOTAL INBOUND CALLS</span>
                  <PhoneCall className="w-4 h-4 text-accent-yellow" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-text-primary">1,379</span>
                  <span className="text-[10px] text-emerald-400 font-bold block mt-1">+14.2% THIS WEEK</span>
                </div>
              </div>

              {/* Metric 2 */}
              <div className="bg-surface-card border border-white/10 rounded-2xl p-5 hover:border-accent-yellow/30 card-glow-transition shadow-lg space-y-3 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <span className="text-text-muted text-[9px] uppercase tracking-wider">AVG CALL LENGTH</span>
                  <Clock className="w-4 h-4 text-accent-yellow" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-text-primary">48.2s</span>
                  <span className="text-[10px] text-text-muted/60 font-bold block mt-1">AI PROCESSING: 42ms</span>
                </div>
              </div>

              {/* Metric 3 */}
              <div className="bg-surface-card border border-white/10 rounded-2xl p-5 hover:border-accent-yellow/30 card-glow-transition shadow-lg space-y-3 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <span className="text-text-muted text-[9px] uppercase tracking-wider">LEDGER APPOINTMENTS</span>
                  <ShieldCheck className="w-4 h-4 text-accent-yellow" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-accent-yellow">{totalAppointmentsCount} Bookings</span>
                  <span className="text-[10px] text-emerald-400 font-bold block mt-1">99.8% CONVERSION</span>
                </div>
              </div>

              {/* Metric 4 */}
              <div className="bg-surface-card border border-white/10 rounded-2xl p-5 hover:border-rose-500/30 card-glow-transition shadow-lg space-y-3 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <span className="text-text-muted text-[9px] uppercase tracking-wider">VOIP SPAM TERMINATED</span>
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-rose-400">541 Blocked</span>
                  <span className="text-[10px] text-rose-400/60 font-bold block mt-1">SAVED: ~$37.87</span>
                </div>
              </div>
            </div>

            {/* Interactive SVG Chart */}
            <div className="bg-surface-card border border-white/10 rounded-2xl p-6 shadow-xl">
              <SVGCharts />
            </div>

            {/* Quick overview layout split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Shorted appointments list */}
              <div className="lg:col-span-12">
                <Appointments session={session} />
              </div>
            </div>
          </div>
        )}

        {activePanel === 'config' && <Settings session={session} />}
        
        {activePanel === 'logs' && <OperationalLogs />}
        
        {activePanel === 'bookings' && <Appointments session={session} />}
        
        {activePanel === 'integrations' && <Integrations />}

      </main>
    </div>
  );
}
