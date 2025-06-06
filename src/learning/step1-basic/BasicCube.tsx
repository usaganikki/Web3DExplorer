import React, {useRef, useEffect} from "react";
import * as THREE from 'three';

export const BasicCube: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {

        return() => {

        };
    },[]);

    return <canvas ref={canvasRef} />;
}