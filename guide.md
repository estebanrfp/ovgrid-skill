<!-- Made from the OVGrid repository: its skill (.claude/skills/ovgrid) and its code. Change those, not this. -->

# Building in OVGrid with your own AI

OVGrid is a planet in the browser, shared peer to peer, where people build as they did in
Second Life — out of prims (boxes, cylinders, wedges…), *kinds* (doors, windows, roofs, stairs,
fences, rocks…) and trees, dressed in a bank of 3,091 real-size materials, with lights, particles
(smoke, fire, steam…), things that move and scripts. A build is one JSON document. This guide is for
an AI asked to write one — a house, a square, a village, a bridge, a room — from a description, and
it walks through the eight steps of doing it well:

1. **Plan** — from the request to a plan, within the budget, saying what you simplified.
2. **Place** — where it goes: a survey of the ground and what is built there, its anchor.
3. **Resources** — the build file; shapes, kinds, materials by use, species, effects.
4. **Quality** — proportions, walls, composition.
5. **Budget** — what one build and one place may bring; the check.
6. **Interactivity** — particles, lights at night, behaviours, vehicles, scripts.
7. **Delivery** — the JSON, the ghost, confirming, changing it later.
8. **Verification** — looking at it, fixing it.

Beside this guide, in the same repository (`estebanrfp/ovgrid-skill`):

- **catalog.json** — every shape, kind, behaviour, particle preset, material and tree species,
  made from the world's own code, one entry a line.
- **skills/ovgrid/scripts/survey.mjs** — the ground round a place from the person's URL
  or coordinates: heights, slopes, water, ridges and valleys, a map, the anchor to build on.
- **skills/ovgrid/scripts/check.mjs** — a build checked as the world checks it.
- **skills/ovgrid/scripts/sculpt.mjs** — what is curved or organic, described in a few numbers or
  brought as a glTF model, made the world's sculpted prims.

All three run with Node 18+ or Bun. If you cannot run code, ask the person for their editor's survey
(step 2) and keep to a few hundred parts, written carefully.

The quality of what you build comes from three things: the bank's materials, the rules here, and
looking at it until it is right. The detail is the person's to ask for: a plan in a line gets a
sound, plain build; a page of detail gets that detail, within the budget.

## 1. From a request to a plan

A person describes what they want — a fishing village on that cove, a bridge between those two
hills, a tavern with a fire and a cellar — sometimes in a page of detail, sometimes in a line.
Before any part is written, turn it into a plan you could hand to someone else.

### Ask what only they know

- **Where**: the URL of the view they want it in, or a survey of the place (site.md). Without one,
  the build has no anchor and they place it themselves.
- **What is there already** that must stay: their own builds, a neighbour's, a road, the trees.
- **The feel**: period and region (a Cotswold hamlet, an Andalusian *cortijo*, a Norse longhouse),
  materials they like, day or night, busy or quiet.
- **What it must do**: doors that open, a lift, a ferry, a fire that lights at dusk, a game.

Ask only what changes the plan; take sensible defaults for the rest and say which.

### Write the plan

In the build's frame — x right, y ahead, z up (right as seen from in front, looking back at it from +y; for whoever faces +y — a driver, someone walking in — +x is on the left), metres; the anchor's ground at z = 0 — list:

1. **The pieces**: each building, the square, the ways, the fences, the groves, the lights and what
   moves, each with its size, where it stands and which way it faces.
2. **The ground under each**: flat enough, or a terrace, a footing, a bridge (site.md).
3. **The palette**: one material for each role — walls, roofs, floors and paths, wood, metal,
   glass — the same across the houses, varied by colour, offsets and a few accents (composition.md).
4. **The lights at night**, and the effects: smoke from the chimneys that burn, a fire, fog in a hollow
   (effects.md).
5. **What repeats** (lamps, benches, fence sections, alike houses): one object, then clones.
6. **The cost** against the budget (budget.md): parts, triangles, lights within 30 m of one another,
   particle systems, trees, materials.

### Fit what is asked to what the world can carry

The budget is not a suggestion: past its *most*, the editor refuses the build. When a request asks
for more — a city in one go, a hundred lit windows, a forest of ten thousand trees, fireworks
everywhere — keep its spirit and make it fit, in this order:

1. **Clone** what repeats: a street of alike houses is one house and its clones.
2. **Kinds** instead of piles of prims: stairs, roofs, fences, doors, windows, columns, arches.
3. **Fewer, shorter lights**: light the ways and the rooms seen from them; glow (`range: 0`) for
   the rest; `"on": "night"` everywhere outdoors.
4. **Sober particles**: one chimney in two smoking, one fire for a square, fog in one hollow.
5. **Detail where it is seen**: rich near the paths and the square, plain behind; no furniture in
   rooms nobody can see into.
6. **Forests painted, not written**: a few dozen trees round the place; the forest beyond is the
   person's to paint with the editor's brush, which spreads its writes over time.
7. **In stages**: a town as several builds — a quarter at a time, each within budget, each checked
   against what already stands (the place's own budget counts them together).

**Say what you simplified and why** when you hand it over: "the market has 6 stalls, not 20, to
keep the square within its 8 lights; the forest is 60 trees round the clearing — paint the rest
with the brush". The person decides what to trade; you never hide it.

## 2. The place: where it goes, and what is there

The planet is real ground: hills, valleys, coasts, other people's builds. A build that ignores it
floats, sinks, blocks a view or lands on a neighbour's garden. Survey first.

### Where: from a URL to an anchor

A person gives you a place as the URL of their view, or as coordinates:

| In the URL | Means |
|---|---|
| `walk=x,y,z,face,look,tilt,zoom,flight` | the avatar's feet (planet-centred metres), the azimuth it faces, the azimuth its camera looks along (° from north, east positive), the camera's tilt down and distance behind |
| `pos=x,y,z&target=x,y,z` | a camera at `pos` looking at `target` (planet-centred metres) |
| `lat=…&lon=…` | the ground under a latitude and longitude, in degrees |

- **Planet-centred metres**: the planet's base radius is 6,348,000 m and the sea stands 12,000 m
  over it. A point's latitude is asin(y / r), its longitude atan2(x, z); the direction of
  (lat, lon) is [cos lat · sin lon, sin lat, cos lat · cos lon].
- **A frame at a point** (what an anchor makes): up = the point's direction; north = [0, 1, 0]
  made level there (minus its part along up, normalised); east = north × up; for a heading h, ahead
  = north · cos h + east · sin h and right = ahead × up. A point (x, y, z) of the frame is
  origin + right · x + ahead · y + up · z. So +x is the right of someone in front of the build
  looking back at it from +y, and the left of someone facing +y, as a driver or a walker coming in
  along +y does.
- **An anchor** is a point and a heading: `{ "at": [x, y, z], "heading": h }` — its +y faces h.
  With `"exact": true` its `at` is the frame's origin itself; without, the frame stands on the
  ground under `at`. The survey gives you one, exact, on the ground where the person looked, its +y
  the way they looked: a build written with it stands exactly where the survey says, its front
  (−y) towards them.

### The survey

Two ways to have one, the same JSON:

- **From the person's editor** — the best: in build mode (Ctrl+B), *Builds as JSON* → *Survey
  here*: 80 m round where they look, every 2 m (Shift+click: 200 m, every 4 m), saved as
  `survey-<lat>-<lon>.json` with its map. It has the ground as their screen draws it, and **what is
  built and planted there** — the shared world's, everyone's.
- **From the survey script**, given a URL, `lat,lon` or `x,y,z`, or a survey to go on from (its
  frame kept, what it saw built kept):

  ```bash
  node skills/ovgrid/scripts/survey.mjs "<the person's URL>" --radius 80 --step 2 --name cove
  node skills/ovgrid/scripts/survey.mjs cove.json --profile "0,-40,0,46"
  ```

  It knows the terrain exactly (the same function the planet is drawn from, within ~0.7 m of the
  drawn ground), but not what others have built: that lives in the shared world, which only the
  editor sees. Ask the person for an editor survey of any place that may not be empty.

What it holds — read the `note` at its top:

| Field | |
|---|---|
| `anchor` | the frame: exact, on the ground at the centre, +y the way the person looked |
| `latLon`, `elevation` | where it is; metres over the sea |
| `radius`, `step` | how far each way, how fine |
| `summary` | lowest and highest ground, the steepest slope, the share under 5°, the share under the sea and how deep it gets (`deepest`), how many builds and trees |
| `peaks`, `pits` | `[x, y, z]` the highest and lowest points round them |
| `ridges`, `valleys` | lines: `from`, `to`, `length`, `low`, `high` |
| `builds` | what stands there: `id`, `name`, `owner`, `centre`, `size` (a box in the frame), `parts`, `kinds`, `lights`, `emitters`, `moving` |
| `trees` | `species`, `at`, `scale` |
| `heights`, `slopes` | grids: `heights[j][i]` m over the centre's ground, `slopes[j][i]` ° — at x = −radius + step · i, y = radius − step · j (rows from the far edge to the near one, as a map reads) |
| `water`, `depths` | where there is sea: `water[j][i]` 1 under it, `depths[j][i]` how deep it is (m) |
| `built` | where there are builds: how high what is built stands over the ground in each cell, 0 free |
| `profiles` | with `--profile`: the ground every metre along each line, its lowest and highest points |

Its map — `<name>.svg` and `<name>.png` beside it — shades the ground by height, draws contours,
the sea (blue), ridges (dashed brown) and valleys (dashed blue), the highest peaks, what is built
(pale where low, darker as it rises) and the trees (green), with the frame's x (red) and y (green)
from the centre. Look at it before you plan.

### Reading the ground

| Slope | What to do |
|---|---|
| under 5° | build on footings: the floor over the highest ground, the footing down past the lowest |
| 5–15° | stand houses across the slope with a taller footing downhill, or a terrace |
| 15–30° | terraces held by retaining walls, stairs between them; paths in zigzags along the contours |
| over 30° | leave it — a cliff, a view — or stand a platform on posts, or bridge it |
| sea | keep off, or stand on piles: a pier, a jetty, a boathouse (`water` and `elevation` say where); a boat where `depths` is 0.5 m or more — a shore may stay a hand deep for a hundred metres and more |

### Standing on the ground

The terrain is a function; what you build is not.

- **Floors over the highest ground** under them (0.15 m more), **footings down past the lowest**: a
  box of stone under the walls, as wide as the house plus 0.1–0.2 m each side, from the floor down
  to 0.3 m under the lowest ground there — 0.7 m more where the heights come from a script's survey,
  which may differ that much from the drawn ground. A step or stairs up to a door the floor lifts.
- **Paths, fences and small things follow the ground**: a path is a chain of flat slabs a few metres
  long, each lying along the slope under it; a fence, straight lengths each standing on the ground at
  both ends; a lamp, a bench, a tree placed at `[x, y]` stands on the ground there.
- Rocks sink a tenth of their height into it.
- What stands **outside** an object's footing — a porch post, barrels by the door, a bench — stands
  on the ground there, not on the floor: make it an object of its own at `[x, y]`.
- What stands **on something built** — a well on a square's paving, a lamp on a wall — stands on its
  top.

### Building with the land

- **Terraces**: cut a slope into level platforms 4–10 m deep; each a slab (or the floor of what
  stands on it) held at its downhill edge by a retaining wall of stone boxes from the platform's top
  down past the ground; stairs (the `stairs` kind) or a ramp between them.
- **Ways along the contours**: a path climbs at most 1 in 8 (7°); steeper ground takes it in
  zigzags, each leg along a contour line of the map, a landing at each turn; a lane follows a valley
  floor or a ridge. Each one a `road` laid on the ground (format.md).
- **A bridge between two rises**: take the profile between the two rims (`--profile`): its length
  is the span, its lowest point the depth to bridge. The deck a little over the higher rim, level or
  gently sloped; its ends resting on abutments sunk into each rim (stone boxes down past the ground);
  piers to the valley floor every 8–15 m for timber, or stone arches (the `arch` kind) 6–12 m wide;
  each pier's foot 1 m under the lowest ground round it; railings both sides (the `fence` kind,
  `balusters` or `rails`, 1.1 m); a lamp at each end. A deck 2–3 m wide for walkers, 4–6 m for a lane.
- **Views**: a square, a bench, a tavern's terrace on a ridge or a rise, facing the open side;
  tall things (a tower, a mill) where they are seen against the sky; nothing tall between the
  place people arrive and what they came to see.
- **What is there**: keep clear of what others built (`built` above 0 within 3 m of it, the
  `builds` boxes); never touch records that are not the person's (the editor would refuse); leave
  the paths to them open; plant round trees, not on them. Next to a neighbour's house, ask.


## 3. The resources: the build file, and what it may be made of

A build is one JSON object: objects of parts — prim shapes or *kinds* — dressed in the bank's
materials, with their lights, particles and behaviours; linked clones of objects; trees. Every
name it may use — shapes, kinds and their parameters, behaviours, particles, the 3,091 materials,
the 31 tree species — is in **catalog.json**, made from the world's own code, one entry a line.

```json
{
  "name": "Millbrook",
  "anchor": { "at": [1656179.74, 3488786.27, -5053222.57], "heading": 30.77 },
  "prims": [ { "name": "square", "shape": "cube", "at": [0, 0, 0.04], "size": [18, 18, 0.2], "material": "paving/cobblestone/cobblestone-pavement" } ],
  "objects": [ { "name": "bakery", "at": [-12, 6, 0.35], "turn": [0, 0, -80], "prims": [ … ] },
               { "name": "lamp", "at": [6, 6], "prims": [ … ] } ],
  "clones": [ { "of": "lamp", "at": [-6, -6], "turn": [0, 0, 90] } ],
  "trees": [ { "species": "oak", "at": [24, 30], "seed": 3, "scale": 1.1 } ],
  "views": [ { "name": "square", "eye": [0, -14], "look": [0, 4, 2], "hour": 16 } ]
}
```

### Anchor and frame

- `anchor.at`: a planet-centred point (m) on or near the ground; `anchor.heading`: the azimuth
  (° from north, east positive) the build's +y faces. `"exact": true` makes `at` the frame's origin
  itself rather than a point over the ground — a survey's anchor, an export's. Without an anchor the
  person places the build where they point (deliver.md). Where anchors come from: site.md.
- **The frame**: on the ground under the anchor (or at it, exact). x right, y ahead, z up — right as seen from in front of the build, looking back
  at it from +y; for whoever faces +y, as a driver does or someone walking in along +y, +x is on the
  left. So a shop on the right of a square, as you face the square's front, stands at x > 0; and
  a car whose nose points to +y and keeps to the right of the road, as in Spain, has its driver at
  x > 0, on the driver's own left. z = 0 is
  that ground. Everything else in the file is in this frame, in metres.
- **A place** (`at` of an object, a clone, a tree): `[x, y]` is on the ground there — the import
  finds it — and `[x, y, z]` is z above the ground under the anchor. A prim's `at` is always
  `[x, y, z]`, in its object's frame.

### Prims

The parts of an object. `prims` at the top are the build's own object, standing at the anchor;
each of `objects` has its own (below).

| Field | |
|---|---|
| `name` | What it is (`"front wall 2"`); shown in the editor |
| `shape` | A preset (`cube`, `prism`, `pyramid`, `tetrahedron`, `cylinder`, `hemiCylinder`, `cone`, `hemiCone`, `sphere`, `hemiSphere`, `torus`, `tube`, `ring`) or the 18 shape integers |
| `kind` + its parameters | Instead of `shape`: a kind (below) |
| `at` | Its centre, m, in its object's frame |
| `size` | m along its own x, y, z: 0.01–64 each |
| `turn` | ° about x, then y, then z (default `[0, 0, 0]`) |
| `material` | A bank id: `category/subcategory/name` (catalog.json → `materials`) |
| `color` | Linear RGB 0–1 of untextured faces; with a material it shows only while the textures load and far away — leave it out |
| `surface` | How the material lies and what the faces do with light (below) |
| `light` | Its light (below) |
| `particles` | What it throws from its top: `"chimney"`, `"campfire"`, `"torch"`, `{ "preset": "steam" }`… (effects.md) |
| `phantom` / `collisionOnly` | `true`: walked through / not drawn (below) |
| `behaviour` | What it does by itself: opens on a click, turns, goes and comes back (below) |
| `script` | Its script, JavaScript as a string, for what no property can say (effects.md) |
| `seat` | `true`: sat on by a click, on its top, facing its +y — a bench, a chair, a vehicle's seat (vehicles.md) |
| `seed` | A rock's: whole number, one seed one rock (else one from the build's name and the part's place, the same at every import) |

#### Shapes

`catalog.json` → `presets` gives each preset's faces in order (their index is the face's
number in `surface.faces`), where each faces as placed with no turn, and its triangles at the four
levels of detail. What to know:

- **cube**: faces 0 top, 1 −y, 2 +x, 3 +y, 4 −x, 5 bottom. Walls, floors, slabs, beams, boards,
  furniture — most of any build.
- **cylinder**: 0 top, 1 side, 2 bottom; its axis is its z. Lay it along x with `turn [0, 90, 0]`,
  along y with `[-90, 0, 0]` (logs, rails, a ridge pole).
- **prism** is a wedge: upright side at its −x, slope facing +x+z. Turn it `[0, 0, 180]` for the
  other half of a gable. Prefer the `roof` kind for roofs.
- **sphere, torus, tube, ring** are made upright by a turn of their own: their `size` is
  `[height, depth (y), width (x)]`, not `[x, y, z]`.
