# 3. The resources: the build file, and what it may be made of

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
| `seat` | `true`: sat on by a click, on its top, facing its +y — a bench, a chair, a vehicle's seat (vehicles.md); or `{ "at": [x, y, z], "turn": 90 }`, its sit target: the hips there in the part's own frame (m, from its centre) and the body turned that many degrees from its +y about the vertical, as a part turns about z — a ring-shaped puf (on its rim, not over its hole), a sofa's places, a stool sat on facing the bar; and `"pose"`, how one sits there (catalog.json → `poses`: a clip, a chair's resting the hips on the top, the rest the feet — a cushion on the floor cross-legged, a pew kneeling, a stage dancing, a car's wheel), with a target or without one |
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
| `road` | what its `points`, `width` and `depth` make | 0 surface, 1 sides, 2 underside | a ribbon along 2–32 `points` laid on the ground, its slab `depth` under it; under 2 m wide a path; the last point on the first closes it round |
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

```json
{ "name": "lane", "at": [3.6, 32.8], "prims": [{ "name": "lane", "kind": "road", "at": [0, 0, 0], "width": 3,
  "points": [[-3.6, -24.2], [-2.8, -16.8], [-4, -8.8], [-2.4, -0.8], [0, 7.2], [2, 15.2], [3.6, 24.2]] }] }
```

A longer way is several roads end to end. A road on something built — a bridge's deck — takes
`[x, y, z]` points: it stays where they say.

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

