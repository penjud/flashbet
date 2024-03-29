import _ from 'lodash';
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import crypto from 'crypto';
// @mui/material
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import TextField from '@mui/material/TextField';
//* Actions
import { setDisplayText, setStake, setPrice, setHours, setMinutes, setSeconds, toggleExecutionTime, setSelections, updateBackList } from '../../../../redux/actions/back';
//* Utils
import { formatPrice, getPriceFromForm, findPriceStep } from '../../../../utils/Bets/PriceCalculations';
//* JSS
import useStyles from '../../../../jss/components/Sidebar/market/tools/backLayStyle';
import StyledMenu from '../../../../jss/StyledMenu';
import StyledMenuItem from '../../../../jss/StyledMenuItem';
//* HTTP
import updateCustomOrder from '../../../../http/updateCustomOrder';

const Back = ({ stake, price, hours, minutes, seconds, executionTime, marketId, runners, selections, list, setDisplayText, setStake, setPrice, setHours, setMinutes, setSeconds, toggleExecutionTime, setSelections, updateBackList }) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const [priceStep, setPriceStep] = useState(findPriceStep(price));
  // Change the text when the fields change
  useEffect(() => {
    setDisplayText(`${stake} @ ${price}`);
  }, [setDisplayText, price, stake]);

  // Load all the runners / set All / The Field as the default
  useEffect(() => {
    setSelections(Object.keys(runners).map((key) => [runners[key].selectionId]));
  }, [setSelections, runners]);

  const handleClickListItem = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleMenuItemClick = (index) => () => {
    setSelections(index);
    setAnchorEl(null);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const updateStep = (e) => {
    const { newPrice, newStep } = getPriceFromForm(e, price, priceStep);
    if (newPrice) setPrice(newPrice);
    if (newStep) setPriceStep(newStep);
  };

  // Handle Submit click to place an order
  const placeOrder = async () => {
    if (!_.isEmpty(selections)) {
      const selectedRunners = typeof selections === 'string' ? [selections] : selections;

      const newBackList = { ...list };

      await Promise.all(
        selectedRunners.map(async (selectionId) => {
          const customerStrategyRef = crypto.randomBytes(15).toString('hex').substring(0, 15);
          const addedOrder = {
            strategy: 'Back',
            marketId,
            selectionId,
            executionTime,
            timeOffset: hours * 3600 + minutes * 60 + seconds,
            size: stake,
            side: 'BACK',
            price: formatPrice(price),
            rfs: customerStrategyRef,
          };

          updateCustomOrder('save-bet', addedOrder);

          if (!newBackList[selectionId]) {
            newBackList[selectionId] = [addedOrder];
          } else {
            newBackList[selectionId] = newBackList[selectionId].concat(addedOrder);
          }
        }),
      );
      updateBackList(newBackList);
    }
  };

  return (
    <>
      <List component="nav">
        <ListItem button aria-haspopup="true" aria-controls="lock-menu" onClick={handleClickListItem}>
          <ListItemText primary="Selections to back" secondary={selections ? (typeof selections === 'string' ? runners[selections].runnerName : 'Back All / The Field') : ''} className={classes.selectedRunner} />
        </ListItem>
      </List>
      <StyledMenu className={classes.runnerList} anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
        {/* The Menu Item for Back All / the Field */}
        {runners ? (
          <StyledMenuItem key="back-order-all/field" className={classes.runnerItem} selected={typeof selections !== 'string'} onClick={handleMenuItemClick(Object.keys(runners).map((key) => [runners[key].selectionId]))}>
            Back All / The Field
          </StyledMenuItem>
        ) : null}

        {/* Create Menu Items for all the runners and display their names
         * Store their selectionId to be used to place bets for event clicks
         */}
        {Object.keys(runners).map((key) => (
          <StyledMenuItem key={`back-order-${runners[key].runnerName}`} className={classes.runnerItem} selected={key === selections} onClick={handleMenuItemClick(key)}>
            {runners[key].runnerName}
          </StyledMenuItem>
        ))}
      </StyledMenu>

      <div className={classes.row}>
        <TextField className={classes.textField} type="number" label="stake" value={stake} inputProps={{ min: '1', style: { fontSize: 10 } }} onChange={(e) => setStake(e.target.value)} margin="normal" />
        <TextField
          className={classes.textField}
          type="number"
          label="@"
          value={price}
          inputProps={{
            min: '1.00',
            max: '1000',
            step: priceStep,
            style: { fontSize: 10 },
          }}
          onChange={updateStep}
          margin="normal"
        />
        <Button variant="outlined" className={classes.button} onClick={placeOrder}>
          Submit
        </Button>
      </div>

      <div className={classes.row}>
        <TextField className={classes.textField} type="number" label="hh" value={hours} inputProps={{ min: '0', style: { fontSize: 10 } }} onChange={(e) => setHours(e.target.value)} margin="normal" />
        <TextField className={classes.textField} type="number" label="mm" value={minutes} inputProps={{ min: '0', max: '59', style: { fontSize: 10 } }} onChange={(e) => setMinutes(e.target.value)} margin="normal" />
        <TextField className={classes.textField} type="number" label="ss" value={seconds} inputProps={{ min: '0', max: '59', style: { fontSize: 10 } }} onChange={(e) => setSeconds(e.target.value)} margin="normal" />
      </div>

      <div className={classes.row}>
        <RadioGroup name="orderexecution" value={executionTime} onChange={(e) => toggleExecutionTime(e.target.value)} className={classes.marketTimeRadioButtons}>
          <FormControlLabel value="Before" className={classes.formControlLabel} control={<Radio />} label={<span>Before market open</span>} />
          <FormControlLabel value="After" className={classes.formControlLabel} control={<Radio />} label="After market open" />
        </RadioGroup>
      </div>
    </>
  );
};

const mapStateToProps = (state) => ({
  stake: state.back.stake,
  price: state.back.price,
  hours: state.back.offset.hours,
  minutes: state.back.offset.minutes,
  seconds: state.back.offset.seconds,
  executionTime: state.back.executionTime,
  marketId: state.market.marketId,
  runners: state.market.runners,
  selections: state.back.selections,
  list: state.back.list,
});

const mapDispatchToProps = {
  setDisplayText,
  setStake,
  setPrice,
  setHours,
  setMinutes,
  setSeconds,
  toggleExecutionTime,
  setSelections,
  updateBackList,
};

export default connect(mapStateToProps, mapDispatchToProps)(Back);
