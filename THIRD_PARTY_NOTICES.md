# Third-party notices

OVGrid's own code is not open source (`"license": "UNLICENSED"` in package.json). Parts of it are
derived from the works below, whose notices are kept here as their licences ask. The files each
one covers point here in their first lines.

## Precomputed Atmospheric Scattering — Eric Bruneton

The atmosphere (`shaders/atmosphere/`, `src/atmosphere.js`), ported to WGSL from
<https://github.com/ebruneton/precomputed_atmospheric_scattering>.

```
Copyright (c) 2017 Eric Bruneton
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
this list of conditions and the following disclaimer in the documentation
and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors
may be used to endorse or promote products derived from this software without
specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
```

## Proland — INRIA

The ocean's waves and lighting (`shaders/ocean/`, `src/ocean.js`), Bruneton, Neyret and
Holzschuch's, and the refinement of terrain tiles from their parent
(`shaders/elevation-producer.wgsl`), as in Proland, a procedural landscape rendering library
(<http://proland.inrialpes.fr/>).

```
Copyright (c) 2008-2015 INRIA - LJK (CNRS - Grenoble University)
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
this list of conditions and the following disclaimer in the documentation
and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors
may be used to endorse or promote products derived from this software without
specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
```

## nvTerrainView8 — NervLand

The planet's elevation and ground colour (`shaders/terrain-height.wgsl`,
`shaders/terrain-materials.wgsl`, `src/terrain-height.js` and the survey tool built from it) and
parts of the ocean were ported from the WGSL shipped with the nvTerrainView8 web demo of the
NervLand engine, by The Lone Engineer (<https://wiki.nervtech.org>). The demo states no licence:
its author's permission is pending.

## OpenSimulator

Sculpted prims (`src/build/prim/sculpt.js`) lay their grid's points and triangles in the order and
winding of OpenSim's `OpenSim/Region/Physics/Meshing/SculptMesh.cs`; the importer of OpenSim regions
(`src/build/opensim/`, `tools/opensim/`) reads the formats OpenSim's code writes (texture entries,
extra parameters, particle systems, texture animations, OARs, coalesced objects, its MySQL tables)
as that code reads them. OpenSim's name endorses nothing of OVGrid's.

```
Copyright (c) Contributors, http://opensimulator.org/
See CONTRIBUTORS.TXT for a full list of copyright holders.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of the OpenSimulator Project nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE DEVELOPERS ``AS IS'' AND ANY EXPRESS OR
IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE CONTRIBUTORS BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
```

## WebGL Water — Evan Wallace, and WebGPU Water — jeantimex

