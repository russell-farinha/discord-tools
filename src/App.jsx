import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useLocalStorage } from './hooks/useLocalStorage'
import { WebhookManager } from './components/WebhookManager'
import { MessageBuilder } from './components/MessageBuilder'
import { EmbedBuilder } from './components/EmbedBuilder'
import { Preview } from './components/Preview'
import { TemplateModal } from './components/TemplateModal'
import { sendWebhookMessage, createEmptyMessage, LIMITS, getEmbedTotalChars } from './utils/discord'

function App() {
  const [webhooks, setWebhooks] = useLocalStorage('discord-webhooks', [])
  const [templates, setTemplates] = useLocalStorage('discord-templates', [])
  const [selectedWebhook, setSelectedWebhook] = useState(webhooks[0]?.id || null)
  const [selectedTemplate, setSelectedTemplate] = useState('new')
  const [message, setMessage] = useState(createEmptyMessage())
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState({ type: '', text: '' })
  const [statusFading, setStatusFading] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const lastSavedMessage = useRef(null)
  const isInitialMount = useRef(true)

  // Track unsaved changes (skip initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      lastSavedMessage.current = JSON.stringify(message)
      return
    }
    const currentMessage = JSON.stringify(message)
    setHasUnsavedChanges(currentMessage !== lastSavedMessage.current)
  }, [message])

  // Auto-dismiss success messages after 4 seconds
  useEffect(() => {
    if (status.type === 'success' && status.text) {
      const fadeTimer = setTimeout(() => {
        setStatusFading(true)
      }, 3700)

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

  const getValidationErrors = () => {
    const errors = []
    if (message.content.length > LIMITS.content) {
      errors.push(`Message content exceeds ${LIMITS.content} characters`)
    }
    if (message.username.length > LIMITS.username) {
      errors.push(`Username exceeds ${LIMITS.username} characters`)
    }
    message.embeds.forEach((embed, i) => {
      const n = i + 1
      if (embed.title.length > LIMITS.embedTitle) {
        errors.push(`Embed ${n} title exceeds ${LIMITS.embedTitle} characters`)
      }
      if (embed.description.length > LIMITS.embedDescription) {
        errors.push(`Embed ${n} description exceeds ${LIMITS.embedDescription} characters`)
      }
      if (embed.author.name.length > LIMITS.embedAuthorName) {
        errors.push(`Embed ${n} author name exceeds ${LIMITS.embedAuthorName} characters`)
      }
      if (embed.footer.text.length > LIMITS.embedFooterText) {
        errors.push(`Embed ${n} footer exceeds ${LIMITS.embedFooterText} characters`)
      }
      if (getEmbedTotalChars(embed) > LIMITS.embedTotal) {
        errors.push(`Embed ${n} total exceeds ${LIMITS.embedTotal} characters`)
      }
      embed.fields.forEach((field, j) => {
        if (field.name.length > LIMITS.embedFieldName) {
          errors.push(`Embed ${n} field ${j + 1} name exceeds ${LIMITS.embedFieldName} characters`)
        }
        if (field.value.length > LIMITS.embedFieldValue) {
          errors.push(`Embed ${n} field ${j + 1} value exceeds ${LIMITS.embedFieldValue} characters`)
        }
      })
    })
    return errors
  }

  const validationErrors = getValidationErrors()
  const hasErrors = validationErrors.length > 0

  const handleTemplateChange = (templateId) => {
    if (hasUnsavedChanges) {
      if (!confirm('You have unsaved changes. Discard them?')) {
        return
      }
    }

    setSelectedTemplate(templateId)

    if (templateId === 'new') {
      const newMessage = createEmptyMessage()
      setMessage(newMessage)
      lastSavedMessage.current = JSON.stringify(newMessage)
    } else {
      const template = templates.find(t => t.id === templateId)
      if (template) {
        const loadedMessage = JSON.parse(JSON.stringify(template.message))
        setMessage(loadedMessage)
        lastSavedMessage.current = JSON.stringify(loadedMessage)
      }
    }
    setHasUnsavedChanges(false)
  }

  const handleSave = () => {
    if (selectedTemplate === 'new') {
      // Prompt for name
      const existingNumbers = templates
        .map(t => {
          const match = t.name.match(/^New Template (\d+)$/)
          return match ? parseInt(match[1]) : 0
        })
        .filter(n => n > 0)
      const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1
      const defaultName = `New Template ${nextNumber}`

      const name = prompt('Enter template name:', defaultName)
      if (!name) return

      if (templates.some(t => t.name === name.trim())) {
        setStatus({ type: 'error', text: 'A template with this name already exists' })
        return
      }

      const newTemplate = {
        id: Date.now().toString(),
        name: name.trim(),
        message: JSON.parse(JSON.stringify(message)),
        createdAt: new Date().toISOString(),
      }

      setTemplates([...templates, newTemplate])
      setSelectedTemplate(newTemplate.id)
      lastSavedMessage.current = JSON.stringify(message)
      setHasUnsavedChanges(false)
      setStatus({ type: 'success', text: 'Template saved!' })
    } else {
      // Update existing template
      const updatedTemplates = templates.map(t =>
        t.id === selectedTemplate
          ? { ...t, message: JSON.parse(JSON.stringify(message)) }
          : t
      )
      setTemplates(updatedTemplates)
      lastSavedMessage.current = JSON.stringify(message)
      setHasUnsavedChanges(false)
      setStatus({ type: 'success', text: 'Template updated!' })
    }
  }

  const handleSend = async () => {
    const webhook = webhooks.find(w => w.id === selectedWebhook)

    if (!webhook) {
      setStatus({ type: 'error', text: 'Please select a webhook' })
      return
    }

    if (hasErrors) {
      setStatus({ type: 'error', text: validationErrors[0] })
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
    if (hasUnsavedChanges) {
      if (!confirm('You have unsaved changes. Discard them?')) {
        return
      }
    }
    const newMessage = createEmptyMessage()
    setMessage(newMessage)
    setSelectedTemplate('new')
    lastSavedMessage.current = JSON.stringify(newMessage)
    setHasUnsavedChanges(false)
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
          <div className="top-bar">
            <div className="top-bar-section">
              <h2>Webhook</h2>
              <WebhookManager
                webhooks={webhooks}
                setWebhooks={setWebhooks}
                selectedWebhook={selectedWebhook}
                setSelectedWebhook={setSelectedWebhook}
                compact
              />
            </div>

            <div className="top-bar-section">
              <h2>Template</h2>
              <div className="selector-row">
                <select
                  value={selectedTemplate}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                >
                  <option value="new">New Template</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => setShowTemplateModal(true)}
                  className="btn btn-secondary"
                >
                  Manage
                </button>
              </div>
            </div>
          </div>

          <MessageBuilder
            message={message}
            setMessage={setMessage}
          />

          <EmbedBuilder
            embeds={message.embeds}
            setEmbeds={updateEmbeds}
          />

          <div className="bottom-actions">
            <button
              onClick={handleSend}
              disabled={sending || !selectedWebhook || hasErrors}
              className={`btn btn-primary btn-large${sending ? ' sending' : ''}`}
              title={hasErrors ? validationErrors[0] : ''}
            >
              {sending ? 'Sending...' : 'Send Message'}
            </button>
            <button
              onClick={handleSave}
              className="btn btn-secondary btn-large"
            >
              {selectedTemplate === 'new' ? 'Save Template' : 'Update Template'}
              {hasUnsavedChanges && ' •'}
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

      <TemplateModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        templates={templates}
        setTemplates={setTemplates}
      />
    </div>
  )
}

export default App
