import test from 'node:test'
import assert from 'node:assert/strict'
import {
  addCategory,
  addTask,
  clearCompleted,
  createInitialState,
  decodeState,
  emptyTrash,
  permanentlyRemoveTask,
  removeCategory,
  removeTask,
  reorderTask,
  restoreTask,
  setTypography,
  toggleTask,
  updateTaskTitle,
} from '../src/client/model.mjs'

test('starts with useful muted groups and empty checklist', () => {
  const state = createInitialState()
  assert.deepEqual(state.categories.map(category => category.name), ['日常', '工作', '学习', '生活'])
  assert.deepEqual(state.tasks, [])
  assert.equal(state.fontSize, 16)
})

test('adds trimmed checklist entries and toggles completion immutably', () => {
  const initial = createInitialState()
  const added = addTask(initial, '  写周报  ', { id: 'task-1', categoryId: 'work', createdAt: 1 })
  assert.equal(initial.tasks.length, 0)
  assert.equal(added.tasks[0].title, '写周报')
  assert.equal(added.tasks[0].categoryId, 'work')
  const completed = toggleTask(added, 'task-1')
  assert.equal(completed.tasks[0].completed, true)
  const cleared = clearCompleted(completed, { deletedAt: 99 })
  assert.equal(cleared.tasks.length, 1)
  assert.equal(cleared.tasks[0].deletedAt, 99)
})

test('keeps multiline notes and allows editing after creation', () => {
  const initial = createInitialState()
  const added = addTask(initial, '第一行\n第二行', { id: 'task-edit', categoryId: 'work' })
  assert.equal(added.tasks[0].title, '第一行\n第二行')
  const edited = updateTaskTitle(added, 'task-edit', '第一行\n第二行已修改\n第三行')
  assert.equal(edited.tasks[0].title, '第一行\n第二行已修改\n第三行')
})

test('adds custom groups and moves their tasks to inbox when removed', () => {
  const initial = createInitialState()
  const categorized = addCategory(initial, '项目A', { id: 'project-a' })
  const withTask = addTask(categorized, '整理材料', { categoryId: 'project-a', id: 'task-2' })
  const removed = removeCategory(withTask, 'project-a')
  assert.equal(removed.categories.some(category => category.id === 'project-a'), false)
  assert.equal(removed.tasks[0].categoryId, 'inbox')
  assert.equal(removeCategory(removed, 'work'), removed)
})

test('decodes persisted data defensively and clamps typography', () => {
  const decoded = decodeState(JSON.stringify({
    version: 1,
    categories: [{ id: 'work', name: '工作事项' }, { id: 'custom', name: '研究' }],
    tasks: [
      { id: 'x', title: '测试', categoryId: 'missing', completed: true },
      { id: 'trash', title: '已删除', categoryId: 'work', completed: false, deletedAt: 123, deletedCategoryId: 'work' },
    ],
    fontSize: 999,
    fontFamily: 'not-a-font',
  }))
  assert.equal(decoded.categories.find(category => category.id === 'work').name, '工作事项')
  assert.equal(decoded.tasks[0].categoryId, 'inbox')
  assert.equal(decoded.tasks[1].deletedAt, 123)
  assert.equal(decoded.tasks[1].deletedCategoryId, 'work')
  assert.equal(decoded.fontSize, 24)
  assert.equal(decoded.fontFamily, 'system')
  assert.equal(decodeState('{broken').tasks.length, 0)
})

test('keeps font controls within supported options', () => {
  const initial = createInitialState()
  const large = setTypography(initial, { fontSize: 22, fontFamily: 'serif' })
  assert.equal(large.fontSize, 22)
  assert.equal(large.fontFamily, 'serif')
  assert.equal(setTypography(large, { fontSize: 500 }).fontSize, 24)
})


test('moves tasks to trash, restores them, and permanently deletes them', () => {
  let state = createInitialState()
  state = addTask(state, '回收站测试', { id: 'trash-1', categoryId: 'work', createdAt: 1 })
  const trashed = removeTask(state, 'trash-1', { deletedAt: 10 })
  assert.equal(trashed.tasks[0].deletedAt, 10)
  assert.equal(trashed.tasks[0].deletedCategoryId, 'work')

  const restored = restoreTask(trashed, 'trash-1')
  assert.equal(restored.tasks[0].deletedAt, undefined)
  assert.equal(restored.tasks[0].categoryId, 'work')

  const trashedAgain = removeTask(restored, 'trash-1', { deletedAt: 20 })
  assert.equal(permanentlyRemoveTask(trashedAgain, 'trash-1').tasks.length, 0)

  const two = addTask(trashedAgain, '第二项', { id: 'trash-2', categoryId: 'work' })
  const twoTrashed = removeTask(two, 'trash-2', { deletedAt: 30 })
  assert.equal(emptyTrash(twoTrashed).tasks.length, 0)
})

test('restores a trashed task to inbox when its original category no longer exists', () => {
  let state = addCategory(createInitialState(), '临时分类', { id: 'temp' })
  state = addTask(state, '临时事项', { id: 'temp-task', categoryId: 'temp' })
  state = removeTask(state, 'temp-task', { deletedAt: 10 })
  state = removeCategory(state, 'temp')
  const restored = restoreTask(state, 'temp-task')
  assert.equal(restored.tasks[0].categoryId, 'inbox')
})

test('reorders active tasks only within the same category', () => {
  let state = createInitialState()
  state = addTask(state, 'A', { id: 'a', categoryId: 'work' })
  state = addTask(state, 'B', { id: 'b', categoryId: 'work' })
  state = addTask(state, 'C', { id: 'c', categoryId: 'work' })
  const reordered = reorderTask(state, 'c', 'a', 'before')
  assert.deepEqual(reordered.tasks.map(task => task.id), ['c', 'a', 'b'])
  const crossCategory = addTask(reordered, 'D', { id: 'd', categoryId: 'life' })
  assert.equal(reorderTask(crossCategory, 'd', 'a'), crossCategory)
})
