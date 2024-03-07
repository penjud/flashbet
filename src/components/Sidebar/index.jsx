import React, { useState } from 'react';
import clsx from 'clsx';
import { connect } from 'react-redux';
import $ from 'jquery';
import { ThemeProvider } from '@mui/material/styles';
// @mui/material
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import { createTheme } from '@mui/material/styles';
import { green } from '@mui/material/colors';
// @mui/icons-material
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
//* Components
import Account from './Account';
import Toolbar from './Toolbar';
import Event from './Event';
import Menu from './Menu';
import Market from './Market';
import Settings from './Settings';
import BootstrapButton from '../../jss/components/bootstrapButton';
//* Actions
import { setDrawerOpen } from '../../redux/actions/settings';
//* JSS
import useStyles from '../../jss/components/Sidebar';

const theme = createMuiTheme({
  palette: {
    primary: green,
  },
});

const Sidebar = ({ fullscreen, open, setDrawerOpen }) => {
  const classes = useStyles();
  const [openTab, setOpenTab] = useState(2);
  const activeStyle = '#404040';

  const changeTab = (tab) => () => {
    setOpenTab(tab);
  };

  const handleDrawerOpen = () => {
    $(`.${classes.sidebar}`).animate({ width: '16.5rem' }, 200, 'swing', () => setDrawerOpen(true));
  };

  const handleDrawerClose = () => {
    $(`.${classes.sidebar}`).animate({ width: '0px' }, 200, 'swing', () => setDrawerOpen(false) );
  };

  const createToggleButton = (name, tab) => (
    <ThemeProvider theme={theme}>
      <BootstrapButton variant="contained" style={openTab === tab ? { background: activeStyle } : {}} onClick={changeTab(tab)} className={classes.toggleButton}>
        <img alt="" src={`${window.location.origin}/icons/${name}_Icon.svg`} />
        {name}
      </BootstrapButton>
    </ThemeProvider>
  );

  const renderActiveTab = () => {
    switch (openTab) {
      case 1:
        return <Menu />;
      case 2:
        return <Market />;
      case 3:
        return <Settings />;
      default:
        return null;
    }
  };

  return (
    <>
      <Drawer
        className={classes.sidebar}
        variant="persistent"
        open
        classes={{
          paper: classes.sidebar,
        }}
        anchor="left"
      >
        <div className={classes.topSection}>
          <div className={classes.drawerHeader}>
            <IconButton className={classes.toggleSidebarButton} onClick={handleDrawerClose}><ChevronLeftIcon /></IconButton>
          </div>
          {fullscreen ? null : <Account />}
          <Toolbar />
          <Event />
          <div className={classes.menuButtons}>
            {createToggleButton('Menu', 1)}
            {createToggleButton('Market', 2)}
            {createToggleButton('Settings', 3)}
          </div>
        </div>
        {renderActiveTab()}
      </Drawer>
      {!open ? <IconButton className={clsx(classes.toggleSidebarButton, classes.openSideBarButton)} onClick={handleDrawerOpen}><ChevronRightIcon /></IconButton> : null}
    </>
  )
};

const mapStateToProps = (state) => ({
  open: state.settings.drawerOpen,
  fullscreen: state.settings.fullscreen,
});

const mapDispatchToProps = { setDrawerOpen };

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);
