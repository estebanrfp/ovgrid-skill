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
3. **Resources** — the build file; shapes, kinds, solids carved and gathered, materials by use, species, effects.
4. **Quality** — proportions, walls, composition.
5. **Budget** — what one build and one place may bring; the check.
6. **Interactivity** — particles, lights at night, behaviours, vehicles, scripts.
7. **Delivery** — the JSON, the ghost, confirming, changing it later.
8. **Verification** — looking at it, fixing it.

**The avatar is your ruler.** Everything in OVGrid is built to the size of the person who walks it. The
avatar is **1.8 m tall and 0.6 m wide**, steps up **0.3 m**, walks slopes to **50°**, touches or clicks what is
within **5 m**, makes a `door` open when it comes within **2.5 m**, and its camera follows **4 m behind and
1.4 m up**. Before you write any size — a door, a bridge, a bench, a lamp, a fence, a stair, a room, a boat's
deck, a tree's first branch — hold it against the avatar: can this person walk through it, stand under it,
step on it, reach it, sit on it, see it from where the camera is? What is walked, climbed or used is sized for
them, at real size outdoors and a third larger where the camera must get in; what is only looked at can be any
size. A door part's `size` is its frame's box and its opening is smaller: never a door box under 0.9 × 2.1 m.
The table is in step 4 (Scale and proportions).

**Carve, don't pile: carved blocks are preferred.** Whatever you build — a house, a bridge, a boat, a tower, a market stall,
a well, a fence — it is a few kinds of form, and each has its recipe (recipes.md). A mass with hollows and openings in it is
**one** `solid`: a box, its rooms and bays `cut`. A plate with holes is one. A frame of members — legs, posts, rails, rungs —,
a run of the same at a step, the loose pieces of a room: **one** `solid` of bodies side by side (`"join": "none"`, `mirror`,
`repeat`), never a part for each. What repeats far apart is an object and its clones; only what a solid cannot carry stays a
part of its own (a door, anything with a behaviour, a light, a script, a tree). A carve has no seams where pieces meet;
pieces do. So never leave **overlaps** (pieces of one surface laid across each other, as a wall's boxes at its corners),
**boxes that touch round an opening** (a wall of boxes round a door or a window), **two faces in one plane** (they flicker:
make the two one block, or offset one 1–2 cm), or **an open joint between a wall and its opening** (a gap or a lip: the door,
window or arch is a kind whose box is exactly the `cut`). Every part is a record each peer signs, keeps and sends, and *fair* is a ceiling, not a target: count your own
parts, clones aside, before you give the build, and say why any place keeps several boxes. Gather what is plain and measure
what is textured: a gathered solid is a mesh of its own (budget.md).

Beside this guide, in the same repository (`estebanrfp/ovgrid-skill`):

- **catalog.json** — every shape, kind, behaviour, particle preset, material and tree species,
  made from the world's own code, one entry a line.
- **skills/ovgrid/scripts/survey.mjs** — the ground round a place from the person's URL
  or coordinates: heights, slopes, water, ridges and valleys, a map, the anchor to build on.
- **skills/ovgrid/scripts/check.mjs** — a build checked as the world checks it.
- **skills/ovgrid/scripts/sculpt.mjs** — what is curved or organic, described in a few numbers or
  brought as a glTF model, made the world's sculpted prims.

All three run with Node 18+ or Bun. If you cannot run code, ask the person for their editor's survey
(step 2) and carve rather than pile (below, and recipes.md): a few dozen parts, each form one `solid` of boxes and cuts,
written carefully, since there is no check to catch what you get wrong.

The quality of what you build comes from three things: the bank's materials, the rules here, and
looking at it until it is right. The detail is the person's to ask for: a plan in a line gets a
sound, plain build; a page of detail gets that detail, within the budget.

*On this one page the references follow one another, step by step: where the text names a reference by its file — recipes.md, format.md, method.md… — it means that section below, which is also the file of that name in `skills/ovgrid/reference/`.*

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
   moves, each with its size, where it stands and which way it faces, its recipe (a carved solid, a gathered solid, a kind, an object and
   clones: recipes.md) and its count of parts.
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
2. **Solids and kinds** instead of piles of prims: a shell, a slab with its stairwell, a wall with its openings carved from one
   block; furniture, railings and rows gathered side by side in one part (recipes.md); stairs, roofs, fences, doors, windows,
   columns, arches as kinds.
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

### A model as the plan

A person may hand you a model to build from — a GLB of a mansion found online — instead of a
description. Read it as an architect reads drawings, then build it again in the world's own pieces.
Never bring in its mesh or its textures.

1. **Read it**: always a GLB — Sketchfab's own download carries its pieces' names (they say much:
   `Window.012`, `Stairs`), its materials and colours, and who made it under what licence. CC0 or
   CC-BY only — never NoDerivatives, as your build adapts it — and the author, licence and source go
   in every object's `origin`.
2. **Measure it**: `node skills/ovgrid/scripts/plan.mjs <model.glb>` says it all in a second, as text: its units
   (read from its storeys), size, materials with the bank's nearest, what repeats and where, what its
   pieces' names say (doors, lamps, furniture, plants), the lights it carries, its levels, its walls
   with their doors and windows (cut through them, or laid on them as most models have them), its
   stairs, each roof slope's pitch and corners, the outlines of its flat areas, the profiles of what
   is turned; `--json` gives every number. Its doors and windows, materials' roles and units are
   guesses: check each against its names and the rest — exporters misname materials.
3. **Rethink it, then build it again** from those numbers, each element by its tool (format.md,
   «Choosing a recipe») — never its pieces gathered as they were: each wall and its openings one
   `extrude` with its holes, its floors round their stairwells, its roofs faceted; the kinds for windows,
   doors, stairs, columns, fences, roofs and roads; what is turned or curved a solid of its profile,
   faceted (a fountain, an urn: a `revolve`), a large smooth curve a coarse cage smoothed near, and a
   sculpt only where the person asks for one; species for its trees, clones for what repeats; the bank's materials
   by role, matched to its colours. What the bank has nothing as good as — a clean modern wood
   cladding, say — is looked for among CC0 sources at the bank's quality and taken into it: every
   house grows the bank.
4. **Bring it to life — always**, with what a model cannot carry: lamps in its rooms and at its
   doors, doors and gates that open as someone comes near, a fire in its hearth and smoke from its
   chimney, water and a jet in its fountain, furniture wherever rooms are seen or walked through.
   Most models are shells: give it walls with their thickness, floors and a stair to each storey.
5. **Fit it** to the avatar first: the tool's *The avatar* says at what scale to build it. A house
   whose rooms are under 2.8 m clear or whose doors are under 2.2 m is built larger, all of it, just
   enough (never smaller, at most ×1.5). Furniture, lamps and rails keep their size, set where their
   floors stand grown. Stairs are laid again with risers of 0.2 m at most, wherever their run fits.
   Then fit the whole to the ground and the budget, and say what you simplified: a flat roof made a
   ridge, arches made straight, a railing raised to a real one's height.


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
the 62 species of trees and plants — is in **catalog.json**, made from the world's own code, one entry a line.

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
  itself rather than a point over the ground — a survey's anchor, an export's. `"bare": true` stands
  the frame on the planet's own ground under the anchor, not on land edited there — a build that stands
  on another's land, in its frame (below, Land). Without an anchor the person places the build where
  they point (deliver.md). Where anchors come from: site.md.
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
| `climbable` / `bouncy` | `true`: climbed when walked into, as a rock face is / throws back up whoever lands on it — or how (below) |
| `live` | a live module, people's own media for whoever is near: a voice zone, a screen, a file drop (below, Live media) |
| `behaviour` | What it does by itself: opens on a click, turns, bounces, goes and comes back (below) |
| `script` | Its script, JavaScript as a string, for what no property can say (effects.md) |
| `seat` | `true`: sat on by a click, on its top, facing its +y — a bench, a chair, a vehicle's seat (vehicles.md); or `{ "at": [x, y, z], "turn": 90 }`, its sit target: the hips there in the part's own frame (m, from its centre) and the body turned that many degrees from its +y about the vertical, as a part turns about z — a ring-shaped puf (on its rim, not over its hole), a sofa's places, a stool sat on facing the bar; and `"pose"`, how one sits there (catalog.json → `poses`: a clip, a chair's resting the hips on the top, the rest the feet — a cushion on the floor cross-legged, a pew kneeling, a stage dancing, a car's wheel), with a target or without one |
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
| `door` | frame: width, wall thickness, height — the box is the frame's, its clear opening smaller: width − 2 × `frame` (0.08 by default) wide, height − `frame` high, so a box of 1.0 × 2.2 m leaves 0.83 × 2.1 m; a person (1.8 × 0.6 m) needs 0.8 × 1.9 m clear, never a box under 0.9 × 2.1 m | 0 frame, 1 leaf, 2 glass, 3 handles | front −y; `hinge` seen from the front; `open` 0–110° swings out to the front |
| `window` | frame: width, ≤ wall thickness, height | 0 frame, 1 bars, 2 glass, 3 sill | front −y; the sill stands out of the box to the front |
| `roof` | all of it: width (along the ridge), depth, eaves to ridge | 0 roof, 1 ends (gables), 2 underside, 3 eaves | ridge along x; `shed` low at −y |
| `stairs` | made by `steps`, `height`, `tread`, `width` | 0 treads, 1 risers, 2 sides, 3 underside, 4 railing | rises towards +y; the railing stands above the box |
| `fence` | what its `points`, `thickness` and `height` make; or a `size`: a straight length along x | 0 posts, 1 rails, 2 pickets | a path of 2–32 `points`, a post on each and others every `spacing` m at most; the last on the first closes it round |
| `road` | what its `points`, `width` and `depth` make | 0 surface, 1 sides, 2 underside | a ribbon along 2–32 `points` laid on the ground, its slab `depth` under it; under 2 m wide a path; the last point on the first closes it round |
| `column` | plinth width, depth, height | 0 shaft, 1 base, 2 capital | upright |
| `arch` | width, wall depth, height | 0 its two faces, 1 the opening, 2 outside, 3 feet | wall in x–z, opening through y |
| `bevel` | its own | box: as a cube; cylinder: as a cylinder | `base` box or cylinder; `edge` round or chamfer, `radius` m |
| `blocks` | its own: its grid's | one a colour, up to 8 | never written by hand: a model's square-cornered solids, made by the tool that rebuilds it — a staircase, a figure of voxels, in one part |
| `outline` | its own: its rings' across x and y, drawn out bottom to top along z | one a colour, up to 8: its edges' and its two ends' | never written by hand: a model's solids drawn out along a way, made by the tool that rebuilds it — a gateway's arch, a wall with round windows, a letter, in one part |
| `solid` | its own: what its `base` fills (box, cylinder, cone, ball or wedge; round ones of `sides`) | 0 its box's; a body's `colour` (1–7) for what it leaves | its `bodies` — prims, hulls, revolves, extrudes, lofts, sweeps and smoothing steps — in metres about its middle, each turned ° about x, then y, then z — see Solids below |
| `rock` | width (y) and height (z); length (x) from `elongation` | 0 surface, 1 cover (crystals: 0 crystals, 1 stone) | `form` boulder, crag (a rock of metres), layered (`layers`), pile (`stones`), crystals (`crystals`, quartz), passage (`stones`: two pillars, a lintel, blocks — a way through) or outcrop (`stones`), these two large, 7–8 m; flat `base` down; sink it a tenth of its height; `cover` puts face 1 on what faces up — dress it in moss or snow; crystals see-through by face 0's `opacity`, glowing by its `glow`; the catalog's `families` are ready recipes |

##### Solids

A `solid` is one part where prims pieced round an opening took many: what its `base` fills its box with, then
`bodies` one after another — each `add`ed to it, `cut` out of it or `keep`ing only where they meet — a `box`,
`cylinder`, `cone`, `ball` or `wedge`, `at` and `size` in metres about the part's middle (a body's size along its own
axes), `turn` in ° about x, then y, then z, and the `colour` (1–7) of the faces it leaves. At most 32 bodies. A wall
4 m long with a door and a round window, their reveals dark:

```json
{ "kind": "solid", "at": [0, 0, 1.5], "size": [4, 0.3, 3], "colours": 1, "color": [0.86, 0.83, 0.76],
  "surface": { "faces": { "1": { "color": [0.32, 0.22, 0.16] } } },
  "bodies": [
    { "cut": "box", "at": [-1, 0, -0.45], "size": [1, 1, 2.1], "colour": 1 },
    { "cut": "cylinder", "at": [1, 0, 0.5], "size": [0.8, 0.8, 1], "turn": [90, 0, 0], "colour": 1 }
  ] }
```

