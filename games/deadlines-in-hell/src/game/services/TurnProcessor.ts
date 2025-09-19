import { processTicketWork } from '../model/board/BoardBusinessLogic.ts'
import type { Ticket } from '../model/entities/Ticket.ts'

export class TurnProcessor {
  private turnNumber = 0

  public processTurn(tickets: Ticket[]): void {
    this.turnNumber++

    // Process work for each ticket with assigned team members
    for (const ticket of tickets) {
      if (ticket.assignedMembers.length > 0) {
        processTicketWork(ticket)
      }
    }
  }

  public getTurnNumber(): number {
    return this.turnNumber
  }

  public reset(): void {
    this.turnNumber = 0
  }
}
