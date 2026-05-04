
const PocketBase = require('pocketbase/cjs');
require('dotenv').config();

let pbUrl = process.env.PB_URL || 'https://db.madadev972.fr';
pbUrl = pbUrl.replace('/_/', '');

const pb = new PocketBase(pbUrl);

async function updateEventsCollection() {
    try {
        await pb.admins.authWithPassword(
            process.env.PB_ADMIN_EMAIL,
            process.env.PB_ADMIN_PASSWORD
        );

        console.log('Authentifié en tant qu\'admin');

        const existing = await pb.collections.getOne('club_events');
        
        // Ajouter le champ details au schéma existant
        const newSchema = [
            ...existing.schema,
            { name: 'details', type: 'text', required: false, options: {} }
        ];

        await pb.collections.update(existing.id, {
            schema: newSchema
        });

        console.log('Collection club_events mise à jour avec le champ "details"');

        // Mettre à jour l'événement par défaut avec un exemple de détails
        const event = await pb.collection('club_events').getFirstListItem('is_active = true');
        await pb.collection('club_events').update(event.id, {
            details: "### But du tournoi\nCélébrer la fin d'année dans la convivialité.\n\n### Modalités\n- Format : Double mixte\n- Inscription : 15€ par personne\n- Date limite : 20 décembre\n\n### Contact\nPour vous inscrire, contactez Marie au 06 00 00 00 00 ou venez directement au Club House."
        });
        
        console.log('Événement mis à jour avec les détails par défaut');

    } catch (error) {
        console.error('Erreur:', error.message, error.data);
    }
}

updateEventsCollection();
