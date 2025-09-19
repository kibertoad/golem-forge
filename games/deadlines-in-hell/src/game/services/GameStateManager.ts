import type { TeamMember } from '../model/entities/TeamMember.ts'
import { TeamMemberRole } from '../model/entities/TeamMember.ts'
import type { Ticket } from '../model/entities/Ticket.ts'
import { BoardColumn, getTicketComplexity, TicketType } from '../model/entities/Ticket.ts'
import type { TurnProcessor } from './TurnProcessor.ts'
import type { WorkflowManager } from './WorkflowManager.ts'

export interface Dependencies {
  turnProcessor: TurnProcessor
  workflowManager: WorkflowManager
}

export class GameStateManager {
  private tickets: Ticket[] = []
  private teamMembers: TeamMember[] = []
  private readonly turnProcessor: TurnProcessor
  private readonly workflowManager: WorkflowManager

  constructor({ turnProcessor, workflowManager }: Dependencies) {
    this.turnProcessor = turnProcessor
    this.workflowManager = workflowManager
    this.initializeGame()
  }

  private initializeGame(): void {
    this.initializeTickets()
    this.initializeTeamMembers()
  }

  private initializeTickets(): void {
    const ticketTypes = [
      TicketType.BUGFIX,
      TicketType.REFACTORING,
      TicketType.FRONTEND,
      TicketType.BACKEND,
      TicketType.FRONTEND,
    ]
    const titles = [
      'Fix login bug',
      'Refactor auth module',
      'Create dashboard UI',
      'Implement API endpoint',
      'Update user profile',
    ]

    this.tickets = ticketTypes.map((type, index) => {
      const complexity = getTicketComplexity(type)
      return {
        id: `${index + 1}`,
        type,
        title: titles[index],
        column: BoardColumn.TODO,
        assignedMembers: [],
        complexity,
        analysisProgress: 0,
        designProgress: 0,
        implementationProgress: 0,
        maxConfidence: 0,
        confidence: 0,
        bugs: [],
        workHistory: [],
      }
    })
  }

  private initializeTeamMembers(): void {
    this.teamMembers = [
      { id: 'dev1', name: 'Dev 1', role: TeamMemberRole.DEVELOPER },
      { id: 'dev2', name: 'Dev 2', role: TeamMemberRole.DEVELOPER },
      { id: 'analyst1', name: 'Analyst 1', role: TeamMemberRole.ANALYST },
      { id: 'designer1', name: 'Designer 1', role: TeamMemberRole.DESIGNER },
      { id: 'qa1', name: 'QA 1', role: TeamMemberRole.QA },
    ]
  }

  public getTickets(): Ticket[] {
    return this.tickets
  }

  public getTeamMembers(): TeamMember[] {
    return this.teamMembers
  }

  public processTurn(): void {
    this.turnProcessor.processTurn(this.tickets)
  }

  public moveTicket(ticket: Ticket, targetColumn: BoardColumn): boolean {
    return this.workflowManager.moveTicket(ticket, targetColumn)
  }

  public assignMemberToTicket(member: TeamMember, ticket: Ticket): boolean {
    // First remove from any current ticket
    const currentTicket = this.tickets.find((t) => t.id === member.assignedTo)
    if (currentTicket) {
      this.workflowManager.removeMemberFromTicket(member, currentTicket)
    }

    return this.workflowManager.assignMember(member, ticket)
  }

  public unassignMember(member: TeamMember): void {
    const currentTicket = this.tickets.find((t) => t.id === member.assignedTo)
    if (currentTicket) {
      this.workflowManager.removeMemberFromTicket(member, currentTicket)
    }
  }

  public canAssignMemberToTicket(member: TeamMember, ticket: Ticket): boolean {
    return this.workflowManager.canAssignMember(member, ticket)
  }

  public canMoveTicket(ticket: Ticket, targetColumn: BoardColumn): boolean {
    return this.workflowManager.canMoveTicket(ticket, targetColumn)
  }

  public reset(): void {
    this.turnProcessor.reset()
    this.initializeGame()
  }
}
