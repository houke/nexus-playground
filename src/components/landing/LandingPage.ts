import './landing.css'
import { getBasePath } from '../../router'

interface Agent {
  icon: string
  name: string
  description: string
}

const agents: Agent[] = [
  {
    icon: '🏗️',
    name: 'Architect',
    description: 'System design, schemas, local-first architecture',
  },
  { icon: '👔', name: 'Tech Lead', description: 'Code quality, patterns, architectural decisions' },
  { icon: '👨‍💻', name: 'Software Developer', description: 'Implementation, TDD, production code' },
  {
    icon: '📋',
    name: 'Product Manager',
    description: 'Requirements, priorities, acceptance criteria',
  },
  { icon: '🧭', name: 'UX Designer', description: 'User flows, wireframes, interactions' },
  { icon: '🎨', name: 'Visual Designer', description: 'UI polish, animations, styling' },
  { icon: '🧪', name: 'QA Engineer', description: 'Testing, edge cases, accessibility' },
  { icon: '🔒', name: 'Security', description: 'Security audits, OWASP, vulnerabilities' },
  { icon: '🚀', name: 'DevOps', description: 'CI/CD, infrastructure, deployment' },
  { icon: '🎮', name: 'Gamer', description: 'Gamification mechanics, engagement' },
]

const experiments = [
  {
    id: 'snake',
    name: 'Snake',
    emoji: '🐍',
    description: 'Classic arcade game reimagined with 5 stunning visual styles',
    tags: ['Game', '2-Player', 'Offline'],
    available: true,
  },
  {
    id: 'mamba',
    name: 'Mamba',
    emoji: '🐍',
    description: 'DOS classic from 1989 - leave walls, collect gems, escape!',
    tags: ['Game', 'Retro', 'Offline'],
    available: true,
  },
  {
    id: 'beast',
    name: 'Beast',
    emoji: '🐻',
    description: '1984 DOS classic - push blocks to crush the beasts!',
    tags: ['Game', 'Retro', 'Puzzle'],
    available: true,
  },
  {
    id: 'pinspiration',
    name: 'Pinspiration',
    emoji: '📌',
    description: 'Discover random inspiration from any Pinterest board',
    tags: ['Tool', 'Discovery', 'Pinterest'],
    available: true,
  },
  {
    id: 'coming-soon',
    name: 'Coming Soon',
    emoji: '🔮',
    description: 'More experiments are brewing in the lab...',
    tags: ['Future'],
    available: false,
  },
]

