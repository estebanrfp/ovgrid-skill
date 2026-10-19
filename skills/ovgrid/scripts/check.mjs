#!/usr/bin/env node
// Made by tools/build-skill-repo.js from OVGrid's tools/build-check.js: run with Node 18+ or Bun.
// tools/build-check.js
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// src/math.js
var add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
var sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
var scale = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
var dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
var cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0]
];
var length = (a) => Math.hypot(a[0], a[1], a[2]);
var normalize = (a) => scale(a, 1 / length(a));
var quatMultiply = (a, b) => [
  a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
  a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
  a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
  a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]
];
var quatAxisAngle = (axis, angle) => {
  const s = Math.sin(angle / 2);
  return [axis[0] * s, axis[1] * s, axis[2] * s, Math.cos(angle / 2)];
};
var quatNormalize = (q) => {
  const l = Math.hypot(q[0], q[1], q[2], q[3]);
  return [q[0] / l, q[1] / l, q[2] / l, q[3] / l];
};
var quatRotate = (q, v) => {
  const axis = [q[0], q[1], q[2]];
  const t = scale(cross(axis, v), 2);
  return add(add(v, scale(t, q[3])), cross(axis, t));
};
var quatFromBasis = (right, up, back) => {
  const [m00, m10, m20] = right;
  const [m01, m11, m21] = up;
  const [m02, m12, m22] = back;
  const trace = m00 + m11 + m22;
  if (trace > 0) {
    const s2 = 0.5 / Math.sqrt(trace + 1);
    return [(m21 - m12) * s2, (m02 - m20) * s2, (m10 - m01) * s2, 0.25 / s2];
  }
  if (m00 > m11 && m00 > m22) {
    const s2 = 2 * Math.sqrt(1 + m00 - m11 - m22);
    return [0.25 * s2, (m01 + m10) / s2, (m02 + m20) / s2, (m21 - m12) / s2];
  }
  if (m11 > m22) {
    const s2 = 2 * Math.sqrt(1 + m11 - m00 - m22);
    return [(m01 + m10) / s2, 0.25 * s2, (m12 + m21) / s2, (m02 - m20) / s2];
  }
  const s = 2 * Math.sqrt(1 + m22 - m00 - m11);
  return [(m02 + m20) / s, (m12 + m21) / s, 0.25 * s, (m10 - m01) / s];
};

// src/build/prim/params.js
var PROFILE = Object.freeze({ CIRCLE: 0, SQUARE: 1, ISOTRI: 2, EQUALTRI: 3, RIGHTTRI: 4, HALF_CIRCLE: 5 });
var HOLE = Object.freeze({ SAME: 0, CIRCLE: 16, SQUARE: 32, TRIANGLE: 48 });
var PATH = Object.freeze({ LINE: 16, CIRCLE: 32, CIRCLE_33: 33, CIRCLE2: 48, TEST: 64, FLEXIBLE: 128 });
var SHAPE_FIELDS = Object.freeze([
  "profileCurve",
  "profileBegin",
  "profileEnd",
  "hollow",
  "pathCurve",
  "pathBegin",
  "pathEnd",
  "scaleX",
  "scaleY",
  "shearX",
  "shearY",
  "twistBegin",
  "twistEnd",
  "radiusOffset",
  "taperX",
  "taperY",
  "revolutions",
  "skew"
]);
var LIMITS = Object.freeze({
  cutGap: 0.02,
  hollow: 0.99,
  hollowSquare: 0.7,
  holeMin: 0.01
});
var DEFAULT_PARAMS = Object.freeze({
  profileCurve: PROFILE.SQUARE,
  profileBegin: 0,
  profileEnd: 1,
  hollow: 0,
  pathCurve: PATH.LINE,
  pathBegin: 0,
  pathEnd: 1,
  scaleX: 1,
  scaleY: 1,
  shearX: 0,
  shearY: 0,
  twistBegin: 0,
  twistEnd: 0,
  radiusOffset: 0,
  taperX: 0,
  taperY: 0,
  revolutions: 1,
  skew: 0
});
var CUT = 50000;
var roundAway = (x) => Math.sign(x) * Math.round(Math.abs(x)) + 0;
var clamp = (value, min, max) => Math.min(Math.max(value, min), max);
var byte = { min: 0, max: 255, encode: (v) => Math.trunc(v), decode: (u) => u };
var cut = { min: 0, max: 65535, encode: (v) => roundAway(v * CUT), decode: (u) => u / CUT };
var cutEnd = { min: 0, max: 65535, encode: (v) => CUT - roundAway(v * CUT), decode: (u) => (CUT - u) / CUT };
var scale2 = { min: 0, max: 255, encode: (v) => 200 - roundAway(v * 100), decode: (u) => (200 - u) / 100 };
var signed = { min: -128, max: 127, encode: (v) => roundAway(v * 100), decode: (s) => s / 100 };
var revolutions = { min: 0, max: 255, encode: (v) => roundAway((v - 1) * 200 / 3), decode: (u) => (200 + 3 * u) / 200 };
var shear = {
  min: 0,
  max: 255,
  encode: (v) => ((s) => s < 0 ? s + 256 : s)(clamp(roundAway(v * 100), -128, 127)),
  decode: (u) => (u < 128 ? u : u - 256) / 100
};
var CODECS = [byte, cut, cutEnd, cut, byte, cut, cutEnd, scale2, scale2, shear, shear, signed, signed, signed, signed, signed, revolutions, signed];
var CODEC = Object.fromEntries(SHAPE_FIELDS.map((name, i) => [name, CODECS[i]]));
var snap = (name, value) => CODEC[name].decode(CODEC[name].encode(value));
var decodeShape = (shape) => Object.fromEntries(SHAPE_FIELDS.map((name, i) => [name, CODECS[i].decode(shape[i])]));
var encodeShape = (params) => SHAPE_FIELDS.map((name, i) => {
  const value = Number.isFinite(params[name]) ? params[name] : DEFAULT_PARAMS[name];
  return clamp(CODECS[i].encode(value), CODECS[i].min, CODECS[i].max);
});
var constrainParams = (input) => {
  const errors = [];
  const value = (name) => input[name] ?? DEFAULT_PARAMS[name];
  const limit = (name, v, min, max, tolerance = 0.001) => {
    if (!(v >= min - tolerance && v <= max + tolerance))
      errors.push(name);
    return Number.isFinite(v) ? clamp(v, min, max) : clamp(DEFAULT_PARAMS[name], min, max);
  };
  const curve = (name, fallback) => {
    const v = value(name);
    if (Number.isInteger(v) && v >= 0 && v <= 255)
      return v;
    errors.push(name);
    return fallback;
  };
  let profileCurve = curve("profileCurve", PROFILE.SQUARE);
  let pathCurve = curve("pathCurve", PATH.LINE);
  if ((profileCurve & 15) > PROFILE.HALF_CIRCLE) {
    errors.push("profileCurve");
    profileCurve = PROFILE.SQUARE;
  }
  if (profileCurve >> 4 > 3) {
    errors.push("profileCurve");
    profileCurve &= 15;
  }
  if (pathCurve >> 4 < 1 || pathCurve >> 4 > 8) {
    errors.push("pathCurve");
    pathCurve = PATH.LINE;
  }
  const profile = profileCurve & 15;
  const hole = profileCurve & 240;
  const cuts = (prefix, snapEnd) => {
    let end = value(`${prefix}End`);
    if (snapEnd && end >= 0.0149 && end < LIMITS.cutGap)
      end = LIMITS.cutGap;
    let begin = limit(`${prefix}Begin`, value(`${prefix}Begin`), 0, 1 - LIMITS.cutGap);
    end = limit(`${prefix}End`, end, LIMITS.cutGap, 1);
    begin = limit(`${prefix}Begin`, begin, 0, end - LIMITS.cutGap, 0.01);
    return [snap(`${prefix}Begin`, begin), snap(`${prefix}End`, end)];
  };
  const [profileBegin, profileEnd] = cuts("profile", true);
  const [pathBegin, pathEnd] = cuts("path", false);
  const squareHole = hole === HOLE.SQUARE && [PROFILE.CIRCLE, PROFILE.HALF_CIRCLE, PROFILE.EQUALTRI].includes(profile);
  const hollow = snap("hollow", limit("hollow", value("hollow"), 0, squareHole ? LIMITS.hollowSquare : LIMITS.hollow));
  const holeSize = pathCurve === PATH.CIRCLE && profile !== PROFILE.HALF_CIRCLE;
  const scaleX = snap("scaleX", limit("scaleX", value("scaleX"), holeSize ? LIMITS.holeMin : 0, holeSize ? 1 : 2));
  const scaleY = snap("scaleY", limit("scaleY", value("scaleY"), holeSize ? LIMITS.holeMin : 0, holeSize ? 0.5 : 2));
  const [shearX, shearY] = ["shearX", "shearY"].map((name) => snap(name, limit(name, value(name), -0.5, 0.5)));
  const [twistBegin, twistEnd, taperX, taperY] = ["twistBegin", "twistEnd", "taperX", "taperY"].map((name) => snap(name, limit(name, value(name), -1, 1)));
  const turns = snap("revolutions", limit("revolutions", value("revolutions"), 1, 4));
  let radiusOffset = 0;
  if (holeSize) {
    const offset = value("radiusOffset");
    const taper = Math.sign(taperY) * Math.sign(offset) < 0 ? 0 : Math.abs(taperY);
    const max = Math.max(0, 1 - scaleY * (1 - taper) / (1 - scaleY));
    const step = Math.floor(max * 100 + 0.000000001) / 100;
    radiusOffset = snap("radiusOffset", clamp(limit("radiusOffset", offset, -max, max, 0.01), -step, step));
  }
  let skew = limit("skew", value("skew"), -0.95, 0.95);
  if (turns !== 1) {
    const min = 1 - 1 / (turns * scaleX + 1);
    const step = Math.min(Math.ceil(min * 100 - 0.000000001) / 100, 0.95);
    if (Math.abs(skew) < min - 0.01)
      errors.push("skew");
    if (Math.abs(skew) < step)
      skew = skew < 0 ? -step : step;
  }
  skew = snap("skew", skew);
  return {
    params: {
      profileCurve,
      profileBegin,
      profileEnd,
      hollow,
      pathCurve,
      pathBegin,
      pathEnd,
      scaleX,
      scaleY,
      shearX,
      shearY,
      twistBegin,
      twistEnd,
      radiusOffset,
      taperX,
      taperY,
      revolutions: turns,
      skew
    },
    errors: [...new Set(errors)]
  };
};
var normalizeShape = (shape) => encodeShape(constrainParams(decodeShape(shape)).params);
var UPRIGHT = Object.freeze([0, Math.SQRT1_2, 0, Math.SQRT1_2]);
var AS_IS = Object.freeze([0, 0, 0, 1]);
var preset = (params, rotation = AS_IS) => Object.freeze({ shape: Object.freeze(encodeShape({ ...DEFAULT_PARAMS, ...params })), rezRotation: rotation });
var { SQUARE, CIRCLE, EQUALTRI, HALF_CIRCLE } = PROFILE;
var PRESETS = Object.freeze({
  cube: preset({ profileCurve: SQUARE }),
  prism: preset({ profileCurve: SQUARE, scaleX: 0, shearX: -0.5 }),
  pyramid: preset({ profileCurve: SQUARE, scaleX: 0, scaleY: 0 }),
  tetrahedron: preset({ profileCurve: EQUALTRI, scaleX: 0, scaleY: 0 }),
  cylinder: preset({ profileCurve: CIRCLE }),
  hemiCylinder: preset({ profileCurve: CIRCLE, profileBegin: 0.25, profileEnd: 0.75 }),
  cone: preset({ profileCurve: CIRCLE, scaleX: 0, scaleY: 0 }),
  hemiCone: preset({ profileCurve: CIRCLE, scaleX: 0, scaleY: 0, profileBegin: 0.25, profileEnd: 0.75 }),
  sphere: preset({ profileCurve: HALF_CIRCLE, pathCurve: PATH.CIRCLE }, UPRIGHT),
  hemiSphere: preset({ profileCurve: HALF_CIRCLE, pathCurve: PATH.CIRCLE, pathEnd: 0.5 }),
  torus: preset({ profileCurve: CIRCLE, pathCurve: PATH.CIRCLE, scaleY: 0.25 }, UPRIGHT),
  tube: preset({ profileCurve: SQUARE, pathCurve: PATH.CIRCLE, scaleY: 0.25 }, UPRIGHT),
  ring: preset({ profileCurve: EQUALTRI, pathCurve: PATH.CIRCLE, scaleY: 0.25 }, UPRIGHT)
});

// src/build/kinds/mesh.js
var WELD = 1e6;
var FLAT = 0.000000000001;
var sub2 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
var cross2 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
var dot2 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
var unit = (v) => {
  const length2 = Math.hypot(v[0], v[1], v[2]);
  return length2 > FLAT ? [v[0] / length2, v[1] / length2, v[2] / length2] : [0, 0, 1];
};
var area2 = (points) => points.reduce((sum, [x, y], i) => {
  const [nx, ny] = points[(i + 1) % points.length];
  return sum + x * ny - nx * y;
}, 0);
var turn = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
var triangulate = (points) => {
  const order = points.map((_, i) => i);
  if (area2(points) < 0)
    order.reverse();
  const triangles = [];
  const inside = (p, a, b, c) => turn(a, b, p) > FLAT && turn(b, c, p) > FLAT && turn(c, a, p) > FLAT;
  while (order.length > 3) {
    const n = order.length;
    let ear = -1, flattest = 0, least = Infinity;
    for (let i2 = 0;i2 < n && ear < 0; i2++) {
      const [ia, ib, ic] = [order[(i2 + n - 1) % n], order[i2], order[(i2 + 1) % n]];
      const t = turn(points[ia], points[ib], points[ic]);
      if (Math.abs(t) < least)
        [least, flattest] = [Math.abs(t), i2];
      if (t <= FLAT)
        continue;
      if (!order.some((j) => j !== ia && j !== ib && j !== ic && inside(points[j], points[ia], points[ib], points[ic])))
        ear = i2;
    }
    const i = ear >= 0 ? ear : flattest;
    triangles.push([order[(i + n - 1) % n], order[i], order[(i + 1) % n]]);
    order.splice(i, 1);
  }
  if (order.length === 3)
    triangles.push(order);
  return triangles;
};
var createMesh = (slots) => {
  const faces = Array.from({ length: slots }, () => ({ positions: [], normals: [], uvs: [], indices: [] }));
  const vertex = (slot, position, normal, uv) => {
    const face = faces[slot];
    face.positions.push(position[0], position[1], position[2]);
    face.normals.push(normal[0], normal[1], normal[2]);
    face.uvs.push(uv[0], uv[1]);
    return face.positions.length / 3 - 1;
  };
  const triangle = (slot, a, b, c) => faces[slot].indices.push(a, b, c);
  const quad = (slot, a, b, c, d) => {
    triangle(slot, a, b, c);
    triangle(slot, a, c, d);
  };
  const polygon = (slot, points, outward, uvOf) => {
    let normal = unit(points.reduce((sum, p, i) => {
      const q = points[(i + 1) % points.length];
      return [sum[0] + (p[1] - q[1]) * (p[2] + q[2]), sum[1] + (p[2] - q[2]) * (p[0] + q[0]), sum[2] + (p[0] - q[0]) * (p[1] + q[1])];
    }, [0, 0, 0]));
    if (dot2(normal, outward) < 0)
      normal = normal.map((v2) => -v2);
    const u = unit(Math.abs(normal[2]) < 0.9 ? cross2([0, 0, 1], normal) : cross2(normal, [1, 0, 0]));
    const v = cross2(normal, u);
    const flat = points.map((p) => [dot2(p, u), dot2(p, v)]);
    const first = points.map((p, i) => vertex(slot, p, normal, Array.isArray(uvOf) ? uvOf[i] : uvOf(p, normal, slot)));
    for (const [a, b, c] of triangulate(flat))
      triangle(slot, first[a], first[b], first[c]);
  };
  const pack = (size, centre = [0, 0, 0]) => {
    const total = faces.reduce((sum, face) => sum + face.positions.length / 3, 0);
    const Index = total > 65535 ? Uint32Array : Uint16Array;
    const positions = new Float32Array(total * 3), normals = new Float32Array(total * 3), uvs = new Float32Array(total * 2);
    const welded = new Index(total), heads = new Map, chain = new Int32Array(total), rounded = new Float64Array(total * 3);
    const indices = new Index(faces.reduce((sum, face) => sum + face.indices.length, 0)), slotsOut = [];
    const [sx, sy, sz] = size, [cx, cy, cz] = centre;
    let minX = Infinity, minY = Infinity, minZ = Infinity, maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    let base = 0, used = 0;
    faces.forEach((face, slot) => {
      const count = face.positions.length / 3;
      const { positions: from, normals: across, uvs: laid } = face;
      for (let i = 0;i < count; i++) {
        const v = base + i, o = v * 3, f = i * 3;
        const x = (from[f] - cx) / sx, y = (from[f + 1] - cy) / sy, z = (from[f + 2] - cz) / sz;
        positions[o] = x;
        positions[o + 1] = y;
        positions[o + 2] = z;
        if (x < minX)
          minX = x;
        if (x > maxX)
          maxX = x;
        if (y < minY)
          minY = y;
        if (y > maxY)
          maxY = y;
        if (z < minZ)
          minZ = z;
        if (z > maxZ)
          maxZ = z;
        const nx = across[f] * sx, ny = across[f + 1] * sy, nz = across[f + 2] * sz;
        const length2 = Math.sqrt(nx * nx + ny * ny + nz * nz);
        normals[o] = length2 > FLAT ? nx / length2 : 0;
        normals[o + 1] = length2 > FLAT ? ny / length2 : 0;
        normals[o + 2] = length2 > FLAT ? nz / length2 : 1;
        uvs[v * 2] = laid[i * 2];
        uvs[v * 2 + 1] = laid[i * 2 + 1];
        const rx = rounded[o] = Math.round(positions[o] * WELD), ry = rounded[o + 1] = Math.round(positions[o + 1] * WELD), rz = rounded[o + 2] = Math.round(positions[o + 2] * WELD);
        const hash = Math.imul(rx | 0, 73856093) ^ Math.imul(ry | 0, 19349663) ^ Math.imul(rz | 0, 83492791) | 0;
        const head = heads.get(hash) ?? -1;
        let same = head;
        while (same >= 0 && (rounded[same * 3] !== rx || rounded[same * 3 + 1] !== ry || rounded[same * 3 + 2] !== rz))
          same = chain[same];
        if (same < 0) {
          chain[v] = head;
          heads.set(hash, v);
          welded[v] = v;
        } else
          welded[v] = same;
      }
      const first = used;
      const { indices: list } = face;
      for (let i = 0;i < list.length; i += 3) {
        const a = list[i] + base, b = list[i + 1] + base, c = list[i + 2] + base;
        if (welded[a] === welded[b] || welded[b] === welded[c] || welded[c] === welded[a])
          continue;
        indices[used++] = a;
        indices[used++] = b;
        indices[used++] = c;
      }
      slotsOut.push({ id: slot, first, count: used - first });
      base += count;
    });
    const bounds = total ? { min: [minX, minY, minZ], max: [maxX, maxY, maxZ] } : { min: [0, 0, 0], max: [0, 0, 0] };
    return { positions, normals, uvs, indices: indices.slice(0, used), slots: slotsOut, welded, bounds };
  };
  return { vertex, triangle, quad, polygon, pack };
};
var pieceOf = (asset, keep) => {
  const { positions, normals, uvs, indices, slots } = asset;
  const count = positions.length / 3;
  const kept = slots.map((slot) => keep(slot.id));
  const used = new Uint8Array(count);
  slots.forEach(({ first, count: n }, s) => {
    if (kept[s])
      for (let i = first;i < first + n; i++)
        used[indices[i]] = 1;
  });
  const map = new Int32Array(count);
  let total = 0;
  for (let v = 0;v < count; v++)
    map[v] = used[v] ? total++ : -1;
  const Index = total > 65535 ? Uint32Array : Uint16Array;
  const out = { positions: new Float32Array(total * 3), normals: new Float32Array(total * 3), uvs: new Float32Array(total * 2), welded: new Index(total) };
  const firsts = new Map;
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (let v = 0;v < count; v++) {
    const w = map[v];
    if (w < 0)
      continue;
    out.positions.set(positions.subarray(v * 3, v * 3 + 3), w * 3);
    out.normals.set(normals.subarray(v * 3, v * 3 + 3), w * 3);
    out.uvs.set(uvs.subarray(v * 2, v * 2 + 2), w * 2);
    const head = asset.welded[v];
    out.welded[w] = firsts.get(head) ?? (firsts.set(head, w), w);
    for (let k = 0;k < 3; k++) {
      min[k] = Math.min(min[k], out.positions[w * 3 + k]);
      max[k] = Math.max(max[k], out.positions[w * 3 + k]);
    }
  }
  const list = new Index(slots.reduce((sum, { count: n }, s) => sum + (kept[s] ? n : 0), 0));
  let at = 0;
  const slotsOut = slots.map(({ id, first, count: n }, s) => {
    const start = at;
    if (kept[s])
      for (let i = first;i < first + n; i++)
        list[at++] = map[indices[i]];
    return { id, first: start, count: at - start };
  });
  const bounds = total ? { min, max } : { min: [0, 0, 0], max: [0, 0, 0] };
  return { positions: out.positions, normals: out.normals, uvs: out.uvs, indices: list, slots: slotsOut, welded: out.welded, bounds };
};
var addBox = (mesh, min, max, slotOf, uvOf, place = null) => {
  const corner = (x, y, z) => [x ? max[0] : min[0], y ? max[1] : min[1], z ? max[2] : min[2]];
  for (let axis = 0;axis < 3; axis++) {
    for (const sign of [-1, 1]) {
      const [a, b] = [(axis + 1) % 3, (axis + 2) % 3];
      const at = (s, t) => {
        const bits = [0, 0, 0];
        bits[axis] = sign > 0 ? 1 : 0;
        bits[a] = s;
        bits[b] = t;
        return corner(...bits);
      };
      const outward = [0, 0, 0];
      outward[axis] = sign;
      const slot = slotOf(axis, sign);
      const corners = [at(0, 0), at(1, 0), at(1, 1), at(0, 1)];
      if (!place)
        mesh.polygon(slot, corners, outward, uvOf);
      else
        mesh.polygon(slot, corners.map(place), sub2(place(outward), place([0, 0, 0])), corners.map((p) => uvOf(p, outward, slot)));
    }
  }
};
var addBeam = (mesh, slot, from, to, up, width, height) => {
  const along = unit(sub2(to, from));
  const side = unit(cross2(along, up));
  const over = cross2(side, along);
  const length2 = Math.hypot(...sub2(to, from));
  const point = (t, s, h) => [0, 1, 2].map((k) => from[k] + along[k] * t * length2 + side[k] * s * width / 2 + over[k] * h * height / 2);
  const faces = [
    [[0, -1, -1], [1, -1, -1], [1, -1, 1], [0, -1, 1]],
    [[0, 1, 1], [1, 1, 1], [1, 1, -1], [0, 1, -1]],
    [[0, -1, 1], [1, -1, 1], [1, 1, 1], [0, 1, 1]],
    [[0, 1, -1], [1, 1, -1], [1, -1, -1], [0, -1, -1]]
  ];
  for (const corners of faces) {
    const points = corners.map(([t, s, h]) => point(t, s, h));
    const outward = sub2(point(0.5, corners[0][1] + corners[2][1], corners[0][2] + corners[2][2]), point(0.5, 0, 0));
    mesh.polygon(slot, points, outward, (p) => [dot2(sub2(p, from), along), dot2(sub2(p, from), side) + dot2(sub2(p, from), over)]);
  }
  for (const t of [0, 1]) {
    const points = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([s, h]) => point(t, s, h));
    mesh.polygon(slot, points, t ? along : along.map((v) => -v), (p) => [dot2(sub2(p, from), side), dot2(sub2(p, from), over)]);
  }
};
var addExtrusion = (mesh, profile, axis, from, to, endSlot, slotOf, uvOf) => {
  const [a, b] = [(axis + 1) % 3, (axis + 2) % 3];
  const point = ([u, v], w) => {
    const p = [0, 0, 0];
    p[axis] = w;
    p[a] = u;
    p[b] = v;
    return p;
  };
  const along = point([0, 0], 1);
  const reversed = area2(profile) < 0;
  const ring = reversed ? [...profile].reverse() : profile;
  mesh.polygon(endSlot, ring.map((q) => point(q, to)), along, uvOf);
  mesh.polygon(endSlot, ring.map((q) => point(q, from)), along.map((v) => -v), uvOf);
  ring.forEach((q, i) => {
    const next = ring[(i + 1) % ring.length];
    const normal = unit(point([next[1] - q[1], -(next[0] - q[0])], 0));
    const slot = slotOf(normal, reversed ? ring.length - 2 - i < 0 ? ring.length - 1 : ring.length - 2 - i : i);
    const corners = [point(q, from), point(next, from), point(next, to), point(q, to)];
    const [p0, p1, p2, p3] = corners.map((p) => mesh.vertex(slot, p, normal, uvOf(p, normal, slot)));
    mesh.quad(slot, p0, p1, p2, p3);
  });
};
var addPrism = (mesh, profile, x0, x1, endSlot, slotOf, uvOf) => addExtrusion(mesh, profile, 0, x0, x1, endSlot, slotOf, uvOf);
var remembered = (measure, keep = 16) => {
  const kept = new Map;
  return (value) => {
    const key = JSON.stringify(value);
    let found = kept.get(key);
    if (found === undefined) {
      found = measure(value);
      if (kept.size >= keep)
        kept.delete(kept.keys().next().value);
      kept.set(key, found);
    }
    return found;
  };
};
var solidBox = (min, max, rotation = null) => {
  const half = max.map((v, k) => (v - min[k]) / 2);
  return { type: "box", half, radius: Math.min(0.01, ...half), at: min.map((v, k) => (v + max[k]) / 2), ...rotation && { rotation } };
};
var boxUv = (p, n, origin, across, up) => {
  const x = p[0] - origin[0], y = p[1] - origin[1], z = p[2] - origin[2];
  const ax = Math.abs(n[0]), ay = Math.abs(n[1]), az = Math.abs(n[2]);
  if (az >= ax && az >= ay)
    return n[2] > 0 ? [x / across, y / up] : [x / across, -y / up];
  if (ay >= ax)
    return n[1] < 0 ? [x / across, z / up] : [-x / across, z / up];
  return n[0] > 0 ? [y / across, z / up] : [-y / across, z / up];
};

