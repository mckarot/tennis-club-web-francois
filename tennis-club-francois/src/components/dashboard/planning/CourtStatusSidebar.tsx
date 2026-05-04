'use client';

interface Court {
  id: string;
  nom: string;
  type: string;
  isOccupied: boolean;
  isInMaintenance: boolean;
}

interface CourtStatusSidebarProps {
  courts: Court[];
  isLoading?: boolean;
}

export function CourtStatusSidebar({ courts, isLoading }: CourtStatusSidebarProps) {
  return (
    <div className="col-span-12 lg:col-span-3 space-y-8 h-full">
      {/* Court Status Bento Unit */}
      <div className="bg-surface-container-lowest rounded-xl p-8 shadow-ambient bento-card-hover border border-outline-variant/10">
        <h3 className="font-headline text-xs font-bold text-secondary uppercase tracking-[0.2em] mb-6">État des Courts</h3>
        
        <div className="space-y-4">
          {isLoading ? (
            // Skeleton state
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-surface-container-low rounded-lg animate-pulse" />
            ))
          ) : (
            courts.map((court) => (
              <div 
                key={court.id} 
                className={`flex items-center justify-between p-4 bg-surface-container-low rounded-lg group hover:bg-primary-container transition-all duration-300 border border-outline-variant/5 ${court.isInMaintenance ? 'opacity-60 grayscale' : ''}`}
              >
                <div className="flex flex-col">
                  <span className="font-bold text-primary group-hover:text-primary-fixed">{court.nom}</span>
                  <span className="text-[10px] text-on-surface-variant group-hover:text-primary-fixed-dim/80">{court.type}</span>
                </div>
                
                <div className={`flex items-center gap-2 bg-white/40 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider group-hover:bg-primary-fixed-dim ${court.isInMaintenance ? 'text-secondary' : 'text-primary'}`}>
                  <span className={`w-2 h-2 rounded-full ${court.isInMaintenance ? 'bg-secondary' : court.isOccupied ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                  {court.isInMaintenance ? 'Maintenance' : court.isOccupied ? 'Occupé' : 'Libre'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Decorative Branding Bento */}
      <div className="relative overflow-hidden rounded-xl h-64 shadow-ambient group bento-card-hover border border-outline-variant/10">
        <img 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          alt="Tennis court background" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDKlVI-T7O-cCukeMbzDjAH9D7C_ZdQSV2_CdSuFJtLWCj5zzMYK85CJ9tRHy-BdeMNb23cSScDPp6f2oVZIHpH9UBQRlU5n415vXNayouH__ep2-98LHCeoBIYxmcCmn6GESZcRv6ci247xv5XiCMAX4Mdlkjo0eyXQ0AswHKbHLQlY2Q2LNI3QSUchdtASuCDFn9PtPp6maf621kjLqmlivUoSbBMUWORqXngFIsKcVZieH-Osy5iNfdJIg-MEdXn4IsSthBEAeo" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent p-8 flex flex-col justify-end">
          <span className="text-primary-fixed text-xs font-bold uppercase tracking-widest mb-2">Infos Club</span>
          <h4 className="text-white font-headline font-bold text-xl leading-snug">Éclairage LED installé sur les courts 4-6</h4>
        </div>
      </div>
    </div>
  );
}