- **hemiSphere**: a dome, flat side down.
- **Hollow, cut, taper, twist**: a preset changed, its fields by name —
  `{ "preset": "cylinder", "hollow": 0.8 }` a well's wall (faces 0 top, 1 outside, 2 inside,
  3 bottom), `{ "preset": "hemiSphere", "hollow": 0.9 }` a lamp shade, `{ "preset": "cylinder",
  "profileBegin": 0.25, "profileEnd": 0.75 }` half round, `{ "preset": "cube", "scaleX": 0.6,
  "scaleY": 0.6 }` a tapered post. The fields (Second Life's prim parameters): `profileBegin`,
  `profileEnd` (0–1, a cut round its profile), `hollow` (0–0.99), `pathBegin`, `pathEnd` (0–1, a cut
  along its path), `scaleX`, `scaleY` (on a straight path the top's size, 1 as the bottom, 0 a point;
  on a circular one the hole's), `taperX`, `taperY` (−1–1, a circular path's taper), `twistBegin`,
  `twistEnd` (−1–1: ±180° along a straight path, ±360° round a circular one), `shearX`, `shearY`
  (±0.5, the top slid over), `revolutions` (1–4), `skew`, `radiusOffset` (coils, on circular paths).
  Hollowing or cutting adds faces (a hollow box: 5 the hollow, 6 bottom). Or the 18 integers
  themselves, as an export writes them.

#### Kinds

A part may be of a kind: `{ "kind": "door", "at": […], "turn": […], "size": […], "style": "glazed",
"hinge": "right" }` — its parameters beside its other fields (or in `"params": {…}`), an option by
its name. Each number is held to its range and step — the check notes what was changed — and a
parameter or an option the kind has not is an error. Every kind,
its parameters (range, default, step, what each does), its faces and its triangles:
`catalog.json` → `kinds`. In short:

| Kind | Box (`size`) | Faces | Orientation |
|---|---|---|---|
| `door` | frame: width, wall thickness, height | 0 frame, 1 leaf, 2 glass, 3 handles | front −y; `hinge` seen from the front; `open` 0–110° swings out to the front |
| `window` | frame: width, ≤ wall thickness, height | 0 frame, 1 bars, 2 glass, 3 sill | front −y; the sill stands out of the box to the front |
| `roof` | all of it: width (along the ridge), depth, eaves to ridge | 0 roof, 1 ends (gables), 2 underside, 3 eaves | ridge along x; `shed` low at −y |
| `stairs` | made by `steps`, `height`, `tread`, `width` | 0 treads, 1 risers, 2 sides, 3 underside, 4 railing | rises towards +y; the railing stands above the box |
| `fence` | what its `points`, `thickness` and `height` make; or a `size`: a straight length along x | 0 posts, 1 rails, 2 pickets | a path of 2–32 `points`, a post on each and others every `spacing` m at most; the last on the first closes it round |
| `road` | what its `points`, `width` and `depth` make | 0 surface, 1 sides, 2 underside | a ribbon along 2–32 `points` laid on the ground, its slab `depth` under it; under 2 m wide a path; the last point on the first closes it round |
| `column` | plinth width, depth, height | 0 shaft, 1 base, 2 capital | upright |
| `arch` | width, wall depth, height | 0 its two faces, 1 the opening, 2 outside, 3 feet | wall in x–z, opening through y |
| `bevel` | its own | box: as a cube; cylinder: as a cylinder | `base` box or cylinder; `edge` round or chamfer, `radius` m |
| `rock` | width (y) and height (z); length (x) from `elongation` | 0 surface | flat `base` down; sink it a tenth of its height |

What is curved or organic — a vase, a column's swell, a cushion, a sofa, a handle, a hull — is not a
kind you write out: describe it with `"sculpt": { … }` (a lathe, a box, a loft, a sweep, or a model)
and the sculpt tool makes it a part of the `sculpt` kind, its map never typed by hand. → sculpt.md

**A fence along the land, in one part**: `points` in the part's own frame, written `[x, y]` without
heights, lie on the ground once placed — the fence follows it, a post on each point:

```json
{ "name": "garden fence", "kind": "fence", "at": [0, 0, 0], "style": "pickets", "height": 1,
  "points": [[-6, -5], [6, -5], [6, 5], [-6, 5], [-6, -1]] }
```

**A road or a path, in one part**: its `points` in its own frame — within 31.5 m of its `at`, so
stand it at their middle — written `[x, y]`: they are laid on the ground once placed, its surface on
the ground sampled under both edges about every metre. Gravel (`ground/gravel/rocky-trail`) unless
it has a `material`. Its slab goes `depth` (0.3 m) under its surface, so that where the drawn ground
is not quite where the samples say, no gap shows: on slopes, 0.4–0.6.

```json
{ "name": "lane", "at": [3.6, 32.8], "prims": [{ "name": "lane", "kind": "road", "at": [0, 0, 0], "width": 3,
  "points": [[-3.6, -24.2], [-2.8, -16.8], [-4, -8.8], [-2.4, -0.8], [0, 7.2], [2, 15.2], [3.6, 24.2]] }] }
```

A longer way is several roads end to end. A road on something built — a bridge's deck — takes
`[x, y, z]` points: it stays where they say.

A kind's uvs are in metres: its material lies at real size on every face. A kind whose mesh
depends on its size (door, window, roof, fence, arch, column, bevel) makes a mesh for each size
used: give alike parts the same size and they share it.

### Materials by use

Every material is real size: leave `scale` out and it tiles as it is in life. In catalog.json →
`materials`, each has its `uses` (wall, floor, roof, ground, road, fence, railing, furniture,
window, ceiling), its tile's `size` in metres, its average `color`, `metal` and its `look` (cut-out,
see-through, glows, moves); `categories` group them. Pick by role, then by colour:

| Role | Where to look |
|---|---|
| Walls | `masonry/brick`, `masonry/stone-blocks`, `masonry/rubble`, `plaster/plaster`, `plaster/concrete`, `wood/siding`, `wood/logs`; whole shop fronts `facade/facade` |
| Roofs | `roofing/tiles` (clay), `roofing/slate`, `roofing/thatch`; `metal/corrugated` for sheds |
| Floors inside | `wood/floor`, `paving/tiles`, `paving/stone`; rugs `fabric/carpet` |
| Squares, paths, lanes | `paving/cobblestone`, `paving/pavers`, `paving/stone`; tracks `ground/gravel`, `ground/soil`; roads `paving/asphalt`, `paving/roads` |
| Ground cover | `ground/grass`, `ground/sand`, `ground/rock`, `ground/leaves`, `ground/snow` |
| Wood: doors, frames, beams, furniture | `wood/planks`, `wood/painted`, `wood/panel`; seats `fabric/leather`, `fabric/wicker`, cushions `fabric/cloth` |
| Metal | `metal/bare`, `metal/painted`, `metal/rusted`, `metal/sheet` (with `metal`): lamp posts, railings, hinges, a bell |
| Glass | `glass/clear`, `glass/textured`, `glass/leaded` (`look`: see-through): small panes only |
| Water, lava | `effects/water`, `effects/lava` (`look`: moves, glows): a pond's surface, a fountain's basin, a forge |
| Fences, grates, nets | `openwork/fence`, `openwork/grate`, `openwork/net` (`look`: cut-out) |

Grep the catalog — `grep '"uses":\["roof"' catalog.json`, `grep -i thatch catalog.json` — and keep
to one or two materials a role across a whole build.

### Surface

```json
"material": "plaster/plaster/painted-plaster-005",
"surface": { "offset": [0.3, 0], "rotation": 90,
             "faces": { "0": { "texture": "roofing/tiles/clay-roof-tiles-03" }, "2": { "texture": "glass/clear/old", "emissive": 0.2 } } }
```

