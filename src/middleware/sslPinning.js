const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class SSLPinningMiddleware {
  constructor() {
    const certPath = path.join(__dirname, '../../certs/server.crt');
    const cert = fs.readFileSync(certPath);
    
    // Generar múltiples hashes del certificado usando diferentes algoritmos
    this.certHashes = {
      sha256: crypto.createHash('sha256').update(cert).digest('base64'),
      sha384: crypto.createHash('sha384').update(cert).digest('base64'),
      sha512: crypto.createHash('sha512').update(cert).digest('base64')
    };

    // Timestamp de la última actualización del certificado
    this.certTimestamp = fs.statSync(certPath).mtime.getTime();
  }

  verifyTimestamp(clientTimestamp) {
    return this.certTimestamp === parseInt(clientTimestamp);
  }

  verifySignature(payload, signature, timestamp) {
    const data = `${payload}:${timestamp}`;
    const expectedSignature = crypto
      .createHmac('sha256', this.certHashes.sha256)
      .update(data)
      .digest('base64');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  middleware() {
    return (req, res, next) => {
      // Excluir la ruta de verificación inicial
      if (req.path === '/api/init-verification') {
        return next();
      }

      try {
        const clientFingerprint = req.get('X-Cert-Fingerprint');
        const clientTimestamp = req.get('X-Cert-Timestamp');
        const clientSignature = req.get('X-Request-Signature');

        if (!clientFingerprint || !clientTimestamp || !clientSignature) {
          return res.status(403).json({
            error: 'Invalid security headers'
          });
        }

        // Verificar timestamp del certificado
        if (!this.verifyTimestamp(clientTimestamp)) {
          return res.status(403).json({
            error: 'Certificate timestamp mismatch'
          });
        }

        // Verificar múltiples hashes
        const [algorithm, hash] = clientFingerprint.split(':');
        if (this.certHashes[algorithm] !== hash) {
          return res.status(403).json({
            error: 'Certificate mismatch'
          });
        }

        // Verificar firma de la solicitud
        const payload = req.method + req.path + (req.body ? JSON.stringify(req.body) : '');
        if (!this.verifySignature(payload, clientSignature, clientTimestamp)) {
          return res.status(403).json({
            error: 'Invalid request signature'
          });
        }

        next();
      } catch (error) {
        res.status(403).json({
          error: 'SSL Pinning verification failed'
        });
      }
    };
  }
}

module.exports = new SSLPinningMiddleware().middleware();
