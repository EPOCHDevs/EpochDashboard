import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { getHighchartsTheme } from '../constants'

/**
 * Hook that provides theme-aware Highcharts configuration
 * Automatically updates when the theme changes
 *
 * @returns Highcharts theme options that respect the current theme
 *
 * @example
 * ```tsx
 * const MyChart = () => {
 *   const highchartsTheme = useHighchartsTheme()
 *
 *   const options = {
 *     ...highchartsTheme,
 *     series: [{ data: [1, 2, 3] }]
 *   }
 *
 *   return <HighchartsReact options={options} />
 * }
 * ```
 */
export const useHighchartsTheme = () => {
  const { theme, resolvedTheme } = useTheme()
  const [highchartsTheme, setHighchartsTheme] = useState(() => getHighchartsTheme())

  useEffect(() => {
    // Update theme when theme changes or when component mounts
    // We use a slight delay to ensure CSS variables are updated
    const updateTheme = () => {
      setHighchartsTheme(getHighchartsTheme())
    }

    // Initial update
    updateTheme()

    // Update when theme changes
    const timeoutId = setTimeout(updateTheme, 100)

    return () => clearTimeout(timeoutId)
  }, [theme, resolvedTheme])

  return highchartsTheme
}

export default useHighchartsTheme
