class SecureClient {
  constructor() {
    this.certInfo = null;
    this.securityToken = null;
    this.challengeKey = null;
  }

  async generateSecureHash(data) {
    const encoder = new TextEncoder();
    const buffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  async initializeSecurity() {
    try {
      // Generar challenge key local
      this.challengeKey = crypto.getRandomValues(new Uint8Array(32))
        .reduce((acc, val) => acc + val.toString(16).padStart(2, '0'), '');

      const response = await fetch('/api/init-security', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Challenge': this.challengeKey
        },
        body: JSON.stringify({
          timestamp: Date.now(),
          userAgent: navigator.userAgent
        })
      });

      if (!response.ok) throw new Error('Security initialization failed');

      const { certFingerprint, serverChallenge, token } = await response.json();
      
      // Verificar y almacenar información de seguridad
      this.certInfo = {
        fingerprint: certFingerprint,
        challenge: serverChallenge,
        timestamp: Date.now()
      };
      
      // Almacenar token de seguridad
      this.securityToken = token;

      return true;
    } catch (error) {
      console.error('Security initialization failed:', error);
      return false;
    }
  }

  async makeSecureRequest(method, path, body = null) {
    if (!this.certInfo || !this.securityToken) {
      const initialized = await this.initializeSecurity();
      if (!initialized) throw new Error('Security initialization failed');
    }

    try {
      // Generar firma de solicitud
      const requestData = method + path + (body ? JSON.stringify(body) : '');
      const requestHash = await this.generateSecureHash(requestData + this.challengeKey);

      const headers = {
        'Content-Type': 'application/json',
        'X-Cert-Fingerprint': this.certInfo.fingerprint,
        'X-Security-Token': this.securityToken,
        'X-Request-Hash': requestHash,
        'X-Timestamp': this.certInfo.timestamp.toString()
      };

      const response = await fetch(path, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null,
        cache: 'no-store'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Request failed');
      }

      // Verificar la respuesta del servidor
      const serverHash = response.headers.get('X-Response-Hash');
      const responseData = await response.text();
      const expectedHash = await this.generateSecureHash(responseData + this.certInfo.challenge);

      if (serverHash !== expectedHash) {
        throw new Error('Response validation failed');
      }

      return JSON.parse(responseData);
    } catch (error) {
      console.error('Secure request failed:', error);
      throw error;
    }
  }
}

// Inicializar el cliente seguro
const secureClient = new SecureClient();

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const messageDiv = document.getElementById('message');
  
  try {
    messageDiv.textContent = 'Verificando...';
    messageDiv.className = 'message';

    const data = await secureClient.makeSecureRequest('POST', '/api/login', {
      username,
      password: await secureClient.generateSecureHash(password)
    });
    
    if (data.success) {
      sessionStorage.setItem('username', username);
      sessionStorage.setItem('authToken', data.token);
      
      messageDiv.textContent = '¡Login exitoso! Redirigiendo...';
      messageDiv.className = 'message success';
      
      setTimeout(() => {
        window.location.href = '/success.html';
      }, 1000);
    } else {
      throw new Error(data.message || 'Authentication failed');
    }
  } catch (error) {
    messageDiv.textContent = error.message || 'Error de autenticación';
    messageDiv.className = 'message error';
    console.error('Error:', error);
  }
});
