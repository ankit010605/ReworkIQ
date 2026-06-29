import { useEffect, useState } from "react";
import api from "../api/api";
import PieAnalytics from "../components/PieAnalytics";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
  } from "recharts";
// ─── Design tokens (hardcoded — no CSS variable dependency) ──────────────────
const T = {
  bg:           "#0F172A",
  surface:      "#1E293B",
  surfaceHover: "#263348",
  border:       "#2D3F55",
  textPrimary:  "#F1F5F9",
  textSecondary:"#94A3B8",
  textMuted:    "#64748B",
  red:          "#E34948",
  blue:         "#3B82F6",
  amber:        "#F59E0B",
  green:        "#22C55E",
  redDim:       "rgba(227,73,72,0.12)",
  blueDim:      "rgba(59,130,246,0.12)",
  amberDim:     "rgba(245,158,11,0.12)",
  greenDim:     "rgba(34,197,94,0.12)",
};

const globalStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500&display=swap');
  @keyframes riq-spin  { to { transform: rotate(360deg); } }
  @keyframes riq-pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
  @keyframes riq-bar   { from{width:0%} }
  @keyframes riq-fadein{ from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
`;

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ title, value, accent, dimAccent, icon }) {
  return (
    <div style={{
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: 14,
      padding: "1.1rem 1.2rem 1rem",
      position: "relative",
      overflow: "hidden",
      animation: "riq-fadein 0.4s ease both",
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
        fontSize: 16,
        marginBottom: 10,
      }}>{icon}</div>

      <p style={{
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.8px",
        textTransform: "uppercase",
        color: T.textMuted,
        margin: "0 0 5px",
        fontFamily: "'Inter', sans-serif",
      }}>{title}</p>

      <p style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: String(value).length > 10 ? 15 : String(value).length > 6 ? 18 : 26,
        fontWeight: 700,
        color: T.textPrimary,
        margin: 0,
        lineHeight: 1.15,
        wordBreak: "break-word",
      }}>{value}</p>
    </div>
  );
}

// ─── BarChart ─────────────────────────────────────────────────────────────────
function BarChart({ title, data, color }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  const max   = Math.max(...data.map((d) => d.count), 1);

  return (
    <div style={{
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: 14,
      padding: "1.2rem",
      animation: "riq-fadein 0.5s ease both",
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom: 16 }}>
        <div>
          <p style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 13,
            fontWeight: 500,
            color: T.textSecondary,
            margin: "0 0 3px",
          }}>{title}</p>
          <p style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 22,
            fontWeight: 700,
            color: T.textPrimary,
            margin: 0,
          }}>{total}</p>
        </div>
        <span style={{
          fontSize: 11,
          fontWeight: 500,
          padding: "3px 8px",
          borderRadius: 6,
          background: `${color}22`,
          color: color,
          border: `1px solid ${color}44`,
        }}>events</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {data.map(({ label, count }, i) => {
          const pct = Math.round((count / max) * 100);
          return (
            <div key={label}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom: 4 }}>
                <span style={{
                  fontSize: 12,
                  color: i === 0 ? T.textPrimary : T.textSecondary,
                  fontWeight: i === 0 ? 500 : 400,
                  fontFamily: "'Inter', sans-serif",
                  maxWidth: "70%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>{label}</span>
                <span style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: i === 0 ? color : T.textMuted,
                  fontFamily: "'Space Grotesk', sans-serif",
                }}>{count}</span>
              </div>
              <div style={{
                height: 5,
                background: `${color}1A`,
                borderRadius: 3,
                overflow: "hidden",
              }}>
                <div style={{
                  width: `${pct}%`,
                  height: "100%",
                  borderRadius: 3,
                  background: i === 0
                    ? color
                    : `${color}${Math.round(55 + 90 * (1 - i / data.length)).toString(16).padStart(2,"0")}`,
                  animation: `riq-bar 0.7s cubic-bezier(.4,0,.2,1) ${i * 80}ms both`,
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
function MonthlyTrend({ data }) {

    return (
  
      <div
        style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 14,
          padding: "1.5rem",
          marginBottom: "1.5rem",
        }}
      >
  
        <h3
          style={{
            color: T.textPrimary,
            marginBottom: 20,
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          Monthly Rework Trend
        </h3>
  
        <div style={{ width: "100%", height: 300 }}>
  
          <ResponsiveContainer>
  
            <LineChart data={data}>
  
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#2D3F55"
              />
  
              <XAxis
                dataKey="label"
                stroke="#94A3B8"
              />
  
              <YAxis
                stroke="#94A3B8"
              />
  
              <Tooltip />
  
              <Line
                type="monotone"
                dataKey="count"
                stroke="#22C55E"
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 8 }}
              />
  
            </LineChart>
  
          </ResponsiveContainer>
  
        </div>
  
      </div>
  
    );
  
  }
// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [stats, setStats]   = useState(null);
  const [error, setError]   = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    setError(false);
    try {
        const { data } = await api.get("/stats");
      setStats(data);
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  // ── Shell wrapper (always dark) ──
  const shell = (children) => (
    <div style={{
      minHeight: "100vh",
      background: T.bg,
      fontFamily: "'Inter', sans-serif",
      padding: "2rem 1.5rem",
      boxSizing: "border-box",
    }}>
      <style>{globalStyle}</style>
      {children}
    </div>
  );

  // ── Loading ──
  if (loading) return shell(
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:320, gap:14 }}>
      <div style={{
        width: 36, height: 36,
        border: `3px solid ${T.border}`,
        borderTopColor: T.blue,
        borderRadius: "50%",
        animation: "riq-spin 0.75s linear infinite",
      }} />
      <span style={{ fontSize:13, color: T.textMuted }}>Loading dashboard…</span>
    </div>
  );

  // ── Error ──
  if (error) return shell(
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:320, gap:10 }}>
      <div style={{ fontSize:36 }}>⚠</div>
      <p style={{ margin:0, fontSize:15, fontWeight:600, color: T.textPrimary }}>API unreachable</p>
      <p style={{ margin:0, fontSize:13, color: T.textMuted }}>Make sure Flask is running on port 5000.</p>
      <button onClick={load} style={{
        marginTop:8, padding:"7px 20px", fontSize:13, fontWeight:500,
        border:`1px solid ${T.border}`, borderRadius:8,
        background: T.surface, color: T.textPrimary, cursor:"pointer",
      }}>Retry</button>
    </div>
  );

  // ── Data ──
  const contractorData = Object.entries(stats.contractor_counts ?? {})
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

  const reasonData = Object.entries(stats.reason_counts ?? {})
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
    const monthOrder = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      
      const monthlyData = monthOrder
        .filter(month => stats.monthly_counts?.[month])
        .map(month => ({
          label: month,
          count: stats.monthly_counts[month],
        }));
      

  const total     = stats.total_reworks ?? 0;
  const heatPct   = Math.min(100, Math.round((total / 200) * 100));

  return shell(
    <div style={{ maxWidth: 960, margin: "0 auto" }}>

      {/* Heat strip */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{
          height: 4,
          borderRadius: 2,
          background: T.border,
          overflow: "hidden",
        }}>
          <div style={{
            height: "100%",
            width: `${heatPct}%`,
            background: `linear-gradient(90deg, ${T.blue} 0%, ${T.amber} 55%, ${T.red} 100%)`,
            borderRadius: 2,
            transition: "width 1s ease",
          }} />
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
          <span style={{ fontSize:10, color: T.textMuted }}>Low</span>
          <span style={{ fontSize:10, color: T.textMuted }}>Rework intensity</span>
          <span style={{ fontSize:10, color: T.textMuted }}>High</span>
        </div>
      </div>

      {/* Header */}
      <div style={{
        display:"flex", alignItems:"flex-start", justifyContent:"space-between",
        marginBottom:"1.75rem",
        paddingBottom:"1.25rem",
        borderBottom: `1px solid ${T.border}`,
      }}>
        <div>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 28, fontWeight: 700,
            margin: 0, color: T.textPrimary,
            letterSpacing: "-0.5px",
          }}>ReworkIQ</h1>
          <p style={{ fontSize:13, color: T.textSecondary, margin:"4px 0 0" }}>
            SSD Plant &nbsp;·&nbsp; Welding &amp; Quality Division
          </p>
        </div>

        {/* Live badge */}
        <div style={{
          display:"inline-flex", alignItems:"center", gap:6,
          fontSize:12, fontWeight:600,
          padding:"5px 12px", borderRadius:20,
          background: "rgba(34,197,94,0.12)",
          color: T.green,
          border: `1px solid rgba(34,197,94,0.3)`,
        }}>
          <span style={{
            width:7, height:7, borderRadius:"50%",
            background: T.green,
            animation:"riq-pulse 2s infinite",
          }} />
          Live
        </div>
      </div>

      {/* Stat cards */}
      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fit, minmax(175px, 1fr))",
        gap:12,
        marginBottom:"1.75rem",
      }}>
       <StatCard title="Total Reworks"  value={stats.total_reworks}                            accent="#E34948" dimAccent="rgba(227,73,72,0.12)"  icon="🔄" />
<StatCard title="Top Contractor" value={stats.top_contractor?.name || "—"}               accent="#3B82F6" dimAccent="rgba(59,130,246,0.12)"  icon="🏗️" />
<StatCard title="Common Reason"  value={stats.most_common_reason?.reason || "—"}         accent="#F59E0B" dimAccent="rgba(245,158,11,0.12)"  icon="⚠️" />
<StatCard title="Latest Mark"    value={stats.latest_entry?.mark_no || "—"}              accent="#22C55E" dimAccent="rgba(34,197,94,0.12)"   icon="🏷️" />
</div>

<MonthlyTrend data={monthlyData} />
<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(350px,1fr))",
    gap: "1rem",
    marginBottom: "2rem",
  }}
>

  <PieAnalytics
    title="Rework Reasons"
    data={reasonData}
  />

  <PieAnalytics
    title="Contractor Distribution"
    data={contractorData}
  />

</div>
{/* Section label */}
      <p style={{
        fontSize:10, fontWeight:600, letterSpacing:"0.8px",
        textTransform:"uppercase", color: T.textMuted,
        margin:"0 0 0.75rem",
        fontFamily:"'Inter', sans-serif",
      }}>Breakdown</p>

      {/* Bar charts */}
      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))",
        gap:12,
      }}>
        <BarChart title="By contractor"    data={contractorData} color={T.blue} />
        <BarChart title="By defect reason" data={reasonData}     color={T.red}  />
      </div>

    </div>
  );
}
