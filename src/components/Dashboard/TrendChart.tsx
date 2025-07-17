'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AUTH_CONFIG } from '@/lib/constants';

interface TrendChartProps {
  loading: boolean;
  meetings: any[];
}

type TimeRange = '4weeks' | '12weeks' | '6months';

interface WeeklyData {
  week: string;
  cost: number;
  savings: number;
}

export default function TrendChart({ loading, meetings }: TrendChartProps) {
  const { profile } = useAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>('4weeks');

  const formatCurrency = (amount: number): string => {
    const currency = profile?.currency || AUTH_CONFIG.DEFAULT_CURRENCY;
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Generate data from real meetings
  const generateRealData = (range: TimeRange): WeeklyData[] => {
    const configs = {
      '4weeks': { count: 4, interval: 7 },
      '12weeks': { count: 8, interval: 7 },  // Reducir a 8 semanas para mejor legibilidad
      '6months': { count: 6, interval: 30 }
    };

    const config = configs[range];
    const data: WeeklyData[] = [];
    
    for (let i = config.count - 1; i >= 0; i--) {
      const baseDate = new Date();
      baseDate.setDate(baseDate.getDate() - (i * config.interval));
      
      const endDate = new Date(baseDate);
      endDate.setDate(endDate.getDate() + config.interval - 1);
      
      let week: string;
      if (range === '6months') {
        // Para meses: "Jul", "Ago", "Sep"
        week = baseDate.toLocaleDateString('es-ES', { month: 'short' });
      } else {
        // Para semanas: "15 Jul", "22 Jul", "29 Jul"
        week = baseDate.toLocaleDateString('es-ES', { 
          day: 'numeric',
          month: 'short'
        });
      }
      
      // Filter meetings for this period
      const periodMeetings = meetings.filter(meeting => {
        const meetingDate = new Date(meeting.meeting_date || meeting.created_at);
        const meetingDay = new Date(meetingDate.getFullYear(), meetingDate.getMonth(), meetingDate.getDate());
        const baseDay = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
        const endDay = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
        
        return meetingDay >= baseDay && meetingDay <= endDay;
      });
      
      const cost = periodMeetings.reduce((sum, meeting) => sum + (meeting.total_cost || 0), 0);
      const savings = cost * 0.2;
      
      data.push({ week, cost, savings });
    }
    
    return data;
  };

  const data = generateRealData(timeRange);
  const maxValue = Math.max(...data.map(d => d.cost), 100); // Mínimo 100 para evitar división por 0

  const getTimeRangeLabel = (range: TimeRange) => {
    switch (range) {
      case '4weeks':
        return '4 semanas';
      case '12weeks':
        return '8 semanas';
      case '6months':
        return '6 meses';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-[#E5E9F0] p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="w-48 h-5 bg-[#E5E9F0] rounded animate-pulse"></div>
          <div className="w-32 h-8 bg-[#E5E9F0] rounded animate-pulse"></div>
        </div>
        <div className="h-80 bg-[#F7F9FC] rounded animate-pulse"></div>
      </div>
    );
  }

  // Early return for debugging
  if (meetings.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-[#E5E9F0] p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[#1B2A41]">Tendencia de gasto</h3>
          <div className="flex bg-[#F7F9FC] rounded-lg p-1 border border-[#E5E9F0]">
            {(['4weeks', '12weeks', '6months'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  timeRange === range
                    ? 'bg-white text-[#1B2A41] shadow-sm border border-[#E5E9F0]'
                    : 'text-[#6B7280] hover:text-[#1B2A41] hover:bg-white'
                }`}
              >
                {getTimeRangeLabel(range)}
              </button>
            ))}
          </div>
        </div>
        <div className="h-80 bg-[#F7F9FC] rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-[#6B7280] text-4xl mb-2">📊</div>
            <p className="text-[#6B7280] text-sm">No hay reuniones para mostrar</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-[#E5E9F0] p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[#1B2A41]">Tendencia de gasto</h3>
        
        <div className="flex bg-[#F7F9FC] rounded-lg p-1 border border-[#E5E9F0]">
          {(['4weeks', '12weeks', '6months'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                timeRange === range
                  ? 'bg-white text-[#1B2A41] shadow-sm border border-[#E5E9F0]'
                  : 'text-[#6B7280] hover:text-[#1B2A41] hover:bg-white'
              }`}
            >
              {getTimeRangeLabel(range)}
            </button>
          ))}
        </div>
      </div>

      <div className="relative h-80">
        <div className="h-full flex">
          {/* Y-axis */}
          <div className="w-16 flex flex-col justify-between text-xs text-[#6B7280] py-4">
            <span className="text-right">{formatCurrency(maxValue)}</span>
            <span className="text-right">{formatCurrency(maxValue * 0.75)}</span>
            <span className="text-right">{formatCurrency(maxValue * 0.5)}</span>
            <span className="text-right">{formatCurrency(maxValue * 0.25)}</span>
            <span className="text-right">€0</span>
          </div>

          {/* Chart area */}
          <div className="flex-1 relative ml-4">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between py-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="border-t border-[#F7F9FC] w-full"></div>
              ))}
            </div>

            {/* Bars */}
            <div className="absolute inset-0 flex items-end justify-between px-2 py-4 pb-8">
              {data.map((point, index) => {
                const costHeight = maxValue > 0 ? (point.cost / maxValue) * 100 : 0;
                const savingsHeight = maxValue > 0 ? (point.savings / maxValue) * 100 : 0;
                
                return (
                  <div key={index} className="flex flex-col items-center group" style={{ width: `${Math.min(90 / data.length, 15)}%` }}>
                    {/* Tooltip */}
                    <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-[#1B2A41] text-white px-3 py-2 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      <div className="font-medium">{formatCurrency(point.cost)}</div>
                      <div className="text-[#6B7280]">{point.week}</div>
                    </div>
                    
                    {/* Bars container */}
                    <div className="relative flex flex-col items-center justify-end" style={{ height: 'calc(100% - 2rem)' }}>
                      {/* Cost bar */}
                      <div
                        className="bg-[#1B2A41] rounded-t-sm hover:bg-[#2a3f5f] transition-colors"
                        style={{ 
                          height: `${Math.min(costHeight, 80)}%`,
                          width: data.length > 6 ? '8px' : '20px'
                        }}
                      />
                      {/* Savings bar */}
                      <div
                        className="bg-[#2EC4B6] rounded-b-sm hover:bg-[#41d0c4] transition-colors"
                        style={{ 
                          height: `${Math.min(savingsHeight, 80)}%`,
                          width: data.length > 6 ? '8px' : '20px'
                        }}
                      />
                    </div>
                    
                    {/* X-axis label */}
                    <div 
                      className="text-xs text-[#6B7280] mt-2 text-center font-medium" 
                      style={{ 
                        fontSize: data.length > 6 ? '10px' : '11px',
                        minWidth: '40px'
                      }}
                    >
                      {point.week}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center mt-6 space-x-6 pt-4 border-t border-[#F7F9FC]">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-[#1B2A41] rounded-sm mr-2"></div>
          <span className="text-xs text-[#6B7280] font-medium">Coste del período</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-[#2EC4B6] rounded-sm mr-2"></div>
          <span className="text-xs text-[#6B7280] font-medium">Potencial ahorrado</span>
        </div>
      </div>
    </div>
  );
}
