'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';

const SUJETS = [
  { value: 'adhesion', label: '🎾 Adhésion & Tarifs', icon: 'sell' },
  { value: 'reservation', label: '📅 Réservation de court', icon: 'calendar_today' },
  { value: 'coaching', label: '🏆 Cours & Coaching', icon: 'school' },
  { value: 'tournoi', label: '🥇 Tournois & Compétitions', icon: 'emoji_events' },
  { value: 'partenariat', label: '🤝 Partenariat & Événement', icon: 'handshake' },
  { value: 'autre', label: '💬 Autre demande', icon: 'chat' },
];

const HORAIRES = [
  { jour: 'Lundi – Vendredi', heure: '08h00 – 20h00' },
  { jour: 'Samedi', heure: '08h00 – 18h00' },
  { jour: 'Dimanche', heure: '09h00 – 14h00' },
  { jour: 'Jours fériés', heure: '09h00 – 13h00' },
];

const FAQ_CONTACT = [
  {
    q: 'Comment rejoindre le club rapidement ?',
    r: 'Créez votre compte en ligne, choisissez votre formule et venez récupérer votre carte de membre dès le lendemain à l\'accueil.',
  },
  {
    q: 'Peut-on essayer les courts avant de s\'inscrire ?',
    r: 'Oui ! Nous offrons une semaine d\'essai en heures creuses aux nouveaux membres. Contactez-nous pour en bénéficier.',
  },
  {
    q: 'Proposez-vous des cours pour les enfants ?',
    r: 'Absolument. Notre monitrice Anaïs Duval propose des stages et cours hebdomadaires pour les 6–17 ans, tous niveaux.',
  },
  {
    q: 'Comment réserver un court ?',
    r: 'Via notre plateforme en ligne disponible 24h/24 ou en appelant l\'accueil pendant les heures d\'ouverture.',
  },
];

