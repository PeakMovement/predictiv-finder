
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SeverityProvider } from './context/SeverityContext'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <SeverityProvider>
        <App />
      </SeverityProvider>
    </AuthProvider>
  </BrowserRouter>
);

