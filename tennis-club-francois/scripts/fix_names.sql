UPDATE public.profiles
SET 
  prenom = SPLIT_PART(nom, ' ', 1),
  nom = SUBSTR(nom, POSITION(' ' IN nom) + 1)
WHERE nom LIKE '% %' AND (prenom IS NULL OR prenom = '');
