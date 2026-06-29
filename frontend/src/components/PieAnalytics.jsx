import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
  } from "recharts";
  
  const COLORS = [
    "#3B82F6",
    "#22C55E",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#06B6D4",
  ];
  
  function PieAnalytics({ title, data }) {
  
    const chartData = data.map((item, index) => ({
      name: item.label,
      value: item.count,
      color: COLORS[index % COLORS.length],
    }));
  
    const total = chartData.reduce(
      (sum, item) => sum + item.value,
      0
    );
  
    return (
      <div
        style={{
          background: "#1E293B",
          border: "1px solid #2D3F55",
          borderRadius: 14,
          padding: "1.5rem",
        }}
      >
        <h3
          style={{
            color: "#F1F5F9",
            marginBottom: "1rem",
          }}
        >
          {title}
        </h3>
  
        <div
          style={{
            width: "100%",
            height: 320,
          }}
        >
          <ResponsiveContainer>
  
            <PieChart>
  
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={3}
                label
              >
  
                {
                  chartData.map((entry, index) => (
  
                    <Cell
                      key={index}
                      fill={entry.color}
                    />
  
                  ))
                }
  
              </Pie>
  
              <Tooltip />
  
              <Legend />
  
            </PieChart>
  
          </ResponsiveContainer>
  
        </div>
  
        <div
          style={{
            marginTop: 10,
            textAlign: "center",
            color: "#94A3B8",
          }}
        >
          Total : {total}
        </div>
  
      </div>
    );
  }
  
  export default PieAnalytics;