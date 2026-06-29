function DashboardGrid({ children }) {
    return (
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))",
        gap: 12,
        marginBottom: "1.75rem",
      }}>
        {children}
      </div>
    );
  }
  
  export default DashboardGrid;