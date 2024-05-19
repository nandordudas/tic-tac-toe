import { type PathLike, accessSync, constants } from 'node:fs'

import { name, version } from './package.json'

const httpsServerFiles = {
  cert: import.meta.env.DEV_SERVER_CERT,
  key: import.meta.env.DEV_SERVER_KEY,
} as const

const https = Object.values(httpsServerFiles).every(isReadable) ? httpsServerFiles : false

export default defineNuxtConfig({
  devServer: {
    https,
  },
  devtools: {
    enabled: true,
  },
  modules: [
    '@nuxt/eslint',
  ],
  eslint: {
    config: {
      standalone: false,
    },
  },
  runtimeConfig: {
    public: {
      app: {
        name,
        version,
      },
    },
  },
  typescript: {
    strict: false,
  },
})

function isReadable(filePath: PathLike) {
  try {
    accessSync(filePath, constants.R_OK)

    return true
  }
  catch {
    return false
  }
}
