import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Cell,
  } from "recharts";
  
  const T = {
    bg:            "#0F172A",
    surface:       "#1E293B",
    border:        "#2D3F55",
    textPrimary:   "#F1F5F9",
    textSecondary: "#94A3B8",
    textMuted:     "#64748B",
    blue:          "#3B82F6",
    blueDim:       "rgba(59,130,246,0.15)",
  };
  
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{
        background: "#263348",
        border: `1px solid ${T.border}`,
        borderRadius: 8,
        padding: "8px 12px",
        fontSize: 13,
        fontFamily: "'Inter', sans-serif",
      }}>
        <p style={{ margin: "0 0 2px", color: T.textSecondary }}>{label}</p>
        <p style={{ margin: 0, color: T.blue, fontWeight: 600 }}>
          {payload[0].value} reworks
        </p>
      </div>
    );
  };
  
  function ContractorChart({ data }) {
    const sorted = [...data].sort((a, b) => b.count - a.count);
  
    return (
      <div style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 14,
        padding: "1.25rem 1.25rem 1rem",
        fontFamily: "'Inter', sans-serif",
      }}>
  
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
          <div>
            <p style={{ margin: "0 0 3px", fontSize: 12, fontWeight: 600, letterSpacing: "0.6px", textTransform: "uppercase", color: T.textMuted }}>
              By Contractor
            </p>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: T.textPrimary, fontFamily: "'Space Grotesk', sans-serif" }}>
              Contractor Reworks
            </h2>
          </div>
          <span style={{
            fontSize: 11, fontWeight: 600,
            padding: "3px 9px", borderRadius: 6,
            background: T.blueDim, color: T.blue,
            border: `1px solid rgba(59,130,246,0.3)`,
          }}>
            {sorted.length} contractors
          </span>
        </div>
  
        {/* Chart */}
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={sorted} barCategoryGap="35%" margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
  
            <XAxis
              dataKey="contractor"
              tick={{ fill: T.textMuted, fontSize: 12, fontFamily: "'Inter', sans-serif" }}
              axisLine={{ stroke: T.border }}
              tickLine={false}
            />
  
            <YAxis
              allowDecimals={false}
              tick={{ fill: T.textMuted, fontSize: 12, fontFamily: "'Inter', sans-serif" }}
              axisLine={false}
              tickLine={false}
            />
  
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(59,130,246,0.06)" }} />
  
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {sorted.map((entry, i) => (
                <Cell
                  key={entry.contractor}
                  fill={i === 0 ? T.blue : `rgba(59,130,246,${0.65 - i * 0.08})`}
                />
              ))}
            </Bar>
  
          </BarChart>
        </ResponsiveContainer>
  
        {/* Top contractor callout */}
        {sorted[0] && (
          <div style={{
            marginTop: 12,
            padding: "8px 12px",
            borderRadius: 8,
            background: T.blueDim,
            border: `1px solid rgba(59,130,246,0.2)`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <span style={{ fontSize: 12, color: T.textSecondary }}>
              Highest · <strong style={{ color: T.textPrimary }}>{sorted[0].contractor}</strong>
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: T.blue }}>
              {sorted[0].count} reworks
            </span>
          </div>
        )}
  
      </div>
    );
  }
  
  export default ContractorChart;