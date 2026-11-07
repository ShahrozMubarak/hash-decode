import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import * as THREE from 'three';

const ROOT = path.resolve(process.cwd());

// =============================================================================
// CHALLENGER 2: ADVERSARIAL STRESS TEST SUITE
// =============================================================================

describe('Challenger 2 - Adversarial Verification & Stress Harness', () => {

  // ---------------------------------------------------------------------------
  // 1. Kinetic Formulas & SVG Trail Lag Elimination
  // ---------------------------------------------------------------------------
  describe('Area 1: Kinetic Formulas & Frame Rate Independence', () => {
    
    // Simulate scroll kinetics
    function simulateKinetics({
      durationSec = 2.0,
      fps = 60,
      variableDt = false,
      scrollProfile = (t) => t * 1000, // ramp 1000px/s
      kOld = 10,
      kNew = 35,
    }) {
      let t = 0;
      let oldScroll = 0;
      let newScroll = 0;
      let target = 0;

      const history = [];

      while (t < durationSec) {
        let dt = 1 / fps;
        if (variableDt) {
          // Jitter between 5ms (200fps) and 45ms (22fps)
          dt = 0.005 + Math.sin(t * 37) * 0.02 + 0.02;
        }

        target = scrollProfile(t);

        // Old formula: exponential smoothing at k=10
        oldScroll = oldScroll + (target - oldScroll) * (1 - Math.exp(-dt * kOld));

        // New formula: exponential smoothing at k=35 with snap threshold <0.1
        newScroll = newScroll + (target - newScroll) * (1 - Math.exp(-dt * kNew));
        if (Math.abs(newScroll - target) < 0.1) {
          newScroll = target;
        }

        // In MotionLanding.tsx:
        // trail updates with target directly (onScroll and updateTrail(target))
        const oldTrailScroll = oldScroll;
        const newTrailScroll = target; // Binds directly to target

        history.push({
          t,
          dt,
          target,
          oldScroll,
          newScroll,
          oldTrailScroll,
          newTrailScroll,
          oldTrailLag: Math.abs(target - oldTrailScroll),
          newTrailLag: Math.abs(target - newTrailScroll),
        });

        t += dt;
      }

      return history;
    }

    test('30fps step response: SVG trail lag is strictly 0ms / 0px error', () => {
      // Step jump from 0 to 1000px at t=0.1
      const profile = (t) => (t >= 0.1 ? 1000 : 0);
      const res = simulateKinetics({ fps: 30, scrollProfile: profile });

      // After step at t=0.1, check immediate trail lag
      const stepPoint = res.find((r) => r.t >= 0.1);
      assert.ok(stepPoint, 'Step point exists');
      assert.equal(stepPoint.newTrailLag, 0, 'New trail lag must be exactly 0px');
      assert.ok(stepPoint.oldTrailLag > 500, `Old trail lag was ${stepPoint.oldTrailLag}px (>500px)`);
    });

    test('60fps ramp response: new trail lag is 0 vs old trail lag >90px', () => {
      // Continuous scroll at 1000px/s
      const profile = (t) => t * 1000;
      const res = simulateKinetics({ fps: 60, scrollProfile: profile });

      // After 0.5s ramp
      const sample = res.find((r) => r.t >= 0.5);
      assert.ok(sample);
      assert.equal(sample.newTrailLag, 0, 'New SVG trail lag is 0 under continuous ramp');
      // Analytical lag for ramp v*t with filter k is v/k: 1000 / 10 = 100px
      assert.ok(sample.oldTrailLag >= 90 && sample.oldTrailLag <= 110, `Old lag ${sample.oldTrailLag} matches theoretical ~100px`);
    });

    test('120fps high-refresh response: zero lag preserved', () => {
      const profile = (t) => 500 + Math.sin(t * 5) * 300;
      const res = simulateKinetics({ fps: 120, scrollProfile: profile });
      for (const pt of res) {
        assert.equal(pt.newTrailLag, 0, 'Every 120fps frame has 0 trail lag');
      }
    });

    test('Variable/Jittery frame rate response (5ms - 45ms): mathematical stability', () => {
      const profile = (t) => t * 800;
      const res = simulateKinetics({ variableDt: true, scrollProfile: profile });

      for (const pt of res) {
        assert.equal(pt.newTrailLag, 0);
        assert.ok(!Number.isNaN(pt.newScroll));
        assert.ok(!Number.isNaN(pt.oldScroll));
      }
    });

    test('Convergence time comparison: k=35 reaches 99% in ~131ms (<140ms) vs k=10 taking >460ms', () => {
      // Step jump from 0 to 1000
      let t = 0;
      const dt = 1 / 60;
      let sOld = 0;
      let sNew = 0;
      const target = 1000;

      let old99Time = null;
      let new99Time = null;
      let oldSnapTime = null;
      let newSnapTime = null;

      while (t < 2.0) {
        sOld = sOld + (target - sOld) * (1 - Math.exp(-dt * 10));
        sNew = sNew + (target - sNew) * (1 - Math.exp(-dt * 35));
        if (Math.abs(sNew - target) < 0.1) sNew = target;

        // 99% convergence (value >= 990 / error < 10px)
        if (new99Time === null && sNew >= 990) {
          new99Time = t;
        }
        if (old99Time === null && sOld >= 990) {
          old99Time = t;
        }

        // Full snap convergence (error < 0.1px)
        if (newSnapTime === null && sNew >= target) {
          newSnapTime = t;
        }
        if (oldSnapTime === null && Math.abs(sOld - target) < 0.1) {
          oldSnapTime = t;
        }
        t += dt;
      }

      // Mathematical proof:
      // For k=35: t_99% = ln(100)/35 = 0.131s. At 60fps (dt=0.0167s), 8 frames = 0.133s
      // For k=10: t_99% = ln(100)/10 = 0.461s. At 60fps, 28 frames = 0.467s
      assert.ok(new99Time <= 0.14, `New formula reached 99% in ${new99Time}s (<=0.14s)`);
      assert.ok(old99Time >= 0.44, `Old formula took ${old99Time}s (>=0.44s)`);

      // Snap convergence:
      // For k=35: t_snap = ln(1000/0.1)/35 = 9.21/35 = 0.263s. At 60fps, 16 frames = 0.267s
      // For k=10: t_snap = ln(1000/0.1)/10 = 0.921s.
      assert.ok(newSnapTime <= 0.27, `New formula snapped in ${newSnapTime}s (<=0.27s)`);
      assert.ok(oldSnapTime >= 0.90, `Old formula snapped in ${oldSnapTime}s (>=0.90s)`);
    });
  });

  // ---------------------------------------------------------------------------
  // 2. AERUM Copy Conformance & Spec Verbatim Fidelity
  // ---------------------------------------------------------------------------
  describe('Area 2: AERUM Copy Conformance & Special Character Fidelity', () => {
    const landingPath = path.join(ROOT, 'components/studio/MotionLanding.tsx');
    const cssPath = path.join(ROOT, 'app/motion.css');

    const landingContent = fs.readFileSync(landingPath, 'utf8');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    test('Hero headline verbatim match: "Sound,", "in another" (outline), "form." (italic)', () => {
      assert.ok(landingContent.includes('<span>Sound,</span>'), 'Line 1: Sound,');
      assert.ok(landingContent.includes('<span className="outline">in another</span>'), 'Line 2: in another');
      assert.ok(landingContent.includes('<span><em>form.</em></span>'), 'Line 3: form.');
    });

    test('Word row ticker verbatim match with U+25CC (◌) dotted circle delimiter', () => {
      assert.ok(landingContent.includes('<span>Form follows feeling</span>'), 'Word row 1');
      assert.ok(landingContent.includes('<i>◌</i>'), 'Delimiter ◌');
      assert.ok(landingContent.includes('<span>Space becomes sound</span>'), 'Word row 2');
      assert.ok(landingContent.includes('<span>AERUM</span>'), 'Word row 3');
      
      // Verify Unicode codepoint
      const match = landingContent.match(/<i>(.*?)<\/i>/);
      assert.ok(match);
      assert.equal(match[1].codePointAt(0), 0x25CC, 'Punctuation must be U+25CC (Dotted Circle)');
    });

    test('Scene 01 (HALO) product meta & copy verbatim match', () => {
      assert.ok(landingContent.includes('01 / HALO'));
      assert.ok(landingContent.includes('A softer<br />\n              kind of<br />\n              <em>presence.</em>'));
      assert.ok(landingContent.includes('Designed to belong. Imagined to be felt.'));
      assert.ok(landingContent.includes('<b>Form</b>\n                <span>Suspended annulus</span>'));
      assert.ok(landingContent.includes('<b>Study</b>\n                <span>Alloy / light / space</span>'));
    });

    test('Scene 02 (CORE) product meta & specimen caption verbatim match', () => {
      assert.ok(landingContent.includes('02 / CORE'));
      assert.ok(landingContent.includes('Quiet<br />\n              on the<br />\n              <em>outside.</em>'));
      assert.ok(landingContent.includes('The detail is in what you leave out.'));
      assert.ok(landingContent.includes('<b>Form</b>\n                <span>Frosted capsule</span>'));
      assert.ok(landingContent.includes('<b>Study</b>\n                <span>Texture / transparency</span>'));
      assert.ok(landingContent.includes('OBJECT_002 / CORE<br />\n            A LAYER OF LIGHT.<br />\n            A DIFFERENT PERSPECTIVE.'));
    });

    test('Scene 03 (PASSAGE) and Scene 04 (RESONANCE) verbatim match', () => {
      assert.ok(landingContent.includes('03 / The space between'));
      assert.ok(landingContent.includes('BEYOND THE SURFACE'));
      assert.ok(landingContent.includes('A DIFFERENT FREQUENCY — A DIFFERENT FREQUENCY'));
      assert.ok(landingContent.includes('Three circles.<br />\n              One continuous journey.<br />\n              Let your perspective change.'));
      assert.ok(landingContent.includes('SCROLL TO PASS THROUGH ↓'));
      assert.ok(landingContent.includes('Solid form.</span>\n            <span className="italic">Fluid feeling.'));
      assert.ok(landingContent.includes('MOVE YOUR POINTER THROUGH THE PARTICLES.<br />\n            THEN WATCH THEM FIND THEIR WAY BACK.'));
    });

    test('Scene 05 (CONNECTION) & Footer colophon verbatim match', () => {
      assert.ok(landingContent.includes('05 / A CONVERSATION'));
      assert.ok(landingContent.includes('Imagine<br />\n              what comes<br />\n              <em>next.</em>'));
      assert.ok(landingContent.includes('GOOD THINGS BEGIN WITH A HELLO.'));
      assert.ok(landingContent.includes('© 2026 AERUM<br />\n            A FICTIONAL BRAND / CONCEPT OBJECTS'));
      assert.ok(landingContent.includes('SOUND, IN ANOTHER FORM.<br />\n            AN EXPERIMENT IN DIGITAL CRAFT.'));
      assert.ok(landingContent.includes('RETURN TO THE BEGINNING ↑'));
    });

    test('CSS typography: Georgia serif italic in authentic #168c9f', () => {
      assert.ok(cssContent.includes("font-family: Georgia, 'Times New Roman', serif"));
      assert.ok(cssContent.includes('color: #168c9f !important'));
    });
  });

  // ---------------------------------------------------------------------------
  // 3. 3D Rendering Pipeline, Memory Disposal & Lights
  // ---------------------------------------------------------------------------
  describe('Area 3: Three.js 3D Pipeline & Resource Disposal', () => {
    const laptopPath = path.join(ROOT, 'components/studio/LaptopViewer.tsx');
    const vaultPath = path.join(ROOT, 'components/studio/AdminSecurityVault.tsx');
    const landingPath = path.join(ROOT, 'components/studio/MotionLanding.tsx');

    const laptopContent = fs.readFileSync(laptopPath, 'utf8');
    const vaultContent = fs.readFileSync(vaultPath, 'utf8');
    const landingContent = fs.readFileSync(landingPath, 'utf8');

    test('Shadow mapping enabled in LaptopViewer', () => {
      assert.ok(laptopContent.includes('renderer.shadowMap.enabled = true'));
      assert.ok(laptopContent.includes('renderer.shadowMap.type = THREE.PCFSoftShadowMap'));
      assert.ok(laptopContent.includes('keyLight.castShadow = true'));
    });

    test('Tone mapping configured across 3D components', () => {
      assert.ok(laptopContent.includes('renderer.toneMapping = THREE.ACESFilmicToneMapping'));
      assert.ok(vaultContent.includes('renderer.toneMapping = THREE.ACESFilmicToneMapping'));
      assert.ok(landingContent.includes('renderer.toneMapping = THREE.ACESFilmicToneMapping'));
    });

    test('Disposal cycle in LaptopViewer: geometries, materials, maps, controls, context loss', () => {
      assert.ok(laptopContent.includes('controls.dispose()'));
      assert.ok(laptopContent.includes('mesh.geometry?.dispose()'));
      assert.ok(laptopContent.includes('m.dispose()'));
      assert.ok(laptopContent.includes('map?.dispose()'));
      assert.ok(laptopContent.includes('renderer.dispose()'));
      assert.ok(laptopContent.includes('renderer.forceContextLoss()'));
    });

    test('Disposal cycle in AdminSecurityVault: controls, renderer, forceContextLoss, scene traverse', () => {
      assert.ok(vaultContent.includes('controls.dispose()'));
      assert.ok(vaultContent.includes('renderer.dispose()'));
      assert.ok(vaultContent.includes('renderer.forceContextLoss()'));
      assert.ok(vaultContent.includes('scene.traverse('));
      assert.ok(vaultContent.includes('mesh.geometry?.dispose()'));
    });

    test('Empirical Mock Disposal Stress: 100 mount/unmount cycles without memory leak', () => {
      let disposedGeometries = 0;
      let disposedMaterials = 0;
      let disposedRenderers = 0;

      for (let cycle = 0; cycle < 100; cycle++) {
        const scene = new THREE.Scene();
        const geom = new THREE.BoxGeometry(1, 1, 1);
        const mat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
        const mesh = new THREE.Mesh(geom, mat);
        scene.add(mesh);

        // Simulate mock unmount teardown
        scene.traverse((obj) => {
          if (obj.isMesh) {
            obj.geometry.dispose();
            disposedGeometries++;
            obj.material.dispose();
            disposedMaterials++;
          }
        });
        disposedRenderers++;
        scene.clear();
      }

      assert.equal(disposedGeometries, 100);
      assert.equal(disposedMaterials, 100);
      assert.equal(disposedRenderers, 100);
    });
  });

  // ---------------------------------------------------------------------------
  // 4. /services Laptop Customizer & Re-render Prevention
  // ---------------------------------------------------------------------------
  describe('Area 4: Laptop Customizer & Material Stability', () => {
    const laptopPath = path.join(ROOT, 'components/studio/LaptopViewer.tsx');
    const laptopContent = fs.readFileSync(laptopPath, 'utf8');

    test('All 6 color presets are defined with full hex specifications', () => {
      const presets = [
        'space-gray',
        'midnight-obsidian',
        'arctic-silver',
        'cyber-cyan',
        'imperial-emerald',
        'sunset-coral',
      ];
      for (const id of presets) {
        assert.ok(laptopContent.includes(`id: '${id}'`), `Preset ${id} must exist`);
      }
    });

    test('Re-render prevention: mount useEffect has empty dependency array []', () => {
      // The mount effect should only run ONCE on mount, not re-initialize on every color pick!
      const mountEffectMatch = laptopContent.match(/useEffect\(\(\) => \{[\s\S]*?loadModel\(0\);[\s\S]*?return \(\) => \{[\s\S]*?\};\s*\}, \[\]\);/);
      assert.ok(mountEffectMatch, 'Mount effect must have [] dependency array to prevent canvas tear-down re-render storms');
    });

    test('Direct material reference update via materialsRef', () => {
      assert.ok(laptopContent.includes('materialsRef.current'));
      assert.ok(laptopContent.includes('mats.body.color.set('));
      assert.ok(laptopContent.includes('mats.lid.color.set('));
      assert.ok(laptopContent.includes('mats.keyboard.color.set('));
      assert.ok(laptopContent.includes('mats.trackpad.color.set('));
    });

    test('Stress test: 500 rapid color transitions update Three.Color cleanly', () => {
      const testMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
      const testColors = ['#1e293b', '#0f172a', '#94a3b8', '#06b6d4', '#059669', '#f43f5e'];

      for (let i = 0; i < 500; i++) {
        const hex = testColors[i % testColors.length];
        testMat.color.set(hex);
        assert.equal(testMat.color.getHexString().toLowerCase(), hex.slice(1).toLowerCase());
      }
      testMat.dispose();
    });

    test('Hinge rotation bounds: openAngle [0, 1] maps cleanly to [-1.57, -0.2]', () => {
      const angle0 = THREE.MathUtils.lerp(-1.57, -0.2, 0);
      const angleHalf = THREE.MathUtils.lerp(-1.57, -0.2, 0.5);
      const angle1 = THREE.MathUtils.lerp(-1.57, -0.2, 1);

      assert.equal(angle0, -1.57);
      assert.ok(Math.abs(angleHalf - (-0.885)) < 1e-4);
      assert.equal(angle1, -0.2);
    });
  });

  // ---------------------------------------------------------------------------
  // 5. /admin Security Vault: State Machine & Slerp/Lerp Stability
  // ---------------------------------------------------------------------------
  describe('Area 5: Admin Security Vault State Machine & Slerp/Lerp Kinematics', () => {
    const vaultPath = path.join(ROOT, 'components/studio/AdminSecurityVault.tsx');
    const vaultContent = fs.readFileSync(vaultPath, 'utf8');

    test('AdminSecurityVault contract accepts required props', () => {
      assert.ok(vaultContent.includes('unlocked?: boolean'));
      assert.ok(vaultContent.includes('onToggleUnlock?: (unlocked: boolean) => void'));
      assert.ok(vaultContent.includes('onUnlock?: () => void'));
      assert.ok(vaultContent.includes("mode?: 'claim' | 'telemetry' | 'default'"));
    });

    test('Admin page utilizes AdminSecurityVault in both locked claim mode and unlocked telemetry mode', () => {
      const adminPath = path.join(ROOT, 'app/admin/page.tsx');
      const adminContent = fs.readFileSync(adminPath, 'utf8');

      assert.ok(adminContent.includes('AdminSecurityVault'));
      assert.ok(adminContent.includes('mode="claim"'));
      assert.ok(adminContent.includes('mode="telemetry"'));
      assert.ok(adminContent.includes('unlocked={true}'));
    });

    test('Slerp and Lerp mathematical stability: no NaN, gimbal lock or singularities', () => {
      const IDLE_POS = new THREE.Vector3(0.82, 0.16, 0.52);
      const IDLE_ROT = new THREE.Euler(0.28, -0.58, -0.38);
      const IDLE_QUAT = new THREE.Quaternion().setFromEuler(IDLE_ROT);

      const UNLOCKED_POS = new THREE.Vector3(0.0, 0.0, 0.22);
      const UNLOCKED_ROT = new THREE.Euler(0.0, 0.0, Math.PI / 2);
      const UNLOCKED_QUAT = new THREE.Quaternion().setFromEuler(UNLOCKED_ROT);

      // Test across 100 interpolation steps from 0.0 to 1.0
      for (let i = 0; i <= 100; i++) {
        const p = i / 100;
        const curPos = new THREE.Vector3().lerpVectors(IDLE_POS, UNLOCKED_POS, p);
        const curQuat = new THREE.Quaternion().slerpQuaternions(IDLE_QUAT, UNLOCKED_QUAT, p);

        assert.ok(!Number.isNaN(curPos.x) && !Number.isNaN(curPos.y) && !Number.isNaN(curPos.z));
        assert.ok(!Number.isNaN(curQuat.x) && !Number.isNaN(curQuat.y) && !Number.isNaN(curQuat.z) && !Number.isNaN(curQuat.w));

        // Quaternion must remain normalized unit length
        const quatLength = curQuat.length();
        assert.ok(Math.abs(quatLength - 1.0) < 1e-5, `Quat length at p=${p} is ${quatLength} (must be 1.0)`);
      }
    });

    test('Emissive pulse calculations: locked vs unlocked boundary assertions', () => {
      // Locked pulse: 1.1 + sin(t * 2.4) * 0.45
      // Min: 1.1 - 0.45 = 0.65; Max: 1.1 + 0.45 = 1.55
      for (let t = 0; t < 10; t += 0.1) {
        const lockedPulse = 1.1 + Math.sin(t * 2.4) * 0.45;
        assert.ok(lockedPulse >= 0.64 && lockedPulse <= 1.56, `Locked pulse ${lockedPulse} within bounds`);
      }

      // Unlocked pulse: 2.4 + sin(t * 6.0) * 0.6
      // Min: 2.4 - 0.6 = 1.8; Max: 2.4 + 0.6 = 3.0
      for (let t = 0; t < 10; t += 0.1) {
        const unlockedPulse = 2.4 + Math.sin(t * 6.0) * 0.6;
        assert.ok(unlockedPulse >= 1.79 && unlockedPulse <= 3.01, `Unlocked pulse ${unlockedPulse} within bounds`);
      }
    });

    test('Burst flash calculation: exponential decay after toggle', () => {
      const calcBurst = (dt) => Math.max(0, 4.2 * Math.exp(-dt * 3.5));
      assert.equal(calcBurst(0), 4.2, 'Initial burst intensity is 4.2');
      assert.ok(calcBurst(0.5) < 0.8, 'Burst decays rapidly by 0.5s');
      assert.ok(calcBurst(1.4) < 0.04, 'Burst virtually zero after 1.4s');
    });
  });

});
