// Three.js専用モックファイル
// Issue #71で要求された three.js
// TypeScript ESM対応版: シンプルで一貫したJest自動モック対応

// Three.js型定義のインポート
import type * as THREE from 'three';

// =============================================================================
// Jest自動モック対応: Three.jsクラスの直接モック（TypeScript統一版）
// =============================================================================

// Scene constructor mock
export const Scene = jest.fn(function(): Partial<THREE.Scene> {
  const instance = {
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
    position: new (Vector3 as any)(0, 0, 0),
    rotation: new (Vector3 as any)(0, 0, 0),
    scale: new (Vector3 as any)(1, 1, 1),
    visible: true,
    type: 'Scene',
    name: '',
    background: null,
    fog: null,
    updateMatrixWorld: jest.fn(),
    matrix: new (Matrix4 as any)(),
    matrixWorld: new (Matrix4 as any)(),
  };
  Object.setPrototypeOf(instance, Scene.prototype);
  return instance;
});

// Camera constructor mocks
export const PerspectiveCamera = jest.fn(function(
  fov: number = 75, 
  aspect: number = 1.333, 
  near: number = 0.1, 
  far: number = 1000
): Partial<THREE.PerspectiveCamera> {
  const instance = {
    position: new (Vector3 as any)(0, 0, 5),
    rotation: new (Vector3 as any)(0, 0, 0),
    quaternion: { x: 0, y: 0, z: 0, w: 1 } as any,
    up: { x: 0, y: 1, z: 0 } as any,
    lookAt: jest.fn(function(this: any, x: number, y: number, z: number) {
      // Simple lookAt implementation for testing
      this.position.set(this.position.x, this.position.y, this.position.z);
      return this;
    }),
    updateProjectionMatrix: jest.fn(function(this: any) {
      // Update projectionMatrix when called
      this.projectionMatrix = this.projectionMatrix || new (Matrix4 as any)();
      return this;
    }),
    updateMatrixWorld: jest.fn(),
    getWorldDirection: jest.fn(() => ({ x: 0, y: 0, z: -1 })),
    type: 'PerspectiveCamera',
    fov,
    aspect,
    near,
    far,
    projectionMatrix: new (Matrix4 as any)(),
    matrix: new (Matrix4 as any)(),
    matrixWorld: new (Matrix4 as any)(),
  };
  Object.setPrototypeOf(instance, PerspectiveCamera.prototype);
  return instance;
});

export const OrthographicCamera = jest.fn(function(
  left: number = -1, 
  right: number = 1, 
  top: number = 1, 
  bottom: number = -1, 
  near: number = 0.1, 
  far: number = 1000
): Partial<THREE.OrthographicCamera> {
  const instance = {
    position: new (Vector3 as any)(0, 0, 5),
    rotation: new (Vector3 as any)(0, 0, 0),
    quaternion: { x: 0, y: 0, z: 0, w: 1 } as any,
    up: { x: 0, y: 1, z: 0 } as any,
    lookAt: jest.fn(function(this: any, x: number, y: number, z: number) {
      this.position.set(this.position.x, this.position.y, this.position.z);
      return this;
    }),
    updateProjectionMatrix: jest.fn(function(this: any) {
      this.projectionMatrix = this.projectionMatrix || new (Matrix4 as any)();
      return this;
    }),
    updateMatrixWorld: jest.fn(),
    getWorldDirection: jest.fn(() => ({ x: 0, y: 0, z: -1 })),
    type: 'OrthographicCamera',
    left,
    right,
    top,
    bottom,
    near,
    far,
    projectionMatrix: new (Matrix4 as any)(),
    matrix: new (Matrix4 as any)(),
    matrixWorld: new (Matrix4 as any)(),
  };
  Object.setPrototypeOf(instance, OrthographicCamera.prototype);
  return instance;
});

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
export const BoxGeometry = jest.fn(function(
  width: number = 1, 
  height: number = 1, 
  depth: number = 1
): Partial<THREE.BoxGeometry> {
  const instance = {
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
  };
  Object.setPrototypeOf(instance, BoxGeometry.prototype);
  return instance;
});

