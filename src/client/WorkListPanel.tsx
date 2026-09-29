import { useEffect, useMemo, useRef, useState, type CSSProperties, type DragEvent, type FormEvent, type KeyboardEvent } from 'react'
import {
  addCategory,
  addTask,
  clearCompleted,
  createInitialState,
  decodeState,
  emptyTrash,
  FONT_FAMILIES,
  makeId,
  permanentlyRemoveTask,
  removeCategory,
  removeTask,
  reorderTask,
  restoreTask,
  renameTitle,
  setTypography,
  STORAGE_KEY,
  toggleTask,
  updateTaskContent,
  type WorkListTask,
} from './model.mjs'
import { loadWorkList, saveWorkList } from './rpc.js'
import { htmlToPlainText, plainTextToHtml, sanitizeRichHtml } from './richText.js'
import { WORK_LIST_STYLES } from './styles.js'
import { detectWorkListScheme, type WorkListScheme } from './theme.js'


const FILTERS = [
  { id: 'active', label: '待完成' },
  { id: 'completed', label: '已完成' },
  { id: 'all', label: '全部' },
]

const FONT_LABELS = { system: '系统', rounded: '圆润', serif: '衬线' }

function taskDate(value: number): string {
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return ''
  return new Intl.DateTimeFormat('zh-CN', { month: 'numeric', day: 'numeric' }).format(date)
}

function taskSummary(title: string, html?: string): string {
  if (typeof document !== 'undefined' && html?.trim()) {
    const holder = document.createElement('div')
    holder.innerHTML = sanitizeRichHtml(html)
    const heading = holder.querySelector('h1,h2,h3')?.textContent?.trim()
    if (heading) return heading.slice(0, 160)
  }
  return title.split(/\r?\n/).find(line => line.trim())?.trim().slice(0, 160) || '未命名事项'
}

function taskBodyHtml(title: string, html?: string): string {
  const summary = taskSummary(title, html)
  if (!html?.trim()) {
    const lines = title.split(/\r?\n/)
    const first = lines.findIndex(line => line.trim())
    return first >= 0 ? plainTextToHtml(lines.slice(first + 1).join('\n').trim()) : ''
  }
  const safeHtml = sanitizeRichHtml(html)
  if (typeof document === 'undefined') return safeHtml
  const holder = document.createElement('div')
  holder.innerHTML = safeHtml
  const heading = holder.querySelector('h1,h2,h3')
  if (heading) {
    heading.remove()
  } else {
    const firstElement = holder.firstElementChild
    if (firstElement?.textContent?.trim() === summary) firstElement.remove()
  }
  return holder.innerHTML.trim()
}

function ListGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8.5 6.5h11M8.5 12h11M8.5 17.5h11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="m3.5 6.5 1.2 1.2 2-2.4M3.5 12l1.2 1.2 2-2.4M3.5 17.5l1.2 1.2 2-2.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function WorkListPanel() {
  const [state, setState] = useState(createInitialState)
  const [loaded, setLoaded] = useState(false)
  const [scheme, setScheme] = useState<WorkListScheme>(detectWorkListScheme)
  const [saveStatus, setSaveStatus] = useState<'loading' | 'saving' | 'saved' | 'fallback'>('loading')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [filter, setFilter] = useState('active')
  const [searchQuery, setSearchQuery] = useState('')
  const [draft, setDraft] = useState('')
  const [draftHtml, setDraftHtml] = useState('')
  const [draftActive, setDraftActive] = useState(false)
  const [draftCategory, setDraftCategory] = useState('inbox')
  const [categoryDraft, setCategoryDraft] = useState('')
  const [addingCategory, setAddingCategory] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editingTaskHtml, setEditingTaskHtml] = useState('')
  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<string>>(() => new Set())
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null)
  const editorRef = useRef<HTMLDivElement | null>(null)
  const draftEditorRef = useRef<HTMLDivElement | null>(null)
  const editorShellRef = useRef<HTMLDivElement | null>(null)
  const formatToolbarRef = useRef<HTMLDivElement | null>(null)
  const selectionRef = useRef<Range | null>(null)
  const revisionRef = useRef<string | null>(null)
  const historyRef = useRef<string[]>([])
  const historyIndexRef = useRef(-1)
  const importFileRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const sync = () => setScheme(detectWorkListScheme())
    sync()

    const bodyObserver = new MutationObserver(sync)
    const rootObserver = new MutationObserver(sync)
    bodyObserver.observe(document.body, { attributes: true, attributeFilter: ['data-ds-dark-theme', 'data-theme'] })
    rootObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['style', 'data-theme'] })

    const media = typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-color-scheme: dark)')
      : null
    media?.addEventListener?.('change', sync)

    return () => {
      bodyObserver.disconnect()
      rootObserver.disconnect()
      media?.removeEventListener?.('change', sync)
    }
  }, [])

  useEffect(() => {
    let active = true

    void (async () => {
      let next = createInitialState()
      try {
        const result = await loadWorkList()
        if (!active) return
        revisionRef.current = result.revision ?? null
        if (typeof result.raw === 'string' && result.raw.trim()) {
          next = decodeState(result.raw)
        } else {
          const cached = window.localStorage.getItem(STORAGE_KEY)
          next = decodeState(cached)
          if (cached) {
            const saved = await saveWorkList(next, revisionRef.current)
            if (saved.conflict) {
              revisionRef.current = saved.revision ?? null
              next = decodeState(saved.raw ?? null)
            } else {
              revisionRef.current = saved.revision ?? revisionRef.current
            }
          }
        }
        if (!active) return
        setState(next)
        setSaveStatus('saved')
      } catch {
        try {
          next = decodeState(window.localStorage.getItem(STORAGE_KEY))
        } catch {
          next = createInitialState()
        }
        if (!active) return
        setState(next)
        setSaveStatus('fallback')
      } finally {
        if (active) setLoaded(true)
      }
    })()

    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!loaded) return
    setSaveStatus(current => current === 'fallback' ? current : 'saving')
    const timer = window.setTimeout(() => {
      void saveWorkList(state, revisionRef.current).then(result => {
        if (result.conflict) {
          revisionRef.current = result.revision ?? null
          const latest = decodeState(result.raw ?? null)
          setState(latest)
          try { window.localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
          setSaveStatus('saved')
          return
        }
        revisionRef.current = result.revision ?? revisionRef.current
        try { window.localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
        setSaveStatus('saved')
      }).catch(() => {
        try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch { /* ignore */ }
        setSaveStatus('fallback')
      })
    }, 180)
    return () => window.clearTimeout(timer)
  }, [loaded, state])

  useEffect(() => {
    if (!editingTaskId) return

    const handlePointerDown = (event: PointerEvent) => {
      const shell = editorShellRef.current
      const toolbar = formatToolbarRef.current
      const target = event.target
      if (!(target instanceof Node)) return
      if (shell?.contains(target) || toolbar?.contains(target)) return
      finishTaskEdit()
    }

    document.addEventListener('pointerdown', handlePointerDown, true)
    return () => document.removeEventListener('pointerdown', handlePointerDown, true)
  }, [editingTaskId])

  const activeTasks = useMemo(() => state.tasks.filter(task => task.deletedAt === undefined), [state.tasks])
  const trashTasks = useMemo(() => state.tasks.filter(task => task.deletedAt !== undefined), [state.tasks])
  const counts = useMemo(() => {
    const result = { all: activeTasks.length, active: 0, completed: 0 }
    for (const task of activeTasks) result[task.completed ? 'completed' : 'active'] += 1
    return result
  }, [activeTasks])

  const visibleCategories = selectedCategory === 'all'
    ? state.categories
    : selectedCategory === 'trash'
      ? []
      : state.categories.filter(category => category.id === selectedCategory)
  const normalizedSearch = searchQuery.trim().toLocaleLowerCase()
  const visibleTasks = (selectedCategory === 'trash' ? trashTasks : activeTasks).filter(task => {
    if (selectedCategory !== 'all' && selectedCategory !== 'trash' && task.categoryId !== selectedCategory) return false
    if (selectedCategory !== 'trash') {
      if (filter === 'active' && task.completed) return false
      if (filter === 'completed' && !task.completed) return false
    }
    if (normalizedSearch && !task.title.toLocaleLowerCase().includes(normalizedSearch)) return false
    return true
  })
  const hasAnyTask = visibleTasks.length > 0
  const categoryName = (id: string): string => state.categories.find(category => category.id === id)?.name ?? '日常'
  const fontFamily = FONT_FAMILIES[state.fontFamily] ?? FONT_FAMILIES.system

  function submitTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const html = sanitizeRichHtml(draftEditorRef.current?.innerHTML ?? draftHtml)
    const text = htmlToPlainText(html)
    if (!text) return
    const categoryId = selectedCategory === 'all' ? draftCategory : selectedCategory
    setState(current => addTask(current, text, { categoryId, html }))
    setDraft('')
    setDraftHtml('')
    if (draftEditorRef.current) draftEditorRef.current.innerHTML = ''
    selectionRef.current = null
    historyRef.current = []
    historyIndexRef.current = -1
  }

  function submitCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const id = makeId('category')
    const next = addCategory(state, categoryDraft, { id })
    if (next === state) return
    setState(next)
    setSelectedCategory(id)
    setDraftCategory(id)
    setCategoryDraft('')
    setAddingCategory(false)
  }

  function saveTitle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setState(current => renameTitle(current, titleDraft))
    setEditingTitle(false)
  }

  function exportWorkList() {
    const raw = JSON.stringify(state, null, 2) + '\n'
    const blob = new Blob([raw], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `dsh-work-list-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }

  async function importWorkList(file: File) {
    try {
      const raw = await file.text()
      const parsed = JSON.parse(raw) as { version?: unknown }
      if (!parsed || parsed.version !== 1) throw new Error('unsupported work-list version')
      finishTaskEdit()
      setState(decodeState(raw))
      setSelectedCategory('all')
      setFilter('active')
      setSearchQuery('')
      setExpandedTaskIds(new Set())
    } catch {
      window.alert('导入失败：请选择有效的 dsh-work-list JSON 文件。')
    } finally {
      if (importFileRef.current) importFileRef.current.value = ''
    }
  }

  function toggleTaskExpanded(id: string) {
    setExpandedTaskIds(current => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function startTaskDrag(event: DragEvent<HTMLElement>, id: string) {
    setDraggedTaskId(id)
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', id)
  }

  function dropTask(event: DragEvent<HTMLDivElement>, targetId: string) {
    event.preventDefault()
    const sourceId = draggedTaskId || event.dataTransfer.getData('text/plain')
    if (!sourceId || sourceId === targetId) {
      setDragOverTaskId(null)
      return
    }
    const rect = event.currentTarget.getBoundingClientRect()
    const position = event.clientY > rect.top + rect.height / 2 ? 'after' : 'before'
    setState(current => reorderTask(current, sourceId, targetId, position))
    setDraggedTaskId(null)
    setDragOverTaskId(null)
  }

  function beginTaskEdit(id: string, title: string, html?: string) {
    const initialHtml = sanitizeRichHtml(html?.trim() ? html : plainTextToHtml(title))
    setExpandedTaskIds(current => new Set(current).add(id))
    setDraftActive(false)
    selectionRef.current = null
    historyRef.current = [initialHtml]
    historyIndexRef.current = 0
    setEditingTaskId(id)
    setEditingTaskHtml(initialHtml)
  }

  function activeEditor(): HTMLDivElement | null {
    if (editingTaskId) return editorRef.current
    if (draftActive) return draftEditorRef.current
    return null
  }

  function rememberRichSelection() {
    const editor = activeEditor()
    const selection = window.getSelection()
    if (!editor || !selection || selection.rangeCount === 0) return
    const range = selection.getRangeAt(0)
    const anchor = range.commonAncestorContainer
    if (anchor === editor || editor.contains(anchor)) selectionRef.current = range.cloneRange()
  }

  function restoreRichSelection() {
    const editor = activeEditor()
    if (!editor) return
    editor.focus()
    const range = selectionRef.current
    if (!range) return
    const selection = window.getSelection()
    if (!selection) return
    selection.removeAllRanges()
    selection.addRange(range)
  }

  function pushEditorHistory() {
    const editor = activeEditor()
    if (!editor) return
    const html = sanitizeRichHtml(editor.innerHTML)
    const history = historyRef.current
    const index = historyIndexRef.current
    if (history[index] === html) return
    const next = history.slice(0, index + 1)
    next.push(html)
    if (next.length > 120) next.shift()
    historyRef.current = next
    historyIndexRef.current = next.length - 1
  }

  function placeCaretAtEnd() {
    const editor = activeEditor()
    if (!editor) return
    const range = document.createRange()
    range.selectNodeContents(editor)
    range.collapse(false)
    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range)
    selectionRef.current = range.cloneRange()
  }

  function applyHistoryStep(direction: -1 | 1) {
    const nextIndex = historyIndexRef.current + direction
    if (nextIndex < 0 || nextIndex >= historyRef.current.length) return
    const editor = activeEditor()
    if (!editor) return
    historyIndexRef.current = nextIndex
    const html = historyRef.current[nextIndex] ?? ''
    editor.innerHTML = html
    if (editingTaskId) setEditingTaskHtml(html)
    else {
      setDraftHtml(html)
      setDraft(htmlToPlainText(html))
    }
    editor.focus()
    placeCaretAtEnd()
  }

  function syncRichDraft() {
    const editor = activeEditor()
    if (draftActive && !editingTaskId && editor) {
      const html = sanitizeRichHtml(editor.innerHTML)
      setDraftHtml(html)
      setDraft(htmlToPlainText(html))
    }
    pushEditorHistory()
    rememberRichSelection()
  }

  function activateDraftEditor() {
    if (editingTaskId) finishTaskEdit()
    setDraftActive(true)
    selectionRef.current = null
    const html = sanitizeRichHtml(draftEditorRef.current?.innerHTML ?? draftHtml)
    historyRef.current = [html]
    historyIndexRef.current = 0
  }

  function runRichCommand(command: string, value?: string) {
    if (!activeEditor()) return
    restoreRichSelection()
    try {
      document.execCommand(command, false, value)
    } catch {
      // Browsers without a command simply keep the current content.
    }
    pushEditorHistory()
    const editor = activeEditor()
    if (draftActive && !editingTaskId && editor) {
      const html = sanitizeRichHtml(editor.innerHTML)
      setDraftHtml(html)
      setDraft(htmlToPlainText(html))
    }
    rememberRichSelection()
  }

  function finishTaskEdit() {
    if (!editingTaskId) return
    const html = sanitizeRichHtml(editorRef.current?.innerHTML ?? editingTaskHtml)
    const text = htmlToPlainText(html)
    if (text && html !== editingTaskHtml) {
      setState(current => updateTaskContent(current, editingTaskId, text, html))
    }
    setEditingTaskId(null)
    setEditingTaskHtml('')
    selectionRef.current = null
    historyRef.current = []
    historyIndexRef.current = -1
  }

  function cancelTaskEdit() {
    setEditingTaskId(null)
    setEditingTaskHtml('')
    selectionRef.current = null
    historyRef.current = []
    historyIndexRef.current = -1
  }

  function renderTaskRow(task: WorkListTask, isTrash = false) {
    const expanded = expandedTaskIds.has(task.id)
    const summary = taskSummary(task.title, task.html)
    const bodyHtml = taskBodyHtml(task.title, task.html)
    const isEditing = editingTaskId === task.id
    return (
      <div
        className={`wl-task ${task.completed ? 'is-complete' : ''} ${expanded ? 'is-expanded' : ''} ${isTrash ? 'is-trash' : ''} ${dragOverTaskId === task.id ? 'is-drag-over' : ''}`}
        key={task.id}
        onDragOver={event => { if (!isTrash && draggedTaskId && draggedTaskId !== task.id) { event.preventDefault(); setDragOverTaskId(task.id) } }}
        onDragLeave={() => setDragOverTaskId(current => current === task.id ? null : current)}
        onDrop={event => { if (!isTrash) dropTask(event, task.id) }}
      >
        {!isTrash && (
          <span
            className="wl-drag-handle"
            draggable
            role="button"
            tabIndex={0}
            title="拖动排序"
            aria-label={`拖动排序：${summary}`}
            onDragStart={event => startTaskDrag(event, task.id)}
            onDragEnd={() => { setDraggedTaskId(null); setDragOverTaskId(null) }}
          >⋮⋮</span>
        )}
        {!isTrash && <input className="wl-check" type="checkbox" checked={task.completed} aria-label={`${task.completed ? '标记未完成' : '标记完成'}：${summary}`} onChange={() => setState(current => toggleTask(current, task.id))} />}
        <div className="wl-task-main">
          {isEditing && !isTrash ? (
            <div className="wl-editor-shell" ref={editorShellRef}>
              <div
                ref={editorRef}
                autoFocus
                className="wl-task-edit"
                contentEditable
                suppressContentEditableWarning
                role="textbox"
                aria-multiline="true"
                aria-label={`编辑：${summary}`}
                dangerouslySetInnerHTML={{ __html: editingTaskHtml }}
                onInput={syncRichDraft}
                onKeyUp={rememberRichSelection}
                onMouseUp={rememberRichSelection}
                onKeyDown={handleTaskEditKey}
              />
            </div>
          ) : (
            <>
              <button className="wl-task-summary" type="button" aria-expanded={expanded} onClick={() => toggleTaskExpanded(task.id)}>
                <span className="wl-task-chevron" aria-hidden="true">›</span>
                <span>{summary}</span>
              </button>
              {expanded && (
                <div className="wl-task-expanded">
                  {bodyHtml ? (
                    <div
                      className="wl-task-body"
                      title={isTrash ? undefined : '点击编辑'}
                      onClick={isTrash ? undefined : () => beginTaskEdit(task.id, task.title, task.html)}
                      dangerouslySetInnerHTML={{ __html: bodyHtml }}
                    />
                  ) : (
                    <div
                      className="wl-task-body-empty"
                      title={isTrash ? undefined : '点击编辑'}
                      onClick={isTrash ? undefined : () => beginTaskEdit(task.id, task.title, task.html)}
                    >
                      {isTrash ? '无更多内容' : '暂无正文内容'}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
        {isTrash ? (
          <>
            <time className="wl-task-date" dateTime={new Date(task.deletedAt ?? Date.now()).toISOString()}>删除于 {taskDate(task.deletedAt ?? Date.now())}</time>
            <button className="wl-trash-action" type="button" onClick={() => setState(current => restoreTask(current, task.id))}>还原</button>
            <button className="wl-trash-action is-danger" type="button" onClick={() => { if (window.confirm(`永久删除“${summary}”？此操作无法恢复。`)) setState(current => permanentlyRemoveTask(current, task.id)) }}>永久删除</button>
          </>
        ) : (
          <>
            {selectedCategory !== 'all' && <span className="wl-task-category">{categoryName(task.categoryId)}</span>}
            <time className="wl-task-date" dateTime={new Date(task.createdAt).toISOString()}>{taskDate(task.createdAt)}</time>
            <button className="wl-task-delete" type="button" aria-label={`移到回收站：${summary}`} title="移到回收站" onClick={() => setState(current => removeTask(current, task.id))}>×</button>
          </>
        )}
      </div>
    )
  }

  function renderRichToolbar() {
    const editingTask = editingTaskId ? state.tasks.find(task => task.id === editingTaskId) : undefined
    const disabled = !editingTaskId && !draftActive
    return (
      <div ref={formatToolbarRef} className={`wl-rich-toolbar wl-global-toolbar ${disabled ? 'is-disabled' : ''}`} role="toolbar" aria-label="文字格式">
        <select className="wl-rich-format" aria-label="段落样式" defaultValue="p" disabled={disabled} onMouseDown={rememberRichSelection} onChange={event => runRichCommand('formatBlock', event.target.value)}>
          <option value="p">正文</option><option value="h1">标题 1</option><option value="h2">标题 2</option><option value="h3">标题 3</option>
        </select>
        <span className="wl-rich-sep" />
        <button className="wl-rich-button" type="button" title="加粗 · Ctrl+B" disabled={disabled} onMouseDown={event => { event.preventDefault(); rememberRichSelection() }} onClick={() => runRichCommand('bold')}><b>B</b></button>
        <button className="wl-rich-button" type="button" title="斜体 · Ctrl+I" disabled={disabled} onMouseDown={event => { event.preventDefault(); rememberRichSelection() }} onClick={() => runRichCommand('italic')}><i>I</i></button>
        <button className="wl-rich-button" type="button" title="下划线 · Ctrl+U" disabled={disabled} onMouseDown={event => { event.preventDefault(); rememberRichSelection() }} onClick={() => runRichCommand('underline')}><u>U</u></button>
        <button className="wl-rich-button" type="button" title="删除线" disabled={disabled} onMouseDown={event => { event.preventDefault(); rememberRichSelection() }} onClick={() => runRichCommand('strikeThrough')}><s>S</s></button>
        <span className="wl-rich-sep" />
        <button className="wl-rich-button wl-color-button" type="button" title="默认文字颜色" disabled={disabled} onMouseDown={event => { event.preventDefault(); rememberRichSelection() }} onClick={() => runRichCommand('foreColor', scheme === 'dark' ? '#e8eaed' : '#252525')}>A<span className="wl-color-line is-default" /></button>
        <button className="wl-rich-button wl-color-button" type="button" title="灰色文字" disabled={disabled} onMouseDown={event => { event.preventDefault(); rememberRichSelection() }} onClick={() => runRichCommand('foreColor', '#9a9a9a')}>A<span className="wl-color-line is-muted" /></button>
        <button className="wl-rich-button wl-color-button" type="button" title="红色文字" disabled={disabled} onMouseDown={event => { event.preventDefault(); rememberRichSelection() }} onClick={() => runRichCommand('foreColor', '#e34d59')}>A<span className="wl-color-line is-red" /></button>
        <button className="wl-rich-button wl-color-button" type="button" title="蓝色文字" disabled={disabled} onMouseDown={event => { event.preventDefault(); rememberRichSelection() }} onClick={() => runRichCommand('foreColor', '#4e7fe8')}>A<span className="wl-color-line is-blue" /></button>
        <button className="wl-rich-button is-text" type="button" title="清除文字格式" disabled={disabled} onMouseDown={event => { event.preventDefault(); rememberRichSelection() }} onClick={() => runRichCommand('removeFormat')}>清格式</button>
        <span className="wl-rich-sep" />
        <button className="wl-rich-button is-text" type="button" title="无序列表 · Ctrl+Shift+8" disabled={disabled} onMouseDown={event => { event.preventDefault(); rememberRichSelection() }} onClick={() => runRichCommand('insertUnorderedList')}>• 列表</button>
        <button className="wl-rich-button is-text" type="button" title="编号列表 · Ctrl+Shift+7" disabled={disabled} onMouseDown={event => { event.preventDefault(); rememberRichSelection() }} onClick={() => runRichCommand('insertOrderedList')}>1. 列表</button>
        <button className="wl-rich-button" type="button" title="减少缩进" disabled={disabled} onMouseDown={event => { event.preventDefault(); rememberRichSelection() }} onClick={() => runRichCommand('outdent')}>⇤</button>
        <button className="wl-rich-button" type="button" title="增加缩进" disabled={disabled} onMouseDown={event => { event.preventDefault(); rememberRichSelection() }} onClick={() => runRichCommand('indent')}>⇥</button>
        <button className="wl-rich-button is-text" type="button" title="插入虚线分隔" disabled={disabled} onMouseDown={event => { event.preventDefault(); rememberRichSelection() }} onClick={() => runRichCommand('insertHorizontalRule')}>虚线</button>
        <span className="wl-rich-hint">
          {editingTask
            ? `正在编辑：${taskSummary(editingTask.title, editingTask.html)}`
            : draftActive
              ? '正在新增事项'
              : '点击下方输入区后即可使用格式'}
        </span>
      </div>
    )
  }

  function handleDraftKey(event: KeyboardEvent<HTMLDivElement>) {
    const mod = event.ctrlKey || event.metaKey
    const key = event.key.toLowerCase()
    if (mod && event.key === 'Enter') {
      event.preventDefault()
      event.currentTarget.closest('form')?.requestSubmit()
      return
    }
    if (mod && !event.shiftKey && (key === 'b' || key === 'i' || key === 'u')) {
      event.preventDefault()
      runRichCommand(key === 'b' ? 'bold' : key === 'i' ? 'italic' : 'underline')
      return
    }
    if (mod && event.shiftKey && event.code === 'Digit7') {
      event.preventDefault()
      runRichCommand('insertOrderedList')
      return
    }
    if (mod && event.shiftKey && event.code === 'Digit8') {
      event.preventDefault()
      runRichCommand('insertUnorderedList')
      return
    }
    if (mod && key === 'z') {
      event.preventDefault()
      applyHistoryStep(event.shiftKey ? 1 : -1)
      return
    }
    if (mod && key === 'y') {
      event.preventDefault()
      applyHistoryStep(1)
      return
    }
    if (event.key === 'Tab') {
      event.preventDefault()
      runRichCommand(event.shiftKey ? 'outdent' : 'indent')
    }
  }

  function handleTaskEditKey(event: KeyboardEvent<HTMLDivElement>) {
    const mod = event.ctrlKey || event.metaKey
    const key = event.key.toLowerCase()
    if (mod && !event.shiftKey && (key === 'b' || key === 'i' || key === 'u')) {
      event.preventDefault()
      runRichCommand(key === 'b' ? 'bold' : key === 'i' ? 'italic' : 'underline')
      return
    }
    if (mod && event.shiftKey && event.code === 'Digit7') {
      event.preventDefault()
      runRichCommand('insertOrderedList')
      return
    }
    if (mod && event.shiftKey && event.code === 'Digit8') {
      event.preventDefault()
      runRichCommand('insertUnorderedList')
      return
    }
    if (mod && key === 'z') {
      event.preventDefault()
      applyHistoryStep(event.shiftKey ? 1 : -1)
      return
    }
    if (mod && event.key.toLowerCase() === 'y') {
      event.preventDefault()
      applyHistoryStep(1)
      return
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      cancelTaskEdit()
      return
    }
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault()
      finishTaskEdit()
      return
    }
    if (event.key === 'Tab') {
      event.preventDefault()
      runRichCommand(event.shiftKey ? 'outdent' : 'indent')
    }
  }

  const rootStyle = {
    '--wl-font-size': `${state.fontSize}px`,
    '--wl-font-family': fontFamily,
  } as CSSProperties

  return (
    <main className={`wl-page is-${scheme}`} style={rootStyle}>
      <style>{WORK_LIST_STYLES}</style>
      <div className="wl-frame">
        <header className="wl-top">
          <div>
            <p className="wl-eyebrow">MY NOTE · WORK LIST</p>
            {editingTitle ? (
              <form onSubmit={saveTitle}>
                <input
                  autoFocus
                  className="wl-title-input"
                  value={titleDraft}
                  maxLength={80}
                  onChange={event => setTitleDraft(event.target.value)}
                  onBlur={() => {
                    if (titleDraft.trim()) setState(current => renameTitle(current, titleDraft))
                    setEditingTitle(false)
                  }}
                  onKeyDown={event => { if (event.key === 'Escape') setEditingTitle(false) }}
                  aria-label="清单标题"
                />
              </form>
            ) : (
              <h1 className="wl-title">
                {state.title}
                <button className="wl-title-edit" type="button" title="编辑标题" aria-label="编辑标题" onClick={() => { setTitleDraft(state.title); setEditingTitle(true) }}>✎</button>
              </h1>
            )}
            <p className="wl-subtitle">像记笔记一样整理工作，勾掉一项，就前进一步。</p>
          </div>

          <div className="wl-typography" aria-label="文字设置">
            <span className="wl-typography-label">字体</span>
            <button className="wl-size-button" type="button" aria-label="缩小字号" disabled={state.fontSize <= 12} onClick={() => setState(current => setTypography(current, { fontSize: current.fontSize - 1 }))}>−</button>
            <output className="wl-size-value" aria-live="polite">{state.fontSize}px</output>
            <button className="wl-size-button" type="button" aria-label="放大字号" disabled={state.fontSize >= 24} onClick={() => setState(current => setTypography(current, { fontSize: current.fontSize + 1 }))}>＋</button>
            <label className="wl-sr-only" htmlFor="wl-font-family">字体样式</label>
            <select id="wl-font-family" className="wl-font-select" value={state.fontFamily} onChange={event => setState(current => setTypography(current, { fontFamily: event.target.value }))}>
              {Object.entries(FONT_LABELS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
            </select>
          </div>
        </header>

        {selectedCategory !== 'trash' && (
          <>
            {renderRichToolbar()}
            <form className="wl-add" onSubmit={submitTask}>
          <span className="wl-add-mark" aria-hidden="true">＋</span>
          <label className="wl-sr-only" htmlFor="wl-new-task">添加一项</label>
          <div
            id="wl-new-task"
            ref={draftEditorRef}
            className="wl-add-input wl-add-rich-input"
            contentEditable
            suppressContentEditableWarning
            role="textbox"
            aria-multiline="true"
            aria-label="添加一项"
            data-placeholder="记下要做的事 · Enter 换行 · Ctrl+Enter 添加"
            onFocus={activateDraftEditor}
            onInput={syncRichDraft}
            onKeyUp={rememberRichSelection}
            onMouseUp={rememberRichSelection}
            onKeyDown={handleDraftKey}
          />
          <select className="wl-category-select" aria-label="事项分类" value={selectedCategory === 'all' ? draftCategory : selectedCategory} onChange={event => setDraftCategory(event.target.value)}>
            {state.categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
          <button className="wl-add-submit" type="submit" disabled={!draft.trim()}>添加</button>
            </form>
          </>
        )}

        <div className="wl-layout">
          <nav className="wl-nav" aria-label="清单分类">
            <div className="wl-nav-label">NOTEBOOK</div>
            <button className={`wl-nav-button ${selectedCategory === 'all' ? 'is-active' : ''}`} type="button" onClick={() => setSelectedCategory('all')}>
              <span className="wl-nav-icon"><ListGlyph /></span>
              <span className="wl-nav-name">全部事项</span>
              <span className="wl-nav-count">{counts.all}</span>
            </button>
            <div className="wl-nav-label">分类</div>
            {state.categories.map(category => {
              const count = activeTasks.filter(task => task.categoryId === category.id && !task.completed).length
              return (
                <div className="wl-nav-item" key={category.id}>
                  <button className={`wl-nav-button ${selectedCategory === category.id ? 'is-active' : ''}`} type="button" onClick={() => setSelectedCategory(category.id)}>
                    <span className="wl-nav-icon" aria-hidden="true">◦</span>
                    <span className="wl-nav-name">{category.name}</span>
                    <span className="wl-nav-count">{count}</span>
                  </button>
                  {!category.builtIn && (
                    <button
                      className="wl-nav-delete"
                      type="button"
                      title={`删除分类 ${category.name}`}
                      aria-label={`删除分类 ${category.name}`}
                      onClick={() => { setState(current => removeCategory(current, category.id)); if (selectedCategory === category.id) setSelectedCategory('all') }}
                    >×</button>
                  )}
                </div>
              )
            })}
            {addingCategory ? (
              <form className="wl-category-form" onSubmit={submitCategory}>
                <label className="wl-sr-only" htmlFor="wl-new-category">新分类名称</label>
                <input id="wl-new-category" autoFocus className="wl-category-input" value={categoryDraft} maxLength={32} placeholder="分类名称" onChange={event => setCategoryDraft(event.target.value)} onKeyDown={event => { if (event.key === 'Escape') { setAddingCategory(false); setCategoryDraft('') } }} />
                <button className="wl-category-save" type="submit" aria-label="保存分类">✓</button>
              </form>
            ) : (
              <button className="wl-nav-add" type="button" onClick={() => setAddingCategory(true)}>＋ 新建分类</button>
            )}
            <div className="wl-nav-label">其他</div>
            <button className={`wl-nav-button ${selectedCategory === 'trash' ? 'is-active' : ''}`} type="button" onClick={() => { finishTaskEdit(); setSelectedCategory('trash'); setSearchQuery('') }}>
              <span className="wl-nav-icon" aria-hidden="true">♲</span>
              <span className="wl-nav-name">回收站</span>
              <span className="wl-nav-count">{trashTasks.length}</span>
            </button>
          </nav>

          <section className="wl-content" aria-label="工作清单内容">
            <div className="wl-content-top">
              <h2 className="wl-view-title">{selectedCategory === 'trash' ? '回收站' : selectedCategory === 'all' ? '我的工作笔记' : categoryName(selectedCategory)}</h2>
              <div className="wl-content-tools">
                <label className="wl-search">
                  <span aria-hidden="true">⌕</span>
                  <input
                    value={searchQuery}
                    onChange={event => setSearchQuery(event.target.value)}
                    placeholder="搜索事项"
                    aria-label="搜索事项"
                  />
                  {searchQuery && <button type="button" title="清除搜索" aria-label="清除搜索" onClick={() => setSearchQuery('')}>×</button>}
                </label>
                <button className="wl-tool-button" type="button" onClick={exportWorkList}>导出</button>
                <button className="wl-tool-button" type="button" onClick={() => importFileRef.current?.click()}>导入</button>
                <input
                  ref={importFileRef}
                  className="wl-sr-only"
                  type="file"
                  accept="application/json,.json"
                  onChange={event => {
                    const file = event.target.files?.[0]
                    if (file) void importWorkList(file)
                  }}
                />
                {selectedCategory === 'trash' ? (
                  trashTasks.length > 0 && <button className="wl-clear" type="button" onClick={() => { if (window.confirm('清空回收站？此操作无法恢复。')) setState(current => emptyTrash(current)) }}>清空回收站</button>
                ) : (
                  <>
                    {counts.completed > 0 && <button className="wl-clear" type="button" title="将已完成事项移到回收站" onClick={() => setState(current => clearCompleted(current))}>清空已完成</button>}
                    <div className="wl-filter" role="group" aria-label="事项筛选">
                      {FILTERS.map(option => <button key={option.id} className={`wl-filter-button ${filter === option.id ? 'is-active' : ''}`} type="button" aria-pressed={filter === option.id} onClick={() => setFilter(option.id)}>{option.label}</button>)}
                    </div>
                  </>
                )}
              </div>
            </div>

            {hasAnyTask ? (
              selectedCategory === 'trash' ? (
                <section className="wl-section wl-trash-section">
                  <header className="wl-section-head">
                    <h3 className="wl-section-title">已删除事项</h3>
                    <span className="wl-section-count">{visibleTasks.length} 项</span>
                  </header>
                  <div className="wl-task-list">{visibleTasks.map(task => renderTaskRow(task, true))}</div>
                </section>
              ) : (
                <div>
                  {visibleCategories.map(category => {
                    const tasks = visibleTasks.filter(task => task.categoryId === category.id)
                    if (selectedCategory === 'all' && tasks.length === 0) return null
                    return (
                      <section className="wl-section" key={category.id}>
                        <header className="wl-section-head">
                          <h3 className="wl-section-title">{category.name}</h3>
                          <span className="wl-section-count">{tasks.length} 项</span>
                        </header>
                        <div className="wl-task-list">{tasks.map(task => renderTaskRow(task))}</div>
                      </section>
                    )
                  })}
                </div>
              )
            ) : (
              <div className="wl-empty">
                <div className="wl-empty-icon"><ListGlyph /></div>
                <p className="wl-empty-title">
                  {normalizedSearch
                    ? '没有找到匹配事项'
                    : selectedCategory === 'trash'
                      ? '回收站是空的'
                      : filter === 'completed'
                        ? '还没有完成的事项'
                        : '这页还很清爽'}
                </p>
                <p className="wl-empty-copy">
                  {normalizedSearch
                    ? '换一个关键词试试，搜索会匹配事项里的全部文字内容。'
                    : selectedCategory === 'trash'
                      ? '删除的事项会保留在这里，可以随时还原。'
                      : '在上方写下第一件事，按 Ctrl+Enter 或点击「添加」。清单会自动保存到 ~/.dsh/work-list.json。'}
                </p>
              </div>
            )}

            <footer className="wl-foot">
              <span>{selectedCategory === 'trash' ? `${trashTasks.length} 项在回收站` : `${counts.active} 项待完成`}</span>
              <span className={`wl-save-state is-${saveStatus}`}>
                <i className="wl-save-dot" aria-hidden="true" />
                {saveStatus === 'saved'
                  ? '已保存 · ~/.dsh/work-list.json'
                  : saveStatus === 'saving'
                    ? '正在保存…'
                    : saveStatus === 'fallback'
                      ? '宿主暂不可用 · 已保留浏览器缓存'
                      : '正在读取清单…'}
              </span>
            </footer>
          </section>
        </div>
      </div>
    </main>
  )
}
