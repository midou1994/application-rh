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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  Event as EventIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import CandidatForm from './CandidatForm';
import EntretienForm from './EntretienForm';

const CandidatList = () => {
  const [candidats, setCandidats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCandidat, setSelectedCandidat] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [openEntretienDialog, setOpenEntretienDialog] = useState(false);
  const [editingCandidat, setEditingCandidat] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCandidats();
  }, []);

  const fetchCandidats = async () => {
    try {
      const response = await fetch('http://localhost:5000/candidat/getAllCandidats', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Erreur lors de la récupération des candidats');
      const data = await response.json();
      setCandidats(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce candidat ?')) {
      try {
        const response = await fetch(`http://localhost:5000/candidat/deletCandidatsBYID/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Erreur lors de la suppression');
        fetchCandidats();
      } catch (error) {
        setError(error.message);
      }
    }
  };

  const handleViewDetails = (candidat) => {
    setSelectedCandidat(candidat);
    setOpenDialog(true);
  };

  const handleAddEntretien = (candidat) => {
    setSelectedCandidat(candidat);
    setOpenEntretienDialog(true);
  };

  const handleEdit = (candidat) => {
    setEditingCandidat(candidat);
    setOpenFormDialog(true);
  };

  const handleAdd = () => {
    setEditingCandidat(null);
    setOpenFormDialog(true);
  };

  const handleFormClose = () => {
    setOpenFormDialog(false);
    setEditingCandidat(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    fetchCandidats();
  };

  const handleEntretienClose = () => {
    setOpenEntretienDialog(false);
    setSelectedCandidat(null);
  };

  const handleEntretienSuccess = () => {
    handleEntretienClose();
    fetchCandidats();
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Liste des Candidats</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          Ajouter un candidat
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Prénom</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Téléphone</TableCell>
              <TableCell>Poste</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {candidats.map((candidat) => (
              <TableRow key={candidat._id}>
                <TableCell>{candidat.nom}</TableCell>
                <TableCell>{candidat.prenom}</TableCell>
                <TableCell>{candidat.email}</TableCell>
                <TableCell>{candidat.telephone}</TableCell>
                <TableCell>{candidat.post}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleViewDetails(candidat)}>
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton onClick={() => handleEdit(candidat)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(candidat._id)}>
                    <DeleteIcon />
                  </IconButton>
                  <IconButton onClick={() => handleAddEntretien(candidat)}>
                    <EventIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal pour les détails */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Détails du Candidat</DialogTitle>
        <DialogContent>
          {selectedCandidat && (
            <Box sx={{ mt: 2 }}>
              <Typography><strong>Nom:</strong> {selectedCandidat.nom}</Typography>
              <Typography><strong>Prénom:</strong> {selectedCandidat.prenom}</Typography>
              <Typography><strong>Email:</strong> {selectedCandidat.email}</Typography>
              <Typography><strong>Téléphone:</strong> {selectedCandidat.telephone}</Typography>
              <Typography><strong>CIN:</strong> {selectedCandidat.cin}</Typography>
              <Typography><strong>Date de naissance:</strong> {new Date(selectedCandidat.date_naissance).toLocaleDateString()}</Typography>
              <Typography><strong>Adresse:</strong> {selectedCandidat.adresse}</Typography>
              <Typography><strong>Poste:</strong> {selectedCandidat.post}</Typography>
              <Typography><strong>Niveau d'étude:</strong> {selectedCandidat.niveau_etude}</Typography>
              <Typography><strong>Expérience:</strong> {selectedCandidat.experience}</Typography>
              {selectedCandidat.cv && (
                <Typography>
                  <strong>CV:</strong>{' '}
                  <a href={`http://localhost:5000/uploads/${selectedCandidat.cv}`} target="_blank" rel="noopener noreferrer">
                    Télécharger
                  </a>
                </Typography>
              )}
              {selectedCandidat.lettre_motivation && (
                <Typography>
                  <strong>Lettre de motivation:</strong>{' '}
                  <a href={`http://localhost:5000/uploads/${selectedCandidat.lettre_motivation}`} target="_blank" rel="noopener noreferrer">
                    Télécharger
                  </a>
                </Typography>
              )}
              {selectedCandidat.diplome && (
                <Typography>
                  <strong>Diplôme:</strong>{' '}
                  <a href={`http://localhost:5000/uploads/${selectedCandidat.diplome}`} target="_blank" rel="noopener noreferrer">
                    Télécharger
                  </a>
                </Typography>
              )}
              {selectedCandidat.annee_obtention && (
                <Typography><strong>Année d'obtention:</strong> {selectedCandidat.annee_obtention}</Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* Modal pour le formulaire de candidat */}
      <Dialog 
        open={openFormDialog} 
        onClose={handleFormClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingCandidat ? 'Modifier le candidat' : 'Ajouter un candidat'}
        </DialogTitle>
        <DialogContent>
          <CandidatForm 
            candidat={editingCandidat}
            onSuccess={handleFormSuccess}
            onCancel={handleFormClose}
          />
        </DialogContent>
      </Dialog>

      {/* Modal pour le formulaire d'entretien */}
      <Dialog 
        open={openEntretienDialog} 
        onClose={handleEntretienClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Planifier un entretien pour {selectedCandidat?.prenom} {selectedCandidat?.nom}
        </DialogTitle>
        <DialogContent>
          <EntretienForm 
            candidatId={selectedCandidat?._id}
            onSuccess={handleEntretienSuccess}
            onCancel={handleEntretienClose}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default CandidatList; 