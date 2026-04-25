'use strict';

const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

// Auto-create data/ directory if it doesn't exist
const dataDir = path.join(__dirname, '..', 'data');
fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'chat.db');
const db = new Database(dbPath);

// WAL mode: better concurrent read performance for web apps
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// INFRA-02: sessions table — used by Phase 2 (SESS-01..05)
db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL DEFAULT 'New Chat',
    created_at TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
  )
`);

// INFRA-02: messages table — used by Phase 3 (CHAT-01..04)
db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    role       TEXT    NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
    content    TEXT    NOT NULL,
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
  )
`);

// INFRA-02: config table — used by Phase 4 (CFG-01..05)
db.exec(`
  CREATE TABLE IF NOT EXISTS config (
    key        TEXT PRIMARY KEY,
    value      TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

module.exports = db;
