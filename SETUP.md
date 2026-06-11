# Docta — Mise en route (développement local)

Monorepo npm : `apps/api` (NestJS + Prisma) et `apps/web` (React + Vite PWA).
Pré-requis : **Node 20+**, **PostgreSQL 16** (déjà installé sous `/Library/PostgreSQL/16`).

## 1. Installer les dépendances

```bash
npm install        # installe les deux apps (workspaces)
```

## 2. Créer la base de données

Avec le `psql` d'EnterpriseDB (adapter le mot de passe du rôle `postgres`) :

```bash
/Library/PostgreSQL/16/bin/createdb -h localhost -U postgres docta
# ou : /Library/PostgreSQL/16/bin/psql -h localhost -U postgres -c "CREATE DATABASE docta;"
```

## 3. Configurer l'API

```bash
cp apps/api/.env.example apps/api/.env
# éditer DATABASE_URL avec ton mot de passe postgres
```

`DATABASE_URL="postgresql://postgres:MOT_DE_PASSE@localhost:5432/docta?schema=public"`

## 4. Migrer + générer le client + seed

```bash
npm run prisma:migrate -w apps/api -- --name init
npm run prisma:generate -w apps/api
npm run seed -w apps/api
```

Le seed crée un établissement démo :
- établissement : `clinique-demo`
- login : `admin@docta.cd` / mot de passe `docta1234`
- taux du jour : 1 USD = 2800 CDF

## 5. Lancer

```bash
npm run dev:api    # http://localhost:3000  (API, préfixe /api)
npm run dev:web    # http://localhost:5173  (PWA, proxy /api -> 3000)
```

Santé de l'API : http://localhost:3000/api/health

## Principaux endpoints (socle)

| Méthode | Route | Rôle requis | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Crée un établissement + 1er admin |
| POST | `/api/auth/login` | — | Connexion (tenantSlug + email + mdp) |
| GET | `/api/auth/me` | connecté | Profil du token |
| GET | `/api/users` | ADMIN/HR | Utilisateurs du tenant |
| GET | `/api/currency/rate` | connecté | Taux du jour |
| POST | `/api/currency/rate` | ADMIN/CASHIER | Définir taux CDF/USD |
| GET | `/api/currency/convert?amount=10&from=USD` | connecté | Conversion CDF↔USD |

## Déploiement Render

Le fichier [`render.yaml`](render.yaml) décrit le déploiement (1 Postgres + API + site statique).
Sur Render : **New → Blueprint**, pointer sur le repo `Jeffbuleli/DOCTA`.
