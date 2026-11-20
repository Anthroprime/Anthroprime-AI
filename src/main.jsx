import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import AppBoundary from './components/AppBoundary'
import MotionSettings from './components/MotionSettings'
import './index.css'
import './learning.css'

const app = (
  <React.StrictMode>
    <AppBoundary>
      <BrowserRouter>
        <MotionSettings>
          <App />
        </MotionSettings>
      </BrowserRouter>
    </AppBoundary>
  </React.StrictMode>
)

const root = document.getElementById('root')
// Production pages are prerendered (scripts/build-pages.mjs): hydrate them.
// The dev server and unknown URLs start empty and render on the client.
if (root.hasChildNodes()) ReactDOM.hydrateRoot(root, app)
else ReactDOM.createRoot(root).render(app)
