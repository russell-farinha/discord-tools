import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLocalStorage } from './hooks/useLocalStorage'
import { WebhookManager } from './components/WebhookManager'
import { MessageBuilder } from './components/MessageBuilder'
import { EmbedBuilder } from './components/EmbedBuilder'
import { Preview } from './components/Preview'
import { TemplateManager } from './components/TemplateManager'
import { sendWebhookMessage, createEmptyMessage } from './utils/discord'

function App() {
  const [webhooks, setWebhooks] = useLocalStorage('discord-webhooks', [])
  const [templates, setTemplates] = useLocalStorage('discord-templates', [])
  const [selectedWebhook, setSelectedWebhook] = useState(webhooks[0]?.id || null)
  const [message, setMessage] = useState(createEmptyMessage())
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState({ type: '', text: '' })
  const [statusFading, setStatusFading] = useState(false)

  // Auto-dismiss success messages after 4 seconds
  useEffect(() => {
    if (status.type === 'success' && status.text) {
      const fadeTimer = setTimeout(() => {
        setStatusFading(true)
      }, 3700) // Start fade animation before dismissal

      const dismissTimer = setTimeout(() => {
        setStatus({ type: '', text: '' })
        setStatusFading(false)
      }, 4000)

      return () => {
        clearTimeout(fadeTimer)
        clearTimeout(dismissTimer)
      }
    }
  }, [status])

  const handleSend = async () => {
    const webhook = webhooks.find(w => w.id === selectedWebhook)

    if (!webhook) {
      setStatus({ type: 'error', text: 'Please select a webhook' })
      return
    }

    setSending(true)
    setStatus({ type: '', text: '' })

    try {
      await sendWebhookMessage(webhook.url, message)
      setStatus({ type: 'success', text: 'Message sent successfully!' })
    } catch (error) {
      setStatus({ type: 'error', text: error.message })
    } finally {
      setSending(false)
    }
  }

  const handleClear = () => {
    setMessage(createEmptyMessage())
    setStatus({ type: '', text: '' })
    setStatusFading(false)
  }

  const updateEmbeds = (embeds) => {
    setMessage({ ...message, embeds })
  }

  return (
    <div className="app page-enter">
      <header className="header">
        <Link to="/" className="back-link">
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          All Tools
        </Link>
        <h1>Webhook Message Builder</h1>
        <p>Create and send custom messages to Discord webhooks</p>
      </header>

      <main className="main">
        <div className="builder-section">
          <WebhookManager
            webhooks={webhooks}
            setWebhooks={setWebhooks}
            selectedWebhook={selectedWebhook}
            setSelectedWebhook={setSelectedWebhook}
          />

          <MessageBuilder
            message={message}
            setMessage={setMessage}
          />

          <EmbedBuilder
            embeds={message.embeds}
            setEmbeds={updateEmbeds}
          />

          <TemplateManager
            templates={templates}
            setTemplates={setTemplates}
            message={message}
            setMessage={setMessage}
          />

          <div className="actions">
            <button
              onClick={handleSend}
              disabled={sending || !selectedWebhook}
              className={`btn btn-primary btn-large${sending ? ' sending' : ''}`}
            >
              {sending ? 'Sending...' : 'Send Message'}
            </button>
            <button
              onClick={handleClear}
              className="btn btn-secondary btn-large"
            >
              Clear
            </button>
          </div>

          {status.text && (
            <div className={`status-message ${status.type}${statusFading ? ' fade-out' : ''}`}>
              {status.text}
            </div>
          )}
        </div>

        <div className="preview-section">
          <Preview message={message} />
        </div>
      </main>

      <footer className="footer">
        <p>
          Webhook URLs are stored locally in your browser.
          <br />
          This app communicates directly with Discord's API.
        </p>
      </footer>
    </div>
  )
}

export default App
