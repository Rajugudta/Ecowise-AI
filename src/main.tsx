import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { FacilityProvider } from './context/FacilityContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <FacilityProvider>
        <App />
      </FacilityProvider>
    </ThemeProvider>
  </StrictMode>,
);
