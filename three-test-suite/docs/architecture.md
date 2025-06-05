# Three-test-suite アーキテクチャ

## 1. 概要

Three-test-suiteは、Three.jsアプリケーションの包括的なテストを可能にする4層アーキテクチャを採用しています。Node.js環境でのDOM・WebGL制約を解決し、テストの独立性を確保しながら、開発者がThree.jsのテストロジックに集中できる環境を提供します。

### 🎯 核心的価値
- **技術的制約の抽象化**: DOM・WebGL環境の自動提供
- **テストの独立性**: 各テスト間の完全分離
- **開発者体験の向上**: IDE支援を活用したテスト記述
- **高い再利用性**: モジュラー設計による柔軟な組み合わせ

## 2. 四部構成アーキテクチャ

### 2.1 基盤層 (Infrastructure Layer)
**役割**: ブラウザ環境とPuppeteerの基本機能を提供する土台

```mermaid
classDiagram
    class BrowserManager {
        +initialize() Promise~void~
        +cleanup() Promise~void~
        +isInitialized() boolean
        +getBrowser() Browser
        +getPage() Page
        -browser: Browser
        -page: Page
    }
    
    class PuppeteerManager {
        +initialize() Promise~void~
        +cleanup() Promise~void~
        +generateTestHTML(Function, Object) string
        +getWebGLInfo() Promise~Object~
        -browserManager: BrowserManager
    }
    
    PuppeteerManager --> BrowserManager : depends on
```

**特徴**:
- ✅ ブラウザの起動・終了管理
- ✅ ページの基本操作
- ✅ 環境の初期化・クリーンアップ
- ✅ エラーハンドリング

### 2.2 機能層 (Feature Layer)
**役割**: 基盤層を使って具体的な機能を提供する中間層

```mermaid
classDiagram
    class HTMLGenerator {
        +generate(options) string
        +generateTestHTML(Function, Object) string
        +generateThreeJsTemplate(Object) string
        -createBaseTemplate() string
        -injectUserScript(string, Function) string
    }
    
    class EnvironmentInspector {
        +getWebGLInfo(BrowserManager) Promise~Object~
        +getBrowserInfo(BrowserManager) Promise~Object~
        +getPerformanceInfo(BrowserManager) Promise~Object~
        +checkWebGLSupport(BrowserManager) Promise~boolean~
    }
    
    class PerformanceTester {
        +measureRenderingPerformance(BrowserManager) Promise~Object~
        +measureFrameRate(BrowserManager) Promise~number~
        +measureMemoryUsage(BrowserManager) Promise~Object~
        +runPerformanceTest(BrowserManager, Function) Promise~Object~
    }
    
    HTMLGenerator -.-> BrowserManager : uses
    EnvironmentInspector --> BrowserManager : requires
    PerformanceTester --> BrowserManager : requires
```

**特徴**:
- ✅ HTMLテンプレート自動生成
- ✅ WebGL環境情報取得
- ✅ レンダリング性能測定
- ✅ ブラウザ機能検証

### 2.3 Three.js層 (Three.js Layer)
**役割**: Three.js専用の高レベル機能を提供する最上位層

```mermaid
classDiagram
    class ThreeTestSuite {
        +initialize() Promise~void~
        +loadThreeScene(Function, Object) Promise~void~
        +runComprehensiveTest() Promise~Object~
        +getVisibleObjects() Promise~Array~
        +validateRendering() Promise~Object~
        -browserManager: BrowserManager
        -sceneInspector: SceneInspector
    }
    
    class SceneInspector {
        +inspectScene(BrowserManager) Promise~Object~
        +getSceneGraph(BrowserManager) Promise~Object~
        +analyzeObjects(BrowserManager) Promise~Array~
        +validateShaders(BrowserManager) Promise~Object~
    }
    
    ThreeTestSuite --> BrowserManager : requires
    ThreeTestSuite --> SceneInspector : aggregates
    SceneInspector -.-> BrowserManager : uses
```

**特徴**:
- ✅ Three.jsシーンの検査・解析
- ✅ 3Dオブジェクト情報取得
- ✅ Three.js専用テスト機能統合
- ✅ 開発者向けAPI提供

### 2.4 テスト独立性層 (Test Independence Layer) 🆕
**役割**: テスト間の独立性を確保し、モック機能を提供

