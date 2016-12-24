
/**
 * propTypes: {
 *   name: {
 *     type: 'string', 或是 [ 'string', 'number' ],
 *     value: '',
 *     required: true,
 *   }
 * }
 */

import * as env from '../config/env'

import * as is from '../util/is'
import * as array from '../util/array'
import * as object from '../util/object'

export default function (data, schema, onNotMatched, onNotFound) {
  let result = { }
  object.each(
    schema,
    function (rule, key) {
      let { type, value, required } = rule
      if (object.has(data, key)) {
        // 如果不写 type 或 type 不是 字符串 或 数组
        // 就当做此规则无效，和没写一样
        if (type) {
          let target = data[key], matched
          // 比较类型
          if (is.string(type)) {
            matched = is.is(target, type)
          }
          else if (is.array(type)) {
            array.each(
              type,
              function (t) {
                if (is.is(target, t)) {
                  matched = env.TRUE
                  return env.FALSE
                }
              }
            )
          }
          else if (is.func(type)) {
            // 有时候做判断需要参考其他数据
            // 比如当 a 有值时，b 可以为空之类的
            matched = type(target, data)
          }
          if (matched === env.TRUE) {
            result[key] = target
          }
          else {
            onNotMatched(key)
          }
        }
      }
      else if (required) {
        onNotFound(key)
      }
      else if (object.has(rule, 'value')) {
        result[key] = is.func(value) ? value(data) : value
      }
    }
  )
  return result
}
