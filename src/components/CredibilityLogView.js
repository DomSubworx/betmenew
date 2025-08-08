import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { formatTime } from '../utils.js';

function CredibilityLogView({ currentUser, credibilityLogs, users, onBack }) {
  const userLogs = credibilityLogs.filter(log => log.userId === currentUser.id);

  const getReasonIcon = (change) => {
    if (change < 0) return <TrendingDown size={16} className="text-red-500" />;
    return <TrendingUp size={16} className="text-green-500" />;
  };

  const getReasonColor = (change) => {
    if (change < 0) return 'text-red-600';
    return 'text-green-600';
  };

  return (
    <motion.div className="max-w-md mx-auto bg-white min-h-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="bg-primary-500 text-white p-6">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onBack}
            className="text-white hover:text-primary-100"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Credibility</h1>
            <p className="text-primary-100 text-sm">Change History</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Current Credibility Status */}
        <motion.div className="bg-primary-50 rounded-xl p-4 mb-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {currentUser.credibility}/100
            </h2>
                         <p className="text-gray-600 text-sm">Current Credibility</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div 
                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${currentUser.credibility}%` }}
              ></div>
            </div>
          </div>
        </motion.div>

        {/* Credibility Log */}
        <div className="space-y-4">
                     <h3 className="text-lg font-semibold text-gray-800">Change History</h3>
          
          {userLogs.length === 0 ? (
            <motion.div className="text-center py-8 text-gray-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Clock size={48} className="mx-auto mb-4 opacity-50" />
                             <p>No changes available</p>
               <p className="text-sm">Your credibility is still unchanged</p>
            </motion.div>
          ) : (
            <AnimatePresence initial={false}>
            {userLogs.map((log, index) => (
              <motion.div key={log.id} className="bg-white border rounded-xl p-4 shadow-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getReasonIcon(log.change)}
                                         <span className={`font-medium ${getReasonColor(log.change)}`}>
                       {log.change > 0 ? '+' : ''}{log.change} points
                     </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatTime(log.timestamp)}
                  </span>
                </div>
                
                <p className="text-gray-700 text-sm mb-2">{log.reason}</p>
                
                                 {log.betId && (
                   <div className="text-xs text-gray-500">
                     Bet ID: {log.betId}
                   </div>
                 )}
                
                                 <div className="text-xs text-gray-400 mt-2">
                   New Credibility: {log.newCredibility}/100
                 </div>
              </motion.div>
            ))}
            </AnimatePresence>
          )}
        </div>

        {/* Credibility Rules */}
        <motion.div className="mt-8 bg-gray-50 rounded-xl p-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                     <h3 className="text-lg font-semibold text-gray-800 mb-3">Rules</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <TrendingDown size={16} className="text-red-500" />
                             <span>Vote against majority: -15 points</span>
             </div>
             <div className="flex items-center space-x-2">
               <TrendingDown size={16} className="text-red-500" />
               <span>No vote: -10 points</span>
             </div>
             <div className="flex items-center space-x-2">
               <TrendingUp size={16} className="text-green-500" />
               <span>Vote with majority: No change</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default CredibilityLogView; 