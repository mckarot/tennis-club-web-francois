import PocketBase from 'pocketbase';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const pbUrl = process.env.PB_URL || 'https://db.madadev972.fr';
const pbEmail = process.env.PB_ADMIN_EMAIL || 'geminicli@mail.com';
const pbPassword = process.env.PB_ADMIN_PASSWORD || 'Vivegeminicli972!';

async function seedReservations() {
    const pb = new PocketBase(pbUrl);
    
    try {
        await pb.admins.authWithPassword(pbEmail, pbPassword);
        console.log('✅ Auth successful');

        const courts = await pb.collection('courts').getFullList();
        const users = await pb.collection('users').getFullList({ filter: 'role="membre"' });

        if (courts.length === 0 || users.length === 0) {
            console.error('❌ No courts or users found');
            return;
        }

        console.log('🌱 Seeding reservations...');
        for (let i = 0; i < 5; i++) {
            const court = courts[i % courts.length];
            const user = users[i % users.length];
            
            const start = new Date();
            start.setDate(start.getDate() + i + 1);
            start.setHours(10, 0, 0, 0);
            
            const end = new Date(start);
            end.setHours(11, 30, 0, 0);

            await pb.collection('reservations').create({
                court: court.id,
                user: user.id,
                date_heure_debut: start.toISOString(),
                date_heure_fin: end.toISOString(),
                type_reservation: 'membre',
                statut: 'confirmee',
                notes: `Réservation de test ${i + 1}`
            });
            console.log(`Created reservation for ${user.email} on ${court.nom}`);
        }

        console.log('🚀 Reservations seeded!');

    } catch (error: any) {
        console.error('❌ Seeding failed:', error.message);
    }
}

seedReservations();
