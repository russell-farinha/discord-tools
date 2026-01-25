export function Preview({ message }) {
  const hasContent = message.content?.trim()
  const hasEmbeds = message.embeds?.length > 0 && message.embeds.some(e =>
    e.title || e.description || e.author?.name || e.footer?.text || e.fields?.length > 0
  )

  if (!hasContent && !hasEmbeds) {
    return (
      <div className="preview">
        <h2>Preview</h2>
        <div className="preview-container">
          <p className="empty-state">Your message preview will appear here</p>
        </div>
      </div>
    )
  }

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return null
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const getColorInt = (color) => {
    if (!color) return null
    if (typeof color === 'number') return color
    return parseInt(color.replace('#', ''), 16)
  }

  const intToHex = (colorInt) => {
    if (!colorInt) return '#202225'
    return '#' + colorInt.toString(16).padStart(6, '0')
  }

  return (
    <div className="preview">
      <h2>Preview</h2>
      <div className="preview-container">
        <div className="discord-message">
          <div className="message-avatar">
            {message.avatarUrl ? (
              <img
                src={message.avatarUrl}
                alt="Avatar"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
            ) : null}
            <div className="avatar-fallback" style={{ display: message.avatarUrl ? 'none' : 'flex' }}>
              W
            </div>
          </div>

          <div className="message-content">
            <div className="message-header">
              <span className="message-author">
                {message.username || 'Webhook'}
              </span>
              <span className="message-badge">BOT</span>
              <span className="message-timestamp">Today at {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
            </div>

            {hasContent && (
              <div className="message-text">{message.content}</div>
            )}

            {message.embeds?.map((embed, index) => {
              const colorInt = getColorInt(embed.color)
              const hasEmbedContent = embed.title || embed.description || embed.author?.name ||
                embed.footer?.text || embed.fields?.length > 0 || embed.image || embed.thumbnail

              if (!hasEmbedContent) return null

              return (
                <div
                  key={index}
                  className="embed"
                  style={{ borderLeftColor: intToHex(colorInt) }}
                >
                  <div className="embed-content">
                    <div className="embed-body">
                      {embed.author?.name && (
                        <div className="embed-author">
                          {embed.author.iconUrl && (
                            <img
                              src={embed.author.iconUrl}
                              alt=""
                              className="embed-author-icon"
                              onError={(e) => e.target.style.display = 'none'}
                            />
                          )}
                          {embed.author.url ? (
                            <a href={embed.author.url} target="_blank" rel="noopener noreferrer">
                              {embed.author.name}
                            </a>
                          ) : (
                            <span>{embed.author.name}</span>
                          )}
                        </div>
                      )}

                      {embed.title && (
                        <div className="embed-title">
                          {embed.url ? (
                            <a href={embed.url} target="_blank" rel="noopener noreferrer">
                              {embed.title}
                            </a>
                          ) : (
                            embed.title
                          )}
                        </div>
                      )}

                      {embed.description && (
                        <div className="embed-description">{embed.description}</div>
                      )}

                      {embed.fields?.length > 0 && (
                        <div className="embed-fields">
                          {embed.fields.map((field, fieldIndex) => (
                            field.name && field.value ? (
                              <div
                                key={fieldIndex}
                                className={`embed-field ${field.inline ? 'inline' : ''}`}
                              >
                                <div className="embed-field-name">{field.name}</div>
                                <div className="embed-field-value">{field.value}</div>
                              </div>
                            ) : null
                          ))}
                        </div>
                      )}

                      {embed.image && (
                        <div className="embed-image">
                          <img
                            src={embed.image}
                            alt=""
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        </div>
                      )}

                      {(embed.footer?.text || embed.timestamp) && (
                        <div className="embed-footer">
                          {embed.footer?.iconUrl && (
                            <img
                              src={embed.footer.iconUrl}
                              alt=""
                              className="embed-footer-icon"
                              onError={(e) => e.target.style.display = 'none'}
                            />
                          )}
                          <span>
                            {embed.footer?.text}
                            {embed.footer?.text && embed.timestamp && ' • '}
                            {formatTimestamp(embed.timestamp)}
                          </span>
                        </div>
                      )}
                    </div>

                    {embed.thumbnail && (
                      <div className="embed-thumbnail">
                        <img
                          src={embed.thumbnail}
                          alt=""
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
