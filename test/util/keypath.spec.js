
import * as keypath from '../../src/util/keypath'

describe('util/keypath', () => {
  it('normalize', () => {

    expect(
      keypath.normalize('a.b.c')
    )
    .toBe('a.b.c')

    expect(
      keypath.normalize('a.0.c')
    )
    .toBe('a.0.c')

    expect(
      keypath.normalize('a[0].c')
    )
    .toBe('a.0.c')

    expect(
      keypath.normalize('a["b"].c')
    )
    .toBe('a.b.c')

  })

  it('getWildcardNames', () => {

    expect(
      keypath.getWildcardNames('a.b.c', 'a.*.c')[0]
    )
    .toBe('b')

    expect(
      keypath.getWildcardNames('a.b.c.d.e', 'a.*.c.*.e').join('')
    )
    .toBe('bd')

  })

})
