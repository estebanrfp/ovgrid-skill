# 6. Interactivity: vehicles — a car, a motorbike, a bicycle, a boat, a ship or yacht, a submarine, a helicopter, a plane, a train

An object one sits in and drives. Its owner, sitting on its seat, drives it — W and S throttle and
brake, A and D steer, Space the hand brake, Escape out — and everyone sees it go, with whoever rides
in it; others may sit on its other seats as passengers. A vehicle costs nothing until it is driven:
then 0.07 ms of physics a frame on its driver's peer alone.

## What makes one

- **The object** says what it is: `"vehicle": { "type": "car" }` — `car`, `bike`, `bicycle`, `boat`, `ship`,
  `submarine`, `helicopter`, `plane` or `train` — and its parameters, each held to its range (catalog.json →
  `vehicles`): a car's `power` (N·m, 50–3,000), `speed` (m/s), `steer` (°) and `mass` (kg), and if it says so its `grip`
  (×, 0.4–3: how hard its tyres hold the ground) and its `drive` (`all`, `front` or `rear`: the wheels its engine turns) —
  left out, 2 and all —, its `brake`, `suspension`, `travel` and `steering` (each, and what it does to the feel, with the
  values for each kind of car: «A car's handling»); a bike's the
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

## What makes it look like one

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

## Its colours

Whoever may change a vehicle chooses its colours on its card's **Colours** tab — a row of swatches for each of them, a
colour of one's own for a paint, and **Random**, one of the palettes whole, colours that go together —, each choice one
step that everyone sees. Its **Finish** row is its paint's shine — Gloss, Satin or Matte, `"finish": "gloss"` in its
`looks` —, worn by the faces that wear its paint, its roof and its accent alone, never its glass, its rims or its lamps;
said nothing, gloss (gloss 0.9, metal 0.5, reflect 0.3), as a car's paint is made. Random gives a finish too, gloss the
most often; a livery's colours are its own, and it has no finish to change. A build gives it the slots it lets change, `looks` on its object, each a colour (linear RGB) or
a material of the bank; its parts and faces that wear one name it, `"slot"` in their surface (what of a car's object and
parts a slot needs, its shapes left out):

```jsonc
{ "name": "car", "vehicle": { "type": "car", "power": 700 },
  "looks": { "paint": [0.565, 0.019, 0.012], "roof": [0.565, 0.019, 0.012], "interior": "fabric/cloth/poly-wool-herringbone",
             "carpet": "fabric/carpet/carpet-004", "rims": "metal/bare/metal-061b" },
  "prims": [
    { "name": "body", "color": [0.565, 0.019, 0.012], "surface": { "gloss": 0.9, "metal": 0.5, "reflect": 0.3, "slot": "paint",
      "faces": { "1": { "texture": "fabric/carpet/carpet-004", "slot": "carpet" }, "3": { "color": [0.565, 0.019, 0.012], "slot": "roof" } } } },
    { "name": "seats", "material": "fabric/cloth/poly-wool-herringbone", "surface": { "slot": "interior" } },
    { "name": "tyre and rim", "material": "synthetic/rubber/rubber-001", "surface": { "faces": { "1": { "texture": "metal/bare/metal-061b", "slot": "rims" } } } }
  ] }
```

- **The slots:** `paint`; `roof`, a second tone (a closed car's glasshouse, its pillars and its roof, a colour index of
  its own — a paint chosen takes a roof of its own tone with it); `accent` (stripes, a trailer's box); `interior` (its
  seats; a bicycle's saddle and grips); `carpet` (its floor and its doors' insides); `rims`.
- **What a slot does:** a colour in place of the texture where it is named, or a material in place of the colour. A
  face takes its part's texture where it has none of its own, so a slot on a face of a textured part — a rim on a
  tyre's rubber — is given materials (metals for rims), not colours.
- **As it is made:** the parts' own colours and materials are the `looks` it starts with, so that it looks the same
  without them; a slot its object leaves out leaves them as they are. A livery — a taxi's, a police car's, an
  ambulance's, a fire engine's — keeps its paint out of `looks`: Random and the swatches change its seats, floor and rims
  alone.
- **The palettes**: a car's, seventeen; a bicycle's, eight. Their seats are the bank's
  leathers, cloth and vinyl (`fabric/leather/leather-009` black, `fabric/upholstery/leather-padded-001` black padded,
  `fabric/leather/leather-035b` tan, `fabric/leather/leather-036b` red, `fabric/leather/leather-018` cream,
  `fabric/leather/brown-leather`, `fabric/upholstery/vinyl-padded-001` navy, `fabric/cloth/poly-wool-herringbone`),
  their floors its carpets, their rims its metals, each worn at its own size: no `scale` on them.
- **By hand:** a part's colour or material chosen on its own card lets its slot go there, so that the vehicle's looks
  no longer dress over it.

## Room for the avatar

A vehicle people sit in is built round the body that sits there: the avatar, 1.8 m tall, measured in each seat's pose over
the pose's whole loop, about its hips — where a sit target puts them —, x its left, y ahead, z up, in metres:

| Pose | Its soles | Its seat | The top of its head | Its back | Out to a side | Ahead, at most |
|---|---|---|---|---|---|---|
| `quaternius/driving` | −0.57 | −0.18 | +0.91 | −0.21 | 0.28 | its knees 0.51 under the hips, its hands 0.43 at its shoulders; its grips (±0.135, 0.36, 0.34) |
| `dcl/sitting-chair-1` | −0.65 | −0.21 | +0.92 | −0.16 | 0.33 | 0.60 under the hips (a foot crossed), 0.42 over them |
| `quaternius/sitting-talking` | −0.56 | −0.18 | +0.89 | −0.15 | 0.34 | its hands 0.61 as it talks |

So, seat by seat:

- **Its floor** under the soles: the hips 0.58 m over it at the wheel, 0.66 m on a chair. **Its cushion's top** a little
  over the seat's figure — 3 cm into the cushion —, **its back** behind the body's.
- **Its roof**, inside, 0.95 m or more over the hips: 1.52 m clear over the floor at the wheel, 1.58 m on a chair.
- **Across**, 0.33 m from each seat's middle to the inside of the side, at its shoulders' height (+0.45 m) and at its
  head's — a glasshouse drawn in as it rises leaves less room up there —, and seats' middles 0.66 m apart or more.
- **Ahead of the driver**: the dashboard's face 0.55 m from the hips, its underside 0.05 m over them (the knees go under
  it), the footwell 0.70 m long; the steering wheel through the grips — its middle 0.33 m ahead of the hips and 0.27 m over
  them, its rim 0.31 m across, tilted 25° from upright towards the driver (`"turn": [65, 0, 0]` on a part whose z is its
  column), its column into the dashboard.
