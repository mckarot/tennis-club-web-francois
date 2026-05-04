import PocketBase from 'pocketbase';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Middleware de protection des routes utilisant PocketBase
 */
export async function middleware(request: NextRequest) {
  const pb = new PocketBase(process.env.NEXT_PUBLIC_PB_URL || process.env.PB_URL);

  // Charger la session depuis les cookies
  const authCookie = request.cookies.get('pb_auth');
  if (authCookie) {
    pb.authStore.loadFromCookie(authCookie.value);
  }

  const { pathname } = request.nextUrl;
  const isProtectedRoute = pathname.startsWith('/dashboard');

  // Rediriger vers / si non authentifié et route protégée
  if (!pb.authStore.isValid && isProtectedRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Routes publiques pour redirection si déjà connecté
  const publicRoutes = ['/', '/login', '/register', '/forgot-password'];
  const isPublicRoute = publicRoutes.some((route) => 
    pathname === route || pathname.startsWith('/(auth)/')
  );

  if (pb.authStore.isValid && isPublicRoute) {
    try {
      // Tenter de récupérer le rôle de l'utilisateur
      const user = pb.authStore.model;
      if (user) {
        // On suppose que le rôle est soit sur l'utilisateur, soit dans une collection profiles
        // comme dans la version Supabase
        const profile = await pb.collection('profiles').getFirstListItem(`user="${user.id}"`).catch(() => null);
        const role = profile?.role || user.role || 'membre';

        if (role === 'admin') {
          return NextResponse.redirect(new URL('/dashboard/admin', request.url));
        } else if (role === 'moniteur') {
          return NextResponse.redirect(new URL('/dashboard/moniteur', request.url));
        } else {
          return NextResponse.redirect(new URL('/dashboard/membre', request.url));
        }
      }
    } catch (error) {
      // En cas d'erreur, laisser passer vers le dashboard par défaut
      return NextResponse.redirect(new URL('/dashboard/membre', request.url));
    }
  }

  const response = NextResponse.next();
  
  // Synchroniser le cookie d'authentification
  response.cookies.set('pb_auth', pb.authStore.exportToCookie());

  return response;
}

/**
 * Configuration du matcher pour le middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
