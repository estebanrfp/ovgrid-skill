# 6. Interactivity: vehicles — a car, a motorbike, a boat, a train

An object one sits in and drives. Its owner, sitting on its seat, drives it — W and S throttle and
brake, A and D steer, Space the hand brake, Escape out — and everyone sees it go, with whoever rides
in it; others may sit on its other seats as passengers. A vehicle costs nothing until it is driven:
then 0.07 ms of physics a frame on its driver's peer alone.

## What makes one

- **The object** says what it is: `"vehicle": { "type": "car" }` — `car`, `bike`, `boat` or
  `train` — and its parameters, each held to its range (catalog.json → `vehicles`): a car's
  `power` (N·m, 50–3,000), `speed` (m/s), `steer` (°) and `mass` (kg); a bike's the same; a boat's
  `power`, `speed`, `steer` (its rudder) and `mass`; a train's `speed` and `accel`.
- **A seat**: a part with `"seat": true`, sat on by a click — on its top, facing its +y. The
  driver's where the driver sits; more for passengers.
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
  { "name": "steering wheel", "shape": "torus", "at": [-0.36, 0.26, 1.02], "size": [0.34, 0.34, 0.05], "turn": [70, 0, 0], "material": "synthetic/plastic/plastic-006" },
  { "name": "driver's seat", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.05, "segments": 2, "at": [-0.36, -0.3, 0.75], "size": [0.52, 0.5, 0.14], "material": "fabric/leather/fabric-leather-01", "seat": true },
  { "name": "driver's seat back", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.05, "segments": 2, "at": [-0.36, -0.6, 1], "size": [0.52, 0.12, 0.5], "material": "fabric/leather/fabric-leather-01", "turn": [-12, 0, 0] },
  { "name": "passenger's seat", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.05, "segments": 2, "at": [0.36, -0.3, 0.75], "size": [0.52, 0.5, 0.14], "material": "fabric/leather/fabric-leather-01", "seat": true },
  { "name": "passenger's seat back", "kind": "bevel", "base": "box", "edge": "round", "radius": 0.05, "segments": 2, "at": [0.36, -0.6, 1], "size": [0.52, 0.12, 0.5], "material": "fabric/leather/fabric-leather-01", "turn": [-12, 0, 0] },
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

## Within budget

A car of 25–35 parts (this roadster: 7,100 triangles up close, 2,800 at the next level), a bike of
15–20 (3,700), a boat of 10–15 (3,000), a train of 20–35 — each its object's share of the build's
parts and triangles (budget.md). Rounds cost triangles: two `segments` for a small one. Headlamps
are lights of the build's, lit at night only; two for a car. A pier of eleven sections drawn as
clones: 200 parts, 30,000 triangles. The check says why a vehicle could not be driven: no wheels for
a car or a bike, no route for a train, no seat.

