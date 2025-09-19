import { canAssignToTicket, canMoveToColumn } from '../model/board/BoardBusinessLogic.ts'
import type { TeamMember } from '../model/entities/TeamMember.ts'
import type { BoardColumn, Ticket } from '../model/entities/Ticket.ts'

export class WorkflowManager {
  /**
   * Check if a team member can be assigned to a ticket
   */
  public canAssignMember(member: TeamMember, ticket: Ticket): boolean {
    return canAssignToTicket(member, ticket)
  }

  /**
   * Check if a ticket can be moved to a target column
   */
  public canMoveTicket(ticket: Ticket, targetColumn: BoardColumn): boolean {
    return canMoveToColumn(ticket, targetColumn)
  }

  /**
   * Move a ticket to a new column and handle team member removal
   */
  public moveTicket(ticket: Ticket, targetColumn: BoardColumn): boolean {
    if (!this.canMoveTicket(ticket, targetColumn)) {
      return false
    }

    // Remove all assigned team members when moving to a new column
    if (ticket.assignedMembers.length > 0) {
      for (const member of ticket.assignedMembers) {
        member.assignedTo = undefined
      }
      ticket.assignedMembers = []
    }

    ticket.column = targetColumn
    return true
  }

  /**
   * Assign a team member to a ticket
   */
  public assignMember(member: TeamMember, ticket: Ticket): boolean {
    if (!this.canAssignMember(member, ticket)) {
      return false
    }

    // Remove from current ticket if assigned
    if (member.assignedTo) {
      this.unassignMember(member)
    }

    // Assign to new ticket
    member.assignedTo = ticket.id
    ticket.assignedMembers.push(member)
    return true
  }

  /**
   * Remove a team member from their current ticket
   */
  public unassignMember(member: TeamMember): void {
    if (!member.assignedTo) return

    // This would need access to all tickets to find and remove the member
    // For now, just clear the assignment
    member.assignedTo = undefined
  }

  /**
   * Remove a specific member from a ticket
   */
  public removeMemberFromTicket(member: TeamMember, ticket: Ticket): void {
    const index = ticket.assignedMembers.findIndex((m) => m.id === member.id)
    if (index !== -1) {
      ticket.assignedMembers.splice(index, 1)
      member.assignedTo = undefined
    }
  }
}
