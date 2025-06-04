/**
 * SceneInspector
 * Three.jsシーンの検査・解析機能を提供するクラス
 * Issue #18 Phase1で実装されるシーン検査機能
 */
export class SceneInspector {
  constructor(browserManager) {
    if (!browserManager) {
      throw new Error('BrowserManager instance is required');
    }
    this.browserManager = browserManager;
  }

  /**
   * シーン情報を取得
   * @returns {Promise<Object>} シーン情報オブジェクト
   */
  async getSceneInfo() {
    if (!this.browserManager.isInitialized()) {
      throw new Error('BrowserManager is not initialized');
    }

    try {
      const sceneInfo = await this.browserManager.page.evaluate(() => {
        if (typeof window.scene === 'undefined') {
          return {
            available: false,
            error: 'Scene not found in window.scene'
          };
        }

        const scene = window.scene;
        return {
          available: true,
          children: scene.children.length,
          background: scene.background ? scene.background.toString() : null,
          fog: scene.fog ? {
            type: scene.fog.isFog ? 'Fog' : scene.fog.constructor.name,
            near: scene.fog.near,
            far: scene.fog.far,
            color: scene.fog.color ? scene.fog.color.getHex() : null
          } : null,
          autoUpdate: scene.autoUpdate !== undefined ? scene.autoUpdate : true, // Default to true if undefined
          matrixAutoUpdate: scene.matrixAutoUpdate !== undefined ? scene.matrixAutoUpdate : true, // Default to true if undefined
          uuid: scene.uuid,
          type: scene.isScene ? 'Scene' : scene.constructor.name
        };
      });

      return sceneInfo;
    } catch (error) {
      throw new Error(`Failed to get scene info: ${error.message}`);
    }
  }

  /**
   * カメラ情報を取得
   * @returns {Promise<Object>} カメラ情報オブジェクト
   */
  async getCameraInfo() {
    if (!this.browserManager.isInitialized()) {
      throw new Error('BrowserManager is not initialized');
    }

    try {
      const cameraInfo = await this.browserManager.page.evaluate(() => {
        if (typeof window.camera === 'undefined') {
          return {
            available: false,
            error: 'Camera not found in window.camera'
          };
        }

        const camera = window.camera;
        let cameraType = camera.constructor.name;
        if (camera.isPerspectiveCamera) cameraType = 'PerspectiveCamera';
        else if (camera.isOrthographicCamera) cameraType = 'OrthographicCamera';
        
        return {
          available: true,
          type: cameraType,
          position: {
            x: camera.position.x,
            y: camera.position.y,
            z: camera.position.z
          },
          rotation: {
            x: camera.rotation.x,
            y: camera.rotation.y,
            z: camera.rotation.z
          },
          fov: camera.fov || null,
          aspect: camera.aspect || null,
          near: camera.near || null,
          far: camera.far || null,
          zoom: camera.zoom || null,
          uuid: camera.uuid
        };
      });

      return cameraInfo;
    } catch (error) {
      throw new Error(`Failed to get camera info: ${error.message}`);
    }
  }

  /**
   * レンダラー情報を取得
   * @returns {Promise<Object>} レンダラー情報オブジェクト
   */
  async getRendererInfo() {
    if (!this.browserManager.isInitialized()) {
      throw new Error('BrowserManager is not initialized');
    }

    try {
      const rendererInfo = await this.browserManager.page.evaluate(() => {
        if (typeof window.renderer === 'undefined') {
          return {
            available: false,
            error: 'Renderer not found in window.renderer'
          };
        }

        const renderer = window.renderer;
        const canvas = renderer.domElement;
        
        return {
          available: true,
          type: renderer.isWebGLRenderer ? 'WebGLRenderer' : renderer.constructor.name,
          size: {
            width: canvas.width,
            height: canvas.height
          },
          pixelRatio: renderer.getPixelRatio(),
          antialias: renderer.capabilities ? renderer.capabilities.antialias : null,
          powerPreference: renderer.capabilities ? renderer.capabilities.powerPreference : null,
          precision: renderer.capabilities ? renderer.capabilities.precision : null,
          maxAnisotropy: renderer.capabilities ? renderer.capabilities.getMaxAnisotropy() : null,
          shadowMap: {
            enabled: renderer.shadowMap.enabled,
            type: renderer.shadowMap.type
          },
          autoClear: renderer.autoClear,
          sortObjects: renderer.sortObjects
        };
      });

      return rendererInfo;
    } catch (error) {
      throw new Error(`Failed to get renderer info: ${error.message}`);
    }
  }

  /**
   * シーン全体の総合情報を取得
   * @returns {Promise<Object>} 総合情報オブジェクト
   */
  async getComprehensiveInfo() {
    try {
      const [sceneInfo, cameraInfo, rendererInfo] = await Promise.all([
        this.getSceneInfo(),
        this.getCameraInfo(), 
        this.getRendererInfo()
      ]);

      return {
        timestamp: new Date().toISOString(),
        scene: sceneInfo,
        camera: cameraInfo,
        renderer: rendererInfo,
        status: {
          sceneReady: sceneInfo.available,
          cameraReady: cameraInfo.available,
          rendererReady: rendererInfo.available,
          allReady: sceneInfo.available && cameraInfo.available && rendererInfo.available
        }
      };
    } catch (error) {
      throw new Error(`Failed to get comprehensive info: ${error.message}`);
    }
  }

  /**
   * シーン内のオブジェクト数を取得
   * @returns {Promise<number>} オブジェクト数
   */
  async getObjectCount() {
    try {
      const sceneInfo = await this.getSceneInfo();
      return sceneInfo.available ? sceneInfo.children : 0;
    } catch (error) {
      throw new Error(`Failed to get object count: ${error.message}`);
    }
  }

  /**
   * Three.jsのグローバル状態を確認
   * @returns {Promise<Object>} Three.jsの状態情報
   */
  async getThreeJsStatus() {
    if (!this.browserManager.isInitialized()) {
      throw new Error('BrowserManager is not initialized');
    }

    try {
      const status = await this.browserManager.page.evaluate(() => {
        return {
          threeLoaded: typeof THREE !== 'undefined',
          version: typeof THREE !== 'undefined' && THREE.REVISION ? THREE.REVISION : null,
          webglAvailable: typeof THREE !== 'undefined' && THREE.WebGL ? THREE.WebGL.isWebGLAvailable() : false,
          webgl2Available: typeof THREE !== 'undefined' && THREE.WebGL ? THREE.WebGL.isWebGL2Available() : false,
          sceneReady: window.sceneReady || false,
          sceneError: window.sceneError || null,
          threeJsLoaded: window.threeJsLoaded || false,
          threeJsLoadError: window.threeJsLoadError || null
        };
      });

      return status;
    } catch (error) {
      throw new Error(`Failed to get Three.js status: ${error.message}`);
    }
  }
}
