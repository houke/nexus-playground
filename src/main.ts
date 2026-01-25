import './styles/global.css'
import { initRouter } from './router'
import { renderLandingPage } from './components/landing/LandingPage'

// Initialize the application
function init() {
  const app = document.getElementById('app')
  if (!app) {
    console.error('App root element not found')
    return
  }

  // Initialize router
  initRouter()

  // Render landing page
  renderLandingPage(app)

  // Register service worker (handled by vite-plugin-pwa)
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/nexus-playground/sw.js').catch(() => {
        // Service worker registration failed - app still works
      })
    })
  }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