export const SphereGeometry = jest.fn(function(
  radius: number = 1, 
  widthSegments: number = 32, 
  heightSegments: number = 16
): Partial<THREE.SphereGeometry> {
  const instance = {
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
  };
  Object.setPrototypeOf(instance, SphereGeometry.prototype);
  return instance;
});

export const PlaneGeometry = jest.fn(function(
  width: number = 1, 
  height: number = 1
): Partial<THREE.PlaneGeometry> {
  const instance = {
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
  };
  Object.setPrototypeOf(instance, PlaneGeometry.prototype);
  return instance;
});

export const CylinderGeometry = jest.fn(function(
  radiusTop: number = 1,
  radiusBottom: number = 1,
  height: number = 1,
  radialSegments: number = 32
): Partial<THREE.CylinderGeometry> {
  const instance = {
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
    type: 'CylinderGeometry',
    parameters: { radiusTop, radiusBottom, height, radialSegments },
  };
  Object.setPrototypeOf(instance, CylinderGeometry.prototype);
  return instance;
});

// Material constructor mocks
export const MeshBasicMaterial = jest.fn(function(
  parameters: THREE.MeshBasicMaterialParameters = {}
): Partial<THREE.MeshBasicMaterial> {
  const instance = {
    color: new (Color as any)(parameters.color || 0xffffff),
    opacity: parameters.opacity || 1,
    transparent: parameters.transparent || false,
    visible: parameters.visible !== false,
    side: parameters.side || 'FrontSide' as any,
    needsUpdate: false,
    dispose: jest.fn(),
    clone: jest.fn(function(this: any) { return { ...this }; }),
    type: 'MeshBasicMaterial',
  };
  Object.setPrototypeOf(instance, MeshBasicMaterial.prototype);
  return instance;
});

export const MeshLambertMaterial = jest.fn(function(
  parameters: THREE.MeshLambertMaterialParameters = {}
): Partial<THREE.MeshLambertMaterial> {
  const instance = {
    color: new (Color as any)(parameters.color || 0xffffff),
    opacity: parameters.opacity || 1,
    transparent: parameters.transparent || false,
    visible: parameters.visible !== false,
    side: parameters.side || 'FrontSide' as any,
    needsUpdate: false,
    dispose: jest.fn(),
    clone: jest.fn(function(this: any) { return { ...this }; }),
    type: 'MeshLambertMaterial',
  };
  Object.setPrototypeOf(instance, MeshLambertMaterial.prototype);
  return instance;
});

export const MeshPhongMaterial = jest.fn(function(
  parameters: THREE.MeshPhongMaterialParameters = {}
): Partial<THREE.MeshPhongMaterial> {
  const instance = {
    color: new (Color as any)(parameters.color || 0xffffff),
    opacity: parameters.opacity || 1,
    transparent: parameters.transparent || false,
    visible: parameters.visible !== false,
    side: parameters.side || 'FrontSide' as any,
    shininess: parameters.shininess || 30,
    specular: new (Color as any)(parameters.specular || 0x111111),
    emissive: new (Color as any)(parameters.emissive || 0x000000),
    needsUpdate: false,
    dispose: jest.fn(),
    clone: jest.fn(function(this: any) { return { ...this }; }),
    type: 'MeshPhongMaterial',
    flatShading: parameters.flatShading || false,
  };
  Object.setPrototypeOf(instance, MeshPhongMaterial.prototype);
  return instance;
});

export const MeshStandardMaterial = jest.fn(function(
  parameters: THREE.MeshStandardMaterialParameters = {}
): Partial<THREE.MeshStandardMaterial> {
  const instance = {
    color: new (Color as any)(parameters.color || 0xffffff),
    opacity: parameters.opacity || 1,
    transparent: parameters.transparent || false,
    visible: parameters.visible !== false,
    side: parameters.side || 'FrontSide' as any,
    metalness: parameters.metalness || 0,
    roughness: parameters.roughness || 1,
    emissive: new (Color as any)(parameters.emissive || 0x000000),
    flatShading: parameters.flatShading || false,
    needsUpdate: false,
    dispose: jest.fn(),
    clone: jest.fn(function(this: any) { return { ...this }; }),
    type: 'MeshStandardMaterial',
  };
  Object.setPrototypeOf(instance, MeshStandardMaterial.prototype);
  return instance;
});