The waves where the water is touched (`shaders/ripples.wgsl`, `src/ripples.js`): their wave equation —
each texel's height pulled towards its four neighbours' —, their drop and their sphere's footprint at the
waterline follow Evan Wallace's WebGL Water (<https://github.com/evanw/webgl-water>, «Released under the
MIT license» in its files' headers) and jeantimex's port of it to WebGPU
(<https://github.com/jeantimex/webgpu-water>, its LICENSE). Its images — the tiles, the sky — are not
in OVGrid.

```
Copyright 2011 Evan Wallace
Released under the MIT license

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

```
MIT License

Copyright (c) 2026 Su

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## html-in-canvas.dev — En Dash Consulting

The effects a page's face may be drawn through (`shaders/build/page-effects.wgsl`): the GLSL of the
site's demos — Liquid Glass, Elastic Bulge, and css-to-shader's Chromatic, CRT, Glitch, VHS, Halftone and
ASCII — ported to WGSL from <https://github.com/en-dash-consulting/html-in-canvas-dot-dev> (its LICENSE).
Liquid Glass and css-to-shader are En Dash Consulting's; Elastic Bulge is Amit Sheen's (its demo's
`meta.json`), in the same repository under its MIT licence.

```
MIT License

Copyright (c) 2026 En Dash Consulting

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Second Life's viewer

The 2011 AOs (tools/import-ao.js, tools/avatar/sl-anim.js) are read in the `.anim` format as the
Second Life viewer reads it (Firestorm's `indra/llcharacter/llkeyframemotion.cpp`, LGPL 2.1), and
retargeted from the 2011 ("base") joints' offsets of its `avatar_skeleton.xml`. No code of the viewer
is in OVGrid. The animations themselves are their creators': imported on this machine only, never
published.

## Manifold — The Manifold Authors, and Clipper2 — Angus Johnson

OVGrid's geometry engine (`src/manifold/`) is built from Manifold v3.5.4
(<https://github.com/elalish/manifold>, Apache License 2.0, in `src/manifold/LICENSE`) and the Clipper2 it
pins (<https://github.com/AngusJohnson/Clipper2>, Boost Software License 1.0, in
`src/manifold/LICENSE-Clipper2`), by tools/manifold/build.sh. Its binding (`tools/manifold/binding.cpp`,
`binding.js`) is OVGrid's own, its calls made as manifold-3d's `bindings/wasm` makes them.

## Assets with their own notices

- `assets/avatar/` — Decentraland's two base bodies, today's outfit, the locomotion clips and the
  common emotes it keeps (sitting): Apache License 2.0, with its LICENSE and NOTICE.
- `assets/avatar/clips/mixamo/` — thirteen animations from Mixamo (Adobe), six of moving and seven of
  climbing, retargeted onto our skeleton (tools/build-avatar-animations.js): used inside OVGrid as game
  assets under Adobe's Mixamo terms, never offered as files to download nor redistributed on their own.
- The avatar library's `wearables/skin/100avatars-r1/`, `100avatars-r2/`, `100avatars-r3/` and `toxsam/` —
  the avatars of 100Avatars R1, R2 and R3 and of ToxSam's collection, by Polygonal Mind (100avatars.com), from
  the VRMs the Open Source Avatars registry keeps (github.com/ToxSam/open-source-avatars); and `wlily/` —
  five of wlily's characters (teru64, opengameart.org/content/wlilys-characters); and `neonglitch86/` — one of
  NeonGlitch86's collection (from the same registry): laid on our skeleton
  (tools/build-avatar-skins.js), CC0 1.0 by their own meta, credited here as a courtesy.
- The avatar library's `wearables/skin/robots/` — the three robots of «Lowpoly Robots» by Satendra Saraswat
  (sketchfab.com/satendra5286, sketchfab.com/3d-models/lowpoly-robots-7181d9e5ba434aa59dc7b9042c9723df):
  CC BY 4.0 (creativecommons.org/licenses/by/4.0/). Changed: laid on our skeleton and proportions, their
  meshes quantised, their map recoloured for each colour combination and converted to KTX2, their thumbnails
  drawn (tools/build-avatar-skins.js --robots, tools/avatar/robots.json); credited in that folder's NOTICE too.
- `tools/avatar/simplify.js` uses meshoptimizer (MIT, © Arseny Kapoulkine), a tools-only dependency.
- The avatar library's `animations/quaternius/` — twelve animations of Quaternius's Universal Animation
  Library (the Standard one, quaternius.com), retargeted onto our skeleton: CC0 1.0, credited here
  as a courtesy.
- `assets/avatar/sounds/grip-*.mp3` and `scuff-*.mp3` — the climbing sounds, cut from two Freesound
  recordings: «Climbing a rock, shoes and hands» by YannSauvin (freesound.org/s/816743) and
  «Footsteps_Mountain_Boots_Rock_Sequence_Mono.wav» by Nox_Sound (freesound.org/s/558812): CC0 1.0,
  credited here and in assets/avatar/NOTICE as a courtesy.
- `assets/avatar/sounds/stroke-*`, `lap-*`, `wade-*`, `splash-*`, `splashSmall-*` and `bubbles-*.mp3` — the
  water's sounds, cut from Freesound recordings by roisin.gleeson (783806), EpicWizard (316598), Nox_Sound
  (585744), kyles (637974), calebrankin (529383) and hotpin7 (840042); and
  `assets/sounds/birds/` — the birds', from recordings by steaq (263786), Lydmakeren (510917),
  Profispiesser (543827), _stubb (389634, 389633), TurboFool (561009) and DigPro120 (432639): CC0 1.0,
  credited here and in assets/avatar/NOTICE and assets/sounds/NOTICE as a courtesy.
- `assets/avatar/sounds/wading-1.mp3` — wading, "walking-in-water-trim.mp3" of Esteban Fuster Pozzi's
  earlier worlds (ovgrid-assets, webgpu-world), where its source is not recorded: in assets/avatar/NOTICE.
- `assets/sounds/ambience/` — the beach and the snowy heights' wind, "beach.mp3" and "snow.mp3" of his
  webgpu-planetary-world, whose THIRD_PARTY_NOTICES.md has them "used under licenses cleared by the
  maintainer": in assets/sounds/NOTICE.
- The avatar library — `assets/avatar/library/` (out of git, made by tools/build-avatar-library.js),
  published at assets.ovgrid.com/avatar/v1/ — Decentraland's bodies, wearables, face features and
  thumbnails from decentraland/avatar-assets, their meshes fitted and quantised and their maps in
  KTX2, the common emotes of decentraland/unity-explorer and the reference emotes of
  decentraland/documentation-creators (`animations/dcl/`): Apache License 2.0,
  © 2019 Metaverse Holdings Ltd., with its LICENSE and NOTICE beside it. No
  trademark rights are granted (§6): what bears a brand or a mark is left out, and artwork licensed
  from its artists to a collection rather than to Decentraland (docs/avatar-system.md).
- `assets/wasm/` — Binomial's Basis Universal transcoder: Apache License 2.0, with its LICENSE and
  NOTICE.

## The animals' models

The planet's animals (docs/fauna.md) are drawn from these models. Those of the first table are licensed under the
Creative Commons Attribution 4.0 International licence (CC BY 4.0, https://creativecommons.org/licenses/by/4.0/) by
their authors, kept as downloaded in `assets/fauna/sources/`, and adapted for the meshes the world draws
(`assets/fauna/<species>.json`, made by tools/fauna/bake.js): the base under one left out, each stood along its
own length at its size in the world, simplified to a few hundred triangles — the legs of a pair modelled in mid
stride stood as the two lean between them —, and its vertices given the parts they move by; they carry no
skeleton and no animation, and OVGrid gives them their motion.

| species | model | author | source |
|---|---|---|---|
| polar bear | «Low Poly - Polar Bear» | Gouw (https://sketchfab.com/Gouw) | https://sketchfab.com/3d-models/low-poly-polar-bear-744849f988f148749245c8115eec046e |
| penguin | «Low Poly Penguin» | Mysticreator (https://sketchfab.com/Mysticreator, as the model downloaded records it; Sketchfab shows the account as Daringcuteseal) | https://sketchfab.com/3d-models/low-poly-penguin-8a27f42a0b1646d6b210db9ab668c54f |
| elephant | «Low Poly Elephant» | Maksim Batyrev (https://sketchfab.com/c3posw01) | https://sketchfab.com/3d-models/low-poly-elephant-4d16e8e3344f4c7499cf9d2c488e4c9b |
| horse | «Low Poly Horse(Free Download)» | ouz209 (https://sketchfab.com/ouz209) | https://sketchfab.com/3d-models/low-poly-horsefree-download-a938d9527eb14bdfb9efe45073fa9c18 |
| cow, sheep, dog, cat | «Low poly animals» (`farm-pack.glb`; its elephant is not used) | ranaaunhaider12 (https://sketchfab.com/ranaaunhaider12) | https://sketchfab.com/3d-models/low-poly-animals-ab00915d1d40484ea658409be3e4cf93 |
| goose | «Goose Low Poly» | Atlas (https://sketchfab.com/Atlasmodels) | https://sketchfab.com/3d-models/goose-low-poly-3318893e41fc4d2f9f497776da95c13a |
| chicken | «Low Poly Chicken» | Tiberiu Uncu (https://sketchfab.com/pangolinbc) | https://sketchfab.com/3d-models/low-poly-chicken-29e61a713bd3413c8fc74c8453a1ada1 |

The dinosaurs are Quaternius' «Dinosaur Animated Pack - Dec 2018» (https://www.patreon.com/quaternius, as its
License.txt names its author), dedicated to the public domain under CC0 1.0 Universal
(https://creativecommons.org/publicdomain/zero/1.0/): credited here though CC0 asks for none. Each came as a .blend
with its skeleton and six clips; `tools/fauna/from-blend.py` made each the GLB kept in `assets/fauna/sources/` — its
mesh, skeleton and skin, its six clips, its materials as plain colours; a bone a clip leaves unmoved kept as the file
keeps it, a looping clip made to end where it begins —, with every foot kept to the ground as it walks and runs: each
foot's path aft on the ground made straight, and scaled so that every foot goes aft as fast as the others (the clips'
hind feet went 2.4–3.6 times as far as the fore ones a step), its legs following by their IK. tools/fauna/bake.js
stands each at its size, simplifies it to 440 triangles, gives each vertex its four weightiest joints and samples its
six clips.

| species | model (its .blend) | size in the world |
|---|---|---|
| tyrannosaurus | Trex | 12 m long |
| triceratops | Triceratops | 8.5 m long |
| stegosaurus | Stegosaurus | 9 m long |
| apatosaurus | Apatosaurus | 22 m long |
| parasaurolophus | Parasaurolophus | 9.5 m long |
| velociraptor | Velociraptor | 2 m long |

## Models taken as plans

These builds are rebuilt in OVGrid's own pieces — its prims, its kinds and the texture bank's
materials — from a model's measurements, the model taken as the plan (docs/decisions.md «A model as the
plan»). No mesh, texture or other data of the model is in them. Each is an adaptation of its model, which
is licensed under the Creative Commons Attribution 4.0 International licence
(https://creativecommons.org/licenses/by/4.0/):

- `assets/builds/submarino.json` (`tools/build-submarino.js`): «Submarine» by Jānis Circenis (Sketchfab:
  serioussam909, as the model downloaded records it; its page is now under Coder123123),
  https://sketchfab.com/3d-models/submarine-1acdd9bf8e734c518268bcc403420c15. Rebuilt with OVGrid's
  pieces, the model taken as the plan, at 66 m a unit: its hull, its dome of glass and the frame round
  it, its deck, sail, masts, dive planes and pods, its two decks inside; what was inside it left out; in
  the bank's materials.
- `assets/builds/helicoptero.json` (`tools/build-helicoptero.js`, `tools/helicoptero-outside.js`): «Simple low
  poly helicopter» by Taha Bin Ashar (Sketchfab: tahabinasharchaudhary),
  https://sketchfab.com/3d-models/simple-low-poly-helicopter-d7a4f68877ac41c28e793013cb17287b. Rebuilt with
  OVGrid's pieces, the model taken as the plan, at 1.7 times its size: its fuselage's faces, its glass, its
  tail, its wheels and its rotors from its measurements, in its flat colours; its cabin, seats, controls,
  windows, glass floor and lights OVGrid's own.
- `assets/builds/helicoptero-2.json` and `assets/builds/helicoptero-2-marcos.json` (`tools/build-helicoptero2.js`,
  `tools/helicoptero2-outside.js`): «3D Low Poly Helicopter» by hamza_suleman (Sketchfab: hamza_suleman),
  https://sketchfab.com/3d-models/3d-low-poly-helicopter-9273c66886cd4792a983263d2082da82. Rebuilt with
  OVGrid's pieces, the model taken as the plan, at 1.7 times its size: its fuselage's faces, its glass, its
  chines, stub wings and drums, its engines, its tail and its rotors from its measurements, in its flat
  colours; its glass floor and its frames, side windows, seats, controls, panel and lights OVGrid's own.
- `assets/builds/helicoptero-3.json` (`tools/build-helicoptero3.js`, `tools/helicoptero3-outside.js`): «helicopter» by
  linus1178 (Sketchfab: linus1178), https://sketchfab.com/3d-models/helicopter-dec45a28e6f346648c3d6585426157b8.
  Rebuilt with OVGrid's pieces, the model taken as the plan, at 1.2 times its size: its fuselage's faces, its glass,
  its tail and fins, its skids and its rotors from its measurements, in its flat colours; its glass floor, its low
  windows and their frames, seats, controls, panel and lights OVGrid's own.
- `assets/builds/bicicleta.json` and its twin of recipes `assets/builds/bicicleta-recetas.json` (`tools/build-bicicleta.js`,
  `tools/bicicleta.js`): «Low Poly Bicycle» by tolotedesign (Sketchfab: tolotedesign),
  https://sketchfab.com/3d-models/low-poly-bicycle-e844c99894c94af297384d9ab937ab49.
  Rebuilt with OVGrid's pieces, the model taken as the plan, at 1.2 times its size: its wheels, crank, frame, saddle and
  bars from its measurements, its saddle and bars raised and set back for its rider; its rider's pedalling, its lamp and
  its materials OVGrid's own.
- The amusement park's roller coaster (`src/build/park.js` `COASTER_LINE`, the ride kind's `rail` and `car`): «Animated
  Kiddie-coaster» by ansonweese (Sketchfab: ansonweese),
  https://sketchfab.com/3d-models/animated-kiddie-coaster-cb700fbf73dd4f32aff34a2996fb5b0c, licence CC-BY-4.0. Its size and the
  look of its layout taken as the plan of our own: its track drawn again and its cars made in OVGrid's pieces, its train run
  by OVGrid's own physics (`src/build/track.js`); nothing of its mesh or its animation used.
- The ride kind's playground roundabout (`src/build/kinds/ride-gen.js`, its three styles; stood by `src/build/park.js` and by whoever
  stands the piece): «carousels» by TeenWolf (Sketchfab: Teen-Wolf),
  https://sketchfab.com/3d-models/carousels-b309e6b1b99d4b0983699c8aeec36817, licence CC-BY-4.0. Rebuilt with OVGrid's pieces,
  the model taken as the plan, at a seventh of its size: its three roundabouts' decks, posts, rails, canopy and bowl from its
  measurements, in its colourings; its materials the bank's.
- `assets/builds/jet.json` (`tools/build-jet.js`, `tools/jet-outside.js`): «Cartoon Low Poly Private Jet» by antonmoek
  (Sketchfab: antonmoek), https://sketchfab.com/3d-models/cartoon-low-poly-private-jet-d34c32118cd14bd18e3ced888f6f3d70.
  Rebuilt with OVGrid's pieces, the model taken as the plan, coarser, at 5.75 times its size: its fuselage's rings, its
  windscreen and windows, its wings, fin, tailplane and engines from its measurements, in its flat colours; its window
  panes, wheels, floor, seats, tables, panel and lights OVGrid's own.
- `assets/builds/nave.json` (`tools/build-nave.js`): «low poly space ship» by chrisonciuconcepts (Sketchfab:
  chrisonciuconcepts), https://sketchfab.com/3d-models/low-poly-space-ship-587941c9c11742c6b82dfb99e7b210b9, licence
  CC-BY-4.0. Rethought with OVGrid's pieces, the model taken as the plan, at four times its size for one seated and
  standing under its canopy: its hull, nose, wings and fins from its own corners, in its colours; its seat, panel, yoke,
  legs, engines' cores, exhausts and lamps OVGrid's own. Its triangles frozen for its test: `tests/build/nave-model.json`.
- `assets/builds/yate.json` (`tools/build-yate.js`): «Yate» by vicente betoret ferrero,
  https://sketchfab.com/3d-models/yate-38cd0b9138c64c4fa5fb125c5f6796f6. Rebuilt with OVGrid's pieces,
  the model taken as the plan, its rooms, doors, lights and fittings OVGrid's own, in the bank's
  materials.
- `assets/builds/mansion.json` (`tools/build-mansion.js`): «Low poly mansion / house» by Rudemice,
  https://sketchfab.com/3d-models/low-poly-mansion-house-db4bb90078a54e6684e6abfa1d557952. Rebuilt with
  OVGrid's pieces, the model taken as the plan, its lamps, doors, gates, fire, fountain and furniture
  OVGrid's own.
- `assets/builds/modern-home.json` (`tools/build-modern-home.js`): «Modern Home» by Ciolan-T. Sebastian,
  https://sketchfab.com/3d-models/modern-home-7054d2d8710b4213ad3857c1e37e57ec. Rebuilt with OVGrid's
  pieces, the model taken as the plan, its lamps, doors, garage door and furniture OVGrid's own.
- `assets/builds/villa.json` (`tools/build-villa.js`): «Modern luxury villa house building home» by
  zigurat architecture studio,
  https://sketchfab.com/3d-models/modern-luxury-villa-house-building-home-c2070d21f4e749b9806adbbd68b637d7.
  Rebuilt with OVGrid's pieces, the model taken as the plan, its lamps, doors, stair and furniture
  OVGrid's own.
- The villas of `tools/build-villas.js`, each rebuilt with OVGrid's pieces from its model taken as the
  plan, its lamps, doors, stairs and furniture OVGrid's own:
  - `assets/builds/villa-a.json`: «Modern luxury villa house building home» by zigurat architecture
    studio,
    https://sketchfab.com/3d-models/modern-luxury-villa-house-building-home-10eaf594aa1a457cab216ec646b58910;
  - `assets/builds/villa-b.json`, `villa-c.json`, `villa-d.json` and `villa-e.json`: four models named
    «modern luxury villa house building design» by zigurat architecture studio,
    https://sketchfab.com/3d-models/modern-luxury-villa-house-building-design-c9aad5b0f9694459b6b98a7537b14eec,
    https://sketchfab.com/3d-models/modern-luxury-villa-house-building-design-70ff46900a704024ae8ed8cbb1577e97,
    https://sketchfab.com/3d-models/modern-luxury-villa-house-building-design-81f9c9ee60d84b078713f7353b3bc3af
    and https://sketchfab.com/3d-models/modern-luxury-villa-house-building-design-8a6362b955654d5c93125d20ad46d535;
  - `assets/builds/villa-f.json` and `villa-g.json`: two models named «Modern luxury villa house
    building with pool» by saeedakbari (Sketchfab: saakbary64, as the models downloaded record it; their
    pages are now under zigurat architecture studio),
    https://sketchfab.com/3d-models/modern-luxury-villa-house-building-with-pool-d31a2455d0024039b36207658a6c6e17
    and https://sketchfab.com/3d-models/modern-luxury-villa-house-building-with-pool-1e36279ffc4e43c997c627cfa41752f0;
  - `assets/builds/villa-h.json`: «Modern Building» by Sunny,
    https://sketchfab.com/3d-models/modern-building-c2fa0581f220437c99ad82f33a4854cc;
  - `assets/builds/villa-i.json`: «House - Stone Cabin - Modern Log Cabin 03» by MarMel-Bali,
    https://sketchfab.com/3d-models/house-stone-cabin-modern-log-cabin-03-9e9195dc0a6f44b2baea0def83602dc7.