```mermaid
classDiagram
    class MockBrowserManager {
        +initialize() Promise~void~
        +cleanup() Promise~void~
        +getMockPage() MockPage
        +simulateWebGLContext() Object
        -mockBrowser: Object
        -mockPage: Object
    }
    
    class MockWebGL {
        +createMockContext() WebGLRenderingContext
        +simulateWebGLOperations() Object
        +mockShaderCompilation() boolean
        +mockTextureOperations() Object
    }
    
    class TestIsolationHelper {
        +isolateTest(Function) Promise~void~
        +cleanupGlobalState() void
        +resetBrowserEnvironment(BrowserManager) Promise~void~
        +ensureTestIndependence() Promise~void~
    }
    
    class TestDataGenerator {
        +generateSceneData() Object
        +generateMeshData() Object
        +generateMaterialData() Object
        +generateRandomTestData(string) any
    }
    
    class TestUtils {
        +createTestEnvironment() Promise~Object~
        +assertThreeJsObjects(Object, Object) void
        +compareRenderResults(Object, Object) boolean
        +measureTestPerformance(Function) Promise~Object~
    }
    
    MockBrowserManager -.-> BrowserManager : mocks
    MockWebGL -.-> "WebGL Context" : mocks
    TestIsolationHelper --> BrowserManager : manages
    TestUtils --> TestDataGenerator : uses
    TestUtils --> TestIsolationHelper : uses
```

**特徴**:
- ✅ テスト間の完全分離
- ✅ ブラウザリソースのモック化
- ✅ 高速なユニットテスト実行
- ✅ テストデータの自動生成

## 3. クラス関係図

### 3.1 全体アーキテクチャ

```mermaid
graph TB
    subgraph "Test Independence Layer"
        TIH[TestIsolationHelper]
        TDG[TestDataGenerator]
        TU[TestUtils]
        MBM[MockBrowserManager]
        MW[MockWebGL]
    end
    
    subgraph "Three.js Layer"
        TTS[ThreeTestSuite]
        SI[SceneInspector]
    end
    
    subgraph "Feature Layer"
        HG[HTMLGenerator]
        EI[EnvironmentInspector]
        PT[PerformanceTester]
    end
    
    subgraph "Infrastructure Layer"
        BM[BrowserManager]
        PM[PuppeteerManager]
    end
    
    %% Dependencies
    TTS --> BM
    TTS --> SI
    SI -.-> BM
    
    HG -.-> BM
    EI --> BM
    PT --> BM
    
    PM --> BM
    
    %% Test Independence Layer
    TIH --> BM
    TU --> TDG
    TU --> TIH
    MBM -.-> BM
    
    %% Test Layer Usage
    TTS -.-> TU
    TTS -.-> MBM
    
    classDef infrastructureLayer fill:#e1f5fe
    classDef featureLayer fill:#f3e5f5
    classDef threejsLayer fill:#e8f5e8
    classDef testLayer fill:#fff3e0
    
    class BM,PM infrastructureLayer
    class HG,EI,PT featureLayer
    class TTS,SI threejsLayer
    class TIH,TDG,TU,MBM,MW testLayer
```

### 3.2 依存関係の詳細

```mermaid
graph LR
    subgraph "実行時依存関係"
        TTS --> BM
        PM --> BM
        EI --> BM
        PT --> BM
        TIH --> BM
    end
    
    subgraph "組み合わせ依存関係"
        TTS --> SI
        TU --> TDG
        TU --> TIH
    end
    
    subgraph "モック関係"
        MBM -.-> BM
        MW -.-> WebGL[WebGL Context]
    end
    
    subgraph "使用関係"
        HG -.-> BM
        SI -.-> BM
        TTS -.-> TU
    end
```

## 4. データフロー図

### 4.1 通常のテスト実行フロー

```mermaid
sequenceDiagram
    participant Developer
    participant ThreeTestSuite
    participant BrowserManager
    participant HTMLGenerator
    participant PuppeteerManager
    participant Browser
    
    Developer->>ThreeTestSuite: loadThreeScene(sceneFunction)
    ThreeTestSuite->>BrowserManager: getBrowser()
    BrowserManager->>Browser: launch()
    Browser-->>BrowserManager: browser instance
    
    ThreeTestSuite->>HTMLGenerator: generateThreeJsHTML(options)
    HTMLGenerator-->>ThreeTestSuite: HTML content
    
    ThreeTestSuite->>PuppeteerManager: page.setContent(html)
    PuppeteerManager->>Browser: load HTML + Three.js
    Browser-->>PuppeteerManager: DOM ready
    
    ThreeTestSuite->>Browser: execute scene function
    Browser-->>ThreeTestSuite: scene result
    
    ThreeTestSuite->>SceneInspector: inspectScene()
    SceneInspector-->>ThreeTestSuite: inspection data
    
    ThreeTestSuite-->>Developer: test result
```

