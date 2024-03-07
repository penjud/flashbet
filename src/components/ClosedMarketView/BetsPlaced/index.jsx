import React from 'react';
import { connect } from 'react-redux';
import uuid from 'react-uuid';
import clsx from 'clsx';
// @mui/material
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
//* JSS
import useStyles from '../../../jss/components/ClosedMarketView/betsPlacedStyle';
//* Data
import { columns, createRows } from '../../../data/tables/marketReportBetsTable';

const BetsPlaced = ({ matchedBets, runners, runnerResults }) => {
  const classes = useStyles();
  const rows = createRows(runners, runnerResults, matchedBets);

  return (
    <div className={classes.betsPlaced}>
      <Typography component="h1" variant="h2" className={classes.title}>
        Bets Placed
      </Typography>
      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table stickyHeader className={classes.betTable}>
          <TableHead>
            <TableRow>
              {columns.map(({ id, label }) => (
                <TableCell key={id}>{label}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow hover key={`market-report-bets-row-${uuid()}`}>
                {columns.map(({ id }) => {
                  const data = row[id];
                  const isSideBack = row.side === 'BACK';
                  return (
                    <TableCell key={`market-report-bets-cell-${id}-${uuid()}`}>
                      {id === 'sizeMatched' ? (
                        <span
                          className={clsx(classes.betSide, {
                            [classes.backText]: isSideBack,
                            [classes.layText]: !isSideBack,
                          })}
                        >
                          {row.sizeMatched}
                        </span>
                      ) : null}
                      {id === 'win' ? (
                        <span
                          className={clsx(classes.betOutcome, {
                            [classes.betWin]: row.win,
                            [classes.betLose]: !row.win,
                          })}
                        >
                          {row.win ? 'Won' : 'Lost'}
                        </span>
                      ) : null}
                      {data}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

const mapStateToProps = (state) => ({
  matchedBets: state.order.bets.matched,
  runners: state.market.runners,
  runnerResults: state.market.runnerResults,
});

export default connect(mapStateToProps)(BetsPlaced);
