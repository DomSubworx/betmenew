import React, { useState } from 'react';
import { ArrowLeft, Trophy } from 'lucide-react';

function ChooseOutcomeView({ bet, currentUser, invitation, onOutcomeChosen, onBack }) {
  const [selectedOutcome, setSelectedOutcome] = useState('');

  const handleSubmit = () => {
    if (!selectedOutcome) {
      alert('Bitte wähle ein Ergebnis aus!');
      return;
    }
    onOutcomeChosen(selectedOutcome);
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onBack}
            className="text-white hover:text-blue-100"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Ergebnis wählen</h1>
            <p className="text-blue-100 text-sm">Wofür setzt du?</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Bet Info */}
        <div className="bg-blue-50 rounded-xl p-4">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">{bet.title}</h2>
          {bet.description && (
            <p className="text-blue-700 text-sm mb-3">{bet.description}</p>
          )}
                     <div className="text-sm">
             <p className="text-blue-600">Token-Einsatz:</p>
             <p className="font-medium text-blue-800">💰 {bet.stakeTokens}</p>
           </div>
        </div>

        {/* Outcome Selection */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Trophy size={20} className="mr-2" />
            Wähle dein Ergebnis
          </h3>
          
          <div className="space-y-3">
            {bet.outcomes.map((outcome, index) => (
              <button
                key={index}
                onClick={() => setSelectedOutcome(outcome)}
                className={`w-full p-4 rounded-xl border-2 transition-colors text-left ${
                  selectedOutcome === outcome
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium">{outcome}</div>
                <div className="text-sm text-gray-500 mt-1">
                  {selectedOutcome === outcome ? '✓ Ausgewählt' : 'Klicken zum Auswählen'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Token Info */}
        <div className="bg-yellow-50 rounded-xl p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">Token-Info</h4>
          <div className="text-sm text-yellow-700">
            <p>• Dein aktueller Kontostand: <span className="font-medium">{currentUser.tokens} 🪙</span></p>
            <p>• Nach der Teilnahme: <span className="font-medium">{currentUser.tokens - bet.stakeTokens} 🪙</span></p>
            <p>• Gewinn bei richtigem Tipp: <span className="font-medium">{Math.floor((bet.stakeTokens * bet.participants.length) * 0.97)} 🪙</span></p>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!selectedOutcome}
          className="w-full bg-blue-500 text-white p-4 rounded-xl font-semibold hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {selectedOutcome ? `Auf "${selectedOutcome}" setzen` : 'Ergebnis auswählen'}
        </button>
      </div>
    </div>
  );
}

export default ChooseOutcomeView; 