### 4.2 モック使用時のテスト実行フロー

```mermaid
sequenceDiagram
    participant Developer
    participant TestUtils
    participant MockBrowserManager
    participant MockWebGL
    participant TestIsolationHelper
    
    Developer->>TestUtils: createTestEnvironment()
    TestUtils->>TestIsolationHelper: isolateTest()
    TestIsolationHelper->>MockBrowserManager: initialize()
    
    MockBrowserManager->>MockWebGL: createMockContext()
    MockWebGL-->>MockBrowserManager: mock WebGL context
    MockBrowserManager-->>TestUtils: mock environment
    
    TestUtils-->>Developer: isolated test environment
    
    Developer->>TestUtils: run test with mocks
    TestUtils->>MockBrowserManager: simulate operations
    MockBrowserManager-->>TestUtils: mock results
    
    TestUtils->>TestIsolationHelper: cleanupGlobalState()
    TestIsolationHelper-->>TestUtils: cleanup complete
    
    TestUtils-->>Developer: test result
```

### 4.3 テスト独立性確保のフロー

```mermaid
flowchart TD
    A[テスト開始] --> B[TestIsolationHelper.isolateTest]
    B --> C{ブラウザリソース必要?}
    
    C -->|Yes| D[BrowserManager.initialize]
    C -->|No| E[MockBrowserManager.initialize]
    
    D --> F[実ブラウザでのテスト実行]
    E --> G[モック環境でのテスト実行]
    
    F --> H[テスト実行完了]
    G --> H
    
    H --> I[TestIsolationHelper.cleanupGlobalState]
    I --> J[リソースクリーンアップ]
    J --> K[次のテストへ]
    
    style B fill:#ffeb3b
    style I fill:#ffeb3b
    style E fill:#4caf50
    style G fill:#4caf50
```

## 5. 依存関係マップ

### 5.1 層間依存関係

```mermaid
graph TB
    subgraph "外部依存"
        Puppeteer[Puppeteer]
        Jest[Jest]
        ThreeJS[Three.js CDN]
    end
    
    subgraph "Test Independence Layer"
        direction TB
        TIL_Components[TestIsolationHelper<br/>TestDataGenerator<br/>TestUtils<br/>MockBrowserManager<br/>MockWebGL]
    end
    
    subgraph "Three.js Layer"
        direction TB
        TL_Components[ThreeTestSuite<br/>SceneInspector]
    end
    
    subgraph "Feature Layer"
        direction TB
        FL_Components[HTMLGenerator<br/>EnvironmentInspector<br/>PerformanceTester]
    end
    
    subgraph "Infrastructure Layer"
        direction TB
        IL_Components[BrowserManager<br/>PuppeteerManager]
    end
    
    %% External dependencies
    IL_Components --> Puppeteer
    TL_Components -.-> ThreeJS
    TIL_Components --> Jest
    
    %% Layer dependencies
    TIL_Components --> TL_Components
    TL_Components --> FL_Components
    FL_Components --> IL_Components
    
    %% Mock relationships
    TIL_Components -.-> IL_Components
    
    style TIL_Components fill:#fff3e0
    style TL_Components fill:#e8f5e8
    style FL_Components fill:#f3e5f5
    style IL_Components fill:#e1f5fe
```

### 5.2 内部クラス間依存関係

