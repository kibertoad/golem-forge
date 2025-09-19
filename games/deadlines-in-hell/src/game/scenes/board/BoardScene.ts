import {
  createGlobalPositionLabel,
  createGlobalTrackerLabel,
  PotatoScene,
  updateGlobalPositionLabel,
  updateGlobalTrackerLabel,
} from '@potato-golem/ui'
import Phaser, { type GameObjects } from 'phaser'
import type { Dependencies } from '../../model/diConfig.ts'
import { getRoleColor, type TeamMember, TeamMemberRole } from '../../model/entities/TeamMember.ts'
import {
  BoardColumn,
  getBugSymbol,
  getTicketColor,
  type Ticket,
} from '../../model/entities/Ticket.ts'
import type { WorldModel } from '../../model/entities/WorldModel.ts'
import type { EndTurnProcessor } from '../../model/processors/EndTurnProcessor.ts'
import { DepthRegistry } from '../../registries/depthRegistry.ts'
import { eventEmitters } from '../../registries/eventEmitterRegistry.ts'
import { imageRegistry } from '../../registries/imageRegistry.ts'
import { sceneRegistry } from '../../registries/sceneRegistry.ts'
import type { GameStateManager } from '../../services/GameStateManager.ts'

export class BoardScene extends PotatoScene {
  private readonly worldModel: WorldModel
  private readonly gameStateManager: GameStateManager

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

  private readonly columnPositions = [
    { key: BoardColumn.TODO, x: 110 },
    { key: BoardColumn.REQUIREMENT_ANALYSIS, x: 300 },
    { key: BoardColumn.DESIGN, x: 490 },
    { key: BoardColumn.IMPLEMENTATION, x: 680 },
    { key: BoardColumn.CODE_REVIEW, x: 870 },
    { key: BoardColumn.QA, x: 1060 },
    { key: BoardColumn.RELEASED, x: 1250 },
  ]

  constructor({
    worldModel,
    endTurnProcessor,
    gameStateManager,
    globalSceneEventEmitter,
  }: Dependencies) {
    super(globalSceneEventEmitter, sceneRegistry.BOARD_SCENE)

    this.worldModel = worldModel
    this.endTurnProcessor = endTurnProcessor
    this.gameStateManager = gameStateManager
  }

  init() {
    // Get initial state from the game state manager
    this.tickets = this.gameStateManager.getTickets()
    this.teamMembers = this.gameStateManager.getTeamMembers()

    eventEmitters.boardEmitter.on('destroyEntity', ({ entityUuid }) => {
      /*
      if (entity.type === EntityTypeRegistry.DEFAULT) {
        this.worldModel.removeEntity(entity.id)
        this.destroyChildByModelId(entity.id)
      }

       */
    })
  }

