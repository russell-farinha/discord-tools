import { useState } from 'react'
import { isValidWebhookUrl } from '../utils/discord'

export function WebhookManager({ webhooks, setWebhooks, selectedWebhook, setSelectedWebhook, compact }) {
  const [newWebhook, setNewWebhook] = useState('')
  const [webhookName, setWebhookName] = useState('')
  const [error, setError] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  const handleAddWebhook = () => {
    setError('')

    if (!newWebhook.trim()) {
      setError('Please enter a webhook URL')
      return
    }

    if (!isValidWebhookUrl(newWebhook.trim())) {
      setError('Invalid Discord webhook URL format')
      return
    }

    if (webhooks.some(w => w.url === newWebhook.trim())) {
      setError('This webhook URL already exists')
      return
    }

    const webhook = {
      id: Date.now().toString(),
      name: webhookName.trim() || `Webhook ${webhooks.length + 1}`,
      url: newWebhook.trim(),
    }

    setWebhooks([...webhooks, webhook])
    setNewWebhook('')
    setWebhookName('')
    setShowAddForm(false)

    if (!selectedWebhook) {
      setSelectedWebhook(webhook.id)
    }
  }

  const handleRemoveWebhook = (id) => {
    if (!confirm('Remove this webhook?')) return
    setWebhooks(webhooks.filter(w => w.id !== id))
    if (selectedWebhook === id) {
      const remaining = webhooks.filter(w => w.id !== id)
      setSelectedWebhook(remaining.length > 0 ? remaining[0].id : null)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddWebhook()
    }
  }

  // Compact mode: dropdown + add button
  if (compact) {
    return (
      <div className="webhook-manager-compact">
        <div className="selector-row">
          <select
            value={selectedWebhook || ''}
            onChange={(e) => setSelectedWebhook(e.target.value || null)}
          >
            {webhooks.length === 0 && <option value="">No webhooks</option>}
            {webhooks.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn btn-secondary"
          >
            {showAddForm ? 'Cancel' : 'Add'}
          </button>
          {selectedWebhook && (
            <button
              onClick={() => handleRemoveWebhook(selectedWebhook)}
              className="btn btn-danger"
              title="Remove selected webhook"
            >
              Remove
            </button>
          )}
        </div>

        {showAddForm && (
          <div className="webhook-add-form">
            <input
              type="text"
              placeholder="Name (optional)"
              value={webhookName}
              onChange={(e) => setWebhookName(e.target.value)}
              className="input-field"
            />
            <input
              type="text"
              placeholder="https://discord.com/api/webhooks/..."
              value={newWebhook}
              onChange={(e) => setNewWebhook(e.target.value)}
              onKeyPress={handleKeyPress}
              className="input-field"
            />
            <button onClick={handleAddWebhook} className="btn btn-primary">
              Add Webhook
            </button>
            {error && <p className="error-message">{error}</p>}
          </div>
        )}
      </div>
    )
  }

  // Full mode (original)
  return (
    <div className="webhook-manager">
      <h2>Webhooks</h2>

      <div className="webhook-input-group">
        <input
          type="text"
          placeholder="Webhook name (optional)"
          value={webhookName}
          onChange={(e) => setWebhookName(e.target.value)}
          className="input-field"
        />
        <input
          type="text"
          placeholder="https://discord.com/api/webhooks/..."
          value={newWebhook}
          onChange={(e) => setNewWebhook(e.target.value)}
          onKeyPress={handleKeyPress}
          className="input-field"
        />
        <button onClick={handleAddWebhook} className="btn btn-primary">
          Add Webhook
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      {webhooks.length > 0 && (
        <div className="webhook-list">
          {webhooks.map((webhook) => (
            <div
              key={webhook.id}
              className={`webhook-item ${selectedWebhook === webhook.id ? 'selected' : ''}`}
            >
              <label className="webhook-label">
                <input
                  type="radio"
                  name="selectedWebhook"
                  checked={selectedWebhook === webhook.id}
                  onChange={() => setSelectedWebhook(webhook.id)}
                />
                <span className="webhook-name">{webhook.name}</span>
                <span className="webhook-url">{webhook.url.substring(0, 50)}...</span>
              </label>
              <button
                onClick={() => handleRemoveWebhook(webhook.id)}
                className="btn btn-danger btn-small"
                title="Remove webhook"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {webhooks.length === 0 && (
        <p className="empty-state">No webhooks added yet. Add a webhook URL to get started.</p>
      )}
    </div>
  )
}
