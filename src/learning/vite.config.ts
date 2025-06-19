import { defineConfig } from 'vite';
import path from 'path';
// import typescript from '@rollup/plugin-typescript'; // ライブラリビルド用（学習期間中はコメントアウト）

export default defineConfig({
  // 🆕 開発サーバー設定（学習用）
  server: {
    port: 3000,
    open: true,
  },
  root: '.',

  

  // 📦 ライブラリビルド設定（学習期間中はコメントアウト）
  /*
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'Web3DExplorer',
      fileName: (format) => `web3d-explorer.${format}.js`,
      formats: ['es', 'umd', 'cjs'], // CommonJSフォーマットも追加
    },
    rollupOptions: {
      external: ['three', 'react', 'react-dom', '@react-three/fiber'],
      output: {
        globals: {
          three: 'THREE',
          react: 'React',
          'react-dom': 'ReactDOM',
          '@react-three/fiber': 'ReactThreeFiber',
        },
        // ESモジュールで 'exports: "named"' を指定すると警告を回避できる場合がある
        exports: 'named',
      },
      plugins: [
        typescript({ // tsconfig.json を使用してトランスパイル
          tsconfig: './tsconfig.json',
          declaration: true, // 型定義ファイルを生成 (tsc側でも生成しているが念のため)
          declarationDir: 'dist/types', // 型定義ファイルの出力先 (tscのoutDirと合わせるか検討)
          rootDir: 'src', // ソースのルートディレクトリ
        }),
      ],
    },
    sourcemap: true,
    // emptyOutDir: false, // tsc が dist を使うので、Vite がクリアしないようにする (必要に応じて)
  },
  */
});
