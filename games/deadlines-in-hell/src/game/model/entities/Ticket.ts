import type { GameObjects } from 'phaser'
import type { TeamMember } from './TeamMember.ts'

export enum TicketType {
  BUGFIX = 'bugfix',
  REFACTORING = 'refactoring',
  FRONTEND = 'frontend',
  BACKEND = 'backend',
}

export enum BoardColumn {
  TODO = 'todo',
  REQUIREMENT_ANALYSIS = 'requirement_analysis',
  DESIGN = 'design',
  IMPLEMENTATION = 'implementation',
  CODE_REVIEW = 'code_review',
  QA = 'qa',
  RELEASED = 'released',
}

export interface Ticket {
  id: string
  type: TicketType
  title: string
  column: BoardColumn
  assignedMembers: TeamMember[]
  displayObject?: GameObjects.Container
}

export const getTicketColor = (type: TicketType): number => {
  switch (type) {
    case TicketType.BUGFIX:
      return 0xef4444 // Red
    case TicketType.REFACTORING:
      return 0x10b981 // Green
    case TicketType.FRONTEND:
      return 0x3b82f6 // Blue
    case TicketType.BACKEND:
      return 0xf59e0b // Darker amber/orange-yellow for better contrast
    default:
      return 0x9ca3af // Gray
  }
}
