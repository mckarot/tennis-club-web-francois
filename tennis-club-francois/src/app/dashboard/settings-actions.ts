'use server';

import PocketBase from 'pocketbase';
import { createClient, createAdminClient } from '@/lib/pocketbase/server';
import { revalidatePath } from 'next/cache';
import { type ActionResult, success, error } from '@/lib/types/actions';

export type UserProfileData = {
  nom: string;
  prenom: string;
  telephone: string;
  bio: string;
  niveau?: string;
  role: string;
  email: string;
  avatar_url?: string;
  adresse?: string;
  code_postal?: string;
  ville?: string;
  date_naissance?: string;
  // Champs membre
  niveau_tennis?: string;
  statut_adhesion?: string;
  type_abonnement?: string;
  licence_fft?: string;
  certificat_medical?: boolean;
  date_certificat?: string;
};

/**
 * Récupère les données du profil de l'utilisateur connecté
 */
export async function getMyProfileData(): Promise<ActionResult<UserProfileData>> {
  const pb = await createClient();
  const user = pb.authStore.model;

  if (!user) {
    return error('Non authentifié', 'UNAUTHORIZED');
  }

  const adminPb = await createAdminClient();
  
  try {
    const profile = await adminPb.collection('profiles').getFirstListItem(`user="${user.id}"`);
    
    // On utilise la même méthode que pour les événements (proven method)
    const pbUrl = process.env.NEXT_PUBLIC_PB_URL || process.env.PB_URL || '';
    const fileName = profile.avatar_url || profile.photo_url;
    
    let memberData = {};
    if (profile.role === 'membre') {
      try {
        memberData = await adminPb.collection('member_profiles').getFirstListItem(`user="${user.id}"`);
      } catch (e) {
        // Pas grave s'il n'y a pas de profil membre encore
      }
    }

    const data = {
      ...profile,
      ...memberData, // On fusionne les infos de membre (licence, abonnement, etc.)
      email: user.email,
      avatar_url: fileName 
        ? `${pbUrl}/api/files/${profile.collectionId}/${profile.id}/${fileName}` 
        : undefined,
    };

    return success(JSON.parse(JSON.stringify(data)));
  } catch (err: any) {
    console.error('Erreur récupération profil:', err);
    return error('Impossible de récupérer le profil', 'INTERNAL_ERROR');
  }
}

/**
 * Met à jour les informations du profil
 */
export async function updateProfile(data: Partial<UserProfileData>): Promise<ActionResult<void>> {
  const pb = await createClient();
  const user = pb.authStore.model;

  if (!user) return error('Non authentifié', 'UNAUTHORIZED');

  const adminPb = await createAdminClient();

  try {
    const profile = await adminPb.collection('profiles').getFirstListItem(`user="${user.id}"`);
    
    // On met à jour toutes les informations disponibles
    const updateData = {
      nom: data.nom,
      prenom: data.prenom,
      telephone: data.telephone,
      bio: data.bio,
      niveau: data.niveau,
      adresse: data.adresse,
      code_postal: data.code_postal,
      ville: data.ville,
      date_naissance: data.date_naissance,
    };

    await adminPb.collection('profiles').update(profile.id, updateData);
    
    revalidatePath('/', 'layout');
    return success(undefined, 'Profil mis à jour avec succès');
  } catch (err: any) {
    console.error('Erreur mise à jour profil:', err);
    return error('Erreur lors de la sauvegarde', 'INTERNAL_ERROR');
  }
}

/**
 * Met à jour la photo de profil (Avatar)
 */
