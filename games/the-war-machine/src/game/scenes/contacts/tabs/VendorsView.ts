import type { PotatoScene } from '@potato-golem/ui'
import * as Phaser from 'phaser'
import type { WorldModel } from '../../../model/entities/WorldModel.ts'
import { ArmsManufacturer } from '../../../model/enums/ArmsManufacturer.ts'
import { armsRegistry } from '../../../registries/armsRegistry.ts'
import { ArmsGrade } from '../../../model/enums/ArmsStockEnums.ts'
import {
  Colors,
  Typography,
  Borders,
  Spacing,
  Dimensions,
} from '../../../registries/styleRegistry.ts'

interface VendorInfo {
  manufacturer: ArmsManufacturer
  displayName: string
  description: string
  specialties: string[]
  gradeRange: ArmsGrade[]
  contactQuality: 'basic' | 'standard' | 'premium'
}

export class VendorsView extends Phaser.GameObjects.Container {
  private worldModel: WorldModel
  private vendorInfoMap: Map<ArmsManufacturer, VendorInfo>
  private vendorContainers: Phaser.GameObjects.Container[] = []
  private selectedVendor?: ArmsManufacturer

  constructor(scene: PotatoScene, worldModel: WorldModel) {
    super(scene, 0, 0)
    this.worldModel = worldModel
    this.vendorInfoMap = this.initializeVendorInfo()

    this.createView()
  }

