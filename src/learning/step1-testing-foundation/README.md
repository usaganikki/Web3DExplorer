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

### 5. テスト実装における実践的な学び

#### a. テストの同期・非同期の判断

テストを `async` にすべきかどうかの判断は、テスト対象の動作に依存する。

*   **同期で良いケース**:
    *   `fireEvent` によるユーザー操作の結果、Reactのstateが更新され、それによってDOMが**同期的**に再レンダリングされる場合。
    *   例: スライダーを操作した直後に `input` の `value` 属性を検証する。
*   **非同期 (`async/await`) が必要なケース**:
    *   ユーザー操作後、`useEffect` 内でのAPI呼び出しや、`requestAnimationFrame` による描画更新など、完了までに時間を要する**非同期処理**の結果を待つ必要がある場合。
    *   例: 色変更ボタンをクリックした後、Three.jsのオブジェクトの色が実際に変更されたかを確認する。この変更はレンダリングサイクルをまたぐため、非同期で待機する必要がある。

#### b. `toHaveValue` マッチャーと型の問題

`input` 要素の値を検証する `toHaveValue` マッチャーを使用する際には、型の違いに注意が必要である。

*   **`input.value` は常に文字列**: DOM要素の `value` 属性は、たとえ数値のように見えても、その実体は常に**文字列**である。
*   **期待値も文字列で**: `expect(slider).toHaveValue("2.0")` のように、期待値も文字列で渡す必要がある。数値 (`2.0`) を渡すと、型の違いによりテストは失敗する。

#### c. 表示値と `input.value` の不一致

テスト中に、「画面表示は `"2.0"` なのに、テストでは `input.value` が `"2"` として受信される」という現象に遭遇した。これは、以下の2つの値が異なる方法で生成されているためである。

1.  **表示用の値**: コンポーネント内では `<span>サイズ: {cubeSize.toFixed(1)}</span>` のように、`toFixed(1)` を使って数値を「小数点以下1桁を持つ文字列」に**明示的にフォーマット**している。
2.  **`input` の `value` 属性**: `value={cubeSize}` の部分では、Reactが数値を `input` の `value` 属性に設定する。この際、JavaScriptの標準的な挙動として、小数点以下が0の数値（例: `2.0`）は整数部分のみの文字列（`"2"`）に変換されることがある。

この経験から、**テストで検証している対象が何であるか（フォーマットされた表示テキストなのか、要素の内部的な属性値なのか）を正確に意識すること**の重要性を学んだ。

#### f. テストユーティリティとTypeScript設定の落とし穴 (Issue #45)

テストコードの共通化を目指してテストユーティリティファイル (`test-utils.tsx`) を作成する過程で、いくつかのTypeScript特有の問題に直面した。これらは、テスト環境の裏側で動いている仕組みの理解を深める良い機会となった。

*   **問題1: `.ts` ファイル内でのJSX構文エラー**
    *   **現象**: 当初、ユーティリティファイルを `test-utils.ts` として作成したところ、`<InteractiveCube />` のようなJSX構文部分でコンパイルエラーが発生した。
    *   **原因**: TypeScriptコンパイラは、ファイル拡張子が `.ts` の場合、そのファイルにJSXが含まれていないと想定する。
    *   **解決策**: ファイル拡張子を `.tsx` に変更することで、コンパイラにJSX構文を正しく解釈・トランスパイルするよう指示した。Reactコンポーネントを含むファイルには `.tsx` を使用することが原則である。

*   **問題2: `RenderResult` の型推論エラー (`ts(2742)`)**
    *   **現象**: `render()` 関数をラップしたヘルパー関数 (`renderInteractiveCube`) が、`The inferred type of 'X' cannot be named without a reference to 'Y'. This is likely not portable. A type annotation is necessary.` というエラーを発生させた。
    - **原因の深掘り**:
        1.  TypeScriptの型推論機能が、`render()` 関数の返り値の型を推論しようとした。
        2.  その結果、`node_modules` の非常に深い階層にある内部的な型定義ファイルへの直接参照を持つ、複雑な型が推論された。
        3.  このような内部パスへの参照は、`npm install` の実行環境（OS、パッケージマネージャーの種類やバージョンなど）によって `node_modules` の構造が変わりうるため、「移植性がない（not portable）」と見なされる。
        4.  TypeScriptは、このような不安定な型定義が生成されるのを防ぐため、意図的にエラーを発生させ、開発者に安定した型名を明示的に指定するよう促した。
    *   **解決策**: ライブラリ (`@testing-library/react`) が公式にエクスポートしている安定した型名 `RenderResult` を、関数の返り値として明示的に型注釈 (`: RenderResult`) することで解決した。

