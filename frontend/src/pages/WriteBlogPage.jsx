import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const CATEGORIES = [
  "Finance",
  "Technology",
  "Startup",
  "Design",
  "Accounts",
  "Cards",
  "Cyber Security",
  "Digital Banking",
  "Fixed Deposit",
  "Loans",
  "Payments",
  "Remittance",
];

function ToolbarBtn({ label, onInsert }) {
  return (
    <span
      onClick={onInsert}
      title={label}
      style={{
        padding: "3px 10px",
        borderRadius: "6px",
        fontSize: "11px",
        fontWeight: 600,
        cursor: "pointer",
        background: "rgba(255,255,255,0.05)",
        color: "rgba(255,255,255,0.5)",
        border: "1px solid rgba(255,255,255,0.08)",
        fontFamily: "monospace",
        userSelect: "none",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.1)";
        e.currentTarget.style.color = "#fff";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.05)";
        e.currentTarget.style.color = "rgba(255,255,255,0.5)";
      }}
    >
      {label}
    </span>
  );
}

export default function WriteBlogPage() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const contentRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    author: "",
    category: "",
    description: "",
    content: "",
    links: "",
    isMember: "",
    rollNumber: "",
  });

  const [imagePreview, setImagePreview] = useState(null); // local preview URL
  const [imageFile, setImageFile] = useState(null); // actual File object
  const [imageUploading, setImageUploading] = useState(false); // upload spinner
  const [submitted, setSubmitted] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Form helpers ──────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "isMember" && value !== "yes" ? { rollNumber: "" } : {}),
    }));
  };

  // ── Image: store File object + create local preview ───────────────────────
  const handleImage = (file) => {
    if (!file) return;

    // Validate type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (PNG, JPG, etc.)");
      return;
    }

    // Validate size — 5MB max
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB");
      return;
    }

    // Store the File object for upload later
    setImageFile(file);

    // Show local preview immediately (no upload yet)
    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);
    setError(null);
  };

  const handleFileInput = (e) => handleImage(e.target.files[0]);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleImage(e.dataTransfer.files[0]);
  };

  // ── Upload image to local storage (base64) ───────────────────────────────
  const uploadImageAsBase64 = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // ── Toolbar ───────────────────────────────────────────────────────────────
  const insertAt = (before, after = "") => {
    const ta = contentRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const sel = ta.value.slice(start, end) || "text";
    const next =
      ta.value.slice(0, start) + before + sel + after + ta.value.slice(end);
    setForm((prev) => ({ ...prev, content: next }));
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(
        start + before.length,
        start + before.length + sel.length
      );
    }, 0);
  };

  const toolbarActions = [
    { label: "H1", fn: () => insertAt("# ") },
    { label: "H2", fn: () => insertAt("## ") },
    { label: "H3", fn: () => insertAt("### ") },
    { label: "B", fn: () => insertAt("**", "**") },
    { label: "I", fn: () => insertAt("_", "_") },
    { label: "Link", fn: () => insertAt("[", "](url)") },
    { label: "• List", fn: () => insertAt("- ") },
    { label: "1. List", fn: () => insertAt("1. ") },
    { label: "Code", fn: () => insertAt("`", "`") },
    { label: "---", fn: () => insertAt("\n---\n") },
  ];

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setError(null);

    if (!form.title || !form.author || !form.category || !form.content) {
      setError(
        "Please fill in all required fields (Title, Author, Category, Content)."
      );
      return;
    }
    if (!form.isMember) {
      setError("Please indicate whether you are a member of the organisation.");
      return;
    }
    if (form.isMember === "yes" && !form.rollNumber.trim()) {
      setError("Please enter your Roll Number.");
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("You must be logged in to submit a blog. Please log in first.");
      return;
    }

    setLoading(true);

    try {
      // ── Step A: convert image to base64 if one was selected ──────────────
      let imageUrl = null;

      if (imageFile) {
        imageUrl = await uploadImageAsBase64(imageFile);
      }

      // ── Step B: send blog data to backend ──────────────────────────────
      const payload = {
        title: form.title,
        author: form.author,
        category: form.category,
        description: form.description || "",
        content: form.content,
        links: form.links || "",
        image: imageUrl, // ← base64 data URL
      };

      const response = await api.post("/blogs", payload);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  // ── Styles ────────────────────────────────────────────────────────────────
  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.04)",
    color: "#fff",
    fontSize: "14px",
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    boxSizing: "border-box",
    transition: "border 0.2s",
  };
  const labelStyle = {
    display: "block",
    color: "rgba(255,255,255,0.5)",
    fontSize: "12px",
    fontWeight: 500,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    marginBottom: "8px",
    fontFamily: "'DM Sans', sans-serif",
  };
  const focusBorder = {
    onFocus: (e) =>
      (e.currentTarget.style.border = "1px solid rgba(255,255,255,0.25)"),
    onBlur: (e) =>
      (e.currentTarget.style.border = "1px solid rgba(255,255,255,0.1)"),
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0d0d0d",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <div style={{ textAlign: "center", maxWidth: 480, padding: "0 24px" }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              fontSize: 28,
            }}
          >
            ✓
          </div>
          <h2
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: 28,
              color: "#fff",
              marginBottom: 12,
            }}
          >
            Blog Submitted!
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,0.45)",
              fontSize: 14,
              lineHeight: 1.7,
              marginBottom: 32,
            }}
          >
            Your blog has been submitted for review. It will appear publicly
            once an admin approves it. Thank you for contributing!
          </p>
          <button
            onClick={() => navigate("/blogs")}
            style={{
              padding: "12px 28px",
              borderRadius: "999px",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.08)",
              color: "#fff",
              fontSize: 14,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            ← Back to Blogs
          </button>
        </div>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0d0d0d",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />

      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "120px 24px 80px",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "40px" }}>
          <button
            onClick={() => navigate("/blogs")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              borderRadius: "999px",
              border: "1px solid rgba(255,255,255,0.1)",
              background: "transparent",
              color: "rgba(255,255,255,0.45)",
              fontSize: "12px",
              cursor: "pointer",
              marginBottom: "24px",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            ← Back to Blogs
          </button>
          <div
            style={{
              display: "inline-block",
              padding: "5px 14px",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.4)",
              marginBottom: "14px",
            }}
          >
            New Post
          </div>
          <h1
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 400,
              color: "#fff",
              margin: "0 0 8px",
              letterSpacing: "-0.02em",
            }}
          >
            Write a Blog
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.35)",
              fontSize: "14px",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Share your knowledge. Your blog will go live after admin review.
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div
            style={{
              padding: "14px 18px",
              borderRadius: "12px",
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              marginBottom: "24px",
              color: "#ef4444",
              fontSize: "13px",
            }}
          >
            ⚠ {error}
          </div>
        )}

        {/* Form card */}
        <div
          style={{
            borderRadius: "20px",
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.02)",
            padding: "36px",
            display: "flex",
            flexDirection: "column",
            gap: "28px",
          }}
        >
          {/* Cover Image */}
          <div>
            <label style={labelStyle}>Cover Image</label>
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              style={{
                borderRadius: "14px",
                border: `1.5px dashed ${
                  dragging ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.12)"
                }`,
                background: dragging
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(255,255,255,0.02)",
                cursor: "pointer",
                overflow: "hidden",
                transition: "all 0.2s",
                minHeight: imagePreview ? "auto" : "160px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{
                      width: "100%",
                      maxHeight: "280px",
                      objectFit: "cover",
                      borderRadius: "12px",
                    }}
                  />
                  {/* Upload progress overlay */}
                  {imageUploading && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "12px",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          border: "3px solid rgba(255,255,255,0.2)",
                          borderTop: "3px solid #fff",
                          borderRadius: "50%",
                          animation: "spin 0.8s linear infinite",
                        }}
                      />
                      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                      <span style={{ color: "#fff", fontSize: "13px" }}>
                        Uploading…
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "40px 24px" }}>
                  <div style={{ fontSize: 28, marginBottom: 12 }}>🖼️</div>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.4)",
                      fontSize: "14px",
                      margin: "0 0 6px",
                    }}
                  >
                    Drag & drop or click to upload
                  </p>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.2)",
                      fontSize: "12px",
                      margin: 0,
                    }}
                  >
                    PNG, JPG up to 5MB • Stored in Supabase
                  </p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileInput}
            />
            {imagePreview && !imageUploading && (
              <button
                onClick={() => {
                  setImagePreview(null);
                  setImageFile(null);
                  fileRef.current.value = "";
                }}
                style={{
                  marginTop: "8px",
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.3)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Remove image
              </button>
            )}
          </div>

          {/* Title */}
          <div>
            <label style={labelStyle}>
              Title <span style={{ color: "rgba(255,100,100,0.8)" }}>*</span>
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter a compelling blog title..."
              style={inputStyle}
              {...focusBorder}
            />
          </div>

          {/* Author + Category */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
            }}
          >
            <div>
              <label style={labelStyle}>
                Author Name{" "}
                <span style={{ color: "rgba(255,100,100,0.8)" }}>*</span>
              </label>
              <input
                name="author"
                value={form.author}
                onChange={handleChange}
                placeholder="Your name"
                style={inputStyle}
                {...focusBorder}
              />
            </div>
            <div>
              <label style={labelStyle}>
                Category{" "}
                <span style={{ color: "rgba(255,100,100,0.8)" }}>*</span>
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                style={{ ...inputStyle, appearance: "none" }}
                {...focusBorder}
              >
                <option value="" style={{ background: "#1a1a1a" }}>
                  Select category
                </option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} style={{ background: "#1a1a1a" }}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Member toggle */}
          <div>
            <label style={labelStyle}>
              Member of Organisation{" "}
              <span style={{ color: "rgba(255,100,100,0.8)" }}>*</span>
            </label>
            <div style={{ display: "flex", gap: "10px" }}>
              {[
                { value: "yes", label: "Yes, I'm a member" },
                { value: "no", label: "No, I'm not" },
              ].map(({ value, label }) => {
                const active = form.isMember === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      handleChange({ target: { name: "isMember", value } })
                    }
                    style={{
                      padding: "10px 22px",
                      borderRadius: "999px",
                      border: active
                        ? "1px solid rgba(255,255,255,0.4)"
                        : "1px solid rgba(255,255,255,0.1)",
                      background: active
                        ? "rgba(255,255,255,0.12)"
                        : "rgba(255,255,255,0.03)",
                      color: active ? "#fff" : "rgba(255,255,255,0.4)",
                      fontSize: "13px",
                      fontWeight: active ? 500 : 400,
                      cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                      transition: "all 0.2s",
                    }}
                  >
                    {active && (
                      <span
                        style={{
                          marginRight: "6px",
                          fontSize: "11px",
                          opacity: 0.8,
                        }}
                      >
                        ✓
                      </span>
                    )}
                    {label}
                  </button>
                );
              })}
            </div>
            {form.isMember === "yes" && (
              <div
                style={{
                  marginTop: "16px",
                  padding: "18px 20px",
                  borderRadius: "14px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.03)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "14px",
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "rgba(120,220,140,0.7)",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      color: "rgba(120,220,140,0.8)",
                      fontSize: "12px",
                      fontWeight: 500,
                    }}
                  >
                    Organisation member verified
                  </span>
                </div>
                <label style={labelStyle}>
                  Roll Number{" "}
                  <span style={{ color: "rgba(255,100,100,0.8)" }}>*</span>
                </label>
                <input
                  name="rollNumber"
                  value={form.rollNumber}
                  onChange={handleChange}
                  placeholder="e.g. 2024CSXXX"
                  style={inputStyle}
                  {...focusBorder}
                />
                <p
                  style={{
                    color: "rgba(255,255,255,0.2)",
                    fontSize: "11px",
                    marginTop: "6px",
                    marginBottom: 0,
                  }}
                >
                  Your roll number will be sent to the admin for identity
                  verification.
                </p>
              </div>
            )}
          </div>

          {/* Short Description */}
          <div>
            <label style={labelStyle}>Short Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="A brief summary that appears on the blog card (2–3 sentences)..."
              rows={3}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
              {...focusBorder}
            />
          </div>

          {/* Full Content */}
          <div>
            <label style={labelStyle}>
              Full Content{" "}
              <span style={{ color: "rgba(255,100,100,0.8)" }}>*</span>
            </label>
            <div
              style={{
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.04)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  padding: "10px 12px",
                  borderBottom: "1px solid rgba(255,255,255,0.07)",
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                {toolbarActions.map(({ label, fn }) => (
                  <ToolbarBtn key={label} label={label} onInsert={fn} />
                ))}
                <span
                  style={{
                    color: "rgba(255,255,255,0.2)",
                    fontSize: "11px",
                    marginLeft: "auto",
                  }}
                >
                  Markdown supported
                </span>
              </div>
              <textarea
                ref={contentRef}
                name="content"
                value={form.content}
                onChange={handleChange}
                placeholder={`# Main Heading\n\n## Section Heading\n\nYour paragraph text here...\n\n- Bullet point one\n- Bullet point two\n\n**Bold text** and _italic text_\n\n[Link text](https://example.com)`}
                rows={16}
                style={{
                  ...inputStyle,
                  border: "none",
                  borderRadius: 0,
                  background: "transparent",
                  resize: "vertical",
                  lineHeight: 1.8,
                  fontFamily: "monospace",
                  fontSize: "13px",
                }}
              />
            </div>
            <p
              style={{
                color: "rgba(255,255,255,0.2)",
                fontSize: "11px",
                marginTop: "6px",
              }}
            >
              Use # for H1, ## for H2, ### for H3. **bold**, _italic_, - for
              lists.
            </p>
          </div>

          {/* Links */}
          <div>
            <label style={labelStyle}>Related Links</label>
            <input
              name="links"
              value={form.links}
              onChange={handleChange}
              placeholder="https://example.com, https://another.com"
              style={inputStyle}
              {...focusBorder}
            />
            <p
              style={{
                color: "rgba(255,255,255,0.25)",
                fontSize: "11px",
                marginTop: "6px",
              }}
            >
              Separate multiple links with commas
            </p>
          </div>

          {/* Admin notice */}
          <div
            style={{
              padding: "14px 18px",
              borderRadius: "12px",
              background: "rgba(255,200,0,0.05)",
              border: "1px solid rgba(255,200,0,0.12)",
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
            }}
          >
            <span style={{ fontSize: 16, flexShrink: 0 }}>⏳</span>
            <p
              style={{
                color: "rgba(255,200,0,0.6)",
                fontSize: "13px",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              Your blog will be{" "}
              <strong style={{ color: "rgba(255,200,0,0.8)" }}>
                reviewed by an admin
              </strong>{" "}
              before going live.
              {form.isMember === "yes" && form.rollNumber && (
                <>
                  {" "}
                  Your membership (Roll No:{" "}
                  <strong style={{ color: "rgba(255,200,0,0.8)" }}>
                    {form.rollNumber}
                  </strong>
                  ) will also be verified.
                </>
              )}{" "}
              This usually takes 24–48 hours.
            </p>
          </div>

          {/* Actions */}
          <div
            style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}
          >
            <button
              onClick={() => navigate("/blogs")}
              style={{
                padding: "12px 24px",
                borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "transparent",
                color: "rgba(255,255,255,0.45)",
                fontSize: "14px",
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || imageUploading}
              style={{
                padding: "12px 32px",
                borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.3)",
                background:
                  loading || imageUploading
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(255,255,255,0.1)",
                color:
                  loading || imageUploading ? "rgba(255,255,255,0.3)" : "#fff",
                fontSize: "14px",
                fontWeight: 500,
                cursor: loading || imageUploading ? "not-allowed" : "pointer",
                fontFamily: "'DM Sans', sans-serif",
                transition: "all 0.25s ease",
              }}
              onMouseEnter={(e) => {
                if (!loading && !imageUploading) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.18)";
                  e.currentTarget.style.border =
                    "1px solid rgba(255,255,255,0.45)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  loading || imageUploading
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(255,255,255,0.1)";
                e.currentTarget.style.border =
                  "1px solid rgba(255,255,255,0.3)";
              }}
            >
              {loading
                ? "Submitting…"
                : imageUploading
                ? "Uploading image…"
                : "Submit for Review →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
