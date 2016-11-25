
/**
 * {
 *   name: {
 *     type: 'string', 或是 [ 'string', 'number' ],
 *     value: '',
 *     required: true,
 *   }
 * }
 */

import * as env from '../config/env'

import * as is from './is'
import * as array from './array'
import * as object from './object'
import * as logger from './logger'

// 直接修改传入的数据
export function validate(data, schema) {
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
            matched = type.some(
              function (t) {
                return is.is(target, t)
              }
            )
          }
          else if (is.func(type)) {
            matched = type(target)
          }
          // 类型比较失败
          if (matched === env.FALSE) {
            logger.warn(`type of ${key} is not matched.`)
            delete data[key]
          }
        }
      }
      else if (required) {
        logger.warn(`${key} is not found.`)
      }
      else if (object.has(rule, 'value')) {
        data[key] = is.func(value) ? value() : value
      }
    }
  )
  return data
}
