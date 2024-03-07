import { withStyles } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';

export default withStyles((theme) => ({
  root: {
    fontSize: 'x-small',
    display: 'flex',
    marginRight: '-4px',
    marginTop: '-15%',
    marginBottom: '-15%',
    '&:focus': {
      '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
        color: theme.palette.common.white,
      },
    },
  },
}))(MenuItem);
