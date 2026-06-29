function ReworkTable({ data, onDelete, onEdit }) {

    return (
  
      <table className="rework-table">
  
        <thead>
  
          <tr>
  
            <th>ID</th>
            <th>Mark No.</th>
            <th>Project</th>
            <th>Contractor</th>
            <th>Reason</th>
            <th>Date</th>
            <th>Action</th>
  
          </tr>
  
        </thead>
  
        <tbody>
  
          {data.length === 0 ? (
  
            <tr>
  
              <td
                colSpan="7"
                className="empty-table"
              >
  
                No rework records found.
  
              </td>
  
            </tr>
  
          ) : (
  
            data.map((item) => (
  
              <tr key={item.id}>
  
                <td>{item.id}</td>
                <td>{item.mark_no}</td>
                <td>{item.project_name}</td>
                <td>{item.contractor}</td>
                <td>{item.reason}</td>
                <td>{item.rework_date}</td>
  
                <td>
  
                  <button
                    className="edit-btn"
                    onClick={() => onEdit(item.id)}
                  >
                    Edit
                  </button>
  
                  <button
                    className="delete-btn"
                    onClick={() => onDelete(item.id)}
                  >
                    Delete
                  </button>
  
                </td>
  
              </tr>
  
            ))
  
          )}
  
        </tbody>
  
      </table>
  
    );
  
  }
  
  export default ReworkTable;