const postgres = require('postgres');

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('❌ DATABASE_URL is missing!');
  process.exit(1);
}

const sql = postgres(url);

async function setup() {
  console.log('🚀 Setting up student_notes table (v3)...');
  try {
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS public.student_notes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          moniteur_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
          student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          rating INTEGER DEFAULT 0,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      ALTER TABLE public.student_notes ENABLE ROW LEVEL SECURITY;

      DO $$
      BEGIN
          IF NOT EXISTS (
              SELECT 1 FROM pg_policies 
              WHERE tablename = 'student_notes' AND policyname = 'Moniteurs can manage their notes'
          ) THEN
              CREATE POLICY \"Moniteurs can manage their notes\" ON public.student_notes
                  FOR ALL
                  USING (auth.uid() = moniteur_id)
                  WITH CHECK (auth.uid() = moniteur_id);
          END IF;

          IF NOT EXISTS (
              SELECT 1 FROM pg_policies 
              WHERE tablename = 'student_notes' AND policyname = 'Students can read notes about them'
          ) THEN
              CREATE POLICY \"Students can read notes about them\" ON public.student_notes
                  FOR SELECT
                  USING (auth.uid() = student_id);
          END IF;
      END
      $$;
    `);
    console.log('✅ Table and policies created successfully!');
  } catch (error) {
    console.error('❌ Error creating table:', error);
  } finally {
    await sql.end();
  }
}

setup();
