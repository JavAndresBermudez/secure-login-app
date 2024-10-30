const express = require('express');
const crypto = require('crypto');
const router = express.Router();

// Almacén de sesiones seguras (en producción usar Redis o similar)
const secureSessionStore = new Map();

router.post('/init-security', (req, res) => {
  // La validación se maneja en el middleware
  res.json({
    success: true,
    message: 'Security initialized'
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

    // Verificar credenciales (en este ejemplo son hardcoded)
    const expectedPasswordHash = crypto
      .createHash('sha256')
      .update('admin123')
      .digest('hex');

    if (username === 'admin' && password === expectedPasswordHash) {
      // Generar token de sesión
      const sessionToken = crypto.randomBytes(32).toString('hex');
      
      // Almacenar sesión
      secureSessionStore.set(sessionToken, {
        username,
        timestamp: Date.now()
      });

      return res.json({
        success: true,
        message: 'Login exitoso',
        token: sessionToken
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Credenciales inválidas'
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Limpiar sesiones antiguas periódicamente
setInterval(() => {
  const now = Date.now();
  for (const [token, session] of secureSessionStore.entries()) {
    if (now - session.timestamp > 3600000) { // 1 hora
      secureSessionStore.delete(token);
    }
  }
}, 300000); // Cada 5 minutos

module.exports = router;
