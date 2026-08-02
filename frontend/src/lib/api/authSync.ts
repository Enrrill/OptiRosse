import { useAuthStore } from '@/store/useAuth'

const CHANNEL_NAME = 'optirosse-auth'

interface AuthTokensMessage {
  type: 'tokens'
  access: string
  refresh: string
}

interface AuthLogoutMessage {
  type: 'logout'
}

type AuthMessage = AuthTokensMessage | AuthLogoutMessage

const channel: BroadcastChannel | null =
  typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(CHANNEL_NAME) : null

if (channel) {
  channel.onmessage = (event: MessageEvent<AuthMessage>) => {
    const msg = event.data
    if (!msg) return
    if (msg.type === 'tokens') {
      useAuthStore.getState().setTokens(msg.access, msg.refresh)
    } else if (msg.type === 'logout') {
      useAuthStore.getState().logout()
    }
  }
}

export function notifyTokens(access: string, refresh: string): void {
  channel?.postMessage({ type: 'tokens', access, refresh })
}

export function notifyLogout(): void {
  channel?.postMessage({ type: 'logout' })
}
