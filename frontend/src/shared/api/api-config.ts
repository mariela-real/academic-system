export function getApiUrl(path: string): URL {
  const apiBaseUrl = import.meta.env.VITE_API_URL?.trim()

  if (apiBaseUrl === undefined || apiBaseUrl.length === 0) {
    throw new Error('Falta configurar VITE_API_URL.')
  }

  return new URL(path, `${apiBaseUrl}/`)
}
