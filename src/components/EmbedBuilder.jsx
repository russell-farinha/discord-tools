import { useState } from 'react'
import { ColorPicker } from './ColorPicker'
import { TimestampInput } from './TimestampInput'
import { createEmptyEmbed, LIMITS, getEmbedTotalChars } from '../utils/discord'

export function EmbedBuilder({ embeds, setEmbeds }) {
  const [expandedEmbed, setExpandedEmbed] = useState(0)

  const addEmbed = () => {
    if (embeds.length >= 10) return
    setEmbeds([...embeds, createEmptyEmbed()])
    setExpandedEmbed(embeds.length)
  }

  const removeEmbed = (index) => {
    const newEmbeds = embeds.filter((_, i) => i !== index)
    setEmbeds(newEmbeds)
    if (expandedEmbed >= newEmbeds.length) {
      setExpandedEmbed(Math.max(0, newEmbeds.length - 1))
    }
  }

  const updateEmbed = (index, field, value) => {
    const newEmbeds = [...embeds]
    newEmbeds[index] = { ...newEmbeds[index], [field]: value }
    setEmbeds(newEmbeds)
  }

  const updateNestedField = (index, parent, field, value) => {
    const newEmbeds = [...embeds]
    newEmbeds[index] = {
      ...newEmbeds[index],
      [parent]: { ...newEmbeds[index][parent], [field]: value }
    }
    setEmbeds(newEmbeds)
  }

  const addField = (embedIndex) => {
    const newEmbeds = [...embeds]
    newEmbeds[embedIndex].fields = [
      ...newEmbeds[embedIndex].fields,
      { name: '', value: '', inline: false }
    ]
    setEmbeds(newEmbeds)
  }

  const updateField = (embedIndex, fieldIndex, key, value) => {
    const newEmbeds = [...embeds]
    newEmbeds[embedIndex].fields[fieldIndex] = {
      ...newEmbeds[embedIndex].fields[fieldIndex],
      [key]: value
    }
    setEmbeds(newEmbeds)
  }

  const removeField = (embedIndex, fieldIndex) => {
    const newEmbeds = [...embeds]
    newEmbeds[embedIndex].fields = newEmbeds[embedIndex].fields.filter((_, i) => i !== fieldIndex)
    setEmbeds(newEmbeds)
  }

  const moveField = (embedIndex, fieldIndex, direction) => {
    const newEmbeds = [...embeds]
    const fields = [...newEmbeds[embedIndex].fields]
    const newIndex = fieldIndex + direction
    if (newIndex < 0 || newIndex >= fields.length) return
    ;[fields[fieldIndex], fields[newIndex]] = [fields[newIndex], fields[fieldIndex]]
    newEmbeds[embedIndex].fields = fields
    setEmbeds(newEmbeds)
  }

  const moveEmbed = (index, direction) => {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= embeds.length) return
    const newEmbeds = [...embeds]
    ;[newEmbeds[index], newEmbeds[newIndex]] = [newEmbeds[newIndex], newEmbeds[index]]
    setEmbeds(newEmbeds)
    setExpandedEmbed(newIndex)
  }

  return (
    <div className="embed-builder">
      <div className="embed-header">
        <h2>Embeds</h2>
        <button
          onClick={addEmbed}
          className="btn btn-secondary"
          disabled={embeds.length >= 10}
        >
          Add Embed ({embeds.length}/10)
        </button>
      </div>

      {embeds.length === 0 && (
        <p className="empty-state">No embeds yet. Click "Add Embed" to create one.</p>
      )}

      {embeds.map((embed, index) => (
        <div key={index} className="embed-card">
          <div
            className="embed-card-header"
            onClick={() => setExpandedEmbed(expandedEmbed === index ? -1 : index)}
          >
            <span className="embed-card-title">
              Embed {index + 1}
              {embed.title && `: ${embed.title}`}
            </span>
            <div className="embed-card-actions">
              <div className="embed-reorder">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    moveEmbed(index, -1)
                  }}
                  className="btn btn-secondary btn-icon"
                  disabled={index === 0}
                  title="Move up"
                >
                  ▲
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    moveEmbed(index, 1)
                  }}
                  className="btn btn-secondary btn-icon"
                  disabled={index === embeds.length - 1}
                  title="Move down"
                >
                  ▼
                </button>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeEmbed(index)
                }}
                className="btn btn-danger btn-small"
              >
                Remove
              </button>
              <span className="expand-icon">{expandedEmbed === index ? '▼' : '▶'}</span>
            </div>
          </div>

          {expandedEmbed === index && (
            <div className="embed-card-content">
              {getEmbedTotalChars(embed) > LIMITS.embedTotal && (
                <div className="embed-warning">
                  Total embed characters: {getEmbedTotalChars(embed)}/{LIMITS.embedTotal} (over limit)
                </div>
              )}
              <div className="form-section">
                <h3>Basic Info</h3>
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={embed.title}
                    onChange={(e) => updateEmbed(index, 'title', e.target.value)}
                    placeholder="Embed title"
                    className={`input-field ${embed.title.length > LIMITS.embedTitle ? 'input-error' : ''}`}
                  />
                  {embed.title.length > 0 && (
                    <span className={`char-count ${embed.title.length > LIMITS.embedTitle ? 'char-count-error' : ''}`}>
                      {embed.title.length}/{LIMITS.embedTitle}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={embed.description}
                    onChange={(e) => updateEmbed(index, 'description', e.target.value)}
                    placeholder="Embed description (supports markdown)"
                    className={`input-field textarea ${embed.description.length > LIMITS.embedDescription ? 'input-error' : ''}`}
                    rows={3}
                  />
                  {embed.description.length > 0 && (
                    <span className={`char-count ${embed.description.length > LIMITS.embedDescription ? 'char-count-error' : ''}`}>
                      {embed.description.length}/{LIMITS.embedDescription}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label>URL</label>
                  <input
                    type="text"
                    value={embed.url}
                    onChange={(e) => updateEmbed(index, 'url', e.target.value)}
                    placeholder="https://example.com"
                    className="input-field"
                  />
                </div>

                <div className="form-group">
                  <label>Color</label>
                  <ColorPicker
                    color={embed.color}
                    onChange={(color) => updateEmbed(index, 'color', color)}
                  />
                </div>

                <TimestampInput
                  timestamp={embed.timestamp}
                  onChange={(ts) => updateEmbed(index, 'timestamp', ts)}
                />
              </div>

              <div className="form-section">
                <h3>Author</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Author Name</label>
                    <input
                      type="text"
                      value={embed.author.name}
                      onChange={(e) => updateNestedField(index, 'author', 'name', e.target.value)}
                      placeholder="Author name"
                      className={`input-field ${embed.author.name.length > LIMITS.embedAuthorName ? 'input-error' : ''}`}
                    />
                    {embed.author.name.length > 0 && (
                      <span className={`char-count ${embed.author.name.length > LIMITS.embedAuthorName ? 'char-count-error' : ''}`}>
                        {embed.author.name.length}/{LIMITS.embedAuthorName}
                      </span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Author URL</label>
                    <input
                      type="text"
                      value={embed.author.url}
                      onChange={(e) => updateNestedField(index, 'author', 'url', e.target.value)}
                      placeholder="https://example.com"
                      className="input-field"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Author Icon URL</label>
                  <input
                    type="text"
                    value={embed.author.iconUrl}
                    onChange={(e) => updateNestedField(index, 'author', 'iconUrl', e.target.value)}
                    placeholder="https://example.com/icon.png"
                    className="input-field"
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Images</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Thumbnail URL</label>
                    <input
                      type="text"
                      value={embed.thumbnail}
                      onChange={(e) => updateEmbed(index, 'thumbnail', e.target.value)}
                      placeholder="https://example.com/thumbnail.png"
                      className="input-field"
                    />
                  </div>
                  <div className="form-group">
                    <label>Image URL</label>
                    <input
                      type="text"
                      value={embed.image}
                      onChange={(e) => updateEmbed(index, 'image', e.target.value)}
                      placeholder="https://example.com/image.png"
                      className="input-field"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Footer</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Footer Text</label>
                    <input
                      type="text"
                      value={embed.footer.text}
                      onChange={(e) => updateNestedField(index, 'footer', 'text', e.target.value)}
                      placeholder="Footer text"
                      className={`input-field ${embed.footer.text.length > LIMITS.embedFooterText ? 'input-error' : ''}`}
                    />
                    {embed.footer.text.length > 0 && (
                      <span className={`char-count ${embed.footer.text.length > LIMITS.embedFooterText ? 'char-count-error' : ''}`}>
                        {embed.footer.text.length}/{LIMITS.embedFooterText}
                      </span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Footer Icon URL</label>
                    <input
                      type="text"
                      value={embed.footer.iconUrl}
                      onChange={(e) => updateNestedField(index, 'footer', 'iconUrl', e.target.value)}
                      placeholder="https://example.com/footer-icon.png"
                      className="input-field"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="section-header">
                  <h3>Fields</h3>
                  <button
                    onClick={() => addField(index)}
                    className="btn btn-secondary btn-small"
                    disabled={embed.fields.length >= 25}
                  >
                    Add Field ({embed.fields.length}/25)
                  </button>
                </div>

                {embed.fields.map((field, fieldIndex) => (
                  <div key={fieldIndex} className="field-item">
                    <div className="field-header">
                      <span className="field-number">Field {fieldIndex + 1}</span>
                      <div className="field-reorder">
                        <button
                          onClick={() => moveField(index, fieldIndex, -1)}
                          className="btn btn-secondary btn-icon"
                          disabled={fieldIndex === 0}
                          title="Move up"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => moveField(index, fieldIndex, 1)}
                          className="btn btn-secondary btn-icon"
                          disabled={fieldIndex === embed.fields.length - 1}
                          title="Move down"
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Name</label>
                        <input
                          type="text"
                          value={field.name}
                          onChange={(e) => updateField(index, fieldIndex, 'name', e.target.value)}
                          placeholder="Field name"
                          className={`input-field ${field.name.length > LIMITS.embedFieldName ? 'input-error' : ''}`}
                        />
                        {field.name.length > 0 && (
                          <span className={`char-count ${field.name.length > LIMITS.embedFieldName ? 'char-count-error' : ''}`}>
                            {field.name.length}/{LIMITS.embedFieldName}
                          </span>
                        )}
                      </div>
                      <div className="form-group">
                        <label>Value</label>
                        <textarea
                          value={field.value}
                          onChange={(e) => updateField(index, fieldIndex, 'value', e.target.value)}
                          placeholder="Field value (supports newlines)"
                          className={`input-field textarea-small ${field.value.length > LIMITS.embedFieldValue ? 'input-error' : ''}`}
                          rows={2}
                        />
                        {field.value.length > 0 && (
                          <span className={`char-count ${field.value.length > LIMITS.embedFieldValue ? 'char-count-error' : ''}`}>
                            {field.value.length}/{LIMITS.embedFieldValue}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="field-actions">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={field.inline}
                          onChange={(e) => updateField(index, fieldIndex, 'inline', e.target.checked)}
                        />
                        Inline
                      </label>
                      <button
                        onClick={() => removeField(index, fieldIndex)}
                        className="btn btn-danger btn-small"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
