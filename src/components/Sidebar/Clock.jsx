import React, { useState } from 'react';
import moment from 'moment';
import useInterval from 'react-useinterval';
//* JSS
import useStyles from '../../jss/components/Sidebar/clockStyle';

const ONE_SECOND = 1000;

const Clock = () => {
  const classes = useStyles(); 
  const [time, setTime] = useState(new Date().toLocaleString());

  useInterval(() => {
    setTime(moment().format('lll'));
  }, ONE_SECOND);

  return (
    <div className={classes.clock}>
      <img src={`${window.location.origin}/icons/Calendar_Icon.svg`} alt="Time" />
      <span>{time}</span>
    </div>
  );
};

export default Clock;
