"use client";

import Link from 'next/link';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { motion } from 'framer-motion';
import { MotionViewport } from '@/components/ui/motion-viewport';

const PLANS_ADHESION = [
  {
    id: 'decouverte',
    name: 'Découverte',
    subtitle: 'Parfait pour essayer',
    price: 80,
    period: 'an',
    tag: null,
    color: 'from-slate-50 to-white',
    border: 'border-slate-200/60',
    accent: 'bg-slate-800',
    features: [
      { icon: 'sports_tennis', text: 'Accès aux courts en heures creuses' },
      { icon: 'groups', text: 'Participation aux tournois internes' },
      { icon: 'loyalty', text: 'Carte de membre numérique' },
      { icon: 'event', text: 'Newsletter & actualités du club' },
    ],
    cta: 'Commencer',
  },
  {
    id: 'passion',
    name: 'Passion',
    subtitle: 'Le plus populaire',
    price: 180,
    period: 'an',
    tag: 'Populaire',
    color: 'from-emerald-950 to-emerald-900',
    border: 'border-emerald-800/30',
    accent: 'bg-secondary',
    features: [
      { icon: 'sports_tennis', text: 'Accès illimité aux courts 7j/7' },
      { icon: 'groups', text: 'Tournois internes & externes' },
      { icon: 'lock_open', text: 'Réservation prioritaire en ligne' },
      { icon: 'local_parking', text: 'Parking réservé aux membres' },
      { icon: 'fitness_center', text: 'Accès aux équipements du club' },
      { icon: 'event', text: 'Événements exclusifs membres' },
    ],
    cta: 'Devenir Passion',
  },
  {
    id: 'elite',
    name: 'Elite',
    subtitle: 'L\'expérience complète',
    price: 380,
    period: 'an',
    tag: 'Premium',
    color: 'from-amber-50 to-white',
    border: 'border-amber-200/60',
    accent: 'bg-amber-600',
    features: [
      { icon: 'sports_tennis', text: 'Accès illimité prioritaire toutes heures' },
      { icon: 'emoji_events', text: 'Tournois officiels homologués FFT' },
      { icon: 'school', text: '2 cours collectifs/mois inclus' },
      { icon: 'groups_3', text: 'Coaching personnalisé mensuel' },
      { icon: 'local_parking', text: 'Parking VIP dédié' },
      { icon: 'star', text: 'Accès vestiaires premium' },
      { icon: 'card_giftcard', text: 'Invitations événements partenaires' },
    ],
    cta: 'Devenir Elite',
  },
];

const TARIFS_LOCATION = [
  { heure: 'Lun — Ven 8h–12h', tarif: '8 €', label: 'Heure creuse matin', icon: 'wb_sunny' },
  { heure: 'Lun — Ven 12h–18h', tarif: '12 €', label: 'Heure standard', icon: 'wb_cloudy' },
  { heure: 'Lun — Ven 18h–21h', tarif: '16 €', label: 'Heure de pointe', icon: 'brightness_5' },
  { heure: 'Sam — Dim toute la journée', tarif: '18 €', label: 'Week-end', icon: 'weekend' },
  { heure: 'Jours fériés', tarif: '18 €', label: 'Jours fériés', icon: 'celebration' },
];

const TARIFS_COURS = [
  {
    type: 'Cours individuel',
    icon: 'person',
    duree: '1 heure',
    tarif: '45 €',
    description: 'Accompagnement personnalisé avec un moniteur certifié',
    color: 'bg-emerald-50 text-emerald-900',
    iconColor: 'text-emerald-600',
  },
  {
    type: 'Cours collectif',
    icon: 'groups',
    duree: '1h30',
    tarif: '18 €/pers.',
    description: 'Groupes de 4 à 6 joueurs, tous niveaux',
    color: 'bg-blue-50 text-blue-900',
    iconColor: 'text-blue-600',
  },
  {
    type: 'Stage intensif',
    icon: 'sports_tennis',
    duree: '5 jours',
    tarif: '220 €',
    description: 'Semaine complète, 3h/jour — perfectionnement ou initiation',
    color: 'bg-violet-50 text-violet-900',
    iconColor: 'text-violet-600',
  },
  {
    type: 'Cours enfant (–12 ans)',
    icon: 'child_care',
    duree: '1 heure',
    tarif: '30 €',
    description: 'Initiation au tennis adaptée aux jeunes',
    color: 'bg-amber-50 text-amber-900',
    iconColor: 'text-amber-600',
  },
];

