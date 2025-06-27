import { createMockRenderer, createMockScene, createMockCamera } from '../__mocks__/three.js';

describe('Renderer Logic Tests', () => {
  test('renderer initialization with default settings', () => {
    const renderer = createMockRenderer();
    
    // Check that renderer has required properties
    expect(renderer).toBeDefined();
    expect(renderer.domElement).toBeDefined();
    expect(renderer.setSize).toBeDefined();
    expect(renderer.render).toBeDefined();
    expect(renderer.dispose).toBeDefined();
  });

  test('renderer size configuration', () => {
    const renderer = createMockRenderer();
    const width = 1920;
    const height = 1080;
    
    renderer.setSize(width, height);
    
    // Verify setSize was called with correct parameters
    expect(renderer.setSize).toHaveBeenCalledWith(width, height);
    expect(renderer.setSize).toHaveBeenCalledTimes(1);
  });

  test('renderer pixel ratio configuration', () => {
    const renderer = createMockRenderer();
    const pixelRatio = 2.0;
    
    renderer.setPixelRatio(pixelRatio);
    
    // Verify pixel ratio setting
    expect(renderer.setPixelRatio).toHaveBeenCalledWith(pixelRatio);
    expect(renderer.setPixelRatio).toHaveBeenCalledTimes(1);
  });

  test('renderer clear color configuration', () => {
    const renderer = createMockRenderer();
    const clearColor = 0x000000;
    
    renderer.setClearColor(clearColor);
    
    // Verify clear color setting
    expect(renderer.setClearColor).toHaveBeenCalledWith(clearColor);
    expect(renderer.setClearColor).toHaveBeenCalledTimes(1);
  });

  test('renderer render method execution', () => {
    const renderer = createMockRenderer();
    const scene = createMockScene();
    const camera = createMockCamera();
    
    renderer.render(scene, camera);
    
    // Verify render was called with scene and camera
    expect(renderer.render).toHaveBeenCalledWith(scene, camera);
    expect(renderer.render).toHaveBeenCalledTimes(1);
  });

  test('renderer disposal', () => {
    const renderer = createMockRenderer();
    
    renderer.dispose();
    
    // Verify dispose was called
    expect(renderer.dispose).toHaveBeenCalledTimes(1);
  });

  test('renderer context access', () => {
    const renderer = createMockRenderer();
    
    const context = renderer.getContext();
    
    // Verify getContext returns something
    expect(context).toBeDefined();
    expect(renderer.getContext).toHaveBeenCalledTimes(1);
  });

  test('renderer size retrieval', () => {
    const renderer = createMockRenderer();
    
    const size = renderer.getSize();
    
    // Verify getSize returns expected structure
    expect(size).toBeDefined();
    expect(size).toHaveProperty('width');
    expect(size).toHaveProperty('height');
    expect(size.width).toBe(800);
    expect(size.height).toBe(600);
  });

  test('renderer viewport configuration', () => {
    const renderer = createMockRenderer();
    const viewport = { x: 0, y: 0, width: 1024, height: 768 };
    
    renderer.setViewport(viewport.x, viewport.y, viewport.width, viewport.height);
    
    // Verify viewport setting
    expect(renderer.setViewport).toHaveBeenCalledWith(
      viewport.x, 
      viewport.y, 
      viewport.width, 
      viewport.height
    );
  });

  test('renderer clear operations', () => {
    const renderer = createMockRenderer();
    
    renderer.clear();
    renderer.clearColor();
    renderer.clearDepth();
    renderer.clearStencil();
    
    // Verify all clear operations
    expect(renderer.clear).toHaveBeenCalledTimes(1);
    expect(renderer.clearColor).toHaveBeenCalledTimes(1);
    expect(renderer.clearDepth).toHaveBeenCalledTimes(1);
    expect(renderer.clearStencil).toHaveBeenCalledTimes(1);
  });

  test('renderer shadow map configuration', () => {
    const renderer = createMockRenderer();
    
    // Check default shadow map settings
    expect(renderer.shadowMap).toBeDefined();
    expect(renderer.shadowMap.enabled).toBe(false);
    expect(renderer.shadowMap.type).toBe('PCFShadowMap');
    
    // Modify shadow map settings
    renderer.shadowMap.enabled = true;
    expect(renderer.shadowMap.enabled).toBe(true);
  });

  test('multiple render calls with different scenes', () => {
    const renderer = createMockRenderer();
    const scene1 = createMockScene();
    const scene2 = createMockScene();
    const camera = createMockCamera();
    
    renderer.render(scene1, camera);
    renderer.render(scene2, camera);
    
    // Verify multiple render calls
    expect(renderer.render).toHaveBeenCalledTimes(2);
    expect(renderer.render).toHaveBeenNthCalledWith(1, scene1, camera);
    expect(renderer.render).toHaveBeenNthCalledWith(2, scene2, camera);
  });

  test('renderer with canvas element integration', () => {
    const renderer = createMockRenderer();
    
    // Check that domElement exists and behaves like HTMLCanvasElement
    expect(renderer.domElement).toBeDefined();
    expect(renderer.domElement.tagName).toBe('CANVAS');
    expect(renderer.domElement.width).toBe(800);
    expect(renderer.domElement.height).toBe(600);
  });
});
