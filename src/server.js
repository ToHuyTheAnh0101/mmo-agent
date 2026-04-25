require('dotenv').config();
const express = require('express');
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

app.listen(port, () => {
  console.log(`Agent backend listening on http://localhost:${port}`);
  console.log('Available routes: GET /health, POST /api/ai/chat, GET /api/facebook/page/:id');
});
