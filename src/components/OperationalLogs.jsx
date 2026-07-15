import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { PhoneIncoming, PhoneCall, Search, CheckCircle, AlertTriangle, Terminal, ShieldAlert } from 'lucide-react';

const INITIAL_LOGS = [
  {
    id: 'TX-9402',
    caller: '+1 (415) 555-0192',
    name: 'THOMAS MILLER',
    company: 'MILLER GRAPHICS CO.',
    time: '13:12:05',
    category: 'SCHEDULING',
    transcript: '“Hello, I need to reschedule my consultation with Dr. Aris to next Tuesday at 3 PM if that is open.” -> CALLIFY: “Checking schedule. Tuesday, July 21 at 15:00 hours is vacant. I have booked that slot and dispatched a confirmation SMS to this number.”',
    outcome: 'SUCCESS // CALENDAR_UPDATED',
    status: 'resolved',
    cost: '$0.07',
  },
  {
    id: 'TX-9403',
    caller: '+1 (212) 555-8943',
    name: 'HELENA V. [REDACTED]',
    company: 'REDACTED LTD',
    time: '13:10:48',
    category: 'CUSTOMER SUPPORT',
    transcript: '“My shipment arrived with a punctured cylinder. I need an immediate refund or replacement.” -> CALLIFY: “I have logged support ticket #SR-88402 for cylinder puncture. A replacement dispatch order #DP-092 has been created. Is there anything else?”',
    outcome: 'SUCCESS // SUPPORT_TICKET_GEN',
    status: 'resolved',
    cost: '$0.12',
  },
  {
    id: 'TX-9404',
    caller: '+1 (312) 555-4309',
    name: 'OFFICER D. BAKER',
    company: 'STATE INSPECTION',
    time: '13:08:12',
    category: 'EMERGENCY BYPASS',
    transcript: '“This is an emergency inspection notice. I must speak with the plant supervisor immediately.” -> CALLIFY: “Safety inspection protocol detected. Initiating immediate direct-dial ringthrough to Plant Supervisor cell line. Remaining on standby.”',
    outcome: 'ESCALATED // HUMAN_TRANSFER',
    status: 'escalated',
    cost: '$0.04',
  },
  {
    id: 'TX-9405',
    caller: '+1 (650) 555-7721',
    name: 'ALICE CHANG',
    company: 'APEX CONSULTANTS',
    time: '13:02:55',
    category: 'INQUIRY',
    transcript: '“What are your rates for offshore server replication and are you compliant with SOC2 Type II?” -> CALLIFY: “Callify replication services start at $0.004 per gigabyte-hour. We maintain continuous SOC2 Type II compliance. The compliance certificate has been emailed.”',
    outcome: 'RESOLVED // INFO_SENT',
    status: 'resolved',
    cost: '$0.09',
  },
  {
    id: 'TX-9406',
    caller: '+1 (800) 555-1102',
    name: 'UNKNOWN SPAMMER',
    company: 'VOIP MARKETING LLC',
    time: '12:59:44',
    category: 'SPAM / TELEMARKETING',
    transcript: '“Congratulations, you have won a complimentary cruise to—” -> CALLIFY: “Spam registry match #883-VoIP. Auto-terminating line. Blacklist updated.”',
    outcome: 'BLOCKED // SPAM_SHIELD',
    status: 'blocked',
    cost: '$0.00',
  }
];