// src/build/kinds/rock.js
var BOX = [-0.5, -0.5, -0.5];
var SIDES = [6, 8, 12, 16];
var FINEST = SIDES[3];
var KEEP = 64;
var boxes = new Map;
var hash = (x, y, z, seed) => {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(z, 1274126177) + Math.imul(seed, 1442695041) | 0;
  h = Math.imul(h ^ h >>> 13, 1274126177);
  return ((h ^ h >>> 16) >>> 0) / 4294967296;
};
var noise = (x, y, z, seed) => {
  const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
  let fx = x - ix, fy = y - iy, fz = z - iz;
  fx = fx * fx * (3 - 2 * fx);
  fy = fy * fy * (3 - 2 * fy);
  fz = fz * fz * (3 - 2 * fz);
  const a = hash(ix, iy, iz, seed), b = hash(ix + 1, iy, iz, seed), c = hash(ix, iy + 1, iz, seed), d = hash(ix + 1, iy + 1, iz, seed);
  const e = hash(ix, iy, iz + 1, seed), f = hash(ix + 1, iy, iz + 1, seed), g = hash(ix, iy + 1, iz + 1, seed), h = hash(ix + 1, iy + 1, iz + 1, seed);
  const near = a + (b - a) * fx + (c + (d - c) * fx - a - (b - a) * fx) * fy;
  const far = e + (f - e) * fx + (g + (h - g) * fx - e - (f - e) * fx) * fy;
  return (near + (far - near) * fz) * 2 - 1;
};
var fbm = (x, y, z, seed, octaves, gain) => {
  let sum = 0, amplitude = 1, scale3 = 1;
  for (let i = 0;i < octaves; i++, amplitude *= gain, scale3 *= 2.03)
    sum += amplitude * noise(x * scale3, y * scale3, z * scale3, seed + i * 7919);
  return sum;
};
var randomOf = (seed) => () => {
  seed = seed + 1831565813 | 0;
  let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
};
var sampled = ({ roughness, elongation }, seed, n, floor) => {
  const stretch = 1 + 2 * elongation;
  const random = randomOf(seed);
  const chips = new Float64Array(4 * (6 + Math.round(10 * roughness)));
  for (let c = 0;c < chips.length; c += 4) {
    const z = random() * 2 - 1, angle = random() * 2 * Math.PI, r = Math.sqrt(1 - z * z);
    chips[c] = r * Math.cos(angle);
    chips[c + 1] = r * Math.sin(angle);
    chips[c + 2] = z;
    chips[c + 3] = 0.5 * Math.hypot(chips[c] * stretch, chips[c + 1], chips[c + 2]) * (1 - (0.08 + random() * 0.24) * (0.6 + 0.8 * roughness));
  }
  const lumps = 0.14 + 0.1 * roughness, rough = 0.06 * roughness;
  const points = new Float64Array((n + 1) * n * 3);
  for (let row = 0, o = 0;row <= n; row++) {
    const polar = row / n * Math.PI, along = Math.cos(polar), across = Math.sin(polar);
    for (let column = 0;column < n; column++, o += 3) {
      const round = column / n * 2 * Math.PI;
      const dx = along, dy = across * Math.cos(round), dz = across * Math.sin(round);
      const blocky = 0.5 + 0.5 / Math.cbrt(Math.abs(dx) ** 3 + Math.abs(dy) ** 3 + Math.abs(dz) ** 3);
      const radius = 0.5 * blocky * (1 + lumps * fbm(dx * 1.6 + 11, dy * 1.6 + 11, dz * 1.6 + 11, seed, 3, 0.5) + rough * fbm(dx * 7 + 3, dy * 7 + 3, dz * 7 + 3, seed + 101, 2, 0.6));
      let x = dx * radius * stretch, y = dy * radius, z = dz * radius;
      for (let c = 0;c < chips.length; c += 4) {
        const past = x * chips[c] + y * chips[c + 1] + z * chips[c + 2] - chips[c + 3];
        if (past <= 0)
          continue;
        x -= past * chips[c];
        y -= past * chips[c + 1];
        z -= past * chips[c + 2];
      }
      points[o] = x;
      points[o + 1] = y;
      points[o + 2] = Math.max(z, floor);
    }
  }
  return points;
};
var boxOf = (params, seed) => {
  const key = `${seed}|${params.roughness}|${params.elongation}|${params.base}`;
  if (boxes.has(key))
    return boxes.get(key);
  const points = sampled(params, seed, FINEST, -Infinity);
  let low = Infinity;
  for (let i = 2;i < points.length; i += 3)
    low = Math.min(low, points[i]);
  const floor = low * (1 - params.base);
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0;i < points.length; i += 3) {
    for (let k = 0;k < 3; k++) {
      const v = k === 2 ? Math.max(points[i + 2], floor) : points[i + k];
      min[k] = Math.min(min[k], v);
      max[k] = Math.max(max[k], v);
    }
  }
  const box = { floor, min, max };
  boxes.set(key, box);
  if (boxes.size > KEEP)
    boxes.delete(boxes.keys().next().value);
  return box;
};
var rock = Object.freeze({
  name: "rock",
  label: "Rock",
  description: "A rock: a sculpted sphere, lumped and chipped by its seed and cut flat underneath to sit on the ground. Its length (x) is its width (y) drawn out by its elongation; a few hundred triangles at most, the detail left to its texture's relief.",
  faces: ["surface"],
  shape: "sphere",
  seeded: true,
  size: [1, 0.8, 0.6],
  sizeNote: "its width (y) and height (z) its own; its length (x) its width drawn out by its elongation",
  params: [
    { name: "roughness", label: "Roughness", min: 0, max: 1, default: 0.5, step: 0.01, description: "How broken its surface is: 0 a smooth, lumpy pebble; 1 jagged, chipped all over." },
    { name: "edges", label: "Edges", min: 0, max: 1, default: 0, step: 0.01, description: "How its facets meet: 0 faceted, low-poly, each facet flat with hard edges; 1 rounded, shaded smoothly across them." },
    { name: "base", label: "Flat base", min: 0, max: 1, default: 0.3, step: 0.01, description: "How much of its underside is cut flat, to sit on the ground: 0 none, 1 up to half its height." },
    { name: "elongation", label: "Elongation", min: 0, max: 1, default: 0.25, step: 0.01, description: "How long it is for its width: its length (x) is 1 + 2 × this times its width (y)." }
  ],
  fit: ({ elongation }, [, y, z]) => [y * (1 + 2 * elongation), y, z],
  resize: (params, [x, y]) => ({ ...params, elongation: (x / y - 1) / 2 }),
  collider: "hull",
  mesh: (params, seed, level) => {
    const n = SIDES[level];
    const { floor, min, max } = boxOf(params, seed);
    const points = sampled(params, seed, n, floor);
    for (let i = 0;i < points.length; i += 3) {
      for (let k = 0;k < 3; k++)
        points[i + k] = Math.min(Math.max((points[i + k] - min[k]) / (max[k] - min[k]) - 0.5, -0.5), 0.5);
    }
    const indexOf = (row, column) => row === 0 ? 0 : row === n ? 1 : 2 + (row - 1) * n + column % n;
    const pointOf = (row, column) => (row * n + column % n) * 3;
    const corners = new Int32Array(n * n * 6 * 2);
    for (let row = 0, t = 0;row < n; row++) {
      for (let column = 0;column < n; column++) {
        corners.set([row, column, row + 1, column, row + 1, column + 1, row, column, row + 1, column + 1, row, column + 1], t);
        t += 12;
      }
    }
    const count = corners.length / 6;
    const flat = new Float64Array(count * 3), smooth = new Float64Array((2 + (n - 1) * n) * 3);
    for (let t = 0;t < count; t++) {
      const [a, b, c] = [0, 1, 2].map((k) => pointOf(corners[t * 6 + k * 2], corners[t * 6 + k * 2 + 1]));
      const ux = points[b] - points[a], uy = points[b + 1] - points[a + 1], uz = points[b + 2] - points[a + 2];
      const vx = points[c] - points[a], vy = points[c + 1] - points[a + 1], vz = points[c + 2] - points[a + 2];
      const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      const length2 = Math.hypot(nx, ny, nz) || 1;
      flat[t * 3] = nx / length2;
      flat[t * 3 + 1] = ny / length2;
      flat[t * 3 + 2] = nz / length2;
      for (let k = 0;k < 3; k++) {
        const s = indexOf(corners[t * 6 + k * 2], corners[t * 6 + k * 2 + 1]) * 3;
        smooth[s] += nx;
        smooth[s + 1] += ny;
        smooth[s + 2] += nz;
      }
    }
    const mesh = createMesh(1);
    const rounded = params.edges;
    for (let t = 0;t < count; t++) {
      const facet = [flat[t * 3], flat[t * 3 + 1], flat[t * 3 + 2]];
      const [a, b, c] = [0, 1, 2].map((k) => {
        const row = corners[t * 6 + k * 2], column = corners[t * 6 + k * 2 + 1];
        const p = pointOf(row, column), s = indexOf(row, column) * 3;
        const position = [points[p], points[p + 1], points[p + 2]];
        const length2 = Math.hypot(smooth[s], smooth[s + 1], smooth[s + 2]) || 1;
        const shade = [0, 1, 2].map((i) => facet[i] * (1 - rounded) + smooth[s + i] / length2 * rounded);
        const norm = Math.hypot(...shade) || 1;
        return mesh.vertex(0, position, shade.map((v) => v / norm), boxUv(position, facet, BOX, 1, 1));
      });
      mesh.triangle(0, a, b, c);
    }
    return mesh.pack([1, 1, 1]);
  }
});

// src/build/kinds/bevel.js
var DETAIL = [1, 1.5, 2.5, 4];
var ROUND = [6, 9, 15, 24];
var stepsAt = (segments, level) => Math.max(2, 2 * Math.round(segments * DETAIL[level] / 8));
var unit2 = (v) => {
  const length2 = Math.hypot(...v);
  return length2 > 0.000000000001 ? v.map((c) => c / length2) : [0, 0, 1];
};
var BOX_FACES = [[2, 1, 0, 1, 1, 1], [1, -1, 0, 1, 2, 1], [0, 1, 1, 1, 2, 1], [1, 1, 0, -1, 2, 1], [0, -1, 1, -1, 2, 1], [2, -1, 0, 1, 1, -1]];
var bevelledBox = (half, radius, round, steps) => {
  const mesh = createMesh(6);
  const inner = half.map((h) => h - radius);
  const angles = Array.from({ length: steps + 1 }, (_, j) => j / steps * (Math.PI / 4));
  const offsets = round ? angles.map((a) => radius * Math.tan(a)) : [0, radius];
  const along = (axis) => [...offsets.map((o) => -inner[axis] - o).reverse(), ...offsets.map((o) => inner[axis] + o)];
  const chords = round ? angles.slice(1).map((a, j) => 2 * radius * Math.sin((a - angles[j]) / 2)) : [radius * Math.SQRT1_2];
  const reach = chords.map((_, j) => chords.slice(0, j + 1).reduce((sum, c) => sum + c, 0));
  const arcs = (axis) => [...[...reach].reverse().map((s) => -inner[axis] - s), -inner[axis], inner[axis], ...reach.map((s) => inner[axis] + s)];
  const onto = (p) => {
    const core = p.map((v, k) => Math.min(Math.max(v, -inner[k]), inner[k]));
    const d = p.map((v, k) => v - core[k]);
    const length2 = round ? Math.hypot(...d) : Math.abs(d[0]) + Math.abs(d[1]) + Math.abs(d[2]);
    return { at: length2 < 0.000000000001 ? core : core.map((v, k) => v + radius * d[k] / length2), normal: unit2(d) };
  };
  BOX_FACES.forEach(([n, ns, u, us, v, vs], slot) => {
    const across = along(u), up = along(v), arcU = arcs(u), arcV = arcs(v);
    const grid = up.map((y, k) => across.map((x, i) => {
      const p = [0, 0, 0];
      p[n] = ns * half[n];
      p[u] = us * x;
      p[v] = vs * y;
      return { ...onto(p), uv: [0.5 + arcU[i] / (2 * arcU.at(-1)), 0.5 + arcV[k] / (2 * arcV.at(-1))] };
    }));
    for (let k = 0;k + 1 < grid.length; k++) {
      for (let i = 0;i + 1 < grid[k].length; i++) {
        const corners = [grid[k][i], grid[k][i + 1], grid[k + 1][i + 1], grid[k + 1][i]];
        const [p0, p1, p2, p3] = corners.map(({ at }) => at);
        const facet = round ? null : unit2(cross2(p2.map((c2, k2) => c2 - p0[k2]), p3.map((c2, k2) => c2 - p1[k2])));
        const [a, b, c, d] = corners.map(({ at, normal, uv }) => mesh.vertex(slot, at, facet ?? normal, uv));
        mesh.quad(slot, a, b, c, d);
      }
    }
  });
  return mesh;
};
var bevelledCylinder = ([a, b, h], radius, round, steps, sides) => {
  const mesh = createMesh(3);
  const onRim = (top2, t) => {
    const z = top2 ? 1 : -1;
    if (!round)
      return { inset: radius * (1 - t), z: z * (h - radius * t), out: Math.SQRT1_2, up: z * Math.SQRT1_2 };
    const theta = t * Math.PI / 2;
    return { inset: radius * (1 - Math.sin(theta)), z: z * (h - radius + radius * Math.cos(theta)), out: Math.sin(theta), up: z * Math.cos(theta) };
  };
  const flat = (top2) => ({ inset: radius, z: top2 ? h : -h, out: 0, up: top2 ? 1 : -1 });
  const wall = (top2) => ({ inset: 0, z: top2 ? h - radius : radius - h, out: 1, up: 0 });
  const half = Array.from({ length: steps + 1 }, (_, j) => j / steps / 2);
  const topRings = [flat(true), ...half.map((t) => onRim(true, t))];
  const sideRings = [...half.map((t) => onRim(true, 0.5 + t)), wall(true), wall(false), ...half.map((t) => onRim(false, 1 - t))];
  const bottomRings = [...half.map((t) => onRim(false, 0.5 - t)), flat(false)];
  const gap = (p, q) => Math.hypot(p.inset - q.inset, p.z - q.z);
  const travel = (rings) => rings.reduce((list, ring, r) => [...list, r ? list[r - 1] + gap(rings[r - 1], ring) : 0], []);
  const outline = (phi) => ({ point: [a * Math.cos(phi), b * Math.sin(phi)], normal: unit2([b * Math.cos(phi), a * Math.sin(phi), 0]) });
  const columns = Array.from({ length: sides + 1 }, (_, c) => c / sides * 2 * Math.PI);
  const sweep = (slot, rings, uvOf) => {
    const grid = rings.map((ring, r) => columns.map((phi, c) => {
      const { point, normal } = outline(phi);
      const at = [point[0] - ring.inset * normal[0], point[1] - ring.inset * normal[1], ring.z];
      return mesh.vertex(slot, at, [normal[0] * ring.out, normal[1] * ring.out, ring.up], uvOf(r, c));
    }));
    for (let r = 0;r + 1 < grid.length; r++)
      for (let c = 0;c < sides; c++)
        mesh.quad(slot, grid[r][c], grid[r + 1][c], grid[r + 1][c + 1], grid[r][c + 1]);
    return grid;
  };
  const capUv = (rings, sign) => {
    const travelled = travel(rings);
    const reach = travelled.at(-1);
    return (r, c) => {
      const { point, normal } = outline(columns[c]);
      const out = travelled[r] - radius;
      return [0.5 + (point[0] + out * normal[0]) / (2 * (a - radius + reach)), 0.5 + sign * (point[1] + out * normal[1]) / (2 * (b - radius + reach))];
    };
  };
  const topGrid = sweep(0, topRings, capUv(topRings, 1));
  const sideTravel = travel(sideRings), sideLength = sideTravel.at(-1);
  sweep(1, sideRings, (r, c) => [c / sides, sideLength ? 1 - sideTravel[r] / sideLength : 0]);
  const fromFlat = capUv([...bottomRings].reverse(), -1);
  const bottomGrid = sweep(2, bottomRings, (r, c) => fromFlat(bottomRings.length - 1 - r, c));
  const top = mesh.vertex(0, [0, 0, h], [0, 0, 1], [0.5, 0.5]);
  const bottom = mesh.vertex(2, [0, 0, -h], [0, 0, -1], [0.5, 0.5]);
  for (let c = 0;c < sides; c++) {
    mesh.triangle(0, top, topGrid[0][c], topGrid[0][c + 1]);
    mesh.triangle(2, bottomGrid.at(-1)[c], bottom, bottomGrid.at(-1)[c + 1]);
  }
  return mesh;
};
var bevel = Object.freeze({
  name: "bevel",
  label: "Bevel",
  description: "A box or a cylinder with its edges rounded or chamfered by a radius in metres, whatever its size: real geometry, its faces numbered as the prim's, each running on over its half of the edges round it with its texture.",
  faces: ({ base }) => base === 1 ? ["top", "side", "bottom"] : ["top", "-y", "+x", "+y", "-x", "bottom"],
  facesBy: "base",
  shape: ({ base }) => base === 1 ? "cylinder" : "cube",
  labelOf: ({ base, edge }) => `${edge === 1 ? "Chamfered" : "Rounded"} ${base === 1 ? "cylinder" : "box"}`,
  plain: {
    param: "edge",
    label: "Sharp",
    from: { cube: { base: 0 }, cylinder: { base: 1 } },
    start: (size) => ({ radius: Math.min(0.05, Math.round(Math.min(...size) * 250) / 1000) })
  },
  sized: true,
  size: [1, 1, 1],
  params: [
    { name: "base", label: "Base", min: 0, max: 1, default: 0, step: 1, options: ["box", "cylinder"], fixed: true, description: "What is bevelled: a box, its twelve edges; a cylinder, the rims of its top and bottom." },
    { name: "edge", label: "Edges", min: 0, max: 1, default: 0, step: 1, options: ["round", "chamfer"], description: "How its edges are cut: round, a quarter circle; chamfer, one flat cut at 45°." },
    { name: "radius", label: "Radius", min: 0, max: 1, default: 0.05, step: 0.001, description: "How far its edges are cut back from each face, in metres: a round's radius, a chamfer's setback. At most half its thinnest side." },
    { name: "segments", label: "Segments", min: 2, max: 12, default: 4, step: 2, when: ({ edge }) => edge === 0, description: "Steps round each rounded edge at the finest level; fewer far away. A chamfer has one." }
  ],
  mesh: ({ base, edge, radius, segments }, seed, level, size) => {
    const half = size.map((v) => v / 2);
    const round = edge === 0;
    const steps = round ? stepsAt(segments, level) / 2 : 1;
    if (base === 1) {
      const [a, b, h] = half;
      const r = Math.min(radius, h, Math.min(a, b), Math.min(a, b) ** 2 / Math.max(a, b));
      return bevelledCylinder(half, r, round, steps, ROUND[level]).pack(size);
    }
    return bevelledBox(half, Math.min(radius, ...half), round, steps).pack(size);
  },
  collider: ({ base, radius }, seed, size) => {
    const half = size.map((v) => v / 2);
    if (base !== 1)
      return [{ type: "box", half, radius: Math.min(radius, ...half) }];
    const [a, b, h] = half;
    return Math.abs(a - b) <= 0.001 * Math.max(a, b) ? [{ type: "cylinder", half: h, radius: a, rounding: Math.min(radius, h, a) }] : null;
  }
});

// src/build/kinds/stairs.js
var RAIL = 0.9;
var POST = 0.04;
var HANDRAIL = [0.05, 0.04];
var STRINGER = 0.05;
var BOARD = 0.04;
var EDGE = 0.04;
var SINK = 0.01;
var stepsOf = ({ steps, height, tread, landing }) => {
  const riser = height / steps;
  const middle = landing > tread && steps > 1 ? Math.ceil(steps / 2) : 0;
  const frontOf = (i) => (i - 1) * tread + (middle && i > middle ? landing - tread : 0);
  const list = Array.from({ length: steps }, (_, k) => ({ front: frontOf(k + 1), back: frontOf(k + 2), top: (k + 1) * riser, landing: k + 1 === middle }));
  return { list, riser, run: frontOf(steps + 1), middle };
};
var flightsOf = (list) => {
  const flights = [];
  for (const step of list) {
    if (step.landing)
      continue;
    const last = flights.at(-1);
    if (last && list.indexOf(last.at(-1)) === list.indexOf(step) - 1)
      last.push(step);
    else
      flights.push([step]);
  }
  return flights;
};
var clip = (polygon, inside, cut2) => polygon.flatMap((p, i) => {
  const q = polygon[(i + 1) % polygon.length];
  if (inside(p))
    return inside(q) ? [p] : [p, cut2(p, q)];
  return inside(q) ? [cut2(p, q)] : [];
});
var clipY = (polygon, y, below) => clip(polygon, (p) => below ? p[0] <= y : p[0] >= y, (p, q) => [y, p[1] + (q[1] - p[1]) * (y - p[0]) / (q[0] - p[0])]);
var clipZ = (polygon, z, below) => clip(polygon, (p) => below ? p[1] <= z : p[1] >= z, (p, q) => [p[0] + (q[0] - p[0]) * (z - p[1]) / (q[1] - p[1]), z]);
var bandOf = (flight, list, riser) => {
  const first = flight[0], last = flight.at(-1);
  const slope = riser / (first.back - first.front);
  const depth = Math.max(0.22, 1.3 * riser);
  const lift = EDGE + depth * Math.hypot(1, slope);
  const at = (y) => first.top + EDGE + slope * (y - first.front);
  const [y0, y1] = [first.front - 10, last.back + 10];
  let band = [[y0, at(y0) - lift], [y1, at(y1) - lift], [y1, at(y1)], [y0, at(y0)]];
  const ground = first.top - riser;
  band = clipZ(band, ground > 0 ? ground - SINK : 0, false);
  band = clipY(band, first.front, false);
  band = clipY(band, last.back + (last === list.at(-1) ? 0 : SINK), true);
  return clipZ(band, last.top, true);
};
var stationsOf = (list) => list.flatMap(({ front, back, top, landing }) => landing ? [[front + 0.1, top], [back - 0.1, top]] : [[(front + back) / 2, top]]);
var bendsOf = (stations) => stations.filter((p, i) => {
  if (i === 0 || i === stations.length - 1)
    return true;
  const [a, b] = [stations[i - 1], stations[i + 1]];
  return Math.abs((p[1] - a[1]) * (b[0] - p[0]) - (b[1] - p[1]) * (p[0] - a[0])) > 0.000000001;
});
var SIDES2 = [[], [-1], [1], [-1, 1]];
var stairs = Object.freeze({
  name: "stairs",
  label: "Stairs",
  description: "A straight flight of stairs rising towards +y: its steps, height and tread make its box (width × steps' run × height). Built as a solid block or as treads between two stringers, with a landing half way up and a railing on either side if asked; the railing stands above its box.",
  faces: ["treads", "risers", "sides", "underside", "railing"],
  shape: "cube",
  anchor: [0, -1, -1],
  sizeNote: "made by its parameters: width × the steps' run × height",
  bias: [0.5, 0.5, 0.5],
  params: [
    { name: "steps", label: "Steps", min: 1, max: 40, default: 4, step: 1, description: "How many steps, each a riser and a tread: the last one's top is the stairs' height." },
    { name: "height", label: "Height", min: 0.1, max: 12, default: 0.72, step: 0.01, description: "From the ground to the top of the last step (m); each riser is this over the steps." },
    { name: "tread", label: "Tread", min: 0.1, max: 1.5, default: 0.28, step: 0.01, description: "How deep each step is, front to back (m)." },
    { name: "width", label: "Width", min: 0.3, max: 8, default: 1, step: 0.01, description: "How wide the stairs are, side to side (m)." },
    { name: "structure", label: "Built as", min: 0, max: 1, default: 0, step: 1, options: ["solid", "stringers"], description: "Solid: a block down to the ground. Stringers: treads housed between two sloping beams, open between the steps." },
    { name: "landing", label: "Landing", min: 0, max: 4, default: 0, step: 0.05, description: "A flat landing half way up, this deep (m); 0, or no deeper than a tread, for none." },
    { name: "railing", label: "Railing", min: 0, max: 3, default: 0, step: 1, options: ["none", "left", "right", "both"], description: "A handrail on posts along the left side, the right, both or neither, going up." }
  ],
  fit: (params) => [params.width, stepsOf(params).run, params.height],
  resize: (params, [x, y, z]) => {
    const { steps, landing } = params;
    const withLanding = steps > 1 ? (y - landing) / (steps - 1) : 0;
    return { ...params, width: x, height: z, tread: landing > 0 && steps > 1 && withLanding > 0 && withLanding < landing ? withLanding : y / steps };
  },
  mesh: (params, seed, level) => {
    const { width, height, structure, railing } = params;
    const { list, riser, run } = stepsOf(params);
    const mesh = createMesh(5);
    const half = [width / 2, run / 2, height / 2];
    const origin = [-half[0], 0, 0];
    const SCALES = [[width, run], [width, height], [run, height], [1, 1], [1, 1]];
    const uvOf = (p, n, slot) => boxUv(p, n, origin, ...SCALES[slot]);
    const byNormal = (normal) => normal[2] > 0.5 ? 0 : normal[1] < -0.5 ? 1 : 3;
    if (structure === 0 || list.length === 1) {
      const outline = [[0, 0], ...list.flatMap(({ front, back, top }) => [[front, top], [back, top]]), [run, 0]];
      addPrism(mesh, outline, -half[0], half[0], 2, byNormal, uvOf);
    } else {
      const inside = half[0] - STRINGER + SINK;
      for (const { front, back, top, landing } of list) {
        if (landing) {
          addBox(mesh, [-half[0], front, top - BOARD], [half[0], back, top], () => 0, uvOf);
          addBox(mesh, [-half[0] + SINK, front + SINK, 0], [half[0] - SINK, back - SINK, top - BOARD + SINK], () => 2, uvOf);
        } else
          addBox(mesh, [-inside, front, top - BOARD], [inside, back, top], () => 0, uvOf);
      }
      for (const flight of flightsOf(list)) {
        const band = bandOf(flight, list, riser);
        for (const side of [-1, 1]) {
          const [x0, x1] = side < 0 ? [-half[0], -half[0] + STRINGER] : [half[0] - STRINGER, half[0]];
          addPrism(mesh, band, x0, x1, 2, () => 2, uvOf);
        }
      }
    }
    if (railing) {
      const stations = stationsOf(list);
      const every = level === 3 ? 1 : level === 2 ? 2 : Infinity;
      const posts = stations.filter((_, i) => i === 0 || i === stations.length - 1 || i % every === 0);
      for (const side of SIDES2[railing]) {
        const x = side * (half[0] - 0.04 - POST / 2);
        for (const [y, top] of posts)
          addBeam(mesh, 4, [x, y, top - SINK], [x, y, top + RAIL - HANDRAIL[1] / 2], [0, 1, 0], POST, POST);
        const bends = bendsOf(stations).map(([y, top]) => [x, y, top + RAIL - HANDRAIL[1] / 2]);
        bends.slice(1).forEach((to, i) => {
          const from = bends[i];
          const length2 = Math.hypot(to[1] - from[1], to[2] - from[2]);
          const reach = 0.03 / Math.max(length2, 0.000000001);
          const grow = (p, q) => p.map((v, k) => v + (v - q[k]) * reach);
          addBeam(mesh, 4, grow(from, to), grow(to, from), [0, 0, 1], HANDRAIL[0], HANDRAIL[1]);
        });
      }
    }
    return mesh.pack([width, run, height], [0, half[1], half[2]]);
  },
  collider: (params) => {
    const { width, height, structure, railing } = params;
    const { list, riser, run } = stepsOf(params);
    const half = [width / 2, run / 2, height / 2];
    const box = (min, max) => {
      const size = max.map((v, k) => v - min[k]);
      return { type: "box", half: size.map((v) => v / 2), radius: Math.min(0.02, ...size.map((v) => v / 2)), at: [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2 - half[1], (min[2] + max[2]) / 2 - half[2]] };
    };
    const band = (polygon, x0, x1) => ({ type: "hull", points: Float32Array.from(polygon.flatMap(([y, z]) => [x0, y - half[1], z - half[2], x1, y - half[1], z - half[2]])) });
    const pieces = [];
    if (structure === 0 || list.length === 1) {
      for (const { front, back, top } of list)
        pieces.push(box([-half[0], front, 0], [half[0], back, top]));
    } else {
      const inside = half[0] - STRINGER + SINK;
      for (const { front, back, top, landing } of list)
        pieces.push(landing ? box([-half[0], front, 0], [half[0], back, top]) : box([-inside, front, top - BOARD], [inside, back, top]));
      for (const flight of flightsOf(list)) {
        const outline = bandOf(flight, list, riser);
        if (outline.length >= 3)
          pieces.push(band(outline, -half[0], -half[0] + STRINGER), band(outline, half[0] - STRINGER, half[0]));
      }
    }
    const bends = bendsOf(stationsOf(list));
    for (const side of SIDES2[railing]) {
      const x = side * (half[0] - 0.04 - POST / 2);
      bends.slice(1).forEach(([y1, z1], i) => {
        const [y0, z0] = bends[i];
        pieces.push(band([[y0, z0], [y1, z1], [y1, z1 + RAIL], [y0, z0 + RAIL]], x - POST / 2, x + POST / 2));
      });
    }
    return pieces;
  }
});

