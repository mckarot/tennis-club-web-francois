const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  console.log('Sending SQL migration via RPC...');
  const { data, error } = await supabase.rpc('execute_sql', {
    sql: \`
      ALTER TABLE reservations 
      ADD COLUMN IF NOT EXISTS course_type text DEFAULT 'individuel',
      ADD COLUMN IF NOT EXISTS student_count integer DEFAULT 1,
      ADD COLUMN IF NOT EXISTS student_name_manual text,
      ADD COLUMN IF NOT EXISTS student_level text;
    \`
  });

  if (error) {
    console.error('Error executing SQL:', error);
  } else {
    console.log('SQL executed successfully:', data);
  }
}

run();
