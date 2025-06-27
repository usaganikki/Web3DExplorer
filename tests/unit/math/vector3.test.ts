import { Vector3 } from 'three';

describe('Vector3 Math Operations', () => {
  let vector1: Vector3;
  let vector2: Vector3;
  let vector3: Vector3;

  beforeEach(() => {
    vector1 = new Vector3(1, 2, 3);
    vector2 = new Vector3(4, 5, 6);
    vector3 = new Vector3(0, 0, 0);
  });

  describe('Basic Operations', () => {
    test('should create vector with correct components', () => {
      expect(vector1.x).toBe(1);
      expect(vector1.y).toBe(2);
      expect(vector1.z).toBe(3);
    });

    test('should clone vector correctly', () => {
      const cloned = vector1.clone();
      expect(cloned.x).toBe(vector1.x);
      expect(cloned.y).toBe(vector1.y);
      expect(cloned.z).toBe(vector1.z);
      expect(cloned).not.toBe(vector1); // Different object reference
    });

    test('should set vector components', () => {
      vector3.set(7, 8, 9);
      expect(vector3.x).toBe(7);
      expect(vector3.y).toBe(8);
      expect(vector3.z).toBe(9);
    });
  });

  describe('Addition Operations', () => {
    test('should add vectors correctly', () => {
      const result = vector1.clone().add(vector2);
      expect(result.x).toBe(5); // 1 + 4
      expect(result.y).toBe(7); // 2 + 5
      expect(result.z).toBe(9); // 3 + 6
    });

    test('should add scalar correctly', () => {
      const result = vector1.clone().addScalar(10);
      expect(result.x).toBe(11);
      expect(result.y).toBe(12);
      expect(result.z).toBe(13);
    });

    test('should not modify original vector when adding', () => {
      const original = vector1.clone();
      vector1.clone().add(vector2);
      expect(vector1.x).toBe(original.x);
      expect(vector1.y).toBe(original.y);
      expect(vector1.z).toBe(original.z);
    });
  });

  describe('Subtraction Operations', () => {
    test('should subtract vectors correctly', () => {
      const result = vector2.clone().sub(vector1);
      expect(result.x).toBe(3); // 4 - 1
      expect(result.y).toBe(3); // 5 - 2
      expect(result.z).toBe(3); // 6 - 3
    });

    test('should subtract scalar correctly', () => {
      const result = vector1.clone().subScalar(1);
      expect(result.x).toBe(0);
      expect(result.y).toBe(1);
      expect(result.z).toBe(2);
    });
  });

  describe('Multiplication Operations', () => {
    test('should multiply vectors correctly', () => {
      const result = vector1.clone().multiply(vector2);
      expect(result.x).toBe(4);  // 1 * 4
      expect(result.y).toBe(10); // 2 * 5
      expect(result.z).toBe(18); // 3 * 6
    });

    test('should multiply by scalar correctly', () => {
      const result = vector1.clone().multiplyScalar(2);
      expect(result.x).toBe(2);
      expect(result.y).toBe(4);
      expect(result.z).toBe(6);
    });
  });

  describe('Division Operations', () => {
    test('should divide vectors correctly', () => {
      const result = vector2.clone().divide(vector1);
      expect(result.x).toBe(4); // 4 / 1
      expect(result.y).toBe(2.5); // 5 / 2
      expect(result.z).toBe(2); // 6 / 3
    });

    test('should divide by scalar correctly', () => {
      const result = vector2.clone().divideScalar(2);
      expect(result.x).toBe(2);
      expect(result.y).toBe(2.5);
      expect(result.z).toBe(3);
    });
  });

  describe('Length and Normalization', () => {
    test('should calculate length correctly', () => {
      const vector = new Vector3(3, 4, 0);
      expect(vector.length()).toBe(5); // √(3² + 4² + 0²) = 5
    });

    test('should calculate length squared correctly', () => {
      const vector = new Vector3(3, 4, 0);
      expect(vector.lengthSq()).toBe(25); // 3² + 4² + 0² = 25
    });

    test('should normalize vector correctly', () => {
      const vector = new Vector3(3, 4, 0);
      const normalized = vector.clone().normalize();
      expect(normalized.length()).toBeCloseTo(1, 10);
      expect(normalized.x).toBeCloseTo(0.6, 10);
      expect(normalized.y).toBeCloseTo(0.8, 10);
      expect(normalized.z).toBe(0);
    });

    test('should set length correctly', () => {
      const vector = new Vector3(1, 0, 0);
      vector.setLength(5);
      expect(vector.length()).toBeCloseTo(5, 10);
      expect(vector.x).toBeCloseTo(5, 10);
      expect(vector.y).toBe(0);
      expect(vector.z).toBe(0);
    });
  });

  describe('Dot Product', () => {
    test('should calculate dot product correctly', () => {
      const dot = vector1.dot(vector2);
      expect(dot).toBe(32); // 1*4 + 2*5 + 3*6 = 4 + 10 + 18 = 32
    });

    test('should return zero for perpendicular vectors', () => {
      const v1 = new Vector3(1, 0, 0);
      const v2 = new Vector3(0, 1, 0);
      expect(v1.dot(v2)).toBe(0);
    });

    test('should return positive for same direction vectors', () => {
      const v1 = new Vector3(1, 1, 1);
      const v2 = new Vector3(2, 2, 2);
      expect(v1.dot(v2)).toBeGreaterThan(0);
    });
  });

  describe('Cross Product', () => {
    test('should calculate cross product correctly', () => {
      const v1 = new Vector3(1, 0, 0);
      const v2 = new Vector3(0, 1, 0);
      const cross = v1.clone().cross(v2);
      expect(cross.x).toBe(0);
      expect(cross.y).toBe(0);
      expect(cross.z).toBe(1);
    });

    test('should return zero vector for parallel vectors', () => {
      const v1 = new Vector3(1, 2, 3);
      const v2 = new Vector3(2, 4, 6);
      const cross = v1.clone().cross(v2);
      expect(cross.x).toBeCloseTo(0, 10);
      expect(cross.y).toBeCloseTo(0, 10);
      expect(cross.z).toBeCloseTo(0, 10);
    });

    test('should be perpendicular to both input vectors', () => {
      const cross = vector1.clone().cross(vector2);
      expect(cross.dot(vector1)).toBeCloseTo(0, 10);
      expect(cross.dot(vector2)).toBeCloseTo(0, 10);
    });
  });

  describe('Distance Calculations', () => {
    test('should calculate distance to another vector correctly', () => {
      const v1 = new Vector3(0, 0, 0);
      const v2 = new Vector3(3, 4, 0);
      expect(v1.distanceTo(v2)).toBe(5);
    });

    test('should calculate distance squared correctly', () => {
      const v1 = new Vector3(0, 0, 0);
      const v2 = new Vector3(3, 4, 0);
      expect(v1.distanceToSquared(v2)).toBe(25);
    });

    test('should calculate Manhattan distance correctly', () => {
      const v1 = new Vector3(0, 0, 0);
      const v2 = new Vector3(1, 2, 3);
      expect(v1.manhattanDistanceTo(v2)).toBe(6); // |1| + |2| + |3| = 6
    });
  });

  describe('Utility Methods', () => {
    test('should check equality correctly', () => {
      const v1 = new Vector3(1, 2, 3);
      const v2 = new Vector3(1, 2, 3);
      const v3 = new Vector3(1, 2, 4);
      expect(v1.equals(v2)).toBe(true);
      expect(v1.equals(v3)).toBe(false);
    });

    test('should round components correctly', () => {
      const vector = new Vector3(1.6, 2.4, 3.7);
      vector.round();
      expect(vector.x).toBe(2);
      expect(vector.y).toBe(2);
      expect(vector.z).toBe(4);
    });

    test('should floor components correctly', () => {
      const vector = new Vector3(1.9, 2.1, 3.8);
      vector.floor();
      expect(vector.x).toBe(1);
      expect(vector.y).toBe(2);
      expect(vector.z).toBe(3);
    });

    test('should ceil components correctly', () => {
      const vector = new Vector3(1.1, 2.9, 3.1);
      vector.ceil();
      expect(vector.x).toBe(2);
      expect(vector.y).toBe(3);
      expect(vector.z).toBe(4);
    });
  });

  describe('Linear Interpolation', () => {
    test('should interpolate between vectors correctly', () => {
      const v1 = new Vector3(0, 0, 0);
      const v2 = new Vector3(10, 20, 30);
      const result = v1.clone().lerp(v2, 0.5);
      expect(result.x).toBe(5);
      expect(result.y).toBe(10);
      expect(result.z).toBe(15);
    });

    test('should return start vector when alpha is 0', () => {
      const result = vector1.clone().lerp(vector2, 0);
      expect(result.equals(vector1)).toBe(true);
    });

    test('should return end vector when alpha is 1', () => {
      const result = vector1.clone().lerp(vector2, 1);
      expect(result.equals(vector2)).toBe(true);
    });
  });

  describe('Performance Tests', () => {
    test('should complete basic operations within performance threshold', () => {
      const start = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        const v = new Vector3(i, i + 1, i + 2);
        v.add(vector1).normalize().multiplyScalar(2);
      }
      
      const duration = performance.now() - start;
      // Should complete 1000 operations in reasonable time
      // Note: Jest spy機能によるオーバーヘッドを考慮して期待値を調整
      // 実際のアプリケーションでは spy無しでより高速に動作
      expect(duration).toBeLessThan(100);
    });
  });
});
