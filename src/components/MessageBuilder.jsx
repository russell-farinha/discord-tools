export function MessageBuilder({ message, setMessage }) {
  const updateField = (field, value) => {
    setMessage({ ...message, [field]: value })
  }

  return (
    <div className="message-builder">
      <h2>Message Content</h2>

      <div className="form-group">
        <label htmlFor="content">Message Content</label>
        <textarea
          id="content"
          placeholder="Enter your message here..."
          value={message.content}
          onChange={(e) => updateField('content', e.target.value)}
          className="input-field textarea"
          rows={4}
        />
        <span className="char-count">{message.content.length}/2000</span>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="username">Username Override</label>
          <input
            type="text"
            id="username"
            placeholder="Custom bot name"
            value={message.username}
            onChange={(e) => updateField('username', e.target.value)}
            className="input-field"
          />
        </div>

        <div className="form-group">
          <label htmlFor="avatarUrl">Avatar URL Override</label>
          <input
            type="text"
            id="avatarUrl"
            placeholder="https://example.com/avatar.png"
            value={message.avatarUrl}
            onChange={(e) => updateField('avatarUrl', e.target.value)}
            className="input-field"
          />
        </div>
      </div>
    </div>
  )
}
