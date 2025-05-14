// Conges.jsx
import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, Button, TextField, Dialog, DialogActions, 
  DialogContent, DialogTitle, Snackbar, MenuItem, Select,
  FormControl, InputLabel, Typography 
} from '@mui/material';
import axios from 'axios';
import { format } from 'date-fns';
import jsPDF from 'jspdf';

const Conges = () => {
  const [conges, setConges] = useState([]);
  const [employes, setEmployes] = useState([]);
  const [open, setOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [currentConge, setCurrentConge] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [filterEmploye, setFilterEmploye] = useState('');

  useEffect(() => {
    fetchConges();
    fetchEmployes();
  }, []);

  const fetchConges = async () => {
    try {
      const response = await axios.get('http://localhost:5000/demandeconge/getAllDemandescoge');
      const demandes = response.data;

      const demandesAvecEmployes = await Promise.all(
        demandes.map(async (demande) => {
          try {
            const empRes = await axios.get(`http://localhost:5000/employe/getEmployesBYID/${demande.employe}`);
            return { ...demande, employe: empRes.data };
          } catch {
            return { ...demande, employe: { nom: 'Inconnu', prenom: '' } };
          }
        })
      );

      setConges(demandesAvecEmployes);
    } catch (error) {
      showSnackbar('Erreur lors du chargement des congés');
    }
  };

  const fetchEmployes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/employe/getAllEmployes');
      setEmployes(response.data);
    } catch (error) {
      showSnackbar('Erreur lors du chargement des employés');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const startDate = new Date(currentConge.date_debut);
      const endDate = new Date(currentConge.date_fin);
      const timeDiff = endDate.getTime() - startDate.getTime();
      const nombre_jrs = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

      const congeData = {
        ...currentConge,
        date_debut: startDate,
        date_fin: endDate,
        nombre_jrs,
      };

      if (currentConge._id) {
        await axios.put(`http://localhost:5000/demandeconge/updateDemandecongeBYID/${currentConge._id}`, congeData);
      } else {
        await axios.post('http://localhost:5000/demandeconge/addDemandesconge', congeData);
      }

      fetchConges();
      handleClose();
    } catch (error) {
      showSnackbar('Erreur lors de la sauvegarde');
    }
  };

  const updateStatut = async (id, newStatut) => {
    try {
      const { data: updatedConge } = await axios.put(
        `http://localhost:5000/demandeconge/updatestatubyid/${id}`,
        { etat_conge: newStatut }
      );

      if (newStatut === 'Approuvé') {
        await axios.post('http://localhost:5000/conge/addconge', updatedConge);
      }

      fetchConges();
      showSnackbar(`Congé ${newStatut}`);
      setDetailOpen(false);
    } catch (error) {
      showSnackbar("Erreur de mise à jour du statut");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Confirmer la suppression ?')) {
      try {
        await axios.delete(`http://localhost:5000/demandeconge/deletDemandescongeBYID/${id}`);
        fetchConges();
        showSnackbar('Congé supprimé avec succès');
      } catch (error) {
        showSnackbar('Erreur lors de la suppression');
      }
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text(`Demande de Congé`, 10, 10);
    doc.text(`Employé : ${currentConge.employe?.nom || ''} ${currentConge.employe?.prenom || ''}`, 10, 20);
    doc.text(`Date début : ${format(new Date(currentConge.date_debut), 'dd/MM/yyyy')}`, 10, 30);
    doc.text(`Date fin : ${format(new Date(currentConge.date_fin), 'dd/MM/yyyy')}`, 10, 40);
    doc.text(`Jours : ${currentConge.nombre_jrs}`, 10, 50);
    doc.text(`Type : ${currentConge.type_conge}`, 10, 60);
    doc.text(`Statut : ${currentConge.etat_conge}`, 10, 70);
    doc.save(`conge_${currentConge._id}.pdf`);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentConge({});
  };

  const showSnackbar = (message) => {
    setSnackbar({ open: true, message });
    setTimeout(() => setSnackbar({ ...snackbar, open: false }), 3000);
  };

  return (
    <div>
      <FormControl sx={{ minWidth: 200, mr: 2 }}>
        <InputLabel>Filtrer par employé</InputLabel>
        <Select
          value={filterEmploye}
          onChange={(e) => setFilterEmploye(e.target.value)}
          label="Filtrer par employé"
        >
          <MenuItem value="">Tous</MenuItem>
          {employes.map(emp => (
            <MenuItem key={emp._id} value={emp._id}>{emp.nom} {emp.prenom}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button 
        variant="contained" 
        onClick={() => { setCurrentConge({}); setOpen(true); }}
        sx={{ mb: 2 }}
      >
        Nouveau Congé
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date Début</TableCell>
              <TableCell>Date Fin</TableCell>
              <TableCell>Jours</TableCell>
              <TableCell>Employé</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {conges.filter(c => !filterEmploye || c.employe?._id === filterEmploye).map((conge) => (
              <TableRow key={conge._id}>
                <TableCell>{conge.date_debut ? format(new Date(conge.date_debut), 'dd/MM/yyyy') : '—'}</TableCell>
                <TableCell>{conge.date_fin ? format(new Date(conge.date_fin), 'dd/MM/yyyy') : '—'}</TableCell>
                <TableCell>{conge.nombre_jrs}</TableCell>
                <TableCell>{conge.employe?.nom} {conge.employe?.prenom}</TableCell>
                <TableCell>{conge.type_conge}</TableCell>
                <TableCell>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '8px',
                    color: 'white',
                    backgroundColor:
                      conge.etat_conge === 'Approuvé' ? 'green' :
                      conge.etat_conge === 'Rejeté' ? 'red' :
                      'orange'
                  }}>
                    {conge.etat_conge}
                  </span>
                </TableCell>
                <TableCell>
                  <Button onClick={() => {
                    const employeId = conge.employe?._id || conge.employe;
                    setCurrentConge({ ...conge, employe: employeId });
                    setOpen(true);
                  }}>Modifier</Button>
                  <Button onClick={() => handleDelete(conge._id)} color="error">Supprimer</Button>
                  <Button onClick={() => { setCurrentConge(conge); setDetailOpen(true); }}>Voir</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{currentConge._id ? 'Modifier' : 'Nouveau'} Congé</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              label="Date Début"
              type="date"
              value={currentConge.date_debut?.substring(0, 10) || ''}
              onChange={(e) => setCurrentConge({ ...currentConge, date_debut: e.target.value })}
              fullWidth
              margin="dense"
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Date Fin"
              type="date"
              value={currentConge.date_fin?.substring(0, 10) || ''}
              onChange={(e) => setCurrentConge({ ...currentConge, date_fin: e.target.value })}
              fullWidth
              margin="dense"
              InputLabelProps={{ shrink: true }}
            />

            <FormControl fullWidth margin="dense">
              <InputLabel>Employé</InputLabel>
              <Select
                value={currentConge.employe || ''}
                onChange={(e) => setCurrentConge({ ...currentConge, employe: e.target.value })}
              >
                {employes.map((employe) => (
                  <MenuItem key={employe._id} value={employe._id}>
                    {employe.nom} {employe.prenom}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="dense">
              <InputLabel>Type de congé</InputLabel>
              <Select
                value={currentConge.type_conge || ''}
                onChange={(e) => setCurrentConge({ ...currentConge, type_conge: e.target.value })}
              >
                <MenuItem value="Annuel">Annuel</MenuItem>
                <MenuItem value="Maladie">Maladie</MenuItem>
                <MenuItem value="Maternité">Maternité</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Annuler</Button>
            <Button type="submit" color="primary">Sauvegarder</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)}>
        <DialogTitle>Détails de la demande</DialogTitle>
        <DialogContent>
          <Typography>Employé : {currentConge.employe?.nom} {currentConge.employe?.prenom}</Typography>
          <Typography>Date début : {currentConge.date_debut ? format(new Date(currentConge.date_debut), 'dd/MM/yyyy') : '—'}</Typography>
          <Typography>Date fin : {currentConge.date_fin ? format(new Date(currentConge.date_fin), 'dd/MM/yyyy') : '—'}</Typography>
          <Typography>Jours : {currentConge.nombre_jrs}</Typography>
          <Typography>Type : {currentConge.type_conge}</Typography>
          <Typography>Statut : {currentConge.etat_conge}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => updateStatut(currentConge._id, "Approuvé")} color="success">Approuver</Button>
          <Button onClick={() => updateStatut(currentConge._id, "Rejeté")} color="error">Rejeter</Button>
          <Button onClick={generatePDF}>Télécharger PDF</Button>
          <Button onClick={() => setDetailOpen(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} message={snackbar.message} />
    </div>
  );
};

export default Conges;