// src/build/kinds/door.js
var GAP = 0.004;
var FLOOR = 0.01;
var HANDLE = 1;
var RAISE = 0.012;
var BEVEL = 0.03;
var SINK2 = 0.001;
var PANE = 0.006;
var METRE = [1, 1];
var openingOf = (frame, size) => {
  const [hx, hy, hz] = size.map((v) => v / 2);
  const f = Math.min(frame, size[0] / 3, size[2] / 3);
  return { hx, hy, hz, f, x0: -hx + f + GAP, x1: hx - f - GAP, z0: -hz + FLOOR, z1: hz - f - GAP };
};
var door = Object.freeze({
  name: "door",
  label: "Door",
  description: "A door in its frame: two jambs and a head round its opening, its leaf plain, panelled or glazed, hung on one side and swinging out towards the front (−y) as far as it is open, a handle each side away from its hinges. Its box is the frame's: width, a wall's thickness, height.",
  faces: ["frame", "leaf", "glass", "handles"],
  shape: "cube",
  sized: true,
  size: [1.06, 0.14, 2.14],
  params: [
    { name: "frame", label: "Frame", min: 0.02, max: 0.3, default: 0.08, step: 0.005, description: "How wide its jambs and head are (m)." },
    { name: "leaf", label: "Leaf", min: 0.02, max: 0.12, default: 0.045, step: 0.005, description: "How thick the door itself is (m); no thicker than its frame is deep." },
    { name: "style", label: "Style", min: 0, max: 2, default: 1, step: 1, options: ["plain", "panelled", "glazed"], description: "Plain: one flat slab. Panelled: four raised panels each side. Glazed: glass in its upper half." },
    { name: "hinge", label: "Hinges", min: 0, max: 1, default: 0, step: 1, options: ["left", "right"], description: "The side it hangs on, seen from in front (−y); its handles on the other." },
    { name: "open", label: "Open", min: 0, max: 110, default: 0, step: 1, pose: true, description: "How far it stands open (°), swinging out towards the front: its leaf turns on its hinges, its mesh the same. A behaviour opens and shuts it so." }
  ],
  moving: [{
    faces: [1, 2, 3],
    turn: ({ frame, hinge, open }, size) => {
      const { hy, x0, x1 } = openingOf(frame, size);
      return { at: [hinge === 0 ? x0 : x1, -hy, 0], axis: [0, 0, 1], angle: (hinge === 0 ? -1 : 1) * open * Math.PI / 180 };
    }
  }],
  mesh: ({ frame, leaf, style, hinge }, seed, level, size) => {
    const mesh = createMesh(4);
    const { hx, hy, hz, f, x0, x1, z0, z1 } = openingOf(frame, size);
    const t = Math.min(leaf, size[1]);
    const uvOf = (p, n) => boxUv(p, n, [-hx, -hy, -hz], ...METRE);
    const outline = [[-hx, -hz], [-hx + f, -hz], [-hx + f, hz - f], [hx - f, hz - f], [hx - f, -hz], [hx, -hz], [hx, hz], [-hx, hz]];
    addExtrusion(mesh, outline.map(([x, z]) => [z, x]), 1, -hy, hy, 0, () => 0, uvOf);
    const y0 = -hy, y1 = -hy + t;
    const box = (slot, min, max) => addBox(mesh, min, max, () => slot, uvOf);
    const raised = (points, outward) => mesh.polygon(1, points, outward, points.map((p) => uvOf(p, outward)));
    const [w, h] = [x1 - x0, z1 - z0];
    const margin = Math.min(0.11, w / 5, h / 8);
    if (style === 2) {
      const [g0, g1] = [z0 + h / 2, z1 - margin];
      box(1, [x0, y0, z0], [x1, y1, g0]);
      box(1, [x0, y0, g0 - SINK2], [x0 + margin, y1, g1 + SINK2]);
      box(1, [x1 - margin, y0, g0 - SINK2], [x1, y1, g1 + SINK2]);
      box(1, [x0, y0, g1], [x1, y1, z1]);
      const middle = (y0 + y1) / 2;
      box(2, [x0 + margin - SINK2 * 2, middle - PANE / 2, g0 - SINK2 * 2], [x1 - margin + SINK2 * 2, middle + PANE / 2, g1 + SINK2 * 2]);
    } else {
      box(1, [x0, y0, z0], [x1, y1, z1]);
      if (style === 1) {
        const [pw, ph] = [(w - 3 * margin) / 2, (h - 3 * margin) / 2];
        const bevel2 = Math.min(BEVEL, pw / 4, ph / 4);
        for (const [i, j] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
          const [px, pz] = [x0 + margin + i * (pw + margin), z0 + margin + j * (ph + margin)];
          for (const [face, out] of [[y0, -1], [y1, 1]]) {
            const foot = [[px, pz], [px + pw, pz], [px + pw, pz + ph], [px, pz + ph]].map(([x, z]) => [x, face - out * SINK2, z]);
            const field = [[px + bevel2, pz + bevel2], [px + pw - bevel2, pz + bevel2], [px + pw - bevel2, pz + ph - bevel2], [px + bevel2, pz + ph - bevel2]].map(([x, z]) => [x, face + out * RAISE, z]);
            const sides = [0, 1, 2, 3].map((k) => [foot[k], foot[(k + 1) % 4], field[(k + 1) % 4], field[k]]);
            for (const points of [foot, field, ...sides]) {
              const centre = points.reduce((sum, p) => sum.map((v, c) => v + p[c] / points.length), [0, 0, 0]);
              const middle = [px + pw / 2, face + out * RAISE / 2, pz + ph / 2];
              const outward = centre.map((v, c) => v - middle[c]);
              raised(points, outward);
            }
          }
        }
      }
    }
    if (level > 0) {
      const toward = hinge === 0 ? -1 : 1;
      const edge = hinge === 0 ? x1 - 0.07 : x0 + 0.07;
      const z = -hz + HANDLE;
      for (const [face, out] of [[y0, -1], [y1, 1]]) {
        const near = face - out * SINK2 * 2, far = face + out * 0.012;
        box(3, [edge - 0.022, Math.min(near, far), z - 0.045], [edge + 0.022, Math.max(near, far), z + 0.045]);
        const lever = [edge + toward * 0.13, edge - toward * 0.015].sort((a, b) => a - b);
        const out0 = face + out * 0.045, out1 = face + out * 0.065;
        box(3, [lever[0], Math.min(out0, out1), z - 0.01], [lever[1], Math.max(out0, out1), z + 0.01]);
        const neck = [face + out * 0.006, face + out * 0.05].sort((a, b) => a - b);
        box(3, [edge - 0.009, neck[0], z - 0.009], [edge + 0.009, neck[1], z + 0.009]);
      }
    }
    return mesh.pack(size);
  },
  collider: ({ frame, leaf }, seed, size) => {
    const { hx, hy, hz, f, x0, x1, z0, z1 } = openingOf(frame, size);
    return [
      solidBox([-hx, -hy, -hz], [-hx + f, hy, hz - f]),
      solidBox([hx - f, -hy, -hz], [hx, hy, hz - f]),
      solidBox([-hx, -hy, hz - f], [hx, hy, hz]),
      { ...solidBox([x0, -hy, z0], [x1, -hy + Math.min(leaf, size[1]), z1]), moving: 0 }
    ];
  }
});

// src/build/kinds/window.js
var SINK3 = 0.001;
var PANE2 = 0.006;
var METRE2 = [1, 1];
var windowKind = Object.freeze({
  name: "window",
  label: "Window",
  description: "A window: its frame round its opening, glass in it divided into columns and rows of panes by bars, and a sill standing out to the front (−y) if asked. Its box is the frame's: width, a wall's thickness (or less), height; the sill stands out of it.",
  faces: ["frame", "bars", "glass", "sill"],
  shape: "cube",
  sized: true,
  size: [1.2, 0.12, 1.2],
  params: [
    { name: "frame", label: "Frame", min: 0.02, max: 0.3, default: 0.06, step: 0.005, description: "How wide its frame is round the glass (m)." },
    { name: "columns", label: "Columns", min: 1, max: 8, default: 2, step: 1, description: "Panes across, divided by upright bars." },
    { name: "rows", label: "Rows", min: 1, max: 8, default: 2, step: 1, description: "Panes up, divided by level bars." },
    { name: "bar", label: "Bars", min: 0.01, max: 0.1, default: 0.03, step: 0.005, description: "How wide the bars between its panes are (m)." },
    { name: "sill", label: "Sill", min: 0, max: 0.3, default: 0.05, step: 0.005, description: "How far a sill under it stands out to the front (m); 0 for none." }
  ],
  mesh: ({ frame, columns, rows, bar, sill }, seed, level, size) => {
    const [hx, hy, hz] = size.map((v) => v / 2);
    const mesh = createMesh(4);
    const uvOf = (p, n) => boxUv(p, n, [-hx, -hy, -hz], ...METRE2);
    const box = (slot, min, max) => addBox(mesh, min, max, () => slot, uvOf);
    const f = Math.min(frame, hx * 0.45, hz * 0.45);
    box(0, [-hx, -hy, -hz], [-hx + f, hy, hz]);
    box(0, [hx - f, -hy, -hz], [hx, hy, hz]);
    box(0, [-hx + f - SINK3, -hy, hz - f], [hx - f + SINK3, hy, hz]);
    box(0, [-hx + f - SINK3, -hy, -hz], [hx - f + SINK3, hy, -hz + f]);
    const [x0, x1, z0, z1] = [-hx + f, hx - f, -hz + f, hz - f];
    box(2, [x0 - SINK3 * 2, -PANE2 / 2, z0 - SINK3 * 2], [x1 + SINK3 * 2, PANE2 / 2, z1 + SINK3 * 2]);
    if (level > 0) {
      const b = Math.min(bar, (x1 - x0) / (2 * columns), (z1 - z0) / (2 * rows));
      const deep = Math.min(hy * 0.6, 0.04);
      for (let i = 1;i < columns; i++) {
        const x = x0 + (x1 - x0) * i / columns;
        box(1, [x - b / 2, -deep, z0 - SINK3], [x + b / 2, deep, z1 + SINK3]);
      }
      for (let j = 1;j < rows; j++) {
        const z = z0 + (z1 - z0) * j / rows;
        box(1, [x0 - SINK3, -deep + SINK3, z - b / 2], [x1 + SINK3, deep - SINK3, z + b / 2]);
      }
    }
    if (sill > 0) {
      box(3, [-hx - 0.02, -hy - sill, -hz - 0.04], [hx + 0.02, hy - SINK3 * 3, -hz + SINK3]);
    }
    return mesh.pack(size);
  },
  collider: (params, seed, size) => [solidBox(size.map((v) => -v / 2), size.map((v) => v / 2))]
});

// src/build/kinds/roof.js
var UP = [0, 0, 1];
var roof = Object.freeze({
  name: "roof",
  label: "Roof",
  description: "A roof over a rectangle: gabled (its ridge along x), hipped (sloping on all four sides) or a single slope (low at the front, −y). Its box is all of it, eaves to ridge — its pitch is its height for its depth — solid, the space under it closed, or only its slabs.",
  faces: ["roof", "ends", "underside", "eaves"],
  shape: "cube",
  sized: true,
  size: [4, 3, 1.2],
  labelOf: ({ type }) => ["Gable roof", "Hip roof", "Shed roof"][type],
  params: [
    { name: "type", label: "Type", min: 0, max: 2, default: 0, step: 1, options: ["gable", "hip", "shed"], description: "Gable: two slopes, its ridge along x. Hip: four slopes. Shed: one slope, rising to the back." },
    { name: "structure", label: "Built as", min: 0, max: 1, default: 0, step: 1, options: ["solid", "slabs"], description: "Solid: the space under it closed, its ends walls. Slabs: only the roof itself, open underneath." },
    { name: "thickness", label: "Thickness", min: 0.02, max: 0.6, default: 0.15, step: 0.01, description: "How thick its slabs are, and so its edge at the eaves (m)." }
  ],
  mesh: ({ type, structure, thickness }, seed, level, size) => {
    const [hx, hy, hz] = size.map((v) => v / 2);
    const t = Math.min(thickness, hz);
    const mesh = createMesh(4);
    const flat = (p, n) => boxUv(p, n, [-hx, -hy, -hz], 1, 1);
    const sloped = (p, n) => {
      const along = unit(cross2(UP, n));
      return [dot2(p, along), dot2(p, cross2(n, along))];
    };
    const uvOf = (p, n, slot) => slot === 0 ? sloped(p, n) : flat(p, n);
    const solid = structure === 0;
    const eave = -hz + t;
    if (type !== 1) {
      const section = type === 0 ? solid ? [[-hy, -hz], [hy, -hz], [hy, eave], [0, hz], [-hy, eave]] : [[-hy, -hz], [0, hz - t], [hy, -hz], [hy, eave], [0, hz], [-hy, eave]] : solid ? [[-hy, -hz], [hy, -hz], [hy, hz], [-hy, eave]] : [[-hy, -hz], [hy, hz - t], [hy, hz], [-hy, eave]];
      addExtrusion(mesh, section, 0, -hx, hx, 1, (normal) => {
        if (normal[2] > 0.05)
          return 0;
        if (normal[2] < -0.05)
          return 2;
        return type === 2 && normal[1] > 0 && solid ? 1 : 3;
      }, uvOf);
      return mesh.pack(size);
    }
    const ridge = Math.max(0, hx - hy);
    const top = [[-ridge, 0, hz], [ridge, 0, hz]];
    const corners = (z) => [[-hx, -hy, z], [hx, -hy, z], [hx, hy, z], [-hx, hy, z]];
    const [low, high] = [corners(-hz), corners(eave)];
    const face = (points, outward) => mesh.polygon(outward[2] > 0.05 ? 0 : outward[2] < -0.05 ? 2 : 3, points, outward, uvOf);
    const slopes = (rim, crest, sign) => {
      const out = (x, y) => unit([x * sign, y * sign, 0.5 * sign]);
      face([rim[0], rim[1], crest[1], crest[0]].filter(unique), out(0, -1));
      face([rim[1], rim[2], crest[1]], out(1, 0));
      face([rim[2], rim[3], crest[0], crest[1]].filter(unique), out(0, 1));
      face([rim[3], rim[0], crest[0]], out(-1, 0));
    };
    const unique = (p, i, list) => list.findIndex((q) => q.every((v, k) => Math.abs(v - p[k]) < 0.000000000001)) === i;
    slopes(high, top, 1);
    for (let k = 0;k < 4; k++) {
      const [a, b] = [k, (k + 1) % 4];
      const outward = unit([...[0, 1].map((c) => (low[a][c] + low[b][c]) / 2), 0]);
      face([low[a], low[b], high[b], high[a]], outward);
    }
    if (solid)
      face([...low].reverse(), [0, 0, -1]);
    else
      slopes(low, top.map(([x, y, z]) => [x, y, z - t]), -1);
    return mesh.pack(size);
  }
});

// src/build/kinds/column.js
var ROUND2 = [8, 12, 16, 24];
var SINK4 = 0.001;
var SHAFT = 0.4;
var FLUTE = 0.06;
var PER_FLUTE = 6;
var turned = (mesh, slot, rings, sides) => {
  const radiusAt = (ring, phi) => typeof ring[1] === "function" ? ring[1](phi) : ring[1];
  const pointAt = (ring, phi) => {
    const r = radiusAt(ring, phi);
    return [r * Math.cos(phi), r * Math.sin(phi), ring[0]];
  };
  const angles = Array.from({ length: sides + 1 }, (_, i) => i / sides * 2 * Math.PI);
  const grid = rings.map((ring, k) => angles.map((phi) => {
    const p = pointAt(ring, phi);
    const d = 0.0001;
    const round = pointAt(ring, phi + d).map((v, c) => v - pointAt(ring, phi - d)[c]);
    const other = rings[Math.min(k + 1, rings.length - 1)] === ring ? rings[k - 1] : rings[k + 1];
    const up = rings[k + 1] ? pointAt(rings[k + 1], phi).map((v, c) => v - p[c]) : p.map((v, c) => v - pointAt(other, phi)[c]);
    const normal = unit(cross2(round, up));
    const r = radiusAt(ring, 0);
    return mesh.vertex(slot, p, normal, [phi * r, ring[0]]);
  }));
  for (let k = 0;k + 1 < grid.length; k++)
    for (let i = 0;i < sides; i++)
      mesh.quad(slot, grid[k][i], grid[k][i + 1], grid[k + 1][i + 1], grid[k + 1][i]);
  for (const [ring, sign] of [[rings[0], -1], [rings.at(-1), 1]]) {
    const points = angles.slice(0, sides).map((phi) => pointAt(ring, phi));
    mesh.polygon(slot, points, [0, 0, sign], (p, n) => boxUv(p, n, [0, 0, 0], 1, 1));
  }
};
var column = Object.freeze({
  name: "column",
  label: "Column",
  description: "A column: on a base (a square plinth and a moulding) its shaft, round or square, narrowing towards its top, fluted if asked, under its capital (a moulding widening to a square slab). Its box is all of it, its width the plinth's.",
  faces: ["shaft", "base", "capital"],
  shape: "cylinder",
  sized: true,
  size: [0.5, 0.5, 3],
  params: [
    { name: "shaft", label: "Shaft", min: 0, max: 1, default: 0, step: 1, options: ["round", "square"], description: "Its shaft round or square." },
    { name: "base", label: "Base", min: 0, max: 1, default: 0.2, step: 0.01, description: "How high its base is (m); 0 for none." },
    { name: "capital", label: "Capital", min: 0, max: 1, default: 0.25, step: 0.01, description: "How high its capital is (m); 0 for none." },
    { name: "taper", label: "Taper", min: 0, max: 0.3, default: 0.1, step: 0.01, description: "How much narrower its shaft is at its top than at its foot, a share of it." },
    { name: "flutes", label: "Flutes", min: 0, max: 32, default: 0, step: 1, when: ({ shaft }) => shaft === 0, description: "Grooves down its round shaft; 0 for a smooth one." }
  ],
  mesh: ({ shaft, base, capital, taper, flutes }, seed, level, size) => {
    const [hx, hy, hz] = size.map((v) => v / 2);
    const mesh = createMesh(3);
    const half = Math.min(hx, hy);
    const [b, c] = [Math.min(base, size[2] / 3), Math.min(capital, size[2] / 3)];
    const [foot, head] = [-hz + b, hz - c];
    const radius = half * 2 * SHAFT;
    const top = radius * (1 - taper);
    const flat = (p, n) => boxUv(p, n, [-hx, -hy, -hz], 1, 1);
    const box = (slot, min, max) => addBox(mesh, min, max, () => slot, flat);
    if (b > 0) {
      box(1, [-hx, -hy, -hz], [hx, hy, -hz + b * 0.45]);
      if (shaft === 0)
        turned(mesh, 1, [[-hz + b * 0.45 - SINK4, half * 0.92], [-hz + b * 0.75, half * 0.9], [foot + SINK4, radius * 1.04]], ROUND2[level]);
      else
        box(1, [-radius * 1.12, -radius * 1.12, -hz + b * 0.45 - SINK4], [radius * 1.12, radius * 1.12, foot + SINK4]);
    }
    if (shaft === 0) {
      const grooves = level > 0 ? flutes : 0;
      const sides = Math.max(ROUND2[level], grooves * PER_FLUTE);
      const fluted = (r) => grooves ? (phi) => r * (1 - FLUTE * Math.abs(Math.sin(grooves * phi / 2))) : r;
      turned(mesh, 0, [[foot, fluted(radius)], [head, fluted(top)]], sides);
    } else {
      const at = (r, z) => [[-r, -r, z], [r, -r, z], [r, r, z], [-r, r, z]];
      const [low, high] = [at(radius, foot), at(top, head)];
      mesh.polygon(0, [...low].reverse(), [0, 0, -1], flat);
      mesh.polygon(0, high, [0, 0, 1], flat);
      for (let k = 0;k < 4; k++) {
        const next = (k + 1) % 4;
        const middle = [(low[k][0] + low[next][0]) / 2, (low[k][1] + low[next][1]) / 2, 0];
        mesh.polygon(0, [low[k], low[next], high[next], high[k]], middle, flat);
      }
    }
    if (c > 0) {
      if (shaft === 0)
        turned(mesh, 2, [[head - SINK4, top * 1.02], [head + c * 0.6 + SINK4, half * 0.94]], ROUND2[level]);
      else
        box(2, [-top * 1.15, -top * 1.15, head - SINK4], [top * 1.15, top * 1.15, head + c * 0.6 + SINK4]);
      box(2, [-hx, -hy, head + c * 0.6], [hx, hy, hz]);
    }
    return mesh.pack(size);
  },
  collider: ({ shaft, base, capital }, seed, size) => {
    const [hx, hy, hz] = size.map((v) => v / 2);
    const radius = Math.min(hx, hy) * 2 * SHAFT;
    const [b, c] = [Math.min(base, size[2] / 3), Math.min(capital, size[2] / 3)];
    return [
      shaft === 0 ? { type: "cylinder", half: hz, radius, rounding: Math.min(0.01, radius) } : solidBox([-radius, -radius, -hz], [radius, radius, hz]),
      ...b > 0 ? [solidBox([-hx, -hy, -hz], [hx, hy, -hz + b * 0.45])] : [],
      ...c > 0 ? [solidBox([-hx, -hy, hz - c * 0.4], [hx, hy, hz])] : []
    ];
  }
});

