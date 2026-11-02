# 1. From a request to a plan

A person describes what they want — a fishing village on that cove, a bridge between those two
hills, a tavern with a fire and a cellar — sometimes in a page of detail, sometimes in a line.
Before any part is written, turn it into a plan you could hand to someone else.

## Ask what only they know

- **Where**: the URL of the view they want it in, or a survey of the place (site.md). Without one,
  the build has no anchor and they place it themselves.
- **What is there already** that must stay: their own builds, a neighbour's, a road, the trees.
- **The feel**: period and region (a Cotswold hamlet, an Andalusian *cortijo*, a Norse longhouse),
  materials they like, day or night, busy or quiet.
- **What it must do**: doors that open, a lift, a ferry, a fire that lights at dusk, a game.

Ask only what changes the plan; take sensible defaults for the rest and say which.

## Write the plan

In the build's frame — x right, y ahead, z up (right as seen from in front, looking back at it from +y; for whoever faces +y — a driver, someone walking in — +x is on the left), metres; the anchor's ground at z = 0 — list:

1. **The pieces**: each building, the square, the ways, the fences, the groves, the lights and what
   moves, each with its size, where it stands and which way it faces.
2. **The ground under each**: flat enough, or a terrace, a footing, a bridge (site.md).
3. **The palette**: one material for each role — walls, roofs, floors and paths, wood, metal,
   glass — the same across the houses, varied by colour, offsets and a few accents (composition.md).
4. **The lights at night**, and the effects: smoke from the chimneys that burn, a fire, fog in a hollow
   (effects.md).
5. **What repeats** (lamps, benches, fence sections, alike houses): one object, then clones.
6. **The cost** against the budget (budget.md): parts, triangles, lights within 30 m of one another,
   particle systems, trees, materials.

## Fit what is asked to what the world can carry

The budget is not a suggestion: past its *most*, the editor refuses the build. When a request asks
for more — a city in one go, a hundred lit windows, a forest of ten thousand trees, fireworks
everywhere — keep its spirit and make it fit, in this order:

1. **Clone** what repeats: a street of alike houses is one house and its clones.
2. **Kinds** instead of piles of prims: stairs, roofs, fences, doors, windows, columns, arches.
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

## A model as the plan

A person may hand you a model to build from — a GLB of a mansion found online — instead of a
description. Read it as an architect reads drawings, then build it again in the world's own pieces.
Never bring in its mesh or its textures.

1. **Read it**: always a GLB — Sketchfab's own download carries its pieces' names (they say much:
   `Window.012`, `Stairs`), its materials and colours, and who made it under what licence. CC0 or
   CC-BY only — never NoDerivatives, as your build adapts it — and the author, licence and source go
   in every object's `origin`.
2. **Measure it**: `node scripts/plan.mjs <model.glb>` says it all in a second, as text: its units
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

