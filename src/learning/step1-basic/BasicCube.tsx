import React, {useRef, useEffect} from "react";
import * as THREE from 'three';

export const BasicCube: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {

        // 1. Scene、Camera、Rendererの初期化
        // 2. Cube（Geometry + Material + Mesh）の作成
        // 3. OrbitControlsの設定
        // 4. アニメーションループの開始
        // 5. リサイズハンドラーの設定
        
        return() => {

        };
    },[]);

    return <canvas ref={canvasRef} />;
}