export function renderLandingPage(container: HTMLElement): void {
  const basePath = getBasePath()

  container.innerHTML = `
    <div class="landing">
      <!-- Hero Section -->
      <header class="hero">
        <div class="hero-content container">
          <div class="hero-badge">
            <span class="badge-dot"></span>
            AI-Powered Development
          </div>
          <h1 class="hero-title">
            <span class="title-emoji">🤖</span>
            Nexus Playground
          </h1>
          <p class="hero-subtitle">
            Where AI Agents Build Together
          </p>
          <p class="hero-description">
            Experience interactive experiments crafted by specialized AI agents. 
            Each project demonstrates the power of collaborative AI development—from 
            architects designing systems to developers writing code.
          </p>
          <a href="#experiments" class="btn btn-primary hero-cta">
            Explore Experiments
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M7 17L17 7M17 7H7M17 7V17"/>
            </svg>
          </a>
        </div>
        <div class="hero-glow"></div>
        
        <!-- Scroll Indicator -->
        <div class="scroll-indicator" aria-hidden="true">
          <div class="scroll-mouse">
            <div class="scroll-wheel"></div>
          </div>
          <span class="scroll-text">Scroll to explore</span>
        </div>
      </header>

      <!-- Experiments Section -->
      <section id="experiments" class="experiments">
        <div class="container">
          <h2 class="section-title">Experiments</h2>
          <p class="section-description">
            Each experiment is a complete web app, built from scratch by our agent squad.
            Mobile-optimized and fully offline-capable.
          </p>
          
          <div class="experiments-grid">
            ${experiments
              .map(
                (exp) => `
              <article class="experiment-card ${exp.available ? '' : 'experiment-card--disabled'}">
                <div class="experiment-emoji">${exp.emoji}</div>
                <h3 class="experiment-name">${exp.name}</h3>
                <p class="experiment-description">${exp.description}</p>
                <div class="experiment-tags">
                  ${exp.tags.map((tag) => `<span class="tag">${tag}</span>`).join('')}
                </div>
                ${
                  exp.available
                    ? `<a href="${basePath}/experiments/${exp.id}/" class="btn btn-primary experiment-cta">
                        ${exp.tags.includes('Tool') ? 'Try Now' : 'Play Now'}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </a>`
                    : `<span class="experiment-status">Coming Soon</span>`
                }
              </article>
            `
              )
              .join('')}
          </div>
        </div>
      </section>

      <!-- About Section -->
      <section class="about">
        <div class="container">
          <h2 class="section-title">Built by the Squad</h2>
          <p class="section-description">
            Nexus orchestrates specialized AI agents—architects, developers, designers, 
            QA engineers—to collaborate on software projects. This playground showcases 
            what's possible when AI works as a team.
          </p>
          
          <div class="agents-grid">
            ${agents
              .map(
                (agent, index) => `
              <button class="agent-card" data-agent-index="${index}" aria-expanded="false">
                <span class="agent-icon">${agent.icon}</span>
                <span class="agent-name">${agent.name}</span>
                <span class="agent-description">${agent.description}</span>
              </button>
            `
              )
              .join('')}
          </div>
        </div>
      </section>

      <!-- Developer Workflow Section -->
      <section class="dev-workflow">
        <div class="container">
          <h2 class="section-title">Try It Yourself</h2>
          <p class="section-description">
            Nexus works inside VS Code with GitHub Copilot. Here's how to orchestrate your own project.
          </p>

          <!-- Quick Start -->
          <div class="quick-start">
            <div class="quick-start-content">
              <div class="quick-start-icon">🚀</div>
              <div class="quick-start-text">
                <h3 class="quick-start-title">Quick Start</h3>
                <p class="quick-start-description">
                  Create your own repo from the Nexus template and start orchestrating in minutes.
                </p>
              </div>
              <a 
                href="https://github.com/new?template_name=nexus&template_owner=houke" 
                target="_blank" 
                rel="noopener noreferrer"
                class="btn btn-primary quick-start-btn"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Use This Template
              </a>
            </div>
            <div class="quick-start-steps">
              <div class="mini-step">
                <span class="mini-step-num">1</span>
                <span class="mini-step-text">Click "Use this template" on GitHub</span>
              </div>
              <div class="mini-step">
                <span class="mini-step-num">2</span>
                <span class="mini-step-text">Clone your new repo & open in VS Code</span>
              </div>
              <div class="mini-step">
                <span class="mini-step-num">3</span>
                <span class="mini-step-text">Start chatting with agents using prompts below</span>
              </div>
            </div>
          </div>

          <!-- Interactive Input -->
          <div class="workflow-demo">
            <div class="demo-input-container">
              <label for="project-idea" class="demo-label">
                <span class="label-icon">💡</span>
                What do you want to build?
              </label>
              <input 
                type="text" 
                id="project-idea" 
                class="demo-input" 
                placeholder="e.g., A habit tracker with gamification"
                autocomplete="off"
              />
            </div>

            <!-- Generated Workflow Steps -->
            <div class="workflow-steps">
              <div class="workflow-step" data-step="1">
                <div class="step-header">
                  <span class="step-number">1</span>
                  <span class="step-title">Plan</span>
                  <span class="step-badge">project-planning</span>
                </div>
                <div class="step-content">
                  <code class="step-command"><span class="prompt-trigger">/</span>project-planning</code>
                  <p class="step-prompt">"<span class="prompt-text" data-field="input">Build a habit tracker app</span>"</p>
                  <p class="step-description">All agents collaborate to create a comprehensive action plan</p>
                </div>
                <div class="step-output">
                  <span class="output-label">creates →</span>
                  <code class="output-file"><span class="file-path">.nexus/features/</span><span class="file-name" data-field="plan-file">habit-tracker/plan.md</span></code>
                </div>
              </div>

              <div class="workflow-connector">
                <svg width="24" height="40" viewBox="0 0 24 40">
                  <path d="M12 0 L12 32 M6 26 L12 32 L18 26" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>

              <div class="workflow-step" data-step="2">
                <div class="step-header">
                  <span class="step-number">2</span>
                  <span class="step-title">Execute</span>
                  <span class="step-badge">project-execution</span>
                </div>
                <div class="step-content">
                  <code class="step-command"><span class="prompt-trigger">/</span>project-execution</code>
                  <p class="step-prompt">"Implement <span class="step-file-ref" data-field="plan-ref">habit-tracker/plan.md</span>"</p>
                  <p class="step-description">Agents implement the plan, delegating tasks by expertise</p>
                </div>
                <div class="step-output">
                  <span class="output-label">creates →</span>
                  <code class="output-file"><span class="file-path">.nexus/features/</span><span class="file-name" data-field="exec-file">habit-tracker/execution.md</span></code>
                </div>
              </div>

              <div class="workflow-connector">
                <svg width="24" height="40" viewBox="0 0 24 40">
                  <path d="M12 0 L12 32 M6 26 L12 32 L18 26" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>

              <div class="workflow-step" data-step="3">
                <div class="step-header">
                  <span class="step-number">3</span>
                  <span class="step-title">Review</span>
                  <span class="step-badge">project-review</span>
                </div>
                <div class="step-content">
                  <code class="step-command"><span class="prompt-trigger">/</span>project-review</code>
                  <p class="step-prompt">"Review and fix <span class="step-file-ref" data-field="review-ref">habit-tracker/execution.md</span>"</p>
                  <p class="step-description">Security, QA, and Tech Lead audit and auto-fix issues</p>
                </div>
                <div class="step-output">
                  <span class="output-label">creates →</span>
                  <code class="output-file"><span class="file-path">.nexus/features/</span><span class="file-name" data-field="review-file">habit-tracker/review.md</span></code>
                </div>
              </div>
            </div>
          </div>

          <!-- Agent Mentions Section -->
          <div class="agent-mentions">
            <h3 class="subsection-title">Talk Directly to Agents</h3>
            <p class="subsection-description">
              Use <code class="inline-code">@</code> mentions to invoke specific agents for focused tasks:
            </p>
            
            <div class="mention-examples">
              <div class="mention-example">
                <code class="mention-code"><span class="mention-at">@</span>software-developer</code>
                <span class="mention-text">fix the authentication bug in login.ts</span>
              </div>
              <div class="mention-example">
                <code class="mention-code"><span class="mention-at">@</span>ux-designer</code>
                <span class="mention-text">improve the onboarding flow</span>
              </div>
              <div class="mention-example">
                <code class="mention-code"><span class="mention-at">@</span>security</code>
                <span class="mention-text">audit the API endpoints</span>
              </div>
            </div>
          </div>

          <!-- Sync Section -->
          <div class="sync-section">
            <h3 class="subsection-title">Keep Docs in Sync</h3>
            <p class="subsection-description">
              When you work outside the formal workflow, use <code class="inline-code">/project-sync</code> to reconcile your documentation:
            </p>
            
            <div class="sync-demo">
              <div class="sync-before">
                <span class="sync-label">Before sync</span>
                <div class="sync-status sync-status--outdated">
                  <span class="status-icon">⚠️</span>
                  <span>Plan: draft</span>
                  <span class="status-muted">(but code is complete)</span>
                </div>
              </div>
              <div class="sync-arrow">
                <code class="sync-command"><span class="prompt-trigger">/</span>project-sync</code>
              </div>
              <div class="sync-after">
                <span class="sync-label">After sync</span>
                <div class="sync-status sync-status--current">
                  <span class="status-icon">✅</span>
                  <span>Plan: complete</span>
                  <span class="status-muted">(docs updated)</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Hotfix Section -->
          <div class="hotfix-section">
            <h3 class="subsection-title">Quick Hotfixes</h3>
            <p class="subsection-description">
              Need to fix a critical bug fast? Use <code class="inline-code">/project-hotfix</code> to document urgent fixes without disrupting your main features:
            </p>
            
            <div class="hotfix-demo">
              <div class="hotfix-example">
                <div class="hotfix-scenario">
                  <span class="hotfix-label">Scenario</span>
                  <div class="hotfix-description">
                    <span class="status-icon">🔥</span>
                    <span>Production bug: Login button not responding</span>
                  </div>
                </div>
                <div class="hotfix-command-wrapper">
                  <code class="hotfix-command"><span class="prompt-trigger">/</span>project-hotfix</code>
                  <p class="hotfix-prompt">"Fix login button not responding on mobile"</p>
                </div>
                <div class="hotfix-result">
                  <span class="hotfix-result-label">creates →</span>
                  <code class="hotfix-file">
                    <span class="file-path">.nexus/features/_hotfixes/</span>
                    <span class="file-name">2026-01-27-login-button.md</span>
                  </code>
                </div>
              </div>
            </div>
            
            <div class="hotfix-note">
              <span class="note-icon">💡</span>
              <span class="note-text">Hotfixes are tracked separately so they don't interfere with your planned features</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="footer">
        <div class="container">
          <p class="footer-text">
            <span class="footer-emoji">🤖</span>
            Nexus Playground — Where AI Agents Build Together
          </p>
          <p class="footer-links">
            <a href="https://github.com/houke/nexus-playground" target="_blank" rel="noopener noreferrer">GitHub</a>
          </p>
        </div>
      </footer>
    </div>
  `

  // Add smooth scroll for anchor links
  container.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault()
      const target = document.querySelector(
        (anchor as HTMLAnchorElement).getAttribute('href') || ''
      )
      target?.scrollIntoView({ behavior: 'smooth' })
    })
  })

  // Add click handlers for agent cards to toggle description
  container.querySelectorAll('.agent-card').forEach((card) => {
    card.addEventListener('click', () => {
      const isExpanded = card.getAttribute('aria-expanded') === 'true'

      // Close all other cards first
      container.querySelectorAll('.agent-card').forEach((otherCard) => {
        otherCard.setAttribute('aria-expanded', 'false')
        otherCard.classList.remove('agent-card--active')
      })

      // Toggle current card
      if (!isExpanded) {
        card.setAttribute('aria-expanded', 'true')
        card.classList.add('agent-card--active')
      }
    })
  })

  // Close agent cards when clicking outside
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('.agent-card')) {
      container.querySelectorAll('.agent-card').forEach((card) => {
        card.setAttribute('aria-expanded', 'false')
        card.classList.remove('agent-card--active')
      })
    }
  })

  // Interactive workflow demo
  const projectInput = container.querySelector('#project-idea') as HTMLInputElement
  const defaultText = 'Build a habit tracker app'
  const defaultSlug = 'habit-tracker'

  // Helper to generate a slug from input text
  const toSlug = (text: string): string => {
    // Remove common prefixes
    let cleaned = text
      .toLowerCase()
      .replace(/^(build|create|make|implement|design)\s+(a|an|the)?\s*/i, '')
    // Convert to slug
    return (
      cleaned
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .substring(0, 30) || defaultSlug
    )
  }

  if (projectInput) {
    const updateWorkflow = () => {
      const value = projectInput.value.trim() || defaultText
      const slug = toSlug(value)

      // Update input text in step 1
      const inputField = container.querySelector('[data-field="input"]')
      if (inputField) inputField.textContent = value

      // Update plan file
      const planFile = container.querySelector('[data-field="plan-file"]')
      if (planFile) planFile.textContent = `${slug}/plan.md`

      const planRef = container.querySelector('[data-field="plan-ref"]')
      if (planRef) planRef.textContent = `${slug}/plan.md`

      // Update exec file
      const execFile = container.querySelector('[data-field="exec-file"]')
      if (execFile) execFile.textContent = `${slug}/execution.md`

      // Update review file
      const reviewFile = container.querySelector('[data-field="review-file"]')
      if (reviewFile) reviewFile.textContent = `${slug}/review.md`

      const reviewRef = container.querySelector('[data-field="review-ref"]')
      if (reviewRef) reviewRef.textContent = `${slug}/execution.md`
    }

    projectInput.addEventListener('input', updateWorkflow)

    // Animate steps on scroll into view
    const workflowSteps = container.querySelectorAll('.workflow-step')
    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('workflow-step--visible')
          }
        })
      },
      { threshold: 0.2 }
    )

    workflowSteps.forEach((step) => observer.observe(step))
  }
}
