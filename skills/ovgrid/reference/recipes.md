# 3. Recipes by form: carve, gather, clone

Whatever you build — a house, a bridge, a boat, a tower, a market stall, a well, a fence — it is a few kinds of form, and
each form has its recipe. Name the form first, take its recipe, and never write one part for each plate, leg or rung. Every
part is a record each peer signs, keeps and sends, and the budget's *fair* is a ceiling, not a target: a build is judged by
how few parts hold its form (the reference village is 65 parts, rethought, where its prims were 535). None of these needs
code, only boxes, cylinders and cuts; what is curved by more than a cylinder's sides — a dome, a hull — wants points packed
by a program (format.md, *Bodies of their own points*). *Gather*, here, is format.md's: plates that meet nowhere, side by side in
one part; it is not the rule's *never gathered*, which is old pieces copied as they were.

**Carved blocks are preferred.** A carve has no seams where pieces meet; pieces do. So never leave:

- **overlaps**: pieces of one surface laid across each other, as a wall's boxes at its corners or round its openings, whose
  faces flicker where they meet (a post, a pier or a footing that runs into what it meets is no overlap: it hides the joint);
- **boxes that touch round an opening**: a wall of boxes round a door, a window or an arch; cut the opening in one block;
- **two faces in one plane**: they flicker; make the two one block, or offset one by 1–2 cm;
- **open joints between a wall and its opening**: a gap or a lip where a door, a window or an arch meets its wall; the
  kind's box is exactly the `cut`, and a `cut` reaches past both faces.

| The form | Its recipe | Seen in | Parts |
|---|---|---|---|
| A mass with hollows in it and openings through it | **Carve** one `solid`: a box the size of the mass, its rooms, bays and openings `cut`, what the cuts leave a colour, what must stay `add`ed back after | a house, a tower, a gatehouse, a bridge's pier or abutment, a ship's cabin, a kiosk, a kiln | 1 |
| A basin, a trough, a ring | carve it: a box minus a box, the cut's colour dressing its inside | a pool, a well, a planter, a fountain's basin, a moat | 1 |
| A plate with holes in it | one box `solid` and its `cut`s (with code, an `extrude` with `holes`) | a wall with its windows, a floor round its stairwell, a gable, a deck with a hatch | 1 |
| A frame of members: legs, posts, rails, rungs, struts | **Gather** it in one `solid` of `"join": "none"`: the members `add`ed side by side, `mirror` for the other side | a table, a chair, a bed, a stall, a pergola, a scaffold, a rack, a swing, a truss, a cart | 1 |
| A run of the same at a step, or round a point | the same, one body `repeat`ed (`step`, or `around`) | a colonnade, balusters, a fence, steps, battlements, a row of windows, spokes, a ring of lamps | 1 |
| The loose pieces of a room or a yard | the same: each a body, each look a colour | a rug, a table and pots; a row of planters; stepping stones | 1 a group |
| Something turned about an axis | by hand a `cylinder`, `cone` or `ball` of `sides` (6 a hexagon, 16 round enough small); with code a `revolve` of its profile | a column, a barrel, a lamp, a tower, a vase | 1 |
| Something along a path: a rail, a pipe, a beam, a bend | by hand short straight bodies turned at each bend; with code a `sweep` | a handrail, a pipe, a curved beam | 1 |
| A curved shell along an axis | with code a `loft`; by hand faceted, a few boxes and wedges | a boat, a plane, a vault | 1 |
| What has a kind | the **kinds**, in the openings the carve leaves | doors, windows, stairs, fences, roofs, columns, arches, rocks | 1 each |
| What repeats far apart | one object and its **clones** | chairs round a table, alike houses, a lamp down a lane | 1 and a transform each |
| What a solid cannot carry | a part of its own: a light with a range, a behaviour, a script, `phantom`, `climbable`, `bouncy`, a tree. A `seat` is a target on the gathered piece: `"seat": { "at": [x, y, z], "turn": 0 }`, the hips there, from the part's middle | | 1 |

**How many.** What is built is a handful of parts — a cottage with its door and window is four —, what is furnished a part a
piece or a part a room, a village of five houses 65. For one house with its furniture, past a hundred of your own, clones aside, something is piled: a wall of
boxes round a gap, a part to a leg, a row of identical parts side by side. Count them before you give a build, and say why any
place keeps several boxes.

