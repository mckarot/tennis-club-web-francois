-- =====================================================
-- SCRIPT: Données de test pour Dashboard Admin
-- PROJET: Tennis Club du François
-- DATE: 2026-04-01
-- DESCRIPTION: Remplit les tables pour tester le Dashboard Admin
-- =====================================================

-- =====================================================
-- 1. COURTS - 6 courts avec différents types
-- =====================================================

INSERT INTO public.courts (nom, type, disponible, eclairage) VALUES
  ('Court 01', 'Terre battue', true, true),
  ('Court 02', 'Terre battue', true, true),
  ('Court 03', 'Dur', true, true),
  ('Court 04', 'Dur', true, false),
  ('Court 05', 'Synthétique', true, true),
  ('Court 06', 'Synthétique', true, false)
ON CONFLICT (nom) DO UPDATE SET
  type = EXCLUDED.type,
  disponible = EXCLUDED.disponible,
  eclairage = EXCLUDED.eclairage,
  updated_at = NOW();

-- =====================================================
-- 2. RESERVATIONS - 10 réservations pour tester
-- =====================================================

DO $$
DECLARE
  v_court_ids uuid[];
  v_user_id uuid;
  i integer;
  v_start_time timestamptz;
  v_end_time timestamptz;
BEGIN
  -- Récupérer l'ID de l'utilisateur membre existant
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'membre@tennis-club.fr';
  
  -- Récupérer les IDs des courts
  SELECT array_agg(id) INTO v_court_ids FROM public.courts;
  
  -- Créer 10 réservations
  FOR i IN 1..10 LOOP
    -- Calculer des horaires de réservation (aujourd'hui + i jours)
    v_start_time := NOW() + (i || ' days')::interval - EXTRACT(HOUR FROM NOW()) * INTERVAL '1 hour' - EXTRACT(MINUTE FROM NOW()) * INTERVAL '1 minute';
    v_end_time := v_start_time + INTERVAL '1 hour 30 minutes';
    
    -- Insérer la réservation
    INSERT INTO public.reservations (court_id, user_id, start_time, end_time, status, notes)
    VALUES (
      v_court_ids[1 + (i % array_length(v_court_ids, 1))],
      v_user_id,
      v_start_time,
      v_end_time,
      CASE 
        WHEN i <= 7 THEN 'confirmée'
        WHEN i = 8 THEN 'annulée'
        WHEN i = 9 THEN 'terminée'
        ELSE 'confirmée'
      END,
      CASE 
        WHEN i % 3 = 0 THEN 'Réservation pour entraînement'
        WHEN i % 5 = 0 THEN 'Match amical'
        ELSE NULL
      END
    )
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

-- =====================================================
-- 3. VÉRIFICATION - Affichage des données créées
-- =====================================================

-- Affichage des courts
SELECT 
  'COURTS CRÉÉS: ' || COUNT(*) as resultat
FROM public.courts;

-- Affichage des réservations
SELECT 
  'RÉSERVATIONS CRÉÉES: ' || COUNT(*) as resultat
FROM public.reservations;

-- Détail des courts
SELECT 
  nom,
  type,
  CASE WHEN disponible THEN '✓' ELSE '✗' END as dispo,
  CASE WHEN eclairage THEN '✓' ELSE '✗' END as eclairage
FROM public.courts
ORDER BY nom;

-- Détail des réservations
SELECT 
  c.nom as court,
  to_char(r.start_time, 'DD/MM HH:MI') as debut,
  to_char(r.end_time, 'HH:MI') as fin,
  r.status
FROM public.reservations r
JOIN public.courts c ON r.court_id = c.id
ORDER BY r.start_time
LIMIT 10;

-- =====================================================
-- SCRIPT TERMINÉ - Les données sont prêtes pour le Dashboard Admin
-- =====================================================
