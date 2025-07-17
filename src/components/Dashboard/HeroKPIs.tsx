'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AUTH_CONFIG } from '@/lib/constants';
import { MeetingStats } from '@/hooks/useMeetings';

interface HeroKPIProps {
  stats: MeetingStats;
  loading: boolean;
}

interface KPICard {
  id: string;
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  trend: 'up' | 'down' | 'neutral';
  trendValue: string;
  color: 'green' | 'amber' | 'blue' | 'gray';
}

export default function HeroKPIs({ stats, loading }: HeroKPIProps) {
  const { profile } = useAuth();
  const [selectedKPI, setSelectedKPI] = useState<string | null>(null);

  const formatCurrency = (amount: number): string => {
    const currency = profile?.currency || AUTH_CONFIG.DEFAULT_CURRENCY;
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const kpiCards: KPICard[] = [
    {
      id: 'weekly-cost',
      title: 'Gastado esta semana',
      value: formatCurrency(stats.totalCostThisWeek),
      subtitle: `${stats.totalMeetingsThisWeek} reunión${stats.totalMeetingsThisWeek !== 1 ? 'es' : ''}`,
      icon: '€',
      trend: 'neutral',
      trendValue: '',
      color: 'blue'
    },
    {
      id: 'average-cost',
      title: 'Coste promedio',
      value: formatCurrency(stats.averageCostPerMeeting),
      subtitle: 'por reunión',
      icon: '~',
      trend: 'neutral',
      trendValue: '',
      color: 'green'
    },
    {
      id: 'total-meetings',
      title: 'Total reuniones',
      value: `${stats.totalMeetingsAllTime}`,
      subtitle: 'en total',
      icon: '#',
      trend: 'neutral',
      trendValue: '',
      color: 'gray'
    },
    {
      id: 'total-cost',
      title: 'Coste total',
      value: formatCurrency(stats.totalCostAllTime),
      subtitle: 'acumulado',
      icon: '∑',
      trend: 'neutral',
      trendValue: '',
      color: 'amber'
    }
  ];

  const getCardStyles = (card: KPICard) => {
    const baseStyles = 'bg-white rounded-lg shadow-sm ring-1 ring-[#E5E9F0] p-6 hover:shadow-md transition-all duration-200 cursor-pointer border border-[#E5E9F0]';
    
    switch (card.color) {
      case 'green':
        return `${baseStyles} hover:ring-[#2EC4B6]/20`;
      case 'amber':
        return `${baseStyles} hover:ring-[#FFB200]/20`;
      case 'blue':
        return `${baseStyles} hover:ring-[#356AFF]/20`;
      default:
        return `${baseStyles} hover:ring-[#E5E9F0]/50`;
    }
  };

  const getTrendStyles = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return 'text-[#FF5C5C] bg-[#FF5C5C]/10';
      case 'down':
        return 'text-[#2EC4B6] bg-[#2EC4B6]/10';
      default:
        return 'text-[#6B7280] bg-[#F7F9FC]';
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return '↗';
      case 'down':
        return '↘';
      default:
        return '→';
    }
  };

  if (loading) {
    return (
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-[#E5E9F0] p-6 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="w-16 h-4 bg-[#E5E9F0] rounded"></div>
                <div className="w-8 h-8 bg-[#E5E9F0] rounded"></div>
              </div>
              <div className="w-24 h-8 bg-[#E5E9F0] rounded mb-2"></div>
              <div className="w-20 h-4 bg-[#E5E9F0] rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card) => (
          <div
            key={card.id}
            className="bg-white rounded-lg border border-[#E5E9F0] p-6 hover:shadow-md transition-all duration-200 cursor-pointer"
            onClick={() => setSelectedKPI(card.id)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <h3 className="text-[#6B7280] text-sm font-medium">{card.title}</h3>
              </div>
              <div className="w-8 h-8 bg-[#F7F9FC] rounded-md flex items-center justify-center">
                <span className="text-[#6B7280] text-sm">{card.icon}</span>
              </div>
            </div>
            
            <div className="mb-2">
              <div className="text-3xl font-semibold text-[#1B2A41] leading-none mb-1">
                {card.value}
              </div>
              <p className="text-[#6B7280] text-sm">{card.subtitle}</p>
            </div>
            
            {card.trendValue && (
              <div className="flex items-center">
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTrendStyles(card.trend)}`}>
                  <span className="mr-1">{getTrendIcon(card.trend)}</span>
                  {card.trendValue}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
