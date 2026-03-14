
// frontend/src/pages/AdminEvents.jsx
import { useState, useRef, useEffect } from "react";

const API = import.meta.env.VITE_API_URL ?? "";

// ─── Auth helpers ─────────────────────────────────────────────────────────────
function getToken() {
  try {
    const raw = localStorage.getItem("sb-session");
    if (raw) {
      const p = JSON.parse(raw);
      const t = p?.access_token ?? p?.session?.access_token;
      if (t) return t;
    }
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("sb-") && key.endsWith("-auth-token")) {
        const val = localStorage.getItem(key);
        if (!val) continue;
        const p = JSON.parse(val);
        const t = p?.access_token ?? p?.session?.access_token ?? p?.currentSession?.access_token;
        if (t) return t;
      }
    }
    return null;
  } catch { return null; }
}

function authHeaders(extra = {}) {
  return { Authorization: `Bearer ${getToken() ?? ""}`, ...extra };
}

async function safeJson(res) {
  const text = await res.text();
  try { return JSON.parse(text); } catch {
    throw new Error(res.ok ? "Non-JSON response." : `Server ${res.status}: ${text.slice(0, 200)}`);
  }
}

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_CFG = {
  "Upcoming":          { bg: "rgba(14,165,233,0.12)", fg: "#0ea5e9", border: "rgba(14,165,233,0.25)" },
  "Registration Open": { bg: "rgba(168,85,247,0.12)", fg: "#a855f7", border: "rgba(168,85,247,0.25)" },
  "Completed":         { bg: "rgba(16,185,129,0.12)", fg: "#10b981", border: "rgba(16,185,129,0.25)" },
};

const EMPTY_FORM = {
  title: "", subtitle: "", description: "", long_description: "",
  tag: "Finance Event", tag_color: "yellow", accent_color: "yellow",
  status: "Upcoming", prize_pool: "", format: "Team-based (2–4 members)",
  rounds: "3 Elimination Rounds", duration: "Full Day Event",
  venue: "NIT Kurukshetra", tags: "",
};

// ─── UI Atoms ─────────────────────────────────────────────────────────────────
function Badge({ status }) {
  const c = STATUS_CFG[status] ?? STATUS_CFG["Upcoming"];
  return (
    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: c.bg, color: c.fg, border: `1px solid ${c.border}` }}>
      {status}
    </span>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium" style={{ color: "#666" }}>{label}</label>}
      {children}
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <Field label={label}>
      <input {...props}
        className="px-3 py-2 rounded-lg text-sm text-white placeholder:text-[#444] focus:outline-none"
        style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
      />
    </Field>
  );
}

function Textarea({ label, ...props }) {
  return (
    <Field label={label}>
      <textarea {...props}
        className="px-3 py-2 rounded-lg text-sm text-white placeholder:text-[#444] focus:outline-none resize-none"
        style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
      />
    </Field>
  );
}

