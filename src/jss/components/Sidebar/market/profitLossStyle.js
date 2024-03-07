import { makeStyles } from '@mui/material/styles';

const useStyles = makeStyles(() => ({
  profitLoss: {
    fontWeight: 'bold',
  },
  profit: {
    color: '#85ff85',
  },
  loss: {
    color: '#ea5b5b',
  },
  breakEven: {
    color: 'black',
  },
}));

export default useStyles;
