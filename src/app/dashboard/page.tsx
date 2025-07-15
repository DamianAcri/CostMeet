'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useMeetings } from '@/hooks/useMeetings';
import { Meeting } from '@/lib/supabase/types';
import StatsCards from '@/components/StatsCards';
import NewMeetingForm from '@/components/NewMeetingForm';
import MeetingsList from '@/components/MeetingsList';
import EditMeetingModal from '@/components/EditMeetingModal';

export default function DashboardPage() {
  const { user, profile, signOut } = useAuth();
  const { 
    meetings, 
    stats, 
    loading, 
    error, 
    createMeeting, 
    updateMeeting, 
    calculateCost, 
    deleteMeeting,
    isCreating,
    isUpdating,
    isDeleting
  } = useMeetings();
  
  const [showNewMeetingForm, setShowNewMeetingForm] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);

  const handleNewMeetingSuccess = () => {
    setShowNewMeetingForm(false);
  };

  const handleEditMeeting = (meeting: Meeting) => {
    setEditingMeeting(meeting);
  };

  const handleEditSuccess = () => {
    setEditingMeeting(null);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">
                  CostMeet
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {profile?.avatar_url && (
                    <Image
                      src={profile.avatar_url}
                      alt={profile.full_name || 'Avatar'}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <span className="text-sm text-gray-700">
                    {profile?.full_name || user?.email}
                  </span>
                </div>
                
                <button
                  onClick={signOut}
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Message */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              ¡Bienvenido, {profile?.full_name?.split(' ')[0] || 'Usuario'}!
            </h2>
            <p className="text-gray-600">
              Aquí puedes gestionar y calcular el costo de tus reuniones
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="mb-8">
            <StatsCards stats={stats} loading={loading} />
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-0">
                Acciones Rápidas
              </h3>
              
              <button
                onClick={() => setShowNewMeetingForm(!showNewMeetingForm)}
                className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {showNewMeetingForm ? 'Ocultar Formulario' : 'Nueva Reunión'}
              </button>
            </div>

            {/* New Meeting Form (Collapsible) */}
            {showNewMeetingForm && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <NewMeetingForm
                  onSuccess={handleNewMeetingSuccess}
                  onCancel={() => setShowNewMeetingForm(false)}
                  createMeeting={createMeeting}
                  calculateCost={calculateCost}
                  loading={isCreating}
                />
              </div>
            )}
          </div>

          {/* Meetings List */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Reuniones
                </h3>
                <p className="text-sm text-gray-500 mt-1 sm:mt-0">
                  {meetings.length} reunión{meetings.length !== 1 ? 'es' : ''} registrada{meetings.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            
            <div className="p-6">
              <MeetingsList
                meetings={meetings}
                onEditMeeting={handleEditMeeting}
                deleteMeeting={deleteMeeting}
                loading={isDeleting}
              />
            </div>
          </div>
        </main>

        {/* Edit Meeting Modal */}
        <EditMeetingModal
          meeting={editingMeeting}
          isOpen={!!editingMeeting}
          onClose={() => setEditingMeeting(null)}
          onSuccess={handleEditSuccess}
          updateMeeting={updateMeeting}
          calculateCost={calculateCost}
          loading={isUpdating}
        />
      </div>
    </ProtectedRoute>
  );
}
