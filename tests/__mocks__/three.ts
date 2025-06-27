// Three.js専用モックファイル
// Issue #71で要求された three.js
// TypeScript ESM対応版: シンプルで一貫したJest自動モック対応

// Three.js型定義のインポート
import type * as THREE from 'three';

// =============================================================================
// Jest自動モック対応: Three.jsクラスの直接モック（TypeScript統一版）
// =============================================================================

// Scene constructor mock
export const Scene = jest.fn((): Partial<THREE.Scene> => ({
  children: [] as THREE.Object3D[],
  add: jest.fn(function(this: any, object: THREE.Object3D) {
    this.children.push(object);
    object.parent = this;
    return this;
  }),
  remove: jest.fn(function(this: any, object: THREE.Object3D) {
    const index = this.children.indexOf(object);
    if (index !== -1) {
      this.children.splice(index, 1);
      object.parent = null;
    }
    return this;
  }),
  getObjectByName: jest.fn(() => null),
  traverse: jest.fn(function(this: any, callback: (object: THREE.Object3D) => void) {
    callback(this);
    this.children.forEach((child: any) => {
      if (child.traverse) {
        child.traverse(callback);
      }
    });
  }),
  position: { x: 0, y: 0, z: 0, set: jest.fn() },
  rotation: { x: 0, y: 0, z: 0, set: jest.fn() },
  scale: { x: 1, y: 1, z: 1, set: jest.fn() },
  visible: true,
  type: 'Scene',
}));

// Camera constructor mocks
export const PerspectiveCamera = jest.fn((
  fov: number = 75, 
  aspect: number = 1.333, 
  near: number = 0.1, 
  far: number = 1000
): Partial<THREE.PerspectiveCamera> => ({
  position: { x: 0, y: 0, z: 5, set: jest.fn() } as any,
  rotation: { x: 0, y: 0, z: 0, set: jest.fn() } as any,
  quaternion: { x: 0, y: 0, z: 0, w: 1 } as any,
  up: { x: 0, y: 1, z: 0 } as any,
  lookAt: jest.fn(),
  updateProjectionMatrix: jest.fn(),
  updateMatrixWorld: jest.fn(),
  getWorldDirection: jest.fn(() => ({ x: 0, y: 0, z: -1 })),
  type: 'PerspectiveCamera',
  fov,
  aspect,
  near,
  far,
}));

export const OrthographicCamera = jest.fn((
  left: number = -1, 
  right: number = 1, 
  top: number = 1, 
  bottom: number = -1, 
  near: number = 0.1, 
  far: number = 1000
): Partial<THREE.OrthographicCamera> => ({
  position: { x: 0, y: 0, z: 5, set: jest.fn() } as any,
  rotation: { x: 0, y: 0, z: 0, set: jest.fn() } as any,
  quaternion: { x: 0, y: 0, z: 0, w: 1 } as any,
  up: { x: 0, y: 1, z: 0 } as any,
  lookAt: jest.fn(),
  updateProjectionMatrix: jest.fn(),
  updateMatrixWorld: jest.fn(),
  getWorldDirection: jest.fn(() => ({ x: 0, y: 0, z: -1 })),
  type: 'OrthographicCamera',
  left,
  right,
  top,
  bottom,
  near,
  far,
}));

// Renderer constructor mocks
export const WebGLRenderer = jest.fn((
  options: THREE.WebGLRendererParameters = {}
): Partial<THREE.WebGLRenderer> => ({
  domElement: options.canvas || document.createElement('canvas'),
  setSize: jest.fn(),
  setPixelRatio: jest.fn(),
  setClearColor: jest.fn(),
  render: jest.fn(),
  dispose: jest.fn(),
  getContext: jest.fn(() => ({})),
  getSize: jest.fn(() => ({ width: 800, height: 600 })),
  setViewport: jest.fn(),
  getViewport: jest.fn(() => ({ x: 0, y: 0, z: 800, w: 600 })),
  clear: jest.fn(),
  clearColor: jest.fn(),
  clearDepth: jest.fn(),
  clearStencil: jest.fn(),
  shadowMap: {
    enabled: false,
    type: 'PCFShadowMap' as any,
  },
  outputColorSpace: 'srgb' as any,
  toneMapping: 'NoToneMapping' as any,
  toneMappingExposure: 1,
  antialias: options.antialias || false,
}));

