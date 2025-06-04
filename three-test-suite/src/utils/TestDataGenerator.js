/**
 * テスト環境専用のデータ生成ユーティリティ
 * 再現可能なテストデータの生成とテスト間でのデータ汚染防止
 */

export class TestDataGenerator {
  constructor(seed = 12345) {
    this.seed = seed;
    this.resetSeed();
    this.counters = new Map();
  }

  /**
   * シードをリセットして再現可能な乱数生成を確保
   */
  resetSeed() {
    this.currentSeed = this.seed;
  }

  /**
   * シード付き乱数生成器（線形合同法）
   */
  random() {
    this.currentSeed = (this.currentSeed * 1664525 + 1013904223) % 4294967296;
    return this.currentSeed / 4294967296;
  }

  /**
   * 指定範囲内の整数を生成
   */
  randomInt(min = 0, max = 100) {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }

  /**
   * 指定範囲内の浮動小数点数を生成
   */
  randomFloat(min = 0, max = 1) {
    return this.random() * (max - min) + min;
  }

  /**
   * 一意なIDを生成
   */
  generateUniqueId(prefix = 'test') {
    const current = this.counters.get(prefix) || 0;
    const newValue = current + 1;
    this.counters.set(prefix, newValue);
    return `${prefix}-${newValue}`;
  }

  /**
   * Three.js用のベクトルデータを生成
   */
  generateVector3(minRange = -10, maxRange = 10) {
    return {
      x: this.randomFloat(minRange, maxRange),
      y: this.randomFloat(minRange, maxRange),
      z: this.randomFloat(minRange, maxRange)
    };
  }

  /**
   * Three.js用の色データを生成
   */
  generateColor() {
    return {
      r: this.random(),
      g: this.random(),
      b: this.random(),
      hex: Math.floor(this.random() * 0xffffff)
    };
  }

  /**
   * Three.js用のマテリアルデータを生成
   */
  generateMaterialData(type = 'basic') {
    const baseData = {
      id: this.generateUniqueId('material'),
      type,
      color: this.generateColor().hex,
      transparent: this.random() > 0.5,
      opacity: this.randomFloat(0.1, 1.0)
    };

    switch (type) {
      case 'standard':
        return {
          ...baseData,
          metalness: this.random(),
          roughness: this.random(),
          emissive: this.generateColor().hex
        };
      case 'physical':
        return {
          ...baseData,
          metalness: this.random(),
          roughness: this.random(),
          clearcoat: this.random(),
          clearcoatRoughness: this.random()
        };
      case 'lambert':
        return {
          ...baseData,
          emissive: this.generateColor().hex
        };
      default:
        return baseData;
    }
  }

  /**
   * Three.js用のジオメトリデータを生成
   */
  generateGeometryData(type = 'box') {
    const baseData = {
      id: this.generateUniqueId('geometry'),
      type
    };

    switch (type) {
      case 'box':
        return {
          ...baseData,
          width: this.randomFloat(0.5, 5.0),
          height: this.randomFloat(0.5, 5.0),
          depth: this.randomFloat(0.5, 5.0),
          widthSegments: this.randomInt(1, 10),
          heightSegments: this.randomInt(1, 10),
          depthSegments: this.randomInt(1, 10)
        };
      case 'sphere':
        return {
          ...baseData,
          radius: this.randomFloat(0.5, 3.0),
          widthSegments: this.randomInt(8, 32),
          heightSegments: this.randomInt(6, 16),
          phiStart: 0,
          phiLength: Math.PI * 2,
          thetaStart: 0,
          thetaLength: Math.PI
        };
      case 'plane':
        return {
          ...baseData,
          width: this.randomFloat(1.0, 10.0),
          height: this.randomFloat(1.0, 10.0),
          widthSegments: this.randomInt(1, 20),
          heightSegments: this.randomInt(1, 20)
        };
      case 'cylinder':
        return {
          ...baseData,
          radiusTop: this.randomFloat(0.5, 2.0),
          radiusBottom: this.randomFloat(0.5, 2.0),
          height: this.randomFloat(1.0, 5.0),
          radialSegments: this.randomInt(8, 32),
          heightSegments: this.randomInt(1, 10)
        };
      default:
        return baseData;
    }
  }

