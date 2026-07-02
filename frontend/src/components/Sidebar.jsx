import { NavLink } from "react-router-dom";
import { FaIndustry } from "react-icons/fa";
import {
  FaChartBar,
  FaClipboardList,
  FaPlusCircle,
  FaUserTie,
} from "react-icons/fa";
import { FaFileExcel } from "react-icons/fa";

const T = {
  textPrimary:   "#F1F5F9",
  textSecondary: "#94A3B8",
  textMuted:     "#64748B",
  blue:          "#3B82F6",
  blueDim:       "rgba(59,130,246,0.12)",
  border:        "#2D3F55",
  surface:       "#1E293B",
};

const NAV_ITEMS = [
  {
    to: "/",
    icon: <FaChartBar size={15} />,
    label: "Dashboard",
  },

  {
    to: "/add",
    icon: <FaPlusCircle size={15} />,
    label: "Add Rework",
  },

  {
    to: "/list",
    icon: <FaClipboardList size={15} />,
    label: "Rework List",
  },
  {
    to: "/plant-analytics",
    icon: <FaIndustry size={15} />,
    label: "Plant Analytics",
  },

  {
    to: "/contractor-analytics",
    icon: <FaUserTie size={15} />,
    label: "Contractor Analytics",
  },
  {
    to: "/import",
    icon: <FaFileExcel size={15} />,
    label: "Import Excel",
},
];
function Sidebar() {
  return (
    <div style={{
      display:        "flex",
      flexDirection:  "column",
      height:         "100%",
      padding:        "1.25rem 0.75rem",
      boxSizing:      "border-box",
      fontFamily:     "'Inter', sans-serif",
    }}>

      {/* Logo */}
      <div style={{
        display:       "flex",
        alignItems:    "center",
        gap:           9,
        padding:       "0 0.5rem",
        marginBottom:  "2rem",
      }}>
        <div style={{
          width:          32,
          height:         32,
          borderRadius:   9,
          background:     T.blueDim,
          border:         `1px solid rgba(59,130,246,0.3)`,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          fontSize:       16,
          flexShrink:     0,
        }}>⚙</div>

        <div>
          <p style={{
            margin:        0,
            fontSize:      14,
            fontWeight:    700,
            color:         T.textPrimary,
            fontFamily:    "'Space Grotesk', sans-serif",
            lineHeight:    1.1,
            letterSpacing: "-0.2px",
          }}>ReworkIQ</p>
          <p style={{
            margin:        0,
            fontSize:      9,
            color:         T.textMuted,
            letterSpacing: "0.3px",
          }}>JSPL · SSD Plant</p>
        </div>
      </div>

      {/* Section label */}
      <p style={{
        fontSize:      10,
        fontWeight:    600,
        letterSpacing: "0.7px",
        textTransform: "uppercase",
        color:         T.textMuted,
        margin:        "0 0 6px 0.5rem",
      }}>Navigation</p>

      {/* Nav links */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            style={({ isActive }) => ({
              display:       "flex",
              alignItems:    "center",
              gap:           10,
              padding:       "8px 10px",
              borderRadius:  8,
              fontSize:      13,
              fontWeight:    isActive ? 600 : 400,
              color:         isActive ? T.blue : T.textSecondary,
              background:    isActive ? T.blueDim : "transparent",
              border:        isActive ? `1px solid rgba(59,130,246,0.2)` : "1px solid transparent",
              textDecoration: "none",
              transition:    "background 0.15s, color 0.15s",
            })}
          >
            <span style={{ flexShrink: 0, opacity: 0.85 }}>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Footer */}
      <div style={{
        borderTop:  `1px solid ${T.border}`,
        paddingTop: "0.75rem",
        marginTop:  "0.75rem",
      }}>
        <p style={{
          fontSize:  10,
          color:     T.textMuted,
          margin:    0,
          textAlign: "center",
          lineHeight: 1.6,
        }}>
          Welding &amp; Quality Division<br />
          <span style={{ color: T.textMuted, opacity: 0.6 }}>v1.0 · JSPL Raigarh</span>
        </p>
      </div>

    </div>
  );
}

export default Sidebar;