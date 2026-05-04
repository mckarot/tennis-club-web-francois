
import { NextResponse } from 'next/server';
import dns from 'dns';
import { promisify } from 'util';

const resolve = promisify(dns.resolve4);

export async function GET() {
  try {
    const ips = await resolve('db.madadev972.fr');
    return NextResponse.json({ success: true, ips });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
