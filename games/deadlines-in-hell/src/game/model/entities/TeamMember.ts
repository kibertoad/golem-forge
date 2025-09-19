import type { GameObjects } from 'phaser'

export enum TeamMemberRole {
  DEVELOPER = 'developer',
  ANALYST = 'analyst',
  DESIGNER = 'designer',
  QA = 'qa',
}

export interface TeamMember {
  id: string
  name: string
  role: TeamMemberRole
  assignedTo?: string // ticket id
  displayObject?: GameObjects.Container
}

export const getRoleColor = (role: TeamMemberRole): number => {
  switch (role) {
    case TeamMemberRole.DEVELOPER:
      return 0x3b82f6 // Blue
    case TeamMemberRole.ANALYST:
      return 0xef4444 // Red
    case TeamMemberRole.DESIGNER:
      return 0x10b981 // Green
    case TeamMemberRole.QA:
      return 0xf59e0b // Yellow
    default:
      return 0x9ca3af // Gray
  }
}
