import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';

export const metadata = {
  title: 'Découvrir le Club — Tennis Club du François',
  description: 'Plongez dans l\'univers du Tennis Club du François : nos terrains, notre équipe, notre histoire et nos valeurs au cœur de la Martinique.',
};

const VALEURS = [
  { icon: 'eco', title: 'Éco-responsabilité', desc: 'Énergie 100% solaire, zéro plastique, jardins botaniques intégrés. Nous respectons la nature martiniquaise qui nous accueille.', color: 'bg-emerald-50 text-emerald-700' },
  { icon: 'diversity_3', title: 'Communauté', desc: 'Un club ouvert à tous — juniors, seniors, compétiteurs ou loisir. Plus de 300 membres partageant la même passion.', color: 'bg-blue-50 text-blue-700' },
  { icon: 'emoji_events', title: 'Excellence', desc: 'Moniteurs certifiés FFT, surfaces entretenues quotidiennement, équipements de niveau professionnel.', color: 'bg-amber-50 text-amber-700' },
  { icon: 'favorite', title: 'Bien-être', desc: 'Lounge, bar à jus frais, espaces de détente ombragés. La performance et la sérénité vont de pair ici.', color: 'bg-rose-50 text-rose-700' },
];

const CHIFFRES = [
  { value: '5', label: 'Courts', sub: 'dont 3 terre battue' },
  { value: '300+', label: 'Membres', sub: 'passionnés actifs' },
  { value: '8', label: 'Moniteurs', sub: 'certifiés FFT' },
  { value: '1978', label: 'Fondation', sub: 'plus de 45 ans d\'histoire' },
];

const EQUIPE = [
  {
    prenom: 'Stéphane', nom: 'Molina', role: 'Directeur Technique',
    spec: 'Formateur national, ex-joueur classé 4/6',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBm1p3zHjt6_k1ddE-l_5eBV4GXhI7C5111t4Q4Dzat3FAMObn7_ZtjpxDsXiHxpAiXfATmTQ9WBDqef4533moFDwxsaAt7CsiKpLZIi5CcSXfDrjdXTG7aJsS65OvfukPlgZGIuj3AQpZQsCiSotgGE7LBNKxHa9qEbOmmB84u-97atUAwxwPtOUiAVIY68f-O75nHwu8JlORppX01CrFkfGpFENMqcSGqlBGQsEzZ-ARlgrnXyYRcY2BvK-UT_-BsEhZ_UDx_luE',
    badge: 'Direction',
    badgeColor: 'bg-primary text-white',
  },
  {
    prenom: 'Anaïs', nom: 'Duval', role: 'Monitrice Jeunes',
    spec: 'Spécialiste initiation enfants & ados 7–17 ans',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCm9O-b1weJV_XhaWv6ReIcTAz9pAJNM9sdwyGdH0u948YoUqiS3st8KHihW4-o-A110ALtU-H0O5S23AZFD02DDga8OmQo5h2dKnD9_Fr3YUdgVuDF4jHsKTK1nOYd98qQeCTcJ9JBc-1YsO8TwHPNVf2FrHEKnZqA1VrkwaZqVKgoE9WQZQypxXiK7wMjaw6AMh2xGDJgL9A-Z-HVKI9Bs073PZ6ssT2T2bn6GJOHcJheEcAfnzNcS0diO0nB13VnfzqyzqWqt-M',
    badge: 'Jeunes',
    badgeColor: 'bg-secondary text-white',
  },
  {
    prenom: 'Marc', nom: 'Joseph', role: 'Coach Compétition',
    spec: 'Préparateur physique & tactique, tournois AFT',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6lj7h_A68mQYrJttfIBEGNRUn0QQZIHXzBnUptn2G3ZthiIavfYpgu2hlAwVzqxoKKQlx5NAiILUUuBgKROvDhr59Z1YA4ry7BjpkSpW30KjnDKqtRwo7yA5k54ymRlzjn9NGIjqWcVXC2udhD3h8kLE5OGzcD5vYV_73twB8aC__QsUhni2rBWNdpWx-AbyUWh4hZqTBcauaxNxGrzsubAgdHKrY-kelV1v490pYtr4Y9Hji7oCRVd1PvzXg3sXBr-w5ltOTbD0',
    badge: 'Compétition',
    badgeColor: 'bg-amber-600 text-white',
  },
];

