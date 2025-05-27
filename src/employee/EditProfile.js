import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton
} from '@mui/material';
import { PhotoCamera as PhotoCameraIcon } from '@mui/icons-material';

const EditProfile = () => {
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nom: '',
    prenom: '',
    telephone: '',
    adresse: '',
    post: '',
    cin: '',
    date_naissance: '',
    matricule: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("loggedUser"));
        if (!storedUser?._id) {
          window.location.href = "/login";
          return;
        }

        // Fetch user data
        const userRes = await fetch(`http://localhost:5000/users/getuserBYID/${storedUser._id}`, {
          credentials: "include"
        });
        
        if (!userRes.ok) throw new Error("Erreur lors de la récupération des données utilisateur");
        const userData = await userRes.json();
        setUser(userData);
        setFormData(prev => ({ ...prev, email: userData.email }));

        // First get employee by user ID
        const employeeByUserRes = await fetch(`http://localhost:5000/employe/byUser/${storedUser._id}`, {
          credentials: "include"
        });

        if (!employeeByUserRes.ok) throw new Error("Erreur lors de la récupération des données employé");
        const employeeByUser = await employeeByUserRes.json();

        // Then fetch complete employee data using employee ID
        const employeeRes = await fetch(`http://localhost:5000/employe/${employeeByUser._id}`, {
          credentials: "include"
        });

        if (!employeeRes.ok) throw new Error("Erreur lors de la récupération des données employé");
        const employeeData = await employeeRes.json();
        setEmployee(employeeData);
        
        // Set employee data in form
        setFormData(prev => ({
          ...prev,
          nom: employeeData.nom || '',
          prenom: employeeData.prenom || '',
          telephone: employeeData.telephone || '',
          adresse: employeeData.adresse || '',
          post: employeeData.post || '',
          cin: employeeData.cin || '',
          date_naissance: employeeData.date_naissance ? new Date(employeeData.date_naissance).toISOString().split('T')[0] : '',
          matricule: employeeData.matricule || ''
        }));

        // Set photo preview if exists
        if (employeeData.photo) {
          setPreviewUrl(`http://localhost:5000/images/${employeeData.photo}`);
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    if (formData.password && formData.password !== formData.confirmPassword) {
      throw new Error("Les mots de passe ne correspondent pas");
    }
    if (formData.telephone && !/^\d{8}$/.test(formData.telephone)) {
      throw new Error("Le numéro de téléphone doit contenir exactement 8 chiffres");
    }
    if (formData.cin && !/^\d{8}$/.test(formData.cin)) {
      throw new Error("Le numéro CIN doit contenir exactement 8 chiffres");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      validateForm();

      // Create FormData for file upload
      const formDataToSend = new FormData();
      if (selectedFile) {
        formDataToSend.append('photo', selectedFile);
      }

      // Update user data if password is provided
      if (formData.password) {
        const userUpdateRes = await fetch(`http://localhost:5000/users/updateUser/${user._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          }),
          credentials: 'include'
        });

        if (!userUpdateRes.ok) throw new Error("Erreur lors de la mise à jour des données utilisateur");
      }

      // Update employee data
      const employeeData = {
        nom: formData.nom,
        prenom: formData.prenom,
        telephone: formData.telephone,
        adresse: formData.adresse,
        post: formData.post,
        cin: formData.cin,
        date_naissance: formData.date_naissance,
        matricule: formData.matricule
      };

      // Append employee data to FormData
      Object.keys(employeeData).forEach(key => {
        formDataToSend.append(key, employeeData[key]);
      });

      const employeeUpdateRes = await fetch(`http://localhost:5000/employe/updateEmployeWithImage/${employee._id}`, {
        method: 'PUT',
        body: formDataToSend,
        credentials: 'include'
      });

      if (!employeeUpdateRes.ok) throw new Error("Erreur lors de la mise à jour des données employé");

      setSuccess(true);
      // Refresh user data
      const updatedUserRes = await fetch(`http://localhost:5000/users/getuserBYID/${user._id}`, {
        credentials: "include"
      });
      const updatedUserData = await updatedUserRes.json();
      localStorage.setItem("loggedUser", JSON.stringify(updatedUserData));

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Modifier mon profil
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={previewUrl}
                  sx={{ width: 120, height: 120, border: '2px solid #2196F3' }}
                />
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="photo-upload"
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="photo-upload">
                  <IconButton
                    color="primary"
                    component="span"
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      bgcolor: 'white',
                      '&:hover': { bgcolor: 'grey.100' }
                    }}
                  >
                    <PhotoCameraIcon />
                  </IconButton>
                </label>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Informations de connexion
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nouveau mot de passe"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                helperText="Minimum 8 caractères"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Confirmer le mot de passe"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Informations personnelles
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Matricule"
                name="matricule"
                value={formData.matricule}
                onChange={handleInputChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="CIN"
                name="cin"
                value={formData.cin}
                onChange={handleInputChange}
                required
                helperText="8 chiffres exactement"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nom"
                name="nom"
                value={formData.nom}
                onChange={handleInputChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Prénom"
                name="prenom"
                value={formData.prenom}
                onChange={handleInputChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date de naissance"
                name="date_naissance"
                type="date"
                value={formData.date_naissance}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Téléphone"
                name="telephone"
                value={formData.telephone}
                onChange={handleInputChange}
                required
                helperText="8 chiffres exactement"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Poste"
                name="post"
                value={formData.post}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Adresse"
                name="adresse"
                value={formData.adresse}
                onChange={handleInputChange}
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Enregistrer les modifications'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success" onClose={() => setSuccess(false)}>
          Profil mis à jour avec succès
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EditProfile; 