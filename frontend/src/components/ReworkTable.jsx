function ReworkTable({ data, onDelete, onEdit }) {
  return (
    <div
      style={{
        overflowX: "auto",
        marginTop: 20,
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "#1E293B",
          color: "#F8FAFC",
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        <thead>
          <tr
            style={{
              background: "#0F172A",
            }}
          >
            <th style={th}>ID</th>
            <th style={th}>Plant</th>
            <th style={th}>Contractor</th>
            <th style={th}>Mark No.</th>
            <th style={th}>Defect Code</th>
            <th style={th}>Remarks</th>
            <th style={th}>Inspection Date</th>
            <th style={th}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan="8"
                style={{
                  padding: 25,
                  textAlign: "center",
                  color: "#94A3B8",
                }}
              >
                No Rework Records Found
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr
                key={item.id}
                style={{
                  borderBottom: "1px solid #334155",
                }}
              >
                <td style={td}>{item.id}</td>

                <td style={td}>{item.plant}</td>

                <td style={td}>{item.contractor}</td>

                <td style={td}>{item.mark_no}</td>

                <td style={td}>{item.defect_code}</td>

                <td style={td}>
                  {item.remarks || "-"}
                </td>

                <td style={td}>
                  {item.inspection_date}
                </td>

                <td style={td}>
                  <button
                    onClick={() => onEdit(item.id)}
                    style={editBtn}
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => onDelete(item.id)}
                    style={deleteBtn}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

const th = {
  padding: "12px",
  textAlign: "left",
  fontSize: "13px",
  fontWeight: "600",
  borderBottom: "1px solid #334155",
};

const td = {
  padding: "12px",
  fontSize: "13px",
};

const editBtn = {
  background: "#3B82F6",
  color: "white",
  border: "none",
  borderRadius: "6px",
  padding: "6px 12px",
  cursor: "pointer",
  marginRight: "8px",
};

const deleteBtn = {
  background: "#DC2626",
  color: "white",
  border: "none",
  borderRadius: "6px",
  padding: "6px 12px",
  cursor: "pointer",
};

export default ReworkTable;