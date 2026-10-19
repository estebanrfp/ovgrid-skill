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

Cut a wall round its openings into boxes: full height between openings, and under and over each.
Walk a building's walls **counter-clockwise seen from above**: each box's x along the wall, its face
1 (−y) is then outside and face 3 (+y) inside — each may take its own material. Let the front and
back walls run the full width and the side walls fit between them. Then fill each opening with its
kind, its box exactly the opening: a door `[width, thickness, height]` at the wall's line, z = floor +
height / 2; a window `[width, thickness, height]`, its sill standing out of the wall. A roof kind over
the walls, its eaves out front and back, its gable ends (face 1) of the walls' material.

## An example: the cottage, as a build

The cottage these rules make — 7 × 6 m, plaster on stone, a clay-tiled gable roof, a door that opens on a click, four windows — as one build of one object, standing 0.2 m over the ground at its origin on a footing 0.8 m deep:

```json
{ "name": "Cottage", "objects": [{ "name": "cottage", "at": [0, 0, 0.2], "prims": [
  {"name":"footing","shape":"cube","at":[0,0,-0.4],"size":[7.3,6.3,0.8],"material":"masonry/stone-blocks/rustic-stone-wall-02"},
  {"name":"floor","shape":"cube","at":[0,0,-0.01],"size":[6.4,5.4,0.06],"material":"wood/floor/weathered-brown-planks"},
  {"name":"front 1","shape":"cube","at":[3,2.85,1.5],"size":[1,0.3,3],"turn":[0,0,180],"material":"plaster/plaster/beige-wall-001","surface":{"faces":{"1":{"offset":[0.167,0.5]},"3":{"offset":[0.833,0.5]}}}},
  {"name":"front 2","shape":"cube","at":[2,2.85,0.475],"size":[1,0.3,0.95],"turn":[0,0,180],"material":"plaster/plaster/beige-wall-001","surface":{"faces":{"1":{"offset":[0.5,0.158]},"3":{"offset":[0.5,0.158]}}}},
  {"name":"front 3","shape":"cube","at":[2,2.85,2.575],"size":[1,0.3,0.85],"turn":[0,0,180],"material":"plaster/plaster/beige-wall-001","surface":{"faces":{"1":{"offset":[0.5,0.858]},"3":{"offset":[0.5,0.858]}}}},
  {"name":"front 4","shape":"cube","at":[1.025,2.85,1.5],"size":[0.95,0.3,3],"turn":[0,0,180],"material":"plaster/plaster/beige-wall-001","surface":{"faces":{"1":{"offset":[0.825,0.5]},"3":{"offset":[0.175,0.5]}}}},
  {"name":"front 5","shape":"cube","at":[0,2.85,2.65],"size":[1.1,0.3,0.7],"turn":[0,0,180],"material":"plaster/plaster/beige-wall-001","surface":{"faces":{"1":{"offset":[0.167,0.883]},"3":{"offset":[0.833,0.883]}}}},
  {"name":"front 6","shape":"cube","at":[-1.025,2.85,1.5],"size":[0.95,0.3,3],"turn":[0,0,180],"material":"plaster/plaster/beige-wall-001","surface":{"faces":{"1":{"offset":[0.508,0.5]},"3":{"offset":[0.492,0.5]}}}},
  {"name":"front 7","shape":"cube","at":[-2,2.85,0.475],"size":[1,0.3,0.95],"turn":[0,0,180],"material":"plaster/plaster/beige-wall-001","surface":{"faces":{"1":{"offset":[0.833,0.158]},"3":{"offset":[0.167,0.158]}}}},
  {"name":"front 8","shape":"cube","at":[-2,2.85,2.575],"size":[1,0.3,0.85],"turn":[0,0,180],"material":"plaster/plaster/beige-wall-001","surface":{"faces":{"1":{"offset":[0.833,0.858]},"3":{"offset":[0.167,0.858]}}}},
  {"name":"front 9","shape":"cube","at":[-3,2.85,1.5],"size":[1,0.3,3],"turn":[0,0,180],"material":"plaster/plaster/beige-wall-001","surface":{"faces":{"1":{"offset":[0.167,0.5]},"3":{"offset":[0.833,0.5]}}}},
  {"name":"left 1","shape":"cube","at":[-3.35,1.6,1.5],"size":[2.2,0.3,3],"turn":[0,0,-90],"material":"plaster/plaster/beige-wall-001","surface":{"faces":{"1":{"offset":[0.367,0.5]},"3":{"offset":[0.633,0.5]}}}},
  {"name":"left 2","shape":"cube","at":[-3.35,0,0.475],"size":[1,0.3,0.95],"turn":[0,0,-90],"material":"plaster/plaster/beige-wall-001","surface":{"faces":{"1":{"offset":[0.9,0.158]},"3":{"offset":[0.1,0.158]}}}},
  {"name":"left 3","shape":"cube","at":[-3.35,0,2.575],"size":[1,0.3,0.85],"turn":[0,0,-90],"material":"plaster/plaster/beige-wall-001","surface":{"faces":{"1":{"offset":[0.9,0.858]},"3":{"offset":[0.1,0.858]}}}},
  {"name":"left 4","shape":"cube","at":[-3.35,-1.6,1.5],"size":[2.2,0.3,3],"turn":[0,0,-90],"material":"plaster/plaster/beige-wall-001","surface":{"faces":{"1":{"offset":[0.433,0.5]},"3":{"offset":[0.567,0.5]}}}},
  {"name":"back 1","shape":"cube","at":[-2,-2.85,1.5],"size":[3,0.3,3],"turn":[0,0,0],"material":"plaster/plaster/beige-wall-001","surface":{"faces":{"1":{"offset":[0.5,0.5]},"3":{"offset":[0.5,0.5]}}}},
  {"name":"back 2","shape":"cube","at":[0,-2.85,0.475],"size":[1,0.3,0.95],"turn":[0,0,0],"material":"plaster/plaster/beige-wall-001","surface":{"faces":{"1":{"offset":[0.167,0.158]},"3":{"offset":[0.833,0.158]}}}},
  {"name":"back 3","shape":"cube","at":[0,-2.85,2.575],"size":[1,0.3,0.85],"turn":[0,0,0],"material":"plaster/plaster/beige-wall-001","surface":{"faces":{"1":{"offset":[0.167,0.858]},"3":{"offset":[0.833,0.858]}}}},
  {"name":"back 4","shape":"cube","at":[2,-2.85,1.5],"size":[3,0.3,3],"turn":[0,0,0],"material":"plaster/plaster/beige-wall-001","surface":{"faces":{"1":{"offset":[0.833,0.5]},"3":{"offset":[0.167,0.5]}}}},
  {"name":"right 1","shape":"cube","at":[3.35,0,1.5],"size":[5.4,0.3,3],"turn":[0,0,90],"material":"plaster/plaster/beige-wall-001","surface":{"faces":{"1":{"offset":[0.9,0.5]},"3":{"offset":[0.1,0.5]}}}},
  {"name":"door","kind":"door","at":[0,2.85,1.15],"size":[1.1,0.3,2.3],"turn":[0,0,180],"style":"panelled","material":"wood/planks/planks-brown-10","behaviour":{"type":"door","trigger":"both","reach":2.5,"stay":8}},
  {"name":"window","kind":"window","at":[-2,2.85,1.55],"size":[1,0.3,1.2],"turn":[0,0,180],"columns":2,"rows":2,"sill":0.06,"material":"wood/planks/planks-brown-10","surface":{"faces":{"2":{"texture":"glass/clear/old"}}}},
  {"name":"window","kind":"window","at":[2,2.85,1.55],"size":[1,0.3,1.2],"turn":[0,0,180],"columns":2,"rows":2,"sill":0.06,"material":"wood/planks/planks-brown-10","surface":{"faces":{"2":{"texture":"glass/clear/old"}}}},
  {"name":"window","kind":"window","at":[0,-2.85,1.55],"size":[1,0.3,1.2],"turn":[0,0,0],"columns":2,"rows":2,"sill":0.06,"material":"wood/planks/planks-brown-10","surface":{"faces":{"2":{"texture":"glass/clear/old"}}}},
  {"name":"window","kind":"window","at":[-3.35,0,1.55],"size":[1,0.3,1.2],"turn":[0,0,-90],"columns":2,"rows":2,"sill":0.06,"material":"wood/planks/planks-brown-10","surface":{"faces":{"2":{"texture":"glass/clear/old"}}}},
  {"name":"roof","kind":"roof","type":"gable","at":[0,0,4.348],"size":[7.1,6.9,2.695],"material":"roofing/tiles/clay-roof-tiles-02","surface":{"faces":{"1":{"texture":"plaster/plaster/beige-wall-001"},"2":{"texture":"wood/planks/planks-brown-10"},"3":{"texture":"wood/planks/planks-brown-10"}}}}
] }] }
```


