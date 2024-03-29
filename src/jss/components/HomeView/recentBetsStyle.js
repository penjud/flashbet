import { makeStyles } from '@mui/material/styles';

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(3, 2, 1, 2),
    height: '50%',
  },
  sectionHeader: {
    font: 'normal normal bold xx-large Roboto',
    color: '#EEEEEE',
  },
  betTableContainer: {
    height: 'inherit',
    borderRadius: theme.spacing(2),
    overflowX: 'scroll',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
  betTable: {
    height: '100%',
    '& thead': {
      backgroundColor: '#333F4B',
      boxShadow: '0px 6px 7px #00000029',
    },
    '& th': {
      color: '#F5A623',
      font: 'normal normal normal medium Roboto',
    },
    '& tbody': {
      backgroundColor: '#242526',
    },
    '& td': {
      color: '#FFFFFF',
      font: 'normal normal normal medium Roboto',
    },
  },
  profit: {
    color: '#1ae17d !important',
  },
  loss: {
    color: '#c13232 !important',
  },
}));

export default useStyles;
