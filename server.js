const express = require('express');
const https = require('https');
const path = require('path');
const securityConfig = require('./src/config/security');
const authRoutes = require('./src/routes/auth');
const sslPinning = require('./src/middleware/sslPinning');

const app = express();

// Middleware de seguridad
app.use((req, res, next) => {
  // Agregar headers de seguridad
  Object.entries(securityConfig.getSecurityHeaders()).forEach(([header, value]) => {
    res.setHeader(header, value);
  });
  next();
});

app.use(express.json({
  limit: '10kb' // Limitar tamaño de payload
}));

app.use(express.static(path.join(__dirname, 'src/public'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
    }
  }
}));

// Aplicar SSL Pinning
app.use(sslPinning);

// Rutas
app.use('/api', authRoutes);

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: 'Error interno del servidor'
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
const server = https.createServer(securityConfig.getSSLOptions(), app);

server.listen(PORT, () => {
  console.log(`Servidor seguro corriendo en https://localhost:${PORT}`);
});

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Servidor terminado gracefully');
    process.exit(0);
  });
});
