import { type ConsolaOptions, LogLevels, createConsola } from 'consola'

const options: Partial<ConsolaOptions> = {
  level: LogLevels.info,
}

export function useLogger(namaspace: string) {
  const logger = createConsola(options).withTag(namaspace)

  return logger
}
