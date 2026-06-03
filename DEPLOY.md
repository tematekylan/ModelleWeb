# Déploiement production — TemplateHub CM

## 1. GitHub

```bash
# Dans le dossier du projet
git add .
git commit -m "TemplateHub CM MVP — production ready"
git branch -M main
git remote add origin https://github.com/VOTRE-USERNAME/template-hub-cm.git
git push -u origin main
```

Créez d'abord le repo vide sur [github.com/new](https://github.com/new) (sans README).

## 2. Vercel

1. Allez sur [vercel.com/new](https://vercel.com/new)
2. **Import** votre repo GitHub `template-hub-cm`
3. Framework : **Next.js** (détecté automatiquement)
4. Build Command : `npm run build` (défaut)
5. Ajoutez les **variables d'environnement** ci-dessous
6. Cliquez **Deploy**

## 3. Variables d'environnement Vercel

| Variable | Valeur |
|----------|--------|
| `DATABASE_URL` | Connection string Neon (déjà dans votre `.env` local) |
| `AUTH_SECRET` | Nouvelle clé : `openssl rand -base64 32` |
| `AUTH_URL` | `https://votre-projet.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | `https://votre-projet.vercel.app` |
| `PAYSTACK_SECRET_KEY` | `sk_live_...` (clés **Live** Paystack) |
| `PAYSTACK_PUBLIC_KEY` | `pk_live_...` |
| `PAYSTACK_CURRENCY` | `NGN` |
| `PAYSTACK_USD_TO_NGN` | `1600` |
| `CLOUDINARY_CLOUD_NAME` | Votre cloud name |
| `CLOUDINARY_API_KEY` | |
| `CLOUDINARY_API_SECRET` | |
| `RESEND_API_KEY` | |
| `RESEND_FROM_EMAIL` | Email avec domaine vérifié |
| `COMMISSION_RATE` | `0.25` |

> **Important** : ne copiez jamais votre `.env` local tel quel — régénérez `AUTH_SECRET` pour la production.

## 4. Paystack (production)

1. [Paystack Dashboard](https://dashboard.paystack.com) → **Settings → API Keys** → activer **Live mode**
2. **Webhooks** → URL : `https://votre-projet.vercel.app/api/webhooks/paystack`
3. Événement : `charge.success`

## 5. Neon (base de données)

La base est déjà configurée si `db:push` et `db:seed` ont été exécutés.
Pour la prod, utilisez la même `DATABASE_URL` ou une branche Neon dédiée.

## 6. Après le déploiement

- [ ] Site accessible sur l'URL Vercel
- [ ] Login avec `admin@templatehub.cm` / `Password123!`
- [ ] Liste templates visible
- [ ] Test paiement Paystack Live (petit montant)
- [ ] Webhook Paystack reçu (logs Vercel → Functions)

## Domaine personnalisé (optionnel)

Vercel → Project → **Settings → Domains** → ajouter `templatehub.cm` ou autre.
