-- =====================================================
-- SCRIPT: Création de 5 membres supplémentaires
-- POUR: Dashboard Admin - Section "Membres Récents"
-- =====================================================

DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Membre 1 : Marie Laurent (inscrit il y a 2 jours)
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
    NOW() - INTERVAL '2 days',
    NOW()
  )
  RETURNING id INTO v_user_id;
  
  INSERT INTO public.users (id, email, role) VALUES (v_user_id, 'marie.laurent@email.com', 'membre');
  INSERT INTO public.profiles (user_id, nom, prenom, role, created_at) VALUES (v_user_id, 'Laurent', 'Marie', 'membre', NOW() - INTERVAL '2 days');
  
  -- Membre 2 : Marc Petit (inscrit il y a 3 jours)
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
    NOW() - INTERVAL '3 days',
    NOW()
  )
  RETURNING id INTO v_user_id;
  
  INSERT INTO public.users (id, email, role) VALUES (v_user_id, 'marc.petit@email.com', 'membre');
  INSERT INTO public.profiles (user_id, nom, prenom, role, created_at) VALUES (v_user_id, 'Petit', 'Marc', 'membre', NOW() - INTERVAL '3 days');
  
  -- Membre 3 : Sophie Maréchal (inscrite il y a 4 jours)
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
    NOW() - INTERVAL '4 days',
    NOW()
  )
  RETURNING id INTO v_user_id;
  
  INSERT INTO public.users (id, email, role) VALUES (v_user_id, 'sophie.marechal@email.com', 'membre');
  INSERT INTO public.profiles (user_id, nom, prenom, role, created_at) VALUES (v_user_id, 'Maréchal', 'Sophie', 'membre', NOW() - INTERVAL '4 days');
  
  -- Membre 4 : Thomas Bertrand (inscrit il y a 5 jours)
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
    NOW() - INTERVAL '5 days',
    NOW()
  )
  RETURNING id INTO v_user_id;
  
  INSERT INTO public.users (id, email, role) VALUES (v_user_id, 'thomas.bertrand@email.com', 'membre');
  INSERT INTO public.profiles (user_id, nom, prenom, role, created_at) VALUES (v_user_id, 'Bertrand', 'Thomas', 'membre', NOW() - INTERVAL '5 days');
  
  -- Membre 5 : Julien Dupont (inscrit il y a 6 jours)
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
    NOW() - INTERVAL '6 days',
    NOW()
  )
  RETURNING id INTO v_user_id;
  
  INSERT INTO public.users (id, email, role) VALUES (v_user_id, 'julien.dupont@email.com', 'membre');
  INSERT INTO public.profiles (user_id, nom, prenom, role, created_at) VALUES (v_user_id, 'Dupont', 'Julien', 'membre', NOW() - INTERVAL '6 days');
END $$;

-- =====================================================
-- VÉRIFICATION
-- =====================================================
SELECT 
  'MEMBRES CRÉÉS: ' || COUNT(*) as resultat
FROM public.profiles
WHERE role = 'membre';

SELECT 
  p.nom || ' ' || p.prenom as membre,
  u.email,
  p.created_at as "Date inscription"
FROM public.profiles p
JOIN public.users u ON p.user_id = u.id
WHERE p.role = 'membre'
ORDER BY p.created_at DESC;
