
import PocketBase from 'pocketbase';
import * as dotenv from 'dotenv';
dotenv.config();

async function checkMemberData() {
  const pb = new PocketBase(process.env.PB_URL);
  try {
    await pb.admins.authWithPassword(process.env.PB_ADMIN_EMAIL!, process.env.PB_ADMIN_PASSWORD!);
    
    const userId = 'shn8et5q0e4rsrk'; // Marie-Hélène
    console.log('--- Vérification Marie-Hélène ---');
    
    const profile = await pb.collection('profiles').getFirstListItem(`user="${userId}"`);
    console.log('Profil de base:', { id: profile.id, avatar: profile.avatar_url || profile.photo_url });
    
    const memberProfile = await pb.collection('member_profiles').getFirstListItem(`user="${userId}"`).catch(() => null);
    if (memberProfile) {
      console.log('Profil Membre trouvé:', {
        niveau: memberProfile.niveau_tennis,
        abonnement: memberProfile.type_abonnement,
        statut: memberProfile.statut_adhesion
      });
    } else {
      console.log('❌ Aucun profil membre trouvé dans "member_profiles" pour cet utilisateur.');
    }
  } catch (err) {
    console.error('Erreur:', err);
  }
}
checkMemberData();
