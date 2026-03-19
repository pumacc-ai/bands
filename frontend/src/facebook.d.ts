// Minimal ambient types for the Facebook JS SDK global (window.FB)
// Only the surface used by RegisterBand.tsx is declared here.

interface FBAuthResponse {
  accessToken: string
  userID: string
  expiresIn: number
  signedRequest: string
}

interface FBStatusResponse {
  status: 'connected' | 'not_authorized' | 'unknown'
  authResponse: FBAuthResponse | null
}

interface FBInitParams {
  appId: string
  cookie?: boolean
  xfbml?: boolean
  version: string
}

interface FacebookStatic {
  init(params: FBInitParams): void
  login(
    callback: (response: FBStatusResponse) => void,
    options?: { scope: string },
  ): void
  logout(callback: (response: FBStatusResponse) => void): void
  getLoginStatus(callback: (response: FBStatusResponse) => void): void
  api(
    path: string,
    params: Record<string, string>,
    callback: (response: Record<string, unknown>) => void,
  ): void
}

declare global {
  interface Window {
    FB: FacebookStatic
    fbAsyncInit: () => void
  }
}

export {}
