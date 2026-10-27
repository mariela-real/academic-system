import { describe, expect, it } from 'vitest'
import { boliviaDateTimeToIso, formatBoliviaDate } from './bolivia-date'

describe('Bolivian academic calendar', () => {
  it('converts an administrator-entered Bolivia time to an absolute instant', () => {
    // arrange
    const localDateTime = '2026-02-01T10:30'

    // act
    const instant = boliviaDateTimeToIso(localDateTime)

    // assert
    expect(instant).toBe('2026-02-01T14:30:00.000Z')
  })

  it('displays stored instants using the Bolivia time zone', () => {
    // arrange
    const instant = '2026-02-01T14:30:00.000Z'

    // act
    const displayedValue = formatBoliviaDate(instant)

    // assert
    expect(displayedValue).toContain('10:30')
  })
})
