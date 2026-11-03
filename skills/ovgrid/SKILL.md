---
name: ovgrid
description: Build whole environments in OVGrid, a planet shared peer to peer in the browser, from a description — houses, villages, squares, bridges, paths and fences, forests and clearings, furnished interiors, lights, smoke and fire, doors that open, ferries — as one JSON build the person pastes into the world's editor. Use whenever asked to build, place, furnish, light or animate anything in OVGrid, to survey a place there before building, or to write, fix or change an OVGrid build.
---

# Building environments in OVGrid

OVGrid is a planet in the browser, shared peer to peer, where people build as they did in
Second Life. What is built there is a **recipe**, never a mesh: objects of parts, each a prim shape
or a *kind* (door, roof, stairs, rock…) with a few named parameters in metres and degrees, its faces
dressed from a bank of 3,091 real-size materials, and what it does — its light, its particles
(smoke, fire, steam…), its behaviour (a door that opens, sails that turn), its script; linked clones
of objects; trees as a species and a seed. Every peer meshes the same thing from the same recipe.
You write that recipe as one JSON document, anchored at the coordinate the person gives you and
fitted to a survey of the place; the person brings it into the world — pasted or dropped into the
editor's *Builds as JSON*, or opened with `?import=` and its address — sees it as a ghost where
it will stand, confirms it with a click, and can export it again for the next round.

## The avatar is your ruler

Everything in OVGrid is built to the size of the person who walks it. The avatar is **1.8 m tall and 0.6 m
wide**, steps up **0.3 m**, walks slopes to **50°**, touches or clicks what is within **5 m**, makes a `door`
open when it comes within **2.5 m**, and its camera follows **4 m behind and 1.4 m up**. Before you write any
size — a door, a bridge, a bench, a lamp, a fence, a stair, a room, a boat's deck, a tree's first branch — hold
it against the avatar: can this person walk through it, stand under it, step on it, reach it, sit on it, see it
from where the camera is? What is walked, climbed or used is sized for them, at real size outdoors and a third
larger where the camera must get in; what is only looked at can be any size.
→ [method.md](reference/method.md), Scale and proportions

## Carve, don't pile

**Carved blocks are preferred.** Whatever you build, it is a few kinds of form, each with its recipe: a mass with hollows and
openings (a house, a tower, a basin) is **one** `solid`, a box with its rooms and openings `cut`; a plate with holes is one; a
frame of members, a run of the same at a step, the loose pieces of a room are **one** `solid` of bodies side by side
(`"join": "none"`, `mirror`, `repeat`), never a part for each; what repeats far apart is an object and its clones. A carve has
no seams where pieces meet; pieces do. So never leave **overlaps** of pieces of one surface, **boxes that touch round an opening**, **two faces in one
plane** (they flicker) or **open joints between a wall and its opening**. Count your own parts, clones aside, and say why any
place keeps several boxes. Gather what is plain and measure what is textured (budget.md).
→ [recipes.md](reference/recipes.md), [method.md](reference/method.md), Walls with openings

## The walkthrough

1. **Plan.** From the request to a plan: what stands where, how big, the palette, the lights, what
   moves; what to ask; how to fit what is asked within the budget, and saying what you simplified.
   Given a model (a GLB) instead: it is the plan — measured, built again in these pieces and
   brought to life with lights, doors that open and furniture. → [plan.md](reference/plan.md)
2. **Place.** Where it goes and what is there. Best: the person's *Survey here* from the world's
   editor (the ground as drawn and what everyone built). Or, from their URL or coordinates:
   `node scripts/survey.mjs "<URL>" --radius 80` — heights, slopes, water, ridges and valleys, a map
   (SVG and PNG) to look at, and the anchor to build on. → [site.md](reference/site.md)
3. **Resources.** The build file, and the official pieces: prim shapes, kinds and their
   parameters, materials by use, species, particles, lights, behaviours — every name in
   `catalog.json`, one entry a line: grep it. → [format.md](reference/format.md). A wall with its
   door and windows, a gateway's arch, a tower hollowed, a dome, a boat's hull with its flare, a handrail, a
   vase, a wheel and its spokes, a cushion: one part of `solid` — prims, hulls, revolves, extrudes, lofts and
   sweeps added, cut and kept in 3D, mirrored and repeated, smoothed by a step, in metres (format.md, Solids),
   where prims pieced round an opening took many, and exact where a sculpt is not. What only a model holds —
   a statue — is described in a few numbers (a lathe, a box, a loft, a sweep, or a model) and made a
   sculpted prim by `node scripts/sculpt.mjs build.json`. → [sculpt.md](reference/sculpt.md)
4. **Quality.** Real proportions, walls cut round their openings, materials at their size; the avatar is 1.8 m
   tall and 0.6 m wide, so no door box under 0.9 × 2.1 m (a door's `size` is its frame; its clear opening is
   smaller: method.md, Scale);
   composition — the square, the ways, the gardens, the woods, the rooms, the night, the palette.
   If you can run code, write the build with a short program: parts from loops and functions,
   never typed by hundreds. If you cannot, carve: a few dozen parts, each form one `solid` of boxes and cuts.
   → [recipes.md](reference/recipes.md), [method.md](reference/method.md), [composition.md](reference/composition.md)
