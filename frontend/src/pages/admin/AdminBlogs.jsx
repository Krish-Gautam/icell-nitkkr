


import { useState, useEffect } from "react";

const categories = ["All", "Finance", "Technology", "Startup", "Design", "Cyber Security"];
const statuses   = ["All", "Pending", "Approved", "Rejected"];

const statusStyle = {
  pending:  { bg: "rgba(245,158,11,0.12)",  color: "#f59e0b", label: "Pending"  },
  approved: { bg: "rgba(16,185,129,0.12)",  color: "#10b981", label: "Approved" },
  rejected: { bg: "rgba(239,68,68,0.12)",   color: "#ef4444", label: "Rejected" },
};

function BlogContent({ content }) {
  if (!content) return null;
  return (
    <div style={{ color: "#aaa", fontSize: "14px", lineHeight: 1.9 }}>
      {content.split("\n").map((line, i) => {
        if (line.startsWith("## ")) return <h2 key={i} style={{ color: "#fff", fontSize: "16px", fontWeight: 700, margin: "20px 0 8px", fontFamily: "'Space Grotesk', sans-serif" }}>{line.replace("## ", "")}</h2>;
        if (line.startsWith("# "))  return <h1 key={i} style={{ color: "#fff", fontSize: "20px", fontWeight: 700, margin: "24px 0 10px", fontFamily: "'Space Grotesk', sans-serif" }}>{line.replace("# ", "")}</h1>;
        if (line.startsWith("### ")) return <h3 key={i} style={{ color: "#ddd", fontSize: "14px", fontWeight: 600, margin: "16px 0 6px" }}>{line.replace("### ", "")}</h3>;
        if (line.startsWith("**") && line.endsWith("**")) return <p key={i} style={{ color: "#ccc", fontWeight: 600, margin: "8px 0 4px" }}>{line.replace(/\*\*/g, "")}</p>;
        if (line.startsWith("- ")) return <div key={i} style={{ display: "flex", gap: "8px", margin: "3px 0", paddingLeft: "8px" }}><span style={{ color: "#6366f1", flexShrink: 0 }}>•</span><span>{line.replace("- ", "")}</span></div>;
        if (line.trim() === "") return <div key={i} style={{ height: "6px" }} />;
        return <p key={i} style={{ margin: "4px 0" }}>{line}</p>;
      })}
    </div>
  );
}

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);



