#!/usr/bin/env node
// Made by tools/build-skill-repo.js from OVGrid's tools/sculpt-from.js: run with Node 18+ or Bun.
// tools/sculpt-from.js
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname, basename, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// src/math.js
var add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
var scale = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
var cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0]
];
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
var quatRotate = (q, v) => {
  const axis = [q[0], q[1], q[2]];
  const t = scale(cross(axis, v), 2);
  return add(add(v, scale(t, q[3])), cross(axis, t));
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
var DETAIL = Object.freeze([1, 1.5, 2.5, 4]);
var SEAM = 0.000001;
var TINY = 0.000000000001;
var WELD = 1e6;
var paramsOf = (shape) => constrainParams(Array.isArray(shape) || ArrayBuffer.isView(shape) ? decodeShape(shape) : shape).params;
var splitOf = (params, detail) => {
  const kind = params.profileCurve & 15;
  const flat = kind !== PROFILE.CIRCLE && kind !== PROFILE.HALF_CIRCLE;
  return flat && !isCircular(params.pathCurve) && (params.scaleX !== 1 || params.scaleY !== 1) ? 0 : Math.floor(0.66 * detail);
};
var meshPrim = (shape, lod = 3) => {
  const detail = DETAIL[lod];
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
      const key = `${Math.round(positions2[i * 3] * WELD)},${Math.round(positions2[i * 3 + 1] * WELD)},${Math.round(positions2[i * 3 + 2] * WELD)}`;
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
var uvMetres = ({ positions, uvs, indices, slots }) => slots.map(({ first, count }) => {
  const sums = [0, 0, 0, 0, 0, 0];
  let area = 0;
  for (let i = first;i < first + count; i += 3) {
    const a = indices[i], b = indices[i + 1], c = indices[i + 2];
    const e1 = [0, 1, 2].map((k) => positions[b * 3 + k] - positions[a * 3 + k]);
    const e2 = [0, 1, 2].map((k) => positions[c * 3 + k] - positions[a * 3 + k]);
    const du1 = uvs[b * 2] - uvs[a * 2], dv1 = uvs[b * 2 + 1] - uvs[a * 2 + 1];
    const du2 = uvs[c * 2] - uvs[a * 2], dv2 = uvs[c * 2 + 1] - uvs[a * 2 + 1];
    const det = du1 * dv2 - du2 * dv1;
    const weight = Math.hypot(...cross(e1, e2)) / 2;
    if (Math.abs(det) < 0.000000000001 || !weight)
      continue;
    for (let k = 0;k < 3; k++) {
      sums[k] += weight * ((e1[k] * dv2 - e2[k] * dv1) / det) ** 2;
      sums[3 + k] += weight * ((e2[k] * du1 - e1[k] * du2) / det) ** 2;
    }
    area += weight;
  }
  return area ? sums.map((sum) => sum / area) : [1, 0, 0, 0, 1, 0];
});
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
  const length = Math.hypot(...sum);
  const fallback = length > TINY ? sum.map((c) => c / length) : [0, 0, 1];
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
var FINEST = SCULPT_SIDES[3];
var MIN_AREA = 0.002;
var MAX_AREA = 32;
var BASE64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var DIGIT = new Map([...BASE64].map((char, i) => [char, i]));
var toBase64 = (bytes) => {
  let out = "";
  for (let i = 0;i < bytes.length; i += 3) {
    const n = bytes[i] << 16 | (bytes[i + 1] ?? 0) << 8 | (bytes[i + 2] ?? 0);
    out += BASE64[n >> 18] + BASE64[n >> 12 & 63] + (i + 1 < bytes.length ? BASE64[n >> 6 & 63] : "=") + (i + 2 < bytes.length ? BASE64[n & 63] : "=");
  }
  return out;
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
  const point = (column, row, out, o) => {
    const at = (row * (columns + 1) + column) * 3;
    out[o] = flip * (samples[at] / 255 - 0.5);
    out[o + 1] = samples[at + 1] / 255 - 0.5;
    out[o + 2] = samples[at + 2] / 255 - 0.5;
  };
  for (let j = 0, o = 0;j <= t; j++) {
    for (let i = 0;i <= s; i++, o += 3) {
      const row = wrapRows && j === t ? 0 : Math.floor(j * rows / t);
      const column = poles && (j === 0 || j === t) ? Math.floor(columns / 2) : wrapColumns && i === s ? 0 : Math.floor(i * columns / s);
      point(column, row, positions, o);
    }
  }
  const index = (i, j) => j * (s + 1) + i;
  const turned = mirror !== invert;
  const indices = [];
  for (let j = 0;j < t; j++) {
    for (let i = 0;i < s; i++) {
      const p1 = index(i, j), p2 = index(i + 1, j), p3 = index(i, j + 1), p4 = index(i + 1, j + 1);
      if (turned)
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
    const o = v * 3, length = Math.hypot(normals[o], normals[o + 1], normals[o + 2]) || 1;
    normals[o] /= length;
    normals[o + 1] /= length;
    normals[o + 2] /= length;
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

// src/build/sculpt/curves.js
var TURN_WEIGHT = 0.8;
var SEGMENT = 24;
var LOOP = 512;
var distance = (a, b) => Math.hypot(...a.map((v, k) => v - b[k]));
var lerp2 = (a, b, t) => a.map((v, k) => v + (b[k] - v) * t);
var catmullRom = (p0, p1, p2, p3, t) => {
  const knot = (a, b) => Math.max(distance(a, b) ** 0.5, 0.000000001);
  const t1 = knot(p0, p1), t2 = t1 + knot(p1, p2), t3 = t2 + knot(p2, p3);
  const s = t1 + (t2 - t1) * t;
  const a1 = lerp2(p0, p1, s / t1), a2 = lerp2(p1, p2, (s - t1) / (t2 - t1)), a3 = lerp2(p2, p3, (s - t2) / (t3 - t2));
  const b1 = lerp2(a1, a2, s / t2), b2 = lerp2(a2, a3, (s - t1) / (t3 - t1));
  return lerp2(b1, b2, (s - t1) / (t2 - t1));
};
var monotoneSlopes = (points, closed, sharp) => {
  const n = points.length, dims = points[0].length;
  const spans = closed ? n : n - 1;
  const h = Array.from({ length: spans }, (_, i) => Math.max(distance(points[i], points[(i + 1) % n]), 0.000000001));
  const secant = (i, d) => (points[(i + 1) % n][d] - points[i][d]) / h[i];
  return points.map((_, i) => {
    const before = closed ? (i - 1 + n) % n : i - 1, after = i < spans ? i : -1;
    const left = [], right = [];
    for (let d = 0;d < dims; d++) {
      const a = before >= 0 ? secant(before, d) : null, b = after >= 0 ? secant(after, d) : null;
      if (a === null || b === null || sharp.has(i)) {
        left.push(a ?? b);
        right.push(b ?? a);
        continue;
      }
      const w1 = 2 * h[after] + h[before], w2 = h[after] + 2 * h[before];
      const slope = a * b <= 0 ? 0 : (w1 + w2) / (w1 / a + w2 / b);
      left.push(slope);
      right.push(slope);
    }
    return { left, right };
  });
};
var denseLine = (points, { closed = false, smooth = true, monotone = false, corners = [], per = SEGMENT } = {}) => {
  const n = points.length;
  const sharp = new Set(smooth ? corners.map((i) => (i % n + n) % n) : points.map((_, i) => i));
  if (!closed)
    sharp.add(0).add(n - 1);
  const at = (i) => points[(i % n + n) % n];
  const before = (i) => !closed && i === 0 || sharp.has((i % n + n) % n) ? lerp2(at(i + 1), at(i), 2) : at(i - 1);
  const after = (i) => !closed && i === n - 1 || sharp.has((i % n + n) % n) ? lerp2(at(i - 1), at(i), 2) : at(i + 1);
  const slopes = smooth && monotone ? monotoneSlopes(points, closed, sharp) : null;
  const curve = (i, t) => {
    if (!slopes)
      return catmullRom(before(i), at(i), at(i + 1), after(i + 1), t);
    const p0 = at(i), p1 = at(i + 1), span = Math.max(distance(p0, p1), 0.000000001);
    const m0 = slopes[i % n].right, m1 = slopes[(i + 1) % n].left;
    const t2 = t * t, t3 = t2 * t;
    return p0.map((v, d) => (2 * t3 - 3 * t2 + 1) * v + (t3 - 2 * t2 + t) * span * m0[d] + (3 * t2 - 2 * t3) * p1[d] + (t3 - t2) * span * m1[d]);
  };
  const out = [], knots = [], kept = [];
  const spans = closed ? n : n - 1;
  for (let i = 0;i < spans; i++) {
    knots.push(out.length);
    if (sharp.has(i % n))
      kept.push(out.length);
    const straight = !smooth || distance(at(i), at(i + 1)) < 0.000000000001;
    for (let k = 0;k < per; k++)
      out.push(straight ? lerp2(at(i), at(i + 1), k / per) : curve(i, k / per));
  }
  knots.push(out.length);
  if (closed ? sharp.has(0) : true)
    kept.push(out.length);
  out.push([...at(spans)]);
  return { points: out, knots, corners: [...new Set(kept)] };
};
var stepCosts = (line, corners = new Set, closed = false) => {
  const steps = line.length - 1;
  const lengths = new Float64Array(steps), turns = new Float64Array(steps);
  for (let i = 0;i < steps; i++)
    lengths[i] = distance(line[i], line[i + 1]);
  const angle = (a, b, c) => {
    const u = a.map((v, k) => b[k] - v), w = b.map((v, k) => c[k] - v);
    const lu = Math.hypot(...u), lw = Math.hypot(...w);
    if (lu < 0.000000000001 || lw < 0.000000000001)
      return 0;
    return Math.acos(Math.min(Math.max(u.reduce((sum, v, k) => sum + v * w[k], 0) / (lu * lw), -1), 1));
  };
  for (let i = 0;i <= steps; i++) {
    if (corners.has(i))
      continue;
    const previous = i > 0 ? line[i - 1] : closed ? line[steps - 1] : null;
    const next = i < steps ? line[i + 1] : closed ? line[1] : null;
    if (!previous || !next)
      continue;
    const turn = angle(previous, line[i], next);
    if (i > 0)
      turns[i - 1] += turn / 2;
    if (i < steps)
      turns[i] += turn / 2;
  }
  const totalLength = lengths.reduce((a, b) => a + b, 0) || 1;
  const totalTurn = turns.reduce((a, b) => a + b, 0);
  const weight = totalTurn > 0.000000001 ? TURN_WEIGHT : 0;
  const costs = new Float64Array(steps);
  for (let i = 0;i < steps; i++)
    costs[i] = (lengths[i] / totalLength + weight * turns[i] / (totalTurn || 1)) / (1 + weight);
  return costs;
};
var placesAlong = (costs, count, forced = []) => {
  const end = costs.length;
  let stops = [...new Set([0, ...forced.filter((i) => i > 0 && i < end), end])].sort((a, b) => a - b);
  const costOf = (from, to) => {
    let sum = 0;
    for (let i = from;i < to; i++)
      sum += costs[i];
    return sum;
  };
  while (stops.length - 1 > count) {
    let cheapest = 1;
    for (let s = 1;s < stops.length - 1; s++)
      if (costOf(stops[s - 1], stops[s + 1]) < costOf(stops[cheapest - 1], stops[cheapest + 1]))
        cheapest = s;
    stops.splice(cheapest, 1);
  }
  const spans = stops.slice(1).map((to, s) => ({ from: stops[s], to, cost: costOf(stops[s], to) }));
  const total = spans.reduce((sum, span) => sum + span.cost, 0) || 1;
  const shares = spans.map((span) => Math.max(1, Math.floor(count * span.cost / total)));
  let left = count - shares.reduce((a, b) => a + b, 0);
  const order = spans.map((span, s) => [s, count * span.cost / total - shares[s]]).sort((a, b) => b[1] - a[1]);
  for (let k = 0;left > 0; k = (k + 1) % order.length, left--)
    shares[order[k][0]]++;
  while (left < 0) {
    const s = shares.indexOf(Math.max(...shares));
    shares[s]--;
    left++;
  }
  const places = new Float64Array(count + 1);
  let o = 0;
  spans.forEach(({ from, to, cost }, s) => {
    const share = cost / shares[s];
    places[o++] = from;
    let step = from, done = 0;
    for (let k = 1;k < shares[s]; k++) {
      const target = k * share;
      while (step < to - 1 && done + costs[step] < target)
        done += costs[step++];
      places[o++] = step + (costs[step] > 0 ? Math.min(Math.max((target - done) / costs[step], 0), 1) : 0);
    }
  });
  places[o] = end;
  return places;
};
var pointAt = (line, place) => {
  const i = Math.min(Math.floor(place), line.length - 2);
  return lerp2(line[i], line[i + 1], place - i);
};
var loopArea = (loop) => {
  let sum = 0;
  for (let i = 0;i < loop.length; i++) {
    const [x1, y1] = loop[i], [x2, y2] = loop[(i + 1) % loop.length];
    sum += x1 * y2 - x2 * y1;
  }
  return sum;
};
var roundedPolygon = (corners, round) => {
  const out = [];
  const n = corners.length;
  corners.forEach((corner, i) => {
    const previous = corners[(i + n - 1) % n], next = corners[(i + 1) % n];
    const toPrevious = [previous[0] - corner[0], previous[1] - corner[1]], toNext = [next[0] - corner[0], next[1] - corner[1]];
    const lp = Math.hypot(...toPrevious), ln = Math.hypot(...toNext);
    const half = Math.acos(Math.min(Math.max((toPrevious[0] * toNext[0] + toPrevious[1] * toNext[1]) / (lp * ln), -1), 1)) / 2;
    const along = Math.min(round / Math.tan(half), lp / 2, ln / 2);
    const radius = along * Math.tan(half);
    const a = [corner[0] + toPrevious[0] / lp * along, corner[1] + toPrevious[1] / lp * along];
    const b = [corner[0] + toNext[0] / ln * along, corner[1] + toNext[1] / ln * along];
    if (radius < 0.000000001)
      return out.push([...corner]);
    const bisector = [toPrevious[0] / lp + toNext[0] / ln, toPrevious[1] / lp + toNext[1] / ln];
    const lb = Math.hypot(...bisector);
    const centre = [corner[0] + bisector[0] / lb * (radius / Math.sin(half)), corner[1] + bisector[1] / lb * (radius / Math.sin(half))];
    const from = Math.atan2(a[1] - centre[1], a[0] - centre[0]);
    let to = Math.atan2(b[1] - centre[1], b[0] - centre[0]);
    while (to < from)
      to += 2 * Math.PI;
    while (to - from > Math.PI)
      to -= 2 * Math.PI;
    const steps = 16;
    for (let k = 0;k <= steps; k++) {
      const angle = from + (to - from) * k / steps;
      out.push([centre[0] + radius * Math.cos(angle), centre[1] + radius * Math.sin(angle)]);
    }
  });
  return out;
};
var SECTIONS = Object.freeze({
  circle: "its radius, m",
  ellipse: "[x, y] its radii, m",
  rect: `[width, height] m, with "round": its corners' radius, m`,
  polygon: 'its sides (3–32), with "radius": to its corners, m, and "round"',
  points: '[[x, y], …] m, round it counter-clockwise or not, with "smooth" and "corners"'
});
var sectionLoop = (section) => {
  const spec = typeof section === "number" ? { circle: section } : section;
  let loop;
  if (spec.circle !== undefined || spec.ellipse !== undefined) {
    const [rx, ry] = spec.circle !== undefined ? [spec.circle, spec.circle] : spec.ellipse;
    loop = Array.from({ length: LOOP }, (_, i) => [rx * Math.cos(2 * Math.PI * i / LOOP), ry * Math.sin(2 * Math.PI * i / LOOP)]);
  } else if (spec.rect !== undefined) {
    const [w, h] = spec.rect;
    const round = Math.min(spec.round ?? 0, w / 2, h / 2);
    loop = roundedPolygon([[w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2], [-w / 2, -h / 2]], round);
  } else if (spec.polygon !== undefined) {
    const n = spec.polygon;
    loop = roundedPolygon(Array.from({ length: n }, (_, i) => [spec.radius * Math.cos(2 * Math.PI * i / n), spec.radius * Math.sin(2 * Math.PI * i / n)]), spec.round ?? 0);
  } else {
    loop = denseLine(spec.points, { closed: true, smooth: spec.smooth ?? true, corners: spec.corners ?? [] }).points.slice(0, -1);
  }
  if (loopArea(loop) < 0)
    loop.reverse();
  return startOnX(loop);
};
var startOnX = (loop) => {
  const xs = loop.map((p) => p[0]), ys = loop.map((p) => p[1]);
  const centre = [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2];
  let start = -1, crossing = null;
  for (let i = 0;i < loop.length; i++) {
    const [x1, y1] = loop[i], [x2, y2] = loop[(i + 1) % loop.length];
    if (!(y1 - centre[1] < 0 && y2 - centre[1] >= 0))
      continue;
    const t = (centre[1] - y1) / (y2 - y1), x = x1 + (x2 - x1) * t;
    if (x > centre[0] && (!crossing || x > crossing[0]))
      [start, crossing] = [i + 1, [x, centre[1]]];
  }
  if (!crossing) {
    let best = 0, bestAngle = Infinity;
    loop.forEach(([x, y], i) => {
      const angle = Math.abs(Math.atan2(y - centre[1], x - centre[0]));
      if (angle < bestAngle)
        [best, bestAngle] = [i, angle];
    });
    return [...loop.slice(best), ...loop.slice(0, best)];
  }
  const turned = [...loop.slice(start % loop.length), ...loop.slice(0, start % loop.length)];
  return distance(turned[0], crossing) < 0.000000000001 ? turned : [crossing, ...turned];
};
var evenLoop = (loop, count) => {
  const closed = [...loop, loop[0]];
  const costs = stepCosts(closed, new Set, true);
  const places = placesAlong(costs, count);
  return Array.from({ length: count }, (_, i) => pointAt(closed, places[i]));
};
var pathFrames = (path, closed = false) => {
  const n = path.length;
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross2 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const unit = (a) => {
    const l = Math.hypot(...a) || 1;
    return a.map((v) => v / l);
  };
  const tangents = path.map((_, i) => {
    const a = closed ? path[(i - 1 + n - 1) % (n - 1)] : path[Math.max(i - 1, 0)];
    const b = closed ? path[(i + 1) % (n - 1)] : path[Math.min(i + 1, n - 1)];
    return unit(sub(b, a));
  });
  const t0 = tangents[0];
  const reference = Math.abs(t0[2]) > 0.95 ? [0, 1, 0] : [0, 0, 1];
  const ups = [unit(sub(reference, t0.map((v) => v * dot(reference, t0))))];
  for (let i = 0;i < n - 1; i++) {
    const v1 = sub(path[i + 1], path[i]), c1 = dot(v1, v1);
    if (c1 < 0.000000000000000001) {
      ups.push(ups[i]);
      continue;
    }
    const rL = sub(ups[i], v1.map((v) => v * (2 / c1 * dot(v1, ups[i]))));
    const tL = sub(tangents[i], v1.map((v) => v * (2 / c1 * dot(v1, tangents[i]))));
    const v2 = sub(tangents[i + 1], tL), c2 = dot(v2, v2);
    ups.push(unit(c2 < 0.000000000000000001 ? rL : sub(rL, v2.map((v) => v * (2 / c2 * dot(v2, rL))))));
  }
  if (closed) {
    const end = ups[n - 1], start = ups[0], t = tangents[0];
    const missed = Math.atan2(dot(cross2(end, start), t), dot(end, start));
    let walked = 0;
    const lengths = path.slice(1).map((p, i) => Math.hypot(...sub(p, path[i])));
    const total = lengths.reduce((a, b) => a + b, 0) || 1;
    for (let i = 0;i < n; i++) {
      const angle = missed * walked / total;
      const ti = tangents[i], u = ups[i], c = Math.cos(angle), s = Math.sin(angle);
      const k = cross2(ti, u);
      ups[i] = unit(u.map((v, j) => v * c + k[j] * s + ti[j] * dot(ti, u) * (1 - c)));
      if (i < n - 1)
        walked += lengths[i];
    }
  }
  return path.map((_, i) => ({ t: tangents[i], up: ups[i], side: cross2(tangents[i], ups[i]) }));
};

// src/build/sculpt/bvh.js
var LEAF = 4;
var createBvh = (positions, indices) => {
  const count = indices.length / 3;
  const order = new Uint32Array(count);
  const centres = new Float64Array(count * 3);
  for (let t = 0;t < count; t++) {
    order[t] = t;
    for (let k = 0;k < 3; k++)
      centres[t * 3 + k] = (positions[indices[t * 3] * 3 + k] + positions[indices[t * 3 + 1] * 3 + k] + positions[indices[t * 3 + 2] * 3 + k]) / 3;
  }
  const capacity = count + 1;
  const boxes = new Float64Array(capacity * 6);
  const first = new Uint32Array(capacity), counts = new Uint32Array(capacity), right = new Uint32Array(capacity);
  let nodes = 0;
  const select = (from, to, nth, axis) => {
    let lo = from, hi = to - 1;
    while (hi > lo) {
      const pivot = centres[order[lo + hi >> 1] * 3 + axis];
      let i = lo, j = hi;
      while (i <= j) {
        while (centres[order[i] * 3 + axis] < pivot)
          i++;
        while (centres[order[j] * 3 + axis] > pivot)
          j--;
        if (i <= j) {
          const swap = order[i];
          order[i++] = order[j];
          order[j--] = swap;
        }
      }
      if (nth <= j)
        hi = j;
      else if (nth >= i)
        lo = i;
      else
        break;
    }
  };
  const build = (from, to) => {
    const node = nodes++;
    const box = node * 6;
    boxes.fill(Infinity, box, box + 3);
    boxes.fill(-Infinity, box + 3, box + 6);
    let cx0 = Infinity, cy0 = Infinity, cz0 = Infinity, cx1 = -Infinity, cy1 = -Infinity, cz1 = -Infinity;
    for (let i = from;i < to; i++) {
      const t = order[i];
      for (let corner = 0;corner < 3; corner++) {
        const v = indices[t * 3 + corner] * 3;
        for (let k = 0;k < 3; k++) {
          const value = positions[v + k];
          if (value < boxes[box + k])
            boxes[box + k] = value;
          if (value > boxes[box + 3 + k])
            boxes[box + 3 + k] = value;
        }
      }
      const x = centres[t * 3], y = centres[t * 3 + 1], z = centres[t * 3 + 2];
      if (x < cx0)
        cx0 = x;
      if (x > cx1)
        cx1 = x;
      if (y < cy0)
        cy0 = y;
      if (y > cy1)
        cy1 = y;
      if (z < cz0)
        cz0 = z;
      if (z > cz1)
        cz1 = z;
    }
    if (to - from <= LEAF) {
      first[node] = from;
      counts[node] = to - from;
      return node;
    }
    const ex = cx1 - cx0, ey = cy1 - cy0, ez = cz1 - cz0;
    const axis = ex >= ey && ex >= ez ? 0 : ey >= ez ? 1 : 2;
    const middle = from + to >> 1;
    select(from, to, middle, axis);
    build(from, middle);
    right[node] = build(middle, to);
    return node;
  };
  if (count)
    build(0, count);
  const stack = new Uint32Array(256);
  const near = new Float64Array(3);
  const throughBox = (node, ox, oy, oz, ix, iy, iz) => {
    const box = node * 6;
    let t1 = (boxes[box] - ox) * ix, t2 = (boxes[box + 3] - ox) * ix;
    let lo = Math.min(t1, t2), hi = Math.max(t1, t2);
    t1 = (boxes[box + 1] - oy) * iy;
    t2 = (boxes[box + 4] - oy) * iy;
    lo = Math.max(lo, Math.min(t1, t2));
    hi = Math.min(hi, Math.max(t1, t2));
    t1 = (boxes[box + 2] - oz) * iz;
    t2 = (boxes[box + 5] - oz) * iz;
    lo = Math.max(lo, Math.min(t1, t2));
    hi = Math.min(hi, Math.max(t1, t2));
    return hi >= Math.max(lo, 0);
  };
  const crossing = (t, ox, oy, oz, dx, dy, dz) => {
    const a = indices[t * 3] * 3, b = indices[t * 3 + 1] * 3, c = indices[t * 3 + 2] * 3;
    const e1x = positions[b] - positions[a], e1y = positions[b + 1] - positions[a + 1], e1z = positions[b + 2] - positions[a + 2];
    const e2x = positions[c] - positions[a], e2y = positions[c + 1] - positions[a + 1], e2z = positions[c + 2] - positions[a + 2];
    const px = dy * e2z - dz * e2y, py = dz * e2x - dx * e2z, pz = dx * e2y - dy * e2x;
    const det = e1x * px + e1y * py + e1z * pz;
    if (Math.abs(det) < 0.000000000000000001)
      return NaN;
    const inv = 1 / det;
    const sx = ox - positions[a], sy = oy - positions[a + 1], sz = oz - positions[a + 2];
    const u = (sx * px + sy * py + sz * pz) * inv;
    if (u < 0 || u > 1)
      return NaN;
    const qx = sy * e1z - sz * e1y, qy = sz * e1x - sx * e1z, qz = sx * e1y - sy * e1x;
    const v = (dx * qx + dy * qy + dz * qz) * inv;
    if (v < 0 || u + v > 1)
      return NaN;
    return (e2x * qx + e2y * qy + e2z * qz) * inv;
  };
  const boxDistance = (node, px, py, pz) => {
    const box = node * 6;
    const dx = px < boxes[box] ? boxes[box] - px : px > boxes[box + 3] ? px - boxes[box + 3] : 0;
    const dy = py < boxes[box + 1] ? boxes[box + 1] - py : py > boxes[box + 4] ? py - boxes[box + 4] : 0;
    const dz = pz < boxes[box + 2] ? boxes[box + 2] - pz : pz > boxes[box + 5] ? pz - boxes[box + 5] : 0;
    return dx * dx + dy * dy + dz * dz;
  };
  return {
    count,
    hits([ox, oy, oz], [dx, dy, dz]) {
      const found = [];
      if (!count)
        return found;
      const ix = 1 / dx, iy = 1 / dy, iz = 1 / dz;
      let top = 0;
      stack[top++] = 0;
      while (top) {
        const node = stack[--top];
        if (!throughBox(node, ox, oy, oz, ix, iy, iz))
          continue;
        if (counts[node]) {
          for (let i = first[node];i < first[node] + counts[node]; i++) {
            const t = crossing(order[i], ox, oy, oz, dx, dy, dz);
            if (t >= 0)
              found.push(t);
          }
        } else {
          stack[top++] = node + 1;
          stack[top++] = right[node];
        }
      }
      found.sort((a, b) => a - b);
      return found.filter((t, i) => i === 0 || t - found[i - 1] > 0.000000001 * (1 + t));
    },
    distance([px, py, pz], within = Infinity, out = null) {
      if (!count)
        return Infinity;
      let best = within * within, found = false;
      let top = 0;
      stack[top++] = 0;
      while (top) {
        const node = stack[--top];
        if (boxDistance(node, px, py, pz) >= best)
          continue;
        if (counts[node]) {
          for (let i = first[node];i < first[node] + counts[node]; i++) {
            closestOnTriangle(positions, indices, order[i], px, py, pz, near);
            const d = (near[0] - px) ** 2 + (near[1] - py) ** 2 + (near[2] - pz) ** 2;
            if (d < best) {
              best = d;
              found = true;
              if (out) {
                out[0] = near[0];
                out[1] = near[1];
                out[2] = near[2];
              }
            }
          }
        } else {
          const a = node + 1, b = right[node];
          if (boxDistance(a, px, py, pz) < boxDistance(b, px, py, pz)) {
            stack[top++] = b;
            stack[top++] = a;
          } else {
            stack[top++] = a;
            stack[top++] = b;
          }
        }
      }
      return found ? Math.sqrt(best) : Infinity;
    }
  };
};
var closestOnTriangle = (positions, indices, t, px, py, pz, out) => {
  const a = indices[t * 3] * 3, b = indices[t * 3 + 1] * 3, c = indices[t * 3 + 2] * 3;
  const ax = positions[a], ay = positions[a + 1], az = positions[a + 2];
  const abx = positions[b] - ax, aby = positions[b + 1] - ay, abz = positions[b + 2] - az;
  const acx = positions[c] - ax, acy = positions[c + 1] - ay, acz = positions[c + 2] - az;
  const apx = px - ax, apy = py - ay, apz = pz - az;
  const d1 = abx * apx + aby * apy + abz * apz, d2 = acx * apx + acy * apy + acz * apz;
  const set = (x, y, z) => {
    out[0] = x;
    out[1] = y;
    out[2] = z;
  };
  if (d1 <= 0 && d2 <= 0)
    return set(ax, ay, az);
  const bpx = px - positions[b], bpy = py - positions[b + 1], bpz = pz - positions[b + 2];
  const d3 = abx * bpx + aby * bpy + abz * bpz, d4 = acx * bpx + acy * bpy + acz * bpz;
  if (d3 >= 0 && d4 <= d3)
    return set(positions[b], positions[b + 1], positions[b + 2]);
  const vc = d1 * d4 - d3 * d2;
  if (vc <= 0 && d1 >= 0 && d3 <= 0) {
    const v2 = d1 / (d1 - d3);
    return set(ax + abx * v2, ay + aby * v2, az + abz * v2);
  }
  const cpx = px - positions[c], cpy = py - positions[c + 1], cpz = pz - positions[c + 2];
  const d5 = abx * cpx + aby * cpy + abz * cpz, d6 = acx * cpx + acy * cpy + acz * cpz;
  if (d6 >= 0 && d5 <= d6)
    return set(positions[c], positions[c + 1], positions[c + 2]);
  const vb = d5 * d2 - d1 * d6;
  if (vb <= 0 && d2 >= 0 && d6 <= 0) {
    const w2 = d2 / (d2 - d6);
    return set(ax + acx * w2, ay + acy * w2, az + acz * w2);
  }
  const va = d3 * d6 - d5 * d4;
  if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) {
    const w2 = (d4 - d3) / (d4 - d3 + (d5 - d6));
    return set(positions[b] + (positions[c] - positions[b]) * w2, positions[b + 1] + (positions[c + 1] - positions[b + 1]) * w2, positions[b + 2] + (positions[c + 2] - positions[b + 2]) * w2);
  }
  const denominator = 1 / (va + vb + vc);
  const v = vb * denominator, w = vc * denominator;
  return set(ax + abx * v + acx * w, ay + aby * v + acy * w, az + abz * v + acz * w);
};

// src/build/sculpt/grid.js
var DETAILS = Object.freeze([[16, 16], [16, 32], [32, 16], [32, 32]]);
var DEG = Math.PI / 180;
var gridOfRings = (rings, { wrapRows = false, cornerRows = [], cornerColumns = [] } = {}) => {
  const columns = rings[0].length, rows = rings.length - 1 + (wrapRows ? 1 : 0);
  const points = new Float64Array((rows + 1) * (columns + 1) * 3);
  for (let j = 0;j <= rows; j++) {
    const ring = rings[wrapRows && j === rows ? 0 : j];
    for (let i = 0;i <= columns; i++)
      points.set(ring[i % columns], (j * (columns + 1) + i) * 3);
  }
  const single = (ring) => ring.every((p) => Math.hypot(p[0] - ring[0][0], p[1] - ring[0][1], p[2] - ring[0][2]) < 0.000000001);
  return { columns, rows, points, wrapRows, poles: wrapRows ? [false, false] : [single(rings[0]), single(rings.at(-1))], cornerRows, cornerColumns };
};
var at = (grid, i, j) => {
  const o = (j * (grid.columns + 1) + i) * 3;
  return [grid.points[o], grid.points[o + 1], grid.points[o + 2]];
};
var boundsOf = ({ points }) => {
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (let o = 0;o < points.length; o += 3)
    for (let k = 0;k < 3; k++) {
      if (points[o + k] < min[k])
        min[k] = points[o + k];
      if (points[o + k] > max[k])
        max[k] = points[o + k];
    }
  return { min, max };
};
var normalsOf = (grid) => {
  const { columns, rows, wrapRows } = grid;
  const normals = new Float64Array(grid.points.length);
  const { min, max } = boundsOf(grid);
  const middle = min.map((v, k) => (v + max[k]) / 2);
  const pinched = [];
  let outward = 0;
  for (let j = 0;j <= rows; j++)
    for (let i = 0;i <= columns; i++) {
      const here = at(grid, i, j), o = (j * (columns + 1) + i) * 3;
      const left = at(grid, (i - 1 + columns) % columns, j), right = at(grid, (i + 1) % columns, j);
      const up = at(grid, i, wrapRows ? (j - 1 + rows) % rows : Math.max(j - 1, 0)), down = at(grid, i, wrapRows ? (j + 1) % rows : Math.min(j + 1, rows));
      const u = right.map((v2, k) => v2 - left[k]), v = down.map((w, k) => w - up[k]);
      if (Math.hypot(...u) < 0.000000000001) {
        pinched.push([i, j]);
        continue;
      }
      const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
      const length = Math.hypot(...n) || 1;
      for (let k = 0;k < 3; k++)
        normals[o + k] = n[k] / length;
      outward += n.reduce((sum, value, k) => sum + value * (here[k] - middle[k]), 0) / length;
    }
  if (outward < 0)
    for (let o = 0;o < normals.length; o++)
      normals[o] = -normals[o];
  for (const [i, j] of pinched) {
    const next = j === 0 ? 1 : j - 1;
    const centre = Array.from({ length: columns }, (_, c) => at(grid, c, next)).reduce((sum, p) => sum.map((s, k) => s + p[k] / columns), [0, 0, 0]);
    const away = at(grid, i, j).map((value, k) => value - centre[k]);
    const length = Math.hypot(...away) || 1;
    normals.set(away.map((value) => value / length), (j * (columns + 1) + i) * 3);
  }
  return normals;
};
var hash = (x, y, z, seed) => {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(z, 1274126177) + Math.imul(seed, 1442695041) | 0;
  h = Math.imul(h ^ h >>> 13, 1274126177);
  return ((h ^ h >>> 16) >>> 0) / 4294967296;
};
var noise = (x, y, z, seed) => {
  const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
  const fx = (x - ix) ** 2 * (3 - 2 * (x - ix)), fy = (y - iy) ** 2 * (3 - 2 * (y - iy)), fz = (z - iz) ** 2 * (3 - 2 * (z - iz));
  const corner = (dx, dy, dz) => hash(ix + dx, iy + dy, iz + dz, seed);
  const plane = (dz) => {
    const a = corner(0, 0, dz) + (corner(1, 0, dz) - corner(0, 0, dz)) * fx;
    const b = corner(0, 1, dz) + (corner(1, 1, dz) - corner(0, 1, dz)) * fx;
    return a + (b - a) * fy;
  };
  return (plane(0) + (plane(1) - plane(0)) * fz) * 2 - 1;
};
var fbm = (x, y, z, seed) => (noise(x, y, z, seed) + 0.5 * noise(x * 2.03, y * 2.03, z * 2.03, seed + 7919)) / 1.5;
var AXES = { x: 0, y: 1, z: 2 };
var runOf = (grid, along = "z") => {
  const axis = AXES[along];
  const { min, max } = boundsOf(grid);
  return { axis, across: [0, 1, 2].filter((k) => k !== axis), from: min[axis], length: Math.max(max[axis] - min[axis], 0.000000001) };
};
var turnMatrix = ([x = 0, y = 0, z = 0]) => {
  const [cx, sx, cy, sy, cz, sz] = [Math.cos(x * DEG), Math.sin(x * DEG), Math.cos(y * DEG), Math.sin(y * DEG), Math.cos(z * DEG), Math.sin(z * DEG)];
  return [
    [cz * cy, cz * sy * sx - sz * cx, cz * sy * cx + sz * sx],
    [sz * cy, sz * sy * sx + cz * cx, sz * sy * cx - cz * sx],
    [-sy, cy * sx, cy * cx]
  ];
};
var DEFORMATIONS = Object.freeze({
  taper: `its top's scale across its axis, a number or [a, b], 1 at its foot; "along" its axis (x, y or z: z)`,
  twist: 'degrees it turns about its axis, foot to top; "along"',
  bend: 'degrees its axis curves through, foot to top, towards "toward" (x, -x, y, -y, z or -z: x); "along"',
  noise: 'm it is pushed in or out along its surface by smooth noise; "size" m across a lump (its largest side / 5), "seed"',
  scale: "[x, y, z] or a number",
  turn: "[x, y, z] degrees about x, then y, then z",
  move: "[x, y, z] m"
});
var deform = (grid, deformations = []) => deformations.reduce((current, step) => {
  const points = Float64Array.from(current.points);
  const next = { ...current, points };
  const each = (map) => {
    for (let o = 0;o < points.length; o += 3)
      points.set(map([points[o], points[o + 1], points[o + 2]], o), o);
  };
  if (step.taper !== undefined) {
    const { axis, across, from, length } = runOf(current, step.along);
    const [a, b] = Array.isArray(step.taper) ? step.taper : [step.taper, step.taper];
    each((p) => {
      const t = (p[axis] - from) / length, q = [...p];
      q[across[0]] *= 1 + (a - 1) * t;
      q[across[1]] *= 1 + (b - 1) * t;
      return q;
    });
  } else if (step.twist !== undefined) {
    const { axis, across, from, length } = runOf(current, step.along);
    each((p) => {
      const angle = (p[axis] - from) / length * step.twist * DEG, q = [...p];
      q[across[0]] = p[across[0]] * Math.cos(angle) - p[across[1]] * Math.sin(angle);
      q[across[1]] = p[across[0]] * Math.sin(angle) + p[across[1]] * Math.cos(angle);
      return q;
    });
  } else if (step.bend !== undefined) {
    const { axis, from, length } = runOf(current, step.along);
    const toward = step.toward ?? (axis === 0 ? "z" : "x");
    const way = AXES[toward.replace("-", "")], sign = toward.startsWith("-") ? -1 : 1;
    if (way === axis)
      throw new Error(`bend: "toward" ${toward} is its own axis`);
    const angle = step.bend * DEG;
    if (Math.abs(angle) > 0.000000001) {
      const radius = length / angle;
      each((p) => {
        const theta = (p[axis] - from) / length * angle, d = sign * p[way], q = [...p];
        q[way] = sign * (radius - (radius - d) * Math.cos(theta));
        q[axis] = from + (radius - d) * Math.sin(theta);
        return q;
      });
    }
  } else if (step.noise !== undefined) {
    const { min, max } = boundsOf(current);
    const size = step.size ?? Math.max(Math.max(...max.map((v, k) => v - min[k])) / 5, 0.001);
    const normals = normalsOf(current);
    const seed = Number.isInteger(step.seed) ? step.seed : 1;
    each((p, o) => {
      const push = step.noise * fbm(p[0] / size, p[1] / size, p[2] / size, seed);
      return p.map((v, k) => v + normals[o + k] * push);
    });
  } else if (step.scale !== undefined) {
    const factors = Array.isArray(step.scale) ? step.scale : [step.scale, step.scale, step.scale];
    each((p) => p.map((v, k) => v * factors[k]));
  } else if (step.turn !== undefined) {
    const m = turnMatrix(step.turn);
    each((p) => m.map((row) => row[0] * p[0] + row[1] * p[1] + row[2] * p[2]));
  } else if (step.move !== undefined) {
    each((p) => p.map((v, k) => v + step.move[k]));
  }
  return next;
}, grid);
var columnCosts = (grid) => {
  const { columns, rows } = grid;
  const costs = new Float64Array(columns);
  let total = 0;
  const corners = new Set(grid.cornerColumns);
  for (let j = 0;j <= rows - (grid.wrapRows ? 1 : 0); j++) {
    const ring = Array.from({ length: columns + 1 }, (_, i) => at(grid, i, j));
    let length = 0;
    for (let i = 0;i < columns; i++)
      length += Math.hypot(...ring[i + 1].map((v, k) => v - ring[i][k]));
    if (length < 0.000000000001)
      continue;
    const own = stepCosts(ring, corners, true);
    for (let i = 0;i < columns; i++)
      costs[i] += own[i] * length;
    total += length;
  }
  return total ? costs.map((cost) => cost / total) : costs.fill(1 / columns);
};
var rowCosts = (grid) => {
  const { columns, rows } = grid;
  const costs = new Float64Array(rows);
  let total = 0;
  const corners = new Set(grid.cornerRows);
  for (let i = 0;i < columns; i++) {
    const meridian = Array.from({ length: rows + 1 }, (_, j) => at(grid, i, j));
    let length = 0;
    for (let j = 0;j < rows; j++)
      length += Math.hypot(...meridian[j + 1].map((v, k) => v - meridian[j][k]));
    if (length < 0.000000000001)
      continue;
    const own = stepCosts(meridian, corners, grid.wrapRows);
    for (let j = 0;j < rows; j++)
      costs[j] += own[j] * length;
    total += length;
  }
  return total ? costs.map((cost) => cost / total) : costs.fill(1 / rows);
};
var resample = (grid, columns, rows) => {
  const across = placesAlong(columnCosts(grid), columns, grid.cornerColumns);
  const down = placesAlong(rowCosts(grid), rows, grid.cornerRows);
  const points = new Float64Array((rows + 1) * (columns + 1) * 3);
  for (let j = 0;j <= rows; j++) {
    const r = Math.min(Math.floor(down[j]), grid.rows - 1), fr = down[j] - r;
    for (let i = 0;i <= columns; i++) {
      const place = i === columns ? across[0] : across[i];
      const c = Math.min(Math.floor(place), grid.columns - 1), fc = place - c;
      const a = at(grid, c, r), b = at(grid, c + 1, r), d = at(grid, c, r + 1), e = at(grid, c + 1, r + 1);
      for (let k = 0;k < 3; k++)
        points[(j * (columns + 1) + i) * 3 + k] = (a[k] * (1 - fc) + b[k] * fc) * (1 - fr) + (d[k] * (1 - fc) + e[k] * fc) * fr;
    }
  }
  if (grid.wrapRows)
    points.copyWithin(rows * (columns + 1) * 3, 0, (columns + 1) * 3);
  return { columns, rows, points, wrapRows: grid.wrapRows, poles: grid.poles, cornerRows: [], cornerColumns: [] };
};
var MIN_SIZE = 0.01;
var MAX_SIZE = 64;
var stitchOf = ({ wrapRows, poles }) => wrapRows ? "torus" : poles[0] && poles[1] ? "sphere" : "cylinder";
var volumeOf = ({ positions: p, indices }) => {
  let volume = 0;
  for (let i = 0;i < indices.length; i += 3) {
    const a = indices[i] * 3, b = indices[i + 1] * 3, c = indices[i + 2] * 3;
    volume += (p[a] * (p[b + 1] * p[c + 2] - p[b + 2] * p[c + 1]) - p[a + 1] * (p[b] * p[c + 2] - p[b + 2] * p[c]) + p[a + 2] * (p[b] * p[c + 1] - p[b + 1] * p[c])) / 6;
  }
  return volume;
};
var flipped = (grid) => {
  const { columns, rows } = grid;
  const points = new Float64Array(grid.points.length);
  const width = (columns + 1) * 3;
  for (let j = 0;j <= rows; j++)
    points.set(grid.points.subarray((rows - j) * width, (rows - j + 1) * width), j * width);
  return { ...grid, points, poles: [grid.poles[1], grid.poles[0]] };
};
var sculptOfGrid = (grid) => {
  const { columns, rows } = grid;
  if ((columns + 1) * (rows + 1) > MAX_POINTS)
    throw new RangeError(`a grid of ${columns} × ${rows} sides: more than ${MAX_POINTS} points`);
  const notes = [];
  const { min, max } = boundsOf(grid);
  const size = min.map((v, k) => Math.min(Math.max(max[k] - v, MIN_SIZE), MAX_SIZE));
  if (max.some((v, k) => v - min[k] > MAX_SIZE))
    notes.push(`larger than ${MAX_SIZE} m across: held to ${MAX_SIZE} m — make it of several parts`);
  const centre = min.map((v, k) => (v + max[k]) / 2);
  const stitch = stitchOf(grid);
  const keep = (g) => {
    const samples = new Uint8Array(g.points.length);
    for (let o = 0;o < g.points.length; o++)
      samples[o] = Math.min(Math.max(Math.round(((g.points[o] - centre[o % 3]) / size[o % 3] + 0.5) * 255), 0), 255);
    const mesh = meshSculpt({ samples, columns, rows, stitch }, 3);
    return { samples, mesh };
  };
  let kept = keep(grid);
  if (volumeOf(kept.mesh) < 0)
    kept = keep(flipped(grid));
  const positions = Float64Array.from(kept.mesh.positions, (v, o) => v * size[o % 3] + centre[o % 3]);
  return {
    params: { stitch, mirror: "no", invert: "no", columns, rows, map: toBase64(kept.samples) },
    size,
    centre,
    mesh: { ...kept.mesh, positions },
    notes
  };
};
var deviationOf = (dense, mesh) => {
  const bvh = createBvh(mesh.positions, mesh.indices);
  const distances = [];
  const step = Math.max(1, Math.round(Math.sqrt((dense.rows + 1) * (dense.columns + 1) / 6000)));
  for (let j = 0;j <= dense.rows; j += step)
    for (let i = 0;i < dense.columns; i += step)
      distances.push(bvh.distance(at(dense, i, j)));
  distances.sort((a, b) => a - b);
  return { mean: distances.reduce((a, b) => a + b, 0) / distances.length, p98: distances[Math.floor(distances.length * 0.98)], max: distances.at(-1) };
};
var sculptOfDense = (dense, { sides = null, tolerance = null } = {}) => {
  const { min, max } = boundsOf(dense);
  const largest = Math.max(...max.map((v, k) => v - min[k]));
  const within = tolerance ?? Math.max(0.0015, 0.005 * largest);
  const tried = [];
  for (const [columns, rows] of sides ? [sides] : DETAILS) {
    const made = sculptOfGrid(resample(dense, columns, rows));
    const deviation = deviationOf(dense, made.mesh);
    tried.push({ ...made, deviation, sides: [columns, rows] });
    if (sides || deviation.p98 <= within)
      break;
  }
  const best = tried.at(-1).deviation.p98 <= within ? tried.at(-1) : tried.reduce((a, b) => b.deviation.p98 <= a.deviation.p98 * 1.05 ? b : a);
  if (best.deviation.p98 > 2 * within && !sides)
    best.notes.push(`follows its shape within ${mm(best.deviation.p98)} (98 % of it), not ${mm(within)}: finer than a sculpted prim's ${best.sides.join(" × ")} sides`);
  return best;
};
var mm = (metres) => `${(metres * 1000).toFixed(metres < 0.01 ? 1 : 0)} mm`;

// src/build/sculpt/describe.js
var LIMIT = { points: 64, sections: 32, deform: 8, extent: 64 };
var SAMPLES = 256;
var ROUND = 6;

class DescriptionError extends Error {
}
var fail = (where, message) => {
  throw new DescriptionError(`${where}: ${message}`);
};
var isNumber = (value) => typeof value === "number" && Number.isFinite(value);
var isPoint = (value, length) => Array.isArray(value) && value.length === length && value.every(isNumber);
var within = (value) => Math.abs(value) <= LIMIT.extent;
var only = (where, object, keys) => {
  const unknown = Object.keys(object).filter((key) => !keys.includes(key));
  if (unknown.length)
    fail(where, `no ${unknown.map((key) => `"${key}"`).join(", ")} here (it takes ${keys.map((key) => `"${key}"`).join(", ")})`);
};
var SCULPT_SHAPES = Object.freeze({
  lathe: '[[r, z], …] its profile, 2–64 points, m: r from its axis, z up it; "corners": indices kept sharp, "smooth": false for straight lines between them',
  loft: '[{ "at": z or [x, y, z], <section>, "corner": true }, …] 2–32 sections, along "along" (x, y or z: z); "caps": "flat", "round" or "open"; "smooth"',
  box: `[x, y, z] m; "round": its edges' radius, m; "corner": its upright corners' radius, m (its round); "bulge": m its top and bottom swell, or [top, bottom]`,
  sweep: '[[x, y, z], …] its path, 2–64 points, m; "section": what is swept (its x across the path, its y up); "scale": a number, or one a point; "twist": degrees; "closed"; "caps": "round", "flat" or "open"; "corners", "smooth"',
  mesh: `a glTF or GLB file, its path from the build's file; "height" or "size" [x, y, z] m; "as": "sphere" or "tube"`
});
var SHAPE_KEYS = Object.keys(SCULPT_SHAPES);
var COMMON = ["deform", "sides"];
var OPTIONS = {
  lathe: ["corners", "smooth"],
  loft: ["along", "caps", "smooth"],
  box: ["round", "corner", "bulge"],
  sweep: ["section", "scale", "twist", "closed", "caps", "corners", "smooth"],
  mesh: ["height", "size", "as", "axis"]
};
var checkSection = (where, section, extra = []) => {
  if (isNumber(section))
    return section > 0 || fail(where, "a circle's radius above 0");
  if (!section || typeof section !== "object" || Array.isArray(section))
    fail(where, `a section: a number (a circle's radius) or one of ${Object.keys(SECTIONS).join(", ")}`);
  const kinds = Object.keys(SECTIONS).filter((key) => section[key] !== undefined);
  if (kinds.length !== 1)
    fail(where, `one of ${Object.keys(SECTIONS).join(", ")} (${kinds.length ? kinds.join(" and ") : "none"} given)`);
  const [kind] = kinds;
  const keys = { circle: ["circle"], ellipse: ["ellipse"], rect: ["rect", "round"], polygon: ["polygon", "radius", "round"], points: ["points", "smooth", "corners"] }[kind];
  only(where, section, [...keys, ...extra]);
  const positive = (value) => isNumber(value) && value >= 0 && within(value);
  if (kind === "circle" && !positive(section.circle))
    fail(where, '"circle": its radius, m');
  if (kind === "ellipse" && !(isPoint(section.ellipse, 2) && section.ellipse.every(positive)))
    fail(where, '"ellipse": [x, y] radii, m');
  if (kind === "rect" && !(isPoint(section.rect, 2) && section.rect.every(positive)))
    fail(where, '"rect": [width, height] m');
  if (kind === "polygon" && !(Number.isInteger(section.polygon) && section.polygon >= 3 && section.polygon <= 32 && positive(section.radius)))
    fail(where, '"polygon": 3–32 sides, with "radius" to its corners, m');
  if (section.round !== undefined && !positive(section.round))
    fail(where, `"round": its corners' radius, m`);
  if (kind === "points") {
    if (!(Array.isArray(section.points) && section.points.length >= 3 && section.points.length <= LIMIT.points && section.points.every((p) => isPoint(p, 2) && p.every(within))))
      fail(where, `"points": 3–${LIMIT.points} [x, y] m`);
    checkCorners(where, section.corners, section.points.length);
  }
  return true;
};
var checkCorners = (where, corners, count) => {
  if (corners !== undefined && !(Array.isArray(corners) && corners.every((i) => Number.isInteger(i) && i >= 0 && i < count)))
    fail(where, `"corners": indices of its points, 0–${count - 1}`);
};
var checkDescription = (sculpt, where = "sculpt") => {
  if (!sculpt || typeof sculpt !== "object" || Array.isArray(sculpt))
    fail(where, `a description: one of ${SHAPE_KEYS.join(", ")}`);
  const shapes = SHAPE_KEYS.filter((key) => sculpt[key] !== undefined);
  if (shapes.length !== 1)
    fail(where, `one shape of ${SHAPE_KEYS.join(", ")} (${shapes.length ? shapes.join(" and ") : "none"} given)`);
  const [shape] = shapes;
  only(where, sculpt, [shape, ...OPTIONS[shape], ...COMMON]);
  const value = sculpt[shape];
  const points = (length, least) => Array.isArray(value) && value.length >= least && value.length <= LIMIT.points && value.every((p) => isPoint(p, length) && p.every(within));
  if (shape === "lathe") {
    if (!points(2, 2))
      fail(where, `"lathe": 2–${LIMIT.points} points [r, z], m`);
    if (value.some(([r]) => r < 0))
      fail(where, '"lathe": r is its distance from the axis: 0 or more');
    checkCorners(where, sculpt.corners, value.length);
  } else if (shape === "loft") {
    if (!(Array.isArray(value) && value.length >= 2 && value.length <= LIMIT.sections))
      fail(where, `"loft": 2–${LIMIT.sections} sections`);
    value.forEach((section, i) => {
      const at2 = section?.at;
      if (!(isNumber(at2) && within(at2)) && !(isPoint(at2, 3) && at2.every(within)))
        fail(`${where} section ${i}`, '"at": where it stands along the axis (m), or its centre [x, y, z]');
      if (section.corner !== undefined && typeof section.corner !== "boolean")
        fail(`${where} section ${i}`, '"corner": true or false');
      checkSection(`${where} section ${i}`, Object.fromEntries(Object.entries(section).filter(([key]) => key !== "at" && key !== "corner")));
    });
    if (sculpt.along !== undefined && !["x", "y", "z"].includes(sculpt.along))
      fail(where, '"along": x, y or z');
    if (sculpt.caps !== undefined && !["flat", "round", "open"].includes(sculpt.caps))
      fail(where, '"caps": flat, round or open');
  } else if (shape === "box") {
    if (!(isPoint(value, 3) && value.every((v) => v > 0 && within(v))))
      fail(where, '"box": [x, y, z] m');
    for (const key of ["round", "corner"])
      if (sculpt[key] !== undefined && !(isNumber(sculpt[key]) && sculpt[key] >= 0))
        fail(where, `"${key}": m, 0 or more`);
    const bulge = sculpt.bulge;
    if (bulge !== undefined && !(isNumber(bulge) && bulge >= 0) && !(isPoint(bulge, 2) && bulge.every((v) => v >= 0)))
      fail(where, '"bulge": m, or [top, bottom]');
  } else if (shape === "sweep") {
    if (!points(3, 2))
      fail(where, `"sweep": its path, 2–${LIMIT.points} points [x, y, z], m`);
    if (sculpt.section === undefined)
      fail(where, `"section": what is swept along the path (a number: a circle's radius)`);
    checkSection(`${where} section`, sculpt.section);
    const scale3 = sculpt.scale;
    if (scale3 !== undefined && !(isNumber(scale3) && scale3 >= 0) && !(Array.isArray(scale3) && scale3.length === value.length && scale3.every((s) => isNumber(s) && s >= 0 || isPoint(s, 2) && s.every((v) => v >= 0))))
      fail(where, `"scale": a number, or one for each of its ${value.length} points (a number or [x, y])`);
    if (sculpt.twist !== undefined && !isNumber(sculpt.twist))
      fail(where, '"twist": degrees');
    if (sculpt.closed !== undefined && typeof sculpt.closed !== "boolean")
      fail(where, '"closed": true or false');
    if (sculpt.caps !== undefined && !["flat", "round", "open"].includes(sculpt.caps))
      fail(where, '"caps": round, flat or open');
    checkCorners(where, sculpt.corners, value.length);
  } else if (shape === "mesh") {
    if (typeof value !== "string" || !/\.(glb|gltf)$/i.test(value))
      fail(where, '"mesh": a .glb or .gltf file');
    if (sculpt.height !== undefined && !(isNumber(sculpt.height) && sculpt.height > 0 && within(sculpt.height)))
      fail(where, '"height": m');
    if (sculpt.size !== undefined && !(isPoint(sculpt.size, 3) && sculpt.size.every((v) => v > 0 && within(v))))
      fail(where, '"size": [x, y, z] m');
    if (sculpt.as !== undefined && !["sphere", "tube"].includes(sculpt.as))
      fail(where, '"as": sphere or tube');
    if (sculpt.axis !== undefined && !["x", "y", "z"].includes(sculpt.axis))
      fail(where, '"axis": x, y or z');
    if (sculpt.deform !== undefined || sculpt.sides !== undefined)
      fail(where, 'a mesh is taken as it is, at 32 × 32 sides: no "deform" or "sides"');
  }
  if (sculpt.smooth !== undefined && typeof sculpt.smooth !== "boolean")
    fail(where, '"smooth": true or false');
  const steps = sculpt.deform;
  if (steps !== undefined) {
    if (!(Array.isArray(steps) && steps.length <= LIMIT.deform))
      fail(where, `"deform": up to ${LIMIT.deform} steps`);
    steps.forEach((step, i) => {
      const kinds = Object.keys(DEFORMATIONS).filter((key) => step?.[key] !== undefined);
      if (kinds.length !== 1)
        fail(`${where} deform ${i}`, `one of ${Object.keys(DEFORMATIONS).join(", ")}`);
      const [kind] = kinds;
      only(`${where} deform ${i}`, step, [kind, ...{ taper: ["along"], twist: ["along"], bend: ["along", "toward"], noise: ["size", "seed"] }[kind] ?? []]);
      const amount = step[kind];
      const fine = {
        taper: isNumber(amount) || isPoint(amount, 2),
        twist: isNumber(amount),
        bend: isNumber(amount) && Math.abs(amount) <= 360,
        noise: isNumber(amount) && Math.abs(amount) <= 1,
        scale: isNumber(amount) && amount > 0 || isPoint(amount, 3) && amount.every((v) => v > 0),
        turn: isPoint(amount, 3),
        move: isPoint(amount, 3) && amount.every(within)
      }[kind];
      if (!fine)
        fail(`${where} deform ${i}`, `"${kind}": ${DEFORMATIONS[kind]}`);
      if (step.along !== undefined && !["x", "y", "z"].includes(step.along))
        fail(`${where} deform ${i}`, '"along": x, y or z');
      if (step.toward !== undefined && !["x", "-x", "y", "-y", "z", "-z"].includes(step.toward))
        fail(`${where} deform ${i}`, '"toward": x, -x, y, -y, z or -z');
      if (step.size !== undefined && !(isNumber(step.size) && step.size > 0))
        fail(`${where} deform ${i}`, '"size": m');
      if (step.seed !== undefined && !Number.isInteger(step.seed))
        fail(`${where} deform ${i}`, '"seed": a whole number');
    });
  }
  const sides = sculpt.sides;
  if (sides !== undefined && !(isPoint(sides, 2) && sides.every((n) => Number.isInteger(n) && n >= 4 && n <= 128) && (sides[0] + 1) * (sides[1] + 1) <= MAX_POINTS)) {
    fail(where, `"sides": [columns, rows], 4–128 each, (columns + 1) × (rows + 1) no more than ${MAX_POINTS}`);
  }
  return shape;
};
var near = (a, b) => Math.hypot(...a.map((v, k) => v - b[k])) < 0.000001;
var lathe = (sculpt, notes) => {
  const profile = sculpt.lathe;
  const onAxis = profile[0][0] === 0 && profile.at(-1)[0] === 0;
  const loop = !onAxis && profile.length >= 4 && near(profile[0], profile.at(-1));
  if (!onAxis && !loop)
    notes.push("open: its profile does not end on its axis at both ends, nor come back to its start — seen from outside only");
  const points = loop ? profile.slice(0, -1) : profile;
  const line = denseLine(points, { closed: loop, smooth: sculpt.smooth ?? true, monotone: true, corners: sculpt.corners ?? [] });
  const rows = loop ? line.points.slice(0, -1) : line.points;
  const rings = rows.map(([r, z], j) => {
    const radius = !loop && (j === 0 || j === rows.length - 1) ? points[j === 0 ? 0 : points.length - 1][0] : Math.max(r, 0);
    return Array.from({ length: SAMPLES }, (_, i) => [radius * Math.cos(2 * Math.PI * i / SAMPLES), radius * Math.sin(2 * Math.PI * i / SAMPLES), z]);
  });
  return gridOfRings(rings, { wrapRows: loop, cornerRows: line.corners.filter((i) => i > 0 && i < rings.length - (loop ? 0 : 1)) });
};
var ALONG = {
  z: (at2, [x, y]) => [x, y, at2],
  y: (at2, [x, y]) => [x, at2, y],
  x: (at2, [x, y]) => [at2, x, y]
};
var ringsAlong = (sections, { smooth = true, corners = [], caps = "flat", notes }) => {
  const columns = Array.from({ length: SAMPLES }, (_, i) => denseLine(sections.map((ring) => ring[i]), { smooth, monotone: true, corners }));
  const { corners: dense } = columns[0];
  let rings = Array.from({ length: columns[0].points.length }, (_, j) => columns.map((column) => column.points[j]));
  const cornerRows = dense.filter((j) => j > 0 && j < rings.length - 1);
  const isPoint2 = (ring) => ring.every((p) => near(p, ring[0]));
  const centreOf = (ring) => ring.reduce((sum, p) => sum.map((s, k) => s + p[k] / ring.length), [0, 0, 0]);
  const close = (end2, next) => {
    if (isPoint2(end2) || caps === "open")
      return { rows: [], crease: false };
    const centre = centreOf(end2);
    if (caps === "flat")
      return { rows: Array.from({ length: ROUND - 1 }, (_, k) => end2.map((p) => p.map((v, d) => centre[d] + (v - centre[d]) * (k / (ROUND - 1))))), crease: true };
    const away = centre.map((v, d) => v - centreOf(next)[d]);
    const length = Math.hypot(...away) || 1;
    const radius = end2.reduce((sum, p) => sum + Math.hypot(...p.map((v, d) => v - centre[d])), 0) / end2.length;
    return {
      rows: Array.from({ length: ROUND - 1 }, (_, k) => {
        const phi = Math.PI / 2 * (1 - k / (ROUND - 1));
        return end2.map((p) => p.map((v, d) => centre[d] + (v - centre[d]) * Math.cos(phi) + away[d] / length * radius * 0.5 * Math.sin(phi)));
      }),
      crease: false
    };
  };
  const { knots } = columns[0];
  const start = close(rings[0], rings[knots[1]]);
  const end = close(rings.at(-1), rings[knots.at(-2)]);
  if (caps === "open" && !(isPoint2(rings[0]) && isPoint2(rings.at(-1))))
    notes.push("open at its ends: seen from outside only");
  const before = start.rows.length;
  rings = [...start.rows, ...rings, ...[...end.rows].reverse()];
  const creases = [...cornerRows.map((j) => j + before), ...start.crease ? [before] : [], ...end.crease ? [before + columns[0].points.length - 1] : []];
  return gridOfRings(rings, { cornerRows: creases });
};
var loft = (sculpt, notes) => {
  const along = ALONG[sculpt.along ?? "z"];
  const axis = { x: 0, y: 1, z: 2 }[sculpt.along ?? "z"];
  const sections = sculpt.loft.map(({ at: at2, corner, ...section }) => {
    const loop = evenLoop(sectionLoop(section), SAMPLES);
    const position = isNumber(at2) ? at2 : at2[axis];
    const offset = isNumber(at2) ? [0, 0] : [0, 1, 2].filter((k) => k !== axis).map((k) => at2[k]);
    return loop.map(([x, y]) => along(position, [x + offset[0], y + offset[1]]));
  });
  const corners = sculpt.loft.flatMap((section, i) => section.corner ? [i] : []);
  return ringsAlong(sections, { smooth: sculpt.smooth ?? true, corners, caps: sculpt.caps ?? "flat", notes });
};
var box = (sculpt, notes) => {
  const [x, y, z] = sculpt.box;
  const [top, bottom] = Array.isArray(sculpt.bulge) ? sculpt.bulge : [sculpt.bulge ?? 0, sculpt.bulge ?? 0];
  if (top + bottom >= z)
    fail("box", `"bulge" ${top + bottom} m: less than its height, ${z} m`);
  const side2 = Math.min(x / 2 - 0.0001, y / 2 - 0.0001), upright = (z - top - bottom) / 2;
  const round = Math.min(sculpt.round ?? Math.min(x, y, z) * 0.1, side2, upright);
  if (sculpt.round !== undefined && round < sculpt.round - 0.000000001)
    notes.push(`"round" held to ${round.toFixed(3)} m: half ${upright < side2 ? "its height less its bulge" : "its narrowest side"}`);
  const inner = [x - 2 * round, y - 2 * round];
  const corner = Math.max((sculpt.corner ?? round) - round, 0);
  const rect = (scale3, offset, height) => evenLoop(sectionLoop({ rect: [inner[0] * scale3 + 2 * offset, inner[1] * scale3 + 2 * offset], round: corner * scale3 + offset }), SAMPLES).map(([u, v]) => [u, v, height]);
  const point = (height) => Array.from({ length: SAMPLES }, () => [0, 0, height]);
  const face2 = [0.35, 0.7, 1];
  const edge = round > 0.000001 ? [60, 30, 0].map((degrees) => degrees * Math.PI / 180) : [];
  const sections = [
    point(z),
    ...face2.map((s) => rect(s, 0, z - top * s * s)),
    ...edge.map((phi) => rect(1, round * Math.cos(phi), z - top - round + round * Math.sin(phi))),
    ...[...edge].reverse().map((phi) => rect(1, round * Math.cos(phi), bottom + round - round * Math.sin(phi))),
    ...[...face2].reverse().map((s) => rect(s, 0, bottom * s * s)),
    point(0)
  ];
  return ringsAlong(sections, { smooth: true, corners: edge.length ? [] : [3, 4], caps: "open", notes: [] });
};
var sweep2 = (sculpt, notes) => {
  const closed = sculpt.closed === true;
  const path = closed && near(sculpt.sweep[0], sculpt.sweep.at(-1)) ? sculpt.sweep.slice(0, -1) : sculpt.sweep;
  if (closed && path.length < 3)
    fail("sweep", "a closed path of 3 points or more");
  const line = denseLine(path, { closed, smooth: sculpt.smooth ?? true, corners: sculpt.corners ?? [] });
  const frames = pathFrames(line.points, closed);
  const loop = evenLoop(sectionLoop(sculpt.section), SAMPLES);
  const radius = loop.reduce((sum, [u, v]) => sum + Math.hypot(u, v), 0) / loop.length;
  const scales = (Array.isArray(sculpt.scale) ? sculpt.scale : path.map(() => sculpt.scale ?? 1)).map((s) => isNumber(s) ? [s, s] : s);
  const scaleAt = (j) => {
    const span = Math.min(line.knots.findLastIndex((knot) => knot <= j), line.knots.length - 2);
    const t = (j - line.knots[span]) / (line.knots[span + 1] - line.knots[span]);
    const a = scales[span % scales.length], b = scales[(span + 1) % scales.length];
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  };
  let walked = 0;
  const lengths = line.points.slice(1).map((p, j) => Math.hypot(...p.map((v, k) => v - line.points[j][k])));
  const total = lengths.reduce((a, b) => a + b, 0) || 1;
  const ringAt = (j) => {
    const { up, side: side2 } = frames[j], [sx, sy] = scaleAt(j);
    const angle = (sculpt.twist ?? 0) * walked / total * (Math.PI / 180);
    const c = Math.cos(angle), s = Math.sin(angle);
    const ring = loop.map(([u, v]) => {
      const a = (u * c - v * s) * sx, b = (u * s + v * c) * sy;
      return line.points[j].map((p, k) => p + side2[k] * a + up[k] * b);
    });
    walked += lengths[j] ?? 0;
    return ring;
  };
  const count = closed ? line.points.length - 1 : line.points.length;
  let rings = Array.from({ length: count }, (_, j) => ringAt(j));
  if (closed)
    return gridOfRings(rings, { wrapRows: true, cornerRows: line.corners.filter((j) => j > 0 && j < count) });
  const caps = sculpt.caps ?? "round";
  if (caps === "open")
    notes.push("open at its ends: seen from outside only");
  const capOf = (j, way) => {
    if (caps === "open")
      return [];
    const ring = rings[j], centre = line.points[j], [sx, sy] = scaleAt(j);
    const reach = radius * Math.max(sx, sy);
    return Array.from({ length: ROUND - 1 }, (_, k) => {
      const phi = Math.PI / 2 * (1 - k / (ROUND - 1));
      const shrink = caps === "round" ? Math.cos(phi) : k / (ROUND - 1);
      const out = caps === "round" ? reach * Math.sin(phi) : 0;
      return ring.map((p) => p.map((v, d) => centre[d] + (v - centre[d]) * shrink + way * frames[j].t[d] * out));
    });
  };
  const head = capOf(0, -1), tail = capOf(count - 1, 1).reverse();
  const creases = line.corners.filter((j) => j > 0 && j < count - 1).map((j) => j + head.length);
  if (caps === "flat")
    creases.push(head.length, head.length + count - 1);
  rings = [...head, ...rings, ...tail];
  return gridOfRings(rings, { cornerRows: creases });
};
var denseOf = (sculpt, notes = []) => {
  const shape = checkDescription(sculpt);
  if (shape === "mesh")
    throw new Error("a mesh is resampled by src/build/sculpt/mesh.js, not described");
  return { lathe, loft, box, sweep: sweep2 }[shape](sculpt, notes);
};
var DEG2 = Math.PI / 180;
var turnOf = (degrees) => {
  const [x, y, z] = (degrees ?? [0, 0, 0]).map((value) => value * DEG2);
  return quatMultiply(quatAxisAngle([0, 0, 1], z), quatMultiply(quatAxisAngle([0, 1, 0], y), quatAxisAngle([1, 0, 0], x)));
};
var round = (value, places = 4) => Number(value.toFixed(places));
var partOf = (part, made, { materials = new Map } = {}) => {
  const { sculpt, ...rest } = part;
  const at2 = part.at ?? [0, 0, 0];
  const centre = quatRotate(turnOf(part.turn), made.centre);
  const out = {
    ...rest,
    at: at2.map((v, k) => round(v + centre[k])),
    size: made.size.map((v) => round(v)),
    kind: "sculpt",
    ...made.params
  };
  const texture = part.surface?.texture ?? part.material;
  const tile = materials.get(texture)?.size;
  if (tile && !part.surface?.scale) {
    const [e] = uvMetres({ ...made.mesh, positions: Float32Array.from(made.mesh.positions, (v, o) => (v - made.centre[o % 3]) / made.size[o % 3]) });
    const metres = [Math.sqrt(e[0] * made.size[0] ** 2 + e[1] * made.size[1] ** 2 + e[2] * made.size[2] ** 2), Math.sqrt(e[3] * made.size[0] ** 2 + e[4] * made.size[1] ** 2 + e[5] * made.size[2] ** 2)];
    const whole = (length, size) => round(length / Math.max(1, Math.round(length / size)), 5);
    const scale3 = [whole(metres[0], tile[0]), made.params.stitch === "torus" ? whole(metres[1], tile[1]) : tile[1]];
    out.surface = { ...part.surface, scale: scale3 };
  }
  return out;
};
var resolvePart = (part, { name = part.name ?? "part", materials, meshOf } = {}) => {
  const shape = checkDescription(part.sculpt, name);
  const notes = [];
  let pieces;
  if (shape === "mesh") {
    if (!meshOf)
      fail(name, "a mesh needs reading: tools/sculpt-from.js does it");
    const read = meshOf(part.sculpt, name);
    notes.push(...read.notes);
    pieces = read.pieces;
  } else {
    const made = sculptOfDense(deform(denseOf(part.sculpt, notes), part.sculpt.deform ?? []), { sides: part.sculpt.sides });
    pieces = [made];
  }
  const parts = pieces.map((made, i) => {
    notes.push(...made.notes);
    const triangles = made.mesh.indices.length / 3;
    notes.push(`${pieces.length > 1 ? `piece ${i + 1}: ` : ""}${shape}, ${made.params.stitch}, ${made.sides.join(" × ")} sides (${triangles.toLocaleString("en")} triangles), ${made.size.map((v) => v.toFixed(2)).join(" × ")} m, within ${(made.deviation.p98 * 1000).toFixed(1)} mm`);
    return partOf({ ...part, ...pieces.length > 1 && { name: `${name} ${i + 1}` }, ...made.color && part.color === undefined && { color: made.color } }, made, { materials });
  });
  return { parts, notes: notes.map((note) => `${name}: ${note}`) };
};
var resolveBuild = (build, options = {}) => {
  const notes = [];
  const resolve = (prims, owner) => prims?.flatMap((part, index) => {
    if (part.sculpt === undefined)
      return [part];
    const made = resolvePart(part, { ...options, name: `${owner}${part.name ?? `part ${index}`}` });
    notes.push(...made.notes);
    return made.parts;
  });
  const out = { ...build };
  if (build.prims)
    out.prims = resolve(build.prims, "");
  if (build.objects)
    out.objects = build.objects.map((object) => ({ ...object, prims: resolve(object.prims, `${object.name} › `) }));
  return { build: out, notes };
};

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
  KHR_mesh_quantization: null
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
    for (let at2 = 12;at2 + 8 <= bytes.byteLength; ) {
      const length = view.getUint32(at2, true), type = view.getUint32(at2 + 4, true);
      const chunk = bytes.subarray(at2 + 8, at2 + 8 + length);
      if (type === JSON_CHUNK)
        gltf = JSON.parse(new TextDecoder().decode(chunk));
      else if (type === BIN_CHUNK)
        binary = chunk;
      at2 += 8 + length;
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
    const scale3 = a.normalized ? NORMALIZED[a.componentType] : 1;
    for (let i = 0;i < a.count; i++)
      for (let k = 0;k < components; k++) {
        const value = read(base + i * stride + k * Type.BYTES_PER_ELEMENT);
        out[i * components + k] = a.normalized ? Math.max(value / scale3, -1) : value;
      }
    return out;
  };
  const materials = (gltf.materials ?? []).map((material, i) => ({ name: material.name ?? `material ${i}`, color: (material.pbrMetallicRoughness?.baseColorFactor ?? [1, 1, 1, 1]).slice(0, 3) }));
  const fallback = materials.length;
  materials.push({ name: "none", color: [0.8, 0.8, 0.8] });
  const positions = [], indices = [], materialOf = [], notes = [];
  const shaded = new Map;
  const scene = gltf.scenes?.[gltf.scene ?? 0];
  const roots = scene?.nodes ?? (gltf.nodes ?? []).map((_, i) => i).filter((i) => !(gltf.nodes ?? []).some((node) => node.children?.includes(i)));
  const visit = (index, parent) => {
    const node = gltf.nodes[index];
    const world = multiply(parent, localOf(node));
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
        const determinant = world[0] * (world[5] * world[10] - world[9] * world[6]) - world[4] * (world[1] * world[10] - world[9] * world[2]) + world[8] * (world[1] * world[6] - world[5] * world[2]);
        const turn = determinant > 0;
        for (let i = 0;i + 2 < order.length; i += 3) {
          const [a, b, c] = [order[i], order[i + 1], order[i + 2]];
          if (turn)
            indices.push(first + a, first + c, first + b);
          else
            indices.push(first + a, first + b, first + c);
          materialOf.push(material);
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
    author: gltf.asset.extras?.author ?? gltf.asset.copyright ?? null,
    licence: gltf.asset.extras?.license ?? null,
    source: gltf.asset.extras?.source ?? null,
    generator: gltf.asset.generator ?? null,
    notes: [...new Set(notes)]
  };
};

// src/build/sculpt/mesh.js
var SIDES = [32, 32];
var DENSE = [96, 96];
var SAMPLES2 = 6000;
var TOLERANCE = 0.02;
var MOST_LOST = 0.05;
var SMALL = 0.005;
var MOST_PIECES = 32;
var MOST_HANDLES = 3;
var sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
var dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
var cross2 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
var unit = (a) => {
  const l = Math.hypot(...a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
var percent = (share) => `${(share * 100).toFixed(share < 0.1 ? 1 : 0)} %`;
var cm = (metres) => metres < 0.01 ? `${(metres * 1000).toFixed(1)} mm` : `${(metres * 100).toFixed(metres < 0.1 ? 1 : 0)} cm`;
var piecesOf = ({ positions, indices }) => {
  const count = positions.length / 3;
  let min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (let v = 0;v < count; v++)
    for (let k = 0;k < 3; k++) {
      min[k] = Math.min(min[k], positions[v * 3 + k]);
      max[k] = Math.max(max[k], positions[v * 3 + k]);
    }
  const diagonal = Math.hypot(...sub(max, min)) || 1;
  const step = diagonal * 0.000001;
  const ids = new Map, weld = new Uint32Array(count), points = [];
  for (let v = 0;v < count; v++) {
    const key = `${Math.round(positions[v * 3] / step)},${Math.round(positions[v * 3 + 1] / step)},${Math.round(positions[v * 3 + 2] / step)}`;
    if (!ids.has(key)) {
      ids.set(key, points.length / 3);
      points.push(positions[v * 3], positions[v * 3 + 1], positions[v * 3 + 2]);
    }
    weld[v] = ids.get(key);
  }
  const welded = Float64Array.from(points);
  const vertices = welded.length / 3;
  const kept = [], source = [];
  for (let t = 0;t < indices.length; t += 3) {
    const a = weld[indices[t]], b = weld[indices[t + 1]], c = weld[indices[t + 2]];
    if (a === b || b === c || c === a)
      continue;
    kept.push(a, b, c);
    source.push(t / 3);
  }
  const triangles = Uint32Array.from(kept);
  const faces = triangles.length / 3;
  const edges = new Map;
  for (let t = 0;t < faces; t++)
    for (let k = 0;k < 3; k++) {
      const a = triangles[t * 3 + k], b = triangles[t * 3 + (k + 1) % 3];
      const key = a < b ? a * vertices + b : b * vertices + a;
      const list = edges.get(key);
      if (list)
        list.push(t);
      else
        edges.set(key, [t]);
    }
  const parent = Int32Array.from({ length: faces }, (_, t) => t);
  const find = (t) => {
    while (parent[t] !== t)
      t = parent[t] = parent[parent[t]];
    return t;
  };
  for (const list of edges.values())
    for (let i = 1;i < list.length; i++) {
      const a = find(list[0]), b = find(list[i]);
      if (a !== b)
        parent[a] = b;
    }
  const groups = new Map;
  for (let t = 0;t < faces; t++) {
    const root = find(t);
    const group = groups.get(root);
    if (group)
      group.push(t);
    else
      groups.set(root, [t]);
  }
  const areaOf = (t) => {
    const a = triangles[t * 3] * 3, b = triangles[t * 3 + 1] * 3, c = triangles[t * 3 + 2] * 3;
    const u = sub([welded[b], welded[b + 1], welded[b + 2]], [welded[a], welded[a + 1], welded[a + 2]]);
    const w = sub([welded[c], welded[c + 1], welded[c + 2]], [welded[a], welded[a + 1], welded[a + 2]]);
    return Math.hypot(...cross2(u, w)) / 2;
  };
  const pieces = [...groups.values()].map((list) => {
    const own = new Uint32Array(list.length * 3);
    list.forEach((t, i) => own.set(triangles.subarray(t * 3, t * 3 + 3), i * 3));
    const used = new Set(own);
    let edgeCount = 0, nonManifold = 0;
    const rim = new Map;
    const seen = new Set;
    for (const t of list)
      for (let k = 0;k < 3; k++) {
        const a = triangles[t * 3 + k], b = triangles[t * 3 + (k + 1) % 3];
        const key = a < b ? a * vertices + b : b * vertices + a;
        if (seen.has(key))
          continue;
        seen.add(key);
        edgeCount++;
        const sharing = edges.get(key).length;
        if (sharing > 2)
          nonManifold++;
        if (sharing === 1)
          rim.set(a, b);
      }
    const loops = [];
    const left = new Set(rim.keys());
    for (const start of rim.keys()) {
      if (!left.has(start))
        continue;
      const loop = [];
      for (let v = start;left.has(v); v = rim.get(v)) {
        left.delete(v);
        loop.push(v);
      }
      const at2 = loop.map((v) => [welded[v * 3], welded[v * 3 + 1], welded[v * 3 + 2]]);
      const length = at2.reduce((sum, p, i) => sum + Math.hypot(...sub(at2[(i + 1) % at2.length], p)), 0);
      const middle = at2.reduce((sum, p) => sum.map((s, k) => s + p[k] / at2.length), [0, 0, 0]);
      loops.push({ vertices: loop, points: at2, length, middle });
    }
    const euler = used.size - edgeCount + list.length;
    const genus = Math.max(0, Math.round((2 - euler - loops.length) / 2));
    return { triangles: own, faces: list, area: list.reduce((sum, t) => sum + areaOf(t), 0), loops, nonManifold, genus };
  }).sort((a, b) => b.area - a.area);
  return { positions: welded, pieces, diagonal, source: Uint32Array.from(source) };
};
var halton = (i, base) => {
  let f = 1, r = 0;
  for (;i > 0; i = Math.floor(i / base)) {
    f /= base;
    r += f * (i % base);
  }
  return r;
};
var surfacePoints = (positions, indices, count) => {
  const faces = indices.length / 3;
  const cumulative = new Float64Array(faces);
  let total = 0;
  for (let t = 0;t < faces; t++) {
    const a = indices[t * 3] * 3, b = indices[t * 3 + 1] * 3, c = indices[t * 3 + 2] * 3;
    const u = [positions[b] - positions[a], positions[b + 1] - positions[a + 1], positions[b + 2] - positions[a + 2]];
    const w = [positions[c] - positions[a], positions[c + 1] - positions[a + 1], positions[c + 2] - positions[a + 2]];
    total += Math.hypot(...cross2(u, w)) / 2;
    cumulative[t] = total;
  }
  const points = [];
  for (let i = 0;i < count; i++) {
    const target = (i + 0.5) / count * total;
    let lo = 0, hi = faces - 1;
    while (lo < hi) {
      const mid = lo + hi >> 1;
      if (cumulative[mid] < target)
        lo = mid + 1;
      else
        hi = mid;
    }
    let r1 = halton(i + 1, 2), r2 = halton(i + 1, 3);
    if (r1 + r2 > 1)
      [r1, r2] = [1 - r1, 1 - r2];
    const a = indices[lo * 3] * 3, b = indices[lo * 3 + 1] * 3, c = indices[lo * 3 + 2] * 3;
    points.push([0, 1, 2].map((k) => positions[a + k] + (positions[b + k] - positions[a + k]) * r1 + (positions[c + k] - positions[a + k]) * r2));
  }
  return points;
};
var fitOf = (piece, made, tolerance) => {
  const sculptBvh = createBvh(made.mesh.positions, made.mesh.indices);
  const lostPoints = [];
  const distances = piece.samples.map((point) => {
    const d = sculptBvh.distance(point);
    if (d > tolerance)
      lostPoints.push(point);
    return d;
  });
  const ours = surfacePoints(made.mesh.positions, made.mesh.indices, SAMPLES2).map((point) => piece.bvh.distance(point));
  const p95 = (list) => [...list].sort((a, b) => a - b)[Math.floor(list.length * 0.95)];
  return {
    lost: lostPoints.length / distances.length,
    madeUp: ours.filter((d) => d > tolerance).length / ours.length,
    p95: Math.max(p95(distances), p95(ours)),
    lostPoints
  };
};
var whereOf = (points, { min, max }) => {
  const middle = points.reduce((sum, p) => sum.map((s, k) => s + p[k] / points.length), [0, 0, 0]);
  const along = [0, 1, 2].map((k) => (middle[k] - min[k]) / (max[k] - min[k] || 1) * 2 - 1);
  const words = [];
  if (along[2] > 0.35)
    words.push("its top");
  else if (along[2] < -0.35)
    words.push("its bottom");
  const side2 = [0, 1].filter((k) => Math.abs(along[k]) > 0.35).map((k) => `${along[k] > 0 ? "+" : "−"}${"xy"[k]}`);
  if (side2.length)
    words.push(`towards ${side2.join(" and ")}`);
  return words.length ? words.join(", ") : "all round it";
};
var principalAxes = (points) => {
  const mean = points.reduce((sum, p) => sum.map((s, k) => s + p[k] / points.length), [0, 0, 0]);
  const c = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (const p of points)
    for (let i = 0;i < 3; i++)
      for (let j = 0;j < 3; j++)
        c[i][j] += (p[i] - mean[i]) * (p[j] - mean[j]) / points.length;
  const v = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  for (let sweep3 = 0;sweep3 < 32; sweep3++) {
    for (const [p, q] of [[0, 1], [0, 2], [1, 2]]) {
      if (Math.abs(c[p][q]) < 0.000000000000001)
        continue;
      const theta = (c[q][q] - c[p][p]) / (2 * c[p][q]);
      const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
      const cos = 1 / Math.sqrt(t * t + 1), sin = t * cos;
      for (let k = 0;k < 3; k++) {
        const ckp = c[k][p], ckq = c[k][q];
        c[k][p] = cos * ckp - sin * ckq;
        c[k][q] = sin * ckp + cos * ckq;
      }
      for (let k = 0;k < 3; k++) {
        const cpk = c[p][k], cqk = c[q][k];
        c[p][k] = cos * cpk - sin * cqk;
        c[q][k] = sin * cpk + cos * cqk;
      }
      for (let k = 0;k < 3; k++) {
        const vkp = v[k][p], vkq = v[k][q];
        v[k][p] = cos * vkp - sin * vkq;
        v[k][q] = sin * vkp + cos * vkq;
      }
    }
  }
  return [0, 1, 2].map((i) => ({ axis: [v[0][i], v[1][i], v[2][i]], spread: c[i][i] })).sort((a, b) => b.spread - a.spread).map(({ axis }) => axis);
};
var inside = (bvh, point) => [[0.5773, 0.5774, 0.5774], [-0.6, 0.48, -0.64]].every((direction) => bvh.hits(point, direction).length % 2 === 1);
var capsuleGrid = (bvh, { centre, axis, reach, radius }) => {
  const [columns, rows] = DENSE;
  const e1 = unit(Math.abs(axis[2]) < 0.9 ? cross2(axis, [0, 0, 1]) : cross2(axis, [1, 0, 0])), e2 = cross2(axis, e1);
  const top = centre.map((v, k) => v + axis[k] * reach), bottom = centre.map((v, k) => v - axis[k] * reach);
  const cap2 = Math.PI / 2 * radius, side2 = 2 * reach;
  const capRows = reach > 0 ? Math.min(rows / 2, Math.max(8, Math.round(rows * cap2 / (2 * cap2 + side2)))) : rows / 2;
  const sideRows = rows - 2 * capRows;
  let misses = 0;
  const rings = [];
  for (let j = 0;j <= rows; j++) {
    let origin, polar;
    if (j <= capRows) {
      origin = top;
      polar = Math.PI / 2 * (j / capRows);
    } else if (j >= rows - capRows) {
      origin = bottom;
      polar = Math.PI / 2 + Math.PI / 2 * ((j - (rows - capRows)) / capRows);
    } else {
      origin = top.map((v, k) => v + (bottom[k] - v) * ((j - capRows) / sideRows));
      polar = Math.PI / 2;
    }
    const pole = j === 0 || j === rows;
    const ring = [];
    for (let i = 0;i < columns; i++) {
      if (pole && i > 0) {
        ring.push(ring[0]);
        continue;
      }
      const round2 = 2 * Math.PI * i / columns;
      const across = e1.map((v, k) => v * Math.cos(round2) + e2[k] * Math.sin(round2));
      const direction = axis.map((v, k) => v * Math.cos(polar) + across[k] * Math.sin(polar));
      const hits = bvh.hits(origin, direction);
      ring.push(hits.length ? origin.map((v, k) => v + direction[k] * hits.at(-1)) : null);
    }
    const found = ring.map((p, i) => p ? i : -1).filter((i) => i >= 0);
    if (!found.length)
      return null;
    for (let i = 0;i < columns; i++) {
      if (ring[i])
        continue;
      misses++;
      const nearest = found.reduce((best, f) => Math.min(Math.abs(f - i), columns - Math.abs(f - i)) < Math.min(Math.abs(best - i), columns - Math.abs(best - i)) ? f : best);
      const reachOf = Math.hypot(...sub(ring[nearest], origin));
      const round2 = 2 * Math.PI * i / columns;
      const across = e1.map((v, k) => v * Math.cos(round2) + e2[k] * Math.sin(round2));
      ring[i] = origin.map((v, k) => v + (axis[k] * Math.cos(polar) + across[k] * Math.sin(polar)) * reachOf);
    }
    rings.push(ring);
  }
  return { rings, misses: misses / ((rows - 1) * columns + 2) };
};
var tubeGrid = (bvh, [start, end]) => {
  const [columns, rows] = DENSE;
  const axis = unit(sub(end.middle, start.middle));
  const e1 = unit(Math.abs(axis[2]) < 0.9 ? cross2(axis, [0, 0, 1]) : cross2(axis, [1, 0, 0])), e2 = cross2(axis, e1);
  const angleOf = (p, origin) => {
    const d = sub(p, origin);
    return Math.atan2(dot(d, e2), dot(d, e1));
  };
  const rimAt = (rim, round2) => {
    const angles = rim.points.map((p) => angleOf(p, rim.middle));
    let best = 0, bestGap = Infinity;
    angles.forEach((a, i) => {
      const gap = Math.abs(Math.atan2(Math.sin(a - round2), Math.cos(a - round2)));
      if (gap < bestGap)
        [best, bestGap] = [i, gap];
    });
    return rim.points[best];
  };
  let misses = 0;
  const rings = [];
  for (let j = 0;j <= rows; j++) {
    const ring = [];
    const origin = start.middle.map((v, k) => v + (end.middle[k] - v) * (j / rows));
    for (let i = 0;i < columns; i++) {
      const round2 = 2 * Math.PI * i / columns;
      if (j === 0 || j === rows) {
        ring.push(rimAt(j === 0 ? start : end, round2));
        continue;
      }
      const direction = e1.map((v, k) => v * Math.cos(round2) + e2[k] * Math.sin(round2));
      const hits = bvh.hits(origin, direction);
      if (hits.length)
        ring.push(origin.map((v, k) => v + direction[k] * hits.at(-1)));
      else {
        misses++;
        ring.push(rings.at(-1)?.[i] ?? origin);
      }
    }
    rings.push(ring);
  }
  return { rings, misses: misses / ((rows - 1) * columns) };
};
var gridOf = (rings, poles) => {
  const columns = rings[0].length, rows = rings.length - 1;
  const points = new Float64Array((rows + 1) * (columns + 1) * 3);
  rings.forEach((ring, j) => {
    for (let i = 0;i <= columns; i++)
      points.set(ring[i % columns], (j * (columns + 1) + i) * 3);
  });
  return { columns, rows, points, wrapRows: false, poles, cornerRows: [], cornerColumns: [] };
};
var sculptOfPiece = (model, piece, { as, axis: wanted } = {}) => {
  const { positions } = model;
  const points = [];
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (const v of new Set(piece.triangles)) {
    const p = [positions[v * 3], positions[v * 3 + 1], positions[v * 3 + 2]];
    points.push(p);
    for (let k = 0;k < 3; k++) {
      min[k] = Math.min(min[k], p[k]);
      max[k] = Math.max(max[k], p[k]);
    }
  }
  const box2 = { min, max };
  const diagonal = Math.hypot(...sub(max, min));
  const tolerance = TOLERANCE * diagonal;
  const openings = piece.loops.filter((loop) => loop.length > 0.15 * diagonal);
  const clean = piece.nonManifold === 0 && piece.genus <= MOST_HANDLES;
  if (clean && piece.genus > 0)
    return { refused: `${piece.genus === 1 ? "a hole" : `${piece.genus} holes`} right through it (a handle, a loop, a pierced bottom): a sculpt is a ball, a tube or a ring — not cut into such pieces yet` };
  const tube = as === "tube" || as === undefined && openings.length === 2;
  if (as === "tube" && openings.length !== 2)
    return { refused: `not a tube: ${openings.length} rims where a tube has 2` };
  if (!tube && openings.length)
    return { refused: `open: ${openings.length === 1 ? "a rim" : `${openings.length} rims`} ${cm(Math.max(...openings.map((loop) => loop.length)) / Math.PI)} across — a sheet, not a closed shape; a sculpt shows one side of it` };
  piece.bvh = createBvh(positions, piece.triangles);
  piece.samples = surfacePoints(positions, piece.triangles, SAMPLES2);
  const tries = [];
  const attempt = (layout, grid, poles) => {
    if (!grid)
      return;
    const made = sculptOfDense(gridOf(grid.rings, poles), { sides: SIDES });
    const fit2 = fitOf(piece, made, tolerance);
    tries.push({ made, fit: fit2, layout, misses: grid.misses, score: Math.max(fit2.lost, fit2.madeUp) + grid.misses + fit2.p95 / diagonal });
  };
  if (tube) {
    const [a, b] = openings;
    attempt("tube", tubeGrid(piece.bvh, [a, b]), [false, false]);
  } else {
    const axes = wanted ? [{ x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] }[wanted]] : principalAxes(piece.samples);
    if (!wanted && !axes.some((a) => Math.abs(a[2]) > 0.95))
      axes.push([0, 0, 1]);
    const middle = min.map((v, k) => (v + max[k]) / 2);
    const mean = piece.samples.reduce((sum, p) => sum.map((s, k) => s + p[k] / piece.samples.length), [0, 0, 0]);
    const centres = [middle, mean].filter((point) => inside(piece.bvh, point)).sort((a, b) => piece.bvh.distance(b) - piece.bvh.distance(a));
    const centre = centres[0] ?? middle;
    const spans = axes.map((axis) => ({
      axis,
      extent: points.reduce((most, p) => Math.max(most, Math.abs(dot(sub(p, centre), axis))), 0),
      across: points.reduce((sum, p) => {
        const d = sub(p, centre);
        return sum + Math.hypot(...sub(d, axis.map((v) => v * dot(d, axis))));
      }, 0) / points.length
    }));
    const close = () => tries.some((t) => t.fit.lost <= 0.01 && t.fit.madeUp <= 0.01 && t.misses === 0);
    search:
      for (const share of [0, 0.45, 0.8]) {
        for (const { axis, extent, across } of spans) {
          const reach = share * Math.max(extent - across, 0);
          if (share > 0 && reach < 0.05 * extent)
            continue;
          if (share > 0 && ![1, -1].every((sign) => inside(piece.bvh, centre.map((v, k) => v + sign * axis[k] * reach))))
            continue;
          attempt(share ? "capsule" : "ball", capsuleGrid(piece.bvh, { centre, axis, reach, radius: Math.max(across, 0.001) }), [true, true]);
          if (close())
            break search;
        }
      }
  }
  if (!tries.length)
    return { refused: "nothing inside it to look out from: its surface may not close" };
  const best = tries.reduce((a, b) => b.score < a.score ? b : a);
  const { fit } = best;
  const fits = fit.lost <= MOST_LOST && fit.madeUp <= MOST_LOST && best.misses <= 0.02;
  if (!fits) {
    const why = fit.lost > MOST_LOST ? `${percent(fit.lost)} of its surface lies farther than ${cm(tolerance)} from what a sculpt of it can show, at ${whereOf(fit.lostPoints, box2)}: parts too thin or too folded for one grid` : fit.madeUp > MOST_LOST ? `${percent(fit.madeUp)} of what a sculpt makes of it is not there (farther than ${cm(tolerance)}): it folds round on itself` : `${percent(best.misses)} of the rays from inside it found no surface: it is not closed`;
    return { refused: `${why} — split it into simpler pieces, or build it of prims`, fit, layout: best.layout };
  }
  return { made: best.made, fit, layout: best.layout, ...!clean && { rough: piece.genus > MOST_HANDLES ? `${piece.genus.toLocaleString("en")} holes through it, too small for its grid` : `not clean (${piece.nonManifold.toLocaleString("en")} edges of three triangles or more)` } };
};
var sculptsOfMesh = (mesh, options = {}) => {
  const model = piecesOf(mesh);
  const total = model.pieces.reduce((sum, piece) => sum + piece.area, 0);
  const notes = [], refused = [], pieces = [];
  const shown = model.pieces.filter((piece) => piece.area >= SMALL * total);
  const small = model.pieces.length - shown.length;
  if (small)
    notes.push(`${small} small bit${small === 1 ? "" : "s"} left out (${percent(model.pieces.filter((piece) => piece.area < SMALL * total).reduce((sum, piece) => sum + piece.area, 0) / total)} of its surface)`);
  if (shown.length > MOST_PIECES)
    notes.push(`${shown.length} pieces: the ${MOST_PIECES} largest kept`);
  shown.slice(0, MOST_PIECES).forEach((piece, i) => {
    const label = shown.length > 1 ? `piece ${i + 1} (${percent(piece.area / total)} of its surface)` : "it";
    const result = sculptOfPiece(model, piece, options);
    if (result.refused)
      return refused.push(`${label} does not fit: ${result.refused}`);
    const made = result.made;
    if (result.rough)
      made.notes.push(`its surface ${result.rough}: judged by how a sculpt fits it`);
    made.notes.push(`resampled as a ${result.layout}: ${percent(result.fit.lost)} of the model's surface farther than ${cm(TOLERANCE * Math.hypot(...made.size))} from it, 95 % within ${cm(result.fit.p95)}`);
    if (mesh.materialOf && mesh.materials) {
      const byMaterial = new Map;
      for (const face2 of piece.faces) {
        const material2 = mesh.materialOf[model.source[face2]];
        byMaterial.set(material2, (byMaterial.get(material2) ?? 0) + 1);
      }
      const [material] = [...byMaterial.entries()].sort((a, b) => b[1] - a[1])[0];
      made.color = mesh.materials[material].color.map((c) => Number(c.toFixed(3)));
      made.materialName = mesh.materials[material].name;
    }
    pieces.push(made);
  });
  return { pieces, notes, refused };
};

// tools/sculpt-from.js
var here = dirname(fileURLToPath(import.meta.url));
var root = join(here, "..");
var args = process.argv.slice(2);
var option = (flag) => args.includes(flag) ? args[args.indexOf(flag) + 1] : null;
var input = args[0];
if (!input || input.startsWith("--")) {
  console.error(`usage: sculpt-from <name | build.json> [--out file.json]
       sculpt-from <model.glb | model.gltf> [--height m | --size x,y,z] [--as sphere|tube] [--axis x|y|z] [--name name] [--author who] [--licence text] [--out file.json]`);
  process.exit(2);
}
var readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
var round2 = (value) => typeof value === "number" && !Number.isInteger(value) ? Math.round(value * 1e4) / 1e4 : value;
var write = (path, build) => writeFileSync(path, `${JSON.stringify(build, (key, value) => round2(value), 1)}
`);
var manifest = join(root, "assets/textures/manifest.json");
var catalogFile = [join(here, "../catalog.json"), join(root, ".claude/skills/ovgrid/catalog.json")].find(existsSync);
var materials = new Map((existsSync(manifest) ? readJson(manifest).materials : catalogFile ? readJson(catalogFile).materials : []).map((material) => [material.id, material]));
var made = new Map;
var sculptsOfFile = (file, sculpt) => {
  const key = `${file}|${JSON.stringify(sculpt)}`;
  if (!made.has(key))
    made.set(key, sculptsOfModel(file, sculpt));
  return made.get(key);
};
var sculptsOfModel = (file, sculpt) => {
  const bytes = new Uint8Array(readFileSync(file));
  const model = readGltf(bytes, { bufferOf: (uri) => new Uint8Array(readFileSync(join(dirname(file), decodeURIComponent(uri)))) });
  const { positions } = model;
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (let o = 0;o < positions.length; o += 3)
    for (let k = 0;k < 3; k++) {
      min[k] = Math.min(min[k], positions[o + k]);
      max[k] = Math.max(max[k], positions[o + k]);
    }
  const extent = max.map((v, k) => v - min[k]);
  const factor = sculpt.height ? sculpt.height / extent[2] : sculpt.size ? Math.min(...sculpt.size.map((v, k) => v / extent[k])) : 1;
  const base = [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, min[2]];
  for (let o = 0;o < positions.length; o += 3)
    for (let k = 0;k < 3; k++)
      positions[o + k] = (positions[o + k] - base[k]) * factor;
  const { pieces, notes, refused } = sculptsOfMesh(model, { as: sculpt.as, axis: sculpt.axis });
  const said = [...model.notes, `${basename(file)}: ${extent.map((v) => (v * factor).toFixed(2)).join(" × ")} m`, ...notes, ...refused];
  if (!pieces.length)
    throw new Error(`${basename(file)}: no piece of it fits a sculpted prim —
  ${said.join(`
  `)}`);
  return { pieces, notes: said, model };
};
var output;
var build;
var notes;
try {
  if (/\.(glb|gltf)$/i.test(input)) {
    const sculpt = {
      ...option("--height") && { height: Number(option("--height")) },
      ...option("--size") && { size: option("--size").split(",").map(Number) },
      ...option("--as") && { as: option("--as") },
      ...option("--axis") && { axis: option("--axis") }
    };
    const name = option("--name") ?? basename(input, extname(input));
    const { model } = sculptsOfFile(resolve(input), sculpt);
    const author = option("--author") ?? model.author;
    const licence = option("--licence") ?? model.licence;
    const object = {
      name,
      at: [0, 0, 0],
      prims: [{ name, at: [0, 0, 0], sculpt: { mesh: basename(input), ...sculpt } }],
      origin: {
        source: "gltf",
        name,
        archive: model.source ?? basename(input),
        ...licence && { description: `licence: ${licence}` },
        ...author && { creator: { name: author } }
      }
    };
    const resolved = resolveBuild({ name, objects: [object] }, { materials, meshOf: ({ mesh, ...rest }) => sculptsOfFile(resolve(dirname(input), mesh), rest) });
    build = resolved.build;
    notes = resolved.notes;
    output = option("--out") ?? join(dirname(input), `${name}.json`);
  } else {
    const file = input.endsWith(".json") ? input : join(root, "assets/builds", `${input}.json`);
    const spec = readJson(file);
    const resolved = resolveBuild(spec, { materials, meshOf: ({ mesh, ...rest }) => sculptsOfFile(resolve(dirname(file), mesh), rest) });
    build = resolved.build;
    notes = resolved.notes;
    output = option("--out") ?? (input.endsWith(".json") ? file.replace(/\.json$/, ".sculpted.json") : join(root, "assets/builds", `${input}-sculpted.json`));
  }
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
write(output, build);
var parts = (build.prims ?? []).concat(...(build.objects ?? []).map((object) => object.prims)).filter((part) => part.kind === "sculpt");
console.log(`${notes.join(`
`)}
${output}: ${parts.length} sculpted prim${parts.length === 1 ? "" : "s"}`);
