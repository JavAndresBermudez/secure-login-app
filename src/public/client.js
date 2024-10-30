document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const messageDiv = document.getElementById('message');
  
  try {
    messageDiv.textContent = 'Verificando...';
    messageDiv.className = 'message';

    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    
    if (data.success) {
      // Guardar el nombre de usuario
      sessionStorage.setItem('username', username);
      
      messageDiv.textContent = '¡Login exitoso! Redirigiendo...';
      messageDiv.className = 'message success';
      
      // Redireccionar a la página de éxito
      setTimeout(() => {
        window.location.href = '/success.html';
      }, 1000);
    } else {
      messageDiv.textContent = data.message || 'Credenciales inválidas';
      messageDiv.className = 'message error';
    }
  } catch (error) {
    messageDiv.textContent = 'Error de autenticación';
    messageDiv.className = 'message error';
    console.error('Error:', error);
  }
});
