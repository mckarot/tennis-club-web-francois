import PocketBase from 'pocketbase';
import { cookies } from 'next/headers';

export async function createClient() {
  const pb = new PocketBase(process.env.NEXT_PUBLIC_PB_URL || process.env.PB_URL);
  
  // Désactiver l'auto-cancellation pour éviter l'erreur ClientResponseError 0 dans les Promise.all
  pb.autoCancellation(false);

  const cookieStore = await cookies();
  
  // Load auth state from cookie
  const authCookie = cookieStore.get('pb_auth');
  if (authCookie) {
    pb.authStore.loadFromCookie(authCookie.value);
  }
  
  return pb;
}

export async function createAdminClient() {
  const pb = new PocketBase(process.env.NEXT_PUBLIC_PB_URL || process.env.PB_URL);
  
  // Désactiver l'auto-cancellation pour éviter l'erreur ClientResponseError 0
  pb.autoCancellation(false);

  const adminEmail = process.env.PB_ADMIN_EMAIL;
  const adminPassword = process.env.PB_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error('PB_ADMIN_EMAIL or PB_ADMIN_PASSWORD is not set');
  }

  // Authenticate as admin
  await pb.admins.authWithPassword(adminEmail, adminPassword);
  
  return pb;
}
