
/**
 * getter / setter 的判断
 * 直接把最外面传进来参数丢过来用
 */

import * as env from '../config/env'
import * as is from '../util/is'
import * as array from '../util/array'

import execute from './execute'

export default function (options) {

  let { args, get, set } = options
  args = array.toArray(args)

  let key = args[0], value = args[1]
  if (is.object(key)) {
    execute(set, env.NULL, key)
  }
  else if (is.string(key)) {
    let { length } = args
    if (length === 2) {
      execute(set, env.NULL, args)
    }
    else if (length === 1) {
      return execute(get, env.NULL, key)
    }
  }
}
