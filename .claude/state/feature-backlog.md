---
total: 140
generated_at: 2026-04-09
source: https://higgsfield.ai
---

# memacta Feature Backlog

Exhaustive categorized backlog for the memacta project (Next.js clone of higgsfield.ai). Priorities P0-P8 drive build order. P0 is self-seeded scaffolding (not on higgsfield); P1-P7 mirror higgsfield surface area; P8 is deploy.

## P0 - Foundation (self-seeded, not on higgsfield)

| id | name | priority | description | source_url |
|---|---|---|---|---|
| nextjs-scaffold | Next.js 15 App Router Scaffold | P0 | Bootstrap Next.js 15 project with TypeScript, ESLint, app router | self |
| tailwind-shadcn | Tailwind + shadcn/ui Setup | P0 | Install Tailwind v4, shadcn components, base theme tokens | self |
| prisma-sqlite | Prisma + SQLite DB | P0 | Prisma schema, migrations, SQLite dev database | self |
| nextauth-stub | NextAuth Auth Stub | P0 | NextAuth with credentials + OAuth placeholder | self |
| dark-shell-nav | Dark Shell + Top Nav | P0 | Dark app shell with top nav: Home/Create/Library/Community/Pricing | self |
| credit-display-stub | Credit Display Stub | P0 | Header credit balance indicator wired to user session | self |
| ai-provider-interface | lib/ai Provider Interface | P0 | Pluggable AI adapter interface + mock adapter for local dev | self |
| vitest-config | Vitest Unit Test Config | P0 | Vitest setup with sample tests | self |
| playwright-config | Playwright E2E Config | P0 | Playwright config with smoke test runner | self |

## P1 - Core Create (text/image/video generation)

| id | name | priority | description | source_url |
|---|---|---|---|---|
| create-video | Create Video Page | P1 | Unified text/image-to-video generation page | https://higgsfield.ai/create/video |
| text-to-video | Text-to-Video | P1 | Generate video from text prompt | https://higgsfield.ai/create/video |
| image-to-video | Image-to-Video | P1 | Generate video from uploaded image + prompt | https://higgsfield.ai/create/video |
| create-image | Create Image Page | P1 | Unified text-to-image generation page | https://higgsfield.ai/image/soul |
| model-picker | Model Picker | P1 | Selector for Kling 3.0, Sora 2, Veo 3.1, WAN 2.6, etc. | https://higgsfield.ai/create/video |
| prompt-box-presets | Prompt Box with Presets | P1 | Prompt input with style/shot/mood preset chips | https://higgsfield.ai/create/video |
| model-kling-3 | Kling 3.0 Adapter | P1 | Video model adapter for Kling 3.0 | https://higgsfield.ai/kling-3 |
| model-kling-25-turbo | Kling 2.5 Turbo Adapter | P1 | Fast Kling variant adapter | https://higgsfield.ai/kling |
| model-kling-o1 | Kling o1 Adapter | P1 | Kling o1 video model adapter | https://higgsfield.ai/kling-o1-video |
| model-sora-2 | Sora 2 Adapter | P1 | OpenAI Sora 2 video adapter | https://higgsfield.ai/sora2-ai-video |
| model-veo-31 | Veo 3.1 Adapter | P1 | Google Veo 3.1 adapter | https://higgsfield.ai/veo3.1 |
| model-veo-3 | Veo 3 Adapter | P1 | Google Veo 3 preview adapter | https://higgsfield.ai/create/video?model=veo-3-preview |
| model-wan-26 | WAN 2.6 Adapter | P1 | WAN 2.6 video model adapter | https://higgsfield.ai/wan-2.6 |
| model-minimax-hailuo | MiniMax Hailuo 02 Adapter | P1 | MiniMax Hailuo 02 video adapter | https://higgsfield.ai/create/video?model=minimax |
| model-seedance-20 | Seedance 2.0 Adapter | P1 | Seedance 2.0 video adapter | https://higgsfield.ai/seedance/2.0 |
| model-seedance-pro | Seedance Pro Adapter | P1 | Seedance Pro adapter | https://higgsfield.ai/create/video?model=seedance_pro |
| model-soul-v2 | Soul 2.0 Image Model | P1 | Soul 2.0 text-to-image adapter | https://higgsfield.ai/image/soul-v2 |
| model-nano-banana-pro | Nano Banana Pro | P1 | Nano Banana Pro image model | https://higgsfield.ai/nano-banana-pro |
| model-nano-banana-2 | Nano Banana 2 | P1 | Nano Banana 2 image model | https://higgsfield.ai/nano-banana-2 |
| model-wan-25-image | WAN 2.5 Image | P1 | WAN 2.5 image gen adapter | https://higgsfield.ai/image/wan2 |
| model-seedream-4 | Seedream 4.0 | P1 | Seedream 4.0 image adapter | https://higgsfield.ai/image/seedream |
| model-gpt-image-15 | GPT Image 1.5 | P1 | GPT Image 1.5 adapter | https://higgsfield.ai/gpt-1.5 |
| model-flux-kontext | Flux Kontext | P1 | Flux Kontext image adapter | https://higgsfield.ai/image/kontext |
| model-flux-2 | Flux 2 | P1 | Flux 2 image adapter | https://higgsfield.ai/flux-2-intro |
| higgsfield-chat | Higgsfield Chat | P1 | Conversational multi-tool creation chat | https://higgsfield.ai/chat-intro |

