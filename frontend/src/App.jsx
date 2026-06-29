import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";

import Dashboard from "./pages/Dashboard";
import AddRework from "./pages/AddRework";
import ReworkList from "./pages/ReworkList";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add" element={<AddRework />} />
          <Route path="/list" element={<ReworkList />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;