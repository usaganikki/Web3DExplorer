import { GISManager } from '../src/gis/GISManager';
import { TOKYO_PROJECTION, BuildingData, RoadData, POIData, TerrainData } from '../src/types/gis';
import * as THREE from 'three';

describe('GISManager', () => {
  let gisManager: GISManager;

  beforeEach(() => {
    gisManager = new GISManager();
  });

  describe('coordinate transformation', () => {
    it('should transform geographic coordinates to world coordinates', () => {
      const geoCoords = { latitude: 35.6812, longitude: 139.7671, altitude: 10 };
      const worldCoords = gisManager.geoToWorld(geoCoords);
      
      expect(typeof worldCoords.x).toBe('number');
      expect(typeof worldCoords.y).toBe('number');
      expect(typeof worldCoords.z).toBe('number');
      expect(worldCoords.y).toBe(10); // altitude should be preserved
    });

    it('should transform world coordinates back to geographic coordinates', () => {
      const originalGeo = { latitude: 35.6812, longitude: 139.7671, altitude: 10 };
      const worldCoords = gisManager.geoToWorld(originalGeo);
      const backToGeo = gisManager.worldToGeo(worldCoords);
      
      expect(backToGeo.latitude).toBeCloseTo(originalGeo.latitude, 5);
      expect(backToGeo.longitude).toBeCloseTo(originalGeo.longitude, 5);
      expect(backToGeo.altitude).toBeCloseTo(originalGeo.altitude!, 5);
    });

    it('should handle Tokyo Station coordinates correctly', () => {
      const tokyoStation = { latitude: 35.6812, longitude: 139.7671, altitude: 0 };
      const worldCoords = gisManager.geoToWorld(tokyoStation);
      
      // 東京駅が中心なので、world座標は原点付近になるはず
      expect(Math.abs(worldCoords.x)).toBeLessThan(1);
      expect(Math.abs(worldCoords.z)).toBeLessThan(1);
      expect(worldCoords.y).toBe(0);
    });
  });

  describe('3D object creation', () => {
    it('should create terrain from terrain data', () => {
      const terrainData: TerrainData = {
        width: 10,
        height: 10,
        data: new Float32Array(100).fill(0),
        bounds: {
          min: { latitude: 35.680, longitude: 139.765 },
          max: { latitude: 35.682, longitude: 139.769 }
        },
        resolution: 1
      };
      
      const terrain = gisManager.createTerrain(terrainData);
      
      expect(terrain).toBeInstanceOf(THREE.Mesh);
      expect(terrain.geometry).toBeInstanceOf(THREE.PlaneGeometry);
      expect(terrain.material).toBeInstanceOf(THREE.MeshLambertMaterial);
    });

    it('should create building from building data', () => {
      const buildingData: BuildingData = {
        id: 'test-building',
        name: 'Test Building',
        coordinates: { latitude: 35.6812, longitude: 139.7671, altitude: 0 },
        height: 50,
        footprint: [
          { latitude: 35.6810, longitude: 139.7669 },
          { latitude: 35.6814, longitude: 139.7669 },
          { latitude: 35.6814, longitude: 139.7673 },
          { latitude: 35.6810, longitude: 139.7673 }
        ],
        properties: {
          type: 'office',
          floors: 10
        }
      };
      
      const building = gisManager.createBuilding(buildingData);
      
      expect(building).toBeInstanceOf(THREE.Group);
      expect(building.name).toBe('building-test-building');
      expect(building.children.length).toBeGreaterThan(0);
    });

    it('should create road from road data', () => {
      const roadData: RoadData = {
        id: 'test-road',
        name: 'Test Road',
        type: 'street',
        coordinates: [
          { latitude: 35.6810, longitude: 139.7669 },
          { latitude: 35.6814, longitude: 139.7673 }
        ],
        width: 8,
        properties: {
          surface: 'asphalt'
        }
      };
      
      const road = gisManager.createRoad(roadData);
      
      expect(road).toBeInstanceOf(THREE.Line);
      expect(road.name).toBe('road-test-road');
    });

    it('should create POI from POI data', () => {
      const poiData: POIData = {
        id: 'test-poi',
        name: 'Test POI',
        type: 'station',
        coordinates: { latitude: 35.6812, longitude: 139.7671 },
        properties: {}
      };
      
      const poi = gisManager.createPOI(poiData);
      
      expect(poi).toBeInstanceOf(THREE.Sprite);
      expect(poi.name).toBe('poi-test-poi');
    });
  });

  describe('layer management', () => {
    it('should add and retrieve layers', () => {
      const layer = {
        id: 'test-layer',
        name: 'Test Layer',
        type: 'buildings' as const,
        visible: true,
        opacity: 1,
        data: []
      };
      
      gisManager.addLayer(layer);
      
      const retrievedLayer = gisManager.getLayer('test-layer');
      expect(retrievedLayer).toBe(layer);
    });

    it('should remove layers', () => {
      const layer = {
        id: 'test-layer',
        name: 'Test Layer',
        type: 'buildings' as const,
        visible: true,
        opacity: 1,
        data: []
      };
      
      gisManager.addLayer(layer);
      gisManager.removeLayer('test-layer');
      
      const retrievedLayer = gisManager.getLayer('test-layer');
      expect(retrievedLayer).toBeUndefined();
    });

    it('should toggle layer visibility', () => {
      const layer = {
        id: 'test-layer',
        name: 'Test Layer',
        type: 'buildings' as const,
        visible: true,
        opacity: 1,
        data: []
      };
      
      gisManager.addLayer(layer);
      gisManager.toggleLayer('test-layer');
      
      expect(layer.visible).toBe(false);
      
      gisManager.toggleLayer('test-layer');
      expect(layer.visible).toBe(true);
    });
  });
});
