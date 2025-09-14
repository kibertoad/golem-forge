import type { CommonComponentModel } from './ComponentModel.ts'

// Types of scanners that can detect concealed cargo
export type ScannerType =
  | 'radiation'
  | 'thermal'
  | 'magnetic'
  | 'gravimetric'
  | 'bioscan'
  | 'quantum'

// Interface for concealed cargo compartments
export interface ConcealedCompartment {
  id: string
  name: string
  maxSpace: number
  currentSpace: number
  concealmentLevel: number // 1-10, higher is better concealed
  scannerProofing: {
    [key in ScannerType]?: number // 0-100% effectiveness against each scanner type
  }
  contents?: CargoItem[]
}

// Interface for cargo items
export interface CargoItem {
  id: string
  name: string
  quantity: number
  spacePerUnit: number
  illegal?: boolean
  value?: number
  purchasedAtPrice?: number  // Price paid when buying this item
}

export class ShipModel {
  public weapons: CommonComponentModel[]
  public maxEnergy: number
  public currentShield: number
  public maxShield: number
  public currentHull: number
  public maxHull: number

  // Cargo handling fields
  public maxPublicSpace: number
  public currentPublicSpace: number
  public publicCargo: CargoItem[]
  public concealedSpaceSlots: ConcealedCompartment[]

  constructor() {
    this.weapons = []
    this.maxEnergy = 5
    this.currentShield = 3
    this.maxShield = 3
    this.currentHull = 4
    this.maxHull = 4

    // Initialize cargo systems
    this.maxPublicSpace = 100 // Standard cargo hold capacity
    this.currentPublicSpace = 100 // Available space
    this.publicCargo = []
    this.concealedSpaceSlots = []
  }

  // Add cargo to public space
  addPublicCargo(item: CargoItem): boolean {
    const requiredSpace = item.quantity * item.spacePerUnit
    if (requiredSpace <= this.currentPublicSpace) {
      this.publicCargo.push(item)
      this.currentPublicSpace -= requiredSpace
      return true
    }
    return false
  }

  // Remove cargo from public space
  removePublicCargo(itemId: string): CargoItem | null {
    const index = this.publicCargo.findIndex((item) => item.id === itemId)
    if (index !== -1) {
      const item = this.publicCargo.splice(index, 1)[0]
      this.currentPublicSpace += item.quantity * item.spacePerUnit
      return item
    }
    return null
  }

  // Add a concealed compartment to the ship
  addConcealedCompartment(compartment: ConcealedCompartment): void {
    this.concealedSpaceSlots.push(compartment)
  }

  // Add cargo to a specific concealed compartment
  addConcealedCargo(compartmentId: string, item: CargoItem): boolean {
    const compartment = this.concealedSpaceSlots.find((c) => c.id === compartmentId)
    if (!compartment) return false

    const requiredSpace = item.quantity * item.spacePerUnit
    if (requiredSpace <= compartment.currentSpace) {
      if (!compartment.contents) {
        compartment.contents = []
      }
      compartment.contents.push(item)
      compartment.currentSpace -= requiredSpace
      return true
    }
    return false
  }

  // Remove cargo from a concealed compartment
  removeConcealedCargo(compartmentId: string, itemId: string): CargoItem | null {
    const compartment = this.concealedSpaceSlots.find((c) => c.id === compartmentId)
    if (!compartment || !compartment.contents) return null

    const index = compartment.contents.findIndex((item) => item.id === itemId)
    if (index !== -1) {
      const item = compartment.contents.splice(index, 1)[0]
      compartment.currentSpace += item.quantity * item.spacePerUnit
      return item
    }
    return null
  }

  // Check if a concealed compartment would be detected by a scanner
  checkDetection(
    compartmentId: string,
    scannerType: ScannerType,
    scannerStrength: number,
  ): boolean {
    const compartment = this.concealedSpaceSlots.find((c) => c.id === compartmentId)
    if (!compartment) return false

    const proofing = compartment.scannerProofing[scannerType] || 0
    const concealmentBonus = compartment.concealmentLevel * 5 // Each level adds 5% resistance

    // Calculate detection chance
    const totalResistance = Math.min(proofing + concealmentBonus, 100)
    const detectionChance = Math.max(0, scannerStrength - totalResistance)

    // Random check for detection
    return Math.random() * 100 < detectionChance
  }

  // Get total cargo capacity (public + concealed)
  getTotalCargoCapacity(): number {
    const concealedCapacity = this.concealedSpaceSlots.reduce(
      (total, compartment) => total + compartment.maxSpace,
      0,
    )
    return this.maxPublicSpace + concealedCapacity
  }

  // Get current used cargo space (public + concealed)
  getTotalUsedSpace(): number {
    const publicUsed = this.maxPublicSpace - this.currentPublicSpace
    const concealedUsed = this.concealedSpaceSlots.reduce(
      (total, compartment) => total + (compartment.maxSpace - compartment.currentSpace),
      0,
    )
    return publicUsed + concealedUsed
  }
}
