import type { CSSProperties } from 'react'

/**
 * The 7-slot ring around the brain (docs/09_ui_pipeline.md spawn order):
 * LowerLeft, LeftCenter, UpperLeft, UpperRight, RightCenter, LowerRight, BottomCenter.
 * The centre stays clear so the brain is never obscured. Panels are assigned slots by
 * their position in selection order.
 */
export type Side = 'left' | 'right' | 'bottom'

export interface Slot {
  style: CSSProperties
  side: Side
}

const SLOTS: Slot[] = [
  { side: 'left', style: { left: '2.5%', bottom: '7%' } }, // 1 LowerLeft
  { side: 'left', style: { left: '2.5%', top: '50%', transform: 'translateY(-50%)' } }, // 2 LeftCenter
  { side: 'left', style: { left: '2.5%', top: '13%' } }, // 3 UpperLeft
  { side: 'right', style: { right: '2.5%', top: '13%' } }, // 4 UpperRight
  { side: 'right', style: { right: '2.5%', top: '50%', transform: 'translateY(-50%)' } }, // 5 RightCenter
  { side: 'right', style: { right: '2.5%', bottom: '7%' } }, // 6 LowerRight
  { side: 'bottom', style: { left: '50%', bottom: '3%', transform: 'translateX(-50%)' } }, // 7 BottomCenter
]

export function slotForOrder(order: number): Slot {
  return SLOTS[Math.min(Math.max(order, 0), SLOTS.length - 1)]
}
