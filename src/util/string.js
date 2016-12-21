
import * as is from './is'
import * as array from './array'

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

export function parse(str, separator, pair) {
  let result = { }
  if (is.string(str)) {
    let terms, key, value
    array.each(
      str.split(separator),
      function (term) {
        terms = term.split(pair)
        key = terms[0]
        value = terms[1]
        if (key && value) {
          key = key.trim()
          value = value.trim()
          if (key) {
            result[key] = value
          }
        }
      }
    )
  }
  return result
}

// export function replace(str, pattern, replacement) {
//   pattern = pattern.replace(/[$.]/g, '\\$&')
//   return str.replace(
//     new RegExp(`(?:^|\\b)${pattern}(?:$|\\b)`, 'g'),
//     replacement
//   )
// }
//
// export function falsy(str) {
//   return !is.string(str) || str === ''
// }
