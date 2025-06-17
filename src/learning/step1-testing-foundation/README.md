# 学習メモ: Jestテスト環境構築の基礎 (Issue #42 より)

このドキュメントは、Issue #42「Step 1.3: 最初のテスト作成」を進めるにあたり、Jestテストフレームワークおよび関連する設定ファイル (`jest.config.js`, `jest.setup.js`) について学習した内容をまとめたものである。
Reactコンポーネントの基本的な概念や、Three.jsとの連携については、[InteractiveCube関連の学習メモ](../step1-testing/README.md)も参照のこと。

## I. Jestテストフレームワークの概要

### 1. Jestとは
Jestは、Facebookによって開発されたJavaScriptのテストフレームワークである。特にReactアプリケーションとの親和性が高く、シンプルで使いやすいことを特徴としている。

### 2. Jestの主な特徴
*   **ゼロコンフィグレーション:** 多くの場合、複雑な設定なしにテストを開始できる。
*   **スナップショットテスト:** UIコンポーネントやデータ構造が意図せず変更されていないかを確認する機能。
*   **モック機能:** 依存関係を簡単にモック化（偽のオブジェクトに置き換え）し、テスト対象を分離できる。
*   **アサーションライブラリ:** `expect` などの直感的で豊富なAPIを提供し、テストの期待値を記述しやすい。
*   **カバレッジレポート:** テストがコードのどの程度をカバーしているかを示すレポートを生成できる。
*   **並列実行:** テストを並列で実行し、テスト時間を短縮できる。
*   **jsdomとの連携:** Node.js環境でブラウザのDOM環境をシミュレートする `jsdom` とシームレスに連携し、ブラウザなしでDOM操作を含むテストを実行できる。

### 3. このプロジェクトにおけるJestの役割とメリット
*   **役割:**
    *   Reactコンポーネントのテスト (`@testing-library/react` と連携)。
    *   DOM操作のテスト (ボタンクリック、スライダー操作など)。
    *   Three.jsオブジェクトの基本的な検証 (canvas要素の存在確認、シーン初期化など)。
*   **メリット:**
    *   **開発サイクルの短縮:** 手動確認の手間を省き、迅速な動作確認が可能。
    *   **リファクタリングの安心感:** コード修正時に既存機能の破壊を検知しやすくなる。
    *   **品質向上:** バグを早期に発見し、安定したコードベースを維持。
    *   **ドキュメントとしての役割:** テストコードがコンポーネントの期待される動作を示す。

## II. テスト対象としてのReactコンポーネント

### 1. Reactコンポーネントの基本概念
Reactコンポーネントは、UIを構成する独立した再利用可能な部品である。
*   **ビュー (UI構造):** JSXで記述され、最終的にDOM要素としてレンダリングされる。
*   **ロジック (振る舞い):** イベントハンドラ、状態管理、ライフサイクル処理などを含む。
*   **データ:** 親から受け取るプロパティ (props) や、自身で管理する状態 (state) を持つ。

テストでは、コンポーネントが正しくレンダリングされるか、期待通りに表示・動作するか、ユーザーインタラクションに適切に反応するかなどを検証する。`useRef` で取得したDOM要素もテスト対象の一部となり得るが、コンポーネント全体の振る舞いが主眼となる。

### 2. 内部状態(State)、再レンダリング、副作用(Side Effects)
*   **内部状態 (State):** コンポーネントが自身で管理するデータ (`useState` フックで管理)。Stateが更新されると再レンダリングがトリガーされる。
*   **再レンダリング (Re-render):** StateやPropsの変更に応じて、Reactがコンポーネント関数を再実行し、UIの記述を更新するプロセス。差分検出により実際のDOM変更は最小限に抑えられる。
*   **副作用 (Side Effects):** レンダリング以外の処理（API呼び出し、DOM手動操作、Three.jsオブジェクトのプロパティ変更など）。主に `useEffect` フック内で扱われる。Stateの更新 → 再レンダリング → 副作用実行、という流れが基本。

## III. Jestの設定 (`jest.config.js`)

