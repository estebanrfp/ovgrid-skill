# 7. Delivery: from your JSON to the world

## What you give

- **One JSON object** — nothing else in it, no comments — that follows the build file (format.md).
  In a chat, in one code block; better, as a file or at an address (below).
- **With a survey**, its `anchor` as it is (`"exact": true`): the build stands exactly where the
  survey says, its front towards where the person looked. **Without one**, no anchor: the person
  puts it where they point.
- **What you simplified, and why** (plan.md), and what each part of it is: the person reads it
  before they place it.

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

## Sharing it

A build at an address can be brought in by anyone: with an exact anchor it lands where it was
written for — share one without an anchor (or say so) when it is meant for anyone's place. A build
can be placed by anyone who brings it in; what it becomes is theirs.

