import { useState, useRef } from 'react'

export function TemplateModal({ isOpen, onClose, templates, setTemplates }) {
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  if (!isOpen) return null

  const toggleSelection = (id) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === templates.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(templates.map(t => t.id)))
    }
  }

  const exportSelected = () => {
    const toExport = selectedIds.size > 0
      ? templates.filter(t => selectedIds.has(t.id))
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
    setSelectedIds(new Set())
  }

  const deleteSelected = () => {
    if (selectedIds.size === 0) {
      setError('No templates selected')
      return
    }
    if (!confirm(`Delete ${selectedIds.size} template(s)?`)) return
    setTemplates(templates.filter(t => !selectedIds.has(t.id)))
    setSelectedIds(new Set())
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
        const validTemplates = imported.filter(t =>
          t.id && t.name && t.message && typeof t.message === 'object'
        )
        if (validTemplates.length === 0) {
          setError('No valid templates found in file')
          return
        }
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
        setError('')
      } catch {
        setError('Failed to parse template file')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Manage Templates</h2>
          <button onClick={onClose} className="btn btn-secondary btn-icon">✕</button>
        </div>

        <div className="modal-body">
          {error && <p className="error-message">{error}</p>}

          {templates.length > 0 ? (
            <>
              <div className="template-bulk-actions">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === templates.length && templates.length > 0}
                    onChange={toggleSelectAll}
                  />
                  {selectedIds.size === templates.length ? 'Deselect All' : 'Select All'}
                </label>
                <div className="bulk-buttons">
                  <button
                    onClick={exportSelected}
                    className="btn btn-secondary btn-small"
                  >
                    {selectedIds.size > 0 ? `Export (${selectedIds.size})` : 'Export All'}
                  </button>
                  <button
                    onClick={deleteSelected}
                    className="btn btn-danger btn-small"
                    disabled={selectedIds.size === 0}
                  >
                    Delete ({selectedIds.size})
                  </button>
                </div>
              </div>

              <div className="template-list">
                {templates.map((template) => (
                  <div key={template.id} className="template-item">
                    <label className="template-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(template.id)}
                        onChange={() => toggleSelection(template.id)}
                      />
                    </label>
                    <div className="template-info">
                      <span className="template-name">{template.name}</span>
                      <span className="template-date">
                        {new Date(template.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="empty-state">No templates saved yet.</p>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={() => fileInputRef.current?.click()} className="btn btn-secondary">
            Import
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={importTemplates}
            style={{ display: 'none' }}
          />
          <button onClick={onClose} className="btn btn-primary">
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
