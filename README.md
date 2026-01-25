# 🎮 Nexus Playground

[![Version](https://img.shields.io/github/v/release/houke/nexus-playground?include_prereleases&label=version)](https://github.com/houke/nexus-playground/releases)
[![Deploy](https://github.com/houke/nexus-playground/actions/workflows/release.yml/badge.svg)](https://github.com/houke/nexus-playground/actions/workflows/release.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**The Experimental Sandbox for the Nexus Agentic Framework**

This repository is the **playground environment** for [Nexus](https://github.com/houke/nexus) — a multi-agent orchestration framework for VS Code. It serves as both a testing ground for Nexus capabilities and a showcase of what can be built when AI agents collaborate on software projects.

---

## 🔗 What's the Difference?

| Repository                                        | Purpose                                                  |
| ------------------------------------------------- | -------------------------------------------------------- |
| [**houke/nexus**](https://github.com/houke/nexus) | The main Nexus template — use this to start new projects |
| **houke/nexus-playground** (this repo)            | Experimental sandbox for testing and showcasing Nexus    |

**New to Nexus?** Start with the [main repository](https://github.com/houke/nexus).

**Want to see Nexus in action?** You're in the right place!

---

## 🧪 What's in the Playground?

This playground contains experimental projects built entirely using the Nexus agent workflow:

### 🐍 Snake Game (`experiments/snake/`)

A full-featured Snake game demonstrating Nexus's ability to coordinate multiple agents on a complex project:

- **5 Visual Styles**: Nokia 3310 retro, classic pixel art, neon synthwave, futuristic modern, and WebGL 3D
- **Audio System**: Sound effects and background music
- **Game Features**: Multiple difficulty levels, scoring, game-over states
- **Technical Showcase**:
  - Canvas 2D rendering (4 styles)
  - WebGL 3D rendering with shaders
  - Responsive design and touch controls

**Play it:** [Live Demo](https://houke.github.io/nexus-playground/experiments/snake/)

### 🐍 Mamba (`experiments/mamba/`)

A faithful recreation of the classic DOS game **Mamba** (1989) reimagined for modern browsers:

- **Authentic DOS Aesthetic**: VT323 font, CGA/EGA color palette, scanline effects
- **Classic Gameplay**: The original Mamba mechanics brought to the web
- **Retro Sound**: Chiptune-inspired audio effects
- **PWA Ready**: Install and play offline

**Play it:** [Live Demo](https://houke.github.io/nexus-playground/experiments/mamba/)

### 🐻 Beast (`experiments/beast/`)

A faithful recreation of the classic DOS game **Beast** (1984) reimagined for modern browsers:

- **Authentic DOS Aesthetic**: VT323 font, CGA/EGA color palette, scanline effects
- **Classic Gameplay**: Push blocks to crush beasts in this puzzle-action game
- **Retro Sound**: Chiptune-inspired audio effects
- **PWA Ready**: Install and play offline

**Play it:** [Live Demo](https://houke.github.io/nexus-playground/experiments/beast/)

---

## 🚀 Running Locally

```bash
# Clone the repository
git clone https://github.com/houke/nexus-playground.git
cd nexus-playground

# Install dependencies (use your preferred package manager)
npm install
# or: pnpm install / yarn install / bun install

# Start development server
npm run dev

# Build for production
npm run build
```

The dev server runs at `http://localhost:3001/nexus-playground/`

---

## 🤖 About Nexus

Nexus transforms VS Code into an autonomous command center by uniting specialized AI agents:

| Agent                     | Expertise                                        |
| ------------------------- | ------------------------------------------------ |
| 🏛️ **Architect**          | System design, schemas, local-first architecture |
| 👔 **Product Manager**    | Requirements, priorities, acceptance criteria    |
| 🎨 **UX Designer**        | User flows, wireframes, interaction patterns     |
| 💻 **Software Developer** | Implementation, TDD, production code             |
| 🎯 **Tech Lead**          | Code quality, patterns, architectural decisions  |
| 🖌️ **Visual Designer**    | UI polish, animations, styling                   |
| 🎮 **Gamer**              | Gamification mechanics, engagement               |
| 🧪 **QA Engineer**        | Testing, edge cases, accessibility               |
| ⚙️ **DevOps**             | CI/CD, infrastructure, deployment                |
| 🔐 **Security Agent**     | Security audits, vulnerability assessment        |

### Core Workflows

1. **Planning** — Orchestrate all agents to create comprehensive action plans
2. **Execution** — Coordinate implementation by delegating to the right agents
3. **Review** — Active code review where agents find AND fix issues
4. **Sync** — Reconcile documentation when work happens outside workflows
5. **Summary** — Snapshot project status comparing "have" vs "need"

👉 **[Get started with Nexus](https://github.com/houke/nexus)**

---

## 📁 Repository Structure

```
.
├── experiments/           # Experimental projects built with Nexus
│   ├── snake/            # 🐍 Snake game with 5 visual styles
│   └── mamba/            # 🐍 Mamba DOS game recreation
├── src/                  # Main playground app
│   ├── components/       # UI components
│   └── styles/          # Global styles
├── .github/
│   ├── agents/          # Agent persona definitions
│   ├── prompts/         # Workflow prompts
│   └── skills/          # Specialized skill instructions
├── .nexus/              # Generated outputs (plans, reviews, etc.)
├── AGENTS.md            # Instructions for AI coding agents
└── README.md
```

---

## 🛠️ Tech Stack

- **Build Tool**: Vite
- **Language**: TypeScript (strict mode)
- **Rendering**: Canvas 2D, WebGL
- **PWA**: Service worker for offline support
- **Linting**: ESLint with TypeScript rules

---

## 📄 License

MIT License — See [LICENSE](./LICENSE) for details.

---

<p align="center">
  <strong>Built with 🤖 by the Nexus agent squad</strong>
  <br>
  <a href="https://github.com/houke/nexus">Get Nexus</a> • <a href="https://houke.github.io/nexus-playground/experiments/snake/">Play Snake</a> • <a href="https://houke.github.io/nexus-playground/experiments/mamba/">Play Mamba</a>
</p>
