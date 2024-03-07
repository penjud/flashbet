import React, { useEffect, useState } from 'react';
/ @mui/material
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { ListItemText, Divider } from '@mui/material';
//* JSS
import useStyles from '../../../jss/components/Sidebar/menu/menuStyle';
//* HTTP
import fetchData from '../../../http/fetchData';

const ActiveBets = () => {
  const classes = useStyles();
  const [bets, setBets] = useState([]);

  const openMarket = (marketId) => () => {
    window.open(`/dashboard?marketId=${marketId}`);
  };

  useEffect(() => {
    const getActiveBets = async () => {
      const bets = await fetchData('/api/get-events-with-active-bets');
      if (bets) {
        setBets(bets);
      }
    };
    getActiveBets();
  }, []);

  return (
    <List className={classes.allSports}>
      {bets.map((bet) => (
        <React.Fragment key={`active-bets-${bet.event.id}`}>
          <ListItem>
            <ListItem button onClick={openMarket(bet.marketId)}>
              <ListItemText className={classes.activeBetName}>{bet.event.name}</ListItemText>
            </ListItem>
          </ListItem>
          <Divider />
        </React.Fragment>
      ))}
    </List>
  );
};

export default ActiveBets;
