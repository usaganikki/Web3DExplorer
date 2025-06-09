# 学習メモ: InteractiveCube と関連技術 (InteractiveCube.tsxより)

このドキュメントは、`InteractiveCube.tsx` コンポーネントの実装を通じて得られた、ReactとThree.jsの連携、特にインタラクティブな要素の追加や状態管理、そしてアニメーションループにおける注意点など、`BasicCube.tsx` から発展した技術要素に関する学びをまとめるものである。

基本的なReactのフック (`useRef`, `useEffect` の基本)、モジュールシステム (`export`/`import`)、およびThree.jsの基本的なセットアップ（シーン、カメラ、レンダラー、ジオメトリ、マテリアル、基本的なアニメーションループ、基本的なリサイズ処理、`OrbitControls`の基本的な使い方など）については、[こちらの学習メモ (BasicCubeより)](../step1-basic/README.md) を参照すること。

## I. `InteractiveCube.tsx` の概要と目的

`InteractiveCube.tsx` は、`BasicCube.tsx` を基盤としつつ、ユーザーによるインタラクション（色の変更、サイズの変更、位置の変更、回転速度の変更など）を可能にすることで、より動的な3D体験を提供するReactコンポーネントである。
このコンポーネントの主な目的は、Issue #41「Step 1.2: 基本テストの必要性体感」で定義されているように、これらのインタラクティブな機能を手動でテストする過程を通じて、テスト自動化の重要性を体感することにある。

## II. Three.js と React の連携における高度なトピック

### 1. Canvasのサイジング戦略: 親要素基準への変更

`BasicCube.tsx` では `window.innerWidth/Height` を基準にしていたが、`InteractiveCube.tsx` ではコンポーネントの再利用性とレイアウトの柔軟性を高めるため、Canvasのサイズを**親要素のコンテンツ領域** (`canvasRef.current.parentElement.clientWidth/Height`) を基準に設定するよう変更した。

*   **変更点と利点:**
    *   `InteractiveCube.tsx` では、`useEffect` 内で `canvasRef.current.parentElement` の `clientWidth` と `clientHeight` を取得し、これをレンダラーのサイズとカメラのアスペクト比に設定しています。
        ```typescript
        // InteractiveCube.tsx useEffect内の関連部分
        const renderer = new THREE.WebGLRenderer({
            canvas: canvasRef.current
        });
        // 親要素のサイズを取得
        const parentElement = canvasRef.current.parentElement!;
        renderer.setSize(parentElement.clientWidth, parentElement.clientHeight);

        const camera = new THREE.PerspectiveCamera(
            75,
            parentElement.clientWidth / parentElement.clientHeight, // アスペクト比も親要素基準
            0.1,
            1000
        );
        // リサイズ時も同様に親要素基準で更新
        const handleResize = () => {
            if(!canvasRef.current || !canvasRef.current.parentElement) return;
            const currentParentElement = canvasRef.current.parentElement;
            camera.aspect = currentParentElement.clientWidth / currentParentElement.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(currentParentElement.clientWidth, currentParentElement.clientHeight);
        }
        window.addEventListener('resize', handleResize);
        ```
    *   これにより、親要素のパディングやボーダーを考慮した正確なサイジングが実現され、Canvasが意図しない領域にはみ出すことを防ぎます。
    *   コンポーネントが配置されるコンテナのサイズに追従するため、ウィンドウ全体を占める場合だけでなく、ページ内の一部として配置される場合でも適切に表示され、コンポーネントの独立性と再利用性が向上します。
*   **関連知識:**
    *   `clientWidth` および `clientHeight` は、要素の内側の幅と高さ（パディングを含むが、ボーダー、マージン、スクロールバーは含まない）をピクセル単位で返します。
    *   多くのブラウザでは `<body>` 要素にデフォルトのマージンが設定されているため、Canvasを画面いっぱいに表示したい場合は、CSSで `body { margin: 0; }` のようにリセットする必要があります。

### 2. インタラクティブな機能のための状態管理と副作用