*   **学び**:
    *   **モジュール解決の仕組み**: `import { X } from 'package-name'` という記述は、`node_modules` の内部構造に依存しない、安定した「パッケージ名」による解決方法である。一方、TypeScriptが推論した内部パスへの参照は不安定であり、避けるべきプラクティスであることを学んだ。
    *   **型定義の提供元**: `@types/jest` のように、JavaScriptライブラリに対して型定義を別途提供する `@types` パッケージの役割と、`@testing-library/react` のようにライブラリ本体に型定義が同梱されているモダンなパッケージの違いを理解した。

## VI. 多様なテスト観点と品質保証

このステップの一連のテスト実装を通じて、単に「テストが通ること」以上に、アプリケーションの品質を多角的に保証するためには様々なテスト観点が必要であることを学んだ。各テストがどのような品質を担保しているかを以下にまとめる。

### 1. 基本的な健全性 (Sanity Check)
*   **テスト内容**: コンポーネントのレンダリングテスト、主要なUI要素（ボタン、スライダー）の存在確認。
*   **保証する品質**: アプリケーションが起動時にクラッシュせず、ユーザーが必要とする最低限のUIが表示されること。これは、最も基本的な安定性を担保する「健康診断」のようなものである。

### 2. UIフィードバックの正確性 (UI Feedback Accuracy)
*   **テスト内容**: スライダーを操作した後に、画面に表示される値（例: `サイズ: 2.5`）が正しく更新されるかの確認。
*   **保証する品質**: ユーザーのアクションに対して、システムが視覚的に正しいフィードバックを返せていること。これはユーザー体験の根幹をなす部分であり、アプリケーションが「生きている」ことをユーザーに伝える重要な役割を持つ。

### 3. 仕様の堅牢性 (Specification Robustness)
*   **テスト内容**: スライダーが取りうる最小値と最大値（例: `0.5` と `3.0`）でテストする境界値分析。
*   **保証する品質**: 仕様の限界点（エッジケース）においても、アプリケーションが予期せぬエラーや誤動作を起こさないこと。これにより、システムの堅牢性と信頼性が向上する。

### 4. 機能間の独立性 (Feature Independence)
*   **テスト内容**: サイズ変更 → 色変更 → 位置変更といった、複数の異なる機能を連続して操作する複合操作テスト。
*   **保証する品質**: ある機能の操作が、別の無関係な機能の状態を意図せず破壊しないこと。単機能のテストだけでは見つけられない、機能間の意図せぬ結合や副作用に起因するバグを防ぎ、より現実的なユーザーシナリオにおける安定性を保証する。

### 5. 内部ロジックの正当性 (Internal Logic Correctness)
*   **テスト内容**: 色変更ボタンをクリックした後、Three.jsオブジェクト自体の `material.color` プロパティが本当に変更されたかを確認しようとする試み。
*   **保証する品質**: ユーザーに見えるUIの裏側で、アプリケーションの核となるビジネスロジック（この場合は3Dオブジェクトの状態）が正しく動作していること。
*   **得られた知見**: このテストは、DOMの状態を観測するだけでは実行できず、コンポーネントの内部状態にアクセスする必要があるという本質的な課題を浮き彫りにした。これにより、UIのテストとロジックのテストの違い、そして**テスト容易性（Testability）**という新たな設計課題を発見し、テストユーティリティの必要性を実感するに至った。

### まとめ
信頼性の高いアプリケーションを構築するためには、これらのテスト観点を適切に組み合わせ、網羅的なテストスイートを構築することが不可欠である。それぞれのテストは異なる目的と役割を持っており、多層的に品質を保証することで、安心して開発を進めることができる。

## VII. テストユーティリティの設計と実装 (Issue #47)

インタラクションテストの実装（Issue #42）を進める中で、テストコードの重複と複雑さが課題として浮上した。同様の操作（スライダー値の変更、色ボタンのクリックなど）を複数のテストで繰り返すうちに、コードの保守性とテストの可読性が低下していることが明らかになった。この課題を解決するため、Issue #47では**テストユーティリティ関数群**を設計・実装し、テストコードの品質向上を図った。

### 1. テストユーティリティの必要性と設計思想

#### a. DRY原則（Don't Repeat Yourself）の適用

