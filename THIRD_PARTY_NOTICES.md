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

## Second Life's viewer

The 2011 AOs (tools/import-ao.js, tools/avatar/sl-anim.js) are read in the `.anim` format as the
Second Life viewer reads it (Firestorm's `indra/llcharacter/llkeyframemotion.cpp`, LGPL 2.1), and
retargeted from the 2011 ("base") joints' offsets of its `avatar_skeleton.xml`. No code of the viewer
is in OVGrid. The animations themselves are their creators': imported on this machine only, never
published.

## Assets with their own notices

- `assets/avatar/` — Decentraland's two base bodies, today's outfit, the locomotion clips and the
  common emotes it keeps (sitting): Apache License 2.0, with its LICENSE and NOTICE.
- `assets/avatar/clips/mixamo/` — fourteen animations from Mixamo (Adobe), retargeted onto our
  skeleton (tools/build-avatar-animations.js): used inside OVGrid as game assets under Adobe's
  Mixamo terms, never offered as files to download nor redistributed on their own.
- The avatar library — `assets/avatar/library/` (out of git, made by tools/build-avatar-library.js),
  published at assets.ovgrid.com/avatar/v1/ — Decentraland's bodies, wearables, face features and
  thumbnails from decentraland/avatar-assets, their meshes fitted and quantised and their maps in
  KTX2, and the common emotes of decentraland/unity-explorer (`animations/dcl/`): Apache License 2.0,
  © 2019 Metaverse Holdings Ltd., with its LICENSE and NOTICE beside it. No
  trademark rights are granted (§6): what bears a brand or a mark is left out, and artwork licensed
  from its artists to a collection rather than to Decentraland (docs/avatar-system.md).
- `assets/wasm/` — Binomial's Basis Universal transcoder: Apache License 2.0, with its LICENSE and
  NOTICE.
