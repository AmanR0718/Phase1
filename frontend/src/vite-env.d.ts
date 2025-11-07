// src/env.d.ts
interface ImportMetaEnv {
  DEV: any
  readonly VITE_API_BASE_URL?: string
  // add other VITE_... envs as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