const INSTALLATIONS = [
  { icon: 'grass', titre: 'Courts Terre Battue', desc: '3 courts en latérite rouge, arrosage automatique, éclairage LED solaire.', detail: '× 3 courts' },
  { icon: 'sports_tennis', titre: 'Courts Quick (Résine)', desc: '2 courts en résine perméable, disponibles toute l\'année — idéaux pour les tournois.', detail: '× 2 courts' },
  { icon: 'fitness_center', titre: 'Salle de Préparation', desc: 'Musculation, cardio, salle de vidéo-analyse. Accès réservé aux membres Passion & Elite.', detail: '120 m²' },
  { icon: 'local_bar', titre: 'Lounge & Bar', desc: 'Vue panoramique sur les courts, cocktails et jus tropicaux frais, snacking healthy.', detail: 'Ouvert 7j/7' },
  { icon: 'shower', titre: 'Vestiaires Premium', desc: 'Vestiaires climatisés avec casiers sécurisés, douches et espace bien-être.', detail: '2 espaces' },
  { icon: 'local_parking', titre: 'Parking Sécurisé', desc: 'Parking privatif ombragé de 40 places, avec bornes de recharge pour véhicules électriques.', detail: '40 places' },
];

const TIMELINE = [
  { year: '1978', title: 'Fondation', desc: 'Création du club par un groupe de passionnés martiniquais. 2 courts en terre battue et 50 membres fondateurs.' },
  { year: '1992', title: 'Premiers Tournois', desc: 'Lancement du tournoi de la Baie, devenu l\'une des compétitions régionales les plus prisées.' },
  { year: '2008', title: 'Extension & Modernisation', desc: 'Construction de 3 nouveaux courts, du club-house et de la salle de préparation physique.' },
  { year: '2019', title: 'Virage Éco-Responsable', desc: 'Installation de panneaux solaires, suppression du plastique à usage unique, certification GREEN CLUB.' },
  { year: '2024', title: 'Club Numérique', desc: 'Lancement de la plateforme de réservation en ligne, app mobile et gestion digitale des membres.' },
];

