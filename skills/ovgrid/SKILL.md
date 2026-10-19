---
name: ovgrid
description: Build whole environments in OVGrid, a planet shared peer to peer in the browser, from a description — houses, villages, squares, bridges, paths and fences, forests and clearings, furnished interiors, lights, smoke and fire, doors that open, ferries — as one JSON build the person pastes into the world's editor. Use whenever asked to build, place, furnish, light or animate anything in OVGrid, to survey a place there before building, or to write, fix or change a OVGrid build.
---

# Building environments in OVGrid

OVGrid is a planet in the browser, shared peer to peer, where people build as they did in
Second Life. What is built there is a **recipe**, never a mesh: objects of parts, each a prim shape
or a *kind* (door, roof, stairs, rock…) with a few named parameters in metres and degrees, its faces
dressed from a bank of 2,772 real-size materials, and what it does — its light, its particles
(smoke, fire, steam…), its behaviour (a door that opens, sails that turn), its script; linked clones
of objects; trees as a species and a seed. Every peer meshes the same thing from the same recipe.
You write that recipe as one JSON document; the person brings it into the world, sees it as a
ghost, and places it.

## The walkthrough

1. **Plan.** From the request to a plan: what stands where, how big, the palette, the lights, what
   moves; what to ask; how to fit what is asked within the budget, and saying what you simplified.
   → [plan.md](reference/plan.md)
2. **Place.** Where it goes and what is there. Best: the person's *Survey here* from the world's
   editor (the ground as drawn and what everyone built). Or, from their URL or coordinates:
   `node scripts/survey.mjs "<URL>" --radius 80` — heights, slopes, water, ridges and valleys, a map
   (SVG and PNG) to look at, and the anchor to build on. → [site.md](reference/site.md)
3. **Resources.** The build file, and the official pieces: prim shapes, kinds and their
   parameters, materials by use, species, particles, lights, behaviours — every name in
   `catalog.json`, one entry a line: grep it. → [format.md](reference/format.md)
4. **Quality.** Real proportions, walls cut round their openings, materials at their size;
   composition — the square, the ways, the gardens, the woods, the rooms, the night, the palette.
   If you can run code, write the build with a short program: parts from loops and functions,
   never typed by hundreds. → [method.md](reference/method.md), [composition.md](reference/composition.md)
5. **Budget.** `node scripts/check.mjs build.json` checks it as the world will: unknown names,
   objects past 256 parts and anything past the budget's *most* are errors; past *fair*, notes;
   `--survey site.json` counts what already stands round it. → [budget.md](reference/budget.md)
6. **Interactivity.** Particles, lights at night, behaviours (doors, slides, spins, lifts,
   ferries), scripts for what no property can say, games to come; vehicles people drive — cars,
   motorbikes, boats, trains. The panel first, code last. → [effects.md](reference/effects.md),
   [vehicles.md](reference/vehicles.md)
7. **Delivery.** The survey's anchor, the JSON the person pastes, drops or fetches by its address
   (a gist), a ghost to confirm, an export to change it by. → [deliver.md](reference/deliver.md)
8. **Verification.** Have it looked at — from where people arrive, inside, at night — and fix what
   is wrong. → [verify.md](reference/verify.md)

The scripts run with Node 18+ or Bun, nothing to install: `scripts/survey.mjs` carries the planet's
own terrain function; `scripts/check.mjs` the world's own checks and this skill's `catalog.json`.

## Rules that always hold

- **Metres and degrees.** The build's frame: x right, y ahead (the anchor's `heading`), z up, z = 0
  the ground under the anchor. A turn `[x, y, z]` is degrees about x, then y, then z;
  z is counter-clockwise from above (90 turns +y to −x).
- **A building's front is its +y**; doors' and windows' own fronts are their **−y**: turn them
  `[0, 0, 180]` in a wall facing +y, `90` facing +x, `−90` facing −x, `0` facing −y. Stairs rise
  towards their +y. A roof's ridge runs along its x. A fence's length is its x.
- **Stand everything on the ground.** The ground is not flat: survey it, set each object's z from
  it, and run footings down past the lowest ground under them. Nothing floats, nothing sinks
  unseen.
- **Human scale, opened up for the camera.** The avatar is 1.8 m, 0.6 m wide, steps 0.3 m at
  most, and its camera follows 4 m behind: doors ≥ 1.0 × 2.2 m, rooms ≥ 4 m across, ceilings ≥
  2.8 m, risers ≤ 0.2 m. Real sizes outside.
- **Materials at their real size**, one or two a role across a build: name a bank id
  (`masonry/brick/red-brick`) from `catalog.json` and leave `scale` out.
- **What repeats is cloned.** One object, then `clones` of it: a clone costs a transform.
- **Lights are few and short.** Ranges of 10 m at most, 5–8 m usually; no more than 8 lights
  within 30 m of one another — fires count; outdoors `on: "night"`; a lamp inside a house is a part
  of the house's object, whose walls stop its light.
- **The panel first, code last.** A property — light, particles, behaviour — before any script.
- **Within the budget, and say what you simplified.** The editor refuses a build past its *most*.

The quality of what you build comes from three things: the bank's materials, these rules, and
looking at it until it is right. The detail is the person's to ask for: a plan in a line gets a
sound, plain build; a page of detail gets that detail, within the budget.

## Files

| | |
|---|---|
| [reference/plan.md](reference/plan.md) | 1 — from a request to a plan; fitting it to the budget; saying what was simplified |
| [reference/site.md](reference/site.md) | 2 — URLs and coordinates, the survey and its map, reading the ground, standing on it, terraces, ways, bridges, views, what is there |
| [reference/format.md](reference/format.md) | 3 — the build file: anchor, prims, shapes, kinds, materials by use, surface, light, collisions, behaviours, objects, clones, trees, ids |
| [reference/method.md](reference/method.md) | 4 — the frame, scale and proportions, walls with openings, a cottage as JSON |
| [reference/composition.md](reference/composition.md) | 4 — villages, squares, ways, fences, forests and clearings, interiors, night, palettes, mistakes |
| [reference/budget.md](reference/budget.md) | 5 — what one build and one place may bring (fair, most), what costs what, what was measured |
| [reference/effects.md](reference/effects.md) | 6 — particles, lights at night, behaviours, vehicles, scripts, games |
| [reference/vehicles.md](reference/vehicles.md) | 6 — vehicles: a car, a motorbike, a boat, a train — their look (rounded bodies, paint, chrome, rims, headlamps), wheels, seats, power, a pier out to deep water; each an example |
| [reference/deliver.md](reference/deliver.md) | 7 — the JSON, the anchor, Builds as JSON, the ghost, export and change, sharing |
| [reference/verify.md](reference/verify.md) | 8 — what to look for |
| `catalog.json` | Prim presets (faces, size axes, triangles); every kind's, behaviour's and particle preset's parameters; the bank, one material a line (id, name, uses, size, colour, metal, look, tags); 31 tree species with their six variants |
| `scripts/survey.mjs` | The ground round a place, from a URL, coordinates or a survey: JSON, SVG, PNG; `--profile` along lines |
| `scripts/check.mjs` | A build checked as the world checks it, against the budget; `--survey` with what stands round it |
