import { useState, useEffect } from "react";
import api from "../api/api";
import { DEFECT_CODES } from "../constants/defectCodes";

const T = {
  bg: "#0F172A",
  surface: "#1E293B",
  surfaceDeep: "#162032",
  border: "#2D3F55",
  borderFocus: "#3B82F6",
  textPrimary: "#F1F5F9",
  textSecondary: "#94A3B8",
  textMuted: "#64748B",
  blue: "#3B82F6",
  green: "#22C55E",
  greenDim: "rgba(34,197,94,0.12)",
  red: "#E34948",
  redDim: "rgba(227,73,72,0.12)",
};

const PLANTS = [
  "Plant 1",
  "Plant 2",
  "plant 2A",
  "Plant 3",
  "Plant 4",
];




const EMPTY = {
  plant: "Plant 1",
  contractor: "",
  mark_no: "",
  defect_code: "HOP",
  remarks: "",
  inspection_date: new Date().toISOString().split("T")[0],
};

const inputStyle = (focused) => ({
  width: "100%",
  boxSizing: "border-box",
  background: T.surfaceDeep,
  border: `1px solid ${focused ? T.borderFocus : T.border}`,
  borderRadius: 8,
  padding: "9px 12px",
  fontSize: 13,
  color: T.textPrimary,
  fontFamily: "'Inter', sans-serif",
  outline: "none",
  transition: "0.2s",
});

function Field({ label, hint, children }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 5,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <label
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.6px",
            textTransform: "uppercase",
            color: T.textMuted,
          }}
        >
          {label}
        </label>

        {hint && (
          <span
            style={{
              fontSize: 11,
              color: T.textMuted,
            }}
          >
            {hint}
          </span>
        )}
      </div>

      {children}
    </div>
  );
}

