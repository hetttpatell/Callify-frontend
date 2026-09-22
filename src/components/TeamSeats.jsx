import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  Users,
  UserPlus,
  UserCheck,
  Crown,
  Mail,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import MagneticButton from "./MagneticButton";

export default function TeamSeats({ session, businessId, userRole = "business_owner" }) {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [maxSeats, setMaxSeats] = useState(4);
  const [subscriptionTier, setSubscriptionTier] = useState("growth");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const fetchTeamData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch Business details
      const { data: bData } = await supabase
        .from("businesses")
        .select("max_seats, subscription_tier, subscription_status")
        .eq("id", businessId || session.user.id)
        .maybeSingle();

      if (bData) {
        setMaxSeats(bData.max_seats || 4);
        setSubscriptionTier(bData.subscription_tier || "growth");
      }

      // Fetch all users connected to this business
      const { data: members, error } = await supabase
        .from("users")
        .select("*")
        .eq("business_id", businessId || session.user.id)
        .order("created_at", { ascending: true });

      if (!error && members) {
        setTeamMembers(members);
      } else {
        // Fallback: at least show the current user
        setTeamMembers([
          {
            id: session.user.id,
            email: session.user.email,
            full_name: session.user.email.split("@")[0].toUpperCase(),
            role: userRole,
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } catch (err) {
      console.error("Error fetching team data:", err);
    } finally {
      setLoading(false);
    }
  }, [businessId, session, userRole]);

  useEffect(() => {
    fetchTeamData();
  }, [fetchTeamData]);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (teamMembers.length >= maxSeats) {
      setMsg({
        type: "error",
        text: `Seat limit reached (${maxSeats}/${maxSeats}). Upgrade subscription to connect more accounts.`,
      });
      return;
    }

    setSubmitting(true);
    setMsg({ type: "", text: "" });

    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from("users")
        .select("id, email, business_id")
        .eq("email", inviteEmail.trim().toLowerCase())
        .maybeSingle();

      if (existingUser && existingUser.business_id) {
        throw new Error("This account is already connected to a business subscription.");
      }

      // Insert invitation in public.business_invitations
      const { error: invErr } = await supabase.from("business_invitations").insert({
        business_id: businessId || session.user.id,
        email: inviteEmail.trim().toLowerCase(),
        role: "staff_member",
      });

      if (invErr) throw invErr;

      setMsg({
        type: "success",
        text: `Invitation dispatched to ${inviteEmail}! They will have full staff access under your subscription.`,
      });
      setInviteEmail("");
      setInviteName("");
      fetchTeamData();
    } catch (err) {
      setMsg({ type: "error", text: err.message || "Failed to dispatch invitation." });
    } finally {
      setSubmitting(false);
    }
  };

  const seatsUsed = teamMembers.length;
  const seatsAvailable = Math.max(0, maxSeats - seatsUsed);
  const percentUsed = Math.min(100, Math.round((seatsUsed / maxSeats) * 100));

  return (
    <div className="space-y-8 font-body">
      {/* ── Top Subscription Seats Overview Card ── */}
      <div className="bg-gradient-to-br from-[#FFFDF5] via-[#FFF9E6] to-[#FEF3C7]/40 border-2 border-[#FFC300]/40 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-[#FFC300]/30">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#FFC300]/40 text-xs font-mono-data font-bold text-[#0F172A] mb-2 shadow-2xs">
              <Crown size={14} className="text-[#E0AB00]" />
              <span className="uppercase">{subscriptionTier} TIER SUBSCRIPTION</span>
            </div>
            <h2 className="font-display text-2xl font-black text-[#0F172A] tracking-tight">
              Shared Team Subscription & Connected Accounts
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-xl">
              One business purchase covers your entire front-desk team. Connect up to{" "}
              <strong>{maxSeats} individual user logins</strong> to this single subscription with zero extra billing.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-[#FFC300]/40 text-center min-w-[160px] shadow-sm">
            <span className="text-[10px] font-mono-data uppercase font-bold text-[#64748B] block">
              SEAT POOL ALLOCATION
            </span>
            <div className="font-display text-3xl font-black text-[#0F172A] mt-0.5">
              {seatsUsed} <span className="text-base text-[#94A3B8] font-semibold">/ {maxSeats}</span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 block mt-0.5">
              {seatsAvailable} Seats Open
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-xs font-mono-data text-[#64748B] mb-2">
            <span>Subscription Seat Utilization</span>
            <span>{percentUsed}% Used</span>
          </div>
          <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-[#E2E8F0] p-0.5">
            <div
              className="h-full bg-gradient-to-r from-[#FFC300] to-[#E0AB00] rounded-full transition-all duration-500"
              style={{ width: `${percentUsed}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Two-Column Layout: Invite Form & Active Team Roster ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Invite Member (For Business Owners) */}
        <div className="lg:col-span-5 bg-white border border-[#E2E8F0] rounded-3xl p-6 md:p-7 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-[#FFF9E6] border border-[#FFC300]/40 flex items-center justify-center text-[#E0AB00]">
              <UserPlus size={18} />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-[#0F172A]">
                Connect Team Account
              </h3>
              <p className="text-xs text-[#64748B]">Share your active plan with staff</p>
            </div>
          </div>

          {msg.text && (
            <div
              className={`mb-5 p-3.5 rounded-xl text-xs flex items-start gap-2 ${
                msg.type === "error"
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-emerald-50 text-emerald-800 border border-emerald-200"
              }`}
            >
              {msg.type === "error" ? <AlertCircle size={16} className="shrink-0 mt-0.5" /> : <CheckCircle2 size={16} className="shrink-0 mt-0.5" />}
              <span>{msg.text}</span>
            </div>
          )}

          {userRole === "business_owner" ? (
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-display font-semibold uppercase tracking-wider text-[#0F172A] mb-1.5">
                  Staff Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    type="email"
                    required
                    disabled={seatsAvailable === 0 || submitting}
                    placeholder="receptionist@clinic.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E2E8F0] text-xs text-[#0F172A] focus:outline-none focus:border-[#FFC300] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-display font-semibold uppercase tracking-wider text-[#0F172A] mb-1.5">
                  Staff Full Name / Designation (Optional)
                </label>
                <input
                  type="text"
                  disabled={seatsAvailable === 0 || submitting}
                  placeholder="e.g. Priya (Front-desk Lead)"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#FAFAFA] border border-[#E2E8F0] text-xs text-[#0F172A] focus:outline-none focus:border-[#FFC300] transition-colors"
                />
              </div>

              <div className="pt-2">
                <MagneticButton
                  type="submit"
                  disabled={seatsAvailable === 0 || submitting}
                  className="w-full py-3 rounded-xl bg-[#0F172A] text-white hover:bg-[#1E293B] text-xs font-bold gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <span>Dispatching...</span>
                  ) : seatsAvailable === 0 ? (
                    <span>All {maxSeats} Seats Filled</span>
                  ) : (
                    <>
                      <span>Grant Subscription Seat</span>
                      <Sparkles size={14} className="text-[#FFC300]" />
                    </>
                  )}
                </MagneticButton>
              </div>

              <p className="text-[11px] text-[#64748B] text-center pt-2">
                🔒 Connected accounts receive full access to Appointments, Call Transcripts & Logs without paying separately.
              </p>
            </form>
          ) : (
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#64748B]">
              <p className="font-semibold text-[#0F172A] mb-1">Staff Member Account</p>
              You are connected as a team member under this business subscription. Only the Business Owner can manage seat allocations.
            </div>
          )}
        </div>

        {/* Right: Active Team Roster */}
        <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-3xl p-6 md:p-7 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#F1F5F9]">
            <h3 className="font-display text-lg font-bold text-[#0F172A] flex items-center gap-2">
              <Users size={18} className="text-[#FFC300]" />
              Connected Team Roster ({seatsUsed})
            </h3>
            <span className="text-xs font-mono-data bg-[#F1F5F9] text-[#64748B] px-3 py-1 rounded-lg">
              Max {maxSeats} Accounts
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-[#94A3B8]">Loading team registry...</div>
          ) : (
            <div className="space-y-3">
              {teamMembers.map((member) => {
                const isOwner = member.role === "business_owner";
                return (
                  <div
                    key={member.id}
                    className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#E2E8F0] flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                          isOwner
                            ? "bg-[#FFF9E6] text-[#E0AB00] border border-[#FFC300]/40"
                            : "bg-white text-[#0F172A] border border-[#E2E8F0]"
                        }`}
                      >
                        {isOwner ? <Crown size={18} /> : <UserCheck size={18} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-display font-bold text-sm text-[#0F172A]">
                            {member.full_name || member.email?.split("@")[0]?.toUpperCase()}
                          </h4>
                          <span
                            className={`text-[10px] font-mono-data uppercase font-bold px-2 py-0.5 rounded-full ${
                              isOwner
                                ? "bg-[#FFC300]/20 text-[#B45309] border border-[#FFC300]/40"
                                : "bg-slate-100 text-[#64748B] border border-slate-200"
                            }`}
                          >
                            {isOwner ? "BUSINESS OWNER" : "STAFF MEMBER"}
                          </span>
                        </div>
                        <p className="font-mono-data text-xs text-[#64748B]">{member.email}</p>
                      </div>
                    </div>

                    <div className="text-right font-mono-data text-[11px] text-emerald-600 font-semibold">
                      ● Active Seat
                    </div>
                  </div>
                );
              })}

              {/* Empty Seats Placeholders */}
              {[...Array(seatsAvailable)].map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="p-3.5 rounded-2xl border-2 border-dashed border-[#E2E8F0] flex items-center justify-between text-xs text-[#94A3B8]"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-300" />
                    Available Subscription Seat #{seatsUsed + i + 1}
                  </span>
                  <span className="font-mono-data text-[10px] uppercase">Unassigned</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
