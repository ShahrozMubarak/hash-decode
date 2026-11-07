// Helper utilities, parsers, and specification constants for 3D Models & Design E2E Tests
import fs from 'node:fs';
import path from 'node:path';

// Canonical AERUM Specification Constants from authoritative source
export const AERUM_SPEC = {
  meta: {
    title: 'AERUM — Sound, in Another Form',
    description: 'AERUM is a fictional collection of sculptural audio objects. Explore a world of polished alloy, frosted glass, and cold light.',
    robots: 'noindex,nofollow',
    themeColor: '#f6f8f9',
  },
  hero: {
    eyebrow: 'A concept collection / No. 001',
    headlineLines: ['Sound,', 'in another', 'form.'],
    description: 'Objects for the spaces we inhabit.\nAn imagined world of sculptural sound,\nsoft geometry, and quiet presence.',
    exploreLinkText: 'Explore the collection',
    scrollCue: 'A world unfolds',
    floatingLabel: {
      title: 'OBJECT_001 / HALO',
      detail: 'POLISHED ALLOY · COLD LIGHT',
    },
    coordinates: 'EXPERIMENTAL AUDIO OBJECTS\nVIRTUAL COLLECTION / 2026',
  },
  wordRow: {
    phrase1: 'Form follows feeling',
    delimiter: '◌', // U+25CC dotted circle
    phrase2: 'Space becomes sound',
    phrase3: 'AERUM',
    fullText: 'Form follows feeling ◌ Space becomes sound ◌ AERUM',
  },
  scene01Halo: {
    sectionNumber: '01 / HALO',
    headline: 'A softer\nkind of\npresence.',
    productMeta: [
      { key: 'Form', value: 'Suspended annulus' },
      { key: 'Study', value: 'Alloy / light / space' },
    ],
    footText: 'OBJECT_001 / AN EXPLORATION IN BALANCE',
    footAction: 'FOLLOW THE FORM ↓',
  },
  scene02Core: {
    sectionNumber: '02 / CORE',
    headline: 'Quiet\non the\noutside.',
    productMeta: [
      { key: 'Form', value: 'Frosted capsule' },
      { key: 'Study', value: 'Texture / transparency' },
    ],
    specimenCaption: 'OBJECT_002 / CORE\nA LAYER OF LIGHT.\nA DIFFERENT PERSPECTIVE.',
    footText: 'AN OBJECT WITH AN INNER WORLD',
    footAction: 'KEEP GOING ↓',
  },
  scene03Passage: {
    eyebrow: '03 / The space between',
    headline: 'Step\ninside.',
    marquee: 'A DIFFERENT FREQUENCY — A DIFFERENT FREQUENCY',
    centerLabel: 'BEYOND THE SURFACE',
    aside: 'Three circles.\nOne continuous journey.\nLet your perspective change.',
    footAction: 'SCROLL TO PASS THROUGH ↓',
  },
  scene04Resonance: {
    eyebrow: '04 / Resonance',
    headline: 'Solid form. Fluid feeling.',
    narrative: 'An object becomes an atmosphere.\nFor a moment, its edges disappear.',
    statementMark: 'MOVE YOUR POINTER THROUGH THE PARTICLES.\nTHEN WATCH THEM FIND THEIR WAY BACK.',
  },
  scene05Conversation: {
    sectionNumber: '05 / A CONVERSATION',
    headline: 'Imagine\nwhat comes\nnext.',
    cta: 'Start a conversation',
    note: 'GOOD THINGS BEGIN WITH A HELLO.',
  },
  footer: {
    wordmark: 'AERUM',
    colophonLeft: '© 2026 AERUM\nA FICTIONAL BRAND / CONCEPT OBJECTS',
    colophonCenter: 'SOUND, IN ANOTHER FORM.\nAN EXPERIMENT IN DIGITAL CRAFT.',
    returnLink: 'RETURN TO THE BEGINNING ↑',
  },
  colors: {
    ink: '#14232b',
    muted: '#5a6d76',
    accent: '#22d3ee',
    serifAccent: '#168c9f',
    bgLight: [246, 248, 249],
    bgDark: [166, 184, 195],
  },
};

/**
 * Binary GLB Parser: parses standard glTF 2.0 binary container
 */
