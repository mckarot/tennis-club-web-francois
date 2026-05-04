
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMyProfileData, updateProfile, updateAvatar, changePassword, getNotificationSettings, updateNotificationSetting, deleteAccount, type UserProfileData } from '@/app/dashboard/settings-actions';

export default function SettingsPageContent() {
  const [activeTab, setActiveTab] = useState<'profil' | 'securite' | 'notifications'>('profil');
  const [data, setData] = useState<UserProfileData | null>(null);
  const [notifSettings, setNotifSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadData() {
      const result = await getMyProfileData();
      if (result.success) {
        setData(result.data);
      } else {
        console.error('Erreur chargement données:', result.error);
      }

      const notifResult = await getNotificationSettings();
      if (notifResult.success) {
        setNotifSettings(notifResult.data);
      }

      setLoading(false);
    }
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!data) return;

    setSaving(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const updates = {
      nom: formData.get('nom') as string,
      prenom: formData.get('prenom') as string,
      telephone: formData.get('telephone') as string,
      bio: formData.get('bio') as string,
      niveau: formData.get('niveau') as string,
      adresse: formData.get('adresse') as string,
      code_postal: formData.get('code_postal') as string,
      ville: formData.get('ville') as string,
      date_naissance: formData.get('date_naissance') as string,
    };

    const result = await updateProfile(updates);
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Vos informations ont été enregistrées avec succès.' });
    } else {
      setMessage({ type: 'error', text: result.error || 'Une erreur est survenue.' });
    }
    setSaving(false);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSaving(true);
    setMessage(null);

    try {
      // Compression de l'image côté client pour éviter le 413 de PocketBase
      const compressedFile = await compressImage(file);
      const formData = new FormData();
      formData.append('photo_url', compressedFile, 'avatar.jpg');

      const result = await updateAvatar(formData);
      if (result.success && data) {
        setData({ ...data, avatar_url: result.data });
        setMessage({ type: 'success', text: 'Photo de profil mise à jour !' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Erreur lors de l\'envoi' });
      }
    } catch (err) {
      console.error('Erreur compression:', err);
      setMessage({ type: 'error', text: 'Erreur lors de la préparation de l\'image.' });
    }
    setSaving(false);
  };

  // Fonction utilitaire pour compresser l'image
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1024;
          const MAX_HEIGHT = 1024;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const fileName = file.name.split('.')[0] + '.jpg';
              const compressedFile = new File([blob], fileName, { type: 'image/jpeg' });
              resolve(compressedFile);
            }
            else reject(new Error('Canvas toBlob failed'));
          }, 'image/jpeg', 0.8);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const oldPass = formData.get('oldPassword') as string;
    const newPass = formData.get('newPassword') as string;
    const confirmPass = formData.get('confirmPassword') as string;

    if (newPass !== confirmPass) {
      setMessage({ type: 'error', text: 'Les nouveaux mots de passe ne correspondent pas.' });
      setSaving(false);
      return;
    }

    const result = await changePassword(oldPass, newPass);
    if (result.success) {
      setMessage({ type: 'success', text: result.message || 'Mot de passe modifié.' });
      (e.target as HTMLFormElement).reset();
    } else {
      setMessage({ type: 'error', text: result.error || 'Erreur lors du changement.' });
    }
    setSaving(false);
  };

  const handleNotifToggle = async (type: string, canal: 'email' | 'push') => {
    const existing = notifSettings.find(s => s.type_notification === type && s.canal === canal);
    const newValue = existing ? !existing.active : true;

    // Optimistic UI update
    const newSettings = [...notifSettings];
    const index = newSettings.findIndex(s => s.type_notification === type && s.canal === canal);
    if (index > -1) {
      newSettings[index].active = newValue;
    } else {
      newSettings.push({ type_notification: type, canal, active: newValue, type_notification_raw: type });
    }
    setNotifSettings(newSettings);

    const result = await updateNotificationSetting(type, canal, newValue);
    if (!result.success) {
      // Revert on error
      const resetResult = await getNotificationSettings();
      if (resetResult.success) setNotifSettings(resetResult.data);
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour des notifications' });
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Êtes-vous absolument sûr de vouloir supprimer votre compte ? Cette action est irréversible et toutes vos données (réservations, profil) seront perdues.')) {
      return;
    }

    setSaving(true);
    const result = await deleteAccount();
    if (result.success) {
      window.location.href = '/'; // Redirection vers l'accueil après suppression
    } else {
      setMessage({ type: 'error', text: result.error || 'Erreur lors de la suppression' });
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-emerald-900/10 border-t-emerald-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <header className="mb-12">
        <h1 className="font-headline text-4xl font-black text-emerald-950 mb-2 italic tracking-tighter">Paramètres</h1>
        <p className="text-emerald-900/60 font-medium">Gérez vos informations personnelles et vos préférences.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar Mini */}
        <aside className="md:col-span-1 space-y-2">
          <button 
            onClick={() => { setActiveTab('profil'); setMessage(null); }}
            className={`w-full text-left px-6 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all ${
              activeTab === 'profil' 
                ? 'bg-white border border-emerald-900/10 text-emerald-950 shadow-sm ring-1 ring-emerald-900/5' 
                : 'text-emerald-900/40 hover:bg-emerald-900/5'
            }`}
          >
            <span className="material-symbols-outlined">person</span>
            Mon Profil
          </button>
          <button 
            onClick={() => { setActiveTab('securite'); setMessage(null); }}
            className={`w-full text-left px-6 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all ${
              activeTab === 'securite' 
                ? 'bg-white border border-emerald-900/10 text-emerald-950 shadow-sm ring-1 ring-emerald-900/5' 
                : 'text-emerald-900/40 hover:bg-emerald-900/5'
            }`}
          >
            <span className="material-symbols-outlined">security</span>
            Sécurité
          </button>
          <button 
            onClick={() => { setActiveTab('notifications'); setMessage(null); }}
            className={`w-full text-left px-6 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all ${
              activeTab === 'notifications' 
                ? 'bg-white border border-emerald-900/10 text-emerald-950 shadow-sm ring-1 ring-emerald-900/5' 
                : 'text-emerald-900/40 hover:bg-emerald-900/5'
            }`}
          >
            <span className="material-symbols-outlined">notifications</span>
            Notifications
          </button>
        </aside>

        {/* Main Content Area */}
        <div className="md:col-span-2">
          <AnimatePresence mode="wait">
            {activeTab === 'profil' && (
              <motion.div 
                key="profil"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-ambient border border-emerald-900/5"
              >
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Profile Header */}
                  <div className="flex items-center gap-6 pb-8 border-b border-emerald-900/5">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-emerald-900/5 border-4 border-white shadow-xl relative">
                        {data?.avatar_url ? (
                          <img src={data.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-emerald-900 text-white text-2xl font-black italic">
                            {data?.prenom[0]}{data?.nom[0]}
                          </div>
                        )}
                        {saving && (
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center backdrop-blur-[2px]">
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          </div>
                        )}
                      </div>
                      <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 w-8 h-8 bg-secondary text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:scale-110 transition-transform active:scale-95"
                      >
                        <span className="material-symbols-outlined text-sm">photo_camera</span>
                      </button>
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleAvatarChange}
                      />
                    </div>
                    <div>
                      <h3 className="font-headline text-xl font-black text-emerald-950 italic tracking-tighter">{data?.prenom} {data?.nom}</h3>
                      <p className="text-xs font-black uppercase tracking-widest text-emerald-900/40">{data?.role}</p>
                    </div>
                  </div>

                  {message && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-3 ${
                        message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}
                    >
                      <span className="material-symbols-outlined">{message.type === 'success' ? 'check_circle' : 'error'}</span>
                      {message.text}
                    </motion.div>
                  )}

                  {/* Fields Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-emerald-900/40 ml-4">Prénom</label>
                      <input 
                        name="prenom"
                        defaultValue={data?.prenom}
                        className="w-full px-6 py-4 bg-emerald-900/5 rounded-2xl border-2 border-transparent focus:border-secondary focus:bg-white transition-all outline-none font-bold text-emerald-950"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-emerald-900/40 ml-4">Nom</label>
                      <input 
                        name="nom"
                        defaultValue={data?.nom}
                        className="w-full px-6 py-4 bg-emerald-900/5 rounded-2xl border-2 border-transparent focus:border-secondary focus:bg-white transition-all outline-none font-bold text-emerald-950"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-emerald-900/40 ml-4">Email (Lecture seule)</label>
                      <input 
                        disabled
                        value={data?.email}
                        className="w-full px-6 py-4 bg-emerald-900/5 rounded-2xl border-2 border-transparent opacity-50 cursor-not-allowed outline-none font-bold text-emerald-950"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-emerald-900/40 ml-4">Téléphone</label>
                      <input 
                        name="telephone"
                        defaultValue={data?.telephone}
                        placeholder="Ex: 06 00 00 00 00"
                        className="w-full px-6 py-4 bg-emerald-900/5 rounded-2xl border-2 border-transparent focus:border-secondary focus:bg-white transition-all outline-none font-bold text-emerald-950"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-emerald-900/40 ml-4">Date de naissance</label>
                      <input 
                        type="date"
                        name="date_naissance"
                        defaultValue={data?.date_naissance ? new Date(data.date_naissance).toISOString().split('T')[0] : ''}
                        className="w-full px-6 py-4 bg-emerald-900/5 rounded-2xl border-2 border-transparent focus:border-secondary focus:bg-white transition-all outline-none font-bold text-emerald-950"
                      />
                    </div>
                  </div>

                  {/* Address Section */}
                  <div className="space-y-6 pt-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-emerald-900/40 ml-4">Adresse</label>
                      <input 
                        name="adresse"
                        defaultValue={data?.adresse}
                        placeholder="Ex: 123 Rue du Tennis"
                        className="w-full px-6 py-4 bg-emerald-900/5 rounded-2xl border-2 border-transparent focus:border-secondary focus:bg-white transition-all outline-none font-bold text-emerald-950"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-emerald-900/40 ml-4">Code Postal</label>
                        <input 
                          name="code_postal"
                          defaultValue={data?.code_postal}
                          placeholder="Ex: 97240"
                          className="w-full px-6 py-4 bg-emerald-900/5 rounded-2xl border-2 border-transparent focus:border-secondary focus:bg-white transition-all outline-none font-bold text-emerald-950"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-emerald-900/40 ml-4">Ville</label>
                        <input 
                          name="ville"
                          defaultValue={data?.ville}
                          placeholder="Ex: Le François"
                          className="w-full px-6 py-4 bg-emerald-900/5 rounded-2xl border-2 border-transparent focus:border-secondary focus:bg-white transition-all outline-none font-bold text-emerald-950"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section Abonnement & Licence (Membre uniquement) */}
                  {data?.role === 'membre' && (
                    <div className="pt-6 space-y-6">
                      <div className="flex items-center gap-2 pb-2 border-b border-emerald-900/5">
                        <span className="material-symbols-outlined text-emerald-900/40">card_membership</span>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-900/40">Abonnement & Licence</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-3xl bg-emerald-900/5 border border-emerald-900/5 space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-900/30">Type d'abonnement</p>
                          <p className="font-bold text-emerald-950 capitalize">{data?.type_abonnement || 'Standard'}</p>
                        </div>
                        <div className="p-6 rounded-3xl bg-emerald-900/5 border border-emerald-900/5 space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-900/30">Numéro de Licence FFT</p>
                          <p className="font-bold text-emerald-950">{data?.licence_fft || 'Non renseignée'}</p>
                        </div>
                        <div className="p-6 rounded-3xl bg-emerald-900/5 border border-emerald-900/5 flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-900/30">Certificat Médical</p>
                            <p className="font-bold text-emerald-950">{data?.certificat_medical ? 'À jour' : 'Manquant / Expiré'}</p>
                          </div>
                          <span className={`material-symbols-outlined ${data?.certificat_medical ? 'text-emerald-500' : 'text-red-500'}`}>
                            {data?.certificat_medical ? 'check_circle' : 'warning'}
                          </span>
                        </div>
                        <div className="p-6 rounded-3xl bg-emerald-900/5 border border-emerald-900/5 space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-900/30">Niveau de tennis</p>
                          <select 
                            name="niveau"
                            defaultValue={data?.niveau_tennis || data?.niveau}
                            className="w-full bg-transparent outline-none font-bold text-emerald-950 appearance-none"
                          >
                            <option value="">Non renseigné</option>
                            <option value="debutant">Débutant</option>
                            <option value="intermediaire">Intermédiaire</option>
                            <option value="avance">Avancé</option>
                            <option value="competition">Compétition</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-emerald-900/40 ml-4">Bio / Présentation</label>
                    <textarea 
                      name="bio"
                      defaultValue={data?.bio}
                      rows={4}
                      placeholder="Racontez-nous votre parcours tennis..."
                      className="w-full px-6 py-4 bg-emerald-900/5 rounded-3xl border-2 border-transparent focus:border-secondary focus:bg-white transition-all outline-none font-bold text-emerald-950 resize-none"
                    />
                  </div>

                  <div className="pt-6">
                    <button 
                      type="submit"
                      disabled={saving}
                      className="w-full py-5 bg-emerald-950 text-white rounded-full font-black uppercase tracking-widest text-sm hover:shadow-2xl hover:shadow-emerald-950/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                      {saving ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-sm">save</span>
                          Enregistrer les modifications
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {activeTab === 'securite' && (
              <motion.div 
                key="securite"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-ambient border border-emerald-900/5"
              >
                <form onSubmit={handlePasswordSubmit} className="space-y-8">
                  <div className="pb-6 border-b border-emerald-900/5">
                    <h3 className="font-headline text-xl font-black text-emerald-950 italic tracking-tighter">Sécurité du compte</h3>
                    <p className="text-emerald-900/40 text-sm font-medium">Modifiez votre mot de passe pour sécuriser votre accès.</p>
                  </div>

                  {message && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-3 ${
                        message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}
                    >
                      <span className="material-symbols-outlined">{message.type === 'success' ? 'check_circle' : 'error'}</span>
                      {message.text}
                    </motion.div>
                  )}

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-emerald-900/40 ml-4">Mot de passe actuel</label>
                      <input 
                        type="password"
                        name="oldPassword"
                        required
                        className="w-full px-6 py-4 bg-emerald-900/5 rounded-2xl border-2 border-transparent focus:border-secondary focus:bg-white transition-all outline-none font-bold text-emerald-950"
                      />
                    </div>

                    <div className="w-full h-px bg-emerald-900/5 my-4" />

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-emerald-900/40 ml-4">Nouveau mot de passe</label>
                      <input 
                        type="password"
                        name="newPassword"
                        required
                        className="w-full px-6 py-4 bg-emerald-900/5 rounded-2xl border-2 border-transparent focus:border-secondary focus:bg-white transition-all outline-none font-bold text-emerald-950"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-emerald-900/40 ml-4">Confirmer le nouveau mot de passe</label>
                      <input 
                        type="password"
                        name="confirmPassword"
                        required
                        className="w-full px-6 py-4 bg-emerald-900/5 rounded-2xl border-2 border-transparent focus:border-secondary focus:bg-white transition-all outline-none font-bold text-emerald-950"
                      />
                    </div>
                  </div>

                  <div className="pt-6">
                    <button 
                      type="submit"
                      disabled={saving}
                      className="w-full py-5 bg-emerald-950 text-white rounded-full font-black uppercase tracking-widest text-sm hover:shadow-2xl hover:shadow-emerald-950/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                      {saving ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-sm">lock_reset</span>
                          Changer le mot de passe
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Danger Zone */}
                <div className="mt-12 pt-12 border-t-2 border-red-100 space-y-6">
                  <div className="flex items-center gap-3 text-red-600">
                    <span className="material-symbols-outlined">warning</span>
                    <h3 className="font-headline text-xl font-black italic tracking-tighter">Zone de danger</h3>
                  </div>
                  
                  <div className="p-8 rounded-[2rem] bg-red-50 border-2 border-red-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-1 text-center md:text-left">
                      <h4 className="font-bold text-red-900">Supprimer mon compte</h4>
                      <p className="text-sm text-red-900/60 leading-relaxed">
                        Cette action est définitive. Toutes vos données seront effacées de nos serveurs.
                      </p>
                    </div>
                    <button 
                      type="button"
                      onClick={handleDeleteAccount}
                      disabled={saving}
                      className="px-8 py-4 bg-red-600 text-white rounded-full font-black uppercase tracking-widest text-xs hover:bg-red-700 hover:shadow-xl hover:shadow-red-600/20 transition-all active:scale-95 disabled:opacity-50"
                    >
                      Supprimer définitivement
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div 
                key="notifications"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-ambient border border-emerald-900/5"
              >
                <div className="space-y-8">
                  <div className="pb-6 border-b border-emerald-900/5">
                    <h3 className="font-headline text-xl font-black text-emerald-950 italic tracking-tighter">Préférences de notifications</h3>
                    <p className="text-emerald-900/40 text-sm font-medium">Choisissez comment vous souhaitez être informé des activités du club.</p>
                  </div>

                  <div className="space-y-6">
                    {[
                      { id: 'resa', label: 'Réservations de courts', desc: 'Confirmations, rappels et annulations de vos créneaux.' },
                      { id: 'club', label: 'Actualités du club', desc: 'Événements, tournois et informations importantes.' },
                      { id: 'cours', label: 'Cours & Stages', desc: 'Nouveaux créneaux disponibles et suivi de vos inscriptions.' }
                    ].map((item) => {
                      const isEmailActive = notifSettings.find(s => s.type_notification === item.id && s.canal === 'email')?.active;
                      const isPushActive = notifSettings.find(s => s.type_notification === item.id && s.canal === 'push')?.active;
                      
                      return (
                        <div key={item.id} className="flex items-center justify-between p-4 rounded-3xl bg-emerald-900/5">
                          <div className="space-y-1">
                            <h4 className="font-bold text-emerald-950">{item.label}</h4>
                            <p className="text-xs text-emerald-900/40">{item.desc}</p>
                          </div>
                          <div className="flex gap-4">
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-[8px] font-black uppercase text-emerald-900/30">Email</span>
                              <button 
                                onClick={() => handleNotifToggle(item.id, 'email')}
                                className={`w-12 h-6 rounded-full relative transition-colors ${isEmailActive ? 'bg-emerald-950' : 'bg-emerald-900/10'}`}
                              >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${isEmailActive ? 'right-1' : 'left-1'}`} />
                              </button>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-[8px] font-black uppercase text-emerald-900/30">Push</span>
                              <button 
                                onClick={() => handleNotifToggle(item.id, 'push')}
                                className={`w-12 h-6 rounded-full relative transition-colors ${isPushActive ? 'bg-emerald-950' : 'bg-emerald-900/10'}`}
                              >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${isPushActive ? 'right-1' : 'left-1'}`} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-6 rounded-3xl bg-secondary/5 border-2 border-secondary/10">
                    <div className="flex gap-4">
                      <span className="material-symbols-outlined text-secondary">info</span>
                      <p className="text-sm text-emerald-950/70 leading-relaxed">
                        Les notifications critiques (sécurité du compte, modifications d'abonnement) sont envoyées automatiquement et ne peuvent pas être désactivées.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