export async function updateAvatar(formData: FormData): Promise<ActionResult<string>> {
  try {
    const pb = await createClient();
    const user = pb.authStore.model;
    if (!user) return error('Non authentifié', 'UNAUTHORIZED');

    // On utilise à nouveau le client ADMIN car les règles PB sont restrictives
    const adminPb = await createAdminClient();
    const profile = await adminPb.collection('profiles').getFirstListItem(`user="${user.id}"`);
    
    // Extraction du fichier
    const file = formData.get('photo_url') as File;
    
    if (!file || file.size === 0) {
      return error('Aucun fichier reçu par le serveur', 'BAD_REQUEST');
    }

    // On met à jour les deux champs possibles pour être tranquille
    const serverFormData = new FormData();
    serverFormData.append('photo_url', file);
    serverFormData.append('avatar_url', file);

    const updatedRecord = await adminPb.collection('profiles').update(profile.id, serverFormData);
    
    // On utilise la même méthode que pour les événements pour l'URL
    const pbUrl = process.env.NEXT_PUBLIC_PB_URL || process.env.PB_URL || '';
    const fileName = updatedRecord.avatar_url || updatedRecord.photo_url;
    const avatarUrl = `${pbUrl}/api/files/${updatedRecord.collectionId}/${updatedRecord.id}/${fileName}`;
    
    revalidatePath('/', 'layout');
    return success(avatarUrl, 'Photo de profil mise à jour !');
  } catch (err: any) {
    console.error('Erreur update avatar:', err);
    // On renvoie un message plus clair
    return error(`Détail technique: ${err.message || 'Erreur inconnue'}`, 'INTERNAL_ERROR');
  }
}

/**
 * Change le mot de passe de l'utilisateur
 */
export async function changePassword(oldPassword: string, newPassword: string): Promise<ActionResult<void>> {
  const pb = await createClient();
  const user = pb.authStore.model;

  if (!user || !user.email) return error('Non authentifié', 'UNAUTHORIZED');

  try {
    // 1. Vérifier l'ancien mot de passe
    const tempPb = new PocketBase(process.env.PB_URL);
    await tempPb.collection('users').authWithPassword(user.email, oldPassword);

    // 2. Si ça passe, on change le mot de passe via l'admin client
    const adminPb = await createAdminClient();
    await adminPb.collection('users').update(user.id, {
      password: newPassword,
      passwordConfirm: newPassword,
    });

    return success(undefined, 'Votre mot de passe a été modifié avec succès');
  } catch (err: any) {
    console.error('[Settings] Erreur changement password:', err);
    return error('Ancien mot de passe incorrect', 'UNAUTHORIZED');
  }
}

/**
 * Récupère les paramètres de notifications de l'utilisateur
 */
export async function getNotificationSettings(): Promise<ActionResult<any[]>> {
  const pb = await createClient();
  const user = pb.authStore.model;
  if (!user) return error('Non authentifié', 'UNAUTHORIZED');

  const adminPb = await createAdminClient();
  try {
    const settings = await adminPb.collection('notifications').getFullList({
      filter: `user="${user.id}"`
    });
    return success(JSON.parse(JSON.stringify(settings)));
  } catch (err) {
    return success([]);
  }
}

/**
 * Met à jour ou crée un paramètre de notification
 */
export async function updateNotificationSetting(type: string, canal: 'email' | 'push', active: boolean): Promise<ActionResult<void>> {
  const pb = await createClient();
  const user = pb.authStore.model;
  if (!user) return error('Non authentifié', 'UNAUTHORIZED');

  const adminPb = await createAdminClient();
  try {
    let existing;
    try {
      existing = await adminPb.collection('notifications').getFirstListItem(
        `user="${user.id}" && type_notification="${type}" && canal="${canal}"`
      );
    } catch (e) {
      // Pas de règle existante
    }

    if (existing) {
      await adminPb.collection('notifications').update(existing.id, { active });
    } else {
      await adminPb.collection('notifications').create({
        user: user.id,
        type_notification: type,
        canal: canal,
        active: active
      });
    }

    return success(undefined);
  } catch (err: any) {
    console.error('Erreur notification:', err);
    return error('Impossible de mettre à jour la préférence', 'INTERNAL_ERROR');
  }
}

/**
 * Supprime définitivement le compte de l'utilisateur
 */
export async function deleteAccount(): Promise<ActionResult<void>> {
  const pb = await createClient();
  const user = pb.authStore.model;
  if (!user) return error('Non authentifié', 'UNAUTHORIZED');

  const adminPb = await createAdminClient();
  try {
    // La suppression de l'utilisateur dans 'users' supprimera par cascade ses profils 
    // si les relations sont bien configurées en "Cascade delete" dans PocketBase.
    await adminPb.collection('users').delete(user.id);
    
    // On vide le store local
    pb.authStore.clear();
    
    return success(undefined, 'Votre compte a été supprimé définitivement.');
  } catch (err: any) {
    console.error('Erreur suppression compte:', err);
    return error('Impossible de supprimer le compte. Contactez le club.', 'INTERNAL_ERROR');
  }
}
