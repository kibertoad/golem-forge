import {
  createGlobalPositionLabel,
  createGlobalTrackerLabel,
  PotatoScene,
  SpriteBuilder,
  updateGlobalPositionLabel,
  updateGlobalTrackerLabel,
} from '@potato-golem/ui'
import type { GameObjects } from 'phaser'
import { entityDefinitions } from '../../model/definitions/entityDefinitions.ts'
import type { Dependencies } from '../../model/diConfig.ts'
import { EntityModel } from '../../model/entities/EntityModel.ts'
import type { WorldModel } from '../../model/entities/WorldModel.ts'
import type { EndTurnProcessor } from '../../model/processors/EndTurnProcessor.ts'
import { DepthRegistry } from '../../registries/depthRegistry.ts'
import { eventEmitters } from '../../registries/eventEmitterRegistry.ts'
import { imageRegistry } from '../../registries/imageRegistry.ts'
import { sceneRegistry } from '../../registries/sceneRegistry.ts'
import { EntityView } from './molecules/EntityView.js'

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

interface Ticket {
  id: string
  type: TicketType
  title: string
  column: BoardColumn
  displayObject?: GameObjects.Container
}

export class BoardScene extends PotatoScene {
  private readonly worldModel: WorldModel

  private globalPositionLabel!: GameObjects.Text
  private globalTrackerLabel!: GameObjects.Text

  private backgroundImage!: GameObjects.Sprite
  private readonly endTurnProcessor: EndTurnProcessor

  private tickets: Ticket[] = []
  private columns: Map<BoardColumn, GameObjects.Container> = new Map()
  private draggedTicket: Ticket | null = null
  private columnHeaders: Map<BoardColumn, GameObjects.Text> = new Map()

  constructor({ worldModel, endTurnProcessor, globalSceneEventEmitter }: Dependencies) {
    super(globalSceneEventEmitter, sceneRegistry.BOARD_SCENE)

    this.worldModel = worldModel
    this.endTurnProcessor = endTurnProcessor
  }

  init() {
    this.initializeTickets()

    eventEmitters.boardEmitter.on('destroyEntity', ({ entityUuid }) => {
      /*
      if (entity.type === EntityTypeRegistry.DEFAULT) {
        this.worldModel.removeEntity(entity.id)
        this.destroyChildByModelId(entity.id)
      }

       */
    })
  }

  private initializeTickets() {
    this.tickets = [
      { id: '1', type: TicketType.BUGFIX, title: 'Fix login bug', column: BoardColumn.TODO },
      { id: '2', type: TicketType.REFACTORING, title: 'Refactor auth module', column: BoardColumn.TODO },
      { id: '3', type: TicketType.FRONTEND, title: 'Create dashboard UI', column: BoardColumn.TODO },
      { id: '4', type: TicketType.BACKEND, title: 'Implement API endpoint', column: BoardColumn.TODO },
      { id: '5', type: TicketType.FRONTEND, title: 'Update user profile', column: BoardColumn.TODO },
    ]
  }