## P2 - Identity & Character

| id | name | priority | description | source_url |
|---|---|---|---|---|
| soul-id | Soul ID Character | P2 | Train a persistent character identity | https://higgsfield.ai/character |
| soul-moodboard | Soul Moodboard | P2 | Moodboard-driven style reference system | https://higgsfield.ai/moodboard |
| character-swap-2 | Character Swap 2.0 | P2 | Swap characters between videos/images | https://higgsfield.ai/app/character-swap |
| face-swap | Face Swap | P2 | Image face swap app | https://higgsfield.ai/app/face-swap |
| video-face-swap | Video Face Swap | P2 | Face swap across video frames | https://higgsfield.ai/app/video-face-swap |
| outfit-swap | Outfit Swap | P2 | Swap outfits on subjects | https://higgsfield.ai/apps |
| photodump | Photodump Studio | P2 | Bulk photo-to-content studio | https://higgsfield.ai/photodump-studio |
| soul-cast | Soul Cast | P2 | Casting/character ensemble tool | https://higgsfield.ai/soul-cast-intro |
| ai-influencer | AI Influencer Page | P2 | Landing/workflow for AI influencer creation | https://higgsfield.ai/ai-influencer |

## P3 - Editing & Enhancement

| id | name | priority | description | source_url |
|---|---|---|---|---|
| edit-image | Edit Image | P3 | Image edit workspace with inpaint model | https://higgsfield.ai/edit?model=nano_banana_pro_inpaint |
| edit-video | Edit Video | P3 | Video edit workspace | https://higgsfield.ai/create/edit |
| draw-to-edit | Draw to Edit | P3 | Mask-draw image inpaint | https://higgsfield.ai/create/video?image-inpaint=true |
| draw-to-video | Draw to Video | P3 | Mask-draw video inpaint | https://higgsfield.ai/create/video?video-inpaint=true |
| upscale | Upscale | P3 | Topaz-style image/video upscaler | https://higgsfield.ai/upscale |
| image-bg-remover | Image Background Remover | P3 | Remove background from image | https://higgsfield.ai/app/image-background-remover |
| video-bg-remover | Video Background Remover | P3 | Remove background from video | https://higgsfield.ai/app/video-background-remover |
| color-grading | Color Grading | P3 | Color grade videos/images | https://higgsfield.ai/app/color-grading |
| inpaint | Inpaint | P3 | Region inpaint editor | https://higgsfield.ai/edit?model=nano_banana_pro_inpaint |
| lipsync-studio | Lipsync Studio | P3 | Lipsync audio to video avatar | https://higgsfield.ai/lipsync-studio |
| talking-avatar | Talking Avatar | P3 | Talking head avatar generator | https://higgsfield.ai/lipsync-studio |
| kling-avatars-2 | Kling Avatars 2.0 | P3 | Kling-based avatar system | https://higgsfield.ai/lipsync-studio |
| motion-control | Motion Control (Kling 3) | P3 | 30s character motion control | https://higgsfield.ai/kling-3-motion-control |
| multi-reference | Multi Reference | P3 | Multi-image reference editing | https://higgsfield.ai/edit?model=multi |
| banana-placement | Banana Placement | P3 | Object placement via Nano Banana | https://higgsfield.ai/image/nano_banana |
| product-placement | Product Placement | P3 | Canvas-based product placement | https://higgsfield.ai/edit?model=canvas |
| clipcut | ClipCut | P3 | Auto clip-cutting tool | https://higgsfield.ai/apps |
| transitions | Transitions App | P3 | Transition effects app | https://higgsfield.ai/app/transitions |
| expand-image | Expand Image | P3 | Outpaint / canvas expand | https://higgsfield.ai/app/expand-image |
| skin-enhancer | Skin Enhancer | P3 | Skin retouch enhancement | https://higgsfield.ai/app/skin-enhancer |
| relight | Relight | P3 | Relight subjects in image | https://higgsfield.ai/app/relight |
| recast | Recast | P3 | Recast scene content | https://higgsfield.ai/app/recast |
| angles-2 | Angles 2.0 | P3 | Change camera angle of subject | https://higgsfield.ai/app/angles |
| shots | Shots | P3 | Cinematic shot variations | https://higgsfield.ai/app/shots |

