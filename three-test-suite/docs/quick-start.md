# Three.js テストフレームワーク クイックスタートガイド

## 🚀 はじめに

このガイドでは、Three.js テストフレームワークの基本的な使い方を学べます。

## 📋 前提条件

- Node.js 18以上
- npm または yarn
- Three.js の基本知識

## ⚡ クイックスタート

### 1. 基本的なテスト

```javascript
import { PuppeteerManager } from '../src/PuppeteerManager.js';

test('最初のThree.jsテスト', async () => {
  const manager = new PuppeteerManager();
  await manager.initialize();
  
  const html = manager.generateTestHTML(() => {
    // 🎯 ここに Three.js コードを書く
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('three-canvas') });
    
    // 立方体を作成
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    
    camera.position.z = 5;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
    
    // テスト用のフラグを設定
    window.sceneReady = true;
  });
  
  await manager.page.setContent(html);
  
  // テスト実行
  const isReady = await manager.page.evaluate(() => window.sceneReady);
  expect(isReady).toBe(true);
  
  await manager.cleanup();
});
```

### 2. 複数オブジェクトのテスト

```javascript
test('複数オブジェクトの追加テスト', async () => {
  const manager = new PuppeteerManager();
  await manager.initialize();
  
  const html = manager.generateTestHTML(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('three-canvas') });
    
    // 立方体
    const cubeGeometry = new THREE.BoxGeometry();
    const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.x = -2;
    scene.add(cube);
    
    // 球体
    const sphereGeometry = new THREE.SphereGeometry();
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.x = 2;
    scene.add(sphere);
    
    camera.position.z = 5;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
    
    // テスト用データ
    window.testResults = {
      objectCount: scene.children.length,
      cubePosition: cube.position.x,
      spherePosition: sphere.position.x
    };
  });
  
  await manager.page.setContent(html);
  
  const results = await manager.page.evaluate(() => window.testResults);
  expect(results.objectCount).toBe(2);
  expect(results.cubePosition).toBe(-2);
  expect(results.spherePosition).toBe(2);
  
  await manager.cleanup();
});
```

### 3. 異なるThree.jsバージョンでのテスト

```javascript
test('Three.js r140 でのテスト', async () => {
  const manager = new PuppeteerManager();
  await manager.initialize();
  
  const html = manager.generateTestHTML(() => {
    // r140の新機能を使用
    const scene = new THREE.Scene();
    window.threeVersion = THREE.REVISION;
  }, {
    threeJsVersion: 'r140',
    title: 'Three.js r140 Test Environment'
  });
  
  await manager.page.setContent(html);
  
  const version = await manager.page.evaluate(() => window.threeVersion);
  expect(version).toBe(140);
  
  await manager.cleanup();
});
```

### 4. アニメーションのテスト

```javascript
test('アニメーション機能テスト', async () => {
  const manager = new PuppeteerManager();
  await manager.initialize();
  
  const html = manager.generateTestHTML(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('three-canvas') });
    
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    
    camera.position.z = 5;
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    let frameCount = 0;
    function animate() {
      frameCount++;
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      
      renderer.render(scene, camera);
      
      if (frameCount < 10) {
        requestAnimationFrame(animate);
      } else {
        // 10フレーム後にテスト完了
        window.animationComplete = true;
        window.finalRotation = {
          x: cube.rotation.x,
          y: cube.rotation.y
        };
      }
    }
    
    animate();
  });
  
  await manager.page.setContent(html);
  
  // アニメーション完了まで待機
  await manager.page.waitForFunction('window.animationComplete', { timeout: 5000 });
  
  const rotation = await manager.page.evaluate(() => window.finalRotation);
  expect(rotation.x).toBeGreaterThan(0);
  expect(rotation.y).toBeGreaterThan(0);
  
  await manager.cleanup();
});
```

### 5. エラーハンドリングのテスト

```javascript
test('WebGL非対応環境での動作', async () => {
  const manager = new PuppeteerManager();
  await manager.initialize();
  
  const html = manager.generateTestHTML(() => {
    try {
      const canvas = document.getElementById('three-canvas');
      const context = canvas.getContext('webgl');
      
      if (!context) {
        throw new Error('WebGL not supported');
      }
      
      const scene = new THREE.Scene();
      window.webglSupported = true;
    } catch (error) {
      window.webglError = error.message;
      window.webglSupported = false;
    }
  });
  
  await manager.page.setContent(html);
  
  const isSupported = await manager.page.evaluate(() => window.webglSupported);
  expect(isSupported).toBe(true); // 通常の環境ではサポートされている
  
  await manager.cleanup();
});
```

