'use client';

import { useState } from 'react';
import { Meeting } from '@/lib/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { AUTH_CONFIG } from '@/lib/constants';

interface TopMeetingsTableProps {
  meetings: Meeting[];
  loading: boolean;
}

interface ActionModalProps {
  meeting: Meeting | null;
  action: 'shorten' | 'cancel' | null;
  onClose: () => void;
}

export default function TopMeetingsTable({ meetings, loading }: TopMeetingsTableProps) {
  const { profile } = useAuth();
  const [actionModal, setActionModal] = useState<ActionModalProps>({ meeting: null, action: null, onClose: () => {} });

  const formatCurrency = (amount: number): string => {
    const currency = profile?.currency || AUTH_CONFIG.DEFAULT_CURRENCY;
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}min`;
  };

  // Obtener top 10 reuniones más caras
  const topMeetings = meetings
    .sort((a, b) => (b.total_cost || 0) - (a.total_cost || 0))
    .slice(0, 10);

  const handleAction = (meeting: Meeting, action: 'shorten' | 'cancel') => {
    setActionModal({
      meeting,
      action,
      onClose: () => setActionModal({ meeting: null, action: null, onClose: () => {} })
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-[#E5E9F0] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5E9F0]">
          <div className="w-48 h-6 bg-[#E5E9F0] rounded animate-pulse"></div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-7 h-7 bg-[#E5E9F0] rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="w-48 h-4 bg-[#E5E9F0] rounded animate-pulse mb-2"></div>
                  <div className="w-32 h-3 bg-[#E5E9F0] rounded animate-pulse"></div>
                </div>
                <div className="w-16 h-4 bg-[#E5E9F0] rounded animate-pulse"></div>
                <div className="w-20 h-8 bg-[#E5E9F0] rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-[#E5E9F0] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5E9F0]">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[#1B2A41]">Reuniones más caras</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-[#6B7280]">Esta semana</span>
              <button className="text-[#6B7280] hover:text-[#1B2A41] p-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F7F9FC]">
                <th className="text-left py-3 px-6 text-xs font-medium text-[#6B7280] uppercase tracking-wider">#</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-[#6B7280] uppercase tracking-wider">Reunión</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-[#6B7280] uppercase tracking-wider">Asistentes</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-[#6B7280] uppercase tracking-wider">Duración</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-[#6B7280] uppercase tracking-wider">Coste</th>
                <th className="text-left py-3 px-6 text-xs font-medium text-[#6B7280] uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F7F9FC]">
              {topMeetings.map((meeting, index) => (
                <tr key={meeting.id} className="hover:bg-[#F7F9FC] transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center w-7 h-7 bg-[#F7F9FC] text-[#6B7280] rounded-full text-sm font-medium">
                      {index + 1}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-medium text-[#1B2A41] mb-1">{meeting.title}</div>
                    {meeting.description && (
                      <div className="text-sm text-[#6B7280] truncate max-w-xs">
                        {meeting.description}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-[#1B2A41]">{meeting.attendees_count}</span>
                      <span className="ml-1 text-xs text-[#6B7280]">personas</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-[#1B2A41] font-medium">{formatDuration(meeting.duration_minutes)}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-lg font-semibold text-[#1B2A41]">
                      {formatCurrency(meeting.total_cost || 0)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAction(meeting, 'shorten')}
                        className="px-3 py-1.5 text-xs font-medium text-[#6B7280] bg-[#F7F9FC] border border-[#E5E9F0] hover:bg-white hover:text-[#1B2A41] rounded-md transition-colors"
                      >
                        Acortar
                      </button>
                      <button
                        onClick={() => handleAction(meeting, 'cancel')}
                        className="px-3 py-1.5 text-xs font-medium text-[#6B7280] bg-[#F7F9FC] border border-[#E5E9F0] hover:bg-white hover:text-[#FF5C5C] rounded-md transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {topMeetings.length === 0 && (
            <div className="text-center py-12">
              <div className="text-[#6B7280] text-4xl mb-2">📊</div>
              <p className="text-[#6B7280] text-sm">No hay reuniones registradas todavía</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Modal */}
      {actionModal.meeting && (
        <ActionModal
          meeting={actionModal.meeting}
          action={actionModal.action}
          onClose={actionModal.onClose}
        />
      )}
    </>
  );
}

function ActionModal({ meeting, action, onClose }: ActionModalProps) {
  const { profile } = useAuth();

  // Return early if no meeting
  if (!meeting) return null;

  const formatCurrency = (amount: number): string => {
    const currency = profile?.currency || AUTH_CONFIG.DEFAULT_CURRENCY;
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getActionDetails = () => {
    if (action === 'shorten') {
      const newDuration = Math.max(30, meeting.duration_minutes / 2);
      const newCost = (meeting.total_cost || 0) * (newDuration / meeting.duration_minutes);
      const savings = (meeting.total_cost || 0) - newCost;
      
      return {
        title: 'Acortar Reunión',
        description: `Reducir "${meeting.title}" a ${newDuration} minutos`,
        savings: formatCurrency(savings),
        emailSubject: `Propuesta: Acortar reunión "${meeting.title}"`,
        emailBody: `Hola,\n\nHe revisado la reunión "${meeting.title}" y creo que podríamos ser más eficientes acortándola a ${newDuration} minutos.\n\nEsto nos ahorraría ${formatCurrency(savings)} en costos.\n\n¿Te parece bien?\n\nSaludos`
      };
    } else {
      return {
        title: 'Cancelar Reunión',
        description: `Cancelar completamente "${meeting.title}"`,
        savings: formatCurrency(meeting.total_cost || 0),
        emailSubject: `Propuesta: Cancelar reunión "${meeting.title}"`,
        emailBody: `Hola,\n\nHe revisado la reunión "${meeting.title}" y creo que podríamos posponerla o manejar el tema de otra manera.\n\nEsto nos ahorraría ${formatCurrency(meeting.total_cost || 0)} en costos.\n\n¿Qué opinas?\n\nSaludos`
      };
    }
  };

  const details = getActionDetails();

  const handleSendEmail = () => {
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(details.emailSubject)}&body=${encodeURIComponent(details.emailBody)}`;
    window.open(mailtoUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-[#E5E9F0]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#1B2A41]">{details.title}</h3>
          <button
            onClick={onClose}
            className="text-[#6B7280] hover:text-[#1B2A41] text-xl"
          >
            ×
          </button>
        </div>

        <div className="mb-6">
          <p className="text-[#6B7280] mb-4">{details.description}</p>
          <div className="bg-[#2EC4B6]/10 border border-[#2EC4B6]/20 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-[#2EC4B6] text-lg mr-2">💰</span>
              <div>
                <p className="text-sm text-[#2EC4B6]">Ahorro potencial</p>
                <p className="text-lg font-bold text-[#1B2A41]">{details.savings}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleSendEmail}
            className="flex-1 bg-[#356AFF] text-white py-2 px-4 rounded-lg hover:bg-[#4a75ff] transition-colors"
          >
            Enviar Email
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-[#F7F9FC] text-[#1B2A41] py-2 px-4 rounded-lg hover:bg-[#E5E9F0] transition-colors border border-[#E5E9F0]"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
