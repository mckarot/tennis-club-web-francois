# 🎨 Briefing - Stitch UI Integrator

## Mission : Intégration de la Landing Page (P0-1)

**Date :** 2026-03-30
**Priorité :** P0 (Critique)
**Complexité UI :** Medium

---

## 1. CONTEXTE

Tu vas créer la **Landing Page** du Tennis Club du François en te basant sur l'export Stitch fourni.

### Fichiers de référence :
- **Design Source :** `/Users/mathieu/StudioProjects/tennis_web/stitch_connexion_membres_admin/landing_page_club_de_tennis_du_fran_ois/code.html`
- **Fichier à créer :** `/Users/mathieu/StudioProjects/tennis_web/tennis-club-francois/src/app/page.tsx`

### État actuel :
- Le fichier `src/app/page.tsx` contient le template Next.js par défaut
- Tailwind CSS v4 est configuré avec `@import "tailwindcss"`
- Aucune configuration de thème personnalisée n'est encore définie

---

## 2. SPÉCIFICATIONS TECHNIQUES

### 2.1 Configuration Tailwind Requise

Le design Stitch utilise cette palette de couleurs personnalisée :

```javascript
colors: {
    "primary-fixed": "#c5eadf",
    "tertiary-container": "#293840",
    "outline": "#717976",
    "inverse-primary": "#aacec3",
    "on-tertiary": "#ffffff",
    "error": "#ba1a1a",
    "tertiary": "#14232a",
    "surface-container-high": "#e7e8e6",
    "secondary-fixed": "#ffdbd0",
    "outline-variant": "#c1c8c4",
    "surface-container": "#edeeec",
    "on-secondary-fixed-variant": "#7c2d10",
    "surface-bright": "#f9faf8",
    "primary-container": "#1a3c34",
    "on-tertiary-fixed": "#0e1d25",
    "on-error": "#ffffff",
    "secondary-fixed-dim": "#ffb59d",
    "surface-variant": "#e1e3e1",
    "inverse-surface": "#2e3130",
    "on-tertiary-fixed-variant": "#3a4951",
    "on-secondary-fixed": "#390b00",
    "on-primary-fixed": "#00201a",
    "on-error-container": "#93000a",
    "tertiary-fixed-dim": "#b9c9d3",
    "on-background": "#191c1b",
    "inverse-on-surface": "#f0f1ef",
    "surface-tint": "#43655c",
    "surface": "#f9faf8",
    "on-primary-container": "#83a69c",
    "secondary-container": "#fe906c",
    "surface-container-low": "#f3f4f2",
    "on-surface-variant": "#414846",
    "secondary": "#9b4426",
    "surface-dim": "#d9dad8",
    "on-tertiary-container": "#91a1ab",
    "surface-container-highest": "#e1e3e1",
    "background": "#f9faf8",
    "primary": "#01261f",
    "on-primary-fixed-variant": "#2b4d44",
    "on-surface": "#191c1b",
    "surface-container-lowest": "#ffffff",
    "tertiary-fixed": "#d5e5ef",
    "on-secondary-container": "#75280b",
    "on-primary": "#ffffff",
    "error-container": "#ffdad6",
    "on-secondary": "#ffffff",
    "primary-fixed-dim": "#aacec3"
}
```

### 2.2 Polices Requises

```javascript
fontFamily: {
    "headline": ["Lexend"],
    "body": ["Manrope"],
    "label": ["Manrope"]
}
```

### 2.3 Border Radius

```javascript
borderRadius: {
    "DEFAULT": "1rem",
    "lg": "2rem",
    "xl": "3rem",
    "full": "9999px"
}
```

---

## 3. STRUCTURE DE LA LANDING PAGE

La Landing Page Stitch contient les sections suivantes :

### 3.1 Top Navigation Bar (Fixed)
- Logo : "Tennis Club du François"
- Menu : Réservations, Tarifs, Club, Contact
- Bouton "Mon Profil" → redirige vers `/login`
- Menu mobile avec icône hamburger

### 3.2 Hero Section
- Image de fond (courts de tennis tropicaux)
- Overlay gradient
- Titre : "Vivez le tennis en plein cœur de la nature"
- 2 boutons :
  - "Réserver un court" → `/login` (si non connecté)
  - "Découvrir le club" → scroll vers section
- Badge "4 courts disponibles maintenant" (optionnel : données temps réel)

### 3.3 Welcome Message (Philosophy)
- Titre : "L'Esprit Eco-Luxe"
- Sous-titre : "L'élégance du sport, la force de la Martinique."
- Paragraphe descriptif
- Stats : "100% Énergie Solaire", "Zéro Plastique"
- Image d'ambiance

### 3.4 Services Section (Bento Grid)
- 3 cartes :
  - "6 Courts Premium"
  - "Coaching de Haut Niveau"
  - "Lounge & Bar"
