import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import api from "../api/api";
import ReworkTable from "../components/ReworkTable";
const T = {
  bg: "#0F172A",
  surface: "#1E293B",
  surfaceDeep: "#162032",
  border: "#2D3F55",
  textPrimary: "#F1F5F9",
  textSecondary: "#94A3B8",
  textMuted: "#64748B",
  blue: "#3B82F6",
};

function ReworkList() {

  const navigate = useNavigate();

  const [reworks, setReworks] = useState([]);

  const [search, setSearch] = useState("");

  const [plant, setPlant] = useState("All");

  const [contractor, setContractor] = useState("All");

  const [defectCode, setDefectCode] = useState("All");

  const [dateFilter, setDateFilter] = useState("All");

  const fetchReworks = async () => {

    try {

      const response = await api.get("/rework");

      setReworks(response.data);

    } catch (error) {

      console.error(error);

    }

  };

  useEffect(() => {

    fetchReworks();

  }, []);

  const editRework = (id) => {

    navigate(`/edit/${id}`);

  };

  const deleteRework = async (id) => {

    const confirmDelete = window.confirm(
      "Delete this rework record?"
    );

    if (!confirmDelete) return;

    try {

      await api.delete(`/rework/${id}`);

      fetchReworks();

    } catch (error) {

      console.error(error);

    }

  };

  const plants = useMemo(() => [

    "All",

    ...new Set(
      reworks.map(item => item.plant)
    ),

  ], [reworks]);

  const contractors = useMemo(() => [

    "All",

    ...new Set(
      reworks.map(item => item.contractor)
    ),

  ], [reworks]);

  const defectCodes = useMemo(() => [

    "All",

    ...new Set(
      reworks.map(item => item.defect_code)
    ),

  ], [reworks]);

  const filtered = reworks.filter((item) => {

    const keyword = search.toLowerCase();

    const textMatch =

      item.mark_no.toLowerCase().includes(keyword)

      ||

      item.contractor.toLowerCase().includes(keyword)

      ||

      item.defect_code.toLowerCase().includes(keyword);

    const plantMatch =

      plant === "All"

      ||

      item.plant === plant;

    const contractorMatch =

      contractor === "All"

      ||

      item.contractor === contractor;

    const defectMatch =

      defectCode === "All"

      ||

      item.defect_code === defectCode;
      const today = new Date();

const itemDate = new Date(item.inspection_date);

const todayMatch =
  itemDate.toDateString() === today.toDateString();

  const diffDays = (today - itemDate) / (1000 * 60 * 60 * 24);

  const last7DaysMatch =
    diffDays >= 0 && diffDays <= 7;

const thisMonthMatch =
  itemDate.getMonth() === today.getMonth() &&
  itemDate.getFullYear() === today.getFullYear();

const thisYearMatch =
  itemDate.getFullYear() === today.getFullYear();

const dateMatch =
  dateFilter === "All" ||

  (dateFilter === "Today" && todayMatch) ||

  (dateFilter === "Last 7 Days" && last7DaysMatch) ||

  (dateFilter === "This Month" && thisMonthMatch) ||

  (dateFilter === "This Year" && thisYearMatch);

    return (

      textMatch &&

      plantMatch &&

      contractorMatch &&

      defectMatch &&

      dateMatch

    );

  });
  const exportToExcel = () => {

    if (filtered.length === 0) {
      alert("No records to export");
      return;
    }
  
    const worksheet = XLSX.utils.json_to_sheet(filtered);
  
    const workbook = XLSX.utils.book_new();
  
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Rework Records"
    );
  
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
  
    const file = new Blob(
      [excelBuffer],
      {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }
    );
  
    saveAs(
      file,
      "Rework_Records.xlsx"
    );
  };

  return (

    <div>

<h1
  style={{
    color: T.textPrimary,
    fontFamily: "'Space Grotesk', sans-serif",
    marginBottom: "1.5rem",
  }}
>
  Rework Records
</h1>
      <div className="filters">

        <input
  style={{
    background: T.surface,
    color: T.textPrimary,
    border: `1px solid ${T.border}`,
    borderRadius: 8,
    padding: "10px",
  }}

          placeholder="Search Mark No / Contractor / Defect"

          value={search}

          onChange={(e) =>

            setSearch(e.target.value)

          }

        />

<select
  value={plant}
  onChange={(e) => setPlant(e.target.value)}
  style={{
    background: T.surface,
    color: T.textPrimary,
    border: `1px solid ${T.border}`,
    borderRadius: 8,
    padding: "10px",
  }}
>

          {

            plants.map((p) => (

              <option key={p}>

                {p}

              </option>

            ))

          }

        </select>

        <select
  value={contractor}
  onChange={(e) => setContractor(e.target.value)}
  style={{
    background: T.surface,
    color: T.textPrimary,
    border: `1px solid ${T.border}`,
    borderRadius: 8,
    padding: "10px",
  }}
>

        

          {

            contractors.map((c) => (

              <option key={c}>

                {c}

              </option>

            ))

          }

        </select>

        <select
  value={defectCode}
  onChange={(e) => setDefectCode(e.target.value)}
  style={{
    background: T.surface,
    color: T.textPrimary,
    border: `1px solid ${T.border}`,
    borderRadius: 8,
    padding: "10px",
  }}
>

          {

            defectCodes.map((d) => (

              <option key={d}>

                {d}

              </option>

            ))

          }

        </select>

        <select
  value={dateFilter}
  onChange={(e) => setDateFilter(e.target.value)}
  style={{
    background: T.surface,
    color: T.textPrimary,
    border: `1px solid ${T.border}`,
    borderRadius: 8,
    padding: "10px",
  }}
>
          <option value="All">All Time</option>
          <option value="Today">Today</option>
          <option value="Last 7 Days">Last 7 Days</option>
          <option value="This Month">This Month</option>
          <option value="This Year">This Year</option>
        </select>

</div>


<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  }}
>
  <div
    style={{
      color: T.textPrimary,
      fontWeight: 600,
    }}
  >
    Total Records : {filtered.length}
  </div>

  <button
    onClick={exportToExcel}
    style={{
      background: "#22C55E",
      color: "white",
      border: "none",
      padding: "10px 18px",
      borderRadius: 8,
      cursor: "pointer",
      fontWeight: 600,
    }}
  >
    Export Excel
  </button>
</div>

<ReworkTable

  data={filtered}

  onEdit={editRework}

  onDelete={deleteRework}

/>

</div>

);

}

export default ReworkList;