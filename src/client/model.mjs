export const STORAGE_KEY = 'dsh-work-list:v1'

export const DEFAULT_CATEGORIES = [
  { id: 'inbox', name: '日常', builtIn: true, tone: '#8190a5' },
  { id: 'work', name: '工作', builtIn: true, tone: '#8190a5' },
  { id: 'study', name: '学习', builtIn: true, tone: '#8190a5' },
  { id: 'life', name: '生活', builtIn: true, tone: '#8190a5' },
]

export const FONT_FAMILIES = {
  system: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif',
  rounded: '"Arial Rounded MT Bold", "Microsoft YaHei", sans-serif',
  serif: 'Georgia, "Songti SC", "SimSun", serif',
}

const DEFAULT_FONT_SIZE = 16
const MIN_FONT_SIZE = 12
const MAX_FONT_SIZE = 24

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function makeId(prefix = 'item') {
  const uuid = globalThis.crypto?.randomUUID?.()
  return `${prefix}-${uuid ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`}`
}

export function createInitialState() {
  return {
    version: 1,
    title: '工作清单',
    categories: DEFAULT_CATEGORIES.map(category => ({ ...category })),
    tasks: [],
    fontSize: DEFAULT_FONT_SIZE,
    fontFamily: 'system',
  }
}

export function decodeState(raw) {
  if (typeof raw !== 'string' || raw.length === 0) return createInitialState()

  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch {
    return createInitialState()
  }
  if (!isRecord(parsed) || parsed.version !== 1) return createInitialState()

  const savedCategories = Array.isArray(parsed.categories) ? parsed.categories : []
  const categories = DEFAULT_CATEGORIES.map(defaultCategory => {
    const saved = savedCategories.find(category => isRecord(category) && category.id === defaultCategory.id)
    return {
      ...defaultCategory,
      name: typeof saved?.name === 'string' && saved.name.trim() ? saved.name.trim().slice(0, 32) : defaultCategory.name,
    }
  })
  const seenIds = new Set(categories.map(category => category.id))
  for (const category of savedCategories) {
    if (!isRecord(category) || typeof category.id !== 'string' || typeof category.name !== 'string') continue
    const id = category.id.trim()
    const name = category.name.trim().slice(0, 32)
    if (!id || !name || seenIds.has(id)) continue
    seenIds.add(id)
    categories.push({ id, name, builtIn: false, tone: '#8190a5' })
  }

  const categoryIds = new Set(categories.map(category => category.id))
  const tasks = (Array.isArray(parsed.tasks) ? parsed.tasks : []).flatMap(task => {
    if (!isRecord(task) || typeof task.title !== 'string' || !task.title.trim()) return []
    return [{
      id: typeof task.id === 'string' && task.id ? task.id : makeId('task'),
      title: task.title.trim().slice(0, 4000),
      html: typeof task.html === 'string' ? task.html.slice(0, 20000) : '',
      categoryId: typeof task.categoryId === 'string' && categoryIds.has(task.categoryId) ? task.categoryId : 'inbox',
      completed: task.completed === true,
      createdAt: Number.isFinite(task.createdAt) && Number.isFinite(new Date(task.createdAt).getTime()) ? task.createdAt : Date.now(),
      ...(Number.isFinite(task.deletedAt) ? { deletedAt: task.deletedAt } : {}),
      ...(typeof task.deletedCategoryId === 'string' && task.deletedCategoryId.trim()
        ? { deletedCategoryId: task.deletedCategoryId.trim() }
        : {}),
    }]
  })

  const fontFamily = Object.hasOwn(FONT_FAMILIES, parsed.fontFamily) ? parsed.fontFamily : 'system'
  const fontSize = Number.isFinite(parsed.fontSize)
    ? Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, Math.round(parsed.fontSize)))
    : DEFAULT_FONT_SIZE

  return {
    version: 1,
    title: typeof parsed.title === 'string' && parsed.title.trim() ? parsed.title.trim().slice(0, 80) : '工作清单',
    categories,
    tasks,
    fontSize,
    fontFamily,
  }
}

export function addTask(state, title, { categoryId = 'inbox', id = makeId('task'), createdAt = Date.now(), html = '' } = {}) {
  const text = typeof title === 'string' ? title.trim().slice(0, 4000) : ''
  if (!text) return state
  const safeCategoryId = state.categories.some(category => category.id === categoryId) ? categoryId : 'inbox'
  const safeHtml = typeof html === 'string' ? html.slice(0, 20000) : ''
  return {
    ...state,
    tasks: [...state.tasks, { id, title: text, html: safeHtml, categoryId: safeCategoryId, completed: false, createdAt }],
  }
}

export function updateTaskContent(state, id, title, html = '') {
  const text = typeof title === 'string' ? title.trim().slice(0, 4000) : ''
  const safeHtml = typeof html === 'string' ? html.slice(0, 20000) : ''
  if (!text || !state.tasks.some(task => task.id === id)) return state
  return {
    ...state,
    tasks: state.tasks.map(task => task.id === id ? { ...task, title: text, html: safeHtml } : task),
  }
}

export function updateTaskTitle(state, id, title) {
  return updateTaskContent(state, id, title, '')
}

export function toggleTask(state, id) {
  if (!state.tasks.some(task => task.id === id)) return state
  return { ...state, tasks: state.tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task) }
}

export function removeTask(state, id, { deletedAt = Date.now() } = {}) {
  if (!state.tasks.some(task => task.id === id && task.deletedAt === undefined)) return state
  return {
    ...state,
    tasks: state.tasks.map(task => task.id === id
      ? { ...task, deletedAt, deletedCategoryId: task.categoryId }
      : task),
  }
}

export function restoreTask(state, id) {
  const task = state.tasks.find(candidate => candidate.id === id && candidate.deletedAt !== undefined)
  if (!task) return state
  const categoryId = typeof task.deletedCategoryId === 'string'
    && state.categories.some(category => category.id === task.deletedCategoryId)
    ? task.deletedCategoryId
    : 'inbox'
  return {
    ...state,
    tasks: state.tasks.map(candidate => {
      if (candidate.id !== id) return candidate
      const restored = { ...candidate, categoryId }
      delete restored.deletedAt
      delete restored.deletedCategoryId
      return restored
    }),
  }
}

export function permanentlyRemoveTask(state, id) {
  const task = state.tasks.find(candidate => candidate.id === id)
  if (task?.deletedAt === undefined) return state
  return { ...state, tasks: state.tasks.filter(candidate => candidate.id !== id) }
}

export function emptyTrash(state) {
  const tasks = state.tasks.filter(task => task.deletedAt === undefined)
  return tasks.length === state.tasks.length ? state : { ...state, tasks }
}

export function clearCompleted(state, { deletedAt = Date.now() } = {}) {
  let changed = false
  const tasks = state.tasks.map(task => {
    if (!task.completed || task.deletedAt !== undefined) return task
    changed = true
    return { ...task, deletedAt, deletedCategoryId: task.categoryId }
  })
  return changed ? { ...state, tasks } : state
}

export function reorderTask(state, sourceId, targetId, position = 'before') {
  if (sourceId === targetId) return state
  const source = state.tasks.find(task => task.id === sourceId && task.deletedAt === undefined)
  const target = state.tasks.find(task => task.id === targetId && task.deletedAt === undefined)
  if (!source || !target || source.categoryId !== target.categoryId) return state

  const tasks = [...state.tasks]
  const sourceIndex = tasks.findIndex(task => task.id === sourceId)
  const [moved] = tasks.splice(sourceIndex, 1)
  const targetIndex = tasks.findIndex(task => task.id === targetId)
  const insertAt = position === 'after' ? targetIndex + 1 : targetIndex
  tasks.splice(insertAt, 0, moved)
  return { ...state, tasks }
}

export function addCategory(state, name, { id = makeId('category') } = {}) {
  const cleanName = typeof name === 'string' ? name.trim().slice(0, 32) : ''
  if (!cleanName || state.categories.some(category => category.name.toLocaleLowerCase() === cleanName.toLocaleLowerCase())) return state
  return { ...state, categories: [...state.categories, { id, name: cleanName, builtIn: false, tone: '#8190a5' }] }
}

export function removeCategory(state, id) {
  const category = state.categories.find(candidate => candidate.id === id)
  if (!category || category.builtIn) return state
  return {
    ...state,
    categories: state.categories.filter(candidate => candidate.id !== id),
    tasks: state.tasks.map(task => task.categoryId === id ? { ...task, categoryId: 'inbox' } : task),
  }
}

export function renameTitle(state, title) {
  const cleanTitle = typeof title === 'string' ? title.trim().slice(0, 80) : ''
  return cleanTitle ? { ...state, title: cleanTitle } : state
}

export function setTypography(state, { fontSize = state.fontSize, fontFamily = state.fontFamily } = {}) {
  const safeSize = Number.isFinite(fontSize) ? Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, Math.round(fontSize))) : state.fontSize
  const safeFamily = Object.hasOwn(FONT_FAMILIES, fontFamily) ? fontFamily : state.fontFamily
  if (safeSize === state.fontSize && safeFamily === state.fontFamily) return state
  return { ...state, fontSize: safeSize, fontFamily: safeFamily }
}