- Effet hover : translation vers le haut

### 3.5 Ambiance Club (Asymmetric Bento Grid)
- Grande image : "Tournois de la Baie"
- Images secondaires : Club House, Fresh Juice
- Call-to-action : "Rejoignez la Communauté"

### 3.6 Footer
- 4 colonnes :
  - Description + Réseaux sociaux
  - Le Club (liens)
  - Pratique (liens)
  - Adresse + Map
- Copyright + Liens légaux

---

## 4. CONSIGNES D'IMPLÉMENTATION

### 4.1 Priorités

1. **Fidélité au design** : Reproduire exactement le design Stitch
2. **Responsive** : Mobile-first, tester sur toutes les tailles
3. **Accessibilité** : Labels ARIA, contrastes, navigation clavier
4. **Performance** : Images optimisées, lazy loading

### 4.2 Fonctionnalités à Implémenter

#### Obligatoires :
- [ ] Navigation fixe avec effet backdrop-blur
- [ ] Bouton "Mon Profil" → `/login`
- [ ] Bouton "Réserver un court" → `/login`
- [ ] Bouton "Découvrir le club" → scroll smooth vers section Philosophy
- [ ] Menu mobile fonctionnel (toggle)
- [ ] Footer avec tous les liens

#### Optionnels (dans un second temps) :
- [ ] Badge "4 courts disponibles" connecté à `getAvailableCourtsAction`
- [ ] Effet hover sur les cartes Bento
- [ ] Animation pulse sur le badge de disponibilité

### 4.3 Contraintes Techniques

- **TypeScript strict** : Typage complet des props et états
- **Next.js 16** : Utiliser les App Router
- **Tailwind v4** : Configuration inline dans `globals.css`
- **React 19** : Hooks modernes (useState, useEffect, useRef)
- **Pas de dépendances supplémentaires** : Utiliser uniquement ce qui est installé

---

## 5. CHECKLIST DE VALIDATION

Après implémentation, vérifier :

- [ ] **Build réussi** : `npm run build` = 0 erreur
- [ ] **TypeScript** : `tsc --noEmit` = 0 erreur
- [ ] **Lint** : `npm run lint` = 0 warning
- [ ] **Design préservé** : Comparaison visuelle avec Stitch
- [ ] **Responsive** : Mobile (320px), Tablet (768px), Desktop (1920px)
- [ ] **Accessibilité** :
  - [ ] Boutons ont des labels
  - [ ] Images ont des alt text
  - [ ] Navigation clavier fonctionnelle
  - [ ] Contrastes suffisants
- [ ] **Fonctionnel** :
  - [ ] Boutons de redirection fonctionnent
  - [ ] Menu mobile toggle fonctionne
  - [ ] Scroll smooth fonctionne
- [ ] **Performance** :
  - [ ] Images avec lazy loading
  - [ ] Pas de layout shift

---

## 6. FICHIERS À CRÉER/MODIFIER

### À créer :
```
src/app/page.tsx (remplacer le template actuel)
src/components/landing/
├── Navbar.tsx
├── HeroSection.tsx
├── PhilosophySection.tsx
├── ServicesSection.tsx
├── AmbianceSection.tsx
└── Footer.tsx
```

### À modifier :
```
src/app/globals.css (ajouter configuration thème Tailwind)
```

---

## 7. COMPOSANTS DÉTAILLÉS

### Navbar
```typescript
interface NavbarProps {
  isLoggedIn?: boolean;
}
```
- Fixed top, backdrop-blur
- Logo texte (font-headline)
- Menu desktop (hidden mobile)
- Bouton "Mon Profil" avec icône Material Symbols
- Menu hamburger mobile

### HeroSection
```typescript
interface HeroSectionProps {
  availableCourts?: number;
}
```
- Pleine largeur, hauteur 921px min
- Image de fond avec overlay gradient
- Titre centré
- 2 boutons d'action
- Badge de disponibilité (bottom-right)

### PhilosophySection
```typescript
interface PhilosophySectionProps {}
```
- Grid 2 colonnes (texte + image)
- Stats en bas
- Image avec élément décoratif

### ServicesSection
```typescript
interface ServicesSectionProps {}
```
- 3 cartes Bento
- Icônes Material Symbols
- Effet hover : translate-y + changement de couleur

### AmbianceSection
```typescript
interface AmbianceSectionProps {}
```
- Grid asymétrique (4 colonnes, 2 lignes)
- 1 grande image + 3 petites
- Overlay texte sur images

### Footer
```typescript
interface FooterProps {}
```
- 4 colonnes
- Réseaux sociaux
- Liens de navigation
- Map (image statique)

---

## 8. RESSOURCES