- **Rows** 0.95 m or more apart: the seat ahead's back clear of a passenger's knees and hands.

A real car is too small for it — a saloon of 1.45 m has no 1.52 m inside —: build cars ×1.2–1.4 a real one's, all of it
alike. Low-poly packs often are so already: measure the model, and keep its scale where the room fits. One under the room
is grown — never shrunk —, all of it, just enough (×1.5 at most, plan.md); a low sports car may instead take its floor down
to its body's bottom.

## Its places

A seat with a target may hold places besides its own, `places`: where other hips go, in the same frame as its `at`, each
turned and posed as it is, 64 at most. A bench is one part with a place for each body on it, a coach's rows one part with a
place for each seat. A click sits one in the free place nearest where it touched; all of them taken, in the vehicle's free
place nearest that; none free, nowhere — its hint says Full. Give each door a seat of its own, so that a click on it sits
one there, and the interior's seat the rest; seats' middles 0.66 m apart, as the room above asks.

A vehicle one walks in — a coach — is walked into as a helicopter is: its hull's parts `"behaviour": { "type": "passage",
"way": "in", "x": 0, "y": 4.8, "z": 1.55 }`, where one stands in it (its aisle, on its floor), and its way in a door with
`"way": "both"`, out from inside across its thinnest side. What it collides and drives as, collision only, is slabs round its
cabin, each convex — the block under its floor, its sides, its ends, its roof, 8 cm thick and into one another —, not its
solid outline, and its seats are solid (no `phantom`), so that one walks its aisle between them and stands up there.

```jsonc
// A bench for three across a van's box: one part, three places.
{ "name": "rear bench", "shape": "cube", "at": [0, -2, 0.9], "size": [2, 0.5, 0.4],
  "seat": { "at": [0.66, 0, 0.38], "turn": 0, "pose": "dcl/sitting-chair-1", "places": [[0, 0, 0.38], [-0.66, 0, 0.38]] } }
