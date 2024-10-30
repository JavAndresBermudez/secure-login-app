const express = require('express');
const router = express.Router();

router.post('/login', (req, res) => {
    console.log('Solicitud de login recibida:', req.body); // Log para depuración

    const { username, password } = req.body;

    // Validar que se reciban los datos
    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'Usuario y contraseña son requeridos'
        });
    }

    // Verificar credenciales
    if (username === 'admin' && password === 'admin123') {
        return res.json({
            success: true,
            message: 'Login exitoso'
        });
    }

    // Si las credenciales son incorrectas
    return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
    });
});

module.exports = router;
