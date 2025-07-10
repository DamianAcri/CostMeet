import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Meeting, MeetingUpdate } from '@/lib/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { AUTH_CONFIG } from '@/lib/constants';

export interface MeetingInput {
  title: string;
  description?: string;
  attendees_count: number;
  duration_minutes: number;
  average_hourly_rate: number;
  meeting_date?: string;
}

export interface MeetingStats {
  totalCostThisWeek: number;
  totalMeetingsThisWeek: number;
  averageCostPerMeeting: number;
  totalMeetingsAllTime: number;
  totalCostAllTime: number;
}

export function useMeetings() {
  const { user, profile } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [stats, setStats] = useState<MeetingStats>({
    totalCostThisWeek: 0,
    totalMeetingsThisWeek: 0,
    averageCostPerMeeting: 0,
    totalMeetingsAllTime: 0,
    totalCostAllTime: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all meetings for the current user
  const fetchMeetings = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMeetings(data || []);
      calculateStats(data || []);
    } catch (err: unknown) {
      console.error('Error fetching meetings:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar las reuniones');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Calculate statistics from meetings
  const calculateStats = (meetingsData: Meeting[]) => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const thisWeekMeetings = meetingsData.filter(meeting => {
      const meetingDate = new Date(meeting.created_at);
      return meetingDate >= oneWeekAgo;
    });

    const totalCostThisWeek = thisWeekMeetings.reduce((sum, meeting) => sum + (meeting.total_cost || 0), 0);
    const totalCostAllTime = meetingsData.reduce((sum, meeting) => sum + (meeting.total_cost || 0), 0);
    const averageCostPerMeeting = meetingsData.length > 0 ? totalCostAllTime / meetingsData.length : 0;

    setStats({
      totalCostThisWeek,
      totalMeetingsThisWeek: thisWeekMeetings.length,
      averageCostPerMeeting,
      totalMeetingsAllTime: meetingsData.length,
      totalCostAllTime,
    });
  };

  // Create a new meeting
  const createMeeting = async (meetingData: MeetingInput): Promise<Meeting | null> => {
    if (!user || !profile) {
      setError('Usuario no autenticado');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // No calculamos total_cost aquí porque es una columna generada en la DB
      const { data, error } = await supabase
        .from('meetings')
        .insert([
          {
            user_id: user.id,
            title: meetingData.title,
            description: meetingData.description || null,
            attendees_count: meetingData.attendees_count,
            duration_minutes: meetingData.duration_minutes,
            average_hourly_rate: meetingData.average_hourly_rate,
            currency: profile.currency || AUTH_CONFIG.DEFAULT_CURRENCY,
            meeting_date: meetingData.meeting_date ? new Date(meetingData.meeting_date).toISOString() : new Date().toISOString(),
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Actualizar estado local inmediatamente
      if (data) {
        const updatedMeetings = [data, ...meetings];
        setMeetings(updatedMeetings);
        calculateStats(updatedMeetings);
      }
      
      return data;
    } catch (err: unknown) {
      console.error('Error creating meeting:', err);
      setError(err instanceof Error ? err.message : 'Error al crear la reunión');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update a meeting
  const updateMeeting = async (id: string, meetingData: Partial<MeetingInput>): Promise<Meeting | null> => {
    if (!user) {
      setError('Usuario no autenticado');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const updateData: MeetingUpdate = { ...meetingData };
      
      // No necesitamos recalcular total_cost porque es una columna generada en la DB
      if (meetingData.meeting_date) {
        updateData.meeting_date = new Date(meetingData.meeting_date).toISOString();
      }

      const { data, error } = await supabase
        .from('meetings')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Actualizar estado local inmediatamente
      if (data) {
        const updatedMeetings = meetings.map(meeting => 
          meeting.id === id ? data : meeting
        );
        setMeetings(updatedMeetings);
        calculateStats(updatedMeetings);
      }
      
      return data;
    } catch (err: unknown) {
      console.error('Error updating meeting:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar la reunión');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete a meeting
  const deleteMeeting = async (id: string): Promise<boolean> => {
    if (!user) {
      setError('Usuario no autenticado');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('meetings')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Actualizar estado local inmediatamente
      const updatedMeetings = meetings.filter(meeting => meeting.id !== id);
      setMeetings(updatedMeetings);
      calculateStats(updatedMeetings);
      
      return true;
    } catch (err: unknown) {
      console.error('Error deleting meeting:', err);
      setError(err instanceof Error ? err.message : 'Error al eliminar la reunión');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Calculate cost in real-time (for forms)
  const calculateCost = (attendees: number, hourlyRate: number, durationMinutes: number): number => {
    return (attendees * hourlyRate * durationMinutes) / 60;
  };

  // Load meetings on mount
  useEffect(() => {
    if (user) {
      fetchMeetings();
    }
  }, [user, fetchMeetings]);

  return {
    meetings,
    stats,
    loading,
    error,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    fetchMeetings,
    calculateCost,
  };
}
