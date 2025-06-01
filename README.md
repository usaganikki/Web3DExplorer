# Web3DExplorer

3D web visualization library with TDD-driven testing framework for Three.js applications. Features Tokyo Station exploration with GIS integration.

## 🎯 プロジェクト目標

**Primary Goal**: 東京駅周辺の3D可視化アプリケーションの開発  
**Secondary Goal**: Three.js用の再利用可能なTDDテストフレームワークの構築

## 📁 プロジェクト構造

```
Web3DExplorer/
├── three-test-suite/           # Phase 1: Testing Framework
│   ├── src/                    # テストライブラリ実装
│   │   ├── PuppeteerManager.js ✅ (Issue #1 完了)
│   │   ├── ObjectValidator.js  🔄 (Issue #5-6)
│   │   ├── ScreenshotCapture.js 🔄 (Issue #7)
│   │   ├── ThreeTestRenderer.js 🔄 (Issue #8)
│   │   └── index.js           🔄 (Issue #8)
│   └── __tests__/             # テストライブラリのテスト
├── src/                       # Phase 2: Main Application
│   ├── components/            # React コンポーネント
│   ├── three/                # Three.js シーン管理
│   └── utils/                # ユーティリティ
├── __tests__/                # メインアプリケーションテスト
└── docs/                     # ドキュメント
```

## 🚀 開発フェーズ

