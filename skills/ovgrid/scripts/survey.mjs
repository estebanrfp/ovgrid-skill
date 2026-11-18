#!/usr/bin/env node
// Made by tools/build-skill-repo.js from OVGrid's tools/build-survey.js: run with Node 18+ or Bun.
var __defProp = Object.defineProperty;
var __returnValue = (v) => v;
function __exportSetter(name, newValue) {
  this[name] = __returnValue.bind(null, newValue);
}
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: __exportSetter.bind(all, name)
    });
};
var __esm = (fn, res) => () => (fn && (res = fn(fn = 0)), res);
var __promiseAll = (args) => Promise.all(args);

// src/terrain-height.js
var ROOT_SIZE = 12696000, NOISE_SCALE = 800, SEA_LEVEL = 0.5555556, ELEV_SCALE = 21600, layer = (type, octaves, ridgeExponent, warpStrength, hmin, hmax) => ({
  type,
  octaves,
  gain: 0.5,
  ridgeOffset: 1.064,
  ridgeExponent,
  warpStrength,
  hmin,
  hmax,
  density: 0.3
}), RIDGED = 1, FBM = 0, BASE_LAYER, TERRAIN_LAYER_0, TERRAIN_LAYER_1, TERRAIN_LAYER_2, BIAS, GRID_OFFSET, hash = (x, y, z) => {
  const n = Math.imul(x, 1597) + Math.imul(y, 3571) + Math.imul(z, 7919) | 0;
  let state = Math.imul(n, 747796405) + 2891336453 >>> 0;
  state = Math.imul((state >>> (state >>> 28) + 4 ^ state) >>> 0, 277803737) >>> 0;
  state = (state >>> 22 ^ state) >>> 0;
  return -1 + 2 * state / 4294967295;
}, valueNoise = (px, py, pz) => {
  const ix = Math.floor(px), iy = Math.floor(py), iz = Math.floor(pz);
  const wx = px - ix, wy = py - iy, wz = pz - iz;
  const ux = wx * wx * wx * (wx * (wx * 6 - 15) + 10);
  const uy = wy * wy * wy * (wy * (wy * 6 - 15) + 10);
  const uz = wz * wz * wz * (wz * (wz * 6 - 15) + 10);
  const a = hash(ix, iy, iz), b = hash(ix + 1, iy, iz), c = hash(ix, iy + 1, iz), d = hash(ix + 1, iy + 1, iz);
  const e = hash(ix, iy, iz + 1), f = hash(ix + 1, iy, iz + 1), g = hash(ix, iy + 1, iz + 1), h = hash(ix + 1, iy + 1, iz + 1);
  return a + (b - a) * ux + (c - a) * uy + (e - a) * uz + (a - b - c + d) * ux * uy + (a - c - e + g) * uy * uz + (a - b - e + f) * uz * ux + (-a + b + c - d + e - f - g + h) * ux * uy * uz;
}, fbmRange = (gain, octaves) => Math.abs(gain - 1) < 0.00001 ? octaves + 1 : (1 - gain ** (octaves + 1)) / (1 - gain), fbm = ([x, y, z], gain, octaves) => {
  let f = 1, a = 1, t = 0;
  for (let i = 0;i < octaves; i++, f *= 2, a *= gain)
    t += a * valueNoise(f * x, f * y, f * z);
  return t;
}, fbmScaled = (p, gain, octaves, min, max) => {
  const h = fbmRange(gain, octaves);
  return min + (max - min) * ((fbm(p, gain, octaves) + h) / (2 * h));
}, ridgedFbmScaled = ([x, y, z], gain, octaves, offset, exponent, min, max) => {
  let f = 1, a = 1, t = 0, weight = 1;
  for (let i = 0;i < octaves; i++, f *= 2, a *= gain) {
    const signal = (offset - Math.abs(valueNoise(f * x, f * y, f * z))) ** exponent * weight;
    t += a * signal;
    weight = Math.min(Math.max(signal * 2, 0), 1);
  }
  const low = (offset - 1) ** exponent;
  const high = offset ** exponent * fbmRange(gain, octaves);
  return min + (max - min) * ((t - low) / (high - low));
}, layerValue = (pos, n, scaleIndex) => {
  const bias = BIAS[scaleIndex];
  const pt = pos.map((c, i) => (c + bias[i]) * n.density + GRID_OFFSET[i]);
  return n.type === RIDGED ? ridgedFbmScaled(pt, n.gain, n.octaves, n.ridgeOffset, n.ridgeExponent, n.hmin, n.hmax) : fbmScaled(pt, n.gain, n.octaves, n.hmin, n.hmax);
}, warpOffset = (pos, n) => [0, 1, 2].map((i) => layerValue(pos, n, i) * n.warpStrength), add3 = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], scale3 = (a, s) => [a[0] * s, a[1] * s, a[2] * s], rotateDomain = ([x, y, z], angle) => {
  const c = Math.cos(angle), s = Math.sin(angle);
  return [c * x + s * y, -s * x + c * y, z];
}, terrainHeight = (dir) => {
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
}, bareElevation = (dir) => terrainHeight(dir) * ELEV_SCALE, land = null, groundElevation = (dir) => land ? land.elevation(dir, bareElevation) : terrainHeight(dir) * ELEV_SCALE, BAND_NOISE;
var init_terrain_height = __esm(() => {
  BASE_LAYER = layer(RIDGED, 23, 1.665, 3.6, 0, 1);
  TERRAIN_LAYER_0 = layer(RIDGED, 10, 1.005, 1.6, 0, 1);
  TERRAIN_LAYER_1 = layer(FBM, 18, 1.665, 2.6, -2, 2);
  TERRAIN_LAYER_2 = layer(RIDGED, 18, 1.1, 0.9, -2, 2);
  BIAS = [[2.3, 4.5, 6.7], [8.9, 9.8, 8.7], [7.6, 6.5, 5.4]];
  GRID_OFFSET = [5, 4, 9];
  BAND_NOISE = { scale: 300 * 5.2, octaves: 3, reach: 0.2 };
});

// src/build/survey.js
var RADIUS = 6348000, SEA = 12000, DEG, REACH = 8, RISE = 0.4, unit = (v) => {
  const length = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / length, v[1] / length, v[2] / length];
}, cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], round = (v, digits = 2) => Number(v.toFixed(digits)) + 0, wrap = (degrees) => ((degrees + 180) % 360 + 360) % 360 - 180, axesAt = (up) => {
  const north = unit([-up[0] * up[1], 1 - up[1] * up[1], -up[2] * up[1]]);
  return { north, east: cross(north, up) };
}, fromLatLon = (lat, lon) => [Math.cos(lat * DEG) * Math.sin(lon * DEG), Math.sin(lat * DEG), Math.cos(lat * DEG) * Math.cos(lon * DEG)], latLonOf = (point) => {
  const [x, y, z] = unit(point);
  return [round(Math.asin(y) / DEG, 6), round(Math.atan2(x, z) / DEG, 6)];
}, frameAt = (at, heading = 0, ground = groundElevation) => {
  const up = unit(at);
  const { north, east } = axesAt(up);
  const ahead = north.map((v, i) => v * Math.cos(heading * DEG) + east[i] * Math.sin(heading * DEG));
  const right = cross(ahead, up);
  const origin = [...at];
  const base = Math.hypot(...at);
  const point = (x, y, z = 0) => origin.map((v, i) => v + right[i] * x + ahead[i] * y + up[i] * z);
  const local = (p) => {
    const d = p.map((v, i) => v - origin[i]);
    return [dot(d, right), dot(d, ahead), dot(d, up)];
  };
  const surface = (dir) => RADIUS + Math.max(ground(dir), SEA);
  const groundAt = (x, y) => {
    const dir = unit(point(x, y));
    return local(dir.map((v) => v * surface(dir)))[2];
  };
  const wetAt = (x, y) => ground(unit(point(x, y))) < SEA;
  const depthAt = (x, y) => Math.max(0, SEA - ground(unit(point(x, y))));
  return { origin, up, right, ahead, heading, base, point, local, groundAt, wetAt, depthAt, surface };
}, groundHit = (origin, direction, ground = groundElevation) => {
  const above = (t) => {
    const point = origin.map((v, i) => v + direction[i] * t);
    return Math.hypot(...point) - RADIUS - Math.max(ground(unit(point)), SEA);
  };
  let previous = 0;
  for (let t = Math.max(0.25, above(0) * 0.4);t < 5000; ) {
    if (above(t) < 0) {
      let [a, b] = [previous, t];
      for (let i = 0;i < 20; i++) {
        const mid = (a + b) / 2;
        if (above(mid) < 0)
          b = mid;
        else
          a = mid;
      }
      return origin.map((v, i) => v + direction[i] * b);
    }
    previous = t;
    t += Math.max(0.25, above(t) * 0.4);
  }
  return null;
}, placeOf = (where, ground = groundElevation) => {
  const text = String(where).trim();
  const query = new URLSearchParams(text.includes("?") ? text.slice(text.indexOf("?") + 1).split("#")[0] : text.includes("=") ? text : "");
  const numbers = (name) => query.get(name)?.split(",").map(Number);
  const onGround = (point) => {
    const dir = unit(point);
    return dir.map((v) => v * (RADIUS + Math.max(ground(dir), SEA)));
  };
  const towards = (from, direction) => {
    const { north, east } = axesAt(unit(from));
    return wrap(Math.atan2(dot(direction, east), dot(direction, north)) / DEG);
  };
  const walk = numbers("walk");
  if (walk?.length >= 5 && walk.slice(0, 5).every(Number.isFinite))
    return { at: onGround(walk.slice(0, 3)), heading: round(wrap(walk[4]), 2), from: "walk: the avatar's feet, facing the way its camera looks" };
  const pos = numbers("pos"), target = numbers("target");
  if (pos?.length === 3 && pos.every(Number.isFinite)) {
    const direction = target?.length === 3 && target.every(Number.isFinite) ? unit(target.map((v, i) => v - pos[i])) : unit(pos).map((v) => -v);
    const hit = groundHit(pos, direction, ground);
    const at = hit ?? onGround(pos);
    return { at, heading: round(towards(at, direction), 2), from: hit ? "pos and target: the ground the camera looks at, facing the way it looks" : "pos: the ground under the camera" };
  }
  if (query.has("lat") && query.has("lon")) {
    const lat = Number(query.get("lat")), lon = Number(query.get("lon"));
    if (Number.isFinite(lat) && Number.isFinite(lon))
      return { at: onGround(fromLatLon(lat, lon)), heading: 0, from: "lat, lon: the ground under them, facing north" };
  }
  const values = text.split(",").map(Number);
  if (values.length === 3 && values.every(Number.isFinite))
    return { at: onGround(values), heading: 0, from: "x, y, z: the ground under that point, facing north" };
  if (values.length === 2 && values.every(Number.isFinite))
    return { at: onGround(fromLatLon(...values)), heading: 0, from: "lat, lon: the ground under them, facing north" };
  throw new Error(`no place in "${text.slice(0, 80)}": give a URL of the world (walk, pos and target, or lat and lon), x,y,z or lat,lon`);
}, profile = (frame, from, to, step = 1) => {
  const length = Math.hypot(to[0] - from[0], to[1] - from[1]);
  const count = Math.max(1, Math.round(length / step));
  const points = Array.from({ length: count + 1 }, (_, k) => {
    const x = from[0] + (to[0] - from[0]) * k / count, y = from[1] + (to[1] - from[1]) * k / count;
    return [round(x), round(y), round(frame.groundAt(x, y))];
  });
  const lowest = points.reduce((low, p) => p[2] < low[2] ? p : low), highest = points.reduce((high, p) => p[2] > high[2] ? p : high);
  return { length: round(length, 1), points, lowest, highest, wet: points.some(([x, y]) => frame.wetAt(x, y)) };
}, linesOf = (set, size, pointOf) => {
  const seen = new Set, found = [];
  for (const start of set) {
    if (seen.has(start))
      continue;
    const members = [], queue = [start];
    seen.add(start);
    while (queue.length) {
      const k = queue.pop();
      members.push(k);
      const i = k % size, j = Math.floor(k / size);
      for (let dj = -1;dj <= 1; dj++)
        for (let di = -1;di <= 1; di++) {
          const next = (j + dj) * size + (i + di);
          if (i + di >= 0 && i + di < size && j + dj >= 0 && j + dj < size && set.has(next) && !seen.has(next)) {
            seen.add(next);
            queue.push(next);
          }
        }
    }
    if (members.length < 4)
      continue;
    const points = members.map(pointOf);
    let ends = [points[0], points[0]], far = -1;
    for (const p of points)
      for (const q of points) {
        const d = Math.hypot(p[0] - q[0], p[1] - q[1]);
        if (d > far)
          [far, ends] = [d, [p, q]];
      }
    const zs = points.map((p) => p[2]);
    found.push({ from: ends[0], to: ends[1], length: round(far, 1), points: points.length, high: Math.max(...zs), low: Math.min(...zs) });
  }
  return found.filter((line) => line.length >= 2 * REACH).sort((a, b) => b.length - a.length).slice(0, 8);
}, hullOf = (points) => {
  const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const turn = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const half = (list) => list.reduce((chain, p) => {
    while (chain.length >= 2 && turn(chain.at(-2), chain.at(-1), p) <= 0)
      chain.pop();
    chain.push(p);
    return chain;
  }, []);
  const lower = half(sorted), upper = half([...sorted].reverse());
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}, insideHull = (hull, x, y) => hull.length > 2 && hull.every((p, e) => {
  const q = hull[(e + 1) % hull.length];
  return (q[0] - p[0]) * (y - p[1]) - (q[1] - p[1]) * (x - p[0]) >= 0;
}), rotate = (q, v) => {
  const [x, y, z, w] = q;
  const t = [2 * (y * v[2] - z * v[1]), 2 * (z * v[0] - x * v[2]), 2 * (x * v[1] - y * v[0])];
  return [v[0] + w * t[0] + y * t[2] - z * t[1], v[1] + w * t[1] + z * t[0] - x * t[2], v[2] + w * t[2] + x * t[1] - y * t[0]];
}, surveySite = ({ at, heading = 0, radius = 60, step = 2, records = [], name = "Site", ground = groundElevation }) => {
  const frame = frameAt(at, heading, ground);
  const n = Math.round(radius / step), size = 2 * n + 1;
  const xOf = (i) => (i - n) * step, yOf = (j) => (n - j) * step;
  const heights = [], water = [], depths = [];
  for (let j = 0;j < size; j++) {
    heights.push(Array.from({ length: size }, (_, i) => round(frame.groundAt(xOf(i), yOf(j)))));
    water.push(Array.from({ length: size }, (_, i) => frame.wetAt(xOf(i), yOf(j)) ? 1 : 0));
    depths.push(Array.from({ length: size }, (_, i) => round(frame.depthAt(xOf(i), yOf(j)), 1)));
  }
  const h = (i, j) => heights[j][i];
  const inside = (i, j) => i >= 0 && j >= 0 && i < size && j < size;
  const slopes = heights.map((row, j) => row.map((height, i) => {
    let steepest = 0;
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]])
      if (inside(i + di, j + dj))
        steepest = Math.max(steepest, Math.abs(height - h(i + di, j + dj)) / step);
    return round(Math.atan(steepest) / DEG, 1);
  }));
  const k = Math.max(1, Math.round(REACH / step));
  const LINES = [[1, 0], [0, 1], [1, 1], [1, -1]];
  const ridge = new Set, valley = new Set, peaks = [], pits = [];
  for (let j = k;j < size - k; j++) {
    for (let i = k;i < size - k; i++) {
      const here = h(i, j);
      const sides = LINES.map(([a, b]) => [h(i + a * k, j + b * k), h(i - a * k, j - b * k)]);
      if (!water[j][i] && sides.some(([p, q]) => here - p > RISE && here - q > RISE))
        ridge.add(j * size + i);
      if (sides.some(([p, q]) => p - here > RISE && q - here > RISE))
        valley.add(j * size + i);
      const around = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]].map(([a, b]) => h(i + a, j + b));
      if (around.every((v) => here > v) && sides.some(([p, q]) => here - p > RISE && here - q > RISE))
        peaks.push([xOf(i), yOf(j), here]);
      if (around.every((v) => here < v) && sides.some(([p, q]) => p - here > RISE && q - here > RISE))
        pits.push([xOf(i), yOf(j), here]);
    }
  }
  const pointOf = (index) => [xOf(index % size), yOf(Math.floor(index / size)), h(index % size, Math.floor(index / size))];
  const byId = new Map(records.map((record) => [record.id, record]));
  const built = heights.map((row) => row.map(() => 0));
  const cornersOf = (part, place) => [-1, 1].flatMap((sx) => [-1, 1].flatMap((sy) => [-1, 1].map((sz) => {
    const local = rotate(part.rotation, [sx * part.size[0] / 2, sy * part.size[1] / 2, sz * part.size[2] / 2]).map((v, i) => v + part.at[i]);
    return frame.local(place ? rotate(place.rotation, local).map((v, i) => v + place.at[i]) : local);
  })));
  const mark = (corners) => {
    const hull = hullOf(corners.map(([x, y]) => [x, y]));
    const top = Math.max(...corners.map((c) => c[2]));
    const cell = (x, y) => {
      const i = Math.round(x / step) + n, j = n - Math.round(y / step);
      if (inside(i, j))
        built[j][i] = Math.max(built[j][i], round(top - h(i, j), 1));
    };
    hull.forEach((p, e) => {
      const q = hull[(e + 1) % hull.length], count = Math.ceil(Math.hypot(q[0] - p[0], q[1] - p[1]) / (step / 2));
      for (let s = 0;s <= count; s++)
        cell(p[0] + (q[0] - p[0]) * s / Math.max(count, 1), p[1] + (q[1] - p[1]) * s / Math.max(count, 1));
    });
    const xs = hull.map((p) => p[0]), ys = hull.map((p) => p[1]);
    for (let x = Math.min(...xs);x <= Math.max(...xs); x += step / 2)
      for (let y = Math.min(...ys);y <= Math.max(...ys); y += step / 2)
        if (insideHull(hull, x, y))
          cell(x, y);
  };
  const near = ([x, y]) => Math.hypot(x, y) <= radius * 1.5;
  const builds = [];
  for (const record of records) {
    const object = record.type === "object" ? record : record.type === "instance" ? byId.get(record.of) : null;
    const parts = object ? records.filter((part) => part.type === "prim" && part.object === object.id) : record.type === "prim" && !record.object ? [record] : [];
    if (!parts.length)
      continue;
    const corners = parts.map((part) => cornersOf(part, object ? record : null));
    const all = corners.flat();
    const min = [0, 1, 2].map((axis) => Math.min(...all.map((c) => c[axis]))), max = [0, 1, 2].map((axis) => Math.max(...all.map((c) => c[axis])));
    const box = { centre: min.map((v, axis) => round((v + max[axis]) / 2)), size: min.map((v, axis) => round(max[axis] - v)) };
    if (!near(box.centre))
      continue;
    corners.forEach(mark);
    const kinds = [...new Set(parts.map((part) => part.kind).filter(Boolean))];
    builds.push({
      id: record.id,
      ...record.type === "instance" && { cloneOf: object.id },
      name: object?.name ?? null,
      owner: record.owner ?? null,
      ...box,
      parts: parts.length,
      ...kinds.length && { kinds },
      ...parts.some((part) => part.light) && { lights: parts.filter((part) => part.light).length },
      ...parts.some((part) => part.particles) && { emitters: parts.filter((part) => part.particles).length },
      ...parts.some((part) => part.behaviour) && { moving: true }
    });
  }
  const trees = records.filter((record) => record.type === "tree").map((tree) => ({ id: tree.id, species: tree.species, at: frame.local(tree.at).map((v) => round(v)), seed: tree.seed, scale: tree.scale })).filter((tree) => near(tree.at));
  const animals = records.filter((record) => record.type === "herd").map((herd) => ({ id: herd.id, species: herd.species, at: frame.local(herd.at).map((v) => round(v)), ...herd.count !== undefined && { count: herd.count }, seed: herd.seed, ...herd.territory !== undefined && { territory: herd.territory } })).filter((herd) => near(herd.at));
  const flat = heights.flat(), steep = slopes.flat(), wet = water.flat().reduce((sum, v) => sum + v, 0) / flat.length;
  return {
    name,
    note: `The ground round the anchor, in a build's frame (x right, y ahead, z up, metres; z = 0 the ground at the centre). heights[j][i], slopes[j][i] (degrees), built[j][i] (how high what is built stands over the ground there; 0 free) and, where there is sea, water[j][i] (1 under it) and depths[j][i] (how deep it is, m) are at x = ${-radius} + ${step}·i, y = ${radius} − ${step}·j: rows from the far edge to the near one, as a map reads. A build written for this site takes its anchor as it is, exact; the drawn ground may differ from these heights by up to 0.7 m — sink what stands on it that much.`,
    anchor: { at: frame.origin.map((v) => round(v, 3)), heading: round(heading, 2), exact: true },
    latLon: latLonOf(frame.origin),
    elevation: round(frame.base - RADIUS - SEA, 2),
    radius,
    step,
    summary: {
      low: Math.min(...flat),
      high: Math.max(...flat),
      steepest: Math.max(...steep),
      flat: round(steep.filter((s) => s < 5).length / steep.length, 2),
      wet: round(wet, 2),
      ...wet && { deepest: Math.max(...depths.flat()) },
      builds: builds.length,
      trees: trees.length,
      ...animals.length && { herds: animals.length }
    },
    peaks: peaks.sort((a, b) => b[2] - a[2]).slice(0, 12),
    pits: pits.sort((a, b) => a[2] - b[2]).slice(0, 12),
    ridges: linesOf(ridge, size, pointOf),
    valleys: linesOf(valley, size, pointOf),
    builds,
    trees,
    ...animals.length && { animals },
    heights,
    slopes,
    ...wet && { water, depths },
    ...builds.length && { built }
  };
}, surveyMap = (survey, { contour = 1, pixels = 720 } = {}) => {
  const { heights, radius, summary } = survey;
  const size = heights.length, cell = pixels / size;
  const metres = pixels / (2 * radius);
  const px = (x) => round((x + radius) * metres, 1), py = (y) => round(pixels - (y + radius) * metres, 1);
  const span = Math.max(summary.high - summary.low, 0.000001);
  const shade = (height) => {
    const t = (height - summary.low) / span;
    return `rgb(${Math.round(70 + 120 * t)},${Math.round(95 + 110 * t)},${Math.round(60 + 70 * t)})`;
  };
  const cells = [];
  for (let j = 0;j < size; j++)
    for (let i = 0;i < size; i++) {
      cells.push(`<rect x="${round(i * cell, 1)}" y="${round(j * cell, 1)}" width="${round(cell + 0.5, 1)}" height="${round(cell + 0.5, 1)}" fill="${survey.water?.[j][i] ? "#2a5d86" : shade(heights[j][i])}"/>`);
    }
  const paths = [];
  const levels = Math.min(400, Math.floor(span / contour));
  for (let level = Math.ceil(summary.low / contour) * contour, count = 0;level <= summary.high && count <= levels; level += contour, count++) {
    const segments = [];
    for (let j = 0;j < size - 1; j++)
      for (let i = 0;i < size - 1; i++) {
        const corners = [[i, j], [i + 1, j], [i + 1, j + 1], [i, j + 1]].map(([a, b]) => [a, b, heights[b][a]]);
        const crossings = [];
        for (let c = 0;c < 4; c++) {
          const [a, b] = [corners[c], corners[(c + 1) % 4]];
          if (a[2] < level !== b[2] < level) {
            const t = (level - a[2]) / (b[2] - a[2]);
            crossings.push([(a[0] + (b[0] - a[0]) * t + 0.5) * cell, (a[1] + (b[1] - a[1]) * t + 0.5) * cell]);
          }
        }
        for (let c = 0;c + 1 < crossings.length; c += 2)
          segments.push(`M${round(crossings[c][0], 1)} ${round(crossings[c][1], 1)}L${round(crossings[c + 1][0], 1)} ${round(crossings[c + 1][1], 1)}`);
      }
    const bold = Math.round(level / contour) % 5 === 0;
    if (segments.length)
      paths.push(`<path d="${segments.join("")}" stroke="rgba(30,30,20,${bold ? 0.55 : 0.25})" stroke-width="${bold ? 1.2 : 0.6}" fill="none"/>`);
  }
  const escape = (text) => String(text).replace(/[<&>"]/g, (c) => `&#${c.charCodeAt(0)};`);
  const line = ({ from, to }, colour) => `<line x1="${px(from[0])}" y1="${py(from[1])}" x2="${px(to[0])}" y2="${py(to[1])}" stroke="${colour}" stroke-width="2.5" stroke-dasharray="6 4"/>`;
  const features = [
    ...survey.ridges.map((ridge) => line(ridge, "#8a4b14")),
    ...survey.valleys.map((valley) => line(valley, "#1d5fa0")),
    ...survey.peaks.slice(0, 6).map(([x, y, z]) => `<circle cx="${px(x)}" cy="${py(y)}" r="4" fill="#8a4b14"/><text x="${px(x) + 6}" y="${py(y) - 6}" font-size="11" fill="#2b1a0a">${z} m</text>`)
  ];
  const built = [
    ...(survey.built ?? []).flatMap((row, j) => row.map((tall, i) => tall > 0.05 ? `<rect x="${round(i * cell, 1)}" y="${round(j * cell, 1)}" width="${round(cell + 0.5, 1)}" height="${round(cell + 0.5, 1)}" fill="${tall < 0.6 ? "rgba(225,215,195,0.7)" : `rgba(${Math.round(190 - 12 * Math.min(tall, 8))},${Math.round(170 - 12 * Math.min(tall, 8))},${Math.round(150 - 10 * Math.min(tall, 8))},0.85)`}"/>` : "")),
    ...survey.builds.filter((build) => build.name && build.parts > 1).map(({ centre: [cx, cy], name }) => `<text x="${px(cx)}" y="${py(cy)}" font-size="10" text-anchor="middle" fill="#1a1208">${escape(name)}</text>`)
  ];
  const planted = survey.trees.map((tree) => `<circle cx="${px(tree.at[0])}" cy="${py(tree.at[1])}" r="${round(Math.max(2, 2 * (tree.scale ?? 1) * metres), 1)}" fill="#1f5a1f" stroke="#0d300d" stroke-width="0.6"/>`);
  const bar = Math.max(5, Math.round(radius / 15) * 5);
  const marks = [
    `<line x1="${px(0)}" y1="${py(0)}" x2="${px(radius / 4)}" y2="${py(0)}" stroke="#c02020" stroke-width="2"/><text x="${px(radius / 4) + 4}" y="${py(0) + 4}" font-size="12" fill="#c02020">x</text>`,
    `<line x1="${px(0)}" y1="${py(0)}" x2="${px(0)}" y2="${py(radius / 4)}" stroke="#20a020" stroke-width="2"/><text x="${px(0) + 4}" y="${py(radius / 4) - 4}" font-size="12" fill="#20a020">y, ahead</text>`,
    `<rect x="12" y="${pixels - 30}" width="${round(bar * metres, 1)}" height="6" fill="#111"/><text x="12" y="${pixels - 36}" font-size="12" fill="#111">${bar} m</text>`,
    `<text x="${pixels - 12}" y="20" font-size="12" text-anchor="end" fill="#111">${escape(survey.name)}: ${summary.low} to ${summary.high} m, contours every ${contour} m, heading ${survey.anchor.heading}°</text>`
  ];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${pixels}" height="${pixels}" viewBox="0 0 ${pixels} ${pixels}"><g shape-rendering="crispEdges">${cells.join("")}${built.join("")}</g>${paths.join("")}${features.join("")}${planted.join("")}${marks.join("")}</svg>
`;
}, surveyText = (survey) => {
  const grids = ["heights", "slopes", "water", "depths"];
  const rest = Object.entries(survey).filter(([key, value]) => !grids.includes(key) && value !== undefined);
  const lines = rest.map(([key, value]) => `  ${JSON.stringify(key)}: ${["builds", "trees", "animals", "ridges", "valleys"].includes(key) && value.length ? `[
${value.map((item) => `    ${JSON.stringify(item)}`).join(`,
`)}
  ]` : JSON.stringify(value)}`);
  for (const key of grids)
    if (survey[key])
      lines.push(`  ${JSON.stringify(key)}: [
${survey[key].map((row) => `    ${JSON.stringify(row)}`).join(`,
`)}
  ]`);
  return `{
${lines.join(`,
`)}
}
`;
}, surveyImage = (survey, { contour = 1, pixels = 720 } = {}) => {
  const { heights, radius, step, summary } = survey;
  const size = heights.length, metres = pixels / (2 * radius);
  const rgb = new Uint8Array(pixels * pixels * 3);
  const heightAt = (x, y) => {
    const gi = Math.min(Math.max((x + radius) / step, 0), size - 1.001), gj = Math.min(Math.max((radius - y) / step, 0), size - 1.001);
    const i = Math.floor(gi), j = Math.floor(gj), u = gi - i, v = gj - j;
    return (heights[j][i] * (1 - u) + heights[j][i + 1] * u) * (1 - v) + (heights[j + 1][i] * (1 - u) + heights[j + 1][i + 1] * u) * v;
  };
  const wetAt = (x, y) => survey.water?.[Math.round((radius - y) / step)]?.[Math.round((x + radius) / step)] === 1;
  const field = new Float32Array(pixels * pixels);
  for (let py = 0;py < pixels; py++)
    for (let px = 0;px < pixels; px++)
      field[py * pixels + px] = heightAt((px + 0.5) / metres - radius, radius - (py + 0.5) / metres);
  const span = Math.max(summary.high - summary.low, 0.000001), light = unit([-1, 1, 1.5]);
  const set = (px, py, colour, alpha = 1) => {
    if (px < 0 || py < 0 || px >= pixels || py >= pixels)
      return;
    const k = (py * pixels + px) * 3;
    for (let c = 0;c < 3; c++)
      rgb[k + c] = Math.round(rgb[k + c] * (1 - alpha) + colour[c] * alpha);
  };
  for (let py = 0;py < pixels; py++) {
    for (let px = 0;px < pixels; px++) {
      const k = py * pixels + px, h = field[k];
      if (wetAt((px + 0.5) / metres - radius, radius - (py + 0.5) / metres)) {
        set(px, py, [42, 93, 134]);
        continue;
      }
      const east = field[k + (px < pixels - 1 ? 1 : 0)] - field[k - (px > 0 ? 1 : 0)], south = field[k + (py < pixels - 1 ? pixels : 0)] - field[k - (py > 0 ? pixels : 0)];
      const normal = unit([-east * metres / 2, south * metres / 2, 1]);
      const lit = 0.72 + 0.4 * Math.max(0, dot(normal, light));
      const t = (h - summary.low) / span;
      set(px, py, [(70 + 120 * t) * lit, (95 + 110 * t) * lit, (60 + 70 * t) * lit].map((c) => Math.min(255, c)));
      const level = Math.floor(h / contour);
      const crossed = px < pixels - 1 && Math.floor(field[k + 1] / contour) !== level || py < pixels - 1 && Math.floor(field[k + pixels] / contour) !== level;
      if (crossed)
        set(px, py, [30, 30, 20], Math.max(level, Math.floor(field[k + 1] / contour)) % 5 === 0 ? 0.6 : 0.28);
    }
  }
  const toPixel = (x, y) => [(x + radius) * metres, (radius - y) * metres];
  const disc = (x, y, r, colour, alpha = 1) => {
    const [cx, cy] = toPixel(x, y);
    for (let dy = -Math.ceil(r);dy <= r; dy++)
      for (let dx = -Math.ceil(r);dx <= r; dx++)
        if (dx * dx + dy * dy <= r * r)
          set(Math.round(cx + dx), Math.round(cy + dy), colour, alpha);
  };
  const segment = (from, to, colour, { width = 1, dash = 0 } = {}) => {
    const [ax, ay] = toPixel(...from), [bx, by] = toPixel(...to);
    const length = Math.hypot(bx - ax, by - ay);
    for (let s = 0;s <= length; s += 0.5) {
      if (dash && s % (dash * 1.7) > dash)
        continue;
      const x = ax + (bx - ax) * s / Math.max(length, 0.000001), y = ay + (by - ay) * s / Math.max(length, 0.000001);
      for (let dy = -width / 2;dy <= width / 2; dy++)
        for (let dx = -width / 2;dx <= width / 2; dx++)
          set(Math.round(x + dx), Math.round(y + dy), colour);
    }
  };
  for (const ridge of survey.ridges)
    segment(ridge.from, ridge.to, [138, 75, 20], { width: 2, dash: 6 });
  for (const valley of survey.valleys)
    segment(valley.from, valley.to, [29, 95, 160], { width: 2, dash: 6 });
  for (const [x, y] of survey.peaks.slice(0, 6))
    disc(x, y, 4, [138, 75, 20]);
  survey.built?.forEach((row, j) => row.forEach((tall, i) => {
    if (tall <= 0.05)
      return;
    const [x0, y0] = toPixel(-radius + (i - 0.5) * step, radius - (j - 0.5) * step);
    const colour = tall < 0.6 ? [225, 215, 195] : [190 - 12 * Math.min(tall, 8), 170 - 12 * Math.min(tall, 8), 150 - 10 * Math.min(tall, 8)];
    for (let py = Math.round(y0);py < Math.round(y0 + step * metres); py++)
      for (let px = Math.round(x0);px < Math.round(x0 + step * metres); px++)
        set(px, py, colour, tall < 0.6 ? 0.7 : 0.85);
  }));
  for (const tree of survey.trees)
    disc(tree.at[0], tree.at[1], Math.max(2, 2 * (tree.scale ?? 1) * metres), [31, 90, 31], 0.85);
  segment([0, 0], [radius / 4, 0], [192, 32, 32], { width: 2 });
  segment([0, 0], [0, radius / 4], [32, 160, 32], { width: 2 });
  const bar = Math.max(5, Math.round(radius / 15) * 5);
  for (let py = pixels - 30;py < pixels - 24; py++)
    for (let px = 12;px < 12 + bar * metres; px++)
      set(px, py, [17, 17, 17]);
  return { width: pixels, height: pixels, rgb, bar };
};
var init_survey = __esm(() => {
  init_terrain_height();
  DEG = Math.PI / 180;
});

// src/math.js
var add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], scale = (a, s) => [a[0] * s, a[1] * s, a[2] * s], dot2 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], cross2 = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0]
], length = (a) => Math.hypot(a[0], a[1], a[2]), normalize = (a) => scale(a, 1 / length(a)), clamp = (value, min, max) => Math.min(Math.max(value, min), max), quatMultiply = (a, b) => [
  a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
  a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
  a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
  a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]
], quatAxisAngle = (axis, angle) => {
  const s = Math.sin(angle / 2);
  return [axis[0] * s, axis[1] * s, axis[2] * s, Math.cos(angle / 2)];
}, quatNormalize = (q) => {
  const l = Math.hypot(q[0], q[1], q[2], q[3]);
  return [q[0] / l, q[1] / l, q[2] / l, q[3] / l];
}, quatRotate = (q, v) => {
  const axis = [q[0], q[1], q[2]];
  const t = scale(cross2(axis, v), 2);
  return add(add(v, scale(t, q[3])), cross2(axis, t));
}, quatFromBasis = (right, up, back) => {
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
var PROFILE, HOLE, PATH, SHAPE_FIELDS, LIMITS, DEFAULT_PARAMS, CUT = 50000, roundAway = (x) => Math.sign(x) * Math.round(Math.abs(x)) + 0, clamp2 = (value, min, max) => Math.min(Math.max(value, min), max), byte, cut, cutEnd, scale2, signed, revolutions, shear, CODECS, CODEC, snap = (name, value) => CODEC[name].decode(CODEC[name].encode(value)), decodeShape = (shape) => Object.fromEntries(SHAPE_FIELDS.map((name, i) => [name, CODECS[i].decode(shape[i])])), encodeShape = (params) => SHAPE_FIELDS.map((name, i) => {
  const value = Number.isFinite(params[name]) ? params[name] : DEFAULT_PARAMS[name];
  return clamp2(CODECS[i].encode(value), CODECS[i].min, CODECS[i].max);
}), constrainParams = (input) => {
  const errors = [];
  const value = (name) => input[name] ?? DEFAULT_PARAMS[name];
  const limit = (name, v, min, max, tolerance = 0.001) => {
    if (!(v >= min - tolerance && v <= max + tolerance))
      errors.push(name);
    return Number.isFinite(v) ? clamp2(v, min, max) : clamp2(DEFAULT_PARAMS[name], min, max);
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
  const profile2 = profileCurve & 15;
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
  const squareHole = hole === HOLE.SQUARE && [PROFILE.CIRCLE, PROFILE.HALF_CIRCLE, PROFILE.EQUALTRI].includes(profile2);
  const hollow = snap("hollow", limit("hollow", value("hollow"), 0, squareHole ? LIMITS.hollowSquare : LIMITS.hollow));
  const holeSize = pathCurve === PATH.CIRCLE && profile2 !== PROFILE.HALF_CIRCLE;
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
    radiusOffset = snap("radiusOffset", clamp2(limit("radiusOffset", offset, -max, max, 0.01), -step, step));
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
}, UPRIGHT, AS_IS, preset = (params, rotation = AS_IS) => Object.freeze({ shape: Object.freeze(encodeShape({ ...DEFAULT_PARAMS, ...params })), rezRotation: rotation }), SQUARE, CIRCLE, EQUALTRI, HALF_CIRCLE, PRESETS;
var init_params = __esm(() => {
  PROFILE = Object.freeze({ CIRCLE: 0, SQUARE: 1, ISOTRI: 2, EQUALTRI: 3, RIGHTTRI: 4, HALF_CIRCLE: 5 });
  HOLE = Object.freeze({ SAME: 0, CIRCLE: 16, SQUARE: 32, TRIANGLE: 48 });
  PATH = Object.freeze({ LINE: 16, CIRCLE: 32, CIRCLE_33: 33, CIRCLE2: 48, TEST: 64, FLEXIBLE: 128 });
  SHAPE_FIELDS = Object.freeze([
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
  LIMITS = Object.freeze({
    cutGap: 0.02,
    hollow: 0.99,
    hollowSquare: 0.7,
    holeMin: 0.01
  });
  DEFAULT_PARAMS = Object.freeze({
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
  byte = { min: 0, max: 255, encode: (v) => Math.trunc(v), decode: (u) => u };
  cut = { min: 0, max: 65535, encode: (v) => roundAway(v * CUT), decode: (u) => u / CUT };
  cutEnd = { min: 0, max: 65535, encode: (v) => CUT - roundAway(v * CUT), decode: (u) => (CUT - u) / CUT };
  scale2 = { min: 0, max: 255, encode: (v) => 200 - roundAway(v * 100), decode: (u) => (200 - u) / 100 };
  signed = { min: -128, max: 127, encode: (v) => roundAway(v * 100), decode: (s) => s / 100 };
  revolutions = { min: 0, max: 255, encode: (v) => roundAway((v - 1) * 200 / 3), decode: (u) => (200 + 3 * u) / 200 };
  shear = {
    min: 0,
    max: 255,
    encode: (v) => ((s) => s < 0 ? s + 256 : s)(clamp2(roundAway(v * 100), -128, 127)),
    decode: (u) => (u < 128 ? u : u - 256) / 100
  };
  CODECS = [byte, cut, cutEnd, cut, byte, cut, cutEnd, scale2, scale2, shear, shear, signed, signed, signed, signed, signed, revolutions, signed];
  CODEC = Object.fromEntries(SHAPE_FIELDS.map((name, i) => [name, CODECS[i]]));
  UPRIGHT = Object.freeze([0, Math.SQRT1_2, 0, Math.SQRT1_2]);
  AS_IS = Object.freeze([0, 0, 0, 1]);
  ({ SQUARE, CIRCLE, EQUALTRI, HALF_CIRCLE } = PROFILE);
  PRESETS = Object.freeze({
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
});

// src/build/kinds/mesh.js
var WELD = 1e6, FLAT = 0.000000000001, sub2 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], cross3 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], unit2 = (v) => {
  const length2 = Math.hypot(v[0], v[1], v[2]);
  return length2 > FLAT ? [v[0] / length2, v[1] / length2, v[2] / length2] : [0, 0, 1];
}, area2 = (points) => points.reduce((sum, [x, y], i) => {
  const [nx, ny] = points[(i + 1) % points.length];
  return sum + x * ny - nx * y;
}, 0), turn = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), triangulate = (points, { touching = false } = {}) => {
  const order = points.map((_, i) => i);
  if (area2(points) < 0)
    order.reverse();
  const triangles = [];
  const strictly = (p, a, b, c) => turn(a, b, p) > FLAT && turn(b, c, p) > FLAT && turn(c, a, p) > FLAT;
  const corner = (p, a, b, c) => [a, b, c].some((q) => q[0] === p[0] && q[1] === p[1]);
  const inside = touching ? (p, a, b, c) => !corner(p, a, b, c) && turn(a, b, p) >= -FLAT && turn(b, c, p) >= -FLAT && turn(c, a, p) >= -FLAT : strictly;
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
}, same = (a, b) => a[0] === b[0] && a[1] === b[1], onSegment = (e, p, q) => {
  const length2 = Math.hypot(q[0] - p[0], q[1] - p[1]);
  return Math.abs(turn(p, q, e)) <= 0.000000001 * length2 * length2 && Math.min(p[0], q[0]) - 0.000000000001 <= e[0] && e[0] <= Math.max(p[0], q[0]) + 0.000000000001 && Math.min(p[1], q[1]) - 0.000000000001 <= e[1] && e[1] <= Math.max(p[1], q[1]) + 0.000000000001;
}, insidePolygon = (e, ring) => {
  let inside = false;
  for (let k = 0, j = ring.length - 1;k < ring.length; j = k++) {
    const [a, b] = [ring[k], ring[j]];
    if (onSegment(e, a, b))
      return false;
    if (a[1] > e[1] !== b[1] > e[1] && e[0] < (b[0] - a[0]) * (e[1] - a[1]) / (b[1] - a[1]) + a[0])
      inside = !inside;
  }
  return inside;
}, triangulateWithHoles = (outer, holes = []) => {
  const points = [...outer, ...holes.flat()];
  const ccw = (ring2) => area2(ring2.map((i) => points[i])) < 0 ? [...ring2].reverse() : ring2;
  const cw = (ring2) => [...ccw(ring2)].reverse();
  let first = outer.length;
  const rings = holes.map((hole) => {
    const ring2 = hole.map((_, k) => first + k);
    first += hole.length;
    return cw(ring2);
  });
  let ring = ccw(outer.map((_, i) => i));
  const right = (ring2) => Math.max(...ring2.map((i) => points[i][0]));
  for (const hole of [...rings].sort((a, b) => right(b) - right(a))) {
    const m = hole.reduce((best, i, k) => points[i][0] > points[hole[best]][0] ? k : best, 0);
    const from = points[hole[m]];
    const others = rings.filter((other) => other !== hole);
    const edges = [ring, hole, ...others].flatMap((r) => r.map((i, k) => [i, r[(k + 1) % r.length]]));
    const through = [hole, ...others].map((r) => r.map((i) => points[i]));
    const meets = (a, b, [i, j]) => {
      const [p, q] = [points[a], points[b]];
      const ends = [i, j].filter((v) => v !== a && v !== b).map((v) => points[v]);
      if (ends.length < 2)
        return ends.some((e) => same(e, p) || same(e, q) ? false : onSegment(e, p, q));
      const [r, s] = ends;
      const [d1, d2, d3, d4] = [turn(p, q, r), turn(p, q, s), turn(r, s, p), turn(r, s, q)];
      if (d1 * d2 < 0 && d3 * d4 < 0)
        return true;
      return onSegment(r, p, q) || onSegment(s, p, q) || onSegment(p, r, s) || onSegment(q, r, s);
    };
    const leaves = (r, k, point) => {
      const [at, next, back] = [r[k], r[(k + 1) % r.length], r[(k + r.length - 1) % r.length]].map((i) => points[i]);
      const [left, right2] = [turn(at, next, point) > 0, turn(at, point, back) > 0];
      return turn(at, next, back) > 0 ? left && right2 : left || right2;
    };
    let to = -1, nearest = Infinity;
    for (const [k, i] of ring.entries()) {
      const d = Math.hypot(points[i][0] - from[0], points[i][1] - from[1]);
      if (d >= nearest || same(points[i], from) || !leaves(ring, k, from) || !leaves(hole, m, points[i]))
        continue;
      const middle = [(points[i][0] + from[0]) / 2, (points[i][1] + from[1]) / 2];
      if (through.some((r) => insidePolygon(middle, r)) || edges.some((edge) => meets(hole[m], i, edge)))
        continue;
      [to, nearest] = [k, d];
    }
    if (to < 0)
      continue;
    ring = [...ring.slice(0, to + 1), ...hole.slice(m), ...hole.slice(0, m + 1), ...ring.slice(to)];
  }
  const joined = ring.map((i) => points[i]);
  return { points, triangles: triangulate(joined, { touching: true }).map((triangle) => triangle.map((k) => ring[k])) };
}, createMesh = (slots) => {
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
    let normal = unit2(points.reduce((sum, p, i) => {
      const q = points[(i + 1) % points.length];
      return [sum[0] + (p[1] - q[1]) * (p[2] + q[2]), sum[1] + (p[2] - q[2]) * (p[0] + q[0]), sum[2] + (p[0] - q[0]) * (p[1] + q[1])];
    }, [0, 0, 0]));
    if (dot3(normal, outward) < 0)
      normal = normal.map((v2) => -v2);
    const u = unit2(Math.abs(normal[2]) < 0.9 ? cross3([0, 0, 1], normal) : cross3(normal, [1, 0, 0]));
    const v = cross3(normal, u);
    const flat = points.map((p) => [dot3(p, u), dot3(p, v)]);
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
        const hash2 = Math.imul(rx | 0, 73856093) ^ Math.imul(ry | 0, 19349663) ^ Math.imul(rz | 0, 83492791) | 0;
        const head = heads.get(hash2) ?? -1;
        let same2 = head;
        while (same2 >= 0 && (rounded[same2 * 3] !== rx || rounded[same2 * 3 + 1] !== ry || rounded[same2 * 3 + 2] !== rz))
          same2 = chain[same2];
        if (same2 < 0) {
          chain[v] = head;
          heads.set(hash2, v);
          welded[v] = v;
        } else
          welded[v] = same2;
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
}, addBox = (mesh, min, max, slotOf, uvOf, place = null) => {
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
}, addBeam = (mesh, slot, from, to, up, width, height) => {
  const along = unit2(sub2(to, from));
  const side = unit2(cross3(along, up));
  const over = cross3(side, along);
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
    mesh.polygon(slot, points, outward, (p) => [dot3(sub2(p, from), along), dot3(sub2(p, from), side) + dot3(sub2(p, from), over)]);
  }
  for (const t of [0, 1]) {
    const points = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([s, h]) => point(t, s, h));
    mesh.polygon(slot, points, t ? along : along.map((v) => -v), (p) => [dot3(sub2(p, from), side), dot3(sub2(p, from), over)]);
  }
}, addExtrusion = (mesh, profile2, axis, from, to, endSlot, slotOf, uvOf) => {
  const [a, b] = [(axis + 1) % 3, (axis + 2) % 3];
  const point = ([u, v], w) => {
    const p = [0, 0, 0];
    p[axis] = w;
    p[a] = u;
    p[b] = v;
    return p;
  };
  const along = point([0, 0], 1);
  const reversed = area2(profile2) < 0;
  const ring = reversed ? [...profile2].reverse() : profile2;
  mesh.polygon(endSlot, ring.map((q) => point(q, to)), along, uvOf);
  mesh.polygon(endSlot, ring.map((q) => point(q, from)), along.map((v) => -v), uvOf);
  ring.forEach((q, i) => {
    const next = ring[(i + 1) % ring.length];
    const normal = unit2(point([next[1] - q[1], -(next[0] - q[0])], 0));
    const slot = slotOf(normal, reversed ? ring.length - 2 - i < 0 ? ring.length - 1 : ring.length - 2 - i : i);
    const corners = [point(q, from), point(next, from), point(next, to), point(q, to)];
    const [p0, p1, p2, p3] = corners.map((p) => mesh.vertex(slot, p, normal, uvOf(p, normal, slot)));
    mesh.quad(slot, p0, p1, p2, p3);
  });
}, addPrism = (mesh, profile2, x0, x1, endSlot, slotOf, uvOf) => addExtrusion(mesh, profile2, 0, x0, x1, endSlot, slotOf, uvOf), remembered = (measure, keep = 16) => {
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
}, solidBox = (min, max, rotation = null) => {
  const half = max.map((v, k) => (v - min[k]) / 2);
  return { type: "box", half, radius: Math.min(0.01, ...half), at: min.map((v, k) => (v + max[k]) / 2), ...rotation && { rotation } };
}, WINDOW_MARK = 1024, marked = (uvOf) => (p, n, slot) => {
  const [u, v] = uvOf(p, n, slot);
  return [u + WINDOW_MARK, v];
}, boxUv = (p, n, origin, across, up) => {
  const x = p[0] - origin[0], y = p[1] - origin[1], z = p[2] - origin[2];
  const ax = Math.abs(n[0]), ay = Math.abs(n[1]), az = Math.abs(n[2]);
  if (az >= ax && az >= ay)
    return n[2] > 0 ? [x / across, y / up] : [x / across, -y / up];
  if (ay >= ax)
    return n[1] < 0 ? [x / across, z / up] : [-x / across, z / up];
  return n[0] > 0 ? [y / across, z / up] : [-y / across, z / up];
};
var init_mesh = () => {};

// src/build/kinds/ready.js
var HERE, listeners, keys, kinds, told = false, flush = () => {
  if (!told)
    return;
  const [recipes, names] = [keys, kinds];
  keys = new Set;
  kinds = new Set;
  told = false;
  for (const listener of listeners) {
    try {
      listener(recipes, names);
    } catch (error) {
      console.error("told what came:", error);
    }
  }
}, soon = () => {
  if (told)
    return;
  told = true;
  if (globalThis.requestAnimationFrame && !HERE)
    requestAnimationFrame(flush);
  else
    queueMicrotask(flush);
}, tellRecipe = (key) => {
  if (keys)
    key === null ? keys = null : keys.add(key);
  soon();
}, tellKind = (name) => {
  kinds.add(name);
  told = true;
  queueMicrotask(flush);
};
var init_ready = __esm(() => {
  HERE = Boolean(globalThis.Bun || globalThis.process?.versions?.node);
  listeners = new Set;
  keys = new Set;
  kinds = new Set;
});

// src/build/kinds/rock.js
var BOX, FORMS, BOULDER, CRAG, LAYERED, PILE, CRYSTALS, PASSAGE, OUTCROP, SIDES, CRAG_SIDES, BAND_SIDES, STONE_SIDES, PRISM_SIDES, PRISMS_DRAWN, STONE_UNDER, PIECE_SIDES, FINEST = 3, DEG2, KEEP = 64, kept, keptAs = (key, make) => {
  if (kept.has(key))
    return kept.get(key);
  const value = make();
  kept.set(key, value);
  if (kept.size > KEEP)
    kept.delete(kept.keys().next().value);
  return value;
}, hash2 = (x, y, z, seed) => {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(z, 1274126177) + Math.imul(seed, 1442695041) | 0;
  h = Math.imul(h ^ h >>> 13, 1274126177);
  return ((h ^ h >>> 16) >>> 0) / 4294967296;
}, noise = (x, y, z, seed) => {
  const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
  let fx = x - ix, fy = y - iy, fz = z - iz;
  fx = fx * fx * (3 - 2 * fx);
  fy = fy * fy * (3 - 2 * fy);
  fz = fz * fz * (3 - 2 * fz);
  const a = hash2(ix, iy, iz, seed), b = hash2(ix + 1, iy, iz, seed), c = hash2(ix, iy + 1, iz, seed), d = hash2(ix + 1, iy + 1, iz, seed);
  const e = hash2(ix, iy, iz + 1, seed), f = hash2(ix + 1, iy, iz + 1, seed), g = hash2(ix, iy + 1, iz + 1, seed), h = hash2(ix + 1, iy + 1, iz + 1, seed);
  const near = a + (b - a) * fx + (c + (d - c) * fx - a - (b - a) * fx) * fy;
  const far = e + (f - e) * fx + (g + (h - g) * fx - e - (f - e) * fx) * fy;
  return (near + (far - near) * fz) * 2 - 1;
}, fbm2 = (x, y, z, seed, octaves, gain) => {
  let sum = 0, amplitude = 1, scale4 = 1;
  for (let i = 0;i < octaves; i++, amplitude *= gain, scale4 *= 2.03)
    sum += amplitude * noise(x * scale4, y * scale4, z * scale4, seed + i * 7919);
  return sum;
}, randomOf = (seed) => () => {
  seed = seed + 1831565813 | 0;
  let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
}, normalized = ([x, y, z]) => {
  const length2 = Math.hypot(x, y, z) || 1;
  return [x / length2, y / length2, z / length2];
}, crossOf = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], BODIES, sampled = ({ roughness, elongation }, seed, n, floor, body = BODIES[BOULDER]) => {
  const stretch = 1 + 2 * elongation;
  const random = randomOf(seed);
  const chips = new Float64Array(4 * (body.chips[0] + Math.round(body.chips[1] * roughness)));
  for (let c = 0;c < chips.length; c += 4) {
    const z = body.ribs ? random() < 0.7 ? (random() * 2 - 1) * 0.25 : 0.55 + random() * 0.45 : random() * 2 - 1;
    const angle = random() * 2 * Math.PI, r = Math.sqrt(1 - z * z);
    chips[c] = r * Math.cos(angle);
    chips[c + 1] = r * Math.sin(angle);
    chips[c + 2] = z;
    chips[c + 3] = 0.5 * Math.hypot(chips[c] * stretch, chips[c + 1], chips[c + 2]) * (1 - (body.depth[0] + random() * body.depth[1]) * (0.6 + 0.8 * roughness));
  }
  const lumps = 0.14 + 0.1 * roughness, rough = 0.06 * roughness;
  const points = new Float64Array((n + 1) * n * 3);
  for (let row = 0, o = 0;row <= n; row++) {
    const polar = row / n * Math.PI, along = Math.cos(polar), across = Math.sin(polar);
    for (let column = 0;column < n; column++, o += 3) {
      const round2 = column / n * 2 * Math.PI;
      const dx = along, dy = across * Math.cos(round2), dz = across * Math.sin(round2);
      const blocky = 1 - body.square + body.square / Math.cbrt(Math.abs(dx) ** 3 + Math.abs(dy) ** 3 + Math.abs(dz) ** 3);
      const ribs = body.ribs ? body.ribs * roughness * noise(dx * 8 + 5, dy * 8 + 5, dz * 1.1 + 5, seed + 211) : 0;
      const radius = 0.5 * blocky * (1 + lumps * fbm2(dx * 1.6 + 11, dy * 1.6 + 11, dz * body.upright + 11, seed, 3, 0.5) + rough * fbm2(dx * 7 + 3, dy * 7 + 3, dz * 7 + 3, seed + 101, 2, 0.6) + ribs);
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
}, boundsOf = (points) => {
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0;i < points.length; i += 3) {
    for (let k = 0;k < 3; k++) {
      min[k] = Math.min(min[k], points[i + k]);
      max[k] = Math.max(max[k], points[i + k]);
    }
  }
  return { min, max };
}, intoBox = (points, { min, max }) => {
  for (let i = 0;i < points.length; i += 3) {
    for (let k = 0;k < 3; k++)
      points[i + k] = Math.min(Math.max((points[i + k] - min[k]) / (max[k] - min[k]) - 0.5, -0.5), 0.5);
  }
  return points;
}, coverOf = (cover, { min, max }) => {
  if (!(cover > 0))
    return () => 0;
  const reach = min.map((v, k) => max[k] - v || 1), least = 1 - 1.25 * cover;
  return ([x, y, z]) => {
    const bx = x / reach[0], by = y / reach[1], bz = z / reach[2];
    return bz / (Math.hypot(bx, by, bz) || 1) > least ? 1 : 0;
  };
}, addGrid = (mesh, points, n, rounded, slotOf) => {
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
  for (let t = 0;t < count; t++) {
    const facet = [flat[t * 3], flat[t * 3 + 1], flat[t * 3 + 2]];
    const slot = slotOf(facet);
    const [a, b, c] = [0, 1, 2].map((k) => {
      const row = corners[t * 6 + k * 2], column = corners[t * 6 + k * 2 + 1];
      const p = pointOf(row, column), s = indexOf(row, column) * 3;
      const position = [points[p], points[p + 1], points[p + 2]];
      const length2 = Math.hypot(smooth[s], smooth[s + 1], smooth[s + 2]) || 1;
      const shade = [0, 1, 2].map((i) => facet[i] * (1 - rounded) + smooth[s + i] / length2 * rounded);
      const norm = Math.hypot(...shade) || 1;
      return mesh.vertex(slot, position, shade.map((v) => v / norm), boxUv(position, facet, BOX, 1, 1));
    });
    mesh.triangle(slot, a, b, c);
  }
}, addFacet = (mesh, slotOf, a, b, c) => {
  const facet = normalized(crossOf([b[0] - a[0], b[1] - a[1], b[2] - a[2]], [c[0] - a[0], c[1] - a[1], c[2] - a[2]]));
  const slot = slotOf(facet);
  mesh.triangle(slot, ...[a, b, c].map((p) => mesh.vertex(slot, p, facet, boxUv(p, facet, BOX, 1, 1))));
}, bodyBox = (params, seed) => keptAs(`body|${params.form}|${seed}|${params.roughness}|${params.elongation}|${params.base}`, () => {
  const body = BODIES[params.form];
  const points = sampled(params, seed, (params.form === CRAG ? CRAG_SIDES : SIDES)[FINEST], -Infinity, body);
  let low = Infinity;
  for (let i = 2;i < points.length; i += 3)
    low = Math.min(low, points[i]);
  const floor = low * (1 - params.base);
  for (let i = 2;i < points.length; i += 3)
    points[i] = Math.max(points[i], floor);
  return { floor, ...boundsOf(points) };
}), bodyMesh = (params, seed, level) => {
  const n = (params.form === CRAG ? CRAG_SIDES : SIDES)[level];
  const box = bodyBox(params, seed);
  const points = intoBox(sampled(params, seed, n, box.floor, BODIES[params.form]), box);
  const mesh = createMesh(2);
  addGrid(mesh, points, n, params.edges, coverOf(params.cover, box));
  return mesh.pack([1, 1, 1]);
}, bandsOf = ({ layers, roughness }, seed) => keptAs(`bands|${seed}|${layers}|${roughness}`, () => {
  const random = randomOf(seed ^ 739982445);
  const thick = Array.from({ length: layers }, () => 0.6 + random() * 0.8);
  const total = thick.reduce((sum, t) => sum + t, 0);
  let to = 0;
  return thick.map((t) => {
    const from = to;
    to += t / total;
    const worn = (0.05 + 0.25 * random()) * (0.4 + 0.6 * roughness);
    return {
      from,
      to,
      scale: (1 - worn) * (1 - 0.22 * (from + to) / 2),
      under: 0.9 + 0.1 * random(),
      shift: [(random() - 0.5) * 0.12 * roughness, (random() - 0.5) * 0.12 * roughness],
      turn: (random() - 0.5) * 0.5
    };
  });
}), ringsOf = (params, seed, n, bulge) => {
  const { roughness, elongation, edges } = params;
  const stretch = 1 + 2 * elongation, lumps = 0.12 + 0.12 * roughness;
  const rings = [];
  bandsOf(params, seed).forEach((band, b) => {
    const rows = bulge ? [[band.from, band.under], [(band.from + band.to) / 2, 1 + 0.06 * edges], [band.to, 1]] : [[band.from, band.under], [band.to, 1]];
    rows.forEach(([z, widen], r) => {
      const points = new Float64Array(n * 3);
      for (let j = 0;j < n; j++) {
        const angle = j / n * 2 * Math.PI, c = Math.cos(angle + band.turn), s = Math.sin(angle + band.turn);
        const square = 0.6 + 0.4 / Math.cbrt(Math.abs(c) ** 3 + Math.abs(s) ** 3);
        const outline = square * (1 + lumps * fbm2(c * 1.3 + 7, s * 1.3 + 7, (band.from + band.to) * 1.6, seed, 2, 0.5));
        const radius = 0.5 * band.scale * widen * outline * (1 + 0.05 * roughness * noise(c * 5 + 2, s * 5 + 2, z * 7, seed + 31));
        points[j * 3] = (band.shift[0] + radius * Math.cos(angle)) * stretch;
        points[j * 3 + 1] = band.shift[1] + radius * Math.sin(angle);
        points[j * 3 + 2] = z;
      }
      rings.push({ band: b, foot: r === 0, points });
    });
  });
  return rings;
}, middleOf = (ring, rise = 0) => {
  const count = ring.points.length / 3, middle = [0, 0, ring.points[2] + rise];
  for (let i = 0;i < ring.points.length; i += 3) {
    middle[0] += ring.points[i] / count;
    middle[1] += ring.points[i + 1] / count;
  }
  return middle;
}, layeredMesh = (params, seed, level) => {
  const n = BAND_SIDES[level], rise = 0.03 + 0.05 * params.roughness;
  const box = keptAs(`layered|${seed}|${params.layers}|${params.roughness}|${params.elongation}|${params.edges}`, () => {
    const finest = ringsOf(params, seed, BAND_SIDES[FINEST], true);
    const all = new Float64Array(finest.length * finest[0].points.length + 3);
    finest.forEach((ring, i) => all.set(ring.points, i * ring.points.length));
    all.set(middleOf(finest.at(-1), rise), all.length - 3);
    return boundsOf(all);
  });
  const rings = ringsOf(params, seed, n, level >= 2);
  const [peak, under] = [middleOf(rings.at(-1), rise), middleOf(rings[0])].map((point) => Array.from(intoBox(new Float64Array(point), box)));
  for (const ring of rings)
    intoBox(ring.points, box);
  const at = (ring, j) => Array.from(ring.points.subarray(j % n * 3, j % n * 3 + 3));
  const slotOf = coverOf(params.cover, box);
  const mesh = createMesh(2);
  for (let r = 0;r + 1 < rings.length; r++) {
    const [low, high] = [rings[r], rings[r + 1]];
    if (low.band !== high.band)
      continue;
    const normals = Array.from({ length: n }, (_, j) => {
      const along = [0, 1, 2].map((k) => at(high, j)[k] - at(low, j)[k]);
      const round2 = [0, 1, 2].map((k) => at(low, j + 1)[k] - at(low, j + n - 1)[k]);
      return normalized(crossOf(round2, along));
    });
    for (let j = 0;j < n; j++) {
      const [a, b, c, d] = [at(low, j), at(low, j + 1), at(high, j + 1), at(high, j)];
      for (const [p, q, s, i, k, l] of [[a, b, c, j, j + 1, j + 1], [a, c, d, j, j + 1, j]]) {
        const facet = normalized(crossOf([q[0] - p[0], q[1] - p[1], q[2] - p[2]], [s[0] - p[0], s[1] - p[1], s[2] - p[2]]));
        const slot = slotOf(facet);
        const shade = (index) => normalized([0, 1, 2].map((m) => facet[m] * (1 - params.edges) + normals[index % n][m] * params.edges));
        mesh.triangle(slot, mesh.vertex(slot, p, shade(i), boxUv(p, facet, BOX, 1, 1)), mesh.vertex(slot, q, shade(k), boxUv(q, facet, BOX, 1, 1)), mesh.vertex(slot, s, shade(l), boxUv(s, facet, BOX, 1, 1)));
      }
    }
  }
  for (let r = 0;r + 1 < rings.length; r++) {
    const [low, high] = [rings[r], rings[r + 1]];
    if (low.band === high.band)
      continue;
    for (let j = 0;j < n; j++) {
      addFacet(mesh, slotOf, at(low, j), at(low, j + 1), at(high, j + 1));
      addFacet(mesh, slotOf, at(low, j), at(high, j + 1), at(high, j));
    }
  }
  const [top, bottom] = [rings.at(-1), rings[0]];
  for (let j = 0;j < n; j++) {
    addFacet(mesh, slotOf, at(top, j), at(top, j + 1), peak);
    addFacet(mesh, slotOf, at(bottom, j + 1), at(bottom, j), under);
  }
  return mesh.pack([1, 1, 1]);
}, stonesOf = ({ stones, roughness, elongation }, seed) => keptAs(`stones|${seed}|${stones}|${roughness}|${elongation}`, () => {
  const random = randomOf(seed ^ 461845907);
  const stretch = 1 + 2 * elongation;
  const sizes = Array.from({ length: stones }, () => 0.55 + 0.45 * random() ** 1.5).sort((a, b) => b - a);
  const reach = 0.45 * Math.sqrt(stones);
  const placed = [];
  for (const radius of sizes) {
    const height = radius * (0.55 + 0.25 * random());
    let best = null;
    for (let k = 0;k < 4; k++) {
      const angle = random() * 2 * Math.PI, distance = reach * Math.sqrt(random());
      const x = distance * Math.cos(angle) * stretch, y = distance * Math.sin(angle);
      let z = height;
      for (const other of placed) {
        const gap = Math.hypot(x - other.x, y - other.y) / ((radius + other.radius) * 0.85);
        if (gap < 1)
          z = Math.max(z, other.z + (height + other.height) * 0.9 * Math.sqrt(1 - gap * gap));
      }
      if (!best || z < best.z)
        best = { x, y, z };
    }
    placed.push({ ...best, radius, height, yaw: random() * 2 * Math.PI, tilt: (random() - 0.5) * 0.5, own: Math.floor(random() * 2147483647), stretch: 0.15 + 0.3 * random() });
  }
  return placed;
}), pileGrids = (params, seed, n, floor) => stonesOf(params, seed).map((stone) => {
  const points = sampled({ roughness: params.roughness, elongation: stone.stretch }, stone.own, n, -Infinity);
  const cy = Math.cos(stone.yaw), sy = Math.sin(stone.yaw), ct = Math.cos(stone.tilt), st = Math.sin(stone.tilt);
  for (let i = 0;i < points.length; i += 3) {
    const x = points[i] * 2 * stone.radius, y0 = points[i + 1] * 2 * stone.radius, z0 = points[i + 2] * 2 * stone.height;
    const y = y0 * ct - z0 * st, z = y0 * st + z0 * ct;
    points[i] = stone.x + x * cy - y * sy;
    points[i + 1] = stone.y + x * sy + y * cy;
    points[i + 2] = Math.max(stone.z + z, floor);
  }
  return points;
}), pileMesh = (params, seed, level) => {
  const n = STONE_SIDES[level];
  const box = keptAs(`pile|${seed}|${params.stones}|${params.roughness}|${params.elongation}|${params.base}`, () => {
    const stones = stonesOf(params, seed);
    const floor = params.base * 0.35 * stones.reduce((sum, stone) => sum + stone.height, 0) / stones.length;
    const grids = pileGrids(params, seed, STONE_SIDES[FINEST], floor);
    const all = new Float64Array(grids.reduce((sum, grid) => sum + grid.length, 0));
    grids.reduce((offset, grid) => (all.set(grid, offset), offset + grid.length), 0);
    return { floor, ...boundsOf(all) };
  });
  const slotOf = coverOf(params.cover, box);
  const mesh = createMesh(2);
  for (const grid of pileGrids(params, seed, n, box.floor))
    addGrid(mesh, intoBox(grid, box), n, params.edges, slotOf);
  return mesh.pack([1, 1, 1]);
}, crystalsOf = ({ crystals, roughness, elongation }, seed) => keptAs(`crystals|${seed}|${crystals}|${roughness}|${elongation}`, () => {
  const random = randomOf(seed ^ 668265263);
  const stretch = 1 + 2 * elongation, spread = 0.6 + 0.8 * roughness;
  return Array.from({ length: crystals }, (_, i) => {
    const t = crystals > 1 ? i / (crystals - 1) : 0;
    const length2 = (1 - 0.72 * t ** 0.8) * (0.85 + 0.3 * random());
    const radius = length2 * (0.13 + 0.07 * random());
    const angle = random() * 2 * Math.PI;
    const distance = 0.32 * (0.1 + 0.9 * t ** 0.7) * (0.7 + 0.3 * random());
    const fallen = t > 0.6 && random() < 0.15;
    const lean = fallen ? (75 + 12 * random()) * DEG2 : (4 + 46 * t) * (0.6 + 0.8 * random()) * spread * DEG2;
    const heading = angle + (random() - 0.5) * 0.9;
    return {
      foot: [distance * Math.cos(angle) * stretch, distance * Math.sin(angle), fallen ? radius * 0.6 : -0.12 * length2],
      axis: [Math.sin(lean) * Math.cos(heading), Math.sin(lean) * Math.sin(heading), Math.cos(lean)],
      length: length2,
      radius,
      point: radius * (1.1 + 0.6 * random()),
      widths: Array.from({ length: 6 }, () => 0.85 + 0.3 * random()),
      turn: random() * (Math.PI / 3),
      off: [(random() - 0.5) * 0.4 * radius, (random() - 0.5) * 0.4 * radius],
      fallen
    };
  });
}), prismOf = (crystal, sides) => {
  const { foot, axis, length: length2, radius, point, widths, turn: turn2, off, fallen } = crystal;
  const across = normalized(crossOf(axis, Math.abs(axis[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0])), side = crossOf(axis, across);
  const along = (distance, x = 0, y = 0) => [0, 1, 2].map((k) => foot[k] + axis[k] * distance + across[k] * x + side[k] * y);
  const ring = (distance) => Array.from({ length: sides }, (_, j) => {
    const angle = turn2 + j / sides * 2 * Math.PI, width = radius * widths[Math.floor(j * 6 / sides)];
    return along(distance, Math.cos(angle) * width, Math.sin(angle) * width);
  });
  const base = fallen ? point * 0.8 : 0;
  return { feet: ring(base), shoulders: ring(length2 - point), tip: along(length2, ...off), heel: along(0) };
}, stoneUnder = (params, seed, n) => {
  const points = sampled({ roughness: 0.6, elongation: params.elongation }, seed + 7, n, -Infinity);
  for (let i = 0;i < points.length; i += 3) {
    points[i] *= 0.85;
    points[i + 1] *= 0.85;
    points[i + 2] = Math.max(points[i + 2] * 0.22 + 0.02, 0);
  }
  return points;
}, crystalsMesh = (params, seed, level) => {
  const sides = PRISM_SIDES[level];
  const crystals = crystalsOf(params, seed);
  const box = keptAs(`cluster|${seed}|${params.crystals}|${params.roughness}|${params.elongation}`, () => {
    const prisms = crystals.map((crystal2) => prismOf(crystal2, PRISM_SIDES[FINEST]));
    const all = [...prisms.flatMap(({ feet, shoulders, tip, heel }) => [...feet, ...shoulders, tip, heel]).flat(), ...stoneUnder(params, seed, STONE_UNDER[FINEST])];
    for (let i = 2;i < all.length; i += 3)
      all[i] = Math.max(all[i], 0);
    return boundsOf(all);
  });
  const unit3 = (p) => Array.from(intoBox(new Float64Array([p[0], p[1], Math.max(p[2], 0)]), box));
  const mesh = createMesh(2);
  const crystal = () => 0;
  for (const each of crystals.slice(0, Math.ceil(crystals.length * PRISMS_DRAWN[level]))) {
    const { feet, shoulders, tip, heel } = prismOf(each, sides);
    const [down, up, point, foot] = [feet.map(unit3), shoulders.map(unit3), unit3(tip), unit3(heel)];
    for (let j = 0;j < sides; j++) {
      const k = (j + 1) % sides;
      addFacet(mesh, crystal, down[j], down[k], up[k]);
      addFacet(mesh, crystal, down[j], up[k], up[j]);
      addFacet(mesh, crystal, up[j], up[k], point);
      addFacet(mesh, crystal, down[k], down[j], foot);
    }
  }
  const n = STONE_UNDER[level];
  addGrid(mesh, intoBox(stoneUnder(params, seed, n), box), n, 0.3, () => 1);
  return mesh.pack([1, 1, 1]);
}, formationOf = ({ form, stones, roughness, elongation }, seed) => keptAs(`formation|${form}|${seed}|${stones}|${roughness}|${elongation}`, () => {
  const random = randomOf(seed ^ 1759714724);
  const stretch = 1 + 2 * elongation, pieces = [];
  const add2 = (x, y, z, length2, depth, height, tip) => pieces.push({
    x,
    y,
    z,
    length: length2,
    depth,
    height,
    yaw: (random() - 0.5) * 0.5,
    tip: (random() - 0.5) * tip,
    own: Math.floor(random() * 2147483647),
    stretch: 0.1 + 0.3 * random()
  });
  if (form === PASSAGE) {
    const way = 0.3 * stretch, pillar = 0.24 * stretch, height = 0.72 + 0.1 * random();
    for (const side of [-1, 1])
      add2(side * (way / 2 + pillar / 2), (random() - 0.5) * 0.12, 0, pillar * (0.9 + 0.2 * random()), 0.6 + 0.25 * random(), height * (0.94 + 0.12 * random()), 0.1);
    add2((random() - 0.5) * 0.06 * stretch, (random() - 0.5) * 0.08, height * 0.92, way + pillar * 1.6, 0.55 + 0.2 * random(), 0.24 + 0.08 * random(), 0.06);
    pieces[2].rests = [0, 1];
    for (let i = 3;i < stones; i++) {
      const side = random() < 0.5 ? -1 : 1, beyond = random() < 0.6;
      const x = side * (beyond ? way / 2 + pillar * (0.9 + 0.6 * random()) : way / 2 + pillar * (0.2 + 0.6 * random()));
      const y = beyond ? (random() - 0.5) * 0.5 : (random() < 0.5 ? -1 : 1) * (0.38 + 0.12 * random());
      add2(x, y, 0, pillar * (0.5 + 0.5 * random()), 0.3 + 0.3 * random(), 0.12 + 0.3 * random(), 0.3);
    }
  } else {
    for (let i = 0;i < stones; i++) {
      const rank = stones > 1 ? i / (stones - 1) : 0;
      const x = (random() - 0.5) * stretch * (0.25 + 0.6 * rank), y = (random() - 0.5) * (0.2 + 0.5 * rank);
      const height = (1 - 0.65 * rank) * (0.8 + 0.2 * random()), length2 = (0.22 + 0.2 * random()) * stretch * (0.6 + 0.4 * rank);
      add2(x, y, 0, length2, 0.35 + 0.35 * random(), height, 0.22);
    }
  }
  return pieces;
}), stoneGrid = (params, stone, n) => {
  const points = sampled({ roughness: params.roughness, elongation: stone.stretch }, stone.own, n, -Infinity, BODIES[CRAG]);
  const { min, max } = boundsOf(points);
  const cy = Math.cos(stone.yaw), sy = Math.sin(stone.yaw), ct = Math.cos(stone.tip), st = Math.sin(stone.tip);
  for (let i = 0;i < points.length; i += 3) {
    const x = ((points[i] - min[0]) / (max[0] - min[0]) - 0.5) * stone.length;
    const y0 = ((points[i + 1] - min[1]) / (max[1] - min[1]) - 0.5) * stone.depth;
    const z0 = (points[i + 2] - min[2]) / (max[2] - min[2]) * stone.height;
    const y = y0 * ct - z0 * st, z = y0 * st + z0 * ct;
    points[i] = stone.x + x * cy - y * sy;
    points[i + 1] = stone.y + x * sy + y * cy;
    points[i + 2] = z;
  }
  return points;
}, setDown = (points, dz) => {
  for (let i = 2;i < points.length; i += 3)
    points[i] = Math.max(points[i] + dz, 0);
  return points;
}, lowest = (points) => {
  let low = Infinity;
  for (let i = 2;i < points.length; i += 3)
    low = Math.min(low, points[i]);
  return low;
}, grounded = (points, stone) => setDown(points, -lowest(points) - 0.04 * stone.height), lintelDrop = (params, seed) => keptAs(`lintel|${params.form}|${seed}|${params.stones}|${params.roughness}|${params.elongation}`, () => {
  const stones = formationOf(params, seed);
  const lintel = stones.find((stone) => stone.rests);
  const under = stoneGrid(params, lintel, PIECE_SIDES[FINEST]);
  return Math.min(...lintel.rests.map((i) => {
    const pillar = grounded(stoneGrid(params, stones[i], PIECE_SIDES[FINEST]), stones[i]);
    let x0 = Infinity, x1 = -Infinity, head = 0, belly = Infinity;
    for (let k = 0;k < pillar.length; k += 3) {
      x0 = Math.min(x0, pillar[k]);
      x1 = Math.max(x1, pillar[k]);
      if (Math.abs(pillar[k] - lintel.x) <= lintel.length / 2 && Math.abs(pillar[k + 1] - lintel.y) <= lintel.depth / 2)
        head = Math.max(head, pillar[k + 2]);
    }
    for (let k = 0;k < under.length; k += 3)
      if (under[k] >= x0 && under[k] <= x1)
        belly = Math.min(belly, under[k + 2]);
    return head - belly;
  })) - 0.22 * lintel.height;
}), formationGrids = (params, seed, n) => formationOf(params, seed).map((stone) => {
  const points = stoneGrid(params, stone, n);
  return stone.rests ? setDown(points, lintelDrop(params, seed)) : grounded(points, stone);
}), formationBox = (params, seed) => keptAs(`formation-box|${params.form}|${seed}|${params.stones}|${params.roughness}|${params.elongation}`, () => {
  const grids = formationGrids(params, seed, PIECE_SIDES[FINEST]);
  const all = new Float64Array(grids.reduce((sum, grid) => sum + grid.length, 0));
  grids.reduce((offset, grid) => (all.set(grid, offset), offset + grid.length), 0);
  return boundsOf(all);
}), formationMesh = (params, seed, level) => {
  const n = PIECE_SIDES[level], box = formationBox(params, seed);
  const slotOf = coverOf(params.cover, box);
  const mesh = createMesh(2);
  for (const grid of formationGrids(params, seed, n))
    addGrid(mesh, intoBox(grid, box), n, params.edges, slotOf);
  return mesh.pack([1, 1, 1]);
}, piecesHulls = (params, seed, size) => {
  const key = `rock|${params.form}|${seed}|${params.stones}|${params.roughness}|${params.elongation}`;
  const box = formationBox(params, seed);
  return formationGrids(params, seed, PIECE_SIDES[1]).map((grid, i) => ({ type: "hull", key: `${key}#${i}`, points: Float32Array.from(intoBox(grid, box)), scale: [...size] }));
}, MESHES, notCrystals = ({ form }) => form !== CRYSTALS, rock;
var init_rock = __esm(() => {
  init_mesh();
  BOX = [-0.5, -0.5, -0.5];
  FORMS = ["boulder", "crag", "layered", "pile", "crystals", "arch", "passage", "outcrop"];
  [BOULDER, CRAG, LAYERED, PILE, CRYSTALS, PASSAGE, OUTCROP] = [0, 1, 2, 3, 4, 6, 7];
  SIDES = [6, 8, 12, 16];
  CRAG_SIDES = [8, 12, 20, 28];
  BAND_SIDES = [6, 8, 12, 16];
  STONE_SIDES = [4, 5, 6, 8];
  PRISM_SIDES = [4, 4, 6, 6];
  PRISMS_DRAWN = [0.5, 0.75, 1, 1];
  STONE_UNDER = [6, 6, 8, 10];
  PIECE_SIDES = [4, 6, 8, 10];
  DEG2 = Math.PI / 180;
  kept = new Map;
  BODIES = {
    [BOULDER]: { chips: [6, 10], depth: [0.08, 0.24], square: 0.5, upright: 1.6, ribs: 0 },
    [CRAG]: { chips: [10, 14], depth: [0.06, 0.3], square: 0.65, upright: 0.55, ribs: 0.07 }
  };
  MESHES = [bodyMesh, bodyMesh, layeredMesh, pileMesh, crystalsMesh, bodyMesh, formationMesh, formationMesh];
  rock = Object.freeze({
    name: "rock",
    label: "Rock",
    description: "A rock of one of seven forms: a boulder (a sculpted sphere, lumped and chipped by its seed and cut flat underneath), a crag (the same cut into upright faces, for rocks of metres), layered (strata, ledges between them), a pile of stones heaped as they would rest, crystals (quartz prisms out of a stone of their own), a passage (two pillars either side of a way through, a lintel resting across them, blocks at their feet) or an outcrop (tall stones and blocks leaning together). Its length (x) is its width (y) drawn out by its elongation; a few hundred triangles to 1,500, a formation 200 a stone, the detail left to its texture's relief. Its second face is its cover — moss, snow or sand on what faces up, as far down as its cover says — or the stone its crystals grow out of. Passages and outcrops collide stone by stone: one walks under a lintel.",
    faces: ({ form }) => form === CRYSTALS ? ["crystals", "stone"] : ["surface", "cover"],
    facesBy: "form",
    shape: "sphere",
    seeded: true,
    size: [1, 0.8, 0.6],
    sizeNote: "its width (y) and height (z) its own; its length (x) its width drawn out by its elongation",
    params: [
      { name: "form", label: "Form", min: 0, max: 7, default: 0, step: 1, options: FORMS, retired: ["arch"], description: "Boulder: a lumpy, chipped stone. Crag: a rock of metres cut into upright faces and ribbed. Layered: strata, bands one on another with ledges between. Pile: stones heaped as they would rest. Crystals: quartz prisms ending in points, out of a stone of their own. Passage: two pillars either side of a way through, a lintel resting across them, blocks at their feet. Outcrop: tall stones and blocks leaning together." },
      { name: "roughness", label: "Roughness", min: 0, max: 1, default: 0.5, step: 0.01, description: "How broken its surface is: 0 a smooth, lumpy pebble; 1 jagged, chipped all over. Crystals: how far apart they lean." },
      { name: "edges", label: "Edges", min: 0, max: 1, default: 0, step: 0.01, when: notCrystals, description: "How its facets meet: 0 faceted, low-poly, each facet flat with hard edges; 1 rounded, shaded smoothly across them." },
      { name: "base", label: "Flat base", min: 0, max: 1, default: 0.3, step: 0.01, when: ({ form }) => form <= PILE && form !== LAYERED, description: "How much of its underside is cut flat, to sit on the ground: 0 none, 1 up to half its height. A pile: how far its stones are sunk." },
      { name: "elongation", label: "Elongation", min: 0, max: 1, default: 0.25, step: 0.01, description: "How long it is for its width: its length (x) is 1 + 2 × this times its width (y)." },
      { name: "layers", label: "Layers", min: 2, max: 8, default: 5, step: 1, when: ({ form }) => form === LAYERED, description: "Its strata, bottom to top." },
      { name: "stones", label: "Stones", min: 3, max: 12, default: 8, step: 1, when: ({ form }) => form === PILE || form === PASSAGE || form === OUTCROP, description: "The stones of the pile, the passage (its two pillars and lintel among them) or the outcrop." },
      { name: "crystals", label: "Crystals", min: 3, max: 24, default: 16, step: 1, when: ({ form }) => form === CRYSTALS, description: "Its crystals, the largest upright in the middle; at a distance the least are left out." },
      { name: "cover", label: "Cover", min: 0, max: 1, default: 0, step: 0.01, when: notCrystals, description: "How far down its second face, its cover, reaches: the facets that face up, for moss, snow or sand — 0 none, 1 down past its sides." }
    ],
    labelOf: ({ form }) => ["Rock", "Crag", "Layered rock", "Stone pile", "Crystals", "Rock", "Rock passage", "Outcrop"][form],
    fit: ({ elongation }, [, y, z]) => [y * (1 + 2 * elongation), y, z],
    resize: (params, [x, y]) => ({ ...params, elongation: (x / y - 1) / 2 }),
    collider: (params, seed, size) => params.form === PASSAGE || params.form === OUTCROP ? piecesHulls(params, seed, size) : "hull",
    families: [
      { name: "boulder", label: "Boulder", params: { form: "boulder", roughness: 0.5, edges: 0.15, base: 0.35, elongation: 0.3 }, size: [1.4, 1, 0.85], material: "ground/rock/rock-boulder-dry", sink: 0.12 },
      { name: "mossy", label: "Mossy boulder", params: { form: "boulder", roughness: 0.55, edges: 0.3, base: 0.4, elongation: 0.35, cover: 0.45 }, size: [1.6, 1.15, 0.95], material: "ground/rock/rock-01", second: "ground/grass/moss-002", sink: 0.12 },
      { name: "pebble", label: "Pebble", params: { form: "boulder", roughness: 0.06, edges: 1, base: 0.2, elongation: 0.35 }, size: [0.36, 0.26, 0.16], material: "ground/rock/rock-01", sink: 0.2 },
      { name: "slab", label: "Slab", params: { form: "boulder", roughness: 0.35, edges: 0.1, base: 0.7, elongation: 0.15 }, size: [2.2, 1.9, 0.45], material: "ground/rock/rock-002", sink: 0.25 },
      { name: "crag", label: "Crag", params: { form: "crag", roughness: 0.8, edges: 0.1, base: 0.8, elongation: 0.45 }, size: [6, 4, 4.5], material: "ground/rock/rock-face-03", sink: 0.2 },
      { name: "snowy", label: "Snowy crag", params: { form: "crag", roughness: 0.75, edges: 0.1, base: 0.8, elongation: 0.4, cover: 0.4 }, size: [6, 4.2, 4.5], material: "ground/rock/rock-face-03", second: "ground/snow/snow-004", sink: 0.2 },
      { name: "strata", label: "Strata", params: { form: "layered", layers: 5, roughness: 0.5, edges: 0.3, elongation: 0.3 }, size: [4.5, 3.5, 2.4], material: "ground/rock/cliff-side", sink: 0.1 },
      { name: "pile", label: "Stone pile", params: { form: "pile", stones: 8, roughness: 0.6, edges: 0.15, base: 0.2, elongation: 0.2 }, size: [1.8, 1.5, 0.8], material: "ground/rock/rock-08", sink: 0.05 },
      { name: "quartz", label: "Quartz", params: { form: "crystals", crystals: 18, roughness: 0.45, elongation: 0.15 }, size: [1.1, 0.95, 1.15], material: "paving/stone/marble-005", second: "ground/snow/snow-004", look: { opacity: 0.55, gloss: 0.9, reflect: 0.3 }, sink: 0.04 },
      { name: "amethyst", label: "Amethyst", params: { form: "crystals", crystals: 14, roughness: 0.55, elongation: 0.2 }, size: [1, 0.85, 0.9], material: "paving/stone/marble-005", second: "ground/rock/rock-01", look: { opacity: 0.65, gloss: 0.88, reflect: 0.25, tint: [0.62, 0.36, 0.95] }, sink: 0.04 },
      { name: "passage", label: "Mossy passage", params: { form: "passage", stones: 9, roughness: 0.65, edges: 0.2, elongation: 0.6, cover: 0.4 }, size: [7.5, 3.4, 5], material: "ground/rock/rock-064", second: "ground/grass/moss-002", sink: 0.05 },
      { name: "gate", label: "Stone gate", params: { form: "passage", stones: 5, roughness: 0.5, edges: 0.15, elongation: 0.75 }, size: [8, 3.2, 5.5], material: "ground/rock/rock-boulder-dry", sink: 0.05 },
      { name: "outcrop", label: "Outcrop", params: { form: "outcrop", stones: 8, roughness: 0.75, edges: 0.1, elongation: 0.5 }, size: [8, 4, 4.5], material: "ground/rock/rock-face-03", sink: 0.08 },
      { name: "mossyOutcrop", label: "Mossy outcrop", params: { form: "outcrop", stones: 7, roughness: 0.7, edges: 0.2, elongation: 0.45, cover: 0.5 }, size: [7.6, 4, 4.2], material: "ground/rock/rock-057", second: "ground/grass/moss-002", sink: 0.08 }
    ],
    mesh: (params, seed, level) => MESHES[params.form](params, seed, level)
  });
});

// src/build/kinds/bevel.js
var DETAIL, ROUND, stepsAt = (segments, level) => Math.max(2, 2 * Math.round(segments * DETAIL[level] / 8)), unit3 = (v) => {
  const length2 = Math.hypot(...v);
  return length2 > 0.000000000001 ? v.map((c) => c / length2) : [0, 0, 1];
}, BOX_FACES, bevelledBox = (half, radius, round2, steps) => {
  const mesh = createMesh(6);
  const inner = half.map((h) => h - radius);
  const angles = Array.from({ length: steps + 1 }, (_, j) => j / steps * (Math.PI / 4));
  const offsets = round2 ? angles.map((a) => radius * Math.tan(a)) : [0, radius];
  const along = (axis) => [...offsets.map((o) => -inner[axis] - o).reverse(), ...offsets.map((o) => inner[axis] + o)];
  const chords = round2 ? angles.slice(1).map((a, j) => 2 * radius * Math.sin((a - angles[j]) / 2)) : [radius * Math.SQRT1_2];
  const reach = chords.map((_, j) => chords.slice(0, j + 1).reduce((sum, c) => sum + c, 0));
  const arcs = (axis) => [...[...reach].reverse().map((s) => -inner[axis] - s), -inner[axis], inner[axis], ...reach.map((s) => inner[axis] + s)];
  const onto = (p) => {
    const core = p.map((v, k) => Math.min(Math.max(v, -inner[k]), inner[k]));
    const d = p.map((v, k) => v - core[k]);
    const length2 = round2 ? Math.hypot(...d) : Math.abs(d[0]) + Math.abs(d[1]) + Math.abs(d[2]);
    return { at: length2 < 0.000000000001 ? core : core.map((v, k) => v + radius * d[k] / length2), normal: unit3(d) };
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
        const facet = round2 ? null : unit3(cross3(p2.map((c2, k2) => c2 - p0[k2]), p3.map((c2, k2) => c2 - p1[k2])));
        const [a, b, c, d] = corners.map(({ at, normal, uv }) => mesh.vertex(slot, at, facet ?? normal, uv));
        mesh.quad(slot, a, b, c, d);
      }
    }
  });
  return mesh;
}, bevelledCylinder = ([a, b, h], radius, round2, steps, sides) => {
  const mesh = createMesh(3);
  const onRim = (top2, t) => {
    const z = top2 ? 1 : -1;
    if (!round2)
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
  const outline = (phi) => ({ point: [a * Math.cos(phi), b * Math.sin(phi)], normal: unit3([b * Math.cos(phi), a * Math.sin(phi), 0]) });
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
}, bevel;
var init_bevel = __esm(() => {
  init_mesh();
  DETAIL = [1, 1.5, 2.5, 4];
  ROUND = [6, 9, 15, 24];
  BOX_FACES = [[2, 1, 0, 1, 1, 1], [1, -1, 0, 1, 2, 1], [0, 1, 1, 1, 2, 1], [1, 1, 0, -1, 2, 1], [0, -1, 1, -1, 2, 1], [2, -1, 0, 1, 1, -1]];
  bevel = Object.freeze({
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
      const round2 = edge === 0;
      const steps = round2 ? stepsAt(segments, level) / 2 : 1;
      if (base === 1) {
        const [a, b, h] = half;
        const r = Math.min(radius, h, Math.min(a, b), Math.min(a, b) ** 2 / Math.max(a, b));
        return bevelledCylinder(half, r, round2, steps, ROUND[level]).pack(size);
      }
      return bevelledBox(half, Math.min(radius, ...half), round2, steps).pack(size);
    },
    collider: ({ base, radius }, seed, size) => {
      const half = size.map((v) => v / 2);
      if (base !== 1)
        return [{ type: "box", half, radius: Math.min(radius, ...half) }];
      const [a, b, h] = half;
      return Math.abs(a - b) <= 0.001 * Math.max(a, b) ? [{ type: "cylinder", half: h, radius: a, rounding: Math.min(radius, h, a) }] : null;
    }
  });
});

// src/build/kinds/stairs.js
var RAIL = 0.9, POST = 0.04, HANDRAIL, STRINGER = 0.05, BOARD = 0.04, EDGE = 0.04, SINK = 0.01, stepsOf = ({ steps, height, tread, landing }) => {
  const riser = height / steps;
  const middle = landing > tread && steps > 1 ? Math.ceil(steps / 2) : 0;
  const frontOf = (i) => (i - 1) * tread + (middle && i > middle ? landing - tread : 0);
  const list = Array.from({ length: steps }, (_, k) => ({ front: frontOf(k + 1), back: frontOf(k + 2), top: (k + 1) * riser, landing: k + 1 === middle }));
  return { list, riser, run: frontOf(steps + 1), middle };
}, flightsOf = (list) => {
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
}, clip = (polygon, inside, cut2) => polygon.flatMap((p, i) => {
  const q = polygon[(i + 1) % polygon.length];
  if (inside(p))
    return inside(q) ? [p] : [p, cut2(p, q)];
  return inside(q) ? [cut2(p, q)] : [];
}), clipY = (polygon, y, below) => clip(polygon, (p) => below ? p[0] <= y : p[0] >= y, (p, q) => [y, p[1] + (q[1] - p[1]) * (y - p[0]) / (q[0] - p[0])]), clipZ = (polygon, z, below) => clip(polygon, (p) => below ? p[1] <= z : p[1] >= z, (p, q) => [p[0] + (q[0] - p[0]) * (z - p[1]) / (q[1] - p[1]), z]), bandOf = (flight, list, riser) => {
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
}, stationsOf = (list) => list.flatMap(({ front, back, top, landing }) => landing ? [[front + 0.1, top], [back - 0.1, top]] : [[(front + back) / 2, top]]), bendsOf = (stations) => stations.filter((p, i) => {
  if (i === 0 || i === stations.length - 1)
    return true;
  const [a, b] = [stations[i - 1], stations[i + 1]];
  return Math.abs((p[1] - a[1]) * (b[0] - p[0]) - (b[1] - p[1]) * (p[0] - a[0])) > 0.000000001;
}), SIDES2, stairs;
var init_stairs = __esm(() => {
  init_mesh();
  HANDRAIL = [0.05, 0.04];
  SIDES2 = [[], [-1], [1], [-1, 1]];
  stairs = Object.freeze({
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
});

// src/build/kinds/door.js
var GAP = 0.004, FLOOR = 0.01, HANDLE = 1, RAISE = 0.012, BEVEL = 0.03, SINK2 = 0.001, PANE = 0.006, METRE, openingOf = (frame, size, hinge = 0, jambs = 0) => {
  const [hx, hy, hz] = size.map((v) => v / 2);
  const f = Math.min(frame, size[0] / 3, size[2] / 3);
  const [left, right] = [!(jambs === 1 && hinge === 1), !(jambs === 1 && hinge === 0)];
  return { hx, hy, hz, f, left, right, x0: left ? -hx + f + GAP : -hx + GAP / 2, x1: right ? hx - f - GAP : hx - GAP / 2, z0: -hz + FLOOR, z1: hz - f - GAP };
}, door;
var init_door = __esm(() => {
  init_mesh();
  METRE = [1, 1];
  door = Object.freeze({
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
      { name: "jambs", label: "Jambs", min: 0, max: 1, default: 0, step: 1, options: ["both", "hinge"], optional: true, description: "Its frame's uprights: both; or hinge, only the one it hangs on — one leaf of a double door, its other side open to the leaf that meets it: two such doors side by side, hung on the outer sides, are a double door with nothing between its leaves." },
      { name: "open", label: "Open", min: 0, max: 110, default: 0, step: 1, pose: true, description: "How far it stands open (°), swinging out towards the front: its leaf turns on its hinges, its mesh the same. A behaviour opens and shuts it so." },
      { name: "lit", label: "Lit inside", min: 0, max: 1, default: 0, step: 1, options: ["no", "yes"], optional: true, description: "Its glass closes a room: by night a faint neutral light from inside, as a house's windows have, in a house's object (the house kind sets it on its outer doors and its sliding panes)." }
    ],
    moving: [{
      faces: [1, 2, 3],
      turn: ({ frame, hinge, open, jambs }, size) => {
        const { hy, x0, x1 } = openingOf(frame, size, hinge, jambs);
        return { at: [hinge === 0 ? x0 : x1, -hy, 0], axis: [0, 0, 1], angle: (hinge === 0 ? -1 : 1) * open * Math.PI / 180 };
      }
    }],
    mesh: ({ frame, leaf, style, hinge, jambs, lit }, seed, level, size) => {
      const mesh = createMesh(4);
      const { hx, hy, hz, f, left, right, x0, x1, z0, z1 } = openingOf(frame, size, hinge, jambs);
      const t = Math.min(leaf, size[1]);
      const uvOf = (p, n) => boxUv(p, n, [-hx, -hy, -hz], ...METRE);
      const outline = [...left ? [[-hx, -hz], [-hx + f, -hz], [-hx + f, hz - f]] : [[-hx, hz - f]], ...right ? [[hx - f, hz - f], [hx - f, -hz], [hx, -hz]] : [[hx, hz - f]], [hx, hz], [-hx, hz]];
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
        addBox(mesh, [x0 + margin - SINK2 * 2, middle - PANE / 2, g0 - SINK2 * 2], [x1 - margin + SINK2 * 2, middle + PANE / 2, g1 + SINK2 * 2], () => 2, lit ? marked(uvOf) : uvOf);
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
    collider: ({ frame, leaf, hinge, jambs }, seed, size) => {
      const { hx, hy, hz, f, left, right, x0, x1, z0, z1 } = openingOf(frame, size, hinge, jambs);
      return [
        ...left ? [solidBox([-hx, -hy, -hz], [-hx + f, hy, hz - f])] : [],
        ...right ? [solidBox([hx - f, -hy, -hz], [hx, hy, hz - f])] : [],
        solidBox([-hx, -hy, hz - f], [hx, hy, hz]),
        { ...solidBox([x0, -hy, z0], [x1, -hy + Math.min(leaf, size[1]), z1]), moving: 0 }
      ];
    }
  });
});

// src/build/kinds/window.js
var SINK3 = 0.001, PANE2 = 0.006, METRE2, windowKind;
var init_window = __esm(() => {
  init_mesh();
  METRE2 = [1, 1];
  windowKind = Object.freeze({
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
      { name: "sill", label: "Sill", min: 0, max: 0.3, default: 0.05, step: 0.005, description: "How far a sill under it stands out to the front (m); 0 for none." },
      { name: "lit", label: "Lit inside", min: 0, max: 1, default: 0, step: 1, options: ["no", "yes"], optional: true, description: "Its glass closes a room: by night a faint neutral light from inside, as a house's windows have, in a house's object (the house kind sets it on its outer doors and its sliding panes)." }
    ],
    mesh: ({ frame, columns, rows, bar, sill, lit }, seed, level, size) => {
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
      addBox(mesh, [x0 - SINK3 * 2, -PANE2 / 2, z0 - SINK3 * 2], [x1 + SINK3 * 2, PANE2 / 2, z1 + SINK3 * 2], () => 2, lit ? marked(uvOf) : uvOf);
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
});

// src/build/kinds/roof.js
var UP, roof;
var init_roof = __esm(() => {
  init_mesh();
  UP = [0, 0, 1];
  roof = Object.freeze({
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
        const along = unit2(cross3(UP, n));
        return [dot3(p, along), dot3(p, cross3(n, along))];
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
        const out = (x, y) => unit2([x * sign, y * sign, 0.5 * sign]);
        face([rim[0], rim[1], crest[1], crest[0]].filter(unique), out(0, -1));
        face([rim[1], rim[2], crest[1]], out(1, 0));
        face([rim[2], rim[3], crest[0], crest[1]].filter(unique), out(0, 1));
        face([rim[3], rim[0], crest[0]], out(-1, 0));
      };
      const unique = (p, i, list) => list.findIndex((q) => q.every((v, k) => Math.abs(v - p[k]) < 0.000000000001)) === i;
      slopes(high, top, 1);
      for (let k = 0;k < 4; k++) {
        const [a, b] = [k, (k + 1) % 4];
        const outward = unit2([...[0, 1].map((c) => (low[a][c] + low[b][c]) / 2), 0]);
        face([low[a], low[b], high[b], high[a]], outward);
      }
      if (solid)
        face([...low].reverse(), [0, 0, -1]);
      else
        slopes(low, top.map(([x, y, z]) => [x, y, z - t]), -1);
      return mesh.pack(size);
    }
  });
});

// src/build/kinds/column.js
var ROUND2, SINK4 = 0.001, SHAFT = 0.4, FLUTE = 0.06, PER_FLUTE = 6, turned = (mesh, slot, rings, sides) => {
  const radiusAt = (ring, phi) => typeof ring[1] === "function" ? ring[1](phi) : ring[1];
  const pointAt = (ring, phi) => {
    const r = radiusAt(ring, phi);
    return [r * Math.cos(phi), r * Math.sin(phi), ring[0]];
  };
  const angles = Array.from({ length: sides + 1 }, (_, i) => i / sides * 2 * Math.PI);
  const grid = rings.map((ring, k) => angles.map((phi) => {
    const p = pointAt(ring, phi);
    const d = 0.0001;
    const round2 = pointAt(ring, phi + d).map((v, c) => v - pointAt(ring, phi - d)[c]);
    const other = rings[Math.min(k + 1, rings.length - 1)] === ring ? rings[k - 1] : rings[k + 1];
    const up = rings[k + 1] ? pointAt(rings[k + 1], phi).map((v, c) => v - p[c]) : p.map((v, c) => v - pointAt(other, phi)[c]);
    const normal = unit2(cross3(round2, up));
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
}, column;
var init_column = __esm(() => {
  init_mesh();
  ROUND2 = [8, 12, 16, 24];
  column = Object.freeze({
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
});

// src/build/kinds/arch.js
var SEGMENTS, arch;
var init_arch = __esm(() => {
  init_mesh();
  SEGMENTS = [8, 12, 16, 24];
  arch = Object.freeze({
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
      const round2 = new Map;
      let travelled = 0;
      outline.slice(1, curve.length + 3).forEach(([x, z], i, list) => {
        if (i)
          travelled += Math.hypot(x - list[i - 1][0], z - list[i - 1][1]);
        round2.set(`${x},${z}`, travelled);
      });
      const flat = (point, normal) => boxUv(point, normal, [-hx, -hy, -hz], 1, 1);
      const uvOf = (point, normal, slot) => slot === 1 ? [round2.get(`${point[0]},${point[2]}`) ?? 0, point[1] + hy] : flat(point, normal);
      addExtrusion(mesh, outline.map(([x, z]) => [z, x]), 1, -hy, hy, 0, (normal, edge) => opening.has(edge) ? 1 : normal[2] < -0.5 ? 3 : 2, uvOf);
      return mesh.pack(size);
    }
  });
});

// src/build/kinds/fence.js
var SINK5 = 0.002, NONE = 0.000000001, widthOf = ({ post, thickness }) => Math.min(post, thickness), cornerOf = (before, after, square) => {
  const [a, b] = [Math.atan2(before[1], before[0]), Math.atan2(after[1], after[0])];
  for (const fold of square ? [4, 2] : [2]) {
    const sin = Math.sin(fold * a) + Math.sin(fold * b), cos = Math.cos(fold * a) + Math.cos(fold * b);
    if (Math.hypot(sin, cos) > 0.000001) {
      const turn2 = Math.atan2(sin, cos) / fold;
      return [Math.cos(turn2), Math.sin(turn2)];
    }
  }
  return after;
}, layoutOf = (params) => {
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
}, frameAt2 = (at, [ux, uy], lift = () => 0) => ([x, y, z]) => [at[0] + ux * x - uy * y, at[1] + uy * x + ux * y, at[2] + z + lift(x)], footprintOf, centreOf = (params) => {
  const { min, max } = footprintOf(params);
  return min.map((v, k) => (v + max[k]) / 2);
}, upToMillimetre = (v) => Math.ceil(v * 1000 - 0.000001) / 1000, fence;
var init_fence = __esm(() => {
  init_mesh();
  footprintOf = remembered((params) => {
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
        cover(frameAt2(at, along)([...corner, 0]));
    for (const { from, length: length2, along } of lengths)
      for (const corner of [[0, -t], [length2, -t], [length2, t], [0, t]])
        cover(frameAt2(from, along)([...corner, 0]));
    const feet = params.points.map((point) => point[2]);
    return { min: [...min, Math.min(...feet)], max: [...max, Math.max(...feet) + params.height] };
  });
  fence = Object.freeze({
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
      const scale4 = [0, 1].map((k) => spread[k] > NONE ? Math.max(size[k] - (max[k] - min[k] - spread[k]), 0) / spread[k] : 1);
      const middle = (Math.min(...params.points.map((p) => p[2])) + Math.max(...params.points.map((p) => p[2])) + height) / 2;
      return { ...params, thickness, height, points: params.points.map(([x, y, z]) => [x * scale4[0], y * scale4[1], z - middle]) };
    },
    mesh: (params, seed, level, size) => {
      const { style, spacing, rails, gap, thickness, height } = params;
      const hy = thickness / 2;
      const mesh = createMesh(3);
      const w = widthOf(params);
      const { lengths, posts, closed } = layoutOf(params);
      for (const { at, along } of posts)
        addBox(mesh, [-w / 2, -hy, 0], [w / 2, hy, height], () => 0, (p, n) => boxUv(p, n, [-w / 2, -hy, 0], 1, 1), frameAt2(at, along));
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
        const slope = frameAt2(from, along, (x) => rise * x);
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
            const place = frameAt2(from, along, () => rise * (x + piece / 2));
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
        const slope = frameAt2(from, along, (x) => rise * x);
        const points = [];
        for (const x of [-w / 2, length2 + w / 2])
          for (const y of [-hy, hy])
            for (const z of [0, height])
              points.push(...slope([x, y, z]).map((v, k) => v - centre[k]));
        return { type: "hull", points };
      });
    }
  });
});

// src/build/kinds/road-level.js
var exports_road_level = {};
__export(exports_road_level, {
  structureOf: () => structureOf,
  standOf: () => standOf,
  smoothLine: () => smoothLine,
  reliefOf: () => reliefOf,
  postSide: () => postSide,
  pinsAlong: () => pinsAlong,
  levelRoad: () => levelRoad,
  barrierAt: () => barrierAt,
  archAt: () => archAt,
  STEP: () => STEP,
  SPAN: () => SPAN,
  RESIDUAL_SCALE: () => RESIDUAL_SCALE,
  RAMP: () => RAMP,
  RAIL: () => RAIL2,
  HOLD: () => HOLD,
  HEADROOM: () => HEADROOM,
  GUARDRAIL: () => GUARDRAIL,
  GUARD: () => GUARD,
  GENTLE: () => GENTLE,
  FREEBOARD: () => FREEBOARD,
  EASE: () => EASE,
  BARRIER: () => BARRIER,
  AMPLITUDE_MOST: () => AMPLITUDE_MOST,
  AMPLITUDE_LEAST: () => AMPLITUDE_LEAST,
  AMPLITUDE_FLAT: () => AMPLITUDE_FLAT
});
var RESIDUAL_SCALE = 0.12, AMPLITUDE_LEAST = 0.08, AMPLITUDE_MOST = 1.5, AMPLITUDE_FLAT = 0.1, FINER = 3, PASSES = 4, EPSILON = 0.000000001, LEAN_SMOOTH = 12, EASE = 12, STEP = 0.3, FREEBOARD = 0.3, HOLD = 10, NEAR = 0.01, GENTLE = 0.125, SLOPE_REACH = 2, HEADROOM = 1.8, RAIL2 = 1.05, BARRIER = 0.25, GUARD = 3, SPAN = 8, EMBED = 0.3, LEAST_POST = 0.5, RAMP = 4, BARRIER_GAP, ROUND_SIDES = 12, ROUND_SIDES_FAR = 6, GUARDRAIL, FINE = 2, DECK_LEAST, ARCHES, pierOf = (each) => Math.min(Math.max(each * ARCHES.share, ARCHES.least), Math.max(ARCHES.least, Math.min(ARCHES.most, each * ARCHES.cap))), archAt = ({ l, r, spring, rise }, s) => {
  const [half, middle] = [(r - l) / 2, (l + r) / 2];
  const radius = (half * half + rise * rise) / (2 * rise);
  return spring + rise - radius + Math.sqrt(Math.max(radius * radius - (s - middle) * (s - middle), 0));
}, reliefOf = (slope) => RESIDUAL_SCALE * FINER * Math.max(AMPLITUDE_FLAT, Math.min(AMPLITUDE_MOST, 2 * slope - 0.5)), postSide = (width) => Math.min(0.9, Math.max(0.3, width / 8)), solve = (diag, next, after, right) => {
  const n = diag.length;
  const d = new Float64Array(n), a = new Float64Array(n), b = new Float64Array(n), y = new Float64Array(n);
  for (let k = 0;k < n; k++) {
    d[k] = diag[k] - (k >= 1 ? a[k - 1] ** 2 * d[k - 1] : 0) - (k >= 2 ? b[k - 2] ** 2 * d[k - 2] : 0);
    a[k] = k + 1 < n ? (next[k] - (k >= 1 ? b[k - 1] * a[k - 1] * d[k - 1] : 0)) / d[k] : 0;
    b[k] = k + 2 < n ? after[k] / d[k] : 0;
    y[k] = right[k] - (k >= 1 ? a[k - 1] * y[k - 1] : 0) - (k >= 2 ? b[k - 2] * y[k - 2] : 0);
  }
  const x = new Float64Array(n);
  for (let k = n - 1;k >= 0; k--)
    x[k] = y[k] / d[k] - (k + 1 < n ? a[k] * x[k + 1] : 0) - (k + 2 < n ? b[k] * x[k + 2] : 0);
  return x;
}, smoothLine = ({ s, target, data = 1, bending, fixed = new Map, floor = null, ceiling = null }) => {
  const n = s.length;
  const within = (v, k) => Math.max(Math.min(v, ceiling?.[k] ?? Infinity), floor?.[k] ?? -Infinity);
  if (n < 3 || bending <= 0)
    return Float64Array.from(target, (v, k) => fixed.get(k) ?? within(v, k));
  const h = Float64Array.from({ length: n - 1 }, (_, k) => Math.max(s[k + 1] - s[k], 0.000001));
  const weight = Float64Array.from({ length: n }, (_, k) => ((k ? h[k - 1] : 0) + (k < n - 1 ? h[k] : 0)) / 2);
  const diag = new Float64Array(n), next = new Float64Array(n), after = new Float64Array(n), right = new Float64Array(n);
  for (let k = 0;k < n; k++) {
    diag[k] = data * weight[k];
    right[k] = data * weight[k] * target[k];
  }
  for (let k = 1;k < n - 1; k++) {
    const [p, q] = [h[k - 1], h[k]];
    const coefficients = [2 / (p * (p + q)), -2 / (p * q), 2 / (q * (p + q))];
    const scale4 = bending * weight[k];
    for (let i = 0;i < 3; i++) {
      diag[k - 1 + i] += scale4 * coefficients[i] ** 2;
      if (i < 2)
        next[k - 1 + i] += scale4 * coefficients[i] * coefficients[i + 1];
    }
    after[k - 1] += scale4 * coefficients[0] * coefficients[2];
  }
  const solveHolding = (held) => {
    const [d, e, f, r] = [Float64Array.from(diag), Float64Array.from(next), Float64Array.from(after), Float64Array.from(right)];
    for (const [k, value] of held) {
      if (k >= 2 && !held.has(k - 2))
        r[k - 2] -= after[k - 2] * value;
      if (k >= 1 && !held.has(k - 1))
        r[k - 1] -= next[k - 1] * value;
      if (k + 1 < n && !held.has(k + 1))
        r[k + 1] -= next[k] * value;
      if (k + 2 < n && !held.has(k + 2))
        r[k + 2] -= after[k] * value;
    }
    for (const [k, value] of held) {
      if (k >= 2)
        f[k - 2] = 0;
      if (k >= 1)
        e[k - 1] = 0;
      e[k] = 0;
      f[k] = 0;
      d[k] = 1;
      r[k] = value;
    }
    return solve(d, e, f, r);
  };
  const gradient = (x, k) => diag[k] * x[k] + (k >= 1 ? next[k - 1] * x[k - 1] : 0) + (k + 1 < n ? next[k] * x[k + 1] : 0) + (k >= 2 ? after[k - 2] * x[k - 2] : 0) + (k + 2 < n ? after[k] * x[k + 2] : 0) - right[k];
  if (!floor && !ceiling)
    return solveHolding(fixed);
  const under = (line2, k) => floor ? floor[k] - line2[k] : -Infinity;
  const over = (line2, k) => ceiling ? line2[k] - ceiling[k] : -Infinity;
  const [low, high] = [new Map, new Map];
  let line = null;
  for (let pass = 0;pass < PASSES * n; pass++) {
    const held = new Map([...fixed, ...low, ...high]);
    line = solveHolding(held);
    let taken = false;
    for (let k = 0;k < n; ) {
      const past = held.has(k) ? null : under(line, k) > EPSILON ? under : over(line, k) > EPSILON ? over : null;
      if (!past) {
        k++;
        continue;
      }
      let furthest = k;
      for (;k < n && !held.has(k) && past(line, k) > EPSILON; k++)
        if (past(line, k) > past(line, furthest))
          furthest = k;
      if (past === under)
        low.set(furthest, floor[furthest]);
      else
        high.set(furthest, ceiling[furthest]);
      taken = true;
    }
    if (taken)
      continue;
    let letGo = -1, most = EPSILON, from = null;
    for (const k of low.keys())
      if (-gradient(line, k) > most)
        [letGo, most, from] = [k, -gradient(line, k), low];
    for (const k of high.keys())
      if (gradient(line, k) > most)
        [letGo, most, from] = [k, gradient(line, k), high];
    if (letGo < 0)
      break;
    from.delete(letGo);
  }
  return line.map((v, k) => fixed.has(k) ? v : within(v, k));
}, envelopes = ({ s, floor, ceiling, fixed, cap }) => {
  const n = s.length;
  const low = Float64Array.from(floor), high = Float64Array.from(ceiling);
  for (const [k, v] of fixed)
    [low[k], high[k]] = [v, v];
  for (let k = 1;k < n; k++) {
    const rise = cap[k] * (s[k] - s[k - 1]);
    low[k] = Math.max(low[k], low[k - 1] - rise);
    high[k] = Math.min(high[k], high[k - 1] + rise);
  }
  for (let k = n - 2;k >= 0; k--) {
    const rise = cap[k + 1] * (s[k + 1] - s[k]);
    low[k] = Math.max(low[k], low[k + 1] - rise);
    high[k] = Math.min(high[k], high[k + 1] + rise);
  }
  return { low, high, fits: low.every((v, k) => v <= high[k] + 0.000000001) };
}, forcedOf = ({ s, floor, fixed }) => {
  const n = s.length;
  const y = Float64Array.from(floor);
  for (const [k, v] of fixed)
    y[k] = v;
  const hull = [];
  for (let k = 0;k < n; k++) {
    while (hull.length >= 2) {
      const [a, b] = hull.slice(-2);
      if (fixed.has(b) || (y[b] - y[a]) * (s[k] - s[a]) > (y[k] - y[a]) * (s[b] - s[a]))
        break;
      hull.pop();
    }
    hull.push(k);
  }
  const grade = new Float64Array(n);
  for (let i = 1;i < hull.length; i++) {
    const [a, b] = [hull[i - 1], hull[i]];
    grade.fill((y[b] - y[a]) / (s[b] - s[a]), a + 1, b + 1);
  }
  return grade;
}, cappedLine = ({ s, floor, ceiling, fixed, cap }) => {
  const n = s.length;
  const { low, high } = envelopes({ s, floor, ceiling, fixed, cap });
  const x = smoothLine({ s, target: low, data: 0, bending: 1, fixed, floor: low, ceiling: high });
  for (let k = 1;k < n; k++) {
    if (fixed.has(k))
      continue;
    const rise = cap[k] * (s[k] - s[k - 1]);
    x[k] = Math.min(Math.max(x[k], low[k], x[k - 1] - rise), high[k], x[k - 1] + rise);
  }
  return x;
}, levelRoad = ({ ground, columns, s, half, lift, fill, fall, ends = [null, null], width, grade = null, depth = 0.3, water = null }) => {
  const n = s.length;
  const total = s[n - 1] - s[0];
  const across = (k, j) => half[k] * (1 - 2 * j / (columns - 1));
  const at = (k, j) => ground[k * columns + j];
  const middleOf2 = (k) => {
    let sum = 0;
    for (let j = 0;j < columns; j++)
      sum += at(k, j);
    return sum / columns;
  };
  const groundMiddle = Float64Array.from({ length: n }, (_, k) => middleOf2(k));
  const leanOf = (k) => {
    let top = 0, bottom = 0;
    for (let j = 0;j < columns; j++) {
      const x = across(k, j);
      top += x * (at(k, j) - groundMiddle[k]);
      bottom += x * x;
    }
    return Math.max(-fall, Math.min(fall, bottom > 0 ? top / bottom : 0));
  };
  const pinned = new Map;
  ends.forEach((pin, end) => {
    if (Array.isArray(pin))
      pinned.set(end ? n - 1 : 0, pin);
  });
  const leanFixed = new Map([...pinned].map(([k, pin]) => [k, pin[2]]));
  const lean = smoothLine({ s, target: Float64Array.from({ length: n }, (_, k) => leanOf(k)), bending: (LEAN_SMOOTH / Math.PI) ** 4, fixed: leanFixed }).map((v) => Math.max(-fall, Math.min(fall, v)));
  for (const [k, pin] of pinned)
    lean[k] = pin[2];
  const slopeAt = (k, j) => {
    const [k0, k1] = [Math.max(k - 1, 0), Math.min(k + 1, n - 1)];
    const [j0, j1] = [Math.max(j - 1, 0), Math.min(j + 1, columns - 1)];
    const along = k1 > k0 ? (at(k1, j) - at(k0, j)) / (s[k1] - s[k0]) : 0;
    const side = j1 > j0 ? (at(k, j0) - at(k, j1)) / (across(k, j0) - across(k, j1)) : 0;
    return Math.hypot(along, side);
  };
  const floor = Float64Array.from({ length: n }, (_, k) => {
    let low = -Infinity;
    for (let j = 0;j < columns; j++)
      low = Math.max(low, at(k, j) + lift + reliefOf(slopeAt(k, j)) - lean[k] * across(k, j));
    return low;
  });
  if (water && grade !== null) {
    for (let k = 0;k < n; k++) {
      let lowest2 = Infinity;
      for (let j = 0;j < columns; j++)
        lowest2 = Math.min(lowest2, at(k, j));
      if (water[k] > lowest2 + 0.01)
        floor[k] = Math.max(floor[k], water[k] + FREEBOARD + depth + Math.abs(lean[k]) * half[k]);
    }
  }
  const fixed = new Map;
  for (const [k, [rise, slope]] of pinned) {
    fixed.set(k, groundMiddle[k] + rise);
    const next = k ? k - 1 : 1;
    if (n > 2)
      fixed.set(next, groundMiddle[k] + rise + slope * (s[next] - s[k]));
  }
  if (grade !== null) {
    const { middle: middle2, steep, lies } = levelCapped({ s, floor, fill, fixed, free: ends.map((pin) => !Array.isArray(pin)), cap: grade });
    return { middle: middle2, lean, share: shareOf({ s, ends, width, n, total }), ground: groundMiddle, steep, lies };
  }
  const ceiling = floor.map((v) => v + fill);
  ends.forEach((pin, end) => {
    if (!Array.isArray(pin))
      fixed.set(end ? n - 1 : 0, floor[end ? n - 1 : 0]);
  });
  const middle = smoothLine({ s, target: floor, data: 0, bending: 1, fixed, floor, ceiling });
  return { middle, lean, share: shareOf({ s, ends, width, n, total }), ground: groundMiddle, steep: null };
}, levelCapped = ({ s, floor, fill, fixed, free, cap: asked }) => {
  const n = s.length;
  const none = new Float64Array(n).fill(Infinity);
  let cap = Float64Array.from(forcedOf({ s, floor, fixed }), (v) => Math.min(asked, Math.max(GENTLE, Math.abs(v))));
  if (!envelopes({ s, floor, ceiling: none, fixed, cap }).fits) {
    const even = (c) => new Float64Array(n).fill(c);
    let [low2, high] = [asked, Math.max(asked, 1)];
    while (!envelopes({ s, floor, ceiling: none, fixed, cap: even(high) }).fits && high < 64)
      high *= 2;
    for (let i = 0;i < 40; i++) {
      const middle = (low2 + high) / 2;
      if (envelopes({ s, floor, ceiling: none, fixed, cap: even(middle) }).fits)
        high = middle;
      else
        low2 = middle;
    }
    cap = even(high);
  }
  const { low } = envelopes({ s, floor, ceiling: none, fixed, cap });
  const held = new Map(fixed);
  const raised = free.map((isFree, end) => {
    const k = end ? n - 1 : 0;
    if (!isFree || held.has(k))
      return 0;
    held.set(k, low[k]);
    return low[k] - floor[k];
  });
  let steep = null;
  raised.forEach((rise, end) => {
    if (rise <= STEP || rise <= (steep?.rise ?? -Infinity))
      return;
    const k = end ? n - 1 : 0;
    let worst = k;
    for (let j = 0;j < n; j++)
      if (floor[j] - asked * Math.abs(s[j] - s[k]) > floor[worst] - asked * Math.abs(s[worst] - s[k]))
        worst = j;
    const [climb, length2] = [floor[worst] - floor[k], Math.abs(s[worst] - s[k])];
    steep = { rise, climb, length: length2, from: Math.min(s[worst], s[k]) - s[0], needs: climb / asked };
  });
  const most = Math.max(...cap);
  if (!steep && most > asked + 0.000000001)
    steep = { rise: 0, climb: most * (s[n - 1] - s[0]), length: s[n - 1] - s[0], from: 0, needs: most / asked * (s[n - 1] - s[0]) };
  const lowest2 = envelopes({ s, floor, ceiling: none, fixed: held, cap }).low;
  const ceiling = Float64Array.from(floor, (v) => v + fill);
  const off = (k) => lowest2[k] > floor[k] + NEAR;
  const over = (k) => lowest2[k] > floor[k] + fill + NEAR;
  const steeper = (k) => {
    const [a, b] = [Math.max(k - SLOPE_REACH, 0), Math.min(k + SLOPE_REACH, n - 1)];
    let rise = 0;
    for (let j = a + 1;j <= b; j++)
      rise += cap[j] * (s[j] - s[j - 1]);
    return Math.abs(floor[b] - floor[a]) > rise + 0.000000001;
  };
  for (let k = 0;k < n; k++) {
    if (!off(k))
      continue;
    let to = k;
    while (to + 1 < n && off(to + 1))
      to++;
    let needed = false;
    for (let i = k;i <= to && !needed; i++)
      needed = over(i) && (steeper(i) || fixed.has(i));
    if (needed)
      for (let i = Math.max(k - 1, 0);i <= Math.min(to + 1, n - 1); i++)
        ceiling[i] = floor[i] + HOLD;
    k = to;
  }
  const band = deepest({ s, floor, ceiling, fixed: held, cap });
  let deep = 0, at = 0;
  for (let k = 0;k < n; k++)
    if (band[k] === Infinity && lowest2[k] - floor[k] > Math.max(deep, HOLD))
      [deep, at] = [lowest2[k] - floor[k], k];
  if (!steep && deep > 0)
    steep = { rise: 0, deep, grade: cap[Math.max(at, 1)], from: s[at] - s[0], climb: 0, length: 0, needs: 0 };
  const lies = Uint8Array.from(ceiling, (v, k) => v < floor[k] + HOLD - 0.000000001 ? 1 : 0);
  return { middle: cappedLine({ s, floor, ceiling: band, fixed: held, cap }), steep, lies };
}, deepest = ({ s, floor, ceiling, fixed, cap }) => {
  const lowest2 = envelopes({ s, floor, ceiling: new Float64Array(s.length).fill(Infinity), fixed, cap }).low;
  return Float64Array.from(ceiling, (v, k) => lowest2[k] > v + 0.000000001 ? Infinity : v);
}, shareOf = ({ s, ends, width, n, total }) => {
  const hold = width / 2;
  return Float64Array.from({ length: n }, (_, k) => {
    let least = 1;
    ends.forEach((pin, end) => {
      if (pin !== "ground")
        return;
      const room = Array.isArray(ends[1 - end]) ? total - hold : Infinity;
      const [held, ease] = room > 0.000001 ? [hold, Math.min(Math.max(EASE, width), room)] : [0, total];
      const from = end ? s[n - 1] - s[k] : s[k] - s[0];
      const t = Math.min(Math.max((from - held) / ease, 0), 1);
      least = Math.min(least, t * t * (3 - 2 * t));
    });
    return total > 0 ? least : 1;
  });
}, pinsAlong = ({ pieces, ends, lift, fill, fall, width, grade = null, depth = 0.3, circuit = false }) => {
  const columns = pieces[0].columns;
  const alone = () => pieces.map((_, i) => [i ? null : ends[0], i === pieces.length - 1 ? ends[1] : null]);
  if (pieces.some((piece) => piece.columns !== columns) || pieces.length < 2 && grade === null)
    return { pins: alone(), steep: null, at: [] };
  const ground = [], s = [], half = [], water = [], joints = [];
  const wet = pieces.some((piece) => piece.water);
  pieces.forEach((piece, i) => {
    const from = i ? 1 : 0;
    const offset = s.length ? s.at(-1) - piece.s[0] : -piece.s[0];
    if (i)
      joints.push(s.length - 1);
    for (let k = from;k < piece.s.length; k++) {
      s.push(piece.s[k] + offset);
      half.push(piece.half[k]);
      const row = piece.ground.slice(k * columns, (k + 1) * columns);
      ground.push(...row);
      if (wet)
        water.push(piece.water?.[k] ?? Math.min(...row));
    }
  });
  const { middle, lean, ground: groundMiddle, steep, lies } = levelRoad({ ground, columns, s, half, lift, fill, fall, ends, width, grade, depth, water: wet ? water : null });
  const round2 = (v) => Math.round(v * 1000) / 1000;
  const stand = grade === null ? null : standOf({ ground, columns, s, half, middle, lean, depth, width, water: wet ? water : null, ends, lies, fill });
  const pinAt = (k, grade2) => [round2(middle[k] - groundMiddle[k]), round2(grade2), round2(lean[k]), ...stand ? [0, 1].map((side) => round2(barrierAt(stand, side, s[k] - s[0]))) : []];
  const pins = joints.map((k) => pinAt(k, (middle[k + 1] - middle[k - 1]) / (s[k + 1] - s[k - 1])));
  const n = s.length;
  if (circuit && n > 3) {
    const [d1, d2] = [s[1] - s[0], s[n - 1] - s[n - 2]];
    const g = (middle[1] - middle[n - 2]) / (d1 + d2);
    const h = Math.max(middle[0], middle[n - 1], middle[1] - g * d1) + 0.002;
    const shares = stand ? [0, 1].map((side) => round2(Math.max(barrierAt(stand, side, 0), barrierAt(stand, side, s[n - 1] - s[0])))) : [];
    const joint = [round2(h - groundMiddle[0]), round2(g), round2((lean[0] + lean[n - 1]) / 2), ...shares];
    return pinsAlong({ pieces, ends: [joint, joint], lift, fill, fall, width, grade, depth });
  }
  const at = [pinAt(0, (middle[1] - middle[0]) / (s[1] - s[0])), pinAt(n - 1, (middle[n - 1] - middle[n - 2]) / (s[n - 1] - s[n - 2]))];
  return { pins: pieces.map((_, i) => [i ? pins[i - 1] : ends[0], i < pieces.length - 1 ? pins[i] : ends[1]]), steep, at };
}, standOf = ({ ground, columns, s, half, middle, lean, depth, width, water = null, ends = [null, null], lies = null, fill = 0, arches = false }) => {
  const n = s.length, last = columns - 1, total = s[n - 1] - s[0];
  const lowest2 = (k) => {
    let least = Infinity;
    for (let j = 0;j < columns; j++)
      least = Math.min(least, ground[k * columns + j]);
    return least;
  };
  const wet = (k) => water !== null && water[k] > lowest2(k) + 0.01;
  const edge = (k, side2) => middle[k] + lean[k] * half[k] * (side2 ? -1 : 1);
  const beneath = (k, side2) => ground[k * columns + (side2 ? last : 0)];
  const decked = (k) => wet(k) || [0, 1].some((side2) => edge(k, side2) - depth - beneath(k, side2) > HEADROOM + (lies?.[k] ? fill : 0));
  const drop = (k, side2) => edge(k, side2) - Math.max(beneath(k, side2), wet(k) ? water[k] : -Infinity);
  const from = (k) => (k ? (s[k - 1] + s[k]) / 2 : s[0]) - s[0];
  const to = (k) => (k < n - 1 ? (s[k] + s[k + 1]) / 2 : s[n - 1]) - s[0];
  const runsOf = (test) => {
    const runs = [];
    for (let k = 0;k < n; k++) {
      if (!test(k))
        continue;
      if (runs.length && runs.at(-1)[1] >= from(k) - 0.000000001)
        runs.at(-1)[1] = to(k);
      else
        runs.push([from(k), to(k)]);
    }
    return runs;
  };
  const decks = runsOf(decked).reduce((joined, run) => {
    if (joined.length && run[0] - joined.at(-1)[1] < SPAN)
      joined.at(-1)[1] = run[1];
    else
      joined.push(run);
    return joined;
  }, []).filter(([a, b]) => b - a >= DECK_LEAST || s.some((at, k) => at - s[0] >= a && at - s[0] <= b && wet(k)));
  const boundary = ends.map((pin, end) => {
    if (!Array.isArray(pin))
      return null;
    const k = end ? n - 1 : 0;
    return [0, 1].map((side2) => pin.length >= 5 ? pin[3 + side2] : decked(k) && drop(k, side2) > RAIL2 ? 1 : 0);
  });
  const full = (end, side2) => (boundary[end]?.[side2] ?? 0) >= 1 - 0.000001;
  const barriers = [], heights = [];
  for (const side2 of [0, 1]) {
    const runs = decks.filter(([a, b]) => s.some((at, k) => at - s[0] >= a - 0.000001 && at - s[0] <= b + 0.000001 && drop(k, side2) > RAIL2)).map((run) => [...run]);
    if (full(0, side2) && !(runs[0]?.[0] <= 0.000001))
      runs.unshift([0, 0]);
    if (full(1, side2) && !(runs.at(-1)?.[1] >= total - 0.000001))
      runs.push([total, total]);
    runs.splice(0, runs.length, ...runs.reduce((joined, run) => {
      if (joined.length && run[0] - joined.at(-1)[1] < BARRIER_GAP)
        joined.at(-1)[1] = run[1];
      else
        joined.push(run);
      return joined;
    }, []));
    const pieces = runs.map(([a, b]) => {
      const knots = [];
      if (a <= 0.000001 && full(0, side2))
        knots.push([0, 1]);
      else
        knots.push([Math.max(a - RAMP, 0), Math.max(1 - a / RAMP, 0)], [a, 1]);
      if (b >= total - 0.000001 && full(1, side2))
        knots.push([total, 1]);
      else
        knots.push([b, 1], [Math.min(b + RAMP, total), Math.max(1 - (total - b) / RAMP, 0)]);
      return knots.filter(([at], i) => i === 0 || at > knots[i - 1][0] + 0.000000001);
    });
    boundary.forEach((h, end) => {
      const share = h?.[side2] ?? 0;
      if (share <= 0.000001 || share >= 1 - 0.000001)
        return;
      pieces.push(end ? [[total - share * RAMP, 0], [total, share]] : [[0, share], [share * RAMP, 0]]);
    });
    const merged = mergedOf(pieces);
    barriers.push(merged.map((knots) => [knots[0][0], knots.at(-1)[0]]));
    heights.push(merged);
  }
  const station = (at) => {
    const t = Math.min(Math.max(at / total, 0), 1) * (n - 1);
    const k = Math.min(Math.floor(t), n - 2);
    return [k, t - k];
  };
  const read = (values, at) => {
    const [k, f] = station(at);
    return values[k] * (1 - f) + values[k + 1] * f;
  };
  const groundAt = (at, across) => {
    const [k, f] = station(at);
    const j = Math.min(Math.max((1 - across / read(half, at)) * last / 2, 0), last);
    const [i, g] = [Math.min(Math.floor(j), last - 1), j - Math.min(Math.floor(j), last - 1)];
    const cell = (kk, jj) => ground[kk * columns + jj];
    return (cell(k, i) * (1 - g) + cell(k, i + 1) * g) * (1 - f) + (cell(k + 1, i) * (1 - g) + cell(k + 1, i + 1) * g) * f;
  };
  const side = postSide(width);
  const posts = [];
  const arcade = [];
  for (const [a, b] of decks) {
    const [first, end] = [a <= 0.000001 && ends[0] === null, b >= total - 0.000001 && (ends[1] === null || Array.isArray(ends[1]))];
    const [start, stop] = [first ? a + side / 2 : a, end ? Array.isArray(ends[1]) ? b : b - side / 2 : b];
    const count = Math.max(1, Math.ceil((stop - start) / SPAN - 0.000000001));
    if (arches)
      arcade.push(arcadeOf({ a, b, first, end, places: Array.from({ length: (end ? count : count - 1) - (first ? 0 : 1) + 1 }, (_, i) => start + (stop - start) * (i + (first ? 0 : 1)) / count), each: (stop - start) / count, groundAt, read, middle, lean, half, depth, water: water && ((at) => read(water, at)) }));
    for (let i = first ? 0 : 1;i <= (end ? count : count - 1); i++) {
      const at = start + (stop - start) * i / count;
      const reach = read(half, at) - side / 2 - 0.1;
      for (const t of [reach, -reach]) {
        const top = read(middle, at) + read(lean, at) * t - depth;
        if (top - groundAt(at, t) < LEAST_POST)
          continue;
        const foot = Math.min(...[-1, 1].flatMap((u) => [-1, 1].map((v) => groundAt(Math.min(Math.max(at + u * side / 2, 0), total), t + v * side / 2)))) - EMBED;
        posts.push({ s: at, t, side, top: top + 0.05, foot });
      }
    }
  }
  return { decks, barriers, heights, posts, ...arches && { arcade } };
}, arcadeOf = ({ a, b, first, end, places, each, groundAt, read, middle, lean, half, depth, water }) => {
  const thick = pierOf(each);
  const ground = (from, to) => {
    let [lowest2, highest] = [Infinity, -Infinity];
    for (let i = 0;i <= 8; i++) {
      const at = from + (to - from) * i / 8;
      const reach = read(half, at);
      for (let j = -2;j <= 2; j++) {
        const z = groundAt(at, reach * j / 2);
        lowest2 = Math.min(lowest2, z);
        highest = Math.max(highest, z, water?.(at) ?? -Infinity);
      }
    }
    return { lowest: lowest2, highest };
  };
  const supports = places.map((at, i) => {
    const [s0, s1] = first && i === 0 ? [a, a + thick] : end && i === places.length - 1 ? [b - thick, b] : [at - thick / 2, at + thick / 2];
    return { kind: "pier", s0: Math.max(s0, a), s1: Math.min(s1, b) };
  });
  if (!first)
    supports.unshift({ kind: "wall", s0: a, s1: a });
  if (!end)
    supports.push({ kind: "wall", s0: b, s1: b });
  for (const support of supports)
    support.foot = ground(support.s0, Math.max(support.s1, support.s0 + 0.01)).lowest - EMBED;
  const pieces = [];
  supports.forEach((support, k) => {
    if (support.kind === "pier")
      pieces.push(support);
    const next = supports[k + 1];
    if (!next || next.s0 - support.s1 < 0.000001)
      return;
    const [l, r] = [support.s1, next.s0];
    const { lowest: lowest2, highest } = ground(l, r);
    const top = Math.min(...[1, -1].map((sign) => read(middle, (l + r) / 2) + read(lean, (l + r) / 2) * read(half, (l + r) / 2) * sign)) - Math.max(ARCHES.crown, depth);
    const spring = Math.max(top - (r - l) * ARCHES.reach, highest + ARCHES.spring, support.foot + EMBED, next.foot + EMBED);
    const rise = top - spring;
    pieces.push(r - l >= ARCHES.clear && rise >= Math.max(ARCHES.rise, (r - l) / 8) ? { kind: "arch", l, r, spring, rise } : { kind: "solid", s0: l, s1: r, foot: lowest2 - EMBED });
  });
  return { a, b, thick, pieces };
}, mergedOf = (pieces) => {
  const sorted = pieces.filter((knots) => knots.length > 1 && knots.at(-1)[0] - knots[0][0] > 0.000001).sort((a, b) => a[0][0] - b[0][0]);
  return sorted.reduce((runs, knots) => {
    const before = runs.at(-1);
    if (!before || knots[0][0] > before.at(-1)[0] + 0.000001)
      return [...runs, knots];
    const at = [...new Set([...before, ...knots].map(([s]) => Math.round(s * 1e6) / 1e6))].sort((a, b) => a - b);
    runs[runs.length - 1] = at.map((s) => [s, Math.max(shareIn(before, s), shareIn(knots, s))]);
    return runs;
  }, []);
}, shareIn = (knots, at) => {
  if (at < knots[0][0] - 0.000000001 || at > knots.at(-1)[0] + 0.000000001)
    return 0;
  const i = Math.max(knots.findIndex(([s]) => s >= at - 0.000000001), 1);
  const [[s0, h0], [s1, h1]] = [knots[i - 1], knots[i]];
  return s1 - s0 > 0.000000001 ? h0 + (h1 - h0) * (at - s0) / (s1 - s0) : Math.max(h0, h1);
}, barrierAt = (stand, side, at) => Math.max(0, ...stand.heights[side].map((knots) => shareIn(knots, at))), sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], cross4 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], unit4 = (a) => {
  const length2 = Math.hypot(...a);
  return length2 > 0 ? a.map((v) => v / length2) : a;
}, structureOf = ({ params, sections, stand, ends, polygon, placeAt, level = 3, rail: height = RAIL2, ramped = true }) => {
  const { depth, width, points } = params;
  const closed = points.length > 3 && points[0][0] === points.at(-1)[0] && points[0][1] === points.at(-1)[1];
  const last = sections[0].row.length - 1;
  const decked = (at) => stand.decks.some(([a, b]) => at > a - 0.000001 && at < b + 0.000001);
  const deckOf = (k) => decked((sections[Math.min(k, sections.length - 2)].s + sections[Math.min(k, sections.length - 2) + 1].s) / 2);
  const foot = (deck, section, [x, y, z]) => [x, y, deck ? z - depth : section.bottom];
  const side = (a, b) => cross4(sub3(b, a), [0, 0, 1]);
  for (let k = 0;k + 1 < sections.length; k++) {
    const [a, b] = [sections[k], sections[k + 1]];
    const deck = deckOf(k);
    const [aLeft, aRight, bLeft, bRight] = [a.row[0], a.row[last], b.row[0], b.row[last]];
    const [aLow, bLow, bLowRight, aLowRight] = [foot(deck, a, aLeft), foot(deck, b, bLeft), foot(deck, b, bRight), foot(deck, a, aRight)];
    polygon(2, [aLow, bLow, bLowRight, aLowRight], [0, 0, -1], [[0, a.s], [0, b.s], [width, b.s], [width, a.s]]);
    polygon(1, [aLeft, aLow, bLow, bLeft], side(aLeft, bLeft).map((v) => -v), [[a.s, 0], [a.s, aLow[2] - aLeft[2]], [b.s, bLow[2] - bLeft[2]], [b.s, 0]]);
    polygon(1, [aRight, bRight, bLowRight, aLowRight], side(aRight, bRight), [[a.s, 0], [b.s, 0], [b.s, bLowRight[2] - bRight[2]], [a.s, aLowRight[2] - aRight[2]]]);
  }
  for (let k = 1;k + 1 < sections.length; k++) {
    if (deckOf(k - 1) === deckOf(k))
      continue;
    const section = sections[k];
    const { row } = section;
    const outward = side(row[last], row[0]).map((v) => v * (deckOf(k) ? 1 : -1));
    const outline = [foot(true, section, row[0]), foot(true, section, row[last]), foot(false, section, row[last]), foot(false, section, row[0])];
    polygon(1, outline, outward, outline.map(([, , z], j) => [j === 1 || j === 2 ? width : 0, z - row[0][2]]));
  }
  if (!closed) {
    for (const [k, sign, end] of [[0, -1, 0], [sections.length - 1, 1, 1]]) {
      if (!ends[end])
        continue;
      const section = sections[k];
      const { row } = section;
      const deck = deckOf(k ? k - 1 : 0);
      const outline = [...row, foot(deck, section, row[last]), foot(deck, section, row[0])];
      polygon(1, outline, side(row[last], row[0]).map((v) => v * sign), outline.map(([, , z], j) => [j < row.length ? width * j / last : j === row.length ? width : 0, z - row[0][2]]));
    }
  }
  if (params.columns === 2 && stand.arcade)
    arcadeDrawn({ arcade: stand.arcade, sections, polygon, depth, width, level, last });
  for (const { s, t, side: breadth, top, foot: base } of params.columns === 2 && stand.arcade ? [] : stand.posts) {
    const { middle, offset } = placeAt(s);
    const left = unit4([offset[0], offset[1], 0]);
    const along = [left[1], -left[0], 0];
    const centre = [middle[0] + left[0] * t, middle[1] + left[1] * t];
    if (params.columns === 1) {
      const r = breadth / 2;
      const sides = level >= FINE ? ROUND_SIDES : ROUND_SIDES_FAR;
      const way = (angle) => [along[0] * Math.cos(angle) + left[0] * Math.sin(angle), along[1] * Math.cos(angle) + left[1] * Math.sin(angle)];
      for (let i = 0;i < sides; i++) {
        const [a, b] = [i, i + 1].map((n) => 2 * Math.PI * n / sides);
        const [p, q, mid] = [way(a), way(b), way((a + b) / 2)];
        const [u0, u1] = [r * a, r * b];
        polygon(1, [[centre[0] + p[0] * r, centre[1] + p[1] * r, base], [centre[0] + q[0] * r, centre[1] + q[1] * r, base], [centre[0] + q[0] * r, centre[1] + q[1] * r, top], [centre[0] + p[0] * r, centre[1] + p[1] * r, top]], [mid[0], mid[1], 0], [[u0, 0], [u1, 0], [u1, top - base], [u0, top - base]]);
      }
      continue;
    }
    const corner = (u, v, z) => [centre[0] + (along[0] * u + left[0] * v) * (breadth / 2), centre[1] + (along[1] * u + left[1] * v) * (breadth / 2), z];
    for (const [u0, v0, u1, v1] of [[-1, -1, 1, -1], [1, -1, 1, 1], [1, 1, -1, 1], [-1, 1, -1, -1]]) {
      const [a, b] = [corner(u0, v0, base), corner(u1, v1, base)];
      const outward = [(u0 + u1) * along[0] + (v0 + v1) * left[0], (u0 + u1) * along[1] + (v0 + v1) * left[1], 0];
      polygon(1, [a, b, [b[0], b[1], top], [a[0], a[1], top]], outward, [[0, 0], [breadth, 0], [breadth, top - base], [0, top - base]]);
    }
  }
  const style = params.barrier ?? 0;
  const face = params.barrier === undefined ? 1 : 3;
  if (style === 2)
    return;
  stand.barriers.forEach((runs, which) => {
    const edge = which ? last : 0;
    runs.forEach(([from, to], r) => {
      const knots = stand.heights?.[which]?.[r];
      const along = sections.filter(({ s }) => s > from - 0.000001 && s < to + 0.000001);
      if (along.length < 2)
        return;
      if (style === 1 && ramped)
        return guardrailOf({ along, edge, last, knots, polygon, face, from, to, posts: level >= FINE });
      const lines = along.map(({ s, row }) => {
        const [outer, other] = [row[edge], row[last - edge]];
        const inward = unit4(sub3(other, outer));
        const inner = outer.map((v, k) => v + inward[k] * BARRIER);
        const rise = height * (ramped && knots ? shareIn(knots, s) : 1);
        const up = (point) => [point[0], point[1], point[2] + rise];
        return { s, outer, inner, outerTop: up(outer), innerTop: up(inner), inward, rise };
      });
      for (let k = 0;k + 1 < lines.length; k++) {
        const [a, b] = [lines[k], lines[k + 1]];
        if (a.rise < 0.001 && b.rise < 0.001)
          continue;
        polygon(face, [a.outer, b.outer, b.outerTop, a.outerTop], a.inward.map((v) => -v), [[a.s, 0], [b.s, 0], [b.s, b.rise], [a.s, a.rise]]);
        polygon(face, [a.outerTop, b.outerTop, b.innerTop, a.innerTop], [0, 0, 1], [[a.s, 0], [b.s, 0], [b.s, BARRIER], [a.s, BARRIER]]);
        polygon(face, [a.inner, a.innerTop, b.innerTop, b.inner], a.inward, [[a.s, 0], [a.s, a.rise], [b.s, b.rise], [b.s, 0]]);
      }
      for (const [line, beside] of [[lines[0], lines[1]], [lines.at(-1), lines.at(-2)]]) {
        if (line.rise < 0.001)
          continue;
        const outward = sub3(line.outer, beside.outer);
        polygon(face, [line.outer, line.inner, line.innerTop, line.outerTop], outward, [[0, 0], [BARRIER, 0], [BARRIER, line.rise], [0, line.rise]]);
      }
    });
  });
}, arcadeDrawn = ({ arcade, sections, polygon, depth, width, level, last }) => {
  const segments = ARCHES.segments[level] ?? ARCHES.segments.at(-1);
  const edgesAt = (at) => {
    const found = sections.findIndex(({ s }) => s >= at - 0.000000001);
    const k = found < 0 ? sections.length - 1 : Math.max(found, 1);
    const [p, q] = [sections[k - 1], sections[k]];
    const f = q.s - p.s > 0.000000001 ? Math.min(Math.max((at - p.s) / (q.s - p.s), 0), 1) : 0;
    const mix = (u, v) => u.map((x, i) => x + (v[i] - x) * f);
    return [mix(p.row[0], q.row[0]), mix(p.row[last], q.row[last])];
  };
  const side = (a, b) => cross4(sub3(b, a), [0, 0, 1]);
  const across = (at, low, high, way) => {
    const [left, right] = edgesAt(at);
    const [topLeft, topRight] = high === null ? [left[2] - depth, right[2] - depth] : [high, high];
    polygon(1, [[left[0], left[1], low], [right[0], right[1], low], [right[0], right[1], topRight], [left[0], left[1], topLeft]], way, [[0, 0], [width, 0], [width, topRight - low], [0, topLeft - low]]);
  };
  for (const { a, b, pieces } of arcade) {
    const way = (from, to) => {
      const [p, q] = [edgesAt(from)[0], edgesAt(to)[0]];
      return [q[0] - p[0], q[1] - p[1], 0];
    };
    pieces.forEach((piece, k) => {
      const arch2 = piece.kind === "arch";
      const [s0, s1] = arch2 ? [piece.l, piece.r] : [piece.s0, piece.s1];
      if (s1 - s0 < 0.000001)
        return;
      const at = new Set([s0, s1, ...sections.map(({ s }) => s).filter((s) => s > s0 + 0.000001 && s < s1 - 0.000001)]);
      if (arch2)
        for (let i = 1;i < segments; i++)
          at.add(s0 + (s1 - s0) * i / segments);
      const lines = [...at].sort((p, q) => p - q).map((s) => {
        const [left, right] = edgesAt(s);
        return { s, left, right, low: arch2 ? archAt(piece, s) : piece.foot };
      });
      for (let i = 0;i + 1 < lines.length; i++) {
        const [p, q] = [lines[i], lines[i + 1]];
        const [pl, ql, pr, qr] = [p.left, q.left, p.right, q.right];
        polygon(1, [[pl[0], pl[1], pl[2] - depth], [pl[0], pl[1], p.low], [ql[0], ql[1], q.low], [ql[0], ql[1], ql[2] - depth]], side(pl, ql).map((v) => -v), [[p.s, -depth], [p.s, p.low - pl[2]], [q.s, q.low - ql[2]], [q.s, -depth]]);
        polygon(1, [[pr[0], pr[1], pr[2] - depth], [qr[0], qr[1], qr[2] - depth], [qr[0], qr[1], q.low], [pr[0], pr[1], p.low]], side(pr, qr), [[p.s, -depth], [q.s, -depth], [q.s, q.low - qr[2]], [p.s, p.low - pr[2]]]);
        if (arch2)
          polygon(1, [[pl[0], pl[1], p.low], [pr[0], pr[1], p.low], [qr[0], qr[1], q.low], [ql[0], ql[1], q.low]], [0, 0, -1], [[0, p.s], [width, p.s], [width, q.s], [0, q.s]]);
      }
      if (!arch2)
        return;
      const [before, after] = [pieces[k - 1], pieces[k + 1]];
      if (before)
        across(piece.l, before.foot, piece.spring, way(piece.l, piece.r));
      if (after)
        across(piece.r, after.foot, piece.spring, way(piece.r, piece.l));
    });
    const [first, final] = [pieces[0], pieces.at(-1)];
    if (first?.kind === "pier" && first.s0 <= a + 0.000001)
      across(a, first.foot, null, way(Math.min(a + 1, b), a));
    if (final?.kind === "pier" && final.s1 >= b - 0.000001)
      across(b, final.foot, null, way(Math.max(b - 1, a), b));
  }
}, guardrailOf = ({ along, edge, last, knots, polygon, face, from, to, posts }) => {
  const { top, beam, thick, post, gap } = GUARDRAIL;
  const shareAt = (s) => knots ? shareIn(knots, s) : 1;
  const lineAt = (s) => {
    const k = Math.min(Math.max(along.findIndex(({ s: at2 }) => at2 >= s - 0.000000001), 1), along.length - 1);
    const [a, b] = [along[k - 1], along[k]];
    const f = b.s - a.s > 0.000000001 ? Math.min(Math.max((s - a.s) / (b.s - a.s), 0), 1) : 0;
    const [outerA, outerB] = [a.row[edge], b.row[edge]];
    const outer = outerA.map((v, i) => v + (outerB[i] - v) * f);
    const inward = unit4(sub3(a.row[last - edge], outerA));
    return { outer, inward, along: unit4(sub3(outerB, outerA)) };
  };
  const at = ({ outer, inward }, across, up) => [outer[0] + inward[0] * across, outer[1] + inward[1] * across, outer[2] + up];
  const [back, front] = [BARRIER - thick, BARRIER];
  for (let k = 0;k + 1 < along.length; k++) {
    const [sa, sb] = [along[k].s, along[k + 1].s];
    const [ha, hb] = [shareAt(sa), shareAt(sb)];
    if (ha < 0.001 && hb < 0.001)
      continue;
    const [a, b] = [lineAt(sa), lineAt(sb)];
    const corner = (line, across, share, high) => at(line, across, (high ? top : top - beam) * share);
    const [aBackLow, aBackHigh, aFrontLow, aFrontHigh] = [corner(a, back, ha, false), corner(a, back, ha, true), corner(a, front, ha, false), corner(a, front, ha, true)];
    const [bBackLow, bBackHigh, bFrontLow, bFrontHigh] = [corner(b, back, hb, false), corner(b, back, hb, true), corner(b, front, hb, false), corner(b, front, hb, true)];
    const inward = a.inward;
    polygon(face, [aFrontLow, bFrontLow, bFrontHigh, aFrontHigh], inward, [[sa, 0], [sb, 0], [sb, beam], [sa, beam]]);
    polygon(face, [aBackLow, aBackHigh, bBackHigh, bBackLow], inward.map((v) => -v), [[sa, 0], [sa, beam], [sb, beam], [sb, 0]]);
    polygon(face, [aBackHigh, aFrontHigh, bFrontHigh, bBackHigh], [0, 0, 1], [[sa, 0], [sa, thick], [sb, thick], [sb, 0]]);
    polygon(face, [aBackLow, bBackLow, bFrontLow, aFrontLow], [0, 0, -1], [[sa, 0], [sb, 0], [sb, thick], [sa, thick]]);
  }
  for (const [k, beside] of [[0, 1], [along.length - 1, along.length - 2]]) {
    const share = shareAt(along[k].s);
    if (share < 0.001)
      continue;
    const line = lineAt(along[k].s);
    const end = (across, high) => at(line, across, (high ? top : top - beam) * share);
    polygon(face, [end(back, false), end(front, false), end(front, true), end(back, true)], sub3(along[k].row[edge], along[beside].row[edge]), [[0, 0], [thick, 0], [thick, beam * share], [0, beam * share]]);
  }
  if (!posts)
    return;
  const count = Math.max(1, Math.ceil((to - from) / gap - 0.000000001));
  for (let i = 0;i <= count; i++) {
    const s = from + (to - from) * i / count;
    const share = shareAt(s);
    if (share < 0.05)
      continue;
    const line = lineAt(s);
    const height = top * share;
    const [u, v] = [line.along, line.inward];
    const centre = at(line, back - post / 2, 0);
    const corner = (du, dv, z) => [centre[0] + (u[0] * du + v[0] * dv) * (post / 2), centre[1] + (u[1] * du + v[1] * dv) * (post / 2), centre[2] + z];
    for (const [u0, v0, u1, v1] of [[-1, -1, 1, -1], [1, -1, 1, 1], [1, 1, -1, 1], [-1, 1, -1, -1]]) {
      const outward = [(u0 + u1) * u[0] + (v0 + v1) * v[0], (u0 + u1) * u[1] + (v0 + v1) * v[1], 0];
      polygon(face, [corner(u0, v0, 0), corner(u1, v1, 0), corner(u1, v1, height), corner(u0, v0, height)], outward, [[0, 0], [post, 0], [post, height], [0, height]]);
    }
    polygon(face, [corner(-1, -1, height), corner(1, -1, height), corner(1, 1, height), corner(-1, 1, height)], [0, 0, 1], [[0, 0], [post, 0], [post, post], [0, post]]);
  }
};
var init_road_level = __esm(() => {
  BARRIER_GAP = 2 * RAMP;
  GUARDRAIL = Object.freeze({ top: 0.75, beam: 0.32, thick: 0.05, post: 0.15, gap: 2 });
  DECK_LEAST = SPAN / 2;
  ARCHES = Object.freeze({ share: 0.18, least: 0.8, most: 2.2, cap: 0.4, crown: 0.75, reach: 0.5, spring: 0.5, rise: 0.5, clear: 0.8, segments: Object.freeze([6, 8, 12, 16]) });
});

// src/build/kinds/road.js
var LIFT = 0.1, EVERY = 1, ACROSS = 1.5, SAMPLES = 2048, STRIDES, MITRE = 3, FILL = 2, FALL = 2, GUARDRAIL_STEEL = "metal/bare/metal-0025", GRADE = 30, PIN_RISE = 32, PIN_SLOPE = 2, leveller = null, levelling = null, whenLevelled = () => levelling ??= Promise.resolve().then(() => (init_road_level(), exports_road_level)).then((module) => {
  leveller = module;
  if (!HERE)
    tellKind("road");
  return module;
}, (error) => {
  levelling = null;
  console.error("levelled roads unavailable (asked for again when one is drawn):", error);
  throw error;
}), levelledOf = (params) => params.level > 0 && params.ground.length > 0, keepPin = (pin) => pin === "ground" ? pin : Array.isArray(pin) && (pin.length === 3 || pin.length === 5) && pin.every(Number.isFinite) && Math.abs(pin[0]) <= PIN_RISE && Math.abs(pin[1]) <= PIN_SLOPE && Math.abs(pin[2]) <= PIN_SLOPE && pin.slice(3).every((v) => v >= 0 && v <= 1) ? pin.map((v) => Math.round(v * 1000) / 1000) : null, keepEnds = (value) => {
  const ends = Array.isArray(value) && value.length === 2 ? value.map(keepPin) : [];
  return ends.some(Boolean) ? ends : [];
}, lengthsOf = (points) => {
  let travelled = 0;
  return points.slice(1).map((to, i) => {
    const from = points[i];
    const length2 = Math.hypot(to[0] - from[0], to[1] - from[1]);
    const start = travelled;
    travelled += length2;
    return { from, to, length: length2, start, along: [(to[0] - from[0]) / length2, (to[1] - from[1]) / length2] };
  });
}, closedOf = (points) => points.length > 3 && points[0][0] === points.at(-1)[0] && points[0][1] === points.at(-1)[1], ROUND3 = 6, ARC, SHARP, roundCorners = (points, width, { least = 0.02, heightAt = null } = {}) => {
  if (points.length < 3)
    return points;
  const radius = Math.max(ROUND3, 2 * width);
  const out = [points[0]];
  for (let i = 1;i < points.length - 1; i++) {
    const [before, corner, after] = [points[i - 1], points[i], points[i + 1]];
    const [l1, l2] = [Math.hypot(corner[0] - before[0], corner[1] - before[1]), Math.hypot(after[0] - corner[0], after[1] - corner[1])];
    if (l1 < 0.000001 || l2 < 0.000001) {
      out.push(corner);
      continue;
    }
    const [u1, u2] = [[(corner[0] - before[0]) / l1, (corner[1] - before[1]) / l1], [(after[0] - corner[0]) / l2, (after[1] - corner[1]) / l2]];
    const turn2 = Math.atan2(u1[0] * u2[1] - u1[1] * u2[0], u1[0] * u2[0] + u1[1] * u2[1]);
    if (Math.abs(turn2) < least) {
      out.push(corner);
      continue;
    }
    const tangent = Math.min(radius * Math.tan(Math.abs(turn2) / 2), 0.45 * l1, 0.45 * l2);
    const r = tangent / Math.tan(Math.abs(turn2) / 2);
    const start = [corner[0] - u1[0] * tangent, corner[1] - u1[1] * tangent];
    const side = Math.sign(turn2);
    const centre = [start[0] - u1[1] * r * side, start[1] + u1[0] * r * side];
    const from = Math.atan2(start[1] - centre[1], start[0] - centre[0]);
    const steps = Math.max(2, Math.ceil(Math.abs(turn2) / ARC));
    const [z0, z1] = [corner[2] + (before[2] - corner[2]) * tangent / l1, corner[2] + (after[2] - corner[2]) * tangent / l2];
    for (let k = 0;k <= steps; k++) {
      const [x, y] = [centre[0] + r * Math.cos(from + turn2 * k / steps), centre[1] + r * Math.sin(from + turn2 * k / steps)];
      out.push([x, y, heightAt ? heightAt(x, y) : z0 + (z1 - z0) * k / steps]);
    }
  }
  out.push(points.at(-1));
  return out;
}, roundsOf = (params) => params.round > 0 || params.grade !== undefined, roundedOf, totalOf = (points) => points.slice(1).reduce((sum, to, i) => sum + Math.hypot(to[0] - points[i][0], to[1] - points[i][1]), 0), pathOf = (params) => {
  const path = roundsOf(params) ? roundedOf({ points: params.points, width: params.width }) : null;
  if (!path)
    return params.points;
  if (!params.ground?.length)
    return path;
  return columnsOf(params, totalOf(path)) || !columnsOf(params, totalOf(params.points)) ? path : params.points;
}, samplesAcross = (width) => Math.min(9, Math.max(3, Math.ceil(width / ACROSS) + 1)), samplesAlong = (total, across) => Math.min(Math.floor(SAMPLES / across), Math.max(2, Math.round(total / EVERY) + 1)), leftOf = ([x, y]) => [-y, x], sectionAt = (lengths, closed, width, s) => {
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
    const mitre = unit2([a[0] + b[0], a[1] + b[1], 0]);
    const reach = Math.min(1 / Math.max(mitre[0] * b[0] + mitre[1] * b[1], 0.000001), MITRE);
    offset = [mitre[0] * reach * (width / 2), mitre[1] * reach * (width / 2)];
  }
  return { middle, offset };
}, rowOf = ({ middle, offset }, columns) => Array.from({ length: columns }, (_, j) => {
  const t = 1 - 2 * j / (columns - 1);
  return [middle[0] + offset[0] * t, middle[1] + offset[1] * t];
}), groundSites = (params) => {
  const points = pathOf(params);
  const { width } = params;
  const lengths = lengthsOf(points);
  const closed = closedOf(points);
  const total = lengths.at(-1).start + lengths.at(-1).length;
  const across = samplesAcross(width);
  const count = samplesAlong(total, across);
  return Array.from({ length: count }, (_, k) => rowOf(sectionAt(lengths, closed, width, total * k / (count - 1)), across)).flat();
}, columnsOf = ({ ground, width }, total) => [samplesAcross(width), 2].find((columns) => ground.length === columns * samplesAlong(total, columns)) ?? null, groundAt = ({ points, ground }, lengths, total, columns, s) => {
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
}, cornersOf = (lengths, closed, width) => lengths.flatMap((after, i) => {
  if (i === 0 && !closed)
    return [];
  const before = lengths[(i - 1 + lengths.length) % lengths.length];
  const [a, b] = [before.along, after.along];
  const turn2 = Math.abs(a[0] * b[1] - a[1] * b[0]) / Math.max(1 + a[0] * b[0] + a[1] * b[1], 0.000001);
  const cut2 = Math.min(width / 2 * turn2, MITRE * (width / 2));
  return i === 0 ? [{ at: 0, cut: cut2 }, { at: after.start + lengths.reduce((sum, { length: length2 }) => sum + length2, 0), cut: cut2 }] : [{ at: after.start, cut: cut2 }];
}), levelOf, samplesOf = (params) => {
  const points = pathOf(params);
  const { width } = params;
  const lengths = lengthsOf(points);
  const closed = closedOf(points);
  const total = lengths.at(-1).start + lengths.at(-1).length;
  const columns = columnsOf(params, total);
  if (!columns)
    return null;
  const count = params.ground.length / columns;
  const s = Array.from({ length: count }, (_, k) => total * k / (count - 1));
  const water = params.water?.length === count ? params.water : null;
  return { ground: params.ground, columns, s, half: s.map((at) => Math.hypot(...sectionAt(lengths, closed, width, at).offset)), water };
}, sectionsOf = (params, level) => {
  const points = pathOf(params);
  const { width } = params;
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
  const levelled = columns && levelledOf(params) ? levelOf(params) : null;
  for (const at of levelled?.stand ? [...levelled.stand.decks.flat(), ...levelled.stand.heights.flat(2).map(([s]) => s)] : []) {
    if (corners.every(({ at: corner, cut: cut2 }) => Math.abs(at - corner) > cut2 + 0.000001) && [...along].every((each) => Math.abs(each - at) > 0.001))
      along.add(at);
  }
  const lift = params.lift ?? LIFT;
  return [...along].sort((a, b) => a - b).map((s) => {
    const at = closed && s >= total - 0.000000001 ? 0 : s;
    const heights = groundAt({ points, ground: params.ground }, lengths, total, columns, at);
    const section = sectionAt(lengths, closed, width, s);
    const row = rowOf(section, heights.length);
    if (!levelled)
      return { s, row: row.map(([x, y], j) => [x, y, heights[j] + lift]) };
    const stations = levelled.middle.length;
    const t = Math.min(Math.max(at / total, 0), 1) * (stations - 1);
    const k = Math.min(Math.floor(t), stations - 2), f = t - k;
    const [middle, lean, share] = [levelled.middle, levelled.lean, levelled.share].map((values) => values[k] * (1 - f) + values[k + 1] * f);
    const half = Math.hypot(...section.offset);
    const last = heights.length - 1;
    return {
      s,
      row: row.map(([x, y], j) => [x, y, (1 - share) * (heights[j] + lift) + share * (middle + lean * half * (1 - 2 * j / last))]),
      bottom: Math.min(...heights) + lift - params.depth
    };
  });
}, standingOf = (params) => levelledOf(params) && leveller ? levelOf(params)?.stand ?? null : null, placerOf = (params) => {
  const points = pathOf(params);
  const { width } = params;
  const [lengths, closed] = [lengthsOf(points), closedOf(points)];
  return (s) => sectionAt(lengths, closed, width, s);
}, footprintOf2, centreOf2 = (params) => {
  const { min, max } = footprintOf2(params);
  return min.map((v, k) => (v + max[k]) / 2);
}, upToMillimetre2 = (v) => Math.ceil(v * 1000 - 0.000001) / 1000, road;
var init_road = __esm(async () => {
  init_mesh();
  init_ready();
  STRIDES = [8, 4, 2, 1];
  if (HERE)
    await whenLevelled();
  ARC = 8 * Math.PI / 180;
  SHARP = 15 * Math.PI / 180;
  roundedOf = remembered(({ points, width }) => {
    const path = roundCorners(points, width, { least: SHARP });
    return path.length === points.length ? null : path;
  });
  levelOf = remembered((params) => {
    const samples = levelledOf(params) && leveller ? samplesOf(params) : null;
    if (!samples)
      return null;
    const ends = params.ends?.length === 2 ? params.ends : [null, null];
    const grade = params.grade === undefined ? null : params.grade / 100;
    const levelled = leveller.levelRoad({
      ...samples,
      width: params.width,
      lift: params.lift ?? LIFT,
      fill: params.fill ?? FILL,
      fall: (params.fall ?? FALL) / 100,
      ends,
      grade,
      depth: params.depth
    });
    const stand = grade === null ? null : leveller.standOf({ ...samples, middle: levelled.middle, lean: levelled.lean, lies: levelled.lies, fill: params.fill ?? FILL, depth: params.depth, width: params.width, ends, arches: params.columns === 2 });
    return { ...levelled, stand };
  });
  footprintOf2 = remembered((params) => {
    const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
    const stand = standingOf(params);
    const barred = (s) => (params.barrier !== 2 && stand?.barriers.some((runs) => runs.some(([a, b]) => s > a - 0.000001 && s < b + 0.000001))) ?? false;
    const barrier = () => params.barrier === 1 ? leveller.GUARDRAIL.top : leveller.RAIL;
    for (const { s, row, bottom } of sectionsOf(params, 3)) {
      for (const [x, y, z] of row) {
        [x, y].forEach((v, k) => {
          min[k] = Math.min(min[k], v);
          max[k] = Math.max(max[k], v);
        });
        min[2] = Math.min(min[2], bottom ?? z - params.depth);
        max[2] = Math.max(max[2], z + (barred(s) ? barrier() : 0));
      }
    }
    for (const { foot } of stand?.posts ?? [])
      min[2] = Math.min(min[2], foot);
    for (const { pieces } of stand?.arcade ?? [])
      for (const { foot } of pieces)
        if (foot !== undefined)
          min[2] = Math.min(min[2], foot);
    return { min, max };
  });
  road = Object.freeze({
    name: "road",
    label: "Road",
    description: "A road or path along points, on the ground: a ribbon as wide as asked, its edges mitred at each point, its surface on the heights of the ground sampled under it about every metre along it and every metre and a half across, a slab under it as deep as asked. Levelled over the land, its surface is straight across and along it the smoothest line between its ends, never under the ground and no more than its fill over it — its rises gone over, its dips filled, its low side and its ends raised on walls down to the ground —, the land left as it is. Two points make a straight length; a last point on the first closes it round. Its box is what it makes.",
    faces: (params) => params.barrier !== undefined ? ["surface", "sides", "underside", "barriers"] : ["surface", "sides", "underside"],
    shape: "cube",
    sized: true,
    size: [8, 3, 0.3],
    sizeNote: "what its points, width and depth make (m)",
    labelOf: ({ width }) => width < 2 ? "Path" : "Road",
    material: "ground/gravel/rocky-trail",
    params: [
      { name: "width", label: "Width", min: 0.5, max: 12, default: 3, step: 0.05, description: "How wide it is (m)." },
      { name: "depth", label: "Depth", min: 0.05, max: 1, default: 0.3, step: 0.01, description: "How far its slab goes down under its surface (m), so that where the ground is not quite where its samples say, no gap shows." },
      { name: "lift", label: "Lift", min: 0.02, max: 0.5, default: LIFT, step: 0.01, optional: true, description: "How far its surface stands over the ground (m): 10 cm, so that no bulge between two samples shows through; a ring that roads run into stands a little more over them, so that they do not fight." },
      { name: "level", label: "Levelling", min: 0, max: 1, default: 0, step: 1, options: ["none", "over"], labels: ["None: as the ground", "Over the land"], optional: true, description: "Whether its surface lies on the ground as it is (none) or is levelled over the land: straight across within its cross-fall, and along it as straight as it can be between its ends — bent only where the ground or its fill makes it —, never under the ground — a dip filled, its low side and its ends raised on walls —, the land itself left as it is." },
      { name: "fill", label: "Fill", min: 0, max: 8, default: FILL, step: 0.1, optional: true, when: (params) => params.level > 0, description: "Levelled, how far over its ground it may stand to keep level (m), over the highest of the ground across it: a dip filled up to so much, its walls as much taller; a valley deeper it goes down into, so much over it; 0 keeps every rise and dip of it." },
      { name: "grade", label: "Steepest grade", min: 1, max: 100, default: GRADE, step: 0.5, optional: true, when: (params) => params.level > 0, description: "Levelled, the most it may ever climb or fall along (%): 30 as the road tool lays it. It keeps to 12.5 % (a bridge's grade) wherever its ends and the ground let it, steeper only where they force it — the taut line over the ground between its ends —; on the ground within its fill where its walls keep it so, raised on columns up to 10 m over the ground where they cannot (a valley deeper it goes down into), a barrier along each deck on a side that drops more than a barrier stands, none along its walls. None: as steep as its fill makes it, on its walls." },
      { name: "fall", label: "Cross-fall", min: 0, max: 100, default: FALL, step: 0.5, optional: true, when: (params) => params.level > 0, description: "Levelled, how much it may lean across (%): as the ground leans, but no more; where the ground leans more, its low side stands raised on a wall. 2 % is a real road's; 0 level from edge to edge." },
      { name: "round", label: "Corners", min: 0, max: 1, default: 0, step: 1, options: ["sharp", "rounded"], labels: ["As its points", "Rounded"], optional: true, description: "Whether it rounds its own corners — every point it turns more than 15° at — as the road tool rounds a road it lays: arcs of 6 m or twice its width, a tangent no more than 45 % of a straight, a point every 8°, whatever made its points (the tool, a point dragged in the editor, a file). Rounded, it no longer runs through the point at a corner. A road with a grade rounds them too; one written with neither runs through its points as they are." },
      { name: "columns", label: "Columns", min: 0, max: 2, default: 0, step: 1, options: ["square", "round", "arches"], labels: ["Square", "Round", "Arches"], optional: true, when: (params) => params.level > 0 && params.grade !== undefined, description: "Under a grade, what holds it up where it stands on a deck: square columns, an eighth of its width a side (as the road tool laid them before it had this), round ones as wide, or arches as a stone bridge's — a pier across the road at each column's place, between each two an arch, a semicircle where the ground leaves room and flatter where it is near, solid stone where too low —, open under it: what walks or drives under passes through. Of what it stands on (its sides' face)." },
      { name: "barrier", label: "Barriers", min: 0, max: 2, default: 0, step: 1, options: ["parapet", "guardrail", "none"], labels: ["A parapet", "A steel guardrail", "None"], optional: true, when: (params) => params.level > 0 && params.grade !== undefined, description: "Under a grade, what bars its decks where they drop: a parapet 1.05 m tall and 0.25 m thick, a steel guardrail (a beam 0.75 m over the road on posts 2 m apart) or none. Said, its barriers wear a face of their own (its fourth); a road written without it barred with a parapet of what it stands on. Whatever it is drawn as, a barrier collides as a wall 3 m tall; none collides as nothing." },
      { name: "points", label: "Path", points: [2, 32], min: -31.5, max: 31.5, step: 0.001, default: [[-4, 0, 0.1], [4, 0, 0.1]], description: "The points it runs through: [x, y, z] in metres in its own frame, z the ground there; two at least; a last one on the first closes it round." },
      { name: "ground", label: "Ground", heights: [0, SAMPLES], min: -31.5, max: 31.5, step: 0.001, default: [], description: "The ground's height under it (m, in its own frame), as the editor that laid it measured it: at each place sampled along it, from its left edge to its right; none: straight between its points' heights." },
      { name: "water", label: "Water", heights: [0, SAMPLES], min: -31.5, max: 31.5, step: 0.001, default: [], optional: true, description: "The water's surface over it (m, in its own frame), as the editor that laid it measured it, at each place sampled along it: where water stands over the ground there; else the lowest of the ground across it. None: dry. Levelled under a grade, its underside stands 0.3 m over the water and it is a deck there, on columns down to the bed." },
      { name: "ends", label: "Ends", list: true, optional: true, fixed: true, min: -PIN_RISE, max: PIN_RISE, step: 0.001, default: [], keep: keepEnds, description: `Levelled, its start and its end as the road tool levelled the whole road through them, so that its parts meet as one whichever is levelled again: each [rise, grade, lean] — its middle over the ground there (m), how much it rises along it and to its left across it (m a m) —, under a grade with two more, its barrier's height there on its left and its right (a share of it, 0–1: so that a barrier goes on into the next part as one), "ground" where it runs under a ring (on the ground there, as the ring is), or null: free, level across as the rest of it, resting on the highest of its ground.` }
    ],
    footprint: footprintOf2,
    overhead: (params) => {
      if (levelledOf(params) && !leveller)
        return null;
      const stand = standingOf(params);
      return { sections: sectionsOf(params, 3).map(({ s, row }) => ({ s, row })), depth: params.depth, ...stand && { decks: stand.decks, posts: stand.posts, arcade: params.columns === 2 ? stand.arcade ?? null : null } };
    },
    redress: (params, name, faces) => name !== "barrier" || params.barrier === 2 ? null : { 3: params.barrier === 1 ? GUARDRAIL_STEEL : faces[1]?.texture ?? null },
    settle: (params, heightAt, indices, waterAt) => {
      const points = params.points.map(([x, y]) => [x, y, heightAt(x, y)]);
      const sites = groundSites({ ...params, points, ground: [] });
      const ground = sites.map(([x, y]) => heightAt(x, y));
      const { ends, water: _, ...settled } = { ...params, points, ground };
      const across = samplesAcross(params.width);
      const wet = waterAt ? sites.map(([x, y], k) => {
        const surface = waterAt(x, y);
        return surface !== null && surface > ground[k] + 0.01 ? surface : null;
      }) : [];
      if (wet.some((v) => v !== null)) {
        settled.water = Array.from({ length: sites.length / across }, (_2, k) => {
          const row = wet.slice(k * across, (k + 1) * across).filter((v) => v !== null);
          return row.length ? Math.max(...row) : Math.min(...ground.slice(k * across, (k + 1) * across));
        });
      }
      const last = params.points.length - 1;
      const kept2 = ends?.length === 2 ? ends.map((pin, end) => Array.isArray(indices) && indices.includes(end ? last : 0) ? null : pin) : [];
      return kept2.some(Boolean) ? { ...settled, ends: kept2 } : settled;
    },
    fit: (params, size) => {
      if (levelledOf(params) && !leveller && size)
        return [...size];
      const { min, max } = footprintOf2(params);
      return max.map((v, k) => upToMillimetre2(v - min[k]));
    },
    prepare: () => {
      whenLevelled().catch(() => {});
    },
    waiting: (params) => {
      if (!levelledOf(params) || leveller)
        return false;
      whenLevelled().catch(() => {});
      return true;
    },
    resize: (params, size) => {
      const spread = [0, 1].map((k) => Math.max(...params.points.map((p) => p[k])) - Math.min(...params.points.map((p) => p[k])));
      const width = spread[1] <= 0.000000001 ? size[1] : spread[0] <= 0.000000001 ? size[0] : params.width;
      const { min, max } = footprintOf2({ ...params, width });
      const scale4 = [0, 1].map((k) => spread[k] > 0.000000001 ? Math.max(size[k] - (max[k] - min[k] - spread[k]), 0) / spread[k] : 1);
      const depth = params.depth + size[2] - (max[2] - min[2]);
      return { ...params, width, depth, points: params.points.map(([x, y, z]) => [x * scale4[0], y * scale4[1], z]) };
    },
    mesh: (params, seed, level, size) => {
      const mesh = createMesh(params.barrier !== undefined ? 4 : 3);
      const closed = closedOf(params.points);
      const sections = sectionsOf(params, level);
      const down = ({ bottom }, [x, y, z]) => [x, y, bottom ?? z - params.depth];
      const drop = ({ bottom }, [, , z]) => bottom === undefined ? -params.depth : bottom - z;
      const columns = sections[0].row.length;
      const last = columns - 1;
      const u = (j) => params.width * j / last;
      const top = sections.map(({ s, row }, k) => {
        const [before, after] = [sections[Math.max(k - 1, 0)].row, sections[Math.min(k + 1, sections.length - 1)].row];
        return row.map((point, j) => {
          const normal = unit2(cross3(sub2(row[Math.min(j + 1, last)], row[Math.max(j - 1, 0)]), sub2(after[j], before[j])));
          return mesh.vertex(0, point, normal, [u(j), s]);
        });
      });
      for (let k = 0;k + 1 < sections.length; k++)
        for (let j = 0;j < last; j++)
          mesh.quad(0, top[k][j], top[k][j + 1], top[k + 1][j + 1], top[k + 1][j]);
      const stand = standingOf(params);
      if (stand) {
        leveller.structureOf({ params, sections, stand, ends: [true, true], polygon: mesh.polygon, placeAt: placerOf(params), level });
        return mesh.pack(size, centreOf2(params));
      }
      for (let k = 0;k + 1 < sections.length; k++) {
        const [a, b] = [sections[k], sections[k + 1]];
        const [aLeft, aRight, bLeft, bRight] = [a.row[0], a.row[last], b.row[0], b.row[last]];
        mesh.polygon(2, [down(a, aLeft), down(b, bLeft), down(b, bRight), down(a, aRight)], [0, 0, -1], [[0, a.s], [0, b.s], [params.width, b.s], [params.width, a.s]]);
        mesh.polygon(1, [aLeft, down(a, aLeft), down(b, bLeft), bLeft], cross3(sub2(bLeft, aLeft), [0, 0, 1]).map((v) => -v), [[a.s, 0], [a.s, drop(a, aLeft)], [b.s, drop(b, bLeft)], [b.s, 0]]);
        mesh.polygon(1, [aRight, bRight, down(b, bRight), down(a, aRight)], cross3(sub2(bRight, aRight), [0, 0, 1]), [[a.s, 0], [b.s, 0], [b.s, drop(b, bRight)], [a.s, drop(a, aRight)]]);
      }
      if (!closed) {
        for (const [section, sign] of [[sections[0], -1], [sections.at(-1), 1]]) {
          const { row } = section;
          const outward = cross3(sub2(row[0], row[last]), [0, 0, 1]).map((v) => v * sign);
          const outline = [...row, down(section, row[last]), down(section, row[0])];
          mesh.polygon(1, outline, outward, [...row.map((point, j) => [u(j), point[2] - row[0][2]]), [params.width, row[last][2] - row[0][2] + drop(section, row[last])], [0, drop(section, row[0])]]);
        }
      }
      return mesh.pack(size, centreOf2(params));
    },
    collider: (params) => {
      if (levelledOf(params) && !leveller)
        return [];
      const centre = centreOf2(params);
      const sections = sectionsOf(params, 3);
      const columns = sections[0].row.length;
      const positions = sections.flatMap(({ row }) => row.flatMap((point) => point.map((v, k) => v - centre[k])));
      const indices = sections.slice(1).flatMap((_, k) => Array.from({ length: columns - 1 }, (_2, j) => {
        const [a, b] = [k * columns + j, (k + 1) * columns + j];
        return [a, a + 1, b + 1, a, b + 1, b];
      }).flat());
      const stand = standingOf(params);
      if (stand) {
        leveller.structureOf({ params, sections, stand, ends: [0, 1].map((end) => !params.ends?.[end]), placeAt: placerOf(params), rail: leveller.GUARD, ramped: false, polygon: (face, points, outward) => {
          const first = positions.length / 3;
          for (const point of points)
            positions.push(point[0] - centre[0], point[1] - centre[1], point[2] - centre[2]);
          const hub = points.length - 1;
          for (let i = 0;i + 1 < hub; i++) {
            const normal = cross3(sub2(points[i], points[hub]), sub2(points[i + 1], points[hub]));
            const turned2 = normal[0] * outward[0] + normal[1] * outward[1] + normal[2] * outward[2] < 0;
            indices.push(first + hub, first + (turned2 ? i + 1 : i), first + (turned2 ? i : i + 1));
          }
        } });
      } else if (sections[0].bottom !== undefined) {
        const foot = positions.length / 3;
        for (const { row, bottom } of sections)
          for (const j of [0, columns - 1])
            positions.push(row[j][0] - centre[0], row[j][1] - centre[1], bottom - centre[2]);
        sections.slice(1).forEach((_, k) => {
          const [left, right] = [[k * columns, (k + 1) * columns, foot + 2 * k, foot + 2 * k + 2], [k * columns + columns - 1, (k + 1) * columns + columns - 1, foot + 2 * k + 1, foot + 2 * k + 3]];
          indices.push(left[0], left[3], left[2], left[0], left[1], left[3], right[0], right[2], right[3], right[0], right[3], right[1]);
        });
        if (!closedOf(params.points)) {
          for (const [k, beside, end] of [[0, 1, 0], [sections.length - 1, sections.length - 2, 1]]) {
            if (params.ends?.[end])
              continue;
            const { row, bottom } = sections[k];
            const feet = positions.length / 3;
            for (const [x, y] of row)
              positions.push(x - centre[0], y - centre[1], bottom - centre[2]);
            const middleOf2 = ({ row: points }) => [(points[0][0] + points[columns - 1][0]) / 2, (points[0][1] + points[columns - 1][1]) / 2, 0];
            const outward = sub2(middleOf2(sections[k]), middleOf2(sections[beside]));
            const facing = cross3(sub2(row[1], row[0]), [0, 0, -1]);
            const flip = facing[0] * outward[0] + facing[1] * outward[1] < 0;
            for (let j = 0;j < columns - 1; j++) {
              const [top, nextTop, base, nextBase] = [k * columns + j, k * columns + j + 1, feet + j, feet + j + 1];
              indices.push(...flip ? [top, nextBase, nextTop, top, base, nextBase] : [top, nextTop, nextBase, top, nextBase, base]);
            }
          }
        }
      }
      return [{ type: "mesh", positions: Float32Array.from(positions), indices: Uint32Array.from(indices) }];
    }
  });
});

// src/build/kinds/bridge.js
var STYLES, STYLE_NAMES, MOST_SAMPLES = 128, LAMP_MODES, LEAST_SPACING = 12, LOOKS, LOOK_LABELS, LABELS, bridge;
var init_bridge = __esm(() => {
  STYLES = Object.freeze({
    timber: Object.freeze({ label: "Logs", maxSpan: 8, maxPier: 10, least: 0.6, depth: 0.62, embed: 0.4, thick: Object.freeze({ least: 0.9, most: 0.9 }), lamp: Object.freeze({ inset: 0.16, post: 0.12 }), width: 2.4 }),
    stone: Object.freeze({ label: "Stone arches", maxSpan: 12, maxPier: 16, least: 3, depth: 0.75, embed: 1, thick: Object.freeze({ share: 0.18, least: 0.8, most: 2.2, cap: 0.4 }), lamp: Object.freeze({ inset: 0.2, post: 0.3 }), width: 2.4 }),
    clapper: Object.freeze({ label: "Clapper slabs", maxSpan: 3, maxPier: 2.5, least: 0.5, depth: 0.4, embed: 0.3, thick: Object.freeze({ least: 0.9, most: 0.9 }), lamp: Object.freeze({ inset: 0.2, post: 0.3 }), width: 1.8, widest: 3, railed: false }),
    rope: Object.freeze({ label: "Rope and plank", maxSpan: 60, maxPier: 0, least: 2, depth: 0.1, embed: 0.5, thick: Object.freeze({ least: 0.4, most: 0.4 }), lamp: Object.freeze({ inset: 0.2, post: 0.14 }), width: 1.6, widest: 2, sag: 0.03, above: 1.8 }),
    girder: Object.freeze({ label: "Girder", maxSpan: 20, maxPier: 18, least: 1, depth: 0.9, embed: 1, thick: Object.freeze({ least: 1, most: 1 }), lamp: Object.freeze({ inset: 0.12, post: 0.14 }), width: 3.6 }),
    suspension: Object.freeze({ label: "Suspension", maxSpan: 60, maxPier: 25, least: 2, depth: 0.7, embed: 1, thick: Object.freeze({ least: 1.4, most: 1.4 }), lamp: Object.freeze({ inset: 0.12, post: 0.14 }), width: 3.2, tower: Object.freeze({ share: 0.16, least: 4, most: 10 }) })
  });
  STYLE_NAMES = Object.freeze(Object.keys(STYLES));
  LAMP_MODES = Object.freeze(["none", "ends", "piers", "spaced"]);
  LOOKS = Object.freeze({
    timber: Object.freeze({
      oak: Object.freeze(["wood/floor/weathered-brown-planks", "wood/logs/bark-brown-01", "wood/planks/brown-planks-03"]),
      dark: Object.freeze(["wood/floor/weathered-planks", "wood/logs/bark-willow", "wood/planks/dark-planks"]),
      pine: Object.freeze(["wood/floor/wood-planks-grey", "wood/logs/knotted-pine-bark", "wood/planks/rough-wood"]),
      mossy: Object.freeze(["wood/planks/wooden-rough-planks", "wood/logs/jolcham-oak-bark-01", "wood/planks/wood-065"])
    }),
    stone: Object.freeze({
      rustic: Object.freeze(["paving/cobblestone/cobblestone-pavement", "masonry/stone-blocks/rustic-stone-wall-02", "masonry/stone-blocks/medieval-blocks-03"]),
      granite: Object.freeze(["paving/cobblestone/cobblestone-002", "masonry/stone-blocks/japanese-stone-wall", "masonry/stone-blocks/stone-tile-wall"]),
      sandstone: Object.freeze(["paving/cobblestone/cobblestone-floor-13", "masonry/stone-blocks/sandstone-blocks-08", "masonry/stone-blocks/rock-wall-06"]),
      mossy: Object.freeze(["paving/cobblestone/cobblestone-floor-08", "ground/rock/rock-040", "ground/rock/rock-046l"]),
      brick: Object.freeze(["masonry/brick/red-brick-pavers", "masonry/brick/medieval-red-brick", "masonry/brick/red-brick"])
    }),
    clapper: Object.freeze({
      granite: Object.freeze(["ground/rock/rock-001", "masonry/stone-blocks/stone-wall-04", "masonry/stone-blocks/defense-wall"]),
      slate: Object.freeze(["paving/tiles/slab-tiles", "masonry/stone-blocks/volcanic-rock-tiles", "masonry/stone-blocks/rock-wall-16"]),
      mossy: Object.freeze(["paving/cobblestone/cobblestone-floor-08", "masonry/rubble/rock-wall-02", "ground/rock/rock-046l"]),
      sandstone: Object.freeze(["paving/stone/travertine-001", "masonry/stone-blocks/sandstone-blocks-08", "masonry/stone-blocks/rock-wall-06"])
    }),
    rope: Object.freeze({
      hemp: Object.freeze(["wood/planks/rough-wood", "wood/logs/bark-brown-02", "fabric/cloth/rope-001"]),
      dark: Object.freeze(["wood/planks/dark-planks", "wood/logs/bark-willow", "fabric/cloth/rope-003"]),
      mossy: Object.freeze(["wood/planks/wooden-rough-planks", "wood/logs/jolcham-oak-bark-01", "fabric/cloth/rope-001"]),
      steel: Object.freeze(["wood/floor/wood-planks-grey", "wood/logs/knotted-pine-bark", "fabric/cloth/rope-002"])
    }),
    girder: Object.freeze({
      concrete: Object.freeze(["paving/asphalt/clean-asphalt", "plaster/concrete/concrete-slab-wall", "metal/bare/metal-046a"]),
      steel: Object.freeze(["paving/asphalt/asphalt-02", "metal/bare/metal-039", "metal/bare/metal-046b"]),
      rusted: Object.freeze(["metal/rusted/metal-plate-02", "metal/rusted/rusty-metal-05", "metal/rusted/rusty-metal-04"]),
      white: Object.freeze(["plaster/concrete/concrete-floor-03", "metal/painted/metal-016", "metal/painted/painted-metal-012"])
    }),
    suspension: Object.freeze({
      orange: Object.freeze(["paving/asphalt/clean-asphalt", "metal/painted/painted-metal-008", "metal/painted/painted-metal-008"]),
      grey: Object.freeze(["paving/asphalt/asphalt-02", "metal/bare/metal-039", "metal/bare/metal-046a"]),
      white: Object.freeze(["plaster/concrete/concrete-floor-03", "metal/painted/metal-016", "metal/painted/painted-metal-012"]),
      planked: Object.freeze(["wood/floor/weathered-planks", "metal/painted/metal-027", "metal/painted/metal-027"])
    })
  });
  LOOK_LABELS = Object.freeze({
    oak: "Oak",
    dark: "Dark wood",
    pine: "Aged pine",
    mossy: "Mossy",
    rustic: "Rustic stone",
    granite: "Granite",
    sandstone: "Sandstone",
    brick: "Red brick",
    slate: "Slate",
    hemp: "Hemp and pine",
    steel: "Steel",
    concrete: "Concrete",
    rusted: "Rusted steel",
    white: "White",
    orange: "Orange",
    grey: "Grey steel",
    planked: "Plank deck"
  });
  LABELS = Object.freeze(["Log bridge", "Stone bridge", "Clapper bridge", "Rope bridge", "Girder bridge", "Suspension bridge"]);
  bridge = Object.freeze({
    name: "bridge",
    label: "Bridge",
    description: "A bridge from A to B over ground that falls away between them: its deck from bank to bank, evenly spaced spans across the gap on piers — of logs, of stone arches, of slabs laid on piles (clapper), of planks hung on ropes (rope), of a deck on girders or of a deck hung from cables between towers (suspension). It keeps its two points (their z the deck's height there), the ground under the chord, and how far the deck is raised over water; the bridge is worked out from them. One part, 60 m at most; a longer crossing is two bridges that meet on a pier. Its box is what it makes.",
    faces: ["deck", "structure", "rails"],
    shape: "cube",
    sized: true,
    size: [8, 2.4, 3],
    sizeNote: "what its points, width and the ground under it make (m)",
    labelOf: ({ style }) => LABELS[style] ?? "Bridge",
    bed: true,
    lookedBy: "style",
    looks: LOOKS,
    lookLabels: LOOK_LABELS,
    params: [
      { name: "style", label: "Style", min: 0, max: STYLE_NAMES.length - 1, default: 0, step: 1, options: STYLE_NAMES, labels: STYLE_NAMES.map((name) => STYLES[name].label), description: "Logs: planks on stringers and bents of posts, spans to 8 m, piers to 10 m. Stone: arches, spans to 12 m, piers to 16 m. Clapper: slabs on piles of blocks over a stream, spans to 3 m, piles to 2.5 m, no railings. Rope: planks hung on ropes from an anchor post at each bank, one span to 60 m, no piers, 2 m wide at the most. Girder: a deck of concrete on girders over hammerhead piers, spans to 20 m, piers to 18 m. Suspension: a stiff deck hung from cables over a tower at each support, spans to 60 m, piers to 25 m." },
      { name: "width", label: "Width", min: 0.8, max: 12, default: 2.4, step: 0.05, description: "How wide the deck is, railings included (m): 2–3 for walkers, 4–6 for a lane." },
      { name: "railing", label: "Railings", min: 0, max: 2, default: 1, step: 1, options: ["none", "both", "open"], when: (params) => STYLES[STYLE_NAMES[params.style]]?.railed !== false, description: "Along both sides: none; both — posts and two rails of logs, a parapet of stone, a rope and a second below it, steel posts and two rails —; open — posts and a rope of logs, a low wall of stone, one rope, one steel rail. A clapper bridge has none." },
      { name: "arch", label: "Arch", min: 0, max: 2, default: 0, step: 1, options: ["round", "pointed", "segmental"], when: (params) => params.style === 1, description: "The shape of the stone arches: round (a semicircle where there is room), pointed (two arcs meeting at a crown, taller; round where the ground leaves no room for the point) or segmental (a flat quarter of the opening)." },
      { name: "lamps", label: "Lamps", min: 0, max: LAMP_MODES.length - 1, default: 0, step: 1, options: LAMP_MODES, labels: ["None", "Ends", "Piers", "Spaced"], description: "A post and a lantern on it: none; at the ends (a pair at each); at the piers and the ends, in turn on each side; or spaced down the deck, in turn on each side. Never more than 8. The lanterns are parts of their own (kind lantern), kept at their posts by the editor and added by the importer." },
      { name: "spacing", label: "Spacing", min: LEAST_SPACING, max: 40, default: 16, step: 1, when: (params) => params.lamps === 3, description: "How far apart spaced lamps stand down the deck (m): 12 at the least, so that the lights of a place stay within its budget." },
      { name: "lights", label: "Lights", min: 0, max: 1, default: 1, step: 1, options: ["off", "night"], labels: ["Off", "At night"], when: (params) => params.lamps > 0, description: "Whether the lanterns are lit: off, dark glass; at night, glowing and lighting 8 m round them from dusk. Each lantern's own light can be changed on its card." },
      { name: "rise", label: "Rise", min: 0, max: 4, default: 0, step: 0.01, description: "How far the deck is raised in the middle over the straight line between its ends (m), by ramps no steeper than 1 in 8: to clear water, or a hump. A deck hung from ropes (rope) is never raised: this takes the slack out of its sag instead, no more than its sag." },
      { name: "points", label: "Path", points: [2, 2], min: -31.5, max: 31.5, step: 0.001, default: [[-4, 0, 0], [4, 0, 0]], description: "Its two ends, A and B: [x, y, z] in metres in its own frame, z the deck's height there, where it meets the bank." },
      { name: "ground", label: "Ground", heights: [0, MOST_SAMPLES], min: -31.5, max: 31.5, step: 0.001, default: [], description: "The ground under the chord (m, in its own frame), as the editor that laid it measured it: evenly from A to B, about every metre; none: nothing to cross." }
    ]
  });
});

// src/build/kinds/house.js
var STYLES2, STYLE_NAMES2, ROOFS, WIDEST = 40, FACES, BUDGET, LOOKS2, LOOK_LABELS2, LABELS2, house;
var init_house = __esm(() => {
  STYLES2 = Object.freeze({
    box: Object.freeze({ label: "White box", ground: Object.freeze({ front: "ribbon", back: "punched", side: "tall", beside: "slot" }), upper: Object.freeze({ front: "ribbon", back: "ribbon", side: "tall", beside: "slot" }), over: 0, eave: 0, parapet: 0.45, shape: "setback", apart: "none", roofs: Object.freeze(["flat", "mono"]), door: "plain", forms: Object.freeze({ accent: 0.6, canopy: 0.5, carport: 0.4, balcony: 0.45, pergola: 0.5, chimney: 0.25 }), bay: 0, crown: null, sweep: false, veranda: false, wing: false, end: null, grand: false, portico: null, logs: false, blade: false, stand: null }),
    wood: Object.freeze({ label: "Timber", ground: Object.freeze({ front: "punched", back: "punched", side: "tall", beside: "slot" }), upper: Object.freeze({ front: "punched", back: "tall", side: "punched", beside: "slot" }), over: 0, eave: 0.3, parapet: 0, shape: "same", apart: "upper", roofs: Object.freeze(["mono", "gable", "butterfly"]), door: "panelled", forms: Object.freeze({ accent: 0, canopy: 0.5, carport: 0.4, balcony: 0.45, pergola: 0, chimney: 0.6 }), bay: 0, crown: null, sweep: false, veranda: false, wing: false, end: null, grand: false, portico: null, logs: false, blade: false, stand: null }),
    glass: Object.freeze({ label: "Glass", ground: Object.freeze({ front: "full", back: "full", side: "full", beside: "blank" }), upper: Object.freeze({ front: "full", back: "full", side: "full", beside: "blank" }), over: 0.8, eave: 1.1, parapet: 0, shape: "same", apart: "none", roofs: Object.freeze(["flat", "butterfly", "mono"]), door: "glazed", forms: Object.freeze({ accent: 0, canopy: 0, carport: 0.4, balcony: 0, pergola: 0, chimney: 0 }), bay: 0, crown: null, sweep: false, veranda: false, wing: false, end: null, grand: false, portico: null, logs: false, blade: false, stand: null }),
    stack: Object.freeze({ label: "Stacked", ground: Object.freeze({ front: "full", back: "punched", side: "punched", beside: "slot" }), upper: Object.freeze({ front: "full", back: "tall", side: "ribbon", beside: "slot" }), over: 0, eave: 0, parapet: 0.45, shape: "stack", apart: "odd", roofs: Object.freeze(["flat"]), door: "plain", forms: Object.freeze({ accent: 0, canopy: 0.5, carport: 0.4, balcony: 0.4, pergola: 0.6, chimney: 0.2 }), bay: 0, crown: null, sweep: false, veranda: false, wing: false, end: null, grand: false, portico: null, logs: false, blade: false, stand: null }),
    chalet: Object.freeze({ label: "Chalet", ground: Object.freeze({ front: "punched", back: "punched", side: "punched", beside: "slot" }), upper: Object.freeze({ front: "punched", back: "punched", side: "punched", beside: "slot" }), over: 0, eave: 0, parapet: 0, shape: "same", apart: "none", roofs: Object.freeze(["steep"]), door: "panelled", forms: Object.freeze({ accent: 0, canopy: 0, carport: 0.35, balcony: 0, pergola: 0, chimney: 0.5 }), bay: 0.38, crown: "vault", sweep: true, veranda: false, wing: false, end: null, grand: false, portico: null, logs: false, blade: false, stand: "middle" }),
    lodge: Object.freeze({ label: "Lodge", ground: Object.freeze({ front: "punched", back: "punched", side: "full", beside: "slot" }), upper: Object.freeze({ front: "punched", back: "punched", side: "punched", beside: "slot" }), over: 0, eave: 0, parapet: 0, shape: "same", apart: "none", roofs: Object.freeze(["steep"]), door: "glazed", forms: Object.freeze({ accent: 0, canopy: 0, carport: 0, balcony: 0, pergola: 0, chimney: 0.6 }), bay: 0.45, crown: "gable", sweep: true, veranda: true, wing: false, end: null, grand: false, portico: null, logs: false, blade: false, stand: "middle" }),
    barn: Object.freeze({ label: "Barn house", ground: Object.freeze({ front: "tall", back: "punched", side: "full", beside: "slot" }), upper: Object.freeze({ front: "tall", back: "punched", side: "full", beside: "slot" }), over: 0, eave: 0, parapet: 0, shape: "same", apart: "none", roofs: Object.freeze(["steep", "gable"]), door: "glazed", forms: Object.freeze({ accent: 0, canopy: 0, carport: 0, balcony: 0, pergola: 0, chimney: 0.5 }), bay: 0, crown: null, sweep: false, veranda: false, wing: true, end: "glass", grand: false, portico: null, logs: false, blade: false, stand: null }),
    manor: Object.freeze({ label: "Manor", ground: Object.freeze({ front: "sash", back: "sash", side: "sash", beside: "sash" }), upper: Object.freeze({ front: "sash", back: "sash", side: "sash", beside: "sash" }), over: 0, eave: 0.6, parapet: 0, shape: "same", apart: "upper", roofs: Object.freeze(["hip"]), door: "panelled", forms: Object.freeze({ accent: 0, canopy: 0, carport: 0, balcony: 0, pergola: 0, chimney: 0.9 }), bay: 0, crown: null, sweep: false, veranda: false, wing: false, end: null, grand: true, portico: "columns", logs: false, blade: false, stand: null }),
    villa: Object.freeze({ label: "Villa", ground: Object.freeze({ front: "full", back: "full", side: "full", beside: "full" }), upper: Object.freeze({ front: "full", back: "full", side: "full", beside: "full" }), over: 1.8, eave: 2.2, parapet: 0, shape: "same", apart: "upper", roofs: Object.freeze(["flat"]), door: "glazed", forms: Object.freeze({ accent: 0, canopy: 0, carport: 0, balcony: 0, pergola: 0, chimney: 0 }), bay: 0, crown: null, sweep: false, veranda: false, wing: false, end: null, grand: true, portico: null, logs: false, blade: false, stand: null }),
    cabin: Object.freeze({ label: "Log cabin", ground: Object.freeze({ front: "punched", back: "punched", side: "punched", beside: "slot" }), upper: Object.freeze({ front: "punched", back: "punched", side: "punched", beside: "slot" }), over: 0, eave: 0, parapet: 0, shape: "same", apart: "none", roofs: Object.freeze(["gable", "steep"]), door: "panelled", forms: Object.freeze({ accent: 0, canopy: 0, carport: 0, balcony: 0, pergola: 0, chimney: 0 }), bay: 0, crown: null, sweep: false, veranda: false, wing: false, end: null, grand: false, portico: null, logs: true, blade: false, stand: null }),
    cantilever: Object.freeze({ label: "Cantilever", ground: Object.freeze({ front: "full", back: "punched", side: "full", beside: "slot" }), upper: Object.freeze({ front: "ribbon", back: "ribbon", side: "full", beside: "slot" }), over: 0, eave: 0, parapet: 0.45, shape: "jut", apart: "upper", roofs: Object.freeze(["flat", "mono"]), door: "plain", forms: Object.freeze({ accent: 0, canopy: 0.4, carport: 0, balcony: 0.4, pergola: 0.4, chimney: 0.2 }), bay: 0, crown: null, sweep: false, veranda: false, wing: false, end: null, grand: false, portico: null, logs: false, blade: false, stand: null }),
    plates: Object.freeze({ label: "Layered", ground: Object.freeze({ front: "full", back: "punched", side: "full", beside: "slot" }), upper: Object.freeze({ front: "full", back: "tall", side: "full", beside: "slot" }), over: 1, eave: 1.6, parapet: 0, shape: "shift", apart: "none", roofs: Object.freeze(["flat"]), door: "glazed", forms: Object.freeze({ accent: 0, canopy: 0, carport: 0, balcony: 0, pergola: 0.5, chimney: 0 }), bay: 0, crown: null, sweep: false, veranda: false, wing: false, end: null, grand: false, portico: null, logs: false, blade: true, stand: null }),
    terrace: Object.freeze({ label: "Roof terrace", ground: Object.freeze({ front: "ribbon", back: "punched", side: "tall", beside: "slot" }), upper: Object.freeze({ front: "full", back: "punched", side: "full", beside: "slot" }), over: 0, eave: 1.2, parapet: 0, shape: "crown", apart: "upper", roofs: Object.freeze(["flat"]), door: "plain", forms: Object.freeze({ accent: 0, canopy: 0.5, carport: 0.4, balcony: 0, pergola: 0.8, chimney: 0 }), bay: 0, crown: null, sweep: false, veranda: false, wing: false, end: null, grand: false, portico: null, logs: false, blade: false, stand: null }),
    ell: Object.freeze({ label: "L-shaped", ground: Object.freeze({ front: "full", back: "punched", side: "tall", beside: "slot" }), upper: Object.freeze({ front: "ribbon", back: "punched", side: "tall", beside: "slot" }), over: 0, eave: 1, parapet: 0, shape: "same", apart: "none", roofs: Object.freeze(["flat"]), door: "glazed", forms: Object.freeze({ accent: 0, canopy: 0, carport: 0.35, balcony: 0, pergola: 0, chimney: 0.3 }), bay: 0.45, crown: "slab", sweep: false, veranda: false, wing: false, end: null, grand: false, portico: null, logs: false, blade: false, stand: "end" }),
    platform: Object.freeze({ label: "Platform", ground: Object.freeze({ front: "full", back: "punched", side: "tall", beside: "slot" }), upper: Object.freeze({ front: "full", back: "full", side: "full", beside: "slot" }), over: 2.4, eave: 1.2, parapet: 0, shape: "crown", apart: "upper", roofs: Object.freeze(["flat"]), door: "glazed", forms: Object.freeze({ accent: 0, canopy: 0, carport: 0, balcony: 0, pergola: 0.5, chimney: 0 }), bay: 0, crown: null, sweep: false, veranda: false, wing: false, end: null, grand: false, portico: null, logs: false, blade: false, stand: null })
  });
  STYLE_NAMES2 = Object.freeze(Object.keys(STYLES2));
  ROOFS = Object.freeze(["flat", "mono", "gable", "butterfly", "steep", "hip"]);
  FACES = Object.freeze(["walls", "walls apart", "trim", "glass", "roof", "floors", "inside"]);
  BUDGET = Object.freeze({ triangles: 5000, far: 1600, pieces: 160, doors: 4, inner: 8, lights: 6, slides: 8, materials: 6, grand: Object.freeze({ triangles: 6000, far: 2000, inner: 12 }) });
  LOOKS2 = Object.freeze({
    box: Object.freeze({
      white: Object.freeze(["plaster/plaster/plaster-001", "wood/planks/japanese-cedar-planks", "metal/painted/metal-029", "glass/clear/float", "ground/gravel/gravel-floor", "wood/floor/wood-floor-051", "plaster/plaster/plaster-001"]),
      stucco: Object.freeze(["plaster/plaster/white-stucco", "plaster/concrete/concrete-046", "plaster/concrete/concrete-046", "glass/clear/float", "ground/gravel/gravel-floor", "paving/tiles/porcelain-001", "plaster/plaster/plaster-001"]),
      concrete: Object.freeze(["plaster/concrete/concrete-034", "plaster/plaster/plaster-001", "metal/painted/metal-029", "glass/clear/bronze", "ground/gravel/gravel-floor", "wood/floor/wood-floor-051", "plaster/plaster/plaster-001"]),
      grey: Object.freeze(["plaster/plaster/painted-plaster-017", "plaster/plaster/plaster-001", "metal/painted/metal-029", "glass/clear/float", "ground/gravel/gravel-floor", "paving/stone/terrazzo-006", "plaster/plaster/plaster-001"]),
      charcoal: Object.freeze(["plaster/plaster/painted-plaster-008", "plaster/plaster/plaster-001", "plaster/concrete/concrete-046", "glass/clear/bronze", "ground/gravel/gravel-floor", "wood/floor/wood-floor-051", "plaster/plaster/plaster-001"]),
      ochre: Object.freeze(["plaster/plaster/painted-plaster-018", "plaster/plaster/plaster-001", "plaster/plaster/plaster-001", "glass/clear/float", "ground/gravel/gravel-floor", "paving/tiles/porcelain-001", "plaster/plaster/plaster-001"])
    }),
    wood: Object.freeze({
      cedar: Object.freeze(["wood/planks/japanese-cedar-planks", "wood/siding/wood-0038", "metal/painted/metal-029", "glass/clear/float", "roofing/slate/roof-slates-02", "wood/floor/wood-floor-051", "wood/planks/japanese-cedar-planks"]),
      dark: Object.freeze(["wood/siding/wood-0038", "wood/planks/walnut-veneer", "metal/painted/metal-029", "glass/clear/float", "roofing/slate/roof-slates-03", "wood/floor/wood-floor-009", "wood/planks/walnut-veneer"]),
      oak: Object.freeze(["wood/panel/oak-veneer-01", "plaster/plaster/plaster-001", "metal/painted/metal-029", "glass/clear/float", "roofing/tiles/grey-roof-tiles-02", "wood/floor/wood-floor-051", "plaster/plaster/plaster-001"]),
      boards: Object.freeze(["wood/painted/white-painted-boards", "wood/siding/wood-siding-009", "metal/painted/metal-029", "glass/clear/float", "roofing/slate/roof-slates-03", "wood/floor/wood-floor-051", "wood/painted/white-painted-boards"]),
      charred: Object.freeze(["wood/planks/weathered-plank-siding", "wood/planks/japanese-cedar-planks", "metal/painted/metal-029", "glass/clear/bronze", "metal/corrugated/corrugated-steel-009", "wood/floor/wood-floor-051", "wood/planks/japanese-cedar-planks"]),
      solar: Object.freeze(["wood/siding/wood-siding-011", "wood/painted/white-painted-boards", "metal/painted/metal-029", "glass/clear/float", "roofing/solar/solar-panel-001", "wood/floor/wood-floor-051", "wood/painted/white-painted-boards"])
    }),
    glass: Object.freeze({
      concrete: Object.freeze(["plaster/concrete/concrete-046", "plaster/concrete/concrete-046", "plaster/concrete/concrete-010", "glass/clear/float", "ground/gravel/gravel-floor", "paving/stone/travertine-009", "plaster/plaster/plaster-001"]),
      travertine: Object.freeze(["paving/stone/travertine-009", "paving/stone/travertine-009", "plaster/plaster/plaster-001", "glass/clear/float", "ground/gravel/gravel-floor", "paving/stone/marble-012", "plaster/plaster/plaster-001"]),
      walnut: Object.freeze(["wood/planks/walnut-veneer", "wood/planks/walnut-veneer", "metal/painted/metal-029", "glass/clear/bronze", "ground/gravel/gravel-floor", "wood/floor/wood-floor-051", "plaster/plaster/plaster-001"]),
      white: Object.freeze(["plaster/plaster/plaster-001", "plaster/plaster/plaster-001", "plaster/plaster/plaster-001", "glass/clear/float", "ground/gravel/gravel-floor", "paving/stone/terrazzo-006", "plaster/plaster/plaster-001"]),
      steel: Object.freeze(["plaster/plaster/painted-plaster-008", "plaster/plaster/painted-plaster-008", "metal/painted/metal-029", "glass/clear/bronze", "ground/gravel/gravel-floor", "paving/stone/terrazzo-015", "plaster/plaster/plaster-001"]),
      board: Object.freeze(["plaster/plaster/wood-textured-concrete", "plaster/plaster/wood-textured-concrete", "plaster/concrete/concrete-046", "glass/clear/float", "ground/gravel/gravel-floor", "wood/floor/wood-floor-051", "plaster/plaster/plaster-001"])
    }),
    stack: Object.freeze({
      cedar: Object.freeze(["plaster/plaster/plaster-001", "wood/planks/japanese-cedar-planks", "metal/painted/metal-029", "glass/clear/float", "ground/gravel/gravel-floor", "wood/floor/wood-floor-051", "plaster/plaster/plaster-001"]),
      concrete: Object.freeze(["plaster/concrete/concrete-046", "wood/panel/oak-veneer-01", "metal/painted/metal-029", "glass/clear/float", "ground/gravel/gravel-floor", "paving/tiles/porcelain-001", "plaster/concrete/concrete-046"]),
      stone: Object.freeze(["masonry/stone-blocks/stone-tile-wall", "plaster/plaster/white-stucco", "metal/painted/metal-029", "glass/clear/float", "ground/gravel/gravel-floor", "wood/floor/wood-floor-051", "plaster/plaster/white-stucco"]),
      charcoal: Object.freeze(["plaster/plaster/plaster-001", "plaster/plaster/painted-plaster-008", "metal/painted/metal-029", "glass/clear/float", "ground/gravel/gravel-floor", "wood/floor/wood-floor-051", "plaster/plaster/plaster-001"]),
      ochre: Object.freeze(["plaster/plaster/plaster-001", "plaster/plaster/painted-plaster-018", "metal/painted/metal-029", "glass/clear/float", "ground/gravel/gravel-floor", "paving/tiles/porcelain-001", "plaster/plaster/plaster-001"]),
      boards: Object.freeze(["plaster/plaster/painted-plaster-017", "wood/painted/white-painted-boards", "metal/painted/metal-029", "glass/clear/float", "ground/gravel/gravel-floor", "wood/floor/wood-floor-051", "wood/painted/white-painted-boards"])
    }),
    chalet: Object.freeze({
      white: Object.freeze(["plaster/plaster/plaster-001", "plaster/plaster/plaster-001", "wood/painted/white-painted-boards", "glass/clear/float", "roofing/tiles/clay-roof-tiles-03", "wood/floor/wood-floor-009", "plaster/plaster/plaster-001"]),
      blue: Object.freeze(["plaster/plaster/paint-004", "plaster/plaster/paint-004", "wood/painted/white-painted-boards", "glass/clear/float", "roofing/tiles/roofing-tiles-012c", "wood/floor/wood-floor-009", "plaster/plaster/plaster-001"]),
      timber: Object.freeze(["plaster/plaster/plaster-001", "wood/planks/japanese-cedar-planks", "metal/painted/metal-029", "glass/clear/float", "roofing/slate/roof-slates-03", "wood/floor/wood-floor-051", "plaster/plaster/plaster-001"]),
      alpine: Object.freeze(["wood/siding/wood-0038", "wood/painted/white-painted-boards", "wood/painted/white-painted-boards", "glass/clear/float", "roofing/tiles/wood-roof-shingles-002", "wood/floor/wood-floor-051", "wood/planks/japanese-cedar-planks"]),
      stone: Object.freeze(["masonry/stone-blocks/stone-tile-wall", "plaster/plaster/white-stucco", "metal/painted/metal-029", "glass/clear/float", "roofing/slate/roof-slates-03", "wood/floor/wood-floor-051", "plaster/plaster/white-stucco"]),
      ochre: Object.freeze(["plaster/plaster/painted-plaster-018", "plaster/plaster/plaster-001", "wood/painted/white-painted-boards", "glass/clear/float", "roofing/tiles/roofing-tiles-011a", "wood/floor/wood-floor-051", "plaster/plaster/plaster-001"])
    }),
    lodge: Object.freeze({
      walnut: Object.freeze(["wood/planks/walnut-veneer", "wood/painted/painted-wood-005", "metal/painted/metal-029", "glass/clear/float", "roofing/tiles/bitumen", "wood/floor/wood-floor-051", "wood/planks/walnut-veneer"]),
      charred: Object.freeze(["wood/planks/weathered-plank-siding", "wood/planks/japanese-cedar-planks", "metal/painted/metal-029", "glass/clear/bronze", "metal/corrugated/corrugated-steel-009", "wood/floor/wood-floor-051", "wood/planks/japanese-cedar-planks"]),
      white: Object.freeze(["plaster/plaster/plaster-001", "wood/painted/painted-wood-005", "metal/painted/metal-029", "glass/clear/float", "roofing/tiles/roofing-tiles-009", "paving/tiles/porcelain-001", "plaster/plaster/plaster-001"]),
      cedar: Object.freeze(["wood/planks/japanese-cedar-planks", "plaster/plaster/plaster-001", "metal/painted/metal-029", "glass/clear/float", "roofing/slate/roof-slates-03", "wood/floor/wood-floor-051", "plaster/plaster/plaster-001"]),
      stone: Object.freeze(["masonry/stone-blocks/stone-tile-wall", "wood/planks/walnut-veneer", "metal/painted/metal-029", "glass/clear/float", "roofing/tiles/bitumen", "wood/floor/wood-floor-051", "wood/planks/walnut-veneer"]),
      boards: Object.freeze(["wood/painted/white-painted-boards", "wood/painted/white-painted-boards", "metal/painted/metal-029", "glass/clear/float", "roofing/slate/roof-slates-03", "wood/floor/wood-floor-051", "wood/painted/white-painted-boards"])
    }),
    barn: Object.freeze({
      black: Object.freeze(["wood/planks/weathered-plank-siding", "plaster/plaster/plaster-001", "metal/painted/metal-029", "glass/clear/float", "metal/corrugated/corrugated-steel-009", "wood/floor/wood-floor-051", "plaster/plaster/plaster-001"]),
      white: Object.freeze(["plaster/plaster/plaster-001", "wood/planks/japanese-cedar-planks", "metal/painted/metal-029", "glass/clear/float", "roofing/slate/roof-slates-03", "wood/floor/wood-floor-051", "plaster/plaster/plaster-001"]),
      brick: Object.freeze(["masonry/brick/red-brick", "plaster/plaster/plaster-001", "metal/painted/metal-029", "glass/clear/float", "roofing/slate/roof-slates-03", "wood/floor/wood-floor-051", "plaster/plaster/plaster-001"]),
      cedar: Object.freeze(["wood/planks/japanese-cedar-planks", "plaster/plaster/painted-plaster-008", "metal/painted/metal-029", "glass/clear/float", "roofing/slate/roof-slates-03", "wood/floor/wood-floor-051", "wood/planks/japanese-cedar-planks"]),
      concrete: Object.freeze(["plaster/plaster/wood-textured-concrete", "wood/planks/walnut-veneer", "metal/painted/metal-029", "glass/clear/bronze", "metal/corrugated/corrugated-steel-009", "paving/stone/terrazzo-006", "wood/planks/walnut-veneer"]),
      boards: Object.freeze(["wood/painted/white-painted-boards", "wood/siding/wood-0038", "metal/painted/metal-029", "glass/clear/float", "roofing/slate/roof-slates-03", "wood/floor/wood-floor-051", "wood/painted/white-painted-boards"])
    }),
    manor: Object.freeze({
      stone: Object.freeze(["masonry/stone-blocks/sandstone-blocks-08", "plaster/plaster/plaster-002", "paving/stone/marble-019", "glass/clear/float", "roofing/slate/roof-slates-03", "wood/floor/herringbone-parquet", "plaster/plaster/plaster-002"]),
      white: Object.freeze(["plaster/plaster/white-stucco", "plaster/plaster/white-stucco", "paving/stone/marble-019", "glass/clear/float", "roofing/slate/roof-slates-03", "paving/stone/marble-001", "plaster/plaster/white-stucco"]),
      brick: Object.freeze(["masonry/brick/red-brick", "masonry/brick/red-brick", "paving/stone/marble-019", "glass/clear/float", "roofing/slate/roof-slates-03", "wood/floor/herringbone-parquet", "plaster/plaster/plaster-002"]),
      ochre: Object.freeze(["masonry/stone-blocks/stone-tile-wall", "plaster/plaster/painted-plaster-018", "paving/stone/marble-019", "glass/clear/float", "roofing/slate/roof-slates-02", "paving/stone/marble-019", "plaster/plaster/plaster-002"]),
      grey: Object.freeze(["plaster/plaster/painted-plaster-017", "plaster/plaster/painted-plaster-017", "paving/stone/marble-019", "glass/clear/float", "roofing/slate/roof-slates-03", "wood/floor/wood-floor-009", "plaster/plaster/plaster-002"]),
      slate: Object.freeze(["masonry/stone-blocks/stone-wall-04", "plaster/plaster/painted-plaster-006", "paving/stone/marble-019", "glass/clear/float", "roofing/slate/roof-slates-03", "wood/floor/wood-floor-009", "plaster/plaster/painted-plaster-006"])
    }),
    villa: Object.freeze({
      travertine: Object.freeze(["paving/stone/travertine-009", "plaster/plaster/plaster-001", "metal/painted/metal-029", "glass/clear/float", "ground/gravel/gravel-floor", "paving/stone/travertine-009", "plaster/plaster/plaster-001"]),
      concrete: Object.freeze(["plaster/plaster/wood-textured-concrete", "wood/planks/walnut-veneer", "metal/painted/metal-029", "glass/clear/bronze", "ground/gravel/gravel-floor", "paving/stone/terrazzo-006", "wood/planks/walnut-veneer"]),
      white: Object.freeze(["plaster/plaster/plaster-001", "plaster/plaster/plaster-001", "metal/painted/metal-029", "glass/clear/float", "ground/gravel/gravel-floor", "paving/tiles/porcelain-001", "plaster/plaster/plaster-001"]),
      cedar: Object.freeze(["masonry/stone-blocks/stone-tile-wall", "wood/planks/japanese-cedar-planks", "metal/painted/metal-029", "glass/clear/float", "ground/gravel/gravel-floor", "wood/floor/wood-floor-051", "wood/planks/japanese-cedar-planks"]),
      black: Object.freeze(["plaster/plaster/painted-plaster-008", "wood/planks/weathered-plank-siding", "plaster/plaster/painted-plaster-008", "glass/clear/bronze", "ground/gravel/gravel-floor", "wood/floor/wood-floor-051", "plaster/plaster/plaster-001"]),
      marble: Object.freeze(["paving/stone/marble-001", "paving/stone/marble-001", "metal/painted/metal-029", "glass/clear/float", "ground/gravel/gravel-floor", "paving/stone/marble-019", "plaster/plaster/plaster-001"])
    }),
    cabin: Object.freeze({
      logs: Object.freeze(["wood/planks/wooden-rough-planks", "masonry/stone-blocks/rustic-stone-wall", "wood/panel/oak-veneer-01", "glass/clear/float", "roofing/tiles/wood-shingles-001", "wood/floor/plank-flooring-03", "wood/panel/oak-veneer-01"]),
      beams: Object.freeze(["wood/planks/beam-wall-01", "masonry/stone-blocks/rustic-stone-wall-02", "wood/planks/walnut-veneer", "glass/clear/float", "roofing/tiles/wood-roof-shingles-002", "wood/floor/wood-floor-051", "wood/planks/walnut-veneer"]),
      dark: Object.freeze(["wood/planks/dark-planks", "masonry/stone-blocks/stone-wall-05", "wood/siding/wood-0038", "glass/clear/float", "roofing/slate/roof-slates-03", "wood/floor/weathered-planks", "wood/siding/wood-0038"]),
      pine: Object.freeze(["wood/planks/planks-039", "masonry/stone-blocks/medieval-blocks-06", "wood/planks/japanese-cedar-planks", "glass/clear/float", "roofing/tiles/wood-shingles-001", "wood/floor/wood-floor-051", "wood/planks/japanese-cedar-planks"]),
      brown: Object.freeze(["wood/planks/planks-brown-10", "masonry/stone-blocks/rustic-stone-wall-02", "wood/planks/walnut-veneer", "glass/clear/float", "roofing/slate/roof-slates-03", "wood/floor/plank-flooring-03", "wood/planks/walnut-veneer"]),
      weathered: Object.freeze(["wood/planks/brown-planks-07", "masonry/stone-blocks/rustic-stone-wall", "wood/siding/wood-0038", "glass/clear/float", "roofing/tiles/wood-roof-shingles-002", "wood/floor/weathered-planks", "wood/siding/wood-0038"]),
      fieldstone: Object.freeze(["masonry/stone-blocks/old-stone-wall", "masonry/stone-blocks/rustic-stone-wall-02", "wood/siding/wood-0038", "glass/clear/bronze", "metal/corrugated/corrugated-steel-009", "wood/floor/dark-wooden-planks", "wood/siding/wood-0038"])
    }),
    cantilever: Object.freeze({
      white: Object.freeze(["masonry/stone-blocks/stone-tile-wall", "plaster/plaster/plaster-001", "metal/painted/metal-029", "glass/clear/float", "ground/gravel/gravel-floor", "wood/floor/wood-floor-051", "plaster/plaster/plaster-001"]),
      cedar: Object.freeze(["plaster/plaster/painted-plaster-008", "wood/planks/japanese-cedar-planks", "metal/painted/metal-029", "glass/clear/float", "ground/gravel/gravel-floor", "wood/floor/wood-floor-051", "wood/planks/japanese-cedar-planks"]),
      concrete: Object.freeze(["plaster/plaster/wood-textured-concrete", "plaster/concrete/concrete-046", "metal/painted/metal-029", "glass/clear/bronze", "ground/gravel/gravel-floor", "paving/stone/terrazzo-006", "plaster/concrete/concrete-046"]),
      stone: Object.freeze(["masonry/stone-blocks/stacked-stone-wall", "plaster/plaster/white-stucco", "metal/painted/metal-029", "glass/clear/float", "ground/gravel/gravel-floor", "paving/stone/travertine-009", "plaster/plaster/white-stucco"]),
      black: Object.freeze(["plaster/plaster/plaster-001", "wood/planks/weathered-plank-siding", "metal/painted/metal-029", "glass/clear/bronze", "ground/gravel/gravel-floor", "wood/floor/wood-floor-051", "plaster/plaster/plaster-001"]),
      walnut: Object.freeze(["plaster/concrete/concrete-034", "wood/planks/walnut-veneer", "metal/painted/metal-029", "glass/clear/float", "ground/gravel/gravel-floor", "paving/tiles/porcelain-001", "wood/planks/walnut-veneer"])
    }),
    plates: Object.freeze({
      walnut: Object.freeze(["wood/planks/walnut-veneer", "masonry/stone-blocks/stacked-stone-wall", "plaster/concrete/concrete-010", "glass/clear/bronze", "ground/gravel/gravel-floor", "paving/stone/travertine-009", "wood/planks/walnut-veneer"]),
      white: Object.freeze(["plaster/plaster/plaster-001", "masonry/stone-blocks/stone-tile-wall", "plaster/plaster/plaster-001", "glass/clear/float", "ground/gravel/gravel-floor", "paving/tiles/porcelain-001", "wood/panel/oak-veneer-01"]),
      cedar: Object.freeze(["wood/planks/japanese-cedar-planks", "masonry/stone-blocks/rustic-stone-wall", "plaster/concrete/concrete-046", "glass/clear/float", "ground/gravel/gravel-floor", "wood/floor/wood-floor-051", "wood/planks/japanese-cedar-planks"]),
      charcoal: Object.freeze(["plaster/plaster/painted-plaster-008", "wood/planks/japanese-cedar-planks", "plaster/plaster/painted-plaster-008", "glass/clear/bronze", "ground/gravel/gravel-floor", "paving/stone/terrazzo-006", "wood/planks/japanese-cedar-planks"]),
      board: Object.freeze(["plaster/plaster/wood-textured-concrete", "masonry/stone-blocks/stone-wall-04", "plaster/concrete/concrete-046", "glass/clear/float", "ground/gravel/gravel-floor", "wood/floor/wood-floor-051", "plaster/concrete/concrete-046"]),
      travertine: Object.freeze(["paving/stone/travertine-009", "masonry/stone-blocks/stacked-stone-wall", "plaster/plaster/plaster-001", "glass/clear/float", "ground/gravel/gravel-floor", "paving/stone/travertine-009", "wood/planks/walnut-veneer"])
    }),
    terrace: Object.freeze({
      white: Object.freeze(["plaster/plaster/white-stucco", "wood/planks/japanese-cedar-planks", "metal/painted/metal-029", "glass/clear/float", "ground/gravel/gravel-floor", "wood/floor/teak-deck", "plaster/plaster/white-stucco"]),
      travertine: Object.freeze(["paving/stone/travertine-009", "plaster/plaster/plaster-001", "metal/painted/metal-029", "glass/clear/float", "ground/gravel/gravel-floor", "paving/tiles/patio-tiles", "plaster/plaster/plaster-001"]),
      concrete: Object.freeze(["plaster/concrete/concrete-034", "wood/planks/walnut-veneer", "metal/painted/metal-029", "glass/clear/bronze", "ground/gravel/gravel-floor", "paving/tiles/large-grey-tiles", "wood/planks/walnut-veneer"]),
      ochre: Object.freeze(["plaster/plaster/painted-plaster-018", "plaster/plaster/plaster-001", "plaster/plaster/plaster-001", "glass/clear/float", "ground/gravel/gravel-floor", "paving/tiles/patio-tiles", "plaster/plaster/plaster-001"]),
      stone: Object.freeze(["masonry/stone-blocks/stone-tile-wall", "plaster/plaster/white-stucco", "metal/painted/metal-029", "glass/clear/float", "ground/gravel/gravel-floor", "wood/floor/teak-deck", "plaster/plaster/white-stucco"]),
      charcoal: Object.freeze(["plaster/plaster/painted-plaster-008", "wood/painted/white-painted-boards", "metal/painted/metal-029", "glass/clear/float", "ground/gravel/gravel-floor", "wood/floor/wood-floor-deck", "wood/painted/white-painted-boards"])
    }),
    ell: Object.freeze({
      white: Object.freeze(["plaster/plaster/plaster-001", "wood/planks/japanese-cedar-planks", "metal/painted/metal-029", "glass/clear/float", "ground/gravel/gravel-floor", "wood/floor/wood-floor-051", "plaster/plaster/plaster-001"]),
      concrete: Object.freeze(["plaster/concrete/concrete-034", "wood/planks/walnut-veneer", "metal/painted/metal-029", "glass/clear/bronze", "ground/gravel/gravel-floor", "paving/stone/terrazzo-006", "wood/planks/walnut-veneer"]),
      brick: Object.freeze(["masonry/brick/red-brick", "plaster/plaster/plaster-001", "metal/painted/metal-029", "glass/clear/float", "ground/gravel/gravel-floor", "wood/floor/wood-floor-051", "plaster/plaster/plaster-001"]),
      charcoal: Object.freeze(["plaster/plaster/painted-plaster-008", "wood/panel/oak-veneer-01", "metal/painted/metal-029", "glass/clear/float", "ground/gravel/gravel-floor", "wood/floor/wood-floor-051", "wood/panel/oak-veneer-01"]),
      stone: Object.freeze(["masonry/stone-blocks/stone-tile-wall", "plaster/plaster/white-stucco", "metal/painted/metal-029", "glass/clear/float", "ground/gravel/gravel-floor", "paving/stone/travertine-009", "plaster/plaster/white-stucco"]),
      cedar: Object.freeze(["wood/planks/japanese-cedar-planks", "plaster/plaster/painted-plaster-008", "metal/painted/metal-029", "glass/clear/bronze", "ground/gravel/gravel-floor", "wood/floor/wood-floor-051", "wood/planks/japanese-cedar-planks"])
    }),
    platform: Object.freeze({
      travertine: Object.freeze(["paving/stone/travertine-009", "plaster/plaster/plaster-001", "plaster/concrete/concrete-046", "glass/clear/float", "ground/gravel/gravel-floor", "paving/stone/travertine-009", "plaster/plaster/plaster-001"]),
      white: Object.freeze(["plaster/plaster/plaster-001", "wood/planks/walnut-veneer", "plaster/plaster/plaster-001", "glass/clear/float", "ground/gravel/gravel-floor", "paving/tiles/porcelain-001", "wood/planks/walnut-veneer"]),
      concrete: Object.freeze(["plaster/plaster/wood-textured-concrete", "plaster/concrete/concrete-046", "plaster/concrete/concrete-010", "glass/clear/bronze", "ground/gravel/gravel-floor", "paving/tiles/large-grey-tiles", "plaster/concrete/concrete-046"]),
      cedar: Object.freeze(["masonry/stone-blocks/stone-tile-wall", "wood/planks/japanese-cedar-planks", "metal/painted/metal-029", "glass/clear/float", "ground/gravel/gravel-floor", "wood/floor/teak-deck", "wood/planks/japanese-cedar-planks"]),
      black: Object.freeze(["plaster/plaster/painted-plaster-008", "wood/planks/weathered-plank-siding", "plaster/plaster/painted-plaster-008", "glass/clear/bronze", "ground/gravel/gravel-floor", "wood/floor/wood-floor-deck", "plaster/plaster/plaster-001"]),
      ochre: Object.freeze(["plaster/plaster/painted-plaster-018", "plaster/plaster/plaster-001", "plaster/plaster/plaster-001", "glass/clear/float", "ground/gravel/gravel-floor", "paving/tiles/patio-tiles", "plaster/plaster/plaster-001"])
    })
  });
  LOOK_LABELS2 = Object.freeze({
    white: "White render",
    stucco: "Stucco and tiles",
    concrete: "Concrete",
    cedar: "Cedar",
    dark: "Dark timber",
    oak: "Oak and plaster",
    travertine: "Travertine",
    walnut: "Walnut",
    stone: "Stone and stucco",
    grey: "Grey render",
    charcoal: "Charcoal",
    ochre: "Ochre",
    boards: "White boards",
    charred: "Charred timber",
    solar: "Timber and solar roof",
    steel: "Black steel",
    board: "Board-marked concrete",
    blue: "Pale blue",
    timber: "Render and a cedar bay",
    alpine: "Timber and shingles",
    black: "Black timber",
    brick: "Brick",
    slate: "Dark stone",
    marble: "Marble",
    logs: "Round logs",
    beams: "Squared beams",
    pine: "Pale pine",
    weathered: "Weathered boards",
    brown: "Old brown boards",
    fieldstone: "Stone walls"
  });
  LABELS2 = Object.freeze(["White house", "Timber house", "Glass pavilion", "Stacked house", "Chalet", "Lodge", "Barn house", "Manor", "Villa", "Log cabin", "Cantilever house", "Layered house", "Roof-terrace house", "L-shaped house", "Platform house"]);
  house = Object.freeze({
    name: "house",
    label: "House",
    description: "A modern house worked out from a few numbers: storeys of walls between slabs with their windows cut and glazed, a stair up through them, terraces with glass rails where a storey stands back, a flat, single-pitch, gabled, butterfly, steep or hipped roof, and a base down past the ground with steps up to its door — or a storey on past the one under it, storeys shifted between slabs that stand out, a pavilion on a roof that is a terrace. Its front is its +y. `width` and `depth` are its ground storey's — 14 m or more each way with `scale` game for a house built now —; its box is what it makes (eaves, a storey out over the front, its steps). One part, at most 5,000 triangles (a mansion 6,000); its doors are parts of their own (kind door) that open into the house as someone comes, its lights and their switches too (`lighting`), the platform and call buttons of a lift (`lift`), the panes of glass that slide (`sliding`) and the door of a garage. With `rooms` its storeys are divided — a hall, a toilet, bedrooms, bathrooms — by partitions with their doorways. With `forms` varied its variation shapes it more: a canopy, a carport, balconies, a pergola, a chimney, an accent band. With `furnished`, and its storeys divided, it comes furnished: each of its rooms a part of the room kind laid out by what it is — beds, sofas, tables and their chairs, a kitchen's units, baths, wardrobes, rugs, pictures, plants —, what is sat on in them parts of their own, seats. Walked into: rooms, floors and stairs collide as drawn.",
    faces: FACES,
    shape: "cube",
    sized: true,
    size: [13, 10, 7],
    sizeNote: "what its width, depth, storeys and roof make (m): a size given sets its width and depth",
    labelOf: ({ style }) => LABELS2[style] ?? "House",
    lookedBy: "style",
    looks: LOOKS2,
    lookLabels: LOOK_LABELS2,
    brings: (params) => params.furnished ? ["room"] : [],
    params: [
      { name: "style", label: "Style", min: 0, max: STYLE_NAMES2.length - 1, default: 0, step: 1, options: STYLE_NAMES2, labels: STYLE_NAMES2.map((name) => STYLES2[name].label), description: "Box: rendered walls, ribbon windows, a parapet, an upper storey that may stand back from a terrace. Wood: timber cladding, upright windows, eaves. Glass: glass from floor to ceiling between slabs that stand out past it. Stack: each storey a volume of its own, the upper one out over the door and a terrace beside it. Chalet: a steep roof swept out over the front, a bay of glass through every storey in the middle of the front under a vault of its own, the door in a porch beside it under a balcony, another balcony at its other side. Lodge: a long steep roof gone on past both ends over a covered terrace each, a bay under a gable of glass in the middle of the front, the door in a porch beside it that opens onto a terrace. Barn: a hall under a ridged roof, the end of it away from its stair all glass up to the roof with a terrace before it under a flat canopy, and behind the hall the back of the house low under a flat roof that goes on past its other end as a wing — a garage, its door sliding aside as someone comes, a ramp down to the ground before it —: an L, the front door by the corner the wing makes. Manor: a mansion, the same either side of its middle — its front door, two leaves, in the middle under a portico of four or six columns as tall as two storeys, an entablature and a pediment over them and steps as wide; tall windows in line from storey to storey; a cornice and a hipped roof; a chimney at each end; its ground storey dressed apart from those over it, its columns and trim marble. Divided into rooms: a hall through its middle from the door to the back wall, the stair in it, the living room and the study either side of it at the front, the dining room and the kitchen behind them, bedrooms at the corners of the storeys over; with doors, the doorways from the hall into the living room and the study have two leaves each, hinged — or, with sliding glass, sliding into the wall. Villa: a modern mansion, the same either side of its middle — glass from floor to ceiling on every side under a flat roof 2.2 m out past its walls; every floor out 1.8 m past them: a terrace all round each storey over the ground one, railed with glass, a way out onto it from the landing — and, with sliding glass, a pane of each bay —, and a podium round the ground storey, steps down from it before the door; its door, two leaves, in the middle; inside, a mansion's hall and rooms. Cabin: a log cabin — walls of logs, a round log standing at each corner, a porch all along the front on log posts under the roof swept out over it (or under a shelter of its own), railed with logs, a chimney of stone up one end wall; its door in the front wall, under the porch. Cantilever: the storeys over the ground one larger than it — on past the end of it away from its stair, 3.6–6 m at a game's scale (no storey wider than 40 m: a ground storey that leaves them less has none), their end all glass —, over a terrace the house's floor goes on as, a way out onto it from the ground storey; a third storey as the second, or back at the ground one's end over a terrace of its own. Layered: each storey a box of its own between slabs that stand out a metre past it and a roof farther, shifted against the one under it — out past the far end and back from the front over a terrace, then back from the far end and out over the front, or the other way round first —, glass from floor to ceiling before and at its far end, and with a stair the wall it stands beside gone on as a blade in the second wall material: thicker, out before the front and a metre up past the roof. Roof terrace: the top storey a pavilion in the corner its stair stands in — a third to a half of the width, back from the front —, the roof under it a terrace round two sides of it railed with glass, a way out onto it, its own roof 1.2 m out over it; of three storeys the one between as the ground one, or back from its far end over a terrace too. L-shaped: an arm of glass standing out of the front at its far end, flush with the house's side, 2.4 m out (3.6 m at a game's scale) and nearly half the front wide, in the second wall material — as high as the house under its flat roof gone on over it, its glass one pane from its floor to that roof, the ground storey open to it and the storeys over it looking into it across a rail: a hall two storeys high; or (one house in three, of two storeys or three) a storey lower, its roof a terrace railed with glass, a way out onto it —; the door by the corner the two make, in a porch under a balcony. Platform: every floor 2.4 m out past its walls — a podium round the ground storey, a terrace railed with glass all round each storey over it —, and the top storey a pavilion in the corner its stair stands in, the floor it stands on far wider than it, its own roof 1.2 m out." },
      { name: "width", label: "Width", min: 6, max: WIDEST, default: 13, step: 0.1, description: "How wide its ground storey is, along its front (m)." },
      { name: "depth", label: "Depth", min: 6, max: WIDEST, default: 10, step: 0.1, description: "How deep its ground storey is, front to back (m)." },
      { name: "floors", label: "Storeys", min: 1, max: 3, default: 2, step: 1, description: "How many storeys, a stair between them: each 3.2 m from floor to floor, 4 m at a game's scale." },
      { name: "roof", label: "Roof", min: 0, max: ROOFS.length - 1, default: 0, step: 1, options: ROOFS, labels: ["Flat", "Single pitch", "Gabled", "Butterfly", "Steep", "Hipped"], description: "Over its top storey: flat; mono, one pitch rising to the front; gable, two pitches from a ridge along its width; butterfly, two pitches down to a valley along its width; steep, two steep pitches from a ridge along its width, as high as three fifths of its walls (5.5 m at the most), the storey under it open up to them — a chalet's own, its front swept out flatter over its balconies; hip, four pitches up from its eaves to a ridge along its longer side, standing on a flat slab that is the top storey's ceiling — the house under it as under a flat roof, without a parapet." },
      { name: "glazing", label: "Glass", min: 0, max: 1, default: 0.5, step: 0.05, description: "How much of its walls is glass: 0.5 its style's own, less towards 0, more towards 1." },
      { name: "variant", label: "Variation", min: 0, max: 9999, default: 0, step: 1, description: "Which of its style's houses it is: where its door and stair are, which storeys stand back and how far, which bays are glazed. One number, one house." },
      { name: "plinth", label: "Base", min: 0.1, max: 3, default: 0.3, step: 0.01, description: "How far its base goes down under its floor (m): past the lowest ground under it. Its floor is its box's bottom raised by this." },
      { name: "stoop", label: "Door step", min: 0, max: 1.5, default: 0.15, step: 0.01, description: "How far the ground before its door lies under its floor (m): steps go down to it, one for every 0.19 m." },
      { name: "entrance", label: "Entrance", min: 0, max: 2, default: 0, step: 1, options: ["single", "double", "suited"], labels: ["One door", "Double door", "By its size"], description: "Its front door, larger than any door inside. single: one leaf — 1.1 m wide and 2.3 m high, 1.8 × 3 m at a game's scale (a door inside is 0.9 × 2.1 m, and 1.4 × 2.7 m). double: two leaves that meet in one doorway, nothing between them — 2 m, 2.8 m at a game's scale —, its landing as much wider. suited: by the house's size — two leaves where its front is 22 m or more at a game's scale (14 m at a person's), one under that." },
      { name: "lighting", label: "Lights", min: 0, max: 2, default: 0, step: 1, options: ["none", "storey", "room"], labels: ["None", "One a storey", "Two a storey"], description: "Lights on its ceilings, each storey a zone with a switch of its own — by the front door, and by the stair on the storeys over it — that a click turns on and off and that turns them on by itself while someone is in the storey: none; storey, one linear light to each; room, two. Six lights at the most, off while nobody is in." },
      { name: "lift", label: "Lift", min: 0, max: 1, default: 0, step: 1, options: ["none", "platform"], labels: ["None", "Platform lift"], when: (params) => params.floors > 1, description: "A lift between its storeys, of two or three: a platform in a shaft of glass in the corner by the stair, open to the room on each storey, that a click on it sends to its next stop and a button by it on each storey calls — 1.3 m across, or 2.1 m, for four, at a game's scale. None with one storey." },
      { name: "sliding", label: "Sliding glass", min: 0, max: 2, default: 0, step: 1, options: ["none", "doors", "all"], labels: ["None", "Doors and bays", "Windows too"], description: "Glass that slides: none; doors — the door onto each terrace two panes of glass in a doorway of 2 m, one sliding over the other as someone comes or on a click, and one pane of each bay glazed from floor to ceiling that has floor outside it (on the ground storey, onto a terrace) sliding on a click; all — besides, one pane of every window of two panes or more, on a click. Eight sliding panes a house at the most." },
      { name: "forms", label: "Forms", min: 0, max: 1, default: 0, step: 1, options: ["plain", "varied"], labels: ["Plain", "Varied"], description: "What its variation may give it besides: plain, nothing; varied, some of — a band of its front and one side in its second wall material, a canopy with a fin over its door (at a person's scale: a game's recess is its shelter), a carport beside it, a balcony before an upper storey, a pergola over a terrace, a chimney — each by a chance of its own, as its style allows: two houses of one style and size differ in outline." },
      { name: "rooms", label: "Rooms", min: 0, max: 2, default: 0, step: 1, options: ["open", "rooms", "doors"], labels: ["Open plan", "Rooms", "Rooms with doors"], description: "How its storeys are divided: open, each one room; rooms — on the ground storey a toilet off the foot of the stair, the kitchen and the dining room along the back and the living room open, a study where it is wide; on the storeys over it a bathroom and a closet by the landing, a passage and bedrooms across the front, a lounge where they leave room; in a house of one storey the bedrooms and their bathrooms across the back, each with its door on the living room, and the kitchen beside them — their doorways open; doors, a door besides in each bathroom's, bedroom's, closet's and study's doorway, eight at the most (a mansion twelve), opening as someone comes. At the scale houses were first made at, a hall besides behind the front door, closed across from it. A storey too small for it stays open." },
      { name: "scale", label: "Scale", min: 0, max: 1, default: 0, step: 1, options: ["real", "game"], labels: ["A person's", "A game's"], description: "What it is sized for. real: a person, as houses were first made — storeys 3.2 m, a stair 1 m wide, doors 1.1 m. game: an avatar and the camera behind and over it — storeys 4 m, doors 1.4 m wide and 2.7 m high, a stair 2 m wide on the same steps, a lift for four, windows half as wide again, rooms a camera stays inside (bedrooms 5 m across at the least, passages 3 m, doorways 1.4 m), and its front door set back 3 m from the street's face of the house in a recess under the storey over it, sheltered. A game's where its ground storey is at least 11 × 12.5 m: a smaller house keeps a person's; and a house over 24 m a side, larger than a person's ever were, is at a game's whatever is asked — or, too narrow for one, 24 m at the most." },
      { name: "bedrooms", label: "Bedrooms", min: 0, max: 4, default: 0, step: 1, when: (params) => params.rooms > 0, description: "With `rooms`, how many bedrooms each storey of bedrooms has — a storey over the ground one, or the one storey of a house of one —: 0, as many as its width suits (one fewer one time in three); 1 to 4, that many where it holds them — fewer in a storey too narrow. A storey over the ground one is not cut narrower than those asked for need." },
      { name: "drive", label: "Garage ramp", min: 0, max: 1.5, default: 0.15, step: 0.01, when: (params) => Boolean(STYLES2[STYLE_NAMES2[params.style]]?.wing), description: "Of a house with a wing: how far the ground before its garage door lies under its floor (m) — a ramp goes down to it, six times as long." },
      { name: "furnished", label: "Furniture", optional: true, min: 0, max: 3, default: 0, step: 1, options: ["none", "oak", "walnut", "white"], labels: ["None", "Oak and linen", "Walnut and bouclé", "White and charcoal"], when: (params) => params.rooms > 0, description: "With `rooms`, whether it comes furnished and in which palette: none; oak — oak and linen —, walnut — walnut and bouclé —, white — white and charcoal. Each of its rooms is then a part of the room kind, laid out by what it is from the house's own plan — a bed between its side tables and a wardrobe; a sofa before a low table on a rug, armchairs, a television; a table between its rows of chairs; a kitchen's run, its tall units and an island with its stools; a bath, a toilet, a basin, a shower; a desk; rugs, pictures, plants —, the ways between its doors kept clear, nothing before a window higher than its sill; what is sat on — sofas, armchairs, chairs, stools, beds, toilets, baths — parts of their own of the furniture kind, each a seat. Which pieces and where follows its `variant`. Nothing in a house of open storeys." }
    ]
  });
});

// src/build/kinds/furniture.js
var TYPES, FIXED, HUNG, PAINTINGS, TYPE_NAMES, FACES2, FABRICS, WOODS, FABRIC_NAMES, WOOD_NAMES, shown = (name) => name === "own" ? "As it is" : name[0].toUpperCase() + name.slice(1), CLOTH, isWood = (id) => typeof id === "string" && id.startsWith("wood/"), tintsFor = (params, cloth, count, surface = {}) => {
  const [colour, tone] = [FABRICS[FABRIC_NAMES[params.fabric]], WOODS[WOOD_NAMES[params.wood]]];
  const tinted = {};
  if (colour)
    for (const face of cloth)
      tinted[face] = [...colour];
  if (tone) {
    for (let face = 0;face < count; face++)
      if (tinted[face] === undefined && isWood(surface.faces?.[face]?.texture ?? surface.texture))
        tinted[face] = [...tone];
  }
  return tinted;
}, SHAPED, BUDGET2, OAK = "wood/panel/oak-veneer-01", WALNUT = "wood/planks/walnut-veneer", WHITE = "wood/painted/white-painted-boards", EBONY = "wood/panel/black-painted-planks", BLACK = "metal/painted/metal-029", STEEL = "metal/bare/metal-055a", BRASS = "metal/bare/metal-048a", MARBLE = "paving/stone/marble-012", MELANGE = "fabric/cloth/jogging-melange", BOUCLE = "fabric/cloth/wool-boucle", HERRINGBONE = "fabric/cloth/poly-wool-herringbone", LINEN = "fabric/cloth/rough-linen", JERSEY = "fabric/cloth/cotton-jersey", CREAM = "fabric/cloth/terlenka", VELVET = "fabric/cloth/velour-velvet", SAND = "fabric/upholstery/fabrics-0050", TERRACOTTA = "fabric/upholstery/fabric-padded-003", CHARCOAL = "fabric/upholstery/fabric-padded-008", NAVY = "fabric/upholstery/fabric-padded-005", OLIVE = "fabric/upholstery/fabric-padded-002", MAUVE = "fabric/upholstery/fabric-padded-009", QUILT = "fabric/upholstery/fabric-quilt-003", COVERLET = "fabric/upholstery/fabrics-0080", LEATHER = "fabric/leather/brown-leather", TAN = "fabric/leather/leather-035c", COGNAC = "fabric/upholstery/leather-padded-003", PAPER = "paper/paper/paper-001", CERAMIC = "synthetic/plastic/plastic-013a", CLAY = "synthetic/plastic/plastic-014a", BLUE = "synthetic/plastic/plastic-008", LEAF = "fabric/cloth/fabrics-0075", SOIL = "ground/soil/brown-mud-02", SAGE = "wood/painted/painted-wood-009b", BLACK_PLASTIC = "synthetic/plastic/plastic-006", TILES = "paving/tiles/porcelain-001", COPPER = "metal/bare/metal-007", CARPETS, FRAMES, look = (frame, cover = frame, bedding = cover, thrown = bedding, metal = frame, top = frame) => Object.freeze([frame, cover, bedding, thrown, metal, top, frame]), LOOKS3, LOOK_LABELS3, modelParam = (type, { label, model, models }) => ({
  name: model,
  label: type === "bed" ? "Headboard" : "Model",
  min: 0,
  max: Object.keys(models).length - 1,
  default: 0,
  step: 1,
  options: Object.keys(models),
  labels: Object.values(models),
  when: (params) => TYPE_NAMES[params.type] === type,
  description: `Which ${label.toLowerCase()} it is: ${Object.values(models).join(", ").toLowerCase()}.`
}), furniture;
var init_furniture = __esm(() => {
  TYPES = Object.freeze({
    sofa: Object.freeze({ label: "Sofa", model: "sofa", models: Object.freeze({ track: "Square arms", rolled: "Rolled arms", chaise: "With a chaise", modular: "Low and modular", chesterfield: "Chesterfield" }), width: Object.freeze([1.5, 3.4, 2.2]), depth: Object.freeze([0.85, 1.8, 0.95]), height: 0.85 }),
    armchair: Object.freeze({ label: "Armchair", model: "armchair", models: Object.freeze({ lounge: "Lounge", club: "Club", wing: "Wingback" }), width: Object.freeze([0.7, 1.05, 0.85]), depth: Object.freeze([0.75, 1, 0.88]), height: 0.85 }),
    chair: Object.freeze({ label: "Chair", model: "chair", models: Object.freeze({ dining: "Wooden", upholstered: "Upholstered", shell: "Shell" }), width: Object.freeze([0.42, 0.6, 0.46]), depth: Object.freeze([0.46, 0.62, 0.52]), height: 0.88 }),
    stool: Object.freeze({ label: "Stool", model: "stool", models: Object.freeze({ bar: "Bar stool", low: "Low stool" }), width: Object.freeze([0.34, 0.5, 0.4]), depth: Object.freeze([0.34, 0.5, 0.4]), height: 0.76 }),
    bed: Object.freeze({ label: "Bed", model: "headboard", models: Object.freeze({ panel: "Panel", padded: "Padded", tufted: "Tufted", channel: "Channelled", slatted: "Slatted", wing: "Wings", arched: "Arched" }), width: Object.freeze([0.9, 2, 1.6]), depth: Object.freeze([2.05, 2.3, 2.15]), height: 1.1 }),
    table: Object.freeze({ label: "Dining table", model: "table", models: Object.freeze({ legs: "Four legs", trestle: "Trestles", round: "Round" }), width: Object.freeze([0.8, 3, 1.8]), depth: Object.freeze([0.8, 1.2, 0.9]), height: 0.75 }),
    coffee: Object.freeze({ label: "Coffee table", model: "coffee", models: Object.freeze({ slab: "Slab", legs: "Four legs", round: "Round" }), width: Object.freeze([0.6, 1.6, 1.2]), depth: Object.freeze([0.5, 1, 0.6]), height: 0.4 }),
    side: Object.freeze({ label: "Side table", model: "side", models: Object.freeze({ cube: "Cube with a drawer", legs: "Four legs", round: "Round" }), width: Object.freeze([0.38, 0.65, 0.48]), depth: Object.freeze([0.34, 0.6, 0.42]), height: 0.52 }),
    desk: Object.freeze({ label: "Desk", model: "desk", models: Object.freeze({ legs: "Four legs", drawers: "With drawers" }), width: Object.freeze([1, 2, 1.4]), depth: Object.freeze([0.55, 0.85, 0.7]), height: 0.75 }),
    rug: Object.freeze({ label: "Rug", model: "rug", models: Object.freeze({ rectangle: "Rectangle", round: "Round", runner: "Runner", fitted: "Fitted carpet" }), width: Object.freeze([0.6, 10, 2.4]), depth: Object.freeze([0.6, 10, 1.7]), height: 0.012 }),
    picture: Object.freeze({ label: "Picture", model: "picture", models: Object.freeze({ framed: "Framed", canvas: "Canvas", mounted: "Mounted" }), width: Object.freeze([0.25, 3, 1]), depth: Object.freeze([0.045, 0.045, 0.045]), height: 0.75, tall: Object.freeze([0.25, 3, 0.75]) }),
    plant: Object.freeze({ label: "Plant", model: "plant", models: Object.freeze({ tall: "Tall", bush: "Bush", cactus: "Cactus" }), width: Object.freeze([0.72, 0.72, 0.72]), depth: Object.freeze([0.72, 0.72, 0.72]), height: 1.4 }),
    ornament: Object.freeze({ label: "Ornament", model: "ornament", models: Object.freeze({ vase: "Vase", bowl: "Bowl", jar: "Lidded jar", books: "Books", sculpture: "Sculpture", candles: "Candles" }), width: Object.freeze([0.2, 0.2, 0.2]), depth: Object.freeze([0.2, 0.2, 0.2]), height: 0.36 }),
    lamp: Object.freeze({ label: "Lamp", model: "lamp", models: Object.freeze({ floor: "Floor lamp", arc: "Arc lamp", table: "Table lamp" }), width: Object.freeze([0.45, 0.45, 0.45]), depth: Object.freeze([0.45, 0.45, 0.45]), height: 1.62 }),
    rack: Object.freeze({ label: "Coat rack", model: "rack", models: Object.freeze({ standing: "Standing", tree: "Coat tree", wall: "On a wall", rail: "Clothes rail" }), width: Object.freeze([0.5, 0.5, 0.5]), depth: Object.freeze([0.5, 0.5, 0.5]), height: 1.8 }),
    wardrobe: Object.freeze({ label: "Wardrobe", model: "wardrobe", models: Object.freeze({ doors: "Doors", sliding: "Sliding doors", open: "Open" }), width: Object.freeze([0.9, 3, 1.8]), depth: Object.freeze([0.55, 0.65, 0.6]), height: 2.2 }),
    shelf: Object.freeze({ label: "Shelves", model: "shelf", models: Object.freeze({ books: "Bookcase", cubes: "Cubes", ladder: "Ladder" }), width: Object.freeze([0.6, 2.4, 1.2]), depth: Object.freeze([0.3, 0.42, 0.35]), height: 2 }),
    sideboard: Object.freeze({ label: "Sideboard", model: "sideboard", models: Object.freeze({ doors: "Doors", drawers: "Drawers", legs: "On legs" }), width: Object.freeze([1.2, 2.4, 1.8]), depth: Object.freeze([0.4, 0.5, 0.45]), height: 0.8 }),
    tv: Object.freeze({ label: "Television", model: "tv", models: Object.freeze({ stand: "On a stand", wall: "On the wall" }), width: Object.freeze([1.2, 2.6, 1.8]), depth: Object.freeze([0.4, 0.45, 0.42]), height: 1.5 }),
    toilet: Object.freeze({ label: "Toilet", model: "toilet", models: Object.freeze({ floor: "On the floor", wall: "Hung on the wall" }), width: Object.freeze([0.4, 0.4, 0.4]), depth: Object.freeze([0.68, 0.68, 0.68]), height: 0.8 }),
    basin: Object.freeze({ label: "Basin", model: "basin", models: Object.freeze({ vanity: "On a cabinet", pedestal: "On a pedestal", double: "Double" }), width: Object.freeze([0.6, 1.8, 0.8]), depth: Object.freeze([0.5, 0.5, 0.5]), height: 1.08 }),
    bath: Object.freeze({ label: "Bath", model: "bath", models: Object.freeze({ built: "Built in", free: "Freestanding" }), width: Object.freeze([1.5, 1.9, 1.7]), depth: Object.freeze([0.7, 0.9, 0.78]), height: 0.58 }),
    shower: Object.freeze({ label: "Shower", model: "shower", models: Object.freeze({ tray: "Tray and frame", walk: "Walk-in" }), width: Object.freeze([0.8, 1.6, 1]), depth: Object.freeze([0.8, 1.2, 0.9]), height: 2.15 }),
    kitchen: Object.freeze({ label: "Kitchen", model: "kitchen", models: Object.freeze({ run: "A run of units", island: "Island", tall: "Tall units", counter: "Base units" }), width: Object.freeze([0.6, 6, 3.6]), depth: Object.freeze([0.62, 1.3, 0.62]), height: 2.3 })
  });
  FIXED = Object.freeze(["plant", "ornament", "lamp", "rack", "toilet"]);
  HUNG = Object.freeze(["picture"]);
  PAINTINGS = Object.freeze({
    mondrian: Object.freeze({ id: "images/paintings/composition-with-red-yellow-and-blue", size: Object.freeze([0.495, 0.495]), label: "Composition with red, yellow and blue" }),
    cafe: Object.freeze({ id: "images/paintings/night-cafe", size: Object.freeze([0.881, 0.705]), label: "Night café" }),
    cottage: Object.freeze({ id: "images/paintings/a-cottage-in-the-woods", size: Object.freeze([1.114, 0.84]), label: "A cottage in the woods" }),
    tivoli: Object.freeze({ id: "images/paintings/the-waterfalls-at-tivoli", size: Object.freeze([1.726, 1.232]), label: "The waterfalls at Tivoli" }),
    twilight: Object.freeze({ id: "images/paintings/twilight-in-the-wilderness", size: Object.freeze([1.626, 1.016]), label: "Twilight in the wilderness" }),
    snow: Object.freeze({ id: "images/paintings/murol-in-the-snow", size: Object.freeze([0.81, 0.65]), label: "Murol in the snow" }),
    kashmir: Object.freeze({ id: "images/paintings/vale-of-kashmir", size: Object.freeze([1.324, 0.73]), label: "Vale of Kashmir" }),
    yosemite: Object.freeze({ id: "images/paintings/mount-starr-king-yosemite", size: Object.freeze([1.423, 0.97]), label: "Mount Starr King, Yosemite" }),
    garden: Object.freeze({ id: "images/paintings/the-snowy-garden", size: Object.freeze([0.735, 0.349]), label: "The snowy garden" }),
    bath: Object.freeze({ id: "images/paintings/after-the-bath", size: Object.freeze([1, 0.66]), label: "After the bath" }),
    bottle: Object.freeze({ id: "images/paintings/still-life-with-a-bottle", size: Object.freeze([0.524, 0.658]), label: "Still life with a bottle" }),
    bamboo: Object.freeze({ id: "images/paintings/bamboo-in-the-wind", size: Object.freeze([0.66, 2.095]), label: "Bamboo in the wind" }),
    cloud: Object.freeze({ id: "images/paintings/the-pink-cloud", size: Object.freeze([0.61, 0.546]), label: "The pink cloud" }),
    oasis: Object.freeze({ id: "images/paintings/leaving-the-oasis", size: Object.freeze([0.812, 0.5]), label: "Leaving the oasis" }),
    seine: Object.freeze({ id: "images/paintings/view-of-saint-cloud-near-the-seine", size: Object.freeze([0.676, 0.439]), label: "Saint-Cloud by the Seine" }),
    tiger: Object.freeze({ id: "images/paintings/tiger-in-the-jungle", size: Object.freeze([0.385, 0.49]), label: "Tiger in the jungle" })
  });
  TYPE_NAMES = Object.freeze(Object.keys(TYPES));
  FACES2 = Object.freeze(["frame", "cover", "bedding", "throw", "metal", "top", "art"]);
  FABRICS = Object.freeze({
    own: null,
    ivory: Object.freeze([1, 0.905, 0.752]),
    sand: Object.freeze([0.815, 0.672, 0.468]),
    ochre: Object.freeze([0.76, 0.456, 0.107]),
    terracotta: Object.freeze([0.604, 0.195, 0.117]),
    rose: Object.freeze([0.807, 0.456, 0.456]),
    sage: Object.freeze([0.434, 0.552, 0.392]),
    teal: Object.freeze([0.188, 0.434, 0.434]),
    sky: Object.freeze([0.402, 0.578, 0.807]),
    slate: Object.freeze([0.262, 0.323, 0.413]),
    plum: Object.freeze([0.402, 0.223, 0.361]),
    graphite: Object.freeze([0.156, 0.162, 0.181])
  });
  WOODS = Object.freeze({
    own: null,
    honey: Object.freeze([0.913, 0.73, 0.402]),
    amber: Object.freeze([0.745, 0.402, 0.156]),
    chestnut: Object.freeze([0.434, 0.188, 0.102]),
    mahogany: Object.freeze([0.305, 0.089, 0.061]),
    smoke: Object.freeze([0.402, 0.381, 0.352]),
    ebony: Object.freeze([0.089, 0.076, 0.068])
  });
  FABRIC_NAMES = Object.freeze(Object.keys(FABRICS));
  WOOD_NAMES = Object.freeze(Object.keys(WOODS));
  CLOTH = Object.freeze({ sofa: Object.freeze([1, 2]), armchair: Object.freeze([1, 2]), chair: Object.freeze([1, 2]), stool: Object.freeze([1, 2]), bed: Object.freeze([1, 2]), rug: Object.freeze([1]) });
  SHAPED = Object.freeze({
    tall: Object.freeze({ sofa: [0.88, 1.16], armchair: [0.9, 1.24], chair: [0.9, 1.1], stool: [0.9, 1.08], bed: [0.82, 1.4], coffee: [0.8, 1.2], side: [0.86, 1.2], wardrobe: [0.86, 1.08], shelf: [0.7, 1.12], sideboard: [0.88, 1.16] }),
    legs: Object.freeze(["sofa", "armchair", "bed"]),
    stout: Object.freeze(["sofa", "armchair", "chair", "stool", "table", "coffee", "side", "desk"])
  });
  BUDGET2 = Object.freeze({ triangles: 320, simpler: 130, coarse: 40, pieces: 3, materials: 4 });
  CARPETS = Object.freeze({ beige: "fabric/carpet/carpet-016", cream: "fabric/carpet/fabrics-0076", grey: "fabric/carpet/carpet-004", blue: "fabric/carpet/carpet-002", teal: "fabric/carpet/carpet-005", green: "fabric/carpet/carpet-010", red: "fabric/carpet/carpet-013", navy: "fabric/carpet/carpet-012" });
  FRAMES = Object.freeze({ mondrian: BLACK, cafe: WALNUT, cottage: OAK, tivoli: BRASS, twilight: BRASS, snow: WHITE, kashmir: WALNUT, yosemite: OAK, garden: BLACK, bath: OAK, bottle: BLACK, bamboo: WALNUT, cloud: WHITE, oasis: BRASS, seine: OAK, tiger: BLACK });
  LOOKS3 = Object.freeze({
    sofa: Object.freeze({ linen: look(OAK, MELANGE, MELANGE, LINEN, BLACK), boucle: look(WALNUT, BOUCLE, CREAM, CREAM, BLACK), charcoal: look(BLACK, CHARCOAL, CHARCOAL, TERRACOTTA, BLACK), leather: look(WALNUT, LEATHER, LEATHER, CREAM, BRASS), navy: look(OAK, NAVY, NAVY, MELANGE, STEEL), olive: look(WALNUT, OLIVE, OLIVE, SAND, BRASS), cognac: look(WALNUT, COGNAC, COGNAC, CREAM, BRASS) }),
    armchair: Object.freeze({ boucle: look(WALNUT, BOUCLE, BOUCLE, CREAM, BLACK), leather: look(WALNUT, TAN, TAN, TAN, BRASS), terracotta: look(OAK, TERRACOTTA, TERRACOTTA, CREAM, BLACK), velvet: look(EBONY, VELVET, VELVET, VELVET, BRASS), herringbone: look(OAK, HERRINGBONE, HERRINGBONE, LINEN, STEEL) }),
    chair: Object.freeze({ oak: look(OAK, SAND, SAND, SAND, BLACK), walnut: look(WALNUT, HERRINGBONE, HERRINGBONE, HERRINGBONE, BRASS), white: look(WHITE, MELANGE, MELANGE, MELANGE, STEEL), black: look(EBONY, LEATHER, LEATHER, LEATHER, BLACK) }),
    stool: Object.freeze({ oak: look(OAK, LEATHER, LEATHER, LEATHER, BLACK), walnut: look(WALNUT, TAN, TAN, TAN, BRASS), white: look(WHITE, MELANGE, MELANGE, MELANGE, STEEL) }),
    bed: Object.freeze({ oak: look(OAK, MELANGE, JERSEY, LINEN), walnut: look(WALNUT, BOUCLE, JERSEY, COVERLET), white: look(WHITE, QUILT, JERSEY, CREAM), velvet: look(EBONY, VELVET, JERSEY, CREAM), terracotta: look(OAK, TERRACOTTA, CREAM, HERRINGBONE), charcoal: look(EBONY, CHARCOAL, JERSEY, MAUVE) }),
    table: Object.freeze({ oak: look(OAK, OAK, OAK, OAK, BLACK), walnut: look(WALNUT, WALNUT, WALNUT, WALNUT, BRASS), white: look(WHITE, WHITE, WHITE, WHITE, STEEL), marble: look(WALNUT, WALNUT, WALNUT, WALNUT, BRASS, MARBLE) }),
    coffee: Object.freeze({ oak: look(OAK, OAK, OAK, OAK, BLACK), walnut: look(WALNUT, WALNUT, WALNUT, WALNUT, BRASS), marble: look(EBONY, EBONY, EBONY, EBONY, BRASS, MARBLE), black: look(EBONY, EBONY, EBONY, EBONY, BLACK) }),
    side: Object.freeze({ oak: look(OAK, OAK, OAK, OAK, BLACK), walnut: look(WALNUT, WALNUT, WALNUT, WALNUT, BRASS), white: look(WHITE, WHITE, WHITE, WHITE, STEEL), marble: look(OAK, OAK, OAK, OAK, BRASS, MARBLE) }),
    desk: Object.freeze({ oak: look(OAK, OAK, OAK, OAK, BLACK), walnut: look(WALNUT, WALNUT, WALNUT, WALNUT, BRASS), white: look(WHITE, WHITE, WHITE, WHITE, STEEL) }),
    rug: Object.freeze(Object.fromEntries(Object.entries(CARPETS).map(([name, id]) => [name, look(id)]))),
    picture: Object.freeze(Object.fromEntries(Object.entries(PAINTINGS).map(([name, { id }]) => [name, Object.freeze([FRAMES[name], PAPER, PAPER, PAPER, FRAMES[name], FRAMES[name], id])]))),
    plant: Object.freeze({ white: look(SOIL, LEAF, LEAF, LEAF, SOIL, CERAMIC), clay: look(SOIL, LEAF, LEAF, LEAF, SOIL, CLAY), black: look(SOIL, LEAF, LEAF, LEAF, SOIL, BLACK) }),
    ornament: Object.freeze({ white: look(OAK, TERRACOTTA, PAPER, PAPER, OAK, CERAMIC), blue: look(WALNUT, NAVY, PAPER, PAPER, WALNUT, BLUE), clay: look(OAK, OLIVE, PAPER, PAPER, OAK, CLAY), brass: look(EBONY, VELVET, PAPER, PAPER, EBONY, BRASS) }),
    lamp: Object.freeze({ black: look(OAK, CREAM, CREAM, CREAM, BLACK, CERAMIC), brass: look(WALNUT, CREAM, CREAM, CREAM, BRASS, MARBLE), white: look(WHITE, MELANGE, MELANGE, MELANGE, STEEL, CERAMIC) }),
    rack: Object.freeze({ oak: look(OAK, OAK, OAK, OAK, BLACK), walnut: look(WALNUT, WALNUT, WALNUT, WALNUT, BRASS), white: look(WHITE, WHITE, WHITE, WHITE, STEEL), black: look(EBONY, EBONY, EBONY, EBONY, BLACK) }),
    wardrobe: Object.freeze({ white: look(WHITE, WHITE, WHITE, WHITE, STEEL), oak: look(OAK, OAK, OAK, OAK, BLACK), walnut: look(WALNUT, WALNUT, WALNUT, WALNUT, BRASS), mixed: look(WHITE, OAK, OAK, OAK, BLACK) }),
    shelf: Object.freeze({ oak: look(OAK, NAVY, NAVY, TERRACOTTA), walnut: look(WALNUT, OLIVE, OLIVE, CREAM), white: look(WHITE, CHARCOAL, CHARCOAL, MAUVE) }),
    sideboard: Object.freeze({ walnut: look(WALNUT, WALNUT, WALNUT, WALNUT, BRASS), white: look(WHITE, WHITE, WHITE, WHITE, STEEL), oak: look(OAK, OAK, OAK, OAK, BLACK), black: look(EBONY, EBONY, EBONY, EBONY, BRASS) }),
    tv: Object.freeze({ walnut: look(WALNUT, WALNUT, WALNUT, WALNUT, BLACK), white: look(WHITE, WHITE, WHITE, WHITE, BLACK), oak: look(OAK, OAK, OAK, OAK, BLACK) }),
    toilet: Object.freeze({ white: look(CERAMIC, CERAMIC, CERAMIC, CERAMIC, STEEL, CERAMIC), black: look(CERAMIC, BLACK_PLASTIC, BLACK_PLASTIC, BLACK_PLASTIC, BRASS, CERAMIC), oak: look(CERAMIC, OAK, OAK, OAK, STEEL, CERAMIC) }),
    basin: Object.freeze({ white: look(WHITE, WHITE, CERAMIC, CERAMIC, STEEL, MARBLE), oak: look(OAK, OAK, CERAMIC, CERAMIC, BLACK, MARBLE), walnut: look(WALNUT, WALNUT, CERAMIC, CERAMIC, BRASS, CERAMIC) }),
    bath: Object.freeze({ white: look(CERAMIC, CERAMIC, CERAMIC, CERAMIC, STEEL, CERAMIC), black: look(BLACK, CERAMIC, CERAMIC, CERAMIC, BRASS, CERAMIC), copper: look(COPPER, CERAMIC, CERAMIC, CERAMIC, COPPER, CERAMIC) }),
    shower: Object.freeze({ white: look(TILES, CERAMIC, CERAMIC, CERAMIC, STEEL, CERAMIC), marble: look(MARBLE, CERAMIC, CERAMIC, CERAMIC, BLACK, CERAMIC), black: look(EBONY, CERAMIC, CERAMIC, CERAMIC, BRASS, CERAMIC) }),
    kitchen: Object.freeze({ white: look(WHITE, WHITE, WHITE, BLACK, STEEL, OAK), oak: look(OAK, OAK, OAK, BLACK, BLACK, MARBLE), black: look(EBONY, EBONY, EBONY, BLACK, BRASS, MARBLE), sage: look(SAGE, SAGE, SAGE, BLACK, BRASS, OAK) })
  });
  LOOK_LABELS3 = Object.freeze({
    linen: "Grey linen",
    boucle: "Bouclé",
    charcoal: "Charcoal",
    leather: "Brown leather",
    navy: "Navy",
    olive: "Olive",
    terracotta: "Terracotta",
    velvet: "Red velvet",
    herringbone: "Herringbone",
    oak: "Oak",
    walnut: "Walnut",
    white: "White",
    black: "Black",
    marble: "Marble",
    mixed: "White and oak",
    sage: "Sage green",
    copper: "Copper",
    cognac: "Cognac leather, padded",
    beige: "Beige",
    cream: "Cream",
    grey: "Grey",
    blue: "Blue",
    teal: "Teal",
    green: "Green",
    red: "Red",
    clay: "Terracotta",
    brass: "Brass",
    ...Object.fromEntries(Object.entries(PAINTINGS).map(([name, { label }]) => [name, label]))
  });
  furniture = Object.freeze({
    name: "furniture",
    label: "Furniture",
    description: "A piece of furniture worked out from a few numbers: a sofa (square or rolled arms, with a chaise, low and modular, a Chesterfield), an armchair, a chair, a stool, a bed with its headboard (a panel, padded, tufted, channelled, slatted, with wings, arched), a dining table, a coffee table, a side table or a desk; what dresses a room — a rug (a rectangle, round, a runner, a fitted carpet), a picture of a painting of the bank (framed, a canvas, mounted: its look the painting), a plant, an ornament (a vase, a bowl, a lidded jar, books, a sculpture, candles), a lamp (floor, arc, table), a coat rack (standing, a coat tree, on a wall, a clothes rail); storage — a wardrobe (doors, sliding, open), shelves (a bookcase, cubes, a ladder), a sideboard (doors, drawers, on legs), a television (on a stand, on the wall) —, a bathroom — a toilet (on the floor, hung on the wall), a basin (on a cabinet, on a pedestal, double), a bath (built in, freestanding), a shower (a tray and frame, walk-in) — and a kitchen (a run of units with its sink, hob and upper units, an island, tall units). Its front is its +y — where one sits facing, a bed's foot, a picture's painting —, its bottom the floor (a picture's where it hangs). `width` and `depth` are along its front and from front to back, each held to its type's range (a picture's `width` and `height`; a plant, an ornament, a lamp, a coat rack its model's size); its height is its type's, a person's measures whatever the room. Seats, beds and stools are sat on where the part's `seat` says (the import gives the kind's); a picture's painting covers its canvas once (its face's `scale`, given by the import). One part, 320 triangles at the most; nothing drawn from far; what dresses a room collides with nothing.",
    faces: FACES2,
    shape: "cube",
    sized: true,
    size: [2.2, 0.95, 0.85],
    sizeNote: "what its type, model, width and depth make (m): a size given sets its width and depth",
    labelOf: (params) => {
      const type = TYPES[TYPE_NAMES[params.type]] ?? TYPES.sofa;
      const model = Object.values(type.models)[params[type.model]] ?? "";
      return model ? `${type.label}, ${model.toLowerCase()}` : type.label;
    },
    lookedBy: "type",
    looks: LOOKS3,
    lookLabels: LOOK_LABELS3,
    params: [
      { name: "type", label: "Piece", min: 0, max: TYPE_NAMES.length - 1, default: 0, step: 1, options: TYPE_NAMES, labels: TYPE_NAMES.map((name) => TYPES[name].label), description: "What it is: a sofa, an armchair, a chair, a stool, a bed, a dining table, a coffee table, a side table or a desk." },
      ...TYPE_NAMES.map((name) => modelParam(name, TYPES[name])),
      { name: "width", label: "Width", min: 0, max: 10, default: 0, step: 0.01, when: (params) => !FIXED.includes(TYPE_NAMES[params.type]), description: "How wide it is along its front (m) — 0, its type's own —, held to its type's range: a sofa 1.5–3.4, an armchair 0.7–1.05, a chair 0.42–0.6, a bed 0.9–2 (the mattress 0.9 single, 1.4–1.6 double, 1.8–2 king), a dining table 0.8–3, a coffee table 0.6–1.6, a side table 0.38–0.65, a desk 1–2." },
      { name: "depth", label: "Depth", min: 0, max: 10, default: 0, step: 0.01, when: (params) => !FIXED.includes(TYPE_NAMES[params.type]) && !HUNG.includes(TYPE_NAMES[params.type]), description: "How deep it is from front to back (m) — 0, its type's own —, held to its type's range: a sofa 0.85–1 (1.4–1.8 with a chaise), a bed 2.05–2.3, a round table its width." },
      { name: "count", label: "In a row", min: 1, max: 6, default: 1, step: 1, when: (params) => ["chair", "stool"].includes(TYPE_NAMES[params.type]), description: "Chairs or stools side by side in a row, one part — a dining table's side, a counter's stools —, each a place of its seat: 1 to 6, 0.6 m apart (stools 0.65)." },
      { name: "height", label: "Height", min: 0, max: 3, default: 0, step: 0.01, when: (params) => TYPE_NAMES[params.type] === "picture", description: "How tall a picture is (m) — 0, its own: 0.75 —, 0.25–3: give it its painting's shape (PAINTINGS), its canvas covered once by it whatever its size." },
      { name: "tall", label: "Tall", optional: true, min: 0, max: 1, default: 0.5, step: 0.05, when: (params) => Boolean(SHAPED.tall[TYPE_NAMES[params.type]]), description: "How tall what stands up of it is, 0–1 (0.5, or left out, its model's own): a sofa's, an armchair's or a chair's back, a bed's headboard, a stool, a coffee or a side table, a wardrobe, shelves, a sideboard. A seat's top and a mattress's stay where a person sits and lies; a low modular sofa is as tall as it is." },
      { name: "legs", label: "Legs", optional: true, min: 0, max: 1, default: 0.5, step: 0.05, when: (params) => SHAPED.legs.includes(TYPE_NAMES[params.type]), description: "How high it stands on its legs, 0–1 (0.5, or left out, its model's own): a sofa's or an armchair's feet, a bed's plinth — low to the floor, or up on them. One that stands on no legs (a club armchair, a modular sofa) stays on the floor." },
      { name: "stout", label: "Stout", optional: true, min: 0, max: 1, default: 0.5, step: 0.05, when: (params) => SHAPED.stout.includes(TYPE_NAMES[params.type]), description: "How thick its arms, its legs and its top are, 0–1 (0.5, or left out, its model's own): slender, or stout — a sofa's arms, a chair's or a table's legs, a table's top." },
      { name: "fabric", label: "Cloth colour", optional: true, paint: true, min: 0, max: FABRIC_NAMES.length - 1, default: 0, step: 1, options: FABRIC_NAMES, labels: FABRIC_NAMES.map(shown), when: (params) => Boolean(CLOTH[TYPE_NAMES[params.type]]), description: "The colour of what it is upholstered in — a sofa's or a chair's cover and the cushions one sits on, a bed's padded headboard and its sheets, a rug —: a tint over its look's own material, none added. own (or left out): the material as it is; ivory, sand, ochre, terracotta, rose, sage, teal, sky, slate, plum, graphite. A light cloth takes them clearest, a dark one hardly; what is thrown over it — scatter cushions, a duvet — stays its look's." },
      { name: "wood", label: "Wood tone", optional: true, paint: true, min: 0, max: WOOD_NAMES.length - 1, default: 0, step: 1, options: WOOD_NAMES, labels: WOOD_NAMES.map(shown), description: "The tone of whatever of it is wood — its frame, its legs, a top or fronts dressed in a wood of the bank —: a tint over its look's own material, none added. own (or left out): the material as it is; honey, amber, chestnut, mahogany, smoke, ebony. Tones darken: on a light wood, and on white paint, they show most." }
    ]
  });
});

// src/build/kinds/room.js
var ROOM_TYPES, ROOM_FACES, ROOM_CLOTH, OAK2 = "wood/panel/oak-veneer-01", WALNUT2 = "wood/planks/walnut-veneer", WHITE2 = "wood/painted/white-painted-boards", BLACK2 = "metal/painted/metal-029", STEEL2 = "metal/bare/metal-055a", BRASS2 = "metal/bare/metal-048a", MARBLE2 = "paving/stone/marble-012", JERSEY2 = "fabric/cloth/cotton-jersey", LINEN2 = "fabric/cloth/rough-linen", CREAM2 = "fabric/cloth/terlenka", TERRACOTTA2 = "fabric/upholstery/fabric-padded-003", CERAMIC2 = "synthetic/plastic/plastic-013a", LEAF2 = "fabric/cloth/fabrics-0075", PALETTES, PALETTE_NAMES, PAINTED, LOOKS4, keepRows = (size, most) => (value) => Array.isArray(value) ? value.filter((row) => Array.isArray(row) && row.length === size && row.every(Number.isFinite)).slice(0, most).map((row) => row.map((v) => Math.round(v * 1000) / 1000)) : [], room;
var init_room = __esm(() => {
  ROOM_TYPES = Object.freeze(["living", "dining", "kitchen", "bedroom", "bath", "toilet", "study", "lounge", "passage", "landing", "closet", "hall"]);
  ROOM_FACES = Object.freeze(["wood", "fronts", "rug", "soft", "throw", "metal", "stone", "ceramic", "leaves", "dark", "art"]);
  ROOM_CLOTH = Object.freeze([2]);
  PALETTES = Object.freeze({
    oak: Object.freeze({ materials: Object.freeze([OAK2, WHITE2, "fabric/carpet/carpet-016", JERSEY2, LINEN2, BLACK2, MARBLE2, CERAMIC2, LEAF2, BLACK2]), painting: "cottage", seats: Object.freeze({ sofa: "linen", armchair: "boucle", chair: "oak", stool: "oak", bed: "oak", toilet: "white", bath: "white" }) }),
    walnut: Object.freeze({ materials: Object.freeze([WALNUT2, WALNUT2, "fabric/carpet/carpet-004", CREAM2, TERRACOTTA2, BRASS2, MARBLE2, CERAMIC2, LEAF2, BLACK2]), painting: "tivoli", seats: Object.freeze({ sofa: "boucle", armchair: "leather", chair: "walnut", stool: "walnut", bed: "walnut", toilet: "white", bath: "black" }) }),
    white: Object.freeze({ materials: Object.freeze([WHITE2, WHITE2, "fabric/carpet/carpet-002", JERSEY2, TERRACOTTA2, STEEL2, MARBLE2, CERAMIC2, LEAF2, BLACK2]), painting: "mondrian", seats: Object.freeze({ sofa: "charcoal", armchair: "terracotta", chair: "white", stool: "white", bed: "white", toilet: "white", bath: "white" }) })
  });
  PALETTE_NAMES = Object.freeze(Object.keys(PALETTES));
  PAINTED = Object.freeze({ cottage: "images/paintings/a-cottage-in-the-woods", tivoli: "images/paintings/the-waterfalls-at-tivoli", mondrian: "images/paintings/composition-with-red-yellow-and-blue" });
  LOOKS4 = Object.freeze(Object.fromEntries(ROOM_TYPES.map((type) => [type, Object.freeze(Object.fromEntries(PALETTE_NAMES.map((name) => [name, Object.freeze([...PALETTES[name].materials, PAINTED[PALETTES[name].painting]])])))])));
  room = Object.freeze({
    name: "room",
    label: "Furnished room",
    description: "What a room holds that nobody sits on, in one part, laid out from what the room is (`type`: living, dining, kitchen, bedroom, bath, toilet, study, lounge, passage, landing, closet, hall), its floor (`width` × `depth`, its middle at the part's, its bottom the floor) and what its recipe is told of it: the stretches of wall it may stand against (`walls`: [side, from, to] — side 0 its back, 1 its right, 2 its front, 3 its left — along x or y in its own frame), its windows (`windows`: [side, from, to, sill]), where it is come into (`ways`: [x0, y0, x1, y1] — the landing before a doorway, a side open to the next room, the floor beside a stair —, each joined to every other by a way `way` m wide that nothing stands in), what nothing stands on (`keep`) and what is not walked through either (`closed`: a stair's well, a lift's shaft). What is sat on — a sofa, armchairs, a row of chairs, a bed, a toilet, a bath — stands as parts of their own of the furniture kind, seats, its recipe's. `palette` dresses it and them alike; `variant` chooses among the ways it may be laid out.",
    faces: ROOM_FACES,
    shape: "cube",
    sized: true,
    size: [5, 4, 3.75],
    sizeNote: "its floor and its height (m): what its width, depth and height make",
    labelOf: ({ type }) => `Furnished ${ROOM_TYPES[type] ?? "room"}`,
    lookedBy: "type",
    looks: LOOKS4,
    lookLabels: Object.freeze({ oak: "Oak and linen", walnut: "Walnut and bouclé", white: "White and charcoal" }),
    params: [
      { name: "type", label: "Room", min: 0, max: ROOM_TYPES.length - 1, default: 3, step: 1, options: ROOM_TYPES, description: "What it is, what it is furnished as: a living room, a dining room, a kitchen, a bedroom, a bathroom, a toilet, a study, a lounge, a passage, a landing, a closet, a hall." },
      { name: "palette", label: "Palette", min: 0, max: PALETTE_NAMES.length - 1, default: 0, step: 1, options: PALETTE_NAMES, description: "What it and what is sat on in it are dressed in: oak and linen, walnut and bouclé, white and charcoal." },
      { name: "variant", label: "Variation", min: 0, max: 9999, default: 0, step: 1, description: "Which of the ways its pieces may be laid out it is, and which of them it has: one number, one room." },
      { name: "dines", label: "Dining", min: 0, max: 1, default: 0, step: 1, options: ["no", "yes"], when: (params) => ROOM_TYPES[params.type] === "living", description: "A living room's: whether its dining table is in it too, where the storey has no dining room of its own." },
      { name: "width", label: "Width", min: 1, max: 40, default: 5, step: 0.001, description: "Its floor along x (m)." },
      { name: "depth", label: "Depth", min: 1, max: 40, default: 4, step: 0.001, description: "Its floor along y (m)." },
      { name: "height", label: "Height", min: 2, max: 8, default: 3.75, step: 0.01, description: "From its floor to its ceiling (m)." },
      { name: "walls", label: "Walls", list: true, fixed: true, min: -20, max: 20, step: 0.001, default: [], keep: keepRows(3, 48), description: "The stretches of wall it may stand against: [side, from, to] — side 0 its back (−y), 1 its right (+x), 2 its front (+y), 3 its left (−x) —, from and to along x (its back and front) or y (its sides), in its own frame. None given: all four walls whole." },
      { name: "windows", label: "Windows", list: true, fixed: true, min: -20, max: 20, step: 0.001, default: [], keep: keepRows(4, 48), description: "Its windows: [side, from, to, sill] — what is taller than its sill stands nowhere before one." },
      { name: "way", label: "Way through", min: 0.6, max: 3, default: 1.4, step: 0.01, description: "How wide the ways between where it is come into are kept, clear of what stands and of its walls (m): its house's doorways' width." },
      { name: "ways", label: "Come into", list: true, fixed: true, min: -20, max: 20, step: 0.001, default: [], keep: keepRows(4, 32), description: "Where it is come into and gone out of: [x0, y0, x1, y1] in its own frame — the landing before a doorway, a side open to the next room, the floor beside a stair or before a lift. Each is joined to every other by a way `way` m wide." },
      { name: "keep", label: "Kept clear", list: true, fixed: true, min: -20, max: 20, step: 0.001, default: [], keep: keepRows(4, 64), description: "What nothing stands on: [x0, y0, x1, y1] in its own frame — its doorways' landings, the floor beside a stair and before a lift, behind the front door, before a switch." },
      { name: "closed", label: "Not walked", list: true, fixed: true, min: -20, max: 20, step: 0.001, default: [], keep: keepRows(4, 16), description: "What nothing stands on and is not walked through either: [x0, y0, x1, y1] — a stair's well, a lift's shaft, the front door's recess, a smaller room inside it." },
      { name: "tall", label: "Tall", optional: true, min: 0, max: 1, default: 0.5, step: 0.05, description: "How tall what stands up of its furniture is, 0–1 (0.5, or left out, each model's own): the backs of what is sat on, a bed's headboard, its low tables, its wardrobe, its shelves, its sideboard — low and wide, or tall. What stands before a window stays under its sill, and a picture hangs clear over what is under it." },
      { name: "legs", label: "Legs", optional: true, min: 0, max: 1, default: 0.5, step: 0.05, description: "How high its sofa, its armchairs and its bed stand on their legs, 0–1 (0.5, or left out, each model's own): low to the floor, or up on them." },
      { name: "stout", label: "Stout", optional: true, min: 0, max: 1, default: 0.5, step: 0.05, description: "How thick the arms, the legs and the tops of its furniture are, 0–1 (0.5, or left out, each model's own): slender, or stout." },
      { name: "fabric", label: "Cloth colour", optional: true, paint: true, min: 0, max: 11, default: 0, step: 1, options: ["own", "ivory", "sand", "ochre", "terracotta", "rose", "sage", "teal", "sky", "slate", "plum", "graphite"], labels: ["As it is", "Ivory", "Sand", "Ochre", "Terracotta", "Rose", "Sage", "Teal", "Sky", "Slate", "Plum", "Graphite"], description: "The colour of its cloth — its rugs, and what is sat on in it is upholstered in, a bed's sheets —: a tint over its palette's own materials, none added. own (or left out): as they are. Its throws, its scatter cushions and its duvets stay its palette's: the accent beside the colour." },
      { name: "wood", label: "Wood tone", optional: true, paint: true, min: 0, max: 6, default: 0, step: 1, options: ["own", "honey", "amber", "chestnut", "mahogany", "smoke", "ebony"], labels: ["As it is", "Honey", "Amber", "Chestnut", "Mahogany", "Smoke", "Ebony"], description: "The tone of its wood — its tables, its storage, its fronts, and the frames of what is sat on in it, whatever of them is dressed in a wood of the bank —: a tint over its palette's own, none added. own (or left out): as it is." }
    ]
  });
});

// src/build/kinds/pool.js
var STYLES3, FACES3, WATERS, LOOKS5, LOOK_LABELS4, pool;
var init_pool = __esm(() => {
  STYLES3 = Object.freeze(["stone", "timber"]);
  FACES3 = Object.freeze(["paving", "lining", "sides"]);
  WATERS = Object.freeze(["calm", "rippled"]);
  LOOKS5 = Object.freeze({
    stone: Object.freeze({
      travertine: Object.freeze(["paving/stone/travertine-009", "paving/tiles/tiles-132a", "paving/stone/travertine-009"]),
      marble: Object.freeze(["paving/stone/marble-001", "paving/tiles/tiles-067", "plaster/plaster/plaster-001"]),
      granite: Object.freeze(["paving/stone/granite-tile", "paving/tiles/porcelain-001", "paving/stone/granite-tile"]),
      terrazzo: Object.freeze(["paving/stone/terrazzo-006", "paving/tiles/tiles-132c", "plaster/concrete/concrete-046"]),
      dark: Object.freeze(["paving/stone/granite-tile", "paving/tiles/tiles-070", "masonry/stone-blocks/stone-tile-wall"]),
      white: Object.freeze(["paving/tiles/porcelain-001", "paving/tiles/tiles-020", "plaster/plaster/plaster-001"])
    }),
    timber: Object.freeze({
      cedar: Object.freeze(["wood/planks/japanese-cedar-planks", "paving/tiles/tiles-132a", "wood/planks/japanese-cedar-planks"]),
      deck: Object.freeze(["wood/floor/wood-floor-051", "paving/tiles/porcelain-001", "wood/siding/wood-0038"]),
      dark: Object.freeze(["wood/siding/wood-0038", "paving/tiles/tiles-132b", "wood/siding/wood-0038"])
    })
  });
  LOOK_LABELS4 = Object.freeze({
    travertine: "Travertine and blue tiles",
    marble: "Marble and pale tiles",
    granite: "Granite and white tiles",
    terrazzo: "Terrazzo",
    dark: "Dark",
    white: "White",
    cedar: "Cedar deck",
    deck: "Decking and white tiles"
  });
  pool = Object.freeze({
    name: "pool",
    label: "Pool",
    description: "A pool to swim in: a basin lined with tiles, raised over the ground it stands on (a build does not dig: its basin's floor stands over the highest ground under it, so its rim is its water's depth and 0.27 m over that ground), a coping and a deck of paving round it at its rim's level, steps up to the deck from the ground and steps down into the water. `length` and `width` are its basin's, inside; its box is what it makes — its deck round the basin, its steps past the deck, from its base's foot up to its rim —, and its origin its basin's middle at its rim. Its water is a part its recipe stands in it (a box of the bank's water: a body of water, swum in from 1.3 m deep): an object that holds a pool holds its water too. `plinth` and `stoop` are how far the ground lies under its rim — under all of it, and at the foot of its steps —: the editor measures them where it is placed; on level ground they are its depth and 0.57 m, and its depth and 0.27 m, its box's top — its rim — that second measure over the ground.",
    faces: FACES3,
    shape: "cube",
    sized: true,
    size: [16.46, 8.9, 1.97],
    sizeNote: "what its basin, its deck, its steps and its base make (m): a size given sets its basin's length and width",
    anchor: [-1, -1, 1],
    lookedBy: "style",
    looks: LOOKS5,
    lookLabels: LOOK_LABELS4,
    params: [
      { name: "style", label: "Deck", min: 0, max: STYLES3.length - 1, default: 0, step: 1, options: STYLES3, labels: ["Stone", "Timber"], description: "What its deck is of, which its looks go by: stone — paving, its base rendered or of stone —; timber — boards, its base clad in them." },
      { name: "length", label: "Length", min: 4, max: 30, default: 10, step: 0.1, description: "How long its basin is inside, along its x (m)." },
      { name: "width", label: "Width", min: 2.5, max: 15, default: 5, step: 0.1, description: "How wide its basin is inside, along its y (m)." },
      { name: "depth", label: "Depth", min: 0.4, max: 2, default: 1.4, step: 0.05, description: "How deep its water is (m): from 1.3 m it is swum in; shallower, waded." },
      { name: "deck", label: "Deck width", min: 0, max: 6, default: 1.5, step: 0.1, description: "How far its deck goes on round it past its coping (m): 0, its coping alone, 0.45 m." },
      { name: "steps", label: "Steps", min: 0, max: 1, default: 0, step: 1, options: ["end", "side"], labels: ["At an end", "At a side"], description: "Where its steps are — those up to the deck from the ground, and before them those down into the water —: in the middle of its +x end, or of its +y side." },
      { name: "water", label: "Water", min: 0, max: WATERS.length - 1, default: 0, step: 1, options: WATERS, labels: ["Calm", "Rippled"], description: "How rippled its water is: the bank's calm water, or its rippled one." },
      { name: "plinth", label: "Base", min: 0.6, max: 6, default: 1.97, step: 0.01, description: "How far its base goes down under its rim (m): past the lowest ground under it — never less than its water, its rim over it and its floor take." },
      { name: "stoop", label: "Steps up", min: 0, max: 6, default: 1.67, step: 0.01, description: "How far the ground at the foot of its steps lies under its rim (m): a step for every 0.19 m." }
    ]
  });
});

// src/build/kinds/lantern.js
var BASE = 0.16, CAP = 0.3, GLASS = 0.78, lanternDressing = (lit) => ({
  color: [1, 0.74, 0.45],
  surface: {
    ...lit && { emissive: 0.9, glow: 0.25 },
    faces: {
      0: { color: lit ? [1, 0.74, 0.45] : [0.32, 0.26, 0.17], ...!lit && { emissive: 0 } },
      1: { texture: "metal/painted/metal-027", color: [0.027, 0.026, 0.035], emissive: 0, glow: 0 }
    }
  },
  light: lit ? { on: "night", range: 8, color: [1, 0.72, 0.42], intensity: 0.85 } : { on: false }
}), lantern;
var init_lantern = __esm(() => {
  init_mesh();
  lantern = Object.freeze({
    name: "lantern",
    label: "Lantern",
    description: "The housing of a lamp's light: a base, a box of glass that glows, a pointed cap — in a small box whose middle is the flame, where the part's light sits. Give it a light (At night) or leave it dark; stand it on a post. Under a metre, so its light passes it as its own fixture.",
    faces: ["glass", "frame"],
    shape: "cube",
    sized: true,
    size: [0.3, 0.3, 0.46],
    params: [],
    mesh: (params, seed, level, size) => {
      const [hx, hy, hz] = size.map((v) => v / 2);
      const mesh = createMesh(2);
      const flat = (p, n) => boxUv(p, n, [-hx, -hy, -hz], 1, 1);
      const box = (slot, min, max) => addBox(mesh, min, max, () => slot, flat);
      if (level === 0) {
        box(0, [-hx * GLASS, -hy * GLASS, -hz], [hx * GLASS, hy * GLASS, hz]);
        return mesh.pack(size);
      }
      const base = -hz + size[2] * BASE;
      const cap = hz - size[2] * CAP;
      box(1, [-hx, -hy, -hz], [hx, hy, base]);
      box(0, [-hx * GLASS, -hy * GLASS, base], [hx * GLASS, hy * GLASS, cap]);
      const corners = [[-hx, -hy], [hx, -hy], [hx, hy], [-hx, hy]].map(([x, y]) => [x, y, cap]);
      const apex = [0, 0, hz];
      const rise = hz - cap;
      for (let k = 0;k < 4; k++) {
        const [a, b] = [corners[k], corners[(k + 1) % 4]];
        const out = [b[1] - a[1], a[0] - b[0]];
        const side = Math.hypot(out[0], out[1]);
        const run = (a[0] * out[0] + a[1] * out[1]) / side;
        const slope = Math.hypot(run, rise);
        mesh.polygon(1, [a, b, apex], [out[0] / side * (rise / slope), out[1] / side * (rise / slope), run / slope], flat);
      }
      mesh.polygon(1, [...corners].reverse(), [0, 0, -1], flat);
      return mesh.pack(size);
    },
    collider: (params, seed, size) => [solidBox(size.map((v) => -v / 2), size.map((v) => v / 2))]
  });
});

// src/build/prim/profile.js
var FACE, FILL_RADIUS, EPS = 0.000000001, polygon = (out, { begin, end, sides, offset = 0, share = 1, split = 0, uScale = 1, edges = false }) => {
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
}, generateProfile = (params, detail, split, pathOpen) => {
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
    const { scale: scale4 = hollow, flat = false, ...shape } = holeShape;
    const inner = [];
    polygon(inner, { begin, end, ...shape });
    for (let i = inner.length - 3;i >= 0; i -= 3)
      out.push(inner[i] * scale4, inner[i + 1] * scale4, inner[i + 2] * scale4);
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
var init_profile = __esm(() => {
  init_params();
  FACE = Object.freeze({ TOP: 1, BOTTOM: 2, INNER: 4, CUT_BEGIN: 8, CUT_END: 16, OUTER: 32 });
  FILL_RADIUS = Object.freeze([1, 1, 1, 0.5, Math.SQRT1_2, 0.53, 0.525, 0.5]);
});

// src/build/prim/path.js
var EPS2 = 0.000000001, lerp = (a, b, t) => a * (1 - t) + b * t, isCircular = (pathCurve) => [PATH.CIRCLE, PATH.CIRCLE2, PATH.TEST].includes(pathCurve & 240), aboutZ = (angle) => {
  const c = Math.cos(angle), s = Math.sin(angle);
  return [c, -s, 0, s, c, 0, 0, 0, 1];
}, aboutXZ = (theta, phi) => {
  const ct = Math.cos(theta), st = Math.sin(theta), cp = Math.cos(phi), sp = Math.sin(phi);
  return [cp, -sp, 0, ct * sp, ct * cp, -st, st * sp, st * cp, ct];
}, generatePath = (params, detail, split) => {
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
var init_path = __esm(() => {
  init_params();
  init_profile();
});

// src/build/prim/mesher.js
var DETAIL2, SEAM = 0.000001, TINY = 0.000000000001, WELD2 = 1e6, paramsOf = (shape) => constrainParams(Array.isArray(shape) || ArrayBuffer.isView(shape) ? decodeShape(shape) : shape).params, splitOf = (params, detail) => {
  const kind = params.profileCurve & 15;
  const flat = kind !== PROFILE.CIRCLE && kind !== PROFILE.HALF_CIRCLE;
  return flat && !isCircular(params.pathCurve) && (params.scaleX !== 1 || params.scaleY !== 1) ? 0 : Math.floor(0.66 * detail);
}, meshPrim = (shape, lod = 3) => {
  const detail = DETAIL2[lod];
  if (detail === undefined)
    throw new RangeError(`no level of detail ${lod}: 0 to 3`);
  const params = paramsOf(shape);
  const split = splitOf(params, detail);
  const path = generatePath(params, detail, split);
  const profile2 = generateProfile(params, detail, split, path.open);
  const mesh = { params, profile: profile2, path, grid: sweep(profile2, path) };
  return profile2.faces.map((face) => face.kind === "cap" ? cap(face, mesh) : side(face, mesh));
}, meshPrimAsset = (shape, lod = 3) => {
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
}, sweep = ({ points, count }, { rows }) => {
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
}, face = (id, positions, normals, uvs, indices) => ({
  id,
  positions: Float32Array.from(positions),
  normals: Float32Array.from(normals),
  uvs: Float32Array.from(uvs),
  indices: (positions.length / 3 > 65535 ? Uint32Array : Uint16Array).from(indices)
}), side = ({ id, kind, index, count, flat }, { params, profile: profile2, path, grid }) => {
  const { points, count: total } = profile2;
  const { rows } = path;
  const columns = id === FACE.INNER && flat && count > 2 ? [index, ...Array.from({ length: count - 1 }, (_, s) => [index + s + 1, index + s + 1]).flat(), profile2.open ? index + count - 1 : index] : Array.from({ length: count }, (_, s) => (index + s) % total);
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
  const same2 = (a, b) => distance2(positions, a, b) < SEAM;
  const weld = (a, b) => {
    for (let k = 0;k < 3; k++)
      normals[a * 3 + k] = normals[b * 3 + k] = normals[a * 3 + k] + normals[b * 3 + k];
  };
  const pole = (s) => rows.every((_, t) => same2(s, t * S + s));
  if (columns.every((_, s) => same2(s, (T - 1) * S + s)))
    for (let s = 0;s < S; s++)
      weld(s, (T - 1) * S + s);
  if (!pole(0) && rows.every((_, t) => same2(t * S, t * S + S - 1)))
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
}, cap = ({ id }, { params, profile: profile2, path, grid }) => {
  const top = id === FACE.TOP;
  const { points, count, outer } = profile2;
  const row = top ? path.rows.length - 1 : 0;
  const { rotation: m } = path.rows[row];
  const sign = top ? 1 : -1;
  const normal = [m[2] * sign, m[5] * sign, m[8] * sign];
  const at = (i) => grid.subarray((row * count + i) * 3, (row * count + i) * 3 + 3);
  const uv = (x, y) => [x + 0.5, top ? y + 0.5 : 0.5 - y];
  const positions = [], uvs = [], indices = [];
  const { profileCurve, pathCurve, profileBegin, profileEnd, pathBegin, pathEnd } = params;
  if (profileCurve === PROFILE.SQUARE && pathCurve === PATH.LINE && !profile2.hollow && profileBegin === 0 && profileEnd === 1 && pathBegin === 0 && pathEnd === 1) {
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
    if (!profile2.hollow && !profile2.open) {
      positions.push(...boxCentre(positions, 3));
      uvs.push(...boxCentre(uvs, 2));
      fan(count, count - 1);
    } else if (!profile2.hollow) {
      fan(count - 1, count - 2);
    } else {
      zipper(points, count, outer, top, indices);
    }
  }
  const normals = Array.from({ length: positions.length / 3 }, () => normal).flat();
  return face(id, positions, normals, uvs, indices);
}, zipper = (points, count, outer, top, indices) => {
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
}, triangleNormal = (p, a, b, c) => {
  const ax = p[a * 3], ay = p[a * 3 + 1], az = p[a * 3 + 2];
  const ux = p[b * 3] - ax, uy = p[b * 3 + 1] - ay, uz = p[b * 3 + 2] - az;
  const vx = p[c * 3] - ax, vy = p[c * 3 + 1] - ay, vz = p[c * 3 + 2] - az;
  return [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx];
}, addTo = (target, i, n) => {
  target[i * 3] += n[0];
  target[i * 3 + 1] += n[1];
  target[i * 3 + 2] += n[2];
}, distance2 = (p, a, b) => (p[a * 3] - p[b * 3]) ** 2 + (p[a * 3 + 1] - p[b * 3 + 1]) ** 2 + (p[a * 3 + 2] - p[b * 3 + 2]) ** 2, normalizeAll = (normals, sum) => {
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
}, boxCentre = (values, size) => Array.from({ length: size }, (_, k) => {
  let min = Infinity, max = -Infinity;
  for (let i = k;i < values.length; i += size) {
    min = Math.min(min, values[i]);
    max = Math.max(max, values[i]);
  }
  return (min + max) / 2;
});
var init_mesher = __esm(() => {
  init_params();
  init_profile();
  init_path();
  DETAIL2 = Object.freeze([1, 1.5, 2.5, 4]);
});

// src/build/prim/sculpt.js
var SCULPT_SIDES, STITCHES, MAX_POINTS = 1600, FINEST2, MIN_AREA = 0.002, MAX_AREA = 32, BASE64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", DIGIT, fromBase64 = (text) => {
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
}, meshSculpt = ({ samples, columns, rows, stitch = "sphere", mirror = false, invert = false }, lod = 3) => {
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
}, pack = (positions, normals, s, t, all) => {
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
  const kept2 = [];
  for (let k = 0;k < all.length; k += 3) {
    const a = all[k], b = all[k + 1], c = all[k + 2];
    if (place[a] !== place[b] && place[b] !== place[c] && place[c] !== place[a])
      kept2.push(a, b, c);
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
    indices: (count > 65535 ? Uint32Array : Uint16Array).from(kept2),
    slots: [{ id: 32, first: 0, count: kept2.length }],
    welded,
    bounds: { min, max }
  };
};
var init_sculpt = __esm(() => {
  init_mesher();
  init_params();
  SCULPT_SIDES = Object.freeze([6, 8, 16, 32]);
  STITCHES = Object.freeze(["sphere", "torus", "plane", "cylinder"]);
  FINEST2 = SCULPT_SIDES[3];
  DIGIT = new Map([...BASE64].map((char, i) => [char, i]));
});

// src/build/kinds/sculpt.js
var yesNo, sculpt;
var init_sculpt2 = __esm(() => {
  init_sculpt();
  yesNo = ["no", "yes"];
  sculpt = Object.freeze({
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
});

// src/build/kinds/blocks.js
var VERSION = 1, MOST_COLOURS = 8, MOST_BYTES = 32768, MOST_CELLS = 32768, MOST_BOXES = 2048, decodeBlocks = (text) => {
  const bytes = fromBase64(text ?? "");
  if (bytes.length < 6 || bytes[0] !== VERSION)
    return null;
  const counts = [bytes[1], bytes[2], bytes[3]];
  if (counts.some((n) => n < 1) || counts[0] * counts[1] * counts[2] > MOST_CELLS)
    return null;
  let at = 4;
  if (bytes.length < at + 2 * (counts[0] + counts[1] + counts[2] - 3) + 2)
    return null;
  const planes = counts.map((n) => [0, ...Array.from({ length: n - 1 }, () => {
    const v = bytes[at] | bytes[at + 1] << 8;
    at += 2;
    return v / 65536;
  }), 1]);
  if (planes.some((list) => list.some((v, i) => i > 0 && v <= list[i - 1])))
    return null;
  const count = bytes[at] | bytes[at + 1] << 8;
  if (count > MOST_BOXES)
    return null;
  at += 2;
  const boxes = [];
  for (let b = 0;b < count && at + 7 <= bytes.length; b++) {
    const [x0, x1, y0, y1, z0, z1, c] = bytes.subarray(at, at + 7);
    at += 7;
    const box = { lo: [x0, y0, z0], hi: [x1, y1, z1], colour: Math.min(c & 127, MOST_COLOURS - 1) };
    if (c & 128) {
      const packed = bytes.subarray(at, at + 3);
      at += 3;
      box.sides = [...packed].flatMap((v) => [v & 15, v >> 4]).map((s) => Math.min(s, MOST_COLOURS - 1));
    }
    if (box.lo.every((v, k) => v < box.hi[k] && box.hi[k] <= counts[k]))
      boxes.push(box);
  }
  return { planes, boxes };
}, meshBlocks = ({ planes, boxes }, size, slots) => {
  const counts = planes.map((list) => list.length - 1);
  const [nx, ny, nz] = counts;
  const strides = [1, nx, nx * ny];
  const colour = new Int8Array(nx * ny * nz).fill(-1);
  const own = new Map;
  for (const box of boxes) {
    for (let k = box.lo[2];k < box.hi[2]; k++)
      for (let j = box.lo[1];j < box.hi[1]; j++)
        for (let i = box.lo[0];i < box.hi[0]; i++) {
          const c = (k * ny + j) * nx + i;
          colour[c] = box.colour;
          if (box.sides)
            own.set(c, box.sides);
          else
            own.delete(c);
        }
  }
  const metres = planes.map((list, axis) => list.map((f) => (f - 0.5) * size[axis]));
  const origin = size.map((v) => -v / 2);
  const uvOf = (point, normal) => boxUv(point, normal, origin, 1, 1);
  const mesh = createMesh(slots);
  for (let axis = 0;axis < 3; axis++) {
    const [p, q] = [(axis + 1) % 3, (axis + 2) % 3];
    const [np, nq, na] = [counts[p], counts[q], counts[axis]];
    const shown2 = new Int8Array(np * nq);
    for (const sign of [-1, 1]) {
      const side2 = axis * 2 + (sign > 0 ? 1 : 0);
      const outward = [0, 0, 0];
      outward[axis] = sign;
      for (let layer2 = 0;layer2 < na; layer2++) {
        const next = layer2 + sign;
        const open = next < 0 || next >= na;
        for (let b = 0;b < nq; b++)
          for (let a = 0;a < np; a++) {
            const c = layer2 * strides[axis] + a * strides[p] + b * strides[q];
            const here = colour[c];
            shown2[b * np + a] = here >= 0 && (open || colour[c + sign * strides[axis]] < 0) ? own.get(c)?.[side2] ?? here : -1;
          }
        for (let b = 0;b < nq; b++)
          for (let a = 0;a < np; a++) {
            const tone = shown2[b * np + a];
            if (tone < 0)
              continue;
            let a1 = a + 1;
            while (a1 < np && shown2[b * np + a1] === tone)
              a1++;
            let b1 = b + 1;
            grow:
              while (b1 < nq) {
                for (let x = a;x < a1; x++)
                  if (shown2[b1 * np + x] !== tone)
                    break grow;
                b1++;
              }
            for (let y = b;y < b1; y++)
              shown2.fill(-1, y * np + a, y * np + a1);
            const level = metres[axis][layer2 + (sign > 0 ? 1 : 0)];
            const corner = (s, t) => {
              const v = [0, 0, 0];
              v[axis] = level;
              v[p] = metres[p][s];
              v[q] = metres[q][t];
              return v;
            };
            mesh.polygon(tone, [corner(a, b), corner(a1, b), corner(a1, b1), corner(a, b1)], outward, uvOf);
          }
      }
    }
  }
  return mesh.pack(size);
}, made, MADE = 16, meshedOf = (text, colours, size) => {
  const key = `${colours}:${size.join(",")}:${text}`;
  if (made.has(key))
    return made.get(key);
  const read = decodeBlocks(text) ?? { planes: [[0, 1], [0, 1], [0, 1]], boxes: [{ lo: [0, 0, 0], hi: [1, 1, 1], colour: 0 }] };
  const mesh = meshBlocks(read, size, colours + 1);
  made.set(key, mesh);
  if (made.size > MADE)
    made.delete(made.keys().next().value);
  return mesh;
}, colourOptions, blocks;
var init_blocks = __esm(() => {
  init_mesh();
  init_sculpt();
  made = new Map;
  colourOptions = Array.from({ length: MOST_COLOURS }, (_, i) => `${i + 1} colour${i ? "s" : ""}`);
  blocks = Object.freeze({
    name: "blocks",
    label: "Blocks",
    description: "A square-cornered solid in one part: boxes on a grid of its own, each of one of up to eight colours, meshed as one surface — only what shows from outside, nothing between two boxes. Never written by hand: what rebuilds a model makes one of its square-cornered solids (a staircase, a block with its steps cut, a figure of voxels), exact to its corners.",
    faces: ({ colours }) => Array.from({ length: colours + 1 }, (_, i) => `colour ${i + 1}`),
    facesBy: "colours",
    shape: "cube",
    sized: true,
    size: [1, 1, 1],
    params: [
      { name: "colours", label: "Colours", min: 0, max: MOST_COLOURS - 1, default: 0, step: 1, options: colourOptions, fixed: true, description: "How many colours its boxes take, each a face of the part: 0 one, 7 eight." },
      { name: "blocks", label: "Blocks", bytes: MOST_BYTES, min: 0, max: MOST_BYTES, step: 4, default: "", fixed: true, valid: (text) => text === "" || decodeBlocks(text) !== null, description: "Its grid and its boxes, as base64: each axis's planes as fractions of its box, then each box between two planes along each axis, of a colour; at most 32,768 cells and 2,048 boxes." }
    ],
    mesh: ({ colours, blocks: text }, seed, level, size) => meshedOf(text, colours, size),
    collider: ({ blocks: text }, seed, size) => {
      const read = decodeBlocks(text);
      if (!read)
        return null;
      const at = (axis, index) => (read.planes[axis][index] - 0.5) * size[axis];
      return read.boxes.map(({ lo, hi }) => solidBox(lo.map((v, k) => at(k, v)), hi.map((v, k) => at(k, v))));
    }
  });
});

// src/build/kinds/outline.js
var VERSION2 = 1, MOST_COLOURS2 = 8, MOST_POINTS = 512, MOST_RINGS = 64, MOST_BYTES2 = 4096, SPAN2 = 65535, LEAST = 0.000000000001, decodeOutline = (text) => {
  const bytes = fromBase64(text ?? "");
  if (bytes.length < 3 || bytes[0] !== VERSION2 || bytes[2] < 1 || bytes[2] > MOST_RINGS)
    return null;
  const colour = (c) => Math.min(c, MOST_COLOURS2 - 1);
  const read = { top: colour(bytes[1] & 15), bottom: colour(bytes[1] >> 4), rings: [] };
  let at = 3, total = 0;
  for (let r = 0;r < bytes[2]; r++) {
    if (at + 2 > bytes.length)
      return null;
    const count = bytes[at] | bytes[at + 1] << 8;
    at += 2;
    total += count;
    if (count < 3 || total > MOST_POINTS || at + count * 4 + Math.ceil(count / 2) > bytes.length)
      return null;
    const points = Array.from({ length: count }, (_, i) => {
      const p = at + i * 4;
      return [(bytes[p] | bytes[p + 1] << 8) / SPAN2, (bytes[p + 2] | bytes[p + 3] << 8) / SPAN2];
    });
    at += count * 4;
    const colours = Array.from({ length: count }, (_, i) => colour(bytes[at + (i >> 1)] >> (i & 1) * 4 & 15));
    at += Math.ceil(count / 2);
    read.rings.push({ points, colours });
  }
  return read;
}, area22 = (points) => points.reduce((sum, [x, y], i) => {
  const [nx, ny] = points[(i + 1) % points.length];
  return sum + x * ny - nx * y;
}, 0), within = ([x, y], points) => {
  let odd = false;
  for (let i = 0, j = points.length - 1;i < points.length; j = i++) {
    const [ax, ay] = points[i], [bx, by] = points[j];
    if (ay > y !== by > y && x < ax + (y - ay) * (bx - ax) / (by - ay))
      odd = !odd;
  }
  return odd;
}, inTriangle = ([px, py], [ax, ay], [bx, by], [cx, cy]) => {
  const d1 = (px - bx) * (ay - by) - (ax - bx) * (py - by);
  const d2 = (px - cx) * (by - cy) - (bx - cx) * (py - cy);
  const d3 = (px - ax) * (cy - ay) - (cx - ax) * (py - ay);
  return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
}, bridged = (ring, hole) => {
  let h = 0;
  for (let i = 1;i < hole.length; i++)
    if (hole[i][0] > hole[h][0])
      h = i;
  const [hx, hy] = hole[h];
  let seen = -1, reach = Infinity;
  for (let i = 0;i < ring.length; i++) {
    const [ax, ay] = ring[i], [bx, by] = ring[(i + 1) % ring.length];
    if (ay > hy === by > hy)
      continue;
    const x = ax + (hy - ay) * (bx - ax) / (by - ay);
    if (x >= hx && x < reach)
      [reach, seen] = [x, ax > bx ? i : (i + 1) % ring.length];
  }
  if (seen < 0)
    return null;
  const sight = ring[seen];
  let chosen = seen, nearest = Infinity;
  for (let i = 0;i < ring.length; i++) {
    const p = ring[i];
    if (i === seen || p[0] < hx || !inTriangle(p, [hx, hy], [reach, hy], sight))
      continue;
    const slope = Math.abs(p[1] - hy) / Math.max(p[0] - hx, 0.000000000001);
    if (slope < nearest)
      [nearest, chosen] = [slope, i];
  }
  return [...ring.slice(0, chosen + 1), ...hole.slice(h), ...hole.slice(0, h + 1), ...ring.slice(chosen)];
}, meshOutline = ({ top, bottom, rings }, size, slots) => {
  const [sx, sy, sz] = size;
  const cleaned = rings.map(({ points: points2, colours }) => {
    const kept2 = [];
    points2.forEach(([fx, fy], i) => {
      const p = [(fx - 0.5) * sx, (fy - 0.5) * sy];
      const last = kept2.at(-1);
      if (!last || Math.abs(last.p[0] - p[0]) > 0.000000001 || Math.abs(last.p[1] - p[1]) > 0.000000001)
        kept2.push({ p, colour: colours[i] });
      else
        last.colour = colours[i];
    });
    if (kept2.length > 1 && Math.abs(kept2[0].p[0] - kept2.at(-1).p[0]) <= 0.000000001 && Math.abs(kept2[0].p[1] - kept2.at(-1).p[1]) <= 0.000000001)
      kept2.pop();
    return kept2;
  }).filter((kept2) => kept2.length >= 3 && Math.abs(area22(kept2.map(({ p }) => p))) > LEAST);
  const points = cleaned.map((kept2) => kept2.map(({ p }) => p));
  const depth = points.map((ring, i) => points.reduce((n, other, j) => n + (j !== i && within(ring[0], other) ? 1 : 0), 0));
  const turned2 = cleaned.map((kept2, i) => {
    const wanted = depth[i] % 2 === 0 ? 1 : -1;
    if (Math.sign(area22(points[i])) === wanted)
      return kept2;
    return kept2.map((_, k) => ({ p: kept2[kept2.length - 1 - k].p, colour: kept2[(2 * kept2.length - 2 - k) % kept2.length].colour }));
  });
  const mesh = createMesh(slots);
  const origin = size.map((v) => -v / 2);
  const uvOf = (point, normal) => boxUv(point, normal, origin, 1, 1);
  const [low, high] = [-sz / 2, sz / 2];
  turned2.forEach((kept2, i) => {
    if (depth[i] % 2)
      return;
    const holes = turned2.filter((_, j) => depth[j] === depth[i] + 1 && within(points[j][0], points[i])).map((ring2) => ring2.map(({ p }) => p)).sort((a, b) => Math.max(...b.map(([x]) => x)) - Math.max(...a.map(([x]) => x)));
    let ring = kept2.map(({ p }) => p);
    for (const hole of holes)
      ring = bridged(ring, hole) ?? ring;
    const triangles = triangulate(ring);
    const ups = ring.map(([x, y]) => mesh.vertex(top, [x, y, high], [0, 0, 1], uvOf([x, y, high], [0, 0, 1])));
    const downs = ring.map(([x, y]) => mesh.vertex(bottom, [x, y, low], [0, 0, -1], uvOf([x, y, low], [0, 0, -1])));
    for (const [a, b, c] of triangles) {
      mesh.triangle(top, ups[a], ups[b], ups[c]);
      mesh.triangle(bottom, downs[a], downs[c], downs[b]);
    }
  });
  for (const kept2 of turned2) {
    kept2.forEach(({ p: [ax, ay], colour }, k) => {
      const [bx, by] = kept2[(k + 1) % kept2.length].p;
      const length2 = Math.hypot(bx - ax, by - ay);
      if (length2 < 0.000000001)
        return;
      const normal = [(by - ay) / length2, -(bx - ax) / length2, 0];
      const corner = (x, y, z) => mesh.vertex(colour, [x, y, z], normal, uvOf([x, y, z], normal));
      mesh.quad(colour, corner(ax, ay, low), corner(bx, by, low), corner(bx, by, high), corner(ax, ay, high));
    });
  }
  return mesh.pack(size);
}, made2, MADE2 = 16, meshedOf2 = (text, colours, size) => {
  const key = `${colours}:${size.join(",")}:${text}`;
  if (made2.has(key))
    return made2.get(key);
  const read = decodeOutline(text) ?? { top: 0, bottom: 0, rings: [{ points: [[0, 0], [1, 0], [1, 1], [0, 1]], colours: [0, 0, 0, 0] }] };
  const slots = colours + 1;
  const fit = (c) => Math.min(c, slots - 1);
  const mesh = meshOutline({ top: fit(read.top), bottom: fit(read.bottom), rings: read.rings.map(({ points, colours: edges }) => ({ points, colours: edges.map(fit) })) }, size, slots);
  made2.set(key, mesh);
  if (made2.size > MADE2)
    made2.delete(made2.keys().next().value);
  return mesh;
}, colourOptions2, outline;
var init_outline = __esm(() => {
  init_mesh();
  init_sculpt();
  made2 = new Map;
  colourOptions2 = Array.from({ length: MOST_COLOURS2 }, (_, i) => `${i + 1} colour${i ? "s" : ""}`);
  outline = Object.freeze({
    name: "outline",
    label: "Outline",
    description: "A flat shape drawn out through its box, bottom to top: rings of points round its outside and round holes right through it — whatever lies inside an odd number of rings solid —, each edge of one of up to eight colours, its two ends theirs. Never written by hand: what rebuilds a model makes one of its solids drawn out along a way (a gateway's arch, a wall with round windows, a letter, a beam of any section), exact to its corners.",
    faces: ({ colours }) => Array.from({ length: colours + 1 }, (_, i) => `colour ${i + 1}`),
    facesBy: "colours",
    shape: "cube",
    sized: true,
    size: [1, 1, 1],
    params: [
      { name: "colours", label: "Colours", min: 0, max: MOST_COLOURS2 - 1, default: 0, step: 1, options: colourOptions2, fixed: true, description: "How many colours its edges and ends take, each a face of the part: 0 one, 7 eight." },
      { name: "outline", label: "Outline", bytes: MOST_BYTES2, min: 0, max: MOST_BYTES2, step: 4, default: "", fixed: true, valid: (text) => text === "" || decodeOutline(text) !== null, description: "Its rings, as base64: each ring's points as fractions of its box across x and y, and each edge's colour; at most 64 rings and 512 points." }
    ],
    mesh: ({ colours, outline: text }, seed, level, size) => meshedOf2(text, colours, size)
  });
});

// src/build/kinds/solid-surface.js
var CREASE, turnZ = (p, degrees) => {
  const r = degrees * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
  return [p[0] * c - p[1] * s, p[0] * s + p[1] * c, p[2]];
}, surfaceOf = (lefts, size, slots, origins) => {
  const mesh = createMesh(slots);
  const origin = size.map((v) => -v / 2);
  let any = false;
  for (const left of lefts) {
    const { vertProperties: P, triVerts: T, numProp, runIndex, runOriginalID } = left.getMesh();
    if (!T.length)
      continue;
    any = true;
    const triangles = T.length / 3;
    const owners = new Array(triangles).fill(null);
    for (let r = 0;r < runOriginalID.length; r++)
      owners.fill(origins.get(runOriginalID[r]) ?? null, runIndex[r] / 3, runIndex[r + 1] / 3);
    const at = (v) => [P[v * numProp], P[v * numProp + 1], P[v * numProp + 2]];
    const normals = new Float64Array(triangles * 3), ways = new Float64Array(triangles * 3);
    const around = new Map;
    for (let t = 0;t < triangles; t++) {
      const [a, b, c] = [at(T[t * 3]), at(T[t * 3 + 1]), at(T[t * 3 + 2])];
      const n = cross2(sub(b, a), sub(c, a));
      const l = length(n) || 1;
      normals.set(n, t * 3);
      ways.set([n[0] / l, n[1] / l, n[2] / l], t * 3);
      for (let k = 0;k < 3; k++)
        (around.get(T[t * 3 + k]) ?? around.set(T[t * 3 + k], []).get(T[t * 3 + k])).push(t);
    }
    const named = spotRegions(at, T, owners, ways);
    for (let t = 0;t < triangles; t++) {
      const own = [ways[t * 3], ways[t * 3 + 1], ways[t * 3 + 2]];
      const owner = owners[t];
      const tone = named && named[t] >= 0 ? owner.spots[named[t]].colour : owner?.toneOf?.(own) ?? owner?.colour ?? 0;
      const points = [0, 1, 2].map((k) => at(T[t * 3 + k]));
      const uvs = owner?.uv?.(points) ?? null;
      const crease = owner?.crease ?? CREASE;
      const corners = [0, 1, 2].map((k) => {
        const sum = [0, 0, 0];
        for (const other of around.get(T[t * 3 + k])) {
          if (ways[other * 3] * own[0] + ways[other * 3 + 1] * own[1] + ways[other * 3 + 2] * own[2] < crease)
            continue;
          for (let i = 0;i < 3; i++)
            sum[i] += normals[other * 3 + i];
        }
        const l = Math.hypot(...sum) || 1;
        return mesh.vertex(tone, points[k], sum.map((s) => s / l), uvs ? uvs[k] : boxUv(points[k], own, origin, 1, 1));
      });
      mesh.triangle(tone, ...corners);
    }
  }
  return any ? mesh.pack(size) : null;
}, nearestOn = (p, a, b, c) => {
  const ab = sub(b, a), ac = sub(c, a), ap = sub(p, a);
  const d1 = dot2(ab, ap), d2 = dot2(ac, ap);
  if (d1 <= 0 && d2 <= 0)
    return a;
  const bp = sub(p, b), d3 = dot2(ab, bp), d4 = dot2(ac, bp);
  if (d3 >= 0 && d4 <= d3)
    return b;
  const vc = d1 * d4 - d3 * d2;
  if (vc <= 0 && d1 >= 0 && d3 <= 0)
    return add(a, scale(ab, d1 / (d1 - d3)));
  const cp = sub(p, c), d5 = dot2(ab, cp), d6 = dot2(ac, cp);
  if (d6 >= 0 && d5 <= d6)
    return c;
  const vb = d5 * d2 - d1 * d6;
  if (vb <= 0 && d2 >= 0 && d6 <= 0)
    return add(a, scale(ac, d2 / (d2 - d6)));
  const va = d3 * d6 - d5 * d4;
  if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0)
    return add(b, scale(sub(c, b), (d4 - d3) / (d4 - d3 + (d5 - d6))));
  const w = 1 / (va + vb + vc);
  return add(a, add(scale(ab, vb * w), scale(ac, vc * w)));
}, spotRegions = (at, T, owners, ways) => {
  if (!owners.some((owner) => owner?.spots?.length))
    return null;
  const triangles = T.length / 3;
  const named = new Int32Array(triangles).fill(-1);
  const spotted = new Map;
  for (let t = 0;t < triangles; t++)
    if (owners[t]?.spots?.length)
      (spotted.get(owners[t]) ?? spotted.set(owners[t], []).get(owners[t])).push(t);
  const queue = [];
  for (const [owner, own] of spotted)
    owner.spots.forEach(({ at: spot }, s) => {
      let best = -1, gap = Infinity;
      for (const t of own) {
        const d = length(sub(nearestOn(spot, at(T[t * 3]), at(T[t * 3 + 1]), at(T[t * 3 + 2])), spot));
        if (d < gap)
          [best, gap] = [t, d];
      }
      if (best < 0)
        return;
      named[best] = s;
      queue.push(best);
    });
  const ids = new Map, corner = (v) => {
    const key = at(v).map((x) => Math.round(x * 1e6)).join();
    return ids.get(key) ?? ids.set(key, ids.size).get(key);
  };
  const edges = new Map, edgeOf = (a, b) => a < b ? `${a},${b}` : `${b},${a}`;
  const sides = new Map;
  for (const own of spotted.values())
    for (const t of own) {
      const [a, b, c] = [corner(T[t * 3]), corner(T[t * 3 + 1]), corner(T[t * 3 + 2])];
      sides.set(t, [edgeOf(a, b), edgeOf(b, c), edgeOf(c, a)]);
      for (const key of sides.get(t))
        (edges.get(key) ?? edges.set(key, []).get(key)).push(t);
    }
  for (let head = 0;head < queue.length; head++) {
    const t = queue[head];
    const owner = owners[t], crease = owner.crease ?? CREASE;
    for (const key of sides.get(t))
      for (const n of edges.get(key)) {
        if (named[n] >= 0 || owners[n] !== owner)
          continue;
        if (ways[t * 3] * ways[n * 3] + ways[t * 3 + 1] * ways[n * 3 + 1] + ways[t * 3 + 2] * ways[n * 3 + 2] < crease)
          continue;
        named[n] = named[t];
        queue.push(n);
      }
  }
  return named;
}, hullOfGrid = (points) => {
  const faces = hullOf2(points);
  if (!faces)
    return null;
  const orient = orientIn(points);
  const onPlane = ([a, b, c], face2) => face2.every((p) => orient(a, b, c, p) === 0);
  const around = new Map;
  for (const face2 of faces)
    for (const v of face2)
      (around.get(v) ?? around.set(v, []).get(v)).push(face2);
  const corners = [...around].filter(([, own]) => own.reduce((planes, face2) => planes.some((plane) => onPlane(plane, face2)) ? planes : [...planes, face2], []).length >= 3).map(([v]) => v);
  if (corners.length === around.size)
    return faces;
  return hullOf2(corners.map((v) => points[v]))?.map((face2) => face2.map((i) => corners[i])) ?? null;
}, orientIn = (points) => (a, b, c, p) => {
  const [ax, ay, az] = points[a], [bx, by, bz] = points[b], [cx, cy, cz] = points[c], [px, py, pz] = points[p];
  const ux = bx - ax, uy = by - ay, uz = bz - az, vx = cx - ax, vy = cy - ay, vz = cz - az;
  return (uy * vz - uz * vy) * (px - ax) + (uz * vx - ux * vz) * (py - ay) + (ux * vy - uy * vx) * (pz - az);
}, hullOf2 = (points) => {
  const n = points.length;
  const orient = orientIn(points);
  const [ax, ay, az] = points[0] ?? [];
  const b = points.findIndex(([x, y, z]) => x !== ax || y !== ay || z !== az);
  if (b < 0)
    return null;
  const [ux, uy, uz] = [points[b][0] - ax, points[b][1] - ay, points[b][2] - az];
  const c = points.findIndex(([x, y, z]) => uy * (z - az) - uz * (y - ay) || uz * (x - ax) - ux * (z - az) || ux * (y - ay) - uy * (x - ax));
  if (c < 0)
    return null;
  const d = points.findIndex((_, i) => orient(0, b, c, i));
  if (d < 0)
    return null;
  const [p, q] = orient(0, b, c, d) < 0 ? [b, c] : [c, b];
  let faces = [[0, p, q], [0, d, p], [p, d, q], [0, q, d]];
  for (let i = 1;i < n; i++) {
    if (i === b || i === c || i === d)
      continue;
    const seen = new Set(faces.filter(([x, y, z]) => orient(x, y, z, i) > 0));
    if (!seen.size)
      continue;
    const edges = new Set([...seen].flatMap(([x, y, z]) => [x * n + y, y * n + z, z * n + x]));
    faces = faces.filter((face2) => !seen.has(face2));
    for (const edge of edges)
      if (!edges.has(edge % n * n + Math.floor(edge / n)))
        faces.push([Math.floor(edge / n), edge % n, i]);
  }
  return faces;
};
var init_solid_surface = __esm(() => {
  init_mesh();
  CREASE = Math.cos(30 * Math.PI / 180);
});

// src/settings.js
var setting = (key, values, fallback) => {
  const kept2 = () => {
    try {
      const stored = globalThis.localStorage?.getItem(key);
      return values.find((value) => String(value) === stored) ?? null;
    } catch {
      return null;
    }
  };
  let current = kept2() ?? fallback;
  const listeners2 = new Set;
  const use = (value) => {
    if (!values.includes(value) || value === current)
      return false;
    current = value;
    for (const listener of listeners2)
      listener(value);
    return true;
  };
  return {
    values,
    get: () => current,
    set: (value) => {
      if (!use(value))
        return;
      try {
        globalThis.localStorage?.setItem(key, String(value));
      } catch {}
    },
    use,
    on: (listener) => {
      listeners2.add(listener);
      return () => listeners2.delete(listener);
    }
  };
}, resolution, cloudQuality, volumetricLight, shadowQuality, frameCap, waterQuality, smoothQuality;
var init_settings = __esm(() => {
  resolution = setting("ovgrid:resolution", Object.freeze([0.5, 0.75, 1]), 1);
  cloudQuality = setting("ovgrid:clouds", Object.freeze(["none", "full"]), "full");
  volumetricLight = setting("ovgrid:volumetric", Object.freeze(["off", "on"]), "on");
  shadowQuality = setting("ovgrid:shadows", Object.freeze(["terrain", "cast", "all"]), "all");
  frameCap = setting("ovgrid:frame-cap", Object.freeze([60, 0]), 0);
  waterQuality = setting("ovgrid:water", Object.freeze(["low", "medium", "full"]), "full");
  smoothQuality = setting("ovgrid:smoothing", Object.freeze([0, 1, 2, 3]), 3);
});

// src/build/kinds/solid-mesh.js
var exports_solid_mesh = {};
__export(exports_solid_mesh, {
  meshSolid: () => meshSolid
});
var SHARP2 = 52.5, ROUND_SIDES2 = 12, ACROSS2, MITRE2 = 4, FACING = 0.7, TINY2 = 0.000000001, FOLD = 0.0005, MIRRORS, signedArea = (points) => points.reduce((sum, [x, y], i) => {
  const [u, v] = points[(i + 1) % points.length];
  return sum + x * v - u * y;
}, 0) / 2, ccw = (points) => signedArea(points) < 0 ? [...points].reverse() : points, unturn = (m, p) => [0, 1, 2].map((k) => m[0][k] * p[0] + m[1][k] * p[1] + m[2][k] * p[2]), normalOf = ([a, b, c]) => {
  const n = cross2(sub(b, a), sub(c, a));
  return length(n) > TINY2 ? normalize(n) : null;
}, arcsOf = (line) => {
  const arcs = [0];
  for (let i = 1;i <= line.length; i++) {
    const [ax, ay] = line[i - 1], [bx, by] = line[i % line.length];
    arcs.push(arcs[i - 1] + Math.hypot(bx - ax, by - ay));
  }
  return arcs;
}, NEARER, nearestAlong = (line, arcs, [px, py]) => {
  let best = Infinity, bound = Infinity, along = 0;
  for (let i = 0;i < line.length; i++) {
    const [ax, ay] = line[i], [bx, by] = line[(i + 1) % line.length];
    const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
    const t = l2 > TINY2 ? clamp(((px - ax) * dx + (py - ay) * dy) / l2, 0, 1) : 0;
    const ex = ax + dx * t - px, ey = ay + dy * t - py;
    if (ex * ex + ey * ey > bound)
      continue;
    const d = Math.hypot(ex, ey);
    if (d < best)
      [best, bound, along] = [d, d * d * NEARER, arcs[i] + t * (arcs[i + 1] - arcs[i])];
  }
  return along;
}, unwrap = (values, whole) => Math.max(...values) - Math.min(...values) > whole / 2 ? values.map((v) => v < whole / 2 ? v + whole : v) : values, primitive = (shape, [x, y, z], sides, { Manifold }, keep) => {
  if (shape === "box")
    return keep(Manifold.cube([x, y, z], true));
  if (shape === "cylinder" || shape === "cone")
    return keep(keep(Manifold.cylinder(z, 0.5, shape === "cone" ? 0 : 0.5, sides, true)).scale([x, y, 1]));
  if (shape === "ball")
    return keep(keep(Manifold.sphere(0.5, sides)).scale([x, y, z]));
  return keep(keep(keep(Manifold.cube([1, 1, 1], true)).trimByPlane([0, -1, -1], 0)).scale([x, y, z]));
}, insetHull = (solid, t, { Manifold }, keep) => {
  const pointsOf = (manifold) => {
    const { vertProperties: P, triVerts: T, numProp } = manifold.getMesh();
    const at = (v) => [P[v * numProp], P[v * numProp + 1], P[v * numProp + 2]];
    return { at, T, count: P.length / numProp };
  };
  const outer = pointsOf(solid);
  let centre = [0, 0, 0];
  for (let v = 0;v < outer.count; v++)
    centre = add(centre, outer.at(v));
  centre = scale(centre, 1 / outer.count);
  const duals = [];
  for (let i = 0;i < outer.T.length; i += 3) {
    const corners2 = [outer.at(outer.T[i]), outer.at(outer.T[i + 1]), outer.at(outer.T[i + 2])];
    const normal = normalOf(corners2);
    if (!normal)
      continue;
    const offset = dot2(normal, sub(corners2[0], centre)) - t;
    if (offset <= TINY2)
      return null;
    duals.push(scale(normal, 1 / offset));
  }
  const dual = pointsOf(keep(Manifold.hull(duals)));
  const corners = [];
  for (let i = 0;i < dual.T.length; i += 3) {
    const face2 = [dual.at(dual.T[i]), dual.at(dual.T[i + 1]), dual.at(dual.T[i + 2])];
    const normal = normalOf(face2);
    if (!normal)
      continue;
    const offset = dot2(normal, face2[0]);
    if (offset <= TINY2)
      return null;
    corners.push(add(centre, scale(normal, 1 / offset)));
  }
  return corners.length >= 4 ? keep(Manifold.hull(corners)) : null;
}, hullOf3 = (body, wasm, keep) => {
  const { Manifold } = wasm;
  const points = unpackPoints(body.points, 3).map((p) => p.map((v, k) => v * body.size[k]));
  const ball = body.round ? keep(Manifold.sphere(body.round, ROUND_SIDES2)) : null;
  const outer = keep(Manifold.hull(ball ? points.map((p) => keep(ball.translate(p))) : points));
  if (!body.hollow || !outer.numTri())
    return outer;
  const inner = insetHull(outer, body.hollow, wasm, keep);
  return inner ? keep(outer.subtract(inner)) : outer;
}, revolveUvs = (profile2, size) => {
  const across = (size[0] + size[1]) / 2;
  const line = profile2.map(([r, z]) => [r * across, z * size[2]]);
  const arcs = arcsOf(line), whole = arcs.at(-1);
  const widest = Math.max(...line.map(([r]) => r));
  return (corners) => {
    const normal = normalOf(corners);
    const middle = scale(add(add(corners[0], corners[1]), corners[2]), 1 / 3);
    const way = Math.atan2(middle[1] / size[1], middle[0] / size[0]);
    if (!normal || Math.abs(normal[1] * Math.cos(way) - normal[0] * Math.sin(way)) > FACING)
      return null;
    const radii = corners.map(([x, y]) => Math.hypot(x / size[0], y / size[1]));
    let angles = corners.map(([x, y], k) => radii[k] > 0.000001 ? Math.atan2(y / size[1], x / size[0]) + Math.PI : null);
    const known = angles.filter((a) => a !== null);
    if (!known.length)
      return null;
    const turned2 = unwrap(known, 2 * Math.PI);
    let j = 0;
    angles = angles.map((a) => a === null ? null : turned2[j++]);
    const mean = turned2.reduce((sum, a) => sum + a, 0) / turned2.length;
    const along = unwrap(corners.map(([, , z], k) => nearestAlong(line, arcs, [radii[k] * across, z])), whole);
    return corners.map((_, k) => [(angles[k] ?? mean) * widest, along[k]]);
  };
}, revolveOf = (body, { Manifold }, keep) => {
  const profile2 = ccw(unpackPoints(body.profile, 2).map(([x, z]) => [Math.max(x, 0), z]));
  const angle = body.angle ?? 360, sides = body.sides ?? SIDES3;
  const solid = keep(keep(Manifold.revolve([profile2], angle < 360 ? Math.max(Math.round(sides * angle / 360), 1) : sides, angle)).scale(body.size));
  return { solid, uv: revolveUvs(profile2, body.size) };
}, extrudeOf = (body, { Manifold }, keep) => {
  const outer = ccw(unpackPoints(body.profile, 2));
  const holes = (body.holes ?? []).map((text) => [...ccw(unpackPoints(text, 2))].reverse());
  const twist = body.twist ?? 0, top = body.scale ?? 1;
  const steps = twist ? Math.min(Math.ceil(Math.abs(twist) / 5), 72) : 0;
  return keep(keep(Manifold.extrude([outer, ...holes], 1, steps, twist, Array.isArray(top) ? top : [top, top], true)).scale(body.size));
}, newell = (ring) => ring.reduce((n, p, i) => {
  const q = ring[(i + 1) % ring.length];
  return [n[0] + (p[1] - q[1]) * (p[2] + q[2]), n[1] + (p[2] - q[2]) * (p[0] + q[0]), n[2] + (p[0] - q[0]) * (p[1] + q[1])];
}, [0, 0, 0]), centreOf3 = (ring) => scale(ring.reduce(add, [0, 0, 0]), 1 / ring.length), tipOf = (ring) => ring.every((p) => length(sub(p, ring[0])) < 0.0000001), ringsSolid = (rings, loop, { Manifold, Mesh }, keep) => {
  const count = rings.length, n = rings[0].length;
  const centres = rings.map(centreOf3);
  const wayAt = (r) => sub(centres[loop ? (r + 1) % count : Math.min(r + 1, count - 1)], centres[loop ? (r + count - 1) % count : Math.max(r - 1, 0)]);
  const first = rings.findIndex((ring) => !tipOf(ring));
  if (first < 0)
    return null;
  const ordered = dot2(newell(rings[first]), wayAt(first)) < 0 ? rings.map((ring) => [...ring].reverse()) : rings;
  const positions = [], index = [];
  for (const ring of ordered) {
    if (tipOf(ring)) {
      positions.push(ring[0]);
      index.push(Array(n).fill(positions.length - 1));
    } else
      index.push(ring.map((p) => positions.push(p) - 1));
  }
  const triangles = [];
  for (let r = 0;r < (loop ? count : count - 1); r++) {
    const A = index[r], B = index[(r + 1) % count];
    for (let i = 0;i < n; i++) {
      const j = (i + 1) % n;
      const [a, b, c, d] = [A[i], A[j], B[j], B[i]];
      if (a !== b && c !== d) {
        const out = cross2(sub(positions[b], positions[a]), sub(positions[d], positions[a]));
        if (dot2(out, sub(positions[c], positions[a])) > FOLD * length(out)) {
          triangles.push(a, b, c, a, c, d);
          continue;
        }
      }
      if (a !== b)
        triangles.push(a, b, d);
      if (c !== d)
        triangles.push(b, c, d);
    }
  }
  if (!loop)
    for (const r of [0, count - 1]) {
      const ring = ordered[r];
      if (tipOf(ring))
        continue;
      const normal = normalize(newell(ring));
      const e1 = normalize(cross2(normal, Math.abs(normal[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0])), e2 = cross2(normal, e1);
      const flat = ring.map((p) => [dot2(sub(p, ring[0]), e1), dot2(sub(p, ring[0]), e2)]);
      for (const [a, b, c] of triangulate(flat))
        triangles.push(...r ? [index[r][a], index[r][b], index[r][c]] : [index[r][a], index[r][c], index[r][b]]);
    }
  try {
    const solid = keep(new Manifold(new Mesh({ numProp: 3, vertProperties: Float32Array.from(positions.flat()), triVerts: Uint32Array.from(triangles) })));
    return solid.volume() > 0 ? solid : null;
  } catch {
    return null;
  }
}, insetRings = (rings, t) => {
  const last = rings.length - 1;
  const along = (r) => normalize(sub(centreOf3(rings[Math.min(r + 1, last)]), centreOf3(rings[Math.max(r - 1, 0)])));
  return rings.map((ring, r) => {
    const tip = tipOf(ring);
    const shift = scale(along(r), (r === 0 ? 1 : r === last ? -1 : 0) * t * (tip ? 2 : 1));
    if (tip)
      return ring.map((p) => add(p, shift));
    const normal = normalize(newell(ring)), n = ring.length;
    return ring.map((p, i) => {
      const a = cross2(normal, normalize(sub(p, ring[(i + n - 1) % n]))), b = cross2(normal, normalize(sub(ring[(i + 1) % n], p)));
      const k = 1 + dot2(a, b);
      let mitre = k > TINY2 ? scale(add(a, b), 1 / k) : a;
      if (length(mitre) > MITRE2)
        mitre = scale(mitre, MITRE2 / length(mitre));
      return add(add(p, scale(mitre, t)), shift);
    });
  });
}, loftOf = (body, wasm, keep) => {
  const points = unpackPoints(body.points, 3).map((p) => p.map((v, k) => v * body.size[k]));
  const rings = Array.from({ length: points.length / body.count }, (_, r) => points.slice(r * body.count, (r + 1) * body.count));
  const outer = ringsSolid(rings, false, wasm, keep);
  if (!outer || !body.hollow)
    return outer;
  const inner = ringsSolid(insetRings(rings, body.hollow), false, wasm, keep);
  return inner ? keep(outer.subtract(inner)) : outer;
}, framesOf = (path, loop) => {
  const n = path.length;
  const leg = (i) => normalize(sub(path[(i + 1) % n], path[i]));
  const frames = [];
  let up = null, along = 0;
  for (let i = 0;i < n; i++) {
    const into = i > 0 || loop ? leg((i + n - 1) % n) : null;
    const out = i < n - 1 || loop ? leg(i) : null;
    const way = normalize(into && out ? add(into, out) : into ?? out);
    up ??= Math.abs(way[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
    up = normalize(sub(up, scale(way, dot2(up, way))));
    const towards = into && out && length(sub(out, into)) > 0.000001 ? normalize(sub(out, into)) : null;
    if (i)
      along += length(sub(path[i], path[i - 1]));
    frames.push({ at: path[i], way, up, side: cross2(up, way), along, towards, bend: towards ? Math.min(1 / Math.max(dot2(way, out), TINY2), MITRE2) : 1 });
  }
  return frames;
}, ringAt = ({ at, up, side: side2, along, towards, bend }, profile2, grows, twist, whole) => {
  const f = whole > 0 ? along / whole : 0;
  const grow = 1 + (grows - 1) * f, turn2 = twist * f * Math.PI / 180;
  const c = Math.cos(turn2), s = Math.sin(turn2);
  return profile2.map(([x, y]) => {
    let point = add(scale(side2, (x * c - y * s) * grow), scale(up, (x * s + y * c) * grow));
    if (towards)
      point = add(point, scale(towards, dot2(point, towards) * (bend - 1)));
    return add(at, point);
  });
}, sweepUvs = (frames, profile2, grows, twist, whole, loop) => {
  const arcs = arcsOf(profile2), round2 = arcs.at(-1);
  const legs = Array.from({ length: loop ? frames.length : frames.length - 1 }, (_, k) => {
    const a = frames[k].at, d = sub(frames[(k + 1) % frames.length].at, a);
    return { a, d, l2: dot2(d, d) };
  });
  const nearest = ([px, py, pz]) => {
    let best = Infinity, bound = Infinity, near = null;
    for (let k = 0;k < legs.length; k++) {
      const { a, d, l2 } = legs[k];
      const t = l2 > TINY2 ? clamp(((px - a[0]) * d[0] + (py - a[1]) * d[1] + (pz - a[2]) * d[2]) / l2, 0, 1) : 0;
      const qx = a[0] + d[0] * t, qy = a[1] + d[1] * t, qz = a[2] + d[2] * t;
      const ex = px - qx, ey = py - qy, ez = pz - qz;
      if (ex * ex + ey * ey + ez * ez > bound)
        continue;
      const gap = Math.hypot(ex, ey, ez);
      if (gap < best)
        [best, bound, near] = [gap, gap * gap * NEARER, { k, t, q: [qx, qy, qz] }];
    }
    return near;
  };
  return (corners) => {
    const normal = normalOf(corners);
    const near = corners.map(nearest);
    if (!normal || near.some((n) => !n))
      return null;
    const A = frames[near[0].k], B = frames[(near[0].k + 1) % frames.length];
    if (Math.abs(dot2(normal, normalize(add(A.way, B.way)))) > FACING)
      return null;
    const coords = corners.map((p, i) => {
      const { k, t, q } = near[i];
      const from = frames[k], to = frames[(k + 1) % frames.length];
      const along = from.along + t * ((k + 1 < frames.length ? to.along : whole) - from.along);
      const up = normalize(add(scale(from.up, 1 - t), scale(to.up, t))), side2 = normalize(add(scale(from.side, 1 - t), scale(to.side, t)));
      const f = whole > 0 ? along / whole : 0;
      const grow = Math.max(1 + (grows - 1) * f, 0.001), turn2 = -(twist * f * Math.PI) / 180;
      const x = dot2(sub(p, q), side2) / grow, y = dot2(sub(p, q), up) / grow;
      return [nearestAlong(profile2, arcs, [x * Math.cos(turn2) - y * Math.sin(turn2), x * Math.sin(turn2) + y * Math.cos(turn2)]), along];
    });
    const u = unwrap(coords.map(([u2]) => u2), round2);
    return coords.map(([, v], k) => [u[k], v]);
  };
}, sweepOf = (body, wasm, keep) => {
  const path = unpackPoints(body.path, 3).map((p) => p.map((v, k) => v * body.size[k]));
  const [w, h] = body.across ?? ACROSS2;
  const profile2 = ccw(unpackPoints(body.profile, 2).map(([x, y]) => [x * w, y * h]));
  const loop = body.closed === true;
  const frames = framesOf(path, loop);
  const whole = frames.at(-1).along + (loop ? length(sub(path[0], path.at(-1))) : 0);
  const grows = body.scale ?? 1, twist = body.twist ?? 0;
  const rings = frames.map((frame) => ringAt(frame, profile2, grows, twist, whole));
  return { solid: ringsSolid(rings, loop, wasm, keep), uv: sweepUvs(frames, profile2, grows, twist, whole, loop) };
}, formOf = (shape, body, wasm, keep) => {
  if (SHAPES.includes(shape))
    return { solid: primitive(shape, body.size, body.sides ?? SIDES3, wasm, keep) };
  if (shape === "hull")
    return { solid: hullOf3(body, wasm, keep) };
  if (shape === "revolve")
    return revolveOf(body, wasm, keep);
  if (shape === "extrude")
    return { solid: extrudeOf(body, wasm, keep) };
  if (shape === "loft")
    return { solid: loftOf(body, wasm, keep) };
  return sweepOf(body, wasm, keep);
}, piecesOf = (body, way, slots, wasm, keep, origins) => {
  const { solid, uv } = formOf(body[way], body, wasm, keep);
  if (!solid?.numTri())
    return [];
  const placed = keep((body.turn ? keep(solid.rotate(body.turn)) : solid).translate(body.at));
  const matrix = body.turn ? matrixOf(body.turn) : null;
  const toBody = (p) => matrix ? unturn(matrix, sub(p, body.at)) : sub(p, body.at);
  const same2 = (p) => p;
  let copies = [{ piece: placed, redo: same2, undo: same2, back: same2 }];
  const { repeat, mirror } = body;
  if (repeat)
    copies = Array.from({ length: repeat.count }, (_, k) => {
      if (!k)
        return copies[0];
      const by = repeat.step && scale(repeat.step, k);
      if (repeat.around === undefined)
        return { piece: keep(placed.translate(by)), redo: (p) => add(p, by), undo: (p) => sub(p, by), back: same2 };
      const turnedBack = (p) => turnZ(p, -repeat.around * k);
      const [x, y] = repeat.at ?? [0, 0], axis = [x, y, 0];
      const about = (degrees) => repeat.at ? (p) => add(turnZ(sub(p, axis), degrees), axis) : (p) => turnZ(p, degrees);
      let piece = repeat.at ? keep(placed.translate([-x, -y, 0])) : placed;
      piece = keep(piece.rotate([0, 0, repeat.around * k]));
      if (repeat.at || by)
        piece = keep(piece.translate(add(axis, by ?? [0, 0, 0])));
      const [turn2, unturn2] = [about(repeat.around * k), about(-repeat.around * k)];
      return { piece, redo: by ? (p) => add(turn2(p), by) : turn2, undo: by ? (p) => unturn2(sub(p, by)) : unturn2, back: turnedBack };
    });
  if (mirror) {
    const axis = AXES.indexOf(mirror);
    const across = (p) => p.map((v, k) => k === axis ? -v : v);
    copies = copies.flatMap((copy) => [copy, { piece: keep(copy.piece.mirror(MIRRORS[mirror])), redo: (p) => across(copy.redo(p)), undo: (p) => copy.undo(across(p)), back: (p) => copy.back(across(p)) }]);
  }
  const colour = Math.min(body.colour ?? 0, slots - 1);
  const pieces = copies.map(({ piece, redo, undo, back }) => {
    const own = keep(piece.asOriginal());
    const toneOf = facesTone(body, way, slots, (out) => matrix ? unturn(matrix, back(out)) : back(out)), spots = placedSpots(body, slots, redo);
    origins.set(own.originalID(), { colour, uv: uv && ((corners) => uv(corners.map((p) => toBody(undo(p))))), ...toneOf && { toneOf }, ...spots && { spots }, ...body.flat && { crease: FLAT2 } });
    return own;
  });
  return way === "keep" && pieces.length > 1 ? [keep(wasm.Manifold.union(pieces))] : pieces;
}, smoothed = (left, level, keep) => {
  let n = level + 1;
  while (n > 1 && left.numTri() * n * n > MOST_TRIANGLES)
    n--;
  return n > 1 ? keep(keep(left.smoothOut(SHARP2)).refine(n)) : left;
}, meshSolid = ({ base, sides, bodies, join, faces, spots }, size, slots, wasm, smoothing = MOST_SMOOTHING) => {
  const made3 = [];
  const keep = (manifold) => (made3.push(manifold), manifold);
  const origins = new Map;
  try {
    if (join === GATHER)
      return surfaceOf(bodies.filter((body) => body.add).flatMap((body) => piecesOf(body, "add", slots, wasm, keep, origins)), size, slots, origins);
    let left = keep(primitive(SHAPES[base], size, sides ?? SIDES3, wasm, keep).asOriginal());
    const own = baseBody({ base, sides, faces, spots }, size);
    const toneOf = facesTone(own, "add", slots, (out) => out), spotted = placedSpots(own, slots);
    origins.set(left.originalID(), { colour: 0, ...toneOf && { toneOf }, ...spotted && { spots: spotted } });
    for (let i = 0;i < bodies.length; ) {
      if (bodies[i].smooth) {
        left = smoothed(left, Math.min(bodies[i].smooth, smoothing), keep);
        i++;
        continue;
      }
      const way = WAYS.find((name) => bodies[i][name]);
      const pieces = [];
      for (;i < bodies.length && !bodies[i].smooth && bodies[i][way]; i++)
        pieces.push(...piecesOf(bodies[i], way, slots, wasm, keep, origins));
      if (pieces.length)
        left = keep(wasm.Manifold[way === "add" ? "union" : way === "cut" ? "difference" : "intersection"]([left, ...pieces]));
    }
    return surfaceOf([left], size, slots, origins);
  } catch {
    return null;
  } finally {
    for (const manifold of made3)
      manifold.delete();
  }
};
var init_solid_mesh = __esm(() => {
  init_mesh();
  init_solid_surface();
  init_solid();
  ACROSS2 = [0.05, 0.05];
  MIRRORS = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] };
  NEARER = 1 + 0.000000001;
});

// src/build/kinds/solid.js
var MANIFOLD, SHAPES, FORMS2, WAYS, MOST_COLOURS3 = 8, MOST_BODIES = 32, MOST_SMOOTHING = 3, MOST_TRIANGLES = 5000, SIDES3 = 32, AXES, JOINS, GATHER = 1, MOST_CHARACTERS = 3072, REACH2 = 64, LEAST2 = 0.001, POINTS, ROUND_VERTICES = 38, engine = null, mesher = null, loading = null, loadSolids = () => loading ??= (async () => {
  const [{ default: Module }, mesh] = await Promise.all([import(MANIFOLD.href), HERE ? Promise.resolve().then(() => (init_solid_mesh(), exports_solid_mesh)) : null]);
  const wasm = await Module(HERE ? {} : { locateFile: (file) => new URL(file, MANIFOLD).href });
  wasm.setup();
  engine = wasm;
  mesher = mesh;
  tellRecipe(null);
  return engine;
})().catch((error) => {
  loading = null;
  console.error("solids unavailable:", error);
  throw error;
}), cap2, setSmoothing = (level) => {
  const next = Math.min(Math.max(Math.round(level), 0), MOST_SMOOTHING);
  if (next === cap2)
    return;
  cap2 = next;
  tellRecipe(null);
}, FULL = 65535, unpackPoints = (text, dims) => gridOf(text, dims).map((point) => point.map((v) => v / FULL - 0.5)), gridOf = (text, dims) => {
  const raw = atob(text);
  const points = [];
  for (let i = 0;i + dims * 2 <= raw.length; i += dims * 2) {
    points.push(Array.from({ length: dims }, (_, k) => raw.charCodeAt(i + 2 * k) | raw.charCodeAt(i + 2 * k + 1) << 8));
  }
  return points;
}, matrixOf = (turn2) => {
  const [ca, sa, cb, sb, cc, sc] = turn2.flatMap((v) => [Math.cos(v * Math.PI / 180), Math.sin(v * Math.PI / 180)]);
  return [
    [cc * cb, cc * sb * sa - sc * ca, cc * sb * ca + sc * sa],
    [sc * cb, sc * sb * sa + cc * ca, sc * sb * ca - cc * sa],
    [-sb, cb * sa, cb * ca]
  ];
}, fnv = (text) => {
  let h = 2166136261;
  for (let i = 0;i < text.length; i++)
    h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return (h >>> 0).toString(36);
}, countOf = (text, dims) => {
  if (typeof text !== "string" || !text.length || text.length % 4 || !/^[A-Za-z0-9+/]*={0,2}$/.test(text))
    return -1;
  const bytes = text.length / 4 * 3 - (text.endsWith("==") ? 2 : text.endsWith("=") ? 1 : 0);
  return bytes % (dims * 2) ? -1 : bytes / (dims * 2);
}, round2 = (v) => Math.round(v * 1e4) / 1e4, within2 = (v, least, most) => Math.min(Math.max(v, least), most), triple = (v) => Array.isArray(v) && v.length === 3 && v.every(Number.isFinite), pair = (v) => Array.isArray(v) && v.length === 2 && v.every(Number.isFinite), whole = (v, [least, most]) => Number.isInteger(v) && v >= least && v <= most ? v : 0, metres = (v) => Number.isFinite(v) && v > 0 ? round2(within2(v, LEAST2, REACH2)) : undefined, pointsOf = (text, dims, [least, most]) => {
  const count = countOf(text, dims);
  return count >= least && count <= most ? text : null;
}, sidesOf = (value, shape) => {
  if (!Number.isInteger(value))
    return;
  const sides = shape === "ball" ? Math.ceil(within2(value, 4, 64) / 4) * 4 : within2(value, 3, 64);
  return sides === SIDES3 ? undefined : sides;
}, scaleOf = (value) => {
  if (Number.isFinite(value))
    return value === 1 ? undefined : round2(within2(value, 0, 4));
  if (Array.isArray(value) && value.length === 2 && value.every(Number.isFinite) && value.some((v) => v !== 1))
    return value.map((v) => round2(within2(v, 0, 4)));
  return;
}, degreesOf = (value, most) => Number.isFinite(value) && value % 360 !== 0 ? round2(within2(value, -most, most)) : undefined, inOrder = (given, kept2) => Object.fromEntries(Object.keys(given).filter((key) => (key in kept2)).map((key) => [key, kept2[key]])), repeatOf = (value) => {
  const count = Number.isInteger(value?.count) && value.count >= POINTS.repeat[0] ? Math.min(value.count, POINTS.repeat[1]) : 0;
  if (!count)
    return;
  const step = triple(value.step) ? value.step.map((v) => round2(within2(v, -REACH2, REACH2))) : undefined;
  const around = degreesOf(value.around, 360);
  if (around === undefined)
    return step && inOrder(value, { count, step });
  const at = pair(value.at) ? value.at.map((v) => round2(within2(v, -REACH2, REACH2)) || 0) : undefined;
  return inOrder(value, { count, ...step?.some((v) => v !== 0) && { step }, around, ...at?.some((v) => v !== 0) && { at } });
}, FACES4, CAP2 = 0.999, faceOf = (shape, [x, y, z]) => {
  if (shape === "extrude")
    return z < -CAP2 ? 0 : z > CAP2 ? 1 : 2;
  const [ax, ay, az] = [Math.abs(x), Math.abs(y), Math.abs(z)];
  return ax >= ay && ax >= az ? x > 0 ? 1 : 0 : ay >= az ? y > 0 ? 3 : 2 : z > 0 ? 5 : 4;
}, facesTone = (body, way, slots, back) => {
  const shape = body[way];
  if (!Array.isArray(body.faces) || !FACES4[shape])
    return null;
  const inward = way === "cut" ? -1 : 1;
  return (out) => Math.min(body.faces[faceOf(shape, back(out).map((v) => v * inward))], slots - 1);
}, MOST_SPOTS = 64, same2 = (p) => p, spotsOf = (spots) => {
  if (!Array.isArray(spots))
    return null;
  const kept2 = new Map;
  for (const entry of spots) {
    if (!Array.isArray(entry) || entry.length !== 4 || !entry.every(Number.isFinite))
      continue;
    const spot = entry.slice(0, 3).map((v) => Math.round(within2(v, -0.5, 0.5) * 1e4) / 1e4 || 0);
    kept2.delete(spot.join());
    kept2.set(spot.join(), [...spot, within2(Math.round(entry[3]), 0, MOST_COLOURS3 - 1)]);
  }
  return kept2.size ? [...kept2.values()].slice(-MOST_SPOTS) : null;
}, placedSpots = (body, slots, place = same2) => {
  if (!body.spots?.length)
    return null;
  const matrix = body.turn ? matrixOf(body.turn) : null;
  return body.spots.map(([x, y, z, colour]) => {
    const own = [x * body.size[0], y * body.size[1], z * body.size[2]];
    const turned2 = matrix ? [0, 1, 2].map((i) => matrix[i][0] * own[0] + matrix[i][1] * own[1] + matrix[i][2] * own[2]) : own;
    return { at: place(turned2.map((v, k) => v + body.at[k])), colour: Math.min(colour, slots - 1) };
  });
}, keepBaseFaces = (value) => Array.isArray(value) && value.length === 6 && value.every(Number.isInteger) ? value.map((v) => within2(v, 0, MOST_COLOURS3 - 1)) : [], baseBody = ({ base, sides, faces, spots }, size) => ({
  add: SHAPES[base] ?? "box",
  at: [0, 0, 0],
  size,
  ...sides && { sides },
  ...faces?.length && { faces },
  ...spots?.length && { spots }
}), ownOf = (shape, body) => {
  const own = {};
  const set = (key, value) => {
    if (value !== undefined)
      own[key] = value;
  };
  if (shape === "cylinder" || shape === "cone" || shape === "ball")
    set("sides", sidesOf(body.sides, shape));
  if (shape === "hull") {
    const [least, most] = POINTS.hull;
    if (!(own.points = pointsOf(body.points, 3, [metres(body.round) ? 1 : least, most])))
      return null;
    set("round", metres(body.round));
    set("hollow", metres(body.hollow));
  }
  if (shape === "revolve" || shape === "extrude" || shape === "sweep") {
    if (!(own.profile = pointsOf(body.profile, 2, POINTS.profile)))
      return null;
  }
  if (shape === "revolve") {
    set("sides", sidesOf(body.sides, shape));
    set("angle", Number.isFinite(body.angle) && body.angle < 360 ? round2(within2(body.angle, 1, 360)) : undefined);
  }
  if (shape === "extrude") {
    const holes = Array.isArray(body.holes) ? body.holes.filter((hole) => pointsOf(hole, 2, POINTS.profile)).slice(0, POINTS.holes) : [];
    if (holes.length)
      own.holes = holes;
  }
  if (shape === "extrude" || shape === "sweep") {
    set("twist", degreesOf(body.twist, 360));
    set("scale", scaleOf(shape === "sweep" && Array.isArray(body.scale) ? undefined : body.scale));
  }
  if (shape === "loft") {
    const count = whole(body.count, POINTS.profile), points = countOf(body.points, 3);
    if (!count || points < 0 || points % count || !whole(points / count, POINTS.sections))
      return null;
    Object.assign(own, { points: body.points, count });
    set("hollow", metres(body.hollow));
  }
  if (shape === "sweep") {
    if (!(own.path = pointsOf(body.path, 3, POINTS.path)))
      return null;
    if (Array.isArray(body.across) && body.across.length === 2 && body.across.every(Number.isFinite))
      own.across = body.across.map((v) => round2(within2(v, LEAST2, REACH2)));
    if (body.closed === true)
      own.closed = true;
  }
  return own;
}, keepBody = (body) => {
  if (!body || typeof body !== "object")
    return null;
  if (body.smooth !== undefined)
    return Number.isInteger(body.smooth) && body.smooth >= 1 ? { smooth: Math.min(body.smooth, MOST_SMOOTHING) } : null;
  const way = WAYS.find((name) => SHAPES.includes(body[name]) || FORMS2.includes(body[name]));
  if (!way || !triple(body.at) || !triple(body.size))
    return null;
  const own = ownOf(body[way], body);
  if (!own)
    return null;
  const turn2 = triple(body.turn) ? body.turn.map((v) => round2((v % 360 + 540) % 360 - 180)) : [0, 0, 0];
  const colour = Number.isInteger(body.colour) ? within2(body.colour, 0, MOST_COLOURS3 - 1) : 0;
  const repeat = repeatOf(body.repeat);
  const count = FACES4[body[way]];
  const faces = count && Array.isArray(body.faces) && body.faces.length === count && body.faces.every(Number.isInteger) ? body.faces.map((v) => within2(v, 0, MOST_COLOURS3 - 1)) : null;
  const spots = spotsOf(body.spots);
  return inOrder(body, {
    [way]: body[way],
    at: body.at.map((v) => round2(within2(v, -REACH2, REACH2))),
    size: body.size.map((v) => round2(within2(v, LEAST2, REACH2))),
    ...own,
    ...turn2.some((v) => v !== 0) && { turn: turn2 },
    ...colour && { colour },
    ...faces?.some((v) => v !== colour) && { faces },
    ...spots && { spots },
    ...body.flat === true && { flat: true },
    ...AXES.includes(body.mirror) && { mirror: body.mirror },
    ...repeat && { repeat }
  });
}, trianglesOf = (body) => {
  const shape = body[WAYS.find((name) => body[name])];
  const sides = body.sides ?? SIDES3;
  const points = countOf(body.points, 3), profile2 = countOf(body.profile, 2);
  const own = shape === "box" ? 12 : shape === "wedge" ? 8 : shape === "ball" ? 8 * (sides / 4) ** 2 : shape === "cylinder" || shape === "cone" ? 4 * sides : shape === "hull" ? 2 * points * (body.round ? ROUND_VERTICES : 1) * (body.hollow ? 2 : 1) : shape === "revolve" ? 2 * profile2 * sides : shape === "extrude" ? 2 * (body.twist ? Math.min(Math.ceil(Math.abs(body.twist) / 5), 72) + 2 : 2) * [body.profile, ...body.holes ?? []].reduce((sum, text) => sum + countOf(text, 2), 0) : shape === "loft" ? 2 * points * (body.hollow ? 2 : 1) : 2 * profile2 * (countOf(body.path, 3) + 1);
  return own * (body.repeat?.count ?? 1) * (body.mirror ? 2 : 1);
}, trianglesOfBodies = (bodies) => bodies.reduce((sum, body) => body.smooth ? sum : sum + trianglesOf(body), 12), keepBodies = (value) => {
  if (!Array.isArray(value) || value.length > MOST_BODIES)
    return null;
  const kept2 = value.map(keepBody).filter(Boolean);
  return JSON.stringify(kept2).length > MOST_CHARACTERS || trianglesOfBodies(kept2) > MOST_TRIANGLES ? null : kept2;
}, hullPieces = ({ bodies, join }, size) => {
  const wayOf = (i) => i || join === GATHER ? "add" : "keep";
  const fits = join === GATHER ? convexBody : plainBody;
  if (!bodies.length || !bodies.every((body, i) => fits(body, wayOf(i))))
    return null;
  const key = `solid:hulls:${fnv(JSON.stringify(bodies))}:${size.join()}`;
  return bodies.flatMap((body, i) => {
    const corners = placedOf(body, gridOfBody(body, wayOf(i), COLLIDES)), copies = copiesOf(body);
    return copies.map(({ place }, k) => ({
      type: "hull",
      key: `${key}:${i}${copies.length > 1 ? `:${k}` : ""}`,
      points: Float32Array.from(corners.flatMap((p) => place(p).map((v, j) => v / size[j]))),
      scale: [...size]
    }));
  });
}, CONVEX, ROUND4, LEVEL_SIDES, COLLIDES = 1, ROUND_CREASE, FLAT2, creaseOf = (body) => body.flat ? FLAT2 : ROUND4.has(body.add) ? ROUND_CREASE : undefined, convexBody = (body, way) => body[way] === "hull" ? !body.round && !body.hollow : CONVEX.has(body[way]), plainBody = (body, way) => !body.repeat && !body.mirror && convexBody(body, way), copiesOf = ({ repeat, mirror }) => {
  const copies = (repeat ? Array.from({ length: repeat.count }, (_, k) => {
    if (!k)
      return { place: same2, back: same2, undo: same2 };
    const moved = repeat.step ? (p) => p.map((v, j) => v + repeat.step[j] * k) : same2;
    const unmoved = repeat.step ? (p) => p.map((v, j) => v - repeat.step[j] * k) : same2;
    if (repeat.around === undefined)
      return { place: moved, back: same2, undo: unmoved };
    const turnedBy = (degrees) => {
      const c = Math.cos(degrees * Math.PI / 180), s = Math.sin(degrees * Math.PI / 180);
      return ([x, y, z]) => [c * x - s * y, s * x + c * y, z];
    };
    const [turn2, unturn2] = [turnedBy(repeat.around * k), turnedBy(-repeat.around * k)];
    const about = repeat.at ? (f) => ([x, y, z]) => f([x - repeat.at[0], y - repeat.at[1], z]).map((v, j) => v + (repeat.at[j] ?? 0)) : (f) => f;
    return { place: (p) => moved(about(turn2)(p)), back: unturn2, undo: (p) => about(unturn2)(unmoved(p)) };
  }) : [{ place: same2, back: same2, undo: same2 }]).map((copy) => ({ ...copy, flip: false }));
  if (!mirror)
    return copies;
  const axis = AXES.indexOf(mirror);
  const across = (p) => p.map((v, j) => j === axis ? -v : v);
  return copies.flatMap((copy) => [copy, { place: (p) => across(copy.place(p)), back: (p) => copy.back(across(p)), undo: (p) => copy.undo(across(p)), flip: true }]);
}, capsKept, capsOf = (body) => {
  const key = `${body.profile}|${(body.holes ?? []).join("|")}`;
  if (capsKept.has(key))
    return capsKept.get(key);
  const way = (ring, turned2) => twiceArea(ring) < 0 !== turned2 ? [...ring].reverse() : ring;
  const outer = way(unpackPoints(body.profile, 2), false), holes = (body.holes ?? []).map((text) => way(unpackPoints(text, 2), true));
  const { points, triangles } = triangulateWithHoles(outer, holes);
  const turnOf = ([a, b, c]) => (points[b][0] - points[a][0]) * (points[c][1] - points[a][1]) - (points[b][1] - points[a][1]) * (points[c][0] - points[a][0]);
  const area = triangles.reduce((sum, triangle) => sum + turnOf(triangle), 0);
  const expected = twiceArea(outer) + holes.reduce((sum, hole) => sum + twiceArea(hole), 0);
  const clean = triangles.length > 0 && triangles.every((triangle) => turnOf(triangle) > 0) && Math.abs(area - expected) <= 0.000000001 * Math.abs(expected);
  const caps = clean ? { points, triangles, rings: [outer.length, ...holes.map((hole) => hole.length)] } : null;
  capsKept.set(key, caps);
  return caps;
}, twiceArea = (ring) => ring.reduce((sum, [x, y], i) => sum + x * ring[(i + 1) % ring.length][1] - ring[(i + 1) % ring.length][0] * y, 0), flatExtrude = (body, way) => body[way] === "extrude" && !body.twist && body.scale === undefined && Boolean(capsOf(body)), madeHere = (body, way) => convexBody(body, way) || flatExtrude(body, way), extrudeTriangles = (body) => {
  const { points, triangles, rings } = capsOf(body);
  const n = points.length;
  const corners = [...points.map(([x, y]) => [x, y, -0.5]), ...points.map(([x, y]) => [x, y, 0.5])];
  const faces = [...triangles.map(([a, b, c]) => [a, c, b]), ...triangles.map(([a, b, c]) => [n + a, n + b, n + c])];
  let first = 0;
  for (const count of rings) {
    for (let k = 0;k < count; k++) {
      const [i, j] = [first + k, first + (k + 1) % count];
      faces.push([i, j, n + j], [i, n + j, n + i]);
    }
    first += count;
  }
  return { corners, faces };
}, revolveTriangles = (body) => {
  const ring = unpackPoints(body.profile, 2).map(([x, z]) => [Math.max(x, 0), z]);
  const profile2 = twiceArea(ring) < 0 ? [...ring].reverse() : ring;
  const angle = body.angle ?? 360, whole2 = angle >= 360;
  const steps = whole2 ? body.sides ?? SIDES3 : Math.max(Math.round((body.sides ?? SIDES3) * angle / 360), 1);
  const turns = whole2 ? steps : steps + 1;
  const corners = [];
  const at = profile2.map(([r, z]) => {
    if (r < 0.000000001)
      return Array(turns).fill(corners.push([0, 0, z]) - 1);
    return Array.from({ length: turns }, (_, i) => {
      const phi = angle * i / steps * Math.PI / 180;
      return corners.push([r * Math.cos(phi), r * Math.sin(phi), z]) - 1;
    });
  });
  const faces = [];
  const facing = (face2, way) => {
    const [a, b, c] = face2.map((v) => corners[v]);
    return dot2(cross2(sub(b, a), sub(c, a)), way) < 0 ? [face2[0], face2[2], face2[1]] : face2;
  };
  profile2.forEach(([r0, z0], j) => {
    const k = (j + 1) % profile2.length, [r1, z1] = profile2[k];
    for (let i = 0;i < steps; i++) {
      const next = whole2 ? (i + 1) % steps : i + 1, phi = angle * (i + 0.5) / steps * Math.PI / 180;
      const way = [(z1 - z0) * Math.cos(phi), (z1 - z0) * Math.sin(phi), r0 - r1];
      for (const face2 of [[at[j][i], at[k][i], at[k][next]], [at[j][i], at[k][next], at[j][next]]])
        if (new Set(face2).size === 3)
          faces.push(facing(face2, way));
    }
  });
  if (!whole2) {
    const { triangles } = triangulateWithHoles(profile2);
    const end = angle * Math.PI / 180;
    for (const triangle of triangles) {
      faces.push(facing(triangle.map((j) => at[j][0]), [0, -1, 0]), facing(triangle.map((j) => at[j][steps]), [-Math.sin(end), Math.cos(end), 0]));
    }
  }
  return { corners, faces };
}, placedFromUnit = (body, points) => {
  const matrix = body.turn ? matrixOf(body.turn) : null;
  return points.map((point) => {
    const p = point.map((v, k) => v * body.size[k]);
    const q = matrix ? matrix.map((row) => row[0] * p[0] + row[1] * p[1] + row[2] * p[2]) : p;
    return q.map((v, k) => v + body.at[k]);
  });
}, gridOfBody = (body, way, level) => {
  const shape = body[way];
  if (shape === "hull")
    return gridOf(body.points, 3);
  if (shape === "box")
    return [0, FULL].flatMap((x) => [0, FULL].flatMap((y) => [0, FULL].map((z) => [x, y, z])));
  if (shape === "wedge")
    return [[0, 0, 0], [FULL, 0, 0], [0, FULL, 0], [FULL, FULL, 0], [0, 0, FULL], [FULL, 0, FULL]];
  const on = (v) => Math.round((v + 0.5) * FULL);
  const sides = Math.max(3, Math.round((body.sides ?? SIDES3) * LEVEL_SIDES[level]));
  const ring = Array.from({ length: sides }, (_, i) => [on(0.5 * Math.cos(2 * Math.PI * i / sides)), on(0.5 * Math.sin(2 * Math.PI * i / sides))]);
  return [...ring.map(([x, y]) => [x, y, 0]), ...shape === "cone" ? [[on(0), on(0), FULL]] : ring.map(([x, y]) => [x, y, FULL])];
}, BOX_FACES2, WEDGE_FACES, roundFaces = (cone, n) => [
  ...Array.from({ length: n }, (_, i) => cone ? [i, (i + 1) % n, n] : [i, (i + 1) % n, n + (i + 1) % n, n + i]),
  Array.from({ length: n }, (_, i) => i),
  ...cone ? [] : [Array.from({ length: n }, (_, i) => n + i)]
], bodyTriangles = (body, way, grid) => {
  if (body[way] === "hull")
    return hullOfGrid(grid);
  const faces = body[way] === "box" ? BOX_FACES2 : body[way] === "wedge" ? WEDGE_FACES : roundFaces(body[way] === "cone", body[way] === "cone" ? grid.length - 1 : grid.length / 2);
  const middle = [0, 1, 2].map((k) => grid.reduce((sum, p) => sum + p[k], 0) / grid.length);
  return faces.flatMap((face2) => face2.slice(1, -1).map((_, i) => {
    const [a, b, c] = [face2[0], face2[i + 1], face2[i + 2]].map((v) => grid[v]);
    const n = cross2(sub(b, a), sub(c, a));
    return dot2(n, sub(middle, a)) > 0 ? [face2[0], face2[i + 2], face2[i + 1]] : [face2[0], face2[i + 1], face2[i + 2]];
  }));
}, placedOf = (body, grid) => {
  const matrix = body.turn ? matrixOf(body.turn) : null;
  return grid.map((point) => {
    const p = point.map((v, k) => (v / FULL - 0.5) * body.size[k]);
    const q = matrix ? matrix.map((row) => row[0] * p[0] + row[1] * p[1] + row[2] * p[2]) : p;
    return q.map((v, k) => v + body.at[k]);
  });
}, placedBody = (body, way, level) => {
  if (body[way] === "revolve") {
    const { corners, faces: faces2 } = revolveTriangles(body);
    return { corners: placedFromUnit(body, corners), faces: faces2 };
  }
  if (flatExtrude(body, way)) {
    const { corners, faces: faces2 } = extrudeTriangles(body);
    return { corners: placedFromUnit(body, corners), faces: faces2 };
  }
  const grid = gridOfBody(body, way, level);
  const faces = bodyTriangles(body, way, grid);
  return faces && { corners: placedOf(body, grid), faces };
}, placedCopies = (body, way, level) => {
  const own = placedBody(body, way, level);
  if (!own)
    return [];
  return copiesOf(body).map(({ place, back, undo, flip }) => ({ corners: own.corners.map(place), faces: flip ? own.faces.map(([a, b, c]) => [a, c, b]) : own.faces, place, back, undo }));
}, onPage = ({ bodies, join }) => join === GATHER && bodies.length > 0 && bodies.every((body) => madeHere(body, "add")), hullsSurface = ({ bodies }, size, slots, level) => {
  const origins = new Map;
  let id = 0;
  const lefts = bodies.flatMap((body) => {
    const matrix = body.turn ? matrixOf(body.turn) : null;
    const unturned = (out) => matrix ? [0, 1, 2].map((k) => matrix[0][k] * out[0] + matrix[1][k] * out[1] + matrix[2][k] * out[2]) : out;
    return placedCopies(body, "add", level).map(({ corners, faces, place, back }) => {
      const vertProperties = Float64Array.from(corners.flat());
      const triVerts = Uint32Array.from(faces.flat());
      const toneOf = facesTone(body, "add", slots, (out) => unturned(back(out)));
      const spots = placedSpots(body, slots, place);
      const own = id++;
      origins.set(own, { colour: Math.min(body.colour ?? 0, slots - 1), ...toneOf && { toneOf }, ...spots && { spots }, ...creaseOf(body) && { crease: creaseOf(body) } });
      return { getMesh: () => ({ vertProperties, triVerts, numProp: 3, runIndex: [0, triVerts.length], runOriginalID: [own] }) };
    });
  });
  return surfaceOf(lefts, size, slots, origins);
}, boxOf = (size, slots) => {
  const mesh = createMesh(slots);
  const origin = size.map((v) => -v / 2);
  addBox(mesh, origin, size.map((v) => v / 2), () => 0, (point, normal) => boxUv(point, normal, origin, 1, 1));
  return mesh.pack(size);
}, smoothingsOf = ({ bodies, join }) => {
  const most = join === GATHER ? 0 : Math.min(bodies.reduce((m, body) => Math.max(m, body.smooth ?? 0), 0), cap2);
  return [0, 0, Math.max(most - 1, 0), most];
}, made3, drawn, WORKERS, workers = null, asked, asks = 0, worked = 0, turn2 = 0, cameBack = ({ data: { key, meshes } }) => {
  if (!asked.has(key))
    return;
  const { slots, size } = asked.get(key);
  asked.delete(key);
  const surfaces = made3.get(key) ?? new Map;
  for (const [smoothing, mesh] of meshes)
    surfaces.set(smoothing, mesh ?? boxOf(size, slots));
  made3.set(key, surfaces);
  if (meshes.some(([, mesh]) => mesh))
    worked++;
  tellRecipe(key);
}, workersOf = () => workers ??= Array.from({ length: WORKERS }, () => Object.assign(new Worker(new URL("./solid-worker.js", import.meta.url), { type: "module" }), { onmessage: cameBack })), ask = (key, params, slots, size, wanted) => {
  const before = asked.get(key);
  const smoothings = [...new Set([...before?.smoothings ?? [], ...wanted])];
  if (before && smoothings.length === before.smoothings.length)
    return;
  const at = before?.at ?? turn2++ % WORKERS;
  asked.set(key, { slots, size, smoothings, at });
  if (!before)
    asks++;
  workersOf()[at].postMessage({ key, params, slots, size, smoothings });
}, later = false, deferred, forget = (key) => {
  if (!key.endsWith(":waiting")) {
    made3.delete(key);
    drawn.delete(key);
    return;
  }
  const recipe = key.slice(0, -":waiting".length);
  deferred.delete(recipe);
  const going = asked.get(recipe);
  if (going) {
    asked.delete(recipe);
    workers?.[going.at].postMessage({ cancel: recipe });
  } else if (!drawn.has(recipe))
    made3.delete(recipe);
}, nearestOf = (surfaces, smoothing) => [...surfaces].sort(([a], [b]) => Math.abs(a - smoothing) - Math.abs(b - smoothing))[0]?.[1], meshedOf3 = (params, slots, size, level, key) => {
  const recipe = key.replace(/:waiting$/, "");
  if (onPage(params)) {
    drawn.add(recipe);
    const surfaces2 = made3.get(recipe) ?? new Map;
    made3.set(recipe, surfaces2);
    const at = params.bodies.some((body) => ROUND4.has(body.add)) ? level : 3;
    if (!surfaces2.has(at))
      surfaces2.set(at, hullsSurface(params, size, slots, at) ?? boxOf(size, slots));
    return surfaces2.get(at);
  }
  const smoothings = smoothingsOf(params);
  const smoothing = smoothings[level] ?? smoothings[3];
  const surfaces = made3.get(recipe);
  if (HERE) {
    if (!engine)
      return boxOf(size, slots);
    if (later && !surfaces) {
      deferred.add(recipe);
      return boxOf(size, slots);
    }
    drawn.add(recipe);
    if (!surfaces)
      made3.set(recipe, new Map);
    const kept2 = made3.get(recipe);
    if (!kept2.has(smoothing))
      kept2.set(smoothing, mesher.meshSolid(params, size, slots, engine, smoothing) ?? boxOf(size, slots));
    return kept2.get(smoothing);
  }
  if (recipe === key && surfaces) {
    drawn.add(recipe);
    const missing = [...new Set(smoothings)].filter((s) => !surfaces.has(s));
    if (missing.length)
      ask(recipe, params, slots, size, missing);
    return surfaces.get(smoothing) ?? nearestOf(surfaces, smoothing);
  }
  if (!surfaces)
    ask(recipe, params, slots, size, [...new Set(smoothings)]);
  return boxOf(size, slots);
}, colourOptions3, solid;
var init_solid = __esm(() => {
  init_mesh();
  init_solid_surface();
  init_settings();
  init_ready();
  MANIFOLD = new URL("../../manifold/manifold.js", import.meta.url);
  SHAPES = ["box", "cylinder", "cone", "ball", "wedge"];
  FORMS2 = ["hull", "revolve", "extrude", "loft", "sweep"];
  WAYS = ["add", "cut", "keep"];
  AXES = ["x", "y", "z"];
  JOINS = ["union", "none"];
  POINTS = Object.freeze({ hull: [4, 32], profile: [3, 64], holes: 8, sections: [2, 32], path: [2, 32], repeat: [2, 32] });
  cap2 = smoothQuality.get();
  smoothQuality.on(setSmoothing);
  FACES4 = Object.freeze({ box: 6, extrude: 3 });
  CONVEX = new Set(["box", "cylinder", "cone", "wedge"]);
  ROUND4 = new Set(["cylinder", "cone"]);
  LEVEL_SIDES = [1 / 4, 3 / 8, 5 / 8, 1];
  ROUND_CREASE = Math.cos(70 * Math.PI / 180);
  FLAT2 = Math.cos(Math.PI / 180);
  capsKept = new Map;
  BOX_FACES2 = [[0, 1, 3, 2], [4, 5, 7, 6], [0, 1, 5, 4], [2, 3, 7, 6], [0, 2, 6, 4], [1, 3, 7, 5]];
  WEDGE_FACES = [[0, 1, 3, 2], [0, 1, 5, 4], [2, 3, 5, 4], [0, 2, 4], [1, 3, 5]];
  made3 = new Map;
  drawn = new Set;
  WORKERS = Math.min(2, Math.max(1, (globalThis.navigator?.hardwareConcurrency ?? 2) - 1));
  asked = new Map;
  deferred = new Set;
  colourOptions3 = Array.from({ length: MOST_COLOURS3 }, (_, i) => `${i + 1} colour${i ? "s" : ""}`);
  solid = Object.freeze({
    name: "solid",
    label: "Solid",
    description: "A solid in one part: what fills its box (a box, a cylinder, a cone, a ball or a wedge), then bodies added to it, cut out of it or kept where they meet it, one after another — boxes, cylinders, cones, balls and wedges, hulls round points or balls, profiles revolved or extruded, lofts through sections and profiles swept along paths, each placed, sized and turned in metres about its middle, mirrored or repeated if asked —, with smoothing steps among them: a wall with its door and windows, an arch, a boat's hull with its flare, a rail, a vase, a wheel and its spokes. Each face of what is left takes the colour of the body it came from — or of its own face, a box body's six or an extrude's caps and sides, or of a spot on it: the facet there and the surface smooth round it, a hull's facet, an extrude's side, an arch's intrados —, up to eight.",
    faces: ({ colours }) => Array.from({ length: colours + 1 }, (_, i) => `colour ${i + 1}`),
    facesBy: "colours",
    shape: "cube",
    sized: true,
    size: [1, 1, 1],
    waiting: (params, size, key) => {
      if (onPage(params))
        return false;
      if (HERE) {
        if (!engine)
          loadSolids().catch(() => {});
        return !engine || later && !made3.has(key);
      }
      return !made3.has(key);
    },
    forget,
    collider: (params, seed, size) => hullPieces(params, size),
    params: [
      { name: "base", label: "Base", min: 0, max: SHAPES.length - 1, default: 0, step: 1, options: SHAPES, description: "What fills its box before any body is added or cut: a box, a cylinder, a cone, a ball or a wedge (upright at its front, −y, its slope from its top front edge down to its bottom back one)." },
      { name: "sides", label: "Sides", min: 3, max: 64, default: SIDES3, step: 1, when: ({ base }) => base >= 1 && base <= 3, description: "Sides round its base where it is round: 6 a hexagon, 32 smooth; a ball's a multiple of four." },
      { name: "colours", label: "Colours", min: 0, max: MOST_COLOURS3 - 1, default: 0, step: 1, options: colourOptions3, fixed: true, description: "How many colours its faces take, each a face of the part: 0 one, 7 eight." },
      { name: "join", label: "Join", min: 0, max: JOINS.length - 1, default: 0, step: 1, options: JOINS, fixed: true, description: "How its bodies come together: joined into one surface (union, its base and its ways as they say), or drawn as they are side by side (none: its added bodies alone, nothing cut, kept or smoothed) — a model's faces rebuilt as plates, exact where they meet, in the fewest triangles." },
      { name: "faces", label: "Faces", list: true, optional: true, min: 0, max: MOST_COLOURS3 - 1, step: 1, default: [], fixed: true, keep: keepBaseFaces, description: "Its base box's faces each their own colour (−x +x −y +y −z +z, 0–7), as a box body's: what a union shows of its base, each side picked alone." },
      { name: "spots", label: "Spots", list: true, optional: true, min: 0, max: MOST_SPOTS, step: 1, default: [], fixed: true, keep: (value) => spotsOf(value) ?? [], description: "Its base's faces by a spot on each, as a body's spots: fractions of its box (−0.5 to 0.5) and a colour." },
      { name: "bodies", label: "Bodies", list: true, min: 0, max: MOST_BODIES, step: 1, default: [], fixed: true, keep: keepBodies, description: `Its bodies and smoothing steps, one after another, at most 32: each \`{ "add" | "cut" | "keep": <shape>, "at": [x, y, z], "size": [x, y, z], "turn": [x, y, z], "colour": n, "faces": [n, …], "spots": [[x, y, z, n], …], "flat": true, "mirror": "x" | "y" | "z", "repeat": { "count": n, "step": [x, y, z] } or { "count": n, "around": degrees, "at": [x, y] } or both, a helix }\` — in metres about the middle of its box, its turn ° about x, then y, then z, its colour 0 (its box's) to 7, a box's faces each their own (−x +x −y +y −z +z) or an extrude's (its −z cap, its +z cap, its sides), its spots each a spot on its surface (fractions of its box along its own axes, −0.5 to 0.5) and the colour of the facet nearest it and of the surface smooth round it (64 at most), flat to shade each facet alone and make it a face of its own (a faceted model's look) —, its shape box, cylinder, cone or ball (with "sides"), wedge, hull ("points", "round", "hollow"), revolve ("profile", "sides", "angle"), extrude ("profile", "holes", "twist", "scale"), loft ("points", "count", "hollow") or sweep ("path", "profile", "across", "scale", "twist", "closed"), its points packed (packPoints) as fractions of its box; or \`{ "smooth": 1 | 2 | 3 }\`, what came before it smoothed. At most 5,000 triangles before smoothing.` }
    ],
    mesh: (params, seed, level, size, key = `solid:${JSON.stringify([params.base, params.sides, params.colours, params.join, params.bodies, ...params.faces?.length || params.spots?.length ? [params.faces, params.spots] : []])}:${size.join()}`) => meshedOf3(params, params.colours + 1, size, level, key)
  });
});

// src/build/kinds/bridge-fit.js
var SAMPLE = 1, MOST_CHORD = 60, GRADE2 = 8, SEAT = 1.2, FREEBOARD2 = 0.3, BURIED = 0.3, RAIL3 = 1.05, STEP_UP = 0.3, BURIED_END = 1, round3 = (v, places = 3) => Math.round(v * 10 ** places) / 10 ** places, clamp3 = (v, least, most) => Math.min(Math.max(v, least), most), longestSpan = (plan) => plan.spans.length ? Math.max(...plan.spans.map((span) => span.s1 - span.s0)) : plan.length, thickOf = (style, each) => {
  const { share = 0, least, most, cap: cap3 = 1 } = style.thick;
  return clamp3(each * share, least, Math.max(least, Math.min(most, each * cap3)));
}, towerOf = (plan) => plan.style.tower && plan.supports.length ? clamp3(plan.style.tower.share * longestSpan(plan), plan.style.tower.least, plan.style.tower.most) : 0, aboveOf = (plan) => plan.style.tower ? towerOf(plan) : plan.style.above ?? 0, chordOf = ([a, b]) => {
  const length2 = Math.hypot(b[0] - a[0], b[1] - a[1]);
  return { length: length2, ux: length2 > 0.000000001 ? (b[0] - a[0]) / length2 : 1, uy: length2 > 0.000000001 ? (b[1] - a[1]) / length2 : 0 };
}, sampleCount = (length2) => clamp3(Math.ceil(length2 / SAMPLE - 0.000000001) + 1, 2, MOST_SAMPLES), sitesOf = ({ points }) => {
  const count = sampleCount(chordOf(points).length);
  return Array.from({ length: count }, (_, i) => [points[0][0] + (points[1][0] - points[0][0]) * i / (count - 1), points[0][1] + (points[1][1] - points[0][1]) * i / (count - 1)]);
}, readAt = (list, length2, s) => {
  if (list.length === 1 || length2 <= 0)
    return list[0];
  const t = clamp3(s / length2, 0, 1) * (list.length - 1);
  const k = Math.min(Math.floor(t), list.length - 2);
  return list[k] + (list[k + 1] - list[k]) * (t - k);
}, sagMaxOf = (params, length2) => {
  const sag = (STYLES[STYLE_NAMES[params.style]] ?? STYLES.timber).sag ?? 0;
  if (!sag || length2 <= 0)
    return 0;
  const drop = Math.abs(params.points[1][2] - params.points[0][2]) / length2;
  return length2 * Math.min(sag, Math.max(1 / GRADE2 - drop, 0) / 4);
}, deckAt = (params, length2, s) => {
  const { points, rise } = params;
  const line = length2 > 0 ? points[0][2] + (points[1][2] - points[0][2]) * s / length2 : points[0][2];
  const sagMax = sagMaxOf(params, length2);
  if (sagMax)
    return line - Math.max(sagMax - rise, 0) * 4 * s * (length2 - s) / (length2 * length2);
  return line + Math.min(rise, s / GRADE2, (length2 - s) / GRADE2);
}, groundAt2 = (params, length2, s) => params.ground.length >= 2 ? readAt(params.ground, length2, s) : length2 > 0 ? params.points[0][2] + (params.points[1][2] - params.points[0][2]) * s / length2 : params.points[0][2], crossing = (positions, values, level, outside, inside) => {
  const [a, b] = [values[outside] - level, values[inside] - level];
  return a === b ? positions[inside] : positions[outside] + (positions[inside] - positions[outside]) * -a / (b - a);
}, planOf, riseFor = (params, ground, water) => {
  const style = STYLES[STYLE_NAMES[params.style]] ?? STYLES.timber;
  const { length: length2 } = chordOf(params.points);
  if (length2 < 0.5)
    return { rise: 0, roomA: 0, roomB: 0, short: 0 };
  let rise = 0, roomA = 0, roomB = 0, short = 0;
  const sagMax = sagMaxOf(params, length2);
  const reach = length2 / Math.max(ground.length - 1, 1);
  ground.forEach((low, i) => {
    const surface = water?.[i];
    if (surface === null || surface === undefined || surface <= low + 0.01)
      return;
    const s = length2 * i / (ground.length - 1);
    const line = params.points[0][2] + (params.points[1][2] - params.points[0][2]) * s / length2;
    const target = surface + FREEBOARD2 + style.depth;
    if (sagMax) {
      const hang = 4 * s * (length2 - s) / (length2 * length2);
      if (line < target) {
        short = Math.max(short, target - line);
        rise = sagMax;
      } else if (hang > 0)
        rise = Math.max(rise, Math.min(sagMax - (line - target) / hang, sagMax));
      return;
    }
    const needed = Math.max(target - line, 0);
    rise = Math.max(rise, needed);
    roomA = Math.max(roomA, GRADE2 * needed - (s - reach));
    roomB = Math.max(roomB, GRADE2 * needed - (length2 - s - reach));
  });
  return { rise: round3(Math.max(rise, 0), 2), roomA: round3(Math.max(roomA, 0), 1), roomB: round3(Math.max(roomB, 0), 1), short: round3(short, 1) };
};
var init_bridge_fit = __esm(() => {
  init_mesh();
  init_bridge();
  planOf = remembered((params) => {
    const style = STYLES[STYLE_NAMES[params.style]] ?? STYLES.timber;
    const { length: length2 } = chordOf(params.points);
    const own = { ...params, points: params.points.map((point) => [...point]), ground: [...params.ground] };
    const deck = (s) => deckAt(own, length2, s);
    const ground = (s) => groundAt2(own, length2, s);
    const plan = { style, name: STYLE_NAMES[params.style] ?? "timber", length: length2, deck, ground, gap: null, supports: [], spans: [], ends: [{ bank: true }, { bank: true }], fills: [], reasons: [] };
    const lowest2 = (from, to) => {
      let low = Infinity;
      for (let k = 0;k <= 8; k++)
        low = Math.min(low, ground(from + (to - from) * k / 8));
      return low;
    };
    const finish = () => {
      const [from, to] = plan.gap ? [plan.gap.s0, plan.gap.s1] : [length2, length2];
      plan.fills = [{ s0: 0, s1: from, foot: lowest2(0, from) - style.embed }, { s0: to, s1: length2, foot: lowest2(to, length2) - style.embed }];
      if (!plan.gap)
        plan.fills[0].s1 = length2;
      return plan;
    };
    const count = params.ground.length;
    if (length2 < 0.5)
      return finish();
    if (length2 > MOST_CHORD + 0.000001)
      plan.reasons.push(`too long: ${round3(length2, 1)} m, a bridge is ${MOST_CHORD} m at most`);
    if (style.widest && params.width > style.widest + 0.000001)
      plan.reasons.push(`too wide: ${round3(params.width, 1)} m, ${style.label.toLowerCase()} are ${style.widest} m at most`);
    const drop = Math.abs(params.points[1][2] - params.points[0][2]) / length2;
    if (drop > 1 / GRADE2 + 0.000001)
      plan.reasons.push(`too steep: 1 in ${round3(1 / drop, 1)}, at most 1 in ${GRADE2}`);
    if (count < 2)
      return finish();
    const positions = Array.from({ length: count }, (_, i) => length2 * i / (count - 1));
    const clearance = positions.map((s, i) => deck(s) - params.ground[i]);
    const buried = positions.reduce((worst, s, i) => s > SEAT && s < length2 - SEAT && -clearance[i] > worst.over ? { over: -clearance[i], s } : worst, { over: BURIED, s: 0 });
    if (buried.over > BURIED)
      plan.reasons.push(`a rise in the way: the ground stands ${round3(buried.over, 1)} m over the deck at ${round3(buried.s, 1)} m`);
    [[0, "A"], [count - 1, "B"]].forEach(([i, name]) => {
      if (clearance[i] >= style.least)
        return;
      if (clearance[i] > STEP_UP)
        plan.reasons.push(`a step of ${round3(clearance[i], 1)} m up onto the deck at ${name}: at most ${STEP_UP} m`);
      else if (clearance[i] < -BURIED_END)
        plan.reasons.push(`the deck is buried ${round3(-clearance[i], 1)} m at ${name}`);
    });
    const first = clearance.findIndex((v) => v >= style.least);
    const last = clearance.findLastIndex((v) => v >= style.least);
    if (first < 0) {
      const deepest2 = Math.max(...clearance);
      plan.reasons.push(deepest2 >= 0.5 ? `too shallow for ${style.label.toLowerCase()}: the ground is ${round3(deepest2, 1)} m under the deck at most, they need ${style.least} m` : "nothing to cross");
      return finish();
    }
    const s0 = first === 0 ? 0 : crossing(positions, clearance, style.least, first - 1, first);
    const s1 = last === count - 1 ? length2 : crossing(positions, clearance, style.least, last + 1, last);
    plan.gap = { s0, s1 };
    plan.ends = [{ bank: s0 > 0 }, { bank: s1 < length2 }];
    const spans = Math.max(1, Math.ceil((s1 - s0) / style.maxSpan - 0.000000001));
    const each = (s1 - s0) / spans;
    const thick = thickOf(style, each);
    plan.supports = Array.from({ length: spans + 1 }, (_, k) => {
      const s = k === 0 ? s0 : k === spans ? s1 : s0 + each * k;
      const edge = k === 0 ? -1 : k === spans ? 1 : 0;
      const kind = k === 0 ? s0 > 0 ? "bank" : "joint" : k === spans ? s1 < length2 ? "bank" : "joint" : "pier";
      const half = kind === "pier" ? thick / 2 : kind === "joint" ? thick / 2 : 0;
      const [from, to] = kind === "bank" ? [Math.min(s, s + edge * SEAT), Math.max(s, s + edge * SEAT)] : kind === "joint" ? k === 0 ? [s, s + half] : [s - half, s] : [s - half, s + half];
      return { s, kind, half, foot: lowest2(Math.max(from, 0), Math.min(to, length2)) - style.embed };
    });
    plan.spans = Array.from({ length: spans }, (_, k) => ({ s0: plan.supports[k].s, s1: plan.supports[k + 1].s }));
    const tallest = Math.max(...plan.supports.filter((support) => support.kind !== "bank").map((support) => deck(support.s) - support.foot - style.embed), 0);
    if (tallest > style.maxPier)
      plan.reasons.push(`a pier ${round3(tallest, 1)} m tall: ${style.label.toLowerCase()} stand at most ${style.maxPier} m`);
    return finish();
  });
});

// src/build/kinds/bridge-parts.js
var DECK = 0, STRUCTURE = 1, RAILS = 2, clamp4 = (v, least, most) => Math.min(Math.max(v, least), most), frameOf = ({ points }) => {
  const [a] = points;
  const { ux, uy } = chordOf(points);
  const place = (s, t, z) => [a[0] + ux * s - uy * t, a[1] + uy * s + ux * t, z];
  place.turn = ([s, t, z]) => [ux * s - uy * t, uy * s + ux * t, z];
  place.angle = Math.atan2(uy, ux);
  return place;
}, breaksOf = (rise, length2, hung = false, step = 2.5) => {
  if (hung) {
    const count = Math.max(1, Math.ceil(length2 / step - 0.000000001));
    return Array.from({ length: count + 1 }, (_, k) => Math.round(length2 * k / count * 1e6) / 1e6);
  }
  const ramp = Math.min(rise * GRADE2, length2 / 2);
  return [...new Set([0, ramp, length2 - ramp, length2].map((v) => Math.round(v * 1e6) / 1e6))].sort((a, b) => a - b);
}, deckUv = (p, n) => Math.abs(n[2]) > 0.5 ? [p[1], p[0]] : Math.abs(n[1]) > 0.5 ? [p[0], p[2]] : [p[1], p[2]], addSlab = (mesh, deck, frame, [s0, s1], [t0, t1], [lo, hi], slot) => {
  const [z0, z1] = [deck(s0), deck(s1)];
  const place = ([x, y, z]) => frame(x, y, z + z0 + (z1 - z0) * (x - s0) / (s1 - s0));
  addBox(mesh, [s0, t0, lo], [s1, t1, hi], () => slot, deckUv, place);
}, addBlock = (mesh, frame, [s0, s1], [t0, t1], [z0, z1], slot) => addBox(mesh, [s0, t0, z0], [s1, t1, z1], () => slot, deckUv, ([x, y, z]) => frame(x, y, z)), noise2 = (a, b = 0) => {
  let h = Math.imul(a | 0, 2654435761) ^ Math.imul(b + 1 | 0, 2246822507);
  h = Math.imul(h ^ h >>> 15, 739982445);
  h = Math.imul(h ^ h >>> 12, 695872825);
  return ((h ^ h >>> 15) >>> 0) / 4294967296;
}, addPost = (mesh, frame, [s, t], [z0, z1], width, slot) => {
  const h = width / 2;
  const corner = (ds, dt, z) => frame(s + ds, t + dt, z);
  const ring = (z) => [corner(-h, -h, z), corner(h, -h, z), corner(h, h, z), corner(-h, h, z)];
  const [low, high] = [ring(z0), ring(z1)];
  const out = [[0, -1, 0], [1, 0, 0], [0, 1, 0], [-1, 0, 0]];
  for (let k = 0;k < 4; k++) {
    const next = (k + 1) % 4;
    mesh.polygon(slot, [low[k], low[next], high[next], high[k]], frame.turn(out[k]), [[k * width, 0], [(k + 1) * width, 0], [(k + 1) * width, z1 - z0], [k * width, z1 - z0]]);
  }
  mesh.polygon(slot, high, [0, 0, 1], high.map((p) => [p[0], p[1]]));
}, addLog = (mesh, slot, a, b, radius, sides) => {
  const length2 = Math.hypot(...sub2(b, a));
  if (length2 < 0.01)
    return;
  const along = unit2(sub2(b, a));
  const side2 = unit2(cross3(along, Math.abs(along[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0]));
  const over = cross3(along, side2);
  const round4 = (p) => Array.from({ length: sides }, (_, k) => {
    const angle = 2 * Math.PI * k / sides;
    const [c, s] = [Math.cos(angle) * radius, Math.sin(angle) * radius];
    return [p[0] + side2[0] * c + over[0] * s, p[1] + side2[1] * c + over[1] * s, p[2] + side2[2] * c + over[2] * s];
  });
  const [from, to] = [round4(a), round4(b)];
  const arc = 2 * Math.PI * radius / sides;
  for (let k = 0;k < sides; k++) {
    const next = (k + 1) % sides;
    const angle = 2 * Math.PI * (k + 0.5) / sides;
    const out = [0, 1, 2].map((i) => side2[i] * Math.cos(angle) + over[i] * Math.sin(angle));
    mesh.polygon(slot, [from[k], from[next], to[next], to[k]], out, [[k * arc, 0], [(k + 1) * arc, 0], [(k + 1) * arc, length2], [k * arc, length2]]);
  }
  const end = (ring, outward) => mesh.polygon(slot, ring, outward, ring.map((p) => [dot3(sub2(p, a), side2), dot3(sub2(p, a), over)]));
  end(to, along);
  end(from, along.map((v) => -v));
}, sortedSet = (values) => [...new Set(values.map((v) => Math.round(v * 1e6) / 1e6))].sort((a, b) => a - b), boxPiece = (frame, at, size) => {
  const piece = solidBox(size.map((v) => -v / 2), size.map((v) => v / 2), [0, 0, Math.sin(frame.angle / 2), Math.cos(frame.angle / 2)]);
  return { ...piece, at };
}, slabPiece = (deck, frame, [s0, s1], [t0, t1], [lo, hi]) => ({
  type: "hull",
  points: [s0, s1].flatMap((s) => [t0, t1].flatMap((t) => [lo, hi].flatMap((z) => frame(s, t, deck(s) + z))))
}), addSlimRailing = (mesh, { params, level, frame, deck, breaks }, { inset = 0.05, reach = 3 } = {}) => {
  if (!params.railing)
    return;
  const step = level >= 2 ? reach : reach * 2;
  const rails = params.railing === 2 ? [[RAIL3 - 0.12, RAIL3 - 0.07]] : [[0.4, 0.45], [RAIL3 - 0.12, RAIL3 - 0.07]];
  for (const side2 of [-1, 1]) {
    const t = side2 * (params.width / 2 - inset);
    for (let k = 0;k + 1 < breaks.length; k++) {
      const [s0, s1] = [breaks[k], breaks[k + 1]];
      for (const [lo, hi] of rails)
        addSlab(mesh, deck, frame, [s0, s1], [t - 0.025, t + 0.025], [lo, hi], RAILS);
      const bays = Math.max(1, Math.ceil((s1 - s0) / step));
      for (let b = 0;b <= bays; b++) {
        if (b === 0 && k > 0)
          continue;
        const s = s0 + (s1 - s0) * b / bays;
        if (level >= 1 || b === 0 || b === bays)
          addPost(mesh, frame, [s, t], [deck(s), deck(s) + RAIL3], 0.06, RAILS);
      }
    }
  }
};
var init_bridge_parts = __esm(() => {
  init_mesh();
  init_bridge_fit();
});

// src/build/kinds/bridge-lamps.js
var POST_TOP = 2.3, LANTERN_SIZE, MOST_LAMPS = 8, END = 0.6, PAIR = 1.6, staggered = (along, plan, edge) => along.map((s, k) => site(s, k % 2 ? -1 : 1, plan, edge)), site = (s, side2, plan, edge) => ({ s, side: side2, t: side2 * edge, z: plan.deck(s) }), thinned = (sites) => sites.length <= MOST_LAMPS ? sites : Array.from({ length: MOST_LAMPS }, (_, k) => sites[Math.round(k * (sites.length - 1) / (MOST_LAMPS - 1))]), lampSitesOf;
var init_bridge_lamps = __esm(() => {
  init_mesh();
  init_bridge_fit();
  init_bridge();
  LANTERN_SIZE = Object.freeze([0.3, 0.3, 0.46]);
  lampSitesOf = remembered((params) => {
    const mode = LAMP_MODES[params.lamps] ?? "none";
    if (mode === "none")
      return [];
    const plan = planOf(params);
    const { length: length2 } = plan;
    if (length2 < 2)
      return [];
    const edge = Math.max(params.width / 2 - plan.style.lamp.inset, 0);
    if (mode === "ends")
      return params.width < PAIR ? [site(END, 1, plan, edge), site(length2 - END, -1, plan, edge)] : [END, length2 - END].flatMap((s) => [site(s, -1, plan, edge), site(s, 1, plan, edge)]);
    if (mode === "piers") {
      const stations = [END];
      for (const pier of plan.supports.filter((support) => support.kind === "pier").map((support) => support.s)) {
        if (pier - stations.at(-1) >= LEAST_SPACING && length2 - END - pier >= LEAST_SPACING)
          stations.push(pier);
      }
      return thinned(staggered([...stations, length2 - END], plan, edge));
    }
    const count = Math.max(1, Math.floor(length2 / Math.max(params.spacing, LEAST_SPACING)));
    return thinned(staggered(Array.from({ length: count }, (_, k) => (k + 0.5) * length2 / count), plan, edge));
  });
});

// src/build/kinds/bridge-timber.js
var SIDES4, PLANKS = 0.12, CAP3 = 0.17, POST2 = 0.09, REACH3 = 5, ROPE = 0.025, HANDS = 0.95, SAG = 0.13, lanesOf = (width, radius) => {
  const count = width <= 3.2 ? 2 : width <= 4.8 ? 3 : width <= 7 ? 4 : Math.ceil(width / 1.8);
  const inset = radius + 0.1;
  return Array.from({ length: count }, (_, k) => -width / 2 + inset + k * (width - 2 * inset) / (count - 1));
}, stringerOf = (plan) => clamp4((plan.spans.length ? Math.max(...plan.spans.map((span) => span.s1 - span.s0)) : plan.length) / 32, 0.14, 0.25), timberBridge = (mesh, { params, plan, level, frame, deck, breaks }) => {
  const { length: length2, supports } = plan;
  const width = params.width;
  const sides = SIDES4[level];
  const radius = stringerOf(plan);
  const axis = (s) => deck(s) - PLANKS - radius;
  for (let k = 0;k + 1 < breaks.length; k++)
    addSlab(mesh, deck, frame, [breaks[k], breaks[k + 1]], [-width / 2, width / 2], [-PLANKS, 0], DECK);
  const cuts = sortedSet([0, length2, ...breaks, ...supports.map((support) => support.s)]);
  for (const t of lanesOf(width, radius)) {
    for (let k = 0;k + 1 < cuts.length; k++)
      addLog(mesh, STRUCTURE, frame(cuts[k], t, axis(cuts[k])), frame(cuts[k + 1], t, axis(cuts[k + 1])), radius, sides);
  }
  const ends = [...plan.ends[0].bank ? [0] : [], ...supports.filter((support) => support.kind === "bank").map((support) => support.s), ...plan.ends[1].bank ? [length2] : []];
  for (const s of sortedSet(ends)) {
    const z = Math.min(plan.ground(s) + 0.12, axis(s) - radius - 0.22);
    addLog(mesh, STRUCTURE, frame(s, -width / 2 - 0.1, z), frame(s, width / 2 + 0.1, z), 0.22, sides);
  }
  const posts = width <= 3.6 ? 2 : width <= 5.4 ? 3 : 4;
  const spread = Math.max(0.3, width / 2 - 0.35);
  for (const support of supports) {
    if (support.kind === "bank")
      continue;
    const s = support.kind === "joint" ? support.s < length2 / 2 ? 0.3 : length2 - 0.3 : support.s;
    const cap3 = axis(s) - radius - CAP3;
    const stands = cap3 - support.foot;
    const thick = clamp4(0.14 + stands / 80, 0.14, 0.3);
    const lanes = Array.from({ length: posts }, (_, k) => -spread + k * 2 * spread / (posts - 1));
    for (const t of lanes)
      addLog(mesh, STRUCTURE, frame(s, t, support.foot), frame(s, t, cap3), thick, sides);
    addLog(mesh, STRUCTURE, frame(s, -width / 2 - 0.1, cap3), frame(s, width / 2 + 0.1, cap3), CAP3, 4);
    if (stands >= 2.5 && level >= 1) {
      const [low, high] = [support.foot + stands * 0.15, cap3 - stands * 0.15];
      addLog(mesh, STRUCTURE, frame(s, -spread, low), frame(s, spread, high), 0.07, 4);
      addLog(mesh, STRUCTURE, frame(s, spread, low), frame(s, -spread, high), 0.07, 4);
    }
  }
  for (const { s, t, z } of lampSitesOf(params))
    addPost(mesh, frame, [s, t], [z, z + POST_TOP], plan.style.lamp.post, RAILS);
  if (!params.railing)
    return;
  const rope = params.railing === 2;
  for (const side2 of [-1, 1]) {
    const t = side2 * (width / 2 - POST2);
    for (let k = 0;k + 1 < breaks.length; k++) {
      const [s0, s1] = [breaks[k], breaks[k + 1]];
      if (!rope)
        for (const [lo, hi] of [[0.4, 0.5], [RAIL3 - 0.12, RAIL3 - 0.04]])
          addSlab(mesh, deck, frame, [s0, s1], [t - 0.03, t + 0.03], [lo, hi], RAILS);
      const bays = Math.max(1, Math.ceil((s1 - s0) / REACH3));
      for (let b = 0;b <= bays; b++) {
        const s = s0 + (s1 - s0) * b / bays;
        if (rope && b < bays && level >= 2) {
          const next = s0 + (s1 - s0) * (b + 1) / bays;
          const hang = (at) => frame(at, t, deck(at) + HANDS);
          if (level >= 3) {
            const middle = (s + next) / 2;
            addLog(mesh, RAILS, hang(s), frame(middle, t, deck(middle) + HANDS - SAG), ROPE, 3);
            addLog(mesh, RAILS, frame(middle, t, deck(middle) + HANDS - SAG), hang(next), ROPE, 3);
          } else
            addLog(mesh, RAILS, hang(s), hang(next), ROPE, 3);
        }
        if (b === 0 && k > 0)
          continue;
        if (level >= 1 || b === 0 || b === bays)
          addPost(mesh, frame, [s, t], [deck(s), deck(s) + RAIL3], POST2, RAILS);
      }
    }
  }
}, timberPieces = ({ params, plan, frame, deck, breaks }, centre) => {
  const { length: length2, supports } = plan;
  const width = params.width;
  const shifted = (p) => p.map((v, k) => v - centre[k]);
  const pieces = [];
  for (let k = 0;k + 1 < breaks.length; k++) {
    const stretch = [breaks[k], breaks[k + 1]];
    const slab = slabPiece(deck, frame, stretch, [-width / 2, width / 2], [-0.4, 0]);
    pieces.push({ ...slab, points: slab.points.map((v, i) => v - centre[i % 3]) });
    if (params.railing)
      for (const side2 of [-1, 1]) {
        const rail = slabPiece(deck, frame, stretch, [side2 * (width / 2 - 0.1) - 0.08, side2 * (width / 2 - 0.1) + 0.08], [0, RAIL3]);
        pieces.push({ ...rail, points: rail.points.map((v, i) => v - centre[i % 3]) });
      }
  }
  for (const { s, t, z } of lampSitesOf(params))
    pieces.push(boxPiece(frame, shifted(frame(s, t, z + POST_TOP / 2)), [plan.style.lamp.post, plan.style.lamp.post, POST_TOP]));
  const radius = stringerOf(plan);
  for (const support of supports) {
    if (support.kind === "bank")
      continue;
    const s = support.kind === "joint" ? support.s < length2 / 2 ? 0.3 : length2 - 0.3 : support.s;
    const top = deck(s) - PLANKS - 2 * radius;
    const height = top - support.foot;
    if (height > 0.5)
      pieces.push(boxPiece(frame, shifted(frame(s, 0, support.foot + height / 2)), [0.5, width + 0.2, height]));
  }
  return pieces;
};
var init_bridge_timber = __esm(() => {
  init_bridge_parts();
  init_bridge_fit();
  init_bridge_lamps();
  SIDES4 = [4, 4, 5, 6];
});

// src/build/kinds/bridge-stone.js
var ARCH, PARAPET = 0.35, HEIGHT = 0.9, LOW = 0.45, SPRING = 0.5, REACH4, curveOf = (left, right, spring, rise, n, pointed = false) => {
  const half = (right - left) / 2;
  const middle = (left + right) / 2;
  if (pointed) {
    const e = (rise * rise - half * half) / (2 * half);
    const radius = half + e;
    const crown = Math.atan2(rise, -e);
    const arc = (centre2, from, to) => Array.from({ length: n / 2 + 1 }, (_, i) => {
      const angle = from + (to - from) * i / (n / 2);
      return [centre2 + radius * Math.cos(angle), spring + radius * Math.sin(angle)];
    });
    return [...arc(middle + e, Math.PI, crown), ...arc(middle - e, Math.PI - crown, 0).slice(1)];
  }
  const circle = (half * half + rise * rise) / (2 * rise);
  const centre = [middle, spring + rise - circle];
  const alpha = Math.asin(Math.min(half / circle, 1));
  return Array.from({ length: n + 1 }, (_, i) => {
    const angle = Math.PI / 2 + alpha - 2 * alpha * i / n;
    return [centre[0] + circle * Math.cos(angle), centre[1] + circle * Math.sin(angle)];
  });
}, solidsOf = (plan, deck, breaks, arch2 = 0) => {
  const { supports, length: length2, fills } = plan;
  const style = STYLES.stone;
  const blocks2 = supports.length ? supports.map((support, k) => {
    const first = k === 0, last = k === supports.length - 1;
    return {
      s0: first ? 0 : support.s - support.half,
      s1: last ? length2 : support.s + support.half,
      foot: support.kind === "bank" ? fills[first ? 0 : 1].foot : support.foot
    };
  }) : [{ s0: 0, s1: length2, foot: fills[0].foot }];
  const openings = blocks2.slice(1).map((right, k) => {
    const left = blocks2[k];
    const [l, r] = [left.s1, right.s0];
    const clear = r - l;
    if (clear < 0.8)
      return null;
    let high = -Infinity;
    for (let i = 0;i <= 8; i++)
      high = Math.max(high, plan.ground(l + clear * i / 8));
    const top = deck((l + r) / 2) - style.depth;
    const spring = Math.max(top - clear * (REACH4[arch2] ?? REACH4[0]), high + SPRING, left.foot + 0.3, right.foot + 0.3);
    const rise = top - spring;
    return rise >= Math.max(0.5, clear / 8) ? { l, r, spring, rise, pointed: arch2 === 1 && rise > clear / 2 + 0.000001 } : null;
  });
  const runs = [];
  blocks2.forEach((block, k) => {
    if (k > 0 && !openings[k - 1]) {
      const run = runs.at(-1);
      run.s1 = block.s1;
      run.foot = Math.min(run.foot, block.foot);
    } else
      runs.push({ ...block });
  });
  for (const run of runs)
    run.foot = Math.min(run.foot, Math.min(deck(run.s0), deck(run.s1), ...breaks.filter((s) => s > run.s0 && s < run.s1).map(deck)) - 0.5);
  return { blocks: blocks2, runs, arches: openings.filter(Boolean) };
}, outlineOf = (plan, deck, breaks, level, arch2 = 0) => {
  const { length: length2 } = plan;
  const { runs, arches } = solidsOf(plan, deck, breaks, arch2);
  const points = [];
  const add2 = (s, z, onDeck = false) => {
    const last = points.at(-1);
    if (!last || Math.abs(last[0] - s) > 0.000001 || Math.abs(last[1] - z) > 0.000001)
      points.push([s, z, onDeck]);
  };
  runs.forEach((run, k) => {
    add2(run.s0, run.foot);
    add2(run.s1, run.foot);
    const opening = arches[k];
    if (!opening)
      return;
    const curve = curveOf(opening.l, opening.r, opening.spring, opening.rise, ARCH[level], opening.pointed);
    add2(opening.l, opening.spring);
    for (const [s, z] of curve.slice(1))
      add2(s, z);
  });
  add2(length2, deck(length2), true);
  for (const s of breaks.slice(0, -1).reverse())
    add2(s, deck(s), true);
  if (points.length > 1 && Math.abs(points[0][0] - points.at(-1)[0]) < 0.000001 && Math.abs(points[0][1] - points.at(-1)[1]) < 0.000001)
    points.pop();
  return points;
}, extrude = (mesh, frame, points, [t0, t1], width) => {
  const place = ([s, z], t) => frame(s, t, z);
  const side2 = (t, outward) => mesh.polygon(STRUCTURE, points.map((point) => place(point, t)), frame.turn([0, outward, 0]), points.map(([s, z]) => [s, z]));
  side2(t1, 1);
  side2(t0, -1);
  let travelled = 0;
  points.forEach((point, k) => {
    const next = points[(k + 1) % points.length];
    const [ds, dz] = [next[0] - point[0], next[1] - point[1]];
    const length2 = Math.hypot(ds, dz);
    if (length2 < 0.000000001)
      return;
    const out = frame.turn([dz / length2, 0, -ds / length2]);
    const onDeck = point[2] && next[2];
    const corners = [place(point, t0), place(next, t0), place(next, t1), place(point, t1)];
    const uvs = onDeck ? [[0, point[0]], [0, next[0]], [width, next[0]], [width, point[0]]] : [[travelled, 0], [travelled + length2, 0], [travelled + length2, width], [travelled, width]];
    mesh.polygon(onDeck ? DECK : STRUCTURE, corners, out, uvs);
    travelled += length2;
  });
}, parapetOf = (params) => params.railing === 2 ? LOW : HEIGHT, stoneBridge = (mesh, { params, plan, level, frame, deck, breaks }) => {
  const width = params.width;
  extrude(mesh, frame, outlineOf(plan, deck, breaks, level, params.arch), [-width / 2, width / 2], width);
  for (const { s, t, z } of lampSitesOf(params))
    addPost(mesh, frame, [s, t], [z, z + POST_TOP], plan.style.lamp.post, RAILS);
  if (!params.railing)
    return;
  const thick = Math.min(PARAPET, width / 4);
  for (const side2 of [-1, 1]) {
    const edge = side2 * width / 2;
    for (let k = 0;k + 1 < breaks.length; k++)
      addSlab(mesh, deck, frame, [breaks[k], breaks[k + 1]], side2 < 0 ? [edge, edge + thick] : [edge - thick, edge], [0, parapetOf(params)], RAILS);
  }
}, stonePieces = ({ params, plan, frame, deck, breaks }, centre) => {
  const width = params.width;
  const shifted = (p) => p.map((v, k) => v - centre[k]);
  const moved = (piece) => ({ ...piece, points: piece.points.map((v, i) => v - centre[i % 3]) });
  const pieces = [];
  for (let k = 0;k + 1 < breaks.length; k++) {
    const stretch = [breaks[k], breaks[k + 1]];
    pieces.push(moved(slabPiece(deck, frame, stretch, [-width / 2, width / 2], [-STYLES.stone.depth, 0])));
    if (params.railing) {
      const thick = Math.min(PARAPET, width / 4);
      for (const side2 of [-1, 1])
        pieces.push(moved(slabPiece(deck, frame, stretch, side2 < 0 ? [-width / 2, -width / 2 + thick] : [width / 2 - thick, width / 2], [0, parapetOf(params)])));
    }
  }
  for (const { s, t, z } of lampSitesOf(params))
    pieces.push(boxPiece(frame, shifted(frame(s, t, z + POST_TOP / 2)), [plan.style.lamp.post, plan.style.lamp.post, POST_TOP]));
  for (const run of solidsOf(plan, deck, breaks, params.arch).runs) {
    const top = Math.min(deck(run.s0), deck(run.s1)) - 0.45;
    if (run.s1 - run.s0 > 0.05 && top - run.foot > 0.2)
      pieces.push(boxPiece(frame, shifted(frame((run.s0 + run.s1) / 2, 0, (top + run.foot) / 2)), [run.s1 - run.s0, width, top - run.foot]));
  }
  return pieces;
};
var init_bridge_stone = __esm(() => {
  init_bridge_parts();
  init_bridge_fit();
  init_bridge_lamps();
  ARCH = [6, 8, 12, 16];
  REACH4 = [0.5, 0.8, 0.25];
});

// src/build/kinds/bridge-girder.js
var SLAB = 0.22, FLANGE = 0.05, CAP4 = 0.55, lanesOf2 = (width) => {
  const count = width < 1.4 ? 1 : width <= 3.6 ? 2 : Math.ceil(width / 2.2);
  return count === 1 ? [0] : Array.from({ length: count }, (_, k) => -width / 2 + 0.3 + k * (width - 0.6) / (count - 1));
}, girderBridge = (mesh, { params, plan, level, frame, deck, breaks }) => {
  const { length: length2, supports } = plan;
  const width = params.width;
  const total = plan.style.depth;
  const cuts = sortedSet([0, length2, ...breaks, ...supports.map((support) => support.s)]);
  for (let k = 0;k + 1 < breaks.length; k++)
    addSlab(mesh, deck, frame, [breaks[k], breaks[k + 1]], [-width / 2, width / 2], [-SLAB, 0], DECK);
  for (const t of lanesOf2(width)) {
    for (let k = 0;k + 1 < cuts.length; k++) {
      const stretch = [cuts[k], cuts[k + 1]];
      if (level >= 3) {
        addSlab(mesh, deck, frame, stretch, [t - 0.15, t + 0.15], [-SLAB - FLANGE, -SLAB], STRUCTURE);
        addSlab(mesh, deck, frame, stretch, [t - 0.025, t + 0.025], [-total + FLANGE, -SLAB - FLANGE], STRUCTURE);
        addSlab(mesh, deck, frame, stretch, [t - 0.15, t + 0.15], [-total, -total + FLANGE], STRUCTURE);
      } else
        addSlab(mesh, deck, frame, stretch, [t - 0.12, t + 0.12], [-total, -SLAB], STRUCTURE);
    }
  }
  const across = Math.min(Math.max(width * 0.5, 0.6), 2.4);
  for (const support of supports) {
    const top = deck(support.s) - total;
    if (support.kind === "bank") {
      const [s0, s1] = support.s < length2 / 2 ? [Math.max(support.s - 1, 0), support.s] : [support.s, Math.min(support.s + 1, length2)];
      if (top - support.foot > 0.05)
        addBlock(mesh, frame, [s0, s1], [-width / 2 - 0.1, width / 2 + 0.1], [support.foot, top], STRUCTURE);
      continue;
    }
    const first = support.s < length2 / 2;
    const along = (half) => support.kind === "joint" ? first ? [support.s, support.s + half] : [support.s - half, support.s] : [support.s - half, support.s + half];
    const capped = top - CAP4 - support.foot > 0.15;
    addBlock(mesh, frame, along(0.8), [-width / 2 + 0.05, width / 2 - 0.05], [capped ? top - CAP4 : Math.max(support.foot, top - CAP4), top], STRUCTURE);
    if (capped)
      addBlock(mesh, frame, along(support.half), [-across / 2, across / 2], [support.foot, top - CAP4], STRUCTURE);
  }
  for (const { s, t, z } of lampSitesOf(params))
    addPost(mesh, frame, [s, t], [z, z + POST_TOP], plan.style.lamp.post, RAILS);
  addSlimRailing(mesh, { params, level, frame, deck, breaks });
}, girderPieces = ({ params, plan, frame, deck, breaks }, centre) => {
  const { length: length2, supports } = plan;
  const width = params.width;
  const total = plan.style.depth;
  const shifted = (p) => p.map((v, k) => v - centre[k]);
  const moved = (piece) => ({ ...piece, points: piece.points.map((v, i) => v - centre[i % 3]) });
  const pieces = [];
  for (let k = 0;k + 1 < breaks.length; k++) {
    const stretch = [breaks[k], breaks[k + 1]];
    pieces.push(moved(slabPiece(deck, frame, stretch, [-width / 2, width / 2], [-0.4, 0])));
    if (params.railing)
      for (const side2 of [-1, 1])
        pieces.push(moved(slabPiece(deck, frame, stretch, [side2 * (width / 2 - 0.05) - 0.06, side2 * (width / 2 - 0.05) + 0.06], [0, RAIL3])));
  }
  const across = Math.min(Math.max(width * 0.5, 0.6), 2.4);
  for (const support of supports) {
    const top = deck(support.s) - total;
    const first = support.s < length2 / 2;
    const box = ([s0, s1], [t0, t1], [z0, z1]) => {
      if (z1 - z0 > 0.1 && s1 - s0 > 0.05)
        pieces.push(boxPiece(frame, shifted(frame((s0 + s1) / 2, (t0 + t1) / 2, (z0 + z1) / 2)), [s1 - s0, t1 - t0, z1 - z0]));
    };
    if (support.kind === "bank") {
      box(first ? [Math.max(support.s - 1, 0), support.s] : [support.s, Math.min(support.s + 1, length2)], [-width / 2 - 0.1, width / 2 + 0.1], [support.foot, top]);
      continue;
    }
    const along = (half) => support.kind === "joint" ? first ? [support.s, support.s + half] : [support.s - half, support.s] : [support.s - half, support.s + half];
    const capped = top - CAP4 - support.foot > 0.15;
    box(along(0.8), [-width / 2 + 0.05, width / 2 - 0.05], [capped ? top - CAP4 : Math.max(support.foot, top - CAP4), top]);
    if (capped)
      box(along(support.half), [-across / 2, across / 2], [support.foot, top - CAP4]);
  }
  for (const { s, t, z } of lampSitesOf(params))
    pieces.push(boxPiece(frame, shifted(frame(s, t, z + POST_TOP / 2)), [plan.style.lamp.post, plan.style.lamp.post, POST_TOP]));
  return pieces;
};
var init_bridge_girder = __esm(() => {
  init_bridge_parts();
  init_bridge_fit();
  init_bridge_lamps();
});

// src/build/kinds/bridge-clapper.js
var BLOCK = 0.55, BANK = 0.9, slabOf = (plan) => clamp4((plan.spans.length ? Math.max(...plan.spans.map((span) => span.s1 - span.s0)) : plan.length) / 9, 0.25, 0.4), pile = (mesh, frame, [s0, s1], [t0, t1], [foot, top], seed, rough) => {
  const height = top - foot;
  if (height < 0.04)
    return;
  const count = rough ? Math.max(1, Math.round(height / BLOCK)) : 1;
  for (let k = 0;k < count; k++) {
    const draw = (side2) => 0.02 + 0.1 * noise2(seed * 31 + k, side2);
    addBlock(mesh, frame, [s0 + draw(0), s1 - draw(1)], [t0 + draw(2), t1 - draw(3)], [foot + height * k / count, foot + height * (k + 1) / count + (k + 1 < count ? 0.01 : 0)], STRUCTURE);
  }
}, footing = (support, length2, width) => {
  const first = support.s < length2 / 2;
  const across = [-width / 2 - 0.1, width / 2 + 0.1];
  if (support.kind === "bank")
    return [first ? [Math.max(support.s - BANK, 0), support.s] : [support.s, Math.min(support.s + BANK, length2)], across];
  if (support.kind === "joint")
    return [first ? [support.s, support.s + support.half] : [support.s - support.half, support.s], across];
  return [[support.s - support.half, support.s + support.half], across];
}, clapperBridge = (mesh, { params, plan, level, frame, deck, breaks }) => {
  const { length: length2, supports } = plan;
  const width = params.width;
  const thick = slabOf(plan);
  const cuts = sortedSet([0, length2, ...breaks, ...supports.map((support) => support.s)]);
  for (let k = 0;k + 1 < cuts.length; k++)
    addSlab(mesh, deck, frame, [cuts[k], cuts[k + 1]], [-width / 2, width / 2], [-thick, 0], DECK);
  supports.forEach((support, index) => {
    const [along, across] = footing(support, length2, width);
    pile(mesh, frame, along, across, [support.foot, deck(support.s) - thick], index + 1, level >= 2);
  });
  for (const { s, t, z } of lampSitesOf(params))
    addPost(mesh, frame, [s, t], [z, z + POST_TOP], plan.style.lamp.post, RAILS);
}, clapperPieces = ({ params, plan, frame, deck, breaks }, centre) => {
  const { length: length2, supports } = plan;
  const width = params.width;
  const thick = slabOf(plan);
  const shifted = (p) => p.map((v, k) => v - centre[k]);
  const pieces = [];
  const cuts = sortedSet([0, length2, ...breaks, ...supports.map((support) => support.s)]);
  for (let k = 0;k + 1 < cuts.length; k++) {
    const slab = slabPiece(deck, frame, [cuts[k], cuts[k + 1]], [-width / 2, width / 2], [-thick, 0]);
    pieces.push({ ...slab, points: slab.points.map((v, i) => v - centre[i % 3]) });
  }
  for (const support of supports) {
    const [[s0, s1], [t0, t1]] = footing(support, length2, width);
    const [foot, top] = [support.foot, deck(support.s) - thick];
    if (top - foot > 0.1)
      pieces.push(boxPiece(frame, shifted(frame((s0 + s1) / 2, (t0 + t1) / 2, (foot + top) / 2)), [s1 - s0, t1 - t0, top - foot]));
  }
  for (const { s, t, z } of lampSitesOf(params))
    pieces.push(boxPiece(frame, shifted(frame(s, t, z + POST_TOP / 2)), [plan.style.lamp.post, plan.style.lamp.post, POST_TOP]));
  return pieces;
};
var init_bridge_clapper = __esm(() => {
  init_bridge_parts();
  init_bridge_lamps();
});

// src/build/kinds/bridge-suspension.js
var SLAB2 = 0.25, BEAM = 0.45, LEG, OUT = 0.15, CABLE = 0.09, HANGER = 0.025, STAY = 0.07, CABLES, HANGERS, stands = (support, length2) => support.kind === "joint" ? support.s < length2 / 2 ? support.s + LEG[0] / 4 : support.s - LEG[0] / 4 : support.s, along = (support, length2) => {
  const half = LEG[0] / 2;
  if (support.kind !== "joint")
    return [support.s - half, support.s + half];
  return support.s < length2 / 2 ? [support.s, support.s + half] : [support.s - half, support.s];
}, suspensionBridge = (mesh, { params, plan, level, frame, deck, breaks }) => {
  const { length: length2, supports } = plan;
  const width = params.width;
  const out = width / 2 + OUT;
  const height = towerOf(plan);
  for (let k = 0;k + 1 < breaks.length; k++) {
    const stretch = [breaks[k], breaks[k + 1]];
    addSlab(mesh, deck, frame, stretch, [-width / 2, width / 2], [-SLAB2, 0], DECK);
    if (level >= 1)
      for (const side2 of [-1, 1])
        addSlab(mesh, deck, frame, stretch, side2 < 0 ? [-width / 2 - 0.3, -width / 2 + 0.1] : [width / 2 - 0.1, width / 2 + 0.3], [-BEAM - SLAB2, -SLAB2], STRUCTURE);
  }
  for (const support of supports) {
    const [s0, s1] = along(support, length2);
    const top = deck(support.s) + height;
    for (const side2 of [-1, 1])
      addBlock(mesh, frame, [s0, s1], [side2 * out - LEG[1] / 2, side2 * out + LEG[1] / 2], [support.foot, top - 0.45], STRUCTURE);
    addBlock(mesh, frame, [s0, s1], [-out - LEG[1] / 2, out + LEG[1] / 2], [top - 0.45, top], STRUCTURE);
    if (height >= 7)
      addBlock(mesh, frame, [s0, s1], [-width / 2, width / 2], [deck(support.s) + 0.62 * height, deck(support.s) + 0.62 * height + 0.35], STRUCTURE);
    if (support.kind !== "bank")
      addBlock(mesh, frame, [s0, s1], [-out, out], [deck(support.s) - SLAB2 - BEAM - 0.5, deck(support.s) - SLAB2 - BEAM], STRUCTURE);
  }
  const point = (s, t, z) => frame(s, t, z);
  plan.spans.forEach((span) => {
    const [a, b] = [stands(supports.find((support) => support.s === span.s0), length2), stands(supports.find((support) => support.s === span.s1), length2)];
    const [za, zb] = [deck(span.s0) + height - CABLE - 0.02, deck(span.s1) + height - CABLE - 0.02];
    const run = b - a;
    const middle = deck((a + b) / 2);
    const dip = Math.min(Math.max(0.1 * run, 0.6), Math.max((za + zb) / 2 - middle - 1.3, 0.3));
    const z = (u) => za + (zb - za) * u - 4 * dip * u * (1 - u);
    for (const side2 of [-1, 1]) {
      const t = side2 * out;
      const count = CABLES[level];
      for (let k = 0;k < count; k++)
        addLog(mesh, STRUCTURE, point(a + run * k / count, t, z(k / count)), point(a + run * (k + 1) / count, t, z((k + 1) / count)), CABLE, 3);
      if (!HANGERS[level])
        continue;
      const hangers = Math.max(1, Math.round(run / HANGERS[level]));
      for (let k = 1;k < hangers; k++) {
        const u = k / hangers;
        const s = a + run * u;
        addLog(mesh, STRUCTURE, point(s, t, z(u)), point(s, t, deck(s) - SLAB2 - 0.05), HANGER, 3);
      }
    }
  });
  for (const support of supports) {
    if (support.kind !== "bank")
      continue;
    const end = support.s < length2 / 2 ? 0 : length2;
    if (Math.abs(support.s - end) < 1)
      continue;
    for (const side2 of [-1, 1])
      addLog(mesh, STRUCTURE, point(support.s, side2 * out, deck(support.s) + height - STAY - 0.02), point(end, side2 * out, deck(end) - 0.3), STAY, 3);
  }
  for (const { s, t, z } of lampSitesOf(params))
    addPost(mesh, frame, [s, t], [z, z + POST_TOP], plan.style.lamp.post, RAILS);
  addSlimRailing(mesh, { params, level, frame, deck, breaks }, { inset: 0.05, reach: 3 });
}, suspensionPieces = ({ params, plan, frame, deck, breaks }, centre) => {
  const { length: length2, supports } = plan;
  const width = params.width;
  const out = width / 2 + OUT;
  const height = towerOf(plan);
  const shifted = (p) => p.map((v, k) => v - centre[k]);
  const moved = (piece) => ({ ...piece, points: piece.points.map((v, i) => v - centre[i % 3]) });
  const pieces = [];
  for (let k = 0;k + 1 < breaks.length; k++) {
    const stretch = [breaks[k], breaks[k + 1]];
    pieces.push(moved(slabPiece(deck, frame, stretch, [-width / 2, width / 2], [-0.4, 0])));
    if (params.railing)
      for (const side2 of [-1, 1])
        pieces.push(moved(slabPiece(deck, frame, stretch, [side2 * (width / 2 - 0.05) - 0.06, side2 * (width / 2 - 0.05) + 0.06], [0, RAIL3])));
  }
  for (const support of supports) {
    const [s0, s1] = along(support, length2);
    const top = deck(support.s) + height;
    for (const side2 of [-1, 1]) {
      if (top - support.foot > 0.1)
        pieces.push(boxPiece(frame, shifted(frame((s0 + s1) / 2, side2 * out, (support.foot + top) / 2)), [s1 - s0, LEG[1], top - support.foot]));
    }
  }
  for (const { s, t, z } of lampSitesOf(params))
    pieces.push(boxPiece(frame, shifted(frame(s, t, z + POST_TOP / 2)), [plan.style.lamp.post, plan.style.lamp.post, POST_TOP]));
  return pieces;
};
var init_bridge_suspension = __esm(() => {
  init_bridge_parts();
  init_bridge_fit();
  init_bridge_lamps();
  LEG = [0.5, 0.35];
  CABLES = [4, 8, 12, 16];
  HANGERS = [0, 10, 5, 3];
});

// src/build/kinds/bridge-rope.js
var PLANKS2 = 0.07, OUT2 = 0.05, HAND = 1.05, MID = 0.55, ROPE2 = 0.035, TIE = 0.02, POST3 = 0.16, POST_OUT = 0.15, STRETCH, TIES, ropeBridge = (mesh, { params, plan, level, frame, deck, breaks }) => {
  const { length: length2 } = plan;
  const width = params.width;
  for (let k = 0;k + 1 < breaks.length; k++)
    addSlab(mesh, deck, frame, [breaks[k], breaks[k + 1]], [-width / 2, width / 2], [-PLANKS2, 0], DECK);
  for (const s of [0, length2]) {
    for (const side2 of [-1, 1])
      addLog(mesh, STRUCTURE, frame(s, side2 * (width / 2 + POST_OUT), plan.ground(s) - plan.style.embed), frame(s, side2 * (width / 2 + POST_OUT), deck(s) + HAND + 0.75), POST3, level >= 2 ? 6 : 4);
  }
  for (const { s, t, z } of lampSitesOf(params))
    addPost(mesh, frame, [s, t], [z, z + POST_TOP], plan.style.lamp.post, RAILS);
  if (!params.railing)
    return;
  const stretches = Math.max(1, Math.ceil(length2 / STRETCH[level]));
  const heights = params.railing === 1 ? [HAND, MID] : [HAND];
  const ties = TIES[level] ? Math.max(1, Math.round(length2 / TIES[level])) : 0;
  for (const side2 of [-1, 1]) {
    const t = side2 * (width / 2 + OUT2);
    for (const height of heights) {
      for (let k = 0;k < stretches; k++) {
        const [a, b] = [length2 * k / stretches, length2 * (k + 1) / stretches];
        addLog(mesh, RAILS, frame(a, t, deck(a) + height), frame(b, t, deck(b) + height), ROPE2, 3);
      }
    }
    for (let k = 1;k < ties; k++) {
      const s = length2 * k / ties;
      addLog(mesh, RAILS, frame(s, t, deck(s) + HAND), frame(s, t, deck(s)), TIE, 3);
    }
  }
}, ropePieces = ({ params, plan, frame, deck, breaks }, centre) => {
  const { length: length2 } = plan;
  const width = params.width;
  const shifted = (p) => p.map((v, k) => v - centre[k]);
  const moved = (piece) => ({ ...piece, points: piece.points.map((v, i) => v - centre[i % 3]) });
  const pieces = [];
  for (let k = 0;k + 1 < breaks.length; k++) {
    const stretch = [breaks[k], breaks[k + 1]];
    pieces.push(moved(slabPiece(deck, frame, stretch, [-width / 2, width / 2], [-0.2, 0])));
    if (params.railing)
      for (const side2 of [-1, 1])
        pieces.push(moved(slabPiece(deck, frame, stretch, [side2 * (width / 2 + OUT2) - 0.05, side2 * (width / 2 + OUT2) + 0.05], [0, RAIL3])));
  }
  for (const s of [0, length2]) {
    const [foot, top] = [plan.ground(s) - plan.style.embed, deck(s) + HAND + 0.75];
    for (const side2 of [-1, 1])
      if (top - foot > 0.1)
        pieces.push(boxPiece(frame, shifted(frame(s, side2 * (width / 2 + POST_OUT), (foot + top) / 2)), [2 * POST3, 2 * POST3, top - foot]));
  }
  for (const { s, t, z } of lampSitesOf(params))
    pieces.push(boxPiece(frame, shifted(frame(s, t, z + POST_TOP / 2)), [plan.style.lamp.post, plan.style.lamp.post, POST_TOP]));
  return pieces;
};
var init_bridge_rope = __esm(() => {
  init_bridge_parts();
  init_bridge_fit();
  init_bridge_lamps();
  STRETCH = [20, 20, 10, 7.5];
  TIES = [0, 0, 10, 7.5];
});

// src/build/kinds/bridge-gen.js
var exports_bridge_gen = {};
__export(exports_bridge_gen, {
  default: () => bridge_gen_default
});
var upToMillimetre3 = (v) => Math.ceil(v * 1000 - 0.000001) / 1000, GENERATORS, generatorOf = (plan) => GENERATORS[plan.name] ?? GENERATORS.timber, STATION, footprintOf3, centreOf4 = (params) => {
  const { min, max } = footprintOf3(params);
  return min.map((v, k) => (v + max[k]) / 2);
}, kitOf = (params, level) => {
  const plan = planOf(params);
  return { params, plan, level, frame: frameOf(params), deck: plan.deck, breaks: breaksOf(params.rise, plan.length, Boolean(plan.style.sag), STATION[level]) };
}, bridge_gen_default;
var init_bridge_gen = __esm(() => {
  init_mesh();
  init_bridge_fit();
  init_bridge_parts();
  init_bridge_timber();
  init_bridge_stone();
  init_bridge_girder();
  init_bridge_clapper();
  init_bridge_suspension();
  init_bridge_rope();
  init_bridge_lamps();
  init_lantern();
  GENERATORS = Object.freeze({
    timber: [timberBridge, timberPieces],
    stone: [stoneBridge, stonePieces],
    clapper: [clapperBridge, clapperPieces],
    rope: [ropeBridge, ropePieces],
    girder: [girderBridge, girderPieces],
    suspension: [suspensionBridge, suspensionPieces]
  });
  STATION = [7.5, 5, 2.5, 2.5];
  footprintOf3 = remembered((params) => {
    const plan = planOf(params);
    const frame = frameOf(params);
    const half = params.width / 2 + 0.35;
    const corners = [[-0.3, -half], [plan.length + 0.3, -half], [plan.length + 0.3, half], [-0.3, half]].map(([s, t]) => frame(s, t, 0));
    const decks = breaksOf(params.rise, plan.length, Boolean(plan.style.sag), STATION[3]).map(plan.deck);
    const heights = [params.points[0][2], params.points[1][2], Math.max(...decks)];
    const top = Math.max(...heights) + Math.max(params.railing && plan.style.railed !== false ? RAIL3 : 0.1, params.lamps ? POST_TOP : 0, aboveOf(plan));
    const feet = [...plan.supports.map((support) => support.foot), ...plan.fills.map((fill) => fill.foot)];
    const bottom = Math.min(...feet, Math.min(...decks) - 1.2);
    return {
      min: [Math.min(...corners.map((p) => p[0])), Math.min(...corners.map((p) => p[1])), bottom],
      max: [Math.max(...corners.map((p) => p[0])), Math.max(...corners.map((p) => p[1])), top]
    };
  });
  bridge_gen_default = Object.freeze({
    footprint: footprintOf3,
    companions: (params) => {
      const sites = lampSitesOf(params);
      if (!sites.length)
        return [];
      const frame = frameOf(params);
      const centre = centreOf4(params);
      const dressing = lanternDressing(params.lights === 1);
      return sites.map(({ s, t, z }) => ({
        kind: "lantern",
        size: [...LANTERN_SIZE],
        yaw: frame.angle,
        at: frame(s, t, z + POST_TOP + LANTERN_SIZE[2] / 2).map((v, k) => v - centre[k]),
        ...dressing
      }));
    },
    settle: (params, heightAt, indices, waterAt) => {
      const sites = sitesOf(params);
      const ground = sites.map(([x, y]) => heightAt(x, y));
      const points = params.points.map((point, k) => [point[0], point[1], ground[k ? ground.length - 1 : 0]]);
      const water = waterAt ? sites.map(([x, y]) => waterAt(x, y)) : null;
      const rise = water ? Math.max(params.rise, riseFor({ ...params, points }, ground, water).rise) : params.rise;
      return { ...params, points, ground, rise };
    },
    fit: (params) => {
      const { min, max } = footprintOf3(params);
      return max.map((v, k) => upToMillimetre3(v - min[k]));
    },
    resize: (params) => params,
    reasons: (params) => planOf(params).reasons,
    mesh: (params, seed, level, size) => {
      const mesh = createMesh(3);
      const kit = kitOf(params, level);
      if (kit.plan.length >= 0.5)
        generatorOf(kit.plan)[0](mesh, kit);
      return mesh.pack(size, centreOf4(params));
    },
    collider: (params) => {
      const kit = kitOf(params, 3);
      if (kit.plan.length < 0.5)
        return null;
      return generatorOf(kit.plan)[1](kit, centreOf4(params));
    }
  });
});

// src/build/kinds/house-rooms.js
var PART = 0.12, ONE = 2.1, ROOMS, round4 = (v) => Math.round(v * 1000) / 1000, halled = ({ measures: m, T, D, floors, well, entry }) => Boolean(entry && m.hall && T >= 7 - 0.000000001 && D >= (floors > 1 ? well[1] : ONE) + 4.4 - 0.000000001), rowDeep = (m, D, front) => Math.min(Math.max(round4(0.4 * D), m.bedroom.across[0]), m.bedroom.deep[1], D - PART - front - m.way), rowHeld = (m, T, row) => T >= m.bedroom.across[0] + m.bath[0] + PART + m.kitchen[0] - 0.000000001 && row >= m.bedroom.deep[0] - 0.000000001, backOf = ({ floors, measures: m, inside, well, entry = null, recess = null }) => {
  if (floors > 1)
    return well[1] + PART / 2;
  const [T, D] = [inside.x1 - inside.x0, inside.y1 - inside.y0];
  const row = rowDeep(m, D, halled({ measures: m, T, D, floors, well, entry }) ? m.hall[0] + PART : recess?.deep ?? 0);
  return rowHeld(m, T, row) ? row + PART / 2 : 0;
}, roomsOf = ({ k, floors, measures: m, inside, dir, well, foot, shaft, entry, recess = null, bedrooms = 0, chances }) => {
  const partitions = [];
  const rooms = [];
  const wallX = dir > 0 ? inside.x0 : inside.x1;
  const [T, D] = [inside.x1 - inside.x0, inside.y1 - inside.y0];
  const xs = (t0, t1) => [wallX + dir * t0, wallX + dir * t1].sort((a, b) => a - b).map(round4);
  const y = (s) => round4(inside.y0 + s);
  const room2 = (type, [t0, t1], [s0, s1]) => {
    const [x0, x1] = xs(t0, t1);
    rooms.push({ storey: k, type, x0, x1, y0: y(s0), y1: y(s1) });
  };
  const across = (s, [t0, t1], ways = []) => {
    const [a0, a1] = xs(t0, t1);
    partitions.push({ storey: k, along: 0, at: y(s), a0, a1, ways: ways.map((way2) => ({ a0: xs(...way2.t)[0], a1: round4(xs(...way2.t)[0] + way2.t[1] - way2.t[0]), into: way2.into, room: way2.room })) });
  };
  const through = (t, [s0, s1], ways = []) => {
    partitions.push({ storey: k, along: 1, at: round4(wallX + dir * t), a0: y(s0), a1: y(s1), ways: ways.map((way2) => ({ a0: y(way2.s[0]), a1: round4(y(way2.s[0]) + way2.s[1] - way2.s[0]), into: dir * way2.into, room: way2.room })) });
  };
  const way = (from) => [from, from + m.inner[0]];
  const role = floors === 1 ? "both" : k === 0 ? "day" : "night";
  const { across: [narrowest, widest], deep: [shallowest, deepest2], suits } = m.bedroom;
  const countOf2 = (most, suited) => bedrooms ? Math.min(bedrooms, most) : suited > 1 && chances[0] < 1 / 3 ? suited - 1 : suited;
  const hall = halled({ measures: m, T, D, floors, well, entry }) ? (() => {
    let [h0, h1] = [entry.from - m.hall[1], entry.from + entry.width + m.hall[1]];
    if (h0 < inside.x0 + 0.7)
      h0 = inside.x0;
    if (h1 > inside.x1 - 0.7)
      h1 = inside.x1;
    return [round4(h0), round4(h1)];
  })() : null;
  if (hall) {
    const [h0, h1] = hall;
    const [walled0, walled1] = [h0 > inside.x0, h1 < inside.x1];
    const s0 = D - m.hall[0];
    const open = !walled0 ? 1 : !walled1 ? 0 : (h0 + h1) / 2 < (inside.x0 + inside.x1) / 2 ? 1 : 0;
    const sides = [[h0 - PART / 2, walled0, -1], [h1 + PART / 2, walled1, 1]];
    for (const [index, [x, walled, out]] of sides.entries()) {
      if (!walled)
        continue;
      partitions.push({ storey: k, along: 1, at: round4(x), a0: y(s0 - PART), a1: y(D), ways: index === open ? [{ a0: y(s0 + 0.15), a1: y(s0 + 0.15 + m.inner[0] + 0.05), into: out, room: "living" }] : [] });
    }
    partitions.push({ storey: k, along: 0, at: y(s0 - PART / 2), a0: h0, a1: h1, ways: [] });
    rooms.push({ storey: k, type: "hall", x0: h0, x1: h1, y0: y(s0), y1: y(D) });
  }
  const front = hall ? { x0: hall[0], x1: hall[1], deep: m.hall[0] + PART } : recess;
  const landing = well[0] + foot;
  const strip = landing + PART + m.bath[0] - 0.02;
  const nearest = Math.max(well[1] + PART + m.passage, shaft ? shaft[1] + 0.05 : 0);
  if (role === "night" && T >= strip - 0.000000001 && D - nearest - PART >= shallowest - 0.000000001) {
    const left = D - nearest - PART;
    const deep = left <= deepest2 + m.way ? left : deepest2;
    const spine = D - deep - PART;
    const tight = Boolean(shaft) && spine < shaft[1] + m.inner[0] + 0.3;
    const least = Math.max(narrowest, tight ? shaft[0] + 0.4 + m.inner[0] + 0.15 : 0);
    const most = Math.min(4, Math.max(1, Math.floor((T + PART) / (least + PART) + 0.000001)));
    const sharedBy = (n) => (T - (n - 1) * PART) / n;
    const loungeBy = (n) => sharedBy(n) > widest && T - n * widest - n * PART >= Math.max(m.lounge, tight ? shaft[0] + 1.2 : 0) ? T - n * widest - n * PART : 0;
    const suited = countOf2(most, Math.min(most, Math.max(1, Math.round(T / suits))));
    const count = !bedrooms && suited < most && sharedBy(suited) > widest && !loungeBy(suited) ? suited + 1 : suited;
    const [shared, lounge] = [sharedBy(count), loungeBy(count)];
    const [from, each] = lounge ? [lounge + PART, widest] : [0, shared];
    const doors = [];
    for (let i = 0;i < count; i++) {
      const b0 = from + i * (each + PART);
      if (i || lounge)
        through(b0 - PART / 2, [spine + PART, D]);
      room2("bedroom", [b0, b0 + each], [spine + PART, D]);
      doors.push({ t: way(Math.max(b0 + 0.35, i === 0 && tight ? shaft[0] + 0.4 : 0)), into: 1, room: "bedroom" });
    }
    if (lounge)
      room2("lounge", [0, lounge], [spine + PART, D]);
    across(spine + PART / 2, [lounge, T], doors);
    room2(spine - well[1] - PART > 2 * m.passage + 0.000000001 ? "lounge" : "passage", [shaft ? shaft[0] : 0, T], [well[1] + PART, spine]);
    through(landing + PART / 2, [0, well[1]]);
    room2("landing", [well[0], landing], [0, well[1]]);
    const backs = [];
    let [t, closed] = [landing + PART, T];
    for (const [type, size] of [["bath", m.bath[0]], ["closet", m.closet], ...count >= 3 ? [["bath", m.bath[0]]] : []]) {
      const to = T - (t + size) - PART >= m.spare ? t + size : T;
      room2(type, [t, to], [0, well[1]]);
      backs.push({ t: way(t + 0.4), into: -1, room: type });
      t = to < T ? to + PART : T;
      closed = t;
      if (to >= T)
        break;
      through(to + PART / 2, [0, well[1]]);
    }
    if (t < T)
      room2("lounge", [t, T], [0, well[1]]);
    across(well[1] + PART / 2, [landing, closed], backs);
  }
  if (role === "day" && T >= strip - 0.000000001 && D >= well[1] + 4.4 - 0.000000001) {
    const c0 = landing + PART;
    const c1 = c0 + m.bath[1];
    through(landing + PART / 2, [0, well[1]], [{ s: way(0.55), into: 1, room: "toilet" }]);
    across(well[1] + PART / 2, [landing, c1 + PART]);
    through(c1 + PART / 2, [0, well[1]]);
    room2("toilet", [c0, c1], [0, well[1]]);
    const k0 = c1 + PART;
    if (T - k0 >= m.kitchen[0]) {
      const k1 = T - k0 - m.kitchen[1] >= m.spare ? k0 + m.kitchen[1] : T;
      room2("kitchen", [k0, k1], [0, well[1] + PART]);
      if (T - k1 >= m.dining[0])
        room2("dining", [k1, Math.min(T, k1 + m.dining[1])], [0, well[1] + PART]);
    } else
      room2("kitchen", [T - m.kitchen[0], T], [well[1] + PART, well[1] + PART + m.kitchen[2]]);
    const corner = xs(T - m.study[0] - PART, T);
    const wall = wallX + dir * (T - m.study[0] - PART / 2);
    const doorway = Boolean(entry) && wall > entry.from - PART && wall < entry.from + entry.width + PART;
    if (T >= m.study[2] && D - m.study[1] - PART >= well[1] + m.passage + 1 && chances[1] < 0.5 && (!front || front.x1 < corner[0] - 1.2 || front.x0 > corner[1] + 1.2) && !doorway) {
      const s0 = D - m.study[1];
      through(T - m.study[0] - PART / 2, [s0 - PART, D], [{ s: way(s0 + 0.3), into: 1, room: "study" }]);
      across(s0 - PART / 2, [T - m.study[0], T]);
      room2("study", [T - m.study[0], T], [s0, D]);
    }
    room2("living", [0, T], [well[1] + PART, D]);
  }
  const rowOf2 = (n) => ["bedroom", "bath", ...Array.from({ length: n - 1 }, () => "bedroom")].toSpliced(n > 3 ? 4 : 2, 0, ...n > 3 ? ["bath"] : []);
  const lengthOf = (n) => rowOf2(n).reduce((sum, type) => sum + (type === "bath" ? m.bath[0] : narrowest), 0) + (rowOf2(n).length - 1) * PART;
  const row = rowDeep(m, D, front?.deep ?? 0);
  if (role === "both" && rowHeld(m, T, row)) {
    const most = [4, 3, 2, 1].find((n) => lengthOf(n) <= T + 0.000000001);
    const count = countOf2(most, Math.min(most, Math.max(1, Math.round((T - m.kitchen[3]) / suits))));
    const types = rowOf2(count);
    const baths = types.length - count;
    const free = T - baths * m.bath[0] - types.length * PART;
    const suited = Math.min(Math.max((free - m.kitchen[3]) / count, narrowest), widest - 1);
    const wide = free - count * suited >= m.kitchen[0] ? suited : (T - baths * m.bath[0] - (types.length - 1) * PART) / count;
    const door2 = entry ? dir > 0 ? entry.from + entry.width / 2 - inside.x0 : inside.x1 - entry.from - entry.width / 2 : 0;
    const far = door2 < T / 2;
    const span = (u0, u1) => far ? [T - u1, T - u0] : [u0, u1];
    const doors = [];
    let u = 0;
    for (const [index, type] of types.entries()) {
      const to = u + (type === "bath" ? m.bath[0] : wide);
      const last = index === types.length - 1;
      const end = last && T - to < m.spare ? T : to;
      const [t0, t1] = span(u, end);
      room2(type, [t0, t1], [0, row]);
      doors.push({ t: way(t0 + 0.4), into: -1, room: type });
      if (end < T)
        through(far ? T - end - PART / 2 : end + PART / 2, [0, row]);
      u = end < T ? end + PART : T;
    }
    across(row + PART / 2, span(0, u), doors.sort((p, q) => p.t[0] - q.t[0]));
    if (T - u >= m.kitchen[0]) {
      const to = T - u - m.kitchen[1] >= m.spare ? u + m.kitchen[1] : T;
      room2("kitchen", span(u, to), [0, row + PART]);
      if (T - to >= m.dining[0])
        room2("dining", span(to, Math.min(T, to + m.dining[1])), [0, row + PART]);
    } else
      room2("kitchen", span(T - m.kitchen[0], T), [row + PART, row + PART + m.kitchen[2]]);
    room2("living", [0, T], [row + PART, D]);
  }
  return { partitions, rooms };
}, hallOf = ({ measures: m, inside, well, foot }) => {
  const [T, D] = [inside.x1 - inside.x0, inside.y1 - inside.y0];
  const hall = round4(Math.max(well[0] + foot + 0.4, 0.24 * T));
  return (T - hall - 2 * PART) / 2 >= m.bedroom.across[0] - 0.000000001 && D >= well[1] + m.bath[0] + Math.max(m.bedroom.deep[0], m.study[0]) + 2 * PART - 0.000000001 ? hall : 0;
}, hallRooms = ({ k, floors, measures: m, inside, dir, well, shaft, hall, bedrooms = 0 }) => {
  const partitions = [];
  const rooms = [];
  const { x1: X, y0: Y0, y1: Y1 } = inside;
  const [H, D, wide, corner] = [hall / 2, Y1 - Y0, m.inner[0], m.bath[0]];
  const role = floors === 1 ? "both" : k === 0 ? "day" : "night";
  const [near, far] = [-dir, dir];
  const room2 = (type, [xa, xb], [ya, yb]) => rooms.push({ storey: k, type, x0: round4(Math.min(xa, xb)), x1: round4(Math.max(xa, xb)), y0: round4(ya), y1: round4(yb) });
  const across = (y, [xa, xb], ways = []) => partitions.push({ storey: k, along: 0, at: round4(y), a0: round4(Math.min(xa, xb)), a1: round4(Math.max(xa, xb)), ways: ways.map((way) => ({ a0: round4(way.x[0]), a1: round4(way.x[0] + way.x[1] - way.x[0]), into: way.into, room: way.room, ...way.double && { double: true } })) });
  const through = (x, [ya, yb], ways = []) => partitions.push({ storey: k, along: 1, at: round4(x), a0: round4(ya), a1: round4(yb), ways: ways.map((way) => ({ a0: round4(way.y[0]), a1: round4(way.y[0] + way.y[1] - way.y[0]), into: way.into, room: way.room, ...way.double && { double: true, leaves: 2, pocket: way.pocket } })).sort((p, q) => p.a0 - q.a0) });
  const taken = Math.max(floors > 1 ? shaft ? shaft[1] + 0.45 : well[1] + 0.3 : 0, corner + PART) + 0.3;
  const line = round4(Y0 + Math.min(Math.max(D / 2, taken + wide + 0.3 + PART / 2), D - Math.max(m.bedroom.deep[0], m.study[0]) - PART / 2));
  const [front, back] = [[line + PART / 2, Y1], [Y0, line - PART / 2]];
  const behind = Y0 + taken + wide <= back[1] - 0.3 + 0.000000001 ? [Y0 + taken, Y0 + taken + wide] : null;
  const twice = front[1] - front[0] >= 2 * wide + 0.8;
  const before = (leaves) => [(front[0] + front[1]) / 2 - leaves * wide / 2, (front[0] + front[1]) / 2 + leaves * wide / 2];
  const asked2 = Math.min(bedrooms || 4, role === "both" ? 2 : 4);
  const order = role === "both" ? [[far, "front"], [far, "back"]] : [[near, "front"], [far, "front"], [far, "back"], [near, "back"]];
  const bedroom = (side2, place) => order.findIndex(([s, p]) => s === side2 && p === place) < asked2 && order.some(([s, p]) => s === side2 && p === place);
  for (const side2 of [near, far]) {
    const [inner, outer] = [side2 * (H + PART), side2 * X];
    const [ahead, rear, small] = role === "day" ? side2 === near ? ["living", "dining", "closet"] : ["study", "kitchen", "toilet"] : role === "night" ? [bedroom(side2, "front") ? "bedroom" : "lounge", bedroom(side2, "back") ? "bedroom" : "lounge", "bath"] : side2 === near ? ["living", "kitchen", "closet"] : ["bedroom", bedroom(side2, "back") ? "bedroom" : "study", "bath"];
    const off = side2 === far || floors === 1 ? "hall" : "room";
    const open = role === "day" || role === "both" && side2 === near;
    const one = !behind && !open;
    room2(ahead, [inner, outer], one ? [Y0, Y1] : front);
    if (!one) {
      room2(rear, [inner, outer], back);
      const middle = (inner + outer) / 2;
      across(line, [inner, outer], open ? [{ x: [middle - wide, middle + wide], into: -1, room: rear, double: true }] : []);
    }
    room2(small, [inner, inner + side2 * corner], [Y0, Y0 + corner]);
    across(Y0 + corner + PART / 2, [inner, inner + side2 * (corner + PART)], off === "room" ? [{ x: [Math.min(inner, inner + side2 * corner) + 0.4, Math.min(inner, inner + side2 * corner) + 0.4 + wide], into: -1, room: small }] : []);
    through(inner + side2 * (corner + PART / 2), [Y0, Y0 + corner + PART]);
    through(side2 * (H + PART / 2), [Y0, Y1], [
      ...off === "hall" ? [{ y: [Y0 + 0.4, Y0 + 0.4 + wide], into: side2, room: small }] : [],
      ...behind && !one ? [{ y: behind, into: side2, room: rear }] : [],
      ((double) => ({ y: before(double ? 2 : 1), into: side2, room: ahead, double, pocket: before(2)[1] + wide + 0.05 <= Y1 && before(2)[0] - wide - 0.05 >= (behind && !one ? behind[1] : Y0) }))(twice && role !== "night" && ahead !== "bedroom")
    ]);
  }
  room2(k === 0 ? "hall" : "landing", [-H, H], [Y0, Y1]);
  return { partitions, rooms };
};
var init_house_rooms = __esm(() => {
  ROOMS = Object.freeze({
    real: Object.freeze({
      inner: Object.freeze([0.9, 2.1]),
      passage: 1.3,
      hall: Object.freeze([2, 0.65]),
      bath: Object.freeze([2.4, 1.7]),
      closet: 2.2,
      bedroom: Object.freeze({ across: Object.freeze([3.5, 6]), deep: Object.freeze([2.8, 5.5]), suits: 5 }),
      study: Object.freeze([3.4, 4, 11.5]),
      kitchen: Object.freeze([2.4, 6.5, 3.2, 4]),
      dining: Object.freeze([3, 5.5]),
      spare: 2.2,
      lounge: 2.5,
      way: 1.28
    }),
    game: Object.freeze({
      inner: Object.freeze([1.4, 2.7]),
      passage: 3,
      hall: null,
      bath: Object.freeze([3.2, 2.5]),
      closet: 3.5,
      bedroom: Object.freeze({ across: Object.freeze([5, 8]), deep: Object.freeze([4.5, 7]), suits: 7.5 }),
      study: Object.freeze([5, 5.5, 17]),
      kitchen: Object.freeze([3.5, 9, 4.5, 6]),
      dining: Object.freeze([4.5, 7.5]),
      spare: 3,
      lounge: 4,
      way: 3
    })
  });
});

// src/build/kinds/house-plan.js
var SLAB3 = 0.25, WALL = 0.25, LAP = 0.05, LIGHT = 1.6, RAIL4 = 1.05, ROOF = 0.22, EAVE = 0.5, VERGE = 0.3, LOG_VERGE = 0.7, SWEEP = 0.28, HANG = 1.5, LIFT2 = 0.5, ARCH2 = 0.42, FACETS = 8, NIB = 0.3, BLADE, SLIDING = 0.08, RAMP2 = 6, OPEN, CORNER = 0.45, SLIT = 0.45, WELL = 0.1, APPROACH = 1.2, FOOT = 1.4, STEP2 = 0.19, TREAD = 0.32, DEEPEST = 2, FACE2, FORMS3, scaleOf2 = ({ slot, tall, least, ...given }) => {
  const clear = given.storey - SLAB3;
  const risers = given.flights[0] + given.flights[1] + 2;
  const hole = Object.freeze([given.landing + given.flight, 2 * given.lane + WELL]);
  const side2 = hole[0] + APPROACH + 2 * WALL + 0.6;
  const patterns = Object.freeze({
    ribbon: Object.freeze({ share: 0.8, z: [1, given.head] }),
    full: Object.freeze({ share: 0.86, z: [0, clear] }),
    slot: Object.freeze({ share: 0.55, z: slot }),
    punched: Object.freeze({ bay: 2.6 * given.bays, width: 1.3 * given.bays, z: [0.9, given.head] }),
    tall: Object.freeze({ bay: 2.2 * given.bays, width: 0.7 * given.bays, z: tall }),
    sash: Object.freeze({ bay: 2.8 * given.bays, width: given.bays, z: [0.5, given.head + 0.4] }),
    blank: null
  });
  return Object.freeze({ ...given, clear, risers, rise: given.storey / risers, hole, least: Object.freeze(least ?? [side2, side2]), patterns, rooms: ROOMS[given.name] });
}, SCALES, SCALE_NAMES, REAL_MOST = 24, round5 = (v) => Math.round(v * 1000) / 1000, clamp5 = (v, least, most) => Math.min(Math.max(v, least), most), randomOf2 = (seed) => () => {
  seed = seed + 1831565813 | 0;
  let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
}, freeOf = ([from, to], blocked) => {
  let left = [[from, to]];
  for (const [b0, b1] of blocked)
    left = left.flatMap(([a0, a1]) => b1 <= a0 || b0 >= a1 ? [[a0, a1]] : [[a0, Math.min(a1, b0)], [Math.max(a0, b1), a1]].filter(([p, q]) => q - p > 0.000000001));
  return left;
}, laid = (pattern, [a0, a1], floor, g, random, bays) => {
  const length2 = a1 - a0;
  if (!pattern || length2 < 1)
    return [];
  const opening = (from, width2) => ({ a0: round5(from), a1: round5(from + width2), z0: round5(floor + pattern.z[0]), z1: round5(floor + pattern.z[1]), bars: pattern.z[1] - pattern.z[0] > 1 ? Math.max(0, Math.round(width2 / (1.5 * bays)) - 1) : 0 });
  if (pattern.share) {
    const width2 = length2 * clamp5(pattern.share * g, 0.25, 1);
    return [opening(a0 + (length2 - width2) / 2, width2)];
  }
  const count = Math.max(1, Math.floor(length2 / pattern.bay));
  const bay = length2 / count;
  const width = Math.min(Math.max(pattern.width * g, 0.45), bay - 0.5);
  const all = Array.from({ length: count }, (_, i) => opening(a0 + bay * i + (bay - width) / 2, width));
  const kept2 = all.filter(() => count < 3 || random() > 0.2);
  return kept2.length ? kept2 : [all[0]];
}, slideOf = (wide) => -Math.floor((wide - LAP) * 20 + 0.000000001) / 20, grown = ({ x0, x1, y0, y1 }, by) => ({ x0: x0 - by, x1: x1 + by, y0: y0 - by, y1: y1 + by }), both = (a, b) => ({ x0: Math.min(a.x0, b.x0), x1: Math.max(a.x1, b.x1), y0: Math.min(a.y0, b.y0), y1: Math.max(a.y1, b.y1) }), SIDES5, SIDE_NAMES, switchBeside = ({ from, width }, rect, recess) => recess || from + width + 0.2 <= rect.x1 - WALL - 0.2 ? 1 : -1, gapsOf = (slab, rect) => ({ front: slab.y1 - rect.y1, back: rect.y0 - slab.y0, right: slab.x1 - rect.x1, left: rect.x0 - slab.x0 }), planOf2 = (params) => {
  const name = STYLE_NAMES2[params.style] ?? STYLE_NAMES2[0];
  const style = STYLES2[name];
  const roofName = ROOFS[params.roof] ?? ROOFS[0];
  const { floors } = params;
  const random = randomOf2(params.variant * 7919 + params.style * 131 + 17);
  const g = 0.6 + 0.8 * params.glazing;
  const M = (params.scale === 1 || params.width > REAL_MOST || params.depth > REAL_MOST) && params.width >= SCALES.game.least[0] && params.depth >= SCALES.game.least[1] ? SCALES.game : SCALES.real;
  const [width, depth] = M === SCALES.real ? [Math.min(params.width, REAL_MOST), Math.min(params.depth, REAL_MOST)] : [params.width, params.depth];
  const well = M.hole;
  const lifted = Boolean(params.lift) && floors > 1;
  const bedroom = Math.max(M.rooms.bedroom.across[0], lifted ? M.shaft + 0.4 + M.rooms.inner[0] + 0.15 : 0);
  const least = [Math.max(M.least[0], params.bedrooms ? params.bedrooms * (bedroom + PART) - PART + 2 * WALL : 0), M.least[1]];
  const dir = random() < 0.5 ? 1 : -1;
  const at = ((chance) => style.grand ? 0.5 : style.wing ? dir > 0 ? chance / 2 : 0.5 + chance / 2 : chance)(random());
  const cuts = [random(), random(), random()];
  const form = Object.fromEntries(FORMS3.map((each, n) => {
    const draw = randomOf2(params.variant * 7919 + params.style * 131 + 17 + (n + 1) * 500009);
    const chances = [draw(), draw(), draw(), draw()];
    return [each, { on: params.forms === 1 && chances[0] < style.forms[each], chances }];
  }));
  const ground = { x0: round5(-width / 2), x1: round5(width / 2), y0: round5(-depth / 2), y1: round5(depth / 2) };
  const narrowed = (rect, by) => dir > 0 ? { ...rect, x1: round5(rect.x1 - by) } : { ...rect, x0: round5(rect.x0 + by) };
  const cutOf = (length2, share, held) => {
    const by = round5(Math.min(length2 * share, length2 - held));
    return by >= M.cut ? by : 0;
  };
  const band = form.accent.on ? (() => {
    const span2 = round5(width * (0.3 + 0.2 * form.accent.chances[2]));
    return form.accent.chances[1] < 0.5 ? { side: "left", x0: ground.x0, x1: round5(ground.x0 + span2) } : { side: "right", x0: round5(ground.x1 - span2), x1: ground.x1 };
  })() : null;
  const canopied = Boolean(M.canopy) && form.canopy.on && !style.over && !(style.shape === "stack" && floors > 1);
  let fin = null;
  const balconies = new Map;
  const bayWays = new Map;
  const verandaWays = new Map;
  const accesses = new Map;
  const rects = [ground];
  const pastOf = (by, least2) => WIDEST - width >= least2 - 0.000000001 ? round5(Math.min(by, WIDEST - width)) : 0;
  const jut = style.shape === "jut" && floors > 1 ? pastOf(clamp5(width * (0.22 + 0.12 * cuts[1]), M.jut[0], M.jut[1]), M.jut[0]) : 0;
  for (let k = 1;k < floors; k++) {
    const under2 = rects[k - 1];
    if (style.shape === "setback") {
      rects.push(k === 1 ? cuts[0] < 0.6 ? narrowed(under2, cutOf(width, 0.25 + 0.15 * cuts[1], least[0])) : under2 : { ...under2, y1: round5(under2.y1 - cutOf(depth, 0.2 + 0.1 * cuts[2], least[1])) });
    } else if (style.shape === "stack") {
      rects.push(k === 1 ? { ...narrowed(under2, cutOf(width, 0.2 + 0.15 * cuts[1], least[0])), y1: round5(under2.y1 + M.out[0] + M.out[1] * cuts[0]) } : { ...under2, y1: round5(ground.y1 - cutOf(depth, 0.2 + 0.1 * cuts[2], least[1])) });
    } else if (style.shape === "jut") {
      rects.push(k === 1 ? narrowed(under2, -jut) : cuts[0] < 0.4 ? narrowed(under2, jut) : under2);
    } else if (style.shape === "shift") {
      const past2 = k % 2 === 1 === cuts[0] < 0.5;
      rects.push(past2 ? { ...narrowed(ground, -pastOf(M.jut[0] * (0.7 + 0.5 * cuts[1]), 0.7 * M.jut[0])), y1: round5(ground.y1 - cutOf(depth, 0.2 + 0.1 * cuts[2], least[1])) } : { ...narrowed(ground, cutOf(width, 0.2 + 0.15 * cuts[1], least[0])), y1: round5(ground.y1 + M.out[0] + M.out[1] * cuts[2]) });
    } else if (style.shape === "crown") {
      rects.push(k === floors - 1 ? { ...narrowed(under2, cutOf(under2.x1 - under2.x0, 0.5 + 0.15 * cuts[1], least[0])), y1: round5(under2.y1 - cutOf(depth, 0.25 + 0.15 * cuts[2], least[1])) } : cuts[0] < 0.5 ? narrowed(under2, cutOf(width, 0.25 + 0.15 * cuts[1], least[0])) : under2);
    } else
      rects.push(under2);
  }
  const top = rects[floors - 1];
  const hipped = roofName === "hip";
  const flat = roofName === "flat" || hipped;
  const bay = (() => {
    if (!style.bay)
      return null;
    const room2 = WALL + CORNER + NIB + M.entry.single + 0.25;
    if (style.stand === "end") {
      const wide2 = round5(Math.min(width * style.bay, width - room2));
      if (wide2 < M.bay[0])
        return null;
      const [x0, x1] = dir > 0 ? [round5(ground.x1 - wide2), ground.x1] : [ground.x0, round5(ground.x0 + wide2)];
      return { x0, x1, y0: ground.y1, y1: round5(ground.y1 + M.bay[2]), door: -dir, high: floors > 1 && cuts[0] < 1 / 3 ? floors - 1 : floors, way: null };
    }
    const wide = round5(Math.min(clamp5(width * style.bay, M.bay[0], M.bay[1]), width - 2 * room2));
    return wide < M.bay[0] ? null : { x0: round5(-wide / 2), x1: round5(wide / 2), y0: ground.y1, y1: round5(ground.y1 + M.bay[2]), door: at < 0.5 ? -1 : 1, high: floors };
  })();
  const roofedBay = Boolean(bay) && style.crown === "slab" && bay.high === floors;
  const besideBay = (side2) => side2 < 0 ? [ground.x0 + WALL + CORNER, bay.x0 - NIB] : [bay.x1 + NIB, ground.x1 - WALL - CORNER];
  const wing = (() => {
    const [across2, deep, wide] = M.garage;
    if (!style.wing || depth < deep + 2 * WALL - 0.000000001)
      return null;
    const [x0, x1] = dir > 0 ? [round5(ground.x0 - across2 - WALL), ground.x0] : [ground.x1, round5(ground.x1 + across2 + WALL)];
    const inner2 = dir > 0 ? [round5(x0 + WALL), x1] : [x0, round5(x1 - WALL)];
    const from = dir > 0 ? round5(inner2[0] + 0.4) : round5(inner2[1] - 0.4 - wide);
    return { x0, x1, y0: ground.y0, y1: round5(ground.y0 + deep + 2 * WALL), inner: inner2, door: { a0: from, a1: round5(from + wide), head: M.entry.head, by: round5(dir * (wide + 0.25)) } };
  })();
  const hall = style.grand && params.rooms ? hallOf({ measures: M.rooms, well, foot: Math.max(FOOT, M.lane), inside: { x0: round5(ground.x0 + WALL), x1: round5(ground.x1 - WALL), y0: round5(ground.y0 + WALL), y1: round5(ground.y1 - WALL) } }) : 0;
  const wallX = hall ? round5(-dir * hall / 2) : dir > 0 ? ground.x0 + WALL : ground.x1 - WALL;
  const backY = ground.y0 + WALL;
  const wellX = [wallX, wallX + dir * well[0]].sort((a, b) => a - b).map(round5);
  const hole = { x0: wellX[0], x1: wellX[1], y0: round5(backY), y1: round5(backY + well[1]) };
  const shaftX = [wallX, wallX + dir * M.shaft].sort((a, b) => a - b).map(round5);
  const shaft = lifted ? {
    x0: shaftX[0],
    x1: shaftX[1],
    y0: round5(hole.y1 + 0.1),
    y1: round5(hole.y1 + 0.1 + M.shaft),
    entry: round5(wallX + dir * M.shaft),
    dir,
    size: M.shaft,
    top: round5((floors - 1) * M.storey + M.clear),
    stops: Array.from({ length: floors - 1 }, (_, k) => round5((k + 1) * M.storey)),
    calls: Array.from({ length: floors }, (_, k) => [round5(wallX), round5(hole.y1 + 0.1 + M.shaft + 0.2), round5(k * M.storey + 1.2)])
  } : null;
  const drive = wing ? Math.max(params.drive ?? 0.15, 0) : 0;
  const slabs = [{ kind: "base", rect: grown(ground, style.over), top: 0, bottom: -Math.max(params.plinth, params.stoop, wing ? drive + 0.05 : 0), holes: [], ...style.logs && { edge: FACE2.apart } }];
  for (let k = 1;k < floors; k++)
    slabs.push({ kind: "floor", rect: grown(both(rects[k], rects[k - 1]), style.over), top: round5(k * M.storey), bottom: round5(k * M.storey - SLAB3), holes: shaft ? [hole, shaft] : [hole] });
  const past = style.veranda ? M.veranda[0] : 0;
  const ends = past ? past + VERGE : style.logs ? LOG_VERGE : VERGE;
  const stoa = style.logs ? round5(M.bay[2] - 0.6) : 0;
  const hearth = style.logs ? { y0: round5((ground.y0 + ground.y1) / 2 - 0.6 * M.bays), y1: round5((ground.y0 + ground.y1) / 2 + 0.6 * M.bays), out: round5(0.6 * M.bays) } : null;
  if (flat)
    slabs.push({ kind: "roof", rect: { ...grown(top, style.eave), ...past && { x0: round5(top.x0 - ends), x1: round5(top.x1 + ends) }, ...roofedBay && { y1: round5(bay.y1 + style.eave) } }, top: round5(floors * M.storey), bottom: round5(floors * M.storey - SLAB3), holes: [] });
  if (wing)
    slabs.push({ kind: "base", rect: { x0: wing.x0, x1: wing.x1, y0: wing.y0, y1: wing.y1 }, top: 0, bottom: slabs[0].bottom, holes: [], face: FACE2.trim }, { kind: "roof", rect: { x0: wing.x0, x1: wing.x1, y0: wing.y0, y1: round5(wing.y1 + EAVE) }, top: round5(M.storey), bottom: round5(M.storey - SLAB3), holes: [] });
  const ramp = wing ? { x0: round5(wing.door.a0 - 0.3), x1: round5(wing.door.a1 + 0.3), y0: wing.y1, y1: round5(wing.y1 + Math.max(RAMP2 * drive, 1)), drop: round5(drive), bottom: slabs[0].bottom } : null;
  const asked2 = style.grand || params.entrance === 1 || params.entrance === 2 && width >= M.grand ? 2 : 1;
  const fronts = bay && asked2 > 1 && besideBay(bay.door)[1] - besideBay(bay.door)[0] < asked2 * M.entry.leaf + 0.2 ? 1 : asked2;
  const entry = (() => {
    const wide = fronts > 1 ? fronts * M.entry.leaf : M.entry.single;
    if (bay)
      return { from: round5((besideBay(bay.door)[0] + besideBay(bay.door)[1]) / 2 - wide / 2), width: wide };
    const [u0, u1] = [ground.x0 + WALL + CORNER, ground.x1 - WALL - CORNER];
    const clear = M.recess ? 1.5 + WALL + M.recess[0] - CORNER : 0.1;
    return { from: round5(clamp5(u0 + (u1 - u0) * (0.2 + 0.6 * at), u0 + wide / 2 + clear, u1 - wide / 2 - clear) - wide / 2), width: wide };
  })();
  const recess = M.recess && !bay && !style.grand && !style.logs ? { x0: round5(entry.from - M.recess[0]), x1: round5(entry.from + entry.width + M.recess[0]), y: round5(ground.y1 - WALL - M.recess[1]), deep: M.recess[1] } : null;
  const colonnade = style.portico === "columns" ? round5(clamp5(0.28 * width, entry.width + 4 * (2 * M.portico[1] + 0.6), Math.min(12, width - 2 * WALL))) : 0;
  const roomChance = randomOf2(params.variant * 7919 + params.style * 131 + 17 + 700001);
  const laidRooms = rects.map((rect, k) => {
    const chances = [roomChance(), roomChance(), roomChance()];
    if (!params.rooms)
      return { partitions: [], rooms: [] };
    if (hall)
      return hallRooms({ k, floors, measures: M.rooms, dir, well, shaft: shaft ? [M.shaft, well[1] + 0.1 + M.shaft] : null, hall, bedrooms: params.bedrooms, inside: { x0: round5(rect.x0 + WALL), x1: round5(rect.x1 - WALL), y0: round5(rect.y0 + WALL), y1: round5(rect.y1 - WALL) } });
    return roomsOf({
      k,
      floors,
      measures: M.rooms,
      dir,
      well,
      foot: Math.max(FOOT, M.lane),
      shaft: shaft ? [M.shaft, well[1] + 0.1 + M.shaft] : null,
      entry: k === 0 ? entry : null,
      bedrooms: params.bedrooms,
      chances,
      recess: k === 0 && recess ? { x0: round5(recess.x0 - WALL), x1: round5(recess.x1 + WALL), deep: recess.deep + WALL } : null,
      inside: { x0: round5(rect.x0 + WALL), x1: round5(rect.x1 - WALL), y0: round5(rect.y0 + WALL), y1: round5(rect.y1 - WALL) }
    });
  });
  const strip = style.wing && !flat ? backOf({
    floors,
    measures: M.rooms,
    well,
    inside: { x0: round5(top.x0 + WALL), x1: round5(top.x1 - WALL), y0: round5(top.y0 + WALL), y1: round5(top.y1 - WALL) },
    entry: floors === 1 ? entry : null,
    recess: floors === 1 && recess ? { deep: recess.deep + WALL } : null
  }) : 0;
  const roofed = strip && top.y1 - top.y0 - 2 * WALL - strip >= strip - 0.000000001 ? { ...top, y0: round5(top.y0 + WALL + strip) } : top;
  if (roofed !== top)
    slabs.push({ kind: "roof", rect: { x0: top.x0, x1: top.x1, y0: top.y0, y1: roofed.y0 }, top: round5(floors * M.storey), bottom: round5(floors * M.storey - SLAB3), holes: [] });
  const roomAt = (k, x, y) => laidRooms[k].rooms.filter((room2) => x > room2.x0 && x < room2.x1 && y > room2.y0 && y < room2.y1).reduce((best, room2) => !best || (room2.x1 - room2.x0) * (room2.y1 - room2.y0) < (best.x1 - best.x0) * (best.y1 - best.y0) ? room2 : best, null)?.type ?? null;
  if (shaft) {
    shaft.calls = shaft.calls.map(([x, y, z], k) => {
      const spine = laidRooms[k].partitions.find((each) => each.along === 0 && each.a0 <= shaft.x0 + 0.000001 && each.a1 >= shaft.x1 - 0.000001 && each.at > shaft.y1 && each.at < shaft.y1 + 0.3);
      return spine ? { at: [round5(shaft.entry + dir * 0.3), round5(spine.at - PART / 2), z], on: "partition" } : { at: [x, y, z], on: "side" };
    });
  }
  const bladed = style.blade && floors > 1 ? (() => {
    const [x0, x1] = dir > 0 ? [round5(ground.x0 - BLADE[0]), ground.x0] : [ground.x1, round5(ground.x1 + BLADE[0])];
    return { x0, x1, y0: round5(ground.y1 - depth / 4), y1: round5(Math.max(...rects.map((rect) => rect.y1 + style.over), flat ? top.y1 + style.eave : -Infinity) + BLADE[1]) };
  })() : null;
  const rails = [];
  const hingeOf = (leaves, leaf, front2, span2, rect) => leaves > 1 ? leaf : front2 ? switchBeside(span2, rect, recess) > 0 ? 0 : 1 : 1;
  const doors = [];
  const terraceDoors = new Map;
  const terraces = new Map;
  const deck = style.over >= M.terrace ? style.over : 0;
  for (let k = 1;k < floors; k++) {
    const slab = grown(both(rects[k], rects[k - 1]), deck);
    const rect = rects[k];
    const z = round5(k * M.storey);
    const gaps = gapsOf(slab, rect);
    terraces.set(k, gaps);
    const inset = 0.06;
    for (const side2 of SIDE_NAMES) {
      const { along: along2, out: out2 } = SIDES5[side2];
      const fixed = SIDES5[side2].at(slab) - out2 * inset;
      const [s0, s1] = along2 === 0 ? [slab.x0, slab.x1] : [slab.y0, slab.y1];
      const [r0, r1] = along2 === 0 ? [rect.x0, rect.x1] : [rect.y0, rect.y1];
      const runs = gaps[side2] >= M.terrace ? [[s0, s1]] : [[s0, r0], [r1, s1]].filter(([p, q]) => q - p >= M.terrace);
      for (const [p, q] of runs)
        rails.push(along2 === 0 ? { from: [round5(p + inset), round5(fixed)], to: [round5(q - inset), round5(fixed)], z } : { from: [round5(fixed), round5(p + inset)], to: [round5(fixed), round5(q - inset)], z });
    }
    const widest = SIDE_NAMES.reduce((best, side2) => gaps[side2] > gaps[best] + 0.000001 ? side2 : best, "front");
    if (gaps[widest] >= 1.5)
      terraceDoors.set(k, widest);
    rails.push({ from: [hole.x0, round5(hole.y1 + 0.03)], to: [hole.x1, round5(hole.y1 + 0.03)], z, inside: true });
    if (k === floors - 1) {
      const end = round5(wallX + dir * (well[0] + 0.03));
      rails.push({ from: [end, round5(hole.y0 + M.lane + WELL)], to: [end, round5(hole.y1 + 0.03)], z, inside: true });
    }
  }
  const apart = (k) => style.apart === "upper" ? k > 0 : style.apart === "odd" ? k % 2 === 1 : false;
  const [beside, far] = dir > 0 ? ["left", "right"] : ["right", "left"];
  let slides = wing ? 1 : 0;
  let glazed = null;
  const storeys = rects.map((rect, k) => {
    const floor = round5(k * M.storey);
    const patterns = k === 0 ? style.ground : style.upper;
    const divided = laidRooms[k].partitions.length > 0;
    const walls = SIDE_NAMES.map((side2, index) => {
      const { along: along2, out: out2, yaw } = SIDES5[side2];
      const chance = randomOf2(params.variant * 7919 + params.style * 131 + 17 + (k * SIDE_NAMES.length + index + 1) * 1009);
      const pattern = side2 === "front" || side2 === "back" ? patterns[side2] : side2 === beside ? patterns.beside : patterns.side;
      const outside = k === 0 || terraces.get(k)[side2] >= M.terrace;
      const [a0, a1] = along2 === 0 ? [rect.x0, rect.x1] : [round5(rect.y0 + WALL), round5(rect.y1 - WALL)];
      const inner2 = along2 === 0 ? [round5(rect.x0 + WALL), round5(rect.x1 - WALL)] : [a0, a1];
      const usable = [inner2[0] + CORNER, inner2[1] - CORNER];
      const blocked = [];
      if (hearth && side2 === far)
        blocked.push([hearth.y0 - 0.4, hearth.y1 + 0.4]);
      if (bladed && side2 === beside)
        blocked.push([bladed.y0 - 0.3, bladed.y1]);
      if (floors > 1 && side2 === "back")
        blocked.push([hole.x0 - 0.3, hole.x1 + 0.3]);
      if (floors > 1 && side2 === beside && !hall)
        blocked.push([rect.y0, shaft ? shaft.y1 + 0.45 : hole.y1 + 0.3]);
      if (hall && floors > 1 && side2 === "back")
        blocked.push([-hall / 2 - PART, hall / 2 + PART]);
      if (k === 0 && side2 === beside && form.carport.on)
        blocked.push([round5(rect.y1 - M.carport[1] - 0.2), rect.y1]);
      const openings = [];
      const doorAt = (share, leaves = 1, front2 = false, centre = null) => {
        const [single, leaf, head] = front2 ? [M.entry.single, M.entry.leaf, M.entry.head] : [M.door, M.leaf, M.head];
        const width2 = leaves > 1 ? leaves * leaf : single;
        const free = freeOf(usable, blocked).filter(([p2, q2]) => q2 - p2 >= width2 + 0.2);
        if (!free.length)
          return leaves > 1 ? doorAt(share, 1, front2, centre) : undefined;
        const [p, q] = centre !== null ? free.find(([p2, q2]) => centre <= q2) ?? free.at(-1) : share === null ? free.reduce((best, each) => each[1] - each[0] > best[1] - best[0] ? each : best) : free.find(([p2, q2]) => usable[0] + (usable[1] - usable[0]) * share <= q2) ?? free.at(-1);
        const middle2 = share === null && centre === null ? (p + q) / 2 : clamp5(centre ?? usable[0] + (usable[1] - usable[0]) * share, p + width2 / 2 + 0.1, q - width2 / 2 - 0.1);
        const from = round5(middle2 - width2 / 2);
        openings.push({ a0: from, a1: round5(from + width2), z0: floor, z1: round5(floor + head), door: true, bars: 0 });
        blocked.push([from - 0.4, from + width2 + 0.4]);
        const fixed = SIDES5[side2].at(rect) - out2 * WALL / 2;
        for (let leaf2 = 0;leaf2 < leaves; leaf2++) {
          const centre2 = from + width2 / leaves * (leaf2 + 0.5);
          doors.push({ storey: k, side: side2, yaw, at: along2 === 0 ? [round5(centre2), round5(fixed), floor] : [round5(fixed), round5(centre2), floor], size: [width2 / leaves, WALL, head], style: k === 0 ? style.door : "glazed", hinge: hingeOf(leaves, leaf2, front2, { from, width: width2 }, rect), leaves, from, width: width2 });
        }
      };
      const slidingDoor = () => {
        const free = freeOf(usable, blocked).filter(([p2, q2]) => q2 - p2 >= 2 * M.leaf + 0.2);
        if (!free.length || slides >= BUDGET.slides)
          return false;
        const [p, q] = free.reduce((best, each) => each[1] - each[0] > best[1] - best[0] ? each : best);
        const from = round5((p + q) / 2 - M.leaf);
        openings.push({ a0: from, a1: round5(from + 2 * M.leaf), z0: floor, z1: round5(floor + (pattern === "full" ? M.clear : M.head)), bars: 1, slide: { a0: round5(from + M.leaf), a1: round5(from + 2 * M.leaf), by: slideOf(M.leaf), walk: true, near: true } });
        blocked.push([from - 0.4, from + 2 * M.leaf + 0.4]);
        slides++;
        return true;
      };
      const wayOut = () => {
        const before = openings.length;
        if (!(params.sliding && slidingDoor()))
          doorAt(null);
        return openings.length > before ? round5((openings.at(-1).a0 + openings.at(-1).a1) / 2) : null;
      };
      const within3 = ([p, q], lay) => {
        const fence2 = [[-Infinity, p], [q, Infinity]];
        blocked.push(...fence2);
        const laid2 = lay();
        for (const each of fence2)
          blocked.splice(blocked.indexOf(each), 1);
        return laid2;
      };
      if (bay && side2 === "front")
        blocked.push([bay.x0 - NIB, bay.x0 + WALL + NIB], [bay.x1 - WALL - NIB, bay.x1 + NIB]);
      if (k === 0 && side2 === "front") {
        if (bay || style.logs)
          doorAt(null, fronts, true, entry.from + entry.width / 2);
        else if (recess) {
          openings.push({ a0: recess.x0, a1: recess.x1, z0: floor, z1: round5(floor + M.clear), void: true, bars: 0 });
          blocked.push([recess.x0 - WALL - 0.4, recess.x1 + WALL + 0.4]);
          for (let leaf = 0;leaf < fronts; leaf++)
            doors.push({ storey: k, side: side2, yaw, at: [round5(entry.from + entry.width / fronts * (leaf + 0.5)), round5(recess.y - WALL / 2), floor], size: [entry.width / fronts, WALL, M.entry.head], style: style.door, hinge: hingeOf(fronts, leaf, true, entry, rect), leaves: fronts, from: entry.from, width: entry.width });
        } else
          doorAt(0.2 + 0.6 * at, fronts, true);
        if (canopied) {
          const { from, width: wide } = doors.at(-1);
          fin = form.canopy.chances[1] < 0.5 ? round5(from - 0.5) : round5(from + wide + 0.5);
          blocked.push([fin - 0.35, fin + 0.35]);
        }
      }
      for (const each of laidRooms[k].partitions) {
        const meets = each.along === along2 ? false : side2 === "front" ? each.a1 >= rect.y1 - WALL - 0.000001 : side2 === "back" ? each.a0 <= rect.y0 + WALL + 0.000001 : side2 === "right" ? each.a1 >= rect.x1 - WALL - 0.000001 : each.a0 <= rect.x0 + WALL + 0.000001;
        if (meets)
          blocked.push([each.at - PART / 2 - 0.15, each.at + PART / 2 + 0.15]);
      }
      if (roofed !== top && k === floors - 1 && along2 === 1)
        blocked.push([roofed.y0 - PART / 2 - 0.15, roofed.y0 + PART / 2 + 0.15]);
      if (wing && k === 0 && side2 === beside) {
        const inside = SIDES5[side2].at(rect) - out2 * (WALL + 0.3);
        const face2 = SIDES5[side2].at(rect) - out2 * WALL;
        const closed = [
          ...laidRooms[k].rooms.filter((room2) => !OPEN.includes(room2.type) && inside > room2.x0 && inside < room2.x1).map((room2) => [room2.y0 - 0.2, room2.y1 + 0.2]),
          ...laidRooms[k].partitions.filter((each) => each.along === along2 && Math.abs(each.at - face2) < M.door + 0.05).map((each) => [each.a0 - 0.05, each.a1 + 0.05])
        ];
        const [stretch2] = freeOf([Math.max(usable[0], wing.y0 + WALL + CORNER), Math.min(usable[1], wing.y1 - WALL - CORNER)], [...blocked, ...closed]).filter(([p, q]) => q - p >= M.door + 0.2).sort((p, q) => q[1] - q[0] - (p[1] - p[0]));
        const before = doors.length;
        if (stretch2)
          within3(stretch2, () => doorAt(null));
        if (doors.length > before)
          Object.assign(doors.at(-1), { style: "plain", to: "garage" });
        blocked.push([wing.y0, wing.y1 + 0.4]);
      }
      if (bay && side2 === "front") {
        const stretches = k < bay.high ? freeOf([bay.x0 + WALL, bay.x1 - WALL], blocked).filter(([p, q]) => q - p >= M.rooms.inner[0] + 0.4).sort((p, q) => q[1] - q[0] - (p[1] - p[0])) : [];
        const behind = ([p, q]) => roomAt(k, (p + q) / 2, rect.y1 - WALL - 0.3);
        const open = stretches.find((each) => OPEN.includes(behind(each))) ?? (k === 0 ? stretches[0] : undefined);
        if (k === bay.high)
          bay.way = within3([bay.x0 + WALL + NIB, bay.x1 - WALL - NIB], wayOut);
        if (open) {
          openings.push({ a0: round5(open[0]), a1: round5(open[1]), z0: floor, z1: round5(floor + M.clear), void: true, bars: 0 });
          blocked.push([open[0] - 0.4, open[1] + 0.4]);
          if (k > 0)
            rails.push({ from: [round5(open[0]), round5(rect.y1 - 0.06)], to: [round5(open[1]), round5(rect.y1 - 0.06)], z: floor, inside: true });
        }
        if (k === 1 && !style.veranda && !(bay.high === 1 && bay.way !== null))
          for (const which of [-1, 1]) {
            const way = within3(besideBay(which), wayOut);
            if (way !== null)
              bayWays.set(which, way);
          }
      }
      const terraced = style.veranda ? along2 === 1 && !(bay && bay.door < 0 === (side2 === "left")) : style.end || jut ? side2 === far : false;
      if (terraced && k === 0) {
        const inside = SIDES5[side2].at(rect) - out2 * (WALL + 0.3);
        const reach = style.end ? [Math.max(usable[0], roofed.y0 + 0.3), usable[1]] : usable;
        const [stretch2] = freeOf(reach, blocked).filter(([p, q]) => OPEN.includes(roomAt(k, inside, (p + q) / 2))).sort((p, q) => q[1] - q[0] - (p[1] - p[0]));
        const way = stretch2 ? within3(stretch2, wayOut) : null;
        if (way !== null)
          verandaWays.set(side2, way);
      }
      if (terraceDoors.get(k) === side2) {
        const way = hall && side2 === "front" ? within3([-hall / 2 + 0.3, hall / 2 - 0.3], wayOut) : wayOut();
        if (way !== null)
          accesses.set(k, { side: side2, at: way });
      } else if (k > 0 && side2 === "front" && terraces.get(k).front < M.terrace && (k === 1 ? form.balcony.on : params.forms === 1 && form.balcony.chances[1] < style.forms.balcony)) {
        const way = wayOut();
        if (way !== null)
          balconies.set(k, way);
      }
      const ranked = () => {
        const { bay: each, width: across2, z } = M.patterns[pattern];
        const from = hall ? hall / 2 + PART + 0.45 : entry.width / 2 + 0.9;
        const count = Math.max(1, Math.floor((usable[1] - from) / each));
        const pitch2 = (usable[1] - from) / count;
        const wide = Math.min(Math.max(across2 * g, 0.45), pitch2 - 0.5);
        const flank = hall && hall / 2 - 0.21 - (entry.width / 2 + 0.4) >= wide + 0.5 ? [(entry.width / 2 + 0.4 + hall / 2 - 0.21) / 2] : [];
        const free = freeOf(usable, blocked);
        const window = (c) => {
          const [p, q] = c === 0 ? [-round5(wide / 2), round5(wide / 2)] : [round5(Math.abs(c) - wide / 2), round5(Math.abs(c) + wide / 2)];
          return { a0: c < 0 ? -q : p, a1: c < 0 ? -p : q, z0: round5(floor + z[0]), z1: round5(floor + z[1]), bars: z[1] - z[0] > 1 ? Math.max(0, Math.round(wide / (1.5 * M.bays)) - 1) : 0 };
        };
        const holds = (opening, [p, q]) => opening.a0 >= p - 0.000000001 && opening.a1 <= q + 0.000000001;
        const inLine = wide < 0.45 ? [] : [...[...flank, ...Array.from({ length: count }, (_, i) => from + pitch2 * (i + 0.5))].flatMap((c) => [-c, c]), ...k > 0 ? [0] : []].sort((p, q) => p - q).map(window).filter((opening) => free.some((stretch2) => holds(opening, stretch2)));
        const own = wide < 0.45 ? [] : free.filter(([p, q]) => q - p >= wide + 0.5 && !inLine.some((opening) => holds(opening, [p, q]))).map(([p, q]) => window((p + q) / 2));
        return [...inLine, ...own];
      };
      const lays = style.grand && side2 === "front" && M.patterns[pattern]?.bay ? [ranked()] : freeOf(usable, blocked).map((stretch2) => {
        const middle2 = (stretch2[0] + stretch2[1]) / 2;
        const within4 = SIDES5[side2].at(rect) - out2 * (WALL + 0.3);
        const behind = roomAt(k, along2 === 0 ? middle2 : within4, along2 === 0 ? within4 : middle2);
        const private_ = behind === "bath" || behind === "toilet" || behind === "closet";
        return laid(M.patterns[private_ ? "slot" : pattern], stretch2, floor, g, style.grand ? () => 1 : chance, M.bays);
      });
      for (const list of lays) {
        for (const opening of list) {
          if (divided && opening.a1 - opening.a0 < SLIT)
            continue;
          const bay2 = opening.z0 === floor && opening.z1 === round5(floor + M.clear);
          if (params.sliding && opening.bars && slides < BUDGET.slides && (bay2 ? outside : params.sliding === 2)) {
            const pane = (opening.a1 - opening.a0) / (opening.bars + 1);
            opening.slide = { a0: round5(opening.a1 - pane), a1: opening.a1, by: slideOf(pane), walk: bay2, near: false };
            slides++;
          }
          openings.push(opening);
        }
      }
      openings.sort((p, q) => p.a0 - q.a0);
      if (style.end && !flat && side2 === far && k === floors - 1) {
        const tall = openings.filter((o) => !o.void && !o.door && o.z0 === floor && o.z1 === round5(floor + M.clear) && o.a0 >= roofed.y0);
        if (tall.length)
          glazed = { side: side2, y0: tall[0].a0, y1: tall.at(-1).a1 };
      }
      const slot = apart(k) ? 1 : 0;
      const flush2 = band && (band.side === "left" ? rect.x0 === ground.x0 : rect.x1 === ground.x1);
      const stretch = !band ? null : side2 === "front" ? [Math.max(band.x0, a0), Math.min(band.x1, a1)] : side2 === band.side && flush2 ? [a0, a1] : null;
      const accent = stretch && stretch[1] - stretch[0] >= 1 ? stretch : null;
      const banded = (end) => Boolean(band && flush2 && (band.side === "left" ? end === 0 : end === 1) && (side2 === "back" || accent));
      const ends2 = along2 === 0 ? [0, 1].map((end) => banded(end) ? 1 - slot : slot) : null;
      return { side: side2, storey: k, along: along2, out: out2, at: SIDES5[side2].at(rect), a0, a1, inner: inner2, z0: floor, z1: round5(floor + M.clear), slot, openings, accent, ends: ends2 };
    });
    return { rect, floor, walls };
  });
  const entryWalls = recess ? (() => {
    const [slot, z1, face2] = [storeys[0].walls[0].slot, round5(M.clear), round5(ground.y1 - WALL)];
    const [b0, b1] = [round5(recess.x0 - WALL), round5(recess.x1 + WALL)];
    return [
      { side: "entry", storey: 0, along: 0, out: 1, at: recess.y, a0: b0, a1: b1, inner: [b0, b1], z0: 0, z1, slot, ends: [FACE2.inside, FACE2.inside], openings: [{ a0: entry.from, a1: round5(entry.from + entry.width), z0: 0, z1: round5(M.entry.head), door: true, bars: 0 }] },
      { side: "entry", storey: 0, along: 1, out: 1, at: recess.x0, a0: recess.y, a1: face2, inner: [recess.y, face2], z0: 0, z1, slot, openings: [] },
      { side: "entry", storey: 0, along: 1, out: -1, at: recess.x1, a0: recess.y, a1: face2, inner: [recess.y, face2], z0: 0, z1, slot, openings: [] }
    ];
  })() : [];
  const wingWalls = wing ? (() => {
    const [slot, z1] = [FACE2.apart, round5(M.clear)];
    const [end, out2] = dir > 0 ? [wing.x0, -1] : [wing.x1, 1];
    const [b0, b1] = [round5(wing.y0 + WALL), round5(wing.y1 - WALL)];
    return [
      { side: "wing", storey: null, along: 0, out: 1, at: wing.y1, a0: wing.x0, a1: wing.x1, inner: wing.inner, z0: 0, z1, slot, openings: [{ a0: wing.door.a0, a1: wing.door.a1, z0: 0, z1: wing.door.head, door: true, bars: 0 }] },
      { side: "wing", storey: null, along: 1, out: out2, at: end, a0: b0, a1: b1, inner: [b0, b1], z0: 0, z1, slot, openings: laid(M.patterns.slot, [b0 + CORNER, b1 - CORNER], 0, g, () => 1, M.bays) },
      { side: "wing", storey: null, along: 0, out: -1, at: wing.y0, a0: wing.x0, a1: wing.x1, inner: wing.inner, z0: 0, z1, slot, openings: [] }
    ];
  })() : [];
  const LEAVED = ["bath", "toilet", "bedroom", "study", "closet"];
  const twoLeaved = (way) => way.leaves === 2;
  const most = style.grand ? BUDGET.grand.inner : BUDGET.inner;
  let hung = 0;
  const leaved = new Set(params.rooms === 2 ? laidRooms.flatMap(({ partitions: list }) => list.flatMap((each) => each.ways)).filter((way) => LEAVED.includes(way.room) || twoLeaved(way)).map((way, order) => ({ way, order })).sort((p, q) => twoLeaved(q.way) - twoLeaved(p.way) || LEAVED.indexOf(p.way.room) - LEAVED.indexOf(q.way.room) || p.order - q.order).filter(({ way }) => (hung += twoLeaved(way) ? 2 : 1) <= most).map(({ way }) => way) : []);
  const inner = [];
  const partitions = laidRooms.flatMap(({ partitions: list }, k) => list.map((each) => {
    const floor = round5(k * M.storey);
    for (const way of each.ways) {
      if (!leaved.has(way))
        continue;
      const yaw = each.along === 0 ? way.into > 0 ? 180 : 0 : way.into > 0 ? 90 : -90;
      if (!twoLeaved(way)) {
        const middle2 = round5((way.a0 + way.a1) / 2);
        inner.push({ storey: k, room: way.room, yaw, at: each.along === 0 ? [middle2, each.at, floor] : [each.at, middle2, floor], size: [round5(way.a1 - way.a0), PART, M.rooms.inner[1]], hinge: inner.length % 2 });
        continue;
      }
      const [half, own, slides2] = [(way.a1 - way.a0) / 2, yaw === 0 || yaw === 90 ? 1 : -1, Boolean(params.sliding) && way.pocket];
      for (const [leaf, outward] of [[0, -1], [1, 1]]) {
        const middle2 = round5(way.a0 + half * (leaf + 0.5));
        inner.push({
          storey: k,
          room: way.room,
          yaw,
          at: each.along === 0 ? [middle2, each.at, floor] : [each.at, middle2, floor],
          size: [round5(half), slides2 ? SLIDING : PART, M.rooms.inner[1]],
          hinge: outward === own ? 1 : 0,
          leaves: 2,
          ...slides2 && { slide: round5(outward * own * half) }
        });
      }
    }
    return {
      side: "partition",
      partition: true,
      storey: k,
      along: each.along,
      out: 1,
      at: round5(each.at + PART / 2),
      a0: each.a0,
      a1: each.a1,
      inner: [each.a0, each.a1],
      z0: floor,
      z1: round5(floor + M.clear),
      slot: FACE2.inside,
      reveal: FACE2.inside,
      thick: PART,
      ends: [FACE2.inside, FACE2.inside],
      openings: each.ways.map((way) => ({ a0: way.a0, a1: way.a1, z0: floor, z1: round5(floor + M.rooms.inner[1]), door: true, bars: 0 })).sort((p, q) => p.a0 - q.a0)
    };
  }));
  const rooms = laidRooms.flatMap((each) => each.rooms);
  const split = roofed !== top;
  const eaves = round5(roofed.y1 - roofed.y0);
  const wallTop = round5((floors - 1) * M.storey + M.clear);
  const middle = (roofed.y0 + roofed.y1) / 2;
  const ridged = roofName === "gable" || roofName === "steep";
  const slope = roofName === "mono" ? Math.min(0.22, 2 / eaves) : roofName === "gable" ? Math.min(0.45, 4.4 / eaves) : roofName === "butterfly" ? Math.min(0.2, 2.6 / eaves) : roofName === "steep" ? clamp5(Math.min(0.6 * floors * M.storey, 5.5) / (eaves / 2), 0.6, 1.2) : 0;
  const sweep2 = ridged && style.sweep ? round5(M.balcony[1] + 0.2) : ridged && stoa && floors === 1 ? round5(stoa + 0.3) : 0;
  const pitch = roofName === "mono" ? (y) => wallTop + (y - roofed.y0) * slope : ridged ? (y) => sweep2 && y > top.y1 ? wallTop - (y - top.y1) * SWEEP : wallTop + (eaves / 2 - Math.abs(y - middle)) * slope : (y) => wallTop + Math.abs(y - middle) * slope;
  const under = split ? (y) => y < roofed.y0 ? wallTop : pitch(y) : pitch;
  const outlineOf2 = (stations) => [...stations.map((y) => [round5(y), round5(under(y))]), ...stations.toReversed().map((y) => [round5(y), round5(under(y) + ROOF)])];
  const turns = [split ? roofed.y0 : top.y0 - EAVE, ...roofName === "mono" ? [] : [middle]];
  const outline2 = flat ? null : outlineOf2([...turns, ...sweep2 ? [top.y1, top.y1 + sweep2] : [top.y1 + EAVE]]);
  const cap3 = hipped ? (({ rect, top: z0 }) => {
    const half = Math.min(rect.x1 - rect.x0, rect.y1 - rect.y0) / 2;
    const slope2 = clamp5(4 / half, 0.35, 0.6);
    return { ...rect, z0, half: round5(half), slope: slope2, rise: round5(half * slope2) };
  })(slabs.find((slab) => slab.kind === "roof" && slab.top === round5(floors * M.storey) && slab.rect.x0 <= top.x0 && slab.rect.x1 >= top.x1 && slab.rect.y1 >= top.y1)) : null;
  const capAt = (x, y) => Math.max(0, Math.min(x - cap3.x0, cap3.x1 - x, y - cap3.y0, cap3.y1 - y)) * cap3.slope;
  const roof2 = hipped ? { type: "hip", top: round5(floors * M.storey + cap3.rise), cap: cap3 } : flat ? { type: "flat", top: round5(floors * M.storey) } : {
    type: roofName,
    slope,
    rect: roofed,
    under,
    eave: EAVE,
    verge: VERGE,
    slot: storeys[floors - 1].walls[0].slot,
    outline: outline2,
    glazed,
    parts: bay ? [[top.x0 - ends, bay.x0, outline2], [bay.x0, bay.x1, outlineOf2([...turns, top.y1])], [bay.x1, top.x1 + ends, outline2]] : [[top.x0 - ends, top.x1 + ends, outline2]],
    raised: [
      ...roofName === "mono" ? [{ side: "front", height: round5(eaves * slope) }] : [],
      ...roofName === "butterfly" ? [{ side: "front", height: round5(eaves / 2 * slope) }, { side: "back", height: round5(eaves / 2 * slope) }] : []
    ],
    gables: roofName === "mono" ? [[[roofed.y0, wallTop], [top.y1 - WALL, wallTop], [top.y1 - WALL, round5(under(top.y1 - WALL))]]] : ridged ? [[[roofed.y0, wallTop], [top.y1, wallTop], [middle, round5(under(middle))]]] : [[[roofed.y0 + WALL, wallTop], [middle, wallTop], [roofed.y0 + WALL, round5(under(roofed.y0 + WALL))]], [[middle, wallTop], [top.y1 - WALL, wallTop], [top.y1 - WALL, round5(under(top.y1 - WALL))]]]
  };
  if (!flat)
    roof2.top = round5(Math.max(...roof2.outline.map((point) => point[1])));
  const clerestory = roofName === "mono" && roof2.raised[0].height >= 0.9 ? [{ a0: round5(top.x0 + WALL + CORNER), a1: round5(top.x1 - WALL - CORNER), z0: round5(wallTop + 0.2), z1: round5(wallTop + roof2.raised[0].height - 0.25), bars: Math.max(0, Math.round((top.x1 - top.x0 - 1.4) / (1.5 * M.bays)) - 1) }] : [];
  const raised = flat ? [] : roof2.raised.map(({ side: side2, height }) => ({
    side: side2,
    storey: floors - 1,
    along: 0,
    out: SIDES5[side2].out,
    at: SIDES5[side2].at(roofed),
    a0: top.x0,
    a1: top.x1,
    inner: [round5(top.x0 + WALL), round5(top.x1 - WALL)],
    z0: wallTop,
    z1: round5(wallTop + height),
    slot: roof2.slot,
    openings: side2 === "front" ? clerestory : [],
    raised: true
  }));
  const parapet = flat && !hipped && style.parapet ? { rect: top, z0: round5(floors * M.storey), z1: round5(floors * M.storey + style.parapet), slot: storeys[floors - 1].walls[0].slot } : null;
  const stairs2 = Array.from({ length: floors - 1 }, (_, k) => ({ floor: round5(k * M.storey), wallX: round5(wallX), dir, y0: round5(backY), lane: M.lane, landing: M.landing, hole: well, rise: M.rise, flights: M.flights, flight: M.flight }));
  const front = doors.find((door2) => door2.storey === 0);
  const doorway = front.from + front.width / 2;
  const across = recess ? recess.x1 - recess.x0 : colonnade || (style.grand ? round5(front.width + 4) : stoa ? round5(front.width + 2) : M.porch[0] + front.width - M.entry.single);
  const risers = Math.max(1, Math.ceil(params.stoop / STEP2 - 0.000000001));
  const edge = slabs[0].rect.y1;
  const winged = Boolean(bay) && !style.veranda;
  const span = bay ? bay.door < 0 ? [ground.x0 + (winged ? WALL : 0), bay.x0] : [bay.x1, ground.x1 - (winged ? WALL : 0)] : stoa ? [ground.x0, ground.x1] : [doorway - across / 2, doorway + across / 2];
  const out = bay ? M.bay[2] - 0.6 : colonnade ? M.portico[0] : stoa || (style.over ? 0 : M.porch[1]);
  const porch = {
    x0: round5(span[0]),
    x1: round5(span[1]),
    y0: round5(edge),
    y1: round5(edge + out),
    bottom: slabs[0].bottom,
    steps: Array.from({ length: risers - 1 }, (_, i) => ({ top: round5(-(i + 1) * params.stoop / risers), y0: round5(edge + out + i * TREAD), y1: round5(edge + out + (i + 1) * TREAD) })),
    ...stoa && { across: [round5(clamp5(doorway - across / 2, span[0] + 0.8, span[1] - 0.8 - across)), round5(clamp5(doorway - across / 2, span[0] + 0.8, span[1] - 0.8 - across) + across)] }
  };
  const lights = [];
  const switches = [];
  if (params.lighting) {
    for (const [k, { rect, floor }] of storeys.entries()) {
      const zone = `storey ${k + 1}`;
      const [wide, deep] = [rect.x1 - rect.x0, rect.y1 - rect.y0];
      const y = round5(Math.max(((floors > 1 ? hole.y1 : rect.y0 + WALL) + rect.y1 - WALL) / 2, shaft ? shaft.y1 + 0.35 : -Infinity));
      const range = round5(clamp5(Math.max(wide / params.lighting, deep) / 2 + 1.5, 5, 9));
      const bedrooms = laidRooms[k].rooms.filter((room2) => room2.type === "bedroom" && room2.y1 >= rect.y1 - WALL - 0.000001).sort((p, q) => p.x0 - q.x0);
      const over = !hall && bedrooms.length >= params.lighting && bedrooms.length > 1 ? params.lighting === 1 ? [bedrooms[Math.floor(bedrooms.length / 2)]] : [bedrooms[0], bedrooms.at(-1)] : null;
      const along2 = [...laidRooms[k].partitions.filter((each) => each.along === 0).map((each) => each.at), ...k === floors - 1 && split ? [roofed.y0] : []];
      const hung2 = k === floors - 1 && roofName === "steep";
      const lightY = hung2 ? along2.reduce((at2, wall) => Math.abs(at2 - wall) < 0.4 ? round5(wall + 0.5) : at2, round5(Math.max(over ? (over[0].y0 + over[0].y1) / 2 : y, top.y1 - WALL - HANG / slope))) : over ? round5((over[0].y0 + over[0].y1) / 2) : along2.reduce((at2, wall) => Math.abs(at2 - wall) < 0.4 ? round5(wall + 0.5) : at2, y);
      const crossing2 = laidRooms[k].partitions.filter((each) => each.along === 1 && each.a0 < lightY && each.a1 > lightY).map((each) => each.at);
      for (let n = 0;n < params.lighting; n++) {
        let x = over ? (over[n].x0 + over[n].x1) / 2 : rect.x0 + wide * (n + 1) / (params.lighting + 1);
        for (const at2 of crossing2)
          if (Math.abs(x - at2) < LIGHT / 2 + 0.2)
            x = at2 + (x >= at2 ? 1 : -1) * (LIGHT / 2 + 0.2);
        lights.push({ storey: k, zone, range, at: [round5(x), lightY, round5(k === floors - 1 && !flat ? under(lightY) : floor + M.clear)] });
      }
      const reach = clamp5(Math.round(Math.hypot(wide, deep)) / 2, 4, M.reach);
      if (k === 0 && recess)
        switches.push({ storey: k, zone, reach, at: [round5(front.from + front.width + 0.2), round5(recess.y - WALL), round5(floor + 1.2)], out: -1 });
      else if (k === 0)
        switches.push({ storey: k, zone, reach, at: [round5(switchBeside(front, rect, null) > 0 ? front.from + front.width + 0.2 : front.from - 0.2), round5(rect.y1 - WALL), round5(floor + 1.2)], out: -1 });
      else
        switches.push({ storey: k, zone, reach, at: [round5(wallX + dir * (well[0] + 0.15)), round5(backY), round5(floor + 1.2)], out: 1 });
    }
  }
  const extras = [];
  const extra = (what, min2, max2, [top2, side2, bottom], { solid: solid2 = true, level = 0 } = {}) => extras.push({ what, min: min2.map(round5), max: max2.map(round5), top: top2, side: side2, bottom, solid: solid2, level });
  const { trim, apart: other, inside: soffit, roof: roofing, floors: flooring } = FACE2;
  if (canopied) {
    const [y0, y1, z] = [ground.y1, ground.y1 + M.canopy[0], M.entry.head + 0.25];
    extra("canopy", [porch.x0 - 0.2, y0, z], [porch.x1 + 0.2, y1, z + M.canopy[1]], [trim, trim, soffit]);
    extra("fin", [fin - 0.1, y0, porch.bottom], [fin + 0.1, y1, z], [null, other, null]);
  }
  if (form.carport.on) {
    const [x0, x1] = dir > 0 ? [ground.x0 - M.carport[0], ground.x0] : [ground.x1, ground.x1 + M.carport[0]];
    const [y0, y1] = [ground.y1 - M.carport[1], ground.y1];
    extra("carport", [x0, y0, M.carport[2]], [x1, y1, M.carport[2] + 0.15], [roofing, trim, soffit]);
    const post = dir > 0 ? x0 + 0.15 : x1 - 0.15;
    for (const y of [y0 + 0.15, y1 - 0.15])
      extra("carport post", [post - 0.06, y - 0.06, slabs[0].bottom], [post + 0.06, y + 0.06, M.carport[2]], [null, trim, null]);
  }
  for (const [k, at2] of balconies) {
    const { rect, floor } = storeys[k];
    const [x0, x1] = [Math.max(at2 - M.balcony[0] / 2, rect.x0), Math.min(at2 + M.balcony[0] / 2, rect.x1)];
    const [y0, y1] = [rect.y1, rect.y1 + M.balcony[1]];
    extra("balcony", [x0, y0, floor - M.balcony[2]], [x1, y1, floor], [flooring, trim, soffit]);
    const inset = 0.06;
    rails.push({ from: [round5(x0 + inset), round5(y1 - inset)], to: [round5(x1 - inset), round5(y1 - inset)], z: floor });
    for (const x of [x0 + inset, x1 - inset])
      rails.push({ from: [round5(x), round5(y0)], to: [round5(x), round5(y1 - inset)], z: floor });
  }
  const [terrace] = accesses.keys();
  if (form.pergola.on && terrace !== undefined) {
    const { side: side2, at: at2 } = accesses.get(terrace);
    const { rect, floor } = storeys[terrace];
    const { along: along2, out: out2 } = SIDES5[side2];
    const reach = Math.min(terraces.get(terrace)[side2] - 0.35, M.pergola[1]);
    const [w0, w1] = along2 === 0 ? [rect.x0, rect.x1] : [rect.y0, rect.y1];
    const [a0, a1] = [Math.max(at2 - M.pergola[0] / 2, w0), Math.min(at2 + M.pergola[0] / 2, w1)];
    const face2 = SIDES5[side2].at(rect);
    const z = floor + M.pergola[2];
    const piece = (what, [a, b], [f, g2], [z0, z1], options) => {
      const [p, q] = [face2 + out2 * f, face2 + out2 * g2].sort((u, v) => u - v);
      extra(what, along2 === 0 ? [a, p, z0] : [p, a, z0], along2 === 0 ? [b, q, z1] : [q, b, z1], [trim, trim, trim], options);
    };
    if (reach >= 1.2 && a1 - a0 >= 1.8) {
      const count = Math.floor((a1 - a0) / M.pergola[3]);
      for (let n = 0;n <= count; n++) {
        const a = a0 + (a1 - a0 - 0.06) * n / count;
        piece("pergola slat", [a, a + 0.06], [0, reach], [z, z + 0.15], { solid: false, level: 2 });
      }
      piece("pergola beam", [a0, a1], [reach - 0.12, reach], [z - 0.15, z], { solid: false, level: 1 });
      for (const a of [a0, a1 - 0.1])
        piece("pergola post", [a, a + 0.1], [reach - 0.11, reach - 0.01], [floor, z - 0.15], { level: 1 });
    }
  }
  if (recess && floors === 1 && !flat)
    extra("entry soffit", [recess.x0 - WALL, recess.y - WALL, M.clear], [recess.x1 + WALL, ground.y1 - WALL, M.clear + 0.1], [soffit, soffit, soffit], { level: 1 });
  if (form.chimney.on)
    for (const x of style.grand ? [top.x0 + 1.5, top.x1 - 1.5] : [dir > 0 ? top.x1 - 1.5 : top.x0 + 1.5]) {
      const y = roofed.y0 + (0.25 + 0.3 * form.chimney.chances[1]) * (top.y1 - roofed.y0);
      const [from, over] = flat ? [floors * M.storey, floors * M.storey + (hipped ? Math.max(...[-0.45, 0.45].flatMap((dy) => [-0.35, 0.35].map((dx) => capAt(x + dx, y + dy)))) : style.parapet || 0)] : [under(y - 0.45) - 0.02, Math.max(under(y - 0.45), under(y + 0.45)) + ROOF];
      extra("chimney", [x - 0.35, y - 0.45, from], [x + 0.35, y + 0.45, over + 1], [trim, storeys[floors - 1].walls[0].slot, null]);
    }
  const blade = bladed && { ...bladed, z0: slabs[0].bottom, z1: round5(roof2.top + BLADE[2]) };
  if (blade)
    extra("blade", [blade.x0, blade.y0, blade.z0], [blade.x1, blade.y1, blade.z1], [other, other, null]);
  const timber = stoa ? (() => {
    const [r, thin] = [M.veranda[1], round5(M.veranda[1] * 0.45)];
    const [posts, logs] = [[], []];
    for (const x of [ground.x0, ground.x1])
      for (const y2 of [ground.y0, ground.y1])
        posts.push({ x, y: y2, r: round5(r * 1.25), z0: slabs[0].bottom, z1: wallTop });
    const shelter = sweep2 ? null : round5(Math.min(M.storey, wallTop));
    if (shelter !== null)
      extra("porch roof", [porch.x0 - 0.3, ground.y1, shelter - M.balcony[2]], [porch.x1 + 0.3, porch.y1 + 0.3, shelter], [roofing, trim, soffit]);
    const y = round5(porch.y1 - r - 0.12);
    const [first, last] = [round5(porch.x0 + r + 0.12), round5(porch.x1 - r - 0.12)];
    const [s0, s1] = [round5(porch.across[0] - r), round5(porch.across[1] + r)];
    const set = [first, s0, s1, last];
    const xs = set.flatMap((x, i) => {
      if (i === 0)
        return [x];
      const gap = x - set[i - 1];
      const more = i === 2 ? 1 : Math.max(1, Math.ceil(gap / (3 * M.bays) - 0.000000001));
      return Array.from({ length: more }, (_, n) => round5(set[i - 1] + gap * (n + 1) / more));
    });
    for (const x of xs)
      posts.push({ x, y, r, z0: 0, z1: round5((shelter === null ? under(y) : shelter - M.balcony[2]) - 0.01) });
    const spans = [
      ...xs.slice(1).map((x, i) => [xs[i], x]).filter(([p, q]) => !(p === s0 && q === s1)).map(([p, q]) => ({ along: 0, a0: p, a1: q, at: y })),
      ...[first, last].map((x) => ({ along: 1, a0: ground.y1, a1: y, at: x }))
    ];
    for (const span2 of spans)
      for (const [z, fence2] of [[RAIL4 - thin, true], [round5(RAIL4 * 0.48), false]])
        logs.push({ ...span2, z: round5(z), r: thin, fence: fence2 });
    if (ridged)
      for (const at2 of [middle, round5(top.y0 + 0.35), round5(top.y1 - 0.35)])
        for (const [a0, a1] of [[round5(top.x0 - ends + 0.08), top.x0], [top.x1, round5(top.x1 + ends - 0.08)]])
          logs.push({ along: 0, a0, a1, at: round5(at2), z: round5(under(at2) - r - 0.02), r, fence: false });
    const x0 = far === "left" ? round5(ground.x0 - hearth.out) : ground.x1;
    const over = flat ? floors * M.storey + (hipped ? Math.max(capAt(far === "left" ? ground.x0 : ground.x1, hearth.y0), capAt(far === "left" ? ground.x0 : ground.x1, hearth.y1)) : 0) : Math.max(under(hearth.y0), under(hearth.y1), under((hearth.y0 + hearth.y1) / 2)) + ROOF;
    extra("hearth", [x0, hearth.y0, slabs[0].bottom], [x0 + hearth.out, hearth.y1, over + 1], [other, other, null]);
    return { posts, logs };
  })() : null;
  const portico = colonnade ? (() => {
    const [beam, z0] = [0.55, round5(floors * M.storey)];
    const r = round5(Math.max(M.portico[1], (wallTop - beam) / 44));
    const outer = porch.x1 - r - 0.15;
    const inner2 = Math.min(front.width / 2 + r + 0.45, outer - 2 * r - 0.3);
    const xs = [inner2, ...colonnade >= 10 ? [(inner2 + outer) / 2] : [], outer].flatMap((x) => [-x, x]).sort((p, q) => p - q);
    extra("entablature", [porch.x0, ground.y1, wallTop - beam], [porch.x1, porch.y1 + 0.15, z0], [trim, trim, soffit]);
    const rise = round5(0.22 * colonnade);
    const back = roofName === "mono" || roofName === "butterfly" ? ground.y1 : hipped ? cap3.y1 - rise / cap3.slope - 0.05 : ridged ? top.y1 - rise / slope - 0.05 : top.y1 - 0.5;
    return {
      x0: porch.x0,
      x1: porch.x1,
      y0: porch.y0,
      y1: porch.y1,
      columns: xs.map((x) => ({ x: round5(x), y: round5(porch.y1 - r - 0.15), r, z0: 0, z1: round5(wallTop - beam) })),
      pediment: { x0: round5(porch.x0 - 0.25), x1: round5(porch.x1 + 0.25), y0: round5(back), y1: round5(porch.y1 + 0.4), z0, rise, slot: storeys[floors - 1].walls[0].slot }
    };
  })() : null;
  const bayWalls = [];
  if (bay) {
    const slot = FACE2.apart;
    const mid = (bay.x0 + bay.x1) / 2;
    const [slabbed, gabled] = [style.crown === "slab", style.crown === "gable"];
    bay.ways = bayWays;
    const crowned = slabbed ? { wallsTop: round5(bay.high * M.storey - SLAB3), vault: null } : (() => {
      const frontTop = flat ? floors * M.storey + (hipped ? 0 : style.parapet || 0) : under(top.y1) + ROOF;
      const spring = frontTop + LIFT2;
      const half = (bay.x1 - bay.x0) / 2 + VERGE;
      const room2 = ridged ? under(middle) + ROOF - 0.4 - spring : 0;
      const meets = room2 >= 0.3;
      const [strips, steep] = gabled ? [2, (ridged ? slope : 0.6) * half] : [FACETS, ARCH2 * half];
      const rise = meets ? Math.min(steep, room2) : steep;
      const radius = (half * half + rise * rise) / (2 * rise);
      const angle = Math.asin(half / radius);
      const points = Array.from({ length: strips + 1 }, (_, i) => {
        const t = -angle + 2 * angle * i / strips;
        return [round5(mid + radius * Math.sin(t)), round5(spring + rise - radius + radius * Math.cos(t))];
      });
      const backOf2 = (z) => round5(meets ? top.y1 - (z - wallTop - ROOF) / slope : top.y1 - WALL);
      const soffitAt = (x) => {
        const next = points.findIndex((point) => point[0] > x);
        const i = next < 0 ? strips - 1 : Math.max(0, next - 1);
        const [[xa, za], [xb, zb]] = [points[i], points[i + 1]];
        return za + (zb - za) * (x - xa) / (xb - xa) - ROOF;
      };
      const wallsTop2 = round5(soffitAt(bay.x0 + WALL));
      const vault = {
        points,
        thick: ROOF,
        front: round5(bay.y1 + VERGE),
        meets,
        glass: gabled,
        back: points.map(([, z]) => backOf2(z)),
        under: points.map(([, z]) => backOf2(z - ROOF)),
        at: top.y1,
        base: round5(frontTop),
        behind: round5(flat ? frontTop : under(top.y1 - WALL) + ROOF),
        wall: storeys[floors - 1].walls[0].slot,
        cheek: meets ? { z: round5(soffitAt(bay.x0)), back: backOf2(soffitAt(bay.x0)), foot: round5(frontTop) } : null,
        walls: wallsTop2,
        slot,
        top: round5(spring + rise)
      };
      return { wallsTop: wallsTop2, vault };
    })();
    const { wallsTop } = crowned;
    bay.vault = crowned.vault;
    const inner2 = [round5(bay.x0 + WALL), round5(bay.x1 - WALL)];
    const glass = (inner2[1] - inner2[0]) * (gabled || slabbed ? 0.86 : 0.72);
    const bars = Math.max(0, Math.round(glass / (1.5 * M.bays)) - 1);
    bayWalls.push({
      side: "bay",
      storey: null,
      along: 0,
      out: 1,
      at: bay.y1,
      a0: bay.x0,
      a1: bay.x1,
      inner: inner2,
      z0: 0,
      z1: wallsTop,
      slot,
      openings: slabbed ? [{ a0: round5(mid - glass / 2), a1: round5(mid + glass / 2), z0: 0, z1: round5(wallsTop - 0.15), bars }] : rects.map((_, k) => ({ a0: round5(mid - glass / 2), a1: round5(mid + glass / 2), z0: round5(k * M.storey), z1: round5(gabled && k === floors - 1 ? wallsTop - 0.15 : k * M.storey + M.clear), bars }))
    }, ...[[bay.x0, -1], [bay.x1, 1]].map(([x, out2]) => ({ side: "bay", storey: null, along: 1, out: out2, at: x, a0: bay.y0, a1: round5(bay.y1 - WALL), inner: [bay.y0, round5(bay.y1 - WALL)], z0: 0, z1: wallsTop, slot, openings: [] })));
    slabs.push({ kind: "base", rect: { x0: bay.x0, x1: bay.x1, y0: bay.y0, y1: bay.y1 }, top: 0, bottom: slabs[0].bottom, holes: [] });
    if (slabbed && bay.high < floors) {
      const [z, inset] = [round5(bay.high * M.storey), 0.06];
      slabs.push({ kind: "deck", rect: { x0: bay.x0, x1: bay.x1, y0: bay.y0, y1: bay.y1 }, top: z, bottom: round5(z - SLAB3), holes: [] });
      rails.push({ from: [round5(bay.x0 + inset), round5(bay.y1 - inset)], to: [round5(bay.x1 - inset), round5(bay.y1 - inset)], z });
      for (const [x, side2] of [[bay.x0 + inset, -1], [bay.x1 - inset, 1]])
        rails.push({ from: [round5(x), side2 === bay.door && winged && bay.high === 1 ? porch.y1 : bay.y0], to: [round5(x), round5(bay.y1 - inset)], z });
    } else if (slabbed && !flat)
      slabs.push({ kind: "roof", rect: { x0: round5(bay.x0 - style.eave), x1: round5(bay.x1 + style.eave), y0: bay.y0, y1: round5(bay.y1 + style.eave) }, top: round5(floors * M.storey), bottom: round5(floors * M.storey - SLAB3), holes: [] });
    const [w0, w1] = bay.door < 0 ? [ground.x0, ground.x0 + WALL] : [ground.x1 - WALL, ground.x1];
    if (winged)
      extra("wing wall", [w0, ground.y1, slabs[0].bottom], [w1, porch.y1, Math.min(floors > 1 ? M.storey + M.head : Infinity, wallTop - sweep2 * SWEEP - 0.03)], [trim, FACE2.walls, null]);
    if (floors > 1 && !winged)
      extra("porch roof", [porch.x0, ground.y1, M.storey - M.balcony[2]], [porch.x1, porch.y1, M.storey], [trim, trim, soffit]);
    if (floors > 1 && winged) {
      const [z, inset] = [M.storey, 0.06];
      extra("porch balcony", [porch.x0, ground.y1, z - M.balcony[2]], [porch.x1, porch.y1, z], [flooring, trim, soffit]);
      rails.push({ from: [round5(porch.x0 + inset), round5(porch.y1 - inset)], to: [round5(porch.x1 - inset), round5(porch.y1 - inset)], z });
      if (bayWays.has(-bay.door)) {
        const [x0, x1] = bay.door < 0 ? [bay.x1, ground.x1] : [ground.x0, bay.x0];
        const y1 = ground.y1 + M.balcony[1];
        extra("side balcony", [x0, ground.y1, z - M.balcony[2]], [x1, y1, z], [flooring, trim, soffit]);
        rails.push({ from: [round5(x0 + inset), round5(y1 - inset)], to: [round5(x1 - inset), round5(y1 - inset)], z });
        const end = bay.door < 0 ? x1 - inset : x0 + inset;
        rails.push({ from: [round5(end), round5(ground.y1)], to: [round5(end), round5(y1 - inset)], z });
      }
    }
  }
  const verandas = (style.veranda ? ["left", "right"] : style.end || jut ? [far] : []).map((side2) => {
    const out2 = style.veranda ? past : jut || M.veranda[0];
    const [x0, x1] = side2 === "left" ? [round5(ground.x0 - out2), ground.x0] : [ground.x1, round5(ground.x1 + out2)];
    const y0 = style.veranda || jut ? ground.y0 : roofed.y0;
    const y1 = bay && bay.door < 0 === (side2 === "left") ? porch.y1 : ground.y1;
    slabs.push({ kind: "base", rect: { x0, x1, y0, y1 }, top: 0, bottom: slabs[0].bottom, holes: [] });
    if (jut)
      return { side: side2, x0, x1, y0, y1, way: verandaWays.get(side2) ?? null };
    const [x, half] = [side2 === "left" ? x0 + 0.3 : x1 - 0.3, M.veranda[1] / 2];
    if (!style.veranda)
      extra("terrace roof", [x0, y0, M.clear], [x1, y1, M.clear + 0.15], [roofing, trim, soffit]);
    for (const y of [y0 + 0.3, ground.y1 - 0.3])
      extra("veranda post", [x - half, y - half, 0], [x + half, y + half, !style.veranda ? M.clear : flat ? floors * M.storey - SLAB3 : under(y)], [null, trim, null], { level: 1 });
    return { side: side2, x0, x1, y0, y1, way: verandaWays.get(side2) ?? null };
  });
  const covered = [
    ...slabs.map((slab) => slab.rect),
    ...rects,
    ...flat ? [] : [{ x0: top.x0 - ends, x1: top.x1 + ends, y0: split ? roofed.y0 : top.y0 - EAVE, y1: top.y1 + (sweep2 || EAVE) }],
    ...ramp ? [ramp] : [],
    ...portico ? [{ x0: portico.pediment.x0, x1: portico.pediment.x1, y0: portico.y0, y1: portico.pediment.y1 }] : [],
    ...bay?.vault ? [{ x0: bay.x0 - VERGE, x1: bay.x1 + VERGE, y0: bay.y0, y1: bay.vault.front }] : [],
    { x0: porch.x0, x1: porch.x1, y0: porch.y0, y1: porch.steps.at(-1)?.y1 ?? porch.y1 },
    ...extras.map((each) => ({ x0: each.min[0], x1: each.max[0], y0: each.min[1], y1: each.max[1] })),
    ...timber ? [...timber.posts.map(({ x, y, r }) => ({ x0: x - r, x1: x + r, y0: y - r, y1: y + r })), ...timber.logs.map(({ along: along2, a0, a1, at: at2, r }) => along2 === 0 ? { x0: a0, x1: a1, y0: at2 - r, y1: at2 + r } : { x0: at2 - r, x1: at2 + r, y0: a0, y1: a1 })] : []
  ].reduce(both);
  const min = [covered.x0, covered.y0, slabs[0].bottom].map(round5);
  const max = [covered.x1, covered.y1, Math.max(roof2.top, parapet?.z1 ?? 0, bay?.vault?.top ?? 0, portico ? portico.pediment.z0 + portico.pediment.rise : 0, ...extras.map((each) => each.max[2]))].map(round5);
  const reasons = params.plinth > DEEPEST ? [`the ground falls ${(params.plinth - 0.3).toFixed(1)} m under it: ${DEEPEST - 0.3} m at most — a flatter place, or the land levelled first`] : [];
  return { name, style, floors, dir, measures: M, rects, storeys, slabs, hole, stairs: stairs2, shaft, rails, parapet, roof: roof2, raised, doors, lights, switches, porch, extras, balconies, partitions, rooms, inner, entry: { ...entry, recess }, entryWalls, bay, bayWalls, verandas, wing: wing && { ...wing, ramp }, wingWalls, portico, hall: hall ? { x0: round5(-hall / 2), x1: round5(hall / 2) } : null, timber, blade, min, max, reasons };
};
var init_house_plan = __esm(() => {
  init_house();
  init_house_rooms();
  BLADE = Object.freeze([0.45, 0.3, 1]);
  OPEN = Object.freeze([null, "living", "dining", "lounge", "passage", "landing", "hall"]);
  FACE2 = Object.freeze({ walls: 0, apart: 1, trim: 2, glass: 3, roof: 4, floors: 5, inside: 6 });
  FORMS3 = Object.freeze(["accent", "canopy", "carport", "balcony", "pergola", "chimney"]);
  SCALES = Object.freeze({
    real: scaleOf2({
      name: "real",
      storey: 3.2,
      head: 2.3,
      flights: [8, 7],
      flight: 2.24,
      lane: 1,
      landing: 1.06,
      shaft: 1.5,
      door: 1.1,
      leaf: 1,
      entry: Object.freeze({ single: 1.1, leaf: 1, head: 2.3 }),
      grand: 14,
      bays: 1,
      slot: [1.9, 2.5],
      tall: [0.25, 2.6],
      porch: [2.1, 1.3],
      recess: null,
      terrace: 1.2,
      cut: 1.5,
      out: [1, 0.8],
      jut: [2.4, 4],
      canopy: [1.6, 0.15],
      carport: [3.4, 5.6, 2.3],
      balcony: [3.4, 1.3, 0.15],
      pergola: [3.6, 3.2, 2.45, 0.6],
      bay: [2.6, 5, 2.4],
      veranda: [3, 0.14],
      portico: [2.2, 0.2],
      garage: [6.8, 7, 3],
      reach: 10
    }),
    game: scaleOf2({
      name: "game",
      storey: 4,
      head: 2.7,
      flights: [10, 9],
      flight: 2.8,
      lane: 2,
      landing: 2,
      shaft: 2.3,
      door: 1.4,
      leaf: 1.2,
      entry: Object.freeze({ single: 1.8, leaf: 1.4, head: 3 }),
      grand: 22,
      bays: 1.5,
      slot: [2.3, 2.9],
      tall: [0.25, 3.1],
      porch: [0, 1.6],
      recess: [1, 3],
      terrace: 1.8,
      cut: 2.4,
      out: [1.5, 1.2],
      jut: [3.6, 6],
      canopy: null,
      carport: [4.8, 7.8, 2.9],
      balcony: [5, 2, 0.15],
      pergola: [5.4, 4.5, 3, 0.9],
      bay: [4.5, 8, 3.6],
      veranda: [4.5, 0.2],
      portico: [3.2, 0.3],
      garage: [9.6, 9.5, 4.4],
      reach: 14,
      least: [11, 12.5]
    })
  });
  SCALE_NAMES = Object.freeze(Object.keys(SCALES));
  SIDES5 = Object.freeze({
    front: { along: 0, at: (r) => r.y1, out: 1, yaw: 0 },
    back: { along: 0, at: (r) => r.y0, out: -1, yaw: 180 },
    right: { along: 1, at: (r) => r.x1, out: 1, yaw: -90 },
    left: { along: 1, at: (r) => r.x0, out: -1, yaw: 90 }
  });
  SIDE_NAMES = Object.freeze(Object.keys(SIDES5));
});

// src/build/kinds/room-house.js
var WALL2 = 0.25, PART2 = 0.12, BEYOND = 2.2, HAND2 = 0.3, STEP3 = 0.05, round6 = (v) => Math.round(v * 1000) / 1000, rect = (x0, y0, x1, y1) => [Math.min(x0, x1), Math.min(y0, y1), Math.max(x0, x1), Math.max(y0, y1)], wallsOf = (plan, k) => [...plan.storeys[k].walls, ...plan.entryWalls.filter(() => k === 0), ...plan.partitions.filter((each) => each.storey === k)].map((wall) => {
  const thick = wall.thick ?? WALL2;
  const [f0, f1] = [wall.at - wall.out * thick, wall.at].sort((a, b) => a - b);
  return { ...wall, band: [f0, f1] };
}), roomPart = (plan, room2, { palette = 0, variant = 0, tall, legs, stout, fabric = 0, wood = 0 } = {}) => {
  const k = room2.storey;
  const { floor } = plan.storeys[k];
  const walls = wallsOf(plan, k);
  const [cx, cy] = [(room2.x0 + room2.x1) / 2, (room2.y0 + room2.y1) / 2];
  const [W, D] = [room2.x1 - room2.x0, room2.y1 - room2.y0];
  const local = ([x0, y0, x1, y1]) => rect(x0 - cx, y0 - cy, x1 - cx, y1 - cy).map(round6);
  const wide = plan.measures.rooms.inner[0];
  const solids = [], windows = [], keep = [], closed = [], ways = [];
  const sides = [
    { side: 0, along: 0, line: room2.y0, out: -1, from: room2.x0, to: room2.x1 },
    { side: 1, along: 1, line: room2.x1, out: 1, from: room2.y0, to: room2.y1 },
    { side: 2, along: 0, line: room2.y1, out: 1, from: room2.x0, to: room2.x1 },
    { side: 3, along: 1, line: room2.x0, out: -1, from: room2.y0, to: room2.y1 }
  ];
  for (const { side: side2, along: along2, line, out, from, to } of sides) {
    const probe = line + out * 0.04;
    const runs = { wall: [], window: [], way: [], open: [] };
    for (let a = from + STEP3 / 2;a < to; a += STEP3) {
      const wall = walls.find((each) => each.along === along2 && probe > each.band[0] - 0.000001 && probe < each.band[1] + 0.000001 && a > each.a0 && a < each.a1);
      const opening = wall?.openings.find((o) => a > o.a0 && a < o.a1);
      const through = opening?.door || opening?.void || opening?.slide?.walk;
      const kind = !wall ? "open" : through ? "way" : opening ? "window" : "wall";
      const sill = opening && !through ? opening.z0 - floor : null;
      const last = runs[kind].at(-1);
      if (last && Math.abs(last.a1 - (a - STEP3 / 2)) < 0.000001 && last.sill === sill)
        last.a1 = a + STEP3 / 2;
      else
        runs[kind].push({ a0: a - STEP3 / 2, a1: a + STEP3 / 2, sill });
      if (kind === "window") {
        const before = runs.wall.at(-1);
        if (before && Math.abs(before.a1 - (a - STEP3 / 2)) < 0.000001)
          before.a1 = a + STEP3 / 2;
        else
          runs.wall.push({ a0: a - STEP3 / 2, a1: a + STEP3 / 2 });
      }
    }
    const shift = along2 === 0 ? cx : cy;
    for (const run of runs.wall.filter((run2) => run2.a1 - run2.a0 >= 0.4))
      solids.push([side2, round6(run.a0 - shift), round6(run.a1 - shift)]);
    for (const run of runs.window)
      windows.push([side2, round6(run.a0 - shift), round6(run.a1 - shift), round6(run.sill)]);
    const across = along2 === 0 ? D : W;
    for (const run of runs.way.filter((run2) => run2.a1 - run2.a0 >= 0.6)) {
      const [a0, a1, deep] = [run.a0 - HAND2, run.a1 + HAND2, Math.min(wide, across * 0.45)];
      const landing = local(along2 === 0 ? [a0, line, a1, line - out * deep] : [line, a0, line - out * deep, a1]);
      keep.push(landing);
      ways.push(landing);
    }
    for (const run of runs.open.filter((run2) => run2.a1 - run2.a0 >= 0.6)) {
      const deep = Math.min(wide, across * 0.45);
      ways.push(local(along2 === 0 ? [run.a0, line, run.a1, line - out * deep] : [line, run.a0, line - out * deep, run.a1]));
    }
  }
  if (plan.stairs.length && (k < plan.floors - 1 || k > 0)) {
    const { hole } = plan;
    const beside = plan.dir > 0 ? [hole.x1, hole.x1 + Math.max(2.2, wide)] : [hole.x0 - Math.max(2.2, wide), hole.x0];
    closed.push(local(rect(hole.x0, hole.y0, hole.x1, hole.y1)));
    const by = local(rect(beside[0], hole.y0, beside[1], hole.y1));
    keep.push(by, local(rect(Math.min(hole.x0, beside[0]), hole.y1, Math.max(hole.x1, beside[1]), hole.y1 + BEYOND)));
    ways.push(by);
  }
  if (plan.shaft) {
    const { x0, x1, y0, y1, entry, dir } = plan.shaft;
    closed.push(local(rect(x0, y0, x1, y1)));
    const before = local(rect(entry, y0 - 0.3, entry + dir * Math.max(2.2, wide), y1 + 0.3));
    keep.push(before);
    ways.push(before);
  }
  if (k === 0 && plan.entry.recess) {
    const { x0, x1, y } = plan.entry.recess;
    closed.push(local(rect(x0 - WALL2 - 0.1, y - WALL2 - 0.1, x1 + WALL2 + 0.1, plan.rects[0].y1)));
    const behind = local(rect(plan.entry.from - 0.8, y - WALL2 - 3, plan.entry.from + plan.entry.width + 0.8, y - WALL2));
    keep.push(behind);
    ways.push(behind);
  }
  for (const { at, storey } of plan.switches.filter((each) => each.storey === k))
    keep.push(local(rect(at[0] - 0.45, at[1] - 0.45, at[0] + 0.45, at[1] + 0.45)));
  for (const other of plan.rooms.filter((each) => each !== room2 && each.storey === k)) {
    const inside = other.x0 >= room2.x0 - 0.000001 && other.x1 <= room2.x1 + 0.000001 && other.y0 >= room2.y0 - 0.000001 && other.y1 <= room2.y1 + 0.000001;
    if (inside)
      closed.push(local(rect(other.x0 - PART2, other.y0 - PART2, other.x1 + PART2, other.y1 + PART2)));
  }
  const inRoom = (list) => list.map(([x0, y0, x1, y1]) => [Math.max(x0, -W / 2), Math.max(y0, -D / 2), Math.min(x1, W / 2), Math.min(y1, D / 2)].map(round6)).filter(([x0, y0, x1, y1]) => x1 - x0 > 0.05 && y1 - y0 > 0.05);
  const shut = inRoom(closed);
  const open = inRoom(ways).filter(([x0, y0, x1, y1]) => !shut.some(([p0, q0, p1, q1]) => x0 >= p0 - 0.000001 && y0 >= q0 - 0.000001 && x1 <= p1 + 0.000001 && y1 <= q1 + 0.000001));
  const type = ROOM_TYPES.indexOf(room2.type);
  const dines = room2.type === "living" && !plan.rooms.some((each) => each.storey === k && each.type === "dining") ? 1 : 0;
  return {
    at: [round6(cx), round6(cy), round6(floor)],
    params: { type: Math.max(0, type), palette: palette % PALETTE_NAMES.length, variant, dines, width: round6(W), depth: round6(D), height: round6(plan.measures.clear), walls: solids, windows, way: wide, ways: open, keep: inRoom(keep), closed: shut, ...shapeOf({ tall, legs, stout }), ...fabric && { fabric }, ...wood && { wood } }
  };
}, roomParts = (plan, { palette = 0, variant = 0 } = {}) => plan.rooms.map((room2, i) => roomPart(plan, room2, {
  palette,
  variant: (variant * 31 + i) % 1e4,
  wood: pickOf(variant, 1, WOOD_NAMES.length),
  tall: pickOf(variant, 2, 5) / 4,
  legs: pickOf(variant, 3, 5) / 4,
  stout: pickOf(variant, 4, 5) / 4,
  fabric: pickOf(variant * 31 + i, 5, FABRIC_NAMES.length)
})), pickOf = (seed, turn3, n) => {
  let t = Math.imul(seed + 1, 2654435761) ^ Math.imul(turn3, 2246822507);
  t = Math.imul(t ^ t >>> 15, 739982445);
  t = Math.imul(t ^ t >>> 12, 695872825);
  return ((t ^ t >>> 15) >>> 0) % n;
}, shapeOf = (shape) => Object.fromEntries(["tall", "legs", "stout"].filter((name) => Number.isFinite(shape[name]) && shape[name] !== 0.5).map((name) => [name, shape[name]])), BODY, FURNISHED, furnishedRooms = (plan, options) => roomParts(plan, options).map(({ at, params }) => {
  const faces = Object.fromEntries(LOOKS4[ROOM_TYPES[params.type]][PALETTE_NAMES[params.palette]].map((texture, face2) => [face2, { texture }]));
  for (const [face2, tint] of Object.entries(tintsFor(params, ROOM_CLOTH, ROOM_FACES.length, { faces })))
    faces[face2].tint = tint;
  return { kind: "room", params, size: [params.width, params.depth, params.height], at: [at[0], at[1], round6(at[2] + params.height / 2)], color: [...BODY], surface: { faces } };
});
var init_room_house = __esm(() => {
  init_room();
  init_furniture();
  BODY = [0.6, 0.6, 0.6];
  FURNISHED = Object.freeze({ parts: 90, triangles: 24000 });
});

// src/build/kinds/house-gen.js
var exports_house_gen = {};
__export(exports_house_gen, {
  default: () => house_gen_default
});
var WALLS, TRIM, GLASS2, ROOFING, FLOORS, INSIDE, ORIGIN, PANE3 = 0.02, BAR, SASH, CAP5, STEP_UNDER = 0.12, upToMillimetre4 = (v) => Math.ceil(v * 1000 - 0.000001) / 1000, between = (outline2, lo, hi) => [[lo, 1], [hi, -1]].reduce((points, [at, sign]) => points.flatMap((p, i) => {
  const q = points[(i + 1) % points.length];
  const [pin, qin] = [(p[0] - at) * sign >= -0.000000001, (q[0] - at) * sign >= -0.000000001];
  const cut2 = () => [at, p[1] + (q[1] - p[1]) * (at - p[0]) / (q[0] - p[0])];
  return pin ? qin ? [p] : [p, cut2()] : qin ? [cut2()] : [];
}), outline2), area23 = (outline2) => Math.abs(outline2.reduce((sum, p, i) => sum + p[0] * outline2[(i + 1) % outline2.length][1] - outline2[(i + 1) % outline2.length][0] * p[1], 0)), planOf3, centreOf5 = (params) => {
  const { min, max } = planOf3(params);
  return min.map((v, k) => (v + max[k]) / 2);
}, stations = (values) => [...new Set(values.map((v) => Math.round(v * 1000) / 1000))].sort((a, b) => a - b), stepsOf2 = ({ floor, wallX, dir, y0, lane, landing, hole, rise, flights: [up, on], flight }) => {
  const span = (t0, t1) => [wallX + dir * t0, wallX + dir * t1].sort((a, b) => a - b);
  const boxes = [];
  const going = [flight / up, flight / on];
  for (let i = 1;i <= up; i++) {
    const [x0, x1] = span(hole[0] - i * going[0], hole[0] - (i - 1) * going[0]);
    boxes.push({ min: [x0, y0 + hole[1] - lane, floor + (i - 1) * rise - STEP_UNDER], max: [x1, y0 + hole[1], floor + i * rise] });
  }
  const [l0, l1] = span(0, landing);
  boxes.push({ min: [l0, y0, floor + (up + 1) * rise - 0.2], max: [l1, y0 + hole[1], floor + (up + 1) * rise] });
  for (let j = 1;j <= on; j++) {
    const [x0, x1] = span(landing + (j - 1) * going[1], landing + j * going[1]);
    boxes.push({ min: [x0, y0, floor + (up + j) * rise - STEP_UNDER], max: [x1, y0 + lane, floor + (up + 1 + j) * rise] });
  }
  return boxes;
}, capFaces = ({ x0, x1, y0, y1, z0, half, slope, rise }) => {
  const [along2, top] = [x1 - x0 >= y1 - y0, z0 + rise];
  const [r0, r1] = along2 ? [[x0 + half, (y0 + y1) / 2, top], [x1 - half, (y0 + y1) / 2, top]] : [[(x0 + x1) / 2, y0 + half, top], [(x0 + x1) / 2, y1 - half, top]];
  const ridge = Math.hypot(r1[0] - r0[0], r1[1] - r0[1]) > 0.000001 ? [r0, r1] : [r0];
  const [a, b, c, d] = [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]];
  return along2 ? [
    { points: [a, b, ...ridge.toReversed()], outward: [0, -slope, 1] },
    { points: [c, d, ...ridge], outward: [0, slope, 1] },
    { points: [d, a, r0], outward: [-slope, 0, 1] },
    { points: [b, c, r1], outward: [slope, 0, 1] }
  ] : [
    { points: [d, a, ...ridge], outward: [-slope, 0, 1] },
    { points: [b, c, ...ridge.toReversed()], outward: [slope, 0, 1] },
    { points: [a, b, r0], outward: [0, -slope, 1] },
    { points: [c, d, r1], outward: [0, slope, 1] }
  ];
}, piecesOf2 = ({ rect: rect2, holes }) => {
  if (!holes.length)
    return [[rect2.x0, rect2.x1, rect2.y0, rect2.y1]];
  const xs = stations([rect2.x0, rect2.x1, ...holes.flatMap((hole) => [hole.x0, hole.x1])]);
  const ys = stations([rect2.y0, rect2.y1, ...holes.flatMap((hole) => [hole.y0, hole.y1])]);
  const pieces = [];
  for (let j = 0;j < ys.length - 1; j++)
    for (let i = 0;i < xs.length - 1; i++) {
      const [x, y] = [(xs[i] + xs[i + 1]) / 2, (ys[j] + ys[j + 1]) / 2];
      if (holes.some((hole) => x > hole.x0 && x < hole.x1 && y > hole.y0 && y < hole.y1))
        continue;
      const last = pieces.at(-1);
      if (last && last[1] === xs[i] && last[2] === ys[j])
        last[1] = xs[i + 1];
      else
        pieces.push([xs[i], xs[i + 1], ys[j], ys[j + 1]]);
    }
  return pieces;
}, shaftBoxes = (shaft, floors, thick, { storey, head }) => {
  const [e0, e1] = [shaft.entry - thick / 2, shaft.entry + thick / 2];
  return [
    { min: [shaft.x0, shaft.y0 - thick / 2, 0], max: [shaft.x1, shaft.y0 + thick / 2, shaft.top] },
    { min: [shaft.x0, shaft.y1 - thick / 2, 0], max: [shaft.x1, shaft.y1 + thick / 2, shaft.top] },
    ...Array.from({ length: floors }, (_, k) => ({ min: [e0, shaft.y0, k * storey + head], max: [e1, shaft.y1, Math.min((k + 1) * storey, shaft.top)] }))
  ];
}, railBox = ({ from, to }, thick, z0, z1) => ({
  min: [Math.min(from[0], to[0]) - (from[0] === to[0] ? thick / 2 : 0), Math.min(from[1], to[1]) - (from[1] === to[1] ? thick / 2 : 0), z0],
  max: [Math.max(from[0], to[0]) + (from[0] === to[0] ? thick / 2 : 0), Math.max(from[1], to[1]) + (from[1] === to[1] ? thick / 2 : 0), z1]
}), ringOf = ({ rect: rect2, z0, z1 }) => [
  { side: "front", min: [rect2.x0, rect2.y1 - WALL, z0], max: [rect2.x1, rect2.y1, z1] },
  { side: "back", min: [rect2.x0, rect2.y0, z0], max: [rect2.x1, rect2.y0 + WALL, z1] },
  { side: "left", min: [rect2.x0, rect2.y0 + WALL, z0], max: [rect2.x0 + WALL, rect2.y1 - WALL, z1] },
  { side: "right", min: [rect2.x1 - WALL, rect2.y0 + WALL, z0], max: [rect2.x1, rect2.y1 - WALL, z1] }
], wallBox = ({ along: along2, at, out, thick = WALL }, a0, a1, z0, z1) => {
  const [f0, f1] = [at - out * thick, at].sort((a, b) => a - b);
  return along2 === 0 ? { min: [a0, f0, z0], max: [a1, f1, z1] } : { min: [f0, a0, z0], max: [f1, a1, z1] };
}, porchBoxes = (porch) => [
  ...porch.y1 - porch.y0 > 0.01 ? [{ min: [porch.x0, porch.y0, porch.bottom], max: [porch.x1, porch.y1, 0] }] : [],
  ...porch.steps.map((step) => ({ min: [porch.across?.[0] ?? porch.x0, step.y0, porch.bottom], max: [porch.across?.[1] ?? porch.x1, step.y1, step.top] }))
], fenceBox = ({ along: along2, a0, a1, at, z, r }) => along2 === 0 ? { min: [a0, at - r, 0], max: [a1, at + r, z + r] } : { min: [at - r, a0, 0], max: [at + r, a1, z + r] }, build = (plan, level) => {
  const mesh = createMesh(7);
  const uvOf = (p, n) => boxUv(p, n, ORIGIN, 1, 1);
  const windowUv = marked(uvOf);
  const plate = (slot, axis, sign, at, min, max, uvs = uvOf) => {
    const [a, b] = [(axis + 1) % 3, (axis + 2) % 3];
    const corner = (s, t) => {
      const p = [0, 0, 0];
      p[axis] = at;
      p[a] = s ? max[a] : min[a];
      p[b] = t ? max[b] : min[b];
      return p;
    };
    const normal = [0, 0, 0];
    normal[axis] = sign;
    const corners = sign > 0 ? [corner(0, 0), corner(1, 0), corner(1, 1), corner(0, 1)] : [corner(0, 0), corner(0, 1), corner(1, 1), corner(1, 0)];
    const [p0, p1, p2, p3] = corners.map((p) => mesh.vertex(slot, p, normal, uvs(p, normal)));
    mesh.quad(slot, p0, p1, p2, p3);
  };
  const box = ({ min, max }, slotOf) => {
    for (let axis = 0;axis < 3; axis++)
      for (const sign of [-1, 1]) {
        const slot = slotOf(axis, sign);
        if (slot !== null)
          plate(slot, axis, sign, sign > 0 ? max[axis] : min[axis], min, max);
      }
  };
  const all = (slot) => () => slot;
  const capped = (top, sides) => (axis, sign) => axis === 2 ? sign > 0 ? top : null : sides;
  const pitched = Boolean(plan.roof.outline);
  const wall = (each) => {
    const { along: along2, out, at, a0, a1, inner, z0, z1, slot, openings, accent = null, ends = null, thick = WALL, reveal = TRIM } = each;
    const across = 1 - along2;
    const inside = at - out * thick;
    const as = stations([a0, a1, ...inner, ...accent ?? [], ...openings.flatMap((o) => [o.a0, o.a1])]);
    const dressed = (a) => accent && a > accent[0] && a < accent[1] ? 1 - slot : slot;
    const zs = stations([z0, z1, ...openings.flatMap((o) => [o.z0, o.z1])]);
    const point = (a, f, z) => along2 === 0 ? [a, f, z] : [f, a, z];
    for (let i = 0;i < as.length - 1; i++)
      for (let j = 0;j < zs.length - 1; j++) {
        const [ma, mz] = [(as[i] + as[i + 1]) / 2, (zs[j] + zs[j + 1]) / 2];
        if (openings.some((o) => ma > o.a0 && ma < o.a1 && mz > o.z0 && mz < o.z1))
          continue;
        plate(dressed(ma), across, out, at, point(as[i], 0, zs[j]), point(as[i + 1], 0, zs[j + 1]));
        if (level > 0 && ma > inner[0] && ma < inner[1])
          plate(INSIDE, across, -out, inside, point(as[i], 0, zs[j]), point(as[i + 1], 0, zs[j + 1]));
      }
    const [f0, f1] = [Math.min(at, inside), Math.max(at, inside)];
    if (along2 === 0 || each.partition)
      for (const [a, sign, end] of [[a0, -1, 0], [a1, 1, 1]])
        plate(ends?.[end] ?? slot, along2, sign, a, point(0, f0, z0), point(0, f1, z1));
    if (pitched && each.storey === plan.floors - 1 && level > 0)
      plate(INSIDE, 2, 1, z1, point(a0, f0, 0), point(a1, f1, 0));
    for (const o of openings) {
      if (o.void) {
        if (level > 0)
          for (const [a, sign] of [[o.a0, 1], [o.a1, -1]])
            plate(dressed(a - sign * 0.01), along2, sign, a, point(0, f0, o.z0), point(0, f1, o.z1));
        continue;
      }
      if (level === 0) {
        if (!o.door)
          plate(GLASS2, across, out, at, point(o.a0, 0, o.z0), point(o.a1, 0, o.z1), windowUv);
        continue;
      }
      plate(reveal, along2, 1, o.a0, point(0, f0, o.z0), point(0, f1, o.z1));
      plate(reveal, along2, -1, o.a1, point(0, f0, o.z0), point(0, f1, o.z1));
      if (o.z0 > z0)
        plate(reveal, 2, 1, o.z0, point(o.a0, f0, 0), point(o.a1, f1, 0));
      if (o.z1 < z1)
        plate(reveal, 2, -1, o.z1, point(o.a0, f0, 0), point(o.a1, f1, 0));
      if (o.door)
        continue;
      const middle = (at + inside) / 2;
      for (const [g0, g1] of o.slide ? [[o.a0, o.slide.a0], [o.slide.a1, o.a1]].filter(([p, q]) => q - p > 0.000001) : [[o.a0, o.a1]]) {
        plate(GLASS2, across, out, middle + out * PANE3 / 2, point(g0, 0, o.z0), point(g1, 0, o.z1), windowUv);
        plate(GLASS2, across, -out, middle - out * PANE3 / 2, point(g0, 0, o.z0), point(g1, 0, o.z1), windowUv);
      }
      if (level < 3)
        continue;
      const [b0, b1] = [middle + out * BAR[1], middle + out * BAR[2]].sort((p, q) => p - q);
      for (let n = 1;n <= o.bars; n++) {
        const a = o.a0 + (o.a1 - o.a0) * n / (o.bars + 1);
        box({ min: point(a - BAR[0] / 2, b0, o.z0), max: point(a + BAR[0] / 2, b1, o.z1) }, (axis) => axis === 2 ? null : TRIM);
      }
    }
  };
  for (const storey of plan.storeys)
    storey.walls.forEach(wall);
  plan.raised.forEach(wall);
  plan.entryWalls.forEach(wall);
  plan.bayWalls.forEach(wall);
  plan.wingWalls.forEach(wall);
  if (level > 0)
    plan.partitions.forEach(wall);
  for (const slab of plan.slabs) {
    const { rect: rect2, top, bottom, holes } = slab;
    const [lo, hi] = [[rect2.x0, rect2.y0, bottom], [rect2.x1, rect2.y1, top]];
    for (const [x0, x1, y0, y1] of piecesOf2(slab)) {
      plate(slab.kind === "roof" ? ROOFING : slab.face ?? FLOORS, 2, 1, top, [x0, y0, 0], [x1, y1, 0]);
      if (slab.kind !== "base")
        plate(INSIDE, 2, -1, bottom, [x0, y0, 0], [x1, y1, 0]);
    }
    for (const [axis, sign, at] of [[0, -1, rect2.x0], [0, 1, rect2.x1], [1, -1, rect2.y0], [1, 1, rect2.y1]])
      plate(slab.edge ?? TRIM, axis, sign, at, lo, hi);
    if (level > 0)
      for (const hole of holes)
        for (const [axis, sign, at] of [[0, 1, hole.x0], [0, -1, hole.x1], [1, 1, hole.y0], [1, -1, hole.y1]])
          plate(TRIM, axis, sign, at, [hole.x0, hole.y0, bottom], [hole.x1, hole.y1, top]);
  }
  if (plan.parapet) {
    for (const piece of ringOf(plan.parapet)) {
      const ends = piece.side === "front" || piece.side === "back";
      box(piece, (axis, sign) => axis === 2 ? sign > 0 ? TRIM : null : ends || axis === 0 ? plan.parapet.slot : null);
    }
  }
  if (pitched) {
    const { rect: rect2, parts, gables, slot, glazed } = plan.roof;
    for (const [x0, x1, outline2] of parts)
      addExtrusion(mesh, outline2, 0, x0, x1, TRIM, (normal) => normal[2] > 0.1 ? ROOFING : normal[2] < -0.1 ? INSIDE : TRIM, uvOf);
    for (const gable of gables)
      for (const [x0, x1, side2] of [[rect2.x0, rect2.x0 + WALL, "left"], [rect2.x1 - WALL, rect2.x1, "right"]]) {
        if (glazed?.side !== side2) {
          addExtrusion(mesh, gable, 0, x0, x1, slot, () => slot, uvOf);
          continue;
        }
        const middle = (x0 + x1) / 2;
        for (const [lo, hi, glass] of [[-Infinity, glazed.y0, false], [glazed.y0, glazed.y1, true], [glazed.y1, Infinity, false]]) {
          const piece = between(gable, lo, hi);
          if (piece.length < 3 || area23(piece) < 0.0001)
            continue;
          if (glass)
            addExtrusion(mesh, piece, 0, middle - PANE3 / 2, middle + PANE3 / 2, GLASS2, () => GLASS2, windowUv);
          else
            addExtrusion(mesh, piece, 0, x0, x1, slot, () => slot, uvOf);
        }
      }
    if (glazed && level >= 3) {
      const out = glazed.side === "left" ? -1 : 1;
      const middle = (glazed.side === "left" ? rect2.x0 : rect2.x1) - out * WALL / 2;
      const [b0, b1] = [middle + out * BAR[1], middle + out * BAR[2]].sort((p, q) => p - q);
      const foot = gables[0][0][1];
      const bars = Math.max(0, Math.round((glazed.y1 - glazed.y0) / (1.5 * plan.measures.bays)) - 1);
      for (let n = 1;n <= bars; n++) {
        const y = glazed.y0 + (glazed.y1 - glazed.y0) * n / (bars + 1);
        const top = Math.min(plan.roof.under(y - BAR[0] / 2), plan.roof.under(y + BAR[0] / 2));
        if (top - foot > 0.05)
          box({ min: [b0, y - BAR[0] / 2, foot], max: [b1, y + BAR[0] / 2, top] }, (axis) => axis === 2 ? null : TRIM);
      }
      box({ min: [b0, glazed.y0, foot - BAR[0] / 2], max: [b1, glazed.y1, foot + BAR[0] / 2] }, (axis) => axis === 1 ? null : TRIM);
    }
  }
  if (plan.roof.cap)
    for (const { points, outward } of capFaces(plan.roof.cap))
      mesh.polygon(ROOFING, points, outward, uvOf);
  if (plan.portico) {
    const sides = level >= 2 ? 10 : 6;
    for (const { x, y, r, z0: z02, z1 } of plan.portico.columns) {
      const ring = Array.from({ length: sides }, (_, i) => [x + r * Math.cos(2 * Math.PI * i / sides), y + r * Math.sin(2 * Math.PI * i / sides)]);
      ring.forEach((p, i) => {
        const q = ring[(i + 1) % sides];
        mesh.polygon(TRIM, [[...p, z02], [...q, z02], [...q, z1], [...p, z1]], [(p[0] + q[0]) / 2 - x, (p[1] + q[1]) / 2 - y, 0], uvOf);
      });
      if (level >= 2)
        for (const [from, to] of [[z02, z02 + 0.25], [z1 - 0.2, z1]])
          box({ min: [x - r - 0.08, y - r - 0.08, from], max: [x + r + 0.08, y + r + 0.08, to] }, (axis) => axis === 2 && (to === z1 || from === z02) ? to === z1 ? TRIM : null : TRIM);
    }
    const { x0, x1, y0, y1, z0, rise, slot } = plan.portico.pediment;
    addExtrusion(mesh, [[z0, x0], [z0, x1], [z0 + rise, (x0 + x1) / 2]], 1, y0, y1, slot, (normal) => normal[2] > 0.1 ? ROOFING : TRIM, uvOf);
  }
  if (plan.timber) {
    const sides = level >= 2 ? 8 : level === 1 ? 6 : 4;
    for (const { x, y, r, z0, z1 } of plan.timber.posts) {
      const ring = Array.from({ length: sides }, (_, i) => [x + r * Math.cos(2 * Math.PI * (i + 0.5) / sides), y + r * Math.sin(2 * Math.PI * (i + 0.5) / sides)]);
      ring.forEach((p, i) => {
        const q = ring[(i + 1) % sides];
        mesh.polygon(TRIM, [[...p, z0], [...q, z0], [...q, z1], [...p, z1]], [(p[0] + q[0]) / 2 - x, (p[1] + q[1]) / 2 - y, 0], uvOf);
      });
    }
    if (level >= 2)
      for (const { along: along2, a0, a1, at, z, r } of plan.timber.logs) {
        const point = (a, i) => {
          const [c, s] = [at + r * Math.cos(2 * Math.PI * (i + 0.5) / 6), z + r * Math.sin(2 * Math.PI * (i + 0.5) / 6)];
          return along2 === 0 ? [a, c, s] : [c, a, s];
        };
        for (let i = 0;i < 6; i++) {
          const [mc, ms] = [Math.cos(2 * Math.PI * (i + 1) / 6), Math.sin(2 * Math.PI * (i + 1) / 6)];
          mesh.polygon(TRIM, [point(a0, i), point(a1, i), point(a1, i + 1), point(a0, i + 1)], along2 === 0 ? [0, mc, ms] : [mc, 0, ms], uvOf);
        }
        for (const [a, sign] of [[a0, -1], [a1, 1]])
          mesh.polygon(TRIM, Array.from({ length: 6 }, (_, i) => point(a, i)), along2 === 0 ? [sign, 0, 0] : [0, sign, 0], uvOf);
      }
  }
  if (plan.bay?.vault) {
    const { x0, x1, y1, vault } = plan.bay;
    const { points, back, under, front, thick, meets, glass, at, base, behind, wall: face2, cheek, walls: top, slot } = vault;
    const strips = points.length - 1;
    for (let i = 0;i < strips; i++) {
      const [[xa, za], [xb, zb]] = [points[i], points[i + 1]];
      const up = [za - zb, 0, xb - xa];
      mesh.polygon(ROOFING, [[xa, back[i], za], [xb, back[i + 1], zb], [xb, front, zb], [xa, front, za]], up, uvOf);
      if (level > 0)
        mesh.polygon(INSIDE, [[xa, under[i], za - thick], [xb, under[i + 1], zb - thick], [xb, front, zb - thick], [xa, front, za - thick]], up.map((v) => -v), uvOf);
      mesh.polygon(TRIM, [[xa, front, za - thick], [xb, front, zb - thick], [xb, front, zb], [xa, front, za]], [0, 1, 0], uvOf);
      if (!meets)
        mesh.polygon(TRIM, [[xa, back[i], za - thick], [xb, back[i + 1], zb - thick], [xb, back[i + 1], zb], [xa, back[i], za]], [0, -1, 0], uvOf);
    }
    for (const [i, sign] of [[0, -1], [strips, 1]]) {
      const [x, z] = points[i];
      mesh.polygon(TRIM, [[x, back[i], z], [x, front, z], [x, front, z - thick], [x, under[i], z - thick]], [sign, 0, 0], uvOf);
    }
    const [l, r] = [x0 + WALL, x1 - WALL];
    const arch2 = points.filter(([x]) => x > l && x < r).map(([x, z]) => [x, z - thick]);
    const shut = (y, foot, sign, face3, uvs = uvOf) => mesh.polygon(face3, [[l, y, foot], ...foot < top ? [[l, y, top]] : [], ...arch2.map(([x, z]) => [x, y, z]), ...foot < top ? [[r, y, top]] : [], [r, y, foot]], [0, sign, 0], uvs);
    shut(y1, top, 1, glass ? GLASS2 : slot, glass ? windowUv : uvOf);
    if (level > 0)
      shut(y1 - WALL, top, -1, glass ? GLASS2 : INSIDE, glass ? windowUv : uvOf);
    if (level > 0)
      shut(at, base, 1, face2);
    if (!meets)
      shut(at - WALL, behind, -1, face2);
    if (cheek)
      for (const [x, sign] of [[x0, -1], [x1, 1]])
        mesh.polygon(slot, [[x, cheek.back, cheek.z], [x, at, cheek.z], [x, at, cheek.foot]], [sign, 0, 0], uvOf);
  }
  for (const rail of plan.rails) {
    if (rail.inside && level === 0)
      continue;
    box(railBox(rail, PANE3, rail.z, rail.z + RAIL4), (axis) => axis === 2 ? null : GLASS2);
    if (level >= 2)
      box(railBox(rail, CAP5[0], rail.z + RAIL4, rail.z + RAIL4 + CAP5[1]), all(TRIM));
  }
  if (plan.shaft && level > 0)
    for (const pane of shaftBoxes(plan.shaft, plan.floors, PANE3, plan.measures))
      box(pane, (axis) => axis === 2 ? null : GLASS2);
  if (level >= 2)
    for (const stair of plan.stairs)
      for (const step of stepsOf2(stair))
        box(step, all(FLOORS));
  for (const piece of porchBoxes(plan.porch))
    box(piece, capped(FLOORS, TRIM));
  if (plan.wing) {
    const { x0, x1, y0, y1, drop, bottom } = plan.wing.ramp;
    addExtrusion(mesh, [[y0, 0], [y1, -drop], [y1, bottom], [y0, bottom]], 0, x0, x1, TRIM, () => TRIM, uvOf);
  }
  for (const extra of plan.extras)
    if (level >= extra.level)
      box(extra, (axis, sign) => axis === 2 ? sign > 0 ? extra.top : extra.bottom : extra.side);
  return mesh;
}, solids = (plan) => {
  const boxes = [];
  const hulls = [];
  for (const each of [...plan.storeys.flatMap((storey) => storey.walls), ...plan.raised, ...plan.entryWalls, ...plan.bayWalls, ...plan.wingWalls, ...plan.partitions]) {
    const ways = each.openings.flatMap((o) => o.door || o.void ? [{ a0: o.a0, a1: o.a1, z1: o.z1 }] : o.slide?.walk ? [{ a0: o.slide.a0, a1: o.slide.a1, z1: o.z1 }] : []);
    let from = each.a0;
    for (const door2 of ways) {
      if (door2.a0 > from)
        boxes.push(wallBox(each, from, door2.a0, each.z0, each.z1));
      if (door2.z1 < each.z1 && !each.partition)
        boxes.push(wallBox(each, door2.a0, door2.a1, door2.z1, each.z1));
      from = door2.a1;
    }
    if (each.a1 > from)
      boxes.push(wallBox(each, from, each.a1, each.z0, each.z1));
  }
  for (const slab of plan.slabs)
    for (const [x0, x1, y0, y1] of piecesOf2(slab))
      boxes.push({ min: [x0, y0, slab.bottom], max: [x1, y1, slab.top] });
  if (plan.parapet)
    boxes.push(...ringOf(plan.parapet));
  for (const rail of plan.rails)
    boxes.push(railBox(rail, 0.06, rail.z, rail.z + RAIL4));
  for (const stair of plan.stairs)
    boxes.push(...stepsOf2(stair));
  if (plan.shaft)
    boxes.push(...shaftBoxes(plan.shaft, plan.floors, 0.06, plan.measures));
  boxes.push(...porchBoxes(plan.porch));
  if (plan.timber)
    boxes.push(...plan.timber.posts.map(({ x, y, r, z0, z1 }) => ({ min: [x - r, y - r, z0], max: [x + r, y + r, z1] })), ...plan.timber.logs.filter((log) => log.fence).map(fenceBox));
  boxes.push(...plan.extras.filter((extra) => extra.solid).map(({ min, max }) => ({ min, max })));
  if (plan.roof.outline) {
    const { rect: rect2, parts, gables } = plan.roof;
    const prism = (points, x0, x1) => hulls.push({ points: points.flatMap(([y, z]) => [[x0, y, z], [x1, y, z]]) });
    for (const [x0, x1, outline2] of parts) {
      const count = outline2.length / 2;
      for (let i = 0;i < count - 1; i++)
        prism([outline2[i], outline2[i + 1], outline2[outline2.length - 2 - i], outline2[outline2.length - 1 - i]], x0, x1);
    }
    for (const gable of gables)
      for (const [x0, x1] of [[rect2.x0, rect2.x0 + WALL], [rect2.x1 - WALL, rect2.x1]])
        prism(gable, x0, x1);
  }
  if (plan.portico) {
    for (const { x, y, r, z0: z02, z1 } of plan.portico.columns)
      boxes.push({ min: [x - r, y - r, z02], max: [x + r, y + r, z1] });
    const { x0, x1, y0, y1, z0, rise } = plan.portico.pediment;
    hulls.push({ points: [y0, y1].flatMap((y) => [[x0, y, z0], [x1, y, z0], [(x0 + x1) / 2, y, z0 + rise]]) });
  }
  if (plan.roof.cap)
    hulls.push({ points: [...new Map(capFaces(plan.roof.cap).flatMap((face2) => face2.points).map((point) => [point.join(), point])).values()] });
  if (plan.wing) {
    const { x0, x1, y0, y1, drop, bottom } = plan.wing.ramp;
    hulls.push({ points: [x0, x1].flatMap((x) => [[x, y0, 0], [x, y1, -drop], [x, y1, bottom], [x, y0, bottom]]) });
  }
  if (plan.bay?.vault)
    hulls.push({ points: plan.bay.vault.points.flatMap(([x, z]) => [[x, plan.bay.vault.at - WALL, z], [x, plan.bay.vault.front, z]]) });
  return { boxes, hulls };
}, DOOR_DRESSING, DOOR_BEHAVIOUR, DOOR_STYLES, STRIP, SPOT, SASH_DRESSING, sashesOf = (plan) => plan.storeys.flatMap((storey) => storey.walls.flatMap((wall) => wall.openings.filter((o) => o.slide).map((o) => {
  const { a0, a1, by, walk, near } = o.slide;
  const through = wall.at - wall.out * (WALL / 2 + SASH[0]);
  const size = [a1 - a0 - 0.004, SASH[1], o.z1 - o.z0 - 0.01];
  const along2 = (a0 + a1) / 2;
  return {
    size,
    at: wall.along === 0 ? [along2, through, (o.z0 + o.z1) / 2] : [through, along2, (o.z0 + o.z1) / 2],
    yaw: wall.along === 0 ? 0 : Math.PI / 2,
    by,
    walk,
    near
  };
}))), GARAGE, PLATFORM, CALL, PLATE, house_gen_default;
var init_house_gen = __esm(() => {
  init_mesh();
  init_house_plan();
  init_room_house();
  [WALLS, TRIM, GLASS2, ROOFING, FLOORS, INSIDE] = [0, 2, 3, 4, 5, 6];
  ORIGIN = [0, 0, 0];
  BAR = [0.05, -0.02, 0.05];
  SASH = [0.065, 0.05];
  CAP5 = [0.05, 0.04];
  planOf3 = remembered(planOf2, 8);
  DOOR_DRESSING = Object.freeze({
    color: [0.5, 0.36, 0.22],
    surface: { faces: { 0: { texture: "metal/painted/metal-029" }, 1: { texture: "wood/panel/oak-veneer-01" }, 2: { texture: "glass/clear/float" }, 3: { texture: "metal/painted/metal-029" } } }
  });
  DOOR_BEHAVIOUR = Object.freeze({ type: "door", trigger: "both", reach: 2.5, stay: 8 });
  DOOR_STYLES = Object.freeze({ plain: 0, panelled: 1, glazed: 2 });
  STRIP = Object.freeze({ size: [1.6, 0.12, 0.05], params: { base: 0, edge: 1, radius: 0.012 }, color: [1, 0.93, 0.82], surface: { emissive: 0.9, glow: 0.2 } });
  SPOT = Object.freeze({ angle: 80, softness: 0.6 });
  SASH_DRESSING = Object.freeze({
    color: [0.12, 0.12, 0.13],
    surface: { faces: { 0: { texture: "metal/painted/metal-029" }, 1: { texture: "metal/painted/metal-029" }, 2: { texture: "glass/clear/float" }, 3: { texture: "metal/painted/metal-029" } } }
  });
  GARAGE = Object.freeze({ lap: 0.1, thick: 0.06, params: { base: 0, edge: 1, radius: 0.01 }, color: [0.2, 0.2, 0.22], texture: "metal/painted/metal-029", reach: 7, time: 2.5, stay: 10 });
  PLATFORM = Object.freeze({ clear: 0.2, thick: 0.1, params: { base: 0, edge: 1, radius: 0.01 }, color: [0.2, 0.2, 0.22], texture: "metal/painted/metal-029" });
  CALL = Object.freeze({ size: [0.02, 0.09, 0.13], params: { base: 0, edge: 1, radius: 0.004 }, color: [0.25, 0.6, 1] });
  PLATE = Object.freeze({ size: [0.09, 0.02, 0.13], params: { base: 0, edge: 1, radius: 0.004 }, color: [0.86, 0.86, 0.84] });
  house_gen_default = Object.freeze({
    footprint: (params) => {
      const { min, max } = planOf3(params);
      return { min, max };
    },
    fit: (params) => {
      const { min, max } = planOf3(params);
      return max.map((v, k) => upToMillimetre4(v - min[k]));
    },
    resize: (params, size) => {
      const { min, max } = planOf3(params);
      return { ...params, width: params.width + size[0] - (max[0] - min[0]), depth: params.depth + size[1] - (max[1] - min[1]) };
    },
    reasons: (params) => planOf3(params).reasons,
    companions: (params) => {
      const centre = centreOf5(params);
      const plan = planOf3(params);
      const from = ([x, y, z]) => [x - centre[0], y - centre[1], z - centre[2]];
      return [
        ...plan.doors.map((door2) => ({
          kind: "door",
          size: [...door2.size],
          yaw: door2.yaw * Math.PI / 180,
          at: from([door2.at[0], door2.at[1], door2.at[2] + door2.size[2] / 2]),
          params: { style: DOOR_STYLES[door2.style], frame: 0.06, hinge: door2.hinge, lit: 1, ...door2.leaves > 1 && { jambs: 1 } },
          behaviour: { ...DOOR_BEHAVIOUR },
          color: [...DOOR_DRESSING.color],
          surface: structuredClone(DOOR_DRESSING.surface)
        })),
        ...plan.inner.map((door2) => ({
          kind: "door",
          size: [...door2.size],
          yaw: door2.yaw * Math.PI / 180,
          at: from([door2.at[0], door2.at[1], door2.at[2] + door2.size[2] / 2]),
          params: { style: DOOR_STYLES[door2.leaves > 1 ? "panelled" : "plain"], frame: 0.05, hinge: door2.hinge, ...door2.leaves > 1 && { jambs: 1 } },
          behaviour: door2.slide ? { type: "slide", x: door2.slide, y: 0, z: 0, trigger: "both", reach: 2.6, time: 1, stay: 6 } : { type: "door", trigger: "both", reach: door2.leaves > 1 ? 2.6 : 1.6, stay: 5 },
          color: [...DOOR_DRESSING.color],
          surface: structuredClone(DOOR_DRESSING.surface)
        })),
        ...plan.lights.map((light) => ({
          kind: "bevel",
          size: [...STRIP.size],
          at: from([light.at[0], light.at[1], light.at[2] - STRIP.size[2] / 2]),
          params: { ...STRIP.params },
          color: [...STRIP.color],
          surface: structuredClone(STRIP.surface),
          light: { on: true, zone: light.zone, range: light.range, color: [...STRIP.color], intensity: 0.8, cone: { ...SPOT } }
        })),
        ...sashesOf(plan).map((sash) => ({
          kind: "window",
          size: sash.size,
          yaw: sash.yaw,
          at: from(sash.at),
          params: { frame: 0.05, columns: 1, rows: 1, sill: 0, lit: 1 },
          color: [...SASH_DRESSING.color],
          surface: structuredClone(SASH_DRESSING.surface),
          behaviour: { type: "slide", x: sash.by, y: 0, z: 0, trigger: sash.near ? "both" : "click", reach: 2.5, time: 1.2, stay: sash.near ? 10 : 0 }
        })),
        ...plan.wing ? [{
          kind: "bevel",
          size: [plan.wing.door.a1 - plan.wing.door.a0 + 2 * GARAGE.lap, GARAGE.thick, plan.wing.door.head + GARAGE.lap],
          params: { ...GARAGE.params },
          at: from([(plan.wing.door.a0 + plan.wing.door.a1) / 2, plan.wing.y1 - WALL - GARAGE.thick / 2 - 0.01, (plan.wing.door.head + GARAGE.lap) / 2]),
          color: [...GARAGE.color],
          surface: { texture: GARAGE.texture },
          behaviour: { type: "slide", x: plan.wing.door.by, y: 0, z: 0, trigger: "both", reach: GARAGE.reach, time: GARAGE.time, stay: GARAGE.stay }
        }] : [],
        ...plan.shaft ? [{
          kind: "bevel",
          size: [plan.shaft.size - PLATFORM.clear, plan.shaft.size - PLATFORM.clear, PLATFORM.thick],
          at: from([(plan.shaft.x0 + plan.shaft.x1) / 2, (plan.shaft.y0 + plan.shaft.y1) / 2, PLATFORM.thick / 2]),
          params: { ...PLATFORM.params },
          color: [...PLATFORM.color],
          surface: { texture: PLATFORM.texture },
          behaviour: { type: "lift", stops: [...plan.shaft.stops], speed: 1.2, group: "lift", button: "next" }
        }, ...plan.shaft.calls.map(({ at: [x, y, z], on }) => ({
          kind: "bevel",
          params: { ...CALL.params },
          ...on === "side" ? { size: [...CALL.size], at: from([x + plan.shaft.dir * CALL.size[0] / 2, y, z]) } : { size: [CALL.size[1], CALL.size[0], CALL.size[2]], at: from([x, y - CALL.size[0] / 2, z]) },
          color: [...CALL.color],
          surface: { emissive: 0 },
          behaviour: { type: "call", reach: 8 }
        }))] : [],
        ...plan.switches.map((each) => ({
          kind: "bevel",
          size: [...PLATE.size],
          at: from([each.at[0], each.at[1] + each.out * PLATE.size[1] / 2, each.at[2]]),
          params: { ...PLATE.params },
          color: [...PLATE.color],
          surface: { emissive: 0 },
          behaviour: { type: "switch", trigger: "both", reach: each.reach, stay: 60, zones: [each.zone] }
        })),
        ...params.furnished ? furnishedRooms(plan, { palette: params.furnished - 1, variant: params.variant }).map((room2) => ({ ...room2, at: from(room2.at) })) : []
      ];
    },
    mesh: (params, seed, level, size) => build(planOf3(params), level).pack(size, centreOf5(params)),
    collider: (params) => {
      const centre = centreOf5(params);
      const { boxes, hulls } = solids(planOf3(params));
      return [
        ...boxes.map(({ min, max }) => solidBox(min.map((v, k) => v - centre[k]), max.map((v, k) => v - centre[k]))),
        ...hulls.map(({ points }) => ({ type: "hull", points: Float32Array.from(points.flatMap((point) => point.map((v, k) => v - centre[k]))) }))
      ];
    }
  });
});

// src/build/kinds/furniture-shapes.js
var ringOf2 = ([x, y], radius, sides, from = Math.PI / sides) => Array.from({ length: sides }, (_, i) => {
  const angle = from + 2 * Math.PI * i / sides;
  return [x + radius * Math.cos(angle), y + radius * Math.sin(angle)];
}), thickened = (line, thick) => {
  const offsets = line.map((p, i) => {
    const [a, b] = [line[Math.max(0, i - 1)], line[Math.min(line.length - 1, i + 1)]];
    const length2 = Math.hypot(b[0] - a[0], b[1] - a[1]);
    return [-(b[1] - a[1]) / length2 * thick / 2, (b[0] - a[0]) / length2 * thick / 2];
  });
  return [...line.map(([u, v], i) => [u + offsets[i][0], v + offsets[i][1]]), ...line.map(([u, v], i) => [u - offsets[i][0], v - offsets[i][1]]).toReversed()];
}, area24 = (ring) => ring.reduce((sum, [u, v], i) => {
  const [p, q] = ring[(i + 1) % ring.length];
  return sum + u * q - p * v;
}, 0), penOf = (mesh, at = [0, 0, 0], yaw = 0, slotOf = (slot) => slot) => {
  const [c, s] = [Math.cos(yaw), Math.sin(yaw)];
  const put = ([x, y, z]) => [at[0] + c * x - s * y, at[1] + s * x + c * y, at[2] + z];
  const turn3 = ([x, y, z]) => [c * x - s * y, s * x + c * y, z];
  const face2 = (slot, points, outward, origin = [0, 0, 0]) => mesh.polygon(slotOf(slot), points.map(put), turn3(outward), points.map((p) => boxUv(p, outward, origin, 1, 1)));
  const box = (slot, [x0, y0, z0], [x1, y1, z1], faces = ["top", "front", "back", "left", "right"]) => {
    const slotOf2 = (name) => typeof slot === "number" ? slot : slot[name] ?? slot.side;
    const sides = {
      top: [[[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], [0, 0, 1]],
      bottom: [[[x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [x1, y0, z0]], [0, 0, -1]],
      front: [[[x1, y1, z0], [x0, y1, z0], [x0, y1, z1], [x1, y1, z1]], [0, 1, 0]],
      back: [[[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], [0, -1, 0]],
      left: [[[x0, y1, z0], [x0, y0, z0], [x0, y0, z1], [x0, y1, z1]], [-1, 0, 0]],
      right: [[[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]], [1, 0, 0]]
    };
    for (const name of faces)
      face2(slotOf2(name), ...sides[name]);
  };
  const soft = (slot, [x0, y0, z0], [x1, y1, z1], r, faces = ["top", "front", "back", "left", "right"]) => {
    r = Math.min(r, (x1 - x0) / 3, (y1 - y0) / 3, (z1 - z0) / 2);
    const has = new Set(faces);
    const zt = z1 - r;
    const [a0, a1, b0, b1] = [x0 + r, x1 - r, y0 + r, y1 - r];
    if (has.has("top"))
      face2(slot, [[a0, b0, z1], [a1, b0, z1], [a1, b1, z1], [a0, b1, z1]], [0, 0, 1]);
    if (has.has("bottom"))
      face2(slot, [[a0, y0, z0], [x0, b0, z0], [x0, b1, z0], [a0, y1, z0], [a1, y1, z0], [x1, b1, z0], [x1, b0, z0], [a1, y0, z0]], [0, 0, -1]);
    const round7 = [
      ["back", [a0, y0], [a1, y0], [0, -1]],
      ["right", [x1, b0], [x1, b1], [1, 0]],
      ["front", [a1, y1], [a0, y1], [0, 1]],
      ["left", [x0, b1], [x0, b0], [-1, 0]]
    ];
    for (const [i, [name, p, q, [nx, ny]]] of round7.entries()) {
      if (!has.has(name))
        continue;
      face2(slot, [[...p, z0], [...q, z0], [...q, zt], [...p, zt]], [nx, ny, 0]);
      const [pi, qi] = [[p[0] - nx * r, p[1] - ny * r], [q[0] - nx * r, q[1] - ny * r]];
      face2(slot, [[...p, zt], [...q, zt], [...qi, z1], [...pi, z1]], [nx, ny, 1]);
      const [, next, , [mx, my]] = round7[(i + 1) % 4];
      if (!has.has(round7[(i + 1) % 4][0]))
        continue;
      face2(slot, [[...q, z0], [...next, z0], [...next, zt], [...q, zt]], [nx + mx, ny + my, 0]);
      face2(slot, [[...q, zt], [...next, zt], [next[0] - mx * r, next[1] - my * r, z1]], [nx + mx, ny + my, 1]);
    }
  };
  const leg = (slot, [x, y], width, z0, z1, sides = 4) => {
    const ring = ringOf2([x, y], sides === 4 ? width / Math.SQRT2 : width / 2, sides, sides === 4 ? Math.PI / 4 : Math.PI / sides);
    ring.forEach((p, i) => {
      const q = ring[(i + 1) % sides];
      face2(slot, [[...p, z0], [...q, z0], [...q, z1], [...p, z1]], [(p[0] + q[0]) / 2 - x, (p[1] + q[1]) / 2 - y, 0]);
    });
  };
  const disc = (slot, [x, y], radius, z0, z1, sides, { top = true, bottom = false, sideSlot = slot } = {}) => {
    leg(sideSlot, [x, y], 2 * radius, z0, z1, sides);
    const ring = ringOf2([x, y], radius, sides, Math.PI / sides);
    if (top)
      face2(slot, ring.map(([u, v]) => [u, v, z1]), [0, 0, 1]);
    if (bottom)
      face2(slot, ring.map(([u, v]) => [u, v, z0]), [0, 0, -1]);
  };
  const profile2 = (slot, points, axis, from, to, { side: side2 = slot, ends = true, open = [] } = {}) => {
    const lift = ([u, v], w) => axis === 1 ? [u, w, v] : axis === 0 ? [w, u, v] : [u, v, w];
    const sign = area24(points) > 0 ? 1 : -1;
    const out = lift([0, 0], 1);
    if (ends) {
      face2(slot, points.map((q) => lift(q, to)), out);
      face2(slot, points.map((q) => lift(q, from)), out.map((v) => -v));
    }
    points.forEach((q, i) => {
      if (open.includes(i))
        return;
      const next = points[(i + 1) % points.length];
      face2(side2, [lift(q, from), lift(next, from), lift(next, to), lift(q, to)], lift([sign * (next[1] - q[1]), -sign * (next[0] - q[0])], 0));
    });
  };
  const lathe = (slot, [x, y], profile3, sides, { top = true } = {}) => {
    const ring = (r2, z2) => Array.from({ length: sides }, (_, i) => {
      const angle = 2 * Math.PI * i / sides;
      return [x + r2 * Math.cos(angle), y + r2 * Math.sin(angle), z2];
    });
    const rings = profile3.map(([r2, z2]) => ring(r2, z2));
    for (let k = 0;k < profile3.length - 1; k++) {
      const [[r0, z0], [r1, z1]] = [profile3[k], profile3[k + 1]];
      for (let i = 0;i < sides; i++) {
        const j = (i + 1) % sides;
        const angle = 2 * Math.PI * (i + 0.5) / sides;
        const outward = [Math.cos(angle) * (z1 - z0), Math.sin(angle) * (z1 - z0), r0 - r1];
        const quad = [rings[k][i], rings[k][j], rings[k + 1][j], rings[k + 1][i]].filter((p, n, all) => n === 0 || Math.hypot(p[0] - all[n - 1][0], p[1] - all[n - 1][1], p[2] - all[n - 1][2]) > 0.000000001);
        if (quad.length >= 3)
          face2(slot, quad, outward);
      }
    }
    const [r, z] = profile3.at(-1);
    if (top && r > 0.000001)
      face2(slot, ring(r, z), [0, 0, 1]);
  };
  const within3 = ([x, y, z = 0], angle = 0) => penOf(mesh, put([x, y, z]), yaw + angle, slotOf);
  return { face: face2, box, soft, leg, disc, profile: profile2, lathe, within: within3 };
};
var init_furniture_shapes = __esm(() => {
  init_mesh();
});

// src/build/kinds/furniture-pieces.js
var FRAME, COVER, BEDDING, THROW, METAL, TOP, SEAT2 = 0.45, SIT = 0.175, LEAN = 0.17, PLACE = 0.66, by = (t, least, most) => least + (most - least) * t, ON_CHAIR = "dcl/sitting-chair-1", LEANING = "dcl/sitting-chair-2", LYING = "ovgrid/lying", cornersOf2 = (x0, y0, x1, y1, inset) => [[x0 + inset, y0 + inset], [x1 - inset, y0 + inset], [x1 - inset, y1 - inset], [x0 + inset, y1 - inset]], softly = (pen, level) => (slot, min, max, r, faces) => level >= 3 ? pen.soft(slot, min, max, r, faces) : pen.box(slot, min, max, faces), rolled = (u0, u1, foot, top, steps = 5) => {
  const radius = (u1 - u0) / 2;
  const centre = [(u0 + u1) / 2, top - radius];
  return [[u0, foot], [u1, foot], ...Array.from({ length: steps + 1 }, (_, i) => {
    const angle = Math.PI * i / steps;
    return [centre[0] + radius * Math.cos(angle), centre[1] + radius * Math.sin(angle)];
  })];
}, SEATED, layoutOf2 = ({ model, w, d, h, legs = 0.5, stout = 0.5 }) => {
  const own = SEATED[model];
  const spec = { ...own, arm: own.arm * by(stout, 0.6, 1.4), foot: own.foot * by(legs, 0.4, 1.6), armTop: own.under ? h - own.under : own.armTop };
  const [x0, x1] = [-w / 2, w / 2];
  const y0 = -d / 2;
  const y1 = spec.lounge ? y0 + 0.95 : d / 2;
  const [i0, i1] = [x0 + spec.arm, x1 - (spec.lounge ? 0 : spec.arm)];
  const end = i1 - (spec.lounge ?? 0);
  const count = Math.max(1, Math.min(4, Math.round((end - i0) / 0.9)));
  const width = (end - i0) / count;
  const cushions = Array.from({ length: count }, (_, i) => [i0 + i * width, i0 + (i + 1) * width]);
  return { spec, x0, x1, y0, y1, i0, i1, end, cushions };
}, seated = (pen, dims, level) => {
  const { w, d, h, model } = dims;
  const { spec, x0, x1, y0, y1, i0, i1, end, cushions } = layoutOf2(dims);
  const backTop = model === "modular" ? 0.58 : h;
  if (level <= 1) {
    pen.box(COVER, [x0, y0, 0], [x1, d / 2, spec.seat]);
    pen.box(COVER, [x0, y0, spec.seat], [x1, y0 + spec.back, backTop], ["top", "front", "back", "left", "right"]);
    return;
  }
  const soft = softly(pen, level);
  if (spec.foot) {
    const legs = spec.lounge ? [[x0 + 0.06, y0 + 0.06], [x0 + 0.06, y1 - 0.06], [x1 - 0.06, y0 + 0.06], [x1 - 0.06, d / 2 - 0.06], [end + 0.06, d / 2 - 0.06]] : cornersOf2(x0, y0, x1, y1, 0.06);
    for (const at of legs)
      pen.leg(spec.legs, at, 0.05, 0, spec.foot, spec.sides ?? 4);
  }
  pen.box(COVER, [i0, y0, spec.foot], [end, y1, spec.base], spec.arm ? ["front"] : ["front", "back", "left", "right"]);
  if (spec.lounge)
    pen.box(COVER, [end, y0, spec.foot], [x1, d / 2, spec.base], ["front", "left", "right"]);
  for (const [a0, a1] of [[x0, x0 + spec.arm], ...spec.lounge ? [] : [[x1 - spec.arm, x1]]].filter(() => spec.arm)) {
    if (spec.rolled && level >= 3)
      pen.profile(COVER, rolled(a0, a1, spec.foot, spec.armTop), 1, y0, y1, { open: [0] });
    else
      soft(COVER, [a0, y0, spec.foot], [a1, y1, spec.armTop], 0.03);
  }
  if (model === "modular") {
    pen.box(COVER, [x0, y0, spec.base], [x1, y0 + 0.14, backTop]);
    for (const [c0, c1] of cushions)
      soft(BEDDING, [c0 + 0.01, y0 + 0.14, spec.seat], [c1 - 0.01, y0 + spec.back, 0.8], 0.05);
  } else if (spec.rolled && level >= 3 && model === "chesterfield")
    pen.profile(COVER, rolled(y0, y0 + spec.back, spec.base, h), 0, i0, x1 - spec.arm, { open: [0] });
  else
    soft(COVER, [i0, y0, spec.base], [spec.lounge ? x1 : i1, y0 + spec.back, h], 0.04);
  if (spec.wings)
    for (const [a0, a1] of [[x0, x0 + spec.arm], [x1 - spec.arm, x1]])
      soft(COVER, [a0, y0 + spec.back, spec.armTop], [a1, y0 + spec.back + spec.wings, h - 0.06], 0.03);
  const from = y0 + (model === "modular" ? 0.14 : spec.back);
  if (level >= 3)
    for (const [c0, c1] of cushions)
      soft(COVER, [c0, from, spec.base], [c1, y1, spec.seat], 0.035);
  else
    pen.box(COVER, [i0, from, spec.base], [end, y1, spec.seat]);
  if (spec.lounge)
    soft(COVER, [end, from, spec.base], [x1, d / 2, spec.seat], 0.035);
  if (level >= 3 && model !== "modular" && end - i0 > 1.1) {
    for (const [c0, c1] of [[i0 + 0.05, i0 + 0.47], [end - 0.47, end - 0.05]])
      soft(THROW, [c0, from, spec.seat], [c1, from + 0.13, Math.min(spec.seat + 0.4, h - 0.02)], 0.04);
  }
}, seatedSeat = (dims) => {
  const { spec, y0, x1, end, cushions } = layoutOf2(dims);
  const y = y0 + spec.back + LEAN;
  const places = cushions.flatMap(([c0, c1]) => {
    const n = Math.max(1, Math.floor((c1 - c0) / PLACE + 0.000001));
    return Array.from({ length: n }, (_, i) => [c0 + (c1 - c0) * (i + 0.5) / n, y, spec.seat + SIT]);
  });
  if (spec.lounge)
    places.push([(end + x1) / 2, y, spec.seat + SIT]);
  return { pose: LEANING, places };
}, seatedSolids = (dims) => {
  const { d, h, model } = dims;
  const { spec, x0, x1, y0, y1, end } = layoutOf2(dims);
  return [
    [[x0, y0, 0], [x1, y1, spec.seat]],
    [[x0, y0, spec.seat], [x1, y0 + spec.back, model === "modular" ? 0.8 : h]],
    ...spec.lounge ? [[[end, y1, 0], [x1, d / 2, spec.seat]]] : []
  ];
}, chair = (pen, { w, d, h, model, stout = 0.5 }, level) => {
  const [x0, x1, y0, y1] = [-w / 2, w / 2, -d / 2, d / 2];
  const thick = by(stout, 0.7, 1.3);
  if (level <= 1) {
    pen.box(FRAME, [x0, y0, 0], [x1, y1, 0.47]);
    pen.box(model === "dining" ? FRAME : COVER, [x0, y0, 0.47], [x1, y0 + 0.06, h], ["top", "front", "back", "left", "right"]);
    return;
  }
  const soft = softly(pen, level);
  if (model === "shell") {
    const outline2 = thickened([[y1 - 0.02, 0.45], [y0 + 0.13, 0.43], [y0 + 0.05, 0.49], [y0 + 0.03, 0.62], [y0 + 0.05, h - 0.014]], 0.028);
    pen.profile(COVER, level >= 3 ? outline2 : [[y1 - 0.02, 0.43], [y1 - 0.02, 0.46], [y0 + 0.04, 0.46], [y0 + 0.04, h], [y0, h], [y0, 0.43]], 0, x0 + 0.02, x1 - 0.02);
    for (const at of cornersOf2(x0, y0, x1, y1, 0.07))
      pen.leg(METAL, at, 0.022 * thick, 0, 0.43, 4);
    return;
  }
  const legs = cornersOf2(x0, y0, x1, y1, 0.005 + 0.02 * thick);
  for (const [i, at] of legs.entries())
    pen.leg(FRAME, at, 0.04 * thick, 0, i < 2 ? model === "dining" ? h : 0.5 : 0.43, 4);
  if (model === "dining") {
    pen.box(FRAME, [x0, y0, 0.43], [x1, y1, 0.47]);
    for (const [z0, z1] of [[0.6, 0.66], [h - 0.12, h - 0.02]])
      pen.box(FRAME, [x0 + 0.045, y0 + 0.01, z0], [x1 - 0.045, y0 + 0.035, z1], ["top", "front", "back", "bottom"]);
  } else {
    soft(COVER, [x0, y0, 0.38], [x1, y1, 0.47], 0.03);
    soft(COVER, [x0 + 0.01, y0, 0.47], [x1 - 0.01, y0 + 0.07, h], 0.03);
  }
}, chairSeat = ({ d, model }) => ({ pose: ON_CHAIR, places: [[0, -d / 2 + (model === "shell" ? 0.06 : 0.07) + LEAN, 0.46 + SIT]] }), chairSolids = ({ w, d, h }) => [[[-w / 2, -d / 2, 0], [w / 2, d / 2, 0.47]], [[-w / 2, -d / 2, 0.47], [w / 2, -d / 2 + 0.07, h]]], stool = (pen, { w, h, model, stout = 0.5 }, level) => {
  const radius = w / 2;
  if (level <= 1)
    return pen.box(FRAME, [-radius, -radius, 0], [radius, radius, h]);
  const pad = model === "bar" ? COVER : FRAME;
  pen.disc(pad, [0, 0], radius, h - 0.05, h, level >= 3 ? 10 : 6, { bottom: true });
  const legs = model === "bar" ? 4 : 3;
  const at = ringOf2([0, 0], radius - 0.05, legs, Math.PI / legs);
  for (const p of at)
    pen.leg(FRAME, p, 0.032 * by(stout, 0.7, 1.3), 0, h - 0.05, 4);
  if (model === "bar" && level >= 3) {
    const [a, b] = [radius - 0.05, 0.016];
    pen.box(METAL, [-a, -b, 0.27], [a, b, 0.3], ["top", "front", "back", "bottom"]);
    pen.box(METAL, [-b, -a, 0.27], [b, a, 0.3], ["top", "left", "right", "bottom"]);
  }
}, stoolSeat = ({ h }) => ({ pose: ON_CHAIR, places: [[0, 0, h + SIT]] }), stoolSolids = ({ w, h }) => [[[-w / 2, -w / 2, 0], [w / 2, w / 2, h]]], BED, LIE, bedPlaces = (m) => {
  const count = Math.max(1, Math.floor(m / PLACE + 0.000001));
  const each = (m - 0.08) / count;
  return Array.from({ length: count }, (_, i) => -m / 2 + 0.04 + (i + 0.5) * each);
}, bed = (pen, dims, level) => {
  const { w, d, h, model, legs = 0.5 } = dims;
  const [x0, x1, y0, y1] = [-w / 2, w / 2, -d / 2, d / 2];
  const head = y0 + BED.board;
  const plinth = BED.plinth * by(legs, 0.4, 1.6);
  const m = w - 0.08;
  if (level <= 1) {
    pen.box(BEDDING, [x0, head, 0], [x1, y1, BED.mattress]);
    pen.box(FRAME, [x0, y0, 0], [x1, head, h], ["top", "front", "back", "left", "right"]);
    return;
  }
  const soft = softly(pen, level);
  pen.box(FRAME, [x0 + 0.1, head + 0.1, 0], [x1 - 0.1, y1 - 0.1, plinth], ["front", "left", "right"]);
  pen.box(FRAME, [x0, head, plinth], [x1, y1, BED.base], ["front", "left", "right", "bottom"]);
  soft(BEDDING, [-m / 2, head + 0.02, BED.base], [m / 2, y1 - 0.03, BED.mattress], 0.04);
  soft(THROW, [-m / 2 - 0.015, head + 0.62, BED.base + 0.07], [m / 2 + 0.015, y1 - 0.015, BED.mattress + 0.025], 0.02);
  const places = bedPlaces(m);
  const each = (m - 0.08) / places.length;
  for (const x of places)
    soft(BEDDING, [x - each / 2 + 0.02, head + 0.06, BED.mattress], [x + each / 2 - 0.02, head + 0.48, BED.mattress + 0.13], 0.05);
  const [b0, b1] = [x0 - 0.02, x1 + 0.02];
  if (model === "panel" || model === "slatted" && level < 3)
    pen.box(FRAME, [b0 - 0.04, y0, 0], [b1 + 0.04, head - 0.04, h]);
  else if (model === "slatted") {
    pen.box(FRAME, [b0, y0, 0], [b0 + 0.07, head - 0.03, h]);
    pen.box(FRAME, [b1 - 0.07, y0, 0], [b1, head - 0.03, h]);
    pen.box(FRAME, [b0 + 0.07, y0, h - 0.07], [b1 - 0.07, head - 0.03, h], ["top", "front", "back", "bottom"]);
    const count = Math.max(3, Math.round((b1 - b0 - 0.14) / 0.13));
    const pitch = (b1 - b0 - 0.14) / count;
    for (let i = 0;i < count; i++)
      pen.box(FRAME, [b0 + 0.07 + i * pitch + 0.025, y0 + 0.01, BED.base], [b0 + 0.07 + (i + 1) * pitch - 0.025, head - 0.04, h - 0.07], ["front", "back", "left", "right"]);
  } else if (model === "arched")
    pen.profile(COVER, level >= 3 ? [[b0, 0], [b1, 0], ...Array.from({ length: 9 }, (_, i) => {
      const angle = Math.PI * i / 8;
      return [(b1 - b0) / 2 * Math.cos(angle), h - 0.45 + 0.45 * Math.sin(angle)];
    })] : [[b0, 0], [b1, 0], [b1, h - 0.3], [0, h], [b0, h - 0.3]], 1, y0, head - 0.02);
  else {
    pen.box(FRAME, [b0, y0, 0], [b1, y0 + 0.04, h]);
    const [p0, p1, z0, z1] = [b0 + 0.03, b1 - 0.03, BED.base + 0.02, h - 0.04];
    if (model === "tufted" && level >= 3) {
      const [columns, rows] = [Math.max(2, Math.round((p1 - p0) / 0.32)), Math.max(2, Math.round((z1 - z0) / 0.3))];
      const [cw, rh] = [(p1 - p0) / columns, (z1 - z0) / rows];
      for (let i = 0;i < columns; i++)
        for (let j = 0;j < rows; j++)
          pen.box(COVER, [p0 + i * cw + 0.008, y0 + 0.04, z0 + j * rh + 0.008], [p0 + (i + 1) * cw - 0.008, head - 0.02, z0 + (j + 1) * rh - 0.008], j === rows - 1 ? ["top", "front", "left", "right"] : ["front", "left", "right"]);
    } else if (model === "channel" && level >= 3) {
      const count = Math.max(3, Math.round((p1 - p0) / 0.2));
      const cw = (p1 - p0) / count;
      for (let i = 0;i < count; i++) {
        const [a, b] = [p0 + i * cw, p0 + (i + 1) * cw];
        pen.profile(COVER, [[a, y0 + 0.04], [b, y0 + 0.04], [b - 0.025, head - 0.04], [(a + b) / 2, head - 0.015], [a + 0.025, head - 0.04]], 2, z0, z1, { open: [0] });
      }
    } else
      soft(COVER, [p0, y0 + 0.04, z0], [p1, head - 0.02, z1], 0.04);
    if (model === "wing")
      for (const [side2, x] of [[-1, b0], [1, b1]])
        softly(pen.within([x - side2 * 0.06, y0 + 0.02], side2 * 0.35), level)(COVER, [-0.05, 0, BED.base], [0.05, 0.32, h - 0.1], 0.03);
  }
}, bedSeat = ({ w, d }) => {
  return { pose: LYING, places: bedPlaces(w - 0.08).map((x) => [x, -d / 2 + BED.board + LIE.gap + LIE.head, BED.mattress + LIE.hips]) };
}, bedSolids = ({ w, d, h }) => [[[-w / 2, -d / 2 + BED.board, 0], [w / 2, d / 2, BED.mattress + 0.03]], [[-w / 2 - 0.06, -d / 2, 0], [w / 2 + 0.06, -d / 2 + BED.board, h]]], topOf = (pen, { w, d, h }, round7, thick, level) => {
  if (round7)
    pen.disc(TOP, [0, 0], w / 2, h - thick, h, level >= 3 ? 16 : 10, { bottom: true });
  else
    pen.box(TOP, [-w / 2, -d / 2, h - thick], [w / 2, d / 2, h], ["top", "front", "back", "left", "right", "bottom"]);
}, table = (pen, dims, level) => {
  const { w, d, h, model, type, stout = 0.5 } = dims;
  const stoutly = by(stout, 0.65, 1.35);
  const round7 = model === "round";
  if (level <= 1) {
    if (round7)
      return pen.disc(TOP, [0, 0], w / 2, 0, h, 6, { sideSlot: FRAME });
    return pen.box(TOP, [-w / 2, -d / 2, 0], [w / 2, d / 2, h], ["top", "front", "back", "left", "right"]);
  }
  const [x0, x1, y0, y1] = [-w / 2, w / 2, -d / 2, d / 2];
  const thick = (type === "side" ? 0.035 : 0.04) * by(stout, 0.7, 1.3);
  const under = h - thick;
  if (model === "slab")
    return softly(pen, level)(TOP, [x0, y0, 0], [x1, y1, h], 0.015);
  if (model === "cube") {
    const face2 = y1 - 0.02;
    pen.box(FRAME, [x0, y0, 0], [x1, face2, h]);
    if (level >= 3) {
      pen.box(FRAME, [x0 + 0.03, face2, h - 0.17], [x1 - 0.03, face2 + 0.006, h - 0.04], ["top", "front", "left", "right", "bottom"]);
      pen.box(METAL, [-0.05, face2 + 0.006, h - 0.115], [0.05, y1, h - 0.095], ["top", "front", "left", "right", "bottom"]);
    }
    return;
  }
  topOf(pen, dims, round7, thick, level);
  if (round7) {
    if (type === "table") {
      pen.leg(FRAME, [0, 0], 0.12 * stoutly, 0.06, under, level >= 3 ? 8 : 6);
      pen.disc(FRAME, [0, 0], Math.min(0.32, w * 0.3), 0, 0.06, level >= 3 ? 10 : 6);
    } else
      for (const at of ringOf2([0, 0], w / 2 - 0.08, 3, Math.PI / 2))
        pen.leg(type === "coffee" ? FRAME : METAL, at, 0.035 * stoutly, 0, under, 4);
    return;
  }
  if (model === "trestle") {
    for (const x of [x0 + 0.28, x1 - 0.28]) {
      for (const y of [y0 + 0.1, y1 - 0.1])
        pen.leg(METAL, [x, y], 0.045 * stoutly, 0.04, under - 0.04, 4);
      pen.box(METAL, [x - 0.03, y0 + 0.05, 0], [x + 0.03, y1 - 0.05, 0.04]);
      pen.box(METAL, [x - 0.03, y0 + 0.05, under - 0.04], [x + 0.03, y1 - 0.05, under], ["front", "back", "left", "right", "bottom"]);
    }
    if (level >= 3)
      pen.box(METAL, [x0 + 0.3, -0.02, 0.32], [x1 - 0.3, 0.02, 0.36], ["top", "front", "back", "bottom"]);
    return;
  }
  const drawers = model === "drawers";
  const legs = cornersOf2(x0, y0, x1, y1, 0.04).filter(([x]) => !drawers || x < 0);
  for (const at of legs)
    pen.leg(FRAME, at, (type === "side" ? 0.035 : 0.055) * stoutly, 0, under, 4);
  if (type === "table" && level >= 3) {
    for (const [min, max, faces] of [
      [[x0 + 0.07, y0 + 0.06, under - 0.09], [x1 - 0.07, y0 + 0.08, under], ["back", "front", "bottom"]],
      [[x0 + 0.07, y1 - 0.08, under - 0.09], [x1 - 0.07, y1 - 0.06, under], ["back", "front", "bottom"]]
    ])
      pen.box(FRAME, min, max, faces);
  }
  if (type === "coffee" && level >= 3)
    pen.box(TOP, [x0 + 0.06, y0 + 0.06, 0.1], [x1 - 0.06, y1 - 0.06, 0.13], ["top", "front", "back", "left", "right", "bottom"]);
  if (type === "side" && level >= 3)
    pen.box(FRAME, [x0 + 0.04, y0 + 0.04, under - 0.12], [x1 - 0.04, y1 - 0.04, under], ["front", "back", "left", "right", "bottom"]);
  if (type === "desk") {
    if (!drawers)
      pen.box(FRAME, [x0 + 0.07, y0 + 0.05, 0.35], [x1 - 0.07, y0 + 0.07, under], ["front", "back", "bottom"]);
    else {
      const [p0, p1] = [x1 - 0.46, x1 - 0.02];
      pen.box(FRAME, [p0, y0 + 0.02, 0], [p1, y1 - 0.03, under], ["front", "back", "left", "right"]);
      if (level >= 3)
        for (let i = 0;i < 3; i++) {
          const [z0, z1] = [0.04 + i * 0.215 + 0.008, 0.04 + (i + 1) * 0.215 - 0.008];
          pen.box(FRAME, [p0 + 0.02, y1 - 0.03, z0], [p1 - 0.02, y1 - 0.022, z1], ["top", "front", "left", "right", "bottom"]);
          pen.box(METAL, [(p0 + p1) / 2 - 0.06, y1 - 0.022, z1 - 0.05], [(p0 + p1) / 2 + 0.06, y1 - 0.006, z1 - 0.035], ["top", "front", "left", "right", "bottom"]);
        }
    }
  }
}, tableSolids = ({ w, d, h }) => [[[-w / 2, -d / 2, 0], [w / 2, d / 2, h]]], PIECES, HEIGHTS;
var init_furniture_pieces = __esm(() => {
  init_furniture_shapes();
  [FRAME, COVER, BEDDING, THROW, METAL, TOP] = [0, 1, 2, 3, 4, 5];
  SEATED = Object.freeze({
    track: { arm: 0.2, back: 0.22, seat: SEAT2, foot: 0.12, base: 0.3, armTop: 0.62, legs: FRAME },
    rolled: { arm: 0.24, back: 0.22, seat: SEAT2, foot: 0.12, base: 0.3, armTop: 0.64, rolled: true, legs: FRAME },
    chaise: { arm: 0.2, back: 0.22, seat: SEAT2, foot: 0.12, base: 0.3, armTop: 0.62, lounge: 0.85, legs: METAL },
    modular: { arm: 0, back: 0.34, seat: 0.4, foot: 0, base: 0.26, armTop: 0 },
    chesterfield: { arm: 0.26, back: 0.26, seat: SEAT2, foot: 0.09, base: 0.3, under: 0.1, rolled: true, legs: FRAME, sides: 6 },
    lounge: { arm: 0.14, back: 0.2, seat: 0.44, foot: 0.14, base: 0.28, armTop: 0.6, legs: FRAME },
    club: { arm: 0.24, back: 0.22, seat: 0.42, foot: 0, base: 0.25, armTop: 0.62 },
    wing: { arm: 0.14, back: 0.2, seat: SEAT2, foot: 0.14, base: 0.3, armTop: 0.62, legs: FRAME, wings: 0.28 }
  });
  BED = Object.freeze({ base: 0.3, plinth: 0.12, mattress: 0.52, board: 0.1 });
  LIE = Object.freeze({ hips: 0.115, head: 0.893, gap: 0.04 });
  PIECES = Object.freeze({
    sofa: { draw: seated, seat: seatedSeat, solids: seatedSolids },
    armchair: { draw: seated, seat: seatedSeat, solids: seatedSolids },
    chair: { draw: chair, seat: chairSeat, solids: chairSolids },
    stool: { draw: stool, seat: stoolSeat, solids: stoolSolids },
    bed: { draw: bed, seat: bedSeat, solids: bedSolids },
    table: { draw: table, seat: null, solids: tableSolids },
    coffee: { draw: table, seat: null, solids: tableSolids },
    side: { draw: table, seat: null, solids: tableSolids },
    desk: { draw: table, seat: null, solids: tableSolids }
  });
  HEIGHTS = Object.freeze({
    armchair: { club: 0.78, wing: 1.05 },
    stool: { bar: 0.76, low: 0.46 },
    bed: { panel: 1, padded: 1.1, tufted: 1.25, channel: 1.2, slatted: 1, wing: 1.2, arched: 1.35 }
  });
});

// src/build/kinds/furniture-decor.js
var FRAME2, COVER2, BEDDING2, THROW2, METAL2, TOP2, ART, SIZES, PICTURE, canvasOf = ({ w, h, model }) => {
  const inset = PICTURE.bar[model] + (model === "mounted" ? PICTURE.mount : 0);
  return [w - 2 * inset, h - 2 * inset].map((v) => Math.round(v * 1000) / 1000);
}, rug = (pen, { w, d, h, model }, level) => {
  const round7 = model === "round";
  if (level <= 1) {
    if (round7)
      return pen.face(COVER2, ringOf2([0, 0], w / 2, 8).map(([x, y]) => [x, y, h]), [0, 0, 1]);
    return pen.box(COVER2, [-w / 2, -d / 2, 0], [w / 2, d / 2, h], ["top"]);
  }
  if (round7)
    pen.disc(COVER2, [0, 0], w / 2, 0, h, level >= 3 ? 20 : 12);
  else
    pen.box(COVER2, [-w / 2, -d / 2, 0], [w / 2, d / 2, h]);
}, picture = (pen, dims, level) => {
  const { w, h, model } = dims;
  const [y0, y1] = [-PICTURE.deep / 2, PICTURE.deep / 2];
  const [cw, ch] = canvasOf(dims);
  const plane = model === "canvas" ? y1 : y1 - 0.012;
  const canvas = () => pen.face(ART, [[cw / 2, plane, (h - ch) / 2], [-cw / 2, plane, (h - ch) / 2], [-cw / 2, plane, (h + ch) / 2], [cw / 2, plane, (h + ch) / 2]], [0, 1, 0], [0.5, 0, h / 2 - 0.5]);
  if (level <= 1) {
    pen.box(FRAME2, [-w / 2, y0, 0], [w / 2, y1 - 0.013, h], ["front"]);
    return canvas();
  }
  if (model === "canvas") {
    pen.box(COVER2, [-w / 2, y0, 0], [w / 2, y1, h], ["top", "left", "right", "bottom"]);
    return canvas();
  }
  const bar = PICTURE.bar[model];
  const bars = [
    [[-w / 2, y0, h - bar], [w / 2, y1, h], ["top", "front", "left", "right", "bottom"]],
    [[-w / 2, y0, 0], [w / 2, y1, bar], ["top", "front", "left", "right", "bottom"]],
    [[-w / 2, y0, bar], [-w / 2 + bar, y1, h - bar], ["front", "left", "right"]],
    [[w / 2 - bar, y0, bar], [w / 2, y1, h - bar], ["front", "left", "right"]]
  ];
  for (const [min, max, faces] of bars)
    pen.box(FRAME2, min, max, faces);
  pen.face(model === "mounted" ? COVER2 : FRAME2, [[w / 2 - bar, plane - 0.003, bar], [-w / 2 + bar, plane - 0.003, bar], [-w / 2 + bar, plane - 0.003, h - bar], [w / 2 - bar, plane - 0.003, h - bar]], [0, 1, 0]);
  canvas();
}, leaf = (pen, at, angle, long, wide, rise) => {
  const [c, s] = [Math.cos(angle), Math.sin(angle)];
  const out = (along2, across, up) => [at[0] + c * along2 - s * across, at[1] + s * along2 + c * across, at[2] + up];
  const points = [out(0, 0, 0), out(long * 0.45, wide / 2, rise * 0.55), out(long, 0, rise), out(long * 0.45, -wide / 2, rise * 0.55)];
  const normal = [-c * rise, -s * rise, long];
  pen.face(THROW2, points, normal);
  pen.face(THROW2, points, normal.map((v) => -v));
}, pot = (pen, radius, high, sides) => {
  pen.lathe(TOP2, [0, 0], [[radius * 0.78, 0], [radius, high]], sides, { top: false });
  pen.disc(FRAME2, [0, 0], radius * 0.92, high - 0.04, high - 0.03, sides, { sideSlot: TOP2 });
}, plant = (pen, { w, h, model }, level) => {
  const radius = model === "bush" ? 0.18 : model === "cactus" ? 0.15 : 0.17;
  const high = model === "bush" ? 0.3 : 0.34;
  if (level <= 1) {
    pen.disc(TOP2, [0, 0], radius, 0, high, 6);
    return pen.box(THROW2, [-w / 2 + 0.05, -w / 2 + 0.05, high], [w / 2 - 0.05, w / 2 - 0.05, h], ["top", "front", "back", "left", "right", "bottom"]);
  }
  const sides = level >= 3 ? 10 : 6;
  pot(pen, radius, high, sides);
  if (model === "cactus") {
    pen.disc(THROW2, [0, 0], 0.075, high - 0.04, h - 0.04, sides, { top: true });
    if (level >= 3)
      for (const [side2, z0, z1] of [[1, 0.62, 1.02], [-1, 0.8, 1.12]]) {
        pen.box(THROW2, side2 > 0 ? [0.06, -0.035, z0] : [-0.2, -0.035, z0], side2 > 0 ? [0.2, 0.035, z0 + 0.07] : [-0.06, 0.035, z0 + 0.07], ["top", "front", "back", "bottom", side2 > 0 ? "right" : "left"]);
        pen.disc(THROW2, [side2 * 0.165, 0], 0.04, z0, z1, 6);
      }
    return;
  }
  if (model === "bush") {
    const rings = level >= 3 ? [[7, 0.32, 0.26, 0.38], [6, 0.26, 0.22, 0.48], [4, 0.14, 0.16, 0.52]] : [[5, 0.32, 0.3, 0.45]];
    for (const [i, [count, long, wide, rise]] of rings.entries())
      for (let n = 0;n < count; n++)
        leaf(pen, [0, 0, high - 0.03], 2 * Math.PI * (n + i * 0.5) / count, long, wide, rise);
    return;
  }
  const stems = [[0.03, 0.02, h - 0.15], [-0.04, 0.03, h - 0.35], [0.01, -0.05, h - 0.55]];
  for (const [x, y, top] of stems)
    pen.leg(FRAME2, [x, y], 0.018, high - 0.04, top, 4);
  const leaves = level >= 3 ? 5 : 3;
  for (const [k, [x, y, top]] of stems.entries())
    for (let n = 0;n < leaves; n++) {
      const z = top - 0.32 + 0.32 * n / leaves;
      leaf(pen, [x, y, z], k * 2.1 + n * 2.4, 0.3, 0.15, 0.12 + 0.04 * (n % 2));
    }
}, TURNED, ornament = (pen, { w, d, h, model }, level) => {
  if (level <= 1)
    return pen.box(model === "books" ? COVER2 : TOP2, [-w / 2 + 0.02, -d / 2 + 0.02, 0], [w / 2 - 0.02, d / 2 - 0.02, h], ["top", "front", "back", "left", "right"]);
  const sides = level >= 3 ? 10 : 6;
  if (TURNED[model]) {
    const outline2 = level >= 3 ? TURNED[model] : [TURNED[model][0], TURNED[model][Math.floor(TURNED[model].length / 2)], TURNED[model].at(-1)];
    return pen.lathe(TOP2, [0, 0], outline2, sides);
  }
  if (model === "books") {
    for (const [k, [wide, deep, thick, turn3]] of [[0.3, 0.22, 0.04, 0], [0.27, 0.2, 0.035, 0.12], [0.24, 0.17, 0.035, -0.08]].entries()) {
      const z = [0, 0.04, 0.075][k];
      const book = pen.within([0, 0, z], turn3);
      book.box(COVER2, [-wide / 2, -deep / 2, 0], [wide / 2, deep / 2, thick], ["top", "back", "left", "bottom"]);
      book.box(BEDDING2, [-wide / 2 + 0.003, -deep / 2 + 0.003, 0.004], [wide / 2 - 0.003, deep / 2, thick - 0.004], ["front", "right"]);
    }
    return;
  }
  if (model === "sculpture") {
    pen.box(FRAME2, [-0.1, -0.1, 0], [0.1, 0.1, 0.05]);
    for (const [k, [half, z0, z1]] of [[0.06, 0.05, 0.18], [0.045, 0.18, 0.31], [0.035, 0.31, 0.44]].entries())
      pen.within([0, 0, 0], k * 0.4).box(TOP2, [-half, -half, z0], [half, half, z1], ["top", "front", "back", "left", "right"]);
    return;
  }
  pen.box(FRAME2, [-w / 2, -d / 2, 0], [w / 2, d / 2, 0.02]);
  for (const [x, top] of [[-0.11, 0.24], [0, 0.17], [0.11, 0.2]])
    pen.disc(BEDDING2, [x, 0], 0.03, 0.02, top, sides === 10 ? 8 : 6);
}, shade = (pen, [x, y], radius, z0, z1, sides) => {
  const outline2 = [[radius, z0], [radius * 0.86, z1]];
  pen.lathe(BEDDING2, [x, y], outline2, sides, { top: false });
  const [bottom, top] = outline2.map(([r]) => ringOf2([x, y], r, sides, 0));
  for (let i = 0;i < sides; i++) {
    const j = (i + 1) % sides;
    pen.face(BEDDING2, [[...bottom[i], z0], [...top[i], z1], [...top[j], z1], [...bottom[j], z0]], [x - (bottom[i][0] + bottom[j][0]) / 2, y - (bottom[i][1] + bottom[j][1]) / 2, 0]);
  }
}, lamp = (pen, { w, h, model }, level) => {
  if (level <= 1) {
    pen.leg(METAL2, [model === "arc" ? -w / 2 + 0.15 : 0, 0], 0.04, 0, h * 0.75, 4);
    return pen.disc(BEDDING2, [model === "arc" ? w / 2 - 0.22 : 0, 0], model === "table" ? 0.16 : 0.2, h - (model === "table" ? 0.24 : 0.3), h, 6);
  }
  const sides = level >= 3 ? 12 : 8;
  if (model === "table") {
    pen.lathe(TOP2, [0, 0], [[0.07, 0], [0.11, 0.08], [0.09, 0.2], [0.03, 0.27]], level >= 3 ? 10 : 6);
    pen.leg(METAL2, [0, 0], 0.018, 0.27, 0.34, 4);
    return shade(pen, [0, 0], 0.17, 0.32, h, sides);
  }
  if (model === "arc") {
    const [x0, x1] = [-w / 2 + 0.15, w / 2 - 0.22];
    pen.box(TOP2, [x0 - 0.15, -0.15, 0], [x0 + 0.15, 0.15, 0.1]);
    const steps = level >= 3 ? 8 : 4;
    const arc = Array.from({ length: steps + 1 }, (_, i) => [x0 + (x1 - x0) * (1 - Math.cos(i / steps * Math.PI / 2)), 0.1 + (h - 0.27) * Math.sin(i / steps * Math.PI / 2)]);
    pen.profile(METAL2, thickened(arc, 0.024), 1, -0.012, 0.012);
    return pen.lathe(METAL2, [x1, 0], [[0.2, h - 0.3], [0.13, h - 0.2], [0.05, h - 0.16]], sides);
  }
  pen.disc(METAL2, [0, 0], 0.16, 0, 0.025, sides);
  pen.leg(METAL2, [0, 0], 0.025, 0.025, h - 0.32, level >= 3 ? 6 : 4);
  shade(pen, [0, 0], 0.22, h - 0.34, h, sides);
}, hook = (pen, [x, y, z], angle) => {
  const arm = pen.within([x, y, z], angle);
  arm.box(METAL2, [-0.008, 0, -0.008], [0.008, 0.09, 0.008], ["top", "front", "left", "right", "bottom"]);
  arm.box(METAL2, [-0.008, 0.075, 0.008], [0.008, 0.09, 0.04], ["top", "front", "back", "left", "right"]);
}, rack = (pen, { w, d, h, model }, level) => {
  if (level <= 1) {
    if (model === "wall")
      return pen.box(FRAME2, [-w / 2, -d / 2, 0], [w / 2, -d / 2 + 0.03, h], ["front", "top"]);
    if (model === "rail")
      return pen.box(METAL2, [-w / 2, -0.02, h - 0.04], [w / 2, 0.02, h], ["top", "front", "back", "bottom"]);
    return pen.leg(FRAME2, [0, 0], 0.05, 0, h, 4);
  }
  if (model === "wall") {
    pen.box(FRAME2, [-w / 2, -d / 2, 0], [w / 2, -d / 2 + 0.025, 0.16], ["top", "front", "left", "right", "bottom"]);
    pen.box(FRAME2, [-w / 2, -d / 2, h - 0.025], [w / 2, d / 2, h], ["top", "front", "left", "right", "bottom"]);
    for (let i = 0;i < 5; i++)
      hook(pen, [-w / 2 + 0.09 + i * (w - 0.18) / 4, -d / 2 + 0.025, 0.08], 0);
    return;
  }
  if (model === "rail") {
    for (const x of [-w / 2 + 0.03, w / 2 - 0.03]) {
      pen.box(METAL2, [x - 0.02, -d / 2, 0], [x + 0.02, d / 2, 0.03]);
      pen.leg(METAL2, [x, 0], 0.03, 0.03, h - 0.03, 4);
    }
    pen.box(METAL2, [-w / 2, -0.015, h - 0.03], [w / 2, 0.015, h], ["top", "front", "back", "left", "right", "bottom"]);
    return;
  }
  const sides = level >= 3 ? 8 : 6;
  if (model === "standing")
    pen.disc(FRAME2, [0, 0], 0.22, 0, 0.03, sides);
  else
    for (let i = 0;i < 3; i++)
      pen.within([0, 0, 0], 2 * Math.PI * i / 3).box(FRAME2, [-0.02, 0, 0], [0.02, w / 2, 0.04], ["top", "front", "left", "right"]);
  pen.leg(FRAME2, [0, 0], 0.04, 0.03, h - 0.03, sides);
  pen.disc(FRAME2, [0, 0], 0.035, h - 0.03, h, sides);
  const hooks = level >= 3 ? 6 : 3;
  for (let i = 0;i < hooks; i++)
    hook(pen, [0, 0, h - 0.12 - i % 2 * 0.12], 2 * Math.PI * i / hooks);
}, DECOR;
var init_furniture_decor = __esm(() => {
  init_furniture_shapes();
  [FRAME2, COVER2, BEDDING2, THROW2, METAL2, TOP2, ART] = [0, 1, 2, 3, 4, 5, 6];
  SIZES = Object.freeze({
    plant: { tall: [0.72, 0.72, 1.4], bush: [0.75, 0.75, 0.85], cactus: [0.45, 0.45, 1.3] },
    ornament: { vase: [0.2, 0.2, 0.36], bowl: [0.36, 0.36, 0.1], jar: [0.24, 0.24, 0.3], books: [0.3, 0.24, 0.12], sculpture: [0.2, 0.2, 0.44], candles: [0.34, 0.14, 0.24] },
    lamp: { floor: [0.45, 0.45, 1.62], arc: [1.3, 0.42, 2.02], table: [0.36, 0.36, 0.56] },
    rack: { standing: [0.5, 0.5, 1.8], tree: [0.62, 0.62, 1.82], wall: [0.9, 0.24, 0.34], rail: [1.2, 0.5, 1.6] }
  });
  PICTURE = Object.freeze({ bar: { framed: 0.045, mounted: 0.03, canvas: 0 }, mount: 0.07, deep: 0.045 });
  TURNED = Object.freeze({
    vase: [[0.055, 0], [0.085, 0.07], [0.098, 0.16], [0.07, 0.27], [0.042, 0.33], [0.05, 0.36]],
    bowl: [[0.07, 0], [0.13, 0.035], [0.17, 0.08], [0.178, 0.1]],
    jar: [[0.075, 0], [0.11, 0.06], [0.118, 0.14], [0.09, 0.21], [0.062, 0.235], [0.066, 0.25], [0.025, 0.28], [0.02, 0.3]]
  });
  DECOR = Object.freeze({
    rug: { draw: rug, seat: null, solids: () => [] },
    picture: { draw: picture, seat: null, solids: () => [] },
    plant: { draw: plant, seat: null, solids: () => [] },
    ornament: { draw: ornament, seat: null, solids: () => [] },
    lamp: { draw: lamp, seat: null, solids: () => [] },
    rack: { draw: rack, seat: null, solids: () => [] }
  });
});

// src/build/kinds/furniture-fittings.js
var FRAME3, COVER3, BEDDING3, THROW3, METAL3, TOP3, SIT2 = 0.175, ON_CHAIR2 = "dcl/sitting-chair-1", ON_THE_GROUND = "dcl/sitting-ground-1", SIZES2, HEIGHTS2, fronts = (x0, x1, count) => Array.from({ length: count }, (_, i) => [x0 + (x1 - x0) * i / count + (i ? 0.002 : 0), x0 + (x1 - x0) * (i + 1) / count - (i < count - 1 ? 0.002 : 0)]), pull = (pen, [x, y, z], long, across = false) => pen.box(METAL3, across ? [x - long / 2, y, z - 0.008] : [x - 0.008, y, z - long / 2], across ? [x + long / 2, y + 0.018, z + 0.008] : [x + 0.008, y + 0.018, z + long / 2], across ? ["top", "front", "bottom"] : ["front", "left", "right"]), front = (pen, min, max, level, slot = COVER3) => pen.box(slot, min, max, level >= 3 ? ["top", "front", "left", "right", "bottom"] : ["front"]), tap = (pen, [x, y], z, high = 0.22) => {
  pen.leg(METAL3, [x, y], 0.03, z, z + high, 6);
  pen.box(METAL3, [x - 0.012, y, z + high - 0.03], [x + 0.012, y + 0.15, z + high], ["top", "front", "left", "right", "bottom"]);
}, wardrobe = (pen, { w, d, h, model }, level) => {
  const [x0, x1, y0, y1] = [-w / 2, w / 2, -d / 2, d / 2];
  if (level <= 1)
    return pen.box(model === "open" ? FRAME3 : COVER3, [x0, y0, 0], [x1, y1, h]);
  pen.box(FRAME3, [x0, y0, 0.08], [x1, y1 - 0.055, h], model === "open" ? ["top", "left", "right", "front"] : ["top", "left", "right"]);
  pen.box(FRAME3, [x0 + 0.03, y0, 0], [x1 - 0.03, y1 - 0.085, 0.08], ["front"]);
  if (model === "open") {
    pen.face(FRAME3, [[x1 - 0.02, y0 + 0.02, 0.1], [x0 + 0.02, y0 + 0.02, 0.1], [x0 + 0.02, y0 + 0.02, h - 0.02], [x1 - 0.02, y0 + 0.02, h - 0.02]], [0, 1, 0]);
    for (const z of [h - 0.32, 0.38])
      pen.box(FRAME3, [x0 + 0.02, y0 + 0.02, z], [x1 - 0.02, y1 - 0.05, z + 0.025], ["top", "front", "bottom"]);
    pen.box(METAL3, [x0 + 0.02, -0.012, h - 0.42], [x1 - 0.02, 0.012, h - 0.4], ["top", "front", "back", "bottom"]);
    return;
  }
  const count = model === "sliding" ? w > 2 ? 3 : 2 : Math.max(2, Math.min(5, Math.round(w / 0.55)));
  for (const [i, [a0, a1]] of fronts(x0 + 0.005, x1 - 0.005, count).entries()) {
    const ahead = model === "sliding" ? i % 2 * 0.025 : 0;
    front(pen, [a0, y1 - 0.055 + ahead, 0.085], [a1, y1 - 0.035 + ahead, h - 0.005], level);
    if (level < 3)
      continue;
    if (model === "sliding")
      pen.box(METAL3, [i % 2 ? a0 + 0.01 : a1 - 0.03, y1 - 0.035 + ahead, 0.9], [i % 2 ? a0 + 0.03 : a1 - 0.01, y1 - 0.03 + ahead, 1.3], ["front", "left", "right"]);
    else
      pull(pen, [i % 2 ? a0 + 0.05 : a1 - 0.05, y1 - 0.02, 1.05], 0.3);
  }
}, shelf = (pen, { w, d, h, model }, level) => {
  const [x0, x1, y0, y1] = [-w / 2, w / 2, -d / 2, d / 2];
  if (level <= 1)
    return pen.box(FRAME3, [x0, y0, 0], [x1, y1, h]);
  if (model === "ladder") {
    for (const x of [x0, x1 - 0.035])
      pen.profile(FRAME3, [[y1, 0], [y1 - 0.05, 0], [y0, h], [y0 + 0.05, h]], 0, x, x + 0.035);
    for (const [k, z] of [0.3, 0.75, 1.2, 1.62].map((z2) => z2 * h / 1.9).entries()) {
      const front2 = y1 - 0.05 - (y1 - y0 - 0.05) * z / h;
      pen.box(FRAME3, [x0 + 0.035, Math.max(y0, front2 - (0.3 - k * 0.05)), z], [x1 - 0.035, front2, z + 0.025], ["top", "front", "back", "bottom"]);
    }
    return;
  }
  for (const [a, b] of [[x0, x0 + 0.025], [x1 - 0.025, x1]])
    pen.box(FRAME3, [a, y0, 0], [b, y1, h], ["front", "left", "right", "top"]);
  pen.box(FRAME3, [x0 + 0.025, y0, h - 0.025], [x1 - 0.025, y1, h], ["top", "front", "bottom"]);
  pen.face(FRAME3, [[x1 - 0.025, y0 + 0.01, 0], [x0 + 0.025, y0 + 0.01, 0], [x0 + 0.025, y0 + 0.01, h - 0.025], [x1 - 0.025, y0 + 0.01, h - 0.025]], [0, 1, 0]);
  if (model === "cubes") {
    const [columns, rows] = [Math.max(2, Math.round((w - 0.05) / 0.38)), 4];
    const [cw, rh] = [(w - 0.05) / columns, (h - 0.05) / rows];
    for (let j = 0;j < rows; j++)
      pen.box(FRAME3, [x0 + 0.025, y0, j * rh], [x1 - 0.025, y1, j * rh + 0.025], ["top", "front"]);
    for (let i = 1;i < columns; i++)
      pen.box(FRAME3, [x0 + 0.025 + i * cw - 0.0125, y0, 0], [x0 + 0.025 + i * cw + 0.0125, y1, h - 0.025], ["front", "left", "right"]);
    if (level >= 3)
      for (let i = 0;i < columns; i++)
        for (let j = 0;j < rows; j++) {
          if ((i + 2 * j) % 3)
            continue;
          pen.box((i + j) % 2 ? COVER3 : THROW3, [x0 + 0.05 + i * cw, y0 + 0.04, j * rh + 0.04], [x0 + i * cw + cw - 0.005, y1 - 0.02, j * rh + rh - 0.04], ["top", "front"]);
        }
    return;
  }
  const shelves = 5;
  const pitch = (h - 0.05) / shelves;
  for (let j = 0;j < shelves; j++)
    pen.box(FRAME3, [x0 + 0.025, y0, j * pitch], [x1 - 0.025, y1, j * pitch + 0.025], ["top", "front", "bottom"]);
  const inner = w - 0.05;
  for (let j = 0;j < shelves; j++) {
    const groups = level >= 3 ? [[0.04, 0.3, 0.86], [0.38, 0.62, 0.74], [0.7, 0.9, 0.8]] : [[0.05, 0.85, 0.8]];
    for (const [k, [g0, g1, tall]] of groups.entries()) {
      if ((j + k) % 4 === 3)
        continue;
      const z = j * pitch + 0.025;
      pen.box((j + k) % 2 ? COVER3 : THROW3, [x0 + 0.025 + inner * g0, y0 + 0.04, z], [x0 + 0.025 + inner * g1, y1 - 0.03, z + (pitch - 0.025) * tall], ["top", "front", "left", "right"]);
    }
  }
}, sideboard = (pen, { w, d, h, model }, level) => {
  const [x0, x1, y0, y1] = [-w / 2, w / 2, -d / 2, d / 2];
  const legs = model === "legs";
  const bottom = legs ? 0.22 : 0.08;
  if (level <= 1)
    return pen.box(FRAME3, [x0, y0, legs ? bottom : 0], [x1, y1, h]);
  pen.box(FRAME3, [x0, y0, bottom], [x1, y1 - 0.04, h], ["top", "left", "right", ...legs ? ["bottom"] : []]);
  if (legs)
    for (const at of [[x0 + 0.06, y0 + 0.06], [x1 - 0.06, y0 + 0.06], [x1 - 0.06, y1 - 0.08], [x0 + 0.06, y1 - 0.08]])
      pen.leg(FRAME3, at, 0.035, 0, bottom, 4);
  else
    pen.box(FRAME3, [x0 + 0.03, y0, 0], [x1 - 0.03, y1 - 0.07, bottom], ["front"]);
  if (model === "drawers") {
    for (const [a0, a1] of fronts(x0 + 0.005, x1 - 0.005, 3))
      for (const [z0, z1] of fronts(bottom + 0.005, h - 0.005, 3)) {
        front(pen, [a0, y1 - 0.04, z0], [a1, y1 - 0.02, z1], level);
        if (level >= 3)
          pull(pen, [(a0 + a1) / 2, y1 - 0.02, z1 - 0.05], 0.14, true);
      }
    return;
  }
  const count = Math.max(2, Math.min(4, Math.round(w / 0.5)));
  for (const [i, [a0, a1]] of fronts(x0 + 0.005, x1 - 0.005, count).entries()) {
    front(pen, [a0, y1 - 0.04, bottom + 0.005], [a1, y1 - 0.02, h - 0.005], level);
    if (level >= 3)
      pull(pen, [i % 2 ? a0 + 0.04 : a1 - 0.04, y1 - 0.02, h - 0.18], 0.16);
  }
}, screen = (pen, wide, y, z) => {
  const high = wide * 9 / 16;
  pen.box(METAL3, [-wide / 2, y, z], [wide / 2, y + 0.04, z + high], ["top", "front", "left", "right", "bottom", "back"]);
  return high;
}, tv = (pen, { w, d, h, model }, level) => {
  const [x0, x1, y0, y1] = [-w / 2, w / 2, -d / 2, d / 2];
  const wide = Math.min(Math.max(w * 0.72, 0.9), 1.9);
  if (model === "wall") {
    pen.box(FRAME3, [x0, y0, 0], [x1, y1, 0.1], ["top", "front", "left", "right", "bottom"]);
    if (level <= 1)
      return pen.box(METAL3, [-wide / 2, y0, 0.35], [wide / 2, y0 + 0.04, h], ["front"]);
    return screen(pen, wide, y0, 0.35);
  }
  const unit5 = 0.45;
  pen.box(FRAME3, [x0, y0, 0], [x1, y1 - 0.02, unit5], ["top", "left", "right"]);
  if (level <= 1)
    return pen.box(METAL3, [-wide / 2, -0.02, unit5 + 0.06], [wide / 2, 0.02, h], ["front"]);
  for (const [a0, a1] of fronts(x0 + 0.005, x1 - 0.005, 2))
    front(pen, [a0, y1 - 0.02, 0.005], [a1, y1, unit5 - 0.005], level);
  pen.box(METAL3, [-0.15, -0.1, unit5], [0.15, 0.1, unit5 + 0.015], ["top", "front", "back", "left", "right"]);
  pen.box(METAL3, [-0.03, -0.02, unit5 + 0.015], [0.03, 0.01, unit5 + 0.07], ["front", "left", "right"]);
  screen(pen, wide, -0.02, unit5 + 0.06);
}, toilet = (pen, { w, d, h, model }, level) => {
  const [y0, y1] = [-d / 2, d / 2];
  const wall = model === "wall";
  if (level <= 1) {
    pen.box(TOP3, [-w / 2, y0, wall ? 0.26 : 0], [w / 2, y1, 0.44]);
    return pen.box(TOP3, [-w / 2, y0, 0.44], [w / 2, y0 + 0.18, wall ? h : 0.8], ["top", "front", "left", "right"]);
  }
  const soft = level >= 3 ? pen.soft : (slot, min, max, r, faces) => pen.box(slot, min, max, faces);
  const sides = level >= 3 ? 12 : 8;
  if (wall)
    soft(TOP3, [-0.17, y0, 0.26], [0.17, y1 - 0.2, 0.4], 0.04, ["front", "left", "right", "bottom"]);
  else
    pen.box(TOP3, [-0.12, y0 + 0.12, 0], [0.12, y1 - 0.2, 0.36], ["front", "back", "left", "right"]);
  pen.disc(TOP3, [0, y1 - 0.22], 0.19, wall ? 0.34 : 0.36, 0.41, sides, { top: false });
  pen.disc(COVER3, [0, y1 - 0.22], 0.195, 0.41, 0.44, sides);
  if (wall)
    pen.box(METAL3, [-0.12, y0, h - 0.17], [0.12, y0 + 0.012, h], ["top", "front", "left", "right", "bottom"]);
  else {
    soft(TOP3, [-w / 2, y0, 0.41], [w / 2, y0 + 0.18, h - 0.006], 0.02);
    pen.box(METAL3, [-0.03, y0 + 0.07, h - 0.006], [0.03, y0 + 0.11, h], ["top", "front", "back", "left", "right"]);
  }
}, basin = (pen, { w, d, h, model }, level) => {
  const [x0, x1, y0, y1] = [-w / 2, w / 2, -d / 2, d / 2];
  const counter = 0.85;
  const sides = level >= 3 ? 12 : 8;
  const vessel = (x) => {
    const outline2 = level >= 3 ? [[0.15, 0], [0.19, 0.05], [0.205, 0.12]] : [[0.16, 0], [0.205, 0.12]];
    pen.lathe(BEDDING3, [x, 0.02], outline2, sides, { top: false });
    pen.disc(BEDDING3, [x, 0.02], 0.17, counter + 0.02, counter + 0.03, sides, { sideSlot: BEDDING3 });
    if (level >= 3)
      tap(pen, [x, y0 + 0.08], counter, Math.min(0.22, h - counter - 0.005));
  };
  if (model === "pedestal") {
    if (level <= 1)
      return pen.box(BEDDING3, [x0, y0, 0], [x1, y1, counter]);
    pen.box(BEDDING3, [-0.11, y0 + 0.04, 0], [0.11, 0.08, 0.74], ["front", "left", "right"]);
    (level >= 3 ? pen.soft : (slot, min, max) => pen.box(slot, min, max))(BEDDING3, [x0, y0, 0.74], [x1, y1, counter], 0.04);
    pen.disc(TOP3, [0, 0.02], 0.17, counter - 0.06, counter - 0.055, sides, { sideSlot: TOP3 });
    if (level >= 3)
      tap(pen, [0, y0 + 0.07], counter, Math.min(0.12, h - counter - 0.005));
    return;
  }
  if (level <= 1)
    return pen.box(FRAME3, [x0, y0, 0], [x1, y1, counter]);
  pen.box(FRAME3, [x0, y0, 0.12], [x1, y1 - 0.04, counter - 0.03], ["left", "right", "bottom"]);
  const count = model === "double" ? 4 : 2;
  for (const [i, [a0, a1]] of fronts(x0 + 0.005, x1 - 0.005, count).entries()) {
    front(pen, [a0, y1 - 0.04, 0.125], [a1, y1 - 0.02, counter - 0.035], level);
    if (level >= 3)
      pull(pen, [i % 2 ? a0 + 0.04 : a1 - 0.04, y1 - 0.02, counter - 0.15], 0.14);
  }
  pen.box(TOP3, [x0, y0, counter - 0.03], [x1, y1, counter], ["top", "front", "left", "right", "bottom"]);
  for (const x of model === "double" ? [x0 + w / 4, x1 - w / 4] : [0])
    vessel(x);
}, stadium = (w, d, inset, steps) => {
  const radius = d / 2 - inset;
  const centres = [w / 2 - d / 2, -(w / 2 - d / 2)];
  return centres.flatMap((cx, end) => Array.from({ length: steps + 1 }, (_, i) => {
    const angle = -Math.PI / 2 + Math.PI * i / steps + end * Math.PI;
    return [cx + radius * Math.cos(angle), radius * Math.sin(angle)];
  }));
}, RIM, bath = (pen, { w, d, model }, level) => {
  const [x0, x1, y0, y1] = [-w / 2, w / 2, -d / 2, d / 2];
  const [rim, floor, h] = [0.06, 0.2, RIM[model]];
  if (level <= 1)
    return pen.box(FRAME3, [x0, y0, 0], [x1, y1, h]);
  if (model === "built") {
    pen.box(FRAME3, [x0, y0, 0], [x1, y1, h - 0.03], ["front", "left", "right", "back"]);
    const [i0, i1, j0, j1] = [x0 + rim, x1 - rim, y0 + rim, y1 - rim];
    for (const [min, max] of [[[x0, y0, h - 0.03], [x1, j0, h]], [[x0, j1, h - 0.03], [x1, y1, h]], [[x0, j0, h - 0.03], [i0, j1, h]], [[i1, j0, h - 0.03], [x1, j1, h]]])
      pen.box(TOP3, min, max, ["top", "front", "back", "left", "right"]);
    for (const [points, inward] of [
      [[[i0, j0, floor], [i1, j0, floor], [i1, j0, h - 0.03], [i0, j0, h - 0.03]], [0, 1, 0]],
      [[[i1, j1, floor], [i0, j1, floor], [i0, j1, h - 0.03], [i1, j1, h - 0.03]], [0, -1, 0]],
      [[[i0, j1, floor], [i0, j0, floor], [i0, j0, h - 0.03], [i0, j1, h - 0.03]], [1, 0, 0]],
      [[[i1, j0, floor], [i1, j1, floor], [i1, j1, h - 0.03], [i1, j0, h - 0.03]], [-1, 0, 0]]
    ])
      pen.face(TOP3, points, inward);
    pen.face(TOP3, [[i0, j0, floor], [i1, j0, floor], [i1, j1, floor], [i0, j1, floor]], [0, 0, 1]);
    if (level >= 3)
      tap(pen, [x1 - 0.03, 0], h, 0.16);
    return;
  }
  const steps = level >= 3 ? 6 : 3;
  const [outer, inner] = [stadium(w, d, 0, steps), stadium(w, d, rim, steps)];
  const foot = 0.08;
  const n = outer.length;
  for (let i = 0;i < n; i++) {
    const j = (i + 1) % n;
    const [p, q, r, s] = [outer[i], outer[j], inner[i], inner[j]];
    const out = [q[1] - p[1], -(q[0] - p[0]), 0];
    pen.face(FRAME3, [[...p, foot], [...q, foot], [...q, h], [...p, h]], out);
    pen.face(TOP3, [[...p, h], [...q, h], [...s, h], [...r, h]], [0, 0, 1]);
    pen.face(TOP3, [[...r, floor], [...s, floor], [...s, h], [...r, h]], out.map((v) => -v));
  }
  pen.face(TOP3, inner.map(([x, y]) => [x, y, floor]), [0, 0, 1]);
  pen.face(FRAME3, outer.map(([x, y]) => [x, y, foot]), [0, 0, -1]);
  for (const [x, y] of [[x0 + 0.25, y0 + 0.12], [x1 - 0.25, y0 + 0.12], [x1 - 0.25, y1 - 0.12], [x0 + 0.25, y1 - 0.12]])
    pen.leg(METAL3, [x, y], 0.05, 0, foot, 4);
  if (level >= 3)
    tap(pen, [x1 - 0.14, -0.05], h, 0.1);
}, bathSeat = () => ({ pose: ON_THE_GROUND, turn: -90, places: [[0, 0, 0.2 + 0.15]] }), shower = (pen, { w, d, h, model }, level) => {
  const [x0, x1, y0, y1] = [-w / 2, w / 2, -d / 2, d / 2];
  if (level <= 1)
    return pen.box(TOP3, [x0, y0, 0], [x1, y1, 0.05], ["top"]);
  pen.box(TOP3, [x0, y0, 0], [x1, y1, 0.05]);
  pen.face(METAL3, ringOf2([0, 0], 0.05, 8).map(([x, y]) => [x, y, 0.051]), [0, 0, 1]);
  pen.leg(METAL3, [x0 + 0.15, y0 + 0.03], 0.025, 0.05, h - 0.05, 6);
  pen.box(METAL3, [x0 + 0.14, y0 + 0.02, h - 0.07], [x0 + 0.16, y0 + 0.35, h - 0.05], ["top", "front", "left", "right", "bottom"]);
  pen.disc(METAL3, [x0 + 0.15, y0 + 0.35], 0.11, h - 0.09, h - 0.07, level >= 3 ? 10 : 6, { bottom: true });
  if (model === "walk") {
    pen.box(FRAME3, [x1 - 0.1, y0, 0.05], [x1, y0 + d * 0.6, h], ["top", "front", "left", "right"]);
    return;
  }
  for (const x of [x0 + 0.02, x1 - 0.02])
    pen.leg(METAL3, [x, y1 - 0.02], 0.03, 0.05, h, 4);
  pen.box(METAL3, [x0, y1 - 0.035, h - 0.03], [x1, y1 - 0.005, h], ["top", "front", "back", "bottom"]);
  pen.box(METAL3, [x1 - 0.035, y0, h - 0.03], [x1 - 0.005, y1 - 0.035, h], ["top", "left", "right", "bottom"]);
}, KITCHEN, kitchen = (pen, { w, d, h, model }, level) => {
  const [x0, x1, y0, y1] = [-w / 2, w / 2, -d / 2, d / 2];
  const { counter, plinth } = KITCHEN;
  if (model === "tall") {
    if (level <= 1)
      return pen.box(FRAME3, [x0, y0, 0], [x1, y1, h]);
    pen.box(FRAME3, [x0, y0, plinth], [x1, y1 - 0.04, h], ["top", "left", "right"]);
    pen.box(FRAME3, [x0 + 0.03, y0, 0], [x1 - 0.03, y1 - 0.08, plinth], ["front"]);
    const columns = fronts(x0 + 0.004, x1 - 0.004, Math.max(1, Math.round(w / KITCHEN.unit)));
    for (const [k, [a0, a1]] of columns.entries()) {
      const oven = k % 2 === 1;
      for (const [z0, z1] of oven ? [[plinth + 0.004, 0.86], [0.864, 1.46], [1.464, h - 0.004]] : [[plinth + 0.004, 1.3], [1.304, h - 0.004]]) {
        const middle = oven && z0 > 0.8 && z0 < 0.9;
        front(pen, [a0, y1 - 0.04, z0], [a1, y1 - 0.02, z1], level, middle ? METAL3 : COVER3);
        if (middle && level >= 3)
          pen.face(THROW3, [[a1 - 0.05, y1 - 0.019, z0 + 0.06], [a0 + 0.05, y1 - 0.019, z0 + 0.06], [a0 + 0.05, y1 - 0.019, z1 - 0.12], [a1 - 0.05, y1 - 0.019, z1 - 0.12]], [0, 1, 0]);
        if (level >= 3)
          pull(pen, [middle ? (a0 + a1) / 2 : a1 - 0.05, y1 - 0.02, middle ? z1 - 0.06 : z0 + (z1 - z0) / 2], middle ? 0.3 : 0.4, middle);
      }
    }
    return;
  }
  const deep = model === "island" ? d : KITCHEN.deep;
  const [t0, t1] = model === "island" ? [y0, y1] : [y0, y0 + deep];
  if (level <= 1) {
    pen.box(FRAME3, [x0, t0, 0], [x1, t1, counter]);
    if (model === "run")
      pen.box(COVER3, [x0, y0, KITCHEN.upper[0]], [x1, y0 + KITCHEN.upperDeep, KITCHEN.upper[1]], ["front", "bottom"]);
    return;
  }
  const units = Math.max(2, Math.round(w / KITCHEN.unit));
  const face2 = model === "island" ? t1 - 0.32 : t1 - 0.04;
  pen.box(FRAME3, [x0, t0 + (model === "island" ? 0.04 : 0), plinth], [x1, face2, counter - 0.04], model === "island" ? ["left", "right", "front"] : ["left", "right"]);
  pen.box(FRAME3, [x0 + 0.03, t0 + (model === "island" ? 0.08 : 0), 0], [x1 - 0.03, face2 - 0.04, plinth], ["front", ...model === "island" ? ["back"] : []]);
  const side2 = model === "island" ? t0 + 0.04 : face2;
  const outward = model === "island" ? -1 : 1;
  for (const [i, [a0, a1]] of fronts(x0 + 0.004, x1 - 0.004, units).entries()) {
    const [f0, f1] = outward > 0 ? [side2, side2 + 0.02] : [side2 - 0.02, side2];
    pen.box(COVER3, [a0, f0, plinth + 0.004], [a1, f1, counter - 0.044], level >= 3 ? ["top", outward > 0 ? "front" : "back", "left", "right", "bottom"] : [outward > 0 ? "front" : "back"]);
    if (level >= 3)
      pull(pen, [(a0 + a1) / 2, outward > 0 ? f1 : f0 - 0.018, counter - 0.1], 0.18, true);
  }
  pen.box(TOP3, [x0, t0, counter - 0.04], [x1, t1, counter], ["top", "front", "back", "left", "right", "bottom"]);
  if (model === "island")
    return;
  const sink = [x0 + w * 0.3, -0.05 + y0 + deep / 2];
  pen.face(METAL3, [[sink[0] - 0.3, sink[1] - 0.2, counter + 0.001], [sink[0] + 0.3, sink[1] - 0.2, counter + 0.001], [sink[0] + 0.3, sink[1] + 0.2, counter + 0.001], [sink[0] - 0.3, sink[1] + 0.2, counter + 0.001]], [0, 0, 1]);
  if (level >= 3)
    tap(pen, [sink[0], y0 + 0.08], counter, 0.3);
  const hob = [x1 - w * 0.28, y0 + deep / 2];
  pen.face(THROW3, [[hob[0] - 0.3, hob[1] - 0.25, counter + 0.001], [hob[0] + 0.3, hob[1] - 0.25, counter + 0.001], [hob[0] + 0.3, hob[1] + 0.25, counter + 0.001], [hob[0] - 0.3, hob[1] + 0.25, counter + 0.001]], [0, 0, 1]);
  if (model === "counter")
    return;
  const [u0, u1] = KITCHEN.upper;
  const upperFront = y0 + KITCHEN.upperDeep;
  pen.box(FRAME3, [x0, y0, u0], [x1, upperFront - 0.02, u1], ["top", "left", "right", "bottom"]);
  for (const [a0, a1] of fronts(x0 + 0.004, x1 - 0.004, units)) {
    if (a1 > hob[0] - 0.32 && a0 < hob[0] + 0.32)
      continue;
    pen.box(COVER3, [a0, upperFront - 0.02, u0 + 0.004], [a1, upperFront, u1 - 0.004], level >= 3 ? ["front", "left", "right", "bottom"] : ["front"]);
  }
  pen.box(METAL3, [hob[0] - 0.32, y0, u0 - 0.1], [hob[0] + 0.32, y0 + 0.5, u0 + 0.05], ["front", "left", "right", "bottom"]);
}, kitchenSolids = ({ w, d, h, model }) => {
  if (model === "tall")
    return [[[-w / 2, -d / 2, 0], [w / 2, d / 2, h]]];
  if (model === "island")
    return [[[-w / 2, -d / 2, 0], [w / 2, d / 2 - 0.3, KITCHEN.counter]]];
  return [[[-w / 2, -d / 2, 0], [w / 2, -d / 2 + KITCHEN.deep, KITCHEN.counter]]];
}, box = ({ w, d, h }) => [[[-w / 2, -d / 2, 0], [w / 2, d / 2, h]]], FITTINGS;
var init_furniture_fittings = __esm(() => {
  init_furniture_shapes();
  [FRAME3, COVER3, BEDDING3, THROW3, METAL3, TOP3] = [0, 1, 2, 3, 4, 5];
  SIZES2 = Object.freeze({
    toilet: { floor: [0.4, 0.68, 0.8], wall: [0.38, 0.56, 1.06] },
    basin: { pedestal: [0.56, 0.46, 0.98] }
  });
  HEIGHTS2 = Object.freeze({
    shelf: { books: 2, cubes: 1.5, ladder: 1.9 },
    tv: { stand: 1.5, wall: 1.15 },
    bath: { built: 0.75, free: 0.77 },
    kitchen: { run: 2.3, island: 0.92, tall: 2.2, counter: 1.22 }
  });
  RIM = Object.freeze({ built: 0.58, free: 0.66 });
  KITCHEN = Object.freeze({ counter: 0.92, deep: 0.62, plinth: 0.1, upper: [1.45, 2.3], upperDeep: 0.36, unit: 0.6 });
  FITTINGS = Object.freeze({
    wardrobe: { draw: wardrobe, seat: null, solids: box },
    shelf: { draw: shelf, seat: null, solids: box },
    sideboard: { draw: sideboard, seat: null, solids: box },
    tv: { draw: tv, seat: null, solids: ({ w, d, model }) => model === "wall" ? [] : [[[-w / 2, -d / 2, 0], [w / 2, d / 2, 0.45]]] },
    toilet: {
      draw: toilet,
      seat: ({ d }) => ({ pose: ON_CHAIR2, places: [[0, d / 2 - 0.24, 0.44 + SIT2]] }),
      solids: ({ w, d, h, model }) => [[[-w / 2, -d / 2, model === "wall" ? 0.26 : 0], [w / 2, d / 2, 0.44]], [[-w / 2, -d / 2, 0.44], [w / 2, -d / 2 + 0.18, model === "wall" ? 0.6 : h]]]
    },
    basin: { draw: basin, seat: null, solids: ({ w, d }) => [[[-w / 2, -d / 2, 0], [w / 2, d / 2, 0.85]]] },
    bath: { draw: bath, seat: bathSeat, solids: ({ w, d, model }) => [[[-w / 2, -d / 2, 0], [w / 2, d / 2, RIM[model]]]] },
    shower: { draw: shower, seat: null, solids: () => [] },
    kitchen: { draw: kitchen, seat: null, solids: kitchenSolids }
  });
});

// src/build/kinds/furniture-gen.js
var exports_furniture_gen = {};
__export(exports_furniture_gen, {
  tintsOf: () => tintsOf,
  solidsOf: () => solidsOf2,
  seatOf: () => seatOf,
  drawPiece: () => drawPiece,
  dimsOf: () => dimsOf,
  default: () => furniture_gen_default,
  boxOf: () => boxOf2
});
var PIECES2, OWN, RANGES, ART2 = 6, clamp6 = (v, least, most) => Math.min(Math.max(v, least), most), toMillimetre = (v) => Math.round(v * 1000) / 1000, ROUND5, shapeOf2 = (value) => Number.isFinite(value) ? clamp6(value, 0, 1) : 0.5, shareOf2 = (t, [least, most]) => t < 0.5 ? least + (1 - least) * t * 2 : 1 + (most - 1) * (t - 0.5) * 2, dimsOf = (params) => {
  const type = TYPE_NAMES[params.type] ?? TYPE_NAMES[0];
  const spec = TYPES[type];
  const models = Object.keys(spec.models);
  const model = models[params[spec.model]] ?? models[0];
  let [[w0, w1], [d0, d1]] = [spec.width, spec.depth];
  const tall = SHAPED.tall[type] && !(type === "sofa" && model === "modular") ? shareOf2(shapeOf2(params.tall), SHAPED.tall[type]) : 1;
  const legs = SHAPED.legs.includes(type) ? shapeOf2(params.legs) : 0.5;
  const stout = SHAPED.stout.includes(type) ? shapeOf2(params.stout) : 0.5;
  const own = OWN[type]?.[model];
  if (FIXED.includes(type) || own) {
    const [w2, d2, h2] = own;
    return { type, model, w: w2, d: d2, h: h2, count: 1, legs, stout };
  }
  const ranges = RANGES[type]?.[model] ?? RANGES[type]?.["*"];
  if (ranges)
    [[w0, w1], [d0, d1]] = ranges;
  if (model === "round")
    w1 = Math.min(w1, ROUND5[type] ?? w1);
  const w = toMillimetre(clamp6(params.width || spec.width[2], w0, w1));
  const d = model === "round" || type === "stool" ? w : toMillimetre(clamp6(params.depth || spec.depth[2], d0, d1));
  const screen2 = Math.min(Math.max(w * 0.72, 0.9), 1.9) * 9 / 16;
  const h = type === "picture" ? toMillimetre(clamp6(params.height || spec.tall[2], spec.tall[0], spec.tall[1])) : type === "rug" && model === "fitted" ? 0.008 : type === "tv" ? toMillimetre((model === "wall" ? 0.35 : 0.51) + screen2 + 0.005) : toMillimetre((HEIGHTS[type]?.[model] ?? HEIGHTS2[type]?.[model] ?? spec.height) * tall);
  const count = ROW[type] ? Math.round(clamp6(params.count || 1, 1, MOST_IN_ROW)) : 1;
  return { type, model, w, d, h, count, legs, stout };
}, tintsOf = (params, surface) => tintsFor(params, CLOTH[TYPE_NAMES[params.type] ?? TYPE_NAMES[0]] ?? [], FACES2.length, surface), BOARD2 = 0.06, ROW, MOST_IN_ROW = 6, rowOf2 = ({ type, w, count }) => Array.from({ length: count }, (_, i) => (i - (count - 1) / 2) * (w + (ROW[type] ?? 0))), boxOf2 = ({ type, w, d, h, count = 1 }) => [toMillimetre(count * w + (count - 1) * (ROW[type] ?? 0) + (type === "bed" ? 2 * BOARD2 : 0)), d, h], draw = (pen, dims, level) => {
  if (dims.count > 1)
    for (const x of rowOf2(dims))
      PIECES2[dims.type].draw(pen.within([x, 0, 0]), dims, level);
  else
    PIECES2[dims.type].draw(pen, dims, level);
}, seatOf = (params) => {
  const dims = dimsOf(params);
  const seat = PIECES2[dims.type].seat?.(dims);
  if (!seat)
    return null;
  const all = rowOf2(dims).flatMap((dx) => seat.places.map(([x, y, z]) => [x + dx, y, z]));
  const [first, ...places] = all.map(([x, y, z]) => [x, y, z - dims.h / 2].map((v) => toMillimetre(v) || 0));
  return { at: first, turn: seat.turn ?? 0, pose: seat.pose, ...places.length && { places } };
}, drawPiece = (mesh, params, level, at = [0, 0, 0], yaw = 0, slotOf = undefined) => {
  const dims = dimsOf(params);
  if (level > 0)
    draw(penOf(mesh, at, yaw, slotOf), dims, level);
  return dims;
}, solidsOf2 = (params) => {
  const dims = dimsOf(params);
  const half = boxOf2(dims)[0] / 2;
  return PIECES2[dims.type].solids(dims).map(([min, max]) => dims.count > 1 ? [[-half, min[1], min[2]], [half, max[1], max[2]]] : [min, max]);
}, furniture_gen_default;
var init_furniture_gen = __esm(() => {
  init_mesh();
  init_furniture_shapes();
  init_furniture_pieces();
  init_furniture_decor();
  init_furniture_fittings();
  init_furniture();
  PIECES2 = Object.freeze({ ...PIECES, ...DECOR, ...FITTINGS });
  OWN = Object.freeze({ ...SIZES, ...SIZES2 });
  RANGES = Object.freeze({
    sofa: { chaise: [[2.3, 3.4], [1.4, 1.8]], modular: [[1.5, 3.4], [0.95, 1.15]], "*": [[1.5, 3.4], [0.85, 1.05]] },
    rug: { runner: [[1.8, 6], [0.6, 1]], round: [[0.8, 4], [0.8, 4]], fitted: [[1, 10], [1, 10]], "*": [[0.6, 6], [0.6, 5]] },
    basin: { vanity: [[0.6, 1.2], [0.5, 0.5]], double: [[1.2, 1.8], [0.5, 0.5]] },
    kitchen: { run: [[1.2, 6], [0.62, 0.62]], counter: [[1.2, 6], [0.62, 0.62]], island: [[1.2, 3], [0.9, 1.3]], tall: [[0.6, 1.2], [0.62, 0.62]] }
  });
  ROUND5 = Object.freeze({ table: 1.6, coffee: 1.1 });
  ROW = Object.freeze({ chair: 0.14, stool: 0.25 });
  furniture_gen_default = Object.freeze({
    fit: (params) => boxOf2(dimsOf(params)),
    resize: (params, size) => {
      const dims = dimsOf(params);
      return { ...params, width: toMillimetre(size[0] - (boxOf2(dims)[0] - dims.w)), depth: size[1] };
    },
    mesh: (params, seed, level, size) => {
      const mesh = createMesh(FACES2.length);
      drawPiece(mesh, params, level);
      return mesh.pack(size, [0, 0, size[2] / 2]);
    },
    seat: seatOf,
    tints: tintsOf,
    covers: (params) => {
      const dims = dimsOf(params);
      return dims.type === "picture" ? { [ART2]: canvasOf(dims) } : {};
    },
    collider: (params) => {
      const half = boxOf2(dimsOf(params))[2] / 2;
      return solidsOf2(params).map(([min, max]) => solidBox([min[0], min[1], min[2] - half], [max[0], max[1], max[2] - half]));
    }
  });
});

// src/build/kinds/room-layout.js
var randomOf3 = (seed) => () => {
  seed = seed + 1831565813 | 0;
  let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
}, round7 = (v) => Math.round(v * 1000) / 1000, pick = (random, list) => list[Math.floor(random() * list.length) % list.length], pieceParams = (type, model, extra = {}) => {
  const spec = TYPES[type];
  return { type: TYPE_NAMES.indexOf(type), [spec.model]: Math.max(0, Object.keys(spec.models).indexOf(model)), ...extra };
}, SIDES6, overlap = (a, b) => Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)) * Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0)), rect2 = (x0, y0, x1, y1) => ({ x0: Math.min(x0, x1), y0: Math.min(y0, y1), x1: Math.max(x0, x1), y1: Math.max(y0, y1) }), hangAt = (height) => Math.min(1.95, Math.max(1.55, height * 0.5)), HAND3, TABLE, CELL = 0.25, SILL = 0.1, OVER = 0.08, TAKES, LYING2, highOf = (piece, box2) => TYPE_NAMES[piece.type] === "kitchen" && dimsOf(piece).model === "counter" ? 0.92 : box2[2], layoutOf3 = (params) => {
  const { width: W, depth: D, height: H } = params;
  const type = ROOM_TYPES[params.type] ?? ROOM_TYPES[0];
  const palette = PALETTES[PALETTE_NAMES[params.palette]] ?? PALETTES.oak;
  const random = randomOf3(params.variant * 7919 + params.type * 131 + params.palette * 17 + 7);
  const shape = Object.keys(TAKES).filter((name) => Number.isFinite(params[name]) && params[name] !== 0.5);
  const shaped = (piece, model, extra = {}) => pieceParams(piece, model, { ...extra, ...Object.fromEntries(shape.filter((name) => TAKES[name](piece)).map((name) => [name, params[name]])) });
  const keep = params.keep.map(([x0, y0, x1, y1]) => rect2(x0, y0, x1, y1));
  const walls = (params.walls.length ? params.walls : [[0, -W / 2, W / 2], [1, -D / 2, D / 2], [2, -W / 2, W / 2], [3, -D / 2, D / 2]]).map(([side2, a0, a1]) => ({ side: Math.round(side2), a0: Math.min(a0, a1), a1: Math.max(a0, a1) }));
  const windows = params.windows.map(([side2, a0, a1, sill]) => ({ side: Math.round(side2), a0: Math.min(a0, a1), a1: Math.max(a0, a1), sill }));
  const taken = [];
  const pieces = [];
  const room2 = rect2(-W / 2, -D / 2, W / 2, D / 2);
  const closed = params.closed.map(([x0, y0, x1, y1]) => rect2(x0, y0, x1, y1));
  const reserved = [...keep, ...closed];
  const kept2 = (r) => reserved.some((k) => overlap(k, r) > 0.000001);
  const free = (r, { keeps = true } = {}) => r.x0 >= room2.x0 - 0.000001 && r.x1 <= room2.x1 + 0.000001 && r.y0 >= room2.y0 - 0.000001 && r.y1 <= room2.y1 + 0.000001 && !(keeps && kept2(r)) && !taken.some((t) => overlap(t, r) > 0.000001);
  const reach = params.way / 2;
  const [nx, ny] = [Math.max(1, Math.round(W / CELL)), Math.max(1, Math.round(D / CELL))];
  const [sx, sy] = [W / nx, D / ny];
  const stopped = new Uint16Array(nx * ny);
  const label = new Int32Array(nx * ny), queue = new Int32Array(nx * ny);
  const cellsAbout = (r, by2) => [
    Math.max(0, Math.ceil((r.x0 - by2 - room2.x0) / sx - 0.5)),
    Math.min(nx - 1, Math.floor((r.x1 + by2 - room2.x0) / sx - 0.5)),
    Math.max(0, Math.ceil((r.y0 - by2 - room2.y0) / sy - 0.5)),
    Math.min(ny - 1, Math.floor((r.y1 + by2 - room2.y0) / sy - 0.5))
  ];
  const mark = (r, k) => {
    const [i0, i1, j0, j1] = cellsAbout(r, reach);
    for (let i = i0;i <= i1; i++)
      for (let j = j0;j <= j1; j++)
        stopped[i * ny + j] += k;
  };
  for (const { side: side2, a0, a1 } of walls) {
    const line = [room2.y0, room2.x1, room2.y1, room2.x0][side2];
    mark(SIDES6[side2].along === 0 ? rect2(a0, line, a1, line) : rect2(line, a0, line, a1), 1);
  }
  for (const r of closed)
    mark(r, 1);
  const ends = params.ways.map(([x0, y0, x1, y1]) => {
    const [i0, i1, j0, j1] = cellsAbout(rect2(x0, y0, x1, y1), 0);
    const cells = [];
    for (let i = i0;i <= i1; i++)
      for (let j = j0;j <= j1; j++)
        cells.push(i * ny + j);
    return cells;
  });
  const joined = () => {
    label.fill(-1);
    let group = 0;
    for (const cells of ends)
      for (const start of cells) {
        if (stopped[start] || label[start] >= 0)
          continue;
        let [head, tail] = [0, 0];
        label[start] = group;
        queue[tail++] = start;
        while (head < tail) {
          const c = queue[head++], i = c / ny | 0, j = c - i * ny;
          if (i > 0 && !stopped[c - ny] && label[c - ny] < 0)
            label[queue[tail++] = c - ny] = group;
          if (i < nx - 1 && !stopped[c + ny] && label[c + ny] < 0)
            label[queue[tail++] = c + ny] = group;
          if (j > 0 && !stopped[c - 1] && label[c - 1] < 0)
            label[queue[tail++] = c - 1] = group;
          if (j < ny - 1 && !stopped[c + 1] && label[c + 1] < 0)
            label[queue[tail++] = c + 1] = group;
        }
        group++;
      }
    const groups = ends.map((cells) => new Set(cells.filter((c) => !stopped[c]).map((c) => label[c])));
    return groups.map((a, e) => groups.map((b, f) => f > e && [...a].some((g) => b.has(g))));
  };
  const emptyJoins = ends.length > 1 ? joined() : null;
  const keepsWays = (r) => {
    if (!emptyJoins)
      return true;
    mark(r, 1);
    const now = joined();
    mark(r, -1);
    return emptyJoins.every((row, e) => row.every((was, f) => !was || now[e][f]));
  };
  const windowed = (side2, a0, a1, high) => windows.some((w) => w.side === side2 && w.a1 > a0 + 0.000001 && w.a0 < a1 - 0.000001 && w.sill < high - SILL);
  const glazed = (r, high) => [r.y0 < room2.y0 + HAND3, r.x1 > room2.x1 - HAND3, r.y1 > room2.y1 - HAND3, r.x0 < room2.x0 + HAND3].some((near, side2) => near && windowed(side2, SIDES6[side2].along === 0 ? r.x0 : r.y0, SIDES6[side2].along === 0 ? r.x1 : r.y1, high));
  const footprintOf4 = (box2, yaw) => Math.abs(Math.sin(yaw)) > 0.5 ? [box2[1], box2[0]] : [box2[0], box2[1]];
  const takenBy = ([x, y], box2, yaw, clear = 0) => {
    const [fw, fd] = footprintOf4(box2, yaw);
    const r = rect2(x - fw / 2, y - fd / 2, x + fw / 2, y + fd / 2);
    if (!clear)
      return r;
    const [fx, fy] = [-Math.sin(yaw), Math.cos(yaw)].map((v) => Math.round(v));
    return rect2(r.x0 + Math.min(0, fx * clear), r.y0 + Math.min(0, fy * clear), r.x1 + Math.max(0, fx * clear), r.y1 + Math.max(0, fy * clear));
  };
  const put = (piece, at, yaw, { z = 0, seat = false, clear = 0, flat = false } = {}) => {
    const box2 = boxOf2(dimsOf(piece));
    const lying = LYING2.has(TYPE_NAMES[piece.type]);
    const body = takenBy(at, box2, yaw);
    if (!lying && glazed(body, z + highOf(piece, box2)))
      return null;
    const standing = !flat && !lying && z < 0.000001;
    if (standing && (kept2(body) || !keepsWays(body)))
      return null;
    if (standing)
      mark(body, 1);
    if (!flat)
      taken.push(takenBy(at, box2, yaw, clear));
    pieces.push({ params: piece, at: [round7(at[0]), round7(at[1]), round7(z)], yaw, seat });
    return { box: box2, at, yaw };
  };
  const spotsAgainst = (side2, box2, { clear = 0.6, margin = 0, gap = 0.02, corner = false, tall = box2[2] } = {}) => {
    const { inward, along: along2, yaw } = SIDES6[side2];
    const wall = side2 === 0 ? room2.y0 : side2 === 1 ? room2.x1 : side2 === 2 ? room2.y1 : room2.x0;
    const spots = [];
    for (const stretch of walls.filter((each) => each.side === side2)) {
      const half = box2[0] / 2 + margin;
      if (stretch.a1 - stretch.a0 < 2 * half - 0.000001)
        continue;
      const [lo, hi] = [stretch.a0 + half, stretch.a1 - half];
      const middle = (lo + hi) / 2;
      const steps = Math.floor((hi - lo) / 0.1 + 0.000001);
      const order = Array.from({ length: steps + 1 }, (_, i) => corner ? i % 2 ? hi - Math.floor(i / 2) * 0.1 : lo + Math.floor(i / 2) * 0.1 : middle + (i % 2 ? -1 : 1) * Math.ceil(i / 2) * 0.1).filter((u) => u >= lo - 0.000001 && u <= hi + 0.000001);
      if (!corner)
        order.push(lo, hi);
      for (const u of order) {
        const off = gap + box2[1] / 2;
        const at = along2 === 0 ? [u, wall + inward[1] * off] : [wall + inward[0] * off, u];
        const body = takenBy(at, [box2[0] + 2 * margin, box2[1], box2[2]], yaw);
        if (glazed(body, tall) || !free(body))
          continue;
        if (free(takenBy(at, [box2[0] + 2 * margin, box2[1], box2[2]], yaw, clear), { keeps: false }))
          spots.push({ side: side2, at, yaw, u });
      }
    }
    return spots;
  };
  const against = (sides, box2, options = {}) => {
    const margin = options.margin ?? 0;
    for (const side2 of sides)
      for (const spot of spotsAgainst(side2, box2, options))
        if (keepsWays(takenBy(spot.at, [box2[0] + 2 * margin, box2[1], box2[2]], spot.yaw)))
          return spot;
    return null;
  };
  const sidesByLength = () => [0, 1, 2, 3].map((side2) => ({ side: side2, length: walls.filter((each) => each.side === side2).reduce((sum, each) => sum + each.a1 - each.a0, 0) })).filter((each) => each.length > 0.5).sort((p, q) => q.length - p.length).map((each) => each.side);
  const sidesFrom = () => {
    const sides = sidesByLength();
    const k = Math.floor(random() * Math.min(2, sides.length));
    return [...sides.slice(k), ...sides.slice(0, k)];
  };
  const freeAt = (box2, yaw, clear = 0, around = [0, 0], body = box2) => {
    const tries = [around];
    for (let x = room2.x0 + 0.125;x < room2.x1; x += 0.25)
      for (let y = room2.y0 + 0.125;y < room2.y1; y += 0.25)
        tries.push([x, y]);
    tries.sort((p, q) => Math.hypot(p[0] - around[0], p[1] - around[1]) - Math.hypot(q[0] - around[0], q[1] - around[1]));
    return tries.find((at) => free(takenBy(at, body, yaw)) && free(takenBy(at, box2, yaw, clear), { keeps: false }) && keepsWays(takenBy(at, body, yaw))) ?? null;
  };
  const before = ({ at, yaw }, ahead, aside = 0) => [at[0] - Math.sin(yaw) * ahead + Math.cos(yaw) * aside, at[1] + Math.cos(yaw) * ahead + Math.sin(yaw) * aside];
  const picture2 = (long) => {
    const [pw, ph] = PAINTINGS[palette.painting].size;
    const k = long / Math.max(pw, ph);
    return shaped("picture", "framed", { width: round7(pw * k + 0.09), height: round7(ph * k + 0.09) });
  };
  const hang = (spot, long = 1.2, over = 0) => {
    for (const each of [long, long * 0.75, long * 0.55]) {
      const piece = picture2(each);
      const box2 = boxOf2(dimsOf(piece));
      if (windowed(spot.side, spot.u - box2[0] / 2, spot.u + box2[0] / 2, Infinity))
        return;
      const z = Math.max(hangAt(H) - box2[2] / 2, over + OVER);
      if (z + box2[2] > H - 0.1)
        continue;
      put(piece, before({ at: wallPoint(spot), yaw: spot.yaw }, box2[1] / 2 + 0.005), spot.yaw, { z, flat: true });
      return;
    }
  };
  const wallPoint = ({ side: side2, u }) => SIDES6[side2].along === 0 ? [u, side2 === 0 ? room2.y0 : room2.y1] : [side2 === 1 ? room2.x1 : room2.x0, u];
  const plants = (count) => {
    const models = ["tall", "bush", "cactus"];
    for (let n = 0;n < count; n++) {
      const piece = shaped("plant", pick(random, models));
      const box2 = boxOf2(dimsOf(piece));
      const corners = [[room2.x0 + box2[0] / 2 + 0.1, room2.y0 + box2[1] / 2 + 0.1], [room2.x1 - box2[0] / 2 - 0.1, room2.y0 + box2[1] / 2 + 0.1], [room2.x1 - box2[0] / 2 - 0.1, room2.y1 - box2[1] / 2 - 0.1], [room2.x0 + box2[0] / 2 + 0.1, room2.y1 - box2[1] / 2 - 0.1]];
      const at = corners.toSorted(() => random() - 0.5).find((corner) => free(takenBy(corner, box2, 0)) && !glazed(takenBy(corner, box2, 0), box2[2]));
      if (at)
        put(piece, at, 0);
    }
  };
  const rug2 = (at, [w, d], yaw = 0) => {
    const r = takenBy(at, [w, d, 0], yaw);
    if (r.x0 < room2.x0 + 0.05 || r.x1 > room2.x1 - 0.05 || r.y0 < room2.y0 + 0.05 || r.y1 > room2.y1 - 0.05)
      return;
    put(shaped("rug", "rectangle", { width: round7(w), depth: round7(d) }), at, yaw, { flat: true });
  };
  const sitting = ({ television = true } = {}) => {
    const model = pick(random, ["track", "rolled", "chaise", "modular", "chesterfield"]);
    const arm = shaped("armchair", pick(random, ["lounge", "club", "wing"]));
    const armBox = boxOf2(dimsOf(arm));
    const sides = sidesFrom();
    let sofa, sofaBox, spot = null;
    for (const [width, clear, margin] of [[W >= 6 ? 2.8 : 2.2, 2.3, armBox[1] + 0.35], [2.2, 2.3, armBox[1] + 0.35], [2.2, 1.7, 0.2], [1.6, 1.6, 0.1]]) {
      sofa = shaped("sofa", width < 2 && model === "chaise" ? "track" : model, { width });
      sofaBox = boxOf2(dimsOf(sofa));
      spot = against(sides, sofaBox, { clear, margin });
      if (spot)
        break;
    }
    const ahead = 0.45 + 1.1;
    for (const [width, yaw] of spot ? [] : [2.2, 1.6].flatMap((width2) => (W >= D ? [0, Math.PI, Math.PI / 2, -Math.PI / 2] : [Math.PI / 2, -Math.PI / 2, 0, Math.PI]).map((yaw2) => [width2, yaw2]))) {
      sofa = shaped("sofa", width < 2 && model === "chaise" ? "track" : model, { width });
      sofaBox = boxOf2(dimsOf(sofa));
      const middle2 = freeAt([sofaBox[0], sofaBox[1] + ahead, 1], yaw, 0.5);
      if (middle2)
        spot = { at: before({ at: middle2, yaw }, -ahead / 2), yaw };
      if (spot)
        break;
    }
    if (!spot || !put(sofa, spot.at, spot.yaw, { seat: true }))
      return null;
    const table2 = shaped("coffee", pick(random, ["slab", "legs", "round"]));
    const tableBox = boxOf2(dimsOf(table2));
    const middle = before(spot, sofaBox[1] / 2 + 0.45 + tableBox[1] / 2);
    rug2(before(spot, sofaBox[1] / 2 + 0.6), [sofaBox[0] + 0.8, 2.3], spot.yaw);
    put(table2, middle, spot.yaw);
    for (const side2 of [-1, 1]) {
      const at = before({ at: middle, yaw: spot.yaw }, 0, side2 * (tableBox[0] / 2 + 0.45 + armBox[1] / 2));
      const yaw = spot.yaw + side2 * Math.PI / 2;
      if (free(takenBy(at, armBox, yaw)))
        put(arm, at, yaw, { seat: true });
    }
    const lamp2 = shaped("lamp", "floor");
    const lampAt = before(spot, 0, sofaBox[0] / 2 + 0.35);
    if (free(takenBy(lampAt, boxOf2(dimsOf(lamp2)), 0)))
      put(lamp2, lampAt, 0);
    if (spot.side === undefined)
      return spot;
    hang(spot, Math.min(1.5, sofaBox[0] * 0.6), sofaBox[2]);
    if (television) {
      const facing = (spot.side + 2) % 4;
      const tv2 = shaped("tv", "stand", { width: 1.8 });
      const tvSpot = spotsAgainst(facing, boxOf2(dimsOf(tv2)), { clear: 0.3 }).toSorted((p, q) => Math.abs(p.u - spot.u) - Math.abs(q.u - spot.u))[0];
      const distance = tvSpot && Math.hypot(tvSpot.at[0] - spot.at[0], tvSpot.at[1] - spot.at[1]);
      if (tvSpot && distance < 6.5 && Math.abs(tvSpot.u - spot.u) < 1.5)
        put(tv2, tvSpot.at, tvSpot.yaw);
    }
    return spot;
  };
  const dining = (around = [0, 0]) => {
    const most = W * D > 30 ? Math.max(W, D) > 7 ? 8 : 6 : 4;
    const [model, seated2] = [pick(random, ["legs", "trestle"]), pick(random, ["dining", "upholstered", "shell"])];
    for (const seats of [8, 6, 4].filter((n) => n <= most))
      for (const along2 of W >= D ? [0, Math.PI / 2] : [Math.PI / 2, 0]) {
        const table2 = shaped("table", model, { width: TABLE[seats], depth: 0.95 });
        const tableBox = boxOf2(dimsOf(table2));
        const chair2 = shaped("chair", seated2, { count: seats / 2 });
        const chairBox = boxOf2(dimsOf(chair2));
        const set = [tableBox[0] + 1.6, tableBox[1] + 2 * chairBox[1] + 1.8, 1];
        const at = freeAt(set, along2, 0, around, [tableBox[0], tableBox[1] + 2 * chairBox[1] - 0.24, 1]);
        if (!at || !put(table2, at, along2))
          continue;
        for (const side2 of [-1, 1])
          put(chair2, before({ at, yaw: along2 }, side2 * (tableBox[1] / 2 + chairBox[1] / 2 - 0.12)), along2 + (side2 > 0 ? Math.PI : 0), { seat: true });
        taken.push(takenBy(at, set, along2));
        return true;
      }
    for (const places of [4, 3, 2].filter((n) => 2 * n <= most + 2)) {
      const table2 = shaped("table", model, { width: TABLE[2 * places], depth: 0.8 });
      const tableBox = boxOf2(dimsOf(table2));
      const chair2 = shaped("chair", seated2, { count: places });
      const chairBox = boxOf2(dimsOf(chair2));
      const group = [tableBox[0], tableBox[1] + chairBox[1] - 0.12, tableBox[2]];
      const spot = against(sidesByLength(), group, { clear: 0.6 });
      if (!spot || !put(table2, before(spot, (tableBox[1] - group[1]) / 2), spot.yaw))
        continue;
      put(chair2, before(spot, (group[1] - chairBox[1]) / 2), spot.yaw + Math.PI, { seat: true });
      return true;
    }
    return false;
  };
  const sideboard2 = () => {
    const piece = shaped("sideboard", pick(random, ["doors", "drawers", "legs"]), { width: 1.8 });
    const box2 = boxOf2(dimsOf(piece));
    const spot = against(sidesByLength(), box2, { clear: 0.8 });
    if (!spot || !put(piece, spot.at, spot.yaw))
      return;
    put(shaped("ornament", pick(random, ["vase", "bowl", "jar"])), before(spot, 0, -box2[0] / 4), spot.yaw, { z: box2[2], flat: true });
    hang(spot, 1.1, box2[2]);
  };
  const bedroom = () => {
    const bed2 = shaped("bed", pick(random, ["panel", "padded", "tufted", "channel", "slatted", "wing", "arched"]), { width: W >= 6 && D >= 6 ? 1.8 : 1.6 });
    const bedBox = boxOf2(dimsOf(bed2));
    const side2 = shaped("side", pick(random, ["cube", "legs", "round"]));
    const sideBox = boxOf2(dimsOf(side2));
    const lamp2 = shaped("lamp", "table");
    const sides = sidesFrom();
    const spot = against(sides, bedBox, { clear: 1.1, margin: sideBox[0] + 0.1, tall: Math.max(bedBox[2], sideBox[2] + boxOf2(dimsOf(lamp2))[2]) }) ?? against(sides, bedBox, { clear: 1.1, margin: 0.1 });
    if (spot && put(bed2, spot.at, spot.yaw, { seat: true })) {
      rug2(before(spot, 0.45), [bedBox[0] + 1.1, 1.9], spot.yaw);
      for (const s of [-1, 1]) {
        const at = before(spot, -bedBox[1] / 2 + sideBox[1] / 2 + 0.02, s * (bedBox[0] / 2 + sideBox[0] / 2 + 0.06));
        if (free(takenBy(at, sideBox, spot.yaw)) && put(side2, at, spot.yaw))
          put(lamp2, at, spot.yaw, { z: sideBox[2], flat: true });
      }
      hang(spot, Math.min(1.4, bedBox[0] * 0.8), bedBox[2]);
    }
    const wardrobe2 = shaped("wardrobe", pick(random, ["doors", "sliding"]), { width: 2 });
    const ward = against(sidesByLength().filter((each) => each !== spot?.side), boxOf2(dimsOf(wardrobe2)), { clear: 0.9 });
    if (ward)
      put(wardrobe2, ward.at, ward.yaw);
    const arm = shaped("armchair", pick(random, ["lounge", "wing"]));
    const armSpot = against(sidesByLength(), boxOf2(dimsOf(arm)), { clear: 0.8, corner: true, margin: 0.5 });
    if (armSpot && put(arm, armSpot.at, armSpot.yaw, { seat: true })) {
      const lampAt = before(armSpot, 0, boxOf2(dimsOf(arm))[0] / 2 + 0.3);
      if (free(takenBy(lampAt, [0.45, 0.45, 1.62], 0)))
        put(shaped("lamp", "floor"), lampAt, 0);
    }
    plants(1);
  };
  const living = () => {
    sitting();
    if (params.dines)
      dining([W / 4, 0]);
    sideboard2();
    plants(2);
  };
  const kitchen2 = () => {
    const sides = sidesByLength();
    let run = null;
    const runAlong = (side2, length2) => {
      const stretch = walls.filter((each) => each.side === side2).toSorted((p, q) => q.a1 - q.a0 - (p.a1 - p.a0))[0];
      if (stretch.a1 - stretch.a0 - 0.1 < length2 - 0.000001)
        return null;
      const middle = (stretch.a0 + stretch.a1) / 2;
      const uppers = !windowed(side2, middle - length2 / 2, middle + length2 / 2, 2.3);
      for (const model of uppers ? ["run", "counter"] : ["counter"]) {
        const piece = shaped("kitchen", model, { width: round7(length2) });
        const spot = against([side2], boxOf2(dimsOf(piece)), { clear: 1.2, tall: highOf(piece, boxOf2(dimsOf(piece))) });
        if (spot && put(piece, spot.at, spot.yaw))
          return spot;
      }
      return null;
    };
    for (const side2 of sides) {
      const stretch = walls.filter((each) => each.side === side2).toSorted((p, q) => q.a1 - q.a0 - (p.a1 - p.a0))[0];
      for (let length2 = Math.min(stretch.a1 - stretch.a0 - 0.1, 4.8);length2 >= 1.8 && !run; length2 -= 0.6)
        run = runAlong(side2, length2);
      if (run)
        break;
    }
    for (const side2 of run ? [] : sides) {
      run = runAlong(side2, 1.8);
      if (run)
        break;
    }
    if (!run) {
      const island = shaped("kitchen", "island", { width: 2.8, depth: 1 });
      const islandBox = boxOf2(dimsOf(island));
      for (const yaw of W >= D ? [0, Math.PI / 2] : [Math.PI / 2, 0]) {
        const at = freeAt([islandBox[0] + 1.2, islandBox[1] + 2, 1], yaw, 0, [0, 0], islandBox);
        if (!at || !put(island, at, yaw, { clear: 0.9 }))
          continue;
        put(shaped("stool", "bar", { count: 3 }), before({ at, yaw }, islandBox[1] / 2 - 0.05), yaw + Math.PI, { seat: true });
        break;
      }
      plants(1);
      return;
    }
    const tall = shaped("kitchen", "tall", { width: 1.2 });
    const tallSpot = against([run.side, ...sides.filter((side2) => side2 !== run.side)], boxOf2(dimsOf(tall)), { clear: 1.2, corner: true });
    if (tallSpot)
      put(tall, tallSpot.at, tallSpot.yaw);
    const deep = SIDES6[run.side].along === 0 ? D : W;
    if (deep >= 4.4) {
      const island = shaped("kitchen", "island", { width: 2.2, depth: 1 });
      const islandBox = boxOf2(dimsOf(island));
      const at = before(run, 0.31 + 1.25 + islandBox[1] / 2);
      if (free(takenBy(at, islandBox, run.yaw, 0.9)) && put(island, at, run.yaw, { clear: 0.9 })) {
        const stools = shaped("stool", "bar", { count: 3 });
        put(stools, before({ at, yaw: run.yaw }, islandBox[1] / 2 - 0.05), run.yaw + Math.PI, { seat: true });
      }
    }
    plants(1);
  };
  const bath2 = () => {
    const sides = sidesFrom();
    const bathPiece = shaped("bath", pick(random, ["built", "free"]));
    const bathSpot = against(sides, boxOf2(dimsOf(bathPiece)), { clear: 0.8, corner: true });
    if (bathSpot)
      put(bathPiece, bathSpot.at, bathSpot.yaw, { seat: true });
    const toilet3 = shaped("toilet", pick(random, ["floor", "wall"]));
    const toiletSpot = against(sides.filter((side2) => side2 !== bathSpot?.side).concat(sides), boxOf2(dimsOf(toilet3)), { clear: 0.7, margin: 0.2 });
    if (toiletSpot)
      put(toilet3, toiletSpot.at, toiletSpot.yaw, { seat: true });
    const basin2 = shaped("basin", W >= 3 ? pick(random, ["vanity", "double"]) : "vanity", { width: 1.2 });
    const basinSpot = against(sides, boxOf2(dimsOf(basin2)), { clear: 0.7 });
    if (basinSpot)
      put(basin2, basinSpot.at, basinSpot.yaw);
    const shower2 = shaped("shower", "tray");
    const showerSpot = against(sides, boxOf2(dimsOf(shower2)), { clear: 0.6, corner: true });
    if (showerSpot)
      put(shower2, showerSpot.at, showerSpot.yaw, { clear: 0.6 });
  };
  const toilet2 = () => {
    const sides = sidesFrom();
    const piece = shaped("toilet", pick(random, ["floor", "wall"]));
    const spot = against(sides, boxOf2(dimsOf(piece)), { clear: 0.7, margin: 0.15 });
    if (spot)
      put(piece, spot.at, spot.yaw, { seat: true });
    const basin2 = shaped("basin", "pedestal");
    const basinSpot = against(sides, boxOf2(dimsOf(basin2)), { clear: 0.6 });
    if (basinSpot)
      put(basin2, basinSpot.at, basinSpot.yaw);
  };
  const study = () => {
    const desk = shaped("desk", pick(random, ["legs", "drawers"]), { width: 1.5 });
    const deskBox = boxOf2(dimsOf(desk));
    const spot = against(sidesFrom(), deskBox, { clear: 1.2 });
    if (spot && put(desk, spot.at, spot.yaw)) {
      put(shaped("chair", "upholstered"), before(spot, deskBox[1] / 2 + 0.2), spot.yaw + Math.PI, { seat: true });
      put(shaped("ornament", "books"), before(spot, 0, deskBox[0] / 2 - 0.3), spot.yaw, { z: deskBox[2], flat: true });
    }
    const books = shaped("shelf", "books", { width: 1.6 });
    const shelfSpot = against(sidesByLength().filter((each) => each !== spot?.side), boxOf2(dimsOf(books)), { clear: 0.8 });
    if (shelfSpot)
      put(books, shelfSpot.at, shelfSpot.yaw);
    const arm = shaped("armchair", "club");
    const armSpot = against(sidesByLength(), boxOf2(dimsOf(arm)), { clear: 0.8, corner: true, margin: 0.3 });
    if (armSpot)
      put(arm, armSpot.at, armSpot.yaw, { seat: true });
    rug2([0, 0], [Math.min(3, W - 1.5), Math.min(2.2, D - 1.5)]);
    plants(1);
  };
  const lounge = () => {
    if (!sitting({ television: random() < 0.5 })) {
      const arm = shaped("armchair", pick(random, ["lounge", "club", "wing"]));
      const spot = against(sidesByLength(), boxOf2(dimsOf(arm)), { clear: 0.8, corner: true, margin: 0.6 });
      if (spot && put(arm, spot.at, spot.yaw, { seat: true })) {
        const side2 = shaped("side", "round");
        const at = before(spot, 0, boxOf2(dimsOf(arm))[0] / 2 + 0.32);
        if (free(takenBy(at, boxOf2(dimsOf(side2)), spot.yaw))) {
          if (put(side2, at, spot.yaw))
            put(shaped("lamp", "table"), at, spot.yaw, { z: boxOf2(dimsOf(side2))[2], flat: true });
        }
      }
    }
    plants(1);
  };
  const passage = () => {
    const length2 = Math.max(W, D);
    const yaw = W >= D ? 0 : Math.PI / 2;
    const count = Math.max(1, Math.floor(length2 / 6.5));
    for (let n = 0;n < count; n++) {
      const t = (n + 0.5) / count - 0.5;
      const at = yaw ? [0, t * length2] : [t * length2, 0];
      put(shaped("rug", "runner", { width: Math.min(5, length2 / count - 1), depth: 0.9 }), at, yaw, { flat: true });
    }
    for (const stretch of walls.filter((each) => each.a1 - each.a0 >= 1.8)) {
      for (let u = stretch.a0 + 0.9;u <= stretch.a1 - 0.9; u += 3.2)
        hang({ side: stretch.side, u, yaw: SIDES6[stretch.side].yaw }, 1);
    }
  };
  const landing = () => {
    const stretch = walls.toSorted((p, q) => q.a1 - q.a0 - (p.a1 - p.a0))[0];
    if (stretch && stretch.a1 - stretch.a0 >= 1.4)
      hang({ side: stretch.side, u: (stretch.a0 + stretch.a1) / 2, yaw: SIDES6[stretch.side].yaw }, 1.1);
  };
  const closet = () => {
    for (const side2 of sidesByLength().slice(0, 2)) {
      const piece = shaped("wardrobe", pick(random, ["open", "doors"]), { width: 1.8 });
      const spot = against([side2], boxOf2(dimsOf(piece)), { clear: 0.9 });
      if (spot)
        put(piece, spot.at, spot.yaw);
    }
    rug2([0, 0], [Math.min(2.4, W - 1.4), Math.min(1.7, D - 1.4)]);
  };
  const hall = () => {
    const rack2 = shaped("rack", "standing");
    const spot = against(sidesByLength(), boxOf2(dimsOf(rack2)), { clear: 0.5, corner: true });
    if (spot)
      put(rack2, spot.at, spot.yaw);
    plants(1);
  };
  ({ living, dining: () => {
    dining();
    sideboard2();
    plants(1);
  }, kitchen: kitchen2, bedroom, bath: bath2, toilet: toilet2, study, lounge, passage, landing, closet, hall })[type]();
  return { pieces };
}, WOOD, FRONTS, RUG, SOFT, THROW4, METAL4, STONE, CERAMIC3, LEAVES, DARK, ART3, FACES_OF, slotsOf = (params) => {
  const faces = FACES_OF[dimsOf(params).type];
  return (slot) => faces?.[slot] ?? WOOD;
};
var init_room_layout = __esm(() => {
  init_furniture_gen();
  init_furniture();
  init_room();
  SIDES6 = [
    { inward: [0, 1], along: 0, yaw: 0 },
    { inward: [-1, 0], along: 1, yaw: Math.PI / 2 },
    { inward: [0, -1], along: 0, yaw: Math.PI },
    { inward: [1, 0], along: 1, yaw: -Math.PI / 2 }
  ];
  HAND3 = 0.1 + 0.000001;
  TABLE = { 4: 1.3, 6: 1.9, 8: 2.4 };
  TAKES = Object.freeze({ tall: (type) => Boolean(SHAPED.tall[type]), legs: (type) => SHAPED.legs.includes(type), stout: (type) => SHAPED.stout.includes(type) });
  LYING2 = new Set(["rug", "picture"]);
  [WOOD, FRONTS, RUG, SOFT, THROW4, METAL4, STONE, CERAMIC3, LEAVES, DARK, ART3] = Array.from({ length: 11 }, (_, i) => i);
  FACES_OF = Object.freeze({
    table: [WOOD, WOOD, SOFT, THROW4, METAL4, WOOD, ART3],
    coffee: [WOOD, WOOD, SOFT, THROW4, METAL4, STONE, ART3],
    side: [WOOD, WOOD, SOFT, THROW4, METAL4, WOOD, ART3],
    desk: [WOOD, WOOD, SOFT, THROW4, METAL4, WOOD, ART3],
    rug: [RUG, RUG, RUG, RUG, RUG, RUG, RUG],
    picture: [METAL4, SOFT, SOFT, SOFT, METAL4, METAL4, ART3],
    plant: [DARK, LEAVES, LEAVES, LEAVES, DARK, CERAMIC3, ART3],
    ornament: [WOOD, THROW4, SOFT, SOFT, METAL4, CERAMIC3, ART3],
    lamp: [WOOD, SOFT, SOFT, SOFT, METAL4, CERAMIC3, ART3],
    rack: [WOOD, WOOD, WOOD, WOOD, METAL4, WOOD, ART3],
    wardrobe: [WOOD, FRONTS, SOFT, THROW4, METAL4, WOOD, ART3],
    shelf: [WOOD, THROW4, SOFT, SOFT, METAL4, WOOD, ART3],
    sideboard: [WOOD, FRONTS, SOFT, THROW4, METAL4, WOOD, ART3],
    tv: [WOOD, FRONTS, SOFT, THROW4, DARK, WOOD, ART3],
    basin: [FRONTS, FRONTS, CERAMIC3, CERAMIC3, METAL4, STONE, ART3],
    shower: [CERAMIC3, CERAMIC3, CERAMIC3, CERAMIC3, METAL4, CERAMIC3, ART3],
    kitchen: [FRONTS, FRONTS, FRONTS, DARK, METAL4, STONE, ART3]
  });
});

// src/build/kinds/room-gen.js
var exports_room_gen = {};
__export(exports_room_gen, {
  default: () => room_gen_default
});
var layouts, ROUND6 = (v) => Math.round(v * 1000) / 1000, placed = ([min, max], [x, y, z], yaw) => {
  const [c, s] = [Math.round(Math.cos(yaw)), Math.round(Math.sin(yaw))];
  const corners = [[min[0], min[1]], [max[0], min[1]], [max[0], max[1]], [min[0], max[1]]].map(([u, v]) => [x + c * u - s * v, y + s * u + c * v]);
  const xs = corners.map((p) => p[0]), ys = corners.map((p) => p[1]);
  return [[Math.min(...xs), Math.min(...ys), z + min[2]], [Math.max(...xs), Math.max(...ys), z + max[2]]];
}, lookOf = (params, palette) => {
  const type = TYPE_NAMES[params.type];
  const looks = LOOKS3[type] ?? {};
  return looks[PALETTES[PALETTE_NAMES[palette]]?.seats?.[type]] ?? Object.values(looks)[0];
}, room_gen_default;
var init_room_gen = __esm(() => {
  init_mesh();
  init_furniture_gen();
  init_room_layout();
  init_room();
  init_furniture();
  layouts = remembered(layoutOf3, 16);
  room_gen_default = Object.freeze({
    fit: (params) => [params.width, params.depth, params.height],
    resize: (params, size) => ({ ...params, width: size[0], depth: size[1], height: size[2] }),
    bias: (params) => [Math.min(0.5, 0.6 / params.width), Math.min(0.5, 0.6 / params.depth), Math.min(0.5, 0.4 / params.height)],
    mesh: (params, seed, level, size) => {
      const mesh = createMesh(ROOM_FACES.length);
      for (const piece of layouts(params).pieces)
        if (!piece.seat)
          drawPiece(mesh, piece.params, level, piece.at, piece.yaw, slotsOf(piece.params));
      return mesh.pack(size, [0, 0, size[2] / 2]);
    },
    collider: (params) => {
      const half = params.height / 2;
      return layouts(params).pieces.filter((piece) => !piece.seat).flatMap((piece) => solidsOf2(piece.params).map((box2) => placed(box2, piece.at, piece.yaw))).map(([min, max]) => solidBox([min[0], min[1], min[2] - half], [max[0], max[1], max[2] - half]));
    },
    companions: (params) => layouts(params).pieces.filter((piece) => piece.seat).map((piece) => {
      const size = boxOf2(dimsOf(piece.params));
      const seated2 = { ...piece.params, ...params.fabric && CLOTH[TYPE_NAMES[piece.params.type]] && { fabric: params.fabric }, ...params.wood && { wood: params.wood } };
      const faces = Object.fromEntries((lookOf(piece.params, params.palette) ?? []).map((texture, face2) => [face2, { texture }]));
      for (const [face2, tint] of Object.entries(tintsOf(seated2, { faces })))
        if (faces[face2])
          faces[face2].tint = tint;
      return {
        kind: "furniture",
        params: seated2,
        size,
        yaw: piece.yaw,
        at: [piece.at[0], piece.at[1], ROUND6(piece.at[2] + size[2] / 2 - params.height / 2)],
        color: [0.6, 0.6, 0.6],
        surface: { faces },
        seat: seatOf(piece.params)
      };
    }),
    tints: (params, surface) => tintsFor(params, ROOM_CLOTH, ROOM_FACES.length, surface)
  });
});

// src/build/kinds/pool-gen.js
var exports_pool_gen = {};
__export(exports_pool_gen, {
  poolFit: () => poolFit,
  planOf: () => planOf4,
  default: () => pool_gen_default,
  UNDER: () => UNDER,
  SPAN: () => SPAN3,
  RIM: () => RIM2,
  OVER: () => OVER2,
  FLOOR: () => FLOOR2,
  DROP: () => DROP,
  COPING: () => COPING
});
var COPING = 0.45, RIM2 = 0.12, FLOOR2 = 0.25, STEP4 = 0.19, TREAD2 = 0.32, WIDE = 2.4, IN, KEPT = 0.3, OVER2 = 0.15, UNDER = 0.3, SPAN3 = 2.5, CLOSE = 1, DROP = 1.5, TINT, round8 = (v) => Math.round(v * 1000) / 1000, upToMillimetre5 = (v) => Math.ceil(v * 1000 - 0.000001) / 1000, planOf4 = (params) => {
  const { length: length2, width, depth, deck, plinth, stoop } = params;
  const [hx, hy] = [length2 / 2, width / 2];
  const out = COPING + deck;
  const basin2 = { x0: round8(-hx), x1: round8(hx), y0: round8(-hy), y1: round8(hy) };
  const outer = { x0: round8(-hx - out), x1: round8(hx + out), y0: round8(-hy - out), y1: round8(hy + out) };
  const floor = round8(-(RIM2 + depth));
  const bottom = round8(-Math.max(plinth, RIM2 + depth + FLOOR2, stoop));
  const along2 = params.steps === 1 ? 1 : 0;
  const [across, edge, inner] = along2 === 0 ? [width, outer.x1, basin2.x1] : [length2, outer.y1, basin2.y1];
  const half = Math.min(WIDE, across + 2 * out) / 2;
  const risers = Math.max(1, Math.ceil(stoop / STEP4 - 0.000000001));
  const flight = {
    along: along2,
    at: edge,
    from: round8(-half),
    to: round8(half),
    steps: Array.from({ length: risers - 1 }, (_, i) => ({ top: round8(-((i + 1) * stoop) / risers), a0: round8(edge + i * TREAD2), a1: round8(edge + (i + 1) * TREAD2) }))
  };
  const falls = Math.max(1, Math.ceil((RIM2 + depth) / IN[1] - 0.000000001));
  const reach = (along2 === 0 ? length2 : width) / 2;
  const inside = Math.min(half, across / 2 - KEPT);
  const ladder = (falls - 1) * IN[0] <= reach && inside >= 0.4 ? {
    along: along2,
    from: round8(-inside),
    to: round8(inside),
    steps: Array.from({ length: falls - 1 }, (_, j) => ({ top: round8(-((j + 1) * (RIM2 + depth)) / falls), a0: round8(inner - (j + 1) * IN[0]), a1: round8(inner - j * IN[0]) }))
  } : null;
  const water = { min: [round8(basin2.x0 + 0.01), round8(basin2.y0 + 0.01), floor], max: [round8(basin2.x1 - 0.01), round8(basin2.y1 - 0.01), round8(-RIM2)] };
  const far = flight.steps.at(-1)?.a1 ?? edge;
  const min = [outer.x0, outer.y0, bottom];
  const max = [along2 === 0 ? round8(far) : outer.x1, along2 === 1 ? round8(far) : outer.y1, 0];
  return { basin: basin2, outer, floor, bottom, flight, ladder, water, min, max };
}, plan, centreOf6 = (params) => {
  const { min, max } = plan(params);
  return min.map((v, k) => (v + max[k]) / 2);
}, stepBox = ({ along: along2, from, to }, { a0, a1, top }, z0) => along2 === 0 ? { min: [a0, from, z0], max: [a1, to, top] } : { min: [from, a0, z0], max: [to, a1, top] }, wallsOf2 = ({ basin: basin2, outer, floor }) => [
  { min: [outer.x0, outer.y0, floor], max: [basin2.x0, outer.y1, 0] },
  { min: [basin2.x1, outer.y0, floor], max: [outer.x1, outer.y1, 0] },
  { min: [basin2.x0, outer.y0, floor], max: [basin2.x1, basin2.y0, 0] },
  { min: [basin2.x0, basin2.y1, floor], max: [basin2.x1, outer.y1, 0] }
], PAVING, LINING, SIDES7, build2 = (pool2, level) => {
  const mesh = createMesh(3);
  const uvOf = (p, n) => boxUv(p, n, [0, 0, 0], 1, 1);
  const plate = (slot, axis, sign, at, min, max) => {
    const [a, b] = [(axis + 1) % 3, (axis + 2) % 3];
    const corner = (s, t) => {
      const p = [0, 0, 0];
      p[axis] = at;
      p[a] = s ? max[a] : min[a];
      p[b] = t ? max[b] : min[b];
      return p;
    };
    const normal = [0, 0, 0];
    normal[axis] = sign;
    mesh.polygon(slot, sign > 0 ? [corner(0, 0), corner(1, 0), corner(1, 1), corner(0, 1)] : [corner(0, 0), corner(0, 1), corner(1, 1), corner(1, 0)], normal, uvOf);
  };
  const box2 = ({ min, max }, slotOf) => {
    for (let axis = 0;axis < 3; axis++)
      for (const sign of [-1, 1]) {
        const slot = slotOf(axis, sign);
        if (slot !== null)
          plate(slot, axis, sign, sign > 0 ? max[axis] : min[axis], min, max);
      }
  };
  const { basin: basin2, outer, floor, bottom, flight, ladder } = pool2;
  for (const [axis, sign, at] of [[0, -1, outer.x0], [0, 1, outer.x1], [1, -1, outer.y0], [1, 1, outer.y1]])
    plate(SIDES7, axis, sign, at, [outer.x0, outer.y0, bottom], [outer.x1, outer.y1, 0]);
  for (const [x0, x1, y0, y1] of [[outer.x0, outer.x1, outer.y0, basin2.y0], [outer.x0, outer.x1, basin2.y1, outer.y1], [outer.x0, basin2.x0, basin2.y0, basin2.y1], [basin2.x1, outer.x1, basin2.y0, basin2.y1]])
    plate(PAVING, 2, 1, 0, [x0, y0, 0], [x1, y1, 0]);
  for (const [axis, sign, at] of [[0, 1, basin2.x0], [0, -1, basin2.x1], [1, 1, basin2.y0], [1, -1, basin2.y1]])
    plate(LINING, axis, sign, at, [basin2.x0, basin2.y0, floor], [basin2.x1, basin2.y1, 0]);
  plate(LINING, 2, 1, floor, [basin2.x0, basin2.y0, 0], [basin2.x1, basin2.y1, 0]);
  const steps = (flight2, foot, sign, [tread, flank]) => flight2.steps.forEach((step, i) => {
    const block = stepBox(flight2, step, foot);
    box2(block, (axis, way) => axis === 2 ? way > 0 ? tread : null : axis === flight2.along ? null : flank);
    const low = [...block.min];
    low[2] = flight2.steps[i + 1]?.top ?? foot;
    plate(flank, flight2.along, sign, sign > 0 ? step.a1 : step.a0, low, block.max);
  });
  steps(flight, bottom, 1, [PAVING, SIDES7]);
  if (ladder && level > 0)
    steps(ladder, floor, -1, [LINING, LINING]);
  return mesh;
}, solids2 = (pool2) => [
  { min: [pool2.outer.x0, pool2.outer.y0, pool2.bottom], max: [pool2.outer.x1, pool2.outer.y1, pool2.floor] },
  ...wallsOf2(pool2),
  ...pool2.flight.steps.map((step) => stepBox(pool2.flight, step, pool2.bottom)),
  ...pool2.ladder ? pool2.ladder.steps.map((step) => stepBox(pool2.ladder, step, pool2.floor)) : []
], poolFit = (params, heightAt, wetAt = () => false) => {
  const pool2 = planOf4(params);
  const along2 = (from, to, span) => {
    const steps = 2 * Math.max(1, Math.ceil((to - from) / (2 * span)));
    return Array.from({ length: steps + 1 }, (_, i) => from + (to - from) * i / steps);
  };
  const over = (rect3, span) => along2(rect3.x0, rect3.x1, span).flatMap((x) => along2(rect3.y0, rect3.y1, span).map((y) => [x, y]));
  const [under, all] = [over(pool2.basin, CLOSE).map((site2) => heightAt(...site2)), over(pool2.outer, SPAN3)];
  const heights = all.map((site2) => heightAt(...site2));
  const [low, high] = [Math.min(...heights), Math.max(...heights)];
  const rim = Math.max(Math.max(...under) + OVER2 + params.depth + RIM2, high + 0.1);
  const edge = pool2.flight.at;
  const foot = (a) => pool2.flight.along === 0 ? [a, 0] : [0, a];
  const fall = (a) => Math.min(Math.max(rim - heightAt(...foot(a)), 0), 6);
  const stoop = fall(edge + Math.max(0, Math.ceil(fall(edge + 0.5) / STEP4 - 0.000000001) - 1) * TREAD2 + 0.3);
  const cm = (v) => Math.round(v * 100) / 100;
  const reasons = [
    ...high - low > DROP ? [`the ground falls ${(high - low).toFixed(1)} m under it: ${DROP} m at most`] : [],
    ...all.some((site2) => wetAt(...site2)) ? ["it would stand in water"] : []
  ];
  return { rim, drop: high - low, reasons, params: { ...params, plinth: cm(Math.min(Math.max(rim - low + UNDER, 0.6), 6)), stoop: cm(stoop) } };
}, pool_gen_default;
var init_pool_gen = __esm(() => {
  init_mesh();
  init_pool();
  IN = Object.freeze([0.4, 0.25]);
  TINT = Object.freeze([0.62, 0.9, 1]);
  plan = remembered(planOf4, 8);
  [PAVING, LINING, SIDES7] = [0, 1, 2];
  pool_gen_default = Object.freeze({
    footprint: (params) => {
      const { min, max } = plan(params);
      return { min, max };
    },
    fit: (params) => {
      const { min, max } = plan(params);
      return max.map((v, k) => upToMillimetre5(v - min[k]));
    },
    resize: (params, size) => {
      const { min, max } = plan(params);
      return { ...params, length: params.length + size[0] - (max[0] - min[0]), width: params.width + size[1] - (max[1] - min[1]) };
    },
    site: (params, heightAt, wetAt) => {
      const { rim, params: fitted, reasons } = poolFit(params, heightAt, wetAt);
      return { params: fitted, rise: rim, reasons };
    },
    companions: (params) => {
      const centre = centreOf6(params);
      const { water } = plan(params);
      return [{
        kind: "bevel",
        size: water.max.map((v, k) => round8(v - water.min[k])),
        at: water.min.map((v, k) => (v + water.max[k]) / 2 - centre[k]),
        params: { base: 0, edge: 1, radius: 0.01 },
        color: [...TINT],
        surface: { texture: `effects/water/${WATERS[params.water] ?? WATERS[0]}` }
      }];
    },
    mesh: (params, seed, level, size) => build2(plan(params), level).pack(size, centreOf6(params)),
    collider: (params) => {
      const centre = centreOf6(params);
      return solids2(plan(params)).map(({ min, max }) => solidBox(min.map((v, k) => v - centre[k]), max.map((v, k) => v - centre[k])));
    }
  });
});

// src/build/kinds/index.js
var DECLARED, LATER, RETRY = 5000, TRIES = 6, loaded, loading2, failed, held = null, KINDS, MIN_SIZE = 0.01, MAX_SIZE = 64, kindOf = (name) => typeof name === "string" && Object.hasOwn(DECLARED, name) ? loaded.get(name) ?? DECLARED[name] : null, kindReady = (name) => Object.hasOwn(DECLARED, name) && (!Object.hasOwn(LATER, name) || loaded.has(name)), loadKind = (name) => {
  if (!Object.hasOwn(DECLARED, name))
    return Promise.resolve(null);
  if (kindReady(name))
    return Promise.resolve(kindOf(name));
  if (!loading2.has(name)) {
    const { file, load } = LATER[name];
    const tries = failed.get(name)?.tries ?? 0;
    loading2.set(name, (held ?? Promise.resolve()).then(() => tries ? import(`${file}?retry=${tries}`) : load()).then(({ default: generator }) => {
      if (!generator || typeof generator !== "object")
        throw new Error(`${file} has no default export: the kind's generator`);
      loaded.set(name, Object.freeze({ ...DECLARED[name], ...generator }));
      clearTimeout(failed.get(name)?.timer);
      failed.delete(name);
      tellKind(name);
      return loaded.get(name);
    }).catch((error) => {
      const wait = RETRY * 2 ** Math.min(tries, 4);
      const timer = tries < TRIES ? setTimeout(() => loadKind(name).catch(() => {}), wait) : null;
      timer?.unref?.();
      failed.set(name, { until: performance.now() + wait, tries: tries + 1, timer });
      console.error(`kind ${name} unavailable (asked for again in ${wait / 1000} s):`, error);
      throw error;
    }).finally(() => loading2.delete(name)));
  }
  return loading2.get(name);
}, loadKinds = (names) => Promise.all([...new Set(names)].map(loadKind)), decimals = (step) => Math.max(0, Math.ceil(-Math.log10(step) - 0.000000001)), constrain = (param, value) => {
  const given = typeof value === "string" && param.options ? param.options.indexOf(value) : value;
  if (!Number.isFinite(given) || param.options && given < 0)
    return param.default;
  const within3 = Math.min(Math.max(given, param.min), param.max);
  const stepped = Number(Math.min(param.min + Math.round((within3 - param.min) / param.step) * param.step, param.max).toFixed(decimals(param.step)));
  return param.retired?.includes(param.options?.[stepped]) ? param.default : stepped;
}, written = (value) => Array.isArray(value) ? value.map((point) => Array.isArray(point) && point.length === 2 ? [...point, 0] : point) : value, defaultOf = (param) => param.points ? param.default.map((point) => [...point]) : param.heights ? [...param.default] : param.list ? structuredClone(param.default) : param.default, constrainBytes = (param, value) => typeof value === "string" && value.length <= param.bytes && value.length % 4 === 0 && /^[A-Za-z0-9+/]*={0,2}$/.test(value) && (!param.valid || param.valid(value)) ? value : param.default, constrainHeights = (param, value) => {
  const kept2 = (Array.isArray(value) ? value : []).filter(Number.isFinite).slice(0, param.heights[1]).map((v) => constrain(param, v));
  return kept2.length >= param.heights[0] ? kept2 : defaultOf(param);
}, pointsWithin = (value, { least = 0, most = Infinity, min, max, step, horizontal = false, handles = false }) => {
  const held2 = { min, max, step };
  const points = [];
  for (const point of Array.isArray(value) ? value : []) {
    if (points.length === most)
      break;
    const handled = handles && point?.length === 6;
    if (!Array.isArray(point) || point.length < 2 || point.length > 3 && !handled || !point.every(Number.isFinite))
      continue;
    const kept2 = (handled ? point : [point[0], point[1], point[2] ?? 0]).map((v) => constrain(held2, v));
    const last = points.at(-1);
    if (!last || last[0] !== kept2[0] || last[1] !== kept2[1] || !horizontal && last[2] !== kept2[2])
      points.push(kept2);
  }
  return points.length >= least ? points : null;
}, constrainPoints = (param, value) => {
  const [least, most] = param.points;
  const points = pointsWithin(value, { least, most, min: param.min, max: param.max, step: param.step, horizontal: true });
  if (!points)
    return defaultOf(param);
  const [first, last] = [points[0], points.at(-1)];
  if (points.length > 3 && first[0] === last[0] && first[1] === last[1])
    last[2] = first[2];
  return points;
}, constrainKind = (name, params) => {
  const kind = kindOf(name);
  if (!kind)
    return { params: null, errors: [`no kind ${name}`] };
  const given = params && typeof params === "object" ? params : {};
  const errors = Object.keys(given).filter((key) => !kind.params.some((param) => param.name === key)).map((key) => `${name}: no parameter ${key}`);
  const values = Object.fromEntries(kind.params.flatMap((param) => {
    if (param.optional && given[param.name] === undefined)
      return [];
    const value = given[param.name] === undefined ? defaultOf(param) : param.points ? constrainPoints(param, given[param.name]) : param.heights ? constrainHeights(param, given[param.name]) : param.list ? param.keep(given[param.name]) ?? defaultOf(param) : param.bytes ? constrainBytes(param, given[param.name]) : constrain(param, given[param.name]);
    const as = param.options && typeof given[param.name] === "string" ? param.options[value] : value;
    const changed = param.points || param.heights || param.list ? JSON.stringify(as) !== JSON.stringify(param.list ? given[param.name] : written(given[param.name])) : as !== given[param.name];
    if (given[param.name] !== undefined && changed)
      errors.push(`${name}: ${param.name} ${JSON.stringify(given[param.name])} → ${JSON.stringify(value)}`);
    if (param.optional && Array.isArray(value) && !value.length)
      return [];
    return [[param.name, value]];
  }));
  return { params: values, errors };
}, bringsOf = (name, params) => kindOf(name)?.brings?.(constrainKind(name, params).params) ?? [], looksOfKind = (name, params) => {
  const kind = kindOf(name);
  const by2 = kind?.looks && kind.params.find((param) => param.name === kind.lookedBy);
  const own = by2 && kind.looks[by2.options[constrainKind(name, params).params[by2.name]]];
  return own ? Object.entries(own).map(([look2, materials]) => ({ name: look2, label: kind.lookLabels?.[look2] ?? look2, materials })) : [];
}, materialsOf = (name, params, look2 = null) => {
  const looks = looksOfKind(name, params);
  return (looks.find((each) => each.name === look2) ?? looks[0])?.materials ?? null;
}, seedOf = (seed) => Number.isInteger(seed) ? Math.abs(seed) % 2147483648 : 0, within3 = (size) => size.map((v) => Math.min(Math.max(v, MIN_SIZE), MAX_SIZE)), clean = (size) => size.map((v) => Math.round(v * 1e6) / 1e6), resolve = (value, params) => typeof value === "function" ? value(params) : value, fitSize = ({ kind, params, size }) => {
  const type = kindOf(kind);
  return type?.fit ? clean(within3(type.fit(constrainKind(kind, params).params, size))) : [...size];
}, resizeParams = ({ kind, params, size }) => {
  const type = kindOf(kind);
  const values = constrainKind(kind, params).params;
  return type?.resize ? constrainKind(kind, type.resize(values, size)).params : values;
}, recentred = ({ kind, params }) => {
  const type = kindOf(kind);
  const values = constrainKind(kind, params).params;
  const paths = type?.params.filter((param) => param.points) ?? [];
  if (!type?.footprint || !paths.length)
    return { params: values, shift: [0, 0, 0] };
  const { min, max } = type.footprint(values);
  const step = paths[0].step;
  const shift = [0, 1, 2].map((k) => Number((Math.round((min[k] + max[k]) / 2 / step) * step).toFixed(decimals(step))));
  const moved = Object.fromEntries(type.params.filter((param) => (param.points || param.heights) && values[param.name] !== undefined).map((param) => [param.name, param.points ? values[param.name].map((point) => point.map((v, k) => v - shift[k])) : values[param.name].map((v) => v - shift[2])]));
  return { params: constrainKind(kind, { ...values, ...moved }).params, shift };
}, fallbackShape = ({ kind, params }) => {
  const type = kindOf(kind);
  return [...PRESETS[type ? resolve(type.shape, constrainKind(kind, params).params) : "cube"].shape];
}, wholes;
var init_kinds = __esm(async () => {
  init_params();
  init_mesh();
  init_ready();
  init_rock();
  init_bevel();
  init_stairs();
  init_door();
  init_window();
  init_roof();
  init_column();
  init_arch();
  init_fence();
  init_bridge();
  init_house();
  init_furniture();
  init_room();
  init_pool();
  init_lantern();
  init_sculpt2();
  init_blocks();
  init_outline();
  init_solid();
  await init_road();
  DECLARED = { rock, bevel, stairs, door, window: windowKind, roof, column, arch, fence, road, bridge, house, furniture, room, pool, lantern, sculpt, blocks, outline, solid };
  LATER = Object.freeze({
    bridge: { file: "./bridge-gen.js", load: () => Promise.resolve().then(() => (init_bridge_gen(), exports_bridge_gen)) },
    house: { file: "./house-gen.js", load: () => Promise.resolve().then(() => (init_house_gen(), exports_house_gen)) },
    furniture: { file: "./furniture-gen.js", load: () => Promise.resolve().then(() => (init_furniture_gen(), exports_furniture_gen)) },
    room: { file: "./room-gen.js", load: () => Promise.resolve().then(() => (init_room_gen(), exports_room_gen)) },
    pool: { file: "./pool-gen.js", load: () => Promise.resolve().then(() => (init_pool_gen(), exports_pool_gen)) }
  });
  loaded = new Map;
  loading2 = new Map;
  failed = new Map;
  KINDS = Object.freeze(Object.defineProperties({}, Object.fromEntries(Object.keys(DECLARED).map((name) => [name, { enumerable: true, get: () => loaded.get(name) ?? DECLARED[name] }]))));
  wholes = new Map;
  if (HERE)
    await loadKinds(Object.keys(LATER));
});

// src/build/edit/companions.js
var DEEP = 4, companionsOf = (record) => {
  const kind = record?.kind && kindOf(record.kind);
  if (!kind?.companions)
    return [];
  return kind.companions(record.params).map(({ kind: name, at, yaw = 0, size, color, surface, light, params = {}, behaviour, seat }) => ({
    kind: name,
    params,
    size,
    color,
    surface,
    light,
    ...behaviour && { behaviour },
    ...seat && { seat },
    at: add(record.at, quatRotate(record.rotation, at)),
    rotation: quatNormalize(quatMultiply(record.rotation, quatAxisAngle([0, 0, 1], yaw)))
  }));
}, recordOfCompanion = (wanted, id, object = null) => {
  const part = { kind: wanted.kind, params: wanted.params };
  return {
    type: "prim",
    id,
    ...object && { object },
    kind: wanted.kind,
    params: wanted.params,
    shape: fallbackShape(part),
    size: fitSize({ ...part, size: wanted.size }),
    at: wanted.at,
    rotation: wanted.rotation,
    color: wanted.color,
    surface: structuredClone(wanted.surface),
    ...wanted.light && { light: structuredClone(wanted.light) },
    ...wanted.behaviour && { behaviour: structuredClone(wanted.behaviour) },
    ...wanted.seat && { seat: structuredClone(wanted.seat) }
  };
};
var init_companions = __esm(async () => {
  await init_kinds();
});

// src/vegetation/record.js
var TREE_SCALE, BUILT_IN, OWN2, finite = (value, length2) => Array.isArray(value) && value.length === length2 && value.every(Number.isFinite), speciesName = (value) => typeof value === "string" && (BUILT_IN.test(value) || OWN2.test(value)), wrapYaw = (degrees) => (degrees % 360 + 360) % 360, SPECIES_PARAMS, CROWNS, WHOLE, colour = (value) => finite(value, 3) && value.every((v) => v >= 0 && v <= 1), paramsOf2 = (value) => {
  if (!value || typeof value !== "object")
    return {};
  const kept2 = {};
  for (const [key, [min, max]] of Object.entries(SPECIES_PARAMS)) {
    const v = value[key];
    if (Number.isFinite(v))
      kept2[key] = WHOLE.has(key) ? Math.round(clamp(v, min, max)) : clamp(v, min, max);
  }
  if (CROWNS.includes(value.shape))
    kept2.shape = value.shape;
  for (const key of ["leaf", "bark", "flower"])
    if (colour(value[key]))
      kept2[key] = [...value[key]];
  return kept2;
};
var init_record = __esm(() => {
  TREE_SCALE = [0.25, 4];
  BUILT_IN = /^[a-z][a-zA-Z]{0,31}$/;
  OWN2 = /^[^/\s]{1,80}:[^/\s]{1,80}$/;
  SPECIES_PARAMS = {
    scale: [0.3, 40],
    baseSize: [0, 0.95],
    ratio: [0.003, 0.25],
    trunks: [1, 8],
    lean: [0, 85],
    fan: [20, 360],
    spread: [0, 3],
    bend: [-120, 120],
    topBend: [-120, 120],
    attractionUp: [-1, 1.5],
    branches: [0, 60],
    branchLength: [0.05, 1.5],
    branchAngle: [0, 140],
    twigs: [0, 16],
    leafSize: [0.25, 3],
    leafCount: [0.25, 3],
    wind: [0, 3],
    glow: [0, 1]
  };
  CROWNS = ["conical", "spherical", "hemispherical", "cylindrical", "taperedCylindrical", "flame", "inverseConical", "tendFlame"];
  WHOLE = new Set(["branches", "twigs", "trunks"]);
});

// src/tree-generator.js
var DEG3, GOLDEN, barks = (...names) => names.map((name) => `wood/logs/${name}`), SPECIES, scale4 = (a, s) => [a[0] * s, a[1] * s, a[2] * s], normalize2 = (a) => scale4(a, 1 / (Math.hypot(a[0], a[1], a[2]) || 1)), PHI, ICOSAHEDRON_VERTICES;
var init_tree_generator = __esm(() => {
  DEG3 = Math.PI / 180;
  GOLDEN = Math.PI * (3 - Math.sqrt(5));
  SPECIES = {
    bush: {
      name: "Bush",
      group: "plant",
      shape: "spherical",
      baseSize: 0.2,
      scale: 1.5,
      scaleV: 0.3,
      ratio: 0.025,
      ratioPower: 1.2,
      attractionUp: 0.3,
      stems: { count: 5, angle: 34, angleV: 10, spread: 0.12 },
      wind: 2,
      bark: [0.32, 0.26, 0.2],
      leaf: [[0.2, 0.36, 0.12], [0.24, 0.4, 0.14], [0.18, 0.31, 0.11]],
      leafJitter: 0.12,
      levels: [
        { length: 1, lengthV: 0.15, taper: 1, curveRes: 3, curve: -18, curveV: 20, sides: 3 },
        { branches: 4, length: 0.55, lengthV: 0.15, downAngle: 42, downAngleV: 15, rotate: 140, rotateV: 30, curveRes: 2, curve: 0, curveV: 30, sides: 3 }
      ],
      leaves: { type: "cluster", count: 2, size: 0.42, sizeV: 0.1, squash: [1, 0.85, 1] }
    },
    oleander: {
      name: "Oleander",
      group: "plant",
      shape: "spherical",
      baseSize: 0.3,
      scale: 2.6,
      scaleV: 0.4,
      ratio: 0.014,
      ratioPower: 1.2,
      attractionUp: 0.5,
      stems: { count: 6, angle: 18, angleV: 8, spread: 0.2 },
      wind: 1.6,
      bark: [0.36, 0.33, 0.25],
      leaf: [[0.18, 0.32, 0.12], [0.21, 0.36, 0.13]],
      leafJitter: 0.12,
      levels: [
        { length: 1, lengthV: 0.15, taper: 1, curveRes: 3, curve: 10, curveV: 16, sides: 3 },
        { branches: 4, length: 0.4, lengthV: 0.12, downAngle: 32, downAngleV: 12, rotate: 140, rotateV: 30, curveRes: 2, curve: 0, curveV: 20, sides: 3 }
      ],
      leaves: [
        { type: "cluster", count: 1, size: 0.42, sizeV: 0.1, squash: [0.9, 0.9, 0.9] },
        { type: "cluster", at: "tip", count: 1, size: 0.24, sizeV: 0.06, out: 0.45, color: [[0.86, 0.36, 0.52], [0.92, 0.52, 0.64]], ao: 0.08 }
      ]
    },
    fern: {
      name: "Fern",
      group: "plant",
      wind: 2.5,
      leaf: [[0.22, 0.42, 0.12], [0.26, 0.46, 0.14]],
      leafJitter: 0.08,
      leaves: { type: "frond", at: "base", count: 13, length: 1.3, lengthV: 0.2, width: 0.22, rise: [1.4, 3.4], droop: 2.2, segments: 8, pinnate: 0.55 }
    },
    agave: {
      name: "Agave",
      group: "plant",
      wind: 0.3,
      leaf: [[0.4, 0.52, 0.46], [0.36, 0.48, 0.42]],
      leafJitter: 0.06,
      leaves: { type: "blade", at: "base", count: 22, length: 1.15, lengthV: 0.2, width: 0.17, rise: [0.25, 3.5], droop: 0.35, keel: 0.6, segments: 3 }
    },
    saguaro: {
      name: "Saguaro",
      group: "plant",
      shape: "cylindrical",
      baseSize: 0.4,
      scale: 6.5,
      scaleV: 1.2,
      ratio: 0.055,
      ratioPower: 0.4,
      wind: 0,
      bark: [0.3, 0.44, 0.22],
      levels: [
        { length: 1, lengthV: 0.05, taper: 0.12, curveRes: 4, curve: 0, curveV: 4, sides: 10, flute: 0.12, dome: true },
        { branches: 3, start: 0.35, end: 0.6, length: 0.45, lengthV: 0.1, downAngle: 90, downAngleV: 4, rotate: 140, rotateV: 40, taper: 0.12, curveRes: 6, curve: -90, curveBack: 0, curveV: 6, sides: 8, flute: 0.12, dome: true }
      ]
    },
    bamboo: {
      name: "Bamboo",
      group: "plant",
      shape: "cylindrical",
      baseSize: 0.5,
      scale: 7.5,
      scaleV: 1.2,
      ratio: 0.008,
      ratioPower: 1,
      attractionUp: -0.4,
      stems: { count: 9, angle: 7, angleV: 5, spread: 0.6 },
      wind: 1.8,
      bark: [0.5, 0.56, 0.22],
      leaf: [[0.3, 0.46, 0.13], [0.36, 0.52, 0.16]],
      leafJitter: 0.1,
      levels: [
        { length: 1, lengthV: 0.18, taper: 0.6, curveRes: 7, curve: 10, curveV: 8, sides: 5, rings: { lip: 1.15, shade: 0.86 } },
        { branches: 5, length: 0.13, lengthV: 0.04, downAngle: 55, downAngleV: 12, rotate: 140, rotateV: 30, curveRes: 2, curve: 20, curveV: 20, sides: 3 }
      ],
      leaves: { type: "tuft", count: 3, size: 0.4, sizeV: 0.1, squash: [0.35, 0.1, 1.4] }
    },
    banana: {
      name: "Banana",
      group: "plant",
      shape: "cylindrical",
      baseSize: 1,
      scale: 2.4,
      scaleV: 0.4,
      ratio: 0.05,
      ratioPower: 1,
      stems: { count: 2, angle: 6, angleV: 4, spread: 0.35 },
      wind: 1.4,
      bark: [0.42, 0.5, 0.24],
      leaf: [[0.3, 0.52, 0.14], [0.34, 0.56, 0.16]],
      leafJitter: 0.08,
      levels: [{ length: 1, lengthV: 0.22, taper: 0.4, curveRes: 3, curve: 0, curveV: 6, sides: 6 }],
      leaves: { type: "frond", count: 7, length: 2.2, lengthV: 0.3, width: 0.45, rise: 2.2, droop: 1.6, segments: 5, outline: "paddle", keel: 0.12 }
    },
    joshua: {
      name: "Joshua tree",
      group: "plant",
      shape: "cylindrical",
      baseSize: 0.6,
      scale: 4,
      scaleV: 0.8,
      ratio: 0.08,
      ratioPower: 1.1,
      attractionUp: 0.4,
      wind: 0.4,
      bark: [0.44, 0.37, 0.29],
      barkTexture: barks("palm-bark"),
      leaf: [[0.42, 0.5, 0.24], [0.38, 0.46, 0.22]],
      leafJitter: 0.08,
      levels: [
        { length: 1, lengthV: 0.1, taper: 0.4, curveRes: 4, curve: 0, curveV: 16, sides: 6, flute: 0.1 },
        { branches: 4, start: 0.6, length: 0.6, lengthV: 0.15, downAngle: 48, downAngleV: 12, rotate: 137.5, rotateV: 40, curveRes: 3, curve: -18, curveV: 30, sides: 5, flute: 0.1 },
        { branches: 2, start: 0.82, length: 0.75, lengthV: 0.15, downAngle: 38, downAngleV: 10, rotate: 180, rotateV: 30, curveRes: 3, curve: -20, curveV: 30, sides: 4 }
      ],
      leaves: { type: "blade", axis: "stem", count: 22, length: 0.5, lengthV: 0.08, width: 0.05, rise: [-0.5, 2.6], droop: 0.15, keel: 0.4, segments: 2 }
    },
    hosta: {
      name: "Hosta",
      group: "plant",
      wind: 1.2,
      leaf: [[0.2, 0.38, 0.16], [0.24, 0.42, 0.18], [0.3, 0.46, 0.24]],
      leafJitter: 0.06,
      leaves: { type: "frond", at: "base", count: 14, length: 0.5, lengthV: 0.08, width: 0.11, outline: "heart", stalk: 0.4, rise: [0.7, 3], droop: 1.4, segments: 5, keel: 0.3 }
    },
    monstera: {
      name: "Monstera",
      group: "plant",
      wind: 0.8,
      leaf: [[0.1, 0.28, 0.1], [0.12, 0.31, 0.11], [0.15, 0.34, 0.12]],
      leafJitter: 0.06,
      leaves: { type: "frond", at: "base", count: 9, length: 1.3, lengthV: 0.25, width: 0.24, outline: "heart", stalk: 0.5, pinnate: 0.55, rise: [0.8, 3.2], droop: 1.3, segments: 8, keel: 0.12 }
    },
    strelitzia: {
      name: "Bird of paradise",
      group: "plant",
      shape: "cylindrical",
      baseSize: 1,
      scale: 1.3,
      scaleV: 0.15,
      ratio: 0.012,
      ratioPower: 1,
      stems: { count: 3, angle: 12, angleV: 6, spread: 0.12 },
      wind: 0.9,
      bark: [0.3, 0.42, 0.24],
      leaf: [[0.26, 0.4, 0.26], [0.3, 0.44, 0.3]],
      leafJitter: 0.06,
      levels: [{ length: 1, lengthV: 0.12, taper: 0.3, curveRes: 4, curve: 0, curveBack: 75, curveV: 8, sides: 4 }],
      leaves: [
        { type: "blade", at: "tip", axis: "stem", count: 1, length: 0.19, width: 0.022, rise: 20, droop: 0, keel: 0.5, segments: 2, color: [0.36, 0.26, 0.34] },
        { type: "blade", at: "tip", count: 3, length: 0.13, width: 0.014, rise: [3, 5], droop: -0.4, keel: 0.4, segments: 2, color: [0.98, 0.5, 0.06] },
        { type: "blade", at: "tip", count: 1, length: 0.1, width: 0.009, rise: 1.4, droop: 0, keel: 0.4, segments: 2, color: [0.22, 0.3, 0.8] },
        { type: "frond", at: "base", count: 10, length: 1.3, lengthV: 0.2, width: 0.12, outline: "paddle", stalk: 0.5, rise: [2.2, 5], droop: 0.7, segments: 5, keel: 0.15 }
      ]
    },
    cordyline: {
      name: "Cordyline",
      group: "plant",
      shape: "cylindrical",
      baseSize: 1,
      scale: 2.2,
      scaleV: 0.5,
      ratio: 0.018,
      ratioPower: 1,
      stems: { count: 3, angle: 9, angleV: 6, spread: 0.12 },
      wind: 1.2,
      bark: [0.42, 0.36, 0.28],
      leaf: [[0.2, 0.38, 0.14], [0.24, 0.42, 0.16], [0.28, 0.46, 0.18]],
      leafJitter: 0.08,
      levels: [{ length: 1, lengthV: 0.35, taper: 0.35, curveRes: 4, curve: 6, curveV: 12, sides: 5 }],
      leaves: { type: "blade", count: 16, length: 0.55, lengthV: 0.1, width: 0.03, rise: [-0.6, 3], droop: 0.8, keel: 0.4, segments: 3 }
    },
    sunflower: {
      name: "Sunflower",
      group: "flower",
      shape: "cylindrical",
      baseSize: 1,
      scale: 1.9,
      scaleV: 0.25,
      ratio: 0.014,
      ratioPower: 1,
      stems: { count: 3, angle: 7, angleV: 4, spread: 0.3 },
      wind: 2,
      bark: [0.3, 0.44, 0.16],
      leaf: [0.24, 0.42, 0.12],
      leafJitter: 0.1,
      levels: [{ length: 1, lengthV: 0.12, taper: 0.3, curveRes: 4, curve: 0, curveBack: 70, curveV: 6, sides: 4 }],
      leaves: [
        { type: "flower", size: 0.13, petals: 13, petal: 0.12, color: [0.95, 0.7, 0.08], centre: [0.28, 0.17, 0.07] },
        { type: "frond", at: "along", count: 4, length: 0.32, width: 0.13, rise: 0.3, droop: 1.1, segments: 3, outline: "paddle", keel: 0.1 }
      ]
    },
    rudbeckia: {
      name: "Black-eyed Susan",
      group: "flower",
      shape: "cylindrical",
      baseSize: 1,
      scale: 0.7,
      scaleV: 0.15,
      ratio: 0.008,
      ratioPower: 1,
      stems: { count: 8, angle: 16, angleV: 8, spread: 0.1 },
      wind: 2,
      bark: [0.3, 0.42, 0.16],
      leaf: [[0.24, 0.38, 0.12], [0.28, 0.42, 0.14]],
      leafJitter: 0.1,
      levels: [{ length: 1, lengthV: 0.18, taper: 0.5, curveRes: 2, curve: 30, curveV: 14, sides: 3 }],
      leaves: [
        { type: "flower", size: 0.012, petals: 12, petal: 0.028, cup: -0.3, cone: 0.7, color: [[0.96, 0.7, 0.06], [0.97, 0.62, 0.05], [0.95, 0.76, 0.1]], centre: [0.17, 0.09, 0.04] },
        { type: "frond", at: "base", count: 9, length: 0.2, lengthV: 0.04, width: 0.035, rise: [0.4, 1.6], droop: 0.8, segments: 3, keel: 0.2 },
        { type: "frond", at: "along", count: 1, length: 0.09, width: 0.018, rise: 0.5, droop: 0.4, segments: 2 }
      ]
    },
    daisy: {
      name: "Oxeye daisy",
      group: "flower",
      shape: "cylindrical",
      baseSize: 1,
      scale: 0.55,
      scaleV: 0.12,
      ratio: 0.008,
      ratioPower: 1,
      stems: { count: 7, angle: 14, angleV: 8, spread: 0.08 },
      wind: 2,
      bark: [0.32, 0.44, 0.17],
      leaf: [[0.22, 0.38, 0.12], [0.26, 0.42, 0.14]],
      leafJitter: 0.1,
      levels: [{ length: 1, lengthV: 0.2, taper: 0.5, curveRes: 2, curve: 26, curveV: 14, sides: 3 }],
      leaves: [
        { type: "flower", size: 0.009, petals: 14, petal: 0.024, cup: -0.1, cone: 0.4, color: [0.96, 0.96, 0.93], centre: [0.95, 0.72, 0.1] },
        { type: "frond", at: "base", count: 10, length: 0.14, lengthV: 0.03, width: 0.025, rise: [0.3, 1.4], droop: 0.6, segments: 3, pinnate: 0.35 }
      ]
    },
    poppy: {
      name: "Poppy",
      group: "flower",
      shape: "cylindrical",
      baseSize: 1,
      scale: 0.6,
      scaleV: 0.12,
      ratio: 0.007,
      ratioPower: 1,
      stems: { count: 6, angle: 14, angleV: 9, spread: 0.08 },
      wind: 2.2,
      bark: [0.36, 0.46, 0.22],
      leaf: [[0.3, 0.42, 0.18], [0.34, 0.46, 0.2]],
      leafJitter: 0.08,
      levels: [{ length: 1, lengthV: 0.22, taper: 0.5, curveRes: 3, curve: 4, curveV: 22, sides: 3 }],
      leaves: [
        { type: "flower", size: 0.01, petals: 4, petal: 0.038, round: true, cup: 0.45, cone: 0.6, color: [[0.86, 0.1, 0.06], [0.8, 0.07, 0.05]], centre: [0.1, 0.08, 0.07] },
        { type: "frond", at: "base", count: 8, length: 0.18, lengthV: 0.04, width: 0.03, rise: [0.3, 1.2], droop: 0.7, segments: 4, pinnate: 0.55 }
      ]
    },
    lily: {
      name: "Lily",
      group: "flower",
      shape: "cylindrical",
      baseSize: 0.86,
      scale: 0.9,
      scaleV: 0.15,
      ratio: 0.009,
      ratioPower: 1,
      stems: { count: 3, angle: 7, angleV: 5, spread: 0.08 },
      wind: 1.6,
      bark: [0.26, 0.4, 0.14],
      leaf: [[0.22, 0.4, 0.12], [0.26, 0.44, 0.14]],
      leafJitter: 0.08,
      levels: [
        { length: 1, lengthV: 0.15, taper: 0.4, curveRes: 3, curve: 0, curveV: 8, sides: 3 },
        { branches: 3, start: 0.86, length: 0.13, lengthV: 0.03, downAngle: 65, downAngleV: 10, rotate: 137.5, rotateV: 20, curveRes: 2, curve: -20, curveV: 10, sides: 3 }
      ],
      leaves: [
        { type: "flower", size: 0.014, petals: 6, petal: 0.06, cup: 0.7, color: [[0.96, 0.48, 0.1], [0.94, 0.56, 0.62], [0.97, 0.66, 0.2]], centre: [0.62, 0.3, 0.1] },
        { type: "frond", at: "along", level: 0, count: 8, length: 0.11, lengthV: 0.02, width: 0.014, rise: 0.8, droop: 0.6, segments: 2 }
      ]
    },
    gladiolus: {
      name: "Gladiolus",
      group: "flower",
      shape: "cylindrical",
      baseSize: 1,
      scale: 1.1,
      scaleV: 0.15,
      ratio: 0.008,
      ratioPower: 1,
      stems: { count: 3, angle: 6, angleV: 4, spread: 0.1 },
      wind: 1.4,
      bark: [0.28, 0.44, 0.16],
      leaf: [[0.26, 0.44, 0.16], [0.3, 0.48, 0.18]],
      leafJitter: 0.08,
      levels: [{ length: 1, lengthV: 0.12, taper: 0.4, curveRes: 3, curve: 6, curveV: 8, sides: 3 }],
      leaves: [
        { type: "flower", at: "along", count: 6, size: 0.012, petals: 6, petal: 0.035, round: true, cup: 0.35, rise: 0.5, color: [[0.88, 0.16, 0.18], [0.94, 0.48, 0.58], [0.98, 0.62, 0.42]], centre: [0.96, 0.9, 0.72] },
        { type: "blade", at: "base", count: 8, length: 0.65, lengthV: 0.1, width: 0.022, rise: [2.5, 6], droop: 0.2, keel: 0.5, segments: 3 }
      ]
    },
    columbine: {
      name: "Columbine",
      group: "flower",
      shape: "cylindrical",
      baseSize: 1,
      scale: 0.55,
      scaleV: 0.1,
      ratio: 0.008,
      ratioPower: 1,
      stems: { count: 3, angle: 12, angleV: 6, spread: 0.06 },
      wind: 2,
      bark: [0.36, 0.4, 0.3],
      leaf: [[0.32, 0.46, 0.38], [0.36, 0.5, 0.42]],
      leafJitter: 0.06,
      levels: [
        { length: 1, lengthV: 0.15, taper: 0.5, curveRes: 3, curve: 0, curveV: 12, sides: 3 },
        { branches: 3, start: 0.55, length: 0.3, lengthV: 0.06, downAngle: 40, downAngleV: 10, rotate: 137.5, rotateV: 25, curveRes: 3, curve: 50, curveV: 10, sides: 3 }
      ],
      leaves: [
        { type: "flower", size: 0.01, petals: 5, petal: 0.026, cup: 0.6, color: [[0.46, 0.3, 0.72], [0.78, 0.36, 0.56], [0.4, 0.46, 0.8], [0.92, 0.9, 0.94]], centre: [0.96, 0.88, 0.52] },
        { type: "frond", at: "base", count: 10, length: 0.2, lengthV: 0.04, width: 0.05, rise: [0.4, 1.8], droop: 1, segments: 4, pinnate: 0.5 }
      ]
    },
    heather: {
      name: "Heather",
      group: "flower",
      shape: "spherical",
      baseSize: 0.2,
      scale: 0.4,
      scaleV: 0.08,
      ratio: 0.03,
      ratioPower: 1.2,
      stems: { count: 8, angle: 38, angleV: 12, spread: 0.08 },
      wind: 1.5,
      bark: [0.3, 0.24, 0.2],
      leaf: [[0.2, 0.3, 0.14], [0.24, 0.34, 0.16]],
      leafJitter: 0.1,
      levels: [{ length: 1, lengthV: 0.2, taper: 1, curveRes: 2, curve: -14, curveV: 18, sides: 3 }],
      leaves: [
        { type: "cluster", count: 1, size: 0.07, sizeV: 0.015, squash: [1, 0.75, 1] },
        { type: "tuft", count: 2, size: 0.045, sizeV: 0.01, squash: [0.55, 0.55, 1.6], color: [[0.78, 0.4, 0.64], [0.7, 0.34, 0.6], [0.84, 0.52, 0.72]], ao: 0.12 }
      ]
    },
    pampas: {
      name: "Pampas grass",
      group: "grass",
      shape: "cylindrical",
      baseSize: 1,
      scale: 2.6,
      scaleV: 0.3,
      ratio: 0.006,
      ratioPower: 1,
      stems: { count: 9, angle: 13, angleV: 6, spread: 0.18 },
      wind: 3,
      bark: [0.66, 0.62, 0.46],
      leaf: [0.4, 0.48, 0.24],
      leafJitter: 0.1,
      levels: [{ length: 1, lengthV: 0.15, taper: 0.5, curveRes: 3, curve: 12, curveV: 10, sides: 3 }],
      leaves: [
        { type: "tuft", at: "tip", count: 1, size: 0.26, sizeV: 0.04, squash: [0.4, 0.4, 2.2], color: [0.92, 0.86, 0.72], ao: 0 },
        { type: "blade", at: "base", count: 34, length: 1.3, lengthV: 0.3, width: 0.045, rise: [0.6, 2.8], droop: 1.6, keel: 0.4, segments: 3 }
      ]
    },
    meadowGrass: {
      name: "Meadow grass",
      group: "grass",
      shape: "cylindrical",
      baseSize: 1,
      scale: 0.9,
      scaleV: 0.2,
      ratio: 0.005,
      ratioPower: 1,
      stems: { count: 6, angle: 12, angleV: 7, spread: 0.07 },
      wind: 3,
      bark: [0.62, 0.62, 0.42],
      leaf: [[0.36, 0.48, 0.18], [0.42, 0.52, 0.22], [0.48, 0.52, 0.26]],
      leafJitter: 0.1,
      levels: [{ length: 1, lengthV: 0.2, taper: 0.6, curveRes: 3, curve: 14, curveV: 14, sides: 3 }],
      leaves: [
        { type: "tuft", at: "tip", count: 1, size: 0.05, sizeV: 0.01, squash: [0.4, 0.4, 2.2], color: [[0.8, 0.74, 0.52], [0.72, 0.68, 0.46]], ao: 0 },
        { type: "blade", at: "base", count: 20, length: 0.55, lengthV: 0.15, width: 0.014, rise: [0.7, 3.2], droop: 1.5, keel: 0.4, segments: 3 }
      ]
    },
    sedge: {
      name: "Sedge",
      group: "grass",
      wind: 2.5,
      leaf: [[0.26, 0.4, 0.14], [0.32, 0.45, 0.17], [0.38, 0.47, 0.2]],
      leafJitter: 0.08,
      leaves: { type: "blade", at: "base", count: 30, length: 0.75, lengthV: 0.2, width: 0.011, rise: [0.9, 5], droop: 1.3, keel: 0.5, segments: 3 }
    },
    papyrus: {
      name: "Papyrus",
      group: "grass",
      shape: "cylindrical",
      baseSize: 1,
      scale: 2.2,
      scaleV: 0.4,
      ratio: 0.007,
      ratioPower: 1,
      stems: { count: 10, angle: 10, angleV: 8, spread: 0.18 },
      wind: 1.8,
      bark: [0.34, 0.5, 0.2],
      leaf: [[0.38, 0.55, 0.18], [0.44, 0.58, 0.2]],
      leafJitter: 0.08,
      levels: [{ length: 1, lengthV: 0.25, taper: 0.5, curveRes: 3, curve: 6, curveV: 10, sides: 3 }],
      leaves: { type: "blade", at: "tip", count: 12, length: 0.3, lengthV: 0.06, width: 0.012, rise: [0.3, 2.5], droop: 1.3, keel: 0.2, segments: 2 }
    },
    waterLily: {
      name: "Water lily",
      group: "water",
      floats: true,
      wind: 0.2,
      leaf: [[0.16, 0.34, 0.12], [0.2, 0.38, 0.14], [0.24, 0.4, 0.16]],
      leafJitter: 0.06,
      leaves: { type: "fan", at: "base", count: 7, radius: 0.16, petiole: 0.16, rise: 0, droop: 0, ribs: 12, spread: 330, pleat: 0, drop: -0.07 }
    },
    floweringWaterLily: {
      name: "Water lily in flower",
      group: "water",
      floats: true,
      shape: "cylindrical",
      baseSize: 1,
      scale: 0.09,
      scaleV: 0.02,
      ratio: 0.08,
      ratioPower: 1,
      wind: 0.2,
      bark: [0.24, 0.36, 0.14],
      leaf: [[0.16, 0.34, 0.12], [0.2, 0.38, 0.14], [0.24, 0.4, 0.16]],
      leafJitter: 0.06,
      levels: [{ length: 1, lengthV: 0.1, taper: 0.5, curveRes: 2, curve: 0, curveV: 4, sides: 4 }],
      leaves: [
        { type: "flower", size: 0.025, petals: 14, petal: 0.06, cup: 0.55, cone: 0.5, color: [[0.97, 0.95, 0.92], [0.95, 0.58, 0.72], [0.98, 0.86, 0.36]], centre: [0.96, 0.78, 0.18] },
        { type: "fan", at: "base", count: 7, radius: 0.16, petiole: 0.16, rise: 0, droop: 0, ribs: 12, spread: 330, pleat: 0, drop: -0.07 }
      ]
    },
    cattail: {
      name: "Cattail",
      group: "water",
      shape: "cylindrical",
      baseSize: 1,
      scale: 1.9,
      scaleV: 0.3,
      ratio: 0.005,
      ratioPower: 1,
      stems: { count: 5, angle: 5, angleV: 4, spread: 0.12 },
      wind: 1.8,
      bark: [0.38, 0.46, 0.22],
      leaf: [[0.3, 0.44, 0.16], [0.36, 0.48, 0.2], [0.42, 0.5, 0.24]],
      leafJitter: 0.08,
      levels: [{ length: 1, lengthV: 0.12, taper: 0.7, curveRes: 3, curve: 0, curveV: 5, sides: 3 }],
      leaves: [
        { type: "tuft", at: "tip", count: 1, size: 0.075, sizeV: 0.01, out: -0.17, squash: [0.3, 0.3, 2.2], color: [[0.34, 0.2, 0.1], [0.3, 0.18, 0.09]], ao: 0 },
        { type: "blade", at: "base", count: 16, length: 1.7, lengthV: 0.3, width: 0.02, rise: [2.6, 7], droop: 0.5, keel: 0.5, segments: 4 }
      ]
    },
    reed: {
      name: "Common reed",
      group: "water",
      shape: "cylindrical",
      baseSize: 1,
      scale: 3,
      scaleV: 0.5,
      ratio: 0.004,
      ratioPower: 1,
      stems: { count: 12, angle: 7, angleV: 5, spread: 0.3 },
      wind: 2.4,
      bark: [0.52, 0.54, 0.3],
      leaf: [[0.32, 0.46, 0.2], [0.38, 0.5, 0.24]],
      leafJitter: 0.08,
      levels: [{ length: 1, lengthV: 0.15, taper: 0.7, curveRes: 4, curve: 10, curveV: 8, sides: 3, rings: { lip: 1.06, shade: 0.9 } }],
      leaves: [
        { type: "tuft", at: "tip", count: 1, size: 0.16, sizeV: 0.03, squash: [0.45, 0.45, 2], color: [[0.56, 0.44, 0.4], [0.62, 0.52, 0.44]], ao: 0 },
        { type: "blade", at: "along", count: 4, length: 0.4, lengthV: 0.08, width: 0.013, rise: 0.25, droop: 0.9, keel: 0.4, segments: 3 }
      ]
    },
    rush: {
      name: "Rush",
      group: "water",
      shape: "cylindrical",
      baseSize: 1,
      scale: 0.9,
      scaleV: 0.15,
      ratio: 0.005,
      ratioPower: 1,
      stems: { count: 22, angle: 8, angleV: 5, spread: 0.07 },
      wind: 1.6,
      bark: [0.26, 0.42, 0.18],
      leaf: [0.3, 0.44, 0.18],
      leafJitter: 0.06,
      levels: [{ length: 1, lengthV: 0.2, taper: 1, curveRes: 2, curve: 0, curveV: 4, sides: 3 }],
      leaves: { type: "cluster", at: "tip", count: 1, size: 0.016, sizeV: 0.004, out: -0.12, squash: [0.8, 1.3, 0.8], color: [0.42, 0.3, 0.16], ao: 0 }
    },
    coconut: {
      name: "Coconut palm",
      group: "palm",
      shape: "cylindrical",
      baseSize: 1,
      scale: 12,
      scaleV: 2,
      ratio: 0.017,
      ratioPower: 1,
      flare: 0.5,
      wind: 1.4,
      bark: [0.5, 0.43, 0.33],
      barkTexture: barks("palm-tree-bark"),
      leaf: [[0.24, 0.42, 0.13], [0.28, 0.46, 0.15]],
      leafJitter: 0.1,
      levels: [{ length: 1, lengthV: 0.05, taper: 0.4, curveRes: 9, curve: 28, curveV: 10, sides: 6, rings: { lip: 1.05, shade: 0.86 } }],
      leaves: [
        { type: "frond", count: 14, length: 4.6, width: 0.9, rise: 0.5, droop: 1.3, segments: 8, pinnate: 0.45, tiers: 2 },
        { type: "fruit", count: 5, size: 0.17, drop: 0.35, spread: 0.3, color: [0.34, 0.3, 0.13] }
      ]
    },
    date: {
      name: "Date palm",
      group: "palm",
      shape: "cylindrical",
      baseSize: 1,
      scale: 10,
      scaleV: 1.5,
      ratio: 0.034,
      ratioPower: 1,
      flare: 0.3,
      wind: 1.1,
      bark: [0.46, 0.38, 0.28],
      barkTexture: barks("palm-bark"),
      leaf: [[0.38, 0.48, 0.32], [0.34, 0.44, 0.29]],
      leafJitter: 0.08,
      levels: [{ length: 1, lengthV: 0.05, taper: 0.12, curveRes: 12, curve: 0, curveV: 6, sides: 7, rings: { lip: 1.16, shade: 0.8 } }],
      leaves: [
        { type: "frond", count: 26, length: 4, width: 0.5, rise: 0.6, droop: 1, segments: 8, pinnate: 0.6, tiers: 3 },
        { type: "fruit", count: 4, size: 0.2, drop: 0.55, spread: 0.45, squash: [0.6, 1.8, 0.6], color: [0.8, 0.46, 0.1] }
      ]
    },
    fanPalm: {
      name: "Fan palm",
      group: "palm",
      shape: "cylindrical",
      baseSize: 1,
      scale: 14,
      scaleV: 2,
      ratio: 0.022,
      ratioPower: 1,
      flare: 0.5,
      wind: 1.1,
      bark: [0.44, 0.38, 0.3],
      barkTexture: barks("palm-bark"),
      leaf: [[0.24, 0.42, 0.16], [0.28, 0.46, 0.18]],
      leafJitter: 0.08,
      levels: [{ length: 1, lengthV: 0.05, taper: 0.3, curveRes: 8, curve: 0, curveV: 5, sides: 6, rings: { lip: 1.03, shade: 0.9 } }],
      leaves: [
        { type: "fan", count: 18, radius: 1.6, petiole: 1.4, rise: 0.6, droop: 0.4, ribs: 12, spread: 220, pleat: 0.1, tiers: 3 },
        { type: "fan", count: 12, radius: 1, petiole: 0.5, rise: -3, droop: 0.05, ribs: 8, spread: 140, pleat: 0.08, drop: 0.7, color: [0.5, 0.4, 0.25] }
      ]
    },
    royal: {
      name: "Royal palm",
      group: "palm",
      shape: "cylindrical",
      baseSize: 1,
      scale: 15,
      scaleV: 2,
      ratio: 0.03,
      ratioPower: 1,
      flare: 0.25,
      wind: 1.2,
      swell: { at: 0.45, amount: 0.22, width: 0.22 },
      crownshaft: { from: 0.82, color: [0.3, 0.48, 0.18] },
      bark: [0.68, 0.66, 0.62],
      barkTexture: barks("palm-tree-bark"),
      leaf: [[0.22, 0.42, 0.13], [0.26, 0.46, 0.15]],
      leafJitter: 0.1,
      levels: [{ length: 1, lengthV: 0.05, taper: 0.35, curveRes: 10, curve: 0, curveV: 4, sides: 7, rings: { lip: 1, shade: 0.97 } }],
      leaves: { type: "frond", count: 15, length: 4.3, width: 0.7, rise: 0.75, droop: 1.6, segments: 8, pinnate: 0.45, tiers: 2 }
    },
    bottle: {
      name: "Bottle palm",
      group: "palm",
      shape: "cylindrical",
      baseSize: 1,
      scale: 3.6,
      scaleV: 0.5,
      ratio: 0.07,
      ratioPower: 1,
      flare: 0.1,
      wind: 1,
      swell: { at: 0.3, amount: 0.9, width: 0.3 },
      crownshaft: { from: 0.72, color: [0.36, 0.5, 0.24] },
      bark: [0.6, 0.57, 0.5],
      barkTexture: barks("palm-tree-bark"),
      leaf: [0.26, 0.45, 0.15],
      leafJitter: 0.1,
      levels: [{ length: 1, lengthV: 0.06, taper: 0.55, curveRes: 8, curve: 0, curveV: 4, sides: 8, rings: { lip: 1.02, shade: 0.94 } }],
      leaves: { type: "frond", count: 6, length: 2.4, width: 0.42, rise: 1.5, droop: 1.6, segments: 7, pinnate: 0.4 }
    },
    areca: {
      name: "Areca palm",
      group: "palm",
      shape: "cylindrical",
      baseSize: 1,
      scale: 4.5,
      scaleV: 0.8,
      ratio: 0.013,
      ratioPower: 1,
      wind: 1.6,
      stems: { count: 6, angle: 14, angleV: 6, spread: 0.25 },
      bark: [0.55, 0.58, 0.3],
      leaf: [[0.4, 0.55, 0.16], [0.44, 0.58, 0.18]],
      leafJitter: 0.08,
      levels: [{ length: 1, lengthV: 0.2, taper: 0.4, curveRes: 6, curve: 14, curveV: 10, sides: 5, rings: { lip: 1.05, shade: 0.85 } }],
      leaves: { type: "frond", count: 6, length: 2, width: 0.38, rise: 1, droop: 1.5, segments: 7, pinnate: 0.5 }
    },
    sago: {
      name: "Sago palm",
      group: "palm",
      shape: "cylindrical",
      baseSize: 1,
      scale: 1.2,
      scaleV: 0.25,
      ratio: 0.22,
      ratioPower: 1,
      wind: 0.5,
      bark: [0.4, 0.34, 0.26],
      barkTexture: barks("palm-bark"),
      leaf: [[0.14, 0.3, 0.1], [0.16, 0.33, 0.11]],
      leafJitter: 0.06,
      levels: [{ length: 1, lengthV: 0.1, taper: 0.35, curveRes: 4, curve: 0, curveV: 6, sides: 7, rings: { lip: 1.12, shade: 0.8 } }],
      leaves: { type: "frond", count: 16, length: 1.5, width: 0.3, rise: 0.7, droop: 0.6, segments: 6, pinnate: 0.6, tiers: 2 }
    },
    curvedCoconut: {
      name: "Curved coconut palm",
      group: "palm",
      shape: "cylindrical",
      baseSize: 1,
      scale: 12,
      scaleV: 2,
      ratio: 0.02,
      ratioPower: 1,
      flare: 0.6,
      wind: 1.4,
      stems: { count: 1, angle: 66, angleV: 6, spread: 0 },
      bark: [0.5, 0.43, 0.33],
      barkTexture: barks("palm-tree-bark"),
      leaf: [[0.24, 0.42, 0.13], [0.28, 0.46, 0.15]],
      leafJitter: 0.1,
      levels: [{ length: 1, lengthV: 0.06, taper: 0.45, curveRes: 12, curve: -48, curveBack: -10, curveV: 6, sides: 6, rings: { lip: 1.05, shade: 0.86 } }],
      leaves: [
        { type: "frond", count: 14, length: 4.6, width: 0.9, rise: 0.5, droop: 1.3, segments: 8, pinnate: 0.45, tiers: 2 },
        { type: "fruit", count: 5, size: 0.17, drop: 0.35, spread: 0.3, color: [0.34, 0.3, 0.13] }
      ]
    },
    dateClump: {
      name: "Clustered date palm",
      group: "palm",
      shape: "cylindrical",
      baseSize: 1,
      scale: 13,
      scaleV: 2,
      ratio: 0.026,
      ratioPower: 1,
      flare: 0.4,
      wind: 1.1,
      stems: { count: [2, 5], angle: 36, angleV: 14, spread: 0.6 },
      bark: [0.46, 0.38, 0.28],
      barkTexture: barks("palm-bark"),
      leaf: [[0.38, 0.48, 0.32], [0.34, 0.44, 0.29]],
      leafJitter: 0.08,
      levels: [{ length: 1, lengthV: 0.18, taper: 0.7, curveRes: 12, curve: -14, curveV: 8, sides: 7, rings: { lip: 1.16, shade: 0.8 } }],
      leaves: [
        { type: "frond", count: 18, length: 3.6, width: 0.5, rise: 0.6, droop: 1, segments: 8, pinnate: 0.6, tiers: 3 },
        { type: "fruit", count: 3, size: 0.2, drop: 0.55, spread: 0.45, squash: [0.6, 1.8, 0.6], color: [0.8, 0.46, 0.1] }
      ]
    },
    spindle: {
      name: "Spindle palm",
      group: "palm",
      shape: "cylindrical",
      baseSize: 1,
      scale: 9,
      scaleV: 2.5,
      ratio: 0.045,
      ratioPower: 1,
      flare: 0.3,
      wind: 1.1,
      swell: [{ at: 0.08, amount: 0.4, width: 0.14 }, { at: 0.82, amount: 0.95, width: 0.09 }],
      crownshaft: { from: 0.92, color: [0.34, 0.48, 0.24] },
      bark: [0.62, 0.58, 0.5],
      barkTexture: barks("palm-tree-bark"),
      leaf: [[0.24, 0.44, 0.15], [0.28, 0.48, 0.17]],
      leafJitter: 0.08,
      levels: [{ length: 1, lengthV: 0.12, taper: 0.45, curveRes: 16, curve: 0, curveV: 6, sides: 8, rings: { lip: 1.02, shade: 0.94 } }],
      leaves: { type: "frond", count: 8, length: 3, width: 0.5, rise: 1.2, droop: 1.5, segments: 8, pinnate: 0.45 }
    },
    christmas: {
      name: "Christmas palm",
      group: "palm",
      shape: "cylindrical",
      baseSize: 1,
      scale: 7,
      scaleV: 1.2,
      ratio: 0.024,
      ratioPower: 1,
      flare: 0.9,
      wind: 1.4,
      stems: { count: 3, angle: 13, angleV: 4, spread: 0.3 },
      swell: { at: 0.02, amount: 0.8, width: 0.06 },
      crownshaft: { from: 0.86, color: [0.4, 0.54, 0.22] },
      bark: [0.56, 0.52, 0.44],
      barkTexture: barks("palm-tree-bark"),
      leaf: [[0.26, 0.46, 0.15], [0.3, 0.5, 0.17]],
      leafJitter: 0.08,
      levels: [{ length: 1, lengthV: 0.1, taper: 0.6, curveRes: 8, curve: 0, curveV: 6, sides: 6, rings: { lip: 1.03, shade: 0.9 } }],
      leaves: { type: "frond", count: 9, length: 2.2, width: 0.42, rise: 1, droop: 1.6, segments: 7, pinnate: 0.5 }
    },
    fir: {
      name: "Fir",
      group: "conifer",
      shape: "conical",
      baseSize: 0.1,
      scale: 14,
      scaleV: 2,
      ratio: 0.017,
      ratioPower: 1.1,
      flare: 0.5,
      wind: 0.55,
      bark: [0.24, 0.18, 0.14],
      barkTexture: barks("bark-014"),
      leaf: [0.09, 0.22, 0.12],
      leafJitter: 0.14,
      levels: [
        { length: 1, lengthV: 0.04, taper: 1, curveRes: 4, curve: 0, curveV: 4, sides: 6 },
        { branches: 40, length: 0.3, lengthV: 0.05, downAngle: 96, downAngleV: 8, rotate: 137.5, rotateV: 15, curveRes: 3, curve: -18, curveV: 10, sides: 3 }
      ],
      leaves: { type: "tuft", count: 2, size: 0.9, sizeV: 0.2, squash: [0.75, 0.32, 1.5] }
    },
    pine: {
      name: "Stone pine",
      group: "conifer",
      shape: "inverseConical",
      baseSize: 0.6,
      scale: 13,
      scaleV: 2,
      ratio: 0.022,
      ratioPower: 1.2,
      flare: 0.4,
      attractionUp: 0.5,
      wind: 0.8,
      bark: [0.42, 0.3, 0.22],
      barkTexture: barks("pine-bark"),
      leaf: [[0.14, 0.27, 0.12], [0.16, 0.3, 0.13]],
      leafJitter: 0.12,
      levels: [
        { length: 1, lengthV: 0.05, taper: 0.9, curveRes: 5, curve: 10, curveV: 16, sides: 6 },
        { branches: 9, length: 0.5, lengthV: 0.1, downAngle: 42, downAngleV: 10, rotate: 137.5, rotateV: 25, curveRes: 4, curve: 18, curveBack: -18, curveV: 20, sides: 4 },
        { branches: 6, length: 0.45, lengthV: 0.1, downAngle: 55, downAngleV: 15, rotate: 140, rotateV: 30, curveRes: 2, curve: 0, curveV: 30, sides: 3 }
      ],
      leaves: { type: "cluster", count: 1, size: 1.05, sizeV: 0.25, squash: [1.4, 0.42, 1.4] }
    },
    cypress: {
      name: "Cypress",
      group: "conifer",
      shape: "flame",
      baseSize: 0.06,
      scale: 13,
      scaleV: 2,
      ratio: 0.016,
      ratioPower: 1.2,
      flare: 0.3,
      attractionUp: 0.8,
      wind: 0.6,
      bark: [0.32, 0.26, 0.2],
      barkTexture: barks("bark-015"),
      leaf: [0.1, 0.2, 0.1],
      leafJitter: 0.12,
      levels: [
        { length: 1, lengthV: 0.04, taper: 1, curveRes: 4, curve: 0, curveV: 5, sides: 5 },
        { branches: 26, length: 0.14, lengthV: 0.03, downAngle: 18, downAngleV: 6, rotate: 137.5, rotateV: 20, curveRes: 2, curve: -5, curveV: 10, sides: 3 }
      ],
      leaves: { type: "tuft", count: 1, size: 0.95, sizeV: 0.15, squash: [0.6, 0.6, 1.3] }
    },
    sugi: {
      name: "Japanese cedar",
      group: "conifer",
      shape: "conical",
      baseSize: 0.18,
      scale: 22,
      scaleV: 3,
      ratio: 0.018,
      ratioPower: 1.1,
      flare: 0.6,
      wind: 0.5,
      bark: [0.3, 0.22, 0.15],
      barkTexture: barks("japanese-cedar-bark"),
      leaf: [[0.13, 0.27, 0.12], [0.15, 0.3, 0.13]],
      leafJitter: 0.12,
      levels: [
        { length: 1, lengthV: 0.04, taper: 1, curveRes: 5, curve: 0, curveV: 4, sides: 6 },
        { branches: 42, length: 0.24, lengthV: 0.05, downAngle: 82, downAngleV: 10, rotate: 137.5, rotateV: 15, curveRes: 3, curve: 14, curveV: 10, sides: 3 }
      ],
      leaves: { type: "tuft", count: 2, size: 0.95, sizeV: 0.2, squash: [0.8, 0.45, 1.4] }
    },
    redwood: {
      name: "Redwood",
      group: "conifer",
      shape: "conical",
      baseSize: 0.32,
      scale: 28,
      scaleV: 4,
      ratio: 0.024,
      ratioPower: 1.1,
      flare: 1.1,
      wind: 0.4,
      bark: [0.38, 0.26, 0.18],
      barkTexture: barks("chinese-cedar-bark"),
      leaf: [[0.1, 0.24, 0.1], [0.12, 0.27, 0.11]],
      leafJitter: 0.12,
      levels: [
        { length: 1, lengthV: 0.04, taper: 1, curveRes: 5, curve: 0, curveV: 3, sides: 8, flute: 0.08 },
        { branches: 46, length: 0.18, lengthV: 0.05, downAngle: 100, downAngleV: 10, rotate: 137.5, rotateV: 15, curveRes: 3, curve: 20, curveV: 12, sides: 3 }
      ],
      leaves: { type: "tuft", count: 2, size: 1.1, sizeV: 0.25, squash: [0.8, 0.4, 1.3] }
    },
    dawnRedwood: {
      name: "Dawn redwood",
      group: "conifer",
      shape: "conical",
      baseSize: 0.12,
      scale: 18,
      scaleV: 2.5,
      ratio: 0.022,
      ratioPower: 1.1,
      flare: 1,
      wind: 0.7,
      bark: [0.35, 0.24, 0.17],
      barkTexture: barks("metasequoia-bark"),
      leaf: [[0.32, 0.5, 0.2], [0.36, 0.54, 0.22]],
      leafJitter: 0.12,
      levels: [
        { length: 1, lengthV: 0.04, taper: 1, curveRes: 5, curve: 0, curveV: 4, sides: 7, flute: 0.14 },
        { branches: 36, length: 0.3, lengthV: 0.06, downAngle: 70, downAngleV: 10, rotate: 137.5, rotateV: 15, curveRes: 3, curve: 10, curveV: 10, sides: 3 }
      ],
      leaves: { type: "tuft", count: 2, size: 0.9, sizeV: 0.2, squash: [0.9, 0.35, 1.3] }
    },
    blackPine: {
      name: "Black pine",
      group: "conifer",
      shape: "conical",
      baseSize: 0.35,
      scale: 16,
      scaleV: 2.5,
      ratio: 0.022,
      ratioPower: 1.2,
      flare: 0.5,
      attractionUp: 0.35,
      wind: 0.7,
      bark: [0.3, 0.27, 0.2],
      barkTexture: barks("knotted-pine-bark"),
      leaf: [[0.1, 0.22, 0.1], [0.12, 0.25, 0.11]],
      leafJitter: 0.12,
      levels: [
        { length: 1, lengthV: 0.05, taper: 0.95, curveRes: 5, curve: 0, curveV: 10, sides: 6 },
        { branches: 16, length: 0.4, lengthV: 0.1, downAngle: 70, downAngleV: 12, rotate: 137.5, rotateV: 25, curveRes: 4, curve: 22, curveV: 20, sides: 4 },
        { branches: 5, length: 0.45, lengthV: 0.1, downAngle: 50, downAngleV: 15, rotate: 140, rotateV: 30, curveRes: 2, curve: 0, curveV: 30, sides: 3 }
      ],
      leaves: { type: "cluster", count: 1, size: 0.95, sizeV: 0.25, squash: [1.2, 0.55, 1.2] }
    },
    oak: {
      name: "Oak",
      group: "broadleaf",
      shape: "spherical",
      baseSize: 0.3,
      scale: 12,
      scaleV: 2,
      ratio: 0.026,
      ratioPower: 1.3,
      flare: 0.7,
      attractionUp: 0.35,
      wind: 1,
      bark: [0.3, 0.25, 0.2],
      barkTexture: barks("jolcham-oak-bark-01", "bark-012", "bark-brown-02", "bark-008"),
      leaf: [0.22, 0.36, 0.12],
      leafJitter: 0.22,
      levels: [
        { length: 1, lengthV: 0.05, taper: 0.85, curveRes: 5, curve: 0, curveV: 22, sides: 6 },
        { branches: 16, length: 0.55, lengthV: 0.1, downAngle: 58, downAngleV: 14, rotate: 140, rotateV: 25, curveRes: 4, curve: -28, curveBack: 18, curveV: 50, sides: 5 },
        { branches: 4, length: 0.45, lengthV: 0.12, downAngle: 42, downAngleV: 16, rotate: 140, rotateV: 30, curveRes: 3, curve: -12, curveV: 60, sides: 3 }
      ],
      leaves: { type: "cluster", count: 1, size: 0.85, sizeV: 0.25, squash: [1, 0.7, 1] }
    },
    birch: {
      name: "Birch",
      group: "broadleaf",
      shape: "tendFlame",
      baseSize: 0.38,
      scale: 15,
      scaleV: 2,
      ratio: 0.013,
      ratioPower: 1.2,
      flare: 0.3,
      attractionUp: -0.15,
      wind: 1.1,
      bark: [0.86, 0.85, 0.8],
      barkTexture: barks("bark-009"),
      leaf: [0.4, 0.52, 0.17],
      leafJitter: 0.18,
      levels: [
        { length: 1, lengthV: 0.04, taper: 0.95, curveRes: 5, curve: 0, curveV: 12, sides: 6 },
        { branches: 18, length: 0.3, lengthV: 0.08, downAngle: 48, downAngleV: 12, rotate: 140, rotateV: 25, curveRes: 3, curve: 20, curveBack: 10, curveV: 40, sides: 4 },
        { branches: 5, length: 0.5, lengthV: 0.12, downAngle: 55, downAngleV: 15, rotate: 140, rotateV: 30, curveRes: 3, curve: 25, curveV: 40, sides: 3 }
      ],
      leaves: { type: "cluster", count: 1, size: 0.6, sizeV: 0.2, squash: [1, 0.8, 1] }
    },
    poplar: {
      name: "Poplar",
      group: "broadleaf",
      shape: "flame",
      baseSize: 0.12,
      scale: 17,
      scaleV: 2,
      ratio: 0.014,
      ratioPower: 1.2,
      flare: 0.4,
      attractionUp: 0.6,
      wind: 0.8,
      bark: [0.4, 0.37, 0.31],
      barkTexture: barks("bark-004", "bark-007"),
      leaf: [0.21, 0.38, 0.13],
      leafJitter: 0.18,
      levels: [
        { length: 1, lengthV: 0.04, taper: 0.95, curveRes: 5, curve: 0, curveV: 8, sides: 6 },
        { branches: 28, length: 0.24, lengthV: 0.06, downAngle: 24, downAngleV: 8, rotate: 140, rotateV: 25, curveRes: 3, curve: -6, curveV: 20, sides: 3 },
        { branches: 3, length: 0.5, lengthV: 0.1, downAngle: 32, downAngleV: 10, rotate: 140, rotateV: 30, curveRes: 2, curve: 0, curveV: 30, sides: 3 }
      ],
      leaves: { type: "cluster", count: 1, size: 0.72, sizeV: 0.2, squash: [0.85, 1.15, 0.85] }
    },
    acacia: {
      name: "Acacia",
      group: "broadleaf",
      shape: "inverseConical",
      baseSize: 0.42,
      scale: 9,
      scaleV: 1.5,
      ratio: 0.03,
      ratioPower: 1.3,
      flare: 0.6,
      attractionUp: 0.9,
      wind: 1,
      bark: [0.36, 0.29, 0.22],
      barkTexture: barks("bark-002"),
      leaf: [0.3, 0.38, 0.15],
      leafJitter: 0.2,
      levels: [
        { length: 1, lengthV: 0.06, taper: 0.8, curveRes: 4, curve: 12, curveV: 26, sides: 6 },
        { branches: 9, length: 0.8, lengthV: 0.12, downAngle: 50, downAngleV: 10, rotate: 137.5, rotateV: 30, curveRes: 4, curve: 22, curveBack: -10, curveV: 30, sides: 5 },
        { branches: 6, length: 0.5, lengthV: 0.12, downAngle: 55, downAngleV: 15, rotate: 140, rotateV: 30, curveRes: 2, curve: 10, curveV: 30, sides: 3 }
      ],
      leaves: { type: "cluster", count: 1, size: 1.05, sizeV: 0.25, squash: [1.45, 0.38, 1.45] }
    },
    maple: {
      name: "Maple",
      group: "broadleaf",
      shape: "tendFlame",
      baseSize: 0.25,
      scale: 11,
      scaleV: 1.5,
      ratio: 0.022,
      ratioPower: 1.25,
      flare: 0.5,
      attractionUp: 0.5,
      wind: 1,
      bark: [0.35, 0.31, 0.27],
      barkTexture: barks("trident-maple-bark"),
      leaf: [[0.78, 0.25, 0.08], [0.86, 0.44, 0.1], [0.68, 0.15, 0.07], [0.88, 0.6, 0.16]],
      leafJitter: 0.1,
      levels: [
        { length: 1, lengthV: 0.05, taper: 0.9, curveRes: 5, curve: 0, curveV: 14, sides: 6 },
        { branches: 14, length: 0.5, lengthV: 0.1, downAngle: 45, downAngleV: 12, rotate: 140, rotateV: 25, curveRes: 4, curve: -20, curveV: 40, sides: 4 },
        { branches: 5, length: 0.45, lengthV: 0.1, downAngle: 40, downAngleV: 15, rotate: 140, rotateV: 30, curveRes: 3, curve: -8, curveV: 50, sides: 3 }
      ],
      leaves: { type: "cluster", count: 1, size: 0.85, sizeV: 0.25, squash: [1, 0.75, 1] }
    },
    cherry: {
      name: "Cherry blossom",
      group: "broadleaf",
      shape: "hemispherical",
      baseSize: 0.28,
      scale: 7,
      scaleV: 1,
      ratio: 0.035,
      ratioPower: 1.3,
      flare: 0.5,
      attractionUp: 0.25,
      wind: 1,
      bark: [0.3, 0.22, 0.2],
      barkTexture: barks("sakura-bark"),
      leaf: [[0.9, 0.52, 0.64], [0.94, 0.64, 0.74], [0.84, 0.44, 0.58]],
      leafJitter: 0.05,
      levels: [
        { length: 1, lengthV: 0.06, taper: 0.8, curveRes: 4, curve: 0, curveV: 26, sides: 6 },
        { branches: 9, length: 0.75, lengthV: 0.12, downAngle: 52, downAngleV: 12, rotate: 137.5, rotateV: 30, curveRes: 4, curve: 18, curveBack: -14, curveV: 30, sides: 5 },
        { branches: 6, length: 0.5, lengthV: 0.12, downAngle: 45, downAngleV: 15, rotate: 140, rotateV: 30, curveRes: 3, curve: -10, curveV: 40, sides: 3 }
      ],
      leaves: { type: "cluster", count: 1, size: 0.8, sizeV: 0.22, squash: [1.1, 0.75, 1.1] }
    },
    willow: {
      name: "Weeping willow",
      group: "broadleaf",
      shape: "spherical",
      baseSize: 0.3,
      scale: 10,
      scaleV: 1.5,
      ratio: 0.035,
      ratioPower: 1.3,
      flare: 0.6,
      attractionUp: -0.9,
      wind: 1.3,
      bark: [0.33, 0.29, 0.22],
      barkTexture: barks("bark-willow", "bark-willow-02", "bark-013"),
      leaf: [[0.42, 0.55, 0.2], [0.38, 0.51, 0.18]],
      leafJitter: 0.1,
      levels: [
        { length: 1, lengthV: 0.05, taper: 0.85, curveRes: 4, curve: 0, curveV: 16, sides: 6 },
        { branches: 12, length: 0.6, lengthV: 0.1, downAngle: 40, downAngleV: 10, rotate: 140, rotateV: 25, curveRes: 4, curve: 40, curveV: 20, sides: 4 },
        { branches: 6, length: 0.7, lengthV: 0.15, downAngle: 60, downAngleV: 20, rotate: 140, rotateV: 30, curveRes: 3, curve: 50, curveV: 20, sides: 3 }
      ],
      leaves: { type: "strand", count: 2, length: 2.6, lengthV: 0.6, width: 0.22, segments: 3, keel: 0.3 }
    },
    olive: {
      name: "Olive",
      group: "broadleaf",
      shape: "spherical",
      baseSize: 0.35,
      scale: 6,
      scaleV: 1,
      ratio: 0.05,
      ratioPower: 1.4,
      flare: 0.6,
      attractionUp: 0.3,
      stems: { count: 2, angle: 16, angleV: 6, spread: 0.1 },
      wind: 0.9,
      bark: [0.38, 0.35, 0.3],
      barkTexture: barks("bark-001", "bark-006"),
      leaf: [[0.42, 0.47, 0.33], [0.36, 0.42, 0.3], [0.48, 0.52, 0.4]],
      leafJitter: 0.08,
      levels: [
        { length: 1, lengthV: 0.08, taper: 0.7, curveRes: 5, curve: 0, curveV: 45, sides: 7, flute: 0.18 },
        { branches: 8, length: 0.7, lengthV: 0.15, downAngle: 48, downAngleV: 15, rotate: 137.5, rotateV: 40, curveRes: 4, curve: -10, curveV: 50, sides: 4 },
        { branches: 5, length: 0.5, lengthV: 0.15, downAngle: 45, downAngleV: 15, rotate: 140, rotateV: 30, curveRes: 3, curve: 0, curveV: 50, sides: 3 }
      ],
      leaves: { type: "cluster", count: 1, size: 0.75, sizeV: 0.2, squash: [1.1, 0.6, 1.1] }
    },
    baobab: {
      name: "Baobab",
      group: "broadleaf",
      shape: "inverseConical",
      baseSize: 0.82,
      scale: 11,
      scaleV: 1.5,
      ratio: 0.12,
      ratioPower: 1.6,
      flare: 0.15,
      swell: { at: 0.4, amount: 0.25, width: 0.35 },
      attractionUp: 0.6,
      wind: 0.5,
      bark: [0.55, 0.48, 0.42],
      barkTexture: barks("bark-003"),
      leaf: [0.3, 0.42, 0.16],
      leafJitter: 0.15,
      levels: [
        { length: 1, lengthV: 0.05, taper: 0.35, curveRes: 5, curve: 0, curveV: 6, sides: 9, flute: 0.06 },
        { branches: 7, length: 0.5, lengthV: 0.1, downAngle: 70, downAngleV: 12, rotate: 137.5, rotateV: 30, curveRes: 3, curve: -50, curveV: 30, sides: 5 },
        { branches: 3, length: 0.6, lengthV: 0.15, downAngle: 40, downAngleV: 15, rotate: 140, rotateV: 40, curveRes: 2, curve: -10, curveV: 40, sides: 3 }
      ],
      leaves: { type: "cluster", count: 1, size: 0.7, sizeV: 0.2, squash: [1.2, 0.55, 1.2] }
    },
    eucalyptus: {
      name: "Eucalyptus",
      group: "broadleaf",
      shape: "tendFlame",
      baseSize: 0.45,
      scale: 20,
      scaleV: 3,
      ratio: 0.016,
      ratioPower: 1.2,
      flare: 0.5,
      attractionUp: -0.3,
      wind: 1.1,
      bark: [0.8, 0.77, 0.68],
      barkTexture: barks("eucalyptus-bark"),
      leaf: [[0.35, 0.45, 0.36], [0.3, 0.4, 0.33]],
      leafJitter: 0.1,
      levels: [
        { length: 1, lengthV: 0.05, taper: 0.95, curveRes: 6, curve: 0, curveV: 18, sides: 6 },
        { branches: 13, length: 0.35, lengthV: 0.1, downAngle: 38, downAngleV: 12, rotate: 140, rotateV: 30, curveRes: 4, curve: -12, curveV: 40, sides: 4 },
        { branches: 4, length: 0.55, lengthV: 0.15, downAngle: 50, downAngleV: 15, rotate: 140, rotateV: 30, curveRes: 3, curve: 20, curveV: 40, sides: 3 }
      ],
      leaves: { type: "cluster", count: 1, size: 0.8, sizeV: 0.25, squash: [0.9, 0.9, 0.9] }
    },
    plane: {
      name: "Plane tree",
      group: "broadleaf",
      shape: "spherical",
      baseSize: 0.32,
      scale: 17,
      scaleV: 2.5,
      ratio: 0.024,
      ratioPower: 1.3,
      flare: 0.6,
      attractionUp: 0.3,
      wind: 1,
      bark: [0.48, 0.43, 0.38],
      barkTexture: barks("bark-platanus", "japanese-sycamore"),
      leaf: [[0.3, 0.44, 0.15], [0.34, 0.48, 0.17]],
      leafJitter: 0.15,
      levels: [
        { length: 1, lengthV: 0.05, taper: 0.85, curveRes: 5, curve: 0, curveV: 14, sides: 7 },
        { branches: 15, length: 0.6, lengthV: 0.1, downAngle: 52, downAngleV: 12, rotate: 140, rotateV: 25, curveRes: 4, curve: -20, curveBack: 12, curveV: 40, sides: 5 },
        { branches: 5, length: 0.45, lengthV: 0.12, downAngle: 42, downAngleV: 15, rotate: 140, rotateV: 30, curveRes: 3, curve: -10, curveV: 50, sides: 3 }
      ],
      leaves: { type: "cluster", count: 1, size: 0.95, sizeV: 0.25, squash: [1.05, 0.75, 1.05] }
    },
    zelkova: {
      name: "Zelkova",
      group: "broadleaf",
      shape: "tendFlame",
      baseSize: 0.22,
      scale: 14,
      scaleV: 2,
      ratio: 0.024,
      ratioPower: 1.3,
      flare: 0.5,
      attractionUp: 0.6,
      wind: 1,
      bark: [0.61, 0.52, 0.44],
      barkTexture: barks("japanese-zelkova-bark"),
      leaf: [[0.26, 0.42, 0.14], [0.3, 0.46, 0.16]],
      leafJitter: 0.15,
      levels: [
        { length: 1, lengthV: 0.05, taper: 0.9, curveRes: 4, curve: 0, curveV: 10, sides: 6 },
        { branches: 12, length: 0.7, lengthV: 0.12, downAngle: 30, downAngleV: 8, rotate: 137.5, rotateV: 25, curveRes: 4, curve: 12, curveBack: -6, curveV: 30, sides: 5 },
        { branches: 5, length: 0.5, lengthV: 0.12, downAngle: 40, downAngleV: 15, rotate: 140, rotateV: 30, curveRes: 3, curve: 8, curveV: 40, sides: 3 }
      ],
      leaves: { type: "cluster", count: 1, size: 0.8, sizeV: 0.22, squash: [1.1, 0.7, 1.1] }
    },
    camphor: {
      name: "Camphor tree",
      group: "broadleaf",
      shape: "hemispherical",
      baseSize: 0.25,
      scale: 13,
      scaleV: 2,
      ratio: 0.034,
      ratioPower: 1.35,
      flare: 0.7,
      attractionUp: 0.25,
      wind: 0.9,
      bark: [0.64, 0.53, 0.44],
      barkTexture: barks("japanese-camphor-bark"),
      leaf: [[0.16, 0.32, 0.1], [0.2, 0.36, 0.12]],
      leafJitter: 0.12,
      levels: [
        { length: 1, lengthV: 0.06, taper: 0.8, curveRes: 4, curve: 0, curveV: 22, sides: 7 },
        { branches: 11, length: 0.75, lengthV: 0.12, downAngle: 55, downAngleV: 12, rotate: 137.5, rotateV: 30, curveRes: 4, curve: 14, curveBack: -14, curveV: 30, sides: 5 },
        { branches: 6, length: 0.5, lengthV: 0.12, downAngle: 45, downAngleV: 15, rotate: 140, rotateV: 30, curveRes: 3, curve: -10, curveV: 40, sides: 3 }
      ],
      leaves: { type: "cluster", count: 1, size: 1, sizeV: 0.25, squash: [1.15, 0.72, 1.15] }
    },
    hackberry: {
      name: "Hackberry",
      group: "broadleaf",
      shape: "spherical",
      baseSize: 0.3,
      scale: 12,
      scaleV: 2,
      ratio: 0.025,
      ratioPower: 1.3,
      flare: 0.5,
      attractionUp: 0.35,
      wind: 1,
      bark: [0.42, 0.36, 0.26],
      barkTexture: barks("chinese-hackberry-bark", "japanese-hackberry-bark"),
      leaf: [[0.28, 0.42, 0.15], [0.32, 0.46, 0.17]],
      leafJitter: 0.16,
      levels: [
        { length: 1, lengthV: 0.05, taper: 0.85, curveRes: 5, curve: 0, curveV: 18, sides: 6 },
        { branches: 14, length: 0.55, lengthV: 0.1, downAngle: 50, downAngleV: 14, rotate: 140, rotateV: 25, curveRes: 4, curve: -18, curveBack: 10, curveV: 45, sides: 5 },
        { branches: 5, length: 0.45, lengthV: 0.12, downAngle: 42, downAngleV: 16, rotate: 140, rotateV: 30, curveRes: 3, curve: -10, curveV: 55, sides: 3 }
      ],
      leaves: { type: "cluster", count: 1, size: 0.85, sizeV: 0.25, squash: [1, 0.75, 1] }
    },
    chestnut: {
      name: "Sweet chestnut",
      group: "broadleaf",
      shape: "spherical",
      baseSize: 0.28,
      scale: 14,
      scaleV: 2,
      ratio: 0.032,
      ratioPower: 1.35,
      flare: 0.8,
      attractionUp: 0.3,
      wind: 0.9,
      bark: [0.46, 0.38, 0.23],
      barkTexture: barks("bark-brown-01"),
      leaf: [[0.24, 0.38, 0.12], [0.28, 0.42, 0.14]],
      leafJitter: 0.18,
      levels: [
        { length: 1, lengthV: 0.05, taper: 0.85, curveRes: 5, curve: 0, curveV: 20, sides: 7 },
        { branches: 14, length: 0.6, lengthV: 0.1, downAngle: 60, downAngleV: 14, rotate: 140, rotateV: 25, curveRes: 4, curve: -26, curveBack: 16, curveV: 50, sides: 5 },
        { branches: 5, length: 0.45, lengthV: 0.12, downAngle: 42, downAngleV: 16, rotate: 140, rotateV: 30, curveRes: 3, curve: -12, curveV: 60, sides: 3 }
      ],
      leaves: { type: "cluster", count: 1, size: 0.9, sizeV: 0.25, squash: [1, 0.72, 1] }
    },
    beech: {
      name: "Beech",
      group: "broadleaf",
      shape: "tendFlame",
      baseSize: 0.3,
      scale: 16,
      scaleV: 2.5,
      ratio: 0.02,
      ratioPower: 1.25,
      flare: 0.5,
      attractionUp: 0.3,
      wind: 1,
      bark: [0.59, 0.58, 0.49],
      barkTexture: barks("bark-010", "bark-011"),
      leaf: [[0.26, 0.42, 0.13], [0.3, 0.46, 0.15]],
      leafJitter: 0.14,
      levels: [
        { length: 1, lengthV: 0.05, taper: 0.9, curveRes: 5, curve: 0, curveV: 12, sides: 6 },
        { branches: 16, length: 0.5, lengthV: 0.1, downAngle: 48, downAngleV: 12, rotate: 140, rotateV: 25, curveRes: 4, curve: -16, curveV: 40, sides: 4 },
        { branches: 5, length: 0.45, lengthV: 0.1, downAngle: 40, downAngleV: 15, rotate: 140, rotateV: 30, curveRes: 3, curve: -8, curveV: 50, sides: 3 }
      ],
      leaves: { type: "cluster", count: 1, size: 0.9, sizeV: 0.25, squash: [1, 0.78, 1] }
    },
    alder: {
      name: "Alder",
      group: "broadleaf",
      shape: "conical",
      baseSize: 0.25,
      scale: 13,
      scaleV: 2,
      ratio: 0.017,
      ratioPower: 1.2,
      flare: 0.4,
      attractionUp: 0.4,
      wind: 1.1,
      bark: [0.33, 0.34, 0.27],
      barkTexture: barks("bark-005"),
      leaf: [[0.16, 0.32, 0.12], [0.19, 0.35, 0.13]],
      leafJitter: 0.14,
      levels: [
        { length: 1, lengthV: 0.04, taper: 0.95, curveRes: 5, curve: 0, curveV: 8, sides: 6 },
        { branches: 22, length: 0.35, lengthV: 0.08, downAngle: 55, downAngleV: 10, rotate: 140, rotateV: 25, curveRes: 3, curve: -10, curveV: 30, sides: 4 },
        { branches: 4, length: 0.45, lengthV: 0.12, downAngle: 45, downAngleV: 15, rotate: 140, rotateV: 30, curveRes: 2, curve: 0, curveV: 40, sides: 3 }
      ],
      leaves: { type: "cluster", count: 1, size: 0.7, sizeV: 0.2, squash: [1, 0.8, 1] }
    },
    feverTree: {
      name: "Fever tree",
      group: "broadleaf",
      shape: "inverseConical",
      baseSize: 0.4,
      scale: 12,
      scaleV: 2,
      ratio: 0.026,
      ratioPower: 1.3,
      flare: 0.4,
      attractionUp: 0.8,
      wind: 1,
      bark: [0.52, 0.56, 0.3],
      barkTexture: barks("fever-tree-bark"),
      leaf: [[0.36, 0.48, 0.18], [0.4, 0.52, 0.2]],
      leafJitter: 0.15,
      levels: [
        { length: 1, lengthV: 0.06, taper: 0.8, curveRes: 4, curve: 8, curveV: 22, sides: 6 },
        { branches: 9, length: 0.8, lengthV: 0.12, downAngle: 48, downAngleV: 10, rotate: 137.5, rotateV: 30, curveRes: 4, curve: 20, curveBack: -10, curveV: 30, sides: 5 },
        { branches: 6, length: 0.5, lengthV: 0.12, downAngle: 55, downAngleV: 15, rotate: 140, rotateV: 30, curveRes: 2, curve: 10, curveV: 30, sides: 3 }
      ],
      leaves: { type: "cluster", count: 1, size: 0.95, sizeV: 0.25, squash: [1.4, 0.42, 1.4] }
    },
    blueGum: {
      name: "Blue gum",
      group: "broadleaf",
      shape: "tendFlame",
      baseSize: 0.45,
      scale: 22,
      scaleV: 3,
      ratio: 0.017,
      ratioPower: 1.2,
      flare: 0.6,
      attractionUp: -0.3,
      wind: 1.1,
      bark: [0.4, 0.36, 0.31],
      barkTexture: barks("bark-bluegum"),
      leaf: [[0.32, 0.42, 0.4], [0.28, 0.38, 0.36]],
      leafJitter: 0.1,
      levels: [
        { length: 1, lengthV: 0.05, taper: 0.95, curveRes: 6, curve: 0, curveV: 18, sides: 6 },
        { branches: 13, length: 0.35, lengthV: 0.1, downAngle: 40, downAngleV: 12, rotate: 140, rotateV: 30, curveRes: 4, curve: -12, curveV: 40, sides: 4 },
        { branches: 4, length: 0.55, lengthV: 0.15, downAngle: 50, downAngleV: 15, rotate: 140, rotateV: 30, curveRes: 3, curve: 20, curveV: 40, sides: 3 }
      ],
      leaves: { type: "cluster", count: 1, size: 0.8, sizeV: 0.25, squash: [0.85, 0.95, 0.85] }
    },
    dead: {
      name: "Dead tree",
      group: "broadleaf",
      shape: "spherical",
      baseSize: 0.25,
      scale: 9,
      scaleV: 2,
      ratio: 0.03,
      ratioPower: 1.3,
      flare: 0.6,
      attractionUp: 0.2,
      wind: 0.3,
      bark: [0.36, 0.33, 0.3],
      barkTexture: barks("tree-bark-03"),
      levels: [
        { length: 1, lengthV: 0.06, taper: 0.9, curveRes: 5, curve: 0, curveV: 30, sides: 6 },
        { branches: 9, length: 0.55, lengthV: 0.12, downAngle: 50, downAngleV: 15, rotate: 140, rotateV: 40, curveRes: 4, curve: -20, curveV: 60, sides: 4 },
        { branches: 4, length: 0.5, lengthV: 0.15, downAngle: 40, downAngleV: 15, rotate: 140, rotateV: 40, curveRes: 3, curve: -5, curveV: 70, sides: 3 }
      ]
    }
  };
  PHI = (1 + Math.sqrt(5)) / 2;
  ICOSAHEDRON_VERTICES = [
    [-1, PHI, 0],
    [1, PHI, 0],
    [-1, -PHI, 0],
    [1, -PHI, 0],
    [0, -1, PHI],
    [0, 1, PHI],
    [0, -1, -PHI],
    [0, 1, -PHI],
    [PHI, 0, -1],
    [PHI, 0, 1],
    [-PHI, 0, -1],
    [-PHI, 0, 1]
  ].map(normalize2);
});

// src/vegetation/species.js
var floatsOn = (species, recordOf) => Boolean((SPECIES[species] ?? SPECIES[recordOf?.(species)?.base])?.floats);
var init_species = __esm(() => {
  init_tree_generator();
});

// src/fauna/species.js
var WALK, AMBLE, STRUT, WADDLE, SPECIES2, speciesOf = (name) => SPECIES2.find((species) => species.name === name);
var init_species2 = __esm(() => {
  WALK = { lag: 0.25, duty: 0.64, sway: 1.5, bob: 0.02, lift: 0.12, reach: 25 };
  AMBLE = { lag: 0.14, duty: 0.68, sway: 2.5, bob: 0.02, lift: 0.1, reach: 25 };
  STRUT = { lag: 0, duty: 0.6, sway: 2, bob: 0.03, lift: 0.2, reach: 24 };
  WADDLE = { lag: 0, duty: 0.62, sway: 9, bob: 0.03, lift: 0.12, reach: 16 };
  SPECIES2 = [
    {
      name: "polar-bear",
      source: { file: "polar-bear.glb", drop: ["Material.003"], faces: "+x" },
      metres: { length: 2.5 },
      triangles: 420,
      legs: 4,
      neck: [[0.72, 0.6], [0.84, 0.6]],
      wild: true,
      habitat: { band: [0.8, 1], slope: 20 },
      share: 0.06,
      group: [1, 1],
      territory: 120,
      pace: 1,
      gait: AMBLE,
      rest: { stand: [12, 40], lie: [60, 200], lies: 0.45 }
    },
    {
      name: "penguin",
      source: { file: "penguin.glb", faces: "-x" },
      metres: { height: 0.95 },
      triangles: 240,
      legs: 2,
      neck: [[0.5, 0.7], [0.5, 0.8]],
      wild: true,
      habitat: { band: [0.8, 1], slope: 12 },
      share: 0.04,
      group: [4, 8],
      territory: 40,
      pace: 0.3,
      gait: WADDLE,
      rest: { stand: [20, 70] }
    },
    {
      name: "elephant",
      source: { file: "elephant.glb", faces: "-x" },
      metres: { height: 3.2 },
      triangles: 420,
      legs: 4,
      neck: [[0.7, 0.6], [0.8, 0.6]],
      group: [2, 4],
      territory: 150,
      pace: 1.1,
      gait: AMBLE,
      rest: { stand: [15, 50] }
    },
    {
      name: "horse",
      source: { file: "horse.glb", faces: "+x" },
      metres: { height: 2 },
      triangles: 400,
      legs: 4,
      neck: [[0.6, 0.62], [0.74, 0.8]],
      tail: [[0.09, 0.66], [0.03, 0.25]],
      group: [2, 5],
      territory: 150,
      pace: 1.3,
      gait: WALK,
      rest: { stand: [10, 30], graze: 55 }
    },
    {
      name: "cow",
      source: { file: "farm-pack.glb", node: "cow", faces: "+z" },
      metres: { height: 1.5 },
      triangles: 420,
      legs: 4,
      neck: [[0.72, 0.7], [0.84, 0.7]],
      tail: [[0.04, 0.72], [0, 0.25]],
      group: [3, 6],
      territory: 80,
      pace: 0.8,
      gait: WALK,
      rest: { stand: [20, 60], lie: [60, 180], lies: 0.3, graze: 50 }
    },
    {
      name: "sheep",
      source: { file: "farm-pack.glb", node: "Cube.001", faces: "+z" },
      metres: { height: 0.9 },
      triangles: 320,
      legs: 4,
      neck: [[0.74, 0.7], [0.86, 0.7]],
      group: [3, 7],
      territory: 70,
      pace: 0.7,
      gait: WALK,
      rest: { stand: [20, 60], lie: [50, 150], lies: 0.3, graze: 45 }
    },
    {
      name: "dog",
      source: { file: "farm-pack.glb", node: "dog", faces: "+z" },
      metres: { length: 1 },
      triangles: 300,
      legs: 4,
      neck: [[0.66, 0.6], [0.78, 0.68]],
      tail: [[0.2, 0.62], [0.31, 0.82]],
      group: [1, 2],
      territory: 140,
      pace: 1,
      gait: WALK,
      rest: { stand: [8, 25], lie: [40, 120], lies: 0.4 }
    },
    {
      name: "cat",
      source: { file: "farm-pack.glb", node: "Cube.002", faces: "+z" },
      metres: { length: 0.6 },
      triangles: 300,
      legs: 4,
      neck: [[0.7, 0.6], [0.82, 0.62]],
      tail: [[0.2, 0.45], [0.05, 0.95]],
      group: [1, 1],
      territory: 60,
      pace: 0.5,
      gait: WALK,
      rest: { stand: [10, 30], lie: [60, 200], lies: 0.5 }
    },
    {
      name: "goose",
      source: { file: "goose.glb", faces: "+z" },
      metres: { height: 0.8 },
      triangles: 300,
      legs: 2,
      neck: [[0.6, 0.55], [0.66, 0.75]],
      group: [3, 6],
      territory: 50,
      pace: 0.5,
      gait: STRUT,
      rest: { stand: [15, 45], graze: 60 }
    },
    {
      name: "chicken",
      source: { file: "chicken.glb", faces: "+z" },
      metres: { height: 0.45 },
      triangles: 280,
      legs: 2,
      neck: [[0.6, 0.6], [0.7, 0.72]],
      group: [3, 6],
      territory: 30,
      pace: 0.45,
      gait: STRUT,
      rest: { stand: [6, 18], graze: 70 }
    },
    {
      name: "tyrannosaurus",
      source: { file: "tyrannosaurus.glb", faces: "+z", clips: { walk: "TRex_Walk", run: "TRex_Run", idle: "TRex_Idle", attack: "TRex_Attack", jump: "TRex_Jump", death: "TRex_Death" } },
      metres: { length: 12 },
      triangles: 440,
      legs: 2,
      group: [1, 2],
      territory: 200,
      pace: 2.5,
      run: { pace: 6, share: 0.1 },
      rest: { stand: [15, 50], lie: [60, 180], lies: 0.25, acts: 0.4 }
    },
    {
      name: "triceratops",
      source: { file: "triceratops.glb", faces: "+z", clips: { walk: "Triceratops_Walk", run: "Triceratops_Run", idle: "Triceratops_Idle", attack: "Triceratops_Attack", jump: "Triceratops_Jump", death: "Triceratops_Death" } },
      metres: { length: 8.5 },
      triangles: 440,
      legs: 4,
      group: [2, 5],
      territory: 150,
      pace: 1,
      run: { pace: 4, share: 0.1 },
      rest: { stand: [15, 50], lie: [60, 180], lies: 0.25, acts: 0.4 }
    },
    {
      name: "stegosaurus",
      source: { file: "stegosaurus.glb", faces: "+z", clips: { walk: "Stegosaurus_Walk", run: "Stegosaurus_Run", idle: "Stegosaurus_Idle", attack: "Stegosaurus_Attack", jump: "Stegosaurus_Jump", death: "Stegosaurus_Death" } },
      metres: { length: 9 },
      triangles: 440,
      legs: 4,
      group: [1, 3],
      territory: 120,
      pace: 0.9,
      run: { pace: 3.5, share: 0.05 },
      rest: { stand: [15, 45], lie: [60, 180], lies: 0.25, acts: 0.4 }
    },
    {
      name: "apatosaurus",
      source: { file: "apatosaurus.glb", faces: "+z", clips: { walk: "Apatosaurus_Walk", run: "Apatosaurus_Run", idle: "Apatosaurus_Idle", attack: "Apatosaurus_Attack", jump: "Apatosaurus_Jump", death: "Stegosaurus_Death" } },
      metres: { length: 22 },
      triangles: 440,
      legs: 4,
      group: [2, 5],
      territory: 200,
      pace: 1,
      run: { pace: 3.5, share: 0.05 },
      rest: { stand: [20, 60], lie: [60, 180], lies: 0.25, acts: 0.4 }
    },
    {
      name: "parasaurolophus",
      source: { file: "parasaurolophus.glb", faces: "+z", clips: { walk: "Parasaurolophus_Walk", run: "Parasaurolophus_Run", idle: "Parasaurolophus_Idle", attack: "Parasaurolophus_Attack", jump: "Parasaurolophus_Jump", death: "Parasaurolophus_Death" } },
      metres: { length: 9.5 },
      triangles: 440,
      legs: 2,
      group: [3, 8],
      territory: 150,
      pace: 2,
      run: { pace: 6, share: 0.15 },
      rest: { stand: [15, 45], lie: [60, 180], lies: 0.25, acts: 0.4 }
    },
    {
      name: "velociraptor",
      source: { file: "velociraptor.glb", faces: "+z", clips: { walk: "Velociraptor_Walk", run: "Velociraptor_Run", idle: "Velociraptor_Idle", attack: "Velociraptor_Attack", jump: "Velociraptor_Jump", death: "Velociraptor_Death" } },
      metres: { length: 2 },
      triangles: 440,
      legs: 2,
      group: [3, 6],
      territory: 120,
      pace: 0.8,
      run: { pace: 3, share: 0.25 },
      rest: { stand: [8, 25], lie: [60, 180], lies: 0.25, acts: 0.4 }
    }
  ];
});

// src/fauna/record.js
var homeOf = (at) => at.map((v) => Math.round(v * 1000) / 1000), countOf2 = (species, count) => Math.min(Math.max(Math.round(count), species.group[0]), species.group[1]), PEN = 5, territoryOf = (species, metres2) => Math.min(Math.max(Math.round(metres2), PEN), species.territory);
var init_record2 = __esm(() => {
  init_species2();
});

// src/build/behaviours.js
var TIME, STAY2, TRIGGER, REACH5, along2 = (axis, fallback, what) => ({ name: axis, label: `Along ${axis}`, min: -64, max: 64, default: fallback, step: 0.05, unit: "m", description: `How far it ${what} along its own ${axis} (m).` }), HIGHEST = 1e5, BEHAVIOURS, SPACE, SPACE_PARAMS, MOVE_DEFAULTS, paths, timelines, airs, drawnPlaces, coasts, joins, seats;
var init_behaviours = __esm(async () => {
  init_survey();
  init_terrain_height();
  await __promiseAll([
    init_kinds(),
    init_vehicles()
  ]);
  TIME = { name: "time", label: "Time", min: 0.2, max: 5, default: 1, step: 0.1, unit: "s", description: "How long it takes to open, and to shut (s)." };
  STAY2 = { name: "stay", label: "Stays open", min: 0, max: 60, default: 5, step: 0.5, unit: "s", description: "How long it stays open after a click before it shuts by itself (s); 0, until clicked again." };
  TRIGGER = { name: "trigger", label: "Opens on", min: 0, max: 2, default: 0, step: 1, options: ["click", "near", "both"], description: "What opens it: a click; someone coming near — it shuts once they have all gone; or either." };
  REACH5 = { name: "reach", label: "Near", min: 0.5, max: 10, default: 2.5, step: 0.5, unit: "m", description: "How near someone comes before it opens by itself (m)." };
  BEHAVIOURS = Object.freeze({
    spin: {
      label: "Turns",
      description: "Turns round its own up (z) without stopping: a carousel, a fan, a sign.",
      params: [{ name: "speed", label: "Speed", min: -360, max: 360, default: 30, step: 1, unit: "°/s", description: "How fast it turns, in degrees a second; below 0, the other way." }]
    },
    bounce: {
      label: "Bounces",
      description: "Hops up along its own up (z) and falls back without stopping, as a ball does: as high as it is asked, as fast as gravity brings it down.",
      params: [{ name: "height", label: "Height", min: 0.05, max: 20, default: 1, step: 0.05, unit: "m", description: "How high it hops (m): the higher, the longer each hop, as a ball's." }]
    },
    move: {
      label: "Goes and comes back",
      description: "Goes from where it is to a point and back, waiting at either end: an elevator, a moving platform.",
      params: [
        along2("x", 0, "goes"),
        along2("y", 0, "goes"),
        { ...along2("z", 3, "goes"), max: HIGHEST, wide: true, description: "How far it goes along its own z (m), up to 100 km." },
        { name: "speed", label: "Speed", min: 0.1, max: 20, default: 1, step: 0.1, unit: "m/s", description: "How fast it goes (m/s): smoothly, on average over its way; accelerating, at its fastest." },
        { name: "ease", label: "Starts and stops", min: 0, max: 1, default: 0, step: 1, options: ["smooth", "accel"], labels: ["Smoothly", "Accelerating"], description: "Smoothly, easing in and out over its whole way, as ever; or accelerating: speeding up and slowing down as fast as Speeds up and Slows down say, on at its speed between." },
        { name: "accel", label: "Speeds up", min: 0.01, max: 20, default: 1, step: 0.01, unit: "m/s²", wide: true, when: ({ ease }) => ease === 1, description: "How fast it speeds up as it sets off from either end (m/s²), accelerating." },
        { name: "decel", label: "Slows down", min: 0.01, max: 20, default: 1, step: 0.01, unit: "m/s²", wide: true, when: ({ ease }) => ease === 1, description: "How fast it slows down as it comes to either end (m/s²), accelerating." },
        { name: "wait", label: "Waits", min: 0, max: 60, default: 2, step: 0.5, unit: "s", description: "How long it waits at either end (s)." }
      ],
      stretches: {
        accel: { name: "first", label: "Over the first", min: 0, max: HIGHEST, step: 0.05, unit: "m", wide: true, description: "How far it goes speeding up, from either end, till it is at its speed (m): Speeds up follows it." },
        decel: { name: "last", label: "Over the last", min: 0, max: HIGHEST, step: 0.05, unit: "m", wide: true, description: "How far from either end it starts slowing down (m): Slows down follows it." }
      },
      since: { name: "since", unit: "ms", description: "When it last set off from where it is kept, in the epoch's ms: set as something calls it down (`call`); 0, as if at the epoch." }
    },
    call: {
      label: "Calls down",
      description: "On a click, brings what goes and comes back near it — a platform, a lift — down to where it is kept at once, to set off again from there; a lift near it, to its stop nearest the button: a call button.",
      touch: true,
      params: [{ name: "reach", label: "Reaches", min: 0.5, max: 64, default: 8, step: 0.5, unit: "m", description: "How near it what it calls down is kept (m)." }]
    },
    lift: {
      label: "Lift",
      description: "Goes from stop to stop up and down its frame — a part up and down its object's, a thing of its own its own — on a click on it or on a call button by a stop, and waits at each till it is called again: a platform lift, an elevator. The parts of an object whose lift has the same group go as one: a platform, its rails, its buttons.",
      touch: true,
      params: [
        { name: "speed", label: "Speed", min: 0.1, max: 6, default: 0.8, step: 0.1, unit: "m/s", description: "How fast it goes between its stops (m/s), speeding up and slowing down at either as an elevator does." },
        { name: "button", label: "A click on it", min: 0, max: 2, default: 1, step: 1, options: ["none", "next", "stop"], labels: ["Does nothing", "Next stop", "To a stop"], description: "What a click on it does: nothing — its floor, its rails —; sends it on to its next stop, back the other way from either end — one button that takes it down and up —; or to one stop — a button a floor." },
        { name: "stop", label: "Its stop", min: 0, max: 8, default: 0, step: 1, when: ({ button }) => button === 2, description: "Where a click on it sends it: 0 where it is kept, 1 its first stop, 2 its second…" }
      ],
      stops: { name: "stops", most: 8, reach: 1000, step: 0.01, unit: "m", description: "Where it stops besides where it is kept: how far up its frame from there (m; below 0, down), a floor each, in order." },
      group: { name: "group", description: "The parts of its object whose lift has the same group go as one, wherever any of them is clicked: a platform, its rails, its buttons." },
      trip: { name: "trip", description: "Its last way: from stop `from` to stop `to` (0 where it is kept), set off at `since` (the epoch's ms) from `start` m up its frame, by the `stops` and `speed` of the part that set it off — the same for all its group, so that they never come apart — written as it is called, so that whoever comes later finds it where it went." }
    },
    switch: {
      label: "Light switch",
      description: "Switches its object's lights in its zones, for everyone: on a click, on or off — one by a room's door, one for a whole floor, one for every light of it — or, a presence detector, on while someone is near and off once all have gone. Lights on at night still come on and go off by themselves; switched by hand, they stay as they were left till the next nightfall or daybreak; by presence, each lights as far as its own light lets it (On, or At night only).",
      touch: true,
      prim: true,
      params: [
        { ...TRIGGER, label: "Switched by", description: "What switches its lights: a click, on or off; someone coming near — a presence detector: on while anyone is near, off once all have gone — or either." },
        { ...REACH5, default: 4, when: ({ trigger }) => trigger >= 1, description: "How far across under it it senses someone (m): standing on its own floor, up to 3.5 m under it." },
        { name: "stay", label: "Stays on", min: 0, max: 600, default: 30, step: 1, unit: "s", when: ({ trigger }) => trigger >= 1, description: "How long its lights stay on once everyone near has gone (s)." }
      ],
      zones: { name: "zones", most: 16, description: "Which of its object's lights it switches: those whose light's `zone` is one of these names (a room's, a floor's), or 'all' — every light of its object in a zone." },
      since: { name: "since", unit: "ms", description: "When it was last switched, in the epoch's ms — kept, with how it left its lights (`on`), by a page that may change it, so that whoever comes later finds them so; 0, never." },
      lit: { name: "on", description: "How it last left its lights, with `since`: true on, false off." }
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
        REACH5,
        TIME,
        STAY2
      ]
    },
    slide: {
      label: "Slides",
      description: "Slides aside on a click or as someone comes near, and back by itself: a sliding door, a window, a hatch.",
      touch: true,
      params: [along2("x", 1, "slides"), along2("y", 0, "slides"), along2("z", 0, "slides"), TRIGGER, REACH5, TIME, STAY2]
    },
    belt: {
      label: "Conveyor",
      description: "Carries whoever stands on it along its own y: an escalator (stairs rise along their y), a moving walkway.",
      params: [{ name: "speed", label: "Speed", min: -5, max: 5, default: 0.5, step: 0.05, unit: "m/s", description: "How fast it carries (m/s); below 0, the other way." }]
    },
    passage: {
      label: "Goes through",
      description: "A click on it, or E, takes whoever aims at it in or out, standing: from outside its object to its place inside (x, y, z of its object) — into a vehicle by a click on its hull —, from inside out across its thinnest side, past it, onto what is there — out of it by its door. Inside its object is within the box round its solid parts' middles.",
      params: [
        { name: "way", label: "Goes", min: 0, max: 2, default: 0, step: 1, options: ["both", "in", "out"], labels: ["In and out", "In only", "Out only"], description: "In from outside its object and out from inside it; only in; or only out." },
        ...[["x", 0, "across it"], ["y", 0, "along it"], ["z", 1, "up it: on its floor"]].map(([name, fallback, what]) => ({ name, label: `In at ${name}`, min: -64, max: 64, default: fallback, step: 0.05, unit: "m", description: `Where in its object one stands going in, ${what} (m).` })),
        { name: "depth", label: "Out past it", min: 0.3, max: 5, default: 1, step: 0.1, unit: "m", description: "How far past it one stands going out, across its thinnest side (m)." }
      ]
    },
    route: {
      label: "Follows a route",
      description: "Goes from where it is through its points, round and on again or to the last and back, stopping a while if asked — at each point, or only at its ends: a boat on a tour that comes back to port, a train on its line with its station, a ship on its autopilot. Held, it waits where it was left until it is run again, and then comes back onto it from there. Run once, it goes round or there and back once and stays where it is kept.",
      params: [
        { name: "speed", label: "Speed", min: 0.1, max: 120, default: 3, step: 0.1, unit: "m/s", description: "How fast it goes (m/s); where it stops, it slows down and speeds up again as Speeds up says." },
        { name: "accel", label: "Speeds up", min: 0.1, max: 10, default: 1, step: 0.1, unit: "m/s²", description: "How fast it speeds up from a stop and slows down into one (m/s²): 1 a boat or a train; a plane, its take-off run and its landing." },
        { name: "stop", label: "Stops", min: 0, max: 120, default: 0, step: 0.5, unit: "s", description: "How long it stops (s), where Stops at says: a port, a station; 0, it goes on through them all." },
        { name: "at", label: "Stops at", min: 0, max: 1, default: 0, step: 1, options: ["each", "ends"], labels: ["Every point", "Its ends"], description: "Where it stops, as long as Stops says: at every point; or only where it is kept — its station, its port — and, going there and back, at its last point too." },
        { name: "mode", label: "Goes", min: 0, max: 1, default: 0, step: 1, options: ["round", "back"], description: "Round its points and on again, or to the last and back the way it came." },
        { name: "face", label: "Faces its way", min: 0, max: 1, default: 1, step: 1, options: ["no", "yes"], description: "Whether it turns to where it goes, as a boat or a train does." },
        { name: "water", label: "On the water", min: 0, max: 1, default: 0, step: 1, options: ["no", "yes"], description: "Whether it keeps its height over the sea wherever its points are: a boat." }
      ],
      points: { name: "points", max: 64, reach: 1e4, step: 0.01, description: "Where it goes, in its own frame (m): from where it is kept through each point in turn, [x, y, z] — or [x, y, z, hx, hy, hz], gone through along its handle (hx, hy, hz): leaving towards its tip, coming in from the other side; [x, y, z, 0, 0, 0] a corner, where it slows to a stop and turns." },
      since: { name: "since", unit: "ms", description: "When it set off from where it is kept, in the epoch's ms: set as it is chosen or changed on the card; 0, as if at the epoch." },
      held: { name: "held", description: "Not run: held where it was left, planet-centred `{ at, rotation }` — slowing to a stop along its way from `going` m/s at `since` (the epoch's ms) if it was under way; `true`, held where it is kept. A ship's autopilot off, or its driver gone." },
      join: { name: "join", description: "Coming back onto its route: from planet-centred `{ at, rotation }`, set off at `since`, on a curve into where its route has it at `until` (the epoch's ms) — its `since` set so that it is there then." },
      once: { name: "once", description: "Run once: round, or there and back, once from `since` — then where it is kept, as it set off, and still. A ship's Auto: one tour, and back in port." },
      name: { name: "name", description: "What its route is called among its routes (1–32 characters); none, Route 1." },
      routes: { name: "routes", most: 7, description: "Its other routes, kept to be run instead — `{ name, points, speed, stop, at, mode, face, water }` each, as its own are: one recorded by its driver, or chosen at its helm or on its card, takes this one's place and keeps it among them." }
    }
  });
  SPACE = Object.freeze({ speed: 2000, accel: 30, highest: HIGHEST, across: 1e6 });
  SPACE_PARAMS = Object.freeze(BEHAVIOURS.route.params.map((param) => param.name === "speed" ? { ...param, max: SPACE.speed, wide: true, description: "How fast it goes (m/s), up to 2,000 on a trip to space; where it stops, it slows down and speeds up again as Speeds up says." } : param.name === "accel" ? { ...param, max: SPACE.accel, wide: true, description: "How fast it speeds up from a stop and slows down into one (m/s²), up to 30 — a rocket's 3 g — on a trip to space." } : param));
  MOVE_DEFAULTS = Object.fromEntries(BEHAVIOURS.move.params.map((param) => [param.name, param.default]));
  paths = new WeakMap;
  timelines = new WeakMap;
  airs = new WeakMap;
  drawnPlaces = new WeakMap;
  coasts = new WeakMap;
  joins = new WeakMap;
  seats = new WeakMap;
});

// src/physics/colliders.js
var CUBE, CYLINDER, SPHERE, normals, convexity;
var init_colliders = __esm(async () => {
  init_params();
  await init_kinds();
  CUBE = PRESETS.cube.shape.join(",");
  CYLINDER = PRESETS.cylinder.shape.join(",");
  SPHERE = PRESETS.sphere.shape.join(",");
  normals = new Map;
  convexity = new Map;
});

// src/build/vehicles.js
var MASS, CAR_GRIP = 2, GRIP, DRIVE, BRAKE, SUSPENSION, TRAVEL, STEERING, VEHICLES, TILT, PLANE_TILT, vehicleType = (name) => typeof name === "string" && Object.hasOwn(VEHICLES, name) ? VEHICLES[name] : null, decimals2 = (step) => Math.max(0, Math.ceil(-Math.log10(step) - 0.000000001)), held2 = (param, value) => {
  if (param.options)
    return param.options.includes(value) ? value : param.default;
  if (!Number.isFinite(value))
    return param.default;
  const within4 = Math.min(Math.max(value, param.min), param.max);
  return Number(Math.min(param.min + Math.round((within4 - param.min) / param.step) * param.step, param.max).toFixed(decimals2(param.step)));
}, vehicleOf = (value) => {
  const kind = vehicleType(value?.type);
  return kind && { type: value.type, ...Object.fromEntries(kind.params.flatMap((param) => param.optional && value[param.name] === undefined ? [] : [[param.name, held2(param, value[param.name])]])) };
};
var init_vehicles = __esm(async () => {
  await __promiseAll([
    init_behaviours(),
    init_colliders()
  ]);
  MASS = { name: "mass", label: "Mass", min: 50, max: 5000, default: 1000, step: 10, unit: "kg", description: "How heavy it is (kg): heavier, it speeds up and stops more slowly." };
  GRIP = { name: "grip", label: "Grip", min: 0.4, max: 3, default: CAR_GRIP, step: 0.05, unit: "×", optional: true, description: "How hard its tyres hold the ground (×): 2 as dry asphalt; more, it turns where its front wheels point at more speed before it slides; less, it slides sooner (0.4 on ice)." };
  DRIVE = { name: "drive", label: "Drive", options: ["all", "front", "rear"], default: "all", optional: true, description: "Which wheels its engine turns: all of them, its front ones (it runs wide at the limit) or its back ones (its tail may step out)." };
  BRAKE = { name: "brake", label: "Brakes", min: 0.25, max: 3, default: 1, step: 0.05, unit: "×", optional: true, description: "How hard it brakes (×): 1 holds each wheel with 1,500 N·m; a heavy one wants more, or it takes long to stop." };
  SUSPENSION = { name: "suspension", label: "Suspension", min: 0.8, max: 4, default: 1.5, step: 0.1, unit: "Hz", optional: true, description: "How stiff its springs are (Hz): low, soft and swaying over bumps, a monster truck's; high, firm and flat in a turn, a sports car's." };
  TRAVEL = { name: "travel", label: "Travel", min: 0.1, max: 1, default: 0.3, step: 0.05, unit: "m", optional: true, description: "How far its wheels go up and down (m): long for rough ground and jumps, short for a low car." };
  STEERING = { name: "steering", label: "Steering", options: ["front", "rear", "all"], default: "front", optional: true, description: "Which wheels steer: its front ones; its back ones, as a forklift's; or all, its back ones the other way, turning half as wide." };
  VEHICLES = Object.freeze({
    car: {
      label: "Car",
      auto: true,
      description: "Driven on its wheels — its cylinders lying across it — the front ones steering: W and S throttle and brake, A and D steer, Space the hand brake.",
      params: [
        { name: "power", label: "Power", min: 50, max: 3000, default: 500, step: 10, unit: "N·m", description: "Its engine's torque (N·m): more, it speeds up faster and climbs steeper." },
        { name: "speed", label: "Top speed", min: 2, max: 60, default: 25, step: 1, unit: "m/s", description: "As fast as it goes (m/s)." },
        { name: "steer", label: "Steers", min: 5, max: 45, default: 30, step: 1, unit: "°", description: "How far its front wheels turn (°)." },
        MASS,
        GRIP,
        DRIVE,
        BRAKE,
        SUSPENSION,
        TRAVEL,
        STEERING
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
    bicycle: {
      label: "Bicycle",
      description: "Ridden on its two wheels as a motorbike is, leaning into its turns, and pedalled: W pedals, S brakes, A and D steer. A cylinder lying across it between its wheels is its crank: it turns, and what lies within it — its arms, its pedals —, as its rider pedals (the seat's pose Pedalling), Gear times slower than its back wheel.",
      params: [
        { name: "power", label: "Pedals", min: 5, max: 200, default: 45, step: 1, unit: "N·m", description: "How hard its rider pushes on its back wheel (N·m)." },
        { name: "speed", label: "Top speed", min: 1, max: 20, default: 8, step: 0.5, unit: "m/s", description: "As fast as it is pedalled (m/s)." },
        { name: "steer", label: "Steers", min: 5, max: 45, default: 8, step: 1, unit: "°", description: "How far its front wheel turns (°)." },
        { ...MASS, default: 90, description: "How heavy it is with its rider (kg)." },
        { name: "gear", label: "Gear", min: 1, max: 5, default: 2.8, step: 0.1, unit: "", description: "How many turns its back wheel makes for each of its pedals: higher, its rider pedals more slowly for the same speed." }
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
    },
    ship: {
      label: "Ship or yacht",
      auto: true,
      description: "Afloat at its waterline — its frame's z = 0, as it was built to float, whatever its decks carry — and as heavy as the water it moves: slow to get going and to stop, turning wide on its rudder as it goes and slowly on its bow thrusters when it does not, never skidding sideways. W and S ahead and astern, A and D the helm.",
      params: [
        { name: "speed", label: "Top speed", min: 1, max: 25, default: 10, step: 0.5, unit: "m/s", description: "As fast as it goes ahead (m/s); astern, at most 70 % of it." },
        { name: "accel", label: "Speeds up", min: 0.05, max: 3, default: 0.5, step: 0.05, unit: "m/s²", description: "How fast it gets going from a standstill at full ahead (m/s²): a heavy ship slowly." },
        { name: "turn", label: "Turns", min: 1, max: 30, default: 6, step: 0.5, unit: "°/s", description: "How fast it comes round at full helm once it is under way (°/s)." },
        { name: "thrusters", label: "Bow thrusters", min: 0, max: 10, default: 2, step: 0.5, unit: "°/s", description: "How fast it turns on the spot, standing still (°/s): 0 for none." }
      ]
    },
    submarine: {
      label: "Submarine",
      auto: true,
      description: "A ship that dives: at the surface afloat with its hull's top level with the water — all that is inside it under the water and dry, wherever its frame is —, and under it down to the depth its driver takes it, held there and level, never through the sea's floor. W and S ahead and astern, A and D the helm, Space up and C down.",
      params: [
        { name: "speed", label: "Top speed", min: 1, max: 25, default: 6, step: 0.5, unit: "m/s", description: "As fast as it goes ahead (m/s); astern, at most 70 % of it." },
        { name: "accel", label: "Speeds up", min: 0.05, max: 3, default: 0.6, step: 0.05, unit: "m/s²", description: "How fast it gets going from a standstill at full ahead (m/s²)." },
        { name: "turn", label: "Turns", min: 1, max: 30, default: 8, step: 0.5, unit: "°/s", description: "How fast it comes round at full helm once it is under way (°/s)." },
        { name: "thrusters", label: "Thrusters", min: 0, max: 10, default: 3, step: 0.5, unit: "°/s", description: "How fast it turns on the spot, standing still (°/s): 0 for none." },
        { name: "dive", label: "Dives", min: 0.2, max: 5, default: 1, step: 0.1, unit: "m/s", description: "How fast it goes down on C and up on Space (m/s)." },
        { name: "depth", label: "Deepest", min: 2, max: 500, default: 60, step: 1, unit: "m", description: "As deep as its waterline goes under the surface (m)." }
      ]
    },
    helicopter: {
      label: "Helicopter",
      auto: true,
      description: "Flies on its rotors: Space takes it up and C down, and between them it holds its height, never into the ground nor over its ceiling; once off the ground W and S fly it ahead and back, its nose down as it goes, and A and D turn it, on the spot or banking as it goes. On the ground it rests on what it stands on — land, a roof, the sea. Its parts that turn (Does: turns) are its rotors: they turn while it runs, driven or on its Auto, and stand still once it is parked. Up from its controls in the air, it lands first.",
      params: [
        { name: "speed", label: "Top speed", min: 2, max: 80, default: 25, step: 1, unit: "m/s", description: "As fast as it flies ahead (m/s); back, a third of it." },
        { name: "accel", label: "Speeds up", min: 0.5, max: 10, default: 3, step: 0.5, unit: "m/s²", description: "How fast it gets going, and stops again once let go (m/s²)." },
        { name: "turn", label: "Turns", min: 5, max: 120, default: 45, step: 1, unit: "°/s", description: "How fast it turns round (°/s)." },
        { name: "climb", label: "Climbs", min: 0.5, max: 20, default: 5, step: 0.5, unit: "m/s", description: "How fast it goes up on Space and down on C (m/s)." },
        { name: "ceiling", label: "Highest", min: 10, max: 3000, default: 500, step: 10, unit: "m", description: "As high as it goes over the ground under it (m)." }
      ]
    },
    plane: {
      label: "Plane",
      auto: true,
      description: "Flies on its wings. On its wheels W speeds it up along its way, S or C brake it, A and D steer it; once as fast as its take-off speed, Space lifts it off. In the air W and S speed it up and slow it down, Space takes it up and C down, and between them it holds its height, never into the ground nor over its ceiling; slower than its take-off speed it sinks; A and D turn it, banking. Back on its wheels it rolls on. On its Auto it flies its route by itself: along its runway, off it, round and down again.",
      params: [
        { name: "speed", label: "Top speed", min: 20, max: 300, default: 80, step: 1, unit: "m/s", description: "As fast as it flies (m/s)." },
        { name: "accel", label: "Speeds up", min: 0.5, max: 15, default: 4, step: 0.5, unit: "m/s²", description: "How fast it gets going, along the ground and in the air (m/s²); it brakes three times as hard." },
        { name: "lift", label: "Take-off speed", min: 10, max: 120, default: 40, step: 1, unit: "m/s", description: "How fast it must go along the ground to lift off; slower in the air, it sinks (m/s)." },
        { name: "turn", label: "Turns", min: 3, max: 60, default: 15, step: 1, unit: "°/s", description: "How fast it turns at full A or D, banked in the air (°/s)." },
        { name: "climb", label: "Climbs", min: 1, max: 50, default: 10, step: 0.5, unit: "m/s", description: "How fast it goes up on Space and down on C (m/s)." },
        { name: "ceiling", label: "Highest", min: 100, max: 15000, default: 3000, step: 50, unit: "m", description: "As high as it goes over the ground under it (m)." }
      ]
    },
    starship: {
      label: "Starship",
      auto: true,
      space: true,
      description: "Flies by hand as a helicopter does — on its feet, Space up and C down, W and S ahead and back, A and D turning it — never over its ceiling; on its Auto it goes its trip: up from where it is kept, out of the sky into space, across the planet and back the same way down onto it, as its route says. At its controls, O sets its trip going with whoever sits there aboard; up from its seat on its trip, one stays seated till it is back.",
      params: [
        { name: "speed", label: "Top speed", min: 2, max: 120, default: 60, step: 1, unit: "m/s", description: "As fast as it flies by hand (m/s); back, a third of it. On its trip, its route's Speed." },
        { name: "accel", label: "Speeds up", min: 0.5, max: 15, default: 6, step: 0.5, unit: "m/s²", description: "How fast it gets going by hand, and stops again once let go (m/s²)." },
        { name: "turn", label: "Turns", min: 5, max: 120, default: 60, step: 1, unit: "°/s", description: "How fast it turns round (°/s)." },
        { name: "climb", label: "Climbs", min: 0.5, max: 30, default: 10, step: 0.5, unit: "m/s", description: "How fast it goes up on Space and down on C, by hand (m/s)." },
        { name: "ceiling", label: "Highest", min: 10, max: 3000, default: 500, step: 10, unit: "m", description: "As high as it flies by hand over the ground under it (m); its trip takes it higher." }
      ]
    }
  });
  TILT = Object.freeze({ pitch: 10, surge: 5, bank: 25, attitude: 3 });
  PLANE_TILT = Object.freeze({ pitch: 20, bank: 35 });
});

// src/build/looks.js
var SLOTS, FINISHES, MATERIAL, lookValue = (value) => {
  if (Array.isArray(value) && value.length === 3 && value.every(Number.isFinite))
    return value.map((v) => Math.min(Math.max(v, 0), 1));
  return typeof value === "string" && value.length <= 96 && MATERIAL.test(value) ? value : null;
}, looksOf = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return null;
  const kept2 = SLOTS.flatMap((slot) => {
    const look2 = lookValue(value[slot]);
    return look2 === null ? [] : [[slot, look2]];
  });
  if (typeof value.finish === "string" && Object.hasOwn(FINISHES, value.finish))
    kept2.push(["finish", value.finish]);
  return kept2.length ? Object.fromEntries(kept2) : null;
};
var init_looks = __esm(() => {
  SLOTS = ["paint", "roof", "accent", "interior", "carpet", "rims"];
  FINISHES = { gloss: { gloss: 0.9, metal: 0.5, reflect: 0.3 }, satin: { gloss: 0.25, metal: 0.3, reflect: 0.1 }, matte: { gloss: 0.05, metal: 0, reflect: 0 } };
  MATERIAL = /^[a-z0-9-]+\/[a-z0-9-]+\/[a-z0-9-]+$/;
});

// src/build/seat.js
var POSES, POSE, REACH6 = 64, MOST_PLACES = 64, DEG4, wrapTurn = (degrees) => {
  const turn3 = (degrees % 360 + 360) % 360;
  return turn3 > 180 ? turn3 - 360 : turn3;
}, heldTarget = ({ at, turn: turn3 = 0 }) => ({
  at: at.map((v) => Math.round(Math.min(Math.max(v, -REACH6), REACH6) * 1000) / 1000 || 0),
  turn: Math.round(wrapTurn(turn3) * 10) / 10 || 0
}), seatWith = (target, pose) => target || pose ? { ...target, ...pose && { pose } } : true, seatOf2 = (value) => {
  const seat = value?.seat;
  if (seat === true)
    return { seat: true };
  if (!seat || typeof seat !== "object")
    return {};
  const { at, turn: turn3 = 0, pose } = seat;
  const target = Array.isArray(at) && at.length === 3 && at.every(Number.isFinite) && Number.isFinite(turn3) ? heldTarget({ at, turn: turn3 }) : null;
  const places = target && Array.isArray(seat.places) ? seat.places.filter((place) => Array.isArray(place) && place.length === 3 && place.every(Number.isFinite)).slice(0, MOST_PLACES).map((place) => heldTarget({ at: place }).at) : [];
  const kept2 = seatWith(target, POSE.has(pose) ? pose : null);
  return { seat: places.length ? { ...kept2, places } : kept2 };
};
var init_seat = __esm(() => {
  POSES = [
    { clip: "dcl/sitting-chair-1", name: "On a chair", rests: "hips" },
    { clip: "dcl/sitting-chair-2", name: "Leaning back", rests: "hips" },
    { clip: "quaternius/sitting-talking", name: "Talking", rests: "hips" },
    { clip: "quaternius/driving", name: "At the wheel", rests: "hips" },
    { clip: "ovgrid/pedalling", name: "Pedalling", rests: "hips" },
    { clip: "dcl/sitting-ground-1", name: "On the ground", rests: "feet" },
    { clip: "dcl/sitting-ground-2", name: "Cross-legged", rests: "feet" },
    { clip: "quaternius/kneeling", name: "Kneeling", rests: "feet" },
    { clip: "quaternius/crouch-idle", name: "Crouching", rests: "feet" },
    { clip: "quaternius/idle", name: "Standing", rests: "feet" },
    { clip: "quaternius/dance", name: "Dancing", rests: "feet" },
    { clip: "mixamo/swing-dancing", name: "Swing dancing", rests: "feet" },
    { clip: "ovgrid/lying", name: "Lying down", rests: "feet", act: "Lie down" }
  ];
  POSE = new Map(POSES.map((pose) => [pose.clip, pose]));
  DEG4 = Math.PI / 180;
});

// src/build/bouncy.js
var BOUNCY, decimals3 = (step) => Math.max(0, Math.ceil(-Math.log10(step) - 0.000000001)), held3 = (param, value) => {
  const given = typeof value === "string" && param.options ? param.options.indexOf(value) : value;
  if (!Number.isFinite(given) || param.options && given < 0)
    return param.default;
  const within4 = Math.min(Math.max(given, param.min), param.max);
  return Number(Math.min(param.min + Math.round((within4 - param.min) / param.step) * param.step, param.max).toFixed(decimals3(param.step)));
}, bouncyOf = (value) => {
  const given = value === true ? {} : value && typeof value === "object" && !Array.isArray(value) ? value : null;
  return given && Object.fromEntries(BOUNCY.params.map((param) => [param.name, held3(param, given[param.name])]));
};
var init_bouncy = __esm(() => {
  BOUNCY = Object.freeze({
    params: [
      { name: "trigger", label: "Bouncy", min: 0, max: 1, default: 0, step: 1, options: ["landing", "step"], labels: ["When landed on", "When stepped on"], description: "What throws whoever is on it back up: landing on it from a jump or a fall, as on a trampoline; or stepping on it at all, as on a jump pad." },
      { name: "height", label: "Height", min: 0.5, max: 30, default: 3, step: 0.5, unit: "m", description: "How high it throws them at most (m); stepped on, this high every time." },
      { name: "give", label: "Gives back", min: 0, max: 100, default: 80, step: 5, unit: "%", when: ({ trigger }) => trigger === 0, description: "Of how hard they land on it, how much it gives back (%): 100, as high each time, on and on; less, lower each time, till they land." },
      { name: "along", label: "Throws", min: 0, max: 1, default: 0, step: 1, options: ["up", "own"], labels: ["Straight up", "Along its own up"], description: "Which way it throws them: straight up; or along its own up (z), so that tilted it throws them across, a launch pad." }
    ]
  });
});

// src/build/mirror-kind.js
var MIRROR_PARAMS, MIRROR_DEFAULTS;
var init_mirror_kind = __esm(() => {
  MIRROR_PARAMS = Object.freeze([
    {
      name: "reflects",
      label: "Reflects",
      options: ["near", "avatars"],
      labels: ["Avatars and what is near", "Avatars alone"],
      default: "near",
      description: "What it shows drawn as a mirror does: the avatars and what is built within 5 m before it, or the avatars alone — the room behind them from the surroundings as metal shows them."
    },
    {
      name: "on",
      label: "Comes on",
      options: ["near", "click", "aim"],
      labels: ["When one is near", "On a click", "Aimed at"],
      default: "near",
      description: "When it shows what stands before it: by itself while one is near it and it is in view; switched by a click on it; or, aimed at within reach as a vehicle is, by E or a click. Off, it mirrors the surroundings as metal does. Each viewer for themself."
    },
    {
      name: "radius",
      label: "Near",
      min: 2,
      max: 30,
      default: 6,
      step: 1,
      unit: "m",
      description: "How near one stands to it for it to come on by itself (m)."
    }
  ]);
  MIRROR_DEFAULTS = Object.freeze(Object.fromEntries(MIRROR_PARAMS.map((param) => [param.name, param.default])));
});

// src/build/live.js
var WHO, WHO_PARAM, LIVE, liveOf = (value) => {
  const kind = LIVE[value?.type];
  if (!kind || !Object.hasOwn(LIVE, value.type))
    return null;
  const live = { type: value.type };
  for (const param of kind.params) {
    const given = value[param.name];
    if (param.options)
      live[param.name] = param.options.includes(given) ? given : param.default;
    else
      live[param.name] = Number.isFinite(given) ? Math.min(Math.max(Math.round(given / param.step) * param.step, param.min), param.max) : param.default;
  }
  return live;
}, liveUrl = (id) => `live:${id}`, LIVE_URL, isLiveUrl = (url) => typeof url === "string" && LIVE_URL.test(url), MIRROR_TEXTURE, withoutLive = (surface) => {
  if (!surface)
    return null;
  const { media, faces, ...rest } = structuredClone(surface);
  const out = { ...rest, ...media && !isLiveUrl(media.url) && { media } };
  if (faces) {
    out.faces = Object.fromEntries(Object.entries(faces).map(([face2, own]) => {
      const { media: ownMedia, mirror, ...lay } = own;
      if (mirror && MIRROR_TEXTURE.test(lay.texture ?? ""))
        delete lay.texture;
      return [face2, { ...lay, ...ownMedia && !isLiveUrl(ownMedia.url) && { media: ownMedia } }];
    }).filter(([, own]) => Object.keys(own).length));
    if (!Object.keys(out.faces).length)
      delete out.faces;
  }
  return Object.keys(out).length ? out : null;
}, surfaceWithLive = (surface, id, live) => {
  const plain = withoutLive(surface);
  if (live?.type !== "screen" && live?.type !== "mirror")
    return plain;
  const out = plain ?? {};
  const own = out.faces?.[live.face];
  out.faces = {
    ...out.faces,
    [live.face]: live.type === "screen" ? { ...own, media: { url: liveUrl(id), autoplay: true } } : { ...own, texture: `effects/mirror/${live.look}`, mirror: { reflects: live.reflects, on: live.on, radius: live.radius } }
  };
  return out;
};
var init_live = __esm(() => {
  init_mirror_kind();
  WHO = Object.freeze(["anyone", "owner"]);
  WHO_PARAM = { name: "who", label: "On air", options: WHO, labels: ["Anyone near", "Its owner"], default: "anyone", description: "Who may go on air in it: anyone within its radius, or the prim's owner alone." };
  LIVE = Object.freeze({
    voice: {
      label: "Voice zone",
      description: "Whoever stands within its radius hears the others in it, each from where they stand, fainter farther; on air with the microphone button. Leaving it hangs up.",
      params: [
        WHO_PARAM,
        { name: "radius", label: "Radius", min: 2, max: 60, default: 12, step: 1, unit: "m", description: "How far from the prim one is in the zone (m)." },
        { name: "quality", label: "Quality", min: 16, max: 128, default: 32, step: 8, unit: "kb/s", description: "Each voice's bitrate (kb/s): more, clearer and costlier." }
      ]
    },
    screen: {
      label: "Screen",
      description: "One of its faces shows a camera or a screen shared by whoever is on air, to everyone within its radius, lit by it as a video face is. Viewing only.",
      params: [
        WHO_PARAM,
        { name: "radius", label: "Radius", min: 5, max: 60, default: 30, step: 1, unit: "m", description: "How far from the prim it is watched (m)." },
        { name: "quality", label: "Quality", min: 240, max: 1080, default: 720, step: 120, unit: "px", description: "The tallest picture sent (px): more, sharper and costlier." },
        { name: "fps", label: "Frame rate", min: 5, max: 30, default: 15, step: 1, unit: "fps", description: "Frames sent a second." },
        { name: "face", label: "Face", min: 0, max: 8, default: 0, step: 1, unit: "", description: "Which of its faces shows it." }
      ]
    },
    mirror: {
      label: "Mirror",
      description: "One of its faces is a mirror: whoever stands before it sees themself in it, and what is built near — when one is near, on a click, or aimed at. Nothing goes on the wire.",
      params: [
        ...MIRROR_PARAMS,
        { name: "face", label: "Face", min: 0, max: 8, default: 3, step: 1, unit: "", description: "Which of its faces is the mirror." },
        { name: "look", label: "Look", options: ["silvered", "antique"], labels: ["Silvered", "Antique"], default: "silvered", description: "The bank's mirror its face wears: silvered, or antique, foxed and hazed." }
      ]
    },
    drop: {
      label: "File drop",
      description: "A file dropped on it reaches whoever is within its radius — or its owner alone —, peer to peer, with its progress; each one keeps it with a click.",
      params: [
        { ...WHO_PARAM, label: "Sends", description: "Who may drop a file on it: anyone near, or its owner alone." },
        { name: "to", label: "Reaches", options: ["near", "owner"], labels: ["Everyone near", "Its owner"], default: "near", description: "Whom a file dropped on it reaches: everyone within its radius, or its owner alone." },
        { name: "radius", label: "Radius", min: 2, max: 60, default: 10, step: 1, unit: "m", description: "How far from the prim one is near it (m)." },
        { name: "quality", label: "Largest file", min: 1, max: 200, default: 50, step: 1, unit: "MB", description: "The largest file it carries (MB)." }
      ]
    }
  });
  LIVE_URL = /^live:[\w:.~@/-]{1,160}$/;
  MIRROR_TEXTURE = /^effects\/mirror\//;
});

// src/build/edit/import.js
var exports_import = {};
__export(exports_import, {
  slugOf: () => slugOf,
  placedAgain: () => placedAgain,
  placeBuild: () => placeBuild,
  kindsIn: () => kindsIn,
  kindsFor: () => kindsFor,
  floatsIn: () => floatsIn
});
var DEG5, seedFor = (name, index) => {
  let hash3 = 2166136261;
  for (const char of `${name}#${index}`)
    hash3 = Math.imul(hash3 ^ char.charCodeAt(0), 16777619);
  return seedOf(hash3 >>> 0);
}, turnOf = (degrees) => {
  const [x, y, z] = (degrees ?? [0, 0, 0]).map((value) => value * DEG5);
  return quatMultiply(quatAxisAngle([0, 0, 1], z), quatMultiply(quatAxisAngle([0, 1, 0], y), quatAxisAngle([1, 0, 0], x)));
}, slugOf = (name) => String(name ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), givenOf = (kind, prim) => ({ ...prim.params, ...Object.fromEntries(kind.params.filter((param) => prim[param.name] !== undefined).map((param) => [param.name, prim[param.name]])) }), kindPart = (prim, name, index) => {
  const kind = kindOf(prim.kind);
  if (!kind)
    throw new Error(`${name}: no kind ${prim.kind}`);
  if (!kindReady(prim.kind))
    throw Object.assign(new Error(`${name}: the ${prim.kind} kind is not loaded yet`), { name: "KindNotLoaded" });
  const given = givenOf(kind, prim);
  const { params: held4, errors } = constrainKind(prim.kind, given);
  const sized = prim.size && kind.resize ? constrainKind(prim.kind, { ...resizeParams({ kind: prim.kind, params: held4, size: prim.size }), ...given }).params : held4;
  const { params, shift } = recentred({ kind: prim.kind, params: sized });
  const part = { kind: prim.kind, params, ...kind.seeded && { seed: Number.isInteger(prim.seed) ? seedOf(prim.seed) : seedFor(name, index) } };
  const lies = Boolean(kind.settle) && kind.params.some((param) => param.points && Array.isArray(given[param.name]) && given[param.name].every((point) => Array.isArray(point) && point.length === 2));
  return { part: { ...part, shape: fallbackShape(part), size: fitSize({ ...part, size: prim.size ?? kind.size }) }, shift, lies, errors };
}, laidOnGround = (part, at, turn3, object, groundRadius, waterRadius, landRadius) => {
  const type = kindOf(part.kind);
  const ground = type.bed ? landRadius : groundRadius;
  const rotation = quatMultiply(object.rotation, turn3);
  const place = add(object.at, quatRotate(object.rotation, at));
  const up = quatRotate(rotation, [0, 0, 1]);
  const { min, max } = type.footprint(part.params);
  const centre = min.map((v, k) => (v + max[k]) / 2);
  const heightAt = (x, y) => {
    const dir = normalize(add(place, quatRotate(rotation, [x - centre[0], y - centre[1], 0])));
    return dot2(sub(scale(dir, ground(dir)), place), up) + centre[2];
  };
  const waterAt = (x, y) => {
    const dir = normalize(add(place, quatRotate(rotation, [x - centre[0], y - centre[1], 0])));
    const water = waterRadius?.(dir) ?? null;
    return water !== null && water > ground(dir) + 0.01 ? dot2(sub(scale(dir, water), place), up) + centre[2] : null;
  };
  const { params, shift } = recentred({ kind: part.kind, params: type.settle(part.params, heightAt, undefined, waterAt) });
  return { params, at: add(at, quatRotate(turn3, shift)), size: fitSize({ ...part, params }) };
}, shapeOf3 = (shape, name, warnings) => {
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
}, partsOf = (prims, { name, objectId, materials, warnings, object, groundRadius, waterRadius, landRadius }) => prims.map((prim, index) => {
  const kind = prim.kind === undefined ? null : kindPart(prim, name, index);
  const preset2 = kind ? null : shapeOf3(prim.shape, prim.name ?? `part ${index}`, warnings);
  if (!kind && !preset2 && prim.sculpt !== undefined)
    throw new Error(`${name}: ${prim.name ?? `part ${index}`} is a description ("sculpt"): make it a sculpted prim first (the sculpt tool)`);
  if (!kind && !preset2)
    throw new Error(`${name}: no shape ${typeof prim.shape === "string" ? prim.shape : JSON.stringify(prim.shape)}`);
  if (kind)
    warnings.push(...kind.errors.map((error) => `${prim.name ?? `part ${index}`}: ${error}`));
  const texture = prim.material ?? (prim.surface?.texture ? undefined : kind && kindOf(prim.kind).material);
  const looks = kind ? looksOfKind(prim.kind, kind.part.params) : [];
  if (prim.look !== undefined && looks.length && !looks.some((each) => each.name === prim.look))
    warnings.push(`${prim.name ?? `part ${index}`}: no look ${JSON.stringify(prim.look)}, this style has ${looks.map((each) => each.name).join(", ")}`);
  const dressed = kind && !texture && !prim.surface?.texture && !prim.surface?.faces ? materialsOf(prim.kind, kind.part.params, prim.look) : null;
  let surface = texture || prim.surface || dressed ? { ...texture && { texture }, ...dressed && { faces: Object.fromEntries(dressed.map((id2, face2) => [face2, { texture: id2 }])) }, ...prim.surface } : null;
  const turn3 = turnOf(prim.turn);
  const at = kind ? add(prim.at, quatRotate(turn3, kind.shift)) : [...prim.at];
  const laid2 = kind?.lies ? laidOnGround(kind.part, at, turn3, object, groundRadius, waterRadius, landRadius) : null;
  if (laid2)
    Object.assign(kind.part, { params: laid2.params, size: laid2.size });
  const covered = kind && kindOf(prim.kind).covers?.(kind.part.params);
  if (covered && Object.keys(covered).length) {
    const faces = { ...surface?.faces };
    for (const [face2, scale5] of Object.entries(covered))
      if (faces[face2]?.scale === undefined)
        faces[face2] = { ...faces[face2], scale: [...scale5] };
    surface = { ...surface, faces };
  }
  const tinted = kind && kindOf(prim.kind).tints?.(kind.part.params, surface ?? {});
  if (tinted && Object.keys(tinted).length) {
    const faces = { ...surface?.faces };
    for (const [face2, tint] of Object.entries(tinted))
      if (faces[face2]?.tint === undefined)
        faces[face2] = { ...faces[face2], tint: [...tint] };
    surface = { ...surface, faces };
  }
  const id = `${objectId}-${index}`;
  const live = prim.live === undefined ? null : liveOf(prim.live);
  if (live)
    surface = surfaceWithLive(surface, id, live);
  return {
    type: "prim",
    id,
    object: objectId,
    shape: [...kind ? kind.part.shape : preset2.shape],
    at: laid2?.at ?? at,
    rotation: quatNormalize(quatMultiply(turn3, preset2?.rez ?? [0, 0, 0, 1])),
    size: [...kind ? kind.part.size : prim.size],
    color: prim.color ?? materials.get(surface?.texture)?.color ?? [0.6, 0.6, 0.6],
    ...kind && { kind: kind.part.kind, params: kind.part.params, ...kind.part.seed !== undefined && { seed: kind.part.seed } },
    ...surface && { surface },
    ...prim.light && { light: prim.light },
    ...prim.particles && { particles: prim.particles },
    ...prim.phantom === true ? { phantom: true } : prim.collisionOnly === true && { collisionOnly: true },
    ...prim.climbable === true && { climbable: true },
    ...bouncyOf(prim.bouncy) && { bouncy: bouncyOf(prim.bouncy) },
    ...seatOf2(prim.seat === undefined && kind && kindOf(prim.kind).seat ? { seat: kindOf(prim.kind).seat(kind.part.params) } : prim),
    ...typeof prim.box === "string" && { box: prim.box },
    ...prim.behaviour && { behaviour: prim.behaviour },
    ...prim.script && { script: typeof prim.script === "string" ? { source: prim.script } : prim.script },
    ...live && { live }
  };
}), companionParts = (made4, objectId) => {
  const standFor = (part, depth = 1) => companionsOf(part).flatMap((wanted, k) => {
    if (made4.some((other) => other.kind === wanted.kind && Math.hypot(...sub(other.at, wanted.at)) < 0.05))
      return [];
    const stood = recordOfCompanion(wanted, `${part.id}~lamp-${k}`, objectId);
    return [stood, ...depth < DEEP ? standFor(stood, depth + 1) : []];
  });
  return made4.flatMap((part) => standFor(part));
}, placedAgain = (record, standing, moved = [0, 0, 0]) => {
  if (!standing || standing.type !== record.type)
    return record;
  if (record.type === "tree")
    return { ...record, at: standing.at, yaw: standing.yaw };
  if (record.type === "herd")
    return { ...record, at: standing.at };
  if (record.behaviour?.type === "route")
    return { ...record, at: add(record.at, moved) };
  return { ...record, at: standing.at, rotation: standing.rotation };
}, placeBuild = (spec, { groundRadius, bareRadius = groundRadius, waterRadius = () => null, landRadius = groundRadius, materials, id }) => {
  const up = normalize(spec.anchor.at);
  const north = normalize(sub([0, 1, 0], scale(up, up[1])));
  const east = cross2(north, up);
  const heading = spec.anchor.heading * DEG5;
  const ahead = add(scale(north, Math.cos(heading)), scale(east, Math.sin(heading)));
  const right = cross2(ahead, up);
  const origin = spec.anchor.exact ? [...spec.anchor.at] : scale(up, (spec.land || spec.anchor.bare ? bareRadius : groundRadius)(up));
  const frame = quatFromBasis(right, ahead, up);
  const used = new Set;
  const idOf = (given, made4) => {
    const chosen = typeof given === "string" && given.length > 0 && given.length <= 160 && !given.includes("/") ? given : made4;
    if (used.has(chosen))
      throw new Error(`${spec.name}: two records with the id ${chosen}`);
    used.add(chosen);
    return chosen;
  };
  const placeOf2 = (at) => {
    const level = add(origin, add(scale(right, at[0]), scale(ahead, at[1])));
    if (at.length !== 2)
      return add(level, scale(up, at[2]));
    const dir = normalize(level);
    return scale(dir, groundRadius(dir));
  };
  const floatOf = (at) => {
    if (at.length !== 2)
      return placeOf2(at);
    const dir = normalize(add(origin, add(scale(right, at[0]), scale(ahead, at[1]))));
    return scale(dir, waterRadius(dir) ?? groundRadius(dir));
  };
  const warnings = [];
  const objects = [];
  const parts = [];
  const names = new Map;
  const addObject = (name, objectId, at, turn3, prims, behaviour, vehicle, origin2, marked2, dry, looks) => {
    if (!prims?.length)
      return;
    const rotation = quatNormalize(quatMultiply(frame, turnOf(turn3)));
    const driven = vehicle === undefined ? null : vehicleOf(vehicle);
    if (vehicle !== undefined && !driven)
      warnings.push(`${name}: no vehicle "${vehicle?.type}"`);
    objects.push({ type: "object", id: objectId, name, at, rotation, ...behaviour && { behaviour }, ...driven && { vehicle: driven }, ...looksOf(looks) && { looks: looksOf(looks) }, ...dry === true && { dry: true }, ...origin2 && typeof origin2 === "object" && { origin: origin2 }, ...typeof marked2 === "string" && { package: marked2 } });
    const made4 = partsOf(prims, { name: objectId === id ? spec.name : `${spec.name}#${name}`, objectId, materials, warnings, object: { at, rotation }, groundRadius, waterRadius, landRadius });
    parts.push(...made4, ...companionParts(made4, objectId));
    names.set(name, objectId);
  };
  if (spec.prims?.length)
    addObject(spec.name, idOf(null, id), origin, null, spec.prims, null, undefined, null, spec.package);
  for (const object of spec.objects ?? []) {
    const slug = slugOf(object.name);
    if (!slug)
      throw new Error(`${spec.name}: an object without a name`);
    if (names.has(object.name) || objects.some(({ id: other }) => other === `${id}~${slug}`))
      throw new Error(`${spec.name}: two objects named ${object.name}`);
    addObject(object.name, idOf(object.id, `${id}~${slug}`), placeOf2(object.at), object.turn, object.prims, object.behaviour, object.vehicle, object.origin, object.package ?? spec.package, object.dry, object.looks);
  }
  const clones = (spec.clones ?? []).map((clone, n) => {
    if (!names.has(clone.of))
      throw new Error(`${spec.name}: no object ${clone.of} to clone`);
    return {
      type: "instance",
      id: idOf(clone.id, `${id}~clone-${n}`),
      of: names.get(clone.of),
      at: placeOf2(clone.at),
      rotation: quatNormalize(quatMultiply(frame, turnOf(clone.turn))),
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
    const turn3 = Number.isFinite(tree.turn) ? tree.turn : seed * 137.508 % 360;
    const params = paramsOf2(tree.params);
    const key = typeof tree.key === "string" || Number.isInteger(tree.key) ? String(tree.key) : null;
    if (key !== null && !/^[\w.-]{1,64}$/.test(key))
      throw new Error(`${spec.name}: tree ${n}'s key ${key}: letters, digits, dots and dashes`);
    const script = tree.script && (typeof tree.script === "string" ? { source: tree.script } : tree.script);
    return {
      type: "tree",
      id: idOf(tree.id, `${id}~tree-${key ?? n}`),
      species: tree.species,
      seed,
      at: (floatsOn(tree.species) ? floatOf : placeOf2)(tree.at),
      yaw: wrapYaw(spec.anchor.heading - turn3),
      scale: size,
      ...Object.keys(params).length && { params },
      ...script && { script },
      ...Array.isArray(tree.tint) && { tint: tree.tint },
      ...Number.isFinite(tree.glow) && { glow: tree.glow }
    };
  });
  const herds = (spec.animals ?? []).map((animal, n) => {
    const species = speciesOf(animal?.species);
    if (!species)
      throw new Error(`${spec.name}: no animal ${animal?.species}`);
    if (!Array.isArray(animal.at) || animal.at.length < 2 || animal.at.length > 3 || !animal.at.every(Number.isFinite))
      throw new Error(`${spec.name}: animals ${n} (${species.name}) has no place: "at": [x, y]`);
    const seed = Number.isInteger(animal.seed) && animal.seed >= 0 ? animal.seed % 4294967296 : seedFor(`${spec.name}~animals`, n);
    const count = Number.isFinite(animal.count) ? countOf2(species, animal.count) : undefined;
    if (count !== undefined && count !== animal.count)
      warnings.push(`animals ${n} (${species.name}): count ${animal.count} → ${count}`);
    const territory = Number.isFinite(animal.territory) ? territoryOf(species, animal.territory) : undefined;
    if (territory !== undefined && territory !== animal.territory)
      warnings.push(`animals ${n} (${species.name}): territory ${animal.territory} → ${territory}`);
    const key = typeof animal.key === "string" || Number.isInteger(animal.key) ? String(animal.key) : null;
    if (key !== null && !/^[\w.-]{1,64}$/.test(key))
      throw new Error(`${spec.name}: animals ${n}'s key ${key}: letters, digits, dots and dashes`);
    return { type: "herd", id: idOf(animal.id, `${id}~herd-${key ?? n}`), species: species.name, at: homeOf(placeOf2(animal.at)), seed, ...count !== undefined && { count }, ...territory !== undefined && { territory } };
  });
  const own = objects.find((object) => object.id === id) ?? null;
  return { object: own, parts: parts.filter((part) => part.object === id), records: [...objects, ...parts, ...clones, ...trees, ...herds], warnings, frame: { origin, right, ahead, up } };
}, kindsIn = (spec) => [...new Set([...spec.prims ?? [], ...(spec.objects ?? []).flatMap((object) => object.prims ?? [])].flatMap((prim) => typeof prim?.kind === "string" ? [prim.kind, ...kindOf(prim.kind)?.brings ? bringsOf(prim.kind, givenOf(kindOf(prim.kind), prim)) : []] : []))], kindsFor = (spec) => loadKinds(kindsIn(spec)), floatsIn = (spec) => (spec.trees ?? []).some((tree) => floatsOn(tree.species));
var init_import = __esm(async () => {
  init_params();
  init_record();
  init_species();
  init_species2();
  init_record2();
  init_looks();
  init_seat();
  init_bouncy();
  init_live();
  await __promiseAll([
    init_kinds(),
    init_companions(),
    init_vehicles()
  ]);
  DEG5 = Math.PI / 180;
});

// tools/build-survey.js
init_survey();
init_terrain_height();
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";
import { join } from "node:path";
var root = new URL("..", import.meta.url).pathname;
var args = process.argv.slice(2);
var option = (flag, fallback) => args.includes(flag) ? args[args.indexOf(flag) + 1] : fallback;
var where = args[0];
if (!where || where.startsWith("--")) {
  console.error('usage: survey <URL | lat,lon | x,y,z | survey.json> [--name site] [--radius 60] [--step 2] [--heading deg] [--builds a.json,b.json] [--profile "x1,y1,x2,y2;…"] [--contour 1] [--out dir]');
  process.exit(1);
}
var readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
var buildPath = (name) => name.endsWith(".json") ? name : join(root, "assets/builds", `${name}.json`);
var place;
var before = null;
if (where.startsWith("build:")) {
  const { anchor } = readJson(buildPath(where.slice(6)));
  place = { ...placeOf(anchor.at.join()), heading: anchor.heading, from: `the anchor of ${where.slice(6)}` };
} else if (where.endsWith(".json") && existsSync(where)) {
  const json = readJson(where);
  if (!json.anchor?.at)
    throw new Error(`${where}: neither a survey nor a build (no anchor)`);
  if (json.heights)
    before = json;
  place = { ...placeOf(json.anchor.at.join()), heading: json.anchor.heading ?? 0, from: before ? `the survey ${where}` : `the anchor of ${where}` };
} else
  place = placeOf(where);
var heading = Number(option("--heading", place.heading));
var radius = Number(option("--radius", before?.radius ?? 60));
var step = Number(option("--step", before?.step ?? 2));
if (!(radius > 0 && radius <= 500 && step >= 0.5 && radius / step <= 200))
  throw new Error("--radius up to 500 m, --step from 0.5 m, at most 200 steps each way");
var name = option("--name", before?.name ?? "site");
if (!/^[a-z0-9-]+$/i.test(name))
  throw new Error("--name: letters, digits and dashes");
var records = [];
var builds = option("--builds", "")?.split(",").filter(Boolean) ?? [];
if (builds.length) {
  const { placeBuild: placeBuild2 } = await init_import().then(() => exports_import);
  const groundRadius = (dir) => RADIUS + Math.max(groundElevation(dir), SEA);
  for (const build3 of builds)
    records.push(...placeBuild2(readJson(buildPath(build3)), { groundRadius, materials: new Map, id: `local:${build3.replace(/\W+/g, "-")}` }).records);
}
var survey = surveySite({ at: place.at, heading, radius, step, records, name });
if (before && before.anchor.heading === heading) {
  const ids = new Set(survey.builds.map((build3) => build3.id));
  survey.builds.push(...(before.builds ?? []).filter((build3) => !ids.has(build3.id)));
  survey.trees.push(...(before.trees ?? []).filter((tree) => !survey.trees.some((other) => other.id === tree.id)));
  Object.assign(survey.summary, { builds: survey.builds.length, trees: survey.trees.length });
}
var frame = frameAt(place.at, heading);
var lines = option("--profile", "")?.split(";").map((line) => line.split(",").map(Number)).filter((line) => line.length === 4 && line.every(Number.isFinite)) ?? [];
if (lines.length)
  survey.profiles = lines.map(([x1, y1, x2, y2]) => profile(frame, [x1, y1], [x2, y2], 1));
var out = option("--out", existsSync(join(root, "assets/builds")) ? join(root, "test-results/surveys") : ".");
mkdirSync(out, { recursive: true });
var contour = Number(option("--contour", Math.max(0.5, Math.round((survey.summary.high - survey.summary.low) / 25) || 1)));
var png = ({ width, height, rgb }) => {
  const table2 = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0;k < 8; k++)
      c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
    return c >>> 0;
  });
  const crc = (bytes) => {
    let c = 4294967295;
    for (const byte2 of bytes)
      c = table2[(c ^ byte2) & 255] ^ c >>> 8;
    return (c ^ 4294967295) >>> 0;
  };
  const chunk = (type, data) => {
    const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
    const head = Buffer.alloc(4), tail = Buffer.alloc(4);
    head.writeUInt32BE(data.length);
    tail.writeUInt32BE(crc(body));
    return Buffer.concat([head, body, tail]);
  };
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header.set([8, 2, 0, 0, 0], 8);
  const rows = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0;y < height; y++)
    rows.set(rgb.subarray(y * width * 3, (y + 1) * width * 3), y * (width * 3 + 1) + 1);
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", header), chunk("IDAT", deflateSync(rows)), chunk("IEND", Buffer.alloc(0))]);
};
var image = surveyImage(survey, { contour });
var files = { json: join(out, `${name}.json`), svg: join(out, `${name}.svg`), png: join(out, `${name}.png`) };
writeFileSync(files.json, surveyText(survey));
writeFileSync(files.svg, surveyMap(survey, { contour }));
writeFileSync(files.png, png(image));
var { summary } = survey;
var point = ([x, y, z]) => `(${x}, ${y}) ${z} m`;
var said = [
  `${name}: ${place.from}; lat ${survey.latLon[0]}, lon ${survey.latLon[1]}, ${survey.elevation} m over the sea; heading ${survey.anchor.heading}° (y ahead)`,
  `anchor for a build here: ${JSON.stringify(survey.anchor)}`,
  `ground ${summary.low} to ${summary.high} m round the centre, steepest ${summary.steepest}°, ${Math.round(summary.flat * 100)}% under 5°${summary.wet ? `, ${Math.round(summary.wet * 100)}% sea` : ""}; ${radius} m each way every ${step} m`,
  survey.peaks.length && `peaks: ${survey.peaks.slice(0, 5).map(point).join("; ")}`,
  ...survey.ridges.slice(0, 4).map((r) => `ridge ${r.length} m: ${point(r.from)} to ${point(r.to)}, ${r.low} to ${r.high} m`),
  ...survey.valleys.slice(0, 4).map((v) => `valley ${v.length} m: ${point(v.from)} to ${point(v.to)}, ${v.low} to ${v.high} m`),
  survey.builds.length && `built: ${survey.builds.slice(0, 12).map((b) => `${b.name ?? b.id} at (${b.centre[0]}, ${b.centre[1]}) ${b.size.join(" × ")} m`).join("; ")}${survey.builds.length > 12 ? `; and ${survey.builds.length - 12} more` : ""}`,
  survey.trees.length && `trees: ${Object.entries(survey.trees.reduce((count, { species }) => ({ ...count, [species]: (count[species] ?? 0) + 1 }), {})).map(([species, n]) => `${n} ${species}`).join(", ")}`,
  ...(survey.profiles ?? []).map(({ length: length2, points, lowest: lowest2, highest, wet }) => `profile ${point(points[0])} to ${point(points.at(-1))}: ${length2} m, lowest ${point(lowest2)}, highest ${point(highest)}${wet ? ", crosses the sea" : ""}`),
  `written: ${files.json} (heights, slopes${survey.water ? ", water" : ""}: rows from +y down to −y), ${files.svg}, ${files.png} (map: contours every ${contour} m, bar ${image.bar} m)`
].filter(Boolean);
console.log(said.join(`
`));