**Parts are not draws.** A gathered solid wearing textures is a mesh of its own, where prims of one shape share one (format.md,
*Choosing a recipe*, per frame). So gather what is plain or of few looks, clone what repeats, and for a build of many gathered
textured solids look at the check's *distinct meshes* and measure it (budget.md) before you give it.

How a solid is dressed (every recipe below uses it):

- Face 0 is the box's own: the outside. A body's `colour` (1–7) names the face it leaves: what a `cut` leaves inside is
  colour 1, a floor plate `add`ed is colour 2. `colours` is the number of the last one used (0 one look, 2 three); `surface.faces` dresses each, as it
  dresses a cube's. A body with no `colour` leaves the box's own look.
- The part's own `faces`, a colour for each side of a box base in the order −x +x −y +y −z +z, dress one side alone:
  `[0, 0, 0, 0, 1, 0]` is a slab with its underside colour 1, `[3, 3, 0, 0, 0, 0]` a block whose two ends are wood.
- Bodies work one after another, each in metres about the part's middle: cut the rooms, cut the openings, `add` back what the
  cut took. A `cut` reaches past the faces it cuts through (0.6 m through a wall 0.2 m thick); where a cut leaves a floor, a
  skirting or a reveal its own look, cut it in a body of its own colour.
- `mirror` copies a body across the part's middle (`"x"`: left to right); `repeat` makes `count` copies, each `step` on. A body
  mirrored is mirrored across the *part's* middle: a leg mirrored makes the pair of a piece centred in its part.
- A part's `size` is the box round its bodies. Gather what is seen together, a room's pieces or a yard's: a part is culled
  whole.
- At most 32 bodies and 3,072 characters written out to a solid: what does not fit one is two.

## A mass, carved

A cottage of 8 × 6 m: its box 4 m high, 0.8 m of it a footing under the ground, its room `cut` 7.6 × 5.6 × 2.8 m from 0.2 m
over the ground (walls 0.2 m, a ceiling 2.8 m clear, 0.2 m of roof left in the block), the door's opening and the window's
`cut` through the front wall (+y), a floor of boards `add`ed last. Colour 0, the outside, is concrete; colour 1, what the room's cut leaves, plaster; colour 2 the boards. The door
and window kinds fill the openings, their boxes exactly the openings, turned 180° in a wall facing +y. The roof is a
`cube` with its eaves, its underside (face 5) the soffit. Four parts, where boxes round each opening took many.

```json
{ "name": "cottage", "at": [0, 0, 0], "prims": [
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
    "material": "metal/painted/metal-029", "surface": { "faces": { "2": { "texture": "glass/clear/float" } } } } ] }
```

## Carve, then `add` back what the cut took

A block of a storey (8.2 × 7 × 3 m) whose room is cut right through it, floor to roof and out through the front, so that
the front is open for glass: the two cheeks of wood that stay at the corners are `add`ed back, and so is the boards' floor.
Its two ends are wood by `faces`, its inside plaster by the cut's colour.

```json
{ "name": "upper block", "kind": "solid", "at": [-5.9, -2.5, 5.3], "size": [8.2, 7, 3], "colours": 3, "faces": [3, 3, 0, 0, 0, 0], "material": "plaster/concrete/concrete-046",
  "surface": { "faces": { "1": { "texture": "plaster/plaster/plaster-001" }, "2": { "texture": "wood/floor/wood-floor-051" }, "3": { "texture": "wood/planks/japanese-cedar-planks" } } },
  "bodies": [
    { "cut": "box", "at": [0, 0.2, 0], "size": [7.6, 6.8, 3.2], "colour": 1 },
    { "add": "box", "at": [-3.6, 3.35, 0], "size": [1, 0.3, 3], "colour": 3 },
    { "add": "box", "at": [0, 0.1, -1.49], "size": [7.6, 6.6, 0.02], "colour": 2 } ] }
```

## A basin

A pool, a well's curb, a planter: a box with a box `cut` from its top, the cut's colour the tiles that line it. Here 10.2 × 5 m
with its coping, 9 × 4 m of basin, its floor 0.04 m over the ground; the water is a `cube` of its own, `phantom` to wade in.

