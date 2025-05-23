import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Rating
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import frLocale from 'date-fns/locale/fr';

const EntretienList = () => {
  const [entretiens, setEntretiens] = useState([]);
  const [candidats, setCandidats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEntretien, setSelectedEntretien] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [openFicheDialog, setOpenFicheDialog] = useState(false);
  const [selectedFiche, setSelectedFiche] = useState(null);
  const [formData, setFormData] = useState({
    date: null,
    heure: '',
    type_entretien: 'Présentiel',
    notes: '',
    candidat: '',
  });
  const [ficheFormData, setFicheFormData] = useState({
    recruteur: '',
    technique_evaluation: '',
    communication_evaluation: '',
    motivation_evaluation: '',
    preparation_evaluation: '',
    commantaire_recruteur: '',
    note: 0,
    decision: 'Réserve'
  });
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEntretiens();
    fetchCandidats();
    // Récupérer les informations de l'utilisateur connecté
    const fetchUserData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("loggedUser"));
        if (!storedUser?._id) {
          console.error('No logged user found');
          return;
        }

        const response = await fetch(`http://localhost:5000/users/getuserBYID/${storedUser._id}`, {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData = await response.json();
        console.log('Fetched user data:', userData);

        if (userData) {
          setUser(userData);
          // Pré-remplir le recruteur avec le nom et prénom de l'utilisateur connecté
          setFicheFormData(prev => ({
            ...prev,
            recruteur: `${userData.prenom} ${userData.nom}`
          }));
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const fetchEntretiens = async () => {
    try {
      const response = await fetch('http://localhost:5000/rendezvous/getAllRendezVous', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Erreur lors de la récupération des entretiens');
      const data = await response.json();
      setEntretiens(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidats = async () => {
    try {
      const response = await fetch('http://localhost:5000/candidat/getAllCandidats', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Erreur lors de la récupération des candidats');
      const data = await response.json();
      setCandidats(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet entretien ?')) {
      try {
        const response = await fetch(`http://localhost:5000/rendezvous/deleteRendezVous/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Erreur lors de la suppression');
        fetchEntretiens();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleViewDetails = (entretien) => {
    setSelectedEntretien(entretien);
    setOpenDialog(true);
  };

  const handleAddEntretien = () => {
    setFormData({
      date: null,
      heure: '',
      type_entretien: 'Présentiel',
      notes: '',
      candidat: '',
    });
    setOpenFormDialog(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Récupérer les informations du candidat sélectionné
      const selectedCandidat = candidats.find(c => c._id === formData.candidat);
      if (!selectedCandidat) {
        throw new Error('Candidat non trouvé');
      }

      // Préparer les données du rendez-vous
      const rendezVousData = {
        ...formData,
        date: formData.date.toISOString(),
        email: selectedCandidat.email, // Ajouter l'email du candidat
        nom: selectedCandidat.nom,
        prenom: selectedCandidat.prenom
      };

      // Envoyer la requête pour créer le rendez-vous et envoyer l'email
      const response = await fetch('http://localhost:5000/rendezvous/addRendezVous', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rendezVousData),
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Erreur lors de l\'ajout de l\'entretien');
      
      setOpenFormDialog(false);
      fetchEntretiens();
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmé': return 'success';
      case 'En attente': return 'warning';
      case 'Annulé': return 'error';
      case 'Terminé': return 'info';
      default: return 'default';
    }
  };

  const handleOpenFiche = (entretien) => {
    console.log('Selected entretien:', entretien);
    setSelectedEntretien(entretien);
    
    // S'assurer que le recruteur est toujours rempli avec les informations de l'utilisateur connecté
    if (user) {
      setFicheFormData(prev => ({
        ...prev,
        recruteur: `${user.prenom} ${user.nom}`
      }));
    }
    
    setOpenFicheDialog(true);
  };

  const handleFicheFormChange = (e) => {
    const { name, value } = e.target;
    setFicheFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFicheSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!selectedEntretien) {
        throw new Error('Entretien non sélectionné');
      }

      if (!user) {
        throw new Error('Utilisateur non connecté');
      }

      // S'assurer que le recruteur est toujours rempli avec les informations de l'utilisateur connecté
      const ficheData = {
        ...ficheFormData,
        recruteur: `${user.prenom} ${user.nom}`,
        candidat: selectedEntretien.candidat
      };

      console.log('Sending fiche data:', ficheData);

      const response = await fetch('http://localhost:5000/ficheentretient/addFicheEntretient', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ficheData),
        credentials: 'include'
      });

      const responseData = await response.json();
      console.log('Server response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Erreur lors de l\'ajout de la fiche d\'entretien');
      }

      // Mettre à jour le statut du rendez-vous à "Terminé"
      const updateData = {
        date: selectedEntretien.date,
        heure: selectedEntretien.heure,
        type_entretien: selectedEntretien.type_entretien,
        statut: 'Terminé',
        notes: selectedEntretien.notes,
        isActive: selectedEntretien.isActive,
        candidat: selectedEntretien.candidat
      };

      console.log('Updating rendez-vous with data:', updateData);

      const updateResponse = await fetch(`http://localhost:5000/rendezvous/updateRendezVous/${selectedEntretien._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
        credentials: 'include'
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.message || 'Erreur lors de la mise à jour du statut du rendez-vous');
      }

      const updatedRendezVous = await updateResponse.json();
      console.log('Updated rendez-vous:', updatedRendezVous);
      
      setOpenFicheDialog(false);
      setFicheFormData({
        recruteur: `${user.prenom} ${user.nom}`,
        technique_evaluation: '',
        communication_evaluation: '',
        motivation_evaluation: '',
        preparation_evaluation: '',
        commantaire_recruteur: '',
        note: 0,
        decision: 'Réserve'
      });

      // Rafraîchir la liste des entretiens
      await fetchEntretiens();
    } catch (err) {
      console.error('Error in handleFicheSubmit:', err);
      setError(err.message);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Liste des Entretiens</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddEntretien}
        >
          Ajouter un entretien
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Candidat</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Heure</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entretiens.map((entretien) => (
              <TableRow key={entretien._id}>
                <TableCell>{`${entretien.candidat?.prenom || ''} ${entretien.candidat?.nom || ''}`}</TableCell>
                <TableCell>{new Date(entretien.date).toLocaleDateString()}</TableCell>
                <TableCell>{entretien.heure}h</TableCell>
                <TableCell>{entretien.type_entretien}</TableCell>
                <TableCell>
                  <Chip 
                    label={entretien.statut} 
                    color={getStatusColor(entretien.statut)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton 
                    onClick={() => handleViewDetails(entretien)}
                    disabled={entretien.statut === 'Terminé'}
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton 
                    onClick={() => handleOpenFiche(entretien)}
                    disabled={entretien.statut === 'Terminé'}
                  >
                    <AssignmentIcon />
                  </IconButton>
                  <IconButton 
                    onClick={() => handleDelete(entretien._id)}
                    disabled={entretien.statut === 'Terminé'}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog pour les détails */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Détails de l'Entretien</DialogTitle>
        <DialogContent>
          {selectedEntretien && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>Informations du Candidat</Typography>
              <Typography><strong>Nom:</strong> {selectedEntretien.candidat?.nom}</Typography>
              <Typography><strong>Prénom:</strong> {selectedEntretien.candidat?.prenom}</Typography>
              <Typography><strong>Email:</strong> {selectedEntretien.candidat?.email}</Typography>
              <Typography><strong>Téléphone:</strong> {selectedEntretien.candidat?.telephone}</Typography>

              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Détails de l'Entretien</Typography>
              <Typography><strong>Date:</strong> {new Date(selectedEntretien.date).toLocaleDateString()}</Typography>
              <Typography><strong>Heure:</strong> {selectedEntretien.heure}h</Typography>
              <Typography><strong>Type d'entretien:</strong> {selectedEntretien.type_entretien}</Typography>
              <Typography><strong>Statut:</strong> {selectedEntretien.statut}</Typography>
              <Typography><strong>Notes:</strong> {selectedEntretien.notes}</Typography>
              <Typography><strong>Statut actif:</strong> {selectedEntretien.isActive ? 'Oui' : 'Non'}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog pour ajouter un entretien */}
      <Dialog open={openFormDialog} onClose={() => setOpenFormDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Ajouter un Entretien</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={frLocale}>
              <DatePicker
                label="Date"
                value={formData.date}
                onChange={(newValue) => {
                  setFormData(prev => ({ ...prev, date: newValue }));
                }}
                renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 2 }} />}
              />
            </LocalizationProvider>
            <TextField
              fullWidth
              label="Heure"
              name="heure"
              value={formData.heure}
              onChange={handleFormChange}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              select
              label="Type d'entretien"
              name="type_entretien"
              value={formData.type_entretien}
              onChange={handleFormChange}
              sx={{ mb: 2 }}
              required
            >
              <MenuItem value="Présentiel">Présentiel</MenuItem>
              <MenuItem value="Virtuel">Virtuel</MenuItem>
              <MenuItem value="Téléphonique">Téléphonique</MenuItem>
            </TextField>
            <TextField
              fullWidth
              select
              label="Candidat"
              name="candidat"
              value={formData.candidat}
              onChange={handleFormChange}
              sx={{ mb: 2 }}
              required
            >
              {candidats.map((candidat) => (
                <MenuItem key={candidat._id} value={candidat._id}>
                  {candidat.nom} {candidat.prenom}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleFormChange}
              multiline
              rows={4}
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFormDialog(false)}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained">Ajouter</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog pour la fiche d'entretien */}
      <Dialog open={openFicheDialog} onClose={() => setOpenFicheDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Fiche d'Entretien</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleFicheSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Recruteur"
              name="recruteur"
              value={ficheFormData.recruteur}
              disabled
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              label="Évaluation Technique"
              name="technique_evaluation"
              value={ficheFormData.technique_evaluation}
              onChange={handleFicheFormChange}
              multiline
              rows={2}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              label="Évaluation Communication"
              name="communication_evaluation"
              value={ficheFormData.communication_evaluation}
              onChange={handleFicheFormChange}
              multiline
              rows={2}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              label="Évaluation Motivation"
              name="motivation_evaluation"
              value={ficheFormData.motivation_evaluation}
              onChange={handleFicheFormChange}
              multiline
              rows={2}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              label="Évaluation Préparation"
              name="preparation_evaluation"
              value={ficheFormData.preparation_evaluation}
              onChange={handleFicheFormChange}
              multiline
              rows={2}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              label="Commentaire Recruteur"
              name="commantaire_recruteur"
              value={ficheFormData.commantaire_recruteur}
              onChange={handleFicheFormChange}
              multiline
              rows={3}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              type="number"
              label="Note"
              name="note"
              value={ficheFormData.note}
              onChange={handleFicheFormChange}
              inputProps={{ min: 0, max: 20 }}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              select
              label="Décision"
              name="decision"
              value={ficheFormData.decision}
              onChange={handleFicheFormChange}
              sx={{ mb: 2 }}
              required
            >
              <MenuItem value="Accepté">Accepté</MenuItem>
              <MenuItem value="Rejeté">Rejeté</MenuItem>
              <MenuItem value="Réserve">Réserve</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFicheDialog(false)}>Annuler</Button>
          <Button onClick={handleFicheSubmit} variant="contained">Enregistrer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EntretienList; 