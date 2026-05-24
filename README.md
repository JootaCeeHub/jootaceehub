# JootaCee.com - AI Systems Architect & Automation Engineer

A production-grade futuristic personal platform showcasing advanced AI systems, automation infrastructure, and modular digital ecosystems.

## 🚀 Tech Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript
- **Styling**: TailwindCSS v4 with custom futuristic theme
- **Animations**: Framer Motion, GSAP
- **3D/Visuals**: Three.js, React Three Fiber, Drei, GLSL shaders
- **UI Components**: Custom shadcn/ui-inspired components
- **Icons**: Lucide React

## 📁 Project Structure

```
src/
├── app/
│   ├── globals.css          # Global styles and custom theme
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main page with all sections
├── components/
│   ├── 3d/
│   │   └── NeuralNetworkScene.tsx  # 3D neural network visualization
│   ├── layout/
│   │   └── Navigation.tsx    # Navigation component
│   ├── sections/
│   │   ├── HeroSection.tsx          # Hero with 3D scene
│   │   ├── SystemsSection.tsx      # Systems architecture cards
│   │   ├── LabsSection.tsx          # Interactive project showcases
│   │   ├── InfrastructureSection.tsx # Live infrastructure dashboard
│   │   ├── GitHubSection.tsx        # GitHub integration
│   │   ├── AboutSection.tsx         # Premium narrative
│   │   └── ContactSection.tsx      # Collaboration terminal
│   └── ui/
│       ├── button.tsx         # Button component
│       ├── card.tsx           # Card component
│       └── panel.tsx          # Panel component
└── lib/
    └── utils.ts              # Utility functions
```

## 🎨 Design System

The platform features a dark, futuristic design inspired by:
- Apple, Vercel, Linear, Arc Browser, OpenAI
- Iron Man holographic interfaces
- Sci-fi minimalism
- Cinematic tech aesthetics

**Key Features**:
- Dark mode with cinematic lighting
- Glassmorphism effects
- Glowing gradients
- Smooth animations and transitions
- 3D particle systems
- Responsive design

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

```bash
# Install dependencies
npm install
# or
yarn install
# or
pnpm install
```

### Development

```bash
# Start development server
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build

```bash
# Create production build
npm run build
# or
yarn build
# or
pnpm build
```

### Start Production Server

```bash
npm start
# or
yarn start
# or
pnpm start
```

## 📦 Sections

1. **Hero Section**: Cinematic 3D neural network scene with floating particles and energy sphere
2. **Systems Section**: Animated architecture cards showcasing AURA, MCP Ecosystem, AI Agents, etc.
3. **Interactive Labs**: Futuristic project showcases with live indicators and technical stack tags
4. **Live Infrastructure**: Real-time operational systems dashboard
5. **GitHub Integration**: Repository cards with stars, forks, and activity metrics
6. **About Section**: Premium personal narrative with focus areas
7. **Contact Section**: Futuristic collaboration terminal with contact form

## 🚀 Deployment

### Vercel

The easiest way to deploy is using [Vercel](https://vercel.com/new):

```bash
vercel deploy
```

### Docker

```bash
# Build Docker image
docker build -t jootacee-com .

# Run container
docker run -p 3000:3000 jootacee-com
```

### Cloudflare Workers

The application is Cloudflare-ready for edge deployment.

## 🔧 Configuration

### TailwindCSS

Custom theme defined in `src/app/globals.css` with:
- Custom color palette (primary, secondary, accent, glow colors)
- Glassmorphism utilities
- Gradient effects
- Animation keyframes

### 3D Scene

The neural network scene uses:
- React Three Fiber for React integration
- Drei for helpers and components
- Custom particle systems
- Animated connections
- Energy sphere with pulsing effect

## 📝 Future Enhancements

- Live demos and AI playgrounds
- Docker runtime integrations
- MCP integrations
- Authentication system
- Interactive dashboards
- API systems
- Multi-agent interfaces
- GraphRAG visualizations
- Orchestration systems

## 📄 License

This project is proprietary and confidential.

## 👤 Contact

- Email: contact@jootacee.com
- Website: https://jootacee.com
## Phase 2 Runtime Controls

Optional environment variables for the cinematic 3D layer:

- `NEXT_PUBLIC_SCENE_COMPLEXITY_FACTOR`
  - Range: `0.5` to `1.4`
  - Default: `1`
  - Scales particles and neural lines counts globally.

- `NEXT_PUBLIC_ENABLE_3D_CONTROL_PANEL`
  - Values: `true` or `false`
  - Default: `false`
  - Enables an internal runtime panel for 3D diagnostics.
  - Toggle in runtime: `Ctrl + Shift + O`.

Examples:

```bash
NEXT_PUBLIC_SCENE_COMPLEXITY_FACTOR=0.75 npm run dev
NEXT_PUBLIC_SCENE_COMPLEXITY_FACTOR=1.2 npm run dev
NEXT_PUBLIC_ENABLE_3D_CONTROL_PANEL=true npm run dev
```

### Visual telemetry API

- `POST /api/visuals/telemetry`
  - Receives runtime performance samples from the 3D client.
- `GET /api/visuals/telemetry`
  - Returns in-memory aggregated metrics (sample count, avg FPS, avg quality, by tier).

## Phase 5 GitHub Intelligence Layer

Required env vars for live GitHub backend integration:

- `GITHUB_USERNAME`
- `GITHUB_TOKEN`
- `GITHUB_PRIMARY_REPO`

APIs:

- `GET /api/github/intelligence`
  - Aggregated intelligence payload (repositories, commits, releases, deployments, activity).
- `GET /api/github/repositories`
  - Repository list compatibility endpoint.

## Phase 6 Infrastructure Layer

Optional env vars:

- `INFRASTRUCTURE_SOURCE_MODE`
  - Values: `mock` or `live`
  - Default: `mock`

APIs:

- `GET /api/infrastructure/overview`
  - Returns aggregated infra runtime data (metrics, containers, MCP nodes, deployments, logs).
