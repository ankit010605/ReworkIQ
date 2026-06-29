import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import ReworkTable from "../components/ReworkTable";


function ReworkList() {

  const [reworks,setReworks] = useState([]);

  const [search,setSearch] = useState("");

  const [contractor,setContractor] = useState("All");

  const [reason,setReason] = useState("All");
  const navigate = useNavigate();


  const fetchReworks = async()=>{

    const response = await api.get("/rework");

    setReworks(response.data);

  };


  useEffect(()=>{

    fetchReworks();

  },[]);
  const editRework = (id) => {

    navigate(`/edit/${id}`);
  
  };


  const deleteRework = async(id)=>{

    const confirmDelete =
      window.confirm(
        "Delete this record?"
      );


    if(!confirmDelete)
      return;


    await api.delete(
      `/rework/${id}`
    );


    fetchReworks();

  };



  const contractors = [
    "All",
    ...new Set(
      reworks.map(
        item=>item.contractor
      )
    )
  ];


  const reasons = [
    "All",
    ...new Set(
      reworks.map(
        item=>item.reason
      )
    )
  ];



  const filtered = reworks.filter(item=>{


    const textMatch =
      item.mark_no
      .toLowerCase()
      .includes(
        search.toLowerCase()
      )
      ||
      item.project_name
      .toLowerCase()
      .includes(
        search.toLowerCase()
      );


    const contractorMatch =
      contractor==="All"
      ||
      item.contractor===contractor;


    const reasonMatch =
      reason==="All"
      ||
      item.reason===reason;



    return (
      textMatch
      &&
      contractorMatch
      &&
      reasonMatch
    );


  });



return (

<div>

<h1>
Rework Records
</h1>



<div className="filters">


<input

placeholder="Search Mark / Project"

value={search}

onChange={
e=>setSearch(e.target.value)
}

/>



<select

value={contractor}

onChange={
e=>setContractor(e.target.value)
}

>

{
contractors.map(c=>(

<option key={c}>
{c}
</option>

))
}


</select>




<select

value={reason}

onChange={
e=>setReason(e.target.value)
}

>

{
reasons.map(r=>(

<option key={r}>
{r}
</option>

))
}


</select>


</div>



<ReworkTable

data={filtered}

onDelete={deleteRework}

onEdit={editRework}

/>


</div>

)

}


export default ReworkList;