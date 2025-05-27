import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Avatar,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  Assignment as DemandesIcon,
  BeachAccess as CongesIcon,
  Event as JoursFeriesIcon,
  Timer as JoursRestantsIcon,
} from '@mui/icons-material';
import DemandeConge from '../components/DemandeConge';
import { useNavigate } from 'react-router-dom';

const EmployeeDashboard = () => {
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [stats, setStats] = useState({
    demandes: 0,
    congesActifs: 0,
    joursFeries: 0,
    joursRestants: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeConges, setActiveConges] = useState([]);
  const [remainingDays, setRemainingDays] = useState(0);
  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndEmployee = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const storedUser = JSON.parse(localStorage.getItem("loggedUser"));
        if (!storedUser?._id) {
          console.log("No stored user found, redirecting to login");
          window.location.href = "/login";
          return;
        }

        // Fetch user data
        const userRes = await fetch(`http://localhost:5000/users/getuserBYID/${storedUser._id}`, { 
          credentials: "include" 
        });
        
        if (!userRes.ok) {
          console.error("User fetch failed:", userRes.status);
          throw new Error("Non autorisé");
        }
        
        const userData = await userRes.json();
        console.log("User data received:", userData);
        setUser(userData);

        // Fetch employee data
        const employeeRes = await fetch(`http://localhost:5000/employe/byUser/${storedUser._id}`, {
          credentials: "include"
        });

        if (!employeeRes.ok) {
          console.error("Employee fetch failed:", employeeRes.status);
          throw new Error("Erreur lors de la récupération des données employé");
        }

        const employeeData = await employeeRes.json();
        console.log("Employee data received:", employeeData);

        // Validate employee data
        if (!employeeData || !employeeData._id) {
          console.error("Invalid employee data:", employeeData);
          throw new Error("Données employé invalides");
        }

        // Process photo URL if exists
        if (employeeData.photo) {
          employeeData.photo = `http://localhost:5000/images/${employeeData.photo}`;
        }
        
        setEmployee(employeeData);
      } catch (err) {
        console.error("Error in fetchUserAndEmployee:", err);
        setError(err.message);
        
        // Only redirect to login for authentication errors
        if (err.message === "Non autorisé" || err.message === "Données employé invalides") {
          localStorage.removeItem("loggedUser");
          window.location.href = "/login";
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndEmployee();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      if (!employee?._id) {
        console.log("No employee ID available yet");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const employeeId = employee._id;
        console.log("Fetching stats for employee ID:", employeeId);

        // Fetch demandes
        const demandesRes = await fetch(
          `http://localhost:5000/demandeconge/getDemandescogeByEmployee/${employeeId}`,
          { credentials: "include" }
        );
        const demandes = demandesRes.ok ? await demandesRes.json() : [];
        console.log("Demandes received:", demandes);

        // Fetch conges
        const congesRes = await fetch(
          `http://localhost:5000/conge/getCongesByEmployee/${employeeId}`,
          { credentials: "include" }
        );
        const conges = congesRes.ok ? await congesRes.json() : [];
        console.log("Conges received:", conges);

        // Fetch jours fériés
        const joursFeriesRes = await fetch(
          "http://localhost:5000/jourferie/getAllJourferie",
          { credentials: "include" }
        );
        const joursFeries = joursFeriesRes.ok ? await joursFeriesRes.json() : [];
        console.log("Jours fériés received:", joursFeries);

        // Calculate active conges (approved and not ended)
        const activeConges = Array.isArray(conges) 
          ? conges.filter(c => 
              c.etat_conge === "Approuvé" && 
              new Date(c.date_fin) >= new Date()
            )
          : [];

        // Calculate remaining days from active leaves
        const today = new Date();
        const remainingDays = Array.isArray(activeConges) && activeConges.length > 0
          ? activeConges.reduce((total, conge) => {
              const endDate = new Date(conge.date_fin);
              const diffTime = endDate - today;
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              return total + Math.max(0, diffDays);
            }, 0)
          : 0;

        setStats({
          demandes: Array.isArray(demandes) ? demandes.length : 0,
          congesActifs: activeConges.length,
          joursFeries: Array.isArray(joursFeries) ? joursFeries.length : 0,
          joursRestants: remainingDays,
        });

        // Store active conges for display
        setActiveConges(activeConges);
        setRemainingDays(remainingDays);

      } catch (err) {
        console.error("Erreur lors de la récupération des statistiques:", err);
        if (!err.message.includes("Aucun congé trouvé")) {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [employee]);

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card sx={{ 
      background: color,
      color: "white",
      height: "100%",
      transition: "transform 0.3s",
      "&:hover": { transform: "scale(1.02)" }
    }}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <Typography variant="h6">{title}</Typography>
            <Typography variant="h3">{value}</Typography>
          </div>
          <Icon sx={{ fontSize: 60, opacity: 0.8 }} />
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh" 
      }}>
        <CircularProgress size={80} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        textAlign: "center", 
        p: 4, 
        bgcolor: "error.light", 
        borderRadius: 2 
      }}>
        <Typography variant="h6" color="error" gutterBottom>
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        flexWrap: 'wrap',
        mb: 4
      }}>
        {employee?.photo && (
          <Avatar
            src={employee.photo}
            alt={`${employee.prenom} ${employee.nom}`}
            sx={{ 
              width: 80, 
              height: 80,
              border: '2px solid #2196F3',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.05)'
              }
            }}
            onClick={() => navigate('/employee/profile')}
          />
        )}
        <Box>
          <Typography variant="h4" gutterBottom>
            Bonjour, {employee?.prenom} {employee?.nom}
          </Typography>
          <Typography variant="subtitle1" sx={{ color: "text.secondary" }}>
            Rôle : Employé
          </Typography>
          {employee && (
            <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
              Poste : {employee.post}
            </Typography>
          )}
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Mes demandes"
            value={stats.demandes}
            icon={DemandesIcon}
            color="linear-gradient(45deg, #FF4081 30%, #FF80AB 90%)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Congés actifs"
            value={stats.congesActifs}
            icon={CongesIcon}
            color="linear-gradient(45deg, #4CAF50 30%, #81C784 90%)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Jours fériés"
            value={stats.joursFeries}
            icon={JoursFeriesIcon}
            color="linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Jours restants"
            value={stats.joursRestants}
            icon={JoursRestantsIcon}
            color="linear-gradient(45deg, #2196F3 30%, #64B5F6 90%)"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmployeeDashboard; 