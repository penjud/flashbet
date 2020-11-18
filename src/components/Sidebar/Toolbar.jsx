import React from 'react';
import { connect } from 'react-redux';
import { setActiveView, setFullscreen, openPremiumDialog } from '../../actions/settings';
import { openLiveStream } from '../../actions/draggable';

const Toolbar = ({ view, fullscreen, premiumMember, videoOpen, setActiveView, setFullscreen, openPremiumDialog, openLiveStream }) => {
  const handleClick = (view) => () => {
    setActiveView(view);
  };

  const toggleFullScreen = () => {
    setFullscreen(!fullscreen);
  };

  return (
    <div id="toolbar">
      <button type="button" onClick={openLiveStream} style={videoOpen ? { background: '#389C41' } : {}}>
        <img alt="Video" src={`${window.location.origin}/icons/youtube.png`} />
      </button>
      <button type="button" onClick={toggleFullScreen} style={fullscreen ? { background: '#389C41' } : {}}>
        <img alt="Hide" src={`${window.location.origin}/icons/sort-up.png`} />
      </button>
      <button type="button" onClick={handleClick('HomeView')} style={view === 'HomeView' ? { background: '#389C41' } : {}}>
        <img alt="Home" src={`${window.location.origin}/icons/homepage.png`} />
      </button>
      <button type="button" onClick={premiumMember ? handleClick('LadderView') : openPremiumDialog(true)} style={view === 'LadderView' ? { background: '#389C41' } : {}}>
        <img alt="Ladder" src={`${window.location.origin}/icons/menu-button-of-three-vertical-lines.png`} />
      </button>
      <button type="button" onClick={handleClick('GridView')} style={view === 'GridView' ? { background: '#389C41' } : {}}>
        <img alt="Grid" src={`${window.location.origin}/icons/menu-button-of-three-horizontal-lines.png`} />
      </button>
    </div>
  );
};

const mapStateToProps = (state) => ({
  view: state.settings.view,
  fullscreen: state.settings.fullscreen,
  premiumMember: state.settings.premiumMember,
  videoOpen: state.draggable.liveStreamOpen,
});

const mapDispatchToProps = {
  setActiveView,
  setFullscreen,
  openPremiumDialog,
  openLiveStream,
};

export default connect(mapStateToProps, mapDispatchToProps)(Toolbar);
