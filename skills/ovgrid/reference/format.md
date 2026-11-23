# 3. The resources: the build file, and what it may be made of

A build is one JSON object: objects of parts — prim shapes or *kinds* — dressed in the bank's
materials, with their lights, particles and behaviours; linked clones of objects; trees; herds of animals. Every
name it may use — shapes, kinds and their parameters, behaviours, particles, the 3,427 materials,
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
  "seeds": [ { "generator": "neighbourhood", "at": [260, 0], "params": { "width": 120, "depth": 80, "seed": 7 } } ],
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
| `building` | what its `width`, `depth`, `floors`, `storey` and `roof` make | 0 walls, 1 what is dressed apart (its balconies' screens, its spandrels, a pavilion on its roof), 2 trim (frames, slabs' edges, the base, columns, the stair's sides), 3 glass, 4 roof, 5 floors, 6 walls inside | a whole block of flats or a tower in one part, worked out from a few numbers — storeys of flats either side of a core (the street's door, a hall, a stair of two flights behind a slot of glass, a lift in a shaft glazed to the street), windows in columns, balconies between screens, its roof, a base down past the ground and steps to its door —, walked into as drawn, up its stair or its lift into every flat; its doors and its lift's pieces parts of their own — see *A block of flats in one part* |
| `lift` | its box: a car's across, front to back and floor to top; a leaf's width, thickness and height; a button's plate | 0 frame, 1 floor (a panel's ground storey's plate), 2 glass, 3 what is lit (a car's ceiling, a button's face, a display's digits, a plate's number, a panel's plate lit), 4 panels (a panel's numbers) | a piece of a lift, a few boxes: `piece` `car` (a floor, a lit ceiling, glass behind and at both sides, its way in at its −y, `door` wide and `head` high), `leaf` (one leaf of a door), `button` (a plate, its −y face lit: a landing's call button), `display` (over a doorway — no size of its own: give it its box, 0.3 × 0.04 × 0.12 m as a building's recipe does —: the floor its car is at and an arrow of the way it goes, its digits of seven segments lit — its `lift` behaviour shows them as it is drawn, the same for everyone: write neither `floor` nor `way`), `plate` (a landing's number, `label`, large and lit) or `panel` (a car's buttons, one part: `count` of them, columns of `rows` from the foot up — or, `order` `down`, from the top down —, `rise` and `gap` apart, each `cell` across, a plate and its number, the one its car goes to lit; its behaviour's `button` `panel`, a click on it sending its car to the stop of the button it falls on; its size `panelSize`). What moves it is its `lift` behaviour (effects.md): a building's recipe stands them — write them yourself only for a lift of your own |
| `hall` | what its `type`, `width`, `depth`, `height` and `floors` make | 0 walls, 1 what is dressed apart (the band over its glass, its canopy, a portico's beam), 2 trim (frames, columns, slabs' edges, its base), 3 glass, 4 roof, 5 floors, 6 walls inside, 7 ceilings | a supermarket, a museum, a shopping centre, a market hall or a filling station in one part, worked out from a few numbers, walked into as drawn; what stands in it parts of their own — see *A hall in one part* |
| `fixture` | what its `type`, `width` and `depth` make — its height its type's, a person's | 0 frame, 1 boards (shelves, a worktop, a plinth's stone), 2–4 its goods, three colours of them, 5 glass, 6 accent (a rail, an awning, a pump's panel, a sculpture) | what a shop, a market, a museum or a filling station is fitted with: aisle shelving, wall shelving, a chiller, a checkout, a table of goods, a market stall, a plinth and its sculpture, a fuel pump, a moving ramp — see *A hall in one part* |
| `street` | its piece's own — a lamp 0.5 × 0.5 × 6 m, a bench 1.8 × 0.62 × 0.86 —; `height` a lamp's, a signal's, a sign's post's; `width` a planter's, an awning's, a crossing's | 0 metal, 1 body (a bench's slats, a bin's, a planter's earth, a shelter's roof), 2 lamp (the glass that glows), 3 glass, 4–7 its colours, tints on one material | what stands in a street: `lamp`, `arm` (a lamp on an arm over the road), `double`, `signal`, `bench`, `bin`, `shelter`, `cone`, `bollard`, `planter`, `hydrant`, `roadsign`, `awning`, `zebra`, what is painted on a road: `line`, `arrow`, and what stands in a square or a park: `fountain`, `kiosk`, `rack` (of bicycles), `table` (a café's), `advert` (an advertising column), `swing`, `slide`, `rocker`, `barrier` (round roadworks), `pergola`, and along a shore: `railing` (a promenade's, its `width` its length), `shower` (a beach's), `lifeguard` (a tower, its chair sat on), `pontoon` (a marina's, its `width` its length, walked on: its foot 0.2 m under the water), `mooring` (a quay's bollard), `buoy` — a promenade's lamps a classic `lamp`, its benches `bench` — see *What stands in a street* |
| `sign` | its `width` — its word's own where 0 — × 0.12 × its `height` | 0 frame, 1 board, 2 letters — the last two tints on one material | a board with a word on it, its letters a font five by seven: `hotel`, `hospital`, `school`, `market`, `supermarket`, `museum`, `mall`, `pharmacy`, `cafe`, `bar`, `books`, `bakery`, `parking`, `police`, `fuel`, `cinema`, `bank`, `library`, `station`, `taxi`, `bus`, `open`, `sale`, `ovgrid` — see *What stands in a street* |
| `billboard` | its format's, `scale` times, over its `lift` | 0 frame, 1 advert | a place for an advert: `format` `billboard` 6 × 3, `poster` 1.2 × 1.75, `banner` 1.4 × 5, `mural` 8 × 5, `screen` 4 × 2.25 m; `mount` `wall`, `posts`, `roof` — see *Adverts* |
| `crane` | what its mast's `height` and its `jib` make | 0 paint, 1 concrete (its pad, its counterweight), 2 glass, 3 dark metal | a tower crane: a mast of lattice on a pad, a cab, a jib along its +y and a counter-jib behind — see *What stands in a street* |
| `castle` | a wall: its `length` × 3.12 × its `height` + 2.08 + its `plinth`; a tower: its `girth` + 0.24 (0.6 under a cone) square × its `height` + `rise` + 2 (or its cone) + its `plinth` | 0 walls, 1 what is walked on (the wall walk, a tower's platform), 2 trim (base course, merlons' caps), 3 glass, 4 roof (a tower's cone), 5 floors (a tower's chamber's), 6 walls inside (that chamber's), 7 stained glass (a keep's chapel's windows) | a piece of a castle: a stretch of curtain wall with its wall walk and merlons, a tower the walk goes through, a gatehouse, its portcullis, or a keep — see *A castle* |
| `castle` | a wall: its `length` × 3.12 × its `height` + 2.08 + its `plinth`; a tower: its `girth` + 0.24 (0.6 under a cone) square × its `height` + `rise` + 2 (or its cone) + its `plinth` | 0 walls, 1 what is walked on (the wall walk, a tower's platform), 2 trim (base course, merlons' caps), 3 glass, 4 roof (a tower's cone), 5 floors (a tower's chamber's), 6 walls inside (that chamber's) | a piece of a castle: a stretch of curtain wall with its wall walk and merlons, a tower the walk goes through, a gatehouse, its portcullis, or a keep — see *A castle* |
| `casino` | its piece's own: a roulette's ball 0.646 round × 0.036 (the ring it runs round); a slot's reel 0.22 round × 0.16; a wheel of fortune's stand 1.6 × 0.65 × 2.2, its wheel 1.36 round × 0.11; a hall `width` × `depth` + 0.6 × `height` + 1.72 — from its floor's slab, 0.12 m under its foot, to `height` + 1.6 over it (16–48 × 16–48 × 4.5–8 m); a slot machine 0.82 × 0.74 × 2.2; video poker 0.64 × 0.64 × 1.45; a roulette table 2.8 × 1.3 × 0.92, its wheel 0.84 round × 0.16; a blackjack table 2.3 × 1.25 × 0.9; a dice table 3 × 1.4 × 0.98; a cashier's desk 3.1 × 0.9 × 2.3 | 0 body, 1 trim, 2 felt, 3 neon (give it `emissive` and the part a light of range 0), 4 screens, 5 carpet, 6 walls, 7 ceiling, 8 red, 9 black, 10–17 colours (symbols, values) | a casino's pieces: its hall with neon and a marquee, its machines and tables, each its game's start (`game` slots, roulette, blackjack, poker, dice, fortune) — see *A casino* |
| `ride` | its piece's own: a carousel `radius` + 0.3 round × 6.1; a wheel `radius` + 0.35 round × 1.8 (its axle its z); its stand 4.8 × its spread × its hub + 0.6; a drop tower 6 × 6 × its `height` + 2; a booth 3.2 (a gallery 4.8) × 3.45 × 3.3; a gondola 5.1 × 2.2 × 1.9; a roundabout 3.1 × 3.1 × 1.1 (2.5 under a canopy) | 0 paint, 1 trim, 2 cloth (a canopy, an awning), 3 bulbs (glow by night where the part is lit), 4 floor, 5 plastic, 6 glass | a piece of a fair: a carousel and its horse, a Ferris wheel, its gondola and its stand, a drop tower and its ring, a booth, a gallery's target — see *A fair* |
| `bumper` | its piece's own: a rink `width` + 0.6 × `length` + 0.6 × `height` + 0.9; a car 1.7 × 1.7 × its `height` − 0.2 (its pole to the grid); a basin (`radius` + 1.95) × 2 round × 0.9; a boat 2 × 2 × 1.25 | 0 paint, 1 metal, 2 rubber, 3 floor (steel plate), 4 cloth (the canopy), 5 bulbs (glow by night where the part is lit), 6 seat | a fair's bumper ride: a rink and its bumper car, a basin and its bumper boat — driven by whoever comes to them (`vehicle` `bumper`, `bumperboat`: vehicles.md, *Bumper cars and bumper boats*) |
| `coaster` | a stretch 1.4 × its `length` (0.5–8 m) × 0.93; a column 1.4 × 1.4 × its `height` (0.5–60 m); a car 1.64 × 3.05 × 1.6; a tunnel 4.2 × its `length` (0.5–8 m) × 6.6; a beam 0.6 × its `length` (0.5–8 m) × 0.6 | 0 paint, 1 steel, 2 seats, 3 bulbs (glow by night where the part is lit), 4 trim (lap bars, nose), 5 footing | a big roller coaster's pieces: steel track stretches leant as its line is, columns to the ground, beams across under it on columns where none can stand under it, cars for four, stretches of concrete shed over its track where it runs low — see *A big coaster* |
| `ghost` | a house its `width` (12–40) × `depth` + 0.6 (10–32) × `height` + 2.6 (6–12 m); a track stretch 1 × its `length` × 0.14; a car 1.44 × 2.4 × 1.4; a monster its own (a skeleton 0.9 × 0.6 × 1.9 … a bat 1.2 × 0.5 × 0.3; `variant` 5–8 a zombie, a skeleton with a sword, a skeleton knight, a zombie rising from its grave); a keep its `width` × `depth` × `floors` × 5 m + 1.6; a coffin car 1.44 × 2.85 × 1.85; a neon its `length` × 0.12 × 0.8; a door 2.5 × 0.12 × 2.65 | 0 walls, 1 trim, 2 roof, 3 bone, 4 flesh, 5 cloth, 6 glow (eyes and neon: give it emission and a tint), 7 floor | a ghost train's pieces, by `piece`: `house` (its shut house with two doorways), `rail` (a low track), `car`, `monster` (`variant` 0 skeleton, 1 ghoul, 2 ghost, 3 spider, 4 bat, 5 zombie, 6 skeleton with a sword, 7 skeleton knight, 8 zombie rising from its grave), `neon` (tube, zigzag, eyes, arrow), `door`, `keep` (a haunted castle's keep of `floors` 2–4, its way in on its first floor and its way out on its top one; its floors its build's own) and `coffin` (a coffin car for two) — see *A ghost train* |
| `vehicle` | its body's own — a saloon 2.56 × 5.1 × 2 m, its mirrors with it —; a wheel's; its door's | 0 paint, 1 glass, 2 what is dark (bumpers, arches, tyres), 3 headlamps, 4 rear lamps, 5 its inside, 6 its second tone (a livery's band, a lorry's box), 7 a livery's sign or lights; a wheel's rim | a car's body in one part, driven as any car is: its front its +y, its driver at +x — see *A car in one part* |
| `auditorium` | what its `width`, `rows`, `rise`, `stage` and `clear` make — 19.2 × 19.4 × 7.9 m at its defaults | 0 floors, 1 wood, 2 seats, 3 glass, 4 ceiling, 5 screen wall | its stage at its −y; it stands its screen, voice and drop — see *An auditorium in one part* |
| `pool` | what its `length`, `width`, `depth`, `deck` and the ground under it make | 0 paving (coping, deck, the steps' treads), 1 lining (the basin, the steps in the water), 2 sides (its base, the steps' flanks) | a pool to swim in, in one part: a basin lined with tiles and raised over the ground (a build does not dig), a coping and a deck round it at its rim, steps up to the deck and steps down into the water; its water comes with it — «A pool in one part» below |
| `furniture` | what its `type`, its model, `width` and `depth` make — its height its type's, a person's | 0 frame (wood or painted; a picture's frame), 1 cover (upholstery; a rug; a picture's mount), 2 bedding (mattress, sheets, pillows; a lamp's shade), 3 throw (a duvet, cushions; leaves), 4 metal, 5 top (a table's; a pot, a vase), 6 art (a picture's painting) | one piece in one part, its front +y, its bottom the floor: `type` `sofa`, `armchair`, `chair`, `stool`, `bed`, `table`, `coffee`, `side`, `desk`, `rug`, `picture`, `plant`, `ornament`, `lamp` or `rack`, storage, a bathroom's and a kitchen's, a lobby's (`counter`, `mailbox`, `bench`, `trolley`, `stand`), a castle's (`throne`, `banquet`, `barrel`, `chest`, `weapons`, `trophy`, `tapestry`, `sconce`, `brazier`, `chandelier`, `hearth`, `altar`, `cage`, `fourposter`), its model by the parameter named for it (`"sofa": "chaise"`, `"headboard": "tufted"`, `"rug": "fitted"`), and a `look` (a picture's: its painting); sat on where its recipe says (its `seat` given by the import); varied with no material more by `fabric`, `wood`, `tall`, `legs`, `stout` — see *A piece of furniture* |
| `room` | its floor, `width` × `depth`, and its `height` | 0 wood, 1 fronts, 2 rug, 3 soft, 4 throw, 5 metal, 6 stone, 7 ceramic, 8 leaves, 9 dark, 10 art | a room furnished whole by what it is — `type` `living`, `dining`, `kitchen`, `bedroom`, `bath`, `toilet`, `study`, `lounge`, `passage`, `landing`, `closet` or `hall`, and on a building's ground storey `lobby` or `reception` (its desk facing its first `ways`), and a castle's `greathall`, `solar`, `chapel`, `cookhouse`, `armoury` or `dungeon` —: what nobody sits on in it in one part, what is sat on parts of their own of the `furniture` kind that its recipe stands, seats; laid out from its `walls`, `windows` and where it is come into (`ways`), in a `palette` and its `look` alike — see *A furnished room* |
| `tableware` | its table top's `width` × `depth` (a `round` one's depth its width), from 0.2 m under the top — a tablecloth's drape — to what stands highest | 0 china, 1 glass, 2 metal, 3 beer, 4 wine, 5 drink, 6 drink, second, 7 baked, 8 red, 9 green, 10 dark, 11 cloth, 12 accent | what is laid on a table, a whole setting one part, its origin the middle of the table's top, its front +y: `setting` `bar` (a drink a place, snacks), `cafe` (a cup a place, a croissant or cake at some, a sugar pot), `restaurant` (a plate, cutlery, a napkin, glasses a place, food on some, bread, bottles, a vase or a candle, a tablecloth unless `cloth` 0), `terrace` (drinks, a menu, an ashtray), `counter` (glasses on racks, bottles, drinks), `shelf` (a row of bottles) or `piece` (one alone: `piece` `tumbler`, `wine`, `beer`, `cocktail`, `cup`, `mug`, `winebottle`, `beerbottle`, `water`, `soda`, `spirits`, `burger`, `fries`, `pizza`, `pasta`, `salad`, `croissant`, `cake`, `icecream`, `plate`, `cutlery`, `napkin`, `bread`, `menu`, `vase`, `candle`, `cruet`, `sugar`, `ashtray`, `bowl`, `rack`); `places` (1–8) on `sides` `both` or `back`, `pole` a parasol's kept clear, `variant` 0–7 what is served and its colours; drawn within about 18 m alone, collides as nothing — see *Tables laid* |
| `track` | its sleepers' length across (2.4 m), its `length` along its y (1–64 m), its rails' height (0.27 m) | 0 rails, 1 sleepers, 2 bed | a length of railway track in one part: two steel rails a standard gauge apart on sleepers every 0.65 m, its rails' tops its box's top; `bed` `ballast` lays a bed under it, for track on the ground (on a deck, none). Nothing collides with it: what it lies on is what one stands on. Looks: `concrete` or `timber` sleepers |
| `coach` | a car's 3 × `length` × 3.6 m from its rails' tops (10–20 m, 16 its own); a leaf's 0.75 × 0.05 × 2.08 m; a bench's `long` × 0.5 × 0.95 m | 0 its paint, 1 its stripe, 2 the dark band its windows are in, 3 glass, 4 its underframe and its roof, 5 its floor, 6 its lining, 7 its seats, 8 its metal, 9 what is lit, 10 its tail lamps | a piece of a train one walks into, by `piece`: `car` — a coach's body, hollow, two doorways a side, a cab or a gangway at each end (`ends`), its recipe standing its doors' leaves on the sides that open (`doors`) and its benches —, `leaf` and `bench` (vehicles.md, *A train one walks into*) |
| `flat` | its floor, `width` × `depth`, and its `height` | 0 walls | a flat's inside in one part — its partitions, each with its doorways —, laid out from where it is come into (`door`, on its left side) and what is in its walls (`windows`, `ways`): a living room and, behind it, a row of a bedroom, a bathroom and bedrooms, the kitchen open past it; its recipe stands each room furnished (the room kind) and what is sat on |
| `festive` | by its piece: a tree `height` 0.8–14 m (0.56 of it wide), a wreath 0.3–1.2 m, a string `length` 1–40 m with its `sag`, a gift 0.3–1 m, a pumpkin 0.3–1.2 m high (1.3 of it across), a cobweb its reach 0.3–1.5 m (2 cm thin) | 0 greenery (a string's wire, a pumpkin's stem), 1 trunk, a gift's paper or a pumpkin's skin, 2 red baubles, 3 gold baubles and tinsel, 4–7 bulbs red, blue, green, warm (7 the star, and a pumpkin's carved face) — they glow —, 8 ribbon (a cobweb's threads); plain colours, no textures | a season's piece: `"piece"` `tree`, `wreath`, `lights`, `gift`, `pumpkin` (its face carved on its +y) or `cobweb` (threads in a quarter fan from its top corner at its −x, for a corner), `variant` its colours. The seasonal themes lay them by themselves near the viewer (Christmas 20 Nov–6 Jan: trees in squares, shops and halls, wreaths on doors, lights on fronts and balconies, a market in a city's square; Halloween 17 Oct–2 Nov: pumpkins in their place, cobwebs, orange and purple lights, zombies in the square and by the street lamps by night, a ghost train's front in pumpkins and cobwebs) — never write them into a build for that; stand one by hand only as decoration of your own. Light it with `"light": { "on": "night", "range": 0 }` and emissive bulbs |
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
ground past its fill, a deck on columns instead (`road` in the kinds' table) —, and it collides as its walls. Far off it
is drawn with fewer of its samples, never under its own line: a rise between two of them keeps its sample. Dress its
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
more all round), `platform` (a platform house: every floor 2.4 m out past its walls — a podium round the ground storey, steps
down from its edge before the door, and a terrace railed with glass all round each storey over it, a way out onto each —, and
the top storey a pavilion in the corner its stair stands in, the floor it stands on far wider than it, its own roof 1.2 m out —
give it two storeys or three and `flat`; its box is 4.8 m wider and deeper than its ground storey), `arm` (an L wing: an arm with
rooms of its own — a volume against the front at its far end, flush with the house's side, two fifths of the front wide (6.5–10 m
at a game's scale) and 6 m out, its walls and windows its storeys' (the side flush with the house's end blank), two storeys high
at the most, the house's flat roof gone on over it where it is as high —; on each of its storeys a room, with `"rooms"` a room of
the house's own — a dining room, a study or a lounge, furnished as the rest with `"furnished"` —, come into from the room behind
it: open to it from floor to ceiling where that is one walked through, by a doorway from a bedroom, a study or a kitchen; behind
the arm the house's wall keeps high windows, the light the rooms behind it borrow; the door in its recess in the front the arm
leaves — give it 18 m of front or more, two storeys and `flat`: under 14.1 m at a game's scale it has no arm; its box is 6 m deeper
at the front) or `zed` (a Z-shaped house: two such arms at opposite ends — one at the front by the stair's end, two storeys at
the most, and one at the back at the far end, a storey high, the lowest of its volumes: a dining room off the kitchen; none where
a bathroom lies behind it — give it 18 m of front or more, two storeys or three and `flat`; its box is 6 m deeper at the front
and at the back); `floors` 1–3; `roof` `flat`, `mono` (one pitch rising to the front),
`gable`, `butterfly`, `steep` (two steep pitches from a ridge along its width, as high as three fifths of its walls, 31° to 50°,
the storey under it open up to them — the chalet's own; on any other style, a barn's roof) or `hip` (four pitches up from the
eaves to a ridge along the longer side, on a flat slab that is the top storey's ceiling: the house under it as under a flat roof); `glazing` 0–1 (0.5 the style's own); `variant` 0–9999, which of its style's houses it is — where its door
and stair are, which storeys stand back, which bays are glazed: one number, one house, the same for everyone. A `look` dresses it
from the bank, six to each style and a seventh to the cabin, the chalet and the lodge — box: `white`, `stucco`, `concrete`, `grey`, `charcoal`, `ochre`; wood: `cedar`, `dark`, `oak`,
`boards`, `charred`, `solar`; glass: `concrete`, `travertine`, `walnut`, `white`, `steel`, `board`; stack: `cedar`, `concrete`,
`stone`, `charcoal`, `ochre`, `boards`; chalet: `white`, `blue`, `timber`, `alpine`, `stone`, `ochre`, `snowy` (its roof under snow); lodge: `walnut`,
`charred`, `white`, `cedar`, `stone`, `boards`, `snowy` (its roof under snow: a mountain lodge); barn: `black`, `white`, `brick`, `cedar`, `concrete`, `boards`; manor: `stone`, `white`, `brick`, `ochre`,
`grey`, `slate`; villa: `travertine`, `concrete`, `white`, `cedar`, `black`, `marble`; cabin: `logs`, `beams`, `dark`, `pine`, `brown`, `weathered`, `fieldstone` (its walls of stone, its timber dark, its roof of sheet metal);
cantilever: `white`, `cedar`, `concrete`, `stone`, `black`, `walnut`; plates: `walnut`, `white`, `cedar`, `charcoal`, `board`,
`travertine`; terrace: `white`, `travertine`, `concrete`, `ochre`, `stone`, `charcoal`; ell: `white`, `concrete`, `brick`,
`charcoal`, `stone`, `cedar`; platform: `travertine`, `white`, `concrete`, `cedar`, `black`, `ochre`; arm: `white`, `brick`, `stone`,
`grey`, `charcoal`, `ochre`; zed: `concrete`, `white`, `cedar`, `travertine`, `black`, `board` (a chalet's and a lodge's second wall
material is its bay's, an L-shaped house's its arm's, a barn's its wing's, a manor's, a villa's, a cantilever's, a roof-terrace
house's, a platform house's, an L wing's and a Z-shaped house's their upper storeys' — their arms' as their storeys' —, a
cabin's its stone — its base and its chimney —, a layered house's its blade's, its trim its slabs' edges and its last the undersides of its slabs) —, six materials at
the most. **Houses side by side read as one unless they differ**: give
neighbours different looks, different `variant`s and the roofs that suit their style (box: `flat`, `mono`; wood: `mono`, `gable`,
`butterfly`; glass: `flat`, `butterfly`, `mono`; stack: `flat`; chalet and lodge: `steep`; barn: `steep`, `gable`; manor: `hip`; villa: `flat`; cabin: `gable`, `steep`; cantilever: `flat`, `mono`; plates, terrace, ell, platform, arm and zed: `flat`), as the editor's tool throws them at each house. Stand it on the ground: its floor a hand over
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
that calls it, a display over it of the storey the platform is at and the way it goes, the storey's number (0 the ground's) over that — 2.1 m across, for four avatars, at a game's scale (1.3 m at a person's). `"sliding"`: `"doors"` — the door onto each terrace two panes of glass in a doorway of 2 m, one sliding over the
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
street that closes round, twelve lots at its defaults, a mansion with a pool behind it. **Every lot is a walled square**: a
level platform of lawn (a `cube`, grass on its top face, its wall's material on its sides) from the land up to the pavement's
height — or a hand over the highest land under it where that is higher —, a low wall all round its edge (0.6 m; a metre where
the land outside falls away), a gateway in its front wall before the house's door with a path to it, a letterbox by it, and
the house standing on the lawn as a part of the same object (its `plinth` and `stoop` the kind's own: the lawn is level).
Where a lot stands over its pavement its steps are built against its wall — three straight up to the gateway, more along the
wall to a landing before it —, never a stair loose on the grass; a lot whose wall would stand over 5 m is not laid. Along the
street a pavement either side, a kerb (0.15 m) over it, with lamps, a bench and a bin a side (the `street` kind). **On land
that falls** (8 in 100 and more) the same neighbourhood is laid along the land's contours instead: level streets one below
the other, a bend from each to the next, and its lots below each street against its edge, level with it — one walks in from
the pavement, and the lot's wall is the retaining wall that holds it over the fall, 7 m at the most; shallow houses (8 to
6 m deep). So to about 30 in 100, wherever the land holds half the lots along its streets. **Where it holds fewer** —
steeper, or rough at a house's scale — it is laid as a hillside village too, and whichever of the two stands more houses is
kept (on gentler land, a street round that stands fewer than half its houses gives way to whichever of the three stands
most). A hillside village is as those of the Greek islands: no street for a car; rows of small walled terraces down the
fall (10.5 × 12.5 m — its lane, a patio of 1.5 m, its house's box 7.8 m deep and a metre behind it; 11.2 m deep, its house
6 m deep, where the land holds no deeper —, each a hand over its own land, its wall 7 m at the most), a
whitewashed house of 8 × 6.5 m under a flat roof on each, a lane 2.2 m wide along the upper edge of each row, a
few steps where two lanes stand apart, and stair streets between every three lots — a landing in each lane, a flight of
`stairs` down to the next (a step 0.19 m at the most, its tread 0.26 to 1.2 m as the fall asks); in its middle a square of
three lots with its church (a nave, a `hemiSphere` dome on a `cylinder` drum, a bell tower), its hall, a fountain and
benches; a viewpoint at the end of its highest lane; a car park at its foot, where its road arrives. So to about 60 in 100;
past it nothing is laid, and it is said. Build on a slope by hand the same way: each house on a level walled lot, never on
a stair down the grass.

**A block of flats in one part** (`building`): when a street, a square or a city needs buildings, do not build each from walls
and solids — one part is a whole block of two to thirty-two storeys (past what one part holds, its recipe stands it in sections). Its front is its **+y**; `width` (14–40 m) and `depth` (12–24 m)
are the rectangle it stands on, its `at` the middle of its box — which is not the middle of that rectangle: its box has its
balconies, its eaves and its steps. It is sized as a house at a game's scale, for an avatar and the camera behind it: storeys of
4 m (`storey`, 3.6–4.8 m), doors 1.4 m wide and 2.7 m high, the street's door two leaves of 1.4 × 3 m set back 3 m in a recess
under the storey over it, a stair 2 m wide on risers of 0.19 m, a lift for a dozen (its car 2.8 m square, its doorway 1.8 m), flats
6 m across at the least. `style`: `block` (rendered walls,
punched windows, balconies between screens of timber, a roof of sheet out past its walls), `brick` (brick walls, tall windows
close together, a parapet or four pitches), `concrete` (board-marked concrete, slits of glass in pairs, panels of dark metal, a
pavilion on its roof), `glass` (glass from floor to ceiling between slim piers, a band at each floor's edge), `hipped` (stucco
walls, wide windows, four pitches of tiles over eaves). `floors` 2–32 — a tower —: one part holds what a part's 64 m hold with its
base and its roof, fifteen of 4 m, sixteen of 3.6 m, and a taller one stands in sections (below). `core`: where its door, hall, stair and lift stand — `centre`, flats either
side of it, or `left` / `right`, at one end, its lift in the corner (always at an end under 20.4 m wide). `flats`: `through`, one from front
to back each side of the core, or `double`, one at the front and one at the back (four a landing with the core in the middle).
`balconies`: `none`, `front` or `both` — one to each flat on the storeys over the ground one, 5 × 2 m between two screens that
run up the building, an open way out onto it. `ground`: `flats`; `open` — the building on columns, its core alone walled —; `hotel` — its ground storey one hall round its
core, the core's walls open onto it, its windows' columns glass from the floor to the ceiling on the street: a hotel's lobby, come
into by the building's own door —; or `shops` — a shop either side of the core, each a room from the front to the back, glazed
like a hotel's and the column nearest its middle left open as its way in from the street, steps down to the street all along its
front.
`roof`: `flat` (a parapet), `eaves` (a slab out past its walls) or `hip`; a style's own are the first of the catalog's `roofs`.
`glazing` 0–1 (0.5 its style's own), `variant` 0–9999 (which end of each flat its balcony stands at, whether the wall between
its windows is dressed apart, a pavilion on its roof, which side of the street's door its lift stands at). `doors`: `open`, doorways from the hall into each flat, or `doors`, a door
in each — a part each that moves, which costs the page every frame it is in sight (twenty of them, half a millisecond): leave
them out but in the one building a visitor is led into. `lighting`: `none`, or `halls` — a light and a
presence switch a storey: light the one or two a visitor walks into, not a whole street (a build's fair share is 12 lights).
`reception`: `none`, or `lobby` — its ground hall furnished as a reception by what the hall is. A block's: a concierge's desk
facing the street's door (in the hall's wing beside the stair, where it has room), mailboxes by the door, a bench or a pair of
armchairs, a runner, pictures and plants by its size, every way through it — to the lift, the stair, each flat's door — kept
clear. With `ground` `hotel`, a hotel's, in all its ground storey: a long counter with its keys behind it, groups of seats on rugs,
a luggage trolley, leaflets. `lounge`: that, and in a hotel's hall a streaming lounge at its end away from its core — a third
of the hall, 6–9 m, open onto the reception across its depth: a big screen whoever stands before it shares to the room, a voice
zone of its own, rows of armchairs — where the hall is wide enough to keep its reception. For the buildings a visitor walks into. `premises`: `empty`, or `furnished` — with `ground` `shops`,
each shop furnished by what it is, the word over its way in: by its `variant` a `cafe`, a `bakery`, `books`, a `pharmacy`, a `bar`
or a `market`, or what `"shop"` (its left one, or its only one) and `"shop2"` (its right) name — those, a `restaurant`, `fashion`
(a clothes shop: over its rails, boards of the wardrobe's items — one put on with a click or E, kept as one's look, taken off with
another), `news`, an `office`. One part a shop and one to each row of seats, each board and each picture on its walls (works of
the bank by what the shop is, below): furnish the shops of a street a visitor walks
along, not every block of a city by hand (a city does it itself, its `life` `open`). `inside`: left out, or `near` — its flats
furnished (a `flat` to each, below: partitions, rooms, what is sat on, a door on the hall) and every storey's inside — its flats',
its lobby (`reception`), its shops' (`premises`) — no part of the build: laid for whoever is at that storey's level within twenty
metres of the building, from outside or from inside, and taken away past twenty-eight. From farther the building is its shell,
whatever it holds: the way to furnish every building of a street. `stage`: `finished`, or `frame` — a building in construction: its columns, floors, core and stair
alone, its lift's shaft empty, no reception.
`floors` up to 32: past what one part holds (64 m — fifteen storeys of 4 m) it stands as a tower in sections, parts of the
kind its recipe stands on one another (`section` `middle`, `top`: never write those by hand), one lift through all of them.
`wings`: `none` — a bar —, `left` or `right` — an L: a wing behind that end of the bar (seen from the street), in line with it —,
or `both` — a U round a court. A wing goes `reach` m back (6–30) and is `wide` m wide (6–24; as wide as the flat it goes on
from at the most, and no wider than the bar is deep): a room more of that flat on every storey, come into through the bar's
back wall; never behind the core (one asked there stands behind the other end). Under four pitches its roof and the bar's meet
in valleys. `corner`: `none`, `left` or `right` — that end stands on a second street: with `ground` `shops` or `hotel` its wall,
and its wing's along that street, are glazed from the floor as the front is. For the corners of a city's blocks: an L with
`corner` on its wing's side. A wing costs 200 triangles and 700 more a storey from near, 60 and 135 from a street away.

Every building has its **lift**: a shaft beside the street's door, glass to the street from the ground to the top storey's
ceiling — and to the side too where the core stands at an end —, a car for a dozen kept on the ground storey, and on the hall of
every storey a double door whose two leaves slide into the wall while the car stands there, shut while it does not. A click on a
landing's door calls the car to it; in the car, its buttons — one panel beside its way in, a plate a storey from the ground up, its
number on it (the ground storey's green), the one the car goes to lit — send it to the storey of the one clicked; its doors shut before it sets off and open once it is there. Nothing of it runs
while it stands: its parts move only on a ride. Its floors are numbered from the ground storey's 0: over each landing's doorway a
display of the storey its car is at and the way it goes — another over its way in, inside it —, each landing's number large on
the wall beside its doorway on the hall's side, each flat's over its door (its storey and a letter: 3B).

```json
{ "name": "block", "at": [0, 0, 0.2], "prims": [
  { "name": "building", "kind": "building", "style": "block", "look": "white", "width": 30, "depth": 16, "floors": 5,
    "roof": "eaves", "flats": "double", "balconies": "front", "variant": 3, "plinth": 0.6, "stoop": 0.4, "at": [0, 0.3, 10.2] } ] }
```

- **Its cost**: from near — inside it, or within a street's width — at most 1,000 triangles and 1,300 more a storey (five storeys
  of 30 × 16 m: 4,100; a tower of glass of sixteen: 11,800); from a street away 370 and 190 more a storey (that block: 580, a
  sixth of a house; the tower: 1,600): a street of twenty seen from its end is some 13,000 triangles. In construction a third of
  that. Sixty pieces to collide as and 21 more a storey. Its lift is three parts and four more a storey — its car a hundred triangles, a leaf or a call
  button twelve, a display 44 and its panel of buttons 800 at the most —, and counts as one thing moving: nothing of it runs while it stands.
- **Laid on the ground** as a house: give it the `plinth` (how far its base goes down under its floor, past the lowest ground
  under it; 3 m at the most) and the `stoop` (how far the ground before its door lies under its floor: its steps go down to it)
  that the ground asks — the ground may fall 2.5 m under it at the most. Place its object at its site — the middle of its
  rectangle, on its floor — and the building within it at its box's middle, as a house in a build.
- **Its looks**: six to a style, each the bank's materials for the seven faces; `look` in a build file names one, the first its
  own. Its glass is lit from inside by night as a house's.
- **What its recipe stands** (never write them yourself): its lift — the car, a display over its way in and its panel of buttons, two leaves to each
  landing's door, a call button at each landing beside its doorway («Call the lift», E or a click) and a display over that
  doorway, parts of the `lift` kind: three and four more a storey —; the two leaves of its street door; with `doors`, a door to each flat; with `lighting`, a
  light and a switch a storey; with `reception`, its lobby — one part of the `room` kind, which itself stands what is sat on in
  it (one to five seats).

**A hall in one part** (`hall`): a supermarket, a museum, a shopping centre, a market or a filling station is one part; do not
build it from walls. `type`: `supermarket` — a front of glass in bays under a band and a canopy, a strip of windows under its
ceiling along its sides —; `museum` — walls of stone, tall slits of glass, a portico of piers up its steps, a lantern on its roof
—; `mall` — two storeys of shops either side of a concourse open to a roof of glass, galleries along it, a way in at each end
—; `market` — a roof of two pitches on columns, open all round —; `station` — a canopy on columns over its pumps' islands, a
kiosk behind. `width` × `depth` (16–60 × 12–48 m; 36 × 28 where left out; a shopping centre 28 × 24 at the least) the rectangle
it stands on, its front its +y; `height` a storey's, floor to ceiling (4–10 m: 6 a supermarket's, 8 a museum's, 5 a shopping
centre's); `floors` 1 or 2 — a supermarket's upper floor up a pair of moving ramps, a museum's gallery round its hall up a stair
(a shopping centre has two, a market and a station one); `variant` which of its type's it is; `plinth` and `stoop` as a
building's. `fit`: `fitted` (as left out) or `bare`; `lighting`: `night` (as left out) or `none`. A shopping centre's `inside`:
left out, its shops as fitted (shelving and a table of goods); `near`, each furnished as a premise by what it is — a clothes
shop and its boards, a bookshop, a café, a pharmacy, a bakery, a newsagent's, a restaurant, a grocer's, one clothes shop a
storey at the most, dealt by its `variant` —, laid for whoever is within twenty metres of it, both storeys at once, and taken
away past twenty-eight: write `near` for one a visitor walks into.

```json
{ "name": "supermarket", "at": [0, 0, 0.2], "prims": [
  { "name": "hall", "kind": "hall", "type": "supermarket", "look": "red", "width": 36, "depth": 28, "height": 6, "floors": 2,
    "variant": 2, "plinth": 0.6, "stoop": 0.3, "at": [0, 1.5, 6.9], "light": { "on": true, "range": 0 } } ] }
```

- **What its recipe stands** (never write them yourself): with `fit` its fixtures (kind `fixture`) — a supermarket's rows of
  shelving on its columns' lines and between them, its chillers along its back, its checkouts beside its way in; a museum's
  plinths down its hall and a picture a pier (kind `furniture`, eight of the bank's paintings at the most); a shop's shelving
  and a table of goods; a market's stalls back to back; a station's pumps at each island's ends and its kiosk's counter —,
  sixty-four parts at the most, farther apart in a hall too large for them; its moving ramps (a `fixture` of type
  `travelator` laid along its slope, with the `belt` behaviour: they carry whoever stands on them, up or down) and a museum's
  stair; four lights at the most, on by night.
- **Its cost**: a supermarket 2,300 triangles from near at the most and 500 from a street away, a museum 1,800 and 460, a
  shopping centre 4,800 and 600, a market or a station 500 and 380; a fixture 340 from beside it, a third from a few metres
  off, nothing from far. Give the hall itself `"light": { "on": true, "range": 0 }`: its ceilings' panels glow of themselves.
- **Its looks**: four to a type (`red`, `blue`, `green`, `ochre` a supermarket's and a station's; `stone`, `concrete`, `white`,
  `brick` a museum's; `steel`, `white`, `travertine`, `brick` a shopping centre's; `timber`, `steel`, `red`, `white` a market's).
- **A fixture by hand** (`fixture`): `type` `gondola` (aisle shelving, goods on both sides), `shelving` (against a wall),
  `chiller`, `checkout`, `table`, `stall`, `plinth` (a sculpture on it, one in three in a case of glass), `pump` or
  `travelator` (a moving ramp: its `depth` its length, 3–24 m, along its own y — turn it about x by its slope's angle and give
  it `"behaviour": { "type": "belt", "speed": 0.6 }`; a flight of the stairs kind given it carries too, a step at a time); `width`
  its length along its front and `depth`, each within its type's range (shelving and chillers 1.2–12 m); `goods` what it
  sells — `mixed`, `produce`, `dairy`, `bottles`, `bakery`, `clothes`, `toys`, `books` —: three colours of one material, tints
  that shape nothing. Its front is its +y.

**A fair** (`ride`): one part a piece. Whole parks are a seed's (`"generator": "park"`, under *Seeds*): write pieces by hand
only for a ride of your own, and make it move with the behaviours there are. A carousel's object `spin`s (about 24 °/s), its
horses parts of it on its deck (0.55 m over its foot), each a `bounce` of 0.2–0.4 m — give them different heights and they
hop out of step. A wheel's object stands at its stand's hub (`radius` + 3.25 m over its foot), turned `[90, 0, 90]` so that its
axle lies along the stand's x, with a `spin` (about 5 °/s); its gondolas are parts at its ties (`radius` out, every 360/`count`
degrees in its own x–y), turned `[0, 0, 90]`, each with a `spin` as fast the other way: they hang level; four `lights` parts
(`variant` 0–3) with a light's `cycle` each chase round its rims by night. A drop ring's object stands on its tower's
floor (0.3 m) with a `move` up its z to 4.5 m under its `height`, `ease` 1 — and, to be ridden as a drop tower is, a slow
`speed` (3.5 m/s), a `fall` of 9.81 and a `caught` of 20 (hauled up, held `wait` s at its top, dropped as a stone falls and
caught at two g), its `every` a whole number of seconds that leaves time at its foot to get on. What turns or rises collides as nothing: make it
`phantom` — but a carousel's or a roundabout's part, whose deck is a floor one stands on and is carried round by. A horse, a gondola and a drop ring are sat on — give them their `seat` (a gondola's back bench, two places; the ring's eight, each place `[x, y, z, turn]` turned to face out) —; whoever sits on a ring that falls is kept under its bar till it is down again, and X sees from their own head. A booth's counter is its −y; a target given a
`treasure` is a prize found with E. Someone standing — a stall's vendor —: an object with `"figure": { "dialogue": "park-food" }` (or `park-game`, `park-gallery`,
`guide`) stands a figure where its frame is, facing its +y, idling and turning to whoever comes near, talked to with E; give
the object a part (a stool behind them). A ride that pays: give its object a hand-sized phantom part with `"behaviour": { "type": "game", "game": "ride", "role": "start", "set": "wheel", "par": 60 }` —
seated on any part of that object for `par` s, a ride, refereed by whoever owns the build (the title «Thrill seeker» opens once
each of the sets `wheel`, `carousel`, `coaster`, `ghost` and `coaster-big` has been ridden: an amusement park's wheel,
carousel and family coaster, its ghost train and — on a park of 215 × 195 m or more — its big coaster). A roller coaster: lay its line's stretches of `rail` (`length` up to 8 m, turned along it — pitch about x, then heading) on posts, and
its `car`s each an object at the line's frame with a `track` behaviour (its `points` the line, closed, its station first; `lift`,
`brake`, `stop`; `behind` 0 for the first car, then its gap more each): they run by their height. A `roundabout` is a playground's (2.8 m across; `variant` 0 rails, 1 a canopy, 2 a
bowl; looks `playground`, `meadow`, `cups`): give its object a slow `spin` and its part its `seat`, and leave it solid — its
deck is a floor one stands on and is carried round by, as a carousel's (a park made its own `phantom` before its `5`). Light a ride's bulbs with a light of range 0 by night (`"light": { "on": "night",
"range": 0 }` and face 3 emissive); a real light, few — one under a canopy, one over a counter.

