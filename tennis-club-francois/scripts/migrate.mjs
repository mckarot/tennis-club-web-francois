import postgres from 'postgres';
const sql = postgres('postgresql://postgres:postgres@localhost:54322/postgres');
try {
  await sql.unsafe(`
    ALTER TABLE reservations 
    ADD COLUMN IF NOT EXISTS course_type text;
    ALTER TABLE reservations 
    ALTER COLUMN course_type SET DEFAULT 'individuel';
    ALTER TABLE reservations 
    ADD COLUMN IF NOT EXISTS student_count integer;
    ALTER TABLE reservations 
    ALTER COLUMN student_count SET DEFAULT 1;
    ALTER TABLE reservations 
    ADD COLUMN IF NOT EXISTS student_name_manual text;
    ALTER TABLE reservations 
    ADD COLUMN IF NOT EXISTS student_level text;
  `);
  console.log('✅ Migration success');
} catch (e) {
  console.error('❌ Migration error:', e);
} finally {
  await sql.end();
}
