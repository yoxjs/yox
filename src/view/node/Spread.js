
import Node from './Node'
import Attribute from './Attribute'

import * as nodeType from '../nodeType'

import * as env from '../../config/env'
import * as is from '../../util/is'
import * as object from '../../util/object'
import * as keypathUtil from '../../util/keypath'

/**
 * 延展操作 节点
 *
 * @param {Expression} expr
 */
export default class Spread extends Node {

  constructor(expr) {
    super(nodeType.SPREAD, env.FALSE)
    this.expr = expr
  }

  render(data) {
    let { value } = this.renderExpression(data)
    if (is.object(value)) {
      let result = [ ], keypath = keypathUtil.stringify(data.keys)
      object.each(
        value,
        function (value, key) {
          let node = new Attribute(key, value)
          node.keypath = keypath
          result.push(node)
        }
      )
      return result
    }
  }

}