ユーザー操作に応じてキューブの見た目や振る舞いを変更するため、Reactの `useState` と `useEffect` を活用して、Three.jsオブジェクトのプロパティを動的に更新する。

#### 2.1. `useState` によるインタラクティブなパラメータの保持

キューブの色 (`cubeColor`)、サイズ (`cubeSize`)、X軸位置 (`cubePositionX`)、回転速度 (`rotationSpeed`) をReactのstateとして管理する。今後、Y軸、Z軸位置も同様に管理する予定である。

*   **各stateの役割と初期値:**
    ```typescript
    // InteractiveCube.tsx
    const [cubeColor, setCubeColor] = useState<string>('green');
    const [cubeSize, setCubeSize] = useState<number>(1.0);
    const [cubePositionX, setCubePositionX] = useState<number>(0);
    const [rotationSpeed, setRotationSpeed] = useState<number>(0.01);
    ```
    *   `cubeColor`: キューブのマテリアルの色を文字列で保持（例: 'green', 'red'）。初期値は 'green'。
    *   `cubeSize`: キューブのスケール値を数値で保持。初期値は 1.0。
    *   `cubePositionX`: キューブのX軸方向の位置を数値で保持。初期値は 0。
    *   `rotationSpeed`: キューブの回転速度を数値で保持。初期値は 0.01。
*   **型定義のポイント:**
    *   `useState<string>` や `useState<number>` のように型引数を指定することで、stateとその更新関数の型を明確にしています。

#### 2.2. `useEffect` によるThree.jsオブジェクトへのstate変更の反映

各state（`cubeColor`, `cubeSize`, `cubePositionX` など）が変更された際に、対応するThree.jsの `Mesh` オブジェクトのプロパティを更新するために、それぞれ独立した `useEffect` フックを使用する。

*   **色変更のロジック:**
    ```typescript
    // InteractiveCube.tsx
    useEffect(() => {
        if(!cubeRef.current) return;
        const colorMap: {[Key: string]: number} = {
            'green': 0x00ff00, 'red': 0xff0000,
            'blue': 0x0000ff, 'yellow': 0xffff00
        };
        const material = cubeRef.current.material as THREE.MeshBasicMaterial;
        material.color.setHex(colorMap[cubeColor]);
    }, [cubeColor]); // cubeColor state が変更された時のみ実行
    ```
    *   `colorMap` オブジェクトを使用して、stateとして保持している色の名前（文字列）をThree.jsが要求する16進数のカラーコード（数値）に変換します。
    *   `cubeRef.current.material` を `THREE.MeshBasicMaterial` 型にアサーションし、その `color.setHex()` メソッドを呼び出してマテリアルの色を更新します。
*   **サイズ変更のロジック:**
    ```typescript
    // InteractiveCube.tsx
    useEffect(() => {
        if(!cubeRef.current) return;
        cubeRef.current.scale.setScalar(cubeSize);
    }, [cubeSize]); // cubeSize state が変更された時のみ実行
    ```
    *   `cubeRef.current.scale.setScalar()` メソッドを使用して、キューブのX, Y, Z軸のスケールを一律に `cubeSize` stateの値に設定します。
*   **位置変更のロジック (X軸の例):**
    ```typescript
    // InteractiveCube.tsx
    useEffect(() => {
        if(!cubeRef.current) return;
        cubeRef.current.position.x = cubePositionX;
    }, [cubePositionX]); // cubePositionX state が変更された時のみ実行
    ```
    *   `cubeRef.current.position.x` プロパティに `cubePositionX` stateの値を直接代入することで、キューブのX軸方向の位置を更新します。（Y軸、Z軸も同様に実装可能）
*   **`useRef` (`cubeRef`) による `Mesh` オブジェクトへのアクセス:**
    *   `const cubeRef = useRef<THREE.Mesh>();` のように宣言し、Three.jsの `Mesh` オブジェクト (`cube`) が作成された後に `cubeRef.current = cube;` とすることで、Reactコンポーネントのライフサイクルを通じてこの `Mesh` オブジェクトへの参照を保持します。
    *   これにより、複数の `useEffect` フックから同じ `Mesh` オブジェクトにアクセスし、それぞれのstate変更に応じて異なるプロパティを動的に更新できます。
    *   `useRef<THREE.Mesh>()` と型引数を指定し初期値を省略した場合、`.current` プロパティの初期値は `undefined` となります。

