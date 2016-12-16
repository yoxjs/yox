
import * as expression from '../expression/index'
import * as array from './array'

export const SEPARATOR_KEY = '.'
export const SEPARATOR_PATH = '/'
export const LEVEL_CURRENT = '.'
export const LEVEL_PARENT = '..'

export function normalize(str) {
  if (str.indexOf('[') > 0 && str.indexOf(']') > 0) {
    return expression.parse(str).stringify()
  }
  return str
}

export function parse(str) {
  return normalize(str).split(SEPARATOR_KEY)
}

export function stringify(keypaths) {
  return keypaths
  .filter(
    function (term) {
      return term !== '' && term !== LEVEL_CURRENT
    }
  )
  .join(SEPARATOR_KEY)
}

export function resolve(base, path) {
  let list = parse(base)
  array.each(
    path.split(SEPARATOR_PATH),
    function (term) {
      if (term === LEVEL_PARENT) {
        list.pop()
      }
      else {
        list.push(term)
      }
    }
  )
  return stringify(list)
}
