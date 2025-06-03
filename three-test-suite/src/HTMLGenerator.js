/**
 * HTMLGenerator
 * テスト用のHTMLテンプレートを生成するクラス
 */
export class HTMLGenerator {
  /**
   * Three.js用のHTMLテンプレートを生成する
   * @param {Function} userScript - ページに注入するユーザースクリプト
   * @param {Object} options - テンプレート生成オプション
   * @param {string} options.title - ページタイトル (デフォルト: 'Three.js Test Environment')
   * @param {string} options.threeJsVersion - Three.jsのバージョン (デフォルト: 'r128')
   * @param {boolean} options.autoExecute - スクリプトの自動実行 (デフォルト: true)
   * @returns {string} 生成されたHTMLコンテンツ
   * @throws {Error} ユーザースクリプトが無効な場合
   */
  generateTestHTML(userScript, options = {}) {
    if (typeof userScript !== 'function') {
      throw new Error('userScript must be a function');
    }

    const config = {
      title: 'Three.js Test Environment',
      threeJsVersion: '0.173.0', // 0.xxx.xxx 形式に修正
      autoExecute: true,
      ...options
    };

    const userScriptString = userScript.toString();
    const versionToUse = options.threeJsVersion || config.threeJsVersion;
    const threeJsUrl = this._getThreeJsUrl(versionToUse);

    const scriptExecution = config.autoExecute
      ? `
        window.addEventListener('load', function() {
            try {
                if (typeof THREE === 'undefined') {
                    console.error('Three.js failed to load');
                    window.threeJsLoadError = true;
                    return;
                }
                (${userScriptString})();
            } catch (error) {
                console.error('Error executing user script:', error);
                window.userScriptError = error;
            }
        });`
      : `
        window.userScript = ${userScriptString};`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.title}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            overflow: hidden;
            background-color: #000;
            font-family: Arial, sans-serif;
        }
        #three-canvas {
            display: block;
            width: 100vw;
            height: 100vh;
        }
        .debug-info {
            position: absolute;
            top: 10px;
            left: 10px;
            color: white;
            background: rgba(0, 0, 0, 0.7);
            padding: 10px;
            border-radius: 5px;
            font-size: 12px;
            z-index: 1000;
            display: none;
        }
    </style>
</head>
<body>
    <canvas id="three-canvas"></canvas>
    <div class="debug-info" id="debug-info">
        Debug info will appear here
    </div>
    
    <script>
        window.threeJsLoadError = false;
        window.threeJsLoaded = false; // 初期状態を false に設定

        (async function() {
            try {
                const THREE_MODULE = await import('${threeJsUrl}');
                window.THREE = THREE_MODULE;
                console.log('Three.js loaded successfully');
                window.threeJsLoaded = true;
            } catch (e) {
                console.error('Failed to load Three.js from:', '${threeJsUrl}', e);
                window.threeJsLoadError = true;
            }
        })();
    </script>
    
    <script>${scriptExecution}
    </script>
</body>
</html>`;
  }

  /**
   * Three.jsのバージョンに応じた適切なCDN URLを生成する
   * @param {string} version - Three.jsのバージョン
   * @returns {string} CDN URL
   * @private
   */
  _getThreeJsUrl(version) {
    const defaultVersion = '0.173.0'; // ユーザー指示の基本バージョン
    const cdnjsBaseUrl = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/';

    let targetVersion = version || defaultVersion;
    let fileName = 'three.module.min.js'; // 常に three.module.min.js を使用

    // バージョン形式のバリデーション: '0.xxx.xxx' 形式であること
    const versionRegex = /^\d+\.\d+\.\d+$/;
    if (!versionRegex.test(targetVersion)) {
      throw new Error(`Invalid Three.js version format: "${targetVersion}". Expected format "0.xxx.xxx".`);
    }

    return `${cdnjsBaseUrl}${targetVersion}/${fileName}`;
  }
}
