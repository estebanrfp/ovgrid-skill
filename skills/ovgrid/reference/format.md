# 3. The resources: the build file, and what it may be made of

A build is one JSON object: objects of parts — prim shapes or *kinds* — dressed in the bank's
materials, with their lights, particles and behaviours; linked clones of objects; trees; herds of animals. Every
name it may use — shapes, kinds and their parameters, behaviours, particles, the 3,091 materials,
the 67 species of trees and plants, the animals — is in **catalog.json**, made from the world's own code, one entry a line.

```json
{
  "name": "Millbrook",
  "anchor": { "at": [1656179.74, 3488786.27, -5053222.57], "heading": 30.77 },
  "prims": [ { "name": "square", "shape": "cube", "at": [0, 0, 0.04], "size": [18, 18, 0.2], "material": "paving/cobblestone/cobblestone-pavement" } ],
  "objects": [ { "name": "bakery", "at": [-12, 6, 0.35], "turn": [0, 0, -80], "prims": [ … ] },
               { "name": "lamp", "at": [6, 6], "prims": [ … ] } ],
  "clones": [ { "of": "lamp", "at": [-6, -6], "turn": [0, 0, 90] } ],
  "trees": [ { "species": "oak", "at": [24, 30], "seed": 3, "scale": 1.1 } ],
  "animals": [ { "species": "sheep", "at": [40, 36], "count": 5, "seed": 7, "territory": 20 } ],
  "views": [ { "name": "square", "eye": [0, -14], "look": [0, 4, 2], "hour": 16 } ]
}
```

## Anchor and frame

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

## Prims

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
| `seat` | `true`: sat on by a click, on its top, facing its +y — a bench, a chair, a vehicle's seat (vehicles.md); or `{ "at": [x, y, z], "turn": 90 }`, its sit target: the hips there in the part's own frame (m, from its centre) and the body turned that many degrees from its +y about the vertical, as a part turns about z — a ring-shaped puf (on its rim, not over its hole), a sofa's places, a stool sat on facing the bar; and `"pose"`, how one sits there (catalog.json → `poses`: a clip, a chair's resting the hips on the top, the rest the feet — a cushion on the floor cross-legged, a pew kneeling, a stage dancing, a car's wheel, a mat or a sun lounger lain on: `ovgrid/lying`, flat on one's back, the head behind the part's middle and the feet to its +y), with a target or without one |
| `seed` | A rock's: whole number, one seed one rock (else one from the build's name and the part's place, the same at every import) |

### Shapes

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

