import * as THREE from 'three';

export interface HoodedRobotInstance {
  group: THREE.Group;
  headGroup: THREE.Group;
  cloakGroup: THREE.Group;
  matAmberGlow: THREE.MeshStandardMaterial;
  earLightLeft: THREE.PointLight;
  earLightRight: THREE.PointLight;
  particles: THREE.Points;
  update: (time: number, mouseYaw: number, mousePitch: number) => void;
  dispose: () => void;
}

export function createHoodedRobot(): HoodedRobotInstance {
  const robot = new THREE.Group();

  // ------------------------------------------------------------
  // 1. PROCEDURAL TEXTURES & MATERIALS
  // ------------------------------------------------------------
  function createFabricBumpTexture(): THREE.CanvasTexture | null {
    if (typeof document === 'undefined') return null;
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, size, size);

    // Woven cross-hatch micro texture
    for (let y = 0; y < size; y += 2) {
      for (let x = 0; x < size; x += 2) {
        const weave = (x + y) % 4 === 0 ? 28 : -20;
        const noise = (Math.random() - 0.5) * 18;
        const v = Math.max(0, Math.min(255, 128 + weave + noise));
        ctx.fillStyle = `rgb(${v},${v},${v})`;
        ctx.fillRect(x, y, 2, 2);
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(14, 14);
    return tex;
  }

  function createArmorDetailTexture(): THREE.CanvasTexture | null {
    if (typeof document === 'undefined') return null;
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = '#7f7f7f';
    ctx.fillRect(0, 0, size, size);

    // Brushed metal + panel seams
    ctx.strokeStyle = '#383838';
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      const y = 60 + i * 78;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size * 0.35, y);
      ctx.lineTo(size * 0.45, y + 18);
      ctx.lineTo(size, y + 18);
      ctx.stroke();
    }
    for (let i = 0; i < 600; i++) {
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.04})`;
      ctx.fillRect(Math.random() * size, Math.random() * size, 30, 1);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  const fabricBump = createFabricBumpTexture();
  const armorBump = createArmorDetailTexture();

  const matDarkArmor = new THREE.MeshStandardMaterial({
    color: 0x202c35,
    metalness: 0.82,
    roughness: 0.34,
    bumpMap: armorBump || undefined,
    bumpScale: 0.015,
  });

  const matGunmetal = new THREE.MeshStandardMaterial({
    color: 0x33444f,
    metalness: 0.88,
    roughness: 0.28,
    bumpMap: armorBump || undefined,
    bumpScale: 0.01,
  });

  const matInnerMech = new THREE.MeshStandardMaterial({
    color: 0x11171c,
    metalness: 0.75,
    roughness: 0.55,
  });

  const matCloakOuter = new THREE.MeshStandardMaterial({
    color: 0x264852,
    metalness: 0.08,
    roughness: 0.86,
    bumpMap: fabricBump || undefined,
    bumpScale: 0.028,
    side: THREE.DoubleSide,
  });

  const matCloakInner = new THREE.MeshStandardMaterial({
    color: 0x11252c,
    metalness: 0.05,
    roughness: 0.92,
    bumpMap: fabricBump || undefined,
    bumpScale: 0.02,
    side: THREE.DoubleSide,
  });

  const matGoldTrim = new THREE.MeshStandardMaterial({
    color: 0xd19438,
    metalness: 0.85,
    roughness: 0.28,
    emissive: 0x6b3a00,
    emissiveIntensity: 0.45,
  });

  const matAmberGlow = new THREE.MeshStandardMaterial({
    color: 0xffc14d,
    emissive: 0xff8c1a,
    emissiveIntensity: 3.4,
    roughness: 0.2,
    metalness: 0.1,
  });

  const matSoftAmberGlow = new THREE.MeshStandardMaterial({
    color: 0xffaa33,
    emissive: 0xff6a00,
    emissiveIntensity: 2.2,
    roughness: 0.3,
  });

  // ------------------------------------------------------------
  // 2. HEAD & CYBERNETIC FACEPLATE
  // ------------------------------------------------------------
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.58, 0.08);
  headGroup.rotation.set(0.06, 0.22, -0.04);
  robot.add(headGroup);

  // Sculpted cranium
  const craniumGeo = new THREE.SphereGeometry(0.46, 48, 36);
  const pos = craniumGeo.attributes.position;
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    v.z *= 1.18;
    v.x *= 0.84;
    if (v.y < 0) {
      const t = Math.min(1, -v.y / 0.46);
      v.x *= 1 - t * 0.28;
      if (v.z > 0) v.z *= 1 + t * 0.08;
    }
    if (v.z > 0.24) {
      v.z = 0.24 + (v.z - 0.24) * 0.65;
    }
    if (v.z > 0.2 && v.y > 0.05 && v.y < 0.18) {
      v.z += 0.035;
    }
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  craniumGeo.computeVertexNormals();
  const cranium = new THREE.Mesh(craniumGeo, matDarkArmor);
  cranium.castShadow = true;
  headGroup.add(cranium);

  // Front armored faceplate
  const faceShape = new THREE.Shape();
  faceShape.moveTo(0, 0.34);
  faceShape.lineTo(0.24, 0.26);
  faceShape.lineTo(0.28, -0.02);
  faceShape.lineTo(0.16, -0.34);
  faceShape.lineTo(0, -0.42);
  faceShape.lineTo(-0.16, -0.34);
  faceShape.lineTo(-0.28, -0.02);
  faceShape.lineTo(-0.24, 0.26);
  faceShape.closePath();

  const faceGeo = new THREE.ExtrudeGeometry(faceShape, {
    depth: 0.12,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.035,
    bevelSegments: 3,
  });
  faceGeo.center();
  const fPos = faceGeo.attributes.position;
  for (let i = 0; i < fPos.count; i++) {
    const x = fPos.getX(i);
    const y = fPos.getY(i);
    let z = fPos.getZ(i);
    z -= x * x * 1.45;
    if (y > 0.1) z -= (y - 0.1) * 0.35;
    fPos.setZ(i, z);
  }
  faceGeo.computeVertexNormals();

  const faceplate = new THREE.Mesh(faceGeo, matGunmetal);
  faceplate.position.set(0, -0.02, 0.43);
  faceplate.castShadow = true;
  headGroup.add(faceplate);

  // Center vertical faceplate seam
  const seamGeo = new THREE.BoxGeometry(0.016, 0.56, 0.04);
  const seam = new THREE.Mesh(seamGeo, matInnerMech);
  seam.position.set(0, -0.02, 0.49);
  headGroup.add(seam);

  // Chin mandible plate
  const chinGeo = new THREE.BoxGeometry(0.22, 0.14, 0.22);
  const chin = new THREE.Mesh(chinGeo, matDarkArmor);
  chin.position.set(0, -0.34, 0.26);
  chin.rotation.x = 0.35;
  headGroup.add(chin);

  // Cheeks & Hexagonal Emblems
  for (const side of [-1, 1]) {
    const cheekPlate = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.22, 0.26), matDarkArmor);
    cheekPlate.position.set(side * 0.27, -0.08, 0.15);
    cheekPlate.rotation.y = side * 0.38;
    cheekPlate.rotation.z = side * -0.12;
    headGroup.add(cheekPlate);

    const hexOuter = new THREE.Mesh(new THREE.RingGeometry(0.035, 0.046, 6), matAmberGlow);
    hexOuter.position.set(side * 0.32, -0.01, 0.23);
    hexOuter.rotation.y = side * 0.72;
    headGroup.add(hexOuter);

    const slit = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.012, 0.02), matSoftAmberGlow);
    slit.position.set(side * 0.12, 0.08, 0.475);
    slit.rotation.y = side * 0.24;
    slit.rotation.z = side * -0.14;
    headGroup.add(slit);
  }

  // Cranial ridge plates
  for (let i = 0; i < 3; i++) {
    const plate = new THREE.Mesh(new THREE.BoxGeometry(0.24 - i * 0.03, 0.06, 0.26), matGunmetal);
    plate.position.set(0, 0.34 - i * 0.05, 0.18 + i * 0.06);
    plate.rotation.x = 0.45 + i * 0.18;
    headGroup.add(plate);
  }

  // Cybernetic Ear Cores & Conduits
  const earLightLeft = new THREE.PointLight(0xff8a1f, 3.4, 2.5, 1.8);
  const earLightRight = new THREE.PointLight(0xff8a1f, 3.4, 2.5, 1.8);

  for (const side of [-1, 1]) {
    const earGroup = new THREE.Group();
    earGroup.position.set(side * 0.38, 0.02, -0.02);
    earGroup.rotation.y = side * (Math.PI / 2);
    headGroup.add(earGroup);

    const housing = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.09, 24), matInnerMech);
    housing.rotation.x = Math.PI / 2;
    earGroup.add(housing);

    const bezel = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.022, 12, 32), matGunmetal);
    bezel.position.z = 0.04;
    earGroup.add(bezel);

    const glowRing = new THREE.Mesh(new THREE.TorusGeometry(0.115, 0.014, 12, 32), matAmberGlow);
    glowRing.position.z = 0.045;
    earGroup.add(glowRing);

    const coreHex = new THREE.Mesh(new THREE.RingGeometry(0.03, 0.075, 6), matAmberGlow);
    coreHex.position.z = 0.048;
    earGroup.add(coreHex);

    for (let s = 0; s < 6; s++) {
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.11, 0.02), matDarkArmor);
      const ang = (s / 6) * Math.PI * 2;
      spoke.position.set(Math.cos(ang) * 0.075, Math.sin(ang) * 0.075, 0.046);
      spoke.rotation.z = ang + Math.PI / 2;
      earGroup.add(spoke);
    }

    const conduitCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.36, -0.06, -0.02),
      new THREE.Vector3(side * 0.33, -0.22, -0.1),
      new THREE.Vector3(side * 0.25, -0.42, -0.06),
      new THREE.Vector3(side * 0.18, -0.58, 0.06),
    ]);
    const conduit = new THREE.Mesh(new THREE.TubeGeometry(conduitCurve, 24, 0.014, 8, false), matAmberGlow);
    headGroup.add(conduit);

    const cableCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.34, -0.1, 0.05),
      new THREE.Vector3(side * 0.28, -0.32, 0.02),
      new THREE.Vector3(side * 0.16, -0.56, 0.1),
    ]);
    const cable = new THREE.Mesh(new THREE.TubeGeometry(cableCurve, 20, 0.024, 10, false), matInnerMech);
    headGroup.add(cable);
  }

  earLightLeft.position.set(-0.55, 0.56, 0.12);
  headGroup.add(earLightLeft);

  earLightRight.position.set(0.55, 0.56, 0.12);
  headGroup.add(earLightRight);

  // ------------------------------------------------------------
  // 3. NECK & UPPER TORSO
  // ------------------------------------------------------------
  const torsoGroup = new THREE.Group();
  robot.add(torsoGroup);

  for (let i = 0; i < 6; i++) {
    const ring = new THREE.Mesh(
      new THREE.CylinderGeometry(0.19 - i * 0.008, 0.21 - i * 0.008, 0.055, 24),
      i % 2 === 0 ? matInnerMech : matDarkArmor
    );
    ring.position.set(0, -0.05 + i * 0.068, 0.02);
    torsoGroup.add(ring);
  }

  for (const side of [-1, 1]) {
    const piston = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.038, 0.42, 12), matGunmetal);
    piston.position.set(side * 0.16, 0.12, 0.12);
    piston.rotation.z = side * 0.18;
    piston.rotation.x = -0.15;
    torsoGroup.add(piston);
  }

  const chestGeo = new THREE.CylinderGeometry(0.56, 0.44, 0.9, 16);
  const chest = new THREE.Mesh(chestGeo, matDarkArmor);
  chest.scale.set(1.18, 1, 0.72);
  chest.position.set(0, -0.58, 0.0);
  torsoGroup.add(chest);

  const chestGlow = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.28, 0.04), matSoftAmberGlow);
  chestGlow.position.set(0, -0.45, 0.39);
  torsoGroup.add(chestGlow);

  // Exposed mechanical left shoulder
  const armGroup = new THREE.Group();
  armGroup.position.set(-0.74, -0.58, 0.06);
  armGroup.rotation.z = 0.18;
  torsoGroup.add(armGroup);

  const shoulderJoint = new THREE.Mesh(new THREE.SphereGeometry(0.22, 20, 16), matInnerMech);
  armGroup.add(shoulderJoint);

  for (let i = 0; i < 4; i++) {
    const seg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.17, 0.15, 0.11, 18),
      i % 2 === 0 ? matGunmetal : matDarkArmor
    );
    seg.position.y = -0.18 - i * 0.115;
    armGroup.add(seg);
  }

  // ------------------------------------------------------------
  // 4. PROCEDURAL HOOD & LAYERED COWL
  // ------------------------------------------------------------
  function createHoodGeometry(inset = 0) {
    const uSegs = 56;
    const vSegs = 32;
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    const rimPoints: THREE.Vector3[] = [];

    for (let iv = 0; iv <= vSegs; iv++) {
      const v = iv / vSegs;
      for (let iu = 0; iu <= uSegs; iu++) {
        const u = iu / uSegs;
        const theta = (u - 0.5) * Math.PI * 1.52;
        const rx = 0.56 - inset;
        const ry = 0.64 - inset;

        let x = Math.sin(theta) * rx;
        let y = 0.54 + Math.cos(theta) * ry;
        let z = 0.36 - Math.abs(Math.sin(theta)) * 0.34;

        const peakFactor = Math.pow(Math.max(0, Math.cos(theta)), 3);
        y += peakFactor * 0.16 * (1 - v * 0.6);
        z += peakFactor * 0.22 * (1 - v);

        const sweepAngle = v * Math.PI * 0.62;
        const backPush = Math.sin(sweepAngle) * 0.72;
        z -= backPush;
        y -= Math.pow(v, 1.45) * 0.55;

        const flare = Math.pow(v, 1.3) * (1 - Math.abs(Math.cos(theta)) * 0.45);
        x *= 1 + flare * 0.42;

        const fold1 = Math.sin(theta * 5.0 + v * 4.5) * 0.032 * (0.3 + v * 0.7);
        const fold2 = Math.cos(theta * 9.0 - v * 3.0) * 0.015 * v;
        const radial = new THREE.Vector2(x, y - 0.45).normalize();
        x += radial.x * (fold1 + fold2);
        y += radial.y * (fold1 + fold2);
        z += Math.sin(u * Math.PI * 6 + v * 5) * 0.025 * v;

        positions.push(x, y, z);
        uvs.push(u, v);

        if (iv === 0 && inset === 0) {
          rimPoints.push(new THREE.Vector3(x, y, z));
        }
      }
    }

    for (let iv = 0; iv < vSegs; iv++) {
      for (let iu = 0; iu < uSegs; iu++) {
        const a = iv * (uSegs + 1) + iu;
        const b = a + 1;
        const c = (iv + 1) * (uSegs + 1) + iu;
        const d = c + 1;
        indices.push(a, c, b);
        indices.push(b, c, d);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return { geo, rimPoints };
  }

  const cloakGroup = new THREE.Group();
  robot.add(cloakGroup);

  const outerHoodData = createHoodGeometry(0);
  const outerHood = new THREE.Mesh(outerHoodData.geo, matCloakOuter);
  outerHood.castShadow = true;
  cloakGroup.add(outerHood);

  const innerHoodData = createHoodGeometry(0.025);
  const innerHood = new THREE.Mesh(innerHoodData.geo, matCloakInner);
  cloakGroup.add(innerHood);

  const rimCurve = new THREE.CatmullRomCurve3(outerHoodData.rimPoints);
  const rimTrim = new THREE.Mesh(new THREE.TubeGeometry(rimCurve, 64, 0.012, 8, false), matGoldTrim);
  cloakGroup.add(rimTrim);

  const cowlConfigs = [
    { y: -0.04, rX: 0.64, rZ: 0.52, tiltX: 0.22, tiltZ: 0.12, tube: 0.14, folds: 7 },
    { y: -0.24, rX: 0.78, rZ: 0.58, tiltX: 0.18, tiltZ: -0.14, tube: 0.17, folds: 6 },
    { y: -0.46, rX: 0.92, rZ: 0.64, tiltX: 0.12, tiltZ: 0.08, tube: 0.2, folds: 8 },
    { y: -0.72, rX: 1.02, rZ: 0.68, tiltX: 0.08, tiltZ: -0.06, tube: 0.22, folds: 7 },
  ];

  cowlConfigs.forEach((cfg, idx) => {
    const pts: THREE.Vector3[] = [];
    const steps = 40;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * Math.PI * 2;
      const frontFactor = Math.max(0, Math.sin(t));
      const wave = Math.sin(t * cfg.folds + idx * 1.3) * 0.045;
      const x = Math.cos(t) * (cfg.rX + wave);
      const z = Math.sin(t) * (cfg.rZ + wave * 0.7);
      const y = cfg.y - frontFactor * (0.14 + idx * 0.03) + Math.cos(t * 3 + idx) * 0.04;
      pts.push(new THREE.Vector3(x, y, z));
    }
    const curve = new THREE.CatmullRomCurve3(pts, true);
    const geo = new THREE.TubeGeometry(curve, 72, cfg.tube, 14, true);

    const cPos = geo.attributes.position;
    for (let i = 0; i < cPos.count; i++) {
      const vx = cPos.getX(i);
      const vy = cPos.getY(i);
      const vz = cPos.getZ(i);
      const angle = Math.atan2(vz, vx);
      const crease = Math.sin(angle * 12 + vy * 18) * 0.018;
      cPos.setXYZ(i, vx + crease, vy * 1.12, vz + crease);
    }
    geo.computeVertexNormals();

    const cowlMesh = new THREE.Mesh(geo, idx % 2 === 0 ? matCloakOuter : matCloakInner);
    cowlMesh.rotation.set(cfg.tiltX, 0, cfg.tiltZ);
    cowlMesh.castShadow = true;
    cloakGroup.add(cowlMesh);
  });

  const mantleGeo = new THREE.CylinderGeometry(0.78, 1.18, 0.95, 48, 16, true, 0.35, Math.PI * 1.78);
  const mPos = mantleGeo.attributes.position;
  for (let i = 0; i < mPos.count; i++) {
    let x = mPos.getX(i);
    const y = mPos.getY(i);
    let z = mPos.getZ(i);
    const ang = Math.atan2(x, z);
    const fold = Math.sin(ang * 9 + y * 3.5) * 0.065;
    x *= 1 + fold;
    z *= 0.72 * (1 + fold);
    mPos.setXYZ(i, x, y, z);
  }
  mantleGeo.computeVertexNormals();

  const mantle = new THREE.Mesh(mantleGeo, matCloakOuter);
  mantle.position.set(0, -0.78, -0.04);
  mantle.rotation.y = Math.PI;
  mantle.castShadow = true;
  cloakGroup.add(mantle);

  // ------------------------------------------------------------
  // 5. FLOATING ATMOSPHERIC PARTICLES
  // ------------------------------------------------------------
  const particleCount = 100;
  const pPositions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    pPositions[i * 3 + 0] = (Math.random() - 0.5) * 6.0;
    pPositions[i * 3 + 1] = (Math.random() - 0.5) * 4.0;
    pPositions[i * 3 + 2] = (Math.random() - 0.5) * 4.5;
  }
  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0x8ef2ff,
    size: 0.024,
    transparent: true,
    opacity: 0.45,
    blending: THREE.AdditiveBlending,
  });
  const particles = new THREE.Points(particleGeo, particleMat);

  // Position & Scale to fit hero canvas
  robot.position.set(0, -0.05, 0);
  robot.scale.setScalar(1.25);

  return {
    group: robot,
    headGroup,
    cloakGroup,
    matAmberGlow,
    earLightLeft,
    earLightRight,
    particles,
    update: (t: number, mouseYaw: number, mousePitch: number) => {
      // Idle breathing presence
      robot.position.y = -0.05 + Math.sin(t * 1.1) * 0.025;
      cloakGroup.scale.y = 1 + Math.sin(t * 1.1 - 0.4) * 0.008;

      // Scanning head motion blended with cursor
      headGroup.rotation.y = 0.22 + Math.sin(t * 0.55) * 0.08 + mouseYaw * 0.45;
      headGroup.rotation.x = 0.06 + Math.sin(t * 0.85) * 0.025 + mousePitch * 0.35;

      // Pulsing amber energy
      const pulse = 2.8 + Math.sin(t * 3.2) * 0.65;
      matAmberGlow.emissiveIntensity = pulse;
      earLightLeft.intensity = 2.6 + Math.sin(t * 3.2) * 0.8;
      earLightRight.intensity = 2.6 + Math.sin(t * 3.2) * 0.8;

      // Particles drift
      particles.rotation.y = t * 0.03;
    },
    dispose: () => {
      fabricBump?.dispose();
      armorBump?.dispose();
      matDarkArmor.dispose();
      matGunmetal.dispose();
      matInnerMech.dispose();
      matCloakOuter.dispose();
      matCloakInner.dispose();
      matGoldTrim.dispose();
      matAmberGlow.dispose();
      matSoftAmberGlow.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    },
  };
}
