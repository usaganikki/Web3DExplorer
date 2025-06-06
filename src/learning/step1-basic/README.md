# 学習メモ: React と Three.js の基礎 (BasicCubeより)

このドキュメントは、`BasicCube.tsx` コンポーネントを通じて学んだReactの主要な概念と、今後学習するThree.jsに関するメモをまとめるためのものです。

## I. React の基礎

このセクションでは、Reactのフック (`useState`, `useRef`, `useEffect`)、`export` の概念、およびコンポーネントのライフサイクルについてまとめます。

### 1. `useState`

`useState` フックは、関数コンポーネント内で「状態 (state)」を管理するために使用されます。状態とは、コンポーネントが保持し、時間とともに変化する可能性のあるデータのことです。状態が更新されると、Reactはコンポーネントを再レンダリングしてUIに変更を反映します。

*   **基本的な構文**:
    ```javascript
    import React, { useState } from 'react';

    function MyComponent() {
      const [stateVariable, setStateFunction] = useState(initialState);
      // stateVariable: 現在の状態の値
      // setStateFunction: 状態を更新するための関数
      // initialState: 状態の初期値
    }
    ```

*   **使用例**:
    ```javascript
    const [count, setCount] = useState(0); // countという状態変数、初期値0
    // count を表示: <p>{count}</p>
    // count を更新: <button onClick={() => setCount(count + 1)}>Increment</button>
    ```

*   **特徴**:
    *   状態が `setStateFunction` によって更新されると、Reactはそのコンポーネントと、その状態に依存する子コンポーネントを再レンダリングします。
    *   複数の状態変数を持ちたい場合は、`useState` を複数回呼び出すことができます。

### 2. `useRef`

`useRef` フックは、主に以下の2つの目的で使用されます。

*   **DOM要素への直接的な参照の保持**:
    *   Reactコンポーネント内で特定のDOM要素（例: `<canvas>` や `<input>`）にアクセスしたい場合に使用します。
    *   `const myRef = useRef(null);` のように宣言し、JSX要素の `ref` 属性に `<div ref={myRef}>` のように指定します。
    *   `myRef.current` を通じて実際のDOM要素にアクセスできます。
    *   `BasicCube.tsx` では、`<canvas>` 要素への参照を保持するために `canvasRef` が使用されています。

*   **再レンダリングを引き起こさない値を保持**:
    *   コンポーネントのライフサイクルを通じて値を保持したいが、その値の変更がUIの再レンダリングを引き起こすべきではない場合（例: タイマーID、内部的なカウンターなど）に使用します。

### 3. `useEffect`

`useEffect` フックは、コンポーネントのレンダリング後に副作用（データの取得、DOMの操作、イベントリスナーの登録、タイマーの設定など）を実行するために使用されます。

*   **基本的な構文**:
    ```javascript
    useEffect(() => {
      // 副作用を実行するコード (エフェクト関数)

      return () => {
        // クリーンアップ処理 (オプション)
      };
    }, [dependency1, dependency2]); // 依存配列
    ```

*   **実行タイミング**:
    *   **マウント時**: コンポーネントが初めてDOMにレンダリングされた直後にエフェクト関数が実行されます。依存配列が空 `[]` の場合、マウント時に一度だけ実行されます。
    *   **依存関係の変更時**: 依存配列に指定された値が変更された場合、前回のクリーンアップ関数が実行された後、新しい値でエフェクト関数が再度実行されます。
    *   **アンマウント時**: コンポーネントがDOMから削除される直前にクリーンアップ関数が実行されます。依存配列が空 `[]` の場合、アンマウント時に一度だけ実行されます。

*   **クリーンアップ関数**:
    *   エフェクト関数から返される関数です。
    *   イベントリスナーの削除、タイマーのクリア、API購読の解除など、エフェクトが設定したリソースを解放する役割を持ちます。メモリリークを防ぐために重要です。

*   **`BasicCube.tsx` での `useEffect`**:
    *   依存配列が空 `[]` であるため、エフェクト関数は `BasicCube` コンポーネントがマウントされた後に一度だけ実行されます。
    *   同様に、クリーンアップ関数は `BasicCube` コンポーネントがアンマウントされる時に一度だけ実行されます。
    *   （現状のコードではエフェクト関数とクリーンアップ関数の中身は空ですが、ここにThree.jsの初期化処理やリソース解放処理が記述されることになります。）

### 4. 関数の定義方法とアロー関数式

JavaScriptでは関数を定義する方法がいくつかありますが、Reactコンポーネントの定義では特に**アロー関数式**がよく用いられます。

*   **関数宣言 (Function Declaration)**:
    ```javascript
    function myFunction(param) { /* ... */ }
    ```