## P4 - Effects & Templates

| id | name | priority | description | source_url |
|---|---|---|---|---|
| effects-grid | Visual Effects Grid | P4 | 100+ visual effect template gallery | https://higgsfield.ai/effects |
| trending-templates | Trending Templates | P4 | Curated trending template row | https://higgsfield.ai/ |
| effect-raven-transition | Raven Transition | P4 | Effect preset | https://higgsfield.ai/effects |
| effect-air-bending | Air Bending | P4 | Effect preset | https://higgsfield.ai/effects |
| effect-animalization | Animalization | P4 | Effect preset | https://higgsfield.ai/effects |
| effect-water-bending | Water Bending | P4 | Effect preset | https://higgsfield.ai/effects |
| effect-earth-zoom-out | Earth Zoom Out | P4 | Effect preset | https://higgsfield.ai/effects |
| effect-earth-wave | Earth Wave | P4 | Effect preset | https://higgsfield.ai/effects |
| effect-giant-grab | Giant Grab | P4 | Effect preset | https://higgsfield.ai/effects |
| effect-shadow-smoke | Shadow Smoke | P4 | Effect preset | https://higgsfield.ai/effects |
| effect-splash-transition | Splash Transition | P4 | Effect preset | https://higgsfield.ai/effects |
| effect-firelava | Firelava | P4 | Effect preset | https://higgsfield.ai/effects |
| effect-explosion | Explosion | P4 | Effect preset | https://higgsfield.ai/effects |
| effect-flame-on | Flame On | P4 | Effect preset | https://higgsfield.ai/effects |
| effect-wireframe | Wireframe | P4 | Effect preset | https://higgsfield.ai/effects |
| effect-xray | X-Ray | P4 | Effect preset | https://higgsfield.ai/effects |
| effect-glitch | Glitch | P4 | Effect preset | https://higgsfield.ai/effects |
| effect-portal | Portal | P4 | Effect preset | https://higgsfield.ai/effects |
| effect-multiverse | Multiverse | P4 | Effect preset | https://higgsfield.ai/effects |
| effect-disintegration | Disintegration | P4 | Effect preset | https://higgsfield.ai/effects |
| effect-hero-flight | Hero Flight | P4 | Effect preset | https://higgsfield.ai/effects |
| effect-thunder-god | Thunder God | P4 | Effect preset | https://higgsfield.ai/effects |
| effect-plasma-explosion | Plasma Explosion | P4 | Effect preset | https://higgsfield.ai/effects |
| effect-cyborg | Cyborg | P4 | Effect preset | https://higgsfield.ai/effects |
| effect-freezing | Freezing | P4 | Effect preset | https://higgsfield.ai/effects |
| effect-werewolf | Werewolf | P4 | Effect preset | https://higgsfield.ai/effects |
| effect-visor-x | Visor X | P4 | Effect preset | https://higgsfield.ai/effects |
| effect-levitation | Levitation | P4 | Effect preset | https://higgsfield.ai/effects |
| mixed-media-presets | Mixed Media Presets | P4 | 40+ mixed-media style presets | https://higgsfield.ai/mixed-media-community |
| app-3d-render | 3D Render | P4 | 3D render effect app | https://higgsfield.ai/apps |
| app-3d-rotation | 3D Rotation | P4 | 3D rotation effect | https://higgsfield.ai/apps |
| app-3d-figure | 3D Figure | P4 | 3D figurine effect | https://higgsfield.ai/apps |
| app-bullet-time-scene | Bullet Time Scene | P4 | Bullet time effect | https://higgsfield.ai/apps |
| app-bullet-time-white | Bullet Time White | P4 | White bullet time effect | https://higgsfield.ai/apps |
| app-chameleon | Chameleon | P4 | Chameleon effect | https://higgsfield.ai/apps |
| app-macro-scene | Macro Scene | P4 | Macro scene effect | https://higgsfield.ai/apps |
| app-macroshot-product | Macroshot Product | P4 | Product macro shot | https://higgsfield.ai/apps |
| app-meme-generator | Meme Generator | P4 | AI meme generator | https://higgsfield.ai/app/meme-generator |
| app-headshot-generator | AI Headshot Generator | P4 | Headshot generator | https://higgsfield.ai/app/ai-headshot-generator |
| app-sticker-matchcut | Sticker Match Cut | P4 | Sticker match-cut effect | https://higgsfield.ai/app/sticker-matchcut |
| app-game-dump | Game Dump | P4 | Game aesthetic effect | https://higgsfield.ai/app/game-dump |
| app-plushies | Plushies | P4 | Plushie effect | https://higgsfield.ai/app/plushies |
| app-micro-beasts | Micro-Beasts | P4 | Surrounded by animals effect | https://higgsfield.ai/app/surrounded-by-animals |
| app-signboard | Signboard | P4 | Signboard effect | https://higgsfield.ai/app/signboard |
| app-whats-next | What's Next? | P4 | Narrative continuation tool | https://higgsfield.ai/app/whats-next |
| app-ai-stylist | AI Stylist | P4 | Fashion stylist app | https://higgsfield.ai/app/ai-stylist |
| app-style-snap | Style Snap | P4 | Outfit style snap | https://higgsfield.ai/app/style-snap |
| app-fashion-factory | Fashion Factory | P4 | Fashion batch factory | https://higgsfield.ai/fashion-factory |
| app-commercial-faces | Commercial Faces | P4 | Commercial headshot faces | https://higgsfield.ai/app/commercial-faces |
| asmr-addon | ASMR Add-On | P4 | ASMR add-on effect | https://higgsfield.ai/apps |
| asmr-classic | ASMR Classic | P4 | Classic ASMR template | https://higgsfield.ai/apps |
| ad-click-to-ad | Click to Ad | P4 | Ad template | https://higgsfield.ai/apps |
| ad-billboard | Billboard Ad | P4 | Billboard ad effect | https://higgsfield.ai/apps |
| ad-truck | Truck Ad | P4 | Truck ad effect | https://higgsfield.ai/apps |
| ad-graffiti | Graffiti Ad | P4 | Graffiti ad effect | https://higgsfield.ai/apps |
| themed-comic-book | Comic Book | P4 | Comic book effect | https://higgsfield.ai/apps |
| themed-renaissance | Renaissance | P4 | Renaissance style effect | https://higgsfield.ai/apps |
| themed-sketch-to-real | Sketch-to-Real | P4 | Sketch to realistic | https://higgsfield.ai/apps |
| themed-pixel-game | Pixel Game | P4 | Pixel game style | https://higgsfield.ai/apps |

