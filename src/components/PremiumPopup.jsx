import React, { useEffect, useState, forwardRef } from 'react';
import { connect } from 'react-redux';
import { CardElement, Elements, useStripe, useElements } from '@stripe/react-stripe-js';
import DropIn from 'braintree-web-drop-in-react';
//* @material-ui core
import AppBar from '@material-ui/core/AppBar';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import IconButton from '@material-ui/core/IconButton';
import Slide from '@material-ui/core/Slide';
import { makeStyles } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
//* @material-ui icons
import CloseIcon from '@material-ui/icons/Close';
//* Actions
import { openPremiumDialog, setPremiumStatus } from '../actions/settings';
//* Utils
import { getDate180DaysAhead, getDate1YearAhead, getDate30DaysAhead } from '../utils/DateCalculator';

const useStyles = makeStyles((theme) => ({
  appBar: {
    position: 'relative',
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
  paypal: {
    display: 'flex',
    flexDirection: 'column',
    margin: 'auto',
    width: 'fit-content',
  },
}));

const Transition = forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

const PremiumPopup = ({ open, premiumMember, selectedPremium, openPremiumDialog, setPremiumStatus }) => {
  const classes = useStyles();
  const stripe = useStripe();
  const elements = useElements();
  const [clientToken, setClientToken] = useState(null);
  const [instance, setInstance] = useState(null);

  const getToken = async () => {
    // Get a client token for authorization from your server
    await fetch('/api/generate-client-token')
      .then((res) => res.json())
      .then((data) => setClientToken(data.clientToken));
  };

  useEffect(() => {
    getToken();
  }, []);

  useEffect(() => {
    if (premiumMember) {
      openPremiumDialog(false);
    }
  }, [premiumMember]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement),
    });
    console.log(error, paymentMethod);
  };

  const buy = async () => {
    // Send the nonce to your server
    const { nonce } = await instance.requestPaymentMethod();
    await fetch('/api/checkout/', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        payment_method_nonce: nonce,
        expiresIn: selectedPremium === 'monthly' ? getDate30DaysAhead() : selectedPremium === 'biannually' ? getDate180DaysAhead() : getDate1YearAhead(),
        amount: selectedPremium === 'monthly' ? 9.99 : selectedPremium === 'biannually' ? 49.99 : 99.99,
      }),
    }).then(() => {
      setPremiumStatus(true);
      openPremiumDialog(false);
    });
  };

  const renderForm = () => {
    if (clientToken) {
      return (
        <>
          <DropIn
            options={{ authorization: clientToken }}
            onInstance={(instance) => {
              setInstance(instance);
            }}
          />
          <button type="button" onClick={buy}>
            Buy
          </button>
        </>
      );
    }
    return null;
  };

  return (
    <Dialog open={open} onClose={() => openPremiumDialog(false)} TransitionComponent={Transition}>
      <AppBar className={classes.appBar}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => openPremiumDialog()} aria-label="close">
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            Sports Flash Betting Licence
          </Typography>
        </Toolbar>
      </AppBar>
      <DialogContent>
        <DialogContentText>
          You are required to pay the monthly subscription fee of £{selectedPremium === 'monthly' ? 9.99 : selectedPremium === 'biannually' ? 49.99 : 99.99} in order to access Flash Betting&apos;s advanced features.
        </DialogContentText>
        {/* {renderForm()} */}
        <CardElement />
        <form onSubmit={handleSubmit}>
          <button type="submit" disabled={!stripe}>
            Pay
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const mapStateToProps = (state) => ({
  open: state.settings.premiumPopupOpen,
  premiumMember: state.settings.premiumMember,
  selectedPremium: state.settings.selectedPremium,
});

const mapDispatchToProps = { openPremiumDialog, setPremiumStatus };

export default connect(mapStateToProps, mapDispatchToProps)(PremiumPopup);
