#!/bin/bash

echo "Instalando dependencias..."
npm install

echo -e "\nGenerando certificados..."
npm run cert:generate

echo -e "\nVerificando certificados..."
npm run cert:verify

echo -e "\nInstalación completada!"