### Kinds

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
| `road` | what its `points`, `width`, `depth` and `lift` make | 0 surface, 1 sides, 2 underside (3 barriers, where `barrier` is said) | a ribbon along 2–32 `points` laid on the ground — with `"round": 1` (or a `grade`) its corners, every point it turns more than 15° at, rounded as the road tool rounds them (arcs of 6 m or twice its width), so that it no longer runs through such a point —, its slab `depth` under it, its surface `lift` (0.1 m) over the ground — or, `"level": "over"`, levelled over the land: straight across within `fall` (%), along it as straight as it can be between its ends, never under the ground and no more than `fill` (m, 2) over it — a dip filled up to so much, a valley deeper gone down into —, its low side and its ends on walls; the land never touched; with `grade` (%, 30 as the road tool lays it) never steeper than that along it, and no steeper than 12.5 % wherever its ends and the ground let it (steeper only where the taut line over the ground between its ends is): on the ground within its fill where its walls keep it so, raised up to 10 m over the ground where they cannot — a valley deeper gone down into —, a deck on columns where its edge's underside stands more than 1.8 m over the ground (past its fill where it lies on the ground; or where water stands under it — `water`, measured as `ground` is: its underside then 0.3 m over the water), barriers along its decks only, on a side whose edge stands more than 1.05 m over the ground beside it — each deck's from end to end, going down to nothing over 4 m onto the walls; along walls none —, all in its sides' face; under a grade, `"columns"` 0 square (an eighth of its width a side), 1 round (as wide) or 2 arches (a pier across the road at each column's place, between each two an arch as a stone bridge's — a semicircle where the ground leaves room, flatter where it is near, solid stone where too low —, open under them: what goes under passes through — a road may run under another's deck or arch where it leaves 4.5 m over the road's surface and the road keeps 0.3 m clear of its columns and piers, as the road tool lays one —), `"barrier"` 0 a parapet 1.05 m tall, 1 a steel guardrail (a beam 0.75 m over the road on posts 2 m apart) or 2 none — said, its barriers are a face of their own, 3 (dress it: a parapet in what it stands on, a guardrail in `metal/bare/metal-0025`), and any barrier collides as a wall 3 m tall (the tool's `ends` pins carry, under a grade, the barrier's height at each joint as two more numbers, so that it goes on through the parts as one; where one road meets another's end, or itself round, both ends carry the same pin — turned where they meet head on —, so that the two go on as one); a climb its grade cannot make, a cliff, is the road tool's red; no `grade`, as steep as its fill makes it, on its walls; under 2 m wide a path; the last point on the first closes it round |
| `bridge` | what its `points`, `width` and the ground under it make | 0 deck, 1 structure (logs, masonry), 2 rails (a stone parapet) | a straight deck from `points[0]` to `points[1]` (`[x, y]` on its two banks, laid on the ground once placed; 60 m at most), `style` `timber`, `stone`, `clapper`, `rope`, `girder` or `suspension`, `railing` `none`/`both`/`open`, for stone `arch` `round`/`pointed`/`segmental`, `lamps` `none`/`ends`/`piers`/`spaced` (`spacing`, `lights`), and a `look` to dress it in; its spans and piers across the gap are worked out from the ground — see *A bridge over a gap* |
| `house` | what its `width`, `depth`, `floors` and `roof` make | 0 walls, 1 the walls of the storeys dressed apart, 2 trim (slabs' edges, reveals, the base), 3 glass, 4 roof, 5 floors, 6 walls inside | a whole modern house in one part, worked out from a few numbers — walls with their windows cut and glazed, floors, a stair, terraces with glass rails, its roof, a base down past the ground and steps to its door —, walked into as drawn; its doors parts of their own that open as someone comes — see *A modern house in one part* |
| `pool` | what its `length`, `width`, `depth`, `deck` and the ground under it make | 0 paving (coping, deck, the steps' treads), 1 lining (the basin, the steps in the water), 2 sides (its base, the steps' flanks) | a pool to swim in, in one part: a basin lined with tiles and raised over the ground (a build does not dig), a coping and a deck round it at its rim, steps up to the deck and steps down into the water; its water comes with it — «A pool in one part» below |
| `furniture` | what its `type`, its model, `width` and `depth` make — its height its type's, a person's | 0 frame (wood or painted; a picture's frame), 1 cover (upholstery; a rug; a picture's mount), 2 bedding (mattress, sheets, pillows; a lamp's shade), 3 throw (a duvet, cushions; leaves), 4 metal, 5 top (a table's; a pot, a vase), 6 art (a picture's painting) | one piece in one part, its front +y, its bottom the floor: `type` `sofa`, `armchair`, `chair`, `stool`, `bed`, `table`, `coffee`, `side`, `desk`, `rug`, `picture`, `plant`, `ornament`, `lamp` or `rack`, its model by the parameter named for it (`"sofa": "chaise"`, `"headboard": "tufted"`, `"rug": "fitted"`), and a `look` (a picture's: its painting); sat on where its recipe says (its `seat` given by the import); varied with no material more by `fabric`, `wood`, `tall`, `legs`, `stout` — see *A piece of furniture* |
| `room` | its floor, `width` × `depth`, and its `height` | 0 wood, 1 fronts, 2 rug, 3 soft, 4 throw, 5 metal, 6 stone, 7 ceramic, 8 leaves, 9 dark, 10 art | a room furnished whole by what it is — `type` `living`, `dining`, `kitchen`, `bedroom`, `bath`, `toilet`, `study`, `lounge`, `passage`, `landing`, `closet` or `hall` —: what nobody sits on in it in one part, what is sat on parts of their own of the `furniture` kind that its recipe stands, seats; laid out from its `walls`, `windows` and where it is come into (`ways`), in a `palette` and its `look` alike — see *A furnished room* |
| `lantern` | its own: 0.3 × 0.3 × 0.46 m | 0 glass (it glows), 1 frame | a lamp's housing — a base, a box of glass, a pointed cap — whose middle is its flame, where a part's light sits: give it `"light": { "on": "night", "range": 8 }` and `"surface": { "emissive": 0.9 }` to light it; under a metre, so its light passes it as its own fixture. A bridge's `lamps` stand one on each of its posts |
| `column` | plinth width, depth, height | 0 shaft, 1 base, 2 capital | upright |
| `arch` | width, wall depth, height | 0 its two faces, 1 the opening, 2 outside, 3 feet | wall in x–z, opening through y |
| `bevel` | its own | box: as a cube; cylinder: as a cylinder | `base` box or cylinder; `edge` round or chamfer, `radius` m |
| `blocks` | its own: its grid's | one a colour, up to 8 | never written by hand: a model's square-cornered solids, made by the tool that rebuilds it — a staircase, a figure of voxels, in one part |
| `outline` | its own: its rings' across x and y, drawn out bottom to top along z | one a colour, up to 8: its edges' and its two ends' | never written by hand: a model's solids drawn out along a way, made by the tool that rebuilds it — a gateway's arch, a wall with round windows, a letter, in one part |
| `solid` | its own: what its `base` fills (box, cylinder, cone, ball or wedge; round ones of `sides`) | 0 its box's; a body's `colour` (1–7) for what it leaves | its `bodies` — prims, hulls, revolves, extrudes, lofts, sweeps and smoothing steps — in metres about its middle, each turned ° about x, then y, then z — see Solids below |
| `rock` | width (y) and height (z); length (x) from `elongation` | 0 surface, 1 cover (crystals: 0 crystals, 1 stone) | `form` boulder, crag (a rock of metres), layered (`layers`), pile (`stones`), crystals (`crystals`, quartz), passage (`stones`: two pillars, a lintel, blocks — a way through) or outcrop (`stones`), these two large, 7–8 m; flat `base` down; sink it a tenth of its height; `cover` puts face 1 on what faces up — dress it in moss or snow; crystals see-through by face 0's `opacity`, glowing by its `glow`; the catalog's `families` are ready recipes |

#### Solids

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
  cage, faceted. The check (scripts/check.mjs) notes a solid smoothed over a cage of more than 400 triangles: few
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

Levelled over the land, `"level": "over"`: its surface no longer the ground's but straight across — leaning as the
ground does, no more than `fall` % (2, a real road's; 0 level from edge to edge) — and along it as straight as it can be
between its ends, no more than `fill` m (2) over the ground (a dip filled up to so much, a valley deeper gone down into),
never under the ground nor the relief the terrain adds between its samples. The land is left as it is: where the ground
leans more than its cross-fall, its low side stands on a wall down to the ground — on a slope of 30° across, a road 7.5 m
wide stands about 4–5 m tall there; with a `grade`, where its edge's underside would stand more than 1.8 m over the
ground past its fill, a deck on columns instead (`road` in the kinds' table) —, and it collides as its walls. Dress its
sides (faces 1 and 2) as a retaining wall: `plaster/concrete/concrete-slab-wall` for asphalt,
`masonry/stone-blocks/rustic-stone-wall-02` for cobbles, `wood/logs/bark-brown-01` for a trail. Written by hand, each part
is levelled on its own, its ends level across as the rest of it, resting on the highest of the ground across them, their
low side and their end on walls down to the ground; the editor's road tool levels a whole road as one and pins where its
parts meet (`ends`, never written by hand).

```json
{ "name": "lane", "at": [3.6, 32.8], "prims": [{ "name": "lane", "kind": "road", "at": [0, 0, 0], "width": 3,
  "points": [[-3.6, -24.2], [-2.8, -16.8], [-4, -8.8], [-2.4, -0.8], [0, 7.2], [2, 15.2], [3.6, 24.2]] }] }
```

Lane lines: a road 7.5 m wide dressed in the bank's two-lane road, `paving/roads/road-007` — white lines 0.55 m in from each edge and a dashed one down the middle —
`"width": 7.5, "surface": { "faces": { "0": { "texture": "paving/roads/road-007", "offset": [-0.4333, 0] } } }`. A road's uvs are metres from its left edge, so the tile is slid
to put its middle on the ribbon's; at another width the lines are not where a lane's would be.

A roundabout is roads of this kind too: two half rings (31 points each, 6° apart, ends square and radial so that they meet edge to edge) with `lift` 0.25, and the roads that run into it go
straight on under it to its middle, at the ordinary 0.1 — a ring that stands 15 cm over what runs into it does not fight it where they overlap (on a slope the two surfaces can differ by 10 cm); its
island a closed ribbon inside, grass on its surface and stone on its sides, `lift` 0.4 and `depth` 0.7, the hole at its middle (a tenth of its radius) filled by a small cylinder. The editor's
road tool lays it: a road of a width, a ring of a radius, the island in the middle.

A longer way is several roads end to end. A road on something built — a bridge's deck — takes
`[x, y, z]` points: it stays where they say.

**A bridge over a gap, in one part**: its two `points` in its own frame — within 31.5 m of its `at`, so stand it at their
middle — written `[x, y]` on the two banks: they are laid on the ground once placed (the ground sampled under the chord about every
metre, the deck's height at each end that of the ground there). Choose the ends from a survey's profile (`--profile`) where the
ground stands at one height either side, a metre or two back from where it falls away; the kind does the rest, the same for
everyone who sees it: where the ground falls away from the deck (the gap), evenly spaced spans across it (none longer than the
style's) and a pier between each two, let into the ground, railings both sides. `"style": "timber"` — logs: a deck of planks on
stringers over bents of posts, spans up to 8 m, piers up to 10 m, a gap from 0.6 m deep — `"stone"` — arches: spans up to 12 m,
piers up to 16 m, a gap 3 m deep at least, solid banks to either side — `"clapper"` — slabs of rough stone on piles of blocks, for a
stream: spans up to 3 m, piles up to 2.5 m, a gap from 0.5 m, no railings, 3 m wide at the most — `"rope"` — planks hung on ropes between
anchor posts, one span up to 60 m, no piers, 2 m wide at the most, a gap from 2 m, the deck hanging by a thirtieth of its length at
the middle (never steeper than 1 in 8) — `"girder"` — a deck of concrete on girders over hammerhead piers: spans up to 20 m, piers up to
18 m, a gap from 1 m — or `"suspension"` — a stiff deck hung from cables over a tower at each support, 4–10 m over the deck: spans up to 60 m, piers up to 25 m, a gap from 2 m —;
a style that does not suit the ground says why (a pier too tall, too wide, too shallow); `width` 2–3 m for walkers, 4–6 for a lane (0.8–12);
`"railing"`: `"none"`, `"both"` (the default: posts and two rails of logs, a parapet of stone, two ropes, steel posts and two rails) or `"open"` (posts and a rope,
a low wall of stone, one rope, one steel rail); `rise`, how far the deck is raised in the middle by ramps of 1 in 8 — for a rope bridge, how much of its
sag is taken out — over a lake, a stream or the sea it is
set for you, so that its underside clears the water by 0.3 m (a rope bridge that even taut would be in the water is refused by the tool, which says it is too low; placed any other way it hangs as taut as it can). Its faces come dressed from the bank (planks or paving, logs or
masonry, rails) unless it has a `material` or a `surface`.

**Looks**: `"look": "granite"` dresses it in one of its style's sets of the bank's materials — logs: `oak` (the default), `dark`, `pine`
(aged, silvered), `mossy`; stone: `rustic` (the default), `granite`, `sandstone`, `mossy` (limestone), `brick`; clapper: `granite`, `slate`, `mossy`,
`sandstone`; rope: `hemp`, `dark`, `mossy`, `steel`; girder: `concrete`, `steel`, `rusted`, `white`; suspension: `orange`, `grey`, `white`, `planked`. A look its style has not is
the style's first, said. It is a field of the part, like `material`, not of its recipe: the faces are what it keeps, so a look
can be chosen on the card (its Look row shows the look the faces make, Custom where they were painted by hand).
**Arches** of a stone bridge: `"arch": "round"` (the default; a semicircle where the ground leaves room for it), `"pointed"` (two arcs meeting at
a crown, taller; where the ground leaves no room for the point it is the round one) or `"segmental"` (a flat quarter of the opening).
**Lamps**: `"lamps": "ends"` (a post and a lantern each side of both ends), `"piers"` (the ends and the piers between them
that leave 12 m, one in turn on each side) or `"spaced"` with `"spacing": 14` (m, 12–40, one in turn on each side), never more
than 8 a bridge; `"lights": "night"` (the default: lit at night, 8 m round) or `"off"` (dark glass). The post is drawn with the
bridge; its `lantern` is a part of its own that the importer adds beside the bridge — one written in the build at the post is kept
as written, not doubled. Count them: a build's lights are budgeted, and the check counts an object's together, so a long crossing of
several parts is an object each.

```json
{ "name": "creek", "at": [14, 6], "prims": [{ "name": "footbridge", "kind": "bridge", "style": "timber", "at": [0, 0, 0],
  "width": 2.4, "points": [[-12, 0], [12, 0]] }] }
```

A part is 60 m at most (64 m a side): a longer crossing is two bridges that meet on a pier, each ending on half of it, their decks
at one height there, written with `[x, y, z]` points and their `ground`.
`node scripts/check.mjs` says what is wrong with a bridge: a step of more than 0.3 m up onto its deck, a deck buried, a rise in
the way, a pier past its style's tallest, a deck steeper than 1 in 8.

**A modern house in one part** (`house`): when a street or a neighbourhood needs houses and none of them is the subject, do not
build each from walls and solids — one part is a whole house, at most 5,000 triangles, 1,600 far away (about 3,400 and 1,000 at 22 × 16 m). Its front is its **+y**;
`width` and `depth` (6–40 m; 13 × 10 where left out) are its ground storey's, its `at` the middle of its box — which is not the
middle of its ground storey: its box has its steps, an eave, a carport. **Build a new one
with `"scale": "game"`, 14 m or more each way** — 22 × 16 m is a good house, 14–24 m wide a street's —: a house is walked through
by an avatar with a camera 4 m behind and over it, and what suits a person's floor plan is cramped for that. At a game's scale its
storeys are 4 m (3.75 m clear), its doors 1.4 m wide and 2.7 m high, its stair 2 m wide on the same steps, its windows half as
wide again, its rooms ones the camera stays inside, and its front door is set back 3 m from the street's face of the house in a
recess open to the street under the storey over it — an entrance outside, sheltered, not a door flat on the wall. Left out
(`"real"`), it is as houses were first made: storeys 3.2 m, a stair 1 m wide, 24 m a side at the most. A house under 11 × 12.5 m
keeps a person's scale whatever is asked. `style`: `box` (rendered walls, ribbon
windows, a parapet, an upper storey that may stand back from a terrace), `wood` (timber cladding, upright windows, eaves),
`glass` (glass from floor to ceiling between slabs that stand out past it), `stack` (each storey a volume of its own, the upper
one out over the door, a terrace beside it), `chalet` (a steep roof swept out over its front; in the middle of the front a bay
of glass through every storey under a vault of its own, open to the living room; its door in a porch beside the bay, under a
balcony, with the house's side wall gone on forward to close it, and a second balcony at the bay's other side — that porch is its
entrance, it has no recess; its bay stands 3.6 m out at a game's scale, so its box is that much deeper at the front; a front under
10.6 m has no bay), `lodge` (a long steep roof gone on 4.5 m past each end of the house over a covered terrace, a post at each
outer corner; in the middle of the front a bay under a gable of glass up to its ridge; its door in a porch beside the bay that
opens onto one terrace, a way out from the living room onto the other; no balconies — best with one storey; its box is 9.6 m
wider than its `width` and 3.6 m deeper at the front) or `barn` (an L: a hall under a ridged roof — the living room, open up to
it —, its end away from the stair glass from the floor up to the roof with a terrace 4.5 m out before it under a flat canopy and
a way out onto it; behind the hall the back of the house — the row of bedrooms of a house of one storey — low under a flat roof,
which goes on past the other end as a wing of one storey: a garage 9.6 × 9.5 m inside, its door one leaf 4.4 m wide and 3 m high
that slides aside along the wall as someone comes or on a click, a ramp before it down to the ground and a door into the house;
the front door in the half of the front the wing is at — best with one storey; its box is 14.4 m wider than its `width`, the
wing at one end and the terrace at the other, so leave that room beside it; a house under 10 m deep has no wing) or `manor` (a
mansion, the same either side of its middle: its front door, always two leaves, in the middle under a portico — four columns,
six with a front of 36 m or more, as tall as its walls, an entablature and a pediment over them, on a landing 3.2 m out with
steps as wide down to the ground —; tall sash windows in line from storey to storey; a cornice and a hipped roof; a chimney at
each end; its ground storey dressed apart from those over it, its columns and trim marble; divided into rooms (`rooms`), a hall
through its middle from the door to the back wall with the stair in it, the living room and the study at the front either side
of it, the dining room and the kitchen behind them, a bedroom at each corner of the storeys over, and with `"rooms": "doors"`
the doorways from the hall into the living room and the study two leaves each — hinged, or with `"sliding"` sliding into the
wall —, twelve doors inside at the most — give it 28 m of front or more, 18 m of depth and two storeys, and its own roof, `hip`;
its box is 3.6 m deeper at the front), `villa` (a modern mansion, the same either side of its middle: glass from floor to
ceiling on every side under a flat roof 2.2 m out past its walls; every floor 1.8 m out past them — a terrace all round each
storey over the ground one, railed with glass, a way out onto it from the landing, and with `"sliding"` a pane of each bay; a
podium round the ground storey, steps down from it before the door, two leaves in the middle; inside, a mansion's hall and
rooms — give it 26 m of front or more and two storeys; its box is 4.4 m wider and deeper than its ground storey), `cabin` (a log cabin: walls of logs in courses, a round log standing at each corner, a porch all along its front on log posts — under its roof swept out over it where it is of one storey under a ridge, else under a shelter of its own —, railed with logs but before its steps, a chimney of stone up one end wall and its base of that stone; no recess: its door is in the front wall under the porch — small and low it is at its best: 14–18 m of front, one storey, `gable` or `steep`; its box is 3.3 m deeper at the front and a chimney wider at one end), `cantilever` (the storeys over the
ground one larger than it: on past the end of it away from its stair — a fifth to a third of its width, 3.6–6 m at a game's
scale —, their end all glass, over a terrace the house's floor goes on as, a way out onto it from the ground storey; a third
storey as the second, or back at the ground one's end over a terrace of its own — give it two storeys or three: of one it is a
plain box; its box is as much wider at one end), `plates` (a layered house: each storey a box of its own between slabs that
stand out a metre past it and a flat roof 1.6 m, shifted against the one under it — on past the far end and back from the front
over a terrace, then back from the far end and out over the front, or the other way round first —, glass from floor to ceiling
before and at its far end, and the wall its stair stands beside gone on as a blade in its second wall material: 0.45 m thick,
outside the wall, from a quarter of the house's depth behind its front to before all that stands out there, a metre up past the
roof — give it two storeys or three, three at its best, and `flat`: of one storey it has no blade; at a game's scale its box
is up to 7.5 m wider and 6.2 m deeper than its ground storey), `terrace` (a roof-terrace house: the top storey a pavilion in the corner its stair stands
in — a third to a half of the width of the one under it, back from its front; at a game's scale 11 × 12.5 m at the least —, the
roof under it a terrace round two sides of it railed with glass, a way out onto it, its own flat roof 1.2 m out over it; of three
storeys the one between as the ground one, or back from its far end over a terrace too — give it two storeys or three, 20 m of
front or more, and `flat`), `ell` (an L-shaped house: an arm of glass standing out of the front at its far end, flush with the
house's side, nearly half the front wide and 3.6 m out at a game's scale, in its second wall material — as high as the house
under its flat roof gone on over it and over the porch, its glass one pane from its floor to that roof, the ground storey open to
it and the storeys over it looking into it across a rail: a hall two storeys high; or, one `variant` in three of a house of two
storeys or three, a storey lower, its roof a terrace railed with glass with a way out onto it —; the door by the corner the two
make, in a porch under a balcony, no recess — give it two storeys and `flat`; its box is 3.6 m deeper at the front and a metre
more all round) or `platform` (a platform house: every floor 2.4 m out past its walls — a podium round the ground storey, steps
down from its edge before the door, and a terrace railed with glass all round each storey over it, a way out onto each —, and
the top storey a pavilion in the corner its stair stands in, the floor it stands on far wider than it, its own roof 1.2 m out —
give it two storeys or three and `flat`; its box is 4.8 m wider and deeper than its ground storey); `floors` 1–3; `roof` `flat`, `mono` (one pitch rising to the front),
`gable`, `butterfly`, `steep` (two steep pitches from a ridge along its width, as high as three fifths of its walls, 31° to 50°,
the storey under it open up to them — the chalet's own; on any other style, a barn's roof) or `hip` (four pitches up from the
eaves to a ridge along the longer side, on a flat slab that is the top storey's ceiling: the house under it as under a flat roof); `glazing` 0–1 (0.5 the style's own); `variant` 0–9999, which of its style's houses it is — where its door
and stair are, which storeys stand back, which bays are glazed: one number, one house, the same for everyone. A `look` dresses it
from the bank, six to each style and a seventh to the cabin — box: `white`, `stucco`, `concrete`, `grey`, `charcoal`, `ochre`; wood: `cedar`, `dark`, `oak`,
`boards`, `charred`, `solar`; glass: `concrete`, `travertine`, `walnut`, `white`, `steel`, `board`; stack: `cedar`, `concrete`,
`stone`, `charcoal`, `ochre`, `boards`; chalet: `white`, `blue`, `timber`, `alpine`, `stone`, `ochre`; lodge: `walnut`,
`charred`, `white`, `cedar`, `stone`, `boards`; barn: `black`, `white`, `brick`, `cedar`, `concrete`, `boards`; manor: `stone`, `white`, `brick`, `ochre`,
`grey`, `slate`; villa: `travertine`, `concrete`, `white`, `cedar`, `black`, `marble`; cabin: `logs`, `beams`, `dark`, `pine`, `brown`, `weathered`, `fieldstone` (its walls of stone, its timber dark, its roof of sheet metal);
cantilever: `white`, `cedar`, `concrete`, `stone`, `black`, `walnut`; plates: `walnut`, `white`, `cedar`, `charcoal`, `board`,
`travertine`; terrace: `white`, `travertine`, `concrete`, `ochre`, `stone`, `charcoal`; ell: `white`, `concrete`, `brick`,
`charcoal`, `stone`, `cedar`; platform: `travertine`, `white`, `concrete`, `cedar`, `black`, `ochre` (a chalet's and a lodge's second wall
material is its bay's, an L-shaped house's its arm's, a barn's its wing's, a manor's, a villa's, a cantilever's, a roof-terrace
house's and a platform house's their upper storeys', a
cabin's its stone — its base and its chimney —, a layered house's its blade's, its trim its slabs' edges and its last the undersides of its slabs) —, six materials at
the most. **Houses side by side read as one unless they differ**: give
neighbours different looks, different `variant`s and the roofs that suit their style (box: `flat`, `mono`; wood: `mono`, `gable`,
`butterfly`; glass: `flat`, `butterfly`, `mono`; stack: `flat`; chalet and lodge: `steep`; barn: `steep`, `gable`; manor: `hip`; villa: `flat`; cabin: `gable`, `steep`; cantilever: `flat`, `mono`; plates, terrace, ell and platform: `flat`), as the editor's tool throws them at each house. Stand it on the ground: its floor a hand over
the highest ground under its rectangle, `plinth` how far its base goes down under its floor (past the lowest ground under it, 3 m
at most — over 2 m the check says the ground falls too far) and `stoop` how far the ground before its door lies under its floor
(steps go down to it, 1.5 m at most); a `barn` besides `drive`, how far the ground before its garage lies under its floor (its
ramp goes down to it, six times as long; 1.5 m at most) — the ground read under its wing and its terrace too. Its front door is larger than any door inside: `"entrance"` `"single"`, one leaf (1.8 m wide and 3 m high at a game's scale,
1.1 × 2.3 m at a person's — doors inside are 1.4 × 2.7 m and 0.9 × 2.1 m); `"double"`, two leaves that meet in one doorway, nothing
between them (2.8 m at a game's scale, 2 m at a person's: two doors of the `door` kind with `"jambs": "hinge"`, each with only the
jamb it hangs on — a double door anywhere is made so); or **`"suited"`, by the house's size — two leaves where its front is 22 m
or more, one under that: what a house built now is given**. `"lighting"`:
`"storey"` (one linear light on each storey's ceiling) or `"room"` (two) — each storey a zone with a switch of its own, by the
front door and by the stair, that a click turns on and off and that lights the storey by itself while someone is in it: six
lights at the most, off while nobody is in, so a street of them stays within a place's lights. `"lift": "platform"`, with two or
three storeys: a shaft of glass in the corner by the stair, a platform a click sends to its next stop and a button on each storey
that calls it — 2.1 m across, for four avatars, at a game's scale (1.3 m at a person's). `"sliding"`: `"doors"` — the door onto each terrace two panes of glass in a doorway of 2 m, one sliding over the
other as someone comes or on a click, and one pane of each bay glazed from floor to ceiling that has floor outside it (the ground
storey's, a terrace's) sliding on a click: ways out to a garden or a terrace — or `"all"`, a pane of every window of two panes or
more besides; eight sliding panes a house at the most (a barn's garage door one of the eight), each a thing that moves in the build's budget (what moves is what is
used: `"doors"` for a street, `"all"` for the one house that is the subject). `"forms": "varied"` lets its `variant` shape it
more — by a chance each, as its style allows: a band of its front and one side in its second wall material (box), a canopy with
a fin over its door (at a person's scale: a game's recess is its shelter), a carport beside it, a balcony before an upper storey, a pergola over a terrace, a chimney — so that houses
of one style and size differ in outline; its box grows with them (a carport is 3.4 m beside it), so lay it out by
`KINDS.house.footprint`, not by its `width`. `"rooms"` divides its storeys: `"rooms"` — on the ground storey a toilet off the
foot of the stair, the kitchen and the dining room along the back and the living room open (a study where it is wide); above, a
bathroom and a closet by the landing (a second bathroom with three bedrooms or more), a passage and bedrooms across the front, a
lounge where they leave room; in a house of one storey the bedrooms and their bathrooms in a row across the back, each with its
door on the living room, the kitchen at the row's end — with their doorways open, or `"doors"`, a door besides in each
bathroom's, bedroom's, closet's and study's doorway (eight at the most, bathrooms first, each a thing that moves: `"rooms"` for a
street). At a game's scale a passage is 3 m wide, a doorway 1.4 m, a bedroom 5 to 8 m across and 4.5 to 7 m deep, a bathroom
3.2 m; rooms take what they need and no more, what is left being open floor (a lounge, a wider passage, the living room).
`"bedrooms"` says how many each storey of bedrooms has, 1 to 4: a storey over the ground one is not cut narrower than they need,
and one too narrow has fewer (at a game's scale two want 11 m of width, three 16 m, four 21 m; in a house of one storey, where
the bathrooms stand in the row, two want 14 m, three 19.5 m, four 28 m); left out or 0, as many as its width suits. (At a
person's scale a hall besides, inside behind the front door; a game's has its entrance outside.) The
importer adds its doors — the `door` kind in each doorway, with the `door` behaviour, each opening into the house —, its lights and switches (the `switch` behaviour reaches the
lights of its own object), its lift's platform and buttons, its sliding panes (the `window` kind with the `slide` behaviour), so give
each house an object of its own. **Place that object at the house's site — the middle of its ground storey, on its floor — and the
house within it at its box's middle**: a build imported again is updated where it stands, every object left where it is, so a
house whose object was placed by its box's middle sinks into the ground when it is made again taller, and one placed by its floor
stands on it whatever it becomes:

```json
{ "name": "number 4", "at": [16, -15.3, 0.1], "turn": [0, 0, 0],
  "prims": [{ "name": "house", "kind": "house", "style": "stack", "look": "cedar", "at": [-2.4, 0.915, 6.495],
              "width": 22, "depth": 17, "floors": 3, "roof": "flat", "variant": 5, "plinth": 0.46, "stoop": 0.15,
              "lighting": "storey", "lift": "platform", "sliding": "doors", "forms": "varied", "rooms": "rooms",
              "scale": "game", "entrance": "suited", "bedrooms": 3 }] }
```

**A house that comes furnished**: `"furnished"`, with its storeys divided (`"rooms"`: a house of open storeys has no rooms to
furnish) — `"oak"` (oak and linen), `"walnut"` (walnut and bouclé) or `"white"` (white and charcoal). Each of its rooms is then a
part of the `room` kind (*A furnished room*, below) laid out by what it is from the house's own plan — its walls, its windows and
their sills, its doorways, its stair and its lift are read by the house: write none of it —, and what is sat on in it parts of
their own of the `furniture` kind, each a seat; which pieces stand where follows the house's `variant` — and so do its wood's
tone, its furniture's proportions and each room's cloth colour (*A piece of furniture*, its variety): houses alike but for their
`variant` are each furnished their own way, the same models and not a material more. The importer stands them
with its doors, in the house's object: write only the house. Furnish at a game's scale. A house of 22 × 16 m on two storeys
brings 24 to 40 parts and 6,400 to 10,000 triangles from near, nothing from far; three storeys of 40 × 30 m 78 parts and 20,000
triangles, the most a house brings. A palette is some fifteen materials, the three of them 28 — a street in all three has them in
its 40 —; neighbours in different palettes are different homes. (At a person's scale a few rooms stay without what they
are for: a glass house's, a manor's or a villa's dining room, a villa's kitchen.)

```json
{ "name": "furnished house", "at": [52, -6, 0.446],
  "prims": [{ "name": "house", "kind": "house", "style": "box", "look": "white", "at": [0, 1.12, 3.74],
              "width": 22, "depth": 16, "floors": 2, "roof": "flat", "variant": 3, "plinth": 0.97, "stoop": 0.44,
              "lighting": "storey", "forms": "plain", "rooms": "doors", "scale": "game", "entrance": "suited", "bedrooms": 3,
              "furnished": "oak" }] }
```

Here the object stands 0.1 m over the ground (its floor), and the house's box — 26.8 × 18.8 × 13.9 m, with its carport on one side,
the storey out over its front and its base 0.46 m under its floor — has its middle 2.4 m to one side of the ground storey's, 0.9 m
before it and 6.5 m over the floor.

**A neighbourhood**: houses side by side along a street are a neighbourhood when each stands on its own lot facing the street —
its steps' foot some 7.5 m from the street's edge, 6 m or more between neighbours, a path (a `road` 1.6 m wide, two `[x, y]`
points, lying on the ground) from its door to the street —, each on its own ground (its `plinth` and `stoop`), with few looks
among them (two to a style) and trees in the gardens. In the editor the Neighbourhood tool lays one where it is clicked: a
street that closes round, twelve lots at its defaults, a mansion with a pool behind it.

**A pool in one part** (`pool`): a pool to swim in — beside a house, in a garden — is one part; do not carve it from solids.
`length` × `width` (4–30 × 2.5–15 m; 10 × 5 where left out) are its basin's, inside; `depth` its water's (0.4–2 m, 1.4 where left
out: **from 1.3 m it is swum in**, shallower it is waded); `deck` how far its paving goes on round it past its coping (0–6 m, 1.5);
`steps` where its steps are — `end`, the middle of its +x end, or `side`, of its +y side —: those up to the deck from the ground
and, before them inside the basin, those down into the water; `water` `calm` or `rippled`; `style` what its deck is of, `stone` or
`timber`, with a `look` each (stone: `travertine`, `marble`, `granite`, `terrazzo`, `dark`, `white`; timber: `cedar`, `deck`,
`dark`). 338 triangles at the most.

**It stands over the ground: a build does not dig.** Its basin's floor is over the highest ground under the basin, so its rim —
the top of its box, the level of its deck — stands its `depth` and 0.27 m over that ground (1.67 m where its depth is left out):
a raised pool, its base a block down to the ground, steps up to its deck. Two numbers say where the ground is, as a house's do:
`plinth`, how far its base goes down under its rim (past the lowest ground under it), and `stoop`, how far the ground at the foot
of its steps lies under its rim. On level ground `stoop` is `depth` + 0.27 and `plinth` is `depth` + 0.57. A house whose terrace
is to be level with it wants its own floor as high (a house's `plinth` and `stoop`).

**Its water comes with it**: an object that holds a pool is given, when the build is placed, a second part — a box of
`effects/water/calm` (or `rippled`) that fills the basin up to 0.12 m under the rim, tinted turquoise: a body of water, swum and
dived in, drawn as a lake. Do not write it. Write the pool as an object of its own whose place is **its basin's middle at its
rim** — the pool's own origin: x along its length, z up from its rim —, the part's `at` the middle of its box in that frame (its
box has its steps at one side, and goes down `plinth` under the rim):

```json
{ "name": "pool", "at": [92, -30, 1.47],
  "prims": [{ "name": "pool", "kind": "pool", "style": "stone", "look": "travertine", "at": [0, 1.6, -1.205],
              "length": 12, "width": 5, "depth": 1.5, "steps": "side", "plinth": 2.41, "stoop": 1.96 }] }
```

Here the rim stands 1.77 m — 1.5 m of water and 0.27 m — over the highest ground under its basin, which lies 0.3 m under the
anchor's; its box, 15.9 × 12.1 × 2.41 m, has its middle 1.6 m towards its steps and 1.205 m under its rim.

**A piece of furniture** (`furniture`): a sofa, an armchair, a chair, a stool, a bed, a dining, coffee or side table, a desk —
one part each, worked out from a few numbers, as light as a piece can be (320 triangles at the most, a sofa about 250, a chair
60–90; from a few metres off simpler, from far nothing). Its heights are a person's whatever the room: a seat 0.45 m over the
floor, a table 0.75, a coffee table 0.4, a side table 0.52, a mattress 0.52.

| `type` | its models (the parameter named) | `width` × `depth` (m) |
|---|---|---|
| `sofa` | `sofa`: `track` (square arms), `rolled`, `chaise` (a chaise at its +x end), `modular` (low, no arms, cushions at its back), `chesterfield` | 1.5–3.4 × 0.85–1.05 (`chaise` 2.3–3.4 × 1.4–1.8; `modular` 0.95–1.15 deep) |
| `armchair` | `armchair`: `lounge`, `club`, `wing` (1.05 m tall) | 0.7–1.05 × 0.75–1 |
| `chair` | `chair`: `dining` (wooden), `upholstered`, `shell` — `count` 1–6 side by side, one part (a dining table's side), each a place | 0.42–0.6 × 0.46–0.62 |
| `stool` | `stool`: `bar` (its seat 0.76 m up, a ring for the feet), `low` — `count` 1–6 in a row, one part (an island's) | 0.34–0.5 across |
| `bed` | `headboard`: `panel`, `padded`, `tufted`, `channel`, `slatted`, `wing`, `arched` | its mattress's width + 0.08 — 0.9 single, 1.4–1.6 double, 1.8–2 king — × 2.05–2.3; its box 0.12 m wider (the headboard) |
| `table` | `table`: `legs`, `trestle`, `round` (to 1.6 m across) | 0.8–3 × 0.8–1.2 |
| `coffee` | `coffee`: `slab`, `legs`, `round` | 0.6–1.6 × 0.5–1 |
| `side` | `side`: `cube` (a drawer), `legs`, `round` | 0.38–0.65 × 0.34–0.6 |
| `desk` | `desk`: `legs`, `drawers` | 1–2 × 0.55–0.85 |
| `rug` | `rug`: `rectangle`, `round`, `runner`, `fitted` (a carpet wall to wall, 8 mm) | 0.6–6 × 0.6–5 (`round` 0.8–4 across; `runner` 1.8–6 × 0.6–1; `fitted` 1–10 × 1–10), 12 mm thick |
| `picture` | `picture`: `framed`, `canvas` (wrapped, no frame), `mounted` (a white mount in a slim frame) | `width` × `height` 0.25–3 each, 4.5 cm deep: hung, its back on the wall (its −y), its bottom where it hangs |
| `plant` | `plant`: `tall` (1.4 m), `bush` (0.85 m), `cactus` (1.3 m) — in a pot | its model's |
| `ornament` | `ornament`: `vase`, `bowl`, `jar`, `books`, `sculpture`, `candles` — on a table, a shelf, a plinth | its model's (0.1–0.44 m tall) |
| `lamp` | `lamp`: `floor` (1.62 m), `arc` (2 m, over 1.3 m), `table` (0.56 m) — no light of its own: give the part one if it is to light (Light) | its model's |
| `rack` | `rack`: `standing`, `tree` (a coat tree), `wall` (a board of hooks under a shelf, hung), `rail` (a clothes rail) | its model's |
| `wardrobe` | `wardrobe`: `doors`, `sliding`, `open` (a rail and shelves) — 2.2 m | 0.9–3 × 0.55–0.65 |
| `shelf` | `shelf`: `books` (a bookcase of five shelves, its books), `cubes` (1.5 m), `ladder` (leaning, 1.9 m) | 0.6–2.4 × 0.3–0.42 |
| `sideboard` | `sideboard`: `doors`, `drawers`, `legs` — 0.8 m | 1.2–2.4 × 0.4–0.5 |
| `tv` | `tv`: `stand` (a low unit, the screen on it), `wall` (a screen over a floating shelf, hung) — its screen 16 by 9 of 0.72 its width | 1.2–2.6 × 0.4–0.45 |
| `toilet` | `toilet`: `floor`, `wall` (hung: its bowl off the floor, a flush plate) — sat on | its model's |
| `basin` | `basin`: `vanity` (a cabinet, a vessel and a tap on its counter), `pedestal`, `double` | `vanity` 0.6–1.2, `double` 1.2–1.8, 0.5 deep; `pedestal` its own |
| `bath` | `bath`: `built` (its panel to the floor, against walls), `free` (round at its ends, on feet) — sat in, on its bottom | 1.5–1.9 × 0.7–0.9, its rim 0.58 (0.66) m |
| `shower` | `shower`: `tray` (a tray in a frame, a head), `walk` (walk-in: a wall of tiles at its side) — walked into, nothing collides | 0.8–1.6 × 0.8–1.2 |
| `kitchen` | `kitchen`: `run` (base units, a worktop with a sink and a hob, upper units and a hood over it, 2.3 m), `island` (its worktop out over its front for stools, 0.92 m), `tall` (a fridge's and an oven's column, 2.2 m), `counter` (base units alone, for under a window: its worktop 0.92 m, the sink's tap rising over it to 1.22) | `run` and `counter` 1.2–6 × 0.62, `island` 1.2–3 × 0.9–1.3, `tall` 0.6–1.2 × 0.62 |

**A picture**: its look is its painting — `"look": "tivoli"`, one of the bank's paintings in the frame that suits it (catalog.json
→ `kinds`: `mondrian`, `cafe`, `cottage`, `tivoli`, `twilight`, `snow`, `kashmir`, `yosemite`, `garden`, `bath`, `bottle`, `bamboo`,
`cloud`, `oasis`, `seine`, `tiger`) — and the painting covers its canvas once, whatever its size (the import gives its face 6 the
canvas as its `scale`). Give it the painting's shape: its canvas is the picture less its frame (4.5 cm a side; a mount 10 cm; a
canvas none), so a `framed` picture of a painting of 1.1 × 0.84 m shown at 1.3 times is `"width": 1.54, "height": 1.18`. Hang it
with its back on the wall's face, its middle about 1.7 m over the floor (higher on a game's storeys of 4 m: 1.9–2.1). What dresses
a room collides with nothing: a rug walked over, a picture, a plant, a lamp, a coat rack walked through.

`width` and `depth` 0 (or left out) are the type's own; one past its range is held to it. Its looks are by type
(catalog.json → `kinds`: a sofa's `linen`, `boucle`, `charcoal`, `leather`, `navy`, `olive`; a bed's `oak`, `walnut`, `white`,
`velvet`, `terracotta`, `charcoal`; a table's `oak`, `walnut`, `white`, `marble`…). **Give it no `seat`**: a sofa, an armchair, a
chair, a stool and a bed are seats where their recipe says — a place a person a sofa's width holds, the hips over its cushions,
leaning back; a bed lain on, flat on one's back, the head on its pillow and the feet to its foot, a place to each pillow —, which the import gives them; `"seat": false` makes one
that is not sat on, a `seat` of its own puts one elsewhere. What one walks round collides (its seat and its back, a bed and its
headboard, a table whole). A part's `at` is its box's middle: on a floor at height `f`, `[x, y, f + height / 2]`.

**Its variety**: five parameters, each left out where a piece is as its model has it — the same models looking different, with
no material more. Two colour it: `"fabric"`, the colour of what it is upholstered in (a sofa's, an armchair's or a chair's cover
and the cushions one sits on, a bed's padded headboard and its sheets, a rug) — `ivory`, `sand`, `ochre`, `terracotta`, `rose`,
`sage`, `teal`, `sky`, `slate`, `plum`, `graphite` —, and `"wood"`, the tone of whatever of it is dressed in a wood of the bank
(its frame, its legs, a top, fronts) — `honey`, `amber`, `chestnut`, `mahogany`, `smoke`, `ebony`. They are tints the import lays
over its look's own materials (a face's `tint`: write none yourself), so pieces that differ by them alone share one mesh and a
street of them costs nothing more. A tint darkens: dress what is to take a colour in a light look (a sofa's `linen`, a chair's
`white`, an armchair's `leather`; a table's `oak` or `white` for a tone) — a charcoal sofa stays charcoal —, and its scatter
cushions and its duvet stay its look's, the accent beside the colour. Three shape it, each 0–1 with 0.5 its model's own:
`"tall"`, how tall what stands up of it is (a seat's back, a bed's headboard, a stool, a coffee or a side table, a wardrobe,
shelves, a sideboard — a sofa 0.75 to 0.99 m, a padded headboard 0.9 to 1.54); `"legs"`, how high a sofa, an armchair or a bed
stands on its feet; `"stout"`, how thick its arms, its legs and its top are. A seat's top, a mattress's and a dining table's stay
a person's. Each shape is a mesh of its own: give pieces that are to share one the same three numbers.

```json
{ "name": "sofa", "kind": "furniture", "type": "sofa", "sofa": "chaise", "width": 2.8, "depth": 1.6, "look": "boucle", "at": [0, 2, 0.425] },
{ "name": "bed", "kind": "furniture", "type": "bed", "headboard": "tufted", "width": 1.8, "look": "velvet", "at": [4, -3, 0.625] },
{ "name": "teal sofa", "kind": "furniture", "type": "sofa", "sofa": "track", "look": "linen", "fabric": "teal", "wood": "chestnut", "tall": 1, "legs": 1, "at": [8, 2, 0.493] }
```

**A furnished room** (`room`): a room furnished whole by what it is, in one part — a house of the `house` kind furnishes its own
(its `"furnished"`, above: write a room only where there is no such house, a room built of walls) —: what nobody sits on in it drawn as one mesh, seen
from as near as a piece is whatever its floor; what is sat on (a sofa, armchairs, a row of chairs at a table, a bed, a toilet, a bath,
an island's stools) parts of their own of the `furniture` kind that its recipe stands, as a house stands its doors, each with its seat.
Its layout is worked out from its `type`, its floor and what it is told of it — the same for every peer; `variant` chooses among the
ways it may be laid out — by a game's rules: a bed between its side tables, its head to a wall; a sofa before a low table on a rug, an
armchair either side — its back to a wall, or free in a room all of glass —; a table between its rows of chairs, as many places as its floor leaves (eight, six, four) — in a room too
narrow to go round one, against a wall with a row of chairs along its open side —; a kitchen's run along
its longest wall, base units alone under a window, its tall units, an island where it is deep enough — in a room all of glass, an
island alone —; a bath, a toilet, a basin, a
shower; a desk and its chair; what is left open floor. What it is told, in its own frame (its middle at the part's, x along its width):

- `walls`: the stretches it may stand against, `[side, from, to]` — side 0 its back (−y), 1 its right (+x), 2 its front (+y), 3 its
  left (−x) —, from and to along x (back, front) or y (sides). None given: all four whole.
- `windows`: `[side, from, to, sill]` — nothing stands before one higher than its sill, a hand over it at the most (a worktop meeting
  it); no picture is hung over one.
- `ways`: `[x0, y0, x1, y1]`, where it is come into and gone out of — a doorway's landing, a side open to the next room, the floor
  beside a stair or before a lift. Wherever its pieces stand, each stays joined to every other by a way `way` m wide (1.4 at a game's
  scale, a doorway's width), clear of what stands and of its walls: the avatar and the camera behind it go through.
- `keep`: what nothing stands on (a doorway's landing, a stair's foot, before a switch); `closed`: what is not walked through either
  (a stair's well, a lift's shaft).

Its look is its palette, given twice, as `palette` and as `look`: `oak` (oak and linen), `walnut` (walnut and bouclé), `white` (white
and charcoal) — what is sat on in it dressed alike. Its variety is the furniture kind's five, given to the whole room: `"fabric"`
colours its rugs and what is sat on in it, `"wood"` its wood, its fronts and its seats' frames, and `"tall"`, `"legs"` and
`"stout"` shape every piece that takes them — a set that matches; a picture hangs clear over what stands under it however tall. A
house that comes furnished picks all five itself, by its `variant`. A part's `at` is its box's middle: on a floor at height `f`,
`[x, y, f + height / 2]`.

```json
{ "name": "bedroom", "kind": "room", "type": "bedroom", "palette": "walnut", "look": "walnut", "width": 5, "depth": 4.5, "height": 3.75,
  "walls": [[0, -2.5, 2.5], [1, -2.25, 2.25], [2, -2.5, 1], [3, -2.25, 2.25]], "windows": [[0, -1, 1, 0.9]],
  "ways": [[0.7, 0.85, 2.5, 2.25]], "keep": [[0.7, 0.85, 2.5, 2.25]], "at": [0, 0, 1.875] }
```

A kind's uvs are in metres: its material lies at real size on every face. A kind whose mesh
depends on its size (door, window, roof, fence, arch, column, bevel) makes a mesh for each size
used: give alike parts the same size and they share it.

## Materials by use

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

## Surface

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

### Mirrors

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

### Media: videos, GIFs and stickers on a face

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

### Live media: a voice zone, a screen, a file drop, a mirror

A prim may carry a live module, people's own media peer to peer for whoever comes near — `"live": { "type": "voice" }`
(whoever stands within `radius` m hears the others on air), `{ "type": "screen", "face": 3 }` (that face shows a
camera or a screen someone shares), `{ "type": "drop" }` (a file dropped on it reaches everyone near, or with
`"to": "owner"` its owner alone). Each takes `"who": "anyone" | "owner"` (who goes on air), `radius` (m) and
`quality` (voice kb/s, a screen's height in px, a drop's largest file in MB); a screen also `fps`. Values are held
to their ranges. Put a screen on a thin panel facing where people stand; a received screen counts as a video
(4 play at once). Nothing to stream is in the file: people bring it. And `{ "type": "mirror" }`: its `face` (3, +y, by
default) a mirror of the bank's `look` — `reflects`, `on` and `radius` as above, Mirrors —, nothing on the wire.

### Pages: HTML on a face

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

## Light

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

## Collisions and behaviours

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
  | `route` | goes through its points on a smooth curve, round and on again or there and back, stopping a while at each if asked: a boat on a tour, a train on its line | `points` (up to 64, `[x, y, z]` m in its own frame — or `[x, y, z, hx, hy, hz]`, gone through along its handle, leaving towards its tip; `[x, y, z, 0, 0, 0]` a corner, where it slows to a stop and turns), `speed` (m/s), `stop` (s), `at` (`"each"`: stops at every point; `"ends"`: only where it is kept and, there and back, at its last), `mode` (`"round"`, `"back"`), `face` (`"yes"`: turns to where it goes), `water` (`"yes"`: keeps its height over the sea), `name` (what this route is called among its routes; none, Route 1), `routes` (up to 7 other routes kept to be run instead, `{ name, points, speed, stop, at, mode, face, water }` each); on a starship, its trip to space: its points' z its height over the planet's round, up to 100 km, x and y across it, 1,000 km at most, `speed` up to 2,000 m/s and `accel` up to 30 m/s², facing where it goes (vehicles.md, A starship) |

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

## Objects, clones, trees

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
  catalog.json → `species`; one that `floats` there (the water lilies) stands at `[x, y]` on its
  parcel's water — on the lake where the build's `land` digs below it, under the ground where it does
  not: put them only over what is dug; the variant drawn is `seed % 6` (each variant's height and crown are in the
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

## Animals

```json
"animals": [ { "species": "cow", "at": [30, 42], "count": 5, "seed": 3, "territory": 25 } ]
```

- **A herd lives where it is put**: `at` `[x, y]`, its home on the ground, in the build's frame. Its animals walk
  round it, stop there to graze or lie down, and set off again, by the world's clock — the same animals at the same
  places for everyone who comes, nothing of where they are written or sent: the walk, its stops and its animals are
  worked out from its home and its `seed`. A species of catalog.json's `animals` → `species`: the `horse`, `cow`,
  `sheep`, `elephant`, `dog`, `cat`, `goose`, `chicken`; and six dinosaurs at their kinds' sizes, moved by their own
  clips (walking and now and then running, roaring or leaping at a stop, lying down to rest) — the `tyrannosaurus` (12 m long, one or two), the `triceratops` (8.5 m, 2–5), the `stegosaurus` (9 m,
  1–3), the `apatosaurus` (22 m, 2–5), the `parasaurolophus` (9.5 m, 3–8) and the `velociraptor` (2 m, 3–6). The
  `polar-bear` and the `penguin` (`wild` there) live on the snow of their own, few, and keep off the lands: on a land
  lives what its designer puts — put one there only to have one there.
- `count`: how many it is, within its species' `group` (a cow's herd 3–6, a cat alone, a dog or two); none, its seed
  deals one. `seed`: a whole number (0 up to 2³²); another seed, another walk round the same home — none, one from the
  build's name and the herd's place in the list. `territory`: how far round its home it walks, in metres — from 5 (a
  pen) up to its species' own (catalog: a cow's 80, a hen's 30, a horse's 150), which is what none gives. `key`,
  optional, as a tree's.
- **Its ground**: it walks no steeper than 35°, never into the sea, as far as its territory or nearer where the ground
  does not let it; where none is left round its home — steep all round —, it stays there: another `seed`, or gentler
  ground. It has no collision and does not see what is built: **give it open ground as wide as its territory** — a
  paddock (`territory` its radius), a meadow, a farmyard behind a fence —, never a house or a street; for hens in a
  run, a `territory` of 5–10.
- What it is: no reaction to people, no sound; of a species in sight at once, the 48 nearest are drawn (the check
  says when a build puts more). Each animal is 240–440 triangles, drawn while it covers 4 px; a herd costs a record.
  A dinosaur does not graze; it may run, act at a stop (its attack or its jump) or lie down (its fall), of its own.

## Land

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

## Ids and changing a build

An export from the editor (deliver.md) gives each object, clone and tree its `id`, and the anchor
`"exact": true`. Keep both when you change it: what comes back with the ids of the person's own
records changes them where they stand — an object's parts as you wrote them — and what has no id is
added. An object left out stays as it is.

