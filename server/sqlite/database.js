// Ensure your package.json includes "type": "module" to use this import syntax
import sqliteAsync from 'sqlite-async';

let Database;

async function loadDatabase() {
  if (!Database) {
    const module = await sqliteAsync;
    Database = module.default;
  }
  return Database;
}

class SQLiteDatabase {
  constructor() {
    this.db = null;
  }

  async setup() {
    const loadedDatabase = await loadDatabase();
    this.db = await loadedDatabase.open(':memory:');
    await this.db.run(`
      CREATE TABLE IF NOT EXISTS bets (
        strategy TEXT,
        selectionId TEXT,
        marketId TEXT,
        size INT,
        price TEXT,
        side TEXT,
        betId TEXT,
        rfs TEXT,
        trailing BOOLEAN,
        hedged BOOLEAN,
        assignedIsOrderMatched BOOLEAN,
        tickOffset INT,
        custom BOOLEAN,
        units TEXT,
        ticks INT,
        percentageTrigger INT,
        executionTime TEXT,
        timeOffset INT,
        seconds INT,
        startTime INT,
        targetLTP INT,
        stopEntryCondition TEXT
      )`);
  }

  async addBet(bet) {
    const {
      strategy, selectionId, marketId, size, price, side, betId, rfs, trailing, hedged,
      assignedIsOrderMatched, tickOffset, custom, units, ticks, percentageTrigger,
      executionTime, timeOffset, seconds, startTime, targetLTP, stopEntryCondition,
    } = bet;

    const stmt = await this.db.prepare(`
      INSERT INTO bets VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )`);
    await stmt.run(
      strategy, selectionId, marketId, size, price, side, betId, rfs, trailing, hedged,
      assignedIsOrderMatched, tickOffset, custom, units, ticks, percentageTrigger,
      executionTime, timeOffset, seconds, startTime, targetLTP, stopEntryCondition
    );
    await stmt.finalize();
  }

  // Rest of the methods remain unchanged...

  async close() {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }
}

module.exports = SQLiteDatabase;
