import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Collapse,
  Box,
  Divider,
  Toolbar,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Event as EventIcon,
  ExpandLess,
  ExpandMore,
  Person as PersonIcon,
  Work as WorkIcon,
  CalendarMonth as CalendarIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';

const Sidebar = ({ mobileOpen, handleDrawerToggle, drawerWidth, isMobile, onMenuItemClick, userRole }) => {
  const [open, setOpen] = React.useState({
    conges: false,
    personnel: false,
    candidats: false
  });

  const handleClick = (section) => {
    setOpen(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const drawer = (
    <Box>
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
        <ListItem disablePadding>
          <ListItemButton onClick={() => onMenuItemClick('dashboard')}>
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Tableau de bord" />
          </ListItemButton>
        </ListItem>

        {/* Gestion des personnels */}
        {(userRole === 'Admin' || userRole === 'RH') && (
          <>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleClick('personnel')}>
                <ListItemIcon>
                  <PeopleIcon />
                </ListItemIcon>
                <ListItemText primary="Gestion des personnels" />
                {open.personnel ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
            <Collapse in={open.personnel} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton 
                  sx={{ pl: 4 }}
                  onClick={() => onMenuItemClick('employees')}
                >
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText primary="Liste des employés" />
                </ListItemButton>
              </List>
            </Collapse>
          </>
        )}

        {/* Gestion des candidats */}
        {(userRole === 'Admin' || userRole === 'RH') && (
          <>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleClick('candidats')}>
                <ListItemIcon>
                  <PersonAddIcon />
                </ListItemIcon>
                <ListItemText primary="Gestion des candidats" />
                {open.candidats ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
            <Collapse in={open.candidats} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton 
                  sx={{ pl: 4 }}
                  onClick={() => onMenuItemClick('candidats')}
                >
                  <ListItemIcon>
                    <WorkIcon />
                  </ListItemIcon>
                  <ListItemText primary="Liste des candidats" />
                </ListItemButton>
                <ListItemButton 
                  sx={{ pl: 4 }}
                  onClick={() => onMenuItemClick('entretiens')}
                >
                  <ListItemIcon>
                    <AssignmentIcon />
                  </ListItemIcon>
                  <ListItemText primary="Liste des entretiens" />
                </ListItemButton>
              </List>
            </Collapse>
          </>
        )}

        {/* Gestion de Congés */}
        <ListItem disablePadding>
          <ListItemButton onClick={() => handleClick('conges')}>
            <ListItemIcon>
              <CalendarIcon />
            </ListItemIcon>
            <ListItemText primary="Gestion de Congés" />
            {open.conges ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>
        <Collapse in={open.conges} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {(userRole === 'Admin' || userRole === 'RH') && (
              <ListItemButton 
                sx={{ pl: 4 }}
                onClick={() => onMenuItemClick('conges')}
              >
                <ListItemIcon>
                  <AssignmentIcon />
                </ListItemIcon>
                <ListItemText primary="Liste des congés" />
              </ListItemButton>
            )}
            <ListItemButton 
              sx={{ pl: 4 }}
              onClick={() => onMenuItemClick('demandes')}
            >
              <ListItemIcon>
                <AssignmentIcon />
              </ListItemIcon>
              <ListItemText primary="Demandes de congés" />
            </ListItemButton>
          </List>
          
        </Collapse>

        {/* Jours Fériés - visible for all roles */}
        <ListItem disablePadding>
          <ListItemButton onClick={() => onMenuItemClick('joursFeries')}>
            <ListItemIcon>
              <EventIcon />
            </ListItemIcon>
            <ListItemText primary="Jours Fériés" />
          </ListItemButton>
        </ListItem>

      </List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            bgcolor: 'background.paper',
            borderRight: '1px solid rgba(0, 0, 0, 0.12)'
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            bgcolor: 'background.paper',
            borderRight: '1px solid rgba(0, 0, 0, 0.12)'
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;