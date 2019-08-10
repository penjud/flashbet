import React, {Component} from 'react';
import useStyles from '../../Styles/Styles.jsx';
import AppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';

const Graphs = () => {
	const classes = useStyles();

	return (
		<div>
			<AppBar className={classes.appBar} position="static">
				<Typography variant="h6" className={classes.title}>
				Graphs
				</Typography>
			</AppBar>
			<div id="menu-graph">
				<img src={window.location.origin + '/images/graph.png'}/>
			</div>
		</div>
	);
};

export default Graphs;