export default function AddRework() {
  const [formData, setFormData] = useState(EMPTY);
  const [contractors, setContractors] = useState([]);
  const [focused, setFocused] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const focusProps = (name) => ({
    onFocus: () => setFocused(name),
    onBlur: () => setFocused(""),
  });
  useEffect(() => {

  loadContractors();

}, []);

const loadContractors = async () => {
  try {
    const res = await api.get("/contractors");

    console.log(res.data);      // ADD THIS

    setContractors(res.data);

    if (res.data.length > 0) {
      setFormData((prev) => ({
        ...prev,
        contractor: res.data[0].contractor_name,
      }));
    }

  } catch (err) {
    console.log(err);
  }

};

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setStatus(null);

    try {
      await api.post("/rework", formData);

      setStatus("success");
      setFormData(EMPTY);
    } catch (err) {
      console.log(err.response);
    
      if (err.response) {
        console.log(err.response.data);
      }
    
      setStatus("error");
    
    } finally {
      setLoading(false);

      setTimeout(() => {
        setStatus(null);
      }, 3000);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: T.bg,
        padding: "2rem",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600&display=swap');

        @keyframes fade {
          from {
            opacity:0;
            transform:translateY(8px);
          }

          to{
            opacity:1;
            transform:none;
          }
        }

        @keyframes spin{
          to{
            transform:rotate(360deg);
          }
        }

        option{
          background:#1E293B;
          color:white;
        }
      `}</style>

      <div
        style={{
          maxWidth: 560,
          margin: "0 auto",
        }}
      >
                {/* Header */}

                <div style={{ marginBottom: "1.8rem" }}>
          <p
            style={{
              margin: 0,
              color: T.textMuted,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.8px",
              textTransform: "uppercase",
            }}
          >
            Welding Quality Management
          </p>

          <h1
            style={{
              marginTop: 5,
              color: T.textPrimary,
              fontSize: 28,
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            Add Rework Entry
          </h1>
        </div>

        {/* Card */}

        <form
          onSubmit={handleSubmit}
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 16,
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 18,
            animation: "fade .3s ease",
          }}
        >

          {/* Plant + Contractor */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            <Field label="Plant">
              <select
                name="plant"
                value={formData.plant}
                onChange={handleChange}
                style={{
                  ...inputStyle(focused === "plant"),
                  cursor: "pointer",
                }}
                {...focusProps("plant")}
              >
                {PLANTS.map((plant) => (
                  <option key={plant} value={plant}>
                    {plant}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Contractor">
              <select
                name="contractor"
                value={formData.contractor}
                onChange={handleChange}
                style={{
                  ...inputStyle(focused === "contractor"),
                  cursor: "pointer",
                }}
                {...focusProps("contractor")}
              >
               {contractors.map((contractor) => (
  <option
    key={contractor.id}
    value={contractor.contractor_name}
  >
    {contractor.contractor_name}
  </option>
))}
              </select>
            </Field>
          </div>

          {/* Mark No */}

          <Field label="Mark Number" hint="Required">
            <input
              type="text"
              name="mark_no"
              placeholder="Example : B102"
              value={formData.mark_no}
              onChange={handleChange}
              style={inputStyle(focused === "mark_no")}
              {...focusProps("mark_no")}
              required
            />
          </Field>

          {/* Defect Code */}

          <Field label="Defect Code">
            <select
              name="defect_code"
              value={formData.defect_code}
              onChange={handleChange}
              style={{
                ...inputStyle(focused === "defect_code"),
                cursor: "pointer",
              }}
              {...focusProps("defect_code")}
            >
              {DEFECT_CODES.map((item) => (
                <option
                  key={item.code}
                  value={item.code}
                >
                  {item.code} - {item.label}
                </option>
              ))}
            </select>
          </Field>

          {/* Remarks */}

          <Field label="Remarks">
            <textarea
              rows={4}
              name="remarks"
              placeholder="Enter remarks..."
              value={formData.remarks}
              onChange={handleChange}
              style={{
                ...inputStyle(focused === "remarks"),
                resize: "vertical",
                minHeight: 100,
              }}
              {...focusProps("remarks")}
            />
          </Field>

          {/* Inspection Date */}

          <Field label="Inspection Date">
            <input
              type="date"
              name="inspection_date"
              value={formData.inspection_date}
              onChange={handleChange}
              style={{
                ...inputStyle(focused === "inspection_date"),
                colorScheme: "dark",
              }}
              {...focusProps("inspection_date")}
            />
          </Field>

          <div
            style={{
              borderTop: `1px solid ${T.border}`,
            }}
          />
                    {/* Status Banner */}

                    {status && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                background:
                  status === "success"
                    ? T.greenDim
                    : T.redDim,
                border: `1px solid ${
                  status === "success"
                    ? "rgba(34,197,94,.30)"
                    : "rgba(227,73,72,.30)"
                }`,
                color:
                  status === "success"
                    ? T.green
                    : T.red,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {status === "success"
                ? "✓ Rework Entry Saved Successfully"
                : "✕ Unable to Save Rework Entry"}
            </div>
          )}

          {/* Save Button */}

          <button
            type="submit"
            disabled={
              loading ||
              formData.mark_no.trim() === ""
            }
            style={{
              width: "100%",
              border: "none",
              borderRadius: 8,
              padding: "12px",
              cursor:
                loading ||
                formData.mark_no.trim() === ""
                  ? "not-allowed"
                  : "pointer",
              background:
                loading ||
                formData.mark_no.trim() === ""
                  ? T.border
                  : T.blue,
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              fontFamily:
                "'Space Grotesk', sans-serif",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 10,
            }}
          >
            {loading ? (
              <>
                <span
                  style={{
                    width: 14,
                    height: 14,
                    border: "2px solid rgba(255,255,255,.30)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    display: "inline-block",
                    animation:
                      "spin .7s linear infinite",
                  }}
                />
                Saving...
              </>
            ) : (
              "Save Rework Entry"
            )}
          </button>

        </form>

      </div>

    </div>
  );
}