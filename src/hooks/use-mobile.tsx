
import * as React from "react"

/** The breakpoint (in pixels) below which the app is considered to be in mobile mode */
const MOBILE_BREAKPOINT = 768

/**
 * Custom hook that detects if the current viewport is mobile-sized
 * Uses media queries to track viewport changes
 *
 * @returns {boolean} True if the current viewport is considered mobile-sized
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const isMobile = useIsMobile();
 *   
 *   return (
 *     <div>
 *       {isMobile ? <MobileView /> : <DesktopView />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Create media query list to track viewport size changes
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // Handler for media query changes
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Add event listener and set initial value
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    // Clean up event listener on unmount
    return () => mql.removeEventListener("change", onChange)
  }, [])

  // Return boolean value (default to false if undefined)
  return !!isMobile
}
