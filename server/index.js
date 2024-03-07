import { App } from './app.js';

const express = import('express');
const path = import('path');
const cookieParser = import('cookie-parser');

const BetFairAccountController = import('./controllers/betfair-account');
const BetFairAuthController = import('./controllers/betfair-auth');
const BetFairBettingControlling = import('./controllers/betfair-betting');
const BetFairMenuController = import('./controllers/betfair-menu');
const TradingToolsController = import('./controllers/trading-tools');

const app = new App({
  port: process.env.NODE_ENV === 'production' ? process.env.PRODUCTION_PORT : process.env.PORT || 3001,
  controllers: [
    new BetFairAccountController(),
    new BetFairAuthController(),
    new BetFairBettingControlling(),
    new BetFairMenuController(),
    new TradingToolsController(),
  ],
  middleWares: [
    express.json(),
    express.urlencoded({ extended: true }),
    cookieParser(),
    express.static(path.join(__dirname, '../build'))
  ],
}).listen();

process.stdin.resume(); // so the program will not close instantly

const exitHandler = (options, exitCode) => {
  if (exitCode || exitCode === 0) console.log(exitCode);
  if (options.exit) process.exit();
};

// App is closing
process.on('exit', exitHandler.bind(null, { cleanup: true }));

// Catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, { exit: true }));

// Catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));

// Catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, { exit: true }));

export default app;
