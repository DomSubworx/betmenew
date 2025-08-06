import React, { useState } from 'react';
import { ArrowLeft, Plus, X, Users } from 'lucide-react';
import { getFriends } from '../utils.js';

function CreateBetView({ currentUser, users, onBack, onSubmit }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stakeTokens, setStakeTokens] = useState('');
  const [outcomes, setOutcomes] = useState(['', '']);
  const [selectedFriends, setSelectedFriends] = useState([]);
  
  const friends = getFriends(currentUser.id, users);

  const toggleFriend = (friendId) => {
    setSelectedFriends(prev => 
      prev.includes(friendId) 
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const addOutcome = () => {
    setOutcomes([...outcomes, '']);
  };

  const updateOutcome = (index, value) => {
    const newOutcomes = [...outcomes];
    newOutcomes[index] = value;
    setOutcomes(newOutcomes);
  };

  const removeOutcome = (index) => {
    if (outcomes.length > 2) {
      setOutcomes(outcomes.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      alert('Bitte gib einen Titel ein!');
      return;
    }
    
    if (outcomes.filter(o => o.trim()).length < 2) {
      alert('Bitte gib mindestens 2 mögliche Ergebnisse ein!');
      return;
    }
    
    if (!stakeTokens || parseInt(stakeTokens) <= 0) {
      alert('Bitte gib einen gültigen Token-Einsatz ein!');
      return;
    }

    const betData = {
      title: title.trim(),
      description: description.trim(),
      stakeTokens: parseInt(stakeTokens),
      outcomes: outcomes.filter(o => o.trim()),
      participants: selectedFriends
    };

    onSubmit(betData);
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onBack}
            className="text-white hover:text-green-100"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Neue Wette</h1>
            <p className="text-green-100 text-sm">Erstelle eine neue Wette</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titel der Wette *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z.B. Bayern gewinnt gegen Dortmund"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Beschreibung
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optionale Beschreibung..."
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Token-Einsatz *
            </label>
            <input
              type="number"
              value={stakeTokens}
              onChange={(e) => setStakeTokens(e.target.value)}
              placeholder="50"
              min="1"
              max={currentUser.tokens}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Verfügbar: {currentUser.tokens} Tokens
            </p>
          </div>
        </div>

        {/* Possible Outcomes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Mögliche Ergebnisse *
          </label>
          <div className="space-y-2">
            {outcomes.map((outcome, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={outcome}
                  onChange={(e) => updateOutcome(index, e.target.value)}
                  placeholder={`Ergebnis ${index + 1}`}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                {outcomes.length > 2 && (
                  <button
                    onClick={() => removeOutcome(index)}
                    className="p-3 text-red-500 hover:text-red-700"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addOutcome}
              className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-green-500 hover:text-green-500 transition-colors flex items-center justify-center space-x-2"
            >
              <Plus size={20} />
              <span>Weiteres Ergebnis hinzufügen</span>
            </button>
          </div>
        </div>

        {/* Friend Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Freunde einladen
          </label>
          {friends.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users size={48} className="mx-auto mb-4 opacity-50" />
              <p>Keine Freunde verfügbar</p>
              <p className="text-sm">Füge Freunde in deinem Profil hinzu</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {friends.map(friend => (
                <button
                  key={friend.id}
                  onClick={() => toggleFriend(friend.id)}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    selectedFriends.includes(friend.id)
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">{friend.username}</div>
                  <div className="text-sm text-gray-500">💰 {friend.tokens} Tokens</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="w-full bg-green-500 text-white p-4 rounded-xl font-semibold hover:bg-green-600 transition-colors"
        >
          Wette erstellen
        </button>
      </div>
    </div>
  );
}

export default CreateBetView; 