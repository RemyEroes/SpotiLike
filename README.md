# SPOTILIKE

> Spotilike est une app web qui s'inspire de Spotify avec une experience utilisateur plus originale. Vous pouvez naviger entre les artistes et les albums. Un player est disponible mais n'émet pas de musique pour des raisons légales.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Statut](https://img.shields.io/badge/statut-en%20ligne-green)

---

## Sommaire

- [\[SPOTILIKE\]](#spotilike)
  - [Sommaire](#sommaire)
  - [Présentation](#présentation)
  - [Prérequis](#prérequis)
  - [Installation](#installation)
  - [Lancement](#lancement)
  - [Variables d'environnement](#variables-denvironnement)
  - [Tests](#tests)
  - [Structure du projet](#structure-du-projet)
  - [Équipe](#équipe)
  - [Licence](#licence)

---

## Présentation

Spotilike est une app web qui s'inspire de Spotify avec une experience utilisateur plus originale. Vous pouvez naviger entre les artistes et les albums. Un player est disponible mais n'émet pas de musique pour des raisons légales.

**Fonctionnalités principales :**

- Roue des artistes
- Roue des albums
- Page détail d'un artiste avec ses albums
- Page détail d'un album
- Player

---

## Prérequis

Avant de commencer, assure-toi d'avoir une base mariadb disponible et de créer la base SPOTILIKE avec le fichier .sql dans /backend/sql.
Également, créer ces fichiers .env:
- à la racine du projet:
```env
  APP_PORT=XXX
```
- dans le dossier frontend:
```env
  VITE_API_URL=http://localhost:3400
```
- dans le dossier backend (utilisez le .env.template):
```env
 # MySQL Database Configuration
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=
DATABASE_URL=

IS_SERVER=false

# JWT Configuration
JWT_SECRET=jwt_secret

# Server Configuration
PORT=3400
```

---

## Installation

```bash
# 1. Cloner le dépôt
git clone https://github.com/RemyEroes/SpotiLike.git
cd spotilike

# 2. Installer les dépendances back
cd /backend
npm i

# 3. Installer les dépendances front
cd ../frontend
npm i

```

---

## Lancement via docker

Pensez à démarrer votre deamon docker.

```bash
docker-compose up --build
```

---

## Structure du projet

```
spotilike/
├── frontend/        
├── backend/        
├── .github/        
├── .env
├── docker-compose.yml 
└── README.md
```

---

## Équipe

| Nom | Rôle |
|---|---|
| Rémy EROES | frontend |
| Matthieu Lopes | backend |

---

*Dernière mise à jour : 18 mars 2026*