### Images (URLs Stitch)
- Hero : https://lh3.googleusercontent.com/aida-public/AB6AXuDvcBUGChZKc2SvxLW3SEYvCSOQLDqo9JT0LzyiT35ZEMdz09Ee4u6pfJDifrtm0JxXpJ-ai3CFTj_SaQUxvRxGvBwj47H1iYTMjoCXFRO_xkvsJO3eSp3DX2hoqlz7dzLxUdDtiK0zwrrhU-uKdly3-913Kv6HYku0hZEWdOVEGItd-hIFlCnsdlRERgn3DN2KgFuV4SnSY7UXV8cQtg1mD_QaHjrCVv1VnuHBZyz0I8a5nOV-az_Ewrd3FNUego3aDHbmw60C7yA
- Philosophy : https://lh3.googleusercontent.com/aida-public/AB6AXuD7yDJJf-MUMeVzHGSUkbMXtHRou4WbAs0kpVTYRIfo37vNKzuuU8QW4z5pBiWIY1Pi4ch9IP1PoO15_BAEezmRlYMkNE9LYlkcA93-8YdeqmZI57fGTJK3KzjqScW6szJLkCauoWWHZNJfj-2MfvvXHqMiMXsJpO9M766uRCPsSNe-yper-fDqks6aqXWXtPPLfUJBVF8HFlUfdvhpMNHA9NkjhaerUBHGB9QBRjvURxYA_yWWerTnVez1VXmPjpvFx1Qg0DjewjY
- Tournois : https://lh3.googleusercontent.com/aida-public/AB6AXuBm1p3zHjt6_k1ddE-l_5eBV4GXhI7C5111t4Q4Dzat3FAMObn7_ZtjpxDsXiHxpAiXfATmTQ9WBDqef4533moFDwxsaAt7CsiKpLZIi5CcSXfDrjdXTG7aJsS65OvfukPlgZGIuj3AQpZQsCiSotgGE7LBNKxHa9qEbOmmB84u-97atUAwxwPtOUiAVIY68f-O75nHwu8JlORppX01CrFkfGpFENMqcSGqlBGQsEzZ-ARlgrnXyYRcY2BvK-UT_-BsEhZ_UDx_luE
- Club House : https://lh3.googleusercontent.com/aida-public/AB6AXuCm9O-b1weJV_XhaWv6ReIcTAz9pAJNM9sdwyGdH0u948YoUqiS3st8KHihW4-o-A110ALtU-H0O5S23AZFD02DDga8OmQo5h2dKnD9_Fr3YUdgVuDF4jHsKTK1nOYd98qQeCTcJ9JBc-1YsO8TwHPNVf2FrHEKnZqA1VrkwaZqVKgoE9WQZQypxXiK7wMjaw6AMh2xGDJgL9A-Z-HVKI9Bs073PZ6ssT2T2bn6GJOHcJheEcAfnzNcS0diO0nB13VnfzqyzqWqt-M
- Juice : https://lh3.googleusercontent.com/aida-public/AB6AXuA6lj7h_A68mQYrJttfIBEGNRUn0QQZIHXzBnUptn2G3ZthiIavfYpgu2hlAwVzqxoKKQlx5NAiILUUuBgKROvDhr59Z1YA4ry7BjpkSpW30KjnDKqtRwo7yA5k54ymRlzjn9NGIjqWcVXC2udhD3h8kLE5OGzcD5vYV_73twB8aC__QsUhni2rBWNdpWx-AbyUWh4hZqTBcauaxNxGrzsubAgdHKrY-kelV1v490pYtr4Y9Hji7oCRVd1PvzXg3sXBr-w5ltOTbD0
- Map : https://lh3.googleusercontent.com/aida-public/AB6AXuCn_J5NO9AZC7-gr13DGxFi3ZzYP535Q0EP75QJiUfG61SyQ9heQMSibU4CnCQxIE-_qz-EmupJkI2ccOMdvqGiW36By_3emevsSvo0812mOGcSU_rORyohb5lGhkStNDfmBFUVYRFAA6pk_TIBxqp7r3XEGTPUKFQ-expFesTm6w-pohwD136NMn8TfepUxa9vNs8HaIZuJ0Dd7PeBaP9uTNhsD2CGQt4cNrQ7Kd1CkGcgR3xZztRKG1lTZtX2KDg2AfYTGH31Q0A

### Icônes Material Symbols
Utiliser le CDN : https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined

Exemple d'utilisation :
```html
<span class="material-symbols-outlined">account_circle</span>
```

---

## 9. CRITÈRES D'ACCEPTATION

La Landing Page est considérée **terminée** quand :

1. ✅ Le design est fidèle à 95%+ au Stitch
2. ✅ Tous les boutons sont fonctionnels
3. ✅ Le responsive est parfait sur mobile, tablette, desktop
4. ✅ Le build passe sans erreur
5. ✅ TypeScript est validé
6. ✅ Lint est propre
7. ✅ Accessibilité de base vérifiée

---

**Document généré par l'Orchestrateur pour le stitch-ui-integrator**
