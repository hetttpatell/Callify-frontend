import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  Calendar,
  Search,
  Edit3,
  XCircle,
  CheckCircle,
  Clock,
  Check,
  AlertCircle,
  Plus,
  RefreshCw,
  Phone,
  Trash2,
} from "lucide-react";
import gsap from "gsap";
import MagneticButton from "./MagneticButton";

export default function Appointments({ session, businessId }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [resolvedBusinessId, setResolvedBusinessId] = useState(businessId || null);

  // Rescheduling Modal State
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [rescheduleError, setRescheduleError] = useState("");

  // New Appointment Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCallerPhone, setNewCallerPhone] = useState("");
  const [newServiceName, setNewServiceName] = useState("Dental Consultation & Checkup");
  const [createDate, setCreateDate] = useState("");
  const [createTime, setCreateTime] = useState("10:00 AM");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

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

  // Fetch appointments for this business tenant
  const fetchAppointments = useCallback(async (targetId) => {
    if (!targetId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("business_id", targetId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAppointments(data || []);
    } catch (err) {
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let channel;
    const initialize = async () => {
      const effId = await fetchTargetBusinessId();
      if (effId) {
        fetchAppointments(effId);

        // Supabase real-time channel for live appointment bookings
        channel = supabase
          .channel(`realtime_appointments_${effId}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "appointments",
              filter: `business_id=eq.${effId}`,
            },
            () => {
              fetchAppointments(effId);
            }
          )
          .subscribe();
      }
    };

    initialize();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [fetchTargetBusinessId, fetchAppointments]);

  // Update appointment status in Supabase
  const updateStatus = async (apptId, newStatus) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: newStatus })
        .eq("id", apptId);

      if (error) throw error;

      setAppointments((prev) =>
        prev.map((appt) => (appt.id === apptId ? { ...appt, status: newStatus } : appt))
      );

      gsap.fromTo(
        `#appt-row-${apptId}`,
        { backgroundColor: "rgba(255, 195, 0, 0.25)" },
        { backgroundColor: "transparent", duration: 0.8, ease: "power2.out" }
      );
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  // Delete an appointment
  const handleDeleteAppointment = async (apptId) => {
    if (!window.confirm("Are you sure you want to delete this appointment from the database?")) return;
    try {
      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", apptId);

      if (error) throw error;

      setAppointments((prev) => prev.filter((a) => a.id !== apptId));
    } catch (err) {
      console.error("Error deleting appointment:", err);
    }
  };

  // Reschedule Form Submit
  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!newDate || !newTime) return;
    setSubmitting(true);
    setRescheduleError("");

    try {
      const { error } = await supabase
        .from("appointments")
        .update({
          date: newDate,
          time: newTime,
          status: "Confirmed",
        })
        .eq("id", selectedAppt.id);

      if (error) throw error;

      setAppointments((prev) =>
        prev.map((appt) =>
          appt.id === selectedAppt.id
            ? { ...appt, date: newDate, time: newTime, status: "Confirmed" }
            : appt
        )
      );

      setSelectedAppt(null);
      setNewDate("");
      setNewTime("");
    } catch (err) {
      console.error("Rescheduling error:", err);
      setRescheduleError(err.message || "Failed to update schedule in Supabase.");
    } finally {
      setSubmitting(false);
    }
  };

  // Manual New Appointment Submit
  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    if (!newCallerPhone || !newServiceName || !createDate || !createTime) return;
    setCreating(true);
    setCreateError("");

    try {
      const { data, error } = await supabase
        .from("appointments")
        .insert({
          business_id: resolvedBusinessId,
          caller_phone: newCallerPhone,
          service_name: newServiceName,
          date: createDate,
          time: createTime,
          status: "Confirmed",
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setAppointments((prev) => [data, ...prev]);
      }

      setShowCreateModal(false);
      setNewCallerPhone("");
      setCreateDate("");
      setCreateTime("10:00 AM");
    } catch (err) {
      console.error("Create appointment error:", err);
      setCreateError(err.message || "Failed to insert appointment into Supabase.");
    } finally {
      setCreating(false);
    }
  };

  // Filter & Search Logic
  const filteredAppointments = appointments.filter((appt) => {
    const phone = appt.caller_phone || "";
    const service = appt.service_name || "";
    const matchesSearch =
      phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || appt.status?.toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    const baseClass =
      "px-2.5 py-1 rounded-full text-[10px] font-mono-data uppercase font-bold border flex items-center gap-1.5 w-fit";
    switch (status) {
      case "Confirmed":
        return (
          <span className={`${baseClass} text-emerald-700 border-emerald-200 bg-emerald-50`}>
            <Check className="w-3 h-3 text-emerald-600" /> Confirmed
          </span>
        );
      case "Completed":
        return (
          <span className={`${baseClass} text-blue-700 border-blue-200 bg-blue-50`}>
            <CheckCircle className="w-3 h-3 text-blue-600" /> Completed
          </span>
        );
      case "Cancelled":
        return (
          <span className={`${baseClass} text-rose-700 border-rose-200 bg-rose-50`}>
            <XCircle className="w-3 h-3 text-rose-600" /> Cancelled
          </span>
        );
      default:
        return (
          <span className={`${baseClass} text-amber-700 border-amber-200 bg-amber-50`}>
            <Clock className="w-3 h-3 text-amber-600" /> {status}
          </span>
        );
    }
  };

  // Quick stats
  const totalCount = appointments.length;
  const confirmedCount = appointments.filter((a) => a.status === "Confirmed").length;
  const completedCount = appointments.filter((a) => a.status === "Completed").length;

  return (
    <div className="space-y-6 font-body">
      {/* ── HEADER SUMMARY & ACTIONS ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-[#F1F5F9]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#FFC300]/40 text-xs font-mono-data font-bold text-[#0F172A] mb-1.5 shadow-2xs">
            <Calendar size={13} className="text-[#E0AB00]" />
            <span>REAL-TIME DATABASE LEDGER</span>
          </div>
          <h2 className="font-display text-2xl font-black text-[#0F172A] tracking-tight">
            Booked Appointments
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Confirmed calendar reservations booked autonomously by Callify voice receptionists.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <button
            onClick={() => fetchAppointments(resolvedBusinessId)}
            className="p-2.5 rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer"
            title="Refresh Ledger"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-[#FFC300]" : ""} />
          </button>

          <MagneticButton
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[#0F172A] text-white hover:bg-[#1E293B] text-xs font-display font-bold uppercase tracking-wider gap-1.5 shadow-xs"
          >
            <Plus size={14} className="text-[#FFC300]" />
            <span>New Appointment</span>
          </MagneticButton>
        </div>
      </div>

      {/* ── METRIC PILLS & SEARCH / FILTERS ── */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
        {/* Metric pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono-data">
          <span className="px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] font-bold">
            Total Bookings: <span className="text-[#B45309]">{totalCount}</span>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold">
            Active Confirmed: {confirmedCount}
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-bold">
            Completed: {completedCount}
          </span>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-wrap sm:flex-nowrap gap-2.5">
          <div className="relative flex-1 sm:w-64">
            <Search className="h-3.5 w-3.5 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search phone or service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl pl-9 pr-3.5 py-2 text-xs font-body text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#FFC300] focus:ring-2 focus:ring-[#FFC300]/20 transition-all"
            />
          </div>

          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs font-mono-data text-[#0F172A] focus:outline-none focus:border-[#FFC300] cursor-pointer"
            >
              <option value="all">ALL STATUSES</option>
              <option value="Confirmed">CONFIRMED</option>
              <option value="Completed">COMPLETED</option>
              <option value="Cancelled">CANCELLED</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── APPOINTMENTS TABLE ── */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto modern-scrollbar">
          <table className="w-full text-left border-collapse font-body text-xs">
            <thead>
              <tr className="bg-[#F8FAFC] text-[#64748B] border-b border-[#E2E8F0] uppercase text-[10px] font-mono-data font-bold tracking-wider">
                <th className="px-5 py-3.5">Caller Phone</th>
                <th className="px-5 py-3.5">Treatment / Service</th>
                <th className="px-5 py-3.5">Schedule Date</th>
                <th className="px-5 py-3.5">Time Slot</th>
                <th className="px-5 py-3.5">System Status</th>
                <th className="px-5 py-3.5 text-right">Quick Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-16 text-[#64748B] font-mono-data">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#FFC300] border-t-transparent rounded-full animate-spin" />
                      <span>Querying Supabase Appointments Ledger...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-16 text-[#64748B] font-mono-data">
                    No reservations found matching current search.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((appt) => (
                  <tr
                    key={appt.id}
                    id={`appt-row-${appt.id}`}
                    className="hover:bg-[#FFFDF5] transition-colors group"
                  >
                    <td className="px-5 py-4 font-mono-data font-bold text-[#0F172A]">
                      <div className="flex items-center gap-2">
                        <Phone size={13} className="text-[#E0AB00]" />
                        <span>{appt.caller_phone}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-display font-semibold text-[#0F172A]">
                      {appt.service_name}
                    </td>
                    <td className="px-5 py-4 font-mono-data text-[#475569]">
                      <span className="px-2 py-0.5 rounded-md bg-[#F1F5F9] text-[#0F172A] font-medium">
                        {appt.date}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono-data text-[#475569]">
                      <span className="px-2 py-0.5 rounded-md bg-[#FFF9E6] text-[#B45309] font-bold">
                        {appt.time}
                      </span>
                    </td>
                    <td className="px-5 py-4">{getStatusBadge(appt.status)}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedAppt(appt);
                            setNewDate(appt.date);
                            setNewTime(appt.time);
                          }}
                          className="p-1.5 hover:bg-[#FFF9E6] text-[#64748B] hover:text-[#B45309] rounded-lg transition-colors cursor-pointer"
                          title="Reschedule Booking"
                        >
                          <Edit3 size={14} />
                        </button>

                        {appt.status !== "Completed" && (
                          <button
                            onClick={() => updateStatus(appt.id, "Completed")}
                            className="p-1.5 hover:bg-blue-50 text-[#64748B] hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                            title="Mark Completed"
                          >
                            <CheckCircle size={14} />
                          </button>
                        )}

                        {appt.status !== "Cancelled" && (
                          <button
                            onClick={() => updateStatus(appt.id, "Cancelled")}
                            className="p-1.5 hover:bg-rose-50 text-[#64748B] hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                            title="Cancel Booking"
                          >
                            <XCircle size={14} />
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteAppointment(appt.id)}
                          className="p-1.5 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── RESCHEDULE MODAL ── */}
      {selectedAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-panel-content">
            <div className="flex justify-between items-start pb-3 border-b border-[#F1F5F9]">
              <div>
                <h3 className="font-display font-bold text-lg text-[#0F172A]">
                  Reschedule Appointment
                </h3>
                <p className="text-xs text-[#64748B]">Caller: {selectedAppt.caller_phone}</p>
              </div>
              <button
                onClick={() => setSelectedAppt(null)}
                className="text-[#64748B] hover:text-[#0F172A] p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {rescheduleError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle size={14} />
                <span>{rescheduleError}</span>
              </div>
            )}

            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-display font-bold uppercase tracking-wider text-[#0F172A] mb-1.5">
                  Service / Reason
                </label>
                <input
                  type="text"
                  disabled
                  value={selectedAppt.service_name}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-medium text-[#64748B]"
                />
              </div>

              <div>
                <label className="block text-xs font-display font-bold uppercase tracking-wider text-[#0F172A] mb-1.5">
                  New Schedule Date
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. tomorrow or 2026-07-22"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E2E8F0] text-xs text-[#0F172A] font-mono-data focus:outline-none focus:border-[#FFC300]"
                />
              </div>

              <div>
                <label className="block text-xs font-display font-bold uppercase tracking-wider text-[#0F172A] mb-1.5">
                  New Time Slot
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 11:30 AM or 16:00"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E2E8F0] text-xs text-[#0F172A] font-mono-data focus:outline-none focus:border-[#FFC300]"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedAppt(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[#E2E8F0] text-xs font-semibold text-[#64748B] hover:bg-[#F8FAFC] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-[#0F172A] text-white hover:bg-[#1E293B] text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Updating..." : "Confirm Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── NEW APPOINTMENT CREATION MODAL ── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-panel-content">
            <div className="flex justify-between items-start pb-3 border-b border-[#F1F5F9]">
              <div>
                <h3 className="font-display font-bold text-lg text-[#0F172A]">
                  Book New Appointment
                </h3>
                <p className="text-xs text-[#64748B]">Add a booking directly to the Supabase database</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#64748B] hover:text-[#0F172A] p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {createError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle size={14} />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateAppointment} className="space-y-4">
              <div>
                <label className="block text-xs font-display font-bold uppercase tracking-wider text-[#0F172A] mb-1.5">
                  Caller Phone Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="+91 98201 55678"
                  value={newCallerPhone}
                  onChange={(e) => setNewCallerPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E2E8F0] text-xs text-[#0F172A] font-mono-data focus:outline-none focus:border-[#FFC300]"
                />
              </div>

              <div>
                <label className="block text-xs font-display font-bold uppercase tracking-wider text-[#0F172A] mb-1.5">
                  Service / Treatment Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Root Canal or Teeth Whitening"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E2E8F0] text-xs text-[#0F172A] focus:outline-none focus:border-[#FFC300]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-display font-bold uppercase tracking-wider text-[#0F172A] mb-1.5">
                    Date
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="tomorrow"
                    value={createDate}
                    onChange={(e) => setCreateDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E2E8F0] text-xs text-[#0F172A] font-mono-data focus:outline-none focus:border-[#FFC300]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-display font-bold uppercase tracking-wider text-[#0F172A] mb-1.5">
                    Time Slot
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="10:00 AM"
                    value={createTime}
                    onChange={(e) => setCreateTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E2E8F0] text-xs text-[#0F172A] font-mono-data focus:outline-none focus:border-[#FFC300]"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#E2E8F0] text-xs font-semibold text-[#64748B] hover:bg-[#F8FAFC] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-2.5 rounded-xl bg-[#0F172A] text-white hover:bg-[#1E293B] text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
                >
                  {creating ? "Booking..." : "Create Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
