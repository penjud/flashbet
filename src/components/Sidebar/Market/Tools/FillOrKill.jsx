import React, { useEffect } from 'react';
import { connect } from 'react-redux';
// @mui/material
import TextField from '@mui/material/TextField';
//* JSS
import useStyles from '../../../../jss/components/Sidebar/market/tools/fillOrKillStyle';
//* Actions
import { setDisplayText, setFillOrKill } from '../../../../redux/actions/fillOrKill';

const FillOrKill = ({ seconds, setDisplayText, setFillOrKill }) => {
  const classes = useStyles();

  useEffect(() => {
    setDisplayText(`${seconds} seconds`);
  }, [seconds, setDisplayText]);

  return (
    <div className={classes.row}>
      <TextField className={classes.number} type="number" label="Seconds" value={seconds} inputProps={{ min: '1', max: '100' }} onChange={(e) => setFillOrKill(e.target.value)} margin="normal" />
    </div>
  );
};

const mapStateToProps = (state) => ({
  seconds: state.fillOrKill.seconds,
});

const mapDispatchToProps = {
  setDisplayText,
  setFillOrKill,
};

export default connect(mapStateToProps, mapDispatchToProps)(FillOrKill);
