import React from 'react';
import { InteractiveCube } from '@/learning/step1-testing/InteractiveCube'

const App: React.FC = () => {
  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      height: '100vh', // 追加
      boxSizing: 'border-box' // 追加 (Reactのstyleではキャメルケース)
    }}>
      <InteractiveCube />
    </div>
  );
};

export default App;
