import React, { useEffect, useState, useCallback } from 'react';
import { Web3DExplorerComponent } from './Web3DExplorerComponent';
import { Explorer } from '../core/Explorer';
import { GISManager } from '../gis/GISManager';
import {
  Web3DExplorerConfig,
  PerformanceMetrics,
  GeoCoordinates
} from '../types';
import {
  TokyoStationArea,
  BuildingData,
  RoadData,
  POIData,
  TOKYO_PROJECTION
} from '../types/gis';
import * as THREE from 'three';

interface TokyoStationExplorerProps {
  className?: string;
  style?: React.CSSProperties;
  onLoadComplete?: () => void;
  showDebugInfo?: boolean;
}

/**
 * 東京駅エリア専用の3D探索コンポーネント
 */
export const TokyoStationExplorer: React.FC<TokyoStationExplorerProps> = ({
  className,
  style,
  onLoadComplete,
  showDebugInfo = false
}) => {
  const [explorer, setExplorer] = useState<Explorer | null>(null);
  const [gisManager, setGisManager] = useState<GISManager | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);

  // 東京駅エリア用の設定
  const config: Web3DExplorerConfig = {
    scene: {
      background: new THREE.Color(0x87ceeb), // 空色
      fog: {
        type: 'linear',
        color: new THREE.Color(0x87ceeb),
        near: 100,
        far: 1000
      },
      ambientLight: {
        color: new THREE.Color(0xffffff),
        intensity: 0.6
      }
    },
    camera: {
      fov: 60,
      aspect: window.innerWidth / window.innerHeight,
      near: 0.1,
      far: 2000,
      position: { x: 0, y: 50, z: 100 },
      target: { x: 0, y: 0, z: 0 }
    },
    renderer: {
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    },
    lights: [
      {
        type: 'directional',
        color: new THREE.Color(0xffffff),
        intensity: 1.0,
        position: { x: 50, y: 100, z: 50 },
        castShadow: true
      },
      {
        type: 'directional',
        color: new THREE.Color(0x4040ff),
        intensity: 0.3,
        position: { x: -50, y: 50, z: -50 },
        castShadow: false
      }
    ],
    debug: showDebugInfo,
    performance: {
      enableStats: showDebugInfo,
      maxFPS: 60,
      adaptiveQuality: true
    }
  };

  // 東京駅エリアのデータを読み込む
  const loadTokyoStationData = useCallback(async (): Promise<TokyoStationArea> => {
    // モックデータ（実際の実装では外部APIから取得）
    const mockTokyoStation: BuildingData = {
      id: 'tokyo-station-main',
      name: '東京駅',
      coordinates: { latitude: 35.6812, longitude: 139.7671, altitude: 0 },
      height: 30,
      footprint: [
        { latitude: 35.6810, longitude: 139.7669 },
        { latitude: 35.6814, longitude: 139.7669 },
        { latitude: 35.6814, longitude: 139.7673 },
        { latitude: 35.6810, longitude: 139.7673 }
      ],
      properties: {
        type: 'station',
        floors: 5,
        yearBuilt: 1914,
        material: 'brick'
      }
    };

    const mockBuildings: BuildingData[] = [
      {
        id: 'marunouchi-building',
        name: '丸の内ビル',
        coordinates: { latitude: 35.6815, longitude: 139.7665, altitude: 0 },
        height: 180,
        footprint: [
          { latitude: 35.6813, longitude: 139.7663 },
          { latitude: 35.6817, longitude: 139.7663 },
          { latitude: 35.6817, longitude: 139.7667 },
          { latitude: 35.6813, longitude: 139.7667 }
        ],
        properties: {
          type: 'office',
          floors: 37,
          yearBuilt: 2002
        }
      }
    ];

    const mockRoads: RoadData[] = [
      {
        id: 'marunouchi-nakadori',
        name: '丸の内仲通り',
        type: 'street',
        coordinates: [
          { latitude: 35.6805, longitude: 139.7665 },
          { latitude: 35.6820, longitude: 139.7665 }
        ],
        width: 8,
        properties: {
          surface: 'asphalt',
          lanes: 2
        }
      }
    ];

    const mockPOIs: POIData[] = [
      {
        id: 'marunouchi-exit',
        name: '丸の内口',
        type: 'station',
        coordinate: { latitude: 35.6812, longitude: 139.7665 }, // Changed 'coordinates' to 'coordinate'
        properties: {
          exitNumber: 'A1'
        }
      }
    ];

    return {
      station: mockTokyoStation,
      platforms: [],
      concourse: [],
      exits: mockPOIs,
      nearbyBuildings: mockBuildings,
      roads: mockRoads,
      terrain: {
        id: 'tokyo-terrain', // Added id
        width: 200,
        height: 200,
        data: new Float32Array(200 * 200).fill(0), // 平坦な地形
        bounds: {
          min: { latitude: 35.6800, longitude: 139.7650 },
          max: { latitude: 35.6825, longitude: 139.7690 }
        },
        resolution: 1
      }
    };
  }, []);

  // 3Dシーンにデータを追加
  const setupTokyoStationScene = useCallback(async (explorer: Explorer) => {
    try {
      setLoadingProgress(10);
      
      const gisManager = new GISManager(); // Removed TOKYO_PROJECTION argument
      setGisManager(gisManager);
      
      setLoadingProgress(30);
      
      const tokyoStationData = await loadTokyoStationData();
      
      setLoadingProgress(50);
      
      // 地形の追加
      const terrain = gisManager.createTerrain(tokyoStationData.terrain);
      explorer.addObject(terrain, { name: 'terrain' });
      
      setLoadingProgress(60);
      
      // 建物の追加
      const stationBuilding = gisManager.createBuilding(tokyoStationData.station);
      explorer.addObject(stationBuilding, { name: 'tokyo-station' });
      
      tokyoStationData.nearbyBuildings.forEach((building: BuildingData, index: number) => {
        const buildingObject = gisManager.createBuilding(building);
        explorer.addObject(buildingObject, { name: `building-${index}` });
      });
      
      setLoadingProgress(80);
      
      // 道路の追加
      tokyoStationData.roads.forEach((road: RoadData, index: number) => {
        const roadObject = gisManager.createRoad(road);
        explorer.addObject(roadObject, { name: `road-${index}` });
      });
      
      // POIの追加
      tokyoStationData.exits.forEach((poi: POIData, index: number) => {
        const poiObject = gisManager.createPOI(poi);
        explorer.addObject(poiObject, { name: `poi-${index}` });
      });
      
      setLoadingProgress(100);
      setIsLoading(false);
      
      if (onLoadComplete) {
        onLoadComplete();
      }
      
    } catch (error) {
      console.error('Error setting up Tokyo Station scene:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      setIsLoading(false);
    }
  }, [loadTokyoStationData, onLoadComplete]);

  const handleExplorerReady = useCallback((explorer: Explorer) => {
    setExplorer(explorer);
    setupTokyoStationScene(explorer);
  }, [setupTokyoStationScene]);

  const handlePerformanceUpdate = useCallback((newMetrics: PerformanceMetrics) => {
    setMetrics(newMetrics);
  }, []);

  if (error) {
    return (
      <div className="tokyo-station-error" style={{ padding: '20px', color: 'red' }}>
        <h3>Error loading Tokyo Station Explorer</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Reload</button>
      </div>
    );
  }

  return (
    <div 
      className={`tokyo-station-explorer ${className || ''}`}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        ...style
      }}
    >
      <Web3DExplorerComponent
        config={config}
        onExplorerReady={handleExplorerReady}
        onPerformanceUpdate={handlePerformanceUpdate}
      />
      
      {isLoading && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255, 255, 255, 0.9)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div style={{ fontSize: '18px', marginBottom: '20px' }}>
            Loading Tokyo Station Explorer...
          </div>
          <div 
            style={{
              width: '300px',
              height: '10px',
              background: '#e0e0e0',
              borderRadius: '5px',
              overflow: 'hidden'
            }}
          >
            <div 
              style={{
                width: `${loadingProgress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #4CAF50, #8BC34A)',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
          <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
            {loadingProgress}%
          </div>
        </div>
      )}
      
      {showDebugInfo && metrics && (
        <div 
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '15px',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '12px',
            minWidth: '200px',
            zIndex: 1000
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>
            Performance Metrics
          </div>
          <div>FPS: {metrics.fps}</div>
          <div>Frame Time: {metrics.frameTime?.toFixed(2)}ms</div>
          <div>Render Time: {metrics.renderTime?.toFixed(2)}ms</div>
          <div>Triangles: {metrics.triangleCount?.toLocaleString()}</div>
          <div>Draw Calls: {metrics.drawCalls}</div>
          <div>Memory: {metrics.memoryUsage.total}MB</div>
        </div>
      )}
      
      {!isLoading && (
        <div 
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '15px',
            borderRadius: '8px',
            maxWidth: '300px',
            zIndex: 1000
          }}
        >
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>
            Tokyo Station Explorer
          </h3>
          <p style={{ margin: '0', fontSize: '14px', lineHeight: '1.4' }}>
            東京駅周辺の3D可視化です。マウスで視点を操作し、建物をクリックして詳細を確認できます。
          </p>
        </div>
      )}
    </div>
  );
};

export default TokyoStationExplorer;
