class SecureClient {
  constructor() {
    this.certInfo = null;
  }

  async initializeSecurity() {
    try {
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
    } catch (error) {
      console.error('Error initializing security:', error);
      throw error;
    }
  }

  async makeSecureRequest(method, path, body = null) {
    if (!this.certInfo) {
      await this.initializeSecurity();
    }

    const headers = {
      'Content-Type': 'application/json',
      'X-Cert-Fingerprint': `sha256:${this.certInfo.publicKey}`,
      'X-Cert-Timestamp': this.certInfo.timestamp
    };

    try {
      const response = await fetch(path, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null,
        cache: 'no-store'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error en la solicitud');
      }

      return response.json();
    } catch (error) {
      console.error('Error en la solicitud:', error);
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
      password
    });
    
    if (data.success) {
      // Guardar el nombre de usuario para la página de éxito
      sessionStorage.setItem('username', username);
      
      messageDiv.textContent = '¡Login exitoso! Redirigiendo...';
      messageDiv.className = 'message success';
      
      // Redireccionar a la página de éxito
      setTimeout(() => {
        window.location.href = '/success.html';
      }, 1000);
    } else {
      messageDiv.textContent = data.message || 'Error de autenticación';
      messageDiv.className = 'message error';
    }
  } catch (error) {
    messageDiv.textContent = error.message || 'Error de autenticación';
    messageDiv.className = 'message error';
    console.error('Error:', error);
  }
});
