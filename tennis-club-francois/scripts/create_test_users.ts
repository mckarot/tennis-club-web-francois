import PocketBase from 'pocketbase';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const pbUrl = process.env.PB_URL || 'https://db.madadev972.fr';
const pbEmail = process.env.PB_ADMIN_EMAIL || 'geminicli@mail.com';
const pbPassword = process.env.PB_ADMIN_PASSWORD || 'Vivegeminicli972!';

async function createAdminAndMoniteur() {
    const pb = new PocketBase(pbUrl);
    
    try {
        await pb.admins.authWithPassword(pbEmail, pbPassword);
        console.log('✅ Auth successful');

        const testUsers = [
            { email: 'admin@tennis-club.fr', password: 'Admin123!', role: 'admin', nom: 'Admin', prenom: 'TCF' },
            { email: 'moniteur@tennis-club.fr', password: 'Moniteur123!', role: 'moniteur', nom: 'Coach', prenom: 'Jean' }
        ];

        for (const u of testUsers) {
            let userRecord;
            try {
                userRecord = await pb.collection('users').getFirstListItem(`email="${u.email}"`);
                console.log(`User ${u.email} already exists`);
            } catch (e) {
                userRecord = await pb.collection('users').create({
                    email: u.email,
                    password: u.password,
                    passwordConfirm: u.password,
                    role: u.role,
                    emailVisibility: true
                });
                console.log(`Created user ${u.email}`);
            }

            // Profile
            try {
                await pb.collection('profiles').getFirstListItem(`user="${userRecord.id}"`);
            } catch (e) {
                await pb.collection('profiles').create({
                    user: userRecord.id,
                    nom: u.nom,
                    prenom: u.prenom,
                    role: u.role
                });
                console.log(`Created profile for ${u.email}`);
            }
        }

        console.log('🚀 Test users created!');

    } catch (error: any) {
        console.error('❌ Failed:', error.message);
    }
}

createAdminAndMoniteur();
