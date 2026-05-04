-- =====================================================
-- SCRIPT: Données de test pour Dashboard Admin
-- PROJET: Tennis Club du François
-- DATE: 2026-04-01
-- DESCRIPTION: Remplit les tables pour tester le Dashboard Admin
-- =====================================================
-- TABLES CIBLÉES :
-- - courts (6 courts)
-- - reservations (10 réservations)
-- - member_profiles (5 membres)
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
-- 2. MEMBER_PROFILES - 5 membres avec profils complets
-- =====================================================

DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Membre 1 : Marie Laurent (inscrit il y a 10 jours)
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'marie.laurent@email.com',
    crypt('Membre123!', gen_salt('bf')),
    NOW(),
    jsonb_build_object('nom', 'Laurent', 'prenom', 'Marie', 'role', 'membre'),
    NOW() - INTERVAL '10 days',
    NOW()
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO v_user_id;
  
  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.users (id, email, role)
    VALUES (v_user_id, 'marie.laurent@email.com', 'membre')
    ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
    
    INSERT INTO public.profiles (user_id, nom, prenom, role, created_at)
    VALUES (v_user_id, 'Laurent', 'Marie', 'membre', NOW() - INTERVAL '10 days')
    ON CONFLICT (user_id) DO UPDATE SET nom = EXCLUDED.nom, prenom = EXCLUDED.prenom;
    
    INSERT INTO public.member_profiles (user_id, date_naissance, telephone, adresse, ville, code_postal, niveau_tennis, licence_fft, certificat_medical, date_certificat)
    VALUES (
      v_user_id,
      '1990-05-15',
      '06 12 34 56 78',
      '123 Rue de la Plage',
      'Le François',
      '97240',
      'intermédiaire',
      'FFT2026001',
      true,
      NOW() - INTERVAL '30 days'
    )
    ON CONFLICT (user_id) DO UPDATE SET nom = EXCLUDED.nom, prenom = EXCLUDED.prenom;
  END IF;
  
  -- Membre 2 : Marc Petit (inscrit il y a 8 jours)
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'marc.petit@email.com',
    crypt('Membre123!', gen_salt('bf')),
    NOW(),
    jsonb_build_object('nom', 'Petit', 'prenom', 'Marc', 'role', 'membre'),
    NOW() - INTERVAL '8 days',
    NOW()
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO v_user_id;
  
  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.users (id, email, role)
    VALUES (v_user_id, 'marc.petit@email.com', 'membre')
    ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
    
    INSERT INTO public.profiles (user_id, nom, prenom, role, created_at)
    VALUES (v_user_id, 'Petit', 'Marc', 'membre', NOW() - INTERVAL '8 days')
    ON CONFLICT (user_id) DO UPDATE SET nom = EXCLUDED.nom, prenom = EXCLUDED.prenom;
    
    INSERT INTO public.member_profiles (user_id, date_naissance, telephone, adresse, ville, code_postal, niveau_tennis, licence_fft, certificat_medical, date_certificat)
    VALUES (
      v_user_id,
      '1985-08-22',
      '06 98 76 54 32',
      '45 Avenue des Palmiers',
      'Le François',
      '97240',
      'avancé',
      'FFT2026002',
      true,
      NOW() - INTERVAL '25 days'
    )
    ON CONFLICT (user_id) DO UPDATE SET nom = EXCLUDED.nom, prenom = EXCLUDED.prenom;
  END IF;
  
  -- Membre 3 : Sophie Maréchal (inscrite il y a 5 jours)
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'sophie.marechal@email.com',
    crypt('Membre123!', gen_salt('bf')),
    NOW(),
    jsonb_build_object('nom', 'Maréchal', 'prenom', 'Sophie', 'role', 'membre'),
    NOW() - INTERVAL '5 days',
    NOW()
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO v_user_id;
  
  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.users (id, email, role)
    VALUES (v_user_id, 'sophie.marechal@email.com', 'membre')
    ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
    
    INSERT INTO public.profiles (user_id, nom, prenom, role, created_at)
    VALUES (v_user_id, 'Maréchal', 'Sophie', 'membre', NOW() - INTERVAL '5 days')
    ON CONFLICT (user_id) DO UPDATE SET nom = EXCLUDED.nom, prenom = EXCLUDED.prenom;
    
    INSERT INTO public.member_profiles (user_id, date_naissance, telephone, adresse, ville, code_postal, niveau_tennis, licence_fft, certificat_medical, date_certificat)
    VALUES (
      v_user_id,
      '1995-03-10',
      '06 11 22 33 44',
      '78 Impasse des Cocotiers',
      'Le François',
      '97240',
      'débutant',
      'FFT2026003',
      true,
      NOW() - INTERVAL '20 days'
    )
    ON CONFLICT (user_id) DO UPDATE SET nom = EXCLUDED.nom, prenom = EXCLUDED.prenom;
  END IF;
  
  -- Membre 4 : Thomas Bertrand (inscrit il y a 3 jours)
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'thomas.bertrand@email.com',
    crypt('Membre123!', gen_salt('bf')),
    NOW(),
    jsonb_build_object('nom', 'Bertrand', 'prenom', 'Thomas', 'role', 'membre'),
    NOW() - INTERVAL '3 days',
    NOW()
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO v_user_id;
  
  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.users (id, email, role)
    VALUES (v_user_id, 'thomas.bertrand@email.com', 'membre')
    ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
    
    INSERT INTO public.profiles (user_id, nom, prenom, role, created_at)
    VALUES (v_user_id, 'Bertrand', 'Thomas', 'membre', NOW() - INTERVAL '3 days')
    ON CONFLICT (user_id) DO UPDATE SET nom = EXCLUDED.nom, prenom = EXCLUDED.prenom;
    
    INSERT INTO public.member_profiles (user_id, date_naissance, telephone, adresse, ville, code_postal, niveau_tennis, licence_fft, certificat_medical, date_certificat)
    VALUES (
      v_user_id,
      '1988-11-30',
      '06 55 44 33 22',
      '12 Boulevard de la Mer',
      'Le François',
      '97240',
      'intermédiaire',
      'FFT2026004',
      true,
      NOW() - INTERVAL '15 days'
    )
    ON CONFLICT (user_id) DO UPDATE SET nom = EXCLUDED.nom, prenom = EXCLUDED.prenom;
  END IF;
  
  -- Membre 5 : Julien Dupont (inscrit il y a 1 jour)
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'julien.dupont@email.com',
    crypt('Membre123!', gen_salt('bf')),
    NOW(),
    jsonb_build_object('nom', 'Dupont', 'prenom', 'Julien', 'role', 'membre'),
    NOW() - INTERVAL '1 day',
    NOW()
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO v_user_id;
  
  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.users (id, email, role)
    VALUES (v_user_id, 'julien.dupont@email.com', 'membre')
    ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
    
    INSERT INTO public.profiles (user_id, nom, prenom, role, created_at)
    VALUES (v_user_id, 'Dupont', 'Julien', 'membre', NOW() - INTERVAL '1 day')
    ON CONFLICT (user_id) DO UPDATE SET nom = EXCLUDED.nom, prenom = EXCLUDED.prenom;
    
    INSERT INTO public.member_profiles (user_id, date_naissance, telephone, adresse, ville, code_postal, niveau_tennis, licence_fft, certificat_medical, date_certificat)
    VALUES (
      v_user_id,
      '1992-07-18',
      '06 77 88 99 00',
      '56 Rue Victor Hugo',
      'Le François',
      '97240',
      'avancé',
      'FFT2026005',
      true,
      NOW() - INTERVAL '10 days'
    )
    ON CONFLICT (user_id) DO UPDATE SET nom = EXCLUDED.nom, prenom = EXCLUDED.prenom;
  END IF;
