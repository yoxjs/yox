import camelCase from '../../src/function/camelCase'

describe('function/camelCase', () => {
  it('single -', () => {
    expect(camelCase('font-size')).toBe('fontSize')
  })
  it('multiple -', () => {
    expect(camelCase('font-size-family')).toBe('fontSizeFamily')
  })
  it('single _', () => {
    expect(camelCase('font_size')).toBe('font_size')
  })
  it('multiple _', () => {
    expect(camelCase('font_size_family')).toBe('font_size_family')
  })
})
