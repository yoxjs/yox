
import Node from './Node'

import * as nodeType from '../nodeType'

import * as is from '../../util/is'
import * as array from '../../util/array'
import * as object from '../../util/object'
import * as syntax from '../../config/syntax'

/**
 * each 节点
 *
 * @param {Expression} expr
 * @param {string} index
 */
export default class Each extends Node {

  constructor(expr, index) {
    super(nodeType.EACH)
    this.expr = expr
    this.index = index
  }

  render(data) {

    let instance = this
    let { expr, index } = instance
    let { context, keys } = data

    let { value } = instance.execute(data)

    let iterate
    if (is.array(value)) {
      iterate = array.each
    }
    else if (is.object(value)) {
      iterate = object.each
    }

    if (iterate) {
      let listContext = context.push(value)
      keys.push(expr.stringify())
      iterate(
        value,
        function (item, i) {
          if (index) {
            listContext.set(index, i)
          }
          keys.push(i)
          listContext.set(syntax.SPECIAL_KEYPATH, keys.join('.'))
          instance.renderChildren(
            object.extend({ }, data, { context: listContext.push(item) })
          )
          keys.pop()
        }
      )
      keys.pop()
    }

  }

}
