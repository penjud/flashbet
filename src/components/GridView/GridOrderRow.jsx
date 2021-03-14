import React from 'react';
import { connect } from 'react-redux';
import clsx from 'clsx';
import crypto from 'crypto';
//* @material-ui core
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
//* Actions
import { placeOrder } from '../../actions/bet';
//* JSS
import useStyles from '../../jss/components/GridView/GridOrderRow';
//* Utils
import { formatPrice } from '../../utils/Bets/PriceCalculations';
import { LightenDarkenColor } from '../../utils/ColorManipulator';

const GridOrderRow = ({ marketId, runnerId, order, toggleStakeAndLiabilityButtons, toggleBackAndLay, stakeBtns, layBtns, stakeLiability, updateOrderSize, updateOrderPrice, toggleOrderRowVisibility, placeOrder, bets, price, side, size }) => {
  const classes = useStyles();

  const executeOrder = () => {
    const referenceStrategyId = crypto.randomBytes(15).toString('hex').substring(0, 15);
    placeOrder({
      marketId,
      side,
      size,
      price: formatPrice(price),
      selectionId: runnerId,
      customerStrategyRef: referenceStrategyId,
    });
  };

  return order.visible ? (
    <tr className={classes.gridOrderRow}>
      <td colSpan={11}>
        <ul className={classes.gridOrderRow}>
          <li onClick={toggleStakeAndLiabilityButtons({ id: runnerId })}>
            <img
              className={clsx({
                [classes.switch]: true,
                [classes.switchStake]: stakeLiability === 0,
                [classes.switchLiability]: stakeLiability === 1,
              })}
              style={{ transform: `scaleX(${stakeLiability === 0 ? 1 : -1})` }}
              src={`${window.location.origin}/icons/red_switch.png`}
              alt="Toggle"
            />
            {stakeLiability === 0 ? 'STAKE' : 'Liability'}
          </li>

          {(stakeLiability === 0 ? stakeBtns : layBtns).map((size, index) => (
            <li
              key={`grid-order-${index}`}
              className={clsx({
                [classes.stakeButton]: stakeLiability === 0,
                [classes.liabilityButton]: stakeLiability === 1,
              })}
              style={{ background: size === order.stake ? LightenDarkenColor(stakeLiability === 0 ? '#007aaf' : '#d4696b', -20) : '' }}
              onClick={updateOrderSize({
                id: runnerId,
                side,
                stake: size,
              })}
            >
              {size}
            </li>
          ))}
          <span
            className={classes.toggleBackLay}
            onClick={toggleBackAndLay(runnerId, side)}
          >
            {side}
          </span>

          <input
            type="text"
            name="stake"
            value={order.stake}
            onChange={updateOrderSize({
              id: runnerId,
              side,
            })}
          />
          <span>@</span>

          <input
            type="number"
            name="price"
            min="1"
            max="1000"
            value={order.price}
            onChange={updateOrderPrice({
              id: runnerId,
              price: order.price,
            })}
          />

          <Button className={classes.submitBtn} onClick={executeOrder}>
            Submit
          </Button>

          <IconButton
            aria-label="close"
            className={classes.gridImgContainer}
            onClick={toggleOrderRowVisibility({
              id: runnerId,
              visible: false,
            })}
          >
            <img src={`${window.location.origin}/icons/X_Button.svg`} alt="" />
          </IconButton>
        </ul>
      </td>
    </tr>
  ) : null;
};

const mapStateToProps = (state) => ({
  marketId: state.market.marketId,
  stakeBtns: state.settings.stakeBtns,
  layBtns: state.settings.layBtns,
});

const mapDispatchToProps = { placeOrder };

export default connect(mapStateToProps, mapDispatchToProps)(GridOrderRow);