// Mesh constructor mock
export const Mesh = jest.fn(function(
  geometry?: THREE.BufferGeometry, 
  material?: THREE.Material
): Partial<THREE.Mesh> {
  const instance = {
    geometry: geometry || new (BoxGeometry as any)(),
    material: material || new (MeshBasicMaterial as any)(),
    position: new (Vector3 as any)(0, 0, 0),
    rotation: new (Vector3 as any)(0, 0, 0),
    scale: new (Vector3 as any)(1, 1, 1),
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
    matrix: new (Matrix4 as any)(),
    matrixWorld: new (Matrix4 as any)(),
  };
  Object.setPrototypeOf(instance, Mesh.prototype);
  return instance;
});

// Light constructor mocks
export const DirectionalLight = jest.fn(function(
  color: THREE.ColorRepresentation = 0xffffff, 
  intensity: number = 1
): Partial<THREE.DirectionalLight> {
  const instance = {
    color: new (Color as any)(color),
    intensity,
    position: { x: 0, y: 1, z: 0, set: jest.fn(function(this: any, x: number, y: number, z: number) {
      this.x = x; this.y = y; this.z = z; return this;
    }) } as any,
    target: { position: { x: 0, y: 0, z: 0 } } as any,
    castShadow: false,
    shadow: {
      camera: new (OrthographicCamera as any)(),
      mapSize: { width: 512, height: 512 },
      bias: 0,
      radius: 1,
    } as any,
    type: 'DirectionalLight',
  };
  Object.setPrototypeOf(instance, DirectionalLight.prototype);
  return instance;
});

export const AmbientLight = jest.fn(function(
  color: THREE.ColorRepresentation = 0xffffff, 
  intensity: number = 1
): Partial<THREE.AmbientLight> {
  const instance = {
    color: new (Color as any)(color),
    intensity,
    position: { x: 0, y: 1, z: 0, set: jest.fn(function(this: any, x: number, y: number, z: number) {
      this.x = x; this.y = y; this.z = z; return this;
    }) } as any,
    type: 'AmbientLight',
  };
  Object.setPrototypeOf(instance, AmbientLight.prototype);
  return instance;
});

export const PointLight = jest.fn(function(
  color: THREE.ColorRepresentation = 0xffffff,
  intensity: number = 1,
  distance: number = 0
): Partial<THREE.PointLight> {
  const instance = {
    color: new (Color as any)(color),
    intensity,
    distance,
    position: { x: 0, y: 0, z: 0, set: jest.fn(function(this: any, x: number, y: number, z: number) {
      this.x = x; this.y = y; this.z = z; return this;
    }) } as any,
    castShadow: false,
    decay: 1,
    power: intensity * 4 * Math.PI,
    type: 'PointLight',
  };
  Object.setPrototypeOf(instance, PointLight.prototype);
  return instance;
});

