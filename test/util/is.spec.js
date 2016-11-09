
import * as is from '../../src/util/is'

describe('util/is', () => {
  it('isFunction', () => {
    expect(
      is.isFunction(
        function () {}
      )
    )
    .toBe(true)

    expect(
      is.isFunction(
        parseInt
      )
    )
    .toBe(true)

    expect(
      is.isFunction(null)
    )
    .toBe(false)

    expect(
      is.isFunction(' ')
    )
    .toBe(false)

  })

  it('isArray', () => {

    expect(
      is.isArray([])
    )
    .toBe(true)

    expect(
      is.isArray(null)
    )
    .toBe(false)

    expect(
      is.isArray(' ')
    )
    .toBe(false)

  })

  it('isObject', () => {

    expect(
      is.isObject(null)
    )
    .toBe(false)

    expect(
      is.isObject({})
    )
    .toBe(true)

    expect(
      is.isObject(new String(''))
    )
    .toBe(true)

    expect(
      is.isObject(new Date())
    )
    .toBe(true)

  })

  it('isString', () => {

    expect(
      is.isString(null)
    )
    .toBe(false)

    expect(
      is.isString({})
    )
    .toBe(false)

    expect(
      is.isString(new String(''))
    )
    .toBe(true)

    expect(
      is.isString('')
    )
    .toBe(true)

  })

  it('isNumber', () => {

    expect(
      is.isNumber(null)
    )
    .toBe(false)

    expect(
      is.isNumber({})
    )
    .toBe(false)

    expect(
      is.isNumber(new Number(1))
    )
    .toBe(true)

    expect(
      is.isNumber(1)
    )
    .toBe(true)

  })

  it('isNumeric', () => {

    expect(
      is.isNumeric(null)
    )
    .toBe(false)

    expect(
      is.isNumeric({})
    )
    .toBe(false)

    expect(
      is.isNumeric('1.1str')
    )
    .toBe(false)

    expect(
      is.isNumeric(1)
    )
    .toBe(true)

    expect(
      is.isNumeric('1.1')
    )
    .toBe(true)

  })
})
