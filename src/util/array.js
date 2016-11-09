
import {
  TRUE,
  FALSE,
  NULL,
} from '../config/env'

import {
  isArray,
} from './is'

let {
  slice,
} = Array.prototype

export function each(array, callback) {
  for (let i = 0, len = array.length; i < len; i++) {
    if (callback(array[i], i) === FALSE) {
      break
    }
  }
}

// array.reduce 如果是空数组，不传 initialValue 居然会报错，所以封装一下
export function reduce(array, callback, initialValue = NULL) {
  return array.reduce(callback, initialValue)
}

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

export function toArray(array) {
  try {
    'length' in array
  }
  catch (e) {
    return []
  }
  return isArray(array) ? array : slice.call(array)
}

export function toObject(array, key) {
  let result = { }
  each(
    array,
    function (item) {
      result[item[key]] = item
    }
  )
  return result
}

export function indexOf(array, item, strict = TRUE) {
  if (strict) {
    return array.indexOf(item)
  }
  else {
    let index = -1
    each(
      array,
      function (value, i) {
        if (item == value) {
          index = i
          return FALSE
        }
      }
    )
    return index
  }
}

export function hasItem(array, item, strict = TRUE) {
  return indexOf(array, item, strict) >= 0
}

export function lastItem(array) {
  return array[array.length - 1]
}

export function removeItem(array, item, strict = TRUE) {
  let index = indexOf(array, item, strict)
  if (index >= 0) {
    array.splice(index, 1)
  }
}
