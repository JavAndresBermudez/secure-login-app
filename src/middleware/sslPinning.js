const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class SecurityMiddleware {
  constructor() {
    const certPath = path.join(__dirname, '../../certs/server.crt');
    const cert = fs.readFileSync(certPath);
    
    // Generar múltiples hashes del certificado
    this.certHashes = {
      sha256: crypto.createHash('sha256').update(cert).digest('base64'),
      sha384: crypto.createHash('sha384').update(cert).digest('base64'),
      sha512: crypto.createHash('sha512').update(cert).digest('base64')
    };

    // Almacenar timestamp del certificado
    this.certTimestamp = fs.statSync(certPath).mtime.getTime();
    
    // Almacenar challenges activos
    this.activeSecurityTokens = new Map();
  }

  generateSecurityToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  validateRequest(req) {
    const clientFingerprint = req.get('X-Cert-Fingerprint');
    const securityToken = req.get('X-Security-Token');
    const requestHash = req.get('X-Request-Hash');
    const timestamp = req.get('X-Timestamp');

    if (!clientFingerprint || !securityToken || !requestHash || !timestamp) {
      return false;
    }

    // Verificar token de seguridad
    const tokenData = this.activeSecurityTokens.get(securityToken);
    if (!tokenData) return false;

    // Verificar timestamp
    const timeDiff = Math.abs(Date.now() - parseInt(timestamp));
    if (timeDiff > 30000) return false; // 30 segundos máximo

    // Verificar fingerprint
    if (clientFingerprint !== this.certHashes.sha256) return false;

    // Verificar hash de la solicitud
    const requestData = req.method + req.path + 
      (req.body ? JSON.stringify(req.body) : '');
    const expectedHash = crypto
      .createHash('sha256')
      .update(requestData + tokenData.challenge)
      .digest('hex');

    return requestHash === expectedHash;
  }

  middleware() {
    return (req, res, next) => {
      // Permitir la ruta de inicialización de seguridad
      if (req.path === '/api/init-security') {
        const clientChallenge = req.get('X-Challenge');
        if (!clientChallenge) {
          return res.status(403).json({ error: 'Missing security challenge' });
        }

        const token = this.generateSecurityToken();
        const serverChallenge = crypto.randomBytes(32).toString('hex');
        
        this.activeSecurityTokens.set(token, {
          challenge: clientChallenge,
          serverChallenge,
          timestamp: Date.now()
        });

        // Limpiar tokens antiguos
        this.cleanupTokens();

        return res.json({
          certFingerprint: this.certHashes.sha256,
          serverChallenge,
          token
        });
      }

      // Validar todas las demás solicitudes
      if (!this.validateRequest(req)) {
        return res.status(403).json({ error: 'Invalid security verification' });
      }

      // Añadir hash de respuesta
      const oldSend = res.send;
      res.send = function(data) {
        const responseHash = crypto
          .createHash('sha256')
          .update(data + this.activeSecurityTokens.get(req.get('X-Security-Token')).serverChallenge)
          .digest('hex');
        
        res.setHeader('X-Response-Hash', responseHash);
        return oldSend.apply(res, arguments);
      };

      next();
    };
  }

  cleanupTokens() {
    const now = Date.now();
    for (const [token, data] of this.activeSecurityTokens.entries()) {
      if (now - data.timestamp > 300000) { // 5 minutos
        this.activeSecurityTokens.delete(token);
      }
    }
  }
}

module.exports = new SecurityMiddleware().middleware();
