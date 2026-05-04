import { createClient } from '@/lib/pocketbase/server';
import { redirect } from 'next/navigation';

export async function POST() {
  const pb = await createClient();
  pb.authStore.clear();
  redirect('/login');
}
