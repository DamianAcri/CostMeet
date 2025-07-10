'use client';

import { useState } from 'react';
import { Meeting } from '@/lib/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { AUTH_CONFIG } from '@/lib/constants';

interface MeetingsListProps {
  meetings: Meeting[];
  onEditMeeting?: (meeting: Meeting) => void;
  deleteMeeting: (id: string) => Promise<boolean>;
  loading: boolean;
}

export default function MeetingsList({ meetings, onEditMeeting, deleteMeeting, loading }: MeetingsListProps) {
  const { profile } = useAuth();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const formatCurrency = (amount: number): string => {
    const currency = profile?.currency || AUTH_CONFIG.DEFAULT_CURRENCY;
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
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

  const handleDeleteMeeting = async (meetingId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta reunión?')) {
      return;
    }

    setDeletingId(meetingId);
    const success = await deleteMeeting(meetingId);
    
    if (!success) {
      // Error handling is done in the hook
      console.error('Failed to delete meeting');
    }
    
    setDeletingId(null);
  };

  if (meetings.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <div className="text-gray-400 text-5xl mb-4">📅</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay reuniones</h3>
        <p className="text-gray-500">Crea tu primera reunión para empezar a rastrear costes.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {meetings.map((meeting) => (
        <div
          key={meeting.id}
          className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            {/* Meeting Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {meeting.title}
                </h3>
                <div className="ml-4 flex-shrink-0">
                  <span className="text-2xl font-bold text-blue-600">
                    {formatCurrency(meeting.total_cost || 0)}
                  </span>
                </div>
              </div>
              
              {meeting.description && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {meeting.description}
                </p>
              )}
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <span className="font-medium">📅</span>
                  {meeting.meeting_date ? formatDate(meeting.meeting_date) : formatDate(meeting.created_at)}
                </div>
                
                <div className="flex items-center gap-1">
                  <span className="font-medium">👥</span>
                  {meeting.attendees_count} asistente{meeting.attendees_count !== 1 ? 's' : ''}
                </div>
                
                <div className="flex items-center gap-1">
                  <span className="font-medium">⏱️</span>
                  {formatDuration(meeting.duration_minutes)}
                </div>
                
                <div className="flex items-center gap-1">
                  <span className="font-medium">💰</span>
                  {formatCurrency(meeting.average_hourly_rate)}/h
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-4 sm:mt-0 sm:ml-4">
              {onEditMeeting && (
                <button
                  onClick={() => onEditMeeting(meeting)}
                  disabled={loading || deletingId === meeting.id}
                  className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Editar
                </button>
              )}
              
              <button
                onClick={() => handleDeleteMeeting(meeting.id)}
                disabled={loading || deletingId === meeting.id}
                className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingId === meeting.id ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
