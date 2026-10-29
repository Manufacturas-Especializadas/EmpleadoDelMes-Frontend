export const appConfig = {
  name: import.meta.env.VITE_APP_NAME,
  mode: import.meta.env.MODE,
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, ''),
} as const
