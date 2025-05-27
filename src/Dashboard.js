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
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
} from "@mui/material";
import {
  People as PeopleIcon,
  Assignment as DemandesIcon,
  BeachAccess as CongesIcon,
  Event as EventsIcon,
  Menu as MenuIcon,
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
  Work as WorkIcon,
  ExpandLess,
  ExpandMore,
  PersonAdd as PersonAddIcon,
} from "@mui/icons-material";
import { ThemeProvider } from "@mui/material/styles";
import Personnel from './components/Personnel';
import Conges from './components/Conges';
import JoursFeries from './components/JoursFeries';
import DemandeConge from './components/DemandeConge';
import CandidatList from './gestion_des_personnels/CandidatList';
import CandidatForm from './gestion_des_personnels/CandidatForm';
import EntretienList from './gestion_des_personnels/EntretienList';
import EntretienForm from './gestion_des_personnels/EntretienForm';
import CarriereList from './gestion_de_carriere/CarriereList';

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

  const menuGroups = [
    {
      id: 'dashboard',
      items: [
        { text: "Tableau de bord", icon: <DashboardIcon />, component: "dashboard" }
      ]
    },
    {
      id: 'personnel',
      title: "Gestion du Personnel",
      icon: <PeopleIcon />,
      items: [
        { text: "Liste des employés", icon: <PeopleIcon />, component: "employees" }
      ]
    },
    {
      id: 'recrutement',
      title: "Gestion de Recrutement",
      icon: <PersonAddIcon />,
      items: [
        { text: "Candidats", icon: <PeopleIcon />, component: "candidats" },
        { text: "Entretiens", icon: <DemandesIcon />, component: "entretiens" }
      ]
    },
    {
      id: 'carriere',
      title: "Gestion de Carrière",
      icon: <WorkIcon />,
      items: [
        { text: "Plan de carrière", icon: <WorkIcon />, component: "carriere" }
      ]
    },
    {
      id: 'conges',
      title: "Gestion des Congés",
      icon: <CongesIcon />,
      items: [
        { text: "Liste des congés", icon: <CongesIcon />, component: "conges" },
        { text: "Jours fériés", icon: <EventsIcon />, component: "joursFeries" },
        { text: "Demandes de congés", icon: <DemandesIcon />, component: "demandes" }
      ]
    }
  ];

  const [openGroups, setOpenGroups] = useState({
    personnel: false,
    recrutement: false,
    carriere: false,
    conges: false
  });

  const handleGroupClick = (group) => {
    setOpenGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  const drawer = (
    <div>
      <Toolbar sx={{ 
        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
        color: 'white'
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          fontWeight: 'bold',
          fontSize: '1.2rem'
        }}>
          <DashboardIcon /> RH System
        </Box>
      </Toolbar>
      <List>
        {menuGroups.map((group) => (
          <React.Fragment key={group.id}>
            {group.title ? (
              <>
                <ListItem 
                  button 
                  onClick={() => handleGroupClick(group.id)}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(33, 150, 243, 0.1)',
                      '& .MuiListItemIcon-root': {
                        color: '#2196F3'
                      },
                      '& .MuiListItemText-primary': {
                        color: '#2196F3'
                      }
                    }
                  }}
                >
                  <ListItemIcon sx={{ color: 'text.secondary' }}>
                    {group.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={group.title} 
                    primaryTypographyProps={{
                      sx: { fontWeight: 500 }
                    }}
                  />
                  {openGroups[group.id] ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                <Collapse in={openGroups[group.id]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {group.items.map((item) => (
                      <ListItem 
                        button 
                        key={item.text}
                        onClick={() => handleMenuItemClick(item.component)}
                        sx={{
                          pl: 4,
                          backgroundColor: activeComponent === item.component ? 'rgba(33, 150, 243, 0.1)' : 'transparent',
                          '&:hover': {
                            backgroundColor: 'rgba(33, 150, 243, 0.1)',
                            '& .MuiListItemIcon-root': {
                              color: '#2196F3'
                            },
                            '& .MuiListItemText-primary': {
                              color: '#2196F3'
                            }
                          }
                        }}
                      >
                        <ListItemIcon sx={{ 
                          color: activeComponent === item.component ? '#2196F3' : 'text.secondary' 
                        }}>
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText 
                          primary={item.text} 
                          primaryTypographyProps={{
                            sx: { 
                              fontWeight: activeComponent === item.component ? 600 : 500,
                              color: activeComponent === item.component ? '#2196F3' : 'inherit'
                            }
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </>
            ) : (
              // Non-collapsible items (like Dashboard)
              group.items.map((item) => (
                <ListItem 
                  button 
                  key={item.text}
                  onClick={() => handleMenuItemClick(item.component)}
                  sx={{
                    backgroundColor: activeComponent === item.component ? 'rgba(33, 150, 243, 0.1)' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(33, 150, 243, 0.1)',
                      '& .MuiListItemIcon-root': {
                        color: '#2196F3'
                      },
                      '& .MuiListItemText-primary': {
                        color: '#2196F3'
                      }
                    }
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: activeComponent === item.component ? '#2196F3' : 'text.secondary' 
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{
                      sx: { 
                        fontWeight: activeComponent === item.component ? 600 : 500,
                        color: activeComponent === item.component ? '#2196F3' : 'inherit'
                      }
                    }}
                  />
                </ListItem>
              ))
            )}
          </React.Fragment>
        ))}
      </List>
    </div>
  );

  // Component content based on active component
  const renderComponentContent = () => {
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
        return <Personnel />;
      case "conges":
        return <Conges />;
      case "joursFeries":
        return <JoursFeries />;
      case "demandes":
        return <DemandeConge />;
      case "carriere":
        return <CarriereList />;
      case "candidats":
        return <CandidatList />;
      case "entretiens":
        return <EntretienList />;
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
              '& .MuiDrawer-paper': { 
                width: drawerWidth,
                boxSizing: 'border-box',
                borderRight: '1px solid rgba(0, 0, 0, 0.12)',
                boxShadow: '2px 0 8px rgba(0,0,0,0.05)'
              },
            }}
          >
            {drawer}
          </Drawer>
        </Box>

        {/* Contenu principal */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            minHeight: '100vh',
            bgcolor: 'background.default'
          }}
        >
          <Toolbar />
          {renderComponentContent()}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Dashboard;