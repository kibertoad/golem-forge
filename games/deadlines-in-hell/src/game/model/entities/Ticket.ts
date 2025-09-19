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

export enum BugSeverity {
  MINOR = 'minor',
  MAJOR = 'major',
  CRITICAL = 'critical',
}

export interface Bug {
  severity: BugSeverity
  found: boolean
}

export interface WorkHistory {
  memberId: string
  turnsWorked: number
  column: BoardColumn // Track which phase they worked in
}

export interface Ticket {
  id: string
  type: TicketType
  title: string
  column: BoardColumn
  assignedMembers: TeamMember[]
  complexity: number // 1-10, determines number of progress rectangles
  analysisProgress: number // 0 to complexity, red rectangles
  designProgress: number // 0 to analysisProgress, green rectangles (frontend only)
  implementationProgress: number // 0 to max(analysis or design), blue rectangles
  maxConfidence: number // 0 to complexity, set by analysts (empty confidence rectangles)
  confidence: number // 0 to maxConfidence, filled confidence rectangles
  bugs: Bug[] // Bugs found during testing
  workHistory: WorkHistory[] // Track who worked on the ticket and for how long
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

export const getTicketComplexity = (type: TicketType): number => {
  switch (type) {
    case TicketType.BUGFIX:
      return Math.floor(Math.random() * 3) + 2 // 2-4
    case TicketType.REFACTORING:
      return Math.floor(Math.random() * 3) + 4 // 4-6
    case TicketType.FRONTEND:
      return Math.floor(Math.random() * 4) + 5 // 5-8
    case TicketType.BACKEND:
      return Math.floor(Math.random() * 4) + 6 // 6-9
    default:
      return 5
  }
}

export const getBugSymbol = (severity: BugSeverity): string => {
  switch (severity) {
    case BugSeverity.MINOR:
      return '🐛' // Small bug
    case BugSeverity.MAJOR:
      return '🐞' // Ladybug
    case BugSeverity.CRITICAL:
      return '🦗' // Cricket (bigger bug)
    default:
      return '🐛'
  }
}
