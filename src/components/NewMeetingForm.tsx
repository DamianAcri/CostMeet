'use client';

import { useState } from 'react';
import { MeetingInput } from '@/hooks/useMeetings';
import { useAuth } from '@/contexts/AuthContext';
import { AUTH_CONFIG, VALIDATION_RULES } from '@/lib/constants';
import { validateMeetingData, sanitizeInput } from '@/lib/validation';
import { useErrorHandler, ErrorHandler } from '@/lib/errorHandler';

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
  const { handleError } = useErrorHandler();
  
  const [formData, setFormData] = useState<MeetingInput>({
    title: '',
    description: '',
    attendees_count: 1,
    duration_minutes: 60,
    average_hourly_rate: profile?.default_hourly_rate || AUTH_CONFIG.DEFAULT_HOURLY_RATE,
    meeting_date: new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Real-time cost calculation
  const currentCost = calculateCost(
    formData.attendees_count,
    formData.average_hourly_rate,
    formData.duration_minutes
  );

  const validateForm = (): boolean => {
    // Use the centralized validation
    const validation = validateMeetingData(formData);
    
    if (!validation.isValid) {
      const newErrors: FormErrors = {};
      validation.errors.forEach(error => {
        if (error.includes('título')) newErrors.title = error;
        if (error.includes('descripción')) newErrors.description = error;
        if (error.includes('asistentes')) newErrors.attendees_count = error;
        if (error.includes('duración')) newErrors.duration_minutes = error;
        if (error.includes('tarifa')) newErrors.average_hourly_rate = error;
      });
      setErrors(newErrors);
      return false;
    }
    
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Sanitize data before sending
      const sanitizedData = {
        ...formData,
        title: sanitizeInput(formData.title),
        description: formData.description ? sanitizeInput(formData.description) : undefined
      };

      const result = await createMeeting(sanitizedData);
      
      if (result) {
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
    } catch (error) {
      const appError = handleError(error, { action: 'create_meeting' });
      setErrors({ title: ErrorHandler.getDisplayMessage(appError) });
    }
  };

  const handleInputChange = (field: keyof MeetingInput, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Live Cost Preview - Stripe Style */}
      <div className="bg-gradient-to-r from-[#1B2A41] to-[#356AFF] rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90 mb-1">Costo estimado</p>
            <p className="text-3xl font-bold">{formatCurrency(currentCost)}</p>
          </div>
          <div className="text-right text-sm opacity-90">
            <p>{formData.attendees_count} personas</p>
            <p>{formData.duration_minutes} minutos</p>
            <p>€{formData.average_hourly_rate}/hora</p>
          </div>
        </div>
      </div>

      {/* Form Fields Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-[#1B2A41] mb-2">
              Título de la reunión
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-lg text-[#1B2A41] placeholder-[#6B7280] font-medium
                focus:outline-none focus:border-[#356AFF] focus:ring-1 focus:ring-[#356AFF] transition-all duration-200
                ${errors.title ? 'border-[#FF5C5C] bg-[#FF5C5C]/5' : 'border-[#E5E9F0] bg-white hover:border-[#D1D9E0]'}`}
              placeholder="Ej: Reunión de planificación Q1"
              disabled={loading}
            />
            {errors.title && (
              <p className="text-[#FF5C5C] text-sm mt-1 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-[#1B2A41] mb-2">
              Descripción
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border-2 border-[#E5E9F0] rounded-lg text-[#1B2A41] placeholder-[#6B7280] font-medium
                focus:outline-none focus:border-[#356AFF] focus:ring-1 focus:ring-[#356AFF] transition-all duration-200
                bg-white hover:border-[#D1D9E0] resize-none"
              placeholder="Describe el objetivo y agenda de la reunión (opcional)"
              disabled={loading}
            />
          </div>

          {/* Date */}
          <div>
            <label htmlFor="meeting_date" className="block text-sm font-semibold text-[#1B2A41] mb-2">
              Fecha de la reunión
            </label>
            <input
              type="date"
              id="meeting_date"
              value={formData.meeting_date}
              onChange={(e) => handleInputChange('meeting_date', e.target.value)}
              className="w-full px-4 py-3 border-2 border-[#E5E9F0] rounded-lg text-[#1B2A41] font-medium
                focus:outline-none focus:border-[#356AFF] focus:ring-1 focus:ring-[#356AFF] transition-all duration-200
                bg-white hover:border-[#D1D9E0]"
              disabled={loading}
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Attendees */}
          <div>
            <label htmlFor="attendees_count" className="block text-sm font-semibold text-[#1B2A41] mb-2">
              Número de asistentes
            </label>
            <input
              type="number"
              id="attendees_count"
              value={formData.attendees_count}
              onChange={(e) => handleInputChange('attendees_count', Number(e.target.value))}
              min={VALIDATION_RULES.MEETING_LIMITS.MIN_ATTENDEES}
              max={VALIDATION_RULES.MEETING_LIMITS.MAX_ATTENDEES}
              className={`w-full px-4 py-3 border-2 rounded-lg text-[#1B2A41] font-medium
                focus:outline-none focus:border-[#356AFF] focus:ring-1 focus:ring-[#356AFF] transition-all duration-200
                ${errors.attendees_count ? 'border-[#FF5C5C] bg-[#FF5C5C]/5' : 'border-[#E5E9F0] bg-white hover:border-[#D1D9E0]'}`}
              disabled={loading}
            />
            {errors.attendees_count && (
              <p className="text-[#FF5C5C] text-sm mt-1 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.attendees_count}
              </p>
            )}
          </div>

          {/* Duration */}
          <div>
            <label htmlFor="duration_minutes" className="block text-sm font-semibold text-[#1B2A41] mb-2">
              Duración (minutos)
            </label>
            <div className="relative">
              <input
                type="number"
                id="duration_minutes"
                value={formData.duration_minutes}
                onChange={(e) => handleInputChange('duration_minutes', Number(e.target.value))}
                min={VALIDATION_RULES.MEETING_LIMITS.MIN_DURATION_MINUTES}
                max={VALIDATION_RULES.MEETING_LIMITS.MAX_DURATION_MINUTES}
                step={15}
                className={`w-full px-4 py-3 pr-12 border-2 rounded-lg text-[#1B2A41] font-medium
                  focus:outline-none focus:border-[#356AFF] focus:ring-1 focus:ring-[#356AFF] transition-all duration-200
                  ${errors.duration_minutes ? 'border-[#FF5C5C] bg-[#FF5C5C]/5' : 'border-[#E5E9F0] bg-white hover:border-[#D1D9E0]'}`}
                disabled={loading}
              />
              <div className="absolute right-3 top-3 text-[#6B7280] text-sm font-medium">min</div>
            </div>
            {/* Quick duration buttons */}
            <div className="flex gap-2 mt-2">
              {[15, 30, 60, 90].map((duration) => (
                <button
                  key={duration}
                  type="button"
                  onClick={() => handleInputChange('duration_minutes', duration)}
                  className={`px-3 py-1.5 text-sm rounded-md font-medium transition-all duration-200 ${
                    formData.duration_minutes === duration
                      ? 'bg-[#356AFF] text-white shadow-sm'
                      : 'bg-[#F7F9FC] text-[#6B7280] hover:bg-[#E5E9F0] hover:text-[#1B2A41]'
                  }`}
                  disabled={loading}
                >
                  {duration}m
                </button>
              ))}
            </div>
            {errors.duration_minutes && (
              <p className="text-[#FF5C5C] text-sm mt-1 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.duration_minutes}
              </p>
            )}
          </div>

          {/* Hourly Rate */}
          <div>
            <label htmlFor="average_hourly_rate" className="block text-sm font-semibold text-[#1B2A41] mb-2">
              Tarifa promedio por hora
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-[#6B7280] font-medium">€</span>
              <input
                type="number"
                id="average_hourly_rate"
                value={formData.average_hourly_rate}
                onChange={(e) => handleInputChange('average_hourly_rate', Number(e.target.value))}
                min={VALIDATION_RULES.MEETING_LIMITS.MIN_HOURLY_RATE}
                max={VALIDATION_RULES.MEETING_LIMITS.MAX_HOURLY_RATE}
                step={5}
                className={`w-full pl-8 pr-4 py-3 border-2 rounded-lg text-[#1B2A41] font-medium
                  focus:outline-none focus:border-[#356AFF] focus:ring-1 focus:ring-[#356AFF] transition-all duration-200
                  ${errors.average_hourly_rate ? 'border-[#FF5C5C] bg-[#FF5C5C]/5' : 'border-[#E5E9F0] bg-white hover:border-[#D1D9E0]'}`}
                disabled={loading}
              />
            </div>
            {errors.average_hourly_rate && (
              <p className="text-[#FF5C5C] text-sm mt-1 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.average_hourly_rate}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons - Stripe Style */}
      <div className="flex items-center justify-end space-x-3 pt-6 border-t border-[#E5E9F0]">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 text-[#6B7280] bg-white border border-[#E5E9F0] rounded-lg hover:bg-[#F7F9FC] 
              hover:text-[#1B2A41] hover:border-[#D1D9E0] transition-all duration-200 font-medium"
            disabled={loading}
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-[#1B2A41] text-white rounded-lg font-medium 
            hover:bg-[#2a3f5f] focus:ring-2 focus:ring-[#356AFF] focus:ring-offset-2 
            transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center space-x-2 shadow-sm"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Creando...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Crear reunión</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
