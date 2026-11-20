# Manifold, a module of OVGrid

Manifold is the geometry engine OVGrid's solids are worked out with: their booleans, hulls, revolves,
extrudes and smoothing (src/build/kinds/solid.js, solid-worker.js and solid-mesh.js). It is part of
OVGrid's source. It is served from OVGrid's own origin like any other module, and loaded lazily, in
the solids' worker, once the page's first frame is drawn. Nothing is fetched from anywhere else.

- **What it is**: OVGrid's own build of Manifold v3.5.4, made from the library's sources and the
  Clipper2 they pin, with Emscripten 5.0.2, the toolchain manifold-3d 3.5.4 was built with.
  - It holds only what OVGrid's solids call, through OVGrid's own binding, with no embind: plain C
    entry points (tools/manifold/binding.cpp) under the JavaScript the solids call
    (tools/manifold/binding.js).
  - Built small (-Oz, LTO, Closure on its glue, emmalloc, no exceptions, no RTTI, no filesystem),
    with WebAssembly's 128-bit SIMD.
  - Its memory starts at 1 MB and grows as it is needed.
  - Its floating point is kept as Manifold's own build keeps it: no fast-math, no contraction.
- **The same meshes**: every mesh it makes is byte for byte the one manifold-3d 3.5.4 made. That is
  checked on the solids of every build that has them, and on a recipe of every body, way and step:
  49 recipes, 63 meshes, in Bun, Chrome, WebKit and Firefox (tools/manifold/golden.js,
  golden-browsers.js).
- **Files** and their SHA-256:
  - `manifold.js`, 8,971 B, its glue (an ES module):
    `3bf464aaff5f1b9a4f8cd1e3885d2c5cf4b4f0c8df0b30eea2ea9081f22f44c5`
  - `manifold.wasm`, 273,255 B, its WebAssembly, served as `application/wasm` and compiled as it
    streams: `f72a2a77f34fed6e664aef0945224dd866f479d7793c68da534260a5b55730c9`

## Against manifold-3d 3.5.4

Measured on 2026-10-31. Times are medians: 12 fresh loads each, and rounds of the golden recipes taken
in turn with 3.5.4's (24 in Chrome's worker, 16 in Bun).

| | manifold-3d 3.5.4 | OVGrid's |
|---|---|---|
| glue + WebAssembly | 82,371 + 541,470 = 623,841 B | 8,971 + 273,255 = 282,226 B (45 %) |
| gzip -9 | 223,729 B | 111,464 B (50 %) |
| brotli -q 11 | 175,947 B | 92,693 B (53 %) |
| loaded (imported, compiled, set up), Chrome's worker | 9.9 ms | 5.2 ms |
| loaded, Bun | 11.8 ms | 7.1 ms |
| the showcase's 15 solids worked out, Chrome's worker | 91.6 ms | 94.8 ms (+3.5 %) |
| the helicopter's twin's 16, Chrome's worker | 9.2 ms | 7.8 ms (−15 %) |
| all 63 meshes, Chrome's worker | 129.0 ms | 133.2 ms (+3.3 %) |
| all 63 meshes, Bun | 130.3 ms | 130.7 ms |
| linear memory held, loaded | 16.8 MB | 1.0 MB |
| linear memory held, after the 63 meshes | 16.8 MB | 4.1 MB |

Of the showcase's work, 40 % is OVGrid's own JavaScript about Manifold's calls — its uvs (solid-mesh.js
`nearestAlong`, 9.5 %), its surface, its mesh — and the same with either build.

## Building it again

The same bytes each time:

`tools/manifold/build.sh <Emscripten's install/> <manifold> <clipper2> src/manifold`

Then check its meshes against the build it replaces:

`bun tools/manifold/golden.js <old manifold.js> src/manifold/manifold.js --write <recipes.json>`

and in the three browsers, under the GPU lock:

`bun tools/manifold/golden-browsers.js <recipes.json> <old folder> src/manifold`

The old build can come from git: `git show 9e027e6:src/manifold/manifold.js`, with its manifold.wasm
beside it.

## Sources and licences

- **Sources**: Manifold v3.5.4 (https://github.com/elalish/manifold), Clipper2 at
  46f639177fe418f9689e8ddb74f08a870c71f5b4 (https://github.com/AngusJohnson/Clipper2), and Emscripten
  5.0.2's macOS arm64 release. Each is listed with its hashes in tools/manifold/sources.txt.
- **Licences**: Manifold's, Apache-2.0, in `LICENSE`; Clipper2's, the Boost Software License 1.0, in
  `LICENSE-Clipper2`. Neither carries a NOTICE.

Under Bun, the tests and the tools load these same two files, so there is one copy everywhere.

## Author

Esteban Fuster Pozzi (@estebanrfp) - Full Stack JavaScript Developer