// src/build/kinds/arch.js
var SEGMENTS = [8, 12, 16, 24];
var arch = Object.freeze({
  name: "arch",
  label: "Arch",
  description: "An arch: a wall with an arched opening through it, two piers and the wall over its crown, the arch round, pointed or segmental. Its box is all of it, its width the piers' and the opening's, its depth the wall's.",
  faces: ["faces", "opening", "outside", "feet"],
  shape: "cube",
  sized: true,
  size: [3, 0.5, 3],
  labelOf: ({ shape }) => ["Round arch", "Pointed arch", "Segmental arch"][shape],
  params: [
    { name: "shape", label: "Shape", min: 0, max: 2, default: 0, step: 1, options: ["round", "pointed", "segmental"], description: "Round: a half circle. Pointed: two arcs meeting at a point, as tall as an equilateral triangle. Segmental: a shallow arc, a quarter of its span high." },
    { name: "pier", label: "Piers", min: 0.05, max: 3, default: 0.4, step: 0.01, description: "How wide each pier is either side of the opening (m)." },
    { name: "crown", label: "Crown", min: 0.05, max: 3, default: 0.3, step: 0.01, description: "How much wall stands over the top of the arch (m)." }
  ],
  mesh: ({ shape, pier, crown }, seed, level, size) => {
    const [hx, hy, hz] = size.map((v) => v / 2);
    const mesh = createMesh(4);
    const p = Math.min(pier, hx * 0.45);
    const half = hx - p;
    const top = hz - Math.min(crown, hz);
    const wanted = [half, half * 2 * Math.sqrt(3) / 2, half / 2][shape];
    const rise = Math.min(wanted, top + hz);
    const spring = top - rise;
    const squash = rise / wanted;
    const n = SEGMENTS[level];
    const curve = shape === 0 ? Array.from({ length: n + 1 }, (_, i) => {
      const a = Math.PI * (1 - i / n);
      return [half * Math.cos(a), spring + half * Math.sin(a) * squash];
    }) : shape === 1 ? [...Array.from({ length: n / 2 + 1 }, (_, i) => {
      const a = Math.PI - i / (n / 2) * (Math.PI / 3);
      return [half + 2 * half * Math.cos(a), spring + 2 * half * Math.sin(a) * squash];
    }), ...Array.from({ length: n / 2 }, (_, i) => {
      const a = Math.PI / 3 * (1 - (i + 1) / (n / 2));
      return [-half + 2 * half * Math.cos(a), spring + 2 * half * Math.sin(a) * squash];
    })] : (() => {
      const radius = (half * half + rise * rise) / (2 * rise);
      const centre = top - radius;
      const from = Math.atan2(spring - centre, -half), to = Math.atan2(spring - centre, half);
      return Array.from({ length: n + 1 }, (_, i) => {
        const a = from + (to - from) * (i / n);
        return [radius * Math.cos(a), centre + radius * Math.sin(a)];
      });
    })();
    const outline = [[-hx, -hz], [-half, -hz], ...curve, [half, -hz], [hx, -hz], [hx, hz], [-hx, hz]];
    const opening = new Set(Array.from({ length: curve.length + 1 }, (_, i) => i + 1));
    const round = new Map;
    let travelled = 0;
    outline.slice(1, curve.length + 3).forEach(([x, z], i, list) => {
      if (i)
        travelled += Math.hypot(x - list[i - 1][0], z - list[i - 1][1]);
      round.set(`${x},${z}`, travelled);
    });
    const flat = (point, normal) => boxUv(point, normal, [-hx, -hy, -hz], 1, 1);
    const uvOf = (point, normal, slot) => slot === 1 ? [round.get(`${point[0]},${point[2]}`) ?? 0, point[1] + hy] : flat(point, normal);
    addExtrusion(mesh, outline.map(([x, z]) => [z, x]), 1, -hy, hy, 0, (normal, edge) => opening.has(edge) ? 1 : normal[2] < -0.5 ? 3 : 2, uvOf);
    return mesh.pack(size);
  }
});

// src/build/kinds/fence.js
var SINK5 = 0.002;
var NONE = 0.000000001;
var widthOf = ({ post, thickness }) => Math.min(post, thickness);
var cornerOf = (before, after, square) => {
  const [a, b] = [Math.atan2(before[1], before[0]), Math.atan2(after[1], after[0])];
  for (const fold of square ? [4, 2] : [2]) {
    const sin = Math.sin(fold * a) + Math.sin(fold * b), cos = Math.cos(fold * a) + Math.cos(fold * b);
    if (Math.hypot(sin, cos) > 0.000001) {
      const turn2 = Math.atan2(sin, cos) / fold;
      return [Math.cos(turn2), Math.sin(turn2)];
    }
  }
  return after;
};
var layoutOf = (params) => {
  const { points, spacing } = params;
  const lengths = points.slice(1).map((to, i) => {
    const from = points[i];
    const length2 = Math.hypot(to[0] - from[0], to[1] - from[1]);
    return { from, length: length2, along: [(to[0] - from[0]) / length2, (to[1] - from[1]) / length2], rise: (to[2] - from[2]) / length2 };
  });
  const [first, last] = [points[0], points.at(-1)];
  const closed = points.length > 3 && first[0] === last[0] && first[1] === last[1];
  const corners = closed ? points.slice(0, -1) : points;
  const square = widthOf(params) === params.thickness;
  const posts = corners.map((at, i) => {
    const before = lengths[i - 1]?.along ?? (closed ? lengths.at(-1).along : null);
    const after = lengths[i]?.along;
    return { at, along: before && after ? cornerOf(before, after, square) : before ?? after };
  });
  for (const { from, length: length2, along, rise } of lengths) {
    const bays = Math.max(1, Math.ceil(length2 / spacing));
    for (let j = 1;j < bays; j++) {
      const t = length2 * j / bays;
      posts.push({ at: [from[0] + along[0] * t, from[1] + along[1] * t, from[2] + rise * t], along });
    }
  }
  return { lengths, posts, closed };
};
var frameAt = (at, [ux, uy], lift = () => 0) => ([x, y, z]) => [at[0] + ux * x - uy * y, at[1] + uy * x + ux * y, at[2] + z + lift(x)];
var footprintOf = remembered((params) => {
  const [w, t] = [widthOf(params) / 2, params.thickness / 2];
  const { lengths, posts } = layoutOf(params);
  const min = [Infinity, Infinity], max = [-Infinity, -Infinity];
  const cover = ([x, y]) => {
    min[0] = Math.min(min[0], x);
    min[1] = Math.min(min[1], y);
    max[0] = Math.max(max[0], x);
    max[1] = Math.max(max[1], y);
  };
  for (const { at, along } of posts)
    for (const corner of [[-w, -t], [w, -t], [w, t], [-w, t]])
      cover(frameAt(at, along)([...corner, 0]));
  for (const { from, length: length2, along } of lengths)
    for (const corner of [[0, -t], [length2, -t], [length2, t], [0, t]])
      cover(frameAt(from, along)([...corner, 0]));
  const feet = params.points.map((point) => point[2]);
  return { min: [...min, Math.min(...feet)], max: [...max, Math.max(...feet) + params.height] };
});
var centreOf = (params) => {
  const { min, max } = footprintOf(params);
  return min.map((v, k) => (v + max[k]) / 2);
};
var upToMillimetre = (v) => Math.ceil(v * 1000 - 0.000001) / 1000;
var fence = Object.freeze({
  name: "fence",
  label: "Fence",
  description: "A fence or railing along a path of points, its foot at each point's height so that it follows the land: a post on each point and others along each length as far apart as asked, between them pickets on rails, rails alone, or balusters between a bottom rail and a top one. Two points make a straight length; a last point on the first closes it round. Its box is what it makes.",
  faces: ["posts", "rails", "pickets"],
  shape: "cube",
  sized: true,
  size: [4, 0.1, 1],
  sizeNote: "what its points, thickness and height make (m)",
  labelOf: ({ style }) => ["Picket fence", "Rail fence", "Balustrade"][style],
  params: [
    { name: "style", label: "Style", min: 0, max: 2, default: 0, step: 1, options: ["pickets", "rails", "balusters"], description: "Pickets: upright boards on two rails behind. Rails: level rails alone. Balusters: spindles between a bottom rail and a top one." },
    { name: "height", label: "Height", min: 0.1, max: 4, default: 1, step: 0.01, description: "How high it stands over its foot (m)." },
    { name: "spacing", label: "Posts every", min: 0.3, max: 6, default: 2, step: 0.05, description: "How far apart its posts are at most along each length (m): they share it evenly." },
    { name: "post", label: "Posts", min: 0.03, max: 0.4, default: 0.1, step: 0.005, description: "How wide its posts are along it (m), no wider than it is thick." },
    { name: "rails", label: "Rails", min: 1, max: 6, default: 3, step: 1, when: ({ style }) => style === 1, description: "How many rails between its posts." },
    { name: "gap", label: "Gap", min: 0.01, max: 0.3, default: 0.05, step: 0.005, when: ({ style }) => style !== 1, description: "The gap between two pickets or balusters (m)." },
    { name: "thickness", label: "Thickness", min: 0.03, max: 0.4, default: 0.1, step: 0.005, description: "How thick it is across its path (m): its posts, its rails within it." },
    { name: "points", label: "Path", points: [2, 32], min: -31.5, max: 31.5, step: 0.001, default: [[-1.95, 0, -0.5], [1.95, 0, -0.5]], description: "The points its path runs through, a post on each: [x, y, z] in metres in its own frame, z its foot there; two at least; a last one on the first closes it round." }
  ],
  footprint: footprintOf,
  settle: (params, heightAt, indices) => ({ ...params, points: params.points.map((point, i) => indices && !indices.includes(i) ? point : [point[0], point[1], heightAt(point[0], point[1])]) }),
  fit: (params) => {
    const { min, max } = footprintOf(params);
    return max.map((v, k) => upToMillimetre(v - min[k]));
  },
  resize: (params, size) => {
    const spread = [0, 1, 2].map((k) => Math.max(...params.points.map((p) => p[k])) - Math.min(...params.points.map((p) => p[k])));
    const thickness = spread[1] <= NONE ? size[1] : spread[0] <= NONE ? size[0] : params.thickness;
    const height = Math.max(size[2] - spread[2], 0);
    const { min, max } = footprintOf({ ...params, thickness });
    const scale3 = [0, 1].map((k) => spread[k] > NONE ? Math.max(size[k] - (max[k] - min[k] - spread[k]), 0) / spread[k] : 1);
    const middle = (Math.min(...params.points.map((p) => p[2])) + Math.max(...params.points.map((p) => p[2])) + height) / 2;
    return { ...params, thickness, height, points: params.points.map(([x, y, z]) => [x * scale3[0], y * scale3[1], z - middle]) };
  },
  mesh: (params, seed, level, size) => {
    const { style, spacing, rails, gap, thickness, height } = params;
    const hy = thickness / 2;
    const mesh = createMesh(3);
    const w = widthOf(params);
    const { lengths, posts, closed } = layoutOf(params);
    for (const { at, along } of posts)
      addBox(mesh, [-w / 2, -hy, 0], [w / 2, hy, height], () => 0, (p, n) => boxUv(p, n, [-w / 2, -hy, 0], 1, 1), frameAt(at, along));
    const rail = Math.min(0.08, height / 8);
    const thin = Math.min(hy * 0.6, 0.03);
    const [low, high] = style === 0 ? [height * 0.2, height * 0.8] : [rail, height - rail / 2 - SINK5];
    const heights = style === 1 ? Array.from({ length: rails }, (_, k) => height * (k + 1) / (rails + 1)) : [low, high];
    const back = style === 0 ? hy - thin - SINK5 : 0;
    const piece = style === 0 ? Math.min(0.09, spacing / 3) : Math.min(0.05, spacing / 4);
    const deep = style === 0 ? Math.min(0.012, hy * 0.25) : Math.min(0.025, hy * 0.5);
    let travelled = 0;
    lengths.forEach(({ from, length: length2, along, rise }, i) => {
      const turn2 = ([x, y, z]) => [along[0] * x - along[1] * y, along[1] * x + along[0] * y, z];
      const uvOf = (p, n) => boxUv(p, n, [-(travelled + w / 2), -hy, 0], 1, 1);
      const [start, end] = [i === 0 && !closed ? w / 2 - SINK5 : 0, i === lengths.length - 1 && !closed ? w / 2 - SINK5 : 0];
      const slope = frameAt(from, along, (x) => rise * x);
      for (const z of heights)
        addBox(mesh, [-start, back - thin, z - rail / 2], [length2 + end, back + thin, z + rail / 2], () => 1, uvOf, slope);
      travelled += length2;
      if (style === 1 || level === 0)
        return;
      const reach = Math.abs(rise) * piece / 2;
      const bays = Math.max(1, Math.ceil(length2 / spacing));
      for (let b = 0;b < bays; b++) {
        const [x0, x1] = [length2 * b / bays + w / 2, length2 * (b + 1) / bays - w / 2];
        const count = Math.max(0, Math.floor((x1 - x0 - gap) / (piece + gap) + 0.000000001));
        const room = x1 - x0 - count * piece;
        for (let k = 0;k < count; k++) {
          const x = x0 + room / (count + 1) * (k + 1) + piece * k;
          const place = frameAt(from, along, () => rise * (x + piece / 2));
          if (style !== 0) {
            addBox(mesh, [x, -deep, low + rail / 2 - SINK5 - reach], [x + piece, deep, high - rail / 2 + SINK5 + reach], () => 2, uvOf, place);
            continue;
          }
          const y0 = back - thin - deep, y1 = back - thin + SINK5;
          const z0 = Math.min(0.06, height * 0.05), z1 = height - piece / 2;
          const outline = [[x, z0], [x + piece, z0], [x + piece, z1], [x + piece / 2, height], [x, z1]];
          const face = (points, outward) => mesh.polygon(2, points.map(place), turn2(outward), points.map((p) => uvOf(p, outward)));
          face(outline.map(([px, pz]) => [px, y0, pz]), [0, -1, 0]);
          face(outline.map(([px, pz]) => [px, y1, pz]).reverse(), [0, 1, 0]);
          outline.forEach(([px, pz], j) => {
            const [nx, nz] = outline[(j + 1) % outline.length];
            face([[px, y0, pz], [nx, y0, nz], [nx, y1, nz], [px, y1, pz]], [nz - pz, 0, -(nx - px)]);
          });
        }
      }
    });
    return mesh.pack(size, centreOf(params));
  },
  collider: (params) => {
    const centre = centreOf(params);
    const [w, hy, height] = [widthOf(params), params.thickness / 2, params.height];
    return layoutOf(params).lengths.map(({ from, length: length2, along, rise }) => {
      const half = (length2 + w) / 2;
      if (Math.abs(rise) <= NONE) {
        const angle = Math.atan2(along[1], along[0]);
        const box = solidBox([-half, -hy, 0], [half, hy, height], angle ? [0, 0, Math.sin(angle / 2), Math.cos(angle / 2)] : null);
        return { ...box, at: [from[0] + along[0] * length2 / 2 - centre[0], from[1] + along[1] * length2 / 2 - centre[1], from[2] + height / 2 - centre[2]] };
      }
      const slope = frameAt(from, along, (x) => rise * x);
      const points = [];
      for (const x of [-w / 2, length2 + w / 2])
        for (const y of [-hy, hy])
          for (const z of [0, height])
            points.push(...slope([x, y, z]).map((v, k) => v - centre[k]));
      return { type: "hull", points };
    });
  }
});

// src/build/kinds/road.js
var LIFT = 0.1;
var EVERY = 1;
var ACROSS = 1.5;
var SAMPLES = 2048;
var STRIDES = [8, 4, 2, 1];
var MITRE = 3;
var lengthsOf = (points) => {
  let travelled = 0;
  return points.slice(1).map((to, i) => {
    const from = points[i];
    const length2 = Math.hypot(to[0] - from[0], to[1] - from[1]);
    const start = travelled;
    travelled += length2;
    return { from, to, length: length2, start, along: [(to[0] - from[0]) / length2, (to[1] - from[1]) / length2] };
  });
};
var closedOf = (points) => points.length > 3 && points[0][0] === points.at(-1)[0] && points[0][1] === points.at(-1)[1];
var samplesAcross = (width) => Math.min(9, Math.max(3, Math.ceil(width / ACROSS) + 1));
var samplesAlong = (total, across) => Math.min(Math.floor(SAMPLES / across), Math.max(2, Math.round(total / EVERY) + 1));
var leftOf = ([x, y]) => [-y, x];
var sectionAt = (lengths, closed, width, s) => {
  const last = lengths.length - 1;
  let i = lengths.findIndex(({ start: start2, length: length2 }) => s <= start2 + length2 + 0.000000001);
  if (i < 0)
    i = last;
  const { from, along, start } = lengths[i];
  const middle = [from[0] + along[0] * (s - start), from[1] + along[1] * (s - start)];
  const atStart = Math.abs(s - start) < 0.000000001 && (i > 0 || closed);
  const atEnd = Math.abs(s - (start + lengths[i].length)) < 0.000000001 && (i < last || closed);
  const before = atStart ? lengths[(i - 1 + lengths.length) % lengths.length] : atEnd ? lengths[i] : null;
  const after = atStart ? lengths[i] : atEnd ? lengths[(i + 1) % lengths.length] : null;
  let offset = leftOf(along).map((v) => v * width / 2);
  if (before && after) {
    const [a, b] = [leftOf(before.along), leftOf(after.along)];
    const mitre = unit([a[0] + b[0], a[1] + b[1], 0]);
    const reach = Math.min(1 / Math.max(mitre[0] * b[0] + mitre[1] * b[1], 0.000001), MITRE);
    offset = [mitre[0] * reach * (width / 2), mitre[1] * reach * (width / 2)];
  }
  return { middle, offset };
};
var rowOf = ({ middle, offset }, columns) => Array.from({ length: columns }, (_, j) => {
  const t = 1 - 2 * j / (columns - 1);
  return [middle[0] + offset[0] * t, middle[1] + offset[1] * t];
});
var groundSites = ({ points, width }) => {
  const lengths = lengthsOf(points);
  const closed = closedOf(points);
  const total = lengths.at(-1).start + lengths.at(-1).length;
  const across = samplesAcross(width);
  const count = samplesAlong(total, across);
  return Array.from({ length: count }, (_, k) => rowOf(sectionAt(lengths, closed, width, total * k / (count - 1)), across)).flat();
};
var columnsOf = ({ ground, width }, total) => [samplesAcross(width), 2].find((columns) => ground.length === columns * samplesAlong(total, columns)) ?? null;
var groundAt = ({ points, ground }, lengths, total, columns, s) => {
  if (columns) {
    const stations = ground.length / columns;
    const t = Math.min(Math.max(s / total, 0), 1) * (stations - 1);
    const k = Math.min(Math.floor(t), stations - 2), f2 = t - k;
    return Array.from({ length: columns }, (_, j) => ground[k * columns + j] * (1 - f2) + ground[(k + 1) * columns + j] * f2);
  }
  const i = Math.max(0, lengths.findIndex(({ start: start2, length: length3 }) => s <= start2 + length3 + 0.000000001));
  const { start, length: length2 } = lengths[i];
  const f = length2 > 0 ? Math.min(Math.max((s - start) / length2, 0), 1) : 0;
  const z = points[i][2] * (1 - f) + points[i + 1][2] * f;
  return [z, z];
};
var cornersOf = (lengths, closed, width) => lengths.flatMap((after, i) => {
  if (i === 0 && !closed)
    return [];
  const before = lengths[(i - 1 + lengths.length) % lengths.length];
  const [a, b] = [before.along, after.along];
  const turn2 = Math.abs(a[0] * b[1] - a[1] * b[0]) / Math.max(1 + a[0] * b[0] + a[1] * b[1], 0.000001);
  const cut2 = Math.min(width / 2 * turn2, MITRE * (width / 2));
  return i === 0 ? [{ at: 0, cut: cut2 }, { at: after.start + lengths.reduce((sum, { length: length2 }) => sum + length2, 0), cut: cut2 }] : [{ at: after.start, cut: cut2 }];
});
var sectionsOf = (params, level) => {
  const { points, width } = params;
  const lengths = lengthsOf(points);
  const closed = closedOf(points);
  const total = lengths.at(-1).start + lengths.at(-1).length;
  const columns = columnsOf(params, total);
  const count = samplesAlong(total, columns ?? samplesAcross(width));
  const stride = STRIDES[level];
  const corners = cornersOf(lengths, closed, width);
  const along = new Set(lengths.map(({ start }) => start).concat(total));
  for (let k = 0;k < count; k += stride) {
    const s = total * k / (count - 1);
    if (corners.every(({ at, cut: cut2 }) => Math.abs(s - at) > cut2 + 0.000001))
      along.add(s);
  }
  return [...along].sort((a, b) => a - b).map((s) => {
    const heights = groundAt(params, lengths, total, columns, closed && s >= total - 0.000000001 ? 0 : s);
    return { s, row: rowOf(sectionAt(lengths, closed, width, s), heights.length).map(([x, y], j) => [x, y, heights[j] + LIFT]) };
  });
};
var footprintOf2 = remembered((params) => {
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (const { row } of sectionsOf(params, 3)) {
    for (const [x, y, z] of row) {
      [x, y].forEach((v, k) => {
        min[k] = Math.min(min[k], v);
        max[k] = Math.max(max[k], v);
      });
      min[2] = Math.min(min[2], z - params.depth);
      max[2] = Math.max(max[2], z);
    }
  }
  return { min, max };
});
var centreOf2 = (params) => {
  const { min, max } = footprintOf2(params);
  return min.map((v, k) => (v + max[k]) / 2);
};
var upToMillimetre2 = (v) => Math.ceil(v * 1000 - 0.000001) / 1000;
var road = Object.freeze({
  name: "road",
  label: "Road",
  description: "A road or path along points, on the ground: a ribbon as wide as asked, its edges mitred at each point, its surface on the heights of the ground sampled under it about every metre along it and every metre and a half across, a slab under it as deep as asked. Two points make a straight length; a last point on the first closes it round. Its box is what it makes.",
  faces: ["surface", "sides", "underside"],
  shape: "cube",
  sized: true,
  size: [8, 3, 0.3],
  sizeNote: "what its points, width and depth make (m)",
  labelOf: ({ width }) => width < 2 ? "Path" : "Road",
  material: "ground/gravel/rocky-trail",
  params: [
    { name: "width", label: "Width", min: 0.5, max: 12, default: 3, step: 0.05, description: "How wide it is (m)." },
    { name: "depth", label: "Depth", min: 0.05, max: 1, default: 0.3, step: 0.01, description: "How far its slab goes down under its surface (m), so that where the ground is not quite where its samples say, no gap shows." },
    { name: "points", label: "Path", points: [2, 32], min: -31.5, max: 31.5, step: 0.001, default: [[-4, 0, 0.1], [4, 0, 0.1]], description: "The points it runs through: [x, y, z] in metres in its own frame, z the ground there; two at least; a last one on the first closes it round." },
    { name: "ground", label: "Ground", heights: [0, SAMPLES], min: -31.5, max: 31.5, step: 0.001, default: [], description: "The ground's height under it (m, in its own frame), as the editor that laid it measured it: at each place sampled along it, from its left edge to its right; none: straight between its points' heights." }
  ],
  footprint: footprintOf2,
  settle: (params, heightAt) => {
    const points = params.points.map(([x, y]) => [x, y, heightAt(x, y)]);
    return { ...params, points, ground: groundSites({ ...params, points }).map(([x, y]) => heightAt(x, y)) };
  },
  fit: (params) => {
    const { min, max } = footprintOf2(params);
    return max.map((v, k) => upToMillimetre2(v - min[k]));
  },
  resize: (params, size) => {
    const spread = [0, 1].map((k) => Math.max(...params.points.map((p) => p[k])) - Math.min(...params.points.map((p) => p[k])));
    const width = spread[1] <= 0.000000001 ? size[1] : spread[0] <= 0.000000001 ? size[0] : params.width;
    const { min, max } = footprintOf2({ ...params, width });
    const scale3 = [0, 1].map((k) => spread[k] > 0.000000001 ? Math.max(size[k] - (max[k] - min[k] - spread[k]), 0) / spread[k] : 1);
    const depth = params.depth + size[2] - (max[2] - min[2]);
    return { ...params, width, depth, points: params.points.map(([x, y, z]) => [x * scale3[0], y * scale3[1], z]) };
  },
  mesh: (params, seed, level, size) => {
    const mesh = createMesh(3);
    const closed = closedOf(params.points);
    const sections = sectionsOf(params, level);
    const down = ([x, y, z]) => [x, y, z - params.depth];
    const columns = sections[0].row.length;
    const last = columns - 1;
    const u = (j) => params.width * j / last;
    const top = sections.map(({ s, row }, k) => {
      const [before, after] = [sections[Math.max(k - 1, 0)].row, sections[Math.min(k + 1, sections.length - 1)].row];
      return row.map((point, j) => {
        const normal = unit(cross2(sub2(row[Math.min(j + 1, last)], row[Math.max(j - 1, 0)]), sub2(after[j], before[j])));
        return mesh.vertex(0, point, normal, [u(j), s]);
      });
    });
    for (let k = 0;k + 1 < sections.length; k++)
      for (let j = 0;j < last; j++)
        mesh.quad(0, top[k][j], top[k][j + 1], top[k + 1][j + 1], top[k + 1][j]);
    for (let k = 0;k + 1 < sections.length; k++) {
      const [a, b] = [sections[k], sections[k + 1]];
      const [aLeft, aRight, bLeft, bRight] = [a.row[0], a.row[last], b.row[0], b.row[last]];
      mesh.polygon(2, [down(aLeft), down(bLeft), down(bRight), down(aRight)], [0, 0, -1], [[0, a.s], [0, b.s], [params.width, b.s], [params.width, a.s]]);
      mesh.polygon(1, [aLeft, down(aLeft), down(bLeft), bLeft], cross2(sub2(bLeft, aLeft), [0, 0, 1]).map((v) => -v), [[a.s, 0], [a.s, -params.depth], [b.s, -params.depth], [b.s, 0]]);
      mesh.polygon(1, [aRight, bRight, down(bRight), down(aRight)], cross2(sub2(bRight, aRight), [0, 0, 1]), [[a.s, 0], [b.s, 0], [b.s, -params.depth], [a.s, -params.depth]]);
    }
    if (!closed) {
      for (const [{ row }, sign] of [[sections[0], -1], [sections.at(-1), 1]]) {
        const outward = cross2(sub2(row[0], row[last]), [0, 0, 1]).map((v) => v * sign);
        const outline = [...row, down(row[last]), down(row[0])];
        mesh.polygon(1, outline, outward, [...row.map((point, j) => [u(j), point[2] - row[0][2]]), [params.width, row[last][2] - row[0][2] - params.depth], [0, -params.depth]]);
      }
    }
    return mesh.pack(size, centreOf2(params));
  },
  collider: (params) => {
    const centre = centreOf2(params);
    const sections = sectionsOf(params, 3);
    const columns = sections[0].row.length;
    const positions = sections.flatMap(({ row }) => row.flatMap((point) => point.map((v, k) => v - centre[k])));
    const indices = sections.slice(1).flatMap((_, k) => Array.from({ length: columns - 1 }, (_2, j) => {
      const [a, b] = [k * columns + j, (k + 1) * columns + j];
      return [a, a + 1, b + 1, a, b + 1, b];
    }).flat());
    return [{ type: "mesh", positions: Float32Array.from(positions), indices: Uint32Array.from(indices) }];
  }
});

