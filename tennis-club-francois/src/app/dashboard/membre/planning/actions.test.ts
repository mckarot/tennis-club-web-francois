import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getWeeklyPlanningData, createReservationAction } from './actions';
import { createClient } from '@/lib/pocketbase/server';
// Mocking dependencies
vi.mock('@/lib/pocketbase/server');

describe('Planning Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getWeeklyPlanningData', () => {
    it('returns UNAUTHORIZED if user is not logged in', async () => {
      (createClient as any).mockResolvedValue({
        authStore: { model: null }
      });
      
      const res = await getWeeklyPlanningData(new Date().toISOString(), new Date().toISOString());
      expect(res.success).toBe(false);
      expect(res.code).toBe('UNAUTHORIZED');
    });

    it('returns planning data for valid authenticared user', async () => {
      (createClient as any).mockResolvedValue({
        authStore: { model: { id: 'test-user' } }
      });

      const res = await getWeeklyPlanningData(new Date().toISOString(), new Date().toISOString());
       // On check si la validation zod bloque ou si on passe (ici avec des dates ISO valides ça passe)
      // Ici on pourrait simuler un créneau déjà pris en changeant le retour de PocketBase
    });
  });
});