*   **関数式 (Function Expression)**:
    ```javascript
    const myFunction = function(param) { /* ... */ };
    ```
*   **アロー関数式 (Arrow Function Expression)**:
    ```javascript
    const myFunction = (param) => { /* ... */ };
    // BasicCube.tsx のコンポーネント定義もこの形式です。
    // export const BasicCube: React.FC = () => { /* ... */ };
    ```

#### アロー関数式の主な特徴

アロー関数式は、従来の関数式と比較して以下の特徴があります。

1.  **構文の簡潔さ**:
    *   `function` キーワードが不要です。
    *   引数が1つの場合は `()` を省略できます (例: `x => x * 2`)。
    *   関数本体が単一の式で、その結果を返す場合は `{}` と `return` を省略できます (例: `(a, b) => a + b`)。

2.  **`this` の束縛**:
    *   アロー関数は自身の `this` を持ちません。アロー関数内の `this` は、それが定義されたときの外側のスコープ（レキシカルスコープ）の `this` を参照します。これは、コールバック関数などで `this` の値を意図通りに扱いたい場合に便利です。
    *   従来の関数式では、`this` の値は関数がどのように呼び出されたかによって動的に決まります。

3.  **`arguments` オブジェクトを持たない**:
    *   アロー関数内では `arguments` オブジェクトは利用できません。可変長引数が必要な場合は、残余引数 (`...args`) を使用します。

4.  **コンストラクタとして使用できない**:
    *   アロー関数は `new` キーワードと一緒に使ってオブジェクトのインスタンスを生成することはできません。コンストラクタ関数を定義する場合は、従来の `function` キーワードや `class` 構文を使用します。

5.  **`prototype` プロパティを持たない**:
    *   アロー関数は `prototype` プロパティを持たないため、`prototype` を利用した継承の仕組みには使えません。

#### 関数の「作成」と「呼び出し」

*   **作成 (定義)**: アロー関数（や関数式）は、その定義がJavaScriptエンジンによって実行された時点で**関数オブジェクトとしてメモリ上に作成**されます。例えば `const myFunction = () => { ... };` の行が実行されると、`myFunction` という定数に関数オブジェクトが割り当てられます。この時点では関数の中のコードは実行されていません。
*   **呼び出し (実行)**: 作成された関数に対して `myFunction()` のように `()` をつけて実行を指示すると、初めて関数の中のコードが実行されます。
*   Reactの関数コンポーネント（例: `BasicCube`）は、JSX (`<BasicCube />`) で記述されると、Reactのレンダリングシステムによって適切なタイミングで**呼び出され**、その結果（JSX要素）がUIに反映されます。開発者が直接 `new BasicCube()` のようにインスタンスを生成するわけではありません。

### 5. `export`

`export` キーワードは、JavaScriptモジュール内で定義された関数、オブジェクト、クラス、変数などを他のモジュールから利用できるようにするために使用します。

*   **名前付きエクスポート (Named Exports)**:
    *   `export const myVariable = ...;` や `export function myFunction() {...}` のように、複数の値を名前を付けてエクスポートできます。
    *   インポート側: `import { myVariable, myFunction } from './myModule';`
    *   `BasicCube.tsx` の `export const BasicCube ...` はこれに該当します。

*   **デフォルトエクスポート (Default Export)**:
    *   `export default myFunction;` や `export default class MyClass {...}` のように、モジュールごとに1つだけデフォルトの値をエクスポートできます。
    *   インポート側: `import anyName from './myModule';` (任意の名前でインポート可能)

### 6. `BasicCube.tsx` における `canvasRef` と `useEffect` の連携

1.  `const canvasRef = useRef<HTMLCanvasElement>(null);`
    *   `<canvas>` 要素への参照を保持するための `ref` オブジェクトを作成します。

2.  `return <canvas ref={canvasRef} />;`
    *   コンポーネントがレンダリングする `<canvas>` 要素を定義し、その `ref` 属性に `canvasRef` を指定します。
    *   これにより、ReactがDOMを構築した後、`canvasRef.current` はこの `<canvas>` DOM要素を指すようになります。

3.  `useEffect(() => { ... }, []);`
    *   コンポーネントがマウントされた後（つまり、`canvasRef.current` が実際の `<canvas>` 要素を指している状態になった後）に、エフェクト関数が実行されます。
    *   このタイミングで `canvasRef.current` を使ってThree.jsのレンダラーを初期化したり、シーンを描画したりする処理を記述できます。
    *   コンポーネントがアンマウントされる際には、クリーンアップ関数内でThree.jsのリソースを解放する処理を記述します。

## II. Three.js の基礎

このセクションでは、Three.jsに関する学習メモをまとめていきます。

（ここに今後Three.jsについて学んだことを記述していきます。）