## 🎨 高度な使用例

### カスタムマテリアルのテスト

```javascript
test('カスタムシェーダーマテリアル', async () => {
  const manager = new PuppeteerManager();
  await manager.initialize();
  
  const html = manager.generateTestHTML(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('three-canvas') });
    
    // カスタムシェーダー
    const vertexShader = `
      void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
    
    const fragmentShader = `
      uniform float time;
      void main() {
        gl_FragColor = vec4(sin(time), cos(time), 0.5, 1.0);
      }
    `;
    
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 1.0 }
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader
    });
    
    const geometry = new THREE.PlaneGeometry(2, 2);
    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);
    
    camera.position.z = 3;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
    
    window.shaderTest = {
      materialType: material.type,
      uniformsCount: Object.keys(material.uniforms).length
    };
  });
  
  await manager.page.setContent(html);
  
  const result = await manager.page.evaluate(() => window.shaderTest);
  expect(result.materialType).toBe('ShaderMaterial');
  expect(result.uniformsCount).toBe(1);
  
  await manager.cleanup();
});
```

### 3Dモデル読み込みのテスト（モック）

```javascript
test('3Dモデル読み込みシミュレーション', async () => {
  const manager = new PuppeteerManager();
  await manager.initialize();
  
  const html = manager.generateTestHTML(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('three-canvas') });
    
    // GLTFローダーのモック（実際のローダーの代わり）
    function loadModel() {
      return new Promise((resolve) => {
        setTimeout(() => {
          // モデル読み込みをシミュレート
          const geometry = new THREE.BoxGeometry();
          const material = new THREE.MeshBasicMaterial({ color: 0x888888 });
          const model = new THREE.Mesh(geometry, material);
          resolve(model);
        }, 100);
      });
    }
    
    loadModel().then((model) => {
      scene.add(model);
      camera.position.z = 5;
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.render(scene, camera);
      
      window.modelLoaded = {
        success: true,
        objectCount: scene.children.length,
        modelType: model.type
      };
    });
  });
  
  await manager.page.setContent(html);
  
  // モデル読み込み完了まで待機
  await manager.page.waitForFunction('window.modelLoaded', { timeout: 5000 });
  
  const result = await manager.page.evaluate(() => window.modelLoaded);
  expect(result.success).toBe(true);
  expect(result.objectCount).toBe(1);
  expect(result.modelType).toBe('Mesh');
  
  await manager.cleanup();
});
```

## 🛠️ ベストプラクティス

### 1. テストの構造化

```javascript
describe('Three.js 基本機能', () => {
  let manager;
  
  beforeEach(async () => {
    manager = new PuppeteerManager();
    await manager.initialize();
  });
  
  afterEach(async () => {
    await manager.cleanup();
  });
  
  test('シーン作成', async () => {
    // テストロジック
  });
  
  test('オブジェクト追加', async () => {
    // テストロジック
  });
});
```

### 2. 共通のヘルパー関数

```javascript
// テストヘルパー
function createBasicScene() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('three-canvas') });
  
  camera.position.z = 5;
  renderer.setSize(window.innerWidth, window.innerHeight);
  
  return { scene, camera, renderer };
}

function createTestCube(color = 0x00ff00) {
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshBasicMaterial({ color });
  return new THREE.Mesh(geometry, material);
}