### **Phase 1: Testing Framework Development (Issues #1-8)**
**Status**: 🔄 In Progress (Issue #1 ✅ 完了)

**目標**: Three.js用のTDDテストフレームワーク構築
- ✅ Issue #1: PuppeteerManager - ブラウザ起動・終了機能
- 🔄 Issue #2: PuppeteerManager - WebGL有効化機能
- 🔄 Issue #3: PuppeteerManager - HTMLテンプレート生成機能
- 🔄 Issue #4: PuppeteerManager - Three.jsシーン注入機能
- 🔄 Issue #5: ObjectValidator - オブジェクト存在確認機能
- 🔄 Issue #6: ObjectValidator - Transform検証機能
- 🔄 Issue #7: ScreenshotCapture - 基本撮影機能
- 🔄 Issue #8: ThreeTestRenderer - 統合クラス実装

**完了条件**: Issue #8完了により、three-test-suiteライブラリが使用可能になる

### **Phase 2: Main Project Foundation (Issues #9-12)**
**Status**: ⏳ Pending (Phase 1完了後)

**目標**: React + Three.js基盤アプリケーション構築
- Issue #9: プロジェクト環境セットアップ (Vite + React + Three.js)
- Issue #10: 基本Scene3Dコンポーネント実装
- Issue #11: カメラ制御機能実装 (OrbitControls)
- Issue #12: three-test-suiteとの統合テスト

### **Phase 3: Tokyo Station Implementation (Issues #13-16)**
**Status**: ⏳ Pending (Phase 2完了後)

**目標**: 東京駅3Dモデルの実装・テスト
- Issue #13: ダミー東京駅モデル配置 (BoxGeometry)
- Issue #14: 東京駅テスト実装 (three-test-suite使用)
- Issue #15: 実際の3Dモデル統合 (GLTF/GLB)
- Issue #16: 詳細モデリング・テクスチャリング

### **Phase 4: GIS Integration (Issues #17-20)**
**Status**: ⏳ Pending (Phase 3完了後)

**目標**: Cesium.js統合による地理座標系対応
- Issue #17: Cesium.js統合基盤
- Issue #18: 東京駅周辺地図表示
- Issue #19: 3Dモデルの地理座標配置
- Issue #20: GIS+Three.js統合テスト

## 🧪 TDD開発方針

### **必須ルール**
1. **テストファースト**: 全ての機能は必ずテストを先に書く（RED → GREEN → REFACTOR）
2. **Issue駆動開発**: 全ての作業はGitHub Issueとして管理
3. **小さな単位**: 各Issueは1-2日で完了可能な粒度
4. **継続的インテグレーション**: 各Issue完了時にテストが全て通ること

### **TDDサイクル**
```
RED Phase:   ❌ テストを書く（失敗する）
GREEN Phase: ✅ 最小限の実装（テスト通過）
REFACTOR:    🔧 コードをクリーンアップ
```

### **コードレビュー基準**
- テストカバレッジ90%以上
- ESLint/Prettier準拠
- TypeDoc形式のコメント
- パフォーマンス要件（テスト実行時間10秒以内）

## 🏗️ アーキテクチャ設計

### **three-test-suite Architecture**
```
ThreeTestRenderer (Main API)
├── PuppeteerManager (Browser Control)
├── ObjectValidator (3D Object Testing)
└── ScreenshotCapture (Visual Testing)
```

### **Main Application Architecture**
```
App (React)
├── Scene3D (Three.js Wrapper)
│   ├── TokyoStationModel (3D Asset)
│   ├── CameraController (FPS/TPS Controls)
│   └── LightingSystem (環境光・指向性光)
├── GISMap (Cesium Integration)
└── UI Components (Controls, Info Panel)
```

## 🔧 技術スタック

### **Testing Framework**
- **Puppeteer**: ヘッドレスブラウザ制御
- **Three.js**: 3D レンダリング・シーン管理
- **Jest**: テストランナー・アサーション

### **Main Application**  
- **React 18**: UI フレームワーク
- **@react-three/fiber**: React Three.js統合
- **Vite**: ビルドツール・開発サーバー
- **Cesium.js**: GIS・地理座標系

### **Development Tools**
- **ESLint**: コード品質管理
- **Prettier**: コードフォーマット
- **GitHub Actions**: CI/CD

## 🚦 Getting Started

### **開発環境セットアップ**
```bash
# リポジトリクローン
git clone https://github.com/usaganikki/Web3DExplorer.git
cd Web3DExplorer

# 依存関係インストール
npm install

# テストライブラリ依存関係
cd three-test-suite && npm install && cd ..

# Issue #1テスト実行（現在の進捗確認）
cd three-test-suite && npm test
```

### **Phase 1: 現在の作業**
```bash
# 次のIssueに取り組む場合
# https://github.com/usaganikki/Web3DExplorer/issues/2

# Issue #2: WebGL有効化機能のテスト作成
cd three-test-suite
# テストファイル編集
# PuppeteerManager.test.js にWebGLテスト追加
npm test
```

## 📋 Issue管理ルール

### **Issue作成規則**
- 必ず**TDD手順**を記載 (Red → Green → Refactor)
- **テストケース**を具体的に記述
- **完了定義**を明確化
- **依存関係**を明記

### **Issue進行フロー**
1. IssueをAssign
2. 新しいブランチ作成 (`feature/issue-{number}`)
3. TDDサイクル実行
4. Pull Request作成
5. テスト確認後マージ
6. Issue Close

### **優先度管理**
- **P0**: ブロッカー（他の作業が進められない）
- **P1**: 高（Phase完了に必須）
- **P2**: 中（機能拡張）
- **P3**: 低（改善・最適化）

## 🎯 現在のタスク

**Next Action**: Issue #2に取り組む
- WebGL有効化機能の実装
- テストケースの追加
- 統合確認

## 📚 参考資料

### **Three.js関連**
- [Three.js Documentation](https://threejs.org/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)

### **Testing関連**
- [Puppeteer API](https://pptr.dev/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

### **TDD Methodology**
- [Test-Driven Development: By Example](https://www.amazon.com/Test-Driven-Development-Kent-Beck/dp/0321146530)

## 🔄 継続的改善

このプロジェクトは継続的に改善されます：
- Phase完了ごとの振り返り
- テストフレームワークの機能拡張
- パフォーマンス最適化
- ドキュメント更新

**Last Updated**: 2025-06-01  
**Version**: 0.1.0  
**Phase**: 1 (Testing Framework Development)