  /**
   * Three.js用のライトデータを生成
   */
  generateLightData(type = 'directional') {
    const baseData = {
      id: this.generateUniqueId('light'),
      type,
      color: this.generateColor().hex,
      intensity: this.randomFloat(0.1, 2.0),
      position: this.generateVector3(-20, 20),
      castShadow: this.random() > 0.5
    };

    switch (type) {
      case 'point':
        return {
          ...baseData,
          distance: this.randomFloat(10, 100),
          decay: this.randomFloat(1, 3)
        };
      case 'spot':
        return {
          ...baseData,
          distance: this.randomFloat(10, 100),
          angle: this.randomFloat(0.1, Math.PI / 3),
          penumbra: this.randomFloat(0, 1),
          decay: this.randomFloat(1, 3),
          target: this.generateVector3(-5, 5)
        };
      case 'hemisphere':
        return {
          ...baseData,
          groundColor: this.generateColor().hex,
          intensity: this.randomFloat(0.1, 1.0)
        };
      default:
        return baseData;
    }
  }

  /**
   * Three.js用のカメラデータを生成
   */
  generateCameraData(type = 'perspective') {
    const baseData = {
      id: this.generateUniqueId('camera'),
      type,
      position: this.generateVector3(-20, 20),
      target: this.generateVector3(-5, 5)
    };

    switch (type) {
      case 'perspective':
        return {
          ...baseData,
          fov: this.randomFloat(30, 120),
          aspect: this.randomFloat(0.5, 2.0),
          near: this.randomFloat(0.01, 1.0),
          far: this.randomFloat(100, 2000)
        };
      case 'orthographic':
        return {
          ...baseData,
          left: this.randomFloat(-10, -1),
          right: this.randomFloat(1, 10),
          top: this.randomFloat(1, 10),
          bottom: this.randomFloat(-10, -1),
          near: this.randomFloat(0.01, 1.0),
          far: this.randomFloat(100, 2000)
        };
      default:
        return baseData;
    }
  }

  /**
   * Three.js用のメッシュデータを生成
   */
  generateMeshData(options = {}) {
    const {
      geometryType = 'box',
      materialType = 'basic',
      includeTransform = true
    } = options;

    const mesh = {
      id: this.generateUniqueId('mesh'),
      geometry: this.generateGeometryData(geometryType),
      material: this.generateMaterialData(materialType)
    };

    if (includeTransform) {
      mesh.position = this.generateVector3(-10, 10);
      mesh.rotation = {
        x: this.randomFloat(0, Math.PI * 2),
        y: this.randomFloat(0, Math.PI * 2),
        z: this.randomFloat(0, Math.PI * 2)
      };
      mesh.scale = {
        x: this.randomFloat(0.5, 2.0),
        y: this.randomFloat(0.5, 2.0),
        z: this.randomFloat(0.5, 2.0)
      };
    }

    return mesh;
  }

  /**
   * Three.js用のシーンデータを生成
   */
  generateSceneData(complexity = 'medium') {
    const scene = {
      id: this.generateUniqueId('scene'),
      background: this.generateColor().hex,
      fog: {
        type: this.random() > 0.5 ? 'linear' : 'exponential',
        color: this.generateColor().hex,
        near: this.randomFloat(1, 50),
        far: this.randomFloat(100, 1000),
        density: this.randomFloat(0.001, 0.01)
      },
      objects: [],
      lights: [],
      cameras: []
    };

    // 複雑さに応じてオブジェクト数を調整
    let objectCount, lightCount;
    switch (complexity) {
      case 'simple':
        objectCount = this.randomInt(1, 3);
        lightCount = this.randomInt(1, 2);
        break;
      case 'complex':
        objectCount = this.randomInt(20, 50);
        lightCount = this.randomInt(3, 8);
        break;
      default: // medium
        objectCount = this.randomInt(5, 15);
        lightCount = this.randomInt(2, 4);
    }

    // オブジェクトの生成
    const geometryTypes = ['box', 'sphere', 'plane', 'cylinder'];
    const materialTypes = ['basic', 'standard', 'lambert', 'physical'];
    
    for (let i = 0; i < objectCount; i++) {
      const geometryType = geometryTypes[this.randomInt(0, geometryTypes.length - 1)];
      const materialType = materialTypes[this.randomInt(0, materialTypes.length - 1)];
      scene.objects.push(this.generateMeshData({ geometryType, materialType }));
    }

    // ライトの生成
    const lightTypes = ['directional', 'point', 'spot', 'hemisphere'];
    for (let i = 0; i < lightCount; i++) {
      const lightType = lightTypes[this.randomInt(0, lightTypes.length - 1)];
      scene.lights.push(this.generateLightData(lightType));
    }

    // カメラの生成
    scene.cameras.push(this.generateCameraData('perspective'));
    if (this.random() > 0.7) {
      scene.cameras.push(this.generateCameraData('orthographic'));
    }

    return scene;
  }