function Select({ label, children, ...props }) {
  return (
    <Field label={label}>
      <select {...props}
        className="px-3 py-2 rounded-lg text-sm text-white focus:outline-none"
        style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
      >
        {children}
      </select>
    </Field>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Fetch participant list and return count of those with a certificate
async function fetchCertCount(eventId) {
  try {
    const res  = await fetch(`${API}/api/events/${eventId}/participants`, { headers: authHeaders() });
    const data = await safeJson(res);
    if (!Array.isArray(data)) return 0;
    return data.filter(p => p.certificate_url).length;
  } catch { return 0; }
}

// ─── Create Event Modal ───────────────────────────────────────────────────────
function CreateEventModal({ onClose, onCreated }) {
  const [form, setForm]           = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");
  const imageRef                  = useRef();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  async function submit() {
    if (!form.title.trim()) return setError("Title is required.");
    setSaving(true); setError("");
    try {
      const res  = await fetch(`${API}/api/events`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          ...form,
          tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
        }),
      });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data.error ?? "Create failed.");

      if (imageFile) {
        const fd = new FormData();
        fd.append("image", imageFile);
        await fetch(`${API}/api/events/${data.id}/image`, {
          method: "POST", headers: authHeaders(), body: fd,
        });
      }
      onCreated(); onClose();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(8px)" }}
      onClick={onClose}>
      <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl p-8 space-y-5"
        style={{ background: "#0f0f0f", border: "1px solid #222" }}
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Create New Event</h2>
          <button onClick={onClose} className="text-[#555] hover:text-white text-xl">✕</button>
        </div>

        {error && (
          <p className="text-xs rounded-lg px-3 py-2"
            style={{ background: "rgba(248,113,113,0.1)", color: "#f87171", border: "1px solid rgba(248,113,113,0.2)" }}>
            {error}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Input label="Title *" value={form.title} onChange={set("title")} placeholder="e.g. BidBizz 2026" />
          </div>
          <Input label="Subtitle" value={form.subtitle} onChange={set("subtitle")} placeholder="e.g. Finance Simulation" />
          <Select label="Status" value={form.status} onChange={set("status")}>
            <option>Upcoming</option>
            <option>Registration Open</option>
            <option>Completed</option>
          </Select>
          <div className="col-span-2">
            <Textarea label="Short Description" rows={2} value={form.description} onChange={set("description")}
              placeholder="One-liner shown on the card" />
          </div>
          <div className="col-span-2">
            <Textarea label="Long Description" rows={3} value={form.long_description} onChange={set("long_description")}
              placeholder="Full detail shown in the modal" />
          </div>
          <Input label="Tag"        value={form.tag}        onChange={set("tag")}        placeholder="Finance Event" />
          <Select label="Accent Color" value={form.accent_color} onChange={set("accent_color")}>
            <option value="yellow">Yellow</option>
            <option value="purple">Purple</option>
          </Select>
          <Input label="Prize Pool" value={form.prize_pool} onChange={set("prize_pool")} placeholder="₹25,000" />
          <Input label="Format"     value={form.format}     onChange={set("format")}     placeholder="Team-based (2–4)" />
          <Input label="Rounds"     value={form.rounds}     onChange={set("rounds")}     placeholder="3 Elimination Rounds" />
          <Input label="Duration"   value={form.duration}   onChange={set("duration")}   placeholder="Full Day Event" />
          <Input label="Venue"      value={form.venue}      onChange={set("venue")}      placeholder="NIT Kurukshetra" />
          <Input label="Tags (comma-separated)" value={form.tags} onChange={set("tags")} placeholder="Finance, Strategy" />
        </div>

        <Field label="Event Image (optional)">
          <input ref={imageRef} type="file" accept="image/*" className="hidden"
            onChange={e => setImageFile(e.target.files[0])} />
          <button type="button" onClick={() => imageRef.current.click()}
            className="px-4 py-2 rounded-lg text-xs text-left font-medium"
            style={{ background: "#1a1a1a", color: "#888", border: "1px solid #2a2a2a" }}>
            {imageFile ? `📷 ${imageFile.name}` : "📷 Choose image…"}
          </button>
        </Field>

        <div className="flex gap-3 pt-2">
          <button onClick={submit} disabled={saving}
            className="flex-1 py-2.5 rounded-lg text-sm font-bold text-black disabled:opacity-60"
            style={{ background: "#facc15" }}>
            {saving ? "Creating…" : "Create Event"}
          </button>
          <button onClick={onClose}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold"
            style={{ background: "#1a1a1a", color: "#666", border: "1px solid #2a2a2a" }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Participants Side Drawer ─────────────────────────────────────────────────
function ParticipantsDrawer({ event, onClose, onCertCountChange }) {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [uploadStatus, setUploadStatus] = useState({});
  const certRef                         = useRef();
  const [certTargetId, setCertTargetId] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/api/events/${event.id}/participants`, { headers: authHeaders() });
      const data = await safeJson(res);
      const list = Array.isArray(data) ? data : [];
      setParticipants(list);
      // Notify parent of current cert count so Generate button state stays in sync
      onCertCountChange?.(list.filter(p => p.certificate_url).length);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [event.id]);

  async function manualUpload(file, pid) {
    setUploadStatus(s => ({ ...s, [pid]: "Uploading…" }));
    try {
      const fd = new FormData();
      fd.append("certificate", file);
      const res  = await fetch(`${API}/api/events/${event.id}/participants/${pid}/certificate`, {
        method: "POST", headers: authHeaders(), body: fd,
      });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data.error ?? "Upload failed.");
      setUploadStatus(s => ({ ...s, [pid]: "✅ Done" }));
      load();
    } catch (err) {
      setUploadStatus(s => ({ ...s, [pid]: `❌ ${err.message}` }));
    }
  }

  async function remove(pid) {
    if (!confirm("Remove this participant?")) return;
    await fetch(`${API}/api/events/${event.id}/participants/${pid}`, {
      method: "DELETE", headers: authHeaders(),
    });
    load();
  }

  const certCount = participants.filter(p => p.certificate_url).length;
  const total     = participants.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
      onClick={onClose}>
      <div className="h-full w-full max-w-lg flex flex-col overflow-hidden"
        style={{ background: "#0d0d0d", borderLeft: "1px solid #1f1f1f" }}
        onClick={e => e.stopPropagation()}>

        <div className="px-6 py-5 flex items-center justify-between sticky top-0 z-10"
          style={{ background: "#0d0d0d", borderBottom: "1px solid #1f1f1f" }}>
          <div>
            <h3 className="text-white font-bold text-base">{event.title}</h3>
            <p className="text-xs mt-0.5" style={{ color: "#555" }}>
              {total} participants · {certCount}/{total} certs generated
            </p>
          </div>
          <button onClick={onClose} className="text-xl" style={{ color: "#555" }}>✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {loading ? (
            <p className="text-center py-16 text-sm" style={{ color: "#444" }}>Loading…</p>
          ) : participants.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm" style={{ color: "#444" }}>No participants yet.</p>
              <p className="text-xs mt-1" style={{ color: "#333" }}>Import a CSV file to add participants.</p>
            </div>
          ) : participants.map(p => (
            <div key={p.id} className="rounded-xl p-4 flex items-start justify-between gap-3"
              style={{ background: "#111", border: "1px solid #1f1f1f" }}>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">{p.name}</p>
                <p className="text-xs mt-0.5 truncate" style={{ color: "#555" }}>
                  {p.email ?? "—"} · Roll: <span className="text-yellow-500">{p.roll_number ?? "—"}</span>
                </p>
                {p.certificate_url ? (
                  <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-xs font-medium"
                    style={{ background: "rgba(16,185,129,0.12)", color: "#10b981", border: "1px solid rgba(16,185,129,0.25)" }}>
                    ✓ Certificate generated
                  </span>
                ) : (
                  <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-xs font-medium"
                    style={{ background: "rgba(255,255,255,0.04)", color: "#555", border: "1px solid #222" }}>
                    No cert yet
                  </span>
                )}
                {uploadStatus[p.id] && (
                  <p className="text-xs mt-1"
                    style={{ color: uploadStatus[p.id].startsWith("✅") ? "#10b981" : "#f87171" }}>
                    {uploadStatus[p.id]}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1.5 items-end shrink-0">
                <button
                  onClick={() => { setCertTargetId(p.id); certRef.current.value = ""; certRef.current.click(); }}
                  className="text-xs px-2.5 py-1 rounded-lg font-medium"
                  style={{ background: "rgba(168,85,247,0.12)", color: "#a855f7", border: "1px solid rgba(168,85,247,0.25)" }}>
                  Upload cert
                </button>
                <button onClick={() => remove(p.id)}
                  className="text-xs px-2.5 py-1 rounded-lg font-medium"
                  style={{ background: "rgba(248,113,113,0.1)", color: "#f87171", border: "1px solid rgba(248,113,113,0.2)" }}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <input ref={certRef} type="file" accept="application/pdf" className="hidden"
        onChange={e => { if (e.target.files[0] && certTargetId) manualUpload(e.target.files[0], certTargetId); }} />
    </div>
  );
}

// ─── Per-Event Card ───────────────────────────────────────────────────────────
function EventCard({ event, onRefresh, onViewParticipants }) {
  const [csvStatus,  setCsvStatus]  = useState("");
  const [genStatus,  setGenStatus]  = useState("");
  const [sendStatus, setSendStatus] = useState("");
  const [generating, setGenerating] = useState(false);
  const [importing,  setImporting]  = useState(false);
  const [sending,    setSending]    = useState(false);
  const [imgBusy,    setImgBusy]    = useState(false);

  // Track whether certs have been generated for this event
  // We determine this by checking if at least one participant has a certificate_url
  const [certCount,    setCertCount]    = useState(null); // null = not yet checked
  const [totalCount,   setTotalCount]   = useState(0);
  const [certsSent,    setCertsSent]    = useState(event.certificates_sent ?? false);

  // On mount, load participant cert count to set initial Generate button state
  useEffect(() => {
    setCertsSent(event.certificates_sent ?? false);
    fetchCertCount(event.id).then(count => {
      setCertCount(count);
    });
    // Also fetch total participant count
    fetch(`${API}/api/events/${event.id}/participants`, { headers: authHeaders() })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setTotalCount(data.length); })
      .catch(() => {});
  }, [event.id, event.certificates_sent]);

  const certsGenerated = certCount !== null && certCount > 0;

  const csvRef   = useRef();
  const imageRef = useRef();

  // ── CSV import ──
  async function importCsv(file) {
    setImporting(true); setCsvStatus("Importing…");
    try {
      const fd = new FormData();
      fd.append("csv", file);
      const res  = await fetch(`${API}/api/events/${event.id}/import-participants`, {
        method: "POST", headers: authHeaders(), body: fd,
      });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data.error ?? "Import failed.");
      setCsvStatus(`✅ ${data.message}`);
      // Refresh total count
      setTotalCount(prev => prev + (data.inserted ?? 0));
      onRefresh();
    } catch (err) { setCsvStatus(`❌ ${err.message}`); }
    finally { setImporting(false); }
  }

  // ── Generate certs ──
  async function generateCerts() {
    if (certsGenerated) {
      // Already generated — ask if they want to regenerate
      if (!confirm(`Certificates already exist for ${certCount}/${totalCount} participants. Regenerate all? This will overwrite existing certificates.`)) return;
    } else {
      if (!confirm(`Generate certificates for all ${totalCount} participants of "${event.title}"?`)) return;
    }

    setGenerating(true); setGenStatus("Generating…");
    try {
      const res  = await fetch(`${API}/api/events/${event.id}/generate-certificates`, {
        method: "POST", headers: authHeaders(),
      });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data.error ?? "Generation failed.");

      const newCount = data.generated ?? 0;
      setCertCount(newCount);
      setGenStatus(
        data.failed?.length
          ? `✅ ${data.generated} generated, ${data.failed.length} failed`
          : `✅ ${data.generated} certificates generated`
      );
      onRefresh();
    } catch (err) {
      setGenStatus(`❌ ${err.message}`);
    } finally {
      setGenerating(false);
    }
  }

  // ── Send / Revoke certs ──
  async function toggleSend() {
    if (!certsGenerated && !certsSent) {
      alert("Generate certificates first before sending.");
      return;
    }

    const confirmMsg = certsSent
      ? `Hide certificates from participants of "${event.title}"?`
      : `Release ${certCount} certificates to participants of "${event.title}"? Students with matching roll numbers can download their PDFs immediately.`;

    if (!confirm(confirmMsg)) return;

    setSending(true); setSendStatus(certsSent ? "Revoking…" : "Sending…");
    try {
      const endpoint = certsSent
        ? `${API}/api/events/${event.id}/revoke-certificates`
        : `${API}/api/events/${event.id}/send-certificates`;

      const res  = await fetch(endpoint, { method: "POST", headers: authHeaders() });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data.error ?? "Failed.");

      const nowSent = !certsSent;
      setCertsSent(nowSent);
      setSendStatus(nowSent
        ? `✅ ${data.message}`
        : `✅ Certificates hidden from participants.`
      );
      onRefresh();
    } catch (err) { setSendStatus(`❌ ${err.message}`); }
    finally { setSending(false); }
  }

  // ── Replace image ──
  async function replaceImage(file) {
    setImgBusy(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch(`${API}/api/events/${event.id}/image`, {
        method: "POST", headers: authHeaders(), body: fd,
      });
      if (!res.ok) { const d = await safeJson(res); throw new Error(d.error); }
      onRefresh();
    } catch (err) { alert(err.message); }
    finally { setImgBusy(false); }
  }

  // ── Delete event ──
  async function deleteEvent() {
    if (!confirm(`Permanently delete "${event.title}"?`)) return;
    const res = await fetch(`${API}/api/events/${event.id}`, {
      method: "DELETE", headers: authHeaders(),
    });
    if (res.ok) onRefresh();
    else { const d = await safeJson(res); alert(d.error); }
  }

  const fallbackImg = "https://images.unsplash.com/photo-1552664730-d307ca884978?w=700&q=80";

  // ── Generate button appearance ──
  const genBtnStyle = certsGenerated
    ? { background: "rgba(16,185,129,0.12)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)" }
    : { background: "rgba(168,85,247,0.12)", color: "#a855f7", border: "1px solid rgba(168,85,247,0.25)" };

  const genBtnLabel = generating
    ? "⏳ Generating…"
    : certsGenerated
      ? `✅ Generated (${certCount}/${totalCount}) — Regenerate?`
      : "🎓 Generate Certificates";

  // ── Send button appearance ──
  const sendBtnStyle = certsSent
    ? { background: "rgba(248,113,113,0.12)", color: "#f87171", border: "1px solid rgba(248,113,113,0.3)" }
    : certsGenerated
      ? { background: "rgba(16,185,129,0.15)", color: "#10b981", border: "1px solid rgba(16,185,129,0.4)", boxShadow: "0 0 12px rgba(16,185,129,0.1)" }
      : { background: "rgba(255,255,255,0.04)", color: "#555", border: "1px solid #222" };

  const sendBtnLabel = sending
    ? (certsSent ? "⏳ Revoking…" : "⏳ Sending…")
    : certsSent
      ? "🔒 Revoke Certificates"
      : certsGenerated
        ? "📤 Send Certificates to Participants"
        : "📤 Send Certificates (generate first)";

  return (
    <div className="rounded-2xl overflow-hidden flex flex-col"
      style={{ background: "#111", border: "1px solid #1f1f1f" }}>

      {/* Thumbnail */}
      <div className="relative h-40 overflow-hidden shrink-0">
        <img src={event.image_url ?? fallbackImg} alt={event.title}
          className="w-full h-full object-cover" />
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to top, #111 0%, transparent 55%)" }} />
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <Badge status={event.status} />
          {certsSent && (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
              style={{ background: "rgba(16,185,129,0.2)", color: "#10b981", border: "1px solid rgba(16,185,129,0.4)" }}>
              📤 Certs Released
            </span>
          )}
        </div>
        <button
          onClick={() => { imageRef.current.value = ""; imageRef.current.click(); }}
          disabled={imgBusy}
          className="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-xs font-medium disabled:opacity-50"
          style={{ background: "rgba(0,0,0,0.75)", color: "#aaa", border: "1px solid #333" }}>
          {imgBusy ? "…" : "🖼 Replace"}
        </button>
        <input ref={imageRef} type="file" accept="image/*" className="hidden"
          onChange={e => replaceImage(e.target.files[0])} />
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col gap-4 flex-1">
        <div>
          <h3 className="text-white font-bold text-base leading-tight">{event.title}</h3>
          {event.subtitle && <p className="text-xs mt-0.5" style={{ color: "#666" }}>{event.subtitle}</p>}
          {event.description && (
            <p className="text-xs mt-2 line-clamp-2" style={{ color: "#555" }}>{event.description}</p>
          )}
          {event.venue && (
            <p className="text-xs mt-1" style={{ color: "#444" }}>📍 {event.venue}</p>
          )}
        </div>

        {/* Participant / cert counts */}
        {totalCount > 0 && (
          <div className="flex gap-2">
            <span className="px-2 py-0.5 rounded text-xs font-medium"
              style={{ background: "rgba(14,165,233,0.1)", color: "#0ea5e9", border: "1px solid rgba(14,165,233,0.2)" }}>
              👥 {totalCount} participants
            </span>
            {certCount !== null && certCount > 0 && (
              <span className="px-2 py-0.5 rounded text-xs font-medium"
                style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>
                🎓 {certCount} certs ready
              </span>
            )}
          </div>
        )}

        {/* Prize / format */}
        {(event.prize_pool || event.format) && (
          <div className="flex flex-wrap gap-1.5">
            {event.prize_pool && (
              <span className="px-2 py-0.5 rounded text-xs font-medium"
                style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)" }}>
                🏆 {event.prize_pool}
              </span>
            )}
            {event.format && (
              <span className="px-2 py-0.5 rounded text-xs font-medium"
                style={{ background: "rgba(14,165,233,0.12)", color: "#0ea5e9", border: "1px solid rgba(14,165,233,0.2)" }}>
                {event.format}
              </span>
            )}
          </div>
        )}

        {/* ── Action buttons ── */}
        <div className="space-y-2 mt-auto">

          {/* 1. Import CSV */}
          <div>
            <input ref={csvRef} type="file" accept=".csv" className="hidden"
              onChange={e => { if (e.target.files[0]) importCsv(e.target.files[0]); }} />
            <button
              onClick={() => { csvRef.current.value = ""; csvRef.current.click(); }}
              disabled={importing}
              className="w-full py-2 px-4 rounded-lg text-xs font-semibold disabled:opacity-40"
              style={{ background: "rgba(14,165,233,0.12)", color: "#0ea5e9", border: "1px solid rgba(14,165,233,0.25)" }}>
              {importing ? "⏳ Importing…" : "📂 Import Participants CSV"}
            </button>
            {csvStatus && (
              <p className="text-xs mt-1 px-1"
                style={{ color: csvStatus.startsWith("✅") ? "#10b981" : "#f87171" }}>
                {csvStatus}
              </p>
            )}
          </div>

          {/* 2. Generate Certificates — changes appearance after generation */}
          <div>
            <button
              onClick={generateCerts}
              disabled={generating}
              className="w-full py-2 px-4 rounded-lg text-xs font-semibold disabled:opacity-40 transition-all"
              style={genBtnStyle}>
              {genBtnLabel}
            </button>
            {genStatus && (
              <p className="text-xs mt-1 px-1"
                style={{ color: genStatus.startsWith("✅") ? "#10b981" : "#f87171" }}>
                {genStatus}
              </p>
            )}
          </div>

          {/* 3. Send / Revoke — locked (grey) until certs are generated */}
          <div>
            <button
              onClick={toggleSend}
              disabled={sending || (!certsGenerated && !certsSent)}
              className="w-full py-2 px-4 rounded-lg text-xs font-bold disabled:opacity-40 transition-all"
              style={sendBtnStyle}>
              {sendBtnLabel}
            </button>
            {sendStatus && (
              <p className="text-xs mt-1 px-1"
                style={{ color: sendStatus.startsWith("✅") ? "#10b981" : "#f87171" }}>
                {sendStatus}
              </p>
            )}
          </div>

          {/* 4. View Participants */}
          <button
            onClick={() => onViewParticipants(event)}
            className="w-full py-2 px-4 rounded-lg text-xs font-semibold"
            style={{ background: "rgba(56,189,248,0.1)", color: "#38bdf8", border: "1px solid rgba(56,189,248,0.2)" }}>
            👥 View / Manage Participants
          </button>

          {/* 5. Delete */}
          <button
            onClick={deleteEvent}
            className="w-full py-2 px-4 rounded-lg text-xs font-semibold"
            style={{ background: "rgba(248,113,113,0.08)", color: "#f87171", border: "1px solid rgba(248,113,113,0.15)" }}>
            🗑 Delete Event
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminEvents() {
  const [events,      setEvents]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showCreate,  setShowCreate]  = useState(false);
  const [drawerEvent, setDrawerEvent] = useState(null);

  async function fetchEvents() {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/api/events`);
      const data = await safeJson(res);
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchEvents(); }, []);

  return (
    <div className="p-8 min-h-screen" style={{ background: "#0d0d0d" }}>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Event Management</h1>
          <p className="text-sm mt-1" style={{ color: "#555" }}>
            {events.length} events · manage participants & certificates
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-black"
          style={{ background: "#facc15" }}>
          + New Event
        </button>
      </div>

      {/* Workflow banner */}
      <div className="mb-6 rounded-xl p-4 text-xs space-y-1"
        style={{ background: "#111", border: "1px solid #1f1f1f", color: "#555" }}>
        <p>
          <span className="font-semibold" style={{ color: "#aaa" }}>Certificate workflow: </span>
          <span className="text-blue-400">1. Import CSV</span>
          {" → "}
          <span className="text-purple-400">2. Generate Certificates</span>
          {" → "}
          <span className="text-emerald-400">3. Send Certificates</span>
          {" → "}
          <span style={{ color: "#555" }}>Students download from Events page</span>
        </p>
        <p>
          <span className="font-semibold" style={{ color: "#aaa" }}>CSV columns: </span>
          <code className="text-yellow-400">name</code>,{" "}
          <code className="text-yellow-400">roll_number</code>,{" "}
          <code className="text-yellow-400">email</code>{" "}
          <span>(email optional)</span>
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-24 text-sm" style={{ color: "#444" }}>Loading events…</div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <p className="text-sm" style={{ color: "#444" }}>No events yet.</p>
          <button onClick={() => setShowCreate(true)}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-black"
            style={{ background: "#facc15" }}>
            Create your first event
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {events.map(event => (
            <EventCard
              key={event.id}
              event={event}
              onRefresh={fetchEvents}
              onViewParticipants={setDrawerEvent}
            />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateEventModal onClose={() => setShowCreate(false)} onCreated={fetchEvents} />
      )}

      {drawerEvent && (
        <ParticipantsDrawer
          event={drawerEvent}
          onClose={() => setDrawerEvent(null)}
          onCertCountChange={(count) => {
            // Keep cert count in sync when drawer is open
          }}
        />
      )}
    </div>
  );
}