**A big coaster** (`coaster`): its second edition is composed from a seed by its generator, a different one for every seed — a
lift of 30–44 m by its seed, lower where its plot leaves it no room (27–44 m, measured over seeds 1–200 on a plot of
68 × 214 m), a first drop, and then
elements one after another as its seed chooses and its plot has room: airtime hills, bunny
hops, vertical loops, zero-g rolls, corkscrews, a cobra roll, helices, banked turns climbed to and dived from, tunnels over its
valleys. Each layout is run as its train will run it before it is kept: its riders pressed at most 4.7 g into their seats, never
slower than 4 m/s off its chain, no stretch within a car's reach of another, all of it in its plot and over the ground. An
amusement park's own (on a park of 215 × 195 m or more) is of its first edition: one layout for every seed — a lift of 32–44 m
at 40°, a drop of 60° to the ground, a banked half turn, a vertical loop, airtime hills and a helix —, a train of four. By hand:
its cars each an object with a `track` behaviour whose `every` is a whole number of seconds; `points` up to 256, nearer one
another where it bends. How its cars lean is one of two: `bank` `true` (they lean into turns by themselves as their speed asks),
or its points' own rolls — a point may be `[x, y, z, roll]`, degrees its car is rolled to its right there (90 on its side, 180
upside down) —, its cars' up carried from each such point to the next: a loop, a corkscrew, a roll in line. `home` (m) and `crawl`
(m/s, 3 unless said): over its last metres into its station it goes at a crawl, its brakes bringing it down to that before them
— a brake run, then a slow way round. Lay its stretches of `rail` along the line, 1.4–3 m long and shorter where it bends, each
turned onto the frame there — its way, its right, its up as its car leans —, and a `column` every 6 m or so where one stands over
none of its own track and clear of every car's way, its foot on the ground as it lies, its `height` up to under the spine (1 m
down the frame's up). Where none can — it hangs over its riders in a loop, or other track runs under it —, a portal every 8 m or
so: a `beam` through its spine (0.75 m down the frame's up), level and square to its way, on a `column` 2.4–4.8 m to either side
whose top is 0.18 m under the beam's line — or on one, where the other side has no room. No column or beam within a car's way:
2.6 m over its rails' line and 1.5 m to either side of it, in its frame wherever it passes. A `tunnel` stretch is a concrete shed over its rails, their line through it at its frame: lay them end to end
where its rails run within 3 m of the ground — the foot of a drop, a valley, a brake run. Its `car` has four places (`seat` with
three `places`). Riders are kept under its lap bar till it stands in its station, and are carried whole with their car — over a
loop's top, upside down; X sees from their own head. It is heard by itself as it goes — its chain, its wheels, its riders over
its first drop, its brakes — a banked or rolled track's first car (no sound to write).

**A ghost train** (`ghost`): the world's own, its second edition, is a haunted castle of four floors — a `keep`, the castle kind's towers and gatehouse, `coffin` cars, a floor that gives way, a room of mirrors, a storm on a light's cycle, a drop held by a track's `most` (trim brakes, m/s). Its first: a shut `house`,
rooms parted by walls with a tunnel through each, a slow track in at its west doorway and out of its east one. Its `car`s run a
`track` with `drive` (about 1.6 m/s) and `every`. What jumps out is a `monster` in its own object named `scare <n> · <what>`
(it is heard by that name as it jumps out), with a `move` out of its way and back whose `every` is the train's and whose `since`
is when the train's first car comes by (its wait at its station and its way there, less the move's own wait and way out): it jumps out as the first car passes,
every round, on the clock alone. Its `door`s lift the same way. Give glowing faces (face 6) emission and a tint and a light of
`range` 0; real lights of a neon's colour are few, and the other rooms' neon only glows — the house lights one room a side,
its middle one, lighting the rooms either side (three in all, its back room's with them: seven such lights cost 0.34 ms of GPU
a frame from its platform), the castle one room a floor, its floor's middle one. Zombies may walk its grounds: `animals` of
species `zombie` (1–6 a group; see *Animals*), each within its `territory` of its home (5 m, a pen, at the least) — out of
doors, where the sun and the moon light them (a build's lamps light no animal — in a room they light, one takes only the
room's soft fill, as its walls do — and a room's walls do not shade one from the sun or the moon), and clear of its line by
2 m past where they walk.

