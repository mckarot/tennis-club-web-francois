#!/bin/bash

# 🛠️ Script de vérification de l'environnement de développement
# Tennis Club François

set -e

echo "🔍 Vérification de l'environnement de développement..."
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Compteur d'erreurs
ERRORS=0

# 1. Vérifier Node.js
echo -n "📦 Node.js : "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓ $NODE_VERSION${NC}"
else
    echo -e "${RED}✗ Non installé${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 2. Vérifier npm
echo -n "📦 npm : "
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓ $NPM_VERSION${NC}"
else
    echo -e "${RED}✗ Non installé${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 3. Vérifier Docker
echo -n "🐳 Docker : "
if command -v docker &> /dev/null; then
    if docker info &> /dev/null; then
        DOCKER_VERSION=$(docker --version)
        echo -e "${GREEN}✓ $DOCKER_VERSION${NC}"
    else
        echo -e "${YELLOW}⚠ Installé mais daemon non lancé${NC}"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${RED}✗ Non installé${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 4. Vérifier node_modules
echo -n "📁 node_modules : "
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓ Installé${NC}"
else
    echo -e "${RED}✗ Non installé (npm install requis)${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 5. Vérifier .env.local
echo -n "🔐 .env.local : "
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✓ Présent${NC}"
    
    # Vérifier les variables requises
    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local && grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; then
        echo -e "   ${GREEN}✓ Variables Supabase configurées${NC}"
    else
        echo -e "   ${YELLOW}⚠ Variables Supabase manquantes${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Non présent (copier .env.example)${NC}"
fi

# 6. Vérifier TypeScript
echo -n "📘 TypeScript : "
if npx tsc --version &> /dev/null; then
    TS_VERSION=$(npx tsc --version)
    echo -e "${GREEN}✓ $TS_VERSION${NC}"
else
    echo -e "${RED}✗ Non configuré${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 7. Vérifier le build
echo -n "🏗️ Build Next.js : "
if npm run build &> /dev/null; then
    echo -e "${GREEN}✓ Passing${NC}"
else
    echo -e "${RED}✗ Échec${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 8. Vérifier ESLint
echo -n "🔍 ESLint : "
if npm run lint &> /dev/null; then
    echo -e "${GREEN}✓ 0 erreur${NC}"
else
    echo -e "${YELLOW}⚠ Des warnings/erreurs${NC}"
fi

echo ""
echo "════════════════════════════════════════════════"

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ Tout est prêt pour le développement !${NC}"
    echo ""
    echo "🚀 Prochaines étapes :"
    echo "   npm run dev"
    echo ""
else
    echo -e "${RED}❌ $ERRORS problème(s) détecté(s)${NC}"
    echo ""
    echo "🔧 Actions requises :"
    
    if [ ! -d "node_modules" ]; then
        echo "   npm install"
    fi
    
    if [ ! -f ".env.local" ]; then
        echo "   Créer .env.local avec les variables Supabase"
    fi
    
    if ! docker info &> /dev/null; then
        echo "   Lancer Docker Desktop"
    fi
fi

echo "════════════════════════════════════════════════"