| Field (the part's, or a face's in `faces`) | |
|---|---|
| `texture` | A bank id; `material` is the part's |
| `scale` | `[u, v]` m a tile spans; leave it out: the bank's real size |
| `rotation` | ° the texture turns on the face |
| `offset` | `[u, v]` fraction of a tile it slides: vary it so that alike parts do not repeat (logs, stones, planks) |
| `opacity` | 0–1: below 1 the face is seen through (expensive: a pass of its own) |
| `emissive` | 0–1: lights itself, its colour as bright again whatever lights it (≈ Second Life's full bright) |
| `glow` | 0–1: a halo round it |
| `gloss` | 0–1: polished, 1 a mirror |
| `metal` | 0–1: how metallic at least |
| `reflect` | 0–1: how much it mirrors whatever its colour |
| `faces` | `{ "<face>": { …any of the above } }` by face number (0–8); a face's own wins |

How a texture runs: a box's top and bottom run u along its x; its four sides run u level and v up;
a cylinder's side runs u round and v along its axis. Boards along a piece lying along y:
`faces: { "0": { "rotation": 90 } }`; upright boards on a side: `rotation: 90`. The tile is laid
from each face's centre: to run courses on across the boxes of one wall, slide each box's long faces
by its centre's place along the wall and up it, in tiles (`offset`).

The bank's own effects come with the material: glass and water seen through, water rippling,
lava glowing and flowing, fences and grates cut out (catalog `look`).

### Light

```json
"light": { "on": "night", "range": 7, "color": [1, 0.72, 0.42], "intensity": 0.9, "cone": { "angle": 60, "softness": 0.4 }, "flicker": 0 }
```

- Without `light`, a part whose faces emit (`emissive`, or a bank material that glows) lights what
  is round it by itself: its colour, as bright as its brightest face, as far as its area says.
- `on`: `true` (default), `false` (off: its emission and glow off too — a lamp switched off), or
  `"night"` (on once the sun has set where it is, its emission with it).
- `range`: m, 0–10 (held to 10). `0`: it lights nothing round it but still glows — a lantern for
  looks, always lit, at no cost. (A light that reaches nothing is never switched: `"night"` needs a
  range above 0.)
- `color` linear RGB, `intensity` 0–1; `cone`: a spot down the part's own −z, `angle` half its
  width 1–90°, `softness` 0–1; `flicker` 0–1, a flame's.
- Switched on with nothing emitting, a part is a lamp of its own: white, 1, 10 m unless it says.
- **Walls stop a light when they are parts of its own object**: a lamp in a room is a part of the
  house's object. Glass lets it through. Keep a lamp outside short of other buildings' rooms.

### Collisions and behaviours

Everything is solid and drawn unless it says otherwise. The avatar is a capsule 1.8 m tall and
0.6 m wide: it steps up 0.3 m and stands on slopes to 50°. Kinds bring colliders of their own;
prims collide as their mesh, its hull when convex.

- `"phantom": true` — drawn, walked through: curtains, hanging leaves, light beams, water to wade in.
- `"collisionOnly": true` — bumped into, not drawn (faintly, in build mode): an invisible wall, a
  smooth ramp over stairs, a rail round a roof. One or the other, never both.
- `"behaviour": { "type": …, …parameters }` — what it does by itself, the same for every peer
  whether its owner is there or not; on a prim, on an object (in `objects`) or on a clone. Every
  type, its parameters with their ranges and defaults: catalog.json → `behaviours`.

  | Type | Does | Parameters |
  |---|---|---|
  | `door` | swings open and shuts by itself; a `door` kind opens its own leaf, up to 110° | `angle`, `hinge`, `trigger` — `"click"` (within 5 m), `"near"` (someone within `reach` m; it shuts once all have gone) or `"both"` — `reach` (m, 2.5), `time`, `stay` (s after a click; 0: until clicked again); prims only |
  | `slide` | slides aside and back by itself: a sliding door, a window, a hatch | `x`, `y`, `z` (m, its own axes), `trigger`, `reach`, `time`, `stay` |
  | `spin` | turns round its own z all the time: a sign, a windmill's sails, a carousel | `speed` (°/s) |
  | `move` | goes to a point and back, waiting at either end: an elevator, a ferry, a platform | `x`, `y`, `z`, `speed`, `wait` |
  | `belt` | carries whoever stands on it along its own y: an escalator, a walkway | `speed` (m/s) |
  | `route` | goes through its points on a smooth curve, round and on again or there and back, stopping a while at each if asked: a boat on a tour, a train on its line | `points` (up to 64, `[x, y, z]` m in its own frame), `speed` (m/s), `stop` (s), `at` (`"each"`: stops at every point; `"ends"`: only where it is kept and, there and back, at its last), `mode` (`"round"`, `"back"`), `face` (`"yes"`: turns to where it goes), `water` (`"yes"`: keeps its height over the sea) |

- **Doors the avatar walks through**: a door's leaf collides where it stands, so a shut door is a
  wall. Build it shut and give it `"behaviour": { "type": "door", "trigger": "both", "reach": 2.5,
  "stay": 8 }` — it opens as someone comes within 2.5 m, or on a click, and shuts by itself — or build
  it standing open (`"open": 85`). A window is solid whole.

  ```json
  "prims": [
    { "name": "door", "kind": "door", "at": [0, 2.85, 1.15], "size": [1.1, 0.3, 2.3], "turn": [0, 0, 180],
      "style": "panelled", "behaviour": { "type": "door", "angle": 90, "trigger": "both", "reach": 2.5, "stay": 8 } },
    { "name": "shop window", "shape": "cube", "at": [2, 2.9, 1.4], "size": [1.2, 0.04, 1], "material": "glass/clear/float",
      "behaviour": { "type": "slide", "x": 1.1, "stay": 0 } }
  ],
  "objects": [
    { "name": "sails", "at": [30, 12, 9], "turn": [90, 0, 0], "behaviour": { "type": "spin", "speed": 12 }, "prims": [ … ] },
    { "name": "ferry", "at": [60, 0, 0.2], "behaviour": { "type": "move", "y": 40, "speed": 2, "wait": 10 }, "prims": [ … ] }
  ],
  "clones": [ { "of": "sails", "at": [70, 12, 9], "turn": [90, 0, 30], "behaviour": { "type": "spin", "speed": -9 } } ]
  ```

  A behaviour moves its thing in its own frame: `spin` turns about its own z (stand sails up with a
  turn), `move` and `slide` go along its own axes. Parameters left out take their defaults.
- Moving things carry whoever stands on them.

### Objects, clones, trees

```json
"objects": [ { "name": "Bakery", "at": [-12, 6, 0.35], "turn": [0, 0, -80], "prims": [ … ] } ]
```

- **An object** is a frame and its parts, moved, copied and selected as one; at most 256 parts.
  Its `at` and `turn` place its frame in the build's; its prims are in its own frame: write a house
  as if it stood at the origin facing +y, then place it. Names are unique in a build.
- **A vehicle** is an object with `"vehicle": { "type": "car" | "bike" | "boat" | "train", … }` and
  a part with `"seat": true` to drive from: vehicles.md.
- **A clone** `{ "of": "<object's name>", "at": …, "turn": … }` draws that object's parts again in
  a frame of its own. Nothing is copied: change the object and every clone changes. Use it for
  whatever repeats unchanged: lamps, benches, fence sections, identical houses.
- **A tree** `{ "species": "oak", "at": [x, y], "scale": 1, "seed": 3, "turn": 40 }`: a species of
  catalog.json → `species`; the variant drawn is `seed % 6` (each variant's height and crown are in the
  catalog); `scale` 0.25–4; `turn` ° about z (none: one its seed gives); `seed` defaults to one from
  the build's name and the tree's place in the list.

### Ids and changing a build

An export from the editor (deliver.md) gives each object, clone and tree its `id`, and the anchor
`"exact": true`. Keep both when you change it: what comes back with the ids of the person's own
records changes them where they stand — an object's parts as you wrote them — and what has no id is
added. An object left out stays as it is.


## 3. Curved and organic shapes: sculpted prims

What is round, soft or flowing — a vase, a column's swell, a bottle, a lamp, a cushion, a sofa, a
pillow, a handle, a picture frame, a pipe, a hull, a car's body, a rock, a statue — is not modelled
as a mesh. You **describe** it in a few numbers and a tool samples the description into a *sculpted
prim*: one part whose surface is a grid of at most 32 × 32 faces (about 2,000 triangles), kept in its
record, which every peer draws as it draws any prim, coarser as it gets farther. The limit is the
format's own: whatever you describe, a part never costs more.

Boxes, walls, floors, beams, steps and anything flat stay prims and kinds (format.md): a box is 12
triangles, a sculpt hundreds. Reach for a sculpt only where the shape is curved.

### The flow

1. Write the part in the build with `"sculpt": { … }` instead of `shape` or `kind` — its other
   fields (`name`, `at`, `turn`, `material`, `color`, `surface`, `light`, `behaviour`…) as any part's.
2. Run `node skills/ovgrid/scripts/sculpt.mjs build.json`: it writes `build.sculpted.json` beside it, every
   `sculpt` made a part of the `sculpt` kind — its grid, its `size`, its `at` — and says, part by
   part, how it stitched, how many sides and triangles it took, and how closely it follows the
   description. A description it cannot make is an error, with why.
3. Check the sculpted file (`node skills/ovgrid/scripts/check.mjs build.sculpted.json`) and deliver that one.

If you cannot run it yourself, give the person the build with its descriptions and that one
command to run; what they bring into the world is the sculpted file.

The description is the source: keep it, change it and run the tool again. The editor shows a sculpted
prim as any part — moved, turned, dressed, linked, cloned — but cannot reshape it: change the
description.

### The frame

A description is in metres, in the part's own frame: the part's `at` is where the description's
origin stands, its `turn` how the whole is turned. A `lathe` turns round the part's z and a `box`
stands on z = 0, centred on x and y — so `at` is the middle of its foot: put it on the floor.

### The shapes

Each description has one shape, then any of `deform` and `sides`.

| Shape | What it is | Stitching it gets |
|---|---|---|
| `lathe` | a profile `[r, z]` turned round z | ends on the axis: closed (sphere); a profile that comes back to its first point: a ring (torus) |
| `box` | a box `[x, y, z]`, edges `round`ed, upright corners `corner`ed, top and bottom swelling by `bulge` | closed |
| `loft` | sections stacked along an axis, smoothly from one to the next | closed, ends flat (or `"caps": "round"`, `"open"`) |
| `sweep` | a `section` carried along a path | ends rounded (or `"caps": "flat"`, `"open"`); `"closed": true`, a ring |
| `mesh` | a model, `.glb` or `.gltf` | each piece that fits: closed, or a tube |

#### lathe: vases, columns, bottles, lamps, bowls

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

#### box: cushions, mattresses, a sofa's seat, back and arms

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

#### loft: hulls, bodies, bottles that are not round

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

#### sweep: handles, rails, frames, pipes, rings

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

#### mesh: a model made elsewhere

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

### deform

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

### sides

Left out, the tool takes the fewest of 16 and 32 sides round and along the shape that follow it
within half a percent of its size (a sofa's plinth 16 × 16, 480 triangles; a cushion 32 × 16, 960; a
vase 32 × 32, 1,984);
`"sides": [columns, rows]` sets them (4–128 each, (columns + 1) × (rows + 1) no more than 1,600) —
columns round the shape, rows along it. Its samples go where it turns: a rim gets more than a straight
side.

### Dressing it

A sculpt has one face, `0`. A material wraps round it — u round the shape, v along it — and the tool
lays it in whole tiles round, so that no seam shows where it closes. Plain and organic materials suit
it best: fabric and leather for upholstery, wood, stone, metal; glazed pottery is a colour with
`"surface": { "gloss": 0.6 }`. Everything else a surface takes (format.md) applies.

### Composing

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


## 4. Quality: the frame, scale, walls with openings

The rules that make a build look built rather than generated: real proportions, walls cut round
their openings, materials running on across the boxes of a wall. (Where it stands and on what
ground: site.md.)

### The frame

x right, y ahead, z up (right as seen from in front, looking back at it from +y; for whoever faces +y — a driver, someone walking in — +x is on the left), metres; z = 0 the ground under the anchor. A turn is degrees about x, then
y, then z; z counter-clockwise from above: the z turn that points a part's +y from (x₀, y₀) towards
(x₁, y₁) is atan2(−(x₁ − x₀), y₁ − y₀) in degrees.

Write every object **in its own frame**: a house as if it stood at the origin, its front (door) to
+y, its floor at z = 0. Place it with the object's `at` and `turn`. Doors and windows (kinds) face
their own −y: in a wall facing +y turn them `[0, 0, 180]`; facing +x, `90`; facing −x, `−90`.

### Scale and proportions

The avatar is 1.8 m tall and 0.6 m wide; it steps up 0.3 m and walks slopes to 50°; its camera
follows 4 m behind and 1.4 m up (zoom out to 10 m). Build real sizes outside; open up what the
camera must get into — Second Life's builders' rule: rooms a third larger than life.

| Thing | Size |
|---|---|
| Door (outside / inside) | 1.0–1.2 × 2.2–2.4 m / 0.9–1.0 × 2.1–2.2 m |
| Window | 0.8–1.2 wide × 1.0–1.4 high, sill 0.8–1.0 m over the floor |
| Storey | 3.0–3.4 m floor to floor; ceiling ≥ 2.8 m (3–3.5 in a hall) |
| Room | ≥ 4 × 4 m; a corridor ≥ 1.5 m wide |
| Wall | 0.2–0.3 m (timber, plaster), 0.4–0.6 m (stone) |
| Floor slab / footing | 0.1–0.2 m over the ground / down past the lowest ground |
| Stairs | riser 0.15–0.2 m (≤ 0.3 walkable), tread 0.28–0.32 m, width ≥ 1 m |
| Roof | pitch 30–45° (thatch 45–55°); eaves 0.3–0.6 m over the walls |
| Cottage / house / hall | 6 × 5 m / 8 × 7 m, 1–2 storeys / 12 × 8 m |
| Table, chair seat, bench | 0.75 m / 0.45 m / 0.45 m high; a bed 2.0 × 1.4–1.6 × 0.5 m |
| Counter, bar, shelf | 0.9 m / 1.1 m / 0.3–0.4 m deep |
| Path, lane, square | 1.5–2.5 m / 3–4 m / 15–30 m across |
| Fence, garden wall | 0.9–1.2 m; stone walls 0.4–0.6 m thick |
| Street lamp | 3–4 m, every 12–20 m |
| Well | 1.4–1.8 m across, its wall 0.7–0.9 m high and 0.25–0.35 thick |

### Walls with openings

Cut a wall round its openings into boxes: full height between openings, and under and over each.
Walk a building's walls **counter-clockwise seen from above**: each box's x along the wall, its face
1 (−y) is then outside and face 3 (+y) inside — each may take its own material. Let the front and
back walls run the full width and the side walls fit between them. Then fill each opening with its
kind, its box exactly the opening: a door `[width, thickness, height]` at the wall's line, z = floor +
height / 2; a window `[width, thickness, height]`, its sill standing out of the wall. A roof kind over
the walls, its eaves out front and back, its gable ends (face 1) of the walls' material.

### An example: the cottage, as a build

The cottage these rules make — 7 × 6 m, plaster on stone, a clay-tiled gable roof, a door that opens on a click, four windows — as one build of one object, standing 0.2 m over the ground at its origin on a footing 0.8 m deep:

```json
{ "name": "Cottage", "objects": [{ "name": "cottage", "at": [0, 0, 0.2], "prims": [
  {"name":"footing","shape":"cube","at":[0,0,-0.4],"size":[7.3,6.3,0.8],"material":"masonry/stone-blocks/rustic-stone-wall-02"},
  {"name":"floor","shape":"cube","at":[0,0,-0.01],"size":[6.4,5.4,0.06],"material":"wood/floor/weathered-brown-planks"},
  {"name":"front 1","shape":"cube","at":[3,2.85,1.5],"size":[1,0.3,3],"turn":[0,0,180],"material":"plaster/plaster/beige-wall-001","surface":{"faces":{"1":{"offset":[0.167,0.5]},"3":{"offset":[0.833,0.5]}}}},
  {"name":"front 2","shape":"cube","at":[2,2.85,0.475],"size":[1,0.3,0.95],"turn":[0,0,180],"material":"plaster/plaster/beige-wall-001","surface":{"faces":{"1":{"offset":[0.5,0.158]},"3":{"offset":[0.5,0.158]}}}},
  {"name":"front 3","shape":"cube","at":[2,2.85,2.575],"size":[1,0.3,0.85],"turn":[0,0,180],"material":"plaster/plaster/beige-wall-001","surface":{"faces":{"1":{"offset":[0.5,0.858]},"3":{"offset":[0.5,0.858]}}}},
  {"name":"front 4","shape":"cube","at":[1.025,2.85,1.5],"size":[0.95,0.3,3],"turn":[0,0,180],"material":"plaster/plaster/beige-wall-001","surface":{"faces":{"1":{"offset":[0.825,0.5]},"3":{"offset":[0.175,0.5]}}}},
  {"name":"front 5","shape":"cube","at":[0,2.85,2.65],"size":[1.1,0.3,0.7],"turn":[0,0,180],"material":"plaster/plaster/beige-wall-001","surface":{"faces":{"1":{"offset":[0.167,0.883]},"3":{"offset":[0.833,0.883]}}}},
  {"name":"front 6","shape":"cube","at":[-1.025,2.85,1.5],"size":[0.95,0.3,3],"turn":[0,0,180],"material":"plaster/plaster/beige-wall-001","surface":{"faces":{"1":{"offset":[0.508,0.5]},"3":{"offset":[0.492,0.5]}}}},
  {"name":"front 7","shape":"cube","at":[-2,2.85,0.475],"size":[1,0.3,0.95],"turn":[0,0,180],"material":"plaster/plaster/beige-wall-001","surface":{"faces":{"1":{"offset":[0.833,0.158]},"3":{"offset":[0.167,0.158]}}}},
  {"name":"front 8","shape":"cube","at":[-2,2.85,2.575],"size":[1,0.3,0.85],"turn":[0,0,180],"material":"plaster/plaster/beige-wall-001","surface":{"faces":{"1":{"offset":[0.833,0.858]},"3":{"offset":[0.167,0.858]}}}},
  {"name":"front 9","shape":"cube","at":[-3,2.85,1.5],"size":[1,0.3,3],"turn":[0,0,180],"material":"plaster/plaster/beige-wall-001","surface":{"faces":{"1":{"offset":[0.167,0.5]},"3":{"offset":[0.833,0.5]}}}},
  {"name":"left 1","shape":"cube","at":[-3.35,1.6,1.5],"size":[2.2,0.3,3],"turn":[0,0,-90],"material":"plaster/plaster/beige-wall-001","surface":{"faces":{"1":{"offset":[0.367,0.5]},"3":{"offset":[0.633,0.5]}}}},
  {"name":"left 2","shape":"cube","at":[-3.35,0,0.475],"size":[1,0.3,0.95],"turn":[0,0,-90],"material":"plaster/plaster/beige-wall-001","surface":{"faces":{"1":{"offset":[0.9,0.158]},"3":{"offset":[0.1,0.158]}}}},
  {"name":"left 3","shape":"cube","at":[-3.35,0,2.575],"size":[1,0.3,0.85],"turn":[0,0,-90],"material":"plaster/plaster/beige-wall-001","surface":{"faces":{"1":{"offset":[0.9,0.858]},"3":{"offset":[0.1,0.858]}}}},
  {"name":"left 4","shape":"cube","at":[-3.35,-1.6,1.5],"size":[2.2,0.3,3],"turn":[0,0,-90],"material":"plaster/plaster/beige-wall-001","surface":{"faces":{"1":{"offset":[0.433,0.5]},"3":{"offset":[0.567,0.5]}}}},
  {"name":"back 1","shape":"cube","at":[-2,-2.85,1.5],"size":[3,0.3,3],"turn":[0,0,0],"material":"plaster/plaster/beige-wall-001","surface":{"faces":{"1":{"offset":[0.5,0.5]},"3":{"offset":[0.5,0.5]}}}},
  {"name":"back 2","shape":"cube","at":[0,-2.85,0.475],"size":[1,0.3,0.95],"turn":[0,0,0],"material":"plaster/plaster/beige-wall-001","surface":{"faces":{"1":{"offset":[0.167,0.158]},"3":{"offset":[0.833,0.158]}}}},
  {"name":"back 3","shape":"cube","at":[0,-2.85,2.575],"size":[1,0.3,0.85],"turn":[0,0,0],"material":"plaster/plaster/beige-wall-001","surface":{"faces":{"1":{"offset":[0.167,0.858]},"3":{"offset":[0.833,0.858]}}}},
  {"name":"back 4","shape":"cube","at":[2,-2.85,1.5],"size":[3,0.3,3],"turn":[0,0,0],"material":"plaster/plaster/beige-wall-001","surface":{"faces":{"1":{"offset":[0.833,0.5]},"3":{"offset":[0.167,0.5]}}}},
  {"name":"right 1","shape":"cube","at":[3.35,0,1.5],"size":[5.4,0.3,3],"turn":[0,0,90],"material":"plaster/plaster/beige-wall-001","surface":{"faces":{"1":{"offset":[0.9,0.5]},"3":{"offset":[0.1,0.5]}}}},
  {"name":"door","kind":"door","at":[0,2.85,1.15],"size":[1.1,0.3,2.3],"turn":[0,0,180],"style":"panelled","material":"wood/planks/planks-brown-10","behaviour":{"type":"door","trigger":"both","reach":2.5,"stay":8}},
  {"name":"window","kind":"window","at":[-2,2.85,1.55],"size":[1,0.3,1.2],"turn":[0,0,180],"columns":2,"rows":2,"sill":0.06,"material":"wood/planks/planks-brown-10","surface":{"faces":{"2":{"texture":"glass/clear/old"}}}},
  {"name":"window","kind":"window","at":[2,2.85,1.55],"size":[1,0.3,1.2],"turn":[0,0,180],"columns":2,"rows":2,"sill":0.06,"material":"wood/planks/planks-brown-10","surface":{"faces":{"2":{"texture":"glass/clear/old"}}}},
  {"name":"window","kind":"window","at":[0,-2.85,1.55],"size":[1,0.3,1.2],"turn":[0,0,0],"columns":2,"rows":2,"sill":0.06,"material":"wood/planks/planks-brown-10","surface":{"faces":{"2":{"texture":"glass/clear/old"}}}},
  {"name":"window","kind":"window","at":[-3.35,0,1.55],"size":[1,0.3,1.2],"turn":[0,0,-90],"columns":2,"rows":2,"sill":0.06,"material":"wood/planks/planks-brown-10","surface":{"faces":{"2":{"texture":"glass/clear/old"}}}},
  {"name":"roof","kind":"roof","type":"gable","at":[0,0,4.348],"size":[7.1,6.9,2.695],"material":"roofing/tiles/clay-roof-tiles-02","surface":{"faces":{"1":{"texture":"plaster/plaster/beige-wall-001"},"2":{"texture":"wood/planks/planks-brown-10"},"3":{"texture":"wood/planks/planks-brown-10"}}}}
] }] }
```



## 4. Quality: composition, from a description to a place

A place is a story laid on the ground: who lives here, what they do, where they walk, what the
eye finds first. Decide that before any coordinate. Then build from the ground up: the site, the
ways through it, what stands along them, what grows round them, what lights them.

### The whole

- **One thing to look at.** Each main view needs a focal point: the largest or tallest building
  (a hall, a chapel, a mill, an inn) on the square, a well or a big tree in its middle. Houses are
  smaller than it, sheds smaller still.
- **Fronts to the ways.** Doors, porches and the best windows face the square or the lane (each
  house's turn about z pointing its +y at it); backs face gardens and woods.
- **No grid.** Turn houses ±5–15° off their street, set them back 0.5–2 m unevenly, 3–8 m apart,
  in clusters of two or three with yards between. Vary width, depth, pitch, storeys and palette
  within the family: no two houses alike unless they are clones on purpose (a terrace of cottages).
- **Edges.** A place ends somewhere: a fence, a wall, a hedge, the wood's edge. Inside it, open
  ground to walk; outside, the land.

### Squares

- 15–30 m across, cobbles or flags (`paving/cobblestone/…`, `paving/stone/…`), its feature in the
  middle or a little off: a well, a fountain, a tree, a cross. Benches facing it; a lamp at each
  corner or in a ring of four.
- One slab of paving for the whole square, its top 2–4 cm over the highest ground under it; where
  the ground is lower, its side shows as a low edge of stone (`faces` 1–4 another material). On a
  slope: a terrace, its edge a retaining wall, steps (the `stairs` kind) down to the lane.
- Its edges are house fronts, low walls, trees: leave the corners open for the ways in.

### Ways: paths and lanes

- Every door joins the network. A footpath 1.5–2.5 m, a lane 3–4 m. Gentle curves — a point every
  6–10 m — along the contours, not straight up a slope. Each way one `road` (format.md): its points
  `[x, y]`, laid on the ground as it is placed, its edges mitred at the bends.
- Gravel or beaten earth (`ground/gravel/…`, `ground/soil/pathway-004`) for paths, cobbles for the
  square and the main lane: contrast with the grass. Avoid `cut-out` materials for a path's slab.
- A path stops at the square's edge, the porch's step, the door's threshold: not under them.

### Fences and walls

- Gardens: pickets 0.9–1.1 m (the `fence` kind, `"style": "pickets"`), white or weathered wood, a
  gap of 1.2 m where the path comes in. Fields and paddocks: rails 1.2 m, 2–3 rails. Stone
  walls: boxes 0.5 m thick, 0.8–1.2 m high, of rubble or fieldstone, each length laid on the ground.
- Fence three sides of a garden and leave the front to the path, or all four with a gate gap.
- One fence part runs a whole garden: its `points` round it, `[x, y]`, laid on the ground
  (format.md); a gap is where its points stop.

### Forests, groves, clearings

- **Species by place**: conifers (`fir`, `pine`, `cypress`) on heights and slopes, broadleaf
  (`oak`, `maple`, `birch`, `poplar`) in valleys and round villages, `willow` by water, `olive`,
  `cypress` and `pine` in the south, palms (`coconut`, `date`, `fanPalm`) on hot coasts, `dead`
  ones sparingly. One dominant species 60–70 %, one or two others; bushes (`bush`, `oleander`,
  `fern`) at the edges and in gardens.
- **Spacing**: crowns may touch in a wood — 0.8–1.2 × the crown's width apart (twice its `reach`
  in catalog.json → `species`: an oak's ~7 m reach, 10–14 m apart in open woodland, 6–8 m in a dense
  wood); a row of poplars 5–6 m apart.
- **Variety**: seeds 0–5 give the six variants, `scale` 0.8–1.25; never twenty identical trees in a
  row unless it is an avenue.
- **Clearings**: a ring of trees round free ground, rocks and a fallen `dead` tree in it, the ring
  thinning towards its edge.
- **Keep clear**: no tree on a path, in a house or within its `reach` of a wall or a roof
  (`avoid`). Tall trees behind the houses frame them; one or two in front of a view, not in it.

### Interiors

- **Every room**: a floor (boards, tiles), walls inside (the wall boxes' inner faces: plaster,
  panelling), a ceiling (the roof's underside, face 2, or a slab), and one warm lamp.
- **Furniture against walls**, a clear way from the door through the room (≥ 1 m — the avatar is
  0.6 m wide and everything is solid), and one focal piece: a hearth, a table, a bed, a counter.
- **Recipes from boxes and cylinders**, bevelled where hands touch (`bevel` kind, `radius`
  0.01–0.03): a table is a top 0.04 m and four legs; a chair a seat, four legs, a back; a bed a
  frame, a mattress, a duvet, pillows (spheres); a shelf, a barrel (cylinder), a crate (box), a
  rug (a box 1 cm thick, `fabric/carpet/…`), a hearth (a stone box, a dark opening, a log).
- **A hearth that burns**: embers with fire's particles under the flue, smoke on the chimney's cap
  outside (effects.md); a cold one, neither.
- **The lamp** is a part of the house's object, under the ceiling or on a table:
  `light: { on: 'night', range: 5, color: [1, 0.72, 0.42], intensity: 0.9 }` on a small emissive
  shade or bulb. Its light leaves through the windows' glass onto the ground outside: that is
  what makes a village look lived in at night.
- **Room for the camera**: it follows 4 m behind the avatar; rooms under 4 m across or ceilings
  under 2.8 m are seen through walls. Check the inside view.

### Night

- **Warm and few.** Lamps warm (`[1, 0.72, 0.42]`, about 2,700 K), the moon cool already. Lights on
  `'night'` cost nothing by day; out in the open a light fades out by day anyway.
- **Street lamps**: a post 3.2–3.8 m (a thin cylinder of dark metal or wood), a lantern on it — a
  small box or cylinder whose glass face is emissive (`emissive: 0.8`, no texture, a warm colour) —
  with `light: { on: 'night', range: 7, color: […], intensity: 0.8 }`, a spot down if it should
  light only the ground (`cone: { angle: 70, softness: 0.5 }`). One lamp object, cloned along the
  lane every 12–20 m, alternating sides, and round the square.
- **A lamp in every house that is lived in**: a warm pendant or lantern, `on: 'night'`, range 4 m,
  intensity 1, a little behind the middle of the room whose windows face the square or the way: a
  window looks lit from outside by the wall seen through it. Its walls — parts of the same object —
  keep its light in. Lit windows are what make a village at night; a dark house is a choice the story
  makes, not a saving.
- **Its price**: the village's five houses, a campfire and four street lamps — 10 lights, 8 within
  30 m of one another, 4–5 m each — cost 0.40 ms at its square by night, 0.29 ms by day; twelve at
  5–7 m once took its frames past 8.33 ms. Short ranges and at most 8 lights round any place keep a
  night within budget (budget.md).
- **Smoke from every chimney whose hearth burns** (`"particles": "chimney"` on the cap) — in a
  lived-in village, all of them.
- **Fires**: a campfire on the square, an inn's hearth, a torch by a door. Their flames light 2 m and
  only the two nearest light at all: a fire that lights a square or a room does it with its embers'
  own light (effects.md), counted with the lamps.
- **Count them**: keep the lights within 30 m of one another to 8 at most (the check counts them).
  A lantern that only needs to glow takes `range: 0`: always lit, no light cast, no cost.
- **What shows at night** is what lamps reach: the square, the doors, the ways. Put the lamps
  where people would need them, and look at the night pictures.

### Palettes

Pick a family per role and stay in it: walls two or three tones of one material family, roofs one
or two, timber one, paving one or two, plus the ground's own green and brown. Compare the
catalog's `color`: walls light (plaster, limewash) or mid (stone, brick); roofs darker or
warmer; timber darkest; paving mid and grey-brown, so that the houses stand out of it.

| Region | Walls | Roofs | Timber | Paving and ways | Trees |
|---|---|---|---|---|---|
| Northern village | `plaster/plaster/beige-wall-001`, `plaster/plaster/painted-plaster-wall`, `masonry/stone-blocks/stone-wall` | `roofing/slate/roof-slates-02`, `roofing/tiles/grey-roof-tiles-02` | `wood/planks/planks-brown-10` | `paving/cobblestone/cobblestone-01`, `ground/gravel/gravel-floor` | oak, birch, fir |
| Mediterranean | `plaster/concrete/concrete-wall-003`, `plaster/plaster/plastered-wall` | `roofing/tiles/clay-roof-tiles-02`, `roofing/tiles/clay-roof-tiles-03` | `wood/planks/oak-wood-planks` | `paving/tiles/patio-tiles`, `ground/gravel/sandy-gravel-02` | olive, cypress, pine |
| Cottage country | `masonry/stone-blocks/rustic-stone-wall-02`, `masonry/brick/red-brick` | `roofing/thatch/reed-roof-04`, `roofing/thatch/thatched-roof-002a` | `wood/planks/brown-planks-03` | `paving/cobblestone/cobblestone-02`, `ground/soil/pathway-004` | oak, willow, bush |
| Log and timber | `wood/logs/bark-brown-02` (logs), `wood/planks/wooden-planks` | `roofing/slate/roof-slates-03` | `wood/planks/planks-brown-10` | `ground/gravel/rocky-gravel` | fir, pine, birch |

Use only ids from the catalog (catalog.json → `materials`): an unknown one is refused. Stay off `look: ["glows"]` materials (lit facades) unless the build is a city at
night, and off `cut-out` ones for anything solid: they are for fences, grates and leaves.

### Mistakes to look for

1. Objects floating over the ground or buried in it — survey; footings down past the lowest ground.
2. A grid of identical houses; everything at right angles to everything.
3. Houses showing their backs to the square; doors opening onto nothing.
4. A door or window turned inside out (its front is its −y), or a window in a solid wall (no
   opening cut for it).
5. A shut door the avatar cannot open: give it the `door` behaviour (or build it open).
6. A roof that does not cover the walls, a gap under it, gables open to the sky.
7. Two faces in one plane (a floor's top on a footing's top): they flicker. Offset 1–2 cm.
8. A texture stretched or tiny: `scale` set by hand — leave it out.
9. Spheres sized as boxes (their size is height, depth, width).
10. Too many lights, all at 10 m; a room's lamp in an object of its own, lighting through walls.
11. Glass everywhere: see-through faces are the dearest to draw.
12. One object of a thousand parts, or a thousand objects of one part.
13. Paths straight up slopes, or floating over a bump (lay them in short legs).
14. Trees on paths, in houses, crowns through roofs.
15. Rooms the camera cannot get into.

## 5. Limits and the budget

The person's machine draws at 120 Hz: **8.33 ms of GPU a frame** at 1445×767 @2x (a 16" M2 Max),
in every view, on foot included. The world takes most of it before anything is built — on foot by
day about 7 ms, by night about 7.4 ms — so a build lives on the remaining 1 ms or so: **≤ 0.5 ms
for the densest view of a build by day**, its night views with every lamp lit within the frame too.

### What one build may bring

The editor checks every build against this before it can be placed, and so does the check script
(`node skills/ovgrid/scripts/check.mjs <build.json>`): past **fair**, it says so and why; past **most**, it
refuses the build. Counted with every clone (a clone's parts draw again).

| | fair | most | Why |
|---|---|---|---|
| parts | 1,500 | 4,000 | each an instance; the reference village is 593 |
| triangles | 150,000 | 600,000 | at the finest level, near the camera; round shapes are the dear ones |
| materials | 40 | 96 | each ~150 kB for every visitor to fetch, ~700 kB up close; past 16 within 10 m, the nearest blur |
| lights | 12 | 32 | the renderer lights with the 32 strongest in view |
| crowd | 8 | 16 | lights within 30 m of one another: past 8 each pixel takes the dearer, clustered path |
| systems | 12 | 48 | particle systems: each a draw of its own; 128 in view at most, the nearest |
| particles | 1,000 | 3,000 | in the air at once; the world draws 1,500 a frame for everything in view, thinning each alike past it |
| moving | 30 | 120 | objects, clones and parts with a behaviour: 20 cost 0.02 ms of GPU and 0.05 ms of physics |
| scripts | 8 | 32 | the 32 nearest run; each has its own 16 MB and 5 ms an event |
| trees | 400 | 2,000 | cheap on the GPU, but each a record to sign and send; forests are painted with the brush |

Besides: **an object holds at most 256 parts** (split a village into objects: each house, the
square, each run of fence), a part's `light` reaches **10 m** at most, a build is at most 2 MB of
JSON.

### What a place may hold

The same check counts what already stands within **60 m** of the build's anchor — everyone's, as
the editor sees the shared world — with the build:

| Within 60 m | fair | most |
|---|---|---|
| parts | 3,000 | 10,000 |
| lights | 16 | 48 |
| systems | 24 | 96 |
| trees | 3,000 | 10,000 |

A place past its *most* takes nothing more: build lighter, or somewhere else.

### What a build costs

| Thing | Cost | So |
|---|---|---|
| Parts | Each is an instance of a shared mesh; culled whole, then part by part; four levels of detail by its size on screen | Thousands are fine; tiny parts far away are dropped |
| Triangles | What the GPU draws: at the finest level near the camera, coarser with distance (a 1 m part steps down at about 8, 32 and 59 m; a 10 m part at 84, 318, 591 m) | Round shapes at the finest level are the dear ones: a sphere 528, a torus 1,152, a box 12–108 |
| Distinct meshes | One per shape, kind recipe (and size, for kinds whose mesh depends on it) and level; a draw per mesh, level, face and pipeline. Textures add no draws | Reuse shapes and sizes: 26 parts of a cottage were 4 meshes |
| An object far away | One simplified mesh for all its parts, shared by its clones, once it is small on screen | Group what is seen together into one object |
| Clones | A transform each; the original's parts, meshes and far mesh shared | Clone what repeats unchanged |
| See-through faces (glass, water, `opacity` < 1) | A pass of their own, sorted far to near, no hidden-surface removal: ~0.3 ms for a layer covering the screen | Small panes; no big translucent walls; no glass behind glass |
| Cut-out materials (fences, grates) | Discard fragments, defeating the GPU's hidden-surface removal | Small things only |
| Lights | Per lit pixel within range. Up to 8 in view: every pixel tries all; more: clustered, dearer; the 32 strongest kept. Off by day outdoors; `'night'` ones cost nothing by day | Few, short (≤ 10 m, 5–8 typical), ≤ 8 within any 30 m |
| Glow | A half-resolution pass when anything glows in view | Halos for a few lanterns, not for every window |
| Particles | Symbolic: a flame 3–4 cards, smoke 3–5 puffs; one budget a frame for every system in view (1,500 particles, 0.6 of the screen covered), thinned alike past it; past 30 m a part throws its first layer only, past 200 m nothing. Blended ones (smoke, steam, fog) are the dearest where they fill the screen | A chimney for each burning hearth, a few fires, fog in one or two hollows (effects.md) |
| Trees | Full mesh near, simplified mid-way, an impostor far; culled and drawn on the GPU | Hundreds are cheap: a 5,000-tree forest costs −0.4 ms on foot (it hides terrain), +0.4 ms from 150 m above |
| Shadows | Everything built casts within 250 m; redrawn when it changes or the light moves | Nothing to do |

Triangles per shape at its four levels (catalog.json has every preset and kind, at their defaults):
cube 12 / 12 / 48 / 108, cylinder 24 / 36 / 90 / 192, sphere 24 / 54 / 180 / 528, prism 8, rock
60–480, door 136–208, window 72–96, roof 16, fence (4 m of pickets) 60–444, column 124–348. Trees:
250–4,600 triangles in full, about half simplified (catalog.json → `species`).

### Measured (busy-time union, 1445×767 @2x, against the same view without)

| View | Cost |
|---|---|
| The reference village at its square by day: 595 parts, 11 particle systems, smoke from five chimneys | +0.29 ms (a frame of 6.3 ms) |
| The same by night, every house lit: 10 lights, 8 within 30 m of one another, 4–5 m | +0.40 ms (a frame of 6.9 ms) |
| A lit room from inside: the log cabin by night, its bulb on or off | the same, 4.9 ms a frame: a room's own lamp costs nothing more |
| A campfire 6 m off, by night: with its light / without | +0.20 ms / +0.06 ms |
| On foot inside 5,000 trees / 150 m above them | −0.39 ms / +0.41 ms |
| 20 things moving by themselves | +0.02 ms (0.05 ms of physics) |
| An emissive sphere on the grass at night; lava at night | +0.25 ms; +0.31 ms |

The village's lights were not always so cheap: with twelve at 5–7 m, ten of them within 30 m of one
another, its square by night once cost twice as much and took frames past 8.33 ms. Kept to ten at
4–5 m, the renderer's cheaper path holds — the budget's `crowd`.

### When it is over

Clone what repeats; kinds instead of piles of prims; fewer spheres and tori (a box where nobody sees
it is round); fewer, larger parts where many small ones do one thing; shorter and fewer lights;
fewer, larger panes; sober particles; fewer trees nearest the views — and say what you simplified
(plan.md).

## 6. Interactivity: what makes a place alive

Smoke from the chimneys, a fire in the square, lamps at night, doors that open, sails that turn, a
ferry, a lock only its owner opens. Every effect is part of the build file, checked by every peer,
played out the same for everyone from the record and the clock — whether its owner is there or
not — and drawn within the frame's budget (budget.md).

### The panel first, code last

1. **A property** — `light`, `particles`, `behaviour`, a face's `emissive` and `glow` — is what the
   card sets and what a build writes. No code, nothing on the network once written, nothing that
   stops when its owner leaves; it costs only its drawing. Reach for it first.
2. **A script** only for what no property can say: a condition (a key, a lock, who may open), a
   sequence (a bell that rings, then stops), a reaction to something other than a click or the
   night, a state that is kept (a switch, a counter).

### Particles

Particles here are **symbolic**: a flame is three or four cards, smoke three to five puffs, sparks
a couple and only close by — a sign of fire, smoke or steam, drawn within one budget a frame for
every system in view (1,500 particles), each thinned alike past it.

`particles` on a prim: a kit's name — `"campfire"`, `"torch"`, `"chimney"` — one layer —
`{ "preset": "smoke", "scale": 1.5, "amount": 0.8, "tint": [0.8, 0.8, 0.8] }` — or up to four layers
in a list. The presets: `fire`, `smoke`, `sparks`, `steam`, `fog`, `fountain`, `snow`. `amount`
(0.1–4) is how many, `scale` (0.1–10) how large and how far they go, `tint` multiplies their
colours; any of a preset's own parameters may be given over it. Every name, range and each
preset's own values: catalog.json → `particles`. A string names a kit only: a preset is
`{ "preset": "steam" }`, never `"steam"`.

- **Thrown from the top of the prim**, in a cone round its own +z, then carried by the world's up,
  east and north (`accel`, `drift`). Put the emitter where the effect starts — a chimney's cap,
  the embers, a torch's head, a fountain's nozzle — upright. A `collisionOnly` part throws nothing;
  a `phantom` one does: emitters are phantom.
- **Steady**: leave `since` out and they have always been going. `"on": false` keeps a layer
  switched off.
- **Flames light only by their part's light**: without one they glow and light nothing. With it on
  (`true` or `"night"`), the part lights as its `light` says — glowing embers (`emissive` 1, warm)
  with `"light": { "range": 5, "flicker": 0.35 }` light a room or a square — and the two nearest
  flames in view add 2 m round them, flickering. `{ "on": "night" }`: its light at night only (the
  flames burn on).

| Particles | For | Emitter | Notes |
|---|---|---|---|
| `"chimney"` | every chimney whose fire burns | the chimney's cap | a few puffs, fewer the farther (all within 15 m): to be read from a square 20–40 m off, `[{ "preset": "smoke", "scale": 1.6, "amount": 2.5 }]` |
| `"campfire"` | a fire in the open: a camp, a square at night, a smithy | embers in a ring of stones, under crossed logs | flames, sparks and smoke |
| `"torch"` | a torch on a wall or a post, a brazier | the torch's head | |
| `{ "preset": "fire", "scale": 0.5 }` | a hearth, a stove, an oven | embers on the hearthstone, under the flue | its smoke leaves by the chimney's cap |
| `{ "preset": "fire", "scale": 0.12 }` | a candle, a lantern's flame | the wick | |
| `{ "preset": "steam" }` | a kettle, a laundry tub, a hot spring, a bath house's vent | the water's surface | |
| `{ "preset": "smoke" }` | a smouldering ruin, a kiln, a charcoal pile | | |
| `{ "preset": "fog" }` | low ground: a valley floor, a shore, a marsh, a graveyard | a slab sunk a few cm under the ground (drawn, unseen) | slow and wide (a 4 m disc); see the costs |
| `{ "preset": "fountain" }` | a fountain's jet | a nozzle at the water, upright | `floor`, negative: how far under the nozzle the drops stop (the basin's water) |
| `{ "preset": "snow" }` | snow over a place | high over it | an 8 m disc by default |

```json
{ "name": "chimney cap", "shape": "cube", "at": [3.3, -0.8, 7.1], "size": [0.84, 1.04, 0.1], "material": "paving/stone/granite-tile-04", "particles": "chimney" },
{ "name": "embers", "shape": "hemiSphere", "at": [0, 0, 0.05], "size": [0.5, 0.5, 0.18], "color": [1, 0.38, 0.08],
  "surface": { "emissive": 1, "glow": 0.3 }, "particles": "campfire", "light": { "range": 6, "flicker": 0.35 }, "phantom": true }
```

### Light at night

- **Lamps** (`light`, format.md): warm (`[1, 0.72, 0.42]`), `on: "night"`, ranges of 5–8 m; one
  for each room that is lived in, a part of its house's object (its walls then stop the light, its
  windows let it out); street lamps along the ways and round the square, every 12–20 m, one lamp
  object cloned.
- **Fires are lights**: an inn's hearth can be its only lamp; a campfire lights a square.
- **What only glows**: `light: { "range": 0 }` — a lantern for looks, embers — lights nothing and
  costs nothing.
- **Every house lived in has its lamp**, and every chimney over a burning hearth its smoke: a dark
  house — a lamp `on: false`, a cold hearth, no smoke — is for a story that asks for one.

### Behaviours

`behaviour` on a prim, on an object (in `objects`) or on a clone (format.md has the fields and an
example; catalog.json → `behaviours` every range).

| Type | For | How |
|---|---|---|
| `door` | every door people use | the door kind shut, `{ "type": "door", "trigger": "both", "reach": 2.5, "stay": 8 }`: it opens as someone comes within 2.5 m or on a click, and shuts once they have gone; `"click"` for a door that waits to be knocked on |
| `slide` | sliding doors, shutters, hatches, a shop's window | `{ "type": "slide", "x": -1.3, "trigger": "both", "reach": 2.5, "stay": 12 }`: along its own x as someone comes near or on a click, back by itself; a shutter on a click alone |
| `spin` | windmill sails, a water wheel, a weathervane, a carousel, a sign | an object whose own z is the axle: sails `"turn": [90, 0, yaw]` (axle level), `{ "type": "spin", "speed": 12 }` °/s |
| `move` | an elevator, a lift bridge, a ferry, a moving platform | an object, `{ "type": "move", "z": 3.2, "speed": 1.5, "wait": 4 }` — its own axes, there and back |
| `belt` | a conveyor, an escalator, a moving walkway | `{ "type": "belt", "speed": 0.6 }` carries along its own y; stairs rise along their y |
| `route` | a tour boat, a train, a cart on its round | an object, `{ "type": "route", "points": [[0, 40, 0], [30, 60, 0], [60, 20, 0]], "speed": 3, "stop": 10 }` — through its points and on again (`"mode": "back"`: there and back), turning to where it goes, stopping at each (`"at": "ends"`: only where it is kept) |

- **What people ride moves whole**: a behaviour on an object carries the avatar standing on it. A
  part moving inside its object is drawn moving, but its collider is made again only once it stops.
- Slow is believable: sails 6–15 °/s, a water wheel 20–40 °/s, an elevator 1–2 m/s.
- Everything moves the same on every peer from the clock: no two players see a different ferry.

### Vehicles and routes

Cars, motorbikes, boats and trains people drive: vehicles.md. What carries people by itself is an
**object with a `move` behaviour**: a ferry across a river, a lift up a
cliff, a cable car, a platform — there and back, waiting at either end, carrying whoever stands on
it. Give it a floor wide enough to stand on (≥ 2 × 2 m), rails round its edge, a landing at each
end level with its floor, and a speed people can step on and off at (1–2 m/s, `wait` 5–10 s).

```json
{ "name": "ferry", "at": [0, -30, -0.2], "behaviour": { "type": "move", "y": 60, "speed": 1.5, "wait": 8 }, "prims": [ … ] }
```

Through several stops, a **`route`**: its `points` in its own frame (up to 64, `[x, y, z]` m, from
where it is kept through each in turn), on a smooth curve, `"mode": "round"` and on again or
`"back"` the way it came, `"stop"` seconds at each point — or, with `"at": "ends"`, only where it is
kept (and, there and back, at its last point too): its port, its station — slowing into it and
away, turning to face its way (`"face": "yes"`). A boat takes `"water": "yes"`: it keeps its height over
the sea wherever its points are. It carries whoever stands on it, as `move` does.

A tour boat round from its port and back, stopping only there — 30 s to get on and off:

```json
{ "name": "tour boat", "at": [0, -40, 0.3], "behaviour": { "type": "route", "points": [[0, 30, 0], [40, 60, 0], [0, 90, 0], [-40, 60, 0]],
  "speed": 3, "stop": 30, "at": "ends", "mode": "round", "face": "yes", "water": "yes" }, "prims": [ … ] }
```

Its benches `"seat": true`: whoever sits on them goes round with it (vehicles.md).

Every peer sets it off from the same moment, so that every player sees the boat in the same place.

### Scripts

For what no property can say — a condition, a sequence, a state kept, a reaction to someone near or
to the night — a prim takes a **script**: JavaScript, the source as a string in its `script` field,
run by every peer near it (within 100 m, the 32 nearest), each in a sandbox of its own (QuickJS in
WebAssembly): no page, no network, no storage, nothing but its API.

| | |
|---|---|
| `on(event, handler, options?)` | `'click'` `({ who, face })` — who clicked (an address, lower case; null if not signed in); `'near'`, `'away'` `({ who, count })` — someone within `options.radius` m (0.5–32, 5 unless said), and gone; `'day'`, `'night'` — the sun crossing the horizon where it stands, once at start as it is; `'change'` `(props)` — what is kept of it changed |
| `every(seconds, handler)`, `after(seconds, handler)`, `cancel(id)` | timers on the shared clock (0.1 s at least) |
| `set(props)` | what it shows, here and now, over what is kept: every peer running it shows the same; nothing written |
| `keep(props)` | the same, kept: written by its owner's peer, signed, for everyone — at most once a second |
| `get()` | its properties as shown |
| `touch()` | opens or shuts what opens on a click (its door or slide, or its object's), as a click would |
| `print(…)` | a line in its owner's Script tab |
| `random()`, `now()`, `self` | alike on every peer; the shared time (s); `{ id, owner }` |

It may set and keep its own `color`, `light`, `surface`, `particles` and `behaviour` — each checked
as any write is — never its place, size or shape (what moves, moves by a behaviour). Limits: 16 KB
of source, 20 ms to start, 5 ms an event, 50 ms in any second, 16 timers; past them it stops,
alone.

```json
{ "name": "strongroom door", "kind": "door", "at": [0, 2.85, 1.15], "size": [1.1, 0.3, 2.3], "turn": [0, 0, 180],
  "behaviour": { "type": "door", "stay": 6 },
  "script": "on('click', ({ who }) => { if (who === self.owner) touch() })" }
```

| Want | Script |
|---|---|
| A door only its owner opens (a lock) | as above: a prim whose script hears clicks opens only by its `touch()` — and opens on nobody's approach |
| A door that opens as someone comes near | no script: `"trigger": "near"` (or `"both"`) on its `door` or `slide` behaviour |
| A light switch, for everyone | `on('click', () => keep({ light: { on: get().light?.on === false } }))` |
| Lamps at dusk, each a moment apart | `on('night', () => set({ light: { on: true, range: 8 }, surface: { emissive: 0.9 } }))` and `on('day', () => set({ light: { on: false }, surface: { emissive: 0 } }))` — or simply `"light": { "on": "night" }`, no script |
| Fog by night, lifting after dawn | on the fog's emitter: `on('night', () => set({ particles: { preset: 'fog' } }))` and `on('day', () => after(900, () => set({ particles: null })))` — `day` and `night` also come once at start, as it is |
| A mill that turns faster with someone near | `on('near', ({ count }) => set({ behaviour: { type: 'spin', speed: count ? 30 : 8 } }), { radius: 8 })` and the same on `'away'` |

Prefer the property every time it can say it: `"on": "night"` needs no script; a door that opens
on a click or as someone comes near needs only its behaviour.

### Games

Minigames — a race, a puzzle, a ball game — will run as **native WebAssembly modules** (built from
AssemblyScript, Rust, C or Zig, at most 1 MB, carried peer to peer by their hash) on the same API
as scripts, with a game's own input, ticks and players, arriving with the first minigame. Until
then, keep games to what scripts and behaviours can do: a gate that opens, a bell, a counter kept.

### How many, and where

| Effect | In a village | Why |
|---|---|---|
| Lights, lamps and flames | ≤ 8 within 30 m of one another, 5–8 m each | each lit pixel tries every light up to 8 in view; past 8 the clustered path |
| Smoke, steam, fog, fountains (blended) | a chimney for each burning hearth, one or two steams or fountains, fog in one or two hollows | large soft particles drawn over one another cost the most where they fill the screen: fog round the camera, smoke seen close |
| Fire and sparks (added light) | a few | small and bright; each fire's light is a light |
| Particle systems | ≤ 12 a build (128 in view at most, the nearest; 1,500 particles a frame for all of them, thinned alike past it) | each a draw of its own |
| Things moving | ≤ 30 a build | 20 moving cost +0.02 ms of GPU and 0.05 ms of physics a frame |
| Scripts | ≤ 8 a build | the 32 nearest run; each its own memory and time |

The check counts the lights (a fire's by its part's light), the particle systems — the blended ones apart —
the particles in the air, what moves and the scripts, against the budget (budget.md).

## 6. Interactivity: vehicles — a car, a motorbike, a boat, a train

An object one sits in and drives. Its owner, sitting on its seat, drives it — W and S throttle and
brake, A and D steer, Space the hand brake, Escape out — and everyone sees it go, with whoever rides
in it; others may sit on its other seats as passengers. A vehicle costs nothing until it is driven:
then 0.07 ms of physics a frame on its driver's peer alone.

### What makes one

- **The object** says what it is: `"vehicle": { "type": "car" }` — `car`, `bike`, `boat` or
  `train` — and its parameters, each held to its range (catalog.json → `vehicles`): a car's
  `power` (N·m, 50–3,000), `speed` (m/s), `steer` (°) and `mass` (kg); a bike's the same; a boat's
  `power`, `speed`, `steer` (its rudder) and `mass`; a train's `speed` and `accel`.
- **A seat**: a part with `"seat": true`, sat on by a click — on its top, facing its +y. The
  driver's where the driver sits; more for passengers. The driver faces +y, so the driver's left is
  +x: a car that keeps to the right of the road, as in Spain, has its driver's seat and steering
  wheel at +x (the roadster's at x = 0.36); one that keeps to the left, at −x.
- **Its frame**: its +y its front, z = 0 the ground under its wheels; its parts in that frame.
- **Its body**: its other parts — the solid ones make the shape it drives as, its centre of mass
  lowered 0.3 m.
- **Each vehicle an object of its own**: a linked clone is not driven. Two cars alike are two
  objects with the same parts.
- **Open where people sit**: a seat inside a closed box hides whoever sits there — an open car, a
  cab with posts and a roof, a boat's open deck.

### What makes it look like one

A vehicle is looked at up close: boxes and black cylinders read as a toy. What the format has for it:

- **A rounded body**: its panels `bevel` boxes — `"kind": "bevel", "base": "box", "edge": "round",
  "radius": 0.12` for a bonnet or a tank; 0.02–0.05 for doors, trim and seats, with
  `"segments": 2` (a small round wants no more steps).
- **Paint**: its colour with `"surface": { "gloss": 0.9, "metal": 0.5, "reflect": 0.3 }` — the sky
  and what is round it in it. A boat's gelcoat the same without `metal`.
- **Chrome**: `metal/bare/metal-050a` with `"metal": 1, "gloss": 0.95` — bumpers, a grille, a
  windscreen's frame, a bike's fork, bar and exhaust.
- **Glass** for a windscreen (`glass/clear/float`), the bank's **leather** for seats
  (`fabric/leather/…`), **rubber** for tyres and grips (`synthetic/rubber/rubber-001`).
- **Wheels with rims**: a wheel is a bevelled cylinder — `"kind": "bevel", "base": "cylinder",
  "edge": "round", "radius"` its tyre's shoulder — rubber, its two faces (0 and 2) the rim's metal:
  `"surface": { "faces": { "0": { "texture": "metal/bare/metal-061b", "metal": 1, "gloss": 0.8 },
  "2": { … } } }`. One part, so the rim steers and rolls with its tyre: a rim made a part of its own
  stays where it was built while the wheel turns.
- **Wings and mudguards**: the top of a hollow cylinder lying across it round the wheel's axle —
  `"shape": { "preset": "cylinder", "hollow": 0.85, "profileBegin": 0.25, "profileEnd": 0.75 }`,
  `"turn": [0, 90, 0]`, its diameter 0.2–0.25 m more than the wheel's (room for its springs), a
  little wider than the tyre (`profileBegin` 0.3 and `profileEnd` 0.7 for a bike's shorter arc) —
  and `"phantom": true`, so that its solid hull is no part of the body the vehicle drives as. Flat
  boards over the wheels read as shelves.
- **Headlamps lit at night**: a short chrome cylinder along y, `"turn": [90, 0, 0]` — its face 2
  then looks ahead: the lens, `"faces": { "2": { "texture": "synthetic/plastic/plastic-013a",
  "emissive": 1, "metal": 0 } }` — and `"light": { "on": "night", "range": 9, "cone": { "angle": 30,
  "softness": 0.5 } }`, a cone shining down the part's −z, which that turn points ahead. Unlit by
  day; at night the lens glows and the road ahead is lit.

### A car

Its wheels are its parts that are **one cylinder lying across it**, its axle along the object's x —
a cylinder or a bevelled one, `"turn": [0, 90, 0]`, its size `[diameter, diameter, width]`, its
centre a radius over the ground. Its front ones (greater y) steer; all of them drive. Two at least;
four for a car. **Any other plain or bevelled cylinder lying across it is a wheel too**: a bar, an
axle or a pipe across it is a box (a hollow or cut one, a wing, is not a wheel). A small open
roadster, 3.9 m long:

```json
{ "name": "roadster", "at": [0, 0], "vehicle": { "type": "car", "power": 600, "speed": 22, "steer": 32, "mass": 900 }, "prims": [
  { "name": "body", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.12, "at": [0, 0, 0.5], "size": [1.62, 3.86, 0.36], "color": [0.5, 0.03, 0.02], "surface": { "gloss": 0.9, "metal": 0.5, "reflect": 0.3 } },
  { "name": "bonnet", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.12, "at": [0, 1.15, 0.8], "size": [1.4, 1.5, 0.26], "color": [0.5, 0.03, 0.02], "surface": { "gloss": 0.9, "metal": 0.5, "reflect": 0.3 } },
  { "name": "boot", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.1, "at": [0, -1.42, 0.78], "size": [1.4, 1, 0.22], "color": [0.5, 0.03, 0.02], "surface": { "gloss": 0.9, "metal": 0.5, "reflect": 0.3 } },
  { "name": "door", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.05, "segments": 2, "at": [-0.74, -0.27, 0.8], "size": [0.12, 1.3, 0.26], "color": [0.5, 0.03, 0.02], "surface": { "gloss": 0.9, "metal": 0.5, "reflect": 0.3 } },
  { "name": "door", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.05, "segments": 2, "at": [0.74, -0.27, 0.8], "size": [0.12, 1.3, 0.26], "color": [0.5, 0.03, 0.02], "surface": { "gloss": 0.9, "metal": 0.5, "reflect": 0.3 } },
  { "name": "wing", "shape": { "preset": "cylinder", "hollow": 0.85, "profileBegin": 0.25, "profileEnd": 0.75 }, "at": [-0.86, 1.28, 0.34], "size": [0.92, 0.92, 0.3], "turn": [0, 90, 0], "phantom": true, "color": [0.5, 0.03, 0.02], "surface": { "gloss": 0.9, "metal": 0.5, "reflect": 0.3 } },
  { "name": "wing", "shape": { "preset": "cylinder", "hollow": 0.85, "profileBegin": 0.25, "profileEnd": 0.75 }, "at": [0.86, 1.28, 0.34], "size": [0.92, 0.92, 0.3], "turn": [0, 90, 0], "phantom": true, "color": [0.5, 0.03, 0.02], "surface": { "gloss": 0.9, "metal": 0.5, "reflect": 0.3 } },
  { "name": "wing", "shape": { "preset": "cylinder", "hollow": 0.85, "profileBegin": 0.25, "profileEnd": 0.75 }, "at": [-0.86, -1.3, 0.34], "size": [0.92, 0.92, 0.3], "turn": [0, 90, 0], "phantom": true, "color": [0.5, 0.03, 0.02], "surface": { "gloss": 0.9, "metal": 0.5, "reflect": 0.3 } },
  { "name": "wing", "shape": { "preset": "cylinder", "hollow": 0.85, "profileBegin": 0.25, "profileEnd": 0.75 }, "at": [0.86, -1.3, 0.34], "size": [0.92, 0.92, 0.3], "turn": [0, 90, 0], "phantom": true, "color": [0.5, 0.03, 0.02], "surface": { "gloss": 0.9, "metal": 0.5, "reflect": 0.3 } },
  { "name": "dashboard", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.04, "segments": 2, "at": [0, 0.42, 0.92], "size": [1.36, 0.16, 0.14], "material": "synthetic/plastic/plastic-006", "surface": { "gloss": 0.4 } },
  { "name": "windscreen", "shape": "cube", "at": [0, 0.5, 1.15], "size": [1.3, 0.03, 0.34], "material": "glass/clear/float", "turn": [-20, 0, 0] },
  { "name": "windscreen frame", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.02, "segments": 2, "at": [0, 0.56, 1.31], "size": [1.36, 0.045, 0.045], "material": "metal/bare/metal-050a", "surface": { "gloss": 0.95, "metal": 1 }, "turn": [-20, 0, 0] },
  { "name": "windscreen post", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.02, "segments": 2, "at": [-0.67, 0.5, 1.15], "size": [0.045, 0.045, 0.36], "material": "metal/bare/metal-050a", "surface": { "gloss": 0.95, "metal": 1 }, "turn": [-20, 0, 0] },
  { "name": "windscreen post", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.02, "segments": 2, "at": [0.67, 0.5, 1.15], "size": [0.045, 0.045, 0.36], "material": "metal/bare/metal-050a", "surface": { "gloss": 0.95, "metal": 1 }, "turn": [-20, 0, 0] },
  { "name": "steering wheel", "shape": "torus", "at": [0.36, 0.26, 1.02], "size": [0.34, 0.34, 0.05], "turn": [70, 0, 0], "material": "synthetic/plastic/plastic-006" },
  { "name": "driver's seat", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.05, "segments": 2, "at": [0.36, -0.3, 0.75], "size": [0.52, 0.5, 0.14], "material": "fabric/leather/fabric-leather-01", "seat": true },
  { "name": "driver's seat back", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.05, "segments": 2, "at": [0.36, -0.6, 1], "size": [0.52, 0.12, 0.5], "material": "fabric/leather/fabric-leather-01", "turn": [-12, 0, 0] },
  { "name": "passenger's seat", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.05, "segments": 2, "at": [-0.36, -0.3, 0.75], "size": [0.52, 0.5, 0.14], "material": "fabric/leather/fabric-leather-01", "seat": true },
  { "name": "passenger's seat back", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.05, "segments": 2, "at": [-0.36, -0.6, 1], "size": [0.52, 0.12, 0.5], "material": "fabric/leather/fabric-leather-01", "turn": [-12, 0, 0] },
  { "name": "grille", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.02, "segments": 2, "at": [0, 1.92, 0.62], "size": [0.56, 0.05, 0.22], "material": "metal/bare/metal-050a", "surface": { "gloss": 0.95, "metal": 1 } },
  { "name": "bumper", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.045, "segments": 2, "at": [0, 2, 0.4], "size": [1.5, 0.1, 0.1], "material": "metal/bare/metal-050a", "surface": { "gloss": 0.95, "metal": 1 } },
  { "name": "bumper", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.045, "segments": 2, "at": [0, -2, 0.4], "size": [1.5, 0.1, 0.1], "material": "metal/bare/metal-050a", "surface": { "gloss": 0.95, "metal": 1 } },
  { "name": "headlamp", "shape": "cylinder", "at": [-0.52, 1.94, 0.84], "size": [0.2, 0.2, 0.1], "turn": [90, 0, 0], "material": "metal/bare/metal-050a", "surface": { "gloss": 0.95, "metal": 1, "faces": { "2": { "texture": "synthetic/plastic/plastic-013a", "emissive": 1, "metal": 0, "gloss": 0.6 } } }, "light": { "on": "night", "range": 9, "color": [1, 0.93, 0.8], "intensity": 0.85, "cone": { "angle": 30, "softness": 0.5 } } },
  { "name": "headlamp", "shape": "cylinder", "at": [0.52, 1.94, 0.84], "size": [0.2, 0.2, 0.1], "turn": [90, 0, 0], "material": "metal/bare/metal-050a", "surface": { "gloss": 0.95, "metal": 1, "faces": { "2": { "texture": "synthetic/plastic/plastic-013a", "emissive": 1, "metal": 0, "gloss": 0.6 } } }, "light": { "on": "night", "range": 9, "color": [1, 0.93, 0.8], "intensity": 0.85, "cone": { "angle": 30, "softness": 0.5 } } },
  { "name": "rear lamp", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.015, "segments": 2, "at": [-0.6, -1.94, 0.6], "size": [0.16, 0.04, 0.08], "color": [0.6, 0.02, 0.02], "surface": { "gloss": 0.8 } },
  { "name": "rear lamp", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.015, "segments": 2, "at": [0.6, -1.94, 0.6], "size": [0.16, 0.04, 0.08], "color": [0.6, 0.02, 0.02], "surface": { "gloss": 0.8 } },
  { "name": "exhaust", "shape": "cylinder", "at": [0.5, -2.05, 0.3], "size": [0.07, 0.07, 0.3], "turn": [-90, 0, 0], "material": "metal/bare/metal-050a", "surface": { "gloss": 0.95, "metal": 1 } },
  { "name": "wheel", "kind": "bevel", "base": "cylinder", "edge": "round", "radius": 0.08, "at": [-0.86, 1.28, 0.34], "size": [0.68, 0.68, 0.24], "turn": [0, 90, 0], "material": "synthetic/rubber/rubber-001", "surface": { "faces": { "0": { "texture": "metal/bare/metal-061b", "gloss": 0.8, "metal": 1 }, "2": { "texture": "metal/bare/metal-061b", "gloss": 0.8, "metal": 1 } } } },
  { "name": "wheel", "kind": "bevel", "base": "cylinder", "edge": "round", "radius": 0.08, "at": [0.86, 1.28, 0.34], "size": [0.68, 0.68, 0.24], "turn": [0, 90, 0], "material": "synthetic/rubber/rubber-001", "surface": { "faces": { "0": { "texture": "metal/bare/metal-061b", "gloss": 0.8, "metal": 1 }, "2": { "texture": "metal/bare/metal-061b", "gloss": 0.8, "metal": 1 } } } },
  { "name": "wheel", "kind": "bevel", "base": "cylinder", "edge": "round", "radius": 0.08, "at": [-0.86, -1.3, 0.34], "size": [0.68, 0.68, 0.24], "turn": [0, 90, 0], "material": "synthetic/rubber/rubber-001", "surface": { "faces": { "0": { "texture": "metal/bare/metal-061b", "gloss": 0.8, "metal": 1 }, "2": { "texture": "metal/bare/metal-061b", "gloss": 0.8, "metal": 1 } } } },
  { "name": "wheel", "kind": "bevel", "base": "cylinder", "edge": "round", "radius": 0.08, "at": [0.86, -1.3, 0.34], "size": [0.68, 0.68, 0.24], "turn": [0, 90, 0], "material": "synthetic/rubber/rubber-001", "surface": { "faces": { "0": { "texture": "metal/bare/metal-061b", "gloss": 0.8, "metal": 1 }, "2": { "texture": "metal/bare/metal-061b", "gloss": 0.8, "metal": 1 } } } }
] }
```

Its power: 400–800 for a car people can drive round a village, more for a truck (and its `mass`
with it).

### A motorbike

Two wheels on its length — front and back, at x = 0 — lying across it as a car's do; it leans into
its turns as it is ridden and stands up by itself. Its fork is two legs raked back from the front
axle to the head, its handlebar a rounded box across it.

```json
{ "name": "motorbike", "at": [0, 0], "vehicle": { "type": "bike", "power": 150, "speed": 28, "steer": 30, "mass": 230 }, "prims": [
  { "name": "front wheel", "kind": "bevel", "base": "cylinder", "edge": "round", "radius": 0.05, "at": [0, 0.72, 0.31], "size": [0.62, 0.62, 0.12], "turn": [0, 90, 0], "material": "synthetic/rubber/rubber-001", "surface": { "faces": { "0": { "texture": "metal/bare/metal-061b", "gloss": 0.8, "metal": 1 }, "2": { "texture": "metal/bare/metal-061b", "gloss": 0.8, "metal": 1 } } } },
  { "name": "back wheel", "kind": "bevel", "base": "cylinder", "edge": "round", "radius": 0.06, "at": [0, -0.7, 0.31], "size": [0.62, 0.62, 0.15], "turn": [0, 90, 0], "material": "synthetic/rubber/rubber-001", "surface": { "faces": { "0": { "texture": "metal/bare/metal-061b", "gloss": 0.8, "metal": 1 }, "2": { "texture": "metal/bare/metal-061b", "gloss": 0.8, "metal": 1 } } } },
  { "name": "fork", "shape": "cylinder", "at": [-0.085, 0.62, 0.645], "size": [0.045, 0.045, 0.7], "turn": [16.6, 0, 0], "material": "metal/bare/metal-050a", "surface": { "gloss": 0.95, "metal": 1 } },
  { "name": "fork", "shape": "cylinder", "at": [0.085, 0.62, 0.645], "size": [0.045, 0.045, 0.7], "turn": [16.6, 0, 0], "material": "metal/bare/metal-050a", "surface": { "gloss": 0.95, "metal": 1 } },
  { "name": "head", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.03, "segments": 2, "at": [0, 0.52, 0.99], "size": [0.26, 0.1, 0.07], "material": "metal/bare/metal-050a", "surface": { "gloss": 0.95, "metal": 1 } },
  { "name": "handlebar", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.018, "segments": 2, "at": [0, 0.47, 1.06], "size": [0.72, 0.04, 0.04], "material": "metal/bare/metal-050a", "surface": { "gloss": 0.95, "metal": 1 } },
  { "name": "grip", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.02, "segments": 2, "at": [-0.33, 0.47, 1.06], "size": [0.12, 0.05, 0.05], "material": "synthetic/rubber/rubber-001" },
  { "name": "grip", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.02, "segments": 2, "at": [0.33, 0.47, 1.06], "size": [0.12, 0.05, 0.05], "material": "synthetic/rubber/rubber-001" },
  { "name": "headlamp", "shape": "cylinder", "at": [0, 0.62, 0.93], "size": [0.17, 0.17, 0.12], "turn": [90, 0, 0], "material": "metal/bare/metal-050a", "surface": { "gloss": 0.95, "metal": 1, "faces": { "2": { "texture": "synthetic/plastic/plastic-013a", "emissive": 1, "metal": 0, "gloss": 0.6 } } }, "light": { "on": "night", "range": 9, "color": [1, 0.93, 0.8], "intensity": 0.85, "cone": { "angle": 30, "softness": 0.5 } } },
  { "name": "frame", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.04, "segments": 2, "at": [0, 0, 0.72], "size": [0.09, 1, 0.09], "color": [0.02, 0.02, 0.02], "surface": { "gloss": 0.9, "metal": 0.5, "reflect": 0.3 }, "turn": [-8, 0, 0] },
  { "name": "engine", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.06, "at": [0, 0.02, 0.45], "size": [0.3, 0.42, 0.34], "material": "metal/bare/metal-061b", "surface": { "gloss": 0.6, "metal": 1 } },
  { "name": "exhaust", "shape": "cylinder", "at": [0.19, -0.32, 0.36], "size": [0.08, 0.08, 0.95], "turn": [-94, 0, 0], "material": "metal/bare/metal-050a", "surface": { "gloss": 0.95, "metal": 1 } },
  { "name": "tank", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.1, "at": [0, 0.25, 0.9], "size": [0.34, 0.56, 0.24], "color": [0.03, 0.12, 0.4], "surface": { "gloss": 0.9, "metal": 0.5, "reflect": 0.3 } },
  { "name": "seat", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.04, "segments": 2, "at": [0, -0.28, 0.86], "size": [0.3, 0.6, 0.1], "material": "fabric/leather/brown-leather", "seat": true },
  { "name": "tail", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.06, "at": [0, -0.62, 0.78], "size": [0.24, 0.45, 0.16], "color": [0.03, 0.12, 0.4], "surface": { "gloss": 0.9, "metal": 0.5, "reflect": 0.3 } },
  { "name": "back mudguard", "shape": { "preset": "cylinder", "hollow": 0.85, "profileBegin": 0.3, "profileEnd": 0.7 }, "at": [0, -0.7, 0.31], "size": [0.82, 0.82, 0.19], "turn": [0, 90, 0], "phantom": true, "color": [0.03, 0.12, 0.4], "surface": { "gloss": 0.9, "metal": 0.5, "reflect": 0.3 } },
  { "name": "front mudguard", "shape": { "preset": "cylinder", "hollow": 0.85, "profileBegin": 0.3, "profileEnd": 0.7 }, "at": [0, 0.72, 0.31], "size": [0.8, 0.8, 0.16], "turn": [0, 90, 0], "phantom": true, "color": [0.03, 0.12, 0.4], "surface": { "gloss": 0.9, "metal": 0.5, "reflect": 0.3 } },
  { "name": "rear lamp", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.015, "segments": 2, "at": [0, -0.88, 0.8], "size": [0.1, 0.04, 0.06], "color": [0.6, 0.02, 0.02], "surface": { "gloss": 0.8 } }
] }
```

### A boat

No wheels: its parts are its hull, held at the sea's surface — it floats only **at sea**, and only
where the sea is deeper than its hull goes down: this one, its bottom 0.3 m under its frame, draws
0.35 m and needs **0.5 m of water** under it and along its way — the survey's `depths`. On
less it sits on the bottom and its engine cannot move it. Stand it on the water with `[x, y]`: the
import puts it on the sea's surface there. Its engine pushes it along its +y, its rudder turns it.
Its bow here is two wedges meeting on its middle, a V seen from above.

```json
{ "name": "motorboat", "at": [0, 0], "vehicle": { "type": "boat", "power": 3000, "speed": 8, "steer": 30, "mass": 800 }, "prims": [
  { "name": "hull", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.16, "at": [0, 0, 0.1], "size": [1.9, 4.2, 0.8], "color": [0.9, 0.9, 0.88], "surface": { "gloss": 0.85, "reflect": 0.2 } },
  { "name": "bow", "shape": "prism", "at": [0.475, 2.9, 0.1], "size": [0.95, 0.8, 1.6], "turn": [-90, 0, 0], "color": [0.9, 0.9, 0.88], "surface": { "gloss": 0.85, "reflect": 0.2 } },
  { "name": "bow", "shape": "prism", "at": [-0.475, 2.9, 0.1], "size": [0.95, 0.8, 1.6], "turn": [-90, 180, 0], "color": [0.9, 0.9, 0.88], "surface": { "gloss": 0.85, "reflect": 0.2 } },
  { "name": "stripe", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.05, "segments": 2, "at": [0, 0, 0.3], "size": [1.94, 4.24, 0.1], "color": [0.03, 0.12, 0.4], "surface": { "gloss": 0.85, "reflect": 0.2 } },
  { "name": "deck", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.02, "segments": 2, "at": [0, 0.05, 0.52], "size": [1.7, 4.3, 0.06], "material": "wood/planks/brown-planks-03", "surface": { "rotation": 90 } },
  { "name": "console", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.06, "at": [0, 0.6, 0.85], "size": [0.7, 0.5, 0.6], "color": [0.9, 0.9, 0.88], "surface": { "gloss": 0.85, "reflect": 0.2 } },
  { "name": "windscreen", "shape": "cube", "at": [0, 0.88, 1.3], "size": [0.9, 0.04, 0.35], "material": "glass/clear/float", "turn": [-20, 0, 0] },
  { "name": "windscreen rail", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.018, "segments": 2, "at": [0, 0.94, 1.47], "size": [0.94, 0.04, 0.04], "material": "metal/bare/metal-050a", "surface": { "gloss": 0.95, "metal": 1 }, "turn": [-20, 0, 0] },
  { "name": "steering wheel", "shape": "torus", "at": [0, 0.33, 1.12], "size": [0.3, 0.3, 0.04], "turn": [60, 0, 0], "material": "metal/bare/metal-050a", "surface": { "gloss": 0.95, "metal": 1 } },
  { "name": "helm seat", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.05, "segments": 2, "at": [0, 0, 0.76], "size": [0.6, 0.5, 0.14], "material": "fabric/leather/leather-white", "seat": true },
  { "name": "stern bench", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.05, "segments": 2, "at": [0, -1.5, 0.73], "size": [1.5, 0.5, 0.14], "material": "fabric/leather/leather-white", "seat": true },
  { "name": "outboard", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.08, "at": [0, -2.27, 0.5], "size": [0.34, 0.3, 0.72], "color": [0.02, 0.02, 0.02], "surface": { "gloss": 0.9, "metal": 0.5, "reflect": 0.3 } },
  { "name": "cowl", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.1, "at": [0, -2.3, 0.95], "size": [0.4, 0.46, 0.3], "color": [0.9, 0.9, 0.88], "surface": { "gloss": 0.85, "reflect": 0.2 } }
] }
```

Its power: the water holds it back — this one makes 2.7 m/s at 600, 6 m/s at 3,000 and 8 m/s at
5,000, the most; its `speed` only caps it.

**A pier out to the water.** A shore may stay a hand deep for a hundred metres and more — a flat, a
marsh. Moor the boat at the head of a pier that reaches the depth: one section of 20 m (its deck,
kerbs, beams and piles) and its linked clones along a line, each at `[x, y, 0]` — level, whatever
the ground under it — and turned along it; a ramp up from the shore (the avatar steps 0.3 m); one
lamp, at its head. The boat beside the head, its bow out to sea.

```jsonc
"objects": [ { "name": "pier", "at": [17.66, 30.43, 0], "turn": [0, 0, -50], "prims": [ … its section, 20 m along its y … ] } ],
"clones": [ { "of": "pier", "at": [32.98, 43.28, 0], "turn": [0, 0, -50] }, { "of": "pier", "at": [48.3, 56.14, 0], "turn": [0, 0, -50] } ]
```

### A boat that takes people round

Not every boat is driven. A tour boat that takes people round and brings them back to its port is an
object with a **`route`** (effects.md) and seats, and no `vehicle`: `"water": "yes"` keeps it on the
sea, `"at": "ends"` stops it only at its port — where it is kept — `"stop"` seconds for people to
get on and off, and whoever sits on its benches goes round with it. Keep its points where the water
is deep enough for its hull, as a driven boat's way.

```json
{ "name": "tour boat", "at": [0, 0], "behaviour": { "type": "route", "points": [[0, 30, 0], [40, 60, 0], [0, 90, 0], [-40, 60, 0]], "speed": 3, "stop": 30, "at": "ends", "mode": "round", "face": "yes", "water": "yes" }, "prims": [
  { "name": "hull", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.2, "at": [0, 0, 0.1], "size": [2.6, 7, 1], "color": [0.9, 0.9, 0.88], "surface": { "gloss": 0.85, "reflect": 0.2 } },
  { "name": "bow", "shape": "prism", "at": [0.65, 4.25, 0.1], "size": [1.3, 1, 1.5], "turn": [-90, 0, 0], "color": [0.9, 0.9, 0.88], "surface": { "gloss": 0.85, "reflect": 0.2 } },
  { "name": "bow", "shape": "prism", "at": [-0.65, 4.25, 0.1], "size": [1.3, 1, 1.5], "turn": [-90, 180, 0], "color": [0.9, 0.9, 0.88], "surface": { "gloss": 0.85, "reflect": 0.2 } },
  { "name": "stripe", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.05, "segments": 2, "at": [0, 0, 0.35], "size": [2.64, 7.04, 0.12], "color": [0.03, 0.12, 0.4], "surface": { "gloss": 0.85, "reflect": 0.2 } },
  { "name": "deck", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.02, "segments": 2, "at": [0, 0, 0.63], "size": [2.4, 6.8, 0.06], "material": "wood/planks/brown-planks-03", "surface": { "rotation": 90 } },
  { "name": "bench", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.04, "segments": 2, "at": [-0.55, 2, 0.785], "size": [0.9, 0.45, 0.25], "material": "wood/planks/planks-brown-10", "seat": true },
  { "name": "bench", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.04, "segments": 2, "at": [0.55, 2, 0.785], "size": [0.9, 0.45, 0.25], "material": "wood/planks/planks-brown-10", "seat": true },
  { "name": "bench", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.04, "segments": 2, "at": [-0.55, 0, 0.785], "size": [0.9, 0.45, 0.25], "material": "wood/planks/planks-brown-10", "seat": true },
  { "name": "bench", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.04, "segments": 2, "at": [0.55, 0, 0.785], "size": [0.9, 0.45, 0.25], "material": "wood/planks/planks-brown-10", "seat": true },
  { "name": "bench", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.04, "segments": 2, "at": [-0.55, -2, 0.785], "size": [0.9, 0.45, 0.25], "material": "wood/planks/planks-brown-10", "seat": true },
  { "name": "bench", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.04, "segments": 2, "at": [0.55, -2, 0.785], "size": [0.9, 0.45, 0.25], "material": "wood/planks/planks-brown-10", "seat": true },
  { "name": "post", "shape": "cylinder", "at": [-1.15, 2.8, 1.46], "size": [0.06, 0.06, 1.6], "material": "metal/bare/metal-050a", "surface": { "gloss": 0.95, "metal": 1 } },
  { "name": "post", "shape": "cylinder", "at": [1.15, 2.8, 1.46], "size": [0.06, 0.06, 1.6], "material": "metal/bare/metal-050a", "surface": { "gloss": 0.95, "metal": 1 } },
  { "name": "post", "shape": "cylinder", "at": [-1.15, -2.8, 1.46], "size": [0.06, 0.06, 1.6], "material": "metal/bare/metal-050a", "surface": { "gloss": 0.95, "metal": 1 } },
  { "name": "post", "shape": "cylinder", "at": [1.15, -2.8, 1.46], "size": [0.06, 0.06, 1.6], "material": "metal/bare/metal-050a", "surface": { "gloss": 0.95, "metal": 1 } },
  { "name": "canopy", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.03, "segments": 2, "at": [0, 0, 2.29], "size": [2.5, 6, 0.06], "color": [0.75, 0.12, 0.1] }
] }
```

### A train

A train keeps to its line: an object with a **`route`** behaviour (effects.md) and
`"vehicle": { "type": "train" }`. Left alone it runs its timetable, stopping at its station:
`"stop": 25, "at": "ends"` holds it 25 s a round where it is kept and nowhere else — time to get
on; build its platform beside where it is kept. Its driver takes it from where the timetable has
it, W faster, S slower and then back, no further than its ends; left again, its timetable goes on
from there. One object makes the whole train — an engine and a carriage or two —
so give its line curves of 10 m or more and keep it short (8–12 m). Lay the line's bed as a `road`
through the same points (format.md), in the build's frame.

```json
{ "name": "train", "at": [0, 0], "turn": [0, 0, -90],
  "vehicle": { "type": "train", "speed": 8, "accel": 0.8 },
  "behaviour": { "type": "route", "points": [[0, 15, 0], [10, 25, 0], [20, 15, 0], [20, -15, 0], [10, -25, 0], [0, -15, 0]], "speed": 4, "stop": 25, "at": "ends", "mode": "round", "face": "yes" },
  "prims": [
  { "name": "chassis", "shape": "cube", "at": [0, 0, 0.55], "size": [1.5, 8.6, 0.25], "material": "metal/painted/metal-029" },
  { "name": "boiler", "shape": "cylinder", "at": [0, 2.6, 1.25], "size": [1.15, 1.15, 2.6], "turn": [90, 0, 0], "color": [0.05, 0.25, 0.12], "surface": { "gloss": 0.7 } },
  { "name": "chimney", "shape": "cylinder", "at": [0, 3.5, 2.05], "size": [0.32, 0.32, 0.6], "material": "metal/painted/metal-029", "particles": [{ "preset": "smoke", "scale": 1.2, "amount": 1.5 }] },
  { "name": "cab roof", "shape": "cube", "at": [0, 0.55, 2.43], "size": [1.7, 1.9, 0.08], "material": "metal/painted/metal-029" },
  { "name": "driver's seat", "shape": "cube", "at": [0.35, 0.25, 0.95], "size": [0.5, 0.5, 0.1], "material": "fabric/leather/brown-leather", "seat": true },
  { "name": "bench", "shape": "cube", "at": [0, -2.4, 1.0], "size": [1.4, 0.45, 0.1], "material": "wood/planks/planks-brown-10", "seat": true }
] }
```

Its route's points are in its own frame — turned with it: here its +y runs along the build's +x.

### Within budget

A car of 25–35 parts (this roadster: 7,100 triangles up close, 2,800 at the next level), a bike of
15–20 (3,700), a boat of 10–15 (3,000), a train of 20–35 — each its object's share of the build's
parts and triangles (budget.md). Rounds cost triangles: two `segments` for a small one. Headlamps
are lights of the build's, lit at night only; two for a car. A pier of eleven sections drawn as
clones: 200 parts, 30,000 triangles. The check says why a vehicle could not be driven: no wheels for
a car or a bike, no route for a train, no seat.


## 7. Delivery: from your JSON to the world

### What you give

- **One JSON object** — nothing else in it, no comments — that follows the build file (format.md).
  In a chat, in one code block; better, as a file or at an address (below).
- **With a survey**, its `anchor` as it is (`"exact": true`): the build stands exactly where the
  survey says, its front towards where the person looked. **Without one**, no anchor: the person
  puts it where they point.
- **What you simplified, and why** (plan.md), and what each part of it is: the person reads it
  before they place it.

### How the person brings it in

In the world, in build mode (Ctrl+B), the **Builds as JSON** panel (the `{ }` icon in the bar):

1. **Paste** the JSON, or **drop** its `.json` file, or paste its **address** — a gist, a file on
  GitHub (its page or its raw file), any https address that serves it. Or open the world with
  `?import=<address>`: `https://…/?walk=…&import=https://gist.github.com/landi/1f2e…` — the editor
  opens on it.
2. It is **checked** as every peer will keep it: what it cannot be (an unknown material, kind,
  species or parameter, an object past 256 parts, past the budget's *most*) is said, and it cannot
  be placed; what is past *fair*, or held to a range, is noted. Fix what is said, give it again.
3. **Place it**: a ghost where its anchor says — a click places it; R lets it go to follow the
  pointer instead; Esc cancels — or, without an anchor, a ghost under the pointer, its front to the
  camera, R turning it, a click placing it.
4. Placed, it is **theirs**: signed with their identity, shared with everyone in the room, and one
  Ctrl+Z takes it all away.

### Changing it

1. The person selects what to change and clicks **Export selected**: the build as JSON, its anchor
   exact, every object, clone and tree with its `id`.
2. They give it to you with what to change. You give back **the whole build**, keeping the anchor
   and every `id`; new things without an id; an object left out stays as it is.
3. Pasted back, it says **Change N where they stand**: each object it names gets its parts as you
   wrote them, in one step of undo.

### Sharing it

A build at an address can be brought in by anyone: with an exact anchor it lands where it was
written for — share one without an anchor (or say so) when it is meant for anyone's place. A build
can be placed by anyone who brings it in; what it becomes is theirs.


## 8. Verification: look at it, fix it, measure it

A build is done when it has been seen — from outside and inside, by day and by night — and
measured. Pictures find what no check does: a roof floating, a door turned inward, a palette that
clashes, a village hidden behind its own trees.

### What to look for

- Does it stand on the ground everywhere? Look at the footings, steps, paths, fence posts, lamp feet.
- Does each thing face the way it should — doors outward, houses to the square, stairs up?
- Are the roofs closed and on their walls? Openings filled? Nothing pokes through anything?
- Do materials read at their size (bricks the size of bricks, tiles of tiles) and go together?
- Is there one thing to look at? Is the square open, the way through clear?
- Inside: is there room for the camera; is the room lit; can the avatar walk in (doors open)?
- At night: are the ways lit where people walk, warm, not flooded? Do lit rooms show through the
  windows? Does the smoke rise from the chimneys that burn?

If you cannot see the world yourself, ask the person to look — the ghost shows the build before it
is placed — from where people arrive, inside, and at night (`[` and `]` move the sun, `P` holds or
runs the day), and to tell you or show you what is wrong; then give the build again. Their frame
rate is the last word: if it drops where the build is, simplify (budget.md).

## The catalog in brief

The whole of it, with every material, preset and range: catalog.json, beside this guide.

### Kinds

- **`rock`** — A rock: a sculpted sphere, lumped and chipped by its seed and cut flat underneath to sit on the ground. Its length (x) is its width (y) drawn out by its elongation; a few hundred triangles at most, the detail left to its texture's relief. Faces: 0 surface. Size: its width (y) and height (z) its own; its length (x) its width drawn out by its elongation.
  - `roughness` 0–1, default 0.5: How broken its surface is: 0 a smooth, lumpy pebble; 1 jagged, chipped all over.
  - `edges` 0–1, default 0: How its facets meet: 0 faceted, low-poly, each facet flat with hard edges; 1 rounded, shaded smoothly across them.
  - `base` 0–1, default 0.3: How much of its underside is cut flat, to sit on the ground: 0 none, 1 up to half its height.
  - `elongation` 0–1, default 0.25: How long it is for its width: its length (x) is 1 + 2 × this times its width (y).
- **`bevel`** — A box or a cylinder with its edges rounded or chamfered by a radius in metres, whatever its size: real geometry, its faces numbered as the prim's, each running on over its half of the edges round it with its texture. Faces: box: 0 top, 1 -y, 2 +x, 3 +y, 4 -x, 5 bottom; cylinder: 0 top, 1 side, 2 bottom. Size: its own, in metres.
  - `base` `box` / `cylinder`, default `box`: What is bevelled: a box, its twelve edges; a cylinder, the rims of its top and bottom.
  - `edge` `round` / `chamfer`, default `round`: How its edges are cut: round, a quarter circle; chamfer, one flat cut at 45°.
  - `radius` 0–1, default 0.05: How far its edges are cut back from each face, in metres: a round's radius, a chamfer's setback. At most half its thinnest side.
  - `segments` 2–12, default 4: Steps round each rounded edge at the finest level; fewer far away. A chamfer has one.
- **`stairs`** — A straight flight of stairs rising towards +y: its steps, height and tread make its box (width × steps' run × height). Built as a solid block or as treads between two stringers, with a landing half way up and a railing on either side if asked; the railing stands above its box. Faces: 0 treads, 1 risers, 2 sides, 3 underside, 4 railing. Size: made by its parameters: width × the steps' run × height.
  - `steps` 1–40, default 4: How many steps, each a riser and a tread: the last one's top is the stairs' height.
  - `height` 0.1–12, default 0.72: From the ground to the top of the last step (m); each riser is this over the steps.
  - `tread` 0.1–1.5, default 0.28: How deep each step is, front to back (m).
  - `width` 0.3–8, default 1: How wide the stairs are, side to side (m).
  - `structure` `solid` / `stringers`, default `solid`: Solid: a block down to the ground. Stringers: treads housed between two sloping beams, open between the steps.
  - `landing` 0–4, default 0: A flat landing half way up, this deep (m); 0, or no deeper than a tread, for none.
  - `railing` `none` / `left` / `right` / `both`, default `none`: A handrail on posts along the left side, the right, both or neither, going up.
- **`door`** — A door in its frame: two jambs and a head round its opening, its leaf plain, panelled or glazed, hung on one side and swinging out towards the front (−y) as far as it is open, a handle each side away from its hinges. Its box is the frame's: width, a wall's thickness, height. Faces: 0 frame, 1 leaf, 2 glass, 3 handles. Size: its own, in metres.
  - `frame` 0.02–0.3, default 0.08: How wide its jambs and head are (m).
  - `leaf` 0.02–0.12, default 0.045: How thick the door itself is (m); no thicker than its frame is deep.
  - `style` `plain` / `panelled` / `glazed`, default `panelled`: Plain: one flat slab. Panelled: four raised panels each side. Glazed: glass in its upper half.
  - `hinge` `left` / `right`, default `left`: The side it hangs on, seen from in front (−y); its handles on the other.
  - `open` 0–110, default 0: How far it stands open (°), swinging out towards the front: its leaf turns on its hinges, its mesh the same. A behaviour opens and shuts it so.
- **`window`** — A window: its frame round its opening, glass in it divided into columns and rows of panes by bars, and a sill standing out to the front (−y) if asked. Its box is the frame's: width, a wall's thickness (or less), height; the sill stands out of it. Faces: 0 frame, 1 bars, 2 glass, 3 sill. Size: its own, in metres.
  - `frame` 0.02–0.3, default 0.06: How wide its frame is round the glass (m).
  - `columns` 1–8, default 2: Panes across, divided by upright bars.
  - `rows` 1–8, default 2: Panes up, divided by level bars.
  - `bar` 0.01–0.1, default 0.03: How wide the bars between its panes are (m).
  - `sill` 0–0.3, default 0.05: How far a sill under it stands out to the front (m); 0 for none.
- **`roof`** — A roof over a rectangle: gabled (its ridge along x), hipped (sloping on all four sides) or a single slope (low at the front, −y). Its box is all of it, eaves to ridge — its pitch is its height for its depth — solid, the space under it closed, or only its slabs. Faces: 0 roof, 1 ends, 2 underside, 3 eaves. Size: its own, in metres.
  - `type` `gable` / `hip` / `shed`, default `gable`: Gable: two slopes, its ridge along x. Hip: four slopes. Shed: one slope, rising to the back.
  - `structure` `solid` / `slabs`, default `solid`: Solid: the space under it closed, its ends walls. Slabs: only the roof itself, open underneath.
  - `thickness` 0.02–0.6, default 0.15: How thick its slabs are, and so its edge at the eaves (m).
- **`column`** — A column: on a base (a square plinth and a moulding) its shaft, round or square, narrowing towards its top, fluted if asked, under its capital (a moulding widening to a square slab). Its box is all of it, its width the plinth's. Faces: 0 shaft, 1 base, 2 capital. Size: its own, in metres.
  - `shaft` `round` / `square`, default `round`: Its shaft round or square.
  - `base` 0–1, default 0.2: How high its base is (m); 0 for none.
  - `capital` 0–1, default 0.25: How high its capital is (m); 0 for none.
  - `taper` 0–0.3, default 0.1: How much narrower its shaft is at its top than at its foot, a share of it.
  - `flutes` 0–32, default 0: Grooves down its round shaft; 0 for a smooth one.
- **`arch`** — An arch: a wall with an arched opening through it, two piers and the wall over its crown, the arch round, pointed or segmental. Its box is all of it, its width the piers' and the opening's, its depth the wall's. Faces: 0 faces, 1 opening, 2 outside, 3 feet. Size: its own, in metres.
  - `shape` `round` / `pointed` / `segmental`, default `round`: Round: a half circle. Pointed: two arcs meeting at a point, as tall as an equilateral triangle. Segmental: a shallow arc, a quarter of its span high.
  - `pier` 0.05–3, default 0.4: How wide each pier is either side of the opening (m).
  - `crown` 0.05–3, default 0.3: How much wall stands over the top of the arch (m).
- **`fence`** — A fence or railing along a path of points, its foot at each point's height so that it follows the land: a post on each point and others along each length as far apart as asked, between them pickets on rails, rails alone, or balusters between a bottom rail and a top one. Two points make a straight length; a last point on the first closes it round. Its box is what it makes. Faces: 0 posts, 1 rails, 2 pickets. Size: what its points, thickness and height make (m).
  - `style` `pickets` / `rails` / `balusters`, default `pickets`: Pickets: upright boards on two rails behind. Rails: level rails alone. Balusters: spindles between a bottom rail and a top one.
  - `height` 0.1–4, default 1: How high it stands over its foot (m).
  - `spacing` 0.3–6, default 2: How far apart its posts are at most along each length (m): they share it evenly.
  - `post` 0.03–0.4, default 0.1: How wide its posts are along it (m), no wider than it is thick.
  - `rails` 1–6, default 3: How many rails between its posts.
  - `gap` 0.01–0.3, default 0.05: The gap between two pickets or balusters (m).
  - `thickness` 0.03–0.4, default 0.1: How thick it is across its path (m): its posts, its rails within it.
  - `points` -31.5–31.5, default -1.95,0,-0.5,1.95,0,-0.5: The points its path runs through, a post on each: [x, y, z] in metres in its own frame, z its foot there; two at least; a last one on the first closes it round.
- **`road`** — A road or path along points, on the ground: a ribbon as wide as asked, its edges mitred at each point, its surface on the heights of the ground sampled under it about every metre along it and every metre and a half across, a slab under it as deep as asked. Two points make a straight length; a last point on the first closes it round. Its box is what it makes. Faces: 0 surface, 1 sides, 2 underside. Size: what its points, width and depth make (m).
  - `width` 0.5–12, default 3: How wide it is (m).
  - `depth` 0.05–1, default 0.3: How far its slab goes down under its surface (m), so that where the ground is not quite where its samples say, no gap shows.
  - `points` -31.5–31.5, default -4,0,0.1,4,0,0.1: The points it runs through: [x, y, z] in metres in its own frame, z the ground there; two at least; a last one on the first closes it round.
  - `ground` -31.5–31.5, default : The ground's height under it (m, in its own frame), as the editor that laid it measured it: at each place sampled along it, from its left edge to its right; none: straight between its points' heights.
- **`sculpt`** — A sculpted prim, as Second Life and OpenSim have them: its surface a map of points (its sculpt map), stitched as a sphere, a torus, a plane or a cylinder. Never written by hand: a part written with "sculpt" — a lathe, a box, a loft, a sweep or a model — is made one by the sculpt tool, and an OpenSim import brings its own; its stitching, mirror and invert set on its card. Faces: 0 surface. Size: its own, in metres.
  - `stitch` `sphere` / `torus` / `plane` / `cylinder`, default `sphere`: How its map closes on itself: a sphere (poles pinched, round its columns), a torus (both ways round), a plane (open), a cylinder (round its columns).
  - `mirror` `no` / `yes`, default `no`: Whether its map is mirrored across its x.
  - `invert` `no` / `yes`, default `no`: Whether its faces look inward: its winding turned.
  - `columns` 1–128, default 1: The sides across its map, as its finest level samples it.
  - `rows` 1–128, default 1: The sides down its map, as its finest level samples it.
  - `map` 0–6400, default : Its sculpt map as its finest level samples it: (columns + 1) × (rows + 1) points, R, G, B each, row by row from the map's top, as base64 (its range is its length in characters).

### Behaviours

- **`spin`** — Turns round its own up (z) without stopping: a carousel, a fan, a sign. `speed` -360–360 °/s (default 30).
- **`move`** — Goes from where it is to a point and back, waiting at either end: an elevator, a moving platform. `x` -64–64 m (default 0), `y` -64–64 m (default 0), `z` -64–64 m (default 3), `speed` 0.1–20 m/s (default 1), `wait` 0–60 s (default 2).
- **`door`** — Swings open on a click or as someone comes near, and shuts by itself, on its hinges along one of its sides; a door of the door kind opens its own leaf. Prims only. `angle` -170–170 ° (default 90), `hinge` `left` / `right` (default left), `trigger` `click` / `near` / `both` (default click), `reach` 0.5–10 m (default 2.5), `time` 0.2–5 s (default 1), `stay` 0–60 s (default 5).
- **`slide`** — Slides aside on a click or as someone comes near, and back by itself: a sliding door, a window, a hatch. `x` -64–64 m (default 1), `y` -64–64 m (default 0), `z` -64–64 m (default 0), `trigger` `click` / `near` / `both` (default click), `reach` 0.5–10 m (default 2.5), `time` 0.2–5 s (default 1), `stay` 0–60 s (default 5).
- **`belt`** — Carries whoever stands on it along its own y: an escalator (stairs rise along their y), a moving walkway. `speed` -5–5 m/s (default 0.5).
- **`route`** — Goes from where it is through its points, round and on again or to the last and back, stopping a while if asked — at each point, or only at its ends: a boat on a tour that comes back to port, a train on its line with its station. `speed` 0.1–50 m/s (default 3), `stop` 0–120 s (default 0), `at` `each` / `ends` (default each), `mode` `round` / `back` (default round), `face` `no` / `yes` (default yes), `water` `no` / `yes` (default no).

### Vehicles

- **`car`** — Driven on its wheels — its cylinders lying across it — the front ones steering: W and S throttle and brake, A and D steer, Space the hand brake. `power` 50–3000 N·m (default 500), `speed` 2–60 m/s (default 25), `steer` 5–45 ° (default 30), `mass` 50–5000 kg (default 1000).
- **`bike`** — Driven on its two wheels — its front and back cylinders lying across it — leaning into its turns: W and S throttle and brake, A and D steer. `power` 10–600 N·m (default 150), `speed` 2–70 m/s (default 30), `steer` 5–45 ° (default 30), `mass` 50–5000 kg (default 250).
- **`train`** — Along its route (Does: follows a route), its driver setting its speed: W faster, S slower and then back; left, it goes on with its timetable from there. `speed` 1–60 m/s (default 20), `accel` 0.1–3 m/s² (default 0.8).
- **`boat`** — Afloat on the sea, its hull its parts: W and S ahead and astern, A and D its rudder. `power` 50–5000 (default 600), `speed` 1–30 m/s (default 8), `steer` 5–45 ° (default 30), `mass` 50–5000 kg (default 800).

### Particles

Presets: `fire`, `smoke`, `sparks`, `steam`, `fog`, `fountain`, `snow`. Kits: `campfire` (fire, sparks, smoke), `torch` (fire, smoke), `chimney` (smoke). Modifiers: `amount` 0.1–4, `scale` 0.1–10, `tint` [r, g, b].

### Tree species

`bush` Bush (plant, 2–2.7 m tall, crown 1.6–2 m); `oleander` Oleander (plant, 3.2–4 m tall, crown 2.1–2.7 m); `fern` Fern (plant, 0.7–0.8 m tall, crown 1.1–1.2 m); `agave` Agave (plant, 1.1–1.2 m tall, crown 1.1–1.3 m); `saguaro` Saguaro (plant, 5.6–6.6 m tall, crown 0.8–1 m); `bamboo` Bamboo (plant, 7.5–8.9 m tall, crown 3.7–4.2 m); `banana` Banana (plant, 3.4–4.6 m tall, crown 2.1–2.3 m); `pampas` Pampas grass (plant, 3.2–3.7 m tall, crown 1.4–2 m); `sunflower` Sunflower (plant, 1.6–2 m tall, crown 1.2–1.5 m); `joshua` Joshua tree (plant, 5.7–8.2 m tall, crown 2–3.4 m); `coconut` Coconut palm (palm, 12.8–16.3 m tall, crown 6.9–7.8 m); `date` Date palm (palm, 11.8–14.5 m tall, crown 4.1–4.4 m); `fanPalm` Fan palm (palm, 14.2–18.1 m tall, crown 2.9–3.3 m); `royal` Royal palm (palm, 15.6–16.4 m tall, crown 4.2–4.6 m); `bottle` Bottle palm (palm, 4.1–5.3 m tall, crown 2.2–2.4 m); `areca` Areca palm (palm, 4.7–6.3 m tall, crown 3.9–4.5 m); `sago` Sago palm (palm, 2.1–2.5 m tall, crown 1.4–1.6 m); `fir` Fir (conifer, 12.4–15.9 m tall, crown 5.1–7 m); `pine` Stone pine (conifer, 14.9–19.3 m tall, crown 5.8–9.6 m); `cypress` Cypress (conifer, 12.1–15.9 m tall, crown 1.3–1.5 m); `oak` Oak (broadleaf, 13.5–17.9 m tall, crown 6.3–8.4 m); `birch` Birch (broadleaf, 15.6–18.2 m tall, crown 4.9–5.6 m); `poplar` Poplar (broadleaf, 15.5–18.9 m tall, crown 2.3–2.7 m); `acacia` Acacia (broadleaf, 11–15.3 m tall, crown 7.2–9.7 m); `maple` Maple (broadleaf, 12.4–15.1 m tall, crown 3.7–5.6 m); `cherry` Cherry blossom (broadleaf, 8–9.5 m tall, crown 6.4–7.6 m); `willow` Weeping willow (broadleaf, 10–12.4 m tall, crown 5.7–6.6 m); `olive` Olive (broadleaf, 8.6–9.6 m tall, crown 4.8–6.9 m); `baobab` Baobab (broadleaf, 14–19.3 m tall, crown 3.5–5.6 m); `eucalyptus` Eucalyptus (broadleaf, 19.7–26 m tall, crown 5.4–7.8 m); `dead` Dead tree (broadleaf, 9.1–13.6 m tall, crown 3.2–5.1 m).

### Starter materials

Up to three of each subcategory of the bank (3091 in all in the catalog):

- `masonry/brick/red-brick` — Red Brick, 1.4 × 1.4 m a tile, #8f6852
- `masonry/brick/red-brick-03` — Red Brick 03, 1 × 1 m a tile, #6b564e
- `masonry/brick/brick-4` — Brick 4, 0.5 × 0.5 m a tile, #977252
- `masonry/stone-blocks/rustic-stone-wall-02` — Rustic Stone Wall 02, 1.5 × 1.5 m a tile, #88765d
- `masonry/stone-blocks/stone-wall` — Stone Wall, 2 × 2 m a tile, #a3947c
- `masonry/stone-blocks/castle-wall-slates` — Castle Wall Slates, 2.5 × 2.5 m a tile, #8d8169
- `masonry/rubble/rock-wall-02` — Rock Wall 02, 2 × 2 m a tile, #5a4f37
- `masonry/rubble/rock-wall-13` — Rock Wall 13, 2 × 2 m a tile, #4f463d
- `masonry/rubble/rock-wall-10` — Rock Wall 10, 1.8 × 1.8 m a tile, #503c27
- `plaster/concrete/concrete-layers-02` — Concrete Layers 02, 2 × 2 m a tile, #7d7b74
- `plaster/concrete/concrete-wall-003` — Concrete Wall 003, 3 × 3 m a tile, #d0bba1
- `plaster/concrete/concrete-floor-01` — Concrete Floor 01, 2 × 2 m a tile, #776c59
- `plaster/plaster/beige-wall-001` — Beige Wall 001, 3 × 3 m a tile, #9e8c78
- `plaster/plaster/grey-plaster` — Grey Plaster, 1 × 1 m a tile, #8c8775
- `plaster/plaster/plastered-wall` — Plastered Wall, 2 × 2 m a tile, #b0a99c
- `plaster/wallpaper/wallpaper-001a` — Wallpaper 001 A, 1 × 1 m a tile, #e0e0dc
- `plaster/wallpaper/wallpaper-002c` — Wallpaper 002 C, 1 × 1 m a tile, #b5b4aa
- `plaster/wallpaper/wallpaper-002b` — Wallpaper 002 B, 1 × 1 m a tile, #dadbd6
- `plaster/ceiling/office-ceiling-003` — Office Ceiling 003, 5.15 × 5.15 m a tile, #f1f2f2, cut-out, glows
- `plaster/ceiling/office-ceiling-005` — Office Ceiling 005, 13 × 13 m a tile, #f1f2f2, cut-out, glows
- `plaster/ceiling/office-ceiling-006` — Office Ceiling 006, 10 × 10 m a tile, #efefef, cut-out, glows
- `wood/planks/wood-table-worn` — Wood Table Worn, 0.55 × 0.55 m a tile, #533016
- `wood/planks/brown-planks-03` — Brown Planks 03, 1 × 1 m a tile, #6d655b
- `wood/planks/wood-planks-dirt` — Wood Planks Dirt, 2 × 2 m a tile, #755c46
- `wood/floor/laminate-floor-02` — Laminate Floor 02, 1.7 × 1.7 m a tile, #9b8164
- `wood/floor/weathered-brown-planks` — Weathered Brown Planks, 1.8 × 1.8 m a tile, #604d3a
- `wood/floor/wood-floor` — Wood Floor, 1.7 × 1.7 m a tile, #806042
- `wood/panel/plywood` — Plywood, 0.5 × 0.5 m a tile, #7e6240
- `wood/panel/oak-veneer-01` — Oak Veneer 01, 1.83 × 1.83 m a tile, #a17f58
- `wood/panel/rosewood-veneer-1` — Rosewood Veneer1, 2.43 × 2.43 m a tile, #6e3310
- `wood/siding/wood-siding-006` — Wood Siding 006, 2 × 2 m a tile, #4c3b31
- `wood/siding/wood-siding-001` — Wood Siding 001, 2 × 2 m a tile, #38291f
- `wood/siding/wood-siding-011` — Wood Siding 011, 1.4 × 1.4 m a tile, #655a4e
- `wood/painted/painted-wood-008c` — Painted Wood 008 C, 1.5 × 1.5 m a tile, #5e4a2f
- `wood/painted/painted-wood-003` — Painted Wood 003, 1.5 × 1.5 m a tile, #bb160a
- `wood/painted/painted-wood-009b` — Painted Wood 009 B, 1.5 × 1.5 m a tile, #6f8d70
- `wood/logs/bark-brown-02` — Bark Brown 02, 1 × 1 m a tile, #615844
- `wood/logs/bark-brown-01` — Bark Brown 01, 1 × 1 m a tile, #75603a
- `wood/logs/bark-willow` — Bark Willow, 1 × 1 m a tile, #42372b
- `wood/stylized/wood-floor-010-3dtextures` — Wood Floor 010 (3DTextures.me), 2.24 × 2.24 m a tile, #cda363
- `wood/stylized/wood-herringbone-tiles-004` — Wood Herringbone Tiles 004, 1.6 × 1.6 m a tile, #562b07
- `metal/bare/container-side` — Container Side, 1.94 × 1.94 m a tile, #5c8950
- `metal/bare/worn-shutter` — Worn Shutter, 1.37 × 1.37 m a tile, #423d37
- `metal/bare/metal-049a` — Metal 049 A, 1 × 1 m a tile, #fcfbf6
- `metal/sheet/metal-plate` — Metal Plate, 0.5 × 0.5 m a tile, #3e341d
- `metal/sheet/blue-metal-plate` — Blue Metal Plate, 2.5 × 2.5 m a tile, #2a3f4d
- `metal/sheet/diamond-plate-009` — Diamond Plate 009, 1 × 1 m a tile, #6f6356
- `metal/corrugated/factory-wall` — Factory Wall, 3 × 3 m a tile, #62774d
- `metal/corrugated/corrugated-iron` — Corrugated Iron, 1.12 × 1.12 m a tile, #aab3af
- `metal/corrugated/corrugated-iron-02` — Corrugated Iron 02, 2.7 × 2.7 m a tile, #595951
- `metal/rusted/green-metal-rust` — Green Metal Rust, 1 × 1 m a tile, #3f4d34
- `metal/rusted/rust-coarse-01` — Rust Coarse 01, 2.2 × 2.2 m a tile, #643b21
- `metal/rusted/rusty-metal-02` — Rusty Metal 02, 1 × 1 m a tile, #ac9164
- `metal/painted/painted-metal-shutter` — Painted Metal Shutter, 2 × 2 m a tile, #7f8486
- `metal/painted/metal-027` — Metal 027, 1 × 1 m a tile, #2e2d35
- `metal/painted/metal-029` — Metal 029, 1 × 1 m a tile, #1e2221
- `roofing/tiles/roof-09` — Roof 09, 4 × 4 m a tile, #897663
- `roofing/tiles/ceramic-roof-01` — Ceramic Roof 01, 3.5 × 3.5 m a tile, #927855
- `roofing/tiles/grey-roof-tiles-02` — Grey Roof Tiles 02, 1.5 × 1.5 m a tile, #787b79
- `roofing/slate/roof-slates-03` — Roof Slates 03, 3 × 3 m a tile, #717069
- `roofing/slate/roof-slates-02` — Roof Slates 02, 3 × 3 m a tile, #918776
- `roofing/slate/red-slate-roof-tiles-01` — Red Slate Roof Tiles 01, 2.5 × 2.5 m a tile, #9a916f
- `roofing/thatch/thatch-roof-angled` — Thatch Roof Angled, 0.54 × 0.54 m a tile, #55514a
- `roofing/thatch/reed-roof-04` — Reed Roof 04, 2.5 × 2.5 m a tile, #9d8868
- `roofing/thatch/reed-roof-03` — Reed Roof 03, 2.5 × 2.5 m a tile, #8c785d
- `roofing/solar/solar-panel-002` — Solar Panel 002, 1.3 × 1.3 m a tile, #3f5a72
- `roofing/solar/solar-panel-001` — Solar Panel 001, 1.3 × 1.3 m a tile, #3f5a71
- `roofing/solar/solar-panel-004` — Solar Panel 004, 1.3 × 1.3 m a tile, #324352
- `paving/tiles/floor-tiles-06` — Floor Tiles 06, 3 × 3 m a tile, #7c726d
- `paving/tiles/tiled-floor-001` — Tiled Floor 001, 1.5 × 1.5 m a tile, #725c4a
- `paving/tiles/square-floor` — Square Floor, 2 × 2 m a tile, #474746
- `paving/stone/marble-01` — Marble 01, 1.5 × 1.5 m a tile, #b19d7a
- `paving/stone/granite-tile` — Granite Tile, 2.3 × 2.3 m a tile, #4e4e4e
- `paving/stone/granite-tile-04` — Granite Tile 04, 2 × 2 m a tile, #716556
- `paving/cobblestone/cobblestone-floor-04` — Cobblestone Floor 04, 1.5 × 1.5 m a tile, #8f826a
- `paving/cobblestone/grassy-cobblestone` — Grassy Cobblestone, 2 × 2 m a tile, #7a6852
- `paving/cobblestone/cobblestone-floor-08` — Cobblestone Floor 08, 2 × 2 m a tile, #948e82
- `paving/pavers/gravel-embedded-concrete` — Gravel Embedded Concrete, 2 × 2 m a tile, #958f84
- `paving/pavers/gravel-concrete-03` — Gravel Concrete 03, 2.1 × 2.1 m a tile, #5a5a53
- `paving/pavers/rock-tile-floor` — Rock Tile Floor, 1.96 × 1.96 m a tile, #948f84
- `paving/asphalt/asphalt-01` — Asphalt 01, 2.08 × 2.08 m a tile, #595147
- `paving/asphalt/asphalt-02` — Asphalt 02, 3 × 3 m a tile, #5b5a55
- `paving/asphalt/aerial-asphalt-01` — Aerial Asphalt 01, 30 × 30 m a tile, #666267
- `paving/roads/road-012a` — Road 012 A, 6 × 6 m a tile, #41403f
- `paving/roads/road-007` — Road 007, 7.5 × 7.5 m a tile, #50504e
- `paving/roads/road-008a` — Road 008 A, 6 × 6 m a tile, #484641
- `paving/stylized/cobblestone-irregular-floor-001` — Cobblestone Irregular Floor 001, 2 × 2 m a tile, #4c4749
- `paving/stylized/stone-floor-007` — Stone Floor 007, 2.4 × 2.4 m a tile, #a3a2a1
- `paving/stylized/stone-path-006` — Stone Path 006, 2 × 2 m a tile, #4e4c47
- `ground/soil/brown-mud-dry` — Brown Mud Dry, 1.3 × 1.3 m a tile, #745c3f
- `ground/soil/brown-mud-02` — Brown Mud 02, 1.3 × 1.3 m a tile, #4e4538
- `ground/soil/mud-cracked-dry-03` — Mud Cracked Dry 03, 1.5 × 1.5 m a tile, #cfaa82
- `ground/sand/sand-01` — Sand 01, 1.5 × 1.5 m a tile, #a69670
- `ground/sand/sand-03` — Sand 03, 2 × 2 m a tile, #6c604f
- `ground/sand/forrest-sand-01` — Forest Sand 01, 2 × 2 m a tile, #816c58
- `ground/gravel/gravel-stones` — Gravel Stones, 2 × 2 m a tile, #4f4f4d
- `ground/gravel/gravel-floor-02` — Gravel Floor 02, 2 × 2 m a tile, #aaa79c
- `ground/gravel/rocky-gravel` — Rocky Gravel, 1.81 × 1.81 m a tile, #694526
- `ground/grass/leafy-grass` — Leafy Grass, 2 × 2 m a tile, #97845a
- `ground/grass/sparse-grass` — Sparse Grass, 2 × 2 m a tile, #4f3e16
- `ground/grass/grass-path-2` — Grass Path 2, 1 × 1 m a tile, #8f8265
- `ground/rock/rock-face-03` — Rock Face 03, 2.7 × 2.7 m a tile, #846a51
- `ground/rock/rock-boulder-dry` — Rock Boulder Dry, 1.8 × 1.8 m a tile, #a99d8e
- `ground/rock/rock-01` — Rock 01, 1.5 × 1.5 m a tile, #756b5d
- `ground/snow/snow-01` — Snow 01, 2 × 2 m a tile, #b9b7b6
- `ground/snow/snow-02` — Snow 02, 2 × 2 m a tile, #a5a5a7
- `ground/snow/snow-03` — Snow 03, 2 × 2 m a tile, #a19f9b
- `ground/leaves/forest-leaves-04` — Forest Leaves 04, 1.5 × 1.5 m a tile, #83613d
- `ground/leaves/forest-leaves-03` — Forest Leaves 03, 2.3 × 2.3 m a tile, #463821
- `ground/leaves/forest-leaves-02` — Forest Leaves 02, 3.001 × 3.001 m a tile, #90723d
- `fabric/cloth/fabric-pattern-07` — Fabric Pattern 07, 0.4 × 0.4 m a tile, #9c665e
- `fabric/cloth/fabric-pattern-05` — Fabric Pattern 05, 0.5 × 0.5 m a tile, #929481
- `fabric/cloth/velour-velvet` — Velour Velvet, 0.284 × 0.273 m a tile, #ad2e47
- `fabric/carpet/dirty-carpet` — Dirty Carpet, 0.6 × 0.6 m a tile, #353026
- `fabric/carpet/carpet-016` — Beige wool carpet, 1.7 × 1.7 m a tile, #bcb093
- `fabric/carpet/carpet-012` — Dark blue carpet, 1 × 1 m a tile, #353b49
- `fabric/leather/leather-red-02` — Leather Red 02, 0.6 × 0.6 m a tile, #4f2d1b
- `fabric/leather/brown-leather` — Brown Leather, 0.4 × 0.4 m a tile, #512e10
- `fabric/leather/leather-white` — Leather White, 0.3 × 0.3 m a tile, #959380
- `fabric/wicker/wicker-013` — Bamboo weave, 0.5 × 0.5 m a tile, #b07d3f
- `fabric/wicker/bamboo-weave-001` — Bamboo Weave 001, 0.6 × 0.6 m a tile, #e5b678
- `fabric/wicker/wood-wicker-002` — Wood Wicker 002, 0.6 × 0.6 m a tile, #80563c
- `fabric/patterned/fabric-0001` — Camouflage Pattern Vinyl Fabric, 0.5 × 0.5 m a tile, #5e5842
- `fabric/patterned/fabric-0003` — Scottish Checkered Pattern Fabric Texture, 0.5 × 0.5 m a tile, #a65356
- `fabric/patterned/fabric-005-3dtextures` — Fabric 005 (3DTextures.me), 0.5 × 0.5 m a tile, #433a3a
- `fabric/upholstery/fabric-0015` — Red Tufted Leather Texture for Sofas and Chairs, 0.5 × 0.5 m a tile, #b22612
- `fabric/upholstery/fabric-0017` — Red Worn Sofa Leather Texture with Nails, 0.5 × 0.5 m a tile, #51211f
- `fabric/upholstery/fabric-0020` — Padded Coat and Jacket Texture, 0.5 × 0.5 m a tile, #f1f2f2
- `fabric/lace/fabric-lace-004` — Fabric Lace 004, 0.3 × 0.3 m a tile, #2f2f2f, cut-out
- `fabric/lace/fabric-lace-005` — Fabric Lace 005, 0.3 × 0.3 m a tile, #941200, cut-out
- `fabric/lace/fabric-lace-007` — Fabric Lace 007, 0.3 × 0.3 m a tile, #000000, cut-out
- `fabric/stylized/fabric-quilt-002` — Fabric Quilt 002, 0.5 × 0.5 m a tile, #a7a7a7
- `openwork/fence/fence-007a` — Metal grate fence, 0.95 × 0.95 m a tile, #a1a3a5, cut-out
- `openwork/fence/fence-008a` — Large metal grate fence, 1.9 × 1.9 m a tile, #000000, cut-out
- `openwork/fence/fence-003` — Wire mesh fence, 2 × 2 m a tile, #000000, cut-out
- `openwork/grate/metal-walkway-010` — Metal walkway grid, 1 × 1 m a tile, #313038, cut-out
- `openwork/grate/metal-walkway-013` — Fine metal walkway grid, 1 × 1 m a tile, #302f37, cut-out
- `openwork/grate/metal-walkway-011` — Metal Walkway 011, 1 × 1 m a tile, #35353c, cut-out
- `openwork/net/net-001a` — Net 001 A, 1.3 × 1.3 m a tile, #000000, cut-out
- `openwork/net/chainmail-001` — Chainmail 001, 0.3 × 0.3 m a tile, #555657, cut-out
- `openwork/net/net-002b` — Net 002 B, 1.3 × 1.3 m a tile, #6f6549, cut-out
- `facade/facade/facade-006` — Facade 006, 8 × 8 m a tile, #828989
- `facade/facade/facade-005` — Facade 005, 8 × 8 m a tile, #465353
- `facade/facade/facade-001` — Facade 001, 8 × 8 m a tile, #484e55
- `facade/stylized/others-0021` — Office Building Facade Texture, 24 × 24 m a tile, #7f828d
- `facade/stylized/others-0022` — Office Building Facade Texture, 33 × 33 m a tile, #91877d
- `facade/stylized/others-0025` — Old Office Building Facade, 19.2 × 19.2 m a tile, #a2a29d
- `synthetic/plastic/plastic-013a` — Plastic 013 A, 1 × 1 m a tile, #edeae9
- `synthetic/plastic/plastic-010` — Plastic 010, 1 × 1 m a tile, #a3a7ac
- `synthetic/plastic/plastic-006` — Plastic 006, 1 × 1 m a tile, #07070a
- `synthetic/rubber/rubber-004` — Rubber 004, 0.75 × 0.75 m a tile, #2a2c31
- `synthetic/rubber/rubber-001` — Rubber 001, 0.75 × 0.75 m a tile, #1b1d1e
- `synthetic/rubber/rubber-002` — Rubber 002, 0.75 × 0.75 m a tile, #212a2e
- `synthetic/foam/acoustic-foam-001` — Acoustic Foam 001, 1 × 1 m a tile, #1d1d1d
- `synthetic/foam/acoustic-foam-002` — Acoustic Foam 002, 1 × 1 m a tile, #1d1d1d
- `synthetic/foam/styrofoam-005` — Styrofoam 005, 1 × 1 m a tile, #b6b7ba
- `synthetic/tech/chip-005` — Chip 005, 0.5 × 0.5 m a tile, #383137
- `synthetic/tech/chip-006` — Chip 006, 0.5 × 0.5 m a tile, #616a63
- `synthetic/tech/chip-002` — Chip 002, 0.5 × 0.5 m a tile, #7f6e6e
- `paper/paper/paper-002` — Paper 002, 0.5 × 0.5 m a tile, #c3b9b3
- `paper/paper/paper-006` — Paper 006, 0.5 × 0.5 m a tile, #a58768
- `paper/paper/paper-005` — Paper 005, 0.5 × 0.5 m a tile, #c9a879
- `paper/cardboard/cardboard-004` — Cardboard 004, 1 × 1 m a tile, #b98f4d
- `paper/cardboard/cardboard-001` — Cardboard 001, 1 × 1 m a tile, #b08e58
- `paper/cardboard/cardboard-003` — Cardboard 003, 1 × 1 m a tile, #b99050
- `paper/cork/cork-001` — Cork 001, 1 × 1 m a tile, #c08268
- `paper/cork/cork-004` — Cork 004, 1 × 1 m a tile, #aa703d
- `paper/cork/cork-003` — Cork 003, 1 × 1 m a tile, #c2834a
- `glass/clear/float` — Float glass, 1 × 1 m a tile, #e2ecea, see-through
- `glass/clear/old` — Old cylinder glass, 0.6 × 0.6 m a tile, #d0e4d2, see-through
- `glass/clear/bronze` — Bronze tinted glass, 1 × 1 m a tile, #967456, see-through
- `glass/textured/frosted` — Frosted glass, 0.5 × 0.5 m a tile, #ecf0f2, see-through
- `glass/textured/hammered` — Hammered glass, 0.3 × 0.3 m a tile, #e4ecec, see-through
- `glass/leaded/diamond-quarries` — Leaded diamond panes, 0.3 × 0.42 m a tile, #c4d5c4, see-through
- `glass/leaded/square-quarries` — Leaded square panes, 0.6 × 0.6 m a tile, #c7d6c9, see-through
- `glass/leaded/stained` — Stained glass, 0.6 × 0.6 m a tile, #9c776a, see-through
- `glass/glazing/glass-window-002` — Glass Window 002, 1.5 × 1.5 m a tile, #93a5ab, see-through
- `glass/glazing/glass-window-005` — Glass Window 005, 2 × 2 m a tile, #4f5056, see-through
- `glass/blocks/glass-blocks-001a` — Glass Blocks 001a, 1.6 × 1.6 m a tile, #b9c5bb
- `effects/water/calm` — Calm water, 4 × 4 m a tile, #183e46, see-through, moves
- `effects/water/rippled` — Rippled water, 4 × 4 m a tile, #183e46, see-through, moves
- `effects/lava/lava-001` — Lava crust, 3 × 3 m a tile, #54393c, cut-out, glows, moves
- `effects/lava/lava-004` — Molten lava, 3 × 3 m a tile, #b04730, cut-out, glows, moves
- `effects/lava/lava-005` — Lava 005, 3 × 3 m a tile, #84423d, cut-out, glows, moves
