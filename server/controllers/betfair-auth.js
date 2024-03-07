/* eslint-disable class-methods-use-this */
const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../sqlite/database');


class BetFairAuthenticationController {
  constructor() {
    this.path = '/api';
    this.router = express.Router();

    // Bind all methods to ensure 'this' context
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.clearSession = this.clearSession.bind(this);
    this.keepAlive = this.keepAlive.bind(this);
    this.registrationStatus = this.registrationStatus.bind(this);
    this.authenticate = this.authenticate.bind(this);

    this.initRoutes();
  }

  initRoutes() {
    this.router.post('/login', this.login);
    this.router.get('/logout', this.logout);
    this.router.get('/registration-status', this.registrationStatus);
    this.router.get('/authenticate-user', this.authenticate);
    this.router.get('/keep-alive', this.keepAlive);
  }

  login(req, res) {
    const { user, password } = req.body;
    // Assuming req.betfair.login is implemented elsewhere
    req.betfair.login(user, password)
      .then(async ({ sessionKey }) => {
        res.cookie('sessionKey', sessionKey);
        res.cookie('username', user);
        res.status(200).json({ sessionKey });
      })
      .catch((error) => res.status(401).json({ error }));
  }

  async logout(req, res) {
    try {
      await req.betfair.logout();
      this.clearSession(res);
      // Assuming req.betfair.reset is implemented elsewhere
      req.betfair.reset();

      if (req.sseStream) {
        req.sseStream.write({
          event: 'close-tabs',
          data: new Date().toTimeString(),
        });
      }
      return res.sendStatus(200);
    } catch (error) {
      return res.sendStatus(400).json({ error });
    }
  }

  clearSession(res) {
    res.clearCookie('token');
    res.clearCookie('sessionKey');
    res.clearCookie('accessToken');
    res.clearCookie('username');
  }

  keepAlive(req, res) {
    // Assuming req.betfair.keepAlive is implemented elsewhere
    req.betfair.keepAlive()
      .then(async (result) => {
        return res.json(result);
      })
      .catch((error) => {
        return res.json({ error });
      });
  }

  registrationStatus(req, res) {
    const userId = req.query.user_id;
    const query = 'SELECT * FROM users WHERE id = ?';

    db.get(query, [userId], (err, row) => {
      if (err) {
        res.status(500).json({ error: "Database error" });
        return; // Explicitly return after sending the response
      }
      
      if (row) {
        res.json({ status: "registered", user: row });
      } else {
        res.json({ status: "not registered" });
      }
       // Explicitly return even though it's not strictly necessary for functionality
    });
    
  }

  authenticate(req, res) {
    const { username, password } = req.body;
    const query = 'SELECT * FROM users WHERE username = ?';

    db.get(query, [username], (err, user) => {
      if (err) {
        res.status(500).json({ error: "Database error" });
        return undefined; // Explicitly return undefined after sending the response
      }
    
      if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return undefined; // Explicitly return undefined after sending the response
      }
    
      bcrypt.compare(password, user.passwordHash, (error, result) => {
        if (result) {
          res.json({ success: true, message: "Authentication successful" });
        } else {
          res.status(401).json({ success: false, message: "Authentication failed" });
        }
        return undefined; // Explicitly return undefined after sending the response
      });
    
      // Since bcrypt.compare is asynchronous, you cannot return from here for it.
      // So this return is outside the bcrypt callback.
      return undefined;
  
    });
  }
}

module.exports = BetFairAuthenticationController;
