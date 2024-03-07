import { makeStyles } from '@mui/material/styles';

const useStyles = makeStyles((theme) => ({
  clock: {
    '& span': {
      verticalAlign: 'super',
      paddingLeft: theme.spacing(1),
    },
  },
}));

export default useStyles;