```

## A car

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

## A closed car

A car with a roof and its windows' glass, its driver and passengers seen through them. Rethink it from its form (a model
measured, SKILL.md), every seat by its room (above):

- **In by its doors.** Each door is one part — its panel, its window's glass, its handle — and the seat behind it: `"seat":
  { "at": [the hips, from the door's middle], "turn": 0, "pose": … }`, the driver's `quaternius/driving`, its passengers' a
  chair's. A click on the driver's door sits one at the wheel (Drive), on another in its place (Ride); up — E, Esc —, one
  stands beside that door, outside the car. A seat behind glass is never clicked: the glass is in the way.
- **Its body one carved solid**: its lower body and its glasshouse, two hulls joined (`keep` the first, `add` the second);
  its cabin cut 2 cm inside its skin; its windscreen, rear window and side windows cut between their pillars (an opening
  drawn out of the skin and in, a hull of its outline); its doors' openings, a few millimetres larger than their panels (the
  shut lines); its wheel arches, one cylinder round an axle mirrored and repeated; its grille sunk in.
- **Glass within the skin**: 8 mm thick, 4 mm in from its outside, its edges 1 cm into the skin round its opening; a door's
  window in the door's part, so that a click on it is a click on the door.
- **What it drives as**: a hollow body is no part of what moves (only convex pieces move with a vehicle), so everything drawn
  is `phantom`, and one `collisionOnly` solid of its two hulls side by side is what it collides as, driven and parked.
- **Lights**: one light for its headlamps, between them, a little in front of its nose — its own body would stop a light
  inside it —, on a part turned `[90, 0, 0]` so that its cone shines ahead; its rear lamps glow by night with `"range": 0`.
  A car park of cars keeps within its lights so.
- **Wheels with spokes**: what it runs on a plain cylinder across it, `collisionOnly` — the wheel the vehicle finds and Jolt
  drives —, and drawn round it, `phantom`, turning with it as what lies within a wheel does, its tyre and rim one carved
  solid: its tyre faceted, its dish sunk into its outer face, windows cut between its spokes, its hub; its outer face its
  own +z, turned out on either side. 276 triangles at every distance; a bevelled cylinder rounded in two steps
  (`"segments": 2`, 288 near, fewer far) where no spokes show.
- **Its handling**: below, «A car's handling».

Some 20 parts and 2,700 triangles near: a saloon of the pack rethought so is 19 parts (each wheel two), 2,724 triangles
drawn near and 2,540 at 40 m.

## A car's handling

One way of driving for every car — W and S throttle and brake, A and D steer, Space its hand brake — and its numbers make
it what it is, each held to its range, its default where it is left out (all but `power`, `speed`, `steer` and `mass` may
be). **Its steering holds itself**: its wheels turn all the way while it is slow and, faster, only as far as its tyres hold
at its speed — 85 % of it, tan δ = L · a / v², L its wheelbase and a what its `grip` holds across —, as in a driving game;
or, where it would go over first, as far as keeps it on its wheels — a then its track over twice its centre of mass's
height, 85 % of it again: a van, an ambulance, a bus, whose centre of mass stands high over a narrow track, turn wider at speed
than they could grip, and stay upright. So no lock is set by hand for a speed: `steer` is how tight it turns while slow,
parking; how tight it turns at speed is its `grip`, or its height.

| Parameter | Range | Default | What it does to the feel |
|---|---|---|---|
| `power` | 50–3,000 N·m | 500 | its engine's torque: how hard it gets going and climbs |
| `speed` | 2–60 m/s | 25 | its top speed |
| `steer` | 5–45 ° | 30 | its wheels' full lock: how tight it turns while slow |
| `mass` | 50–5,000 kg | 1,000 | how heavy: slower to get going and to stop, steadier |
| `grip` | 0.4–3 × | 2 | how hard its tyres hold: 2 as dry asphalt (the world's ground met at 0.98 of friction), 1 as snow (0.49), 0.4 as ice; at speed it turns as tight as its grip lets it |
| `drive` | `all` / `front` / `rear` | `all` | the wheels its engine turns: `rear` holds best in a turn, its tail stepping out only when powered hard; `front` runs wide and, at the limit, spins |
| `brake` | 0.25–3 × | 1 | how hard it brakes: 1 holds each wheel with 1,500 N·m, a family car's — its grip then stops it —; a heavy one wants about mass × wheel radius / (160 × its wheels), or it takes long to stop |
| `suspension` | 0.8–4 Hz | 1.5 | its springs: low, soft and swaying over bumps; high, firm and flat in a turn |
| `travel` | 0.1–1 m | 0.3 | how far its wheels go up and down: long for rough ground and jumps, short for a low car |
| `steering` | `front` / `rear` / `all` | `front` | the wheels that steer: `rear` as a forklift's; `all`, its back ones the other way, turning half as wide while slow. Each axle steers as far as turns the car about one point, so a truck's tandem, or a six-axled one's every axle, steers a little and none scrubs |

Given its `suspension` or its `travel`, its wheels rest where they were built, its springs pressed by its load. Typical
values for the kinds a collection of cars holds — each a start, tuned when its car is built (the family car's are measured:
at full lock at its top speed it goes 2.5° off where it heads, powering out of a turn 5°):

| Kind | `power` | `speed` | `steer` | `mass` | `grip` | `drive` | `brake` | `suspension` | `travel` | `steering` |
|---|---|---|---|---|---|---|---|---|---|---|
| Family car (saloon, hatchback) | 700 | 26 | 32 | 1,400 | 2 | `rear` | 1 | 1.5 | 0.3 | `front` |
| Taxi | 700 | 25 | 34 | 1,450 | 2 | `rear` | 1 | 1.5 | 0.3 | `front` |
| Sports car | 1,100 | 40 | 30 | 1,200 | 2.4 | `rear` | 1.4 | 2.4 | 0.2 | `front` |
| Muscle car | 1,400 | 36 | 30 | 1,600 | 1.8 | `rear` | 1.2 | 1.8 | 0.25 | `front` |
| SUV | 1,000 | 28 | 32 | 2,000 | 2 | `all` | 1.3 | 1.3 | 0.35 | `front` |
| Pickup | 1,100 | 27 | 32 | 2,200 | 1.9 | `all` | 1.4 | 1.2 | 0.4 | `front` |
| Van | 900 | 24 | 34 | 2,400 | 2 | `rear` | 1.5 | 1.3 | 0.3 | `front` |
| Ambulance | 1,000 | 26 | 34 | 2,800 | 2 | `rear` | 1.7 | 1.4 | 0.3 | `front` |
| Limousine | 1,000 | 22 | 30 | 2,800 | 2 | `all` | 1.7 | 1.2 | 0.3 | `front` |
| Bus | 2,600 | 20 | 34 | 5,000 | 2 | `rear` | 3 | 1.2 | 0.25 | `front` |
| Truck | 2,600 | 22 | 32 | 5,000 | 2 | `rear` | 2 | 1.2 | 0.3 | `front` |
| Truck with trailer (one rigid body) | 3,000 | 20 | 30 | 5,000 | 2 | `rear` | 1.2 | 1.1 | 0.3 | `all` |
| Monster truck | 2,400 | 24 | 30 | 3,500 | 2.2 | `all` | 3 | 0.9 | 0.8 | `all` |

The other vehicles' numbers, each held to its range, its default where it is left out (what each does: «What makes one»):

| Vehicle | Parameter | Range | Default |
|---|---|---|---|
| bike | `power` | 10–600 N·m | 150 |
| bike | `speed` | 2–70 m/s | 30 |
| bike | `steer` | 5–45 ° | 30 |
| bike | `mass` | 50–5,000 kg | 250 |
| bicycle | `power` | 5–200 N·m | 45 |
| bicycle | `speed` | 1–20 m/s | 8 |
| bicycle | `steer` | 5–45 ° | 8 |
| bicycle | `mass` | 50–5,000 kg | 90 |
| bicycle | `gear` | 1–5 | 2.8 |
| boat | `power` | 50–5,000 | 600 |
| boat | `speed` | 1–30 m/s | 8 |
| boat | `steer` | 5–45 ° | 30 |
| boat | `mass` | 50–5,000 kg | 800 |
| ship | `speed` | 1–25 m/s | 10 |
| ship | `accel` | 0.05–3 m/s² | 0.5 |
| ship | `turn` | 1–30 °/s | 6 |
| ship | `thrusters` | 0–10 °/s | 2 |
| submarine | `speed` | 1–25 m/s | 6 |
| submarine | `accel` | 0.05–3 m/s² | 0.6 |
| submarine | `turn` | 1–30 °/s | 8 |
| submarine | `thrusters` | 0–10 °/s | 3 |
| submarine | `dive` | 0.2–5 m/s | 1 |
| submarine | `depth` | 2–500 m | 60 |
| helicopter | `speed` | 2–80 m/s | 25 |
| helicopter | `accel` | 0.5–10 m/s² | 3 |
| helicopter | `turn` | 5–120 °/s | 45 |
| helicopter | `climb` | 0.5–20 m/s | 5 |
| helicopter | `ceiling` | 10–3,000 m | 500 |
| plane | `speed` | 20–300 m/s | 80 |
| plane | `accel` | 0.5–15 m/s² | 4 |
| plane | `lift` | 10–120 m/s | 40 |
| plane | `turn` | 3–60 °/s | 15 |
| plane | `climb` | 1–50 m/s | 10 |
| plane | `ceiling` | 100–15,000 m | 3,000 |
| train | `speed` | 1–60 m/s | 20 |
| train | `accel` | 0.1–3 m/s² | 0.8 |

## A car's round

A car drives itself too, on its object's route — a coach round its car park, a shuttle: give the object
`"behaviour": { "type": "route", "name": "Round the car park", "mode": "round", "points": [[0, 4, 0], …], "speed": 5,
"accel": 1, "stop": 5, "at": "ends", "face": "yes", "held": true }` — its points in its own frame, a point every few metres
along the way, round and back into where it is kept, its turns as wide as its length asks (a coach's 11–12 m) and clear of
whatever stands near —, held where it is kept till its Auto is set on. It goes on the land under it wherever it is kept,
read as it goes, standing on it by its wheels — its nose up a rise, its side down across a slope: its points' z are not
its heights, so the same car on other land runs the same round over it. Aimed at its
seat at the wheel, O is its Auto for whoever may drive it: its whole way is read first, and over water or land steeper than
35 % it does not set off (its hint says so); else it runs its route once and is off again where it is kept, its wheels
turning as it goes, whoever is in it carried; sat at its wheel, one takes it from where it has got to. Its driver may record
a route as he drives it, K at its wheel, as a helicopter's pilot does.

## A motorbike

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

## A bicycle

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

## A boat

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

## A ship or a yacht

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

## A submarine

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
opaque decks and walls inside them; its tour a `route` whose points' z is its depth, `"water": "no"`
— 0 afloat, negative under the sea; over 0 it stays afloat: its route never takes it over the sea —,
its depth read all along it for its keel. Its inside is the box round its largest parts: make its hull
and its dome the largest — nothing else a quarter of either as a box —, and the fish keep out of it and
the air in it is all of it; close its top with its deck, but where its tower goes up through its sail:
up out of its inside the air goes on, no sea's surface seen up its lift's shaft. Light it inside with
lamps `"on": true`: no sun comes into the air under the sea, only the water's light round it, so its
lamps are its light.

## A helicopter

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

## A plane

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

## A boat that takes people round

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

## A train

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

## Within budget

A car of 25–35 parts (this roadster: 7,100 triangles up close, 2,800 at the next level), a bike of
15–20 (3,700), a bicycle of about 50 (12,000: its tyres the most), a boat of 10–15 (3,000), a train of 20–35 — each its object's share of the build's
parts and triangles (budget.md). Rounds cost triangles: two `segments` for a small one. Headlamps
are lights of the build's, lit at night only; two for a car. A pier of eleven sections drawn as
clones: 200 parts, 30,000 triangles. The check says why a vehicle could not be driven: no wheels for
a car or a bike, no route for a train, no seat; a bicycle with no crank, or a saddle nobody pedals.

