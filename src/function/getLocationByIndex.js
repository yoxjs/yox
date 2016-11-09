
import {
  FALSE,
} from '../config/env'

import {
  each,
} from '../util/array'

module.exports = function (str, index) {

  let line = 0, col = 0, pos = 0

  each(
    str.split('\n'),
    function (lineStr) {
      line++
      col = 0

      let { length } = lineStr
      if (index >= pos && index <= (pos + length)) {
        col = index - pos
        return FALSE
      }

      pos += length
    }
  )

  return {
    line,
    col,
  }

}
