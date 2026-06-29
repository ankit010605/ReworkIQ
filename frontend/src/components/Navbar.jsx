const T = {
  textPrimary:   "#F1F5F9",
  textSecondary: "#94A3B8",
  textMuted:     "#64748B",
  blue:          "#3B82F6",
  border:        "#2D3F55",
};

function Navbar() {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", {
    weekday: "short",
    day:     "numeric",
    month:   "short",
    year:    "numeric",
  });

  return (
    <div style={{
      display:        "flex",
      alignItems:     "center",
      justifyContent: "space-between",
      padding:        "0 1.5rem",
      height:         56,
      boxSizing:      "border-box",
    }}>

      {/* Left — branding */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width:          30,
          height:         30,
          borderRadius:   8,
          background:     "rgba(59,130,246,0.15)",
          border:         "1px solid rgba(59,130,246,0.3)",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          fontSize:       15,
        }}>⚙</div>

        <div>
          <p style={{
            margin:      0,
            fontSize:    14,
            fontWeight:  700,
            color:       T.textPrimary,
            fontFamily:  "'Space Grotesk', sans-serif",
            lineHeight:  1.1,
            letterSpacing: "-0.2px",
          }}>ReworkIQ</p>
          <p style={{
            margin:     0,
            fontSize:   10,
            color:      T.textMuted,
            fontFamily: "'Inter', sans-serif",
            letterSpacing: "0.3px",
          }}>SSD Plant · JSPL Raigarh</p>
        </div>
      </div>

      {/* Center — subtitle */}
      <p style={{
        margin:        0,
        fontSize:      12,
        color:         T.textSecondary,
        fontFamily:    "'Inter', sans-serif",
        letterSpacing: "0.2px",
        position:      "absolute",
        left:          "50%",
        transform:     "translateX(-50%)",
      }}>
        Rework Tracking &amp; Contractor Analytics
      </p>

      {/* Right — date + live dot */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{
          fontSize:   12,
          color:      T.textMuted,
          fontFamily: "'Inter', sans-serif",
        }}>{dateStr}</span>

        <div style={{
          display:     "flex",
          alignItems:  "center",
          gap:         6,
          padding:     "4px 10px",
          borderRadius: 20,
          background:  "rgba(34,197,94,0.1)",
          border:      "1px solid rgba(34,197,94,0.25)",
          fontSize:    11,
          fontWeight:  600,
          color:       "#22C55E",
          fontFamily:  "'Inter', sans-serif",
        }}>
          <span style={{
            width:      6,
            height:     6,
            borderRadius: "50%",
            background: "#22C55E",
            animation:  "riq-pulse 2s infinite",
          }} />
          Live
        </div>
      </div>

    </div>
  );
}

export default Navbar;