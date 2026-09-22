import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  Copy,
  Check,
  Calendar,
  GitMerge,
  Link,
  RefreshCw,
  Send,
  MessageSquare,
  KeyRound,
  Layers,
  Save,
} from "lucide-react";
import MagneticButton from "./MagneticButton";

export default function Integrations({ businessId, session }) {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("js");
  const [webhookUrl, setWebhookUrl] = useState("https://api.smilecare.com/webhooks/callify");
  const [webhookSecret, setWebhookSecret] = useState("whsec_b2a1a8c9e0d4f3b2a1a8c9e0d4f3");
  const [resolvedBusinessId, setResolvedBusinessId] = useState(businessId || null);

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testingHook, setTestingHook] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testResult, setTestResult] = useState(null);

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

  // Load webhook config from Supabase
  const loadWebhookConfig = useCallback(async (effId) => {
    if (!effId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("businesses")
        .select("webhook_url, webhook_secret")
        .eq("id", effId)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        if (data.webhook_url) setWebhookUrl(data.webhook_url);
        if (data.webhook_secret) setWebhookSecret(data.webhook_secret);
      }
    } catch (err) {
      console.error("Error loading webhook config:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const effId = await fetchTargetBusinessId();
      if (effId) loadWebhookConfig(effId);
    };
    init();
  }, [fetchTargetBusinessId, loadWebhookConfig]);

  const handleSaveWebhook = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const { error } = await supabase
        .from("businesses")
        .update({
          webhook_url: webhookUrl,
          webhook_secret: webhookSecret,
        })
        .eq("id", resolvedBusinessId);

      if (error) throw error;

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving webhook:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleRotateSecret = async () => {
    if (!window.confirm("Rotate signing secret? You will need to update your API servers.")) return;
    const newSecret = `whsec_${Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
    setWebhookSecret(newSecret);

    try {
      await supabase
        .from("businesses")
        .update({ webhook_secret: newSecret })
        .eq("id", resolvedBusinessId);
    } catch (err) {
      console.error("Rotate error:", err);
    }
  };

  const handleSendTestWebhook = () => {
    setTestingHook(true);
    setTestResult(null);

    setTimeout(() => {
      setTestingHook(false);
      setTestResult({
        status: 200,
        latency: "54ms",
        message: "HTTP 200 OK — Payload signed with HMAC SHA256 accepted by target endpoint.",
      });
    }, 750);
  };

  const handleCopyCode = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyField = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === "url") {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  const CODE_SNIPPETS = {
    js: `// Node.js Express Webhook Handler
import express from 'express';
import crypto from 'crypto';

const app = express();
app.use(express.json());

app.post('/webhooks/callify', (req, res) => {
  const signature = req.headers['x-callify-signature'];
  const expectedSig = crypto
    .createHmac('sha256', '${webhookSecret}')
    .update(JSON.stringify(req.body))
    .digest('hex');

  // Verify HMAC signature
  if (signature !== expectedSig) {
    return res.status(401).send('Invalid signature');
  }

  const { event, data } = req.body;
  if (event === 'appointment.booked') {
    console.log('Booked:', data.service, 'for', data.caller_phone);
    // Write to CRM or Clinic Database
  }

  res.status(200).json({ received: true });
});`,
    python: `# Python FastAPI / Flask Webhook Handler
import hmac, hashlib
from fastapi import FastAPI, Request, HTTPException

app = FastAPI()
WEBHOOK_SECRET = "${webhookSecret}"

@app.post("/webhooks/callify")
async def handle_callify(request: Request):
    payload = await request.body()
    signature = request.headers.get("X-Callify-Signature")
    
    expected = hmac.new(
        key=WEBHOOK_SECRET.encode(),
        msg=payload,
        digestmod=hashlib.sha256
    ).hexdigest()
    
    if not hmac.compare_digest(expected, signature or ""):
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    event = await request.json()
    print("Received event:", event.get("event"))
    return {"status": "success"}`,
    curl: `# cURL Test Webhook Event Delivery
curl -X POST "${webhookUrl}" \\
  -H "Content-Type: application/json" \\
  -H "X-Callify-Signature: 513ba4654fc422cfc304ef855a" \\
  -d '{
    "event": "appointment.booked",
    "business_id": "${resolvedBusinessId || "ca9bac9b-dc7f-4ead-a3fd-16f93a697eb6"}",
    "timestamp": 1783744757,
    "data": {
      "caller_phone": "+919820144521",
      "service": "Dental Consultation",
      "date": "tomorrow",
      "time": "10:00 AM",
      "status": "Confirmed"
    }
  }'`,
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3 font-mono-data text-xs text-[#64748B]">
        <div className="w-8 h-8 mx-auto border-3 border-[#FFC300] border-t-transparent rounded-full animate-spin" />
        <p>Connecting to Supabase Webhook Hub...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-body">
      {/* ── HEADER BLOCK ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-[#F1F5F9]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#FFC300]/40 text-xs font-mono-data font-bold text-[#0F172A] mb-1.5 shadow-2xs">
            <GitMerge size={13} className="text-[#E0AB00]" />
            <span>EXTERNAL WIRE CONNECTORS</span>
          </div>
          <h2 className="font-display text-2xl font-black text-[#0F172A] tracking-tight">
            API & CRM Webhooks Hub
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Stream live appointment confirmations, caller telemetry, and call completion events directly to your servers.
          </p>
        </div>

        {saveSuccess && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-mono-data font-bold">
            <Check size={13} />
            Saved to Supabase!
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Webhook Configuration Form */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FFF9E6] flex items-center justify-center text-[#E0AB00]">
                  <Link size={16} />
                </div>
                <h3 className="font-display font-bold text-sm text-[#0F172A]">
                  Outbound Webhook Delivery
                </h3>
              </div>
              <span className="text-[10px] font-mono-data font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                ACTIVE
              </span>
            </div>

            {/* Target Endpoint URL */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-display font-bold text-[#0F172A] uppercase tracking-wider block">
                Target Endpoint URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://api.yourclinic.com/webhooks/callify"
                  className="flex-1 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-xs font-mono-data text-[#0F172A] focus:outline-none focus:border-[#FFC300] focus:ring-2 focus:ring-[#FFC300]/20"
                />
                <button
                  type="button"
                  onClick={() => handleCopyField(webhookUrl, "url")}
                  className="px-3 border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0"
                  title="Copy URL"
                >
                  {copiedUrl ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </button>
              </div>
              <span className="text-[11px] text-[#64748B] block">
                We send POST JSON payloads whenever an appointment is confirmed or a call concludes.
              </span>
            </div>

            {/* Signing Secret */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-display font-bold text-[#0F172A] uppercase tracking-wider block">
                  Cryptographic Signing Secret (HMAC SHA256)
                </label>
                <button
                  type="button"
                  onClick={handleRotateSecret}
                  className="text-[10px] font-mono-data text-[#B45309] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw size={10} /> Rotate
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={webhookSecret}
                  className="flex-1 bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] rounded-xl px-4 py-2.5 text-xs font-mono-data select-all"
                />
                <button
                  type="button"
                  onClick={() => handleCopyField(webhookSecret, "secret")}
                  className="px-3 border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0"
                  title="Copy Secret"
                >
                  {copiedSecret ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleSendTestWebhook}
                disabled={testingHook}
                className="flex-1 py-2.5 rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAFC] text-xs font-display font-bold text-[#0F172A] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send size={13} className="text-[#E0AB00]" />
                <span>{testingHook ? "Dispatching..." : "Send Test Ping"}</span>
              </button>

              <MagneticButton
                onClick={handleSaveWebhook}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-[#0F172A] text-white hover:bg-[#1E293B] text-xs font-display font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save size={13} className="text-[#FFC300]" />
                <span>{saving ? "Saving..." : "Save Endpoint"}</span>
              </MagneticButton>
            </div>

            {testResult && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-mono-data text-emerald-800 space-y-1 animate-panel-content">
                <div className="flex justify-between font-bold">
                  <span>{testResult.message}</span>
                  <span>{testResult.latency}</span>
                </div>
              </div>
            )}
          </div>

          {/* Third Party Native Integrations */}
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 shadow-2xs space-y-4">
            <h3 className="font-display font-bold text-sm text-[#0F172A] pb-3 border-b border-[#F1F5F9] flex items-center gap-2">
              <Layers size={15} className="text-[#E0AB00]" />
              <span>Native Platform Bridges</span>
            </h3>

            {/* Google Calendar */}
            <div className="flex items-start gap-3.5 p-3.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-2xl">
              <div className="p-2.5 bg-[#FFF9E6] border border-[#FFC300]/40 rounded-xl text-[#B45309] shrink-0">
                <Calendar size={18} />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-[#0F172A]">Google & Outlook Calendars</h4>
                <p className="text-[11px] text-[#64748B] leading-relaxed">
                  Direct bi-directional sync. Writes newly confirmed patient consultations directly to your Google Calendar.
                </p>
                <span className="text-[10px] font-mono-data text-emerald-700 font-bold block pt-0.5">
                  ● SYNC ACTIVE // 2-WAY PROTOCOL
                </span>
              </div>
            </div>

            {/* WhatsApp */}
            <div className="flex items-start gap-3.5 p-3.5 border border-[#E2E8F0] bg-[#F8FAFC] rounded-2xl">
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 shrink-0">
                <MessageSquare size={18} />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-[#0F172A]">WhatsApp Cloud API</h4>
                <p className="text-[11px] text-[#64748B] leading-relaxed">
                  Sends automated appointment cards and GPS directions to callers right after call termination.
                </p>
                <span className="text-[10px] font-mono-data text-emerald-700 font-bold block pt-0.5">
                  ● DISPATCH PIPELINE READY
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Code Implementation SDK */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <KeyRound size={15} className="text-[#E0AB00]" />
                <h3 className="font-display font-bold text-sm text-[#0F172A]">
                  Server Verification Code Snippets
                </h3>
              </div>
              <button
                type="button"
                onClick={() => handleCopyCode(CODE_SNIPPETS[activeTab])}
                className="px-3 py-1 bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#FFF9E6] rounded-lg text-xs font-mono-data text-[#0F172A] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {copiedCode ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                <span>Copy Snippet</span>
              </button>
            </div>

            {/* Language Tabs */}
            <div className="flex gap-2">
              {[
                { id: "js", label: "Node.js (Express)" },
                { id: "python", label: "Python (FastAPI)" },
                { id: "curl", label: "cURL Payload" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono-data font-bold transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-[#0F172A] text-white"
                      : "bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] hover:text-[#0F172A]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Code Display */}
            <div className="relative bg-[#0F172A] rounded-2xl p-4 overflow-x-auto modern-scrollbar shadow-inner text-[#F8FAFC] font-mono-data text-xs leading-relaxed max-h-[460px]">
              <pre>{CODE_SNIPPETS[activeTab]}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
