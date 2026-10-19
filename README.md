# OVGrid build skill

Teach your AI to build in [OVGrid](https://world.ovgrid.com) — a planet in the browser, shared peer to peer,
where people build as they did in Second Life. Describe a fishing village on a cove, a bridge
between two hills or a tavern with a fire, and your AI writes it as one JSON build: you paste it into
the world's editor, see it as a ghost where it will stand, and place it — yours, signed, shared with
everyone there.

## For an AI with skills (Claude Code, and others that read `SKILL.md`)

```bash
npx skills add estebanrfp/ovgrid-skill
```

Or copy `skills/ovgrid/` into your agent's skills folder (for Claude Code,
`~/.claude/skills/` or a project's `.claude/skills/`).

## For any other AI

Give it the guide — all of it on one page:

```
https://raw.githubusercontent.com/estebanrfp/ovgrid-skill/main/guide.md
```

with what you want built, and — for it to build exactly where you are — a survey of the place:
in the world, open the editor (Ctrl+B), then *Builds as JSON* → *Survey here*, and give it the file.

## What is inside

| | |
|---|---|
| `guide.md` | The whole guide on one page: plan, place, resources, quality, budget, interactivity, delivery, verification; a cottage as JSON; the catalog in brief |
| `catalog.json` | Every shape, kind, behaviour, particle preset, material (2,812) and tree species (31), one entry a line |
| `skills/ovgrid/SKILL.md` | The skill: its walkthrough and rules |
| `skills/ovgrid/reference/` | One page a step |
| `skills/ovgrid/scripts/survey.mjs` | The ground round a place, from a URL or coordinates: JSON, SVG and PNG maps, profiles |
| `skills/ovgrid/scripts/check.mjs` | A build checked as the world checks it, against its budget |
| `skills/ovgrid/scripts/sculpt.mjs` | Curved and organic shapes — a lathe, a box, a loft, a sweep, a glTF model — made sculpted prims |

`scripts/` holds the **AI's own tools** — the survey of a place, the check of a build and its sculpted shapes — not the
scripts objects run in the world. Those are a part's `script` field, written in JavaScript against
the world's API (`on`, `every`, `after`, `set`, `keep`, `get`, `touch`, `print`), and they are
explained, with their limits and examples, in `skills/ovgrid/reference/effects.md` (*Scripts*).

The tools run with Node 18+ or Bun and need nothing installed:

```bash
node skills/ovgrid/scripts/survey.mjs "https://…/?walk=…" --radius 80 --name cove
node skills/ovgrid/scripts/check.mjs village.json --survey cove.json
node skills/ovgrid/scripts/sculpt.mjs parlour.json
```

## How it is made

Generated from OVGrid's own code — its shapes, kinds, behaviours, particles, the texture
bank, the tree species, the budget the editor enforces — by `tools/build-skill-repo.js` in the
OVGrid repository. Change it there, not here.

## Notices

The survey and check tools carry the planet's elevation function, ported from the WGSL of the
nvTerrainView8 web demo of the NervLand engine, by The Lone Engineer (<https://wiki.nervtech.org>).
That demo states no licence, and its author's permission is pending. [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)
says so, and lists the BSD-licensed works the planet's rendering derives from.

## Author

Esteban Fuster Pozzi (@estebanrfp) - Full Stack JavaScript Developer