  /**
   * パフォーマンステスト用のベンチマークデータを生成
   */
  generatePerformanceTestData(testType = 'render') {
    const baseData = {
      id: this.generateUniqueId('perf-test'),
      type: testType,
      timestamp: Date.now(),
      expectedDuration: this.randomInt(100, 5000), // ms
      memoryBudget: this.randomInt(50, 500) // MB
    };

    switch (testType) {
      case 'render':
        return {
          ...baseData,
          triangleCount: this.randomInt(1000, 100000),
          drawCalls: this.randomInt(10, 500),
          textureMemory: this.randomInt(10, 200), // MB
          expectedFPS: this.randomInt(30, 120)
        };
      case 'load':
        return {
          ...baseData,
          fileSize: this.randomInt(1, 100), // MB
          assetCount: this.randomInt(5, 100),
          expectedLoadTime: this.randomInt(500, 10000), // ms
          compressionRatio: this.randomFloat(0.1, 0.8)
        };
      case 'animation':
        return {
          ...baseData,
          frameCount: this.randomInt(60, 1800), // 1-30秒 @ 60fps
          objectCount: this.randomInt(10, 200),
          keyframeCount: this.randomInt(5, 50),
          easing: ['linear', 'ease-in', 'ease-out', 'ease-in-out'][this.randomInt(0, 3)]
        };
      case 'physics':
        return {
          ...baseData,
          bodyCount: this.randomInt(10, 1000),
          constraintCount: this.randomInt(5, 500),
          simulationSteps: this.randomInt(1, 10),
          worldSize: this.randomFloat(10, 1000)
        };
      default:
        return baseData;
    }
  }

