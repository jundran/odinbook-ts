// This is needed so that typescript does not give error:
// Property 'env' does not exist on type 'ImportMeta'.ts(2339)
// when using import.meta.env.VITE_SOME_ENV_VARIABLE

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SERVER: string
	readonly VITE_API: string
}

// https://vitejs.dev/guide/env-and-mode.html#intellisense-for-typescript
