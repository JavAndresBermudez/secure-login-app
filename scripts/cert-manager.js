const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

class CertificateManager {
  constructor() {
    this.certsDir = path.join(__dirname, '../certs');
    this.certPath = path.join(this.certsDir, 'server.crt');
    this.keyPath = path.join(this.certsDir, 'server.key');
  }

  generateCertificates() {
    // Crear directorio si no existe
    if (!fs.existsSync(this.certsDir)) {
      fs.mkdirSync(this.certsDir, { recursive: true });
    }

    // Generar certificado y llave privada
    const command = `openssl req -x509 -newkey rsa:4096 \
      -keyout "${this.keyPath}" \
      -out "${this.certPath}" \
      -days 365 \
      -nodes \
      -subj "/C=ES/ST=Madrid/L=Madrid/O=Development/CN=localhost" \
      -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"`;

    try {
      execSync(command);
      console.log('✅ Certificados generados exitosamente');
      this.generateHashes();
    } catch (error) {
      console.error('❌ Error generando certificados:', error.message);
    }
  }

  generateHashes() {
    try {
      const cert = fs.readFileSync(this.certPath);
      
      // Generar diferentes hashes
      const hashes = {
        sha256: crypto.createHash('sha256').update(cert).digest('base64'),
        sha384: crypto.createHash('sha384').update(cert).digest('base64'),
        sha512: crypto.createHash('sha512').update(cert).digest('base64')
      };

      // Guardar hashes en un archivo
      const hashesPath = path.join(this.certsDir, 'cert-hashes.json');
      fs.writeFileSync(hashesPath, JSON.stringify(hashes, null, 2));

      console.log('\nHashes del certificado generados:');
      console.log('--------------------------------');
      Object.entries(hashes).forEach(([algorithm, hash]) => {
        console.log(`${algorithm}:`);
        console.log(hash);
        console.log('--------------------------------');
      });

      // Generar timestamp
      const timestamp = fs.statSync(this.certPath).mtime.getTime();
      console.log('Timestamp del certificado:', timestamp);
      
    } catch (error) {
      console.error('❌ Error generando hashes:', error.message);
    }
  }

  verifyCertificate() {
    try {
      // Verificar validez del certificado
      const command = `openssl x509 -in "${this.certPath}" -text -noout`;
      const result = execSync(command).toString();
      console.log('✅ Certificado válido');
      console.log('\nDetalles del certificado:');
      console.log(result);
    } catch (error) {
      console.error('❌ Error verificando certificado:', error.message);
    }
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const manager = new CertificateManager();
  const args = process.argv.slice(2);
  
  switch (args[0]) {
    case 'generate':
      manager.generateCertificates();
      break;
    case 'verify':
      manager.verifyCertificate();
      break;
    case 'hashes':
      manager.generateHashes();
      break;
    default:
      console.log(`
Uso: node cert-manager.js [comando]

Comandos disponibles:
  generate    Genera nuevos certificados y sus hashes
  verify      Verifica el certificado actual
  hashes      Regenera los hashes del certificado actual
`);
  }
}

module.exports = CertificateManager;
