require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const path = require('path');
const express = require('express');
const app = require('./api/index');

app.use(express.static(path.join(__dirname, 'public')));

const DEFAULT_PORT = Number(process.env.PORT) || 3000;

function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`SmartTripPlanner widget server running at http://localhost:${port}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.warn(`Port ${port} is already in use. Trying ${port + 1} instead...`);
      server.close(() => startServer(port + 1));
      return;
    }

    console.error('Failed to start the server:', error);
    process.exit(1);
  });
}

startServer(DEFAULT_PORT);
