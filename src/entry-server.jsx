// Build-time prerendering: renders each public route to real HTML so search
// engines and crawlers that do not run JavaScript see the full page content.
// The browser then hydrates this HTML (see main.jsx).
import React from 'react'
import { renderToPipeableStream } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { Writable } from 'node:stream'
import App from './App.jsx'
import AppBoundary from './components/AppBoundary'
import MotionSettings from './components/MotionSettings'

export function render(url) {
  return new Promise((resolve, reject) => {
    let html = ''
    const sink = new Writable({
      write(chunk, _encoding, done) {
        html += chunk.toString()
        done()
      },
      final(done) {
        resolve(html)
        done()
      }
    })
    const stream = renderToPipeableStream(
      <React.StrictMode>
        <AppBoundary>
          <StaticRouter location={url}>
            <MotionSettings>
              <App />
            </MotionSettings>
          </StaticRouter>
        </AppBoundary>
      </React.StrictMode>,
      {
        // Wait for lazy route chunks so the complete page is in the HTML.
        onAllReady() {
          stream.pipe(sink)
        },
        onShellError: reject,
        onError(error) {
          reject(error)
        }
      }
    )
  })
}
