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
import useStyles from '../../../jss/components/ClosedMarketView/marketReportStyle';
//* Data
import { columns, createRows } from '../../../data/tables/marketReportTable';

const MarketReport = ({ matchedBets, runners, runnerResults }) => {
  const classes = useStyles();
  const rows = createRows(runners, runnerResults, matchedBets);

  return (
    <div className={classes.marketReport}>
      <Typography component="h1" variant="h2" className={classes.title}>
        Closed Market Report
      </Typography>
      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table stickyHeader className={classes.reportTable}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.title} align={column.align}>
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow hover key={`market-report-row-${uuid()}`}>
                {columns.map(({ title }) => {
                  const data = row[title];
                  const isBetCol = title === 'win' || title === 'lose' || title === 'settled';
                  return (
                    <TableCell key={`market-report-cell-${title}-${uuid()}`}>
                      {title === 'result' ? (
                        <span
                          className={clsx(classes.marketOutcome, {
                            [classes.selectionPending]: !row.isComplete,
                            [classes.selectionWin]: row.isComplete && row.isWinner,
                            [classes.selectionLose]: row.isComplete && !row.isWinner,
                          })}
                        >
                          {row.isComplete ? (row.isWinner ? 'Won' : 'Lost') : 'N/A'}
                        </span>
                      ) : null}
                      <span
                        className={clsx({
                          [classes.hasBets]: isBetCol,
                          [classes.selectionBetsProfit]: isBetCol && parseFloat(data) > 0,
                          [classes.selectionBetsLoss]: isBetCol && parseFloat(data) < 0,
                        })}
                      >
                        {data}
                      </span>
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
  priceType: state.ladder.priceType,
  matchedBets: state.order.bets.matched,
  runners: state.market.runners,
  runnerResults: state.market.runnerResults,
});

export default connect(mapStateToProps)(MarketReport);
