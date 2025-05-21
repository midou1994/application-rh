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
  Avatar,
  IconButton,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import DataTable from './DataTable';

const Personnel = () => {
  const [personnel, setPersonnel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState(null);
  const [formData, setFormData] = useState({
    // Employee fields
    matricule: '',
    nom: '',
    prenom: '',
    cin: '',
    date_naissance: '',
    adresse: '',
    telephone: '',
    post: '',
    photo: '',
    // User fields
    email: '',
    password: '',
    role: 'Employé',
    isActive: false,
  });
  const [previewUrl, setPreviewUrl] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const columns = [
    { id: 'matricule', label: 'Matricule', minWidth: 100 },
    { id: 'nom', label: 'Nom', minWidth: 100 },
    { id: 'prenom', label: 'Prénom', minWidth: 100 },
    { id: 'cin', label: 'CIN', minWidth: 100 },
    { 
      id: 'date_naissance', 
      label: 'Date de naissance', 
      minWidth: 120,
      format: (value) => new Date(value).toLocaleDateString()
    },
    { id: 'adresse', label: 'Adresse', minWidth: 150 },
    { id: 'telephone', label: 'Téléphone', minWidth: 100 },
    { id: 'post', label: 'Poste', minWidth: 120 },
    { id: 'email', label: 'Email', minWidth: 150 },
    { id: 'role', label: 'Rôle', minWidth: 100 },
    { 
      id: 'isActive', 
      label: 'Statut', 
      minWidth: 100,
      format: (value) => value ? 'Actif' : 'Inactif'
    },
  ];

  const roles = ['Employe', 'ResponsableRH', 'Admin'];

  const fetchPersonnel = async () => {
    try {
      const response = await fetch('http://localhost:5000/employe/getAllEmployes', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Erreur lors du chargement des données');
      const data = await response.json();

      // Fetch user information for each employee
      const employeesWithUserData = await Promise.all(
        data.map(async (employee) => {
          if (employee.user) {
            try {
              const userResponse = await fetch(`http://localhost:5000/users/getuserBYID/${employee.user}`, {
                credentials: 'include'
              });
              if (userResponse.ok) {
                const userData = await userResponse.json();
                return {
                  ...employee,
                  email: userData.email,
                  role: userData.role,
                  isActive: userData.isActive,
                  user: userData._id // Keep the user ID for updates
                };
              }
            } catch (err) {
              console.error('Error fetching user data:', err);
            }
          }
          return {
            ...employee,
            isActive: false,
            email: '',
            role: 'Employe'
          };
        })
      );

      setPersonnel(employeesWithUserData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonnel();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);

      // Update form data
      setFormData({
        ...formData,
        photo: file
      });
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl('');
    setFormData({
      ...formData,
      photo: ''
    });
  };

  const handleAdd = () => {
    setSelectedPersonnel(null);
    setFormData({
      matricule: '',
      nom: '',
      prenom: '',
      cin: '',
      date_naissance: '',
      adresse: '',
      telephone: '',
      post: '',
      photo: '',
      email: '',
      password: '',
      role: 'Employe',
      isActive: false,
    });
    setPreviewUrl('');
    setOpenDialog(true);
  };

  const handleEdit = (row) => {
    console.log('Editing row:', row);
    setSelectedPersonnel(row);
    setFormData({
      matricule: row.matricule,
      nom: row.nom,
      prenom: row.prenom,
      cin: row.cin,
      date_naissance: row.date_naissance.split('T')[0],
      adresse: row.adresse,
      telephone: row.telephone,
      post: row.post,
      photo: row.photo || '',
      email: row.email || '',
      role: row.role || 'Employe',
      isActive: Boolean(row.isActive),
    });
    setPreviewUrl(row.photo ? `http://localhost:5000/images/${row.photo}` : '');
    setOpenDialog(true);
  };

  const handleDelete = async (row) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
      try {
        const response = await fetch(`http://localhost:5000/employe/deleteEmploye/${row._id}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Erreur lors de la suppression');
        setSnackbar({
          open: true,
          message: 'Employé supprimé avec succès',
          severity: 'success'
        });
        fetchPersonnel();
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
      // Validate CIN and telephone format
      const cinRegex = /^\d{8}$/;
      const telephoneRegex = /^\d{8}$/;
      
      if (!cinRegex.test(formData.cin)) {
        throw new Error('Le numéro CIN doit contenir exactement 8 chiffres');
      }
      
      if (!telephoneRegex.test(formData.telephone)) {
        throw new Error('Le numéro de téléphone doit contenir exactement 8 chiffres');
      }

      // First create/update user
      const userData = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        role: formData.role,
        isActive: Boolean(formData.isActive),
      };

      // Handle password for both new and existing users
      if (!selectedPersonnel) {
        if (!formData.password) {
          throw new Error('Le mot de passe est requis pour un nouvel utilisateur');
        }
        userData.password = formData.password;
      } else if (formData.password) {
        // Include password only if it's being changed for existing user
        userData.password = formData.password;
      }

      console.log('Sending user data:', userData);

      const userUrl = selectedPersonnel?.user
        ? `http://localhost:5000/users/updateUser/${selectedPersonnel.user}`
        : 'http://localhost:5000/users/addEmploye';

      const userResponse = await fetch(userUrl, {
        method: selectedPersonnel?.user ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        throw new Error(errorData.message || 'Erreur lors de la création/modification de l\'utilisateur');
      }
      
      const userResult = await userResponse.json();
      console.log('User update response:', userResult);

      // Then create/update employee with image
      const formDataToSend = new FormData();
      
      // Add all employee fields
      formDataToSend.append('matricule', formData.matricule);
      formDataToSend.append('nom', formData.nom);
      formDataToSend.append('prenom', formData.prenom);
      formDataToSend.append('cin', formData.cin);
      formDataToSend.append('date_naissance', formData.date_naissance);
      formDataToSend.append('adresse', formData.adresse);
      formDataToSend.append('telephone', formData.telephone);
      formDataToSend.append('post', formData.post);
      formDataToSend.append('user', userResult._id);

      // Handle photo upload
      if (formData.photo instanceof File) {
        formDataToSend.append('photo', formData.photo);
      }

      const employeeUrl = selectedPersonnel
        ? `http://localhost:5000/employe/updateEmployesBYID/${selectedPersonnel._id}`
        : 'http://localhost:5000/employe/addEmployeWithImage';

      const employeeResponse = await fetch(employeeUrl, {
        method: selectedPersonnel ? 'PUT' : 'POST',
        credentials: 'include',
        body: formDataToSend,
      });

      if (!employeeResponse.ok) {
        const errorData = await employeeResponse.json();
        throw new Error(errorData.message || 'Erreur lors de la création/modification de l\'employé');
      }
      
      setSnackbar({
        open: true,
        message: selectedPersonnel ? 'Employé modifié avec succès' : 'Employé ajouté avec succès',
        severity: 'success'
      });
      
      setOpenDialog(false);
      fetchPersonnel();
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
        title="Gestion du Personnel"
        columns={columns}
        data={personnel}
        loading={loading}
        error={error}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedPersonnel ? 'Modifier un employé' : 'Ajouter un employé'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              {/* Avatar Upload Section */}
              <Box sx={{ 
                gridColumn: 'span 2', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: 2,
                mb: 2 
              }}>
                <Avatar
                  src={previewUrl}
                  sx={{ 
                    width: 120, 
                    height: 120,
                    border: '2px solid #2196F3',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="photo-upload"
                    type="file"
                    onChange={handleImageChange}
                  />
                  <label htmlFor="photo-upload">
                    <Button
                      variant="contained"
                      component="span"
                      startIcon={<PhotoCameraIcon />}
                    >
                      Choisir une photo
                    </Button>
                  </label>
                  {previewUrl && (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={handleRemoveImage}
                      startIcon={<DeleteIcon />}
                    >
                      Supprimer
                    </Button>
                  )}
                </Box>
              </Box>

              {/* Rest of the form fields */}
              <TextField
                name="matricule"
                label="Matricule"
                value={formData.matricule}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                name="nom"
                label="Nom"
                value={formData.nom}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                name="prenom"
                label="Prénom"
                value={formData.prenom}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                name="cin"
                label="CIN"
                value={formData.cin}
                onChange={handleChange}
                required
                fullWidth
                inputProps={{ pattern: '[0-9]{8}' }}
                helperText="8 chiffres requis"
              />
              <TextField
                name="date_naissance"
                label="Date de naissance"
                type="date"
                value={formData.date_naissance}
                onChange={handleChange}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                name="telephone"
                label="Téléphone"
                value={formData.telephone}
                onChange={handleChange}
                required
                fullWidth
                inputProps={{ pattern: '[0-9]{8}' }}
                helperText="8 chiffres requis"
              />
              <TextField
                name="post"
                label="Poste"
                value={formData.post}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                name="adresse"
                label="Adresse"
                value={formData.adresse}
                onChange={handleChange}
                required
                fullWidth
                multiline
                rows={2}
              />
              <TextField
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                fullWidth
              />
              {!selectedPersonnel ? (
                <TextField
                  name="password"
                  label="Mot de passe"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  fullWidth
                  inputProps={{ minLength: 8 }}
                  helperText="Minimum 8 caractères"
                />
              ) : (
                <TextField
                  name="password"
                  label="Nouveau mot de passe (optionnel)"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  fullWidth
                  inputProps={{ minLength: 8 }}
                  helperText="Laissez vide pour conserver l'ancien mot de passe"
                />
              )}
              <TextField
                name="role"
                label="Rôle"
                value={formData.role}
                onChange={handleChange}
                required
                fullWidth
                select
              >
                {roles.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </TextField>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    name="isActive"
                    color="primary"
                  />
                }
                label="Compte actif"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
            <Button type="submit" variant="contained" color="primary">
              {selectedPersonnel ? 'Modifier' : 'Ajouter'}
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

export default Personnel; 