import React from 'react';
import { BasicCube } from '@/learning/step1-basic/BasicCube'

const App: React.FC = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Web3DExplorer - Learning Journey</h1>
      <p>Three.js学習用の開発環境です</p>
      
      <div style={{ marginTop: '30px' }}>
        <h2>Phase 1: Three.js基礎習得</h2>
        <div style={{ marginLeft: '20px' }}>
          <h3>Step 1.1: 最小限のThree.jsアプリケーション</h3>
          <p>BasicCubeコンポーネントがここに表示されます（実装後）</p>
          <BasicCube />
        </div>
      </div>
    </div>
  );
};

export default App;
