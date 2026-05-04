import PocketBase from 'pocketbase';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function fixProfiles() {
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
    
    for (const user of users) {
      // Check if profile exists
      try {
        await pb.collection('profiles').getFirstListItem(`user="${user.id}"`);
        console.log(`Profile already exists for ${user.email}`);
      } catch (err) {
        console.log(`Creating profile for ${user.email} (${user.role})...`);
        const nameParts = user.email.split('@')[0].split('.');
        const prenom = nameParts[0] || 'User';
        const nom = nameParts[1] || 'Club';
        
        await pb.collection('profiles').create({
          user: user.id,
          nom: nom.charAt(0).toUpperCase() + nom.slice(1),
          prenom: prenom.charAt(0).toUpperCase() + prenom.slice(1),
          role: user.role || 'membre',
        });
        console.log(`Profile created for ${user.email}`);
      }
    }

  } catch (err) {
    console.error('Error:', err);
  }
}

fixProfiles();