// src/build/prim/profile.js
var FACE = Object.freeze({ TOP: 1, BOTTOM: 2, INNER: 4, CUT_BEGIN: 8, CUT_END: 16, OUTER: 32 });
var FILL_RADIUS = Object.freeze([1, 1, 1, 0.5, Math.SQRT1_2, 0.53, 0.525, 0.5]);
var EPS = 0.000000001;
var polygon = (out, { begin, end, sides, offset = 0, share = 1, split = 0, uScale = 1, edges = false }) => {
  const order = Math.round(sides / share);
  const radius = order < 8 ? FILL_RADIUS[order] : 0.5;
  const corner = (j2) => {
    const angle = 2 * Math.PI * (j2 / sides * share + offset);
    return [radius * Math.cos(angle), radius * Math.sin(angle), j2 * uScale / sides];
  };
  const along = (x) => {
    const i = Math.min(Math.floor(x), sides - 1), f = x - i;
    const [ax, ay, au] = corner(i), [bx, by, bu] = corner(i + 1);
    return [ax + (bx - ax) * f, ay + (by - ay) * f, au + (bu - au) * f];
  };
  const start = out.length;
  const emit = (point) => {
    if (out.length > start) {
      const [lx, ly, lu] = out.slice(-3);
      for (let k = 1;k <= split; k++) {
        const f = k / (split + 1);
        out.push(lx + (point[0] - lx) * f, ly + (point[1] - ly) * f, lu + (point[2] - lu) * f);
      }
    }
    out.push(...point);
  };
  const x0 = begin * sides, x1 = end * sides;
  const first = Math.floor(x0 + EPS), f0 = Math.max(0, x0 - first);
  if (edges) {
    const last = Math.max(first, Math.floor(x1 + 0.999 + EPS) - 1);
    emit(along(first + f0));
    for (let i = first;i < last; i++)
      emit(corner(i + 1));
    emit(along(last + Math.min(x1 - last, 1)));
    return { first, last };
  }
  if (f0 < 0.9999)
    emit(along(first + f0));
  let j = first + 1;
  for (;j < x1 - EPS; j++)
    emit(corner(j));
  if (x1 - (j - 1) > 0.0001)
    emit(along(x1));
  return { first, last: j - 1 };
};
var generateProfile = (params, detail, split, pathOpen) => {
  const { profileCurve, profileBegin: begin, profileEnd: end, hollow } = params;
  const kind = profileCurve & 15, hole = profileCurve & 240;
  const hollowed = hollow > 0, squareHole = hollowed && hole === HOLE.SQUARE;
  const out = [], sides = [];
  let open, holeShape;
  if (kind === PROFILE.SQUARE || kind === PROFILE.ISOTRI || kind === PROFILE.EQUALTRI || kind === PROFILE.RIGHTTRI) {
    const square = kind === PROFILE.SQUARE, n = square ? 4 : 3, offset = square ? -0.375 : 0;
    const { first, last } = polygon(out, { begin, end, sides: n, offset, split, uScale: n, edges: true });
    for (let i = first;i <= last; i++)
      sides.push({ id: FACE.OUTER << i, kind: "side", index: (i - first) * (split + 1), count: split + 2, flat: true });
    open = end - begin < 0.99;
    if (open && !hollowed)
      out.push(0, 0, 0);
    holeShape = hole === HOLE.CIRCLE ? { sides: Math.floor(6 * detail), offset } : hole === HOLE.TRIANGLE || !square && hole !== HOLE.SQUARE ? { sides: 3, offset, split, flat: true } : { sides: 4, offset, split, flat: true };
    if (!square)
      holeShape.scale = hollow / 2;
  } else if (kind === PROFILE.CIRCLE) {
    const n = squareHole ? Math.ceil(6 * detail / 4) * 4 : Math.floor(6 * detail);
    polygon(out, { begin, end, sides: n });
    sides.push({ id: FACE.OUTER, kind: "side", index: 0, count: out.length / 3, flat: false });
    open = end - begin < 0.99;
    if (open && !hollowed)
      out.push(0, 0, 0);
    holeShape = hole === HOLE.SQUARE ? { sides: 4, split, flat: true } : hole === HOLE.TRIANGLE ? { sides: 3, split, flat: true } : { sides: n };
  } else {
    const n = squareHole ? Math.ceil(3 * detail / 2) * 2 : Math.floor(3 * detail);
    polygon(out, { begin, end, sides: n, offset: 0.5, share: 0.5 });
    sides.push({ id: FACE.OUTER, kind: "side", index: 0, count: out.length / 3, flat: false });
    open = end - begin < 1 || hollowed;
    if (!hollowed)
      out.push(0, 0, 0);
    if (!open)
      out.push(out[0], out[1], out[2]);
    const half = { offset: 0.5, share: 0.5 };
    holeShape = hole === HOLE.SQUARE ? { ...half, sides: 2, split, flat: true } : hole === HOLE.TRIANGLE ? { ...half, sides: 3, split, flat: true } : { ...half, sides: n };
  }
  const outer = out.length / 3;
  const faces = [];
  if (pathOpen)
    faces.push({ id: FACE.TOP, kind: "cap", index: 0, count: 0, flat: true });
  faces.push(...sides);
  if (hollowed) {
    const { scale: scale3 = hollow, flat = false, ...shape } = holeShape;
    const inner = [];
    polygon(inner, { begin, end, ...shape });
    for (let i = inner.length - 3;i >= 0; i -= 3)
      out.push(inner[i] * scale3, inner[i + 1] * scale3, inner[i + 2] * scale3);
    faces.push({ id: FACE.INNER, kind: "side", index: outer, count: inner.length / 3, flat });
  }
  if (pathOpen)
    faces.push({ id: FACE.BOTTOM, kind: "cap", index: 0, count: 0, flat: true });
  const count = out.length / 3;
  if (open) {
    faces.push({ id: FACE.CUT_BEGIN, kind: "cut", index: count - 1, count: 2, flat: true });
    faces.push({ id: FACE.CUT_END, kind: "cut", index: hollowed ? outer - 1 : count - 2, count: 2, flat: true });
  }
  return { points: Float64Array.from(out), count, outer, open, hollow: hollowed, faces };
};

// src/build/prim/path.js
var EPS2 = 0.000000001;
var lerp = (a, b, t) => a * (1 - t) + b * t;
var isCircular = (pathCurve) => [PATH.CIRCLE, PATH.CIRCLE2, PATH.TEST].includes(pathCurve & 240);
var aboutZ = (angle) => {
  const c = Math.cos(angle), s = Math.sin(angle);
  return [c, -s, 0, s, c, 0, 0, 0, 1];
};
var aboutXZ = (theta, phi) => {
  const ct = Math.cos(theta), st = Math.sin(theta), cp = Math.cos(phi), sp = Math.sin(phi);
  return [cp, -sp, 0, ct * sp, ct * cp, -st, st * sp, st * cp, ct];
};
var generatePath = (params, detail, split) => {
  const { pathBegin: begin, pathEnd: end, scaleX, scaleY, shearX, shearY, twistBegin, twistEnd } = params;
  const twistSteps = Math.abs(twistEnd - twistBegin) * 3.5 * (detail - 0.5);
  if (!isCircular(params.pathCurve)) {
    const count = Math.max(Math.floor(twistSteps + EPS2) + 2, split + 2);
    const [bottomX, topX] = scaleX > 1 ? [2 - scaleX, 1] : [1, scaleX];
    const [bottomY, topY] = scaleY > 1 ? [2 - scaleY, 1] : [1, scaleY];
    const rows2 = Array.from({ length: count }, (_, i) => {
      const t = lerp(begin, end, i / (count - 1));
      return {
        position: [shearX * t, shearY * t, t - 0.5],
        rotation: aboutZ(Math.PI * lerp(twistBegin, twistEnd, t)),
        scale: [lerp(bottomX, topX, t), lerp(bottomY, topY, t)],
        v: t
      };
    });
    return { rows: rows2, open: true };
  }
  const { radiusOffset, taperX, taperY, revolutions: revolutions2, skew } = params;
  const sides = Math.floor(Math.floor(6 * detail + twistSteps + EPS2) * revolutions2 + EPS2);
  const holeX = scaleX * (1 - Math.abs(skew)), holeY = scaleY;
  const taper = (amount) => amount < 0 ? [1 + amount, 1] : [1, 1 - amount];
  const [startX, endX] = taper(taperX), [startY, endY] = taper(taperY);
  let r0 = (sides < 8 ? FILL_RADIUS[sides] : 0.5) * (1 - holeY), r1 = r0;
  if (radiusOffset < 0)
    r0 *= 1 + radiusOffset;
  else
    r1 *= 1 - radiusOffset;
  const open = end - begin < 1 || Math.abs(skew) > 0.001 || Math.abs(endX - startX) > 0.001 || Math.abs(endY - startY) > 0.001 || Math.abs(r1 - r0) > 0.001 || twistBegin !== twistEnd;
  const ts = [begin];
  for (let k = Math.floor(begin * sides + EPS2) + 1;k < end * sides - EPS2; k++)
    ts.push(k / sides);
  ts.push(end);
  const rows = ts.map((t) => {
    const theta = 2 * Math.PI * revolutions2 * t, rho = lerp(r0, r1, t);
    const c = rho * Math.cos(theta), s = rho * Math.sin(theta);
    return {
      position: [shearX * s + skew * (t - 0.5), c + shearY * s, s],
      rotation: aboutXZ(theta, 2 * Math.PI * lerp(twistBegin, twistEnd, t) - Math.PI),
      scale: [holeX * lerp(startX, endX, t), holeY * lerp(startY, endY, t)],
      v: t
    };
  });
  return { rows, open };
};

// src/build/prim/mesher.js
var DETAIL2 = Object.freeze([1, 1.5, 2.5, 4]);
var SEAM = 0.000001;
var TINY = 0.000000000001;
var WELD2 = 1e6;
var paramsOf = (shape) => constrainParams(Array.isArray(shape) || ArrayBuffer.isView(shape) ? decodeShape(shape) : shape).params;
var splitOf = (params, detail) => {
  const kind = params.profileCurve & 15;
  const flat = kind !== PROFILE.CIRCLE && kind !== PROFILE.HALF_CIRCLE;
  return flat && !isCircular(params.pathCurve) && (params.scaleX !== 1 || params.scaleY !== 1) ? 0 : Math.floor(0.66 * detail);
};
var meshPrim = (shape, lod = 3) => {
  const detail = DETAIL2[lod];
  if (detail === undefined)
    throw new RangeError(`no level of detail ${lod}: 0 to 3`);
  const params = paramsOf(shape);
  const split = splitOf(params, detail);
  const path = generatePath(params, detail, split);
  const profile = generateProfile(params, detail, split, path.open);
  const mesh = { params, profile, path, grid: sweep(profile, path) };
  return profile.faces.map((face) => face.kind === "cap" ? cap(face, mesh) : side(face, mesh));
};
var meshPrimAsset = (shape, lod = 3) => {
  const faces = meshPrim(shape, lod);
  const total = faces.reduce((sum, { positions: positions2 }) => sum + positions2.length / 3, 0);
  const ids = new Map, place = new Uint32Array(total), used = new Uint8Array(total), triangles = [], slots = [];
  let base = 0;
  for (const { id, positions: positions2, indices } of faces) {
    for (let i = 0;i < positions2.length / 3; i++) {
      const key = `${Math.round(positions2[i * 3] * WELD2)},${Math.round(positions2[i * 3 + 1] * WELD2)},${Math.round(positions2[i * 3 + 2] * WELD2)}`;
      let at = ids.get(key);
      if (at === undefined)
        ids.set(key, at = ids.size);
      place[base + i] = at;
    }
    const first = triangles.length;
    for (let i = 0;i < indices.length; i += 3) {
      const a = indices[i] + base, b = indices[i + 1] + base, c = indices[i + 2] + base;
      if (place[a] === place[b] || place[b] === place[c] || place[c] === place[a])
        continue;
      triangles.push(a, b, c);
      used[a] = used[b] = used[c] = 1;
    }
    slots.push({ id, first, count: triangles.length - first });
    base += positions2.length / 3;
  }
  const count = used.reduce((sum, u) => sum + u, 0);
  const Index = count > 65535 ? Uint32Array : Uint16Array;
  const positions = new Float32Array(count * 3), normals = new Float32Array(count * 3), uvs = new Float32Array(count * 2);
  const welded = new Index(count), remap = new Int32Array(total), firstAt = new Int32Array(ids.size).fill(-1);
  const bounds = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
  let next = 0;
  base = 0;
  for (const face of faces) {
    for (let i = 0;i < face.positions.length / 3; i++, base++) {
      if (!used[base])
        continue;
      remap[base] = next;
      for (let k = 0;k < 3; k++) {
        const value = face.positions[i * 3 + k];
        positions[next * 3 + k] = value;
        normals[next * 3 + k] = face.normals[i * 3 + k];
        bounds.min[k] = Math.min(bounds.min[k], value);
        bounds.max[k] = Math.max(bounds.max[k], value);
      }
      uvs[next * 2] = face.uvs[i * 2];
      uvs[next * 2 + 1] = face.uvs[i * 2 + 1];
      if (firstAt[place[base]] < 0)
        firstAt[place[base]] = next;
      welded[next++] = firstAt[place[base]];
    }
  }
  return { positions, normals, uvs, indices: Index.from(triangles, (v) => remap[v]), slots, welded, bounds };
};
var sweep = ({ points, count }, { rows }) => {
  const grid = new Float64Array(rows.length * count * 3);
  rows.forEach(({ position: [px, py, pz], rotation: m, scale: [sx, sy] }, row) => {
    for (let i = 0, o = row * count * 3;i < count; i++, o += 3) {
      const x = points[i * 3] * sx, y = points[i * 3 + 1] * sy;
      grid[o] = m[0] * x + m[1] * y + px;
      grid[o + 1] = m[3] * x + m[4] * y + py;
      grid[o + 2] = m[6] * x + m[7] * y + pz;
    }
  });
  return grid;
};
var face = (id, positions, normals, uvs, indices) => ({
  id,
  positions: Float32Array.from(positions),
  normals: Float32Array.from(normals),
  uvs: Float32Array.from(uvs),
  indices: (positions.length / 3 > 65535 ? Uint32Array : Uint16Array).from(indices)
});
var side = ({ id, kind, index, count, flat }, { params, profile, path, grid }) => {
  const { points, count: total } = profile;
  const { rows } = path;
  const columns = id === FACE.INNER && flat && count > 2 ? [index, ...Array.from({ length: count - 1 }, (_, s) => [index + s + 1, index + s + 1]).flat(), profile.open ? index + count - 1 : index] : Array.from({ length: count }, (_, s) => (index + s) % total);
  const S = columns.length, T = rows.length, N = S * T;
  const firstU = Math.floor(points[columns[0] * 3 + 2]);
  const us = columns.map((p, s) => kind === "cut" ? Math.min(s, 1) : flat ? points[p * 3 + 2] - firstU : points[p * 3 + 2]);
  const positions = new Float64Array(N * 3), uvs = new Float64Array(N * 2);
  for (let t = 0, v = 0;t < T; t++) {
    for (let s = 0;s < S; s++, v++) {
      positions.set(grid.subarray((t * total + columns[s]) * 3, (t * total + columns[s]) * 3 + 3), v * 3);
      uvs[v * 2] = us[s];
      uvs[v * 2 + 1] = rows[t].v;
    }
  }
  const indices = [];
  for (let t = 0;t < T - 1; t++) {
    for (let s = 0;s < S - 1; s++) {
      const bl = t * S + s, br = bl + 1, tl = bl + S, tr = tl + 1;
      indices.push(bl, tr, tl, bl, br, tr);
    }
  }
  const normals = new Float64Array(N * 3), sum = [0, 0, 0];
  for (let i = 0;i < indices.length; i += 3) {
    const n = triangleNormal(positions, indices[i], indices[i + 1], indices[i + 2]);
    for (const vertex of [indices[i], indices[i + 1], indices[i + 2], indices[i + (i / 3 % 2 ? 2 : 1)]])
      addTo(normals, vertex, n);
    addTo(sum, 0, n);
  }
  const same = (a, b) => distance2(positions, a, b) < SEAM;
  const weld = (a, b) => {
    for (let k = 0;k < 3; k++)
      normals[a * 3 + k] = normals[b * 3 + k] = normals[a * 3 + k] + normals[b * 3 + k];
  };
  const pole = (s) => rows.every((_, t) => same(s, t * S + s));
  if (columns.every((_, s) => same(s, (T - 1) * S + s)))
    for (let s = 0;s < S; s++)
      weld(s, (T - 1) * S + s);
  if (!pole(0) && rows.every((_, t) => same(t * S, t * S + S - 1)))
    for (let t = 0;t < T; t++)
      weld(t * S, t * S + S - 1);
  if (params.pathCurve === PATH.CIRCLE && (params.profileCurve & 15) === PROFILE.HALF_CIRCLE) {
    for (const [s, x] of [[0, 1], [S - 1, -1]])
      if (pole(s))
        for (let t = 0;t < T; t++)
          normals.set([x, 0, 0], (t * S + s) * 3);
  }
  normalizeAll(normals, sum);
  return face(id, positions, normals, uvs, indices);
};
var cap = ({ id }, { params, profile, path, grid }) => {
  const top = id === FACE.TOP;
  const { points, count, outer } = profile;
  const row = top ? path.rows.length - 1 : 0;
  const { rotation: m } = path.rows[row];
  const sign = top ? 1 : -1;
  const normal = [m[2] * sign, m[5] * sign, m[8] * sign];
  const at = (i) => grid.subarray((row * count + i) * 3, (row * count + i) * 3 + 3);
  const uv = (x, y) => [x + 0.5, top ? y + 0.5 : 0.5 - y];
  const positions = [], uvs = [], indices = [];
  const { profileCurve, pathCurve, profileBegin, profileEnd, pathBegin, pathEnd } = params;
  if (profileCurve === PROFILE.SQUARE && pathCurve === PATH.LINE && !profile.hollow && profileBegin === 0 && profileEnd === 1 && pathBegin === 0 && pathEnd === 1) {
    const g = (count - 1) / 4;
    const [c0, c1, , c3] = [0, 1, 2, 3].map((k) => at(k * g));
    const [q0, q1, , q3] = [0, 1, 2, 3].map((k) => [points[k * g * 3], points[k * g * 3 + 1]]);
    for (let i = 0;i <= g; i++) {
      for (let j = 0;j <= g; j++) {
        const a = i / g, b = j / g;
        for (let k = 0;k < 3; k++)
          positions.push(c0[k] + (c1[k] - c0[k]) * a + (c3[k] - c0[k]) * b);
        uvs.push(...uv(q0[0] + (q1[0] - q0[0]) * a + (q3[0] - q0[0]) * b, q0[1] + (q1[1] - q0[1]) * a + (q3[1] - q0[1]) * b));
      }
    }
    const cell = top ? [0, g + 1, g + 2, g + 2, 1, 0] : [0, 1, g + 2, g + 2, g + 1, 0];
    for (let i = 0;i < g; i++)
      for (let j = 0;j < g; j++)
        indices.push(...cell.map((k) => i * (g + 1) + j + k));
  } else {
    for (let i = 0;i < count; i++) {
      positions.push(...at(i));
      uvs.push(...uv(points[i * 3], points[i * 3 + 1]));
    }
    const fan = (centre, last) => {
      for (let i = 0;i < last; i++)
        indices.push(...top ? [centre, i, i + 1] : [centre, i + 1, i]);
    };
    if (!profile.hollow && !profile.open) {
      positions.push(...boxCentre(positions, 3));
      uvs.push(...boxCentre(uvs, 2));
      fan(count, count - 1);
    } else if (!profile.hollow) {
      fan(count - 1, count - 2);
    } else {
      zipper(points, count, outer, top, indices);
    }
  }
  const normals = Array.from({ length: positions.length / 3 }, () => normal).flat();
  return face(id, positions, normals, uvs, indices);
};
var zipper = (points, count, outer, top, indices) => {
  const x = (i) => points[i * 3], y = (i) => points[i * 3 + 1], u = (i) => points[i * 3 + 2];
  const area = (a2, b2, c) => (x(b2) - x(a2)) * (y(c) - y(a2)) - (x(c) - x(a2)) * (y(b2) - y(a2));
  const length2 = (a2, b2) => (x(a2) - x(b2)) ** 2 + (y(a2) - y(b2)) ** 2 + (u(a2) - u(b2)) ** 2;
  let a = 0, b = count - 1;
  while (b - a > 1) {
    const canA = area(a, a + 1, b) >= 0 && area(b, a + 1, b - 1) >= 0;
    const canB = area(b, a, b - 1) >= 0 && area(a, b - 1, a + 1) >= 0;
    const advanceA = a < outer - 1 && (b === outer || canA && (!canB || length2(a, a + 1) < length2(b, b - 1)));
    if (advanceA) {
      indices.push(...top ? [a, a + 1, b] : [a, b, a + 1]);
      a++;
    } else {
      indices.push(...top ? [a, b - 1, b] : [a, b, b - 1]);
      b--;
    }
  }
};
var triangleNormal = (p, a, b, c) => {
  const ax = p[a * 3], ay = p[a * 3 + 1], az = p[a * 3 + 2];
  const ux = p[b * 3] - ax, uy = p[b * 3 + 1] - ay, uz = p[b * 3 + 2] - az;
  const vx = p[c * 3] - ax, vy = p[c * 3 + 1] - ay, vz = p[c * 3 + 2] - az;
  return [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx];
};
var addTo = (target, i, n) => {
  target[i * 3] += n[0];
  target[i * 3 + 1] += n[1];
  target[i * 3 + 2] += n[2];
};
var distance2 = (p, a, b) => (p[a * 3] - p[b * 3]) ** 2 + (p[a * 3 + 1] - p[b * 3 + 1]) ** 2 + (p[a * 3 + 2] - p[b * 3 + 2]) ** 2;
var normalizeAll = (normals, sum) => {
  const length2 = Math.hypot(...sum);
  const fallback = length2 > TINY ? sum.map((c) => c / length2) : [0, 0, 1];
  for (let i = 0;i < normals.length; i += 3) {
    const l = Math.hypot(normals[i], normals[i + 1], normals[i + 2]);
    if (l > TINY)
      for (let k = 0;k < 3; k++)
        normals[i + k] /= l;
    else
      normals.set(fallback, i);
  }
};
var boxCentre = (values, size) => Array.from({ length: size }, (_, k) => {
  let min = Infinity, max = -Infinity;
  for (let i = k;i < values.length; i += size) {
    min = Math.min(min, values[i]);
    max = Math.max(max, values[i]);
  }
  return (min + max) / 2;
});

