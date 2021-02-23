export const setAllSports = (sports) => ({
  type: 'SPORTS_LIST',
  payload: sports,
});

export const updateSubmenuList = (submenu) => ({
  type: 'UPDATE_SUBMENU_LIST',
  payload: submenu,
});

export const updateSubmenuListMyMarkets = (submenu) => ({
  type: 'UPDATE_SUBMENU_LIST_MYMARKETS',
  payload: submenu,
});

export const loadMyMarkets = (markets) => ({
  type: 'LOAD_MY_MARKETS',
  payload: markets,
});
