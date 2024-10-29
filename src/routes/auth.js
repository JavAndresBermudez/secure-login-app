const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Ruta de inicialización de seguridad
router.get('/init-verification', (req, res) => {
  try {
    // Obtener información del certificado
    const certInfo = {
      publicKey: process.env.CERT_PUBLIC_KEY || 'test-key',
      timestamp: Date.now()
    };
    res.json(certInfo);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al inicializar la seguridad'
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Usuario y contraseña son requeridos'
      });
    }

    // En este ejemplo usamos credenciales de prueba
    if (username === 'admin' && password === 'admin123') {
      return res.json({
        success: true,
        message: 'Login exitoso'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Credenciales inválidas'
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;
