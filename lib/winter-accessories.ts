import * as THREE from 'three';

export interface WinterAccessories {
  group: THREE.Group;
  cap: THREE.Group;
  shawl: THREE.Group;
  update: (time: number, isHovered: boolean) => void;
  dispose: () => void;
}

export function createWinterAccessories(): WinterAccessories {
  const group = new THREE.Group();
  group.name = 'WinterAccessories';

  // --------------------------------------------------------------------------
  // Materials: Knitted Wool & Warm Fabric
  // --------------------------------------------------------------------------
  const capWoolMat = new THREE.MeshStandardMaterial({
    color: 0x9e2424, // Warm crimson red
    roughness: 0.82,
    metalness: 0.05,
  });

  const capCuffMat = new THREE.MeshStandardMaterial({
    color: 0x1b2838, // Deep warm navy ribbed cuff
    roughness: 0.88,
    metalness: 0.05,
  });

  const pompomMat = new THREE.MeshStandardMaterial({
    color: 0xf4f4f6, // Off-white fuzzy pom-pom
    roughness: 0.95,
    metalness: 0.02,
  });

  const shawlWoolMat = new THREE.MeshStandardMaterial({
    color: 0x1b2838, // Rich deep navy scarf with subtle warmth
    roughness: 0.85,
    metalness: 0.05,
  });

  const shawlStripeMat = new THREE.MeshStandardMaterial({
    color: 0xd93a2f, // Studio coral stripe accent
    roughness: 0.82,
    metalness: 0.05,
  });

  // --------------------------------------------------------------------------
  // 1. Winter Beanie Cap (Positioned atop robot cranium, y ~ 3.45)
  // --------------------------------------------------------------------------
  const cap = new THREE.Group();
  cap.name = 'WinterCap';
  cap.position.set(0, 3.48, 0.04);
  cap.rotation.x = -0.08; // Slight backward tilt for natural beanie fit
  group.add(cap);

  // Ribbed Cuff around head base
  const cuffGeo = new THREE.CylinderGeometry(0.74, 0.76, 0.22, 32);
  const cuffMesh = new THREE.Mesh(cuffGeo, capCuffMat);
  cuffMesh.castShadow = true;
  cap.add(cuffMesh);

  // Beanie Dome (Slouch shape)
  const domeGeo = new THREE.SphereGeometry(0.72, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.58);
  const dPos = domeGeo.attributes.position;
  for (let i = 0; i < dPos.count; i++) {
    const y = dPos.getY(i);
    let z = dPos.getZ(i);
    // Slight backward slouch
    if (y > 0.2) {
      z -= (y - 0.2) * 0.25;
      dPos.setZ(i, z);
    }
  }
  domeGeo.computeVertexNormals();

  const domeMesh = new THREE.Mesh(domeGeo, capWoolMat);
  domeMesh.position.y = 0.08;
  domeMesh.castShadow = true;
  cap.add(domeMesh);

  // Top Pom-pom
  const pompomGeo = new THREE.SphereGeometry(0.18, 16, 16);
  const pPos = pompomGeo.attributes.position;
  // Fluff disturbance
  for (let i = 0; i < pPos.count; i++) {
    const vx = pPos.getX(i);
    const vy = pPos.getY(i);
    const vz = pPos.getZ(i);
    const noise = (Math.sin(i * 7.5) + Math.cos(i * 3.2)) * 0.016;
    pPos.setXYZ(i, vx + noise, vy + noise, vz + noise);
  }
  pompomGeo.computeVertexNormals();

  const pompom = new THREE.Mesh(pompomGeo, pompomMat);
  pompom.position.set(0, 0.78, -0.12);
  pompom.castShadow = true;
  cap.add(pompom);

  // --------------------------------------------------------------------------
  // 2. Winter Shawl / Wrapped Scarf (Positioned around neck collar, y ~ 1.95)
  // --------------------------------------------------------------------------
  const shawl = new THREE.Group();
  shawl.name = 'WinterShawl';
  shawl.position.set(0, 1.95, 0.12);
  group.add(shawl);

  // Cozy main neck wrap ring (Torus)
  const wrapGeo = new THREE.TorusGeometry(0.68, 0.14, 16, 36);
  wrapGeo.scale(1.05, 0.85, 0.95);
  const wrapMesh = new THREE.Mesh(wrapGeo, shawlWoolMat);
  wrapMesh.rotation.x = Math.PI / 2 + 0.12;
  wrapMesh.castShadow = true;
  shawl.add(wrapMesh);

  // Second layer wrap for volume
  const wrap2Geo = new THREE.TorusGeometry(0.72, 0.11, 14, 32);
  wrap2Geo.scale(1.02, 0.8, 0.98);
  const wrap2Mesh = new THREE.Mesh(wrap2Geo, shawlStripeMat);
  wrap2Mesh.rotation.x = Math.PI / 2 + 0.22;
  wrap2Mesh.rotation.z = -0.15;
  wrap2Mesh.position.set(0, -0.06, 0.02);
  wrap2Mesh.castShadow = true;
  shawl.add(wrap2Mesh);

  // Draped Scarf Tail falling gracefully over the left shoulder/chest
  const tailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.35, -0.02, 0.45),
    new THREE.Vector3(-0.42, -0.25, 0.52),
    new THREE.Vector3(-0.38, -0.55, 0.54),
    new THREE.Vector3(-0.42, -0.85, 0.48),
  ]);
  const tailGeo = new THREE.TubeGeometry(tailCurve, 24, 0.09, 10, false);
  const tailMesh = new THREE.Mesh(tailGeo, shawlWoolMat);
  tailMesh.castShadow = true;
  shawl.add(tailMesh);

  // Fringe accent at the bottom of the draped tail
  const fringeGeo = new THREE.BoxGeometry(0.18, 0.07, 0.04);
  const fringeMesh = new THREE.Mesh(fringeGeo, shawlStripeMat);
  fringeMesh.position.set(-0.42, -0.88, 0.48);
  shawl.add(fringeMesh);

  return {
    group,
    cap,
    shawl,
    update: (time: number, isHovered: boolean) => {
      // Subtle organic sway and breathing response
      const sway = Math.sin(time * 2.2) * 0.02;
      tailMesh.rotation.z = sway + (isHovered ? 0.05 : 0);
      pompom.position.y = 0.78 + Math.sin(time * 3.4) * 0.015;
    },
    dispose: () => {
      cuffGeo.dispose();
      domeGeo.dispose();
      pompomGeo.dispose();
      wrapGeo.dispose();
      wrap2Geo.dispose();
      tailGeo.dispose();
      fringeGeo.dispose();
      capWoolMat.dispose();
      capCuffMat.dispose();
      pompomMat.dispose();
      shawlWoolMat.dispose();
      shawlStripeMat.dispose();
    },
  };
}
