import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import App from './app/App'
import './index.css'
import './app/configureApi'

if (
  import.meta.env.DEV &&
  (import.meta.env.VITE_DEMO === 'true' || import.meta.env.VITE_DEMO_CAMPAIGNS === 'true')
) {
  const { demoFetch } = await import('./app/demo/server')
  const { configureDevelopmentTransport } = await import('./shared/api/httpClient')
  configureDevelopmentTransport(demoFetch)
}

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('No se encontró el elemento raíz de React')
}

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
