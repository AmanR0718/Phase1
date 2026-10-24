// src/env.d.ts
interface ImportMetaEnv {
  DEV: boolean
  readonly PROD: boolean
  readonly MODE: string
  readonly VITE_API_BASE_URL?: string
  readonly VITE_API_PROD_URL?: string
  readonly VITE_MOBILE_API_URL?: string
  // add other VITE_... envs as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
