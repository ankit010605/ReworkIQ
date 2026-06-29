function StatCard({ title, value, accent = "#3B82F6", dimAccent = "rgba(59,130,246,0.12)", icon = "📊" }) {
    return (
      <div style={{
        background: "#1E293B",
        border: "1px solid #2D3F55",
        borderRadius: 14,
        padding: "1.1rem 1.2rem 1rem",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Inter', sans-serif",
      }}>
  
        {/* top accent bar */}
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: 3,
          background: accent,
          borderRadius: "14px 14px 0 0",
        }} />
  
        {/* icon bubble */}
        <div style={{
          width: 32, height: 32,
          borderRadius: 8,
          background: dimAccent,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 15,
          marginBottom: 10,
          marginTop: 4,
        }}>
          {icon}
        </div>
  
        {/* label */}
        <p style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.8px",
          textTransform: "uppercase",
          color: "#64748B",
          margin: "0 0 5px",
        }}>
          {title}
        </p>
  
        {/* value */}
        <p style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: String(value).length > 10 ? 15 : String(value).length > 6 ? 18 : 26,
          fontWeight: 700,
          color: "#F1F5F9",
          margin: 0,
          lineHeight: 1.15,
          wordBreak: "break-word",
        }}>
          {value}
        </p>
  
      </div>
    );
  }
  
  export default StatCard;