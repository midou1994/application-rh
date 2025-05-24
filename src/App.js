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
import CandidatList from './gestion_des_personnels/CandidatList';
import CandidatForm from './gestion_des_personnels/CandidatForm';
import EntretienList from './gestion_des_personnels/EntretienList';
import EntretienForm from './gestion_des_personnels/EntretienForm';

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
        <Route path="/conges" element={
          <ProtectedRoute allowedRoles={['Admin', 'RH']}>
            <Conges />
          </ProtectedRoute>
        } />
        <Route path="/jours-feries" element={
          <ProtectedRoute allowedRoles={['Admin', 'RH']}>
            <JourFeries />
          </ProtectedRoute>
        } />
        <Route path="/demandes-conge" element={
          <ProtectedRoute allowedRoles={['Admin', 'RH']}>
            <DemandesConge />
          </ProtectedRoute>
        } />
        <Route path="/employes" element={
          <ProtectedRoute allowedRoles={['Admin', 'RH']}>
            <EmployeeList />
          </ProtectedRoute>
        } />
        <Route path="/employes/add" element={
          <ProtectedRoute allowedRoles={['Admin', 'RH']}>
            <EmployeeForm />
          </ProtectedRoute>
        } />
        <Route path="/employes/edit/:id" element={
          <ProtectedRoute allowedRoles={['Admin', 'RH']}>
            <EmployeeForm />
          </ProtectedRoute>
        } />

        {/* Candidate Management Routes */}
        <Route path="/candidats" element={
          <ProtectedRoute allowedRoles={['Admin', 'RH']}>
            <CandidatList />
          </ProtectedRoute>
        } />
        <Route path="/candidats/add" element={
          <ProtectedRoute allowedRoles={['Admin', 'RH']}>
            <CandidatForm />
          </ProtectedRoute>
        } />
        <Route path="/candidats/edit/:id" element={
          <ProtectedRoute allowedRoles={['Admin', 'RH']}>
            <CandidatForm />
          </ProtectedRoute>
        } />
        <Route path="/entretiens" element={
          <ProtectedRoute allowedRoles={['Admin', 'RH']}>
            <EntretienList />
          </ProtectedRoute>
        } />
        <Route path="/entretiens/add/:candidatId" element={
          <ProtectedRoute allowedRoles={['Admin', 'RH']}>
            <EntretienForm />
          </ProtectedRoute>
        } />

        {/* Employee Routes */}
        <Route path="/employee" element={
          <ProtectedRoute allowedRoles={['Employe']}>
            <EmployeeLayout>
              <EmployeeDashboard />
            </EmployeeLayout>
          </ProtectedRoute>
        } />
        <Route path="/employee/demandes" element={
          <ProtectedRoute allowedRoles={['Employe']}>
            <EmployeeLayout>
              <EmployeeDemandes />
            </EmployeeLayout>
          </ProtectedRoute>
        } />
        <Route path="/employee/conges" element={
          <ProtectedRoute allowedRoles={['Employe']}>
            <EmployeeLayout>
              <EmployeeConges />
            </EmployeeLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;


