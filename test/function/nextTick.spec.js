
import nextTick from '../../src/function/nextTick'

describe('function/nextTick', () => {
  it('nextTick', done => {
    let i = 0
    nextTick(() => {
      i++
      expect(i).toBe(2)
      done()
    })
    i++
  })
})
