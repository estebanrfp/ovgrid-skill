#!/usr/bin/env node
// Made by tools/build-skill-repo.js from OVGrid's tools/build-check.js: run with Node 18+ or Bun.
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

// src/math.js
var add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], scale = (a, s) => [a[0] * s, a[1] * s, a[2] * s], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], cross = (a, b) => [
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
  const t = scale(cross(axis, v), 2);
  return add(add(v, scale(t, q[3])), cross(axis, t));
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

// src/build/kinds/mesh.js
var WELD = 1e6, FLAT = 0.000000000001, sub2 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], cross2 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], dot2 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], unit = (v) => {
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
        let same2 = head;
        while (same2 >= 0 && (rounded[same2 * 3] !== rx || rounded[same2 * 3 + 1] !== ry || rounded[same2 * 3 + 2] !== rz))
          same2 = chain[same2];
        if (same2 < 0) {
          chain[v] = head;
          heads.set(hash, v);
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
}, pieceOf = (asset, keep) => {
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
}, addExtrusion = (mesh, profile, axis, from, to, endSlot, slotOf, uvOf) => {
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
}, addPrism = (mesh, profile, x0, x1, endSlot, slotOf, uvOf) => addExtrusion(mesh, profile, 0, x0, x1, endSlot, slotOf, uvOf), remembered = (measure, keep = 16) => {
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
    const scale3 = bending * weight[k];
    for (let i = 0;i < 3; i++) {
      diag[k - 1 + i] += scale3 * coefficients[i] ** 2;
      if (i < 2)
        next[k - 1 + i] += scale3 * coefficients[i] * coefficients[i + 1];
    }
    after[k - 1] += scale3 * coefficients[0] * coefficients[2];
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
  const round = (v) => Math.round(v * 1000) / 1000;
  const stand = grade === null ? null : standOf({ ground, columns, s, half, middle, lean, depth, width, water: wet ? water : null, ends, lies, fill });
  const pinAt = (k, grade2) => [round(middle[k] - groundMiddle[k]), round(grade2), round(lean[k]), ...stand ? [0, 1].map((side) => round(barrierAt(stand, side, s[k] - s[0]))) : []];
  const pins = joints.map((k) => pinAt(k, (middle[k + 1] - middle[k - 1]) / (s[k + 1] - s[k - 1])));
  const n = s.length;
  if (circuit && n > 3) {
    const [d1, d2] = [s[1] - s[0], s[n - 1] - s[n - 2]];
    const g = (middle[1] - middle[n - 2]) / (d1 + d2);
    const h = Math.max(middle[0], middle[n - 1], middle[1] - g * d1) + 0.002;
    const shares = stand ? [0, 1].map((side) => round(Math.max(barrierAt(stand, side, 0), barrierAt(stand, side, s[n - 1] - s[0])))) : [];
    const joint = [round(h - groundMiddle[0]), round(g), round((lean[0] + lean[n - 1]) / 2), ...shares];
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
}, barrierAt = (stand, side, at) => Math.max(0, ...stand.heights[side].map((knots) => shareIn(knots, at))), sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], cross3 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], unit3 = (a) => {
  const length2 = Math.hypot(...a);
  return length2 > 0 ? a.map((v) => v / length2) : a;
}, structureOf = ({ params, sections, stand, ends, polygon, placeAt, level = 3, rail: height = RAIL2, ramped = true }) => {
  const { depth, width, points } = params;
  const closed = points.length > 3 && points[0][0] === points.at(-1)[0] && points[0][1] === points.at(-1)[1];
  const last = sections[0].row.length - 1;
  const decked = (at) => stand.decks.some(([a, b]) => at > a - 0.000001 && at < b + 0.000001);
  const deckOf = (k) => decked((sections[Math.min(k, sections.length - 2)].s + sections[Math.min(k, sections.length - 2) + 1].s) / 2);
  const foot = (deck, section, [x, y, z]) => [x, y, deck ? z - depth : section.bottom];
  const side = (a, b) => cross3(sub3(b, a), [0, 0, 1]);
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
    const left = unit3([offset[0], offset[1], 0]);
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
        const inward = unit3(sub3(other, outer));
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
  const side = (a, b) => cross3(sub3(b, a), [0, 0, 1]);
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
    const inward = unit3(sub3(a.row[last - edge], outerA));
    return { outer, inward, along: unit3(sub3(outerB, outerA)) };
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
      const n = cross(sub(b, a), sub(c, a));
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
  const d1 = dot(ab, ap), d2 = dot(ac, ap);
  if (d1 <= 0 && d2 <= 0)
    return a;
  const bp = sub(p, b), d3 = dot(ab, bp), d4 = dot(ac, bp);
  if (d3 >= 0 && d4 <= d3)
    return b;
  const vc = d1 * d4 - d3 * d2;
  if (vc <= 0 && d1 >= 0 && d3 <= 0)
    return add(a, scale(ab, d1 / (d1 - d3)));
  const cp = sub(p, c), d5 = dot(ab, cp), d6 = dot(ac, cp);
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
  const faces = hullOf(points);
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
  return hullOf(corners.map((v) => points[v]))?.map((face2) => face2.map((i) => corners[i])) ?? null;
}, orientIn = (points) => (a, b, c, p) => {
  const [ax, ay, az] = points[a], [bx, by, bz] = points[b], [cx, cy, cz] = points[c], [px, py, pz] = points[p];
  const ux = bx - ax, uy = by - ay, uz = bz - az, vx = cx - ax, vy = cy - ay, vz = cz - az;
  return (uy * vz - uz * vy) * (px - ax) + (uz * vx - ux * vz) * (py - ay) + (ux * vy - uy * vx) * (pz - az);
}, hullOf = (points) => {
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
  const n = cross(sub(b, a), sub(c, a));
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
    const offset = dot(normal, sub(corners2[0], centre)) - t;
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
    const offset = dot(normal, face2[0]);
    if (offset <= TINY2)
      return null;
    corners.push(add(centre, scale(normal, 1 / offset)));
  }
  return corners.length >= 4 ? keep(Manifold.hull(corners)) : null;
}, hullOf2 = (body, wasm, keep) => {
  const { Manifold } = wasm;
  const points = unpackPoints(body.points, 3).map((p) => p.map((v, k) => v * body.size[k]));
  const ball = body.round ? keep(Manifold.sphere(body.round, ROUND_SIDES2)) : null;
  const outer = keep(Manifold.hull(ball ? points.map((p) => keep(ball.translate(p))) : points));
  if (!body.hollow || !outer.numTri())
    return outer;
  const inner = insetHull(outer, body.hollow, wasm, keep);
  return inner ? keep(outer.subtract(inner)) : outer;
}, revolveUvs = (profile, size) => {
  const across = (size[0] + size[1]) / 2;
  const line = profile.map(([r, z]) => [r * across, z * size[2]]);
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
  const profile = ccw(unpackPoints(body.profile, 2).map(([x, z]) => [Math.max(x, 0), z]));
  const angle = body.angle ?? 360, sides = body.sides ?? SIDES3;
  const solid = keep(keep(Manifold.revolve([profile], angle < 360 ? Math.max(Math.round(sides * angle / 360), 1) : sides, angle)).scale(body.size));
  return { solid, uv: revolveUvs(profile, body.size) };
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
  const ordered = dot(newell(rings[first]), wayAt(first)) < 0 ? rings.map((ring) => [...ring].reverse()) : rings;
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
        const out = cross(sub(positions[b], positions[a]), sub(positions[d], positions[a]));
        if (dot(out, sub(positions[c], positions[a])) > FOLD * length(out)) {
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
      const e1 = normalize(cross(normal, Math.abs(normal[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0])), e2 = cross(normal, e1);
      const flat = ring.map((p) => [dot(sub(p, ring[0]), e1), dot(sub(p, ring[0]), e2)]);
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
      const a = cross(normal, normalize(sub(p, ring[(i + n - 1) % n]))), b = cross(normal, normalize(sub(ring[(i + 1) % n], p)));
      const k = 1 + dot(a, b);
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
    up = normalize(sub(up, scale(way, dot(up, way))));
    const towards = into && out && length(sub(out, into)) > 0.000001 ? normalize(sub(out, into)) : null;
    if (i)
      along += length(sub(path[i], path[i - 1]));
    frames.push({ at: path[i], way, up, side: cross(up, way), along, towards, bend: towards ? Math.min(1 / Math.max(dot(way, out), TINY2), MITRE2) : 1 });
  }
  return frames;
}, ringAt = ({ at, up, side: side2, along, towards, bend }, profile, grows, twist, whole) => {
  const f = whole > 0 ? along / whole : 0;
  const grow = 1 + (grows - 1) * f, turn2 = twist * f * Math.PI / 180;
  const c = Math.cos(turn2), s = Math.sin(turn2);
  return profile.map(([x, y]) => {
    let point = add(scale(side2, (x * c - y * s) * grow), scale(up, (x * s + y * c) * grow));
    if (towards)
      point = add(point, scale(towards, dot(point, towards) * (bend - 1)));
    return add(at, point);
  });
}, sweepUvs = (frames, profile, grows, twist, whole, loop) => {
  const arcs = arcsOf(profile), round = arcs.at(-1);
  const legs = Array.from({ length: loop ? frames.length : frames.length - 1 }, (_, k) => {
    const a = frames[k].at, d = sub(frames[(k + 1) % frames.length].at, a);
    return { a, d, l2: dot(d, d) };
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
    if (Math.abs(dot(normal, normalize(add(A.way, B.way)))) > FACING)
      return null;
    const coords = corners.map((p, i) => {
      const { k, t, q } = near[i];
      const from = frames[k], to = frames[(k + 1) % frames.length];
      const along = from.along + t * ((k + 1 < frames.length ? to.along : whole) - from.along);
      const up = normalize(add(scale(from.up, 1 - t), scale(to.up, t))), side2 = normalize(add(scale(from.side, 1 - t), scale(to.side, t)));
      const f = whole > 0 ? along / whole : 0;
      const grow = Math.max(1 + (grows - 1) * f, 0.001), turn2 = -(twist * f * Math.PI) / 180;
      const x = dot(sub(p, q), side2) / grow, y = dot(sub(p, q), up) / grow;
      return [nearestAlong(profile, arcs, [x * Math.cos(turn2) - y * Math.sin(turn2), x * Math.sin(turn2) + y * Math.cos(turn2)]), along];
    });
    const u = unwrap(coords.map(([u2]) => u2), round);
    return coords.map(([, v], k) => [u[k], v]);
  };
}, sweepOf = (body, wasm, keep) => {
  const path = unpackPoints(body.path, 3).map((p) => p.map((v, k) => v * body.size[k]));
  const [w, h] = body.across ?? ACROSS2;
  const profile = ccw(unpackPoints(body.profile, 2).map(([x, y]) => [x * w, y * h]));
  const loop = body.closed === true;
  const frames = framesOf(path, loop);
  const whole = frames.at(-1).along + (loop ? length(sub(path[0], path.at(-1))) : 0);
  const grows = body.scale ?? 1, twist = body.twist ?? 0;
  const rings = frames.map((frame) => ringAt(frame, profile, grows, twist, whole));
  return { solid: ringsSolid(rings, loop, wasm, keep), uv: sweepUvs(frames, profile, grows, twist, whole, loop) };
}, formOf = (shape, body, wasm, keep) => {
  if (SHAPES.includes(shape))
    return { solid: primitive(shape, body.size, body.sides ?? SIDES3, wasm, keep) };
  if (shape === "hull")
    return { solid: hullOf2(body, wasm, keep) };
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
var MANIFOLD, SHAPES, FORMS2, WAYS, MOST_COLOURS3 = 8, MOST_BODIES = 32, MOST_SMOOTHING = 3, MOST_TRIANGLES = 5000, SIDES3 = 32, AXES, JOINS, GATHER = 1, MOST_CHARACTERS = 3072, REACH = 64, LEAST2 = 0.001, POINTS, ROUND_VERTICES = 38, engine = null, mesher = null, loading = null, loadSolids = () => loading ??= (async () => {
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
}, round = (v) => Math.round(v * 1e4) / 1e4, within2 = (v, least, most) => Math.min(Math.max(v, least), most), triple = (v) => Array.isArray(v) && v.length === 3 && v.every(Number.isFinite), pair = (v) => Array.isArray(v) && v.length === 2 && v.every(Number.isFinite), whole = (v, [least, most]) => Number.isInteger(v) && v >= least && v <= most ? v : 0, metres = (v) => Number.isFinite(v) && v > 0 ? round(within2(v, LEAST2, REACH)) : undefined, pointsOf = (text, dims, [least, most]) => {
  const count = countOf(text, dims);
  return count >= least && count <= most ? text : null;
}, sidesOf = (value, shape) => {
  if (!Number.isInteger(value))
    return;
  const sides = shape === "ball" ? Math.ceil(within2(value, 4, 64) / 4) * 4 : within2(value, 3, 64);
  return sides === SIDES3 ? undefined : sides;
}, scaleOf = (value) => {
  if (Number.isFinite(value))
    return value === 1 ? undefined : round(within2(value, 0, 4));
  if (Array.isArray(value) && value.length === 2 && value.every(Number.isFinite) && value.some((v) => v !== 1))
    return value.map((v) => round(within2(v, 0, 4)));
  return;
}, degreesOf = (value, most) => Number.isFinite(value) && value % 360 !== 0 ? round(within2(value, -most, most)) : undefined, inOrder = (given, kept2) => Object.fromEntries(Object.keys(given).filter((key) => (key in kept2)).map((key) => [key, kept2[key]])), repeatOf = (value) => {
  const count = Number.isInteger(value?.count) && value.count >= POINTS.repeat[0] ? Math.min(value.count, POINTS.repeat[1]) : 0;
  if (!count)
    return;
  const step = triple(value.step) ? value.step.map((v) => round(within2(v, -REACH, REACH))) : undefined;
  const around = degreesOf(value.around, 360);
  if (around === undefined)
    return step && inOrder(value, { count, step });
  const at = pair(value.at) ? value.at.map((v) => round(within2(v, -REACH, REACH)) || 0) : undefined;
  return inOrder(value, { count, ...step?.some((v) => v !== 0) && { step }, around, ...at?.some((v) => v !== 0) && { at } });
}, FACES, CAP2 = 0.999, faceOf = (shape, [x, y, z]) => {
  if (shape === "extrude")
    return z < -CAP2 ? 0 : z > CAP2 ? 1 : 2;
  const [ax, ay, az] = [Math.abs(x), Math.abs(y), Math.abs(z)];
  return ax >= ay && ax >= az ? x > 0 ? 1 : 0 : ay >= az ? y > 0 ? 3 : 2 : z > 0 ? 5 : 4;
}, facesTone = (body, way, slots, back) => {
  const shape = body[way];
  if (!Array.isArray(body.faces) || !FACES[shape])
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
    set("angle", Number.isFinite(body.angle) && body.angle < 360 ? round(within2(body.angle, 1, 360)) : undefined);
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
      own.across = body.across.map((v) => round(within2(v, LEAST2, REACH)));
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
  const turn2 = triple(body.turn) ? body.turn.map((v) => round((v % 360 + 540) % 360 - 180)) : [0, 0, 0];
  const colour = Number.isInteger(body.colour) ? within2(body.colour, 0, MOST_COLOURS3 - 1) : 0;
  const repeat = repeatOf(body.repeat);
  const count = FACES[body[way]];
  const faces = count && Array.isArray(body.faces) && body.faces.length === count && body.faces.every(Number.isInteger) ? body.faces.map((v) => within2(v, 0, MOST_COLOURS3 - 1)) : null;
  const spots = spotsOf(body.spots);
  return inOrder(body, {
    [way]: body[way],
    at: body.at.map((v) => round(within2(v, -REACH, REACH))),
    size: body.size.map((v) => round(within2(v, LEAST2, REACH))),
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
  const points = countOf(body.points, 3), profile = countOf(body.profile, 2);
  const own = shape === "box" ? 12 : shape === "wedge" ? 8 : shape === "ball" ? 8 * (sides / 4) ** 2 : shape === "cylinder" || shape === "cone" ? 4 * sides : shape === "hull" ? 2 * points * (body.round ? ROUND_VERTICES : 1) * (body.hollow ? 2 : 1) : shape === "revolve" ? 2 * profile * sides : shape === "extrude" ? 2 * (body.twist ? Math.min(Math.ceil(Math.abs(body.twist) / 5), 72) + 2 : 2) * [body.profile, ...body.holes ?? []].reduce((sum, text) => sum + countOf(text, 2), 0) : shape === "loft" ? 2 * points * (body.hollow ? 2 : 1) : 2 * profile * (countOf(body.path, 3) + 1);
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
  const profile = twiceArea(ring) < 0 ? [...ring].reverse() : ring;
  const angle = body.angle ?? 360, whole2 = angle >= 360;
  const steps = whole2 ? body.sides ?? SIDES3 : Math.max(Math.round((body.sides ?? SIDES3) * angle / 360), 1);
  const turns = whole2 ? steps : steps + 1;
  const corners = [];
  const at = profile.map(([r, z]) => {
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
    return dot(cross(sub(b, a), sub(c, a)), way) < 0 ? [face2[0], face2[2], face2[1]] : face2;
  };
  profile.forEach(([r0, z0], j) => {
    const k = (j + 1) % profile.length, [r1, z1] = profile[k];
    for (let i = 0;i < steps; i++) {
      const next = whole2 ? (i + 1) % steps : i + 1, phi = angle * (i + 0.5) / steps * Math.PI / 180;
      const way = [(z1 - z0) * Math.cos(phi), (z1 - z0) * Math.sin(phi), r0 - r1];
      for (const face2 of [[at[j][i], at[k][i], at[k][next]], [at[j][i], at[k][next], at[j][next]]])
        if (new Set(face2).size === 3)
          faces.push(facing(face2, way));
    }
  });
  if (!whole2) {
    const { triangles } = triangulateWithHoles(profile);
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
    const n = cross(sub(b, a), sub(c, a));
    return dot(n, sub(middle, a)) > 0 ? [face2[0], face2[i + 2], face2[i + 1]] : [face2[0], face2[i + 1], face2[i + 2]];
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
  FACES = Object.freeze({ box: 6, extrude: 3 });
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
var SAMPLE = 1, MOST_CHORD = 60, GRADE2 = 8, SEAT = 1.2, FREEBOARD2 = 0.3, BURIED = 0.3, RAIL3 = 1.05, STEP_UP = 0.3, BURIED_END = 1, round2 = (v, places = 3) => Math.round(v * 10 ** places) / 10 ** places, clamp3 = (v, least, most) => Math.min(Math.max(v, least), most), longestSpan = (plan) => plan.spans.length ? Math.max(...plan.spans.map((span) => span.s1 - span.s0)) : plan.length, thickOf = (style, each) => {
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
  return { rise: round2(Math.max(rise, 0), 2), roomA: round2(Math.max(roomA, 0), 1), roomB: round2(Math.max(roomB, 0), 1), short: round2(short, 1) };
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
      plan.reasons.push(`too long: ${round2(length2, 1)} m, a bridge is ${MOST_CHORD} m at most`);
    if (style.widest && params.width > style.widest + 0.000001)
      plan.reasons.push(`too wide: ${round2(params.width, 1)} m, ${style.label.toLowerCase()} are ${style.widest} m at most`);
    const drop = Math.abs(params.points[1][2] - params.points[0][2]) / length2;
    if (drop > 1 / GRADE2 + 0.000001)
      plan.reasons.push(`too steep: 1 in ${round2(1 / drop, 1)}, at most 1 in ${GRADE2}`);
    if (count < 2)
      return finish();
    const positions = Array.from({ length: count }, (_, i) => length2 * i / (count - 1));
    const clearance = positions.map((s, i) => deck(s) - params.ground[i]);
    const buried = positions.reduce((worst, s, i) => s > SEAT && s < length2 - SEAT && -clearance[i] > worst.over ? { over: -clearance[i], s } : worst, { over: BURIED, s: 0 });
    if (buried.over > BURIED)
      plan.reasons.push(`a rise in the way: the ground stands ${round2(buried.over, 1)} m over the deck at ${round2(buried.s, 1)} m`);
    [[0, "A"], [count - 1, "B"]].forEach(([i, name]) => {
      if (clearance[i] >= style.least)
        return;
      if (clearance[i] > STEP_UP)
        plan.reasons.push(`a step of ${round2(clearance[i], 1)} m up onto the deck at ${name}: at most ${STEP_UP} m`);
      else if (clearance[i] < -BURIED_END)
        plan.reasons.push(`the deck is buried ${round2(-clearance[i], 1)} m at ${name}`);
    });
    const first = clearance.findIndex((v) => v >= style.least);
    const last = clearance.findLastIndex((v) => v >= style.least);
    if (first < 0) {
      const deepest2 = Math.max(...clearance);
      plan.reasons.push(deepest2 >= 0.5 ? `too shallow for ${style.label.toLowerCase()}: the ground is ${round2(deepest2, 1)} m under the deck at most, they need ${style.least} m` : "nothing to cross");
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
      plan.reasons.push(`a pier ${round2(tallest, 1)} m tall: ${style.label.toLowerCase()} stand at most ${style.maxPier} m`);
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
  const along = unit(sub2(b, a));
  const side2 = unit(cross2(along, Math.abs(along[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0]));
  const over = cross2(along, side2);
  const round3 = (p) => Array.from({ length: sides }, (_, k) => {
    const angle = 2 * Math.PI * k / sides;
    const [c, s] = [Math.cos(angle) * radius, Math.sin(angle) * radius];
    return [p[0] + side2[0] * c + over[0] * s, p[1] + side2[1] * c + over[1] * s, p[2] + side2[2] * c + over[2] * s];
  });
  const [from, to] = [round3(a), round3(b)];
  const arc = 2 * Math.PI * radius / sides;
  for (let k = 0;k < sides; k++) {
    const next = (k + 1) % sides;
    const angle = 2 * Math.PI * (k + 0.5) / sides;
    const out = [0, 1, 2].map((i) => side2[i] * Math.cos(angle) + over[i] * Math.sin(angle));
    mesh.polygon(slot, [from[k], from[next], to[next], to[k]], out, [[k * arc, 0], [(k + 1) * arc, 0], [(k + 1) * arc, length2], [k * arc, length2]]);
  }
  const end = (ring, outward) => mesh.polygon(slot, ring, outward, ring.map((p) => [dot2(sub2(p, a), side2), dot2(sub2(p, a), over)]));
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
var SIDES4, PLANKS = 0.12, CAP3 = 0.17, POST2 = 0.09, REACH2 = 5, ROPE = 0.025, HANDS = 0.95, SAG = 0.13, lanesOf = (width, radius) => {
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
      const bays = Math.max(1, Math.ceil((s1 - s0) / REACH2));
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
var ARCH, PARAPET = 0.35, HEIGHT = 0.9, LOW = 0.45, SPRING = 0.5, REACH3, curveOf = (left, right, spring, rise, n, pointed = false) => {
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
    const spring = Math.max(top - clear * (REACH3[arch2] ?? REACH3[0]), high + SPRING, left.foot + 0.3, right.foot + 0.3);
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
  REACH3 = [0.5, 0.8, 0.25];
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

// tools/build-check.js
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
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
var clamp2 = (value, min, max) => Math.min(Math.max(value, min), max);
var byte = { min: 0, max: 255, encode: (v) => Math.trunc(v), decode: (u) => u };
var cut = { min: 0, max: 65535, encode: (v) => roundAway(v * CUT), decode: (u) => u / CUT };
var cutEnd = { min: 0, max: 65535, encode: (v) => CUT - roundAway(v * CUT), decode: (u) => (CUT - u) / CUT };
var scale2 = { min: 0, max: 255, encode: (v) => 200 - roundAway(v * 100), decode: (u) => (200 - u) / 100 };
var signed = { min: -128, max: 127, encode: (v) => roundAway(v * 100), decode: (s) => s / 100 };
var revolutions = { min: 0, max: 255, encode: (v) => roundAway((v - 1) * 200 / 3), decode: (u) => (200 + 3 * u) / 200 };
var shear = {
  min: 0,
  max: 255,
  encode: (v) => ((s) => s < 0 ? s + 256 : s)(clamp2(roundAway(v * 100), -128, 127)),
  decode: (u) => (u < 128 ? u : u - 256) / 100
};
var CODECS = [byte, cut, cutEnd, cut, byte, cut, cutEnd, scale2, scale2, shear, shear, signed, signed, signed, signed, signed, revolutions, signed];
var CODEC = Object.fromEntries(SHAPE_FIELDS.map((name, i) => [name, CODECS[i]]));
var snap = (name, value) => CODEC[name].decode(CODEC[name].encode(value));
var decodeShape = (shape) => Object.fromEntries(SHAPE_FIELDS.map((name, i) => [name, CODECS[i].decode(shape[i])]));
var encodeShape = (params) => SHAPE_FIELDS.map((name, i) => {
  const value = Number.isFinite(params[name]) ? params[name] : DEFAULT_PARAMS[name];
  return clamp2(CODECS[i].encode(value), CODECS[i].min, CODECS[i].max);
});
var constrainParams = (input) => {
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

// src/build/kinds/index.js
init_mesh();
init_ready();

// src/build/kinds/rock.js
init_mesh();
var BOX = [-0.5, -0.5, -0.5];
var FORMS = ["boulder", "crag", "layered", "pile", "crystals", "arch", "passage", "outcrop"];
var [BOULDER, CRAG, LAYERED, PILE, CRYSTALS, PASSAGE, OUTCROP] = [0, 1, 2, 3, 4, 6, 7];
var SIDES = [6, 8, 12, 16];
var CRAG_SIDES = [8, 12, 20, 28];
var BAND_SIDES = [6, 8, 12, 16];
var STONE_SIDES = [4, 5, 6, 8];
var PRISM_SIDES = [4, 4, 6, 6];
var PRISMS_DRAWN = [0.5, 0.75, 1, 1];
var STONE_UNDER = [6, 6, 8, 10];
var PIECE_SIDES = [4, 6, 8, 10];
var FINEST = 3;
var DEG = Math.PI / 180;
var KEEP = 64;
var kept = new Map;
var keptAs = (key, make) => {
  if (kept.has(key))
    return kept.get(key);
  const value = make();
  kept.set(key, value);
  if (kept.size > KEEP)
    kept.delete(kept.keys().next().value);
  return value;
};
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
var normalized = ([x, y, z]) => {
  const length2 = Math.hypot(x, y, z) || 1;
  return [x / length2, y / length2, z / length2];
};
var crossOf = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
var BODIES = {
  [BOULDER]: { chips: [6, 10], depth: [0.08, 0.24], square: 0.5, upright: 1.6, ribs: 0 },
  [CRAG]: { chips: [10, 14], depth: [0.06, 0.3], square: 0.65, upright: 0.55, ribs: 0.07 }
};
var sampled = ({ roughness, elongation }, seed, n, floor, body = BODIES[BOULDER]) => {
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
      const round = column / n * 2 * Math.PI;
      const dx = along, dy = across * Math.cos(round), dz = across * Math.sin(round);
      const blocky = 1 - body.square + body.square / Math.cbrt(Math.abs(dx) ** 3 + Math.abs(dy) ** 3 + Math.abs(dz) ** 3);
      const ribs = body.ribs ? body.ribs * roughness * noise(dx * 8 + 5, dy * 8 + 5, dz * 1.1 + 5, seed + 211) : 0;
      const radius = 0.5 * blocky * (1 + lumps * fbm(dx * 1.6 + 11, dy * 1.6 + 11, dz * body.upright + 11, seed, 3, 0.5) + rough * fbm(dx * 7 + 3, dy * 7 + 3, dz * 7 + 3, seed + 101, 2, 0.6) + ribs);
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
var boundsOf = (points) => {
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0;i < points.length; i += 3) {
    for (let k = 0;k < 3; k++) {
      min[k] = Math.min(min[k], points[i + k]);
      max[k] = Math.max(max[k], points[i + k]);
    }
  }
  return { min, max };
};
var intoBox = (points, { min, max }) => {
  for (let i = 0;i < points.length; i += 3) {
    for (let k = 0;k < 3; k++)
      points[i + k] = Math.min(Math.max((points[i + k] - min[k]) / (max[k] - min[k]) - 0.5, -0.5), 0.5);
  }
  return points;
};
var coverOf = (cover, { min, max }) => {
  if (!(cover > 0))
    return () => 0;
  const reach = min.map((v, k) => max[k] - v || 1), least = 1 - 1.25 * cover;
  return ([x, y, z]) => {
    const bx = x / reach[0], by = y / reach[1], bz = z / reach[2];
    return bz / (Math.hypot(bx, by, bz) || 1) > least ? 1 : 0;
  };
};
var addGrid = (mesh, points, n, rounded, slotOf) => {
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
};
var addFacet = (mesh, slotOf, a, b, c) => {
  const facet = normalized(crossOf([b[0] - a[0], b[1] - a[1], b[2] - a[2]], [c[0] - a[0], c[1] - a[1], c[2] - a[2]]));
  const slot = slotOf(facet);
  mesh.triangle(slot, ...[a, b, c].map((p) => mesh.vertex(slot, p, facet, boxUv(p, facet, BOX, 1, 1))));
};
var bodyBox = (params, seed) => keptAs(`body|${params.form}|${seed}|${params.roughness}|${params.elongation}|${params.base}`, () => {
  const body = BODIES[params.form];
  const points = sampled(params, seed, (params.form === CRAG ? CRAG_SIDES : SIDES)[FINEST], -Infinity, body);
  let low = Infinity;
  for (let i = 2;i < points.length; i += 3)
    low = Math.min(low, points[i]);
  const floor = low * (1 - params.base);
  for (let i = 2;i < points.length; i += 3)
    points[i] = Math.max(points[i], floor);
  return { floor, ...boundsOf(points) };
});
var bodyMesh = (params, seed, level) => {
  const n = (params.form === CRAG ? CRAG_SIDES : SIDES)[level];
  const box = bodyBox(params, seed);
  const points = intoBox(sampled(params, seed, n, box.floor, BODIES[params.form]), box);
  const mesh = createMesh(2);
  addGrid(mesh, points, n, params.edges, coverOf(params.cover, box));
  return mesh.pack([1, 1, 1]);
};
var bandsOf = ({ layers, roughness }, seed) => keptAs(`bands|${seed}|${layers}|${roughness}`, () => {
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
});
var ringsOf = (params, seed, n, bulge) => {
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
        const outline = square * (1 + lumps * fbm(c * 1.3 + 7, s * 1.3 + 7, (band.from + band.to) * 1.6, seed, 2, 0.5));
        const radius = 0.5 * band.scale * widen * outline * (1 + 0.05 * roughness * noise(c * 5 + 2, s * 5 + 2, z * 7, seed + 31));
        points[j * 3] = (band.shift[0] + radius * Math.cos(angle)) * stretch;
        points[j * 3 + 1] = band.shift[1] + radius * Math.sin(angle);
        points[j * 3 + 2] = z;
      }
      rings.push({ band: b, foot: r === 0, points });
    });
  });
  return rings;
};
var middleOf = (ring, rise = 0) => {
  const count = ring.points.length / 3, middle = [0, 0, ring.points[2] + rise];
  for (let i = 0;i < ring.points.length; i += 3) {
    middle[0] += ring.points[i] / count;
    middle[1] += ring.points[i + 1] / count;
  }
  return middle;
};
var layeredMesh = (params, seed, level) => {
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
      const round = [0, 1, 2].map((k) => at(low, j + 1)[k] - at(low, j + n - 1)[k]);
      return normalized(crossOf(round, along));
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
};
var stonesOf = ({ stones, roughness, elongation }, seed) => keptAs(`stones|${seed}|${stones}|${roughness}|${elongation}`, () => {
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
});
var pileGrids = (params, seed, n, floor) => stonesOf(params, seed).map((stone) => {
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
});
var pileMesh = (params, seed, level) => {
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
};
var crystalsOf = ({ crystals, roughness, elongation }, seed) => keptAs(`crystals|${seed}|${crystals}|${roughness}|${elongation}`, () => {
  const random = randomOf(seed ^ 668265263);
  const stretch = 1 + 2 * elongation, spread = 0.6 + 0.8 * roughness;
  return Array.from({ length: crystals }, (_, i) => {
    const t = crystals > 1 ? i / (crystals - 1) : 0;
    const length2 = (1 - 0.72 * t ** 0.8) * (0.85 + 0.3 * random());
    const radius = length2 * (0.13 + 0.07 * random());
    const angle = random() * 2 * Math.PI;
    const distance = 0.32 * (0.1 + 0.9 * t ** 0.7) * (0.7 + 0.3 * random());
    const fallen = t > 0.6 && random() < 0.15;
    const lean = fallen ? (75 + 12 * random()) * DEG : (4 + 46 * t) * (0.6 + 0.8 * random()) * spread * DEG;
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
});
var prismOf = (crystal, sides) => {
  const { foot, axis, length: length2, radius, point, widths, turn: turn2, off, fallen } = crystal;
  const across = normalized(crossOf(axis, Math.abs(axis[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0])), side = crossOf(axis, across);
  const along = (distance, x = 0, y = 0) => [0, 1, 2].map((k) => foot[k] + axis[k] * distance + across[k] * x + side[k] * y);
  const ring = (distance) => Array.from({ length: sides }, (_, j) => {
    const angle = turn2 + j / sides * 2 * Math.PI, width = radius * widths[Math.floor(j * 6 / sides)];
    return along(distance, Math.cos(angle) * width, Math.sin(angle) * width);
  });
  const base = fallen ? point * 0.8 : 0;
  return { feet: ring(base), shoulders: ring(length2 - point), tip: along(length2, ...off), heel: along(0) };
};
var stoneUnder = (params, seed, n) => {
  const points = sampled({ roughness: 0.6, elongation: params.elongation }, seed + 7, n, -Infinity);
  for (let i = 0;i < points.length; i += 3) {
    points[i] *= 0.85;
    points[i + 1] *= 0.85;
    points[i + 2] = Math.max(points[i + 2] * 0.22 + 0.02, 0);
  }
  return points;
};
var crystalsMesh = (params, seed, level) => {
  const sides = PRISM_SIDES[level];
  const crystals = crystalsOf(params, seed);
  const box = keptAs(`cluster|${seed}|${params.crystals}|${params.roughness}|${params.elongation}`, () => {
    const prisms = crystals.map((crystal2) => prismOf(crystal2, PRISM_SIDES[FINEST]));
    const all = [...prisms.flatMap(({ feet, shoulders, tip, heel }) => [...feet, ...shoulders, tip, heel]).flat(), ...stoneUnder(params, seed, STONE_UNDER[FINEST])];
    for (let i = 2;i < all.length; i += 3)
      all[i] = Math.max(all[i], 0);
    return boundsOf(all);
  });
  const unit2 = (p) => Array.from(intoBox(new Float64Array([p[0], p[1], Math.max(p[2], 0)]), box));
  const mesh = createMesh(2);
  const crystal = () => 0;
  for (const each of crystals.slice(0, Math.ceil(crystals.length * PRISMS_DRAWN[level]))) {
    const { feet, shoulders, tip, heel } = prismOf(each, sides);
    const [down, up, point, foot] = [feet.map(unit2), shoulders.map(unit2), unit2(tip), unit2(heel)];
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
};
var formationOf = ({ form, stones, roughness, elongation }, seed) => keptAs(`formation|${form}|${seed}|${stones}|${roughness}|${elongation}`, () => {
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
});
var stoneGrid = (params, stone, n) => {
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
};
var setDown = (points, dz) => {
  for (let i = 2;i < points.length; i += 3)
    points[i] = Math.max(points[i] + dz, 0);
  return points;
};
var lowest = (points) => {
  let low = Infinity;
  for (let i = 2;i < points.length; i += 3)
    low = Math.min(low, points[i]);
  return low;
};
var grounded = (points, stone) => setDown(points, -lowest(points) - 0.04 * stone.height);
var lintelDrop = (params, seed) => keptAs(`lintel|${params.form}|${seed}|${params.stones}|${params.roughness}|${params.elongation}`, () => {
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
});
var formationGrids = (params, seed, n) => formationOf(params, seed).map((stone) => {
  const points = stoneGrid(params, stone, n);
  return stone.rests ? setDown(points, lintelDrop(params, seed)) : grounded(points, stone);
});
var formationBox = (params, seed) => keptAs(`formation-box|${params.form}|${seed}|${params.stones}|${params.roughness}|${params.elongation}`, () => {
  const grids = formationGrids(params, seed, PIECE_SIDES[FINEST]);
  const all = new Float64Array(grids.reduce((sum, grid) => sum + grid.length, 0));
  grids.reduce((offset, grid) => (all.set(grid, offset), offset + grid.length), 0);
  return boundsOf(all);
});
var formationMesh = (params, seed, level) => {
  const n = PIECE_SIDES[level], box = formationBox(params, seed);
  const slotOf = coverOf(params.cover, box);
  const mesh = createMesh(2);
  for (const grid of formationGrids(params, seed, n))
    addGrid(mesh, intoBox(grid, box), n, params.edges, slotOf);
  return mesh.pack([1, 1, 1]);
};
var piecesHulls = (params, seed, size) => {
  const key = `rock|${params.form}|${seed}|${params.stones}|${params.roughness}|${params.elongation}`;
  const box = formationBox(params, seed);
  return formationGrids(params, seed, PIECE_SIDES[1]).map((grid, i) => ({ type: "hull", key: `${key}#${i}`, points: Float32Array.from(intoBox(grid, box)), scale: [...size] }));
};
var MESHES = [bodyMesh, bodyMesh, layeredMesh, pileMesh, crystalsMesh, bodyMesh, formationMesh, formationMesh];
var notCrystals = ({ form }) => form !== CRYSTALS;
var rock = Object.freeze({
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

// src/build/kinds/bevel.js
init_mesh();
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
init_mesh();
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
init_mesh();
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
init_mesh();
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
init_mesh();
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
init_mesh();
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
init_mesh();
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
init_mesh();
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
init_mesh();
init_ready();
var LIFT = 0.1;
var EVERY = 1;
var ACROSS = 1.5;
var SAMPLES = 2048;
var STRIDES = [8, 4, 2, 1];
var MITRE = 3;
var FILL = 2;
var FALL = 2;
var GUARDRAIL_STEEL = "metal/bare/metal-0025";
var GRADE = 30;
var PIN_RISE = 32;
var PIN_SLOPE = 2;
var leveller = null;
var levelling = null;
var whenLevelled = () => levelling ??= Promise.resolve().then(() => (init_road_level(), exports_road_level)).then((module) => {
  leveller = module;
  if (!HERE)
    tellKind("road");
  return module;
}, (error) => {
  levelling = null;
  console.error("levelled roads unavailable (asked for again when one is drawn):", error);
  throw error;
});
if (HERE)
  await whenLevelled();
var levelledOf = (params) => params.level > 0 && params.ground.length > 0;
var keepPin = (pin) => pin === "ground" ? pin : Array.isArray(pin) && (pin.length === 3 || pin.length === 5) && pin.every(Number.isFinite) && Math.abs(pin[0]) <= PIN_RISE && Math.abs(pin[1]) <= PIN_SLOPE && Math.abs(pin[2]) <= PIN_SLOPE && pin.slice(3).every((v) => v >= 0 && v <= 1) ? pin.map((v) => Math.round(v * 1000) / 1000) : null;
var keepEnds = (value) => {
  const ends = Array.isArray(value) && value.length === 2 ? value.map(keepPin) : [];
  return ends.some(Boolean) ? ends : [];
};
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
var ROUND3 = 6;
var ARC = 8 * Math.PI / 180;
var SHARP = 15 * Math.PI / 180;
var roundCorners = (points, width, { least = 0.02, heightAt = null } = {}) => {
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
};
var roundsOf = (params) => params.round > 0 || params.grade !== undefined;
var roundedOf = remembered(({ points, width }) => {
  const path = roundCorners(points, width, { least: SHARP });
  return path.length === points.length ? null : path;
});
var totalOf = (points) => points.slice(1).reduce((sum, to, i) => sum + Math.hypot(to[0] - points[i][0], to[1] - points[i][1]), 0);
var pathOf = (params) => {
  const path = roundsOf(params) ? roundedOf({ points: params.points, width: params.width }) : null;
  if (!path)
    return params.points;
  if (!params.ground?.length)
    return path;
  return columnsOf(params, totalOf(path)) || !columnsOf(params, totalOf(params.points)) ? path : params.points;
};
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
var groundSites = (params) => {
  const points = pathOf(params);
  const { width } = params;
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
var levelOf = remembered((params) => {
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
var samplesOf = (params) => {
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
};
var sectionsOf = (params, level) => {
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
};
var standingOf = (params) => levelledOf(params) && leveller ? levelOf(params)?.stand ?? null : null;
var placerOf = (params) => {
  const points = pathOf(params);
  const { width } = params;
  const [lengths, closed] = [lengthsOf(points), closedOf(points)];
  return (s) => sectionAt(lengths, closed, width, s);
};
var footprintOf2 = remembered((params) => {
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
var centreOf2 = (params) => {
  const { min, max } = footprintOf2(params);
  return min.map((v, k) => (v + max[k]) / 2);
};
var upToMillimetre2 = (v) => Math.ceil(v * 1000 - 0.000001) / 1000;
var road = Object.freeze({
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
    const scale3 = [0, 1].map((k) => spread[k] > 0.000000001 ? Math.max(size[k] - (max[k] - min[k] - spread[k]), 0) / spread[k] : 1);
    const depth = params.depth + size[2] - (max[2] - min[2]);
    return { ...params, width, depth, points: params.points.map(([x, y, z]) => [x * scale3[0], y * scale3[1], z]) };
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
        const normal = unit(cross2(sub2(row[Math.min(j + 1, last)], row[Math.max(j - 1, 0)]), sub2(after[j], before[j])));
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
      mesh.polygon(1, [aLeft, down(a, aLeft), down(b, bLeft), bLeft], cross2(sub2(bLeft, aLeft), [0, 0, 1]).map((v) => -v), [[a.s, 0], [a.s, drop(a, aLeft)], [b.s, drop(b, bLeft)], [b.s, 0]]);
      mesh.polygon(1, [aRight, bRight, down(b, bRight), down(a, aRight)], cross2(sub2(bRight, aRight), [0, 0, 1]), [[a.s, 0], [b.s, 0], [b.s, drop(b, bRight)], [a.s, drop(a, aRight)]]);
    }
    if (!closed) {
      for (const [section, sign] of [[sections[0], -1], [sections.at(-1), 1]]) {
        const { row } = section;
        const outward = cross2(sub2(row[0], row[last]), [0, 0, 1]).map((v) => v * sign);
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
          const normal = cross2(sub2(points[i], points[hub]), sub2(points[i + 1], points[hub]));
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
          const facing = cross2(sub2(row[1], row[0]), [0, 0, -1]);
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

// src/build/kinds/index.js
init_bridge();
init_lantern();

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

// src/build/kinds/blocks.js
init_mesh();
var VERSION = 1;
var MOST_COLOURS = 8;
var MOST_BYTES = 32768;
var MOST_CELLS = 32768;
var MOST_BOXES = 2048;
var decodeBlocks = (text) => {
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
};
var meshBlocks = ({ planes, boxes }, size, slots) => {
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
      for (let layer = 0;layer < na; layer++) {
        const next = layer + sign;
        const open = next < 0 || next >= na;
        for (let b = 0;b < nq; b++)
          for (let a = 0;a < np; a++) {
            const c = layer * strides[axis] + a * strides[p] + b * strides[q];
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
            const level = metres[axis][layer + (sign > 0 ? 1 : 0)];
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
};
var made = new Map;
var MADE = 16;
var meshedOf = (text, colours, size) => {
  const key = `${colours}:${size.join(",")}:${text}`;
  if (made.has(key))
    return made.get(key);
  const read = decodeBlocks(text) ?? { planes: [[0, 1], [0, 1], [0, 1]], boxes: [{ lo: [0, 0, 0], hi: [1, 1, 1], colour: 0 }] };
  const mesh = meshBlocks(read, size, colours + 1);
  made.set(key, mesh);
  if (made.size > MADE)
    made.delete(made.keys().next().value);
  return mesh;
};
var colourOptions = Array.from({ length: MOST_COLOURS }, (_, i) => `${i + 1} colour${i ? "s" : ""}`);
var blocks = Object.freeze({
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

// src/build/kinds/outline.js
init_mesh();
var VERSION2 = 1;
var MOST_COLOURS2 = 8;
var MOST_POINTS = 512;
var MOST_RINGS = 64;
var MOST_BYTES2 = 4096;
var SPAN2 = 65535;
var LEAST = 0.000000000001;
var decodeOutline = (text) => {
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
};
var area22 = (points) => points.reduce((sum, [x, y], i) => {
  const [nx, ny] = points[(i + 1) % points.length];
  return sum + x * ny - nx * y;
}, 0);
var within = ([x, y], points) => {
  let odd = false;
  for (let i = 0, j = points.length - 1;i < points.length; j = i++) {
    const [ax, ay] = points[i], [bx, by] = points[j];
    if (ay > y !== by > y && x < ax + (y - ay) * (bx - ax) / (by - ay))
      odd = !odd;
  }
  return odd;
};
var inTriangle = ([px, py], [ax, ay], [bx, by], [cx, cy]) => {
  const d1 = (px - bx) * (ay - by) - (ax - bx) * (py - by);
  const d2 = (px - cx) * (by - cy) - (bx - cx) * (py - cy);
  const d3 = (px - ax) * (cy - ay) - (cx - ax) * (py - ay);
  return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
};
var bridged = (ring, hole) => {
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
};
var meshOutline = ({ top, bottom, rings }, size, slots) => {
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
};
var made2 = new Map;
var MADE2 = 16;
var meshedOf2 = (text, colours, size) => {
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
};
var colourOptions2 = Array.from({ length: MOST_COLOURS2 }, (_, i) => `${i + 1} colour${i ? "s" : ""}`);
var outline = Object.freeze({
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

// src/build/kinds/index.js
init_solid();
var DECLARED = { rock, bevel, stairs, door, window: windowKind, roof, column, arch, fence, road, bridge, lantern, sculpt, blocks, outline, solid };
var LATER = Object.freeze({
  bridge: { file: "./bridge-gen.js", load: () => Promise.resolve().then(() => (init_bridge_gen(), exports_bridge_gen)) }
});
var RETRY = 5000;
var TRIES = 6;
var loaded = new Map;
var loading2 = new Map;
var failed = new Map;
var held = null;
var KINDS = Object.freeze(Object.defineProperties({}, Object.fromEntries(Object.keys(DECLARED).map((name) => [name, { enumerable: true, get: () => loaded.get(name) ?? DECLARED[name] }]))));
var BIAS = [0.5, 0.5, 0.5];
var UNIT_BOX = [1, 1, 1];
var MIN_SIZE = 0.01;
var MAX_SIZE = 64;
var KEEP2 = 8;
var kindOf = (name) => typeof name === "string" && Object.hasOwn(DECLARED, name) ? loaded.get(name) ?? DECLARED[name] : null;
var kindReady = (name) => Object.hasOwn(DECLARED, name) && (!Object.hasOwn(LATER, name) || loaded.has(name));
var loadKind = (name) => {
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
};
var loadKinds = (names) => Promise.all([...new Set(names)].map(loadKind));
var lost = (name) => failed.has(name) && performance.now() < failed.get(name).until;
var decimals = (step) => Math.max(0, Math.ceil(-Math.log10(step) - 0.000000001));
var constrain = (param, value) => {
  const given = typeof value === "string" && param.options ? param.options.indexOf(value) : value;
  if (!Number.isFinite(given) || param.options && given < 0)
    return param.default;
  const within3 = Math.min(Math.max(given, param.min), param.max);
  const stepped = Number(Math.min(param.min + Math.round((within3 - param.min) / param.step) * param.step, param.max).toFixed(decimals(param.step)));
  return param.retired?.includes(param.options?.[stepped]) ? param.default : stepped;
};
var written = (value) => Array.isArray(value) ? value.map((point) => Array.isArray(point) && point.length === 2 ? [...point, 0] : point) : value;
var defaultOf = (param) => param.points ? param.default.map((point) => [...point]) : param.heights ? [...param.default] : param.list ? structuredClone(param.default) : param.default;
var constrainBytes = (param, value) => typeof value === "string" && value.length <= param.bytes && value.length % 4 === 0 && /^[A-Za-z0-9+/]*={0,2}$/.test(value) && (!param.valid || param.valid(value)) ? value : param.default;
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
  const kept2 = (Array.isArray(value) ? value : []).filter(Number.isFinite).slice(0, param.heights[1]).map((v) => constrain(param, v));
  return kept2.length >= param.heights[0] ? kept2 : defaultOf(param);
};
var pointsWithin = (value, { least = 0, most = Infinity, min, max, step, horizontal = false, handles = false }) => {
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
};
var looksOfKind = (name, params) => {
  const kind = kindOf(name);
  const by = kind?.looks && kind.params.find((param) => param.name === kind.lookedBy);
  const own = by && kind.looks[by.options[constrainKind(name, params).params[by.name]]];
  return own ? Object.entries(own).map(([look, materials]) => ({ name: look, label: kind.lookLabels?.[look] ?? look, materials })) : [];
};
var materialsOf = (name, params, look = null) => {
  const looks = looksOfKind(name, params);
  return (looks.find((each) => each.name === look) ?? looks[0])?.materials ?? null;
};
var seedOf = (seed) => Number.isInteger(seed) ? Math.abs(seed) % 2147483648 : 0;
var within3 = (size) => size.map((v) => Math.min(Math.max(v, MIN_SIZE), MAX_SIZE));
var clean = (size) => size.map((v) => Math.round(v * 1e6) / 1e6);
var resolve = (value, params) => typeof value === "function" ? value(params) : value;
var fitSize = ({ kind, params, size }) => {
  const type = kindOf(kind);
  return type?.fit ? clean(within3(type.fit(constrainKind(kind, params).params, size))) : [...size];
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
  const moved = Object.fromEntries(type.params.filter((param) => (param.points || param.heights) && values[param.name] !== undefined).map((param) => [param.name, param.points ? values[param.name].map((point) => point.map((v, k) => v - shift[k])) : values[param.name].map((v) => v - shift[2])]));
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
  const kept2 = wholes.get(name);
  if (kept2)
    return kept2;
  if (wholes.size >= KEEP2)
    wholes.delete(wholes.keys().next().value);
  const whole2 = make();
  wholes.set(name, whole2);
  return whole2;
};
var kindMesh = ({ kind, params, seed, size } = {}) => {
  const type = kindOf(kind);
  if (!type)
    return null;
  const values = constrainKind(kind, params).params;
  const grain = type.seeded ? seedOf(seed) : 0;
  const box = type.sized ? within3(size ?? type.size).map((v) => Number(v.toFixed(3))) : null;
  const shaping = type.params.filter((param) => !param.pose && !(param.optional && values[param.name] === undefined));
  const recipe = [kind, shaping.map((param) => param.points || param.heights ? JSON.stringify(values[param.name]) : param.bytes ? hashOf(values[param.name]) : param.list ? hashOf(JSON.stringify(values[param.name])) : values[param.name]).join(","), ...type.seeded ? [grain] : [], ...box ? [box.join(",")] : []].join(":");
  const here = kindReady(kind);
  if (!here && !lost(kind))
    loadKind(kind).catch(() => {});
  const key = !here || type.waiting?.(values, box, recipe) ? `${recipe}:waiting` : recipe;
  if (!here)
    return { key, bias: BIAS, mesh: () => ({ ...createMesh(resolve(type.faces, values).length).pack(box ?? UNIT_BOX), bounds: { min: [-0.5, -0.5, -0.5], max: [0.5, 0.5, 0.5] } }) };
  const bias = resolve(type.bias, values) ?? BIAS;
  if (!type.moving)
    return { key, bias, mesh: (level) => type.mesh(values, grain, level, box, key) };
  const poses = type.params.filter((param) => param.pose);
  const rest = { ...values, ...Object.fromEntries(poses.map((param) => [param.name, param.default])) };
  const posed = { ...values, ...Object.fromEntries(poses.map((param) => {
    const given = params?.[param.name];
    return [param.name, Number.isFinite(given) ? Math.min(Math.max(given, param.min), param.max) : values[param.name]];
  })) };
  const whole2 = (level) => wholeOf(`${key}@${level}`, () => type.mesh(rest, grain, level, box));
  const moved = new Set(type.moving.flatMap((piece) => piece.faces));
  return {
    key,
    bias,
    mesh: (level) => pieceOf(whole2(level), (face2) => !moved.has(face2)),
    moving: type.moving.map((piece, i) => ({ key: `${key}#${i}`, mesh: (level) => pieceOf(whole2(level), (face2) => piece.faces.includes(face2)), turn: turnOf(piece.turn(posed, box)) }))
  };
};
if (HERE)
  await loadKinds(Object.keys(LATER));
// src/build/edit/companions.js
var companionsOf = (record) => {
  const kind = record?.kind && kindOf(record.kind);
  if (!kind?.companions)
    return [];
  return kind.companions(record.params).map(({ kind: name, at, yaw = 0, size, color, surface, light }) => ({
    kind: name,
    params: {},
    size,
    color,
    surface,
    light,
    at: add(record.at, quatRotate(record.rotation, at)),
    rotation: quatNormalize(quatMultiply(record.rotation, quatAxisAngle([0, 0, 1], yaw)))
  }));
};
var recordOfCompanion = (wanted, id, object = null) => {
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
    light: structuredClone(wanted.light)
  };
};
// src/vegetation/record.js
var TREE_SCALE = [0.25, 4];
var BUILT_IN = /^[a-z][a-zA-Z]{0,31}$/;
var OWN = /^[^/\s]{1,80}:[^/\s]{1,80}$/;
var finite = (value, length2) => Array.isArray(value) && value.length === length2 && value.every(Number.isFinite);
var speciesName = (value) => typeof value === "string" && (BUILT_IN.test(value) || OWN.test(value));
var wrapYaw = (degrees) => (degrees % 360 + 360) % 360;
var SPECIES_PARAMS = {
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
var CROWNS = ["conical", "spherical", "hemispherical", "cylindrical", "taperedCylindrical", "flame", "inverseConical", "tendFlame"];
var WHOLE = new Set(["branches", "twigs", "trunks"]);
var colour = (value) => finite(value, 3) && value.every((v) => v >= 0 && v <= 1);
var paramsOf2 = (value) => {
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

// src/tree-generator.js
var DEG2 = Math.PI / 180;
var GOLDEN = Math.PI * (3 - Math.sqrt(5));
var barks = (...names) => names.map((name) => `wood/logs/${name}`);
var SPECIES = {
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
var scale3 = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
var normalize2 = (a) => scale3(a, 1 / (Math.hypot(a[0], a[1], a[2]) || 1));
var PHI = (1 + Math.sqrt(5)) / 2;
var ICOSAHEDRON_VERTICES = [
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

// src/vegetation/species.js
var floatsOn = (species, recordOf) => Boolean((SPECIES[species] ?? SPECIES[recordOf?.(species)?.base])?.floats);
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
var scale32 = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
var rotateDomain = ([x, y, z], angle) => {
  const c = Math.cos(angle), s = Math.sin(angle);
  return [c * x + s * y, -s * x + c * y, z];
};
var terrainHeight = (dir) => {
  const pCoords = scale32(dir, 700000 * NOISE_SCALE / ROOT_SIZE);
  const angle = fbmScaled(scale32(pCoords, 0.01), 1, 3, -Math.PI, Math.PI) * 0.4;
  const baseH = layerValue(rotateDomain(scale32(pCoords, 0.5), angle), BASE_LAYER, 0);
  const ratio = fbmScaled(scale32(dir, 40), 0.8, 3, 0, 1);
  const v0 = warpOffset(pCoords, TERRAIN_LAYER_2);
  const v1 = warpOffset(add3(pCoords, v0), TERRAIN_LAYER_1);
  let h = layerValue(add3(pCoords, v1), TERRAIN_LAYER_0, 0);
  h = (baseH + h * ratio * 0.9) / 1.3;
  const pmix = fbmScaled(add3(scale32(pCoords, 0.53), [123, 456, 789]), 1, 3, 0, 1) * 0.5 + 0.5;
  h **= 0.95 + (1.3 - 0.95) * pmix;
  const pt = scale32(dir, 40);
  const bf = Math.min(Math.max((fbmScaled(pt, 0.8, 5, 0, 1.2) - 0.5) / 0.5, 0), 1);
  const lf = fbmScaled(scale32(pt, 10), 0.9, 8, 0, 0.03);
  const deltaH = h - SEA_LEVEL;
  const hf = Math.min(Math.max(Math.abs(deltaH) / lf, 0), 1) ** 1.4;
  return SEA_LEVEL + deltaH * hf + (h - SEA_LEVEL - deltaH * hf) * bf;
};
var bareElevation = (dir) => terrainHeight(dir) * ELEV_SCALE;
var land = null;
var useLand = (edits) => {
  land = edits;
};
var groundElevation = (dir) => land ? land.elevation(dir, bareElevation) : terrainHeight(dir) * ELEV_SCALE;
var BAND_NOISE = { scale: 300 * 5.2, octaves: 3, reach: 0.2 };

// src/build/survey.js
var RADIUS = 6348000;
var SEA = 12000;
var DEG3 = Math.PI / 180;
var unit4 = (v) => {
  const length2 = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / length2, v[1] / length2, v[2] / length2];
};
var cross4 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
var dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
var axesAt = (up) => {
  const north = unit4([-up[0] * up[1], 1 - up[1] * up[1], -up[2] * up[1]]);
  return { north, east: cross4(north, up) };
};
var frameAt2 = (at, heading = 0, ground = groundElevation) => {
  const up = unit4(at);
  const { north, east } = axesAt(up);
  const ahead = north.map((v, i) => v * Math.cos(heading * DEG3) + east[i] * Math.sin(heading * DEG3));
  const right = cross4(ahead, up);
  const origin = [...at];
  const base = Math.hypot(...at);
  const point = (x, y, z = 0) => origin.map((v, i) => v + right[i] * x + ahead[i] * y + up[i] * z);
  const local = (p) => {
    const d = p.map((v, i) => v - origin[i]);
    return [dot3(d, right), dot3(d, ahead), dot3(d, up)];
  };
  const surface = (dir) => RADIUS + Math.max(ground(dir), SEA);
  const groundAt3 = (x, y) => {
    const dir = unit4(point(x, y));
    return local(dir.map((v) => v * surface(dir)))[2];
  };
  const wetAt = (x, y) => ground(unit4(point(x, y))) < SEA;
  const depthAt = (x, y) => Math.max(0, SEA - ground(unit4(point(x, y))));
  return { origin, up, right, ahead, heading, base, point, local, groundAt: groundAt3, wetAt, depthAt, surface };
};

// src/build/behaviours.js
var TIME = { name: "time", label: "Time", min: 0.2, max: 5, default: 1, step: 0.1, unit: "s", description: "How long it takes to open, and to shut (s)." };
var STAY2 = { name: "stay", label: "Stays open", min: 0, max: 60, default: 5, step: 0.5, unit: "s", description: "How long it stays open after a click before it shuts by itself (s); 0, until clicked again." };
var TRIGGER = { name: "trigger", label: "Opens on", min: 0, max: 2, default: 0, step: 1, options: ["click", "near", "both"], description: "What opens it: a click; someone coming near — it shuts once they have all gone; or either." };
var REACH4 = { name: "reach", label: "Near", min: 0.5, max: 10, default: 2.5, step: 0.5, unit: "m", description: "How near someone comes before it opens by itself (m)." };
var along2 = (axis, fallback, what) => ({ name: axis, label: `Along ${axis}`, min: -64, max: 64, default: fallback, step: 0.05, unit: "m", description: `How far it ${what} along its own ${axis} (m).` });
var HIGHEST = 1e5;
var BEHAVIOURS = Object.freeze({
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
      { ...REACH4, default: 4, when: ({ trigger }) => trigger >= 1, description: "How far across under it it senses someone (m): standing on its own floor, up to 3.5 m under it." },
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
      REACH4,
      TIME,
      STAY2
    ]
  },
  slide: {
    label: "Slides",
    description: "Slides aside on a click or as someone comes near, and back by itself: a sliding door, a window, a hatch.",
    touch: true,
    params: [along2("x", 1, "slides"), along2("y", 0, "slides"), along2("z", 0, "slides"), TRIGGER, REACH4, TIME, STAY2]
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
var MOVE_DEFAULTS = Object.fromEntries(BEHAVIOURS.move.params.map((param) => [param.name, param.default]));
var paths = new WeakMap;
var timelines = new WeakMap;
var airs = new WeakMap;
var drawnPlaces = new WeakMap;
var coasts = new WeakMap;
var joins = new WeakMap;
var seats = new WeakMap;

// src/physics/colliders.js
var CUBE = PRESETS.cube.shape.join(",");
var CYLINDER = PRESETS.cylinder.shape.join(",");
var SPHERE = PRESETS.sphere.shape.join(",");
var LEVEL = 1;
var ROUND5 = 0.02;
var FLAT3 = 0.01;
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
var round3 = (a, b) => Math.abs(a - b) <= ALIKE * Math.max(a, b);
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
      if ((positions[o] - positions[a]) * nx + (positions[o + 1] - positions[a + 1]) * ny + (positions[o + 2] - positions[a + 2]) * nz > FLAT3)
        return false;
    }
  }
  return indices.length > 0;
};
var pointsOf2 = ({ positions, welded }) => {
  const kept2 = [];
  for (let v = 0;v < welded.length; v++)
    if (welded[v] === v)
      kept2.push(positions[v * 3], positions[v * 3 + 1], positions[v * 3 + 2]);
  return Float32Array.from(kept2);
};
var fromMesh = (key, mesh, size) => {
  if (!mesh?.indices.length)
    return [];
  const convex = convexity.get(key) ?? remember(convexity, key, isConvex(mesh));
  return [convex ? { type: "hull", key, points: pointsOf2(mesh), scale: [...size] } : { type: "mesh", key, positions: mesh.positions, indices: mesh.indices, scale: [...size] }];
};
var piecesOf2 = (part, meshOf) => {
  if (part.phantom)
    return [];
  const { size } = part;
  const recipe = part.recipe ?? (part.kind ? part : null);
  const kind = kindOf(recipe?.kind);
  if (kind) {
    const params = constrainKind(recipe.kind, recipe.params).params;
    const own = typeof kind.collider === "function" ? kind.collider(params, kind.seeded ? seedOf(recipe.seed) : 0, size) : null;
    if (own && own !== "hull")
      return own;
    const key2 = `k:${kindMesh({ ...recipe, size }).key}`;
    const mesh = meshOf(LEVEL);
    if ((kind.collider === "hull" || own === "hull") && mesh)
      return [{ type: "hull", key: key2, points: pointsOf2(mesh), scale: [...size] }];
    return fromMesh(key2, mesh, size);
  }
  const key = shapeKey(part.shape);
  const [x, y, z] = size;
  if (key === CUBE)
    return [{ type: "box", half: [x / 2, y / 2, z / 2], radius: Math.min(ROUND5, x / 2, y / 2, z / 2) }];
  if (key === CYLINDER && round3(x, y))
    return [{ type: "cylinder", half: z / 2, radius: x / 2, rounding: Math.min(ROUND5, z / 2, x / 2) }];
  if (key === SPHERE && round3(x, y) && round3(y, z))
    return [{ type: "sphere", radius: x / 2 }];
  return fromMesh(`p:${key}`, meshOf(LEVEL), size);
};
var wheelsOf = (parts, meshesOf = () => () => null) => parts.flatMap((part, index) => {
  const pieces = piecesOf2(part, meshesOf(part));
  if (pieces.length !== 1 || pieces[0].type !== "cylinder")
    return [];
  const [piece] = pieces;
  const axis = quatRotate(part.rotation, quatRotate(piece.rotation ?? [0, 0, 0, 1], [0, 0, 1]));
  if (Math.abs(axis[0]) < 0.8)
    return [];
  return [{ index, at: add(part.position, quatRotate(part.rotation, piece.at ?? [0, 0, 0])), axis, radius: piece.radius, width: 2 * piece.half }];
}).sort((a, b) => b.at[1] - a.at[1] || a.at[0] - b.at[0]);

// src/build/vehicles.js
var MASS = { name: "mass", label: "Mass", min: 50, max: 5000, default: 1000, step: 10, unit: "kg", description: "How heavy it is (kg): heavier, it speeds up and stops more slowly." };
var CAR_GRIP = 2;
var GRIP = { name: "grip", label: "Grip", min: 0.4, max: 3, default: CAR_GRIP, step: 0.05, unit: "×", optional: true, description: "How hard its tyres hold the ground (×): 2 as dry asphalt; more, it turns where its front wheels point at more speed before it slides; less, it slides sooner (0.4 on ice)." };
var DRIVE = { name: "drive", label: "Drive", options: ["all", "front", "rear"], default: "all", optional: true, description: "Which wheels its engine turns: all of them, its front ones (it runs wide at the limit) or its back ones (its tail may step out)." };
var BRAKE = { name: "brake", label: "Brakes", min: 0.25, max: 3, default: 1, step: 0.05, unit: "×", optional: true, description: "How hard it brakes (×): 1 holds each wheel with 1,500 N·m; a heavy one wants more, or it takes long to stop." };
var SUSPENSION = { name: "suspension", label: "Suspension", min: 0.8, max: 4, default: 1.5, step: 0.1, unit: "Hz", optional: true, description: "How stiff its springs are (Hz): low, soft and swaying over bumps, a monster truck's; high, firm and flat in a turn, a sports car's." };
var TRAVEL = { name: "travel", label: "Travel", min: 0.1, max: 1, default: 0.3, step: 0.05, unit: "m", optional: true, description: "How far its wheels go up and down (m): long for rough ground and jumps, short for a low car." };
var STEERING = { name: "steering", label: "Steering", options: ["front", "rear", "all"], default: "front", optional: true, description: "Which wheels steer: its front ones; its back ones, as a forklift's; or all, its back ones the other way, turning half as wide." };
var VEHICLES = Object.freeze({
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
  }
});
var afloat = (type) => type === "boat" || type === "ship" || type === "submarine";
var PEDALLING = "ovgrid/pedalling";
var TILT = Object.freeze({ pitch: 10, surge: 5, bank: 25, attitude: 3 });
var PLANE_TILT = Object.freeze({ pitch: 20, bank: 35 });
var vehicleType = (name) => typeof name === "string" && Object.hasOwn(VEHICLES, name) ? VEHICLES[name] : null;
var decimals2 = (step) => Math.max(0, Math.ceil(-Math.log10(step) - 0.000000001));
var held2 = (param, value) => {
  if (param.options)
    return param.options.includes(value) ? value : param.default;
  if (!Number.isFinite(value))
    return param.default;
  const within4 = Math.min(Math.max(value, param.min), param.max);
  return Number(Math.min(param.min + Math.round((within4 - param.min) / param.step) * param.step, param.max).toFixed(decimals2(param.step)));
};
var vehicleOf = (value) => {
  const kind = vehicleType(value?.type);
  return kind && { type: value.type, ...Object.fromEntries(kind.params.flatMap((param) => param.optional && value[param.name] === undefined ? [] : [[param.name, held2(param, value[param.name])]])) };
};

// src/build/looks.js
var SLOTS = ["paint", "roof", "accent", "interior", "carpet", "rims"];
var FINISHES = { gloss: { gloss: 0.9, metal: 0.5, reflect: 0.3 }, satin: { gloss: 0.25, metal: 0.3, reflect: 0.1 }, matte: { gloss: 0.05, metal: 0, reflect: 0 } };
var MATERIAL = /^[a-z0-9-]+\/[a-z0-9-]+\/[a-z0-9-]+$/;
var lookValue = (value) => {
  if (Array.isArray(value) && value.length === 3 && value.every(Number.isFinite))
    return value.map((v) => Math.min(Math.max(v, 0), 1));
  return typeof value === "string" && value.length <= 96 && MATERIAL.test(value) ? value : null;
};
var looksOf = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return null;
  const kept2 = SLOTS.flatMap((slot) => {
    const look = lookValue(value[slot]);
    return look === null ? [] : [[slot, look]];
  });
  if (typeof value.finish === "string" && Object.hasOwn(FINISHES, value.finish))
    kept2.push(["finish", value.finish]);
  return kept2.length ? Object.fromEntries(kept2) : null;
};

// src/build/seat.js
var POSES = [
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
var POSE = new Map(POSES.map((pose) => [pose.clip, pose]));
var REACH5 = 64;
var MOST_PLACES = 64;
var DEG4 = Math.PI / 180;
var wrapTurn = (degrees) => {
  const turn3 = (degrees % 360 + 360) % 360;
  return turn3 > 180 ? turn3 - 360 : turn3;
};
var heldTarget = ({ at, turn: turn3 = 0 }) => ({
  at: at.map((v) => Math.round(Math.min(Math.max(v, -REACH5), REACH5) * 1000) / 1000 || 0),
  turn: Math.round(wrapTurn(turn3) * 10) / 10 || 0
});
var seatWith = (target, pose) => target || pose ? { ...target, ...pose && { pose } } : true;
var seatOf = (value) => {
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

// src/build/bouncy.js
var BOUNCY = Object.freeze({
  params: [
    { name: "trigger", label: "Bouncy", min: 0, max: 1, default: 0, step: 1, options: ["landing", "step"], labels: ["When landed on", "When stepped on"], description: "What throws whoever is on it back up: landing on it from a jump or a fall, as on a trampoline; or stepping on it at all, as on a jump pad." },
    { name: "height", label: "Height", min: 0.5, max: 30, default: 3, step: 0.5, unit: "m", description: "How high it throws them at most (m); stepped on, this high every time." },
    { name: "give", label: "Gives back", min: 0, max: 100, default: 80, step: 5, unit: "%", when: ({ trigger }) => trigger === 0, description: "Of how hard they land on it, how much it gives back (%): 100, as high each time, on and on; less, lower each time, till they land." },
    { name: "along", label: "Throws", min: 0, max: 1, default: 0, step: 1, options: ["up", "own"], labels: ["Straight up", "Along its own up"], description: "Which way it throws them: straight up; or along its own up (z), so that tilted it throws them across, a launch pad." }
  ]
});
var decimals3 = (step) => Math.max(0, Math.ceil(-Math.log10(step) - 0.000000001));
var held3 = (param, value) => {
  const given = typeof value === "string" && param.options ? param.options.indexOf(value) : value;
  if (!Number.isFinite(given) || param.options && given < 0)
    return param.default;
  const within4 = Math.min(Math.max(given, param.min), param.max);
  return Number(Math.min(param.min + Math.round((within4 - param.min) / param.step) * param.step, param.max).toFixed(decimals3(param.step)));
};
var bouncyOf = (value) => {
  const given = value === true ? {} : value && typeof value === "object" && !Array.isArray(value) ? value : null;
  return given && Object.fromEntries(BOUNCY.params.map((param) => [param.name, held3(param, given[param.name])]));
};

// src/build/mirror-kind.js
var MIRROR_PARAMS = Object.freeze([
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
var MIRROR_DEFAULTS = Object.freeze(Object.fromEntries(MIRROR_PARAMS.map((param) => [param.name, param.default])));

// src/build/live.js
var WHO = Object.freeze(["anyone", "owner"]);
var WHO_PARAM = { name: "who", label: "On air", options: WHO, labels: ["Anyone near", "Its owner"], default: "anyone", description: "Who may go on air in it: anyone within its radius, or the prim's owner alone." };
var LIVE = Object.freeze({
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
var liveOf = (value) => {
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
};
var liveUrl = (id) => `live:${id}`;
var LIVE_URL = /^live:[\w:.~@/-]{1,160}$/;
var isLiveUrl = (url) => typeof url === "string" && LIVE_URL.test(url);
var MIRROR_TEXTURE = /^effects\/mirror\//;
var withoutLive = (surface) => {
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
};
var surfaceWithLive = (surface, id, live) => {
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

// src/build/edit/import.js
var DEG5 = Math.PI / 180;
var seedFor = (name, index) => {
  let hash3 = 2166136261;
  for (const char of `${name}#${index}`)
    hash3 = Math.imul(hash3 ^ char.charCodeAt(0), 16777619);
  return seedOf(hash3 >>> 0);
};
var turnOf2 = (degrees) => {
  const [x, y, z] = (degrees ?? [0, 0, 0]).map((value) => value * DEG5);
  return quatMultiply(quatAxisAngle([0, 0, 1], z), quatMultiply(quatAxisAngle([0, 1, 0], y), quatAxisAngle([1, 0, 0], x)));
};
var slugOf = (name) => String(name ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
var kindPart = (prim, name, index) => {
  const kind = kindOf(prim.kind);
  if (!kind)
    throw new Error(`${name}: no kind ${prim.kind}`);
  if (!kindReady(prim.kind))
    throw Object.assign(new Error(`${name}: the ${prim.kind} kind is not loaded yet`), { name: "KindNotLoaded" });
  const given = { ...prim.params, ...Object.fromEntries(kind.params.filter((param) => prim[param.name] !== undefined).map((param) => [param.name, prim[param.name]])) };
  const { params: held4, errors } = constrainKind(prim.kind, given);
  const sized = prim.size && kind.resize ? constrainKind(prim.kind, { ...resizeParams({ kind: prim.kind, params: held4, size: prim.size }), ...given }).params : held4;
  const { params, shift } = recentred({ kind: prim.kind, params: sized });
  const part = { kind: prim.kind, params, ...kind.seeded && { seed: Number.isInteger(prim.seed) ? seedOf(prim.seed) : seedFor(name, index) } };
  const lies = Boolean(kind.settle) && kind.params.some((param) => param.points && Array.isArray(given[param.name]) && given[param.name].every((point) => Array.isArray(point) && point.length === 2));
  return { part: { ...part, shape: fallbackShape(part), size: fitSize({ ...part, size: prim.size ?? kind.size }) }, shift, lies, errors };
};
var laidOnGround = (part, at, turn3, object, groundRadius, waterRadius, landRadius) => {
  const type = kindOf(part.kind);
  const ground = type.bed ? landRadius : groundRadius;
  const rotation = quatMultiply(object.rotation, turn3);
  const place = add(object.at, quatRotate(object.rotation, at));
  const up = quatRotate(rotation, [0, 0, 1]);
  const { min, max } = type.footprint(part.params);
  const centre = min.map((v, k) => (v + max[k]) / 2);
  const heightAt = (x, y) => {
    const dir = normalize(add(place, quatRotate(rotation, [x - centre[0], y - centre[1], 0])));
    return dot(sub(scale(dir, ground(dir)), place), up) + centre[2];
  };
  const waterAt = (x, y) => {
    const dir = normalize(add(place, quatRotate(rotation, [x - centre[0], y - centre[1], 0])));
    const water = waterRadius?.(dir) ?? null;
    return water !== null && water > ground(dir) + 0.01 ? dot(sub(scale(dir, water), place), up) + centre[2] : null;
  };
  const { params, shift } = recentred({ kind: part.kind, params: type.settle(part.params, heightAt, undefined, waterAt) });
  return { params, at: add(at, quatRotate(turn3, shift)), size: fitSize({ ...part, params }) };
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
var partsOf = (prims, { name, objectId, materials, warnings, object, groundRadius, waterRadius, landRadius }) => prims.map((prim, index) => {
  const kind = prim.kind === undefined ? null : kindPart(prim, name, index);
  const preset2 = kind ? null : shapeOf(prim.shape, prim.name ?? `part ${index}`, warnings);
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
  const turn3 = turnOf2(prim.turn);
  const at = kind ? add(prim.at, quatRotate(turn3, kind.shift)) : [...prim.at];
  const laid = kind?.lies ? laidOnGround(kind.part, at, turn3, object, groundRadius, waterRadius, landRadius) : null;
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
});
var companionParts = (made4, objectId) => made4.flatMap((part) => companionsOf(part).flatMap((wanted, k) => made4.some((other) => other.kind === wanted.kind && Math.hypot(...sub(other.at, wanted.at)) < 0.05) ? [] : [recordOfCompanion(wanted, `${part.id}~lamp-${k}`, objectId)]));
var placeBuild = (spec, { groundRadius, bareRadius = groundRadius, waterRadius = () => null, landRadius = groundRadius, materials, id }) => {
  const up = normalize(spec.anchor.at);
  const north = normalize(sub([0, 1, 0], scale(up, up[1])));
  const east = cross(north, up);
  const heading = spec.anchor.heading * DEG5;
  const ahead = add(scale(north, Math.cos(heading)), scale(east, Math.sin(heading)));
  const right = cross(ahead, up);
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
  const placeOf = (at) => {
    const level = add(origin, add(scale(right, at[0]), scale(ahead, at[1])));
    if (at.length !== 2)
      return add(level, scale(up, at[2]));
    const dir = normalize(level);
    return scale(dir, groundRadius(dir));
  };
  const floatOf = (at) => {
    if (at.length !== 2)
      return placeOf(at);
    const dir = normalize(add(origin, add(scale(right, at[0]), scale(ahead, at[1]))));
    return scale(dir, waterRadius(dir) ?? groundRadius(dir));
  };
  const warnings = [];
  const objects = [];
  const parts = [];
  const names = new Map;
  const addObject = (name, objectId, at, turn3, prims, behaviour, vehicle, origin2, marked, dry, looks) => {
    if (!prims?.length)
      return;
    const rotation = quatNormalize(quatMultiply(frame, turnOf2(turn3)));
    const driven = vehicle === undefined ? null : vehicleOf(vehicle);
    if (vehicle !== undefined && !driven)
      warnings.push(`${name}: no vehicle "${vehicle?.type}"`);
    objects.push({ type: "object", id: objectId, name, at, rotation, ...behaviour && { behaviour }, ...driven && { vehicle: driven }, ...looksOf(looks) && { looks: looksOf(looks) }, ...dry === true && { dry: true }, ...origin2 && typeof origin2 === "object" && { origin: origin2 }, ...typeof marked === "string" && { package: marked } });
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
    addObject(object.name, idOf(object.id, `${id}~${slug}`), placeOf(object.at), object.turn, object.prims, object.behaviour, object.vehicle, object.origin, object.package ?? spec.package, object.dry, object.looks);
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
      at: (floatsOn(tree.species) ? floatOf : placeOf)(tree.at),
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

// src/build/particles.js
var MAX_PER_SYSTEM = 4096;
var PATTERNS = Object.freeze({ drop: 0, explode: 1, angle: 2, cone: 3, "cone-empty": 4 });
var ADDED = 1;
var LIT = 2;
var STREAK = 4;
var BOUNCE = 8;
var SHAPES2 = Object.freeze({ soft: 0, drop: 1, flake: 2, sparkle: 3, bubble: 4, leaf: 5, heart: 6, confetti: 7, firefly: 8 });
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
  },
  snowflakes: {
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
    size: [0.07, 0.07],
    glow: [0, 0],
    blend: "alpha",
    lit: true,
    turbulence: 0.25,
    shape: "flake"
  },
  rain: {
    pattern: "drop",
    rate: 0.035,
    count: 2,
    life: 0.8,
    radius: 2.5,
    angle: [0, 0],
    speed: [4, 5],
    accel: [0, 0, -9.8],
    drag: 0,
    color: [[0.7, 0.76, 0.85], [0.7, 0.76, 0.85]],
    alpha: [0.55, 0.55],
    size: [0.05, 0.05],
    glow: [0, 0],
    blend: "alpha",
    lit: true,
    shape: "drop",
    streak: true,
    stretch: 0.02
  },
  fireflies: {
    pattern: "drop",
    rate: 0.5,
    count: 1,
    life: 6,
    radius: 3,
    angle: [0, 0],
    speed: [0, 0.1],
    accel: [0, 0, 0.05],
    drag: 0.3,
    color: [[0.75, 1, 0.25], [0.6, 0.9, 0.2]],
    alpha: [1, 0.6],
    size: [0.12, 0.12],
    glow: [0.9, 0.9],
    blend: "add",
    lit: false,
    turbulence: 0.35,
    shape: "firefly"
  },
  magic: {
    pattern: "explode",
    rate: 0.12,
    count: 2,
    life: 2.2,
    radius: 0.25,
    angle: [0, 0],
    speed: [0.15, 0.5],
    accel: [0, 0, 0.2],
    drag: 0.8,
    color: [[0.75, 0.45, 1], [0.35, 0.85, 1]],
    alpha: [1, 0],
    size: [0.09, 0.03],
    glow: [0.8, 0.1],
    blend: "add",
    lit: false,
    turbulence: 0.35,
    shape: "sparkle",
    variety: 0.5
  },
  bubbles: {
    pattern: "cone",
    rate: 0.35,
    count: 1,
    life: 3.5,
    radius: 0.15,
    angle: [0, 25],
    speed: [0.25, 0.5],
    accel: [0, 0, 0.35],
    drag: 0.9,
    color: [[0.8, 0.92, 1], [0.85, 0.95, 1]],
    alpha: [0.75, 0.5],
    size: [0.07, 0.13],
    glow: [0, 0],
    blend: "alpha",
    lit: true,
    turbulence: 0.25,
    shape: "bubble",
    variety: 0.15
  },
  confetti: {
    pattern: "cone",
    rate: 0.3,
    count: 3,
    life: 3.5,
    radius: 0.05,
    angle: [0, 30],
    speed: [3, 4.5],
    accel: [0, 0, -1.2],
    drag: 1.5,
    color: [[1, 0.25, 0.35], [1, 0.25, 0.35]],
    alpha: [1, 0.7],
    size: [0.05, 0.05],
    glow: [0, 0],
    blend: "alpha",
    lit: true,
    turbulence: 0.35,
    shape: "confetti",
    variety: 1
  },
  leaves: {
    pattern: "drop",
    rate: 0.7,
    count: 1,
    life: 7,
    radius: 3,
    angle: [0, 0],
    speed: [0.1, 0.3],
    accel: [0, 0, -0.5],
    drag: 0.6,
    color: [[0.72, 0.38, 0.08], [0.5, 0.22, 0.06]],
    alpha: [1, 0.9],
    size: [0.1, 0.1],
    glow: [0, 0],
    blend: "alpha",
    lit: true,
    turbulence: 0.45,
    drift: [0.35, 0.1, 0],
    shape: "leaf",
    variety: 0.12
  },
  exhaust: {
    pattern: "cone",
    rate: 0.02,
    count: 1,
    life: 0.16,
    radius: 0.12,
    angle: [0, 2],
    speed: [14, 18],
    accel: [0, 0, 0],
    drag: 2,
    color: [[0.85, 0.93, 1], [0.15, 0.35, 1]],
    alpha: [0.04, 0],
    size: [0.45, 0.06],
    glow: [0.9, 0.15],
    blend: "add",
    lit: false,
    turbulence: 0.04,
    streak: true,
    stretch: 0.02
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
  variety: [0, 1],
  angle: [0, 180, 2],
  speed: [0, 50, 2],
  alpha: [0, 1, 2],
  size: [0.005, 10, 2],
  glow: [0, 1, 2],
  accel: [-50, 50, 3],
  drift: [-20, 20, 3]
};
var OPTIONS = { pattern: Object.keys(PATTERNS), blend: ["add", "alpha"], shape: Object.keys(SHAPES2) };
var AMOUNT = [0.1, 4];
var SCALE = [0.1, 10];
var clamp5 = (value, low, high, fallback) => Number.isFinite(value) ? Math.min(Math.max(value, low), high) : fallback;
var pair2 = (value, low, high, fallback) => Array.isArray(value) && value.length === 2 ? value.map((v, i) => clamp5(v, low, high, fallback[i])) : fallback;
var vector = (value, limit, fallback) => Array.isArray(value) && value.length === 3 ? value.map((v, i) => clamp5(v, -limit, limit, fallback[i])) : fallback;
var colorOf = (value, fallback) => Array.isArray(value) && value.length === 3 ? value.map((v, i) => clamp5(v, 0, 1, fallback[i])) : fallback;
var numbers = (value, n) => Array.isArray(value) && value.length === n && value.every(Number.isFinite);
var layersOf = (spec) => typeof spec === "string" ? KITS[spec] ?? [] : Array.isArray(spec) ? spec.slice(0, MAX_LAYERS) : spec && typeof spec === "object" ? [spec] : [];
var particlesOf = (spec) => {
  if (!spec || typeof spec !== "object" || spec.on === false)
    return null;
  const base = PRESETS2[spec.preset] ?? PRESETS2.fire;
  const value = (key) => spec[key] ?? base[key];
  const amount = clamp5(spec.amount, ...AMOUNT, 1), scale4 = clamp5(spec.scale, ...SCALE, 1);
  const tint = numbers(spec.tint, 3) ? spec.tint.map((v) => clamp5(v, 0, 1)) : [1, 1, 1];
  const asked2 = clamp5(Math.round(value("count")), ...RANGES.count, base.count) * amount;
  const every = clamp5(value("rate"), ...RANGES.rate, base.rate);
  const rate = asked2 < 1 ? clamp5(every / asked2, ...RANGES.rate, every) : every;
  const life = clamp5(value("life"), ...RANGES.life, base.life);
  const bursts = Math.ceil(life / rate) + 1;
  const count = Math.min(Math.max(Math.round(asked2), 1), Math.max(1, Math.floor(MAX_PER_SYSTEM / bursts)));
  const colors = Array.isArray(spec.color) && spec.color.length === 2 ? spec.color : base.color;
  const scaled = (values, by = scale4) => values.map((v) => v * by);
  const system = {
    pattern: PATTERNS[value("pattern")] ?? PATTERNS.cone,
    rate,
    life,
    count,
    bursts,
    radius: clamp5(value("radius"), ...RANGES.radius, base.radius) * scale4,
    angle: pair2(value("angle"), 0, 180, base.angle),
    speed: scaled(pair2(value("speed"), 0, 50, base.speed)),
    accel: scaled(vector(value("accel"), 50, base.accel)),
    drift: scaled(vector(value("drift"), 20, base.drift ?? [0, 0, 0])),
    drag: clamp5(value("drag"), ...RANGES.drag, base.drag),
    turbulence: clamp5(value("turbulence"), ...RANGES.turbulence, base.turbulence ?? 0) * scale4,
    color: [colorOf(colors[0], base.color[0]), colorOf(colors[1], base.color[1])].map((color) => color.map((v, k) => v * tint[k])),
    alpha: pair2(value("alpha"), 0, 1, base.alpha),
    size: scaled(pair2(value("size"), 0.005, 10, base.size)),
    glow: pair2(value("glow"), 0, 1, base.glow),
    floor: clamp5(value("floor"), ...RANGES.floor, -1000),
    stretch: clamp5(value("stretch"), ...RANGES.stretch, 0.04) * scale4,
    shine: Math.min(clamp5(value("shine"), ...RANGES.shine, 0) * scale4, RANGES.shine[1]),
    flags: (value("blend") === "add" ? ADDED : 0) | (value("lit") ? LIT : 0) | (value("streak") ? STREAK : 0) | (value("bounce") ? BOUNCE : 0),
    shape: Object.hasOwn(SHAPES2, value("shape")) ? SHAPES2[value("shape")] : SHAPES2.soft,
    variety: clamp5(value("variety"), ...RANGES.variety, base.variety ?? 0),
    since: Number.isFinite(spec.since) ? spec.since : 0,
    running: spec.running === true
  };
  system.alive = system.count * system.bursts;
  return system;
};
var systemsOf = (spec) => layersOf(spec).map(particlesOf).filter(Boolean);
var MOTION_RECIPES = {
  falls: { pattern: "drop", angle: [0, 0], speed: [0.7, 1], accel: 0, drag: 0 },
  rises: { pattern: "cone", angle: [0, 10], speed: [0.6, 1], accel: 0.5, drag: 0.5 },
  bursts: { pattern: "explode", angle: [0, 0], speed: [0.5, 1], accel: 0, drag: 1.2 },
  sprays: { pattern: "cone", angle: [0, 25], speed: [0.8, 1], accel: -1.96, drag: 0.2 },
  floats: { pattern: "drop", angle: [0, 0], speed: [0, 0.2], accel: 0, drag: 0.5 },
  streams: { pattern: "cone", angle: [0, 2], speed: [0.85, 1], accel: 0, drag: 1 }
};
var MOTIONS = Object.freeze(Object.keys(MOTION_RECIPES));
// src/build/media-kind.js
var PLAYING = 4;
var SHOWING = 8;
var STILLS = 32;
var PICTURE = /\.(webp|gif|png|apng|avif)$/i;
var isPicture = (url) => typeof url === "string" && URL.canParse(url) && PICTURE.test(new URL(url).pathname);
var GIPHY_HOSTS = ["media.giphy.com", "media0.giphy.com", "media1.giphy.com", "media2.giphy.com", "media3.giphy.com", "media4.giphy.com", "i.giphy.com"];

// src/build/page-actions.js
var VERBS = ["add", "set", "toggle", "push", "remove", "clear", "place", "draw"];
var NAME = /^[a-z][\w.-]{0,31}$/i;
var VALUE_MOST = 64;
var ITEM_MOST = 256;
var PENS = ["#111111", "#e63946", "#1d4ed8", "#2a9d8f"];
var ERASER = PENS.length;
var actionOf = (text) => {
  const [verb, name, ...rest] = String(text ?? "").trim().split(/\s+/);
  if (!VERBS.includes(verb) || !NAME.test(name ?? ""))
    return null;
  return { verb, name, argument: rest.join(" ").slice(0, ITEM_MOST) };
};
var showOf = (text) => {
  const [name, ...rest] = String(text ?? "").trim().split(".");
  if (!NAME.test(name ?? ""))
    return null;
  const view = rest.join(".");
  return { name, view: view === "" ? "total" : view.slice(0, VALUE_MOST) };
};

// src/build/face-plane.js
var FLAT4 = 0.0001;
var facePlane = ({ positions, normals: normals2, indices, slots }, slot) => {
  const { first, count } = slots[slot] ?? { first: 0, count: 0 };
  const normal = [0, 0, 0], centre = [0, 0, 0], min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (let i = first;i < first + count; i++) {
    const v = indices[i] * 3;
    for (let k = 0;k < 3; k++) {
      normal[k] += normals2[v + k];
      centre[k] += positions[v + k] / count;
      min[k] = Math.min(min[k], positions[v + k]);
      max[k] = Math.max(max[k], positions[v + k]);
    }
  }
  const length2 = Math.hypot(...normal);
  if (count < 3 || !(length2 > 0))
    return null;
  for (let k = 0;k < 3; k++)
    normal[k] /= length2;
  const offset = normal[0] * centre[0] + normal[1] * centre[1] + normal[2] * centre[2];
  for (let i = first;i < first + count; i++) {
    const v = indices[i] * 3;
    if (Math.abs(normal[0] * positions[v] + normal[1] * positions[v + 1] + normal[2] * positions[v + 2] - offset) > FLAT4)
      return null;
    if (normal[0] * normals2[v] + normal[1] * normals2[v + 1] + normal[2] * normals2[v + 2] <= 0.999)
      return null;
  }
  return { normal, offset, centre, min, max };
};

// src/build/pattern-kind.js
var PATTERNS2 = [
  ["grid", "Grid", "Lines along and across, a square in every cell."],
  ["hex", "Hex", "A honeycomb of hexagons."],
  ["circuit", "Circuit", "A grid with pads where its lines cross.", {
    pads: ["Pads", 0, 6, 3, 0.25],
    pad: ["Pad glow", 0, 1, 0.5, 0.05]
  }],
  ["pulse-grid", "Pulse grid", "A grid with pulses running along its lines.", {
    every: ["Every", 1, 16, 4, 1],
    length: ["Length", 0.01, 0.4, 0.04, 0.01],
    base: ["Base", 0, 1, 0.4, 0.05]
  }],
  ["plasma", "Plasma", "Bands of a glow flowing and shifting.", {
    bands: ["Bands", 1, 12, 4, 1]
  }],
  ["scan", "Scan", "Scan lines, a brighter band sweeping up them.", {
    every: ["Every", 0.5, 20, 2, 0.5],
    sweep: ["Sweep", 0, 0.45, 0.05, 0.01]
  }],
  ["matrix", "Matrix", "Columns of glyphs raining.", {
    glyphs: ["Glyphs", 0, 1, 0.7, 0.05],
    drop: ["Drop", 0.5, 20, 2, 0.5]
  }],
  ["glitch", "Glitch", "Scan lines torn by bands that jump and flicker.", {
    bands: ["Bands", 0, 1, 0.15, 0.05],
    shift: ["Shift", 0, 2, 0.3, 0.05],
    flicker: ["Flicker", 0, 1, 0.3, 0.05]
  }],
  ["dots", "Dots", "A dot in every cell.", {
    softness: ["Softness", 0, 1, 1, 0.05],
    stagger: ["Stagger", 0, 0.5, 0, 0.05]
  }],
  ["stripes", "Stripes", "Stripes at an angle, drifting if asked.", {
    angle: ["Angle", 0, 180, 45, 5],
    fill: ["Fill", 0.05, 0.95, 0.5, 0.05],
    drift: ["Drift", -2, 2, 0, 0.1]
  }],
  ["plaid", "Plaid", "Bands along and across, as on a woven cloth.", {
    band: ["Band", 0.05, 0.9, 0.4, 0.05],
    crossings: ["Crossings", 0, 1, 1, 0.05]
  }],
  ["tesla", "Tesla", "Electric arcs crackling up the face.", {
    bolts: ["Bolts", 1, 4, 2, 1],
    reach: ["Reach", 0, 0.45, 0.25, 0.01],
    crackle: ["Crackle", 0, 40, 20, 1]
  }],
  ["dna", "DNA", "Double helices turning, rungs between their strands.", {
    radius: ["Radius", 0.1, 0.45, 0.3, 0.01],
    turn: ["Turn", 0.5, 8, 2, 0.25],
    rungs: ["Rungs", 0, 12, 5, 1]
  }],
  ["reactor", "Reactor", "Rings and spiral arms round a core pulsing at the face's middle.", {
    arms: ["Arms", 0, 8, 3, 1],
    twist: ["Twist", -1, 1, 0.2, 0.05],
    core: ["Core", 0, 4, 1, 0.1]
  }],
  ["fire", "Fire", "Flames rising from the face's foot.", {
    height: ["Height", 0.5, 20, 4, 0.5],
    tongues: ["Tongues", 0.25, 4, 1, 0.05]
  }],
  ["ember", "Ember", "Glowing cracks between plates, the plates flaring and fading.", {
    cracks: ["Cracks", 0, 1, 0.7, 0.05],
    embers: ["Embers", 0, 1, 0.6, 0.05],
    smoulder: ["Smoulder", 0, 2, 0.2, 0.05]
  }],
  ["fluid", "Fluid", "Lines of a flowing liquid.", {
    flow: ["Flow", 0, 2, 1, 0.05],
    foam: ["Foam", 0, 1, 0.3, 0.05]
  }],
  ["vein", "Vein", "A network of veins, pulses running through it.", {
    warp: ["Warp", 0, 1, 0.3, 0.05],
    branches: ["Branches", 0, 2, 1, 0.05],
    pulse: ["Pulse", 0, 1, 0.8, 0.05]
  }],
  ["shockwave", "Shockwave", "Rings bursting out from points here and there.", {
    spread: ["Spread", 1, 12, 4, 0.5],
    fade: ["Fade", 0.5, 4, 2, 0.1]
  }],
  ["heartbeat", "Heartbeat", "Heart traces running along every row, over a faint grid.", {
    beat: ["Beat", 2, 40, 6, 1],
    height: ["Height", 0.05, 0.5, 0.35, 0.01],
    grid: ["Grid", 0, 1, 0.15, 0.05]
  }],
  ["stargate", "Stargate", "Rings of symbols turning round the face's middle.", {
    rings: ["Rings", 1, 8, 5, 1],
    symbols: ["Symbols", 0.05, 0.9, 0.3, 0.05],
    spin: ["Spin", 0, 3, 1, 0.05]
  }],
  ["firefly", "Firefly", "Glowing specks drifting and blinking.", {
    density: ["Density", 0, 1, 0.6, 0.05],
    wander: ["Wander", 0, 1, 0.5, 0.05],
    blink: ["Blink", 0, 6, 2, 0.1]
  }],
  ["rune", "Rune", "Glyphs in circles, glowing in turn.", {
    ring: ["Ring", 0, 1, 0.3, 0.05],
    pulse: ["Pulse", 0, 2, 0.3, 0.05],
    dim: ["Dim", 0, 1, 0.15, 0.05]
  }],
  ["pcb-trace", "PCB trace", "Traces and pads of a circuit board, signals running along them.", {
    pads: ["Pads", 0, 1, 0.2, 0.05],
    signal: ["Signal", 0, 1, 0.7, 0.05],
    traces: ["Traces", 0, 1, 0.25, 0.05]
  }],
  ["warp", "Warp", "Streaks rushing out from the face's middle.", {
    streaks: ["Streaks", 4, 64, 16, 1],
    dashes: ["Dashes", 0.05, 1, 0.3, 0.05],
    core: ["Core", 0, 4, 1, 0.1]
  }],
  ["synapses", "Synapses", "Nerve cells with their branches, firing.", {
    branches: ["Branches", 1, 8, 3, 1],
    firing: ["Firing", 0, 2, 0.5, 0.05],
    dendrites: ["Dendrites", 0, 1, 0.25, 0.05]
  }],
  ["nano", "Nano", "A hexagonal lattice of discs, a cross spinning in each.", {
    spin: ["Spin", 0, 4, 1, 0.1],
    disc: ["Disc", 0, 1, 0.3, 0.05],
    cross: ["Cross", 0, 1, 0.5, 0.05]
  }],
  ["radar", "Radar", "A sweep turning round the face's middle, blips lit in its wake.", {
    trail: ["Trail", 0.02, 1, 0.25, 0.01],
    blips: ["Blips", 0, 1, 0.15, 0.05],
    rings: ["Rings", 0, 1, 0.15, 0.05]
  }],
  ["sonar", "Sonar", "Pings spreading out in rings from points here and there.", {
    spread: ["Spread", 1, 12, 4, 0.5],
    echoes: ["Echoes", 1, 3, 3, 1],
    fade: ["Fade", 0.5, 4, 2, 0.1]
  }],
  ["dot-wave", "Dot wave", "Dots swelling in waves.", {
    swell: ["Swell", 0, 6, 3, 0.25],
    wave: ["Wave", 0.1, 2, 1, 0.05],
    calm: ["Calm", 0, 1, 0.3, 0.05]
  }],
  ["dot-orbit", "Dot orbit", "Dots circling the middle of every cell.", {
    dots: ["Dots", 1, 3, 3, 1],
    orbit: ["Orbit", 0.05, 0.4, 0.3, 0.01],
    centre: ["Centre", 0, 1, 0.2, 0.05]
  }],
  ["ic-chip", "IC chip", "Chips with their pins, blinking.", {
    pins: ["Pins", 0, 8, 4, 1],
    die: ["Die", 2, 16, 8, 1],
    blink: ["Blink", 0, 10, 3, 0.25]
  }],
  ["bus-line", "Bus line", "Lanes of bits running, a clock above them.", {
    lanes: ["Lanes", 1, 12, 6, 1],
    bits: ["Bits", 0.5, 8, 2, 0.5],
    clock: ["Clock", 0, 1, 1, 0.05]
  }],
  ["motherboard", "Motherboard", "Traces, vias and signals of a board.", {
    traces: ["Traces", 0, 1, 0.55, 0.05],
    vias: ["Vias", 0, 1, 0.3, 0.05],
    signal: ["Signal", 0, 1, 0.7, 0.05]
  }],
  ["led-grid", "LED grid", "A grid of LEDs lit in waves, in sparks or in a spiral.", {
    show: ["Show", 0, 3, 0, 1, ["each", "waves", "sparks", "spiral"]],
    size: ["Size", 0.1, 1, 0.6, 0.05]
  }],
  ["signal", "Signal", "Oscilloscope traces along every row, sine and square.", {
    amplitude: ["Amplitude", 0.05, 0.5, 0.27, 0.01],
    frequency: ["Frequency", 0.25, 4, 1, 0.05],
    grid: ["Grid", 0, 1, 0, 0.05]
  }],
  ["particles", "Particles", "Specks swirling round two cores in every cell.", {
    count: ["Particles", 1, 8, 5, 1],
    swirl: ["Swirl", 0.05, 0.3, 0.15, 0.01],
    cores: ["Cores", 0, 1, 0.5, 0.05]
  }],
  ["p2p-mesh", "P2P mesh", "Nodes linked to their neighbours, packets running between them.", {
    links: ["Links", 0, 1, 0.6, 0.05],
    packets: ["Packets", 0, 1, 0.6, 0.05],
    jitter: ["Jitter", 0, 0.45, 0.3, 0.01]
  }],
  ["fluid-plus", "Fluid+", "A flowing liquid, shaded by its depth.", {
    flow: ["Flow", 0, 2, 1, 0.05],
    foam: ["Foam", 0, 1, 0.3, 0.05],
    depth: ["Depth", 0, 1, 0.15, 0.05]
  }],
  ["lava-flow", "Lava flow", "Plates of crust on glowing lava, flowing down.", {
    flow: ["Flow", 0, 1, 0.4, 0.05],
    heat: ["Heat", 0.02, 0.5, 0.2, 0.01],
    crust: ["Crust", 0, 1, 0.4, 0.05]
  }]
];
var PATTERN_RANGES = { scale: [0.25, 20, 2], width: [0.01, 0.3, 0.06], glow: [0, 1, 0.5], power: [0.5, 10, 3], speed: [0, 5, 1], background: [0, 1, 1] };
var COLOR = /^#[0-9a-f]{6}$/i;
var BY_NAME = new Map(PATTERNS2.map(([name, , , own = {}]) => [name, Object.entries(own)]));
var ownNumbers = (name) => (BY_NAME.get(name) ?? []).map(([key, [label, low, high, start, step, names]]) => [key, { label, low, high, start, step, ...names && { names } }]);
var patternOf = (value) => {
  if (!value || typeof value !== "object" || !BY_NAME.has(value.name))
    return;
  const pattern = { name: value.name };
  const held4 = (number, low, high) => Math.min(Math.max(number, low), high);
  for (const [key, [low, high]] of Object.entries(PATTERN_RANGES)) {
    if (Number.isFinite(value[key]))
      pattern[key] = held4(value[key], low, high);
  }
  for (const [key, { low, high, step }] of ownNumbers(value.name)) {
    if (Number.isFinite(value[key]))
      pattern[key] = held4(step === 1 ? Math.round(value[key]) : value[key], low, high);
  }
  if (Array.isArray(value.colors) && value.colors.length === 2 && value.colors.every((c) => typeof c === "string" && COLOR.test(c)))
    pattern.colors = value.colors.map((c) => c.toLowerCase());
  if (value.multicolor === true)
    pattern.multicolor = true;
  return pattern;
};

// src/build/edit/check.js
init_solid();
var lowestOf = ({ at, size, rotation = [0, 0, 0, 1] }) => Math.min(...Array.from({ length: 8 }, (_, i) => at[2] + quatRotate(rotation, [i & 4 ? size[0] / 2 : -size[0] / 2, i & 2 ? size[1] / 2 : -size[1] / 2, i & 1 ? size[2] / 2 : -size[2] / 2])[2]));
var LINKSET = 256;
var LIGHT_RANGE = 10;
var LIGHTS_EACH = 8;
var NEAR2 = 30;
var DENSE_CAGE = 400;
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
var landHolds = ({ at, step, size, heights } = {}) => Array.isArray(at) && at.length === 2 && at.every(Number.isFinite) && step >= 0.25 && step <= 8 && Array.isArray(size) && size.length === 2 && size.every((n) => Number.isInteger(n) && n >= 2) && size[0] * size[1] <= 512 * 512 && typeof heights === "string" && heights.length === Math.ceil(size[0] * size[1] * 2 / 3) * 4;
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
var checkBuild = (spec, { materials, isSpecies, groundRadius, bareRadius = groundRadius, waterRadius = null, landRadius = null, id = "check", zone = null, budget = BUDGET }) => {
  const errors = [], notes = [];
  const placed = { ...spec, anchor: spec.anchor ?? NOWHERE };
  let records = [], warnings = [];
  try {
    ({ records, warnings } = placeBuild(placed, { groundRadius: groundRadius ?? (() => R), bareRadius: bareRadius ?? (() => R), ...waterRadius && { waterRadius }, ...landRadius && { landRadius }, materials, id }));
  } catch (error) {
    if (error.name === "KindNotLoaded")
      throw error;
    errors.push(error.message);
  }
  for (const warning of warnings) {
    if (/no parameter|"/.test(warning))
      errors.push(warning);
    else
      notes.push(`held to range: ${warning}`);
  }
  if (waterRadius && groundRadius) {
    const placedTrees = records.filter((each) => each.type === "tree");
    const buried = (spec.trees ?? []).flatMap((tree, n) => {
      const record = placedTrees[n];
      if (!record || tree.at?.length !== 2 || !floatsOn(tree.species))
        return [];
      const dir = normalize(record.at);
      const water = waterRadius(dir);
      return water !== null && groundRadius(dir) > water + 0.01 ? [`tree ${n} (${tree.species}) at [${tree.at}]: ${(groundRadius(dir) - water).toFixed(2)} m under the ground — it floats on a lake's water: dig the land there below its parcel's water`] : [];
    });
    errors.push(...buried);
  }
  if (spec.land !== undefined && !landHolds(spec.land))
    errors.push("its land does not hold: { at: [x, y], step (0.25–8 m), size: [nx, ny], heights: base64 int16 centimetres }");
  const frame = frameOfAnchor(placed.anchor, spec.land || placed.anchor.bare ? bareRadius : groundRadius);
  const meshes = new Map;
  const meshOf = (part) => {
    const made4 = part.kind ? kindMesh(part) : null;
    const key = made4 ? made4.key : part.shape.join();
    if (!meshes.has(key)) {
      const levels = [0, 1, 2, 3].map((level) => made4 ? made4.mesh(level) : meshPrimAsset(part.shape, level));
      meshes.set(key, {
        triangles: levels.map((mesh) => mesh.indices.length / 3),
        faces: levels[3].slots.map((slot) => slot.count > 0),
        flat: levels[3].slots.map((_, slot) => Boolean(facePlane(levels[3], slot)))
      });
    }
    return meshes.get(key);
  };
  const prims = records.filter((record) => record.type === "prim");
  const texturesOf = (part) => [part.surface?.texture, ...Object.values(part.surface?.faces ?? {}).map((face2) => face2.texture)].filter(Boolean);
  const unknown = new Set, sizeless = new Set;
  let seeThrough = 0, cutOut = 0;
  const screened = new Map, untrusted = new Set;
  let dropped = 0, droppedPages = 0;
  const unread = new Set;
  const patterned = new Set, strangePatterns = new Set;
  let mirrorFaces = 0;
  const curvedMirrors = new Set;
  const valuesOf = (html, attribute) => [...html.matchAll(new RegExp(`${attribute}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, "gi"))].map(([, double, single]) => double ?? single);
  for (const part of prims) {
    if (part.kind)
      for (const reason of kindOf(part.kind)?.reasons?.(part.params) ?? [])
        notes.push(`${part.id}: ${part.kind}: ${reason}`);
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
      if (material?.effects?.mirror) {
        mirrorFaces++;
        if (!meshOf(part).flat[face2])
          curvedMirrors.add(`${part.name ?? "a prim"} (face ${face2})`);
      }
      const pattern = own?.pattern ?? part.surface?.pattern;
      if (pattern) {
        const kept2 = patternOf(pattern);
        if (kept2)
          patterned.add(JSON.stringify(kept2));
        else
          strangePatterns.add(String(pattern?.name ?? pattern));
      }
      const media = own?.media ?? (own?.page ? null : part.surface?.media);
      const page = !media && (own?.page ?? part.surface?.page);
      if (page) {
        if (typeof page.html !== "string" || page.html.length > 8192)
          return void droppedPages++;
        for (const text of valuesOf(page.html, "data-on-click"))
          if (!actionOf(text))
            unread.add(`data-on-click="${text}"`);
        for (const text of valuesOf(page.html, "data-show"))
          if (!showOf(text))
            unread.add(`data-show="${text}"`);
        for (const text of valuesOf(page.html, "data-drag"))
          if (text && (!actionOf(`set ${text} here`) || /\s/.test(text)))
            unread.add(`data-drag="${text}"`);
        const [faces2, videos2, pages2] = screened.get(part) ?? [0, 0, 0];
        return void screened.set(part, [faces2, videos2, pages2 + 1]);
      }
      if (!media)
        return;
      if (isLiveUrl(media.url)) {
        const [faces2, videos2, pages2] = screened.get(part) ?? [0, 0, 0];
        return void screened.set(part, [faces2 + 1, videos2 + 1, pages2]);
      }
      const url = typeof media.url === "string" && media.url.length <= 512 && URL.canParse(media.url) ? new URL(media.url) : null;
      if (url?.protocol !== "https:" || url.username || url.password) {
        dropped++;
        return;
      }
      const [faces, videos, pages] = screened.get(part) ?? [0, 0, 0];
      screened.set(part, [faces + 1, videos + (isPicture(url.href) ? 0 : 1), pages]);
      if (!GIPHY_HOSTS.includes(url.host))
        untrusted.add(url.host);
    });
  }
  if (unknown.size)
    errors.push(`no such material: ${[...unknown].join(", ")}`);
  if (strangePatterns.size)
    errors.push(`no such pattern: ${[...strangePatterns].join(", ")} (format.md, Surface; catalog.json, patterns)`);
  if (patterned.size > 256)
    notes.push(`${patterned.size} patterns, each its own settings: 256 show at once, the others none — the same settings on many faces`);
  if (curvedMirrors.size)
    notes.push(`a mirror on a face that is not flat — ${[...curvedMirrors].join(", ")}: it mirrors the surroundings as metal does, never what stands before it; put it on a flat face (format.md, Mirrors)`);
  if (mirrorFaces > 1)
    notes.push(`${mirrorFaces} mirror faces: one at a time shows what stands before it — of those on, the one taking most of the screen —, the others the surroundings as metal does`);
  for (const texture of sizeless)
    notes.push(`${texture}: the bank gives it no real size — give its faces a \`scale\` [u, v] in metres`);
  const lightOf = lightFor(materials);
  const objectRecords = records.filter((record) => record.type === "object");
  const clones = records.filter((record) => record.type === "instance");
  const objects = [], lights = [], systems = [];
  let finest = 0, second = 0, mediaFaces = 0, videoFaces = 0, pageFaces = 0;
  for (const object of objectRecords) {
    const own = prims.filter((part) => part.object === object.id);
    const copies = [object, ...clones.filter((clone) => clone.of === object.id)];
    const [, l1, , l3] = own.reduce((sum, part) => meshOf(part).triangles.map((t, i) => sum[i] + t), [0, 0, 0, 0]);
    if (own.length > LINKSET)
      errors.push(`${object.name}: ${own.length} parts, more than an object takes (${LINKSET}): split it`);
    own.forEach((part, n) => {
      if (part.size.some((v) => v > MAX_SIZE))
        errors.push(`${object.name}: part ${n} is ${part.size.map((v) => +v.toFixed(2)).join(" × ")} m, longer than a part may be (${MAX_SIZE} m along each axis): split it`);
    });
    finest += l3 * copies.length;
    second += l1 * copies.length;
    for (const [faces, videos, pages] of own.map((part) => screened.get(part)).filter(Boolean)) {
      mediaFaces += faces * copies.length;
      videoFaces += videos * copies.length;
      pageFaces += pages * copies.length;
    }
    const lit = own.map(lightOf).filter(Boolean);
    const thrown = own.flatMap((part) => part.collisionOnly ? [] : systemsOf(part.particles));
    for (const copy of copies) {
      const at = frame.inFrame(copy.at);
      lights.push(...lit.map((light) => ({ ...light, at, object: object.name })));
      systems.push(...thrown.map((system) => ({ ...system, at, object: object.name })));
    }
    objects.push({ id: object.id, name: object.name, parts: own.length, copies: copies.length, triangles: [l3, l1], lights: lit.length, systems: thrown.length });
  }
  const objectNames = new Map(objectRecords.map((object) => [object.id, object.name]));
  for (const part of prims) {
    const bodies = part.kind === "solid" ? part.params?.bodies ?? [] : [];
    const step = bodies.findIndex((body) => body.smooth);
    const cage = step > 0 ? trianglesOfBodies(bodies.slice(0, step)) : 0;
    if (cage > DENSE_CAGE)
      notes.push(`${objectNames.get(part.object) ?? "a part"}: a solid smoothed over a cage of ${cage} triangles, every one drawn far away — few sections and points where its form turns hold it, ${DENSE_CAGE} at most`);
  }
  const vehicles = objectRecords.filter((object) => object.vehicle);
  for (const object of vehicles) {
    const own = prims.filter((part) => part.object === object.id);
    const wheels = wheelsOf(own.map((part) => ({ ...part, position: part.at })));
    const { type } = object.vehicle;
    if ((type === "car" || type === "bike" || type === "bicycle") && wheels.length < 2)
      errors.push(`${object.name}: a ${type} runs on its wheels — two or more cylinders lying across it, "turn": [0, 90, 0]`);
    if (type === "bike" && wheels.length > 2)
      notes.push(`${object.name}: ${wheels.length} cylinders lie across it — a bike runs on its front and back ones; make any other a box, or phantom`);
    if (type === "bicycle" && wheels.length === 2)
      notes.push(`${object.name}: no crank — a cylinder lying across it between its wheels ("collisionOnly": true), its arms and pedals within it, turns as its rider pedals`);
    if (type === "bicycle" && own.some((part) => part.seat) && !own.some((part) => part.seat?.pose === PEDALLING))
      notes.push(`${object.name}: nobody pedals it — give its saddle the pose Pedalling ("seat": { "pose": "${PEDALLING}" })`);
    if (type === "train" && object.behaviour?.type !== "route")
      errors.push(`${object.name}: a train keeps to its route — give the object a "route" behaviour`);
    if ((type === "ship" || type === "submarine") && !own.some((part) => !part.phantom && lowestOf(part) < 0))
      errors.push(`${object.name}: a ${type} floats at its waterline, its frame's z = 0 — nothing of its hull reaches under it`);
    if (type === "plane" && object.vehicle.speed < object.vehicle.lift)
      notes.push(`${object.name}: its top speed is under its take-off speed — a plane that never leaves the ground ("speed" ≥ "lift")`);
    if (type === "helicopter" && !own.some((part) => part.behaviour?.type === "spin"))
      notes.push(`${object.name}: nothing of it turns — a helicopter's rotors are its parts that turn ("behaviour": { "type": "spin" }), phantom`);
    if (!own.some((part) => part.seat))
      notes.push(`${object.name}: no seat — nobody can drive it ("seat": true on the part sat on)`);
    if (clones.some((clone) => clone.of === object.id))
      notes.push(`${object.name}: its clones are not driven — only the object itself; make each vehicle an object of its own`);
  }
  const runs = new Set(objectRecords.filter((object) => object.vehicle || object.behaviour?.type === "route").map((object) => object.id));
  const idle = new Set(prims.filter((part) => !runs.has(part.object) && layersOf(part.particles).some((layer2) => layer2?.running === true)).map((part) => part.object ?? null));
  for (const id2 of idle)
    notes.push(`${objectRecords.find((object) => object.id === id2)?.name ?? "a prim"}: particles thrown only while it runs ("running": true), yet it is no vehicle and runs no route — never seen`);
  const trees = records.filter((record) => record.type === "tree");
  const strange = [...new Set(trees.map((tree) => tree.species).filter((species) => !isSpecies(species)))];
  if (strange.length)
    errors.push(`no such species: ${strange.join(", ")}`);
  if (dropped)
    notes.push(`${dropped} ${dropped > 1 ? "faces'" : "face's"} media not an https address (512 characters at most): dropped`);
  if (droppedPages)
    notes.push(`${droppedPages} ${droppedPages > 1 ? "faces'" : "face's"} page not HTML of 8,192 characters at most: dropped`);
  if (unread.size)
    notes.push(`${[...unread].join(", ")}: not read, nothing done — an action is add, set, toggle, push, remove or clear and a name (letters, digits, . - _, 32 at most), what is shown a name and maybe .last, .when or a value, what moves a name (format.md, Pages)`);
  if (mediaFaces > SHOWING)
    notes.push(`${mediaFaces} faces show media: only the ${SHOWING} nearest show at once, the others nothing (a picture's) or their own material (a video's) till nearer — give it to fewer faces (a board's front, not its whole surface), or set them apart`);
  if (pageFaces > SHOWING + STILLS)
    notes.push(`${pageFaces} faces show a page: the ${SHOWING} nearest drawn as they change and ${STILLS} more still, at once, the others their own material till nearer — give it to fewer faces (a board's front, not its whole surface), or set them apart`);
  if (videoFaces > PLAYING)
    notes.push(`${videoFaces} faces show videos: ${PLAYING} play at once, the nearest`);
  for (const host of untrusted)
    notes.push(`${host}: not a host the world trusts — each viewer but its owner starts its media with a click (GIPHY's play by themselves)`);
  const most = (list) => list.reduce((top, each) => Math.max(top, list.filter((other) => Math.hypot(other.at[0] - each.at[0], other.at[1] - each.at[1]) < NEAR2).length), 0);
  const crowd = most(lights);
  const moving = records.filter((record) => record.behaviour && record.behaviour.type !== "switch" && record.behaviour.type !== "passage").length + clones.filter((clone) => !clone.behaviour && objectRecords.find((object) => object.id === clone.of)?.behaviour).length;
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
    media: mediaFaces,
    videos: videoFaces,
    pages: pageFaces,
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
  const NAMES = { crowd: `lights within ${NEAR2} m of one another`, systems: "particle systems", particles: "particles in the air", moving: "things moving by themselves" };
  for (const [key, { fair, most: max }] of Object.entries(budget ?? {})) {
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
// tools/build-check.js
import { readdirSync } from "node:fs";

// src/planet.js
var FACES2 = [
  { id: 0, normal: [1, 0, 0], u: [0, 0, -1], v: [0, 1, 0] },
  { id: 1, normal: [-1, 0, 0], u: [0, 0, 1], v: [0, 1, 0] },
  { id: 2, normal: [0, 1, 0], u: [1, 0, 0], v: [0, 0, -1] },
  { id: 3, normal: [0, -1, 0], u: [1, 0, 0], v: [0, 0, 1] },
  { id: 4, normal: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0] },
  { id: 5, normal: [0, 0, -1], u: [-1, 0, 0], v: [0, 1, 0] }
];

// src/land/lattice.js
var NODES = 2 ** 23;
var CHUNK = 32;
var CHUNK_NODES = CHUNK * CHUNK;
var CHUNKS = NODES / CHUNK;
var EMPTY = -32768;
var APRON = 2;
var JOIN = 8;
var MOST_BOXES2 = 32;
var SPAN3 = 2 ** 18;
var ROCK_WORDS = CHUNK_NODES / 32;
var NODE_METRES = 12696000 / NODES;
var chunkKey = (face2, cx, cy) => `${face2}/${cx}/${cy}`;
var chunkOf = (key) => {
  const parts = String(key ?? "").split("/");
  if (parts.length !== 3 || !parts.every((part) => /^\d+$/.test(part)))
    return null;
  const [face2, cx, cy] = parts.map(Number);
  return FACES2[face2] && cx < CHUNKS && cy < CHUNKS ? { face: face2, cx, cy } : null;
};
var chunkNumber = (face2, cx, cy) => (face2 * SPAN3 + cx) * SPAN3 + cy;
var parcelOfChunk = ({ face: face2, cx, cy }) => ({ face: face2, x: cx >> 3, y: cy >> 3 });
var nodeDirection = (face2, i, j) => {
  const { normal, u, v } = FACES2[face2];
  return normalize(add(normal, add(scale(u, 2 * i / NODES - 1), scale(v, 2 * j / NODES - 1))));
};
var latticeOf = (point) => {
  const face2 = FACES2.reduce((best, f) => dot(point, f.normal) > dot(point, best.normal) ? f : best);
  const along3 = 1 / dot(point, face2.normal);
  return { face: face2.id, x: (dot(point, face2.u) * along3 + 1) / 2 * NODES, y: (dot(point, face2.v) * along3 + 1) / 2 * NODES };
};
var REACH6 = 3;
var NODE_LEVEL = 17;
var SEGMENTS_BITS = 6;
var texelsOf = (level, x, y, border) => {
  const shift = NODE_LEVEL - level;
  const span = ([first, last]) => shift >= 0 ? [first * 2 ** shift, last * 2 ** shift] : [Math.floor(first / 2 ** -shift), Math.ceil(last / 2 ** -shift)];
  return {
    x: span([(x << SEGMENTS_BITS) - border, (x << SEGMENTS_BITS) + (1 << SEGMENTS_BITS) + border]),
    y: span([(y << SEGMENTS_BITS) - border, (y << SEGMENTS_BITS) + (1 << SEGMENTS_BITS) + border]),
    step: 2 ** Math.max(shift, 0)
  };
};
var anyWithin = ([first, last], step, low, high) => {
  const from = Math.max(first, Math.ceil(low / step) * step);
  return from <= Math.min(last, high);
};
var tileReads = (level, x, y, [, i0, j0, i1, j1]) => {
  const { x: across, y: down, step } = texelsOf(level, x, y, 2);
  return anyWithin(across, step, i0 - REACH6, i1 + REACH6) && anyWithin(down, step, j0 - REACH6, j1 + REACH6);
};
var weights = (t) => {
  const t2 = t * t;
  const t3 = t2 * t;
  return [(-t3 + 2 * t2 - t) / 2, (3 * t3 - 5 * t2 + 2) / 2, (-3 * t3 + 4 * t2 + t) / 2, (t3 - t2) / 2];
};
var slopes = (t) => {
  const t2 = t * t;
  return [(-3 * t2 + 4 * t - 1) / 2, (9 * t2 - 10 * t) / 2, (-9 * t2 + 8 * t + 1) / 2, (3 * t2 - 2 * t) / 2];
};
var texelHash = (a, b, c, d) => {
  let [x, y, z, w] = [a, b, c, d].map((k) => Math.imul(k, 1664525) + 1013904223 >>> 0);
  x = x + Math.imul(y, w) >>> 0;
  y = y + Math.imul(z, x) >>> 0;
  z = z + Math.imul(x, y) >>> 0;
  w = w + Math.imul(y, z) >>> 0;
  [x, y, z, w] = [x, y, z, w].map((k) => (k ^ k >>> 16) >>> 0);
  x = x + Math.imul(y, w) >>> 0;
  y = y + Math.imul(z, x) >>> 0;
  z = z + Math.imul(x, y) >>> 0;
  return (x >>> 8) / 8388607.5 - 1;
};
var fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
var latticeNoise = (x, y, level, face2, salt) => {
  const [i, j] = [Math.floor(x), Math.floor(y)];
  const [u, v] = [fade(x - i), fade(y - j)];
  const hash3 = (a, b) => texelHash(a >>> 0, b >>> 0, level + salt, face2);
  return (hash3(i, j) * (1 - u) + hash3(i + 1, j) * u) * (1 - v) + (hash3(i, j + 1) * (1 - u) + hash3(i + 1, j + 1) * u) * v;
};
var ROCK_FROM = 15;
var ROCK_TO = 21;
var ROCK_SCALE = 0.3;
var ROCK_SALT = 64;
var rockRelief = (face2, x, y, slope) => {
  let sum = 0;
  for (let level = ROCK_FROM;level <= ROCK_TO; level++) {
    const scale4 = 2 ** (level - 17);
    const ridge = 1 - Math.abs(latticeNoise(x * scale4, y * scale4, level, face2, ROCK_SALT));
    sum += (ridge * ridge - 1 / 3) * NODE_METRES / scale4;
  }
  const steep = Math.min(Math.max((slope - 0.35) / 0.85, 0), 1);
  return sum * ROCK_SCALE * (0.35 + 0.65 * steep * steep * (3 - 2 * steep));
};
var createLandField = ({ bare }) => {
  const edits = new Map;
  const rocks = new Map;
  const values = new Map;
  const bares = new Map;
  const faces = new Map;
  let version = 0;
  const index = (i, j) => (j & CHUNK - 1) * CHUNK + (i & CHUNK - 1);
  const inside = (i, j) => i >= 0 && j >= 0 && i < NODES && j < NODES;
  const editAt = (face2, i, j) => inside(i, j) ? edits.get(chunkNumber(face2, i >> 5, j >> 5))?.[index(i, j)] ?? NaN : NaN;
  const valueAt = (face2, i, j) => inside(i, j) ? values.get(chunkNumber(face2, i >> 5, j >> 5))?.[index(i, j)] ?? 0 : 0;
  const rockAt = (face2, i, j) => {
    const bits = inside(i, j) && rocks.get(chunkNumber(face2, i >> 5, j >> 5));
    if (!bits)
      return 0;
    const k = index(i, j);
    return bits[k >>> 5] >>> (k & 31) & 1;
  };
  const bareAt = (face2, i, j) => {
    const key = chunkNumber(face2, i >> 5, j >> 5);
    let chunk2 = bares.get(key);
    if (!chunk2)
      bares.set(key, chunk2 = new Float64Array(CHUNK_NODES).fill(NaN));
    const k = index(i, j);
    if (Number.isNaN(chunk2[k]))
      chunk2[k] = bare(nodeDirection(face2, i, j));
    return chunk2[k];
  };
  const warm = (face2, i0, j0, i1, j1, until) => {
    for (let j = Math.max(j0, 0);j <= Math.min(j1, NODES - 1); j++) {
      if (performance.now() > until)
        return false;
      for (let i = Math.max(i0, 0);i <= Math.min(i1, NODES - 1); i++)
        bareAt(face2, i, j);
    }
    return true;
  };
  const heightAt = (face2, i, j) => {
    const edited = editAt(face2, i, j);
    return Number.isNaN(edited) ? bareAt(face2, i, j) : edited;
  };
  const nearEdit = (face2, i0, j0, i1, j1) => {
    const [e0, f0] = [Math.max(i0 - APRON, 0), Math.max(j0 - APRON, 0)];
    const [e1, f1] = [Math.min(i1 + APRON, NODES - 1), Math.min(j1 + APRON, NODES - 1)];
    const width = e1 - e0 + 1;
    const marked = new Uint8Array(width * (f1 - f0 + 1));
    for (let cy = f0 >> 5;cy <= f1 >> 5; cy++) {
      for (let cx = e0 >> 5;cx <= e1 >> 5; cx++) {
        const kept2 = edits.get(chunkNumber(face2, cx, cy));
        if (!kept2)
          continue;
        for (let j = Math.max(f0, cy * CHUNK);j <= Math.min(f1, cy * CHUNK + CHUNK - 1); j++) {
          for (let i = Math.max(e0, cx * CHUNK);i <= Math.min(e1, cx * CHUNK + CHUNK - 1); i++) {
            if (!Number.isNaN(kept2[index(i, j)]))
              marked[(j - f0) * width + i - e0] = 1;
          }
        }
      }
    }
    return (i, j) => {
      for (let b = Math.max(j - APRON, f0);b <= Math.min(j + APRON, f1); b++) {
        for (let a = Math.max(i - APRON, e0);a <= Math.min(i + APRON, e1); a++)
          if (marked[(b - f0) * width + a - e0])
            return true;
      }
      return false;
    };
  };
  const changed = new Set;
  const boxes = [];
  const keepBox = (face2, i0, j0, i1, j1) => {
    const near = boxes.find((box) => box[0] === face2 && i0 <= box[3] + JOIN && box[1] <= i1 + JOIN && j0 <= box[4] + JOIN && box[2] <= j1 + JOIN) ?? (boxes.length >= MOST_BOXES2 ? boxes.find((box) => box[0] === face2) : null);
    if (!near)
      return boxes.push([face2, i0, j0, i1, j1]);
    near.splice(1, 4, Math.min(near[1], i0), Math.min(near[2], j0), Math.max(near[3], i1), Math.max(near[4], j1));
  };
  const derive = (face2, i0, j0, i1, j1) => {
    const [a0, b0] = [Math.max(i0 - APRON, 0), Math.max(j0 - APRON, 0)];
    const [a1, b1] = [Math.min(i1 + APRON, NODES - 1), Math.min(j1 + APRON, NODES - 1)];
    const near = nearEdit(face2, a0, b0, a1, b1);
    let [c0, d0, c1, d1] = [Infinity, Infinity, -Infinity, -Infinity];
    for (let cy = b0 >> 5;cy <= b1 >> 5; cy++) {
      for (let cx = a0 >> 5;cx <= a1 >> 5; cx++) {
        const key = chunkNumber(face2, cx, cy);
        const kept2 = edits.get(key);
        let chunk2 = values.get(key);
        for (let j = Math.max(b0, cy * CHUNK);j <= Math.min(b1, cy * CHUNK + CHUNK - 1); j++) {
          for (let i = Math.max(a0, cx * CHUNK);i <= Math.min(a1, cx * CHUNK + CHUNK - 1); i++) {
            const k = index(i, j);
            const height = kept2 ? kept2[k] : NaN;
            const value = Number.isNaN(height) ? near(i, j) ? -bareAt(face2, i, j) : 0 : height;
            if (!chunk2) {
              if (value === 0)
                continue;
              values.set(key, chunk2 = new Float32Array(CHUNK_NODES));
              faces.set(face2, (faces.get(face2) ?? 0) + 1);
            }
            if (chunk2[k] === Math.fround(value))
              continue;
            chunk2[k] = value;
            changed.add(key);
            if (i < c0)
              c0 = i;
            if (j < d0)
              d0 = j;
            if (i > c1)
              c1 = i;
            if (j > d1)
              d1 = j;
          }
        }
      }
    }
    if (c1 >= c0)
      keepBox(face2, c0, d0, c1, d1);
    for (const key of changed) {
      const chunk2 = values.get(key);
      if (chunk2 && chunk2.every((value) => value === 0)) {
        values.delete(key);
        const face3 = Math.floor(key / SPAN3 / SPAN3);
        faces.set(face3, faces.get(face3) - 1);
      }
    }
    version++;
  };
  const setRock = (face2, cx, cy, bits) => {
    const key = chunkNumber(face2, cx, cy);
    const kept2 = edits.get(key);
    const next = kept2 && bits ? Uint32Array.from(bits, (word, w) => {
      let edited = 0;
      for (let b = 0;b < 32; b++)
        if (!Number.isNaN(kept2[w * 32 + b]))
          edited |= 1 << b;
      return (word & edited) >>> 0;
    }) : null;
    const rock2 = next?.some(Boolean) ? next : null;
    const before = rocks.get(key);
    if ((before ?? null) === rock2 || before && rock2 && before.every((word, w) => word === rock2[w]))
      return;
    if (rock2)
      rocks.set(key, rock2);
    else
      rocks.delete(key);
    changed.add(key);
    keepBox(face2, cx * CHUNK - 1, cy * CHUNK - 1, cx * CHUNK + CHUNK, cy * CHUNK + CHUNK);
  };
  const setChunk = (face2, cx, cy, kept2) => {
    const key = chunkNumber(face2, cx, cy);
    if (kept2?.heights.some((h) => !Number.isNaN(h)))
      edits.set(key, Float32Array.from(kept2.heights));
    else if (edits.delete(key))
      rocks.delete(key);
    else
      return setRock(face2, cx, cy, null);
    derive(face2, cx * CHUNK, cy * CHUNK, cx * CHUNK + CHUNK - 1, cy * CHUNK + CHUNK - 1);
    setRock(face2, cx, cy, kept2?.rock ?? null);
  };
  const chunk = (face2, cx, cy) => {
    const key = chunkNumber(face2, cx, cy);
    const kept2 = edits.get(key);
    return kept2 ? { heights: Float32Array.from(kept2), rock: rocks.has(key) ? Uint32Array.from(rocks.get(key)) : null } : null;
  };
  const setNodes = (nodes) => {
    const touched = new Set;
    const boxes2 = new Map;
    const stones = new Map;
    let last = -1;
    let kept2 = null;
    let cleared = false;
    let [face2, box] = [-1, null];
    for (let n = 0;n < nodes.length; n++) {
      const node = nodes[n];
      const i = node[1];
      const j = node[2];
      const height = node[3];
      const rock2 = node[4];
      if (!inside(i, j))
        continue;
      if (node[0] !== face2)
        [face2, box] = [node[0], boxes2.get(node[0]) ?? null];
      const key = chunkNumber(face2, i >> 5, j >> 5);
      if (key !== last)
        [last, kept2] = [key, edits.get(key)];
      if (!kept2) {
        if (Number.isNaN(height))
          continue;
        edits.set(key, kept2 = new Float32Array(CHUNK_NODES).fill(NaN));
      }
      const k = index(i, j);
      kept2[k] = height;
      if (Number.isNaN(height))
        cleared = true;
      if (rock2 !== undefined || Number.isNaN(height)) {
        if (!stones.has(key))
          stones.set(key, Uint32Array.from(rocks.get(key) ?? new Uint32Array(ROCK_WORDS)));
        const bits = stones.get(key);
        bits[k >>> 5] = (rock2 && !Number.isNaN(height) ? bits[k >>> 5] | 1 << (k & 31) : bits[k >>> 5] & ~(1 << (k & 31))) >>> 0;
      }
      touched.add(key);
      if (!box)
        boxes2.set(face2, box = [i, j, i, j]);
      if (i < box[0])
        box[0] = i;
      if (j < box[1])
        box[1] = j;
      if (i > box[2])
        box[2] = i;
      if (j > box[3])
        box[3] = j;
    }
    if (cleared) {
      for (const key of touched)
        if (edits.get(key)?.every(Number.isNaN))
          edits.delete(key);
    }
    for (const [face3, box2] of boxes2)
      derive(face3, ...box2);
    for (const [key, bits] of stones) {
      const { face: face3, cx, cy } = chunkOfNumber(key);
      setRock(face3, cx, cy, bits);
    }
    return new Set(Array.from(touched, (key) => {
      const { face: face3, cx, cy } = chunkOfNumber(key);
      return chunkKey(face3, cx, cy);
    }));
  };
  const elevation = (dir, ground = bare) => {
    if (!values.size)
      return ground(dir);
    const { face: face2, x, y } = latticeOf(dir);
    if (!faces.get(face2))
      return ground(dir);
    const i = Math.floor(x);
    const j = Math.floor(y);
    const fx = x - i;
    const fy = y - j;
    const c00 = valueAt(face2, i, j);
    const c10 = valueAt(face2, i + 1, j);
    const c01 = valueAt(face2, i, j + 1);
    const c11 = valueAt(face2, i + 1, j + 1);
    const [e00, e10, e01, e11] = [c00 > 0, c10 > 0, c01 > 0, c11 > 0].map(Number);
    const weight = (e00 * (1 - fx) + e10 * fx) * (1 - fy) + (e01 * (1 - fx) + e11 * fx) * fy;
    if (weight <= 0)
      return ground(dir);
    const reference = (c00 * e00 + c10 * e10 + c01 * e01 + c11 * e11) / (e00 + e10 + e01 + e11);
    const wx = weights(fx);
    const wy = weights(fy);
    let sum = 0;
    for (let b = 0;b < 4; b++) {
      let row = 0;
      for (let a = 0;a < 4; a++) {
        const value = valueAt(face2, i + a - 1, j + b - 1);
        if (value !== 0)
          row += wx[a] * (Math.abs(value) - reference);
      }
      sum += wy[b] * row;
    }
    let height = reference + sum;
    const rock2 = rocks.size ? (rockAt(face2, i, j) * (1 - fx) + rockAt(face2, i + 1, j) * fx) * (1 - fy) + (rockAt(face2, i, j + 1) * (1 - fx) + rockAt(face2, i + 1, j + 1) * fx) * fy : 0;
    if (rock2 > 0) {
      const [dx, dy] = [slopes(fx), slopes(fy)];
      let [gx, gy] = [0, 0];
      for (let b = 0;b < 4; b++) {
        for (let a = 0;a < 4; a++) {
          const value = valueAt(face2, i + a - 1, j + b - 1);
          if (value === 0)
            continue;
          gx += wy[b] * dx[a] * (Math.abs(value) - reference);
          gy += dy[b] * wx[a] * (Math.abs(value) - reference);
        }
      }
      height += rock2 * rockRelief(face2, x, y, Math.hypot(gx, gy) / NODE_METRES);
    }
    if (weight >= 1)
      return height;
    const base = ground(dir);
    return base + weight * (height - base);
  };
  const taken = () => {
    const out = { chunks: [...changed], boxes: boxes.splice(0) };
    changed.clear();
    return out;
  };
  const untaken = (face2, level, x, y) => boxes.some((box) => box[0] === face2 && tileReads(level, x, y, box));
  return {
    elevation,
    editAt,
    heightAt,
    bareAt,
    warm,
    rockAt,
    setChunk,
    setNodes,
    chunk,
    taken,
    untaken,
    values: (key) => values.get(key),
    rockBits: (key) => rocks.get(key),
    get rockNodes() {
      let count = 0;
      for (const bits of rocks.values())
        for (const word of bits)
          for (let rest = word;rest; rest &= rest - 1)
            count++;
      return count;
    },
    valueKeys: () => [...values.keys()],
    editedKeys: () => [...edits.keys()].map((key) => chunkKey(Math.floor(key / SPAN3 / SPAN3), Math.floor(key / SPAN3) % SPAN3, key % SPAN3)),
    get version() {
      return version;
    },
    get empty() {
      return edits.size === 0;
    },
    get dirty() {
      return changed.size > 0;
    }
  };
};
var chunkOfNumber = (key) => ({ face: Math.floor(key / SPAN3 / SPAN3), cx: Math.floor(key / SPAN3) % SPAN3, cy: key % SPAN3 });

// src/parcel.js
var PARCEL_LEVEL = 15;

// src/land/water.js
var SEA2 = 12000;
var PARCEL_NODES = NODES / 2 ** PARCEL_LEVEL;
var CELLS = 32;
var CELL_NODES = PARCEL_NODES / CELLS;
var UNDER_RIM = 0.5;
var RIM_STEP = 4;
var QUIET = 150;
var FADE = 0.3;
var seaFade = (over) => {
  const t = Math.min(Math.max((over + FADE) / (2 * FADE), 0), 1);
  return t * t * (3 - 2 * t);
};
var parcelName = ({ face: face2, x, y }) => `${face2}/${x}/${y}`;
var grown = (cells) => {
  const out = new Uint8Array(CELLS * CELLS);
  for (let b = 0;b < CELLS; b++) {
    for (let a = 0;a < CELLS; a++) {
      if (!cells[b * CELLS + a])
        continue;
      for (let y = Math.max(b - 1, 0);y <= Math.min(b + 1, CELLS - 1); y++) {
        for (let x = Math.max(a - 1, 0);x <= Math.min(a + 1, CELLS - 1); x++)
          out[y * CELLS + x] = 1;
      }
    }
  }
  return out;
};
var createWater = ({ field, bare }) => {
  const tables = new Map;
  const corners = new Map;
  const lakes = new Map;
  let version = 0;
  let changedAt = null;
  const tableOf = (name, { face: face2, x, y }) => {
    if (tables.has(name))
      return tables.get(name);
    const [i0, j0] = [x * PARCEL_NODES, y * PARCEL_NODES];
    const ground = (i, j) => bare(nodeDirection(face2, Math.min(i, NODES - 1), Math.min(j, NODES - 1)));
    let rim = Infinity;
    for (let k = 0;k <= PARCEL_NODES; k += RIM_STEP) {
      rim = Math.min(rim, ground(i0 + k, j0), ground(i0 + k, j0 + PARCEL_NODES), ground(i0, j0 + k), ground(i0 + PARCEL_NODES, j0 + k));
    }
    const table = Math.max(rim - UNDER_RIM, SEA2);
    tables.set(name, table);
    return table;
  };
  const cornerOf2 = (name, { face: face2, x, y }, a, b) => {
    if (!corners.has(name))
      corners.set(name, new Float64Array((CELLS + 1) ** 2).fill(NaN));
    const heights = corners.get(name);
    const k = b * (CELLS + 1) + a;
    if (Number.isNaN(heights[k])) {
      heights[k] = bare(nodeDirection(face2, Math.min(x * PARCEL_NODES + a * CELL_NODES, NODES - 1), Math.min(y * PARCEL_NODES + b * CELL_NODES, NODES - 1)));
    }
    return heights[k];
  };
  const coast = (name, parcel, cells) => {
    const ground = new Float32Array((CELLS + 1) ** 2).fill(NaN);
    for (let k = 0;k < cells.length; k++) {
      if (!cells[k])
        continue;
      const [a, b] = [k % CELLS, Math.floor(k / CELLS)];
      const around = [[a, b], [a + 1, b], [a, b + 1], [a + 1, b + 1]].map(([i, j]) => ground[j * (CELLS + 1) + i] = cornerOf2(name, parcel, i, j) - SEA2);
      if (around.every((height) => height <= 0))
        cells[k] = 0;
    }
    return cells.some(Boolean) ? ground : null;
  };
  const workOut = () => {
    const wet = new Map;
    let fresh = true;
    let done = true;
    for (const key of field.editedKeys()) {
      const chunk = chunkOf(key);
      const parcel = parcelOfChunk(chunk);
      const name = parcelName(parcel);
      if (!tables.has(name)) {
        if (!fresh) {
          done = false;
          continue;
        }
        fresh = false;
      }
      const level = tableOf(name, parcel);
      const [i0, j0] = [chunk.cx * CHUNK - parcel.x * PARCEL_NODES, chunk.cy * CHUNK - parcel.y * PARCEL_NODES];
      field.chunk(chunk.face, chunk.cx, chunk.cy).heights.forEach((height, k) => {
        if (!(height < level))
          return;
        if (!wet.has(name))
          wet.set(name, { parcel, level, cells: new Uint8Array(CELLS * CELLS) });
        const [a, b] = [Math.floor((i0 + k % CHUNK) / CELL_NODES), Math.floor((j0 + Math.floor(k / CHUNK)) / CELL_NODES)];
        wet.get(name).cells[b * CELLS + a] = 1;
      });
    }
    for (const [name, { parcel, level, cells }] of wet) {
      const drawn2 = grown(cells);
      const ground = level === SEA2 ? coast(name, parcel, drawn2) : null;
      if (level === SEA2 && !ground)
        wet.delete(name);
      const before = lakes.get(name);
      if (!wet.has(name) || before?.level === level && before.cells.every((cell, k) => cell === drawn2[k]) && before.dug.every((cell, k) => cell === cells[k]))
        continue;
      lakes.set(name, { name, parcel, level, cells: drawn2, dug: cells, ground, version: ++version });
    }
    for (const name of lakes.keys())
      if (!wet.has(name))
        lakes.delete(name);
    return done;
  };
  return {
    landChanged: (now) => {
      changedAt = now;
    },
    frame: (now) => {
      if (changedAt === null || now - changedAt < QUIET)
        return;
      changedAt = workOut() ? null : now - QUIET;
    },
    floatAt: (dir) => {
      const { face: face2, x, y } = latticeOf(dir);
      const [px, py] = [Math.floor(x / PARCEL_NODES), Math.floor(y / PARCEL_NODES)];
      const lake = lakes.get(parcelName({ face: face2, x: px, y: py }));
      if (!lake)
        return null;
      const [u, v] = [Math.min((x - px * PARCEL_NODES) / CELL_NODES, CELLS - 0.000001), Math.min((y - py * PARCEL_NODES) / CELL_NODES, CELLS - 0.000001)];
      const [a, b] = [Math.floor(u), Math.floor(v)];
      if (!lake.cells[b * CELLS + a] || !(field.elevation(dir) < lake.level))
        return null;
      if (lake.ground) {
        const [s, t] = [u - a, v - b];
        const fade2 = (k2) => seaFade(lake.ground[k2]);
        const k = b * (CELLS + 1) + a;
        const own = (fade2(k) * (1 - s) + fade2(k + 1) * s) * (1 - t) + (fade2(k + CELLS + 1) * (1 - s) + fade2(k + CELLS + 2) * s) * t;
        if (own < 0.5)
          return null;
      }
      return lake.level;
    },
    table: (parcel) => tableOf(parcelName(parcel), parcel),
    lakes: () => [...lakes.values()],
    levelAt: (dir) => {
      if (!lakes.size)
        return null;
      const { face: face2, x, y } = latticeOf(dir);
      const [px, py] = [Math.floor(x / PARCEL_NODES), Math.floor(y / PARCEL_NODES)];
      const lake = lakes.get(parcelName({ face: face2, x: px, y: py }));
      if (!lake)
        return null;
      const [a, b] = [Math.floor((x - px * PARCEL_NODES) / CELL_NODES), Math.floor((y - py * PARCEL_NODES) / CELL_NODES)];
      return lake.cells[Math.min(b, CELLS - 1) * CELLS + Math.min(a, CELLS - 1)] ? lake.level : null;
    },
    tableAt: (dir) => {
      const { face: face2, x, y } = latticeOf(dir);
      return tableOf(parcelName({ face: face2, x: Math.floor(x / PARCEL_NODES), y: Math.floor(y / PARCEL_NODES) }), { face: face2, x: Math.floor(x / PARCEL_NODES), y: Math.floor(y / PARCEL_NODES) });
    },
    get version() {
      return version;
    }
  };
};
// src/land/build-land.js
var MOST_SAMPLES2 = 512 * 512;
var fromBase642 = (text) => {
  try {
    return Uint8Array.from(atob(text), (char) => char.charCodeAt(0));
  } catch {
    return null;
  }
};
var readLand = (land2) => {
  if (!land2 || typeof land2 !== "object")
    return null;
  const { at, step, size, heights } = land2;
  if (!Array.isArray(at) || at.length !== 2 || !at.every(Number.isFinite) || !(step >= 0.25 && step <= 8))
    return null;
  if (!Array.isArray(size) || size.length !== 2 || !size.every((n) => Number.isInteger(n) && n >= 2) || size[0] * size[1] > MOST_SAMPLES2)
    return null;
  const bytes = typeof heights === "string" ? fromBase642(heights) : null;
  if (bytes?.length !== size[0] * size[1] * 2)
    return null;
  const view = new DataView(bytes.buffer);
  const samples = Float64Array.from({ length: size[0] * size[1] }, (_, k) => {
    const cm = view.getInt16(k * 2, true);
    return cm === EMPTY ? NaN : cm / 100;
  });
  return { at, step, size, samples };
};
var landHeight = ({ at: [x0, y0], step, size: [nx, ny], samples }, x, y) => {
  const fa = (x - x0) / step;
  const fb = (y - y0) / step;
  if (fa < 0 || fb < 0 || fa > nx - 1 || fb > ny - 1)
    return NaN;
  const a = Math.min(Math.floor(fa), nx - 2);
  const b = Math.min(Math.floor(fb), ny - 2);
  const [ta, tb] = [fa - a, fb - b];
  const at = (i, j) => samples[(b + j) * nx + a + i];
  return (at(0, 0) * (1 - ta) + at(1, 0) * ta) * (1 - tb) + (at(0, 1) * (1 - ta) + at(1, 1) * ta) * tb;
};
var landNodes = (land2, { origin, right, ahead, up }, radius) => {
  const { at: [x0, y0], step, size: [nx, ny] } = land2;
  const corners = [[x0, y0], [x0 + (nx - 1) * step, y0], [x0, y0 + (ny - 1) * step], [x0 + (nx - 1) * step, y0 + (ny - 1) * step]].map(([x, y]) => latticeOf(add(origin, add(scale(right, x), scale(ahead, y)))));
  const nodes = [];
  for (const face2 of new Set(corners.map((corner) => corner.face))) {
    const on = corners.filter((corner) => corner.face === face2);
    const [i0, i1] = [Math.max(Math.floor(Math.min(...on.map((c) => c.x))) - 2, 0), Math.min(Math.ceil(Math.max(...on.map((c) => c.x))) + 2, NODES - 1)];
    const [j0, j1] = [Math.max(Math.floor(Math.min(...on.map((c) => c.y))) - 2, 0), Math.min(Math.ceil(Math.max(...on.map((c) => c.y))) + 2, NODES - 1)];
    for (let j = j0;j <= j1; j++) {
      for (let i = i0;i <= i1; i++) {
        const dir = nodeDirection(face2, i, j);
        if (latticeOf(dir).face !== face2)
          continue;
        const point = scale(dir, dot(origin, up) / dot(dir, up));
        const offset = point.map((v, k) => v - origin[k]);
        const [x, y] = [dot(offset, right), dot(offset, ahead)];
        if (x < x0 || y < y0 || x > x0 + (nx - 1) * step || y > y0 + (ny - 1) * step)
          continue;
        const z = landHeight(land2, x, y);
        nodes.push([face2, i, j, Number.isNaN(z) ? NaN : length(add(point, scale(up, z))) - radius]);
      }
    }
  }
  return nodes;
};
var frameOf2 = ({ origin, heading }) => {
  const up = normalize(origin);
  const north = normalize([-up[0] * up[1], 1 - up[1] * up[1], -up[2] * up[1]]);
  const east = [north[1] * up[2] - north[2] * up[1], north[2] * up[0] - north[0] * up[2], north[0] * up[1] - north[1] * up[0]];
  const h = heading * Math.PI / 180;
  const ahead = add(scale(north, Math.cos(h)), scale(east, Math.sin(h)));
  const right = [ahead[1] * up[2] - ahead[2] * up[1], ahead[2] * up[0] - ahead[0] * up[2], ahead[0] * up[1] - ahead[1] * up[0]];
  return { origin, right, ahead, up };
};

// tools/build-kit.js
var RADIUS2 = 6348000;
var SEA3 = 12000;
var DEG6 = Math.PI / 180;
var unit5 = (v) => {
  const length2 = Math.hypot(...v);
  return v.map((x) => x / length2);
};
var cross5 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
var axesAt2 = (up) => {
  const north = unit5([-up[0] * up[1], 1 - up[1] * up[1], -up[2] * up[1]]);
  return { north, east: cross5(north, up) };
};
var frameOf3 = (anchor) => {
  const up = unit5(anchor.at);
  const { north, east } = axesAt2(up);
  const ahead = north.map((v, i) => v * Math.cos(anchor.heading * DEG6) + east[i] * Math.sin(anchor.heading * DEG6));
  const right = cross5(ahead, up);
  const base = groundElevation(up);
  const dirOf = (x, y) => unit5(up.map((v, i) => v * RADIUS2 + right[i] * x + ahead[i] * y));
  const ground = (x, y) => groundElevation(dirOf(x, y)) - base;
  const wet = (x, y) => groundElevation(dirOf(x, y)) < SEA3;
  const depth = (x, y) => Math.max(0, SEA3 - groundElevation(dirOf(x, y)));
  const point = (x, y, z) => up.map((v, i) => v * (RADIUS2 + Math.max(base, SEA3) + z) + right[i] * x + ahead[i] * y);
  const survey = ({ at: [cx, cy], size: [w, d], turn: turn3 = 0, step = 1 }) => {
    const c = Math.cos(turn3 * DEG6), s = Math.sin(turn3 * DEG6);
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
    const round4 = (v) => +v.toFixed(3);
    return {
      min: round4(Math.min(...heights)),
      max: round4(Math.max(...heights)),
      mean: round4(heights.reduce((sum, h) => sum + h, 0) / heights.length),
      slope: +(Math.atan(slope) / DEG6).toFixed(1),
      wet: wetAny
    };
  };
  return { anchor, up, right, ahead, ground, wet, depth, point, survey };
};

// tools/build-check.js
init_solid();
await loadSolids().catch(() => console.warn("solids counted as their boxes: Manifold (src/manifold) could not be had"));
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
var groundRadius = (dir) => RADIUS2 + Math.max(groundElevation(dir), SEA3);
var bareRadius = (dir) => RADIUS2 + Math.max(bareElevation(dir), SEA3);
var sameAnchor = (other) => other.anchor && spec.anchor && !other.anchor.exact && other.anchor.at.every((v, i) => v === spec.anchor.at[i]) && other.anchor.heading === spec.anchor.heading;
var lands = [spec, ...name.endsWith(".json") ? readdirSync(dirname(file)).filter((other) => other.endsWith(".json") && join(dirname(file), other) !== file).map((other) => {
  try {
    return readJson(join(dirname(file), other));
  } catch {
    return null;
  }
}) : []].filter((build) => build?.land && build.anchor && (build === spec || sameAnchor(build)));
if (lands.length) {
  const field = createLandField({ bare: bareElevation });
  for (const build of lands) {
    const up = build.anchor.at.map((v) => v / Math.hypot(...build.anchor.at));
    const land2 = readLand(build.land);
    if (land2)
      field.setNodes(landNodes(land2, frameOf2({ origin: up.map((v) => v * bareRadius(up)), heading: build.anchor.heading }), RADIUS2));
  }
  useLand(field);
}
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
  const within4 = ([x, y, z]) => Math.hypot(...seen.point(x, y, z).map((v, i) => v - anchored[i])) <= ZONE.radius;
  const near = (survey.builds ?? []).filter((build) => within4(build.centre));
  zone = {
    parts: near.reduce((sum, build) => sum + build.parts, 0),
    lights: near.reduce((sum, build) => sum + (build.lights ?? 0), 0),
    systems: near.reduce((sum, build) => sum + (build.emitters ?? 0), 0),
    trees: (survey.trees ?? []).filter((tree) => within4(tree.at)).length
  };
}
var water = createWater({ field: createLandField({ bare: bareElevation }), bare: bareElevation });
var waterRadius = (dir) => RADIUS2 + water.tableAt(dir);
var landRadius = (dir) => RADIUS2 + groundElevation(dir);
var checked = checkBuild(spec, { materials: bank, isSpecies: (name2) => species.has(name2), groundRadius, bareRadius, waterRadius, landRadius, zone });
var { records, errors, notes, objects, totals } = checked;
var { inFrame } = checked.frame;
var frame = frameOf3(spec.anchor);
var lift = RADIUS2 + groundElevation(frame.up) - Math.hypot(...checked.frame.origin);
var dot4 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
var along3 = (vector2) => [dot4(vector2, frame.right), dot4(vector2, frame.ahead), dot4(vector2, frame.up)];
var cornersOf2 = (parts, at, rotation) => parts.flatMap((part) => [-1, 1].flatMap((sx) => [-1, 1].flatMap((sy) => [-1, 1].map((sz) => {
  const local = quatRotate(part.rotation, [sx * part.size[0] / 2, sy * part.size[1] / 2, sz * part.size[2] / 2]).map((v, i) => v + part.at[i]);
  return inFrame(quatRotate(rotation, local).map((v, i) => v + at[i]));
}))));
var boxOf2 = (part, unit6) => {
  const corners = cornersOf2([part], unit6.at, unit6.rotation);
  const box = { min: [0, 1, 2].map((k) => Math.min(...corners.map((c) => c[k]))), max: [0, 1, 2].map((k) => Math.max(...corners.map((c) => c[k]))) };
  const up = along3(quatRotate(unit6.rotation, quatRotate(part.rotation, [0, 0, 1])));
  if (part.kind || part.shape.join() !== PRESETS.cube.shape.join() || up[2] < 0.9)
    return box;
  const top = inFrame(quatRotate(unit6.rotation, quatRotate(part.rotation, [0, 0, part.size[2] / 2]).map((v, i) => v + part.at[i])).map((v, i) => v + unit6.at[i]));
  return { ...box, plane: { top, up } };
};
var topOf = (box, x, y) => box.plane ? box.plane.top[2] - (box.plane.up[0] * (x - box.plane.top[0]) + box.plane.up[1] * (y - box.plane.top[1])) / box.plane.up[2] : box.max[2];
var units = records.filter((record) => record.type === "object" || record.type === "instance").map((unit6) => ({ unit: unit6, parts: records.filter((part) => part.object === (unit6.of ?? unit6.id)) }));
var boxes = units.flatMap(({ unit: unit6, parts }) => parts.map((part) => ({ unit: unit6.id, ...boxOf2(part, unit6) })));
var support = ([x, y, z], unit6) => Math.max(frame.ground(x, y) + lift, ...boxes.filter((box) => box.unit !== unit6 && x >= box.min[0] && x <= box.max[0] && y >= box.min[1] && y <= box.max[1] && topOf(box, x, y) <= z + 0.05).map((box) => topOf(box, x, y)));
var settles = (part) => part.kind === "road" || part.kind === "bridge" || part.kind === "fence" && Array.isArray(part.params?.points);
for (const { unit: unit6, parts } of units) {
  if (!parts.length || parts.every(settles) || parts.some((part) => part.kind === "bridge") && parts.every((part) => settles(part) || part.kind === "lantern"))
    continue;
  const label = unit6.type === "object" ? unit6.name : `a clone of ${records.find((record) => record.id === unit6.of)?.name}`;
  const corners = cornersOf2(parts, unit6.at, unit6.rotation);
  const bottom = Math.min(...corners.map((c) => c[2]));
  const low = corners.filter((c) => c[2] < bottom + 0.05);
  const xs = corners.map((c) => c[0]), ys = corners.map((c) => c[1]);
  const centre = [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2, bottom];
  const gap = Math.max(...[...low, centre].map((point) => bottom - support(point, unit6.id)));
  const floats = afloat(unit6.vehicle?.type);
  if (gap > 0.05 && !floats)
    notes.push(`${label}: a gap of ${gap.toFixed(2)} m under its lowest parts — lower it, or its footing`);
  if (floats) {
    const under = Math.min(...[...low, centre].map(([x, y]) => frame.depth(x, y)));
    const needs = inFrame(unit6.at)[2] - bottom + 0.2;
    if (!frame.wet(centre[0], centre[1]))
      notes.push(`${label}: a ${unit6.vehicle.type} floats only at sea — this one stands on land`);
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
if (totals.media)
  console.log(`media: ${totals.media} faces show it, ${totals.videos} of them videos (8 shown at once, 4 videos, the nearest)`);
if (totals.pages)
  console.log(`pages: ${totals.pages} faces show one (the 8 nearest drawn as they change, with media; 32 more still)`);
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
