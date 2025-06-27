/**
 * SimpleCube Component
 * Three.jsを使用した基本的なCube表示コンポーネント
 * Issue #71: Phase B Jest + Canvas Mock環境構築の検証用実装
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface SimpleCubeProps {
  width?: number;
  height?: number;
  cubeColor?: number;
}

const SimpleCube: React.FC<SimpleCubeProps> = ({
  width = 800,
  height = 600,
  cubeColor = 0x00ff00, // 緑色
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const cubeRef = useRef<THREE.Mesh | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Three.js Scene初期化
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera初期化
    const camera = new THREE.PerspectiveCamera(
      75, // fov
      width / height, // aspect ratio
      0.1, // near
      1000 // far
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer初期化
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current,
      antialias: true 
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x222222);
    rendererRef.current = renderer;

    // Cube作成
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: cubeColor });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    cubeRef.current = cube;

    // アニメーションループ
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      // Cubeを回転させる
      if (cubeRef.current) {
        cubeRef.current.rotation.x += 0.01;
        cubeRef.current.rotation.y += 0.01;
      }

      renderer.render(scene, camera);
    };

    animate();

    // クリーンアップ関数
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      
      if (cubeRef.current) {
        if (cubeRef.current.geometry) {
          cubeRef.current.geometry.dispose();
        }
        if (cubeRef.current.material) {
          if (Array.isArray(cubeRef.current.material)) {
            cubeRef.current.material.forEach(material => material.dispose());
          } else {
            cubeRef.current.material.dispose();
          }
        }
        if (sceneRef.current) {
          sceneRef.current.remove(cubeRef.current);
        }
      }
    };
  }, [width, height, cubeColor]);

  return (
    <div 
      ref={containerRef}
      data-testid="simple-cube-container"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        border: '1px solid #ccc',
        borderRadius: '4px',
        overflow: 'hidden',
      }}
    >
      <canvas
        ref={canvasRef}
        data-testid="simple-cube-canvas"
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
};

export default SimpleCube;
