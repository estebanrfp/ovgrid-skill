# 3. Curved and organic shapes: sculpted prims

What is round, soft or flowing — a vase, a column's swell, a bottle, a lamp, a cushion, a sofa, a
pillow, a handle, a picture frame, a pipe, a hull, a car's body, a rock, a statue — is not modelled
as a mesh. You **describe** it in a few numbers and a tool samples the description into a *sculpted
prim*: one part whose surface is a grid of at most 32 × 32 faces (about 2,000 triangles), kept in its
record, which every peer draws as it draws any prim, coarser as it gets farther. The limit is the
format's own: whatever you describe, a part never costs more.

Boxes, walls, floors, beams, steps and anything flat stay prims and kinds (format.md): a box is 12
triangles, a sculpt hundreds. Reach for a sculpt only where the shape is curved.

## The flow

1. Write the part in the build with `"sculpt": { … }` instead of `shape` or `kind` — its other
   fields (`name`, `at`, `turn`, `material`, `color`, `surface`, `light`, `behaviour`…) as any part's.
2. Run `node scripts/sculpt.mjs build.json`: it writes `build.sculpted.json` beside it, every
   `sculpt` made a part of the `sculpt` kind — its grid, its `size`, its `at` — and says, part by
   part, how it stitched, how many sides and triangles it took, and how closely it follows the
   description. A description it cannot make is an error, with why.
3. Check the sculpted file (`node scripts/check.mjs build.sculpted.json`) and deliver that one.

If you cannot run it yourself, give the person the build with its descriptions and that one
command to run; what they bring into the world is the sculpted file.

The description is the source: keep it, change it and run the tool again. The editor shows a sculpted
prim as any part — moved, turned, dressed, linked, cloned — but cannot reshape it: change the
description.

## The frame

A description is in metres, in the part's own frame: the part's `at` is where the description's
origin stands, its `turn` how the whole is turned. A `lathe` turns round the part's z and a `box`
stands on z = 0, centred on x and y — so `at` is the middle of its foot: put it on the floor.

## The shapes

Each description has one shape, then any of `deform` and `sides`.

| Shape | What it is | Stitching it gets |
|---|---|---|
| `lathe` | a profile `[r, z]` turned round z | ends on the axis: closed (sphere); a profile that comes back to its first point: a ring (torus) |
| `box` | a box `[x, y, z]`, edges `round`ed, upright corners `corner`ed, top and bottom swelling by `bulge` | closed |
| `loft` | sections stacked along an axis, smoothly from one to the next | closed, ends flat (or `"caps": "round"`, `"open"`) |
| `sweep` | a `section` carried along a path | ends rounded (or `"caps": "flat"`, `"open"`); `"closed": true`, a ring |
| `mesh` | a model, `.glb` or `.gltf` | each piece that fits: closed, or a tube |

### lathe: vases, columns, bottles, lamps, bowls

