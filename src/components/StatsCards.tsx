'use client';

import { MeetingStats } from '@/hooks/useMeetings';
import { useAuth } from '@/contexts/AuthContext';
import { AUTH_CONFIG } from '@/lib/constants';

interface StatsCardsProps {
  stats: MeetingStats;
  loading?: boolean;
}

export default function StatsCards({ stats, loading }: StatsCardsProps) {
  const { profile } = useAuth();

  const formatCurrency = (amount: number): string => {
    const currency = profile?.currency || AUTH_CONFIG.DEFAULT_CURRENCY;
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const statsData = [
    {
      title: 'Coste esta semana',
      value: formatCurrency(stats.totalCostThisWeek),
      description: `${stats.totalMeetingsThisWeek} reunión${stats.totalMeetingsThisWeek !== 1 ? 'es' : ''}`,
      icon: '📊',
      color: 'blue',
    },
    {
      title: 'Coste promedio',
      value: formatCurrency(stats.averageCostPerMeeting),
      description: 'por reunión',
      icon: '📈',
      color: 'green',
    },
    {
      title: 'Total reuniones',
      value: stats.totalMeetingsAllTime.toString(),
      description: 'en total',
      icon: '📅',
      color: 'purple',
    },
    {
      title: 'Coste total',
      value: formatCurrency(stats.totalCostAllTime),
      description: 'acumulado',
      icon: '💰',
      color: 'orange',
    },
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'text-blue-500',
          value: 'text-blue-900',
          description: 'text-blue-600',
        };
      case 'green':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: 'text-green-500',
          value: 'text-green-900',
          description: 'text-green-600',
        };
      case 'purple':
        return {
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          icon: 'text-purple-500',
          value: 'text-purple-900',
          description: 'text-purple-600',
        };
      case 'orange':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          icon: 'text-orange-500',
          value: 'text-orange-900',
          description: 'text-orange-600',
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          icon: 'text-gray-500',
          value: 'text-gray-900',
          description: 'text-gray-600',
        };
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md p-6 border border-gray-200 animate-pulse"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-8 h-8 bg-gray-200 rounded"></div>
              <div className="w-16 h-4 bg-gray-200 rounded"></div>
            </div>
            <div className="w-24 h-8 bg-gray-200 rounded mb-2"></div>
            <div className="w-20 h-4 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat, index) => {
        const colors = getColorClasses(stat.color);
        
        return (
          <div
            key={index}
            className={`${colors.bg} ${colors.border} border rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className={`text-2xl ${colors.icon}`}>{stat.icon}</span>
              <h3 className="text-sm font-medium text-gray-700">{stat.title}</h3>
            </div>
            
            <div className="space-y-1">
              <p className={`text-2xl font-bold ${colors.value}`}>
                {stat.value}
              </p>
              <p className={`text-sm ${colors.description}`}>
                {stat.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
