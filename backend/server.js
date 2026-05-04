/**
 * MODULE D — BACKEND API
 * Express server entry point.
 */

require('dotenv').config();
const express = require('express');
const blockchain = require('./blockchain/blockchainService');

const app = express();
app.use(express.json());

// Initialize blockchain connection
blockchain.init(
  process.env.RPC_URL,
  process.env.OWNER_PRIVATE_KEY,
  process.env.CONTRACT_ADDRESS
);

// Routes
app.use('/issuer', require('./routes/issuer'));
app.use('/credential', require('./routes/credential'));
app.use('/proof', require('./routes/proof'));

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
