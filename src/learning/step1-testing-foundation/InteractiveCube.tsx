import React, {useRef, useEffect, useState} from "react";
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export const InteractiveCube: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const cubeRef = useRef<THREE.Mesh>();

    const [cubeColor, setCubeColor] = useState<string>('green');
    const [cubeSize, setCubeSize] = useState<number>(1.0);
    const [cubePositionX, setCubePositionX] = useState<number>(0);
    const [rotationSpeed, setRotationSpeed] = useState<number>(0.01);

    const rotationSpeedRef = useRef(rotationSpeed);

    useEffect(() => {
        if(!canvasRef.current) {
            return;
        }

        const parentElement = canvasRef.current.parentElement;

        if(!parentElement) {
            console.error("InteractiveCube: canvasRef.current.parentElement is null. \
                his should not happen in a normal browser environment or with typical RTL setup.");
            return;
        }

        let width = parentElement!.clientWidth;
        let height = parentElement!.clientHeight;

        // jsdom環境でclientWidth/Heightが0になる場合へのフォールバック
        if (width === 0) {
            width = 500; // テスト用のデフォルト幅
            console.warn(`InteractiveCube: parentElement.clientWidth is 0. \
                Falling back to default width: ${width}`);
        }
        if (height === 0) {
            height = 300; // テスト用のデフォルト高さ
            console.warn(`InteractiveCube: parentElement.clientHeight is 0. \
                Falling back to default height: ${height}`);
        }

        // 1. Scene、Camera、Rendererの初期化
        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(
            75,
            width / height,
            0.1,
            1000
        )

        const renderer = new THREE.WebGLRenderer({
            canvas: canvasRef.current
        });

        renderer.setSize(width, height);

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
            cube.rotation.x += rotationSpeedRef.current;
            cube.rotation.y += rotationSpeedRef.current;
            // cube.rotation.x += 0.01;
            // cube.rotation.y += 0.01;

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

            camera.aspect = width / height;
            camera.updateProjectionMatrix();

            renderer.setSize(width, height);
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

    useEffect(() => {
        if(!cubeRef.current){
            return;
        }

        cubeRef.current.scale.setScalar(cubeSize);

    }, [cubeSize]);

    useEffect(() => {
        if(!cubeRef.current){
            return;
        }

        cubeRef.current.position.x = cubePositionX;

    }, [cubePositionX]);

    useEffect(() => {
        rotationSpeedRef.current = rotationSpeed;
    }, [rotationSpeed]);

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <div style={{position: 'absolute',
                 top: '10px', 
                 left: '10px', 
                 zIndex: 1000}}>
                <div>
                    <button onClick={() => setCubeColor('green')}>緑</button>
                    <button onClick={() => setCubeColor('red')}>赤</button>
                    <button onClick={() => setCubeColor('blue')}>青</button>
                    <button onClick={() => setCubeColor('yellow')}>黄</button>
                </div>
                <div style={{marginTop:'10px'}}>
                    <span style={{color:'white'}}>
                        サイズ: {cubeSize.toFixed(1)}
                    </span>
                    <input 
                        type="range" 
                        min="0.5" 
                        max="3.0" 
                        step="0.1"
                        value={cubeSize}
                        onChange={(e) => setCubeSize(parseFloat(e.target.value))}
                    />
                </div>
                <div style={{marginTop:'10px'}}>
                    <span style={{color:'white'}}>
                        位置X: {cubePositionX.toFixed(1)}
                    </span>
                    <input 
                        type="range" 
                        min="-5" 
                        max="5" 
                        step="0.1"
                        value={cubePositionX}
                        onChange={(e) => setCubePositionX(parseFloat(e.target.value))}
                    />
                </div>
                <div style={{marginTop:'10px'}}>
                    <span style={{color:'white'}}>
                        回転速度: {rotationSpeed.toFixed(2)}
                    </span>
                    <input 
                        type="range" 
                        min="0" 
                        max="0.1" 
                        step="0.001"
                        value={rotationSpeed}
                        onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
                    />
                </div>
            </div>
            
            <canvas ref={canvasRef} />
        </div>
        
    );
}