const NEW_SIMULATED_CALLS = [
  {
    id: 'TX-9407',
    caller: '+1 (206) 555-9012',
    name: 'KAREN HENDERSON',
    company: 'HENDERSON LAW',
    time: '13:13:40',
    category: 'SCHEDULING',
    transcript: '“I need to cancel the deposition briefing tomorrow at 9 AM and move it to 11 AM.” -> CALLIFY: “Briefing deposition cancelled. Re-booked for tomorrow at 11:00 AM. Law Partner calendar invites updated.”',
    outcome: 'SUCCESS // CALENDAR_UPDATED',
    status: 'resolved',
    cost: '$0.06',
  },
  {
    id: 'TX-9408',
    caller: '+1 (818) 555-2384',
    name: 'MARCUS AURELIUS',
    company: 'STOIC ADVISORS',
    time: '13:14:15',
    category: 'VIP DIRECT',
    transcript: '“Tell Leo I am ready for the quarterly review meeting.” -> CALLIFY: “Understood. Relaying instant SMS notification to Leo: stoic review requested. Call ending.”',
    outcome: 'SUCCESS // SMS_RELAYED',
    status: 'resolved',
    cost: '$0.05',
  },
  {
    id: 'TX-9409',
    caller: '+1 (617) 555-1029',
    name: 'JOHNSON & SONS',
    company: 'SUPPLY CHAIN INC',
    time: '13:14:50',
    category: 'DISPATCH EMERGENCY',
    transcript: '“The dock doors are locked and our driver is waiting with the refrigerated shipment.” -> CALLIFY: “Emergency alert triggered. Paging warehouse night supervisor. Auto-opening Gate 4.”',
    outcome: 'ESCALATED // PAGING_SUPERVISOR',
    status: 'escalated',
    cost: '$0.08',
  }
];

