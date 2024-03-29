import React, { memo, useMemo } from 'react';
import { connect } from 'react-redux';
//* Actions
import { updateLadderOrder, setDraggingLadder } from '../../redux/actions/ladder';
//* JSS
import useStyles from '../../jss/components/LadderView/containerStyle';

const LadderContainer = memo(({
  marketStatus, isReferenceSet, order, containerRef, isMoving, isLadderDown, setIsReferenceSet, runners,
  ladderOrderList, updateLadderOrder, setIsMoving, setLadderDown, children, setDraggingLadder, draggingLadder,
}) => {
  const classes = useStyles();
  const style = useMemo(() => (marketStatus === 'SUSPENDED'
    ? {
      left: isReferenceSet ? `${order * containerRef.current.clientWidth}px` : '0px',
      visibility: isReferenceSet ? 'visible' : 'collapse',
      opacity: '0.3',
      zIndex: -1,
    } : {
      left: isReferenceSet ? `${order * containerRef.current.clientWidth}px` : '0px',
      visibility: isReferenceSet ? 'visible' : 'collapse',
      opacity: isMoving ? '0.7' : '1.0',
      cursor: isLadderDown ? 'move' : 'default',
    }), [containerRef, isLadderDown, isMoving, isReferenceSet, marketStatus, order]);

  const handleMouseMove = (e) => {
    if (containerRef.current === null) return;
    if (!isLadderDown) return;
    moveLadder(e.movementX, e.clientX, isReferenceSet, containerRef, order, runners, ladderOrderList, updateLadderOrder, setIsMoving);
    if (!draggingLadder) setDraggingLadder(false);
  };

  const handleMouseUp = (e) => {
    if (containerRef.current === null) return;
    if (!isLadderDown) return;
    setDraggingLadder(false);
    setLadderDown(false);
    returnToOrderedPos(containerRef, order, setIsMoving);
  };

  const handleMouseLeave = (e) => {
    if (containerRef.current === null) return;
    if (!isLadderDown) return;
    setDraggingLadder(false);
    setLadderDown(false);
    returnToOrderedPos(containerRef, order, setIsMoving);
  };

  return (
    <div
      className={classes.container}
      style={style}
      ref={containerRef}
      onLoad={setIsReferenceSet}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
});

const returnToOrderedPos = (containerRef, order, setIsMoving) => {
  containerRef.current.style.left = `${order * containerRef.current.clientWidth}px`;
  containerRef.current.style['z-index'] = 0;
  setIsMoving(false);
};

const moveLadder = (offsetPos, cursorPosition, isReferenceSet, containerRef, order, runners, ladderOrderList, updateLadderOrder, setIsMoving) => {
  if (!isReferenceSet) return;
  containerRef.current.style.left = `${parseInt(containerRef.current.style.left, 10) + offsetPos}px`;
  containerRef.current.style['z-index'] = 9999;

  // filter out the current ladder
  const otherNodes = {};
  for (const key in containerRef.current.parentNode.childNodes) {
    if (key == order + 1 || key == order - 1) {
      // check for only the one before and after it
      otherNodes[key] = containerRef.current.parentNode.childNodes[key];
    }
  }

  // find our relative cursor positionn
  const relativeCursorPosition =		containerRef.current.offsetParent.scrollLeft + cursorPosition - containerRef.current.offsetParent.offsetLeft;

  for (const key in otherNodes) {
    // find the mid way point of the other nodes
    const midPoint = parseInt(otherNodes[key].style.left, 10) + otherNodes[key].clientWidth / 2;

    // move right or left
    if ((relativeCursorPosition > midPoint && order < key) || (relativeCursorPosition < midPoint && order > key)) {
      // we have to find the actual id if one of the ladders are hidden in the sidebar market
      const thisLadderIndex = Object.values(runners).findIndex(
        (item) => item.runnerName.replace(/[0-9.]*[.,\s]/g, ' ').trim()
					== containerRef.current.children[0].children[0].childNodes[0].childNodes[1].data
					  .replace(/[0-9.]*[.,\s]/g, ' ')
					  .trim(),
      ); // ladder header -> contender name -> name
      const thisLadderId = Object.keys(runners)[thisLadderIndex];

      const thisLadderOrder = Object.values(ladderOrderList).findIndex((item) => item == thisLadderId);
      if (thisLadderOrder === -1) break;

      const otherLadderIndex = Object.values(runners).findIndex(
        (item) => item.runnerName.replace(/[0-9.]*[.,\s]/g, ' ').trim()
					== otherNodes[key].children[0].children[0].childNodes[0].childNodes[1].data.replace(/[0-9.]*[.,\s]/g, ' ').trim(),
      ); // ladder header -> contender name -> name
      const otherLadderId = Object.keys(runners)[otherLadderIndex];

      const otherLadderOrder = Object.values(ladderOrderList).findIndex((item) => item == otherLadderId);
      if (otherLadderOrder === -1) break;

      // swap Ladders
      const newOrderList = { ...ladderOrderList };

      newOrderList[thisLadderOrder] = ladderOrderList[otherLadderOrder];
      newOrderList[otherLadderOrder] = ladderOrderList[thisLadderOrder];

      updateLadderOrder(newOrderList);

      otherNodes[key].style.left = `${order * containerRef.current.clientWidth}px`;

      break;
    }
  }
  setIsMoving(true);
};

const mapStateToProps = (state) => ({
  marketStatus: state.market.status,
  runners: state.market.runners,
  ladderOrderList: state.ladder.ladderOrder,
  draggingLadder: state.ladder.draggingLadder,
});

const mapDispatchToProps = { updateLadderOrder, setDraggingLadder };

export default connect(mapStateToProps, mapDispatchToProps)(LadderContainer);
