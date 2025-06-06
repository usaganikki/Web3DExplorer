import React, {useRef, useEffect} from "react";
import * as THREE from 'three';

export const BasicCube: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if(!canvasRef.current) {
            return;
        }

        // 1. Scene、Camera、Rendererの初期化
        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        )

        const renderer = new THREE.WebGLRenderer({
            canvas: canvasRef.current
        });

        renderer.setSize(window.innerWidth, window.innerHeight);

        camera.position.z = 5;

        // 2. Cube（Geometry + Material + Mesh）の作成
        const geometry = new THREE.BoxGeometry(1, 1, 1);

        const material = new THREE.MeshBasicMaterial({
            color: 0x00ff00
        });

        const cube = new THREE.Mesh(geometry, material);

        scene.add(cube);

        renderer.render(scene, camera);

        // 3. OrbitControlsの設定
        // 4. アニメーションループの開始
        // 5. リサイズハンドラーの設定

        return() => {
            renderer.dispose();
        };
    },[]);

    return <canvas ref={canvasRef} />;
}