const FAQ = [
  {
    q: 'L\'adhésion donne-t-elle accès à tous les courts ?',
    a: 'Oui, selon votre formule. Les membres Passion et Elite ont accès à l\'ensemble des 5 courts (3 en terre battue, 2 en quick). Les membres Découverte accèdent aux courts en dehors des heures de pointe.',
  },
  {
    q: 'Puis-je annuler ma réservation ?',
    a: 'Les annulations sont possibles jusqu\'à 2h avant le début du créneau. Au-delà, le montant reste dû sauf cas de force majeure.',
  },
  {
    q: 'Les cours de moniteur sont-ils inclus dans l\'abonnement ?',
    a: 'Les cours individuels et collectifs sont facturés en supplément. Seuls les membres Elite bénéficient de 2 cours collectifs mensuels inclus.',
  },
  {
    q: 'Y a-t-il des tarifs réduits pour les familles ?',
    a: 'Oui ! Contactez-nous pour notre offre famille (2 adultes + enfants) qui bénéficie d\'une réduction de 20% sur les adhésions.',
  },
  {
    q: 'Comment réserver un court en ligne ?',
    a: 'Via votre espace membre sur notre application. Les membres Passion et Elite peuvent réserver jusqu\'à 7 jours à l\'avance, Découverte jusqu\'à 48h.',
  },
];

