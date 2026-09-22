import { useState } from "react";
import { Calculator, TrendingUp, Clock, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import MagneticButton from "./MagneticButton";

/**
 * RoiCalculator
 * Interactive ROI & Missed-Call Recovery Engine for Callify.
 */
export default function RoiCalculator({ onNavigateToAuth }) {
  const [dailyCalls, setDailyCalls] = useState(75);
  const [ticketValue, setTicketValue] = useState(2500);

  // Business metrics math
  // Industry average: 26% of calls go unanswered during peak/after-hours
  const monthlyCalls = dailyCalls * 30;
  const missedCallsPerMonth = Math.round(monthlyCalls * 0.26);
  // Conservative conversion: 22% of answered missed calls turn into booked appointments
  const recoveredBookings = Math.round(missedCallsPerMonth * 0.22);
  const monthlyRevenueSaved = recoveredBookings * ticketValue;
  const receptionistHoursSaved = Math.round((monthlyCalls * 2.8) / 60);

  return (
    <section className="relative py-24 px-6 overflow-hidden bg-gradient-to-b from-white via-[#FFFDF5] to-white">
      {/* Background Accent Halo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(255,195,0,0.12)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFF9E6] border border-[#FFC300]/40 text-[#E0AB00] font-display font-semibold text-xs uppercase tracking-wider mb-4">
            <Calculator size={14} className="text-[#FFC300]" />
            <span>Interactive ROI Simulator</span>
          </div>

          <h2 className="font-display text-4xl sm:text-5xl font-extrabold text-[#0F172A] tracking-tight descender-safe">
            Stop Losing ₹ Lakhs to{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-[#0F172A]">Unanswered Rings</span>
              <span className="absolute bottom-1 left-0 w-full h-3 bg-[#FFC300]/30 -z-0 rounded-sm" />
            </span>
          </h2>
          <p className="font-body text-lg text-[#64748B] mt-4 max-w-2xl mx-auto">
            Traditional front-desks miss 26% of customer calls when busy or after 7 PM. See how much Callify AI recovers for your business every single month.
          </p>
        </div>

        {/* Calculator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Controls Column */}
          <div className="lg:col-span-6 bg-white/90 backdrop-blur-xl rounded-3xl border border-[#E2E8F0] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between">
            <div>
              <h3 className="font-display text-xl font-bold text-[#0F172A] mb-6 flex items-center gap-2">
                <Sparkles size={20} className="text-[#FFC300]" />
                Your Business Parameters
              </h3>

              {/* Slider 1: Daily Calls */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <label className="font-display font-medium text-sm text-[#0F172A]">
                    Estimated Daily Inbound Calls
                  </label>
                  <span className="font-mono-data text-base font-bold text-[#0F172A] bg-[#FFF9E6] px-3 py-1 rounded-lg border border-[#FFC300]/30">
                    {dailyCalls} calls / day
                  </span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="400"
                  step="5"
                  value={dailyCalls}
                  onChange={(e) => setDailyCalls(Number(e.target.value))}
                  className="w-full h-2.5 bg-[#F1F5F9] rounded-lg appearance-none cursor-pointer accent-[#FFC300]"
                />
                <div className="flex justify-between text-xs text-[#94A3B8] mt-1 font-mono-data">
                  <span>15 calls</span>
                  <span>200 calls</span>
                  <span>400+ calls</span>
                </div>
              </div>

              {/* Slider 2: Average Ticket Value */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <label className="font-display font-medium text-sm text-[#0F172A]">
                    Avg. Appointment or Order Value
                  </label>
                  <span className="font-mono-data text-base font-bold text-[#0F172A] bg-[#FFF9E6] px-3 py-1 rounded-lg border border-[#FFC300]/30">
                    ₹{ticketValue.toLocaleString("en-IN")}
                  </span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="15000"
                  step="250"
                  value={ticketValue}
                  onChange={(e) => setTicketValue(Number(e.target.value))}
                  className="w-full h-2.5 bg-[#F1F5F9] rounded-lg appearance-none cursor-pointer accent-[#FFC300]"
                />
                <div className="flex justify-between text-xs text-[#94A3B8] mt-1 font-mono-data">
                  <span>₹500</span>
                  <span>₹7,500</span>
                  <span>₹15,000+</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[#F1F5F9] flex items-center justify-between text-xs text-[#64748B]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-emerald-500" />
                Zero setup code required
              </span>
              <span>Based on 5,000+ live deployments</span>
            </div>
          </div>

          {/* Results Projection Card */}
          <div className="lg:col-span-6 rounded-3xl bg-gradient-to-br from-[#FFFDF0] via-[#FFF9E6] to-[#FEF3C7] border-2 border-[#FFC300]/50 p-8 shadow-[0_12px_40px_rgba(255,195,0,0.18)] flex flex-col justify-between relative overflow-hidden">
            {/* Background Decorative Rings */}
            <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full border border-[#FFC300]/30 pointer-events-none" />
            <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full border border-[#FFC300]/40 pointer-events-none" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-[#FFC300]/40 text-[#0F172A] text-xs font-bold font-mono-data mb-4">
                <TrendingUp size={14} className="text-[#E0AB00]" />
                PROJECTED 30-DAY IMPACT
              </div>

              <div className="mb-6">
                <p className="text-xs uppercase tracking-wider font-semibold text-[#64748B]">
                  Net Monthly Revenue Recovered
                </p>
                <div className="font-display text-5xl sm:text-6xl font-black text-[#0F172A] tracking-tight mt-1 flex items-baseline gap-1">
                  <span>₹{monthlyRevenueSaved.toLocaleString("en-IN")}</span>
                  <span className="text-lg font-bold text-[#E0AB00]">/mo</span>
                </div>
              </div>

              {/* Sub-metrics */}
              <div className="grid grid-cols-2 gap-4 my-6">
                <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-[#FFC300]/30">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#64748B] mb-1">
                    <Clock size={14} className="text-[#FFC300]" />
                    STAFF HOURS SAVED
                  </div>
                  <p className="font-mono-data text-2xl font-black text-[#0F172A]">
                    {receptionistHoursSaved} hrs
                  </p>
                  <span className="text-[11px] text-[#64748B]">freed from routine booking</span>
                </div>

                <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-[#FFC300]/30">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#64748B] mb-1">
                    <Sparkles size={14} className="text-[#FFC300]" />
                    BOOKINGS RESCUED
                  </div>
                  <p className="font-mono-data text-2xl font-black text-[#0F172A]">
                    +{recoveredBookings} deals
                  </p>
                  <span className="text-[11px] text-[#64748B]">from missed callers</span>
                </div>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="relative z-10 pt-4 border-t border-[#FFC300]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-[#0F172A]">
                  Ready to deploy your custom voice agent?
                </p>
                <p className="text-[11px] text-[#64748B]">Takes less than 3 minutes to activate</p>
              </div>

              <MagneticButton
                onClick={onNavigateToAuth}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#0F172A] text-white hover:bg-[#1E293B] shadow-md gap-2 text-sm"
              >
                <span>Start Free Trial</span>
                <ArrowRight size={16} className="text-[#FFC300]" />
              </MagneticButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
