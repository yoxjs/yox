
import {
  EACH,
} from '../nodeType'

import Node from './Node'

import {
  isArray,
  isObject,
} from '../../util/is'

import {
  each as arrayEach,
} from '../../util/array'

import {
  each as objectEach,
} from '../../util/object'

import {
  SPECIAL_KEYPATH,
} from '../../config/syntax'

/**
 * each 节点
 *
 * {{ #each name:index }}
 *
 * @param {string} literal 字面量，如 list:index
 */
module.exports = class Each extends Node {

  constructor(name, index) {
    super()
    this.type = EACH
    this.name = name
    this.index = index
  }

  render(parent, context, keys, parseTemplate) {

    let instance = this
    let { name, index } = instance
    let data = context.get(name)

    let each
    if (isArray(data)) {
      each = arrayEach
    }
    else if (isObject(data)) {
      each = objectEach
    }

    if (each) {
      keys.push(name)
      each(
        data,
        function (item, i) {
          if (index) {
            context.set(index, i)
          }
          keys.push(i)
          context.set(SPECIAL_KEYPATH, keys.join('.'))
          instance.renderChildren(parent, context.push(item), keys, parseTemplate)
          keys.pop()
        }
      )
      keys.pop()
    }

  }

}
