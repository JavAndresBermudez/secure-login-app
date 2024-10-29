# Secure Login App con SSL Pinning

Una aplicación de login segura que implementa SSL Pinning con certificados autofirmados.

## Requisitos Previos

- Node.js >= 12.0.0
- OpenSSL instalado y accesible desde la línea de comandos

## Instalación Rápida

### Windows
```bash
scripts\install.bat
```

### Linux/Mac
```bash
chmod +x scripts/install.sh
./scripts/install.sh
```

## Instalación Manual

1. Instalar dependencias:
```bash
npm install
```

2. Generar certificados:
```bash
npm run cert:generate
```

3. Verificar certificados:
```bash
npm run cert:verify
```

4. Iniciar el servidor:
```bash
npm start
```

## Gestión de Certificados

El proyecto incluye un script para gestionar los certificados:

- Generar nuevos certificados:
  ```bash
  npm run cert:generate
  ```

- Verificar certificados existentes:
  ```bash
  npm run cert:verify
  ```

- Regenerar hashes de certificados:
  ```bash
  npm run cert:hashes
  ```

## Estructura del Proyecto
```
secure-login-app/
├── certs/                    # Certificados SSL (generados)
│   ├── server.crt
│   ├── server.key
│   └── cert-hashes.json
├── scripts/
│   ├── cert-manager.js      # Gestor de certificados
│   ├── install.bat          # Script instalación Windows
│   └── install.sh           # Script instalación Unix
├── src/
│   ├── config/
│   │   ├── security.js
│   │   ├── ssl.js
│   │   └── database.js
│   ├── middleware/
│   │   └── sslPinning.js
│   ├── routes/
│   │   └── auth.js
│   └── public/
│       ├── index.html
│       ├── styles.css
│       └── client.js
├── server.js
├── package.json
└── README.md
```

## Notas de Seguridad

- Los certificados generados son autofirmados y solo para desarrollo
- Cada vez que se generan nuevos certificados, los hashes en el código deben actualizarse
- Para producción, usar certificados emitidos por una CA confiable

## Solución de Problemas

1. Si los certificados no se generan:
   - Verificar que OpenSSL esté instalado
   - Ejecutar `openssl version` para confirmar
   - Verificar permisos de escritura en el directorio `certs`

2. Si la aplicación no inicia:
   - Verificar que los certificados existan
   - Comprobar los hashes en el código coincidan con los generados
   - Verificar que el puerto 3000 esté disponible

## Licencia

MIT
