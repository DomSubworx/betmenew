import React from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, Clock } from 'lucide-react';

function TokenLogView({ currentUser, tokenLogs, users, onBack }) {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getTokenChangeIcon = (change) => {
    if (change > 0) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
  };

  const getTokenChangeColor = (change) => {
    if (change > 0) {
      return 'text-green-600';
    } else {
      return 'text-red-600';
    }
  };

  const getReasonLabel = (reason) => {
    const reasonLabels = {
      'bet_stake': 'Bet Stake',
      'bet_won': 'Bet Won',
      'bet_lost': 'Bet Lost',
      'stake_returned_tie': 'Stake Returned (Tie)',
      'platform_fee': 'Platform Fee',
      'manual_update': 'Manual Update',
      'initial_balance': 'Initial Balance'
    };
    return reasonLabels[reason] || reason;
  };

  const getReasonDescription = (reason, betTitle) => {
    switch (reason) {
      case 'bet_stake':
        return `Staked tokens for bet: "${betTitle}"`;
      case 'bet_won':
        return `Won bet: "${betTitle}"`;
      case 'bet_lost':
        return `Lost bet: "${betTitle}"`;
      case 'stake_returned_tie':
        return `Stake returned due to tie in bet: "${betTitle}"`;
      case 'platform_fee':
        return 'Platform fee deducted';
      case 'manual_update':
        return 'Manual token adjustment';
      case 'initial_balance':
        return 'Initial token balance';
      default:
        return betTitle ? `Transaction related to: "${betTitle}"` : 'Token transaction';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary-500 text-white p-4 max-w-md mx-auto">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 hover:text-primary-100 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <h1 className="text-xl font-semibold">Token History</h1>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>
        
        {/* Token Balance Display */}
        <div className="mt-4 text-center">
          <div className="text-2xl font-bold">
            💰 {currentUser.tokens} Tokens
          </div>
          <div className="text-primary-100 text-sm">
            Current Balance
          </div>
        </div>
      </div>

      {/* Token History List */}
      <div className="p-4 pb-20 max-w-md mx-auto">
        {tokenLogs.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 text-lg mb-2">No token transactions yet</div>
            <div className="text-gray-400 text-sm">
              Your token history will appear here when you participate in bets
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {tokenLogs.map((log) => (
              <div
                key={log.id}
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getTokenChangeIcon(log.change)}
                    <div>
                      <div className="font-medium text-gray-900">
                        {getReasonLabel(log.reason)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {getReasonDescription(log.reason, log.betTitle)}
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                        <Clock size={12} />
                        <span>{formatTime(log.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`font-bold text-lg ${getTokenChangeColor(log.change)}`}>
                      {log.change > 0 ? '+' : ''}{log.change} Tokens
                    </div>
                    {log.balanceAfter && (
                      <div className="text-xs text-gray-500">
                        Balance: {log.balanceAfter}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TokenLogView; 