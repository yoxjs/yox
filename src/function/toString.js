
import * as is from '../util/is'

export default function (str, defaultValue = '') {
  if (is.string(str)) {
    return str
  }
  if (is.numeric(str)) {
    return '' + str
  }
  return defaultValue
}
