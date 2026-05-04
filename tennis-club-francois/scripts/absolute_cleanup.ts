import PocketBase from 'pocketbase';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const pbUrl = process.env.PB_URL || 'https://db.madadev972.fr';
const pbEmail = process.env.PB_ADMIN_EMAIL || 'geminicli@mail.com';
const pbPassword = process.env.PB_ADMIN_PASSWORD || 'Vivegeminicli972!';

async function absoluteCleanup() {
    const pb = new PocketBase(pbUrl);
    await pb.admins.authWithPassword(pbEmail, pbPassword);
    
    console.log('🧹 Starting absolute cleanup...');

    // 1. Delete all reservations
    const reservations = await pb.collection('reservations').getFullList();
    for (const r of reservations) {
        await pb.collection('reservations').delete(r.id);
    }
    console.log(`🗑️ Deleted ${reservations.length} reservations`);

    // 2. Delete all courses
    const cours = await pb.collection('cours').getFullList();
    for (const c of cours) {
        await pb.collection('cours').delete(c.id);
    }
    console.log(`🗑️ Deleted ${cours.length} cours`);

    // 3. Delete all courts
    const courts = await pb.collection('courts').getFullList();
    for (const c of courts) {
        await pb.collection('courts').delete(c.id);
    }
    console.log(`🗑️ Deleted ${courts.length} courts`);

    // 4. Create fresh courts
    const courtData = [
        { nom: 'Court 01', type_surface: 'terre_battue', statut: 'disponible', eclaire: true },
        { nom: 'Court 02', type_surface: 'terre_battue', statut: 'disponible', eclaire: true },
        { nom: 'Court 03', type_surface: 'dur', statut: 'disponible', eclaire: true },
        { nom: 'Court 04', type_surface: 'dur', statut: 'disponible', eclaire: false },
        { nom: 'Court 05', type_surface: 'synthétique', statut: 'disponible', eclaire: true },
        { nom: 'Court 06', type_surface: 'synthétique', statut: 'disponible', eclaire: false },
    ];

    const createdCourts = [];
    for (const c of courtData) {
        const record = await pb.collection('courts').create(c);
        createdCourts.push(record);
        console.log(`✨ Created court ${c.nom}`);
    }

    // 5. Create fresh reservations
    const users = await pb.collection('users').getFullList({ filter: 'role="membre"' });
    if (users.length > 0) {
        for (let i = 0; i < 4; i++) {
            const court = createdCourts[i % createdCourts.length];
            const user = users[i % users.length];
            const start = new Date();
            start.setHours(10 + i, 0, 0, 0);
            const end = new Date(start);
            end.setHours(start.getHours() + 1);

            await pb.collection('reservations').create({
                court: court.id,
                user: user.id,
                date_heure_debut: start.toISOString(),
                date_heure_fin: end.toISOString(),
                type_reservation: 'membre',
                statut: 'confirmee',
                notes: `Réservation propre ${i + 1}`
            });
            console.log(`✅ Created reservation for ${user.email} on ${court.nom}`);
        }
    }

    console.log('🚀 Absolute cleanup and re-seed completed!');
}

absoluteCleanup();