useEffect(() => {
  const fetchBlogs = async () => {
    try {
      const token = localStorage.getItem("access_token")

      // ✅ Temporarily add this debug line
      console.log("Token exists:", !!token)
      console.log("Token preview:", token?.slice(0, 20))

      const res = await fetch("http://localhost:5000/api/blogs/admin/all", {
        headers: { Authorization: `Bearer ${token}` },
      })

      // ✅ Add this to see the actual error message
      if (!res.ok) {
        const err = await res.json()
        console.error("Admin fetch failed:", err)
        setLoading(false)
        return
      }

      const data = await res.json()
      setBlogs(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Failed to fetch blogs:", err)
    } finally {
      setLoading(false)
    }
  }
  fetchBlogs()
}, [])



  // ── Fetch all blogs (admin view) ──────────────────────────────────────────
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch("http://localhost:5000/api/blogs/admin/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setBlogs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch blogs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  // ── Update status via API ─────────────────────────────────────────────────
  const updateStatus = async (id, newStatus) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`http://localhost:5000/api/blogs/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Update failed");

      // Optimistically update local state
      setBlogs(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
      if (preview?.id === id) setPreview(p => ({ ...p, status: newStatus }));
    } catch (err) {
      alert("Failed to update status: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = blogs.filter(b => {
    const matchStatus   = filterStatus   === "All" || b.status   === filterStatus.toLowerCase();
    const matchCat      = filterCategory === "All" || b.category === filterCategory;
    const matchSearch   = b.title?.toLowerCase().includes(search.toLowerCase()) ||
                          b.author?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchCat && matchSearch;
  });

  const stats = [
    { label: "Total",    value: blogs.length,                                      color: "#a855f7" },
    { label: "Pending",  value: blogs.filter(b => b.status === "pending").length,  color: "#f59e0b" },
    { label: "Approved", value: blogs.filter(b => b.status === "approved").length, color: "#10b981" },
    { label: "Rejected", value: blogs.filter(b => b.status === "rejected").length, color: "#ef4444" },
  ];

  return (
    <div style={{ padding: "32px", minHeight: "100vh", background: "#0d0d0d", fontFamily: "'Space Grotesk', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: 700, color: "#fff", margin: 0 }}>Blog Management</h1>
        <p style={{ color: "#555", fontSize: "13px", marginTop: "4px" }}>Review and approve blog submissions from society members</p>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
        {stats.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", borderRadius: "10px", background: "#111", border: "1px solid #1f1f1f" }}>
            <span style={{ fontSize: "20px", fontWeight: 700, color: s.color }}>{s.value}</span>
            <span style={{ color: "#666", fontSize: "13px" }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "24px" }}>
        <input type="text" placeholder="Search blogs..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: "1", minWidth: "180px", padding: "8px 14px", borderRadius: "10px", background: "#111", border: "1px solid #1f1f1f", color: "#fff", fontSize: "13px", outline: "none", fontFamily: "'Space Grotesk', sans-serif" }} />
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {statuses.map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: "8px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 500, cursor: "pointer", transition: "all 0.2s", fontFamily: "'Space Grotesk', sans-serif", background: filterStatus === s ? "rgba(168,85,247,0.15)" : "#111", color: filterStatus === s ? "#a855f7" : "#666", border: `1px solid ${filterStatus === s ? "rgba(168,85,247,0.3)" : "#1f1f1f"}` }}>{s}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {categories.map(c => (
            <button key={c} onClick={() => setFilterCategory(c)} style={{ padding: "8px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 500, cursor: "pointer", transition: "all 0.2s", fontFamily: "'Space Grotesk', sans-serif", background: filterCategory === c ? "rgba(99,102,241,0.15)" : "#111", color: filterCategory === c ? "#6366f1" : "#666", border: `1px solid ${filterCategory === c ? "rgba(99,102,241,0.3)" : "#1f1f1f"}` }}>{c}</button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && <p style={{ color: "#555", textAlign: "center", paddingTop: "60px" }}>Loading blogs…</p>}

      {/* Blog Cards */}
      {!loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
          {filtered.map(blog => {
            const st = statusStyle[blog.status] || statusStyle.pending;
            return (
              <div key={blog.id} onClick={() => setPreview(blog)} style={{ background: "#111", borderRadius: "14px", border: "1px solid #1f1f1f", overflow: "hidden", cursor: "pointer", transition: "border-color 0.2s, transform 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#2a2a2a"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#1f1f1f"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                {/* Image — handle base64 or URL */}
                <div style={{ position: "relative" }}>
                  {blog.image ? (
                    <img src={blog.image} alt={blog.title} style={{ width: "100%", height: "140px", objectFit: "cover", display: "block" }} />
                  ) : (
                    <div style={{ width: "100%", height: "140px", background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px" }}>📝</div>
                  )}
                </div>
                <div style={{ padding: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "999px", background: "rgba(99,102,241,0.12)", color: "#6366f1" }}>{blog.category}</span>
                    <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "999px", fontWeight: 600, background: st.bg, color: st.color }}>{st.label}</span>
                  </div>
                  <h3 style={{ color: "#fff", fontSize: "14px", fontWeight: 600, margin: "0 0 4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{blog.title}</h3>
                  <p style={{ color: "#555", fontSize: "12px", margin: "0 0 6px" }}>by {blog.author} · {blog.date}</p>
                  <p style={{ color: "#666", fontSize: "12px", margin: "0 0 14px", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{blog.description}</p>
                  <div style={{ display: "flex", gap: "6px" }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => setPreview(blog)} style={{ flex: 1, padding: "7px 0", borderRadius: "8px", fontSize: "12px", fontWeight: 500, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", background: "#1a1a1a", color: "#888", border: "1px solid #2a2a2a" }}>Read</button>
                    {blog.status !== "approved" && (
                      <button onClick={() => updateStatus(blog.id, "approved")} disabled={actionLoading} style={{ flex: 1, padding: "7px 0", borderRadius: "8px", fontSize: "12px", fontWeight: 500, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", background: "rgba(16,185,129,0.12)", color: "#10b981", border: "none" }}>Approve</button>
                    )}
                    {blog.status !== "rejected" && (
                      <button onClick={() => updateStatus(blog.id, "rejected")} disabled={actionLoading} style={{ flex: 1, padding: "7px 0", borderRadius: "8px", fontSize: "12px", fontWeight: 500, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", background: "rgba(239,68,68,0.12)", color: "#ef4444", border: "none" }}>Reject</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: "center", paddingTop: "80px" }}>
          <p style={{ fontSize: "48px", marginBottom: "12px" }}>📝</p>
          <p style={{ color: "#444", fontSize: "14px" }}>No blogs match your filters</p>
        </div>
      )}

      {/* Preview Modal — same structure as your existing one */}
      {preview && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)" }} onClick={() => setPreview(null)}>
          <div style={{ width: "100%", maxWidth: "680px", maxHeight: "90vh", borderRadius: "20px", overflow: "hidden", background: "#111", border: "1px solid #2a2a2a", display: "flex", flexDirection: "column" }} onClick={e => e.stopPropagation()}>

            {/* Modal image */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              {preview.image ? (
                <img src={preview.image} alt={preview.title} style={{ width: "100%", height: "200px", objectFit: "cover", display: "block" }} />
              ) : (
                <div style={{ width: "100%", height: "120px", background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px" }}>📝</div>
              )}
              <button onClick={() => setPreview(null)} style={{ position: "absolute", top: "12px", right: "12px", width: "32px", height: "32px", borderRadius: "50%", background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
              <span style={{ position: "absolute", bottom: "12px", left: "14px", padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 600, background: statusStyle[preview.status]?.bg, color: statusStyle[preview.status]?.color, backdropFilter: "blur(4px)" }}>
                {statusStyle[preview.status]?.label}
              </span>
            </div>

            {/* Content */}
            <div style={{ overflowY: "auto", flex: 1, padding: "24px 28px" }}>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "14px" }}>
                <span style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "999px", background: "rgba(99,102,241,0.12)", color: "#6366f1" }}>{preview.category}</span>
              </div>
              <h2 style={{ color: "#fff", fontSize: "22px", fontWeight: 700, margin: "0 0 6px", lineHeight: 1.3 }}>{preview.title}</h2>
              <p style={{ color: "#555", fontSize: "13px", margin: "0 0 16px" }}>by {preview.author} · {preview.date}</p>
              <p style={{ color: "#888", fontSize: "14px", lineHeight: 1.7, margin: "0 0 24px", fontStyle: "italic", borderLeft: "3px solid #2a2a2a", paddingLeft: "14px" }}>{preview.description}</p>
              <div style={{ height: "1px", background: "#1f1f1f", margin: "0 0 24px" }} />
              <BlogContent content={preview.content} />
              {preview.links && (
                <div style={{ marginTop: "24px", padding: "14px 16px", borderRadius: "12px", background: "#161616", border: "1px solid #222" }}>
                  <p style={{ color: "#555", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 8px" }}>Related Links</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {preview.links.split(",").map((link, i) => (
                      <a key={i} href={link.trim()} target="_blank" rel="noreferrer" style={{ fontSize: "12px", color: "#6366f1", textDecoration: "none", padding: "3px 10px", borderRadius: "6px", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>🔗 {link.trim()}</a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action bar */}
            <div style={{ padding: "16px 24px", borderTop: "1px solid #1f1f1f", display: "flex", gap: "10px", flexShrink: 0, background: "#0f0f0f" }}>
              {preview.status !== "approved" ? (
                <button onClick={() => updateStatus(preview.id, "approved")} disabled={actionLoading} style={{ flex: 1, padding: "11px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", border: "none", background: "rgba(16,185,129,0.15)", color: "#10b981" }}>
                  ✓ Approve Blog
                </button>
              ) : (
                <div style={{ flex: 1, padding: "11px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, background: "rgba(16,185,129,0.08)", color: "#10b981", textAlign: "center", border: "1px solid rgba(16,185,129,0.2)" }}>✓ Already Approved</div>
              )}
              {preview.status !== "rejected" ? (
                <button onClick={() => updateStatus(preview.id, "rejected")} disabled={actionLoading} style={{ flex: 1, padding: "11px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", border: "none", background: "rgba(239,68,68,0.15)", color: "#ef4444" }}>
                  ✗ Reject Blog
                </button>
              ) : (
                <div style={{ flex: 1, padding: "11px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, background: "rgba(239,68,68,0.08)", color: "#ef4444", textAlign: "center", border: "1px solid rgba(239,68,68,0.2)" }}>✗ Already Rejected</div>
              )}
              <button onClick={() => setPreview(null)} style={{ padding: "11px 20px", borderRadius: "10px", fontSize: "13px", cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", background: "#1a1a1a", color: "#666", border: "1px solid #2a2a2a" }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

