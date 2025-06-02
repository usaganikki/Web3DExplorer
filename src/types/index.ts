// Generic Event Handler Type
export type EventHandler<T = any> = (data: T) => void;

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  altitude?: number;
}

export interface Object3DConfig {
  position?: { x: number; y: number; z: number }; // Changed to object
  rotation?: { x: number; y: number; z: number }; // Changed to object
  scale?: { x: number; y: number; z: number };    // Changed to object
  visible?: boolean;
  name?: string; // Added name property
  [key: string]: any; // Allow other properties
}

import * as THREE from 'three'; // Import THREE for ColorRepresentation

// Configuration for the Web3DExplorer
export interface Web3DExplorerConfig {
  containerId?: string;
  backgroundColor?: THREE.ColorRepresentation;
  enableControls?: boolean;
  debug?: boolean;
  scene?: {
    background?: THREE.ColorRepresentation; // Added background to scene config
    fog?: { // Added fog to scene config
        type: 'linear' | 'exponential';
        color: THREE.ColorRepresentation;
        near?: number;
        far?: number;
        density?: number;
    };
    ambientLight?: { color?: THREE.ColorRepresentation; intensity?: number };
    [key: string]: any; // Allow other scene properties
  };
  camera?: {
    fov?: number;
    aspect?: number;
    near?: number;
    far?: number;
    position?: { x: number; y: number; z: number }; // Changed to object
    target?: { x: number; y: number; z: number };   // Changed to object
    [key: string]: any; // Allow other camera properties
  };
  renderer?: {
    canvas?: HTMLCanvasElement; // Added canvas for renderer
    antialias?: boolean;
    alpha?: boolean;
    preserveDrawingBuffer?: boolean; // Added preserveDrawingBuffer
    powerPreference?: 'default' | 'high-performance' | 'low-power';
    stencil?: boolean;
    depth?: boolean;
    logarithmicDepthBuffer?: boolean;
    // antialias and alpha were duplicated, removed from here
    pixelRatio?: number;
    [key: string]: any; // Allow other renderer properties
  };
  lights?: LightConfig[]; // Use a more specific type for light configurations
  performance?: { // Added based on error TS2353
    enableStats?: boolean;
    maxFPS?: number;
    adaptiveQuality?: boolean;
  };
  // Add other configuration options here
}

export type LightType = 'ambient' | 'directional' | 'point' | 'spot' | 'hemisphere';

export interface LightConfig {
    type: LightType;
    color?: THREE.ColorRepresentation;
    intensity?: number;
    position?: { x: number; y: number; z: number };
    target?: { x: number; y: number; z: number }; // For spot/directional lights
    angle?: number; // For spot lights
    penumbra?: number; // For spot lights
    decay?: number; // For point/spot lights
    distance?: number; // For point/spot lights
    castShadow?: boolean;
    groundColor?: THREE.ColorRepresentation; // For hemisphere lights
    [key: string]: any;
}


// Performance Metrics
export interface PerformanceMetrics {
  fps: number;
  memoryUsage: { // Fixed to object type
    geometries: number;
    textures: number;
    total: number; // in MB
  };
  drawCalls: number;
  triangles: number; // Made mandatory
  frameTime?: number;
  renderTime?: number;
  triangleCount?: number; // Kept as optional, can be an alias or specific
  // Add other relevant metrics
}

// Placeholder for Web3DExplorer class/interface
export interface Web3DExplorer {
  // TODO: Define methods and properties of the explorer instance
  scene: any; // THREE.Scene;
  camera: any; // THREE.PerspectiveCamera;
  renderer: any; // THREE.WebGLRenderer;
  dispose: () => void;
  // Add other methods like render, resize, addObject, etc.
}


// Re-export other types if necessary, for example:
// export * from './gis'; // If you want to re-export all types from gis.ts