テストコードにおいても、プロダクションコードと同様にDRY原則は重要である。同じ操作パターンの重複は、以下の問題を引き起こす：

*   **保守コストの増大**: 操作方法が変更された際に、複数のテストファイルを修正する必要がある。
*   **エラーの拡散**: 一箇所の誤った実装が、コピー＆ペーストによって複数のテストに波及する。
*   **可読性の低下**: 本質的なテストロジックが、操作の詳細に埋もれて見えにくくなる。

#### b. 責務分離と抽象化

各テストユーティリティ関数は、明確で単一の責務を持つように設計した：

*   **操作関数**: ユーザーアクションをシミュレートする（例: スライダー値変更、ボタンクリック）
*   **検証関数**: 期待される状態を確認する（例: 要素の存在確認、値の検証）
*   **複合関数**: 操作と検証を組み合わせた、高レベルなテストシナリオを提供する

#### c. 型安全性の確保

TypeScriptの型システムを積極的に活用し、テスト実装時の誤りを**コンパイル時**に検出できるよう設計した。これにより、テストの信頼性向上と開発効率の改善を両立した。

### 2. 段階的実装: 4つのStepによる学習アプローチ

Issue #47では、機能を段階的に実装することで、各概念を確実に理解しながら進める学習アプローチを採用した。

#### Step 1: `changeSliderValue` - 基本的な操作関数

```tsx
export const changeSliderValue = (slider: HTMLInputElement, value: string) => {
    expect(slider).toBeInTheDocument();
    fireEvent.change(slider, { target: { value }});
    return slider;
};
```

**設計のポイント**:
*   **防御的プログラミング**: `expect(slider).toBeInTheDocument()`で要素の存在を事前確認
*   **型安全性**: `HTMLInputElement`の明示的な型指定
*   **戻り値の提供**: チェーンメソッド的な使用を可能にする
*   **同期操作**: スライダー値の変更は即座に反映されるため、`async`不要

**学習ポイント**:
この基本関数を通じて、テストユーティリティにおける**エラーハンドリング**と**型安全性**の重要性を学んだ。`null`の可能性を考慮しない実装は、実行時エラーの原因となる。

#### Step 2: `changeSliderAndVerifyDisplay` - 非同期検証付き操作

```tsx
export const changeSliderAndVerifyDisplay = async (
    slider : HTMLInputElement,
    value : string,
    expectedText : string
) => {
    changeSliderValue(slider, value);
    expect(await screen.findByText(expectedText)).toBeInTheDocument();
};
```

**設計のポイント**:
*   **関数の再利用**: Step 1の`changeSliderValue`を効果的に活用
*   **非同期処理**: `async/await`によるReact状態更新の待機
*   **`findByText`の選択**: DOM更新を確実に待機する非同期メソッドを採用

**学習ポイント**:
Reactの状態更新とDOM反映のタイミング差を理解し、**同期的なテストと非同期的なテストの使い分け**を学んだ。`getByText`（同期）と`findByText`（非同期）の違いは、テスト結果の信頼性に直結する。

#### Step 3: `changeColorAndVerify` - TypeScript型システムの活用

当初の実装案:
```tsx
export const changeColorAndVerify = (colorName: string) => {
    const buttons = getColorButtons();
    const button = buttons[colorName as keyof typeof buttons];
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
};
```

**TypeScript型システムの深い理解**:

この実装で、`keyof typeof buttons`という高度なTypeScript機能を学習した。

##### a. `typeof`と`keyof`の連携メカニズム

```tsx
// Step 1: buttonsオブジェクトの実際の構造
const buttons = {
    green: HTMLButtonElement,
    red: HTMLButtonElement,
    blue: HTMLButtonElement,
    yellow: HTMLButtonElement
};

// Step 2: typeof buttonsで型情報を取得
typeof buttons = {
    green: HTMLButtonElement,
    red: HTMLButtonElement,
    blue: HTMLButtonElement,
    yellow: HTMLButtonElement
}

// Step 3: keyofでオブジェクトのキーを抽出
keyof typeof buttons = "green" | "red" | "blue" | "yellow"
```

##### b. 値（Value）vs 型（Type）の重要な区別

**重要な学習ポイント**: TypeScriptでは、実行時の「値」と、コンパイル時の「型」は明確に分離されている。

```tsx
// ❌ これは動作しない
const button = buttons[colorName as keyof buttons];
//                                    ^^^^^^^ 
// Error: 'buttons' refers to a value, but is being used as a type here.

// ✅ 正しい実装
const button = buttons[colorName as keyof typeof buttons];
//                                    ^^^^^ 
// typeof で値から型を取得
```

