import type { ComponentType } from 'react'
import { WorkListPanel } from './WorkListPanel.js'

const PANEL_ID = 'dsh-work-list'

interface SlotMetadata {
  name: 'main' | 'sidebar.panellist'
  id?: string
  key?: string
  order?: number
  label?: string
}

interface SlotService {
  inject(slot: string, setup: () => unknown): unknown
  register<Props extends object>(metadata: SlotMetadata, component: ComponentType<Props>): unknown
}

interface ClientContext {
  slots: SlotService
}

interface WorkListIconProps {
  size?: number
  active?: boolean
}

function WorkListIcon({ size = 20 }: WorkListIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8.5 6.5h11M8.5 12h11M8.5 17.5h11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="m3.5 6.5 1.2 1.2 2-2.4M3.5 12l1.2 1.2 2-2.4M3.5 17.5l1.2 1.2 2-2.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Ask Cordis to wait until the host has declared each official shell slot. */
export const inject = ['slots']

/** Register the global main panel and its official sidebar row. */
export function apply(ctx: ClientContext): void {
  ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: PANEL_ID }, WorkListPanel))
  ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
    name: 'sidebar.panellist',
    id: PANEL_ID,
    order: 35,
    label: '工作清单',
  }, WorkListIcon))
}
