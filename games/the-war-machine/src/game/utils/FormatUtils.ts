/**
 * Utility functions for formatting numbers and text
 */

/**
 * Formats money amounts with K/M/B suffixes for thousands, millions, billions
 * @param amount The monetary amount to format
 * @param includeDecimals Whether to include one decimal place (default: true)
 * @returns Formatted string with $ prefix and appropriate suffix
 */
export function formatMoney(amount: number, includeDecimals: boolean = true): string {
  const absAmount = Math.abs(amount)
  const sign = amount < 0 ? '-' : ''

  if (absAmount >= 1000000000) {
    return `${sign}$${includeDecimals ? (absAmount / 1000000000).toFixed(1) : Math.round(absAmount / 1000000000)}B`
  } else if (absAmount >= 1000000) {
    return `${sign}$${includeDecimals ? (absAmount / 1000000).toFixed(1) : Math.round(absAmount / 1000000)}M`
  } else if (absAmount >= 1000) {
    return `${sign}$${includeDecimals ? (absAmount / 1000).toFixed(1) : Math.round(absAmount / 1000)}K`
  }
  return `${sign}$${absAmount.toLocaleString()}`
}

/**
 * Formats numbers with K/M/B suffixes (without currency symbol)
 * @param num The number to format
 * @param includeDecimals Whether to include one decimal place (default: true)
 * @returns Formatted string with appropriate suffix
 */
export function formatNumber(num: number, includeDecimals: boolean = true): string {
  const absNum = Math.abs(num)
  const sign = num < 0 ? '-' : ''

  if (absNum >= 1000000000) {
    return `${sign}${includeDecimals ? (absNum / 1000000000).toFixed(1) : Math.round(absNum / 1000000000)}B`
  } else if (absNum >= 1000000) {
    return `${sign}${includeDecimals ? (absNum / 1000000).toFixed(1) : Math.round(absNum / 1000000)}M`
  } else if (absNum >= 1000) {
    return `${sign}${includeDecimals ? (absNum / 1000).toFixed(1) : Math.round(absNum / 1000)}K`
  }
  return `${sign}${absNum.toLocaleString()}`
}
