import React from 'react';
import { Web3DExplorerConfig, PerformanceMetrics } from '../types'; // Import types directly
import Explorer from '../core/Explorer'; // Import Explorer directly (default import)

export interface Web3DExplorerComponentProps {
  config?: Web3DExplorerConfig;
  initialData?: any;
  onExplorerReady?: (explorer: Explorer) => void;
  onPerformanceUpdate?: (metrics: PerformanceMetrics) => void;
  style?: React.CSSProperties;
  className?: string;
}

export const Web3DExplorerComponent: React.FC<Web3DExplorerComponentProps> = ({ config, initialData, onExplorerReady, onPerformanceUpdate, style, className }) => {
  // TODO: Implement Web3DExplorerComponent
  return (
    <div>
      <h1>Web3D Explorer Component</h1>
      <p>Content goes here.</p>
      {initialData && <pre>{JSON.stringify(initialData, null, 2)}</pre>}
    </div>
  );
};

export default Web3DExplorerComponent;