```json
{ "name": "pool basin", "kind": "solid", "at": [-3.5, 8.6, -0.02], "size": [10.2, 5, 0.56], "colours": 1, "material": "paving/stone/travertine-009",
  "surface": { "faces": { "1": { "texture": "paving/tiles/tiles-132a" } } },
  "bodies": [ { "cut": "box", "at": [0, 0, 0.19], "size": [9, 4, 0.26], "colour": 1 } ] }
```

## A slab with its stairwell

A slab of 8 × 6 × 0.4 m with a stairwell of 1.3 × 4.2 m `cut` through it, its underside (−z) colour 1, the soffit. Start
the hole over the step where the stair's headroom under the slab falls below 2.1 m, and end it where the last tread meets
the slab; leave 1.0 m clear at the stair's foot and at its top, or the way past it is lost.

```json
{ "name": "slab", "kind": "solid", "at": [0, 0, 3.6], "size": [8, 6, 0.4], "colours": 1, "faces": [0, 0, 0, 0, 1, 0], "material": "plaster/concrete/concrete-046",
  "surface": { "faces": { "1": { "texture": "wood/planks/japanese-cedar-planks" } } },
  "bodies": [ { "cut": "box", "at": [1.5, 0.5, 0], "size": [1.3, 4.2, 1] } ] }
```

## A frame of members, gathered

A chair is its legs (two bodies, each `mirror`ed across x), its seat and its back, in one `join: "none"` solid; `seat` is a
target on it, the hips 0.07 m over its middle. A sofa is its base, its back, one arm `mirror`ed and its cushion, a colour of
its own. A table is its top and two legs `mirror`ed across x. Each piece is written in its own frame, front +y, floor at
z = 0; the six chairs round a table are one chair and five clones.

```json
{ "name": "chair", "at": [0, 0, 0], "prims": [
  { "name": "chair", "kind": "solid", "at": [0, 0, 0.5], "size": [0.45, 0.45, 1], "join": "none", "colours": 1, "material": "wood/planks/oak-veneer-03",
    "surface": { "faces": { "1": { "texture": "metal/painted/metal-029" } } }, "seat": { "at": [0, 0, 0.07], "turn": 0 },
    "bodies": [
      { "add": "box", "at": [-0.19, -0.19, -0.3], "size": [0.04, 0.04, 0.4], "colour": 1, "mirror": "x" },
      { "add": "box", "at": [-0.19, 0.19, -0.3], "size": [0.04, 0.04, 0.4], "colour": 1, "mirror": "x" },
      { "add": "box", "at": [0, 0, -0.075], "size": [0.45, 0.45, 0.05] },
      { "add": "box", "at": [0, -0.2, 0.2], "size": [0.45, 0.05, 0.5] } ] } ] }
```

```json
{ "name": "sofa", "at": [0, 0, 0], "prims": [
  { "name": "sofa", "kind": "solid", "at": [0, 0, 0.475], "size": [2.4, 0.95, 0.95], "join": "none", "colours": 1, "material": "fabric/cloth/terlenka",
    "surface": { "faces": { "1": { "texture": "fabric/upholstery/fabric-0020" } } }, "seat": { "at": [0, 0.08, 0.2], "turn": 0 },
    "bodies": [
      { "add": "box", "at": [0, 0, -0.25], "size": [2.4, 0.95, 0.45] },
      { "add": "box", "at": [0, -0.365, 0.225], "size": [2.4, 0.22, 0.5] },
      { "add": "box", "at": [-1.09, 0, -0.165], "size": [0.22, 0.95, 0.62], "mirror": "x" },
      { "add": "box", "at": [0, 0.08, 0.035], "size": [1.95, 0.7, 0.12], "colour": 1 } ] } ] }
```

```json
{ "name": "table", "at": [0, 0, 0], "prims": [
  { "name": "table", "kind": "solid", "at": [0, 0, 0.475], "size": [2.4, 1, 0.95], "join": "none", "colours": 1, "material": "wood/planks/walnut-veneer",
    "surface": { "faces": { "1": { "texture": "metal/painted/metal-029" } } },
    "bodies": [
      { "add": "box", "at": [0, 0, 0.45], "size": [2.4, 1, 0.05] },
      { "add": "box", "at": [-1.1, -0.4, -0.025], "size": [0.08, 0.08, 0.9], "colour": 1, "mirror": "x" },
      { "add": "box", "at": [-1.1, 0.4, -0.025], "size": [0.08, 0.08, 0.9], "colour": 1, "mirror": "x" } ] } ] }
```