  private initializeVendorInfo(): Map<ArmsManufacturer, VendorInfo> {
    const info = new Map<ArmsManufacturer, VendorInfo>()

    // High-tier vendors
    info.set(ArmsManufacturer.NEXUS_DEFENSE, {
      manufacturer: ArmsManufacturer.NEXUS_DEFENSE,
      displayName: 'Nexus Defense Systems',
      description: 'Premier defense contractor specializing in advanced missiles and electronic warfare',
      specialties: ['Missiles', 'Electronic Warfare', 'Command Systems'],
      gradeRange: [ArmsGrade.MODERN, ArmsGrade.NEXTGEN],
      contactQuality: 'premium',
    })

    info.set(ArmsManufacturer.TITAN_AEROSPACE, {
      manufacturer: ArmsManufacturer.TITAN_AEROSPACE,
      displayName: 'Titan Aerospace',
      description: 'Leading aircraft and missile manufacturer',
      specialties: ['Fighter Jets', 'Attack Helicopters', 'Air-to-Ground Missiles'],
      gradeRange: [ArmsGrade.MODERN, ArmsGrade.NEXTGEN],
      contactQuality: 'premium',
    })

    info.set(ArmsManufacturer.IRONFORGE, {
      manufacturer: ArmsManufacturer.IRONFORGE,
      displayName: 'IronForge Industries',
      description: 'Heavy armor and vehicle specialists',
      specialties: ['Main Battle Tanks', 'APCs', 'Heavy Armor'],
      gradeRange: [ArmsGrade.MODERN],
      contactQuality: 'standard',
    })

    info.set(ArmsManufacturer.APEX_ARMAMENTS, {
      manufacturer: ArmsManufacturer.APEX_ARMAMENTS,
      displayName: 'Apex Armaments',
      description: 'Combat vehicles and infantry systems',
      specialties: ['IFVs', 'Light Armor', 'Infantry Weapons'],
      gradeRange: [ArmsGrade.MODERN],
      contactQuality: 'standard',
    })

    info.set(ArmsManufacturer.SKYFORGE, {
      manufacturer: ArmsManufacturer.SKYFORGE,
      displayName: 'SkyForge Aviation',
      description: 'Military helicopters and rotorcraft',
      specialties: ['Attack Helicopters', 'Transport Helicopters'],
      gradeRange: [ArmsGrade.MODERN],
      contactQuality: 'standard',
    })

    info.set(ArmsManufacturer.PRECISION_ARMS, {
      manufacturer: ArmsManufacturer.PRECISION_ARMS,
      displayName: 'Precision Arms Corporation',
      description: 'Small arms and infantry weapons',
      specialties: ['Assault Rifles', 'Sniper Rifles', 'Carbines'],
      gradeRange: [ArmsGrade.MODERN],
      contactQuality: 'standard',
    })

    info.set(ArmsManufacturer.MARITIME_DEFENSE, {
      manufacturer: ArmsManufacturer.MARITIME_DEFENSE,
      displayName: 'Maritime Defense Systems',
      description: 'Naval vessels and maritime warfare',
      specialties: ['Destroyers', 'Frigates', 'Naval Weapons'],
      gradeRange: [ArmsGrade.MODERN, ArmsGrade.NEXTGEN],
      contactQuality: 'premium',
    })

    info.set(ArmsManufacturer.AUTONOMOUS_SYSTEMS, {
      manufacturer: ArmsManufacturer.AUTONOMOUS_SYSTEMS,
      displayName: 'Autonomous Systems Inc.',
      description: 'Unmanned systems and AI-driven platforms',
      specialties: ['UAVs', 'Combat Drones', 'Autonomous Systems'],
      gradeRange: [ArmsGrade.NEXTGEN, ArmsGrade.EXPERIMENTAL],
      contactQuality: 'premium',
    })

    info.set(ArmsManufacturer.EAGLE_EYE, {
      manufacturer: ArmsManufacturer.EAGLE_EYE,
      displayName: 'Eagle Eye Precision',
      description: 'Long-range precision weapons',
      specialties: ['Sniper Systems', 'Anti-Materiel Rifles'],
      gradeRange: [ArmsGrade.MODERN],
      contactQuality: 'standard',
    })

    // Lower-tier vendors
    info.set(ArmsManufacturer.DESERT_FORGE, {
      manufacturer: ArmsManufacturer.DESERT_FORGE,
      displayName: 'Desert Forge Arms',
      description: 'Regional manufacturer focused on desert warfare',
      specialties: ['Light Vehicles', 'Basic Rifles'],
      gradeRange: [ArmsGrade.LEGACY],
      contactQuality: 'basic',
    })

    info.set(ArmsManufacturer.LIBERTY_SURPLUS, {
      manufacturer: ArmsManufacturer.LIBERTY_SURPLUS,
      displayName: 'Liberty Surplus Co.',
      description: 'Military surplus and refurbished equipment',
      specialties: ['Surplus Rifles', 'Refurbished Equipment'],
      gradeRange: [ArmsGrade.OBSOLETE],
      contactQuality: 'basic',
    })

    info.set(ArmsManufacturer.IRON_CURTAIN, {
      manufacturer: ArmsManufacturer.IRON_CURTAIN,
      displayName: 'Iron Curtain Works',
      description: 'Eastern-bloc style equipment',
      specialties: ['Rocket Artillery', 'Old Tanks'],
      gradeRange: [ArmsGrade.OBSOLETE, ArmsGrade.LEGACY],
      contactQuality: 'basic',
    })

    info.set(ArmsManufacturer.GUERRILLA_WORKS, {
      manufacturer: ArmsManufacturer.GUERRILLA_WORKS,
      displayName: 'Guerrilla Works',
      description: 'Irregular warfare and modified equipment',
      specialties: ['SMGs', 'Modified Drones'],
      gradeRange: [ArmsGrade.OBSOLETE],
      contactQuality: 'basic',
    })

    info.set(ArmsManufacturer.BUDGET_BALLISTICS, {
      manufacturer: ArmsManufacturer.BUDGET_BALLISTICS,
      displayName: 'Budget Ballistics',
      description: 'Low-cost rockets and munitions',
      specialties: ['Unguided Rockets', 'Basic SAMs'],
      gradeRange: [ArmsGrade.OBSOLETE, ArmsGrade.LEGACY],
      contactQuality: 'basic',
    })

    info.set(ArmsManufacturer.FRONTIER_ARMS, {
      manufacturer: ArmsManufacturer.FRONTIER_ARMS,
      displayName: 'Frontier Arms',
      description: 'Rugged equipment for harsh conditions',
      specialties: ['MRAPs', 'Carbines'],
      gradeRange: [ArmsGrade.LEGACY],
      contactQuality: 'basic',
    })

    info.set(ArmsManufacturer.BACKYARD_DEFENSE, {
      manufacturer: ArmsManufacturer.BACKYARD_DEFENSE,
      displayName: 'Backyard Defense',
      description: 'Locally produced copies and simple weapons',
      specialties: ['Copied Rifles', 'Mortars'],
      gradeRange: [ArmsGrade.OBSOLETE],
      contactQuality: 'basic',
    })

    return info
  }

