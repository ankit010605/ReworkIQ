import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

import api from "../api/api";

export default function ContractorMaster() {

  const [contractors, setContractors] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const loadContractors = async () => {
    const res = await api.get("/contractors");
    setContractors(res.data);
  };

  useEffect(() => {
    loadContractors();
  }, []);

  const addContractor = async () => {

    if (!name.trim()) return;
  
    setLoading(true);
  
    try {
  
      await api.post("/contractors", {
        contractor_name: name
      });
  
      setName("");
  
      loadContractors();
  
    } catch (err) {
  
      console.log(err);
  
    } finally {
  
      setLoading(false);
  
    }
  
  };

  return (
    <Box p={3}>

      <Typography variant="h4" gutterBottom>
        Contractor Master
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>

        <TextField
          fullWidth
          label="Contractor Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Button
  sx={{ mt: 2 }}
  variant="contained"
  onClick={addContractor}
  disabled={loading}
>
  {loading ? "Adding..." : "Add Contractor"}
</Button>

      </Paper>

      <Paper sx={{ p: 3 }}>

        <Typography variant="h6">
          Existing Contractors
        </Typography>

        <List>

          {contractors.map((c) => (

            <ListItem key={c.id}>

              <ListItemText
                primary={c.contractor_name}
              />

            </ListItem>

          ))}

        </List>

      </Paper>

    </Box>
  );
}