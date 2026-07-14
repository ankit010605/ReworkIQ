import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";

import Dashboard from "./pages/Dashboard";
import AddRework from "./pages/AddRework";
import ReworkList from "./pages/ReworkList";
import ContractorAnalytics from "./pages/ContractorAnalytics";
import PlantAnalytics from "./pages/PlantAnalytics";
import ImportExcel from "./pages/ImportExcel";
import ContractorMaster from "./pages/ContractorMaster";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
        <Route
    path="/import"
    element={<ImportExcel />}
/>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add" element={<AddRework />} />
          <Route path="/list" element={<ReworkList />} />
          <Route path="/contractor-analytics" element={<ContractorAnalytics />} />
          <Route path="/plant-analytics" element={<PlantAnalytics />} />
          <Route
    path="/contractors"
    element={<ContractorMaster />}
/>
        </Routes>
     
      </Layout>
    </BrowserRouter>
  );
}

export default App;