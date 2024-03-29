import React from 'react';
// @mui/material
import { ListItem, ListItemText, ListItemIcon } from '@mui/material';
//* JSS
import useStyles from '../../../jss/components/Sidebar/menu/deselectSportStyle';

export default ({ index, name, isFirst, isLast, deselectSubmenu }) => {
  const classes = useStyles();

  return (
    <ListItem button className={isLast ? classes.deselectLast : ''} onClick={() => deselectSubmenu(index, Boolean(isFirst))}>
      <ListItemIcon className={isLast ? classes.deselectIconLast : ''}>
        <img src={`${window.location.origin}/icons/${isFirst ? 'back-arrow.png' : 'caret-down.png'}`} alt="" />
      </ListItemIcon>
      <ListItemText className={classes.deselectText}>{name}</ListItemText>
    </ListItem>
  );
};
