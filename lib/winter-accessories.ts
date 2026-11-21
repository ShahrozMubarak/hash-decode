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
  // 1. Robotic Azure Navy Hand Accents (STRICTLY ON HANDS, NOT ARMS)
  // --------------------------------------------------------------------------
  const handAccents = new THREE.Group();
  handAccents.name = 'AzureNavyHandAccents';
  group.add(handAccents);

  // Dorsal hand plates, knuckle guards, and cyber finger caps (strictly on the hands)
  const handPlateGeo = new THREE.BoxGeometry(0.13, 0.14, 0.035);
  const knuckleBarGeo = new THREE.BoxGeometry(0.12, 0.035, 0.045);
  const palmDiscGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.02, 16);
  const fingerGeo = new THREE.BoxGeometry(0.022, 0.055, 0.028);

  // Left Hand (Placed directly over the robot's left palm/hand at y ≈ 1.08, z ≈ 0.38)
  const leftHand = new THREE.Group();
  leftHand.position.set(-1.18, 1.08, 0.38);
  leftHand.rotation.set(0.18, -0.12, -0.22);

  // Dorsal hand shield plate in deep Azure Navy
  const leftPlate = new THREE.Mesh(handPlateGeo, azureNavyMat);
  leftPlate.castShadow = true;
  leftHand.add(leftPlate);

  // Knuckle guard bar with glowing edge indicator
  const leftKnuckle = new THREE.Mesh(knuckleBarGeo, azureNavyMat);
  leftKnuckle.position.set(0, -0.075, 0.01);
  leftHand.add(leftKnuckle);

  const leftPalmDisc = new THREE.Mesh(palmDiscGeo, azureGlowMat);
  leftPalmDisc.rotation.x = Math.PI / 2;
  leftPalmDisc.position.set(0, 0, 0.02);
  leftHand.add(leftPalmDisc);

  // 4 Cyber finger armor segments along the knuckles
  [-0.042, -0.014, 0.014, 0.042].forEach((xOff) => {
    const finger = new THREE.Mesh(fingerGeo, azureNavyMat);
    finger.position.set(xOff, -0.11, 0.01);
    leftHand.add(finger);
  });

  handAccents.add(leftHand);

  // Right Hand (Placed directly over the robot's right palm/hand at y ≈ 1.08, z ≈ 0.38)
  const rightHand = new THREE.Group();
  rightHand.position.set(1.18, 1.08, 0.38);
  rightHand.rotation.set(0.18, 0.12, 0.22);

  // Dorsal hand shield plate in deep Azure Navy
  const rightPlate = new THREE.Mesh(handPlateGeo, azureNavyMat);
  rightPlate.castShadow = true;
  rightHand.add(rightPlate);

  // Knuckle guard bar with glowing edge indicator
  const rightKnuckle = new THREE.Mesh(knuckleBarGeo, azureNavyMat);
  rightKnuckle.position.set(0, -0.075, 0.01);
  rightHand.add(rightKnuckle);

  const rightPalmDisc = new THREE.Mesh(palmDiscGeo, azureGlowMat);
  rightPalmDisc.rotation.x = Math.PI / 2;
  rightPalmDisc.position.set(0, 0, 0.02);
  rightHand.add(rightPalmDisc);

  // 4 Cyber finger armor segments along the knuckles
  [-0.042, -0.014, 0.014, 0.042].forEach((xOff) => {
    const finger = new THREE.Mesh(fingerGeo, azureNavyMat);
    finger.position.set(xOff, -0.11, 0.01);
    rightHand.add(finger);
  });

  handAccents.add(rightHand);

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

      // Slight reactive hand movement on hover (strictly on hands at y ≈ 1.08)
      leftHand.position.y = 1.08 + Math.sin(time * 1.8) * 0.015 + (isHovered ? 0.025 : 0);
      rightHand.position.y = 1.08 + Math.sin(time * 1.8 + 0.4) * 0.015 + (isHovered ? 0.025 : 0);
    },
    dispose: () => {
      handPlateGeo.dispose();
      knuckleBarGeo.dispose();
      palmDiscGeo.dispose();
      fingerGeo.dispose();
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
