require('dotenv').config();
require('./db'); // Initialize SQLite DB and create tables on first run
const express = require('express');
const path = require('path');
const cors = require('cors');
const routes = require('./routes');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'fb-insight-agent' });
});

// API Routes
app.use('/api', routes);

// Production: serve React build from client/dist
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));

  // SPA catch-all: Express 5 wildcard syntax (app.get('*') throws in Express 5)
  app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Agent backend listening on http://localhost:${port}`);
  console.log('Available routes: GET /health, POST /api/ai/chat, GET /api/facebook/page/:id');
});
