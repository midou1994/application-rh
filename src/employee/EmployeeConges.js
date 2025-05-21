import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardContent,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material';
import { 
  BeachAccess as CongesIcon,
  PictureAsPdf as PdfIcon,
} from '@mui/icons-material';
import { PDFDownloadLink } from '@react-pdf/renderer';
import CongePDF from '../components/CongePDF';

const EmployeeConges = () => {
  const [conges, setConges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [remainingDays, setRemainingDays] = useState(0);
  const [employee, setEmployee] = useState(null);

  useEffect(() => {
    const fetchEmployeeAndConges = async () => {
      try {
        // Get employee data
        const storedUser = JSON.parse(localStorage.getItem("loggedUser"));
        if (!storedUser?._id) {
          throw new Error("Non autorisé");
        }

        const employeeRes = await fetch(`http://localhost:5000/employe/byUser/${storedUser._id}`, {
          credentials: "include"
        });

        if (!employeeRes.ok) {
          throw new Error("Erreur lors de la récupération des données employé");
        }

        const employeeData = await employeeRes.json();
        setEmployee(employeeData);

        // Get conges data
        const congesRes = await fetch(
          `http://localhost:5000/conge/getCongesByEmployee/${employeeData._id}`,
          { credentials: "include" }
        );

        if (!congesRes.ok) {
          throw new Error("Erreur lors de la récupération des congés");
        }

        const congesData = await congesRes.json();
        
        // Filter active conges (approved and not ended)
        const activeConges = congesData.filter(conge => 
          conge.etat_conge === "Approuvé" && 
          new Date(conge.date_fin) >= new Date()
        );
        
        setConges(activeConges);

        // Calculate remaining days from active leaves
        const today = new Date();
        const remainingDays = activeConges.length > 0
          ? activeConges.reduce((total, conge) => {
              const endDate = new Date(conge.date_fin);
              const diffTime = endDate - today;
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              return total + Math.max(0, diffDays);
            }, 0)
          : 0;
        
        setRemainingDays(remainingDays);

      } catch (err) {
        console.error("Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeAndConges();
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
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Mes Congés
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            background: "linear-gradient(45deg, #4CAF50 30%, #81C784 90%)",
            color: "white"
          }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <Typography variant="h6">Jours de congé restants</Typography>
                  <Typography variant="h3">{remainingDays}</Typography>
                </div>
                <CongesIcon sx={{ fontSize: 60, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        Congés Actifs
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date de début</TableCell>
              <TableCell>Date de fin</TableCell>
              <TableCell>Nombre de jours</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>État</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {conges.length > 0 ? (
              conges.map((conge) => (
                <TableRow key={conge._id}>
                  <TableCell>{new Date(conge.date_debut).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(conge.date_fin).toLocaleDateString()}</TableCell>
                  <TableCell>{conge.nombre_jrs}</TableCell>
                  <TableCell>{conge.type_conge}</TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        backgroundColor: '#4caf50',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        display: 'inline-block'
                      }}
                    >
                      {conge.etat_conge}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <PDFDownloadLink
                      document={<CongePDF conge={conge} employee={employee} />}
                      fileName={`conge_${employee?.nom}_${new Date(conge.date_debut).toLocaleDateString()}.pdf`}
                    >
                      {({ blob, url, loading, error }) => (
                        <Tooltip title="Télécharger l'attestation">
                          <IconButton
                            color="primary"
                            disabled={loading}
                            sx={{
                              '&:hover': {
                                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                              },
                            }}
                          >
                            <PdfIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </PDFDownloadLink>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Aucun congé actif
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default EmployeeConges; 