import React from 'react';
import BetMeApp from './BetMeApp.js';
import { ToastProvider } from './contexts/ToastContext.js';

function App() {
  return (
    <ToastProvider>
      <BetMeApp />
    </ToastProvider>
  );
}

export default App;
