'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useMeetings } from '@/hooks/useMeetings';
import { Meeting } from '@/lib/supabase/types';
import { logger } from '@/lib/logger';

// Layout Components
import Sidebar from '@/components/Layout/Sidebar';

// Dashboard Components
import HeroKPIs from '@/components/Dashboard/HeroKPIs';
import TrendChart from '@/components/Dashboard/TrendChart';
import TopMeetingsTable from '@/components/Dashboard/TopMeetingsTable';
import SaturationHeatmap from '@/components/Dashboard/SaturationHeatmap';
import BrokenRulesPanel from '@/components/Dashboard/BrokenRulesPanel';

// Original Components (still needed)
import NewMeetingForm from '@/components/NewMeetingForm';
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
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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

  const handleQuickAdd = () => {
    setShowNewMeetingForm(true);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      // Navigation will be handled by AuthContext
    } catch (error) {
      logger.error('Logout failed', { error });
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#F7F9FC] flex">
        {/* Sidebar - Fixed */}
        <Sidebar 
          isCollapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
          user={user}
          onLogout={handleLogout}
        />

        {/* Mobile Overlay - Not needed with relative sidebar */}
        
        {/* Main Content - Normal flex layout */}
        <div className="flex-1 flex flex-col overflow-hidden">{/* Main Content Area */}
          {/* Main Content Area */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F7F9FC]">
            <div className="max-w-7xl mx-auto px-6 py-6">
              
              {/* Integrated Header - Part of main content */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Mobile sidebar toggle - More visible */}
                    <button
                      onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                      className="p-2 rounded-lg hover:bg-white border border-[#E5E9F0] text-[#6B7280] hover:text-[#1B2A41] md:hidden transition-all duration-200 shadow-sm"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                    
                    <div>
                      <h1 className="text-2xl font-semibold text-[#1B2A41] mb-1">Dashboard</h1>
                      <p className="text-sm text-[#6B7280]">
                        {stats ? `${stats.totalMeetingsAllTime} reuniones analizadas` : 'Gestiona el costo y eficiencia de tus reuniones'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="flex items-center space-x-3">
                    <button className="text-[#6B7280] hover:text-[#1B2A41] p-2 rounded-lg hover:bg-white border border-transparent hover:border-[#E5E9F0] transition-all duration-200">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                    <button 
                      onClick={handleQuickAdd}
                      className="bg-[#1B2A41] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#2a3f5f] transition-all duration-200 flex items-center space-x-2 shadow-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Nueva reunión</span>
                    </button>
                  </div>
                </div>
              </div>
              {/* Quick Actions Panel - Better positioned at top when open */}
              {showNewMeetingForm && (
                <div className="mb-6">
                  <div className="bg-white rounded-lg border border-[#E5E9F0] shadow-sm">
                    <div className="px-6 py-4 border-b border-[#E5E9F0] bg-[#F7F9FC]/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-[#1B2A41] rounded-md flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-[#1B2A41]">Nueva reunión</h3>
                            <p className="text-sm text-[#6B7280]">Calcula el costo de tu próxima reunión</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowNewMeetingForm(false)}
                          className="text-[#6B7280] hover:text-[#1B2A41] p-2 rounded-md hover:bg-white transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="p-6">
                      <NewMeetingForm
                        onSuccess={handleNewMeetingSuccess}
                        onCancel={() => setShowNewMeetingForm(false)}
                        createMeeting={createMeeting}
                        calculateCost={calculateCost}
                        loading={isCreating}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-6 bg-[#FF5C5C]/10 border border-[#FF5C5C]/20 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-[#FF5C5C] mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-[#FF5C5C]">
                        Ha ocurrido un error
                      </h3>
                      <p className="text-sm text-[#FF5C5C]/80 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Hero KPIs */}
              <HeroKPIs stats={stats} loading={loading} />

              {/* Main Content Grid - Stripe Style */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Trend Chart - Takes 2 columns */}
                <div className="lg:col-span-2">
                  <TrendChart loading={loading} meetings={meetings} />
                </div>

                {/* Saturation Heatmap - Takes 1 column */}
                <div className="lg:col-span-1">
                  <SaturationHeatmap meetings={meetings} loading={loading} />
                </div>
              </div>

              {/* Secondary Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Meetings Table - Takes 2 columns */}
                <div className="lg:col-span-2">
                  <TopMeetingsTable meetings={meetings} loading={loading} />
                </div>

                {/* Broken Rules Panel - Takes 1 column */}
                <div className="lg:col-span-1">
                  <BrokenRulesPanel meetings={meetings} loading={loading} />
                </div>
              </div>
            </div>
          </main>
        </div>

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
