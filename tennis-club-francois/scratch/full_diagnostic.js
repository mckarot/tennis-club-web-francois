
const PocketBase = require('pocketbase/cjs');
require('dotenv').config();

const pbUrl = 'https://db.madadev972.fr';
const pb = new PocketBase(pbUrl);

async function exportConfig() {
    console.log('--- DIAGNOSTIC POCKETBASE ---');
    try {
        await pb.admins.authWithPassword(
            process.env.PB_ADMIN_EMAIL,
            process.env.PB_ADMIN_PASSWORD
        );
        
        const collections = await pb.collections.getFullList();
        
        const report = collections.map(c => ({
            name: c.name,
            id: c.id,
            rules: {
                list: c.listRule,
                view: c.viewRule,
                create: c.createRule,
                update: c.updateRule,
                delete: c.deleteRule
            },
            fields: c.schema.map(f => `${f.name} (${f.type})`)
        }));

        console.log(JSON.stringify(report, null, 2));
        console.log('--- FIN DU DIAGNOSTIC ---');

    } catch (error) {
        console.error('Erreur :', error.message);
    }
}

exportConfig();
