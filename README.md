# 🌿 Solenne — Store Design Checklist & Field Guide (Stage 1)

An interactive, editorial-grade field guide and interactive checklist for designing modern, high-converting e-commerce storefronts on Shopify.

Built with **React 19**, **Vite**, **Tailwind CSS**, and **Express**.

---

## ✨ Features

- **🗺️ 6-Week Master Curriculum**: A detailed 4–6 week stage-by-stage roadmap from admin setup to QA, analytics, portfolio presentation, and client handoff.
  - **Overview**: Stage 1 Master Roadmap & Mindset
  - **Week 1**: Setup and Learning the Shopify Admin
  - **Week 2**: Products, Structured Data, and Product Photography
  - **Week 3**: Building a Brand System in the Theme (Colors, Typography, Layouts)
  - **Week 4**: Homepage, Product Detail Pages (PDP), and Collection Architecture
  - **Week 5**: Secondary Pages, Navigation, Predictive Search, and AI Enhancements
  - **Week 6**: QA, Conversion Metrics, Portfolio Building, and Selling
- **✅ Interactive Progress & Task Checklist**: Mark items as complete with real-time progress calculations saved locally in browser `localStorage`.
- **🎨 Storefront Studio**: Interactive live storefront component previews, section mockups, and layout templates.
- **🖼️ Creative Asset & Prompt Library**: Ready-to-use AI generation prompts for Midjourney / Flux / DALL-E and hand-crafted SVG design assets tailored for the Solenne aesthetic.
- **🔍 Global Search (`⌘K` / `Ctrl+K`)**: Instant full-text search across all weeks, guides, and curriculum tasks.
- **⚡ Ultra-Fast Markdown Rendering**: Powered by `streamdown` for crisp typographic presentation.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework & Build** | [React 19](https://react.dev/), [Vite](https://vitejs.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/), Radix UI Primitives |
| **Routing** | [Wouter](https://github.com/molefrog/wouter) |
| **Icons & UI** | [Lucide React](https://lucide.dev/), Sonner (Toasts) |
| **Content Engine** | Raw Markdown imports, [Streamdown](https://github.com/streamdown) |
| **Server / Production** | Node.js, [Express](https://expressjs.com/), [esbuild](https://esbuild.github.io/) |
| **Package Manager** | `pnpm` (or `npm`) |

---

## 📁 Project Structure

```text
solenne-stage-1/
├── client/                     # Frontend Application
│   ├── index.html              # HTML entry point
│   ├── public/                 # Static public assets (fonts, icons, images)
│   └── src/
│       ├── components/         # UI components, Studio, Asset Library, Map, etc.
│       ├── content/            # Markdown curriculum files (Weeks 1–6 + Prompts)
│       ├── contexts/           # Theme and state providers
│       ├── hooks/              # Custom React hooks
│       ├── lib/                # Utility helpers
│       ├── pages/              # Home view and 404 handler
│       ├── App.tsx             # Root application and route switch
│       ├── index.css           # Global typography & Tailwind design system
│       └── main.tsx            # React DOM bootstrap
├── server/                     # Production Node server
│   └── index.ts                # Express server to serve static assets & handle SPA routing
├── shared/                     # Shared TypeScript schemas and utilities
├── patches/                    # Package patches (e.g. wouter patch)
├── dist/                       # Production build outputs
│   ├── index.js                # Bundled Express server
│   └── public/                 # Static web bundle from Vite
├── package.json                # Dependencies and project scripts
├── tsconfig.json               # TypeScript configuration
└── vite.config.ts              # Vite bundling, plugins & path aliases
```

---

## 🚀 Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [pnpm](https://pnpm.io/) (or `npm`)

### 2. Install Dependencies

```bash
pnpm install
# or
npm install
```

### 3. Start Development Server

```bash
pnpm dev
# or
npm run dev
```

Open your browser and navigate to `http://localhost:3000` (or the port displayed in your terminal).

---

## 📦 Building for Production

To create an optimized production build:

```bash
pnpm run build
# or
npm run build
```

This compiles:
1. The Vite frontend into `dist/public/`
2. The Express server into `dist/index.js`

### Run Production Server Locally:

```bash
pnpm start
# or
npm start
```

The Express server will serve `dist/public/` at `http://localhost:3000/`.

---

## 🌐 Deployment & Hosting

### Option 1: Vercel (Recommended — Static Frontend)

1. Push your repository to GitHub.
2. In Vercel, click **Add New Project** and import this repository.
3. Configure the build settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `pnpm vite build` *(or `npm run build`)*
   - **Output Directory**: `dist/public`  *(⚠️ Important: set to `dist/public`, not `dist`)*
4. Click **Deploy**.

> **SPA Routing on Vercel:**  
> If navigating directly to subroutes displays a 404, add a `vercel.json` file in the project root:
> ```json
> {
>   "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
> }
> ```

---

### Option 2: Netlify

1. Connect your repository on [Netlify](https://www.netlify.com/).
2. Set:
   - **Build command**: `pnpm vite build`
   - **Publish directory**: `dist/public`
3. Add a `_redirects` file in `client/public/_redirects`:
   ```text
   /*    /index.html   200
   ```
4. Deploy the site.

---

### Option 3: Render / Railway / DigitalOcean (Full Node.js Server)

To deploy both the Express server and frontend:
- **Build Command**: `pnpm install && pnpm run build`
- **Start Command**: `node dist/index.js`
- **Port**: Automatic (reads `process.env.PORT || 3000`)

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `pnpm dev` | Starts Vite development server with hot module replacement (HMR) |
| `pnpm run build` | Compiles client to `dist/public` and bundles `server/index.ts` |
| `pnpm start` | Launches production Express server |
| `pnpm run preview` | Previews the production build locally via Vite |
| `pnpm run check` | Runs TypeScript type checking without emitting files |
| `pnpm run format` | Formats all code using Prettier |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