`jest.config.js` は、Jestテストランナーの動作をカスタマイズするための設定ファイルである。

### 1. `jest.config.js` の役割
テスト環境の指定、テストファイルの探索パターン、コードのトランスフォーム方法、モジュール解決のカスタマイズ、セットアップファイルの指定など、Jestの動作全般を制御する。

### 2. `src/learning/jest.config.js` の詳細解説

```javascript
// src/learning/jest.config.js
export default {
  displayName: 'learning-tests',
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'jsdom',
  testMatch: [
    '<rootDir>/step*/**/*.(test|spec).(ts|tsx)'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: true,
      tsconfig: { jsx: 'react-jsx' }
    }]
  },
  moduleNameMapper: { // (正しくは moduleNameMapper)
    '^@/(.*)$': '<rootDir>/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testTimeout: 30000
};
```

#### 2.1. `displayName`
テスト実行時に表示されるプロジェクト名。モノレポなどで複数のJestプロジェクトを区別するのに役立つ。

#### 2.2. `preset` (`'ts-jest/presets/default-esm'`)
TypeScript (`ts-jest`) とES Modules (ESM) を使用するための定義済み設定群。

#### 2.3. `testEnvironment` (`'jsdom'`)
テスト実行環境として `jsdom` を指定。Node.js上でブラウザのDOM APIをシミュレートし、Reactコンポーネントのテストを可能にする。

#### 2.4. `testMatch`
Jestがテストファイルとして認識するファイルのパターン。`<rootDir>` (この設定ファイルがあるディレクトリ) 配下の `step*` ディレクトリ内の `.test.ts(x)` または `.spec.ts(x)` ファイルを対象とする。

#### 2.5. `transform` (TypeScriptとJSXのトランスパイル)
指定されたファイルをJestが理解できる形に変換する方法を定義する。
*   **トランスコンパイルとは:** あるソースコードを別のソースコード（または同じ言語の異なるバージョン）に変換すること。TypeScriptからJavaScriptへの変換や、新しいJS構文から古いJS構文への変換など。
*   `'^.+\\.(ts|tsx)$': ['ts-jest', { useESM: true, tsconfig: { jsx: 'react-jsx' } }]`:
    *   `.ts` および `.tsx` ファイルを `ts-jest` を使ってトランスパイルする。
    *   `useESM: true`: トランスパイル後のJavaScriptがES Modules形式になるようにする。
    *   `tsconfig: { jsx: 'react-jsx' }`: JSXの変換方式をReact 17+の新しい方式に設定。

#### 2.6. `moduleNameMapper` (パスエイリアス)
モジュールインポート時のパス解決ルールを定義する。
*   `'^@/(.*)$': '<rootDir>/$1'`:
    *   正規表現を使用。`^@/` で始まるパス（例: `@/components/Button`）にマッチ。
    *   `(.*)` は `@/` に続く任意の文字列をキャプチャ（例: `components/Button`）。
    *   `<rootDir>/$1` で、キャプチャした文字列を `<rootDir>/` の後につなげて解決（例: `src/learning/components/Button`）。
    *   `@` だけでなく `(.*)` を使うことで、`@/` 以降のパス部分を動的に扱える。

#### 2.7. `setupFilesAfterEnv`
各テストファイルの実行直前、かつテストフレームワークのセットアップ後に実行されるスクリプトを指定。グローバルなテスト環境設定に使用。

#### 2.8. `extensionsToTreatAsEsm` と `moduleFileExtensions`
*   `extensionsToTreatAsEsm: ['.ts', '.tsx']`: 指定された拡張子のファイルをES Modulesとして扱うようJestに指示。
*   **TypeScriptとES Modulesの関係:** TypeScript自体がESMというより、TypeScriptコードをトランスパイルした結果のJavaScriptコードがESM形式になるように設定することを指す。
*   `moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json']`: インポート文で拡張子が省略された場合に、Jestがこの順番でファイル拡張子を試してモジュールを解決する。

#### 2.9. `testTimeout`
個々のテストケースのデフォルトタイムアウト時間（ミリ秒）。

## IV. Jestのセットアップ (`jest.setup.js`)

