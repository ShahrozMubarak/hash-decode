import * as THREE from 'three';

export interface WinterAccessories {
  group: THREE.Group;
  shawl: THREE.Group;
  handAccents: THREE.Group;
  update: (time: number, isHovered: boolean) => void;
  dispose: () => void;
}

export function createWinterAccessories(): WinterAccessories {
  const group = new THREE.Group();
  group.name = 'WinterAccessories';

  // --------------------------------------------------------------------------
  // Materials: Azure Navy Cyber Metal & Warm Woven Fabric
  // --------------------------------------------------------------------------
  const azureNavyMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#0B1F3A'), // Deep Azure Navy
    metalness: 0.88,
    roughness: 0.18,
  });

  const azureGlowMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#1E40AF'),
    emissive: new THREE.Color('#00f0ff'), // High-tech cyan-azure edge glow
    emissiveIntensity: 1.8,
    roughness: 0.1,
    metalness: 0.2,
  });

  const shawlWoolMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#0B1F3A'), // Deep Azure Navy wool shawl
    roughness: 0.85,
    metalness: 0.08,
  });

  const shawlStripeMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#d93a2f'), // Studio coral stripe accent
    roughness: 0.82,
    metalness: 0.05,
  });

  // --------------------------------------------------------------------------
  // 1. Robotic Azure Navy Hand Accents & Cyber Gauntlets
  // --------------------------------------------------------------------------
  const handAccents = new THREE.Group();
  handAccents.name = 'AzureNavyHandAccents';
  group.add(handAccents);

  const gauntletGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.24, 24);
  const ringGlowGeo = new THREE.TorusGeometry(0.20, 0.022, 16, 24);
  const knuckleGeo = new THREE.BoxGeometry(0.14, 0.06, 0.16);

  // Left Hand Gauntlet
  const leftGauntlet = new THREE.Group();
  leftGauntlet.position.set(-1.22, 1.38, 0.26);
  leftGauntlet.rotation.z = -0.15;
  leftGauntlet.rotation.x = 0.12;

  const leftCuff = new THREE.Mesh(gauntletGeo, azureNavyMat);
  leftCuff.castShadow = true;
  leftGauntlet.add(leftCuff);

  const leftGlowRing = new THREE.Mesh(ringGlowGeo, azureGlowMat);
  leftGlowRing.rotation.x = Math.PI / 2;
  leftGauntlet.add(leftGlowRing);

  const leftKnuckle = new THREE.Mesh(knuckleGeo, azureNavyMat);
  leftKnuckle.position.set(0, -0.16, 0.06);
  leftKnuckle.castShadow = true;
  leftGauntlet.add(leftKnuckle);

  handAccents.add(leftGauntlet);

  // Right Hand Gauntlet
  const rightGauntlet = new THREE.Group();
  rightGauntlet.position.set(1.22, 1.38, 0.26);
  rightGauntlet.rotation.z = 0.15;
  rightGauntlet.rotation.x = 0.12;

  const rightCuff = new THREE.Mesh(gauntletGeo, azureNavyMat);
  rightCuff.castShadow = true;
  rightGauntlet.add(rightCuff);

  const rightGlowRing = new THREE.Mesh(ringGlowGeo, azureGlowMat);
  rightGlowRing.rotation.x = Math.PI / 2;
  rightGauntlet.add(rightGlowRing);

  const rightKnuckle = new THREE.Mesh(knuckleGeo, azureNavyMat);
  rightKnuckle.position.set(0, -0.16, 0.06);
  rightKnuckle.castShadow = true;
  rightGauntlet.add(rightKnuckle);

  handAccents.add(rightGauntlet);

  // --------------------------------------------------------------------------
  // 2. Winter Shawl / Wrapped Scarf (Positioned around neck collar, y ~ 1.95)
  // (Cap removed completely per user request)
  // --------------------------------------------------------------------------
  const shawl = new THREE.Group();
  shawl.name = 'WinterShawl';
  shawl.position.set(0, 1.95, 0.12);
  group.add(shawl);

  // Main Azure Navy neck wrap ring (Torus)
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

  // Draped Scarf Tail falling over the left chest
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
    shawl,
    handAccents,
    update: (time: number, isHovered: boolean) => {
      // Organic sway
      const sway = Math.sin(time * 2.2) * 0.02;
      tailMesh.rotation.z = sway + (isHovered ? 0.05 : 0);

      // Subtle hand cyber pulse
      const pulse = 1.6 + Math.sin(time * 4.0) * 0.4 + (isHovered ? 0.8 : 0);
      azureGlowMat.emissiveIntensity = pulse;

      // Slight reactive hand movement on hover
      leftGauntlet.position.y = 1.38 + Math.sin(time * 1.8) * 0.02 + (isHovered ? 0.04 : 0);
      rightGauntlet.position.y = 1.38 + Math.sin(time * 1.8 + 0.4) * 0.02 + (isHovered ? 0.04 : 0);
    },
    dispose: () => {
      gauntletGeo.dispose();
      ringGlowGeo.dispose();
      knuckleGeo.dispose();
      wrapGeo.dispose();
      wrap2Geo.dispose();
      tailGeo.dispose();
      fringeGeo.dispose();
      azureNavyMat.dispose();
      azureGlowMat.dispose();
      shawlWoolMat.dispose();
      shawlStripeMat.dispose();
    },
  };
}
