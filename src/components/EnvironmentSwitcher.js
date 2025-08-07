import React from 'react';
import { Settings, Database, Users } from 'lucide-react';
import { isDemoMode } from '../config.js';
import { dataService } from '../services/dataService.js';

function EnvironmentSwitcher({ onEnvironmentChange }) {
  const currentMode = isDemoMode() ? 'Demo' : 'Supabase';
  
  const handleResetDemoData = () => {
    if (window.confirm('Are you sure you want to reset all demo data? This cannot be undone.')) {
      dataService.resetDemoData();
      window.location.reload();
    }
  };

  const handleDebugInvitations = () => {
    console.log('Current invitations:', dataService.getInvitations());
    console.log('Demo invitations:', dataService.demoDataService?.demoInvitations || 'Not available');
  };

  const handleSwitchEnvironment = () => {
    const newMode = isDemoMode() ? 'supabase' : 'demo';
    localStorage.setItem('REACT_APP_ENVIRONMENT', newMode);
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border rounded-lg shadow-lg p-4 max-w-xs">
      <div className="flex items-center space-x-2 mb-3">
        <Settings size={16} className="text-gray-500" />
        <h3 className="text-sm font-medium text-gray-700">Environment</h3>
      </div>
      
      <div className="space-y-2">
        {/* Current Environment */}
        <div className="flex items-center space-x-2">
          {isDemoMode() ? (
            <Users size={14} className="text-blue-500" />
          ) : (
            <Database size={14} className="text-green-500" />
          )}
          <span className="text-xs text-gray-600">
            Current: <span className="font-medium">{currentMode}</span>
          </span>
        </div>
        

        
        {/* Actions */}
        <div className="space-y-1 pt-2">
          <button
            onClick={handleSwitchEnvironment}
            className="w-full text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
          >
            Switch to {isDemoMode() ? 'Supabase' : 'Demo'}
          </button>
          
          {isDemoMode() && (
            <button
              onClick={handleResetDemoData}
              className="w-full text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors"
            >
              Reset Demo Data
            </button>
          )}
          
          {isDemoMode() && (
            <button
              onClick={handleDebugInvitations}
              className="w-full text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600 transition-colors"
            >
              Debug Invitations
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default EnvironmentSwitcher; 