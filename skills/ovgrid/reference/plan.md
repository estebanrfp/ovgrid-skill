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
