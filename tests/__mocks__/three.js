// Three.js専用モックファイル
// Issue #71で要求された three.js

// Three.js specific mocks for testing
// This provides mocks for commonly used Three.js classes and methods

// Mock Three.js Scene
export const createMockScene = () => ({
  children: [],
  add: jest.fn(function(object) {
    this.children.push(object);
    object.parent = this;
  }),
  remove: jest.fn(function(object) {
    const index = this.children.indexOf(object);
    if (index !== -1) {
      this.children.splice(index, 1);
      object.parent = null;
    }
  }),
  getObjectByName: jest.fn(() => null),
  traverse: jest.fn(function(callback) {
    callback(this);
    this.children.forEach(child => {
      if (child.traverse) {
        child.traverse(callback);
      }
    });
  }),
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 },
  visible: true,
  type: 'Scene',
});

// Mock Three.js Camera
export const createMockCamera = (type = 'PerspectiveCamera') => ({
  position: { x: 0, y: 0, z: 5, set: jest.fn() },
  rotation: { x: 0, y: 0, z: 0 },
  quaternion: { x: 0, y: 0, z: 0, w: 1 },
  up: { x: 0, y: 1, z: 0 },
  lookAt: jest.fn(),
  updateProjectionMatrix: jest.fn(),
  updateMatrixWorld: jest.fn(),
  getWorldDirection: jest.fn(() => ({ x: 0, y: 0, z: -1 })),
  type,
  fov: type === 'PerspectiveCamera' ? 75 : undefined,
  aspect: type === 'PerspectiveCamera' ? 1.333 : undefined,
  near: 0.1,
  far: 1000,
});

// Mock Three.js Renderer
export const createMockRenderer = () => ({
  domElement: document.createElement('canvas'),
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
    type: 'PCFShadowMap',
  },
  outputEncoding: 'sRGBEncoding',
  toneMapping: 'NoToneMapping',
  toneMappingExposure: 1,
});

// Mock Three.js Mesh
export const createMockMesh = (geometry = null, material = null) => ({
  geometry: geometry || createMockGeometry(),
  material: material || createMockMaterial(),
  position: { x: 0, y: 0, z: 0, set: jest.fn() },
  rotation: { x: 0, y: 0, z: 0, set: jest.fn() },
  scale: { x: 1, y: 1, z: 1, set: jest.fn() },
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
  children: [],
});

// Mock Three.js Geometry
export const createMockGeometry = (type = 'BufferGeometry') => ({
  attributes: {
    position: { array: new Float32Array([]), count: 0 },
    normal: { array: new Float32Array([]), count: 0 },
    uv: { array: new Float32Array([]), count: 0 },
  },
  index: null,
  boundingBox: null,
  boundingSphere: null,
  computeBoundingBox: jest.fn(),
  computeBoundingSphere: jest.fn(),
  dispose: jest.fn(),
  type,
});

// Mock Three.js Material
export const createMockMaterial = (type = 'MeshBasicMaterial') => ({
  color: { r: 1, g: 1, b: 1, set: jest.fn(), getHex: jest.fn(() => 0xffffff) },
  opacity: 1,
  transparent: false,
  visible: true,
  side: 'FrontSide',
  needsUpdate: false,
  dispose: jest.fn(),
  clone: jest.fn(function() { return { ...this }; }),
  type,
});

// Mock Three.js Light
export const createMockLight = (type = 'DirectionalLight') => ({
  color: { r: 1, g: 1, b: 1, set: jest.fn(), getHex: jest.fn(() => 0xffffff) },
  intensity: 1,
  position: { x: 0, y: 1, z: 0, set: jest.fn() },
  target: { position: { x: 0, y: 0, z: 0 } },
  castShadow: false,
  shadow: {
    camera: createMockCamera('OrthographicCamera'),
    mapSize: { width: 512, height: 512 },
    bias: 0,
    radius: 1,
  },
  type,
});

// Mock Three.js Controls (OrbitControls, etc.)
export const createMockControls = (type = 'OrbitControls') => ({
  object: createMockCamera(),
  target: { x: 0, y: 0, z: 0, set: jest.fn() },
  enabled: true,
  enableDamping: false,
  dampingFactor: 0.1,
  enableZoom: true,
  enableRotate: true,
  enablePan: true,
  update: jest.fn(),
  dispose: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  type,
});

// Utility function to mock complete Three.js setup
export const createMockThreeJSSetup = () => {
  const scene = createMockScene();
  const camera = createMockCamera();
  const renderer = createMockRenderer();
  const controls = createMockControls();
  
  return {
    scene,
    camera,
    renderer,
    controls,
    // Convenience method to add objects
    addMesh: (geometry, material) => {
      const mesh = createMockMesh(geometry, material);
      scene.add(mesh);
      return mesh;
    },
    // Convenience method to simulate render loop
    animate: jest.fn(function() {
      controls.update();
      renderer.render(scene, camera);
    }),
  };
};

export default {
  createMockScene,
  createMockCamera,
  createMockRenderer,
  createMockMesh,
  createMockGeometry,
  createMockMaterial,
  createMockLight,
  createMockControls,
  createMockThreeJSSetup,
};
