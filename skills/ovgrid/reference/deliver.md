# 7. Delivery: from your JSON to the world

## What you give

- **One JSON object** — nothing else in it, no comments — that follows the build file (format.md).
  In a chat, in one code block; better, as a file or at an address (below).
- **With a survey**, its `anchor` as it is (`"exact": true`): the build stands exactly where the
  survey says, its front towards where the person looked. **Without one**, no anchor: the person
  puts it where they point.
- **What you simplified, and why** (plan.md), and what each part of it is: the person reads it
  before they place it.
- **Your parts**: your own parts per object, clones aside, and, wherever several boxes remain, why they could not be one `solid`.

## How the person brings it in

In the world, in build mode (Ctrl+B), the **Builds as JSON** panel (the `{ }` icon in the bar):

1. **Paste** the JSON, or **drop** its `.json` file, or paste its **address** — a gist, a file on
  GitHub (its page or its raw file), any https address that serves it. Or open the world with
  `?import=<address>`: `https://…/?walk=…&import=https://gist.github.com/landi/1f2e…` — the editor
  opens on it.
2. It is **checked** as every peer will keep it: what it cannot be (an unknown material, kind,
  species or parameter, an object past 256 parts, past the budget's *most*) is said, and it cannot
  be placed; what is past *fair*, or held to a range, is noted. Fix what is said, give it again.
3. **Place it**: a ghost where its anchor says — a click places it; R lets it go to follow the
  pointer instead; Esc cancels — or, without an anchor, a ghost under the pointer, its front to the
  camera, R turning it, a click placing it.
4. Placed, it is **theirs**: signed with their identity, shared with everyone in the room, and one
  Ctrl+Z takes it all away.

## Changing it

1. The person selects what to change and clicks **Export selected**: the build as JSON, its anchor
   exact, every object, clone and tree with its `id`.
2. They give it to you with what to change. You give back **the whole build**, keeping the anchor
   and every `id`; new things without an id; an object left out stays as it is.
3. Pasted back, it says **Change N where they stand**: each object it names gets its parts as you
   wrote them, in one step of undo.

## Before you give it, when you cannot run the scripts

`check.mjs` and `plan.mjs` are not in your hands: walk the build in your head as the avatar (1.8 m tall, 0.6 m
wide, a step up of 0.3 m at most), from outside into every room, and fix what stops you before you give it.

1. **Every door and doorway** is at least 0.8 × 1.9 m clear — a `door` box of 1.0 × 2.2 m outside, 0.9 × 2.1 m
   inside, its box being the frame and the opening smaller (method.md, Scale) — and the wall is cut round it
   (method.md, Walls with openings): a door set before an uncut wall blocks the way.
2. **Every threshold, step or ledge** is 0.3 m at most, or stairs with risers of 0.2 m at most.
3. **Headroom** 2.1 m under beams, lofts and stair landings; rooms at least 4 × 4 m with ceilings of 2.8 m.
4. **A clear way** of 1 m from the door through each room, and past the foot and the top of every stair: furniture against the walls.
5. **Every name** — kind, parameter, material, species — is in the guide or `catalog.json`, and no object has
   more than 256 parts.
6. **Carve, don't pile.** Count your parts. Carved blocks are preferred: a wall of boxes round a gap, a part to a leg, a row of
   identical parts side by side are each one `solid` (recipes.md). And no overlapping pieces of one surface, no boxes touching round an opening, no two
   faces in one plane, no open joint between a wall and its opening. Redo them before you give it.

## Sharing it

A build at an address can be brought in by anyone: with an exact anchor it lands where it was
written for — share one without an anchor (or say so) when it is meant for anyone's place. A build
can be placed by anyone who brings it in; what it becomes is theirs.

## A whole parcel: a land

A **land** is a parcel (~300 m, the status's `F5:11145,19300`) saved whole — Second Life's
and OpenSim's region archive (OAR). It is a build file that names its parcel, so everything above holds
for it, and it holds:

- `"parcel": { "face", "x", "y" }`, and an exact `anchor` at that parcel's centre, its +y the parcel's
  own;
- everything that stands in the parcel by its root (an object's centre, a clone's, a tree's foot), with
  an object's parts however far they reach, under their ids;
- `"chunks"`: its ground where it was shaped (terraformed), each chunk as the world keeps it — never
  write or change these by hand: they are the ground to the centimetre;
- `"sky"`: the parcel's own sky, when it has one (time, clouds, rain).

In *Builds as JSON*, **Save land** saves the parcel where the camera looks, and shows and downloads its
file. A land pasted, dropped or opened by its address is checked as a whole parcel: counted, not held to
one build's budget, but to what a newcomer is sent of the world at once (about 1.6 MB compressed, which
the panel says). Its parcel's keeper then chooses:

- **Load in its place**: the parcel becomes what the land holds, as it was saved: what it names is
  changed where it stands, what it no longer holds is taken away, its ground and sky are put back.
- **Load here**: the same, into the parcel where the camera looks — moved to that parcel's centre, under
  new ids, its whole ground laid there. A smaller parcel that it would not fit refuses it.

Either is one Ctrl+Z. To **rethink a land** (in recipes, say), keep its `parcel`, `anchor`, `chunks`,
`sky` and every `id` as they are; change the objects as you would a build's export (Changing it, above).
An object left out is taken away when it is loaded in its place.

