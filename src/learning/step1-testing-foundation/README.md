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
*   `'^.+\\.(ts|tsx|js|jsx)$': ['ts-jest', { ... }]`:
    *   **変更点**: 以前は `.ts` と `.tsx` のみを対象としていたが、`.js` と `.jsx` も `ts-jest` で処理するように拡張された。これにより、ESM形式で書かれたJavaScriptモジュール（例: `three/examples/jsm`）も適切にトランスパイル対象となる。
    *   `tsconfig: { ..., allowJs: true }`: `ts-jest` が `.js` ファイルを処理できるようにするための設定。

#### 2.6. `transformIgnorePatterns` (トランスパイル除外設定の変更)
Jestはデフォルトで `node_modules` 内のファイルをトランスパイルしない。しかし、`three.js` の `examples/jsm` ディレクトリ配下のモジュールは、ESM形式で配布されており、Jest (Node.js) が直接解釈できない構文を含んでいる場合がある。
*   `'/node_modules/(?!three/examples/jsm/)'`:
    *   これは「否定先読み」という正規表現のテクニック。
    *   「`node_modules/` ディレクトリにあるモジュールのうち、**`three/examples/jsm/` を除くすべて**のモジュールをトランスパイルから**除外**する」という意味になる。
    *   結果として、`three/examples/jsm/` 配下のモジュールだけが `transform` の対象となり、`ts-jest` によってJestが解釈できる形式に変換される。`OrbitControls` などを `import` する際に発生する構文エラーを回避するために不可欠な設定。

#### 2.7. `moduleNameMapper` (パスエイリアス)
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
Three.jsが要求する関数は多岐にわたるため、一度に完璧なモックを作るのは難しい。実際には、テスト実行とエラー確認を繰り返すことで、`WebGLRenderer` の初期化と初回レンダリングをパスするのに十分なモックを段階的に構築した。このプロセスは、ライブラリの内部動作を理解する上で非常に有益な学習体験となる。

##### d. VSCodeの補完と実行環境のギャップ
開発中、`global.` と入力するとVSCodeが `WebGLRenderingContext` をサジェストすることがある。これは、`tsconfig.json` の `"lib": ["DOM"]` 設定に基づき、VSCodeがブラウザ環境の型定義を読み込んでいるためである。
これはあくまで**開発時の支援機能**であり、**実行時のJest (Node.js) 環境**にそのオブジェクトが実際に存在するわけではない。この「開発環境の知識」と「実行環境の現実」のギャップを埋めるのが、`jest.setup.js`でのモックの役割である。

##### e. 主要なWebGLモック関数の役割とデバッグ事例 (更新)
`mockContext` に追加した各モック関数は、`THREE.WebGLRenderer` の初期化シーケンスにおける特定のステップをパスするために重要な役割を果たしている。以下に、デバッグ過程で遭遇した代表的なエラーと、それに対応するモック関数の役割を詳述する。

*   **`getShaderPrecisionFormat`**:
    *   **役割**: シェーダーで使われる数値（浮動小数点数や整数）の精度情報を取得する。
    *   **モック**: Three.jsが期待する `{ rangeMin, rangeMax, precision }` 形式のオブジェクトを返すことで、精度チェックをパスさせる。

*   **`getShaderInfoLog` / `getProgramInfoLog`**:
    *   **役割**: シェーダーのコンパイルやプログラムのリンクが失敗した際に、エラーログ（文字列）を取得する。
    *   **エラー**: これらの関数が `undefined` を返すと、Three.js内部で `.trim()` を呼び出そうとし、`TypeError: Cannot read properties of undefined (reading 'trim')` が発生した。
    *   **モック**: `jest.fn().mockReturnValue('')` のように空文字列を返すことで、処理が「成功した」と偽装する。

*   **`getProgramParameter`**:
    *   **役割**: シェーダープログラムに関する様々な情報を取得する。引数によって問い合わせる内容が変わる。
        *   `gl.LINK_STATUS`: プログラムのリンクが成功したか (`true`/`false`)。
        *   `gl.ACTIVE_UNIFORMS`: プログラム内にいくつの `uniform` 変数があるか（数値）。
    *   **エラー**: `uniform` 変数の数を問い合わせた際に `undefined` が返ると、後続の処理でエラーとなる。
    *   **モック**: `jest.fn((program, pname) => { ... })` のように、引数 `pname` の値に応じて返す値を動的に変更する。`LINK_STATUS` には `true` を、`ACTIVE_UNIFORMS` には `0` を返すことで、処理を安全に進める。

*   **`getActiveUniform`**:
    *   **役割**: シェーダープログラム内で有効な `uniform` 変数の詳細情報（名前、型、サイズを含むオブジェクト）を取得する。
    *   **エラー**: この関数が `undefined` を返すと、Three.jsが返り値オブジェクトの `.name` プロパティにアクセスしようとして `TypeError: Cannot read properties of undefined (reading 'name')` が発生した。
    *   **モック**: `getProgramParameter` が `uniform` の数を `0` と返すため、この関数は実際には呼ばれないはずだが、将来的な変更に備えて、`{ name: 'mockUniform', type: ..., size: ... }` という形式のダミーオブジェクトを返すように実装し、テストの堅牢性を高めている。

*   **その他の関数 (`createShader`, `compileShader`, `attachShader`, `linkProgram` など)**:
    *   **役割**: これらはシェーダーのライフサイクル（作成、ソースコード設定、コンパイル、プログラムへのアタッチ、リンク）を管理する一連の関数である。
    *   **モック**: 今回のテストでは、これらの処理が成功したかのように見せかけるだけでよく、具体的な実装は不要なため、`jest.fn()` で空の関数として定義している。これにより、`... is not a function` というエラーを回避している。

