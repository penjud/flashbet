import crypto from 'crypto';
import React from 'react';
import { LightenDarkenColor } from '../../utils/ColorManipulator';

export default ({
  marketId, runnerId, order, orderProps, toggleStakeAndLiabilityButtons, toggleBackAndLay, updateOrderSize,
  updateOrderPrice, toggleOrderRowVisibility, onPlaceOrder, bets, price, side, size,
}) => {
  const executeOrder = () => () => {
    const referenceStrategyId = crypto
      .randomBytes(15)
      .toString('hex')
      .substring(0, 15);
    onPlaceOrder({
      marketId,
      side,
      size,
      price,
      selectionId: runnerId,
      customerStrategyRef: referenceStrategyId,
      unmatchedBets: bets.unmatched,
      matchedBets: bets.matched,
    });
  };

  return (
    <tr
      style={{
        background: orderProps.bg,
      }}
    >
      {order.visible ? (
        <td colSpan={11}>
          <ul className="grid-order-row">
            <li onClick={toggleStakeAndLiabilityButtons({ id: runnerId })}>
              <img src={`${window.location.origin}/icons/change.png`} alt="Toggle" />
              {orderProps.text}
            </li>

            {orderProps.prices.map((size, index) => (
              <li
                key={`grid-order-${index}`}
                style={{ background: size === order.stake ? LightenDarkenColor(orderProps.bg, -20) : '' }}
                onClick={updateOrderSize({
                  id: runnerId,
                  backLay: order.backLay,
                  stake: size,
                })}
              >
                {size}
              </li>
            ))}
            <span
              className="toggle-back-lay"
              onClick={toggleBackAndLay({
							  id: runnerId,
							  backLay: order.backLay ^ 1,
              })}
            >
              {orderProps.text2}
            </span>

            <input
              type="text"
              name="stake"
              value={order.stake}
              onChange={updateOrderSize({
                id: runnerId,
                backLay: order.backLay,
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

            <button type="button" className="execute-order-btn" onClick={executeOrder()}>
              Submit
            </button>

            <span className="grid-img-container">
              <a
                href="#"
                onClick={() => false}
              >
                <img
                  src={`${window.location.origin}/icons/error.png`}
                  alt="Close"
                  onClick={toggleOrderRowVisibility({
									  id: runnerId,
									  visible: false,
                  })}
                />
              </a>
            </span>
          </ul>
        </td>
      ) : null}
    </tr>
  );
};