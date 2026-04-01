# 📚 Documentation - Tennis Club du François

**Dernière mise à jour :** 2026-04-01

---

## 🎯 FICHIER PRINCIPAL

### ⭐ **`00-START-HERE.md`** - **COMMENCE PAR ICI !**

C'est **LE** fichier de référence. Il contient :
- ✅ La méthodologie complète (7 étapes)
- ✅ L'état actuel du projet
- ✅ Les prochaines étapes
- ✅ La structure de fichiers
- ✅ Les commandes utiles
- ✅ Le dépannage

**Quand l'utiliser :**
- 🔄 Quand tu reprends le projet après une interruption
- 📖 Pour comprendre comment procéder
- 🎯 Pour savoir quelle est la prochaine tâche

---

## 📋 SUIVI DE PROJET

### **`PROJECT_TRACKER.md`**
- 📊 Suivi des 15 écrans
- ✅ État d'avancement (Phase 1, 2, 3)
- 📈 Métriques (0%, 13%, 100%)
- 🎯 Sprint en cours

**Quand l'utiliser :**
- Pour voir la progression globale
- Pour savoir quels écrans sont faits/à faire

### **`PROJECT_ROADMAP.md`**
- 🗓️ Roadmap détaillée par sprint
- 📅 Planning sur 4 semaines
- 🔗 Dépendances entre écrans

**Quand l'utiliser :**
- Pour planifier les prochaines semaines
- Pour comprendre les dépendances

---

## 📚 RÉFÉRENCES TECHNIQUES

### **`API_CONTRACTS.md`**
- 📝 Contrats de toutes les Server Actions
- 🔐 Codes d'erreur standardisés
- 📦 Types de retour

**Quand l'utiliser :**
- Pour implémenter une nouvelle Server Action
- Pour comprendre le format des données

### **`FLUX_PAR_ROLE.md`**
- 👥 Permissions par rôle (Admin, Membre, Moniteur)
- ✅ Matrice des actions autorisées
- 🔒 Restrictions

**Quand l'utiliser :**
- Pour vérifier les permissions d'un rôle
- Pour implémenter la sécurité

### **`RLS_POLICIES.md`**
- 🔒 Politiques Row Level Security
- 📊 Tables protégées
- 🔑 Règles d'accès

**Quand l'utiliser :**
- Pour configurer la sécurité DB
- Pour déboguer un problème RLS

---

## 🎨 DESIGN

### **`BRIEF_STITCH_UI_INTEGRATOR.md`**
- 🎨 Brief pour l'intégration Stitch
- 📐 Directives design
- 🎨 Palette de couleurs

**Quand l'utiliser :**
- Pour intégrer un nouvel écran Stitch
- Pour respecter le design system

---

## 📁 STRUCTURE DE LA DOCUMENTATION

```
docs/
├── README.md                      ← Ce fichier (START HERE)
├── 00-START-HERE.md               ← PRINCIPAL - À lire en premier
├── PROJECT_TRACKER.md             ← Suivi des écrans
├── PROJECT_ROADMAP.md             ← Roadmap détaillée
├── API_CONTRACTS.md               ← Contrats Server Actions
├── FLUX_PAR_ROLE.md               ← Permissions par rôle
├── RLS_POLICIES.md                ← Sécurité DB
└── BRIEF_STITCH_UI_INTEGRATOR.md  ← Design Stitch
```

---

## 🚀 QUICK START

### **Tu reprends le projet ?**

```bash
# 1. Ouvre le fichier principal
code docs/00-START-HERE.md

# 2. Lis la section "État Actuel du Projet"

# 3. Suis la "Checklist de Reprise"
```

### **Tu veux voir la progression ?**

```bash
# Ouvre le tracker
code docs/PROJECT_TRACKER.md
```

### **Tu commences un nouvel écran ?**

```bash
# 1. Lis la méthodologie (7 étapes)
code docs/00-START-HERE.md

# 2. Vérifie les permissions
code docs/FLUX_PAR_ROLE.md

# 3. Consulte les contrats API
code docs/API_CONTRACTS.md
```

---

## 📊 ÉTAT ACTUEL (Résumé)

| Module | Statut | Progress |
|--------|--------|----------|
| **Authentification** | ✅ Terminé | 100% |
| **Landing Page** | ✅ Terminée | 100% |
| **Dashboards (Structure)** | ✅ Créés | 50% |
| **Dashboards (Design Stitch)** | ⬜ À faire | 0% |
| **Features Admin** | ⬜ À faire | 0% |
| **Features Membre** | ⬜ À faire | 0% |
| **Features Moniteur** | ⬜ À faire | 0% |

**Prochaine tâche :** Dashboard Membre - Intégration Stitch

---

## 🔗 LIENS UTILES

- **Supabase Studio :** http://localhost:54323
- **Next.js Local :** http://localhost:3000
- **Login Test :** http://localhost:3000/login

---

**Document généré automatiquement.**  
**Prochaine révision :** Après Dashboard Membre
