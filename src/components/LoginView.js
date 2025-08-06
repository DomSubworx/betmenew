import React from 'react';

function LoginView({ users, onLogin }) {
  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <h1 className="text-3xl font-bold text-center">Bet Me If You Can</h1>
        <p className="text-center text-blue-100 mt-2">Choose your user</p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-3 gap-4">
          {users.map(user => (
            <button
              key={user.id}
              onClick={() => onLogin(user.username)}
              className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-lg">
                {user.username.charAt(0)}
              </div>
              <p className="font-semibold text-gray-800">{user.username}</p>
              <p className="text-sm text-gray-500">💰 {user.tokens} Tokens</p>
            </button>
          ))}
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>All users are friends with each other</p>
          <p>Everyone starts with 1000 tokens</p>
        </div>
      </div>
    </div>
  );
}

export default LoginView; 