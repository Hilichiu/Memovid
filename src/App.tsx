import React from 'react';
import Header from './components/Header';
import VideoCreator from './components/VideoCreator';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      <Header />
      <VideoCreator />
    </div>
  );
}

export default App;