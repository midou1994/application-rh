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
          try {
            // First try to get user data from the employee's user field
            if (employee.user) {
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
            }

            // If no user data found, try to find user by email
            if (employee.email) {
              const userByEmailResponse = await fetch(`http://localhost:5000/users/getUserByEmail/${employee.email}`, {
                credentials: 'include'
              });
              if (userByEmailResponse.ok) {
                const userData = await userByEmailResponse.json();
                return {
                  ...employee,
                  email: userData.email,
                  role: userData.role,
                  isActive: userData.isActive,
                  user: userData._id // Keep the user ID for updates
                };
              }
            }

            // If no user found at all, try to find user by name
            const userByNameResponse = await fetch(`http://localhost:5000/users/getUserByName/${employee.nom}/${employee.prenom}`, {
              credentials: 'include'
            });
            if (userByNameResponse.ok) {
              const userData = await userByNameResponse.json();
              return {
                ...employee,
                email: userData.email,
                role: userData.role,
                isActive: userData.isActive,
                user: userData._id // Keep the user ID for updates
              };
            }

            // If no user found at all, return employee with default values
            console.warn('No user found for employee:', employee._id);
            return {
              ...employee,
              isActive: false,
              email: '',
              role: 'Employe',
              user: null
            };
          } catch (err) {
            console.error('Error fetching user data for employee:', employee._id, err);
            return {
              ...employee,
              isActive: false,
              email: '',
              role: 'Employe',
              user: null
            };
          }
        })
      );

      console.log('Fetched employees with user data:', employeesWithUserData);
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
    
    // Check if we have all required data
    if (!row._id) {
      console.error('Missing employee ID:', row);
      setSnackbar({
        open: true,
        message: 'Données incomplètes pour la modification',
        severity: 'error'
      });
      return;
    }

    // If no user ID, try to find it
    if (!row.user) {
      console.warn('No user ID found, attempting to find user...');
      // The user ID will be fetched in the next render cycle
    }
    
    setSelectedPersonnel({
      _id: row._id,
      user: row.user,
      ...row
    });
    
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
      user: row.user
    });
    setPreviewUrl(row.photo ? `http://localhost:5000/images/${row.photo}` : '');
    setOpenDialog(true);
  };

  const handleDelete = async (row) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
      try {
        const response = await fetch(`http://localhost:5000/employe/deletEmployesBYID/${row._id}`, {
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

      let userResult;

      // Check if we're in edit mode by checking selectedPersonnel
      const isEditMode = Boolean(selectedPersonnel && selectedPersonnel._id);
      console.log('Is edit mode:', isEditMode);
      console.log('Selected personnel:', selectedPersonnel);

      if (isEditMode) {
        // UPDATE EXISTING USER
        const userData = {
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          role: formData.role,
          isActive: Boolean(formData.isActive),
        };

        if (formData.password) {
          userData.password = formData.password;
        }

        console.log('Updating user with ID:', selectedPersonnel.user);
        const userResponse = await fetch(`http://localhost:5000/users/updateUser/${selectedPersonnel.user}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(userData),
        });

        if (!userResponse.ok) {
          const errorData = await userResponse.json();
          throw new Error(errorData.message || 'Erreur lors de la modification de l\'utilisateur');
        }
        
        userResult = await userResponse.json();
        console.log('User update successful:', userResult);

        // UPDATE EXISTING EMPLOYEE
        const formDataToSend = new FormData();
        formDataToSend.append('matricule', formData.matricule);
        formDataToSend.append('nom', formData.nom);
        formDataToSend.append('prenom', formData.prenom);
        formDataToSend.append('cin', formData.cin);
        formDataToSend.append('date_naissance', formData.date_naissance);
        formDataToSend.append('adresse', formData.adresse);
        formDataToSend.append('telephone', formData.telephone);
        formDataToSend.append('post', formData.post);
        formDataToSend.append('user', userResult._id);

        if (formData.photo instanceof File) {
          formDataToSend.append('photo', formData.photo);
        }

        console.log('Updating employee with ID:', selectedPersonnel._id);
        const employeeResponse = await fetch(`http://localhost:5000/employe/updateEmployeWithImage/${selectedPersonnel._id}`, {
          method: 'PUT',
          credentials: 'include',
          body: formDataToSend,
        });

        if (!employeeResponse.ok) {
          const errorData = await employeeResponse.json();
          throw new Error(errorData.message || 'Erreur lors de la modification de l\'employé');
        }
      } else {
        // ADD NEW USER
        const userData = {
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          role: formData.role,
          isActive: Boolean(formData.isActive),
          password: formData.password
        };

        if (!formData.password) {
          throw new Error('Le mot de passe est requis pour un nouvel utilisateur');
        }

        const userResponse = await fetch('http://localhost:5000/users/addEmploye', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(userData),
        });

        if (!userResponse.ok) {
          const errorData = await userResponse.json();
          throw new Error(errorData.message || 'Erreur lors de la création de l\'utilisateur');
        }
        
        userResult = await userResponse.json();

        // ADD NEW EMPLOYEE
        const formDataToSend = new FormData();
        formDataToSend.append('matricule', formData.matricule);
        formDataToSend.append('nom', formData.nom);
        formDataToSend.append('prenom', formData.prenom);
        formDataToSend.append('cin', formData.cin);
        formDataToSend.append('date_naissance', formData.date_naissance);
        formDataToSend.append('adresse', formData.adresse);
        formDataToSend.append('telephone', formData.telephone);
        formDataToSend.append('post', formData.post);
        formDataToSend.append('user', userResult._id);

        if (formData.photo instanceof File) {
          formDataToSend.append('photo', formData.photo);
        }

        const employeeResponse = await fetch('http://localhost:5000/employe/addEmployeWithImage', {
          method: 'POST',
          credentials: 'include',
          body: formDataToSend,
        });

        if (!employeeResponse.ok) {
          const errorData = await employeeResponse.json();
          throw new Error(errorData.message || 'Erreur lors de la création de l\'employé');
        }
      }
      
      setSnackbar({
        open: true,
        message: isEditMode ? 'Employé modifié avec succès' : 'Employé ajouté avec succès',
        severity: 'success'
      });
      
      setOpenDialog(false);
      fetchPersonnel();
    } catch (err) {
      console.error('Error in handleSubmit:', err);
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