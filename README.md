# Secure Login App con SSL Pinning

Una aplicación de login segura que implementa SSL Pinning con certificados autofirmados. La aplicación está diseñada para prevenir interceptación de tráfico incluso con herramientas como ZAP o Burp Suite.

## Características

- ✅ Formulario de login con validación
- 🔒 SSL Pinning robusto
- 📜 Certificados SSL autofirmados
- 🛡️ Protección contra interceptación
- 🎨 Interfaz de usuario responsive

## Requisitos Previos

- Node.js >= 12.0.0 ([Descargar Node.js](https://nodejs.org/))
- OpenSSL ([Guía de instalación](#instalación-de-openssl))
- Git ([Descargar Git](https://git-scm.com/downloads))

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/JavAndresBermudez/secure-login-app.git
cd secure-login-app
```

2. Instalación Automática:

   **Windows**:
   ```bash
   scripts\install.bat
   ```

   **Linux/Mac**:
   ```bash
   chmod +x scripts/install.sh
   ./scripts/install.sh
   ```

3. Iniciar la aplicación:
```bash
npm start
```

4. Acceder a la aplicación:
   - Abrir en el navegador: `https://localhost:3000`
   - Aceptar el certificado autofirmado en el navegador
   - **Credenciales de prueba**:
     - Usuario: `admin`
     - Contraseña: `admin123`

## Instalación Manual Paso a Paso

Si prefieres realizar la instalación manualmente:

1. Instalar dependencias:
```bash
npm install
```

2. Generar certificados SSL:
```bash
npm run cert:generate
```

3. Verificar los certificados:
```bash
npm run cert:verify
```

4. Iniciar el servidor:
```bash
npm start
```

## Instalación de OpenSSL

### Windows
1. Descargar el instalador de OpenSSL desde [este enlace](https://slproweb.com/products/Win32OpenSSL.html)
2. Ejecutar el instalador
3. Añadir OpenSSL a las variables de entorno PATH:
   - Buscar "Variables de entorno" en Windows
   - En Variables del Sistema, editar "Path"
   - Añadir la ruta de OpenSSL (típicamente `C:\Program Files\OpenSSL-Win64\bin`)

### Mac
```bash
brew install openssl
```

### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install openssl
```

## Estructura del Proyecto
```
secure-login-app/
├── certs/                    # Certificados SSL (generados)
├── scripts/                  # Scripts de instalación
├── src/
│   ├── config/              # Configuraciones
│   ├── middleware/          # Middleware SSL
│   ├── routes/              # Rutas de la API
│   └── public/              # Archivos frontend
├── server.js                # Servidor principal
└── package.json             # Dependencias
```

## Verificación de Seguridad

Para verificar que el SSL Pinning está funcionando:

1. Intenta interceptar el tráfico con Burp Suite o ZAP
2. La aplicación debería rechazar las conexiones interceptadas
3. Solo funcionará con el certificado original

## Solución de Problemas

### El certificado no se genera
- Verifica que OpenSSL esté instalado: `openssl version`
- Asegúrate de tener permisos de escritura en el directorio

### Error al iniciar la aplicación
1. Verifica que los certificados existan:
```bash
ls certs/
```

2. Regenera los certificados si es necesario:
```bash
npm run cert:generate
```

3. Verifica que el puerto 3000 esté disponible:
   - Windows: `netstat -ano | findstr :3000`
   - Linux/Mac: `lsof -i :3000`

### Error de conexión en el navegador
1. Asegúrate de usar `https://` no `http://`
2. Acepta el certificado autofirmado en el navegador
3. Verifica que no haya proxy configurado en el navegador

## Actualizaciones de Seguridad

Para actualizar los certificados:

1. Generar nuevos certificados:
```bash
npm run cert:generate
```

2. Reiniciar el servidor:
```bash
npm start
```

## Contribuir

1. Haz un Fork del proyecto
2. Crea una nueva rama (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -m 'Añade nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## Soporte

Si encuentras algún problema:

1. Revisa primero la sección de [Solución de Problemas](#solución-de-problemas)
2. Busca en los [Issues existentes](https://github.com/JavAndresBermudez/secure-login-app/issues)
3. Crea un nuevo Issue si el problema persiste

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.
