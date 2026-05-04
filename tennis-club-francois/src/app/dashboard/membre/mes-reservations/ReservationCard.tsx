'use client';

import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { UserReservation } from './actions';
import { useState } from 'react';
import CancelConfirmationModal from '@/components/dashboard/membre/CancelConfirmationModal';

interface ReservationCardProps {
  reservation: UserReservation;
  onCancel: (id: string) => Promise<void>;
  isFuture?: boolean;
}

/**
 * Premium Reservation Card - Bento style
 * Follows Stitch design tokens (Stitch compliant)
 */
export function ReservationCard({ reservation, onCancel, isFuture = true }: ReservationCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  
  const startDate = parseISO(reservation.startTime);
  const endDate = parseISO(reservation.endTime);

  const handleModalConfirm = async () => {
    setIsCancelling(true);
    try {
      await onCancel(reservation.id);
    } catch (error) {
      console.error('Cancel error:', error);
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmée':
        return { label: 'Confirmée', color: 'bg-primary-fixed text-on-primary-fixed-variant', dot: 'bg-surface-tint' };
      case 'provisoire':
        return { label: 'En attente', color: 'bg-secondary-fixed text-on-secondary-fixed-variant', dot: 'bg-secondary' };
      case 'effectuée':
        return { label: 'Terminée', color: 'bg-surface-container-highest text-on-surface-variant', dot: 'bg-outline' };
      case 'presence':
        return { label: 'Présent', color: 'bg-primary-fixed text-on-primary-fixed-variant', dot: 'bg-surface-tint' };
      case 'absence':
        return { label: 'Absent', color: 'bg-error-container text-on-error-container', dot: 'bg-error' };
      case 'annulée':
        return { label: 'Annulée', color: 'bg-error-container/40 text-on-error-container/70', dot: 'bg-error/30' };
      default:
        return { label: status, color: 'bg-surface-container text-on-surface-variant', dot: 'bg-surface-dim' };
    }
  };

  const status = getStatusConfig(reservation.status);

  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center transition-all duration-500 hover:-translate-y-2 group shadow-ambient border border-outline-variant/10">
      
      {/* Visual Thumbnail */}
      <div className="w-full md:w-32 h-32 rounded-lg bg-surface-container overflow-hidden flex-shrink-0 relative">
        <img 
          className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-700" 
          alt="Tennis Court" 
          src={reservation.courtType.includes('Terre') 
            ? "https://lh3.googleusercontent.com/aida-public/AB6AXuCZ4d20BBA3u5cB1g6cH5Xjngdb2zoD_IhWURmhftwfRboZyIy879IO8mSsvFPAcoztVAnE4PPWotYCqJLac7W_48gIk6lYAcb-natjfsdOeZ3vTsd9jr7NhXclxRfivRsb2b4gr3Evt6zbuGq8ucCHWmIjf_IKSWaPzqnCEV24LyvZvcFL6beJkj8bfUh6YCte5Q_7HjIlNj8xAimXS4VrfRmuoV-c8FgtqrDVLQUQ9N4L8NGL5dHkGnwGOH7VgH2v1sEFfHWaEwE"
            : "https://lh3.googleusercontent.com/aida-public/AB6AXuDhba9NkdSKsj0RTG_lFMc5ItIb6UuPJMqDgzKpD_7OPKAmRlbAbccf5E6ch2og4nKryrc8sNpUFGZEjvnQ-audBMlxoFlmh0rSfZ8eYq6K8pDtxjZz_cRE7qD3MARgtgpRqwwTg5h-UbGp67g9R6cfVtMXZBIpCG9ogv-9vkGjWscJGcP5Kqk0OzNI9r1aeKuRcNUTCIYb7evcdsLXBIAmJdiZzS4LYwIpNX7EF1xaXiX7f6RgsqiOb4VqXg5KIdOBDZ8jgeGYqqY"
          }
        />
        <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors"></div>
      </div>

      {/* Info Grid */}
      <div className="flex-grow grid grid-cols-2 md:grid-cols-3 gap-6 w-full">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Date & Heure</p>
          <p className="font-headline text-primary font-bold text-lg">{format(startDate, 'dd MMM yyyy', { locale: fr })}</p>
          <p className="text-sm font-body text-on-surface-variant font-medium">
            {format(startDate, 'HH:mm')} - {format(endDate, 'HH:mm')}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Court</p>
          <p className="font-headline text-primary font-bold text-lg">{reservation.courtName}</p>
          <p className="text-sm font-body text-on-surface-variant font-medium">{reservation.courtType}</p>
        </div>

        <div className="col-span-2 md:col-span-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Statut</p>
          <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${status.color} text-[11px] font-bold uppercase tracking-wider shadow-sm`}>
            <span className={`w-2 h-2 rounded-full ${status.dot} animate-pulse`}></span>
            {status.label}
          </span>
        </div>
      </div>

      {/* Action Button */}
      {isFuture && reservation.status !== 'annulée' && (
        <div className="flex-shrink-0 w-full md:w-auto">
          <button 
            onClick={() => setIsModalOpen(true)}
            disabled={isCancelling}
            className="w-full md:min-w-[120px] px-6 py-4 rounded-full bg-surface-container-high text-primary font-headline text-xs font-bold uppercase tracking-widest hover:bg-error-container hover:text-on-error-container transition-all duration-300 active:scale-95 disabled:opacity-50"
          >
            {isCancelling ? '...' : 'Annuler'}
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      <CancelConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleModalConfirm}
        reservation={reservation}
      />
    </div>
  );
}
