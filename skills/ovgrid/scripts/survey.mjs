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
}, bareElevation = (dir) => terrainHeight(dir) * ELEV_SCALE, land = null, groundElevation = (dir) => land ? land.elevation(dir, bareElevation) : terrainHeight(dir) * ELEV_SCALE;
var init_terrain_height = __esm(() => {
  BASE_LAYER = layer(RIDGED, 23, 1.665, 3.6, 0, 1);
  TERRAIN_LAYER_0 = layer(RIDGED, 10, 1.005, 1.6, 0, 1);
  TERRAIN_LAYER_1 = layer(FBM, 18, 1.665, 2.6, -2, 2);
  TERRAIN_LAYER_2 = layer(RIDGED, 18, 1.1, 0.9, -2, 2);
  BIAS = [[2.3, 4.5, 6.7], [8.9, 9.8, 8.7], [7.6, 6.5, 5.4]];
  GRID_OFFSET = [5, 4, 9];
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
      trees: trees.length
    },
    peaks: peaks.sort((a, b) => b[2] - a[2]).slice(0, 12),
    pits: pits.sort((a, b) => a[2] - b[2]).slice(0, 12),
    ridges: linesOf(ridge, size, pointOf),
    valleys: linesOf(valley, size, pointOf),
    builds,
    trees,
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
  const lines = rest.map(([key, value]) => `  ${JSON.stringify(key)}: ${["builds", "trees", "ridges", "valleys"].includes(key) && value.length ? `[
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
var GAP = 0.004, FLOOR = 0.01, HANDLE = 1, RAISE = 0.012, BEVEL = 0.03, SINK2 = 0.001, PANE = 0.006, METRE, openingOf = (frame, size) => {
  const [hx, hy, hz] = size.map((v) => v / 2);
  const f = Math.min(frame, size[0] / 3, size[2] / 3);
  return { hx, hy, hz, f, x0: -hx + f + GAP, x1: hx - f - GAP, z0: -hz + FLOOR, z1: hz - f - GAP };
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

// src/build/kinds/road.js
var LIFT = 0.1, EVERY = 1, ACROSS = 1.5, SAMPLES = 2048, STRIDES, MITRE = 3, lengthsOf = (points) => {
  let travelled = 0;
  return points.slice(1).map((to, i) => {
    const from = points[i];
    const length2 = Math.hypot(to[0] - from[0], to[1] - from[1]);
    const start = travelled;
    travelled += length2;
    return { from, to, length: length2, start, along: [(to[0] - from[0]) / length2, (to[1] - from[1]) / length2] };
  });
}, closedOf = (points) => points.length > 3 && points[0][0] === points.at(-1)[0] && points[0][1] === points.at(-1)[1], samplesAcross = (width) => Math.min(9, Math.max(3, Math.ceil(width / ACROSS) + 1)), samplesAlong = (total, across) => Math.min(Math.floor(SAMPLES / across), Math.max(2, Math.round(total / EVERY) + 1)), leftOf = ([x, y]) => [-y, x], sectionAt = (lengths, closed, width, s) => {
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
}), groundSites = ({ points, width }) => {
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
}), sectionsOf = (params, level) => {
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
}, footprintOf2, centreOf2 = (params) => {
  const { min, max } = footprintOf2(params);
  return min.map((v, k) => (v + max[k]) / 2);
}, upToMillimetre2 = (v) => Math.ceil(v * 1000 - 0.000001) / 1000, road;
var init_road = __esm(() => {
  init_mesh();
  STRIDES = [8, 4, 2, 1];
  footprintOf2 = remembered((params) => {
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
  road = Object.freeze({
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
      const scale4 = [0, 1].map((k) => spread[k] > 0.000000001 ? Math.max(size[k] - (max[k] - min[k] - spread[k]), 0) / spread[k] : 1);
      const depth = params.depth + size[2] - (max[2] - min[2]);
      return { ...params, width, depth, points: params.points.map(([x, y, z]) => [x * scale4[0], y * scale4[1], z]) };
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
          const normal = unit2(cross3(sub2(row[Math.min(j + 1, last)], row[Math.max(j - 1, 0)]), sub2(after[j], before[j])));
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
        mesh.polygon(1, [aLeft, down(aLeft), down(bLeft), bLeft], cross3(sub2(bLeft, aLeft), [0, 0, 1]).map((v) => -v), [[a.s, 0], [a.s, -params.depth], [b.s, -params.depth], [b.s, 0]]);
        mesh.polygon(1, [aRight, bRight, down(bRight), down(aRight)], cross3(sub2(bRight, aRight), [0, 0, 1]), [[a.s, 0], [b.s, 0], [b.s, -params.depth], [a.s, -params.depth]]);
      }
      if (!closed) {
        for (const [{ row }, sign] of [[sections[0], -1], [sections.at(-1), 1]]) {
          const outward = cross3(sub2(row[0], row[last]), [0, 0, 1]).map((v) => v * sign);
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
    const shown = new Int8Array(np * nq);
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
            shown[b * np + a] = here >= 0 && (open || colour[c + sign * strides[axis]] < 0) ? own.get(c)?.[side2] ?? here : -1;
          }
        for (let b = 0;b < nq; b++)
          for (let a = 0;a < np; a++) {
            const tone = shown[b * np + a];
            if (tone < 0)
              continue;
            let a1 = a + 1;
            while (a1 < np && shown[b * np + a1] === tone)
              a1++;
            let b1 = b + 1;
            grow:
              while (b1 < nq) {
                for (let x = a;x < a1; x++)
                  if (shown[b1 * np + x] !== tone)
                    break grow;
                b1++;
              }
            for (let y = b;y < b1; y++)
              shown.fill(-1, y * np + a, y * np + a1);
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
var VERSION2 = 1, MOST_COLOURS2 = 8, MOST_POINTS = 512, MOST_RINGS = 64, MOST_BYTES2 = 4096, SPAN = 65535, LEAST = 0.000000000001, decodeOutline = (text) => {
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
      return [(bytes[p] | bytes[p + 1] << 8) / SPAN, (bytes[p + 2] | bytes[p + 3] << 8) / SPAN];
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
  const listeners = new Set;
  const use = (value) => {
    if (!values.includes(value) || value === current)
      return false;
    current = value;
    for (const listener of listeners)
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
      listeners.add(listener);
      return () => listeners.delete(listener);
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
var SHARP = 52.5, ROUND_SIDES = 12, ACROSS2, MITRE2 = 4, FACING = 0.7, TINY2 = 0.000000001, FOLD = 0.0005, MIRRORS, signedArea = (points) => points.reduce((sum, [x, y], i) => {
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
  const ball = body.round ? keep(Manifold.sphere(body.round, ROUND_SIDES)) : null;
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
  return n > 1 ? keep(keep(left.smoothOut(SHARP)).refine(n)) : left;
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
var MANIFOLD, SHAPES, FORMS2, WAYS, MOST_COLOURS3 = 8, MOST_BODIES = 32, MOST_SMOOTHING = 3, MOST_TRIANGLES = 5000, SIDES3 = 32, AXES, JOINS, GATHER = 1, MOST_CHARACTERS = 3072, REACH2 = 64, LEAST2 = 0.001, POINTS, ROUND_VERTICES = 38, HERE, engine = null, mesher = null, loading = null, listeners, back, told = false, tell = (key) => {
  if (back)
    key === null ? back = null : back.add(key);
  if (told)
    return;
  told = true;
  const flush = () => {
    const keys = back;
    back = new Set;
    told = false;
    for (const listener of listeners)
      listener(keys);
  };
  if (globalThis.requestAnimationFrame && !HERE)
    requestAnimationFrame(flush);
  else
    queueMicrotask(flush);
}, loadSolids = () => loading ??= (async () => {
  const [{ default: Module }, mesh] = await Promise.all([import(MANIFOLD.href), HERE ? Promise.resolve().then(() => (init_solid_mesh(), exports_solid_mesh)) : null]);
  const wasm = await Module(HERE ? {} : { locateFile: (file) => new URL(file, MANIFOLD).href });
  wasm.setup();
  engine = wasm;
  mesher = mesh;
  tell(null);
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
  tell(null);
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
}, FACES, CAP = 0.999, faceOf = (shape, [x, y, z]) => {
  if (shape === "extrude")
    return z < -CAP ? 0 : z > CAP ? 1 : 2;
  const [ax, ay, az] = [Math.abs(x), Math.abs(y), Math.abs(z)];
  return ax >= ay && ax >= az ? x > 0 ? 1 : 0 : ay >= az ? y > 0 ? 3 : 2 : z > 0 ? 5 : 4;
}, facesTone = (body, way, slots, back2) => {
  const shape = body[way];
  if (!Array.isArray(body.faces) || !FACES[shape])
    return null;
  const inward = way === "cut" ? -1 : 1;
  return (out) => Math.min(body.faces[faceOf(shape, back2(out).map((v) => v * inward))], slots - 1);
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
  const count = FACES[body[way]];
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
}, CONVEX, ROUND3, LEVEL_SIDES, COLLIDES = 1, ROUND_CREASE, FLAT2, creaseOf = (body) => body.flat ? FLAT2 : ROUND3.has(body.add) ? ROUND_CREASE : undefined, convexBody = (body, way) => body[way] === "hull" ? !body.round && !body.hollow : CONVEX.has(body[way]), plainBody = (body, way) => !body.repeat && !body.mirror && convexBody(body, way), copiesOf = ({ repeat, mirror }) => {
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
  return copiesOf(body).map(({ place, back: back2, undo, flip }) => ({ corners: own.corners.map(place), faces: flip ? own.faces.map(([a, b, c]) => [a, c, b]) : own.faces, place, back: back2, undo }));
}, onPage = ({ bodies, join }) => join === GATHER && bodies.length > 0 && bodies.every((body) => madeHere(body, "add")), hullsSurface = ({ bodies }, size, slots, level) => {
  const origins = new Map;
  let id = 0;
  const lefts = bodies.flatMap((body) => {
    const matrix = body.turn ? matrixOf(body.turn) : null;
    const unturned = (out) => matrix ? [0, 1, 2].map((k) => matrix[0][k] * out[0] + matrix[1][k] * out[1] + matrix[2][k] * out[2]) : out;
    return placedCopies(body, "add", level).map(({ corners, faces, place, back: back2 }) => {
      const vertProperties = Float64Array.from(corners.flat());
      const triVerts = Uint32Array.from(faces.flat());
      const toneOf = facesTone(body, "add", slots, (out) => unturned(back2(out)));
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
  tell(key);
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
    const at = params.bodies.some((body) => ROUND3.has(body.add)) ? level : 3;
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
  MANIFOLD = new URL("../../manifold/manifold.js", import.meta.url);
  SHAPES = ["box", "cylinder", "cone", "ball", "wedge"];
  FORMS2 = ["hull", "revolve", "extrude", "loft", "sweep"];
  WAYS = ["add", "cut", "keep"];
  AXES = ["x", "y", "z"];
  JOINS = ["union", "none"];
  POINTS = Object.freeze({ hull: [4, 32], profile: [3, 64], holes: 8, sections: [2, 32], path: [2, 32], repeat: [2, 32] });
  HERE = Boolean(globalThis.Bun || globalThis.process?.versions?.node);
  listeners = new Set;
  back = new Set;
  cap2 = smoothQuality.get();
  smoothQuality.on(setSmoothing);
  FACES = Object.freeze({ box: 6, extrude: 3 });
  CONVEX = new Set(["box", "cylinder", "cone", "wedge"]);
  ROUND3 = new Set(["cylinder", "cone"]);
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

// src/build/kinds/index.js
var KINDS, MIN_SIZE = 0.01, MAX_SIZE = 64, kindOf = (name) => typeof name === "string" && Object.hasOwn(KINDS, name) ? KINDS[name] : null, decimals = (step) => Math.max(0, Math.ceil(-Math.log10(step) - 0.000000001)), constrain = (param, value) => {
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
  const held = { min, max, step };
  const points = [];
  for (const point of Array.isArray(value) ? value : []) {
    if (points.length === most)
      break;
    const handled = handles && point?.length === 6;
    if (!Array.isArray(point) || point.length < 2 || point.length > 3 && !handled || !point.every(Number.isFinite))
      continue;
    const kept2 = (handled ? point : [point[0], point[1], point[2] ?? 0]).map((v) => constrain(held, v));
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
  const moved = Object.fromEntries(type.params.filter((param) => param.points || param.heights).map((param) => [param.name, param.points ? values[param.name].map((point) => point.map((v, k) => v - shift[k])) : values[param.name].map((v) => v - shift[2])]));
  return { params: constrainKind(kind, { ...values, ...moved }).params, shift };
}, fallbackShape = ({ kind, params }) => {
  const type = kindOf(kind);
  return [...PRESETS[type ? resolve(type.shape, constrainKind(kind, params).params) : "cube"].shape];
}, wholes;
var init_kinds = __esm(() => {
  init_params();
  init_mesh();
  init_rock();
  init_bevel();
  init_stairs();
  init_door();
  init_window();
  init_roof();
  init_column();
  init_arch();
  init_fence();
  init_road();
  init_sculpt2();
  init_blocks();
  init_outline();
  init_solid();
  KINDS = Object.freeze({ rock, bevel, stairs, door, window: windowKind, roof, column, arch, fence, road, sculpt, blocks, outline, solid });
  wholes = new Map;
});

// src/vegetation/record.js
var TREE_SCALE, BUILT_IN, OWN, finite = (value, length2) => Array.isArray(value) && value.length === length2 && value.every(Number.isFinite), speciesName = (value) => typeof value === "string" && (BUILT_IN.test(value) || OWN.test(value)), wrapYaw = (degrees) => (degrees % 360 + 360) % 360, SPECIES_PARAMS, CROWNS, WHOLE, colour = (value) => finite(value, 3) && value.every((v) => v >= 0 && v <= 1), paramsOf2 = (value) => {
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
  OWN = /^[^/\s]{1,80}:[^/\s]{1,80}$/;
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

// src/build/behaviours.js
var TIME, STAY, TRIGGER, REACH3, along = (axis, fallback, what) => ({ name: axis, label: `Along ${axis}`, min: -64, max: 64, default: fallback, step: 0.05, unit: "m", description: `How far it ${what} along its own ${axis} (m).` }), HIGHEST = 1e5, BEHAVIOURS, MOVE_DEFAULTS, paths, timelines, airs, drawnPlaces, coasts, joins;
var init_behaviours = __esm(() => {
  init_kinds();
  init_vehicles();
  init_survey();
  init_terrain_height();
  TIME = { name: "time", label: "Time", min: 0.2, max: 5, default: 1, step: 0.1, unit: "s", description: "How long it takes to open, and to shut (s)." };
  STAY = { name: "stay", label: "Stays open", min: 0, max: 60, default: 5, step: 0.5, unit: "s", description: "How long it stays open after a click before it shuts by itself (s); 0, until clicked again." };
  TRIGGER = { name: "trigger", label: "Opens on", min: 0, max: 2, default: 0, step: 1, options: ["click", "near", "both"], description: "What opens it: a click; someone coming near — it shuts once they have all gone; or either." };
  REACH3 = { name: "reach", label: "Near", min: 0.5, max: 10, default: 2.5, step: 0.5, unit: "m", description: "How near someone comes before it opens by itself (m)." };
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
        along("x", 0, "goes"),
        along("y", 0, "goes"),
        { ...along("z", 3, "goes"), max: HIGHEST, wide: true, description: "How far it goes along its own z (m), up to 100 km." },
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
        { ...REACH3, default: 4, when: ({ trigger }) => trigger >= 1, description: "How far across under it it senses someone (m): standing on its own floor, up to 3.5 m under it." },
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
        REACH3,
        TIME,
        STAY
      ]
    },
    slide: {
      label: "Slides",
      description: "Slides aside on a click or as someone comes near, and back by itself: a sliding door, a window, a hatch.",
      touch: true,
      params: [along("x", 1, "slides"), along("y", 0, "slides"), along("z", 0, "slides"), TRIGGER, REACH3, TIME, STAY]
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
  MOVE_DEFAULTS = Object.fromEntries(BEHAVIOURS.move.params.map((param) => [param.name, param.default]));
  paths = new WeakMap;
  timelines = new WeakMap;
  airs = new WeakMap;
  drawnPlaces = new WeakMap;
  coasts = new WeakMap;
  joins = new WeakMap;
});

// src/physics/colliders.js
var CUBE, CYLINDER, SPHERE, normals, convexity;
var init_colliders = __esm(() => {
  init_params();
  init_kinds();
  CUBE = PRESETS.cube.shape.join(",");
  CYLINDER = PRESETS.cylinder.shape.join(",");
  SPHERE = PRESETS.sphere.shape.join(",");
  normals = new Map;
  convexity = new Map;
});

// src/build/vehicles.js
var MASS, CAR_GRIP = 2, GRIP, DRIVE, BRAKE, SUSPENSION, TRAVEL, STEERING, VEHICLES, TILT, PLANE_TILT, vehicleType = (name) => typeof name === "string" && Object.hasOwn(VEHICLES, name) ? VEHICLES[name] : null, decimals2 = (step) => Math.max(0, Math.ceil(-Math.log10(step) - 0.000000001)), held = (param, value) => {
  if (param.options)
    return param.options.includes(value) ? value : param.default;
  if (!Number.isFinite(value))
    return param.default;
  const within4 = Math.min(Math.max(value, param.min), param.max);
  return Number(Math.min(param.min + Math.round((within4 - param.min) / param.step) * param.step, param.max).toFixed(decimals2(param.step)));
}, vehicleOf = (value) => {
  const kind = vehicleType(value?.type);
  return kind && { type: value.type, ...Object.fromEntries(kind.params.flatMap((param) => param.optional && value[param.name] === undefined ? [] : [[param.name, held(param, value[param.name])]])) };
};
var init_vehicles = __esm(() => {
  init_behaviours();
  init_colliders();
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
        { name: "steer", label: "Steers", min: 5, max: 45, default: 30, step: 1, unit: "°", description: "How far its front wheel turns (°)." },
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
    }
  });
  TILT = Object.freeze({ pitch: 10, surge: 5, bank: 25, attitude: 3 });
  PLANE_TILT = Object.freeze({ pitch: 20, bank: 35 });
});

// src/build/looks.js
var SLOTS, MATERIAL, lookValue = (value) => {
  if (Array.isArray(value) && value.length === 3 && value.every(Number.isFinite))
    return value.map((v) => Math.min(Math.max(v, 0), 1));
  return typeof value === "string" && value.length <= 96 && MATERIAL.test(value) ? value : null;
}, looksOf = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return null;
  const kept2 = SLOTS.flatMap((slot) => {
    const look = lookValue(value[slot]);
    return look === null ? [] : [[slot, look]];
  });
  return kept2.length ? Object.fromEntries(kept2) : null;
};
var init_looks = __esm(() => {
  SLOTS = ["paint", "roof", "accent", "interior", "carpet", "rims"];
  MATERIAL = /^[a-z0-9-]+\/[a-z0-9-]+\/[a-z0-9-]+$/;
});

// src/build/seat.js
var POSES, POSE, REACH4 = 64, MOST_PLACES = 64, DEG3, wrapTurn = (degrees) => {
  const turn3 = (degrees % 360 + 360) % 360;
  return turn3 > 180 ? turn3 - 360 : turn3;
}, heldTarget = ({ at, turn: turn3 = 0 }) => ({
  at: at.map((v) => Math.round(Math.min(Math.max(v, -REACH4), REACH4) * 1000) / 1000 || 0),
  turn: Math.round(wrapTurn(turn3) * 10) / 10 || 0
}), seatWith = (target, pose) => target || pose ? { ...target, ...pose && { pose } } : true, seatOf = (value) => {
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
    { clip: "mixamo/swing-dancing", name: "Swing dancing", rests: "feet" }
  ];
  POSE = new Map(POSES.map((pose) => [pose.clip, pose]));
  DEG3 = Math.PI / 180;
});

// src/build/bouncy.js
var BOUNCY, decimals3 = (step) => Math.max(0, Math.ceil(-Math.log10(step) - 0.000000001)), held2 = (param, value) => {
  const given = typeof value === "string" && param.options ? param.options.indexOf(value) : value;
  if (!Number.isFinite(given) || param.options && given < 0)
    return param.default;
  const within4 = Math.min(Math.max(given, param.min), param.max);
  return Number(Math.min(param.min + Math.round((within4 - param.min) / param.step) * param.step, param.max).toFixed(decimals3(param.step)));
}, bouncyOf = (value) => {
  const given = value === true ? {} : value && typeof value === "object" && !Array.isArray(value) ? value : null;
  return given && Object.fromEntries(BOUNCY.params.map((param) => [param.name, held2(param, given[param.name])]));
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
  placeBuild: () => placeBuild
});
var DEG4, seedFor = (name, index) => {
  let hash3 = 2166136261;
  for (const char of `${name}#${index}`)
    hash3 = Math.imul(hash3 ^ char.charCodeAt(0), 16777619);
  return seedOf(hash3 >>> 0);
}, turnOf = (degrees) => {
  const [x, y, z] = (degrees ?? [0, 0, 0]).map((value) => value * DEG4);
  return quatMultiply(quatAxisAngle([0, 0, 1], z), quatMultiply(quatAxisAngle([0, 1, 0], y), quatAxisAngle([1, 0, 0], x)));
}, slugOf = (name) => String(name ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), kindPart = (prim, name, index) => {
  const kind = kindOf(prim.kind);
  if (!kind)
    throw new Error(`${name}: no kind ${prim.kind}`);
  const given = { ...prim.params, ...Object.fromEntries(kind.params.filter((param) => prim[param.name] !== undefined).map((param) => [param.name, prim[param.name]])) };
  const { params: held3, errors } = constrainKind(prim.kind, given);
  const sized = prim.size && kind.resize ? constrainKind(prim.kind, { ...resizeParams({ kind: prim.kind, params: held3, size: prim.size }), ...given }).params : held3;
  const { params, shift } = recentred({ kind: prim.kind, params: sized });
  const part = { kind: prim.kind, params, ...kind.seeded && { seed: Number.isInteger(prim.seed) ? seedOf(prim.seed) : seedFor(name, index) } };
  const lies = Boolean(kind.settle) && kind.params.some((param) => param.points && Array.isArray(given[param.name]) && given[param.name].every((point) => Array.isArray(point) && point.length === 2));
  return { part: { ...part, shape: fallbackShape(part), size: fitSize({ ...part, size: prim.size ?? kind.size }) }, shift, lies, errors };
}, laidOnGround = (part, at, turn3, object, groundRadius) => {
  const type = kindOf(part.kind);
  const rotation = quatMultiply(object.rotation, turn3);
  const place = add(object.at, quatRotate(object.rotation, at));
  const up = quatRotate(rotation, [0, 0, 1]);
  const { min, max } = type.footprint(part.params);
  const centre = min.map((v, k) => (v + max[k]) / 2);
  const heightAt = (x, y) => {
    const dir = normalize(add(place, quatRotate(rotation, [x - centre[0], y - centre[1], 0])));
    return dot2(sub(scale(dir, groundRadius(dir)), place), up) + centre[2];
  };
  const { params, shift } = recentred({ kind: part.kind, params: type.settle(part.params, heightAt) });
  return { params, at: add(at, quatRotate(turn3, shift)), size: fitSize({ ...part, params }) };
}, shapeOf = (shape, name, warnings) => {
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
}, partsOf = (prims, { name, objectId, materials, warnings, object, groundRadius }) => prims.map((prim, index) => {
  const kind = prim.kind === undefined ? null : kindPart(prim, name, index);
  const preset2 = kind ? null : shapeOf(prim.shape, prim.name ?? `part ${index}`, warnings);
  if (!kind && !preset2 && prim.sculpt !== undefined)
    throw new Error(`${name}: ${prim.name ?? `part ${index}`} is a description ("sculpt"): make it a sculpted prim first (the sculpt tool)`);
  if (!kind && !preset2)
    throw new Error(`${name}: no shape ${typeof prim.shape === "string" ? prim.shape : JSON.stringify(prim.shape)}`);
  if (kind)
    warnings.push(...kind.errors.map((error) => `${prim.name ?? `part ${index}`}: ${error}`));
  const texture = prim.material ?? (prim.surface?.texture ? undefined : kind && kindOf(prim.kind).material);
  let surface = texture || prim.surface ? { ...texture && { texture }, ...prim.surface } : null;
  const turn3 = turnOf(prim.turn);
  const at = kind ? add(prim.at, quatRotate(turn3, kind.shift)) : [...prim.at];
  const laid = kind?.lies ? laidOnGround(kind.part, at, turn3, object, groundRadius) : null;
  if (laid)
    Object.assign(kind.part, { params: laid.params, size: laid.size });
  const id = `${objectId}-${index}`;
  const live = prim.live === undefined ? null : liveOf(prim.live);
  if (live)
    surface = surfaceWithLive(surface, id, live);
  return {
    type: "prim",
    id,
    object: objectId,
    shape: [...kind ? kind.part.shape : preset2.shape],
    at: laid?.at ?? at,
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
    ...seatOf(prim),
    ...typeof prim.box === "string" && { box: prim.box },
    ...prim.behaviour && { behaviour: prim.behaviour },
    ...prim.script && { script: typeof prim.script === "string" ? { source: prim.script } : prim.script },
    ...live && { live }
  };
}), placedAgain = (record, standing, moved = [0, 0, 0]) => {
  if (!standing || standing.type !== record.type)
    return record;
  if (record.type === "tree")
    return { ...record, at: standing.at, yaw: standing.yaw };
  if (record.behaviour?.type === "route")
    return { ...record, at: add(record.at, moved) };
  return { ...record, at: standing.at, rotation: standing.rotation };
}, placeBuild = (spec, { groundRadius, bareRadius = groundRadius, materials, id }) => {
  const up = normalize(spec.anchor.at);
  const north = normalize(sub([0, 1, 0], scale(up, up[1])));
  const east = cross2(north, up);
  const heading = spec.anchor.heading * DEG4;
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
  const warnings = [];
  const objects = [];
  const parts = [];
  const names = new Map;
  const addObject = (name, objectId, at, turn3, prims, behaviour, vehicle, origin2, marked, dry, looks) => {
    if (!prims?.length)
      return;
    const rotation = quatNormalize(quatMultiply(frame, turnOf(turn3)));
    const driven = vehicle === undefined ? null : vehicleOf(vehicle);
    if (vehicle !== undefined && !driven)
      warnings.push(`${name}: no vehicle "${vehicle?.type}"`);
    objects.push({ type: "object", id: objectId, name, at, rotation, ...behaviour && { behaviour }, ...driven && { vehicle: driven }, ...looksOf(looks) && { looks: looksOf(looks) }, ...dry === true && { dry: true }, ...origin2 && typeof origin2 === "object" && { origin: origin2 }, ...typeof marked === "string" && { package: marked } });
    parts.push(...partsOf(prims, { name: objectId === id ? spec.name : `${spec.name}#${name}`, objectId, materials, warnings, object: { at, rotation }, groundRadius }));
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
      at: placeOf2(tree.at),
      yaw: wrapYaw(spec.anchor.heading - turn3),
      scale: size,
      ...Object.keys(params).length && { params },
      ...script && { script },
      ...Array.isArray(tree.tint) && { tint: tree.tint },
      ...Number.isFinite(tree.glow) && { glow: tree.glow }
    };
  });
  const own = objects.find((object) => object.id === id) ?? null;
  return { object: own, parts: parts.filter((part) => part.object === id), records: [...objects, ...parts, ...clones, ...trees], warnings, frame: { origin, right, ahead, up } };
};
var init_import = __esm(() => {
  init_params();
  init_kinds();
  init_record();
  init_vehicles();
  init_looks();
  init_seat();
  init_bouncy();
  init_live();
  DEG4 = Math.PI / 180;
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
  const { placeBuild: placeBuild2 } = await Promise.resolve().then(() => (init_import(), exports_import));
  const groundRadius = (dir) => RADIUS + Math.max(groundElevation(dir), SEA);
  for (const build of builds)
    records.push(...placeBuild2(readJson(buildPath(build)), { groundRadius, materials: new Map, id: `local:${build.replace(/\W+/g, "-")}` }).records);
}
var survey = surveySite({ at: place.at, heading, radius, step, records, name });
if (before && before.anchor.heading === heading) {
  const ids = new Set(survey.builds.map((build) => build.id));
  survey.builds.push(...(before.builds ?? []).filter((build) => !ids.has(build.id)));
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
  const table = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0;k < 8; k++)
      c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
    return c >>> 0;
  });
  const crc = (bytes) => {
    let c = 4294967295;
    for (const byte2 of bytes)
      c = table[(c ^ byte2) & 255] ^ c >>> 8;
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
