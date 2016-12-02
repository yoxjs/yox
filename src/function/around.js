
import * as env from '../config/env'

import * as is from '../util/is'
import execute from './execute'

export default function (object, fn, enter, leave) {
  if (is.func(enter) && enter(object) === env.FALSE) {
    return
  }
  let result = execute(fn, object, object)
  return is.func(leave)
    ? leave(object, result)
    : result
}
