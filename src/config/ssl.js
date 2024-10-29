const fs = require('fs');
const path = require('path');

const sslConfig = {
  key: fs.readFileSync(path.join(__dirname, '../../certs/server.key')),
  cert: fs.readFileSync(path.join(__dirname, '../../certs/server.crt')),
  rejectUnauthorized: false // Solo para desarrollo
};

module.exports = sslConfig;
