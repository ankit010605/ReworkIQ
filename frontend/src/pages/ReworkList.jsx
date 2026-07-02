import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import ReworkTable from "../components/ReworkTable";

function ReworkList() {

  const navigate = useNavigate();

  const [reworks, setReworks] = useState([]);

  const [search, setSearch] = useState("");

  const [plant, setPlant] = useState("All");

  const [contractor, setContractor] = useState("All");

  const [defectCode, setDefectCode] = useState("All");

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

    return (

      textMatch &&

      plantMatch &&

      contractorMatch &&

      defectMatch

    );

  });

  return (

    <div>

      <h1>

        Rework Records

      </h1>

      <div className="filters">

        <input

          placeholder="Search Mark No / Contractor / Defect"

          value={search}

          onChange={(e) =>

            setSearch(e.target.value)

          }

        />

        <select

          value={plant}

          onChange={(e) =>

            setPlant(e.target.value)

          }

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

          onChange={(e) =>

            setContractor(e.target.value)

          }

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

          onChange={(e) =>

            setDefectCode(e.target.value)

          }

        >

          {

            defectCodes.map((d) => (

              <option key={d}>

                {d}

              </option>

            ))

          }

        </select>
        

</div>

<div
  style={{
    marginTop: 20,
    marginBottom: 12,
    fontSize: 14,
    fontWeight: 600,
  }}
>
  Total Records : {filtered.length}
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