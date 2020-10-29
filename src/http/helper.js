export const saveBet = (order) => {
  fetch('/api/save-bet', {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify(order),
  });
};

export const removeBet = (bet) => {
  fetch('/api/remove-orders', {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify([bet]),
  });
};

export const updateTicks = (bet) => {
  fetch('/api/update-ticks', {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify(bet),
  });
};

export const updateOrderMatched = (bet) => {
  fetch('/api/update-order-matched', {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify(bet),
  });
};