```mermaid
graph TD
    %% Infrastructure Layer
    BM[BrowserManager]
    PM[PuppeteerManager]
    
    %% Feature Layer  
    HG[HTMLGenerator]
    EI[EnvironmentInspector]
    PT[PerformanceTester]
    
    %% Three.js Layer
    TTS[ThreeTestSuite]
    SI[SceneInspector]
    
    %% Test Independence Layer
    TIH[TestIsolationHelper]
    TDG[TestDataGenerator]
    TU[TestUtils]
    MBM[MockBrowserManager]
    MW[MockWebGL]
    
    %% Direct dependencies (solid arrows)
    PM --> BM
    EI --> BM
    PT --> BM
    TTS --> BM
    TTS --> SI
    TIH --> BM
    TU --> TDG
    TU --> TIH
    
    %% Usage dependencies (dashed arrows)
    HG -.-> BM
    SI -.-> BM
    TTS -.-> TU
    
    %% Mock relationships (dotted arrows)
    MBM -.-> BM
    MW -.-> BM
    
    %% Styling
    classDef infrastructure fill:#e1f5fe,stroke:#01579b
    classDef feature fill:#f3e5f5,stroke:#4a148c
    classDef threejs fill:#e8f5e8,stroke:#1b5e20
    classDef testIndependence fill:#fff3e0,stroke:#e65100
    
    class BM,PM infrastructure
    class HG,EI,PT feature
    class TTS,SI threejs
    class TIH,TDG,TU,MBM,MW testIndependence
```

## 6. テスト独立性設計

### 6.1 テスト独立性の実現

Three-test-suiteでは、各テストが完全に独立して実行されるよう、専用のテスト独立性層を導入しています。

#### 独立性が重要な理由
- テスト間でブラウザインスタンスが共有されることを防ぐ
- グローバル状態（`window`オブジェクト等）の汚染を排除
- WebGLコンテキストの状態持ち越しを回避
- 非同期処理のタイミング依存を解消

#### テスト独立性のアプローチ

```mermaid
flowchart LR
    subgraph "従来の問題"
        A1[テスト1] --> B1[共有ブラウザ]
        A2[テスト2] --> B1
        A3[テスト3] --> B1
        B1 --> C1[状態汚染]
    end
    
    subgraph "解決後"
        A4[テスト1] --> B2[独立環境1]
        A5[テスト2] --> B3[独立環境2]
        A6[テスト3] --> B4[独立環境3]
        B2 --> C2[完全分離]
        B3 --> C2
        B4 --> C2
    end
    
    style C1 fill:#ffcdd2
    style C2 fill:#c8e6c9
```

### 6.2 テスト独立性の実現メカニズム

#### TestIsolationHelper による分離制御

```javascript
// 使用例
test('独立したThree.jsテスト', async () => {
  await TestIsolationHelper.isolateTest(async () => {
    const testSuite = new ThreeTestSuite(mockBrowserManager);
    // テストロジック
  });
  // 自動的にクリーンアップ実行
});
```

#### MockBrowserManager による高速化

```mermaid
graph TB
    A[実ブラウザテスト] --> B[3-5秒/テスト]
    C[モックブラウザテスト] --> D[0.1-0.3秒/テスト]
    
    A --> E[完全なWebGL環境]
    C --> F[モックWebGL環境]
    
    style A fill:#ffcdd2
    style C fill:#c8e6c9
    style B fill:#ffcdd2
    style D fill:#c8e6c9
```

### 6.3 テストタイプ別の使い分け

| テストタイプ | 使用コンポーネント | 実行速度 | 精度 |
|-------------|------------------|----------|------|
| **ユニットテスト** | MockBrowserManager + MockWebGL | ⚡ 高速 | 📊 基本機能 |
| **統合テスト** | BrowserManager + 実環境 | 🐢 低速 | 🎯 高精度 |
| **パフォーマンステスト** | BrowserManager + PerformanceTester | 🐌 最低速 | 📈 最高精度 |

## 7. 拡張ポイント

### 7.1 カスタマイズ可能な箇所

#### 新しい機能層コンポーネントの追加

```mermaid
graph TB
    subgraph "既存のFeature Layer"
        HG[HTMLGenerator]
        EI[EnvironmentInspector]
        PT[PerformanceTester]
    end
    
    subgraph "拡張可能なコンポーネント"
        VR[VRTestManager] 
        AR[ARTestManager]
        AI[AITestManager]
        WG[WebGPUTestManager]
    end
    
    BM[BrowserManager]
    
    HG --> BM
    EI --> BM
    PT --> BM
    
    VR -.-> BM
    AR -.-> BM
    AI -.-> BM
    WG -.-> BM
    
    style VR fill:#e3f2fd
    style AR fill:#e3f2fd
    style AI fill:#e3f2fd
    style WG fill:#e3f2fd
```

#### カスタムモックの実装

```javascript
// 例: WebGPU モックの追加
class MockWebGPU {
  createMockDevice() {
    return {
      createBuffer: jest.fn(),
      createShaderModule: jest.fn(),
      // WebGPU API のモック実装
    };
  }
}
```

