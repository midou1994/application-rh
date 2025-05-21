import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  useMediaQuery,
  CssBaseline,
  Paper,
  Avatar,
  useTheme,
} from "@mui/material";
import {
  People as PeopleIcon,
  Assignment as DemandesIcon,
  BeachAccess as CongesIcon,
  Event as EventsIcon,
  Menu as MenuIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { ThemeProvider } from "@mui/material/styles";
import Sidebar from './components/Sidebar';
import Personnel from './components/Personnel';
import Conges from './components/Conges';
import JoursFeries from './components/JoursFeries';
import DemandeConge from './components/DemandeConge';

const Dashboard = () => {
  // États
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [stats, setStats] = useState({
    employees: 0,
    demandes: 0,
    congesActifs: 0,
    joursFeries: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeComponent, setActiveComponent] = useState("dashboard");
  const [userRole, setUserRole] = useState('');
  
  // Hooks
  const isMobile = useMediaQuery("(max-width:600px)");
  const navigate = useNavigate();
  const theme = useTheme();
  const drawerWidth = 240;

  // Gestion de la sidebar mobile
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Handle menu item click
  const handleMenuItemClick = (component) => {
    setActiveComponent(component);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  // Récupération des données utilisateur et employé
  useEffect(() => {
    const fetchUserAndEmployee = async () => {
      const storedUser = JSON.parse(localStorage.getItem("loggedUser"));
      if (!storedUser?._id) {
        navigate("/login");
        return;
      }

      try {
        const [userRes, employeeRes] = await Promise.all([
          fetch(`http://localhost:5000/users/getuserBYID/${storedUser._id}`, { 
            credentials: "include" 
          }),
          fetch(`http://localhost:5000/employe/byUser/${storedUser._id}`, {
            credentials: "include"
          })
        ]);
        
        if (!userRes.ok) throw new Error("Non autorisé");
        
        const userData = await userRes.json();
        setUser(userData);
        setUserRole(userData.role);

        if (employeeRes.ok) {
          const employeeData = await employeeRes.json();
          // Construct the full photo URL
          if (employeeData.photo) {
            employeeData.photo = `http://localhost:5000/images/${employeeData.photo}`;
          }
          setEmployee(employeeData);
        }
      } catch (err) {
        localStorage.removeItem("loggedUser");
        navigate("/login");
      }
    };

    fetchUserAndEmployee();
  }, [navigate]);

  // Récupération des statistiques
  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      setLoading(true);
      setError(null);

      try {
        if (user.role === "Employe" && employee?._id) {
          // For employees, only fetch their own data
          const [demandesRes, congesRes] = await Promise.all([
            fetch(`http://localhost:5000/demandeconge/getDemandescogeByEmployee/${employee._id}`, { 
              credentials: "include" 
            }),
            fetch(`http://localhost:5000/conge/getCongesByEmployee/${employee._id}`, {
              credentials: "include"
            })
          ]);

          const [demandes, conges] = await Promise.all([
            demandesRes.json(),
            congesRes.json()
          ]);

          setStats({
            employees: 0, // Don't show employee count for employees
            demandes: demandes.length,
            congesActifs: conges.filter(c => c.etat_conge === "Approuvé").length,
            joursFeries: 0 // Don't show jours fériés for employees
          });
        } else {
          // For Admin and RH, fetch all data
          const endpoints = [
            { url: "/employe/getAllEmployes", key: "employees" },
            { url: "/demandeconge/getAllDemandescoge", key: "demandes" },
            { url: "/conge/getAllConge", key: "conges" },
            { url: "/jourferie/getAllJourferie", key: "joursFeries" },
          ];

          const responses = await Promise.all(
            endpoints.map(endpoint =>
              fetch(`http://localhost:5000${endpoint.url}`, { credentials: "include" })
            )
          );

          const data = await Promise.all(
            responses.map(async (res, index) => {
              if (!res.ok) throw new Error(`Erreur ${endpoints[index].key}`);
              return res.json();
            })
          );

          const [employees, demandes, conges, joursFeries] = data;

          setStats({
            employees: employees.length,
            demandes: demandes.length,
            congesActifs: conges.filter(c => c.etat_conge === "Approuvé").length,
            joursFeries: joursFeries.length,
          });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, employee]);

  // Déconnexion
  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/users/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      localStorage.removeItem("loggedUser");
      navigate("/");
    }
  };

  // Composant Carte de statistiques
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

  // Component content based on active component
  const renderComponentContent = () => {
    // For employees, only show their own data
    if (user?.role === "Employe") {
      switch (activeComponent) {
        case "dashboard":
          return (
            <Box sx={{ 
              width: '100%',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <Grid container spacing={3} sx={{ maxWidth: '1200px' }}>
                <Grid item xs={12} sm={6}>
                  <StatCard
                    title="Mes demandes"
                    value={stats.demandes}
                    icon={DemandesIcon}
                    color="linear-gradient(45deg, #FF4081 30%, #FF80AB 90%)"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StatCard
                    title="Mes congés actifs"
                    value={stats.congesActifs}
                    icon={CongesIcon}
                    color="linear-gradient(45deg, #4CAF50 30%, #81C784 90%)"
                  />
                </Grid>
              </Grid>
            </Box>
          );
        case "demandes":
          return (
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <Box sx={{ maxWidth: '1200px', width: '100%' }}>
                <DemandeConge employeeId={employee?._id} />
              </Box>
            </Box>
          );
        default:
          return null;
      }
    }

    // For Admin and RH, show all components
    switch (activeComponent) {
      case "dashboard":
        return (
          <Box sx={{ 
            width: '100%',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <Grid container spacing={3} sx={{ maxWidth: '1200px' }}>
              <Grid item xs={12} sm={6} lg={3}>
                <StatCard
                  title="Employés"
                  value={stats.employees}
                  icon={PeopleIcon}
                  color="linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)"
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <StatCard
                  title="Demandes"
                  value={stats.demandes}
                  icon={DemandesIcon}
                  color="linear-gradient(45deg, #FF4081 30%, #FF80AB 90%)"
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <StatCard
                  title="Congés actifs"
                  value={stats.congesActifs}
                  icon={CongesIcon}
                  color="linear-gradient(45deg, #4CAF50 30%, #81C784 90%)"
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <StatCard
                  title="Jours fériés"
                  value={stats.joursFeries}
                  icon={EventsIcon}
                  color="linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)"
                />
              </Grid>
            </Grid>
          </Box>
        );
      case "employees":
        return (
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ maxWidth: '1200px', width: '100%' }}>
              <Personnel />
            </Box>
          </Box>
        );
      case "conges":
        return (
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ maxWidth: '1200px', width: '100%' }}>
              <Conges />
            </Box>
          </Box>
        );
      case "joursFeries":
        return (
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ maxWidth: '1200px', width: '100%' }}>
              <JoursFeries />
            </Box>
          </Box>
        );
      case "demandes":
        return (
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ maxWidth: '1200px', width: '100%' }}>
              <DemandeConge />
            </Box>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        
        {/* En-tête */}
        <AppBar
          position="fixed"
          sx={{
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            ml: { sm: `${drawerWidth}px` },
            bgcolor: "background.paper",
            color: "text.primary",
            boxShadow: 1
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              Système de Gestion RH
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {employee?.photo && (
                <Avatar
                  src={employee.photo}
                  alt={`${employee.prenom} ${employee.nom}`}
                  sx={{ 
                    width: 40, 
                    height: 40,
                    border: '2px solid #2196F3',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                />
              )}
              <Button 
                color="inherit"
                onClick={handleLogout}
                startIcon={<LogoutIcon />}
                sx={{ textTransform: "none" }}
              >
                Déconnexion
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Sidebar */}
        <Sidebar
          mobileOpen={mobileOpen}
          handleDrawerToggle={handleDrawerToggle}
          drawerWidth={drawerWidth}
          isMobile={isMobile}
          onMenuItemClick={handleMenuItemClick}
          userRole={userRole}
        />

        {/* Contenu principal */}
        <Box
          component="main"
          sx={{
  flexGrow: 1,
  p: 3,
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  minHeight: '100vh',
  boxSizing: 'border-box'
}}

        >
          <Toolbar />

          <Box sx={{ 
            width: '100%',
            maxWidth: '1200px',
            display: 'flex',
            flexDirection: 'column',
            gap: 3
          }}>
            {user && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                flexWrap: 'wrap',
                mb: 2
              }}>
                {employee?.photo && (
                  <Avatar
                    src={employee.photo}
                    alt={`${employee.prenom} ${employee.nom}`}
                    sx={{ 
                      width: 80, 
                      height: 80,
                      border: '2px solid #2196F3',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  />
                )}
                <Box>
                  <Typography variant="h4" gutterBottom>
                    Bonjour, {employee?.prenom || user.prenom} {employee?.nom || user.nom}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ color: "text.secondary" }}>
                    Rôle : {user.role}
                  </Typography>
                  {employee && (
                    <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
                      Poste : {employee.post}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}

            {loading ? (
              <Box sx={{ 
                display: "flex", 
                justifyContent: "center", 
                alignItems: "center", 
                height: "50vh"
              }}>
                <CircularProgress size={80} />
              </Box>
            ) : error ? (
              <Box sx={{ 
                textAlign: "center", 
                p: 4, 
                bgcolor: "error.light", 
                borderRadius: 2
              }}>
                <Typography variant="h6" color="error" gutterBottom>
                  Erreur : {error}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => window.location.reload()}
                >
                  Réessayer
                </Button>
              </Box>
            ) : (
              renderComponentContent()
            )}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Dashboard;