## P5 - Cinema Studio

| id | name | priority | description | source_url |
|---|---|---|---|---|
| cinema-studio-3 | Cinema Studio 3.0 Timeline | P5 | Multi-shot timeline editor with scene sequencing | https://higgsfield.ai/cinema-studio-3-community |
| cinema-studio-25 | Cinema Studio 2.5 | P5 | Legacy Cinema Studio variant | https://higgsfield.ai/cinema-studio |
| soul-cinema | Soul Cinema | P5 | Cinema workflow tied to Soul character | https://higgsfield.ai/soul-cinema-community |
| cinematic-video-generator | Cinematic Video Generator | P5 | Cinematic presets pipeline | https://higgsfield.ai/cinematic-video-generator |

## P6 - Library, Community & Profiles

| id | name | priority | description | source_url |
|---|---|---|---|---|
| library-tabs | Library Tabs | P6 | My Library with Image/Video/Project tabs | https://higgsfield.ai/library/image |
| community-gallery | Community Gallery | P6 | Public gallery of community generations | https://higgsfield.ai/community |
| soul-cinema-community | Soul Cinema Community | P6 | Soul Cinema community gallery | https://higgsfield.ai/soul-cinema-community |
| soul-community | Soul 2.0 Community | P6 | Soul 2.0 gallery | https://higgsfield.ai/soul-community |
| mixed-media-community | Mixed Media Gallery | P6 | Mixed-media gallery | https://higgsfield.ai/mixed-media-community |
| creator-profile | Creator Profiles | P6 | Public user profile pages | https://higgsfield.ai/profile |
| likes | Likes & Reactions | P6 | Like/heart community posts | https://higgsfield.ai/community |
| project-submit | Project Submission | P6 | Submit project to gallery | https://higgsfield.ai/project/submit |
| contests | Contests | P6 | Creative contests listing | https://higgsfield.ai/contests |
| creative-challenge | Creative Challenge | P6 | Creative challenge page | https://higgsfield.ai/creative-challenge |
| blog | Blog | P6 | Blog index + posts | https://higgsfield.ai/blog |
| original-series | Original Series (Zephyr) | P6 | Showcase original series page | https://higgsfield.ai/original-series |
| explore-home | Explore Home | P6 | Homepage explore feed | https://higgsfield.ai/ |

