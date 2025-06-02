# Web3DExplorer

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-0.163+-green.svg)](https://threejs.org/)
[![React](https://img.shields.io/badge/React-18.2+-blue.svg)](https://reactjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**3D web visualization library with TDD-driven testing framework for Three.js applications. Features Tokyo Station exploration with GIS integration.**

## ⚡ 重要なアップデート

🎉 **TypeScript化完了！** (v0.1.0)  
プロジェクトは完全にTypeScript化され、型安全で保守性の高い現代的な3D Webライブラリに進化しました。

## ✨ 主要機能

- **🎯 TypeScript First**: 完全な型安全性と包括的な型定義
- **⚛️ React統合**: React Three Fiberとの完全統合
- **🗺️ GIS統合**: 地理情報システムサポートと座標変換
- **🚅 Tokyo Station Explorer**: 東京駅エリアの専用3D可視化
- **🧪 TDDフレームワーク**: Three.js用包括的テストユーティリティ
- **📊 パフォーマンス監視**: 内蔵メトリクスと最適化ツール
- **🎨 イベントシステム**: 強力なイベント駆動アーキテクチャ
- **⚡ 現代的ビルドツール**: Vite、ESLint、Jest、TypeScript設定

## 🎯 プロジェクト目標と進捗

### ✅ **完了済み (Phase 1-4 統合実装)**

**🎯 Primary Goal**: 東京駅周辺の3D可視化アプリケーションの開発 → **✅ 完了**  
**🎯 Secondary Goal**: Three.js用の再利用可能なTDDテストフレームワークの構築 → **✅ 完了**

**すべてのフェーズがTypeScript実装で統合的に完了:**
- ✅ **Testing Framework**: ThreeTestUtils、カスタムJestマッチャー
- ✅ **Main Application**: React + Three.js + TypeScript基盤
- ✅ **Tokyo Station**: 東京駅3D可視化コンポーネント
- ✅ **GIS Integration**: 座標変換、地理データ統合

## 🚀 クイックスタート

### インストール

```bash
npm install web3d-explorer
# または
yarn add web3d-explorer
```

### 基本的な使用方法

```typescript
import { createExplorer } from 'web3d-explorer';
import * as THREE from 'three';

// 基本的な3Dエクスプローラーを作成
const explorer = createExplorer({
  scene: {
    background: new THREE.Color(0x87ceeb)
  },
  camera: {
    fov: 60,
    aspect: window.innerWidth / window.innerHeight,
    near: 0.1,
    far: 1000,
    position: { x: 0, y: 5, z: 10 }
  },
  renderer: {
    antialias: true
  },
  lights: [
    {
      type: 'directional',
      color: new THREE.Color(0xffffff),
      intensity: 1.0,
      position: { x: 5, y: 10, z: 5 }
    }
  ]
});

// シンプルなキューブを追加
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);

explorer.addObject(cube, {
  position: { x: 0, y: 0, z: 0 },
  name: 'my-cube'
});

// アニメーションループを開始
explorer.animate();
```

### React使用例

```tsx
import React from 'react';
import { Web3DExplorerComponent } from 'web3d-explorer';
import * as THREE from 'three';

const MyApp: React.FC = () => {
  const config = {
    scene: {
      background: new THREE.Color(0x87ceeb)
    },
    camera: {
      fov: 60,
      aspect: window.innerWidth / window.innerHeight,
      near: 0.1,
      far: 1000
    },
    renderer: {
      antialias: true
    },
    lights: [
      {
        type: 'directional' as const,
        color: new THREE.Color(0xffffff),
        intensity: 1.0,
        position: { x: 5, y: 10, z: 5 }
      }
    ]
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Web3DExplorerComponent
        config={config}
        onExplorerReady={(explorer) => {
          console.log('Explorer ready!', explorer);
        }}
      />
    </div>
  );
};

export default MyApp;
```

### 東京駅エクスプローラー

```tsx
import React from 'react';
import { TokyoStationExplorer } from 'web3d-explorer';

const TokyoStationApp: React.FC = () => {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <TokyoStationExplorer
        showDebugInfo={true}
        onLoadComplete={() => {
          console.log('Tokyo Station loaded!');
        }}
      />
    </div>
  );
};

export default TokyoStationApp;
```

## 📁 現在のプロジェクト構造

```
Web3DExplorer/
├── src/                       # TypeScript実装
│   ├── core/                  # コアExplorerクラス
│   │   └── Explorer.ts        ✅ 完了
│   ├── components/            # Reactコンポーネント
│   │   ├── Web3DExplorerComponent.tsx ✅ 完了
│   │   └── TokyoStationExplorer.tsx   ✅ 完了
│   ├── gis/                   # GIS機能
│   │   └── GISManager.ts      ✅ 完了
│   ├── test/                  # テストユーティリティ
│   │   └── ThreeTestUtils.ts  ✅ 完了
│   ├── types/                 # TypeScript型定義
│   │   ├── index.ts           ✅ 完了
│   │   ├── gis.ts            ✅ 完了
│   │   └── testing.ts        ✅ 完了
│   ├── utils/                 # ユーティリティ
│   │   └── EventEmitter.ts    ✅ 完了
│   └── index.ts              ✅ 完了
├── __tests__/                 # テストファイル
│   ├── Explorer.test.ts       ✅ 完了
│   └── GISManager.test.ts     ✅ 完了
├── examples/                  # 使用例
│   ├── basic-example.html     ✅ 完了
│   └── react-example.tsx      ✅ 完了
├── three-test-suite/          # 従来のテストスイート（統合済み）
└── docs/                      # ドキュメント
```

## 🧪 TDD開発とテスト

### テスト実行

```bash
# 全テスト実行
npm test

# ウォッチモードでテスト
npm run test:watch

# カバレッジ付きテスト
npm run test:coverage

# Three.jsテストスイート
npm run test:suite
```

### ThreeTestUtilsを使用したテスト作成

```typescript
import { threeTestUtils, createMockScene } from 'web3d-explorer/test';
import * as THREE from 'three';

describe('My 3D Component', () => {
  let scene: THREE.Scene;
  let cube: THREE.Mesh;

  beforeEach(() => {
    const mockScene = createMockScene();
    scene = mockScene.scene;
    
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    cube = new THREE.Mesh(geometry, material);
  });

  it('should position cube correctly', () => {
    cube.position.set(5, 10, 15);
    
    threeTestUtils.expectObject3D(cube).toHavePosition(
      new THREE.Vector3(5, 10, 15)
    );
  });

  it('should be visible', () => {
    threeTestUtils.expectObject3D(cube).toBeVisible();
  });

  it('should be in camera frustum', () => {
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 5;
    
    threeTestUtils.expectObject3D(cube).toBeInFrustum(camera);
  });
});
```

## 🏗️ アーキテクチャ

### **TypeScript型システム**
```
型定義システム
├── Core Types (Explorer, PerformanceMetrics, Object3DConfig)
├── GIS Types (GeoCoordinates, BuildingData, TerrainData)
├── Testing Types (TestScenario, VisualTest, ThreeTestUtils)
└── React Types (Component Props, Event Handlers)
```

### **メインアプリケーション**
```
Explorer (TypeScript Core)
├── Scene3D (Three.js管理)
│   ├── TokyoStationModel (3D Asset) ✅
│   ├── CameraController (制御) ✅
│   └── LightingSystem (照明) ✅
├── GISManager (Cesium統合) ✅
├── React Components (UI) ✅
└── ThreeTestUtils (テストサポート) ✅
```

## 🔧 技術スタック

### **コア実装**
- **TypeScript 5.0+**: 型安全性とモダンJS機能
- **Three.js 0.163.0+**: 3Dレンダリング・シーン管理
- **React 18.2+**: UIフレームワーク
- **@react-three/fiber 8.16.0+**: React Three.js統合

### **開発・ビルドツール**
- **Vite**: 高速ビルドシステム
- **Jest + ts-jest**: TypeScript対応テスト環境
- **ESLint + @typescript-eslint**: TypeScript対応リンター
- **Prettier**: コードフォーマッター

### **テスティングフレームワーク**
- **Jest Custom Matchers**: 3Dオブジェクト用カスタムマッチャー ✅
- **Puppeteer**: ヘッドレスブラウザテスト ✅
- **Performance Testing**: パフォーマンステスト機能 ✅

## 🚦 開発環境セットアップ

```bash
# リポジトリクローン
git clone https://github.com/usaganikki/Web3DExplorer.git
cd Web3DExplorer

# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev

# 型チェック
npm run type-check

# 全テスト実行
npm test

# ビルド
npm run build
```

## 📊 パフォーマンス監視

```typescript
// パフォーマンスメトリクスの取得
explorer.on('frame', ({ stats }) => {
  console.log('FPS:', stats.fps);
  console.log('Frame Time:', stats.frameTime, 'ms');
  console.log('Triangles:', stats.triangleCount);
  console.log('Draw Calls:', stats.drawCalls);
});

// 現在のメトリクス取得
const metrics = explorer.getMetrics();
```

## 🗺️ GIS統合

```typescript
import { GISManager, TOKYO_PROJECTION } from 'web3d-explorer';

const gisManager = new GISManager(TOKYO_PROJECTION);

// 緯度経度を3D座標に変換
const worldPos = gisManager.geoToWorld({
  latitude: 35.6812,  // 東京駅
  longitude: 139.7671,
  altitude: 0
});

// 地理座標に戻す
const geoPos = gisManager.worldToGeo(worldPos);
```

## 📚 API リファレンス

### Explorer クラス

```typescript
class Explorer {
  constructor(config: Web3DExplorerConfig, container?: HTMLElement)
  
  // オブジェクト管理
  addObject(object: THREE.Object3D, config?: Object3DConfig): void
  removeObject(object: THREE.Object3D): void
  
  // アニメーション・レンダリング
  animate(callback?: () => void): void
  render(): void
  
  // イベント
  on<T>(event: string, handler: EventHandler<T>): void
  off<T>(event: string, handler: EventHandler<T>): void
  emit<T>(event: string, data?: T): void
  
  // パフォーマンス
  getMetrics(): PerformanceMetrics
  
  // ライフサイクル
  resize(width: number, height: number): void
  dispose(): void
}
```

### GISManager クラス

```typescript
class GISManager {
  constructor(projection?: ProjectionSystem, center?: GeoCoordinates)
  
  // 座標変換
  geoToWorld(coords: GeoCoordinates): Position3D
  worldToGeo(position: Position3D): GeoCoordinates
  
  // データ読み込み
  loadTerrain(url: string): Promise<TerrainData>
  loadBuildings(url: string): Promise<BuildingData[]>
  loadRoads(url: string): Promise<RoadData[]>
  loadPOIs(url: string): Promise<POIData[]>
  
  // 3Dオブジェクト生成
  createTerrain(data: TerrainData): THREE.Mesh
  createBuilding(data: BuildingData): THREE.Group
  createRoad(data: RoadData): THREE.Line
  createPOI(data: POIData): THREE.Sprite
}
```

## 🎯 現在のマイルストーン

✅ **v0.1.0 - TypeScript Migration Complete**
- 完全なTypeScript化
- React Three Fiber統合
- GIS機能実装
- 東京駅エクスプローラー
- 包括的テストフレームワーク

🔄 **v0.2.0 - Enhanced Features (計画中)**
- WebXR対応（VR/AR）
- WebGL 2.0活用
- 高度なGIS統合
- パフォーマンス最適化

## 🤝 コントリビューション

1. リポジトリをフォーク
2. 機能ブランチを作成: `git checkout -b feature/amazing-feature`
3. 変更に対するテストを作成
4. 全テストが通ることを確認: `npm test`
5. 変更をコミット: `git commit -m 'Add amazing feature'`
6. ブランチにプッシュ: `git push origin feature/amazing-feature`
7. プルリクエストを作成

### **TDD開発方針**

🔴 **RED**: テストを書く（失敗）  
🟢 **GREEN**: 最小限の実装（テスト通過）  
🔧 **REFACTOR**: コードをクリーンアップ

### **コードレビュー基準**
- テストカバレッジ90%以上
- ESLint/Prettier準拠
- TypeDoc形式のコメント
- パフォーマンス要件（テスト実行時間10秒以内）

## 📋 課題とロードマップ

### Known Issues
- WebGLコンテキストロス: 自動復旧未実装
- メモリリーク: オブジェクト解放の一部エッジケース
- モバイル性能: タッチ制御の最適化が必要
- Safari互換性: 一部WebGL拡張が利用できない場合あり

### Future Roadmap
- **WebXR統合**: VR/AR対応
- **高度なGIS**: 人気GISデータソース統合
- **アクセシビリティ**: 3Dコンテンツのアクセシビリティ向上
- **パフォーマンス**: 大規模シーンの最適化

## 📚 参考資料

### **TypeScript & Three.js関連**
- [TypeScript公式ドキュメント](https://www.typescriptlang.org/)
- [Three.js Documentation](https://threejs.org/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)

### **TDD Methodology**
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Test-Driven Development: By Example](https://www.amazon.com/Test-Driven-Development-Kent-Beck/dp/0321146530)

### **GIS Integration**
- [Cesium.js Documentation](https://cesium.com/learn/)
- [地理座標系について](https://www.gsi.go.jp/sokuchikijun/datum-main.html)

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています - 詳細は[LICENSE](LICENSE)ファイルを参照してください。

## 📝 変更履歴

### v0.1.0 (2025-06-01)

- ✨ **完全なTypeScript実装**
  - 型安全性の大幅向上
  - IntelliSenseサポート
  - コンパイル時エラー検出

- ✨ **React Three Fiber統合**
  - ReactとThree.jsの完全統合
  - TypeScript対応コンポーネント
  - パフォーマンス監視機能

- ✨ **GIS統合と東京投影システム**
  - 地理座標系対応
  - 東京駅中心の投影システム
  - 3Dオブジェクト自動生成

- ✨ **包括的テストフレームワーク**
  - ThreeTestUtilsクラス
  - カスタムJestマッチャー
  - パフォーマンステスト機能
  - ビジュアル回帰テスト

- ✨ **東京駅エクスプローラーコンポーネント**
  - 専用3D可視化コンポーネント
  - リアルタイム地理データ統合
  - インタラクティブ3Dモデル

- ✨ **モダン開発環境**
  - Viteビルドシステム
  - ESLint + TypeScript設定
  - Prettier統合
  - GitHub Actions対応

---

**3D Webビジュアライゼーションコミュニティのために ❤️ で作成**

**Last Updated**: 2025-06-01  
**Version**: 0.1.0  
**Status**: ✅ TypeScript Migration Complete
