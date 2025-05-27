import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  Divider,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  Autocomplete
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Timeline as TimelineIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

const CarriereList = () => {
  const [carrieres, setCarrieres] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCarriere, setSelectedCarriere] = useState(null);
  const [dialogType, setDialogType] = useState(''); // 'add', 'edit', 'view', 'competence', 'formation', 'mobilite', 'objectif'
  const [activeTab, setActiveTab] = useState(0);
  const [employeeNames, setEmployeeNames] = useState({});
  const [formData, setFormData] = useState({
    employee: '',
    posteActuel: {
      titre: '',
      departement: '',
      niveau: '',
      dateDebut: ''
    },
    competences: [],
    besoinsFormation: [],
    mobilite: {
      disponibilite: false,
      preferences: '',
      contraintes: ''
    },
    planCarriere: {
      objectifs: [{
        description: '',
        echeance: '',
        statut: 'En cours'
      }],
      cheminProgression: {
        posteSouhaite: '',
        delaiEstime: '',
        competencesRequises: []
      }
    },
    evaluations: []
  });

  // Temporary states for new items
  const [newCompetence, setNewCompetence] = useState('');
  const [newBesoinsFormation, setNewBesoinsFormation] = useState('');
  const [newCompetenceRequise, setNewCompetenceRequise] = useState('');

  // Add new state for section-specific modals
  const [openSectionDialog, setOpenSectionDialog] = useState(false);
  const [sectionType, setSectionType] = useState(''); // 'competence', 'formation', 'mobilite', 'objectif'
  const [sectionData, setSectionData] = useState(null);

  useEffect(() => {
    fetchCarrieres();
    fetchEmployees();
  }, []);

  const fetchCarrieres = async () => {
    try {
      const response = await fetch('http://localhost:5000/carriere', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Erreur lors de la récupération des carrières');
      const data = await response.json();
      setCarrieres(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch('http://localhost:5000/employe/getAllEmployes', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Erreur lors de la récupération des employés');
      const data = await response.json();
      setEmployees(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleOpenDialog = (type, carriere = null) => {
    setDialogType(type);
    if (carriere) {
      setSelectedCarriere(carriere);
      setFormData({
        ...carriere,
        employee: carriere.employee?._id || '',
        posteActuel: {
          titre: carriere.posteActuel?.titre || '',
          departement: carriere.posteActuel?.departement || '',
          niveau: carriere.posteActuel?.niveau || '',
          dateDebut: carriere.posteActuel?.dateDebut || ''
        },
        planCarriere: {
          objectifs: carriere.planCarriere?.objectifs || [{
            description: '',
            echeance: '',
            statut: 'En cours'
          }],
          cheminProgression: {
            posteSouhaite: carriere.planCarriere?.cheminProgression?.posteSouhaite || '',
            delaiEstime: carriere.planCarriere?.cheminProgression?.delaiEstime || '',
            competencesRequises: carriere.planCarriere?.cheminProgression?.competencesRequises || []
          }
        }
      });
    } else {
      setFormData({
        employee: '',
        posteActuel: {
          titre: '',
          departement: '',
          niveau: '',
          dateDebut: ''
        },
        competences: [],
        besoinsFormation: [],
        mobilite: {
          disponibilite: false,
          preferences: '',
          contraintes: ''
        },
        planCarriere: {
          objectifs: [{
            description: '',
            echeance: '',
            statut: 'En cours'
          }],
          cheminProgression: {
            posteSouhaite: '',
            delaiEstime: '',
            competencesRequises: []
          }
        },
        evaluations: []
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCarriere(null);
    setDialogType('');
    setActiveTab(0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleNestedInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleAddCompetence = () => {
    if (newCompetence.trim()) {
      setFormData(prev => ({
        ...prev,
        competences: [...prev.competences, newCompetence.trim()]
      }));
      setNewCompetence('');
    }
  };

  const handleAddBesoinsFormation = () => {
    if (newBesoinsFormation.trim()) {
      setFormData(prev => ({
        ...prev,
        besoinsFormation: [...prev.besoinsFormation, newBesoinsFormation.trim()]
      }));
      setNewBesoinsFormation('');
    }
  };

  const handleAddCompetenceRequise = () => {
    if (newCompetenceRequise.trim()) {
      setFormData(prev => ({
        ...prev,
        planCarriere: {
          ...prev.planCarriere,
          cheminProgression: {
            ...prev.planCarriere.cheminProgression,
            competencesRequises: [
              ...prev.planCarriere.cheminProgression.competencesRequises,
              newCompetenceRequise.trim()
            ]
          }
        }
      }));
      setNewCompetenceRequise('');
    }
  };

  const handleRemoveItem = (list, index) => {
    setFormData(prev => ({
      ...prev,
      [list]: prev[list].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation des champs obligatoires
    if (!formData.employee) {
      setError('L\'employé est obligatoire');
      return;
    }

    if (!formData.planCarriere.cheminProgression.posteSouhaite || 
        !formData.planCarriere.cheminProgression.delaiEstime) {
      setError('Le poste souhaité et le délai estimé sont obligatoires');
      return;
    }

    try {
      const url = selectedCarriere
        ? `http://localhost:5000/carriere/${selectedCarriere._id}`
        : 'http://localhost:5000/carriere';
      
      const method = selectedCarriere ? 'PUT' : 'POST';
      
      // Préparation des données pour l'envoi
      const dataToSend = {
        ...formData,
        planCarriere: {
          objectifs: formData.planCarriere.objectifs.map(obj => ({
            description: obj.description,
            echeance: obj.echeance,
            statut: obj.statut
          })),
          cheminProgression: {
            posteSouhaite: formData.planCarriere.cheminProgression.posteSouhaite,
            delaiEstime: formData.planCarriere.cheminProgression.delaiEstime,
            competencesRequises: formData.planCarriere.cheminProgression.competencesRequises
          }
        }
      };
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la sauvegarde');
      }

      setSuccess(selectedCarriere ? 'Carrière mise à jour avec succès' : 'Carrière créée avec succès');
      handleCloseDialog();
      fetchCarrieres();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette carrière ?')) return;
    
    try {
      const response = await fetch(`http://localhost:5000/carriere/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Erreur lors de la suppression');
      
      await fetchCarrieres();
    } catch (err) {
      setError(err.message);
    }
  };

  // Add new handler for section dialogs
  const handleOpenSectionDialog = (type, data = null) => {
    setSectionType(type);
    if (type === 'mobilite') {
      // Set ancienPoste from posteActuel.titre
      setSectionData({
        type: '',
        ancienPoste: selectedCarriere.posteActuel.titre,
        nouveauPoste: '',
        date: '',
        raison: ''
      });
    } else if (type === 'competence') {
      // Initialize competence data structure
      setSectionData({
        nom: '',
        niveau: '',
        dateAcquisition: ''
      });
    } else {
      setSectionData(data || {});
    }
    setOpenSectionDialog(true);
  };

  const handleCloseSectionDialog = () => {
    setOpenSectionDialog(false);
    setSectionType('');
    setSectionData(null);
  };

  // Add new handler for section submissions
  const handleSectionSubmit = async (e) => {
    e.preventDefault();
    try {
      let url = `http://localhost:5000/carriere/${selectedCarriere._id}`;
      let data = {};

      switch (sectionType) {
        case 'competence':
          url += '/competences';
          // Validate competence data before sending
          if (!sectionData.nom || !sectionData.niveau || !sectionData.dateAcquisition) {
            throw new Error('Tous les champs sont obligatoires pour la compétence');
          }
          // Format competence data according to the backend's expected format
          data = {
            nom: sectionData.nom,
            niveau: sectionData.niveau,
            dateAcquisition: new Date(sectionData.dateAcquisition).toISOString()
          };
          break;
        case 'formation':
          url += '/formations';
          data = { besoinsFormation: sectionData };
          break;
        case 'mobilite':
          url += '/mobilites';
          // Ensure all required fields are present
          if (!sectionData.type || !sectionData.ancienPoste || !sectionData.nouveauPoste || !sectionData.date || !sectionData.raison) {
            throw new Error('Tous les champs sont obligatoires pour la mobilité');
          }
          // Format mobilite data according to the backend's expected format
          data = {
            type: sectionData.type,
            ancienPoste: sectionData.ancienPoste,
            nouveauPoste: sectionData.nouveauPoste,
            date: new Date(sectionData.date).toISOString(),
            raison: sectionData.raison
          };
          break;
        case 'objectif':
          url += '/objectifs';
          data = { objectif: sectionData };
          break;
        default:
          throw new Error('Type de section non valide');
      }

      console.log('Sending data:', data); // Debug log

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la sauvegarde');
      }

      setSuccess('Élément ajouté avec succès');
      handleCloseSectionDialog();
      fetchCarrieres();
    } catch (err) {
      console.error('Error submitting section:', err);
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Gestion des Carrières</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog('add')}
        >
          Nouvelle Carrière
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employé</TableCell>
              <TableCell>Poste Actuel</TableCell>
              <TableCell>Département</TableCell>
              <TableCell>Niveau</TableCell>
              <TableCell>Date de début</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {carrieres.map((carriere) => (
              <TableRow key={carriere._id}>
                <TableCell>
                  {carriere.employee ? (
                    `${carriere.employee.nom} ${carriere.employee.prenom}`
                  ) : 'Employé non spécifié'}
                </TableCell>
                <TableCell>{carriere.posteActuel.titre}</TableCell>
                <TableCell>{carriere.posteActuel.departement}</TableCell>
                <TableCell>{carriere.posteActuel.niveau}</TableCell>
                <TableCell>{new Date(carriere.posteActuel.dateDebut).toLocaleDateString()}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog('view', carriere)} color="primary">
                    <ViewIcon />
                  </IconButton>
                  <IconButton onClick={() => handleOpenDialog('edit', carriere)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(carriere._id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogType === 'add' ? 'Nouvelle Carrière' : 
           dialogType === 'edit' ? 'Modifier la Carrière' : 
           'Détails de la Carrière'}
        </DialogTitle>
        <DialogContent>
          {dialogType === 'view' ? (
            <Box sx={{ mt: 2 }}>
              <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                <Tab icon={<WorkIcon />} label="Poste Actuel" />
                <Tab icon={<SchoolIcon />} label="Compétences" />
                <Tab icon={<SchoolIcon />} label="Formations" />
                <Tab icon={<TrendingUpIcon />} label="Mobilités" />
                <Tab icon={<TimelineIcon />} label="Plan de Carrière" />
              </Tabs>

              <Box sx={{ mt: 2 }}>
                {activeTab === 0 && (
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="h6">Poste Actuel</Typography>
                      <Typography>{selectedCarriere.posteActuel.titre}</Typography>
                      <Typography color="text.secondary">{selectedCarriere.posteActuel.departement}</Typography>
                      <Typography color="text.secondary">Niveau: {selectedCarriere.posteActuel.niveau}</Typography>
                      <Typography color="text.secondary">
                        Depuis: {new Date(selectedCarriere.posteActuel.dateDebut).toLocaleDateString()}
                      </Typography>
                    </Grid>
                  </Grid>
                )}

                {activeTab === 1 && (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">Compétences</Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleOpenSectionDialog('competence')}
                      >
                        Ajouter
                      </Button>
                    </Box>
                    <List>
                      {selectedCarriere.competences.map((competence, index) => (
                        <React.Fragment key={index}>
                          <ListItem>
                            <ListItemText
                              primary={competence.nom}
                              secondary={`Niveau: ${competence.niveau} - Acquis le: ${new Date(competence.dateAcquisition).toLocaleDateString()}`}
                            />
                          </ListItem>
                          {index < selectedCarriere.competences.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </Box>
                )}

                {activeTab === 2 && (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">Besoins de Formation</Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleOpenDialog('formation', selectedCarriere)}
                      >
                        Ajouter
                      </Button>
                    </Box>
                    <List>
                      {selectedCarriere.besoinsFormation.map((besoin, index) => (
                        <React.Fragment key={index}>
                          <ListItem>
                            <ListItemText
                              primary={besoin.type}
                              secondary={besoin.description}
                            />
                            <Chip
                              label={besoin.priorite}
                              color={besoin.priorite === 'Haute' ? 'error' : 
                                     besoin.priorite === 'Moyenne' ? 'warning' : 'success'}
                              size="small"
                            />
                          </ListItem>
                          {index < selectedCarriere.besoinsFormation.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </Box>
                )}

                {activeTab === 3 && (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">Mobilités</Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleOpenSectionDialog('mobilite')}
                      >
                        Ajouter
                      </Button>
                    </Box>
                    <List>
                      {selectedCarriere.mobilites && selectedCarriere.mobilites.map((mobilite, index) => (
                        <React.Fragment key={index}>
                          <ListItem>
                            <ListItemText
                              primary={`${mobilite.type || 'Type non spécifié'} - De ${mobilite.ancienPoste || 'Non spécifié'} à ${mobilite.nouveauPoste || 'Non spécifié'}`}
                              secondary={`Date: ${mobilite.date ? new Date(mobilite.date).toLocaleDateString() : 'Non spécifiée'} - Raison: ${mobilite.raison || 'Non spécifiée'}`}
                            />
                          </ListItem>
                          {index < selectedCarriere.mobilites.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </Box>
                )}

                {activeTab === 4 && (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">Plan de Carrière</Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleOpenDialog('objectif', selectedCarriere)}
                      >
                        Ajouter un objectif
                      </Button>
                    </Box>
                    <List>
                      {selectedCarriere.planCarriere.objectifs.map((objectif, index) => (
                        <React.Fragment key={index}>
                          <ListItem>
                            <ListItemText
                              primary={objectif.description}
                              secondary={`Échéance: ${new Date(objectif.echeance).toLocaleDateString()}`}
                            />
                            <Chip
                              label={objectif.statut}
                              color={objectif.statut === 'Atteint' ? 'success' : 
                                     objectif.statut === 'En cours' ? 'warning' : 'default'}
                              size="small"
                            />
                          </ListItem>
                          {index < selectedCarriere.planCarriere.objectifs.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </Box>
                )}
              </Box>
            </Box>
          ) : (
            <Box component="form" sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Employé</InputLabel>
                    <Select
                      name="employee"
                      value={formData.employee}
                      onChange={handleInputChange}
                      required
                      error={!formData.employee}
                    >
                      {employees.map((employee) => (
                        <MenuItem key={employee._id} value={employee._id}>
                          {`${employee.nom} ${employee.prenom}`}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Titre du poste"
                    name="posteActuel.titre"
                    value={formData.posteActuel.titre}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Département"
                    name="posteActuel.departement"
                    value={formData.posteActuel.departement}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Niveau"
                    name="posteActuel.niveau"
                    value={formData.posteActuel.niveau}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Date de début"
                    name="posteActuel.dateDebut"
                    type="date"
                    value={formData.posteActuel.dateDebut ? new Date(formData.posteActuel.dateDebut).toISOString().split('T')[0] : ''}
                    onChange={handleInputChange}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    <TrendingUpIcon sx={{ mr: 1 }} />
                    Plan de Carrière
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" gutterBottom>
                        Objectifs
                      </Typography>
                      {formData.planCarriere.objectifs.map((objectif, index) => (
                        <Box key={index} sx={{ mb: 2 }}>
                          <Grid container spacing={2}>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                label="Description de l'objectif"
                                value={objectif.description}
                                onChange={(e) => {
                                  const newObjectifs = [...formData.planCarriere.objectifs];
                                  newObjectifs[index] = {
                                    ...newObjectifs[index],
                                    description: e.target.value
                                  };
                                  handleNestedInputChange('planCarriere', 'objectifs', newObjectifs);
                                }}
                                multiline
                                rows={2}
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <TextField
                                fullWidth
                                label="Échéance"
                                type="date"
                                value={objectif.echeance ? new Date(objectif.echeance).toISOString().split('T')[0] : ''}
                                onChange={(e) => {
                                  const newObjectifs = [...formData.planCarriere.objectifs];
                                  newObjectifs[index] = {
                                    ...newObjectifs[index],
                                    echeance: e.target.value
                                  };
                                  handleNestedInputChange('planCarriere', 'objectifs', newObjectifs);
                                }}
                                InputLabelProps={{ shrink: true }}
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <FormControl fullWidth>
                                <InputLabel>Statut</InputLabel>
                                <Select
                                  value={objectif.statut}
                                  onChange={(e) => {
                                    const newObjectifs = [...formData.planCarriere.objectifs];
                                    newObjectifs[index] = {
                                      ...newObjectifs[index],
                                      statut: e.target.value
                                    };
                                    handleNestedInputChange('planCarriere', 'objectifs', newObjectifs);
                                  }}
                                  label="Statut"
                                >
                                  <MenuItem value="En cours">En cours</MenuItem>
                                  <MenuItem value="Atteint">Atteint</MenuItem>
                                  <MenuItem value="Non atteint">Non atteint</MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>
                          </Grid>
                        </Box>
                      ))}
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => {
                          const newObjectifs = [...formData.planCarriere.objectifs, {
                            description: '',
                            echeance: '',
                            statut: 'En cours'
                          }];
                          handleNestedInputChange('planCarriere', 'objectifs', newObjectifs);
                        }}
                        sx={{ mt: 1 }}
                      >
                        Ajouter un objectif
                      </Button>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Poste Souhaité"
                        value={formData.planCarriere.cheminProgression.posteSouhaite}
                        onChange={(e) => handleNestedInputChange('planCarriere', 'cheminProgression', {
                          ...formData.planCarriere.cheminProgression,
                          posteSouhaite: e.target.value
                        })}
                        required
                        error={!formData.planCarriere.cheminProgression.posteSouhaite}
                        helperText={!formData.planCarriere.cheminProgression.posteSouhaite ? "Ce champ est obligatoire" : ""}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Délai Estimé"
                        value={formData.planCarriere.cheminProgression.delaiEstime}
                        onChange={(e) => handleNestedInputChange('planCarriere', 'cheminProgression', {
                          ...formData.planCarriere.cheminProgression,
                          delaiEstime: e.target.value
                        })}
                        required
                        error={!formData.planCarriere.cheminProgression.delaiEstime}
                        helperText={!formData.planCarriere.cheminProgression.delaiEstime ? "Ce champ est obligatoire" : ""}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          {dialogType !== 'view' && (
            <Button onClick={handleSubmit} variant="contained">
              {dialogType === 'add' ? 'Créer' : 'Enregistrer'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

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
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>

      {/* Add the section dialog */}
      <Dialog open={openSectionDialog} onClose={handleCloseSectionDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {sectionType === 'competence' ? 'Ajouter une compétence' :
           sectionType === 'formation' ? 'Ajouter une formation' :
           sectionType === 'mobilite' ? 'Ajouter une mobilité' :
           'Ajouter un objectif'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            {sectionType === 'competence' && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nom de la compétence"
                    value={sectionData?.nom || ''}
                    onChange={(e) => setSectionData({ ...sectionData, nom: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Niveau"
                    value={sectionData?.niveau || ''}
                    onChange={(e) => setSectionData({ ...sectionData, niveau: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Date d'acquisition"
                    type="date"
                    value={sectionData?.dateAcquisition ? new Date(sectionData.dateAcquisition).toISOString().split('T')[0] : ''}
                    onChange={(e) => setSectionData({ ...sectionData, dateAcquisition: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
              </Grid>
            )}

            {sectionType === 'formation' && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Type de formation"
                    value={sectionData?.type || ''}
                    onChange={(e) => setSectionData({ ...sectionData, type: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={sectionData?.description || ''}
                    onChange={(e) => setSectionData({ ...sectionData, description: e.target.value })}
                    multiline
                    rows={3}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Priorité</InputLabel>
                    <Select
                      value={sectionData?.priorite || ''}
                      onChange={(e) => setSectionData({ ...sectionData, priorite: e.target.value })}
                      label="Priorité"
                      required
                    >
                      <MenuItem value="Haute">Haute</MenuItem>
                      <MenuItem value="Moyenne">Moyenne</MenuItem>
                      <MenuItem value="Basse">Basse</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            )}

            {sectionType === 'mobilite' && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Type de mobilité</InputLabel>
                    <Select
                      value={sectionData?.type || ''}
                      onChange={(e) => setSectionData({ ...sectionData, type: e.target.value })}
                      label="Type de mobilité"
                      required
                    >
                      <MenuItem value="Promotion">Promotion</MenuItem>
                      <MenuItem value="Mutation">Mutation</MenuItem>
                      <MenuItem value="Changement de poste">Changement de poste</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Ancien poste"
                    value={sectionData?.ancienPoste || ''}
                    onChange={(e) => setSectionData({ ...sectionData, ancienPoste: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nouveau poste"
                    value={sectionData?.nouveauPoste || ''}
                    onChange={(e) => setSectionData({ ...sectionData, nouveauPoste: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Date"
                    type="date"
                    value={sectionData?.date ? new Date(sectionData.date).toISOString().split('T')[0] : ''}
                    onChange={(e) => setSectionData({ ...sectionData, date: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Raison"
                    value={sectionData?.raison || ''}
                    onChange={(e) => setSectionData({ ...sectionData, raison: e.target.value })}
                    multiline
                    rows={3}
                    required
                  />
                </Grid>
              </Grid>
            )}

            {sectionType === 'objectif' && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={sectionData?.description || ''}
                    onChange={(e) => setSectionData({ ...sectionData, description: e.target.value })}
                    multiline
                    rows={3}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Échéance"
                    type="date"
                    value={sectionData?.echeance ? new Date(sectionData.echeance).toISOString().split('T')[0] : ''}
                    onChange={(e) => setSectionData({ ...sectionData, echeance: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Statut</InputLabel>
                    <Select
                      value={sectionData?.statut || 'En cours'}
                      onChange={(e) => setSectionData({ ...sectionData, statut: e.target.value })}
                      label="Statut"
                      required
                    >
                      <MenuItem value="En cours">En cours</MenuItem>
                      <MenuItem value="Atteint">Atteint</MenuItem>
                      <MenuItem value="Non atteint">Non atteint</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSectionDialog}>Annuler</Button>
          <Button onClick={handleSectionSubmit} variant="contained">
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CarriereList; 