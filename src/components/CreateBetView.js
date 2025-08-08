import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Users, Target, DollarSign, CheckCircle, Loader2, Vote } from 'lucide-react';

function CreateBetView({ currentUser, users, onBack, onSubmit }) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    stakeTokens: 50,
    selectedFriends: [],
    outcomes: ['', ''],
    creatorChoice: '' // 🆕 NEW: Creator's chosen outcome
  });

  const friends = users.filter(user => 
    user.id !== currentUser.id && 
    currentUser.friends?.includes(user.id)
  );

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const betData = {
      title: formData.title,
      description: formData.description,
      creatorId: currentUser.id,
      participants: [currentUser.id, ...formData.selectedFriends],
      stakeTokens: formData.stakeTokens,
      outcomes: formData.outcomes.filter(outcome => outcome.trim() !== ''),
      creatorChoice: formData.creatorChoice, // 🆕 NEW: Include creator's choice
      status: 'active'
    };

    await onSubmit(betData);
    setIsLoading(false);
  };

  const toggleFriend = (friendId) => {
    setFormData(prev => ({
      ...prev,
      selectedFriends: prev.selectedFriends.includes(friendId)
        ? prev.selectedFriends.filter(id => id !== friendId)
        : [...prev.selectedFriends, friendId]
    }));
  };

  const addOutcome = () => {
    if (formData.outcomes.length < 4) {
      setFormData(prev => ({
        ...prev,
        outcomes: [...prev.outcomes, '']
      }));
    }
  };

  const removeOutcome = (index) => {
    if (formData.outcomes.length > 2) {
      setFormData(prev => ({
        ...prev,
        outcomes: prev.outcomes.filter((_, i) => i !== index)
      }));
    }
  };

  const updateOutcome = (index, value) => {
    setFormData(prev => ({
      ...prev,
      outcomes: prev.outcomes.map((outcome, i) => i === index ? value : outcome)
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.title.trim() !== ''; // Description is optional
      case 2:
        return formData.outcomes.filter(o => o.trim() !== '').length >= 2;
      case 3:
        return formData.creatorChoice.trim() !== ''; // 🆕 NEW: Must choose an outcome
      case 4:
        return formData.selectedFriends.length > 0;
      default:
        return false;
    }
  };

  const stepConfig = [
    { title: 'Bet Details', icon: Target, color: 'primary' },
    { title: 'Outcomes', icon: CheckCircle, color: 'accent' },
    { title: 'Your Choice', icon: Vote, color: 'secondary' }, // 🆕 NEW: Creator's choice step
    { title: 'Invite Friends', icon: Users, color: 'neutral' } // 🆕 UPDATED: Moved to step 4
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.div 
        className="bg-primary-500 text-white p-4 max-w-md mx-auto"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <motion.button
            onClick={onBack}
            className="flex items-center space-x-2 hover:text-primary-100 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </motion.button>
          <h1 className="text-xl font-semibold">Create New Bet</h1>
          <div className="w-20"></div>
        </div>

        {/* Progress Steps */}
        <div className="mt-6 flex justify-between items-center">
          {stepConfig.map((config, index) => (
            <div key={index} className="flex flex-col items-center">
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step > index + 1 
                    ? 'bg-white text-primary-500' 
                    : step === index + 1 
                    ? 'bg-white text-primary-500' 
                    : 'bg-primary-400 text-white'
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
              >
                {step > index + 1 ? (
                  <CheckCircle size={20} />
                ) : (
                  <config.icon size={20} />
                )}
              </motion.div>
              <span className="text-xs mt-1 text-primary-100">{config.title}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Content */}
      <div className="p-4 pb-20 max-w-md mx-auto">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <Target size={20} className="mr-2 text-primary-500" />
                  Bet Details
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bet Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Bayern wins against Dortmund"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your bet..."
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stake Amount
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.stakeTokens}
                        onChange={(e) => setFormData(prev => ({ ...prev, stakeTokens: parseInt(e.target.value) || 0 }))}
                        min="10"
                        max="1000"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />

                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Each participant will stake this amount
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <CheckCircle size={20} className="mr-2 text-accent-500" />
                  Bet Outcomes
                </h2>
                
                <div className="space-y-4">
                  {formData.outcomes.map((outcome, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="text"
                        value={outcome}
                        onChange={(e) => updateOutcome(index, e.target.value)}
                        placeholder={`Outcome ${index + 1}`}
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                      />
                      {formData.outcomes.length > 2 && (
                        <motion.button
                          onClick={() => removeOutcome(index)}
                          className="p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          ×
                        </motion.button>
                      )}
                    </motion.div>
                  ))}
                  
                  {formData.outcomes.length < 4 && (
                    <motion.button
                      onClick={addOutcome}
                      className="w-full p-3 border-2 border-dashed border-accent-300 text-accent-600 rounded-lg hover:bg-accent-50 transition-colors flex items-center justify-center space-x-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Plus size={20} />
                      <span>Add Outcome</span>
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <Vote size={20} className="mr-2 text-secondary-500" />
                  Your Choice
                </h2>
                
                <p className="text-gray-600 mb-4">
                  Which outcome do you believe will happen? This is your personal bet choice.
                </p>
                
                <div className="space-y-3">
                  {formData.outcomes.filter(outcome => outcome.trim() !== '').map((outcome, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.creatorChoice === outcome
                          ? 'border-secondary-500 bg-secondary-50'
                          : 'border-gray-200 hover:border-secondary-300'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, creatorChoice: outcome }))}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            id={`choice-${index}`}
                            name="creatorChoice"
                            value={outcome}
                            checked={formData.creatorChoice === outcome}
                            onChange={() => setFormData(prev => ({ ...prev, creatorChoice: outcome }))}
                            className="w-4 h-4 text-secondary-600 focus:ring-secondary-500 border-gray-300"
                          />
                          <label htmlFor={`choice-${index}`} className="text-gray-800 font-medium">
                            {outcome}
                          </label>
                        </div>
                        {formData.creatorChoice === outcome && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-6 h-6 bg-secondary-500 rounded-full flex items-center justify-center"
                          >
                            <CheckCircle size={16} className="text-white" />
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <Users size={20} className="mr-2 text-neutral-500" />
                  Invite Friends
                </h2>
                
                {friends.length === 0 ? (
                  <div className="text-center py-8">
                    <Users size={48} className="mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">No friends to invite</p>
                    <p className="text-sm text-gray-400">Add friends to your profile first</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {friends.map((friend, index) => (
                      <motion.div
                        key={friend.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.selectedFriends.includes(friend.id)
                            ? 'border-secondary-500 bg-secondary-50'
                            : 'border-gray-200 hover:border-secondary-300'
                        }`}
                        onClick={() => toggleFriend(friend.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center">
                              <span className="text-secondary-600 font-semibold">
                                {friend.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{friend.username}</p>
                              <p className="text-sm text-gray-500">💰 {friend.tokens} Tokens</p>
                            </div>
                          </div>
                          {formData.selectedFriends.includes(friend.id) && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-6 h-6 bg-secondary-500 rounded-full flex items-center justify-center"
                            >
                              <CheckCircle size={16} className="text-white" />
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          {step > 1 && (
            <motion.button
              onClick={handleBack}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Back
            </motion.button>
          )}
          
          <div className="flex-1"></div>
          
          {step < 4 ? (
            <motion.button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                canProceed()
                  ? 'bg-primary-500 text-white hover:bg-primary-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              whileHover={canProceed() ? { scale: 1.02 } : {}}
              whileTap={canProceed() ? { scale: 0.98 } : {}}
            >
              Next
            </motion.button>
          ) : (
            <motion.button
              onClick={handleSubmit}
              disabled={!canProceed() || isLoading}
              className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                canProceed() && !isLoading
                  ? 'bg-accent-500 text-white hover:bg-accent-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              whileHover={canProceed() && !isLoading ? { scale: 1.02 } : {}}
              whileTap={canProceed() && !isLoading ? { scale: 0.98 } : {}}
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus size={20} />
                  <span>Create Bet</span>
                </>
              )}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateBetView; 