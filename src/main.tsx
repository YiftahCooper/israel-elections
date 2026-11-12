import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App.tsx';
import { RootBoundary } from './app/components/ErrorBoundary.tsx';
import '@fontsource/ibm-plex-sans-hebrew/400.css';
import '@fontsource/ibm-plex-sans-hebrew/500.css';
import '@fontsource/ibm-plex-sans-hebrew/600.css';
import '@fontsource/ibm-plex-sans-hebrew/700.css';
import './app/styles.css';

// a render error that no panel contains shows the app's own message (with Reload), never a blank page
createRoot(document.getElementById('root')!).render(<StrictMode><RootBoundary><App /></RootBoundary></StrictMode>);
