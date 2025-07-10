'use client';

import { useState } from 'react';
import { MeetingInput } from '@/hooks/useMeetings';
import { useAuth } from '@/contexts/AuthContext';
import { AUTH_CONFIG, VALIDATION_RULES } from '@/lib/constants';

interface NewMeetingFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  createMeeting: (meetingData: MeetingInput) => Promise<any>;
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

export default function NewMeetingForm({ onSuccess, onCancel, createMeeting, calculateCost, loading }: NewMeetingFormProps) {
  const { profile } = useAuth();
  
  const [formData, setFormData] = useState<MeetingInput>({
    title: '',
    description: '',
    attendees_count: 1,
    duration_minutes: 60,
    average_hourly_rate: profile?.default_hourly_rate || AUTH_CONFIG.DEFAULT_HOURLY_RATE,
    meeting_date: new Date().toISOString().split('T')[0], // Today's date
  });

  const [errors, setErrors] = useState<FormErrors>({});

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

    if (!validateForm()) return;

    const result = await createMeeting(formData);
    
    if (result) {
      // Reset form
      setFormData({
        title: '',
        description: '',
        attendees_count: 1,
        duration_minutes: 60,
        average_hourly_rate: profile?.default_hourly_rate || AUTH_CONFIG.DEFAULT_HOURLY_RATE,
        meeting_date: new Date().toISOString().split('T')[0],
      });
      setErrors({});
      
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Nueva Reunión</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Título *
          </label>
          <input
            type="text"
            id="title"
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
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            id="description"
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
          <label htmlFor="meeting_date" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha
          </label>
          <input
            type="date"
            id="meeting_date"
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
            <label htmlFor="attendees_count" className="block text-sm font-medium text-gray-700 mb-1">
              Asistentes *
            </label>
            <input
              type="number"
              id="attendees_count"
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
            <label htmlFor="duration_minutes" className="block text-sm font-medium text-gray-700 mb-1">
              Duración (min) *
            </label>
            <input
              type="number"
              id="duration_minutes"
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
            <label htmlFor="average_hourly_rate" className="block text-sm font-medium text-gray-700 mb-1">
              Tarifa/hora ({profile?.currency || AUTH_CONFIG.DEFAULT_CURRENCY}) *
            </label>
            <input
              type="number"
              id="average_hourly_rate"
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
            {loading ? 'Creando...' : 'Crear Reunión'}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