  private createMemberIconInTicket(
    member: TeamMember,
    xPos: number,
    yPos: number,
    size: number,
    parentContainer: GameObjects.Container,
  ): GameObjects.Container {
    const container = this.add.container(xPos, yPos)

    const memberCircle = this.add.graphics()
    memberCircle.fillStyle(getRoleColor(member.role), 1)
    memberCircle.fillCircle(size / 2, 0, size / 2)
    container.add(memberCircle)

    const memberIcon = this.add.sprite(size / 2, 0, imageRegistry.ROCKET)
    memberIcon.setDisplaySize(size * 0.6, size * 0.6)
    memberIcon.setTint(0xffffff)
    container.add(memberIcon)

    // Make the icon draggable
    memberCircle.setInteractive(
      new Phaser.Geom.Circle(size / 2, 0, size / 2),
      Phaser.Geom.Circle.Contains,
    )

    this.input.setDraggable(memberCircle)

    memberCircle.on('dragstart', () => {
      this.draggedMember = member
      // Convert from local to world coordinates when starting drag
      const worldPos = parentContainer.getWorldTransformMatrix().transformPoint(xPos, yPos)
      container.x = worldPos.x
      container.y = worldPos.y
      // Remove from parent container and add to scene
      parentContainer.remove(container)
      this.add.existing(container)
      container.setDepth(DepthRegistry.BOARD_BACKGROUND + 200)
      container.setAlpha(0.8)

      // Initialize visual feedback on all tickets
      for (const ticket of this.tickets) {
        if (ticket.displayObject) {
          const canDrop = this.gameStateManager.canAssignMemberToTicket(this.draggedMember!, ticket)
          if (canDrop) {
            ticket.displayObject.setAlpha(0.9) // Valid targets slightly dimmed
          } else {
            ticket.displayObject.setAlpha(0.3) // Invalid targets much darker
          }
        }
      }
    })

    memberCircle.on('drag', (pointer: Phaser.Input.Pointer) => {
      container.x = pointer.x
      container.y = pointer.y

      // Visual feedback: highlight valid drop targets
      for (const ticket of this.tickets) {
        if (ticket.displayObject && this.draggedMember) {
          const ticketX = ticket.displayObject.x
          const ticketY = ticket.displayObject.y
          const ticketWidth = 160
          const ticketHeight = 140

          const isOver =
            pointer.x >= ticketX &&
            pointer.x <= ticketX + ticketWidth &&
            pointer.y >= ticketY &&
            pointer.y <= ticketY + ticketHeight

          const canDrop = this.gameStateManager.canAssignMemberToTicket(this.draggedMember, ticket)

          // Clear any existing highlight graphics
          const existingHighlight = ticket.displayObject.getByName(
            'highlight',
          ) as GameObjects.Graphics
          if (existingHighlight) {
            existingHighlight.destroy()
          }

          // Set visual feedback based on hover and validity
          if (isOver && canDrop) {
            // Valid drop target being hovered - add soft glow highlight
            ticket.displayObject.setAlpha(1.0) // Keep normal brightness

            // Add soft glow highlight
            const highlight = this.add.graphics()

            // Create a gradient effect with multiple layers
            // Outer glow
            highlight.lineStyle(6, 0x60a5fa, 0.2) // Light blue, very transparent
            highlight.strokeRoundedRect(-3, -3, ticketWidth + 6, ticketHeight + 6, 12)

            // Middle glow
            highlight.lineStyle(4, 0x3b82f6, 0.3) // Medium blue, semi-transparent
            highlight.strokeRoundedRect(-2, -2, ticketWidth + 4, ticketHeight + 4, 11)

            // Inner border
            highlight.lineStyle(2, 0x93c5fd, 0.8) // Light blue, more opaque
            highlight.strokeRoundedRect(0, 0, ticketWidth, ticketHeight, 10)

            highlight.name = 'highlight'
            ticket.displayObject.add(highlight)
          } else if (canDrop) {
            // Valid drop target but not hovered
            ticket.displayObject.setAlpha(0.9) // Slightly dimmed
          } else {
            // Invalid drop target
            ticket.displayObject.setAlpha(0.3) // Much darker
          }
        }
      }
    })

    memberCircle.on('dragend', (pointer: Phaser.Input.Pointer) => {
      if (!this.draggedMember) {
        container.setAlpha(1)
        return
      }

      // Check if cursor is over a ticket when dropped
      let targetTicket: Ticket | null = null
      for (const ticket of this.tickets) {
        if (ticket.displayObject) {
          // Get the actual world position of the ticket
          const ticketX = ticket.displayObject.x
          const ticketY = ticket.displayObject.y
          const ticketWidth = 160
          const ticketHeight = 140

          // Check if pointer is within ticket bounds
          if (
            pointer.x >= ticketX &&
            pointer.x <= ticketX + ticketWidth &&
            pointer.y >= ticketY &&
            pointer.y <= ticketY + ticketHeight
          ) {
            targetTicket = ticket
            break
          }
        }
      }

      // If dropped on a valid ticket that can accept this member
      if (
        targetTicket &&
        this.gameStateManager.canAssignMemberToTicket(this.draggedMember, targetTicket)
      ) {
        this.gameStateManager.assignMemberToTicket(this.draggedMember, targetTicket)
      } else {
        // Return to pool - unassign from any ticket
        this.gameStateManager.unassignMember(this.draggedMember)
      }

      // Update state references
      this.tickets = this.gameStateManager.getTickets()
      this.teamMembers = this.gameStateManager.getTeamMembers()

      // Destroy the dragged container (the small icon)
      container.destroy()

      // Update displays
      this.updateBoard()
      this.updateTeamPool()

      // Reset all ticket appearance
      for (const ticket of this.tickets) {
        if (ticket.displayObject) {
          ticket.displayObject.setAlpha(1)

          // Remove any highlight graphics
          const existingHighlight = ticket.displayObject.getByName(
            'highlight',
          ) as GameObjects.Graphics
          if (existingHighlight) {
            existingHighlight.destroy()
          }
        }
      }

      container.setAlpha(1)
      this.draggedMember = null
    })

    return container
  }

