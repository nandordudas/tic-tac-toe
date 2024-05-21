export function safeParse<T>(data: unknown): T | undefined {
  try {
    return JSON.parse(data as string) as T
  }
  catch {
    return undefined
  }
}
