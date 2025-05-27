import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  Divider,
  Collapse,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  BeachAccess as CongesIcon,
  Event as EventsIcon,
  Assignment as DemandesIcon,
  ExpandLess,
  ExpandMore,
  PersonAdd as PersonAddIcon,
  GroupAdd as GroupAddIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';

const Sidebar = ({ 
  mobileOpen, 
  handleDrawerToggle, 
  drawerWidth, 
  isMobile,
  onMenuItemClick,
  userRole 
}) => {
  const [openGroups, setOpenGroups] = useState({
    personnel: false,
    conges: false,
    carriere: false
  });

  const handleGroupClick = (group) => {
    setOpenGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  const menuGroups = [
    {
      id: 'dashboard',
      items: [
        { 
          text: "Tableau de bord", 
          icon: <DashboardIcon />,
          component: "dashboard"
        }
      ]
    },
    {
      id: 'personnel',
      title: "Gestion du Personnel",
      icon: <PeopleIcon />,
      items: [
        userRole === "Admin" && { 
          text: "Liste des employés", 
          icon: <PeopleIcon />,
          component: "employees"
        },
        userRole === "Admin" && { 
          text: "Gestion des candidats", 
          icon: <PersonAddIcon />,
          component: "candidats"
        },
        userRole === "Admin" && { 
          text: "Entretiens", 
          icon: <GroupAddIcon />,
          component: "entretiens"
        }
      ].filter(Boolean)
    },
    {
      id: 'carriere',
      title: "Gestion de Carrière",
      icon: <WorkIcon />,
      items: [
        { 
          text: "Plan de carrière", 
          icon: <TimelineIcon />,
          component: "carriere"
        },
        { 
          text: "Compétences", 
          icon: <SchoolIcon />,
          component: "competences"
        },
        { 
          text: "Formations", 
          icon: <SchoolIcon />,
          component: "formations"
        }
      ]
    },
    {
      id: 'conges',
      title: "Gestion des Congés",
      icon: <CongesIcon />,
      items: [
        userRole === "Admin" && { 
          text: "Liste des congés", 
          icon: <CongesIcon />,
          component: "conges"
        },
        userRole === "Admin" && { 
          text: "Jours fériés", 
          icon: <EventsIcon />,
          component: "joursFeries"
        },
        { 
          text: userRole === "Employe" ? "Mes congés" : "Demandes de congé", 
          icon: <DemandesIcon />,
          component: "demandes"
        }
      ].filter(Boolean)
    }
  ];

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
      <Divider />
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
                    {group.items.map((item, index) => (
                      <ListItem 
                        button 
                        key={index}
                        onClick={() => onMenuItemClick(item.component)}
                        sx={{
                          pl: 4,
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
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText 
                          primary={item.text} 
                          primaryTypographyProps={{
                            sx: { fontWeight: 500 }
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </>
            ) : (
              // Non-collapsible items (like Dashboard)
              group.items.map((item, index) => (
                <ListItem 
                  button 
                  key={index}
                  onClick={() => onMenuItemClick(item.component)}
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
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{
                      sx: { fontWeight: 500 }
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

  return (
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
  );
};

export default Sidebar; 