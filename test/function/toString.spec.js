
import toString from '../../src/function/toString'

describe('function/toString', () => {
  it('defaultValue is empty string', () => {
    expect(
      toString(null)
    )
    .toBe('')
  })
  it('custom defaultValue', () => {
    expect(
      toString(null, 1)
    )
    .toBe(1)
  })
  it('string', () => {
    expect(
      toString('1')
    )
    .toBe('1')
  })
  it('number', () => {
    expect(
      toString(1.1)
    )
    .toBe('1.1')
  })
  it('boolean to defaultValue', () => {
    expect(
      toString(true)
    )
    .toBe('')
  })
  it('date to defaultValue', () => {
    expect(
      toString(new Date())
    )
    .toBe('')
  })
})
