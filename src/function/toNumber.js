
import * as is from '../util/is'

module.exports = function (str, defaultValue) {
  if (is.numeric(str)) {
    return +str
  }
  return arguments.length === 2 ? defaultValue : 0
}
