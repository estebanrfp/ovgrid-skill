# 5. Limits and the budget

The person's machine draws at 120 Hz: **8.33 ms of GPU a frame** at 1445×767 @2x (a 16" M2 Max),
in every view, on foot included. The world takes most of it before anything is built — on foot by
day about 7 ms, by night about 7.4 ms — so a build lives on the remaining 1 ms or so: **≤ 0.5 ms
for the densest view of a build by day**, its night views with every lamp lit within the frame too.

## What one build may bring

The editor checks every build against this before it can be placed, and so does the check script
(`node scripts/check.mjs <build.json>`): past **fair**, it says so and why; past **most**, it
refuses the build. Counted with every clone (a clone's parts draw again).

| | fair | most | Why |
|---|---|---|---|
| parts | 1,500 | 4,000 | each an instance; the reference village is 65, rethought (535 as prims) |
| triangles | 150,000 | 600,000 | at the finest level, near the camera; round shapes are the dear ones |
| materials | 40 | 96 | each ~150 kB for every visitor to fetch, ~700 kB up close; past 16 within 10 m, the nearest blur |
| lights | 12 | 32 | the renderer lights with the 32 strongest in view |
| crowd | 8 | 16 | lights within 30 m of one another: past 8 each pixel takes the dearer, clustered path |
| systems | 12 | 48 | particle systems: each a draw of its own; 128 in view at most, the nearest |
| particles | 1,000 | 3,000 | in the air at once; the world draws 1,500 a frame for everything in view, thinning each alike past it |
| moving | 30 | 120 | objects, clones and parts with a behaviour: 20 cost 0.02 ms of GPU and 0.05 ms of physics |
| scripts | 8 | 32 | the 32 nearest run; each has its own 16 MB and 5 ms an event |
| trees | 400 | 2,000 | cheap on the GPU, but each a record to sign and send; forests are painted with the brush |

Besides: **an object holds at most 256 parts** (split a village into objects: each house, the
square, each run of fence), a part's `light` reaches **10 m** at most, a build is at most 2 MB of
JSON. Parts are what a build weighs on every peer — each a record signed, kept and sent to whoever
comes —, so a shape a `solid` makes in one part (a hull, a rail, a wheel and its spokes) beats a
pile of prims. A solid comes to at most 5,000 triangles before its smoothing; each step of smoothing
multiplies what came before it by 4, 9 or 16, held to 5,000 near, its cage alone far away.

## What a place may hold

The same check counts what already stands within **60 m** of the build's anchor — everyone's, as
the editor sees the shared world — with the build:

| Within 60 m | fair | most |
|---|---|---|
| parts | 3,000 | 10,000 |
| lights | 16 | 48 |
| systems | 24 | 96 |
| trees | 3,000 | 10,000 |

A place past its *most* takes nothing more: build lighter, or somewhere else.

## What a build costs

| Thing | Cost | So |
|---|---|---|
| Parts | Each is an instance of a shared mesh; culled whole, then part by part; four levels of detail by its size on screen | Thousands are fine; tiny parts far away are dropped |
| Triangles | What the GPU draws: at the finest level near the camera, coarser with distance (a 1 m part steps down at about 8, 32 and 59 m; a 10 m part at 84, 318, 591 m) | Round shapes at the finest level are the dear ones: a sphere 528, a torus 1,152, a box 12–108 |
| Distinct meshes | One per shape, kind recipe (and size, for kinds whose mesh depends on it) and level; a draw per mesh, level, face and pipeline. Textures add no draws | Reuse shapes and sizes: 26 parts of a cottage were 4 meshes |
| An object far away | One simplified mesh for all its parts, shared by its clones, once it is small on screen | Group what is seen together into one object |
| Clones | A transform each; the original's parts, meshes and far mesh shared | Clone what repeats unchanged |
| See-through faces (glass, water, `opacity` < 1) | A pass of their own, sorted far to near, no hidden-surface removal: ~0.3 ms for a layer covering the screen | Small panes; no big translucent walls; no glass behind glass |
| Cut-out materials (fences, grates) | Discard fragments, defeating the GPU's hidden-surface removal | Small things only |
| Media (videos, GIFs, stickers on faces) | The 8 nearest faces with media get a screen each (18.9 MB of video memory once one is near). A video's new frame is copied in ~0.2 ms, a sticker's in ~0.3 ms (480 × 270). Nothing at all without a face with media near | On a board's front, not its whole surface; a few near one another (format.md, Media) |
| Pages (HTML on a face) | The 8 nearest take the screens with media, drawn when they change — 0.3–0.5 ms a page where the browser has HTML-in-Canvas —, each page's drawings 2 % of the GPU at most and what blurs left out, a texture each (2.4 MB at most); the rest show still, 32 at once, 0.8 MB each, made smaller once and mipmapped; a page that lights itself is a light round it, counted with the lights; an effect it is drawn through costs only its face's pixels, nothing measurable at a board's size (a CRT, Liquid Glass); nothing at all without a face with a page near. An action — a stroke drawn too — is a write in the world's graph — a person's one a second, what they do between going with the next —, and today every write has every peer save the whole graph again (200 ms at 15,000 nodes) | On a board's front; changed by its script a few times a second at most; actions for what people do now and then — signing, voting, a visit —, never a stream (format.md, Pages) |
| Lights | Per lit pixel within range. Up to 8 in view: every pixel tries all; more: clustered, dearer; the 32 strongest kept. Off by day outdoors; `'night'` ones cost nothing by day | Few, short (≤ 10 m, 5–8 typical), ≤ 8 within any 30 m |
| Glow | A half-resolution pass when anything glows in view | Halos for a few lanterns, not for every window |
| Particles | Symbolic: a flame 3–4 cards, smoke 3–5 puffs; one budget a frame for every system in view (1,500 particles, 0.6 of the screen covered), thinned alike past it; past 30 m a part throws its first layer only, past 200 m nothing. Blended ones (smoke, steam, fog) are the dearest where they fill the screen | A chimney for each burning hearth, a few fires, fog in one or two hollows (effects.md) |
| Trees | Full mesh near, simplified mid-way, an impostor far; culled and drawn on the GPU | Hundreds are cheap: a 5,000-tree forest costs −0.4 ms on foot (it hides terrain), +0.4 ms from 150 m above |
| Shadows | Everything built casts within 250 m; redrawn when it changes or the light moves | Nothing to do |

Triangles per shape at its four levels (catalog.json has every preset and kind, at their defaults):
cube 12 / 12 / 48 / 108, cylinder 24 / 36 / 90 / 192, sphere 24 / 54 / 180 / 528, prism 8, rock
60–480, door 136–208, window 72–96, roof 16, fence (4 m of pickets) 60–444, column 124–348. Trees:
250–4,600 triangles in full, about half simplified (catalog.json → `species`).

## Measured (busy-time union, 1445×767 @2x, against the same view without)

| View | Cost |
|---|---|
| The reference village at its square by day: 595 parts, 11 particle systems, smoke from five chimneys | +0.29 ms (a frame of 6.3 ms) |
| The same by night, every house lit: 10 lights, 8 within 30 m of one another, 4–5 m | +0.40 ms (a frame of 6.9 ms) |
| A lit room from inside: the log cabin by night, its bulb on or off | the same, 4.9 ms a frame: a room's own lamp costs nothing more |
| A campfire 6 m off, by night: with its light / without | +0.20 ms / +0.06 ms |
| On foot inside 5,000 trees / 150 m above them | −0.39 ms / +0.41 ms |
| 20 things moving by themselves | +0.02 ms (0.05 ms of physics) |
| An emissive sphere on the grass at night; lava at night | +0.25 ms; +0.31 ms |

The village's lights were not always so cheap: with twelve at 5–7 m, ten of them within 30 m of one
another, its square by night once cost twice as much and took frames past 8.33 ms. Kept to ten at
4–5 m, the renderer's cheaper path holds — the budget's `crowd`.

## What to aim at

*Fair* and *most* are ceilings: the editor refuses past *most*, and says so from *fair*. They are not what to aim at. Aim at what a
rethought build weighs: the reference village is 65 parts for five houses and their furniture (535 as prims); a cottage with its
door and window is four; a chair one or two. Count your own parts, clones aside: past a hundred for one house with its furniture,
something is piled (recipes.md). Parts are not draws: a gathered solid wearing textures is a mesh of its own, so look at the
check's *distinct meshes* and measure before you give a build of many.

## When it is over

Clone what repeats; kinds instead of piles of prims; fewer spheres and tori (a box where nobody sees
it is round); fewer, larger parts where many small ones do one thing; shorter and fewer lights;
fewer, larger panes; sober particles; fewer trees nearest the views — and say what you simplified
(plan.md).
