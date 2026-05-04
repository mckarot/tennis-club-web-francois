/**
 * Types de réponse uniformes pour les Server Actions
 * Pattern: { success: boolean, data?, error?, code?, message? }
 */

/**
 * Codes d'erreur standardisés
 */
export type ErrorCode =
  | 'UNAUTHORIZED'        // Session invalide ou absente
  | 'FORBIDDEN'          // Rôle insuffisant
  | 'VALIDATION_ERROR'   // Échec validation Zod
  | 'DATABASE_ERROR'     // Erreur PocketBase
  | 'NOT_FOUND'          // Ressource inexistante
  | 'CONFLICT'           // Doublon (unique constraint)
  | 'BAD_REQUEST'        // Requête mal formée
  | 'INTERNAL_ERROR'     // Erreur serveur inattendue
  | 'EMAIL_EXISTS'       // Email déjà enregistré
  | 'AUTH_ERROR';        // Erreur authentification

/**
 * Type de réponse pour les Server Actions
 */
export type ActionResult<T> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; code: ErrorCode; details?: Record<string, string[]> };

/**
 * Helper pour créer une réponse de succès
 */
export function success<T>(data: T, message?: string): ActionResult<T> {
  return { success: true, data, message };
}

/**
 * Helper pour créer une réponse d'erreur
 */
export function error<T = never>(
  message: string,
  code: ErrorCode,
  details?: Record<string, string[]>
): ActionResult<T> {
  return { success: false, error: message, code, details };
}

/**
 * Type pour les formulaires avec useActionState
 */
export type FormState<T> = {
  errors?: Record<string, string[]>;
  message?: string;
  data?: T;
};
