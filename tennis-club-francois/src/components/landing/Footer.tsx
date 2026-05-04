import Image from 'next/image';

export function Footer() {
  return (
    <footer className="bg-emerald-50 dark:bg-emerald-950 w-full py-12 px-8 rounded-t-[3rem] mt-20 font-manrope text-xs tracking-wide text-emerald-900 dark:text-emerald-50">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-screen-2xl mx-auto">
        {/* Column 1: Description & Social */}
        <div className="md:col-span-1">
          <div className="font-lexend font-black text-2xl text-emerald-900 dark:text-emerald-50 mb-6">
            Tennis Club François
          </div>
          <p className="text-emerald-800/60 dark:text-emerald-100/60 mb-6 leading-relaxed">
            Situé au bord de la baie du François, notre club vous accueille pour une expérience
            sportive d&apos;exception au cœur de la Martinique.
          </p>
          <div className="flex gap-4">
            <a
              className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center hover:bg-secondary transition-colors"
              href="#"
              aria-label="Facebook"
            >
              <span className="material-symbols-outlined text-[18px]">social_leaderboard</span>
            </a>
            <a
              className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center hover:bg-secondary transition-colors"
              href="#"
              aria-label="Instagram"
            >
              <span className="material-symbols-outlined text-[18px]">camera</span>
            </a>
          </div>
        </div>

        {/* Column 2: Le Club */}
        <div>
          <h5 className="font-bold text-emerald-900 dark:text-emerald-50 mb-6 text-sm">Le Club</h5>
          <ul className="space-y-4">
            <li>
              <a className="text-emerald-800/50 dark:text-emerald-100/50 hover:text-orange-500 transition-colors" href="#">
                Histoire
              </a>
            </li>
            <li>
              <a className="text-emerald-800/50 dark:text-emerald-100/50 hover:text-orange-500 transition-colors" href="#">
                Les Courts
              </a>
            </li>
            <li>
              <a className="text-emerald-800/50 dark:text-emerald-100/50 hover:text-orange-500 transition-colors" href="#">
                Académie
              </a>
            </li>
            <li>
              <a className="text-emerald-800/50 dark:text-emerald-100/50 hover:text-orange-500 transition-colors" href="#">
                Lounge Bar
              </a>
            </li>
          </ul>
        </div>

        {/* Column 3: Pratique */}
        <div>
          <h5 className="font-bold text-emerald-900 dark:text-emerald-50 mb-6 text-sm">Pratique</h5>
          <ul className="space-y-4">
            <li>
              <a className="text-emerald-800/50 dark:text-emerald-100/50 hover:text-orange-500 transition-colors" href="#">
                Tarifs &amp; Adhésion
              </a>
            </li>
            <li>
              <a className="text-emerald-800/50 dark:text-emerald-100/50 hover:text-orange-500 transition-colors" href="#">
                Réserver en ligne
              </a>
            </li>
            <li>
              <a className="text-emerald-800/50 dark:text-emerald-100/50 hover:text-orange-500 transition-colors" href="#">
                Partenaires
              </a>
            </li>
            <li>
              <a className="text-emerald-800/50 dark:text-emerald-100/50 hover:text-orange-500 transition-colors" href="#">
                Contact
              </a>
            </li>
          </ul>
        </div>

        {/* Column 4: Address & Map */}
        <div>
          <h5 className="font-bold text-emerald-900 dark:text-emerald-50 mb-6 text-sm">Venir nous voir</h5>
          <p className="text-emerald-800/50 dark:text-emerald-100/50 mb-4">
            Quartier Presqu&apos;île de la Cayenne<br />
            97240 Le François, Martinique
          </p>
          <div className="h-32 w-full rounded-lg overflow-hidden grayscale contrast-125 opacity-70">
            <Image
              alt="Map location"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCn_J5NO9AZC7-gr13DGxFi3ZzYP535Q0EP75QJiUfG61SyQ9heQMSibU4CnCQxIE-_qz-EmupJkI2ccOMdvqGiW36By_3emevsSvo0812mOGcSU_rORyohb5lGhkStNDfmBFUVYRFAA6pk_TIBxqp7r3XEGTPUKFQ-expFesTm6w-pohwD136NMn8TfepUxa9vNs8HaIZuJ0Dd7PeBaP9uTNhsD2CGQt4cNrQ7Kd1CkGcgR3xZztRKG1lTZtX2KDg2AfYTGH31Q0A"
              width={300}
              height={128}
            />
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-screen-2xl mx-auto border-t border-emerald-200/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <span className="text-emerald-800/50 dark:text-emerald-100/50">
          © 2024 Club de Tennis du François - Martinique
        </span>
        <div className="flex gap-8">
          <a className="text-emerald-800/50 dark:text-emerald-100/50 hover:text-orange-500 transition-colors" href="#">
            Mentions Légales
          </a>
          <a className="text-emerald-800/50 dark:text-emerald-100/50 hover:text-orange-500 transition-colors" href="#">
            Conditions d&apos;Utilisation
          </a>
          <a className="text-emerald-800/50 dark:text-emerald-100/50 hover:text-orange-500 transition-colors" href="#">
            Politique de Confidentialité
          </a>
        </div>
      </div>
    </footer>
  );
}