  private createTeamMemberDisplay(member: TeamMember): GameObjects.Container {
    const container = this.add.container(0, 0)

    const iconSize = 50
    const roleColor = getRoleColor(member.role)

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

      // Initialize visual feedback on all tickets
      for (const ticket of this.tickets) {
        if (ticket.displayObject) {
          const canDrop = this.gameStateManager.canAssignMemberToTicket(this.draggedMember!, ticket)
          if (canDrop) {
            ticket.displayObject.setAlpha(0.9) // Valid targets slightly dimmed
          } else {
            ticket.displayObject.setAlpha(0.3) // Invalid targets much darker
          }
        }
      }
    })

    circleBg.on('drag', (pointer: Phaser.Input.Pointer) => {
      container.x = pointer.x - iconSize / 2
      container.y = pointer.y - iconSize / 2

      // Visual feedback: highlight valid drop targets
      for (const ticket of this.tickets) {
        if (ticket.displayObject && this.draggedMember) {
          const ticketX = ticket.displayObject.x
          const ticketY = ticket.displayObject.y
          const ticketWidth = 160
          const ticketHeight = 140

          const isOver =
            pointer.x >= ticketX &&
            pointer.x <= ticketX + ticketWidth &&
            pointer.y >= ticketY &&
            pointer.y <= ticketY + ticketHeight

          const canDrop = this.gameStateManager.canAssignMemberToTicket(this.draggedMember, ticket)

          // Clear any existing highlight graphics
          const existingHighlight = ticket.displayObject.getByName(
            'highlight',
          ) as GameObjects.Graphics
          if (existingHighlight) {
            existingHighlight.destroy()
          }

          // Set visual feedback based on hover and validity
          if (isOver && canDrop) {
            // Valid drop target being hovered - add soft glow highlight
            ticket.displayObject.setAlpha(1.0) // Keep normal brightness

            // Add soft glow highlight
            const highlight = this.add.graphics()

            // Create a gradient effect with multiple layers
            // Outer glow
            highlight.lineStyle(6, 0x60a5fa, 0.2) // Light blue, very transparent
            highlight.strokeRoundedRect(-3, -3, ticketWidth + 6, ticketHeight + 6, 12)

            // Middle glow
            highlight.lineStyle(4, 0x3b82f6, 0.3) // Medium blue, semi-transparent
            highlight.strokeRoundedRect(-2, -2, ticketWidth + 4, ticketHeight + 4, 11)

            // Inner border
            highlight.lineStyle(2, 0x93c5fd, 0.8) // Light blue, more opaque
            highlight.strokeRoundedRect(0, 0, ticketWidth, ticketHeight, 10)

            highlight.name = 'highlight'
            ticket.displayObject.add(highlight)
          } else if (canDrop) {
            // Valid drop target but not hovered
            ticket.displayObject.setAlpha(0.9) // Slightly dimmed
          } else {
            // Invalid drop target
            ticket.displayObject.setAlpha(0.3) // Much darker
          }
        }
      }
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
          const ticketX = ticket.displayObject.x
          const ticketY = ticket.displayObject.y
          const ticketWidth = 160
          const ticketHeight = 140

          // Check if pointer is within ticket bounds
          if (
            pointer.x >= ticketX &&
            pointer.x <= ticketX + ticketWidth &&
            pointer.y >= ticketY &&
            pointer.y <= ticketY + ticketHeight
          ) {
            targetTicket = ticket
            break
          }
        }
      }

      if (
        targetTicket &&
        this.gameStateManager.canAssignMemberToTicket(this.draggedMember, targetTicket)
      ) {
        // Use GameStateManager to handle assignment
        this.gameStateManager.assignMemberToTicket(this.draggedMember, targetTicket)

        // Update displays
        this.updateBoard()
        this.updateTeamPool()
      } else {
        // Return to original position
        this.updateTeamPool()
      }

      // Reset all ticket appearance
      for (const ticket of this.tickets) {
        if (ticket.displayObject) {
          ticket.displayObject.setAlpha(1)

          // Remove any highlight graphics
          const existingHighlight = ticket.displayObject.getByName(
            'highlight',
          ) as GameObjects.Graphics
          if (existingHighlight) {
            existingHighlight.destroy()
          }
        }
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
    const ticketHeight = 140 // Increased from 100 to accommodate progress bars

    // Light gray background for the entire ticket
    const bg = this.add.graphics()
    bg.fillStyle(0xe5e7eb, 1) // Light gray
    bg.fillRoundedRect(0, 0, ticketWidth, ticketHeight, 10)
    container.add(bg)

    // Color-coded header section (top part only)
    const headerHeight = 65
    const headerBg = this.add.graphics()
    headerBg.fillStyle(getTicketColor(ticket.type), 1)
    headerBg.fillRoundedRect(0, 0, ticketWidth, headerHeight, 10)
    // Draw bottom corners square to blend with gray part
    headerBg.fillRect(0, headerHeight - 10, ticketWidth, 10)
    container.add(headerBg)

    const title = this.add.text(ticketWidth / 2, 25, ticket.title, {
      fontSize: '16px',
      color: '#ffffff',
      wordWrap: { width: ticketWidth - 20 },
    })
    title.setOrigin(0.5, 0.5)
    container.add(title)

    const typeLabel = this.add.text(ticketWidth / 2, 50, ticket.type.toUpperCase(), {
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold',
    })
    typeLabel.setOrigin(0.5, 0.5)
    container.add(typeLabel)

    // Progress bar (first row) - shows different progress types
    const progressY = 75
    const rectSize = 12
    const rectSpacing = 5 // Increased from 2 to 5 for more horizontal space
    const progressStartX = 10

    for (let i = 0; i < ticket.complexity; i++) {
      const rect = this.add.graphics()
      const xPos = progressStartX + i * (rectSize + rectSpacing)

      // Determine which color to use based on progress types
      if (i < ticket.implementationProgress) {
        // Implementation progress: blue rectangles
        rect.fillStyle(0x3b82f6, 1) // Blue
        rect.fillRect(xPos, progressY, rectSize, rectSize)
      } else if (i < ticket.designProgress) {
        // Design progress: green rectangles
        rect.fillStyle(0x10b981, 1) // Green
        rect.fillRect(xPos, progressY, rectSize, rectSize)
      } else if (i < ticket.analysisProgress) {
        // Analysis progress: red rectangles
        rect.fillStyle(0xef4444, 1) // Red
        rect.fillRect(xPos, progressY, rectSize, rectSize)
      } else {
        // Empty rectangle - dark gray border for visibility on light gray
        rect.lineStyle(2, 0x374151, 0.8) // Thicker border (2px instead of 1px)
        rect.strokeRect(xPos, progressY, rectSize, rectSize)
      }
      container.add(rect)
    }

    // Confidence bar (second row)
    const confidenceY = progressY + rectSize + 4
    for (let i = 0; i < ticket.complexity; i++) {
      const rect = this.add.graphics()
      const xPos = progressStartX + i * (rectSize + rectSpacing)

      if (i < Math.floor(ticket.confidence)) {
        // Filled confidence rectangle (gold/yellow)
        rect.fillStyle(0xfbbf24, 1) // Gold/yellow for confidence
        rect.fillRect(xPos, confidenceY, rectSize, rectSize)
      } else if (i < ticket.maxConfidence) {
        // Empty confidence rectangle (max confidence set by analysts)
        rect.lineStyle(2, 0xfbbf24, 0.6) // Gold border for max confidence
        rect.strokeRect(xPos, confidenceY, rectSize, rectSize)
      } else {
        // No confidence possible yet - very faint border
        rect.lineStyle(1, 0x374151, 0.2) // Very faint gray
        rect.strokeRect(xPos, confidenceY, rectSize, rectSize)
      }
      container.add(rect)
    }

    // Bug symbols
    if (ticket.bugs.length > 0) {
      let bugX = ticketWidth - 30
      ticket.bugs.forEach((bug) => {
        const bugSymbol = this.add.text(bugX, progressY, getBugSymbol(bug.severity), {
          fontSize: '16px',
        })
        container.add(bugSymbol)
        bugX -= 20
      })
    }

    // Display assigned team members as draggable small circles
    if (ticket.assignedMembers.length > 0) {
      const memberIconSize = 20
      const startX = 10
      const yPos = 110 // Moved down to accommodate progress bars

      ticket.assignedMembers.forEach((member, index) => {
        const xPos = startX + index * (memberIconSize + 5)
        const memberIconContainer = this.createMemberIconInTicket(
          member,
          xPos,
          yPos,
          memberIconSize,
          container,
        )
        container.add(memberIconContainer)
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

      // Initialize visual feedback on all columns
      for (const colDef of this.columnPositions) {
        const canMove = this.gameStateManager.canMoveTicket(this.draggedTicket!, colDef.key)
        const header = this.columnHeaders.get(colDef.key)

        if (header) {
          if (canMove) {
            header.setAlpha(1.0) // Valid columns stay bright
            header.setTint(0x60a5fa) // Soft light blue tint
          } else {
            header.setAlpha(0.3) // Invalid columns dimmed
            header.clearTint()
          }
        }

        // Also dim/brighten the column background
        const columnContainer = this.columns.get(colDef.key)
        if (columnContainer) {
          columnContainer.setAlpha(canMove ? 1.0 : 0.3)
        }
      }
    })

    bg.on('drag', (pointer: Phaser.Input.Pointer) => {
      container.x = pointer.x - ticketWidth / 2
      container.y = pointer.y - ticketHeight / 2

      // Visual feedback for columns while dragging
      if (this.draggedTicket) {
        for (const colDef of this.columnPositions) {
          const isOver = pointer.x >= colDef.x - 85 && pointer.x <= colDef.x + 85
          const canMove = this.gameStateManager.canMoveTicket(this.draggedTicket, colDef.key)
          const header = this.columnHeaders.get(colDef.key)

          // Clear any existing column highlights
          const existingHighlight = this.children.getByName(
            `column-highlight-${colDef.key}`,
          ) as GameObjects.Graphics
          if (existingHighlight) {
            existingHighlight.destroy()
          }

          if (header) {
            if (isOver && canMove) {
              // Valid column being hovered - highlight with soft blue
              header.setScale(1.1, 1.1) // Subtle scale
              header.setTint(0x93c5fd) // Light blue tint

              // Add soft blue column highlight (matching ticket highlight style)
              const highlight = this.add.graphics()

              // Outer glow
              highlight.lineStyle(6, 0x60a5fa, 0.15) // Light blue, very transparent
              highlight.strokeRoundedRect(colDef.x - 88, 77, 176, 766, 13)

              // Middle glow
              highlight.lineStyle(4, 0x3b82f6, 0.2) // Medium blue, semi-transparent
              highlight.strokeRoundedRect(colDef.x - 87, 78, 174, 764, 12)

              // Inner border
              highlight.lineStyle(2, 0x93c5fd, 0.5) // Light blue, medium opacity
              highlight.strokeRoundedRect(colDef.x - 85, 80, 170, 760, 10)

              highlight.name = `column-highlight-${colDef.key}`
              highlight.setDepth(DepthRegistry.BOARD_BACKGROUND + 2)
            } else if (canMove) {
              // Valid column but not hovered
              header.setTint(0x60a5fa) // Soft light blue tint
            } else {
              // Invalid column
              header.clearTint()
            }
          }
        }
      }
    })

    bg.on('dragend', (pointer: Phaser.Input.Pointer) => {
      if (!this.draggedTicket) return

      let targetColumn: BoardColumn | null = null

      // Check which column the pointer is over based on x coordinates
      for (const colDef of this.columnPositions) {
        // Check if pointer is within column bounds (column width is 170)
        if (pointer.x >= colDef.x - 85 && pointer.x <= colDef.x + 85) {
          targetColumn = colDef.key
          break
        }
      }

      if (targetColumn && this.gameStateManager.moveTicket(this.draggedTicket, targetColumn)) {
        this.tickets = this.gameStateManager.getTickets()
        this.teamMembers = this.gameStateManager.getTeamMembers()
        this.updateBoard()
        this.updateTeamPool() // Update pool to show returned members
      } else {
        // Return to original position
        this.updateBoard()
      }

      // Reset all column visual feedback
      for (const colDef of this.columnPositions) {
        const header = this.columnHeaders.get(colDef.key)
        if (header) {
          header.setAlpha(1.0)
          header.clearTint()
        }

        const columnContainer = this.columns.get(colDef.key)
        if (columnContainer) {
          columnContainer.setAlpha(1.0)
        }

        // Remove any column highlights
        const existingHighlight = this.children.getByName(
          `column-highlight-${colDef.key}`,
        ) as GameObjects.Graphics
        if (existingHighlight) {
          existingHighlight.destroy()
        }
      }

      container.setAlpha(1)
      this.draggedTicket = null
    })

    ticket.displayObject = container
    return container
  }

  private processTurn() {
    // Use the game state manager to process the turn
    this.gameStateManager.processTurn()

    // Get updated state
    this.tickets = this.gameStateManager.getTickets()
    this.teamMembers = this.gameStateManager.getTeamMembers()

    // Update the visual display
    this.updateBoard()
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

    const columnTitles = {
      [BoardColumn.TODO]: 'To Do',
      [BoardColumn.REQUIREMENT_ANALYSIS]: 'Requirements',
      [BoardColumn.DESIGN]: 'Design',
      [BoardColumn.IMPLEMENTATION]: 'Implementation',
      [BoardColumn.CODE_REVIEW]: 'Code Review',
      [BoardColumn.QA]: 'QA',
      [BoardColumn.RELEASED]: 'Released',
    }

    for (const colDef of this.columnPositions) {
      const columnBg = this.add.graphics()
      columnBg.fillStyle(0x2d3748, 0.3)
      columnBg.fillRoundedRect(colDef.x - 85, 80, 170, 760, 10) // Doubled from 380 to 760
      columnBg.setDepth(DepthRegistry.BOARD_BACKGROUND)

      const header = this.add.text(colDef.x, 100, columnTitles[colDef.key], {
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

    // Add Next Turn button
    const nextTurnButton = this.add.container(2400, 40)
    const buttonBg = this.add.graphics()
    buttonBg.fillStyle(0x3b82f6, 1)
    buttonBg.fillRoundedRect(-60, -20, 120, 40, 5)
    nextTurnButton.add(buttonBg)

    const buttonText = this.add.text(0, 0, 'Next Turn', {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
    })
    buttonText.setOrigin(0.5, 0.5)
    nextTurnButton.add(buttonText)

    buttonBg.setInteractive(
      new Phaser.Geom.Rectangle(-60, -20, 120, 40),
      Phaser.Geom.Rectangle.Contains,
    )

    buttonBg.on('pointerdown', () => {
      this.processTurn()
    })

    buttonBg.on('pointerover', () => {
      buttonBg.clear()
      buttonBg.fillStyle(0x60a5fa, 1)
      buttonBg.fillRoundedRect(-60, -20, 120, 40, 5)
    })

    buttonBg.on('pointerout', () => {
      buttonBg.clear()
      buttonBg.fillStyle(0x3b82f6, 1)
      buttonBg.fillRoundedRect(-60, -20, 120, 40, 5)
    })

    nextTurnButton.setDepth(DepthRegistry.BOARD_BACKGROUND + 100)

    this.globalPositionLabel = createGlobalPositionLabel(this)
    this.globalTrackerLabel = createGlobalTrackerLabel(this)
  }
}