  /**
   * テスト用のテクスチャデータを生成
   */
  generateTextureData(type = 'image') {
    const baseData = {
      id: this.generateUniqueId('texture'),
      type,
      width: Math.pow(2, this.randomInt(4, 10)), // 16-1024
      height: Math.pow(2, this.randomInt(4, 10)), // 16-1024
      format: ['RGB', 'RGBA', 'Luminance', 'LuminanceAlpha'][this.randomInt(0, 3)],
      wrapS: ['Repeat', 'ClampToEdge', 'MirroredRepeat'][this.randomInt(0, 2)],
      wrapT: ['Repeat', 'ClampToEdge', 'MirroredRepeat'][this.randomInt(0, 2)],
      magFilter: ['Nearest', 'Linear'][this.randomInt(0, 1)],
      minFilter: ['Nearest', 'Linear', 'NearestMipmapNearest', 'LinearMipmapLinear'][this.randomInt(0, 3)]
    };

    switch (type) {
      case 'image':
        return {
          ...baseData,
          src: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`, // 1x1 transparent PNG
          flipY: this.random() > 0.5,
          premultiplyAlpha: this.random() > 0.5
        };
      case 'canvas':
        return {
          ...baseData,
          canvas: null, // モックcanvas要素への参照
          needsUpdate: true
        };
      case 'data':
        return {
          ...baseData,
          data: new Uint8Array(baseData.width * baseData.height * 4).fill(255), // 白いテクスチャ
          needsUpdate: true
        };
      case 'cube':
        return {
          ...baseData,
          images: Array(6).fill(null).map(() => ({
            src: baseData.src,
            width: baseData.width,
            height: baseData.height
          }))
        };
      default:
        return baseData;
    }
  }

  /**
   * エラーシミュレーション用のデータを生成
   */
  generateErrorTestData(errorType = 'webgl') {
    const baseData = {
      id: this.generateUniqueId('error-test'),
      type: errorType,
      shouldFail: true,
      expectedError: null
    };

    switch (errorType) {
      case 'webgl':
        return {
          ...baseData,
          expectedError: ['INVALID_OPERATION', 'OUT_OF_MEMORY', 'INVALID_VALUE'][this.randomInt(0, 2)],
          contextLost: this.random() > 0.7,
          extensionMissing: this.random() > 0.8
        };
      case 'shader':
        return {
          ...baseData,
          expectedError: 'COMPILE_ERROR',
          shaderType: ['vertex', 'fragment'][this.randomInt(0, 1)],
          syntaxError: this.random() > 0.5,
          linkError: this.random() > 0.3
        };
      case 'texture':
        return {
          ...baseData,
          expectedError: 'TEXTURE_SIZE_ERROR',
          oversized: this.random() > 0.5,
          invalidFormat: this.random() > 0.6,
          corrupted: this.random() > 0.4
        };
      case 'memory':
        return {
          ...baseData,
          expectedError: 'OUT_OF_MEMORY',
          allocSize: this.randomInt(100, 2000), // MB
          fragmentedMemory: this.random() > 0.5
        };
      default:
        return baseData;
    }
  }

  /**
   * テストスイート用の設定データを生成
   */
  generateTestSuiteConfig(suiteName = 'default') {
    return {
      id: this.generateUniqueId('test-suite'),
      name: suiteName,
      timeout: this.randomInt(5000, 30000), // 5-30秒
      retries: this.randomInt(0, 3),
      parallel: this.random() > 0.5,
      headless: this.random() > 0.3,
      viewport: {
        width: [800, 1024, 1280, 1920][this.randomInt(0, 3)],
        height: [600, 768, 720, 1080][this.randomInt(0, 3)]
      },
      deviceScaleFactor: [1, 1.5, 2][this.randomInt(0, 2)],
      environment: {
        webglVersion: this.randomInt(1, 2),
        extensions: this.generateWebGLExtensions(),
        maxTextureSize: Math.pow(2, this.randomInt(10, 14)), // 1024-16384
        maxRenderbufferSize: Math.pow(2, this.randomInt(10, 14))
      },
      performance: {
        memoryLimit: this.randomInt(100, 1000), // MB
        timeLimit: this.randomInt(10, 300), // 秒
        fpsThreshold: this.randomInt(30, 60)
      }
    };
  }

  /**
   * WebGL拡張機能のリストを生成
   */
  generateWebGLExtensions() {
    const availableExtensions = [
      'WEBGL_debug_renderer_info',
      'OES_texture_float',
      'OES_texture_half_float',
      'WEBGL_lose_context',
      'OES_standard_derivatives',
      'OES_vertex_array_object',
      'WEBGL_depth_texture',
      'EXT_texture_filter_anisotropic',
      'WEBGL_compressed_texture_s3tc',
      'WEBGL_compressed_texture_pvrtc'
    ];

    const extensionCount = this.randomInt(3, availableExtensions.length);
    const selectedExtensions = [];
    
    for (let i = 0; i < extensionCount; i++) {
      const index = this.randomInt(0, availableExtensions.length - 1);
      if (!selectedExtensions.includes(availableExtensions[index])) {
        selectedExtensions.push(availableExtensions[index]);
      }
    }

    return selectedExtensions;
  }

  /**
   * すべてのカウンターをリセット
   */
  resetCounters() {
    this.counters.clear();
    this.resetSeed();
  }

  /**
   * 現在の状態を保存
   */
  saveState() {
    return {
      seed: this.seed,
      currentSeed: this.currentSeed,
      counters: new Map(this.counters)
    };
  }

  /**
   * 状態を復元
   */
  restoreState(state) {
    this.seed = state.seed;
    this.currentSeed = state.currentSeed;
    this.counters = new Map(state.counters);
  }

  /**
   * データセットの整合性を検証
   */
  validateDataset(dataset) {
    const errors = [];
    
    try {
      // 基本的な構造チェック
      if (!dataset || typeof dataset !== 'object') {
        errors.push('Dataset must be an object');
        return errors;
      }

      // IDの一意性チェック
      const ids = new Set();
      const checkIds = (obj, path = '') => {
        if (obj && typeof obj === 'object') {
          if (obj.id) {
            if (ids.has(obj.id)) {
              errors.push(`Duplicate ID found: ${obj.id} at ${path}`);
            } else {
              ids.add(obj.id);
            }
          }
          
          // 再帰的にチェック
          Object.keys(obj).forEach(key => {
            if (Array.isArray(obj[key])) {
              obj[key].forEach((item, index) => {
                checkIds(item, `${path}.${key}[${index}]`);
              });
            } else if (typeof obj[key] === 'object') {
              checkIds(obj[key], `${path}.${key}`);
            }
          });
        }
      };

      checkIds(dataset);

    } catch (error) {
      errors.push(`Validation error: ${error.message}`);
    }

    return errors;
  }
}

/**
 * テストデータジェネレーターのファクトリー
 */
export class TestDataFactory {
  constructor() {
    this.generators = new Map();
    this.presets = new Map();
    this.initializePresets();
  }

  /**
   * プリセットの初期化
   */
  initializePresets() {
    // 基本的なプリセット
    this.presets.set('minimal', {
      seed: 12345,
      sceneComplexity: 'simple',
      objectCount: 1,
      lightCount: 1
    });

    this.presets.set('standard', {
      seed: 54321,
      sceneComplexity: 'medium',
      objectCount: 10,
      lightCount: 3
    });

    this.presets.set('stress', {
      seed: 98765,
      sceneComplexity: 'complex',
      objectCount: 100,
      lightCount: 10
    });

    // パフォーマンステスト用
    this.presets.set('performance', {
      seed: 11111,
      generatePerformanceData: true,
      testTypes: ['render', 'load', 'animation', 'physics']
    });

    // エラーテスト用
    this.presets.set('error', {
      seed: 99999,
      generateErrors: true,
      errorTypes: ['webgl', 'shader', 'texture', 'memory']
    });
  }

  /**
   * 指定されたプリセットでジェネレーターを作成
   */
  createGenerator(presetName = 'standard', customSeed = null) {
    const preset = this.presets.get(presetName) || this.presets.get('standard');
    const seed = customSeed || preset.seed;
    
    const generator = new TestDataGenerator(seed);
    this.generators.set(`${presetName}-${seed}`, generator);
    
    return generator;
  }

  /**
   * テストスイート全体のデータセットを生成
   */
  generateTestSuite(presetName = 'standard', testCount = 10) {
    const generator = this.createGenerator(presetName);
    const preset = this.presets.get(presetName);
    
    const testSuite = {
      id: generator.generateUniqueId('test-suite'),
      name: presetName,
      config: generator.generateTestSuiteConfig(presetName),
      tests: []
    };

    for (let i = 0; i < testCount; i++) {
      const test = {
        id: generator.generateUniqueId('test'),
        name: `${presetName}-test-${i + 1}`,
        scene: generator.generateSceneData(preset.sceneComplexity),
        data: {}
      };

      // プリセットに応じて追加データを生成
      if (preset.generatePerformanceData) {
        test.data.performance = preset.testTypes.map(type => 
          generator.generatePerformanceTestData(type)
        );
      }

      if (preset.generateErrors) {
        test.data.errors = preset.errorTypes.map(type => 
          generator.generateErrorTestData(type)
        );
      }

      testSuite.tests.push(test);
    }

    return testSuite;
  }

  /**
   * ジェネレーターのクリーンアップ
   */
  cleanupGenerators() {
    this.generators.clear();
  }

  /**
   * カスタムプリセットの追加
   */
  addPreset(name, config) {
    this.presets.set(name, config);
  }

  /**
   * 利用可能なプリセットの一覧を取得
   */
  getAvailablePresets() {
    return Array.from(this.presets.keys());
  }
}

// シングルトンインスタンス
export const testDataFactory = new TestDataFactory();

// デフォルトエクスポート
export default TestDataGenerator;
