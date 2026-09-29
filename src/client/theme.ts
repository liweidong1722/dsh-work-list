export type WorkListScheme = 'light' | 'dark'

export function detectWorkListScheme(): WorkListScheme {
  if (typeof document === 'undefined') return 'light'
  const decided = document.documentElement.style.colorScheme !== ''
  if (decided) return document.body.hasAttribute('data-ds-dark-theme') ? 'dark' : 'light'

  const attr = document.documentElement.getAttribute('data-theme')
    ?? document.body.getAttribute('data-theme')
  const value = String(attr ?? '').toLowerCase()
  if (value.includes('light') || value.includes('latte')) return 'light'
  if (value.includes('dark') || value.includes('frappe') || value.includes('macchiato') || value.includes('mocha')) return 'dark'

  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}
