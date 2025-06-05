import TestDataGenerator, { TestDataFactory, testDataFactory } from '../../src/utils/TestDataGenerator';

describe('TestDataGenerator', () => {
  describe('constructor and seed', () => {
    test('should initialize with a default seed', () => {
      const generator = new TestDataGenerator();
      expect(generator.seed).toBe(12345); // デフォルトシード
      expect(generator.currentSeed).toBe(12345);
    });

    test('should initialize with a custom seed', () => {
      const customSeed = 98765;
      const generator = new TestDataGenerator(customSeed);
      expect(generator.seed).toBe(customSeed);
      expect(generator.currentSeed).toBe(customSeed);
    });

    test('resetSeed should reset currentSeed to the initial seed', () => {
      const generator = new TestDataGenerator(111);
      generator.random(); // currentSeedを変更
      expect(generator.currentSeed).not.toBe(111);
      generator.resetSeed();
      expect(generator.currentSeed).toBe(111);
    });
  });

  describe('random number generation', () => {
    test('random() should return a value between 0 (inclusive) and 1 (exclusive)', () => {
      const generator = new TestDataGenerator();
      for (let i = 0; i < 100; i++) {
        const value = generator.random();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      }
    });

    test('random() should be reproducible with the same seed', () => {
      const generator1 = new TestDataGenerator(123);
      const generator2 = new TestDataGenerator(123);
      const values1 = Array(10).fill(null).map(() => generator1.random());
      const values2 = Array(10).fill(null).map(() => generator2.random());
      expect(values1).toEqual(values2);
    });

    test('randomInt() should return an integer within the specified range (inclusive)', () => {
      const generator = new TestDataGenerator();
      const min = 5, max = 10;
      for (let i = 0; i < 100; i++) {
        const value = generator.randomInt(min, max);
        expect(Number.isInteger(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(min);
        expect(value).toBeLessThanOrEqual(max);
      }
    });

     test('randomInt() should be reproducible', () => {
      const generator1 = new TestDataGenerator(456);
      const generator2 = new TestDataGenerator(456);
      const values1 = Array(10).fill(null).map(() => generator1.randomInt(0, 100));
      const values2 = Array(10).fill(null).map(() => generator2.randomInt(0, 100));
      expect(values1).toEqual(values2);
    });

    test('randomFloat() should return a float within the specified range', () => {
      const generator = new TestDataGenerator();
      const min = 0.1, max = 0.9;
      for (let i = 0; i < 100; i++) {
        const value = generator.randomFloat(min, max);
        expect(value).toBeGreaterThanOrEqual(min);
        expect(value).toBeLessThanOrEqual(max); // random() can be 0, so min can be returned
      }
    });

    test('randomFloat() should be reproducible', () => {
      const generator1 = new TestDataGenerator(789);
      const generator2 = new TestDataGenerator(789);
      const values1 = Array(10).fill(null).map(() => generator1.randomFloat(0, 1));
      const values2 = Array(10).fill(null).map(() => generator2.randomFloat(0, 1));
      expect(values1).toEqual(values2);
    });
  });

  describe('ID generation', () => {
    test('generateUniqueId() should generate unique IDs with a prefix', () => {
      const generator = new TestDataGenerator();
      const id1 = generator.generateUniqueId('item');
      const id2 = generator.generateUniqueId('item');
      const id3 = generator.generateUniqueId('node');
      expect(id1).toBe('item-1');
      expect(id2).toBe('item-2');
      expect(id3).toBe('node-1');
    });

    test('resetCounters() should reset ID counters', () => {
      const generator = new TestDataGenerator();
      generator.generateUniqueId('test'); // test-1
      generator.resetCounters();
      const id = generator.generateUniqueId('test');
      expect(id).toBe('test-1');
      // resetCounters also resets the seed
      expect(generator.currentSeed).toBe(generator.seed);
    });
  });

  describe('data generation methods', () => {
    let generator;
    beforeEach(() => {
      generator = new TestDataGenerator(123); // 固定シードで再現性を確保
    });

    const checkProperties = (obj, expectedProps) => {
      expectedProps.forEach(prop => {
        expect(obj).toHaveProperty(prop);
      });
    };

    test('generateVector3() should generate a vector with x, y, z properties', () => {
      const vector = generator.generateVector3();
      checkProperties(vector, ['x', 'y', 'z']);
      expect(typeof vector.x).toBe('number');
      expect(typeof vector.y).toBe('number');
      expect(typeof vector.z).toBe('number');
    });

    test('generateColor() should generate a color object with r, g, b, hex properties', () => {
      const color = generator.generateColor();
      checkProperties(color, ['r', 'g', 'b', 'hex']);
      expect(typeof color.r).toBe('number');
      expect(typeof color.g).toBe('number');
      expect(typeof color.b).toBe('number');
      expect(typeof color.hex).toBe('number');
    });

    test('generateMaterialData() should generate material data with common properties', () => {
      const material = generator.generateMaterialData();
      checkProperties(material, ['id', 'type', 'color', 'transparent', 'opacity']);
      expect(material.id).toMatch(/^material-\d+$/);
    });

    test('generateMaterialData("standard") should include standard material properties', () => {
      const material = generator.generateMaterialData('standard');
      checkProperties(material, ['metalness', 'roughness', 'emissive']);
    });

    test('generateGeometryData() should generate geometry data with common properties', () => {
      const geometry = generator.generateGeometryData();
      checkProperties(geometry, ['id', 'type']);
      expect(geometry.id).toMatch(/^geometry-\d+$/);
    });

    test('generateGeometryData("sphere") should include sphere geometry properties', () => {
      const geometry = generator.generateGeometryData('sphere');
      checkProperties(geometry, ['radius', 'widthSegments', 'heightSegments']);
    });

    test('generateLightData() should generate light data with common properties', () => {
      const light = generator.generateLightData();
      checkProperties(light, ['id', 'type', 'color', 'intensity', 'position', 'castShadow']);
      expect(light.id).toMatch(/^light-\d+$/);
    });

    test('generateLightData("spot") should include spot light properties', () => {
      const light = generator.generateLightData('spot');
      checkProperties(light, ['distance', 'angle', 'penumbra', 'decay', 'target']);
    });

    test('generateCameraData() should generate camera data with common properties', () => {
      const camera = generator.generateCameraData();
      checkProperties(camera, ['id', 'type', 'position', 'target']);
      expect(camera.id).toMatch(/^camera-\d+$/);
    });

    test('generateCameraData("perspective") should include perspective camera properties', () => {
      const camera = generator.generateCameraData('perspective');
      checkProperties(camera, ['fov', 'aspect', 'near', 'far']);
    });

    test('generateMeshData() should generate mesh data with geometry and material', () => {
      const mesh = generator.generateMeshData();
      checkProperties(mesh, ['id', 'geometry', 'material', 'position', 'rotation', 'scale']);
      expect(mesh.id).toMatch(/^mesh-\d+$/);
      expect(mesh.geometry.id).toMatch(/^geometry-\d+$/);
      expect(mesh.material.id).toMatch(/^material-\d+$/);
    });

    test('generateMeshData() without transform should not include position, rotation, scale', () => {
      const mesh = generator.generateMeshData({ includeTransform: false });
      expect(mesh).not.toHaveProperty('position');
      expect(mesh).not.toHaveProperty('rotation');
      expect(mesh).not.toHaveProperty('scale');
    });

    test('generateSceneData() should generate a scene with background, fog, objects, lights, cameras', () => {
      const scene = generator.generateSceneData();
      checkProperties(scene, ['id', 'background', 'fog', 'objects', 'lights', 'cameras']);
      expect(scene.id).toMatch(/^scene-\d+$/);
      expect(Array.isArray(scene.objects)).toBe(true);
      expect(Array.isArray(scene.lights)).toBe(true);
      expect(Array.isArray(scene.cameras)).toBe(true);
    });

     test('generateSceneData() with different complexities should vary object/light counts', () => {
      const simpleScene = generator.generateSceneData('simple');
      generator.resetCounters(); // Reset for fair comparison of counts if IDs were an issue
      generator.resetSeed(); // Ensure same random numbers for counts
      const mediumScene = generator.generateSceneData('medium');
       generator.resetCounters();
      generator.resetSeed();
      const complexScene = generator.generateSceneData('complex');

      // Note: Counts are random within a range, so exact comparison is tricky.
      // We check if they generally follow the complexity trend.
      // A more robust test might involve many runs or checking ranges.
      expect(simpleScene.objects.length).toBeLessThanOrEqual(3);
      expect(simpleScene.lights.length).toBeLessThanOrEqual(2);

      expect(mediumScene.objects.length).toBeGreaterThanOrEqual(5);
      expect(mediumScene.objects.length).toBeLessThanOrEqual(15);

      expect(complexScene.objects.length).toBeGreaterThanOrEqual(20);
    });

    test('generatePerformanceTestData() should generate performance test data', () => {
      const perfData = generator.generatePerformanceTestData('render');
      checkProperties(perfData, ['id', 'type', 'timestamp', 'expectedDuration', 'memoryBudget', 'triangleCount', 'drawCalls']);
      expect(perfData.id).toMatch(/^perf-test-\d+$/);
    });

    test('generateTextureData() should generate texture data', () => {
      const textureData = generator.generateTextureData('image');
      checkProperties(textureData, ['id', 'type', 'width', 'height', 'format', 'src']);
      expect(textureData.id).toMatch(/^texture-\d+$/);
    });

    test('generateErrorTestData() should generate error test data', () => {
      const errorData = generator.generateErrorTestData('webgl');
      checkProperties(errorData, ['id', 'type', 'shouldFail', 'expectedError']);
      expect(errorData.id).toMatch(/^error-test-\d+$/);
    });

    test('generateTestSuiteConfig() should generate test suite config data', () => {
      const config = generator.generateTestSuiteConfig('my-suite');
      checkProperties(config, ['id', 'name', 'timeout', 'retries', 'viewport', 'environment']);
      expect(config.id).toMatch(/^test-suite-\d+$/);
      expect(config.name).toBe('my-suite');
    });

    test('generateWebGLExtensions() should return an array of strings', () => {
      const extensions = generator.generateWebGLExtensions();
      expect(Array.isArray(extensions)).toBe(true);
      extensions.forEach(ext => expect(typeof ext).toBe('string'));
    });
  });

  describe('state management (saveState, restoreState)', () => {
    test('saveState() and restoreState() should preserve and restore generator state', () => {
      const generator = new TestDataGenerator(777);
      generator.generateUniqueId('abc');
      generator.randomFloat();

      const state = generator.saveState();

      // Modify generator state
      generator.generateUniqueId('def');
      generator.randomFloat();
      const idAfterChange = generator.generateUniqueId('test');
      const randomAfterChange = generator.random();

      generator.restoreState(state);

      // Check if state is restored
      expect(generator.seed).toBe(state.seed);
      expect(generator.currentSeed).toBe(state.currentSeed);
      expect(Object.fromEntries(generator.counters)).toEqual(Object.fromEntries(state.counters));

      // Check if generation continues from restored state
      const idAfterRestore = generator.generateUniqueId('abc'); // Should be abc-2
      const randomAfterRestore = generator.randomFloat();

      // Generate expected values by recreating the same state
      const generatorCompare = new TestDataGenerator(777);
      generatorCompare.generateUniqueId('abc'); // abc-1
      generatorCompare.randomFloat(); // Execute the same randomFloat() to match the saved state
      const expectedIdAfterRestore = generatorCompare.generateUniqueId('abc'); // abc-2
      const expectedRandomAfterRestore = generatorCompare.randomFloat(); // Next randomFloat() from the same state

      expect(idAfterRestore).toBe(expectedIdAfterRestore);
      expect(randomAfterRestore).toBe(expectedRandomAfterRestore);

      // Ensure it's different from the modified state before restore
      expect(idAfterRestore).not.toBe(idAfterChange);
      expect(randomAfterRestore).not.toBe(randomAfterChange);
    });
  });

  describe('validateDataset', () => {
    let generator;
    beforeEach(() => {
      generator = new TestDataGenerator();
    });

    test('should return an empty array for a valid dataset', () => {
      const scene = generator.generateSceneData();
      const errors = generator.validateDataset(scene);
      expect(errors).toEqual([]);
    });

    test('should return an error for a dataset with duplicate IDs', () => {
      const obj1 = { id: 'dup-1', data: 'a' };
      const obj2 = { id: 'dup-1', data: 'b' }; // Duplicate ID
      const dataset = { item1: obj1, item2: obj2 };
      const errors = generator.validateDataset(dataset);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('Duplicate ID found: dup-1');
    });

     test('should return an error for a nested dataset with duplicate IDs', () => {
      const dataset = {
        id: 'root-1',
        level1: {
          id: 'level1-1',
          items: [
            { id: 'item-1' },
            { id: 'item-2', nested: { id: 'level1-1' } } // Duplicate 'level1-1'
          ]
        }
      };
      const errors = generator.validateDataset(dataset);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.find(e => e.includes('Duplicate ID found: level1-1'))).toBeDefined();
    });

    test('should return an error if dataset is not an object', () => {
      const errors1 = generator.validateDataset(null);
      expect(errors1).toEqual(['Dataset must be an object']);
      const errors2 = generator.validateDataset('string');
      expect(errors2).toEqual(['Dataset must be an object']);
    });
  });
});

describe('TestDataFactory', () => {
  let factoryInstance;

  beforeEach(() => {
    factoryInstance = new TestDataFactory();
  });

  afterEach(() => {
    factoryInstance.cleanupGenerators();
  });

  describe('constructor and presets', () => {
    test('should initialize with default presets', () => {
      const presets = factoryInstance.getAvailablePresets();
      expect(presets).toContain('minimal');
      expect(presets).toContain('standard');
      expect(presets).toContain('stress');
      expect(presets).toContain('performance');
      expect(presets).toContain('error');
    });

    test('initializePresets should set up presets correctly', () => {
      factoryInstance.presets.clear(); // Clear existing
      factoryInstance.initializePresets();
      const standardPreset = factoryInstance.presets.get('standard');
      expect(standardPreset).toBeDefined();
      expect(standardPreset.seed).toBe(54321);
      expect(standardPreset.sceneComplexity).toBe('medium');
    });
  });

  describe('createGenerator', () => {
    test('should create a generator with a standard preset if no name is given', () => {
      const generator = factoryInstance.createGenerator();
      expect(generator).toBeInstanceOf(TestDataGenerator);
      expect(generator.seed).toBe(factoryInstance.presets.get('standard').seed);
    });

    test('should create a generator with the specified preset', () => {
      const generator = factoryInstance.createGenerator('minimal');
      expect(generator).toBeInstanceOf(TestDataGenerator);
      expect(generator.seed).toBe(factoryInstance.presets.get('minimal').seed);
    });

    test('should create a generator with a custom seed', () => {
      const customSeed = 123;
      const generator = factoryInstance.createGenerator('standard', customSeed);
      expect(generator.seed).toBe(customSeed);
    });

    test('should store created generators', () => {
      factoryInstance.createGenerator('minimal', 111);
      expect(factoryInstance.generators.has('minimal-111')).toBe(true);
    });
  });

  describe('generateTestSuite', () => {
    test('should generate a test suite object with correct structure', () => {
      const suite = factoryInstance.generateTestSuite('minimal', 3);
      expect(suite).toHaveProperty('id');
      expect(suite.id).toMatch(/^test-suite-\d+$/);
      expect(suite.name).toBe('minimal');
      expect(suite).toHaveProperty('config');
      expect(suite).toHaveProperty('tests');
      expect(Array.isArray(suite.tests)).toBe(true);
      expect(suite.tests.length).toBe(3);
    });

    test('each test in the suite should have id, name, scene, and data', () => {
      const suite = factoryInstance.generateTestSuite('standard', 1);
      const testCase = suite.tests[0];
      expect(testCase).toHaveProperty('id');
      expect(testCase.id).toMatch(/^test-\d+$/);
      expect(testCase).toHaveProperty('name');
      expect(testCase).toHaveProperty('scene');
      expect(testCase.scene.id).toMatch(/^scene-\d+$/);
      expect(testCase).toHaveProperty('data');
    });

    test('performance preset should include performance data in tests', () => {
      const suite = factoryInstance.generateTestSuite('performance', 1);
      const testData = suite.tests[0].data;
      expect(testData).toHaveProperty('performance');
      expect(Array.isArray(testData.performance)).toBe(true);
      expect(testData.performance.length).toBe(factoryInstance.presets.get('performance').testTypes.length);
    });

    test('error preset should include error data in tests', () => {
      const suite = factoryInstance.generateTestSuite('error', 1);
      const testData = suite.tests[0].data;
      expect(testData).toHaveProperty('errors');
      expect(Array.isArray(testData.errors)).toBe(true);
      expect(testData.errors.length).toBe(factoryInstance.presets.get('error').errorTypes.length);
    });
  });

  describe('preset management (addPreset, getAvailablePresets)', () => {
    test('addPreset should add a new preset', () => {
      const newPresetName = 'custom-fast';
      const newPresetConfig = { seed: 1, sceneComplexity: 'simple' };
      factoryInstance.addPreset(newPresetName, newPresetConfig);
      expect(factoryInstance.getAvailablePresets()).toContain(newPresetName);
      expect(factoryInstance.presets.get(newPresetName)).toEqual(newPresetConfig);
    });

    test('getAvailablePresets should return current preset names', () => {
      const initialPresets = factoryInstance.getAvailablePresets();
      factoryInstance.addPreset('temp', {});
      expect(factoryInstance.getAvailablePresets().length).toBe(initialPresets.length + 1);
    });
  });

  describe('cleanupGenerators', () => {
    test('should clear the generators map', () => {
      factoryInstance.createGenerator('minimal');
      expect(factoryInstance.generators.size).toBeGreaterThan(0);
      factoryInstance.cleanupGenerators();
      expect(factoryInstance.generators.size).toBe(0);
    });
  });
});

describe('testDataFactory (singleton)', () => {
  // Reset singleton state for each test to avoid interference
  beforeEach(() => {
    testDataFactory.cleanupGenerators();
    testDataFactory.presets.clear();
    testDataFactory.initializePresets(); // Re-initialize to default state
  });

  afterEach(() => { // Ensure cleanup after each test
    testDataFactory.cleanupGenerators();
    testDataFactory.presets.clear();
    testDataFactory.initializePresets();
  });

  test('should be an instance of TestDataFactory', () => {
    expect(testDataFactory).toBeInstanceOf(TestDataFactory);
  });

  test('singleton operations should work as expected', () => {
    // Example: creating a generator via singleton
    const generator = testDataFactory.createGenerator('stress', 999);
    expect(generator).toBeInstanceOf(TestDataGenerator);
    expect(generator.seed).toBe(999);
    expect(testDataFactory.generators.has('stress-999')).toBe(true);

    // Example: generating a test suite
    const suite = testDataFactory.generateTestSuite('minimal', 2);
    expect(suite.name).toBe('minimal');
    expect(suite.tests.length).toBe(2);
  });

  test('singleton state should be clearable and re-initializable', () => {
    testDataFactory.addPreset('my-custom-preset', { seed: 123 });
    expect(testDataFactory.getAvailablePresets()).toContain('my-custom-preset');

    // Simulate re-initialization or reset
    testDataFactory.presets.clear();
    testDataFactory.initializePresets();

    expect(testDataFactory.getAvailablePresets()).not.toContain('my-custom-preset');
    expect(testDataFactory.getAvailablePresets()).toContain('standard'); // Default presets should be back
  });
});
