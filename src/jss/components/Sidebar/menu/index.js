import { makeStyles } from '@mui/material/styles';
import headerStyle from '../headerStyle';
import scrollbar from '../../../scrollbarStyle';

const useStyles = makeStyles(() => ({
  menuContainer: {
    ...scrollbar,
    overflowX: 'hidden',
    overflowY: 'scroll',
  },
  ...headerStyle,
}));

export default useStyles;
