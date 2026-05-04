'use client';

import { useState, useEffect } from 'react';
import { addStudentNote, getStudentNotes, updateStudentNote, deleteStudentNote, type StudentNote } from './actions';

interface Student {
  id: string;
  nom: string;
  prenom: string;
}

// Inline SVG components to avoid lucide-react dependency issues
const IconStar = ({ fill = 'transparent', className = '' }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const IconSave = ({ className = '' }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v13a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

const IconTrash = ({ className = '' }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const IconEdit = ({ className = '' }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const IconX = ({ className = '' }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconPlus = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export default function NoteForm({ students }: { students: Student[] }) {
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState<StudentNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editRating, setEditRating] = useState(0);

  useEffect(() => {
    if (selectedStudentId) {
      loadNotes();
    }
  }, [selectedStudentId]);

  async function loadNotes() {
    setLoading(true);
    try {
      const data = await getStudentNotes(selectedStudentId);
      setNotes(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      await addStudentNote(selectedStudentId, content, rating);
      setContent('');
      setRating(0);
      await loadNotes();
    } catch (error) {
      console.error(error);
      alert('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(noteId: string) {
    setLoading(true);
    try {
      await updateStudentNote(noteId, editContent, editRating);
      setEditingNoteId(null);
      await loadNotes();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(noteId: string) {
    if (!confirm('Supprimer cette note ?')) return;
    setLoading(true);
    try {
      await deleteStudentNote(noteId);
      await loadNotes();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const startEdit = (note: StudentNote) => {
    setEditingNoteId(note.id);
    setEditContent(note.content);
    setEditRating(note.rating);
  };

  return (
    <div className="space-y-8">
      {/* Sélecteur d'élève */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <label className="block text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">
          Élève concerné
        </label>
        <select
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
          className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#c5eadf] focus:border-transparent transition-all text-gray-900 font-medium"
        >
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.prenom} {s.nom}
            </option>
          ))}
        </select>
      </div>

      {/* Formulaire Nouvelle Note */}
      <div className="bg-[#01261f] p-8 rounded-[32px] text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <IconPlus size={120} className="text-[#c5eadf]" />
        </div>
        
        <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <IconPlus className="text-[#c5eadf]" size={24} />
              Ajouter une note
            </h3>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Conseils techniques, points à améliorer, progression..."
              className="w-full min-h-[120px] p-5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:ring-2 focus:ring-[#c5eadf] focus:border-transparent transition-all resize-none"
            />
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-sm text-white/50 mb-3 uppercase tracking-widest font-bold">Évaluation</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    className="transition-transform active:scale-95"
                  >
                    <IconStar
                      fill={s <= rating ? '#D4AF37' : 'transparent'}
                      className={s <= rating ? 'text-[#D4AF37]' : 'text-white/20'}
                    />
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="px-8 py-4 bg-[#c5eadf] text-[#00201a] font-black rounded-full hover:scale-105 transition-all shadow-[0_4px_20px_rgba(197,234,223,0.3)] flex items-center justify-center gap-2 uppercase tracking-tighter"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <IconSave className="mr-2" />
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Liste des Notes (Le Carnet) */}
      <div className="space-y-4">
        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 px-2">
          Carnet de suivi
          <span className="text-sm font-bold bg-[#c5eadf] text-[#00201a] px-3 py-1 rounded-full">
            {notes.length} note{notes.length > 1 ? 's' : ''}
          </span>
        </h2>

        {loading && notes.length === 0 ? (
          <div className="py-20 text-center animate-pulse text-gray-400 font-medium">Chargement des notes...</div>
        ) : notes.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-100 rounded-[32px] p-12 text-center text-gray-300 font-medium">
            Aucune note pour cet élève. Commencez par en ajouter une !
          </div>
        ) : (
          <div className="grid gap-4">
            {notes.map((note) => (
              <div 
                key={note.id} 
                className={`group bg-white p-6 rounded-[24px] border transition-all ${
                  editingNoteId === note.id ? 'border-[#c5eadf] ring-1 ring-[#c5eadf]' : 'border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-md'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    {editingNoteId === note.id ? (
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 mb-4 focus:ring-1 focus:ring-[#c5eadf] resize-none text-gray-900"
                        rows={3}
                      />
                    ) : (
                      <p className="text-gray-800 leading-relaxed font-medium whitespace-pre-wrap">
                        {note.content}
                      </p>
                    )}
                    
                    <div className="mt-4 flex items-center gap-4 flex-wrap">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        {new Date(note.created).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>

                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((s) => {
                          const currentVal = editingNoteId === note.id ? editRating : note.rating;
                          return (
                            <button
                              key={s}
                              type="button"
                              onClick={() => editingNoteId === note.id && setEditRating(s)}
                              className={editingNoteId === note.id ? 'cursor-pointer transition-transform hover:scale-110' : 'cursor-default'}
                            >
                              <IconStar
                                fill={s <= currentVal ? '#D4AF37' : 'transparent'}
                                className={s <= currentVal ? 'text-[#D4AF37]' : 'text-gray-200'}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {editingNoteId === note.id ? (
                      <>
                         <button
                          onClick={() => handleUpdate(note.id)}
                          className="p-3 rounded-xl bg-[#c5eadf] text-[#00201a] hover:scale-105 transition-transform"
                          title="Sauvegarder"
                        >
                          <IconSave />
                        </button>
                        <button
                          onClick={() => setEditingNoteId(null)}
                          className="p-3 rounded-xl bg-gray-100 text-gray-600 hover:scale-105 transition-transform"
                          title="Annuler"
                        >
                          <IconX />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(note)}
                          className="p-3 rounded-xl bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-black transition-all"
                          title="Modifier"
                        >
                          <IconEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(note.id)}
                          className="p-3 rounded-xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"
                          title="Supprimer"
                        >
                          <IconTrash />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
