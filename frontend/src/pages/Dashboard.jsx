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
    </div>
  );
}
function BarChart({
  title,
  data,
  color,
}) {

  const total =
    data.reduce(
      (sum, item) => sum + item.count,
      0
    );

  const max =
    Math.max(
      ...data.map(
        item => item.count
      ),
      1
    );

  return (

    <div
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 14,
        padding: "1.25rem",
        animation: "riq-fadein .45s ease both",
      }}
    >

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 16,
        }}
      >

        <div>

          <p
            style={{
              margin: 0,
              color: T.textSecondary,
              fontSize: 13,
              fontFamily:
                "'Space Grotesk',sans-serif",
            }}
          >
            {title}
          </p>

          <h2
            style={{
              margin: "4px 0 0",
              color: T.textPrimary,
              fontFamily:
                "'Space Grotesk',sans-serif",
            }}
          >
            {total}
          </h2>

        </div>

        <span
          style={{
            fontSize: 11,
            color: color,
            border: `1px solid ${color}55`,
            background: `${color}20`,
            padding: "4px 10px",
            borderRadius: 8,
          }}
        >
          events
        </span>

      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >

        {data.map(
          (
            item,
            index
          ) => {

            const width =
              Math.round(
                (item.count / max) * 100
              );

            return (

              <div
                key={item.label}
              >

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    marginBottom: 5,
                  }}
                >

                  <span
                    style={{
                      color:
                        index === 0
                          ? T.textPrimary
                          : T.textSecondary,
                      fontSize: 12,
                    }}
                  >
                    {item.label}
                  </span>

                  <span
                    style={{
                      color: color,
                      fontWeight: 600,
                      fontSize: 12,
                    }}
                  >
                    {item.count}
                  </span>

                </div>

                <div
                  style={{
                    height: 6,
                    borderRadius: 3,
                    background:
                      `${color}22`,
                    overflow: "hidden",
                  }}
                >

                  <div
                    style={{
                      width: `${width}%`,
                      height: "100%",
                      background: color,
                      borderRadius: 3,
                      animation:
                        `riq-bar .6s ease ${index * 80}ms both`,
                    }}
                  />

                </div>

              </div>

            );

          }
        )}

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
        animation: "riq-fadein .45s ease both",
      }}
    >

      <h3
        style={{
          marginTop: 0,
          marginBottom: 20,
          color: T.textPrimary,
          fontFamily:
            "'Space Grotesk',sans-serif",
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

          <LineChart
            data={data}
          >

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

export default function Dashboard() {

  const [stats, setStats] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(false);

  useEffect(() => {

    loadDashboard();

  }, []);

  async function loadDashboard() {

    setLoading(true);

    setError(false);

    try {

      const response =
        await api.get("/stats");

      setStats(response.data);

    }

    catch (err) {

      console.error(err);

      setError(true);

    }

    finally {

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

      <style>
        {globalStyle}
      </style>

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

  const contractorData =
    Object.entries(
      stats.contractor_counts ?? {}
    )
      .map(([label, count]) => ({
        label,
        count,
      }))
      .sort((a, b) => b.count - a.count);

  const defectData =
    Object.entries(
      stats.defect_code_counts ?? {}
    )
      .map(([label, count]) => ({
        label,
        count,
      }))
      .sort((a, b) => b.count - a.count);

  const plantData =
    Object.entries(
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

  const monthlyData =
    monthOrder
      .filter(
        month =>
          stats.monthly_counts?.[month]
      )
      .map(month => ({
        label: month,
        count:
          stats.monthly_counts[month],
      }));

  const total =
    stats.total_reworks ?? 0;

  const heatPct =
    Math.min(
      100,
      Math.round(
        (total / 200) * 100
      )
    );
    return shell(

      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
  
        {/* Heat Strip */}
  
        <div
          style={{
            marginBottom: "1.5rem",
          }}
        >
  
          <div
            style={{
              height: 4,
              borderRadius: 3,
              background: T.border,
              overflow: "hidden",
            }}
          >
  
            <div
              style={{
                height: "100%",
                width: `${heatPct}%`,
                background: `linear-gradient(
                  90deg,
                  ${T.blue},
                  ${T.amber},
                  ${T.red}
                )`,
                transition: "width 1s ease",
              }}
            />
  
          </div>
  
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 5,
              color: T.textMuted,
              fontSize: 10,
            }}
          >
  
            <span>Low</span>
  
            <span>Inspection Activity</span>
  
            <span>High</span>
  
          </div>
  
        </div>
  
        {/* Header */}
  
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            borderBottom: `1px solid ${T.border}`,
            paddingBottom: "1.2rem",
            marginBottom: "1.8rem",
          }}
        >
  
          <div>
  
            <h1
              style={{
                margin: 0,
                color: T.textPrimary,
                fontSize: 30,
                fontFamily:
                  "'Space Grotesk',sans-serif",
              }}
            >
              ReworkIQ Analytics
            </h1>
  
            <p
              style={{
                marginTop: 5,
                color: T.textSecondary,
              }}
            >
              Welding Quality Monitoring Dashboard
            </p>
  
          </div>
  
          <div
            style={{
              background: T.greenDim,
              color: T.green,
              border:
                "1px solid rgba(34,197,94,.35)",
              borderRadius: 20,
              padding: "6px 14px",
              fontWeight: 600,
              fontSize: 12,
            }}
          >
            ● LIVE
          </div>
  
        </div>
  
        {/* KPI Cards */}
  
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(190px,1fr))",
            gap: 14,
            marginBottom: "1.8rem",
          }}
        >
  
          <StatCard
            title="Total Reworks"
            value={stats.total_reworks}
            accent={T.red}
            dimAccent={T.redDim}
            icon="🔄"
          />
  
          <StatCard
            title="Top Contractor"
            value={
              stats.top_contractor?.name || "-"
            }
            accent={T.blue}
            dimAccent={T.blueDim}
            icon="👷"
          />
  
          <StatCard
            title="Top Plant"
            value={
              stats.top_plant?.name || "-"
            }
            accent={T.green}
            dimAccent={T.greenDim}
            icon="🏭"
          />
  
          <StatCard
            title="Latest Mark"
            value={
              stats.latest_entry?.mark_no || "-"
            }
            accent={T.amber}
            dimAccent={T.amberDim}
            icon="🏷️"
          />
  
        </div>
  
        <MonthlyTrend
          data={monthlyData}
        />
              {/* Pie Charts */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(350px,1fr))",
          gap: "1rem",
          marginBottom: "2rem",
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

      </div>

      {/* Breakdown */}

      <p
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: ".8px",
          textTransform: "uppercase",
          color: T.textMuted,
          margin: "0 0 .8rem",
        }}
      >
        Analytics Breakdown
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(300px,1fr))",
          gap: 14,
        }}
      >

        <BarChart
          title="Contractor Distribution"
          data={contractorData}
          color={T.blue}
        />

        <BarChart
          title="Defect Code Distribution"
          data={defectData}
          color={T.red}
        />

      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(300px,1fr))",
          gap: 14,
          marginTop: 20,
        }}
      >

        <BarChart
          title="Plant Distribution"
          data={plantData}
          color={T.green}
        />

        <BarChart
          title="Top Defect Codes"
          data={defectData.slice(0,5)}
          color={T.amber}
        />

      </div>
            {/* Summary Cards */}

            <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(250px,1fr))",
          gap: 14,
          marginTop: "2rem",
        }}
      >

        <div
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 14,
            padding: "1.2rem",
          }}
        >

          <p
            style={{
              margin: 0,
              color: T.textMuted,
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: ".8px",
            }}
          >
            Top Contractor
          </p>

          <h2
            style={{
              margin: "10px 0 5px",
              color: T.blue,
              fontFamily:
                "'Space Grotesk',sans-serif",
            }}
          >
            {stats.top_contractor?.name || "-"}
          </h2>

          <p
            style={{
              margin: 0,
              color: T.textSecondary,
            }}
          >
            Total Reworks :
            {" "}
            {stats.top_contractor?.count || 0}
          </p>

        </div>

        <div
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 14,
            padding: "1.2rem",
          }}
        >

          <p
            style={{
              margin: 0,
              color: T.textMuted,
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: ".8px",
            }}
          >
            Top Plant
          </p>

          <h2
            style={{
              margin: "10px 0 5px",
              color: T.green,
              fontFamily:
                "'Space Grotesk',sans-serif",
            }}
          >
            {stats.top_plant?.name || "-"}
          </h2>

          <p
            style={{
              margin: 0,
              color: T.textSecondary,
            }}
          >
            Total Reworks :
            {" "}
            {stats.top_plant?.count || 0}
          </p>

        </div>

        <div
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 14,
            padding: "1.2rem",
          }}
        >

          <p
            style={{
              margin: 0,
              color: T.textMuted,
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: ".8px",
            }}
          >
            Latest Inspection
          </p>

          <h2
            style={{
              margin: "10px 0 5px",
              color: T.amber,
              fontFamily:
                "'Space Grotesk',sans-serif",
            }}
          >
            {stats.latest_entry?.mark_no || "-"}
          </h2>

          <p
            style={{
              margin: 0,
              color: T.textSecondary,
            }}
          >
            {stats.latest_entry?.inspection_date || "-"}
          </p>

        </div>

      </div>
            {/* Dashboard Footer Metrics */}

            <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(220px,1fr))",
          gap: 14,
          marginTop: "2rem",
        }}
      >

        <div
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 14,
            padding: "1.2rem",
          }}
        >

          <p
            style={{
              margin: 0,
              fontSize: 11,
              color: T.textMuted,
              textTransform: "uppercase",
              letterSpacing: ".8px",
            }}
          >
            Total Contractors
          </p>

          <h1
            style={{
              margin: "8px 0 0",
              color: T.blue,
              fontFamily:
                "'Space Grotesk',sans-serif",
            }}
          >
            {contractorData.length}
          </h1>

        </div>

        <div
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 14,
            padding: "1.2rem",
          }}
        >

          <p
            style={{
              margin: 0,
              fontSize: 11,
              color: T.textMuted,
              textTransform: "uppercase",
              letterSpacing: ".8px",
            }}
          >
            Total Plants
          </p>

          <h1
            style={{
              margin: "8px 0 0",
              color: T.green,
              fontFamily:
                "'Space Grotesk',sans-serif",
            }}
          >
            {plantData.length}
          </h1>

        </div>

        <div
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 14,
            padding: "1.2rem",
          }}
        >

          <p
            style={{
              margin: 0,
              fontSize: 11,
              color: T.textMuted,
              textTransform: "uppercase",
              letterSpacing: ".8px",
            }}
          >
            Total Defect Codes
          </p>

          <h1
            style={{
              margin: "8px 0 0",
              color: T.red,
              fontFamily:
                "'Space Grotesk',sans-serif",
            }}
          >
            {defectData.length}
          </h1>

        </div>

        <div
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 14,
            padding: "1.2rem",
          }}
        >

          <p
            style={{
              margin: 0,
              fontSize: 11,
              color: T.textMuted,
              textTransform: "uppercase",
              letterSpacing: ".8px",
            }}
          >
            Database Entries
          </p>

          <h1
            style={{
              margin: "8px 0 0",
              color: T.amber,
              fontFamily:
                "'Space Grotesk',sans-serif",
            }}
          >
            {stats.total_reworks}
          </h1>

        </div>

      </div>
           {/* Quick Insights */}

           <div
        style={{
          marginTop: "2rem",
        }}
      >

        <h3
          style={{
            color: T.textPrimary,
            marginBottom: "1rem",
            fontFamily:
              "'Space Grotesk',sans-serif",
          }}
        >
          Quick Insights
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(280px,1fr))",
            gap: 16,
          }}
        >

          <div
            style={{
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: 14,
              padding: "1.3rem",
            }}
          >

            <h4
              style={{
                marginTop: 0,
                color: T.blue,
              }}
            >
              Highest Contractor
            </h4>

            <p
              style={{
                color: T.textSecondary,
                lineHeight: 1.7,
                marginBottom: 0,
              }}
            >
              <strong>
                {stats.top_contractor?.name || "-"}
              </strong>
              {" "}
              has recorded
              {" "}
              <strong>
                {stats.top_contractor?.count || 0}
              </strong>
              {" "}
              rework cases and currently
              contributes the highest share
              of defects.
            </p>

          </div>

          <div
            style={{
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: 14,
              padding: "1.3rem",
            }}
          >

            <h4
              style={{
                marginTop: 0,
                color: T.green,
              }}
            >
              Highest Plant
            </h4>

            <p
              style={{
                color: T.textSecondary,
                lineHeight: 1.7,
                marginBottom: 0,
              }}
            >
              <strong>
                {stats.top_plant?.name || "-"}
              </strong>
              {" "}
              currently contains the
              maximum number of recorded
              inspections and rework
              entries.
            </p>

          </div>

          <div
            style={{
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: 14,
              padding: "1.3rem",
            }}
          >

            <h4
              style={{
                marginTop: 0,
                color: T.red,
              }}
            >
              Most Common Defect
            </h4>

            <p
              style={{
                color: T.textSecondary,
                lineHeight: 1.7,
                marginBottom: 0,
              }}
            >
              <strong>
                {stats.most_common_defect?.code || "-"}
              </strong>
              {" "}
              is the most frequently
              occurring defect code in
              the current inspection
              database.
            </p>

          </div>

        </div>

      </div>
            {/* Footer */}

            <div
        style={{
          marginTop: "2.5rem",
          paddingTop: "1.5rem",
          borderTop: `1px solid ${T.border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
        }}
      >

        <div>

          <h3
            style={{
              margin: 0,
              color: T.textPrimary,
              fontFamily:
                "'Space Grotesk',sans-serif",
            }}
          >
            ReworkIQ v2.0
          </h3>

          <p
            style={{
              marginTop: 5,
              color: T.textMuted,
              fontSize: 13,
            }}
          >
            Live Rework Monitoring • Contractor Analytics •
            Plant Analytics • Defect Code Analytics
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
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            System Status : Online
          </div>

          <div
            style={{
              color: T.textMuted,
              fontSize: 12,
              marginTop: 5,
            }}
          >
            Total Records : {stats.total_reworks}
          </div>

        </div>

      </div>

    </div>

  );

} 