import { useState, useRef } from 'react'

// Check if an embed has any actual content
const embedHasContent = (e) =>
  e.title || e.description || e.url || e.author?.name ||
  e.footer?.text || e.image || e.thumbnail ||
  (e.fields?.length > 0 && e.fields.some(f => f.name || f.value))

export function TemplateManager({ templates, setTemplates, message, setMessage }) {
  const [templateName, setTemplateName] = useState('')
  const [error, setError] = useState('')
  const [selectedForExport, setSelectedForExport] = useState(new Set())
  const fileInputRef = useRef(null)

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
      (message.embeds?.length > 0 && message.embeds.some(embedHasContent))

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

  const toggleExportSelection = (id) => {
    const newSelected = new Set(selectedForExport)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedForExport(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedForExport.size === templates.length) {
      setSelectedForExport(new Set())
    } else {
      setSelectedForExport(new Set(templates.map(t => t.id)))
    }
  }

  const exportTemplates = () => {
    const toExport = selectedForExport.size > 0
      ? templates.filter(t => selectedForExport.has(t.id))
      : templates

    if (toExport.length === 0) {
      setError('No templates to export')
      return
    }
    const data = JSON.stringify(toExport, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'discord-webhook-templates.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setSelectedForExport(new Set())
  }

  const importTemplates = (e) => {
    setError('')
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result)
        if (!Array.isArray(imported)) {
          setError('Invalid template file format')
          return
        }
        // Validate and merge templates
        const validTemplates = imported.filter(t =>
          t.id && t.name && t.message && typeof t.message === 'object'
        )
        if (validTemplates.length === 0) {
          setError('No valid templates found in file')
          return
        }
        // Avoid duplicates by ID and name
        const existingIds = new Set(templates.map(t => t.id))
        const existingNames = new Set(templates.map(t => t.name))
        const newTemplates = validTemplates.filter(t =>
          !existingIds.has(t.id) && !existingNames.has(t.name)
        )
        if (newTemplates.length === 0) {
          setError('All templates already exist')
          return
        }
        setTemplates([...templates, ...newTemplates])
      } catch {
        setError('Failed to parse template file')
      }
    }
    reader.readAsText(file)
    // Reset file input
    e.target.value = ''
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
        <>
          <div className="template-io">
            <label className="checkbox-label select-all">
              <input
                type="checkbox"
                checked={selectedForExport.size === templates.length}
                onChange={toggleSelectAll}
              />
              {selectedForExport.size === templates.length ? 'Deselect All' : 'Select All'}
            </label>
            <button
              onClick={exportTemplates}
              className="btn btn-secondary btn-small"
            >
              {selectedForExport.size > 0
                ? `Export Selected (${selectedForExport.size})`
                : 'Export All'}
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="btn btn-secondary btn-small">
              Import
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={importTemplates}
              style={{ display: 'none' }}
            />
          </div>

          <div className="template-list">
            {templates.map((template) => (
              <div key={template.id} className="template-item">
                <label className="template-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedForExport.has(template.id)}
                    onChange={() => toggleExportSelection(template.id)}
                  />
                </label>
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
        </>
      ) : (
        <>
          <div className="template-io-empty">
            <button onClick={() => fileInputRef.current?.click()} className="btn btn-secondary btn-small">
              Import Templates
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={importTemplates}
              style={{ display: 'none' }}
            />
          </div>
          <p className="empty-state">No templates saved yet.</p>
        </>
      )}
    </div>
  )
}
