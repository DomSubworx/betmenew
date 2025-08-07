import React from 'react';
import { Home, User } from 'lucide-react';

function BottomNavigation({ currentView, onNavigate, currentUser }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex justify-around items-center max-w-md mx-auto">
        <button
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
            currentView === 'home'
              ? 'text-primary-500 bg-primary-50'
              : 'text-gray-500 hover:text-primary-500'
          }`}
        >
          <Home size={24} />
          <span className="text-xs font-medium">Home</span>
        </button>
        
        <button
          onClick={() => onNavigate('profile')}
          className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
            currentView === 'profile'
              ? 'text-primary-500 bg-primary-50'
              : 'text-gray-500 hover:text-primary-500'
          }`}
        >
          <User size={24} />
          <span className="text-xs font-medium">Profile</span>
        </button>
      </div>
    </div>
  );
}

export default BottomNavigation; 