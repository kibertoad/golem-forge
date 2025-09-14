import { type ArmsDefinition, armsDefinitions } from '../model/definitions/armsDefinitions.ts'
import type { ArmsBranch } from '../model/enums/ArmsBranches.ts'
import type { ArmsManufacturer } from '../model/enums/ArmsManufacturer.ts'

class ArmsRegistry {
  private definitions: Map<string, ArmsDefinition>

  constructor() {
    this.definitions = new Map()
    this.loadDefinitions()
  }

  private loadDefinitions() {
    Object.values(armsDefinitions).forEach((def) => {
      this.definitions.set(def.id, def)
    })
  }

  // Get a specific arms definition by ID
  getDefinition(id: string): ArmsDefinition | undefined {
    return this.definitions.get(id)
  }

  // Get all definitions
  getAllDefinitions(): ArmsDefinition[] {
    return Array.from(this.definitions.values())
  }

  // Get definitions by branch
  getDefinitionsByBranch(branch: ArmsBranch): ArmsDefinition[] {
    return Array.from(this.definitions.values()).filter((def) => def.branch === branch)
  }

  // Get definitions that match specific subcategories
  getDefinitionsBySubcategories(subcategories: Set<string> | string[]): ArmsDefinition[] {
    const searchSet = subcategories instanceof Set ? subcategories : new Set(subcategories)
    return Array.from(this.definitions.values()).filter((def) => {
      for (const cat of searchSet) {
        if (!def.subcategories.has(cat)) {
          return false
        }
      }
      return true
    })
  }

  // Search definitions by name (partial match)
  searchByName(query: string): ArmsDefinition[] {
    const lowerQuery = query.toLowerCase()
    return Array.from(this.definitions.values()).filter((def) =>
      def.name.toLowerCase().includes(lowerQuery),
    )
  }

  // Get definitions by manufacturer
  getDefinitionsByManufacturer(manufacturer: ArmsManufacturer): ArmsDefinition[] {
    return Array.from(this.definitions.values()).filter((def) => def.manufacturer === manufacturer)
  }

  // Filter definitions by price range
  getDefinitionsByPriceRange(minPrice: number, maxPrice: number): ArmsDefinition[] {
    return Array.from(this.definitions.values()).filter(
      (def) => def.basePrice >= minPrice && def.basePrice <= maxPrice,
    )
  }

  // Check if a definition exists
  hasDefinition(id: string): boolean {
    return this.definitions.has(id)
  }

  // Get random definition (useful for generating market offers)
  getRandomDefinition(branch?: ArmsBranch): ArmsDefinition | undefined {
    const candidates = branch ? this.getDefinitionsByBranch(branch) : this.getAllDefinitions()

    if (candidates.length === 0) return undefined
    return candidates[Math.floor(Math.random() * candidates.length)]
  }

  // Get definitions suitable for a specific tech level
  getDefinitionsByTechLevel(availableTech: string[]): ArmsDefinition[] {
    const techSet = new Set(availableTech)
    return Array.from(this.definitions.values()).filter((def) => {
      if (!def.requiredTech) return true
      return def.requiredTech.every((tech) => techSet.has(tech))
    })
  }
}

// Singleton instance
export const armsRegistry = new ArmsRegistry()
