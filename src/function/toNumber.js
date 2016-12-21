
import * as is from '../util/is'

export default function (str, defaultValue = 0) {
  if (is.numeric(str)) {
    return +str
  }
  return defaultValue
}
