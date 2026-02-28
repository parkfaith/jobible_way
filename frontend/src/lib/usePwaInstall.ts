import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let deferredPrompt: BeforeInstallPromptEvent | null = null

export function usePwaInstall() {
  const [canInstall, setCanInstall] = useState(false)

  useEffect(() => {
    // 이미 캡처된 이벤트가 있으면 바로 사용
    if (deferredPrompt) {
      setCanInstall(true)
      return
    }

    function handler(e: Event) {
      e.preventDefault()
      deferredPrompt = e as BeforeInstallPromptEvent
      setCanInstall(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // 이미 설치된 경우 (standalone 모드)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setCanInstall(false)
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function install() {
    if (!deferredPrompt) return false
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    deferredPrompt = null
    setCanInstall(false)
    return outcome === 'accepted'
  }

  return { canInstall, install }
}
