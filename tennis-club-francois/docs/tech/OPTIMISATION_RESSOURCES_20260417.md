# 📑 Fiche Technique : Optimisation des Ressources (Next.js)

## 🔍 Diagnostic de l'incident (17 Avril 2026)
Le projet présentait une consommation CPU/RAM proche de 100% lors de l'exécution de `npm run dev`.

### Causes identifiées :
1.  **Saturation du Cache (3.1 Go)** : Le dossier `.next` était surchargé, forçant Next.js à indexer trop de fichiers.
2.  **React Compiler (CPU Intense)** : L'option `reactCompiler: true` dans `next.config.ts` (expérimentale) ralentissait le cycle de développement.
3.  **Conflits de Dépendances** : Mélange de `package-lock.json` et `pnpm-lock.yaml` entre la racine et le sous-projet.
4.  **Versions Bleeding Edge** : Next 16 / React 19 demandent une gestion rigoureuse du cache.

## 🛠️ Actions de Remédiation effectuées
1.  **Nettoyage complet** : Suppression des dossiers `.next` et `node_modules`.
2.  **Désactivation de l'expérimental** : `reactCompiler` passé à `false` pour alléger le CPU en dev.
3.  **Réinstallation propre** : Utilisation exclusive de `npm` dans le dossier `/tennis-club-francois`.

## 💡 Comment éviter que cela ne recommence ?

### 1. Commande de nettoyage rapide
Si le projet ralentit, exécutez cette commande dans le dossier `tennis-club-francois` :
```bash
rm -rf .next node_modules && npm install
```

### 2. Règles d'or
- **Un seul gestionnaire** : Ne pas mélanger `npm` et `pnpm`.
- **Dossier de travail** : Toujours lancer `npm run dev` à l'intérieur du dossier `tennis-club-francois/`.
- **Monitoring** : Surveiller la taille du dossier `.next`. S'il dépasse 1 Go, un nettoyage est recommandé.

---
*Fiche générée par Gemini CLI - 17/04/2026*
