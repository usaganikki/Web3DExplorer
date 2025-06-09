import React, {useRef, useEffect, useState} from "react";
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export const InteractiveCube: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const cubeRef = useRef<THREE.Mesh>();

    const [cubeColor, setCubeColor] = useState<string>('green');

    useEffect(() => {
        if(!canvasRef.current) {
            return;
        }

        // 1. Scene、Camera、Rendererの初期化
        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(
            75,
            canvasRef.current.parentElement!.clientWidth / canvasRef.current.parentElement!.clientHeight,
            0.1,
            1000
        )

        const renderer = new THREE.WebGLRenderer({
            canvas: canvasRef.current
        });

        renderer.setSize(canvasRef.current.parentElement!.clientWidth
            , canvasRef.current.parentElement!.clientHeight);

        camera.position.z = 5;

        // 2. Cube（Geometry + Material + Mesh）の作成
        const geometry = new THREE.BoxGeometry(1, 1, 1);

        const material = new THREE.MeshBasicMaterial({
            color: 0x00ff00
        });

        const cube = new THREE.Mesh(geometry, material);
        cubeRef.current = cube;

        scene.add(cube);

        // 3. OrbitControlsの設定
        const controls = new OrbitControls(camera, renderer.domElement);

        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enableZoom = true;
        controls.enablePan = true;

        // 4. アニメーションループの開始
        const animate = () => {
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;

            controls.update();
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        }

        animate();
        // 5. リサイズハンドラーの設定
        const handleResize = () => {
            if(!canvasRef.current) {
                return;
            }

            camera.aspect = canvasRef.current.parentElement!.clientWidth / canvasRef.current.parentElement!.clientHeight;
            camera.updateProjectionMatrix();

            renderer.setSize(canvasRef.current.parentElement!.clientWidth
            , canvasRef.current.parentElement!.clientHeight);
        }

        window.addEventListener('resize', handleResize);

        return() => {
            renderer.dispose();
            controls.dispose();
            window.removeEventListener('resize', handleResize);
        };
    },[]);

    useEffect(() => {
        if(!cubeRef.current){
            return;
        }

        const colorMap: {[Key: string]: number} = {
            'green': 0x00ff00,
            'red': 0xff0000,
            'blue': 0x0000ff,
            'yellow': 0xffff00
        };

        const material = cubeRef.current.material as THREE.MeshBasicMaterial;
        material.color.setHex(colorMap[cubeColor]);
        
    }, [cubeColor]);

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <div style={{position: 'absolute', top: '10px', left: '10px', zIndex: 1000}}>
                <button onClick={() => setCubeColor('green')}>緑</button>
                <button onClick={() => setCubeColor('red')}>赤</button>
                <button onClick={() => setCubeColor('blue')}>青</button>
                <button onClick={() => setCubeColor('yellow')}>黄</button>
            </div>
            <canvas ref={canvasRef} />
        </div>
        
    );
}