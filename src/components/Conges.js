import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  Snackbar,
  MenuItem,
  Autocomplete,
} from '@mui/material';
import DataTable from './DataTable';

const Conges = () => {
  const [conges, setConges] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedConge, setSelectedConge] = useState(null);
  const [formData, setFormData] = useState({
    date_debut: '',
    date_fin: '',
    nombre_jrs: '',
    type_conge: 'Annuel',
    etat_conge: 'En attente',
    employe: ''
  });
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeDetails, setEmployeeDetails] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const columns = [
    { 
      id: 'date_debut', 
      label: 'Date de début', 
      minWidth: 120,
      format: (value) => new Date(value).toLocaleDateString()
    },
    { 
      id: 'date_fin', 
      label: 'Date de fin', 
      minWidth: 120,
      format: (value) => new Date(value).toLocaleDateString()
    },
    { 
      id: 'nombre_jrs', 
      label: 'Nombre de jours', 
      minWidth: 100 
    },
    { 
      id: 'type_conge', 
      label: 'Type', 
      minWidth: 120 
    },
    { 
      id: 'etat_conge', 
      label: 'État', 
      minWidth: 100,
      format: (value) => (
        <Box
          sx={{
            backgroundColor: 
              value === 'Approuvé' ? '#4caf50' :
              value === 'Rejeté' ? '#f44336' :
              '#ff9800',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            display: 'inline-block'
          }}
        >
          {value}
        </Box>
      )
    },
    {
      id: 'employe',
      label: 'Employé',
      minWidth: 150,
      format: (value) => {
        const employee = employeeDetails[value];
        return employee ? `${employee.nom} ${employee.prenom}` : 'N/A';
      }
    }
  ];

  const fetchEmployeeDetails = async (employeeId) => {
    try {
      const response = await fetch(`http://localhost:5000/employe/${employeeId}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const employee = await response.json();
        setEmployeeDetails(prev => ({
          ...prev,
          [employeeId]: employee
        }));
      }
    } catch (err) {
      console.error('Error fetching employee:', err);
    }
  };

  const fetchPersonnel = async () => {
    try {
      const response = await fetch('http://localhost:5000/employe/getAllEmployes', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Erreur lors du chargement des employés');
      const data = await response.json();
      setPersonnel(data);
    } catch (err) {
      console.error('Error fetching personnel:', err);
    }
  };

  const fetchConges = async () => {
    try {
      const response = await fetch('http://localhost:5000/conge/getAllConge', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Erreur lors du chargement des données');
      const data = await response.json();
      setConges(data);
      
      // Fetch employee details for each conge
      data.forEach(conge => {
        if (conge.employe && !employeeDetails[conge.employe]) {
          fetchEmployeeDetails(conge.employe);
        }
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConges();
    fetchPersonnel();
  }, []);

  const handleAdd = () => {
    setSelectedConge(null);
    setSelectedEmployee(null);
    setFormData({
      date_debut: '',
      date_fin: '',
      nombre_jrs: '',
      type_conge: 'Annuel',
      etat_conge: 'En attente',
      employe: ''
    });
    setOpenDialog(true);
  };

  const handleEdit = async (row) => {
    setSelectedConge(row);
    try {
      const response = await fetch(`http://localhost:5000/employe/getEmployeByID/${row.employe}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const employee = await response.json();
        setSelectedEmployee(employee);
      }
    } catch (err) {
      console.error('Error fetching employee:', err);
    }
    setFormData({
      date_debut: row.date_debut.split('T')[0],
      date_fin: row.date_fin.split('T')[0],
      nombre_jrs: row.nombre_jrs,
      type_conge: row.type_conge,
      etat_conge: row.etat_conge,
      employe: row.employe
    });
    setOpenDialog(true);
  };

  const handleDelete = async (row) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce congé ?')) {
      try {
        const response = await fetch(`http://localhost:5000/conge/deleteConge/${row._id}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Erreur lors de la suppression');
        setSnackbar({
          open: true,
          message: 'Congé supprimé avec succès',
          severity: 'success'
        });
        fetchConges();
      } catch (err) {
        setSnackbar({
          open: true,
          message: err.message,
          severity: 'error'
        });
      }
    }
  };

  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value
    };

    // Calculate number of days when both dates are set
    if (newFormData.date_debut && newFormData.date_fin) {
      newFormData.nombre_jrs = calculateDays(newFormData.date_debut, newFormData.date_fin);
    }

    setFormData(newFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate required fields
      if (!formData.date_debut || !formData.date_fin || !formData.nombre_jrs || !formData.employe) {
        throw new Error("Tous les champs obligatoires doivent être remplis");
      }

      // Prepare the data according to the backend requirements
      const congeData = {
        date_debut: new Date(formData.date_debut).toISOString(),
        date_fin: new Date(formData.date_fin).toISOString(),
        nombre_jrs: parseInt(formData.nombre_jrs),
        type_conge: formData.type_conge,
        etat_conge: formData.etat_conge,
        employe: formData.employe
      };

      const url = selectedConge
        ? `http://localhost:5000/conge/updateConge/${selectedConge._id}`
        : 'http://localhost:5000/conge/addconge';
      
      const response = await fetch(url, {
        method: selectedConge ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(congeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'opération');
      }
      
      const result = await response.json();
      
      setSnackbar({
        open: true,
        message: result.message || (selectedConge ? 'Congé modifié avec succès' : 'Congé ajouté avec succès'),
        severity: 'success'
      });
      
      setOpenDialog(false);
      fetchConges();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message,
        severity: 'error'
      });
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <DataTable
        title="Gestion des Congés"
        columns={columns}
        data={conges}
        loading={loading}
        error={error}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedConge ? 'Modifier un congé' : 'Ajouter un congé'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                name="type_conge"
                label="Type de congé"
                value={formData.type_conge}
                onChange={handleChange}
                required
                fullWidth
                select
              >
                <MenuItem value="Annuel">Annuel</MenuItem>
                <MenuItem value="Maladie">Maladie</MenuItem>
                <MenuItem value="Maternité">Maternité</MenuItem>
                <MenuItem value="Exceptionnel">Exceptionnel</MenuItem>
              </TextField>
              <TextField
                name="etat_conge"
                label="État"
                value={formData.etat_conge}
                onChange={handleChange}
                required
                fullWidth
                select
              >
                <MenuItem value="En attente">En attente</MenuItem>
                <MenuItem value="Approuvé">Approuvé</MenuItem>
                <MenuItem value="Rejeté">Rejeté</MenuItem>
              </TextField>
              <TextField
                name="date_debut"
                label="Date de début"
                type="date"
                value={formData.date_debut}
                onChange={handleDateChange}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                name="date_fin"
                label="Date de fin"
                type="date"
                value={formData.date_fin}
                onChange={handleDateChange}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                name="nombre_jrs"
                label="Nombre de jours"
                type="number"
                value={formData.nombre_jrs}
                InputProps={{ readOnly: true }}
                fullWidth
              />
              <Autocomplete
                options={personnel}
                getOptionLabel={(option) => `${option.nom} ${option.prenom}`}
                value={selectedEmployee}
                onChange={(event, newValue) => {
                  setSelectedEmployee(newValue);
                  setFormData({
                    ...formData,
                    employe: newValue ? newValue._id : ''
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Rechercher un employé"
                    required
                    fullWidth
                  />
                )}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
            <Button type="submit" variant="contained" color="primary">
              {selectedConge ? 'Modifier' : 'Ajouter'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Conges; 