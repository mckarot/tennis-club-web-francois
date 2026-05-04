import PocketBase from 'pocketbase';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function checkUsers() {
  const pbUrl = process.env.PB_URL || process.env.NEXT_PUBLIC_PB_URL;
  const adminEmail = process.env.PB_ADMIN_EMAIL;
  const adminPassword = process.env.PB_ADMIN_PASSWORD;

  if (!pbUrl || !adminEmail || !adminPassword) {
    console.error('Missing config');
    return;
  }

  const pb = new PocketBase(pbUrl);

  try {
    await pb.admins.authWithPassword(adminEmail, adminPassword);
    console.log('Logged in as PocketBase Admin');

    const users = await pb.collection('users').getFullList();
    console.log('--- USERS ---');
    users.forEach(u => console.log(`- ${u.email} (ID: ${u.id})`));

    const profiles = await pb.collection('profiles').getFullList();
    console.log('--- PROFILES ---');
    profiles.forEach(p => console.log(`- UserID: ${p.user}, Role: ${p.role}, Name: ${p.nom} ${p.prenom}`));

  } catch (err) {
    console.error('Error:', err);
  }
}

checkUsers();
