
import {
  parse,
  compile,
  traverse,
} from '../../src/util/expression'

describe('util/expression', () => {
  it('compile', () => {

    let fn = compile('a')
    expect(fn(1)).toBe(1)

    fn = compile('+a')
    expect(fn(-1)).toBe(-1)

    fn = compile('-a')
    expect(fn(1)).toBe(-1)

    fn = compile('!a')
    expect(fn(true)).toBe(false)

    fn = compile('~a')
    expect(fn('1')).toBe(~'1')

    fn = compile('a + b')
    expect(fn(1, 0)).toBe(1)

    fn = compile('a - b')
    expect(fn(2, 1)).toBe(1)

    fn = compile('a * b')
    expect(fn(2, 3)).toBe(6)

    fn = compile('a / b')
    expect(fn(6, 2)).toBe(3)

    fn = compile('a && b')
    expect(fn(true, true)).toBe(true)
    expect(fn(true, false)).toBe(false)

    fn = compile('a + b')
    expect(fn(1, 0)).toBe(1)
    expect(fn(10000, 10000)).toBe(20000)

    fn = compile('a ? 1 : 0')
    expect(fn(true)).toBe(1)
    expect(fn(false)).toBe(0)

    fn = compile('(a + b) ? c : 0')
    expect(fn(1, 0, 2)).toBe(2)
    expect(fn(0, 0, 2)).toBe(0)

    fn = compile('plus(a, b)')
    expect(fn(function (a, b) { return a + b; }, 2, 3)).toBe(5)

  })
})
