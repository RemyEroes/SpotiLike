FROM node:20-slim

WORKDIR /app

# OpenSSL requis pour Prisma
RUN apt-get update && apt-get install -y openssl \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .

# Génère le client Prisma POUR CET OS
RUN npx prisma generate

RUN npm run build

EXPOSE 3400
CMD ["npm", "run", "start"]