`"lathe": [[r, z], …]` — 2 to 64 points, `r` the distance from the axis, `z` the height, from one
end of the profile to the other. A smooth curve passes through every point and never swings past
one: the widest point you write is the widest the shape is. `"corners": [i, …]` keeps those points
sharp (a foot's edge, a rim); `"smooth": false` makes it straight lines.

- **Closed**: start and end on the axis (`r` 0). For a hollow vessel, go up the outside, over the
  rim and down the inside, ending on the axis above the floor: its walls have a thickness and its
  inside shows.
- **A ring**: end where you began (a lamp shade's wall with its thickness, a ring, a wheel's tyre).
- Anything else is an open sheet, seen from one side only: avoid it.

```json
{ "name": "vase", "at": [0, 0, 0], "color": [0.06, 0.16, 0.42], "surface": { "gloss": 0.7 },
  "sculpt": { "lathe": [[0, 0], [0.11, 0], [0.12, 0.015], [0.17, 0.12], [0.19, 0.25], [0.15, 0.4], [0.08, 0.5],
    [0.075, 0.56], [0.095, 0.6], [0.085, 0.61], [0.065, 0.57], [0.07, 0.5], [0.14, 0.4], [0.18, 0.25],
    [0.16, 0.12], [0.1, 0.03], [0, 0.03]], "corners": [1] } }
```

A column's shaft with its swell (entasis) and a turned base:

```json
{ "name": "column", "at": [0, 0, 0], "material": "paving/stone/onyx-015",
  "sculpt": { "lathe": [[0, 0], [0.32, 0], [0.32, 0.12], [0.27, 0.16], [0.25, 0.3], [0.255, 1.4], [0.22, 2.8],
    [0.27, 2.86], [0.3, 2.95], [0, 2.95]], "corners": [1, 2, 8] } }
```

### box: cushions, mattresses, a sofa's seat, back and arms

`"box": [x, y, z]` with `"round"` (m, the radius of its edges: a tenth of its smallest side unless
given), `"corner"` (m, the radius of its upright corners seen from above: as `round` unless given,
larger for a pillow's soft corners) and `"bulge"` (m its top and bottom swell above and below their
edges — a cushion's puff — or `[top, bottom]`). `size` is the whole box, swell included.

```json
{ "name": "cushion", "at": [0, 0, 0.45], "material": "fabric/cloth/velour-velvet",
  "sculpt": { "box": [0.5, 0.5, 0.16], "round": 0.05, "corner": 0.09, "bulge": 0.03 } }
```

`bulge` swells its top and bottom, z. A cushion that stands — a back cushion, a pillow — is described
lying flat, its broad faces up and down, and stood up by its part's `turn`: 90° about x, and a few
more to lean it back (`[104, 0, 0]` leans its top 14° back, towards −y; its front face is then where
its `at` is). Described upright instead, it would swell on its narrow edges.

### loft: hulls, bodies, bottles that are not round

`"loft": [{ "at": …, <section> }, …]` — 2 to 32 sections, each standing `at` a place along the
axis (`"along"`: `x`, `y` or `z`, z unless given) or at its centre `[x, y, z]`, and each one of:

| Section | |
|---|---|
| `"circle": r` | a circle of radius r |
| `"ellipse": [rx, ry]` | an ellipse of those radii |
| `"rect": [w, h], "round": r` | a rectangle w × h, its corners rounded by r |
| `"polygon": n, "radius": r, "round": c` | a regular polygon of n sides (3–32), r to its corners |
| `"points": [[x, y], …]` | any outline, 3–64 points, smooth unless `"smooth": false`, with `"corners"` |

A section's x and y lie across the axis: for `"along": "z"` they are the part's x and y; for `y`, x
and z; for `x`, y and z. From one section to the next the shape goes smoothly, never swelling past
them; `"corner": true` on a section creases it there. Its ends are closed flat unless `"caps":
"round"` (a dome) or `"open"`; a section of radius 0 ends it in a point.

```json
{ "name": "flask", "at": [0, 0, 0], "material": "glass/clear/float",
  "sculpt": { "loft": [{ "at": 0, "rect": [0.12, 0.07], "round": 0.03 }, { "at": 0.17, "rect": [0.12, 0.07], "round": 0.03 },
    { "at": 0.22, "circle": 0.022 }, { "at": 0.27, "circle": 0.018 }] } }
```

A boat's hull, along its length (y), each section its width and depth (x, z) — a deck at the top:

```json
{ "name": "hull", "at": [0, 0, 0], "material": "wood/planks/walnut-veneer",
  "sculpt": { "along": "y", "caps": "round", "loft": [
    { "at": [0, -2.4, 0.55], "ellipse": [0.25, 0.2] },
    { "at": [0, -1.6, 0.4], "points": [[0.75, 0.25], [-0.75, 0.25], [-0.55, -0.15], [0, -0.3], [0.55, -0.15]] },
    { "at": [0, 0, 0.35], "points": [[0.95, 0.35], [-0.95, 0.35], [-0.8, -0.15], [0, -0.35], [0.8, -0.15]] },
    { "at": [0, 1.6, 0.4], "points": [[0.7, 0.3], [-0.7, 0.3], [-0.45, -0.1], [0, -0.3], [0.45, -0.1]] },
    { "at": [0, 2.6, 0.6], "circle": 0.05 }] } }
```

### sweep: handles, rails, frames, pipes, rings

`"sweep": [[x, y, z], …]` — its path, 2 to 64 points, smooth through them (`"corners"`, `"smooth"` as
a lathe's) — and `"section"`: a number (a circle's radius) or any section above; its x lies across
the path, its y up (towards +z wherever the path allows). `"scale"`: a number, or one for each point
of the path (a number or `[x, y]`), the section's size there; `"twist"`: degrees it turns from one
end to the other. Its ends are rounded — as far out beyond the path's ends as the section is round —
unless `"caps": "flat"` or `"open"`; `"closed": true` joins the path's end to its start: a ring.

```json
{ "name": "mug handle", "at": [0.045, 0, 0.02], "color": [0.9, 0.88, 0.82], "surface": { "gloss": 0.6 },
  "sculpt": { "sweep": [[0, 0, 0], [0.035, 0, 0.005], [0.045, 0, 0.04], [0.035, 0, 0.075], [0, 0, 0.08]], "section": { "ellipse": [0.006, 0.01] } } }
```

A picture frame, its moulding swept round a closed path with sharp corners:

```json
{ "name": "frame", "at": [0, 0, 1.6], "turn": [90, 0, 0], "material": "wood/planks/walnut-veneer",
  "sculpt": { "sweep": [[-0.4, -0.3, 0], [0.4, -0.3, 0], [0.4, 0.3, 0], [-0.4, 0.3, 0]], "closed": true, "corners": [0, 1, 2, 3],
    "section": { "points": [[-0.03, -0.01], [0.03, -0.01], [0.03, 0.01], [0, 0.025], [-0.03, 0.015]], "corners": [0, 1] } } }
```

### mesh: a model made elsewhere

`"mesh": "statue.glb"` — a glTF or GLB file (its path from the build file's folder), with
`"height"` (m) or `"size"` (`[x, y, z]`: the most that fits in that box), else its own metres. Its
pivot is the middle of its base. Its pieces — what holds together in it — are resampled each onto
32 × 32 sides: a closed piece as a ball or a capsule, a piece open at both ends (a pipe, a sleeve) as
a tube. Every piece is measured against the model, and a piece that does not fit is said, with why,
and left out:

- **holes through it** — a handle, a loop, a ring of a chain: make that part a `sweep` (a surface
  pierced all over, a lattice, is judged by how well a sculpt fits it instead);
- **open to one side** — a single sheet, a cup without a wall's thickness;
- **too thin or too folded for one grid** — fingers, leaves, spokes, an arm held away from a body,
  more than 5 % of its surface farther than a fiftieth of its size from what a sculpt can show:
  split the model into simpler pieces, or build those parts of prims.

Its colour is its material's. Text-to-3D models and scans usually fit as one closed piece: a bust,
a figurine, a rock, a loaf, an animal curled up.

## deform

`"deform": [ … ]` — up to 8 steps, in order, each one of:

| Step | |
|---|---|
| `{ "taper": a }` or `[a, b]` | its top's scale across its axis, 1 at its foot |
| `{ "twist": degrees }` | how far it turns about its axis from foot to top |
| `{ "bend": degrees, "toward": "x" }` | how far its axis curves, foot to top, towards x, -x, y, -y (z for an x axis) |
| `{ "noise": m, "size": m, "seed": n }` | pushed in and out along its surface by smooth noise: lumps `size` across (its largest side / 5) |
| `{ "scale": [x, y, z] }`, `{ "turn": [x, y, z] }`, `{ "move": [x, y, z] }` | as their names say |

`taper`, `twist` and `bend` run along `"along"` (z unless given), through the part's origin.

```json
{ "name": "twisted column", "at": [0, 0, 0], "material": "paving/stone/onyx-015",
  "sculpt": { "box": [0.36, 0.36, 2.6], "round": 0.05, "deform": [{ "twist": 120 }, { "taper": 0.8 }] } }
```

```json
{ "name": "boulder", "at": [0, 0, 0], "material": "ground/rock/rock-boulder-dry",
  "sculpt": { "box": [1.4, 1.1, 0.8], "round": 0.35, "deform": [{ "noise": 0.08, "seed": 4 }] } }
```

## sides

Left out, the tool takes the fewest of 16 and 32 sides round and along the shape that follow it
within half a percent of its size (a sofa's plinth 16 × 16, 480 triangles; a cushion 32 × 16, 960; a
vase 32 × 32, 1,984);
`"sides": [columns, rows]` sets them (4–128 each, (columns + 1) × (rows + 1) no more than 1,600) —
columns round the shape, rows along it. Its samples go where it turns: a rim gets more than a straight
side.

## Dressing it

A sculpt has one face, `0`. A material wraps round it — u round the shape, v along it — and the tool
lays it in whole tiles round, so that no seam shows where it closes. Plain and organic materials suit
it best: fabric and leather for upholstery, wood, stone, metal; glazed pottery is a colour with
`"surface": { "gloss": 0.6 }`. Everything else a surface takes (format.md) applies.

## Composing

- **One closed surface a part.** A mug is a lathe (its body) and a sweep (its handle); a sofa is a
  plinth, feet, arms and their rolls, a back, seat and back cushions and pillows — a dozen or more
  boxes, lathes and sweeps in one object; a statue is a head, a torso and limbs.
- **What repeats is the same description**, and alike parts share one mesh: two seat cushions cost
  one mesh drawn twice. Clone whole objects as ever.
- **Detail finer than the grid is lost**: a rope's twist, carving, fingers. Leave it to the texture,
  or to a few prims.
- **Within the budget**: every sculpt counts its triangles (up to ~2,000) against the build's
  (budget.md) — fifty sculpts are 100,000 triangles at their finest. Furnish a room with a few, not
  with dozens.

