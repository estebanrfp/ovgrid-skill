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
- **As it pushes**: `"thrust": "ahead"` on such a layer throws it longer and stronger the faster its vehicle goes along
  its own +y, `"up"` the faster it goes up or down its own z; a third of itself while it does not — a starship's main
  engines and its lift engines (vehicles.md, A starship).
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

## Light at night

- **Lamps** (`light`, format.md): warm (`[1, 0.72, 0.42]`), `on: "night"`, ranges of 5–8 m; one
  for each room that is lived in, a part of its house's object (its walls then stop the light, its
  windows let it out); street lamps along the ways and round the square, near enough for their pools
  to touch (below), one lamp object cloned.
- **A lamp shines from where it glows**: a part's light comes from the middle of its glowing faces — a street lamp's
  from its lantern, a floor lamp's from its shade, a screen's from its face —; a light of its own on a part that glows
  nowhere, from the part's middle. A street lamp of the street kind — a `lamp`, an `arm` or a `double`, its lantern's face 2
  given `"emissive": 0.9` and the part `"light": { "on": "night", "range": 0 }`, no `zone` and no `cycle` (format.md, *What
  stands in a street*) — lights the ground by night on its own: warm, down from its lantern, 10 m from it at the most — the
  twelve nearest the eye, the rest glowing —, and is none of the lights a build is held to. By its style its lantern is
  5.4–5.9 m up on a 6 m `lamp`, 6.9–7.7 m at the end of an 8 m `arm` and 7.9–8.7 m over a 9 m `double`'s post (one light for
  both its heads), so its pool on level ground is 8.1–8.4, 6.3–7.2 and 4.9–6.1 m round: pools touch where `lamp`s stand
  16 m apart at the most, `arm`s 12.5 and `double`s 9.5. At their edges the light has faded to nothing: stand them nearer for
  a way lit all along. Given a `range` of its own instead (up to 10), it is a light of the build's as any other — counted
  among them, lit as its `on` says, with no cone but one it is given.
- **Fires are lights**: an inn's hearth can be its only lamp; a campfire lights a square.
- **What only glows**: `light: { "range": 0 }` — a lantern for looks, embers — lights nothing and
  costs nothing; but a street kind's `lamp`, `arm` or `double` `"on": "night"` lights the ground as well (above).
- **On a cycle**: `"cycle": [every, from, to]` (seconds) in a part's `light` — it is on only from
  `from` to `to` of every `every` seconds of the clock every peer shares, its glow with it, and off the
  rest: a traffic signal's lamp, a beacon, a barrier's lamp that blinks (`[1.2, 0, 0.6]`). `to` before
  `from`, on across its cycle's turn. With `"on": true` by day as by night; with `"on": "night"`, by
  night alone. Nothing is sent of it: every peer works it out. A signal is three such parts —
  `{ "shape": "cube", "size": [0.2, 0.016, 0.2], "color": [0.1, 1, 0.35], "surface": { "emissive": 1,
  "glow": 0.4 }, "light": { "on": true, "range": 0, "cycle": [32, 0, 5] } }` its green.
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
| `bounce` | a ball, a toy, a sign that jumps | `{ "type": "bounce", "height": 0.6 }`: up along its own z and back as a ball falls, over and over; whoever stands on it goes with it |
| `move` | an elevator, a lift bridge, a ferry, a moving platform | an object, `{ "type": "move", "z": 3.2, "speed": 1.5, "wait": 4 }` — its own axes, there and back |
| `lift` | a lift between floors that waits to be called: in a house, a tower, a vessel | its platform, rails and buttons, parts of one object, each `{ "type": "lift", "stops": [-3.8, -7], "group": "lift", "button": "none" }` — a floor's button `"button": "stop", "stop": 1` —, a `call` button at each stop; its floors shown, parts of the `lift` kind (format.md): over each call button a `display` with `"button": "none"` and its `"landing"` — the stop it stands at, 0 where it is kept —, a `plate` with its `label`, a `display` that goes with it on its post, its buttons one `panel` (`"button": "panel"`: a click on it to the stop of the button it falls on); with doors: each leaf `"door": 0.85` (how far it slides open along its own x) and, a landing's, `"landing": 1, "button": "stop", "stop": 1` — it stays there, opens while the lift stands there and calls it on a click (a `building` has all of this by itself) |
| `belt` | a conveyor, an escalator, a moving walkway | `{ "type": "belt", "speed": 0.6 }` carries along its own y; stairs rise along their y: a flight of the stairs kind given it carries one up it (or down it, below 0) a step at a time, a box pitched along its slope smoothly |
| `passage` | in and out of a vehicle — or anything closed — by a click, standing | its hull's parts `{ "type": "passage", "way": "in", "x": 0.6, "y": 3, "z": 1.6 }` (its floor inside, in its object's frame), its door's `"way": "both"` with the same place: a click on its door from inside puts one out past it |
| `route` | a tour boat, a train, a cart on its round | an object, `{ "type": "route", "points": [[0, 40, 0], [30, 60, 0], [60, 20, 0]], "speed": 3, "stop": 10 }` — through its points and on again (`"mode": "back"`: there and back — a train tail first, its front kept; anything else turned round at each end), turning to where it goes, stopping at each (`"at": "ends"`: only where it is kept) |
| a chairlift | a ski slope's lift | its stations, pylons and cable standing still; each chair an object on a `route` round the cable's loop — every one the same points and speed, set off a share of its round apart (`since`, ms), so they keep their spacing —, `phantom`, its seat sat on two abreast and carried; round each bullwheel its points gone through along handles, as a circle's quarters are drawn |