// 使用例
test('ヘルパー関数を使ったテスト', async () => {
  const html = manager.generateTestHTML(() => {
    const { scene, camera, renderer } = createBasicScene();
    const cube = createTestCube(0xff0000);
    
    scene.add(cube);
    renderer.render(scene, camera);
    
    window.testComplete = true;
  });
  
  await manager.page.setContent(html);
  // テスト続行...
});
```

### 3. 非同期処理のテスト

```javascript
test('非同期シーン構築', async () => {
  const html = manager.generateTestHTML(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('three-canvas') });
    
    // 非同期でオブジェクトを追加
    Promise.resolve().then(() => {
      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(),
        new THREE.MeshBasicMaterial({ color: 0x00ff00 })
      );
      scene.add(cube);
      
      camera.position.z = 5;
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.render(scene, camera);
      
      window.asyncComplete = {
        objectCount: scene.children.length,
        timestamp: Date.now()
      };
    });
  });
  
  await manager.page.setContent(html);
  
  // 非同期処理完了まで待機
  await manager.page.waitForFunction('window.asyncComplete', { timeout: 5000 });
  
  const result = await manager.page.evaluate(() => window.asyncComplete);
  expect(result.objectCount).toBe(1);
  expect(result.timestamp).toBeGreaterThan(0);
});
```

### 4. パフォーマンステスト

```javascript
test('レンダリングパフォーマンス', async () => {
  const html = manager.generateTestHTML(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('three-canvas') });
    
    // 多数のオブジェクトを作成
    const objectCount = 100;
    const startTime = performance.now();
    
    for (let i = 0; i < objectCount; i++) {
      const geometry = new THREE.BoxGeometry();
      const material = new THREE.MeshBasicMaterial({ 
        color: Math.random() * 0xffffff 
      });
      const cube = new THREE.Mesh(geometry, material);
      
      cube.position.x = (Math.random() - 0.5) * 10;
      cube.position.y = (Math.random() - 0.5) * 10;
      cube.position.z = (Math.random() - 0.5) * 10;
      
      scene.add(cube);
    }
    
    const creationTime = performance.now() - startTime;
    
    camera.position.z = 15;
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    const renderStartTime = performance.now();
    renderer.render(scene, camera);
    const renderTime = performance.now() - renderStartTime;
    
    window.performanceResults = {
      objectCount,
      creationTime,
      renderTime,
      totalTime: creationTime + renderTime
    };
  });
  
  await manager.page.setContent(html);
  
  const results = await manager.page.evaluate(() => window.performanceResults);
  
  expect(results.objectCount).toBe(100);
  expect(results.creationTime).toBeLessThan(1000); // 1秒以内
  expect(results.renderTime).toBeLessThan(100);    // 100ms以内
  
  console.log('Performance Results:', results);
});
```

## 🚨 トラブルシューティング

### よくある問題と解決法

#### 1. Three.js が読み込まれない

```javascript
test('Three.js読み込み確認', async () => {
  const html = manager.generateTestHTML(() => {
    // Three.jsが読み込まれるまで待機
    if (typeof THREE === 'undefined') {
      window.threeError = 'THREE is not defined';
      return;
    }
    
    window.threeLoaded = true;
    window.threeVersion = THREE.REVISION;
  });
  
  await manager.page.setContent(html);
  
  // Three.js読み込み完了まで待機
  await manager.page.waitForFunction(
    'typeof THREE !== "undefined"', 
    { timeout: 10000 }
  );
  
  const isLoaded = await manager.page.evaluate(() => window.threeLoaded);
  expect(isLoaded).toBe(true);
});
```

#### 2. WebGL コンテキストエラー

```javascript
test('WebGLコンテキスト確認', async () => {
  const html = manager.generateTestHTML(() => {
    const canvas = document.getElementById('three-canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    window.webglInfo = {
      supported: !!gl,
      vendor: gl ? gl.getParameter(gl.VENDOR) : null,
      renderer: gl ? gl.getParameter(gl.RENDERER) : null
    };
  });
  
  await manager.page.setContent(html);
  
  const webglInfo = await manager.page.evaluate(() => window.webglInfo);
  
  if (!webglInfo.supported) {
    console.warn('WebGL not supported in test environment');
  }
  
  expect(webglInfo.supported).toBe(true);
});
```

#### 3. タイムアウトエラー

```javascript
test('タイムアウト対策', async () => {
  const html = manager.generateTestHTML(() => {
    // 重い処理をシミュレート
    setTimeout(() => {
      const scene = new THREE.Scene();
      // ... シーン構築
      window.heavyProcessComplete = true;
    }, 2000); // 2秒後に完了
  });
  
  await manager.page.setContent(html);
  
  // 十分な待機時間を設定
  await manager.page.waitForFunction(
    'window.heavyProcessComplete', 
    { timeout: 5000 }  // 5秒まで待機
  );
  
  const isComplete = await manager.page.evaluate(() => window.heavyProcessComplete);
  expect(isComplete).toBe(true);
});
```

## 🔗 関連リソース

- [Three.js 公式ドキュメント](https://threejs.org/docs/)
- [Puppeteer 公式ドキュメント](https://pptr.dev/)
- [Jest テストフレームワーク](https://jestjs.io/)
- [WebGL 仕様](https://www.khronos.org/webgl/)

## 📞 サポート

問題が発生した場合は、以下を確認してください：

1. Node.js バージョンが18以上か
2. Puppeteerが正常にインストールされているか
3. WebGL対応ブラウザが利用可能か

さらなるサポートが必要な場合は、プロジェクトのIssueを作成してください。
