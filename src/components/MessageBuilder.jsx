import { LIMITS } from '../utils/discord'

export function MessageBuilder({ message, setMessage }) {
  const updateField = (field, value) => {
    setMessage({ ...message, [field]: value })
  }

  const contentOver = message.content.length > LIMITS.content
  const usernameOver = message.username.length > LIMITS.username

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
          className={`input-field textarea ${contentOver ? 'input-error' : ''}`}
          rows={4}
        />
        <span className={`char-count ${contentOver ? 'char-count-error' : ''}`}>
          {message.content.length}/{LIMITS.content}
        </span>
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
            className={`input-field ${usernameOver ? 'input-error' : ''}`}
          />
          {message.username.length > 0 && (
            <span className={`char-count ${usernameOver ? 'char-count-error' : ''}`}>
              {message.username.length}/{LIMITS.username}
            </span>
          )}
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
