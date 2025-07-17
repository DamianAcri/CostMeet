'use client';

import { useState } from 'react';
import { Meeting } from '@/lib/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { AUTH_CONFIG } from '@/lib/constants';

interface SaturationHeatmapProps {
  meetings: Meeting[];
  loading: boolean;
}

interface DayData {
  date: Date;
  meetings: Meeting[];
  totalCost: number;
  hourlyRate: number;
  saturationLevel: 'low' | 'medium' | 'high';
}

export default function SaturationHeatmap({ meetings, loading }: SaturationHeatmapProps) {
  const { profile } = useAuth();
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);

  const formatCurrency = (amount: number): string => {
    const currency = profile?.currency || AUTH_CONFIG.DEFAULT_CURRENCY;
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const generateWeekData = (): DayData[] => {
    const weekData: DayData[] = [];
    const today = new Date();
    
    // Generar los últimos 7 días
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      // Filtrar reuniones de este día
      const dayMeetings = meetings.filter(meeting => {
        const meetingDate = new Date(meeting.meeting_date || meeting.created_at);
        return meetingDate.toDateString() === date.toDateString();
      });
      
      const totalCost = dayMeetings.reduce((sum, meeting) => sum + (meeting.total_cost || 0), 0);
      const hourlyRate = dayMeetings.length > 0 ? totalCost / (dayMeetings.length * 60) * 60 : 0;
      
      let saturationLevel: 'low' | 'medium' | 'high' = 'low';
      if (hourlyRate > 600) saturationLevel = 'high';
      else if (hourlyRate > 300) saturationLevel = 'medium';
      
      weekData.push({
        date,
        meetings: dayMeetings,
        totalCost,
        hourlyRate,
        saturationLevel
      });
    }
    
    return weekData;
  };

  const weekData = generateWeekData();

  const getSaturationColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'high':
        return 'bg-[#FF5C5C] hover:bg-[#ff4747] border-[#FF5C5C]';
      case 'medium':
        return 'bg-[#FFB200] hover:bg-[#e6a000] border-[#FFB200]';
      default:
        return 'bg-[#2EC4B6] hover:bg-[#29b3a6] border-[#2EC4B6]';
    }
  };

  const getSaturationIntensity = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'high':
        return 'opacity-100';
      case 'medium':
        return 'opacity-75';
      default:
        return 'opacity-50';
    }
  };

  const getSaturationIcon = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'high':
        return '�';
      case 'medium':
        return '⚡';
      default:
        return '✨';
    }
  };

  const getDayLabel = (date: Date) => {
    const days = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];
    return days[date.getDay() === 0 ? 6 : date.getDay() - 1]; // Adjust for Monday start
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-[#E5E9F0] p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="w-48 h-5 bg-[#E5E9F0] rounded animate-pulse"></div>
          <div className="w-24 h-4 bg-[#E5E9F0] rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-7 gap-4 mb-8">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="text-center">
              <div className="w-8 h-4 bg-[#E5E9F0] rounded animate-pulse mb-3 mx-auto"></div>
              <div className="w-16 h-16 bg-[#E5E9F0] rounded-lg animate-pulse mx-auto"></div>
              <div className="w-6 h-3 bg-[#E5E9F0] rounded animate-pulse mt-2 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-[#E5E9F0] p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[#1B2A41]">Saturación semanal</h3>
        <span className="text-sm text-[#6B7280]">Últimos 7 días</span>
      </div>

      {/* Heatmap Grid */}
      <div className="grid grid-cols-7 gap-3 mb-6">
        {weekData.map((day, index) => (
          <div key={index} className="text-center">
            <div className="text-xs font-medium text-[#6B7280] mb-2">
              {getDayLabel(day.date)}
            </div>
            <button
              onClick={() => setSelectedDay(day)}
              className={`w-12 h-12 rounded-lg transition-all duration-200 ${getSaturationColor(day.saturationLevel)} ${getSaturationIntensity(day.saturationLevel)} text-white font-medium text-sm shadow-sm hover:shadow-md transform hover:scale-105 flex items-center justify-center border`}
              title={`${day.meetings.length} reuniones - ${formatCurrency(day.totalCost)}`}
            >
              {day.meetings.length}
            </button>
            <div className="text-xs text-[#6B7280] mt-1">
              {day.date.getDate()}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm">
          <div className="w-3 h-3 bg-[#2EC4B6] rounded-sm mr-2 opacity-50"></div>
          <span className="text-[#6B7280]">Eficiente (&lt;300 €/h)</span>
        </div>
        <div className="flex items-center text-sm">
          <div className="w-3 h-3 bg-[#FFB200] rounded-sm mr-2 opacity-75"></div>
          <span className="text-[#6B7280]">Moderado (300-600 €/h)</span>
        </div>
        <div className="flex items-center text-sm">
          <div className="w-3 h-3 bg-[#FF5C5C] rounded-sm mr-2 opacity-100"></div>
          <span className="text-[#6B7280]">Saturado (&gt;600 €/h)</span>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-[#F7F9FC] rounded-lg p-4 border border-[#E5E9F0]">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xl font-semibold text-[#1B2A41]">
              {weekData.filter(d => d.saturationLevel === 'low').length}
            </div>
            <div className="text-xs text-[#6B7280]">Días eficientes</div>
          </div>
          <div>
            <div className="text-xl font-semibold text-[#FFB200]">
              {weekData.filter(d => d.saturationLevel === 'medium').length}
            </div>
            <div className="text-xs text-[#6B7280]">Días moderados</div>
          </div>
          <div>
            <div className="text-xl font-semibold text-[#FF5C5C]">
              {weekData.filter(d => d.saturationLevel === 'high').length}
            </div>
            <div className="text-xs text-[#6B7280]">Días saturados</div>
          </div>
        </div>
      </div>

      {/* Day Detail Modal */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden border border-[#E5E9F0]">
            <div className="px-6 py-4 border-b border-[#E5E9F0]">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#1B2A41]">
                  {selectedDay.date.toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </h3>
                <button
                  onClick={() => setSelectedDay(null)}
                  className="text-[#6B7280] hover:text-[#1B2A41] p-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-[#F7F9FC] rounded-lg p-4 border border-[#E5E9F0]">
                  <div className="text-sm text-[#6B7280]">Reuniones</div>
                  <div className="text-2xl font-semibold text-[#1B2A41]">{selectedDay.meetings.length}</div>
                </div>
                <div className="bg-[#F7F9FC] rounded-lg p-4 border border-[#E5E9F0]">
                  <div className="text-sm text-[#6B7280]">Coste total</div>
                  <div className="text-2xl font-semibold text-[#1B2A41]">{formatCurrency(selectedDay.totalCost)}</div>
                </div>
              </div>

              {selectedDay.meetings.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {selectedDay.meetings.map((meeting) => (
                    <div key={meeting.id} className="bg-[#F7F9FC] rounded-lg p-4 border border-[#E5E9F0]">
                      <div className="font-medium text-[#1B2A41] mb-1">{meeting.title}</div>
                      <div className="text-sm text-[#6B7280]">
                        {meeting.attendees_count} asistentes • {meeting.duration_minutes} min • {formatCurrency(meeting.total_cost || 0)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-[#6B7280]">
                  <div className="text-3xl mb-2">📅</div>
                  <p className="text-sm">No hay reuniones este día</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
