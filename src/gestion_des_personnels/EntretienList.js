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
  Snackbar
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Assessment as AssessmentIcon,
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
  const [openEvaluationDialog, setOpenEvaluationDialog] = useState(false);
  const [openFicheDialog, setOpenFicheDialog] = useState(false);
  const [selectedFiche, setSelectedFiche] = useState(null);
  const [formData, setFormData] = useState({
    date: null,
    heure: '',
    type_entretien: 'Présentiel',
    notes: '',
    candidat: '',
  });
  const [evaluationData, setEvaluationData] = useState({
    recruteur: '',
    technique_evaluation: '',
    communication_evaluation: '',
    motivation_evaluation: '',
    preparation_evaluation: '',
    commantaire_recruteur: '',
    note: '',
    decision: 'Réserve',
    candidat: '',
    rendezVousId: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchEntretiens();
    fetchCandidats();
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

  const handleAddEvaluation = (entretien) => {
    setEvaluationData({
      recruteur: '',
      technique_evaluation: '',
      communication_evaluation: '',
      motivation_evaluation: '',
      preparation_evaluation: '',
      commantaire_recruteur: '',
      note: '',
      decision: 'Réserve',
      candidat: entretien.candidat._id,
      rendezVousId: entretien._id
    });
    setOpenEvaluationDialog(true);
  };

  const handleViewFiche = async (entretien) => {
    try {
      console.log('Fetching fiche for entretien:', entretien);
      
      // First try to get the fiche by candidat ID
      const response = await fetch(`http://localhost:5000/ficheentretient/getAllFicheEntretient`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des fiches d\'entretien');
      }
      
      const fiches = await response.json();
      console.log('All fiches:', fiches);
      
      // Find the fiche that matches this entretien's candidat
      const matchingFiche = fiches.find(fiche => 
        fiche.candidat && 
        (fiche.candidat._id === entretien.candidat._id || fiche.candidat === entretien.candidat._id)
      );
      console.log('Matching fiche:', matchingFiche);
      
      if (!matchingFiche) {
        setSnackbar({
          open: true,
          message: 'Aucune fiche d\'évaluation trouvée pour cet entretien',
          severity: 'warning'
        });
        return;
      }

      setSelectedFiche(matchingFiche);
      setOpenFicheDialog(true);
    } catch (err) {
      console.error('Error fetching fiche:', err);
      setError(err.message);
      setSnackbar({
        open: true,
        message: err.message,
        severity: 'error'
      });
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEvaluationChange = (e) => {
    const { name, value } = e.target;
    setEvaluationData(prev => ({
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

  const handleEvaluationSubmit = async (e) => {
    e.preventDefault();
    try {
      // First, add the evaluation fiche
      const response = await fetch('http://localhost:5000/ficheentretient/addFicheEntretient', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(evaluationData),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'ajout de l\'évaluation');
      }

      // Then, update the rendez-vous status to "Terminé" using the correct rendez-vous ID
      const rendezVousResponse = await fetch(`http://localhost:5000/rendezvous/updateRendezVous/${evaluationData.rendezVousId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ statut: 'Terminé' }),
        credentials: 'include'
      });

      if (!rendezVousResponse.ok) {
        throw new Error('Erreur lors de la mise à jour du statut du rendez-vous');
      }

      setOpenEvaluationDialog(false);
      fetchEntretiens(); // Refresh the list to show updated status
      setSnackbar({
        open: true,
        message: 'Évaluation ajoutée et rendez-vous terminé avec succès',
        severity: 'success'
      });
    } catch (err) {
      setError(err.message);
      setSnackbar({
        open: true,
        message: err.message,
        severity: 'error'
      });
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
                  <IconButton onClick={() => handleViewDetails(entretien)}>
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton onClick={() => handleAddEvaluation(entretien)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleViewFiche(entretien)}>
                    <AssessmentIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(entretien._id)}>
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

      {/* Dialog pour l'évaluation */}
      <Dialog open={openEvaluationDialog} onClose={() => setOpenEvaluationDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Évaluation de l'Entretien</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleEvaluationSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Recruteur"
              name="recruteur"
              value={evaluationData.recruteur}
              onChange={handleEvaluationChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Évaluation Technique"
              name="technique_evaluation"
              value={evaluationData.technique_evaluation}
              onChange={handleEvaluationChange}
              multiline
              rows={2}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Évaluation Communication"
              name="communication_evaluation"
              value={evaluationData.communication_evaluation}
              onChange={handleEvaluationChange}
              multiline
              rows={2}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Évaluation Motivation"
              name="motivation_evaluation"
              value={evaluationData.motivation_evaluation}
              onChange={handleEvaluationChange}
              multiline
              rows={2}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Évaluation Préparation"
              name="preparation_evaluation"
              value={evaluationData.preparation_evaluation}
              onChange={handleEvaluationChange}
              multiline
              rows={2}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Note (sur 20)"
              name="note"
              type="number"
              value={evaluationData.note}
              onChange={handleEvaluationChange}
              inputProps={{ min: 0, max: 20 }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              select
              label="Décision"
              name="decision"
              value={evaluationData.decision}
              onChange={handleEvaluationChange}
              required
              sx={{ mb: 2 }}
            >
              <MenuItem value="Accepté">Accepté</MenuItem>
              <MenuItem value="Rejeté">Rejeté</MenuItem>
              <MenuItem value="Réserve">Réserve</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Commentaires du Recruteur"
              name="commantaire_recruteur"
              value={evaluationData.commantaire_recruteur}
              onChange={handleEvaluationChange}
              multiline
              rows={4}
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEvaluationDialog(false)}>Annuler</Button>
          <Button onClick={handleEvaluationSubmit} variant="contained">Enregistrer</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog pour la fiche d'entretien */}
      <Dialog open={openFicheDialog} onClose={() => setOpenFicheDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Fiche d'Évaluation</DialogTitle>
        <DialogContent>
          {selectedFiche && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>Informations Générales</Typography>
              <Typography><strong>Recruteur:</strong> {selectedFiche.recruteur}</Typography>
              <Typography><strong>Décision:</strong> {selectedFiche.decision}</Typography>
              {selectedFiche.note && (
                <Typography><strong>Note:</strong> {selectedFiche.note}/20</Typography>
              )}

              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Évaluations</Typography>
              {selectedFiche.technique_evaluation && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1"><strong>Évaluation Technique:</strong></Typography>
                  <Typography>{selectedFiche.technique_evaluation}</Typography>
                </Box>
              )}
              {selectedFiche.communication_evaluation && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1"><strong>Évaluation Communication:</strong></Typography>
                  <Typography>{selectedFiche.communication_evaluation}</Typography>
                </Box>
              )}
              {selectedFiche.motivation_evaluation && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1"><strong>Évaluation Motivation:</strong></Typography>
                  <Typography>{selectedFiche.motivation_evaluation}</Typography>
                </Box>
              )}
              {selectedFiche.preparation_evaluation && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1"><strong>Évaluation Préparation:</strong></Typography>
                  <Typography>{selectedFiche.preparation_evaluation}</Typography>
                </Box>
              )}
              {selectedFiche.commantaire_recruteur && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1"><strong>Commentaires du Recruteur:</strong></Typography>
                  <Typography>{selectedFiche.commantaire_recruteur}</Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFicheDialog(false)}>Fermer</Button>
        </DialogActions>
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

export default EntretienList; 