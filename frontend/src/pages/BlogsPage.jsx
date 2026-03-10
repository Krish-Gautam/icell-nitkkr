


import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BlogCard from "../components/blog/BlogCard";
import BlogFilter from "../components/blog/BlogFilter";
import Footer from "../components/layout/Footer";

// ── Slider ────────────────────────────────────────────────────────────────────
function BlogSlider({ blogs, onCardClick }) {
  const [startIdx, setStartIdx] = useState(0);
  const visible = 3;
  const canPrev = startIdx > 0;
  const canNext = startIdx + visible < blogs.length;

  return (
    <div style={{ position: "relative" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", overflow: "hidden" }}>
        {blogs.slice(startIdx, startIdx + visible).map(blog => (
          <BlogCard key={blog.id} blog={blog} onClick={onCardClick} />
        ))}
        {Array.from({ length: Math.max(0, visible - blogs.slice(startIdx, startIdx + visible).length) }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
      </div>
      {blogs.length > visible && (
        <div style={{ display: "flex", gap: "8px", marginTop: "20px" }}>
          {[
            { label: "← Prev", action: () => setStartIdx(Math.max(0, startIdx - 1)), enabled: canPrev },
            { label: "Next →", action: () => setStartIdx(Math.min(blogs.length - visible, startIdx + 1)), enabled: canNext },
          ].map(({ label, action, enabled }) => (
            <button key={label} onClick={action} disabled={!enabled} style={{ padding: "9px 22px", borderRadius: "999px", border: enabled ? "1.5px solid rgba(255,255,255,0.22)" : "1.5px solid rgba(255,255,255,0.07)", background: enabled ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.02)", color: enabled ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.18)", cursor: enabled ? "pointer" : "not-allowed", fontSize: "13px", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, transition: "all 0.22s ease" }}>
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SectionTitle({ title }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
      <h2 style={{ color: "#fff", fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "22px", fontWeight: 400, margin: 0, letterSpacing: "-0.02em" }}>{title}</h2>
      <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, rgba(255,255,255,0.15), transparent)" }} />
    </div>
  );
}

const SECTION_CATEGORIES = ["Finance", "Technology", "Startup", "Design"];

export default function BlogsPage() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/blogs");
        if (!res.ok) throw new Error("Failed to fetch blogs");
        const data = await res.json();
        setBlogs(data);
      } catch (err) {
        console.error("Failed to load blogs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const filteredBlogs = activeCategory === "All"
    ? blogs
    : blogs.filter(b => b.category === activeCategory);

  const handleCardClick = (blog) => navigate(`/blog/${blog.id}`);
  const recentBlogs  = [...blogs].slice(0, 6);
  const popularBlogs = [...blogs].slice(2, 8);

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d0d", color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />

      {/* Hero */}
      <section style={{ paddingTop: "96px" }}>
        <div style={{ margin: "0 auto", maxWidth: "1200px", padding: "0 24px" }}>
          <div style={{ borderRadius: "24px", overflow: "hidden", background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", minHeight: "220px", position: "relative" }}>
            <div style={{ position: "absolute", right: "10%", top: "50%", transform: "translateY(-50%)", width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle, rgba(102,126,234,0.2) 0%, transparent 70%)" }} />
            <div style={{ padding: "48px 56px", position: "relative", zIndex: 1 }}>
              <div style={{ display: "inline-block", padding: "6px 16px", borderRadius: "8px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: "16px" }}>
                Knowledge Hub
              </div>
              <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 400, margin: 0, letterSpacing: "-0.03em", lineHeight: 1.1, color: "#fff" }}>
                Trends &amp; Blogs
              </h1>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "14px", marginTop: "12px", maxWidth: "400px", lineHeight: 1.6 }}>
                Stay informed with expert insights on finance, technology, startup and design.
              </p>
            </div>
            <div style={{ marginLeft: "auto", padding: "48px 56px", position: "relative", zIndex: 1 }}>
              <button
                onClick={() => navigate("/write-blog")}
                className="relative overflow-hidden px-6 py-3 rounded-[15px] bg-[#e8e8e8] text-[#212121] font-extrabold text-[15px] shadow-[4px_8px_19px_-3px_rgba(0,0,0,0.27)] transition-all duration-300 group flex items-center gap-2"
              >
                <span className="absolute inset-0 w-0 bg-[#212121] rounded-[15px] transition-all duration-300 group-hover:w-full z-0" />
                <span className="relative z-10 flex items-center gap-2 group-hover:text-[#e8e8e8] transition-colors duration-300">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M12 2L14 4L6 12H4V10L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M2 14H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  Create Blog
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Filter */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px 0" }}>
        <div style={{ padding: "20px 24px", borderRadius: "16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <BlogFilter activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
        </div>
      </section>

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: "center", padding: "80px 0", color: "rgba(255,255,255,0.3)", fontSize: "14px" }}>
          Loading blogs...
        </div>
      )}

      {/* Category filtered view */}
      {!loading && activeCategory !== "All" && (
        <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px" }}>
          <SectionTitle title={activeCategory} />
          {filteredBlogs.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
              {filteredBlogs.map(blog => <BlogCard key={blog.id} blog={blog} onClick={handleCardClick} />)}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "80px 0", color: "rgba(255,255,255,0.3)", fontSize: "15px" }}>
              No blogs found in this category yet.
            </div>
          )}
        </section>
      )}

      {/* All sections */}
      {!loading && activeCategory === "All" && (
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px" }}>
          {recentBlogs.length > 0 && (
            <section style={{ marginBottom: "56px" }}>
              <SectionTitle title="Recent Blogs" />
              <BlogSlider blogs={recentBlogs} onCardClick={handleCardClick} />
            </section>
          )}
          {popularBlogs.length > 0 && (
            <section style={{ marginBottom: "56px" }}>
              <SectionTitle title="Most Popular" />
              <BlogSlider blogs={popularBlogs} onCardClick={handleCardClick} />
            </section>
          )}
          {SECTION_CATEGORIES.map(cat => {
            const catBlogs = blogs.filter(b => b.category === cat);
            if (catBlogs.length === 0) return null;
            return (
              <section key={cat} style={{ marginBottom: "56px" }}>
                <SectionTitle title={cat} />
                <BlogSlider blogs={catBlogs} onCardClick={handleCardClick} />
              </section>
            );
          })}
          {blogs.length === 0 && (
            <div style={{ textAlign: "center", padding: "80px 0", color: "rgba(255,255,255,0.3)", fontSize: "15px" }}>
              No blogs published yet. Be the first to write one!
            </div>
          )}
        </div>
      )}

      <div style={{ height: "60px" }} />
    </div>
  );
}