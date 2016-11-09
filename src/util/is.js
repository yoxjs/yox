
import {
  FALSE,
} from '../config/env'

const toString = Object.prototype.toString

function is(arg, type) {
  return toString.call(arg).toLowerCase() === `[object ${type}]`
}

export function isFunction (arg) {
  return typeof arg === 'function'
}

export function isArray(arg) {
  return is(arg, 'array')
}

export function isObject(arg) {
  if (!arg) {
    return FALSE
  }
  // new String() 算 object
  // 因此这里不能用 is 函数
  return typeof arg === 'object'
}

export function isString(arg) {
  return is(arg, 'string')
}

export function isNumber(arg) {
  return is(arg, 'number')
}

export function isBoolean(arg) {
  return is(arg, 'boolean')
}

export function isNumeric(arg) {
  return !isNaN(parseFloat(arg)) && isFinite(arg)
}
