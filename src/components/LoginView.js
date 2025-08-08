import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function LoginView({ users, onLogin }) {
  return (
    <motion.div className="max-w-md mx-auto bg-white min-h-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="bg-primary-500 text-white p-6">
        <h1 className="text-3xl font-bold text-center">Bet Me If You Can</h1>
                  <p className="text-center text-primary-100 mt-2">Choose your user</p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-3 gap-4">
          <AnimatePresence initial={false}>
          {users.map((user, idx) => (
            <motion.button
              key={user.id}
              onClick={() => onLogin(user.username)}
              className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all text-center"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, delay: idx * 0.04 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-12 h-12 bg-primary-500 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-lg">
                {user.username.charAt(0)}
              </div>
              <p className="font-semibold text-gray-800">{user.username}</p>
              <p className="text-sm text-gray-500">💰 {user.tokens} Tokens</p>
            </motion.button>
          ))}
          </AnimatePresence>
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>All users are friends with each other</p>
          <p>Everyone starts with 1000 tokens</p>
        </div>
      </div>
    </motion.div>
  );
}

export default LoginView; 