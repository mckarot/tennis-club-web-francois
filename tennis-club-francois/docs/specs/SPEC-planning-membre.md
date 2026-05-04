# SPEC-001 : Planning Hebdomadaire Membre

**Feature :** Affichage et réservation via le planning hebdomadaire
**Route :** `/dashboard/membre/planning`
**Description :** Interface de type planning permettant aux membres de voir les disponibilités de la semaine et de réserver un créneau sur les courts "Quick".

---

## 🏗️ Architecture Technique

- **Framework :** Next.js 15/16 (App Router)
- **Data Fetching :** Server Action `getWeeklyPlanningData(startDate: Date)`
- **Mutations :** Server Action `createReservationAction`
- **Validation :** Zod v4 (Zero-Trust)
- **UI :** React 19 + Tailwind v4 + Lucide/Material Symbols

---

## 🎨 Design (Stitch Source)

**Source :** `stitch_connexion_membres_admin/planning_des_courts_membre_menu_corrig`

**Composants Clés :**
1. **Header Planning :** 
   - Titre "Weekly Planning"
   - Sélecteur de semaine (Précédent / Suivant)
2. **Bento Grid Layout :**
   - **Col Gauche (Statut Courts) :** Liste des courts "Quick" avec pastille d'état (Available, Maintenance).
   - **Col Droite (Grille de Disponibilité) :** Tableau avec les jours en colonnes et les heures en lignes (08:00 AM à 22:00 PM).
3. **Widgets Bas de Page :**
   - Heures jouées ce mois-ci.
   - Statut du membre (Platinum).
   - Météo (Données mockées pour l'instant).
4. **FAB (Floating Action Button) :** "Instant Book".

---

## 📊 Modèle de Données (Drizzle)

**Tables concernées :**
- `courts` : Récupération des noms et statuts.
- `reservations` : Récupération des occupations pour la semaine sélectionnée.

---

## 🚦 Gate Validation Criteria

### Gate 1 — Data
- [ ] Table `courts` et `reservations` existantes.
- [ ] Index sur `reservations(court_id, start_time)` pour performance planning.

### Gate 2 — UI
- [ ] Intégration fidèle du design Stitch (Bento Grid).
- [ ] Support des 4 états (Loading skeleton, Empty, Error, Success).
- [ ] Responsive design (Table horizontale scrollable sur mobile).

### Gate 3 — Security
- [ ] Middleware protège l'accès à `/dashboard/membre/*`.
- [ ] RLS : un membre peut voir toutes les réservations mais ne modifier que les siennes.
- [ ] `getUser()` utilisé dans toutes les Server Actions.

### Gate 4 — QA
- [ ] Coverage > 80% sur les nouvelles actions.
- [ ] Test E2E : "Un membre peut naviguer sur le planning et cliquer sur un créneau".

---

## 📅 Roadmap de Livraison
1. Setup de la structure de dossier et fichiers vides.
2. Implémentation de `getWeeklyPlanningData`.
3. Intégration de la grille de planning UI (Stitch).
4. Ajout de la modale de réservation.
5. Tests et validation finale par l'Orchestrateur.