この違いは、TypeScriptの**型レベル操作**と**値レベル操作**の本質的な差異を示している。`keyof`は型に対してのみ適用可能であり、`typeof`は値から型への「橋渡し」の役割を果たす。

##### c. 保守性とスケーラビリティ

```tsx
// getColorButtons()に新しい色が追加された場合
export const getColorButtons = () => {
    return {
        green: screen.getByText('緑'),
        red: screen.getByText('赤'),
        blue: screen.getByText('青'),
        yellow: screen.getByText('黄'),
        orange: screen.getByText('橙')  // ← 新規追加
    };
};

// keyof typeof buttons は自動で更新される
// "green" | "red" | "blue" | "yellow" | "orange"
```

**型システムによる自動更新**は、手動でのメンテナンスミスを防ぎ、**コードの保守性**を大幅に向上させる。

#### 改善されたStep 3の最終実装: 責務分離の徹底

設計レビューの過程で、より良い設計アプローチを発見した：

```tsx
export const changeColorAndVerify = ( 
    buttons : ColorButtons, 
    colorName : string
) => {
    const button = buttons[colorName as keyof typeof buttons];
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
};
```

**改善点**:
*   **依存関係の明示化**: `buttons`パラメータにより、関数が何に依存しているかが明確
*   **純粋関数への近似**: 同じ入力に対して同じ動作を保証
*   **テスト時の柔軟性**: 異なるコンテナから取得したボタンでも使用可能

#### Step 4: 検証ヘルパー関数群 - 包括的なテストサポート

```tsx
export const verifyBasicElements = (container : HTMLElement) => {
    const sliders = getSliders(container);
    expect(sliders.size).toBeInTheDocument();
    expect(sliders.position).toBeInTheDocument();
    expect(sliders.rotation).toBeInTheDocument();

    const buttons = getColorButtons(container);
    Object.values(buttons).forEach(button => {
        expect(button).toBeInTheDocument();
    });
};

export const getSlidersWithValidation = (container : HTMLElement) => {
    const sliders = getSliders(container);
    verifyBasicElements(container);
    return sliders;
};

export const verifySliderValue = (slider: HTMLInputElement, expectedValue: string) => {
    expect(slider.value).toBe(expectedValue);
};
```

**設計の特徴**:
*   **一括検証**: `verifyBasicElements`で全要素の存在を効率的に確認
*   **安全な取得**: `getSlidersWithValidation`で取得と検証を同時実行
*   **個別検証**: `verifySliderValue`で特定の状態を確認

### 3. DOM要素取得の一貫性問題と解決プロセス

実装過程で発見した重要な設計上の不整合とその解決方法を詳述する。

#### a. 問題の発見: 異なるアプローチの混在

```tsx
// getSliders: containerベースのアプローチ
export const getSliders = (container: HTMLElement) => {
    const sizeSlider = container.querySelector('input[min="0.5"]') as HTMLInputElement;
    // ...
};

// getColorButtons: screenベースのアプローチ（問題のある実装）
export const getColorButtons = () => {
    return {
        green: screen.getByText('緑'),  // ← document全体を検索
        // ...
    };
};
```

**問題点の分析**:
*   **スコープの不一致**: `getSliders`は特定コンテナ内、`getColorButtons`はdocument全体を検索
*   **一貫性の欠如**: 同じ目的（UI要素取得）なのに異なる手法を使用
*   **テスト分離の困難**: 複数コンポーネントのテスト時に干渉する可能性

#### b. 解決策: containerベースへの統一

```tsx
export const getColorButtons = (container: HTMLElement) => {
    const buttons = Array.from(container.querySelectorAll('button'));
    
    return {
        green: buttons.find(btn => btn.textContent?.includes('緑')) as HTMLButtonElement,
        red: buttons.find(btn => btn.textContent?.includes('赤')) as HTMLButtonElement,
        blue: buttons.find(btn => btn.textContent?.includes('青')) as HTMLButtonElement,
        yellow: buttons.find(btn => btn.textContent?.includes('黄')) as HTMLButtonElement
    };
};
```

**技術的改善点**:
*   **標準DOM API使用**: `:contains()`疑似セレクタ（jQuery特有）を標準的な`textContent?.includes()`に変更
*   **null安全性**: `?.`オペレータによる安全なプロパティアクセス
*   **型安全性**: `as HTMLButtonElement`による適切な型アサーション
*   **スコープ統一**: 全ての要素取得がcontainerベースに統一

