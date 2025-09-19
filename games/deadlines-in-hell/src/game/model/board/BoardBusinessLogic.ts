import type { TeamMember } from '../entities/TeamMember.ts'
import { TeamMemberRole } from '../entities/TeamMember.ts'
import type { Ticket } from '../entities/Ticket.ts'
import { BoardColumn, BugSeverity, TicketType } from '../entities/Ticket.ts'

export function canAssignToTicket(member: TeamMember, ticket: Ticket): boolean {
  const column = ticket.column

  // Check role requirements first
  switch (column) {
    case BoardColumn.REQUIREMENT_ANALYSIS:
      if (member.role !== TeamMemberRole.ANALYST) return false
      break
    case BoardColumn.DESIGN:
      if (member.role !== TeamMemberRole.DESIGNER) return false
      // Backend tickets shouldn't be in design phase
      if (ticket.type === TicketType.BACKEND) return false
      break
    case BoardColumn.IMPLEMENTATION:
      if (member.role !== TeamMemberRole.DEVELOPER) return false
      break
    case BoardColumn.CODE_REVIEW: {
      if (member.role !== TeamMemberRole.DEVELOPER) return false
      // Prevent developer who worked longest on implementation from reviewing
      const implHistory = ticket.workHistory
        .filter((h) => h.column === BoardColumn.IMPLEMENTATION)
        .sort((a, b) => b.turnsWorked - a.turnsWorked)
      if (implHistory.length > 0 && implHistory[0].memberId === member.id) {
        return false // Can't review own code
      }
      break
    }
    case BoardColumn.QA:
      if (member.role !== TeamMemberRole.QA) return false
      break
    default:
      return false
  }

  return true
}

