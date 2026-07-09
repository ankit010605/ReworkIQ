import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend,
  } from "recharts";
  
  const COLORS = [
    "#3B82F6",
    "#22C55E",
    "#F59E0B",
    "#E34948",
    "#8B5CF6",
    "#06B6D4",
    "#84CC16",
    "#F97316",
  ];
  
  const T = {
    surface: "#1E293B",
    border: "#2D3F55",
    textPrimary: "#F1F5F9",
  };
  
  export default function ContractorPieChart({
    defects,
  }) {
  
    const data = Object.entries(defects).map(
      ([name, value]) => ({
        name,
        value,
      })
    );
  
    return (
  
      <div
        style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 12,
          padding: "1.5rem",
          height: 420,
        }}
      >
  
        <h2
          style={{
            color: T.textPrimary,
            marginTop: 0,
            marginBottom: 20,
          }}
        >
          Defect Distribution
        </h2>
  
        <ResponsiveContainer
          width="100%"
          height="90%"
        >
  
          <PieChart>
  
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              outerRadius={120}
              label
            >
  
              {
  
                data.map(
                  (_, index) => (
  
                    <Cell
                      key={index}
                      fill={
                        COLORS[
                          index %
                          COLORS.length
                        ]
                      }
                    />
  
                  )
                )
  
              }
  
            </Pie>
  
            <Tooltip />
  
            <Legend />
  
          </PieChart>
  
        </ResponsiveContainer>
  
      </div>
  
    );
  
  }