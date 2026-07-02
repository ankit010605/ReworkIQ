import { useRef, useState } from "react";
import api from "../api/api";

const T = {
  bg: "#0F172A",
  surface: "#1E293B",
  border: "#2D3F55",
  textPrimary: "#F1F5F9",
  textSecondary: "#94A3B8",
  textMuted: "#64748B",
  blue: "#3B82F6",
  green: "#22C55E",
  red: "#EF4444",
};

export default function ImportExcel() {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  function pickFile(selected) {
    if (!selected) return;

    const validExt = /\.(xlsx|xls)$/i.test(selected.name);
    if (!validExt) {
      setError("Only .xlsx or .xls files are supported.");
      return;
    }

    setError("");
    setResult(null);
    setFile(selected);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragActive(false);
    pickFile(e.dataTransfer.files?.[0]);
  }

  function clearFile() {
    setFile(null);
    setResult(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  }

  async function uploadExcel() {
    if (!file) return;

    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await api.post("/rework/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Import failed. Please check the file and try again.");
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
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <p
            style={{
              color: T.textMuted,
              fontSize: 12,
              margin: 0,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            ReworkIQ
          </p>
          <h1 style={{ color: T.textPrimary, marginTop: 5 }}>
            Import Excel
          </h1>
          <p style={{ color: T.textSecondary, marginTop: 6, fontSize: 14 }}>
            Upload a rework log to bulk-import records. Required columns:
            Plant, Contractor, Mark No, Defect Code, Remarks, Inspection Date.
          </p>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          style={{
            background: T.surface,
            border: `2px dashed ${dragActive ? T.blue : T.border}`,
            borderRadius: 12,
            padding: "2.5rem",
            textAlign: "center",
            cursor: "pointer",
            transition: "0.2s",
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => pickFile(e.target.files?.[0])}
            style={{ display: "none" }}
          />

          {!file ? (
            <>
              <div style={{ fontSize: 34, marginBottom: 10 }}>📄</div>
              <p style={{ color: T.textPrimary, fontWeight: 600, margin: 0 }}>
                Drag & drop your Excel file here
              </p>
              <p style={{ color: T.textMuted, fontSize: 13, marginTop: 6 }}>
                or click to browse — .xlsx or .xls
              </p>
            </>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#162032",
                border: `1px solid ${T.border}`,
                borderRadius: 8,
                padding: "0.9rem 1.1rem",
                textAlign: "left",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 22 }}>📊</span>
                <div>
                  <p
                    style={{
                      color: T.textPrimary,
                      margin: 0,
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    {file.name}
                  </p>
                  <p style={{ color: T.textMuted, margin: 0, fontSize: 12 }}>
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>

              <button
                onClick={clearFile}
                style={{
                  background: "transparent",
                  border: "none",
                  color: T.textMuted,
                  fontSize: 18,
                  cursor: "pointer",
                  padding: "4px 8px",
                }}
                title="Remove file"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {error && (
          <p style={{ color: T.red, fontSize: 13, marginTop: 10 }}>{error}</p>
        )}

        {/* Upload action */}
        <button
          onClick={uploadExcel}
          disabled={!file || loading}
          style={{
            width: "100%",
            marginTop: "1.25rem",
            padding: "0.9rem",
            borderRadius: 8,
            border: "none",
            fontSize: 15,
            fontWeight: 600,
            color: "white",
            cursor: !file || loading ? "not-allowed" : "pointer",
            background: !file || loading ? T.textMuted : T.blue,
            transition: "0.2s",
          }}
        >
          {loading ? "Importing…" : "Upload Excel"}
        </button>

        {/* Results */}
        {result && (
          <div style={{ marginTop: "2rem" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
                marginBottom: "1.5rem",
              }}
            >
              <div
                style={{
                  background: T.surface,
                  border: `1px solid ${T.border}`,
                  borderRadius: 12,
                  padding: "1.25rem",
                }}
              >
                <p style={{ color: T.textMuted, fontSize: 12, margin: 0 }}>
                  IMPORTED
                </p>
                <h2
                  style={{
                    color: T.green,
                    marginTop: 8,
                    marginBottom: 0,
                  }}
                >
                  {result.imported}
                </h2>
              </div>

              <div
                style={{
                  background: T.surface,
                  border: `1px solid ${T.border}`,
                  borderRadius: 12,
                  padding: "1.25rem",
                }}
              >
                <p style={{ color: T.textMuted, fontSize: 12, margin: 0 }}>
                  SKIPPED
                </p>
                <h2
                  style={{
                    color: result.skipped > 0 ? T.red : T.textPrimary,
                    marginTop: 8,
                    marginBottom: 0,
                  }}
                >
                  {result.skipped}
                </h2>
              </div>
            </div>

            {result.errors?.length > 0 && (
              <div
                style={{
                  background: T.surface,
                  border: `1px solid ${T.border}`,
                  borderRadius: 12,
                  padding: "1.25rem",
                }}
              >
                <h3
                  style={{
                    color: T.textPrimary,
                    fontSize: 14,
                    marginTop: 0,
                    marginBottom: "1rem",
                  }}
                >
                  Rows skipped
                </h3>

                {result.errors.map((e, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "8px 0",
                      borderBottom:
                        i < result.errors.length - 1
                          ? `1px solid ${T.border}`
                          : "none",
                      fontSize: 13,
                    }}
                  >
                    <span style={{ color: T.textSecondary }}>
                      Row {e.row}
                    </span>
                    <span style={{ color: T.red }}>{e.error}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}