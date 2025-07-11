# Web3DExplorer テスト戦略

## 1. 概要

本ドキュメントは、Web3DExplorerプロジェクトにおけるThree.jsアプリケーションの品質を保証するための**責任分離型テスト戦略**を定義します。各テストレイヤーが明確な責任を持ち、効率的で信頼性の高いテストスイートを構築することを目指します。

## 2. 責任分離型テスト戦略

### 戦略の基本理念

- **QUnit**: Three.jsの**数学計算**と**オブジェクト操作**に特化
- **Jest**: **UIコンポーネント**と**アプリケーションロジック**を担当  
- **Playwright**: **実際の描画結果**と**E2Eユーザーフロー**を検証

```mermaid
graph TD
    subgraph "E2Eテスト層 (Playwright)"
        direction LR
        A("ユーザー操作シナリオ<br>ブラウザ互換性<br>実際の見た目検証")
    end
    subgraph "視覚回帰テスト層 (BackstopJS + Playwright)"
        direction LR
        B("レンダリング結果<br>ピクセルレベル比較<br>デザイン系統性")
    end
    subgraph "UI統合テスト層 (Jest + Canvas Mock)"
        direction LR
        C("React/Vue コンポーネント<br>イベントハンドリング<br>アプリケーションロジック")
    end
    subgraph "Core Logic層 (QUnit + TypeScript)"
        direction LR
        D("Three.js数学計算<br>Vector/Matrix演算<br>オブジェクト管理")
    end
    
    D -- "1ms/test<br>高速・軽量" --> C -- "10-50ms/test<br>中速・安定" --> B -- "1-5s/test<br>精密・視覚的" --> A -- "10-30s/test<br>包括・E2E"
    
    style A fill:#ff9999,stroke:#333,stroke-width:2px
    style B fill:#99ccff,stroke:#333,stroke-width:2px  
    style C fill:#99ff99,stroke:#333,stroke-width:2px
    style D fill:#ffcc99,stroke:#333,stroke-width:2px
```

### レイヤー別責任範囲

- **QUnit**: Three.js公式同等の高速・軽量テスト（実際の描画なし）
- **Jest**: UIフレームワーク統合とアプリケーション機能
- **BackstopJS + Playwright**: 視覚的な正確性とレンダリング結果
- **Playwright E2E**: ユーザー体験とブラウザ間互換性

## 3. 各テスト層の実装方針

### 3.1. Core Logic層 (QUnit + TypeScript)

- **目的**: Three.jsの**数学計算**と**オブジェクト操作**の正確性を高速でテストする。Three.js公式と同等の手法で、実際の描画を伴わない純粋なロジックテストを実施。
- **主要ライブラリ**:
    - `qunit`: 軽量・高速なテストフレームワーク
    - `@types/qunit`: TypeScript型定義
    - `three`: Three.js本体（Canvas mockは不要）
- **テスト対象**:
    - Vector3、Matrix4、Quaternion等の数学計算
    - Scene、Camera、Mesh等のオブジェクト管理
    - Three.jsオブジェクトのプロパティ設定・取得
    - 座標変換、回転、スケーリング等の幾何学的処理
- **実行環境**: ブラウザ環境（HTMLテストランナー）
- **特徴**:
    - **超高速**: 1テスト1ms未満、100テスト実行でも100ms以下
    - **Canvas mock不要**: 実際の描画を行わないため環境構築が簡単
    - **TypeScript完全対応**: 型安全性とインテリセンス活用

### 3.2. UI統合テスト層 (Jest + Canvas Mock)

- **目的**: UIコンポーネント（React/Vue等）とThree.jsの統合、アプリケーションレベルのロジック、イベントハンドリングをテストする。
- **主要ライブラリ**:
    - `jest`: テストフレームワーク
    - `jest-canvas-mock`: Canvas APIモック
    - `@testing-library/react`: React コンポーネントテスト（適用時）
- **テスト対象**:
    - UIコンポーネントとThree.jsシーンの統合
    - ユーザーインタラクション（クリック、ドラッグ等）の処理
    - アプリケーション状態管理
    - イベントハンドリングとデータフロー
- **実行環境**: Node.js環境（jsdom + Canvas mock）
- **特徴**:
    - **中程度の速度**: 10-50ms/テスト
    - **UIフレームワーク統合**: React/Vue等との組み合わせテスト
    - **モック活用**: Canvas描画呼び出しの検証

### 3.3. 視覚回帰テスト層 (BackstopJS + Playwright)

- **目的**: Three.jsシーンとUIコンポーネントの**視覚的な正確性**をピクセルレベルで検証し、意図しないデザイン変更やレンダリング問題を自動検出する。
- **主要ライブラリ**:
    - `BackstopJS`: 視覚回帰テストの自動化フレームワーク
    - `Playwright`: 高性能ブラウザ自動化（BackstopJS連携）
    - `Puppeteer`: フォールバック選択肢（困難な場合）
- **テスト対象**:
    - 主要な3Dシーンの初期状態とカメラアングル
    - ライティング・シェーダー効果の視覚的整合性
    - UIコンポーネントと3Dシーンの複合表示
    - レスポンシブデザインの各ブレークポイント
    - アニメーション特定フレームの静止画比較
- **実行環境**: ヘッドレスブラウザ（Chromium/Firefox/WebKit）
- **特徴**:
    - **高精度**: ピクセル単位の差分検出
    - **並列実行**: 複数ブラウザでの同時テスト
    - **閾値調整**: 許容差異レベルの細かな設定

### 3.4. E2Eテスト層 (Playwright)

- **目的**: **実際のユーザー操作シナリオ**を再現し、アプリケーション全体のワークフローが複数のブラウザで正しく機能することを保証する。
- **主要ライブラリ**:
    - `@playwright/test`: 最新のE2Eテストランナー
    - `playwright`: ブラウザ自動化エンジン
- **テスト対象**:
    - **カメラ操作**: マウス/タッチによるズーム、パン、回転
    - **オブジェクト操作**: 3Dオブジェクトの選択、移動、変形
    - **UIインタラクション**: ボタン、メニュー、設定パネルの操作
    - **シーン遷移**: 複数画面間のナビゲーション
    - **パフォーマンス**: フレームレート維持、メモリリーク防止
- **実行環境**: 実ブラウザ（Chromium、Firefox、WebKit）
- **特徴**:
    - **クロスブラウザ**: 3つの主要ブラウザエンジンでテスト
    - **自動待機**: 非同期処理の完了を自動検出
    - **実環境再現**: 実際のユーザー体験に最も近い検証

## 4. 実装計画

### フェーズ1: 基盤構築と単体テスト
1.  **`jest-canvas-mock`の導入**: Jest環境でThree.jsが動作するように設定。
2.  **基本的な単体テストの作成**: 主要なクラスや関数のロジックを検証するテストを実装。

### フェーズ2: 視覚回帰テストの導入
1.  **`BackstopJS`の環境構築**: 設定ファイルを作成し、Docker連携で環境差異を吸収。
2.  **ベースライン画像の作成**: 主要なシーンの「正解」となる画像を生成・承認。
3.  **CI連携**: Pull Request時にBackstopJSが自動実行されるワークフローを構築。

### フェーズ3: E2Eテストの拡充
1.  **`Playwright`のセットアップ**: テストランナーとブラウザ設定を構成。
2.  **主要ユーザーフローのテストシナリオ作成**: 最も重要な機能が壊れていないことを保証するテストを実装。
3.  **クロスブラウザテストの有効化**: CI環境で定期的に全ブラウザでのテストを実行。
