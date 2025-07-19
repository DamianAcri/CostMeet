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
import SaturationHeatmap from '@/components/Dashboard/SaturationHeatmap';
import BrokenRulesPanel from '@/components/Dashboard/BrokenRulesPanel';
import ConnectCalendarBanner from '@/components/Dashboard/ConnectCalendarBanner';

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
  const [showCalendarBanner, setShowCalendarBanner] = useState(true); // Show by default - could check sync status

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
      <div className="min-h-screen bg-slate-50 flex">
        {/* Sidebar - Fixed */}
        <Sidebar 
          isCollapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
          user={user}
          onLogout={handleLogout}
        />

        {/* Main Content - With margin to account for fixed sidebar */}
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}>
          {/* Main Content Area */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50">
            <div className="max-w-7xl mx-auto px-6 py-6">
              
              {/* Integrated Header - Financial Executive Style */}
              <div className="mb-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Mobile sidebar toggle */}
                    <button
                      onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                      className="p-2.5 rounded-lg hover:bg-white border border-slate-200 text-slate-500 hover:text-slate-700 md:hidden transition-all duration-200 shadow-xs"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                    
                    <div>
                      <h1 className="text-3xl font-bold text-slate-900 mb-1.5 heading-financial">
                        Meeting Analytics
                      </h1>
                      <p className="text-base text-slate-600 body-financial">
                        {stats ? `${stats.totalMeetingsAllTime} meetings analyzed` : 'Track meeting costs and optimize team productivity'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Quick Actions - Stripe-inspired */}
                  <div className="flex items-center space-x-3">
                    <button className="text-slate-500 hover:text-slate-700 p-2.5 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-all duration-200 shadow-xs">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                    <button 
                      onClick={handleQuickAdd}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-blue-600 transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="font-medium">Add Meeting</span>
                    </button>
                  </div>
                </div>
              </div>
              {/* Connect Calendar Banner - Only show if no sync */}
              {showCalendarBanner && (
                <ConnectCalendarBanner onClose={() => setShowCalendarBanner(false)} />
              )}

              {/* Quick Actions Panel - Stripe-inspired */}
              {showNewMeetingForm && (
                <div className="mb-8">
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm card-elevated">
                    <div className="px-8 py-6 border-b border-slate-200 bg-slate-50/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-slate-900 heading-financial">Add New Meeting</h3>
                            <p className="text-sm text-slate-600 body-financial">Calculate the cost of your next meeting</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowNewMeetingForm(false)}
                          className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-white transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="p-8">
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

              {/* Error Message - Stripe-inspired */}
              {error && (
                <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-semibold text-red-800">
                        An error occurred
                      </h3>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
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

              {/* Secondary Section - Financial Analytics Style */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activity Panel - Enhanced */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm card-elevated">
                  <div className="px-8 py-6 border-b border-slate-200">
                    <h3 className="text-xl font-semibold text-slate-900 heading-financial">Recent Activity</h3>
                    <p className="text-sm text-slate-600 mt-1 body-financial">Latest meetings and cost analysis</p>
                  </div>
                  <div className="p-8">
                    {loading ? (
                      <div className="space-y-6">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="flex space-x-4">
                              <div className="w-12 h-12 bg-slate-100 rounded-xl"></div>
                              <div className="flex-1 space-y-3">
                                <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                                <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : meetings && meetings.length > 0 ? (
                      <div className="space-y-6">
                        {meetings.slice(0, 3).map((meeting) => (
                          <div key={meeting.id} className="flex items-center space-x-4 p-4 rounded-xl hover:bg-slate-50 transition-colors duration-200 border border-transparent hover:border-slate-200">
                            <div className="w-12 h-12 bg-gradient-to-r from-slate-600 to-slate-700 rounded-lg flex items-center justify-center">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-900 truncate">{meeting.title}</p>
                              <p className="text-xs text-slate-500 mt-1">
                                {meeting.attendees_count} participants • {meeting.duration_minutes} min
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-slate-900 financial-metric">
                                €{((meeting.attendees_count * meeting.average_hourly_rate * meeting.duration_minutes) / 60).toFixed(0)}
                              </p>
                              <p className="text-xs text-slate-500 font-medium">total cost</p>
                            </div>
                          </div>
                        ))}
                        <div className="pt-6 border-t border-slate-200">
                          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors flex items-center space-x-1">
                            <span>View all meetings</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <h4 className="text-base font-semibold text-slate-900 mb-2">No meetings yet</h4>
                        <p className="text-sm text-slate-500">Start by adding your first meeting to see analytics here</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Broken Rules Panel - Enhanced */}
                <div>
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
