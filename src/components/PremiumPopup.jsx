import React, { useEffect, forwardRef } from 'react';
import { connect } from 'react-redux';
// @mui/material
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import IconButton from '@mui/material/IconButton';
import Slide from '@mui/material/Slide';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

// @mui/icons-material
import CloseIcon from '@mui/icons-material/Close';
//* Actions
import { openPremiumDialog } from '../redux/actions/settings';
//* JSS
import useStyles from '../jss/components/PremiumPopup';

const Transition = forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

const PremiumPopup = ({ open, premiumMember, openPremiumDialog }) => {
  const classes = useStyles();

  useEffect(() => {
    if (premiumMember) {
      openPremiumDialog(false);
    }
  }, [premiumMember]);

  const handleOpenWebsite = () => {
    window.open('https://www.flashbetting.co.uk', '_blank');
  };

  return (
    <Dialog open={open} onClose={() => openPremiumDialog(false)} TransitionComponent={Transition}>
      <AppBar className={classes.appBar}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => openPremiumDialog()} aria-label="close">
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            Flash Betting Premium Licence
          </Typography>
        </Toolbar>
      </AppBar>
      <DialogContent className={classes.content}>
        <DialogContentText>
          To purchase a premium subscription to Flash Betting you must do so in your web browser. Go to
          <Button onClick={handleOpenWebsite}>
            {' '}
            <b><u>www.flashbetting.co.uk</u></b>
            {' '}
          </Button>
          and navigate to the purchase page. You can manage your subscriptions, and track your payments there.
        </DialogContentText>
      </DialogContent>
    </Dialog>
  );
};

const mapStateToProps = (state) => ({
  open: state.settings.premiumPopupOpen,
  premiumMember: state.settings.premiumMember,
});

const mapDispatchToProps = { openPremiumDialog };

export default connect(mapStateToProps, mapDispatchToProps)(PremiumPopup);
