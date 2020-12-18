import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  candleStick: {
    borderRight: '2px solid',
    backgroundColor: '#4f4d4f',
    position: 'relative',
    '& img': {
      display: 'block',
      position: 'absolute',
      right: '0',
      top: '0px',
    }
  },
  volumeCol: {
    position: 'absolute',
    height: '100%',
    background: 'rgba(235, 170, 109, 0.767)',
    color: '#fff',
    maxWidth: '100%',
    fontFamily: 'Open Sans',
    fontSize: '0.7rem',
    fontWeight: 'bold',
    textAlign: 'left',
  },
}));

export default useStyles;
