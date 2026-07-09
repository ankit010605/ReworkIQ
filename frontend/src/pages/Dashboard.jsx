import axios from "axios";
import { useEffect, useState } from "react";
import api from "../api/api";
import PieAnalytics from "../components/PieAnalytics";
// import { generateDashboardReport } from "../utils/pdf/dashboardReport";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const T = {
  bg: "#0F172A",
  surface: "#1E293B",
  surfaceHover: "#263348",
  border: "#2D3F55",
  textPrimary: "#F1F5F9",
  textSecondary: "#94A3B8",
  textMuted: "#64748B",

  red: "#E34948",
  blue: "#3B82F6",
  amber: "#F59E0B",
  green: "#22C55E",

  redDim: "rgba(227,73,72,0.12)",
  blueDim: "rgba(59,130,246,0.12)",
  amberDim: "rgba(245,158,11,0.12)",
  greenDim: "rgba(34,197,94,0.12)",
};

const globalStyle = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500&display=swap');

@keyframes riq-spin{
to{
transform:rotate(360deg);
}
}

@keyframes riq-pulse{
0%,100%{opacity:1}
50%{opacity:.35}
}

@keyframes riq-bar{
from{
width:0%;
}
}

@keyframes riq-fadein{
from{
opacity:0;
transform:translateY(6px);
}
to{
opacity:1;
transform:none;
}
}
`;

function StatCard({
  title,
  value,
  accent,
  dimAccent,
  icon,
  subtitle,
}) {
  return (
    <div
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 14,
        padding: "1.1rem 1.2rem",
        position: "relative",
        overflow: "hidden",
        animation: "riq-fadein .35s ease both",
        height: "100%",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: accent,
        }}
      />

      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 8,
          background: dimAccent,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: 16,
          marginBottom: 12,
        }}
      >
        {icon}
      </div>

      <p
        style={{
          margin: 0,
          color: T.textMuted,
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: ".7px",
          fontWeight: 600,
        }}
      >
        {title}
      </p>

      <h2
        style={{
          margin: "8px 0 0",
          color: T.textPrimary,
          fontFamily: "'Space Grotesk',sans-serif",
          fontSize:
            String(value).length > 12
              ? 16
              : String(value).length > 7
              ? 20
              : 28,
        }}
      >
        {value}
      </h2>

      {subtitle && (
        <p
          style={{
            margin: "6px 0 0",
            color: T.textSecondary,
            fontSize: 12,
          }}
        >
          {subtitle}
        </p>
      )}
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
        animation: "riq-fadein .45s ease both",
      }}
    >
      <h3
        style={{
          marginTop: 0,
          marginBottom: 20,
          color: T.textPrimary,
          fontFamily: "'Space Grotesk',sans-serif",
        }}
      >
        Monthly Inspection Trend
      </h3>

      <div
        style={{
          width: "100%",
          height: 300,
        }}
      >
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={T.border}
            />

            <XAxis
              dataKey="label"
              stroke={T.textSecondary}
            />

            <YAxis
              stroke={T.textSecondary}
            />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="count"
              stroke={T.green}
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

function RankedListCard({
  title,
  data,
  color,
  maxItems = 5,
}) {
  const displayData = data.slice(0, maxItems);

  return (
    <div
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 14,
        padding: "1.25rem",
        animation: "riq-fadein .45s ease both",
        height: "100%",
      }}
    >
      <h3
        style={{
          margin: "0 0 1rem",
          color: T.textPrimary,
          fontFamily: "'Space Grotesk',sans-serif",
          fontSize: 14,
        }}
      >
        {title}
      </h3>

      <div>
        {displayData.map((item, index) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0.75rem 0",
              borderBottom:
                index < displayData.length - 1
                  ? `1px solid ${T.border}`
                  : "none",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: color + "22",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  color: color,
                }}
              >
                {index + 1}
              </div>

              <span
                style={{
                  color: T.textPrimary,
                  fontSize: 13,
                }}
              >
                {item.label}
              </span>
            </div>

            <span
              style={{
                color: color,
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              {item.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function InsightCard({
  title,
  content,
  iconColor,
  icon,
}) {
  return (
    <div
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 14,
        padding: "1.3rem",
        animation: "riq-fadein .45s ease both",
        height: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            fontSize: 20,
          }}
        >
          {icon}
        </div>

        <h4
          style={{
            margin: 0,
            color: iconColor,
            fontFamily: "'Space Grotesk',sans-serif",
            fontSize: 14,
          }}
        >
          {title}
        </h4>
      </div>

      <p
        style={{
          color: T.textSecondary,
          lineHeight: 1.6,
          margin: 0,
          fontSize: 13,
        }}
      >
        {content}
      </p>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const handleGenerateReport = async () => {
    try {
      const response = await axios.get(
        "https://reworkiq-backend.onrender.com/api/report/pdf",
        {
          responseType: "blob",
        }
      );
  
      const url = window.URL.createObjectURL(
        new Blob([response.data])
      );
  
      const link = document.createElement("a");
  
      link.href = url;
  
      link.setAttribute(
        "download",
        "REWO_Rework_Analytics_Report.pdf"
      );
  
      document.body.appendChild(link);
  
      link.click();
  
      link.remove();
  
      window.URL.revokeObjectURL(url);
  
    } catch (error) {
      console.error(error);
      alert("Failed to generate report");
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    setError(false);

    try {
      const response = await api.get("/stats");
      setStats(response.data);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  const shell = (children) => (
    <div
      style={{
        minHeight: "100vh",
        background: T.bg,
        padding: "2rem 1.5rem",
        fontFamily: "'Inter',sans-serif",
      }}
    >
      <style>{globalStyle}</style>
      {children}
    </div>
  );

  if (loading) {
    return shell(
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: 320,
          gap: 14,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            border: `3px solid ${T.border}`,
            borderTopColor: T.blue,
            borderRadius: "50%",
            animation: "riq-spin .8s linear infinite",
          }}
        />

        <span
          style={{
            color: T.textMuted,
            fontSize: 13,
          }}
        >
          Loading Dashboard...
        </span>
      </div>
    );
  }

  if (error) {
    return shell(
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: 320,
          gap: 12,
        }}
      >
        <h2
          style={{
            color: T.red,
            margin: 0,
          }}
        >
          Unable to load dashboard
        </h2>

        <button
          onClick={loadDashboard}
          style={{
            background: T.blue,
            color: "#fff",
            border: "none",
            padding: "8px 18px",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  const contractorData = Object.entries(
    stats.contractor_counts ?? {}
  )
    .map(([label, count]) => ({
      label,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const defectData = Object.entries(
    stats.defect_code_counts ?? {}
  )
    .map(([label, count]) => ({
      label,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const plantData = Object.entries(
    stats.plant_counts ?? {}
  )
    .map(([label, count]) => ({
      label,
      count,
    }))
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
    .filter((month) => stats.monthly_counts?.[month])
    .map((month) => ({
      label: month,
      count: stats.monthly_counts[month],
    }));

  const total = stats.total_reworks ?? 0;

  // Calculate Quality Score
  const qualityScore = Math.max(60, 100 - total * 2);

  const getQualityStatus = (score) => {
    if (score >= 85) return "Excellent";
    if (score >= 70) return "Good";
    return "Needs Improvement";
  };

  const getQualityColor = (score) => {
    if (score >= 85) return T.green;
    if (score >= 70) return T.amber;
    return T.red;
  };

  return shell(
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* HEADER */}
      <div style={{ marginBottom: "2rem" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2rem",
            alignItems: "flex-start",
            marginBottom: "2rem",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "2rem",
                color: T.textPrimary,
                fontFamily: "'Space Grotesk',sans-serif",
                fontWeight: 700,
                margin: 0,
              }}
            >
              ReworkIQ Analytics Dashboard
            </h1>

            <p
              style={{
                color: T.textSecondary,
                fontSize: 13,
                marginTop: "0.5rem",
                margin: "0.5rem 0 0",
              }}
            >
              Executive Quality & Rework Monitoring
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              justifyContent: "flex-end",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <button
              style={{
                color: T.textSecondary,
                border: `1px solid ${T.border}`,
                fontSize: 12,
                background: "transparent",
                padding: "6px 12px",
                borderRadius: 6,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = T.blue;
                e.target.style.color = T.blue;
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = T.border;
                e.target.style.color = T.textSecondary;
              }}
            >
              📅 Date Range
            </button>

            <button
              style={{
                color: T.textSecondary,
                border: `1px solid ${T.border}`,
                fontSize: 12,
                background: "transparent",
                padding: "6px 12px",
                borderRadius: 6,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = T.green;
                e.target.style.color = T.green;
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = T.border;
                e.target.style.color = T.textSecondary;
              }}
            >
              🏭 Plant
            </button>

            <button
              style={{
                color: T.textSecondary,
                border: `1px solid ${T.border}`,
                fontSize: 12,
                background: "transparent",
                padding: "6px 12px",
                borderRadius: 6,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = T.blue;
                e.target.style.color = T.blue;
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = T.border;
                e.target.style.color = T.textSecondary;
              }}
            >
              👷 Contractor
            </button>

            <button
              style={{
                background: T.blue,
                color: "#fff",
                fontSize: 12,
                border: "none",
                padding: "6px 12px",
                borderRadius: 6,
                cursor: "pointer",
                transition: "opacity 0.2s",
              }}
              onClick={handleGenerateReport}
              onMouseEnter={(e) => {
                e.target.style.opacity = 0.9;
              }}
              onMouseLeave={(e) => {
                e.target.style.opacity = 1;
              }}
            >
              📊 Generate Report
            </button>
          </div>
        </div>

        <div
          style={{
            height: 1,
            background: T.border,
          }}
        />
      </div>

      {/* SECTION 1: Executive KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <StatCard
          title="Total Reworks"
          value={stats.total_reworks ?? 0}
          accent={T.red}
          dimAccent={T.redDim}
          icon="🔄"
          subtitle="All Records"
        />

        <StatCard
          title="Top Contractor"
          value={stats.top_contractor?.name || "-"}
          accent={T.blue}
          dimAccent={T.blueDim}
          icon="👷"
          subtitle={`${stats.top_contractor?.count || 0} cases`}
        />

        <StatCard
          title="Top Plant"
          value={stats.top_plant?.name || "-"}
          accent={T.green}
          dimAccent={T.greenDim}
          icon="🏭"
          subtitle={`${stats.top_plant?.count || 0} cases`}
        />

        <StatCard
          title="Quality Performance"
          value={`${qualityScore}%`}
          accent={getQualityColor(qualityScore)}
          dimAccent={
            qualityScore >= 85
              ? T.greenDim
              : qualityScore >= 70
              ? T.amberDim
              : T.redDim
          }
          icon={
            qualityScore >= 85
              ? "✓"
              : qualityScore >= 70
              ? "!"
              : "⚠"
          }
          subtitle={getQualityStatus(qualityScore)}
        />
      </div>

      {/* SECTION 2: Monthly Trend */}
      <div style={{ marginBottom: "2rem" }}>
        <MonthlyTrend data={monthlyData} />
      </div>

      {/* SECTION 3: Distribution Charts */}
      <div style={{ marginBottom: "2rem" }}>
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: ".8px",
            textTransform: "uppercase",
            color: T.textMuted,
            marginBottom: "1rem",
            margin: "0 0 1rem",
          }}
        >
          Distribution Analysis
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "1rem",
          }}
        >
          <PieAnalytics
            title="Plant Distribution"
            data={plantData}
          />

          <PieAnalytics
            title="Contractor Distribution"
            data={contractorData}
          />

          <PieAnalytics
            title="Defect Code Distribution"
            data={defectData}
          />
        </div>
      </div>

      {/* SECTION 4: Top Rankings */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <RankedListCard
          title="Top 5 Contractors by Rework Count"
          data={contractorData}
          color={T.blue}
          maxItems={5}
        />

        <RankedListCard
          title="Top Plants by Inspection Count"
          data={plantData}
          color={T.green}
          maxItems={5}
        />
      </div>

      {/* SECTION 5: Executive Insights */}
      <div style={{ marginBottom: "2rem" }}>
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: ".8px",
            textTransform: "uppercase",
            color: T.textMuted,
            marginBottom: "1rem",
            margin: "0 0 1rem",
          }}
        >
          Executive Insights
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "1rem",
          }}
        >
          <InsightCard
            title="Highest Rework Contractor"
            content={`${stats.top_contractor?.name || "N/A"} accounts for ${stats.top_contractor?.count || 0} rework cases. Focus on process improvement and welder training for this contractor.`}
            iconColor={T.blue}
            icon="📈"
          />

          <InsightCard
            title="Highest Rework Plant"
            content={`${stats.top_plant?.name || "N/A"} has the highest number of recorded inspections with ${stats.top_plant?.count || 0} rework entries. Review equipment and process parameters.`}
            iconColor={T.green}
            icon="🏭"
          />

          <InsightCard
            title="Most Common Defect"
            content={`Defect code ${stats.most_common_defect?.code || "N/A"} is the most frequently occurring issue. Implement targeted corrective actions and quality training.`}
            iconColor={T.red}
            icon="⚠️"
          />

          <InsightCard
            title="Overall Quality Status"
            content={`Current quality score is ${qualityScore}% with ${getQualityStatus(qualityScore)} performance. ${qualityScore >= 85 ? "Maintain current quality standards." : qualityScore >= 70 ? "Continue monitoring and take preventive measures." : "Urgent action required to improve quality metrics."}`}
            iconColor={getQualityColor(qualityScore)}
            icon={
              qualityScore >= 85
                ? "✅"
                : qualityScore >= 70
                ? "⏳"
                : "🔴"
            }
          />
        </div>
      </div>

      {/* FOOTER */}
      <div
        style={{
          marginTop: "2rem",
          paddingTop: "1.5rem",
          borderTop: `1px solid ${T.border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              color: T.textPrimary,
              fontFamily: "'Space Grotesk',sans-serif",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            ReworkIQ v2.0
          </h3>

          <p
            style={{
              marginTop: "0.5rem",
              color: T.textMuted,
              fontSize: 12,
              margin: "0.5rem 0 0",
            }}
          >
            Executive Analytics • Contractor Monitoring • Plant Analysis
          </p>
        </div>

        <div
          style={{
            textAlign: "right",
          }}
        >
          <div
            style={{
              color: T.green,
              fontWeight: 700,
              fontSize: 12,
            }}
          >
            ● System Status: Online
          </div>

          <div
            style={{
              color: T.textMuted,
              fontSize: 12,
              marginTop: "0.5rem",
            }}
          >
            Total Records: {stats.total_reworks}
          </div>
        </div>
      </div>
    </div>
  );
}
