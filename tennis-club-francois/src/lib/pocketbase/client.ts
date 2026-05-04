import PocketBase from 'pocketbase';

export function createClient() {
  return new PocketBase(process.env.NEXT_PUBLIC_PB_URL || process.env.PB_URL);
}
