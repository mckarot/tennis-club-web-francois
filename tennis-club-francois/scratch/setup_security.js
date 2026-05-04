
const PocketBase = require('pocketbase/cjs');
require('dotenv').config();

const pbUrl = 'https://db.madadev972.fr';
const pb = new PocketBase(pbUrl);

async function setupRules() {
    console.log('--- CONFIGURATION DES REGLES DE SECURITE ---');
    try {
        await pb.admins.authWithPassword(
            process.env.PB_ADMIN_EMAIL,
            process.env.PB_ADMIN_PASSWORD
        );
        
        // 1. Courts : Visibles par tous
        await pb.collections.update('51k6rnfmqhsnjch', {
            listRule: "", 
            viewRule: ""
        });
        console.log('✅ Courts : Visibles par tous');

        // 2. Réservations : Utilisateurs connectés
        await pb.collections.update('epnokq26knfsvxn', {
            listRule: "user = @request.auth.id",
            viewRule: "user = @request.auth.id",
            createRule: "@request.auth.id != \"\"",
            updateRule: "user = @request.auth.id"
        });
        console.log('✅ Réservations : Sécurisées (Propriétaire uniquement)');

        // 3. Coachs : Visibles par tous
        await pb.collections.update('lp2dczg5x6xoaoj', {
            listRule: "", 
            viewRule: ""
        });
        console.log('✅ Coachs : Visibles par tous');

        // 4. Paramètres du club : Visibles par tous
        await pb.collections.update('50cladhby9z20d3', {
            listRule: "", 
            viewRule: ""
        });
        console.log('✅ Club Settings : Visibles par tous');

        console.log('\n--- TERMINÉ : VOTRE BASE EST PRÊTE ! ---');

    } catch (error) {
        console.error('❌ Erreur lors de la configuration :', error.message);
    }
}

setupRules();
