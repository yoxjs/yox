
import toString from '../function/toString'

import * as env from '../config/env'

import * as is from './is'
import * as array from './array'

export function keys(object) {
  return Object.keys(object)
}

export function each(object, callback) {
  array.each(
    keys(object),
    function (key) {
      return callback(object[key], key)
    }
  )
}

export function count(object) {
  return keys(object).length
}

export function has(object, name) {
  return object.hasOwnProperty(name)
}

export function extend() {
  let args = arguments, result = args[0]
  for (let i = 1, len = args.length; i < len; i++) {
    if (is.object(args[i])) {
      each(
        args[i],
        function (value, key) {
          result[key] = value
        }
      )
    }
  }
  return result
}

export function copy(object, deep) {
  let result = object
  if (is.array(object)) {
    result = [ ]
    array.each(
      object,
      function (item, index) {
        result[index] = deep ? copy(item) : item
      }
    )
  }
  else if (is.object(object)) {
    result = { }
    each(
      object,
      function (value, key) {
        result[key] = deep ? copy(value) : value
      }
    )
  }
  return result
}

/**
 * 返回需要区分是找不到还是值是 undefined
 */
export function get(object, keypath) {
  keypath = toString(keypath)

  // object 的 key 可能是 'a.b.c' 这样的
  // 如 data['a.b.c'] = 1 是一个合法赋值
  if (has(object, keypath)) {
    return {
      value: object[keypath],
    }
  }
  // 不能以 . 开头
  if (keypath.indexOf('.') > 0) {
    let list = keypath.split('.')
    for (let i = 0, len = list.length; i < len && object; i++) {
      if (i < len - 1) {
        object = object[list[i]]
      }
      else if (has(object, list[i])) {
        return {
          value: object[list[i]],
        }
      }
    }
  }
}

export function set(object, keypath, value, autoFill = env.TRUE) {
  keypath = toString(keypath)
  if (keypath.indexOf('.') > 0) {
    let originalObject = object
    let list = keypath.split('.')
    let prop = list.pop()
    array.each(
      list,
      function (item, index) {
        if (object[item]) {
          object = object[item]
        }
        else if (autoFill) {
          object = object[item] = {}
        }
        else {
          object = env.NULL
          return env.FALSE
        }
      }
    )
    if (object && object !== originalObject) {
      object[prop] = value
    }
  }
  else {
    object[keypath] = value
  }
}
