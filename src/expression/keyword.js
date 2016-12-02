
import * as env from '../config/env'

// 区分关键字和普通变量
// 举个例子：a === true
// 从解析器的角度来说，a 和 true 是一样的 token
export default {
  'true': env.TRUE,
  'false': env.FALSE,
  'null': env.NULL,
  'undefined': env.UNDEFINED,
}
