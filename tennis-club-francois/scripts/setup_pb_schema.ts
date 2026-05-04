import PocketBase from 'pocketbase';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const pbUrl = process.env.PB_URL || 'https://db.madadev972.fr';
const pbEmail = process.env.PB_ADMIN_EMAIL || 'geminicli@mail.com';
const pbPassword = process.env.PB_ADMIN_PASSWORD || 'Vivegeminicli972!';

async function setup() {
    const pb = new PocketBase(pbUrl);
    
    try {
        console.log('🔗 Connecting to PocketBase...');
        await pb.admins.authWithPassword(pbEmail, pbPassword);
        console.log('✅ Auth successful');

        const uColl = await pb.collections.getOne('users');

        // Helper to create collection if not exists
        const ensureCollection = async (config: any) => {
            try {
                const existing = await pb.collections.getOne(config.name);
                console.log(`📦 Collection ${config.name} already exists`);
                existing.schema = config.schema;
                await pb.collections.update(existing.id, existing);
                console.log(`✅ Updated ${config.name} schema`);
            } catch (e) {
                await pb.collections.create(config);
                console.log(`✨ Created collection ${config.name}`);
            }
        };

        // 1. Update system users collection to add role
        console.log('👤 Updating users collection...');
        const hasRole = uColl.schema.find(f => f.name === 'role');
        if (!hasRole) {
            uColl.schema.push({
                name: 'role',
                type: 'select',
                required: true,
                options: {
                    values: ['admin', 'moniteur', 'eleve', 'guest', 'membre'],
                    maxSelect: 1
                }
            } as any);
            await pb.collections.update(uColl.id, uColl);
            console.log('✅ Added role field to users');
        }

        // 2. profiles
        await ensureCollection({
            name: 'profiles',
            type: 'base',
            schema: [
                { name: 'user', type: 'relation', required: true, options: { collectionId: uColl.id, maxSelect: 1 } },
                { name: 'nom', type: 'text', required: true, options: {} },
                { name: 'prenom', type: 'text', required: true, options: {} },
                { name: 'telephone', type: 'text', options: {} },
                { name: 'adresse', type: 'text', options: {} },
                { name: 'code_postal', type: 'text', options: {} },
                { name: 'ville', type: 'text', options: {} },
                { name: 'date_naissance', type: 'date', options: {} },
                { name: 'photo_url', type: 'url', options: {} },
                { name: 'bio', type: 'text', options: {} },
                { name: 'role', type: 'text', options: {} }
            ]
        });

        // 3. member_profiles
        await ensureCollection({
            name: 'member_profiles',
            type: 'base',
            schema: [
                { name: 'user', type: 'relation', required: true, options: { collectionId: uColl.id, maxSelect: 1 } },
                { name: 'niveau_tennis', type: 'select', options: { values: ['débutant', 'intermédiaire', 'avancé', 'pro'], maxSelect: 1 } },
                { name: 'statut_adhesion', type: 'select', options: { values: ['actif', 'inactif', 'en_attente'], maxSelect: 1 } },
                { name: 'type_abonnement', type: 'select', options: { values: ['standard', 'premium', 'vip'], maxSelect: 1 } },
                { name: 'date_inscription', type: 'date', options: {} },
                { name: 'heures_jouees_mois', type: 'number', options: {} },
                { name: 'licence_fft', type: 'text', options: {} },
                { name: 'certificat_medical', type: 'bool', options: {} },
                { name: 'date_certificat', type: 'date', options: {} },
                { name: 'telephone', type: 'text', options: {} },
                { name: 'adresse', type: 'text', options: {} },
                { name: 'ville', type: 'text', options: {} },
                { name: 'code_postal', type: 'text', options: {} },
                { name: 'date_naissance', type: 'date', options: {} }
            ]
        });

        // 4. coach_profiles
        await ensureCollection({
            name: 'coach_profiles',
            type: 'base',
            schema: [
                { name: 'user', type: 'relation', required: true, options: { collectionId: uColl.id, maxSelect: 1 } },
                { name: 'certification', type: 'text', options: {} },
                { name: 'specialite', type: 'text', options: {} },
                { name: 'annees_experience', type: 'number', options: {} },
                { name: 'disponibilites', type: 'json', options: { maxSize: 2000000 } }
            ]
        });

        // 5. courts
        await ensureCollection({
            name: 'courts',
            type: 'base',
            schema: [
                { name: 'nom', type: 'text', required: true, unique: true, options: {} },
                { name: 'type_surface', type: 'select', options: { values: ['quick', 'terre_battue', 'dur', 'synthétique'], maxSelect: 1 } },
                { name: 'statut', type: 'select', options: { values: ['disponible', 'occupe', 'maintenance'], maxSelect: 1 } },
                { name: 'eclaire', type: 'bool', options: {} }
            ]
        });

        // 6. reservations
        const courtsColl = await pb.collections.getOne('courts');
        await ensureCollection({
            name: 'reservations',
            type: 'base',
            schema: [
                { name: 'court', type: 'relation', required: true, options: { collectionId: courtsColl.id, maxSelect: 1 } },
                { name: 'user', type: 'relation', required: true, options: { collectionId: uColl.id, maxSelect: 1 } },
                { name: 'moniteur', type: 'relation', options: { collectionId: uColl.id, maxSelect: 1 } },
                { name: 'date_heure_debut', type: 'date', required: true, options: {} },
                { name: 'date_heure_fin', type: 'date', required: true, options: {} },
                { name: 'type_reservation', type: 'select', options: { values: ['membre', 'entrainement', 'tournoi', 'libre', 'cours'], maxSelect: 1 } },
                { name: 'statut', type: 'select', options: { values: ['confirmee', 'en_attente', 'annulee', 'terminee'], maxSelect: 1 } },
                { name: 'notes', type: 'text', options: {} }
            ]
        });

        // 12. student_notes
        await ensureCollection({
            name: 'student_notes',
            type: 'base',
            schema: [
                { name: 'moniteur', type: 'relation', required: true, options: { collectionId: uColl.id, maxSelect: 1 } },
                { name: 'student', type: 'relation', required: true, options: { collectionId: uColl.id, maxSelect: 1 } },
                { name: 'content', type: 'text', required: true, options: {} },
                { name: 'rating', type: 'number', options: {} }
            ]
        });

        // 7. reservation_participants
        const reservationsColl = await pb.collections.getOne('reservations');
        await ensureCollection({
            name: 'reservation_participants',
            type: 'base',
            schema: [
                { name: 'reservation', type: 'relation', required: true, options: { collectionId: reservationsColl.id, maxSelect: 1 } },
                { name: 'user', type: 'relation', required: true, options: { collectionId: uColl.id, maxSelect: 1 } }
            ]
        });

        // 8. cours
        await ensureCollection({
            name: 'cours',
            type: 'base',
            schema: [
                { name: 'moniteur', type: 'relation', required: true, options: { collectionId: uColl.id, maxSelect: 1 } },
                { name: 'court', type: 'relation', required: true, options: { collectionId: courtsColl.id, maxSelect: 1 } },
                { name: 'titre', type: 'text', required: true, options: {} },
                { name: 'description', type: 'text', options: {} },
                { name: 'date_heure_debut', type: 'date', required: true, options: {} },
                { name: 'date_heure_fin', type: 'date', required: true, options: {} },
                { name: 'type_cours', type: 'select', required: true, options: { values: ['particulier', 'groupe', 'stage', 'perfectionnement'], maxSelect: 1 } },
                { name: 'niveau_requis', type: 'select', options: { values: ['tous', 'débutant', 'intermédiaire', 'avancé'], maxSelect: 1 } },
                { name: 'capacite_max', type: 'number', options: {} }
            ]
        });

        // 9. cours_inscriptions
        const coursColl = await pb.collections.getOne('cours');
        await ensureCollection({
            name: 'cours_inscriptions',
            type: 'base',
            schema: [
                { name: 'cours', type: 'relation', required: true, options: { collectionId: coursColl.id, maxSelect: 1 } },
                { name: 'eleve', type: 'relation', required: true, options: { collectionId: uColl.id, maxSelect: 1 } },
                { name: 'statut', type: 'select', options: { values: ['inscrit', 'en_attente', 'annule'], maxSelect: 1 } }
            ]
        });

        // 10. club_settings
        await ensureCollection({
            name: 'club_settings',
            type: 'base',
            schema: [
                { name: 'nom_club', type: 'text', required: true, options: {} },
                { name: 'description', type: 'text', options: {} },
                { name: 'tarif_standard', type: 'number', options: {} },
                { name: 'tarif_premium', type: 'number', options: {} },
                { name: 'horaire_ouverture_lundi', type: 'text', options: {} },
                { name: 'horaire_fermeture_lundi', type: 'text', options: {} },
                { name: 'horaire_ouverture_samedi', type: 'text', options: {} },
                { name: 'horaire_fermeture_samedi', type: 'text', options: {} },
                { name: 'horaire_ouverture_dimanche', type: 'text', options: {} },
                { name: 'horaire_fermeture_dimanche', type: 'text', options: {} }
            ]
        });

        // 11. notifications
        await ensureCollection({
            name: 'notifications',
            type: 'base',
            schema: [
                { name: 'user', type: 'relation', required: true, options: { collectionId: uColl.id, maxSelect: 1 } },
                { name: 'type_notification', type: 'select', required: true, options: { values: ['reservation', 'annulation', 'cours', 'promo'], maxSelect: 1 } },
                { name: 'canal', type: 'select', required: true, options: { values: ['email', 'push', 'sms'], maxSelect: 1 } },
                { name: 'active', type: 'bool', options: {} }
            ]
        });

        // SEED DATA
        console.log('🌱 Seeding courts...');
        const courtData = [
            { nom: 'Court 01', type_surface: 'terre_battue', statut: 'disponible', eclaire: true },
            { nom: 'Court 02', type_surface: 'terre_battue', statut: 'disponible', eclaire: true },
            { nom: 'Court 03', type_surface: 'dur', statut: 'disponible', eclaire: true },
            { nom: 'Court 04', type_surface: 'dur', statut: 'disponible', eclaire: false },
            { nom: 'Court 05', type_surface: 'synthétique', statut: 'disponible', eclaire: true },
            { nom: 'Court 06', type_surface: 'synthétique', statut: 'disponible', eclaire: false },
        ];

        for (const court of courtData) {
            try {
                await pb.collection('courts').getFirstListItem(`nom="${court.nom}"`);
            } catch (e) {
                await pb.collection('courts').create(court);
                console.log(`Created court ${court.nom}`);
            }
        }

        console.log('🌱 Seeding users...');
        const usersData = [
            { email: 'marie.laurent@email.com', nom: 'Laurent', prenom: 'Marie', role: 'membre', niveau: 'intermédiaire' },
            { email: 'marc.petit@email.com', nom: 'Petit', prenom: 'Marc', role: 'membre', niveau: 'avancé' },
            { email: 'sophie.marechal@email.com', nom: 'Maréchal', prenom: 'Sophie', role: 'membre', niveau: 'débutant' },
        ];

        for (const u of usersData) {
            let userRecord;
            try {
                userRecord = await pb.collection('users').getFirstListItem(`email="${u.email}"`);
            } catch (e) {
                userRecord = await pb.collection('users').create({
                    email: u.email,
                    password: 'Membre123!',
                    passwordConfirm: 'Membre123!',
                    role: u.role,
                    emailVisibility: true
                });
                console.log(`Created user ${u.email}`);
            }

            try {
                await pb.collection('profiles').getFirstListItem(`user="${userRecord.id}"`);
            } catch (e) {
                await pb.collection('profiles').create({
                    user: userRecord.id,
                    nom: u.nom,
                    prenom: u.prenom,
                    role: u.role
                });
            }

            try {
                await pb.collection('member_profiles').getFirstListItem(`user="${userRecord.id}"`);
            } catch (e) {
                await pb.collection('member_profiles').create({
                    user: userRecord.id,
                    niveau_tennis: u.niveau,
                    statut_adhesion: 'actif'
                });
            }
        }

        console.log('🚀 Setup completed successfully!');

    } catch (error: any) {
        console.error('❌ Setup failed:', error.message);
        if (error.data) {
            console.error('Data:', JSON.stringify(error.data, null, 2));
        }
    }
}

setup();