`jest.config.js` の `setupFilesAfterEnv` で指定され、各テストスイート実行前に読み込まれるファイル。

### 1. `jest.setup.js` の役割
テスト全体で共通のグローバル設定やテスト環境の拡張を行う。カスタムマッチャーの追加、グローバルモックの設定、ポリフィルの適用などに使用される。

### 2. `src/learning/jest.setup.js` の詳細解説

#### 2.1. `@testing-library/jest-dom` のインポート
```javascript
import '@testing-library/jest-dom';
```
`@testing-library/jest-dom` ライブラリをインポートする。これにより、Jestの `expect` にDOM要素の状態を検証するための便利なカスタムマッチャー（例: `toBeInTheDocument()`, `toBeVisible()`, `toHaveTextContent()` など）が追加され、DOMテストの記述が容易になる。

#### 2.2. WebGL APIのモック (Issue #44)
Three.jsの `WebGLRenderer` は、ブラウザが提供するWebGL APIを必要とする。しかし、テスト環境である `jsdom` はWebGLをサポートしていないため、そのままでは `new THREE.WebGLRenderer()` を呼び出した時点でエラーが発生する。
この問題を解決するため、`jest.setup.js` を利用して、テスト実行前にWebGL関連のAPIをグローバルにモック（偽の関数やオブジェクトに置き換え）する。

##### a. なぜモックが必要か？
- **環境の差異**: `jsdom` はDOM APIをシミュレートするが、GPUと連携するWebGL APIは持たない。
- **Three.jsの要求**: `WebGLRenderer` は、初期化時に `canvas.getContext('webgl')` を呼び出し、返されたコンテキストオブジェクトの様々な関数（`getExtension`, `getParameter` など）を実行しようとする。
- **エラーの回避**: これらの関数が存在しないとエラーになるため、テストコードが先に進めない。我々のテストはDOMの存在確認が目的であり、実際の描画は不要なため、これらのAPI呼び出しを「空振り」させることでエラーを回避する。

##### b. `global` オブジェクトとモックの実装
Node.js環境におけるグローバルスコープは `global` オブジェクト（ブラウザの `window` に相当）である。ここにプロパティを追加・変更することで、テスト環境全体に影響を与えられる。

```javascript
// `global`に、ブラウザ環境なら存在するはずの`WebGLRenderingContext`を定義
global.WebGLRenderingContext = jest.fn();

// canvas.getContextが、Three.jsが必要とする関数群を持つ偽のオブジェクトを返すように設定
const mockContext = {
  getExtension: jest.fn(),
  getParameter: jest.fn().mockReturnValue([]),
  // ...その他多数のモック関数
};
global.HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue(mockContext);
```

##### c. モック作成のデバッグプロセス（モグラたたき）
Three.jsが要求する関数は多岐にわたるため、一度に完璧なモックを作るのは難しい。実際には、以下のようなプロセスで段階的にモックを構築した。
1.  テストを実行し、エラーメッセージを確認する (例: `gl.getExtension is not a function`)。
2.  エラーの原因となっている関数（この場合は `getExtension`）を特定する。
3.  `mockContext` オブジェクトに、その関数を `jest.fn()` として追加する。
4.  再度テストを実行し、次のエラーに進む。
この試行錯誤を繰り返すことで、`WebGLRenderer` の初期化と初回レンダリングをパスするのに十分なモックが完成する。このプロセスは、ライブラリの内部動作を理解する上で非常に有益な学習体験となる。

##### d. VSCodeの補完と実行環境のギャップ
開発中、`global.` と入力するとVSCodeが `WebGLRenderingContext` をサジェストすることがある。これは、`tsconfig.json` の `"lib": ["DOM"]` 設定に基づき、VSCodeがブラウザ環境の型定義を読み込んでいるためである。
これはあくまで**開発時の支援機能**であり、**実行時のJest (Node.js) 環境**にそのオブジェクトが実際に存在するわけではない。この「開発環境の知識」と「実行環境の現実」のギャップを埋めるのが、`jest.setup.js`でのモックの役割である。