export function parseGlb(buffer) {
  if (!Buffer.isBuffer(buffer)) {
    throw new TypeError('Input must be a Buffer');
  }
  if (buffer.length < 12) {
    throw new Error('Buffer too small for GLB header (minimum 12 bytes)');
  }

  const magic = buffer.toString('ascii', 0, 4);
  const version = buffer.readUInt32LE(4);
  const totalLength = buffer.readUInt32LE(8);

  if (magic !== 'glTF') {
    throw new Error(`Invalid GLB magic bytes: expected "glTF", got "${magic}"`);
  }
  if (version !== 2) {
    throw new Error(`Unsupported GLB version: expected 2, got ${version}`);
  }
  if (totalLength > buffer.length) {
    throw new Error(`GLB total length in header (${totalLength}) exceeds buffer length (${buffer.length})`);
  }

  // Parse First Chunk (JSON Chunk)
  if (buffer.length < 20) {
    throw new Error('Buffer too small for JSON chunk header');
  }
  const jsonChunkLen = buffer.readUInt32LE(12);
  const jsonChunkType = buffer.toString('ascii', 16, 20);

  if (jsonChunkType !== 'JSON') {
    throw new Error(`Invalid first chunk type: expected "JSON", got "${jsonChunkType}"`);
  }
  if (20 + jsonChunkLen > buffer.length) {
    throw new Error('JSON chunk length exceeds buffer bounds');
  }

  const jsonStr = buffer.toString('utf8', 20, 20 + jsonChunkLen);
  let json;
  try {
    json = JSON.parse(jsonStr);
  } catch (err) {
    throw new Error(`Malformed GLB JSON chunk: ${err.message}`);
  }

  // Parse Optional Second Chunk (BIN Chunk)
  let binaryBuffer = null;
  const binOffset = 20 + jsonChunkLen;
  if (binOffset + 8 <= buffer.length) {
    const binChunkLen = buffer.readUInt32LE(binOffset);
    const binChunkType = buffer.toString('ascii', binOffset + 4, binOffset + 8);
    if (binChunkType === 'BIN\0' || binChunkType === 'BIN ') {
      binaryBuffer = buffer.subarray(binOffset + 8, binOffset + 8 + binChunkLen);
    }
  }

  return {
    magic,
    version,
    totalLength,
    json,
    binaryBuffer,
    meshCount: json.meshes?.length || 0,
    materialCount: json.materials?.length || 0,
    nodeCount: json.nodes?.length || 0,
    animationCount: json.animations?.length || 0,
  };
}

/**
 * Color Hex Parser & Normalizer:
 * Validates 3-char, 6-char, and uppercase hex codes.
 * Returns normalized lowercase 6-char hex, or fallback if invalid.
 */
