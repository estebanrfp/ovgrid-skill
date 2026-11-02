#!/usr/bin/env node
// Made by tools/build-skill-repo.js from OVGrid's tools/model-plan.js: run with Node 18+ or Bun.
// tools/model-plan.js
import { readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

// src/build/sculpt/gltf.js
var COMPONENTS = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };
var ARRAYS = { 5120: Int8Array, 5121: Uint8Array, 5122: Int16Array, 5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array };
var NORMALIZED = { 5120: 127, 5121: 255, 5122: 32767, 5123: 65535 };
var GLB = 1179937895;
var JSON_CHUNK = 1313821514;
var BIN_CHUNK = 5130562;
var UNREAD = {
  KHR_draco_mesh_compression: "compressed with Draco: decompress it first (npx @gltf-transform/cli copy in.glb out.glb)",
  EXT_meshopt_compression: "compressed with meshopt: decompress it first (npx @gltf-transform/cli copy in.glb out.glb)",
  KHR_mesh_quantization: null,
  KHR_materials_pbrSpecularGlossiness: null
};
var localOf = (node) => {
  if (node.matrix)
    return [...node.matrix];
  const [tx, ty, tz] = node.translation ?? [0, 0, 0];
  const [x, y, z, w] = node.rotation ?? [0, 0, 0, 1];
  const [sx, sy, sz] = node.scale ?? [1, 1, 1];
  return [
    (1 - 2 * (y * y + z * z)) * sx,
    2 * (x * y + z * w) * sx,
    2 * (x * z - y * w) * sx,
    0,
    2 * (x * y - z * w) * sy,
    (1 - 2 * (x * x + z * z)) * sy,
    2 * (y * z + x * w) * sy,
    0,
    2 * (x * z + y * w) * sz,
    2 * (y * z - x * w) * sz,
    (1 - 2 * (x * x + y * y)) * sz,
    0,
    tx,
    ty,
    tz,
    1
  ];
};
var multiply = (a, b) => {
  const out = new Array(16).fill(0);
  for (let c = 0;c < 4; c++)
    for (let r = 0;r < 4; r++)
      for (let k = 0;k < 4; k++)
        out[c * 4 + r] += a[k * 4 + r] * b[c * 4 + k];
  return out;
};
var readGltf = (bytes, { bufferOf = null } = {}) => {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let gltf, binary = null;
  if (bytes.byteLength >= 12 && view.getUint32(0, true) === GLB) {
    for (let at = 12;at + 8 <= bytes.byteLength; ) {
      const length = view.getUint32(at, true), type = view.getUint32(at + 4, true);
      const chunk = bytes.subarray(at + 8, at + 8 + length);
      if (type === JSON_CHUNK)
        gltf = JSON.parse(new TextDecoder().decode(chunk));
      else if (type === BIN_CHUNK)
        binary = chunk;
      at += 8 + length;
    }
  } else
    gltf = JSON.parse(new TextDecoder().decode(bytes));
  if (!gltf?.asset?.version?.startsWith("2"))
    throw new Error("not a glTF 2.0 model");
  for (const extension of gltf.extensionsRequired ?? []) {
    if (UNREAD[extension] !== null)
      throw new Error(UNREAD[extension] ?? `it needs ${extension}, which is not read here`);
  }
  const buffers = (gltf.buffers ?? []).map((buffer, i) => {
    if (buffer.uri === undefined)
      return binary;
    const data = /^data:[^,]*;base64,(.*)$/.exec(buffer.uri);
    if (data)
      return Uint8Array.from(atob(data[1]), (char) => char.charCodeAt(0));
    if (!bufferOf)
      throw new Error(`buffer ${i} is a file of its own (${buffer.uri}): read the model from its folder`);
    return bufferOf(buffer.uri);
  });
  const accessor = (index) => {
    const a = gltf.accessors[index];
    if (a.sparse)
      throw new Error("sparse accessors are not read here");
    const components = COMPONENTS[a.type], Type = ARRAYS[a.componentType];
    const out = new Float64Array(a.count * components);
    if (a.bufferView === undefined)
      return out;
    const bufferView = gltf.bufferViews[a.bufferView];
    const source = buffers[bufferView.buffer];
    const stride = bufferView.byteStride ?? components * Type.BYTES_PER_ELEMENT;
    const base = source.byteOffset + (bufferView.byteOffset ?? 0) + (a.byteOffset ?? 0);
    const data = new DataView(source.buffer);
    const read = {
      5120: (o) => data.getInt8(o),
      5121: (o) => data.getUint8(o),
      5122: (o) => data.getInt16(o, true),
      5123: (o) => data.getUint16(o, true),
      5125: (o) => data.getUint32(o, true),
      5126: (o) => data.getFloat32(o, true)
    }[a.componentType];
    const scale = a.normalized ? NORMALIZED[a.componentType] : 1;
    for (let i = 0;i < a.count; i++)
      for (let k = 0;k < components; k++) {
        const value = read(base + i * stride + k * Type.BYTES_PER_ELEMENT);
        out[i * components + k] = a.normalized ? Math.max(value / scale, -1) : value;
      }
    return out;
  };
  const materials = (gltf.materials ?? []).map((material, i) => ({ name: material.name ?? `material ${i}`, color: (material.pbrMetallicRoughness?.baseColorFactor ?? material.extensions?.KHR_materials_pbrSpecularGlossiness?.diffuseFactor ?? [1, 1, 1, 1]).slice(0, 3) }));
  const fallback = materials.length;
  materials.push({ name: "none", color: [0.8, 0.8, 0.8] });
  const positions = [], indices = [], materialOf = [], pieceOf = [], pieces = [], notes = [];
  const shaded = new Map;
  const scene = gltf.scenes?.[gltf.scene ?? 0];
  const roots = scene?.nodes ?? (gltf.nodes ?? []).map((_, i) => i).filter((i) => !(gltf.nodes ?? []).some((node) => node.children?.includes(i)));
  const lights = [];
  const visit = (index, parent) => {
    const node = gltf.nodes[index];
    const world = multiply(parent, localOf(node));
    const at = [world[12], world[14], world[13]];
    const light = node.extensions?.KHR_lights_punctual?.light;
    if (light !== undefined) {
      const kind = gltf.extensions?.KHR_lights_punctual?.lights?.[light] ?? {};
      lights.push({ name: node.name ?? kind.name ?? `light ${light}`, type: kind.type ?? "point", color: kind.color ?? [1, 1, 1], intensity: kind.intensity ?? 1, range: kind.range ?? null, at });
    } else if (node.mesh === undefined && /light|lamp|lumen|bulb/i.test(node.name ?? ""))
      lights.push({ name: node.name, type: "empty", at });
    if (node.mesh !== undefined) {
      for (const primitive of gltf.meshes[node.mesh].primitives) {
        const mode = primitive.mode ?? 4;
        if (![4, 5, 6].includes(mode)) {
          notes.push(`points and lines left out (mode ${mode})`);
          continue;
        }
        if (primitive.extensions && Object.keys(primitive.extensions).some((name) => UNREAD[name]))
          throw new Error(UNREAD[Object.keys(primitive.extensions).find((name) => UNREAD[name])]);
        const local = accessor(primitive.attributes.POSITION);
        const first = positions.length / 3;
        for (let v = 0;v < local.length; v += 3) {
          const [x, y, z] = [local[v], local[v + 1], local[v + 2]];
          const X = world[0] * x + world[4] * y + world[8] * z + world[12];
          const Y = world[1] * x + world[5] * y + world[9] * z + world[13];
          const Z = world[2] * x + world[6] * y + world[10] * z + world[14];
          positions.push(X, Z, Y);
        }
        const count = local.length / 3;
        let order = primitive.indices !== undefined ? Array.from(accessor(primitive.indices)) : Array.from({ length: count }, (_, i) => i);
        if (mode === 5)
          order = order.slice(2).flatMap((_, i) => i % 2 ? [order[i + 1], order[i], order[i + 2]] : [order[i], order[i + 1], order[i + 2]]);
        if (mode === 6)
          order = order.slice(2).flatMap((_, i) => [order[0], order[i + 1], order[i + 2]]);
        const material = primitive.material ?? fallback;
        const piece = pieces.push({ name: node.name ?? `node ${index}`, material }) - 1;
        const determinant = world[0] * (world[5] * world[10] - world[9] * world[6]) - world[4] * (world[1] * world[10] - world[9] * world[2]) + world[8] * (world[1] * world[6] - world[5] * world[2]);
        const turn = determinant > 0;
        for (let i = 0;i + 2 < order.length; i += 3) {
          const [a, b, c] = [order[i], order[i + 1], order[i + 2]];
          if (turn)
            indices.push(first + a, first + c, first + b);
          else
            indices.push(first + a, first + b, first + c);
          materialOf.push(material);
          pieceOf.push(piece);
        }
        if (primitive.attributes.COLOR_0 !== undefined) {
          const colors = accessor(primitive.attributes.COLOR_0), width = COMPONENTS[gltf.accessors[primitive.attributes.COLOR_0].type];
          const sum = shaded.get(material) ?? [0, 0, 0, 0];
          for (let v = 0;v < count; v++)
            for (let k = 0;k < 3; k++)
              sum[k] += colors[v * width + k];
          sum[3] += count;
          shaded.set(material, sum);
        }
      }
    }
    for (const child of node.children ?? [])
      visit(child, world);
  };
  const identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  for (const root of roots)
    visit(root, identity);
  for (const [material, [r, g, b, n]] of shaded)
    materials[material].color = materials[material].color.map((c, k) => c * [r, g, b][k] / n);
  if (gltf.skins?.length)
    notes.push("skinned: read in its rest pose");
  if (!indices.length)
    throw new Error("no triangles in it");
  return {
    positions: Float64Array.from(positions),
    indices: Uint32Array.from(indices),
    materialOf: Uint32Array.from(materialOf),
    materials,
    pieceOf: Uint32Array.from(pieceOf),
    pieces,
    lights,
    title: gltf.asset.extras?.title ?? null,
    author: gltf.asset.extras?.author ?? gltf.asset.copyright ?? null,
    licence: gltf.asset.extras?.license ?? null,
    source: gltf.asset.extras?.source ?? null,
    generator: gltf.asset.generator ?? null,
    notes: [...new Set(notes)]
  };
};

