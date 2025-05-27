import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  useTheme
} from '@mui/material';

const JoursFeries = () => {
  const [joursFeries, setJoursFeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    const fetchJoursFeries = async () => {
      try {
        const response = await fetch('http://localhost:5000/jourferie/getAllJourferie', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des jours fériés');
        }
        
        const data = await response.json();
        setJoursFeries(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJoursFeries();
  }, []);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress size={80} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        textAlign: 'center', 
        p: 4, 
        bgcolor: 'error.light', 
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
        Calendrier des jours fériés
      </Typography>
      
      <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Libellé</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Jour</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Année</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Durée</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {joursFeries.map((jour) => (
              <TableRow key={jour._id} hover>
                <TableCell>{jour.libelle}</TableCell>
                <TableCell>{new Date(jour.date).toLocaleDateString('fr-FR')}</TableCell>
                <TableCell>{jour.jour}</TableCell>
                <TableCell>{jour.annee}</TableCell>
                <TableCell>{jour.nombre_de_jours} jour(s)</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default JoursFeries; 