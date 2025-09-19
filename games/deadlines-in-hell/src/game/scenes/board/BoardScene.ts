import {
  createGlobalPositionLabel,
  createGlobalTrackerLabel,
  PotatoScene,
  updateGlobalPositionLabel,
  updateGlobalTrackerLabel,
} from '@potato-golem/ui'
import Phaser, { type GameObjects } from 'phaser'
import type { Dependencies } from '../../model/diConfig.ts'
import type { WorldModel } from '../../model/entities/WorldModel.ts'
import type { EndTurnProcessor } from '../../model/processors/EndTurnProcessor.ts'
import { DepthRegistry } from '../../registries/depthRegistry.ts'
import { eventEmitters } from '../../registries/eventEmitterRegistry.ts'
import { imageRegistry } from '../../registries/imageRegistry.ts'
import { sceneRegistry } from '../../registries/sceneRegistry.ts'

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

export enum TeamMemberRole {
  DEVELOPER = 'developer',
  ANALYST = 'analyst',
  DESIGNER = 'designer',
  QA = 'qa',
}

interface TeamMember {
  id: string
  name: string
  role: TeamMemberRole
  assignedTo?: string // ticket id
  displayObject?: GameObjects.Container
}

interface Ticket {
  id: string
  type: TicketType
  title: string
  column: BoardColumn
  assignedMembers: TeamMember[]
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

  private teamMembers: TeamMember[] = []
  private draggedMember: TeamMember | null = null

  constructor({ worldModel, endTurnProcessor, globalSceneEventEmitter }: Dependencies) {
    super(globalSceneEventEmitter, sceneRegistry.BOARD_SCENE)

    this.worldModel = worldModel
    this.endTurnProcessor = endTurnProcessor
  }

