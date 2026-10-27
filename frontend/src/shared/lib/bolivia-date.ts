const BOLIVIA_TIME_ZONE = 'America/La_Paz'

export function formatBoliviaDate(value: string): string {
  return new Intl.DateTimeFormat('es-BO', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: BOLIVIA_TIME_ZONE,
  }).format(new Date(value))
}

export function formatBoliviaDateTimeInput(value: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: BOLIVIA_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(value))
  const fields = new Map(parts.map((part) => [part.type, part.value]))

  return `${fields.get('year')}-${fields.get('month')}-${fields.get('day')}T${fields.get('hour')}:${fields.get('minute')}`
}

export function boliviaDateTimeToIso(value: string): string {
  return new Date(`${value}:00-04:00`).toISOString()
}
