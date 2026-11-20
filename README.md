# Anthroprime.ai — Global GPU Infrastructure. One Partner.

Multi-page website for Anthroprime.ai — a **GPU infrastructure provider** offering dedicated GPU capacity, clusters, and managed AI infrastructure. Rebuilt locally with the navy, indigo, warm ivory and muted gold palette of [Anthroprime Technology](https://anthroprime.com/).

The experience combines editorial typography with a real-time 3D GPU core, orbital particles, animated rack illustrations, an interactive deployment map, scroll reveals, and GPU comparison tools. Light/dark themes and a global motion control are included. The GPU Lab adds five interactive learning experiences, two generated editorial images, and educational links throughout the homepage and Resources.

## Architecture

Vite 7 + React 18 + Tailwind CSS 4 + Framer Motion + **react-router-dom** + **three.js / @react-three/fiber** + Lucide.

### Routes

| Route | Page |
|---|---|
| `/` | Home — AI Infrastructure-led hero with the hub-and-spoke diagram and claims strip, then GPU offerings, clusters, deployment process, regional planning map, solutions and capacity requests |
| `/guides`, `/guides/:slug`, `/compare/:slug`, `/glossary`, `/glossary/:slug` | SEO content hub: GPU comparisons (H100 vs H200, H200 vs B200, A100 vs H100), guides (70B memory sizing with calculator, choosing inference GPUs, bare metal vs managed, GB200 NVL72) and glossary (NVLink, InfiniBand vs RoCE, HBM3e, MIG, liquid cooling). Content lives in `src/data/knowledge.js`; memory maths in `src/data/llm-memory.js`. Add an entry there and it is routed, prerendered, added to the sitemap and given structured data automatically |
| `/infrastructure` | AI Infrastructure — hub-and-spoke collaborator model (brief of 18 Nov 2026): interactive diagram, hub roles, eight collaborator types, services, five-step process, entry paths, **Become a collaborator** form (Netlify form `collaborator`), FAQ. Content lives in `src/data/infrastructure.js` |
| `/marketplace` | Legacy URL only: redirects to `/#capacity`. The marketplace page and third-party listings have been removed |
| `/gpu/:slug` | GPU detail pages: `h100` `h200` `b200` `gb200` `a100` `l40s` — datasheet specs, variants, reference node configs, direct capacity requests |
| `/solutions` | Solutions index (6 solutions) |
| `/solutions/:slug` | Solution detail: `training` `inference` `clusters` `private-cloud` `hpc` `sovereign` |
| `/services` | Services — GPU Capacity & Provisioning, Advisory, Cluster Deployment, Managed AI Infrastructure, Security (anchored) |
| `/resources` | Interactive GPU specification comparison + deployment options + guides |
| `/gpu-lab` | GPU architecture explorer, parallel scheduling simulator, model-weight calculator, training/inference walkthroughs, and knowledge check |
| `/about` | Infrastructure practice, values, and entity information |
| `/contact` | Contact (WhatsApp / email / response expectations) |
| `/find-capacity` | Find GPU Capacity form (primary CTA destination; accepts prefill state from GPU, solution and comparison pages) |
| `*` | 404 |

### Data layer (`src/data/`)

- **`gpus.js`** — GPU spec database from NVIDIA public datasheets: memory sizes, bandwidth, FP64/FP32/TF32/FP16/FP8/FP4 TFLOPS, NVLink generations (900 GB/s / 1.8 TB/s), TDP, MIG, form factors, and HGX/DGX-class reference node configurations.
- `solutions.js`, `services.js` — page content.

> **No pricing is published anywhere on the site.** Anthroprime confirms configurations, availability and commercial terms directly for each request. `npm test` guards against published rates and unsupported capacity claims.

### 3D & motion

- `InfrastructureScene` — lazy-loaded react-three-fiber GPU core, metallic chip geometry, orbital rings and a particle field. React error boundary provides a static fallback. Rendering pauses outside the viewport and uses demand rendering when motion is paused.
- CSS server racks, GPU die graphics, an SVG sourcing map, page transitions, a typewriter headline, scroll progress, staggered reveals, and interactive hovers.
- `MotionSettings` — system reduced-motion preferences plus a header pause/resume control. `src/theme.js` persists theme preference locally.

### GPU Lab

- `src/data/learning.js` holds the educational content and pure calculations, with links to NVIDIA and Hugging Face documentation.
- The parallel simulator is a 32-task abstract scheduler, not a CPU/GPU benchmark. It pauses when offscreen or when the global motion control is paused. Manual stepping works with reduced motion.
- The memory explorer calculates **raw model weights only**: billions of parameters × bits / 8 = decimal GB. It excludes quantization metadata, KV cache, activations, buffers, framework allocations, gradients and optimizer state. It is not a GPU recommendation or a fit guarantee.
- The architecture schematic is conceptual, not a representation of a specific product. Tabs and hotspots support keyboard/touch interaction.
- Generated artwork is stored locally at `public/images/gpu-silicon.jpg` and `public/images/compute-horizon.jpg`. The images do not depict an Anthroprime facility. Exact built-in ImageGen prompts are preserved in [docs/image-prompts.md](docs/image-prompts.md).
- The homepage includes an animated educational FAQ and links into the Lab. Resources guides are live links to the interactive explainers.

### Capacity request flow

GPU details, solution pages and comparison tools can prefill the capacity request form. `src/data/request.js` normalizes GPU aliases and builds the brief.

**The form uses Netlify Forms on production Netlify builds:** visitors review a brief, agree to contact, and choose Send request. Structured details and a readable brief are posted to the registered `gpu-capacity` form. Notification delivery to **hello@anthroprime.com** requires the Netlify project email notification setting. Local builds and deploy previews keep online sending disabled and offer prefilled email, copy, download, and WhatsApp. See [docs/form-email-setup.md](docs/form-email-setup.md) for the exact activation steps. Nothing was deployed or emailed during implementation.

GPU comparison covers hardware specifications rather than third-party supplier offers. The old provider directory and capacity dataset have been removed.

## Positioning compliance

- No ownership claims ("we operate thousands of GPUs" etc. are test-guarded).
- Anthroprime is presented as the GPU provider; requests and deployment discussions go directly to its team.
- No unverified inventory counts, facility ownership claims or guaranteed regional availability are published.
- No rates, price tables or cost claims are published; commercials are quoted per mandate.

## Local development

```bash
npm ci
npm run dev            # http://127.0.0.1:5173
npm run build          # production build
npm run preview        # serve production build at http://127.0.0.1:4173
npm test               # content, data invariants and request behavior checks
```

Both development and preview servers bind to loopback only. No deployment is required to preview locally. The connected Netlify project publishes the main branch at https://anthroprime.ai. Fonts load from Google Fonts; the graphics are generated by application code.

## Existing hosting configuration

- Build: `npm run build` · Publish: `dist` · Node 22.12+ (see `netlify.toml`)
- Every public route is pre-built as `<route>/index.html`; Netlify serves it at `/route/` (and 301s `/route` there), so canonical URLs and the sitemap use the trailing slash
- Unknown URLs: `/* → /404.html 404` (noindex page that boots the SPA). Legacy `/marketplace` 301s to `/#capacity`. All redirects live in `netlify.toml`
- Netlify form: `gpu-capacity` (static detection in `index.html`, honeypot, consent, and structured payload). Enable form detection and configure its email recipient as `hello@anthroprime.com` in the Netlify project before launch.

## Attribution

Accelerator names are the property of their respective owners. Hardware specifications and node configurations are reference information, not a live inventory feed.

---
© 2026 Anthroprime Technology Private Limited

## SEO

- **Prerendered HTML.** `npm run build` also builds `src/entry-server.jsx` for Node and `scripts/build-pages.mjs` renders every public route to full HTML (`dist/<route>/index.html`), so crawlers that do not run JavaScript see the whole page. The browser hydrates that HTML (`src/main.jsx`). Keep first renders deterministic: anything that depends on `window`, the theme or reduced-motion is read in an effect, not during render.
- **Metadata.** Titles (≤ 60 characters) and descriptions (≤ 160) live in `src/data/metadata.js`, one primary query per page.
- **Structured data.** `src/data/structured-data.js` emits JSON-LD per page: Organization, WebSite, WebPage, BreadcrumbList, Service, and FAQPage on `/infrastructure`. It mirrors visible content only: no prices or ratings.
- **Sitemap and robots** are generated with `lastmod` when `SITE_URL` is set (Netlify sets it).
- `npm test` guards all of the above.

## Final production review

Inner pages now include interactive animated diagrams. See [docs/production-readiness.md](docs/production-readiness.md) for the audit, verification scope, and launch configuration. `npm run build` emits route-specific head metadata; set `SITE_URL` to the confirmed public HTTPS origin to add canonical URLs and a sitemap. Capacity requests use explicit review and send, with a local-only fallback. See [email setup](docs/form-email-setup.md).

## Production pipeline

The authorized production destination is the existing `Amit29533/Anthroprime-AI` main branch, connected to Netlify project `anthroprimeai`. Netlify builds the source into `dist`; generated assets are not committed. Secondary routes load on demand, with the navigation and footer retained while loading. GitHub Actions runs a clean installation, build, tests, dependency audit, and retains the build artifact. Netlify form detection and an email notification to `hello@anthroprime.com` were enabled in the project on 16 October 2026.
