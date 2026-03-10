
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Footer from "../components/layout/Footer";

// ── Inline text renderer: handles **bold** and _italic_ ──────────────────────
function renderInline(text) {
  // Handle **bold**
  const parts = text.split(/(\*\*[^*]+\*\*|_[^_]+_)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i} style={{ color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("_") && part.endsWith("_"))
      return <em key={i} style={{ fontStyle: "italic" }}>{part.slice(1, -1)}</em>;
    return part;
  });
}

// ── Full markdown-style content renderer ─────────────────────────────────────
function RenderContent({ content }) {
  if (!content) return null;

  const lines = content.split("\n");
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("# ")) {
      elements.push(
        <h1 key={i} style={{
          fontFamily: "'DM Serif Display', Georgia, serif",
          fontSize: "32px", fontWeight: 400, color: "#fff",
          margin: "40px 0 16px", letterSpacing: "-0.02em",
        }}>
          {line.replace("# ", "")}
        </h1>
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} style={{
          fontFamily: "'DM Serif Display', Georgia, serif",
          fontSize: "24px", fontWeight: 400, color: "#fff",
          margin: "36px 0 14px", paddingBottom: "10px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          letterSpacing: "-0.02em",
        }}>
          {line.replace("## ", "")}
        </h2>
      );
    } else if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} style={{
          fontSize: "17px", fontWeight: 600,
          color: "rgba(255,255,255,0.9)", margin: "24px 0 10px",
        }}>
          {line.replace("### ", "")}
        </h3>
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      // Collect consecutive list items
      const listItems = [];
      while (i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("* "))) {
        listItems.push(
          <li key={i} style={{
            color: "rgba(255,255,255,0.65)", fontSize: "15px",
            lineHeight: 1.8, marginBottom: "6px",
          }}>
            {renderInline(lines[i].replace(/^[-*] /, ""))}
          </li>
        );
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} style={{ paddingLeft: "20px", margin: "12px 0" }}>
          {listItems}
        </ul>
      );
      continue;
    } else if (/^\d+\. /.test(line)) {
      // Ordered list
      const listItems = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        listItems.push(
          <li key={i} style={{
            color: "rgba(255,255,255,0.65)", fontSize: "15px",
            lineHeight: 1.8, marginBottom: "8px",
          }}>
            {renderInline(lines[i].replace(/^\d+\. /, ""))}
          </li>
        );
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} style={{ paddingLeft: "22px", margin: "12px 0" }}>
          {listItems}
        </ol>
      );
      continue;
    } else if (line.startsWith("---")) {
      elements.push(
        <hr key={i} style={{
          border: "none", borderTop: "1px solid rgba(255,255,255,0.08)",
          margin: "32px 0",
        }} />
      );
    } else if (line.trim() === "") {
      // skip blank lines (spacing handled by margins)
    } else {
      elements.push(
        <p key={i} style={{
          color: "rgba(255,255,255,0.62)", fontSize: "15.5px",
          lineHeight: 1.85, margin: "0 0 16px",
        }}>
          {renderInline(line)}
        </p>
      );
    }
    i++;
  }

  return <div>{elements}</div>;
}

// ── Share button ──────────────────────────────────────────────────────────────
function ShareButton({ icon, label, href }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="nofollow noreferrer"
      title={label}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: 36, height: 36, borderRadius: "50%",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "rgba(255,255,255,0.6)",
        textDecoration: "none", transition: "all 0.2s", fontSize: "14px",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = "rgba(255,255,255,0.12)";
        e.currentTarget.style.color = "#fff";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = "rgba(255,255,255,0.06)";
        e.currentTarget.style.color = "rgba(255,255,255,0.6)";
      }}
    >
      {icon}
    </a>
  );
}

