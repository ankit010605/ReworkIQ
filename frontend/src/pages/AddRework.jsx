import { useState } from "react";
import api from "../api/api";

const T = {
  bg:            "#0F172A",
  surface:       "#1E293B",
  surfaceDeep:   "#162032",
  border:        "#2D3F55",
  borderFocus:   "#3B82F6",
  textPrimary:   "#F1F5F9",
  textSecondary: "#94A3B8",
  textMuted:     "#64748B",
  blue:          "#3B82F6",
  blueDim:       "rgba(59,130,246,0.12)",
  green:         "#22C55E",
  greenDim:      "rgba(34,197,94,0.12)",
  red:           "#E34948",
  redDim:        "rgba(227,73,72,0.12)",
};

const EMPTY = {
  mark_no:      "",
  project_name: "",
  contractor:   "Contractor A",
  reason:       "Weld Defect",
  rework_date:  new Date().toISOString().split("T")[0],
};

const inputStyle = (focused) => ({
  width: "100%",
  boxSizing: "border-box",
  background: T.surfaceDeep,
  border: `1px solid ${focused ? T.borderFocus : T.border}`,
  borderRadius: 8,
  padding: "9px 12px",
  fontSize: 13,
  color: T.textPrimary,
  fontFamily: "'Inter', sans-serif",
  outline: "none",
  transition: "border-color 0.15s",
});

function Field({ label, hint, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.6px", textTransform: "uppercase", color: T.textMuted }}>
          {label}
        </label>
        {hint && <span style={{ fontSize: 11, color: T.textMuted }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function AddRework() {
  const [formData, setFormData] = useState(EMPTY);
  const [focused,  setFocused]  = useState("");
  const [status,   setStatus]   = useState(null); // "success" | "error" | null
  const [loading,  setLoading]  = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      await api.post("/rework", formData);
      setStatus("success");
      setFormData(EMPTY);
    } catch (err) {
      console.error(err);
      setStatus("error");
    } finally {
      setLoading(false);
      setTimeout(() => setStatus(null), 3500);
    }
  };

  const focusProps = (name) => ({
    onFocus: () => setFocused(name),
    onBlur:  () => setFocused(""),
  });

  return (
    <div style={{
      minHeight: "100vh",
      background: T.bg,
      fontFamily: "'Inter', sans-serif",
      padding: "2rem 1.5rem",
      boxSizing: "border-box",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600&display=swap');
        @keyframes riq-fadein { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
        @keyframes riq-spin   { to{transform:rotate(360deg)} }
        option { background: #1E293B; color: #F1F5F9; }
      `}</style>

      <div style={{ maxWidth: 520, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "1.75rem" }}>
          <p style={{ margin: "0 0 3px", fontSize: 11, fontWeight: 600, letterSpacing: "0.7px", textTransform: "uppercase", color: T.textMuted }}>
            Welding &amp; Quality Division
          </p>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 26, fontWeight: 700,
            color: T.textPrimary, margin: 0,
            letterSpacing: "-0.4px",
          }}>
            Log Rework Entry
          </h1>
        </div>

        {/* Card */}
        <div style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 16,
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          animation: "riq-fadein 0.35s ease both",
        }}>

          {/* Row: Mark No + Project Name */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Mark No." hint="required">
              <input
                name="mark_no"
                placeholder="e.g. M-2406"
                value={formData.mark_no}
                onChange={handleChange}
                required
                style={inputStyle(focused === "mark_no")}
                {...focusProps("mark_no")}
              />
            </Field>
            <Field label="Project Name">
              <input
                name="project_name"
                placeholder="e.g. NTPC Sipat"
                value={formData.project_name}
                onChange={handleChange}
                style={inputStyle(focused === "project_name")}
                {...focusProps("project_name")}
              />
            </Field>
          </div>

          {/* Divider */}
          <div style={{ borderTop: `1px solid ${T.border}` }} />

          {/* Contractor */}
          <Field label="Contractor">
            <select
              name="contractor"
              value={formData.contractor}
              onChange={handleChange}
              style={{ ...inputStyle(focused === "contractor"), cursor: "pointer" }}
              {...focusProps("contractor")}
            >
              <option>Contractor A</option>
              <option>Contractor B</option>
              <option>Contractor C</option>
              <option>Contractor D</option>
            </select>
          </Field>

          {/* Reason */}
          <Field label="Defect Reason">
            <select
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              style={{ ...inputStyle(focused === "reason"), cursor: "pointer" }}
              {...focusProps("reason")}
            >
              <option>Weld Defect</option>
              <option>Dimensional Error</option>
              <option>Fit-up Issue</option>
              <option>Surface/Paint Issue</option>
              <option>Other</option>
            </select>
          </Field>

          {/* Date */}
          <Field label="Rework Date">
            <input
              type="date"
              name="rework_date"
              value={formData.rework_date}
              onChange={handleChange}
              style={{
                ...inputStyle(focused === "rework_date"),
                colorScheme: "dark",
              }}
              {...focusProps("rework_date")}
            />
          </Field>

          {/* Divider */}
          <div style={{ borderTop: `1px solid ${T.border}` }} />

          {/* Status banner */}
          {status && (
            <div style={{
              padding: "9px 12px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: status === "success" ? T.greenDim : T.redDim,
              border: `1px solid ${status === "success" ? "rgba(34,197,94,0.3)" : "rgba(227,73,72,0.3)"}`,
              color: status === "success" ? T.green : T.red,
              animation: "riq-fadein 0.25s ease both",
            }}>
              {status === "success" ? "✓ Rework entry saved." : "✕ Couldn't save — check your connection and retry."}
            </div>
          )}

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !formData.mark_no.trim()}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: 8,
              border: "none",
              background: loading || !formData.mark_no.trim()
                ? T.border
                : T.blue,
              color: loading || !formData.mark_no.trim()
                ? T.textMuted
                : "#fff",
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "'Space Grotesk', sans-serif",
              cursor: loading || !formData.mark_no.trim() ? "not-allowed" : "pointer",
              transition: "background 0.2s, color 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {loading
              ? <><span style={{ width:14, height:14, border:"2px solid #ffffff44", borderTopColor:"#fff", borderRadius:"50%", animation:"riq-spin 0.7s linear infinite", display:"inline-block" }} /> Saving…</>
              : "Save Rework Entry"
            }
          </button>

        </div>
      </div>
    </div>
  );
}

export default AddRework;