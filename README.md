# Web3DExplorer

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-0.163+-green.svg)](https://threejs.org/)
[![React](https://img.shields.io/badge/React-18.2+-blue.svg)](https://reactjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

3D web visualization library with TDD-driven testing framework for Three.js applications. Features Tokyo Station exploration with GIS integration.

## ✨ Features

- **TypeScript First**: Fully typed API with comprehensive type definitions
- **React Integration**: Built-in React components with hooks support
- **GIS Integration**: Geographic Information System support with coordinate transformation
- **Tokyo Station Explorer**: Specialized 3D visualization of Tokyo Station area
- **TDD Framework**: Comprehensive testing utilities for Three.js applications
- **Performance Monitoring**: Built-in performance metrics and optimization tools
- **Event System**: Powerful event-driven architecture
- **Modern Build Tools**: Vite, ESLint, Jest, and TypeScript configuration

## 🚀 Quick Start

### Installation

```bash
npm install web3d-explorer
# or
yarn add web3d-explorer
```

### Basic Usage

```typescript
import { createExplorer } from 'web3d-explorer';
import * as THREE from 'three';

// Create a basic 3D explorer
const explorer = createExplorer({
  scene: {
    background: new THREE.Color(0x87ceeb)
  },
  camera: {
    fov: 60,
    aspect: window.innerWidth / window.innerHeight,
    near: 0.1,
    far: 1000,
    position: { x: 0, y: 5, z: 10 }
  },
  renderer: {
    antialias: true
  },
  lights: [
    {
      type: 'directional',
      color: new THREE.Color(0xffffff),
      intensity: 1.0,
      position: { x: 5, y: 10, z: 5 }
    }
  ]
});

// Add a simple cube
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);

explorer.addObject(cube, {
  position: { x: 0, y: 0, z: 0 },
  name: 'my-cube'
});

// Start animation loop
explorer.animate();
```

### React Usage

```tsx
import React from 'react';
import { Web3DExplorerComponent } from 'web3d-explorer';
import * as THREE from 'three';

const MyApp: React.FC = () => {
  const config = {
    scene: {
      background: new THREE.Color(0x87ceeb)
    },
    camera: {
      fov: 60,
      aspect: window.innerWidth / window.innerHeight,
      near: 0.1,
      far: 1000
    },
    renderer: {
      antialias: true
    },
    lights: [
      {
        type: 'directional' as const,
        color: new THREE.Color(0xffffff),
        intensity: 1.0,
        position: { x: 5, y: 10, z: 5 }
      }
    ]
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Web3DExplorerComponent
        config={config}
        onExplorerReady={(explorer) => {
          console.log('Explorer ready!', explorer);
        }}
      />
    </div>
  );
};

export default MyApp;
```

### Tokyo Station Explorer

```tsx
import React from 'react';
import { TokyoStationExplorer } from 'web3d-explorer';

const TokyoStationApp: React.FC = () => {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <TokyoStationExplorer
        showDebugInfo={true}
        onLoadComplete={() => {
          console.log('Tokyo Station loaded!');
        }}
      />
    </div>
  );
};

export default TokyoStationApp;
```

## 📚 API Reference

### Core Classes

#### Explorer

Main class for creating and managing 3D scenes.

```typescript
class Explorer {
  constructor(config: Web3DExplorerConfig, container?: HTMLElement)
  
  // Object management
  addObject(object: THREE.Object3D, config?: Object3DConfig): void
  removeObject(object: THREE.Object3D): void
  
  // Animation and rendering
  animate(callback?: () => void): void
  render(): void
  
  // Events
  on<T>(event: string, handler: EventHandler<T>): void
  off<T>(event: string, handler: EventHandler<T>): void
  emit<T>(event: string, data?: T): void
  
  // Performance
  getMetrics(): PerformanceMetrics
  
  // Lifecycle
  resize(width: number, height: number): void
  dispose(): void
}
```

#### GISManager

Handles geographic data and coordinate transformations.

```typescript
class GISManager {
  constructor(projection?: ProjectionSystem, center?: GeoCoordinates)
  
  // Coordinate transformation
  geoToWorld(coords: GeoCoordinates): Position3D
  worldToGeo(position: Position3D): GeoCoordinates
  
  // Data loading
  loadTerrain(url: string): Promise<TerrainData>
  loadBuildings(url: string): Promise<BuildingData[]>
  loadRoads(url: string): Promise<RoadData[]>
  loadPOIs(url: string): Promise<POIData[]>
  
  // 3D object creation
  createTerrain(data: TerrainData): THREE.Mesh
  createBuilding(data: BuildingData): THREE.Group
  createRoad(data: RoadData): THREE.Line
  createPOI(data: POIData): THREE.Sprite
}
```

### React Components

#### Web3DExplorerComponent

Main React component for embedding 3D scenes.

```typescript
interface Web3DExplorerProps {
  config: Web3DExplorerConfig
  onExplorerReady?: (explorer: Explorer) => void
  onPerformanceUpdate?: (metrics: PerformanceMetrics) => void
  className?: string
  style?: React.CSSProperties
}
```

#### TokyoStationExplorer

Specialized component for Tokyo Station area visualization.

```typescript
interface TokyoStationExplorerProps {
  className?: string
  style?: React.CSSProperties
  onLoadComplete?: () => void
  showDebugInfo?: boolean
}
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run Three.js test suite
npm run test:suite
```

### Writing Tests with ThreeTestUtils

```typescript
import { threeTestUtils, createMockScene } from 'web3d-explorer/test';
import * as THREE from 'three';

describe('My 3D Component', () => {
  let scene: THREE.Scene;
  let cube: THREE.Mesh;

  beforeEach(() => {
    const mockScene = createMockScene();
    scene = mockScene.scene;
    
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    cube = new THREE.Mesh(geometry, material);
  });

  it('should position cube correctly', () => {
    cube.position.set(5, 10, 15);
    
    threeTestUtils.expectObject3D(cube).toHavePosition(
      new THREE.Vector3(5, 10, 15)
    );
  });

  it('should be visible', () => {
    threeTestUtils.expectObject3D(cube).toBeVisible();
  });

  it('should be in camera frustum', () => {
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 5;
    
    threeTestUtils.expectObject3D(cube).toBeInFrustum(camera);
  });
});
```

## 🛠️ Development

### Setup

```bash
# Clone the repository
git clone https://github.com/usaganikki/Web3DExplorer.git
cd Web3DExplorer

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build

```bash
# Type check
npm run type-check

# Build for production
npm run build

# Lint code
npm run lint
npm run lint:fix
```

### Project Structure

```
src/
├── core/              # Core Explorer class
├── components/        # React components
├── gis/               # GIS functionality
├── test/              # Testing utilities
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
└── index.ts           # Main export file

__tests__/             # Test files
three-test-suite/      # Extended testing framework
```

## 🌏 GIS Integration

### Coordinate Systems

Web3DExplorer supports geographic coordinate transformation:

```typescript
import { GISManager, TOKYO_PROJECTION } from 'web3d-explorer';

const gisManager = new GISManager(TOKYO_PROJECTION);

// Convert latitude/longitude to 3D world coordinates
const worldPos = gisManager.geoToWorld({
  latitude: 35.6812,  // Tokyo Station
  longitude: 139.7671,
  altitude: 0
});

// Convert back to geographic coordinates
const geoPos = gisManager.worldToGeo(worldPos);
```

### Loading GIS Data

```typescript
// Load terrain elevation data
const terrain = await gisManager.loadTerrain('/api/terrain.json');
const terrainMesh = gisManager.createTerrain(terrain);
explorer.addObject(terrainMesh);

// Load building data
const buildings = await gisManager.loadBuildings('/api/buildings.json');
buildings.forEach(building => {
  const buildingMesh = gisManager.createBuilding(building);
  explorer.addObject(buildingMesh);
});
```

## 🎨 Performance Optimization

### Monitoring Performance

```typescript
explorer.on('frame', ({ stats }) => {
  console.log('FPS:', stats.fps);
  console.log('Frame Time:', stats.frameTime, 'ms');
  console.log('Triangles:', stats.triangleCount);
  console.log('Draw Calls:', stats.drawCalls);
});

// Get current metrics
const metrics = explorer.getMetrics();
```

### Optimization Tips

1. **Use LOD (Level of Detail)**: Implement different detail levels based on distance
2. **Frustum Culling**: Objects outside camera view are automatically culled
3. **Texture Atlasing**: Combine multiple textures to reduce draw calls
4. **Geometry Instancing**: Use THREE.InstancedMesh for repeated objects
5. **Performance Monitoring**: Use built-in metrics to identify bottlenecks

## 📝 Examples

See the `/examples` directory for more detailed examples:

- Basic 3D Scene Setup
- Tokyo Station Visualization
- GIS Data Integration
- Custom Testing Framework
- Performance Optimization
- React Integration Patterns

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Write tests for your changes
4. Ensure all tests pass: `npm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🚀 Changelog

### v0.1.0 (2025-06-01)

- ✨ Initial TypeScript implementation
- ✨ Core Explorer class with full type safety
- ✨ React components with hooks support
- ✨ GIS integration with Tokyo projection system
- ✨ Comprehensive testing framework
- ✨ Tokyo Station Explorer component
- ✨ Performance monitoring and metrics
- ✨ Event-driven architecture
- ✨ Modern build setup with Vite and TypeScript

## 📞 Support

For questions and support:

- Create an issue on [GitHub Issues](https://github.com/usaganikki/Web3DExplorer/issues)
- Check the [API Documentation](./docs/api.md)
- Review the [Examples](./examples/)

---

**Made with ❤️ for the 3D web visualization community**
