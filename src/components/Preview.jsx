// Parse Discord markdown to React elements
function parseDiscordMarkdown(text) {
  if (!text) return null

  const elements = []
  let key = 0

  // Regex patterns for Discord markdown
  const patterns = [
    // Code blocks (must be first to avoid inner parsing)
    { regex: /```(\w*)\n?([\s\S]*?)```/g, render: (match) => <code key={key++} className="code-block">{match[2]}</code> },
    // Inline code
    { regex: /`([^`]+)`/g, render: (match) => <code key={key++} className="inline-code">{match[1]}</code> },
    // Links [text](url)
    { regex: /\[([^\]]+)\]\(([^)]+)\)/g, render: (match) => <a key={key++} href={match[2]} target="_blank" rel="noopener noreferrer">{match[1]}</a> },
    // Bold **text**
    { regex: /\*\*([^*]+)\*\*/g, render: (match) => <strong key={key++}>{match[1]}</strong> },
    // Underline __text__
    { regex: /__([^_]+)__/g, render: (match) => <u key={key++}>{match[1]}</u> },
    // Italic *text* or _text_
    { regex: /\*([^*]+)\*/g, render: (match) => <em key={key++}>{match[1]}</em> },
    { regex: /_([^_]+)_/g, render: (match) => <em key={key++}>{match[1]}</em> },
    // Strikethrough ~~text~~
    { regex: /~~([^~]+)~~/g, render: (match) => <s key={key++}>{match[1]}</s> },
    // Spoiler ||text||
    { regex: /\|\|([^|]+)\|\|/g, render: (match) => <span key={key++} className="spoiler">{match[1]}</span> },
  ]

  // Simple approach: process patterns sequentially
  let remaining = text
  let result = []

  // Process the text by finding matches and splitting
  const processText = (str) => {
    for (const pattern of patterns) {
      const match = pattern.regex.exec(str)
      if (match) {
        pattern.regex.lastIndex = 0 // Reset regex
        const beforeMatch = str.slice(0, match.index)
        const afterMatch = str.slice(match.index + match[0].length)

        return [
          ...processText(beforeMatch),
          pattern.render(match),
          ...processText(afterMatch)
        ]
      }
    }
    // No matches, return plain text
    return str ? [str] : []
  }

  return processText(text)
}

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
              <div className="message-text">{parseDiscordMarkdown(message.content)}</div>
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
                        <div className="embed-description">{parseDiscordMarkdown(embed.description)}</div>
                      )}

                      {embed.fields?.length > 0 && (
                        <div className="embed-fields">
                          {embed.fields.map((field, fieldIndex) => (
                            field.name && field.value ? (
                              <div
                                key={fieldIndex}
                                className={`embed-field ${field.inline ? 'inline' : ''}`}
                              >
                                <div className="embed-field-name">{parseDiscordMarkdown(field.name)}</div>
                                <div className="embed-field-value">{parseDiscordMarkdown(field.value)}</div>
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
