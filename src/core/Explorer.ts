import * as THREE from 'three';
import { EventEmitter } from '../utils/EventEmitter';
import {
  Web3DExplorer as IWeb3DExplorer, // Aliased import
  Web3DExplorerConfig,
  Object3DConfig,
  PerformanceMetrics,
  EventHandler
} from '../types';

/**
 * Web3DExplorer のメインクラス
 * Three.js をベースとした 3D 可視化ライブラリのコアエンジン
 */
export class Explorer extends EventEmitter implements IWeb3DExplorer { // Use aliased interface
  public scene!: THREE.Scene; // Definite assignment assertion
  public camera!: THREE.PerspectiveCamera; // Definite assignment assertion
  public renderer!: THREE.WebGLRenderer; // Definite assignment assertion
  public config: Web3DExplorerConfig;
  
  private animationId: number | null = null;
  private stats: PerformanceMetrics;
  private clock: THREE.Clock;
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private isDisposed = false;

  constructor(config: Web3DExplorerConfig, container?: HTMLElement) {
    super();
    this.config = config;
    this.clock = new THREE.Clock();
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    
    this.initializeScene();
    this.initializeCamera();
    this.initializeRenderer(container);
    this.initializeLights();
    this.setupEventListeners();
    
    this.stats = this.createInitialStats();
    
    if (this.config.debug) {
      console.log('Web3DExplorer initialized', this.config);
    }
  }

  private initializeScene(): void {
    this.scene = new THREE.Scene();
    
    const sceneConfig = this.config.scene;
    if (sceneConfig?.background) { // Optional chaining
      this.scene.background = new THREE.Color(sceneConfig.background); // Ensure THREE.Color instance
    }
    
    if (sceneConfig?.fog) { // Optional chaining
      const { type, color, near, far, density } = sceneConfig.fog;
      if (type === 'linear' && near !== undefined && far !== undefined) {
        this.scene.fog = new THREE.Fog(new THREE.Color(color), near, far);
      } else if (type === 'exponential' && density !== undefined) {
        this.scene.fog = new THREE.FogExp2(new THREE.Color(color), density);
      }
    }
  }

  private initializeCamera(): void {
    const camConfig = this.config.camera; // Store in a variable for safer access
    if (!camConfig) {
        // Handle missing camera config, e.g., by creating a default camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 5, 10);
        return;
    }
    const { fov = 75, aspect = window.innerWidth / window.innerHeight, near = 0.1, far = 1000, position, target } = camConfig;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    
    if (position) {
      this.camera.position.set(position.x, position.y, position.z);
    }
    
    if (target) {
      this.camera.lookAt(target.x, target.y, target.z);
    }
  }

  private initializeRenderer(container?: HTMLElement): void {
    const rendererConfig = this.config.renderer;
    this.renderer = new THREE.WebGLRenderer({
      canvas: rendererConfig?.canvas, // Optional chaining
      antialias: rendererConfig?.antialias ?? true,
      alpha: rendererConfig?.alpha ?? false,
      preserveDrawingBuffer: rendererConfig?.preserveDrawingBuffer ?? false,
      powerPreference: rendererConfig?.powerPreference ?? 'default',
      stencil: rendererConfig?.stencil ?? true,
      depth: rendererConfig?.depth ?? true,
      logarithmicDepthBuffer: rendererConfig?.logarithmicDepthBuffer ?? false
    });
    
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    if (container) {
      container.appendChild(this.renderer.domElement);
    } else if (document.body) {
      document.body.appendChild(this.renderer.domElement);
    }
  }

  private initializeLights(): void {
    this.config.lights?.forEach((lightConfig: any) => { // Added optional chaining and type annotation
      const light = this.createLight(lightConfig);
      if (light) {
        this.scene.add(light);
      }
    });
    
    // アンビエントライトの追加
    if (this.config.scene?.ambientLight) { // Optional chaining
      const { color, intensity } = this.config.scene.ambientLight;
      const ambientLight = new THREE.AmbientLight(new THREE.Color(color), intensity);
      this.scene.add(ambientLight);
    }
  }

