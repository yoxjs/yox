
import Node from './Node'

import * as nodeType from '../nodeType'

/**
 * else if 节点
 *
 * @param {Expression} expr 判断条件
 */
module.exports = class ElseIf extends Node {

  constructor(expr) {
    super()
    this.type = nodeType.ELSE_IF
    this.expr = expr
  }

  render(data, prev) {
    if (prev) {
      if (this.execute(data.context)) {
        this.renderChildren(data)
      }
      else {
        return prev
      }
    }
  }

}
