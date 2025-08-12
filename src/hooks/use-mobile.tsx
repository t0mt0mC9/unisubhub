import * as React from "react"
import { Capacitor } from '@capacitor/core';

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

// Hook pour détecter si on est sur une plateforme native (iOS/Android via Capacitor)
export function useIsNativePlatform() {
  const [isNative, setIsNative] = React.useState<boolean>(false)

  React.useEffect(() => {
    setIsNative(Capacitor.isNativePlatform())
  }, [])

  return isNative
}
