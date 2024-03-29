import { withStyles } from '@mui/material/styles';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

export const ToolsTableCell = withStyles((theme) => ({
  root: {
    color: '#c7c2c2',
    // padding: theme.spacing(1, 0),
  },
  head: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  body: {
    fontFamily: 'Roboto',
    fontSize: 'small',
    fontWeight: '400',
    border: 'none',
    '& > span > span': {
      color: '#fefefe',
    },
  },
}))(TableCell);

export const ToolsTableRow = withStyles((theme) => ({
  root: {
    // backgroundColor: '#3a3b3c',
  },
}))(TableRow);
