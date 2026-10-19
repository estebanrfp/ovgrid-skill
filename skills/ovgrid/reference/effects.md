# 6. Interactivity: what makes a place alive

Smoke from the chimneys, a fire in the square, lamps at night, doors that open, sails that turn, a
ferry, a lock only its owner opens. Every effect is part of the build file, checked by every peer,
played out the same for everyone from the record and the clock — whether its owner is there or
not — and drawn within the frame's budget (budget.md).

## The panel first, code last

1. **A property** — `light`, `particles`, `behaviour`, a face's `emissive` and `glow` — is what the
   card sets and what a build writes. No code, nothing on the network once written, nothing that
   stops when its owner leaves; it costs only its drawing. Reach for it first.
2. **A script** only for what no property can say: a condition (a key, a lock, who may open), a
   sequence (a bell that rings, then stops), a reaction to something other than a click or the
   night, a state that is kept (a switch, a counter).

## Particles

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

## Light at night

- **Lamps** (`light`, format.md): warm (`[1, 0.72, 0.42]`), `on: "night"`, ranges of 5–8 m; one
  for each room that is lived in, a part of its house's object (its walls then stop the light, its
  windows let it out); street lamps along the ways and round the square, every 12–20 m, one lamp
  object cloned.
- **Fires are lights**: an inn's hearth can be its only lamp; a campfire lights a square.
- **What only glows**: `light: { "range": 0 }` — a lantern for looks, embers — lights nothing and
  costs nothing.
- **Every house lived in has its lamp**, and every chimney over a burning hearth its smoke: a dark
  house — a lamp `on: false`, a cold hearth, no smoke — is for a story that asks for one.

## Behaviours

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

## Vehicles and routes

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

## Scripts

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

## Games

Minigames — a race, a puzzle, a ball game — will run as **native WebAssembly modules** (built from
AssemblyScript, Rust, C or Zig, at most 1 MB, carried peer to peer by their hash) on the same API
as scripts, with a game's own input, ticks and players, arriving with the first minigame. Until
then, keep games to what scripts and behaviours can do: a gate that opens, a bell, a counter kept.

## How many, and where

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