  private getTicketColor(type: TicketType): number {
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

  private canMoveToColumn(ticket: Ticket, targetColumn: BoardColumn): boolean {
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
    if ((ticket.type === TicketType.BUGFIX || ticket.type === TicketType.REFACTORING)) {
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

  private createTicketDisplay(ticket: Ticket): GameObjects.Container {
    const container = this.add.container(0, 0)

    const ticketWidth = 160
    const ticketHeight = 100

    const bg = this.add.graphics()
    bg.fillStyle(this.getTicketColor(ticket.type), 1)
    bg.fillRoundedRect(0, 0, ticketWidth, ticketHeight, 10)
    container.add(bg)

    const title = this.add.text(ticketWidth / 2, 30, ticket.title, {
      fontSize: '18px',
      color: '#ffffff',
      wordWrap: { width: ticketWidth - 20 },
    })
    title.setOrigin(0.5, 0.5)
    container.add(title)

    const typeLabel = this.add.text(ticketWidth / 2, 70, ticket.type.toUpperCase(), {
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold',
    })
    typeLabel.setOrigin(0.5, 0.5)
    container.add(typeLabel)

    bg.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, ticketWidth, ticketHeight),
      Phaser.Geom.Rectangle.Contains,
    )

    this.input.setDraggable(bg)

    bg.on('dragstart', () => {
      this.draggedTicket = ticket
      container.setDepth(DepthRegistry.BOARD_BACKGROUND + 100)
      container.setAlpha(0.8)
    })

    bg.on('drag', (pointer: Phaser.Input.Pointer) => {
      container.x = pointer.x - ticketWidth / 2
      container.y = pointer.y - ticketHeight / 2
    })

    bg.on('dragend', (pointer: Phaser.Input.Pointer) => {
      if (!this.draggedTicket) return

      let targetColumn: BoardColumn | null = null

      // Check which column the pointer is over based on x coordinates
      const columnDefinitions = [
        { key: BoardColumn.TODO, x: 110 },
        { key: BoardColumn.REQUIREMENT_ANALYSIS, x: 300 },
        { key: BoardColumn.DESIGN, x: 490 },
        { key: BoardColumn.IMPLEMENTATION, x: 680 },
        { key: BoardColumn.CODE_REVIEW, x: 870 },
        { key: BoardColumn.QA, x: 1060 },
        { key: BoardColumn.RELEASED, x: 1250 },
      ]

      for (const colDef of columnDefinitions) {
        // Check if pointer is within column bounds (column width is 170)
        if (pointer.x >= colDef.x - 85 && pointer.x <= colDef.x + 85) {
          targetColumn = colDef.key
          break
        }
      }

      if (targetColumn && this.canMoveToColumn(this.draggedTicket, targetColumn)) {
        this.draggedTicket.column = targetColumn
        this.updateBoard()
      } else {
        // Return to original position
        this.updateBoard()
      }

      container.setAlpha(1)
      this.draggedTicket = null
    })

    ticket.displayObject = container
    return container
  }

  private updateBoard() {
    for (const ticket of this.tickets) {
      if (ticket.displayObject) {
        ticket.displayObject.destroy()
      }
    }

    const ticketsInColumns: Map<BoardColumn, Ticket[]> = new Map()
    for (const column of Object.values(BoardColumn)) {
      ticketsInColumns.set(column as BoardColumn, [])
    }

    for (const ticket of this.tickets) {
      ticketsInColumns.get(ticket.column)?.push(ticket)
    }

    for (const [column, tickets] of ticketsInColumns) {
      const columnContainer = this.columns.get(column)
      if (!columnContainer) continue

      tickets.forEach((ticket, index) => {
        const ticketDisplay = this.createTicketDisplay(ticket)
        // Position tickets properly centered within their columns
        ticketDisplay.x = columnContainer.x - 80  // Center the ticket (width is 160)
        ticketDisplay.y = 160 + index * 110  // Start below header with more spacing
        ticketDisplay.setDepth(DepthRegistry.BOARD_BACKGROUND + 10)
      })
    }
  }

  preload() {}

  override update() {
    updateGlobalPositionLabel(this.globalPositionLabel)
    updateGlobalTrackerLabel(this.globalTrackerLabel)
  }

  create() {
    const bg = this.add.graphics()
    bg.fillStyle(0x1a1a2e, 1)
    bg.fillRect(0, 0, 1480, 800)
    bg.setDepth(DepthRegistry.BOARD_BACKGROUND - 10)

    const title = this.add.text(740, 40, 'Sprint Board - Deadlines in Hell', {
      fontSize: '36px',
      color: '#ffffff',
      fontStyle: 'bold',
    })
    title.setOrigin(0.5, 0.5)
    title.setDepth(DepthRegistry.BOARD_BACKGROUND)

    const columnDefinitions = [
      { key: BoardColumn.TODO, title: 'To Do', x: 110 },
      { key: BoardColumn.REQUIREMENT_ANALYSIS, title: 'Requirements', x: 300 },
      { key: BoardColumn.DESIGN, title: 'Design', x: 490 },
      { key: BoardColumn.IMPLEMENTATION, title: 'Implementation', x: 680 },
      { key: BoardColumn.CODE_REVIEW, title: 'Code Review', x: 870 },
      { key: BoardColumn.QA, title: 'QA', x: 1060 },
      { key: BoardColumn.RELEASED, title: 'Released', x: 1250 },
    ]

    for (const colDef of columnDefinitions) {
      const columnBg = this.add.graphics()
      columnBg.fillStyle(0x2d3748, 0.3)
      columnBg.fillRoundedRect(colDef.x - 85, 100, 170, 660, 10)
      columnBg.setDepth(DepthRegistry.BOARD_BACKGROUND)

      const header = this.add.text(colDef.x, 120, colDef.title, {
        fontSize: '20px',
        color: '#e2e8f0',
        fontStyle: 'bold',
      })
      header.setOrigin(0.5, 0.5)
      header.setDepth(DepthRegistry.BOARD_BACKGROUND + 1)
      this.columnHeaders.set(colDef.key, header)

      const container = this.add.container(colDef.x, 140)
      container.setSize(170, 620)
      this.columns.set(colDef.key, container)
    }

    this.updateBoard()

    this.globalPositionLabel = createGlobalPositionLabel(this)
    this.globalTrackerLabel = createGlobalTrackerLabel(this)
  }
}
