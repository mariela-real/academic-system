import { describe, expect, it } from 'vitest'
import { parseCourseCapacity } from './course-form'

describe('Course capacity', () => {
  it('accepts a positive whole-number capacity', () => {
    // arrange
    const value = '24'

    // act
    const capacity = parseCourseCapacity(value)

    // assert
    expect(capacity).toBe(24)
  })

  it.each(['', ' ', '0', '-2', '2.5'])(
    'rejects invalid capacity "%s"',
    (value) => {
      // arrange
      const invalidCapacity = value

      // act
      const capacity = parseCourseCapacity(invalidCapacity)

      // assert
      expect(capacity).toBeNull()
    },
  )
})
