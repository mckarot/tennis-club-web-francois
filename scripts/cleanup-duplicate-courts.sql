-- =====================================================
-- NETTOYAGE DES DOUBLONS - Tennis Club du François
-- =====================================================
-- Supprime les courts en doublon pour ne garder que 6 courts
-- =====================================================

-- Voir tous les courts
SELECT id, nom, type_surface, statut_court, eclaire, created_at
FROM public.courts
ORDER BY nom, created_at;

-- Compter les courts par nom
SELECT nom, COUNT(*) as nombre
FROM public.courts
GROUP BY nom
ORDER BY nom;

-- Supprimer les doublons (garder le premier de chaque court)
DELETE FROM public.courts
WHERE id IN (
  SELECT c1.id
  FROM public.courts c1
  INNER JOIN public.courts c2 ON c1.nom = c2.nom
  WHERE c1.created_at > c2.created_at
);

-- Vérifier qu'il reste 6 courts
SELECT 'Courts restants: ' || COUNT(*) as resultat
FROM public.courts;

-- Afficher les 6 courts
SELECT id, nom, type_surface, statut_court, eclaire
FROM public.courts
ORDER BY nom;

-- =====================================================
-- FIN DU SCRIPT
-- =====================================================
