
import {
  Event,
  Emitter,
} from '../../src/util/event'

describe('util/event', () => {
  it('on off', () => {

    let emitter = new Emitter()

    let counter = 0
    let listener = function () {
      counter++
    }
    emitter.on('a', listener)
    expect(emitter.has('a', listener)).toBe(true)
    emitter.fire('a')
    expect(counter).toBe(1)
    emitter.fire('a')
    expect(counter).toBe(2)

    emitter.off('a', listener)
    expect(emitter.has('a', listener)).toBe(false)

    emitter.fire('a')
    expect(counter).toBe(2)

  })

  it('once', () => {

    let emitter = new Emitter()

    let counter = 0
    let listener = function () {
      counter++
    }
    emitter.once('a', listener)
    expect(emitter.has('a', listener)).toBe(true)
    emitter.fire('a')
    expect(counter).toBe(1)
    emitter.fire('a')
    expect(counter).toBe(1)
    expect(emitter.has('a', listener)).toBe(false)

  })
})
