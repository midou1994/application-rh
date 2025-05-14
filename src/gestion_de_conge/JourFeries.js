import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle,
  Snackbar,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import axios from 'axios';
import { format } from 'date-fns';

const JourFeries = () => {
  const [joursFeries, setJoursFeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [currentJour, setCurrentJour] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  // Fonction pour afficher les notifications
  const showSnackbar = (message) => {
    setSnackbar({ open: true, message });
    setTimeout(() => setSnackbar({ ...snackbar, open: false }), 3000);
  };

  // Chargement des jours fériés
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/jourferie/getAllJourferie');
        setJoursFeries(response.data);
      } catch (error) {
        showSnackbar('Erreur lors du chargement des données');
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // Suppression d'un jour férié
  const handleDelete = async (id) => {
    if (window.confirm('Confirmer la suppression ?')) {
      try {
        await axios.delete(`http://localhost:5000/jourferie/deletJourferieBYID/${id}`);
        setJoursFeries(joursFeries.filter(jour => jour._id !== id));
        showSnackbar('Jour férié supprimé avec succès');
      } catch (error) {
        showSnackbar('Erreur lors de la suppression');
      }
    }
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const jourData = {
        ...currentJour,
        date: new Date(currentJour.date)
      };

      if (currentJour._id) {
        await axios.put(
          `http://localhost:5000/jourferie/updateJourferieBYID/${currentJour._id}`,
          jourData
        );
      } else {
        await axios.post('http://localhost:5000/jourferie/addJourferie', jourData);
      }
      
      const response = await axios.get('http://localhost:5000/jourferie/getAllJourferie');
      setJoursFeries(response.data);
      handleClose();
    } catch (error) {
      showSnackbar('Erreur lors de la sauvegarde');
    }
  };

  // Fermeture de la modal
  const handleClose = () => {
    setOpen(false);
    setCurrentJour({});
  };

  return (
    <div>
      <Button 
        variant="contained" 
        onClick={() => { setCurrentJour({}); setOpen(true); }}
        sx={{ mb: 2 }}
      >
        Ajouter un jour férié
      </Button>

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Libellé</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Jour</TableCell>
                <TableCell>Année</TableCell>
                <TableCell>Durée</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {joursFeries.map((jour) => (
                <TableRow key={jour._id}>
                  <TableCell>{jour.libelle}</TableCell>
                  <TableCell>{format(new Date(jour.date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{jour.jour}</TableCell>
                  <TableCell>{jour.annee}</TableCell>
                  <TableCell>{jour.nombre_de_jours} jour(s)</TableCell>
                  <TableCell>
                    <Button onClick={() => { setCurrentJour(jour); setOpen(true); }}>
                      Modifier
                    </Button>
                    <Button onClick={() => handleDelete(jour._id)} color="error">
                      Supprimer
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{currentJour._id ? 'Modifier' : 'Ajouter'} un jour férié</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              label="Libellé"
              fullWidth
              margin="dense"
              value={currentJour.libelle || ''}
              onChange={(e) => setCurrentJour({ ...currentJour, libelle: e.target.value })}
              required
            />

            <TextField
              label="Date"
              type="date"
              fullWidth
              margin="dense"
              value={currentJour.date?.split('T')[0] || ''}
              onChange={(e) => setCurrentJour({ ...currentJour, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
            />

            <FormControl fullWidth margin="dense">
              <InputLabel>Jour de la semaine</InputLabel>
              <Select
                value={currentJour.jour || ''}
                onChange={(e) => setCurrentJour({ ...currentJour, jour: e.target.value })}
                required
              >
                <MenuItem value="Lundi">Lundi</MenuItem>
                <MenuItem value="Mardi">Mardi</MenuItem>
                <MenuItem value="Mercredi">Mercredi</MenuItem>
                <MenuItem value="Jeudi">Jeudi</MenuItem>
                <MenuItem value="Vendredi">Vendredi</MenuItem>
                <MenuItem value="Samedi">Samedi</MenuItem>
                <MenuItem value="Dimanche">Dimanche</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Année"
              type="number"
              fullWidth
              margin="dense"
              value={currentJour.annee || ''}
              onChange={(e) => setCurrentJour({ ...currentJour, annee: e.target.value })}
              required
            />

            <TextField
              label="Durée (jours)"
              type="number"
              fullWidth
              margin="dense"
              value={currentJour.nombre_de_jours || ''}
              onChange={(e) => setCurrentJour({ ...currentJour, nombre_de_jours: e.target.value })}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Annuler</Button>
            <Button type="submit" color="primary">Sauvegarder</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </div>
  );
};

export default JourFeries;