'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/pocketbase/server';
import { loginSchema, registerSchema, forgotPasswordSchema } from '@/lib/validators/auth';
import { type ActionResult, success, error, type ErrorCode } from '@/lib/types/actions';

/**
 * Type de retour pour les actions d'authentification
 */
export type AuthResult = ActionResult<{
  user: {
    id: string;
    email: string;
    role?: string;
  };
}>;

/**
 * Action de connexion
 * @param formData - Formulaire avec email et password
 */
export async function loginAction(formData: FormData): Promise<AuthResult> {
  // Validation Zero-Trust des données
  const validatedData = loginSchema.safeParse(
    Object.fromEntries(formData)
  );

  if (!validatedData.success) {
    return error(
      'Validation échouée',
      'VALIDATION_ERROR',
      validatedData.error.flatten().fieldErrors as Record<string, string[]>
    );
  }

  const { email, password } = validatedData.data;

  try {
    const pb = await createClient();

    // Tentative de connexion
    const authData = await pb.collection('users').authWithPassword(email, password);

    if (!pb.authStore.isValid) {
      return error(
        'Identifiants invalides',
        'UNAUTHORIZED'
      );
    }

    // Sauvegarder la session dans les cookies
    const cookieStore = await cookies();
    cookieStore.set('pb_auth', pb.authStore.exportToCookie(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    // Récupérer le rôle depuis la table profiles
    const profile = await pb.collection('profiles')
      .getFirstListItem(`user="${authData.record.id}"`)
      .catch(() => null);

    // Revalidate pour mettre à jour l'UI
    revalidatePath('/', 'layout');

    // Retourner le rôle pour redirection côté client
    return success(
      {
        user: {
          id: authData.record.id,
          email: authData.record.email || email,
          role: profile?.role || (authData.record as any).role,
        },
      },
      'Connexion réussie'
    );
  } catch (err: any) {
    console.error('Erreur de connexion:', err);
    return error(
      err.message || 'Une erreur est survenue lors de la connexion',
      'UNAUTHORIZED'
    );
  }
}

/**
 * Action d'inscription
 * @param formData - Formulaire avec email, password, fullName
 */
export async function registerAction(formData: FormData): Promise<AuthResult> {
  // Validation Zero-Trust des données
  const validatedData = registerSchema.safeParse(
    Object.fromEntries(formData)
  );

  if (!validatedData.success) {
    return error(
      'Validation échouée',
      'VALIDATION_ERROR',
      validatedData.error.flatten().fieldErrors as Record<string, string[]>
    );
  }

  const { email, password, fullName, role } = validatedData.data;

  try {
    const pb = await createClient();

    // Création du compte dans PocketBase
    const data = {
      email,
      password,
      passwordConfirm: password,
      name: fullName,
      role: role ?? 'membre',
    };

    const user = await pb.collection('users').create(data);

    // Créer le profil manuellement (pas de trigger automatique)
    await pb.collection('profiles').create({
      user: user.id,
      full_name: fullName,
      role: role ?? 'membre',
    });

    return success(
      {
        user: {
          id: user.id,
          email: user.email || email,
          role: role ?? 'membre',
        },
      },
      'Compte créé avec succès.'
    );
  } catch (err: any) {
    console.error('Erreur d\'inscription:', err);
    if (err.data?.data?.email?.code === 'validation_not_unique') {
      return error(
        'Cet email est déjà utilisé',
        'CONFLICT'
      );
    }
    return error(
      err.message || 'Une erreur est survenue lors de l\'inscription',
      'INTERNAL_ERROR'
    );
  }
}

/**
 * Action de déconnexion
 */
export async function logoutAction(): Promise<ActionResult<void>> {
  try {
    const pb = await createClient();
    pb.authStore.clear();

    // Supprimer le cookie de session
    const cookieStore = await cookies();
    cookieStore.delete('pb_auth');

    // Revalidate pour mettre à jour l'UI
    revalidatePath('/', 'layout');
  } catch (err) {
    console.error('Erreur de déconnexion:', err);
    return error(
      'Une erreur est survenue lors de la déconnexion',
      'INTERNAL_ERROR'
    );
  }

  redirect('/');
}

/**
 * Action de mot de passe oublié
 * @param formData - Formulaire avec email
 */
export async function forgotPasswordAction(formData: FormData): Promise<ActionResult<void>> {
  // Validation Zero-Trust des données
  const validatedData = forgotPasswordSchema.safeParse(
    Object.fromEntries(formData)
  );

  if (!validatedData.success) {
    return error(
      'Validation échouée',
      'VALIDATION_ERROR',
      validatedData.error.flatten().fieldErrors as Record<string, string[]>
    );
  }

  const { email } = validatedData.data;

  try {
    const pb = await createClient();
    await pb.collection('users').requestPasswordReset(email);

    return success(
      undefined,
      'Email de réinitialisation envoyé'
    );
  } catch (err: any) {
    console.error('Erreur mot de passe oublié:', err);
    return error(
      err.message || 'Une erreur est survenue',
      'INTERNAL_ERROR'
    );
  }
}

/**
 * Action de vérification de session
 * Utile pour vérifier si l'utilisateur est connecté
 */
export async function checkSessionAction(): Promise<
  ActionResult<{
    isAuthenticated: boolean;
    user?: {
      id: string;
      email: string;
      role?: string;
    };
  }>
> {
  try {
    const pb = await createClient();
    
    if (!pb.authStore.isValid) {
      return success({ isAuthenticated: false });
    }

    const user = pb.authStore.model;
    if (!user) {
      return success({ isAuthenticated: false });
    }

    // Récupérer le rôle depuis la table profiles
    const profile = await pb.collection('profiles')
      .getFirstListItem(`user="${user.id}"`)
      .catch(() => null);

    return success({
      isAuthenticated: true,
      user: {
        id: user.id,
        email: user.email || '',
        role: profile?.role || (user as any).role,
      },
    });
  } catch (err) {
    console.error('Erreur vérification session:', err);
    return error(
      'Une erreur est survenue',
      'INTERNAL_ERROR'
    );
  }
}
