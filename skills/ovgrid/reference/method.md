# 4. Quality: the frame, scale, walls with openings

The rules that make a build look built rather than generated: real proportions, walls cut round
their openings, materials running on across the boxes of a wall. (Where it stands and on what
ground: site.md.)

## The frame

x right, y ahead, z up (right as seen from in front, looking back at it from +y; for whoever faces +y — a driver, someone walking in — +x is on the left), metres; z = 0 the ground under the anchor. A turn is degrees about x, then
y, then z; z counter-clockwise from above: the z turn that points a part's +y from (x₀, y₀) towards
(x₁, y₁) is atan2(−(x₁ − x₀), y₁ − y₀) in degrees.

Write every object **in its own frame**: a house as if it stood at the origin, its front (door) to
+y, its floor at z = 0. Place it with the object's `at` and `turn`. Doors and windows (kinds) face
their own −y: in a wall facing +y turn them `[0, 0, 180]`; facing +x, `90`; facing −x, `−90`.

## Scale and proportions

The avatar is 1.8 m tall and 0.6 m wide; it steps up 0.3 m and walks slopes to 50°; its camera
follows 4 m behind and 1.4 m up (zoom out to 10 m). Build real sizes outside; open up what the
camera must get into — Second Life's builders' rule: rooms a third larger than life.

**The least a person fits through — an opening the avatar cannot pass is the commonest mistake.** Take these
as minimums, not as a range to land on, a cabin's included. A `door` part's `size` is its frame's outer box and
its clear opening is smaller (width − 2 × `frame`, 0.08 m by default; height − `frame`): a box of 1.0 × 2.2 m
leaves 0.83 × 2.1 m. A person needs 0.8 m wide and 1.9 m high clear, so a door box is at least 1.0 × 2.2 m
outside and 0.9 × 2.1 m inside — never smaller; a doorway cut in a wall, or an arch, the same clear size. A
passage is at least 1.0 m wide (a corridor 1.5 m), headroom 2.1 m under a beam, a loft or a stair landing, and a
step up over 0.3 m is a stair (risers 0.2 m at most), not a ledge.

The same ruler for everything else you build, by how the avatar meets it:

| The avatar… | Size it for it |
|---|---|
| walks through | a door box ≥ 1.0 × 2.2 m outside, 0.9 × 2.1 m inside; a doorway, an arch or a gate ≥ 0.8 × 1.9 m clear (a gate 1.0 × 2.2 m); a passage ≥ 1.0 m, a path ≥ 1.5 m, a bridge, a pier or a pontoon ≥ 2 m, stairs ≥ 1.0 m wide |
| stands under | a beam, a loft, a landing, a sign, a tree's lowest branch ≥ 2.1 m clear; a ceiling ≥ 2.8 m |
| steps on | a step ≤ 0.3 m, a stair riser ≤ 0.2 m (tread 0.28–0.32 m); a deck, a dais or a doorstep over 0.3 m takes stairs; a slope ≤ 50° |
| reaches, clicks, uses | within 5 m for a click; a door opens by itself within 2.5 m; handles, switches and levers at 1.0–1.2 m, a counter 0.9 m, a bar 1.1 m |
| sits, rests on | a seat 0.45 m, a table 0.75 m, a bench 0.45 m, a bed 0.5 m; a railing 1.0–1.1 m, a garden wall 0.9–1.2 m |
| sees, from the camera 4 m behind and 1.4 m up | a room under 4 m across, or a ceiling under 2.8 m, is seen through its walls (composition.md, Room for the camera): open it up; a sign read from 10 m wants letters 0.2 m high or more |
| only looks at | a mountain, a distant tower, a sky: any size, since nothing walks there |

