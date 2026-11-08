# 4. Quality: composition, from a description to a place

A place is a story laid on the ground: who lives here, what they do, where they walk, what the
eye finds first. Decide that before any coordinate. Then build from the ground up: the site, the
ways through it, what stands along them, what grows round them, what lights them.

## The whole

- **One thing to look at.** Each main view needs a focal point: the largest or tallest building
  (a hall, a chapel, a mill, an inn) on the square, a well or a big tree in its middle. Houses are
  smaller than it, sheds smaller still.
- **Fronts to the ways.** Doors, porches and the best windows face the square or the lane (each
  house's turn about z pointing its +y at it); backs face gardens and woods.
- **No grid.** Turn houses ±5–15° off their street, set them back 0.5–2 m unevenly, 3–8 m apart,
  in clusters of two or three with yards between. Vary width, depth, pitch, storeys and palette
  within the family: no two houses alike unless they are clones on purpose (a terrace of cottages).
- **Edges.** A place ends somewhere: a fence, a wall, a hedge, the wood's edge. Inside it, open
  ground to walk; outside, the land.

## Squares

- 15–30 m across, cobbles or flags (`paving/cobblestone/…`, `paving/stone/…`), its feature in the
  middle or a little off: a well, a fountain, a tree, a cross. Benches facing it; a lamp at each
  corner or in a ring of four.
- One slab of paving for the whole square, its top 2–4 cm over the highest ground under it; where
  the ground is lower, its side shows as a low edge of stone (`faces` 1–4 another material). On a
  slope: a terrace, its edge a retaining wall, steps (the `stairs` kind) down to the lane.
- Its edges are house fronts, low walls, trees: leave the corners open for the ways in.

## Ways: paths and lanes

- Every door joins the network. A footpath 1.5–2.5 m, a lane 3–4 m. Gentle curves — a point every
  6–10 m — along the contours, not straight up a slope. Each way one `road` (format.md): its points
  `[x, y]`, laid on the ground as it is placed, its edges mitred at the bends.
- Gravel or beaten earth (`ground/gravel/…`, `ground/soil/pathway-004`) for paths, cobbles for the
  square and the main lane: contrast with the grass. Avoid `cut-out` materials for a path's slab.
- A path stops at the square's edge, the porch's step, the door's threshold: not under them.

## Fences and walls

- Gardens: pickets 0.9–1.1 m (the `fence` kind, `"style": "pickets"`), white or weathered wood, a
  gap of 1.2 m where the path comes in. Fields and paddocks: rails 1.2 m, 2–3 rails. Stone
  walls: boxes 0.5 m thick, 0.8–1.2 m high, of rubble or fieldstone, each length laid on the ground.
- Fence three sides of a garden and leave the front to the path, or all four with a gate gap.
- One fence part runs a whole garden: its `points` round it, `[x, y]`, laid on the ground
  (format.md); a gap is where its points stop.

## Forests, groves, clearings

- **Species by place**: conifers (`fir`, `pine`, `cypress`, `blackPine`, `sugi`) on heights and slopes,
  `redwood` and `dawnRedwood` in damp valleys, broadleaf (`oak`, `maple`, `birch`, `poplar`, `beech`,
  `chestnut`) in valleys and round villages, `plane`, `zelkova`, `camphor` and `hackberry` along streets
  and squares, `willow` and `alder` by water, `feverTree` and `blueGum` where it is hot, `olive`,
  `cypress` and `pine` in the south, palms (`coconut`, `date`, `fanPalm`, `curvedCoconut` leaning over a beach, `dateClump` in an oasis)
  on hot coasts, `spindle` and `christmas` palms in gardens, `dead`
  ones sparingly. One dominant species 60–70 %, one or two others; bushes (`bush`, `oleander`,
  `fern`) at the edges and in gardens.
- **Meadows, beds and borders**: a meadow is `meadowGrass` with `rudbeckia`, `daisy` or `poppy`
  sown loose through it; beds hold `lily`, `gladiolus`, `columbine`, `heather` or `sunflower`, a few
  of a kind together; `hosta`, `monstera`, `strelitzia` and
  `cordyline` under palms in a hot garden. These are 0.3–1.3 m tall: 0.4–0.8 m apart, never one alone.
- **Ponds and shores**: on a lake's water (the build's `land` dug below its parcel's water, site.md),
  `waterLily` pads and `floweringWaterLily` blooms (`"params": { "flower": [r, g, b] }` for a colour of
  your own) in loose drifts of 5–15, 0.5–1 m apart, away from the banks' steepest stretches; round the
  water a band of `cattail` and `rush` where it is shallow and wet, `reed` (3–4 m) in stands of a few
  dozen behind them, `sedge` and `papyrus` between; `willow` and `alder` further back.
- **Spacing**: crowns may touch in a wood — 0.8–1.2 × the crown's width apart (twice its `reach`
  in catalog.json → `species`: an oak's ~7 m reach, 10–14 m apart in open woodland, 6–8 m in a dense
  wood); a row of poplars 5–6 m apart.
