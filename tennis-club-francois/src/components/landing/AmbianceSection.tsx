"use client";

import Image from 'next/image';
import { motion } from 'framer-motion';
import { MotionViewport } from '@/components/ui/motion-viewport';

export function AmbianceSection() {
  const images = [
    {
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBm1p3zHjt6_k1ddE-l_5eBV4GXhI7C5111t4Q4Dzat3FAMObn7_ZtjpxDsXiHxpAiXfATmTQ9WBDqef4533moFDwxsaAt7CsiKpLZIi5CcSXfDrjdXTG7aJsS65OvfukPlgZGIuj3AQpZQsCiSotgGE7LBNKxHa9qEbOmmB84u-97atUAwxwPtOUiAVIY68f-O75nHwu8JlORppX01CrFkfGpFENMqcSGqlBGQsEzZ-ARlgrnXyYRcY2BvK-UT_-BsEhZ_UDx_luE',
      alt: 'Match au crépuscule',
      title: 'Tournois de la Baie',
      badge: 'Événements',
      span: 'md:col-span-2 md:row-span-2',
    },
    {
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCm9O-b1weJV_XhaWv6ReIcTAz9pAJNM9sdwyGdH0u948YoUqiS3st8KHihW4-o-A110ALtU-H0O5S23AZFD02DDga8OmQo5h2dKnD9_Fr3YUdgVuDF4jHsKTK1nOYd98qQeCTcJ9JBc-1YsO8TwHPNVf2FrHEKnZqA1VrkwaZqVKgoE9WQZQypxXiK7wMjaw6AMh2xGDJgL9A-Z-HVKI9Bs073PZ6ssT2T2bn6GJOHcJheEcAfnzNcS0diO0nB13VnfzqyzqWqt-M',
      alt: 'Club House Interior',
      title: 'Club House',
      span: 'md:col-span-2',
    },
    {
      src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6lj7h_A68mQYrJttfIBEGNRUn0QQZIHXzBnUptn2G3ZthiIavfYpgu2hlAwVzqxoKKQlx5NAiILUUuBgKROvDhr59Z1YA4ry7BjpkSpW30KjnDKqtRwo7yA5k54ymRlzjn9NGIjqWcVXC2udhD3h8kLE5OGzcD5vYV_73twB8aC__QsUhni2rBWNdpWx-AbyUWh4hZqTBcauaxNxGrzsubAgdHKrY-kelV1v490pYtr4Y9Hji7oCRVd1PvzXg3sXBr-w5ltOTbD0',
      alt: 'Fresh Juice',
      icon: 'eco',
      span: 'md:col-span-1',
    },
  ];

  const itemVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }
    }
  };

  return (
    <section className="py-32 max-w-screen-2xl mx-auto px-8 overflow-hidden">
      {/* Header */}
      <MotionViewport direction="up" className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
        <div className="max-w-2xl">
          <h3 className="font-headline text-primary text-6xl font-black tracking-tighter mb-6">
            Ambiance <span className="text-secondary">Club</span>
          </h3>
          <p className="text-on-surface-variant text-xl font-medium">
            Plus qu&apos;un sport, un art de vivre martiniquais. <br className="hidden md:block" />
            Découvrez l'énergie vibrante de notre communauté.
          </p>
        </div>
        <motion.button 
          whileHover={{ x: 10 }}
          className="text-primary font-black text-lg flex items-center gap-3 group transition-colors"
        >
          <span className="border-b-2 border-primary group-hover:border-secondary group-hover:text-secondary transition-colors">
            Voir la galerie complète
          </span>
          <span className="material-symbols-outlined text-secondary transform group-hover:scale-125 transition-transform">
            arrow_forward
          </span>
        </motion.button>
      </MotionViewport>

      {/* Bento Grid with Motion */}
      <MotionViewport 
        stagger 
        direction="none" 
        className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-8 h-auto md:h-[900px]"
      >
        {/* Large Featured Item */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ scale: 0.99 }}
          className={`${images[0].span} relative rounded-3xl overflow-hidden shadow-2xl group cursor-pointer`}
        >
          <Image
            alt={images[0].alt}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            src={images[0].src}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
          <div className="absolute bottom-10 left-10">
            <motion.span 
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              className="bg-secondary text-on-secondary text-sm font-black px-4 py-1.5 rounded-full uppercase mb-4 inline-block tracking-widest"
            >
              {images[0].badge}
            </motion.span>
            <h4 className="text-white text-4xl font-headline font-black tracking-tighter">
              {images[0].title}
            </h4>
          </div>
        </motion.div>

        {/* Top Right */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ scale: 0.99 }}
          className={`${images[1].span} relative rounded-3xl overflow-hidden shadow-xl group cursor-pointer`}
        >
          <Image
            alt={images[1].alt}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            src={images[1].src}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
            <h4 className="text-white text-3xl font-headline font-black tracking-tighter">
              {images[1].title}
            </h4>
          </div>
        </motion.div>

        {/* Bottom Right 1 - Fresh Juice */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ scale: 0.99 }}
          className={`${images[2].span} relative rounded-3xl overflow-hidden shadow-xl group cursor-pointer`}
        >
          <Image
            alt={images[2].alt}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            src={images[2].src}
            fill
            sizes="(max-width: 768px) 33vw, 25vw"
          />
          <div className="absolute top-6 left-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 transform -rotate-12 group-hover:rotate-0 transition-transform duration-500">
            <span className="material-symbols-outlined text-white text-3xl">
              {images[2].icon}
            </span>
          </div>
        </motion.div>

        {/* Bottom Right 2 - Community CTA */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -10 }}
          className="md:col-span-1 bg-secondary relative rounded-3xl overflow-hidden shadow-xl flex items-center justify-center p-10 text-center group"
        >
          <div className="relative z-10">
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md"
            >
              <span className="material-symbols-outlined text-on-secondary text-4xl">
                group
              </span>
            </motion.div>
            <h4 className="text-on-secondary text-2xl font-headline font-black tracking-tighter">
              Rejoignez la <br /> Communauté
            </h4>
            <p className="text-on-secondary/80 text-sm font-bold uppercase tracking-widest mt-4">
              +300 membres
            </p>
          </div>
          {/* Decorative background shape */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
        </motion.div>
      </MotionViewport>
    </section>
  );
}
