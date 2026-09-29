function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export function plainTextToHtml(text: string): string {
  return escapeHtml(text).replace(/\n/g, '<br>')
}

const RICH_TAGS = new Set([
  'P', 'DIV', 'BR', 'STRONG', 'B', 'EM', 'I', 'U', 'S', 'STRIKE',
  'UL', 'OL', 'LI', 'BLOCKQUOTE', 'H1', 'H2', 'H3', 'FONT', 'SPAN', 'HR',
])

export function sanitizeRichHtml(raw: string): string {
  if (typeof document === 'undefined') return ''
  const template = document.createElement('template')
  template.innerHTML = raw

  const scrub = (root: ParentNode): void => {
    for (const child of Array.from(root.childNodes)) {
      if (child.nodeType === Node.COMMENT_NODE) {
        child.remove()
        continue
      }
      if (child.nodeType !== Node.ELEMENT_NODE) continue
      const element = child as HTMLElement
      const tag = element.tagName
      if (!RICH_TAGS.has(tag)) {
        const fragment = document.createDocumentFragment()
        while (element.firstChild) fragment.appendChild(element.firstChild)
        element.replaceWith(fragment)
        scrub(root)
        continue
      }

      for (const attribute of Array.from(element.attributes)) {
        const name = attribute.name.toLowerCase()
        const value = attribute.value.trim()
        const allowColor = tag === 'FONT' && name === 'color' && /^#?[0-9a-f]{3,8}$/i.test(value)
        if (allowColor) continue
        if (tag === 'SPAN' && name === 'style') {
          const probe = document.createElement('span')
          probe.setAttribute('style', value)
          const safe: string[] = []
          const color = probe.style.getPropertyValue('color')
          const background = probe.style.getPropertyValue('background-color')
          if (color) safe.push(`color:${color}`)
          if (background) safe.push(`background-color:${background}`)
          if (safe.length) element.setAttribute('style', safe.join(';'))
          else element.removeAttribute('style')
          continue
        }
        element.removeAttribute(attribute.name)
      }
      scrub(element)
    }
  }

  scrub(template.content)
  return template.innerHTML
}

export function htmlToPlainText(html: string): string {
  if (typeof document === 'undefined') return ''
  const holder = document.createElement('div')
  holder.innerHTML = sanitizeRichHtml(html)
  return (holder.innerText || holder.textContent || '').replace(/\n{3,}/g, '\n\n').trim()
}