// Geometry constructor mocks
export const BoxGeometry = jest.fn((
  width: number = 1, 
  height: number = 1, 
  depth: number = 1
): Partial<THREE.BoxGeometry> => ({
  attributes: {
    position: { array: new Float32Array([]), count: 0 } as any,
    normal: { array: new Float32Array([]), count: 0 } as any,
    uv: { array: new Float32Array([]), count: 0 } as any,
  },
  index: null,
  boundingBox: null,
  boundingSphere: null,
  computeBoundingBox: jest.fn(),
  computeBoundingSphere: jest.fn(),
  dispose: jest.fn(),
  type: 'BoxGeometry',
  parameters: { width, height, depth },
}));

export const SphereGeometry = jest.fn((
  radius: number = 1, 
  widthSegments: number = 32, 
  heightSegments: number = 16
): Partial<THREE.SphereGeometry> => ({
  attributes: {
    position: { array: new Float32Array([]), count: 0 } as any,
    normal: { array: new Float32Array([]), count: 0 } as any,
    uv: { array: new Float32Array([]), count: 0 } as any,
  },
  index: null,
  boundingBox: null,
  boundingSphere: null,
  computeBoundingBox: jest.fn(),
  computeBoundingSphere: jest.fn(),
  dispose: jest.fn(),
  type: 'SphereGeometry',
  parameters: { radius, widthSegments, heightSegments },
}));

export const PlaneGeometry = jest.fn((
  width: number = 1, 
  height: number = 1
): Partial<THREE.PlaneGeometry> => ({
  attributes: {
    position: { array: new Float32Array([]), count: 0 } as any,
    normal: { array: new Float32Array([]), count: 0 } as any,
    uv: { array: new Float32Array([]), count: 0 } as any,
  },
  index: null,
  boundingBox: null,
  boundingSphere: null,
  computeBoundingBox: jest.fn(),
  computeBoundingSphere: jest.fn(),
  dispose: jest.fn(),
  type: 'PlaneGeometry',
  parameters: { width, height },
}));

// Material constructor mocks
export const MeshBasicMaterial = jest.fn((
  parameters: THREE.MeshBasicMaterialParameters = {}
): Partial<THREE.MeshBasicMaterial> => ({
  color: { 
    r: 1, g: 1, b: 1, 
    set: jest.fn(), 
    getHex: jest.fn(() => parameters.color || 0xffffff) 
  } as any,
  opacity: parameters.opacity || 1,
  transparent: parameters.transparent || false,
  visible: parameters.visible !== false,
  side: parameters.side || 'FrontSide' as any,
  needsUpdate: false,
  dispose: jest.fn(),
  clone: jest.fn(function(this: any) { return { ...this }; }),
  type: 'MeshBasicMaterial',
}));

export const MeshLambertMaterial = jest.fn((
  parameters: THREE.MeshLambertMaterialParameters = {}
): Partial<THREE.MeshLambertMaterial> => ({
  color: { 
    r: 1, g: 1, b: 1, 
    set: jest.fn(), 
    getHex: jest.fn(() => parameters.color || 0xffffff) 
  } as any,
  opacity: parameters.opacity || 1,
  transparent: parameters.transparent || false,
  visible: parameters.visible !== false,
  side: parameters.side || 'FrontSide' as any,
  needsUpdate: false,
  dispose: jest.fn(),
  clone: jest.fn(function(this: any) { return { ...this }; }),
  type: 'MeshLambertMaterial',
}));