**A castle** (`castle`): one part a piece, sized for the avatar and the camera behind it. Whole castles are a seed's
(`"generator": "castle"`, under *Seeds*): write pieces by hand only for a wall or a tower of your own.

- **`piece` `wall`**: a stretch of curtain wall along its x, `length` 4–60 m, three metres thick, its outside its +y. Its
  wall walk is `height` (5–10 m) over its floor, 2.2 m wide between a parapet of merlons outside and a rail inside, open at
  both ends so that the walk goes on into what it meets. `gap` 1 opens 2.4 m of its inner rail at its middle: stand a
  flight of the `stairs` kind there, square to the wall, its top at the wall's inner face (1.5 m in from its middle line)
  and level with the walk. On a slope a wall and the towers it meets stand on floors of their own: `drop0` and `drop1`
  (0–12 m, left out for none) are how far its walk steps down at its −x end and at its +x, to a tower that stands lower —
  a flight of steps 0.19 m by 0.30 m, its parapet and its rail down with it, walked as a slope; the two together no more
  than its length leaves with 2 m of level walk between them (0.19 m for every 0.30 m of what is left), and its `gap` is
  then at the middle of that level walk. Give it the `plinth` its lowest ground asks: up to 24 m. `dressed` 1 gives it
  buttresses along its outside, one every 7.5 m at the most, and a course of trim under its parapet: it then stands 0.9 m
  out past its face (3.9 m deep, where plain it is 3.12).
