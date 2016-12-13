
import * as expression from '../expression/index'

export default function (str) {
  if (str.indexOf('[') > 0 && str.indexOf(']') > 0) {
    return expression.parse(str).stringify()
  }
  return str
}
