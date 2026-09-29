export type FontFamily = 'system' | 'rounded' | 'serif'

export interface WorkListCategory {
  id: string
  name: string
  builtIn: boolean
  tone: string
}

export interface WorkListTask {
  id: string
  title: string
  html?: string
  categoryId: string
  completed: boolean
  createdAt: number
  deletedAt?: number
  deletedCategoryId?: string
}

export interface WorkListState {
  version: 1
  title: string
  categories: WorkListCategory[]
  tasks: WorkListTask[]
  fontSize: number
  fontFamily: FontFamily
}

export const STORAGE_KEY: string
export const DEFAULT_CATEGORIES: WorkListCategory[]
export const FONT_FAMILIES: Record<FontFamily, string>
export function makeId(prefix?: string): string
export function createInitialState(): WorkListState
export function decodeState(raw: string | null): WorkListState
export function addTask(state: WorkListState, title: string, options?: { categoryId?: string; id?: string; createdAt?: number; html?: string }): WorkListState
export function updateTaskContent(state: WorkListState, id: string, title: string, html?: string): WorkListState
export function updateTaskTitle(state: WorkListState, id: string, title: string): WorkListState
export function toggleTask(state: WorkListState, id: string): WorkListState
export function removeTask(state: WorkListState, id: string, options?: { deletedAt?: number }): WorkListState
export function restoreTask(state: WorkListState, id: string): WorkListState
export function permanentlyRemoveTask(state: WorkListState, id: string): WorkListState
export function emptyTrash(state: WorkListState): WorkListState
export function clearCompleted(state: WorkListState, options?: { deletedAt?: number }): WorkListState
export function reorderTask(state: WorkListState, sourceId: string, targetId: string, position?: 'before' | 'after'): WorkListState
export function addCategory(state: WorkListState, name: string, options?: { id?: string }): WorkListState
export function removeCategory(state: WorkListState, id: string): WorkListState
export function renameTitle(state: WorkListState, title: string): WorkListState
export function setTypography(state: WorkListState, options?: { fontSize?: number; fontFamily?: string }): WorkListState
