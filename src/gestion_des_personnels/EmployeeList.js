import React, { useState, useEffect } from 'react';
import {
  Container,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  Box,
  Avatar
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import axios from 'axios';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get('http://localhost:5000/employe/getAllEmployes', {
          withCredentials: true
        });
        setEmployees(response.data);
      } catch (error) {
        setError("Erreur de chargement des employés");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/employe/deletEmployesBYID/${id}`, {
        withCredentials: true
      });
      setEmployees(prev => prev.filter(emp => emp._id !== id));
    } catch (error) {
      console.error('Erreur de suppression:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Liste des Employés</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          component={Link}
          to="/employes/add"

        >
          Ajouter Employé
        </Button>
      </Box>

      {error && (
        <Typography color="error" sx={{ p: 2 }}>
          {error}
        </Typography>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Photo</TableCell>
                <TableCell>Matricule</TableCell>
                <TableCell>Nom Complet</TableCell>
                <TableCell>CIN</TableCell>
                <TableCell>Téléphone</TableCell>
                <TableCell>Poste</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee._id}>
                  <TableCell>
                    <Avatar src={`http://localhost:5000/images/${employee.photo}`} />
                  </TableCell>
                  <TableCell>{employee.matricule}</TableCell>
                  <TableCell>{employee.prenom} {employee.nom}</TableCell>
                  <TableCell>{employee.cin}</TableCell>
                  <TableCell>{employee.telephone}</TableCell>
                  <TableCell>{employee.post}</TableCell>
                  <TableCell>
                    <IconButton
                      component={Link}
                      to={`/employes/edit/${employee._id}`}
                      color="primary"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(employee._id)}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default EmployeeList;