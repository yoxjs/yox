
import * as env from '../config/env'

const toString = Object.prototype.toString

function is(arg, type) {
  return toString.call(arg).toLowerCase() === `[object ${type}]`
}

export function func(arg) {
  return is(arg, 'function')
}

export function array(arg) {
  return is(arg, 'array')
}

export function object(arg) {
  return is(arg, 'object')
}

export function string(arg) {
  return is(arg, 'string')
}

export function number(arg) {
  return is(arg, 'number')
}

export function boolean(arg) {
  return is(arg, 'boolean')
}

export function numeric(arg) {
  return !isNaN(parseFloat(arg)) && isFinite(arg)
}
