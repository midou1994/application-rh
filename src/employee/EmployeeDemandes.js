import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import DemandeConge from '../components/DemandeConge';

const EmployeeDemandes = () => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      const storedUser = JSON.parse(localStorage.getItem("loggedUser"));
      if (!storedUser?._id) {
        window.location.href = "/login";
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/employe/byUser/${storedUser._id}`, {
          credentials: "include"
        });
        
        if (!response.ok) throw new Error("Erreur lors de la récupération des données");
        
        const employeeData = await response.json();
        setEmployee(employeeData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, []);

  if (loading) {
    return (
      <Box sx={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh" 
      }}>
        <CircularProgress size={80} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        textAlign: "center", 
        p: 4, 
        bgcolor: "error.light", 
        borderRadius: 2 
      }}>
        <Typography variant="h6" color="error" gutterBottom>
          Erreur : {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Mes demandes de congé
      </Typography>
      
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <Box sx={{ maxWidth: '1200px', width: '100%' }}>
          <DemandeConge employeeId={employee?._id} />
        </Box>
      </Box>
    </Box>
  );
};

export default EmployeeDemandes; 