// ── Related blog card ─────────────────────────────────────────────────────────
function RelatedCard({ blog, onClick }) {
  return (
    <div
      onClick={() => onClick(blog)}
      style={{
        cursor: "pointer", borderRadius: "14px", overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.03)",
        transition: "all 0.25s",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.border = "1px solid rgba(255,255,255,0.16)";
        e.currentTarget.style.background = "rgba(255,255,255,0.05)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)";
        e.currentTarget.style.background = "rgba(255,255,255,0.03)";
      }}
    >
      {blog.image ? (
        <img
          src={blog.image} alt={blog.title}
          style={{ width: "100%", height: "130px", objectFit: "cover" }}
        />
      ) : (
        <div style={{
          width: "100%", height: "130px", background: "#1a1a1a",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "28px",
        }}>📝</div>
      )}
      <div style={{ padding: "14px" }}>
        <span style={{
          fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em",
          textTransform: "uppercase", color: "rgba(255,255,255,0.4)",
        }}>
          {blog.category}
        </span>
        <p style={{
          color: "#fff", fontSize: "13px",
          fontFamily: "'DM Serif Display', Georgia, serif",
          lineHeight: 1.4, margin: "6px 0 8px",
          display: "-webkit-box", WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {blog.title}
        </p>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px", margin: 0 }}>
          {blog.author} · {blog.date}
        </p>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function BlogDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [blog, setBlog]           = useState(null);
  const [allBlogs, setAllBlogs]   = useState([]);
  const [activeSection, setActiveSection] = useState(0);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/blogs/${id}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setBlog(data);

        const allRes  = await fetch("http://localhost:5000/api/blogs");
        const allData = await allRes.json();
        setAllBlogs(Array.isArray(allData) ? allData : []);
      } catch (err) {
        console.error(err);
        setBlog(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", background: "#0d0d0d",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "14px" }}>Loading…</p>
      </div>
    );
  }

  // ── Not found ─────────────────────────────────────────────────────────────
  if (!blog) {
    return (
      <div style={{
        minHeight: "100vh", background: "#0d0d0d",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📄</div>
          <h2 style={{ color: "#fff", fontSize: "22px", marginBottom: "8px" }}>Blog not found</h2>
          <p style={{ color: "rgba(255,255,255,0.4)", marginBottom: "24px" }}>
            The blog you're looking for doesn't exist or was removed.
          </p>
          <button
            onClick={() => navigate("/blogs")}
            style={{
              padding: "10px 24px", borderRadius: "999px",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.08)", color: "#fff",
              cursor: "pointer", fontSize: "14px", fontFamily: "'DM Sans', sans-serif",
            }}
          >
            ← Back to Blogs
          </button>
        </div>
      </div>
    );
  }

  // ── Derived data ──────────────────────────────────────────────────────────
  const related = allBlogs
    .filter(b => b.id !== blog.id && b.category === blog.category)
    .slice(0, 3);

  const moreBlogs = related.length < 3
    ? [...related, ...allBlogs.filter(b => b.id !== blog.id && b.category !== blog.category)].slice(0, 3)
    : related;

  const linksArray = blog.links
    ? blog.links.split(",").map(l => l.trim()).filter(Boolean)
    : [];

  const tableOfContents = (blog.content || "")
    .split("\n")
    .filter(line => line.startsWith("## "))
    .map((line, i) => ({ id: `section-${i}`, label: line.replace("## ", "") }));

  const shareUrl   = encodeURIComponent(window.location.href);
  const shareTitle = encodeURIComponent(blog.title || "");

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh", background: "#0d0d0d",
      color: "#fff", fontFamily: "'DM Sans', sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />

      {/* ── HERO ── */}
      <section style={{ paddingTop: "80px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>

          {/* Back button */}
          <button
            onClick={() => navigate("/blogs")}
            style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              padding: "7px 16px", borderRadius: "999px", marginBottom: "24px",
              border: "1px solid rgba(255,255,255,0.1)", background: "transparent",
              color: "rgba(255,255,255,0.45)", fontSize: "12px", cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", marginTop: "16px",
            }}
          >
            ← Back to Blogs
          </button>

          {/* Hero card */}
          <div style={{
            borderRadius: "24px", overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.08)",
            display: "grid", gridTemplateColumns: "1fr 1fr",
            minHeight: "320px", background: "#111",
          }}>
            {/* Left: meta */}
            <div style={{
              padding: "48px",
              display: "flex", flexDirection: "column", justifyContent: "center",
              background: "linear-gradient(135deg, #141414 0%, #1a1a2e 100%)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                <span style={{
                  padding: "5px 14px", borderRadius: "999px", fontSize: "11px",
                  fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
                  background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.7)",
                }}>
                  {blog.category}
                </span>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }}>
                  {blog.date}
                </span>
              </div>

              <h1 style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: "clamp(22px, 2.5vw, 34px)",
                fontWeight: 400, color: "#fff",
                margin: "0 0 20px", lineHeight: 1.2, letterSpacing: "-0.02em",
              }}>
                {blog.title}
              </h1>

              {/* Author */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
                <div style={{
                  width: 34, height: 34, borderRadius: "50%",
                  background: "linear-gradient(135deg, #6366f1, #a855f7)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "13px", fontWeight: 700, color: "#fff", flexShrink: 0,
                }}>
                  {blog.author?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{ color: "#fff", fontSize: "13px", fontWeight: 500, margin: 0 }}>
                    {blog.author}
                  </p>
                  <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", margin: 0 }}>
                    Author · {blog.date}
                  </p>
                </div>
              </div>

              {/* Share */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", marginRight: "4px" }}>
                  Share:
                </span>
                <ShareButton
                  icon="𝕏" label="Share on X"
                  href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
                />
                <ShareButton
                  icon="in" label="Share on LinkedIn"
                  href={`https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${shareTitle}`}
                />
                <ShareButton
                  icon="f" label="Share on Facebook"
                  href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                />
              </div>
            </div>

            {/* Right: image */}
            <div style={{ position: "relative", overflow: "hidden" }}>
              {blog.image ? (
                <img
                  src={blog.image} alt={blog.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover", minHeight: "320px" }}
                />
              ) : (
                <div style={{
                  width: "100%", height: "100%", minHeight: "320px",
                  background: "linear-gradient(135deg, #1a1a2e, #0f3460)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "64px",
                }}>
                  📝
                </div>
              )}
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(90deg, rgba(20,20,20,0.4) 0%, transparent 40%)",
              }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTENT + SIDEBAR ── */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 24px" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 280px",
          gap: "48px", alignItems: "flex-start",
        }}>

          {/* Article */}
          <article>
            {/* Description highlight */}
            {blog.description && (
              <div style={{
                padding: "20px 24px", borderRadius: "14px", marginBottom: "36px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderLeft: "3px solid rgba(255,255,255,0.3)",
              }}>
                <p style={{
                  color: "rgba(255,255,255,0.7)", fontSize: "16px",
                  lineHeight: 1.7, margin: 0, fontStyle: "italic",
                }}>
                  {blog.description}
                </p>
              </div>
            )}

            {/* Full content */}
            <RenderContent content={blog.content} />

            {/* Related links */}
            {linksArray.length > 0 && (
              <div style={{
                marginTop: "40px", padding: "20px 24px", borderRadius: "14px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}>
                <p style={{
                  color: "rgba(255,255,255,0.5)", fontSize: "12px", fontWeight: 600,
                  letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 12px",
                }}>
                  Related Links
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {linksArray.map((link, i) => (
                    <a
                      key={i} href={link} target="_blank" rel="noreferrer"
                      style={{
                        color: "rgba(255,255,255,0.55)", fontSize: "13px",
                        textDecoration: "none", display: "flex",
                        alignItems: "center", gap: "6px", transition: "color 0.2s",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                      onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
                    >
                      <span style={{ fontSize: "10px" }}>↗</span> {link}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div style={{
              marginTop: "40px", padding: "18px 22px", borderRadius: "12px",
              background: "rgba(255,200,0,0.04)",
              border: "1px solid rgba(255,200,0,0.1)",
            }}>
              <p style={{
                color: "rgba(255,200,0,0.5)", fontSize: "11px", fontWeight: 600,
                letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 6px",
              }}>
                Disclaimer
              </p>
              <p style={{
                color: "rgba(255,255,255,0.3)", fontSize: "12px",
                lineHeight: 1.6, margin: 0,
              }}>
                Information on this page is for informational purposes only and does not
                constitute professional advice. Readers are advised to consult professionals
                for personalised advice before making decisions.
              </p>
            </div>
          </article>

          {/* Sidebar */}
          <aside style={{ position: "sticky", top: "100px" }}>

            {/* Table of contents */}
            {tableOfContents.length > 0 && (
              <div style={{
                padding: "22px", borderRadius: "16px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                marginBottom: "20px",
              }}>
                <p style={{
                  color: "rgba(255,255,255,0.5)", fontSize: "11px", fontWeight: 600,
                  letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 16px",
                }}>
                  Table of Contents
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  {tableOfContents.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveSection(i)}
                      style={{
                        textAlign: "left", padding: "8px 10px", borderRadius: "8px",
                        background: activeSection === i ? "rgba(255,255,255,0.07)" : "transparent",
                        border: "none", cursor: "pointer",
                        color: activeSection === i ? "#fff" : "rgba(255,255,255,0.45)",
                        fontSize: "13px", lineHeight: 1.4, transition: "all 0.2s",
                        borderLeft: activeSection === i
                          ? "2px solid rgba(255,255,255,0.5)"
                          : "2px solid transparent",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                      onMouseEnter={e => { if (activeSection !== i) e.currentTarget.style.color = "rgba(255,255,255,0.75)"; }}
                      onMouseLeave={e => { if (activeSection !== i) e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Author card */}
            <div style={{
              padding: "20px", borderRadius: "16px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              marginBottom: "20px",
            }}>
              <p style={{
                color: "rgba(255,255,255,0.4)", fontSize: "11px", fontWeight: 600,
                letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 14px",
              }}>
                About the Author
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: 42, height: 42, borderRadius: "50%",
                  background: "linear-gradient(135deg, #6366f1, #a855f7)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "16px", fontWeight: 700, color: "#fff", flexShrink: 0,
                }}>
                  {blog.author?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{ color: "#fff", fontSize: "14px", fontWeight: 600, margin: 0 }}>
                    {blog.author}
                  </p>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", margin: 0 }}>
                    Society Member
                  </p>
                </div>
              </div>
            </div>

            {/* Share card */}
            <div style={{
              padding: "20px", borderRadius: "16px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}>
              <p style={{
                color: "rgba(255,255,255,0.4)", fontSize: "11px", fontWeight: 600,
                letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 14px",
              }}>
                Share this Post
              </p>
              <div style={{ display: "flex", gap: "8px" }}>
                <ShareButton
                  icon="𝕏" label="Share on X"
                  href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
                />
                <ShareButton
                  icon="in" label="Share on LinkedIn"
                  href={`https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}`}
                />
                <ShareButton
                  icon="f" label="Share on Facebook"
                  href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                />
              </div>
            </div>

          </aside>
        </div>
      </section>

      {/* ── RELATED BLOGS ── */}
      {moreBlogs.length > 0 && (
        <section style={{
          maxWidth: "1200px", margin: "0 auto", padding: "0 24px 60px",
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "16px", marginBottom: "28px",
          }}>
            <h2 style={{
              color: "#fff",
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: "22px", fontWeight: 400, margin: 0, letterSpacing: "-0.02em",
            }}>
              You Might Also Like
            </h2>
            <div style={{
              flex: 1, height: "1px",
              background: "linear-gradient(90deg, rgba(255,255,255,0.15), transparent)",
            }} />
            <button
              onClick={() => navigate("/blogs")}
              style={{
                color: "rgba(255,255,255,0.4)", fontSize: "12px",
                background: "none", border: "none", cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap",
              }}
            >
              View all →
            </button>
          </div>

          <div style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "18px",
          }}>
            {moreBlogs.map(b => (
              <RelatedCard
                key={b.id}
                blog={b}
                onClick={() => navigate(`/blog/${b.id}`)}
              />
            ))}
          </div>
        </section>
      )}

      
    </div>
  );
}