- **`piece` `tower`**: `shape` `round` (twelve flat faces) or `square`, `girth` 8–14 m face to face, solid up to the wall
  walk, a chamber there level with it; `joins` says where the ways through that chamber are — `through`: its −x and its +x
  (a tower along a wall, its outside its +y) · `corner`: its −x and its −y (a corner's, its outside between its +x and its
  +y; turn it 90°, 180°, −90° for the other corners). `rise` 4–9 m is how far its platform stands over the walk; `top`
  `battlements` or `cone`. `dressed` 1 gives it a course of trim round it at its wall walk and loops through its
  chamber's wall — narrow slits one looks out by —, on each face that is no way through (every other, of a round one's).
- **A tower's `stair`** (1, under `battlements`): a winding stair from its chamber up to its platform — steps two metres
  wide round a solid core, a hatch in the platform where they come up. With it the way between the tower's two ways goes
  round the core.
- **A tower's `armed`** (1, under `battlements`): a cannon on its truck (the furniture kind's, its recipe's) on a step of
  stone against its parapet, behind the crenel nearest the way it looks out — its +y along a wall, between its +x and its +y
  at a corner —, its barrel through the crenel, clear of its stair's hatch; none where no crenel that looks out is clear.
  Ten triangles more from beside it, a piece more to collide with. Stand no cannon of your own on a tower's platform.
- **`piece` `keep`**: the great tower inside the walls, one part: `length` × `depth` (16–26 × 12–20 m; 18 × 14 where left
  out), its front its +y. An undercroft 4 m high (a kitchen, an armoury, a dungeon) come into by a door in its front; over
  it a hall `height` high (5–10 m) come into by a flight of stone along its front up to a porch and a door of two leaves;
  over that chambers and a chapel; a roof behind battlements. Off its −x side at its back a square turret (7.2 m) with a
  winding stair from the ground to the roof, a door from it into each storey. Windows of leaded glass, lit by night. Its
  doors come with it (the door kind's, opening inwards as one comes near). Its box is `length` + 6.82 × `depth` + 2.9 ×
  15.6 + `height` + `plinth`; its floor is its box's bottom raised by `plinth`. Stand it on the land, 4 m and more clear of
  walls and towers, its front to where one comes from: 2,450 triangles from beside it, 714 from a street away, 196 from far.
  `dressed` 1 gives it a pier at each corner but its turret's (0.3 m out past its faces: its box 0.28 m wider along +x), a
  pinnacle over each and a course of trim under its battlements: 106 triangles more from beside it, nothing changed inside.
  `bays` 1 puts it in bays: each side of the walls inside it cut into bays of about 4.5 m (its left side's from its turret
  on), a window in the middle of each in its hall's storey and in its chambers' — none in its undercroft, none where its
  hall's door stands —, and a course of trim under each of those two floors round its walls (0.1 m out: its box that much
  wider along +x where it is not dressed). A keep 18 m long and longer has four windows a storey along its front and its
  back where it had two; one of 16 m keeps its windows where they were. Up to 430 triangles more from beside a keep a
  castle's seed stands, 920 on the largest keep there is; its rooms are told of its windows and furnished as ever.
  `stained` 1 glazes its chapel's windows (in its chambers' storey, where its front meets its right side) in the bank's
  stained glass, on the castle's eighth face: nothing else of it changes. `rooms` 2 lays a furnished keep's rooms out by the
  room kind's second layouts: its chapel's candles on two standing candelabra either side of its altar.
- **A keep's `furnished`**: `heraldic` or `azure` (left out, or `none`: bare) — its seven rooms furnished by what they
  are, each a part of the `room` kind its recipe stands (a cookhouse, an armoury and a dungeon in its undercroft; its great
  hall; two solars and a chapel over it), told of its walls, its windows and its doorways from the keep's own plan; what
  is sat on and what burns in them come with them. Give it no rooms, no furniture and no lights of your own. With it a keep
  of 18 × 14 m is 51 parts, 11,500 triangles from beside it, 8 lights by night and 11 fires — within what is fair for a build.
- **`piece` `well`**: a well, 3.2 × 2.6 m under its roof, 3.1 m high: a curb of stone 2.2 m across and 0.9 m high round its
  shaft, a windlass between two posts, a bucket on the curb. One stands on its curb; nobody falls in.
- **`piece` `stable`** and **`smithy`**: a lean-to `length` long (6–20 m) and 4.6 m deep, its back (its −y) to a wall — stand
  it with its back at a curtain wall's inner face, 1.52 m in from the wall's middle line —, its open front its +y: posts no
  more than 3.2 m apart, a roof falling from 4.2 m at its back. A stable has stalls between its posts, a manger along its
  back, a barrel and a chest; a smithy its forge — which burns: its flame comes with it —, its anvil, a quench barrel and a
  rack of spears. What is in them comes with them, parts of the `furniture` kind: write none yourself. On a floor of its
  own: its `at` z the highest ground under it, its `plinth` down past the lowest.
- **`piece` `lodging`**: the same lean-to closed — its front a wall of stone, a door at its middle (the `door` kind's, opening
  as one comes near: it comes with it), a window in each bay but the door's —; in it a pallet of straw a bay and a chest at
  each end, its floor of boards. Stand it as a stable: its back at a wall's inner face, the floor before its door clear.
- **Where a wall meets a tower**: put the wall's end inside the tower's stone — `girth / 2 − 0.02` from the tower's middle,
  and for a round tower no farther than `(girth / 2 − 0.75) / 0.866 − 0.02` (a 10 m round tower: 4.89 m; an 8 m one: 3.73).
  Both at one `height`, on one floor (the same z for their feet): the walk then goes through.
- **A piece's `style`** (left out: its own, as above): `norman` — broad square merlons, a round arch over its gate, low
  caps, a keep's windows narrow —; `gothic` — tall cones, battlements out on corbels —; `alcazar` — merlons with pointed
  caps, a round arch, corbels —; `moorish` — stepped merlons, a horseshoe arch —; `fairytale` — cones one and a half times
  a tower's girth, their roofs blue —; `ruined` — its parapet breached, some merlons gone, a tower open to the sky (no
  cone), a keep's turret without its cap. Give every piece of one castle the same `style`, a portcullis its gatehouse's
  (it is as high as that style's arch). Four looks more suit them: `plaster` (lime and ochre), `white` (white under zinc
  scales), `mossy` (weathered stone), `brick` (brick and sandstone). A seed's `style` does all of it for a whole castle.
- **`piece` `gate`**: a gatehouse `length` long (2–60 m; between two towers 6 m apart, some 6.4 m), its front 3.5 m out from
  the wall's middle line: a way through 3.6 m wide (narrower where its length leaves less: 0.8 m of stone either side)
  under a pointed arch that springs at 2.6 m and rises to 4.8 m at the most, floored level with its floor; the wall walk
  over it; a house over its way at its front, 3.2 m high, that its portcullis rises into. Its box is `length` × 5 ×
  `height` + 3.2 + `plinth`; its `at` `[0, 1, (height + 3.2 − plinth) / 2]` over its foot.
