import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Calendar, Search, Edit3, XCircle, CheckCircle, Clock, Check, AlertCircle } from 'lucide-react';
import gsap from 'gsap';

export default function Appointments({ session }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Rescheduling Modal State
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch appointments for this business tenant
  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .eq('business_id', session.user.id)
          .order('date', { ascending: true })
          .order('time', { ascending: true });

        if (error) throw error;
        setAppointments(data || []);
      } catch (err) {
        console.error('Error fetching appointments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [session]);

  const updateStatus = async (apptId, newStatus) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', apptId);

      if (error) throw error;

      // Update local state
      setAppointments(prev => prev.map(appt => 
        appt.id === apptId ? { ...appt, status: newStatus } : appt
      ));
      
      // Micro-animation trigger on row
      gsap.fromTo(`#appt-row-${apptId}`,
        { backgroundColor: 'rgba(255, 211, 0, 0.1)' },
        { backgroundColor: 'transparent', duration: 0.6 }
      );
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!newDate || !newTime) return;
    setSubmitting(true);
    setErrorMsg('');

    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          date: newDate,
          time: newTime,
          status: 'Confirmed'
        })
        .eq('id', selectedAppt.id);

      if (error) throw error;

      // Update local state
      setAppointments(prev => prev.map(appt => 
        appt.id === selectedAppt.id ? { ...appt, date: newDate, time: newTime, status: 'Confirmed' } : appt
      ));

      setSelectedAppt(null);
      setNewDate('');
      setNewTime('');
    } catch (err) {
      console.error('Rescheduling error:', err);
      setErrorMsg(err.message || 'Failed to update schedule.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter & Search Logic
  const filteredAppointments = appointments.filter(appt => {
    const matchesSearch = 
      appt.caller_phone.includes(searchQuery) ||
      appt.service_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = 
      filterStatus === 'all' || 
      appt.status.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    const baseClass = "px-2 py-0.5 rounded-md text-[9px] font-mono-data uppercase font-bold border w-fit flex items-center gap-1";
    switch(status) {
      case 'Confirmed':
        return <span className={`${baseClass} text-emerald-400 border-emerald-500/20 bg-emerald-500/5`}><Check className="w-2.5 h-2.5" /> Confirmed</span>;
      case 'Completed':
        return <span className={`${baseClass} text-blue-400 border-blue-500/20 bg-blue-500/5`}><CheckCircle className="w-2.5 h-2.5" /> Completed</span>;
      case 'Cancelled':
        return <span className={`${baseClass} text-rose-400 border-rose-500/20 bg-rose-500/5`}><XCircle className="w-2.5 h-2.5" /> Cancelled</span>;
      default:
        return <span className={`${baseClass} text-amber-400 border-amber-500/20 bg-amber-500/5`}><Clock className="w-2.5 h-2.5" /> {status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-xl font-serif-display text-text-primary">Ledger Bookings</h2>
          <p className="text-xs text-text-muted font-sans-ui mt-0.5">
            Overview of appointments scheduled by the AI Voice co-processor.
          </p>
        </div>

        {/* Console Search */}
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <div className="relative shrink-0 w-full sm:w-60">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-3.5 w-3.5 text-text-muted/60" />
            </span>
            <input
              type="text"
              placeholder="SEARCH BY CALLER / SERVICE..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs font-mono-data text-text-primary placeholder-text-muted/30 focus:outline-none focus:border-accent-yellow/50 tracking-wider shadow-inner"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-surface-card border border-white/10 rounded-xl px-3 py-2 text-xs font-mono-data text-text-primary focus:outline-none focus:border-accent-yellow/50"
          >
            <option value="all">ALL RESERVATIONS</option>
            <option value="Confirmed">CONFIRMED</option>
            <option value="Completed">COMPLETED</option>
            <option value="Cancelled">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-surface-card border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto modern-scrollbar">
          <table className="w-full text-left border-collapse font-mono-data text-xs">
            <thead>
              <tr className="bg-black/25 text-text-muted border-b border-white/10 uppercase text-[10px] tracking-wider">
                <th className="px-6 py-4 font-semibold">Caller Phone</th>
                <th className="px-6 py-4 font-semibold">Service Name</th>
                <th className="px-6 py-4 font-semibold">Schedule Date</th>
                <th className="px-6 py-4 font-semibold">Time Slot</th>
                <th className="px-6 py-4 font-semibold">System Status</th>
                <th className="px-6 py-4 font-semibold text-right">Node Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-text-muted/50 font-normal">
                    <span className="inline-block w-5 h-5 border-2 border-accent-yellow border-t-transparent rounded-full animate-spin mr-2"></span>
                    RETRIEVING BUSINESS LEDGER...
                  </td>
                </tr>
              ) : filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-text-muted/50 font-normal">
                    NO ACTIVE RESERVATIONS ENCOUNTERED.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map(appt => (
                  <tr 
                    key={appt.id} 
                    id={`appt-row-${appt.id}`}
                    className="hover:bg-white/2 transition-colors group"
                  >
                    <td className="px-6 py-4 font-bold text-text-primary select-text">{appt.caller_phone}</td>
                    <td className="px-6 py-4 text-text-primary capitalize">{appt.service_name}</td>
                    <td className="px-6 py-4 text-text-primary flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-accent-yellow/70" />
                      {appt.date}
                    </td>
                    <td className="px-6 py-4 text-text-primary">{appt.time}</td>
                    <td className="px-6 py-4">{getStatusBadge(appt.status)}</td>
                    <td className="px-6 py-4 text-right">
                      {appt.status !== 'Cancelled' && appt.status !== 'Completed' ? (
                        <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => updateStatus(appt.id, 'Completed')}
                            title="Complete Booking"
                            className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/20 transition-all cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedAppt(appt);
                              setNewDate(appt.date);
                              setNewTime(appt.time);
                            }}
                            title="Reschedule"
                            className="p-1.5 bg-accent-yellow/10 hover:bg-accent-yellow/20 text-accent-yellow rounded-lg border border-accent-yellow/20 transition-all cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => updateStatus(appt.id, 'Cancelled')}
                            title="Cancel Booking"
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/20 transition-all cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-text-muted/40 uppercase">Archived</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reschedule Modal */}
      {selectedAppt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-card border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
            <div className="absolute top-0 right-0 w-16 h-16 bg-accent-yellow/5 rounded-full blur-2xl"></div>

            <div className="mb-4">
              <h3 className="text-lg font-serif-display text-text-primary">Reschedule Reservation</h3>
              <p className="text-xs text-text-muted mt-0.5">
                Alter the calendar slot for caller <span className="text-accent-yellow font-bold">{selectedAppt.caller_phone}</span>.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-2.5 bg-rose-500/10 border border-rose-500/25 rounded-xl flex items-start gap-1.5 text-rose-400 text-[10px] leading-relaxed">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono-data text-text-muted uppercase tracking-wider block">NEW DATE</label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono-data text-text-primary focus:outline-none focus:border-accent-yellow/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono-data text-text-muted uppercase tracking-wider block">NEW TIME SLOT (24H)</label>
                <input
                  type="time"
                  required
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono-data text-text-primary focus:outline-none focus:border-accent-yellow/50"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAppt(null)}
                  className="flex-1 py-2.5 border border-white/10 text-text-primary font-mono-data text-[10px] uppercase rounded-xl hover:bg-white/5 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-accent-yellow text-base-bg font-mono-data text-[10px] font-bold uppercase rounded-xl hover:brightness-105 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {submitting ? 'Updating...' : 'Commit Change'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
