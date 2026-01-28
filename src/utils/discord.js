const DISCORD_WEBHOOK_REGEX = /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[\w-]+$/

export function isValidWebhookUrl(url) {
  return DISCORD_WEBHOOK_REGEX.test(url)
}

// Discord character limits
export const LIMITS = {
  content: 2000,
  username: 80,
  embedTitle: 256,
  embedDescription: 4096,
  embedFieldName: 256,
  embedFieldValue: 1024,
  embedFooterText: 2048,
  embedAuthorName: 256,
  embedTotal: 6000, // total chars per embed
}

export function getEmbedTotalChars(embed) {
  let total = 0
  if (embed.title) total += embed.title.length
  if (embed.description) total += embed.description.length
  if (embed.author?.name) total += embed.author.name.length
  if (embed.footer?.text) total += embed.footer.text.length
  if (embed.fields) {
    embed.fields.forEach(f => {
      total += (f.name?.length || 0) + (f.value?.length || 0)
    })
  }
  return total
}

export function buildPayload(message) {
  const payload = {}

  if (message.content?.trim()) {
    payload.content = message.content.trim()
  }

  if (message.username?.trim()) {
    payload.username = message.username.trim()
  }

  if (message.avatarUrl?.trim()) {
    payload.avatar_url = message.avatarUrl.trim()
  }

  if (message.embeds && message.embeds.length > 0) {
    const validEmbeds = message.embeds
      .map(embed => buildEmbed(embed))
      .filter(embed => Object.keys(embed).length > 0)

    if (validEmbeds.length > 0) {
      payload.embeds = validEmbeds
    }
  }

  return payload
}

function buildEmbed(embed) {
  const result = {}

  if (embed.title?.trim()) {
    result.title = embed.title.trim()
  }

  if (embed.description?.trim()) {
    result.description = embed.description.trim()
  }

  if (embed.url?.trim()) {
    result.url = embed.url.trim()
  }

  if (embed.color) {
    result.color = typeof embed.color === 'string'
      ? parseInt(embed.color.replace('#', ''), 16)
      : embed.color
  }

  if (embed.timestamp) {
    result.timestamp = embed.timestamp
  }

  if (embed.author?.name?.trim()) {
    result.author = {
      name: embed.author.name.trim()
    }
    if (embed.author.url?.trim()) {
      result.author.url = embed.author.url.trim()
    }
    if (embed.author.iconUrl?.trim()) {
      result.author.icon_url = embed.author.iconUrl.trim()
    }
  }

  if (embed.thumbnail?.trim()) {
    result.thumbnail = { url: embed.thumbnail.trim() }
  }

  if (embed.image?.trim()) {
    result.image = { url: embed.image.trim() }
  }

  if (embed.footer?.text?.trim()) {
    result.footer = {
      text: embed.footer.text.trim()
    }
    if (embed.footer.iconUrl?.trim()) {
      result.footer.icon_url = embed.footer.iconUrl.trim()
    }
  }

  if (embed.fields && embed.fields.length > 0) {
    const validFields = embed.fields
      .filter(f => f.name?.trim() && f.value?.trim())
      .map(f => ({
        name: f.name.trim(),
        value: f.value.trim(),
        inline: Boolean(f.inline)
      }))

    if (validFields.length > 0) {
      result.fields = validFields
    }
  }

  return result
}

export async function sendWebhookMessage(webhookUrl, message) {
  const payload = buildPayload(message)

  if (Object.keys(payload).length === 0) {
    throw new Error('Message cannot be empty. Add content or an embed.')
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorText = await response.text()
    let errorMessage = `Discord API error: ${response.status}`
    try {
      const errorJson = JSON.parse(errorText)
      if (errorJson.message) {
        errorMessage = errorJson.message
      }
    } catch {
      if (errorText) {
        errorMessage = errorText
      }
    }
    throw new Error(errorMessage)
  }

  return response
}

export function createEmptyEmbed() {
  return {
    title: '',
    description: '',
    url: '',
    color: '#5865f2',
    timestamp: '',
    author: {
      name: '',
      url: '',
      iconUrl: '',
    },
    thumbnail: '',
    image: '',
    footer: {
      text: '',
      iconUrl: '',
    },
    fields: [],
  }
}

export function createEmptyMessage() {
  return {
    content: '',
    username: '',
    avatarUrl: '',
    embeds: [],
  }
}
