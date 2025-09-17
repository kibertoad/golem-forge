import type { PotatoScene } from '@potato-golem/ui'
import * as Phaser from 'phaser'
import { ArmsBranch } from '../model/enums/ArmsBranches.ts'
import type { ArmsCondition, ArmsGrade } from '../model/enums/ArmsStockEnums.ts'
import { Colors, Typography } from '../registries/styleRegistry.ts'

// Generic filter types
export interface FilterConfig {
  branches?: ArmsBranch[]
  conditions?: ArmsCondition[]
  grades?: ArmsGrade[]
  custom?: Array<{ key: string; label: string; value: any }>
  showClearButton?: boolean // Option to show/hide clear button
  layout?: 'horizontal' | 'vertical' // Layout orientation
}

// Generic sort configuration
export interface SortConfig<T> {
  key: T
  label: string
  compareFunction: (a: any, b: any) => number
}

export interface FilterSortCallbacks {
  onFiltersChanged?: () => void
  onSortChanged?: () => void
}

/**
 * Reusable component for managing filters and sorting
 */
export class FilterSortManager<TSortKey extends string = string> extends Phaser.GameObjects
  .Container {
  // Filter state
  private selectedFilters: Map<string, any> = new Map()
  private filterButtons: Map<string, Phaser.GameObjects.Container> = new Map()

  // Sort state
  private currentSortKey: TSortKey | null = null
  private sortAscending = true
  private sortButtons: Map<TSortKey, Phaser.GameObjects.Container> = new Map()

  // Configuration
  private filterConfig: FilterConfig
  private sortConfigs: SortConfig<TSortKey>[]
  private callbacks: FilterSortCallbacks

  constructor(
    scene: PotatoScene,
    x: number,
    y: number,
    filterConfig: FilterConfig,
    sortConfigs: SortConfig<TSortKey>[],
    callbacks: FilterSortCallbacks = {},
  ) {
    super(scene, x, y)

    this.filterConfig = filterConfig
    this.sortConfigs = sortConfigs
    this.callbacks = callbacks

    // Set default sort if available
    if (sortConfigs.length > 0) {
      this.currentSortKey = sortConfigs[0].key
    }

    this.createUI()
    scene.add.existing(this)
  }

  private createUI() {
    let yOffset = 0

    // Create filter section
    if (this.hasFilters()) {
      const filterHeight = this.createFilterSection(yOffset)
      yOffset += filterHeight + 10 // Add padding between sections
    }

    // Create sort section
    if (this.sortConfigs.length > 0) {
      this.createSortSection(yOffset)
    }
  }

  private hasFilters(): boolean {
    const { branches, conditions, grades, custom } = this.filterConfig
    return !!(
      (branches && branches.length > 0) ||
      (conditions && conditions.length > 0) ||
      (grades && grades.length > 0) ||
      (custom && custom.length > 0)
    )
  }

  private createFilterSection(yOffset: number): number {
    const showClear = this.filterConfig.showClearButton !== false // Default true
    let currentY = yOffset
    const rowHeight = 35
    const rowSpacing = 5
    const baseX = -450 // Move buttons more to the right to avoid text overlap

    // Branch filters row
    if (this.filterConfig.branches && this.filterConfig.branches.length > 0) {
      // Branch label
      const branchLabel = this.scene.add.text(-650, currentY, 'BRANCHES:', {
        fontSize: Typography.fontSize.regular,
        fontFamily: Typography.fontFamily.primary,
        color: Colors.text.secondary,
      })
      this.add(branchLabel)

      let xOffset = baseX
      this.filterConfig.branches.forEach((branch) => {
        const button = this.createFilterButton(this.getBranchLabel(branch), xOffset, currentY, () =>
          this.toggleFilter('branch', branch),
        )
        this.filterButtons.set(`branch_${branch}`, button)
        this.add(button)
        xOffset += 120
      })
      currentY += rowHeight + rowSpacing
    }

    // Condition filters row
    if (this.filterConfig.conditions && this.filterConfig.conditions.length > 0) {
      // Condition label
      const conditionLabel = this.scene.add.text(-650, currentY, 'CONDITIONS:', {
        fontSize: Typography.fontSize.regular,
        fontFamily: Typography.fontFamily.primary,
        color: Colors.text.secondary,
      })
      this.add(conditionLabel)

      let xOffset = baseX
      this.filterConfig.conditions.forEach((condition) => {
        const button = this.createFilterButton(
          this.getConditionLabel(condition),
          xOffset,
          currentY,
          () => this.toggleFilter('condition', condition),
        )
        this.filterButtons.set(`condition_${condition}`, button)
        this.add(button)
        xOffset += 120
      })
      currentY += rowHeight + rowSpacing
    }

    // Grade filters row
    if (this.filterConfig.grades && this.filterConfig.grades.length > 0) {
      // Grade label
      const gradeLabel = this.scene.add.text(-650, currentY, 'GRADES:', {
        fontSize: Typography.fontSize.regular,
        fontFamily: Typography.fontFamily.primary,
        color: Colors.text.secondary,
      })
      this.add(gradeLabel)

      let xOffset = baseX
      this.filterConfig.grades.forEach((grade) => {
        const button = this.createFilterButton(this.getGradeLabel(grade), xOffset, currentY, () =>
          this.toggleFilter('grade', grade),
        )
        this.filterButtons.set(`grade_${grade}`, button)
        this.add(button)
        xOffset += 120
      })
      currentY += rowHeight + rowSpacing
    }

    // Custom filters row
    if (this.filterConfig.custom && this.filterConfig.custom.length > 0) {
      // Custom label
      const customLabel = this.scene.add.text(-650, currentY, 'OPTIONS:', {
        fontSize: Typography.fontSize.regular,
        fontFamily: Typography.fontFamily.primary,
        color: Colors.text.secondary,
      })
      this.add(customLabel)

      let xOffset = baseX
      this.filterConfig.custom.forEach((custom) => {
        const button = this.createFilterButton(custom.label, xOffset, currentY, () =>
          this.toggleFilter(custom.key, custom.value),
        )
        this.filterButtons.set(`${custom.key}_${custom.value}`, button)
        this.add(button)
        xOffset += 120
      })
      currentY += rowHeight + rowSpacing
    }

    // Clear button on its own row
    if (showClear) {
      const clearButton = this.createClearButton(baseX, currentY)
      this.add(clearButton)
      currentY += rowHeight + rowSpacing
    }

    // Return total height consumed
    return currentY - yOffset
  }

  private createSortSection(yOffset: number) {
    // Sort label
    const sortLabel = this.scene.add.text(-650, yOffset, 'SORT BY:', {
      fontSize: Typography.fontSize.regular,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.text.secondary,
    })
    this.add(sortLabel)

    let xOffset = -450 // Match the baseX from filter section

    this.sortConfigs.forEach((config) => {
      const button = this.createSortButton(config.label, xOffset, yOffset, config.key)
      this.sortButtons.set(config.key, button)
      this.add(button)
      xOffset += 100
    })
  }

  private createFilterButton(
    label: string,
    x: number,
    y: number,
    onClick: () => void,
  ): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y)

    const bg = this.scene.add.rectangle(0, 0, 110, 30, Colors.background.cardHover)
    bg.setStrokeStyle(1, Colors.ui.divider)
    bg.setInteractive()
    container.add(bg)

    const text = this.scene.add.text(0, 0, label, {
      fontSize: Typography.fontSize.small,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.text.primary,
    })
    text.setOrigin(0.5)
    container.add(text)

    bg.on('pointerdown', onClick)
    bg.on('pointerover', () => bg.setFillStyle(Colors.background.card))
    bg.on('pointerout', () => {
      // Will be updated by updateButtonStates
      this.updateButtonStates()
    })

    return container
  }

  private createClearButton(x: number, y: number): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y)

    const bg = this.scene.add.rectangle(0, 0, 110, 30, Colors.status.danger)
    bg.setAlpha(0.5)
    bg.setStrokeStyle(2, Colors.status.danger)
    bg.setInteractive()
    container.add(bg)

    const text = this.scene.add.text(0, 0, 'CLEAR ALL', {
      fontSize: Typography.fontSize.small,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.text.primary,
      fontStyle: 'bold',
    })
    text.setOrigin(0.5)
    container.add(text)

    bg.on('pointerdown', () => this.clearFilters())
    bg.on('pointerover', () => {
      bg.setAlpha(0.8)
      bg.setStrokeStyle(3, Colors.status.danger)
      text.setColor(Colors.status.dangerText)
    })
    bg.on('pointerout', () => {
      bg.setAlpha(0.5)
      bg.setStrokeStyle(2, Colors.status.danger)
      text.setColor(Colors.text.primary)
    })

    return container
  }

  private createSortButton(
    label: string,
    x: number,
    y: number,
    sortKey: TSortKey,
  ): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y)

    const bg = this.scene.add.rectangle(0, 0, 90, 30, Colors.background.cardHover)
    bg.setStrokeStyle(1, Colors.ui.divider)
    bg.setInteractive()
    container.add(bg)

    const text = this.scene.add.text(0, 0, label, {
      fontSize: Typography.fontSize.small,
      fontFamily: Typography.fontFamily.primary,
      color: Colors.text.primary,
    })
    text.setOrigin(0.5)
    container.add(text)

    bg.on('pointerdown', () => this.setSort(sortKey))
    bg.on('pointerover', () => bg.setFillStyle(Colors.background.card))
    bg.on('pointerout', () => {
      this.updateButtonStates()
    })

    return container
  }

  private toggleFilter(filterType: string, value: any) {
    const key = `${filterType}_filter`

    if (this.selectedFilters.get(key) === value) {
      this.selectedFilters.delete(key)
    } else {
      this.selectedFilters.set(key, value)
    }

    this.updateButtonStates()
    this.callbacks.onFiltersChanged?.()
  }

  private clearFilters() {
    this.selectedFilters.clear()
    this.updateButtonStates()
    this.callbacks.onFiltersChanged?.()
  }

  private setSort(sortKey: TSortKey) {
    if (this.currentSortKey === sortKey) {
      this.sortAscending = !this.sortAscending
    } else {
      this.currentSortKey = sortKey
      this.sortAscending = true
    }

    this.updateButtonStates()
    this.callbacks.onSortChanged?.()
  }

  private updateButtonStates() {
    // Update filter buttons
    this.filterButtons.forEach((button, key) => {
      const bg = button.getAt(0) as Phaser.GameObjects.Rectangle
      let isActive = false

      // Parse the key to determine filter type and value
      const parts = key.split('_')
      if (parts.length >= 2) {
        const filterType = parts[0]
        const filterValue = parts.slice(1).join('_')
        const filterKey = `${filterType}_filter`
        isActive = this.selectedFilters.get(filterKey) === filterValue
      }

      bg.setFillStyle(isActive ? Colors.primary.main : Colors.background.cardHover)
    })

    // Update sort buttons
    this.sortButtons.forEach((button, sortKey) => {
      const bg = button.getAt(0) as Phaser.GameObjects.Rectangle
      const text = button.getAt(1) as Phaser.GameObjects.Text

      const isActive = this.currentSortKey === sortKey
      bg.setFillStyle(isActive ? Colors.primary.main : Colors.background.cardHover)

      // Find the label for this sort key
      const config = this.sortConfigs.find((c) => c.key === sortKey)
      const label = config?.label || sortKey

      if (isActive) {
        text.setText(label + (this.sortAscending ? '↑' : '↓'))
      } else {
        text.setText(label)
      }
    })
  }

  // Helper methods for labels
  private getBranchLabel(branch: ArmsBranch): string {
    const labels: Partial<Record<ArmsBranch, string>> = {
      [ArmsBranch.MISSILES]: 'Missiles',
      [ArmsBranch.SMALL_ARMS]: 'Small Arms',
      [ArmsBranch.ARMORED_VEHICLES]: 'Armored',
      [ArmsBranch.AIRCRAFT]: 'Aircraft',
      [ArmsBranch.NAVAL]: 'Naval',
      [ArmsBranch.DRONES]: 'Drones',
    }
    return labels[branch] || branch
  }

  private getConditionLabel(condition: ArmsCondition): string {
    return condition.charAt(0).toUpperCase() + condition.slice(1)
  }

  private getGradeLabel(grade: ArmsGrade): string {
    return grade.charAt(0).toUpperCase() + grade.slice(1)
  }

  // Public API for getting current filter/sort state
  public getActiveFilters(): Map<string, any> {
    return new Map(this.selectedFilters)
  }

  public getCurrentSort(): { key: TSortKey | null; ascending: boolean } {
    return {
      key: this.currentSortKey,
      ascending: this.sortAscending,
    }
  }

  public getSortCompareFunction(): ((a: any, b: any) => number) | null {
    if (!this.currentSortKey) return null

    const config = this.sortConfigs.find((c) => c.key === this.currentSortKey)
    if (!config) return null

    return (a: any, b: any) => {
      const comparison = config.compareFunction(a, b)
      return this.sortAscending ? comparison : -comparison
    }
  }

  // Apply filters to a collection
  public applyFilters<T>(
    items: T[],
    filterFunctions: Map<string, (item: T, filterValue: any) => boolean>,
  ): T[] {
    return items.filter((item) => {
      for (const [filterKey, filterValue] of this.selectedFilters) {
        const filterFunc = filterFunctions.get(filterKey)
        if (filterFunc && !filterFunc(item, filterValue)) {
          return false
        }
      }
      return true
    })
  }

  // Apply sorting to a collection
  public applySort<T>(items: T[]): T[] {
    const compareFunc = this.getSortCompareFunction()
    if (compareFunc) {
      items.sort(compareFunc)
    }
    return items
  }
}
