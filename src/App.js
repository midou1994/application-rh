import React, { useEffect, useState } from "react";
import LoginPage from "./LoginPage";
import RecoverPassword from "./RecoverPassword";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import CreateUserForm from "./CreateUserForm";
import Dashboard from "./Dashboard";
import Conges from './gestion_de_conge/Conges';
import JourFeries from './gestion_de_conge/JourFeries';
import DemandesConge from './gestion_de_conge/demandeconge';
import EmployeeList from './gestion_des_personnels/EmployeeList';
import EmployeeForm from './gestion_des_personnels/EmployeeForm';
import EmployeeLayout from './employee/EmployeeLayout';
import EmployeeDashboard from './employee/EmployeeDashboard';
import EmployeeDemandes from './employee/EmployeeDemandes';
import EmployeeConges from './employee/EmployeeConges';
import EmployeeJoursFeries from './employee/JoursFeries';
import EditProfile from './employee/EditProfile';
import CandidatList from './gestion_des_personnels/CandidatList';
import CandidatForm from './gestion_des_personnels/CandidatForm';
import EntretienList from './gestion_des_personnels/EntretienList';
import EntretienForm from './gestion_des_personnels/EntretienForm';
import EmployeeCarriere from './employee/EmployeeCarriere';
import CarriereList from './gestion_de_carriere/CarriereList';

// Protected Route component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = JSON.parse(localStorage.getItem("loggedUser"));
      if (!storedUser?._id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/users/getuserBYID/${storedUser._id}`, {
          credentials: "include"
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'Employee' ? '/employee' : '/dashboard'} replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/recover-password" element={<RecoverPassword />} />
        <Route path="/create-user" element={<CreateUserForm />} />
        
        {/* Admin/RH Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['Admin', 'RH']}>
            <Dashboard />
          </ProtectedRoute>
        } />

        {/* Employee Routes */}
        <Route path="/employee" element={
          <ProtectedRoute allowedRoles={['Employe']}>
            <EmployeeLayout />
          </ProtectedRoute>
        }>
          <Route index element={<EmployeeDashboard />} />
          <Route path="dashboard" element={<EmployeeDashboard />} />
          <Route path="profile" element={<EditProfile />} />
          <Route path="demandes" element={<EmployeeDemandes />} />
          <Route path="conges" element={<EmployeeConges />} />
          <Route path="jours-feries" element={<EmployeeJoursFeries />} />
          <Route path="carriere" element={<EmployeeCarriere />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;


