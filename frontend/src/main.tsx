import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './auth/AuthContext.tsx'
import { HomeProvider } from './home/HomeContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <HomeProvider>
        <App />
      </HomeProvider>
    </AuthProvider>
  </StrictMode>,
)
