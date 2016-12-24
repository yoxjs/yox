
import Node from './Node'

import * as nodeType from '../nodeType'

import * as is from '../../util/is'
import * as array from '../../util/array'
import * as object from '../../util/object'
import * as syntax from '../../config/syntax'
import * as keypathUtil from '../../util/keypath'

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
    let { expr, index, children } = instance
    let { context, keys } = data

    let { value } = instance.renderExpression(data)

    let iterate
    if (is.array(value)) {
      iterate = array.each
    }
    else if (is.object(value)) {
      iterate = object.each
    }

    if (iterate) {
      data = object.copy(data)

      let result = [ ]
      let listContext = context.push(value)
      keys.push(expr.stringify())
      iterate(
        value,
        function (item, i) {
          if (index) {
            listContext.set(index, i)
          }
          keys.push(i)
          listContext.set(syntax.SPECIAL_KEYPATH, keypathUtil.stringify(keys))

          data.context = listContext.push(item)
          array.push(
            result,
            instance.renderChildren(data)
          )

          keys.pop()
        }
      )
      keys.pop()

      return result
    }

  }

}