## A run, a row, a room's loose pieces

A run of railing of 4 m: three rails the whole length and one post `repeat`ed five times, 0.9875 m apart. Its `at` is the
middle of the run, 0.525 m over the floor it stands on; for a run along y, turn it `[0, 0, 90]`. Several runs that meet, or
stand apart on one floor, are one part: more bodies, in a box that holds them all.

```json
{ "name": "railing", "kind": "solid", "at": [0, 0, 0.525], "size": [4, 0.06, 1.05], "join": "none", "material": "metal/painted/metal-029",
  "bodies": [
    { "add": "box", "at": [0, 0, 0.5], "size": [4, 0.05, 0.05] },
    { "add": "box", "at": [0, 0, 0.12], "size": [4, 0.03, 0.03] },
    { "add": "box", "at": [0, 0, -0.3], "size": [4, 0.03, 0.03] },
    { "add": "box", "at": [-1.975, 0, 0], "size": [0.05, 0.05, 1.05], "repeat": { "count": 5, "step": [0.9875, 0, 0] } } ] }
```

Four recessed lights 2 m apart, one part: `emissive` with a `light` of `range: 0` glows at night and counts no light. Set
them just under the ceiling, 1 cm below its face, not hanging from it.

```json
{ "name": "lights", "kind": "solid", "at": [0, 0, 0], "size": [6.14, 0.14, 0.02], "join": "none", "color": [1, 0.85, 0.6],
  "surface": { "emissive": 0.9 }, "light": { "on": "night", "range": 0, "color": [1, 0.8, 0.5] },
  "bodies": [ { "add": "cylinder", "at": [-3, 0, 0], "size": [0.14, 0.14, 0.02], "sides": 12, "repeat": { "count": 4, "step": [2, 0, 0] } } ] }
```

A rug, a coffee table and a pot, standing apart, are one part of three looks: the rug's colour 1, the pot's colour 2,
the table the box's own.

```json
{ "name": "rug table pot", "kind": "solid", "at": [-6.725, -3.325, 4.07], "size": [5.05, 2.85, 0.5], "join": "none", "colours": 2, "material": "wood/planks/walnut-veneer",
  "surface": { "faces": { "1": { "texture": "fabric/carpet/carpet-016" }, "2": { "texture": "plaster/concrete/concrete-025" } } },
  "bodies": [
    { "add": "box", "at": [0.725, 0.025, -0.24], "size": [3.6, 2.8, 0.02], "colour": 1 },
    { "add": "box", "at": [0.725, 0.325, 0.13], "size": [1.2, 0.7, 0.04] },
    { "add": "box", "at": [0.225, 0.325, -0.07], "size": [0.06, 0.6, 0.36] },
    { "add": "box", "at": [1.225, 0.325, -0.07], "size": [0.06, 0.6, 0.36] },
    { "add": "cylinder", "at": [-2.275, -1.175, 0], "size": [0.5, 0.5, 0.5], "sides": 16, "colour": 2 } ] }
```

A bookcase of 1.8 × 0.35 × 2.2 m: a box with five shelves `cut`, one cut `repeat`ed 0.4 m lower each time. The cut reaches
past the front (+y), so the case opens there, and leaves 0.1 m at the sides and 0.075 m at the back.

```json
{ "name": "bookcase", "kind": "solid", "at": [0, 0, 1.1], "size": [1.8, 0.35, 2.2], "colours": 0, "material": "wood/planks/oak-veneer-03",
  "bodies": [ { "cut": "box", "at": [0, 0.1, 0.85], "size": [1.6, 0.4, 0.34], "repeat": { "count": 5, "step": [0, 0, -0.4] } } ] }
```

## What repeats far apart

What repeats far apart is one object and its clones, each a transform:

```json
{ "of": "chair", "at": [5.8, -0.15, 0.2], "turn": [0, 0, 180] }
```
