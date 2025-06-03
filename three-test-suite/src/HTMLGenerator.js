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
      threeJsVersion: 'r128',
      autoExecute: true,
      ...options
    };

    const userScriptString = userScript.toString();
    const threeJsUrl = this._getThreeJsUrl(config.threeJsVersion);

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
        
        (function() {
            var script = document.createElement('script');
            script.src = '${threeJsUrl}';
            script.onload = function() {
                console.log('Three.js loaded successfully');
                window.threeJsLoaded = true;
            };
            script.onerror = function() {
                console.error('Failed to load Three.js from:', script.src);
                window.threeJsLoadError = true;
            };
            document.head.appendChild(script);
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
    const normalizedVersion = version.toLowerCase().replace(/^r/, '');
    
    const versionMap = {
      '128': '0.128.0',
      '140': '0.140.2',
      '141': '0.141.0',
      '142': '0.142.0',
      '143': '0.143.0',
      '144': '0.144.0',
      '145': '0.145.0',
      '146': '0.146.0',
      '147': '0.147.0',
      '148': '0.148.0',
      '149': '0.149.0',
      '150': '0.150.1',
      '151': '0.151.3',
      '152': '0.152.2',
      '153': '0.153.0',
      '154': '0.154.0',
      '155': '0.155.0',
      '156': '0.156.1',
      '157': '0.157.0',
      '158': '0.158.0',
      '159': '0.159.0',
      '160': '0.160.1',
      '161': '0.161.0',
      '162': '0.162.0',
      '163': '0.163.0'
    };

    const mappedVersion = versionMap[normalizedVersion];
    
    if (mappedVersion) {
      return `https://unpkg.com/three@${mappedVersion}/build/three.min.js`;
    } else {
      console.warn(`Unknown Three.js version: ${version}, falling back to r128`);
      return `https://unpkg.com/three@0.128.0/build/three.min.js`;
    }
  }
}