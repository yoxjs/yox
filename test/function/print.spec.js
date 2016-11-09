
import print from '../../src/function/print'

describe('function/print', () => {
  it('one string param', () => {
    expect(
      print('hi,%s', 'musicode')
    )
    .toBe('hi,musicode')
  })
  it('two string params', () => {
    expect(
      print('hi,%s,%s', 'good', 'musicode')
    )
    .toBe('hi,good,musicode')
  })
})