5. **Budget.** `node scripts/check.mjs build.json` checks it as the world will: unknown names,
   objects past 256 parts and anything past the budget's *most* are errors; past *fair*, notes;
   `--survey site.json` counts what already stands round it. → [budget.md](reference/budget.md)
6. **Interactivity.** Particles, lights at night, behaviours (doors, slides, spins, lifts,
   ferries), scripts for what no property can say, games to come; vehicles people drive — cars,
   motorbikes, boats, trains; screens — a video, a GIF or a sticker on a face by its address
   ([format.md](reference/format.md), Media), or a page of its own, HTML whose clicks its script hears
   or whose buttons count, sign and vote by themselves ([format.md](reference/format.md), Pages); patterns on a face — forty: grids,
   circuits, plasma, fire, arcs, radar, DNA, a peer-to-peer mesh… — glowing and moving by a few numbers, each its own (format.md, Surface); mirrors that show what stands before them, the avatars too (format.md, Mirrors). The panel first, code last. → [effects.md](reference/effects.md),
   [vehicles.md](reference/vehicles.md)
7. **Delivery.** The survey's anchor, the JSON the person pastes, drops or opens by its address
   (`?import=https://…` on the world's URL: a raw GitHub file or a gist), a ghost to confirm, an
   export to change it by; a whole parcel saved and loaded back as a land. → [deliver.md](reference/deliver.md)
8. **Verification.** Have it looked at — from where people arrive, inside, at night — and fix what
   is wrong. → [verify.md](reference/verify.md)

The scripts run with Node 18+ or Bun, nothing to install: `scripts/survey.mjs` carries the planet's
own terrain function; `scripts/check.mjs` the world's own checks and this skill's `catalog.json`;
`scripts/sculpt.mjs` the world's own sculpted prims; `scripts/plan.mjs` measures a model (a GLB) to
build it again (it uses ffmpeg, where it is installed, for its textures' colours).

## Rules that always hold

- **Metres and degrees.** The build's frame: x right, y ahead (the anchor's `heading`), z up
  (right as seen from in front, looking back at it from +y; for whoever faces +y — a driver, someone walking in — +x is on the left), z = 0
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
- **Carve, don't pile.** Carved blocks are preferred: a shell, a slab with its stairwell, a wall with its openings is one `solid`
  (a box, its cuts); furniture, a railing, a row, the loose pieces of a room one `"join": "none"` solid (`repeat`, `mirror`).
  No overlapping pieces of one surface, no boxes touching round an opening, no two faces in one plane (they flicker), no open joint between a wall and
  its opening (recipes.md).
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
| [reference/format.md](reference/format.md) | 3 — the build file: anchor, prims, shapes, kinds, materials by use, surface, mirrors, media (videos, GIFs and stickers on a face), pages (HTML on a face), light, collisions, behaviours, objects, clones, trees, ids |
| [reference/sculpt.md](reference/sculpt.md) | 3 — curved and organic shapes as sculpted prims: lathes, boxes, lofts, sweeps, models; bends, twists, noise; examples |
| [reference/recipes.md](reference/recipes.md) | 3 — carve, gather, clone: each form its recipe, with its JSON; what never to leave (overlaps, boxes round an opening, flickering faces, open joints) |
| [reference/method.md](reference/method.md) | 4 — the frame, scale and proportions, walls with openings, a cottage as JSON |
| [reference/composition.md](reference/composition.md) | 4 — villages, squares, ways, fences, forests and clearings, interiors, night, palettes, mistakes |
| [reference/budget.md](reference/budget.md) | 5 — what one build and one place may bring (fair, most), what costs what, what was measured |
| [reference/effects.md](reference/effects.md) | 6 — particles, lights at night, behaviours, vehicles, scripts, games |
| [reference/vehicles.md](reference/vehicles.md) | 6 — vehicles: a car, a motorbike, a boat, a train — their look (rounded bodies, paint, chrome, rims, headlamps), wheels, seats, power, a pier out to deep water; each an example |
| [reference/deliver.md](reference/deliver.md) | 7 — the JSON, the anchor, Builds as JSON, the ghost, export and change, sharing; a whole parcel as a land: Save land, Load in its place, Load here |
| [reference/verify.md](reference/verify.md) | 8 — what to look for |
| `catalog.json` | Prim presets (faces, size axes, triangles); every kind's, behaviour's and particle preset's parameters; the bank, one material a line (id, name, uses, size, colour, metal, look, tags); 45 species of trees and plants with their six variants |
| `scripts/survey.mjs` | The ground round a place, from a URL, coordinates or a survey: JSON, SVG, PNG; `--profile` along lines |
| `scripts/check.mjs` | A build checked as the world checks it, against the budget; `--survey` with what stands round it |
| `scripts/sculpt.mjs` | A build's `sculpt` descriptions made sculpted prims (`build.sculpted.json`); a glTF model resampled into them, or told why it does not fit |
| `scripts/plan.mjs` | A model (a GLB) measured as the plan to build it again: units, walls and their doors and windows, stairs, roof slopes, what repeats, its lights, the bank's nearest materials |
