const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class SecurityConfig {
  constructor() {
    this.certPath = path.join(__dirname, '../../certs/server.crt');
    this.keyPath = path.join(__dirname, '../../certs/server.key');
    
    // Configuración de SSL
    this.sslOptions = {
      key: fs.readFileSync(this.keyPath),
      cert: fs.readFileSync(this.certPath),
      ciphers: [
        'ECDHE-ECDSA-AES256-GCM-SHA384',
        'ECDHE-RSA-AES256-GCM-SHA384',
        'ECDHE-ECDSA-CHACHA20-POLY1305',
        'ECDHE-RSA-CHACHA20-POLY1305'
      ].join(':'),
      honorCipherOrder: true,
      minVersion: 'TLSv1.3'
    };

    // Configuración adicional de seguridad
    this.securityHeaders = {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self';"
    };
  }

  getSecurityHeaders() {
    return this.securityHeaders;
  }

  getSSLOptions() {
    return this.sslOptions;
  }
}

module.exports = new SecurityConfig();
