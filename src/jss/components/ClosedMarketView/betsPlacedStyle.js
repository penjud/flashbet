import { makeStyles } from '@mui/material/styles';

const useStyles = makeStyles((theme) => ({
  betsPlaced: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    marginLeft: theme.spacing(0.5),
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      marginTop: '1%',
    },
  },
  tableContainer: {
    overflowX: 'auto',
    width: 'auto',
    height: '100%',
    background: '#242526',
    border: '2px solid #333F4B',
    overflowY: 'scroll',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
  betTable: {
    paddingBottom: theme.spacing(4),
    '& span': {
      fontFamily: 'Roboto',
      color: '#EEEEEE',
    }
  },
  title: {
    backgroundColor: '#333F4B',
    boxShadow: '0px 6px 7px #00000029',
    color: '#EEEEEE',
    padding: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    font: 'normal normal bold 1.75rem Roboto',
    borderRadius: theme.spacing(1, 1, 0, 0),
  },
  betSide: {
    padding: '2px',
    paddingLeft: '4px',
    width: '20%',
    borderRadius: '2px',
    marginRight: '2%',
    display: 'inline-block',
    color: 'white',
  },
  backText: {
    backgroundColor: 'rgb(114, 187, 239)',
  },
  layText: {
    backgroundColor: 'rgb(250, 169, 186)',
  },
  betOutcome: {
    display: 'inline-block',
    minWidth: '40%',
    padding: '3px',
    borderRadius: '3px',
    textAlign: 'center',
    color: 'white',
  },
  betWin: {
    backgroundColor: 'rgb(37, 194, 129)',
  },
  betLose: {
    backgroundColor: 'rgb(237, 107, 117)',
  },
}));

export default useStyles;
