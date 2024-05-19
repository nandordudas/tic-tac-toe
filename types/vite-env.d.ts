interface ImportMetaEnv {
  DEV_SERVER_CERT: string
  DEV_SERVER_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
