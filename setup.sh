echo "Los archivos .env existen para proteger la informacion sencible, pero por ahora crearemos uno dado que es una prueba..."
echo "Creando el archivo .env..."
cat <<EOL > .env
DATABASE_URL="mongodb://guybrush:iwannabeapirate@mongodb:27017/glue?authSource=admin&directConnection=true"
EOL

echo "Instalando dependencias de Node.js..."
npm install

echo "Levantando servicios de Docker..."
docker-compose up -d

echo "¡El proyecto se ha instalado y los servicios de Docker están en ejecución!"