- **`piece` `portcullis`**: a grille of iron bars `length` wide (the way's width less 0.1: 3.5 m), as high as the crown of
  the way of a gatehouse of its `height` (4.8 m for 7 m and over). Stand it 2.6 m out from the wall's middle line, its
  foot on the gatehouse's floor — its looks are of iron, `iron` (its own) or `rusted` — with, on it or on its object,
  `"behaviour": { "type": "slide", "z": 2.4, "trigger": "both", "reach": 7, "time": 3, "stay": 3 }`: it rises as someone
  comes near and falls once all have gone.
- **A drawbridge** is a box on a door's hinges laid on its side: `"size": [span, 0.25, 3.6]`, `"turn": [90, 0, 90]` in an
  object whose +y looks out from the gate, its middle at `[0, span / 2, −0.125]`, with `"behaviour": { "type": "door",
  "angle": 78, "hinge": "left", "trigger": "click", "time": 4, "stay": 10 }` — a click raises its far end about its edge at
  the gate, and it comes down by itself.
- **`plinth`** (0.1–9 m): how far its base goes down under its floor. A piece's `at` is its box's middle: for a wall
  `[0, 0.06, (height + 2.08 − plinth) / 2]` over its foot. Give each piece the plinth the ground under it asks.
- **Looks**: `grey` (its own), `blocks`, `sandstone`, `varied` — `"look": "sandstone"`; a portcullis's, `iron` and `rusted`.
- A wall is 548 triangles at the most from beside it (60 m), a round tower with battlements 280, a gatehouse 146, a
  portcullis 154; from far 20, 22, 44 and none.

**What stands in a street** (`street`, `sign`, `crane`): one part each, a person's size.

```json
{ "name": "lamp", "kind": "street", "piece": "arm", "height": 8, "at": [4, 0, 4], "turn": [0, 0, 90],
  "surface": { "faces": { "0": { "texture": "metal/painted/metal-029" }, "1": { "texture": "metal/painted/metal-029" },
    "2": { "texture": "synthetic/plastic/plastic-013a", "emissive": 0.9, "glow": 0.25 } } },
  "light": { "on": "night", "range": 0 } }
```

- **`street`**: `piece` which it is; its front its +y — where a bench faces, a signal and a sign show, an arm reaches over the
  road: turn it so. `height` (0: its own) for a `lamp` (6 m), an `arm` (8), a `double` (9), a `signal` (3.6), a `roadsign`
  (2.9); `width` (0: its own) for a `planter` (1.6 m), an `awning` (3) and a `zebra` (7.5: a road's width; lay it on the road,
  its stripes along the way one drives). `variant`: a `roadsign`'s plate — 0 stop, 1 give way, 2 a limit, 3 a crossing,
  4 parking, 5 no entry, 6 a roundabout, 7 one way, 8 a bus stop, 9 works —, a bench with a back (even) or without, an awning's
  stripes. A `bench` and a `shelter` are sat on, three abreast. A `line` is paint across a lane, `width` long (3.4 m: a
  lane's) and 0.4 m of it — where one stops, before a crossing's stripes —, or 0.12 m with `variant` odd (a parking bay's
  side); yellow with `variant` 2 or 3. An `arrow` is a lane's, 3.2 m long, pointing along its +y: lay both on the road,
  a centimetre over it.
- **`style`**, for a `lamp`, an `arm`, a `double`, a `bench`, a `bin` and a `shelter` — and a `fountain`, a `kiosk`, a
  `table`, an `advert` and a `pergola` — another silhouette, in the same box:
  `modern` (none given), `classic` (cast iron: a stepped base, a swan's neck, a lantern under a cap; a bench with arms),
  `oldtown` (a lantern hung from a bracket; a bench of stone — look `stone` —; a bin of slats and a shelter of timber under
  tiles — look `timber`), `industrial` (a plain post and a flood lamp, a plank on a plinth, a drum). Keep one style to a
  street or a district: a classic street has `"style": "classic"` on every lamp, bench, bin and shelter of it.
- **In a square or a park**, each one part, its front its +y:
  - a `fountain` (5 × 5 × 3.2 m): `modern` a square basin round a block of stone, `classic` a basin of eight sides under two
    bowls, `oldtown` a trough before a pillar with its spout (the trough to its front), `industrial` a round tank and a
    standpipe. Looks `stone`, `concrete`. Its water is its own — face 7, `effects/water/rippled`, tinted —; **its jet is a
    part more, beside it in the same object**: a bead that throws it,
    `{ "name": "jet", "shape": "cube", "size": [0.06, 0.06, 0.06], "at": [x, y, z + 1.1], "material": "metal/painted/metal-029", "phantom": true, "particles": { "preset": "fountain", "scale": 0.7, "floor": -0.75 } }`
    where the fountain's foot is at `[x, y, z]` — `modern` as written; `classic` 2.58 m up, `"scale": 0.45, "floor": -1`;
    `oldtown` at its spout, `[x, y − 0.02, z + 1.14]` turned `[-90, 0, 0]`, `"speed": [0.7, 0.9], "floor": -0.66`;
    `industrial` at its pipe's mouth, `[x, y + 0.7, z + 2.02]` turned `[180, 0, 0]`, `"speed": [0.2, 0.4], "floor": -1.37`
    (the fountain unturned: turn the whole object, not the part). One or two fountains to a build: their drops are blended;
  - a `kiosk` (3.2 × 2.6 × 3.4 m), its counter to its front: `modern` glass under a flat roof, `classic` eight sides under a
    dome, `oldtown` a hut of timber under tiles (look `timber`), `industrial` a hut of sheet (look `steel`); looks `green`,
    `black`, `aluminium` too. Its band glows by night as a lamp's glass does (face 2);
  - a `table` (2.6 × 2.6 × 2.7 m): a café's table, its two chairs side by side behind it, facing its front — the street —,
    under a parasol; `classic` a round one, `oldtown` a barrel and two stools, `industrial` a table of planks with its two
    benches and no parasol. Looks `timber`, `oak`, `steel`; `variant` its parasol's cloth (red, or green, and white).
    **Sat on**, two abreast. Stand it 1.3 m from a kerb or 1.5 m before a shop's landing, never against the wall;
  - an `advert` (1.5 × 1.5 × 3.8 m): `modern` a lit panel on a foot (face 2 glows), `classic` a column of eight sides under
    a dome, posters on four of them, `oldtown` a notice board under a little roof, `industrial` a hoarding on two legs;
    `variant` its posters' colours;
  - a `rack` (3 × 1.9 × 1.15 m): three hoops and the bicycles leaning on them — `variant` 0 two, 1 three, 2 one, 3 none;
    its long side along the kerb;
  - a playground's `swing` (3.4 × 2.2 × 2.5 m, sat on, two seats), `slide` (1.4 × 4.4 × 2.7 m: its ladder at its back, its
    chute down to its front) and `rocker` (0.5 × 1.1 × 0.95 m, sat on): looks `steel`, `timber` — a rocker `steel` alone —;
    `variant` their colours.
    Lay a slab of `paving/tiles/rubber-tiles` or `ground/sand/playground-sand` under them;
  - a `barrier` (1.8 × 0.5 × 1.15 m): two boards in red and white on two feet, a lamp on one end (the other with `variant`
    odd) that glows by night where it is lit. Along a trench's side of the road and across its ends, a `cone` at each
    corner, a `roadsign` of works before it;
  - a `pergola` (4.6 × 3.2 × 2.9 m): four posts, beams at their heads and what lies across them — `modern` nine slats on
    slim steel, `classic` rafters on cast posts with brackets, `oldtown` thick timber, `industrial` a sheet of one pitch;
    looks `black`, `green`, `timber`, `aluminium`. Shade for a bench: stand the bench at the same place, under it;
  - a `helipad` (16 m across and 0.44 high; `width` 10–24): a disc of concrete of twelve sides, its yellow ring and its
    white H painted, a lamp at each corner — give it `"emissive": 0.9` on face 6 and `"light": { "on": "night", "range": 0 }`
    and they glow green by night. Its slab's top is 0.3 m over what it lies on: on the ground, or on a flat roof clear of
    what stands there. A `windsock` (0.5 × 2.1 × 5.2 m) beside it: a mast at its back, its sock out along its front.
- **What glows**: a lamp's glass (face 2), a signal's lens (face 4 red, 5 amber, 6 green) and a sign's letters (face 2) glow
  where the face is given `"emissive": 0.9` and the part `"light": { "on": "night", "range": 0 }` — by night, at none of the
  build's lights. A signal and a sign light nothing round them; a `lamp`, an `arm` or a `double` lights the ground under it
  too, 10 m from its lantern, the twelve nearest the eye (effects.md, *Light at night*). Give a lamp a `range` of its own (up
  to 10) only where it must light whether or not it is among them: it is then one of the build's lights, and a build holds
  twelve fairly. `lamp`s 16 m apart at the most (`arm`s 12.5, `double`s 9.5) for their pools to touch, a bench every 30, a
  bin by each.
- **`sign`**: `word` (by name), `height` its board's (0.4–2.4 m; its letters three fifths of it), `width` 0 for its word's own,
  `colour` — `red`, `blue`, `green` (white letters), `yellow`, `white` (black), `black`, `gold` (gold on black), `cream` (red).
  Its back is a wall's: stand it 6 cm before the wall's face, its front its +y. A hall stands its own (`sign`), and a building a
  hotel's and its shops' (`signs`): do not add those.
- **`billboard`** (*Adverts*): a place for an advert, its front its +y. `format` by name (`billboard` 6 × 3 m by a road or on a
  roof, `poster` 1.2 × 1.75 at eye height, in a shelter or on a column's face, `banner` 1.4 × 5 down a wall, `mural` 8 × 5 on a
  blank wall or a gable, `screen` 4 × 2.25), `mount` (`wall`: flat, 8 cm deep — stand it on the wall's face; `posts`: two posts,
  its board `lift` m up, 3.5 by default; `roof`: legs, 1.2 m), `scale` 0.5–2, `slot` its number among the places dealt. Face 1
  shows its advert as a face's `page` or `media` does, and the world deals it OVGrid's list — GenosDB's, GenosRTC's and OVGrid's own pages where there is none, never the
  same advert within 40 m while another may go there. 40 triangles at the most, its board's two sides from far: leave face 1
  bare, the world fills it.
- **`crane`**: `height` its mast's, to under its jib (16–54 m: eight over what it builds); `jib` its length (16–40 m), along its
  +y from its mast: turn it to slew it. Its `at` is its box's middle — its mast's foot is `[−(x0 + x1) / 2, −(y0 + y1) / 2]`
  from there, its box from `x0 = −2`, `y0 = −jib / 2.4` to `x1 = 3.15`, `y1 = jib`, z from 0.5 m under the ground — its pad's
  footing — up (with `variant` odd its cab on the other side: `x0 = −3.15`, `x1 = 2`). A building with `"stage": "frame"` stands
  its own (`crane`), at work. A crane at work is its pieces, one object, each a part of the kind with `piece` — `tower`,
  `slewing` (its jib, its cab, its red lamps: give it `"light": { "on": "night", "range": 0 }`), `trolley`, `rope` (as many
  lengths as its work says), `hook`, `load` —, its `land` how high over its mast's foot it sets its load down (0, the ground),
  all but its tower with `"behaviour": { "type": "crane", "index": n }` (n a length of its rope, 0 the one from its trolley):
  every two minutes by the world's clock its load from its yard behind its foot to where it builds, the next cycle back, each
  crane a phase of its own by its `variant`. Stand one from a generator, never by hand.
- **Their cost**: a street piece 300 triangles at the most from beside it (a lamp 50, a shelter 88, a classic fountain
  132, a classic table 206, a rack with three bicycles 282), a sign 260 (its letters rectangles: «SUPERMARKET», 138), a crane
  1,450; each a third or less from a few metres off; from far a lamp is its post, a fountain its basin, a kiosk and a
  column a box, a crane its mast and jibs, the rest nothing.

**A car in one part** (`vehicle`): when a street, a car park or a city needs cars and none of them is the subject, do not
build each from parts (vehicles.md is for a car that is the subject: twenty parts and 3,000 triangles and more). `body`:
`compact` (4.3 m), `saloon` (5.1), `estate` and `suv` (5.2), `pickup` (5.9), `van` (5.7), `lorry` (8.2) or `bus` (11.6) —
or `railcar` (16 m, 12 to 20): a train's car, on rails, in an object that says it is a train (vehicles.md, *A train*) —;
`length` longer or shorter within what its body takes; `paint` — `white`, `silver`, `graphite`, `black`, `red`,
`burgundy`, `blue`, `navy`, `green`, `sand`, `yellow`, `orange`: a tint, so cars alike but for it share a mesh —;
`livery` `taxi`, `police`, `ambulance` or `ices` (an ice cream van's) in its paint's place, a sign or a bar of lights on
its roof; `variant` odd, a
van with windows (a minibus), a pickup's cab of two rows. Its body is the one part you write, in an object that says it
is a car; its `at` is its box's middle — half its height over the ground —, its front its +y:

```json
{ "name": "taxi", "at": [12, -4], "turn": [0, 0, 90], "vehicle": { "type": "car", "power": 700, "speed": 26, "steer": 32, "mass": 1400, "drive": "rear" }, "prims": [
  { "name": "body", "kind": "vehicle", "body": "saloon", "livery": "taxi", "at": [0, 0, 1.12], "light": { "on": "night", "range": 0 } } ] }
```

- **What its recipe stands** (never write them yourself): its four wheels, each a radius over the ground — it is found a
  car by them, and driven as any (vehicles.md, *A car's handling*: a compact 600 N·m and 1,100 kg on its front wheels, an
  SUV 1,000 and 2,000 on all four, a van 900 and 2,400, a lorry or a bus 2,600 and 5,000) —, and its passengers' door, on
  the side away from its driver: whoever acts on its body sits at its wheel, whoever acts on its door rides — beside the
  driver, or in a row behind (a bus's eight rows).
- **Its cost**: whole — body, wheels, door: six parts — 500 to 670 triangles from beside it, 260 to 290 from a street
  away, 20 to 32 from far: a seventh of a car built of parts. Its lamps and a livery's sign glow by night where its part
  says `"light": { "on": "night", "range": 0 }`, lighting nothing round them.

**An auditorium in one part** (`auditorium`): a hall for talks and streams — raked tiers of seats in two blocks either side of an aisle down its middle, as a cinema's, every seat sat on, aisles of steps, a stage, a
huge screen on its dark front wall, glass at its back, a door at the foot of each aisle. Its front (the stage) is its −y; its
origin its box's middle, its pit's floor 0.2 m over its box's bottom. `style` `oak`, `walnut` or `white`; `width` 12–32 m inside,
`rows` 3–16 (1.1 m deep each), `rise` 0.2–0.6 m a row, `stage` 3–10 m deep, `clear` 3–8 m over its last row. It stands its own live
parts: a screen, the stage's voice (`who: "stage"`) and a drop on the lectern — give them none. Stand it on a plinth of its own
with steps down to the ground at its doors. A streaming lounge is a `room` of `type` `streaming` (a large screen over a console, its voice, shell chairs in rows: its own);
a talk corner two benches and a `voice` of `radius` 3. Faces: 0 floors, 1 wood, 2 seats, 3 glass, 4 ceiling, 5 screen wall.
`{ "name": "hall", "kind": "auditorium", "style": "oak", "width": 18.6, "rows": 7, "at": [0, 0, 3.73], "turn": [0, 0, 180] }`

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

**Tables laid** (`tableware`): a table's whole setting in one part — very light (a few dozen triangles a piece), colourful (tints
of three of the bank's materials, dealt by `variant`), drawn from near alone (from about 18 m nothing, no shadow) and walked
through. Lay it on a table's top: its `at` the middle of the top plus half its box less 0.2 m — its box 0.2 m of drape and its
setting's height, 0.34 m (a café's and a terrace's 0.3): on a table 0.75 m high a restaurant's at 0.82 —, its turn the
table's, `phantom` true. A generator calls `dressTable(setting, top, { deal })`, `top` `{ at, yaw, width,
depth, round, places, sides, pole }` — or `tableTopOf(part)` for a furniture table, desk or counter (`till`) and a street café
table —, and gets the part, dressed, or null for a table left bare (some are). Tables of one size share eight meshes: give
`variant` 0–7, not a seed. A furnished premise lays its own: a bar's, a café's and a restaurant's tables and counters (the
room kind's), and a city its terraces' café tables — write no tableware on them yourself.

```json
{ "name": "a table laid", "kind": "tableware", "setting": "restaurant", "width": 1.3, "depth": 0.9, "places": 4, "variant": 3, "at": [0, 0, 0.82], "phantom": true }
```

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
| `picture` | `picture`: `framed`, `canvas` (wrapped, no frame), `mounted` (a white mount in a slim frame), `board` (a slim frame round a canvas whose uvs run 0–1 across it: what its face shows — a picture as `media` — lies across it whole; a clothes shop's boards) | `width` × `height` 0.25–3 each, 4.5 cm deep: hung, its back on the wall (its −y), its bottom where it hangs |
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
| `counter` | `counter`: `panel`, `slats`, `stone` — a reception counter: its front (+y) the visitor's side, a ledge along it 1.1 m up, a work top at 0.75 behind it for whoever keeps it (a chair there, a part of its own), a screen to each 2.4 m | 1.2–6 × 0.7–1 |
| `mailbox` | `mailbox`: `doors` (letterboxes on a plinth, a slot in each, 1.8 m), `keys` (a hotel's pigeonholes over a cupboard, a key in most cells, letters in some, 2.2 m) | 0.6–4 × 0.3–0.45 |
| `bench` | `bench`: `slatted`, `padded`, `block` — no back; sat on, a place to each 0.66 m | 1–3 × 0.38–0.6, its seat 0.45 m up |
| `trolley` | `trolley`: `bellman` (a carpeted deck, tubes at its ends, a rail along its top, two suitcases, 1.85 m), `flat` (a flatbed, a handle at one end) — a luggage trolley | its model's |
| `stand` | `stand`: `leaflets` (four tiers on a panel, 1.5 m), `tower` (three on each of four sides) — a stand of leaflets | its model's |
| `throne` | `throne`: `high` (a tall back to a point, 0.9 × 0.8, 1.9 m), `canopied` (on a dais under a canopy on two posts, 1.4 × 1, 2.9 m) — sat on | its model's |
| `banquet` | `banquet`: `trestle` (a board on trestles), `high` (a high table under its cloth) — laid: a trencher and a goblet a place, candlesticks; its top 0.78 m up, its box 1.16 with what is laid on it | 2–6 × 0.9–1.3 |
| `barrel` | `barrel`: `upright` (0.72 across, 0.95 m), `lying` (on its side in a cradle, 0.95 × 0.8 × 0.85), `stack` (three, 1.65 × 0.95 × 1.5) | its model's |
| `chest` | `chest`: `plain`, `banded` (straps of iron, a lock plate), `open` (its lid stood back, gold heaped in it: 0.92 m) — 0.62 m | 0.8–1.4 × 0.5–0.7 |
| `weapons` | `weapons`: `spears`, `halberds` (a rack of six, 1.6 × 0.4 × 2.2), `armour` (a suit of armour on its stand, 0.7 × 0.62 × 1.95), `anvil` (an anvil on its block, a smithy's: 0.9 × 0.5 × 0.85), `sword` (that anvil, a sword stood in it: 1.5 m) | its model's |
| `trophy` | `trophy`: `swords` (two crossed behind a small shield, 1.3 × 1.1), `shield` (0.8 × 0.9) — hung, 10 cm deep | its model's |
| `tapestry` | `tapestry`: `woven` (2.2 m tall, a border down each side, a fringe), `banner` (2.4 m, its foot cut to two tails) — hung from its pole, 6 cm deep | `width` 0.8–4 |
| `sconce` | `sconce`: `torch` (on a bracket, 0.3 × 0.3 × 0.6), `candles` (two, 0.4 × 0.2 × 0.4) — hung; it burns | its model's |
| `brazier` | `brazier`: `bowl` (a bowl of iron on three legs, 0.84 across, 0.86 m), `basket` (a fire basket on a stem, 0.6, 1.1 m), `stand` (a standing torch, 0.4, 1.9 m) — it burns | its model's |
| `chandelier` | `chandelier`: `ring` (a ring of iron, candles round it), `tiers` (a smaller ring over it) — hung by its chain: its box's top is where it hangs from, 1.4 m over its ring; candlelight | `width` 1.2–2.6 across |
| `hearth` | `hearth`: `hall` (a great hearth: jambs, a mantel, a hood, logs on it), `kitchen` (a spit across it and a cauldron) — its back to a wall, 2.6 m; it burns | 2–3.6 × 0.9–1.2 |
| `altar` | `altar`: `altar` (a block of stone on a step, a cloth, a cross and two candles: 1.4–2.4 × 0.7–0.9, 1.7 m), `lectern` (0.6 × 0.6 × 1.37), `font` (0.8 across, 1 m) | `altar` its `width` × `depth`; the others their model's |
| `cage` | `cage`: `cage` (an iron cage, 1.2 × 1.2 × 2), `stocks` (1.6 × 0.5 × 1.3), `pallet` (a pallet of straw on the floor, 0.9 × 1.9: lain on) — a dungeon's | its model's |
| `fourposter` | `fourposter`: `canopy` (a tester, a valance and curtains), `posts` — a four-poster bed, 2.4 m; lain on, as a bed | 1.4–2 × 2.1–2.3 |
| `flame` | `flame`: `fire`, `blaze`, `embers`, `glow` — what burns of a piece, which the piece's own recipe stands: never write one | its model's |
| `cannon` | `cannon`: `field` (on its carriage, two wheels and a trail: 1.5 × 2.6 × 1.25), `wall` (on a truck of four small wheels, low enough for a crenel: 0.9 × 1.9 × 0.9), `shot` (a pile of five balls, 0.7 across) — its muzzle its front | its model's |
| `stores` | `stores`: `crate` (0.8 a side), `crates` (two and a third on them, 1.7 × 0.9 × 1.5), `sacks` (three and one across them, 1.4 × 0.9 × 0.8), `bale` (hay, bound twice: 1.2 × 0.6 × 0.5) | its model's |
| `ladder` | `ladder`: `long` (6.2 m, its foot 2.2 m out), `short` (3.4 m, 1.3 m out) — it leans back: put its back (its −y) to a wall's face | its model's |
| `gallows` | `gallows`: `gallows` (a scaffold up five steps, a post, a beam, a rope: 2.6 × 2.2 × 4.2), `gibbet` (a post, an arm, a cage of iron on its chain: 1.4 × 0.6 × 4.4) | its model's |
| `stall` | `stall`: `awning` (a counter on trestles under an awning on four posts, what it sells on it: 2.6 × 1.8 × 2.5; its awning takes a cloth colour), `cart` (a hand cart, sacks in it: 1.3 × 2.4 × 1.2) | its model's |
| `flagpole` | `flagpole`: `pole` (a flag out from a mast of 8 m in a block of stone), `standard` (a banner hung from a bar across a staff, 3.6 m) — its cloth takes a colour | its model's |
| `lantern` | `lantern`: `stone` (a lantern of stone on its shaft, 1.5 m), `post` (on a post of iron, 2.6 m), `candelabrum` (standing, five candles, 1.7 m: indoors) — lit by night | its model's |
| `campfire` | `campfire`: `logs` (logs in a ring of stones), `spit` (two stakes, a bar and a cauldron over it: 1.6 × 1.1 × 1.2) — it burns | its model's |
| `statue` | `statue`: `knight` (on his plinth, his sword before him: 0.8 × 0.8 × 2.6), `cross` (a cross of stone on three steps: 1.4 × 1.4 × 3.2) | its model's |
| `till` | `till`: `plain` (a carcass under a top, its till at one end), `display` (open to its front, three tiers of what it sells, its till), `bar` (taller, its top out over its front, a foot rail, taps) — a shop's counter: its front (+y) the customer's side, its top 1 m up (a bar's 1.1) | 1.2–6 × 0.6–0.9 |
| `shelving` | `shelving`: `goods` (packets and boxes), `bottles`, `bread` (baskets of loaves), `magazines` (leaning in tiers), `folded` (stacks of clothes) — shop shelving, its back to a wall, 2 m | 0.9–2.4 × 0.35–0.6 |
| `gondola` | `gondola`: `goods` (shelves either side of a panel, 1.4 m), `crates` (two steps of crates of fruit either side), `table` (a table of stacks: books, folded clothes) — a shop's island, seen from both sides | 0.9–2.4 × 0.7–1.1 |
| `garments` | `garments`: `rail` (two uprights, a rail, clothes along it), `round` (a round rack, 1.1 m across) — clothes on a rail, 1.6 m | 1–2.4 × 0.5–0.6 |
| `mannequin` | `mannequin`: `standing` (1.8 m), `torso` (on a pole) — what it wears its look's cover and bedding | its model's |

**A picture**: its look is its painting — `"look": "tivoli"`, one of the bank's paintings in the frame that suits it (catalog.json
→ `kinds`: `mondrian`, `cafe`, `cottage`, `tivoli`, `twilight`, `snow`, `kashmir`, `yosemite`, `garden`, `bath`, `bottle`, `bamboo`,
`cloud`, `oasis`, `seine`, `tiger`) — and the painting covers its canvas once, whatever its size (the import gives its face 6 the
canvas as its `scale`). Give it the painting's shape: its canvas is the picture less its frame (4.5 cm a side; a mount 10 cm; a
canvas none), so a `framed` picture of a painting of 1.1 × 0.84 m shown at 1.3 times is `"width": 1.54, "height": 1.18`. Hang it
with its back on the wall's face, its middle about 1.7 m over the floor (higher on a game's storeys of 4 m: 1.9–2.1). What dresses
a room collides with nothing: a rug walked over, a picture, a plant, a lamp, a coat rack walked through.

**What burns** — a `sconce`, a `brazier`, a `chandelier`, a `hearth`, an altar's candles — comes with its flame: a small part of its
own that its recipe stands where it burns (as a bridge stands its lamps), embers that glow, a fire over a torch, a brazier and a
hearth, and a light by night reaching 4–10 m. **Write no `light` and no `particles` on the piece**, and no `flame` part. A build's
lights are few (budget.md): eight within 30 m is fair — a furnished room (below) lights two of its flames in a great hall and one
elsewhere, and the rest only glow. What hangs — a `trophy`, a `tapestry`, a `sconce` — has its back (−y) on the wall's face and its
bottom where it hangs, as a picture; a `chandelier`'s `at` is 0.7 m under where its chain is hung.

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
street of them costs nothing more. A colour is what the cloth comes out as, whatever look it is dressed in — a charcoal sofa
`sand` comes out sand, lighter than it was, a white one `slate` darker — and a tone the same on any wood; a cloth near black in a
channel (a cognac leather's blue) comes out a little short of the colour there. Its scatter cushions and its duvet stay its
look's, the accent beside the colour. Three shape it, each 0–1 with 0.5 its model's own:
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
ways it may be laid out — by a game's rules (the receptions' — `lobby`, `reception` — below): a bed between its side tables, its head to a wall; a sofa before a low table on a rug, an
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

**A reception** (`type` `lobby`, a block of flats' entrance hall; `reception`, a hotel's lobby): laid out from what it is told as any
room, with one more word in it — **its first `ways` is its way in**, the landing behind the street door (none given: the middle of
its front). A desk faces it: a reception counter, its front turned to the way in, the floor behind it as deep as its `way` and a way
in as wide at one end of it, the floor before it as deep kept clear, a chair behind it (a seat) — in a corner or an alcove where it
has one (an alcove beside a stair), else its back to a wall, else one end against a wall and its front along the room, else free —;
in a hotel's its pigeonholes and keys or shelves against the wall behind it. A lobby, by its size, mailboxes near the way in, a bench
or a pair of armchairs, a runner, pictures, plants — a small hall the desk and little else —; a hotel's a stand of leaflets, a
luggage trolley, groups of seats on rugs about low tables (four at the most; a pair of armchairs where none fits), pictures, plants —
both a hotel's works of the bank on their walls (calm landscapes and seascapes, flowers), each a part of its own. What it stands
keeps off every one of its `ways`, a side open to an alcove too. Tell it a stair's foot as a `way` and a `keep` 2.2 m deep, a core
standing in it as `closed` with the landings before its doors as `ways` and `keep`.

**A castle's rooms** (`type` `greathall`, `solar`, `chapel`, `cookhouse`, `armoury`, `dungeon`; `height` up to 10): laid out from
what they are told as any room, in a castle's palettes — `heraldic` (dark oak, red and gold) or `azure` (dark oak, blue and steel).
A great hall: at its head — the short side farthest from where it is come into — a throne under its canopy between two braziers;
two long tables on trestles, benches along both sides of each, an aisle and a runner between them; a hearth at its foot, across
from the throne; chandeliers over the aisle; tapestries, banners, trophies of arms and torches on its walls; chests in its corners.
A solar: a four-poster, a chest at its foot, an armoire, a table and its chair, a brazier, a suit of armour, a tapestry, candles.
A chapel: an altar against its head wall — under its window, where it has one —, a lectern, a font by the way in, pews either
side of an aisle, banners. A cookhouse: a hearth with its spit and its cauldron, a long table, barrels, a chest. An armoury: racks
of spears and halberds, suits of armour, chests banded with iron, trophies. A dungeon: a cage, stocks, pallets of straw to lie on,
a barrel, a torch. What is sat or lain on (a throne, benches, a chair, a four-poster, a pallet) and each flame are parts of
their own, the room's recipe's. A keep of the `castle` kind furnishes its own (its `"furnished"`): write a castle's room only
where there is no such keep.
A room's `"edition"` (left out, 1) is which of its layouts it is laid out by: `2` stands a chapel's candles on two standing
candelabra either side of its altar, where its first hangs them on the wall over it; every other room is laid out by its second
as by its first. Give a castle's room you write `"edition": 2`.

**A premise** — a room come into from a street, a building's shop — is laid out the same, its way in its first `ways`: `type` `bar`
(a bar's counter facing the way in, its taps on it, bottles on shelves behind it, a row of stools along its front; long tables
between two rows of chairs), `cafe` (a display counter, a row of stools along it; a bench along a wall with a table and chairs across
it; a table between its rows; armchairs where it is large), `restaurant` (tables between rows of chairs, four at the most, a
sideboard; a bar at its back where it is large, stools along it), `office` (a desk facing the way in, desks along the walls each with
its chair, a table to meet at, bookcases) and `shop` — its counter and its till facing the way in, shelving side by side along its
walls and islands on its floor, by its `"trade"`: `grocer` (packets, bottles, crates of fruit), `bakery` (a display counter, baskets
of bread), `books` (bookcases, tables of books), `pharmacy`, `news` (magazines in tiers, a tower of postcards), `clothes` (rails
along its walls and round racks, folded clothes, mannequins at its window — the only thing that stands before glass). What is sat on
is few parts: a row of chairs or of stools is one. What hangs on its walls is the bank's works for premises by what it is — a
`restaurant`'s still lifes of food and wine, a `cafe`'s flowers, coffee, bread and pastry, a `bar`'s posters and nocturnes, an
`office`'s landscapes, maps and cityscapes, a shop's by its trade (a pharmacy's botanical plates, a bookshop's scholars and maps) —,
each a part of its own, its frame cut to its work; none twice in a room. Give it its glass as `windows` with `sill` 0: nothing but a
clothes shop's mannequins stands before it. A building with `"ground": "shops"` and `"premises": "furnished"` stands these itself
(below): write a room of them by hand only for a shop you build of prims.

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

**A flat** (`"kind": "flat"`) is a floor between four walls divided into rooms and furnished, in one part: its partitions, each
with its doorways 1.4 m wide; its recipe stands each room (the room kind, furnished by what it is) and what is sat on in it.
Give it its floor — `width` from the wall its way in is in (its left, −x) to the wall farthest from it, `depth` along that wall,
`height` —, where its way in is (`door`: its middle along y, from the flat's middle) and what is in its walls, so that no
partition stands across a window and each room knows its own: `windows` `[[side, from, to, sill], …]` and `ways`
`[[side, from, to], …]` (a way onto a balcony, into a room behind) — sides 0 its back (−y), 1 its right (+x), 2 its front (+y),
3 its left; `from` and `to` along x (its back and front) or y (its sides), from its middle. It lays itself out as a house of one
storey is: 7.6 m wide or more, a living room on the wall its way in is in and behind it a row along the far wall — a bedroom, a
bathroom, bedrooms after it as its length suits (`beds`: `suits`, `1`–`3`), each with its door on the living room, the kitchen
past the row, open, a dining room past that; a living room wider than ten metres with a dining room and a lounge open to it —;
narrower, a bedroom across the end away from its way in and a bathroom beside it; small, a room to live in and its bathroom
(`beds` `none` asks that of any: a flat whose bedroom is elsewhere). `palette` (`oak`, `walnut`, `white`) and `variant` furnish
it; `cloth` 0–11 turns its rooms' cloth colours — flats alike but for it share every mesh —; `doors`: `doors` (a door to each
bathroom) or `open`. Looks, its walls: `plaster`, `stucco`, `boards`, `concrete`. A building of the building kind furnishes its
own flats (`"inside": "near"`): write a flat by hand to furnish a floor you build of prims — a loft over a shop, a cabin's floor.

```json
{ "name": "flat", "kind": "flat", "look": "plaster", "palette": "oak", "width": 10.8, "depth": 15.5, "height": 3.75, "door": 0.8,
  "windows": [[1, -5.7, -3.8, 0.9], [1, -1, 1, 0.9], [1, 3.8, 5.7, 0.9], [0, -3.4, -1.4, 0.9], [2, -3.4, -1.4, 0.9]], "at": [0, 0, 1.875] }
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
`"to": "owner"` its owner alone). Each takes `"who": "anyone" | "owner" | "stage"` (who goes on air — `stage`: only those
standing within its `stage` m, 1–30, the rest listening; the audience raises a hand and is brought onto it), `radius` (m) and
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
  | `slide` | slides aside and back by itself: a sliding door, a window, a hatch; a train's door, at its stops | `x`, `y`, `z` (m, its own axes), `trigger` — a door's three, or `"stops"`: a part of an object that follows a route opens once its vehicle has come to a stop it waits at and shuts before it sets off, by the world's clock, the same for everyone —, `reach`, `time`, `stay` |
  | `spin` | turns round its own z all the time: a sign, a windmill's sails, a carousel | `speed` (°/s) |
  | `crane` | a piece of a tower crane at work, by the world's clock: its hook down, a load taken up, its jib slewed, its load set down, a rest; a cycle each way | `index` (a length of its rope; any other piece 0) |
  | `bounce` | hops along its own z and falls back, over and over, as a ball does: a ball, a toy, a sign that jumps | `height` (m, 0.05–20) |
  | `move` | goes to a point and back, waiting at either end: an elevator, a ferry, a platform | `x`, `y` (m, ±64), `z` (m, −64 to 100 km), `speed` (m/s), `ease` (`"smooth"`, the default: eased over its whole way, `speed` its average; `"accel"`: speeding up at `accel` and slowing down at `decel`, m/s² — over speed² / (2 × either) m — `speed` its fastest), `wait` (s); `fall` (m/s², 0.5–30): its way back a fall, speeding up that fast as far as that gets it and caught at `caught` (m/s², 20 unless said) into where it is kept — a drop tower's ring; `every` (s): its round exactly that long, the rest waited where it is kept |
  | `call` | on a click, brings what goes and comes back near it down where it is kept at once, to set off again from there: a call button by a platform; a `lift` near it, to its stop nearest the button | `reach` (m, 8: how near it what it calls is kept) |
  | `lift` | goes from stop to stop up and down its frame on a click — on it, or on a call button by a stop — and waits there till it is called again: a platform lift, an elevator; the parts of an object whose lift has the same `group` go as one (a platform, its rails, its buttons); those that are its doors slide open while it stands at a stop and shut before it goes, and those that stay at a landing do not go with it; a part of the `lift` kind that shows it — a `display`, a car's `panel` — is drawn showing where it is, the way it goes and where it was sent, the same for everyone by the world's clock: `"button": "none"` and its `landing` for a display at a landing, no `landing` for one that goes with it | `stops` (up to 31, m up its frame from where it is kept, below 0 down: a floor each), `speed` (m/s, 0.8), `group` (a name its parts share), `button` (`"none"`: a click on it does nothing — its floor, its rails —; `"next"`, the default: on to its next stop, back from either end — one button for down and up —; `"stop"`: to its `stop`, 0 where it is kept — a button a floor; `"panel"`: a car's panel of the `lift` kind, to the stop of the button clicked on it), `door` (m: a door of the lift — how far it slides along its own x from shut to open; open while the lift stands at a stop, a second to shut before it goes and to open once it is there; write the part where it stands while the lift is where it is kept — its car's own and the first landing's open, the others' shut), `landing` (−1, the default: it goes with the lift; 0 and up: it stays at that stop of the lift — a landing's door, open only while the lift stands there, which with `"button": "stop"` and that `stop` calls it there on a click) |
  | `switch` | switches its object's lights in its zones, for everyone: on a click on or off — a switch by a room's door, one for a floor, one for every light — or, `"near"`, a presence detector: on while someone stands under it on its floor, off once all have gone; prims only | `zones` (a list of zone names, or `"all"`: every light of its object in a zone), `trigger` (`"click"`, the default; `"near"`; `"both"`), `reach` (m, 4: how far across under it a presence detector senses), `stay` (s, 30: how long its lights stay on once all have gone) |
  | `belt` | carries whoever stands on it along its own y: an escalator, a walkway | `speed` (m/s) |
  | `passage` | a click on it, or E, takes whoever aims at it in or out, standing: from outside its object to its place inside — into a vehicle by a click on its hull —, from inside out across its thinnest side onto what is there — out by its door; inside its object is within the box round its solid parts' middles | `way` (`"both"`, the default; `"in"`: only in, its hull; `"out"`: only out), `x`, `y`, `z` (m, in its object's frame: where one stands going in, on its floor), `depth` (m, 1: how far past it one stands going out) |
  | `route` | goes through its points on a smooth curve, round and on again or there and back, stopping a while at each if asked: a boat on a tour, a train on its line | `points` (up to 64, `[x, y, z]` m in its own frame — or `[x, y, z, hx, hy, hz]`, gone through along its handle, leaving towards its tip; `[x, y, z, 0, 0, 0]` a corner, where it slows to a stop and turns), `speed` (m/s), `stop` (s), `at` (`"each"`: stops at every point; `"ends"`: only where it is kept and, there and back, at its last), `calls` (the points it stops at in the place of either, by their number — `[2, 5, [7, 20]]`: its second and its fifth as long as `stop` says, its seventh 20 s — and where it is kept: a bus at its shelters), `built` (`true`, a car's: it keeps the heights its points say, its nose up and down with them, as a train's on its line — on a deck, a bridge, a plate — where a car's route lies on the land under it), `every` (s, 1–86,400: its round exactly that long, for good — a timetable; what it would take less it waits out where it is kept, and a whole number of seconds never drifts on the clock every peer shares), `behind` (m, 0.1–400: a coach coupled behind its train's first, its points the first's in the first's frame, runs that far back along the line from where the route has the train — kept where it stands behind the first at rest —, so that on a curve each coach bends from the next at its gangway), `mode` (`"round"`, `"back"`), `face` (`"yes"`: turns to where it goes), `water` (`"yes"`: keeps its height over the sea), `name` (what this route is called among its routes; none, Route 1), `routes` (up to 7 other routes kept to be run instead, `{ name, points, speed, stop, at, mode, face, water }` each); on a starship, its trip to space: its points' z its height over the planet's round, up to 100 km, x and y across it, 1,000 km at most, `speed` up to 2,000 m/s and `accel` up to 30 m/s², facing where it goes (vehicles.md, A starship) |
  | `garment` | a click on it, or E, puts an item of the wardrobe on whoever acts on it, at once, kept as their look — what of its category they wore put back by a second click; the hint says «Put on», then «Take off». A clothes shop's boards are its (their face's picture the item's, from the avatar library) | `item`: the item's id in the avatar library, `collection/name` (a clothes shop's boards show fifty everyday ones) |
  | `treasure` | found with E by whoever touches it: its points (XP) and coins, once to each player, by its id; the voucher is signed as it is set, by whoever sets it, and counts only when that is OVGrid's master account or an issuer it certified — anyone else's treasure is found and gives nothing; a prim, an object or a clone | `points` (XP, 0–1000, 50), `coins` (0–100, 10), `hunt` (the treasure hunt it is a chest of: found, the next chest's clue is said; the hunt's caps over all its chests); its `voucher` is the page's, never written in a build |
  | `game` | a piece of a game with prizes: a race passed through — its start, its checkpoints in `order`, its finish —, a shooting gallery clicked — its start (a bell: a round of `par` s) and its targets, from up to 15 m —, a treasure hunt's board (clicked: where its first chest is). Its owner's page referees it: signs what a match gives within its game's caps | `game` (`"race"`, `"gallery"`, `"hunt"`), `role` (`"start"`, `"checkpoint"`, `"finish"`, `"target"`), `order` (a checkpoint's, 1 first), `par` (s, 60: a race at par or under gives all its game allows, slower less; a gallery's round), `reach` (m, 4: how near a race's piece's middle one passes), `set` (the game's name, the same on all its pieces; the hunt's for a board) |

- **Treasures to find** (`treasure`): hide one anywhere — a chest in a cellar, a box behind a waterfall, a
  shell on the sea floor — as any part is placed, and give it `"behaviour": { "type": "treasure", "points": 120, "coins": 20 }`
  and a `name` (what the finder is told they found: «Old chest»). E finds it, once per player; each finder's claim is kept in
  the land it is in, so the land's standing (the Profile's «This land») counts who found what there. A build only says what it is
  worth: its voucher is signed by the page of whoever places it, so a build imported by OVGrid's master account gives points and
  the same build placed by anyone else gives none. Keep it small and in reach of the avatar (5 m): it is aimed at as any part.

- **Games with prizes** (`game`): a race is gates — two posts and a banner, 6 m apart, one object each with the `game`
  behaviour, the same `set` on all of them —, a shooting gallery a stall — a counter, a back wall 5 m behind it, a bell on the
  counter (role `start`) and targets on the wall (role `target`) —, a treasure hunt a board (game `hunt`, role `start`) and
  chests with `"hunt": <its set>`. What a match gives is capped by its game (race 150 XP / 20 coins a match, 10 min apart;
  gallery 100 / 15, 5 min; hunt 900 / 120 over its chests) and signed by the page of whoever placed the game: the master account's builds give prizes. Keep a race's
  gates 6 m wide on open ground, a checkpoint every 30–60 m.

- **Fishing**: any water fishes — the sea, a lake, a built body of the bank's water (a part whose top face, face 0, is
  `effects/water/…`): a **pool** when that part's colour — face 0's own `color`, else the part's — is the pool kind's clear
  blue (blue 0.9 or more and red under 0.75), where only junk bites, and a **pond** when it is not (a park's or a garden's
  pond, a moat). A face's `tint` does not count. A street kind's `fountain` holds no such water — its water is a face of the
  piece, face 7, not a body —: a basin fishes only where its water is a part of its own. To make a place to fish, build water
  a player can stand beside within 2.5–22 m: a pier or a jetty over the sea, a pond in a garden with a bank to stand on. Give
  a pond a green or brown `color` (`[0.3, 0.45, 0.35]`), never the pool's `[0.62, 0.9, 1]`. A fishmonger is a figure with `"dialogue": "fishmonger"`: it buys one's catches.
  What a catch gives is capped by the day (400 XP; the fishmonger's 80 coins) and signed by the master account.

- **A casino** (`game` `slots`, `roulette`, `blackjack`, `poker`, `dice`, `fortune`; kind `casino`): each machine or table is a part with
  the `game` behaviour, role `start`, a `set` of its own (`"Casino · slots 1"`), a slot machine's `variant` its kind (0 classic,
  3 reels and 5 lines; 1 a fruit machine of one line; 2 five reels and 9 lines). E on it opens its panel; it is played for the
  game's coins alone — never money, never bought, never cashed out — at 1–10 coins a bet (a roulette spin 20), a bet's net win
  100 at the most and a player's net loss 100 a UTC day. Its outcomes are drawn fairly: its house — the owner of the part, the
  master account for the repository's builds — commits to a chain of seeds before any bet and reveals one a round (a slot every
  3 s, cards and dice 6 s, a wheel of fortune 12 s, the roulette 30 s), mixed with the player's own seed — but for a roulette's
  ball and a wheel of fortune's pointer, one draw a round for its whole table, whoever bets on it; what a bet returned is the house's signed
  settlement — the master account's own rounds at its own house count too. Its games show in the world: a roulette's felt is
  spots, each a part with the `game` behaviour role `target` and a `set` of its table's and its code (`"Casino · roulette#red"`,
  `#n17`, `#d2`, `#c1`, `#low`, `#even`, `#odd`, `#high`, `#black`), a chip placed with E; its ball a `ball` part (kind `casino`)
  at its wheel's axis, given a `spin` as fast as its wheel's; a slot machine's reels `reel` parts named `<machine> · reel 1…`, a
  machine's `variant`, their axis along its width, reel 1 at the player's left, turned `[0, 90, <machine's turn>]`; a wheel of fortune a `fortune` stand (the start) and a `fortuneWheel` part
  named `wheel of fortune` facing the room. With nobody signing for it, its panel says the house is away. A whole casino: its hall (kind `casino`, piece
  `hall`, its way in at its +y), slot machines along a wall, video poker, a roulette and its wheel turning in its bowl (an
  object of its own with a `spin`), blackjack, dice, a bar of the furniture kind's (a bar's counter, bottles, bar stools) and its drinks of the tableware kind's, a
  cashier's desk, a few lamps under its ceiling, and its croupiers, barman and cashier as figures their objects stand
  (`figure: { dialogue: 'casino-roulette' }`, `casino-blackjack`, `casino-dice`, `casino-fortune` by its wheel of fortune,
  `casino-bar`, `casino-cashier`).

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
- **On what is built** — a deck, a terrace, a plate over the land, a roof: `"level": true`, and its home with its height,
  `"at": [x, y, z]` (z over the place the build is put at, as a part's). It then walks level with its home, at that
  height wherever its animals are: left out, a herd stands on the land, under whatever is built over it. For what is
  flat and wide enough for its `territory` — geese on a pond's sheet of water, dogs in a pen of 11 m: it sees no wall.
- **Its ground**: it walks no steeper than 35°, never into the sea, as far as its territory or nearer where the ground
  does not let it; where none is left round its home — steep all round —, it stays there: another `seed`, or gentler
  ground. It has no collision and does not see what is built: **give it open ground as wide as its territory** — a
  paddock (`territory` its radius), a meadow, a farmyard behind a fence —, never a house or a street; for hens in a
  run, a `territory` of 5–10.
- What it is: no reaction to people, no sound; of a species in sight at once, the 48 nearest are drawn (the check
  says when a build puts more). Each animal is 240–440 triangles, drawn while it covers 4 px; a herd costs a record.
  A dinosaur does not graze; it may run, act at a stop (its attack or its jump) or lie down (its fall), of its own.

## Seeds

```json
"seeds": [ { "generator": "neighbourhood", "at": [0, 0, 0], "turn": 0,
             "params": { "width": 120, "depth": 80, "plot": 30, "mix": 0, "mansions": 1, "pools": 1, "trees": 3, "seed": 7 } } ]
```

- **What a generator makes, kept as what it was made from**: a seed is one record — its generator's name, its numbers,
  where it stands and how it is turned — and what it makes (a neighbourhood: a street round, a house a lot, pools, paths,
  trees) is worked out from it by every page that comes, the same for everyone, on the planet's own ground. It is sent
  as those numbers: a neighbourhood is under 300 bytes on the wire, where its hundred and more records written out are
  76 kB. Use one wherever a generator makes what is wanted: it loads at once for whoever comes, and costs a land a line.
- `generator`: `neighbourhood` (its `params`: `width` 90–240 and `depth` 60–200 m of its street's rectangle, `plot` 26–44 m
  of street a lot, `mix` 0 every style · 1 modern · 2 timber, `mansions` 0–2, `pools` 0 none · 1 the mansions' · 2 some
  houses' too, `trees` 0–6 a garden, `seed` 0–9999 which of them it is); or `city` — streets in a grid on a level plate,
  a block a use: flats, towers, halls, a square with its landmark, a public building, parks, a site with its crane, and
  its streets' lamps, signals, crossings, benches and trees, its shops' awnings, café tables, kiosks, fountains and a
  playground — (its `params`: `width` and `depth` 130–250 m, a block every
  fifty metres or so; `height` 4–32, the storeys of its tallest; `profile` 0 high at its centre · 1 at its edges · 2 even;
  `mix` 0 every use · 1 homes · 2 business; `parks` 0–3 blocks; `works` 0–2 buildings in construction; `trees` 0 none ·
  1 some · 2 many along its streets; `bridges` 0 none · 1 a footbridge over its avenue · 2 and a street carried over
  the avenue on two ramps · 3 and a railway on a viaduct — along its north side, or round the city where it has its train
  (its `vehicles`: `rail`); `life` 0 bare · 1 lived in — awnings
  over its shops, café tables, kiosks, racks of bicycles, advertising columns, a fountain in its square and in each park,
  a playground, a trench behind its barriers — · 2 and green — a street for walking under its trees, pergolas and a
  pattern in its square's paving, flower beds, a pond with its geese and a pen with its dogs in each park — · 3 and its
  shops open: the shops on its buildings' ground storeys furnished, each by what it is, in turn along a street — · 4 and
  its homes furnished: every building `inside` `near`, its flats in rooms, a lobby in each, laid by nearness — · 5 and
  its places for adverts: posters on its advertising columns, on its bus shelters' closed sides and on its shops' fronts, a
  billboard on a flat roof a block, a screen at its square's edge, each a place of the `billboard` kind dealt where it is
  laid —; `seed`
  0–9999). Numbers only, by name;
  any left out is its generator's own. A city wants dry ground, whole inside one parcel: 250 × 190 m is twelve blocks —
  16 storeys at its tallest, with all its life, bridges and vehicles (`life` 5, `bridges` 3, `vehicles` 6), 343 objects of
  1,781 parts, 400 clones, 168 trees and 345,000 triangles at the finest: past a build's *fair* in parts, triangles,
  materials and things moving, within its *most*. Its avenues — its streets from west to east — are each levelled a hand
  over the highest ground under it and half the blocks either side; where they all stand within a metre of one another it
  stands on one level plate, a
  hand over the highest ground under it, so long as the ground falls 5 m at the most under it (more, and it is refused).
  Where they spread more it stands in terraces, and the land is left as it lies: each avenue level at a height of its own, a
  street between two climbing from the one to the other (12 in 100 at the most), a block of two rows of flats stepping in
  its middle and every other block whole at the higher of its two avenues' heights, a stair up every step of 0.3 m and
  more, a wall where a terrace stands over the next and a parapet along its top, rocks of the `rock` kind on the land at the foot of its outer walls, where the land beside it is steep and along the water where the sea comes near (7 m at the most over the land; steeper or more uneven ground it
  refuses, and says so). Its fronts face its south (its −y): turn its seed to look down the land's fall — its heading
  towards the lower side — and every door is level with its pavement, the walls behind; its avenues run along the contours,
  so across its length the ground should fall little. No street is carried over its avenue in terraces.
  A land of a region: `lands` 1, 4 or 9 and `place` 0 … `lands` − 1 — how many lands its region is, a square of them, and
  which of them this seed's is, in rows from the region's south-west, west to east — in the `params` of a `city`, a
  `neighbourhood`, a `park` or a `garden` put at its parcel's middle. It then lays a road from a gate of its own out to
  the port of each side of its parcel — a place of that edge worked out from the two parcels that share it, the same from
  either —, where the land beyond lays its own to meet it: a city from its sides' ramps, a neighbourhood from its street's
  side by its corners, a hillside's from its streets' ends, a park and the garden's grounds from a ramp at their gate (their
  −y). Every join is pinned — a road out starts at the height, the grade and the lean of the street's side or end or the
  kerb it leaves, and ends at its port as the port's own ground says, the same from the land beyond: no step, no kink. Out
  of a gate with a ramp the road starts free, resting on its ground, and the ramp is laid to it after, straight down through
  the road's start and on under it: their heights meet, their grades need not. At its region's edge — no land of its region beyond that side — its road ends in a turning circle before
  the port, the circle's outer edge against the parcel's edge, or is not laid where what stands there leaves no room
  (some 24 m). Towards a land of its region a gate serves any port that is not behind it, and where no gate is left for
  such a side its road leaves the side of a road already laid — a fork, flush with it. `joins` (in the same `params`, with
  `lands` and `place`) says the sides of its parcel it lays a road out over — its west 1, its south 2, its east 4, its
  north 8, added up; every side (15) where it is left out —: leave a side out where no land of the region stands beyond it
  or the land beyond lays none to that port, so that no road ends at a port nobody comes to. The editor's settlement tool
  sows a region so, a seed a land, and composes it — it works each land's `joins` out, turns a park or the garden's
  grounds to a land that comes to its gate, and says which lands its roads do not reach from its centre; each land may be
  named there («Each land»: a city, a neighbourhood, an amusement park, the garden's grounds, or left open). A region of
  four or nine lands has a train where its lands close a ring: `loop`, in the same `params` of each land on it, says the
  places of the lands it goes round, a digit each — its place and one —, the first the land that keeps the train (`2134`:
  from the land of place 1 through 0, 2 and 3 and back). Each land of it lays its own stretch of a viaduct between its
  parcel's rail ports — a seventh of the parcel in from its north and its east sides: the tool sizes a land to leave that
  strip free —, a station where it runs straight a platform's length, and the first the train. The tool works the loop out
  and says why where none closes (a viaduct over 30 m to hold 4 in 100: mountains). Leave `lands`, `place`, `joins` and
  `loop` out of a seed placed by hand. A file of a region's seeds is checked a land at a time — each
  land is a build of its own, with its own budget.
  When you lay roads by hand that meet: end to end, one road cut in parts by the road tool meets itself with no step; two
  roads laid apart do not — draw them as one, or run them into a roundabout.
  Or `castle` — curtain walls round a courtyard on the land as it lies, a tower at each corner and along each side, a way in
  through a gatehouse at the middle of its south side (its −y), stairs of stone up to its wall walk — (its `params`: `width`
  and `depth` 48–140 m, the rectangle of its walls' middle lines; `height` 5–9 m, its wall walk's; `towers` 0 round ·
  1 square · 2 round at its corners, square along its walls; `tops` 0 battlements · 1 cones · 2 cones at its corners;
  `look` 0 grey stone · 1 old blocks · 2 sandstone · 3 mixed stone · 4 lime and ochre · 5 white, zinc roofs · 6 weathered
  stone · 7 brick and sandstone; `moat` 0 none · 1 a moat; `style` 0 its own · 1 norman · 2 gothic · 3 alcazar · 4 moorish ·
  5 fairytale · 6 ruined — a style sets its towers, their tops and its stone, whatever those three numbers say —;
  `furnished` 1 its keep furnished · 0 bare; `seed` 0–9999). Its gatehouse
  stands between the two towers of its way in, a portcullis in it that rises as one comes near; with a moat — water from
  its walls 14 m out, held by a bank of stone, laid where the ground round it falls 2 m at the most (elsewhere it says so
  and has none) — a drawbridge spans it before the gate, raised on a click, and its floor stands over the water. A castle
  wants dry ground, and 28 m of its own round its walls' lines with a moat, 16 without; it stands on any ground, level or
  not — a hillside, a ridge, a hilltop, a cliff's edge —, and never asks for the land to be changed: with no moat to hold it
  level each tower and each stretch of wall stands on a floor of its own, a hand over the highest ground under it, its base
  down past the lowest (24 m at the most under one piece: a chasm it refuses, and says so); its wall walk steps down from
  one to the next by a flight at a wall's end; its stairs up to that walk, the way in from its gate and the way down from
  its keep are a ramp where the land is near and else flights of steps with landings, and before its gate, where the land
  falls away, a terrace and steps along the slope. Its gate looks where its seed is turned (`turn`): turn it downhill, or
  along the slope. What it could not do there it says in its notes (a stair no stretch of wall takes).
  76 × 64 m is nine towers, eight walls, a gatehouse, a keep, two stairs, a well, stables and a smithy, some 125 parts, 25,000 triangles at the finest.
  In its courtyard's north stands its keep, its front to the gate — furnished, in one of a castle's two palettes by its `seed`:
  its great hall, its solars, its chapel, its cookhouse, its armoury and its dungeon —, and every tower under battlements has
  its winding stair.
  Its `edition` `1` is its walls and towers alone, a plain way in; its `2`, its gatehouse, portcullis, drawbridge and moat
  besides; its `3`, its keep and its towers' stairs; its `4`, its keep furnished; its `5`, its styles; its `6`, its
  courtyard — a well, stables against its west wall and a smithy against its east; its `7`, on any ground — up to its
  `6` it is level all round, and refuses ground that falls more than 5 m under its walls; its `8`, what stands in it,
  pieces of the furniture kind: by its gate a cannon either side trained on the way in, its shot and a lantern of stone;
  crates, sacks and a bale by its stables, barrels, a crate and a sword in an anvil by its smithy; a ladder against a
  wall; by its `seed` a market (two stalls, a hand cart), a gallows and stocks, a yard of arms (racks of spears and
  halberds, a suit of armour, bales) or a cross of stone and a knight; a flag and two standards on its keep's roof; a
  tree or two of its style's species; five hens before its stables. Stand nothing of these beside a castle's seed: it
  has them. Its `9`, its walls and its towers dressed (`dressed`): buttresses, courses of trim, loops. Its `10`, its
  towers closer or farther apart by its `seed` — 38, 30 or 24 m between two at the most, fourteen towers at the most: a
  castle of nine to thirteen towers may have more with another seed, one of fourteen or more is as it was. Try a few
  seeds: its towers, its keep, what its bailey is given to and its flags change with it. Its `11`, its keep dressed too: a
  pier at each corner but its turret's, a pinnacle over each, a course of trim under its battlements. Its `12`, its
  lodgings: a lean-to closed with a wall of stone, a door and windows, pallets and chests in it, against the stretch of its
  west wall and of its east nearest its northern half that takes one — where all else leaves room. Its `13`, its keep in
  bays: a window a bay a storey, a course of trim under each storey's floor. Its `14`, its keep's chapel in stained glass.
  Its `15`, its corner towers and its gate's under battlements armed: a cannon on each one's platform. Its `16`, its keep's
  rooms by their second layouts (`rooms` 2).
  Its styles: Norman — square towers under battlements, broad and low, old blocks —; Gothic — round towers, cones on its
  corners, grey stone —; a Spanish alcázar — square towers, cones on its corners, pointed merlons, sandstone or brick —;
  Moorish — square towers, stepped merlons, a horseshoe gate, lime and ochre —; a fairy tale's — slender round towers under
  tall blue cones, white —; a ruin — weathered, breached, its towers open, a fallen block at each wall's foot. Castles many
  together: give all but one or two `furnished` 0 — a furnished keep is 8 lights and 11 fires, and a build brings 32 and 48
  at the most (six of 48 × 48 m on one parcel, two furnished: 459 parts, 96,100 triangles at the finest, 28 lights).
  A seed makes no treasure (a treasure's voucher is signed by whoever sets it; what a seed makes is every peer's): hide a
  castle's by hand, chests of the build beside its seed with the `treasure` behaviour (*Treasures to find*) — behind its
  keep, in a corner tower's chamber, on a tower's platform up its stair, on its keep's roof, in its dungeon, on its moat's
  bed —, the harder to come to the more they give (40 to 150 XP, 5 to 25 coins).
  Or `park` — an amusement park on a level ground of grass: an avenue from its gate at the middle of its south side (its −y),
  one across, a walk round; a Ferris wheel, a drop tower and a carousel in three of its quarters, going by themselves for
  everyone; a fair in the fourth — three food stalls, two games, a shooting gallery, café tables —; benches, bins and lamps
  along its avenues, trees round its edge, its rides' bulbs and its stalls lit by night (its `params`: `width` 150–220 and
  `depth` 110–200 m, `seed` 0–9999: its wheel's size and its tower's height, its rides' and stalls' colours). It wants dry
  land that falls 4 m at the most under it: 150 × 130 m is 261 parts, 59 clones and 44 trees, 41,500 triangles at the finest,
  11 lights, and 83 things moving — past a build's *fair* (30) —; 220 × 200 m, with its big coaster, 597 parts, 70,700
  triangles, 12 lights and 95 things moving. Its wheel (40–52 m
  across, 24–32 cabins of glass) and its carousel are ridden; its own drop ring not yet (a drop tower laid by itself is: see *A fair*). A seed makes no prize: its `edition` 2 leaves room for its shooting gallery south of its game stalls, by
  the avenue up its middle — stand a gallery stall of the games there, as a record of the build (*Games with prizes*); its
  `1` stood a booth whose targets were treasures laid by hand.
  Or `garden` — Mossbright Gardens' grounds, the gardening game's (docs/garden-game-plan.md): a lawn, a gate in the middle of
  its south side, a gravel walk round a pond with water lilies; two rows of plots either side of it, each six raised beds of
  soil, a sign and a water butt (each with the `garden` behaviour — its role, plot and bed — for the game: what grows in a bed is each
  player's own records, never the seed's); the seed shop at its west end, the sell stall at its east (a keeper behind each counter, talked to with E), a glass greenhouse in the
  north, a gazebo by the pond, borders of flowers, benches, lamps, trees round its edge (its `params`: `width` 80–140 and
  `depth` 64–110 m, `seed` 0–9999). Played with E by anyone signed in: claim a plot at its sign, sow, water, pick, sell at
  the stall, buy a helper pet and decorations for the plot's corners at the shop, give a seed packet at another's plot; coins come from the stall's owner's signed award (the master account's for a build it lays). Dry land within 3 m of level: 96 × 76 m is 10 plots, 221 parts, 27,300 triangles, 111 plants, 2 lights.
- `at`: where its middle stands in the build's frame — `[x, y]` on the ground there, or `[x, y, z]`; `turn`: degrees
  counter-clockwise from above, as a part's `turn` about z (none: as the build's frame). `key`, optional, as a tree's.
- `edition`: which of its generator's makings it is of — a `city`'s `2` has districts (a historic centre, an extension, a
  modern one, an industrial estate: each its own street furniture and flats); its `3`, urban roads besides (an avenue with
  a planted median and a bike lane through its middle, parking bays along every other street, tree pits, stop lines and
  arrows, a crossing's stripes on every arm of every junction); its `4`, bridges besides (its `bridges`: a footbridge
  up a stair from each pavement, an overpass, a viaduct); its `5`, its street life besides (its `life` 1); its `6`, its green besides (its `life` 2);
  its `7`, as its `6` (the escalators of steps it gave its halls were withdrawn); its `8`, its
  buses besides (its `vehicles`: `buses`, or `none`): two of ours along its avenue, both ways, stopping at its shelters;
  its `9`, what is parked besides (its `vehicles`: `parked`, which has its buses too): in its bays, most of every other
  one, a car of ours and one of the vehicle kind in turn, their lamps off; two taxis on a rank by its square; an ambulance
  or two police cars by its hospital or its police station; an ice cream van by a park; a lorry on each site;
  its `10`, its traffic besides (its `vehicles`: `traffic`, which has the rest too): cars round its blocks, each in
  its lane — a police car and a taxi of ours among those of the vehicle kind —, waiting at its junctions, its buses
  with them, its signals' lamps on a cycle: all of it by the shared clock; its `11`, its heliport besides (its
  `vehicles`: `air`, which has the rest too): a pad and a windsock on its landmark's roof, one of our helicopters kept
  on it and round the city on its tour every few minutes; a pad on its hospital's roof; its `12`, its railway besides
  (its `vehicles`: `rail`, which has the rest too): a station on its viaduct — a platform level with its train's floor, a
  stair and a lift up from the street —, a train of two railcars between its viaduct's ends, calling at it; a lift at each
  end of its footbridge; its `13`, its shops open besides (its `life` 3): cafés, bars and restaurants with their tables,
  shops with what they sell, offices, the word over each way in saying which;
  its `14`, its train made right: track of rails on sleepers along its viaduct's north half (the `track` kind) and a
  train of two coaches one walks into (the `coach` kind) — a cab at each end of the train and a gangway between them,
  their doors sliding open on its platform's side at its station —, its platform as long as its train;
  a `city`'s `15`, its bicycles besides (its `vehicles`: `bikes`, which has the rest too): two of ours between the hoops of
  each of its racks, sat on and ridden;
  its `16`, its homes furnished besides (its `life` 4): every finished building's storeys furnished inside and laid by
  nearness — its flats in rooms, a lobby in every one, its shops —, from farther its shell;
  its `17`, its cars ours: every car in its bays and every car round its blocks one of our own, in a car's palette, two
  alike never side by side (its taxis' rank but), their lamps glowing and lighting nothing; its `18`, a streaming lounge in
  every ground hall it furnishes as a hotel's (its hotels, its public buildings' halls) beside its reception; its `19`, its
  places for adverts besides (its `life` 5): on its columns, its shelters, its shops' fronts, a flat roof a block and its
  square, what they show dealt where they are laid — 26 in the repository's; its `20`, a roundabout in each playground
  besides, the ride kind's, turning slowly, sat on at its edge; its `21`, its train's coaches coupled along its line (the
  route's `behind`), as before where it is straight, bending at their gangways where it curves; its `22`, its shopping
  centre's shops furnished as premises, laid by nearness (its hall's `inside`), with its shops open; its `23`, a call button at
  each landing of its lifts, lit, beside its doorway; its `24`, what is laid on its terraces' café tables (the tableware
  kind's, dealt by its seed and its block, some left bare); its `25`, its lifts' floors shown: over each landing's doorway
  and in each car a display of the floor its car is at and the way it goes, and a plate of the landing's number on its left
  jamb; its `26`, its terraces — on ground that falls across its avenues each avenue level at a height of its own, the
  streets between them climbing, its blocks on their heights, a stair up every step: the land left as it lies (above) —, on
  level ground as its `25` to the bit; its `27`, a land of a region (`lands`, `place`) lays a road from a gate of its own out
  to the port of each side of its parcel — of no region, as its `26` to the bit; its `28`, its palms: along its avenue's
  wide pavements, down its median and round its square a palm in the place of the third of its species, every one of one
  shape, by its ground — a hardy one where it is temperate, one of the shore's by the sea, none on its heights or in the
  snow —, its parks and its other streets its two broadleaves; its `29`, its train on a closed circuit: where it has its
  railway its viaduct goes round the city over its four outer streets — its track over their outer kerb, a quarter of a ring of
  26 m at each corner —, a station on its north side and on its south one (on its west and its east too, on level ground,
  where it is 180 m deep or more), and a train of three coaches of ten metres going round it against the clock, calling at
  each, its doors on the city's side all the way — a round a whole number of minutes; on ground that falls its north and its
  south sides stand level, a viaduct's height over each, and the two between them are graded, six metres clear of what they
  pass; and, a land of a region, its roads joined and composed — each pinned at its port by the port's own ground, a ramp laid
  to its road's start, an outer road ended in a turning circle, its gates to its region first and its sides as `joins` says
  (above) —; asked for no railway and of no region, as its `28` to the bit; none, its first, as a city was first made. Write
  the latest unless a build must stay as it was.
- **Its ground is the planet's own**, the land's edits aside: what it lays stands as its generator lays it there — a
  house's base down past the ground, its street levelled over it. Give it ground its generator takes (a neighbourhood:
  dry, gentle, as far as it covers — 200 × 160 m for the one above) and nothing built where it will stand: it does not
  see what is there. The check (`check.mjs`) writes a build's seeds out and counts what they make — parts, triangles,
  materials, trees —, and says what a generator could not lay and why.
- What a seed lays is laid within 420 m of whoever comes and taken away past 560 m; its houses' doors open and its
  parts are there to change by whoever keeps it, as any build's. To change what it is, change its numbers.

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

A land may name its own adverts' list: `"ads": "https://…/ads.json"` at its top, beside `sky` — `{ "ads": [ { "id", "page": { "html" } or "image", "formats", "weight", "from", "until", "link" } ] }`. Its places for adverts (`billboard`) show those first.

## Ids and changing a build

An export from the editor (deliver.md) gives each object, clone and tree its `id`, and the anchor
`"exact": true`. Keep both when you change it: what comes back with the ids of the person's own
records changes them where they stand — an object's parts as you wrote them — and what has no id is
added. An object left out stays as it is.

