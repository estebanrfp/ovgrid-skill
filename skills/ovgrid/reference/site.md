# 2. The place: where it goes, and what is there

The planet is real ground: hills, valleys, coasts, other people's builds. A build that ignores it
floats, sinks, blocks a view or lands on a neighbour's garden. Survey first.

## Where: from a URL to an anchor

A person gives you a place as the URL of their view, or as coordinates:

| In the URL | Means |
|---|---|
| `walk=x,y,z,face,look,tilt,zoom,flight` | the avatar's feet (planet-centred metres), the azimuth it faces, the azimuth its camera looks along (° from north, east positive), the camera's tilt down and distance behind |
| `pos=x,y,z&target=x,y,z` | a camera at `pos` looking at `target` (planet-centred metres) |
| `lat=…&lon=…` | the ground under a latitude and longitude, in degrees |

- **Planet-centred metres**: the planet's base radius is 6,348,000 m and the sea stands 12,000 m
  over it. A point's latitude is asin(y / r), its longitude atan2(x, z); the direction of
  (lat, lon) is [cos lat · sin lon, sin lat, cos lat · cos lon].
- **A frame at a point** (what an anchor makes): up = the point's direction; north = [0, 1, 0]
  made level there (minus its part along up, normalised); east = north × up; for a heading h, ahead
  = north · cos h + east · sin h and right = ahead × up. A point (x, y, z) of the frame is
  origin + right · x + ahead · y + up · z.
- **An anchor** is a point and a heading: `{ "at": [x, y, z], "heading": h }` — its +y faces h.
  With `"exact": true` its `at` is the frame's origin itself; without, the frame stands on the
  ground under `at`. The survey gives you one, exact, on the ground where the person looked, its +y
  the way they looked: a build written with it stands exactly where the survey says, its front
  (−y) towards them.

## The survey

Two ways to have one, the same JSON:

- **From the person's editor** — the best: in build mode (Ctrl+B), *Builds as JSON* → *Survey
  here*: 80 m round where they look, every 2 m (Shift+click: 200 m, every 4 m), saved as
  `survey-<lat>-<lon>.json` with its map. It has the ground as their screen draws it, and **what is
  built and planted there** — the shared world's, everyone's.
- **From the survey script**, given a URL, `lat,lon` or `x,y,z`, or a survey to go on from (its
  frame kept, what it saw built kept):

  ```bash
  node scripts/survey.mjs "<the person's URL>" --radius 80 --step 2 --name cove
  node scripts/survey.mjs cove.json --profile "0,-40,0,46"
  ```

  It knows the terrain exactly (the same function the planet is drawn from, within ~0.7 m of the
  drawn ground), but not what others have built: that lives in the shared world, which only the
  editor sees. Ask the person for an editor survey of any place that may not be empty.

What it holds — read the `note` at its top:

| Field | |
|---|---|
| `anchor` | the frame: exact, on the ground at the centre, +y the way the person looked |
| `latLon`, `elevation` | where it is; metres over the sea |
| `radius`, `step` | how far each way, how fine |
| `summary` | lowest and highest ground, the steepest slope, the share under 5°, the share under the sea and how deep it gets (`deepest`), how many builds and trees |
| `peaks`, `pits` | `[x, y, z]` the highest and lowest points round them |
| `ridges`, `valleys` | lines: `from`, `to`, `length`, `low`, `high` |
| `builds` | what stands there: `id`, `name`, `owner`, `centre`, `size` (a box in the frame), `parts`, `kinds`, `lights`, `emitters`, `moving` |
| `trees` | `species`, `at`, `scale` |
| `heights`, `slopes` | grids: `heights[j][i]` m over the centre's ground, `slopes[j][i]` ° — at x = −radius + step · i, y = radius − step · j (rows from the far edge to the near one, as a map reads) |
| `water`, `depths` | where there is sea: `water[j][i]` 1 under it, `depths[j][i]` how deep it is (m) |
| `built` | where there are builds: how high what is built stands over the ground in each cell, 0 free |
| `profiles` | with `--profile`: the ground every metre along each line, its lowest and highest points |

Its map — `<name>.svg` and `<name>.png` beside it — shades the ground by height, draws contours,
the sea (blue), ridges (dashed brown) and valleys (dashed blue), the highest peaks, what is built
(pale where low, darker as it rises) and the trees (green), with the frame's x (red) and y (green)
from the centre. Look at it before you plan.

## Reading the ground

| Slope | What to do |
|---|---|
| under 5° | build on footings: the floor over the highest ground, the footing down past the lowest |
| 5–15° | stand houses across the slope with a taller footing downhill, or a terrace |
| 15–30° | terraces held by retaining walls, stairs between them; paths in zigzags along the contours |
| over 30° | leave it — a cliff, a view — or stand a platform on posts, or bridge it |
| sea | keep off, or stand on piles: a pier, a jetty, a boathouse (`water` and `elevation` say where); a boat where `depths` is 0.5 m or more — a shore may stay a hand deep for a hundred metres and more |

## Standing on the ground

The terrain is a function; what you build is not.

- **Floors over the highest ground** under them (0.15 m more), **footings down past the lowest**: a
  box of stone under the walls, as wide as the house plus 0.1–0.2 m each side, from the floor down
  to 0.3 m under the lowest ground there — 0.7 m more where the heights come from a script's survey,
  which may differ that much from the drawn ground. A step or stairs up to a door the floor lifts.
- **Paths, fences and small things follow the ground**: a path is a chain of flat slabs a few metres
  long, each lying along the slope under it; a fence, straight lengths each standing on the ground at
  both ends; a lamp, a bench, a tree placed at `[x, y]` stands on the ground there.
- Rocks sink a tenth of their height into it.
- What stands **outside** an object's footing — a porch post, barrels by the door, a bench — stands
  on the ground there, not on the floor: make it an object of its own at `[x, y]`.
- What stands **on something built** — a well on a square's paving, a lamp on a wall — stands on its
  top.

## Building with the land

- **Terraces**: cut a slope into level platforms 4–10 m deep; each a slab (or the floor of what
  stands on it) held at its downhill edge by a retaining wall of stone boxes from the platform's top
  down past the ground; stairs (the `stairs` kind) or a ramp between them.
- **Ways along the contours**: a path climbs at most 1 in 8 (7°); steeper ground takes it in
  zigzags, each leg along a contour line of the map, a landing at each turn; a lane follows a valley
  floor or a ridge. Each one a `road` laid on the ground (format.md).
- **A bridge between two rises**: take the profile between the two rims (`--profile`): its length
  is the span, its lowest point the depth to bridge. The deck a little over the higher rim, level or
  gently sloped; its ends resting on abutments sunk into each rim (stone boxes down past the ground);
  piers to the valley floor every 8–15 m for timber, or stone arches (the `arch` kind) 6–12 m wide;
  each pier's foot 1 m under the lowest ground round it; railings both sides (the `fence` kind,
  `balusters` or `rails`, 1.1 m); a lamp at each end. A deck 2–3 m wide for walkers, 4–6 m for a lane.
- **Views**: a square, a bench, a tavern's terrace on a ridge or a rise, facing the open side;
  tall things (a tower, a mill) where they are seen against the sky; nothing tall between the
  place people arrive and what they came to see.
- **What is there**: keep clear of what others built (`built` above 0 within 3 m of it, the
  `builds` boxes); never touch records that are not the person's (the editor would refuse); leave
  the paths to them open; plant round trees, not on them. Next to a neighbour's house, ask.