// Vector3 mock - 段階的実装（テストで必要なメソッドのみ）
export const Vector3 = jest.fn(function(
  x: number = 0, 
  y: number = 0, 
  z: number = 0
): Partial<THREE.Vector3> {
  const instance = {
    x, y, z,
    
    // 基本セット・コピー操作
    set: jest.fn(function(this: any, newX: number, newY: number, newZ: number) {
      this.x = newX; this.y = newY; this.z = newZ;
      return this;
    }),
    
    copy: jest.fn(function(this: any, v: THREE.Vector3) {
      this.x = v.x; this.y = v.y; this.z = v.z;
      return this;
    }),
    
    clone: jest.fn(function(this: any) { 
      return new (Vector3 as any)(this.x, this.y, this.z); 
    }),
    
    // 加算系メソッド
    add: jest.fn(function(this: any, v: THREE.Vector3) {
      this.x += v.x; this.y += v.y; this.z += v.z;
      return this;
    }),
    
    addScalar: jest.fn(function(this: any, s: number) {
      this.x += s; this.y += s; this.z += s;
      return this;
    }),
    
    // 減算系メソッド
    sub: jest.fn(function(this: any, v: THREE.Vector3) {
      this.x -= v.x; this.y -= v.y; this.z -= v.z;
      return this;
    }),
    
    subScalar: jest.fn(function(this: any, s: number) {
      this.x -= s; this.y -= s; this.z -= s;
      return this;
    }),
    
    // 乗算系メソッド
    multiply: jest.fn(function(this: any, v: THREE.Vector3) {
      this.x *= v.x; this.y *= v.y; this.z *= v.z;
      return this;
    }),
    
    multiplyScalar: jest.fn(function(this: any, s: number) {
      this.x *= s; this.y *= s; this.z *= s;
      return this;
    }),
    
    // 除算系メソッド
    divide: jest.fn(function(this: any, v: THREE.Vector3) {
      this.x /= v.x; this.y /= v.y; this.z /= v.z;
      return this;
    }),
    
    divideScalar: jest.fn(function(this: any, s: number) {
      this.x /= s; this.y /= s; this.z /= s;
      return this;
    }),
    
    // 長さ計算メソッド
    length: jest.fn(function(this: any) {
      return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }),
    
    lengthSq: jest.fn(function(this: any) {
      return this.x * this.x + this.y * this.y + this.z * this.z;
    }),
    
    // 正規化メソッド
    normalize: jest.fn(function(this: any) {
      const len = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
      if (len > 0) {
        this.x /= len; this.y /= len; this.z /= len;
      }
      return this;
    }),
    
    setLength: jest.fn(function(this: any, length: number) {
      const len = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
      if (len > 0) {
        const factor = length / len;
        this.x *= factor; this.y *= factor; this.z *= factor;
      }
      return this;
    }),
    
    // 内積・外積メソッド
    dot: jest.fn(function(this: any, v: THREE.Vector3) {
      return this.x * v.x + this.y * v.y + this.z * v.z;
    }),
    
    cross: jest.fn(function(this: any, v: THREE.Vector3) {
      const x = this.y * v.z - this.z * v.y;
      const y = this.z * v.x - this.x * v.z;
      const z = this.x * v.y - this.y * v.x;
      this.x = x; this.y = y; this.z = z;
      return this;
    }),
    
    // 距離計算メソッド
    distanceTo: jest.fn(function(this: any, v: THREE.Vector3) {
      const dx = this.x - v.x;
      const dy = this.y - v.y;
      const dz = this.z - v.z;
      return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }),
    
    distanceToSquared: jest.fn(function(this: any, v: THREE.Vector3) {
      const dx = this.x - v.x;
      const dy = this.y - v.y;
      const dz = this.z - v.z;
      return dx * dx + dy * dy + dz * dz;
    }),
    
    manhattanDistanceTo: jest.fn(function(this: any, v: THREE.Vector3) {
      return Math.abs(this.x - v.x) + Math.abs(this.y - v.y) + Math.abs(this.z - v.z);
    }),
    
    // 比較・判定メソッド
    equals: jest.fn(function(this: any, v: THREE.Vector3) {
      return this.x === v.x && this.y === v.y && this.z === v.z;
    }),
    
    // 丸め系メソッド
    round: jest.fn(function(this: any) {
      this.x = Math.round(this.x);
      this.y = Math.round(this.y);
      this.z = Math.round(this.z);
      return this;
    }),
    
    floor: jest.fn(function(this: any) {
      this.x = Math.floor(this.x);
      this.y = Math.floor(this.y);
      this.z = Math.floor(this.z);
      return this;
    }),
    
    ceil: jest.fn(function(this: any) {
      this.x = Math.ceil(this.x);
      this.y = Math.ceil(this.y);
      this.z = Math.ceil(this.z);
      return this;
    }),
    
    // 線形補間メソッド
    lerp: jest.fn(function(this: any, v: THREE.Vector3, alpha: number) {
      this.x += (v.x - this.x) * alpha;
      this.y += (v.y - this.y) * alpha;
      this.z += (v.z - this.z) * alpha;
      return this;
    }),
  };
  
  Object.setPrototypeOf(instance, Vector3.prototype);
  return instance;
});