これらのデバッグ経験を通じて、`WebGLRenderer` の初期化プロセスは、単に関数が存在するだけでなく、各関数が期待されるデータ型や構造の値を返すことに依存していることが深く理解できた。テスト環境におけるモック作成は、対象ライブラリの内部APIとの対話であり、その要求仕様を一つずつ満たしていく地道な作業である。

## V. インタラクションテストの実装 (Issue #42)

コンポーネントが正しくレンダリングされることを確認した次のステップは、ユーザーの操作（インタラクション）によってコンポーネントが期待通りに振る舞うかを検証することである。ここでは `@testing-library/react` が提供する `fireEvent` を使用する。

### 1. `fireEvent` によるユーザー操作のシミュレーション

`fireEvent` は、クリック、入力、変更などのユーザーイベントをプログラムで発火させるためのユーティリティである。これにより、テストコード内で「ユーザーがボタンをクリックした」「ユーザーがスライダーを動かした」といった状況を再現できる。

```tsx
// 例: ボタンのクリックイベントを発火させる
import { render, screen, fireEvent } from '@testing-library/react';

test('ボタンをクリックできる', () => {
  render(<MyComponent />);
  const button = screen.getByRole('button', { name: /送信/i });
  fireEvent.click(button);
  // ... クリック後の状態を検証するアサーション ...
});
```

### 2. テストセレクターの選択戦略

テスト対象のDOM要素を取得する方法（セレクター）は複数あるが、`@testing-library` では**ユーザーの視点に近いセレクターを優先する**ことが強く推奨されている。これは、テストを実装の詳細から分離し、リファクタリング耐性を高めるためである。

#### a. なぜセレクターの選択が重要か？

*   **ユーザー中心のテスト**: テストは「ユーザーがどのようにアプリケーションを体験するか」を模倣すべきである。ユーザーはCSSのクラス名やHTMLのタグ構造を意識しない。彼らは画面上のテキストやラベルで要素を識別する。
*   **保守性の向上**: 実装の詳細（例: `div` を `button` に変更、クラス名を変更）に依存しないテストは、コードのリファクタリングを行っても壊れにくい。

#### b. 推奨されるセレクターの優先順位

1.  **`getByRole`**: 最も推奨。アクセシビリティツリーに基づいて要素を探すため、セマンティックなHTMLを促進する。（例: `getByRole('button')`）
2.  **`getByLabelText`**: フォーム要素に最適。`<label>` と関連付けられた要素を探す。
3.  **`getByText`**: テキストコンテンツを持つ要素（ボタン、リンク、見出しなど）を探す。
4.  **`container.querySelector`**: 上記の方法で要素を特定できない場合の最終手段。特定のDOM構造や属性に依存するため、テストが壊れやすくなる傾向がある。

#### c. `InteractiveCube` での実践例

*   **色変更ボタン**: ユーザーは「赤」というテキストでボタンを識別するため、`screen.getByText('赤')` や `screen.getByRole('button', { name: /赤/i })` を使用するのが適切である。
*   **サイズ変更スライダー**: スライダーには明確なテキストがないため、`min` や `max` 属性などを頼りに `container.querySelector('input[min="0.5"]')` で特定した。より良い実装は、`aria-label` を用いて `screen.getByLabelText('サイズ')` で取得できるようにすることである。

### 3. `null` の可能性への対処（型安全なテスト）

`querySelector` などのメソッドは、要素が見つからない場合に `null` を返す可能性がある。TypeScript環境では、この `null` の可能性を考慮しないと型エラーが発生する。

#### a. `null` チェックの重要性

テストコードの堅牢性を高め、意図しない実行時エラーを防ぐために、`null` チェックは不可欠である。

#### b. 安全な対処法

1.  **アサーションによる存在確認**: まず `expect(element).toBeInTheDocument()` で要素が存在することを表明する。これにより、テストの意図が明確になる。
2.  **`if` 文による型ガード**: `if (element)` ブロックで囲むことで、TypeScriptはそのブロック内では `element` が `null` でないと解釈する（型ガード）。これが最も安全で推奨される方法である。

```typescript
// 推奨される組み合わせ
const slider = container.querySelector('input[min="0.5"]');

// 1. テストの意図を表明
expect(slider).toBeInTheDocument();

// 2. 型安全な操作
if (slider) {
  fireEvent.change(slider, { target: { value: '2.0' } });
}
```

### 4. Three.jsオブジェクトのテストという「壁」

インタラクションテストを実装すると、次の課題に直面する。

> 「ボタンをクリックした後、**本当にThree.jsのキューブの色が変わったこと**をどうやって確認すればいいのか？」

`fireEvent` はDOMイベントを発火させるだけで、その結果として `useEffect` を経て変更されるThree.jsシーンの内部状態までは関知しない。DOM上には色の変化を示す直接的な証拠（例: `style="color: red"`）が存在しないため、単純なDOMアサーションでは不十分である。

この「DOMとWebGLの間の壁」こそが、Three.jsテストにおける本質的な困難さである。この課題を乗り越えるためには、テストコードからThree.jsのシーンにアクセスし、オブジェクトの状態を直接問い合わせるための**テストユーティリティ**が必要になる。この気づきが、次の学習ステップ（Step 2.1）へと繋がっていく。