export default function OperationalLogs() {
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState('TX-9402');
  const [newCallCounter, setNewCallCounter] = useState(0);
  
  const selectedLog = logs.find(log => log.id === selectedId) || logs[0];
  const listContainerRef = useRef(null);
  const detailsRef = useRef(null);

  // Simulate new calls coming in every 14 seconds to show dynamic reactivity
  useEffect(() => {
    const interval = setInterval(() => {
      if (newCallCounter < NEW_SIMULATED_CALLS.length) {
        const nextCall = NEW_SIMULATED_CALLS[newCallCounter];
        
        // Prepend new call to logs list
        setLogs(prev => [nextCall, ...prev]);
        setSelectedId(nextCall.id);
        setNewCallCounter(prev => prev + 1);

        // Modern highlight slide animation for new log entry
        const listItems = listContainerRef.current?.children;
        if (listItems && listItems.length > 0) {
          gsap.fromTo(listItems[0], 
            { backgroundColor: '#FFD300', color: '#121212', y: -20, opacity: 0 },
            { backgroundColor: 'transparent', color: '#FFFFFF', y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
          );
        }

        // Pulse details panel border
        if (detailsRef.current) {
          gsap.fromTo(detailsRef.current,
            { borderColor: '#FFD300', scale: 0.99 },
            { borderColor: 'rgba(255, 255, 255, 0.1)', scale: 1, duration: 0.8, ease: 'power3.out' }
          );
        }
      }
    }, 14000);

    return () => clearInterval(interval);
  }, [newCallCounter]);

  // Filter & Search Logic
  const filteredLogs = logs.filter(log => {
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'resolved' && log.status === 'resolved') ||
      (filter === 'escalated' && log.status === 'escalated') ||
      (filter === 'blocked' && log.status === 'blocked');
      
    const matchesSearch = 
      log.name.toLowerCase().includes(search.toLowerCase()) ||
      log.caller.includes(search) ||
      log.category.toLowerCase().includes(search.toLowerCase()) ||
      log.outcome.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const getStatusIcon = (status) => {
    switch(status) {
      case 'resolved': return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'escalated': return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'blocked': return <ShieldAlert className="w-4 h-4 text-rose-500" />;
      default: return <PhoneCall className="w-4 h-4 text-text-primary" />;
    }
  };

  const getStatusLabelColor = (status) => {
    switch(status) {
      case 'resolved': return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
      case 'escalated': return 'text-amber-400 border-amber-500/20 bg-amber-500/5';
      case 'blocked': return 'text-rose-400 border-rose-500/20 bg-rose-500/5';
      default: return 'text-text-primary border-white/10 bg-white/5';
    }
  };

  return (
    <section className="w-full bg-transparent py-12 px-4 md:px-8 border-t border-white/5 font-sans-ui">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Block using Section Badge pattern */}
        <div className="pb-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-card border border-white/10 mb-4">
              <span className="w-2 h-2 rounded-full bg-accent-yellow dot-pulse"></span>
              <span className="text-[10px] font-mono-data uppercase tracking-wider text-text-primary font-bold">TELEMETRY MONITOR</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-serif-display text-text-primary">
              Operational Call Logs
            </h2>
            <p className="text-text-muted text-sm mt-2 max-w-xl font-normal">
              Real-time conversational wire intercepts. View AI receptionist routing behaviors, automated database confirmations, and anti-spam termination transcripts.
            </p>
          </div>
          
          <div className="flex items-center gap-3 font-mono-data text-[11px] border border-white/10 rounded-xl px-4 py-2 bg-surface-card text-text-primary shadow-sm">
            <Terminal className="w-4 h-4 text-accent-yellow dot-pulse" />
            <span>WIRE_FEED: LIVE TELEMETRY</span>
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 dot-pulse"></span>
          </div>
        </div>

        {/* Console Controls / Filters */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {['all', 'resolved', 'escalated', 'blocked'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-2 text-xs font-mono-data rounded-lg border border-white/10 transition-all uppercase tracking-wider cursor-pointer ${
                  filter === tab 
                    ? 'bg-accent-yellow text-base-bg font-bold border-accent-yellow shadow-[0_2px_10px_rgba(255,211,0,0.2)]' 
                    : 'bg-surface-card text-text-muted hover:text-text-primary hover:border-white/20'
                }`}
              >
                {tab} logs
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-text-muted/60" />
            </span>
            <input
              type="text"
              placeholder="FILTER TRANSCRIPTS BY KEYWORD..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-card border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono-data text-text-primary placeholder-text-muted/40 focus:outline-none focus:border-accent-yellow/50 tracking-wider shadow-inner"
            />
          </div>
        </div>

        {/* Main Grid: Split console */}
        <div className="grid md:grid-cols-5 gap-6">
          
          {/* Left panel: Logs List Card */}
          <div className="md:col-span-2 border border-white/10 rounded-2xl bg-surface-card flex flex-col h-[420px] overflow-hidden shadow-2xl">
            <div className="bg-black/20 px-4 py-3 border-b border-white/10 font-mono-data text-[10px] tracking-wider flex justify-between uppercase text-text-muted">
              <span>INCOMING TRANSCRIPTION FEED</span>
              <span>COUNT: {filteredLogs.length}</span>
            </div>
            
            <div 
              ref={listContainerRef} 
              className="flex-1 overflow-y-auto modern-scrollbar divide-y divide-white/5"
            >
              {filteredLogs.length === 0 ? (
                <div className="p-12 text-center text-xs font-mono-data text-text-muted/50">
                  NO WIRE RECORDS CORRESPONDING TO FILTER
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    onClick={() => setSelectedId(log.id)}
                    className={`p-4 cursor-pointer transition-all flex flex-col gap-2 relative ${
                      selectedId === log.id 
                        ? 'bg-white/5 border-l-[3px] border-accent-yellow' 
                        : 'hover:bg-white/2'
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs font-mono-data">
                      <span className="font-bold text-text-primary flex items-center gap-1.5">
                        <PhoneIncoming className="w-3.5 h-3.5 text-accent-yellow" />
                        {log.id}
                      </span>
                      <span className="text-text-muted text-[10px]">{log.time}</span>
                    </div>

                    <div className="flex justify-between items-end mt-1">
                      <div>
                        <p className="text-xs font-bold text-text-primary tracking-wide">{log.name}</p>
                        <p className="text-[10px] text-text-muted font-mono-data mt-0.5">{log.caller}</p>
                      </div>
                      
                      <div className="flex items-center gap-1 text-[9px] font-mono-data uppercase border border-white/5 rounded-md px-2 py-0.5 bg-black/30">
                        {getStatusIcon(log.status)}
                        <span className={log.status === 'blocked' ? 'text-rose-400' : 'text-accent-yellow'}>
                          {log.category}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right panel: Log Details Card */}
          <div ref={detailsRef} className="md:col-span-3 border border-white/10 rounded-2xl bg-surface-card p-6 flex flex-col justify-between h-[420px] shadow-2xl relative">
            {selectedLog ? (
              <>
                <div className="space-y-5">
                  {/* Detailed Meta Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-white/5 pb-4 font-mono-data text-xs">
                    <div>
                      <span className="text-text-muted block text-[9px] uppercase mb-0.5">WIRE REFERENCE</span>
                      <span className="font-bold text-text-primary">{selectedLog.id}</span>
                    </div>
                    <div>
                      <span className="text-text-muted block text-[9px] uppercase mb-0.5">TIMESTAMP</span>
                      <span className="font-bold text-text-primary">{selectedLog.time} IST</span>
                    </div>
                    <div>
                      <span className="text-text-muted block text-[9px] uppercase mb-0.5">SYSTEM COST</span>
                      <span className="font-bold text-accent-yellow">{selectedLog.cost}</span>
                    </div>
                    <div>
                      <span className="text-text-muted block text-[9px] uppercase mb-0.5">ROUTING STATUS</span>
                      <span className={`font-bold border rounded px-2 py-0.5 text-[9px] inline-block mt-0.5 ${getStatusLabelColor(selectedLog.status)}`}>
                        {selectedLog.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Caller Profile */}
                  <div className="bg-black/30 p-3.5 border border-white/5 rounded-xl font-mono-data text-xs space-y-1">
                    <p className="text-text-primary"><span className="text-text-muted">INBOUND CALLER:</span> {selectedLog.name}</p>
                    <p className="text-text-primary"><span className="text-text-muted">TELEPHONE NR:</span> {selectedLog.caller}</p>
                    <p className="text-text-primary"><span className="text-text-muted">AFFILIATION:</span> {selectedLog.company}</p>
                  </div>

                  {/* Call Transcript Section */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-mono-data uppercase text-text-muted tracking-wider">
                      Conversational Intercept Transcript
                    </h4>
                    <div className="bg-black/40 border border-white/5 rounded-xl p-4 h-[140px] overflow-y-auto modern-scrollbar font-mono-data text-xs text-text-primary leading-relaxed">
                      {selectedLog.transcript.split(' -> ').map((part, i) => {
                        if (part.startsWith('CALLIFY:')) {
                          return (
                            <p key={i} className="text-accent-yellow mt-2 pl-3 border-l border-accent-yellow/40">
                              <span className="text-[9px] block text-accent-yellow/50">CO-PROCESSOR RESPONSE</span>
                              {part.replace('CALLIFY:', '').trim()}
                            </p>
                          );
                        }
                        return (
                          <p key={i} className="text-text-muted">
                            <span className="text-[9px] block text-text-muted/40">CUSTOMER RAW SIGNAL</span>
                            {part.trim()}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Final outcome banner */}
                <div className="border-t border-white/5 pt-4 mt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="font-mono-data text-[11px]">
                    <span className="text-text-muted">ROUTED TRANSACTION OUTCOME:</span>{' '}
                    <span className="font-bold text-accent-yellow">{selectedLog.outcome}</span>
                  </div>
                  <div className="text-[9px] font-mono-data text-text-muted/50 uppercase tracking-widest">
                    SECURED BY CALLIFY NODE
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-xs font-mono-data text-text-muted/50">
                SELECT A RECEPTIONIST LOG ENTRY TO VIEW TELEMETRY BOARD
              </div>
            )}
          </div>
        </div>

        {/* Small footer notice */}
        <div className="mt-6 pt-4 flex flex-col sm:flex-row justify-between items-center text-[10px] font-mono-data text-text-muted/30 gap-2">
          <p>PLATFORM WIRE AUDITING COMPLIES WITH GLOBAL PRIVACY PROTOCOLS (GDPR & SOC2 TYPE II).</p>
          <p>© 2026 CALLIFY CO. TELEPHONY MONITOR</p>
        </div>

      </div>
    </section>
  );
}
