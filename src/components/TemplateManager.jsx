import { useState } from 'react'

export function TemplateManager({ templates, setTemplates, message, setMessage }) {
  const [templateName, setTemplateName] = useState('')
  const [error, setError] = useState('')

  const saveTemplate = () => {
    setError('')

    if (!templateName.trim()) {
      setError('Please enter a template name')
      return
    }

    if (templates.some(t => t.name === templateName.trim())) {
      setError('A template with this name already exists')
      return
    }

    const hasContent = message.content?.trim() ||
      (message.embeds?.length > 0 && message.embeds.some(e =>
        e.title || e.description || e.author?.name
      ))

    if (!hasContent) {
      setError('Cannot save an empty message as a template')
      return
    }

    const template = {
      id: Date.now().toString(),
      name: templateName.trim(),
      message: JSON.parse(JSON.stringify(message)),
      createdAt: new Date().toISOString(),
    }

    setTemplates([...templates, template])
    setTemplateName('')
  }

  const loadTemplate = (template) => {
    setMessage(JSON.parse(JSON.stringify(template.message)))
  }

  const deleteTemplate = (id) => {
    setTemplates(templates.filter(t => t.id !== id))
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      saveTemplate()
    }
  }

  return (
    <div className="template-manager">
      <h2>Templates</h2>

      <div className="template-save">
        <input
          type="text"
          placeholder="Template name"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          onKeyPress={handleKeyPress}
          className="input-field"
        />
        <button onClick={saveTemplate} className="btn btn-secondary">
          Save Current
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      {templates.length > 0 ? (
        <div className="template-list">
          {templates.map((template) => (
            <div key={template.id} className="template-item">
              <div className="template-info">
                <span className="template-name">{template.name}</span>
                <span className="template-date">
                  {new Date(template.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="template-actions">
                <button
                  onClick={() => loadTemplate(template)}
                  className="btn btn-primary btn-small"
                >
                  Load
                </button>
                <button
                  onClick={() => deleteTemplate(template.id)}
                  className="btn btn-danger btn-small"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-state">No templates saved yet.</p>
      )}
    </div>
  )
}
