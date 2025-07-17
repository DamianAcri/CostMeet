'use client';

import { useState } from 'react';
import { Meeting } from '@/lib/supabase/types';
import { MEETING_ANALYSIS } from '@/lib/constants';

interface BrokenRulesPanelProps {
  meetings: Meeting[];
  loading: boolean;
}

interface Rule {
  id: string;
  title: string;
  description: string;
  violations: Meeting[];
  count: number;
  severity: 'low' | 'medium' | 'high';
}

export default function BrokenRulesPanel({ meetings, loading }: BrokenRulesPanelProps) {
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null);

  const analyzeRules = (): Rule[] => {
    // Filtrar reuniones de los últimos N días
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - MEETING_ANALYSIS.RULES.ANALYSIS_PERIOD_DAYS);
    
    const recentMeetings = meetings.filter(meeting => {
      const meetingDate = new Date(meeting.meeting_date || meeting.created_at);
      return meetingDate >= weekAgo;
    });

    const rules: Rule[] = [
      {
        id: MEETING_ANALYSIS.RULE_TYPES.LARGE_LONG_MEETINGS,
        title: `Reunión >${MEETING_ANALYSIS.RULES.LARGE_MEETING_THRESHOLD} personas >${MEETING_ANALYSIS.RULES.LONG_MEETING_THRESHOLD} min`,
        description: `Reuniones con más de ${MEETING_ANALYSIS.RULES.LARGE_MEETING_THRESHOLD} asistentes que duran más de ${MEETING_ANALYSIS.RULES.LONG_MEETING_THRESHOLD} minutos`,
        violations: recentMeetings.filter(m => 
          m.attendees_count > MEETING_ANALYSIS.RULES.LARGE_MEETING_THRESHOLD && 
          m.duration_minutes > MEETING_ANALYSIS.RULES.LONG_MEETING_THRESHOLD
        ),
        count: 0,
        severity: 'high'
      },
      {
        id: MEETING_ANALYSIS.RULE_TYPES.NO_AGENDA,
        title: 'Meeting sin agenda adjunta',
        description: 'Reuniones sin descripción o agenda definida',
        violations: recentMeetings.filter(m => 
          !m.description || 
          m.description.trim().length < MEETING_ANALYSIS.RULES.MIN_DESCRIPTION_LENGTH
        ),
        count: 0,
        severity: 'medium'
      },
      {
        id: MEETING_ANALYSIS.RULE_TYPES.NO_OWNER,
        title: 'Sin "owner" asignado',
        description: 'Reuniones sin un responsable claro identificado',
        violations: recentMeetings.filter(m => !m.description || !m.description.includes('@')),
        count: 0,
        severity: 'medium'
      },
      {
        id: MEETING_ANALYSIS.RULE_TYPES.EXCESSIVE_DURATION,
        title: 'Duración excesiva',
        description: `Reuniones que duran más de ${MEETING_ANALYSIS.RULES.EXCESSIVE_DURATION_THRESHOLD} minutos`,
        violations: recentMeetings.filter(m => m.duration_minutes > MEETING_ANALYSIS.RULES.EXCESSIVE_DURATION_THRESHOLD),
        count: 0,
        severity: 'high'
      },
      {
        id: MEETING_ANALYSIS.RULE_TYPES.TOO_FREQUENT,
        title: 'Reuniones muy frecuentes',
        description: `Mismo título de reunión más de ${MEETING_ANALYSIS.RULES.FREQUENT_MEETING_THRESHOLD} veces por semana`,
        violations: [],
        count: 0,
        severity: 'low'
      }
    ];

    // Calcular conteos y detectar reuniones frecuentes
    const titleCounts: { [key: string]: Meeting[] } = {};
    recentMeetings.forEach(meeting => {
      const normalizedTitle = meeting.title.toLowerCase().trim();
      if (!titleCounts[normalizedTitle]) {
        titleCounts[normalizedTitle] = [];
      }
      titleCounts[normalizedTitle].push(meeting);
    });

    const frequentMeetings = Object.entries(titleCounts)
      .filter(([_, meetings]) => meetings.length > MEETING_ANALYSIS.RULES.FREQUENT_MEETING_THRESHOLD)
      .flatMap(([_, meetings]) => meetings);

    rules[4].violations = frequentMeetings;

    // Actualizar conteos
    rules.forEach(rule => {
      rule.count = rule.violations.length;
    });

    return rules.filter(rule => rule.count > 0);
  };

  const rules = analyzeRules();

  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high':
        return 'text-[#FF5C5C] bg-[#FF5C5C]/10';
      case 'medium':
        return 'text-[#FFB200] bg-[#FFB200]/10';
      default:
        return 'text-[#356AFF] bg-[#356AFF]/10';
    }
  };

  const getSeverityIcon = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high':
        return '●';
      case 'medium':
        return '●';
      default:
        return '●';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-[#E5E9F0] p-6">
        <div className="w-48 h-5 bg-[#E5E9F0] rounded animate-pulse mb-6"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-[#F7F9FC] rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-[#E5E9F0] rounded animate-pulse"></div>
                <div>
                  <div className="w-40 h-4 bg-[#E5E9F0] rounded animate-pulse mb-2"></div>
                  <div className="w-24 h-3 bg-[#E5E9F0] rounded animate-pulse"></div>
                </div>
              </div>
              <div className="w-16 h-8 bg-[#E5E9F0] rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-[#E5E9F0] p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[#1B2A41]">Reglas rotas</h3>
          <span className="text-sm text-[#6B7280]">Últimos 7 días</span>
        </div>

        {rules.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-[#2EC4B6] text-3xl mb-2">✅</div>
            <p className="text-[#1B2A41] font-medium mb-1">¡Excelente trabajo!</p>
            <p className="text-[#6B7280] text-sm">No se han detectado violaciones de reglas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center justify-between p-4 bg-[#F7F9FC] rounded-lg hover:bg-[#E5E9F0]/50 transition-colors border border-[#E5E9F0]"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${rule.severity === 'high' ? 'bg-[#FF5C5C]' : rule.severity === 'medium' ? 'bg-[#FFB200]' : 'bg-[#356AFF]'}`}></div>
                  <div>
                    <h4 className="font-medium text-[#1B2A41] text-sm">{rule.title}</h4>
                    <p className="text-xs text-[#6B7280] mt-1">{rule.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className={`px-2 py-1 rounded-md text-xs font-medium ${getSeverityColor(rule.severity)}`}>
                    {rule.count}
                  </div>
                  <button
                    onClick={() => setSelectedRule(rule)}
                    className="text-[#6B7280] hover:text-[#1B2A41] text-xs font-medium"
                  >
                    Ver
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Educational Footer */}
        <div className="mt-6 pt-4 border-t border-[#E5E9F0]">
          <div className="bg-[#356AFF]/10 rounded-lg p-4 border border-[#356AFF]/20">
            <h4 className="font-medium text-[#1B2A41] mb-2 text-sm">💡 Consejos para reuniones eficientes</h4>
            <ul className="text-xs text-[#6B7280] space-y-1">
              <li>• Toda reunión debe tener una agenda clara</li>
              <li>• Asigna un responsable de la reunión</li>
              <li>• Limita las reuniones a 60 minutos máximo</li>
              <li>• Evalúa si necesitas todos los asistentes</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Rule Detail Modal */}
      {selectedRule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-[#E5E9F0]">
            <div className="px-6 py-4 border-b border-[#E5E9F0]">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${selectedRule.severity === 'high' ? 'bg-[#FF5C5C]' : selectedRule.severity === 'medium' ? 'bg-[#FFB200]' : 'bg-[#356AFF]'}`}></div>
                  <h3 className="text-lg font-semibold text-[#1B2A41]">{selectedRule.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedRule(null)}
                  className="text-[#6B7280] hover:text-[#1B2A41] p-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <p className="text-[#6B7280] mb-6">{selectedRule.description}</p>

              <div className="space-y-3">
                {selectedRule.violations.map((meeting) => (
                  <div key={meeting.id} className="bg-[#F7F9FC] rounded-lg p-4 border border-[#E5E9F0]">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-[#1B2A41]">{meeting.title}</h4>
                        <div className="text-sm text-[#6B7280] mt-1">
                          {meeting.attendees_count} asistentes • {meeting.duration_minutes} min
                        </div>
                        {meeting.description && (
                          <p className="text-sm text-[#6B7280] mt-2 line-clamp-2">
                            {meeting.description}
                          </p>
                        )}
                      </div>
                      <div className="text-sm text-[#6B7280]">
                        {new Date(meeting.meeting_date || meeting.created_at).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[#E5E9F0]">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#6B7280]">
                  Total de violaciones: {selectedRule.count}
                </span>
                <button
                  onClick={() => setSelectedRule(null)}
                  className="px-4 py-2 bg-[#F7F9FC] text-[#1B2A41] rounded-lg hover:bg-[#E5E9F0] transition-colors border border-[#E5E9F0]"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
