import * as THREE from 'three';

const TAU = Math.PI * 2;

function clamp(x: number, a = 0, b = 1): number {
  return Math.max(a, Math.min(b, x));
}

function normalize(v: number[]): number[] {
  const k = Math.hypot(...v) || 1;
  return v.map((x) => x / k);
}

function cross(a: number[], b: number[]): number[] {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

/**
 * Builds the physical machined titanium Halo geometry from the HASH-DECODE private source.
 * Includes 8-rib machined chassis, recessed barrel, knurled bands, graphite bearings,
 * and precision counterbored fasteners.
 */
export function buildHaloGeometryData(): {
  positions: Float32Array;
  normals: Float32Array;
  materials: Float32Array;
} {
  const out: number[] = [];

  function sweep(
    profile: number[][],
    start: number,
    end: number,
    mat: number,
    stations: number,
    offset = [0, 0, 0],
    closedCaps = false,
    bevel = 0
  ) {
    const midR =
      (Math.max(...profile.map((p) => p[0])) + Math.min(...profile.map((p) => p[0]))) / 2;
    const midZ =
      (Math.max(...profile.map((p) => p[1])) + Math.min(...profile.map((p) => p[1]))) / 2;

    const row = (a: number, t: number, sz: number) => {
      const r = midR + (profile[t][0] - midR) * sz;
      return [
        offset[0] + r * Math.cos(a),
        offset[1] + r * Math.sin(a),
        offset[2] + midZ + (profile[t][1] - midZ) * sz,
      ];
    };

    const N = profile.length;
    const angles = closedCaps
      ? [
          start,
          start + bevel,
          ...Array.from(
            { length: stations + 1 },
            (_, i) => start + bevel * 2 + ((end - start - bevel * 4) * i) / stations
          ),
          end - bevel,
          end,
        ]
      : Array.from(
          { length: stations + 1 },
          (_, i) => start + ((end - start) * i) / stations
        );

    const sz = (i: number) =>
      closedCaps && bevel
        ? i === 0 || i === angles.length - 1
          ? 0.87
          : i === 1 || i === angles.length - 2
          ? 0.965
          : 1
        : 1;

    function normal(a: number, t: number, i: number) {
      const back = profile[(t - 1 + N) % N],
        here = profile[t],
        next = profile[(t + 1) % N];
      const na = normalize([here[1] - back[1], back[0] - here[0]]);
      const nb = normalize([next[1] - here[1], here[0] - next[0]]);
      const v = normalize([na[0] + nb[0], na[1] + nb[1]]);
      const side = !bevel
        ? 0
        : i === 0
        ? -0.93
        : i === angles.length - 1
        ? 0.93
        : i === 1
        ? -0.35
        : i === angles.length - 2
        ? 0.35
        : 0;
      return normalize([
        v[0] * Math.cos(a) - side * Math.sin(a),
        v[0] * Math.sin(a) + side * Math.cos(a),
        v[1],
      ]);
    }

    function vertex(i: number, t: number) {
      out.push(...row(angles[i], t, sz(i)), ...normal(angles[i], t, i), mat);
    }

    for (let i = 0; i < angles.length - 1; i++) {
      for (let j = 0; j < N; j++) {
        const k = (j + 1) % N;
        vertex(i, j);
        vertex(i + 1, j);
        vertex(i + 1, k);
        vertex(i, j);
        vertex(i + 1, k);
        vertex(i, k);
      }
    }

    if (!closedCaps) return;
    for (const i of [0, angles.length - 1]) {
      const a = angles[i],
        side = i === 0 ? -1 : 1,
        n = [-Math.sin(a) * side, Math.cos(a) * side, 0];
      const center = [
        offset[0] + midR * Math.cos(a),
        offset[1] + midR * Math.sin(a),
        offset[2] + midZ,
      ];
      for (let j = 0; j < N; j++) {
        out.push(
          ...center,
          ...n,
          mat,
          ...row(a, j, sz(i)),
          ...n,
          mat,
          ...row(a, (j + 1) % N, sz(i)),
          ...n,
          mat
        );
      }
    }
  }

  const band = (
    inner: number,
    outer: number,
    back: number,
    front: number,
    b: number
  ) => [
    [outer - b, back],
    [outer - 0.3 * b, back + 0.22 * b],
    [outer, back + b],
    [outer, front - b],
    [outer - 0.3 * b, front - 0.24 * b],
    [outer - b, front],
    [inner + b, front],
    [inner + 0.3 * b, front - 0.24 * b],
    [inner, front - b],
    [inner, back + b],
    [inner + 0.3 * b, back + 0.24 * b],
    [inner + b, back],
  ];

  const ring = (p: number[][], m: number) => sweep(p, 0, TAU, m, 120);
  const RIBS = 8;

  // Recessed steel barrel, a fine knurled axial band, two machined rails.
  ring(band(0.68, 1.008, -0.168, 0.089, 0.023), 2);
  ring(band(0.76, 1.027, -0.151, -0.13, 0.008), 1);
  ring(band(0.83, 1.038, -0.105, -0.008, 0.012), 3);
  ring(band(0.73, 1.024, 0.016, 0.048, 0.009), 1);
  ring(band(0.62, 0.701, -0.13, 0.112, 0.025), 2);
  ring(band(0.601, 0.64, -0.115, -0.083, 0.012), 1);
  ring(band(0.605, 0.687, 0.066, 0.106, 0.012), 1);
  ring(band(0.619, 0.679, 0.112, 0.12, 0.004), 2);

  // Tough graphite bearing and inlaid indicator between two bright retaining lips.
  ring(band(0.624, 0.632, 0.119, 0.125, 0.002), 4);
  ring(band(0.654, 0.663, 0.121, 0.131, 0.003), 1);

  const plate = [
    [0.97, -0.034],
    [0.993, -0.022],
    [1.006, 0.001],
    [1.009, 0.091],
    [1.005, 0.125],
    [0.994, 0.151],
    [0.975, 0.168],
    [0.954, 0.177],
    [0.933, 0.182],
    [0.905, 0.184],
    [0.872, 0.183],
    [0.844, 0.179],
    [0.81, 0.169],
    [0.787, 0.159],
    [0.765, 0.148],
    [0.745, 0.134],
    [0.728, 0.111],
    [0.722, 0.09],
    [0.724, 0.048],
    [0.733, 0.031],
    [0.76, 0.014],
    [0.81, -0.028],
  ];

  for (let i = 0; i < RIBS; i++) {
    const a = (i * TAU) / RIBS + 0.108,
      b = ((i + 1) * TAU) / RIBS + 0.108,
      gap = 0.013;
    sweep(plate, a + gap, b - gap, 0, 20, [0, 0, 0], true, 0.006);
    sweep(band(0.681, 0.72, 0.061, 0.12, 0.01), a + 0.025, b - 0.025, 5, 16, [0, 0, 0], true, 0.003);
    sweep(band(0.694, 0.709, 0.121, 0.124, 0.001), a + 0.046, a + 0.118, 4, 6);

    for (const angle of [a + 0.074, b - 0.076]) {
      const center = [0.916 * Math.cos(angle), 0.916 * Math.sin(angle), 0.183];
      sweep(band(0.012, 0.021, -0.005, 0.002, 0.002), 0, TAU, 2, 14, center);
      sweep(band(0.0065, 0.014, -0.004, 0.0028, 0.0016), 0, TAU, 1, 12, center);
      sweep(band(0.0001, 0.0068, -0.002, 0.0014, 0.0006), 0.2, 0.2 + TAU, 3, 6, center);
    }
  }

  const raw = new Float32Array(out);
  const vertexCount = raw.length / 7;
  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);
  const materials = new Float32Array(vertexCount);

  for (let i = 0; i < vertexCount; i++) {
    positions[i * 3 + 0] = raw[i * 7 + 0];
    positions[i * 3 + 1] = raw[i * 7 + 1];
    positions[i * 3 + 2] = raw[i * 7 + 2];

    normals[i * 3 + 0] = raw[i * 7 + 3];
    normals[i * 3 + 1] = raw[i * 7 + 4];
    normals[i * 3 + 2] = raw[i * 7 + 5];

    materials[i] = raw[i * 7 + 6];
  }

  return { positions, normals, materials };
}

/**
 * Creates a complete Three.js Group for the physical Machined Titanium Halo.
 */
export function createHaloGroup(surface:THREE.Material,metal:THREE.Material,core:THREE.Material):THREE.Group{
  const group=new THREE.Group();
  const {positions,normals,materials}=buildHaloGeometryData();
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
  geometry.setAttribute('normal',new THREE.BufferAttribute(normals,3));
  const types=Array.from(materials,v=>v===4?2:v===0||v===2?0:1);
  let start=0;
  for(let i=1;i<=types.length;i++){
    if(i===types.length||types[i]!==types[start]){geometry.addGroup(start,i-start,types[start]);start=i;}
  }
  group.add(new THREE.Mesh(geometry,[metal,surface,core]));
  return group;
}