#### c. 連鎖的な修正: 依存関数の更新

この変更により、以下の関数も連鎖的に修正が必要となった：

```tsx
// 修正前: エラーが発生
export const changeColorAndVerify = (colorName: string) => {
    const buttons = getColorButtons(); // ← containerパラメータが不足
    // ...
};

// 修正後: 依存関係を明示
export const changeColorAndVerify = ( 
    buttons: ColorButtons, 
    colorName: string
) => {
    // パラメータとして受け取ることで依存関係を明示
};
```

**学習ポイント**:
このリファクタリング過程で、**関数間の依存関係を明示化することの重要性**を学んだ。暗黙的な依存関係は、コードの理解を困難にし、保守性を低下させる。

### 4. 型定義の設計とベストプラクティス

#### a. 明示的な型定義による保守性向上

```tsx
type ColorButtons = {
    green: HTMLButtonElement;
    red: HTMLButtonElement;
    blue: HTMLButtonElement;
    yellow: HTMLButtonElement;
};
```

**利点**:
*   **可読性**: 関数シグネチャが自己文書化される
*   **IDE支援**: オートコンプリートとエラー検出が向上
*   **保守性**: 型変更時の影響範囲が明確

#### b. `ReturnType<typeof T>`パターンの代替案

```tsx
// 案1: ReturnType使用（柔軟だが複雑）
export const changeColorAndVerify = (
    buttons: ReturnType<typeof getColorButtons>,
    colorName: string
) => { /* ... */ };

// 案2: 明示的型定義（推奨）
export const changeColorAndVerify = (
    buttons: ColorButtons,
    colorName: string
) => { /* ... */ };
```

明示的な型定義は、コードの意図をより明確に表現し、長期的なメンテナンスを容易にする。

### 5. テストユーティリティの実用的な価値

実装完了したユーティリティ関数群により、テストコードの品質が大幅に向上した：

#### a. 使用例: 簡潔で読みやすいテストコード

```tsx
test('複合操作テスト', () => {
    const { container } = render(<InteractiveCube />);
    
    // 基本要素の存在確認
    verifyBasicElements(container);
    
    // スライダー操作
    const sliders = getSlidersWithValidation(container);
    const buttons = getColorButtons(container);
    
    // 操作と検証
    changeSliderValue(sliders.size, '2.0');
    verifySliderValue(sliders.size, '2.0');
    
    changeColorAndVerify(buttons, 'red');
    
    // 複合的な状態確認
    changeSliderAndVerifyDisplay(sliders.size, '2.5', 'サイズ: 2.5');
});
```

#### b. 保守性の向上事例

スライダーの属性仕様が変更された場合、修正箇所は`getSliders`関数のみとなり、全てのテストが自動的に更新される：

```tsx
// 変更前
const sizeSlider = container.querySelector('input[min="0.5"]');

// 変更後
const sizeSlider = container.querySelector('input[data-testid="size-slider"]');
```

### 6. 学習成果と今後の展望

#### a. 設計パターンの習得

*   **ファサードパターン**: 複雑なテスト操作を簡単なインターフェースで隠蔽
*   **コンポジションパターン**: 小さな関数を組み合わせた大きな機能の構築
*   **型安全設計**: TypeScriptの型システムを活用したバグの事前防止

#### b. テスト品質の多層化

```
レベル1: 基本的な操作 (changeSliderValue)
    ↓
レベル2: 操作 + 検証 (changeSliderAndVerifyDisplay)
    ↓  
レベル3: 複合的な操作 (changeColorAndVerify)
    ↓
レベル4: 包括的な検証 (verifyBasicElements)
```

#### c. スケーラビリティの確保

今回構築したユーティリティ群は、将来的な機能拡張（新しいスライダー、ボタン、3D操作など）にも対応可能な拡張性を持つ設計となっている。

### まとめ

Issue #47のテストユーティリティ実装を通じて、単なる「テストコードの共通化」を超えて、**ソフトウェア設計の基本原則**（DRY、責務分離、型安全性、依存関係の明示）をテスト領域でも適用することの重要性を深く理解した。特に、TypeScriptの型システムを活用した**コンパイル時エラー検出**は、テストコード自体の品質向上に大きく貢献することを実感した。

これらの学習成果は、Step 2以降のより高度なテスト実装（Three.jsオブジェクト状態の検証、パフォーマンステスト、E2Eテストなど）の基盤となる重要な知識とスキルである。
