import { useEffect, useState } from "react";
import api from "../api/api";
import PlantDefectPieChart from "../components/PlantDefectPieChart";
import PlantContractorPieChart from "../components/PlantContractorPieChart";

const T = {
  bg: "#0F172A",
  surface: "#1E293B",
  border: "#2D3F55",
  textPrimary: "#F1F5F9",
  textSecondary: "#94A3B8",
  textMuted: "#64748B",
  blue: "#3B82F6",
};

export default function PlantAnalytics() {
  const [plants, setPlants] = useState([]);
  const [selected, setSelected] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPlants();
  }, []);

  async function loadPlants() {
    try {
      const { data } = await api.get("/rework");
      const unique = [...new Set(data.map((item) => item.plant))];
      setPlants(unique);

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

  async function loadAnalytics(plant) {
    setLoading(true);
    try {
      const { data } = await api.get(`/analytics/plant/${plant}`);
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
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <p
            style={{
              color: T.textMuted,
              margin: 0,
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            ReworkIQ Analytics
          </p>

          <h1
            style={{
              color: T.textPrimary,
              marginTop: 6,
            }}
          >
            Plant Analytics
          </h1>
        </div>

        {/* Plant Selector */}
        <div
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 12,
            padding: "1.5rem",
            marginBottom: "1.5rem",
          }}
        >
          <label style={{ color: T.textSecondary, fontSize: 13 }}>
            Select Plant
          </label>

          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            style={{
              width: "100%",
              marginTop: 10,
              padding: 10,
              borderRadius: 8,
              background: "#162032",
              color: "white",
              border: `1px solid ${T.border}`,
            }}
          >
            {plants.map((plant) => (
              <option key={plant} value={plant}>
                {plant}
              </option>
            ))}
          </select>
        </div>

        {loading && (
          <p style={{ color: T.textSecondary }}>Loading Analytics...</p>
        )}

        {analytics && !loading && (
          <>
            {/* Charts */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1.5rem",
                marginBottom: "2rem",
              }}
            >
              <PlantDefectPieChart defects={analytics.defects} />
              <PlantContractorPieChart contractors={analytics.contractors} />
            </div>

            {/* Summary Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
                gap: "1rem",
                marginBottom: "2rem",
              }}
            >
              {/* Total Reworks */}
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
                    margin: 0,
                    fontSize: 12,
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

              {/* Plant */}
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
                    margin: 0,
                    fontSize: 12,
                  }}
                >
                  PLANT
                </p>
                <h2
                  style={{
                    color: T.textPrimary,
                    marginTop: 8,
                    marginBottom: 0,
                  }}
                >
                  {analytics.plant}
                </h2>
              </div>

              {/* Top Contractor */}
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
                    margin: 0,
                    fontSize: 12,
                  }}
                >
                  TOP CONTRACTOR
                </p>
                <h2
                  style={{
                    color: T.textPrimary,
                    marginTop: 8,
                    marginBottom: 0,
                  }}
                >
                  {analytics.top_contractor}
                </h2>
              </div>

              {/* Most Common Defect */}
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
                    margin: 0,
                    fontSize: 12,
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
            </div>
          </>
        )}
      </div>
    </div>
  );
}