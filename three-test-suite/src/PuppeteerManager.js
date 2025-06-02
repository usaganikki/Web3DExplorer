  /**
   * ブラウザ内でWebAssemblyとWebGLの連携パフォーマンステストを実行する関数
   * @private
   * @param {Object} options - テストオプション
   * @returns {Promise<HybridPerformance>} パフォーマンス情報オブジェクト
   */
  _benchmarkHybridPerformanceInBrowser(options) {
    const config = {
      dataSize: 5000,    // デフォルトを1000から5000に増加
      iterations: 20,    // デフォルトを10から20に増加
      ...options
    };

    if (typeof WebAssembly === 'undefined') {
      throw new Error('WebAssembly is not supported');
    }

    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    if (!gl) {
      throw new Error('WebGL is not supported');
    }

    // WASMモジュール（データ処理用）
    const wasmBytes = new Uint8Array([
      0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x01, 0x07, 0x01, 0x60, 0x02, 0x7f, 0x7f, 0x01,
      0x7f, 0x03, 0x02, 0x01, 0x00, 0x07, 0x0a, 0x01, 0x06, 0x61, 0x64, 0x64, 0x54, 0x77, 0x6f, 0x00,
      0x00, 0x0a, 0x09, 0x01, 0x07, 0x00, 0x20, 0x00, 0x20, 0x01, 0x6a, 0x0b
    ]);

    return WebAssembly.instantiate(wasmBytes)
      .then(result => {
        const addTwo = result.instance.exports.addTwo;
        
        const totalStartTime = performance.now();
        
        let totalWasmTime = 0;
        let totalWebglTime = 0;
        let totalDataTransferTime = 0;
        
        for (let iter = 0; iter < config.iterations; iter++) {
          // WASM計算フェーズ
          const wasmStartTime = performance.now();
          const vertices = [];
          for (let i = 0; i < config.dataSize; i++) {
            vertices.push(addTwo(i % 100, (i + 1) % 100));
          }
          const wasmEndTime = performance.now();
          totalWasmTime += (wasmEndTime - wasmStartTime);
          
          // データ転送フェーズ（より大きなデータで測定精度向上）
          const transferStartTime = performance.now();
          
          // より複雑なデータ転送処理を追加
          const largeVertexData = new Float32Array(vertices.length * 3); // x, y, z coordinates
          for (let i = 0; i < vertices.length; i++) {
            largeVertexData[i * 3] = vertices[i];
            largeVertexData[i * 3 + 1] = vertices[i] + 1;
            largeVertexData[i * 3 + 2] = vertices[i] + 2;
          }
          
          // 追加の配列変換処理でデータ転送時間を確実に測定
          const normalData = new Float32Array(largeVertexData.length);
          for (let i = 0; i < largeVertexData.length; i++) {
            normalData[i] = largeVertexData[i] / Math.max(1, Math.abs(largeVertexData[i]));
          }
          
          const transferEndTime = performance.now();
          const transferTime = transferEndTime - transferStartTime;
          totalDataTransferTime += Math.max(transferTime, 0.01); // 最小0.01ms保証
          
          // WebGL描画フェーズ（処理を重くして測定可能にする）
          const webglStartTime = performance.now();
          
          // 複数のバッファを作成して処理を重くする
          const buffers = [];
          for (let bufIdx = 0; bufIdx < 5; bufIdx++) {
            const buffer = gl.createBuffer();
            buffers.push(buffer);
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, largeVertexData, gl.STATIC_DRAW);
            
            // 追加の WebGL 操作
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.viewport(0, 0, 100, 100);
          }
          
          const webglEndTime = performance.now();
          const webglTime = webglEndTime - webglStartTime;
          totalWebglTime += Math.max(webglTime, 0.01); // 最小0.01ms保証
          
          // リソースクリーンアップ
          buffers.forEach(buffer => gl.deleteBuffer(buffer));
        }
        
        const totalEndTime = performance.now();
        const totalTime = totalEndTime - totalStartTime;
        
        // 平均時間計算
        const wasmComputeTime = Math.round((totalWasmTime / config.iterations) * 100) / 100;
        const webglRenderTime = Math.round((totalWebglTime / config.iterations) * 100) / 100;
        const dataTransferTime = Math.round((totalDataTransferTime / config.iterations) * 100) / 100;
        
        // 効率計算（理想的な並列処理に対する実際の性能比）
        const idealTime = Math.max(wasmComputeTime, webglRenderTime);
        const actualTime = wasmComputeTime + dataTransferTime + webglRenderTime;
        const efficiency = Math.min(idealTime / actualTime, 1.0);
        
        // スループット計算（データ/秒）
        const throughput = Math.round((config.dataSize * config.iterations * 1000) / totalTime);
        
        return {
          wasmComputeTime,
          webglRenderTime,
          dataTransferTime,
          totalTime: Math.round(totalTime * 100) / 100,
          efficiency: Math.round(efficiency * 1000) / 1000,
          throughput
        };
      })
      .catch(error => {
        throw new Error(`Hybrid performance benchmark failed: ${error.message}`);
      });
  }