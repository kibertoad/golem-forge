import type { TeamMember } from '../entities/TeamMember.ts'
import { TeamMemberRole } from '../entities/TeamMember.ts'
import type { Ticket } from '../entities/Ticket.ts'
import { BoardColumn, TicketType } from '../entities/Ticket.ts'

export function canAssignToTicket(member: TeamMember, ticket: Ticket): boolean {
  const column = ticket.column

  switch (column) {
    case BoardColumn.REQUIREMENT_ANALYSIS:
      return member.role === TeamMemberRole.ANALYST
    case BoardColumn.DESIGN:
      return member.role === TeamMemberRole.DESIGNER
    case BoardColumn.IMPLEMENTATION:
    case BoardColumn.CODE_REVIEW:
      return member.role === TeamMemberRole.DEVELOPER
    case BoardColumn.QA:
      return member.role === TeamMemberRole.QA
    default:
      return false
  }
}

export function canMoveToColumn(ticket: Ticket, targetColumn: BoardColumn): boolean {
  const currentColumn = ticket.column

  // Can always move back to TODO from any column
  if (targetColumn === BoardColumn.TODO) {
    return true
  }

  // From TODO column - special rules
  if (currentColumn === BoardColumn.TODO) {
    // Bugfix can only go directly to Implementation
    if (ticket.type === TicketType.BUGFIX) {
      return targetColumn === BoardColumn.IMPLEMENTATION
    }
    // Refactoring can only go directly to Implementation
    if (ticket.type === TicketType.REFACTORING) {
      return targetColumn === BoardColumn.IMPLEMENTATION
    }
    // Frontend and Backend must go to Requirement Analysis
    if (ticket.type === TicketType.FRONTEND || ticket.type === TicketType.BACKEND) {
      return targetColumn === BoardColumn.REQUIREMENT_ANALYSIS
    }
  }

  // From other columns - normal workflow
  const columnOrder = [
    BoardColumn.TODO,
    BoardColumn.REQUIREMENT_ANALYSIS,
    BoardColumn.DESIGN,
    BoardColumn.IMPLEMENTATION,
    BoardColumn.CODE_REVIEW,
    BoardColumn.QA,
    BoardColumn.RELEASED,
  ]

  const currentIndex = columnOrder.indexOf(currentColumn)
  const targetIndex = columnOrder.indexOf(targetColumn)

  // Special rules for bugfixes and refactoring - they skip requirements and design
  if (ticket.type === TicketType.BUGFIX || ticket.type === TicketType.REFACTORING) {
    // Cannot go to Requirements or Design from any column
    if (targetColumn === BoardColumn.REQUIREMENT_ANALYSIS || targetColumn === BoardColumn.DESIGN) {
      return false
    }
  }

  // Can move forward one step
  if (targetIndex === currentIndex + 1) {
    return true
  }

  // Can move backward one step (except from Released)
  if (targetIndex === currentIndex - 1 && currentColumn !== BoardColumn.RELEASED) {
    return true
  }

  return false
}
