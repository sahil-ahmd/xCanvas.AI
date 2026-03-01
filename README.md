# xCanvas.AI — High-Level Design

> AI-powered canvas tool for generating pixel-perfect mobile UI from natural language prompts.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Auth | Kinde Auth |
| Database | MongoDB via Prisma ORM |
| AI | Gemini Flash Lite via OpenRouter AI SDK |
| Background Jobs | Inngest |
| Screenshot | Puppeteer + @sparticuz/chromium-min |
| State Management | TanStack React Query |
| UI | shadcn/ui + Tailwind CSS |
| Canvas | react-zoom-pan-pinch |
| Theming | next-themes |

---

## Folder Structure

```
xCanvas.AI/
├── app/
│   ├── (routes)/
│   │   ├── _common/
│   │   │   └── Header.tsx              # Global header — theme toggle + Kinde auth
│   │   └── p/
│   │       └── [id]/
│   │           └── page.tsx            # Project canvas page
│   ├── api/
│   │   ├── project/
│   │   │   └── [id]/
│   │   │       └── route.ts            # PATCH — update project theme
│   │   ├── screenshot/
│   │   │   └── route.ts                # POST — capture canvas HTML as PNG / save thumbnail
│   │   └── inngest/
│   │       └── route.ts                # Inngest webhook handler
│   └── layout.tsx                      # Root layout — <Toaster />, providers
│
├── components/
│   ├── canvas/
│   │   ├── canvas.tsx                  # Main canvas orchestrator
│   │   ├── canvas-controls.tsx         # Zoom in/out, tool switcher
│   │   ├── canvas-floating-toolbar.tsx # Save theme + screenshot buttons
│   │   ├── canvas-loader.tsx           # Overlay with loading status
│   │   ├── device-frame.tsx            # Phone frame wrapping HTML iframe
│   │   ├── frame-skeleton.tsx          # Skeleton while frame loads
│   │   └── html-dialog.tsx             # View/edit raw HTML dialog
│   ├── logo.tsx
│   └── ui/                             # shadcn/ui components
│
├── context/
│   └── canvas-provider.tsx             # Canvas state — frames, theme, loadingStatus
│
├── hooks/
│   └── use-update-project.ts           # React Query mutation — update project theme
│
├── inngest/
│   └── functions.ts                    # Inngest background job definitions
│
├── lib/
│   ├── prisma.ts                       # Prisma client singleton
│   └── utils.ts                        # cn() and helpers
│
├── constant/
│   └── canvas.ts                       # TOOL_MODE_ENUM, type definitions
│
├── types/
│   └── index.ts                        # Shared TypeScript types
│
└── prisma/
    └── schema.prisma                   # MongoDB schema — Project, User, Frame models
```

---

## API Routes

| Method | Route | Auth | Description |
|---|---|---|---|
| `PATCH` | `/api/project/[id]` | ✅ Kinde | Update project theme |
| `POST` | `/api/screenshot` | ✅ Kinde | Render HTML → PNG, optionally save as thumbnail |
| `POST` | `/api/inngest` | Inngest | Background job webhook handler |

---

## Data Flow

### 1. User Generates UI (AI Prompt → Canvas Frame)
```
User types prompt
  → AI SDK calls Gemini Flash Lite via OpenRouter
    → Inngest background job queued
      → HTML generated for each screen
        → canvas-provider updates frames[]
          → DeviceFrame renders HTML in isolated iframe
            → loadingStatus: "generating" → "completed"
```

### 2. Auto-Save Thumbnail
```
loadingStatus === "completed"
  → Canvas.tsx useEffect triggers
    → getCanvasHtmlContent() — extracts outerHTML + all CSS rules
      → POST /api/screenshot { html, width, height, projectId }
        → Puppeteer launches (chromium-min on Vercel / puppeteer locally)
          → page.setContent(html) → page.screenshot() → PNG buffer
            → Prisma: project.update({ thumbnail: base64 })
              → toast.success("Thumbnail Saved!")
```

### 3. Manual Screenshot Download
```
User clicks Screenshot button
  → handleScreenShot()
    → POST /api/screenshot { html, width, height }  ← no projectId
      → Returns raw PNG blob
        → Browser download triggered as .png file
          → toast.success("Screenshot downloaded")
```

### 4. Theme Update
```
User selects theme → clicks Save
  → useUpdateProject.mutate(themeId)
    → PATCH /api/project/[id] { themeId }
      → Prisma: project.update({ theme: themeId })
        → toast.success("Project Updated")
```

---

## Component Hierarchy

```
RootLayout
└── ThemeProvider (next-themes)
    └── QueryClientProvider (TanStack)
        └── Toaster (sonner)
            ├── Header
            │   ├── Logo
            │   ├── ThemeToggle (Sun/Moon — mounted guard)
            │   └── UserDropdown (Kinde Avatar + Logout)
            │
            └── ProjectPage (/p/[id])
                └── CanvasProvider (context)
                    └── Canvas
                        ├── CanvasFloatingToolbar
                        │   ├── SaveThemeButton → useUpdateProject
                        │   └── ScreenshotButton → handleScreenShot
                        ├── CanvasLoader (overlay)
                        ├── TransformWrapper (zoom/pan)
                        │   ├── TransformComponent
                        │   │   └── DeviceFrame[] (per frame)
                        │   │       └── iframe (isolated HTML + theme vars)
                        │   └── CanvasControls (zoom %, hand/select tool)
                        └── HtmlDialog (view raw HTML)
```

---

## Database Schema (Prisma / MongoDB)

```prisma
model Project {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  userId    String
  name      String
  theme     String?           // themeId applied to canvas
  thumbnail String?           // base64 PNG saved on generation
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  frames    Frame[]
}

model Frame {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  projectId   String   @db.ObjectId
  title       String
  htmlContent String
  project     Project  @relation(fields: [projectId], references: [id])
}
```

---

## Environment Variables

```env
# Auth
KINDE_CLIENT_ID=
KINDE_CLIENT_SECRET=
KINDE_ISSUER_URL=
KINDE_SITE_URL=
KINDE_POST_LOGOUT_REDIRECT_URL=
KINDE_POST_LOGIN_REDIRECT_URL=

# Database
DATABASE_URL=              # MongoDB connection string

# AI
OPENROUTER_API_KEY=        # OpenRouter → Gemini Flash Lite

# Background Jobs
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=
```

---

## Deployment Notes

- **Local**: Uses full `puppeteer` (bundled Chromium)
- **Vercel**: Uses `puppeteer-core` + `@sparticuz/chromium-min` with remote binary URL
- Chromium path is **cached** across requests to avoid re-downloading on every invocation
- Inngest requires `npx inngest-cli@latest dev` running locally for background jobs
