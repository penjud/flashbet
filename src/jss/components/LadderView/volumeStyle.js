import { makeStyles } from '@mui/material/styles';

const useStyles = makeStyles(() => ({
  candleStick: {
    borderRight: '2px solid',
    backgroundColor: '#121212',
    position: 'relative',
    '& img': {
      display: 'block',
      position: 'absolute',
      right: '0',
      top: '0px',
      width: '2px',
      height: '16px',
    }
  },
  volumeCol: {
    position: 'absolute',
    height: '100%',
    backgroundColor: '#a8613680',
    color: '#c7c2c2',
    maxWidth: '100%',
    fontFamily: 'Lato',
    fontSize: '0.7rem',
    fontWeight: 'bold',
    textAlign: 'left',
  },
}));

export default useStyles;
