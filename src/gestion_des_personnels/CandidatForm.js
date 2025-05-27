import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import frLocale from 'date-fns/locale/fr';

const CandidatForm = ({ candidat, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    cin: '',
    date_naissance: null,
    adresse: '',
    telephone: '',
    post: '',
    niveau_etude: '',
    experience: '',
    cv: null,
    lettre_motivation: null,
    diplome: null,
    annee_obtention: ''
  });

  useEffect(() => {
    if (candidat) {
      setFormData({
        ...candidat,
        date_naissance: new Date(candidat.date_naissance)
      });
    }
  }, [candidat]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      date_naissance: date
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files[0]
    }));
  };

  const validateForm = () => {
    const requiredFields = [
      'nom',
      'prenom',
      'email',
      'cin',
      'telephone',
      'date_naissance',
      'adresse',
      'post',
      'niveau_etude',
      'experience'
    ];

    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      setError(`Veuillez remplir tous les champs requis : ${missingFields.join(', ')}`);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (candidat) {
        // Update mode - use JSON
        const updateData = {
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          cin: formData.cin,
          telephone: formData.telephone,
          adresse: formData.adresse,
          post: formData.post,
          niveau_etude: formData.niveau_etude,
          experience: formData.experience,
          annee_obtention: formData.annee_obtention || '',
          date_naissance: formData.date_naissance.toISOString(),
          cv: candidat.cv,
          lettre_motivation: candidat.lettre_motivation,
          diplome: candidat.diplome
        };

        // If new files are provided, update them
        if (formData.cv instanceof File) {
          updateData.cv = formData.cv;
        }
        if (formData.lettre_motivation instanceof File) {
          updateData.lettre_motivation = formData.lettre_motivation;
        }
        if (formData.diplome instanceof File) {
          updateData.diplome = formData.diplome;
        }

        console.log('Sending update data:', updateData);

        const response = await fetch(`http://localhost:5000/candidat/updateCandidatsBYID/${candidat._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
          credentials: 'include'
        });

        const data = await response.json();
        console.log('Update response:', data);

        if (!response.ok) {
          throw new Error(data.message || 'Erreur lors de la mise à jour');
        }

        onSuccess();
      } else {
        // Create mode - use FormData
        const formDataToSend = new FormData();
        
        // Add all basic fields
        const basicFields = {
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          cin: formData.cin,
          telephone: formData.telephone,
          adresse: formData.adresse,
          post: formData.post,
          niveau_etude: formData.niveau_etude,
          experience: formData.experience,
          annee_obtention: formData.annee_obtention || ''
        };

        Object.entries(basicFields).forEach(([key, value]) => {
          formDataToSend.append(key, value);
        });

        formDataToSend.append('date_naissance', formData.date_naissance.toISOString());

        if (formData.cv instanceof File) {
          formDataToSend.append('cv', formData.cv);
        }
        if (formData.lettre_motivation instanceof File) {
          formDataToSend.append('lettre_motivation', formData.lettre_motivation);
        }
        if (formData.diplome instanceof File) {
          formDataToSend.append('diplome', formData.diplome);
        }

        const response = await fetch('http://localhost:5000/candidat/addCandidats', {
          method: 'POST',
          body: formDataToSend,
          credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Erreur lors de l\'enregistrement');
        }

        onSuccess();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Nom"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              required
              error={!formData.nom}
              helperText={!formData.nom ? 'Ce champ est requis' : ''}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Prénom"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              required
              error={!formData.prenom}
              helperText={!formData.prenom ? 'Ce champ est requis' : ''}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              error={!formData.email}
              helperText={!formData.email ? 'Ce champ est requis' : ''}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="CIN"
              name="cin"
              value={formData.cin}
              onChange={handleChange}
              required
              error={!formData.cin}
              helperText={!formData.cin ? 'Ce champ est requis' : ''}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={frLocale}>
              <DatePicker
                label="Date de naissance"
                value={formData.date_naissance}
                onChange={handleDateChange}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    fullWidth 
                    required 
                    error={!formData.date_naissance}
                    helperText={!formData.date_naissance ? 'Ce champ est requis' : ''}
                  />
                )}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Téléphone"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              required
              error={!formData.telephone}
              helperText={!formData.telephone ? 'Ce champ est requis' : ''}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Adresse"
              name="adresse"
              value={formData.adresse}
              onChange={handleChange}
              required
              error={!formData.adresse}
              helperText={!formData.adresse ? 'Ce champ est requis' : ''}
              multiline
              rows={2}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Poste"
              name="post"
              value={formData.post}
              onChange={handleChange}
              required
              error={!formData.post}
              helperText={!formData.post ? 'Ce champ est requis' : ''}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Niveau d'étude"
              name="niveau_etude"
              value={formData.niveau_etude}
              onChange={handleChange}
              required
              error={!formData.niveau_etude}
              helperText={!formData.niveau_etude ? 'Ce champ est requis' : ''}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Expérience"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              required
              error={!formData.experience}
              helperText={!formData.experience ? 'Ce champ est requis' : ''}
              multiline
              rows={2}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              type="file"
              label="CV"
              name="cv"
              onChange={handleFileChange}
              InputLabelProps={{ shrink: true }}
              inputProps={{ accept: '.pdf,.doc,.docx' }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              type="file"
              label="Lettre de motivation"
              name="lettre_motivation"
              onChange={handleFileChange}
              InputLabelProps={{ shrink: true }}
              inputProps={{ accept: '.pdf,.doc,.docx' }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              type="file"
              label="Diplôme"
              name="diplome"
              onChange={handleFileChange}
              InputLabelProps={{ shrink: true }}
              inputProps={{ accept: '.pdf,.jpg,.png' }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Année d'obtention"
              name="annee_obtention"
              value={formData.annee_obtention}
              onChange={handleChange}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={onCancel}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Enregistrer'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default CandidatForm; 