### 3. アニメーションループにおけるState値の同期問題と`useRef`による解決

`InteractiveCube.tsx` で回転速度 (`rotationSpeed`) を動的に変更する際に発生した、Reactのstateと `requestAnimationFrame` によるアニメーションループ間での値の非同期問題と、その解決策について詳述する。

#### 3.1. 問題の現象と原因

*   **現象:** UIで `rotationSpeed` stateを変更しても、アニメーションループ内の `animate` 関数が古い値を参照し続け、実際の回転速度に反映されない。
*   **原因:** `useEffect(..., [])` のコールバック関数（この中で `animate` 関数が定義される）は、コンポーネントのマウント時に一度だけ実行される。その際、`animate` 関数はマウント時の `rotationSpeed` stateの値を**クロージャとしてキャプチャ**する。`useEffect` の依存配列が空であるため、`rotationSpeed` stateが変更されても `useEffect` のコールバックは再実行されず、`animate` 関数も再定義されない。結果として、`animate` 関数は常に最初にキャプチャした古い `rotationSpeed` の値を参照し続ける。
    ```typescript
    // 問題があったコードの概念 (useEffect内)
    useEffect(() => {
      const initialRotationSpeed = rotationSpeed; // マウント時のrotationSpeedをキャプチャ
      const animate = () => {
        cube.rotation.x += initialRotationSpeed; // 常に初期値を参照
        cube.rotation.y += initialRotationSpeed; // 常に初期値を参照
        requestAnimationFrame(animate);
      };
      animate();
    }, []); // 依存配列が空
    ```

#### 3.2. `useRef` を用いた解決策

この問題を解決するために、`useRef` フックを利用して `rotationSpeed` stateの最新値を保持し、アニメーションループ内ではそのrefの `.current` プロパティを参照する方法を採用した。

*   **`rotationSpeedRef` の導入:**
    ```typescript
    // InteractiveCube.tsx
    const rotationSpeedRef = useRef(rotationSpeed);
    ```
    `rotationSpeedRef` は、コンポーネントのライフサイクルを通じて同一のオブジェクト参照を保持する。その `.current` プロパティは可変であり、最新の値を格納できる。

*   **state変更時にrefの値を更新する `useEffect` を追加:**
    ```typescript
    // InteractiveCube.tsx
    useEffect(() => {
      rotationSpeedRef.current = rotationSpeed;
    }, [rotationSpeed]); // rotationSpeed state が変更されるたびに実行
    ```
    これにより、`rotationSpeedRef.current` は常に最新の `rotationSpeed` stateの値を指すようになる。

*   **アニメーションループ内でrefの値を参照:**
    ```typescript
    // メインのuseEffect(..., []) 内の animate 関数
    const animate = () => {
      cube.rotation.x += rotationSpeedRef.current; // 最新の値を参照
      cube.rotation.y += rotationSpeedRef.current; // 最新の値を参照
      requestAnimationFrame(animate);
    };
    ```
    `animate` 関数は `rotationSpeedRef` オブジェクト自体をキャプチャする。このオブジェクトは不変だが、その `.current` プロパティは外部から変更可能なため、常に最新の回転速度を参照できる。

#### 3.3. このアプローチから得られる知見