export function parseHexColor(input, fallback = '#0f172a') {
  if (typeof input !== 'string') return fallback;
  const trimmed = input.trim();
  const hexMatch = trimmed.match(/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
  if (!hexMatch) return fallback;

  let hex = hexMatch[1].toLowerCase();
  if (hex.length === 3) {
    hex = hex.split('').map((c) => c + c).join('');
  }
  return '#' + hex;
}

/**
 * Scroll kinetics simulator:
 * Calculates scroll value and lag latency under given decay coefficient k and frame time dt.
 */
export function simulateScrollLag(steps, targetDelta = 2000, k = 10, dt = 0.0167) {
  let scroll = 0;
  const target = targetDelta;
  const results = [];

  for (let i = 0; i < steps; i++) {
    scroll = scroll + (target - scroll) * (1 - Math.exp(-dt * k));
    const distanceToTarget = Math.abs(target - scroll);
    const latencyFraction = distanceToTarget / target;
    results.push({
      step: i,
      time: i * dt,
      scroll,
      distanceToTarget,
      latencyFraction,
    });
  }
  return results;
}

/**
 * Responsive Trail Spline Generator:
 * Generates Bezier path points based on viewport width, height, and scene offsets.
 */
export function calculateTrailSpline(sw, sh, offsets = [], isMobile = false) {
  const off1 = offsets[1] || sh * 1.2;
  const off2 = offsets[2] || sh * 2.4;
  const off3 = offsets[3] || sh * 3.6;
  const off4 = offsets[4] || sh * 5.0;
  const off5 = offsets[5] || sh * 6.2;

  const p0 = { x: sw * 0.72, y: sh * 0.52 };
  const p1 = { x: isMobile ? sw * 0.5 : sw * 0.28, y: off1 + sh * (isMobile ? 0.7 : 0.52) };
  const p2 = { x: isMobile ? sw * 0.5 : sw * 0.74, y: off2 + sh * (isMobile ? 0.7 : 0.52) };
  const p3 = { x: sw * 0.5, y: off3 + sh * 0.5 };
  const p4 = { x: sw * 0.5, y: off4 + sh * 0.5 };
  const p5 = { x: isMobile ? sw * 0.5 : sw * 0.75, y: off5 + sh * (isMobile ? 0.65 : 0.48) };

  const d = [
    `M ${p0.x} ${p0.y}`,
    `C ${p0.x} ${p0.y + sh * 0.4}, ${p1.x} ${p1.y - sh * 0.4}, ${p1.x} ${p1.y}`,
    `C ${p1.x} ${p1.y + sh * 0.4}, ${p2.x} ${p2.y - sh * 0.4}, ${p2.x} ${p2.y}`,
    `C ${p2.x} ${p2.y + sh * 0.4}, ${p3.x} ${p3.y - sh * 0.4}, ${p3.x} ${p3.y}`,
    `C ${p3.x} ${p3.y + sh * 0.4}, ${p4.x} ${p4.y - sh * 0.4}, ${p4.x} ${p4.y}`,
    `C ${p4.x} ${p4.y + sh * 0.4}, ${p5.x} ${p5.y - sh * 0.4}, ${p5.x} ${p5.y}`,
  ].join(' ');

  return { p0, p1, p2, p3, p4, p5, d };
}

/**
 * Scene 02 Non-Overlap Geometry Calculation:
 * Calculates axis-aligned bounding boxes for typography and 3D model in Scene 02.
 */
export function calculateScene02Layout(viewportWidth, viewportHeight, isMobile = false) {
  if (isMobile) {
    // Mobile (<600px): vertical stacking
    // Text container is at top, 3D model is at bottom
    const textBox = {
      left: 16,
      right: viewportWidth - 16,
      top: 60,
      bottom: 260,
      width: viewportWidth - 32,
      height: 200,
    };
    const modelBox = {
      left: 20,
      right: viewportWidth - 20,
      top: 310, // 50px clearance margin
      bottom: 310 + 260,
      width: viewportWidth - 40,
      height: 260,
    };
    // Check horizontal and vertical collision
    const horizontalOverlap = Math.max(0, Math.min(textBox.right, modelBox.right) - Math.max(textBox.left, modelBox.left));
    const verticalOverlap = Math.max(0, Math.min(textBox.bottom, modelBox.bottom) - Math.max(textBox.top, modelBox.top));
    const hasOverlap = horizontalOverlap > 0 && verticalOverlap > 0;
    const verticalGap = modelBox.top - textBox.bottom;

    return {
      isMobile: true,
      textBox,
      modelBox,
      hasOverlap,
      verticalGap,
    };
  } else {
    // Desktop: text left-aligned, 3D model on right half
    const textBox = {
      left: viewportWidth * 0.08,
      right: viewportWidth * 0.45,
      top: viewportHeight * 0.2,
      bottom: viewportHeight * 0.8,
      width: viewportWidth * 0.37,
      height: viewportHeight * 0.6,
    };
    const modelBox = {
      left: viewportWidth * 0.65,
      right: viewportWidth * 0.95,
      top: viewportHeight * 0.2,
      bottom: viewportHeight * 0.8,
      width: viewportWidth * 0.30,
      height: viewportHeight * 0.6,
    };

    const horizontalOverlap = Math.max(0, Math.min(textBox.right, modelBox.right) - Math.max(textBox.left, modelBox.left));
    const clearanceGap = modelBox.left - textBox.right;
    const hasOverlap = horizontalOverlap > 0;

    return {
      isMobile: false,
      textBox,
      modelBox,
      hasOverlap,
      clearanceGap,
    };
  }
}

/**
 * Laptop Hinge Angle Normalizer & Math:
 * Maps openAngle [0, 1] to physical rotation in radians [-1.57 (closed) to -0.2 (open)].
 */
export function calculateHingeAngle(openAngle) {
  const clamped = Math.max(0, Math.min(1, typeof openAngle === 'number' && !isNaN(openAngle) ? openAngle : 0.85));
  const CLOSED_RAD = -1.5707963267948966; // -PI / 2
  const OPEN_RAD = -0.2;
  const rotationX = CLOSED_RAD + (OPEN_RAD - CLOSED_RAD) * clamped;
  return {
    openAngle: clamped,
    rotationX,
    isClosed: clamped === 0,
    isOpen: clamped === 1,
  };
}

/**
 * Admin Security Vault State Machine:
 * Simulates the lock/unlock transition and emissive rune energy.
 */
export function createVaultStateMachine(initialUnlocked = false) {
  let unlocked = Boolean(initialUnlocked);
  let toggleCount = 0;

  return {
    isUnlocked() {
      return unlocked;
    },
    getToggleCount() {
      return toggleCount;
    },
    toggle() {
      unlocked = !unlocked;
      toggleCount++;
      return this.getState();
    },
    unlock() {
      if (!unlocked) {
        unlocked = true;
        toggleCount++;
      }
      return this.getState();
    },
    lock() {
      if (unlocked) {
        unlocked = false;
        toggleCount++;
      }
      return this.getState();
    },
    getState() {
      return {
        unlocked,
        toggleCount,
        keyPosition: unlocked ? { x: 0, y: 0, z: 0.25 } : { x: 0.9, y: 0.2, z: 0.6 },
        keyRotationZ: unlocked ? Math.PI / 2 : -0.4,
        emissiveIntensity: unlocked ? 2.5 : 1.0,
        statusLabel: unlocked ? 'Vault Decrypted / Session Active' : 'Click to Authenticate Vault Key',
        themeClass: unlocked ? 'vault-unlocked' : 'vault-locked',
      };
    },
  };
}