export default function ClubPage() {
  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      <Navbar />

      <main className="pt-20">

        {/* ── HERO IMMERSIF ────────────────────────────────── */}
        <section className="relative h-[85vh] min-h-[600px] overflow-hidden">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvcBUGChZKc2SvxLW3SEYvCSOQLDqo9JT0LzyiT35ZEMdz09Ee4u6pfJDifrtm0JxXpJ-ai3CFTj_SaQUxvRxGvBwj47H1iYTMjoCXFRO_xkvsJO3eSp3DX2hoqlz7dzLxUdDtiK0zwrrhU-uKdly3-913Kv6HYku0hZEWdOVEGItd-hIFlCnsdlRERgn3DN2KgFuV4SnSY7UXV8cQtg1mD_QaHjrCVv1VnuHBZyz0I8a5nOV-az_Ewrd3FNUego3aDHbmw60C7yA"
            alt="Vue aérienne du club de tennis"
            fill
            className="object-cover object-center"
            priority
          />
          {/* Gradient double couche */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent" />

          {/* Content */}
          <div className="absolute inset-0 flex items-center px-8 md:px-16">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 bg-secondary text-white text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
                <span className="material-symbols-outlined text-sm">location_on</span>
                Le François, Martinique
              </span>
              <h1 className="font-headline text-white text-5xl md:text-7xl font-extrabold tracking-tighter leading-none mb-6">
                Un club<br />à part entière.
              </h1>
              <p className="text-white/70 text-xl leading-relaxed max-w-lg mb-10">
                Fondé en 1978, le Tennis Club du François est bien plus qu'un terrain de jeu. C'est un patrimoine vivant, une famille, un art de vivre sous les alizés martiniquais.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/login"
                  className="bg-secondary text-white px-8 py-4 rounded-full font-bold text-sm shadow-xl hover:-translate-y-0.5 transition-transform"
                >
                  Rejoindre le club
                </Link>
                <a
                  href="#histoire"
                  className="glass-panel text-white/90 px-8 py-4 rounded-full font-bold text-sm border border-white/15 hover:bg-white/10 transition-colors"
                >
                  Notre histoire
                </a>
              </div>
            </div>
          </div>

          {/* Floating stats cards */}
          <div className="absolute bottom-8 right-8 md:right-16 grid grid-cols-2 gap-3 hidden md:grid">
            {CHIFFRES.map((c) => (
              <div key={c.label} className="glass-panel border border-white/10 rounded-2xl px-5 py-4 text-center backdrop-blur-md">
                <div className="font-headline text-2xl font-black text-secondary">{c.value}</div>
                <div className="text-white text-xs font-bold uppercase tracking-wider">{c.label}</div>
                <div className="text-white/40 text-[10px] mt-0.5">{c.sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CHIFFRES (mobile) ────────────────────────────── */}
        <section className="md:hidden bg-primary px-6 py-8 grid grid-cols-2 gap-4">
          {CHIFFRES.map((c) => (
            <div key={c.label} className="bg-white/10 rounded-2xl px-4 py-5 text-center">
              <div className="font-headline text-3xl font-black text-secondary">{c.value}</div>
              <div className="text-white text-xs font-bold uppercase tracking-wider">{c.label}</div>
              <div className="text-white/40 text-[10px] mt-0.5">{c.sub}</div>
            </div>
          ))}
        </section>

        {/* ── INTRO + VALEURS ──────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 md:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Texte */}
            <div>
              <p className="text-secondary font-black text-xs uppercase tracking-[0.25em] mb-3">Notre identité</p>
              <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-primary tracking-tight leading-tight mb-6">
                L'élégance du sport,<br />
                <span className="text-secondary">la force de la Martinique.</span>
              </h2>
              <p className="text-on-surface-variant text-lg leading-relaxed mb-5">
                Au Tennis Club du François, chaque échange est une invitation au dépassement. Niché entre mangroves et baies turquoise, notre club cultive une approche unique où performance sportive et vivre ensemble se nourrissent mutuellement.
              </p>
              <p className="text-on-surface-variant leading-relaxed mb-8">
                Depuis 1978, nous accueillons débutants, passionnés et compétiteurs dans un cadre exceptionnel : des courts irréprochables, des moniteurs diplômés d'État et une communauté chaleureuse qui fait la réputation du club bien au-delà de la Martinique.
              </p>
              <Link
                href="/tarifs"
                className="inline-flex items-center gap-2 bg-primary text-white px-7 py-3.5 rounded-full font-bold text-sm hover:-translate-y-0.5 transition-transform shadow-md"
              >
                <span className="material-symbols-outlined text-base">sell</span>
                Voir les tarifs
              </Link>
            </div>

            {/* Valeurs en grid 2×2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {VALEURS.map((v) => (
                <div
                  key={v.title}
                  className="bg-white border border-outline-variant/10 rounded-[1.5rem] p-7 shadow-ambient hover:-translate-y-1 transition-transform duration-300"
                >
                  <div className={`w-12 h-12 rounded-2xl ${v.color} flex items-center justify-center mb-4`}>
                    <span className="material-symbols-outlined text-2xl">{v.icon}</span>
                  </div>
                  <h3 className="font-headline text-lg font-extrabold text-primary mb-2">{v.title}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── GALERIE BENTO ────────────────────────────────── */}
        <section className="py-20 bg-surface-container-low">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <div className="flex justify-between items-end mb-12">
              <div>
                <p className="text-secondary font-black text-xs uppercase tracking-[0.25em] mb-2">Atmosphère</p>
                <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-primary tracking-tight">Vivez le club</h2>
              </div>
              <Link href="/login" className="hidden md:flex items-center gap-2 text-primary font-bold hover:text-secondary transition-colors">
                Réserver un court
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>

            {/* Bento 4 colonnes × 2 rangées */}
            <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-5 md:h-[720px]">
              {/* Grande image gauche */}
              <div className="md:col-span-2 md:row-span-2 relative rounded-[1.5rem] overflow-hidden bento-card-hover shadow-ambient group">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvcBUGChZKc2SvxLW3SEYvCSOQLDqo9JT0LzyiT35ZEMdz09Ee4u6pfJDifrtm0JxXpJ-ai3CFTj_SaQUxvRxGvBwj47H1iYTMjoCXFRO_xkvsJO3eSp3DX2hoqlz7dzLxUdDtiK0zwrrhU-uKdly3-913Kv6HYku0hZEWdOVEGItd-hIFlCnsdlRERgn3DN2KgFuV4SnSY7UXV8cQtg1mD_QaHjrCVv1VnuHBZyz0I8a5nOV-az_Ewrd3FNUego3aDHbmw60C7yA"
                  alt="Courts vus du ciel"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent" />
                <div className="absolute bottom-8 left-8">
                  <span className="bg-secondary text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3 inline-block">Vue panoramique</span>
                  <h3 className="text-white text-3xl font-headline font-bold">Les 5 courts<br />du club</h3>
                </div>
              </div>

              {/* Image haut droite */}
              <div className="md:col-span-2 relative rounded-[1.5rem] overflow-hidden bento-card-hover shadow-ambient group">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBm1p3zHjt6_k1ddE-l_5eBV4GXhI7C5111t4Q4Dzat3FAMObn7_ZtjpxDsXiHxpAiXfATmTQ9WBDqef4533moFDwxsaAt7CsiKpLZIi5CcSXfDrjdXTG7aJsS65OvfukPlgZGIuj3AQpZQsCiSotgGE7LBNKxHa9qEbOmmB84u-97atUAwxwPtOUiAVIY68f-O75nHwu8JlORppX01CrFkfGpFENMqcSGqlBGQsEzZ-ARlgrnXyYRcY2BvK-UT_-BsEhZ_UDx_luE"
                  alt="Tournoi de la Baie"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 glass-panel opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                  <h4 className="text-white text-xl font-headline font-bold">Tournois de la Baie</h4>
                </div>
              </div>

              {/* Bas droite — Club house */}
              <div className="md:col-span-1 relative rounded-[1.5rem] overflow-hidden bento-card-hover shadow-ambient group">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCm9O-b1weJV_XhaWv6ReIcTAz9pAJNM9sdwyGdH0u948YoUqiS3st8KHihW4-o-A110ALtU-H0O5S23AZFD02DDga8OmQo5h2dKnD9_Fr3YUdgVuDF4jHsKTK1nOYd98qQeCTcJ9JBc-1YsO8TwHPNVf2FrHEKnZqA1VrkwaZqVKgoE9WQZQypxXiK7wMjaw6AMh2xGDJgL9A-Z-HVKI9Bs073PZ6ssT2T2bn6GJOHcJheEcAfnzNcS0diO0nB13VnfzqyzqWqt-M"
                  alt="Club House"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute bottom-4 left-4">
                  <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full">Club House</span>
                </div>
              </div>

              {/* Bas droite — Éco CTA */}
              <div className="md:col-span-1 bg-primary rounded-[1.5rem] bento-card-hover shadow-ambient flex items-center justify-center p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/20 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="relative z-10">
                  <span className="material-symbols-outlined text-secondary text-4xl mb-3 block">eco</span>
                  <h4 className="text-white text-lg font-headline font-bold">Green Club</h4>
                  <p className="text-white/50 text-xs mt-1.5">Certifié 100% éco-responsable</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── INSTALLATIONS ────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 md:px-8 py-24">
          <div className="text-center mb-16">
            <p className="text-secondary font-black text-xs uppercase tracking-[0.25em] mb-3">Infrastructure</p>
            <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-primary tracking-tight">
              Nos installations
            </h2>
            <p className="text-on-surface-variant mt-4 max-w-lg mx-auto">
              Du court à la salle de préparation, en passant par le lounge — tout est pensé pour votre confort et votre progression.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {INSTALLATIONS.map((inst, i) => (
              <div
                key={i}
                className="bg-white rounded-[1.5rem] border border-outline-variant/10 shadow-ambient p-8 group hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/3 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-secondary/5 transition-colors" />
                <div className="w-14 h-14 bg-primary-container rounded-2xl flex items-center justify-center mb-6 group-hover:bg-secondary transition-colors duration-300">
                  <span className="material-symbols-outlined text-white text-2xl">{inst.icon}</span>
                </div>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="font-headline text-xl font-extrabold text-primary leading-tight">{inst.titre}</h3>
                  <span className="flex-shrink-0 bg-surface-container-high text-on-surface-variant text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider">
                    {inst.detail}
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed">{inst.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── ÉQUIPE ───────────────────────────────────────── */}
        <section className="bg-primary py-24 px-6 md:px-8 overflow-hidden relative">
          <div className="pointer-events-none absolute -left-32 top-0 w-96 h-96 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute -right-24 bottom-0 w-80 h-80 rounded-full bg-secondary/20" />

          <div className="relative z-10 max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-secondary font-black text-xs uppercase tracking-[0.25em] mb-3">Les visages du club</p>
              <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                Notre équipe
              </h2>
              <p className="text-white/50 mt-4 max-w-lg mx-auto">
                Des professionnels passionnés qui donnent au club son âme et son niveau d'excellence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {EQUIPE.map((membre) => (
                <div
                  key={membre.nom}
                  className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-[2rem] overflow-hidden group hover:-translate-y-2 transition-transform duration-400 shadow-xl"
                >
                  {/* Photo */}
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={membre.img}
                      alt={`${membre.prenom} ${membre.nom}`}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent" />
                    <span className={`absolute top-4 right-4 ${membre.badgeColor} text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full`}>
                      {membre.badge}
                    </span>
                  </div>
                  {/* Info */}
                  <div className="p-7">
                    <h3 className="font-headline text-2xl font-extrabold text-white">
                      {membre.prenom} <span className="text-secondary">{membre.nom}</span>
                    </h3>
                    <p className="text-white/60 text-sm font-bold mt-1">{membre.role}</p>
                    <p className="text-white/40 text-xs mt-3 leading-relaxed">{membre.spec}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TIMELINE HISTOIRE ────────────────────────────── */}
        <section id="histoire" className="max-w-4xl mx-auto px-6 md:px-8 py-24">
          <div className="text-center mb-16">
            <p className="text-secondary font-black text-xs uppercase tracking-[0.25em] mb-3">Depuis 1978</p>
            <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-primary tracking-tight">
              Notre histoire
            </h2>
          </div>

          <div className="relative">
            {/* Ligne verticale */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-outline-variant/30 -translate-x-1/2" />

            <div className="space-y-12">
              {TIMELINE.map((event, i) => (
                <div
                  key={event.year}
                  className={`relative flex gap-8 md:gap-0 items-start ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  {/* Contenu */}
                  <div className={`flex-1 pl-12 md:pl-0 ${i % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                    <div className="bg-white border border-outline-variant/10 shadow-ambient rounded-2xl p-7 hover:shadow-md transition-shadow">
                      <span className="text-secondary text-xs font-black uppercase tracking-wider">{event.year}</span>
                      <h3 className="font-headline text-xl font-extrabold text-primary mt-1 mb-2">{event.title}</h3>
                      <p className="text-sm text-on-surface-variant leading-relaxed">{event.desc}</p>
                    </div>
                  </div>

                  {/* Point central */}
                  <div className="absolute left-6 md:left-1/2 -translate-x-1/2 flex-shrink-0 w-8 h-8 bg-secondary rounded-full border-4 border-white shadow-md flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-sm" style={{ fontSize: '14px' }}>sports_tennis</span>
                  </div>

                  {/* Espace côté opposé */}
                  <div className="hidden md:block flex-1" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ────────────────────────────────────── */}
        <section className="px-4 md:px-8 pb-24">
          <div className="max-w-5xl mx-auto relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary via-primary to-emerald-800 shadow-2xl shadow-primary/30">
            <div className="pointer-events-none absolute -right-20 -top-20 w-72 h-72 rounded-full bg-white/5" />
            <div className="pointer-events-none absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-secondary/15" />

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-0">
              {/* Texte */}
              <div className="p-12 md:p-14">
                <span className="inline-flex items-center gap-2 bg-white/10 text-white/80 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6">
                  <span className="material-symbols-outlined text-sm">celebration</span>
                  Semaine d'essai offerte
                </span>
                <h2 className="font-headline text-4xl font-extrabold text-white tracking-tight mb-4">
                  Prêt à faire partie de l'aventure ?
                </h2>
                <p className="text-white/60 leading-relaxed mb-8">
                  Créez votre compte, profitez d'une semaine d'accès aux courts en heures creuses et découvrez pourquoi nos membres ne nous quittent plus.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/login"
                    className="bg-secondary text-white px-8 py-4 rounded-full font-bold text-sm shadow-xl hover:-translate-y-0.5 transition-transform text-center"
                  >
                    S'inscrire gratuitement
                  </Link>
                  <Link
                    href="/tarifs"
                    className="glass-panel text-white/90 px-8 py-4 rounded-full font-bold text-sm border border-white/15 hover:bg-white/10 transition-colors text-center"
                  >
                    Voir les tarifs
                  </Link>
                </div>
              </div>

              {/* Stats verticales */}
              <div className="hidden md:flex flex-col justify-center divide-y divide-white/10 border-l border-white/10">
                {CHIFFRES.map((c) => (
                  <div key={c.label} className="px-12 py-8 flex items-center gap-5">
                    <div className="font-headline text-4xl font-black text-secondary flex-shrink-0 w-20">{c.value}</div>
                    <div>
                      <div className="text-white font-bold text-sm">{c.label}</div>
                      <div className="text-white/40 text-xs">{c.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
