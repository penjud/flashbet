import React from 'react';
import { connect } from 'react-redux';
import Cookies from 'universal-cookie';
// @mui/material
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
//* JSS
import useStyles from '../../jss/components/HomeView/headerStyle';

const cookies = new Cookies();

const Header = ({ id }) => {
  const classes = useStyles();

  return (
    <div className={classes.header}>
      <Typography component="h2" className={classes.sectionHeader}>
        Dashboard
      </Typography>
      <div className={classes.statusChips}>
        <Chip
          className={classes.user}
          color="primary"
          label={(
            <>
              <span>{cookies.get('username')}</span>
              {' '}
              <span>|</span>
              {' '}
              <span>ID</span>
              {' '}
              <span className={classes.username}>{id}</span>
            </>
          )}
        />
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({ id: state.account.id });

export default connect(mapStateToProps)(Header);
