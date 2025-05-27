import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip
} from '@mui/material';
import {
  Work as WorkIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  CompareArrows as CompareArrowsIcon,
  PendingActions as PendingActionsIcon
} from '@mui/icons-material';

const EmployeeCarriere = () => {
  const [carriere, setCarriere] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState(''); // 'competence', 'formation', 'objectif', 'mobilite'
  const [userRole, setUserRole] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    niveau: '',
    dateAcquisition: '',
    type: '',
    description: '',
    priorite: '',
    echeance: '',
    posteSouhaite: '',
    delaiEstime: '',
    ancienPoste: '',
    nouveauPoste: '',
    date: '',
    raison: '',
    statut: 'En attente'
  });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("loggedUser"));
    if (storedUser?.role) {
      setUserRole(storedUser.role);
    }
    fetchCarriere();
  }, []);

  const fetchCarriere = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("loggedUser"));
      if (!storedUser?._id) {
        window.location.href = "/login";
        return;
      }

      // First, get the employee associated with this user
      const employeeResponse = await fetch(`http://localhost:5000/employe/byUser/${storedUser._id}`, {
        credentials: 'include'
      });

      if (!employeeResponse.ok) {
        throw new Error('Erreur lors de la récupération des données de l\'employé');
      }

      const employeeData = await employeeResponse.json();
      if (!employeeData?._id) {
        throw new Error('Aucun employé trouvé pour cet utilisateur');
      }

      // Then fetch the career data using the employee ID
      const response = await fetch(`http://localhost:5000/carriere/employee/${employeeData._id}`, {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Erreur lors de la récupération des données de carrière');
      const data = await response.json();
      setCarriere(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (type) => {
    if (type === 'objectif' && !['Admin', 'RH'].includes(userRole)) {
      setError('Seuls les administrateurs et les RH peuvent ajouter des objectifs de carrière');
      return;
    }

    setDialogType(type);
    setFormData({
      nom: '',
      niveau: '',
      dateAcquisition: '',
      type: '',
      description: '',
      priorite: '',
      echeance: '',
      posteSouhaite: '',
      delaiEstime: '',
      ancienPoste: '',
      nouveauPoste: '',
      date: '',
      raison: '',
      statut: 'En attente'
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDialogType('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let endpoint = '';
      let data = {};

      switch (dialogType) {
        case 'competence':
          endpoint = `http://localhost:5000/carriere/${carriere._id}/competences`;
          data = {
            nom: formData.nom,
            niveau: formData.niveau,
            dateAcquisition: formData.dateAcquisition
          };
          break;
        case 'formation':
          endpoint = `http://localhost:5000/carriere/${carriere._id}/besoins-formation`;
          data = {
            type: formData.type,
            description: formData.description,
            priorite: formData.priorite
          };
          break;
        case 'objectif':
          endpoint = `http://localhost:5000/carriere/${carriere._id}/plan-carriere`;
          data = {
            objectifs: [{
              description: formData.description,
              echeance: formData.echeance,
              statut: 'En cours'
            }],
            cheminProgression: {
              posteSouhaite: formData.posteSouhaite,
              delaiEstime: formData.delaiEstime,
              competencesRequises: []
            }
          };
          break;
        case 'mobilite':
          if (['Admin', 'RH'].includes(userRole)) {
            endpoint = `http://localhost:5000/carriere/${carriere._id}/mobilites`;
            data = {
              type: formData.type,
              ancienPoste: formData.ancienPoste,
              nouveauPoste: formData.nouveauPoste,
              date: formData.date,
              raison: formData.raison,
              statut: 'Approuvé'
            };
          } else {
            // Get the employee ID from the career data
            const employeeId = carriere.employee || carriere._id;
            if (!employeeId) {
              throw new Error('ID de l\'employé non trouvé');
            }
            endpoint = `http://localhost:5000/carriere/${employeeId}/mobilites`;
            data = {
              type: formData.type,
              ancienPoste: carriere.posteActuel.titre,
              nouveauPoste: formData.nouveauPoste,
              date: formData.date,
              raison: formData.raison,
              statut: 'En attente'
            };
          }
          break;
      }

      const response = await fetch(endpoint, {
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
      
      await fetchCarriere();
      handleCloseDialog();
    } catch (err) {
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

  if (!carriere) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" color="text.secondary">
          Aucune donnée de carrière disponible
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Mon Parcours Professionnel
      </Typography>

      <Grid container spacing={3}>
        {/* Plan de Carrière - Full Width */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingUpIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Plan de Carrière</Typography>
                </Box>
                {['Admin', 'RH'].includes(userRole) && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleOpenDialog('objectif')}
                  >
                    Ajouter un objectif
                  </Button>
                )}
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>Objectifs</Typography>
                  <List>
                    {carriere.planCarriere.objectifs.map((objectif, index) => (
                      <React.Fragment key={index}>
                        <ListItem>
                          <ListItemText
                            primary={objectif.description}
                            secondary={
                              <>
                                <Typography component="span" variant="body2" color="text.secondary">
                                  Échéance: {new Date(objectif.echeance).toLocaleDateString()}
                                </Typography>
                                <br />
                                <Typography component="span" variant="body2" color="text.secondary">
                                  Poste visé: {carriere.planCarriere.cheminProgression.posteSouhaite}
                                </Typography>
                                <br />
                                <Typography component="span" variant="body2" color="text.secondary">
                                  Délai estimé: {carriere.planCarriere.cheminProgression.delaiEstime}
                                </Typography>
                              </>
                            }
                          />
                          <Chip
                            label={objectif.statut}
                            color={objectif.statut === 'Atteint' ? 'success' : 
                                   objectif.statut === 'En cours' ? 'warning' : 'default'}
                            size="small"
                          />
                        </ListItem>
                        {index < carriere.planCarriere.objectifs.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>Chemin de Progression</Typography>
                  <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="body1">
                      <strong>Poste Souhaité:</strong> {carriere.planCarriere.cheminProgression.posteSouhaite}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Délai Estimé:</strong> {carriere.planCarriere.cheminProgression.delaiEstime}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Compétences Requises:</strong>
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {carriere.planCarriere.cheminProgression.competencesRequises.map((comp, index) => (
                        <Chip key={index} label={comp} size="small" />
                      ))}
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Mobilités */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CompareArrowsIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Mobilités</Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleOpenDialog('mobilite')}
                >
                  {['Admin', 'RH'].includes(userRole) ? 'Ajouter' : 'Demander une mobilité'}
                </Button>
              </Box>
              <List>
                {carriere.mobilites.map((mobilite, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemText
                        primary={`${mobilite.ancienPoste} → ${mobilite.nouveauPoste}`}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.secondary">
                              Date: {new Date(mobilite.date).toLocaleDateString()}
                            </Typography>
                            <br />
                            <Typography component="span" variant="body2" color="text.secondary">
                              Raison: {mobilite.raison}
                            </Typography>
                          </>
                        }
                      />
                      <Chip
                        label={mobilite.type}
                        color="primary"
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={mobilite.statut}
                        color={mobilite.statut === 'Approuvé' ? 'success' : 
                               mobilite.statut === 'En attente' ? 'warning' : 'error'}
                        size="small"
                      />
                    </ListItem>
                    {index < carriere.mobilites.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Poste Actuel */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WorkIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Poste Actuel</Typography>
              </Box>
              <Typography variant="subtitle1">{carriere.posteActuel.titre}</Typography>
              <Typography color="text.secondary">{carriere.posteActuel.departement}</Typography>
              <Typography color="text.secondary">Niveau: {carriere.posteActuel.niveau}</Typography>
              <Typography color="text.secondary">
                Depuis: {new Date(carriere.posteActuel.dateDebut).toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Compétences */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <SchoolIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Compétences</Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleOpenDialog('competence')}
                >
                  Ajouter
                </Button>
              </Box>
              <List>
                {carriere.competences.map((competence, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemText
                        primary={competence.nom}
                        secondary={`Niveau: ${competence.niveau} - Acquis le: ${new Date(competence.dateAcquisition).toLocaleDateString()}`}
                      />
                    </ListItem>
                    {index < carriere.competences.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Besoins de Formation */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <SchoolIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Besoins de Formation</Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleOpenDialog('formation')}
                >
                  Ajouter
                </Button>
              </Box>
              <List>
                {carriere.besoinsFormation.map((besoin, index) => (
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
                    {index < carriere.besoinsFormation.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog pour ajouter des éléments */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogType === 'competence' ? 'Ajouter une compétence' :
           dialogType === 'formation' ? 'Ajouter un besoin de formation' :
           dialogType === 'mobilite' ? 
             (['Admin', 'RH'].includes(userRole) ? 'Ajouter une mobilité' : 'Demander une mobilité') :
           'Ajouter un objectif'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            {dialogType === 'competence' && (
              <>
                <TextField
                  fullWidth
                  label="Nom de la compétence"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  required
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  select
                  label="Niveau"
                  name="niveau"
                  value={formData.niveau}
                  onChange={handleInputChange}
                  required
                  sx={{ mb: 2 }}
                >
                  {['Débutant', 'Intermédiaire', 'Avancé', 'Expert'].map((niveau) => (
                    <MenuItem key={niveau} value={niveau}>
                      {niveau}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  fullWidth
                  label="Date d'acquisition"
                  name="dateAcquisition"
                  type="date"
                  value={formData.dateAcquisition}
                  onChange={handleInputChange}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </>
            )}

            {dialogType === 'formation' && (
              <>
                <TextField
                  fullWidth
                  label="Type de formation"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  multiline
                  rows={3}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  select
                  label="Priorité"
                  name="priorite"
                  value={formData.priorite}
                  onChange={handleInputChange}
                  required
                >
                  {['Basse', 'Moyenne', 'Haute'].map((priorite) => (
                    <MenuItem key={priorite} value={priorite}>
                      {priorite}
                    </MenuItem>
                  ))}
                </TextField>
              </>
            )}

            {dialogType === 'mobilite' && (
              <>
                <TextField
                  fullWidth
                  select
                  label="Type de mobilité"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  sx={{ mb: 2 }}
                >
                  {['Promotion', 'Mutation', 'Changement de département', 'Autre'].map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>
                {['Admin', 'RH'].includes(userRole) && (
                  <TextField
                    fullWidth
                    label="Ancien poste"
                    name="ancienPoste"
                    value={formData.ancienPoste}
                    onChange={handleInputChange}
                    required
                    sx={{ mb: 2 }}
                  />
                )}
                <TextField
                  fullWidth
                  label="Nouveau poste souhaité"
                  name="nouveauPoste"
                  value={formData.nouveauPoste}
                  onChange={handleInputChange}
                  required
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Date souhaitée"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  InputLabelProps={{ shrink: true }}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Raison de la demande"
                  name="raison"
                  value={formData.raison}
                  onChange={handleInputChange}
                  required
                  multiline
                  rows={3}
                />
              </>
            )}

            {dialogType === 'objectif' && (
              <>
                <TextField
                  fullWidth
                  label="Description de l'objectif"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  multiline
                  rows={3}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Échéance"
                  name="echeance"
                  type="date"
                  value={formData.echeance}
                  onChange={handleInputChange}
                  required
                  InputLabelProps={{ shrink: true }}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Poste Souhaité"
                  name="posteSouhaite"
                  value={formData.posteSouhaite}
                  onChange={handleInputChange}
                  required
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Délai Estimé"
                  name="delaiEstime"
                  value={formData.delaiEstime}
                  onChange={handleInputChange}
                  required
                  placeholder="ex: 6 mois, 1 an, etc."
                  sx={{ mb: 2 }}
                />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained">
            {dialogType === 'mobilite' && !['Admin', 'RH'].includes(userRole) ? 'Soumettre la demande' : 'Ajouter'}
          </Button>
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
    </Box>
  );
};

export default EmployeeCarriere; 