### 7.2 プラグインシステムの設計

```mermaid
graph LR
    subgraph "Core System"
        TTS[ThreeTestSuite]
        BM[BrowserManager]
    end
    
    subgraph "Plugin Interface"
        PI[PluginInterface]
    end
    
    subgraph "Custom Plugins"
        P1[VR Plugin]
        P2[Physics Plugin]
        P3[Animation Plugin]
        P4[Custom Plugin]
    end
    
    TTS --> PI
    PI --> P1
    PI --> P2
    PI --> P3
    PI --> P4
    
    P1 -.-> BM
    P2 -.-> BM
    P3 -.-> BM
    P4 -.-> BM
```

### 7.3 新機能追加時の影響範囲

#### 低影響: 機能層への追加
- 既存テストへの影響: ❌ なし
- 必要な変更: HTMLGenerator への設定追加のみ

#### 中影響: Three.js層への追加
- 既存テストへの影響: ⚠️ 最小限
- 必要な変更: ThreeTestSuite への統合

#### 高影響: 基盤層への変更
- 既存テストへの影響: 🚨 全体
- 必要な変更: 全層での調整が必要

## 8. 設計原則

### 8.1 SOLID原則の適用

#### Single Responsibility Principle (SRP)
```
BrowserManager     → ブラウザ管理のみ
HTMLGenerator      → HTML生成のみ  
ThreeTestSuite     → Three.js統合のみ
TestIsolationHelper → テスト分離のみ
```

#### Open/Closed Principle (OCP)
```mermaid
graph TB
    A[基底インターフェース] --> B[BrowserManager]
    A --> C[MockBrowserManager]
    A --> D[FutureBrowserManager]
    
    style D fill:#e3f2fd
```

#### Dependency Inversion Principle (DIP)
```javascript
// ❌ 直接依存
class ThreeTestSuite {
  constructor() {
    this.browserManager = new BrowserManager(); // 具象クラスに依存
  }
}

// ✅ 依存注入
class ThreeTestSuite {
  constructor(browserManager) { // インターフェースに依存
    this.browserManager = browserManager;
  }
}
```

### 8.2 テスト駆動設計 (TDD)

```mermaid
graph LR
    A[Red: テスト失敗] --> B[Green: 最小実装]
    B --> C[Refactor: 改善]
    C --> A
    
    style A fill:#ffcdd2
    style B fill:#c8e6c9
    style C fill:#fff3e0
```

### 8.3 関心の分離と抽象化

#### 抽象化レイヤー
```
開発者インターフェース    ← Three.js Layer
    ↓
ビジネスロジック        ← Feature Layer  
    ↓
技術的実装            ← Infrastructure Layer
    ↓
テスト支援            ← Test Independence Layer
```

#### 関心の分離の利点
- **保守性**: 各層の独立した変更が可能
- **テスト容易性**: 層ごとの単体テストが可能
- **再利用性**: 各コンポーネントの他プロジェクト活用
- **理解しやすさ**: 責任範囲の明確化

### 8.4 パフォーマンス設計

```mermaid
graph TB
    A[高速テスト] --> B[MockBrowserManager使用]
    C[精密テスト] --> D[実ブラウザ使用]
    E[バランステスト] --> F[混合実行]
    
    B --> G[開発時の迅速フィードバック]
    D --> H[リリース前の最終検証]
    F --> I[CI/CDでの段階的検証]
    
    style B fill:#c8e6c9
    style D fill:#fff3e0
    style F fill:#e1f5fe
```

## 9. まとめ

Three-test-suiteの4層アーキテクチャは、以下の核心的価値を提供します：

### 🏗️ アーキテクチャの強み
- **段階的抽象化**: 技術的複雑性を層ごとに管理
- **完全なテスト独立性**: ゼロ依存テストの実現
- **高い拡張性**: プラグインシステムによる機能追加
- **優れたパフォーマンス**: モック活用による高速テスト実行

### 🎯 開発者への価値
- **学習コストの削減**: Three.jsテストロジックに集中
- **開発速度の向上**: IDE支援とテンプレート自動生成
- **高い品質**: 独立したテストによる信頼性確保
- **将来への対応**: VR/AR/WebGPU等への拡張準備

この設計により、Three.jsアプリケーションのテスト開発が劇的に改善され、より高品質なソフトウェアの構築が可能になります。