- **What people ride carries them**: a behaviour on an object carries the avatar standing on it, and so
  does a part moving inside its object — a lift's platform in a building or a vessel, as it goes.
- Slow is believable: sails 6–15 °/s, a water wheel 20–40 °/s, an elevator 1–2 m/s.
- Everything moves the same on every peer from the clock: no two players see a different ferry.

## Vehicles and routes

Cars, motorbikes, boats, trains, helicopters, planes and a starship people drive: vehicles.md — a starship goes to
space, across the planet and back on its own (vehicles.md, A starship). What carries people by itself is an
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
away, turning to face its way (`"face": "yes"`). Or at the points it **calls** at:
`"calls": [2, 5, [7, 20]]` — its points' numbers (1 its first), each a stop as long as `stop` says,
or `[n, seconds]` that long; it then goes through its other points and stops besides only where it
is kept: a bus at its shelters, with points between them that shape its way — its waits to the
millisecond. **By a timetable**: `"every": 600` — its round takes that many seconds exactly, what is
left of it waited out where it is kept: a train every ten minutes, a car written to find its signals
green. Say it for whatever must keep time with something else on the shared clock: a round of
95.83 s is anywhere on that clock by now, one of 96 s where it was written to be. A boat takes
`"water": "yes"`: it keeps its height over the sea wherever its points are. It carries whoever stands
on it, as `move` does.

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
| `on(event, handler, options?)` | `'click'` `({ who, face, target, uv, values })` — who clicked (an address, lower case; null if not signed in), on a page the `id` of the element it fell on, where on the page (across and down, 0–1) and its fields as the clicker had them (by `id`, a box's or a radio's by its `name`); `'near'`, `'away'` `({ who, count })` — someone within `options.radius` m (0.5–32, 5 unless said), and gone; `'day'`, `'night'` — the sun crossing the horizon where it stands, once at start as it is; `'change'` `(props)` — what is kept of it changed |
| `every(seconds, handler)`, `after(seconds, handler)`, `cancel(id)` | timers on the shared clock (0.1 s at least) |
| `set(props)` | what it shows, here and now, over what is kept: every peer running it shows the same; nothing written |
| `keep(props)` | the same, kept: written by its owner's peer, signed, for everyone — at most once a second |
| `get()` | its properties as shown |
| `touch()` | opens or shuts what opens on a click (its door or slide, or its object's), as a click would |
| `award(who, points, reason, match, score)` | gives `who` (a click's `who`) points (XP), once per call: signed on its owner's peer alone, and counted only if its owner is OVGrid's master account or an issuer it certified — a bell rung, a race won. Its match (`startMatch`'s; none, the hour's) gives one player at most 50 XP, and a match begun within 5 min of the last gives nothing; `score` is shown as their best in the Profile |
| `startMatch(name)` | a match's id, to give `award`: one round of the script's game |
| `hasUnlock(id)` | whether the player of the peer running it has an unlock (a level's title, one bought with coins): what each peer shows its own player |
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
