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
} from '@mui/material';
import DataTable from './DataTable';

const JoursFeries = () => {
  const [joursFeries, setJoursFeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedJour, setSelectedJour] = useState(null);
  const [formData, setFormData] = useState({
    libelle: '',
    date: '',
    jour: '',
    nombre_de_jours: '',
    annee: new Date().getFullYear().toString(),
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const columns = [
    { id: 'libelle', label: 'Libellé', minWidth: 150 },
    { 
      id: 'date', 
      label: 'Date', 
      minWidth: 120,
      format: (value) => new Date(value).toLocaleDateString()
    },
    { id: 'jour', label: 'Jour', minWidth: 100 },
    { id: 'nombre_de_jours', label: 'Nombre de jours', minWidth: 120 },
    { id: 'annee', label: 'Année', minWidth: 100 },
  ];

  const joursSemaine = [
    'Lundi',
    'Mardi',
    'Mercredi',
    'Jeudi',
    'Vendredi',
    'Samedi',
    'Dimanche'
  ];

  const fetchJoursFeries = async () => {
    try {
      const response = await fetch('http://localhost:5000/jourferie/getAllJourferie', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Erreur lors du chargement des données');
      const data = await response.json();
      setJoursFeries(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJoursFeries();
  }, []);

  const handleAdd = () => {
    setSelectedJour(null);
    setFormData({
      libelle: '',
      date: '',
      jour: '',
      nombre_de_jours: '',
      annee: new Date().getFullYear().toString(),
    });
    setOpenDialog(true);
  };

  const handleEdit = (row) => {
    setSelectedJour(row);
    setFormData({
      libelle: row.libelle,
      date: row.date.split('T')[0],
      jour: row.jour,
      nombre_de_jours: row.nombre_de_jours,
      annee: row.annee,
    });
    setOpenDialog(true);
  };

  const handleDelete = async (row) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce jour férié ?')) {
      try {
        const response = await fetch(`http://localhost:5000/jourferie/deleteJourferie/${row._id}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Erreur lors de la suppression');
        setSnackbar({
          open: true,
          message: 'Jour férié supprimé avec succès',
          severity: 'success'
        });
        fetchJoursFeries();
      } catch (err) {
        setSnackbar({
          open: true,
          message: err.message,
          severity: 'error'
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = selectedJour
        ? `http://localhost:5000/jourferie/updateJourferieBYID/${selectedJour._id}`
        : 'http://localhost:5000/jourferie/addJourferie';
      
      const response = await fetch(url, {
        method: selectedJour ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Erreur lors de l\'opération');
      
      setSnackbar({
        open: true,
        message: selectedJour ? 'Jour férié modifié avec succès' : 'Jour férié ajouté avec succès',
        severity: 'success'
      });
      
      setOpenDialog(false);
      fetchJoursFeries();
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
        title="Gestion des Jours Fériés"
        columns={columns}
        data={joursFeries}
        loading={loading}
        error={error}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedJour ? 'Modifier un jour férié' : 'Ajouter un jour férié'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                name="libelle"
                label="Libellé"
                value={formData.libelle}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                name="date"
                label="Date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                name="jour"
                label="Jour"
                value={formData.jour}
                onChange={handleChange}
                required
                fullWidth
                select
              >
                {joursSemaine.map((jour) => (
                  <MenuItem key={jour} value={jour}>
                    {jour}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                name="nombre_de_jours"
                label="Nombre de jours"
                value={formData.nombre_de_jours}
                onChange={handleChange}
                required
                fullWidth
                type="number"
                inputProps={{ min: 1, max: 7 }}
              />
              <TextField
                name="annee"
                label="Année"
                value={formData.annee}
                onChange={handleChange}
                required
                fullWidth
                type="number"
                inputProps={{ min: 2000, max: 2100 }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
            <Button type="submit" variant="contained" color="primary">
              {selectedJour ? 'Modifier' : 'Ajouter'}
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

export default JoursFeries; 