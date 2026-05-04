
import PocketBase from 'pocketbase';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const pb = new PocketBase(process.env.PB_URL || 'https://db.madadev972.fr');

async function createEventsCollection() {
    try {
        await pb.admins.authWithPassword(
            process.env.PB_ADMIN_EMAIL || 'geminicli@mail.com',
            process.env.PB_ADMIN_PASSWORD || 'Vivegeminicli972!'
        );

        console.log('Authentifié en tant qu\'admin');

        // Définition de la collection club_events
        const collection = {
            name: 'club_events',
            type: 'base',
            schema: [
                { name: 'title', type: 'text', required: true, options: {} },
                { name: 'description', type: 'text', required: true, options: {} },
                { name: 'category', type: 'text', required: true, options: {} },
                { name: 'image', type: 'file', required: false, options: { maxSelect: 1, maxSize: 5242880, mimeTypes: ['image/jpg', 'image/jpeg', 'image/png', 'image/svg+xml', 'image/gif'] } },
                { name: 'participants_count', type: 'number', required: false, options: {} },
                { name: 'is_active', type: 'bool', required: false, options: {} },
                { name: 'link', type: 'url', required: false, options: {} }
            ],
            listRule: '', // Public read
            viewRule: '', // Public view
            createRule: null,
            updateRule: null,
            deleteRule: null,
        };

        try {
            await pb.collections.create(collection);
            console.log('Collection club_events créée avec succès');
        } catch (err: any) {
            if (err.status === 400) {
                console.log('La collection club_events existe déjà, mise à jour...');
                const existing = await pb.collections.getOne('club_events');
                await pb.collections.update(existing.id, collection);
                console.log('Collection club_events mise à jour');
            } else {
                throw err;
            }
        }

        // Ajouter un événement par défaut
        const defaultEvent = {
            title: 'Tournoi de Noël 2024 : Les inscriptions sont ouvertes !',
            description: 'Rejoignez-nous pour la compétition annuelle la plus prestigieuse du club. Places limitées par catégorie.',
            category: 'Événement',
            participants_count: 12,
            is_active: true
        };

        const existingEvents = await pb.collection('club_events').getList(1, 1, {
            filter: `title = "${defaultEvent.title}"`
        });

        if (existingEvents.totalItems === 0) {
            await pb.collection('club_events').create(defaultEvent);
            console.log('Événement par défaut créé');
        } else {
            console.log('L\'événement par défaut existe déjà');
        }

    } catch (error) {
        console.error('Erreur lors de la création de la collection:', error);
    }
}

createEventsCollection();