  private createView() {
    // Get unlocked vendor contacts
    const unlockedVendors = this.worldModel.getVendorContacts()

    if (unlockedVendors.length === 0) {
      // No vendors unlocked yet
      const noVendorsText = this.scene.add.text(0, 0,
        'No Vendor Contacts\n\n' +
        'Unlock vendor contacts by successfully\nattending Arms Shows',
        {
          fontSize: Typography.fontSize.h4,
          fontFamily: Typography.fontFamily.primary,
          color: Colors.text.muted,
          align: 'center',
        }
      )
      noVendorsText.setOrigin(0.5)
      this.add(noVendorsText)
      return
    }

    // Title
    const titleText = this.scene.add.text(0, -200,
      `Vendor Contacts (${unlockedVendors.length} unlocked)`,
      {
        fontSize: Typography.fontSize.h3,
        fontFamily: Typography.fontFamily.primary,
        color: Colors.text.primary,
        fontStyle: Typography.fontStyle.bold,
      }
    )
    titleText.setOrigin(0.5)
    this.add(titleText)

    // Sort vendors by quality tier
    const sortedVendors = unlockedVendors.sort((a, b) => {
      const infoA = this.vendorInfoMap.get(a)
      const infoB = this.vendorInfoMap.get(b)
      if (!infoA || !infoB) return 0

      const qualityOrder = { premium: 0, standard: 1, basic: 2 }
      return qualityOrder[infoA.contactQuality] - qualityOrder[infoB.contactQuality]
    })

    // Create vendor listings
    sortedVendors.forEach((vendor, index) => {
      const vendorInfo = this.vendorInfoMap.get(vendor)
      if (!vendorInfo) return

      const y = -140 + index * 55  // Compact spacing
      const vendorContainer = this.scene.add.container(-650, y)

      // Background
      const bgColor = this.getQualityColor(vendorInfo.contactQuality)
      const bg = this.scene.add.rectangle(
        350,
        25,
        1300,
        50,
        bgColor,
        0.2
      )
      bg.setStrokeStyle(Borders.width.thin, bgColor)
      bg.setInteractive()
      vendorContainer.add(bg)

      // Vendor name
      const nameText = this.scene.add.text(10, 10, vendorInfo.displayName, {
        fontSize: Typography.fontSize.regular,
        fontFamily: Typography.fontFamily.primary,
        color: Colors.text.primary,
        fontStyle: Typography.fontStyle.bold,
      })
      vendorContainer.add(nameText)

      // Quality badge
      const qualityText = this.scene.add.text(350, 10,
        vendorInfo.contactQuality.toUpperCase(),
        {
          fontSize: Typography.fontSize.small,
          fontFamily: Typography.fontFamily.primary,
          color: this.getQualityTextColor(vendorInfo.contactQuality),
          fontStyle: Typography.fontStyle.bold,
        }
      )
      vendorContainer.add(qualityText)

      // Description
      const descText = this.scene.add.text(10, 30, vendorInfo.description, {
        fontSize: Typography.fontSize.caption,
        fontFamily: Typography.fontFamily.primary,
        color: Colors.text.secondary,
      })
      vendorContainer.add(descText)

      // Specialties
      const specialtiesText = this.scene.add.text(500, 10,
        vendorInfo.specialties.join(', '),
        {
          fontSize: Typography.fontSize.small,
          fontFamily: Typography.fontFamily.primary,
          color: Colors.text.muted,
        }
      )
      vendorContainer.add(specialtiesText)

      // Grade range
      const gradeText = this.scene.add.text(1000, 10,
        `Grades: ${vendorInfo.gradeRange.map(g => this.getGradeDisplay(g)).join('-')}`,
        {
          fontSize: Typography.fontSize.small,
          fontFamily: Typography.fontFamily.primary,
          color: Colors.text.secondary,
        }
      )
      vendorContainer.add(gradeText)

      // Contact button
      const contactButton = this.scene.add.container(1150, 25)
      const contactBg = this.scene.add.rectangle(0, 0, 100, 35, Colors.primary.main)
      contactBg.setInteractive()
      contactButton.add(contactBg)

      const contactText = this.scene.add.text(0, 0, 'CONTACT', {
        fontSize: Typography.fontSize.small,
        fontFamily: Typography.fontFamily.primary,
        color: Colors.text.primary,
        fontStyle: Typography.fontStyle.bold,
      })
      contactText.setOrigin(0.5)
      contactButton.add(contactText)

      contactBg.on('pointerover', () => contactBg.setFillStyle(Colors.primary.light))
      contactBg.on('pointerout', () => contactBg.setFillStyle(Colors.primary.main))
      contactBg.on('pointerdown', () => {
        this.handleContactVendor(vendor)
      })

      vendorContainer.add(contactButton)

      // Hover effects
      bg.on('pointerover', () => {
        bg.setFillStyle(bgColor, 0.3)
      })

      bg.on('pointerout', () => {
        bg.setFillStyle(bgColor, 0.2)
      })

      this.add(vendorContainer)
      this.vendorContainers.push(vendorContainer)
    })

    // Info text at bottom
    const infoText = this.scene.add.text(0, 200,
      'Contact vendors to purchase their equipment directly',
      {
        fontSize: Typography.fontSize.caption,
        fontFamily: Typography.fontFamily.primary,
        color: Colors.text.muted,
        fontStyle: Typography.fontStyle.italic,
      }
    )
    infoText.setOrigin(0.5)
    this.add(infoText)
  }

