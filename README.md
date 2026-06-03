# TemplateHub CM

Marketplace de modèles de sites web modernes pour le Cameroun et l'Afrique.

## Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS 4** + shadcn/ui
- **PostgreSQL** + Prisma
- **Auth.js** (NextAuth v5)
- **Paystack** (carte, Mobile Money)
- **Cloudinary** (uploads)
- **Resend** (emails)

## Démarrage

```bash
# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env
# Éditer DATABASE_URL et AUTH_SECRET

# Base de données
npm run db:push
npm run db:seed

# Lancer le dev server
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## Comptes de test (après seed)

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@templatehub.cm | Password123! |
| Vendeur | seller1@templatehub.cm | Password123! |
| Acheteur | buyer@templatehub.cm | Password123! |

## Déploiement (Vercel + Neon)

1. Créer une base PostgreSQL sur [Neon](https://neon.tech)
2. Déployer sur [Vercel](https://vercel.com) en connectant le repo
3. Variables d'environnement : copier depuis `.env.example`
4. `DATABASE_URL` → connection string Neon
5. `AUTH_SECRET` → `openssl rand -base64 32`
6. Configurer Paystack, Cloudinary, Resend en production

## Structure

- `app/(marketing)/` — pages publiques (homepage, templates)
- `app/(auth)/` — login, register
- `app/(dashboard)/` — dashboard, seller, admin
- `app/checkout/` — paiement Paystack
- `prisma/` — schéma et seed

## Checklist tests manuels

- [ ] Inscription + vérification email
- [ ] Login admin / vendeur / acheteur
- [ ] Parcourir templates + filtres
- [ ] Upload template (vendeur) → approve (admin)
- [ ] Achat test (Paystack test mode)
- [ ] Téléchargement après achat
