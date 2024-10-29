class SecureClient {
  constructor() {
    this.certInfo = null;
    this.securityToken = null;
  }

  async initializeSecurity() {
    const response = await fetch('/api/init-verification', {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to initialize security');
    }

    const { publicKey, timestamp } = await response.json();
    this.certInfo = { publicKey, timestamp };
  }

  generateRequestSignature(method, path, body) {
    const payload = method + path + (body ? JSON.stringify(body) : '');
    const encoder = new TextEncoder();
    const data = encoder.encode(payload + ':' + this.certInfo.timestamp);
    
    return crypto.subtle.importKey(
      'raw',
      encoder.encode(this.certInfo.publicKey),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    ).then(key => {
      return crypto.subtle.sign(
        'HMAC',
        key,
        data
      );
    }).then(signature => {
      return btoa(String.fromCharCode(...new Uint8Array(signature)));
    });
  }

  async makeSecureRequest(method, path, body = null) {
    if (!this.certInfo) {
      await this.initializeSecurity();
    }

    const signature = await this.generateRequestSignature(method, path, body);
    
    const headers = {
      'Content-Type': 'application/json',
      'X-Cert-Fingerprint': `sha256:${this.certInfo.publicKey}`,
      'X-Cert-Timestamp': this.certInfo.timestamp,
      'X-Request-Signature': signature
    };

    const response = await fetch(path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`);
    }

    return response.json();
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
    messageDiv.className = 'message';
    messageDiv.textContent = 'Verificando...';

    const data = await secureClient.makeSecureRequest('/api/login', 'POST', {
      username,
      password
    });
    
    if (data.success) {
      messageDiv.textContent = '¡Login exitoso!';
      messageDiv.className = 'message success';
      
      // Almacenar token de forma segura
      const encoder = new TextEncoder();
      const tokenBuffer = await crypto.subtle.digest(
        'SHA-256',
        encoder.encode(data.token)
      );
      const tokenHash = btoa(String.fromCharCode(...new Uint8Array(tokenBuffer)));
      
      sessionStorage.setItem('auth_token', tokenHash);
      
      setTimeout(() => {
        window.location.href = '/success.html';
      }, 1500);
    }
  } catch (error) {
    messageDiv.textContent = 'Error de autenticación';
    messageDiv.className = 'message error';
    console.error('Error:', error);
  }
});
