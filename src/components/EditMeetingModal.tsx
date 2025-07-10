'use client';

import { useState, useEffect } from 'react';
import { Meeting } from '@/lib/supabase/types';
import { MeetingInput } from '@/hooks/useMeetings';
import { useAuth } from '@/contexts/AuthContext';
import { AUTH_CONFIG, VALIDATION_RULES } from '@/lib/constants';

interface EditMeetingModalProps {
  meeting: Meeting | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  updateMeeting: (id: string, meetingData: Partial<MeetingInput>) => Promise<any>;
  calculateCost: (attendees: number, hourlyRate: number, durationMinutes: number) => number;
  loading: boolean;
}

interface FormErrors {
  title?: string;
  description?: string;
  attendees_count?: string;
  duration_minutes?: string;
  average_hourly_rate?: string;
  meeting_date?: string;
}

export default function EditMeetingModal({ 
  meeting, 
  isOpen, 
  onClose, 
  onSuccess, 
  updateMeeting, 
  calculateCost, 
  loading 
}: EditMeetingModalProps) {
  const { profile } = useAuth();
  
  const [formData, setFormData] = useState<MeetingInput>({
    title: '',
    description: '',
    attendees_count: 1,
    duration_minutes: 60,
    average_hourly_rate: profile?.default_hourly_rate || AUTH_CONFIG.DEFAULT_HOURLY_RATE,
    meeting_date: new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Initialize form data when meeting changes
  useEffect(() => {
    if (meeting) {
      setFormData({
        title: meeting.title,
        description: meeting.description || '',
        attendees_count: meeting.attendees_count,
        duration_minutes: meeting.duration_minutes,
        average_hourly_rate: meeting.average_hourly_rate,
        meeting_date: meeting.meeting_date
          ? new Date(meeting.meeting_date).toISOString().split('T')[0]
          : new Date(meeting.created_at).toISOString().split('T')[0],
      });
      setErrors({});
    }
  }, [meeting]);

  // Real-time cost calculation
  const currentCost = calculateCost(
    formData.attendees_count,
    formData.average_hourly_rate,
    formData.duration_minutes
  );

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es obligatorio';
    }

    if (formData.attendees_count < VALIDATION_RULES.MEETING_LIMITS.MIN_ATTENDEES) {
      newErrors.attendees_count = `Debe haber al menos ${VALIDATION_RULES.MEETING_LIMITS.MIN_ATTENDEES} asistente`;
    } else if (formData.attendees_count > VALIDATION_RULES.MEETING_LIMITS.MAX_ATTENDEES) {
      newErrors.attendees_count = `Máximo ${VALIDATION_RULES.MEETING_LIMITS.MAX_ATTENDEES} asistentes`;
    }

    if (formData.duration_minutes < VALIDATION_RULES.MEETING_LIMITS.MIN_DURATION_MINUTES) {
      newErrors.duration_minutes = `La duración debe ser al menos ${VALIDATION_RULES.MEETING_LIMITS.MIN_DURATION_MINUTES} minuto`;
    } else if (formData.duration_minutes > VALIDATION_RULES.MEETING_LIMITS.MAX_DURATION_MINUTES) {
      newErrors.duration_minutes = 'La duración no puede exceder 24 horas';
    }

    if (formData.average_hourly_rate < VALIDATION_RULES.MEETING_LIMITS.MIN_HOURLY_RATE) {
      newErrors.average_hourly_rate = 'La tarifa no puede ser negativa';
    } else if (formData.average_hourly_rate > VALIDATION_RULES.MEETING_LIMITS.MAX_HOURLY_RATE) {
      newErrors.average_hourly_rate = `La tarifa no puede exceder ${VALIDATION_RULES.MEETING_LIMITS.MAX_HOURLY_RATE.toLocaleString()} €/h`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!meeting || !validateForm()) return;

    const result = await updateMeeting(meeting.id, formData);
    
    if (result) {
      setErrors({});
      onClose();
      
      if (onSuccess) {
        onSuccess();
      }
    }
  };

  const handleInputChange = (field: keyof MeetingInput, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const formatCurrency = (amount: number): string => {
    const currency = profile?.currency || AUTH_CONFIG.DEFAULT_CURRENCY;
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Don't render if not open
  if (!isOpen || !meeting) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Editar Reunión</h2>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold disabled:opacity-50"
            >
              ×
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-1">
                Título *
              </label>
              <input
                type="text"
                id="edit-title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: Reunión de planificación Q1"
                disabled={loading}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descripción opcional de la reunión..."
                disabled={loading}
              />
            </div>

            {/* Date */}
            <div>
              <label htmlFor="edit-meeting_date" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha
              </label>
              <input
                type="date"
                id="edit-meeting_date"
                value={formData.meeting_date}
                onChange={(e) => handleInputChange('meeting_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            {/* Attendees, Duration, and Rate in a grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Attendees */}
              <div>
                <label htmlFor="edit-attendees_count" className="block text-sm font-medium text-gray-700 mb-1">
                  Asistentes *
                </label>
                <input
                  type="number"
                  id="edit-attendees_count"
                  value={formData.attendees_count}
                  onChange={(e) => handleInputChange('attendees_count', Number(e.target.value))}
                  min={VALIDATION_RULES.MEETING_LIMITS.MIN_ATTENDEES}
                  max={VALIDATION_RULES.MEETING_LIMITS.MAX_ATTENDEES}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.attendees_count ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {errors.attendees_count && <p className="text-red-500 text-sm mt-1">{errors.attendees_count}</p>}
              </div>

              {/* Duration */}
              <div>
                <label htmlFor="edit-duration_minutes" className="block text-sm font-medium text-gray-700 mb-1">
                  Duración (min) *
                </label>
                <input
                  type="number"
                  id="edit-duration_minutes"
                  value={formData.duration_minutes}
                  onChange={(e) => handleInputChange('duration_minutes', Number(e.target.value))}
                  min={VALIDATION_RULES.MEETING_LIMITS.MIN_DURATION_MINUTES}
                  max={VALIDATION_RULES.MEETING_LIMITS.MAX_DURATION_MINUTES}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.duration_minutes ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {errors.duration_minutes && <p className="text-red-500 text-sm mt-1">{errors.duration_minutes}</p>}
              </div>

              {/* Hourly Rate */}
              <div>
                <label htmlFor="edit-average_hourly_rate" className="block text-sm font-medium text-gray-700 mb-1">
                  Tarifa/hora ({profile?.currency || AUTH_CONFIG.DEFAULT_CURRENCY}) *
                </label>
                <input
                  type="number"
                  id="edit-average_hourly_rate"
                  value={formData.average_hourly_rate}
                  onChange={(e) => handleInputChange('average_hourly_rate', Number(e.target.value))}
                  min={VALIDATION_RULES.MEETING_LIMITS.MIN_HOURLY_RATE}
                  max={VALIDATION_RULES.MEETING_LIMITS.MAX_HOURLY_RATE}
                  step="0.01"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.average_hourly_rate ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {errors.average_hourly_rate && <p className="text-red-500 text-sm mt-1">{errors.average_hourly_rate}</p>}
              </div>
            </div>

            {/* Cost Preview */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex items-center justify-between">
                <span className="text-blue-800 font-medium">Coste estimado:</span>
                <span className="text-2xl font-bold text-blue-900">
                  {formatCurrency(currentCost)}
                </span>
              </div>
              <p className="text-blue-600 text-sm mt-1">
                {formData.attendees_count} asistente{formData.attendees_count !== 1 ? 's' : ''} × {formData.duration_minutes} min × {formatCurrency(formData.average_hourly_rate)}/h
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
