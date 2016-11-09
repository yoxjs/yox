import {
  isString,
  isNumeric,
} from '../util/is'

module.exports = function (str, defaultValue) {
  if (isString(str)) {
    return str
  }
  if (isNumeric(str)) {
    return '' + str
  }
  return arguments.length === 2 ? defaultValue : ''
}
