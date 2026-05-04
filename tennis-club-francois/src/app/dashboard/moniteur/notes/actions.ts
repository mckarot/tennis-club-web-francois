'use server';

import { createClient, createAdminClient } from '@/lib/pocketbase/server';
import { revalidatePath } from 'next/cache';

export interface StudentNote {
  id: string;
  moniteur: string;
  student: string;
  content: string;
  rating: number;
  created: string;
}

export async function addStudentNote(studentId: string, content: string, rating: number) {
  const pb = await createClient(); const adminPb = await createAdminClient();
  const user = pb.authStore.model;

  if (!user) {
    throw new Error('Non authentifié');
  }

  try {
    await adminPb.collection('student_notes').create({
      moniteur: user.id,
      student: studentId,
      content,
      rating
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la note:', error);
    throw error;
  }

  revalidatePath('/dashboard/moniteur/notes');
  revalidatePath('/dashboard/moniteur/eleves');
}

export async function getStudentNotes(studentId: string): Promise<any[]> {
  const pb = await createClient(); const adminPb = await createAdminClient();
  try {
    const data = await adminPb.collection('student_notes').getFullList({
      filter: `student="${studentId}"`,
      sort: '-created'
    });
    return data.map(n => ({
      ...n,
      created_at: n.created // Keep compatibility if needed, though interface said created_at
    })) || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des notes:', error);
    return [];
  }
}

export async function updateStudentNote(noteId: string, content: string, rating: number) {
  const pb = await createClient(); const adminPb = await createAdminClient();
  const user = pb.authStore.model;

  if (!user) throw new Error('Non authentifié');

  try {
    await adminPb.collection('student_notes').update(noteId, { content, rating });
  } catch (error) {
    throw error;
  }

  revalidatePath('/dashboard/moniteur/notes');
}

export async function deleteStudentNote(noteId: string) {
  const pb = await createClient(); const adminPb = await createAdminClient();
  const user = pb.authStore.model;

  if (!user) throw new Error('Non authentifié');

  try {
    await adminPb.collection('student_notes').delete(noteId);
  } catch (error) {
    throw error;
  }

  revalidatePath('/dashboard/moniteur/notes');
}
