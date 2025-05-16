import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  useMediaQuery,
  CssBaseline,
} from "@mui/material";
import {
  People as PeopleIcon,
  Assignment as DemandesIcon,
  BeachAccess as CongesIcon,
  Event as EventsIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { Link } from 'react-router-dom';

const Dashboard = () => {
  // États
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    employees: 0,
    demandes: 0,
    congesActifs: 0,
    joursFeries: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Hooks
  const isMobile = useMediaQuery("(max-width:600px)");
  const navigate = useNavigate();
  const theme = createTheme();
  const drawerWidth = 240;

  // Gestion de la sidebar mobile
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Récupération des données utilisateur
  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = JSON.parse(localStorage.getItem("loggedUser"));
      if (!storedUser?._id) {
        navigate("/login");
        return;
      }

      try {
        const res = await fetch(
          `http://localhost:5000/users/getuserBYID/${storedUser._id}`,
          { credentials: "include" }
        );
        
        if (!res.ok) throw new Error("Non autorisé");
        
        const data = await res.json();
        setUser(data);
      } catch (err) {
        localStorage.removeItem("loggedUser");
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate]);

  // Récupération des statistiques
  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      setLoading(true);
      setError(null);

      try {
        const endpoints = [
          { url: "/employe/getAllEmployes", key: "employees" },
          { url: "/demandeconge/getAllDemandescoge", key: "demandes" },
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

        const [employees, demandes, joursFeries] = data;

        setStats({
          employees: employees.length,
          demandes: demandes.length,
          congesActifs: demandes.filter(d => d.etat_conge === "Approuvé").length,
          joursFeries: joursFeries.length,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

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

  // Composant Sidebar
  const SidebarContent = ({ role }) => (
  <div>
    <Toolbar />
    <List>
      {[
        { 
          text: "Tableau de bord", 
          icon: <PeopleIcon />,
          path: "/"
        },
        role === "Admin" && { 
          text: "Gestion des personnels", 
          icon: <PeopleIcon />,
          path: "/employes"
        },
        { 
          text: "Gestion de Congés", 
          icon: <CongesIcon />,
          path: "/conges"
        },
       
        role === "Admin" && { 
          text: "Jours fériés", 
          icon: <EventsIcon />,
          path: "/jours-feries"
        },
        { 
          text: "Demandes de congé", 
          icon: <DemandesIcon />,
          path: "/demandes-conge"
        }
        
      ]
        .filter(Boolean)
        .map((item, index) => (
          <ListItem 
            button="true" 
            key={index}
            component={Link}
            to={item.path}
            onClick={() => isMobile && setMobileOpen(false)}
          >
            {item.icon}
            <ListItemText primary={item.text} sx={{ ml: 2 }} />
          </ListItem>
        ))}
    </List>
  </div>
)

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
            <Button 
              color="inherit"
              onClick={handleLogout}
              sx={{ textTransform: "none" }}
            >
              Déconnexion
            </Button>
          </Toolbar>
        </AppBar>

        {/* Sidebar */}
        <Box
          component="nav"
          sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        >
          <Drawer
            variant={isMobile ? "temporary" : "permanent"}
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              "& .MuiDrawer-paper": { 
                width: drawerWidth,
                boxSizing: "border-box",
              },
            }}
          >
            <SidebarContent role={user?.role} />
          </Drawer>
        </Box>

        {/* Contenu principal */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - ${drawerWidth}px)` },
          }}
        >
          <Toolbar />

          {user && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" gutterBottom>
                Bonjour, {user.prenom} {user.nom}
              </Typography>
              <Typography variant="subtitle1" sx={{ color: "text.secondary" }}>
                Rôle : {user.role}
              </Typography>
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
            <Grid container spacing={3}>
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
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Dashboard;