| Thing | Size |
|---|---|
| Door (outside / inside) | 1.0–1.2 × 2.2–2.4 m / 0.9–1.0 × 2.1–2.2 m |
| Window | 0.8–1.2 wide × 1.0–1.4 high, sill 0.8–1.0 m over the floor |
| Storey | 3.0–3.4 m floor to floor; ceiling ≥ 2.8 m (3–3.5 in a hall) |
| Room | ≥ 4 × 4 m; a corridor ≥ 1.5 m wide |
| Wall | 0.2–0.3 m (timber, plaster), 0.4–0.6 m (stone) |
| Floor slab / footing | 0.1–0.2 m over the ground / down past the lowest ground |
| Stairs | riser 0.15–0.2 m (≤ 0.3 walkable), tread 0.28–0.32 m, width ≥ 1 m |
| Roof | pitch 30–45° (thatch 45–55°); eaves 0.3–0.6 m over the walls |
| Cottage / house / hall | 6 × 5 m / 8 × 7 m, 1–2 storeys / 12 × 8 m |
| Table, chair seat, bench | 0.75 m / 0.45 m / 0.45 m high; a bed 2.0 × 1.4–1.6 × 0.5 m |
| Counter, bar, shelf | 0.9 m / 1.1 m / 0.3–0.4 m deep |
| Path, lane, square | 1.5–2.5 m / 3–4 m / 15–30 m across |
| Fence, garden wall | 0.9–1.2 m; stone walls 0.4–0.6 m thick |
| Street lamp | 3–4 m, every 12–20 m |
| Well | 1.4–1.8 m across, its wall 0.7–0.9 m high and 0.25–0.35 thick |

## Walls with openings

Carved blocks are preferred. A wall with its openings is **one `solid`**: a box the size of the wall, each opening a `cut`
that reaches past both faces, `colour` giving what the cut leaves (a reveal, the inside) its own look. A whole house is the
same one size up: a box the size of its walls, floor and ceiling, its rooms `cut` out, its openings `cut` through (recipes.md,
*A mass, carved*). Then fill each opening with its kind, its box exactly the opening: a door `[width, thickness, height]` at
the wall's line, z = floor + height / 2, turned `[0, 0, 180]` in a wall facing +y; a window the same, its sill standing out
of the wall. A roof over the block, its eaves out front and back, its underside (a cube's face 5) the soffit.

Never build a wall as boxes round its openings: boxes that touch round a gap leave **overlaps**, **two faces in one plane**
that flicker, and **open joints between the wall and its door or window**, which a carved block does not have.

## An example: the cottage, as a build

The cottage these rules make — 8 × 6 m, concrete outside and plaster within, a flat roof with its wooden soffit, a door that opens on a click, a window — as one build of one object, carved from one block, four parts, standing on the ground at its origin on a footing 0.8 m deep:

```json
{ "name": "Cottage", "objects": [{ "name": "cottage", "at": [0, 0, 0], "prims": [
  { "name": "shell", "kind": "solid", "at": [0, 0, 1.2], "size": [8, 6, 4], "colours": 2, "material": "plaster/concrete/concrete-046",
    "surface": { "faces": { "1": { "texture": "plaster/plaster/plaster-001" }, "2": { "texture": "wood/floor/wood-floor-051" } } },
    "bodies": [
      { "cut": "box", "at": [0, 0, 0.4], "size": [7.6, 5.6, 2.8], "colour": 1 },
      { "cut": "box", "at": [0, 2.9, 0.2], "size": [1.2, 0.6, 2.4] },
      { "cut": "box", "at": [-2.2, 2.9, 0.55], "size": [1.6, 0.6, 1.2] },
      { "add": "box", "at": [0, 0, -0.99], "size": [7.6, 5.6, 0.02], "colour": 2 } ] },
  { "name": "roof", "shape": "cube", "at": [0, 0, 3.325], "size": [9, 7, 0.25], "material": "plaster/concrete/concrete-046",
    "surface": { "faces": { "5": { "texture": "wood/planks/japanese-cedar-planks" } } } },
  { "name": "door", "kind": "door", "at": [0, 2.9, 1.4], "size": [1.2, 0.2, 2.4], "turn": [0, 0, 180], "style": "glazed", "hinge": "right",
    "material": "metal/painted/metal-029", "surface": { "faces": { "2": { "texture": "glass/clear/float" } } },
    "behaviour": { "type": "door", "trigger": "both", "reach": 2.5, "stay": 8 } },
  { "name": "window", "kind": "window", "at": [-2.2, 2.9, 1.75], "size": [1.6, 0.2, 1.2], "turn": [0, 0, 180], "columns": 2, "rows": 1,
    "material": "metal/painted/metal-029", "surface": { "faces": { "2": { "texture": "glass/clear/float" } } } } ] }] }
```


