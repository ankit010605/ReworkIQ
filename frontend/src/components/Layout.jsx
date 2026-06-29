import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const T = {
  bg:      "#0F172A",
  surface: "#1E293B",
  border:  "#2D3F55",
};

function Layout({ children }) {
  return (
    <div style={{
      display:    "flex",
      minHeight:  "100vh",
      background: T.bg,
      fontFamily: "'Inter', sans-serif",
    }}>

      {/* Sidebar */}
      <aside style={{
        width:       220,
        flexShrink:  0,
        background:  T.surface,
        borderRight: `1px solid ${T.border}`,
        position:    "sticky",
        top:         0,
        height:      "100vh",
        overflowY:   "auto",
      }}>
        <Sidebar />
      </aside>

      {/* Main section */}
      <div style={{
        flex:           1,
        display:        "flex",
        flexDirection:  "column",
        minWidth:       0,
      }}>

        {/* Navbar */}
        <header style={{
          position:     "sticky",
          top:          0,
          zIndex:       10,
          background:   T.surface,
          borderBottom: `1px solid ${T.border}`,
        }}>
          <Navbar />
        </header>

        {/* Page content */}
        <main style={{
          flex:       1,
          overflowY:  "auto",
          padding:    "1.75rem 2rem",
          boxSizing:  "border-box",
        }}>
          {children}
        </main>

      </div>
    </div>
  );
}

export default Layout;