A cutting body reaches past the faces it cuts through (the door above: 1 m deep in a wall 0.3 m thick). Every peer
works it out from these numbers (Manifold, off the page's thread; its object shown whole once it is, dissolving in): its record stays a
few hundred bytes, one part, one draw. Change an opening by changing its numbers. The example build `solids` makes a wall,
a gateway, a tower, a dome and a rounded block this way. In the editor, a box, cylinder, cone or ball's Shape tab adds
its bodies (Cut, Join, Keep) and smoothing steps (Smooth), and changes each one's numbers, sides, mirror and copies. A hull's
corners and a sweep's path, of the body chosen there, are handles on the part: dragged across, Alt-dragged up and down.

**A face its own colour.** A box body may give each of its six faces a colour of its own, `"faces": [−x, +x, −y, +y,
−z, +z]` (0–7 each, in the order blocks number their sides), and an extrude its two caps and its sides, `"faces": [its
−z cap, its +z cap, its sides]`: a wall of two looks in one body — its inside on one cap, its outside on the other, its
edges and its openings' reveals a third. What a cut body leaves is named from inside it: its −x face is the reveal at
its −x end. Leave `faces` out where every face is its body's colour. Any other face of a body — a hull's facet, an
extrude's side or the inside of its hole, a cylinder's round side — takes a colour of its own by a spot on it: `"spots":
[[x, y, z, n], …]`, each a spot on the body's surface, in fractions of its box along its own axes (−0.5 to 0.5, to a
ten-thousandth), and the colour (0–7) of the facet nearest it and of the surface smooth round it, as far as no crease
parts them (30°, a round body's 70°): a round hole's 24 facets are one face, its intrados; a square hole's four sides
four, each where it is — a door's jamb, not the wall's far side that faces the same way. A repeat's or a mirror's copies
each wear it on their own face. At most 64 a body. `"flat": true` shades a body faceted, each facet alone, as a
faceted model is drawn (the FFORMS are, every one): without it, facets meeting at less than 30° are shaded as one smooth
surface, and a spot spreads across them; with it, each facet is a face of its own. In the editor's face mode every face
that shows as one is picked and dressed alone: a box's side or an extrude's cap by its `faces`, any other by a spot left
where it was clicked. In a solid joined into one surface the same goes for a body kept and for what a cut leaves (named
from inside it, as its faces are), and for its base: the part's own `"faces": [−x, +x, −y, +y, −z, +z]` dress a box base
side by side, its own `"spots"` any base — a block carved by its cuts dressed face by face. The bodies face mode picks
are boxes, cylinders, cones, wedges, hulls neither round nor hollow, extrudes neither twisted nor tapered, and revolves
(a flat revolve's quads each their own: a UV sphere is one revolve of its meridian); a ball, a round or hollow hull, a
twisted or tapered extrude, a loft and a sweep are dressed by their colour only.

**Bodies of their own points.** Round, curved and organic shapes are bodies too, each its points packed in its box:
every coordinate a 16-bit fraction of the box, `round((v / size + 0.5) × 65535)` for v in metres about its middle, two
bytes little-endian, a point's coordinates in turn, the whole in base64 — 0.24 mm along 16 m, eight characters a point
of three. Write them with a generator, never by hand.

| Shape | Its own fields | Makes |
|---|---|---|
| `cylinder`, `cone`, `ball` | `sides` 3–64 (a ball's a multiple of 4); the `base` takes `sides` too | hexagonal posts and nuts, faceted columns and arches |
| `hull` | `points` (x y z, 4–32; 1–32 with `round`), `round` (m: each point a ball), `hollow` (m) | shards, rocks, gems, chamfered blocks, roofs (a hip roof is 6 points); with `round` a capsule of two (legs, struts, rails), cushions, pebbles; `hollow` a cabin's or a dome's skin |
| `revolve` | `profile` (x z, 3–64: x out from its axis, from 0 to its box's side), `sides` (a whole turn's), `angle` (°) | columns, balusters, vases, wheels, tyres and rims, domes, lamps, noses; part of a turn for an arch's band |
| `extrude` | `profile` (x y, 3–64), `holes` (up to 8 profiles through it), `twist` (°), `scale` at its top (0 a point; one number or two) | frames with their openings, mouldings, tapered wings and blades, twisted columns, spires |
| `loft` | `points` (x y z, every section's in turn), `count` (points a section, 3–64; 2–32 sections), `hollow` (m) | boat hulls with their flare (a section that bulges in, which a hull would fill), fuselages, car bodies, wings with their roots; a section of one point is a tip |
| `sweep` | `path` (x y z, 2–32), `profile` (x y, 3–64, in its `across` [w, h] m), `scale` at its end, `twist` (°), `closed` | rails and handrails, pipes, cables, bent tubes, mouldings round a curve, horns and tails (tapered) |

Any body may be `"mirror": "x" | "y" | "z"` — itself and its copy across the part's middle: a vehicle's two sides exact
where they meet — and `"repeat": { "count": n, "step": [x, y, z] }` or `{ "count": n, "around": degrees }` (round the
part's z, or round the upright through `"at": [x, y]`): a balustrade, a wheel's spokes, a row of windows in one body.
Given both, each copy is turned, then moved on its step — a helix: a spiral stair's treads, one body round a newel at
a corner `{ "count": 16, "around": -6, "step": [0, 0, 0.25], "at": [-1.5, -1.5] }`. A step `{ "smooth": 1 | 2 | 3 }` among the
bodies smooths what came before it — edges sharper than 52.5° kept sharp — and leaves what comes after it crisp: write
the shape, then the step, then its cuts (windows, a deck's opening). Smooth what is ordered — lofts, sweeps, revolves —,
not a hull of points (its long thin faces bend wrong: give it `round`). Far away a smoothed solid is drawn as its cage;
near, each viewer draws as much of its smoothing as their Quality panel's «Smooth shapes» says. A revolve's and a
sweep's textures follow them, round and along, at their real size.

`"join": "none"` draws its added bodies as they are, side by side — no base, no booleans, nothing cut, kept or smoothed —:
a model's faces rebuilt as plates that meet on their edges, many to a part, in no more triangles than the prims were (a
union would split each where another overlaps it). It collides as its hulls, one convex piece each, as the prims did.
Bodies that are all plain — hulls, boxes, cylinders, cones and wedges, none `round` or `hollow` — are made on the page at
once, without Manifold: such a solid shows as soon as the prims round it do. So is a flat extrude among them — not
twisted or tapered, its holes inside its outline and apart: a wall and its windows, a floor round its openings, a gable.
Each `repeat`ed and `mirror`ed copy of either is made there too. A round one is as coarse far as a prim (24 sides near:
6, 9, 15 and 24 by level), so a wheel or a rail in one draws no more than its prim. What repeats round an axle is one
body and its copies — a tyre's faces, a rim's, a wheel's spokes, the part turned so that its z is the axle —, a pair
one body `mirror`ed across the part's middle: a few hundred characters where a body each took thousands.

**Recipes by form, by hand** — a mass with hollows, a basin, a plate with holes, a frame of members, a run, the loose pieces of a
room: each its recipe, with its JSON, and what never to leave (overlaps, boxes that touch round an opening, two faces in one
plane, open joints between a wall and its opening): recipes.md.

**Choosing a recipe** — what has made recipes lighter than the prims they replaced, and what has not, each measured:

- *Rethink it; never gather it* — every build, and every rebuild of one, is designed from its form's own logic before
  a part is written: a wall and its windows one `extrude` with its holes, a floor round its stairwell another, a roof a
  faceted solid or two, what repeats one part and its clones, openings cut in their form. True to its look, not to
  old pieces: a rebuild draws notably fewer parts, draws and triangles, near and far, weighs notably less than what it
  replaces, and looks as well or better — or it is not done. Gathering old pieces as they were is the last resort,
  for what no tool fits.
- *Faceted, subdivided or sculpted* — decide first how the form is taken:
  - *Facet*, the default: what is built — walls, floors, frames, beams, stairs, roofs, furniture, machines — and any
    curve seen small or far. Few faces, placed where the form turns, unsmoothed: the same mesh near and far.
  - *Subdivide* where a large form must read as one smooth curve up close — a hull, a fuselage, a dome, a vase: a coarse
    cage, its control net, smoothed near; far, the cage alone is drawn. Few sections and few points, placed where the
    form turns, never sampled densely from a model or a sculpt: a dense cage smoothed weighs more far than the sculpt it
    replaces. Smoothed, a cage draws in from its corners: a ball's of twenty faces, smoothed a step, lies 12 mm inside a
    head of 0.69 m at the middle — make it 3.5 % larger and it meets the ball (3 mm off at the middle, 9 at 95 %).
  - *Sculpt* only when the person asks for a sculpt. An organic form, one that dents in too, is a solid faceted: a
    waisted post a `revolve` of its profile, a curved bracket an `extrude` or a `sweep` of its outline.
  - Never smooth what reads by its planes (a wall rounded is a cushion), nor facet a large form that must read smooth
    up close.
- *Plain faces* — plates, boxes, beams, posts, wheels, hubs: hulls of each plate's own corners and plain boxes,
  cylinders, cones and wedges, side by side, many to a part. They are made on the page with the prims, exact, and
  collide as convex pieces. A face with no thickness (a side under a millimetre) has no hull: leave it the prim it is.
- *Plates that wear a texture* — walls, floors, ceilings, frames: where every face of a plate wears one look (its
  material, tint, how its tiles lie and how it takes light), gather the plates by look, each look a colour of the solid
  (eight to one, each written whole in its face), and those turned alike into one solid turned as they are, so that its
  tiles run on its faces as they ran on the plates' — and on from plate to plate, with no seam where two meet. A box
  square on its solid's axes is a `box` body, half the characters of its eight corners; a box hollowed square through, a
  frame, is its four plates. A plate whose faces wear different looks, or a look seen through, stays a prim, and so does
  a solid that would not be lighter than its prims: a few plates, each look written whole, can weigh more.
- *A sculpt of a model*, rebuilt: where its map is convex, a hull of its points (32 at most) within its map's own
  precision, a byte of its box along each axis. Where it dents in — a bracket's curve, a post's waist — a hull would
  fill it in: a `revolve`, an `extrude` or a `sweep` of its profile, faceted. It stays a sculpt only where the person
  asks for one.
- *Per frame*: plain parts of one look gathered — a vehicle's — cost what their prims did, at 120 Hz in the same view the
  GPU and the page's thread within a few hundredths of a millisecond, with a third of the draws. Textured plates gathered
  are not yet that: prims of one shape share a mesh, many to a draw, where each solid is a mesh of its own, and a house
  so gathered drew more and its page's thread did more (+0.13 to +0.19 ms a frame). Measure before replacing what
  repeats. A prim box is drawn in 108 triangles near and 12 far; a box body, or a hull of a plate's corners, in 12 at
  every distance.
- *A plate with openings* — a floor round a stairwell, a wall with its windows: one `extrude` with its `holes`, exact. Pieces
  round a gap would be a record each, with seams where they meet.
- *A shell along an axis* — a hull, a fuselage, a dome, a deck: a `loft` through its sections; one loft from end to end
  rather than pieces that butt, and a `cut` for what opens in it, after its smoothing. Its twisted quads fold outwards,
  so a loft the same either side of its middle comes out so, never dented on one side. *A turned shape* — a pod, a vase, a
  column: a `revolve` of its profile. *A rib, a rail or a band round something*: a `sweep` of its section along its path.
- *A skin people are inside* — a cabin, a cockpit, a vehicle's or a vessel's body: one `loft` through the few sections
  where its form turns, each the same points, `hollow` as thick as its skin, its ends walls. Each opening is a `cut`: a
  hull of its outline on the skin, drawn out of it and in along its own way out (8 cm out, 30 cm in). A door that is
  part of that skin is the same loft kept within the door's outline — the very hull that cuts it out of the body, taken
  the other way — so that the two fit exactly. Never a strip lofted of its outside and its inside: where the skin twists,
  its two faces cross.
- *What sits on a skin* — a raised block on a roof, a hump, a fairing —: a hull with its foot 8 mm into the skin on the
  skin's own lines, never on points worked out between them: where it steps down to the skin, a point of every section,
  so that its foot runs along an edge of the loft; under it, the skin one plane — a point hidden under it placed so —, in
  halves each on its own where the skin peaks under it. A hull on a skin twisted between its sections stands off it on
  one side and through it, into what is inside, on the other: check it with rays down it, each crossing one skin.
- *Its glass*: within the skin's thickness, never level with its faces — 5 mm in from its outside, under the frames
  round its openings. A flat opening, or one folded once, a pane each: a plain body, walked on as it stands. Openings
  across a curved or twisted skin, the skin's own loft drawn thin within it, kept within a box round them: seen only
  through them, hidden in the skin elsewhere. A pane opened from inside — a door's window — in a part of its own.
- *What a vehicle rests on* — its wheels, skids, runners —: plain bodies. Only convex pieces move with a vehicle's body;
  a hollow one is left out of it, so what it stands on must be convex.
- *Furniture faceted*: a cushion, a seat's back, a panel, a box with its edges chamfered — 24 corners, 44 triangles at
  every distance —, where a box of the bevel kind draws 108 at every distance.
- *Sample it where it bends*, and choose its points and its smoothing by measuring what it draws near against the shape it
  must be. Of every combination within a solid's limits, keep the fewest points that hold its form, drawing no more, near
  or far, than what it replaces — the lightest, its four levels' triangles together, that is shaded smooth (at most 1 %
  of its surface beside an edge turning 30–52.5°: the light breaks only where its form creases), within its form (98 % of
  it within a hundredth of its size and a tenth of its thinnest side, nowhere twice that, its volume within 2 %), and no
  more open where it meets other parts than its form is there, by a centimetre. What is straight wants no smoothing, nor
  does a form of flats and rounded edges: a smoothing step rounds a flat beside a curve into a bulge. A loft's points
  cost eight characters each: some 370 to a part.
- *What meets a smoothed shell* is made of the shell's own loft where it can be: what fills a room cut in it — a floor,
  a wall across, a console — that room's loft and smoothing, moved in a few millimetres, kept within its slab; what lies
  on it — a door, a hatch — a strip of the shell's loft moved out, kept within its outline (thinnest across, as a door's
  way out wants). Each meets the shell as drawn at every level, faceted too. What only stands near it — a sofa's back, a
  frame on it — is fitted to it as drawn near: a ray out from its middle at its height meets the shell as made. Fitted
  to the description, what the smoothing moved leaves a gap or reaches into the skin; fitted by rays, it does so in the
  cage, faceted. The check (skills/ovgrid/scripts/check.mjs) notes a solid smoothed over a cage of more than 400 triangles: few
  sections and points where its form turns hold it.
- *Openings in a smoothed shell, and their glass* — a windscreen, a hull's windows: `cut` from the shell after its
  smoothing step, and the glass a part of glass with the shell's own bodies up to that step, in the same box, then a
  `keep` of the same opening: the shell's own skin there, flush at every level, nothing to fit. A part keeps what is
  within one body and its copies: a row of windows is one body `repeat`ed and `mirror`ed, and each body of openings its
  own part of glass. A room people walk in, a cabin, is `cut` from the cage before its smoothing: a `loft` through
  rings moved in from the shell's own by its skin, the same points round — rings of other points poke through the skin
  between them.
- *Far away a solid is its cage* — its points, unsmoothed: a coarse cage is light far, a dense one keeps its triangles
  out to the distance. A part is drawn at its far levels only once it is small on screen, though: level 1 past some 100
  times its radius, level 0 past 200, a few pixels across. A part metres across is drawn at its near levels wherever it
  is seen at all, its shadows a level coarser: weigh those too. Round bodies side by side thin by level as prims do.
- *Gather what meets nowhere* into one part, side by side: the same shape, no booleans. *Join* what must read as one
  surface. *Do not gather* what is read by its box: a vessel's inside and its waterline are the box round its largest
  parts. Ribs or pods gathered into one part would pass for its hull; leave them their own parts.
- *To compare*, count records, bytes, triangles a level, how close it lies to its shape, its open edges (a solid has
  none), and when it is drawn whole. Bodies that are not all plain are worked out after the page's first frame, in two
  workers: a build of a dozen of them is drawn about a frame after its prims.

Limits, a solid refused past them: 32 bodies and steps, 3,072 characters written out, 5,000 triangles before its
smoothing (the check says so); a step's smoothing is held to 5,000. A vase:

```json
{ "kind": "solid", "at": [0, 0, 0.55], "size": [0.8, 0.8, 1.1], "colours": 0, "material": "paving/stone/travertine-009",
  "bodies": [
    { "keep": "revolve", "at": [0, 0, 0], "size": [0.8, 0.8, 1.1], "sides": 24, "profile": "AIAAAP+/AABmxqMLmekuOpn5XXT/3y66Zra+4TLD////t///M6sS5MzULrpl7l10Zt7WPjK78hQAgPIU" },
    { "smooth": 1 }
  ] }
```

The example build `solids` has a second row of them, one part each: a hexagonal column, a vase, a wheel and its spokes,
a boat's hull lofted through flared sections and hollowed, a handrail swept along a curve, a crystal, a cushion, a
twisted column, a spire, and a small plane whose wings are mirrored.

What only a model holds — a statue — is described with `"sculpt": { … }` (a lathe, a box, a loft, a sweep, or a model)
and the sculpt tool makes it a part of the `sculpt` kind, its map never typed by hand; a sculpt keeps each point in a
byte of its box (6.5 cm along 16 m), so what must join exactly — a hull, a rail — is a solid's. → sculpt.md

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
| Portals | `effects/portal` (`look`: glows, moves): a gate's event horizon, one pool of light to a tile — its `scale` the disc's diameter |
| Mirrors | `effects/mirror` (`look`: mirrors): `silvered`, `antique` (foxed, hazed) — a bathroom's or a hall's glass, a wardrobe's door, a dancing room's wall: on the one face that looks into the room (below, Mirrors) |
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
| `matte` | 0–1: how much less it mirrors; 1 nothing at all — no sky, no sun's highlight, no lamp's glint, glass as clear edge-on as head-on |
| `media` | A video, a GIF or a sticker across the face, by its address (below, Media) |
| `page` | `{ "html": "…", "data": { … } }`: a page of its own on the face (below, Pages) |
| `pattern` | `{ "name": "tesla", "scale": 2, "width": 0.06, "glow": 0.5, "power": 3, "speed": 1, "colors": ["#00e5ff", "#ff2bd6"], "multicolor": true, "crackle": 30 }`: lines, cells or glows worked out on the face, most moving — `name` one of forty: `grid`, `hex`, `circuit`, `pulse-grid`, `plasma`, `scan`, `matrix`, `glitch`, `dots`, `stripes`, `plaid`, `tesla`, `dna`, `reactor`, `fire`, `ember`, `fluid`, `vein`, `shockwave`, `heartbeat`, `stargate`, `firefly`, `rune`, `pcb-trace`, `warp`, `synapses`, `nano`, `radar`, `sonar`, `dot-wave`, `dot-orbit`, `ic-chip`, `bus-line`, `motherboard`, `led-grid`, `signal`, `particles`, `p2p-mesh`, `fluid-plus`, `lava-flow` (what each looks like, and its own numbers with their ranges: catalog.json, `patterns`); every pattern's `scale` cells a metre (0.25–20), `width` a line's share of its cell (0.01–0.3), `glow` how much its lines light themselves and `power` how bright (0–1, 0.5–10), `speed` (0–5), `background` how much of the face itself shows between its lines (0–1: 0 the pattern alone, what is behind seen through), its colours `#rrggbb`; its own numbers — up to three, by name, as tesla's `bolts`, `reach`, `crackle` — another pattern's dropped; each left out at its default. Its lines lie at their size on the face whatever the part's — a reactor, a radar, a stargate or a warp round the face's middle, fire rising from its foot —; over a face's colour, or on a textured face in its tiles |
| `faces` | `{ "<face>": { …any of the above } }` by face number (0–8); a face's own wins |

How a texture runs: a box's top and bottom run u along its x; its four sides run u level and v up;
a cylinder's side runs u round and v along its axis. Boards along a piece lying along y:
`faces: { "0": { "rotation": 90 } }`; upright boards on a side: `rotation: 90`. The tile is laid
from each face's centre: to run courses on across the boxes of one wall, slide each box's long faces
by its centre's place along the wall and up it, in tiles (`offset`).

The bank's own effects come with the material: glass and water seen through, water rippling,
lava glowing and flowing, a portal's pool of light rippling out from its middle, fences and grates
cut out (catalog `look`).

#### Mirrors

A face of `effects/mirror` shows what stands before it as a mirror does: the avatars, and what is built 5 m before
it. Put it on one flat face, the one looking into the room, the rest of the part a frame's or a wall's material (a
box's face 1, −y, as below); a disc's top (a cylinder's face 0) does too, a curved face does not. Keep its face 1–2 cm
proud of the wall behind it, never level with it, and a few millimetres of frame round it. The terrain, plants and
water are not in it: past a window or a door it shows the sky and the ground's colour.

```json
{ "name": "hall mirror", "shape": "cube", "at": [0, 2.98, 1.45], "size": [1.2, 0.04, 1.8],
  "material": "wood/planks/oak-veneer-03", "surface": { "faces": { "1": { "texture": "effects/mirror/silvered" } } } }
```

What it shows and when is its face's `mirror` (or the prim's surface's, for all its mirror faces), each optional:

| Field | |
|---|---|
| `reflects` | `"near"` (default): the avatars and what is built within 5 m before it; `"avatars"`: the avatars alone, the room behind them the surroundings as metal shows them |
| `on` | `"near"` (default): by itself while one stands within `radius` and it is in view; `"click"`: switched by a click on it; `"aim"`: aimed at within reach, as a vehicle is — the hint, then E or a click. Each viewer for themself |
| `radius` | 2–30 m (default 6): how near one stands for it to come on by itself |

Or the Media palette's own: a live mirror, `"live": { "type": "mirror", "face": 1, "look": "antique", "on": "aim" }`
(below, Live media) — its face wears the bank's mirror of its `look` (`silvered`, `antique`) with those settings.
However many mirrors there are, one at a time shows what stands before it: of those on, the one taking most of the
screen; the others mirror the surroundings as metal does.

#### Media: videos, GIFs and stickers on a face

A face shows a video or an animated picture by its address — a screen, a sign, a sticker on a wall —
with `media` in its surface. Only the address goes into the build: every browser that shows it fetches
the file itself, so nothing of it travels between people.

```json
{ "name": "board", "shape": "cube", "at": [0, 0, 1.9], "size": [2, 0.03, 2], "material": "metal/painted/metal-029",
  "surface": { "faces": { "3": { "media": { "url": "https://media4.giphy.com/media/…/giphy.webp", "autoplay": true, "loop": true, "since": 1793145600000 } } } } }
```

| Field | |
|---|---|
| `url` | An https address, 512 characters at most: a video (MP4, WebM) or an animated picture — told by its ending: `.webp`, `.gif`, `.png`, `.apng`, `.avif` |
| `autoplay` | `true`: plays by itself where its host is trusted (GIPHY's) or for its owner; anyone else starts it once with a click (▶) |
| `loop` | `true`: starts again at its end |
| `since` | When it began, ms since 1970: every person sees the same frame at the same time |
| `volume` | 0–1, a video's sound, heard from its face |
| `playing` | `false`: stopped where it is |

- **A GIF is its MP4**: the lightest file, played as a video. **A sticker is its animated WebP**: it
  keeps its transparency and is cut out where it is clear; a sticker's MP4 has none and comes on
  white. Never a GIF's `.gif`: heavier (one sticker: GIF 1.09 MB, WebP 615 KB, MP4 105 KB) and 256
  colours.
- **From GIPHY**: in the editor, Materials → GIPHY (GIFs or Stickers, searched, one click). For a
  build file, GIPHY's search API — `https://api.giphy.com/v1/gifs/search` or
  `https://api.giphy.com/v1/stickers/search`, with `api_key`, `q` and `rating=g` — and of each result
  `images.original.mp4` for a GIF and `images.original.webp` for a sticker, with
  `images.original.width` and `height` for its proportions. Use the address as GIPHY gives it:
  never rewritten, copied or proxied.
- **Give the face the file's proportions**: the frame covers the face whole, so 480 × 270 wants a
  16:9 face and 480 × 480 a square one. It reads as it is seen from in front of the face: upright,
  not mirrored. A box shows it on its front (+y) as face 3 and on its back (−y) as face 1.
- **Only the faces that need it**: the 8 nearest faces with media are shown at once, 4 videos at
  most among them. The rest show their own material (a video's face) or nothing (a picture's) until
  they are among the nearest. `media` on a whole surface takes all six faces of a box.
- **Light**: a video lights itself and a little round it. A picture is lit as its face is (dark at
  night) and casts no shadow.
- **Distance**: it plays within 30 m, when on screen at least 64 px tall.
- **Safari**: it has no `ImageDecoder` yet, so a sticker shows its first frame there, still.

#### Live media: a voice zone, a screen, a file drop, a mirror

A prim may carry a live module, people's own media peer to peer for whoever comes near — `"live": { "type": "voice" }`
(whoever stands within `radius` m hears the others on air), `{ "type": "screen", "face": 3 }` (that face shows a
camera or a screen someone shares), `{ "type": "drop" }` (a file dropped on it reaches everyone near, or with
`"to": "owner"` its owner alone). Each takes `"who": "anyone" | "owner"` (who goes on air), `radius` (m) and
`quality` (voice kb/s, a screen's height in px, a drop's largest file in MB); a screen also `fps`. Values are held
to their ranges. Put a screen on a thin panel facing where people stand; a received screen counts as a video
(4 play at once). Nothing to stream is in the file: people bring it. And `{ "type": "mirror" }`: its `face` (3, +y, by
default) a mirror of the bank's `look` — `reflects`, `on` and `radius` as above, Mirrors —, nothing on the wire.

#### Pages: HTML on a face

A sign, a menu, a board of scores, a vote, a guestbook: HTML and CSS of its own, 8,192 characters at
most, drawn by each viewer's browser into the face's texture, lit as the face is and the same for
everyone — in the editor, Materials → Page (its Example to start from); in a build file, `page` in its
surface. Give it to one face (a board's front), not a whole box.

- **Size**: it is laid out in its face's own shape — a 1.6 × 0.9 m face is a 1024 × 576 px page —,
  so size what is in it in `cqw` and `cqh` (`vw` and `vh` become those). Its `body` is the page.
- **Data**: `data` holds what its `{{name}}`s show, as text.
- **Shown**: as far as builds are drawn. The eight nearest faces with a page or media, within 30 m and
  at least 64 px tall on screen, are drawn as they change — a page's drawings 2 % of the GPU at most.
  Every other page — farther, smaller, past those eight — shows still: its last drawing made smaller
  once and mipmapped, drawn again when it changes at most once a second, 32 at once, the nearest. Media
  past the eight shows nothing till nearer.
- **Used as a page is**: a click lands on what is drawn under it. A field (text, search, number, a
  `textarea`) takes the keyboard — nothing typed moves the avatar, Esc lets it go —, a box or a radio
  is ticked, a slider slid, a `<details>` opened, a link to an `#id` of its own brings it into view;
  the wheel scrolls what scrolls. All that is each viewer's own, as on a web page.
- **Nothing runs, comes from elsewhere or is filled in**: its own `<script>`s never run, nor handlers;
  no links to elsewhere, no `url()`, images only as `data:` URLs, no `@media`, `@font-face` or
  `@import`, no CSS animations, nothing that blurs (`backdrop-filter`, a filter's `blur()` or
  `drop-shadow()`). No password, file or submit field and no `select`; an `email`, `tel` or `url`
  field is typed as text, and only a box or a radio keeps its `name` (it groups them).
- **Charts**: `<chart type="bar" data='{"Mon":12,"Tue":8}' colors="#fca311 #3a86ff">` — `type`
  bar, line, area, pie, gauge or graph; `data` a JSON object of labels and numbers, 32 at most (a gauge
  takes `value`, `min` and `max`, 0–100 unless said; a graph `{"nodes":[{"id":"a","label":"Alice",
  "group":"relay"}],"links":[{"source":"a","target":"b"}]}`, 200 nodes and 400 links at most, coloured by
  group or a node's own `color`, laid out by OVGrid); `colors` hex, by space or comma. OVGrid draws it as SVG
  in the page's colour and font, sized by the page's CSS — `chart { width: 90cqw; height: 60cqh }` — (16:9 of
  its width unless said). Fill its
  numbers from the page's `data` — `data='{"Yes": {{yes}}, "No": {{no}}}'` — and the script that keeps
  them changes the chart for everyone. No chart library or script of its own: none would run.
  New data eases in by itself, 0.3 s: each bar, point, slice and the gauge's needle from its old value to its
  new by its label, a graph's nodes by their id to their new places, what comes in growing and what goes
  shrinking. Keep the labels and ids the same from one change to the next, and data that changes every
  second animates smoothly; new labels each time only come and go.
- **Actions — counting, signing, voting with no script**: a few verbs in its attributes that OVGrid
  does, each click the clicker's own entry, signed by them and theirs alone, the same for everyone.
  `data-on-click` on what is clicked — or on what holds it: `add visits 1` (a sum), `set vote day` (a
  choice), `toggle like` (on or off), `push book name` (a line: what is typed in the field whose `id` is
  `name`), `remove book` (one's own entry gone). `data-show` on what shows it: `visits` (the total; a
  choice's — how many chose —, a toggle's — how many have it on —, a list's — its lines), `vote.day` (how
  many chose `day`), `book.last` (who was last: the name they go by and their address, shortened),
  `book.when` (when, in each viewer's hours). A list of what was written, newest first, with who and when
  — `<list data-show="book" data-limit="8"></list>`, styled by the page's CSS as `list` and `list p`.
  One entry a name a person: a vote changed, not added; a person's last 20 lines. Names letters, digits,
  `.`, `-`, `_`, 32 at most; a choice 64 characters, a line 256; 16 names a page. Only whoever is signed in
  acts, a person's writes one a second at most — what they do between shows at once and goes with the
  next: each entry is a node of the world's graph. A page may have both: its actions, and a script for
  what they cannot say.
- **Cards that move — a kanban, notes on a board**: `data-drag="report"` on what may be moved,
  `data-zone="done"` on where it may go. Walking, one presses it within reach, holds it and moves the
  pointer: let go over a zone, it goes into it, else it stays where it was let go — for everyone, the
  latest move winning, as any action (`set report done`). Give each card a name of its own; style zones and
  cards in the page's CSS.

```html
<div class="zone" data-zone="todo"><div class="card" data-drag="report">Write the report</div></div>
<div class="zone" data-zone="doing"></div><div class="zone" data-zone="done"></div>
```
- **What people add — notes, cards, things to do**: the lines of a `<list>` are items anyone who writes
  on the page adds (`push`). `<list data-show="cards" data-drag>` lets anyone move them — into a
  `data-zone`, or anywhere on the page —; `<list data-show="todos" data-check>` lets anyone tick them done
  and back with a click. Each line says where it is, `data-state="done"`, for the page's CSS:
  `list p[data-state="done"] { text-decoration: line-through }`. A kanban:

```html
<input id="card" placeholder="A new card"><button data-on-click="push cards card">Add a card</button>
<section data-zone="todo"><h2>To do</h2><list data-show="cards" data-drag></list></section>
<section data-zone="doing"><h2>Doing</h2></section><section data-zone="done"><h2>Done</h2></section>
```
  In the editor, the Boards icon places a Notes board, a To-do list, a Kanban, a Vote or a Drawing board
  in one click, ready to use.
- **Drawing**: `<drawing data-show="ink"></drawing>` — OVGrid fills it with what everyone drew, pens of
  four colours and an eraser at its top left, and a Clear for the board's owner; walking, one presses on it,
  holds and moves the pointer. Size it in the page's CSS (`drawing { width: 96cqw; height: 92cqh; aspect-ratio:
  auto }`), white unless its `background` says. `data-owner` on any element shows it to the page's owner alone.
- **Who writes on it, and what stays — its owner's**: `"writers": "owner"` in the page (only its owner, a
  notice board), or a list of addresses (a class: those and its owner), or none (everyone signed in) —
  also set in the Page tab, which adds everyone near with one click. Its owner hides a line, shows the
  hidden again or clears a name for everyone from the Page tab; `data-on-click="clear book"` in the page
  does the same, for its owner alone.

```html
<button data-on-click="add visits 1">I was here · <b data-show="visits"></b></button>
<input id="name" placeholder="Your name"><button data-on-click="push book name">Sign</button>
<p>Last: <span data-show="book.last"></span> at <span data-show="book.when"></span></p>
<list data-show="book" data-limit="8"></list>
<button data-on-click="set vote day">Day · <b data-show="vote.day"></b></button><button data-on-click="set vote night">Night · <b data-show="vote.night"></b></button>
<button data-on-click="clear book">Clear the book</button>
```

```json
"page": { "html": "…", "writers": ["0x3546d4ba0ac3bfdea3f1511f82a078dddb3f4931", "0x8089c0480139d85d82c1e20eef08a77ef8cd7dec"] }
```
- **Drawn through an effect** — OVGrid's own, no shader code in the page: `"effect": { "name": "crt" }` in
  the page, one of `liquid-glass` (a glass lens where the pointer is), `elastic-bulge` (the page bulging at
  the pointer), `chromatic` (an RGB split round the pointer), `crt`, `glitch`, `vhs`, `halftone`, `ascii`;
  `intensity` (0–3), `speed` (0–4), `size` (0.25–4) and `color` (`#rrggbb`, multiplying its own tint)
  each 1, or white, as on html-in-canvas.dev — their cells, dots, scanlines and splits as large on screen at
  any distance as on the site at full screen. Also in the editor's Page tab. For a sign that should stand
  out — a CRT clock, a retro arcade board —, not on every page.
- **By night**: give its face `emissive: 1` and it lights itself, white round it, as a sign does — the
  editor's Page tab does so when it makes one; leave it off for a page lit only as its face is.
- **What it does for everyone is the part's `script`** (effects.md): a click is heard with `target`,
  the `id` of the element it fell on, and `values`, the page's fields as the clicker had them — by
  `id`, a box's or a radio's by its `name`, 16 at most, text 256 characters at most. The script keeps
  the page's `data` for everyone:

```json
{ "name": "vote", "shape": "cube", "at": [0, 0, 1.9], "size": [2.4, 0.04, 1.35], "material": "metal/painted/metal-029",
  "surface": { "faces": { "3": { "page": { "data": { "yes": 0 },
    "html": "<style>body { background: #14213d; color: #fff; font: 12cqh system-ui; text-align: center } button { font: inherit }</style><button id=\"yes\">Yes · {{yes}}</button>" } } } },
  "script": "on('click', ({ target }) => { if (target === 'yes') keep({ surface: { faces: { 3: { page: { data: { yes: (get().surface.faces[3].page.data.yes ?? 0) + 1 } } } } } }) })" }
```

A guestbook's script reads what was typed — an `<input id="guest">` and a `<button id="sign">`, its
`{{last}}` the last name signed:

```js
on('click', ({ target, values }) => { if (target === 'sign' && values?.guest) keep({ surface: { faces: { 3: { page: { data: { last: values.guest } } } } } }) })
```

### Light

```json
"light": { "on": "night", "range": 7, "color": [1, 0.72, 0.42], "intensity": 0.9, "cone": { "angle": 60, "softness": 0.4 }, "flicker": 0 }
```

- Without `light`, a part whose faces emit (`emissive`, or a bank material that glows) lights what
  is round it by itself: its colour, as bright as its brightest face, as far as its area says.
- `on`: `true` (default), `false` (off: its emission and glow off too — a lamp switched off), or
  `"night"` (on once the sun has set where it is, its emission with it).
- `range`: m, 0–10 (held to 10). `0`: it lights nothing round it but still glows — a lantern for
  looks, a strip of light, at no light's cost. On at night (`"night"`) or in a `zone`, such a light
  still comes on and goes off as the others do and follows its zone's switches: an LED strip on a
  switch.
- `color` linear RGB, `intensity` 0–1; `cone`: a spot down the part's own −z, `angle` half its
  width 1–90°, `softness` 0–1; `flicker` 0–1, a flame's.
- `zone`: the name its object's light switches switch it by (lower case, up to 32 characters): a
  room's (`"salon"`), a deck's. A light in no zone is never switched by hand: a navigation light, a
  lantern for looks. See *Lights on switches, by zone* below.
- Switched on with nothing emitting, a part is a lamp of its own: white, 1, 10 m unless it says.
- **Walls stop a light when they are parts of its own object**: a lamp in a room is a part of the
  house's object. Glass lets it through. Keep a lamp outside short of other buildings' rooms.
- **A lamp's own fixture lets its light through**: its own part, and any part no larger than a
  metre that holds it — a lantern's globe, its cage. Keep a cage in its light's part or in one of
  its own: gathered with the post into a larger part, it closes round the light as walls do, and a
  light walled in stays lit by day, where one in the open fades out as the sun rises.

### Collisions and behaviours

Everything is solid and drawn unless it says otherwise. The avatar is a capsule 1.8 m tall and
0.6 m wide: it steps up 0.3 m and stands on slopes to 50°. Kinds bring colliders of their own;
prims collide as their mesh, its hull when convex.

- `"phantom": true` — drawn, walked through: curtains, hanging leaves, light beams, water to wade in.
- `"collisionOnly": true` — bumped into, not drawn (faintly, in build mode): an invisible wall, a
  smooth ramp over stairs, a rail round a roof. One or the other, never both.
- `"climbable": true` — walked into, a wall of it as steep as a rock face (52° or more) is climbed
  as one is: W up, S down, A and D along it and round its corners, over its top: a climbing wall, a
  ladder's face, a cliff that is built. Everything else stops the avatar as a wall does.
- `"bouncy": true` — whoever lands on it is thrown back up, 80 % as hard as they came down, 3 m high
  at most: a trampoline, a bouncy castle's floor. Or how: `{ "trigger": "step", "height": 6, "give": 80,
  "along": "own" }` — `trigger` `"landing"` (the default) or `"step"`, thrown as soon as stepped on (a
  jump pad); `height` 0.5–30 m, stepped on, that high every time; `give` 0–100 % of a landing given back
  (100: as high each time); `along` `"up"` or `"own"`, along its own up, so that tilted it throws one
  across (a launch pad). Either goes with any of the above.
- `"behaviour": { "type": …, …parameters }` — what it does by itself, the same for every peer
  whether its owner is there or not; on a prim, on an object (in `objects`) or on a clone. Every
  type, its parameters with their ranges and defaults: catalog.json → `behaviours`.

  | Type | Does | Parameters |
  |---|---|---|
  | `door` | swings open and shuts by itself; a `door` kind opens its own leaf, up to 110° | `angle`, `hinge`, `trigger` — `"click"` (within 5 m), `"near"` (someone within `reach` m; it shuts once all have gone) or `"both"` — `reach` (m, 2.5), `time`, `stay` (s after a click; 0: until clicked again); prims only |
  | `slide` | slides aside and back by itself: a sliding door, a window, a hatch | `x`, `y`, `z` (m, its own axes), `trigger`, `reach`, `time`, `stay` |
  | `spin` | turns round its own z all the time: a sign, a windmill's sails, a carousel | `speed` (°/s) |
  | `bounce` | hops along its own z and falls back, over and over, as a ball does: a ball, a toy, a sign that jumps | `height` (m, 0.05–20) |
  | `move` | goes to a point and back, waiting at either end: an elevator, a ferry, a platform | `x`, `y` (m, ±64), `z` (m, −64 to 100 km), `speed` (m/s), `ease` (`"smooth"`, the default: eased over its whole way, `speed` its average; `"accel"`: speeding up at `accel` and slowing down at `decel`, m/s² — over speed² / (2 × either) m — `speed` its fastest), `wait` (s) |
  | `call` | on a click, brings what goes and comes back near it down where it is kept at once, to set off again from there: a call button by a platform; a `lift` near it, to its stop nearest the button | `reach` (m, 8: how near it what it calls is kept) |
  | `lift` | goes from stop to stop up and down its frame on a click — on it, or on a call button by a stop — and waits there till it is called again: a platform lift, an elevator; the parts of an object whose lift has the same `group` go as one (a platform, its rails, its buttons) | `stops` (up to 8, m up its frame from where it is kept, below 0 down: a floor each), `speed` (m/s, 0.8), `group` (a name its parts share), `button` (`"none"`: a click on it does nothing — its floor, its rails —; `"next"`, the default: on to its next stop, back from either end — one button for down and up —; `"stop"`: to its `stop`, 0 where it is kept — a button a floor) |
  | `switch` | switches its object's lights in its zones, for everyone: on a click on or off — a switch by a room's door, one for a floor, one for every light — or, `"near"`, a presence detector: on while someone stands under it on its floor, off once all have gone; prims only | `zones` (a list of zone names, or `"all"`: every light of its object in a zone), `trigger` (`"click"`, the default; `"near"`; `"both"`), `reach` (m, 4: how far across under it a presence detector senses), `stay` (s, 30: how long its lights stay on once all have gone) |
  | `belt` | carries whoever stands on it along its own y: an escalator, a walkway | `speed` (m/s) |
  | `passage` | a click on it, or E, takes whoever aims at it in or out, standing: from outside its object to its place inside — into a vehicle by a click on its hull —, from inside out across its thinnest side onto what is there — out by its door; inside its object is within the box round its solid parts' middles | `way` (`"both"`, the default; `"in"`: only in, its hull; `"out"`: only out), `x`, `y`, `z` (m, in its object's frame: where one stands going in, on its floor), `depth` (m, 1: how far past it one stands going out) |
  | `route` | goes through its points on a smooth curve, round and on again or there and back, stopping a while at each if asked: a boat on a tour, a train on its line | `points` (up to 64, `[x, y, z]` m in its own frame — or `[x, y, z, hx, hy, hz]`, gone through along its handle, leaving towards its tip; `[x, y, z, 0, 0, 0]` a corner, where it slows to a stop and turns), `speed` (m/s), `stop` (s), `at` (`"each"`: stops at every point; `"ends"`: only where it is kept and, there and back, at its last), `mode` (`"round"`, `"back"`), `face` (`"yes"`: turns to where it goes), `water` (`"yes"`: keeps its height over the sea), `name` (what this route is called among its routes; none, Route 1), `routes` (up to 7 other routes kept to be run instead, `{ name, points, speed, stop, at, mode, face, water }` each) |

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
  turn), `bounce` hops along it, `move` and `slide` go along its own axes. Parameters left out take
  their defaults.

- **Lights on switches, by zone**: give each light its room's `zone`, and put a switch by each of the
  room's doors — any small prim with `"behaviour": { "type": "switch", "zones": ["salon"] }`, about
  1.1 m over the floor and a little proud of the wall. Two switches with the same zones are a two-way
  switch; one naming several zones switches a floor; one with `"zones": "all"` every light of its
  object (by the front door, at a helm). Lights `"on": "night"` still come on at nightfall and go off
  at daybreak by themselves; switched by hand, they stay as they were left till the next nightfall or
  daybreak; whatever switched a light last, it wins. Every peer sees them alike, and the owner's
  page keeps the last switching, so that whoever comes within 12 hours finds them so.
  A **presence detector** (`"trigger": "near"`) goes on a ceiling: it senses who stands under it on
  its own floor — up to 3.5 m below it and `reach` m across, nobody on the floor over it — and keeps
  its zones off till someone comes, then on as far as each light's own `on` lets it (`true`: any time;
  `"night"`: at night only), and off `stay` s after the last has gone. Give a switch a faint glow that
  lights nothing round it, to be found in the dark.

  ```json
  "prims": [
    { "name": "salon lamp", "shape": "cylinder", "at": [0, -1, 2.78], "size": [0.16, 0.16, 0.04],
      "light": { "on": "night", "range": 10, "zone": "salon" } },
    { "name": "salon switch", "shape": "cube", "at": [3.6, -4.07, 1.1], "size": [0.09, 0.015, 0.14], "color": [0.6, 0.62, 0.64],
      "surface": { "emissive": 0.15 }, "light": { "on": true, "range": 0 }, "behaviour": { "type": "switch", "zones": ["salon"] } },
    { "name": "every light", "shape": "cube", "at": [-3.6, -4.07, 1.1], "size": [0.09, 0.015, 0.14], "color": [0.6, 0.62, 0.64],
      "behaviour": { "type": "switch", "zones": "all" } },
    { "name": "hall detector", "shape": "hemiSphere", "at": [0, 4, 2.77], "size": [0.12, 0.12, 0.05], "turn": [180, 0, 0],
      "behaviour": { "type": "switch", "trigger": "near", "reach": 6, "stay": 30, "zones": ["hall"] } }
  ]
  ```

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
- **Dry inside**: an object with `"dry": true` — a dome, a base, a room built under the sea — has its
  inside, the box round its largest parts, kept from the sea's water: no fish through it, no water in its
  air, no sun nor caustics in it, no surface seen from under it, whoever is in it dry, in what of it rises
  over the sea's level too — and, the camera inside, all of it seen in that air, whatever its shape: a
  tower, a lift's shaft, a tube rising from it; the camera zoomed out of it, what is inside still seen through
  its glass in its air, the rest from the water as all is. Make its
  shell and floor its largest parts. Without it, what is built under the water is flooded however closed
  it is — a wreck, swum through —: give it to anything meant to be walked in under the sea. Its clones are dry too. A submarine is dry by its kind (vehicles.md); nothing
  that is not under the water needs it.
- **A clone** `{ "of": "<object's name>", "at": …, "turn": … }` draws that object's parts again in
  a frame of its own. Nothing is copied: change the object and every clone changes. Use it for
  whatever repeats unchanged: lamps, benches, fence sections, identical houses.
- **A tree** `{ "species": "oak", "at": [x, y], "scale": 1, "seed": 3, "turn": 40 }`: a species of
  catalog.json → `species`; the variant drawn is `seed % 6` (each variant's height and crown are in the
  catalog); `scale` 0.25–4; `turn` ° about z (none: one its seed gives); `seed` defaults to one from
  the build's name and the tree's place in the list; `key`, optional, what the build knows it by
  (letters, digits, dots, dashes): imported again, the tree is found by it, wherever the list now puts
  it — give one to every tree of a build that will be patched. `params`, optional: that one plant shaped on its
  own, as a species' parameters are — `"glow": 0.6` lights its leaves and flowers (a magic world's),
  `"flower": [r, g, b]` its flowers' colour, `"leaf"`, `"bark"`, `"branches"` … (catalog.json's
  species list what each has); its trunks: `"trunks"` (1–8), `"lean"` (0–85°), `"fan"` (20–360°:
  less leans them to one side, its heading's), `"spread"` (0–3 m between feet), `"bend"` and
  `"topBend"` (±120° along the lower half and the upper: one each way an S) — a palm leaning over a
  beach `{ "lean": 60, "fan": 30, "bend": -50 }`, a clump `{ "trunks": 4, "lean": 30 }`. `script`,
  optional: its script's source (a string), run by every peer near it — a plant's sets its look alone,
  `tint` and `glow` (`on('night', () => set({ glow: 0.8 }))`); `tint` and `glow`, optional, that look
  as its script keeps it.

### Land

The planet's ground itself can be shaped: a build may carry its own ground, which is placed with it as
the planet's ground, edited, wherever it is imported — a hill a castle stands on, a flattened yard.

```json
"land": { "at": [-83, -83], "step": 1, "size": [167, 194], "heights": "<base64>" }
```

- A grid of heights in the build's frame: `at` the first sample's place (its lowest x and y), `step`
  the metres between samples (0.25–8), `size` how many along x and along y (at most 512 × 512);
  `heights` the samples row by row from the first, each an int16 of centimetres over the frame's
  origin, little-endian, base64 — −32768 where the planet's own ground stays.
- A build that carries land stands its frame on the planet's own ground under its anchor; its land is
  counted from there. Its objects stand on the land as written: give them their z over the origin.
- Only the parcel's owner may shape its land: imported by anyone else, the build is placed and its land
  is not (said in the console). Within +32 m and −32 m of the planet's own ground.

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
triangles, a sculpt hundreds. **Make a sculpt only when the person asks for one**: a curved or
organic shape is otherwise a solid, faceted — a revolve, an extrude, a loft or a sweep of its profile,
a large smooth curve a coarse cage smoothed near (format.md, «Choosing a recipe»).

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


## 3. Recipes by form: carve, gather, clone

Whatever you build — a house, a bridge, a boat, a tower, a market stall, a well, a fence — it is a few kinds of form, and
each form has its recipe. Name the form first, take its recipe, and never write one part for each plate, leg or rung. Every
part is a record each peer signs, keeps and sends, and the budget's *fair* is a ceiling, not a target: a build is judged by
how few parts hold its form (the reference village is 65 parts, rethought, where its prims were 535). None of these needs
code, only boxes, cylinders and cuts; what is curved by more than a cylinder's sides — a dome, a hull — wants points packed
by a program (format.md, *Bodies of their own points*). *Gather*, here, is format.md's: plates that meet nowhere, side by side in
one part; it is not the rule's *never gathered*, which is old pieces copied as they were.

**Carved blocks are preferred.** A carve has no seams where pieces meet; pieces do. So never leave:

- **overlaps**: pieces of one surface laid across each other, as a wall's boxes at its corners or round its openings, whose
  faces flicker where they meet (a post, a pier or a footing that runs into what it meets is no overlap: it hides the joint);
- **boxes that touch round an opening**: a wall of boxes round a door, a window or an arch; cut the opening in one block;
- **two faces in one plane**: they flicker; make the two one block, or offset one by 1–2 cm;
- **open joints between a wall and its opening**: a gap or a lip where a door, a window or an arch meets its wall; the
  kind's box is exactly the `cut`, and a `cut` reaches past both faces.

| The form | Its recipe | Seen in | Parts |
|---|---|---|---|
| A mass with hollows in it and openings through it | **Carve** one `solid`: a box the size of the mass, its rooms, bays and openings `cut`, what the cuts leave a colour, what must stay `add`ed back after | a house, a tower, a gatehouse, a bridge's pier or abutment, a ship's cabin, a kiosk, a kiln | 1 |
| A basin, a trough, a ring | carve it: a box minus a box, the cut's colour dressing its inside | a pool, a well, a planter, a fountain's basin, a moat | 1 |
| A plate with holes in it | one box `solid` and its `cut`s (with code, an `extrude` with `holes`) | a wall with its windows, a floor round its stairwell, a gable, a deck with a hatch | 1 |
| A frame of members: legs, posts, rails, rungs, struts | **Gather** it in one `solid` of `"join": "none"`: the members `add`ed side by side, `mirror` for the other side | a table, a chair, a bed, a stall, a pergola, a scaffold, a rack, a swing, a truss, a cart | 1 |
| A run of the same at a step, or round a point | the same, one body `repeat`ed (`step`, or `around`) | a colonnade, balusters, a fence, steps, battlements, a row of windows, spokes, a ring of lamps | 1 |
| The loose pieces of a room or a yard | the same: each a body, each look a colour | a rug, a table and pots; a row of planters; stepping stones | 1 a group |
| Something turned about an axis | by hand a `cylinder`, `cone` or `ball` of `sides` (6 a hexagon, 16 round enough small); with code a `revolve` of its profile | a column, a barrel, a lamp, a tower, a vase | 1 |
| Something along a path: a rail, a pipe, a beam, a bend | by hand short straight bodies turned at each bend; with code a `sweep` | a handrail, a pipe, a curved beam | 1 |
| A curved shell along an axis | with code a `loft`; by hand faceted, a few boxes and wedges | a boat, a plane, a vault | 1 |
| What has a kind | the **kinds**, in the openings the carve leaves | doors, windows, stairs, fences, roofs, columns, arches, rocks | 1 each |
| What repeats far apart | one object and its **clones** | chairs round a table, alike houses, a lamp down a lane | 1 and a transform each |
| What a solid cannot carry | a part of its own: a light with a range, a behaviour, a script, `phantom`, `climbable`, `bouncy`, a tree. A `seat` is a target on the gathered piece: `"seat": { "at": [x, y, z], "turn": 0 }`, the hips there, from the part's middle | | 1 |

**How many.** What is built is a handful of parts — a cottage with its door and window is four —, what is furnished a part a
piece or a part a room, a village of five houses 65. For one house with its furniture, past a hundred of your own, clones aside, something is piled: a wall of
boxes round a gap, a part to a leg, a row of identical parts side by side. Count them before you give a build, and say why any
place keeps several boxes.

**Parts are not draws.** A gathered solid wearing textures is a mesh of its own, where prims of one shape share one (format.md,
*Choosing a recipe*, per frame). So gather what is plain or of few looks, clone what repeats, and for a build of many gathered
textured solids look at the check's *distinct meshes* and measure it (budget.md) before you give it.

How a solid is dressed (every recipe below uses it):

- Face 0 is the box's own: the outside. A body's `colour` (1–7) names the face it leaves: what a `cut` leaves inside is
  colour 1, a floor plate `add`ed is colour 2. `colours` is the number of the last one used (0 one look, 2 three); `surface.faces` dresses each, as it
  dresses a cube's. A body with no `colour` leaves the box's own look.
- The part's own `faces`, a colour for each side of a box base in the order −x +x −y +y −z +z, dress one side alone:
  `[0, 0, 0, 0, 1, 0]` is a slab with its underside colour 1, `[3, 3, 0, 0, 0, 0]` a block whose two ends are wood.
- Numbers, then looks: `colours`, a body's `colour`, the part's or a box body's `faces` and a body's `spots` only say which
  colour number each face is; `surface.faces` says what each number looks like — its `texture`, its `emissive` —, as it does
  for a cube's faces.
- Bodies work one after another, each in metres about the part's middle: cut the rooms, cut the openings, `add` back what the
  cut took. A `cut` reaches past the faces it cuts through (0.6 m through a wall 0.2 m thick); where a cut leaves a floor, a
  skirting or a reveal its own look, cut it in a body of its own colour.
- `mirror` copies a body across the part's middle (`"x"`: left to right); `repeat` makes `count` copies, each `step` on. A body
  mirrored is mirrored across the *part's* middle: a leg mirrored makes the pair of a piece centred in its part.
- Keep every body inside its part's box, its `size`: the box round them all. What must reach past it is a part of its own.
  Gather what is seen together, a room's pieces or a yard's: a part is culled whole.
- In a `join: "none"` solid nothing is merged: two bodies that meet in one plane flicker there, as two parts would. Let them
  meet edge to edge, or leave `join` out and they are joined into one surface.
- At most 32 bodies and 3,072 characters written out to a solid: what does not fit one is two.

### A mass, carved

A cottage of 8 × 6 m: its box 4 m high, 0.8 m of it a footing under the ground, its room `cut` 7.6 × 5.6 × 2.8 m from 0.2 m
over the ground (walls 0.2 m, a ceiling 2.8 m clear, 0.2 m of roof left in the block), the door's opening and the window's
`cut` through the front wall (+y), a floor of boards `add`ed last. Colour 0, the outside, is concrete; colour 1, what the room's cut leaves, plaster; colour 2 the boards. The door
and window kinds fill the openings, their boxes exactly the openings, turned 180° in a wall facing +y. The roof is a
`cube` with its eaves, its underside (face 5) the soffit. Four parts, where boxes round each opening took many.

```json
{ "name": "cottage", "at": [0, 0, 0], "prims": [
  { "name": "shell", "kind": "solid", "at": [0, 0, 1.2], "size": [8, 6, 4], "colours": 2, "material": "plaster/concrete/concrete-046",
    "surface": { "faces": { "1": { "texture": "plaster/plaster/plaster-001" }, "2": { "texture": "wood/floor/wood-floor-051" } } },
    "bodies": [
      { "cut": "box", "at": [0, 0, 0.4], "size": [7.6, 5.6, 2.8], "colour": 1 },
      { "cut": "box", "at": [0, 2.9, 0.2], "size": [1.2, 0.6, 2.4] },
      { "cut": "box", "at": [-2.2, 2.9, 0.55], "size": [1.6, 0.6, 1.2] },
      { "add": "box", "at": [0, 0, -0.99], "size": [7.6, 5.6, 0.02], "colour": 2 } ] },
  { "name": "roof", "shape": "cube", "at": [0, 0, 3.325], "size": [9, 7, 0.25], "material": "plaster/concrete/concrete-046",
    "surface": { "faces": { "5": { "texture": "wood/planks/japanese-cedar-planks" } } } },
  { "name": "door", "kind": "door", "at": [0, 2.9, 1.4], "size": [1.2, 0.2, 2.4], "turn": [0, 0, 180], "style": "glazed", "hinge": "right",
    "material": "metal/painted/metal-029", "surface": { "faces": { "2": { "texture": "glass/clear/float" } } },
    "behaviour": { "type": "door", "trigger": "both", "reach": 2.5, "stay": 8 } },
  { "name": "window", "kind": "window", "at": [-2.2, 2.9, 1.75], "size": [1.6, 0.2, 1.2], "turn": [0, 0, 180], "columns": 2, "rows": 1,
    "material": "metal/painted/metal-029", "surface": { "faces": { "2": { "texture": "glass/clear/float" } } } } ] }
```

### Carve, then `add` back what the cut took

A block of a storey (8.2 × 7 × 3 m) whose room is cut right through it, floor to roof and out through the front, so that
the front is open for glass: the two cheeks of wood that stay at the corners are `add`ed back, and so is the boards' floor.
Its two ends are wood by `faces`, its inside plaster by the cut's colour.

```json
{ "name": "upper block", "kind": "solid", "at": [0, 0, 1.5], "size": [8.2, 7, 3], "colours": 3, "faces": [3, 3, 0, 0, 0, 0], "material": "plaster/concrete/concrete-046",
  "surface": { "faces": { "1": { "texture": "plaster/plaster/plaster-001" }, "2": { "texture": "wood/floor/wood-floor-051" }, "3": { "texture": "wood/planks/japanese-cedar-planks" } } },
  "bodies": [
    { "cut": "box", "at": [0, 0.2, 0], "size": [7.6, 6.8, 3.2], "colour": 1 },
    { "add": "box", "at": [-3.6, 3.35, 0], "size": [1, 0.3, 3], "colour": 3 },
    { "add": "box", "at": [0, 0.1, -1.49], "size": [7.6, 6.6, 0.02], "colour": 2 } ] }
```

### A basin

A pool, a well's curb, a planter: a box with a box `cut` from its top, the cut's colour the tiles that line it. Here 10.2 × 5 m
with its coping, 9 × 4 m of basin, its floor 0.04 m over the ground; the water is a `cube` of its own, `phantom` to wade in.

```json
{ "name": "pool basin", "kind": "solid", "at": [0, 0, -0.02], "size": [10.2, 5, 0.56], "colours": 1, "material": "paving/stone/travertine-009",
  "surface": { "faces": { "1": { "texture": "paving/tiles/tiles-132a" } } },
  "bodies": [ { "cut": "box", "at": [0, 0, 0.19], "size": [9, 4, 0.26], "colour": 1 } ] }
```

### A glass front with its door

Floor-to-ceiling glass is the `window` kind, one to a bay: its box the bay (`[width, thickness, height]`), `columns` its
mullions, `rows: 1`, `sill: 0`, its frame the part's material and its glass `surface.faces["2"]`. The door is the `door` kind
in a bay of its own, at least 1.0 × 2.2 m, with a short `window` over it for the transom; the bays meet edge to edge in the
opening the carve leaves, turned 180° in a front facing +y. Glass is seen through: one layer only — no glass railing in front
of a glass wall, no pane behind a pane.

```json
{ "name": "glass front", "at": [0, 0, 0], "prims": [
  { "name": "glass", "kind": "window", "at": [-2.4, 0, 1.6], "size": [3.6, 0.12, 3.2], "turn": [0, 0, 180], "frame": 0.05, "columns": 3, "rows": 1, "sill": 0,
    "material": "metal/painted/metal-029", "surface": { "faces": { "2": { "texture": "glass/clear/float" } } } },
  { "name": "door", "kind": "door", "at": [0, 0, 1.2], "size": [1.2, 0.12, 2.4], "turn": [0, 0, 180], "style": "glazed", "hinge": "right", "frame": 0.06,
    "material": "metal/painted/metal-029", "surface": { "faces": { "2": { "texture": "glass/clear/float" } } },
    "behaviour": { "type": "door", "trigger": "both", "reach": 2.5, "stay": 8 } },
  { "name": "transom", "kind": "window", "at": [0, 0, 2.8], "size": [1.2, 0.12, 0.8], "turn": [0, 0, 180], "frame": 0.04, "columns": 1, "rows": 1, "sill": 0,
    "material": "metal/painted/metal-029", "surface": { "faces": { "2": { "texture": "glass/clear/float" } } } } ] }
```

### A slab with its stairwell

A slab of 8 × 6 × 0.4 m with a stairwell of 1.3 × 4.2 m `cut` through it, its underside (−z) colour 1, the soffit. Start
the hole over the step where the stair's headroom under the slab falls below 2.1 m, and end it where the last tread meets
the slab; leave 1.0 m clear at the stair's foot and at its top, or the way past it is lost. Cut it the stair's width and the
length of the run it rises through, along the way the stair is turned: its railing (face 4) stands above its box, up
through the hole.

```json
{ "name": "slab", "kind": "solid", "at": [0, 0, 3.6], "size": [8, 6, 0.4], "colours": 1, "faces": [0, 0, 0, 0, 1, 0], "material": "plaster/concrete/concrete-046",
  "surface": { "faces": { "1": { "texture": "wood/planks/japanese-cedar-planks" } } },
  "bodies": [ { "cut": "box", "at": [1.5, 0.5, 0], "size": [1.3, 4.2, 1] } ] }
```

### A frame of members, gathered

A chair is its legs (two bodies, each `mirror`ed across x), its seat and its back, in one `join: "none"` solid; `seat` is a
target on it, the hips 0.07 m over its middle. A sofa is its base, its back, one arm `mirror`ed and its cushion, a colour of
its own. A table is its top and two legs `mirror`ed across x. Each piece is written in its own frame, front +y, floor at
z = 0; the six chairs round a table are one chair and five clones.

```json
{ "name": "chair", "at": [0, 0, 0], "prims": [
  { "name": "chair", "kind": "solid", "at": [0, 0, 0.5], "size": [0.45, 0.45, 1], "join": "none", "colours": 1, "material": "wood/planks/oak-veneer-03",
    "surface": { "faces": { "1": { "texture": "metal/painted/metal-029" } } }, "seat": { "at": [0, 0, 0.07], "turn": 0 },
    "bodies": [
      { "add": "box", "at": [-0.19, -0.19, -0.3], "size": [0.04, 0.04, 0.4], "colour": 1, "mirror": "x" },
      { "add": "box", "at": [-0.19, 0.19, -0.3], "size": [0.04, 0.04, 0.4], "colour": 1, "mirror": "x" },
      { "add": "box", "at": [0, 0, -0.075], "size": [0.45, 0.45, 0.05] },
      { "add": "box", "at": [0, -0.2, 0.2], "size": [0.45, 0.05, 0.5] } ] } ] }
```

```json
{ "name": "sofa", "at": [0, 0, 0], "prims": [
  { "name": "sofa", "kind": "solid", "at": [0, 0, 0.475], "size": [2.4, 0.95, 0.95], "join": "none", "colours": 1, "material": "fabric/cloth/terlenka",
    "surface": { "faces": { "1": { "texture": "fabric/upholstery/fabric-0020" } } }, "seat": { "at": [0, 0.08, 0.2], "turn": 0 },
    "bodies": [
      { "add": "box", "at": [0, 0, -0.25], "size": [2.4, 0.95, 0.45] },
      { "add": "box", "at": [0, -0.365, 0.225], "size": [2.4, 0.22, 0.5] },
      { "add": "box", "at": [-1.09, 0, -0.165], "size": [0.22, 0.95, 0.62], "mirror": "x" },
      { "add": "box", "at": [0, 0.08, 0.035], "size": [1.95, 0.7, 0.12], "colour": 1 } ] } ] }
```

```json
{ "name": "table", "at": [0, 0, 0], "prims": [
  { "name": "table", "kind": "solid", "at": [0, 0, 0.475], "size": [2.4, 1, 0.95], "join": "none", "colours": 1, "material": "wood/planks/walnut-veneer",
    "surface": { "faces": { "1": { "texture": "metal/painted/metal-029" } } },
    "bodies": [
      { "add": "box", "at": [0, 0, 0.45], "size": [2.4, 1, 0.05] },
      { "add": "box", "at": [-1.1, -0.4, -0.025], "size": [0.08, 0.08, 0.9], "colour": 1, "mirror": "x" },
      { "add": "box", "at": [-1.1, 0.4, -0.025], "size": [0.08, 0.08, 0.9], "colour": 1, "mirror": "x" } ] } ] }
```

### A run, a row, a room's loose pieces

A run of railing of 4 m: three rails the whole length and one post `repeat`ed five times, 0.9875 m apart. Its `at` is the
middle of the run, 0.525 m over the floor it stands on; for a run along y, turn it `[0, 0, 90]`. Several runs that meet, or
stand apart on one floor, are one part: more bodies, in a box that holds them all.

```json
{ "name": "railing", "kind": "solid", "at": [0, 0, 0.525], "size": [4, 0.06, 1.05], "join": "none", "material": "metal/painted/metal-029",
  "bodies": [
    { "add": "box", "at": [0, 0, 0.5], "size": [4, 0.05, 0.05] },
    { "add": "box", "at": [0, 0, 0.12], "size": [4, 0.03, 0.03] },
    { "add": "box", "at": [0, 0, -0.3], "size": [4, 0.03, 0.03] },
    { "add": "box", "at": [-1.975, 0, 0], "size": [0.05, 0.05, 1.05], "repeat": { "count": 5, "step": [0.9875, 0, 0] } } ] }
```

Four recessed lights 2 m apart, one part: `emissive` with a `light` of `range: 0` glows at night and counts no light. Set
them just under the ceiling, 1 cm below its face, not hanging from it.

```json
{ "name": "lights", "kind": "solid", "at": [0, 0, 0], "size": [6.14, 0.14, 0.02], "join": "none", "color": [1, 0.85, 0.6],
  "surface": { "emissive": 0.9 }, "light": { "on": "night", "range": 0, "color": [1, 0.8, 0.5] },
  "bodies": [ { "add": "cylinder", "at": [-3, 0, 0], "size": [0.14, 0.14, 0.02], "sides": 12, "repeat": { "count": 4, "step": [2, 0, 0] } } ] }
```

A rug, a coffee table and a pot, standing apart, are one part of three looks: the rug's colour 1, the pot's colour 2,
the table the box's own.

```json
{ "name": "rug table pot", "kind": "solid", "at": [0, 0, 0.25], "size": [5.05, 2.85, 0.5], "join": "none", "colours": 2, "material": "wood/planks/walnut-veneer",
  "surface": { "faces": { "1": { "texture": "fabric/carpet/carpet-016" }, "2": { "texture": "plaster/concrete/concrete-025" } } },
  "bodies": [
    { "add": "box", "at": [0.725, 0.025, -0.24], "size": [3.6, 2.8, 0.02], "colour": 1 },
    { "add": "box", "at": [0.725, 0.325, 0.13], "size": [1.2, 0.7, 0.04] },
    { "add": "box", "at": [0.225, 0.325, -0.07], "size": [0.06, 0.6, 0.36] },
    { "add": "box", "at": [1.225, 0.325, -0.07], "size": [0.06, 0.6, 0.36] },
    { "add": "cylinder", "at": [-2.275, -1.175, 0], "size": [0.5, 0.5, 0.5], "sides": 16, "colour": 2 } ] }
```

A bookcase of 1.8 × 0.35 × 2.2 m: a box with five shelves `cut`, one cut `repeat`ed 0.4 m lower each time. The cut reaches
past the front (+y), so the case opens there, and leaves 0.1 m at the sides and 0.075 m at the back.

```json
{ "name": "bookcase", "kind": "solid", "at": [0, 0, 1.1], "size": [1.8, 0.35, 2.2], "colours": 0, "material": "wood/planks/oak-veneer-03",
  "bodies": [ { "cut": "box", "at": [0, 0.1, 0.85], "size": [1.6, 0.4, 0.34], "repeat": { "count": 5, "step": [0, 0, -0.4] } } ] }
```

### What repeats far apart

What repeats far apart is one object and its clones, each a transform:

```json
{ "of": "chair", "at": [5.8, -0.15, 0.2], "turn": [0, 0, 180] }
```

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

**The least a person fits through — an opening the avatar cannot pass is the commonest mistake.** Take these
as minimums, not as a range to land on, a cabin's included. A `door` part's `size` is its frame's outer box and
its clear opening is smaller (width − 2 × `frame`, 0.08 m by default; height − `frame`): a box of 1.0 × 2.2 m
leaves 0.83 × 2.1 m. A person needs 0.8 m wide and 1.9 m high clear, so a door box is at least 1.0 × 2.2 m
outside and 0.9 × 2.1 m inside — never smaller; a doorway cut in a wall, or an arch, the same clear size. A
passage is at least 1.0 m wide (a corridor 1.5 m), headroom 2.1 m under a beam, a loft or a stair landing, and a
step up over 0.3 m is a stair (risers 0.2 m at most), not a ledge.

The same ruler for everything else you build, by how the avatar meets it:

| The avatar… | Size it for it |
|---|---|
| walks through | a door box ≥ 1.0 × 2.2 m outside, 0.9 × 2.1 m inside; a doorway, an arch or a gate ≥ 0.8 × 1.9 m clear (a gate 1.0 × 2.2 m); a passage ≥ 1.0 m, a path ≥ 1.5 m, a bridge, a pier or a pontoon ≥ 2 m, stairs ≥ 1.0 m wide |
| stands under | a beam, a loft, a landing, a sign, a tree's lowest branch ≥ 2.1 m clear; a ceiling ≥ 2.8 m |
| steps on | a step ≤ 0.3 m, a stair riser ≤ 0.2 m (tread 0.28–0.32 m); a deck, a dais or a doorstep over 0.3 m takes stairs; a slope ≤ 50° |
| reaches, clicks, uses | within 5 m for a click; a door opens by itself within 2.5 m; handles, switches and levers at 1.0–1.2 m, a counter 0.9 m, a bar 1.1 m |
| sits, rests on | a seat 0.45 m, a table 0.75 m, a bench 0.45 m, a bed 0.5 m; a railing 1.0–1.1 m, a garden wall 0.9–1.2 m |
| sees, from the camera 4 m behind and 1.4 m up | a room under 4 m across, or a ceiling under 2.8 m, is seen through its walls (composition.md, Room for the camera): open it up; a sign read from 10 m wants letters 0.2 m high or more |
| only looks at | a mountain, a distant tower, a sky: any size, since nothing walks there |

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

Carved blocks are preferred. A wall with its openings is **one `solid`**: a box the size of the wall, each opening a `cut`
that reaches past both faces, `colour` giving what the cut leaves (a reveal, the inside) its own look. A whole house is the
same one size up: a box the size of its walls, floor and ceiling, its rooms `cut` out, its openings `cut` through (recipes.md,
*A mass, carved*). Then fill each opening with its kind, its box exactly the opening: a door `[width, thickness, height]` at
the wall's line, z = floor + height / 2, turned `[0, 0, 180]` in a wall facing +y; a window the same, its sill standing out
of the wall. A roof over the block, its eaves out front and back, its underside (a cube's face 5) the soffit.

Never build a wall as boxes round its openings: boxes that touch round a gap leave **overlaps**, **two faces in one plane**
that flicker, and **open joints between the wall and its door or window**, which a carved block does not have.

### An example: the cottage, as a build

The cottage these rules make — 8 × 6 m, concrete outside and plaster within, a flat roof with its wooden soffit, a door that opens on a click, a window — as one build of one object, carved from one block, four parts, standing on the ground at its origin on a footing 0.8 m deep:

```json
{ "name": "Cottage", "objects": [{ "name": "cottage", "at": [0, 0, 0], "prims": [
  { "name": "shell", "kind": "solid", "at": [0, 0, 1.2], "size": [8, 6, 4], "colours": 2, "material": "plaster/concrete/concrete-046",
    "surface": { "faces": { "1": { "texture": "plaster/plaster/plaster-001" }, "2": { "texture": "wood/floor/wood-floor-051" } } },
    "bodies": [
      { "cut": "box", "at": [0, 0, 0.4], "size": [7.6, 5.6, 2.8], "colour": 1 },
      { "cut": "box", "at": [0, 2.9, 0.2], "size": [1.2, 0.6, 2.4] },
      { "cut": "box", "at": [-2.2, 2.9, 0.55], "size": [1.6, 0.6, 1.2] },
      { "add": "box", "at": [0, 0, -0.99], "size": [7.6, 5.6, 0.02], "colour": 2 } ] },
  { "name": "roof", "shape": "cube", "at": [0, 0, 3.325], "size": [9, 7, 0.25], "material": "plaster/concrete/concrete-046",
    "surface": { "faces": { "5": { "texture": "wood/planks/japanese-cedar-planks" } } } },
  { "name": "door", "kind": "door", "at": [0, 2.9, 1.4], "size": [1.2, 0.2, 2.4], "turn": [0, 0, 180], "style": "glazed", "hinge": "right",
    "material": "metal/painted/metal-029", "surface": { "faces": { "2": { "texture": "glass/clear/float" } } },
    "behaviour": { "type": "door", "trigger": "both", "reach": 2.5, "stay": 8 } },
  { "name": "window", "kind": "window", "at": [-2.2, 2.9, 1.75], "size": [1.6, 0.2, 1.2], "turn": [0, 0, 180], "columns": 2, "rows": 1,
    "material": "metal/painted/metal-029", "surface": { "faces": { "2": { "texture": "glass/clear/float" } } } } ] }] }
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

- **Species by place**: conifers (`fir`, `pine`, `cypress`, `blackPine`, `sugi`) on heights and slopes,
  `redwood` and `dawnRedwood` in damp valleys, broadleaf (`oak`, `maple`, `birch`, `poplar`, `beech`,
  `chestnut`) in valleys and round villages, `plane`, `zelkova`, `camphor` and `hackberry` along streets
  and squares, `willow` and `alder` by water, `feverTree` and `blueGum` where it is hot, `olive`,
  `cypress` and `pine` in the south, palms (`coconut`, `date`, `fanPalm`, `curvedCoconut` leaning over a beach, `dateClump` in an oasis)
  on hot coasts, `spindle` and `christmas` palms in gardens, `dead`
  ones sparingly. One dominant species 60–70 %, one or two others; bushes (`bush`, `oleander`,
  `fern`) at the edges and in gardens.
- **Meadows, beds and borders**: a meadow is `meadowGrass` with `rudbeckia`, `daisy` or `poppy`
  sown loose through it; beds hold `lily`, `gladiolus`, `columbine`, `heather` or `sunflower`, a few
  of a kind together; `sedge` and `papyrus` grow by water, `hosta`, `monstera`, `strelitzia` and
  `cordyline` under palms in a hot garden. These are 0.3–1.3 m tall: 0.4–0.8 m apart, never one alone.
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
- **Each piece of furniture one `solid`**, never a part a leg: its plates `add`ed side by side (`"join": "none"`), a leg
  `mirror`ed, a row `repeat`ed, each look a colour. A table is its top 0.04 m and its legs, one part; a chair its frame
  (legs, seat and back) one part, with its `seat` target; a bed its frame, mattress, duvet, pillows and headboard one part of
  three looks; a shelf a box with its shelves `cut` (one cut `repeat`ed); a rug a box 1 cm thick (`fabric/carpet/…`); a hearth
  a stone box with its opening `cut`; a barrel a cylinder. Bevel (`bevel` kind, `radius` 0.01–0.03) only where hands touch
  and a plain edge shows (recipes.md).
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
7. Two faces in one plane (a floor's top on a footing's top): they flicker. Make the two one block, or offset 1–2 cm.
8. A texture stretched or tiny: `scale` set by hand — leave it out.
9. Spheres sized as boxes (their size is height, depth, width).
10. Too many lights, all at 10 m; a room's lamp in an object of its own, lighting through walls.
11. Glass everywhere: see-through faces are the dearest to draw.
12. One object of a thousand parts, or a thousand objects of one part.
13. Paths straight up slopes, or floating over a bump (lay them in short legs).
14. Trees on paths, in houses, crowns through roofs.
15. Rooms the camera cannot get into.
16. Overlapping pieces of one surface; boxes that touch round a door, a window or an arch; an open joint between a wall and its opening: carve the wall
    as one block (method.md, recipes.md).

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
| parts | 1,500 | 4,000 | each an instance; the reference village is 65, rethought (535 as prims) |
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
JSON. Parts are what a build weighs on every peer — each a record signed, kept and sent to whoever
comes —, so a shape a `solid` makes in one part (a hull, a rail, a wheel and its spokes) beats a
pile of prims. A solid comes to at most 5,000 triangles before its smoothing; each step of smoothing
multiplies what came before it by 4, 9 or 16, held to 5,000 near, its cage alone far away.

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
| Media (videos, GIFs, stickers on faces) | The 8 nearest faces with media get a screen each (18.9 MB of video memory once one is near). A video's new frame is copied in ~0.2 ms, a sticker's in ~0.3 ms (480 × 270). Nothing at all without a face with media near | On a board's front, not its whole surface; a few near one another (format.md, Media) |
| Pages (HTML on a face) | The 8 nearest take the screens with media, drawn when they change — 0.3–0.5 ms a page where the browser has HTML-in-Canvas —, each page's drawings 2 % of the GPU at most and what blurs left out, a texture each (2.4 MB at most); the rest show still, 32 at once, 0.8 MB each, made smaller once and mipmapped; a page that lights itself is a light round it, counted with the lights; an effect it is drawn through costs only its face's pixels, nothing measurable at a board's size (a CRT, Liquid Glass); nothing at all without a face with a page near. An action — a stroke drawn too — is a write in the world's graph — a person's one a second, what they do between going with the next —, and today every write has every peer save the whole graph again (200 ms at 15,000 nodes) | On a board's front; changed by its script a few times a second at most; actions for what people do now and then — signing, voting, a visit —, never a stream (format.md, Pages) |
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

### What to aim at

*Fair* and *most* are ceilings: the editor refuses past *most*, and says so from *fair*. They are not what to aim at. Aim at what a
rethought build weighs: the reference village is 65 parts for five houses and their furniture (535 as prims); a cottage with its
door and window is four; a chair one or two. Count your own parts, clones aside: past a hundred for one house with its furniture,
something is piled (recipes.md). Parts are not draws: a gathered solid wearing textures is a mesh of its own, so look at the
check's *distinct meshes* and measure before you give a build of many.

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
in a list. The presets: `fire`, `smoke`, `sparks`, `steam`, `fog`, `fountain`, `snow` (soft
flecks), `snowflakes`, `rain`, `fireflies`, `magic` (magic dust), `bubbles`, `confetti`, `leaves`
(falling), `exhaust` (a jet engine's or a rocket's flame, straight out of its part). `amount` (0.1–4) is how many, `scale` (0.1–10) how large and how far they go, `tint`
multiplies their colours; any of a preset's own parameters may be given over it. Every name, range
and each preset's own values: catalog.json → `particles`. A string names a kit only: a preset is
`{ "preset": "steam" }`, never `"steam"`.

- **Their shape**, drawn by the shader, no image, sharp however near: `"shape"` is `soft` (a soft
  puff: fire, smoke, steam, fog — the default), `drop` (round end first along its motion: rain),
  `flake`, `sparkle`, `bubble`, `leaf` (petals too, in their colour), `heart`, `confetti` or
  `firefly` (a glow that comes and goes). Any preset takes any shape: `{ "preset": "snowflakes",
  "shape": "heart", "color": [[1, 0.4, 0.6], [1, 0.8, 0.9]] }` rains hearts. `"variety"` (0–1): how
  far each particle's hue strays from its colours — 1 every hue (confetti), 0.1–0.2 a little (leaves).

- **Thrown from the top of the prim**, in a cone round its own +z, then carried by the world's up,
  east and north (`accel`, `drift`). Put the emitter where the effect starts — a chimney's cap,
  the embers, a torch's head, a fountain's nozzle — upright. A `collisionOnly` part throws nothing;
  a `phantom` one does: emitters are phantom.
- **Steady**: leave `since` out and they have always been going. `"on": false` keeps a layer
  switched off.
- **While it runs**: `"running": true` on a layer of a vehicle's part — or of what runs a route —
  throws it only while that runs: driven, here or by another, or on its Auto or its route. It comes up
  over 3 s as it starts and dies away as it stops, as a helicopter's rotors do; still, none of it, at no
  cost. An engine's flame, a car's exhaust smoke, a steamer's funnel. On anything else it never shows
  (the check says so).
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
| `{ "preset": "snowflakes" }` | snow over a place | high over it | an 8 m disc by default; `snow` the same as soft flecks |
| `{ "preset": "rain" }` | a shower under a cloud, a dripping eave, a waterfall's spray | the cloud's or the eave's underside | a 2.5 m disc, drops falling ~7 m; `radius` wider for a field |
| `{ "preset": "fireflies" }` | a garden, a meadow or a pond at night | a slab in the grass (drawn, unseen) | a dozen in a 3 m round, wandering |
| `{ "preset": "magic" }` | a wizard's table, a portal's rim, a wishing well | where the magic is | sparkles in colours, bursting and rising |
| `{ "preset": "bubbles" }` | an aquarium, a cauldron, a bath | the water's floor or surface | rising and wobbling |
| `{ "preset": "confetti" }` | a party, a stage, a wedding arch | at the floor, upright | thrown up in every colour, fluttering down |
| `{ "preset": "leaves" }` | autumn under a tree, a windy lane | in the crown, 4–6 m up | falling, fluttering, drifting east |
| `{ "preset": "exhaust", "running": true }` | a jet engine, a rocket, an afterburner — on a vehicle | the nozzle's face: the part turned so that its +z points the way it blows | whitish to blue and almost see-through, ~2 m long from a nozzle ~0.5 m across; `"scale": 2` for one 1.3 m across; `"alpha": [0.1, 0]` brighter, towards white-hot |

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
| `bounce` | a ball, a toy, a sign that jumps | `{ "type": "bounce", "height": 0.6 }`: up along its own z and back as a ball falls, over and over; whoever stands on it goes with it |
| `move` | an elevator, a lift bridge, a ferry, a moving platform | an object, `{ "type": "move", "z": 3.2, "speed": 1.5, "wait": 4 }` — its own axes, there and back |
| `lift` | a lift between floors that waits to be called: in a house, a tower, a vessel | its platform, rails and buttons, parts of one object, each `{ "type": "lift", "stops": [-3.8, -7], "group": "lift", "button": "none" }` — a floor's button `"button": "stop", "stop": 1` —, a `call` button at each stop |
| `belt` | a conveyor, an escalator, a moving walkway | `{ "type": "belt", "speed": 0.6 }` carries along its own y; stairs rise along their y |
| `passage` | in and out of a vehicle — or anything closed — by a click, standing | its hull's parts `{ "type": "passage", "way": "in", "x": 0.6, "y": 3, "z": 1.6 }` (its floor inside, in its object's frame), its door's `"way": "both"` with the same place: a click on its door from inside puts one out past it |
| `route` | a tour boat, a train, a cart on its round | an object, `{ "type": "route", "points": [[0, 40, 0], [30, 60, 0], [60, 20, 0]], "speed": 3, "stop": 10 }` — through its points and on again (`"mode": "back"`: there and back), turning to where it goes, stopping at each (`"at": "ends"`: only where it is kept) |

- **What people ride carries them**: a behaviour on an object carries the avatar standing on it, and so
  does a part moving inside its object — a lift's platform in a building or a vessel, as it goes.
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
| `on(event, handler, options?)` | `'click'` `({ who, face, target, uv, values })` — who clicked (an address, lower case; null if not signed in), on a page the `id` of the element it fell on, where on the page (across and down, 0–1) and its fields as the clicker had them (by `id`, a box's or a radio's by its `name`); `'near'`, `'away'` `({ who, count })` — someone within `options.radius` m (0.5–32, 5 unless said), and gone; `'day'`, `'night'` — the sun crossing the horizon where it stands, once at start as it is; `'change'` `(props)` — what is kept of it changed |
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

## 6. Interactivity: vehicles — a car, a motorbike, a bicycle, a boat, a ship or yacht, a submarine, a helicopter, a plane, a train

An object one sits in and drives. Its owner, sitting on its seat, drives it — W and S throttle and
brake, A and D steer, Space the hand brake, Escape out — and everyone sees it go, with whoever rides
in it; others may sit on its other seats as passengers. A vehicle costs nothing until it is driven:
then 0.07 ms of physics a frame on its driver's peer alone.

### What makes one

- **The object** says what it is: `"vehicle": { "type": "car" }` — `car`, `bike`, `bicycle`, `boat`, `ship`,
  `submarine`, `helicopter`, `plane` or `train` — and its parameters, each held to its range (catalog.json →
  `vehicles`): a car's `power` (N·m, 50–3,000), `speed` (m/s), `steer` (°) and `mass` (kg); a bike's the
  same; a bicycle's those — `power` its rider's push, `mass` with its rider — and `gear` (how many turns
  its back wheel makes for each of its pedals'); a boat's `power`, `speed`, `steer` (its rudder) and `mass`; a ship's `speed`, `accel` (m/s²),
  `turn` and `thrusters` (°/s); a submarine's those and `dive` (m/s) and `depth` (m); a helicopter's
  `speed`, `accel`, `turn`, `climb` (m/s) and `ceiling` (m over the ground); a plane's those and `lift`
  (m/s, its take-off speed); a train's `speed` and `accel`.
- **A seat**: a part with `"seat": true`, sat on by a click — on its top, facing its +y, or where
  its sit target says (`"seat": { "at": [x, y, z], "turn": 0 }`: format.md). The
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

### A bicycle

Ridden as a motorbike is, and pedalled. **What lies within a wheel turns with it** — within its width
and its radius of its axle, a part centred on its axle as far as its size across — and is not its body:
so a wheel is its volume, a plain cylinder lying across it with `"collisionOnly": true` (not drawn), and
round its spokes a tyre (a torus) and a rim (a hollow cylinder), its hub (a sphere stretched along x)
and its spokes (thin cylinders through the hub, two spokes each), all `"phantom": true`. **Its crank** is
a cylinder lying across it between its wheels, collision only too, as wide as its pedals and reaching
past them: its arms, its pedals (rods along x — a rounded box whose radius is its half thickness; a
cylinder lying across it would be a wheel) and its chainring lie within it, phantom, and turn as its
rider pedals — at their first turn the right pedal (−x) at the top. **Its saddle** is a seat in the pose
`ovgrid/pedalling`, its sit target where that pose was made: the feet meet the pedals and the hands the
grips only on that geometry, so build on this one's measurements (the hips 0.155 m over the saddle's
top, 0.18 m behind the crank's axle; the grips 0.27 m either side, swept back). Up off it — or off a
motorbike —, one steps off beside it on its left, past its bars. Its key parts — the
build has five more spokes a wheel (each 30° on), a rim, a hub and a sprocket, its chainring, its stays
and its fork's crown, a lamp:

```json
{ "name": "bicycle", "vehicle": { "type": "bicycle", "power": 45, "speed": 8, "steer": 30, "mass": 90, "gear": 2.8 }, "at": [0, 0], "prims": [
  { "name": "front wheel", "shape": "cylinder", "at": [0, 0.636, 0.367], "size": [0.734, 0.734, 0.1], "turn": [0, 90, 0], "collisionOnly": true },
  { "name": "front wheel's tyre", "shape": { "preset": "torus", "scaleY": 0.075 }, "at": [0, 0.636, 0.367], "size": [0.055, 0.734, 0.734], "turn": [0, 90, 0], "material": "synthetic/rubber/rubber-001", "phantom": true },
  { "name": "front wheel's spokes", "shape": "cylinder", "at": [0, 0.636, 0.367], "size": [0.005, 0.005, 0.58], "turn": [-75, 0, 0], "material": "metal/bare/metal-050a", "surface": { "gloss": 0.95, "metal": 1 }, "phantom": true },
  { "name": "back wheel", "shape": "cylinder", "at": [0, -0.636, 0.367], "size": [0.734, 0.734, 0.1], "turn": [0, 90, 0], "collisionOnly": true },
  { "name": "back wheel's tyre", "shape": { "preset": "torus", "scaleY": 0.075 }, "at": [0, -0.636, 0.367], "size": [0.055, 0.734, 0.734], "turn": [0, 90, 0], "material": "synthetic/rubber/rubber-001", "phantom": true },
  { "name": "back wheel's spokes", "shape": "cylinder", "at": [0, -0.636, 0.367], "size": [0.005, 0.005, 0.58], "turn": [-75, 0, 0], "material": "metal/bare/metal-050a", "surface": { "gloss": 0.95, "metal": 1 }, "phantom": true },
  { "name": "crank", "shape": "cylinder", "at": [0, -0.107, 0.356], "size": [0.401, 0.401, 0.39], "turn": [0, 90, 0], "collisionOnly": true },
  { "name": "crank arm", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.008, "segments": 2, "at": [-0.08, -0.107, 0.444], "size": [0.016, 0.034, 0.209], "material": "metal/bare/metal-050a", "surface": { "gloss": 0.95, "metal": 1 }, "phantom": true },
  { "name": "pedal", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.015, "segments": 2, "at": [-0.14, -0.107, 0.531], "size": [0.1, 0.03, 0.03], "material": "synthetic/plastic/plastic-006", "surface": { "gloss": 0.5 }, "phantom": true },
  { "name": "crank arm", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.008, "segments": 2, "at": [0.08, -0.107, 0.268], "size": [0.016, 0.034, 0.209], "material": "metal/bare/metal-050a", "surface": { "gloss": 0.95, "metal": 1 }, "phantom": true },
  { "name": "pedal", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.015, "segments": 2, "at": [0.14, -0.107, 0.181], "size": [0.1, 0.03, 0.03], "material": "synthetic/plastic/plastic-006", "surface": { "gloss": 0.5 }, "phantom": true },
  { "name": "seat tube", "shape": "cylinder", "at": [0, -0.153, 0.619], "size": [0.032, 0.032, 0.535], "turn": [10.008, 0, 0], "color": [0.42, 0.03, 0.03], "surface": { "gloss": 0.9, "metal": 0.5, "reflect": 0.3 } },
  { "name": "top tube", "shape": "cylinder", "at": [0, 0.173, 0.802], "size": [0.03, 0.03, 0.701], "turn": [-84.102, 0, 0], "color": [0.42, 0.03, 0.03], "surface": { "gloss": 0.9, "metal": 0.5, "reflect": 0.3 } },
  { "name": "down tube", "shape": "cylinder", "at": [0, 0.21, 0.581], "size": [0.038, 0.038, 0.776], "turn": [-54.651, 0, 0], "color": [0.42, 0.03, 0.03], "surface": { "gloss": 0.9, "metal": 0.5, "reflect": 0.3 } },
  { "name": "head tube", "shape": "cylinder", "at": [0, 0.525, 0.82], "size": [0.042, 0.042, 0.15], "turn": [13.8, 0, 0], "color": [0.42, 0.03, 0.03], "surface": { "gloss": 0.9, "metal": 0.5, "reflect": 0.3 } },
  { "name": "stem", "shape": "cylinder", "at": [0, 0.474, 1.022], "size": [0.025, 0.025, 0.268], "turn": [14.324, 0, 0], "material": "metal/bare/metal-050a", "surface": { "gloss": 0.95, "metal": 1 } },
  { "name": "fork", "shape": "cylinder", "at": [-0.052, 0.59, 0.557], "size": [0.024, 0.024, 0.392], "turn": [13.762, 2.133, 0.522], "color": [0.42, 0.03, 0.03], "surface": { "gloss": 0.9, "metal": 0.5, "reflect": 0.3 } },
  { "name": "fork", "shape": "cylinder", "at": [0.053, 0.59, 0.557], "size": [0.024, 0.024, 0.392], "turn": [13.762, -2.133, -0.522], "color": [0.42, 0.03, 0.03], "surface": { "gloss": 0.9, "metal": 0.5, "reflect": 0.3 } },
  { "name": "saddle", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.025, "segments": 2, "at": [0, -0.294, 0.994], "size": [0.16, 0.16, 0.064], "material": "fabric/leather/brown-leather", "seat": { "at": [0, 0.01, 0.187], "turn": 0, "pose": "ovgrid/pedalling" } },
  { "name": "handlebar", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.012, "segments": 2, "at": [0, 0.441, 1.152], "size": [0.2, 0.024, 0.024], "material": "metal/bare/metal-050a", "surface": { "gloss": 0.95, "metal": 1 } },
  { "name": "handlebar", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.012, "segments": 2, "at": [-0.155, 0.381, 1.152], "size": [0.187, 0.024, 0.024], "turn": [0, 0, -132.51], "material": "metal/bare/metal-050a", "surface": { "gloss": 0.95, "metal": 1 } },
  { "name": "grip", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.017, "segments": 2, "at": [-0.265, 0.321, 1.152], "size": [0.11, 0.034, 0.034], "material": "fabric/leather/brown-leather" },
  { "name": "handlebar", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.012, "segments": 2, "at": [0.155, 0.381, 1.152], "size": [0.187, 0.024, 0.024], "turn": [0, 0, -47.49], "material": "metal/bare/metal-050a", "surface": { "gloss": 0.95, "metal": 1 } },
  { "name": "grip", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.017, "segments": 2, "at": [0.265, 0.321, 1.152], "size": [0.11, 0.034, 0.034], "material": "fabric/leather/brown-leather" }
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

### A ship or a yacht

Anything afloat with decks and a deckhouse — a yacht, a ferry, a cargo ship — is a `ship`, not a
`boat`: a boat floats with 40 % of its volume under the water, so a deckhouse sinks it, and its engine
pushes against a drag that grows with its size. A ship floats **at its waterline: its frame's z = 0**,
whatever stands on its decks — build its hull from z = 0 down to its keel and up to its decks, and it
is borne there; it weighs the water under that line, so its mass is no parameter. It is steered as
heavy ships are: `accel` (m/s², 0.5 a large yacht) up to `speed`, slow to stop, half the thrust
astern; `turn` (°/s) on its rudder as it goes, nothing standing still, and `thrusters` (°/s) turning
it on the spot to come off a quay; it never skids sideways.

- **Its hull** is what floats it: a solid's `loft` along y (format.md, Solids) — closed, convex, its keel
  and its waterline in its sections — or boxes, prisms and hulls, as many as a solid of hulls side by
  side holds. A hull that is not convex (a hollow, an open sheet) does not float: the physics takes only
  solid convex pieces — so a hollow shell is drawn only, and convex pieces under it float it.
- **Deep water**: as much under it as its keel reaches under z = 0, and a hand more, all along its way
  out (the survey's `depths`; the check says so). A yacht drawing 2.5 m wants 3 m: moor it at the head
  of a pier long enough, its stern to the pier (a gangway from its swim platform), its bow to sea.
- **Its helm** a seat high enough to see over its bow, open or under a hardtop; benches and sofas
  seats for its passengers.
- **Alive**: navigation lights at night — red to port (its +x, its helmsman's left), green to
  starboard (−x), white at its masthead and stern —, deck lights, and doors that slide.
- **Rooms to walk in**: a deckhouse built hollow, not a solid box. Give it floors, walls with their
  windows' glass seen through (tinted dark, `"opacity": 0.3` on each face, `"matte": 1`), ceilings
  2.8 m over its floors, and
  sliding doors that open as one comes near (the `slide` behaviour, `"trigger": "near"`). Stairs go up
  inside, each through a well in the floor above, railed round. Make a part that moves by itself all
  the time (a radar turning) `phantom`: a body is made again only once what of it collides has settled,
  and its doors let one through only then.
- **Its Auto**: a ship or a submarine drives itself on its object's route. Give the object a
  `"behaviour": { "type": "route", "mode": "back", "points": […], "speed": 6, "stop": 20, "at": "ends",
  "face": "yes", "water": "yes", "held": true }` — out from its berth and back, held there till its Auto
  is set on. Read its depth all along, as its berth's. Aimed at its helm, E is Manual and O its Auto, for
  whoever may drive it: nobody sat down, whoever is aboard carried. Its Auto runs the route once, out and
  back, and is off again in its berth. Driven off its route, it comes back onto it when its Auto is on
  again.
- **Room to stand up at its helm**: up from a seat, the avatar stands 0.6 m past its front edge, or, a
  console there, beside it or behind it: leave a floor clear at one side of a helm seat or behind it.
- **Matte, mirroring nothing** (`"matte": 1` on every part, no `reflect`, no metal): its gelcoat, its
  glass, its teak, its fittings. Anything else mirrors the sky: faintly under a gloss of 0.3, low and
  blurred, late as one moves; from 0.3 the world, and a metal at any gloss. On a hull's curves, its panes
  and its chrome it shows in waves and distortions. Its fittings white, not chrome.

```json
{ "name": "launch", "at": [0, 0], "vehicle": { "type": "ship", "speed": 9, "accel": 0.7, "turn": 7, "thrusters": 3 }, "prims": [
  { "name": "hull", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.25, "at": [0, -0.5, 0.4], "size": [3.4, 9, 2.8], "color": [0.9, 0.9, 0.88], "surface": { "matte": 1 } },
  { "name": "bow", "shape": "prism", "at": [0.85, 5, 0.4], "size": [1.7, 2.8, 2], "turn": [-90, 0, 0], "color": [0.9, 0.9, 0.88], "surface": { "matte": 1 } },
  { "name": "bow", "shape": "prism", "at": [-0.85, 5, 0.4], "size": [1.7, 2.8, 2], "turn": [-90, 180, 0], "color": [0.9, 0.9, 0.88], "surface": { "matte": 1 } },
  { "name": "boot top", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.05, "segments": 2, "at": [0, -0.5, 0.05], "size": [3.44, 9.04, 0.12], "color": [0.03, 0.12, 0.4], "surface": { "matte": 1 } },
  { "name": "deck", "shape": "cube", "at": [0, -0.5, 1.83], "size": [3.2, 8.8, 0.06], "material": "wood/planks/teak-veneer", "surface": { "rotation": 90 } },
  { "name": "deckhouse", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.1, "at": [0, 0.3, 2.9], "size": [2.6, 4.2, 2.1], "color": [0.9, 0.9, 0.88], "surface": { "matte": 1 } },
  { "name": "windows", "shape": "cube", "at": [0, 0.3, 3.3], "size": [2.64, 4.24, 0.7], "color": [0.02, 0.025, 0.03], "surface": { "matte": 1 } },
  { "name": "helm seat", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.05, "segments": 2, "at": [0.5, -2.6, 2.1], "size": [0.6, 0.5, 0.14], "material": "fabric/leather/leather-white", "seat": true },
  { "name": "stern bench", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.05, "segments": 2, "at": [0, -4.2, 2.1], "size": [2.4, 0.5, 0.14], "material": "fabric/leather/leather-white", "seat": true },
  { "name": "port light", "shape": "cube", "at": [1.32, 2.2, 3.4], "size": [0.04, 0.16, 0.1], "color": [0.9, 0.05, 0.03], "surface": { "emissive": 1 }, "light": { "on": "night", "range": 0 } },
  { "name": "starboard light", "shape": "cube", "at": [-1.32, 2.2, 3.4], "size": [0.04, 0.16, 0.1], "color": [0.05, 0.8, 0.2], "surface": { "emissive": 1 }, "light": { "on": "night", "range": 0 } }
] }
```

### A submarine

A `submarine` is a ship that dives, dry inside by its kind (`"dry": true` is in it: format.md): at the
surface afloat with its hull's top level with the water — the top of the box round its largest parts, its
hull and a dome over it, wherever its frame is: all of its inside under the water and dry —; C takes it down at `dive` m/s, to `depth` at most and never through the
sea's floor (0.5 m over it), Space brings it up again; under the water it holds its depth, level. Chosen
as one in the editor, over the sea, it is brought down to where it floats. Its hull a closed loft or
lathe — or a hollow cylinder lying along it, its ends closed —, its conning tower a part over it, its
seats inside a hatch or under a canopy of glass. Under the water the view goes under with whoever is in it, and its cabin, closed — walls
round it on every side but one at most, a roof over it within 30 m —, is walked in dry: out of its
hatch one swims on from where one is (docs/decisions.md, «Under the water»).

**One to walk round inside**: its decks 3 m clear or more, each as high, all of them under its
waterline afloat — its deck just out of the water —, so that the view inside is always under the water
and its air is kept dry; in by a door in its sail over the water into a hall big enough for several,
and down by a lift: its platform beside the hall, down through each deck in a hole flush with its floor,
parts of one group with a `lift` behaviour (format.md), a button a floor on its post and a `call` button
at each stop — dry from the first moment under the surface, no stairs needed. Its hull and its dome thin shells — a loft of sections each its outline
and, back the other way, that outline a few cm inside it, its two ends `corners` — seen and walked into
from inside, at least three of a sculpt's steps thick (its box over 255: 12–14 cm across 10 m), and
opaque decks and walls inside them; its tour a `route` whose points' z is its depth, `"water": "no"`,
its depth read all along it for its keel. Its inside is the box round its largest parts: make its hull
and its dome the largest — nothing else a quarter of either as a box —, and the fish keep out of it and
the air in it is all of it; close its top with its deck, but where its tower goes up through its sail:
up out of its inside the air goes on, no sea's surface seen up its lift's shaft. Light it inside with
lamps `"on": true`: no sun comes into the air under the sea, only the water's light round it, so its
lamps are its light.

### A helicopter

A `helicopter` flies on its rotors, whatever it is built of: Space takes it up and C down at `climb`, and
between them it holds its height, never into the ground nor over its `ceiling`; off the ground W and S fly
it ahead and back (a third of its speed), its nose down as it goes, and A and D turn it — on the spot, or
banking as it goes. Its pilot gets up only once it has landed: up from its controls in the air, it comes
straight down first.

- **Its feet**: what of it is lowest — skids, wheels, pods — within 0.2 m of its bottom, its frame's
  z = 0 the ground under them. Its centre of mass is put over their middle, so it stands level on two
  skids or on one line of wheels. Keep boarding steps higher than that (0.25 m and up) or they are feet.
- **Where it lands**: on what is under its feet — the ground, a pad, a roof, the sea's surface. Give it a
  pad where it is kept, level and clear of anything as tall as its rotor within its radius.
- **Its rotors** are parts with `"behaviour": { "type": "spin", "speed": 300 }`, `phantom`: they turn
  only while it runs — driven or on its Auto —, up to speed over 3 s and still again 3 s after it stops.
  A part turns about its own z through its own middle, so a pair of blades is one part across the hub
  (two crossing ones for four blades); a tail rotor turned `[0, 90, 0]` so that its z lies across the
  helicopter.
- **Its exhausts**: a turbine's breath, the jet's exhaust half as long —
  `"particles": { "preset": "exhaust", "running": true, "life": 0.08 }`, some 1.3 m —, coming up with its
  rotors and dying away with them; `"scale"` to its outlet (0.6 for one 0.27 m high). On a part whose +z
  points the way it blows: an engine block made from its intake to its exhaust, a pod's or a drum's
  cylinder turned `[90, 0, 0]` (its +z its back), or, where the outlet is a plate on a slanted face, a small
  box hidden in the plate, turned the way it faces, `phantom`. An outlet wider than high, a slot: several such
  boxes side by side across it, each stream as high as it.
- **Inside**: a cabin to walk in wants 2.3 m and more over its floor; its pilot's seat
  `"seat": { "pose": "quaternius/driving" }` with a stick and a panel low enough to see over. In and out by
  a click (`passage`, format.md): its hull's parts `"way": "in"` with the place on its floor one is put,
  its door's `"way": "both"` — a click on it from inside puts one out past it, across its box's thinnest side: a door
  taken from a hull's skin, folded at its shoulder, may be as deep as it is long, so give its part a box longer along
  the hull than it is deep. No steps up to a high sill.
- **Its Auto**: a `route` whose points' z is its height over where it is kept (`"water": "no"`): up
  steeply off its pad — a first point 15–20 m ahead and as high —, round, and back down onto it from
  behind, so that it comes in facing as it was kept. Set it as it should fly over level ground: wherever
  the land under it rises, it is lifted to keep as high over it as it was set over its pad's ground, 25 m
  at most, eased over hills (set down anywhere, its tour never goes into one). Only the land is read: keep
  it over what is built and tall trees on its way. On its Auto it tilts as its pilot's flying does — nose
  down as it goes, banked into its turns —, so a tight turn reads as one: give it room. Its driver may
  record more as they fly it (K at its controls, smoothed as it is kept), kept in `routes` beside it; a
  build may give it several too — N at its helm goes through them.

```json
{ "name": "prim helicopter", "at": [0, 0], "vehicle": { "type": "helicopter", "speed": 25, "climb": 5, "ceiling": 500 }, "prims": [
  { "name": "cabin", "shape": "cube", "at": [0, 0.5, 1.5], "size": [2.2, 5, 2], "color": [0.55, 0.6, 0.65] },
  { "name": "boom", "shape": "cube", "at": [0, -4.5, 1.9], "size": [0.4, 5, 0.5], "color": [0.55, 0.6, 0.65] },
  { "name": "skid", "shape": "cube", "at": [-1, 0.5, 0.075], "size": [0.15, 4.4, 0.15], "color": [0.55, 0.6, 0.65] },
  { "name": "skid", "shape": "cube", "at": [1, 0.5, 0.075], "size": [0.15, 4.4, 0.15], "color": [0.55, 0.6, 0.65] },
  { "name": "pilot seat", "shape": "cube", "at": [-0.5, 1.8, 0.8], "size": [0.6, 0.6, 0.2], "color": [0.55, 0.6, 0.65], "seat": { "pose": "quaternius/driving" } },
  { "name": "blade", "shape": "cube", "at": [0, 0.5, 2.8], "size": [10, 0.3, 0.05], "color": [0.1, 0.1, 0.1], "phantom": true, "behaviour": { "type": "spin", "speed": 300 } },
  { "name": "blade", "shape": "cube", "at": [0, 0.5, 2.8], "size": [10, 0.3, 0.05], "turn": [0, 0, 90], "color": [0.1, 0.1, 0.1], "phantom": true, "behaviour": { "type": "spin", "speed": 300 } },
  { "name": "tail rotor", "shape": "cube", "at": [0.3, -7, 2], "size": [1.6, 0.15, 0.04], "turn": [0, 90, 0], "color": [0.1, 0.1, 0.1], "phantom": true, "behaviour": { "type": "spin", "speed": 360 } }
] }
```

### A plane

A `plane` flies on its wings. On its wheels W speeds it along its way at `accel`, S or C brake it, A and D
steer its nose wheel; once as fast as its take-off speed (`lift`), Space lifts it off. In the air W and S
speed it up to `speed` and down to `lift`, Space takes it up and C down at `climb`, and between them it
holds its height, never into the ground nor over its `ceiling`; slower than `lift` it sinks. A and D turn
it at `turn`, banking. Back on its wheels it rolls on. Up from its controls in the air, it comes down where
it is, and its pilot gets up once it has stopped.

On its **Auto** (O at its helm, as a helicopter's) it flies its object's route by itself, everyone aboard, tilted as
a plane — nose up as it climbs, banked into its turns. Give its route `"accel"` (m/s², its Speeds up) as the plane's
own, so that it sets off along its runway as it would by hand: from its stop where it is kept, its first points on the
runway at z 0 (with a level handle on the last of them, `[x, y, 0, 0, 40, 0]`, so that its curve never dips into it)
till it is past its take-off speed — lift² / (2 × accel) m on —, then up and round, and back lined up with its runway,
down onto it as far before where it is kept as it needs to slow from its take-off speed, and `"stop"` there, `"at":
"ends"`. A route goes 120 m/s at most.

- **Its feet**: its wheels — what of it is lowest, within 0.2 m of its bottom, its frame's z = 0 the ground
  under them —: one under its nose and two under its wings, so that it stands level on them.
- **Where it is kept**: at one end of a runway long enough for its take-off — speeding up at `accel` to
  `lift` takes lift² / (2 × accel) m: 45 m/s at 4 m/s² is 250 m —, level, nothing tall at its ends. A runway
  is road parts (`"kind": "road"`, 12 m wide at most) side by side on the ground, its markings thin boxes
  laid on them.
- **Inside**: as a helicopter's — 2.3 m over its floor where people walk, its pilot's seat
  `"seat": { "pose": "quaternius/driving" }`, in and out by a click (`passage`).
- **Its exhausts**: `"particles": { "preset": "exhaust", "running": true }` on each engine — a cylinder
  along it, `"turn": [90, 0, 0]`, so that its +z, the face it is thrown from, is its back — blow its flame
  backwards while it runs, coming up as its pilot takes it and dying away as they leave it; `"scale"`
  for a larger nozzle (2: 1.3 m across).

```json
{ "name": "prim plane", "at": [0, 0], "vehicle": { "type": "plane", "speed": 70, "accel": 4, "lift": 35, "turn": 15, "climb": 8, "ceiling": 2000 }, "prims": [
  { "name": "fuselage", "shape": "cube", "at": [0, 0, 1.6], "size": [2, 10, 1.8], "color": [0.9, 0.9, 0.9] },
  { "name": "wing", "shape": "cube", "at": [0, 0.5, 1.2], "size": [12, 2, 0.2], "color": [0.9, 0.9, 0.9] },
  { "name": "tailplane", "shape": "cube", "at": [0, -4.5, 1.9], "size": [4, 1.2, 0.12], "color": [0.9, 0.9, 0.9] },
  { "name": "fin", "shape": "cube", "at": [0, -4.6, 2.9], "size": [0.12, 1.4, 1.8], "color": [0.9, 0.9, 0.9] },
  { "name": "engine", "shape": "cylinder", "at": [0, -5.3, 1.6], "size": [0.7, 0.7, 0.6], "turn": [90, 0, 0], "color": [0.2, 0.2, 0.22],
    "particles": { "preset": "exhaust", "running": true } },
  { "name": "nose wheel", "shape": "cylinder", "at": [0, 4, 0.3], "size": [0.6, 0.6, 0.2], "turn": [0, 90, 0], "color": [0.05, 0.05, 0.05] },
  { "name": "main wheel", "shape": "cylinder", "at": [-1.4, -0.5, 0.35], "size": [0.7, 0.7, 0.25], "turn": [0, 90, 0], "color": [0.05, 0.05, 0.05] },
  { "name": "main wheel", "shape": "cylinder", "at": [1.4, -0.5, 0.35], "size": [0.7, 0.7, 0.25], "turn": [0, 90, 0], "color": [0.05, 0.05, 0.05] },
  { "name": "pilot seat", "shape": "cube", "at": [0.4, 2.5, 1.1], "size": [0.6, 0.6, 0.2], "color": [0.3, 0.3, 0.32], "seat": { "pose": "quaternius/driving" } }
] }
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
through the same points (format.md), in the build's frame. Build it along its +y, its engine ahead, facing the way its
route sets off: a route turns what follows it from how it stands at its start, so a train laid aslant of its way runs
its whole line askew, and its rollers, lying along no axis of it, are no wheels.

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
15–20 (3,700), a bicycle of about 50 (12,000: its tyres the most), a boat of 10–15 (3,000), a train of 20–35 — each its object's share of the build's
parts and triangles (budget.md). Rounds cost triangles: two `segments` for a small one. Headlamps
are lights of the build's, lit at night only; two for a car. A pier of eleven sections drawn as
clones: 200 parts, 30,000 triangles. The check says why a vehicle could not be driven: no wheels for
a car or a bike, no route for a train, no seat; a bicycle with no crank, or a saddle nobody pedals.


## 7. Delivery: from your JSON to the world

### What you give

- **One JSON object** — nothing else in it, no comments — that follows the build file (format.md).
  In a chat, in one code block; better, as a file or at an address (below).
- **With a survey**, its `anchor` as it is (`"exact": true`): the build stands exactly where the
  survey says, its front towards where the person looked. **Without one**, no anchor: the person
  puts it where they point.
- **What you simplified, and why** (plan.md), and what each part of it is: the person reads it
  before they place it.
- **Your parts**: your own parts per object, clones aside, and, wherever several boxes remain, why they could not be one `solid`.

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

### Before you give it, when you cannot run the scripts

`check.mjs` and `plan.mjs` are not in your hands: walk the build in your head as the avatar (1.8 m tall, 0.6 m
wide, a step up of 0.3 m at most), from outside into every room, and fix what stops you before you give it.

1. **Every door and doorway** is at least 0.8 × 1.9 m clear — a `door` box of 1.0 × 2.2 m outside, 0.9 × 2.1 m
   inside, its box being the frame and the opening smaller (method.md, Scale) — and the wall is cut round it
   (method.md, Walls with openings): a door set before an uncut wall blocks the way.
2. **Every threshold, step or ledge** is 0.3 m at most, or stairs with risers of 0.2 m at most.
3. **Headroom** 2.1 m under beams, lofts and stair landings; rooms at least 4 × 4 m with ceilings of 2.8 m.
4. **A clear way** of 1 m from the door through each room, and past the foot and the top of every stair: furniture against the walls.
5. **Every name** — kind, parameter, material, species — is in the guide or `catalog.json`, and no object has
   more than 256 parts.
6. **Carve, don't pile.** Count your parts. Carved blocks are preferred: a wall of boxes round a gap, a part to a leg, a row of
   identical parts side by side are each one `solid` (recipes.md). And no overlapping pieces of one surface, no boxes touching round an opening, no two
   faces in one plane, no open joint between a wall and its opening. Redo them before you give it.

### Sharing it

A build at an address can be brought in by anyone: with an exact anchor it lands where it was
written for — share one without an anchor (or say so) when it is meant for anyone's place. A build
can be placed by anyone who brings it in; what it becomes is theirs.

### A whole parcel: a land

A **land** is a parcel (~300 m, the status's `F5:11145,19300 Hinterland`) saved whole — Second Life's
and OpenSim's region archive (OAR). It is a build file that names its parcel, so everything above holds
for it, and it holds:

- `"parcel": { "face", "x", "y" }`, and an exact `anchor` at that parcel's centre, its +y the parcel's
  own;
- everything that stands in the parcel by its root (an object's centre, a clone's, a tree's foot), with
  an object's parts however far they reach, under their ids;
- `"chunks"`: its ground where it was shaped (terraformed), each chunk as the world keeps it — never
  write or change these by hand: they are the ground to the centimetre;
- `"sky"`: the parcel's own sky, when it has one (time, clouds, rain).

In *Builds as JSON*, **Save land** saves the parcel where the camera looks, and shows and downloads its
file. A land pasted, dropped or opened by its address is checked as a whole parcel: counted, not held to
one build's budget, but to what a newcomer is sent of the world at once (about 1.6 MB compressed, which
the panel says). Its parcel's keeper then chooses:

- **Load in its place**: the parcel becomes what the land holds, as it was saved: what it names is
  changed where it stands, what it no longer holds is taken away, its ground and sky are put back.
- **Load here**: the same, into the parcel where the camera looks — moved to that parcel's centre, under
  new ids, its whole ground laid there. A smaller parcel that it would not fit refuses it.

Either is one Ctrl+Z. To **rethink a land** (in recipes, say), keep its `parcel`, `anchor`, `chunks`,
`sky` and every `id` as they are; change the objects as you would a build's export (Changing it, above).
An object left out is taken away when it is loaded in its place.


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

- **`rock`** — A rock of one of seven forms: a boulder (a sculpted sphere, lumped and chipped by its seed and cut flat underneath), a crag (the same cut into upright faces, for rocks of metres), layered (strata, ledges between them), a pile of stones heaped as they would rest, crystals (quartz prisms out of a stone of their own), a passage (two pillars either side of a way through, a lintel resting across them, blocks at their feet) or an outcrop (tall stones and blocks leaning together). Its length (x) is its width (y) drawn out by its elongation; a few hundred triangles to 1,500, a formation 200 a stone, the detail left to its texture's relief. Its second face is its cover — moss, snow or sand on what faces up, as far down as its cover says — or the stone its crystals grow out of. Passages and outcrops collide stone by stone: one walks under a lintel. Faces: boulder: 0 surface, 1 cover; crag: 0 surface, 1 cover; layered: 0 surface, 1 cover; pile: 0 surface, 1 cover; crystals: 0 crystals, 1 stone; passage: 0 surface, 1 cover; outcrop: 0 surface, 1 cover. Size: its width (y) and height (z) its own; its length (x) its width drawn out by its elongation.
  - `form` `boulder` / `crag` / `layered` / `pile` / `crystals` / `passage` / `outcrop`, default `boulder`: Boulder: a lumpy, chipped stone. Crag: a rock of metres cut into upright faces and ribbed. Layered: strata, bands one on another with ledges between. Pile: stones heaped as they would rest. Crystals: quartz prisms ending in points, out of a stone of their own. Passage: two pillars either side of a way through, a lintel resting across them, blocks at their feet. Outcrop: tall stones and blocks leaning together.
  - `roughness` 0–1, default 0.5: How broken its surface is: 0 a smooth, lumpy pebble; 1 jagged, chipped all over. Crystals: how far apart they lean.
  - `edges` 0–1, default 0: How its facets meet: 0 faceted, low-poly, each facet flat with hard edges; 1 rounded, shaded smoothly across them.
  - `base` 0–1, default 0.3: How much of its underside is cut flat, to sit on the ground: 0 none, 1 up to half its height. A pile: how far its stones are sunk.
  - `elongation` 0–1, default 0.25: How long it is for its width: its length (x) is 1 + 2 × this times its width (y).
  - `layers` 2–8, default 5: Its strata, bottom to top.
  - `stones` 3–12, default 8: The stones of the pile, the passage (its two pillars and lintel among them) or the outcrop.
  - `crystals` 3–24, default 16: Its crystals, the largest upright in the middle; at a distance the least are left out.
  - `cover` 0–1, default 0: How far down its second face, its cover, reaches: the facets that face up, for moss, snow or sand — 0 none, 1 down past its sides.
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
- **`blocks`** — A square-cornered solid in one part: boxes on a grid of its own, each of one of up to eight colours, meshed as one surface — only what shows from outside, nothing between two boxes. Never written by hand: what rebuilds a model makes one of its square-cornered solids (a staircase, a block with its steps cut, a figure of voxels), exact to its corners. Faces: 1 colour: 0 colour 1; 2 colours: 0 colour 1, 1 colour 2; 3 colours: 0 colour 1, 1 colour 2, 2 colour 3; 4 colours: 0 colour 1, 1 colour 2, 2 colour 3, 3 colour 4; 5 colours: 0 colour 1, 1 colour 2, 2 colour 3, 3 colour 4, 4 colour 5; 6 colours: 0 colour 1, 1 colour 2, 2 colour 3, 3 colour 4, 4 colour 5, 5 colour 6; 7 colours: 0 colour 1, 1 colour 2, 2 colour 3, 3 colour 4, 4 colour 5, 5 colour 6, 6 colour 7; 8 colours: 0 colour 1, 1 colour 2, 2 colour 3, 3 colour 4, 4 colour 5, 5 colour 6, 6 colour 7, 7 colour 8. Size: its own, in metres.
  - `colours` `1 colour` / `2 colours` / `3 colours` / `4 colours` / `5 colours` / `6 colours` / `7 colours` / `8 colours`, default `1 colour`: How many colours its boxes take, each a face of the part: 0 one, 7 eight.
  - `blocks` 0–32768, default : Its grid and its boxes, as base64: each axis's planes as fractions of its box, then each box between two planes along each axis, of a colour; at most 32,768 cells and 2,048 boxes.
- **`outline`** — A flat shape drawn out through its box, bottom to top: rings of points round its outside and round holes right through it — whatever lies inside an odd number of rings solid —, each edge of one of up to eight colours, its two ends theirs. Never written by hand: what rebuilds a model makes one of its solids drawn out along a way (a gateway's arch, a wall with round windows, a letter, a beam of any section), exact to its corners. Faces: 1 colour: 0 colour 1; 2 colours: 0 colour 1, 1 colour 2; 3 colours: 0 colour 1, 1 colour 2, 2 colour 3; 4 colours: 0 colour 1, 1 colour 2, 2 colour 3, 3 colour 4; 5 colours: 0 colour 1, 1 colour 2, 2 colour 3, 3 colour 4, 4 colour 5; 6 colours: 0 colour 1, 1 colour 2, 2 colour 3, 3 colour 4, 4 colour 5, 5 colour 6; 7 colours: 0 colour 1, 1 colour 2, 2 colour 3, 3 colour 4, 4 colour 5, 5 colour 6, 6 colour 7; 8 colours: 0 colour 1, 1 colour 2, 2 colour 3, 3 colour 4, 4 colour 5, 5 colour 6, 6 colour 7, 7 colour 8. Size: its own, in metres.
  - `colours` `1 colour` / `2 colours` / `3 colours` / `4 colours` / `5 colours` / `6 colours` / `7 colours` / `8 colours`, default `1 colour`: How many colours its edges and ends take, each a face of the part: 0 one, 7 eight.
  - `outline` 0–4096, default : Its rings, as base64: each ring's points as fractions of its box across x and y, and each edge's colour; at most 64 rings and 512 points.
- **`solid`** — A solid in one part: what fills its box (a box, a cylinder, a cone, a ball or a wedge), then bodies added to it, cut out of it or kept where they meet it, one after another — boxes, cylinders, cones, balls and wedges, hulls round points or balls, profiles revolved or extruded, lofts through sections and profiles swept along paths, each placed, sized and turned in metres about its middle, mirrored or repeated if asked —, with smoothing steps among them: a wall with its door and windows, an arch, a boat's hull with its flare, a rail, a vase, a wheel and its spokes. Each face of what is left takes the colour of the body it came from — or of its own face, a box body's six or an extrude's caps and sides, or of a spot on it: the facet there and the surface smooth round it, a hull's facet, an extrude's side, an arch's intrados —, up to eight. Faces: 1 colour: 0 colour 1; 2 colours: 0 colour 1, 1 colour 2; 3 colours: 0 colour 1, 1 colour 2, 2 colour 3; 4 colours: 0 colour 1, 1 colour 2, 2 colour 3, 3 colour 4; 5 colours: 0 colour 1, 1 colour 2, 2 colour 3, 3 colour 4, 4 colour 5; 6 colours: 0 colour 1, 1 colour 2, 2 colour 3, 3 colour 4, 4 colour 5, 5 colour 6; 7 colours: 0 colour 1, 1 colour 2, 2 colour 3, 3 colour 4, 4 colour 5, 5 colour 6, 6 colour 7; 8 colours: 0 colour 1, 1 colour 2, 2 colour 3, 3 colour 4, 4 colour 5, 5 colour 6, 6 colour 7, 7 colour 8. Size: its own, in metres.
  - `base` `box` / `cylinder` / `cone` / `ball` / `wedge`, default `box`: What fills its box before any body is added or cut: a box, a cylinder, a cone, a ball or a wedge (upright at its front, −y, its slope from its top front edge down to its bottom back one).
  - `sides` 3–64, default 32: Sides round its base where it is round: 6 a hexagon, 32 smooth; a ball's a multiple of four.
  - `colours` `1 colour` / `2 colours` / `3 colours` / `4 colours` / `5 colours` / `6 colours` / `7 colours` / `8 colours`, default `1 colour`: How many colours its faces take, each a face of the part: 0 one, 7 eight.
  - `join` `union` / `none`, default `union`: How its bodies come together: joined into one surface (union, its base and its ways as they say), or drawn as they are side by side (none: its added bodies alone, nothing cut, kept or smoothed) — a model's faces rebuilt as plates, exact where they meet, in the fewest triangles.
  - `faces` 0–7, default : Its base box's faces each their own colour (−x +x −y +y −z +z, 0–7), as a box body's: what a union shows of its base, each side picked alone.
  - `spots` 0–64, default : Its base's faces by a spot on each, as a body's spots: fractions of its box (−0.5 to 0.5) and a colour.
  - `bodies` 0–32, default : Its bodies and smoothing steps, one after another, at most 32: each `{ "add" | "cut" | "keep": <shape>, "at": [x, y, z], "size": [x, y, z], "turn": [x, y, z], "colour": n, "faces": [n, …], "spots": [[x, y, z, n], …], "flat": true, "mirror": "x" | "y" | "z", "repeat": { "count": n, "step": [x, y, z] } or { "count": n, "around": degrees, "at": [x, y] } or both, a helix }` — in metres about the middle of its box, its turn ° about x, then y, then z, its colour 0 (its box's) to 7, a box's faces each their own (−x +x −y +y −z +z) or an extrude's (its −z cap, its +z cap, its sides), its spots each a spot on its surface (fractions of its box along its own axes, −0.5 to 0.5) and the colour of the facet nearest it and of the surface smooth round it (64 at most), flat to shade each facet alone and make it a face of its own (a faceted model's look) —, its shape box, cylinder, cone or ball (with "sides"), wedge, hull ("points", "round", "hollow"), revolve ("profile", "sides", "angle"), extrude ("profile", "holes", "twist", "scale"), loft ("points", "count", "hollow") or sweep ("path", "profile", "across", "scale", "twist", "closed"), its points packed (packPoints) as fractions of its box; or `{ "smooth": 1 | 2 | 3 }`, what came before it smoothed. At most 5,000 triangles before smoothing.

### Behaviours

- **`spin`** — Turns round its own up (z) without stopping: a carousel, a fan, a sign. `speed` -360–360 °/s (default 30).
- **`bounce`** — Hops up along its own up (z) and falls back without stopping, as a ball does: as high as it is asked, as fast as gravity brings it down. `height` 0.05–20 m (default 1).
- **`move`** — Goes from where it is to a point and back, waiting at either end: an elevator, a moving platform. `x` -64–64 m (default 0), `y` -64–64 m (default 0), `z` -64–100000 m (default 3), `speed` 0.1–20 m/s (default 1), `ease` `smooth` / `accel` (default smooth), `accel` 0.01–20 m/s² (default 1), `decel` 0.01–20 m/s² (default 1), `wait` 0–60 s (default 2).
- **`call`** — On a click, brings what goes and comes back near it — a platform, a lift — down to where it is kept at once, to set off again from there; a lift near it, to its stop nearest the button: a call button. `reach` 0.5–64 m (default 8).
- **`lift`** — Goes from stop to stop up and down its frame — a part up and down its object's, a thing of its own its own — on a click on it or on a call button by a stop, and waits at each till it is called again: a platform lift, an elevator. The parts of an object whose lift has the same group go as one: a platform, its rails, its buttons. `speed` 0.1–6 m/s (default 0.8), `button` `none` / `next` / `stop` (default next), `stop` 0–8 (default 0).
- **`switch`** — Switches its object's lights in its zones, for everyone: on a click, on or off — one by a room's door, one for a whole floor, one for every light of it — or, a presence detector, on while someone is near and off once all have gone. Lights on at night still come on and go off by themselves; switched by hand, they stay as they were left till the next nightfall or daybreak; by presence, each lights as far as its own light lets it (On, or At night only). Prims only. `trigger` `click` / `near` / `both` (default click), `reach` 0.5–10 m (default 4), `stay` 0–600 s (default 30).
- **`door`** — Swings open on a click or as someone comes near, and shuts by itself, on its hinges along one of its sides; a door of the door kind opens its own leaf. Prims only. `angle` -170–170 ° (default 90), `hinge` `left` / `right` (default left), `trigger` `click` / `near` / `both` (default click), `reach` 0.5–10 m (default 2.5), `time` 0.2–5 s (default 1), `stay` 0–60 s (default 5).
- **`slide`** — Slides aside on a click or as someone comes near, and back by itself: a sliding door, a window, a hatch. `x` -64–64 m (default 1), `y` -64–64 m (default 0), `z` -64–64 m (default 0), `trigger` `click` / `near` / `both` (default click), `reach` 0.5–10 m (default 2.5), `time` 0.2–5 s (default 1), `stay` 0–60 s (default 5).
- **`belt`** — Carries whoever stands on it along its own y: an escalator (stairs rise along their y), a moving walkway. `speed` -5–5 m/s (default 0.5).
- **`passage`** — A click on it, or E, takes whoever aims at it in or out, standing: from outside its object to its place inside (x, y, z of its object) — into a vehicle by a click on its hull —, from inside out across its thinnest side, past it, onto what is there — out of it by its door. Inside its object is within the box round its solid parts' middles. `way` `both` / `in` / `out` (default both), `x` -64–64 m (default 0), `y` -64–64 m (default 0), `z` -64–64 m (default 1), `depth` 0.3–5 m (default 1).
- **`route`** — Goes from where it is through its points, round and on again or to the last and back, stopping a while if asked — at each point, or only at its ends: a boat on a tour that comes back to port, a train on its line with its station, a ship on its autopilot. Held, it waits where it was left until it is run again, and then comes back onto it from there. Run once, it goes round or there and back once and stays where it is kept. `speed` 0.1–120 m/s (default 3), `accel` 0.1–10 m/s² (default 1), `stop` 0–120 s (default 0), `at` `each` / `ends` (default each), `mode` `round` / `back` (default round), `face` `no` / `yes` (default yes), `water` `no` / `yes` (default no).

### Vehicles

- **`car`** — Driven on its wheels — its cylinders lying across it — the front ones steering: W and S throttle and brake, A and D steer, Space the hand brake. `power` 50–3000 N·m (default 500), `speed` 2–60 m/s (default 25), `steer` 5–45 ° (default 30), `mass` 50–5000 kg (default 1000).
- **`bike`** — Driven on its two wheels — its front and back cylinders lying across it — leaning into its turns: W and S throttle and brake, A and D steer. `power` 10–600 N·m (default 150), `speed` 2–70 m/s (default 30), `steer` 5–45 ° (default 30), `mass` 50–5000 kg (default 250).
- **`bicycle`** — Ridden on its two wheels as a motorbike is, leaning into its turns, and pedalled: W pedals, S brakes, A and D steer. A cylinder lying across it between its wheels is its crank: it turns, and what lies within it — its arms, its pedals —, as its rider pedals (the seat's pose Pedalling), Gear times slower than its back wheel. `power` 5–200 N·m (default 45), `speed` 1–20 m/s (default 8), `steer` 5–45 ° (default 30), `mass` 50–5000 kg (default 90), `gear` 1–5 (default 2.8).
- **`train`** — Along its route (Does: follows a route), its driver setting its speed: W faster, S slower and then back; left, it goes on with its timetable from there. `speed` 1–60 m/s (default 20), `accel` 0.1–3 m/s² (default 0.8).
- **`boat`** — Afloat on the sea, its hull its parts: W and S ahead and astern, A and D its rudder. `power` 50–5000 (default 600), `speed` 1–30 m/s (default 8), `steer` 5–45 ° (default 30), `mass` 50–5000 kg (default 800).
- **`ship`** — Afloat at its waterline — its frame's z = 0, as it was built to float, whatever its decks carry — and as heavy as the water it moves: slow to get going and to stop, turning wide on its rudder as it goes and slowly on its bow thrusters when it does not, never skidding sideways. W and S ahead and astern, A and D the helm. `speed` 1–25 m/s (default 10), `accel` 0.05–3 m/s² (default 0.5), `turn` 1–30 °/s (default 6), `thrusters` 0–10 °/s (default 2).
- **`submarine`** — A ship that dives: at the surface afloat with its hull's top level with the water — all that is inside it under the water and dry, wherever its frame is —, and under it down to the depth its driver takes it, held there and level, never through the sea's floor. W and S ahead and astern, A and D the helm, Space up and C down. `speed` 1–25 m/s (default 6), `accel` 0.05–3 m/s² (default 0.6), `turn` 1–30 °/s (default 8), `thrusters` 0–10 °/s (default 3), `dive` 0.2–5 m/s (default 1), `depth` 2–500 m (default 60).
- **`helicopter`** — Flies on its rotors: Space takes it up and C down, and between them it holds its height, never into the ground nor over its ceiling; once off the ground W and S fly it ahead and back, its nose down as it goes, and A and D turn it, on the spot or banking as it goes. On the ground it rests on what it stands on — land, a roof, the sea. Its parts that turn (Does: turns) are its rotors: they turn while it runs, driven or on its Auto, and stand still once it is parked. Up from its controls in the air, it lands first. `speed` 2–80 m/s (default 25), `accel` 0.5–10 m/s² (default 3), `turn` 5–120 °/s (default 45), `climb` 0.5–20 m/s (default 5), `ceiling` 10–3000 m (default 500).
- **`plane`** — Flies on its wings. On its wheels W speeds it up along its way, S or C brake it, A and D steer it; once as fast as its take-off speed, Space lifts it off. In the air W and S speed it up and slow it down, Space takes it up and C down, and between them it holds its height, never into the ground nor over its ceiling; slower than its take-off speed it sinks; A and D turn it, banking. Back on its wheels it rolls on. On its Auto it flies its route by itself: along its runway, off it, round and down again. `speed` 20–300 m/s (default 80), `accel` 0.5–15 m/s² (default 4), `lift` 10–120 m/s (default 40), `turn` 3–60 °/s (default 15), `climb` 1–50 m/s (default 10), `ceiling` 100–15000 m (default 3000).

### Particles

Presets: `fire`, `smoke`, `sparks`, `steam`, `fog`, `fountain`, `snow`, `snowflakes`, `rain`, `fireflies`, `magic`, `bubbles`, `confetti`, `leaves`, `exhaust`. Kits: `campfire` (fire, sparks, smoke), `torch` (fire, smoke), `chimney` (smoke). Modifiers: `amount` 0.1–4, `scale` 0.1–10, `tint` [r, g, b].

### Patterns on a face

Every pattern takes `scale` 0.25–20 (default 2), `width` 0.01–0.3 (default 0.06), `glow` 0–1 (default 0.5), `power` 0.5–10 (default 3), `speed` 0–5 (default 1), `background` 0–1 (default 1), two `colors` and `multicolor`; and its own:

- **`grid`** — Lines along and across, a square in every cell.
- **`hex`** — A honeycomb of hexagons.
- **`circuit`** — A grid with pads where its lines cross. `pads` 0–6 (default 3), `pad` 0–1 (default 0.5).
- **`pulse-grid`** — A grid with pulses running along its lines. `every` 1–16 (default 4), `length` 0.01–0.4 (default 0.04), `base` 0–1 (default 0.4).
- **`plasma`** — Bands of a glow flowing and shifting. `bands` 1–12 (default 4).
- **`scan`** — Scan lines, a brighter band sweeping up them. `every` 0.5–20 (default 2), `sweep` 0–0.45 (default 0.05).
- **`matrix`** — Columns of glyphs raining. `glyphs` 0–1 (default 0.7), `drop` 0.5–20 (default 2).
- **`glitch`** — Scan lines torn by bands that jump and flicker. `bands` 0–1 (default 0.15), `shift` 0–2 (default 0.3), `flicker` 0–1 (default 0.3).
- **`dots`** — A dot in every cell. `softness` 0–1 (default 1), `stagger` 0–0.5 (default 0).
- **`stripes`** — Stripes at an angle, drifting if asked. `angle` 0–180 (default 45), `fill` 0.05–0.95 (default 0.5), `drift` -2–2 (default 0).
- **`plaid`** — Bands along and across, as on a woven cloth. `band` 0.05–0.9 (default 0.4), `crossings` 0–1 (default 1).
- **`tesla`** — Electric arcs crackling up the face. `bolts` 1–4 (default 2), `reach` 0–0.45 (default 0.25), `crackle` 0–40 (default 20).
- **`dna`** — Double helices turning, rungs between their strands. `radius` 0.1–0.45 (default 0.3), `turn` 0.5–8 (default 2), `rungs` 0–12 (default 5).
- **`reactor`** — Rings and spiral arms round a core pulsing at the face's middle. `arms` 0–8 (default 3), `twist` -1–1 (default 0.2), `core` 0–4 (default 1).
- **`fire`** — Flames rising from the face's foot. `height` 0.5–20 (default 4), `tongues` 0.25–4 (default 1).
- **`ember`** — Glowing cracks between plates, the plates flaring and fading. `cracks` 0–1 (default 0.7), `embers` 0–1 (default 0.6), `smoulder` 0–2 (default 0.2).
- **`fluid`** — Lines of a flowing liquid. `flow` 0–2 (default 1), `foam` 0–1 (default 0.3).
- **`vein`** — A network of veins, pulses running through it. `warp` 0–1 (default 0.3), `branches` 0–2 (default 1), `pulse` 0–1 (default 0.8).
- **`shockwave`** — Rings bursting out from points here and there. `spread` 1–12 (default 4), `fade` 0.5–4 (default 2).
- **`heartbeat`** — Heart traces running along every row, over a faint grid. `beat` 2–40 (default 6), `height` 0.05–0.5 (default 0.35), `grid` 0–1 (default 0.15).
- **`stargate`** — Rings of symbols turning round the face's middle. `rings` 1–8 (default 5), `symbols` 0.05–0.9 (default 0.3), `spin` 0–3 (default 1).
- **`firefly`** — Glowing specks drifting and blinking. `density` 0–1 (default 0.6), `wander` 0–1 (default 0.5), `blink` 0–6 (default 2).
- **`rune`** — Glyphs in circles, glowing in turn. `ring` 0–1 (default 0.3), `pulse` 0–2 (default 0.3), `dim` 0–1 (default 0.15).
- **`pcb-trace`** — Traces and pads of a circuit board, signals running along them. `pads` 0–1 (default 0.2), `signal` 0–1 (default 0.7), `traces` 0–1 (default 0.25).
- **`warp`** — Streaks rushing out from the face's middle. `streaks` 4–64 (default 16), `dashes` 0.05–1 (default 0.3), `core` 0–4 (default 1).
- **`synapses`** — Nerve cells with their branches, firing. `branches` 1–8 (default 3), `firing` 0–2 (default 0.5), `dendrites` 0–1 (default 0.25).
- **`nano`** — A hexagonal lattice of discs, a cross spinning in each. `spin` 0–4 (default 1), `disc` 0–1 (default 0.3), `cross` 0–1 (default 0.5).
- **`radar`** — A sweep turning round the face's middle, blips lit in its wake. `trail` 0.02–1 (default 0.25), `blips` 0–1 (default 0.15), `rings` 0–1 (default 0.15).
- **`sonar`** — Pings spreading out in rings from points here and there. `spread` 1–12 (default 4), `echoes` 1–3 (default 3), `fade` 0.5–4 (default 2).
- **`dot-wave`** — Dots swelling in waves. `swell` 0–6 (default 3), `wave` 0.1–2 (default 1), `calm` 0–1 (default 0.3).
- **`dot-orbit`** — Dots circling the middle of every cell. `dots` 1–3 (default 3), `orbit` 0.05–0.4 (default 0.3), `centre` 0–1 (default 0.2).
- **`ic-chip`** — Chips with their pins, blinking. `pins` 0–8 (default 4), `die` 2–16 (default 8), `blink` 0–10 (default 3).
- **`bus-line`** — Lanes of bits running, a clock above them. `lanes` 1–12 (default 6), `bits` 0.5–8 (default 2), `clock` 0–1 (default 1).
- **`motherboard`** — Traces, vias and signals of a board. `traces` 0–1 (default 0.55), `vias` 0–1 (default 0.3), `signal` 0–1 (default 0.7).
- **`led-grid`** — A grid of LEDs lit in waves, in sparks or in a spiral. `show` 0 each / 1 waves / 2 sparks / 3 spiral (default 0), `size` 0.1–1 (default 0.6).
- **`signal`** — Oscilloscope traces along every row, sine and square. `amplitude` 0.05–0.5 (default 0.27), `frequency` 0.25–4 (default 1), `grid` 0–1 (default 0).
- **`particles`** — Specks swirling round two cores in every cell. `count` 1–8 (default 5), `swirl` 0.05–0.3 (default 0.15), `cores` 0–1 (default 0.5).
- **`p2p-mesh`** — Nodes linked to their neighbours, packets running between them. `links` 0–1 (default 0.6), `packets` 0–1 (default 0.6), `jitter` 0–0.45 (default 0.3).
- **`fluid-plus`** — A flowing liquid, shaded by its depth. `flow` 0–2 (default 1), `foam` 0–1 (default 0.3), `depth` 0–1 (default 0.15).
- **`lava-flow`** — Plates of crust on glowing lava, flowing down. `flow` 0–1 (default 0.4), `heat` 0.02–0.5 (default 0.2), `crust` 0–1 (default 0.4).

### Tree species

`bush` Bush (plant, 2–2.7 m tall, crown 1.6–2 m); `oleander` Oleander (plant, 3.2–4 m tall, crown 2.1–2.7 m); `fern` Fern (plant, 0.7–0.8 m tall, crown 1.1–1.2 m); `agave` Agave (plant, 1.1–1.2 m tall, crown 1.1–1.3 m); `saguaro` Saguaro (plant, 5.6–6.6 m tall, crown 0.8–1 m); `bamboo` Bamboo (plant, 7.5–8.9 m tall, crown 3.7–4.2 m); `banana` Banana (plant, 3.4–4.6 m tall, crown 2.1–2.3 m); `joshua` Joshua tree (plant, 5.7–8.2 m tall, crown 2–3.4 m); `hosta` Hosta (plant, 0.3–0.4 m tall, crown 0.4–0.5 m); `monstera` Monstera (plant, 0.9–1.1 m tall, crown 1.1–1.3 m); `strelitzia` Bird of paradise (plant, 1.3–1.3 m tall, crown 0.9–1.1 m); `cordyline` Cordyline (plant, 2.1–3.7 m tall, crown 1.1–1.5 m); `sunflower` Sunflower (flower, 1.6–2 m tall, crown 1.2–1.5 m); `rudbeckia` Black-eyed Susan (flower, 0.6–0.8 m tall, crown 0.5–0.8 m); `daisy` Oxeye daisy (flower, 0.4–0.7 m tall, crown 0.4–0.6 m); `poppy` Poppy (flower, 0.6–0.7 m tall, crown 0.3–0.5 m); `lily` Lily (flower, 0.9–1.1 m tall, crown 0.3–0.4 m); `gladiolus` Gladiolus (flower, 1.2–1.4 m tall, crown 0.3–0.4 m); `columbine` Columbine (flower, 0.5–0.8 m tall, crown 0.3–0.4 m); `heather` Heather (flower, 0.5–0.6 m tall, crown 0.4–0.5 m); `pampas` Pampas grass (grass, 3.2–3.7 m tall, crown 1.4–2 m); `meadowGrass` Meadow grass (grass, 0.9–1.2 m tall, crown 0.6–0.6 m); `sedge` Sedge (grass, 0.7–0.8 m tall, crown 0.6–0.8 m); `papyrus` Papyrus (grass, 2.4–3.1 m tall, crown 1–1.5 m); `coconut` Coconut palm (palm, 12.8–16.3 m tall, crown 6.9–7.8 m); `date` Date palm (palm, 11.8–14.5 m tall, crown 4.1–4.4 m); `fanPalm` Fan palm (palm, 14.2–18.1 m tall, crown 2.9–3.3 m); `royal` Royal palm (palm, 15.6–16.4 m tall, crown 4.2–4.6 m); `bottle` Bottle palm (palm, 4.1–5.3 m tall, crown 2.2–2.4 m); `areca` Areca palm (palm, 4.7–6.3 m tall, crown 3.9–4.5 m); `sago` Sago palm (palm, 2.1–2.5 m tall, crown 1.4–1.6 m); `curvedCoconut` Curved coconut palm (palm, 10.9–14.6 m tall, crown 8.1–10.2 m); `dateClump` Clustered date palm (palm, 13–15.2 m tall, crown 10.8–13.5 m); `spindle` Spindle palm (palm, 7.6–11.8 m tall, crown 2.9–3.1 m); `christmas` Christmas palm (palm, 6.7–8.3 m tall, crown 3.6–4.7 m); `fir` Fir (conifer, 12.4–15.9 m tall, crown 5.1–7 m); `pine` Stone pine (conifer, 14.9–19.3 m tall, crown 5.8–9.6 m); `cypress` Cypress (conifer, 12.1–15.9 m tall, crown 1.3–1.5 m); `sugi` Japanese cedar (conifer, 18.7–25.1 m tall, crown 6.5–7.7 m); `redwood` Redwood (conifer, 25.5–32.9 m tall, crown 6.6–8 m); `dawnRedwood` Dawn redwood (conifer, 16.5–20.8 m tall, crown 6.4–7.7 m); `blackPine` Black pine (conifer, 14–17.6 m tall, crown 6.6–9.2 m); `oak` Oak (broadleaf, 13.5–17.9 m tall, crown 6.3–8.4 m); `birch` Birch (broadleaf, 15.6–18.2 m tall, crown 4.9–5.6 m); `poplar` Poplar (broadleaf, 15.5–18.9 m tall, crown 2.3–2.7 m); `acacia` Acacia (broadleaf, 11–15.3 m tall, crown 7.2–9.7 m); `maple` Maple (broadleaf, 12.4–15.1 m tall, crown 3.7–5.6 m); `cherry` Cherry blossom (broadleaf, 8–9.5 m tall, crown 6.4–7.6 m); `willow` Weeping willow (broadleaf, 10–12.4 m tall, crown 5.7–6.6 m); `olive` Olive (broadleaf, 8.6–9.6 m tall, crown 4.8–6.9 m); `baobab` Baobab (broadleaf, 14–19.3 m tall, crown 3.5–5.6 m); `eucalyptus` Eucalyptus (broadleaf, 19.7–26 m tall, crown 5.4–7.8 m); `plane` Plane tree (broadleaf, 18.5–26.4 m tall, crown 7.9–10.9 m); `zelkova` Zelkova (broadleaf, 16.1–20.3 m tall, crown 6.7–9.5 m); `camphor` Camphor tree (broadleaf, 11.9–16.2 m tall, crown 9.7–12.6 m); `hackberry` Hackberry (broadleaf, 14.6–17.5 m tall, crown 4.8–8.1 m); `chestnut` Sweet chestnut (broadleaf, 14.7–20.2 m tall, crown 7.9–9.3 m); `beech` Beech (broadleaf, 17.8–24.3 m tall, crown 6.6–9.5 m); `alder` Alder (broadleaf, 12.7–15 m tall, crown 4–6.1 m); `feverTree` Fever tree (broadleaf, 17.6–21.6 m tall, crown 9.9–11.1 m); `blueGum` Blue gum (broadleaf, 22.1–29.1 m tall, crown 6.7–9.5 m); `dead` Dead tree (broadleaf, 9.1–13.6 m tall, crown 3.2–5.1 m).

### Starter materials

Up to three of each subcategory of the bank (3253 in all in the catalog):

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
- `plaster/ceiling/wood-ceiling-coffers-001` — Wood Ceiling Coffers 001, 2 × 2 m a tile, #615e3d
- `plaster/ceiling/wood-ceiling-coffers-003` — Wood Ceiling Coffers 003, 2.4 × 2.4 m a tile, #4e717a
- `plaster/ceiling/wood-ceiling-coffers-004` — Wood Ceiling Coffers 004, 2.4 × 2.4 m a tile, #4a382f
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
- `metal/painted/hazard-stripes` — Hazard stripes, painted yellow and black, 0.4 × 0.4 m a tile, #ad8f1b
- `metal/painted/painted-metal-shutter` — Painted Metal Shutter, 2 × 2 m a tile, #7f8486
- `metal/painted/metal-027` — Metal 027, 1 × 1 m a tile, #2e2d35
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
- `openwork/plants/iron-railing-flower-boxes-ivy` — Wrought-iron railing on a stone ledge, ivy climbing its bars, white boxes of pink and purple flowers, 3.9 × 1.17 m a tile, #9f9a89, cut-out
- `openwork/plants/iron-railing-flowers-ivy` — Wrought-iron railing on a stone ledge, ivy climbing its bars, flowers along its foot, 5.6 × 1.17 m a tile, #7f7a60, cut-out
- `openwork/plants/hanging-ivy` — Ivy hanging down a wall, thick at its top, thinning to its foot, 2.4 × 5 m a tile, #3e622f, cut-out
- `facade/facade/tudor-timber-frame-brick-grass` — Tudor wall: dark timber posts and beams, brick between them, plaster panels braced at the top, grass at its foot, 10 × 5 m a tile, #7d6750
- `facade/facade/tudor-timber-frame-plaster-leaded-window` — Tudor wall: dark timber frame, cream plaster panels, a leaded window of two lights in its middle, 6.8 × 7.3 m a tile, #8f836d
- `facade/facade/cream-wallpaper-lace-window-balustrade` — Cream wallpaper between wooden bands, a window with a lace curtain over a turned wooden balustrade, 4.8 × 4.4 m a tile, #c4b29e
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
- `effects/portal/event-horizon` — Event horizon, 5 × 5 m a tile, #3563a9, glows, moves
- `effects/mirror/silvered` — Mirror, silvered, 1 × 1 m a tile, #f3f5f4, mirrors
- `effects/mirror/antique` — Antique mirror, foxed and hazed, 1 × 1 m a tile, #dedcd3, mirrors
- `images/paintings/a-cottage-in-the-woods` — A Cottage in the Woods — Meindert Hobbema, c. 1662, 1.114 × 0.84 m a tile, #716f67
- `images/paintings/portrait-of-a-couple` — Portrait of a Couple — Northern Italy, late 16th century, c. 1580–88, 1.405 × 0.998 m a tile, #4e473a
- `images/paintings/portrait-of-a-man` — Portrait of a Man — Bartolomeo Veneto, c. 1510s, 0.292 × 0.394 m a tile, #555459
- `images/textiles/dianas-return-from-the-chase` — Diana's Return from the Chase (from Set of Ovid's Metamorphoses) — Gobelins Manufactory, 1704–1731, 3.26 × 3.225 m a tile, #6e5c45
- `images/textiles/dido-and-aeneas-seek-shelter-from-a-storm` — Dido and Aeneas seek shelter from a storm — Giovanni Francesco Romanelli, 1679, 4.188 × 4.164 m a tile, #756a44
- `images/textiles/peacock-and-dragon` — Peacock and Dragon  — William Morris, 1878, 1.747 × 2.066 m a tile, #8a7359
- `images/ceramics/footed-dish-soucoupe-a-pied` — Footed Dish (soucoupe à pied) — Sèvres Porcelain Factory, 1786, 0.224 × 0.224 m a tile, #736f6d
- `images/ceramics/delftware-plate-bristol` — Plate — Bristol Porcelain Factory, mid-1700s, 0.264 × 0.264 m a tile, #6e7677
- `images/ceramics/dish-depicting-the-expulsion` — Dish Depicting the Expulsion — France, Lyon, late 1500s, 0.235 × 0.235 m a tile, #8e8870
- `images/glass/two-windows-depicting-the-annunciation-and-adora` — Two Windows Depicting the Annunciation and Adoration of the Magi — Austria, Styria, 15th century, c. 1410–20, 0.49 × 0.72 m a tile, #625e58
- `images/glass/stained-glass-panel-with-male-donor` — Stained Glass Panel with Male Donor — France, c. 1480, 0.435 × 1.56 m a tile, #b4b4b1
- `images/glass/saint-george` — Saint George — England, 15th century, c. 1440–1450, 0.311 × 0.34 m a tile, #b1aca2
- `images/signs/ground-floor-sign` — Sign, «GROUND FLOOR», 0.5 × 0.47 m a tile, #ebebe8
- `images/signs/1st-floor-sign` — Sign, «1ST FLOOR», 0.5 × 0.47 m a tile, #eaeae7
- `images/signs/2nd-floor-sign` — Sign, «2ND FLOOR», 0.5 × 0.47 m a tile, #eaeae7
- `images/objects/rocker-switch` — Rocker switch, up and down, 0.09 × 0.09 m a tile, #e7e7e4
- `images/objects/control-screen` — Control screen, a ring and lit bars, 0.5 × 0.5 m a tile, #4b341e
- `images/objects/cast-iron-fireplace` — Cast-iron fireplace, arched, 1.2 × 1.2 m a tile, #29282e
