'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  user?: {
    email?: string;
    name?: string;
  } | null;
  onLogout?: () => Promise<void>;
}

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  isActive?: boolean;
}

export default function Sidebar({ isCollapsed, onToggle, user, onLogout }: SidebarProps) {
  const pathname = usePathname();

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.name) {
      return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  // Get display name
  const getDisplayName = () => {
    if (user?.name) return user.name;
    if (user?.email) return user.email.split('@')[0];
    return 'Usuario';
  };

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '▦',
      href: '/dashboard',
      isActive: pathname === '/dashboard'
    },
    {
      id: 'calendar',
      label: 'Calendario',
      icon: '◫',
      href: '/calendar',
      isActive: pathname === '/calendar'
    },
    {
      id: 'meetings',
      label: 'Reuniones',
      icon: '◐',
      href: '/meetings',
      isActive: pathname === '/meetings'
    },
    {
      id: 'savings',
      label: 'Ahorros',
      icon: '◗',
      href: '/savings',
      isActive: pathname === '/savings'
    },
    {
      id: 'team',
      label: 'Team Cost Map',
      icon: '◢',
      href: '/team',
      isActive: pathname === '/team'
    }
  ];

  return (
    <div className={`bg-white border-r border-[#E5E9F0] transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#E5E9F0]">
          {!isCollapsed ? (
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-[#1B2A41] rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">C</span>
              </div>
              <h1 className="text-lg font-semibold text-[#1B2A41]">CostMeet</h1>
            </div>
          ) : (
            <div className="w-6 h-6 bg-[#1B2A41] rounded flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-xs">C</span>
            </div>
          )}
        </div>

        {/* Collapse/Expand Button - More visible */}
        <div className="px-4 py-2">
          <button
            onClick={onToggle}
            className={`w-full flex items-center justify-center p-2 text-[#6B7280] hover:text-[#1B2A41] 
              hover:bg-[#F7F9FC] rounded-lg border border-[#E5E9F0] hover:border-[#D1D9E0] 
              transition-all duration-200 shadow-sm hover:shadow-md ${
              isCollapsed ? 'px-2 bg-[#F7F9FC]/50' : 'px-3'
            }`}
            title={isCollapsed ? 'Expandir sidebar' : 'Contraer sidebar'}
          >
            <svg className={`w-4 h-4 transition-transform duration-200 ${isCollapsed ? 'scale-110' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isCollapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
            </svg>
            {!isCollapsed && (
              <span className="ml-2 text-sm font-medium">Contraer</span>
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                item.isActive
                  ? 'bg-[#1B2A41] text-white shadow-sm'
                  : 'text-[#6B7280] hover:text-[#1B2A41] hover:bg-[#F7F9FC]'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {!isCollapsed && (
                <span className="ml-3">{item.label}</span>
              )}
            </Link>
          ))}
        </nav>

        {/* User Profile - Simplified single section */}
        <div className="p-4 border-t border-[#E5E9F0]">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
            <button 
              className={`${isCollapsed ? 'w-10 h-10' : 'w-9 h-9'} bg-gradient-to-br from-[#1B2A41] to-[#356AFF] rounded-full flex items-center justify-center text-white text-sm font-semibold transition-all duration-200 hover:scale-105 flex-shrink-0`}
              title={isCollapsed ? `Ver perfil de ${getDisplayName()}` : 'Ver perfil'}
            >
              {getUserInitials()}
            </button>
            {!isCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1B2A41] truncate">{getDisplayName()}</p>
                  <p className="text-xs text-[#6B7280] truncate">
                    {user?.email || 'usuario@costmeet.com'}
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  <button 
                    className="text-[#6B7280] hover:text-[#1B2A41] p-1.5 rounded transition-colors" 
                    title="Configuración"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                  <button 
                    className="text-[#6B7280] hover:text-[#FF5C5C] p-1.5 rounded transition-colors" 
                    title="Cerrar sesión"
                    onClick={onLogout}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