## P7 - Pricing, Credits & Billing

| id | name | priority | description | source_url |
|---|---|---|---|---|
| pricing-page | Pricing Page | P7 | Public pricing tiers page | https://higgsfield.ai/pricing |
| credit-purchase | Credit Purchase Flow | P7 | Buy credit packs | https://higgsfield.ai/pricing |
| stripe-stub | Stripe-Ready Stub | P7 | Stripe checkout stub wired to plans | self |
| team-plan | Team Plan | P7 | Team/multi-seat plan page | https://higgsfield.ai/team-plan |
| enterprise | Enterprise | P7 | Enterprise plan landing | https://higgsfield.ai/enterprise |
| trust-page | Trust Page | P7 | Trust & safety page | https://higgsfield.ai/trust |
| privacy-policy | Privacy Policy | P7 | Privacy policy page | https://higgsfield.ai/privacy-policy |
| terms | Terms of Use | P7 | Terms of use agreement | https://higgsfield.ai/terms-of-use-agreement |
| cookie-notice | Cookie Notice | P7 | Cookie notice page | https://higgsfield.ai/cookie-notice |
| contact | Contact Page | P7 | Contact form page | https://higgsfield.ai/contact |
| about | About Page | P7 | About company page | https://higgsfield.ai/about |

## P8 - Deploy & Smoke Tests

| id | name | priority | description | source_url |
|---|---|---|---|---|
| vercel-deploy | Vercel Deployment | P8 | Deploy to Vercel with env vars | self |
| smoke-tests | Playwright Smoke Tests | P8 | E2E smoke test suite on deployed build | self |
| ci-pipeline | CI Pipeline | P8 | GitHub Actions running unit + e2e | self |
