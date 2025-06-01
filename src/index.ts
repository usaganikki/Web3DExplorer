// メインエクスポート
export { Explorer } from './core/Explorer';
export { GISManager } from './gis/GISManager';
export { EventEmitter } from './utils/EventEmitter';

// React コンポーネント
export { Web3DExplorerComponent } from './components/Web3DExplorerComponent';
export { TokyoStationExplorer } from './components/TokyoStationExplorer';

// 型定義
export * from './types';
export * from './types/gis';
export * from './types/testing';

// デフォルト設定
import * as THREE from 'three';
import { Web3DExplorerConfig } from './types';
import { TOKYO_PROJECTION } from './types/gis';

/**
 * デフォルトの Web3DExplorer 設定
 */
export const DEFAULT_CONFIG: Web3DExplorerConfig = {
  scene: {
    background: new THREE.Color(0x222222),
    fog: {
      type: 'linear',
      color: new THREE.Color(0x222222),
      near: 50,
      far: 500
    },
    ambientLight: {
      color: new THREE.Color(0x404040),
      intensity: 0.4
    }
  },
  camera: {
    fov: 75,
    aspect: window.innerWidth / window.innerHeight,
    near: 0.1,
    far: 1000,
    position: { x: 0, y: 5, z: 10 }
  },
  renderer: {
    antialias: true,
    alpha: false,
    powerPreference: 'default'
  },
  lights: [
    {
      type: 'directional',
      color: new THREE.Color(0xffffff),
      intensity: 1.0,
      position: { x: 5, y: 10, z: 5 },
      castShadow: true
    }
  ],
  debug: false
};

/**
 * 東京駅エリア専用の設定
 */
export const TOKYO_STATION_CONFIG: Web3DExplorerConfig = {
  scene: {
    background: new THREE.Color(0x87ceeb),
    fog: {
      type: 'linear',
      color: new THREE.Color(0x87ceeb),
      near: 100,
      far: 1000
    },
    ambientLight: {
      color: new THREE.Color(0xffffff),
      intensity: 0.6
    }
  },
  camera: {
    fov: 60,
    aspect: window.innerWidth / window.innerHeight,
    near: 0.1,
    far: 2000,
    position: { x: 0, y: 50, z: 100 },
    target: { x: 0, y: 0, z: 0 }
  },
  renderer: {
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance'
  },
  lights: [
    {
      type: 'directional',
      color: new THREE.Color(0xffffff),
      intensity: 1.0,
      position: { x: 50, y: 100, z: 50 },
      castShadow: true
    },
    {
      type: 'directional',
      color: new THREE.Color(0x4040ff),
      intensity: 0.3,
      position: { x: -50, y: 50, z: -50 },
      castShadow: false
    }
  ],
  debug: false
};

// ユーティリティ関数
/**
 * Web3DExplorer のインスタンスを作成するヘルパー関数
 */
export function createExplorer(config?: Partial<Web3DExplorerConfig>, container?: HTMLElement): Explorer {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  return new Explorer(finalConfig, container);
}

/**
 * 東京駅エリア専用の Explorer を作成するヘルパー関数
 */
export function createTokyoStationExplorer(container?: HTMLElement): Explorer {
  return new Explorer(TOKYO_STATION_CONFIG, container);
}

// プロジェクション
export { TOKYO_PROJECTION };

// バージョン情報
export const VERSION = '0.1.0';
export const LIBRARY_NAME = 'Web3DExplorer';
