import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  menuBets: {
    fontFamily: '"Trebuchet MS", Arial, Helvetica, sans-serif',
    borderCollapse: 'collapse',
    tableLayout: 'fixed',
    border: 'none',
    margin: '0 auto',
    width: '100%',
    height: 'auto',
  },
  button: {
    height: '22px',
    width: 'auto',
    backgroundColor: 'transparent',
    visibility: 'collapse',
    pointerEvents: 'none',
  },
  heading: {
    background: '#ff6600',
    '& > td': {
      padding: '2px',
    },
  },
  event: {
    width: '400%',
    background: '#6f6f1f',
    display: 'inline-block',
    color: 'white',
  },
  selection: {
    display: 'inline-block',
    width: '400%',
    background: 'rgb(0, 111, 223)',
    color: 'rgb(223, 223, 0)',
    '& > td': {
      padding: '2px',
    },
  },
  matchedBet: {
    fontSize: 'small',
  },
  profitLoss: {
    fontWeight: 'bold',
  },
}));

export default useStyles;
