import React from 'react';
import clsx from 'clsx';
import { connect } from 'react-redux';
// @mui/material
import IconButton from '@mui/material/IconButton';
//* Actions
import { setLadderExpanded, setLadderBottom } from '../../../redux/actions/market';
//* Components
import Graph from './graph';
import OrderRow from '../Rows/OrderRow/OrderRow';
//* JSS
import useStyles from '../../../jss/components/LadderView/BottomContainer';

const BottomPanel = ({ selectionId, expanded, setLadderExpanded, bottom, setLadderBottom }) => {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <div className={classes.controls}>
        <IconButton onClick={() => setLadderExpanded(selectionId)} className={classes.controlBtn}>
          <img src={`${window.location.origin}/icons/caret-arrow-up.png`} alt="" />
        </IconButton>
        <IconButton
          className={clsx(classes.controlBtn, {
            [classes.selected]: bottom === 'bets',
          })}
          onClick={() => setLadderBottom(selectionId, 'bets')}
        >
          <img src={`${window.location.origin}/icons/poker-chip.png`} alt="" />
        </IconButton>
        <IconButton
          className={clsx(classes.controlBtn, {
            [classes.selected]: bottom === 'graph',
          })}
          onClick={() => setLadderBottom(selectionId, 'graph')}
        >
          <img src={`${window.location.origin}/icons/increase.png`} alt="" />
        </IconButton>
      </div>
      {!expanded ? (
        bottom === 'graph' ? (
          <div className={classes.graph}>
            <Graph selectionId={selectionId} />
          </div>
        ) : bottom === 'bets' ? (
          <OrderRow selectionId={selectionId} />
        ) : null
      ) : null}
    </div>
  );
};

const mapStateToProps = (state, { selectionId }) => ({
  expanded: state.market.ladder[selectionId].expanded,
  bottom: state.market.ladder[selectionId].bottom,
});

const mapDispatchToProps = {
  setLadderExpanded,
  setLadderBottom,
};

export default connect(mapStateToProps, mapDispatchToProps)(BottomPanel);
