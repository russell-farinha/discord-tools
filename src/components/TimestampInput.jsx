import { useState } from 'react'

export function TimestampInput({ timestamp, onChange }) {
  const [mode, setMode] = useState('picker') // 'picker' or 'raw'
  const [rawValue, setRawValue] = useState('')
  const [rawError, setRawError] = useState('')

  // Parse timestamp for picker mode
  const getDateValue = () => {
    if (!timestamp) return ''
    try {
      return timestamp.slice(0, 10)
    } catch {
      return ''
    }
  }

  const getTimeValue = () => {
    if (!timestamp) return ''
    try {
      return timestamp.slice(11, 16)
    } catch {
      return ''
    }
  }

  const handleDateChange = (e) => {
    const date = e.target.value
    if (!date) {
      onChange('')
      return
    }
    const time = getTimeValue() || '12:00'
    try {
      onChange(new Date(`${date}T${time}:00Z`).toISOString())
    } catch {
      // Invalid date, ignore
    }
  }

  const handleTimeChange = (e) => {
    const time = e.target.value
    const date = getDateValue() || new Date().toISOString().slice(0, 10)
    if (!time) {
      onChange(new Date(`${date}T00:00:00Z`).toISOString())
      return
    }
    try {
      onChange(new Date(`${date}T${time}:00Z`).toISOString())
    } catch {
      // Invalid time, ignore
    }
  }

  const handleRawChange = (e) => {
    const val = e.target.value
    setRawValue(val)
    setRawError('')

    if (!val.trim()) {
      onChange('')
      return
    }

    // Try to parse as ISO timestamp
    try {
      const date = new Date(val)
      if (isNaN(date.getTime())) {
        setRawError('Invalid timestamp')
        return
      }
      onChange(date.toISOString())
    } catch {
      setRawError('Invalid timestamp')
    }
  }

  const handleModeSwitch = (newMode) => {
    setMode(newMode)
    setRawError('')
    if (newMode === 'raw' && timestamp) {
      setRawValue(timestamp)
    }
  }

  const handleNowClick = () => {
    const now = new Date().toISOString()
    onChange(now)
    if (mode === 'raw') {
      setRawValue(now)
    }
  }

  const handleClear = () => {
    onChange('')
    setRawValue('')
    setRawError('')
  }

  return (
    <div className="form-group">
      <div className="timestamp-header">
        <label>Timestamp</label>
        <div className="timestamp-mode-toggle">
          <button
            type="button"
            className={`mode-btn ${mode === 'picker' ? 'active' : ''}`}
            onClick={() => handleModeSwitch('picker')}
          >
            Picker
          </button>
          <button
            type="button"
            className={`mode-btn ${mode === 'raw' ? 'active' : ''}`}
            onClick={() => handleModeSwitch('raw')}
          >
            Raw
          </button>
        </div>
      </div>

      {mode === 'picker' ? (
        <div className="timestamp-inputs">
          <input
            type="date"
            value={getDateValue()}
            onChange={handleDateChange}
            className="input-field"
          />
          <input
            type="time"
            value={getTimeValue()}
            onChange={handleTimeChange}
            className="input-field"
            disabled={!timestamp}
          />
          <span className="time-label">UTC</span>
          <button
            type="button"
            onClick={handleNowClick}
            className="btn btn-secondary btn-small"
          >
            Now
          </button>
          {timestamp && (
            <button
              type="button"
              onClick={handleClear}
              className="btn btn-secondary btn-small"
            >
              Clear
            </button>
          )}
        </div>
      ) : (
        <div className="timestamp-raw">
          <input
            type="text"
            value={rawValue}
            onChange={handleRawChange}
            placeholder="2024-01-15T14:30:00.000Z"
            className={`input-field ${rawError ? 'input-error' : ''}`}
          />
          <button
            type="button"
            onClick={handleNowClick}
            className="btn btn-secondary btn-small"
          >
            Now
          </button>
          {(timestamp || rawValue) && (
            <button
              type="button"
              onClick={handleClear}
              className="btn btn-secondary btn-small"
            >
              Clear
            </button>
          )}
        </div>
      )}
      {rawError && <span className="error-text">{rawError}</span>}
      {timestamp && mode === 'picker' && (
        <span className="timestamp-preview">
          {new Date(timestamp).toLocaleString()}
        </span>
      )}
    </div>
  )
}