  private getQualityColor(quality: 'basic' | 'standard' | 'premium'): number {
    switch (quality) {
      case 'premium':
        return Colors.status.success
      case 'standard':
        return Colors.primary.main
      case 'basic':
        return Colors.ui.divider
      default:
        return Colors.background.cardHover
    }
  }

  private getQualityTextColor(quality: 'basic' | 'standard' | 'premium'): string {
    switch (quality) {
      case 'premium':
        return Colors.status.successText
      case 'standard':
        return Colors.text.primary
      case 'basic':
        return Colors.text.muted
      default:
        return Colors.text.muted
    }
  }

  private getGradeDisplay(grade: ArmsGrade): string {
    switch (grade) {
      case ArmsGrade.OBSOLETE:
        return 'Obs'
      case ArmsGrade.LEGACY:
        return 'Leg'
      case ArmsGrade.MODERN:
        return 'Mod'
      case ArmsGrade.NEXTGEN:
        return 'NG'
      case ArmsGrade.EXPERIMENTAL:
        return 'Exp'
      default:
        return '?'
    }
  }

  private handleContactVendor(vendor: ArmsManufacturer) {
    // TODO: Implement vendor catalog view
    const vendorInfo = this.vendorInfoMap.get(vendor)
    if (!vendorInfo) return

    this.showMessage(`Contacting ${vendorInfo.displayName}...`, Colors.primary.light)
  }

  private showMessage(message: string, color: number) {
    const messageText = this.scene.add.text(0, -50, message, {
      fontSize: Typography.fontSize.h5,
      fontFamily: Typography.fontFamily.primary,
      color: `#${color.toString(16).padStart(6, '0')}`,
      fontStyle: Typography.fontStyle.bold,
    })
    messageText.setOrigin(0.5)
    this.add(messageText)

    // Fade out and destroy
    this.scene.tweens.add({
      targets: messageText,
      alpha: 0,
      y: -100,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => messageText.destroy(),
    })
  }
}