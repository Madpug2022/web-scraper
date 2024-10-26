# Dockerfile

FROM node:22

WORKDIR /usr/src/app

COPY package*.json ./
COPY .env ./
RUN npm install

COPY . .

EXPOSE 3000

CMD [ "npm", "run", "start" ]