  init() {
    this.initializeTickets()
    this.initializeTeamMembers()

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
      {
        id: '1',
        type: TicketType.BUGFIX,
        title: 'Fix login bug',
        column: BoardColumn.TODO,
        assignedMembers: [],
      },
      {
        id: '2',
        type: TicketType.REFACTORING,
        title: 'Refactor auth module',
        column: BoardColumn.TODO,
        assignedMembers: [],
      },
      {
        id: '3',
        type: TicketType.FRONTEND,
        title: 'Create dashboard UI',
        column: BoardColumn.TODO,
        assignedMembers: [],
      },
      {
        id: '4',
        type: TicketType.BACKEND,
        title: 'Implement API endpoint',
        column: BoardColumn.TODO,
        assignedMembers: [],
      },
      {
        id: '5',
        type: TicketType.FRONTEND,
        title: 'Update user profile',
        column: BoardColumn.TODO,
        assignedMembers: [],
      },
    ]
  }

  private initializeTeamMembers() {
    this.teamMembers = [
      { id: 'dev1', name: 'Dev 1', role: TeamMemberRole.DEVELOPER },
      { id: 'dev2', name: 'Dev 2', role: TeamMemberRole.DEVELOPER },
      { id: 'analyst1', name: 'Ana 1', role: TeamMemberRole.ANALYST },
      { id: 'designer1', name: 'Des 1', role: TeamMemberRole.DESIGNER },
      { id: 'qa1', name: 'QA 1', role: TeamMemberRole.QA },
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

  private getRoleColor(role: TeamMemberRole): number {
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

  private canAssignToTicket(member: TeamMember, ticket: Ticket): boolean {
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
    if (ticket.type === TicketType.BUGFIX || ticket.type === TicketType.REFACTORING) {
      // Cannot go to Requirements or Design from any column
      if (
        targetColumn === BoardColumn.REQUIREMENT_ANALYSIS ||
        targetColumn === BoardColumn.DESIGN
      ) {
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

  private createTeamMemberDisplay(member: TeamMember): GameObjects.Container {
    const container = this.add.container(0, 0)

    const iconSize = 50
    const roleColor = this.getRoleColor(member.role)

    // Colored circle background
    const circleBg = this.add.graphics()
    circleBg.fillStyle(roleColor, 1)
    circleBg.fillCircle(iconSize / 2, iconSize / 2, iconSize / 2)
    container.add(circleBg)

    // Placeholder icon (rocket) - centered in circle
    const icon = this.add.sprite(iconSize / 2, iconSize / 2, imageRegistry.ROCKET)
    icon.setDisplaySize(iconSize * 0.6, iconSize * 0.6)
    icon.setTint(0xffffff)
    container.add(icon)

    // Name label below
    const nameLabel = this.add.text(iconSize / 2, iconSize + 5, member.name, {
      fontSize: '12px',
      color: '#ffffff',
    })
    nameLabel.setOrigin(0.5, 0)
    container.add(nameLabel)

    // Make draggable
    circleBg.setInteractive(
      new Phaser.Geom.Circle(iconSize / 2, iconSize / 2, iconSize / 2),
      Phaser.Geom.Circle.Contains,
    )

    this.input.setDraggable(circleBg)

    circleBg.on('dragstart', () => {
      this.draggedMember = member
      container.setDepth(DepthRegistry.BOARD_BACKGROUND + 200)
      container.setAlpha(0.8)
    })

    circleBg.on('drag', (pointer: Phaser.Input.Pointer) => {
      container.x = pointer.x - iconSize / 2
      container.y = pointer.y - iconSize / 2
    })

    circleBg.on('dragend', (pointer: Phaser.Input.Pointer) => {
      if (!this.draggedMember) {
        container.setAlpha(1)
        return
      }

      // Check if dropped on a ticket
      let targetTicket: Ticket | null = null
      for (const ticket of this.tickets) {
        if (ticket.displayObject) {
          const bounds = ticket.displayObject.getBounds()
          if (bounds.contains(pointer.x, pointer.y)) {
            targetTicket = ticket
            break
          }
        }
      }

      if (targetTicket && this.canAssignToTicket(this.draggedMember, targetTicket)) {
        // Remove from any previous assignment
        if (this.draggedMember.assignedTo) {
          const prevTicket = this.tickets.find((t) => t.id === this.draggedMember!.assignedTo)
          if (prevTicket) {
            const memberIndex = prevTicket.assignedMembers.findIndex(
              (m) => m.id === this.draggedMember!.id,
            )
            if (memberIndex !== -1) {
              prevTicket.assignedMembers.splice(memberIndex, 1)
            }
          }
        }

        // Assign to new ticket
        this.draggedMember.assignedTo = targetTicket.id
        targetTicket.assignedMembers.push(this.draggedMember)

        // Update displays
        this.updateBoard()
        this.updateTeamPool()
      } else {
        // Return to original position
        this.updateTeamPool()
      }

      container.setAlpha(1)
      this.draggedMember = null
    })

    member.displayObject = container
    return container
  }

  private createTicketDisplay(ticket: Ticket): GameObjects.Container {
    const container = this.add.container(0, 0)

    const ticketWidth = 160
    const ticketHeight = 100

    const bg = this.add.graphics()
    bg.fillStyle(this.getTicketColor(ticket.type), 1)
    bg.fillRoundedRect(0, 0, ticketWidth, ticketHeight, 10)
    container.add(bg)

    const title = this.add.text(ticketWidth / 2, 25, ticket.title, {
      fontSize: '16px',
      color: '#ffffff',
      wordWrap: { width: ticketWidth - 20 },
    })
    title.setOrigin(0.5, 0.5)
    container.add(title)

    const typeLabel = this.add.text(ticketWidth / 2, 55, ticket.type.toUpperCase(), {
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold',
    })
    typeLabel.setOrigin(0.5, 0.5)
    container.add(typeLabel)

    // Display assigned team members as small circles
    if (ticket.assignedMembers.length > 0) {
      const memberIconSize = 20
      const startX = 10
      const yPos = 78

      ticket.assignedMembers.forEach((member, index) => {
        const xPos = startX + index * (memberIconSize + 5)

        const memberCircle = this.add.graphics()
        memberCircle.fillStyle(this.getRoleColor(member.role), 1)
        memberCircle.fillCircle(xPos + memberIconSize / 2, yPos, memberIconSize / 2)
        container.add(memberCircle)

        // Small icon inside
        const memberIcon = this.add.sprite(xPos + memberIconSize / 2, yPos, imageRegistry.ROCKET)
        memberIcon.setDisplaySize(memberIconSize * 0.6, memberIconSize * 0.6)
        memberIcon.setTint(0xffffff)
        container.add(memberIcon)
      })
    }

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

  private updateTeamPool() {
    // Clear existing display objects
    for (const member of this.teamMembers) {
      if (member.displayObject) {
        member.displayObject.destroy()
        member.displayObject = undefined
      }
    }

    // Group members by role
    const membersByRole: Map<TeamMemberRole, TeamMember[]> = new Map()
    for (const role of Object.values(TeamMemberRole)) {
      membersByRole.set(role as TeamMemberRole, [])
    }

    for (const member of this.teamMembers) {
      // Only show unassigned members in the pool
      if (!member.assignedTo) {
        membersByRole.get(member.role)?.push(member)
      }
    }

    // Position members in rows by role - in the team pool area below the board
    let rowY = 920 // Start below the team pool title (which is now at y:880)
    const roleOrder = [
      TeamMemberRole.DEVELOPER,
      TeamMemberRole.ANALYST,
      TeamMemberRole.DESIGNER,
      TeamMemberRole.QA,
    ]

    for (const role of roleOrder) {
      const members = membersByRole.get(role) || []
      if (members.length > 0) {
        members.forEach((member, index) => {
          const memberDisplay = this.createTeamMemberDisplay(member)
          memberDisplay.x = 20 + index * 70
          memberDisplay.y = rowY
          memberDisplay.setDepth(DepthRegistry.BOARD_BACKGROUND + 5)
        })

        rowY += 80 // Move to next row
      }
    }
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
        ticketDisplay.x = columnContainer.x - 80 // Center the ticket (width is 160)
        ticketDisplay.y = 140 + index * 110 // Start below header with adjusted spacing
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
    bg.fillRect(0, 0, 2560, 1440) // Use full game resolution
    bg.setDepth(DepthRegistry.BOARD_BACKGROUND - 10)

    const title = this.add.text(1280, 40, 'Sprint Board - Deadlines in Hell', {
      // Center at 1280 (half of 2560)
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
      columnBg.fillRoundedRect(colDef.x - 85, 80, 170, 760, 10) // Doubled from 380 to 760
      columnBg.setDepth(DepthRegistry.BOARD_BACKGROUND)

      const header = this.add.text(colDef.x, 100, colDef.title, {
        fontSize: '20px',
        color: '#e2e8f0',
        fontStyle: 'bold',
      })
      header.setOrigin(0.5, 0.5)
      header.setDepth(DepthRegistry.BOARD_BACKGROUND + 1)
      this.columnHeaders.set(colDef.key, header)

      const container = this.add.container(colDef.x, 120)
      container.setSize(170, 720) // Doubled from 340 to 720
      this.columns.set(colDef.key, container)
    }

    // Team Pool Section - moved further down to accommodate larger board
    const teamPoolBg = this.add.graphics()
    teamPoolBg.fillStyle(0x2d3748, 0.2)
    teamPoolBg.fillRoundedRect(10, 860, 2540, 400, 10) // Increased height from 250 to 400
    teamPoolBg.setDepth(DepthRegistry.BOARD_BACKGROUND - 5)

    const teamPoolTitle = this.add.text(1280, 880, 'Team Pool', {
      // Center at 1280
      fontSize: '24px',
      color: '#e2e8f0',
      fontStyle: 'bold',
    })
    teamPoolTitle.setOrigin(0.5, 0.5)
    teamPoolTitle.setDepth(DepthRegistry.BOARD_BACKGROUND)

    this.updateBoard()
    this.updateTeamPool()

    this.globalPositionLabel = createGlobalPositionLabel(this)
    this.globalTrackerLabel = createGlobalTrackerLabel(this)
  }
}
