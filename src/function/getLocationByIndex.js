
import * as env from '../config/env'
import * as array from '../util/array'

export default function (str, index) {

  let line = 0, col = 0, pos = 0

  array.each(
    str.split('\n'),
    function (lineStr) {
      line++
      col = 0

      let { length } = lineStr
      if (index >= pos && index <= (pos + length)) {
        col = index - pos
        return env.FALSE
      }

      pos += length
    }
  )

  return {
    line,
    col,
  }

}
