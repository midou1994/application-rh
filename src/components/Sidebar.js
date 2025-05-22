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
} from '@mui/icons-material';

const Sidebar = ({ 
  mobileOpen, 
  handleDrawerToggle, 
  drawerWidth, 
  isMobile,
  onMenuItemClick,
  userRole 
}) => {
  const [openConges, setOpenConges] = useState(false);

  const handleCongesClick = () => {
    setOpenConges(!openConges);
  };

  const menuItems = [
    { 
      text: "Tableau de bord", 
      icon: <DashboardIcon />,
      component: "dashboard"
    },
    userRole === "Admin" && { 
      text: "Gestion des personnels", 
      icon: <PeopleIcon />,
      component: "employees"
    },
    userRole === "Admin" && { 
      text: "Gestion des candidats", 
      icon: <PersonAddIcon />,
      component: "candidats",
      subItems: [
        { 
          text: "Liste des candidats", 
          icon: <PersonAddIcon />,
          component: "candidats"
        },
        { 
          text: "Entretiens", 
          icon: <GroupAddIcon />,
          component: "entretiens"
        }
      ]
    },
    { 
      text: "Gestion de Congés", 
      icon: <CongesIcon />,
      component: "conges",
      subItems: [
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
    },
    userRole === "Employe" && {
      text: "Mes congés",
      icon: <CongesIcon />,
      component: "employeeConges"
    }
  ].filter(Boolean);

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
        {menuItems.map((item, index) => (
          <React.Fragment key={index}>
            <ListItem 
              button 
              onClick={item.subItems ? handleCongesClick : () => onMenuItemClick(item.component)}
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
              {item.subItems && (openConges ? <ExpandLess /> : <ExpandMore />)}
            </ListItem>
            {item.subItems && (
              <Collapse in={openConges} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.subItems.map((subItem, subIndex) => (
                    <ListItem 
                      button 
                      key={subIndex}
                      onClick={() => onMenuItemClick(subItem.component)}
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
                        {subItem.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={subItem.text} 
                        primaryTypographyProps={{
                          sx: { fontWeight: 500 }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
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