export default function ContactPage() {
  const [sujet, setSujet] = useState('adhesion');
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      <Navbar />

      <main className="pt-20">

        {/* ── HERO ─────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-primary py-28 px-6 md:px-8">
          {/* Cercles décoratifs */}
          <div className="pointer-events-none absolute -left-24 -top-24 w-80 h-80 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute -right-16 top-8 w-56 h-56 rounded-full bg-secondary/20" />
          <div className="pointer-events-none absolute right-32 bottom-0 w-40 h-40 rounded-full bg-white/5 translate-y-1/2" />

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-8">
              <span className="material-symbols-outlined text-sm">send</span>
              On vous répond sous 24h
            </span>
            <h1 className="font-headline text-5xl md:text-7xl font-extrabold text-white tracking-tighter mb-6">
              Contactez-nous
            </h1>
            <p className="text-white/60 text-xl max-w-2xl mx-auto leading-relaxed">
              Une question sur nos tarifs, une demande de renseignement ou envie de rejoindre la famille du François ? Notre équipe vous répond rapidement.
            </p>

            {/* 4 info pills */}
            <div className="flex flex-wrap justify-center gap-4 mt-10">
              {[
                { icon: 'phone', label: '+596 596 54 XX XX' },
                { icon: 'mail', label: 'contact@tcfrancois.mq' },
                { icon: 'location_on', label: 'Le François, Martinique' },
                { icon: 'schedule', label: 'Lun–Ven 8h–20h' },
              ].map((p) => (
                <div key={p.label} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 text-white/80 text-sm font-semibold px-5 py-2.5 rounded-full">
                  <span className="material-symbols-outlined text-secondary text-base">{p.icon}</span>
                  {p.label}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CARDS INFOS ──────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 md:px-8 -mt-8 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: 'phone_in_talk',
                titre: 'Téléphone',
                lignes: ['+596 596 54 XX XX', 'Appel & WhatsApp'],
                cta: 'Appeler maintenant',
                ctaHref: 'tel:+596596540000',
                color: 'bg-emerald-50',
                iconColor: 'text-primary',
              },
              {
                icon: 'mail_outline',
                titre: 'E-mail',
                lignes: ['contact@tcfrancois.mq', 'Réponse sous 24h'],
                cta: 'Envoyer un mail',
                ctaHref: 'mailto:contact@tcfrancois.mq',
                color: 'bg-blue-50',
                iconColor: 'text-blue-700',
              },
              {
                icon: 'location_on',
                titre: 'Adresse',
                lignes: ['Presqu\'île de la Cayenne', '97240 Le François'],
                cta: 'Voir sur la carte',
                ctaHref: '#carte',
                color: 'bg-amber-50',
                iconColor: 'text-amber-700',
              },
              {
                icon: 'schedule',
                titre: 'Horaires d\'accueil',
                lignes: ['Lun–Ven : 8h–20h', 'Sam : 8h–18h | Dim : 9h–14h'],
                cta: 'Voir tous les créneaux',
                ctaHref: '#horaires',
                color: 'bg-rose-50',
                iconColor: 'text-rose-700',
              },
            ].map((card) => (
              <div key={card.titre} className="bg-white rounded-[1.5rem] border border-outline-variant/10 shadow-ambient p-7 hover:-translate-y-1 transition-transform duration-300 group">
                <div className={`w-12 h-12 ${card.color} rounded-2xl flex items-center justify-center mb-5`}>
                  <span className={`material-symbols-outlined text-2xl ${card.iconColor}`}>{card.icon}</span>
                </div>
                <h3 className="font-headline text-lg font-extrabold text-primary mb-1">{card.titre}</h3>
                {card.lignes.map((l) => (
                  <p key={l} className="text-sm text-on-surface-variant">{l}</p>
                ))}
                <a
                  href={card.ctaHref}
                  className="inline-flex items-center gap-1 text-secondary text-xs font-bold mt-4 hover:underline"
                >
                  {card.cta}
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* ── FORMULAIRE + INFOS LATÉRALES ─────────────────── */}
        <section className="max-w-7xl mx-auto px-6 md:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">

            {/* Formulaire (3/5) */}
            <div className="lg:col-span-3 bg-white rounded-[2rem] border border-outline-variant/10 shadow-ambient p-10">
              {submitted ? (
                /* Success state */
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-4xl text-primary">check_circle</span>
                  </div>
                  <h2 className="font-headline text-2xl font-extrabold text-primary mb-3">Message envoyé !</h2>
                  <p className="text-on-surface-variant max-w-xs leading-relaxed">
                    Merci pour votre message. Notre équipe vous répondra dans les 24h ouvrées.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-8 bg-primary text-white px-8 py-3 rounded-full font-bold text-sm hover:-translate-y-0.5 transition-transform"
                  >
                    Envoyer un autre message
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-8">
                    <p className="text-secondary font-black text-xs uppercase tracking-[0.2em] mb-2">Formulaire de contact</p>
                    <h2 className="font-headline text-3xl font-extrabold text-primary">Écrivez-nous</h2>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Choix du sujet */}
                    <div>
                      <label className="block text-sm font-bold text-primary mb-3">Sujet de votre demande</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {SUJETS.map((s) => (
                          <button
                            key={s.value}
                            type="button"
                            onClick={() => setSujet(s.value)}
                            className={`text-left px-4 py-3 rounded-2xl border-2 text-sm font-semibold transition-all duration-200 ${
                              sujet === s.value
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-outline-variant/20 text-on-surface-variant hover:border-primary/30'
                            }`}
                          >
                            <span className="block text-base mb-1">
                              {s.label.split(' ')[0]}
                            </span>
                            <span className="text-xs leading-tight">
                              {s.label.substring(s.label.indexOf(' ') + 1)}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Nom & Prénom */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="prenom" className="block text-sm font-bold text-primary mb-2">Prénom</label>
                        <input
                          id="prenom"
                          type="text"
                          required
                          placeholder="Jean"
                          className="w-full px-5 py-3.5 rounded-2xl border border-outline-variant/20 bg-surface text-on-surface text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-on-surface-variant/40"
                        />
                      </div>
                      <div>
                        <label htmlFor="nom" className="block text-sm font-bold text-primary mb-2">Nom</label>
                        <input
                          id="nom"
                          type="text"
                          required
                          placeholder="Dupont"
                          className="w-full px-5 py-3.5 rounded-2xl border border-outline-variant/20 bg-surface text-on-surface text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-on-surface-variant/40"
                        />
                      </div>
                    </div>

                    {/* Email & Téléphone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="email" className="block text-sm font-bold text-primary mb-2">E-mail</label>
                        <input
                          id="email"
                          type="email"
                          required
                          placeholder="jean@exemple.fr"
                          className="w-full px-5 py-3.5 rounded-2xl border border-outline-variant/20 bg-surface text-on-surface text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-on-surface-variant/40"
                        />
                      </div>
                      <div>
                        <label htmlFor="tel" className="block text-sm font-bold text-primary mb-2">Téléphone <span className="text-on-surface-variant/50 font-normal">(optionnel)</span></label>
                        <input
                          id="tel"
                          type="tel"
                          placeholder="+596 6XX XX XX XX"
                          className="w-full px-5 py-3.5 rounded-2xl border border-outline-variant/20 bg-surface text-on-surface text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-on-surface-variant/40"
                        />
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="message" className="block text-sm font-bold text-primary mb-2">Votre message</label>
                      <textarea
                        id="message"
                        required
                        rows={5}
                        placeholder="Dites-nous comment nous pouvons vous aider…"
                        className="w-full px-5 py-4 rounded-2xl border border-outline-variant/20 bg-surface text-on-surface text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none placeholder:text-on-surface-variant/40"
                      />
                    </div>

                    {/* Consentement */}
                    <div className="flex items-start gap-3">
                      <input
                        id="consentement"
                        type="checkbox"
                        required
                        className="mt-0.5 w-4 h-4 rounded accent-primary flex-shrink-0 cursor-pointer"
                      />
                      <label htmlFor="consentement" className="text-xs text-on-surface-variant leading-relaxed cursor-pointer">
                        J'accepte que mes données soient utilisées pour traiter ma demande. Elles ne seront pas transmises à des tiers.{' '}
                        <a href="#" className="text-secondary underline">Politique de confidentialité</a>
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-sm hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-base">send</span>
                      Envoyer le message
                    </button>
                  </form>
                </>
              )}
            </div>

            {/* Infos latérales (2/5) */}
            <div className="lg:col-span-2 space-y-6">

              {/* Contact direct moniteur */}
              <div className="bg-primary rounded-[2rem] p-8 relative overflow-hidden">
                <div className="pointer-events-none absolute -right-12 -top-12 w-40 h-40 rounded-full bg-white/5" />
                <div className="pointer-events-none absolute -left-8 bottom-0 w-32 h-32 rounded-full bg-secondary/20" />
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0">
                      <Image
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBm1p3zHjt6_k1ddE-l_5eBV4GXhI7C5111t4Q4Dzat3FAMObn7_ZtjpxDsXiHxpAiXfATmTQ9WBDqef4533moFDwxsaAt7CsiKpLZIi5CcSXfDrjdXTG7aJsS65OvfukPlgZGIuj3AQpZQsCiSotgGE7LBNKxHa9qEbOmmB84u-97atUAwxwPtOUiAVIY68f-O75nHwu8JlORppX01CrFkfGpFENMqcSGqlBGQsEzZ-ARlgrnXyYRcY2BvK-UT_-BsEhZ_UDx_luE"
                        alt="Stéphane Molina"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-white/50 text-xs uppercase tracking-wider font-bold">Contact direct</p>
                      <p className="text-white font-headline font-extrabold text-lg">Stéphane Molina</p>
                      <p className="text-white/60 text-sm">Directeur Technique</p>
                    </div>
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed mb-6">
                    Pour toute demande urgente ou question sur notre programme de coaching, Stéphane est joignable directement.
                  </p>
                  <a
                    href="tel:+596696000000"
                    className="flex items-center gap-2 bg-secondary text-white px-6 py-3 rounded-full font-bold text-sm w-full justify-center hover:-translate-y-0.5 transition-transform"
                  >
                    <span className="material-symbols-outlined text-base">phone</span>
                    Appeler Stéphane
                  </a>
                </div>
              </div>

              {/* Réseaux sociaux */}
              <div className="bg-white rounded-[2rem] border border-outline-variant/10 shadow-ambient p-8">
                <h3 className="font-headline text-lg font-extrabold text-primary mb-2">Suivez-nous</h3>
                <p className="text-sm text-on-surface-variant mb-5">Actualités, photos et résultats de tournois en temps réel.</p>
                <div className="space-y-3">
                  {[
                    { icon: 'photo_camera', label: 'Instagram', sub: '@tc.francois.mq', color: 'bg-pink-50 text-pink-600' },
                    { icon: 'groups', label: 'Facebook', sub: 'Tennis Club du François', color: 'bg-blue-50 text-blue-600' },
                    { icon: 'videocam', label: 'YouTube', sub: 'Replays & Tutoriels', color: 'bg-red-50 text-red-600' },
                  ].map((rs) => (
                    <a
                      key={rs.label}
                      href="#"
                      className="flex items-center gap-4 p-3 rounded-2xl hover:bg-surface-container-high transition-colors group"
                    >
                      <div className={`w-10 h-10 rounded-xl ${rs.color} flex items-center justify-center flex-shrink-0`}>
                        <span className="material-symbols-outlined text-lg">{rs.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-primary">{rs.label}</p>
                        <p className="text-xs text-on-surface-variant truncate">{rs.sub}</p>
                      </div>
                      <span className="material-symbols-outlined text-on-surface-variant text-sm group-hover:text-secondary transition-colors">arrow_forward</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Horaires */}
              <div id="horaires" className="bg-white rounded-[2rem] border border-outline-variant/10 shadow-ambient p-8">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-base">schedule</span>
                  </div>
                  <h3 className="font-headline text-lg font-extrabold text-primary">Horaires d'accueil</h3>
                </div>
                <div className="space-y-3">
                  {HORAIRES.map((h) => (
                    <div key={h.jour} className="flex justify-between items-center py-2 border-b border-outline-variant/10 last:border-0">
                      <span className="text-sm text-on-surface-variant">{h.jour}</span>
                      <span className="text-sm font-bold text-primary">{h.heure}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CARTE / ACCÈS ─────────────────────────────────── */}
        <section id="carte" className="bg-surface-container-low py-20 px-6 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-secondary font-black text-xs uppercase tracking-[0.25em] mb-3">Localisation</p>
              <h2 className="font-headline text-4xl font-extrabold text-primary">Comment nous trouver</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Infos accès */}
              <div className="space-y-5">
                {[
                  { icon: 'directions_car', titre: 'En voiture', desc: 'Depuis Fort-de-France : N5 direction Le Vauclin, sortie François Est. Parking gratuit sur place (40 places).' },
                  { icon: 'directions_bus', titre: 'En bus', desc: 'Ligne 7 depuis Fort-de-France, arrêt « Mairie du François ». Puis 10 min à pied ou taxi.' },
                  { icon: 'local_taxi', titre: 'En taxi', desc: 'Depuis l\'aéroport Aimé Césaire : environ 40 min. Commande taxi disponible à l\'accueil.' },
                ].map((acc) => (
                  <div key={acc.titre} className="bg-white rounded-2xl border border-outline-variant/10 shadow-ambient p-6 flex gap-4">
                    <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-white text-base">{acc.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-primary text-sm mb-1">{acc.titre}</h4>
                      <p className="text-xs text-on-surface-variant leading-relaxed">{acc.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Image carte */}
              <div className="lg:col-span-2 relative h-80 lg:h-[420px] rounded-[2rem] overflow-hidden shadow-ambient group">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCn_J5NO9AZC7-gr13DGxFi3ZzYP535Q0EP75QJiUfG61SyQ9heQMSibU4CnCQxIE-_qz-EmupJkI2ccOMdvqGiW36By_3emevsSvo0812mOGcSU_rORyohb5lGhkStNDfmBFUVYRFAA6pk_TIBxqp7r3XEGTPUKFQ-expFesTm6w-pohwD136NMn8TfepUxa9vNs8HaIZuJ0Dd7PeBaP9uTNhsD2CGQt4cNrQ7Kd1CkGcgR3xZztRKG1lTZtX2KDg2AfYTGH31Q0A"
                  alt="Localisation Tennis Club du François"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
                <div className="absolute bottom-6 left-6 bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-4">
                  <div className="flex items-center gap-2 text-white font-bold text-sm mb-1">
                    <span className="material-symbols-outlined text-secondary text-base">location_on</span>
                    Tennis Club du François
                  </div>
                  <p className="text-white/60 text-xs">Presqu'île de la Cayenne, 97240 Le François</p>
                </div>
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-5 right-5 bg-white text-primary text-xs font-bold px-4 py-2 rounded-full shadow hover:-translate-y-0.5 transition-transform flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">open_in_new</span>
                  Ouvrir Maps
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ CONTACT ───────────────────────────────────── */}
        <section className="max-w-3xl mx-auto px-6 md:px-8 py-20">
          <div className="text-center mb-12">
            <p className="text-secondary font-black text-xs uppercase tracking-[0.25em] mb-3">Questions fréquentes</p>
            <h2 className="font-headline text-4xl font-extrabold text-primary">Des réponses rapides</h2>
          </div>

          <div className="space-y-4">
            {FAQ_CONTACT.map((faq, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-outline-variant/10 shadow-ambient overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-7 py-5 text-left"
                >
                  <span className="font-bold text-primary text-sm pr-4">{faq.q}</span>
                  <span className={`material-symbols-outlined text-secondary flex-shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-7 pb-6">
                    <p className="text-sm text-on-surface-variant leading-relaxed">{faq.r}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA FINAL ─────────────────────────────────────── */}
        <section className="px-4 md:px-8 pb-24">
          <div className="max-w-5xl mx-auto relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary via-primary to-emerald-800 shadow-2xl shadow-primary/30">
            <div className="pointer-events-none absolute -right-20 -top-20 w-72 h-72 rounded-full bg-white/5" />
            <div className="pointer-events-none absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-secondary/15" />

            <div className="relative z-10 px-10 md:px-16 py-14 text-center">
              <span className="inline-flex items-center gap-2 bg-white/10 text-white/80 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6">
                <span className="material-symbols-outlined text-sm">celebration</span>
                Rejoignez-nous
              </span>
              <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
                Prêt à rejoindre le club ?
              </h2>
              <p className="text-white/60 max-w-xl mx-auto leading-relaxed mb-10">
                Inscrivez-vous en ligne en 2 minutes et profitez d'une semaine d'essai offerte sur les courts.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/login"
                  className="bg-secondary text-white px-10 py-4 rounded-full font-bold text-sm shadow-xl hover:-translate-y-0.5 transition-transform"
                >
                  Créer mon compte
                </Link>
                <Link
                  href="/tarifs"
                  className="glass-panel text-white/90 px-10 py-4 rounded-full font-bold text-sm border border-white/15 hover:bg-white/10 transition-colors"
                >
                  Voir les tarifs
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
