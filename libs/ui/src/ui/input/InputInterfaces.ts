import type { ViewListener } from '../state/StateUIManager.ts'

export interface ClickableElementHolder {
  getClickableElement(): ViewListener
}
