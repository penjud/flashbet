import express from 'express';
import path from 'path';
import http from 'http';
import { Server as SocketIO } from 'socket.io';
import SseStream from 'ssestream';
import cookieParser from 'cookie-parser';

import BetFairSession from './betfair/session.js';
import { isAuthURL } from './utils/validator.js';

class App {
  constructor({ port, controllers, middleWares }) {
    this.port = port;
    this.app = express();
    this.server = http.createServer(this.app);
    this.sseStream = null;
    this.betfair = new BetFairSession();

    if (process.env.NODE_ENV === 'production') {
      const bundlePath = path.join(__dirname, '../build/index.html');
      this.app.get('/', (req, res) => res.sendFile(bundlePath));
      this.app.get('/dashboard', (req, res) => res.sendFile(bundlePath));
      this.app.get('/authentication', (req, res) => res.sendFile(bundlePath));
      this.app.get('/validation', (req, res) => res.sendFile(bundlePath));
      this.app.get('/logout', (req, res) => res.sendFile(bundlePath));

      this.app.get('/sse', (req, res) => {
        this.sseStream = new SseStream(req);
        this.sseStream.pipe(res);

        res.on('close', () => {
          this.sseStream.unpipe(res);
        });
      });
    }

    this.applyMiddlewares(middleWares);
    this.app.use(cookieParser());
    this.applyAuthMiddleware();

    this.initRoutes(controllers);

    this.io = new SocketIO(this.server);
    this.io.on('connection', this.onClientConnected.bind(this));

    return this;
  }

  applyMiddlewares(middleWares) {
    middleWares.forEach(middleware => {
      this.app.use(middleware);
    });
  }

  applyAuthMiddleware() {
    this.app.use('/', async (req, res, next) => {
      if (!this.betfair.email && req.cookies.username) {
        this.betfair.setEmailAddress(req.cookies.username);
      }

      if (!req.cookies.username && !validator.isAuthURL(req.url)) {
        return res.status(401).json({
          error: 'NO_SESSION',
        });
      }

      if (!this.betfair.sessionKey && req.cookies.sessionKey) {
        this.betfair.setSession(req.cookies.sessionKey);
      }

      if (!req.cookies.sessionKey && !validator.isAuthURL(req.url)) {
        return res.status(401).json({
          error: 'NO_SESSION',
        });
      }

      req.betfair = this.betfair;
      req.sseStream = this.sseStream;
      return next();
    });
  }

  initRoutes(controllers) {
    controllers.forEach((controller) => {
      this.app.use(controller.path, controller.router);
    });
  }

  listen() {
    this.server.listen(this.port, () => console.log(`Server started on port: ${this.port}`));
  }

  async onClientConnected(client) {
    console.log('new socket connection', client.id);

    const exchangeStream = this.betfair.createExchangeStream(client, this.betfair.sessionKey);

    client.on('market-subscription', async ({ marketId }) => {
      console.log(`Subscribing to market ${marketId}, Session: ${this.betfair.sessionKey}`);
      exchangeStream.makeMarketSubscription(this.betfair.sessionKey, marketId);
    });

    client.on('market-resubscription', async ({ initialClk, clk, marketId }) => {
      console.log(`Resubscribing to market ${marketId}, Session: ${this.betfair.sessionKey}`);
      exchangeStream.makeMarketSubscription(this.betfair.sessionKey, marketId, initialClk, clk);
    });

    client.on('disconnect', () => {
      exchangeStream.unsubscribe();
      console.log('socket disconnected', client.id);
    });
  }
}

export default App;