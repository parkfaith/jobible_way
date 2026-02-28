import { useState, useEffect, useCallback } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISSED_KEY = 'pwa-install-dismissed'

let deferredPrompt: BeforeInstallPromptEvent | null = null

// 모듈 로드 시 바로 리스너 등록 (컴포넌트 렌더 전에 이벤트 캡처)
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e as BeforeInstallPromptEvent
  })
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
    || (navigator as any).standalone === true
}

function isIos() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
}

export function usePwaInstall() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    if (isStandalone()) return
    if (localStorage.getItem(DISMISSED_KEY)) return
    setShowBanner(true)
  }, [])

  const install = useCallback(async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      deferredPrompt = null
      if (outcome === 'accepted') {
        setShowBanner(false)
        return true
      }
    }
    return false
  }, [])

  const dismiss = useCallback(() => {
    setShowBanner(false)
    localStorage.setItem(DISMISSED_KEY, '1')
  }, [])

  return {
    showBanner,
    hasNativePrompt: !!deferredPrompt,
    isIos: isIos(),
    install,
    dismiss,
  }
}
