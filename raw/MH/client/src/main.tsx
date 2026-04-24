import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import { plPL } from '@clerk/localizations'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { ThemeProvider } from './lib/ThemeContext'
import './index.css'
import App from './App.tsx'
import { applyConsent } from './lib/cookieConsent'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

// 🔥 Check consent on every page load — if user already agreed, load analytics immediately
applyConsent();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/" localization={plPL}>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </ClerkProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
)
