import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Bot, Save, Copy, Check, AlertCircle, Sparkles } from 'lucide-react';
import gsap from 'gsap';

export default function Settings({ session }) {
  const [loading, setLoading] = useState(true);
  const [businessName, setBusinessName] = useState('');
  const [domain, setDomain] = useState('room services or spa appointments');
  const [aiPrompt, setAiPrompt] = useState('');
  const [voiceId, setVoiceId] = useState('aura-asteria-en');
  const [exotelNumber, setExotelNumber] = useState('');

  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState({ type: '', text: '' });

  const VOICE_OPTIONS = [
    { id: 'aura-asteria-en', name: 'Asteria', gender: 'FEMALE', desc: 'Default receptionist. Warm, professional, and balanced tone.' },
    { id: 'aura-athena-en', name: 'Athena', gender: 'FEMALE', desc: 'Corporate specialist. Authoritative, crisp, and articulate.' },
    { id: 'aura-luna-en', name: 'Luna', gender: 'FEMALE', desc: 'Hospitality focus. Friendly, welcoming, and high-energy.' },
    { id: 'aura-zeus-en', name: 'Zeus', gender: 'MALE', desc: 'Support specialist. Confident, reassuring, and deep voice.' },
  ];

  useEffect(() => {
    const fetchBusinessProfile = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setBusinessName(data.business_name || '');
          setDomain(data.domain || 'room services or spa appointments');
          setAiPrompt(data.ai_prompt || '');
          setVoiceId(data.voice_id || 'aura-asteria-en');
          setExotelNumber(data.exotel_number || '');
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessProfile();
  }, [session]);

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(exotelNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedbackMsg({ type: '', text: '' });

    try {
      const { error } = await supabase
        .from('businesses')
        .update({
          business_name: businessName,
          domain: domain,
          ai_prompt: aiPrompt,
          voice_id: voiceId
        })
        .eq('id', session.user.id);

      if (error) throw error;

      setFeedbackMsg({ type: 'success', text: 'Co-processor instructions updated successfully.' });
      
      // Save micro-animation trigger
      gsap.fromTo('#save-settings-btn',
        { scale: 0.95 },
        { scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.3)' }
      );
    } catch (err) {
      console.error('Save error:', err);
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to sync settings with Supabase cloud node.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="pb-4 border-b border-white/5">
        <h2 className="text-xl font-serif-display text-text-primary">Receptionist Configuration</h2>
        <p className="text-xs text-text-muted font-sans-ui mt-0.5">
          Tune the neural prompt weights and vocal synthesis system. Updates take effect immediately on incoming calls.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs font-mono-data text-text-muted/50">
          <span className="inline-block w-5 h-5 border-2 border-accent-yellow border-t-transparent rounded-full animate-spin mr-2"></span>
          ACCESSING TRANSLATION INTERFACE SETTINGS...
        </div>
      ) : (
        <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Panel: Trunk Node Info */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-surface-card border border-white/10 rounded-2xl p-6 shadow-xl space-y-5">
              <h3 className="text-xs font-mono-data uppercase text-text-muted tracking-wider pb-2 border-b border-white/5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-accent-yellow" /> Node Registry Details
              </h3>

              {/* Business Name */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono-data text-text-muted uppercase tracking-wider block">BUSINESS NAME</label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono-data text-text-primary focus:outline-none focus:border-accent-yellow/50"
                />
              </div>

              {/* Exotel Virtual Number (Read-only) */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono-data text-text-muted uppercase tracking-wider block">EXOTEL VIRTUAL TRUNK</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={exotelNumber}
                    className="flex-1 bg-black/25 border border-white/5 text-text-muted rounded-xl px-4 py-2.5 text-xs font-mono-data focus:outline-none select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopyNumber}
                    className="px-3 border border-white/10 text-text-primary bg-black/40 hover:bg-white/5 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-text-muted" />}
                  </button>
                </div>
                <span className="text-[8px] font-mono-data text-text-muted/40 block leading-normal">
                  Exotel incoming route mapper. Copy to configure your SIP call redirection hook.
                </span>
              </div>

              {/* Domain Category */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono-data text-text-muted uppercase tracking-wider block">OPERATIONAL DOMAIN</label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs font-mono-data text-text-primary focus:outline-none focus:border-accent-yellow/50"
                >
                  <option value="room services or spa appointments">Hospitality / Room & Spa Booking</option>
                  <option value="haircut, massage, cosmetics">Beauty Spa / Salon & Wellness</option>
                  <option value="dental, clinics, medical">Dentistry / Medical & Consultations</option>
                  <option value="corporate scheduling">Enterprise / Administrative Scheduling</option>
                </select>
              </div>

              {/* Sync Health Badge */}
              <div className="border-t border-white/5 pt-4 flex justify-between items-center font-mono-data text-[10px]">
                <span className="text-text-muted">NODE STATUS:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> SYNCED
                </span>
              </div>
            </div>
          </div>

          {/* Right Panel: AI & TTS Config */}
          <div className="lg:col-span-8 space-y-6">
            {/* Feedback Notifications */}
            {feedbackMsg.text && (
              <div className={`p-4 border rounded-xl flex items-start gap-2.5 font-mono-data text-xs leading-relaxed animate-fade-in ${
                feedbackMsg.type === 'success' 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/25 text-rose-400'
              }`}>
                {feedbackMsg.type === 'success' ? <Sparkles className="w-4 h-4 shrink-0 mt-0.5 animate-pulse" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                <span>{feedbackMsg.text}</span>
              </div>
            )}

            {/* AI Prompts Settings Card */}
            <div className="bg-surface-card border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <h3 className="text-xs font-mono-data uppercase text-text-muted tracking-wider flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-accent-yellow" /> AI Receptionist Prompt Weights
                </h3>
                <span className="text-[9px] font-mono-data text-text-muted/40 uppercase">System Prompt Injection v2</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-mono-data text-text-primary uppercase tracking-wider">
                    RECEPTIONIST SYSTEM INSTRUCTION
                  </label>
                  <span className="text-[9px] text-text-muted/50 font-mono-data">Plaintext (Used in TTS output)</span>
                </div>
                <textarea
                  required
                  rows="7"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="You are an autonomous AI Receptionist..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 font-mono-data text-xs leading-relaxed text-text-primary placeholder-text-muted/20 focus:outline-none focus:border-accent-yellow/50 shadow-inner modern-scrollbar"
                />
                <div className="bg-black/35 rounded-lg p-3 border border-white/5 text-[9px] font-mono-data text-text-muted leading-relaxed">
                  <span className="text-accent-yellow font-bold">TUNING PARAMETERS:</span> To ensure optimum speech conversion quality, do not include emojis, bullet points, or markup. Write directives in plain english or target language. Specify handoff protocols explicitly (e.g. transfer to representative).
                </div>
              </div>

              {/* TTS Voice Selection Card */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-mono-data text-text-primary uppercase tracking-wider">
                    SPEECH SYNTHESIS ENGINE
                  </label>
                  <span className="text-[9px] text-text-muted/50 font-mono-data">Provided by Deepgram Aura</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {VOICE_OPTIONS.map((voice) => {
                    const isSelected = voiceId === voice.id;
                    return (
                      <div
                        key={voice.id}
                        onClick={() => setVoiceId(voice.id)}
                        className={`border rounded-xl p-4 cursor-pointer transition-all hover:border-white/20 select-none relative flex flex-col justify-between ${
                          isSelected 
                            ? 'bg-accent-yellow/[0.03] border-accent-yellow shadow-[0_2px_10px_rgba(255,211,0,0.08)]' 
                            : 'bg-black/30 border-white/5 text-text-muted'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className={`text-xs font-bold font-sans-ui ${isSelected ? 'text-accent-yellow' : 'text-text-primary'}`}>
                              Voice: {voice.name}
                            </span>
                            <span className="text-[8px] font-mono-data border border-white/10 rounded px-1.5 py-0.5">
                              {voice.gender}
                            </span>
                          </div>
                          <p className="text-[10px] leading-relaxed font-sans-ui text-text-muted font-normal">
                            {voice.desc}
                          </p>
                        </div>

                        {isSelected && (
                          <div className="absolute bottom-2.5 right-3">
                            <Check className="w-4 h-4 text-accent-yellow" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  id="save-settings-btn"
                  disabled={saving}
                  className="bg-accent-yellow text-base-bg font-sans-ui text-xs font-bold uppercase tracking-wider py-3.5 px-8 rounded-xl hover:shadow-[0_4px_14px_rgba(255,211,0,0.25)] hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-base-bg border-t-transparent rounded-full animate-spin"></span>
                      SYNCING NODE...
                    </>
                  ) : (
                    <>
                      SYNC CONFIGURATION <Save className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>

        </form>
      )}

    </div>
  );
}
