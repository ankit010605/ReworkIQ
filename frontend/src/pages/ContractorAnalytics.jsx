import { useEffect, useState } from "react";
import api from "../api/api";
import ContractorPieChart from "../components/ContractorPieChart";

const T = {
  bg: "#0F172A",
  surface: "#1E293B",
  border: "#2D3F55",
  textPrimary: "#F1F5F9",
  textSecondary: "#94A3B8",
  textMuted: "#64748B",
  blue: "#3B82F6",
};

export default function ContractorAnalytics() {
  const [contractors, setContractors] = useState([]);
  const [selected, setSelected] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadContractors();
  }, []);

  async function loadContractors() {
    try {
      const { data } = await api.get("/rework");

      const unique = [...new Set(data.map((item) => item.contractor))];

      setContractors(unique);

      if (unique.length > 0) {
        setSelected(unique[0]);
      }
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    if (selected !== "") {
      loadAnalytics(selected);
    }
  }, [selected]);

  async function loadAnalytics(contractor) {
    setLoading(true);

    try {
      const { data } = await api.get(
        `/analytics/contractor/${contractor}`
      );

      setAnalytics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: T.bg,
        padding: "2rem",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        {/* Header */}

        <div
          style={{
            marginBottom: "2rem",
          }}
        >
          <p
            style={{
              color: T.textMuted,
              fontSize: 12,
              margin: 0,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            ReworkIQ Analytics
          </p>

          <h1
            style={{
              color: T.textPrimary,
              marginTop: 5,
            }}
          >
            Contractor Analytics
          </h1>
        </div>

        {/* Contractor Selector */}

        <div
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 12,
            padding: "1.25rem",
            marginBottom: "1.5rem",
          }}
        >
          <label
            style={{
              color: T.textSecondary,
              fontSize: 13,
            }}
          >
            Select Contractor
          </label>

          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            style={{
              width: "100%",
              marginTop: 10,
              padding: 10,
              borderRadius: 8,
              border: `1px solid ${T.border}`,
              background: "#162032",
              color: "white",
            }}
          >
            {contractors.map((contractor) => (
              <option key={contractor} value={contractor}>
                {contractor}
              </option>
            ))}
          </select>
        </div>

        {loading && (
          <p
            style={{
              color: T.textSecondary,
            }}
          >
            Loading Analytics...
          </p>
        )}

        {analytics && (
          <>
                      {/* Summary Cards */}

                      <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(200px,1fr))",
                gap: "1rem",
                marginBottom: "2rem",
              }}
            >
              <div
                style={{
                  background: T.surface,
                  border: `1px solid ${T.border}`,
                  borderRadius: 12,
                  padding: "1rem",
                }}
              >
                <p
                  style={{
                    color: T.textMuted,
                    fontSize: 12,
                    margin: 0,
                  }}
                >
                  TOTAL REWORKS
                </p>

                <h2
                  style={{
                    color: T.textPrimary,
                    marginTop: 8,
                    marginBottom: 0,
                  }}
                >
                  {analytics.total_reworks}
                </h2>
              </div>

              <div
                style={{
                  background: T.surface,
                  border: `1px solid ${T.border}`,
                  borderRadius: 12,
                  padding: "1rem",
                }}
              >
                <p
                  style={{
                    color: T.textMuted,
                    fontSize: 12,
                    margin: 0,
                  }}
                >
                  CONTRACTOR
                </p>

                <h2
                  style={{
                    color: T.textPrimary,
                    marginTop: 8,
                    marginBottom: 0,
                  }}
                >
                  {analytics.contractor}
                </h2>
              </div>

              <div
                style={{
                  background: T.surface,
                  border: `1px solid ${T.border}`,
                  borderRadius: 12,
                  padding: "1rem",
                }}
              >
                <p
                  style={{
                    color: T.textMuted,
                    fontSize: 12,
                    margin: 0,
                  }}
                >
                  MOST COMMON DEFECT
                </p>

                <h2
                  style={{
                    color: T.textPrimary,
                    marginTop: 8,
                    marginBottom: 0,
                  }}
                >
                  {analytics.most_common_defect}
                </h2>
              </div>

              <div
                style={{
                  background: T.surface,
                  border: `1px solid ${T.border}`,
                  borderRadius: 12,
                  padding: "1rem",
                }}
              >
                <p
                  style={{
                    color: T.textMuted,
                    fontSize: 12,
                    margin: 0,
                  }}
                >
                  LAST INSPECTION
                </p>

                <h2
                  style={{
                    color: T.textPrimary,
                    marginTop: 8,
                    marginBottom: 0,
                    fontSize: 20,
                  }}
                >
                  {analytics.last_inspection}
                </h2>
              </div>
            </div>
                        {/* Defect Distribution */}

                        <div
              style={{
                background: T.surface,
                border: `1px solid ${T.border}`,
                borderRadius: 12,
                padding: "1.5rem",
                marginBottom: "2rem",
              }}
            >
              <h2
                style={{
                  color: T.textPrimary,
                  marginTop: 0,
                  marginBottom: "1.5rem",
                }}
              >
                Defect Distribution
              </h2>

              {Object.entries(analytics.defects).map(([defect, count]) => {
                const percentage =
                  (count / analytics.total_reworks) * 100;

                return (
                  <div
                    key={defect}
                    style={{
                      marginBottom: "1rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        color: T.textSecondary,
                        marginBottom: 6,
                      }}
                    >
                      <span>{defect}</span>

                      <span>
                        {count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>

                    <div
                      style={{
                        height: 10,
                        background: "#162032",
                        borderRadius: 20,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${percentage}%`,
                          height: "100%",
                          background: T.blue,
                          borderRadius: 20,
                          transition: "0.4s",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Charts & Summary */}

<div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1.5rem",
    marginBottom: "2rem",
  }}
>
  <ContractorPieChart
    defects={analytics.defects}
  />

  <div
    style={{
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: 12,
      padding: "1.5rem",
    }}
  >
    <h2
      style={{
        color: T.textPrimary,
        marginTop: 0,
        marginBottom: "1rem",
      }}
    >
      Defect Summary
    </h2>

    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
      }}
    >
      <thead>

        <tr>

          <th
            style={{
              textAlign: "left",
              color: T.textSecondary,
            }}
          >
            Defect
          </th>

          <th
            style={{
              textAlign: "right",
              color: T.textSecondary,
            }}
          >
            Count
          </th>

        </tr>

      </thead>

      <tbody>

        {Object.entries(analytics.defects).map(
          ([defect, count]) => (

            <tr key={defect}>

              <td
                style={{
                  padding: "10px 0",
                  color: T.textPrimary,
                  borderTop: `1px solid ${T.border}`,
                }}
              >
                {defect}
              </td>

              <td
                style={{
                  padding: "10px 0",
                  textAlign: "right",
                  color: T.textPrimary,
                  borderTop: `1px solid ${T.border}`,
                }}
              >
                {count}
              </td>

            </tr>

          )
        )}

        <tr>

          <td
            style={{
              paddingTop: 15,
              fontWeight: "bold",
              color: T.textPrimary,
              borderTop: `2px solid ${T.border}`,
            }}
          >
            TOTAL
          </td>

          <td
            style={{
              paddingTop: 15,
              textAlign: "right",
              fontWeight: "bold",
              color: T.textPrimary,
              borderTop: `2px solid ${T.border}`,
            }}
          >
            {analytics.total_reworks}
          </td>

        </tr>

      </tbody>

    </table>

  </div>

</div>
          </>
        )}
      </div>
    </div>
  );
}