  private createLight(config: any): THREE.Light | null {
    const { type, color, intensity, position, castShadow } = config;
    let light: THREE.Light;
    
    switch (type) {
      case 'directional':
        light = new THREE.DirectionalLight(color, intensity);
        if (castShadow) {
          light.castShadow = true;
          const shadowCam = (light as THREE.DirectionalLight).shadow.camera as THREE.OrthographicCamera;
          shadowCam.left = -50;
          shadowCam.right = 50;
          shadowCam.top = 50;
          shadowCam.bottom = -50;
          shadowCam.near = 0.1;
          shadowCam.far = 100;
        }
        break;
        
      case 'point':
        light = new THREE.PointLight(color, intensity);
        if (castShadow) {
          light.castShadow = true;
        }
        break;
        
      case 'spot':
        light = new THREE.SpotLight(color, intensity);
        if (castShadow) {
          light.castShadow = true;
        }
        break;
        
      case 'hemisphere':
        light = new THREE.HemisphereLight(color, color, intensity);
        break;
        
      default:
        console.warn(`Unsupported light type: ${type}`);
        return null;
    }
    
    if (position) {
      light.position.set(position.x, position.y, position.z);
    }
    
    return light;
  }

  private setupEventListeners(): void {
    window.addEventListener('resize', this.handleResize.bind(this));
    this.renderer.domElement.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.renderer.domElement.addEventListener('click', this.handleClick.bind(this));
  }

  private handleResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.resize(width, height);
  }

  private handleMouseMove(event: MouseEvent): void {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  private handleClick(event: MouseEvent): void {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);
    
    if (intersects.length > 0) {
      const intersection = intersects[0];
      this.emit('object-click', {
        object: intersection.object,
        point: intersection.point,
        face: intersection.face,
        uv: intersection.uv,
        originalEvent: event
      });
    }
  }

  private createInitialStats(): PerformanceMetrics {
    return {
      fps: 0,
      frameTime: 0,
      renderTime: 0,
      triangles: 0, // Added missing 'triangles'
      triangleCount: 0,
      drawCalls: 0,
      memoryUsage: {
        geometries: 0,
        textures: 0,
        total: 0
      }
    };
  }

  private updateStats(): void {
    const info = this.renderer.info;
    
    this.stats = {
      fps: Math.round(1 / this.clock.getDelta()),
      frameTime: this.clock.getDelta() * 1000,
      renderTime: 0, // WebGLRenderer doesn't provide this directly
      triangles: info.render.triangles, // Added missing 'triangles'
      triangleCount: info.render.triangles,
      drawCalls: info.render.calls,
      memoryUsage: {
        geometries: info.memory.geometries,
        textures: info.memory.textures,
        total: info.memory.geometries + info.memory.textures
      }
    };
  }

  // Public API methods
  
  public addObject(object: THREE.Object3D, config?: Object3DConfig): void {
    if (config) {
      if (config.position) {
        object.position.set(config.position.x, config.position.y, config.position.z);
      }
      if (config.rotation) {
        object.rotation.set(config.rotation.x, config.rotation.y, config.rotation.z);
      }
      if (config.scale) {
        object.scale.set(config.scale.x, config.scale.y, config.scale.z);
      }
      if (config.visible !== undefined) {
        object.visible = config.visible;
      }
      if (config.name) {
        object.name = config.name;
      }
    }
    
    this.scene.add(object);
    this.emit('object-added', { object, config });
  }

  public removeObject(object: THREE.Object3D): void {
    this.scene.remove(object);
    this.emit('object-removed', { object });
  }

  public animate(callback?: () => void): void {
    if (this.isDisposed) return;
    
    this.animationId = requestAnimationFrame(() => this.animate(callback));
    
    this.updateStats();
    
    if (callback) {
      callback();
    }
    
    this.render();
    this.emit('frame', { stats: this.stats });
  }

  public render(): void {
    if (this.isDisposed) return;
    
    const startTime = performance.now();
    this.renderer.render(this.scene, this.camera);
    const endTime = performance.now();
    
    this.stats.renderTime = endTime - startTime;
  }

  public resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.emit('resize', { width, height });
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.stats };
  }

  public dispose(): void {
    if (this.isDisposed) return;
    
    this.isDisposed = true;
    
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    // リスナーの削除
    window.removeEventListener('resize', this.handleResize.bind(this));
    
    // Three.js オブジェクトの解放
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
    
    this.renderer.dispose();
    
    // DOM要素の削除
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
    
    this.removeAllListeners();
    this.emit('disposed');
  }

  // EventEmitter methods are inherited
  public on<T>(event: string, handler: EventHandler<T>): void {
    super.on(event, handler);
  }

  public off<T>(event: string, handler: EventHandler<T>): void {
    super.off(event, handler);
  }

  public emit<T>(event: string, data?: T): void {
    super.emit(event, data);
  }
}

export default Explorer;
