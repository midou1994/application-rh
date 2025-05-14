import React from "react";
import LoginPage from "./LoginPage";
import RecoverPassword from "./RecoverPassword";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CreateUserForm from "./CreateUserForm";
import Dashboard from "./Dashboard";
import Conges from './gestion_de_conge/Conges';
import JourFeries from './gestion_de_conge/JourFeries';
import DemandesConge from './gestion_de_conge/demandeconge';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/recover-password" element={<RecoverPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
          <Route path="conges" element={<Conges />} />
          <Route path="jours-feries" element={<JourFeries />} />
          <Route path="demandes-conge" element={<DemandesConge />} />
        <Route path="/create-user" element={<CreateUserForm />} />
      </Routes>
    </Router>
  );
}


export default App;


