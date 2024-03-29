import React from 'react';
import { connect } from 'react-redux';
//* Actions
import {
  setDefaultView,
  toggleSound,
  toggleTools,
  toggleUnmatchedBets,
  toggleMatchedBets,
  toggleGraph,
  toggleMarketInformation,
  setWinMarketsOnly,
  toggleRules,
  toggleLadderUnmatched,
  updateStakeBtn,
  updateLayBtn,
  updateRightClickTicks,
  setHorseRacingCountries,
} from '../../../redux/actions/settings';
import RevokeAccess from './RevokeAccess';
import DefaultView from './DefaultView';
import Sounds from './Sounds';
import Tools from './Tools';
import UnmatchedBets from './UnmatchedBets';
import MatchedBets from './MatchedBets';
import Graphs from './Graphs';
import MarketInformation from './MarketInformation';
import WinMarkets from './WinMarkets';
import Rules from './Rules';
import LadderUnmatchedCol from './LadderUnmatchedCol';
import StakeButtons from './StakeButtons';
import LayButtons from './LayButtons';
import RightClickTicks from './RightClickTicks';
import HorseRacing from './HorseRacing';
//* JSS
import useStyles from '../../../jss/components/Sidebar/settings/settingsStyle';

const Settings = ({
  defaultView,
  setDefaultView,
  sounds,
  toggleSound,
  tools,
  toggleTools,
  unmatchedBets,
  toggleUnmatchedBets,
  matchedBets,
  toggleMatchedBets,
  graphs,
  toggleGraph,
  marketInfo,
  toggleMarketInformation,
  winMarketsOnly,
  setWinMarketsOnly,
  rules,
  toggleRules,
  ladderUnmatched,
  toggleLadderUnmatched,
  stakeBtns,
  updateStakeBtn,
  layBtns,
  updateLayBtn,
  rightClickTicks,
  updateRightClickTicks,
  horseRaces,
  setHorseRacingCountries,
}) => {
  const classes = useStyles();

  return (
    <div className={classes.settingsContainer}>
      <DefaultView defaultView={defaultView} toggleDefaultView={setDefaultView} classes={classes} />

      <Sounds sounds={sounds} toggleSounds={toggleSound} classes={classes} />

      <Tools tools={tools} toggleTools={toggleTools} classes={classes} />

      <UnmatchedBets unmatchedBets={unmatchedBets} toggleUnmatchedBets={toggleUnmatchedBets} classes={classes} />

      <MatchedBets matchedBets={matchedBets} toggleMatchedBets={toggleMatchedBets} classes={classes} />

      <Graphs graphs={graphs} toggleGraph={toggleGraph} classes={classes} />

      <MarketInformation marketInfo={marketInfo} toggleMarketInformation={toggleMarketInformation} classes={classes} />

      <WinMarkets winMarketsOnly={winMarketsOnly} updateWinMarketsOnly={setWinMarketsOnly} classes={classes} />

      <Rules rules={rules} toggleRules={toggleRules} classes={classes} />

      <LadderUnmatchedCol ladderUnmatched={ladderUnmatched} toggleLadderUnmatched={toggleLadderUnmatched} classes={classes} />

      <StakeButtons stakeBtns={stakeBtns} updateStakeBtn={updateStakeBtn} classes={classes} />

      <LayButtons layBtns={layBtns} updateLayBtn={updateLayBtn} classes={classes} />

      <RightClickTicks rightClickTicks={rightClickTicks} updateRightClickTicks={updateRightClickTicks} classes={classes} />

      <HorseRacing horseRaces={horseRaces} toggleHorseRaces={setHorseRacingCountries} classes={classes} />

      <RevokeAccess />
    </div>
  );
};

const mapStateToProps = (state) => ({
  defaultView: state.settings.defaultView,
  view: state.settings.view,
  sounds: state.settings.sounds,
  tools: state.settings.tools,
  unmatchedBets: state.settings.unmatchedBets,
  matchedBets: state.settings.matchedBets,
  graphs: state.settings.graphs,
  marketInfo: state.settings.marketInfo,
  winMarketsOnly: state.settings.winMarketsOnly,
  rules: state.settings.rules,
  ladderUnmatched: state.settings.ladderUnmatched,
  stakeBtns: state.settings.stakeBtns,
  layBtns: state.settings.layBtns,
  rightClickTicks: state.settings.rightClickTicks,
  horseRaces: state.settings.horseRaces,
});

const mapDispatchToProps = {
  setDefaultView,
  toggleSound,
  toggleTools,
  toggleUnmatchedBets,
  toggleMatchedBets,
  toggleGraph,
  toggleMarketInformation,
  setWinMarketsOnly,
  toggleRules,
  toggleLadderUnmatched,
  updateStakeBtn,
  updateLayBtn,
  updateRightClickTicks,
  setHorseRacingCountries,
};

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