// tools/model/plan.js
var sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
var cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
var r2 = (v) => Math.round(v * 100) / 100;
var DEG = 180 / Math.PI;
var union = (ranges) => ranges.sort((p, q) => p[0] - q[0]).reduce((out, [a, b]) => {
  const last = out.at(-1);
  if (last && a <= last[1] + 0.0001)
    last[1] = Math.max(last[1], b);
  else
    out.push([a, b]);
  return out;
}, []);
var simplify = (points, tolerance) => {
  if (points.length < 3)
    return points;
  const [a, b] = [points[0], points.at(-1)];
  const run = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  let far = 0, at = 0;
  for (let i = 1;i < points.length - 1; i++) {
    const d = Math.abs((b[0] - a[0]) * (a[1] - points[i][1]) - (a[0] - points[i][0]) * (b[1] - a[1])) / run;
    if (d > far)
      [far, at] = [d, i];
  }
  return far > tolerance ? [...simplify(points.slice(0, at + 1), tolerance).slice(0, -1), ...simplify(points.slice(at), tolerance)] : [a, b];
};
var simplifyLoop = (points, tolerance) => {
  const loop = [...points];
  for (let changed = true;changed && loop.length > 3; ) {
    changed = false;
    for (let i = 0;i < loop.length && loop.length > 3; i++) {
      const [a, p, b] = [loop[(i + loop.length - 1) % loop.length], loop[i], loop[(i + 1) % loop.length]];
      const run = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const d = run < 0.000000001 ? Math.hypot(p[0] - a[0], p[1] - a[1]) : Math.abs((b[0] - a[0]) * (a[1] - p[1]) - (a[0] - p[0]) * (b[1] - a[1])) / run;
      if (d < tolerance) {
        loop.splice(i, 1);
        changed = true;
        i--;
      }
    }
  }
  return loop;
};
var boundsOf = (points) => {
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (const p of points)
    for (let k = 0;k < 3; k++) {
      min[k] = Math.min(min[k], p[k]);
      max[k] = Math.max(max[k], p[k]);
    }
  return { min, max };
};
var trianglesOf = (model, scale = 1) => {
  const { positions, indices, pieceOf, materialOf } = model;
  const out = [];
  for (let t = 0;t < indices.length / 3; t++) {
    const [a, b, c] = [0, 1, 2].map((k) => {
      const i = indices[t * 3 + k] * 3;
      return [positions[i] * scale, positions[i + 1] * scale, positions[i + 2] * scale];
    });
    const n = cross(sub(b, a), sub(c, a)), length = Math.hypot(...n);
    if (length < 0.000000001)
      continue;
    out.push({ a, b, c, piece: pieceOf?.[t] ?? 0, material: materialOf[t], area: length / 2, normal: n.map((v) => v / length) });
  }
  return out;
};
var unitsOf = (model) => {
  const { positions, indices } = model;
  const bands = new Map;
  let total = 0, low = Infinity, high = -Infinity;
  for (let t = 0;t < indices.length / 3; t++) {
    const [a, b, c] = [0, 1, 2].map((k) => indices[t * 3 + k] * 3).map((i) => [positions[i], positions[i + 1], positions[i + 2]]);
    for (const p of [a, b, c]) {
      low = Math.min(low, p[2]);
      high = Math.max(high, p[2]);
    }
    const n = cross(sub(b, a), sub(c, a)), length = Math.hypot(...n);
    if (length < 0.000000000001 || Math.abs(n[2]) / length < 0.985)
      continue;
    const z = (a[2] + b[2] + c[2]) / 3;
    total += length / 2;
    bands.set(z, (bands.get(z) ?? 0) + length / 2);
  }
  const levels = [...bands].filter(([, area]) => area >= 0.05 * total).map(([z]) => z);
  const ground = Math.min(...levels);
  const score = (scale) => levels.filter((z) => (z - ground) * scale >= 2.2 && (z - ground) * scale <= 4.5).length;
  const best = [1, 0.01, 0.001, 0.0254].map((scale) => ({ scale, score: score(scale) })).sort((p, q) => q.score - p.score)[0];
  if (best.score > 0 && best.score > score(1))
    return best.scale;
  if (score(1) > 0)
    return 1;
  const tall = high - low;
  return tall > 3000 ? 0.001 : tall > 150 ? 0.01 : 1;
};
var turnOf = (triangles) => {
  const bins = new Float64Array(180);
  for (const t of triangles) {
    if (Math.abs(t.normal[2]) >= 0.1)
      continue;
    const angle2 = (Math.atan2(t.normal[1], t.normal[0]) * DEG % 90 + 90) % 90;
    bins[Math.floor(angle2 * 2) % 180] += t.area;
  }
  let best = 0;
  for (let i = 1;i < 180; i++)
    if (bins[i] + bins[(i + 179) % 180] + bins[(i + 1) % 180] > bins[best] + bins[(best + 179) % 180] + bins[(best + 1) % 180])
      best = i;
  const near = [-1, 0, 1].map((k) => [(best + k + 180) % 180, k]);
  const weight = near.reduce((sum, [i]) => sum + bins[i], 0) || 1;
  let angle = (best + 0.5 + near.reduce((sum, [i, k]) => sum + k * bins[i], 0) / weight) / 2;
  if (angle > 45)
    angle -= 90;
  return Math.abs(angle) < 0.5 ? 0 : angle;
};
var turned = (triangles, degrees) => {
  const c = Math.cos(degrees / DEG), s = Math.sin(degrees / DEG), turn = (p) => [p[0] * c - p[1] * s, p[0] * s + p[1] * c, p[2]];
  return triangles.map((t) => ({ ...t, a: turn(t.a), b: turn(t.b), c: turn(t.c), normal: turn(t.normal) }));
};
var turnPoint = (p, degrees) => {
  const c = Math.cos(degrees / DEG), s = Math.sin(degrees / DEG);
  return [p[0] * c - p[1] * s, p[0] * s + p[1] * c, p[2]];
};
var piecesOf = (model, triangles) => {
  const pieces = ((model.pieces?.length) ? model.pieces : [{ name: "model", material: 0 }]).map((piece, index) => ({ ...piece, index, triangles: 0, area: 0, points: [] }));
  for (const t of triangles) {
    const piece = pieces[t.piece];
    piece.triangles++;
    piece.area += t.area;
    piece.points.push(t.a, t.b, t.c);
  }
  return pieces.filter((piece) => piece.triangles).map(({ points, ...piece }) => {
    const { min, max } = boundsOf(points);
    return { ...piece, min, max, middle: min.map((v, k) => (v + max[k]) / 2), size: max.map((v, k) => v - min[k]) };
  });
};
var kindOf = (piece) => {
  const [x, y, z] = piece.size.map((v) => Math.round(v * 50) / 50);
  return `${piece.material}|${Math.min(x, y)}|${Math.max(x, y)}|${z}|${piece.triangles}`;
};
var repeatsOf = (pieces) => {
  const groups = new Map;
  for (const piece of pieces)
    (groups.get(kindOf(piece)) ?? groups.set(kindOf(piece), []).get(kindOf(piece))).push(piece);
  const repeats = [...groups.values()].filter((list) => list.length >= 3).map((list) => ({
    name: list[0].name,
    material: list[0].material,
    count: list.length,
    size: list[0].size.map(r2),
    triangles: list[0].triangles,
    at: list.map((piece) => piece.middle.map(r2)).sort((p, q) => p[1] - q[1] || p[0] - q[0])
  })).sort((p, q) => q.count - p.count);
  const largest = [...groups.values()].filter((list) => list.length < 3).flat().sort((p, q) => q.area - p.area);
  return { repeats, largest };
};
var NAMED = [
  ["door", /door|gate/i],
  ["window", /window|glaz/i],
  ["stairs", /stair|step/i],
  ["light", /light|lamp|lumen|bulb|chandelier|sconce/i],
  ["furniture", /chair|table|bed|sofa|couch|bench|desk|shelf|cabinet|furniture|stool|armchair|wardrobe|dresser|kitchen|counter|tv|fridge|sink|bath|toilet/i],
  ["plant", /plant|tree|bush|pot|hedge|flower|leaf|leaves/i],
  ["fireplace", /fire|chimney|hearth/i],
  ["water", /water|pool|fountain/i]
];
var namedOf = (pieces, materials) => {
  const out = {};
  for (const [word, test] of NAMED) {
    const found = pieces.filter((piece) => test.test(piece.name));
    if (!found.length)
      continue;
    const groups = new Map;
    for (const piece of found)
      (groups.get(kindOf(piece)) ?? groups.set(kindOf(piece), []).get(kindOf(piece))).push(piece);
    out[word] = [...groups.values()].sort((p, q) => q.length - p.length).slice(0, 10).map((list) => ({ name: list[0].name, material: list[0].material, size: list[0].size.map(r2), at: list.map((p) => p.middle.map(r2)) }));
  }
  return out;
};
var levelsOf = (triangles, { least = 1 } = {}) => {
  const bands = new Map;
  for (const t of triangles) {
    if (Math.abs(t.normal[2]) < 0.985)
      continue;
    const z = (t.a[2] + t.b[2] + t.c[2]) / 3, key = Math.round(z / 0.02);
    const band = bands.get(key) ?? bands.set(key, { up: 0, down: 0, zArea: 0, points: [], materials: new Map }).get(key);
    band[t.normal[2] > 0 ? "up" : "down"] += t.area;
    band.zArea += z * t.area;
    band.points.push(t.a, t.b, t.c);
    band.materials.set(t.material, (band.materials.get(t.material) ?? 0) + t.area);
  }
  const levels = [];
  for (const key of [...bands.keys()].sort((p, q) => p - q)) {
    const band = bands.get(key), last = levels.at(-1);
    if (last && key - last.key <= 1) {
      Object.assign(last, { key, up: last.up + band.up, down: last.down + band.down, zArea: last.zArea + band.zArea });
      last.points.push(...band.points);
      for (const [m, a] of band.materials)
        last.materials.set(m, (last.materials.get(m) ?? 0) + a);
    } else
      levels.push({ key, ...band, materials: new Map(band.materials) });
  }
  return levels.filter((level) => level.up + level.down >= least).map(({ up, down, zArea, points, materials }) => {
    const { min, max } = boundsOf(points);
    return { z: r2(zArea / (up + down)), up: r2(up), down: r2(down), min: min.slice(0, 2).map(r2), max: max.slice(0, 2).map(r2), materials: [...materials].sort((p, q) => q[1] - p[1]).slice(0, 3).map(([m]) => m) };
  });
};
var stretches = (flat, axis, at) => union(flat.flatMap(([p, q, r]) => {
  const other = 1 - axis, hits = [];
  for (const [u, v] of [[p, q], [q, r], [r, p]]) {
    if ((u[other] - at) * (v[other] - at) > 0 || u[other] === v[other])
      continue;
    hits.push(u[axis] + (at - u[other]) * (v[axis] - u[axis]) / (v[other] - u[other]));
  }
  return hits.length >= 2 ? [[Math.min(...hits), Math.max(...hits)]] : [];
}));
var surfaceBelow = (index, [x, y], z) => {
  let best = null;
  for (const t of index.get(`${Math.floor(x)},${Math.floor(y)}`) ?? []) {
    const d = (t.b[1] - t.c[1]) * (t.a[0] - t.c[0]) + (t.c[0] - t.b[0]) * (t.a[1] - t.c[1]);
    if (Math.abs(d) < 0.000000000001)
      continue;
    const l1 = ((t.b[1] - t.c[1]) * (x - t.c[0]) + (t.c[0] - t.b[0]) * (y - t.c[1])) / d;
    const l2 = ((t.c[1] - t.a[1]) * (x - t.c[0]) + (t.a[0] - t.c[0]) * (y - t.c[1])) / d;
    if (l1 < -0.000001 || l2 < -0.000001 || 1 - l1 - l2 < -0.000001)
      continue;
    const h = l1 * t.a[2] + l2 * t.b[2] + (1 - l1 - l2) * t.c[2];
    if (h <= z && (best === null || h > best))
      best = h;
  }
  return best;
};
var rolesOf = (materials, pieces) => materials.map((material, index) => {
  const votes = new Map;
  for (const piece of pieces.filter((p) => p.material === index)) {
    const role = ROLES.find(([, words]) => words.test(piece.name))?.[0];
    if (role)
      votes.set(role, (votes.get(role) ?? 0) + piece.area);
  }
  const area = pieces.filter((p) => p.material === index).reduce((sum, p) => sum + p.area, 0);
  const [voted, share] = [...votes].sort((p, q) => q[1] - p[1])[0] ?? [null, 0];
  if (voted && share >= 0.5 * area)
    return voted;
  return ROLES.find(([, words]) => words.test(material.name))?.[0] ?? voted ?? "?";
});
var wallsOf = (triangles, levels, pieces = [], materials = [], { least = 2, tall = 1.2 } = {}) => {
  const roles = rolesOf(materials, pieces);
  const openers = new Set(pieces.filter((p) => ["glass", "door"].includes(roles[p.material]) && Math.min(...p.size) < 1).map((p) => p.index));
  const skip = (t) => openers.has(t.piece) || ["plants", "light", "water", "ground"].includes(roles[t.material]);
  const flatIndex = new Map;
  for (const t of triangles) {
    if (Math.abs(t.normal[2]) < 0.985)
      continue;
    for (let x = Math.floor(Math.min(t.a[0], t.b[0], t.c[0]));x <= Math.floor(Math.max(t.a[0], t.b[0], t.c[0])); x++) {
      for (let y = Math.floor(Math.min(t.a[1], t.b[1], t.c[1]));y <= Math.floor(Math.max(t.a[1], t.b[1], t.c[1])); y++)
        (flatIndex.get(`${x},${y}`) ?? flatIndex.set(`${x},${y}`, []).get(`${x},${y}`)).push(t);
    }
  }
  const planes = [];
  for (const t of triangles) {
    if (Math.abs(t.normal[2]) >= 0.1 || skip(t))
      continue;
    let angle = Math.atan2(t.normal[1], t.normal[0]) * DEG;
    if (angle < 0)
      angle += 180;
    if (angle >= 179.5)
      angle -= 180;
    const n = [Math.cos(angle / DEG), Math.sin(angle / DEG)];
    const d = (n[0] * (t.a[0] + t.b[0] + t.c[0]) + n[1] * (t.a[1] + t.b[1] + t.c[1])) / 3;
    const plane = planes.find((p) => p.material === t.material && Math.abs(p.angle - angle) <= 1.5 && Math.abs(p.d - d) <= 0.03);
    if (plane)
      plane.triangles.push(t);
    else
      planes.push({ material: t.material, angle, d, n, triangles: [t] });
  }
  const walls = planes.map((plane) => {
    const along = [-plane.n[1], plane.n[0]];
    const flat = plane.triangles.map((t) => [t.a, t.b, t.c].map((p) => [p[0] * along[0] + p[1] * along[1], p[2]]));
    const s = flat.flat().map((p) => p[0]), z = flat.flat().map((p) => p[1]);
    return { ...plane, along, flat, s: [Math.min(...s), Math.max(...s)], z: [Math.min(...z), Math.max(...z)], area: plane.triangles.reduce((sum, t) => sum + t.area, 0) };
  }).filter((w) => w.area >= least && w.z[1] - w.z[0] >= tall && w.area >= 0.33 * (w.s[1] - w.s[0]) * (w.z[1] - w.z[0]));
  const middles = new Map;
  for (const w of walls) {
    const m = middles.get(w.material) ?? middles.set(w.material, [0, 0, 0]).get(w.material);
    const s = (w.s[0] + w.s[1]) / 2;
    m[0] += (w.n[0] * w.d + w.along[0] * s) * w.area;
    m[1] += (w.n[1] * w.d + w.along[1] * s) * w.area;
    m[2] += w.area;
  }
  const floors = levels.filter((level) => level.up + level.down >= 8).map((level) => level.z);
  const opening = new Map;
  for (const t of triangles)
    if (openers.has(t.piece))
      (opening.get(t.piece) ?? opening.set(t.piece, []).get(t.piece)).push(t);
  const told = (w, along, z, filled) => {
    const s = (along[0] + along[1]) / 2, at = [w.n[0] * w.d + w.along[0] * s, w.n[1] * w.d + w.along[1] * s];
    const foot = [1, -1].map((side) => surfaceBelow(flatIndex, [at[0] + w.n[0] * side * 0.5, at[1] + w.n[1] * side * 0.5], z[0] + 0.45)).filter((h) => h !== null).map((h) => z[0] - h).sort((p, q) => Math.abs(p) - Math.abs(q))[0] ?? null;
    return { kind: foot !== null && foot <= 0.2 ? "door" : "window", along, z, over: foot, filled };
  };
  for (const w of walls) {
    w.openings = [];
    for (const h of [...new Set([w.z[0], ...floors.filter((f) => f >= w.z[0] - 0.2 && f + 1.4 <= w.z[1])].map((f) => f + 1.3))]) {
      if (h < w.z[0] + 0.1 || h > w.z[1] - 0.1)
        continue;
      const solid = stretches(w.flat, 0, h);
      for (let i = 0;i + 1 < solid.length; i++) {
        const [a, b] = [solid[i][1], solid[i + 1][0]];
        if (b - a < 0.4 || b - a > 6)
          continue;
        const up = stretches(w.flat, 1, (a + b) / 2);
        const below = up.filter(([, top]) => top <= h).at(-1), above = up.find(([bottom]) => bottom >= h);
        const z = [below ? below[1] : w.z[0], above ? above[0] : w.z[1]];
        if (w.openings.some((o) => Math.abs(o.along[0] - a) < 0.05 && Math.abs(o.z[0] - z[0]) < 0.05))
          continue;
        const filled = new Map;
        for (const t of triangles) {
          if (t.material === w.material)
            continue;
          const m = [0, 1, 2].map((k) => (t.a[k] + t.b[k] + t.c[k]) / 3);
          const s = m[0] * w.along[0] + m[1] * w.along[1], off = m[0] * w.n[0] + m[1] * w.n[1] - w.d;
          if (Math.abs(off) <= 0.5 && s >= a && s <= b && m[2] >= z[0] && m[2] <= z[1])
            filled.set(t.material, (filled.get(t.material) ?? 0) + t.area);
        }
        w.openings.push({ ...told(w, [a, b], z, [...filled].sort((p, q) => q[1] - p[1]).map(([m]) => m)), cut: true });
      }
    }
    const laid = [];
    for (const [, list] of opening) {
      const points = list.flatMap((t) => [t.a, t.b, t.c]);
      const off = points.map((p) => p[0] * w.n[0] + p[1] * w.n[1] - w.d), s = points.map((p) => p[0] * w.along[0] + p[1] * w.along[1]), z = points.map((p) => p[2]);
      if (Math.max(...off.map(Math.abs)) > 0.8 || Math.min(...s) < w.s[0] - 0.2 || Math.max(...s) > w.s[1] + 0.2 || Math.min(...z) < w.z[0] - 0.5 || Math.max(...z) > w.z[1] + 0.5)
        continue;
      laid.push({ along: [Math.min(...s), Math.max(...s)], z: [Math.min(...z), Math.max(...z)], materials: new Set(list.map((t) => t.material)) });
    }
    for (let merged = true;merged; ) {
      merged = false;
      for (let i = 0;i < laid.length && !merged; i++)
        for (let j = i + 1;j < laid.length && !merged; j++) {
          const [p, q] = [laid[i], laid[j]];
          if (p.along[0] > q.along[1] + 0.05 || q.along[0] > p.along[1] + 0.05 || p.z[0] > q.z[1] + 0.05 || q.z[0] > p.z[1] + 0.05)
            continue;
          laid[i] = { along: [Math.min(p.along[0], q.along[0]), Math.max(p.along[1], q.along[1])], z: [Math.min(p.z[0], q.z[0]), Math.max(p.z[1], q.z[1])], materials: new Set([...p.materials, ...q.materials]) };
          laid.splice(j, 1);
          merged = true;
        }
    }
    for (const o of laid) {
      if (o.along[1] - o.along[0] < 0.3 || o.z[1] - o.z[0] < 0.3)
        continue;
      if (w.openings.some((c) => c.along[0] < o.along[1] && o.along[0] < c.along[1] && c.z[0] < o.z[1] && o.z[0] < c.z[1]))
        continue;
      w.openings.push({ ...told(w, o.along, o.z, [...o.materials]), cut: false });
    }
  }
  const out = [], used = new Set;
  for (const w of walls.sort((p, q) => q.area - p.area)) {
    if (used.has(w))
      continue;
    used.add(w);
    const twin = walls.find((other) => !used.has(other) && other.material === w.material && Math.abs(other.angle - w.angle) <= 1.5 && Math.abs(other.d - w.d) >= 0.04 && Math.abs(other.d - w.d) <= 0.8 && Math.min(other.s[1], w.s[1]) - Math.max(other.s[0], w.s[0]) > 0.5 * Math.min(other.s[1] - other.s[0], w.s[1] - w.s[0]));
    if (twin)
      used.add(twin);
    const d = twin ? (w.d + twin.d) / 2 : w.d;
    const point = (s) => [w.n[0] * d + w.along[0] * s, w.n[1] * d + w.along[1] * s];
    const [mx, my, total] = middles.get(w.material), here = point((w.s[0] + w.s[1]) / 2);
    const outward = (here[0] - mx / total) * w.n[0] + (here[1] - my / total) * w.n[1] >= 0 ? 1 : -1;
    const openings = [...w.openings, ...(twin?.openings ?? []).map((o) => ({ ...o, along: o.along.map((v) => v) }))].filter((o, i, all) => all.findIndex((p) => Math.abs(p.along[0] - o.along[0]) < 0.1 && Math.abs(p.z[0] - o.z[0]) < 0.1) === i);
    out.push({
      material: w.material,
      from: point(w.s[0]).map(r2),
      to: point(w.s[1]).map(r2),
      length: r2(w.s[1] - w.s[0]),
      z: w.z.map(r2),
      thickness: twin ? r2(Math.abs(twin.d - w.d)) : 0,
      facing: r2((Math.atan2(w.n[1] * outward, w.n[0] * outward) * DEG + 360) % 360),
      area: r2(w.area + (twin?.area ?? 0)),
      openings: openings.sort((p, q) => p.z[0] - q.z[0] || p.along[0] - q.along[0]).map((o) => ({
        kind: o.kind,
        cut: o.cut,
        along: o.along.map((v) => r2(v - w.s[0])),
        width: r2(o.along[1] - o.along[0]),
        z: o.z.map(r2),
        height: r2(o.z[1] - o.z[0]),
        over: o.over === null ? null : r2(o.over),
        filled: o.filled
      }))
    });
  }
  return out;
};
var ROOM_LEAST = 2.8;
var DOOR_LEAST = 2.2;
var RISER_MOST = 0.2;
var LARGEST = 1.5;
var fitOf = (triangles, levels, walls, stairs) => {
  const index = new Map;
  for (const t of triangles) {
    if (Math.abs(t.normal[2]) < 0.2)
      continue;
    for (let x = Math.floor(Math.min(t.a[0], t.b[0], t.c[0]));x <= Math.floor(Math.max(t.a[0], t.b[0], t.c[0])); x++) {
      for (let y = Math.floor(Math.min(t.a[1], t.b[1], t.c[1]));y <= Math.floor(Math.max(t.a[1], t.b[1], t.c[1])); y++)
        (index.get(`${x},${y}`) ?? index.set(`${x},${y}`, []).get(`${x},${y}`)).push(t);
    }
  }
  const above = (x, y, z) => {
    let best = null;
    for (const t of index.get(`${Math.floor(x)},${Math.floor(y)}`) ?? []) {
      const d = (t.b[1] - t.c[1]) * (t.a[0] - t.c[0]) + (t.c[0] - t.b[0]) * (t.a[1] - t.c[1]);
      if (Math.abs(d) < 0.000000000001)
        continue;
      const l1 = ((t.b[1] - t.c[1]) * (x - t.c[0]) + (t.c[0] - t.b[0]) * (y - t.c[1])) / d;
      const l2 = ((t.c[1] - t.a[1]) * (x - t.c[0]) + (t.a[0] - t.c[0]) * (y - t.c[1])) / d;
      if (l1 < -0.000001 || l2 < -0.000001 || 1 - l1 - l2 < -0.000001)
        continue;
      const h = l1 * t.a[2] + l2 * t.b[2] + (1 - l1 - l2) * t.c[2];
      if (h > z && (best === null || h < best))
        best = h;
    }
    return best;
  };
  const storeys = [];
  for (const level of levels.filter((l) => l.up + l.down >= 8)) {
    const free = [];
    let open = 0;
    for (const t of triangles) {
      if (Math.abs(t.normal[2]) < 0.985 || Math.abs((t.a[2] + t.b[2] + t.c[2]) / 3 - level.z) > 0.03)
        continue;
      const xs = [t.a[0], t.b[0], t.c[0]], ys = [t.a[1], t.b[1], t.c[1]];
      const d = (t.b[1] - t.c[1]) * (t.a[0] - t.c[0]) + (t.c[0] - t.b[0]) * (t.a[1] - t.c[1]);
      for (let x = Math.ceil(Math.min(...xs) * 2) / 2;x <= Math.max(...xs); x += 0.5)
        for (let y = Math.ceil(Math.min(...ys) * 2) / 2;y <= Math.max(...ys); y += 0.5) {
          const l1 = ((t.b[1] - t.c[1]) * (x - t.c[0]) + (t.c[0] - t.b[0]) * (y - t.c[1])) / d;
          const l2 = ((t.c[1] - t.a[1]) * (x - t.c[0]) + (t.a[0] - t.c[0]) * (y - t.c[1])) / d;
          if (l1 < -0.000001 || l2 < -0.000001 || 1 - l1 - l2 < -0.000001)
            continue;
          const h = above(x, y, level.z + 0.3);
          if (h === null)
            open++;
          else
            free.push(h - level.z);
        }
    }
    if (free.length < 12 || free.length < 0.6 * (free.length + open))
      continue;
    free.sort((p, q) => p - q);
    const room2 = free[Math.floor(free.length / 2)];
    if (room2 < 1.8)
      continue;
    storeys.push({ floor: level.z, room: r2(room2), samples: free.length, covered: r2(free.length / (free.length + open)) });
  }
  const doors = walls.flatMap((w) => w.openings.filter((o) => o.kind === "door" && o.height >= 1.5).map((o) => o.height));
  const door = doors.length ? Math.min(...doors) : null;
  const riser = stairs.length ? Math.max(...stairs.map((s) => s.riser)) : null;
  const room = storeys.length ? Math.min(...storeys.map((s) => s.room)) : null;
  const wants = [room && room < ROOM_LEAST ? ROOM_LEAST / room : 1, door && door < DOOR_LEAST ? DOOR_LEAST / door : 1];
  const scale = Math.min(Math.ceil(Math.max(...wants) * 20 - 0.000000001) / 20, LARGEST);
  const why = scale <= 1 ? "as built: its rooms and doors fit the avatar" : wants[0] >= wants[1] ? `its lowest rooms, ${room} m clear, to ${r2(room * scale)} m` : `its lowest door, ${door} m, to ${r2(door * scale)} m`;
  return { storeys, door, riser, scale: Math.max(1, scale), why, ...riser && riser > RISER_MOST && { relay: `its stairs' risers of ${riser} m: lay them again at ${RISER_MOST} m at most, more steps` } };
};
var hullOf = (points) => {
  const unique = [...new Map(points.map((p) => [`${Math.round(p[0] * 1000)},${Math.round(p[1] * 1000)}`, p])).values()].sort((p, q) => p[0] - q[0] || p[1] - q[1]);
  if (unique.length < 3)
    return unique;
  const turn = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const half = (list) => list.reduce((hull, p) => {
    while (hull.length >= 2 && turn(hull.at(-2), hull.at(-1), p) <= 0.000000001)
      hull.pop();
    hull.push(p);
    return hull;
  }, []);
  return [...half(unique).slice(0, -1), ...half([...unique].reverse()).slice(0, -1)];
};
var roofsOf = (triangles, { least = 1 } = {}) => {
  const planes = [];
  for (const t of triangles) {
    const n = t.normal[2] < 0 ? t.normal.map((v) => -v) : t.normal;
    if (n[2] >= 0.985 || n[2] <= 0.19)
      continue;
    const d = n[0] * t.a[0] + n[1] * t.a[1] + n[2] * t.a[2];
    const plane = planes.find((p) => p.material === t.material && Math.abs(p.n[0] - n[0]) < 0.02 && Math.abs(p.n[1] - n[1]) < 0.02 && Math.abs(p.n[2] - n[2]) < 0.02 && Math.abs(p.d - d) < 0.05);
    if (plane) {
      plane.points.push(t.a, t.b, t.c);
      plane.area += t.area;
    } else
      planes.push({ material: t.material, n, d, points: [t.a, t.b, t.c], area: t.area });
  }
  return planes.filter((plane) => plane.area >= least).sort((p, q) => q.area - p.area).map((plane) => {
    const hull = hullOf(plane.points), z = plane.points.map((p) => p[2]);
    return {
      material: plane.material,
      area: r2(plane.area),
      pitch: r2(Math.acos(plane.n[2]) * DEG),
      falls: r2((Math.atan2(plane.n[1], plane.n[0]) * DEG + 360) % 360),
      eaves: r2(Math.min(...z)),
      top: r2(Math.max(...z)),
      corners: simplifyLoop(hull, 0.05).map((p) => p.map(r2))
    };
  });
};
var stairsOf = (triangles) => {
  const byLevel = new Map;
  for (const t of triangles) {
    if (t.normal[2] < 0.985)
      continue;
    const key = Math.round((t.a[2] + t.b[2] + t.c[2]) / 3 / 0.01);
    (byLevel.get(key) ?? byLevel.set(key, []).get(key)).push(t);
  }
  const patches = [];
  for (const [key, list] of byLevel) {
    const groups = [];
    for (const t of list) {
      let box = { min: [Math.min(t.a[0], t.b[0], t.c[0]), Math.min(t.a[1], t.b[1], t.c[1])], max: [Math.max(t.a[0], t.b[0], t.c[0]), Math.max(t.a[1], t.b[1], t.c[1])], area: t.area };
      for (const g of groups.filter((g2) => box.min[0] <= g2.max[0] + 0.02 && box.max[0] >= g2.min[0] - 0.02 && box.min[1] <= g2.max[1] + 0.02 && box.max[1] >= g2.min[1] - 0.02)) {
        box = { min: [Math.min(box.min[0], g.min[0]), Math.min(box.min[1], g.min[1])], max: [Math.max(box.max[0], g.max[0]), Math.max(box.max[1], g.max[1])], area: box.area + g.area };
        groups.splice(groups.indexOf(g), 1);
      }
      groups.push(box);
    }
    for (const g of groups)
      patches.push({ z: key * 0.01, ...g });
  }
  const treads = patches.filter((p) => p.area >= 0.08 && p.area <= 15).sort((p, q) => p.z - q.z);
  const touches = (p, q) => q.min[0] <= p.max[0] + 0.05 && q.max[0] >= p.min[0] - 0.05 && q.min[1] <= p.max[1] + 0.05 && q.max[1] >= p.min[1] - 0.05;
  const middle = (p) => [(p.min[0] + p.max[0]) / 2, (p.min[1] + p.max[1]) / 2];
  const next = new Map;
  for (const p of treads) {
    const up = treads.filter((q) => q.z - p.z >= 0.07 && q.z - p.z <= 0.45 && touches(p, q)).sort((q, o) => q.z - o.z)[0];
    if (up)
      next.set(p, up);
  }
  const reached = new Set(next.values());
  const flights = [];
  for (const start of treads.filter((p) => next.has(p) && !reached.has(p))) {
    const steps = [start];
    while (next.has(steps.at(-1)) && steps.length < 60)
      steps.push(next.get(steps.at(-1)));
    if (steps.length < 3)
      continue;
    const [m0, m1] = [middle(steps[0]), middle(steps.at(-1))];
    const axis = Math.abs(m1[0] - m0[0]) >= Math.abs(m1[1] - m0[1]) ? 0 : 1, sign = Math.sign(m1[axis] - m0[axis]) || 1, other = 1 - axis;
    const nose = (p) => (sign > 0 ? p.min[axis] : p.max[axis]) * sign;
    const risers = steps.slice(1).map((p, i) => p.z - steps[i].z), runs = steps.slice(1).map((p, i) => nose(p) - nose(steps[i]));
    const width = Math.min(...steps.map((p) => p.max[other] - p.min[other])), tread = runs.reduce((a, b) => a + b, 0) / runs.length;
    if (tread < 0.15 || tread > 0.6 || width < 0.6 || Math.max(...risers) - Math.min(...risers) > 0.12 || runs.some((run) => run < 0.05))
      continue;
    flights.push({
      steps: steps.length,
      levels: steps.map((p) => r2(p.z)),
      riser: r2(risers.reduce((a, b) => a + b, 0) / risers.length),
      tread: r2(tread),
      width: r2(width),
      rises: `${sign > 0 ? "+" : "-"}${"xy"[axis]}`,
      foot: m0.map(r2),
      top: m1.map(r2)
    });
  }
  return flights;
};
var outlinesOf = (triangles, { least = 4, cell = 0.2 } = {}) => {
  const groups = new Map;
  for (const t of triangles) {
    if (Math.abs(t.normal[2]) < 0.985)
      continue;
    const z = Math.round((t.a[2] + t.b[2] + t.c[2]) / 3 / 0.05) * 0.05;
    const g = groups.get(`${t.material}|${z.toFixed(2)}`) ?? groups.set(`${t.material}|${z.toFixed(2)}`, { material: t.material, z, area: 0, triangles: [] }).get(`${t.material}|${z.toFixed(2)}`);
    g.area += t.area;
    g.triangles.push(t);
  }
  const kept = [...groups.values()].filter((g) => g.area >= least).map((g) => ({ ...g, ...boundsOf(g.triangles.flatMap((t) => [t.a, t.b, t.c])) }));
  for (const g of kept) {
    const twin = kept.find((o) => o !== g && !o.gone && !g.gone && o.material === g.material && Math.abs(o.area - g.area) <= 0.02 * g.area && [0, 1].every((k) => Math.abs(o.min[k] - g.min[k]) < 0.05 && Math.abs(o.max[k] - g.max[k]) < 0.05));
    if (twin) {
      twin.gone = true;
      g.bottom = Math.min(g.z, twin.z);
      g.z = Math.max(g.z, twin.z);
    }
  }
  return kept.filter((g) => !g.gone).sort((p, q) => q.area - p.area).map((g) => {
    const { min, max } = boundsOf(g.triangles.flatMap((t) => [t.a, t.b, t.c]));
    const size = Math.max(cell, Math.max(max[0] - min[0], max[1] - min[1]) / 400);
    const nx = Math.ceil((max[0] - min[0]) / size) + 2, ny = Math.ceil((max[1] - min[1]) / size) + 2;
    const x0 = min[0] - size, y0 = min[1] - size;
    const filled = new Uint8Array(nx * ny);
    for (const t of g.triangles) {
      const d = (t.b[1] - t.c[1]) * (t.a[0] - t.c[0]) + (t.c[0] - t.b[0]) * (t.a[1] - t.c[1]);
      const i0 = Math.floor((Math.min(t.a[0], t.b[0], t.c[0]) - x0) / size), i1 = Math.floor((Math.max(t.a[0], t.b[0], t.c[0]) - x0) / size);
      const j0 = Math.floor((Math.min(t.a[1], t.b[1], t.c[1]) - y0) / size), j1 = Math.floor((Math.max(t.a[1], t.b[1], t.c[1]) - y0) / size);
      for (let i = i0;i <= i1; i++)
        for (let j = j0;j <= j1; j++) {
          const px = x0 + (i + 0.5) * size, py = y0 + (j + 0.5) * size;
          const l1 = ((t.b[1] - t.c[1]) * (px - t.c[0]) + (t.c[0] - t.b[0]) * (py - t.c[1])) / d;
          const l2 = ((t.c[1] - t.a[1]) * (px - t.c[0]) + (t.a[0] - t.c[0]) * (py - t.c[1])) / d;
          if (l1 >= -0.000001 && l2 >= -0.000001 && 1 - l1 - l2 >= -0.000001)
            filled[j * nx + i] = 1;
        }
    }
    const at = (i, j) => i >= 0 && j >= 0 && i < nx && j < ny ? filled[j * nx + i] : 0;
    const edges = new Map;
    const add = (from, to) => (edges.get(from.join()) ?? edges.set(from.join(), []).get(from.join())).push(to);
    for (let j = 0;j < ny; j++)
      for (let i = 0;i < nx; i++) {
        if (!at(i, j))
          continue;
        if (!at(i, j - 1))
          add([i, j], [i + 1, j]);
        if (!at(i + 1, j))
          add([i + 1, j], [i + 1, j + 1]);
        if (!at(i, j + 1))
          add([i + 1, j + 1], [i, j + 1]);
        if (!at(i - 1, j))
          add([i, j + 1], [i, j]);
      }
    const loops = [];
    for (const [key] of edges) {
      while (edges.get(key)?.length) {
        const loop = [key.split(",").map(Number)];
        for (;; ) {
          const to = edges.get(loop.at(-1).join())?.pop();
          if (!to || to.join() === loop[0].join())
            break;
          loop.push(to);
        }
        const points = loop.map(([i, j]) => [x0 + i * size, y0 + j * size]);
        const area = points.reduce((sum, p, k) => sum + p[0] * points[(k + 1) % points.length][1] - points[(k + 1) % points.length][0] * p[1], 0) / 2;
        loops.push({ points: simplifyLoop(points, Math.max(0.12, size * 0.75)).map((p) => p.map(r2)), area });
      }
    }
    loops.sort((p, q) => q.area - p.area);
    return { material: g.material, z: r2(g.z), ...g.bottom !== undefined && { bottom: r2(g.bottom) }, area: r2(g.area), outline: loops[0]?.points ?? [], holes: loops.slice(1).filter((l) => l.area < 0).map((l) => l.points) };
  });
};
var profilesOf = (pieces, triangles, { least = 40 } = {}) => {
  const byPiece = new Map;
  for (const t of triangles)
    (byPiece.get(t.piece) ?? byPiece.set(t.piece, []).get(t.piece)).push(t);
  const seen = new Set, out = [];
  for (const piece of pieces) {
    if (piece.triangles < least || seen.has(kindOf(piece)) || Math.abs(piece.size[0] - piece.size[1]) > 0.1 * Math.max(piece.size[0], piece.size[1]))
      continue;
    const [cx, cy] = piece.middle, height = piece.size[2], rows = 40;
    const widest = Array.from({ length: rows + 1 }, () => new Float64Array(8));
    for (let row = 0;row <= rows; row++) {
      const h = piece.min[2] + Math.min(Math.max(row / rows, 0.002), 0.998) * height;
      for (const t of byPiece.get(piece.index) ?? [])
        for (const [u, v] of [[t.a, t.b], [t.b, t.c], [t.c, t.a]]) {
          if ((u[2] - h) * (v[2] - h) > 0 || u[2] === v[2])
            continue;
          const k = (h - u[2]) / (v[2] - u[2]), x = u[0] + k * (v[0] - u[0]) - cx, y = u[1] + k * (v[1] - u[1]) - cy;
          const sector = Math.floor((Math.atan2(y, x) + Math.PI) / (2 * Math.PI) * 8) % 8;
          widest[row][sector] = Math.max(widest[row][sector], Math.hypot(x, y));
        }
    }
    const full = widest.filter((row) => row.filter((v) => v > 0).length >= 6);
    const round = full.filter((row) => {
      const v = [...row].filter((r) => r > 0);
      return Math.min(...v) >= 0.875 * Math.max(...v);
    }).length;
    if (full.length < 5 || round < 0.8 * full.length)
      continue;
    seen.add(kindOf(piece));
    const profile = widest.map((row, i) => [Math.max(...row), i / rows * height]).filter(([r]) => r > 0);
    out.push({ name: piece.name, material: piece.material, at: [cx, cy, piece.min[2]].map(r2), height: r2(height), profile: simplify(profile, height / 100).map((p) => p.map((v) => Math.round(v * 1000) / 1000)) });
  }
  return out;
};
var toLinear = (c) => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
var toSrgb = (c) => c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
var labOf = ([r, g, b]) => {
  const f = (t) => t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
  const x = f((0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047), y = f(0.2126 * r + 0.7152 * g + 0.0722 * b), z = f((0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883);
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
};
var hexOf = (color) => `#${color.map((c) => Math.round(255 * Math.min(1, Math.max(0, toSrgb(c)))).toString(16).padStart(2, "0")).join("")}`;
var linearOf = (hex) => [1, 3, 5].map((i) => toLinear(parseInt(hex.slice(i, i + 2), 16) / 255));
var ROLES = [
  ["light", /light|lamp|lumen|emiss|glow/i, null],
  ["glass", /glass|window|pane|glaz/i, /^glass\//],
  ["roof", /roof|tile|slate|shingle/i, /^roofing\//],
  ["floor", /floor|parquet|laminat/i, /^(wood\/floor|paving\/(tiles|stone))/],
  ["wood", /wood|timber|plank|door|frame|furniture|oak|walnut|pine|acacia|acaia|teak|maple|cedar|birch/i, /^wood\//],
  ["metal", /metal|iron|steel|alumin|chrome|gate|rail/i, /^metal\//],
  ["brick", /brick|chimney/i, /^masonry\/brick/],
  ["stone", /stone|marble|granite|concrete|column|pillar|rock/i, /^(masonry|paving\/stone|plaster\/concrete)/],
  ["wall", /wall|plaster|stucco|paint|render|clad|siding/i, /^(plaster|masonry|wood\/siding|facade)/],
  ["paving", /path|pave|road|asphalt|drive|sidewalk|cobble|flagstone/i, /^paving\//],
  ["water", /water|pool/i, /^effects\/water/],
  ["ground", /grass|lawn|ground|soil|dirt|sand/i, /^ground\//],
  ["plants", /leaf|leaves|tree|hedge|bush|plant|green/i, /^ground\//],
  ["fabric", /fabric|cloth|sofa|cushion|carpet|rug|curtain|leather/i, /^fabric\//]
];
var paletteOf = (materials, triangles, bank = [], roles = []) => {
  const area = new Map;
  for (const t of triangles)
    area.set(t.material, (area.get(t.material) ?? 0) + t.area);
  const labs = bank.filter((m) => !(m.look ?? []).includes("cut-out")).map((m) => ({ id: m.id, lab: labOf(linearOf(m.color)) }));
  const nearest = (color, test) => {
    const target = labOf(color);
    return labs.filter((m) => !test || test.test(m.id)).map((m) => ({ id: m.id, d: Math.hypot(...m.lab.map((v, k) => v - target[k])) })).sort((p, q) => p.d - q.d).slice(0, 3).map((m) => `${m.id} ΔE ${m.d.toFixed(0)}`);
  };
  return materials.map((material, index) => {
    const [role, , category] = ROLES.find(([name]) => name === roles[index]) ?? ROLES.find(([, words]) => words.test(material.name)) ?? ["?", null, null];
    return {
      index,
      name: material.name,
      color: hexOf(material.color),
      area: r2(area.get(index) ?? 0),
      role,
      ...labs.length && { byRole: category ? nearest(material.color, category) : [], byColour: nearest(material.color) }
    };
  }).filter((m) => m.area > 0).sort((p, q) => q.area - p.area);
};
var planOf = (model, { scale = 1, bank = [], align = true } = {}) => {
  const raw = trianglesOf(model, scale), turn = align ? turnOf(raw) : 0;
  const triangles = turn ? turned(raw, -turn) : raw;
  const pieces = piecesOf(model, triangles);
  const { min, max } = boundsOf(triangles.flatMap((t) => [t.a, t.b, t.c]));
  const levels = levelsOf(triangles);
  const { repeats, largest } = repeatsOf(pieces);
  const walls = wallsOf(triangles, levels, pieces, model.materials), stairs = stairsOf(triangles);
  return {
    title: model.title ?? null,
    author: model.author ?? null,
    licence: model.licence ?? null,
    source: model.source ?? null,
    turn: Math.round(turn * 100) / 100,
    triangles: triangles.length,
    pieces: pieces.length,
    min: min.map(r2),
    max: max.map(r2),
    size: max.map((v, k) => r2(v - min[k])),
    palette: paletteOf(model.materials, triangles, bank, rolesOf(model.materials, pieces)),
    named: namedOf(pieces, model.materials),
    repeats,
    largest: largest.slice(0, 25).map((p) => ({ name: p.name, material: p.material, triangles: p.triangles, middle: p.middle.map(r2), size: p.size.map(r2) })),
    lights: (model.lights ?? []).map((light) => ({ ...light, at: turnPoint(light.at.map((v) => v * scale), -turn).map(r2) })),
    levels,
    walls,
    stairs,
    fit: fitOf(triangles, levels, walls, stairs),
    roofs: roofsOf(triangles),
    flats: outlinesOf(triangles),
    turned: profilesOf(pieces, triangles)
  };
};

// tools/model-plan.js
var here = dirname(fileURLToPath(import.meta.url));
var args = process.argv.slice(2);
var option = (flag) => args.includes(flag) ? args[args.indexOf(flag) + 1] : null;
var file = args[0];
if (!file || file.startsWith("--")) {
  console.error("usage: model-plan <model.glb | model.gltf> [--scale 0.01] [--as-is] [--json] [--out plan.json]");
  process.exit(2);
}
var bytes = new Uint8Array(readFileSync(file));
var bufferOf = (uri) => new Uint8Array(readFileSync(join(dirname(file), decodeURIComponent(uri))));
var model = readGltf(bytes, { bufferOf });
var parts = () => {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (view.getUint32(0, true) !== 1179937895)
    return { gltf: JSON.parse(new TextDecoder().decode(bytes)), binary: null };
  let gltf = null, binary = null;
  for (let at = 12;at + 8 <= bytes.byteLength; ) {
    const length = view.getUint32(at, true), type = view.getUint32(at + 4, true), chunk = bytes.subarray(at + 8, at + 8 + length);
    if (type === 1313821514)
      gltf = JSON.parse(new TextDecoder().decode(chunk));
    else
      binary = chunk;
    at += 8 + length;
  }
  return { gltf, binary };
};
var { gltf, binary } = parts();
var textured = [];
var work = mkdtempSync(join(tmpdir(), "model-plan-"));
try {
  for (const [index, material] of (gltf.materials ?? []).entries()) {
    const texture = material.pbrMetallicRoughness?.baseColorTexture ?? material.extensions?.KHR_materials_pbrSpecularGlossiness?.diffuseTexture;
    if (texture === undefined)
      continue;
    const image = gltf.images?.[gltf.textures?.[texture.index]?.source];
    if (!image)
      continue;
    const data = image.bufferView !== undefined ? (() => {
      const v = gltf.bufferViews[image.bufferView];
      return binary?.subarray(v.byteOffset ?? 0, (v.byteOffset ?? 0) + v.byteLength);
    })() : image.uri?.startsWith("data:") ? Uint8Array.from(atob(image.uri.split(",")[1]), (c) => c.charCodeAt(0)) : image.uri ? bufferOf(image.uri) : null;
    if (!data)
      continue;
    const path = join(work, `texture-${index}`);
    writeFileSync(path, data);
    const decoded = spawnSync("ffmpeg", ["-v", "error", "-i", path, "-vf", "scale=32:32:flags=area,format=rgb24", "-f", "rawvideo", "pipe:1"]);
    if (decoded.error || decoded.status !== 0 || !decoded.stdout?.length)
      continue;
    const linear = (c) => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    const sum = [0, 0, 0], pixels = decoded.stdout.length / 3;
    for (let i = 0;i < decoded.stdout.length; i += 3)
      for (let k = 0;k < 3; k++)
        sum[k] += linear(decoded.stdout[i + k] / 255);
    model.materials[index].color = sum.map((v, k) => v / pixels * model.materials[index].color[k]);
    textured.push(index);
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}
var catalog = [join(here, "../.claude/skills/ovgrid/catalog.json"), join(here, "../catalog.json")].find(existsSync);
var bank = catalog ? JSON.parse(readFileSync(catalog, "utf8")).materials : [];
var scale = Number(option("--scale") ?? unitsOf(model));
var plan = { ...planOf(model, { scale, bank, align: !args.includes("--as-is") }), scale, textured: textured.map((i) => model.materials[i].name), notes: model.notes };
if (!option("--scale") && scale !== 1)
  plan.notes.unshift(`read as ${{ 0.01: "centimetres", 0.001: "millimetres", 0.0254: "inches" }[scale]}: its storeys say so (--scale 1 keeps its units)`);
if (args.includes("--json") || option("--out")) {
  const json = JSON.stringify(plan, null, 1);
  if (option("--out"))
    writeFileSync(option("--out"), `${json}
`);
  else
    console.log(json);
  if (!args.includes("--json"))
    console.log(`${option("--out")}: the plan of ${file}`);
  process.exit(0);
}
var name = (index) => model.materials[index]?.name ?? `material ${index}`;
var xyz = (p) => `[${p.join(", ")}]`;
var some = (list, show = 12) => `${list.slice(0, show).map(xyz).join(" ")}${list.length > show ? ` … ${list.length - show} more` : ""}`;
var lines = [];
var say = (...text) => lines.push(text.join(""));
say(`«${plan.title ?? file}»${plan.author ? ` by ${plan.author}` : ""}${plan.licence ? ` — ${plan.licence}` : ""}${plan.source ? ` — ${plan.source}` : ""}`);
say(`${plan.triangles.toLocaleString("en")} triangles in ${plan.pieces} pieces; ${plan.size.join(" × ")} m: x ${plan.min[0]}…${plan.max[0]}, y ${plan.min[1]}…${plan.max[1]}, z ${plan.min[2]}…${plan.max[2]}`);
if (/\bND\b|NoDeriv/i.test(plan.licence ?? ""))
  say("  NoDerivatives: a rebuild adapts it — do not build from it.");
else if (/CC-BY/i.test(plan.licence ?? ""))
  say("  CC-BY: credit its author, licence and source in every object's origin.");
if (plan.turn)
  say(`  Its walls stand ${plan.turn}° from its axes: measured turned by ${-plan.turn}° so that they run along x and y (--as-is keeps its axes); stand the rebuild's objects turned ${plan.turn}° to face as it did.`);
for (const note of plan.notes)
  say(`  Note: ${note}`);
say(`
Materials (by area) — colour, m², role: the bank's nearest by role; by colour alone`);
for (const m of plan.palette)
  say(`  ${m.name}${textured.includes(m.index) ? " (textured)" : ""}  ${m.color}  ${m.area} m²  ${m.role}: ${m.byRole?.join(", ") || "—"}; ${m.byColour?.join(", ") ?? ""}`);
if (plan.lights.length) {
  say(`
Lights the model carries — where they stood (an empty node keeps the place, not the light)`);
  for (const light of plan.lights)
    say(`  ${light.name}: ${light.type}${light.intensity ? `, ${light.intensity}` : ""} at ${xyz(light.at)}`);
}
if (Object.keys(plan.named).length) {
  say(`
What names say (each kind alike: its size, where each stands)`);
  for (const [word, groups] of Object.entries(plan.named))
    for (const g of groups)
      say(`  ${word}: ${g.name} (${name(g.material)}) ${g.size.join(" × ")} ×${g.at.length}: ${some(g.at, 8)}`);
}
say(`
Levels — height: m² facing up / down, where, of what`);
for (const l of plan.levels.filter((l2) => l2.up + l2.down >= 2))
  say(`  z ${l.z}: ${l.up} / ${l.down} m², x ${l.min[0]}…${l.max[0]} y ${l.min[1]}…${l.max[1]}, ${l.materials.map(name).join(", ")}`);
say(`
Walls — material: from → to (length), foot–top, thickness (0 a single face), facing (° from +x, counter-clockwise)`);
say("  openings along it from its start: kind (cut through, or laid on it), width × height, at along, from z (its foot over the floor before it), filled by");
for (const w of plan.walls) {
  say(`  ${name(w.material)}: ${xyz(w.from)} → ${xyz(w.to)} (${w.length} m), z ${w.z[0]}–${w.z[1]}, ${w.thickness} thick, faces ${w.facing}°`);
  for (const o of w.openings)
    say(`    ${o.kind} (${o.cut ? "cut" : "laid on"}) ${o.width} × ${o.height} at ${o.along[0]}–${o.along[1]}, from z ${o.z[0]}${o.over === null ? "" : ` (${o.over} over the floor)`}${o.filled.length ? `, filled by ${o.filled.map(name).join(", ")}` : ""}`);
}
if (plan.stairs.length) {
  say(`
Stairs`);
  for (const s of plan.stairs)
    say(`  ${s.steps} treads rising ${s.rises} from ${xyz(s.foot)} to ${xyz(s.top)}: riser ${s.riser}, tread ${s.tread}, width ${s.width}; levels ${s.levels.join(", ")}`);
}
say(`
The avatar (1.8 m, its camera behind it): rooms 2.8 m clear, doors 2.2 m, risers 0.2 m at most`);
for (const storey of plan.fit.storeys)
  say(`  storey on z ${storey.floor}: rooms ${storey.room} m clear (${storey.samples} rays up, ${Math.round(storey.covered * 100)} % under a ceiling)`);
say(`  lowest door ${plan.fit.door ?? "—"} m; steepest riser ${plan.fit.riser ?? "—"} m`);
say(`  build it at ×${plan.fit.scale}: ${plan.fit.why}${plan.fit.relay ? `; ${plan.fit.relay}` : ""}`);
if (plan.roofs.length) {
  say(`
Roof slopes — material: pitch, falls towards (° from +x), eaves–top, area, corners [x, y, z]`);
  for (const r of plan.roofs)
    say(`  ${name(r.material)}: ${r.pitch}°, falls ${r.falls}°, z ${r.eaves}–${r.top}, ${r.area} m²: ${r.corners.map(xyz).join(" ")}`);
}
if (plan.flats.length) {
  say(`
Flat areas — material at height (a slab: its bottom–top), m²: outline [x, y]; holes`);
  for (const f of plan.flats)
    say(`  ${name(f.material)} at z ${f.bottom !== undefined ? `${f.bottom}–` : ""}${f.z}, ${f.area} m²: ${f.outline.map(xyz).join(" ")}${f.holes.length ? `; holes: ${f.holes.map((h) => h.map(xyz).join(" ")).join(" | ")}` : ""}`);
}
if (plan.turned.length) {
  say(`
Turned — a lathe's profile [radius, height over its foot]`);
  for (const t of plan.turned)
    say(`  ${t.name} (${name(t.material)}) at ${xyz(t.at)}, ${t.height} m: ${t.profile.map(xyz).join(" ")}`);
}
if (plan.repeats.length) {
  say(`
What repeats — ×count, size, where (middles)`);
  for (const r of plan.repeats)
    say(`  ${r.name} (${name(r.material)}) ×${r.count}, ${r.size.join(" × ")}, ${r.triangles} triangles: ${some(r.at)}`);
}
say(`
The largest of the rest`);
for (const p of plan.largest.slice(0, 15))
  say(`  ${p.name} (${name(p.material)}) ${p.size.join(" × ")} at ${xyz(p.middle)}, ${p.triangles} triangles`);
console.log(lines.join(`
`));
