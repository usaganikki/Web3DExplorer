import * as THREE from 'three';

describe('Three.js Objects Creation Tests', () => {
  describe('Scene Creation', () => {
    test('should create a Scene object successfully', () => {
      const scene = new THREE.Scene();
      
      expect(scene).toBeInstanceOf(THREE.Scene);
      expect(scene.type).toBe('Scene');
      expect(scene.children).toBeDefined();
      expect(Array.isArray(scene.children)).toBe(true);
      expect(scene.children.length).toBe(0);
    });

    test('should allow setting Scene properties', () => {
      const scene = new THREE.Scene();
      
      scene.name = 'TestScene';
      scene.background = new THREE.Color(0x123456);
      
      expect(scene.name).toBe('TestScene');
      expect(scene.background).toBeInstanceOf(THREE.Color);
      expect(scene.background.getHex()).toBe(0x123456);
    });

    test('should support fog setting', () => {
      const scene = new THREE.Scene();
      const fog = new THREE.Fog(0xcccccc, 10, 15);
      
      scene.fog = fog;
      
      // scene.fog経由で値を確認
      expect(scene.fog).toBeInstanceOf(THREE.Fog);
      expect((scene.fog as THREE.Fog).color.getHex()).toBe(0xcccccc);
      expect((scene.fog as THREE.Fog).near).toBe(10);
      expect((scene.fog as THREE.Fog).far).toBe(15);
    });
  });

  describe('Camera Creation', () => {
    test('should create a PerspectiveCamera successfully', () => {
      const camera = new THREE.PerspectiveCamera(75, 16/9, 0.1, 1000);
      
      expect(camera).toBeInstanceOf(THREE.PerspectiveCamera);
      expect(camera.type).toBe('PerspectiveCamera');
      expect(camera.fov).toBe(75);
      expect(camera.aspect).toBeCloseTo(16/9);
      expect(camera.near).toBe(0.1);
      expect(camera.far).toBe(1000);
    });

    test('should create an OrthographicCamera successfully', () => {
      const camera = new THREE.OrthographicCamera(-10, 10, 10, -10, 1, 100);
      
      expect(camera).toBeInstanceOf(THREE.OrthographicCamera);
      expect(camera.type).toBe('OrthographicCamera');
      expect(camera.left).toBe(-10);
      expect(camera.right).toBe(10);
      expect(camera.top).toBe(10);
      expect(camera.bottom).toBe(-10);
      expect(camera.near).toBe(1);
      expect(camera.far).toBe(100);
    });

    test('should allow camera position and rotation changes', () => {
      const camera = new THREE.PerspectiveCamera();
      
      camera.position.set(5, 10, 15);
      camera.lookAt(0, 0, 0);
      
      expect(camera.position.x).toBe(5);
      expect(camera.position.y).toBe(10);
      expect(camera.position.z).toBe(15);
      expect(camera.position).toBeInstanceOf(THREE.Vector3);
    });

    test('should update projection matrix correctly', () => {
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
      
      camera.fov = 60;
      camera.updateProjectionMatrix();
      
      expect(camera.fov).toBe(60);
      expect(camera.projectionMatrix).toBeInstanceOf(THREE.Matrix4);
    });
  });

  describe('Mesh Creation', () => {
    test('should create a Mesh with BoxGeometry and MeshBasicMaterial', () => {
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      const mesh = new THREE.Mesh(geometry, material);
      
      expect(mesh).toBeInstanceOf(THREE.Mesh);
      expect(mesh.type).toBe('Mesh');
      expect(mesh.geometry).toBeInstanceOf(THREE.BoxGeometry);
      expect(mesh.material).toBeInstanceOf(THREE.MeshBasicMaterial);
      expect(mesh.material.color.getHex()).toBe(0x00ff00);
    });

    test('should create a Mesh with SphereGeometry and MeshLambertMaterial', () => {
      const geometry = new THREE.SphereGeometry(2, 32, 32);
      const material = new THREE.MeshLambertMaterial({ color: 0xff0000 });
      const mesh = new THREE.Mesh(geometry, material);
      
      expect(mesh).toBeInstanceOf(THREE.Mesh);
      expect(mesh.geometry).toBeInstanceOf(THREE.SphereGeometry);
      expect(mesh.material).toBeInstanceOf(THREE.MeshLambertMaterial);
      expect(mesh.material.color.getHex()).toBe(0xff0000);
    });

    test('should create a Mesh with PlaneGeometry and MeshPhongMaterial', () => {
      const geometry = new THREE.PlaneGeometry(5, 5);
      const material = new THREE.MeshPhongMaterial({ 
        color: 0x0000ff,
        transparent: true,
        opacity: 0.7
      });
      const mesh = new THREE.Mesh(geometry, material);
      
      expect(mesh).toBeInstanceOf(THREE.Mesh);
      expect(mesh.geometry).toBeInstanceOf(THREE.PlaneGeometry);
      expect(mesh.material).toBeInstanceOf(THREE.MeshPhongMaterial);
      expect(mesh.material.transparent).toBe(true);
      expect(mesh.material.opacity).toBe(0.7);
    });

    test('should allow mesh transformations', () => {
      const geometry = new THREE.BoxGeometry();
      const material = new THREE.MeshBasicMaterial();
      const mesh = new THREE.Mesh(geometry, material);
      
      mesh.position.set(1, 2, 3);
      mesh.rotation.set(0.5, 1.0, 1.5);
      mesh.scale.set(2, 3, 4);
      
      expect(mesh.position.x).toBe(1);
      expect(mesh.position.y).toBe(2);
      expect(mesh.position.z).toBe(3);
      expect(mesh.rotation.x).toBe(0.5);
      expect(mesh.rotation.y).toBe(1.0);
      expect(mesh.rotation.z).toBe(1.5);
      expect(mesh.scale.x).toBe(2);
      expect(mesh.scale.y).toBe(3);
      expect(mesh.scale.z).toBe(4);
    });
  });

  describe('Hierarchy and Scene Management', () => {
    test('should add Camera to Scene successfully', () => {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera();
      
      scene.add(camera);
      
      expect(scene.children.length).toBe(1);
      expect(scene.children[0]).toBe(camera);
      expect(camera.parent).toBe(scene);
    });

    test('should add Mesh to Scene successfully', () => {
      const scene = new THREE.Scene();
      const geometry = new THREE.BoxGeometry();
      const material = new THREE.MeshBasicMaterial();
      const mesh = new THREE.Mesh(geometry, material);
      
      scene.add(mesh);
      
      expect(scene.children.length).toBe(1);
      expect(scene.children[0]).toBe(mesh);
      expect(mesh.parent).toBe(scene);
    });

    test('should add multiple objects to Scene', () => {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera();
      const mesh1 = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial());
      const mesh2 = new THREE.Mesh(new THREE.SphereGeometry(), new THREE.MeshBasicMaterial());
      
      scene.add(camera);
      scene.add(mesh1);
      scene.add(mesh2);
      
      expect(scene.children.length).toBe(3);
      expect(scene.children).toContain(camera);
      expect(scene.children).toContain(mesh1);
      expect(scene.children).toContain(mesh2);
    });

    test('should remove objects from Scene', () => {
      const scene = new THREE.Scene();
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial());
      
      scene.add(mesh);
      expect(scene.children.length).toBe(1);
      
      scene.remove(mesh);
      expect(scene.children.length).toBe(0);
      expect(mesh.parent).toBeNull();
    });

    test('should create nested object hierarchies', () => {
      const scene = new THREE.Scene();
      const group = new THREE.Group();
      const mesh1 = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial());
      const mesh2 = new THREE.Mesh(new THREE.SphereGeometry(), new THREE.MeshBasicMaterial());
      
      group.add(mesh1);
      group.add(mesh2);
      scene.add(group);
      
      expect(scene.children.length).toBe(1);
      expect(scene.children[0]).toBe(group);
      expect(group.children.length).toBe(2);
      expect(group.children).toContain(mesh1);
      expect(group.children).toContain(mesh2);
      expect(mesh1.parent).toBe(group);
      expect(mesh2.parent).toBe(group);
    });
  });

  describe('Lights Creation', () => {
    test('should create DirectionalLight successfully', () => {
      const light = new THREE.DirectionalLight(0xffffff, 1);
      
      expect(light).toBeInstanceOf(THREE.DirectionalLight);
      expect(light.type).toBe('DirectionalLight');
      expect(light.color.getHex()).toBe(0xffffff);
      expect(light.intensity).toBe(1);
    });

    test('should create AmbientLight successfully', () => {
      const light = new THREE.AmbientLight(0x404040, 0.5);
      
      expect(light).toBeInstanceOf(THREE.AmbientLight);
      expect(light.type).toBe('AmbientLight');
      expect(light.color.getHex()).toBe(0x404040);
      expect(light.intensity).toBe(0.5);
    });

    test('should create PointLight successfully', () => {
      const light = new THREE.PointLight(0xff0000, 1, 100);
      
      expect(light).toBeInstanceOf(THREE.PointLight);
      expect(light.type).toBe('PointLight');
      expect(light.color.getHex()).toBe(0xff0000);
      expect(light.intensity).toBe(1);
      expect(light.distance).toBe(100);
    });

    test('should add lights to Scene', () => {
      const scene = new THREE.Scene();
      const ambientLight = new THREE.AmbientLight(0x404040);
      const directionalLight = new THREE.DirectionalLight(0xffffff);
      
      scene.add(ambientLight);
      scene.add(directionalLight);
      
      expect(scene.children.length).toBe(2);
      expect(scene.children).toContain(ambientLight);
      expect(scene.children).toContain(directionalLight);
    });
  });

  describe('Material Types', () => {
    test('should create different material types', () => {
      const basicMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const lambertMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
      const phongMaterial = new THREE.MeshPhongMaterial({ color: 0x0000ff });
      const standardMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });
      
      expect(basicMaterial).toBeInstanceOf(THREE.MeshBasicMaterial);
      expect(lambertMaterial).toBeInstanceOf(THREE.MeshLambertMaterial);
      expect(phongMaterial).toBeInstanceOf(THREE.MeshPhongMaterial);
      expect(standardMaterial).toBeInstanceOf(THREE.MeshStandardMaterial);
      
      expect(basicMaterial.type).toBe('MeshBasicMaterial');
      expect(lambertMaterial.type).toBe('MeshLambertMaterial');
      expect(phongMaterial.type).toBe('MeshPhongMaterial');
      expect(standardMaterial.type).toBe('MeshStandardMaterial');
    });

    test('should handle material properties', () => {
      const material = new THREE.MeshStandardMaterial({
        color: 0x156289,
        emissive: 0x072534,
        side: THREE.DoubleSide,
        flatShading: false
      });
      
      expect(material.color.getHex()).toBe(0x156289);
      expect(material.emissive.getHex()).toBe(0x072534);
      expect(material.side).toBe(THREE.DoubleSide);
      expect(material.flatShading).toBe(false);
    });
  });

  describe('Geometry Types', () => {
    test('should create different geometry types', () => {
      const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
      const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
      const planeGeometry = new THREE.PlaneGeometry(1, 1);
      const cylinderGeometry = new THREE.CylinderGeometry(1, 1, 2, 32);
      
      expect(boxGeometry).toBeInstanceOf(THREE.BoxGeometry);
      expect(sphereGeometry).toBeInstanceOf(THREE.SphereGeometry);
      expect(planeGeometry).toBeInstanceOf(THREE.PlaneGeometry);
      expect(cylinderGeometry).toBeInstanceOf(THREE.CylinderGeometry);
      
      expect(boxGeometry.type).toBe('BoxGeometry');
      expect(sphereGeometry.type).toBe('SphereGeometry');
      expect(planeGeometry.type).toBe('PlaneGeometry');
      expect(cylinderGeometry.type).toBe('CylinderGeometry');
    });

    test('should handle geometry attributes', () => {
      const geometry = new THREE.BoxGeometry();
      
      expect(geometry.attributes.position).toBeDefined();
      expect(geometry.attributes.normal).toBeDefined();
      expect(geometry.attributes.uv).toBeDefined();
      expect(geometry.index).toBeDefined();
    });
  });

  describe('Performance Tests', () => {
    test('should create multiple objects within performance threshold', () => {
      const start = performance.now();
      
      const scene = new THREE.Scene();
      
      for (let i = 0; i < 100; i++) {
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
          Math.random() * 20 - 10,
          Math.random() * 20 - 10,
          Math.random() * 20 - 10
        );
        scene.add(mesh);
      }
      
      const duration = performance.now() - start;
      
      expect(scene.children.length).toBe(100);
      expect(duration).toBeLessThan(50); // Should complete in less than 50ms
    });

    test('should handle memory cleanup', () => {
      const geometry = new THREE.BoxGeometry();
      const material = new THREE.MeshBasicMaterial();
      const mesh = new THREE.Mesh(geometry, material);
      
      // Verify objects are created
      expect(geometry).toBeDefined();
      expect(material).toBeDefined();
      expect(mesh).toBeDefined();
      
      // Dispose resources
      geometry.dispose();
      material.dispose();
      
      // Objects should still exist but resources should be cleaned up
      expect(geometry).toBeDefined();
      expect(material).toBeDefined();
    });
  });

  describe('jsdom Environment Compatibility', () => {
    test('should work without WebGL context', () => {
      // This test verifies that Three.js objects can be created in jsdom
      // environment without requiring actual WebGL context
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera();
      const geometry = new THREE.BoxGeometry();
      const material = new THREE.MeshBasicMaterial();
      const mesh = new THREE.Mesh(geometry, material);
      
      scene.add(camera);
      scene.add(mesh);
      
      expect(scene.children.length).toBe(2);
      expect(() => {
        mesh.updateMatrix();
        camera.updateMatrixWorld();
        scene.updateMatrixWorld();
      }).not.toThrow();
    });

    test('should handle matrix calculations in jsdom', () => {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(),
        new THREE.MeshBasicMaterial()
      );
      
      mesh.position.set(5, 10, 15);
      mesh.rotation.set(0.1, 0.2, 0.3);
      mesh.scale.set(2, 3, 4);
      
      mesh.updateMatrix();
      
      expect(mesh.matrix).toBeInstanceOf(THREE.Matrix4);
      expect(mesh.matrix.determinant()).not.toBe(0);
    });
  });
});
