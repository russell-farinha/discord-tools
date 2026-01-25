const PRESET_COLORS = [
  '#5865f2', // Discord blurple
  '#57f287', // Green
  '#fee75c', // Yellow
  '#eb459e', // Fuchsia
  '#ed4245', // Red
  '#ffffff', // White
  '#23272a', // Dark
  '#99aab5', // Gray
]

export function ColorPicker({ color, onChange }) {
  return (
    <div className="color-picker">
      <div className="color-presets">
        {PRESET_COLORS.map((preset) => (
          <button
            key={preset}
            className={`color-preset ${color === preset ? 'selected' : ''}`}
            style={{ backgroundColor: preset }}
            onClick={() => onChange(preset)}
            title={preset}
            type="button"
          />
        ))}
      </div>
      <input
        type="color"
        value={color || '#5865f2'}
        onChange={(e) => onChange(e.target.value)}
        className="color-input"
      />
      <input
        type="text"
        value={color || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#5865f2"
        className="input-field color-text"
      />
    </div>
  )
}