// Mesh constructor mock
export const Mesh = jest.fn((
  geometry?: THREE.BufferGeometry, 
  material?: THREE.Material
): Partial<THREE.Mesh> => ({
  geometry: geometry || new (BoxGeometry as any)(),
  material: material || new (MeshBasicMaterial as any)(),
  position: { x: 0, y: 0, z: 0, set: jest.fn() } as any,
  rotation: { x: 0, y: 0, z: 0, set: jest.fn() } as any,
  scale: { x: 1, y: 1, z: 1, set: jest.fn() } as any,
  visible: true,
  castShadow: false,
  receiveShadow: false,
  add: jest.fn(),
  remove: jest.fn(),
  traverse: jest.fn(),
  raycast: jest.fn(),
  updateMatrix: jest.fn(),
  updateMatrixWorld: jest.fn(),
  type: 'Mesh',
  parent: null,
  children: [] as THREE.Object3D[],
}));

// Light constructor mocks
export const DirectionalLight = jest.fn((
  color: THREE.ColorRepresentation = 0xffffff, 
  intensity: number = 1
): Partial<THREE.DirectionalLight> => ({
  color: { 
    r: 1, g: 1, b: 1, 
    set: jest.fn(), 
    getHex: jest.fn(() => color) 
  } as any,
  intensity,
  position: { x: 0, y: 1, z: 0, set: jest.fn() } as any,
  target: { position: { x: 0, y: 0, z: 0 } } as any,
  castShadow: false,
  shadow: {
    camera: new (OrthographicCamera as any)(),
    mapSize: { width: 512, height: 512 },
    bias: 0,
    radius: 1,
  } as any,
  type: 'DirectionalLight',
}));

export const AmbientLight = jest.fn((
  color: THREE.ColorRepresentation = 0xffffff, 
  intensity: number = 1
): Partial<THREE.AmbientLight> => ({
  color: { 
    r: 1, g: 1, b: 1, 
    set: jest.fn(), 
    getHex: jest.fn(() => color) 
  } as any,
  intensity,
  position: { x: 0, y: 1, z: 0, set: jest.fn() } as any,
  type: 'AmbientLight',
}));

// Vector3 mock
export const Vector3 = jest.fn((
  x: number = 0, 
  y: number = 0, 
  z: number = 0
): Partial<THREE.Vector3> => ({
  x, y, z,
  set: jest.fn(function(this: any, x: number, y: number, z: number) {
    this.x = x; this.y = y; this.z = z;
    return this;
  }),
  add: jest.fn(function(this: any, v: THREE.Vector3) {
    this.x += v.x; this.y += v.y; this.z += v.z;
    return this;
  }),
  subtract: jest.fn(function(this: any, v: THREE.Vector3) {
    this.x -= v.x; this.y -= v.y; this.z -= v.z;
    return this;
  }),
  multiply: jest.fn(function(this: any, v: THREE.Vector3) {
    this.x *= v.x; this.y *= v.y; this.z *= v.z;
    return this;
  }),
  normalize: jest.fn(function(this: any) { return this; }),
  length: jest.fn(() => 1),
  lengthSq: jest.fn(() => 1),
  clone: jest.fn(function(this: any) { return new (Vector3 as any)(this.x, this.y, this.z); }),
  copy: jest.fn(function(this: any, v: THREE.Vector3) {
    this.x = v.x; this.y = v.y; this.z = v.z;
    return this;
  }),
}));

// =============================================================================
// ユーティリティ関数（便利な組み合わせ用）
// =============================================================================

// 完全なThree.js環境のセットアップ
export const createMockThreeJSSetup = () => {
  const scene = new (Scene as any)();
  const camera = new (PerspectiveCamera as any)();
  const renderer = new (WebGLRenderer as any)();
  
  return {
    scene,
    camera,
    renderer,
    // 便利メソッド
    addMesh: (geometry?: any, material?: any) => {
      const mesh = new (Mesh as any)(geometry, material);
      scene.add(mesh);
      return mesh;
    },
    animate: jest.fn(function() {
      renderer.render(scene, camera);
    }),
  };
};

// デフォルトエクスポート（TypeScript統一版）
const mockThree = {
  Scene,
  PerspectiveCamera,
  OrthographicCamera,
  WebGLRenderer,
  BoxGeometry,
  SphereGeometry,
  PlaneGeometry,
  MeshBasicMaterial,
  MeshLambertMaterial,
  Mesh,
  DirectionalLight,
  AmbientLight,
  Vector3,
  createMockThreeJSSetup,
};

export default mockThree;
