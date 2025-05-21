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
  Autocomplete,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import DataTable from './DataTable';

const DemandeConge = ({ employeeId }) => {
  const [demandes, setDemandes] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [formData, setFormData] = useState({
    date_debut: '',
    date_fin: '',
    nombre_jrs: '',
    type_conge: 'Annuel',
    etat_conge: 'En attente',
    employe: '',
    motif: ''
  });
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeDetails, setEmployeeDetails] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [userRole, setUserRole] = useState('');
  const [searchEmployee, setSearchEmployee] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  const columns = [
    { 
      id: 'date_debut', 
      label: 'Date de début', 
      minWidth: 120,
      format: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
    },
    { 
      id: 'date_fin', 
      label: 'Date de fin', 
      minWidth: 120,
      format: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
    },
    { 
      id: 'nombre_jrs', 
      label: 'Nombre de jours', 
      minWidth: 100,
      format: (value) => value || 'N/A'
    },
    { 
      id: 'type_conge', 
      label: 'Type', 
      minWidth: 120,
      format: (value) => value || 'N/A'
    },
    { 
      id: 'etat_conge', 
      label: 'État', 
      minWidth: 100,
      format: (value) => {
        if (!value) return 'N/A';
        const status = value.toLowerCase();
        return (
          <Box
            sx={{
              backgroundColor: 
                status === 'approuvé' ? '#4caf50' :
                status === 'rejeté' ? '#f44336' :
                '#ff9800',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              display: 'inline-block'
            }}
          >
            {value}
          </Box>
        );
      }
    },
    {
      id: 'employe',
      label: 'Employé',
      minWidth: 150,
      format: (value, row) => {
        if (!value) return 'N/A';
        const employee = employeeDetails[value];
        if (!employee) {
          // Fetch employee details if not already loaded
          fetchEmployeeDetails(value);
          return 'Chargement...';
        }
        return `${employee.nom} ${employee.prenom}`;
      }
    }
  ];

  const fetchEmployeeDetails = async (employeeId) => {
    try {
      console.log("Fetching employee details for ID:", employeeId);
      
      if (!employeeId) {
        console.error("No employee ID provided");
        return;
      }

      const response = await fetch(`http://localhost:5000/employe/${employeeId}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.error(`Employee not found with ID: ${employeeId}`);
        } else {
          console.error(`Failed to fetch employee ${employeeId}:`, response.status, response.statusText);
        }
        return;
      }

      const employee = await response.json();
      console.log("Employee details received:", employee);

      if (!employee || !employee._id) {
        console.error("Invalid employee data received");
        return;
      }

      setEmployeeDetails(prev => ({
        ...prev,
        [employeeId]: employee
      }));
    } catch (err) {
      console.error('Error fetching employee:', err);
    }
  };

  const fetchPersonnel = async () => {
    try {
      console.log("Fetching all employees...");
      const response = await fetch('http://localhost:5000/employe/getAllEmployes', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des employés');
      }
      
      const data = await response.json();
      console.log("Received employees:", data);
      
      // Transform the data to include nom and prenom
      const transformedData = data.map(emp => ({
        ...emp,
        nom: emp.nom || '',
        prenom: emp.prenom || ''
      }));
      
      console.log("Transformed employees:", transformedData);
      setPersonnel(transformedData);
      setFilteredEmployees(transformedData); // Initialize filtered employees with all employees
    } catch (err) {
      console.error('Error fetching personnel:', err);
      setError('Erreur lors du chargement des employés');
    }
  };

  const fetchDemandes = async () => {
    setLoading(true);
    setError(null);

    try {
      // Vérifie si un utilisateur est connecté
      const storedUser = JSON.parse(localStorage.getItem("loggedUser"));
      if (!storedUser?._id) {
        throw new Error('Aucun utilisateur connecté');
      }

      // Récupère les infos utilisateur
      const userResponse = await fetch(`http://localhost:5000/users/getuserBYID/${storedUser._id}`, {
        credentials: 'include'
      });

      if (!userResponse.ok) {
        throw new Error('Erreur lors de la récupération de l\'utilisateur');
      }

      const userData = await userResponse.json();
      setUserRole(userData.role);

      // Si c'est un employé, récupérer son ID d'employé
      if (userData.role === 'Employee') {
        try {
          const employeeResponse = await fetch(`http://localhost:5000/employe/getEmployeByUserId/${userData._id}`, {
            credentials: 'include'
          });
          
          if (employeeResponse.ok) {
            const employeeData = await employeeResponse.json();
            if (employeeData && employeeData._id) {
              // Mettre à jour l'ID de l'employé dans le formulaire
              setFormData(prev => ({
                ...prev,
                employe: employeeData._id
              }));
            }
          }
        } catch (err) {
          console.error('Error fetching employee data:', err);
        }
      }

      // Si c'est un admin, on récupère toutes les demandes
      if (userData.role === 'Admin' || userData.role === 'RH') {
        console.log("Fetching all demandes for admin");
        const demandesResponse = await fetch('http://localhost:5000/demandeconge/getAllDemandescoge', {
          credentials: 'include'
        });

        if (!demandesResponse.ok) {
          throw new Error('Erreur lors de la récupération des demandes');
        }

        const demandesData = await demandesResponse.json();
        console.log("All demandes received:", demandesData);
        
        // Ensure we have valid data
        const validDemandes = Array.isArray(demandesData) 
          ? demandesData.filter(d => d && d._id && d.employe) 
          : [];
        setDemandes(validDemandes);

        // Pré-charger les détails employés pour affichage
        const employeeIds = [...new Set(validDemandes.map(d => d.employe))].filter(Boolean);
        for (const id of employeeIds) {
          if (!employeeDetails[id]) {
            await fetchEmployeeDetails(id);
          }
        }
        return;
      }

      // Pour les employés, on vérifie l'ID
      if (!employeeId) {
        console.log("Waiting for employee ID...");
        return;
      }

      console.log("Fetching demandes for employee ID:", employeeId);
      const demandesResponse = await fetch(
        `http://localhost:5000/demandeconge/getDemandescogeByEmployee/${employeeId}`,
        { credentials: "include" }
      );

      if (!demandesResponse.ok) {
        if (demandesResponse.status === 404) {
          setDemandes([]);
          return;
        }
        throw new Error('Erreur lors de la récupération des demandes');
      }

      const demandesData = await demandesResponse.json();
      console.log("Employee demandes received:", demandesData);
      
      // Ensure we have valid data
      const validDemandes = Array.isArray(demandesData) ? demandesData.filter(d => d && d._id) : [];
      setDemandes(validDemandes);

      // Fetch employee details for the current employee
      if (!employeeDetails[employeeId]) {
        await fetchEmployeeDetails(employeeId);
      }

    } catch (err) {
      console.error("Error fetching demandes:", err);
      if (!err.message.includes("Aucune demande trouvée")) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Current userRole:", userRole);
    console.log("Current employeeId:", employeeId);
    fetchDemandes();
  }, [employeeId, userRole]);

  // Add useEffect to fetch personnel when component mounts
  useEffect(() => {
    if (userRole === 'Admin' || userRole === 'RH') {
      fetchPersonnel();
    }
  }, [userRole]);

  const handleAdd = () => {
    console.log("Opening add dialog with employee ID:", employeeId);
    setSelectedDemande(null);
    setSelectedEmployee(null);
    setFormData({
      date_debut: '',
      date_fin: '',
      nombre_jrs: '',
      type_conge: 'Annuel',
      etat_conge: userRole === 'Employee' ? 'En attente' : '',
      employe: userRole === 'Employee' ? employeeId : '',
      motif: ''
    });
    setOpenDialog(true);
  };

  const handleEdit = async (row) => {
    setSelectedDemande(row);
    setFormData({
      date_debut: row.date_debut.split('T')[0],
      date_fin: row.date_fin.split('T')[0],
      nombre_jrs: row.nombre_jrs,
      type_conge: row.type_conge,
      etat_conge: row.etat_conge,
      employe: row.employe,
      motif: row.motif || ''
    });

    // For admin/RH, fetch employee details
    if (userRole === 'Admin' || userRole === 'RH') {
      try {
        const response = await fetch(`http://localhost:5000/employe/${row.employe}`, {
          credentials: 'include'
        });
        if (response.ok) {
          const employee = await response.json();
          setSelectedEmployee(employee);
        }
      } catch (err) {
        console.error('Error fetching employee:', err);
      }
    }
    
    setOpenDialog(true);
  };

  const handleDelete = async (row) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette demande ?')) {
      try {
        const response = await fetch(`http://localhost:5000/demandeconge/deletDemandescongeBYID/${row._id}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Erreur lors de la suppression');
        setSnackbar({
          open: true,
          message: 'Demande supprimée avec succès',
          severity: 'success'
        });
        fetchDemandes();
      } catch (err) {
        setSnackbar({
          open: true,
          message: err.message,
          severity: 'error'
        });
      }
    }
  };

  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value
    };

    // Calculate days only if both dates are present
    if (newFormData.date_debut && newFormData.date_fin) {
      const days = calculateDays(newFormData.date_debut, newFormData.date_fin);
      newFormData.nombre_jrs = days > 0 ? days : '';
    } else {
      newFormData.nombre_jrs = '';
    }

    setFormData(newFormData);
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      // Update the demande status
      const response = await fetch(`http://localhost:5000/demandeconge/updatestatubyid/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ etat_conge: newStatus }),
      });

      if (!response.ok) throw new Error('Erreur lors de la mise à jour du statut');

      // If approved, create a new conge
      if (newStatus === 'Approuvé') {
        const demande = demandes.find(d => d._id === id);
        if (demande) {
          const congeResponse = await fetch('http://localhost:5000/conge/addconge', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              date_debut: demande.date_debut,
              date_fin: demande.date_fin,
              nombre_jrs: demande.nombre_jrs,
              type_conge: demande.type_conge,
              etat_conge: 'Approuvé',
              employe: demande.employe
            }),
          });

          if (!congeResponse.ok) throw new Error('Erreur lors de la création du congé');
        }
      }

      setSnackbar({
        open: true,
        message: `Demande ${newStatus.toLowerCase()} avec succès`,
        severity: 'success'
      });
      fetchDemandes();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message,
        severity: 'error'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting form with data:", formData);
    
    try {
      // Validate required fields
      if (!formData.date_debut || !formData.date_fin || !formData.type_conge) {
        setSnackbar({
          open: true,
          message: "Veuillez remplir tous les champs obligatoires",
          severity: "error"
        });
        return;
      }

      // Validate dates
      const startDate = new Date(formData.date_debut);
      const endDate = new Date(formData.date_fin);
      
      if (startDate > endDate) {
        setSnackbar({
          open: true,
          message: "La date de fin doit être postérieure à la date de début",
          severity: "error"
        });
        return;
      }

      // Calculate number of days
      const days = calculateDays(formData.date_debut, formData.date_fin);
      if (days <= 0) {
        setSnackbar({
          open: true,
          message: "La durée du congé doit être d'au moins 1 jour",
          severity: "error"
        });
        return;
      }

      // Use employeeId directly for employees, or selected employee for admin/RH
      const employeId = userRole === 'Employe' ? employeeId : formData.employe;

      if (!employeId) {
        setSnackbar({
          open: true,
          message: "ID de l'employé manquant",
          severity: "error"
        });
        return;
      }

      const congeData = {
        date_debut: formData.date_debut,
        date_fin: formData.date_fin,
        nombre_jrs: days,
        type_conge: formData.type_conge,
        etat_conge: userRole === 'Employee' ? 'En attente' : formData.etat_conge || 'En attente',
        employe: employeId,
        motif: formData.motif || ''
      };

      console.log("Submitting conge data:", congeData);

      let response;
      if (selectedDemande) {
        // Update existing demande
        response = await fetch(`http://localhost:5000/demandeconge/updateDemandecongeBYID/${selectedDemande._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(congeData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erreur lors de la mise à jour de la demande');
        }

        // If the status is changed to "Approuvé", create a new conge
        if (congeData.etat_conge === 'Approuvé' && selectedDemande.etat_conge !== 'Approuvé') {
          const congeResponse = await fetch('http://localhost:5000/conge/addconge', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              date_debut: congeData.date_debut,
              date_fin: congeData.date_fin,
              nombre_jrs: congeData.nombre_jrs,
              type_conge: congeData.type_conge,
              etat_conge: 'Approuvé',
              employe: congeData.employe
            }),
          });

          if (!congeResponse.ok) {
            throw new Error('Erreur lors de la création du congé');
          }
        }
      } else {
        // Create new demande
        response = await fetch('http://localhost:5000/demandeconge/addDemandesconge', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(congeData)
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la soumission de la demande');
      }

      const result = await response.json();
      console.log("Demande submitted successfully:", result);

      setOpenDialog(false);
      setFormData({
        date_debut: '',
        date_fin: '',
        nombre_jrs: '',
        type_conge: 'Annuel',
        etat_conge: 'En attente',
        employe: userRole === 'Employee' ? employeeId : '',
        motif: ''
      });

      setSnackbar({
        open: true,
        message: selectedDemande ? "Demande de congé modifiée avec succès" : "Demande de congé soumise avec succès",
        severity: "success"
      });

      // Refresh the demands list
      await fetchDemandes();
    } catch (err) {
      console.error("Error submitting demande:", err);
      setSnackbar({
        open: true,
        message: err.message || "Erreur lors de la soumission de la demande",
        severity: "error"
      });
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Update handleEmployeeSearch to use the full personnel list
  const handleEmployeeSearch = (event, newValue) => {
    setSearchEmployee(newValue);
    if (newValue) {
      const filtered = personnel.filter(emp => 
        `${emp.nom} ${emp.prenom}`.toLowerCase().includes(newValue.toLowerCase())
      );
      console.log("Filtered employees:", filtered);
      setFilteredEmployees(filtered);
    } else {
      setFilteredEmployees(personnel); // Show all employees when search is empty
    }
  };

  // Add this new function to handle employee selection
  const handleEmployeeSelect = (event, newValue) => {
    if (newValue) {
      setSelectedEmployee(newValue);
      setFormData(prev => ({
        ...prev,
        employe: newValue._id
      }));
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {loading ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '200px' 
        }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : (
        <>
        
          <DataTable
            title={userRole === 'Employee' ? "Mes demandes de congé" : "Toutes les demandes de congé"}
            columns={columns}
            data={demandes}
            loading={loading}
            error={error}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={userRole === 'Employee' ? handleDelete : null}
          />
        </>
      )}

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          {selectedDemande ? 'Modifier la demande' : 'Nouvelle demande de congé'}
          <IconButton
            aria-label="close"
            onClick={() => setOpenDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            {(userRole === 'Admin' || userRole === 'RH') && (
              <Autocomplete
                options={filteredEmployees}
                getOptionLabel={(option) => `${option.nom} ${option.prenom}`}
                value={selectedEmployee}
                onChange={handleEmployeeSelect}
                onInputChange={handleEmployeeSearch}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Rechercher un employé"
                    margin="normal"
                    required
                    fullWidth
                  />
                )}
                sx={{ mb: 2 }}
                loading={loading}
                loadingText="Chargement des employés..."
                noOptionsText="Aucun employé trouvé"
              />
            )}
            <TextField
              fullWidth
              type="date"
              name="date_debut"
              label="Date de début"
              value={formData.date_debut}
              onChange={handleDateChange}
              InputLabelProps={{ shrink: true }}
              margin="normal"
              required
              inputProps={{ min: new Date().toISOString().split('T')[0] }}
            />
            <TextField
              fullWidth
              type="date"
              name="date_fin"
              label="Date de fin"
              value={formData.date_fin}
              onChange={handleDateChange}
              InputLabelProps={{ shrink: true }}
              margin="normal"
              required
              inputProps={{ min: formData.date_debut || new Date().toISOString().split('T')[0] }}
            />
            <TextField
              fullWidth
              type="number"
              label="Nombre de jours"
              value={formData.nombre_jrs}
              InputProps={{ readOnly: true }}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              select
              name="type_conge"
              label="Type de congé"
              value={formData.type_conge}
              onChange={handleChange}
              margin="normal"
              required
              SelectProps={{
                native: true
              }}
            >
              <option value="Annuel">Annuel</option>
              <option value="Maladie">Maladie</option>
              <option value="Exceptionnel">Exceptionnel</option>
              <option value="Maternité">Maternité</option>
            </TextField>
            {(userRole === 'Admin' || userRole === 'RH') && (
              <TextField
                fullWidth
                select
                name="etat_conge"
                label="État"
                value={formData.etat_conge}
                onChange={handleChange}
                margin="normal"
                required
                SelectProps={{
                  native: true
                }}
              >
                <option value="En attente">En attente</option>
                <option value="Approuvé">Approuvé</option>
                <option value="Rejeté">Rejeté</option>
              </TextField>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            startIcon={<AddIcon />}
            disabled={!formData.date_debut || !formData.date_fin || !formData.type_conge || 
                     ((userRole === 'Admin' || userRole === 'RH') && !formData.employe)}
          >
            {selectedDemande ? 'Modifier' : 'Soumettre'}
          </Button>
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

export default DemandeConge; 