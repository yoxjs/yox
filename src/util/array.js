
import * as env from '../config/env'

import * as is from './is'

let {
  slice,
} = Array.prototype

/**
 * 遍历数组
 *
 * @param {Array} array
 * @param {Function} callback 返回 false 可停止遍历
 * @param {?boolean} reversed 是否逆序遍历
 */
export function each(array, callback, reversed) {
  let { length } = array
  if (reversed) {
    for (let i = length - 1; i >= 0; i--) {
      if (callback(array[i], i) === env.FALSE) {
        break
      }
    }
  }
  else {
    for (let i = 0; i < length; i++) {
      if (callback(array[i], i) === env.FALSE) {
        break
      }
    }
  }
}

/**
 * 返回 array2 中包含，array1 中不包含的数组项
 *
 * @param {Array} array1
 * @param {Array} array2
 * @param {?boolean} strict 是否全等判断，默认是全等
 * @return {Array}
 */
export function diff(array1, array2, strict) {
  let result = [ ]
  each(
    array2,
    function (item) {
      if (!has(array1, item, strict)) {
        result.push(item)
      }
    }
  )
  return result
}

/**
 * 合并多个数组，不去重
 *
 * @return {Array}
 */
export function merge() {
  let result = [ ]
  let push = function (item) {
    result.push(item)
  }
  each(
    arguments,
    function (array) {
      each(array, push)
    }
  )
  return result
}

/**
 * 压入一个数组
 *
 * @param {Array} original
 * @param {Array} array
 */
export function push(original, array) {
  each(
    array,
    function (item) {
      original.push(item)
    }
  )
}

/**
 * 把类数组转成数组
 *
 * @param {Array|ArrayLike} array 类数组
 * @return {Array}
 */
export function toArray(array) {
  return is.array(array) ? array : slice.call(array)
}

/**
 * 把数组转成对象
 *
 * @param {Array} array 数组
 * @param {?string} key 数组项包含的字段名称，如果数组项是基本类型，可不传
 * @return {Object}
 */
export function toObject(array, key) {
  let result = { }
  each(
    array,
    function (item) {
      result[key ? item[key] : item] = item
    }
  )
  return result
}

/**
 * 数组项在数组中的位置
 *
 * @param {Array} array 数组
 * @param {*} item 数组项
 * @param {?boolean} strict 是否全等判断，默认是全等
 * @return {number} 如果未找到，返回 -1
 */
export function indexOf(array, item, strict) {
  if (strict !== env.FALSE) {
    return array.indexOf(item)
  }
  else {
    let index = -1
    each(
      array,
      function (value, i) {
        if (item == value) {
          index = i
          return env.FALSE
        }
      }
    )
    return index
  }
}

/**
 * 数组是否包含 item
 *
 * @param {Array} array 数组
 * @param {*} item 可能包含的数组项
 * @param {?boolean} strict 是否全等判断，默认是全等
 * @return {boolean}
 */
export function has(array, item, strict) {
  return indexOf(array, item, strict) >= 0
}

/**
 * 获取数组最后一项
 *
 * @param {Array} array 数组
 * @return {*}
 */
export function last(array) {
  return array[array.length - 1]
}

/**
 * 删除数组项
 *
 * @param {Array} array 数组
 * @param {*} item 待删除项
 * @param {?boolean} strict 是否全等判断，默认是全等
 */
export function remove(array, item, strict) {
  let index = indexOf(array, item, strict)
  if (index >= 0) {
    array.splice(index, 1)
  }
}

/**
 * 用于判断长度不为 0 的数组
 *
 * @param {*} array
 * @return {boolean}
 */
export function falsy(array) {
  return !is.array(array) || array.length === 0
}