// Color mock
export const Color = jest.fn(function(
  color: THREE.ColorRepresentation = 0xffffff
): Partial<THREE.Color> {
  const instance = {
    r: 1, g: 1, b: 1,
    set: jest.fn(function(this: any, color: THREE.ColorRepresentation) {
      // 簡易的な色設定実装
      if (typeof color === 'number') {
        this.r = ((color >> 16) & 255) / 255;
        this.g = ((color >> 8) & 255) / 255;
        this.b = (color & 255) / 255;
      }
      return this;
    }),
    getHex: jest.fn(function(this: any) {
      return Math.round(this.r * 255) << 16 | Math.round(this.g * 255) << 8 | Math.round(this.b * 255);
    }),
    clone: jest.fn(function(this: any) {
      return new (Color as any)(this.getHex());
    }),
  };
  
  // Initialize color based on constructor parameter
  if (typeof color === 'number') {
    instance.r = ((color >> 16) & 255) / 255;
    instance.g = ((color >> 8) & 255) / 255;
    instance.b = (color & 255) / 255;
  }
  
  Object.setPrototypeOf(instance, Color.prototype);
  return instance;
});

// THREE.js Constants
export const DoubleSide = 2;
export const FrontSide = 0;
export const BackSide = 1;

// Fog mock
export const Fog = jest.fn(function(
  color: THREE.ColorRepresentation = 0xffffff,
  near: number = 1,
  far: number = 1000
): Partial<THREE.Fog> {
  const instance = {
    color: new (Color as any)(color),
    near,
    far,
    clone: jest.fn(function(this: any) {
      return new (Fog as any)(this.color, this.near, this.far);
    }),
  };
  Object.setPrototypeOf(instance, Fog.prototype);
  return instance;
});

// Group mock
export const Group = jest.fn((): Partial<THREE.Group> => ({
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
  position: { x: 0, y: 0, z: 0, set: jest.fn() } as any,
  rotation: { x: 0, y: 0, z: 0, set: jest.fn() } as any,
  scale: { x: 1, y: 1, z: 1, set: jest.fn() } as any,
  visible: true,
  traverse: jest.fn(function(this: any, callback: (object: THREE.Object3D) => void) {
    callback(this);
    this.children.forEach((child: any) => {
      if (child.traverse) {
        child.traverse(callback);
      }
    });
  }),
  updateMatrix: jest.fn(),
  updateMatrixWorld: jest.fn(),
  type: 'Group',
}));


// Matrix4 mock
export const Matrix4 = jest.fn(function(): Partial<THREE.Matrix4> {
  const instance = {
    elements: new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]),
    set: jest.fn(function(this: any, 
      n11: number, n12: number, n13: number, n14: number,
      n21: number, n22: number, n23: number, n24: number,
      n31: number, n32: number, n33: number, n34: number,
      n41: number, n42: number, n43: number, n44: number
    ) {
      this.elements[0] = n11; this.elements[4] = n12; this.elements[8] = n13; this.elements[12] = n14;
      this.elements[1] = n21; this.elements[5] = n22; this.elements[9] = n23; this.elements[13] = n24;
      this.elements[2] = n31; this.elements[6] = n32; this.elements[10] = n33; this.elements[14] = n34;
      this.elements[3] = n41; this.elements[7] = n42; this.elements[11] = n43; this.elements[15] = n44;
      return this;
    }),
    identity: jest.fn(function(this: any) {
      this.set(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      );
      return this;
    }),
    clone: jest.fn(function(this: any) {
      const matrix = new (Matrix4 as any)();
      matrix.elements.set(this.elements);
      return matrix;
    }),
    copy: jest.fn(function(this: any, m: THREE.Matrix4) {
      this.elements.set(m.elements);
      return this;
    }),
    determinant: jest.fn(() => 1),
    makeTranslation: jest.fn(function(this: any, x: number, y: number, z: number) {
      this.set(
        1, 0, 0, x,
        0, 1, 0, y,
        0, 0, 1, z,
        0, 0, 0, 1
      );
      return this;
    }),
  };
  Object.setPrototypeOf(instance, Matrix4.prototype);
  return instance;
});

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
