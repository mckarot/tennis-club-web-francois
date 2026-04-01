#!/bin/bash
# =====================================================
# TEST DE CONNEXION AUTH - Tennis Club du François
# =====================================================
# Ce script teste directement l'API Supabase Auth
# pour isoler le problème d'authentification
# =====================================================

set -e

# Configuration
SUPABASE_URL="http://localhost:54321"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"

# Couleurs pour la sortie
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=== TEST DE CONNEXION AUTH SUPABASE ==="
echo ""

# =====================================================
# TEST 1 : Vérifier que Supabase est accessible
# =====================================================
echo "--- TEST 1 : Connectivité Supabase ---"

if curl -s -o /dev/null -w "%{http_code}" "$SUPABASE_URL" | grep -q "200\|400"; then
    echo -e "${GREEN}✓ Supabase est accessible${NC}"
else
    echo -e "${RED}❌ Supabase est inaccessible${NC}"
    echo "Vérifie que Supabase Local tourne : npx supabase status"
    exit 1
fi

echo ""

# =====================================================
# TEST 2 : Tester la connexion avec l'API Auth
# =====================================================
echo "--- TEST 2 : Connexion API Auth ---"

# Fonction pour tester la connexion
test_login() {
    local email=$1
    local password=$2
    local expected_role=$3
    
    echo "Test: $email (role attendu: $expected_role)"
    
    response=$(curl -s -X POST "$SUPABASE_URL/auth/v1/token?grant_type=password" \
        -H "apikey: $SUPABASE_ANON_KEY" \
        -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"$email\",
            \"password\": \"$password\"
        }")
    
    # Vérifier si la réponse contient une erreur
    if echo "$response" | grep -q "error"; then
        error_msg=$(echo "$response" | grep -o '"error_description":"[^"]*"' | cut -d'"' -f4)
        echo -e "${RED}❌ Échec: $error_msg${NC}"
        return 1
    fi
    
    # Extraire les informations
    user_id=$(echo "$response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    user_email=$(echo "$response" | grep -o '"email":"[^"]*"' | head -1 | cut -d'"' -f4)
    access_token=$(echo "$response" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$user_id" ]; then
        echo -e "${GREEN}✓ Connexion réussie${NC}"
        echo "  User ID: ${user_id:0:20}..."
        echo "  Email: $user_email"
        echo "  Token: ${access_token:0:30}..."
        return 0
    else
        echo -e "${RED}❌ Réponse invalide${NC}"
        echo "Réponse: $response"
        return 1
    fi
}

# Tester les 3 utilisateurs
test_login "admin@tennisclub.fr" "Password123!" "admin" || true
echo ""
test_login "moniteur@tennisclub.fr" "Password123!" "moniteur" || true
echo ""
test_login "membre@tennisclub.fr" "Password123!" "eleve" || true

echo ""

# =====================================================
# TEST 3 : Vérifier public.users via API REST
# =====================================================
echo "--- TEST 3 : Vérifier public.users via API REST ---"

# D'abord, obtenir un token de service (pour bypass RLS si nécessaire)
echo "Obtention d'un token pour accéder à public.users..."

# Utiliser le service role key pour bypass RLS
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsD3W0YpN81IU"

# Se connecter d'abord pour obtenir un token
login_response=$(curl -s -X POST "$SUPABASE_URL/auth/v1/token?grant_type=password" \
    -H "apikey: $SUPABASE_ANON_KEY" \
    -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "admin@tennisclub.fr",
        "password": "Password123!"
    }')

access_token=$(echo "$login_response" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$access_token" ]; then
    echo "Token obtenu, requête vers public.users..."
    
    users_response=$(curl -s "$SUPABASE_URL/rest/v1/users?email=eq.admin@tennisclub.fr" \
        -H "apikey: $SUPABASE_ANON_KEY" \
        -H "Authorization: Bearer $access_token" \
        -H "Content-Type: application/json")
    
    if echo "$users_response" | grep -q "admin@tennisclub.fr"; then
        echo -e "${GREEN}✓ public.users contient l'utilisateur${NC}"
        echo "Réponse: $users_response" | head -c 200
        echo "..."
    elif echo "$users_response" | grep -q "Database error querying schema"; then
        echo -e "${RED}❌ Database error querying schema${NC}"
        echo "C'est l'erreur que tu rencontres!"
        echo ""
        echo "Solution: Exécute scripts/fix-auth-schema.sql dans Supabase Studio"
    else
        echo -e "${YELLOW}⚠️ public.users ne contient pas l'utilisateur${NC}"
        echo "Réponse: $users_response"
        echo ""
        echo "Le trigger on_auth_user_created n'a pas fonctionné!"
        echo "Solution: Exécute scripts/fix-auth-schema.sql"
    fi
else
    echo -e "${RED}❌ Impossible d'obtenir un token${NC}"
    echo "La connexion API échoue - problème d'authentification"
fi

echo ""

# =====================================================
# RÉSUMÉ
# =====================================================
echo "=== RÉSUMÉ DES TESTS ==="
echo ""
echo "Si tous les tests sont verts (✓) :"
echo "  → L'API Auth fonctionne correctement"
echo "  → Le problème vient du code Next.js"
echo ""
echo "Si des tests sont rouges (❌) :"
echo "  → Exécute: scripts/fix-auth-schema.sql"
echo "  → Redémarre: npx supabase stop && npx supabase start"
echo ""
echo "Si erreur 'Database error querying schema' :"
echo "  → Le schéma auth est corrompu"
echo "  → Exécute: scripts/fix-auth-schema.sql en priorité"
echo ""
