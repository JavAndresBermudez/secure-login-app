const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const db = require('../config/database');

class SecurityProvider {
  constructor() {
    const certPath = path.join(__dirname, '../../certs/server.crt');
    const cert = fs.readFileSync(certPath);
    this.certTimestamp = fs.statSync(certPath).mtime.getTime();
    this.publicKey = crypto.createHash('sha256').update(cert).digest('base64');
  }

  generateToken(userId) {
    const payload = {
      userId,
      timestamp: Date.now(),
      nonce: crypto.randomBytes(16).toString('base64')
    };

    return crypto
      .createHmac('sha256', this.publicKey)
      .update(JSON.stringify(payload))
      .digest('base64');
  }
}

const security = new SecurityProvider();

// Ruta de inicialización de seguridad
router.get('/init-verification', (req, res) => {
  res.json({
    publicKey: security.publicKey,
    timestamp: security.certTimestamp
  });
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Credenciales incompletas'
      });
    }

    const user = db.findUser(username, password);

    if (user) {
      const token = security.generateToken(user.id);
      
      res.json({
        success: true,
        message: 'Login exitoso',
        token
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;
