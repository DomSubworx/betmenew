import React, { useState } from 'react';
import { ArrowLeft, Plus, X, Users, Check } from 'lucide-react';
import { getFriends } from '../utils.js';
import { useToast } from '../contexts/ToastContext.js';

function CreateBetView({ currentUser, users, onBack, onSubmit }) {
  const { showError } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stakeTokens, setStakeTokens] = useState('');
  const [outcomes, setOutcomes] = useState(['', '']);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [creatorOutcome, setCreatorOutcome] = useState('');
  const [step, setStep] = useState(1); // 1: Basic info, 2: Choose outcome, 3: Select friends
  
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

  const handleNextStep = () => {
    if (step === 1) {
      if (!title.trim()) {
        showError('Please enter a title!');
        return;
      }
      
      if (outcomes.filter(o => o.trim()).length < 2) {
        showError('Please enter at least 2 possible outcomes!');
        return;
      }
      
      if (!stakeTokens || parseInt(stakeTokens) <= 0) {
        showError('Please enter a valid token stake!');
        return;
      }
      
      setStep(2);
    } else if (step === 2) {
      if (!creatorOutcome) {
        showError('Please select which outcome you want to bet on!');
        return;
      }
      
      setStep(3);
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = () => {
    if (selectedFriends.length === 0) {
      showError('Please select at least one friend to invite!');
      return;
    }

    const betData = {
      title: title.trim(),
      description: description.trim(),
      stakeTokens: parseInt(stakeTokens),
      outcomes: outcomes.filter(o => o.trim()),
      participants: [currentUser.id, ...selectedFriends],
      participantBets: {
        [currentUser.id]: creatorOutcome
      }
    };

    console.log('🎲 CreateBetView submitting bet data:', betData);
    onSubmit(betData);
  };

  const validOutcomes = outcomes.filter(o => o.trim());

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6">
        <div className="flex items-center space-x-4">
          <button 
            onClick={step === 1 ? onBack : handlePreviousStep}
            className="text-white hover:text-green-100"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">New Bet</h1>
            <p className="text-green-100 text-sm">
              {step === 1 && 'Step 1: Basic Information'}
              {step === 2 && 'Step 2: Choose Your Bet'}
              {step === 3 && 'Step 3: Invite Friends'}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bet Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Bayern wins against Dortmund"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description..."
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token Stake *
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
                Available: {currentUser.tokens} tokens
              </p>
            </div>

            {/* Possible Outcomes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Possible Outcomes *
              </label>
              <div className="space-y-2">
                {outcomes.map((outcome, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={outcome}
                      onChange={(e) => updateOutcome(index, e.target.value)}
                      placeholder={`Outcome ${index + 1}`}
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
                  <span>Add another outcome</span>
                </button>
              </div>
            </div>

            <button
              onClick={handleNextStep}
              className="w-full bg-green-500 text-white p-4 rounded-xl font-semibold hover:bg-green-600 transition-colors"
            >
              Next: Choose Your Bet
            </button>
          </div>
        )}

        {/* Step 2: Choose Outcome */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Which outcome do you want to bet on?</h3>
              <p className="text-sm text-blue-600">
                You're betting that this outcome will win. Other participants will bet on different outcomes.
              </p>
            </div>

            <div className="space-y-3">
              {validOutcomes.map((outcome, index) => (
                <button
                  key={index}
                  onClick={() => setCreatorOutcome(outcome)}
                  className={`w-full p-4 rounded-lg border-2 transition-colors text-left ${
                    creatorOutcome === outcome
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{outcome}</div>
                    {creatorOutcome === outcome && (
                      <Check size={20} className="text-green-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handlePreviousStep}
                className="flex-1 bg-gray-500 text-white p-4 rounded-xl font-semibold hover:bg-gray-600 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleNextStep}
                disabled={!creatorOutcome}
                className="flex-1 bg-green-500 text-white p-4 rounded-xl font-semibold hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Next: Invite Friends
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Friend Selection */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">You're betting on: {creatorOutcome}</h3>
              <p className="text-sm text-green-600">
                Now invite friends to bet on different outcomes.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Invite Friends *
              </label>
              {friends.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No friends available</p>
                  <p className="text-sm">Add friends in your profile</p>
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

            <div className="flex space-x-3">
              <button
                onClick={handlePreviousStep}
                className="flex-1 bg-gray-500 text-white p-4 rounded-xl font-semibold hover:bg-gray-600 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={selectedFriends.length === 0}
                className="flex-1 bg-green-500 text-white p-4 rounded-xl font-semibold hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Create Bet
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateBetView; 