import { Link } from 'react-router-dom'
import './styles/Landing.css'

function Landing() {
  return (
    <div className="landing">
      <header className="landing-header">
        <h1>Discord Tools</h1>
        <p>A collection of useful tools for Discord</p>
      </header>

      <main className="landing-main">
        <div className="tools-grid">
          <Link to="/webhook-builder" className="tool-card">
            <div className="tool-icon">
              <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z"/>
              </svg>
            </div>
            <h2>Webhook Message Builder</h2>
            <p>Create and send custom messages to Discord webhooks with embeds, custom avatars, and more.</p>
          </Link>

          <div className="tool-card coming-soon">
            <div className="tool-icon">
              <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14h-2v-4H6v-2h4V7h2v4h4v2h-4v4z"/>
              </svg>
            </div>
            <h2>More Coming Soon</h2>
            <p>Additional Discord tools are in the works. Stay tuned!</p>
          </div>
        </div>
      </main>

      <footer className="landing-footer">
        <p>Built by Russell Farinha</p>
      </footer>
    </div>
  )
}

export default Landing
