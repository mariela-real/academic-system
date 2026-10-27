import { describe, expect, it } from 'vitest'
import { getDashboardNavigation } from './dashboard-navigation'

describe('Academic dashboard navigation', () => {
  it('shows administration sections only to administrators', () => {
    // arrange
    const administratorRole = 'admin'
    const studentRole = 'student'

    // act
    const administratorSections = getDashboardNavigation(administratorRole)
    const studentSections = getDashboardNavigation(studentRole)

    // assert
    expect(administratorSections.map((section) => section.label)).toEqual([
      'Espacio académico',
      'Administración',
    ])
    expect(studentSections.map((section) => section.label)).toEqual([
      'Espacio académico',
    ])
    expect(studentSections[0].items.map((item) => item.value)).not.toContain(
      'users',
    )
    expect(administratorSections[1].items.map((item) => item.value)).toContain(
      'teachers',
    )
    expect(studentSections[0].items.map((item) => item.value)).not.toContain(
      'teachers',
    )
  })
})
