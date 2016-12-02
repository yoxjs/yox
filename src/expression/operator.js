
import * as env from '../config/env'
import * as object from '../util/object'

/**
 * 倒排对象的 key
 *
 * @param {Object} obj
 * @return {Array.<string>}
 */
function sortKeys(obj) {
  return object.keys(obj).sort(
    function (a, b) {
      return b.length - a.length
    }
  )
}

// 一元操作符
export const unaryMap = {
  '+': env.TRUE,
  '-': env.TRUE,
  '!': env.TRUE,
  '~': env.TRUE,
}

export const unaryList = sortKeys(unaryMap)

// 二元操作符
// 操作符和对应的优先级，数字越大优先级越高
export const binaryMap = {
  '||': 1,
  '&&': 2,
  '|': 3,
  '^': 4,
  '&': 5,
  '==': 6,
  '!=': 6,
  '===': 6,
  '!==': 6,
  '<': 7,
  '>': 7,
  '<=': 7,
  '>=': 7,
  '<<':8,
  '>>': 8,
  '>>>': 8,
  '+': 9,
  '-': 9,
  '*': 10,
  '/': 10,
  '%': 10,
}

export const binaryList = sortKeys(binaryMap)
