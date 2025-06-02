import { GeoCoordinates } from './index'; // Assuming GeoCoordinates is in index.ts

export type TOKYO_PROJECTION = string; // Placeholder type, could be an enum or a more specific type

export interface TokyoStationArea {
    station: BuildingData;
    nearbyBuildings: BuildingData[];
    roads: RoadData[];
    exits: POIData[];
    terrain: TerrainData;
    platforms?: any[]; // Added platforms
    concourse?: any[]; // Added concourse
}

export interface BuildingData {
  id: string;
  name?: string;
  coordinates: GeoCoordinates | GeoCoordinates[] | GeoCoordinates[][] | number[][][] | { latitude: number; longitude: number; altitude?: number } | { latitude: number; longitude: number; altitude?: number }[];
  properties?: Record<string, any>;
  height?: number;
  footprint?: GeoCoordinates[]; // Added based on error TS2353
  // Add other BuildingData properties
}

export interface RoadData {
  id: string;
  name?: string;
  coordinates: GeoCoordinates[] | number[][] | { latitude: number; longitude: number }[];
  properties?: Record<string, any>;
  type?: string;
  width?: number; // Added based on error TS2353
  // Add other RoadData properties
}

export interface POIData {
  id: string;
  name?: string;
  type?: string;
  // coordinate field is correct as per definition, test code uses 'coordinates'
  coordinate: GeoCoordinates | [number, number] | { latitude: number; longitude: number };
  properties?: Record<string, any>;
  // Add other POIData properties
}

export interface TerrainData {
  id: string;
  sourceUrl?: string; // Made optional as some test data might not have it
  width?: number;
  height?: number;
  resolution?: number;
  data?: Float32Array | any;
  bounds?: { min: GeoCoordinates; max: GeoCoordinates; }; // Added based on error TS2353
  // Add other TerrainData properties
}

// Add other GIS related types here
// Example Layer type
export interface GISLayer {
    id: string;
    name: string;
    // type "buildings" will be corrected in test file to "building"
    type: 'building' | 'road' | 'poi' | 'terrain' | 'custom';
    data: BuildingData[] | RoadData[] | POIData[] | TerrainData[] | any[];
    visible: boolean;
    style?: any; // Style information for rendering
}
