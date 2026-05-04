export type UserRole = 'admin' | 'membre' | 'moniteur';

export const ROLES: Record<string, UserRole> = {
  ADMIN: 'admin',
  MEMBRE: 'membre',
  MONITEUR: 'moniteur',
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrateur',
  membre: 'Membre',
  moniteur: 'Moniteur / Coach',
};