// src/build/prim/sculpt.js
var SCULPT_SIDES = Object.freeze([6, 8, 16, 32]);
var STITCHES = Object.freeze(["sphere", "torus", "plane", "cylinder"]);
var MAX_POINTS = 1600;
var FINEST2 = SCULPT_SIDES[3];
var MIN_AREA = 0.002;
var MAX_AREA = 32;
var BASE64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var DIGIT = new Map([...BASE64].map((char, i) => [char, i]));
var fromBase64 = (text) => {
  if (typeof text !== "string" || text.length % 4)
    return null;
  const padding = text.endsWith("==") ? 2 : text.endsWith("=") ? 1 : 0;
  const bytes = new Uint8Array(text.length / 4 * 3 - padding);
  for (let i = 0, o = 0;i < text.length; i += 4) {
    let n = 0;
    for (let k = 0;k < 4; k++) {
      const char = text[i + k];
      const digit = char === "=" ? 0 : DIGIT.get(char);
      if (digit === undefined)
        return null;
      n = n << 6 | digit;
    }
    for (let k = 0;k < 3 && o < bytes.length; k++)
      bytes[o++] = n >> 16 - k * 8 & 255;
  }
  return bytes;
};
var meshSculpt = ({ samples, columns, rows, stitch = "sphere", mirror = false, invert = false }, lod = 3) => {
  const sides = SCULPT_SIDES[lod];
  if (sides === undefined)
    throw new RangeError(`no level of detail ${lod}: 0 to 3`);
  if (!samples || samples.length < (columns + 1) * (rows + 1) * 3)
    return meshPrimAsset(PRESETS.sphere.shape, lod);
  const aspect = columns / rows;
  const s = Math.max(1, Math.min(columns, Math.round(Math.sqrt(sides * sides * aspect))));
  const t = Math.max(1, Math.min(rows, Math.round(Math.sqrt(sides * sides / aspect))));
  const wrapColumns = stitch !== "plane", wrapRows = stitch === "torus", poles = stitch === "sphere";
  const flip = mirror ? -1 : 1;
  const count = (s + 1) * (t + 1);
  const positions = new Float32Array(count * 3);
  const point = (column2, row, out, o) => {
    const at = (row * (columns + 1) + column2) * 3;
    out[o] = flip * (samples[at] / 255 - 0.5);
    out[o + 1] = samples[at + 1] / 255 - 0.5;
    out[o + 2] = samples[at + 2] / 255 - 0.5;
  };
  for (let j = 0, o = 0;j <= t; j++) {
    for (let i = 0;i <= s; i++, o += 3) {
      const row = wrapRows && j === t ? 0 : Math.floor(j * rows / t);
      const column2 = poles && (j === 0 || j === t) ? Math.floor(columns / 2) : wrapColumns && i === s ? 0 : Math.floor(i * columns / s);
      point(column2, row, positions, o);
    }
  }
  const index = (i, j) => j * (s + 1) + i;
  const turned2 = mirror !== invert;
  const indices = [];
  for (let j = 0;j < t; j++) {
    for (let i = 0;i < s; i++) {
      const p1 = index(i, j), p2 = index(i + 1, j), p3 = index(i, j + 1), p4 = index(i + 1, j + 1);
      if (turned2)
        indices.push(p1, p4, p3, p1, p2, p4);
      else
        indices.push(p1, p3, p4, p1, p4, p2);
    }
  }
  const normals = new Float32Array(count * 3);
  let area = 0;
  for (let k = 0;k < indices.length; k += 3) {
    const a = indices[k] * 3, b = indices[k + 1] * 3, c = indices[k + 2] * 3;
    const ux = positions[b] - positions[a], uy = positions[b + 1] - positions[a + 1], uz = positions[b + 2] - positions[a + 2];
    const vx = positions[c] - positions[a], vy = positions[c + 1] - positions[a + 1], vz = positions[c + 2] - positions[a + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    area += Math.hypot(nx, ny, nz) / 2;
    for (const v of [a, b, c]) {
      normals[v] += nx;
      normals[v + 1] += ny;
      normals[v + 2] += nz;
    }
  }
  if (area < MIN_AREA || area > MAX_AREA)
    return meshPrimAsset(PRESETS.sphere.shape, lod);
  const share = (group) => {
    const sum = [0, 0, 0];
    for (const v of group)
      for (let k = 0;k < 3; k++)
        sum[k] += normals[v * 3 + k];
    for (const v of group)
      for (let k = 0;k < 3; k++)
        normals[v * 3 + k] = sum[k];
  };
  if (wrapColumns)
    for (let j = 0;j <= t; j++)
      share([index(0, j), index(s, j)]);
  if (wrapRows)
    for (let i = 0;i <= s; i++)
      share([index(i, 0), index(i, t)]);
  if (poles)
    for (const j of [0, t])
      share(Array.from({ length: s + 1 }, (_, i) => index(i, j)));
  for (let v = 0;v < count; v++) {
    const o = v * 3, length2 = Math.hypot(normals[o], normals[o + 1], normals[o + 2]) || 1;
    normals[o] /= length2;
    normals[o + 1] /= length2;
    normals[o + 2] /= length2;
  }
  return pack(positions, normals, s, t, indices);
};
var pack = (positions, normals, s, t, all) => {
  const count = positions.length / 3;
  const uvs = new Float32Array(count * 2);
  for (let j = 0;j <= t; j++)
    for (let i = 0;i <= s; i++) {
      const v = j * (s + 1) + i;
      uvs[v * 2] = i / s;
      uvs[v * 2 + 1] = 1 - j / t;
    }
  const ids = new Map, welded = count > 65535 ? new Uint32Array(count) : new Uint16Array(count);
  const place = new Uint32Array(count);
  for (let v = 0;v < count; v++) {
    const key = `${Math.round(positions[v * 3] * 1e6)},${Math.round(positions[v * 3 + 1] * 1e6)},${Math.round(positions[v * 3 + 2] * 1e6)}`;
    if (!ids.has(key))
      ids.set(key, v);
    welded[v] = ids.get(key);
    place[v] = welded[v];
  }
  const kept = [];
  for (let k = 0;k < all.length; k += 3) {
    const a = all[k], b = all[k + 1], c = all[k + 2];
    if (place[a] !== place[b] && place[b] !== place[c] && place[c] !== place[a])
      kept.push(a, b, c);
  }
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (let v = 0;v < count; v++)
    for (let k = 0;k < 3; k++) {
      min[k] = Math.min(min[k], positions[v * 3 + k]);
      max[k] = Math.max(max[k], positions[v * 3 + k]);
    }
  return {
    positions,
    normals,
    uvs,
    indices: (count > 65535 ? Uint32Array : Uint16Array).from(kept),
    slots: [{ id: 32, first: 0, count: kept.length }],
    welded,
    bounds: { min, max }
  };
};

// src/build/kinds/sculpt.js
var yesNo = ["no", "yes"];
var sculpt = Object.freeze({
  name: "sculpt",
  label: "Sculpted prim",
  description: 'A sculpted prim, as Second Life and OpenSim have them: its surface a map of points (its sculpt map), stitched as a sphere, a torus, a plane or a cylinder. Never written by hand: a part written with "sculpt" — a lathe, a box, a loft, a sweep or a model — is made one by the sculpt tool, and an OpenSim import brings its own; its stitching, mirror and invert set on its card.',
  faces: ["surface"],
  shape: "sphere",
  size: [1, 1, 1],
  params: [
    { name: "stitch", label: "Stitching", min: 0, max: 3, default: 0, step: 1, options: [...STITCHES], description: "How its map closes on itself: a sphere (poles pinched, round its columns), a torus (both ways round), a plane (open), a cylinder (round its columns)." },
    { name: "mirror", label: "Mirror", min: 0, max: 1, default: 0, step: 1, options: yesNo, description: "Whether its map is mirrored across its x." },
    { name: "invert", label: "Inside out", min: 0, max: 1, default: 0, step: 1, options: yesNo, description: "Whether its faces look inward: its winding turned." },
    { name: "columns", label: "Columns", min: 1, max: 128, default: 1, step: 1, fixed: true, description: "The sides across its map, as its finest level samples it." },
    { name: "rows", label: "Rows", min: 1, max: 128, default: 1, step: 1, fixed: true, description: "The sides down its map, as its finest level samples it." },
    { name: "map", label: "Map", bytes: MAX_POINTS * 4, min: 0, max: MAX_POINTS * 4, step: 4, default: "", fixed: true, description: "Its sculpt map as its finest level samples it: (columns + 1) × (rows + 1) points, R, G, B each, row by row from the map's top, as base64 (its range is its length in characters)." }
  ],
  mesh: ({ stitch, mirror, invert, columns, rows, map }, seed, level) => meshSculpt({ samples: fromBase64(map), columns, rows, stitch: STITCHES[stitch], mirror: mirror === 1, invert: invert === 1 }, level)
});

// src/build/kinds/index.js
var KINDS = Object.freeze({ rock, bevel, stairs, door, window: windowKind, roof, column, arch, fence, road, sculpt });
var BIAS = [0.5, 0.5, 0.5];
var MIN_SIZE = 0.01;
var MAX_SIZE = 64;
var KEEP2 = 8;
var kindOf = (name) => typeof name === "string" && Object.hasOwn(KINDS, name) ? KINDS[name] : null;
var decimals = (step) => Math.max(0, Math.ceil(-Math.log10(step) - 0.000000001));
var constrain = (param, value) => {
  const given = typeof value === "string" && param.options ? param.options.indexOf(value) : value;
  if (!Number.isFinite(given) || param.options && given < 0)
    return param.default;
  const within = Math.min(Math.max(given, param.min), param.max);
  const stepped = Math.min(param.min + Math.round((within - param.min) / param.step) * param.step, param.max);
  return Number(stepped.toFixed(decimals(param.step)));
};
var written = (value) => Array.isArray(value) ? value.map((point) => Array.isArray(point) && point.length === 2 ? [...point, 0] : point) : value;
var defaultOf = (param) => param.points ? param.default.map((point) => [...point]) : param.heights ? [...param.default] : param.default;
var constrainBytes = (param, value) => typeof value === "string" && value.length <= param.bytes && value.length % 4 === 0 && /^[A-Za-z0-9+/]*={0,2}$/.test(value) ? value : param.default;
var hashOf = (text) => {
  let a = 2166136261, b = 16777619 ^ text.length;
  for (let i = 0;i < text.length; i++) {
    const c = text.charCodeAt(i);
    a = Math.imul(a ^ c, 16777619);
    b = Math.imul(b ^ c, 1540483477);
  }
  return ((a >>> 0) * 2 ** 21 + (b >>> 0 & 2097151)).toString(36);
};
var constrainHeights = (param, value) => {
  const kept = (Array.isArray(value) ? value : []).filter(Number.isFinite).slice(0, param.heights[1]).map((v) => constrain(param, v));
  return kept.length >= param.heights[0] ? kept : defaultOf(param);
};
var pointsWithin = (value, { least = 0, most = Infinity, min, max, step, horizontal = false }) => {
  const held = { min, max, step };
  const points = [];
  for (const point of Array.isArray(value) ? value : []) {
    if (points.length === most)
      break;
    if (!Array.isArray(point) || point.length < 2 || point.length > 3 || !point.every(Number.isFinite))
      continue;
    const kept = [point[0], point[1], point[2] ?? 0].map((v) => constrain(held, v));
    const last = points.at(-1);
    if (!last || last[0] !== kept[0] || last[1] !== kept[1] || !horizontal && last[2] !== kept[2])
      points.push(kept);
  }
  return points.length >= least ? points : null;
};
var constrainPoints = (param, value) => {
  const [least, most] = param.points;
  const points = pointsWithin(value, { least, most, min: param.min, max: param.max, step: param.step, horizontal: true });
  if (!points)
    return defaultOf(param);
  const [first, last] = [points[0], points.at(-1)];
  if (points.length > 3 && first[0] === last[0] && first[1] === last[1])
    last[2] = first[2];
  return points;
};
var constrainKind = (name, params) => {
  const kind = kindOf(name);
  if (!kind)
    return { params: null, errors: [`no kind ${name}`] };
  const given = params && typeof params === "object" ? params : {};
  const errors = Object.keys(given).filter((key) => !kind.params.some((param) => param.name === key)).map((key) => `${name}: no parameter ${key}`);
  const values = Object.fromEntries(kind.params.map((param) => {
    const value = given[param.name] === undefined ? defaultOf(param) : param.points ? constrainPoints(param, given[param.name]) : param.heights ? constrainHeights(param, given[param.name]) : param.bytes ? constrainBytes(param, given[param.name]) : constrain(param, given[param.name]);
    const as = param.options && typeof given[param.name] === "string" ? param.options[value] : value;
    const changed = param.points || param.heights ? JSON.stringify(as) !== JSON.stringify(written(given[param.name])) : as !== given[param.name];
    if (given[param.name] !== undefined && changed)
      errors.push(`${name}: ${param.name} ${JSON.stringify(given[param.name])} → ${JSON.stringify(value)}`);
    return [param.name, value];
  }));
  return { params: values, errors };
};
var seedOf = (seed) => Number.isInteger(seed) ? Math.abs(seed) % 2147483648 : 0;
var within = (size) => size.map((v) => Math.min(Math.max(v, MIN_SIZE), MAX_SIZE));
var clean = (size) => size.map((v) => Math.round(v * 1e6) / 1e6);
var resolve = (value, params) => typeof value === "function" ? value(params) : value;
var fitSize = ({ kind, params, size }) => {
  const type = kindOf(kind);
  return type?.fit ? clean(within(type.fit(constrainKind(kind, params).params, size))) : [...size];
};
var resizeParams = ({ kind, params, size }) => {
  const type = kindOf(kind);
  const values = constrainKind(kind, params).params;
  return type?.resize ? constrainKind(kind, type.resize(values, size)).params : values;
};
var recentred = ({ kind, params }) => {
  const type = kindOf(kind);
  const values = constrainKind(kind, params).params;
  const paths = type?.params.filter((param) => param.points) ?? [];
  if (!type?.footprint || !paths.length)
    return { params: values, shift: [0, 0, 0] };
  const { min, max } = type.footprint(values);
  const step = paths[0].step;
  const shift = [0, 1, 2].map((k) => Number((Math.round((min[k] + max[k]) / 2 / step) * step).toFixed(decimals(step))));
  const moved = Object.fromEntries(type.params.filter((param) => param.points || param.heights).map((param) => [param.name, param.points ? values[param.name].map((point) => point.map((v, k) => v - shift[k])) : values[param.name].map((v) => v - shift[2])]));
  return { params: constrainKind(kind, { ...values, ...moved }).params, shift };
};
var fallbackShape = ({ kind, params }) => {
  const type = kindOf(kind);
  return [...PRESETS[type ? resolve(type.shape, constrainKind(kind, params).params) : "cube"].shape];
};
var rotate = ([x, y, z, w], [px, py, pz]) => {
  const tx = 2 * (y * pz - z * py), ty = 2 * (z * px - x * pz), tz = 2 * (x * py - y * px);
  return [px + w * tx + y * tz - z * ty, py + w * ty + z * tx - x * tz, pz + w * tz + x * ty - y * tx];
};
var turnOf = ({ at, axis, angle }) => {
  const direction = unit(axis), half = Math.sin(angle / 2);
  const rotation = [...direction.map((v) => v * half), Math.cos(angle / 2)];
  const turned2 = rotate(rotation, at);
  return { at, axis: direction, angle, rotation, offset: at.map((v, k) => v - turned2[k]) };
};
var wholes = new Map;
var wholeOf = (name, make) => {
  const kept = wholes.get(name);
  if (kept)
    return kept;
  if (wholes.size >= KEEP2)
    wholes.delete(wholes.keys().next().value);
  const whole = make();
  wholes.set(name, whole);
  return whole;
};
var kindMesh = ({ kind, params, seed, size } = {}) => {
  const type = kindOf(kind);
  if (!type)
    return null;
  const values = constrainKind(kind, params).params;
  const grain = type.seeded ? seedOf(seed) : 0;
  const box = type.sized ? within(size ?? type.size).map((v) => Number(v.toFixed(3))) : null;
  const shaping = type.params.filter((param) => !param.pose);
  const key = [kind, shaping.map((param) => param.points || param.heights ? JSON.stringify(values[param.name]) : param.bytes ? hashOf(values[param.name]) : values[param.name]).join(","), ...type.seeded ? [grain] : [], ...box ? [box.join(",")] : []].join(":");
  const bias = resolve(type.bias, values) ?? BIAS;
  if (!type.moving)
    return { key, bias, mesh: (level) => type.mesh(values, grain, level, box) };
  const poses = type.params.filter((param) => param.pose);
  const rest = { ...values, ...Object.fromEntries(poses.map((param) => [param.name, param.default])) };
  const posed = { ...values, ...Object.fromEntries(poses.map((param) => {
    const given = params?.[param.name];
    return [param.name, Number.isFinite(given) ? Math.min(Math.max(given, param.min), param.max) : values[param.name]];
  })) };
  const whole = (level) => wholeOf(`${key}@${level}`, () => type.mesh(rest, grain, level, box));
  const moved = new Set(type.moving.flatMap((piece) => piece.faces));
  return {
    key,
    bias,
    mesh: (level) => pieceOf(whole(level), (face2) => !moved.has(face2)),
    moving: type.moving.map((piece, i) => ({ key: `${key}#${i}`, mesh: (level) => pieceOf(whole(level), (face2) => piece.faces.includes(face2)), turn: turnOf(piece.turn(posed, box)) }))
  };
};

// src/vegetation/record.js
var TREE_SCALE = [0.25, 4];
var BUILT_IN = /^[a-z][a-zA-Z]{0,31}$/;
var OWN = /^[^/\s]{1,80}:[^/\s]{1,80}$/;
var speciesName = (value) => typeof value === "string" && (BUILT_IN.test(value) || OWN.test(value));
var wrapYaw = (degrees) => (degrees % 360 + 360) % 360;
var WHOLE = new Set(["branches", "twigs"]);

// src/build/behaviours.js
var TIME = { name: "time", label: "Time", min: 0.2, max: 5, default: 1, step: 0.1, unit: "s", description: "How long it takes to open, and to shut (s)." };
var STAY = { name: "stay", label: "Stays open", min: 0, max: 60, default: 5, step: 0.5, unit: "s", description: "How long it stays open after a click before it shuts by itself (s); 0, until clicked again." };
var TRIGGER = { name: "trigger", label: "Opens on", min: 0, max: 2, default: 0, step: 1, options: ["click", "near", "both"], description: "What opens it: a click; someone coming near — it shuts once they have all gone; or either." };
var REACH = { name: "reach", label: "Near", min: 0.5, max: 10, default: 2.5, step: 0.5, unit: "m", description: "How near someone comes before it opens by itself (m)." };
var along = (axis, fallback, what) => ({ name: axis, label: `Along ${axis}`, min: -64, max: 64, default: fallback, step: 0.05, unit: "m", description: `How far it ${what} along its own ${axis} (m).` });
var BEHAVIOURS = Object.freeze({
  spin: {
    label: "Turns",
    description: "Turns round its own up (z) without stopping: a carousel, a fan, a sign.",
    params: [{ name: "speed", label: "Speed", min: -360, max: 360, default: 30, step: 1, unit: "°/s", description: "How fast it turns, in degrees a second; below 0, the other way." }]
  },
  move: {
    label: "Goes and comes back",
    description: "Goes from where it is to a point and back, waiting at either end: an elevator, a moving platform.",
    params: [
      along("x", 0, "goes"),
      along("y", 0, "goes"),
      along("z", 3, "goes"),
      { name: "speed", label: "Speed", min: 0.1, max: 20, default: 1, step: 0.1, unit: "m/s", description: "How fast it goes (m/s), easing in and out at either end." },
      { name: "wait", label: "Waits", min: 0, max: 60, default: 2, step: 0.5, unit: "s", description: "How long it waits at either end (s)." }
    ]
  },
  door: {
    label: "Door",
    description: "Swings open on a click or as someone comes near, and shuts by itself, on its hinges along one of its sides; a door of the door kind opens its own leaf.",
    touch: true,
    prim: true,
    params: [
      { name: "angle", label: "Opens", min: -170, max: 170, default: 90, step: 1, unit: "°", description: "How far it swings open (°); below 0, the other way. A door of the door kind opens up to 110°." },
      { name: "hinge", label: "Hinges", min: 0, max: 1, default: 0, step: 1, options: ["left", "right"], description: "The side it hangs on, seen from its front (−y): its −x side or its +x side." },
      TRIGGER,
      REACH,
      TIME,
      STAY
    ]
  },
  slide: {
    label: "Slides",
    description: "Slides aside on a click or as someone comes near, and back by itself: a sliding door, a window, a hatch.",
    touch: true,
    params: [along("x", 1, "slides"), along("y", 0, "slides"), along("z", 0, "slides"), TRIGGER, REACH, TIME, STAY]
  },
  belt: {
    label: "Conveyor",
    description: "Carries whoever stands on it along its own y: an escalator (stairs rise along their y), a moving walkway.",
    params: [{ name: "speed", label: "Speed", min: -5, max: 5, default: 0.5, step: 0.05, unit: "m/s", description: "How fast it carries (m/s); below 0, the other way." }]
  },
  route: {
    label: "Follows a route",
    description: "Goes from where it is through its points, round and on again or to the last and back, stopping a while if asked — at each point, or only at its ends: a boat on a tour that comes back to port, a train on its line with its station.",
    params: [
      { name: "speed", label: "Speed", min: 0.1, max: 50, default: 3, step: 0.1, unit: "m/s", description: "How fast it goes (m/s); where it stops, it slows down and speeds up again at about 1 m/s²." },
      { name: "stop", label: "Stops", min: 0, max: 120, default: 0, step: 0.5, unit: "s", description: "How long it stops (s), where Stops at says: a port, a station; 0, it goes on through them all." },
      { name: "at", label: "Stops at", min: 0, max: 1, default: 0, step: 1, options: ["each", "ends"], labels: ["Every point", "Its ends"], description: "Where it stops, as long as Stops says: at every point; or only where it is kept — its station, its port — and, going there and back, at its last point too." },
      { name: "mode", label: "Goes", min: 0, max: 1, default: 0, step: 1, options: ["round", "back"], description: "Round its points and on again, or to the last and back the way it came." },
      { name: "face", label: "Faces its way", min: 0, max: 1, default: 1, step: 1, options: ["no", "yes"], description: "Whether it turns to where it goes, as a boat or a train does." },
      { name: "water", label: "On the water", min: 0, max: 1, default: 0, step: 1, options: ["no", "yes"], description: "Whether it keeps its height over the sea wherever its points are: a boat." }
    ],
    points: { name: "points", max: 64, reach: 1e4, step: 0.01, description: "Where it goes, in its own frame (m): from where it is kept through each point in turn." },
    since: { name: "since", unit: "ms", description: "When it set off from where it is kept, in the epoch's ms: set as it is chosen or changed on the card; 0, as if at the epoch." }
  }
});
var paths = new WeakMap;
var timelines = new WeakMap;
var drawnPlaces = new WeakMap;

// src/physics/colliders.js
var CUBE = PRESETS.cube.shape.join(",");
var CYLINDER = PRESETS.cylinder.shape.join(",");
var SPHERE = PRESETS.sphere.shape.join(",");
var LEVEL = 1;
var ROUND3 = 0.02;
var FLAT2 = 0.01;
var ALIKE = 0.001;
var normals = new Map;
var convexity = new Map;
var KEEP3 = 512;
var remember = (map, key, value) => {
  if (map.size >= KEEP3)
    map.delete(map.keys().next().value);
  map.set(key, value);
  return value;
};
var shapeKey = (shape) => {
  const raw = shape.join(",");
  return normals.get(raw) ?? remember(normals, raw, normalizeShape(shape).join(","));
};
var round = (a, b) => Math.abs(a - b) <= ALIKE * Math.max(a, b);
var isConvex = ({ positions, indices }) => {
  const count = positions.length / 3;
  for (let t = 0;t < indices.length; t += 3) {
    const a = indices[t] * 3, b = indices[t + 1] * 3, c = indices[t + 2] * 3;
    const ux = positions[b] - positions[a], uy = positions[b + 1] - positions[a + 1], uz = positions[b + 2] - positions[a + 2];
    const vx = positions[c] - positions[a], vy = positions[c + 1] - positions[a + 1], vz = positions[c + 2] - positions[a + 2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const length2 = Math.hypot(nx, ny, nz);
    if (length2 < 0.000000001)
      continue;
    nx /= length2;
    ny /= length2;
    nz /= length2;
    for (let i = 0;i < count; i++) {
      const o = i * 3;
      if ((positions[o] - positions[a]) * nx + (positions[o + 1] - positions[a + 1]) * ny + (positions[o + 2] - positions[a + 2]) * nz > FLAT2)
        return false;
    }
  }
  return indices.length > 0;
};
var pointsOf = ({ positions, welded }) => {
  const kept = [];
  for (let v = 0;v < welded.length; v++)
    if (welded[v] === v)
      kept.push(positions[v * 3], positions[v * 3 + 1], positions[v * 3 + 2]);
  return Float32Array.from(kept);
};
var fromMesh = (key, mesh, size) => {
  if (!mesh)
    return [];
  const convex = convexity.get(key) ?? remember(convexity, key, isConvex(mesh));
  return [convex ? { type: "hull", key, points: pointsOf(mesh), scale: [...size] } : { type: "mesh", key, positions: mesh.positions, indices: mesh.indices, scale: [...size] }];
};
var piecesOf = (part, meshOf) => {
  if (part.phantom)
    return [];
  const { size } = part;
  const recipe = part.recipe ?? (part.kind ? part : null);
  const kind = kindOf(recipe?.kind);
  if (kind) {
    const params = constrainKind(recipe.kind, recipe.params).params;
    const own = typeof kind.collider === "function" ? kind.collider(params, kind.seeded ? seedOf(recipe.seed) : 0, size) : null;
    if (own)
      return own;
    const key2 = `k:${kindMesh({ ...recipe, size }).key}`;
    const mesh = meshOf(LEVEL);
    if (kind.collider === "hull" && mesh)
      return [{ type: "hull", key: key2, points: pointsOf(mesh), scale: [...size] }];
    return fromMesh(key2, mesh, size);
  }
  const key = shapeKey(part.shape);
  const [x, y, z] = size;
  if (key === CUBE)
    return [{ type: "box", half: [x / 2, y / 2, z / 2], radius: Math.min(ROUND3, x / 2, y / 2, z / 2) }];
  if (key === CYLINDER && round(x, y))
    return [{ type: "cylinder", half: z / 2, radius: x / 2, rounding: Math.min(ROUND3, z / 2, x / 2) }];
  if (key === SPHERE && round(x, y) && round(y, z))
    return [{ type: "sphere", radius: x / 2 }];
  return fromMesh(`p:${key}`, meshOf(LEVEL), size);
};
var wheelsOf = (parts, meshesOf = () => () => null) => parts.flatMap((part, index) => {
  const pieces = piecesOf(part, meshesOf(part));
  if (pieces.length !== 1 || pieces[0].type !== "cylinder")
    return [];
  const [piece] = pieces;
  const axis = quatRotate(part.rotation, quatRotate(piece.rotation ?? [0, 0, 0, 1], [0, 0, 1]));
  if (Math.abs(axis[0]) < 0.8)
    return [];
  return [{ index, at: add(part.position, quatRotate(part.rotation, piece.at ?? [0, 0, 0])), radius: piece.radius, width: 2 * piece.half }];
}).sort((a, b) => b.at[1] - a.at[1] || a.at[0] - b.at[0]);

// src/build/vehicles.js
var MASS = { name: "mass", label: "Mass", min: 50, max: 5000, default: 1000, step: 10, unit: "kg", description: "How heavy it is (kg): heavier, it speeds up and stops more slowly." };
var VEHICLES = Object.freeze({
  car: {
    label: "Car",
    description: "Driven on its wheels — its cylinders lying across it — the front ones steering: W and S throttle and brake, A and D steer, Space the hand brake.",
    params: [
      { name: "power", label: "Power", min: 50, max: 3000, default: 500, step: 10, unit: "N·m", description: "Its engine's torque (N·m): more, it speeds up faster and climbs steeper." },
      { name: "speed", label: "Top speed", min: 2, max: 60, default: 25, step: 1, unit: "m/s", description: "As fast as it goes (m/s)." },
      { name: "steer", label: "Steers", min: 5, max: 45, default: 30, step: 1, unit: "°", description: "How far its front wheels turn (°)." },
      MASS
    ]
  },
  bike: {
    label: "Motorbike",
    description: "Driven on its two wheels — its front and back cylinders lying across it — leaning into its turns: W and S throttle and brake, A and D steer.",
    params: [
      { name: "power", label: "Power", min: 10, max: 600, default: 150, step: 5, unit: "N·m", description: "Its engine's torque (N·m)." },
      { name: "speed", label: "Top speed", min: 2, max: 70, default: 30, step: 1, unit: "m/s", description: "As fast as it goes (m/s)." },
      { name: "steer", label: "Steers", min: 5, max: 45, default: 30, step: 1, unit: "°", description: "How far its front wheel turns (°)." },
      { ...MASS, default: 250 }
    ]
  },
  train: {
    label: "Train",
    description: "Along its route (Does: follows a route), its driver setting its speed: W faster, S slower and then back; left, it goes on with its timetable from there.",
    params: [
      { name: "speed", label: "Top speed", min: 1, max: 60, default: 20, step: 1, unit: "m/s", description: "As fast as its driver takes it (m/s)." },
      { name: "accel", label: "Speeds up", min: 0.1, max: 3, default: 0.8, step: 0.1, unit: "m/s²", description: "How fast it speeds up and slows down on its driver's keys (m/s²)." }
    ]
  },
  boat: {
    label: "Boat",
    description: "Afloat on the sea, its hull its parts: W and S ahead and astern, A and D its rudder.",
    params: [
      { name: "power", label: "Power", min: 50, max: 5000, default: 600, step: 10, unit: "", description: "Its engine (2 N of thrust a unit): more, it speeds up faster." },
      { name: "speed", label: "Top speed", min: 1, max: 30, default: 8, step: 0.5, unit: "m/s", description: "As fast as it goes (m/s)." },
      { name: "steer", label: "Rudder", min: 5, max: 45, default: 30, step: 1, unit: "°", description: "How hard its rudder turns it." },
      { ...MASS, default: 800 }
    ]
  }
});
var vehicleType = (name) => typeof name === "string" && Object.hasOwn(VEHICLES, name) ? VEHICLES[name] : null;
var decimals2 = (step) => Math.max(0, Math.ceil(-Math.log10(step) - 0.000000001));
var held = (param, value) => {
  if (!Number.isFinite(value))
    return param.default;
  const within2 = Math.min(Math.max(value, param.min), param.max);
  return Number(Math.min(param.min + Math.round((within2 - param.min) / param.step) * param.step, param.max).toFixed(decimals2(param.step)));
};
var vehicleOf = (value) => {
  const kind = vehicleType(value?.type);
  return kind && { type: value.type, ...Object.fromEntries(kind.params.map((param) => [param.name, held(param, value[param.name])])) };
};

// src/build/edit/import.js
var DEG = Math.PI / 180;
var seedFor = (name, index) => {
  let hash2 = 2166136261;
  for (const char of `${name}#${index}`)
    hash2 = Math.imul(hash2 ^ char.charCodeAt(0), 16777619);
  return seedOf(hash2 >>> 0);
};
var turnOf2 = (degrees) => {
  const [x, y, z] = (degrees ?? [0, 0, 0]).map((value) => value * DEG);
  return quatMultiply(quatAxisAngle([0, 0, 1], z), quatMultiply(quatAxisAngle([0, 1, 0], y), quatAxisAngle([1, 0, 0], x)));
};
var slugOf = (name) => String(name ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
var kindPart = (prim, name, index) => {
  const kind = kindOf(prim.kind);
  if (!kind)
    throw new Error(`${name}: no kind ${prim.kind}`);
  const given = { ...prim.params, ...Object.fromEntries(kind.params.filter((param) => prim[param.name] !== undefined).map((param) => [param.name, prim[param.name]])) };
  const { params: held2, errors } = constrainKind(prim.kind, given);
  const sized = prim.size && kind.resize ? constrainKind(prim.kind, { ...resizeParams({ kind: prim.kind, params: held2, size: prim.size }), ...given }).params : held2;
  const { params, shift } = recentred({ kind: prim.kind, params: sized });
  const part = { kind: prim.kind, params, ...kind.seeded && { seed: Number.isInteger(prim.seed) ? seedOf(prim.seed) : seedFor(name, index) } };
  const lies = Boolean(kind.settle) && kind.params.some((param) => param.points && Array.isArray(given[param.name]) && given[param.name].every((point) => Array.isArray(point) && point.length === 2));
  return { part: { ...part, shape: fallbackShape(part), size: fitSize({ ...part, size: prim.size ?? kind.size }) }, shift, lies, errors };
};
var laidOnGround = (part, at, turn2, object, groundRadius) => {
  const type = kindOf(part.kind);
  const rotation = quatMultiply(object.rotation, turn2);
  const place = add(object.at, quatRotate(object.rotation, at));
  const up = quatRotate(rotation, [0, 0, 1]);
  const { min, max } = type.footprint(part.params);
  const centre = min.map((v, k) => (v + max[k]) / 2);
  const heightAt = (x, y) => {
    const dir = normalize(add(place, quatRotate(rotation, [x - centre[0], y - centre[1], 0])));
    return dot(sub(scale(dir, groundRadius(dir)), place), up) + centre[2];
  };
  const { params, shift } = recentred({ kind: part.kind, params: type.settle(part.params, heightAt) });
  return { params, at: add(at, quatRotate(turn2, shift)), size: fitSize({ ...part, params }) };
};
var shapeOf = (shape, name, warnings) => {
  if (typeof shape === "string")
    return Object.hasOwn(PRESETS, shape) ? { shape: PRESETS[shape].shape, rez: PRESETS[shape].rezRotation } : null;
  if (Array.isArray(shape))
    return { shape, rez: null };
  if (!shape || typeof shape !== "object" || !Object.hasOwn(PRESETS, shape.preset))
    return null;
  const fields = Object.fromEntries(SHAPE_FIELDS.filter((field) => Number.isFinite(shape[field])).map((field) => [field, shape[field]]));
  const unknown = Object.keys(shape).filter((key) => key !== "preset" && !SHAPE_FIELDS.includes(key));
  if (unknown.length)
    warnings.push(`${name}: no shape field ${unknown.join(", ")}`);
  const { params, errors } = constrainParams({ ...decodeShape(PRESETS[shape.preset].shape), ...fields });
  if (errors.length)
    warnings.push(`${name}: shape ${errors.join(", ")} held to range`);
  return { shape: encodeShape(params), rez: PRESETS[shape.preset].rezRotation };
};
var partsOf = (prims, { name, objectId, materials, warnings, object, groundRadius }) => prims.map((prim, index) => {
  const kind = prim.kind === undefined ? null : kindPart(prim, name, index);
  const preset2 = kind ? null : shapeOf(prim.shape, prim.name ?? `part ${index}`, warnings);
  if (!kind && !preset2 && prim.sculpt !== undefined)
    throw new Error(`${name}: ${prim.name ?? `part ${index}`} is a description ("sculpt"): make it a sculpted prim first (the sculpt tool)`);
  if (!kind && !preset2)
    throw new Error(`${name}: no shape ${typeof prim.shape === "string" ? prim.shape : JSON.stringify(prim.shape)}`);
  if (kind)
    warnings.push(...kind.errors.map((error) => `${prim.name ?? `part ${index}`}: ${error}`));
  const texture = prim.material ?? (prim.surface?.texture ? undefined : kind && kindOf(prim.kind).material);
  const surface = texture || prim.surface ? { ...texture && { texture }, ...prim.surface } : null;
  const turn2 = turnOf2(prim.turn);
  const at = kind ? add(prim.at, quatRotate(turn2, kind.shift)) : [...prim.at];
  const laid = kind?.lies ? laidOnGround(kind.part, at, turn2, object, groundRadius) : null;
  if (laid)
    Object.assign(kind.part, { params: laid.params, size: laid.size });
  return {
    type: "prim",
    id: `${objectId}-${index}`,
    object: objectId,
    shape: [...kind ? kind.part.shape : preset2.shape],
    at: laid?.at ?? at,
    rotation: quatNormalize(quatMultiply(turn2, preset2?.rez ?? [0, 0, 0, 1])),
    size: [...kind ? kind.part.size : prim.size],
    color: prim.color ?? materials.get(surface?.texture)?.color ?? [0.6, 0.6, 0.6],
    ...kind && { kind: kind.part.kind, params: kind.part.params, ...kind.part.seed !== undefined && { seed: kind.part.seed } },
    ...surface && { surface },
    ...prim.light && { light: prim.light },
    ...prim.particles && { particles: prim.particles },
    ...prim.phantom === true ? { phantom: true } : prim.collisionOnly === true && { collisionOnly: true },
    ...prim.seat === true && { seat: true },
    ...prim.behaviour && { behaviour: prim.behaviour },
    ...prim.script && { script: typeof prim.script === "string" ? { source: prim.script } : prim.script }
  };
});
var placeBuild = (spec, { groundRadius, materials, id }) => {
  const up = normalize(spec.anchor.at);
  const north = normalize(sub([0, 1, 0], scale(up, up[1])));
  const east = cross(north, up);
  const heading = spec.anchor.heading * DEG;
  const ahead = add(scale(north, Math.cos(heading)), scale(east, Math.sin(heading)));
  const right = cross(ahead, up);
  const origin = spec.anchor.exact ? [...spec.anchor.at] : scale(up, groundRadius(up));
  const frame = quatFromBasis(right, ahead, up);
  const used = new Set;
  const idOf = (given, made) => {
    const chosen = typeof given === "string" && given.length > 0 && given.length <= 160 && !given.includes("/") ? given : made;
    if (used.has(chosen))
      throw new Error(`${spec.name}: two records with the id ${chosen}`);
    used.add(chosen);
    return chosen;
  };
  const placeOf = (at) => {
    const level = add(origin, add(scale(right, at[0]), scale(ahead, at[1])));
    if (at.length !== 2)
      return add(level, scale(up, at[2]));
    const dir = normalize(level);
    return scale(dir, groundRadius(dir));
  };
  const warnings = [];
  const objects = [];
  const parts = [];
  const names = new Map;
  const addObject = (name, objectId, at, turn2, prims, behaviour, vehicle, origin2) => {
    if (!prims?.length)
      return;
    const rotation = quatNormalize(quatMultiply(frame, turnOf2(turn2)));
    const driven = vehicle === undefined ? null : vehicleOf(vehicle);
    if (vehicle !== undefined && !driven)
      warnings.push(`${name}: no vehicle "${vehicle?.type}"`);
    objects.push({ type: "object", id: objectId, name, at, rotation, ...behaviour && { behaviour }, ...driven && { vehicle: driven }, ...origin2 && typeof origin2 === "object" && { origin: origin2 } });
    parts.push(...partsOf(prims, { name: objectId === id ? spec.name : `${spec.name}#${name}`, objectId, materials, warnings, object: { at, rotation }, groundRadius }));
    names.set(name, objectId);
  };
  if (spec.prims?.length)
    addObject(spec.name, idOf(null, id), origin, null, spec.prims);
  for (const object of spec.objects ?? []) {
    const slug = slugOf(object.name);
    if (!slug)
      throw new Error(`${spec.name}: an object without a name`);
    if (names.has(object.name) || objects.some(({ id: other }) => other === `${id}~${slug}`))
      throw new Error(`${spec.name}: two objects named ${object.name}`);
    addObject(object.name, idOf(object.id, `${id}~${slug}`), placeOf(object.at), object.turn, object.prims, object.behaviour, object.vehicle, object.origin);
  }
  const clones = (spec.clones ?? []).map((clone, n) => {
    if (!names.has(clone.of))
      throw new Error(`${spec.name}: no object ${clone.of} to clone`);
    return {
      type: "instance",
      id: idOf(clone.id, `${id}~clone-${n}`),
      of: names.get(clone.of),
      at: placeOf(clone.at),
      rotation: quatNormalize(quatMultiply(frame, turnOf2(clone.turn))),
      ...clone.behaviour && { behaviour: clone.behaviour }
    };
  });
  const trees = (spec.trees ?? []).map((tree, n) => {
    if (!speciesName(tree.species))
      throw new Error(`${spec.name}: no species ${tree.species}`);
    const seed = Number.isInteger(tree.seed) && tree.seed >= 0 ? tree.seed % 4294967296 : seedFor(`${spec.name}~trees`, n);
    const size = Number.isFinite(tree.scale) ? Math.min(Math.max(tree.scale, TREE_SCALE[0]), TREE_SCALE[1]) : 1;
    if (size !== (tree.scale ?? 1))
      warnings.push(`tree ${n}: scale ${tree.scale} → ${size}`);
    const turn2 = Number.isFinite(tree.turn) ? tree.turn : seed * 137.508 % 360;
    return { type: "tree", id: idOf(tree.id, `${id}~tree-${n}`), species: tree.species, seed, at: placeOf(tree.at), yaw: wrapYaw(spec.anchor.heading - turn2), scale: size };
  });
  const own = objects.find((object) => object.id === id) ?? null;
  return { object: own, parts: parts.filter((part) => part.object === id), records: [...objects, ...parts, ...clones, ...trees], warnings };
};

// src/build/particles.js
var MAX_PER_SYSTEM = 4096;
var PATTERNS = Object.freeze({ drop: 0, explode: 1, angle: 2, cone: 3, "cone-empty": 4 });
var ADDED = 1;
var LIT = 2;
var STREAK = 4;
var BOUNCE = 8;
var PRESETS2 = Object.freeze({
  fire: {
    pattern: "cone",
    rate: 0.2,
    count: 1,
    life: 0.6,
    radius: 0.08,
    angle: [0, 15],
    speed: [0.25, 0.5],
    accel: [0, 0, 1.6],
    drag: 1.8,
    color: [[1, 0.6, 0.18], [0.75, 0.12, 0.02]],
    alpha: [0.8, 0],
    size: [0.32, 0.1],
    glow: [0.35, 0.04],
    blend: "add",
    lit: false,
    turbulence: 0.25,
    streak: true,
    stretch: 0.3,
    shine: 2
  },
  smoke: {
    pattern: "cone",
    rate: 1,
    count: 1,
    life: 4.5,
    radius: 0.08,
    angle: [0, 10],
    speed: [0.3, 0.45],
    accel: [0, 0, 0.2],
    drag: 0.35,
    color: [[0.32, 0.32, 0.32], [0.55, 0.55, 0.56]],
    alpha: [0.55, 0],
    size: [0.35, 1.5],
    glow: [0, 0],
    blend: "alpha",
    lit: true,
    turbulence: 0.3,
    drift: [0.25, 0.1, 0]
  },
  sparks: {
    pattern: "cone",
    rate: 0.4,
    count: 1,
    life: 0.7,
    radius: 0.04,
    angle: [0, 45],
    speed: [1.5, 3],
    accel: [0, 0, -9.8],
    drag: 0.4,
    color: [[1, 0.85, 0.45], [1, 0.3, 0.04]],
    alpha: [1, 0],
    size: [0.03, 0.01],
    glow: [1, 0.2],
    blend: "add",
    lit: false,
    streak: true,
    stretch: 0.03,
    bounce: true
  },
  steam: {
    pattern: "cone",
    rate: 0.4,
    count: 1,
    life: 1.6,
    radius: 0.05,
    angle: [0, 10],
    speed: [0.6, 1],
    accel: [0, 0, 0.4],
    drag: 0.8,
    color: [[0.9, 0.9, 0.92], [0.96, 0.96, 0.97]],
    alpha: [0.5, 0],
    size: [0.12, 0.6],
    glow: [0, 0],
    blend: "alpha",
    lit: true,
    turbulence: 0.5,
    drift: [0.1, 0.05, 0]
  },
  fog: {
    pattern: "drop",
    rate: 2.5,
    count: 1,
    life: 10,
    radius: 4,
    angle: [0, 0],
    speed: [0, 0.05],
    accel: [0, 0, 0],
    drag: 0.5,
    color: [[0.8, 0.82, 0.85], [0.86, 0.88, 0.9]],
    alpha: [0.28, 0],
    size: [1.5, 3],
    glow: [0, 0],
    blend: "alpha",
    lit: true,
    turbulence: 0.15,
    drift: [0.15, 0.05, 0]
  },
  fountain: {
    pattern: "cone",
    rate: 0.08,
    count: 1,
    life: 1.3,
    radius: 0.03,
    angle: [0, 5],
    speed: [5.4, 6],
    accel: [0, 0, -9.8],
    drag: 0.15,
    color: [[0.82, 0.9, 1], [0.75, 0.85, 0.98]],
    alpha: [0.5, 0.15],
    size: [0.06, 0.12],
    glow: [0, 0],
    blend: "alpha",
    lit: true,
    streak: true,
    stretch: 0.04,
    floor: -0.3
  },
  snow: {
    pattern: "drop",
    rate: 0.3,
    count: 2,
    life: 9,
    radius: 8,
    angle: [0, 0],
    speed: [0.6, 1],
    accel: [0, 0, 0],
    drag: 0,
    color: [[1, 1, 1], [0.95, 0.97, 1]],
    alpha: [0.9, 0.9],
    size: [0.05, 0.05],
    glow: [0, 0],
    blend: "alpha",
    lit: true,
    turbulence: 0.25
  }
});
var KITS = Object.freeze({
  campfire: [{ preset: "fire" }, { preset: "sparks", amount: 0.5 }, { preset: "smoke", amount: 0.6, tint: [0.75, 0.75, 0.75] }],
  torch: [{ preset: "fire", scale: 0.5 }, { preset: "smoke", scale: 0.4, amount: 0.5 }],
  chimney: [{ preset: "smoke", scale: 1.2, tint: [0.85, 0.85, 0.85] }]
});
var MAX_LAYERS = 4;
var RANGES = {
  rate: [0.005, 60],
  count: [1, 4096],
  life: [0.05, 30],
  radius: [0, 50],
  drag: [0, 20],
  turbulence: [0, 5],
  floor: [-1000, 0],
  stretch: [0, 2],
  shine: [0, 10],
  angle: [0, 180, 2],
  speed: [0, 50, 2],
  alpha: [0, 1, 2],
  size: [0.005, 10, 2],
  glow: [0, 1, 2],
  accel: [-50, 50, 3],
  drift: [-20, 20, 3]
};
var OPTIONS = { pattern: Object.keys(PATTERNS), blend: ["add", "alpha"] };
var AMOUNT = [0.1, 4];
var SCALE = [0.1, 10];
var clamp3 = (value, low, high, fallback) => Number.isFinite(value) ? Math.min(Math.max(value, low), high) : fallback;
var pair = (value, low, high, fallback) => Array.isArray(value) && value.length === 2 ? value.map((v, i) => clamp3(v, low, high, fallback[i])) : fallback;
var vector = (value, limit, fallback) => Array.isArray(value) && value.length === 3 ? value.map((v, i) => clamp3(v, -limit, limit, fallback[i])) : fallback;
var colorOf = (value, fallback) => Array.isArray(value) && value.length === 3 ? value.map((v, i) => clamp3(v, 0, 1, fallback[i])) : fallback;
var numbers = (value, n) => Array.isArray(value) && value.length === n && value.every(Number.isFinite);
var layersOf = (spec) => typeof spec === "string" ? KITS[spec] ?? [] : Array.isArray(spec) ? spec.slice(0, MAX_LAYERS) : spec && typeof spec === "object" ? [spec] : [];
var particlesOf = (spec) => {
  if (!spec || typeof spec !== "object" || spec.on === false)
    return null;
  const base = PRESETS2[spec.preset] ?? PRESETS2.fire;
  const value = (key) => spec[key] ?? base[key];
  const amount = clamp3(spec.amount, ...AMOUNT, 1), scale3 = clamp3(spec.scale, ...SCALE, 1);
  const tint = numbers(spec.tint, 3) ? spec.tint.map((v) => clamp3(v, 0, 1)) : [1, 1, 1];
  const asked = clamp3(Math.round(value("count")), ...RANGES.count, base.count) * amount;
  const every = clamp3(value("rate"), ...RANGES.rate, base.rate);
  const rate = asked < 1 ? clamp3(every / asked, ...RANGES.rate, every) : every;
  const life = clamp3(value("life"), ...RANGES.life, base.life);
  const bursts = Math.ceil(life / rate) + 1;
  const count = Math.min(Math.max(Math.round(asked), 1), Math.max(1, Math.floor(MAX_PER_SYSTEM / bursts)));
  const colors = Array.isArray(spec.color) && spec.color.length === 2 ? spec.color : base.color;
  const scaled = (values, by = scale3) => values.map((v) => v * by);
  const system = {
    pattern: PATTERNS[value("pattern")] ?? PATTERNS.cone,
    rate,
    life,
    count,
    bursts,
    radius: clamp3(value("radius"), ...RANGES.radius, base.radius) * scale3,
    angle: pair(value("angle"), 0, 180, base.angle),
    speed: scaled(pair(value("speed"), 0, 50, base.speed)),
    accel: scaled(vector(value("accel"), 50, base.accel)),
    drift: scaled(vector(value("drift"), 20, base.drift ?? [0, 0, 0])),
    drag: clamp3(value("drag"), ...RANGES.drag, base.drag),
    turbulence: clamp3(value("turbulence"), ...RANGES.turbulence, base.turbulence ?? 0) * scale3,
    color: [colorOf(colors[0], base.color[0]), colorOf(colors[1], base.color[1])].map((color) => color.map((v, k) => v * tint[k])),
    alpha: pair(value("alpha"), 0, 1, base.alpha),
    size: scaled(pair(value("size"), 0.005, 10, base.size)),
    glow: pair(value("glow"), 0, 1, base.glow),
    floor: clamp3(value("floor"), ...RANGES.floor, -1000),
    stretch: clamp3(value("stretch"), ...RANGES.stretch, 0.04) * scale3,
    shine: Math.min(clamp3(value("shine"), ...RANGES.shine, 0) * scale3, RANGES.shine[1]),
    flags: (value("blend") === "add" ? ADDED : 0) | (value("lit") ? LIT : 0) | (value("streak") ? STREAK : 0) | (value("bounce") ? BOUNCE : 0),
    since: Number.isFinite(spec.since) ? spec.since : 0
  };
  system.alive = system.count * system.bursts;
  return system;
};
var systemsOf = (spec) => layersOf(spec).map(particlesOf).filter(Boolean);

// src/build/edit/check.js
var LINKSET = 256;
var LIGHT_RANGE = 10;
var LIGHTS_EACH = 8;
var NEAR = 30;
var BUDGET = Object.freeze({
  parts: { fair: 1500, most: 4000 },
  triangles: { fair: 150000, most: 600000 },
  materials: { fair: 40, most: 96 },
  lights: { fair: 12, most: 32 },
  crowd: { fair: LIGHTS_EACH, most: 16 },
  systems: { fair: 12, most: 48 },
  particles: { fair: 1000, most: 3000 },
  moving: { fair: 30, most: 120 },
  scripts: { fair: 8, most: 32 },
  trees: { fair: 400, most: 2000 }
});
var ZONE = Object.freeze({
  radius: 60,
  parts: { fair: 3000, most: 1e4 },
  lights: { fair: 16, most: 48 },
  systems: { fair: 24, most: 96 },
  trees: { fair: 3000, most: 1e4 }
});
var R = 6348000;
var NOWHERE = Object.freeze({ at: [R, 0, 0], heading: 0 });
var frameOfAnchor = (anchor, groundRadius = () => R) => {
  const up = normalize(anchor.at);
  const north = normalize(sub([0, 1, 0], scale(up, up[1])));
  const east = cross(north, up);
  const heading = anchor.heading * Math.PI / 180;
  const ahead = add(scale(north, Math.cos(heading)), scale(east, Math.sin(heading)));
  const right = cross(ahead, up);
  const origin = anchor.exact ? [...anchor.at] : scale(up, groundRadius(up));
  return { up, right, ahead, origin, inFrame: (point) => {
    const d = sub(point, origin);
    return [dot(d, right), dot(d, ahead), dot(d, up)];
  } };
};
var lightFor = (materials) => {
  const texturesOf = (part) => [part.surface?.texture, ...Object.values(part.surface?.faces ?? {}).map((face2) => face2.texture)].filter(Boolean);
  return (part) => {
    if (part.collisionOnly || part.light?.on === false || part.light?.range === 0)
      return null;
    const emits = (part.surface?.emissive ?? 0) > 0 || Object.values(part.surface?.faces ?? {}).some((face2) => (face2.emissive ?? 0) > 0) || texturesOf(part).some((texture) => materials.get(texture)?.effects?.emissive);
    if (!emits && !part.light)
      return null;
    return { range: Math.min(part.light?.range ?? LIGHT_RANGE, LIGHT_RANGE), night: part.light?.on === "night" };
  };
};
var checkBuild = (spec, { materials, isSpecies, groundRadius, id = "check", zone = null }) => {
  const errors = [], notes = [];
  const placed = { ...spec, anchor: spec.anchor ?? NOWHERE };
  let records = [], warnings = [];
  try {
    ({ records, warnings } = placeBuild(placed, { groundRadius: groundRadius ?? (() => R), materials, id }));
  } catch (error) {
    errors.push(error.message);
  }
  for (const warning of warnings) {
    if (/no parameter|"/.test(warning))
      errors.push(warning);
    else
      notes.push(`held to range: ${warning}`);
  }
  const frame = frameOfAnchor(placed.anchor, groundRadius);
  const meshes = new Map;
  const meshOf = (part) => {
    const made = part.kind ? kindMesh(part) : null;
    const key = made ? made.key : part.shape.join();
    if (!meshes.has(key)) {
      const levels = [0, 1, 2, 3].map((level) => made ? made.mesh(level) : meshPrimAsset(part.shape, level));
      meshes.set(key, { triangles: levels.map((mesh) => mesh.indices.length / 3), faces: levels[3].slots.map((slot) => slot.count > 0) });
    }
    return meshes.get(key);
  };
  const prims = records.filter((record) => record.type === "prim");
  const texturesOf = (part) => [part.surface?.texture, ...Object.values(part.surface?.faces ?? {}).map((face2) => face2.texture)].filter(Boolean);
  const unknown = new Set, sizeless = new Set;
  let seeThrough = 0, cutOut = 0;
  for (const part of prims) {
    for (const texture of texturesOf(part)) {
      const material = materials.get(texture);
      if (!material)
        unknown.add(texture);
      else if (!material.size?.every((v) => v > 0) && !part.surface?.scale)
        sizeless.add(texture);
    }
    meshOf(part).faces.forEach((has, face2) => {
      if (!has)
        return;
      const own = part.surface?.faces?.[face2];
      const material = materials.get(own?.texture ?? part.surface?.texture);
      const opacity = own?.opacity ?? part.surface?.opacity ?? 1;
      if (opacity < 1 || material?.alpha === "blend" || material?.effects?.blend)
        seeThrough++;
      else if (material?.alpha === "mask")
        cutOut++;
    });
  }
  if (unknown.size)
    errors.push(`no such material: ${[...unknown].join(", ")}`);
  for (const texture of sizeless)
    notes.push(`${texture}: the bank gives it no real size — give its faces a \`scale\` [u, v] in metres`);
  const lightOf = lightFor(materials);
  const objectRecords = records.filter((record) => record.type === "object");
  const clones = records.filter((record) => record.type === "instance");
  const objects = [], lights = [], systems = [];
  let finest = 0, second = 0;
  for (const object of objectRecords) {
    const own = prims.filter((part) => part.object === object.id);
    const copies = [object, ...clones.filter((clone) => clone.of === object.id)];
    const [, l1, , l3] = own.reduce((sum, part) => meshOf(part).triangles.map((t, i) => sum[i] + t), [0, 0, 0, 0]);
    if (own.length > LINKSET)
      errors.push(`${object.name}: ${own.length} parts, more than an object takes (${LINKSET}): split it`);
    finest += l3 * copies.length;
    second += l1 * copies.length;
    const lit = own.map(lightOf).filter(Boolean);
    const thrown = own.flatMap((part) => part.collisionOnly ? [] : systemsOf(part.particles));
    for (const copy of copies) {
      const at = frame.inFrame(copy.at);
      lights.push(...lit.map((light) => ({ ...light, at, object: object.name })));
      systems.push(...thrown.map((system) => ({ ...system, at, object: object.name })));
    }
    objects.push({ id: object.id, name: object.name, parts: own.length, copies: copies.length, triangles: [l3, l1], lights: lit.length, systems: thrown.length });
  }
  const vehicles = objectRecords.filter((object) => object.vehicle);
  for (const object of vehicles) {
    const own = prims.filter((part) => part.object === object.id);
    const wheels = wheelsOf(own.map((part) => ({ ...part, position: part.at })));
    const { type } = object.vehicle;
    if ((type === "car" || type === "bike") && wheels.length < 2)
      errors.push(`${object.name}: a ${type} runs on its wheels — two or more cylinders lying across it, "turn": [0, 90, 0]`);
    if (type === "bike" && wheels.length > 2)
      notes.push(`${object.name}: ${wheels.length} cylinders lie across it — a bike runs on its front and back ones; make any other a box, or phantom`);
    if (type === "train" && object.behaviour?.type !== "route")
      errors.push(`${object.name}: a train keeps to its route — give the object a "route" behaviour`);
    if (!own.some((part) => part.seat))
      notes.push(`${object.name}: no seat — nobody can drive it ("seat": true on the part sat on)`);
    if (clones.some((clone) => clone.of === object.id))
      notes.push(`${object.name}: its clones are not driven — only the object itself; make each vehicle an object of its own`);
  }
  const trees = records.filter((record) => record.type === "tree");
  const strange = [...new Set(trees.map((tree) => tree.species).filter((species) => !isSpecies(species)))];
  if (strange.length)
    errors.push(`no such species: ${strange.join(", ")}`);
  const most = (list) => list.reduce((top, each) => Math.max(top, list.filter((other) => Math.hypot(other.at[0] - each.at[0], other.at[1] - each.at[1]) < NEAR).length), 0);
  const crowd = most(lights);
  const moving = records.filter((record) => record.behaviour).length + clones.filter((clone) => !clone.behaviour && objectRecords.find((object) => object.id === clone.of)?.behaviour).length;
  const totals = {
    objects: objectRecords.length,
    parts: prims.length,
    clones: clones.length,
    trees: trees.length,
    triangles: [finest, second],
    meshes: meshes.size,
    materials: new Set(prims.flatMap(texturesOf)).size,
    seeThrough,
    cutOut,
    lights: lights.length,
    nightLights: lights.filter((light) => light.night).length,
    crowd,
    systems: systems.length,
    blended: systems.filter((system) => !(system.flags & 1)).length,
    particles: systems.reduce((sum, system) => sum + system.alive, 0),
    swarm: most(systems),
    moving,
    scripts: prims.filter((part) => part.script).length,
    vehicles: vehicles.length
  };
  const ADVICE = {
    parts: "clone what repeats (a linked clone costs its object's parts once), use kinds for stairs, roofs, fences and windows",
    triangles: "fewer round things (spheres, tori, rocks) and fewer segments; clones of a low-poly part",
    materials: "one material for each role (walls, roofs, floors, wood, metal), the same across houses, tinted by colour where it may",
    lights: 'light what is seen from where people stand; `"on": "night"` and shorter ranges; glow without light (`range: 0`) for the rest',
    crowd: "keep them apart, or fewer and stronger: one hearth lights a room",
    systems: "one chimney in two smoking, one campfire for a square",
    particles: "lower `amount`, smaller `scale`",
    moving: "what moves is what is used: doors, a mill, a ferry — not every shutter",
    scripts: "behaviours do most things without a script (doors, spins, slides)",
    trees: "a forest is painted with the editor's brush, not written tree by tree"
  };
  const NAMES = { crowd: `lights within ${NEAR} m of one another`, systems: "particle systems", particles: "particles in the air", moving: "things moving by themselves" };
  for (const [key, { fair, most: max }] of Object.entries(BUDGET)) {
    const value = key === "triangles" ? finest : totals[key];
    const said = `${value.toLocaleString("en")} ${NAMES[key] ?? key}`;
    if (value > max)
      errors.push(`${said}: more than one build may bring (${max.toLocaleString("en")}) — ${ADVICE[key]}`);
    else if (value > fair)
      notes.push(`${said}: past what is fair for one build (${fair.toLocaleString("en")}) — ${ADVICE[key]}`);
  }
  if (zone) {
    for (const key of ["parts", "lights", "systems", "trees"]) {
      const { fair, most: max } = ZONE[key];
      const value = zone[key] + totals[key];
      const said = `${value.toLocaleString("en")} ${key} within ${ZONE.radius} m with what stands there (${zone[key].toLocaleString("en")})`;
      if (value > max)
        errors.push(`${said}: more than a place may hold (${max.toLocaleString("en")}) — build lighter, or elsewhere`);
      else if (value > fair)
        notes.push(`${said}: past what is fair for a place (${fair.toLocaleString("en")})`);
    }
  }
  return { records, errors, notes, objects, lights, systems, totals, frame, zone };
};

// src/terrain-height.js
var ROOT_SIZE = 12696000;
var NOISE_SCALE = 800;
var SEA_LEVEL = 0.5555556;
var ELEV_SCALE = 21600;
var layer = (type, octaves, ridgeExponent, warpStrength, hmin, hmax) => ({
  type,
  octaves,
  gain: 0.5,
  ridgeOffset: 1.064,
  ridgeExponent,
  warpStrength,
  hmin,
  hmax,
  density: 0.3
});
var RIDGED = 1;
var FBM = 0;
var BASE_LAYER = layer(RIDGED, 23, 1.665, 3.6, 0, 1);
var TERRAIN_LAYER_0 = layer(RIDGED, 10, 1.005, 1.6, 0, 1);
var TERRAIN_LAYER_1 = layer(FBM, 18, 1.665, 2.6, -2, 2);
var TERRAIN_LAYER_2 = layer(RIDGED, 18, 1.1, 0.9, -2, 2);
var BIAS2 = [[2.3, 4.5, 6.7], [8.9, 9.8, 8.7], [7.6, 6.5, 5.4]];
var GRID_OFFSET = [5, 4, 9];
var hash2 = (x, y, z) => {
  const n = Math.imul(x, 1597) + Math.imul(y, 3571) + Math.imul(z, 7919) | 0;
  let state = Math.imul(n, 747796405) + 2891336453 >>> 0;
  state = Math.imul((state >>> (state >>> 28) + 4 ^ state) >>> 0, 277803737) >>> 0;
  state = (state >>> 22 ^ state) >>> 0;
  return -1 + 2 * state / 4294967295;
};
var valueNoise = (px, py, pz) => {
  const ix = Math.floor(px), iy = Math.floor(py), iz = Math.floor(pz);
  const wx = px - ix, wy = py - iy, wz = pz - iz;
  const ux = wx * wx * wx * (wx * (wx * 6 - 15) + 10);
  const uy = wy * wy * wy * (wy * (wy * 6 - 15) + 10);
  const uz = wz * wz * wz * (wz * (wz * 6 - 15) + 10);
  const a = hash2(ix, iy, iz), b = hash2(ix + 1, iy, iz), c = hash2(ix, iy + 1, iz), d = hash2(ix + 1, iy + 1, iz);
  const e = hash2(ix, iy, iz + 1), f = hash2(ix + 1, iy, iz + 1), g = hash2(ix, iy + 1, iz + 1), h = hash2(ix + 1, iy + 1, iz + 1);
  return a + (b - a) * ux + (c - a) * uy + (e - a) * uz + (a - b - c + d) * ux * uy + (a - c - e + g) * uy * uz + (a - b - e + f) * uz * ux + (-a + b + c - d + e - f - g + h) * ux * uy * uz;
};
var fbmRange = (gain, octaves) => Math.abs(gain - 1) < 0.00001 ? octaves + 1 : (1 - gain ** (octaves + 1)) / (1 - gain);
var fbm2 = ([x, y, z], gain, octaves) => {
  let f = 1, a = 1, t = 0;
  for (let i = 0;i < octaves; i++, f *= 2, a *= gain)
    t += a * valueNoise(f * x, f * y, f * z);
  return t;
};
var fbmScaled = (p, gain, octaves, min, max) => {
  const h = fbmRange(gain, octaves);
  return min + (max - min) * ((fbm2(p, gain, octaves) + h) / (2 * h));
};
var ridgedFbmScaled = ([x, y, z], gain, octaves, offset, exponent, min, max) => {
  let f = 1, a = 1, t = 0, weight = 1;
  for (let i = 0;i < octaves; i++, f *= 2, a *= gain) {
    const signal = (offset - Math.abs(valueNoise(f * x, f * y, f * z))) ** exponent * weight;
    t += a * signal;
    weight = Math.min(Math.max(signal * 2, 0), 1);
  }
  const low = (offset - 1) ** exponent;
  const high = offset ** exponent * fbmRange(gain, octaves);
  return min + (max - min) * ((t - low) / (high - low));
};
var layerValue = (pos, n, scaleIndex) => {
  const bias = BIAS2[scaleIndex];
  const pt = pos.map((c, i) => (c + bias[i]) * n.density + GRID_OFFSET[i]);
  return n.type === RIDGED ? ridgedFbmScaled(pt, n.gain, n.octaves, n.ridgeOffset, n.ridgeExponent, n.hmin, n.hmax) : fbmScaled(pt, n.gain, n.octaves, n.hmin, n.hmax);
};
var warpOffset = (pos, n) => [0, 1, 2].map((i) => layerValue(pos, n, i) * n.warpStrength);
var add3 = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
var scale3 = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
var rotateDomain = ([x, y, z], angle) => {
  const c = Math.cos(angle), s = Math.sin(angle);
  return [c * x + s * y, -s * x + c * y, z];
};
var terrainHeight = (dir) => {
  const pCoords = scale3(dir, 700000 * NOISE_SCALE / ROOT_SIZE);
  const angle = fbmScaled(scale3(pCoords, 0.01), 1, 3, -Math.PI, Math.PI) * 0.4;
  const baseH = layerValue(rotateDomain(scale3(pCoords, 0.5), angle), BASE_LAYER, 0);
  const ratio = fbmScaled(scale3(dir, 40), 0.8, 3, 0, 1);
  const v0 = warpOffset(pCoords, TERRAIN_LAYER_2);
  const v1 = warpOffset(add3(pCoords, v0), TERRAIN_LAYER_1);
  let h = layerValue(add3(pCoords, v1), TERRAIN_LAYER_0, 0);
  h = (baseH + h * ratio * 0.9) / 1.3;
  const pmix = fbmScaled(add3(scale3(pCoords, 0.53), [123, 456, 789]), 1, 3, 0, 1) * 0.5 + 0.5;
  h **= 0.95 + (1.3 - 0.95) * pmix;
  const pt = scale3(dir, 40);
  const bf = Math.min(Math.max((fbmScaled(pt, 0.8, 5, 0, 1.2) - 0.5) / 0.5, 0), 1);
  const lf = fbmScaled(scale3(pt, 10), 0.9, 8, 0, 0.03);
  const deltaH = h - SEA_LEVEL;
  const hf = Math.min(Math.max(Math.abs(deltaH) / lf, 0), 1) ** 1.4;
  return SEA_LEVEL + deltaH * hf + (h - SEA_LEVEL - deltaH * hf) * bf;
};
var groundElevation = (dir) => terrainHeight(dir) * ELEV_SCALE;

// src/build/survey.js
var RADIUS = 6348000;
var SEA = 12000;
var DEG2 = Math.PI / 180;
var unit3 = (v) => {
  const length2 = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / length2, v[1] / length2, v[2] / length2];
};
var cross3 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
var dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
var axesAt = (up) => {
  const north = unit3([-up[0] * up[1], 1 - up[1] * up[1], -up[2] * up[1]]);
  return { north, east: cross3(north, up) };
};
var frameAt2 = (at, heading = 0, ground = groundElevation) => {
  const up = unit3(at);
  const { north, east } = axesAt(up);
  const ahead = north.map((v, i) => v * Math.cos(heading * DEG2) + east[i] * Math.sin(heading * DEG2));
  const right = cross3(ahead, up);
  const origin = [...at];
  const base = Math.hypot(...at);
  const point = (x, y, z = 0) => origin.map((v, i) => v + right[i] * x + ahead[i] * y + up[i] * z);
  const local = (p) => {
    const d = p.map((v, i) => v - origin[i]);
    return [dot3(d, right), dot3(d, ahead), dot3(d, up)];
  };
  const surface = (dir) => RADIUS + Math.max(ground(dir), SEA);
  const groundAt2 = (x, y) => {
    const dir = unit3(point(x, y));
    return local(dir.map((v) => v * surface(dir)))[2];
  };
  const wetAt = (x, y) => ground(unit3(point(x, y))) < SEA;
  const depthAt = (x, y) => Math.max(0, SEA - ground(unit3(point(x, y))));
  return { origin, up, right, ahead, heading, base, point, local, groundAt: groundAt2, wetAt, depthAt, surface };
};

// tools/build-kit.js
var RADIUS2 = 6348000;
var SEA2 = 12000;
var DEG3 = Math.PI / 180;
var unit4 = (v) => {
  const length2 = Math.hypot(...v);
  return v.map((x) => x / length2);
};
var cross4 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
var axesAt2 = (up) => {
  const north = unit4([-up[0] * up[1], 1 - up[1] * up[1], -up[2] * up[1]]);
  return { north, east: cross4(north, up) };
};
var frameOf = (anchor) => {
  const up = unit4(anchor.at);
  const { north, east } = axesAt2(up);
  const ahead = north.map((v, i) => v * Math.cos(anchor.heading * DEG3) + east[i] * Math.sin(anchor.heading * DEG3));
  const right = cross4(ahead, up);
  const base = groundElevation(up);
  const dirOf = (x, y) => unit4(up.map((v, i) => v * RADIUS2 + right[i] * x + ahead[i] * y));
  const ground = (x, y) => groundElevation(dirOf(x, y)) - base;
  const wet = (x, y) => groundElevation(dirOf(x, y)) < SEA2;
  const depth = (x, y) => Math.max(0, SEA2 - groundElevation(dirOf(x, y)));
  const point = (x, y, z) => up.map((v, i) => v * (RADIUS2 + Math.max(base, SEA2) + z) + right[i] * x + ahead[i] * y);
  const survey = ({ at: [cx, cy], size: [w, d], turn: turn2 = 0, step = 1 }) => {
    const c = Math.cos(turn2 * DEG3), s = Math.sin(turn2 * DEG3);
    const nx = Math.max(1, Math.ceil(w / step)), ny = Math.max(1, Math.ceil(d / step));
    const heights = [];
    let wetAny = false;
    for (let j = 0;j <= ny; j++) {
      for (let i = 0;i <= nx; i++) {
        const u = -w / 2 + w * i / nx, v = -d / 2 + d * j / ny;
        const x = cx + u * c - v * s, y = cy + u * s + v * c;
        heights.push(ground(x, y));
        wetAny ||= wet(x, y);
      }
    }
    let slope = 0;
    const at = (i, j) => heights[j * (nx + 1) + i];
    for (let j = 0;j <= ny; j++) {
      for (let i = 0;i <= nx; i++) {
        if (i < nx)
          slope = Math.max(slope, Math.abs(at(i + 1, j) - at(i, j)) / (w / nx));
        if (j < ny)
          slope = Math.max(slope, Math.abs(at(i, j + 1) - at(i, j)) / (d / ny));
      }
    }
    const round2 = (v) => +v.toFixed(3);
    return {
      min: round2(Math.min(...heights)),
      max: round2(Math.max(...heights)),
      mean: round2(heights.reduce((sum, h) => sum + h, 0) / heights.length),
      slope: +(Math.atan(slope) / DEG3).toFixed(1),
      wet: wetAny
    };
  };
  return { anchor, up, right, ahead, ground, wet, depth, point, survey };
};

// tools/build-check.js
var args = process.argv.slice(2);
var option = (flag) => args.includes(flag) ? args[args.indexOf(flag) + 1] : null;
var name = args[0];
if (!/^[a-z0-9-]+$/.test(name ?? "") && !name?.endsWith(".json")) {
  console.error("usage: check <name | build.json> [--survey site.json] [--catalog catalog.json]");
  process.exit(2);
}
var here = dirname(fileURLToPath(import.meta.url));
var root = join(here, "..");
var readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
var file = name.endsWith(".json") ? name : join(root, "assets/builds", `${name}.json`);
var spec = readJson(file);
var catalogFile = option("--catalog") ?? [join(here, "../catalog.json"), join(root, ".claude/skills/ovgrid/catalog.json")].find(existsSync);
if (!catalogFile)
  throw new Error("no catalog.json: give one with --catalog");
var catalog = readJson(catalogFile);
var manifest = join(root, "assets/textures/manifest.json");
var bank = new Map(existsSync(manifest) ? readJson(manifest).materials.map((material) => [material.id, material]) : catalog.materials.map(({ id, size, look = [] }) => [id, {
  id,
  size,
  alpha: look.includes("see-through") ? "blend" : look.includes("cut-out") ? "mask" : undefined,
  effects: { emissive: look.includes("glows") ? 1 : 0 }
}]));
var species = new Map(catalog.species.map((entry) => [entry.species, entry]));
var groundRadius = (dir) => RADIUS2 + Math.max(groundElevation(dir), SEA2);
var surveyFile = option("--survey");
var zone = null;
if (surveyFile) {
  const survey = readJson(surveyFile);
  const seen = frameAt2(survey.anchor.at, survey.anchor.heading);
  const anchored = spec.anchor?.exact ? spec.anchor.at : spec.anchor ? (([x, y, z]) => {
    const l = Math.hypot(x, y, z);
    return [x, y, z].map((v) => v / l * groundRadius([x / l, y / l, z / l]));
  })(spec.anchor.at) : null;
  if (!anchored)
    throw new Error("--survey: the build says nowhere (no anchor)");
  const within2 = ([x, y, z]) => Math.hypot(...seen.point(x, y, z).map((v, i) => v - anchored[i])) <= ZONE.radius;
  const near = (survey.builds ?? []).filter((build) => within2(build.centre));
  zone = {
    parts: near.reduce((sum, build) => sum + build.parts, 0),
    lights: near.reduce((sum, build) => sum + (build.lights ?? 0), 0),
    systems: near.reduce((sum, build) => sum + (build.emitters ?? 0), 0),
    trees: (survey.trees ?? []).filter((tree) => within2(tree.at)).length
  };
}
var checked = checkBuild(spec, { materials: bank, isSpecies: (name2) => species.has(name2), groundRadius, zone });
var { records, errors, notes, objects, totals } = checked;
var { inFrame } = checked.frame;
var frame = frameOf(spec.anchor);
var dot4 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
var along2 = (vector2) => [dot4(vector2, frame.right), dot4(vector2, frame.ahead), dot4(vector2, frame.up)];
var cornersOf2 = (parts, at, rotation) => parts.flatMap((part) => [-1, 1].flatMap((sx) => [-1, 1].flatMap((sy) => [-1, 1].map((sz) => {
  const local = quatRotate(part.rotation, [sx * part.size[0] / 2, sy * part.size[1] / 2, sz * part.size[2] / 2]).map((v, i) => v + part.at[i]);
  return inFrame(quatRotate(rotation, local).map((v, i) => v + at[i]));
}))));
var boxOf2 = (part, unit5) => {
  const corners = cornersOf2([part], unit5.at, unit5.rotation);
  const box = { min: [0, 1, 2].map((k) => Math.min(...corners.map((c) => c[k]))), max: [0, 1, 2].map((k) => Math.max(...corners.map((c) => c[k]))) };
  const up = along2(quatRotate(unit5.rotation, quatRotate(part.rotation, [0, 0, 1])));
  if (part.kind || part.shape.join() !== PRESETS.cube.shape.join() || up[2] < 0.9)
    return box;
  const top = inFrame(quatRotate(unit5.rotation, quatRotate(part.rotation, [0, 0, part.size[2] / 2]).map((v, i) => v + part.at[i])).map((v, i) => v + unit5.at[i]));
  return { ...box, plane: { top, up } };
};
var topOf = (box, x, y) => box.plane ? box.plane.top[2] - (box.plane.up[0] * (x - box.plane.top[0]) + box.plane.up[1] * (y - box.plane.top[1])) / box.plane.up[2] : box.max[2];
var units = records.filter((record) => record.type === "object" || record.type === "instance").map((unit5) => ({ unit: unit5, parts: records.filter((part) => part.object === (unit5.of ?? unit5.id)) }));
var boxes2 = units.flatMap(({ unit: unit5, parts }) => parts.map((part) => ({ unit: unit5.id, ...boxOf2(part, unit5) })));
var support = ([x, y, z], unit5) => Math.max(frame.ground(x, y), ...boxes2.filter((box) => box.unit !== unit5 && x >= box.min[0] && x <= box.max[0] && y >= box.min[1] && y <= box.max[1] && topOf(box, x, y) <= z + 0.05).map((box) => topOf(box, x, y)));
var settles = (part) => part.kind === "road" || part.kind === "fence" && Array.isArray(part.params?.points);
for (const { unit: unit5, parts } of units) {
  if (!parts.length || parts.every(settles))
    continue;
  const label = unit5.type === "object" ? unit5.name : `a clone of ${records.find((record) => record.id === unit5.of)?.name}`;
  const corners = cornersOf2(parts, unit5.at, unit5.rotation);
  const bottom = Math.min(...corners.map((c) => c[2]));
  const low = corners.filter((c) => c[2] < bottom + 0.05);
  const xs = corners.map((c) => c[0]), ys = corners.map((c) => c[1]);
  const centre = [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2, bottom];
  const gap = Math.max(...[...low, centre].map((point) => bottom - support(point, unit5.id)));
  if (gap > 0.05 && unit5.vehicle?.type !== "boat")
    notes.push(`${label}: a gap of ${gap.toFixed(2)} m under its lowest parts — lower it, or its footing`);
  if (unit5.vehicle?.type === "boat") {
    const under = Math.min(...[...low, centre].map(([x, y]) => frame.depth(x, y)));
    const needs = inFrame(unit5.at)[2] - bottom + 0.2;
    if (!frame.wet(centre[0], centre[1]))
      notes.push(`${label}: a boat floats only at sea — this one stands on land`);
    else if (under < needs)
      notes.push(`${label}: ${under.toFixed(2)} m of water under it — it needs ${needs.toFixed(1)} m, or it sits on the bottom and its engine cannot move it (the survey's depths say where)`);
  } else if (low.some(([x, y]) => frame.wet(x, y)))
    notes.push(`${label}: stands in the sea`);
}
var trees = records.filter((record) => record.type === "tree");
var variants = new Set;
var treeTriangles = trees.filter((tree) => species.has(tree.species)).reduce((sum, tree) => {
  const list = species.get(tree.species).variants;
  variants.add(`${tree.species}:${tree.seed % list.length}`);
  return sum + list[tree.seed % list.length][2];
}, 0);
for (const tree of trees) {
  const [x, y] = inFrame(tree.at);
  if (frame.wet(x, y))
    notes.push(`${tree.id}: in the sea`);
}
console.log(`${spec.name} (${file.split("/").at(-1)}): ${totals.objects} objects, ${totals.parts} parts, ${totals.clones} clones, ${totals.trees} trees, ${(spec.views ?? []).length} views`);
for (const object of objects) {
  console.log(`  ${object.name.padEnd(28)} ${String(object.parts).padStart(4)} parts ${object.copies > 1 ? `×${object.copies}` : "  "} ${String(object.triangles[0]).padStart(7)} / ${String(object.triangles[1]).padStart(6)} triangles${object.lights ? `, ${object.lights} light${object.lights > 1 ? "s" : ""}` : ""}${object.systems ? `, ${object.systems} particle system${object.systems > 1 ? "s" : ""}` : ""}`);
}
console.log(`triangles, clones counted: ${totals.triangles[0]} at the finest level, ${totals.triangles[1]} at the second; ${totals.meshes} distinct meshes`);
console.log(`trees: ${totals.trees}, ${treeTriangles} triangles near, ${variants.size} variants`);
console.log(`see-through faces: ${totals.seeThrough} (glass and water, the dear ones), cut-out: ${totals.cutOut}`);
console.log(`lights: ${totals.lights} (${totals.nightLights} at night only), at most ${totals.crowd} within 30 m of one another`);
console.log(`particles: ${totals.systems} systems (${totals.blended} blended — smoke, steam, fog, water), ${totals.particles} particles in the air, at most ${totals.swarm} systems within 30 m`);
var valueOf = (key) => key === "triangles" ? totals.triangles[0] : totals[key];
console.log(`budget (fair / most): ${Object.entries(BUDGET).map(([key, { fair, most }]) => `${key} ${valueOf(key).toLocaleString("en")}${valueOf(key) > most ? " ✗" : valueOf(key) > fair ? " !" : ""} (${fair.toLocaleString("en")} / ${most.toLocaleString("en")})`).join(", ")}`);
if (zone)
  console.log(`within ${ZONE.radius} m, already standing: ${zone.parts} parts, ${zone.lights} lights, ${zone.systems} emitters, ${zone.trees} trees`);
var said = notes.reduce((counts, note) => counts.set(note, (counts.get(note) ?? 0) + 1), new Map);
for (const [note, count] of said)
  console.log(`note: ${note}${count > 1 ? ` (×${count})` : ""}`);
for (const error of errors)
  console.log(`ERROR: ${error}`);
process.exit(errors.length ? 1 : 0);