export default function TarifsPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }
    },
  };

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen overflow-hidden">
      <Navbar />

      <main className="pt-20">
        {/* ── HERO ─────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-primary px-8 py-32 text-center">
          {/* Animated Background Orbs */}
          <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="pointer-events-none absolute -left-32 -top-32 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl" 
          />
          <motion.div 
            animate={{ scale: [1.1, 1, 1.1], opacity: [0.1, 0.15, 0.1] }}
            transition={{ duration: 12, repeat: Infinity }}
            className="pointer-events-none absolute -right-24 -bottom-24 w-[400px] h-[400px] rounded-full bg-secondary/20 blur-3xl" 
          />

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative z-10 max-w-4xl mx-auto"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-3 bg-white/5 border border-white/10 text-white/90 px-5 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-8 backdrop-blur-md">
              <span className="material-symbols-outlined text-secondary text-sm">sell</span>
              Saison 2025–2026
            </motion.div>
            
            <motion.h1 
              variants={itemVariants}
              className="font-headline text-white text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8"
            >
              L&apos;Excellence à votre <br />
              <span className="text-secondary drop-shadow-[0_0_20px_rgba(255,193,7,0.3)]">Portée</span>
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-white/60 text-xl max-w-2xl mx-auto font-medium leading-relaxed mb-12"
            >
              Des formules de prestige adaptées à votre jeu. <br />Rejoignez la plus belle communauté de tennis de Martinique.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/login"
                  className="inline-block bg-secondary text-on-secondary px-12 py-5 rounded-full font-black text-lg shadow-2xl shadow-secondary/20 transition-all"
                >
                  Devenir Membre
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <a
                  href="#faq"
                  className="inline-block glass-panel text-white/90 px-12 py-5 rounded-full font-bold text-lg border border-white/10 hover:bg-white/5 transition-all backdrop-blur-sm"
                >
                  Voir la FAQ
                </a>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* ── ADHÉSIONS ────────────────────────────────────── */}
        <section className="px-4 md:px-8 py-32 max-w-7xl mx-auto">
          <MotionViewport direction="up" className="text-center mb-20">
            <p className="text-secondary font-black text-xs uppercase tracking-[0.4em] mb-4">Tarification</p>
            <h2 className="font-headline text-5xl md:text-6xl font-black text-primary tracking-tighter">
              Adhésion <span className="text-secondary-fixed-dim">Annuelle</span>
            </h2>
            <div className="w-20 h-1 bg-secondary mx-auto mt-8 rounded-full opacity-50" />
          </MotionViewport>

          <MotionViewport 
            stagger 
            direction="none" 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch"
          >
            {PLANS_ADHESION.map((plan) => {
              const isPopular = plan.id === 'passion';
              return (
                <motion.div
                  key={plan.id}
                  variants={itemVariants}
                  whileHover={{ y: -12 }}
                  className={`relative rounded-[2.5rem] overflow-hidden border flex flex-col transition-all duration-500 ${plan.border} ${
                    isPopular ? 'shadow-[0_40px_80px_rgba(0,0,0,0.15)] scale-[1.03] z-10' : 'shadow-xl'
                  }`}
                >
                  {plan.tag && (
                    <div className={`absolute top-8 right-8 z-20 ${isPopular ? 'bg-secondary' : 'bg-amber-500'} text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg`}>
                      {plan.tag}
                    </div>
                  )}

                  <div className={`bg-gradient-to-br ${plan.color} p-10 flex-1 flex flex-col relative`}>
                    {isPopular && (
                      <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5" />
                    )}
                    
                    <div className="mb-10 relative z-10">
                      <p className={`text-xs font-black uppercase tracking-[0.25em] mb-2 ${isPopular ? 'text-emerald-300' : 'text-on-surface-variant/60'}`}>
                        {plan.subtitle}
                      </p>
                      <h3 className={`font-headline text-4xl font-black tracking-tighter ${isPopular ? 'text-white' : 'text-primary'}`}>
                        {plan.name}
                      </h3>
                    </div>

                    {/* Prix */}
                    <div className="mb-12 relative z-10">
                      <div className="flex items-end gap-2">
                        <span className={`font-headline text-7xl font-black tracking-tighter ${isPopular ? 'text-white' : 'text-primary'}`}>
                          {plan.price}€
                        </span>
                        <span className={`text-base font-bold mb-4 ${isPopular ? 'text-white/40' : 'text-on-surface-variant/50'}`}>
                          /{plan.period}
                        </span>
                      </div>
                      <p className={`text-sm font-bold ${isPopular ? 'text-white/30' : 'text-on-surface-variant/40'} mt-2`}>
                        Moins de {Math.round(plan.price / 12)}€ par mois
                      </p>
                    </div>

                    {/* Features */}
                    <ul className="space-y-5 flex-1 relative z-10">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-4 group/item">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isPopular ? 'bg-white/10 group-hover/item:bg-secondary' : 'bg-secondary/10 group-hover/item:bg-secondary'}`}>
                            <span className={`material-symbols-outlined text-lg ${isPopular ? 'text-secondary group-hover/item:text-white' : 'text-secondary group-hover/item:text-white'}`}>
                              {f.icon}
                            </span>
                          </div>
                          <span className={`text-sm font-bold tracking-tight ${isPopular ? 'text-white/80' : 'text-on-surface-variant'}`}>
                            {f.text}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mt-12 relative z-10">
                      <Link
                        href="/login"
                        className={`block w-full text-center py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest transition-all shadow-xl ${
                          isPopular
                            ? 'bg-secondary text-on-secondary shadow-secondary/20'
                            : 'bg-primary text-white hover:bg-primary/90'
                        }`}
                      >
                        {plan.cta}
                      </Link>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </MotionViewport>
        </section>

        {/* ── LOCATION DE COURT ────────────────────────────── */}
        <section className="bg-surface-container-low py-32 overflow-hidden">
          <div className="px-4 md:px-8 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <MotionViewport direction="right">
                <p className="text-secondary font-black text-xs uppercase tracking-[0.4em] mb-4">Accessibilité</p>
                <h2 className="font-headline text-5xl md:text-6xl font-black text-primary tracking-tighter mb-8 leading-none">
                  Location de <br /><span className="text-secondary">Courts</span>
                </h2>
                <p className="text-on-surface-variant text-xl leading-relaxed mb-12 font-medium">
                  Liberté totale. Réservez l'un de nos <span className="text-primary font-bold">5 courts de classe mondiale</span> selon vos envies. Éclairage nocturne et entretien quotidien garantis.
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: 'grass', text: '3 Terre Battue', color: 'text-emerald-600' },
                    { icon: 'sports_tennis', text: '2 Quick', color: 'text-blue-600' },
                    { icon: 'light_mode', text: 'Éclairage inclus', color: 'text-amber-500' },
                    { icon: 'schedule', text: '7j/7 - 8h/21h', color: 'text-secondary' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-white/50 backdrop-blur-sm border border-white p-4 rounded-2xl shadow-sm">
                      <span className={`material-symbols-outlined ${item.color}`}>{item.icon}</span>
                      <span className="text-sm font-black text-primary tracking-tight">{item.text}</span>
                    </div>
                  ))}
                </div>
              </MotionViewport>

              {/* Grille des tarifs horaires animée */}
              <MotionViewport stagger direction="left" className="space-y-4">
                {TARIFS_LOCATION.map((t, i) => (
                  <motion.div
                    key={i}
                    variants={itemVariants}
                    whileHover={{ x: 10, backgroundColor: "#fff" }}
                    className="bg-white/40 backdrop-blur-md rounded-[1.5rem] p-6 flex items-center justify-between border border-white shadow-sm transition-all group"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center group-hover:bg-secondary group-hover:scale-110 transition-all duration-500">
                        <span className="material-symbols-outlined text-2xl">{t.icon}</span>
                      </div>
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/60">{t.label}</div>
                        <div className="text-base font-black text-primary mt-1">{t.heure}</div>
                      </div>
                    </div>
                    <div className="font-headline text-3xl font-black text-secondary tracking-tighter">{t.tarif}</div>
                  </motion.div>
                ))}
              </MotionViewport>
            </div>
          </div>
        </section>

        {/* ── COURS & STAGES ───────────────────────────────── */}
        <section className="px-4 md:px-8 py-32 max-w-7xl mx-auto">
          <MotionViewport direction="up" className="text-center mb-20">
            <p className="text-secondary font-black text-xs uppercase tracking-[0.4em] mb-4">Enseignement</p>
            <h2 className="font-headline text-5xl md:text-6xl font-black text-primary tracking-tighter">
              Cours &amp; <span className="text-secondary">Stages</span>
            </h2>
            <p className="text-on-surface-variant mt-6 max-w-2xl mx-auto text-xl font-medium">
              L'expertise de nos moniteurs diplômés au service de votre progression.
            </p>
          </MotionViewport>

          <MotionViewport 
            stagger 
            direction="none" 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {TARIFS_COURS.map((c, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-white rounded-[2rem] border border-outline-variant/5 shadow-2xl p-8 flex flex-col gap-6 group cursor-default"
              >
                <div className={`w-16 h-16 rounded-2xl ${c.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                  <span className={`material-symbols-outlined text-3xl ${c.iconColor}`}>{c.icon}</span>
                </div>
                <div>
                  <h3 className="font-headline text-xl font-black text-primary tracking-tight leading-tight">{c.type}</h3>
                  <p className="text-sm text-on-surface-variant font-medium mt-3 leading-relaxed">{c.description}</p>
                </div>
                <div className="mt-auto pt-6 border-t border-outline-variant/5 flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-on-surface-variant/50">{c.duree}</span>
                  <span className="font-headline text-2xl font-black text-secondary">{c.tarif}</span>
                </div>
              </motion.div>
            ))}
          </MotionViewport>

          {/* Special Pack CTA */}
          <MotionViewport direction="up" delay={0.4} className="mt-16 relative group">
            <div className="absolute inset-0 bg-secondary rounded-[2.5rem] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
            <div className="relative bg-primary rounded-[2.5rem] p-12 flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
              
              <div className="relative z-10">
                <span className="bg-secondary/20 text-secondary text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full border border-secondary/30 mb-6 inline-block">
                  Offre de Bienvenue
                </span>
                <h3 className="font-headline text-3xl md:text-4xl font-black text-white tracking-tighter">Pack Découverte Moniteur</h3>
                <p className="text-white/50 mt-4 text-lg font-medium">5 sessions individuelles × 1h — L&apos;idéal pour démarrer sur de bonnes bases.</p>
              </div>
              
              <div className="flex items-center gap-10 relative z-10 bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-white/30 line-through text-xl font-bold">225 €</div>
                  <div className="font-headline text-5xl font-black text-secondary drop-shadow-lg">175 €</div>
                  <div className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1">35 € / séance</div>
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/login"
                    className="bg-secondary text-on-secondary px-10 py-5 rounded-full font-black text-sm uppercase tracking-widest shadow-xl shadow-secondary/20 block"
                  >
                    En profiter
                  </Link>
                </motion.div>
              </div>
            </div>
          </MotionViewport>
        </section>

        {/* ── FAQ ──────────────────────────────────────────── */}
        <section id="faq" className="px-4 md:px-8 py-32 max-w-4xl mx-auto">
          <MotionViewport direction="up" className="text-center mb-16">
            <p className="text-secondary font-black text-xs uppercase tracking-[0.4em] mb-4">Assistance</p>
            <h2 className="font-headline text-5xl font-black text-primary tracking-tighter leading-none">
              Questions <br /><span className="text-secondary">Fréquentes</span>
            </h2>
          </MotionViewport>

          <MotionViewport stagger direction="up" className="space-y-6">
            {FAQ.map((item, i) => (
              <motion.div 
                key={i} 
                variants={itemVariants}
                whileHover={{ x: 8 }}
                className="bg-white rounded-[2rem] border border-outline-variant/10 shadow-sm p-10 hover:shadow-xl transition-all group"
              >
                <div className="flex items-start gap-8">
                  <span className="flex-shrink-0 w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center font-black text-xl group-hover:bg-secondary group-hover:text-white transition-colors duration-500">{i + 1}</span>
                  <div>
                    <h3 className="text-xl font-black text-primary mb-4 tracking-tight">{item.q}</h3>
                    <p className="text-base text-on-surface-variant leading-relaxed font-medium">{item.a}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </MotionViewport>
        </section>

        {/* ── CTA FINAL ────────────────────────────────────── */}
        <section className="px-4 md:px-8 pb-32">
          <MotionViewport direction="up" className="max-w-5xl mx-auto relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-primary via-primary to-emerald-900 p-20 text-center shadow-[0_50px_100px_rgba(0,0,0,0.3)]">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="pointer-events-none absolute -right-32 -top-32 w-96 h-96 rounded-full bg-white/5 border border-white/5" 
            />
            <div className="pointer-events-none absolute -left-12 -bottom-12 w-64 h-64 rounded-full bg-secondary/10 blur-3xl" />
            
            <div className="relative z-10">
              <h2 className="font-headline text-5xl md:text-7xl font-black text-white tracking-tighter mb-8 leading-none">
                Rejoignez <br />l&apos;élite du <span className="text-secondary">Tennis</span>
              </h2>
              <p className="text-white/50 mb-14 max-w-xl mx-auto text-xl font-medium leading-relaxed">
                Plus qu&apos;une inscription, c&apos;est le début d&apos;une nouvelle aventure sportive dans un cadre idyllique.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/login"
                    className="inline-block bg-secondary text-on-secondary px-14 py-6 rounded-full font-black text-lg uppercase tracking-widest shadow-2xl shadow-secondary/30"
                  >
                    Créer mon compte
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <a
                    href="mailto:contact@tennis-club-francois.fr"
                    className="inline-block glass-panel text-white px-14 py-6 rounded-full font-bold text-lg border border-white/10 hover:bg-white/5 transition-all flex items-center gap-3 justify-center"
                  >
                    <span className="material-symbols-outlined text-2xl">mail</span>
                    Nous écrire
                  </a>
                </motion.div>
              </div>
            </div>
          </MotionViewport>
        </section>
      </main>

      <Footer />
    </div>
  );
}