*   **Reactのレンダリングサイクル外でのstateアクセス:** `requestAnimationFrame` や `setInterval`、イベントリスナーのコールバックなど、Reactの通常のレンダリングサイクルの外で実行される関数から最新のstate値にアクセスする際には、クロージャによる値のキャプチャに注意が必要である。
*   **`useRef` の柔軟な活用:** `useRef` はDOM要素への参照だけでなく、このように可変な値をコンポーネントのライフサイクルを通じて保持し、Reactのレンダリングに影響されずに読み書きするための汎用的なコンテナとしても非常に有用である。
*   **デバッグとテストの重要性への示唆:** 今回の問題は、UI操作に対する視覚的なフィードバック（キューブの回転速度が変わらない）から発見された。このようなインタラクション起因の挙動の変化は、手動テストでは見落とされる可能性もある。将来的に、特定のstate変更が期待通りに描画やアニメーションに反映されることを検証する自動テストを導入することで、より堅牢なコンポーネント開発が可能になるだろう（これはIssue #41の「テストの必要性体感」というテーマにも繋がる）。
    この修正は、`2025/06/09` に実施した。

## III. React/JSX と CSS によるUI構築

Three.jsのCanvas上に、インタラクティブな操作を行うためのUIコントロールをReact/JSXとインラインCSSで実装する際のポイント。

### 1. JSXによるUIコントロールの構造

キューブの各パラメータ（色、サイズ、位置、回転速度）を変更するためのUI要素（ボタン、スライダーなど）のJSX構造。

*   **UI全体のコンテナ (`div`):**
    ```tsx
    // InteractiveCube.tsx の return 文 (一部抜粋)
    <div style={{position: 'absolute', top: '10px', left: '10px', zIndex: 1000}}>
        {/* 各コントロール群がここに入る */}
    </div>
    ```
    *   `position: 'absolute'` と `top`, `left` でCanvasに対する相対位置を指定。
    *   `zIndex: 1000` で他の要素より手前に表示。
*   **各コントロールのグループ化とイベントハンドラ:**
    *   **色変更ボタン:**
        ```tsx
        <div>
            <button onClick={() => setCubeColor('green')}>緑</button>
            {/* 他の色ボタンも同様 */}
        </div>
        ```
    *   **サイズ変更スライダー:**
        ```tsx
        <div style={{marginTop:'10px'}}>
            <span style={{color:'white'}}>サイズ: {cubeSize.toFixed(1)}</span>
            <input type="range" min="0.5" max="3.0" step="0.1"
                   value={cubeSize}
                   onChange={(e) => setCubeSize(parseFloat(e.target.value))} />
        </div>
        ```
    *   `onClick` や `onChange` イベントで対応するstate更新関数を呼び出す。
    *   スライダーの `onChange` から得られる値は文字列型なので `parseFloat()` で数値に変換する。
    *   `toFixed(1)` を用いて表示する数値を小数点以下1桁にフォーマットする。

### 2. CSSによるレイアウトとスタイリング

インラインスタイル (`style`属性) を用いたUI要素の配置と見た目の調整。

*   **要素の重ね合わせと配置:** 上述の通り `position: 'absolute'` と `zIndex` を使用。
*   **コンテナ内要素のレイアウト:** 各コントロールグループ (`div`) に `style={{marginTop:'10px'}}` を指定することで、要素間に縦方向のマージンを設けている。
*   **テキストのスタイリング:** ラベル部分の `<span>` に `style={{color:'white'}}` を指定して文字色を白にしている。
*   **Canvasとコンテナ要素のサイズ調整:**
    *   `InteractiveCube` コンポーネントが返すルートの `div` と、その中の `<canvas>` 要素の両方に `style={{ width: '100%', height: '100%' }}` を指定。
    *   これにより、`InteractiveCube` コンポーネントが配置された親要素のサイズを継承し、結果としてCanvasがその親要素いっぱいに表示される。`App.tsx` で `InteractiveCube` を `height: '100vh'` の `div` 内に配置すれば、実質的にフルスクリーン表示となる。

## IV. 今後の学習とテストについて (Issue #41 の目的に向けて)

この `InteractiveCube.tsx` は、手動テストを通じてテストの必要性を体感するための準備段階である。
今後、このコンポーネントに対して実際に手動テストを行い、その経験から得られるであろう「テスト自動化へのモチベーション」や「テスト観点」について、別途記録・考察していく予定である。

（ここに手動テスト体験後の学びや、自動テストに関する考察を追記していく）

---
