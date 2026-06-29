import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
  } from "recharts";
  
  const COLORS = ["#3B82F6", "#E34948", "#F59E0B", "#22C55E", "#A78BFA"];
  
  const T = {
    surface:       "#1E293B",
    border:        "#2D3F55",
    textPrimary:   "#F1F5F9",
    textSecondary: "#94A3B8",
    textMuted:     "#64748B",
  };
  
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const { name, value } = payload[0];
    const total = payload[0].payload.total;
    return (
      <div style={{
        background: "#263348",
        border: `1px solid ${T.border}`,
        borderRadius: 8,
        padding: "8px 12px",
        fontSize: 13,
        fontFamily: "'Inter', sans-serif",
      }}>
        <p style={{ margin: "0 0 2px", color: T.textSecondary }}>{name}</p>
        <p style={{ margin: 0, color: COLORS[0], fontWeight: 600 }}>
          {value} reworks &nbsp;
          <span style={{ color: T.textMuted, fontWeight: 400 }}>
            ({Math.round((value / total) * 100)}%)
          </span>
        </p>
      </div>
    );
  };
  
  function ReasonChart({ data }) {
    const total = data.reduce((s, d) => s + d.count, 0);
    const sorted = [...data]
      .sort((a, b) => b.count - a.count)
      .map((d) => ({ ...d, total }));
  
    return (
      <div style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 14,
        padding: "1.25rem",
        fontFamily: "'Inter', sans-serif",
      }}>
  
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
          <div>
            <p style={{ margin: "0 0 3px", fontSize: 12, fontWeight: 600, letterSpacing: "0.6px", textTransform: "uppercase", color: T.textMuted }}>
              By Defect Type
            </p>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: T.textPrimary, fontFamily: "'Space Grotesk', sans-serif" }}>
              Reason Breakdown
            </h2>
          </div>
          <span style={{
            fontSize: 11, fontWeight: 600,
            padding: "3px 9px", borderRadius: 6,
            background: "rgba(227,73,72,0.15)",
            color: "#E34948",
            border: "1px solid rgba(227,73,72,0.3)",
          }}>
            {total} total
          </span>
        </div>
  
        {/* Pie + legend side by side */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
  
          <ResponsiveContainer width="50%" height={220}>
            <PieChart>
              <Pie
                data={sorted}
                dataKey="count"
                nameKey="reason"
                outerRadius={90}
                innerRadius={50}
                paddingAngle={3}
                strokeWidth={0}
              >
                {sorted.map((entry, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
  
          {/* Legend */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            {sorted.map((entry, i) => {
              const pct = Math.round((entry.count / total) * 100);
              return (
                <div key={entry.reason}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <span style={{
                        width: 8, height: 8, borderRadius: 2,
                        background: COLORS[i % COLORS.length],
                        flexShrink: 0,
                      }} />
                      <span style={{
                        fontSize: 12,
                        color: i === 0 ? T.textPrimary : T.textSecondary,
                        fontWeight: i === 0 ? 500 : 400,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: 120,
                      }}>{entry.reason}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: COLORS[i % COLORS.length] }}>
                      {pct}%
                    </span>
                  </div>
                  {/* mini bar */}
                  <div style={{ height: 3, background: `${COLORS[i % COLORS.length]}22`, borderRadius: 2 }}>
                    <div style={{
                      width: `${pct}%`, height: "100%",
                      background: COLORS[i % COLORS.length],
                      borderRadius: 2,
                      opacity: i === 0 ? 1 : 0.6,
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
  
        </div>
  
        {/* Top reason callout */}
        {sorted[0] && (
          <div style={{
            marginTop: 14,
            padding: "8px 12px",
            borderRadius: 8,
            background: "rgba(227,73,72,0.1)",
            border: "1px solid rgba(227,73,72,0.2)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <span style={{ fontSize: 12, color: T.textSecondary }}>
              Leading cause · <strong style={{ color: T.textPrimary }}>{sorted[0].reason}</strong>
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#E34948" }}>
              {Math.round((sorted[0].count / total) * 100)}% of reworks
            </span>
          </div>
        )}
  
      </div>
    );
  }
  
  export default ReasonChart;