#!/bin/bash
# Script de configuration automatique de la base de données locale

# 1. Reset de la base (Migrations + Public Seed)
echo "🔄 Réinitialisation de la base de données..."
npx supabase db reset

# 2. Création des utilisateurs via l'API Auth
# On récupère l'URL et la clé ANON depuis .env.local
ANON_KEY=$(grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env.local | cut -d '=' -f2)
API_URL="http://localhost:54321/auth/v1/signup"

echo "👤 Création du compte Admin..."
curl -X POST "$API_URL" \
-H "apikey: $ANON_KEY" \
-H "Content-Type: application/json" \
-d '{"email": "admin@tennis-club.fr", "password": "Admin123!", "data": {"full_name": "Admin Test", "role": "admin"}}' > /dev/null 2>&1

echo "👤 Création du compte Membre..."
curl -X POST "$API_URL" \
-H "apikey: $ANON_KEY" \
-H "Content-Type: application/json" \
-d '{"email": "membre@tennis-club.fr", "password": "Membre123!", "data": {"full_name": "Membre Test", "role": "membre"}}' > /dev/null 2>&1

echo "✅ Configuration terminée ! Tu peux maintenant te connecter."
