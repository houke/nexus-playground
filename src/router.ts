// Simple client-side router for Nexus Playground

type Route = {
  path: string
  handler: () => void
}

const routes: Route[] = []
let currentPath = ''

export function addRoute(path: string, handler: () => void): void {
  routes.push({ path, handler })
}

export function navigate(path: string): void {
  if (path === currentPath) return

  window.history.pushState({}, '', path)
  handleRouteChange()
}

function handleRouteChange(): void {
  const path = window.location.pathname
  currentPath = path

  // Find matching route
  const route = routes.find((r) => {
    if (r.path === path) return true
    // Handle dynamic routes like /experiments/:name
    if (r.path.includes(':')) {
      const pathParts = path.split('/')
      const routeParts = r.path.split('/')
      if (pathParts.length !== routeParts.length) return false
      return routeParts.every((part, i) => part.startsWith(':') || part === pathParts[i])
    }
    return false
  })

  if (route) {
    route.handler()
  }
}

export function initRouter(): void {
  // Handle browser back/forward
  window.addEventListener('popstate', handleRouteChange)

  // Handle initial route
  handleRouteChange()
}

export function getBasePath(): string {
  return '/nexus-playground'
}
