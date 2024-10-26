echo "Instalando dependencias de Node.js..."
npm install

echo "Levantando servicios de Docker..."
docker-compose up -d

echo "¡El proyecto se ha instalado y los servicios de Docker están en ejecución!"