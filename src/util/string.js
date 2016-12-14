
import * as is from './is'

export function camelCase(str) {
  return str.replace(
    /-([a-z])/gi,
    function ($0, $1) {
      return $1.toUpperCase()
    }
  )
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function replace(str, pattern, replacement) {
  pattern = pattern.replace(/[$.]/g, '\\$&')
  return str.replace(
    new RegExp(`(?:^|\\b)${pattern}(?:$|\\b)`, 'g'),
    replacement
  )
}

export function falsy(str) {
  return !is.string(str) || str === ''
}