END $$;

-- =====================================================
-- 3. RESERVATIONS - 10 réservations pour tester
-- =====================================================

DO $$
DECLARE
  v_court_ids uuid[];
  v_user_ids uuid[];
  v_court_id uuid;
  v_user_id uuid;
  i integer;
  v_start_time timestamptz;
  v_end_time timestamptz;
BEGIN
  -- Récupérer les IDs des courts
  SELECT array_agg(id) INTO v_court_ids FROM public.courts;
  
  -- Récupérer les IDs des utilisateurs membres
  SELECT array_agg(id) INTO v_user_ids FROM public.users WHERE role = 'membre';
  
  -- Créer 10 réservations
  FOR i IN 1..10 LOOP
    -- Sélectionner un court et un utilisateur aléatoire
    v_court_id := v_court_ids[1 + (i % array_length(v_court_ids, 1))];
    v_user_id := v_user_ids[1 + (i % array_length(v_user_ids, 1))];
    
    -- Calculer des horaires de réservation (aujourd'hui + i jours)
    v_start_time := NOW() + (i || ' days')::interval - EXTRACT(HOUR FROM NOW()) * INTERVAL '1 hour' - EXTRACT(MINUTE FROM NOW()) * INTERVAL '1 minute';
    v_end_time := v_start_time + INTERVAL '1 hour 30 minutes';
    
    -- Insérer la réservation
    INSERT INTO public.reservations (court_id, user_id, start_time, end_time, status, notes)
    VALUES (
      v_court_id,
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
-- 4. VÉRIFICATION - Affichage des données créées
-- =====================================================

-- Affichage des courts
SELECT 
  'COURTS CRÉÉS: ' || COUNT(*) as resultat
FROM public.courts;

-- Affichage des membres
SELECT 
  'MEMBRES CRÉÉS: ' || COUNT(*) as resultat
FROM public.member_profiles;

-- Affichage des réservations
SELECT 
  'RÉSERVATIONS CRÉÉES: ' || COUNT(*) as resultat
FROM public.reservations;

-- Détail des membres
SELECT 
  p.nom || ' ' || p.prenom as membre,
  u.email,
  mp.niveau_tennis,
  p.created_at as "Date inscription"
FROM public.member_profiles mp
JOIN public.profiles p ON mp.user_id = p.user_id
JOIN public.users u ON mp.user_id = u.id
ORDER BY p.created_at DESC;

-- Détail des réservations
SELECT 
  c.nom as court,
  p.nom || ' ' || p.prenom as membre,
  to_char(r.start_time, 'DD/MM HH:MI') as debut,
  r.status
FROM public.reservations r
JOIN public.courts c ON r.court_id = c.id
JOIN public.profiles p ON r.user_id = p.user_id
ORDER BY r.start_time
LIMIT 10;

-- =====================================================
-- SCRIPT TERMINÉ - Les données sont prêtes pour le Dashboard Admin
-- =====================================================
