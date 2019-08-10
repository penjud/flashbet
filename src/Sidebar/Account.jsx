import React, {useState} from 'react';
import useInterval from 'react-useinterval';
import Typography from '@material-ui/core/Typography';

const Account = () => {
	const [balance, setBalance] = useState(424.24);
	const [time, setTime] = useState(new Date().toLocaleString());

	useInterval(() => {
		setTime(new Date().toLocaleString());
	}, 1000);

	return (
	  <div id="sidebar-header">
	    <p paragraph>Username</p>
	    <p paragraph>£{balance}</p>
	    <span id="date-time"><img src={window.location.origin + '/icons/calendar-with-a-clock-time-tools.png'}/>{time}</span>
	  </div>
	);
}

export default Account;