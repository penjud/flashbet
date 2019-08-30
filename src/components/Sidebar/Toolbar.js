import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../actions/settings';

const Toolbar = props => {

	const handleClick = (view) => {
		props.onViewChange(view);
	};

	const toggleFullScreen = () => {
		props.onToggleFullscreen(!props.fullscreen);
	};

	return (
		<div id="toolbar">
			<button onClick={e => handleClick("HomeView")}><img alt={"Training"} src={window.location.origin + '/icons/graduated.png'}/></button>
			<button onClick={e => toggleFullScreen()}><img alt={"Hide"} src={window.location.origin + '/icons/sort-up.png'}/></button>
			<button onClick={e => handleClick("HomeView")}><img alt={"Home"} src={window.location.origin + '/icons/homepage.png'}/></button>
			<button onClick={e => handleClick("LadderView")}><img alt={"Ladder"} src={window.location.origin + '/icons/menu-button-of-three-vertical-lines.png'}/></button>
			<button onClick={e => handleClick("GridView")}><img alt={"Grid"} src={window.location.origin + '/icons/menu-button-of-three-horizontal-lines.png'}/></button>
		</div>
	);
}

const mapStateToProps = state => {
	return {
		view: state.settings.view,
		fullscreen: state.settings.fullscreen
	}
}

const mapDispatchToProps = dispatch => {
	return {
		onViewChange: view => dispatch(actions.setActiveView(view)),
		onToggleFullscreen: fullscreenSelected => dispatch(actions.setFullscreen(fullscreenSelected))
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Toolbar);