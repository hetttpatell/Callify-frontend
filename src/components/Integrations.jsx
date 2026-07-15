import { useState } from 'react';
import { Terminal, Copy, Check, Calendar, Database, GitMerge, Link, AlertTriangle } from 'lucide-react';
import gsap from 'gsap';

export default function Integrations() {
  const [activeTab, setActiveTab] = useState('js');
  const [webhookUrl, setWebhookUrl] = useState('https://api.yourcompany.com/webhooks/callify');
  const webhookSecret = 'whsec_b2a1a8c9e0d4f3b2a1a8c9e0d4f3';
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const handleCopyCode = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyField = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'url') {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  const CODE_SNIPPETS = {
    js: `// Node.js Express Webhook Handler
app.post('/webhooks/callify', (req, res) => {
  const signature = req.headers['x-callify-signature'];
  const event = req.body;

  // 1. Verify cryptographic hook signature
  if (!verifySignature(event, signature, process.env.CALLIFY_WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature signature');
  }

  // 2. Process routing outcome
  switch (event.type) {
    case 'call.completed':
      const { caller, transcript, outcome } = event.data;
      console.log(\`Processed call from \${caller}. Outcome: \${outcome}\`);
      break;
    
    case 'appointment.booked':
      const { service, date, time } = event.data;
      // Sync with internal databases
      break;
  }

  res.status(200).json({ received: true });
});`,
    python: `# Python Flask Webhook Handler
from flask import Flask, request, jsonify
import hmac, hashlib

app = Flask(__name__)

@app.route('/webhooks/callify', methods=['POST'])
def callify_webhook():
    signature = request.headers.get('X-Callify-Signature')
    payload = request.data
    
    # Verify cryptographic signature
    expected = hmac.new(
        key=bytes(WEBHOOK_SECRET, 'utf-8'),
        msg=payload,
        digestmod=hashlib.sha256
    ).hexdigest()
    
    if not hmac.compare_digest(expected, signature):
        return 'Unauthorized signature', 401
        
    event = request.json
    if event['type'] == 'appointment.booked':
        print(f"Syncing booking service: {event['data']['service']}")
        
    return jsonify(success=True), 200`,
    curl: `# cURL Simulated Webhook Delivery
curl -X POST https://api.yourcompany.com/webhooks/callify \\
  -H "Content-Type: application/json" \\
  -H "X-Callify-Signature: 513ba4654fc422cfc304ef855a" \\
  -d '{
    "id": "evt_9402",
    "type": "appointment.booked",
    "created": 1783744757,
    "data": {
      "caller": "+14155550192",
      "service": "consultation",
      "date": "2026-07-21",
      "time": "15:00",
      "outcome": "SUCCESS // CALENDAR_UPDATED"
    }
  }'`
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-white/5">
        <h2 className="text-xl font-serif-display text-text-primary">API & Integrations Hub</h2>
        <p className="text-xs text-text-muted font-sans-ui mt-0.5">
          Redirect operational wire events directly to your customer records databases and calendars.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Webhook Settings & Specs */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Webhook Configuration */}
          <div className="bg-surface-card border border-white/10 rounded-2xl p-6 shadow-xl space-y-5">
            <h3 className="text-xs font-mono-data uppercase text-text-muted tracking-wider pb-2 border-b border-white/5 flex items-center gap-1.5">
              <Link className="w-3.5 h-3.5 text-accent-yellow" /> Webhook Wire Redirect
            </h3>

            {/* Target URL */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-mono-data text-text-muted uppercase tracking-wider block">TARGET ENDPOINT URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono-data text-text-primary focus:outline-none focus:border-accent-yellow/50"
                />
                <button
                  type="button"
                  onClick={() => handleCopyField(webhookUrl, 'url')}
                  className="px-3 border border-white/10 text-text-primary bg-black/40 hover:bg-white/5 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0"
                >
                  {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-text-muted" />}
                </button>
              </div>
            </div>

            {/* Webhook Signing Secret */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-mono-data text-text-muted uppercase tracking-wider block">SIGNING SECRET KEY</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={webhookSecret}
                  className="flex-1 bg-black/25 border border-white/5 text-text-muted rounded-xl px-4 py-2.5 text-xs font-mono-data focus:outline-none select-all"
                />
                <button
                  type="button"
                  onClick={() => handleCopyField(webhookSecret, 'secret')}
                  className="px-3 border border-white/10 text-text-primary bg-black/40 hover:bg-white/5 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0"
                >
                  {copiedSecret ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-text-muted" />}
                </button>
              </div>
              <span className="text-[8px] font-mono-data text-text-muted/40 block leading-normal">
                HMAC SHA256 security key used to cryptographically sign all outgoing payloads.
              </span>
            </div>
            
            <button
              onClick={() => {
                gsap.fromTo('#webhook-save-toast',
                  { opacity: 0, y: 10 },
                  { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', yoyo: true, repeat: 1, repeatDelay: 1.5 }
                );
              }}
              className="w-full bg-black/40 border border-white/10 hover:border-white/20 text-text-primary font-mono-data text-[10px] font-bold uppercase tracking-wider py-3 rounded-xl transition-all cursor-pointer text-center"
            >
              SAVE WIRE ROUTING
            </button>
            <div id="webhook-save-toast" className="opacity-0 text-[9px] font-mono-data text-emerald-400 text-center select-none">
              SAVED: Webhook configuration updated on trunk node.
            </div>
          </div>

          {/* Third Party Integrations */}
          <div className="bg-surface-card border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-xs font-mono-data uppercase text-text-muted tracking-wider pb-2 border-b border-white/5 flex items-center gap-1.5">
              <GitMerge className="w-3.5 h-3.5 text-accent-yellow" /> Administrative Platforms
            </h3>

            {/* Google Calendar */}
            <div className="flex items-start gap-4 p-3 border border-white/5 bg-black/20 rounded-xl">
              <div className="p-2.5 bg-accent-yellow/5 border border-accent-yellow/10 rounded-lg text-accent-yellow shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-text-primary">Google / Outlook Calendars</h4>
                <p className="text-[10px] text-text-muted leading-relaxed font-sans-ui">
                  Auto-sync appointments scheduled by Callify. Our co-processor checks for conflict slots and writes confirmed bookings directly to your business calendar.
                </p>
                <span className="text-[8px] font-mono-data text-emerald-400 font-bold block pt-1">STATUS: COMPATIBLE // SECURE SETUP ACTIVE</span>
              </div>
            </div>

            {/* CRMs */}
            <div className="flex items-start gap-4 p-3 border border-white/5 bg-black/20 rounded-xl">
              <div className="p-2.5 bg-accent-yellow/5 border border-accent-yellow/10 rounded-lg text-accent-yellow shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-text-primary">HubSpot & Salesforce Pipelines</h4>
                <p className="text-[10px] text-text-muted leading-relaxed font-sans-ui">
                  Push resolved support tickets, VIP caller metadata, and interaction costs back to your core CRM pipeline leads automatically.
                </p>
                <span className="text-[8px] font-mono-data text-accent-yellow font-bold block pt-1">STATUS: BETA // DEVELOPER CONNECTOR AVAILABLE</span>
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: Code Snippets Console */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-surface-card border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col h-full justify-between min-h-[420px]">
            
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <h3 className="text-xs font-mono-data uppercase text-text-muted tracking-wider flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-accent-yellow" /> Webhook Express Payloads
                </h3>
                <span className="text-[9px] font-mono-data text-text-muted/40 uppercase">JSON wire format</span>
              </div>

              {/* Code Snippet Tabs */}
              <div className="flex border-b border-white/5 font-mono-data text-[10px]">
                {['js', 'python', 'curl'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveTab(lang)}
                    className={`px-4 py-2 border-b-2 transition-all uppercase tracking-wider cursor-pointer ${
                      activeTab === lang
                        ? 'border-accent-yellow text-accent-yellow font-bold'
                        : 'border-transparent text-text-muted hover:text-text-primary'
                    }`}
                  >
                    {lang === 'js' ? 'NodeJS' : lang === 'python' ? 'Python' : 'cURL'}
                  </button>
                ))}
              </div>

              {/* Code Block Container */}
              <div className="relative">
                <pre className="bg-black/50 border border-white/5 rounded-xl p-4 font-mono-data text-[10px] text-text-primary overflow-x-auto modern-scrollbar h-72 leading-normal">
                  <code>{CODE_SNIPPETS[activeTab]}</code>
                </pre>
                
                {/* Copy button */}
                <button
                  type="button"
                  onClick={() => handleCopyCode(CODE_SNIPPETS[activeTab])}
                  className="absolute top-3 right-3 p-1.5 border border-white/10 text-text-primary bg-black/60 hover:bg-white/5 rounded-lg transition-all cursor-pointer"
                  title="Copy Code"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-text-muted" />}
                </button>
              </div>
            </div>

            {/* Warning banner */}
            <div className="mt-4 p-3 bg-amber-500/5 border border-amber-500/15 rounded-xl flex items-start gap-2.5 text-amber-400 font-mono-data text-[9px] leading-relaxed">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <strong>HMAC ENFORCEMENT:</strong> Secure verification requires signature matching. Payloads are delivered with the header <code>X-Callify-Signature</code>. Ensure you calculate the SHA256 hash using the secret before processing appointments.
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