- **Variety**: seeds 0–5 give the six variants, `scale` 0.8–1.25; never twenty identical trees in a
  row unless it is an avenue.
- **Clearings**: a ring of trees round free ground, rocks and a fallen `dead` tree in it, the ring
  thinning towards its edge.
- **Keep clear**: no tree on a path, in a house or within its `reach` of a wall or a roof
  (`avoid`). Tall trees behind the houses frame them; one or two in front of a view, not in it.

## Interiors

- **Every room**: a floor (boards, tiles), walls inside (the wall boxes' inner faces: plaster,
  panelling), a ceiling (the roof's underside, face 2, or a slab), and one warm lamp.
- **Furniture against walls**, a clear way from the door through the room (≥ 1 m — the avatar is
  0.6 m wide and everything is solid), and one focal piece: a hearth, a table, a bed, a counter.
- **Each piece of furniture one `solid`**, never a part a leg: its plates `add`ed side by side (`"join": "none"`), a leg
  `mirror`ed, a row `repeat`ed, each look a colour. A table is its top 0.04 m and its legs, one part; a chair its frame
  (legs, seat and back) one part, with its `seat` target; a bed its frame, mattress, duvet, pillows and headboard one part of
  three looks; a shelf a box with its shelves `cut` (one cut `repeat`ed); a rug a box 1 cm thick (`fabric/carpet/…`); a hearth
  a stone box with its opening `cut`; a barrel a cylinder. Bevel (`bevel` kind, `radius` 0.01–0.03) only where hands touch
  and a plain edge shows (recipes.md).
- **A hearth that burns**: embers with fire's particles under the flue, smoke on the chimney's cap
  outside (effects.md); a cold one, neither.
- **The lamp** is a part of the house's object, under the ceiling or on a table:
  `light: { on: 'night', range: 5, color: [1, 0.72, 0.42], intensity: 0.9 }` on a small emissive
  shade or bulb. Its light leaves through the windows' glass onto the ground outside: that is
  what makes a village look lived in at night.
- **Room for the camera**: it follows 4 m behind the avatar; rooms under 4 m across or ceilings
  under 2.8 m are seen through walls. Check the inside view.

## Night

- **Warm and few.** Lamps warm (`[1, 0.72, 0.42]`, about 2,700 K), the moon cool already. Lights on
  `'night'` cost nothing by day; out in the open a light fades out by day anyway.
- **Street lamps**: a post 3.2–3.8 m (a thin cylinder of dark metal or wood), a lantern on it — a
  small box or cylinder whose glass face is emissive (`emissive: 0.8`, no texture, a warm colour) —
  with `light: { on: 'night', range: 7, color: […], intensity: 0.8 }`, a spot down if it should
  light only the ground (`cone: { angle: 70, softness: 0.5 }`). One lamp object, cloned along the
  lane every 12–20 m, alternating sides, and round the square.
- **A lamp in every house that is lived in**: a warm pendant or lantern, `on: 'night'`, range 4 m,
  intensity 1, a little behind the middle of the room whose windows face the square or the way: a
  window looks lit from outside by the wall seen through it. Its walls — parts of the same object —
  keep its light in. Lit windows are what make a village at night; a dark house is a choice the story
  makes, not a saving.
- **Its price**: the village's five houses, a campfire and four street lamps — 10 lights, 8 within
  30 m of one another, 4–5 m each — cost 0.40 ms at its square by night, 0.29 ms by day; twelve at
  5–7 m once took its frames past 8.33 ms. Short ranges and at most 8 lights round any place keep a
  night within budget (budget.md).
- **Smoke from every chimney whose hearth burns** (`"particles": "chimney"` on the cap) — in a
  lived-in village, all of them.
- **Fires**: a campfire on the square, an inn's hearth, a torch by a door. Their flames light 2 m and
  only the two nearest light at all: a fire that lights a square or a room does it with its embers'
  own light (effects.md), counted with the lamps.
- **Count them**: keep the lights within 30 m of one another to 8 at most (the check counts them).
  A lantern that only needs to glow takes `range: 0`: always lit, no light cast, no cost.
- **What shows at night** is what lamps reach: the square, the doors, the ways. Put the lamps
  where people would need them, and look at the night pictures.

## Palettes

Pick a family per role and stay in it: walls two or three tones of one material family, roofs one
or two, timber one, paving one or two, plus the ground's own green and brown. Compare the
catalog's `color`: walls light (plaster, limewash) or mid (stone, brick); roofs darker or
warmer; timber darkest; paving mid and grey-brown, so that the houses stand out of it.

| Region | Walls | Roofs | Timber | Paving and ways | Trees |
|---|---|---|---|---|---|
| Northern village | `plaster/plaster/beige-wall-001`, `plaster/plaster/painted-plaster-wall`, `masonry/stone-blocks/stone-wall` | `roofing/slate/roof-slates-02`, `roofing/tiles/grey-roof-tiles-02` | `wood/planks/planks-brown-10` | `paving/cobblestone/cobblestone-01`, `ground/gravel/gravel-floor` | oak, birch, fir |
| Mediterranean | `plaster/concrete/concrete-wall-003`, `plaster/plaster/plastered-wall` | `roofing/tiles/clay-roof-tiles-02`, `roofing/tiles/clay-roof-tiles-03` | `wood/planks/oak-wood-planks` | `paving/tiles/patio-tiles`, `ground/gravel/sandy-gravel-02` | olive, cypress, pine |
| Cottage country | `masonry/stone-blocks/rustic-stone-wall-02`, `masonry/brick/red-brick` | `roofing/thatch/reed-roof-04`, `roofing/thatch/thatched-roof-002a` | `wood/planks/brown-planks-03` | `paving/cobblestone/cobblestone-02`, `ground/soil/pathway-004` | oak, willow, bush |
| Log and timber | `wood/logs/bark-brown-02` (logs), `wood/planks/wooden-planks` | `roofing/slate/roof-slates-03` | `wood/planks/planks-brown-10` | `ground/gravel/rocky-gravel` | fir, pine, birch |

Use only ids from the catalog (catalog.json → `materials`): an unknown one is refused. Stay off `look: ["glows"]` materials (lit facades) unless the build is a city at
night, and off `cut-out` ones for anything solid: they are for fences, grates and leaves.

## Mistakes to look for

1. Objects floating over the ground or buried in it — survey; footings down past the lowest ground.
2. A grid of identical houses; everything at right angles to everything.
3. Houses showing their backs to the square; doors opening onto nothing.
4. A door or window turned inside out (its front is its −y), or a window in a solid wall (no
   opening cut for it).
5. A shut door the avatar cannot open: give it the `door` behaviour (or build it open).
6. A roof that does not cover the walls, a gap under it, gables open to the sky.
7. Two faces in one plane (a floor's top on a footing's top): they flicker. Make the two one block, or offset 1–2 cm.
8. A texture stretched or tiny: `scale` set by hand — leave it out.
9. Spheres sized as boxes (their size is height, depth, width).
10. Too many lights, all at 10 m; a room's lamp in an object of its own, lighting through walls.
11. Glass everywhere: see-through faces are the dearest to draw.
12. One object of a thousand parts, or a thousand objects of one part.
13. Paths straight up slopes, or floating over a bump (lay them in short legs).
14. Trees on paths, in houses, crowns through roofs.
15. Rooms the camera cannot get into.
16. Overlapping pieces of one surface; boxes that touch round a door, a window or an arch; an open joint between a wall and its opening: carve the wall
    as one block (method.md, recipes.md).
