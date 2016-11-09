import {
  isNumeric,
} from '../util/is'

module.exports = function (str, defaultValue) {
  if (isNumeric(str)) {
    return +str
  }
  return arguments.length === 2 ? defaultValue : 0
}