export function canMoveToColumn(ticket: Ticket, targetColumn: BoardColumn): boolean {
  const currentColumn = ticket.column

  // Can always move back to TODO from any column
  if (targetColumn === BoardColumn.TODO) {
    return true
  }

  // From TODO column - special rules
  if (currentColumn === BoardColumn.TODO) {
    // Bugfix and Refactoring can go directly to Implementation OR Requirements
    if (ticket.type === TicketType.BUGFIX || ticket.type === TicketType.REFACTORING) {
      return (
        targetColumn === BoardColumn.IMPLEMENTATION ||
        targetColumn === BoardColumn.REQUIREMENT_ANALYSIS
      )
    }
    // Frontend and Backend must go to Requirement Analysis
    if (ticket.type === TicketType.FRONTEND || ticket.type === TicketType.BACKEND) {
      return targetColumn === BoardColumn.REQUIREMENT_ANALYSIS
    }
  }

  // Backend tickets skip Design phase
  if (ticket.type === TicketType.BACKEND) {
    // From Requirements, can go directly to Implementation (skip Design)
    if (
      currentColumn === BoardColumn.REQUIREMENT_ANALYSIS &&
      targetColumn === BoardColumn.IMPLEMENTATION
    ) {
      return true
    }
    // Cannot go to Design phase
    if (targetColumn === BoardColumn.DESIGN) {
      return false
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

  // Can skip Code Review (go from Implementation to QA)
  if (currentColumn === BoardColumn.IMPLEMENTATION && targetColumn === BoardColumn.QA) {
    return true
  }

  // Can skip QA (go from Implementation or Code Review to Released)
  if (
    (currentColumn === BoardColumn.IMPLEMENTATION || currentColumn === BoardColumn.CODE_REVIEW) &&
    targetColumn === BoardColumn.RELEASED
  ) {
    // Only if ticket has at least half implementation progress
    const requiredProgress = Math.ceil(ticket.analysisProgress / 2)
    if (ticket.implementationProgress >= requiredProgress) {
      return true
    }
  }

  // Can skip both Code Review and QA from QA to Released
  if (currentColumn === BoardColumn.QA && targetColumn === BoardColumn.RELEASED) {
    return true
  }

  // Can move backward one step (except from Released)
  if (targetIndex === currentIndex - 1 && currentColumn !== BoardColumn.RELEASED) {
    return true
  }

  return false
}

export function canMoveToNextColumn(ticket: Ticket): boolean {
  // Need at least 1 progress in the appropriate category to move forward
  const column = ticket.column

  switch (column) {
    case BoardColumn.REQUIREMENT_ANALYSIS:
      return ticket.analysisProgress > 0
    case BoardColumn.DESIGN:
      return ticket.designProgress > 0
    case BoardColumn.IMPLEMENTATION:
      return ticket.implementationProgress > 0
    default:
      return true // Code review and QA don't need progress to move forward
  }
}

export function processTicketWork(ticket: Ticket): void {
  if (ticket.assignedMembers.length === 0) return

  const column = ticket.column

  // Update work history for assigned members
  for (const member of ticket.assignedMembers) {
    const history = ticket.workHistory.find((h) => h.memberId === member.id && h.column === column)
    if (history) {
      history.turnsWorked++
    } else {
      ticket.workHistory.push({
        memberId: member.id,
        turnsWorked: 1,
        column,
      })
    }
  }

  switch (column) {
    case BoardColumn.REQUIREMENT_ANALYSIS:
      // Analysis phase: add analysis progress (2x speed)
      if (ticket.analysisProgress < ticket.complexity) {
        ticket.analysisProgress += ticket.assignedMembers.length * 2
        ticket.analysisProgress = Math.min(ticket.analysisProgress, ticket.complexity)
      }
      // Analysts add MAX confidence (empty rectangles), not actual confidence
      if (ticket.maxConfidence < ticket.complexity) {
        ticket.maxConfidence += ticket.assignedMembers.length
        ticket.maxConfidence = Math.min(ticket.maxConfidence, ticket.complexity)
      }
      break

    case BoardColumn.DESIGN: {
      // Design phase: add design progress (2x speed, only for frontend/refactoring)
      // Design progress cannot exceed analysis progress
      const maxDesignProgress = ticket.analysisProgress
      if (ticket.designProgress < maxDesignProgress) {
        ticket.designProgress += ticket.assignedMembers.length * 2
        ticket.designProgress = Math.min(ticket.designProgress, maxDesignProgress)
      }
      // Designers slowly increase actual confidence
      if (ticket.confidence < ticket.maxConfidence) {
        ticket.confidence += ticket.assignedMembers.length * 0.5
        ticket.confidence = Math.min(ticket.confidence, ticket.maxConfidence)
      }
      break
    }

    case BoardColumn.IMPLEMENTATION: {
      // Implementation: add implementation progress (1x speed - slower than analysis/design)
      // Cannot exceed analysis progress (backend) or design progress (frontend)
      let maxImplProgress: number
      if (ticket.type === TicketType.BACKEND || ticket.type === TicketType.BUGFIX) {
        maxImplProgress = ticket.analysisProgress
      } else {
        // Frontend and refactoring use design progress if available
        maxImplProgress =
          ticket.designProgress > 0 ? ticket.designProgress : ticket.analysisProgress
      }

      if (ticket.implementationProgress < maxImplProgress) {
        ticket.implementationProgress += ticket.assignedMembers.length
        ticket.implementationProgress = Math.min(ticket.implementationProgress, maxImplProgress)
      }
      // Implementation doesn't increase confidence much
      if (ticket.confidence < ticket.maxConfidence) {
        ticket.confidence += ticket.assignedMembers.length * 0.2
        ticket.confidence = Math.min(ticket.confidence, ticket.maxConfidence)
      }
      break
    }

    case BoardColumn.CODE_REVIEW:
      // Code review: increase confidence much faster, no progress
      if (ticket.confidence < ticket.maxConfidence) {
        ticket.confidence += ticket.assignedMembers.length * 2
        ticket.confidence = Math.min(ticket.confidence, ticket.maxConfidence)
      }
      break

    case BoardColumn.QA:
      // Testing: increase confidence much faster and find bugs, no progress
      if (ticket.confidence < ticket.maxConfidence) {
        ticket.confidence += ticket.assignedMembers.length * 2
        ticket.confidence = Math.min(ticket.confidence, ticket.maxConfidence)
      }

      // Find bugs based on confidence level
      if (ticket.bugs.length === 0 && ticket.confidence < 10) {
        const bugChance = (10 - ticket.confidence) / 10

        // Check for each bug severity
        if (Math.random() < bugChance * 0.3) {
          ticket.bugs.push({ severity: BugSeverity.CRITICAL, found: true })
        }
        if (Math.random() < bugChance * 0.5) {
          ticket.bugs.push({ severity: BugSeverity.MAJOR, found: true })
        }
        if (Math.random() < bugChance * 0.7) {
          ticket.bugs.push({ severity: BugSeverity.MINOR, found: true })
        }
      }
      break
  }
}
