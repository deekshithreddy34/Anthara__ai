# Anthara AI · 3D In-IDE Conduct Layer & Compliance Architecture

An interactive, high-fidelity 3D visualization and architectural walkthrough of the **Anthara AI In-IDE Conduct Layer**, **Compliance Governance Engine**, and **Incubyte AI-Fluent Software Delivery Cycle (PDLC)**.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
# Using npm
npm install

# Or using yarn
yarn install
```

### 2. Run the Development Server
```bash
# Using npm
npm run dev

# Or using yarn
yarn dev
```

Open [http://localhost:3003](http://localhost:3003) in your browser to explore the 3D model.

---

## 🛠️ Tech Stack
- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **3D Engine**: [Three.js](https://threejs.org/) + OrbitControls
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Design Inspiration**: Architectural style inspired by bbycroft/llm-viz with crisp vector-rendered 3D canvas textures and side-by-side HUD walkthroughs.

---

## 📁 Project Structure
```
anthara-project/
├── app/
│   ├── globals.css          # Global styling, custom scrollbars, typography
│   ├── layout.tsx           # Root metadata & Google Fonts (Inter + JetBrains Mono)
│   └── page.tsx             # Main entry point mounting AntharaView
├── components/
│   └── anthara/
│       ├── AntharaView.tsx       # Root layout coordinator (side-by-side canvas & drawer)
│       ├── AntharaCanvas3D.tsx   # Three.js 3D scene, procedural textures, animations
│       ├── AntharaSidebar.tsx    # Multi-tab HUD (Walkthrough, Matrix, Levels, Cycle, Research)
│       ├── AntharaToolbar.tsx    # Camera presets, view toggles, scenario drawer button
│       ├── NodeInspector.tsx     # Deep-dive inspection drawer for clicked 3D components
│       ├── AntharaCommentary.tsx # Step-by-step playback & commentary
│       └── model/
│           └── antharaArchitecture.ts # Complete architectural model & whitepaper data
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

---

## 🎯 Key Features
1. **Interactive 3D Stage**:
   - Orbit, pan, and zoom around the multi-tiered architecture (Developer Surface, Orchestration, Context Engine, Verification & Gateways, Model Layer).
   - Crisp, high-contrast dynamic node textures with zero mipmap blurriness.
   - Interactive data flow particles demonstrating live code synthesis and compliance governance.
2. **Preset Camera Views**:
   - Quick jump buttons for Top-Down, Client IDE, In-IDE Conduct, Context Engine, and Full Stack views.
3. **Comprehensive Knowledge Drawer**:
   - **Walkthrough**: Step-by-step playback through real-world scenarios (e.g. In-IDE Code Synthesis & Conduct Enforcement, Pre-commit Security Audit).
   - **Fluency Matrix**: 4-quadrant enterprise AI fluency breakdown.
   - **5 Levels of Autonomy**: Levels L1 to L5 from Assisted to Fully Autonomous Agentic delivery.
   - **Cycle**: AI-Fluent Software Delivery Cycle stages, DORA metrics, and Earned Trust Spectrum.
   - **Research**: Whitepapers and academic literature citations.
# anthara-ai
# anthara-ai
# Anthara__ai


live demo:
```
https://antharaai-d8vvp6d05-deekshithreddy34s-projects.vercel.app/anthara
```
