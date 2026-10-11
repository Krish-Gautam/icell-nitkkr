import { useEffect, useRef, useState } from "react";
import { Edit2, Plus, Save, Trash2, Upload, X } from "lucide-react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import api from "../../services/api";
import { useAuth } from "../../hooks/useAuth";

const emptyField = { id: "name", label: "Name", x: 100, y: 100, maxWidth: 0, fontSize: 48, fontFamily: "Arial", fontWeight: "normal", fontStyle: "normal", color: "#000000", alignment: "center" };

export default function AdminCertificateTemplates() {
  const { user, loading: authLoading } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [background, setBackground] = useState(null);
  const [fields, setFields] = useState([]);
  const [canvasSize, setCanvasSize] = useState({ width: 1600, height: 1200 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const imageRef = useRef(null);

  const load = async () => setTemplates((await api.get("/certificate-templates")).data.templates || []);
  useEffect(() => { load().catch(() => setError("Could not load templates")); }, []);
  useEffect(() => { if (!authLoading && user?.role !== "admin") window.location.replace("/"); }, [authLoading, user]);

  const startCreate = () => { setEditing(null); setName(""); setBackground(null); setFields([]); setCanvasSize({ width: 1600, height: 1200 }); setError(""); };
  const startEdit = (template) => { setEditing(template); setName(template.name); setBackground(null); setFields(template.fields || []); setCanvasSize({ width: template.canvas_width, height: template.canvas_height }); setError(""); };
  const selectBackground = (file) => {
    setBackground(file || null);
    if (!file) return;
    const image = new Image();
    image.onload = () => setCanvasSize({ width: image.naturalWidth, height: image.naturalHeight });
    image.src = URL.createObjectURL(file);
  };
  const updateField = (index, patch) => setFields((current) => current.map((field, fieldIndex) => fieldIndex === index ? { ...field, ...patch } : field));
  const moveField = (event, index) => {
    const image = imageRef.current;
    if (!image) return;
    const bounds = image.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * canvasSize.width;
    const y = ((event.clientY - bounds.top) / bounds.height) * canvasSize.height;
    updateField(index, {
      x: Math.round(Math.min(canvasSize.width, Math.max(0, x))),
      y: Math.round(Math.min(canvasSize.height, Math.max(0, y))),
    });
  };
  const startMovingField = (event, index) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    moveField(event, index);
  };
  const addField = () => setFields((current) => [...current, { ...emptyField, id: `field_${current.length + 1}`, label: `Field ${current.length + 1}` }]);

  const save = async () => {
    if (!name.trim() || (!editing && !background)) { setError("Name and a PNG/JPEG design are required"); return; }
    setSaving(true); setError("");
    try {
      const form = new FormData(); form.append("name", name.trim()); form.append("fields", JSON.stringify(fields));
      if (background) form.append("background", background);
      const response = editing ? await api.patch(`/certificate-templates/${editing._id}`, form, { headers: { "Content-Type": "multipart/form-data" } }) : await api.post("/certificate-templates", form, { headers: { "Content-Type": "multipart/form-data" } });
      setTemplates((current) => editing ? current.map((item) => item._id === editing._id ? response.data.template : item) : [response.data.template, ...current]);
      startCreate();
    } catch (requestError) { setError(requestError.response?.data?.error || "Could not save template"); }
    finally { setSaving(false); }
  };

  const remove = async (id) => { if (!window.confirm("Delete this template?")) return; await api.delete(`/certificate-templates/${id}`); setTemplates((current) => current.filter((item) => item._id !== id)); };
  const previewWidth = imageRef.current?.clientWidth || 800;
  const scale = previewWidth / canvasSize.width;

  return <div className="flex h-screen overflow-hidden bg-[#0d0d0d] text-white"><AdminSidebar /><main className="min-w-0 flex-1 overflow-y-auto p-6 md:p-8 max-md:pt-20">
    <div className="flex items-center justify-between mb-8"><div><h1 className="text-3xl font-bold">Certificate Templates</h1><p className="text-[#777] mt-1">Admin-managed designs and dynamic fields</p></div><button onClick={startCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#f59e0b] text-black font-semibold"><Plus size={18} /> New template</button></div>
    <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-6">
      <section className="space-y-3">{templates.map((template) => <article key={template._id} className="rounded-xl border border-[#252525] bg-[#111] p-4"><h2 className="font-semibold">{template.name}</h2><p className="text-xs text-[#777] mt-1">{template.canvas_width} x {template.canvas_height} · {(template.fields || []).length} fields</p><div className="flex gap-2 mt-4"><button onClick={() => startEdit(template)} className="flex items-center gap-1 text-sm text-[#fbbf24]"><Edit2 size={14} /> Edit</button><button onClick={() => remove(template._id)} className="flex items-center gap-1 text-sm text-red-400"><Trash2 size={14} /> Delete</button></div></article>)}{!templates.length && <p className="text-[#777]">No templates yet.</p>}</section>
      <section className="rounded-xl border border-[#252525] bg-[#111] p-5"><div className="flex justify-between items-center mb-5"><h2 className="text-xl font-semibold">{editing ? "Edit template" : "Create template"}</h2>{editing && <button onClick={startCreate}><X /></button>}</div><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Template name" className="w-full mb-4 rounded-lg bg-[#0d0d0d] border border-[#2a2a2a] px-3 py-2" /><label className="flex items-center gap-2 w-fit cursor-pointer text-sm text-[#fbbf24] mb-4"><Upload size={17} /> {background ? background.name : editing ? "Replace design (optional)" : "Upload PNG/JPEG design"}<input type="file" accept="image/png,image/jpeg" className="hidden" onChange={(event) => selectBackground(event.target.files?.[0])} /></label>
        {(editing?.background_url || background) && <div className="relative border border-[#2a2a2a] bg-white overflow-hidden"><img ref={imageRef} src={background ? URL.createObjectURL(background) : editing.background_url} alt="Certificate design" className="block w-full" />{fields.map((field, index) => <div key={field.id} role="button" tabIndex={0} onPointerDown={(event) => startMovingField(event, index)} onPointerMove={(event) => event.currentTarget.hasPointerCapture(event.pointerId) && moveField(event, index)} onPointerUp={(event) => event.currentTarget.releasePointerCapture(event.pointerId)} onPointerCancel={(event) => event.currentTarget.releasePointerCapture(event.pointerId)} className="absolute border border-red-500 bg-white/70 text-red-600 text-xs cursor-move select-none touch-none" style={{ left: `${field.x * scale}px`, top: `${field.y * scale}px`, fontSize: `${Math.max(8, field.fontSize * scale)}px`, transform: "translateY(-100%)" }}>{`{{${field.id}}}`}</div>)}</div>}
        {(editing?.background_url || background) && <p className="mt-2 text-xs text-[#777]">Drag a field label on the design to position it.</p>}<div className="flex items-center justify-between mt-5"><div><h3 className="font-semibold">Dynamic fields</h3><p className="text-xs text-[#777] mt-1">{fields.length} field{fields.length === 1 ? "" : "s"} · Edit the field key below, then drag its label above.</p></div><button onClick={addField} className="flex items-center gap-1 rounded-lg border border-[#fbbf24]/40 px-3 py-2 text-sm text-[#fbbf24] hover:bg-[#fbbf24]/10"><Plus size={15} /> Add field</button></div><div className="space-y-3 mt-3">{fields.map((field, index) => <div key={`field-${index}`} className="rounded-lg border border-[#252525] bg-[#0d0d0d] p-4"><div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.7fr_0.8fr_auto] gap-3 items-end"><label className="block text-xs text-[#999]">Field key<input value={field.id} onChange={(event) => updateField(index, { id: event.target.value.replace(/[^a-zA-Z0-9_-]/g, "_") })} placeholder="student_name" className="mt-1 w-full rounded-md border border-[#2a2a2a] bg-[#111] p-2 text-sm text-white outline-none focus:border-[#fbbf24]" /></label><label className="block text-xs text-[#999]">Font size<input type="number" min="1" max="300" value={field.fontSize} onChange={(event) => updateField(index, { fontSize: Number(event.target.value) })} className="mt-1 w-full rounded-md border border-[#2a2a2a] bg-[#111] p-2 text-sm text-white outline-none focus:border-[#fbbf24]" /></label><label className="block text-xs text-[#999]">Alignment<select value={field.alignment} onChange={(event) => updateField(index, { alignment: event.target.value })} className="mt-1 w-full rounded-md border border-[#2a2a2a] bg-[#111] p-2 text-sm text-white outline-none focus:border-[#fbbf24]"><option>left</option><option>center</option><option>right</option></select></label><button aria-label={`Remove ${field.label || field.id}`} onClick={() => setFields((current) => current.filter((_, fieldIndex) => fieldIndex !== index))} className="h-10 rounded-md border border-red-500/30 px-3 text-sm text-red-400 hover:bg-red-500/10">Remove</button></div><div className="mt-3 flex items-center gap-3 border-t border-[#252525] pt-3"><label className="flex items-center gap-2 text-xs text-[#999]">Text color<input type="color" value={field.color} onChange={(event) => updateField(index, { color: event.target.value })} className="h-7 w-9 cursor-pointer rounded bg-transparent" /></label><span className="text-xs text-[#666]">Position: {Math.round(field.x)}, {Math.round(field.y)}</span></div></div>)}</div>{error && <p className="text-red-400 text-sm mt-4">{error}</p>}<button onClick={save} disabled={saving} className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#f59e0b] text-black font-semibold disabled:opacity-50"><Save size={17} /> {saving ? "Saving..." : "Save template"}</button>
      </section></div>
  </main></div>;
}
