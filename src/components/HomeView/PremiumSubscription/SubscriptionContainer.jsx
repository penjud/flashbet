import React from 'react';
// @mui/material
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';

export default ({ plan, period, price, openPremiumDialog, classes }) => (
  <div className={classes.subscriptionContainer}>
    <Box className={classes.subscriptionBackground} />
    <div className={classes.subscriptionHeader}>{plan}</div>
    <Divider variant="middle" />
    <p className={classes.subscriptionPrice}>{`£${price}`}</p>
    <p className={classes.subscriptionPeriod}>{period}</p>
    <Button
      className={classes.subscriptionButton}
      onClick={() => {
        openPremiumDialog(true);
      }}
    >
      SIGN UP
    </Button>
  </div>
);
